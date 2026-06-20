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


def test_damage_return_must_account_for_entire_issuance():
    from fastapi import HTTPException

    from app.services.stock import validate_damage_return

    validate_damage_return(3, 3, "damaged")
    validate_damage_return(3, 0, "missing")

    for issued, returned, condition in ((3, 1, "damaged"), (3, 1, "missing")):
        try:
            validate_damage_return(issued, returned, condition)
            assert False, f"Expected {condition} quantity validation to fail"
        except HTTPException as exc:
            assert exc.status_code == 400


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
    ):
        result = _period_availability(MagicMock(), tool, None, None)

    assert result["overlapping_issued_quantity"] == 3
    assert result["pending_damage_quantity"] == 1
    assert result["available_quantity"] == 4


def test_validate_consumable_return_full_return():
    from app.services.stock import validate_consumable_return
    from unittest.mock import MagicMock

    tool = MagicMock()
    tool.is_consumable = True

    consumed = validate_consumable_return(tool, quantity_issued=5, quantity_returned=5)
    assert consumed == 0


def test_validate_non_consumable_partial_return_raises():
    from app.services.stock import validate_consumable_return
    from unittest.mock import MagicMock
    from fastapi import HTTPException

    tool = MagicMock()
    tool.name = "Torque Wrench"
    tool.is_consumable = False

    try:
        validate_consumable_return(tool, quantity_issued=2, quantity_returned=1)
        assert False, "Should have raised HTTPException"
    except HTTPException as e:
        assert e.status_code == 400


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
