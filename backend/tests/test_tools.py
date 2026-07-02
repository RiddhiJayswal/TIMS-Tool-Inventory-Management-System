"""
Tool management integration tests — TIMS.
Covers: CRUD, search, validation, quantity management, calibration fields,
department visibility, consumable rules, bin capacity enforcement.

Run: cd backend && python -m pytest tests/test_tools.py -v --tb=short
"""
import uuid
from datetime import date, timedelta

import pytest

# ── helpers ──────────────────────────────────────────────────────────────────

def get_token(client, employee_id, password):
    res = client.post("/api/auth/login", data={"username": employee_id, "password": password})
    assert res.status_code == 200, f"Login failed for {employee_id}: {res.text}"
    return res.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def _unique(prefix="T"):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

def _make_tool_payload(**overrides):
    base = {
        "tool_code": _unique("TC"),
        "name": "Test Torque Wrench",
        "tool_type": "general",
        "is_consumable": False,
        "total_quantity": 3,
    }
    base.update(overrides)
    return base


# ═══════════════════════════════════════════════════════════════════════════════
# CREATE TOOL
# ═══════════════════════════════════════════════════════════════════════════════

class TestCreateTool:

    def test_admin_can_create_tool(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_tool_payload()
        res = client.post("/api/tools", json=payload, headers=auth(token))
        assert res.status_code == 201, res.text
        data = res.json()
        assert data["tool_code"] == payload["tool_code"]
        assert data["total_quantity"] == 3
        assert data["available_quantity"] == 3
        assert data["status"] == "active"

    def test_staff_can_create_tool(self, client):
        token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/tools", json=_make_tool_payload(), headers=auth(token))
        assert res.status_code == 201

    def test_requester_cannot_create_tool(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.post("/api/tools", json=_make_tool_payload(), headers=auth(token))
        assert res.status_code == 403

    def test_head_cannot_create_tool(self, client):
        token = get_token(client, "HD001", "Head@123")
        res = client.post("/api/tools", json=_make_tool_payload(), headers=auth(token))
        assert res.status_code == 403

    def test_duplicate_tool_code_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_tool_payload()
        client.post("/api/tools", json=payload, headers=auth(token))
        second = client.post("/api/tools", json=payload, headers=auth(token))
        assert second.status_code == 400
        assert "already exists" in second.json()["detail"].lower()

    def test_missing_required_fields_returns_422(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json={"name": "Unnamed"}, headers=auth(token))
        assert res.status_code == 422

    def test_negative_quantity_rejected_by_schema(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json=_make_tool_payload(total_quantity=-1), headers=auth(token))
        assert res.status_code == 422

    def test_negative_price_rejected_by_schema(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json=_make_tool_payload(purchase_price=-500), headers=auth(token))
        assert res.status_code == 422

    def test_consumable_with_zero_qty_starts_out_of_stock(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json=_make_tool_payload(is_consumable=True, total_quantity=0), headers=auth(token))
        assert res.status_code == 201
        assert res.json()["status"] == "out_of_stock"

    def test_tool_with_calibration_fields_calculates_next_due(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        last_cal = (date.today() - timedelta(days=30)).isoformat()
        payload = _make_tool_payload(
            requires_calibration=True,
            calibration_freq_days=90,
            last_calibration_date=last_cal,
        )
        res = client.post("/api/tools", json=payload, headers=auth(token))
        assert res.status_code == 201
        data = res.json()
        expected = (date.today() - timedelta(days=30) + timedelta(days=90)).isoformat()
        assert data["next_calibration_due"] == expected

    def test_tool_with_department_access_created_correctly(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_tool_payload(tool_type="specialized", department_access="E&I")
        res = client.post("/api/tools", json=payload, headers=auth(token))
        assert res.status_code == 201
        assert res.json()["department_access"] == "E&I"

    def test_unauthenticated_create_rejected(self, client):
        res = client.post("/api/tools", json=_make_tool_payload())
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════════
# LIST AND GET TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

class TestListGetTools:

    def test_admin_sees_all_tools(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/tools", headers=auth(token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_requester_cannot_see_other_dept_tools(self, client, db):
        from app.models.master import Tool
        code = _unique("DEPT")
        tool = Tool(
            tool_code=code,
            name="Mechanical Only Tool",
            tool_type="specialized",
            department_access="Mechanical",
            is_consumable=False,
            total_quantity=1,
            available_quantity=1,
        )
        db.add(tool)
        db.commit()
        db.refresh(tool)

        user_token = get_token(client, "USR001", "User@123")  # E&I dept
        tools = client.get("/api/tools", headers=auth(user_token)).json()
        ids = {t["id"] for t in tools}
        assert str(tool.id) not in ids

    def test_requester_can_see_own_dept_tools(self, client, db):
        from app.models.master import Tool
        code = _unique("EI")
        tool = Tool(
            tool_code=code,
            name="E&I Tool",
            tool_type="specialized",
            department_access="E&I",
            is_consumable=False,
            total_quantity=2,
            available_quantity=2,
        )
        db.add(tool)
        db.commit()
        db.refresh(tool)

        user_token = get_token(client, "USR001", "User@123")
        tools = client.get("/api/tools", headers=auth(user_token)).json()
        ids = {t["id"] for t in tools}
        assert str(tool.id) in ids

    def test_search_by_name(self, client, db):
        from app.models.master import Tool
        unique_name = f"UniqueSearchable{uuid.uuid4().hex[:6]}"
        tool = Tool(
            tool_code=_unique("SRCH"),
            name=unique_name,
            tool_type="general",
            is_consumable=False,
            total_quantity=1,
            available_quantity=1,
        )
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/tools?search={unique_name[:10]}", headers=auth(token))
        assert res.status_code == 200
        assert any(t["name"] == unique_name for t in res.json())

    def test_search_by_tool_code(self, client, db):
        from app.models.master import Tool
        code = _unique("FINDME")
        tool = Tool(tool_code=code, name="Find Me Tool", tool_type="general",
                    is_consumable=False, total_quantity=1, available_quantity=1)
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/tools?search={code}", headers=auth(token))
        assert res.status_code == 200
        assert any(t["tool_code"] == code for t in res.json())

    def test_get_tool_by_id(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("GETID"), name="Get By ID Tool", tool_type="general",
                    is_consumable=False, total_quantity=2, available_quantity=2)
        db.add(tool)
        db.commit()
        db.refresh(tool)

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/tools/{tool.id}", headers=auth(token))
        assert res.status_code == 200
        assert res.json()["id"] == str(tool.id)
        assert "current_issuances" in res.json()
        assert "calibration_history" in res.json()

    def test_get_nonexistent_tool_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/tools/{uuid.uuid4()}", headers=auth(token))
        assert res.status_code == 404

    def test_filter_by_status(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("STS"), name="Status Filter Tool", tool_type="general",
                    is_consumable=True, total_quantity=0, available_quantity=0, status="out_of_stock")
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/tools?status=out_of_stock", headers=auth(token))
        assert res.status_code == 200
        assert all(t["status"] == "out_of_stock" for t in res.json())

    def test_filter_requires_calibration(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("CAL"), name="Cal Filter Tool", tool_type="general",
                    is_consumable=False, requires_calibration=True,
                    total_quantity=1, available_quantity=1)
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get("/api/tools?requires_calibration=true", headers=auth(token))
        assert res.status_code == 200
        assert all(t["requires_calibration"] for t in res.json())

    def test_tool_detail_has_required_fields(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("FLD"), name="Field Check Tool", tool_type="general",
                    is_consumable=False, total_quantity=1, available_quantity=1,
                    purchase_price=5000, purchase_date=date.today() - timedelta(days=180),
                    standard_life_months=24)
        db.add(tool)
        db.commit()
        db.refresh(tool)

        token = get_token(client, "ADM001", "Admin@123")
        data = client.get(f"/api/tools/{tool.id}", headers=auth(token)).json()
        for field in ("id", "tool_code", "name", "total_quantity", "available_quantity",
                      "status", "is_consumable", "current_issuances", "calibration_history"):
            assert field in data, f"Missing field '{field}'"


# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE TOOL
# ═══════════════════════════════════════════════════════════════════════════════

class TestUpdateTool:

    def _create_tool(self, client, **overrides):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/tools", json=_make_tool_payload(**overrides), headers=auth(token))
        assert res.status_code == 201
        return res.json(), token

    def test_admin_can_update_tool_name(self, client):
        tool, token = self._create_tool(client)
        res = client.put(f"/api/tools/{tool['id']}", json={"name": "Renamed Tool"}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["name"] == "Renamed Tool"

    def test_update_quantity_increases_available(self, client):
        tool, token = self._create_tool(client, total_quantity=3)
        res = client.put(f"/api/tools/{tool['id']}", json={"total_quantity": 5}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["total_quantity"] == 5
        assert res.json()["available_quantity"] == 5

    def test_update_nonexistent_tool_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/tools/{uuid.uuid4()}", json={"name": "Ghost"}, headers=auth(token))
        assert res.status_code == 404

    def test_derived_fields_cannot_be_set_directly(self, client):
        tool, token = self._create_tool(client)
        # status is a derived lifecycle field — schema should reject it
        res = client.put(f"/api/tools/{tool['id']}", json={"status": "written_off", "name": "Renamed"}, headers=auth(token))
        assert res.status_code == 422

    def test_next_calibration_due_cannot_be_set_directly(self, client):
        tool, token = self._create_tool(client)
        res = client.put(f"/api/tools/{tool['id']}",
                         json={"next_calibration_due": "2099-01-01", "name": "Renamed"},
                         headers=auth(token))
        assert res.status_code == 422

    def test_disabling_calibration_clears_schedule(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_tool_payload(
            requires_calibration=True,
            calibration_freq_days=90,
            last_calibration_date=(date.today() - timedelta(days=30)).isoformat(),
        )
        tool = client.post("/api/tools", json=payload, headers=auth(token)).json()
        assert tool["next_calibration_due"] is not None

        res = client.put(f"/api/tools/{tool['id']}", json={"requires_calibration": False}, headers=auth(token))
        assert res.status_code == 200
        data = res.json()
        assert data["calibration_freq_days"] is None
        assert data["next_calibration_due"] is None

    def test_requester_cannot_update_tool(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("NOUPD"), name="No Update Tool", tool_type="general",
                    is_consumable=False, total_quantity=1, available_quantity=1)
        db.add(tool)
        db.commit()
        db.refresh(tool)

        token = get_token(client, "USR001", "User@123")
        res = client.put(f"/api/tools/{tool.id}", json={"name": "Hacked"}, headers=auth(token))
        assert res.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════════
# WRITE-OFF / DELETE TOOL
# ═══════════════════════════════════════════════════════════════════════════════

class TestWriteOffTool:

    def test_only_admin_can_write_off_tool(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("WO"), name="Write-Off Tool", tool_type="general",
                    is_consumable=False, total_quantity=0, available_quantity=0, status="damaged")
        db.add(tool)
        db.commit()
        db.refresh(tool)

        staff_token = get_token(client, "STF001", "Staff@123")
        res = client.delete(f"/api/tools/{tool.id}", headers=auth(staff_token))
        assert res.status_code == 403

    def test_write_off_sets_status_and_zeroes_qty(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("WO2"), name="Write-Off Test", tool_type="general",
                    is_consumable=False, total_quantity=1, available_quantity=1, status="damaged")
        db.add(tool)
        db.commit()
        db.refresh(tool)

        admin_token = get_token(client, "ADM001", "Admin@123")
        res = client.delete(f"/api/tools/{tool.id}", headers=auth(admin_token))
        assert res.status_code == 200

        db.refresh(tool)
        assert tool.status == "written_off"
        assert tool.total_quantity == 0
        assert tool.available_quantity == 0

    def test_active_tool_cannot_be_written_off(self, client, db):
        from app.models.master import Tool
        tool = Tool(tool_code=_unique("WO3"), name="Active Write-Off", tool_type="general",
                    is_consumable=False, total_quantity=2, available_quantity=2, status="active")
        db.add(tool)
        db.commit()
        db.refresh(tool)

        admin_token = get_token(client, "ADM001", "Admin@123")
        res = client.delete(f"/api/tools/{tool.id}", headers=auth(admin_token))
        assert res.status_code == 400
