"""
Test script for crypto utilities.
Run with: python -m pytest backend/test_crypto.py -v
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.crypto import encrypt_secret, decrypt_secret, generate_encryption_key

def test_encryption_roundtrip():
    """Test that encryption and decryption work correctly."""
    plaintext = "my-super-secret-api-key-12345"
    
    # Encrypt
    encrypted = encrypt_secret(plaintext)
    print(f"✅ Encrypted: {encrypted[:50]}... (length: {len(encrypted)})")
    
    # Decrypt
    decrypted = decrypt_secret(encrypted)
    print(f"✅ Decrypted: {decrypted}")
    
    # Verify
    assert decrypted == plaintext, "Decryption failed!"
    print("✅ Roundtrip test PASSED")

def test_encrypted_format():
    """Test that encrypted secrets are base64 and don't contain plaintext."""
    plaintext = "test-secret-key"
    encrypted = encrypt_secret(plaintext)
    
    # Should be base64
    assert encrypted.isprintable(), "Encrypted text should be printable (base64)"
    
    # Should NOT contain plaintext
    assert plaintext not in encrypted, "Encrypted text should NOT contain plaintext"
    
    print("✅ Format test PASSED")

def test_different_secrets_different_ciphertext():
    """Test that same plaintext produces different ciphertext (due to random nonce)."""
    plaintext = "same-secret"
    
    encrypted1 = encrypt_secret(plaintext)
    encrypted2 = encrypt_secret(plaintext)
    
    # Different ciphertext due to random nonce
    assert encrypted1 != encrypted2, "Same plaintext should produce different ciphertext"
    
    # Both should decrypt to same value
    assert decrypt_secret(encrypted1) == plaintext
    assert decrypt_secret(encrypted2) == plaintext
    
    print("✅ Nonce randomization test PASSED")

def test_generate_key():
    """Test key generation."""
    key = generate_encryption_key()
    print(f"✅ Generated key: {key[:20]}... (length: {len(key)})")
    
    # Should be base64
    import base64
    decoded = base64.b64decode(key)
    assert len(decoded) == 32, "Key should be 32 bytes"
    
    print("✅ Key generation test PASSED")

if __name__ == "__main__":
    print("=" * 60)
    print("CRYPTO UTILITIES TEST SUITE")
    print("=" * 60)
    
    try:
        test_encryption_roundtrip()
        print()
        test_encrypted_format()
        print()
        test_different_secrets_different_ciphertext()
        print()
        test_generate_key()
        print()
        print("=" * 60)
        print("ALL TESTS PASSED ✅")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
