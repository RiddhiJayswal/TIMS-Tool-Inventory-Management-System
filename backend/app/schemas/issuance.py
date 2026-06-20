from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal
from uuid import UUID


class IssuanceCreate(BaseModel):
    requisition_id: UUID
    notes: Optional[str] = None


class ReturnCreate(BaseModel):
    quantity_returned: int = Field(ge=0)
    return_condition: Literal["good", "damaged", "missing", "partial"]
    condition_quantities: Optional[dict[Literal["good", "damaged", "missing"], int]] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_condition_quantities(self) -> "ReturnCreate":
        if self.condition_quantities is None:
            return self
        total = 0
        for condition, quantity in self.condition_quantities.items():
            if quantity < 0:
                raise ValueError(f"{condition} quantity cannot be negative")
            total += quantity
        if total != self.quantity_returned:
            raise ValueError("Condition quantities must add up to quantity_returned")
        if self.return_condition == "good" and any(
            self.condition_quantities.get(k, 0) for k in ("damaged", "missing")
        ):
            raise ValueError("Good returns cannot include damaged or missing quantities")
        return self
