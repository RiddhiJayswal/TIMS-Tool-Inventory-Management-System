from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class DamageAssessment(BaseModel):
    damage_type: Literal["theft", "mishandling", "wear_and_tear"]
    market_rate_at_damage: Optional[float] = Field(default=None, gt=0)
    notes: Optional[str] = None

    @model_validator(mode="after")
    def theft_requires_market_rate(self) -> "DamageAssessment":
        if self.damage_type == "theft" and self.market_rate_at_damage is None:
            raise ValueError("market_rate_at_damage is required when damage_type is 'theft'")
        return self


class WriteOffPayload(BaseModel):
    reason: str
    quantity: int = Field(default=1, ge=1)
