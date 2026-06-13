from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID


class IssuanceCreate(BaseModel):
    requisition_id: UUID
    notes: Optional[str] = None


class ReturnCreate(BaseModel):
    quantity_returned: int = Field(ge=0)
    return_condition: Literal["good", "damaged", "missing", "partial"]
    notes: Optional[str] = None
