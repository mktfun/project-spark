from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Stage(Base):
    __tablename__ = "crm_stages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False) # Maps to Chatwoot Label
    color = Column(String, default="bg-slate-500") # Tailwind class or Hex
    order = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
