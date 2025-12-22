from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_change_me_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from cryptography.fernet import Fernet

# Simple encryption for API Keys using a fixed key (In prod, use env var)
# This key must be 32 url-safe base64-encoded bytes.
current_key = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode()) 
cipher_suite = Fernet(current_key.encode())

def encrypt_value(value: str) -> str:
    if not value: return None
    return cipher_suite.encrypt(value.encode()).decode()

def decrypt_value(value: str) -> str:
    if not value: return None
    try:
        return cipher_suite.decrypt(value.encode()).decode()
    except:
        return None
