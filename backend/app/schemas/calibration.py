from datetime import date
from typing import Optional

from pydantic import BaseModel


class CalibrationRecord(BaseModel):
    calibration_date: date
    service_partner: Optional[str] = None
    notes: Optional[str] = None
