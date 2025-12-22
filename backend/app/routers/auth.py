from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
from app.core.security import create_access_token
import os

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

CHATWOOT_URL = os.getenv("CHATWOOT_API_URL", "http://bot-chatwoot-rails-1:3000")

@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    # Determine URL to call
    # If running in Docker link, use container name. If testing locally, might need localhost 
    # But usually backend is in docker too.
    
    # Use Chatwoot's API to sign in
    sign_in_url = f"{CHATWOOT_URL}/auth/sign_in"
    
    async with httpx.AsyncClient() as client:
        try:
            # Chatwoot expects just email and password in form data or json? 
            # Devise Token Auth usually: { "email": "...", "password": "..." }
            response = await client.post(sign_in_url, json={
                "email": request.email, 
                "password": request.password
            })
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials (Chatwoot Auth Failed)"
                )
            
            # Extract user info
            cw_data = response.json()
            user_data = cw_data.get("data", {})
            user_id = user_data.get("id")
            
            # Create our own JWT
            access_token = create_access_token(
                data={"sub": request.email, "uid": user_id, "role": "admin"} 
                # Assuming admin for now, ideally check chatwoot role
            )
            
            return {
                "access_token": access_token, 
                "token_type": "bearer",
                "user": {
                    "email": request.email,
                    "id": user_id,
                    "name": user_data.get("name")
                }
            }
            
        except httpx.RequestError as exc:
            print(f"Connection error to Chatwoot: {exc}")
            # Fallback for dev if chatwoot is not reachable?
            # NO, user said "Validar contra Chatwoot".
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not connect to Auth Provider: {exc}"
            )
