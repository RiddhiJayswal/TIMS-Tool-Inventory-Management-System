"""
Unit tests for core business logic services.
Run with: python -m pytest tests/test_services.py -v
"""
from decimal import Decimal

import pytest


def test_depreciation_basic():
    from app.services.depreciation import calculate_current_value
    from datetime import date

    # Tool bought 12 months ago for ₹12000, life 24 months
    # Expected: 12000 - (12 * 500) = 6000
    purchase_date = date(date.today().year - 1, date.today().month, 1)
    result = calculate_current_value(12000, purchase_date, 24)
    assert result == Decimal("6000.00"), f"Got {result}"


def test_depreciation_floor():
    from app.services.depreciation import calculate_current_value
    from datetime import date

    # Tool expired 10 years ago — should return 0, not negative
    purchase_date = date(2010, 1, 1)
    result = calculate_current_value(5000, purchase_date, 12)
    assert result == Decimal("0"), f"Got {result}"


def test_depreciation_returns_none_when_missing_data():
    from app.services.depreciation import calculate_current_value

    assert calculate_current_value(None, None, None) is None
    assert calculate_current_value(5000, None, 24) is None
    assert calculate_current_value(None, None, 24) is None


def test_penalty_theft_requires_market_rate():
    from app.services.depreciation import calculate_penalty

    try:
        calculate_penalty("theft", Decimal("5000"), None)
        assert False, "Should have raised ValueError"
    except ValueError:
        pass


def test_penalty_wear_and_tear_is_zero():
    from app.services.depreciation import calculate_penalty

    result = calculate_penalty("wear_and_tear", Decimal("5000"))
    assert result == Decimal("0")


def test_penalty_mishandling_uses_snapshot():
    from app.services.depreciation import calculate_penalty

    result = calculate_penalty("mishandling", Decimal("3500.00"))
    assert result == Decimal("3500.00")


def test_penalty_theft_with_market_rate():
    from app.services.depreciation import calculate_penalty

    result = calculate_penalty("theft", Decimal("5000"), market_rate=8500.00)
    assert result == Decimal("8500.00")


def test_penalty_mishandling_none_snapshot_returns_zero():
    from app.services.depreciation import calculate_penalty

    result = calculate_penalty("mishandling", None)
    assert result == Decimal("0")


def test_penalty_unknown_type_raises():
    from app.services.depreciation import calculate_penalty

    try:
        calculate_penalty("accidental", Decimal("1000"))
        assert False, "Should have raised ValueError"
    except ValueError:
        pass


def test_validate_consumable_return_partial_allowed():
    from app.services.stock import validate_consumable_return
    from unittest.mock import MagicMock

    tool = MagicMock()
    tool.name = "Welding Rod"
    tool.is_consumable = True

    consumed = validate_consumable_return(tool, quantity_issued=10, quantity_returned=6)
    assert consumed == 4


def test_get_tool_locked_requests_database_row_lock():
    from unittest.mock import MagicMock

    from app.models.master import Tool
    from app.services.stock import get_tool_locked

    tool = MagicMock(spec=Tool)
    query = MagicMock()
    query.filter.return_value = query
    query.with_for_update.return_value = query
    query.first.return_value = tool
    db = MagicMock()
    db.query.return_value = query

    assert get_tool_locked(db, "tool-id") is tool
    query.with_for_update.assert_called_once_with()


def test_damage_return_quantities_are_validated_by_schema_breakdown():
    from app.services.stock import validate_damage_return

    validate_damage_return(3, 3, "damaged")
    validate_damage_return(3, 0, "missing")
    validate_damage_return(3, 1, "damaged")
    validate_damage_return(3, 1, "missing")


def test_tool_visibility_scopes_non_maintenance_queries():
    from types import SimpleNamespace
    from unittest.mock import MagicMock

    from app.services.tool_visibility import scope_tools_for_user

    query = MagicMock()
    query.filter.return_value = query
    requester = SimpleNamespace(role="requester", department="E&I")
    assert scope_tools_for_user(query, requester) is query
    query.filter.assert_called_once()

    maintenance_query = MagicMock()
    staff = SimpleNamespace(role="maintenance_staff", department="Maintenance")
    assert scope_tools_for_user(maintenance_query, staff) is maintenance_query
    maintenance_query.filter.assert_not_called()


def test_period_availability_subtracts_only_overlaps_and_pending_damage():
    from types import SimpleNamespace
    from unittest.mock import MagicMock, patch
    from uuid import uuid4

    from app.routers.requisitions import _period_availability

    tool = SimpleNamespace(id=uuid4(), total_quantity=8)
    with (
        patch("app.routers.requisitions._overlapping_issue_quantity", return_value=3),
        patch(
            "app.routers.requisitions.get_pending_damage_by_tool",
            return_value={tool.id: 1},
        ),
        patch("app.routers.requisitions.get_period_reserved_quantity", return_value=2),
    ):
        result = _period_availability(MagicMock(), tool, None, None)

    assert result["overlapping_issued_quantity"] == 3
    assert result["pending_damage_quantity"] == 1
    assert result["reserved_quantity"] == 2
    assert result["available_quantity"] == 2


def test_validate_consumable_return_full_return():
    from app.services.stock import validate_consumable_return
    from unittest.mock import MagicMock

    tool = MagicMock()
    tool.is_consumable = True

    consumed = validate_consumable_return(tool, quantity_issued=5, quantity_returned=5)
    assert consumed == 0


def test_validate_non_consumable_partial_return_allowed():
    from app.services.stock import validate_consumable_return
    from unittest.mock import MagicMock

    tool = MagicMock()
    tool.name = "Torque Wrench"
    tool.is_consumable = False

    consumed = validate_consumable_return(tool, quantity_issued=2, quantity_returned=1)
    assert consumed == 1


def test_return_breakdown_parser_counts_damaged_and_missing():
    from app.services.stock import _return_breakdown

    notes = 'RETURN_BREAKDOWN:{"good":4,"damaged":1,"missing":0}\nHandle cracked'
    assert _return_breakdown(notes) == {"good": 4, "damaged": 1, "missing": 0}


def test_requisition_create_rejects_past_from_date():
    from datetime import date, timedelta
    from pydantic import ValidationError
    from uuid import uuid4
    from app.schemas.requisition import RequisitionCreate

    try:
        RequisitionCreate(
            tool_id=uuid4(),
            quantity_requested=1,
            purpose_of_job="Valid job purpose",
            from_date=date.today() - timedelta(days=1),
            to_date=date.today(),
        )
        assert False, "Should have raised ValidationError"
    except ValidationError as exc:
        assert "from_date cannot be in the past" in str(exc)


def test_snapshot_value_at_issuance_matches_current_value():
    from app.services.depreciation import calculate_current_value, snapshot_value_at_issuance
    from datetime import date

    purchase_date = date(date.today().year - 1, date.today().month, 1)
    v1 = calculate_current_value(10000, purchase_date, 36)
    v2 = snapshot_value_at_issuance(10000, purchase_date, 36)
    assert v1 == v2


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("purchase_price", -1),
        ("purchase_price", "10000000000.00"),
        ("standard_life_months", 0),
        ("calibration_freq_days", 0),
        ("calibration_freq_days", 36501),
    ],
)
def test_tool_create_rejects_invalid_financial_and_calibration_values(field, value):
    from pydantic import ValidationError

    from app.schemas.tool import ToolCreate

    payload = {
        "tool_code": "TL-VALIDATION",
        "name": "Validation Tool",
        "tool_type": "general",
        "total_quantity": 1,
        field: value,
    }
    with pytest.raises(ValidationError):
        ToolCreate(**payload)


def test_requisition_number_takes_postgres_transaction_lock():
    from types import SimpleNamespace
    from unittest.mock import MagicMock

    from app.services.requisition_number import generate_requisition_number

    db = MagicMock()
    db.get_bind.return_value = SimpleNamespace(dialect=SimpleNamespace(name="postgresql"))
    query = db.query.return_value
    query.filter.return_value = query
    query.order_by.return_value = query
    query.first.return_value = None

    number = generate_requisition_number(db)

    assert number.endswith("-0001")
    db.execute.assert_called_once()


def test_calibration_due_rejects_date_overflow():
    from datetime import date
    from fastapi import HTTPException

    from app.routers.tools import _calculate_calibration_due

    with pytest.raises(HTTPException) as exc:
        _calculate_calibration_due(date.max, 1)

    assert exc.value.status_code == 422


def test_disabling_calibration_clears_schedule_and_unblocks_tool():
    from datetime import date
    from types import SimpleNamespace

    from app.routers.tools import _sync_calibration_fields

    tool = SimpleNamespace(
        requires_calibration=False,
        calibration_freq_days=180,
        last_calibration_date=date.today(),
        next_calibration_due=date.today(),
        status="calibration_due",
    )

    _sync_calibration_fields(tool, {"requires_calibration"})

    assert tool.calibration_freq_days is None
    assert tool.last_calibration_date is None
    assert tool.next_calibration_due is None
    assert tool.status == "active"


def test_depleted_consumable_becomes_out_of_stock_not_written_off():
    from types import SimpleNamespace
    from unittest.mock import MagicMock, patch

    from app.services.stock import consume_stock

    tool = SimpleNamespace(
        total_quantity=3,
        available_quantity=0,
        is_consumable=True,
        status="active",
    )
    db = MagicMock()
    with patch("app.services.stock.get_tool_locked", return_value=tool):
        consume_stock(db, "tool-id", 3)

    assert tool.total_quantity == 0
    assert tool.available_quantity == 0
    assert tool.status == "out_of_stock"


def test_writeoff_requires_damaged_durable_tool():
    from types import SimpleNamespace
    from fastapi import HTTPException

    from app.services.stock import validate_writeoff_eligibility

    validate_writeoff_eligibility(SimpleNamespace(is_consumable=False, status="damaged"))

    for tool in (
        SimpleNamespace(is_consumable=True, status="damaged"),
        SimpleNamespace(is_consumable=False, status="active"),
    ):
        with pytest.raises(HTTPException) as exc:
            validate_writeoff_eligibility(tool)
        assert exc.value.status_code == 400


def test_tool_update_cannot_override_derived_lifecycle_fields():
    from pydantic import ValidationError

    from app.schemas.tool import ToolUpdate

    with pytest.raises(ValidationError):
        ToolUpdate(status="active", name="Renamed")
    with pytest.raises(ValidationError):
        ToolUpdate(next_calibration_due="2099-01-01", name="Renamed")


def test_scheduler_does_not_change_terminal_tool_statuses(monkeypatch):
    from datetime import date, timedelta
    from types import SimpleNamespace
    from unittest.mock import MagicMock

    from app import scheduler as scheduler_module
    from app.models.master import Tool

    terminal_tools = [
        SimpleNamespace(
            status=status,
            requires_calibration=True,
            next_calibration_due=date.today() - timedelta(days=1),
        )
        for status in ("damaged", "written_off", "blocked", "out_of_stock")
    ]
    db = MagicMock()

    def query(model):
        result = MagicMock()
        result.filter.return_value = result
        result.all.return_value = terminal_tools if model is Tool else []
        return result

    db.query.side_effect = query
    monkeypatch.setattr(scheduler_module, "SessionLocal", lambda: db)

    scheduler_module.run_calibration_check()

    assert [tool.status for tool in terminal_tools] == [
        "damaged",
        "written_off",
        "blocked",
        "out_of_stock",
    ]
