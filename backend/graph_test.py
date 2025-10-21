import requests

ACCESS_TOKEN = "your_access_token_here"
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

# 1. Get the latest 5 messages
r = requests.get("https://graph.microsoft.com/v1.0/me/messages?$top=5", headers=headers)
print(r.status_code)
print(r.json())

# 2. Get a specific message (replace with a real ID)
# msg_id = "AAMkAGI2xFabcDEfg12345"
# r2 = requests.get(f"https://graph.microsoft.com/v1.0/me/messages/{msg_id}", headers=headers)
# print(r2.json())