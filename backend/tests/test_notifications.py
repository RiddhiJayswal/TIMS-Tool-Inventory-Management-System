"""
Notification integration tests — TIMS.
Covers: loading notifications, mark as read, role-scoping,
notification created on key events (requisition, approval, issue, return).

Run: cd backend && python -m pytest tests/test_notifications.py -v --tb=short
"""
import uuid
from datetime import date, timedelta

import pytest

# ── helpers ──────────────────────────────────────────────────────────────────

def get_token(client, employee_id, password):
    res = client.post("/api/auth/login", data={"username": employee_id, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def make_tool(db, quantity=3):
    from app.models.master import Tool
    code = f"NT-{uuid.uuid4().hex[:8].upper()}"
    tool = Tool(
        tool_code=code,
        name=f"Notification Test Tool {code}",
        tool_type="general",
        is_consumable=False,
        total_quantity=quantity,
        available_quantity=quantity,
    )
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return tool

def raise_req(client, token, tool_id, qty=1):
    today = date.today()
    res = client.post("/api/requisitions", json={
        "tool_id": str(tool_id),
        "quantity_requested": qty,
        "purpose_of_job": "Notification test job",
        "from_date": today.isoformat(),
        "to_date": (today + timedelta(days=2)).isoformat(),
    }, headers=auth(token))
    assert res.status_code == 201, res.text
    return res.json()

def approve_req(client, token, req_id):
    res = client.put(f"/api/requisitions/{req_id}/approve", headers=auth(token))
    assert res.status_code == 200
    return res.json()

def issue_tool(client, token, req_id):
    res = client.post("/api/issuance", json={"requisition_id": req_id}, headers=auth(token))
    assert res.status_code == 201
    return res.json()

def return_tool(client, token, issuance_id, condition="good"):
    res = client.post(f"/api/returns/{issuance_id}",
                      json={"quantity_returned": 1, "return_condition": condition},
                      headers=auth(token))
    assert res.status_code == 200
    return res.json()


# ═══════════════════════════════════════════════════════════════════════════════
# LOAD NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class TestNotificationLoad:

    def test_notifications_endpoint_returns_200(self, client):
        for creds in [("ADM001", "Admin@123"), ("STF001", "Staff@123"),
                      ("HD001", "Head@123"), ("USR001", "User@123")]:
            token = get_token(client, *creds)
            res = client.get("/api/auth/notifications", headers=auth(token))
            assert res.status_code == 200, f"Notifications failed for {creds[0]}"
            assert isinstance(res.json(), list)

    def test_notifications_have_required_fields(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/auth/notifications", headers=auth(token))
        assert res.status_code == 200
        notifications = res.json()
        if notifications:
            for field in ("id", "message", "is_read", "created_at"):
                assert field in notifications[0], f"Missing field '{field}'"

    def test_unauthenticated_notifications_rejected(self, client):
        res = client.get("/api/auth/notifications")
        assert res.status_code == 401

    def test_notifications_max_50_returned(self, client, db):
        from app.models.transaction import Notification, User
        admin = db.query(User).filter(User.employee_id == "ADM001").first()
        for i in range(60):
            db.add(Notification(user_id=admin.id, message=f"Overflow test {i}", is_read=False))
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/auth/notifications", headers=auth(token))
        assert res.status_code == 200
        assert len(res.json()) <= 50


# ═══════════════════════════════════════════════════════════════════════════════
# MARK AS READ
# ═══════════════════════════════════════════════════════════════════════════════

class TestMarkNotificationRead:

    def _create_notification(self, db, user_id, message="Test notification"):
        from app.models.transaction import Notification
        notif = Notification(user_id=user_id, message=message, is_read=False)
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    def test_mark_own_notification_read(self, client, db):
        from app.models.transaction import User
        user = db.query(User).filter(User.employee_id == "ADM001").first()
        notif = self._create_notification(db, user.id)

        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/auth/notifications/{notif.id}/read", headers=auth(token))
        assert res.status_code == 200
        assert res.json()["is_read"] is True

    def test_mark_other_user_notification_returns_404(self, client, db):
        from app.models.transaction import User
        admin = db.query(User).filter(User.employee_id == "ADM001").first()
        notif = self._create_notification(db, admin.id, "Admin private notification")

        usr_token = get_token(client, "USR001", "User@123")
        res = client.put(f"/api/auth/notifications/{notif.id}/read", headers=auth(usr_token))
        # Should be 404 — requester cannot access admin's notifications
        assert res.status_code == 404

    def test_mark_nonexistent_notification_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/auth/notifications/{uuid.uuid4()}/read", headers=auth(token))
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS FROM EVENTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestEventNotifications:

    def test_new_requisition_creates_notification_for_head(self, client, db):
        from app.models.transaction import Notification, User

        tool = make_tool(db)
        head = db.query(User).filter(User.employee_id == "HD001").first()

        before_count = db.query(Notification).filter(Notification.user_id == head.id).count()

        usr_token = get_token(client, "USR001", "User@123")
        req = raise_req(client, usr_token, tool.id)

        after_count = db.query(Notification).filter(Notification.user_id == head.id).count()
        assert after_count > before_count, "Head should receive notification on new requisition"

    def test_approval_creates_notification_for_requester(self, client, db):
        from app.models.transaction import Notification, User

        tool = make_tool(db)
        usr = db.query(User).filter(User.employee_id == "USR001").first()

        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        req = raise_req(client, usr_token, tool.id)

        before_count = db.query(Notification).filter(Notification.user_id == usr.id).count()
        approve_req(client, hd_token, req["id"])

        after_count = db.query(Notification).filter(Notification.user_id == usr.id).count()
        assert after_count > before_count, "Requester should receive notification on approval"

    def test_return_creates_notification_for_admin_and_head(self, client, db):
        from app.models.transaction import Notification, User

        tool = make_tool(db, quantity=1)
        admin = db.query(User).filter(User.employee_id == "ADM001").first()
        head = db.query(User).filter(User.employee_id == "HD001").first()

        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        before_admin = db.query(Notification).filter(Notification.user_id == admin.id).count()
        before_head = db.query(Notification).filter(Notification.user_id == head.id).count()

        return_tool(client, stf_token, issued["id"])

        after_admin = db.query(Notification).filter(Notification.user_id == admin.id).count()
        after_head = db.query(Notification).filter(Notification.user_id == head.id).count()

        assert after_admin > before_admin, "Admin should be notified on tool return"
        assert after_head > before_head, "Head should be notified on tool return"

    def test_tool_addition_notifies_maintenance_users(self, client, db):
        from app.models.transaction import Notification, User

        admin = db.query(User).filter(User.employee_id == "ADM001").first()
        before = db.query(Notification).filter(Notification.user_id == admin.id).count()

        adm_token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json={
            "tool_code": f"NT-{uuid.uuid4().hex[:8].upper()}",
            "name": "Notification Tool",
            "tool_type": "general",
            "is_consumable": False,
            "total_quantity": 1,
        }, headers=auth(adm_token))
        assert res.status_code == 201

        after = db.query(Notification).filter(Notification.user_id == admin.id).count()
        assert after > before, "Admin should be notified when a new tool is added"

    def test_notifications_are_user_scoped(self, client, db):
        from app.models.transaction import Notification, User

        # Insert a notification explicitly for ADM001 only
        admin = db.query(User).filter(User.employee_id == "ADM001").first()
        special_msg = f"ADMIN_ONLY_{uuid.uuid4().hex}"
        db.add(Notification(user_id=admin.id, message=special_msg, is_read=False))
        db.commit()

        # USR001 should NOT see this notification
        usr_token = get_token(client, "USR001", "User@123")
        usr_notifications = client.get("/api/auth/notifications", headers=auth(usr_token)).json()
        messages = [n["message"] for n in usr_notifications]
        assert special_msg not in messages, "Requester must not see admin-only notifications"
