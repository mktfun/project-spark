from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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
    user_id: int = Depends(get_current_user_id)
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
    return db_deal

@router.post("/extract")
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
