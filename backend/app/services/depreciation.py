"""
Depreciation service.
Formula: monthly_dep = purchase_price / standard_life_months
         current_value = purchase_price - (months_elapsed × monthly_dep)
         Floor at 0 — value never goes negative.
"""

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


def calculate_current_value(
    purchase_price: Optional[float],
    purchase_date: Optional[date],
    standard_life_months: Optional[int]
) -> Optional[Decimal]:
    """
    Returns current depreciated value of a tool.
    Returns None if any input is missing (tool has no financial data).
    """
    if not purchase_price or not purchase_date or not standard_life_months:
        return None

    today = date.today()
    months_elapsed = (today.year - purchase_date.year) * 12 + (today.month - purchase_date.month)
    months_elapsed = max(0, months_elapsed)

    price = Decimal(str(purchase_price))
    life = Decimal(str(standard_life_months))
    monthly_dep = price / life

    value = price - (Decimal(str(months_elapsed)) * monthly_dep)
    return max(Decimal("0"), value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def snapshot_value_at_issuance(
    purchase_price: Optional[float],
    purchase_date: Optional[date],
    standard_life_months: Optional[int]
) -> Optional[Decimal]:
    """
    Identical to calculate_current_value but semantically named for issuance snapshotting.
    Always call this at issuance time and store in issuance_logs.depreciated_value_at_issue.
    This value is used for mishandling penalty calculation.
    """
    return calculate_current_value(purchase_price, purchase_date, standard_life_months)


def calculate_penalty(
    damage_type: str,
    depreciated_value_at_issue: Optional[Decimal],
    market_rate: Optional[float] = None
) -> Decimal:
    """
    Calculates penalty amount based on damage type:
    - theft         → market_rate (admin must provide this manually)
    - mishandling   → depreciated_value_at_issue
    - wear_and_tear → 0 (write off, no penalty)

    Raises ValueError if theft but no market_rate provided.
    """
    if damage_type == "wear_and_tear":
        return Decimal("0")

    if damage_type == "theft":
        if market_rate is None:
            raise ValueError("Market rate required for theft penalty calculation")
        return Decimal(str(market_rate)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    if damage_type == "mishandling":
        if depreciated_value_at_issue is None:
            return Decimal("0")
        return depreciated_value_at_issue

    raise ValueError(f"Unknown damage_type: {damage_type}")
