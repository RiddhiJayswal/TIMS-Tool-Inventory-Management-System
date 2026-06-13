from pydantic import BaseModel
from typing import Optional


class StorageBinCreate(BaseModel):
    bin_code: str
    shelf_label: str
    section: Optional[str] = None
    department_cat: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None


class StorageBinUpdate(BaseModel):
    shelf_label: Optional[str] = None
    section: Optional[str] = None
    department_cat: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
