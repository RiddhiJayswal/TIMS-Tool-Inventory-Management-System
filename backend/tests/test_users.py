"""
User management integration tests — TIMS.
Covers: list users, create user, update user, deactivate user,
access request approval/rejection, last-admin guard, duplicate prevention.

Run: cd backend && python -m pytest tests/test_users.py -v --tb=short
"""
import uuid

import pytest

# ── helpers ──────────────────────────────────────────────────────────────────

def get_token(client, employee_id, password):
    res = client.post("/api/auth/login", data={"username": employee_id, "password": password})
    assert res.status_code == 200, f"Login failed for {employee_id}: {res.text}"
    return res.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def _unique_id():
    return f"TST{uuid.uuid4().hex[:6].upper()}"

def _make_user_payload(**overrides):
    uid = _unique_id()
    base = {
        "employee_id": uid,
        "full_name": f"Test User {uid}",
        "email": f"{uid.lower()}@tims.example.com",
        "password": "Test@1234",
        "role": "requester",
        "department": "E&I",
    }
    base.update(overrides)
    return base


# ═══════════════════════════════════════════════════════════════════════════════
# LIST USERS
# ═══════════════════════════════════════════════════════════════════════════════

class TestListUsers:

    def test_admin_can_list_users(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/users", headers=auth(token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert len(res.json()) >= 5  # at least the 5 seed users

    def test_staff_cannot_list_users(self, client):
        token = get_token(client, "STF001", "Staff@123")
        res = client.get("/api/users", headers=auth(token))
        assert res.status_code == 403

    def test_head_cannot_list_users(self, client):
        token = get_token(client, "HD001", "Head@123")
        res = client.get("/api/users", headers=auth(token))
        assert res.status_code == 403

    def test_requester_cannot_list_users(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.get("/api/users", headers=auth(token))
        assert res.status_code == 403

    def test_user_list_contains_required_fields(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        users = client.get("/api/users", headers=auth(token)).json()
        for u in users[:1]:
            for field in ("id", "employee_id", "full_name", "email", "role", "department", "is_active"):
                assert field in u, f"Missing field '{field}'"


# ═══════════════════════════════════════════════════════════════════════════════
# CREATE USER (ADMIN DIRECT CREATE)
# ═══════════════════════════════════════════════════════════════════════════════

class TestCreateUser:

    def test_admin_can_create_requester(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_user_payload()
        res = client.post("/api/users", json=payload, headers=auth(token))
        assert res.status_code == 201, res.text
        data = res.json()
        assert data["employee_id"] == payload["employee_id"].upper()
        assert data["role"] == "requester"
        assert data["is_active"] is True

    def test_admin_can_create_all_roles(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        for role in ("requester", "dept_head", "maintenance_staff", "maintenance_admin"):
            payload = _make_user_payload(role=role)
            res = client.post("/api/users", json=payload, headers=auth(token))
            assert res.status_code == 201, f"Failed to create {role}: {res.text}"

    def test_invalid_role_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/users", json=_make_user_payload(role="superuser"), headers=auth(token))
        assert res.status_code == 400

    def test_duplicate_employee_id_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/users", json=_make_user_payload(employee_id="ADM001"), headers=auth(token))
        assert res.status_code == 400
        assert "employee id" in res.json()["detail"].lower() or "already exists" in res.json()["detail"].lower()

    def test_duplicate_email_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/users", json=_make_user_payload(email="admin@tims.example.com"), headers=auth(token))
        assert res.status_code == 400

    def test_non_admin_cannot_create_user(self, client):
        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/users", json=_make_user_payload(), headers=auth(stf_token))
        assert res.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE USER
# ═══════════════════════════════════════════════════════════════════════════════

class TestUpdateUser:

    def _create_user(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_user_payload()
        res = client.post("/api/users", json=payload, headers=auth(token))
        assert res.status_code == 201
        return res.json(), token

    def test_admin_can_update_user_name(self, client):
        user, token = self._create_user(client)
        res = client.put(f"/api/users/{user['id']}", json={"full_name": "Updated Name"}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["full_name"] == "Updated Name"

    def test_admin_can_change_user_role(self, client):
        user, token = self._create_user(client)
        res = client.put(f"/api/users/{user['id']}", json={"role": "maintenance_staff"}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["role"] == "maintenance_staff"

    def test_admin_can_deactivate_user(self, client):
        user, token = self._create_user(client)
        res = client.put(f"/api/users/{user['id']}", json={"is_active": False}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["is_active"] is False

    def test_deactivated_user_cannot_login(self, client):
        user, token = self._create_user(client)
        emp_id = user["employee_id"]
        # Deactivate the user
        client.put(f"/api/users/{user['id']}", json={"is_active": False}, headers=auth(token))
        # Attempt login
        res = client.post("/api/auth/login", data={"username": emp_id, "password": "Test@1234"})
        assert res.status_code in (401, 403)

    def test_admin_cannot_deactivate_own_account(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        me = client.get("/api/auth/me", headers=auth(token)).json()
        res = client.put(f"/api/users/{me['id']}", json={"is_active": False}, headers=auth(token))
        assert res.status_code == 400

    def test_last_admin_cannot_be_demoted(self, client, db):
        from app.models.transaction import User
        admins = db.query(User).filter(User.role == "maintenance_admin", User.employee_id != "ADM001").all()
        original_admin_states = [(admin, admin.role, admin.is_active) for admin in admins]
        for admin in admins:
            admin.role = "requester"
            admin.is_active = True
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        me = client.get("/api/auth/me", headers=auth(token)).json()
        try:
            res = client.put(f"/api/users/{me['id']}", json={"role": "requester"}, headers=auth(token))
            assert res.status_code == 400
            assert "administrator" in res.json()["detail"].lower()
        finally:
            for admin, role, is_active in original_admin_states:
                admin.role = role
                admin.is_active = is_active
            db.commit()

    def test_update_user_duplicate_email_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        user, _ = self._create_user(client), token
        user = client.post("/api/users", json=_make_user_payload(), headers=auth(token)).json()
        # Try to set email to one already belonging to another user
        res = client.put(f"/api/users/{user['id']}", json={"email": "admin@tims.example.com"}, headers=auth(token))
        assert res.status_code == 400

    def test_update_nonexistent_user_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/users/{uuid.uuid4()}", json={"full_name": "Ghost"}, headers=auth(token))
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════════
# TOGGLE ACTIVE
# ═══════════════════════════════════════════════════════════════════════════════

class TestToggleActive:

    def test_toggle_deactivates_user(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        create_res = client.post("/api/users", json=_make_user_payload(), headers=auth(token))
        assert create_res.status_code == 201, create_res.text
        user = create_res.json()
        res = client.put(f"/api/users/{user['id']}/toggle-active", headers=auth(token))
        assert res.status_code == 200
        assert res.json()["is_active"] is False

    def test_toggle_reactivates_user(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        create_res = client.post("/api/users", json=_make_user_payload(), headers=auth(token))
        assert create_res.status_code == 201, create_res.text
        user = create_res.json()
        client.put(f"/api/users/{user['id']}/toggle-active", headers=auth(token))
        res = client.put(f"/api/users/{user['id']}/toggle-active", headers=auth(token))
        assert res.status_code == 200
        assert res.json()["is_active"] is True

    def test_cannot_toggle_own_account(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        me = client.get("/api/auth/me", headers=auth(token)).json()
        res = client.put(f"/api/users/{me['id']}/toggle-active", headers=auth(token))
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════════════════════
# ACCESS REQUESTS — LIST AND REJECT
# ═══════════════════════════════════════════════════════════════════════════════

class TestAccessRequests:

    def _make_pending_request(self, db):
        from app.auth.roles import hash_password
        from app.models.transaction import AccessRequest
        req_id = f"AR-TEST-{uuid.uuid4().hex[:6].upper()}"
        req = AccessRequest(
            request_id=req_id,
            full_name="Test Access Requester",
            email=f"ar{uuid.uuid4().hex[:6]}@tims.test",
            employee_id=f"AR{uuid.uuid4().hex[:5].upper()}",
            department="E&I",
            requested_role="requester",
            reason="Need tool access",
            hashed_password=hash_password("Acc@1234"),
            status="pending",
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    def test_admin_can_list_access_requests(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/users/access-requests", headers=auth(token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_non_admin_cannot_list_access_requests(self, client):
        token = get_token(client, "STF001", "Staff@123")
        res = client.get("/api/users/access-requests", headers=auth(token))
        assert res.status_code == 403

    def test_admin_can_reject_access_request(self, client, db):
        req = self._make_pending_request(db)
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(
            f"/api/users/access-requests/{req.request_id}/reject",
            json={"reason": "Invalid department"},
            headers=auth(token),
        )
        assert res.status_code == 200
        assert res.json()["status"] == "rejected"
        assert res.json()["rejection_reason"] == "Invalid department"

    def test_reject_without_reason_returns_400(self, client, db):
        req = self._make_pending_request(db)
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(
            f"/api/users/access-requests/{req.request_id}/reject",
            json={"reason": ""},
            headers=auth(token),
        )
        assert res.status_code == 400

    def test_cannot_reject_already_approved_request(self, client, db):
        req = self._make_pending_request(db)
        token = get_token(client, "ADM001", "Admin@123")
        # Approve first
        client.put(f"/api/users/access-requests/{req.request_id}/approve", headers=auth(token))
        # Now try to reject
        res = client.put(
            f"/api/users/access-requests/{req.request_id}/reject",
            json={"reason": "Late change of mind"},
            headers=auth(token),
        )
        assert res.status_code == 400

    def test_approve_creates_active_user(self, client, db):
        req = self._make_pending_request(db)
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/users/access-requests/{req.request_id}/approve", headers=auth(token))
        assert res.status_code == 200
        assert res.json()["user"]["role"] == "requester"
        assert res.json()["user"]["is_active"] is True

    def test_approve_duplicate_blocked(self, client, db):
        from app.models.transaction import User
        # req whose employee_id matches an existing user
        from app.auth.roles import hash_password
        from app.models.transaction import AccessRequest
        existing = db.query(User).filter(User.employee_id == "USR001").first()
        req = AccessRequest(
            request_id=f"AR-DUP-{uuid.uuid4().hex[:6].upper()}",
            full_name="Duplicate Attempt",
            email=existing.email,
            employee_id=existing.employee_id,
            department="E&I",
            requested_role="requester",
            reason="Dup test",
            hashed_password=hash_password("Dup@1234"),
            status="pending",
        )
        db.add(req)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/users/access-requests/{req.request_id}/approve", headers=auth(token))
        assert res.status_code == 400

    def test_reject_nonexistent_request_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(
            f"/api/users/access-requests/AR-NOTEXIST/reject",
            json={"reason": "No such request"},
            headers=auth(token),
        )
        assert res.status_code == 404
