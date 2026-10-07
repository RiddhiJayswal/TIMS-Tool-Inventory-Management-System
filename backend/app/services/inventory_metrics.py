from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.master import StorageBin, Tool


def bin_unit_count(db: Session, bin_id: UUID) -> int:
    return sum(
        int(tool.total_quantity or 0)
        for tool in db.query(Tool).filter(Tool.storage_bin_id == bin_id).all()
    )


def format_capacity_note(capacity: int | None, used_units: int) -> str:
    if capacity is None:
        return "Capacity is not limited"
    return f"{max(capacity - used_units, 0)} units remaining"


def estimate_restock_cost(tools: list[Tool]) -> Decimal:
    estimated_cost = Decimal("0")
    for tool in tools:
        if tool.available_quantity < 5 and tool.purchase_price is not None:
            shortage = max(5 - tool.available_quantity, 0)
            estimated_cost += Decimal(str(tool.purchase_price)) * shortage
    return estimated_cost.quantize(Decimal("0.01"))


def build_inventory_digest(db: Session) -> dict:
    bins = db.query(StorageBin).all()
    inventoryCount = 0
    total_units = 0
    lowStock = []
    capacity_warnings = []
    department_totals = {}
    restock_value = Decimal("0")

    for storage_bin in bins:
        tools = db.query(Tool).filter(Tool.storage_bin_id == storage_bin.id).all()
        used_units = sum(int(tool.total_quantity or 0) for tool in tools)
        inventoryCount += len(tools)
        total_units += used_units

        if storage_bin.capacity is not None and storage_bin.capacity > 0:
            utilization = used_units / storage_bin.capacity
            if utilization >= 0.8:
                capacity_warnings.append({
                    "bin_code": storage_bin.bin_code,
                    "utilization": round(utilization * 100, 1),
                })

        for tool in tools:
            department = tool.department_access or "Shared"
            department_totals[department] = department_totals.get(department, 0) + int(tool.total_quantity or 0)
            if tool.available_quantity < 5:
                lowStock.append({
                    "tool_code": tool.tool_code,
                    "available": tool.available_quantity,
                    "bin_code": storage_bin.bin_code,
                })
            if tool.purchase_price is not None:
                restock_value += Decimal(str(tool.purchase_price)) * max(5 - tool.available_quantity, 0)

    return {
        "inventory_count": inventoryCount,
        "total_units": total_units,
        "low_stock": lowStock,
        "capacity_warnings": capacity_warnings,
        "department_totals": department_totals,
        "estimated_restock_value": str(restock_value.quantize(Decimal("0.01"))),
    }
