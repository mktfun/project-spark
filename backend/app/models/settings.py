from sqlalchemy import Column, Integer, String, Text, Boolean
from app.core.database import Base, TimestampMixin

class UserSettings(Base, TimestampMixin):
    __tablename__ = "crm_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    user_email = Column(String, unique=True, index=True)
    
    # AI Provider Configs
    ai_provider = Column(String, default="openai")
    ai_api_key = Column(Text, nullable=True)  # TODO: Encrypt with pycryptodome
    ai_model = Column(String, default="gpt-4o")

    # Chatwoot Configs
    chatwoot_account_id = Column(Integer, nullable=True, index=True)
    chatwoot_user_token = Column(String, nullable=True)
    chatwoot_api_key = Column(String, nullable=True)  # TODO: Encrypt with pycryptodome
    chatwoot_webhook_secret = Column(String, nullable=True)  # TODO: Encrypt with pycryptodome
    chatwoot_url = Column(String, nullable=True)
    
    # Toggles
    auto_create_opportunity = Column(Boolean, default=True)
    require_interest_tag = Column(Boolean, default=False)
