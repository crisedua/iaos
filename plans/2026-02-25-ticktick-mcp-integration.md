# Plan: TickTick MCP Integration

**Created:** 2026-02-25
**Status:** Draft
**Request:** Connect to TickTick to retrieve and manage tasks, via MCP or similar.

---

## Overview

### What This Plan Accomplishes

This plan integrates TickTick (task management app) into the Claude Code workspace by adding a community MCP server to `.mcp.json`. Once configured, Claude can directly read, create, update, complete, and delete TickTick tasks during any conversation session — no manual API calls, no scripts, no copy-paste. A new `/tasks` command provides a structured daily task review session.

### Why This Matters

Task management is a core daily workflow. Having Claude read and write TickTick tasks directly means you can ask things like "what's on my plate today?", "mark this done", or "add a follow-up task for tomorrow" — and it happens live, inside the workspace, without switching apps.

---

## Current State

### Relevant Existing Structure

```
.mcp.json                          # Already has Apify MCP configured
.claude/commands/                  # Existing slash commands (prime, weekly-leads, etc.)
context/                           # Workspace context files
CLAUDE.md                          # Workspace documentation
```

### Gaps or Problems Being Addressed

- No connection to TickTick exists. Tasks must be managed manually outside this workspace.
- Claude has no visibility into the user's task list, so it cannot help prioritize, delegate, or cross-reference tasks against leads/plans.
- No `/tasks` command exists for structured daily task review.

---

## Proposed Changes

### Summary of Changes

- **Add TickTick MCP server** to `.mcp.json` using the `jacepark12/ticktick-mcp` community server (uses official TickTick Open API with OAuth2)
- **Create `/tasks` command** for structured daily task review sessions with Claude
- **Create `reference/ticktick-setup.md`** — one-time setup guide: register app, get credentials, auth flow
- **Update `CLAUDE.md`** — document the TickTick integration and `/tasks` command

### New Files to Create

| File Path | Purpose |
|---|---|
| `.claude/commands/tasks.md` | `/tasks` slash command — daily task review and management session |
| `reference/ticktick-setup.md` | One-time setup guide: app registration, OAuth2, env vars |

### Files to Modify

| File Path | Changes |
|---|---|
| `.mcp.json` | Add `ticktick` MCP server entry with OAuth2 env vars |
| `CLAUDE.md` | Add `/tasks` command to Commands section; note TickTick integration |

---

## Design Decisions

### Key Decisions Made

1. **MCP over direct API scripts**: MCP gives Claude live, bidirectional access to TickTick during any conversation — no script to run, no copy-paste. A Node.js REST API script would require manual invocation and wouldn't let Claude read tasks proactively.

2. **`jacepark12/ticktick-mcp` over alternatives**: Uses the **official** TickTick Open API (not the unofficial/reverse-engineered one). More stable than packages relying on username/password login (which broke in Jan 2024 due to CAPTCHA). Well-maintained Python MCP server that works with Claude Code via `uvx`.

3. **`uvx` as the runner**: Python-based MCP servers are run via `uvx` (from `uv`, the fast Python package manager). This requires Python + uv to be installed, but avoids polluting the global Python environment. `uv` is the modern standard for running Python tools.

4. **OAuth2 credentials via env vars**: Client ID and secret stored as env vars (never hardcoded). Consistent with how `APIFY_TOKEN` is handled in the existing `.mcp.json`.

5. **`/tasks` command as an overlay**: The MCP tools give Claude raw access. The `/tasks` command adds structure — a daily briefing format so you get a consistent, useful output rather than ad-hoc answers.

6. **Not using `liadgez/ticktick-mcp-server` (112 ops)**: More complex, harder to set up, and the extra ops (habits, focus sessions, analytics) aren't needed for basic task management. Simpler is better for reliability.

### Alternatives Considered

- **Composio hosted MCP**: Easiest to set up (no self-hosting), but requires an external Composio account and routes all API calls through their servers. Less control and a dependency on a third-party service. Rejected in favor of self-hosted.
- **Node.js REST API scripts**: Would require writing and maintaining a script, running it manually, and parsing output. MCP gives the same capability but live and interactive. Rejected.
- **`jen6/ticktick-mcp`**: Uses the unofficial `ticktick-py` library. Could break if TickTick changes their internal API. Rejected in favor of the official API approach.

### Open Questions

1. **Is Python + uv installed on this machine?** The MCP server requires `uvx` to run. If not installed, Step 1 covers this. (Check: `uvx --version` in terminal)
2. **TickTick account region**: Using ticktick.com (international)? Or dida365.com (China)? The API base URL differs. Plan assumes ticktick.com.
3. **Existing TickTick projects/lists**: No changes to existing data — read-only until user explicitly asks Claude to create/update tasks.

---

## Step-by-Step Tasks

### Step 1: Verify / Install Prerequisites

Before configuring the MCP server, confirm `uv` (and `uvx`) is available on the system.

**Actions:**

- Run in terminal: `uvx --version`
- If not found, install uv: `winget install --id=astral-sh.uv -e` (or download from https://docs.astral.sh/uv/getting-started/installation/)
- Confirm after install: `uvx --version` should return a version number

**Files affected:**

- None (system-level check)

---

### Step 2: Register TickTick Developer App and Get Credentials

This is a one-time step the user does manually at developer.ticktick.com.

**Actions:**

1. Go to **https://developer.ticktick.com/** and sign in with your TickTick account
2. Click **"Create App"** (or "New Application")
3. Fill in:
   - **App Name**: `Claude Workspace` (or anything)
   - **OAuth Redirect URI**: `http://localhost:8080` (must be exact — used during first-time auth)
   - **Scopes**: select `tasks:read` and `tasks:write`
4. Submit — you'll receive a **Client ID** and **Client Secret**
5. Save these somewhere secure (you'll need them in Step 3)

**Files affected:**

- None (external service setup)

---

### Step 3: Create `reference/ticktick-setup.md`

Document the setup process permanently so it can be referenced in future sessions.

**Actions:**

Create `reference/ticktick-setup.md` with the following content:

```markdown
# TickTick MCP Setup Guide

## Prerequisites
- Python + uv installed: `winget install astral-sh.uv`
- TickTick account at ticktick.com

## One-Time: Register Developer App
1. Go to https://developer.ticktick.com/
2. Sign in → Create App
3. Set redirect URI to: `http://localhost:8080`
4. Enable scopes: `tasks:read`, `tasks:write`
5. Copy your Client ID and Client Secret

## Environment Variables
Set these before running Claude Code (or add to your shell profile):

```powershell
$env:TICKTICK_CLIENT_ID="your_client_id_here"
$env:TICKTICK_CLIENT_SECRET="your_client_secret_here"
```

Or in .env / system environment variables (Windows):
- Search "Environment Variables" in Start menu
- Add: `TICKTICK_CLIENT_ID` and `TICKTICK_CLIENT_SECRET`

## First-Time Authentication
When Claude Code starts with the MCP configured, the server will attempt OAuth2.
If it fails or prompts for auth:
1. Run in terminal: `uvx --from git+https://github.com/jacepark12/ticktick-mcp ticktick-mcp`
2. Follow the authorization URL it prints — opens browser, you log in, approve access
3. Token is cached locally. Subsequent sessions use the cached token (valid ~6 months).

## Available Tools (via MCP)
Once configured, Claude can:
- List all projects and tasks
- Get tasks by project, priority, or due date (today / this week / overdue)
- Create tasks (title, description, due date, priority, project)
- Update tasks (any field)
- Complete tasks
- Delete tasks
- Search tasks by keyword

## Troubleshooting
- **"uvx not found"**: Install uv first — `winget install astral-sh.uv`
- **Auth loop**: Delete cached token file and re-run the auth flow above
- **"Client ID not set"**: Ensure env vars are set before starting Claude Code
```

**Files affected:**
- `reference/ticktick-setup.md` (create)

---

### Step 4: Add TickTick MCP Server to `.mcp.json`

Update the existing `.mcp.json` to add the TickTick MCP server alongside the existing Apify entry.

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

New content:
```json
{
  "apify": {
    "command": "npx",
    "args": ["-y", "@apify/actors-mcp-server"],
    "env": {
      "APIFY_TOKEN": "${APIFY_TOKEN}"
    }
  },
  "ticktick": {
    "command": "uvx",
    "args": [
      "--from",
      "git+https://github.com/jacepark12/ticktick-mcp",
      "ticktick-mcp"
    ],
    "env": {
      "TICKTICK_CLIENT_ID": "${TICKTICK_CLIENT_ID}",
      "TICKTICK_CLIENT_SECRET": "${TICKTICK_CLIENT_SECRET}"
    }
  }
}
```

**Files affected:**
- `.mcp.json`

---

### Step 5: Create `.claude/commands/tasks.md`

A new slash command for structured daily task review. This gives a consistent, useful output rather than ad-hoc questions.

**Actions:**

Create `.claude/commands/tasks.md` with the following content:

```markdown
# Tasks

> Daily task review and management session using TickTick. Run to get a structured view of your task list, prioritize for the day, and manage tasks hands-free.

---

## Run

Using the TickTick MCP tools available in this session:

1. Fetch all projects (list of TickTick lists/projects)
2. Fetch tasks due today
3. Fetch overdue tasks
4. Fetch tasks due this week (not today)

---

## Produce

Generate a structured **Daily Task Briefing** with these sections:

### 1. Overdue Tasks
List all overdue tasks with:
- Task title
- Project/list it belongs to
- Original due date
- Priority (if set)

If none: "No overdue tasks. ✅"

### 2. Today's Tasks
List all tasks due today:
- Task title
- Project/list
- Priority
- Any notes/description preview (first line only)

Group by project if more than 5 tasks total.

### 3. This Week (Upcoming)
List tasks due in the next 7 days (excluding today), grouped by due date.

Show maximum 10. If more exist, note "and N more this week."

### 4. Quick Stats
- Total tasks due today: N
- Overdue: N
- This week: N
- Total open tasks across all projects: N

### 5. Suggested Focus
Based on priority and due dates, suggest the top 3 tasks to focus on first today. Explain briefly why each was selected (overdue, high priority, deadline approaching, etc.).

### 6. Action Prompt
End with:

> Ready to manage tasks. You can ask me to:
> - "Mark [task] as done"
> - "Add a task: [title] due [date] in [project]"
> - "Move [task] to tomorrow"
> - "Show me all tasks in [project]"
> - "What's overdue?"

---

## Notes

If the TickTick MCP is not connected (tools unavailable), display:
> TickTick MCP is not connected. Check that TICKTICK_CLIENT_ID and TICKTICK_CLIENT_SECRET env vars are set and restart Claude Code. See `reference/ticktick-setup.md` for instructions.
```

**Files affected:**
- `.claude/commands/tasks.md` (create)

---

### Step 6: Update `CLAUDE.md`

Add the `/tasks` command and TickTick integration to the workspace documentation.

**Actions:**

In the **Commands** section, add after the existing `/outreach-leads` entry:

```markdown
### /tasks

**Purpose:** Daily task review and management session using TickTick.

Run to get a structured briefing of overdue tasks, today's tasks, and upcoming tasks this week. Claude can also create, update, complete, and delete tasks directly via natural language.

**Requires:** `TICKTICK_CLIENT_ID` and `TICKTICK_CLIENT_SECRET` env vars set. See `reference/ticktick-setup.md`.
```

In the **Workspace Structure** section, update the `.mcp.json` line to mention TickTick:

Change:
```
├── .mcp.json              # MCP server config (Apify for Google Maps extraction)
```

To:
```
├── .mcp.json              # MCP server config (Apify for Google Maps; TickTick for task management)
```

**Files affected:**
- `CLAUDE.md`

---

### Step 7: Validation

Confirm the integration works end-to-end.

**Actions:**

1. Set env vars in terminal:
   ```powershell
   $env:TICKTICK_CLIENT_ID="your_id"
   $env:TICKTICK_CLIENT_SECRET="your_secret"
   ```
2. Restart Claude Code (MCP servers load at startup)
3. In a new session, run `/tasks`
4. Confirm Claude fetches real tasks from TickTick and displays the Daily Task Briefing
5. Ask Claude to "mark [any task] as complete" and verify it updates in TickTick app

**Files affected:**
- None (validation only)

---

## Connections & Dependencies

### Files That Reference This Area

- `.mcp.json` — modified directly
- `CLAUDE.md` — documents the new command
- `reference/ticktick-setup.md` — new reference file, linked from CLAUDE.md and the `/tasks` command

### Updates Needed for Consistency

- `context/` files may reference tasks manually in the future — Claude can now cross-reference these against live TickTick data
- `/weekly-leads` could eventually suggest adding TickTick tasks for follow-ups (future enhancement, not in scope now)

### Impact on Existing Workflows

- Zero impact on existing workflows (Apify, outreach pipeline, etc.)
- Additive only — new MCP entry alongside existing Apify entry
- `/tasks` is a new independent command, no dependencies on other commands

---

## Validation Checklist

- [ ] `uvx --version` returns a version (uv is installed)
- [ ] TickTick developer app registered at developer.ticktick.com with correct redirect URI
- [ ] `TICKTICK_CLIENT_ID` and `TICKTICK_CLIENT_SECRET` env vars are set
- [ ] `.mcp.json` updated with ticktick entry (valid JSON, no syntax errors)
- [ ] Claude Code restarted — TickTick MCP tools appear in session
- [ ] `/tasks` command runs and returns real TickTick data
- [ ] Task creation via Claude updates TickTick app in real time
- [ ] `reference/ticktick-setup.md` created with complete instructions
- [ ] `CLAUDE.md` updated with `/tasks` command and updated `.mcp.json` description

---

## Success Criteria

The implementation is complete when:

1. Running `/tasks` in Claude produces a structured Daily Task Briefing populated with real data from your TickTick account.
2. Saying "mark [task] as done" or "add a task: [title] due tomorrow" updates TickTick in real time — visible in the TickTick mobile/desktop app immediately.
3. `reference/ticktick-setup.md` provides sufficient instructions to re-configure the integration from scratch in a future session.

---

## Notes

**First-time auth flow:** The first time the MCP server runs, it will need to complete the OAuth2 authorization. This may open a browser window or print an authorization URL to the terminal. After approving access once, the token is cached locally and no re-auth is needed for ~6 months.

**Token storage:** The `jacepark12/ticktick-mcp` server caches the OAuth2 token in a local file (typically in the Python environment's cache dir). It is not stored in the workspace — no risk of accidentally committing credentials.

**Future enhancement:** Once TickTick tasks are live in Claude, a natural next step is cross-referencing them with the outreach pipeline — e.g., automatically suggesting a TickTick task when a lead books a demo, or surfacing overdue follow-up tasks in `/weekly-leads`.

**Alternative if `jacepark12/ticktick-mcp` doesn't install cleanly:** Fall back to `jen6/ticktick-mcp` which uses the unofficial `ticktick-py` library but is simpler to install: `uvx --from git+https://github.com/jen6/ticktick-mcp ticktick-mcp`. Same MCP interface, different underlying library.
