from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.stage import Stage
from app.models.settings import UserSettings
from app.core.security import decrypt_value
from typing import List, Optional
from pydantic import BaseModel
import httpx
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter()
CHATWOOT_API_URL = os.getenv("CHATWOOT_API_URL", "http://bot-chatwoot-rails-1:3000")

# Pydantic Schemas
class StageBase(BaseModel):
    name: str
    slug: str
    color: Optional[str] = "bg-slate-500"
    order: Optional[int] = 0

class StageCreate(StageBase):
    pass

class StageUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None
    # Slug usually shouldn't change easily as it maps to external systems

class StageResponse(StageBase):
    id: int
    is_default: bool
    
    class Config:
        orm_mode = True

# Sync Logic
async def sync_label_to_chatwoot(user_id: int, label_name: str, color: str = None, action: str = "create", db: Session = None):
    try:
        # Get Settings
        settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not settings or not settings.chatwoot_account_id or not settings.chatwoot_user_token:
            logger.warning("Chatwoot settings missing. Skipping Label Sync.")
            return

        token = decrypt_value(settings.chatwoot_user_token)
        account_id = settings.chatwoot_account_id
        base_url = settings.chatwoot_url or CHATWOOT_API_URL
        
        headers = {"api_access_token": token, "Content-Type": "application/json"}

        # 1. Create Label
        if action == "create":
             # Idempotency: Check if exists first? Or just try create (Chatwoot might 422 if exists)
             payload = {"title": label_name, "color": color or "#000000"}
             async with httpx.AsyncClient() as client:
                 res = await client.post(f"{base_url}/api/v1/accounts/{account_id}/labels", json=payload, headers=headers)
                 if res.status_code in [200, 201]:
                     logger.info(f"Synced Label {label_name} to Chatwoot.")
                 elif res.status_code == 422:
                     logger.info(f"Label {label_name} already exists in Chatwoot.")
                 else:
                     logger.error(f"Failed to sync label: {res.text}")

        # 2. Update Label (Not fully supported by all Chatwoot versions via simple API, usually requires ID)
        # Assuming we can find by name or we store Chatwoot ID. For now skipping complex update logic.
        
    except Exception as e:
        logger.error(f"Error syncing label: {e}")

@router.get("/", response_model=List[StageResponse])
@router.get("", response_model=List[StageResponse], include_in_schema=False)
def read_stages(db: Session = Depends(get_db)):
    stages = db.query(Stage).order_by(Stage.order).all()
    # Seed default if empty
    if not stages:
        defaults = [
            {"name": "Novo Lead", "slug": "new", "color": "bg-blue-500", "order": 1, "is_default": True},
            {"name": "Em Contato", "slug": "contact", "color": "bg-amber-500", "order": 2, "is_default": True},
            {"name": "Proposta", "slug": "proposal", "color": "bg-purple-500", "order": 3, "is_default": True},
            {"name": "Ganho", "slug": "won", "color": "bg-emerald-500", "order": 4, "is_default": True},
            {"name": "Perdido", "slug": "lost", "color": "bg-red-500", "order": 5, "is_default": True},
        ]
        for d in defaults:
            s = Stage(**d)
            db.add(s)
        db.commit()
        stages = db.query(Stage).order_by(Stage.order).all()
    
    return stages

@router.post("/", response_model=StageResponse)
@router.post("", response_model=StageResponse, include_in_schema=False)
def create_stage(stage: StageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check duplicate
    if db.query(Stage).filter(Stage.slug == stage.slug).first():
        raise HTTPException(status_code=400, detail="Stage ID (slug) already exists")

    new_stage = Stage(**stage.dict())
    db.add(new_stage)
    db.commit()
    db.refresh(new_stage)

    # Sync to Chatwoot
    # We use admin user (id=1) settings for global sync usually
    background_tasks.add_task(sync_label_to_chatwoot, 1, stage.name, "#64748b", "create", db)

    return new_stage

@router.patch("/{stage_id}", response_model=StageResponse)
def update_stage(stage_id: int, stage_update: StageUpdate, db: Session = Depends(get_db)):
    db_stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    for key, value in stage_update.dict(exclude_unset=True).items():
        setattr(db_stage, key, value)
    
    db.commit()
    db.refresh(db_stage)
    return db_stage

@router.delete("/{stage_id}")
def delete_stage(stage_id: int, db: Session = Depends(get_db)):
    db_stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    if db_stage.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default stage")

    # Safety: Check leads
    # (Requires Deal model import, circular import risk if not careful, imported inside func usually fine)
    from app.models.deal import Deal
    if db.query(Deal).filter(Deal.status == db_stage.slug).count() > 0:
         raise HTTPException(status_code=400, detail="Cannot delete stage with active deals")

    db.delete(db_stage)
    db.commit()
    return {"message": "Stage deleted"}
