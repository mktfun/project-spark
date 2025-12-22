from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.settings import UserSettings
from app.core.security import encrypt_value, decrypt_value
from typing import Optional

router = APIRouter()

class SettingsUpdate(BaseModel):
    user_id: int
    ai_provider: str
    ai_api_key: Optional[str] = None
    ai_model: str
    auto_create_opportunity: bool
    require_interest_tag: bool

class SettingsResponse(BaseModel):
    ai_provider: str
    ai_model: str
    auto_create_opportunity: bool
    require_interest_tag: bool
    # Never return API Key directly
    is_api_key_set: bool 

@router.get("/{user_id}", response_model=SettingsResponse)
def get_settings(user_id: int, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        # Return defaults
        return {
            "ai_provider": "openai",
            "ai_model": "gpt-4o",
            "auto_create_opportunity": True,
            "require_interest_tag": False,
            "is_api_key_set": False
        }
    
    return {
        "ai_provider": settings.ai_provider,
        "ai_model": settings.ai_model,
        "auto_create_opportunity": settings.auto_create_opportunity,
        "require_interest_tag": settings.require_interest_tag,
        "is_api_key_set": settings.ai_api_key is not None
    }

@router.put("/")
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == data.user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=data.user_id)
        db.add(settings)
    
    settings.ai_provider = data.ai_provider
    settings.ai_model = data.ai_model
    settings.auto_create_opportunity = data.auto_create_opportunity
    settings.require_interest_tag = data.require_interest_tag
    
    # Only update API key if provided (handle blank to mean "unchanged")
    if data.ai_api_key and len(data.ai_api_key.strip()) > 0:
        settings.ai_api_key = encrypt_value(data.ai_api_key)
        
    db.commit()
    return {"status": "ok"}
