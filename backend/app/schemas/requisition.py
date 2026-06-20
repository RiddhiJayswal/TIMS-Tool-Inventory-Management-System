from pydantic import BaseModel, Field, model_validator
from datetime import date
from uuid import UUID
from typing import Optional


class RequisitionCreate(BaseModel):
    tool_id: UUID
    quantity_requested: int = Field(gt=0)
    purpose_of_job: str = Field(min_length=5)
    from_date: date
    to_date: date

    @model_validator(mode="after")
    def validate_dates(self) -> "RequisitionCreate":
        today = date.today()
        if self.from_date < today:
            raise ValueError("from_date cannot be in the past")
        if self.to_date < self.from_date:
            raise ValueError("to_date must be after or equal to from_date")
        return self


class RejectPayload(BaseModel):
    reason: str = Field(min_length=3)
