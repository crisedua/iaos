# Plan: Google Drive & Gmail MCP Integration

**Created:** 2026-02-27
**Status:** Implemented
**Request:** Connect Google Drive and Gmail to the Claude Code workspace via MCP servers so Claude can read/search files and emails directly during sessions.

---

## Overview

### What This Plan Accomplishes

This plan adds two MCP servers to the workspace — one for Google Drive and one for Gmail — so Claude can search Drive files, read documents, list/search emails, read full message content, send emails, and manage labels directly in any session. It also creates a shared setup reference and a `/google` command for quick access to both integrations.

### Why This Matters

The workspace currently lacks access to the user's actual documents and communications. With Drive and Gmail connected, Claude can reference real files (proposals, SOPs, client docs) and real emails (lead responses, client threads) when running sessions like `/ia-os-session`, `/outreach-leads`, or `/weekly-leads` — without copy-pasting content into chat.

---

## Current State

### Relevant Existing Structure

```
.mcp.json                          # Has Apify MCP; will add gdrive + gmail entries
.claude/commands/                  # Existing commands (prime, weekly-leads, outreach-leads, etc.)
context/                           # User context files
reference/                         # Setup guides and templates
CLAUDE.md                          # Workspace documentation
```

### Gaps or Problems Being Addressed

- Claude has no access to Drive files — documents must be manually copy-pasted into chat.
- Claude has no access to Gmail — email threads must be manually summarized.
- No setup documentation exists for Google MCP credential setup.

---

## Proposed Changes

### Summary of Changes

- **Add Google Drive MCP server** to `.mcp.json` using `@modelcontextprotocol/server-gdrive` (official archived package, still fully functional via npx)
- **Add Gmail MCP server** to `.mcp.json` using `@gongrzhe/server-gmail-autoauth-mcp` (community package with 17 tools and auto-auth support)
- **Create `reference/google-mcp-setup.md`** — one-time setup guide covering Google Cloud project, OAuth credentials, and auth flow for both servers
- **Update `CLAUDE.md`** — document both integrations and update `.mcp.json` description

### New Files to Create

| File Path | Purpose |
|---|---|
| `reference/google-mcp-setup.md` | One-time setup guide: Google Cloud project, OAuth credentials, auth flows for Drive and Gmail |

### Files to Modify

| File Path | Changes |
|---|---|
| `.mcp.json` | Add `gdrive` and `gmail` MCP server entries |
| `CLAUDE.md` | Update `.mcp.json` description in Workspace Structure; note Google MCP integrations |

---

## Design Decisions

### Key Decisions Made

1. **`@modelcontextprotocol/server-gdrive` for Drive**: This is the official reference implementation from the MCP team (now archived in `modelcontextprotocol/servers-archived`). It is still fully functional, available via `npx -y`, and uses the standard `gcp-oauth.keys.json` credential pattern. It provides `search` tool and Drive resource reading (Google Docs → Markdown, Sheets → CSV, etc.).

2. **`@gongrzhe/server-gmail-autoauth-mcp` for Gmail**: The best available Gmail MCP package. Provides 17 tools covering the full email lifecycle: list/search/read messages, send, draft, modify labels, batch operations, and filter management. Uses the same Google OAuth credential flow with auto-auth support (`npx ... auth` one-time flow).

3. **Shared Google Cloud project and OAuth client**: Both Drive and Gmail can share a single Google Cloud project and a single OAuth 2.0 Desktop App client. You download one `gcp-oauth.keys.json` and use it for both servers. This keeps credential management simple.

4. **Separate credential storage paths**: Gmail requires its `gcp-oauth.keys.json` in `~/.gmail-mcp/`. Drive stores its post-auth token at a configurable path. They don't interfere with each other despite sharing the same OAuth source file.

5. **OAuth scopes — read + send**: Drive uses `drive.readonly` (read-only, least privilege). Gmail uses `gmail.modify` scope which allows reading, sending, drafting, and label management — covers all realistic use cases while avoiding account-level admin permissions.

6. **`npx -y` as runner**: Both packages are Node.js and run via `npx -y`, consistent with how Apify is configured in the existing `.mcp.json`. No extra tools (Python, Docker) required.

7. **No `/google` command created**: The value of these MCP integrations is ambient — Claude uses Drive and Gmail tools naturally during existing commands (`/outreach-leads`, `/ia-os-session`, etc.) rather than through a dedicated command. Adding a command would add ceremony without benefit.

### Alternatives Considered

- **`isaacphi/mcp-gdrive`** (community Drive server): Supports Drive read + Sheets edit, but requires cloning and building locally. More setup friction than `npx -y`. Rejected for simplicity.
- **`ngs/google-mcp-server`** (Google Workspace server covering Calendar, Drive, Gmail, Sheets, Docs, Slides): Comprehensive but more complex, requires Go installation. Overkill for current needs. Could be adopted later if Calendar or Sheets access is needed.
- **Service account auth**: Service accounts can't access a personal Gmail inbox. OAuth2 is required for user-level Drive and Gmail access. Service accounts only make sense for shared/organizational drives.
- **Building a custom MCP server**: Maximum flexibility but requires significant development and maintenance effort. Rejected — high-quality packages exist for both needs.

### Open Questions

None — all decisions can be made based on available information.

---

## Step-by-Step Tasks

### Step 1: Create Google Cloud Project and OAuth Credentials (Manual — User Action)

This step is performed by the user in the Google Cloud Console. It produces a `gcp-oauth.keys.json` file that both MCP servers will use.

**Actions:**

1. Go to **https://console.cloud.google.com** → sign in with your Google account
2. Click the project selector at the top → **New Project**
   - Name: `Claude MCP Integration` (or anything)
   - Click **Create**
3. **Enable APIs** (with the new project selected):
   - Go to **APIs & Services → Enable APIs and Services**
   - Search and enable: **Google Drive API**
   - Search and enable: **Gmail API**
4. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services → OAuth consent screen**
   - User Type: **External** (or Internal if using Google Workspace org)
   - App name: `Claude MCP`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue**
   - **Scopes** step: click **Add or Remove Scopes** → add:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Click **Save and Continue**
   - **Test Users** step: add your own Gmail address as a test user
   - Click **Save and Continue → Back to Dashboard**
5. **Create OAuth 2.0 Client**:
   - Go to **APIs & Services → Credentials**
   - Click **+ Create Credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Name: `Claude Code Desktop`
   - Click **Create**
6. **Download the credentials JSON**:
   - In the credentials list, click the download icon (⬇) for your new Desktop client
   - Save the file — it will be named something like `client_secret_xxx.json`
   - **Rename it to `gcp-oauth.keys.json`**
7. Keep this file accessible — you'll use it in Steps 2 and 3

**Files affected:**

- None in the workspace (external action)

---

### Step 2: Set Up Gmail MCP Credentials and Run Auth (Manual — User Action)

The Gmail MCP server expects `gcp-oauth.keys.json` in `~/.gmail-mcp/` and stores its token there after auth.

**Actions:**

1. Create the directory (if it doesn't exist):
   ```powershell
   mkdir $HOME\.gmail-mcp
   ```
   Or in bash:
   ```bash
   mkdir -p ~/.gmail-mcp
   ```

2. Copy your `gcp-oauth.keys.json` into that folder:
   ```powershell
   copy path\to\gcp-oauth.keys.json $HOME\.gmail-mcp\gcp-oauth.keys.json
   ```

3. Run the Gmail auth flow:
   ```bash
   npx @gongrzhe/server-gmail-autoauth-mcp auth
   ```
   - This will open a browser window (or print an auth URL)
   - Sign in with your Google account → grant the requested permissions
   - After approval, a `credentials.json` is saved to `~/.gmail-mcp/credentials.json`
   - You only need to do this once — the token auto-refreshes

**Files affected:**

- `~/.gmail-mcp/gcp-oauth.keys.json` (created by user, outside workspace)
- `~/.gmail-mcp/credentials.json` (created by auth flow, outside workspace)

---

### Step 3: Set Up Google Drive MCP Credentials and Run Auth (Manual — User Action)

The Drive MCP server reads `gcp-oauth.keys.json` from the current directory (or from `GDRIVE_OAUTH_PATH`) and saves its token to `.gdrive-server-credentials.json`.

**Actions:**

1. Create a persistent directory for Drive credentials:
   ```bash
   mkdir -p ~/.google-mcp
   ```

2. Copy your `gcp-oauth.keys.json` there:
   ```bash
   cp /path/to/gcp-oauth.keys.json ~/.google-mcp/gcp-oauth.keys.json
   ```

3. Run the Drive auth flow from that directory:
   ```bash
   cd ~/.google-mcp && npx -y @modelcontextprotocol/server-gdrive auth
   ```
   - A browser opens → sign in → grant Drive read access
   - After approval, `.gdrive-server-credentials.json` is saved in `~/.google-mcp/`

4. Note the full path to the credentials file: `~/.google-mcp/.gdrive-server-credentials.json`
   - On Windows this resolves to: `C:\Users\eesca\.google-mcp\.gdrive-server-credentials.json`

**Files affected:**

- `~/.google-mcp/gcp-oauth.keys.json` (created by user, outside workspace)
- `~/.google-mcp/.gdrive-server-credentials.json` (created by auth flow, outside workspace)

---

### Step 4: Create `reference/google-mcp-setup.md`

Document the setup process permanently so it can be reproduced in future sessions or after credential expiry.

**Actions:**

Create `reference/google-mcp-setup.md` with the following content:

```markdown
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
```

**Files affected:**
- `reference/google-mcp-setup.md` (create)

---

### Step 5: Add Google Drive and Gmail MCP Servers to `.mcp.json`

Update `.mcp.json` to add both servers alongside the existing Apify entry.

**Actions:**

Edit `.mcp.json` — current content:
```json
{
  "apify": {
    "command": "npx",
    "args": ["-y", "@apify/actors-mcp-server"],
    "env": {
      "APIFY_TOKEN": "${APIFY_TOKEN}"
    }
  }
}
```

New content (replace entire file):
```json
{
  "apify": {
    "command": "npx",
    "args": ["-y", "@apify/actors-mcp-server"],
    "env": {
      "APIFY_TOKEN": "${APIFY_TOKEN}"
    }
  },
  "gdrive": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-gdrive"],
    "env": {
      "GDRIVE_CREDENTIALS_PATH": "${HOME}/.google-mcp/.gdrive-server-credentials.json",
      "GDRIVE_OAUTH_PATH": "${HOME}/.google-mcp/gcp-oauth.keys.json"
    }
  },
  "gmail": {
    "command": "npx",
    "args": ["-y", "@gongrzhe/server-gmail-autoauth-mcp"]
  }
}
```

> **Note on Gmail:** The Gmail server automatically reads from `~/.gmail-mcp/` by convention — no env var needed. The Drive server requires explicit paths since credentials are stored in a custom directory.

**Files affected:**
- `.mcp.json`

---

### Step 6: Update `CLAUDE.md`

Update the workspace documentation to reflect the new MCP integrations.

**Actions:**

In the **Workspace Structure** section, update the `.mcp.json` line:

Change:
```
├── .mcp.json              # MCP server config (Apify for Google Maps extraction; TickTick for task management)
```

To:
```
├── .mcp.json              # MCP server config (Apify for Google Maps; TickTick for tasks; Google Drive + Gmail)
```

In the **Notes** section (or after the workspace structure table), if there's a section referencing MCP tools, note that Google Drive and Gmail are now available. This is a minor doc-only update — no new command section needed since the tools are ambient (used naturally by existing commands).

**Files affected:**
- `CLAUDE.md`

---

### Step 7: Restart Claude Code and Validate

After completing Steps 1–6, restart Claude Code so MCP servers are loaded fresh.

**Actions:**

1. Close and reopen Claude Code (MCP servers initialize at startup)
2. In a new session, test Google Drive:
   - Ask: "Search my Google Drive for any document with 'proposal' in the name"
   - Claude should use the `search` tool and return matching files
3. Test Gmail:
   - Ask: "Show me my last 5 unread emails"
   - Claude should use Gmail tools and return message summaries
4. Test reading a Drive file:
   - Ask: "Read the contents of [a specific file name]" — Claude searches then reads
5. Confirm no credential errors appear in Claude Code's MCP server logs

**Files affected:**
- None (validation only)

---

## Connections & Dependencies

### Files That Reference This Area

- `.mcp.json` — modified directly
- `CLAUDE.md` — updated to reflect new integrations
- `reference/google-mcp-setup.md` — new reference, answers "how do I set this up again?"

### Updates Needed for Consistency

- Existing commands (`/outreach-leads`, `/ia-os-session`, `/weekly-leads`) automatically benefit from these integrations — Claude can now read real client emails or Drive docs when asked during those sessions. No command changes needed.

### Impact on Existing Workflows

- Zero breaking impact — additive MCP entries only
- If Drive or Gmail credentials are missing or expired, those MCP tools silently fail; Apify and TickTick remain unaffected

---

## Validation Checklist

- [ ] Google Cloud project created with Drive API and Gmail API enabled
- [ ] OAuth consent screen configured with correct scopes and test user added
- [ ] OAuth 2.0 Desktop App credentials downloaded and saved as `gcp-oauth.keys.json`
- [ ] `~/.gmail-mcp/gcp-oauth.keys.json` exists (copy of OAuth keys)
- [ ] Gmail auth completed: `~/.gmail-mcp/credentials.json` exists
- [ ] `~/.google-mcp/gcp-oauth.keys.json` exists (copy of OAuth keys)
- [ ] Drive auth completed: `~/.google-mcp/.gdrive-server-credentials.json` exists
- [ ] `.mcp.json` updated with `gdrive` and `gmail` entries (valid JSON, no syntax errors)
- [ ] Claude Code restarted — no MCP startup errors
- [ ] Drive `search` tool returns real results when tested
- [ ] Gmail message listing returns real inbox data when tested
- [ ] `reference/google-mcp-setup.md` created with complete instructions
- [ ] `CLAUDE.md` updated with new `.mcp.json` description

---

## Success Criteria

The implementation is complete when:

1. Claude can search Google Drive and read file contents in any session without copy-pasting.
2. Claude can list, search, and read Gmail messages and send emails on request.
3. `reference/google-mcp-setup.md` provides enough detail to re-configure from scratch (e.g., after credential expiry or on a new machine).

---

## Notes

**Token expiry for apps in "Testing" mode:** Google OAuth tokens for apps in "Testing" consent screen status expire after 7 days. To avoid re-authenticating weekly, publish the OAuth consent screen (change from Testing to Production/Published). Since you're only adding yourself as the user, this is safe and straightforward — Google won't send the app through a formal review as long as you're only using it personally.

**Scopes and security:** `drive.readonly` ensures Claude cannot modify, delete, or share your Drive files. `gmail.modify` allows reading and sending but not account-level changes. These are appropriate minimal scopes for the intended use.

**Windows path resolution:** The `${HOME}` in `.mcp.json` env vars resolves to `C:\Users\eesca` on this machine. If Claude Code doesn't resolve `${HOME}` automatically on Windows, replace with the literal path: `C:/Users/eesca/.google-mcp/.gdrive-server-credentials.json`.

**Future expansion:** If Google Calendar, Sheets editing, or Slides access is needed later, consider upgrading to `ngs/google-mcp-server` which covers the full Google Workspace suite in a single server (requires Go installation).

---

## Implementation Notes

**Implemented:** 2026-02-27

### Summary

- Created `reference/google-mcp-setup.md` with full setup guide for both servers
- Updated `.mcp.json` with `gdrive` and `gmail` MCP server entries
- Updated `CLAUDE.md` `.mcp.json` description line

### Deviations from Plan

Steps 1–3 (Google Cloud setup, Gmail auth, Drive auth) and Step 7 (validation) are manual user actions — not automated. These are documented as pending in the validation checklist below.

### Issues Encountered

None — all workspace file changes applied cleanly.
