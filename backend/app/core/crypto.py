import os
import base64
import logging
from typing import Optional
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

logger = logging.getLogger(__name__)

# Load encryption key from environment
ENCRYPTION_KEY_B64 = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY_B64:
    logger.warning("ENCRYPTION_KEY not set. Using insecure fallback for development only!")
    # Generate a random key for development (DO NOT USE IN PRODUCTION)
    ENCRYPTION_KEY = get_random_bytes(32)
else:
    try:
        ENCRYPTION_KEY = base64.b64decode(ENCRYPTION_KEY_B64)
        if len(ENCRYPTION_KEY) != 32:
            raise ValueError("ENCRYPTION_KEY must be 32 bytes (256 bits)")
    except Exception as e:
        logger.error(f"Failed to decode ENCRYPTION_KEY: {str(e)}")
        raise ValueError("Invalid ENCRYPTION_KEY format. Must be 32 bytes encoded in base64.")


def encrypt_secret(plain_text: str) -> str:
    """
    Encrypts a plaintext secret using AES-256-GCM.
    
    Args:
        plain_text: The secret to encrypt
        
    Returns:
        Base64-encoded string in format: nonce:tag:ciphertext
        
    Raises:
        ValueError: If plain_text is empty or None
    """
    if not plain_text:
        raise ValueError("Cannot encrypt empty secret")
    
    try:
        # Generate random nonce (12 bytes recommended for GCM)
        nonce = get_random_bytes(12)
        
        # Create cipher
        cipher = AES.new(ENCRYPTION_KEY, AES.MODE_GCM, nonce=nonce)
        
        # Encrypt and get authentication tag
        ciphertext, tag = cipher.encrypt_and_digest(plain_text.encode('utf-8'))
        
        # Combine nonce:tag:ciphertext and encode as base64
        combined = nonce + tag + ciphertext
        encrypted = base64.b64encode(combined).decode('utf-8')
        
        logger.debug(f"Encrypted secret (length: {len(plain_text)} chars)")
        return encrypted
        
    except Exception as e:
        logger.error(f"Encryption failed: {str(e)}", exc_info=True)
        raise ValueError(f"Failed to encrypt secret: {str(e)}")


def decrypt_secret(cipher_text: str) -> Optional[str]:
    """
    Decrypts a secret encrypted with encrypt_secret().
    
    Args:
        cipher_text: Base64-encoded encrypted secret
        
    Returns:
        Decrypted plaintext, or None if decryption fails
        
    Raises:
        ValueError: If cipher_text format is invalid
    """
    if not cipher_text:
        return None
    
    try:
        # Decode from base64
        combined = base64.b64decode(cipher_text)
        
        # Extract components (nonce: 12 bytes, tag: 16 bytes, rest: ciphertext)
        nonce = combined[:12]
        tag = combined[12:28]
        ciphertext = combined[28:]
        
        # Create cipher
        cipher = AES.new(ENCRYPTION_KEY, AES.MODE_GCM, nonce=nonce)
        
        # Decrypt and verify authentication tag
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        
        decrypted = plaintext.decode('utf-8')
        logger.debug(f"Decrypted secret (length: {len(decrypted)} chars)")
        return decrypted
        
    except ValueError as e:
        # Authentication failed - data was tampered with
        logger.error(f"Decryption failed - authentication error: {str(e)}")
        raise ValueError("Secret authentication failed. Data may be corrupted or tampered.")
    except Exception as e:
        logger.error(f"Decryption failed: {str(e)}", exc_info=True)
        raise ValueError(f"Failed to decrypt secret: {str(e)}")


def generate_encryption_key() -> str:
    """
    Generates a new 256-bit encryption key.
    
    Returns:
        Base64-encoded 32-byte key suitable for ENCRYPTION_KEY env var
    """
    key = get_random_bytes(32)
    return base64.b64encode(key).decode('utf-8')
