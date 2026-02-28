# Google MCP Setup Guide (Drive + Gmail)

Both Google Drive and Gmail MCP servers share a single Google Cloud OAuth2 client.

---

## Prerequisites
- Google account with Drive and Gmail access
- Node.js installed (run `node --version` to verify)
- Access to Google Cloud Console: https://console.cloud.google.com

---

## One-Time: Google Cloud Project & OAuth Credentials

1. Go to https://console.cloud.google.com → Create new project: `Claude MCP Integration`
2. Enable APIs:
   - **Google Drive API**
   - **Gmail API**
3. Go to **APIs & Services → OAuth consent screen**
   - User Type: External
   - App name: `Claude MCP`
   - Add test user: your Gmail address
   - Add scopes:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Type: **Desktop app**
   - Name: `Claude Code Desktop`
5. Download the JSON → rename to `gcp-oauth.keys.json`
6. Keep this file safe — it's your OAuth client credentials

---

## Gmail MCP Setup

1. Create directory and copy credentials:
   ```bash
   mkdir -p ~/.gmail-mcp
   cp /path/to/gcp-oauth.keys.json ~/.gmail-mcp/gcp-oauth.keys.json
   ```
2. Run auth (one-time):
   ```bash
   npx @gongrzhe/server-gmail-autoauth-mcp auth
   ```
3. Browser opens → sign in → approve → `credentials.json` saved to `~/.gmail-mcp/`

**Token storage:** `~/.gmail-mcp/credentials.json`
**Re-auth needed:** If token expires or is revoked, delete credentials.json and re-run auth

---

## Google Drive MCP Setup

1. Create directory and copy credentials:
   ```bash
   mkdir -p ~/.google-mcp
   cp /path/to/gcp-oauth.keys.json ~/.google-mcp/gcp-oauth.keys.json
   ```
2. Run auth from that directory (one-time):
   ```bash
   cd ~/.google-mcp && npx -y @modelcontextprotocol/server-gdrive auth
   ```
3. Browser opens → sign in → approve → `.gdrive-server-credentials.json` saved to `~/.google-mcp/`

**Token storage:** `~/.google-mcp/.gdrive-server-credentials.json`
**Re-auth needed:** Run the auth command again from `~/.google-mcp/`

---

## Available Tools After Setup

### Google Drive
- **search(query)** — search for files by name, type, or content
- Read any Drive resource: Google Docs → Markdown, Sheets → CSV, Slides → text, PDFs/images natively

### Gmail (17 tools)
- **list/search messages** — with full Gmail search query support
- **read message** — full content including headers and body
- **send email** — with HTML support and attachments
- **create draft** — save for review before sending
- **modify labels** — archive, star, mark read/unread
- **batch operations** — modify or delete multiple emails
- **manage filters** — create, list, get, delete Gmail filters

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Auth browser doesn't open | Copy the URL printed in the terminal and paste into browser manually |
| "Token expired" error | Delete credentials.json / .gdrive-server-credentials.json and re-run auth |
| "App not verified" warning | This is expected for external apps in testing mode — click "Continue" |
| Token expires after 7 days | Publish the OAuth consent screen app (move out of "Testing" status) |
| Drive server can't find credentials | Verify `GDRIVE_CREDENTIALS_PATH` env var points to correct path |
| Windows path issues | Use literal path: `C:/Users/eesca/.google-mcp/.gdrive-server-credentials.json` |
