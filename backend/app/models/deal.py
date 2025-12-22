import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class DealStatus(str, enum.Enum):
    NEW = "new"
    CONTACT = "contact"
    PROPOSAL = "proposal"
    WON = "won"
    LOST = "lost"

class DealPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Deal(Base):
    __tablename__ = "crm_deals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False) # Not FK to separate auth table, but logically linked
    
    name = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    status = Column(Enum(DealStatus), default=DealStatus.NEW)
    value = Column(Float, default=0.0)
    priority = Column(Enum(DealPriority), default=DealPriority.MEDIUM)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
