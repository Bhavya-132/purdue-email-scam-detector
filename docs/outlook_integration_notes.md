# Microsoft Graph + Outlook Integration Notes

# Microsoft Graph Integration Results

✅ Successfully called Microsoft Graph API  
- Endpoint: `GET /v1.0/me/messages?$top=5`
- Status: 200 OK  
- Verified fields in response: id, subject, sender.emailAddress.address, bodyPreview  
- Token source: Graph Explorer (temporary)  
- Tested from backend using `requests` library

## Next Steps
1. Implement OAuth 2.0 PKCE flow so the Chrome extension can request tokens automatically.
2. Add backend endpoint `/scan` that accepts an email’s text and returns phishing confidence.
3. Build extension popup that triggers the scan.




## Goals
Integrate Purdue Outlook Web (Office 365) with Chrome Extension via Microsoft Graph API.

## Key Docs
- [Microsoft Graph Mail API Overview](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [Authorization Code + PKCE Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Outlook Mail API Endpoints](https://learn.microsoft.com/en-us/graph/api/user-list-messages)

## Endpoints