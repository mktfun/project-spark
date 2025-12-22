import urllib.request
import json

url = "http://localhost:8001/crm/stages/"

try:
    with urllib.request.urlopen(url) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
