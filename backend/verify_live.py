import requests
import hmac
import hashlib
import json
import time

URL = "https://crm.davicode.me/api/webhooks/chatwoot"
SECRET = "test-secret-123"

def test_hmac_missing():
    print("--- Test 1: Missing Header ---")
    try:
        r = requests.post(URL, json={"event": "test"})
        print(f"Result: {r.status_code} (Expected 401)")
    except Exception as e:
        print(f"Error: {e}")

def test_hmac_wrong():
    print("\n--- Test 2: Wrong Header ---")
    try:
        r = requests.post(URL, json={"event": "test"}, headers={"X-Chatwoot-Signature": "wrong"})
        print(f"Result: {r.status_code} (Expected 401)")
    except Exception as e:
        print(f"Error: {e}")

def test_hmac_valid_and_idempotency():
    print("\n--- Test 3 & 4: Valid & Idempotency ---")
    payload = {
        "event": "conversation_updated", 
        "id": 10001, 
        "data": {
            "conversation": {"id": 10001, "labels": []},
            "contact": {"email": "test@example.com"}
        },
        "account": {"id": 1}
    }
    
    # Needs to match exactly what requests sends.
    # Requests uses ensure_ascii=True, separators=(', ', ': ') by default for json parameter?
    # No, it uses json.dumps so standard spaces.
    # FastAPI request.body() gives raw bytes.
    # So we must control the serialization to ensure signature match.
    
    body = json.dumps(payload).encode() # encode to bytes
    sig = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    
    # Request 1
    try:
        r = requests.post(URL, data=body, headers={"X-Chatwoot-Signature": sig})
        print(f"Result 1: {r.status_code}")
        print(f"Body 1: {r.text}")
    except Exception as e:
        print(f"Error Request 1: {e}")

    # Request 2 (Replay)
    try:
        r = requests.post(URL, data=body, headers={"X-Chatwoot-Signature": sig})
        print(f"Result 2: {r.status_code}")
        print(f"Body 2: {r.text}")
    except Exception as e:
        print(f"Error Request 2: {e}")

if __name__ == "__main__":
    try:
        test_hmac_missing()
        test_hmac_wrong()
        test_hmac_valid_and_idempotency()
    except ImportError:
        print("Requests library not found. Please install requests.")
    except Exception as e:
        print(f"Global Error: {e}")
