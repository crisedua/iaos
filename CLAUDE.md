# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is the **Gravity Claw / Mission Control workspace** — a full AI operating system comprising:

- **Mission Control**: Local web dashboard (Vite+React, `dashboard/`) — private command center at localhost
- **Gravity Claw**: Always-on agent (`gravity-claw/`) — deployable to Railway, reachable 24/7 via Telegram
- **Supabase**: Shared backend that keeps Mission Control and Gravity Claw in sync
- **soul.md**: Agent constitution (at workspace root) — loaded by both Claude Code and Gravity Claw

Use `/prime` at session start to load full context. `soul.md` is always consulted.

---

## The Claude-User Relationship

Claude operates as an **agent assistant** with access to the workspace folders, context files, commands, and outputs. The relationship is:

- **User**: Defines goals, provides context about their role/function, and directs work through commands
- **Claude**: Reads context, understands the user's objectives, executes commands, produces outputs, and maintains workspace consistency

Claude should always orient itself through `/prime` at session start, then act with full awareness of who the user is, what they're trying to achieve, and how this workspace supports that.

---

## Workspace Structure

```
.
├── CLAUDE.md              # This file — core context, always loaded
├── soul.md                # Agent constitution — loaded by Gravity Claw and /prime
├── supabase-schema.sql    # Run in Supabase SQL Editor to create all tables
├── .mcp.json              # MCP server config
├── .claude/
│   └── commands/          # Slash commands
├── context/               # Personal & business context files
├── plans/                 # Implementation plans
├── outputs/               # Work products and deliverables
├── reference/             # Templates, frameworks, reusable docs
├── scripts/               # Automation scripts (outreach, Telegram bot, etc.)
├── dashboard/             # Mission Control — Vite+React local dashboard
│   ├── api-server.js      # Express API (port 3001) — runs alongside Vite dev server
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx        # Claude chat with workspace context
│   │   │   ├── FreedcampPanel.jsx   # Human tasks + AI job log
│   │   │   ├── RemindersPanel.jsx   # Scheduled reminders + daily brief
│   │   │   ├── DocumentsPanel.jsx   # Generated PDFs and files
│   │   │   ├── MemoryPanel.jsx      # Core Memory editor (Supabase)
│   │   │   └── ...                 # Existing panels
│   └── .env               # ANTHROPIC_API_KEY + SUPABASE_URL + SUPABASE_ANON_KEY
└── gravity-claw/          # Always-on agent — deploy to Railway
    ├── index.js           # Entry point: Telegram webhook + cron jobs
    ├── soul.js            # Loads soul.md + core memory for context
    ├── memory.js          # 3-tier memory (conversation buffer + Supabase)
    ├── router.js          # Model routing: cheap (haiku) / smart (opus)
    ├── tools.js           # Freedcamp, reminders, documents, memory tools
    ├── package.json
    ├── Procfile           # Railway: "web: node index.js"
    ├── railway.json
    └── .env.example       # Required env vars for the agent
```

**Key directories:**

| Directory    | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `context/`   | Who the user is, their role, current priorities, strategies. Read by `/prime`.      |
| `plans/`     | Detailed implementation plans. Created by `/create-plan`, executed by `/implement`. |
| `outputs/`   | Deliverables, analyses, reports, and work products. `leads/` subfolder: weekly tracking log, contact tracker, daily outreach queues, and `gmap-extracts/` for bulk CSV exports. `ia-os-clients/` subfolder: per-client IA OS files + `prospects.md` pipeline tracker. `challenge/` subfolder: AI CEO Challenge funnel tracker and contact list. |
| `reference/` | Helpful docs, templates and patterns to assist in various workflows. Includes full IA OS Director service delivery and acquisition assets (see file tree above). |
| `scripts/`   | Automation scripts: `prepare-outreach.js` (score + select leads; `--channel whatsapp\|sms\|email`), `send-whatsapp.js` (WhatsApp via Twilio), `send-sms.js` (SMS via Twilio), `find-emails.js` (crawl websites to discover emails), `send-email.js` (email via SMTP/Gmail), `run-apify-jobs.sh` (Apify batch runner). |

---

## Commands

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run this at the start of every session. Claude will:

1. Read CLAUDE.md and context files
2. Summarize understanding of the user, workspace, and goals
3. Confirm readiness to assist

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use when adding new functionality, commands, scripts, or making structural changes. Produces a thorough plan document in `plans/` that captures context, rationale, and step-by-step tasks.

Example: `/create-plan add a competitor analysis command`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step in order, validates the work, and updates the plan status.

Example: `/implement plans/2026-01-28-competitor-analysis-command.md`

### /weekly-leads

**Purpose:** Run a weekly lead generation review and planning session.

Run every Monday. Claude will:

1. Review last week's leads log and pipeline metrics
2. Identify follow-ups needed
3. Generate this week's outreach plan (5 leads/week target)
4. Produce a prioritized action checklist

### /extract-leads-gmap

**Purpose:** Bulk-extract structured business leads from Google Maps for SolIA outreach.

Run to automatically scrape 4 business categories (dentists, lawyers, medical clinics, real estate agents) across 3 Chilean cities (Santiago, Viña del Mar, Valparaíso). Targets 80+ contacts per category/city combination (12 total jobs). Normalizes, deduplicates, and exports results to `outputs/leads/gmap-extracts/YYYY-MM-DD/` as CSV files, with Google Sheets import instructions.

**Requires:** `APIFY_TOKEN` environment variable set; Node.js installed; Apify account with `compass/crawler-google-places` actor.

**Output:** `outputs/leads/gmap-extracts/YYYY-MM-DD/` (leads-all.csv, per-city CSVs, extraction-summary.md)

### /outreach-leads

**Purpose:** Daily outreach session — review today's queue, get follow-up scripts, log responses.

Run each morning after leads have been extracted. Claude will:

1. Show pipeline status from `outreach-tracker.json`
2. Confirm today's outreach queue is ready (or remind you to run `prepare-outreach.js`)
3. Generate follow-up messages for leads contacted 2–4 days ago with no response
4. Suggest next actions for leads who responded
5. Provide the daily action checklist

**Outreach pipeline scripts** (run from terminal):
- `node scripts/prepare-outreach.js [--channel whatsapp|sms|email]` — score + select leads, generate messages for the chosen channel (default: whatsapp)
- `node scripts/send-whatsapp.js` — send via Twilio WhatsApp (or preview if Twilio not set)
- `node scripts/send-sms.js` — send via Twilio SMS (ban-safe alternative to WhatsApp)
- `node scripts/find-emails.js` — crawl business websites to discover contact emails (run once per CSV)
- `node scripts/send-email.js` — send via Gmail SMTP (requires email discovery first)

**Outreach channel setup:**
- WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — see `reference/whatsapp-automation-setup.md`
- SMS: same Twilio creds + `TWILIO_SMS_FROM` — see `reference/alternative-channels-setup.md`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME` — see `reference/alternative-channels-setup.md`

### /ia-os-session [mode] [client|personal]

**Purpose:** Run a structured IA OS work session — for yourself or a client. Implements the "Director Framework": you direct, Claude executes.

**Modes:**
- `onboard [client]` — Complete intake, build Context OS, identify first automations. Run this for every new client before any other work.
- `review [client|personal]` — Weekly review: synthesizes what happened, surfaces insights, sets 3 priorities, suggests one automation idea.
- `sprint [client|personal]` — Focused work session: bring a task or project, Claude executes it fully with client context loaded.
- `output [type] [client|personal]` — Generate a specific deliverable. Types: `proposal`, `sop`, `report`, `email`, `post`, `checklist`, `summary`.

**Default (no args):** `review personal` — runs your own weekly IA OS review using this workspace's context files.

**Context files read:** `outputs/ia-os-clients/[client]/context-os.md` (for clients) or `context/` folder (for personal).

**Reference files:** `reference/ia-os-director-framework.md`, `reference/ia-os-intake.md`, `reference/ia-os-delivery-sop.md`, `reference/ia-os-context-template.md`

---

## Critical Instruction: Maintain This File

**Whenever Claude makes changes to the workspace, Claude MUST consider whether CLAUDE.md needs updating.**

After any change — adding commands, scripts, workflows, or modifying structure — ask:

1. Does this change add new functionality users need to know about?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need new files to capture this?

If yes to any, update the relevant sections. This file must always reflect the current state of the workspace so future sessions have accurate context.

**Examples of changes requiring CLAUDE.md updates:**

- Adding a new slash command → add to Commands section
- Creating a new output type → document in Workspace Structure or create a section
- Adding a script → document its purpose and usage
- Changing workflow patterns → update relevant documentation

---

## For Users Downloading This Template

To customize this workspace to your own needs, fill in your context documents in `context/` and modify as needed. Then use `/create-plan` to plan out and `/implement` to execute any structural changes. This ensures everything stays in sync — especially CLAUDE.md, which must always reflect the current state of the workspace.

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Work**: Use commands or direct Claude with tasks
3. **Plan changes**: Use `/create-plan` before significant additions
4. **Execute**: Use `/implement` to execute plans
5. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse
