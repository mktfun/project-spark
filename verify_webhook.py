import urllib.request
import json

url = "http://localhost:8001/webhooks/chatwoot"
payload = {
  "event": "contact_created",
  "data": {
    "contact": {
      "name": "Teste Webhook Standard Lib",
      "email": "stdlib@tork.com",
      "phone_number": "+5511999991111"
    }
  }
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
