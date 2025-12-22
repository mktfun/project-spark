from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class DealStatus(str, Enum):
    NEW = "new"
    CONTACT = "contact"
    PROPOSAL = "proposal"
    WON = "won"
    LOST = "lost"

class DealPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class DealBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: DealStatus = DealStatus.NEW
    value: float = 0.0
    priority: DealPriority = DealPriority.MEDIUM

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[DealStatus] = None
    value: Optional[float] = None
    priority: Optional[DealPriority] = None

class DealResponse(DealBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
