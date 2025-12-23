from fastapi.testclient import TestClient
from app.routers.webhooks import router, redis_client
from app.core.database import get_db
from fastapi import FastAPI
import hmac
import hashlib
import json
import os
import time

# Create a dummy app to mount the router
app = FastAPI()
app.include_router(router)

# Override get_db to avoid real DB connection if possible, or just let it fail later
# For webhook verification (HMAC and Redis), we usually fail before DB unless valid.
# But "handle_contact_created" needs DB.
# We will test the "401" and "Redis Idempotency" which happen *before* logic deep inside.

client = TestClient(app)

SECRET = "default-secret"
os.environ["CHATWOOT_WEBHOOK_SECRET"] = SECRET

def generate_signature(payload):
    return hmac.new(
        key=SECRET.encode(),
        msg=json.dumps(payload).encode(),
        digestmod=hashlib.sha256
    ).hexdigest()

def test_hmac_failure():
    print("--- Test 1: HMAC Failure ---")
    payload = {"event": "test"}
    # No header
    response = client.post("/chatwoot", json=payload)
    print(f"No Header: Status {response.status_code} (Expected 401)")
    
    # Wrong header
    response = client.post("/chatwoot", json=payload, headers={"X-Chatwoot-Signature": "wrong"})
    print(f"Wrong Header: Status {response.status_code} (Expected 401)")
    
    if response.status_code == 401:
        print("PASS")
    else:
        print("FAIL")

def test_idempotency():
    print("\n--- Test 2: Redis Idempotency ---")
    payload = {
        "event": "conversation_updated",
        "id": 99999,
        "data": {"conversation": {"id": 99999, "labels": []}}
    }
    sig = generate_signature(payload)
    headers = {"X-Chatwoot-Signature": sig}
    
    # Clear key first
    redis_client.delete("lock:conv:99999")
    
    # First Request
    # Note: It might fail deep inside 'handle_conversation_updated' because of DB, 
    # but we check if it PASSED the idempotency check.
    # If it returns "ignored" (duplicate), that's idempotency working.
    # If it tries to process (and errors on DB), that means it PASSED idempotency (first time).
    
    print("Sending Request 1...")
    try:
        response1 = client.post("/chatwoot", json=payload, headers=headers)
        print(f"Response 1: {response1.json()}")
    except Exception as e:
        print(f"Response 1 Error (Expected DB error maybe): {e}")

    # Second Request immediately
    print("Sending Request 2 (should be ignored)...")
    response2 = client.post("/chatwoot", json=payload, headers=headers)
    print(f"Response 2: {response2.json()}")
    
    if response2.json().get("status") == "ignored" and response2.json().get("reason") == "duplicate_event":
        print("PASS: Duplicate event ignored")
    else:
        print("FAIL: Event not ignored")

if __name__ == "__main__":
    try:
        test_hmac_failure()
        test_idempotency()
    except Exception as e:
        print(f"An error occurred: {e}")
