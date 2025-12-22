from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.deal import Deal, DealStatus
from app.services.ai_service import extract_lead_info # Placeholder if needed
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/chatwoot")
async def chatwoot_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receives webhooks from Chatwoot and updates CRM accordingly.
    Events handled:
    - contact_created: Creates a new Deal (Lead)
    - conversation_updated: updates deal stage based on labels
    """
    try:
        payload = await request.json()
        event_type = payload.get("event")
        
        logger.info(f"Received Chatwoot Webhook: {event_type}")

        if event_type == "contact_created":
            return handle_contact_created(payload, db)
        
        elif event_type == "conversation_updated" or event_type == "message_created":
            return handle_conversation_updated(payload, db)

        return {"status": "ignored", "reason": "unhandled_event"}

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        # Return 200 to keep Chatwoot happy, but log error
        return {"status": "error", "detail": str(e)}

def handle_contact_created(payload, db: Session):
    contact = payload.get("data", {}).get("contact", {})
    name = contact.get("name", "Novo Lead Chatwoot")
    email = contact.get("email")
    phone = contact.get("phone_number")
    
    # Check if deal exists
    existing_deal = db.query(Deal).filter(
        (Deal.email == email) | (Deal.phone == phone)
    ).first()

    if existing_deal:
        return {"status": "skipped", "reason": "duplicate"}

    # Create Deal
    # Find default stage (usually 'new')
    default_stage = db.query(Stage).filter(Stage.is_default == True).order_by(Stage.order).first()
    start_status = default_stage.slug if default_stage else "new"

    new_deal = Deal(
        name=name,
        email=email,
        phone=phone,
        value=0, # Default value
        priority="medium",
        status=start_status,
        user_id=1 # Assign to Admin by default for now
    )
    db.add(new_deal)
    db.commit()
    logger.info(f"Created Deal from Chatwoot: {name}")
    return {"status": "success", "action": "created_deal", "id": new_deal.id}

from app.models.stage import Stage

def handle_conversation_updated(payload, db: Session):
    # Logic: Look for labels in the conversation
    conversation = payload.get("data", {}).get("conversation", {}) if payload.get("event") == "conversation_updated" else payload.get("conversation", {})
    
    if not conversation:
        # Fallback for message_created which might contain conversation info differently
        return {"status": "skipped", "reason": "no_conversation_data"}

    labels = conversation.get("labels", [])
    
    # DYNAMIC MAPPING: Check against DB Stages
    new_status = None
    
    # Get all valid slugs
    valid_stages = db.query(Stage).all()
    slug_map = {s.slug: s.slug for s in valid_stages}
    name_map = {s.name.lower(): s.slug for s in valid_stages} # Map name to slug
    
    for label in labels:
        l_lower = label.lower()
        if l_lower in slug_map:
             new_status = slug_map[l_lower]
             break
        if l_lower in name_map:
             new_status = name_map[l_lower]
             break
        
        # If label doesn't exist, we might want to create it?
        # For now, let's treat it as "Label Created" handling in a separate block if we were handling that event directly.
    
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
