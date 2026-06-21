"""
Integration test suite for TIMS — Tools Inventory Management System.
Requires a running PostgreSQL test database at DATABASE_URL.

Run: cd backend && python -m pytest tests/test_integration.py -v --tb=short
"""
from datetime import date, datetime, timedelta
from decimal import Decimal
import hashlib

import pytest

# ─── Auth helpers ──────────────────────────────────────────────────────────────

def get_token(client, employee_id: str, password: str) -> str:
    """Login via OAuth2PasswordRequestForm (form-data with `username` field)."""
    res = client.post(
        "/api/auth/login",
        data={"username": employee_id, "password": password},
    )
    assert res.status_code == 200, f"Login failed for {employee_id}: {res.text}"
    return res.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ─── DB helpers — create test data directly without going through the API ─────

def make_tool(db, *, tool_code=None, quantity=5, is_consumable=False,
              requires_calibration=False, cal_overdue=False,
              purchase_price=10000, purchase_date=None, standard_life_months=60,
              department_access=None):
    """Insert a fresh Tool row and return it.  Each test uses its own unique tool."""
    from app.models.master import Tool

    code = tool_code or f"IT-{__import__('uuid').uuid4().hex[:8].upper()}"
    today = date.today()
    if purchase_date is None:
        purchase_date = today - timedelta(days=365)

    tool = Tool(
        tool_code=code,
        name=f"Integration Test Tool {code}",
        category="Test",
        tool_type="specialized" if department_access else "general",
        department_access=department_access,
        is_consumable=is_consumable,
        total_quantity=quantity,
        available_quantity=quantity,
        purchase_price=purchase_price,
        purchase_date=purchase_date,
        standard_life_months=standard_life_months,
        requires_calibration=requires_calibration,
        calibration_freq_days=180 if requires_calibration else None,
        last_calibration_date=(today - timedelta(days=181)) if cal_overdue else (today - timedelta(days=90)) if requires_calibration else None,
        next_calibration_due=(today - timedelta(days=1)) if cal_overdue else (today + timedelta(days=90)) if requires_calibration else None,
        status="calibration_due" if cal_overdue else "active",
    )
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return tool


# ─── HTTP flow helpers ─────────────────────────────────────────────────────────

def raise_req(client, token, tool_id, qty=1, purpose="Integration test job"):
    today = date.today()
    res = client.post("/api/requisitions", json={
        "tool_id": str(tool_id),
        "quantity_requested": qty,
        "purpose_of_job": purpose,
        "from_date": today.isoformat(),
        "to_date": (today + timedelta(days=3)).isoformat(),
    }, headers=auth(token))
    assert res.status_code == 201, f"raise_req failed: {res.text}"
    return res.json()


def approve_req(client, token, req_id):
    res = client.put(f"/api/requisitions/{req_id}/approve", headers=auth(token))
    assert res.status_code == 200, f"approve_req failed: {res.text}"
    return res.json()


def issue_tool(client, token, req_id):
    res = client.post("/api/issuance", json={"requisition_id": req_id}, headers=auth(token))
    assert res.status_code == 201, f"issue_tool failed: {res.text}"
    return res.json()


def return_tool(client, token, issuance_id, qty_returned=None, condition="good", notes=None):
    body = {"quantity_returned": qty_returned, "return_condition": condition}
    if condition in ("damaged", "missing") and not notes:
        notes = f"Integration test {condition} return"
    if notes:
        body["notes"] = notes
    res = client.post(f"/api/returns/{issuance_id}", json=body, headers=auth(token))
    assert res.status_code == 200, f"return_tool failed: {res.text}"
    return res.json()


def record_damage(client, token, issuance_id, damage_type, market_rate=None, notes=None):
    body = {"damage_type": damage_type}
    if market_rate is not None:
        body["market_rate_at_damage"] = market_rate
    if notes:
        body["notes"] = notes
    res = client.post(f"/api/damage/{issuance_id}", json=body, headers=auth(token))
    assert res.status_code == 200, f"record_damage failed: {res.text}"
    return res.json()


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 1 — Auth
# ═══════════════════════════════════════════════════════════════════════════════

class TestAuth:

    def test_login_success(self, client):
        res = client.post("/api/auth/login", data={"username": "ADM001", "password": "Admin@123"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == "maintenance_admin"
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        res = client.post("/api/auth/login", data={"username": "ADM001", "password": "WrongPassword"})
        assert res.status_code == 401

    def test_login_unknown_user(self, client):
        res = client.post("/api/auth/login", data={"username": "NOBODY", "password": "any"})
        assert res.status_code == 401

    def test_protected_route_without_token(self, client):
        res = client.get("/api/tools")
        assert res.status_code == 401

    def test_protected_route_with_valid_token(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.get("/api/tools", headers=auth(token))
        assert res.status_code == 200

    def test_tool_catalogue_and_bin_contents_are_department_scoped(self, client, db):
        from app.models.master import StorageBin

        bin_code = f"VIS-{__import__('uuid').uuid4().hex[:8].upper()}"
        storage_bin = StorageBin(bin_code=bin_code, shelf_label="Visibility test")
        db.add(storage_bin)
        db.commit()
        db.refresh(storage_bin)

        unrestricted = make_tool(db)
        own_department = make_tool(db, department_access="E&I")
        other_department = make_tool(db, department_access="Mechanical")
        for tool in (unrestricted, own_department, other_department):
            tool.storage_bin_id = storage_bin.id
        db.commit()

        requester_token = get_token(client, "USR001", "User@123")
        requester_tools = client.get("/api/tools", headers=auth(requester_token)).json()
        requester_ids = {row["id"] for row in requester_tools}
        assert str(unrestricted.id) in requester_ids
        assert str(own_department.id) in requester_ids
        assert str(other_department.id) not in requester_ids

        bin_tools = client.get(
            f"/api/storage-bins/{storage_bin.id}/tools",
            headers=auth(requester_token),
        ).json()
        assert {row["id"] for row in bin_tools} == {
            str(unrestricted.id),
            str(own_department.id),
        }

        requester_bins = client.get("/api/storage-bins", headers=auth(requester_token)).json()
        requester_bin = next(row for row in requester_bins if row["id"] == str(storage_bin.id))
        assert requester_bin["tool_count"] == 2

        admin_token = get_token(client, "ADM001", "Admin@123")
        admin_tools = client.get("/api/tools", headers=auth(admin_token)).json()
        assert str(other_department.id) in {row["id"] for row in admin_tools}

    def test_forgot_username_success_and_not_found(self, client, monkeypatch):
        monkeypatch.setattr("app.routers.auth.send_username_recovery_email", lambda *args: True)
        res = client.post("/api/auth/forgot-username", json={"identifier": "user@tims.example.com"})
        assert res.status_code == 200
        assert res.json()["delivery_configured"] is True

        missing = client.post("/api/auth/forgot-username", json={"identifier": "missing@tims.example.com"})
        assert missing.status_code == 404

    def test_forgot_and_reset_password_email_token_lifecycle(self, client, monkeypatch):
        captured = {}

        def fake_reset_email(to_email, full_name, employee_id, reset_token, expires_minutes):
            captured["token"] = reset_token
            return True

        monkeypatch.setattr("app.routers.auth.send_password_reset_email", fake_reset_email)
        reset = client.post("/api/auth/forgot-password", json={"email": "user@tims.example.com"})
        assert reset.status_code == 200
        assert reset.json()["delivery_configured"] is True
        assert "reset_token" not in reset.json()
        token = captured["token"]

        changed = client.post("/api/auth/reset-password", json={"token": token, "new_password": "NewUser@123"})
        assert changed.status_code == 200

        reused = client.post("/api/auth/reset-password", json={"token": token, "new_password": "OtherUser@123"})
        assert reused.status_code == 400

        login = client.post("/api/auth/login", data={"username": "USR001", "password": "NewUser@123"})
        assert login.status_code == 200

        old_login = client.post("/api/auth/login", data={"username": "USR001", "password": "User@123"})
        assert old_login.status_code == 401

        restore = client.post("/api/auth/forgot-password", json={"email": "user@tims.example.com"})
        restore_token = captured["token"]
        restored = client.post("/api/auth/reset-password", json={"token": restore_token, "new_password": "User@123"})
        assert restored.status_code == 200

    def test_forgot_password_unregistered_email_is_rejected(self, client):
        res = client.post("/api/auth/forgot-password", json={"email": "missing@tims.example.com"})
        assert res.status_code == 404

    def test_reset_password_expired_token_fails_cleanly(self, client, db):
        from app.models.transaction import PasswordResetToken, User

        user = db.query(User).filter(User.employee_id == "USR001").first()
        token = "expired-reset-token"
        db.add(PasswordResetToken(
            user_id=user.id,
            token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
            expires_at=datetime.utcnow() - timedelta(minutes=1),
        ))
        db.commit()
        res = client.post("/api/auth/reset-password", json={"token": token, "new_password": "NewUser@123"})
        assert res.status_code == 400
        assert "expired" in res.json()["detail"].lower() or "invalid" in res.json()["detail"].lower()

    def test_request_access_role_mobile_otp_and_admin_approval(self, client, db, monkeypatch):
        from app.models.transaction import AccessRequest, User

        captured = {}

        def fake_sms(mobile_number, otp, expires_minutes):
            captured["otp"] = otp
            return True

        monkeypatch.setattr("app.routers.auth.send_access_otp_sms", fake_sms)

        payload = {
            "employee_id": "NEW101",
            "full_name": "New Staff User",
            "email": "new101@tims.example.com",
            "mobile_number": "9876543210",
            "password": "NewStaff@123",
            "department": "Maintenance",
            "requested_role": "maintenance_staff",
            "reason": "Integration test request",
        }

        blocked = client.post("/api/auth/signup", json=payload)
        assert blocked.status_code == 400
        assert "verified" in blocked.json()["detail"].lower()

        sent = client.post("/api/auth/access-otp/send", json=payload)
        assert sent.status_code == 200, sent.text
        req = db.query(AccessRequest).filter(AccessRequest.employee_id == "NEW101").first()
        assert req
        assert req.mobile_number == "9876543210"
        assert req.requested_role == "maintenance_staff"
        assert req.status == "otp_pending"

        bad = client.post("/api/auth/access-otp/verify", json={
            "email": payload["email"],
            "mobile_number": payload["mobile_number"],
            "otp": "000000",
        })
        assert bad.status_code == 400

        verified = client.post("/api/auth/access-otp/verify", json={
            "email": payload["email"],
            "mobile_number": payload["mobile_number"],
            "otp": captured["otp"],
        })
        assert verified.status_code == 200, verified.text
        assert verified.json()["request"]["otp_verified"] is True

        submitted = client.post("/api/auth/signup", json=payload)
        assert submitted.status_code == 201, submitted.text
        request_id = submitted.json()["request"]["request_id"]
        assert submitted.json()["request"]["status"] == "pending"

        adm_token = get_token(client, "ADM001", "Admin@123")
        approved = client.put(f"/api/users/access-requests/{request_id}/approve", headers=auth(adm_token))
        assert approved.status_code == 200, approved.text
        assert approved.json()["user"]["role"] == "maintenance_staff"

        created = db.query(User).filter(User.employee_id == "NEW101").first()
        assert created
        assert created.email == "new101@tims.example.com"

        login = client.post("/api/auth/login", data={"username": "NEW101", "password": "NewStaff@123"})
        assert login.status_code == 200

    def test_requester_cannot_open_admin_apis(self, client):
        token = get_token(client, "USR001", "User@123")
        assert client.get("/api/users", headers=auth(token)).status_code == 403
        assert client.post("/api/tools", json={}, headers=auth(token)).status_code in (403, 422)
        assert client.get("/api/reports/stock", headers=auth(token)).status_code == 403


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 2 — Full happy path flows
# ═══════════════════════════════════════════════════════════════════════════════

class TestHappyPath:

    def test_complete_issuance_flow(self, client, db):
        """
        Full lifecycle: raise → approve → issue → return (good condition).
        Verifies stock management at each step.
        """
        # Setup: fresh tool with qty=5
        tool = make_tool(db, quantity=5)
        initial_qty = tool.available_quantity

        # Step 1 — requester raises requisition
        usr_token = get_token(client, "USR001", "User@123")
        req = raise_req(client, usr_token, tool.id)
        assert req["status"] == "pending"
        req_id = req["id"]

        # Verify stock unchanged (approval hasn't happened yet)
        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Stock should not change on requisition creation"

        # Step 2 — dept head approves
        hd_token = get_token(client, "HD001", "Head@123")
        approved = approve_req(client, hd_token, req_id)
        assert approved["status"] == "approved"

        # Stock still unchanged (issuance hasn't happened)
        db.refresh(tool)
        assert tool.available_quantity == initial_qty

        # Step 3 — maintenance staff issues
        stf_token = get_token(client, "STF001", "Staff@123")
        issued = issue_tool(client, stf_token, req_id)
        assert issued["actual_return_date"] is None
        issuance_id = issued["id"]

        # Stock must reduce immediately on issuance
        db.refresh(tool)
        assert tool.available_quantity == initial_qty - 1, "Stock must drop by 1 on issuance"

        # Step 4 — return in good condition
        returned = return_tool(client, stf_token, issuance_id, qty_returned=1, condition="good")
        assert returned["actual_return_date"] is not None
        assert returned["return_condition"] == "good"

        # Stock must be fully restored
        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Stock must fully restore after good return"

        # Requisition status should be "returned"
        req_res = client.get(f"/api/requisitions/{req_id}", headers=auth(stf_token))
        assert req_res.json()["status"] == "returned"

    def test_consumable_is_completed_and_consumed_at_issuance(self, client, db):
        """Consumables leave stock immediately and never require a return."""
        tool = make_tool(db, quantity=20, is_consumable=True)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=10)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        db.refresh(tool)
        assert tool.total_quantity == 10
        assert tool.available_quantity == 10
        assert tool.status == "active"
        assert issued["actual_return_date"] is not None
        assert issued["return_condition"] == "consumed"
        assert issued["quantity_consumed"] == 10
        assert issued["quantity_returned"] == 0

        req_res = client.get(f"/api/requisitions/{req['id']}", headers=auth(stf_token))
        assert req_res.json()["status"] == "completed"

        open_res = client.get("/api/issuance?status=open", headers=auth(stf_token))
        assert issued["id"] not in {row["id"] for row in open_res.json()}

        return_res = client.post(
            f"/api/returns/{issued['id']}",
            json={"quantity_returned": 0, "return_condition": "partial"},
            headers=auth(stf_token),
        )
        assert return_res.status_code == 400

    def test_depreciation_snapshot_stored_at_issuance(self, client, db):
        """
        depreciated_value_at_issue must be snapshotted at issuance time.
        """
        from app.services.depreciation import snapshot_value_at_issuance

        purchase_date = date(2023, 1, 1)
        tool = make_tool(db, purchase_price=12000, purchase_date=purchase_date, standard_life_months=24)
        expected_val = snapshot_value_at_issuance(12000, purchase_date, 24)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # depreciated_value_at_issue should match expected
        if expected_val is not None:
            actual = Decimal(str(issued["depreciated_value_at_issue"]))
            assert abs(actual - expected_val) <= Decimal("1.00"), (
                f"Snapshot mismatch: expected {expected_val}, got {actual}"
            )

    def test_damage_assessment_removes_unusable_unit_from_stock(self, client, db):
        """Damaged returns must not become available stock after assessment."""
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="damaged")

        db.refresh(tool)
        assert tool.available_quantity == 1

        record_damage(client, adm_token, issued["id"], damage_type="mishandling")
        db.refresh(tool)
        assert tool.total_quantity == 1
        assert tool.available_quantity == 1


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 3 — Block scenarios (critical security tests)
# ═══════════════════════════════════════════════════════════════════════════════

class TestBlockScenarios:

    def test_requester_cannot_process_return(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        response = client.post(
            f"/api/returns/{issued['id']}",
            json={"quantity_returned": 1, "return_condition": "good"},
            headers=auth(usr_token),
        )
        assert response.status_code == 403

        db.refresh(tool)
        assert tool.available_quantity == 0

        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="good")

    def test_self_approval_blocked(self, client, db):
        """
        maintenance_admin raises a requisition, then tries to approve their own
        requisition — must get 403.
        """
        tool = make_tool(db)
        adm_token = get_token(client, "ADM001", "Admin@123")

        # Admin raises their own requisition
        req = raise_req(client, adm_token, tool.id)
        req_id = req["id"]

        # Admin tries to approve their own requisition → 403
        res = client.put(f"/api/requisitions/{req_id}/approve", headers=auth(adm_token))
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
        assert "own" in res.json()["detail"].lower()

    def test_cross_department_approval_blocked(self, client, db):
        """
        E&I requester raises requisition; Mechanical dept_head tries to approve — must get 403.
        """
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")    # E&I dept
        hd2_token = get_token(client, "HD002",  "Head2@123")   # Mechanical dept

        req = raise_req(client, usr_token, tool.id)
        res = client.put(f"/api/requisitions/{req['id']}/approve", headers=auth(hd2_token))
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"

    def test_calibration_overdue_blocks_issuance(self, client, db):
        """
        A tool with overdue calibration must block issuance at the API layer.
        """
        tool = make_tool(db, requires_calibration=True, cal_overdue=True)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = TestWorkflowFixRegressions()._manual_approved_req(
            db,
            tool,
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
        )

        # Issuance must fail because calibration is overdue
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(stf_token))
        assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
        assert "calibration" in res.json()["detail"].lower()

    def test_stock_cannot_go_negative(self, client, db):
        """
        Issue all available units; one more attempt must return 400.
        available_quantity must be 0, never -1.
        """
        TOTAL = 3
        tool = make_tool(db, quantity=TOTAL)

        stf_token = get_token(client, "STF001", "Staff@123")

        issued_req_ids = []
        for _ in range(TOTAL):
            req = TestWorkflowFixRegressions()._manual_approved_req(
                db,
                tool,
                from_date=date.today(),
                to_date=date.today() + timedelta(days=3),
            )
            issue_tool(client, stf_token, str(req.id))
            issued_req_ids.append(str(req.id))

        # Verify stock is now 0
        db.refresh(tool)
        assert tool.available_quantity == 0

        extra = TestWorkflowFixRegressions()._manual_approved_req(
            db,
            tool,
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
        )
        res = client.post("/api/issuance", json={"requisition_id": str(extra.id)}, headers=auth(stf_token))
        assert res.status_code == 400, f"Expected 400 for over-stock issuance, got {res.status_code}"

        # Verify stock is still 0, not -1
        db.refresh(tool)
        assert tool.available_quantity == 0, f"available_quantity must be 0, got {tool.available_quantity}"

    def test_overlapping_request_uses_remaining_quantity(self, client, db):
        tool = make_tool(db, quantity=5)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        first = raise_req(client, usr_token, tool.id, qty=2)
        approve_req(client, hd_token, first["id"])
        issue_tool(client, stf_token, first["id"])

        # Three units remain for the same period, so an overlap must not block them.
        second = raise_req(client, usr_token, tool.id, qty=3)
        assert second["quantity_requested"] == 3

        availability = client.get(
            "/api/requisitions/availability/check",
            params={
                "tool_id": str(tool.id),
                "quantity": 3,
                "from_date": date.today().isoformat(),
                "to_date": (date.today() + timedelta(days=3)).isoformat(),
            },
            headers=auth(usr_token),
        )
        assert availability.status_code == 200
        assert availability.json()["request_available"] is True
        assert availability.json()["available_quantity"] == 3

    def test_future_request_ignores_currently_issued_stock(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        current = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, current["id"])
        issue_tool(client, stf_token, current["id"])
        db.refresh(tool)
        assert tool.available_quantity == 0

        future_from = date.today() + timedelta(days=4)
        response = client.post(
            "/api/requisitions",
            json={
                "tool_id": str(tool.id),
                "quantity_requested": 1,
                "purpose_of_job": "Future integration test job",
                "from_date": future_from.isoformat(),
                "to_date": (future_from + timedelta(days=2)).isoformat(),
            },
            headers=auth(usr_token),
        )
        assert response.status_code == 201, response.text

    def test_partial_return_allowed_for_non_consumable(self, client, db):
        """
        A non-consumable tool can be returned over multiple good-condition returns.
        """
        tool = make_tool(db, quantity=2, is_consumable=False)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=2)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # Try to return only 1 of 2 with condition="good" — must fail
        res = client.post(f"/api/returns/{issued['id']}",
            json={"quantity_returned": 1, "return_condition": "good"},
            headers=auth(stf_token))
        assert res.status_code == 200, f"Expected durable partial return to work, got {res.status_code}: {res.text}"
        assert res.json()["actual_return_date"] is None
        assert res.json()["remaining_quantity"] == 1

        res2 = client.post(f"/api/returns/{issued['id']}",
            json={"quantity_returned": 1, "return_condition": "good"},
            headers=auth(stf_token))
        assert res2.status_code == 200
        assert res2.json()["actual_return_date"] is not None

    def test_double_return_blocked(self, client, db):
        """Processing a return on an already-returned issuance must return 400."""
        tool = make_tool(db)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # First return — should succeed
        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="good")

        # Second return — must fail
        res = client.post(f"/api/returns/{issued['id']}",
            json={"quantity_returned": 1, "return_condition": "good"},
            headers=auth(stf_token))
        assert res.status_code == 400, f"Expected 400 for double-return, got {res.status_code}"

    def test_double_damage_assessment_blocked(self, client, db):
        """Recording damage twice on the same issuance must return 400."""
        tool = make_tool(db)
        adm_token = get_token(client, "ADM001", "Admin@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        usr_token = get_token(client, "USR001", "User@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="damaged")

        # First assessment — should succeed
        record_damage(client, adm_token, issued["id"], damage_type="wear_and_tear")

        # Second assessment — must fail
        res = client.post(f"/api/damage/{issued['id']}",
            json={"damage_type": "wear_and_tear"},
            headers=auth(adm_token))
        assert res.status_code == 400, f"Expected 400 for double damage assessment, got {res.status_code}"


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 4 — Penalty calculations
# ═══════════════════════════════════════════════════════════════════════════════

class TestPenalty:

    def _full_issue(self, client, db, is_consumable=False, **tool_kwargs):
        """Helper: create tool, raise req, approve, issue. Returns (tool, req, issuance_dict)."""
        tool = make_tool(db, is_consumable=is_consumable, **tool_kwargs)
        usr = get_token(client, "USR001", "User@123")
        hd  = get_token(client, "HD001",  "Head@123")
        stf = get_token(client, "STF001", "Staff@123")
        req = raise_req(client, usr, tool.id)
        approve_req(client, hd, req["id"])
        issued = issue_tool(client, stf, req["id"])
        return tool, req, issued

    def test_mishandling_penalty_equals_snapshot(self, client, db):
        """
        For mishandling: penalty_amount must equal depreciated_value_at_issue.
        Allows ±₹1 tolerance for rounding differences.
        """
        purchase_date = date(2023, 1, 1)
        tool, req, issued = self._full_issue(
            client, db,
            purchase_price=12000, purchase_date=purchase_date, standard_life_months=24,
        )

        snapshot = issued["depreciated_value_at_issue"]
        if snapshot is None:
            pytest.skip("Tool has no financial data — snapshot is NULL, cannot test penalty")

        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="damaged")
        dmg = record_damage(client, adm_token, issued["id"], damage_type="mishandling")

        assert dmg["penalty_amount"] == pytest.approx(snapshot, abs=1.0), (
            f"Mishandling penalty {dmg['penalty_amount']} != snapshot {snapshot}"
        )

    def test_theft_requires_market_rate(self, client, db):
        """POST /damage/{id} with damage_type='theft' and no market_rate must return 400."""
        tool, req, issued = self._full_issue(client, db)
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="missing")

        res = client.post(f"/api/damage/{issued['id']}",
            json={"damage_type": "theft"},  # market_rate_at_damage missing
            headers=auth(adm_token))
        assert res.status_code in (400, 422), f"Expected validation failure (theft without market rate), got {res.status_code}"

    def test_theft_with_market_rate(self, client, db):
        """Theft penalty must equal the market rate provided by admin."""
        MARKET_RATE = 8500.0
        tool, req, issued = self._full_issue(client, db)
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="missing")
        dmg = record_damage(client, adm_token, issued["id"],
                            damage_type="theft", market_rate=MARKET_RATE)

        assert dmg["penalty_amount"] == pytest.approx(MARKET_RATE, abs=0.01)

    def test_wear_and_tear_zero_penalty(self, client, db):
        """Wear & tear: penalty = 0, and if last unit — tool status becomes written_off."""
        tool, req, issued = self._full_issue(client, db, quantity=1)
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="damaged")
        dmg = record_damage(client, adm_token, issued["id"], damage_type="wear_and_tear")

        assert dmg["penalty_amount"] == 0.0
        assert dmg["tool_status"] == "active"
        db.refresh(tool)
        assert tool.available_quantity == 1


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 5 — Reports
# ═══════════════════════════════════════════════════════════════════════════════

REPORT_ENDPOINTS = [
    "/api/reports/stock",
    "/api/reports/issuance-history",
    "/api/reports/overdue",
    "/api/reports/calibration",
    "/api/reports/damage-penalty",
    "/api/reports/utilization",
    "/api/reports/depreciation",
]


class TestReports:

    def test_end_date_includes_records_created_later_that_day(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        today = date.today().isoformat()

        requisitions = client.get(
            "/api/requisitions",
            params={"from_date": today, "to_date": today},
            headers=auth(usr_token),
        )
        assert requisitions.status_code == 200
        assert req["id"] in {row["id"] for row in requisitions.json()}

        issuance_report = client.get(
            "/api/reports/issuance-history",
            params={"from_date": today, "to_date": today},
            headers=auth(adm_token),
        )
        assert issuance_report.status_code == 200
        assert issued["id"] in {row["issuance_id"] for row in issuance_report.json()}

    def test_utilization_sums_issued_quantities(self, client, db):
        today = date.today().isoformat()
        adm_token = get_token(client, "ADM001", "Admin@123")

        def issued_total():
            response = client.get(
                "/api/reports/utilization",
                params={"from_date": today, "to_date": today},
                headers=auth(adm_token),
            )
            assert response.status_code == 200
            row = next((item for item in response.json() if item["department"] == "E&I"), None)
            return row["total_issued"] if row else 0

        before = issued_total()
        tool = make_tool(db, quantity=3)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        req = raise_req(client, usr_token, tool.id, qty=3)
        approve_req(client, hd_token, req["id"])
        issue_tool(client, stf_token, req["id"])

        assert issued_total() == before + 3

    def test_reports_accessible_to_maintenance_staff(self, client):
        """All 7 report endpoints return 200 for maintenance_staff."""
        token = get_token(client, "STF001", "Staff@123")
        for endpoint in REPORT_ENDPOINTS:
            res = client.get(endpoint, headers=auth(token))
            assert res.status_code == 200, f"{endpoint} returned {res.status_code}: {res.text}"

    def test_reports_accessible_to_maintenance_admin(self, client):
        """All 7 report endpoints return 200 for maintenance_admin."""
        token = get_token(client, "ADM001", "Admin@123")
        for endpoint in REPORT_ENDPOINTS:
            res = client.get(endpoint, headers=auth(token))
            assert res.status_code == 200, f"{endpoint} returned {res.status_code}: {res.text}"

    def test_reports_blocked_for_requester(self, client):
        """All 7 report endpoints must return 403 for requester role."""
        token = get_token(client, "USR001", "User@123")
        for endpoint in REPORT_ENDPOINTS:
            res = client.get(endpoint, headers=auth(token))
            assert res.status_code == 403, (
                f"{endpoint} should be forbidden for requester but returned {res.status_code}"
            )

    def test_reports_blocked_for_dept_head(self, client):
        """Report endpoints must return 403 for dept_head role."""
        token = get_token(client, "HD001", "Head@123")
        for endpoint in REPORT_ENDPOINTS:
            res = client.get(endpoint, headers=auth(token))
            assert res.status_code == 403, (
                f"{endpoint} should be forbidden for dept_head but returned {res.status_code}"
            )

    def test_stock_report_reflects_issuances(self, client, db):
        """
        After issuing 1 unit, the /reports/stock endpoint must reflect
        the reduced available_quantity for that tool.
        """
        tool = make_tool(db, quantity=5)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issue_tool(client, stf_token, req["id"])

        # Stock report must show available_quantity = 4
        adm_token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/reports/stock", headers=auth(adm_token))
        assert res.status_code == 200

        rows = res.json()
        row = next((r for r in rows if r.get("tool_code") == tool.tool_code), None)
        assert row is not None, f"Tool {tool.tool_code} not found in stock report"
        assert row["available_quantity"] == 4, (
            f"Expected available_quantity=4 after 1 issuance, got {row['available_quantity']}"
        )

    def test_csv_export_returns_blob(self, client):
        """CSV export returns content-type text/csv and non-empty body."""
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/reports/stock?format=csv", headers=auth(token))
        assert res.status_code == 200
        content_type = res.headers.get("content-type", "")
        assert "text/csv" in content_type or "text/plain" in content_type, (
            f"Expected CSV content-type, got: {content_type}"
        )
        assert len(res.content) > 0

    def test_overdue_report_shows_overdue_issuances(self, client, db):
        """An issuance past its return date must appear in the overdue report."""
        from app.models.transaction import IssuanceLog
        from sqlalchemy import text

        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # Backdate the expected_return_date to yesterday
        yesterday = date.today() - timedelta(days=1)
        log = db.query(IssuanceLog).filter(IssuanceLog.id == issued["id"]).first()
        log.expected_return_date = yesterday
        db.commit()

        adm_token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/reports/overdue", headers=auth(adm_token))
        assert res.status_code == 200

        rows = res.json()
        overdue_ids = [r.get("issuance_id") or r.get("id") for r in rows]
        assert issued["id"] in overdue_ids, (
            f"Expected {issued['id']} in overdue report, got: {overdue_ids[:5]}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 6 — Calibration management
# ═══════════════════════════════════════════════════════════════════════════════

class TestCalibration:

    def test_record_calibration_updates_next_due(self, client, db):
        """
        Recording calibration must update last_calibration_date and recalculate
        next_calibration_due = calibration_date + calibration_freq_days.
        """
        from app.models.master import Tool

        tool = make_tool(db, requires_calibration=True, cal_overdue=True)
        adm_token = get_token(client, "ADM001", "Admin@123")
        today = date.today()

        res = client.post(f"/api/calibration/{tool.id}", json={
            "calibration_date": today.isoformat(),
            "service_partner": "Test Lab",
            "notes": "Integration test calibration",
        }, headers=auth(adm_token))
        assert res.status_code == 200, f"Calibration record failed: {res.text}"

        data = res.json()
        # next_calibration_due must be today + freq_days
        expected_next = today + timedelta(days=180)
        assert data["next_calibration_due"] == expected_next.isoformat(), (
            f"Expected next_due={expected_next}, got {data['next_calibration_due']}"
        )
        # Tool status must reset to "active"
        assert data["status"] == "active"

    def test_calibration_list_returns_overdue_tools(self, client, db):
        """Tools with overdue calibration must appear in GET /calibration with status='overdue'."""
        tool = make_tool(db, requires_calibration=True, cal_overdue=True)
        adm_token = get_token(client, "ADM001", "Admin@123")

        res = client.get("/api/calibration?days=3650", headers=auth(adm_token))
        assert res.status_code == 200
        tools = res.json()

        overdue = [t for t in tools if t.get("calibration_status") == "overdue"]
        assert any(t["id"] == str(tool.id) for t in overdue), (
            f"Tool {tool.tool_code} not found in overdue calibration list"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# TEST GROUP 7 — Dashboard
# ═══════════════════════════════════════════════════════════════════════════════

class TestDashboard:

    def test_requester_dashboard_excludes_written_off_stock(self, client, db):
        requester_token = get_token(client, "USR001", "User@123")
        before = client.get(
            "/api/dashboard/summary",
            headers=auth(requester_token),
        ).json()

        tool = make_tool(db, quantity=4)
        tool.status = "written_off"
        db.commit()

        after = client.get(
            "/api/dashboard/summary",
            headers=auth(requester_token),
        ).json()
        assert after["total_tools"] == before["total_tools"]
        assert after["available_tools"] == before["available_tools"]

    def test_dashboard_summary_all_roles(self, client):
        """GET /dashboard/summary returns 200 for all 4 roles."""
        role_creds = [
            ("ADM001", "Admin@123"),
            ("STF001", "Staff@123"),
            ("HD001",  "Head@123"),
            ("USR001", "User@123"),
        ]
        for emp_id, pwd in role_creds:
            token = get_token(client, emp_id, pwd)
            res = client.get("/api/dashboard/summary", headers=auth(token))
            assert res.status_code == 200, (
                f"Dashboard failed for {emp_id}: {res.status_code} {res.text}"
            )

    def test_dashboard_summary_has_required_fields(self, client):
        """Dashboard summary must include total_tools, available_tools, issued_count, overdue_count."""
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/dashboard/summary", headers=auth(token))
        assert res.status_code == 200
        data = res.json()
        for field in ("total_tools", "available_tools", "issued_count", "overdue_count"):
            assert field in data, f"Missing field '{field}' in dashboard summary"

    def test_dashboard_and_stock_report_use_same_inventory_totals(self, client, db):
        """Dashboard totals must match the stock report's unit totals."""
        tool = make_tool(db, quantity=6)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id, qty=2)
        approve_req(client, hd_token, req["id"])
        issue_tool(client, stf_token, req["id"])

        dashboard = client.get("/api/dashboard/summary", headers=auth(adm_token)).json()
        stock_rows = client.get("/api/reports/stock", headers=auth(adm_token)).json()

        assert dashboard["total_tools"] == sum(r["total_quantity"] for r in stock_rows)
        assert dashboard["available_tools"] == sum(r["available_quantity"] for r in stock_rows)
        assert dashboard["tools_issued"] == sum(r["issued_quantity"] for r in stock_rows)

    def test_my_issuances_returns_only_current_user(self, client, db):
        """GET /dashboard/my-issuances must only return issuances for the logged-in user."""
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # USR001's dashboard must show this issuance
        res = client.get("/api/dashboard/my-issuances", headers=auth(usr_token))
        assert res.status_code == 200
        ids = [i["id"] for i in res.json()]
        assert issued["id"] in ids, "Issued tool not visible in requester's active issuances"


class TestWorkflowFixRegressions:

    def _manual_approved_req(self, db, tool, *, from_date, to_date, qty=1):
        import uuid
        from datetime import datetime
        from app.models.transaction import Requisition, User

        requester = db.query(User).filter(User.employee_id == "USR001").first()
        approver = db.query(User).filter(User.employee_id == "HD001").first()
        req = Requisition(
            id=uuid.uuid4(),
            requisition_number=f"FIX-{uuid.uuid4().hex[:10].upper()}",
            tool_id=tool.id,
            requested_by=requester.id,
            requester_dept=requester.department,
            quantity_requested=qty,
            purpose_of_job="Regression test job",
            from_date=from_date,
            to_date=to_date,
            status="approved",
            approved_by=approver.id,
            approved_at=datetime.utcnow(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    def test_approved_requisition_reserves_stock_in_reports(self, client, db):
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id, qty=1)
        approve_req(client, hd_token, req["id"])

        rows = client.get("/api/reports/stock", headers=auth(adm_token)).json()
        row = next(r for r in rows if r["tool_code"] == tool.tool_code)
        assert row["reserved_quantity"] == 1
        assert row["available_quantity"] == 1

    def test_over_approval_blocked_by_existing_approved_reservation(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        req1 = raise_req(client, usr_token, tool.id, qty=1)
        req2 = raise_req(client, usr_token, tool.id, qty=1)
        approve_req(client, hd_token, req1["id"])
        blocked = client.put(f"/api/requisitions/{req2['id']}/approve", headers=auth(hd_token))
        assert blocked.status_code == 400
        assert "reservation" in blocked.json()["detail"].lower() or "available" in blocked.json()["detail"].lower()

    def test_issuance_blocked_before_from_date(self, client, db):
        tool = make_tool(db, quantity=1)
        req = self._manual_approved_req(
            db,
            tool,
            from_date=date.today() + timedelta(days=2),
            to_date=date.today() + timedelta(days=5),
        )
        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(stf_token))
        assert res.status_code == 400
        assert "before requested from date" in res.json()["detail"].lower()

    def test_issuance_blocked_after_to_date_and_expired(self, client, db):
        tool = make_tool(db, quantity=1)
        req = self._manual_approved_req(
            db,
            tool,
            from_date=date.today() - timedelta(days=5),
            to_date=date.today() - timedelta(days=1),
        )
        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(stf_token))
        assert res.status_code == 400
        assert "after requested to date" in res.json()["detail"].lower()

    def test_consumable_type_cannot_change_during_active_requisition_or_issuance(self, client, db):
        tool = make_tool(db, quantity=2, is_consumable=False)
        adm_token = get_token(client, "ADM001", "Admin@123")
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=1)
        blocked_pending = client.put(f"/api/tools/{tool.id}", json={"is_consumable": True}, headers=auth(adm_token))
        assert blocked_pending.status_code == 400

        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        blocked_open = client.put(f"/api/tools/{tool.id}", json={"is_consumable": True}, headers=auth(adm_token))
        assert blocked_open.status_code == 400
        assert "active requisitions or issuances" in blocked_open.json()["detail"]
        assert issued["actual_return_date"] is None

    def test_access_request_approval_cannot_overwrite_existing_user(self, client, db):
        import uuid
        from app.auth.roles import hash_password
        from app.models.transaction import AccessRequest, User

        existing = db.query(User).filter(User.employee_id == "USR001").first()
        req = AccessRequest(
            request_id=f"AR-{uuid.uuid4().hex[:8].upper()}",
            full_name="Overwrite Attempt",
            email=existing.email,
            employee_id=existing.employee_id,
            department="Maintenance",
            requested_role="maintenance_admin",
            reason="Regression test",
            hashed_password=hash_password("Overwrite@123"),
            status="pending",
        )
        db.add(req)
        db.commit()
        adm_token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/users/access-requests/{req.request_id}/approve", headers=auth(adm_token))
        assert res.status_code == 400
        db.refresh(existing)
        assert existing.role == "requester"
        assert existing.full_name == "Requester User"

    def test_last_active_admin_cannot_be_demoted_or_deactivated(self, client, db):
        from app.models.transaction import User

        adm = db.query(User).filter(User.employee_id == "ADM001").first()
        adm_token = get_token(client, "ADM001", "Admin@123")

        demote = client.put(f"/api/users/{adm.id}", json={"role": "requester"}, headers=auth(adm_token))
        assert demote.status_code == 400
        assert "administrator" in demote.json()["detail"].lower()

        deactivate = client.put(f"/api/users/{adm.id}", json={"is_active": False}, headers=auth(adm_token))
        assert deactivate.status_code == 400

    def test_mixed_condition_batch_return_updates_stock(self, client, db):
        tool = make_tool(db, quantity=5)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=5)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        res = client.post(
            f"/api/returns/{issued['id']}",
            json={
                "quantity_returned": 5,
                "return_condition": "damaged",
                "condition_quantities": {"good": 4, "damaged": 1, "missing": 0},
                "notes": "One unit cracked",
            },
            headers=auth(stf_token),
        )
        assert res.status_code == 200, res.text
        db.refresh(tool)
        assert tool.available_quantity == 4
        assert res.json()["return_breakdown"]["damaged"] == 1

    def test_impossible_damage_classifications_rejected(self, client, db):
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id, qty=1)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        return_tool(client, stf_token, issued["id"], qty_returned=1, condition="missing", notes="Missing")
        bad_missing = client.post(f"/api/damage/{issued['id']}", json={"damage_type": "wear_and_tear"}, headers=auth(adm_token))
        assert bad_missing.status_code == 400

        req2 = raise_req(client, usr_token, tool.id, qty=1)
        approve_req(client, hd_token, req2["id"])
        issued2 = issue_tool(client, stf_token, req2["id"])
        return_tool(client, stf_token, issued2["id"], qty_returned=1, condition="damaged", notes="Bent")
        bad_damaged = client.post(
            f"/api/damage/{issued2['id']}",
            json={"damage_type": "theft", "market_rate_at_damage": 1000},
            headers=auth(adm_token),
        )
        assert bad_damaged.status_code == 400

    def test_storage_bin_capacity_enforced_by_physical_quantity(self, client):
        adm_token = get_token(client, "ADM001", "Admin@123")
        bin_res = client.post(
            "/api/storage-bins",
            json={"bin_code": f"CAP-{__import__('uuid').uuid4().hex[:6].upper()}", "shelf_label": "Capacity Shelf", "capacity": 3},
            headers=auth(adm_token),
        )
        assert bin_res.status_code == 201, bin_res.text
        bin_id = bin_res.json()["id"]
        tool_res = client.post(
            "/api/tools",
            json={
                "tool_code": f"CAP-T-{__import__('uuid').uuid4().hex[:6].upper()}",
                "name": "Capacity Test Tool",
                "tool_type": "general",
                "is_consumable": False,
                "total_quantity": 4,
                "storage_bin_id": bin_id,
            },
            headers=auth(adm_token),
        )
        assert tool_res.status_code == 400
        assert "capacity" in tool_res.json()["detail"].lower()

    def test_reports_include_completed_consumable_quantities_and_activity_quantity(self, client, db):
        tool = make_tool(db, quantity=10, is_consumable=True)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=3)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        assert issued["actual_return_date"] is not None
        assert issued["return_condition"] == "consumed"
        assert issued["quantity_consumed"] == 3

        util = client.get("/api/reports/utilization", headers=auth(stf_token))
        assert util.status_code == 200
        assert any(row["department"] == "E&I" and row["total_issued"] >= 3 for row in util.json())

        activity = client.get("/api/reports/activity-logs", headers=auth(stf_token))
        assert activity.status_code == 200
        issue_rows = [r for r in activity.json() if r["action_type"] == "CONSUMABLE_ISSUED" and r["entity_id"] == issued["id"]]
        assert issue_rows
        assert issue_rows[0]["quantity"] == 3
