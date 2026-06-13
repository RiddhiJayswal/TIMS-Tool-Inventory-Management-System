"""
Notification service — writes records to the notifications table.
In v1 this is in-app only (stored in DB, displayed in frontend).
Email integration is a v2 feature — stub functions included.
"""

from sqlalchemy.orm import Session
from app.models.transaction import Notification, User
import uuid


def notify_user(db: Session, user_id: str, message: str) -> Notification:
    """
    Creates a notification record for a specific user.
    """
    notification = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        message=message,
        is_read=False
    )
    db.add(notification)
    db.flush()
    return notification


def notify_requisition_raised(db: Session, dept_head: User, requisition_number: str, tool_name: str, requester_name: str):
    notify_user(db, str(dept_head.id),
        f"New tool request {requisition_number}: {requester_name} has requested '{tool_name}'. Awaiting your approval.")


def notify_requisition_approved(db: Session, requester: User, requisition_number: str, tool_name: str):
    notify_user(db, str(requester.id),
        f"Request {requisition_number} approved: Your request for '{tool_name}' has been approved. Maintenance will issue the tool.")


def notify_requisition_rejected(db: Session, requester: User, requisition_number: str, tool_name: str, reason: str):
    notify_user(db, str(requester.id),
        f"Request {requisition_number} rejected: Your request for '{tool_name}' was rejected. Reason: {reason}")


def notify_tool_issued(db: Session, requester: User, tool_name: str, expected_return_date):
    notify_user(db, str(requester.id),
        f"Tool issued: '{tool_name}' has been issued to you. Please return by {expected_return_date}.")


def notify_overdue(db: Session, requester: User, dept_head: User, tool_name: str, days_overdue: int):
    msg = f"OVERDUE: '{tool_name}' was due {days_overdue} day(s) ago. Please return immediately."
    notify_user(db, str(requester.id), msg)
    if dept_head:
        notify_user(db, str(dept_head.id),
            f"OVERDUE ALERT: {requester.full_name}'s borrowed '{tool_name}' is {days_overdue} day(s) overdue.")


def notify_calibration_due(db: Session, admin_users: list, tool_name: str, due_date, days_remaining: int):
    for admin in admin_users:
        notify_user(db, str(admin.id),
            f"CALIBRATION DUE: '{tool_name}' is due for calibration in {days_remaining} day(s) (due: {due_date}).")


# v2 email stubs — wire SMTP here when needed
def send_email_notification(to_email: str, subject: str, body: str):
    pass


def send_overdue_email(to_email: str, tool_name: str, days_overdue: int):
    pass


def send_calibration_email(to_email: str, tool_name: str, due_date):
    pass
