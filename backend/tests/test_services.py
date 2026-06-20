"""
Unit tests for core business logic services.
Run with: python -m pytest tests/test_services.py -v
"""
from decimal import Decimal


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
