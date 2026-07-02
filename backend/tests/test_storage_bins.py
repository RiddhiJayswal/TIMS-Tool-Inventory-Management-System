"""
Storage bin management integration tests — TIMS.
Covers: CRUD, duplicate code prevention, capacity enforcement,
tool count scoping, tool-bin relationship, department visibility.

Run: cd backend && python -m pytest tests/test_storage_bins.py -v --tb=short
"""
import uuid

import pytest

# ── helpers ──────────────────────────────────────────────────────────────────

def get_token(client, employee_id, password):
    res = client.post("/api/auth/login", data={"username": employee_id, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def _unique(prefix="BIN"):
    return f"{prefix}-{uuid.uuid4().hex[:6].upper()}"

def _make_bin_payload(**overrides):
    base = {
        "bin_code": _unique(),
        "shelf_label": "Test Shelf Alpha",
    }
    base.update(overrides)
    return base


# ═══════════════════════════════════════════════════════════════════════════════
# CREATE BIN
# ═══════════════════════════════════════════════════════════════════════════════

class TestCreateBin:

    def test_admin_can_create_bin(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_bin_payload()
        res = client.post("/api/storage-bins", json=payload, headers=auth(token))
        assert res.status_code == 201, res.text
        data = res.json()
        assert data["bin_code"] == payload["bin_code"]
        assert data["shelf_label"] == payload["shelf_label"]
        assert data["tool_count"] == 0
        assert data["used_units"] == 0

    def test_staff_can_create_bin(self, client):
        token = get_token(client, "STF001", "Staff@123")
        res = client.post("/api/storage-bins", json=_make_bin_payload(), headers=auth(token))
        assert res.status_code == 201

    def test_requester_cannot_create_bin(self, client):
        token = get_token(client, "USR001", "User@123")
        res = client.post("/api/storage-bins", json=_make_bin_payload(), headers=auth(token))
        assert res.status_code == 403

    def test_head_cannot_create_bin(self, client):
        token = get_token(client, "HD001", "Head@123")
        res = client.post("/api/storage-bins", json=_make_bin_payload(), headers=auth(token))
        assert res.status_code == 403

    def test_duplicate_bin_code_rejected(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_bin_payload()
        client.post("/api/storage-bins", json=payload, headers=auth(token))
        second = client.post("/api/storage-bins", json=payload, headers=auth(token))
        assert second.status_code == 400
        assert "already exists" in second.json()["detail"].lower()

    def test_missing_shelf_label_returns_422(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/storage-bins", json={"bin_code": _unique()}, headers=auth(token))
        assert res.status_code == 422

    def test_missing_bin_code_returns_422(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/storage-bins", json={"shelf_label": "No Code"}, headers=auth(token))
        assert res.status_code == 422

    def test_bin_with_capacity_shows_remaining(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/storage-bins", json=_make_bin_payload(capacity=10), headers=auth(token))
        assert res.status_code == 201
        data = res.json()
        assert data["capacity"] == 10
        assert data["remaining_capacity"] == 10

    def test_bin_all_optional_fields_accepted(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        payload = _make_bin_payload(
            section="Section A",
            department_cat="Maintenance",
            row_label="Row 3",
            rack_number="Rack 07",
            shelf_level="Level 2",
            floor_area="Area B",
            description="Primary tool storage for E&I department",
            capacity=50,
        )
        res = client.post("/api/storage-bins", json=payload, headers=auth(token))
        assert res.status_code == 201
        data = res.json()
        assert data["section"] == "Section A"
        assert data["capacity"] == 50

    def test_unauthenticated_create_rejected(self, client):
        res = client.post("/api/storage-bins", json=_make_bin_payload())
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════════
# LIST BINS
# ═══════════════════════════════════════════════════════════════════════════════

class TestListBins:

    def test_all_roles_can_list_bins(self, client):
        roles = [
            ("ADM001", "Admin@123"),
            ("STF001", "Staff@123"),
            ("HD001", "Head@123"),
            ("USR001", "User@123"),
        ]
        for emp, pwd in roles:
            token = get_token(client, emp, pwd)
            res = client.get("/api/storage-bins", headers=auth(token))
            assert res.status_code == 200, f"List bins failed for {emp}"
            assert isinstance(res.json(), list)

    def test_bin_list_includes_tool_count(self, client, db):
        from app.models.master import StorageBin, Tool

        bin_ = StorageBin(bin_code=_unique("LC"), shelf_label="List Count Shelf")
        db.add(bin_)
        db.commit()
        db.refresh(bin_)

        tool = Tool(tool_code=_unique("LCT"), name="List Count Tool",
                    tool_type="general", is_consumable=False,
                    total_quantity=2, available_quantity=2,
                    storage_bin_id=bin_.id)
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        bins = client.get("/api/storage-bins", headers=auth(token)).json()
        target = next((b for b in bins if b["id"] == str(bin_.id)), None)
        assert target is not None
        assert target["tool_count"] == 1
        assert target["used_units"] == 2

    def test_requester_tool_count_excludes_other_dept_tools(self, client, db):
        from app.models.master import StorageBin, Tool

        bin_ = StorageBin(bin_code=_unique("SC"), shelf_label="Scope Shelf")
        db.add(bin_)
        db.commit()
        db.refresh(bin_)

        ei_tool = Tool(tool_code=_unique("EI"), name="EI Tool", tool_type="specialized",
                       department_access="E&I", is_consumable=False,
                       total_quantity=1, available_quantity=1, storage_bin_id=bin_.id)
        mech_tool = Tool(tool_code=_unique("MC"), name="Mech Tool", tool_type="specialized",
                         department_access="Mechanical", is_consumable=False,
                         total_quantity=1, available_quantity=1, storage_bin_id=bin_.id)
        db.add_all([ei_tool, mech_tool])
        db.commit()

        user_token = get_token(client, "USR001", "User@123")  # E&I department
        bins = client.get("/api/storage-bins", headers=auth(user_token)).json()
        target = next((b for b in bins if b["id"] == str(bin_.id)), None)
        assert target is not None
        assert target["tool_count"] == 1  # only E&I tool visible to requester


# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE BIN
# ═══════════════════════════════════════════════════════════════════════════════

class TestUpdateBin:

    def _create_bin(self, client, **overrides):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.post("/api/storage-bins", json=_make_bin_payload(**overrides), headers=auth(token))
        assert res.status_code == 201
        return res.json(), token

    def test_admin_can_update_shelf_label(self, client):
        bin_, token = self._create_bin(client)
        res = client.put(f"/api/storage-bins/{bin_['id']}", json={"shelf_label": "New Label"}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["shelf_label"] == "New Label"

    def test_staff_can_update_bin(self, client):
        bin_, _ = self._create_bin(client)
        stf_token = get_token(client, "STF001", "Staff@123")
        res = client.put(f"/api/storage-bins/{bin_['id']}", json={"description": "Updated desc"}, headers=auth(stf_token))
        assert res.status_code == 200

    def test_requester_cannot_update_bin(self, client):
        bin_, _ = self._create_bin(client)
        token = get_token(client, "USR001", "User@123")
        res = client.put(f"/api/storage-bins/{bin_['id']}", json={"shelf_label": "Hacked"}, headers=auth(token))
        assert res.status_code == 403

    def test_update_nonexistent_bin_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/storage-bins/{uuid.uuid4()}", json={"shelf_label": "Ghost"}, headers=auth(token))
        assert res.status_code == 404

    def test_capacity_cannot_be_reduced_below_used_units(self, client, db):
        from app.models.master import StorageBin, Tool

        bin_ = StorageBin(bin_code=_unique("CAP"), shelf_label="Cap Shelf", capacity=5)
        db.add(bin_)
        db.commit()
        db.refresh(bin_)

        tool = Tool(tool_code=_unique("CT"), name="Capacity Tool", tool_type="general",
                    is_consumable=False, total_quantity=4, available_quantity=4,
                    storage_bin_id=bin_.id)
        db.add(tool)
        db.commit()

        token = get_token(client, "ADM001", "Admin@123")
        res = client.put(f"/api/storage-bins/{bin_.id}", json={"capacity": 2}, headers=auth(token))
        assert res.status_code == 400
        assert "capacity" in res.json()["detail"].lower()

    def test_capacity_can_be_increased(self, client):
        bin_, token = self._create_bin(client, capacity=5)
        res = client.put(f"/api/storage-bins/{bin_['id']}", json={"capacity": 10}, headers=auth(token))
        assert res.status_code == 200
        assert res.json()["capacity"] == 10


# ═══════════════════════════════════════════════════════════════════════════════
# BIN TOOLS ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

class TestBinTools:

    def test_get_tools_in_bin(self, client, db):
        from app.models.master import StorageBin, Tool

        bin_ = StorageBin(bin_code=_unique("BT"), shelf_label="Tools Bin Shelf")
        db.add(bin_)
        db.commit()
        db.refresh(bin_)

        tool = Tool(tool_code=_unique("BTT"), name="Bin Tool", tool_type="general",
                    is_consumable=False, total_quantity=1, available_quantity=1,
                    storage_bin_id=bin_.id)
        db.add(tool)
        db.commit()
        db.refresh(tool)

        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/storage-bins/{bin_.id}/tools", headers=auth(token))
        assert res.status_code == 200
        ids = [t["id"] for t in res.json()]
        assert str(tool.id) in ids

    def test_bin_tools_scoped_for_requester(self, client, db):
        from app.models.master import StorageBin, Tool

        bin_ = StorageBin(bin_code=_unique("SC2"), shelf_label="Scope Bin Shelf")
        db.add(bin_)
        db.commit()
        db.refresh(bin_)

        ei_tool = Tool(tool_code=_unique("EI2"), name="EI Bin Tool", tool_type="specialized",
                       department_access="E&I", is_consumable=False,
                       total_quantity=1, available_quantity=1, storage_bin_id=bin_.id)
        mech_tool = Tool(tool_code=_unique("MC2"), name="Mech Bin Tool", tool_type="specialized",
                         department_access="Mechanical", is_consumable=False,
                         total_quantity=1, available_quantity=1, storage_bin_id=bin_.id)
        db.add_all([ei_tool, mech_tool])
        db.commit()

        user_token = get_token(client, "USR001", "User@123")
        res = client.get(f"/api/storage-bins/{bin_.id}/tools", headers=auth(user_token))
        assert res.status_code == 200
        ids = {t["id"] for t in res.json()}
        assert str(ei_tool.id) in ids
        assert str(mech_tool.id) not in ids

    def test_nonexistent_bin_tools_returns_404(self, client):
        token = get_token(client, "ADM001", "Admin@123")
        res = client.get(f"/api/storage-bins/{uuid.uuid4()}/tools", headers=auth(token))
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════════
# BIN CAPACITY INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

class TestBinCapacityIntegration:

    def test_tool_exceeding_bin_capacity_rejected_on_create(self, client):
        admin_token = get_token(client, "ADM001", "Admin@123")

        bin_res = client.post(
            "/api/storage-bins",
            json={"bin_code": _unique("CAPX"), "shelf_label": "Capacity Test", "capacity": 3},
            headers=auth(admin_token),
        )
        assert bin_res.status_code == 201
        bin_id = bin_res.json()["id"]

        tool_res = client.post(
            "/api/tools",
            json={
                "tool_code": _unique("CEXT"),
                "name": "Capacity Exceeded Tool",
                "tool_type": "general",
                "is_consumable": False,
                "total_quantity": 5,
                "storage_bin_id": bin_id,
            },
            headers=auth(admin_token),
        )
        assert tool_res.status_code == 400
        assert "capacity" in tool_res.json()["detail"].lower()

    def test_tool_within_bin_capacity_accepted(self, client):
        admin_token = get_token(client, "ADM001", "Admin@123")

        bin_res = client.post(
            "/api/storage-bins",
            json={"bin_code": _unique("CAPY"), "shelf_label": "OK Capacity", "capacity": 10},
            headers=auth(admin_token),
        )
        assert bin_res.status_code == 201
        bin_id = bin_res.json()["id"]

        tool_res = client.post(
            "/api/tools",
            json={
                "tool_code": _unique("CWTH"),
                "name": "Within Capacity Tool",
                "tool_type": "general",
                "is_consumable": False,
                "total_quantity": 3,
                "storage_bin_id": bin_id,
            },
            headers=auth(admin_token),
        )
        assert tool_res.status_code == 201
