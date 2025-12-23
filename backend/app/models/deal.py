import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from app.core.database import Base, TimestampMixin

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

class Deal(Base, TimestampMixin):
    __tablename__ = "crm_deals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    
    name = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    status = Column(String, default="new")  # Dynamic status using Stage slugs
    value = Column(Float, default=0.0)
    priority = Column(Enum(DealPriority), default=DealPriority.MEDIUM)
