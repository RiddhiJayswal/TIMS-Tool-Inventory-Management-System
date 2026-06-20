from pydantic import BaseModel, Field, condecimal
from typing import Optional, Literal
from datetime import date
from uuid import UUID

Money = condecimal(ge=0, max_digits=12, decimal_places=2)


class ToolCreate(BaseModel):
    tool_code: str
    name: str
    category: Optional[str] = None
    tool_type: Literal["general", "specialized"]
    department_access: Optional[str] = None
    is_consumable: bool = False
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Money] = None
    standard_life_months: Optional[int] = Field(default=None, gt=0)
    total_quantity: int = Field(ge=0)
    storage_bin_id: Optional[UUID] = None
    requires_calibration: bool = False
    calibration_freq_days: Optional[int] = Field(default=None, gt=0, le=36500)
    last_calibration_date: Optional[date] = None
    service_partner: Optional[str] = None


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    department_access: Optional[str] = None
    is_consumable: Optional[bool] = None
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Money] = None
    standard_life_months: Optional[int] = Field(default=None, gt=0)
    total_quantity: Optional[int] = Field(default=None, ge=0)
    storage_bin_id: Optional[UUID] = None
    requires_calibration: Optional[bool] = None
    calibration_freq_days: Optional[int] = Field(default=None, gt=0, le=36500)
    last_calibration_date: Optional[date] = None
    next_calibration_due: Optional[date] = None
    service_partner: Optional[str] = None
    status: Optional[str] = None
