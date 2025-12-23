from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
import httpx
import os
import logging
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.deal import Deal, DealStatus
from app.models.settings import UserSettings
from app.schemas.deal import DealCreate, DealUpdate, DealResponse
from app.core.security import ALGORITHM, SECRET_KEY, decrypt_value
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import extract_lead_info

from app.services.ai_service import extract_lead_info

logger = logging.getLogger(__name__)
CHATWOOT_API_URL = os.getenv("CHATWOOT_API_URL", "http://bot-chatwoot-rails-1:3000")
# Token should ideally come from UserSettings, but for now we might use env or settings
# For this implementation, we will try to fetch it from UserSettings if available, or rely on a system token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("uid")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

@router.get("/", response_model=List[DealResponse])
@router.get("", response_model=List[DealResponse], include_in_schema=False)
def read_deals(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    # SECURITY: Filter by user_id
    leads = db.query(Deal).filter(Deal.user_id == user_id).offset(skip).limit(limit).all()
    return leads

@router.post("/", response_model=DealResponse)
@router.post("", response_model=DealResponse, include_in_schema=False)
def create_deal(
    deal: DealCreate, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    # Create deal linked to current user
    db_deal = Deal(**deal.dict(), user_id=user_id)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

@router.patch("/{deal_id}", response_model=DealResponse)
def update_deal_status(
    deal_id: int, 
    deal_update: DealUpdate, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # SECURITY: Ensure deal belongs to user
    db_deal = db.query(Deal).filter(Deal.id == deal_id, Deal.user_id == user_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found or access denied")
    
    update_data = deal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deal, key, value)
    
    db.commit()
    db.refresh(db_deal)
    db.commit()
    db.refresh(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    # TRIGGER REVERSE SYNC
    if deal_update.status:
         background_tasks.add_task(sync_status_to_chatwoot, db_deal, db)

    return db_deal

async def sync_status_to_chatwoot(deal: Deal, db: Session):
    """
    Reverse Sync: Updates Chatwoot contact/conversation label when CRM status changes.
    """
    try:
        # 1. Get User Chatwoot Config
        settings = db.query(UserSettings).filter(UserSettings.user_id == deal.user_id).first()
        if not settings or not settings.chatwoot_user_token or not settings.chatwoot_account_id:
            logger.warning("Chatwoot settings not configured for user. Skipping sync.")
            return

        chatwoot_url = settings.chatwoot_url or CHATWOOT_API_URL
        account_id = settings.chatwoot_account_id
        token = decrypt_value(settings.chatwoot_user_token) # Assuming we need to decrypt

        if not token:
             logger.warning("Could not decrypt Chatwoot token.")
             return

        # 2. Find Contact in Chatwoot (by email) -> This requires Chatwoot API search
        # Simplifying: We assume we might have a `chatwoot_id` on Deal model later, 
        # but for now let's search by email.
        
        headers = {"api_access_token": token, "Content-Type": "application/json"}
        
        async with httpx.AsyncClient() as client:
            # Search Contact
            search_res = await client.get(
                f"{chatwoot_url}/api/v1/accounts/{account_id}/contacts/search",
                params={"q": deal.email},
                headers=headers
            )
            
            if search_res.status_code != 200:
                logger.error(f"Failed to search chatwoot contact: {search_res.text}")
                return

            data = search_res.json()
            contacts = data.get("payload", [])
            
            if not contacts:
                logger.info("Contact not found in Chatwoot.")
                return
                
            contact_id = contacts[0]["id"]
            
            # 3. Update Contact Label (or Custom Attribute)
            # Chatwoot labels are usually on Conversations.
            # LOGIC: Read-Modify-Write for Conversation Labels
            
            # 3.1 Find Open Conversation for Contact
            conv_res = await client.get(
                f"{chatwoot_url}/api/v1/accounts/{account_id}/conversations",
                params={"status": "open", "contact_id": int(contact_id)},
                headers=headers
            )
            
            if conv_res.status_code == 200:
                conv_data = conv_res.json()
                conversations = conv_data.get("data", {}).get("payload", [])
                
                if conversations:
                    # Pick the most recent open conversation
                    conversation = conversations[0]
                    conversation_id = conversation["id"]
                    current_labels = conversation.get("labels", [])
                    
                    # MERGE LABELS
                    new_label = deal.status
                    if new_label not in current_labels:
                        updated_labels = current_labels + [new_label]
                        
                        # POST LABELS (Read-Modify-Write complete)
                        label_res = await client.post(
                            f"{chatwoot_url}/api/v1/accounts/{account_id}/conversations/{conversation_id}/labels",
                            json={"labels": updated_labels},
                            headers=headers
                        )
                        
                        if label_res.status_code == 200:
                            logger.info(f"Updated labels for Conversation {conversation_id}: {updated_labels}")
                        else:
                            logger.error(f"Failed to update labels: {label_res.text}")
            
            # 3.2 Update contact custom attribute 'status' (Legacy/Backup)
            update_payload = {
                "custom_attributes": {
                    "crm_status": deal.status,
                    "crm_deal_value": str(deal.value)
                }
            }
            
            update_res = await client.put(
                f"{chatwoot_url}/api/v1/accounts/{account_id}/contacts/{contact_id}",
                json=update_payload,
                headers=headers
            )
            
            if update_res.status_code == 200:
                logger.info(f"Successfully synced Deal {deal.id} to Chatwoot Contact {contact_id}")
            else:
                 logger.error(f"Failed to update chatwoot contact: {update_res.text}")

    except Exception as e:
        logger.error(f"Reverse Sync Error: {e}")

@router.post("/extract")
@router.post("/extract/", include_in_schema=False)
def extract_deal_from_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # 1. Fetch User Settings (API Key)
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings or not settings.api_key:
        raise HTTPException(
            status_code=400, 
            detail="Configuração de IA não encontrada. Vá em Configurações e adicione uma chave de API."
        )

    # 2. Decrypt Key
    decrypted_key = decrypt_value(settings.api_key)
    if not decrypted_key:
        raise HTTPException(status_code=500, detail="Falha ao descriptografar chave de API.")

    # 3. Read PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Arquivo deve ser um PDF.")
    
    try:
        file_bytes = file.file.read()
        text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao ler arquivo PDF.")

    # 4. Call AI
    try:
        extracted_data = extract_lead_info(
            text=text,
            provider=settings.provider,
            api_key=decrypted_key,
            model=settings.model
        )
        return extracted_data
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
