"""
Integration test suite for TIMS — Tool Inventory Management System.
Requires a running PostgreSQL test database at DATABASE_URL.

Run: cd backend && python -m pytest tests/test_integration.py -v --tb=short
"""
from datetime import date, timedelta
from decimal import Decimal

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
              purchase_price=10000, purchase_date=None, standard_life_months=60):
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
        tool_type="general",
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

    def test_forgot_username_success_and_not_found(self, client):
        res = client.post("/api/auth/forgot-username", json={"identifier": "user@tims.test"})
        assert res.status_code == 200
        assert res.json()["employee_id"] == "USR001"

        missing = client.post("/api/auth/forgot-username", json={"identifier": "missing@tims.test"})
        assert missing.status_code == 404

    def test_forgot_and_reset_password_demo_token(self, client):
        reset = client.post("/api/auth/forgot-password", json={"employee_id": "USR001", "email": "user@tims.test"})
        assert reset.status_code == 200
        token = reset.json().get("reset_token")
        assert token, "Test config has no SMTP, so API should return a demo reset token"

        changed = client.post("/api/auth/reset-password", json={"token": token, "new_password": "NewUser@123"})
        assert changed.status_code == 200

        login = client.post("/api/auth/login", data={"username": "USR001", "password": "NewUser@123"})
        assert login.status_code == 200

        restore = client.post("/api/auth/forgot-password", json={"employee_id": "USR001", "email": "user@tims.test"})
        restore_token = restore.json().get("reset_token")
        assert restore_token
        restored = client.post("/api/auth/reset-password", json={"token": restore_token, "new_password": "User@123"})
        assert restored.status_code == 200

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

    def test_consumable_partial_return(self, client, db):
        """
        Issue 10 consumable units, return 7. Verify stock restores by 7 only,
        and quantity_consumed = 3 is stored.
        """
        tool = make_tool(db, quantity=20, is_consumable=True)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id, qty=10)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        db.refresh(tool)
        qty_after_issue = tool.available_quantity  # should be 20 - 10 = 10

        # Partial return: 7 of 10
        returned = return_tool(client, stf_token, issued["id"], qty_returned=7, condition="good")

        db.refresh(tool)
        # Stock should restore by 7, not 10
        assert tool.available_quantity == qty_after_issue + 7, (
            f"Expected {qty_after_issue + 7}, got {tool.available_quantity}"
        )
        # quantity_consumed = 10 - 7 = 3
        assert returned["quantity_consumed"] == 3
        assert returned["quantity_returned"] == 7
        assert tool.total_quantity == 17, "Consumed consumables must reduce total stock"

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

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])

        # Issuance must fail because calibration is overdue
        res = client.post("/api/issuance", json={"requisition_id": req["id"]}, headers=auth(stf_token))
        assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
        assert "calibration" in res.json()["detail"].lower()

    def test_stock_cannot_go_negative(self, client, db):
        """
        Issue all available units; one more attempt must return 400.
        available_quantity must be 0, never -1.
        """
        TOTAL = 3
        tool = make_tool(db, quantity=TOTAL)

        usr_token = get_token(client, "USR001", "User@123")
        hd_token  = get_token(client, "HD001",  "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        # Raise and approve TOTAL+1 requisitions
        req_ids = []
        for _ in range(TOTAL + 1):
            req = raise_req(client, usr_token, tool.id, qty=1)
            approve_req(client, hd_token, req["id"])
            req_ids.append(req["id"])

        # Issue TOTAL successfully
        for req_id in req_ids[:TOTAL]:
            issue_tool(client, stf_token, req_id)

        # Verify stock is now 0
        db.refresh(tool)
        assert tool.available_quantity == 0

        # The (TOTAL+1)-th issuance must fail
        res = client.post("/api/issuance", json={"requisition_id": req_ids[TOTAL]}, headers=auth(stf_token))
        assert res.status_code == 400, f"Expected 400 for over-stock issuance, got {res.status_code}"

        # Verify stock is still 0, not -1
        db.refresh(tool)
        assert tool.available_quantity == 0, f"available_quantity must be 0, got {tool.available_quantity}"

    def test_partial_return_blocked_for_non_consumable(self, client, db):
        """
        A non-consumable tool must return all units in good condition.
        Returning fewer (condition=good) must be rejected.
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
        assert res.status_code == 400, f"Expected 400 for partial non-consumable return, got {res.status_code}"

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
        assert res.status_code == 400, f"Expected 400 (theft without market rate), got {res.status_code}"

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
        assert dmg["tool_status"] == "written_off"


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
