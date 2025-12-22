from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class UserSettings(Base):
    __tablename__ = "crm_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True) # ID from Chatwoot
    user_email = Column(String, unique=True, index=True)
    
    # AI Provider Configs
    ai_provider = Column(String, default="openai") # openai, anthropic, groq
    ai_api_key = Column(Text, nullable=True) # Encrypted
    ai_model = Column(String, default="gpt-4o")
    
    # Toggles
    auto_create_opportunity = Column(Boolean, default=True)
    require_interest_tag = Column(Boolean, default=False)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
