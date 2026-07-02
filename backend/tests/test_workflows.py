"""
End-to-end role-based workflow tests — TIMS.
These tests exercise complete multi-step flows from requester through to return/damage.
They are the highest-value tests: each one validates business logic end-to-end.

Workflows:
  A – Requester → Head Approval → Staff Issue → Return → Stock Restored
  B – Rejection by Head, Stock Unchanged
  C – Overbooking Prevention
  D – Calibration Blocking Issuance
  E – Damage/Loss, Stock Does Not Restore
  F – Role Restriction (cross-role access blocked)

Run: cd backend && python -m pytest tests/test_workflows.py -v --tb=short
"""
import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest

# ── helpers ──────────────────────────────────────────────────────────────────

def get_token(client, employee_id, password):
    res = client.post("/api/auth/login", data={"username": employee_id, "password": password})
    assert res.status_code == 200, f"Login failed for {employee_id}: {res.text}"
    return res.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def make_tool(db, *, quantity=5, is_consumable=False, requires_calibration=False, cal_overdue=False):
    from app.models.master import Tool
    code = f"WF-{uuid.uuid4().hex[:8].upper()}"
    today = date.today()
    tool = Tool(
        tool_code=code,
        name=f"Workflow Tool {code}",
        tool_type="general",
        is_consumable=is_consumable,
        total_quantity=quantity,
        available_quantity=quantity,
        requires_calibration=requires_calibration,
        calibration_freq_days=90 if requires_calibration else None,
        last_calibration_date=(today - timedelta(days=91)) if cal_overdue else (today - timedelta(days=30)) if requires_calibration else None,
        next_calibration_due=(today - timedelta(days=1)) if cal_overdue else (today + timedelta(days=60)) if requires_calibration else None,
        status="calibration_due" if cal_overdue else "active",
    )
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return tool

def raise_req(client, token, tool_id, qty=1, purpose="Workflow test"):
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

def reject_req(client, token, req_id, reason):
    res = client.put(f"/api/requisitions/{req_id}/reject",
                     json={"reason": reason}, headers=auth(token))
    assert res.status_code == 200, f"reject_req failed: {res.text}"
    return res.json()

def issue_tool(client, token, req_id):
    res = client.post("/api/issuance", json={"requisition_id": req_id}, headers=auth(token))
    assert res.status_code == 201, f"issue_tool failed: {res.text}"
    return res.json()

def return_tool(client, token, issuance_id, qty=1, condition="good", notes=None):
    body = {"quantity_returned": qty, "return_condition": condition}
    if notes:
        body["notes"] = notes
    res = client.post(f"/api/returns/{issuance_id}", json=body, headers=auth(token))
    assert res.status_code == 200, f"return_tool failed: {res.text}"
    return res.json()


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW A — Full happy path: Requester → Approve → Issue → Return
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowA_RequesterToReturn:

    def test_full_lifecycle_stock_consistency(self, client, db):
        tool = make_tool(db, quantity=5)
        initial_qty = tool.available_quantity

        # Step 1: Requester creates requisition
        usr_token = get_token(client, "USR001", "User@123")
        req = raise_req(client, usr_token, tool.id)
        assert req["status"] == "pending"

        # Stock unchanged after request
        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Stock must not change on request creation"

        # Step 2: Head approves
        hd_token = get_token(client, "HD001", "Head@123")
        approved = approve_req(client, hd_token, req["id"])
        assert approved["status"] == "approved"

        # Stock unchanged after approval (reserved but not issued)
        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Stock must not change on approval"

        # Step 3: Staff issues
        stf_token = get_token(client, "STF001", "Staff@123")
        issued = issue_tool(client, stf_token, req["id"])
        assert issued["actual_return_date"] is None

        # Stock decreases by 1 on issuance
        db.refresh(tool)
        assert tool.available_quantity == initial_qty - 1, "Stock must drop 1 on issuance"

        # Step 4: Return in good condition
        returned = return_tool(client, stf_token, issued["id"], qty=1, condition="good")
        assert returned["return_condition"] == "good"
        assert returned["actual_return_date"] is not None

        # Stock fully restored
        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Stock must fully restore after good return"

        # Requisition status = returned
        req_state = client.get(f"/api/requisitions/{req['id']}", headers=auth(stf_token)).json()
        assert req_state["status"] == "returned"

    def test_requester_can_see_own_issued_tools(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        res = client.get("/api/dashboard/my-issuances", headers=auth(usr_token))
        assert res.status_code == 200
        ids = [i["id"] for i in res.json()]
        assert issued["id"] in ids

    def test_dashboard_counts_update_after_full_cycle(self, client, db):
        tool = make_tool(db, quantity=3)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        before = client.get("/api/dashboard/summary", headers=auth(adm_token)).json()

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        during = client.get("/api/dashboard/summary", headers=auth(adm_token)).json()
        assert during["tools_issued"] > before.get("tools_issued", 0) or during["issued_count"] > before.get("issued_count", 0)

        return_tool(client, stf_token, issued["id"], qty=1, condition="good")
        after = client.get("/api/dashboard/summary", headers=auth(adm_token)).json()
        assert after["available_tools"] >= before["available_tools"]

    def test_reports_updated_after_issuance(self, client, db):
        tool = make_tool(db, quantity=5)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        today = date.today().isoformat()

        res = client.get(f"/api/reports/issuance-history?from_date={today}&to_date={today}", headers=auth(adm_token))
        assert res.status_code == 200
        ids = [r.get("issuance_id") or r.get("id") for r in res.json()]
        assert issued["id"] in ids

    def test_stock_report_reflects_issuance(self, client, db):
        tool = make_tool(db, quantity=4)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issue_tool(client, stf_token, req["id"])

        rows = client.get("/api/reports/stock", headers=auth(adm_token)).json()
        row = next((r for r in rows if r.get("tool_code") == tool.tool_code), None)
        assert row is not None, f"Tool {tool.tool_code} not in stock report"
        assert row["available_quantity"] == 3


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW B — Rejection: Stock Unchanged
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowB_Rejection:

    def test_rejection_stock_unchanged(self, client, db):
        tool = make_tool(db, quantity=3)
        initial_qty = tool.available_quantity

        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        req = raise_req(client, usr_token, tool.id)
        rejected = reject_req(client, hd_token, req["id"], reason="Not approved for this project")
        assert rejected["status"] == "rejected"
        assert rejected["rejection_reason"] == "Not approved for this project"

        db.refresh(tool)
        assert tool.available_quantity == initial_qty, "Rejected request must not reduce stock"

    def test_requester_can_see_rejected_requisition(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        req = raise_req(client, usr_token, tool.id)
        reject_req(client, hd_token, req["id"], reason="Test rejection")

        my_reqs = client.get("/api/requisitions", headers=auth(usr_token)).json()
        target = next((r for r in my_reqs if r["id"] == req["id"]), None)
        assert target is not None
        assert target["status"] == "rejected"

    def test_rejected_requisition_cannot_be_issued(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        reject_req(client, hd_token, req["id"], reason="Rejected")

        res = client.post("/api/issuance", json={"requisition_id": req["id"]}, headers=auth(stf_token))
        assert res.status_code in (400, 422), "Rejected requisition must not be issuable"

    def test_rejection_reason_is_required(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        req = raise_req(client, usr_token, tool.id)
        res = client.put(f"/api/requisitions/{req['id']}/reject",
                         json={"reason": ""}, headers=auth(hd_token))
        assert res.status_code == 422

    def test_reports_show_rejected_not_in_issued(self, client, db):
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        reject_req(client, hd_token, req["id"], reason="Not needed")

        today = date.today().isoformat()
        rows = client.get(f"/api/reports/issuance-history?from_date={today}&to_date={today}", headers=auth(adm_token)).json()
        ids = [r.get("requisition_id") or r.get("id") for r in rows]
        assert req["id"] not in ids, "Rejected requisition must not appear in issuance report"


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW C — Overbooking Prevention
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowC_OverbookingPrevention:

    def test_second_approval_blocked_when_stock_reserved(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        req1 = raise_req(client, usr_token, tool.id, qty=1)
        req2 = raise_req(client, usr_token, tool.id, qty=1)

        approve_req(client, hd_token, req1["id"])

        # Approving req2 should fail — qty=1 is fully reserved
        res = client.put(f"/api/requisitions/{req2['id']}/approve", headers=auth(hd_token))
        assert res.status_code == 400
        assert "reservation" in res.json()["detail"].lower() or "available" in res.json()["detail"].lower()

    def test_issuance_cannot_exceed_physical_stock(self, client, db):
        from app.models.transaction import Requisition, User
        from datetime import datetime
        from app.services.requisition_number import generate_requisition_number

        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        for _ in range(2):
            req = raise_req(client, usr_token, tool.id, qty=1)
            approve_req(client, hd_token, req["id"])
            res = client.post("/api/issuance", json={"requisition_id": req["id"]}, headers=auth(stf_token))
            assert res.status_code == 201, res.text

        requester = db.query(User).filter(User.employee_id == "USR001").first()
        approver = db.query(User).filter(User.employee_id == "HD001").first()
        extra_req = Requisition(
            id=uuid.uuid4(),
            requisition_number=generate_requisition_number(db),
            tool_id=tool.id,
            requested_by=requester.id,
            requester_dept=requester.department,
            quantity_requested=1,
            purpose_of_job="Physical stock exhaustion test",
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
            status="approved",
            approved_by=approver.id,
            approved_at=datetime.utcnow(),
        )
        db.add(extra_req)
        db.commit()
        db.refresh(extra_req)

        extra = client.post("/api/issuance", json={"requisition_id": str(extra_req.id)}, headers=auth(stf_token))
        assert extra.status_code == 400
        assert "stock" in extra.json()["detail"].lower()

    def test_availability_check_reflects_reservations(self, client, db):
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")

        # Approve 2 units (all stock)
        req = raise_req(client, usr_token, tool.id, qty=2)
        approve_req(client, hd_token, req["id"])

        avail = client.get(
            "/api/requisitions/availability/check",
            params={
                "tool_id": str(tool.id),
                "quantity": 1,
                "from_date": date.today().isoformat(),
                "to_date": (date.today() + timedelta(days=3)).isoformat(),
            },
            headers=auth(usr_token),
        )
        assert avail.status_code == 200
        assert avail.json()["available_quantity"] == 0
        assert avail.json()["request_available"] is False


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW D — Calibration Blocking Issuance
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowD_CalibrationBlocking:

    def test_overdue_calibration_blocks_issuance(self, client, db):
        from app.models.transaction import Requisition, User
        from datetime import datetime

        tool = make_tool(db, requires_calibration=True, cal_overdue=True)

        requester = db.query(User).filter(User.employee_id == "USR001").first()
        approver = db.query(User).filter(User.employee_id == "HD001").first()
        from app.services.requisition_number import generate_requisition_number
        req = Requisition(
            id=uuid.uuid4(),
            requisition_number=generate_requisition_number(db),
            tool_id=tool.id,
            requested_by=requester.id,
            requester_dept=requester.department,
            quantity_requested=1,
            purpose_of_job="Calibration test",
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
            status="approved",
            approved_by=approver.id,
            approved_at=datetime.utcnow(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(stf_token))
        assert res.status_code == 400
        assert "calibration" in res.json()["detail"].lower()

    def test_calibration_recorded_unblocks_issuance(self, client, db):
        from app.models.transaction import Requisition, User
        from datetime import datetime

        tool = make_tool(db, requires_calibration=True, cal_overdue=True)
        adm_token = get_token(client, "ADM001", "Admin@123")

        # Record calibration to clear overdue status
        cal_res = client.post(f"/api/calibration/{tool.id}", json={
            "calibration_date": date.today().isoformat(),
            "service_partner": "Test Lab",
        }, headers=auth(adm_token))
        assert cal_res.status_code == 200
        assert cal_res.json()["status"] == "active"

        requester = db.query(User).filter(User.employee_id == "USR001").first()
        approver = db.query(User).filter(User.employee_id == "HD001").first()
        from app.services.requisition_number import generate_requisition_number
        req = Requisition(
            id=uuid.uuid4(),
            requisition_number=generate_requisition_number(db),
            tool_id=tool.id,
            requested_by=requester.id,
            requester_dept=requester.department,
            quantity_requested=1,
            purpose_of_job="Calibration unblock test",
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
            status="approved",
            approved_by=approver.id,
            approved_at=datetime.utcnow(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(stf_token))
        assert res.status_code == 201, f"Issuance after calibration should succeed: {res.text}"

    def test_overdue_calibration_visible_in_calibration_report(self, client, db):
        tool = make_tool(db, requires_calibration=True, cal_overdue=True)
        adm_token = get_token(client, "ADM001", "Admin@123")

        res = client.get("/api/calibration?days=3650", headers=auth(adm_token))
        assert res.status_code == 200
        overdue = [t for t in res.json() if t.get("calibration_status") == "overdue"]
        assert any(t["id"] == str(tool.id) for t in overdue)


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW E — Damage/Loss Stock Handling
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowE_DamageLoss:

    def test_damaged_return_does_not_restore_stock(self, client, db):
        tool = make_tool(db, quantity=3)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        db.refresh(tool)
        after_issue = tool.available_quantity  # should be initial - 1

        return_tool(client, stf_token, issued["id"], qty=1, condition="damaged", notes="Broken")

        db.refresh(tool)
        assert tool.available_quantity == after_issue, "Damaged return must NOT restore available stock"

    def test_missing_return_does_not_restore_stock(self, client, db):
        tool = make_tool(db, quantity=3)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        db.refresh(tool)
        after_issue = tool.available_quantity

        return_tool(client, stf_token, issued["id"], qty=1, condition="missing", notes="Lost on site")

        db.refresh(tool)
        assert tool.available_quantity == after_issue, "Missing return must NOT restore available stock"

    def test_damage_assessment_reduces_total_quantity(self, client, db):
        tool = make_tool(db, quantity=2)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        return_tool(client, stf_token, issued["id"], qty=1, condition="damaged", notes="Cracked frame")

        db.refresh(tool)
        pre_assessment_total = tool.total_quantity

        res = client.post(f"/api/damage/{issued['id']}",
                          json={"damage_type": "mishandling"},
                          headers=auth(adm_token))
        assert res.status_code == 200

        db.refresh(tool)
        assert tool.total_quantity < pre_assessment_total, "Damage assessment must reduce total_quantity"

    def test_damage_report_reflects_assessment(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")
        adm_token = get_token(client, "ADM001", "Admin@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])
        return_tool(client, stf_token, issued["id"], qty=1, condition="damaged", notes="Bent")
        client.post(f"/api/damage/{issued['id']}", json={"damage_type": "mishandling"}, headers=auth(adm_token))

        report = client.get("/api/reports/damage-penalty", headers=auth(adm_token))
        assert report.status_code == 200
        ids = [r.get("issuance_id") or r.get("id") for r in report.json()]
        assert issued["id"] in ids, "Damage report must include assessed issuance"

    def test_tool_tracking_updates_after_return(self, client, db):
        tool = make_tool(db, quantity=1)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        # Tool should show as issued
        tool_data = client.get(f"/api/tools/{tool.id}", headers=auth(stf_token)).json()
        assert len(tool_data["current_issuances"]) == 1

        return_tool(client, stf_token, issued["id"], qty=1, condition="good")

        # Tool should show as returned
        tool_data = client.get(f"/api/tools/{tool.id}", headers=auth(stf_token)).json()
        assert len(tool_data["current_issuances"]) == 0


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW F — Role Restriction
# ═══════════════════════════════════════════════════════════════════════════════

class TestWorkflowF_RoleRestriction:

    def test_requester_cannot_access_reports(self, client):
        token = get_token(client, "USR001", "User@123")
        for ep in ("/api/reports/stock", "/api/reports/issuance-history",
                   "/api/reports/overdue", "/api/reports/calibration",
                   "/api/reports/damage-penalty"):
            res = client.get(ep, headers=auth(token))
            assert res.status_code == 403, f"Expected 403 for requester on {ep}, got {res.status_code}"

    def test_head_cannot_access_reports(self, client):
        token = get_token(client, "HD001", "Head@123")
        for ep in ("/api/reports/stock", "/api/reports/issuance-history"):
            res = client.get(ep, headers=auth(token))
            assert res.status_code == 403

    def test_requester_cannot_access_user_management(self, client):
        token = get_token(client, "USR001", "User@123")
        assert client.get("/api/users", headers=auth(token)).status_code == 403
        assert client.get("/api/users/access-requests", headers=auth(token)).status_code == 403

    def test_requester_cannot_issue_tools(self, client, db):
        from app.models.transaction import Requisition, User
        from datetime import datetime

        tool = make_tool(db)
        requester = db.query(User).filter(User.employee_id == "USR001").first()
        approver = db.query(User).filter(User.employee_id == "HD001").first()
        from app.services.requisition_number import generate_requisition_number
        req = Requisition(
            id=uuid.uuid4(),
            requisition_number=generate_requisition_number(db),
            tool_id=tool.id,
            requested_by=requester.id,
            requester_dept=requester.department,
            quantity_requested=1,
            purpose_of_job="Role restriction test",
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
            status="approved",
            approved_by=approver.id,
            approved_at=datetime.utcnow(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        usr_token = get_token(client, "USR001", "User@123")
        res = client.post("/api/issuance", json={"requisition_id": str(req.id)}, headers=auth(usr_token))
        assert res.status_code == 403

    def test_requester_cannot_return_tools(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")
        hd_token = get_token(client, "HD001", "Head@123")
        stf_token = get_token(client, "STF001", "Staff@123")

        req = raise_req(client, usr_token, tool.id)
        approve_req(client, hd_token, req["id"])
        issued = issue_tool(client, stf_token, req["id"])

        res = client.post(f"/api/returns/{issued['id']}",
                          json={"quantity_returned": 1, "return_condition": "good"},
                          headers=auth(usr_token))
        assert res.status_code == 403

    def test_head_cannot_approve_own_requisition(self, client, db):
        tool = make_tool(db)
        hd_token = get_token(client, "HD001", "Head@123")

        req = raise_req(client, hd_token, tool.id)
        res = client.put(f"/api/requisitions/{req['id']}/approve", headers=auth(hd_token))
        assert res.status_code == 403

    def test_cross_dept_head_cannot_approve_other_dept_requisition(self, client, db):
        tool = make_tool(db)
        usr_token = get_token(client, "USR001", "User@123")  # E&I
        hd2_token = get_token(client, "HD002", "Head2@123")  # Mechanical

        req = raise_req(client, usr_token, tool.id)
        res = client.put(f"/api/requisitions/{req['id']}/approve", headers=auth(hd2_token))
        assert res.status_code == 403

    def test_requester_cannot_create_tools(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.post("/api/tools", json={
            "tool_code": f"NO-{uuid.uuid4().hex[:6].upper()}",
            "name": "Should Not Create",
            "tool_type": "general",
            "is_consumable": False,
            "total_quantity": 1,
        }, headers=auth(token))
        assert res.status_code == 403

    def test_requester_cannot_access_issuance_queue(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.get("/api/issuance/queue", headers=auth(token))
        assert res.status_code == 403

    def test_requester_sees_only_own_requisitions(self, client, db):
        from app.models.transaction import Requisition, User
        from datetime import datetime

        tool = make_tool(db)

        # Create a requisition for USR001
        usr_token = get_token(client, "USR001", "User@123")
        req_visible = raise_req(client, usr_token, tool.id)

        # Create a requisition from HD001 directly (simulated)
        hd = db.query(User).filter(User.employee_id == "HD001").first()
        from app.services.requisition_number import generate_requisition_number
        other_req = Requisition(
            id=uuid.uuid4(),
            requisition_number=generate_requisition_number(db),
            tool_id=tool.id,
            requested_by=hd.id,
            requester_dept=hd.department,
            quantity_requested=1,
            purpose_of_job="Other dept req",
            from_date=date.today(),
            to_date=date.today() + timedelta(days=3),
            status="pending",
        )
        db.add(other_req)
        db.commit()

        my_reqs = client.get("/api/requisitions", headers=auth(usr_token)).json()
        ids = {r["id"] for r in my_reqs}
        assert req_visible["id"] in ids
        assert str(other_req.id) not in ids, "Requester must not see other users' requisitions"

    def test_unauthenticated_requests_rejected(self, client):
        endpoints = ["/api/tools", "/api/requisitions", "/api/dashboard/summary",
                     "/api/users", "/api/reports/stock"]
        for ep in endpoints:
            res = client.get(ep)
            assert res.status_code == 401, f"Expected 401 for unauthenticated {ep}, got {res.status_code}"
