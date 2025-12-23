import httpx
import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.deal import Deal
from app.models.settings import UserSettings
from app.core.crypto import decrypt_secret

logger = logging.getLogger(__name__)

class ChatwootService:
    """
    Service layer for Chatwoot API operations.
    Handles all external Chatwoot communication with proper multi-tenant isolation.
    Secrets are decrypted on-demand and never logged.
    """
    
    def __init__(self, user_settings: UserSettings):
        if not user_settings.chatwoot_url or not user_settings.chatwoot_api_key:
            raise ValueError("Chatwoot configuration incomplete for user")
        
        self.url = user_settings.chatwoot_url.rstrip('/')
        self.account_id = user_settings.chatwoot_account_id
        
        # Decrypt API key (may be encrypted in DB)
        try:
            self.api_key = decrypt_secret(user_settings.chatwoot_api_key) if user_settings.chatwoot_api_key else None
        except Exception as e:
            # If decryption fails, assume it's stored in plaintext (legacy)
            logger.warning(f"API key decryption failed, using plaintext: {str(e)}")
            self.api_key = user_settings.chatwoot_api_key
        
        if not self.api_key:
            raise ValueError("Chatwoot API key is empty or invalid")
        
        self.headers = {
            "api_access_token": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def create_contact(self, contact_data: dict) -> Optional[dict]:
        """
        Creates a new contact in Chatwoot.
        
        Args:
            contact_data: Dict with keys: name, email, phone_number
            
        Returns:
            Contact data if successful, None otherwise
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.url}/api/v1/accounts/{self.account_id}/contacts",
                    json=contact_data,
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Created Chatwoot contact: {contact_data.get('email')}")
                    return response.json()
                else:
                    logger.error(f"Failed to create contact: {response.status_code} - {response.text}")
                    return None
                    
            except httpx.RequestError as e:
                logger.error(f"Chatwoot API request failed: {str(e)}")
                return None
    
    async def sync_status_to_chatwoot(self, deal: Deal, db: Session) -> bool:
        """
        Syncs deal status to Chatwoot conversation labels.
        Implements Read-Modify-Write pattern to avoid label conflicts.
        
        Args:
            deal: Deal object to sync
            db: Database session
            
        Returns:
            True if successful, False otherwise
        """
        if not deal.email and not deal.phone:
            logger.warning(f"Deal {deal.id} has no contact info for Chatwoot sync")
            return False
        
        async with httpx.AsyncClient() as client:
            try:
                # 1. Find contact by email/phone
                search_identifier = deal.email or deal.phone
                contact_res = await client.get(
                    f"{self.url}/api/v1/accounts/{self.account_id}/contacts/search",
                    params={"q": search_identifier},
                    headers=self.headers,
                    timeout=10.0
                )
                
                if contact_res.status_code != 200:
                    logger.error(f"Contact search failed: {contact_res.status_code}")
                    return False
                
                contacts = contact_res.json().get("payload", [])
                if not contacts:
                    logger.warning(f"No Chatwoot contact found for {search_identifier}")
                    return False
                
                contact_id = contacts[0].get("id")
                
                # 2. Find open conversation for contact
                conv_res = await client.get(
                    f"{self.url}/api/v1/accounts/{self.account_id}/conversations",
                    params={"status": "open", "contact_id": contact_id},
                    headers=self.headers,
                    timeout=10.0
                )
                
                if conv_res.status_code != 200:
                    logger.error(f"Conversation search failed: {conv_res.status_code}")
                    return False
                
                conversations = conv_res.json().get("data", {}).get("payload", [])
                if not conversations:
                    logger.info(f"No open conversation for contact {contact_id}")
                    return False
                
                conversation = conversations[0]
                conversation_id = conversation["id"]
                current_labels = conversation.get("labels", [])
                
                # 3. Read-Modify-Write: Add new label if not present
                new_label = deal.status
                if new_label not in current_labels:
                    updated_labels = current_labels + [new_label]
                    
                    label_res = await client.post(
                        f"{self.url}/api/v1/accounts/{self.account_id}/conversations/{conversation_id}/labels",
                        json={"labels": updated_labels},
                        headers=self.headers,
                        timeout=10.0
                    )
                    
                    if label_res.status_code == 200:
                        logger.info(f"Updated Chatwoot labels for conversation {conversation_id}: {updated_labels}")
                        return True
                    else:
                        logger.error(f"Failed to update labels: {label_res.status_code}")
                        return False
                else:
                    logger.info(f"Label '{new_label}' already present in conversation {conversation_id}")
                    return True
                    
            except httpx.RequestError as e:
                logger.error(f"Chatwoot sync failed: {str(e)}")
                return False
    
    async def update_conversation_labels(self, conversation_id: int, labels: list) -> bool:
        """
        Updates labels for a specific conversation.
        
        Args:
            conversation_id: Chatwoot conversation ID
            labels: List of label strings
            
        Returns:
            True if successful, False otherwise
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.url}/api/v1/accounts/{self.account_id}/conversations/{conversation_id}/labels",
                    json={"labels": labels},
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Updated labels for conversation {conversation_id}")
                    return True
                else:
                    logger.error(f"Failed to update labels: {response.status_code}")
                    return False
                    
            except httpx.RequestError as e:
                logger.error(f"Failed to update conversation labels: {str(e)}")
                return False
