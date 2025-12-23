from fastapi import APIRouter, Request, HTTPException, Depends, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.deal import Deal, DealStatus
from app.models.stage import Stage
from app.models.settings import UserSettings
import logging
import hmac
import hashlib
import os
import json
import redis
from typing import Optional

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://tork-redis:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

async def verify_signature(
    request: Request, 
    x_chatwoot_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Validates the X-Chatwoot-Signature header using HMAC-SHA256 with DYNAMIC SECRET.
    1. Parse body to get account_id.
    2. Fetch UserSettings for that account_id.
    3. Use that user's secret to validate.
    """
    if not x_chatwoot_signature:
        logger.warning("Missing X-Chatwoot-Signature header")
        raise HTTPException(status_code=401, detail="Missing Signature")

    body = await request.body()
    
    try:
        payload = json.loads(body)
        account_id = payload.get("account", {}).get("id")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON Body")

    if not account_id:
        logger.warning("No account_id in webhook payload")
        raise HTTPException(status_code=401, detail="Missing Account ID")

    # Dynamic Secret Lookup
    settings = db.query(UserSettings).filter(
        UserSettings.chatwoot_account_id == int(account_id)
    ).first()

    webhook_secret = None
    if settings and settings.chatwoot_webhook_secret:
        webhook_secret = settings.chatwoot_webhook_secret
    else:
        # Fallback to env for legacy/testing
        webhook_secret = os.getenv("CHATWOOT_WEBHOOK_SECRET")

    if not webhook_secret:
        logger.error(f"No webhook secret found for Account {account_id}")
        raise HTTPException(status_code=401, detail="Configuration Error: No Secret")

    # Calculate HMAC
    calculated_signature = hmac.new(
        key=webhook_secret.encode(),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_signature, x_chatwoot_signature):
        logger.error(f"Invalid Signature for Account {account_id}. Expected: {calculated_signature}, Got: {x_chatwoot_signature}")
        raise HTTPException(status_code=401, detail="Invalid Signature")

    # Store parsed payload in request state to avoid re-parsing
    request.state.payload = payload

@router.post("/chatwoot")
async def chatwoot_webhook(
    request: Request, 
    db: Session = Depends(get_db),
    _: None = Depends(verify_signature)
):
    """
    Receives webhooks from Chatwoot and updates CRM accordingly.
    Events handled:
    - contact_created: Creates a new Deal (Lead)
    - conversation_updated: updates deal stage based on labels
    """
    try:
        # Get payload from request.state (already parsed in verify_signature)
        payload = request.state.payload
        event_type = payload.get("event")
        account_id = payload.get("account", {}).get("id")
        
        logger.info(f"Received Chatwoot Webhook: {event_type} | Account: {account_id}")

        # IDEMPOTENCY CHECK
        if event_type == "conversation_updated":
            # Use conversation ID as key
            conversation_id = payload.get("data", {}).get("conversation", {}).get("id") \
                              or payload.get("id") # Fallback
            
            if conversation_id:
                # Specific Lock Key Format: lock:chatwoot:{account_id}:{conversation_id}
                lock_key = f"lock:chatwoot:{account_id}:{conversation_id}"
                
                if redis_client.exists(lock_key):
                    logger.info(f"Duplicate event ignored for conversation {conversation_id} (Lock exists)")
                    return {"status": "ignored", "reason": "duplicate_event"}
                
                # Set key with TTL 15s
                redis_client.setex(lock_key, 15, "locked")

        if event_type == "contact_created":
            return handle_contact_created(payload, db, account_id)
        
        elif event_type == "conversation_updated" or event_type == "message_created":
            return handle_conversation_updated(payload, db)

        return {"status": "ignored", "reason": "unhandled_event"}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"status": "error", "detail": str(e)}

def handle_contact_created(payload, db: Session, chatwoot_account_id: int):
    contact = payload.get("data", {}).get("contact", {})
    name = contact.get("name", "Novo Lead Chatwoot")
    email = contact.get("email")
    phone = contact.get("phone_number")
    
    # DYNAMIC USER LOOKUP
    user_settings = db.query(UserSettings).filter(
        UserSettings.chatwoot_account_id == int(chatwoot_account_id)
    ).first()

    if user_settings:
        target_user_id = user_settings.user_id
    else:
        logger.warning(f"No user found for Chatwoot Account ID {chatwoot_account_id}. Skipping deal creation.")
        # STRICT SECURITY: Do not fallback to admin for multi-tenant safety?
        # User prompt says "Proibido usar user_id=1". So we SKIP if not found.
        return {"status": "skipped", "reason": "user_not_found_for_account"}

    # Check if deal exists
    existing_deal = db.query(Deal).filter(
        (Deal.email == email) | (Deal.phone == phone)
    ).first()

    if existing_deal:
        return {"status": "skipped", "reason": "duplicate"}

    # Create Deal
    default_stage = db.query(Stage).filter(Stage.is_default == True).order_by(Stage.order).first()
    start_status = default_stage.slug if default_stage else "new"

    new_deal = Deal(
        name=name,
        email=email,
        phone=phone,
        value=0, # Default value
        priority="medium",
        status=start_status,
        user_id=target_user_id
    )
    db.add(new_deal)
    db.commit()
    logger.info(f"Created Deal from Chatwoot: {name} assigned to User {target_user_id}")
    return {"status": "success", "action": "created_deal", "id": new_deal.id}

def handle_conversation_updated(payload, db: Session):
    # Logic: Look for labels in the conversation
    conversation = payload.get("data", {}).get("conversation", {}) if payload.get("event") == "conversation_updated" else payload.get("conversation", {})
    
    if not conversation:
        return {"status": "skipped", "reason": "no_conversation_data"}

    labels = conversation.get("labels", [])
    
    new_status = None
    
    valid_stages = db.query(Stage).all()
    slug_map = {s.slug: s.slug for s in valid_stages}
    name_map = {s.name.lower(): s.slug for s in valid_stages} 
    
    for label in labels:
        l_lower = label.lower()
        if l_lower in slug_map:
             new_status = slug_map[l_lower]
             break
        if l_lower in name_map:
             new_status = name_map[l_lower]
             break
    
    if not new_status:
        return {"status": "skipped", "reason": "no_matching_labels"}

    # Find deal by contact info
    contact = conversation.get("contact_inbox", {}).get("contact", {})
    email = contact.get("email")
    phone = contact.get("phone_number")

    if not email and not phone:
         return {"status": "skipped", "reason": "no_contact_info"}

    deal = db.query(Deal).filter(
        (Deal.email == email) | (Deal.phone == phone)
    ).first()

    if deal:
        if deal.status != new_status:
            deal.status = new_status
            db.commit()
            logger.info(f"Updated Deal {deal.name} status to {new_status}")
            return {"status": "success", "action": "updated_status", "new_status": new_status}
        else:
            return {"status": "skipped", "reason": "same_status"}

    return {"status": "skipped", "reason": "deal_not_found"}

