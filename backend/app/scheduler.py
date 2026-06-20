"""
Background scheduler — runs two daily jobs at 08:00.
Integrated with FastAPI lifespan events (not deprecated @app.on_event).

Job 1 — Calibration check:
  - Tools with requires_calibration=True and next_calibration_due <= today → set status="calibration_due"
  - Tools with next_calibration_due between tomorrow and +7 days → notify all maintenance_admin users

Job 2 — Overdue return check:
  - IssuanceLogs where actual_return_date IS NULL and expected_return_date < today
  - Notify the borrower and their dept_head
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.master import Tool
from app.models.transaction import IssuanceLog, User
from app.services.notifications import notify_calibration_due, notify_overdue


scheduler = AsyncIOScheduler()


def run_calibration_check():
    db: Session = SessionLocal()
    try:
        today = date.today()
        warn_threshold = today + timedelta(days=7)

        tools = db.query(Tool).filter(
            Tool.requires_calibration == True,
            Tool.status.in_(("active", "calibration_due")),
        ).all()
        admin_users = db.query(User).filter(
            User.role == "maintenance_admin",
            User.is_active == True
        ).all()

        for tool in tools:
            # Terminal/inventory workflow states must never be replaced by a
            # derived calibration status, even if a stale query returns them.
            if tool.status not in ("active", "calibration_due"):
                continue
            if not tool.next_calibration_due:
                continue
            if tool.next_calibration_due <= today:
                tool.status = "calibration_due"
            elif tool.next_calibration_due <= warn_threshold:
                days_remaining = (tool.next_calibration_due - today).days
                notify_calibration_due(db, admin_users, tool.name, tool.next_calibration_due, days_remaining)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Scheduler] Calibration check error: {e}")
    finally:
        db.close()


def run_overdue_check():
    db: Session = SessionLocal()
    try:
        today = date.today()
        overdue_logs = db.query(IssuanceLog).filter(
            IssuanceLog.actual_return_date == None,
            IssuanceLog.expected_return_date < today
        ).all()

        for log in overdue_logs:
            days_overdue = (today - log.expected_return_date).days
            # FR-10.4: Notify on day 1 (first day overdue) and every 3 days after (day 4, 7, 10...)
            if (days_overdue - 1) % 3 != 0:
                continue

            requester = db.query(User).filter(User.id == log.issued_to).first()
            dept_head = db.query(User).filter(
                User.department == requester.department,
                User.role == "dept_head",
                User.is_active == True
            ).first() if requester else None

            tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
            if requester and tool:
                notify_overdue(db, requester, dept_head, tool.name, days_overdue)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Scheduler] Overdue check error: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(run_calibration_check, CronTrigger(hour=8, minute=0), id="calibration_check", replace_existing=True)
    scheduler.add_job(run_overdue_check, CronTrigger(hour=8, minute=0), id="overdue_check", replace_existing=True)
    scheduler.start()
    print("[Scheduler] Started — calibration and overdue jobs scheduled at 08:00 daily")


def stop_scheduler():
    scheduler.shutdown()
