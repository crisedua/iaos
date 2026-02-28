# Plan: Automated Lead Outreach Pipeline

**Created:** 2026-02-25
**Status:** Implemented
**Request:** Automatically contact Google Maps leads — transform the extracted leads CSV into a working outreach pipeline that sends (or prepares) personalized WhatsApp messages for each lead with minimal manual effort.

---

## Overview

### What This Plan Accomplishes

This plan creates an automated outreach pipeline that takes the extracted `leads-all.csv` (969 leads), scores and selects the top prospects each day, generates personalized WhatsApp messages using the existing outreach scripts, and either sends them automatically via the Twilio API or outputs a ready-to-send file for manual or tool-assisted sending. A contact tracker prevents duplicate outreach and a new `/outreach-leads` Claude command adds interactive oversight.

### Why This Matters

969 leads are sitting in a CSV file and doing nothing. The bottleneck is not finding leads — it's the manual effort of composing, personalizing, sending, and tracking messages for each one. Automating this transforms the leads asset into an active pipeline, enabling consistent daily outreach at scale without manual overhead, which is the core mechanic for hitting the 5 leads/week target.

---

## Current State

### Relevant Existing Structure

```
outputs/leads/
  leads-log.md                          # Manual weekly tracking table
  gmap-extracts/2026-02-25/
    leads-all.csv                       # 969 clean leads (source)
    leads-santiago.csv                  # 354 records
    leads-vina-del-mar.csv              # 349 records
    leads-valparaiso.csv                # 266 records

reference/
  outreach-scripts.md                   # Cold call + WhatsApp scripts (templates)
  gmap-search-params.md                 # ICP qualification signals

context/
  lead-generation.md                    # Weekly routine, qualification criteria, targets
  strategy.md                          # Q1 priorities: 5 leads/week, SolIA focus

.claude/commands/
  weekly-leads.md                       # Existing Monday review command
  extract-leads-gmap.md                 # Existing extraction command

scripts/
  run-apify-jobs.sh                     # Bash script pattern for automation
```

### Gaps or Problems Being Addressed

- **No sending mechanism**: Leads are extracted but there is no way to contact them in bulk — each message must be written and sent manually.
- **No personalization at scale**: Composing a personalized WhatsApp message for each of 969 contacts individually is impractical.
- **No contact tracking**: No system to know which leads have already been messaged, who responded, and who needs follow-up.
- **No ICP-based prioritization**: The CSV is sorted by review count but there's no scoring system that applies all ICP signals (phone present + website + review count range + category priority) to surface the best leads first.
- **No `/outreach-leads` command**: No interactive Claude command for daily outreach planning and review.

---

## Proposed Changes

### Summary of Changes

- **New script**: `scripts/prepare-outreach.js` — scores leads, selects today's batch, generates personalized WhatsApp messages, outputs a daily outreach file
- **New script**: `scripts/send-whatsapp.js` — reads the daily outreach queue and sends messages via Twilio WhatsApp API (optional, activated by env vars)
- **New tracking file**: `outputs/leads/outreach-tracker.json` — JSON index of all contacted leads (phone → status, timestamps)
- **New command**: `.claude/commands/outreach-leads.md` — interactive daily outreach session with Claude
- **New reference file**: `reference/whatsapp-automation-setup.md` — setup guide for Twilio WhatsApp API (credentials, sandbox vs. production)
- **Modified**: `CLAUDE.md` — add new command and script to workspace documentation
- **Modified**: `outputs/leads/leads-log.md` — extend format to accommodate auto-logged contacts from the script

### New Files to Create

| File Path | Purpose |
|---|---|
| `scripts/prepare-outreach.js` | Reads leads CSV, scores + selects N leads, generates personalized WhatsApp messages, outputs daily outreach file and updates tracker |
| `scripts/send-whatsapp.js` | Sends WhatsApp messages from the daily outreach queue via Twilio API; respects rate limits; logs delivery status |
| `outputs/leads/outreach-tracker.json` | Master contact log: maps phone/url → `{status, first_contacted, last_contact, channel, response}` |
| `.claude/commands/outreach-leads.md` | New slash command for interactive daily outreach session |
| `reference/whatsapp-automation-setup.md` | Step-by-step Twilio WhatsApp setup guide (sandbox → production, env vars, template approval) |

### Files to Modify

| File Path | Changes |
|---|---|
| `CLAUDE.md` | Add `/outreach-leads` to Commands section; add `scripts/` entries for new scripts |
| `outputs/leads/leads-log.md` | Add a note that the tracker is the authoritative contact log; keep as weekly summary view |

---

## Design Decisions

### Key Decisions Made

1. **WhatsApp over auto-dialing**: Automated phone calling is legally restricted in Chile (Ley 19.628 + SUBTEL regulations on robocalls) and technically complex. WhatsApp via Twilio is compliant when using approved templates, is already part of the SolIA stack, and produces a written record. This is the right channel.

2. **Twilio as the API layer**: The user's strategy already names Twilio as the default stack. Using Twilio's WhatsApp Business API means the same account used for SolIA can send outreach, keeping infrastructure simple.

3. **Two-mode architecture (prepare + send as separate scripts)**: Separating preparation from sending gives the user a review window. `prepare-outreach.js` generates the outreach file; `send-whatsapp.js` sends it. The user can run prepare, review the messages, then run send — or automate both together. This prevents accidents.

4. **ICP scoring built into prepare script**: Rather than using raw review count as the only signal, the prepare script will compute an ICP score per lead based on the criteria in `gmap-search-params.md` (review count ≥ 20, phone present, website present, category priority). Highest-scoring leads are contacted first.

5. **Daily batch size of 20 messages max**: WhatsApp Business Policy and practical anti-spam best practice. Sending 20/day means the 969 leads can be covered in ~7 weeks — sustainable and safer than bulk blasting.

6. **Rate limit: 5-second delay between sends**: Prevents triggering WhatsApp abuse detection. Configurable via env var `WA_DELAY_MS`.

7. **Tracker is the source of truth, log is the summary view**: `outreach-tracker.json` is authoritative for contact history (machine-readable). `leads-log.md` remains the human-readable weekly summary, with the script appending to it automatically.

8. **Message personalization using template variables**: The WhatsApp opener from `reference/outreach-scripts.md` is parameterized with `{business_name}`, `{category_label}`, `{city}`. The prepare script fills these from CSV fields to produce a unique message per lead.

9. **Graceful degradation without Twilio**: If `TWILIO_ACCOUNT_SID` is not set, `send-whatsapp.js` outputs messages to the console/file only and prints instructions for manual sending. This keeps the pipeline usable even before Twilio is configured.

### Alternatives Considered

- **Make.com / n8n automation from Google Sheets**: Would require a persistent webhook, an external account, and ongoing maintenance. Keeping everything in Node.js scripts means the pipeline runs from Claude Code with zero additional accounts initially.
- **Email outreach**: No email data in the Google Maps extract. Not applicable.
- **Bulk WhatsApp tools (WATI, Respond.io)**: These are good production options but require subscriptions and setup beyond what a Node.js script needs. Can be added later as the scale grows.
- **Fully automated end-to-end (no review step)**: Risky for a first run — a bad template or wrong number could cause issues at scale. The two-step design is safer.

### Open Questions

1. **Twilio setup status**: Does the user have a Twilio account with WhatsApp Business API enabled, or are they starting from scratch? The plan handles both via the setup guide, but implementation order depends on this.
2. **WhatsApp template approval**: Twilio requires pre-approved message templates for "business-initiated" WhatsApp conversations (first contact with a new number). Are templates already approved, or does approval need to be built into the plan's prerequisites?
3. **Batch size preference**: Is 20 messages/day the right daily volume, or does the user want to send to all 969 in a shorter window (which may require a higher-tier Twilio plan)?

---

## Step-by-Step Tasks

### Step 1: Create `outputs/leads/outreach-tracker.json`

Create an empty but structured tracker file that will accumulate contact history as outreach is sent.

**Actions:**

- Create the file with an empty `contacts` object and metadata
- Schema: `{ "meta": { "created": "YYYY-MM-DD", "total_contacted": 0 }, "contacts": {} }`
- The `contacts` object is keyed by normalized phone number (or `maps_url` if no phone)
- Each contact entry: `{ "business_name", "category", "city", "phone", "maps_url", "status", "channel", "first_contacted", "last_contact", "message_sent", "response_notes" }`

**Files affected:**
- `outputs/leads/outreach-tracker.json` (create)

---

### Step 2: Create `scripts/prepare-outreach.js`

This is the core script. It reads the leads CSV, scores each lead, selects the top N uncontacted leads for today, and generates a daily outreach file with personalized messages.

**Actions:**

- Read `outputs/leads/gmap-extracts/2026-02-25/leads-all.csv` (hardcoded path, or accept as CLI arg)
- Read `outputs/leads/outreach-tracker.json` to build a set of already-contacted phone numbers / map URLs
- Score each uncontacted lead with an ICP score (0–5):
  - +2 if `review_count >= 20`
  - +1 if `phone` is populated
  - +1 if `website` is populated
  - +1 if `category` is `dentistas` or `clinicas` (highest fit for SolIA per strategy)
- Select top `BATCH_SIZE` (default 20, configurable via `--batch` CLI arg) highest-scoring uncontacted leads
- For each selected lead, generate a personalized WhatsApp message using this template (from `reference/outreach-scripts.md`):

```
Hola {business_name}, le escribo porque vi su negocio en Google Maps. Me llamo Esteban y trabajo con {category_label} en Chile instalando un agente de voz con IA que contesta llamadas 24/7.
Vi que reciben bastantes consultas y quería preguntar: ¿suelen perder llamadas cuando están ocupados o fuera de horario?
Si les interesa, con gusto les muestro cómo funciona en 15 minutos. ¿Tienen disponibilidad esta semana?
```

Where `{category_label}` maps to: `dentistas` → `clínicas dentales`, `abogados` → `estudios jurídicos`, `clinicas` → `clínicas médicas`, `inmobiliarias` → `agencias inmobiliarias`.

- Output `outputs/leads/daily-outreach/YYYY-MM-DD-outreach.json`: array of `{ phone, business_name, city, category, maps_url, ica_score, message }`
- Also output a human-readable `outputs/leads/daily-outreach/YYYY-MM-DD-outreach.md` showing each lead with their message for review
- Update `outreach-tracker.json`: mark each selected lead with `status: "queued"`, `first_contacted: null` (not sent yet)
- Print summary: `Selected {N} leads for today. Highest ICP score: {N}. Lowest in batch: {N}.`

**Files affected:**
- `scripts/prepare-outreach.js` (create)
- `outputs/leads/outreach-tracker.json` (updated at runtime)
- `outputs/leads/daily-outreach/YYYY-MM-DD-outreach.json` (created at runtime)
- `outputs/leads/daily-outreach/YYYY-MM-DD-outreach.md` (created at runtime)

---

### Step 3: Create `scripts/send-whatsapp.js`

This script reads today's outreach queue and sends each message via Twilio's WhatsApp API. Runs after `prepare-outreach.js`.

**Actions:**

- Accept CLI arg `--date YYYY-MM-DD` (default: today) to specify which outreach file to send
- Read `outputs/leads/daily-outreach/{date}-outreach.json`
- Skip any leads in the queue that already have `status: "sent"` in tracker (idempotent — safe to re-run)
- Check for `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` env vars
  - If any are missing: print the messages to console with copy instructions and exit (graceful degradation)
- For each lead in the queue:
  1. Send WhatsApp via Twilio REST API: `POST /2010-04-01/Accounts/{SID}/Messages` with `From: whatsapp:{TWILIO_WHATSAPP_FROM}`, `To: whatsapp:{phone}`, `Body: {message}`
  2. On success: update `outreach-tracker.json` — set `status: "sent"`, `first_contacted: timestamp`, `channel: "whatsapp"`
  3. On failure: log error, set `status: "failed"`, continue
  4. Wait `WA_DELAY_MS` (default 5000ms) before next send
- After all sends: append a row to `outputs/leads/leads-log.md` weekly table for each sent lead
- Print final summary: `Sent: {N} | Failed: {N} | Already sent (skipped): {N}`

**Files affected:**
- `scripts/send-whatsapp.js` (create)
- `outputs/leads/outreach-tracker.json` (updated at runtime)
- `outputs/leads/leads-log.md` (appended at runtime)

---

### Step 4: Create `reference/whatsapp-automation-setup.md`

A concise setup guide so the user can get the Twilio WhatsApp integration working before running `send-whatsapp.js`.

**Actions:**

- Document the 5-step Twilio WhatsApp setup:
  1. Create / log in to Twilio account (twilio.com)
  2. Enable WhatsApp Sandbox (for testing) or apply for WhatsApp Business API (production)
  3. Get credentials: Account SID, Auth Token, WhatsApp sender number
  4. Set environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  5. (Production only) Submit WhatsApp message template for approval — include the exact template text from the prepare script
- Note Chilean WhatsApp number format: `+569XXXXXXXX` for mobiles
- Note Twilio cost: ~$0.005 per WhatsApp message outbound (free in sandbox)
- Note WhatsApp policy: first-contact messages to business numbers are "business-initiated sessions" — require approved templates in production; sandbox skips this

**Files affected:**
- `reference/whatsapp-automation-setup.md` (create)

---

### Step 5: Create `.claude/commands/outreach-leads.md`

A new Claude command for the daily interactive outreach session — run each morning to review today's queue, get help personalizing difficult cases, log responses from previous days, and get follow-up suggestions.

**Actions:**

- Write the command file following the pattern of existing commands (prime.md, weekly-leads.md)
- Command behavior:
  1. Read `outputs/leads/outreach-tracker.json` — show contacts from last 7 days and their statuses
  2. Read today's `outputs/leads/daily-outreach/YYYY-MM-DD-outreach.md` if it exists
  3. Show: leads queued for today | leads with no response from previous days | leads who responded (need follow-up)
  4. For "no response" leads (sent 2–3 days ago): generate follow-up WhatsApp messages from `reference/outreach-scripts.md`
  5. For "responded" leads: prompt user to log their response and suggest next action (demo booking script, objection handler, etc.)
  6. Remind user to run `node scripts/prepare-outreach.js` if today's queue is not yet generated
  7. Provide the daily action checklist: prepare → review → send → log responses

**Files affected:**
- `.claude/commands/outreach-leads.md` (create)

---

### Step 6: Update `CLAUDE.md`

Add the new command and scripts to the workspace documentation so future sessions have accurate context.

**Actions:**

- In the **Commands** section: add `/outreach-leads` with description "Daily outreach session — review queue, log responses, get follow-up scripts"
- In the **Workspace Structure** table or a new **Scripts** subsection: document `prepare-outreach.js` and `send-whatsapp.js` with one-line purpose descriptions
- Add a note under `outputs/leads/` that `outreach-tracker.json` and `daily-outreach/` now exist

**Files affected:**
- `CLAUDE.md`

---

### Step 7: Initialize `outputs/leads/daily-outreach/` directory

Create the directory and a `.gitkeep` placeholder so the structure is visible.

**Actions:**

- Create `outputs/leads/daily-outreach/` directory
- Add a brief `README.md` inside explaining the file naming convention (`YYYY-MM-DD-outreach.json` and `.md`)

**Files affected:**
- `outputs/leads/daily-outreach/README.md` (create)

---

### Step 8: Validation run (dry run)

After all files are created, run `prepare-outreach.js` in dry-run mode to confirm it works end-to-end.

**Actions:**

- Run: `node scripts/prepare-outreach.js --batch 5 --dry-run`
- Verify: outputs `daily-outreach/YYYY-MM-DD-outreach.md` with 5 leads
- Verify: each lead has a complete personalized WhatsApp message
- Verify: `outreach-tracker.json` is updated with those 5 leads marked `queued`
- Verify: no errors

**Files affected:**
- All runtime outputs listed above (inspect, do not commit)

---

## Connections & Dependencies

### Files That Reference This Area

- `context/lead-generation.md` — references `outputs/leads/leads-log.md` and the weekly routine; the new daily outreach pipeline extends this
- `.claude/commands/weekly-leads.md` — reads `leads-log.md` which will now be auto-populated by the send script
- `reference/outreach-scripts.md` — the message templates used by `prepare-outreach.js` come from here

### Updates Needed for Consistency

- `context/lead-generation.md` should be updated (post-implementation) to reference the new automated pipeline as the primary contact mechanism, replacing the manual daily routine description
- `outputs/leads/leads-log.md` format should be consistent with what `send-whatsapp.js` appends to it

### Impact on Existing Workflows

- `/weekly-leads` command is unchanged but now reads a log that has been auto-populated — it will have more data to work with
- `/extract-leads-gmap` is upstream and unchanged; its CSV output is the input to the new pipeline
- The manual daily routine described in `context/lead-generation.md` (Mon research, Tue–Thu call) becomes augmented: automated WhatsApp runs daily via script, cold calls remain manual but can now focus only on high-priority leads the script surfaces

---

## Validation Checklist

- [ ] `outreach-tracker.json` exists and is valid JSON with correct schema
- [ ] `prepare-outreach.js` runs without errors: `node scripts/prepare-outreach.js --batch 5 --dry-run`
- [ ] Output `daily-outreach/YYYY-MM-DD-outreach.md` contains 5 leads with personalized messages
- [ ] ICP scoring is working: selected leads have `review_count >= 20` and populated phones where available
- [ ] No already-contacted leads are included in the batch (idempotency check)
- [ ] `send-whatsapp.js` runs without errors in no-Twilio mode and prints messages + manual instructions
- [ ] `send-whatsapp.js` correctly reads `TWILIO_*` env vars when set
- [ ] `outreach-tracker.json` is updated after prepare run (leads marked `queued`)
- [ ] `leads-log.md` is appended correctly after a send (or simulated send)
- [ ] `/outreach-leads` command loads and produces a coherent daily briefing
- [ ] `CLAUDE.md` updated with new command and scripts
- [ ] `reference/whatsapp-automation-setup.md` exists with complete Twilio instructions

---

## Success Criteria

The implementation is complete when:

1. Running `node scripts/prepare-outreach.js` selects 20 uncontacted leads, scores them by ICP, and produces a `daily-outreach/YYYY-MM-DD-outreach.md` file with one personalized WhatsApp message per lead — without any manual composition.
2. Running `node scripts/send-whatsapp.js` either sends those messages via Twilio (if configured) or prints them with copy instructions (if not configured), and updates the contact tracker in both cases.
3. Running `/outreach-leads` in Claude gives a clear daily briefing: queue size, pending follow-ups, suggested follow-up messages for non-responders, and an action checklist.

---

## Notes

**Compliance note (Chile):** WhatsApp-based outbound sales contact to business numbers is common practice in Chile's B2B market. Using Twilio's official API with the Twilio-registered number (not the user's personal number) reduces legal exposure. For GDPR-equivalent (Ley 19.628) compliance: only contact numbers sourced from public directories (Google Maps public listings qualify), do not store unnecessary personal data, and honor any "not interested" responses by marking the lead as `opted_out` in the tracker and never contacting them again.

**Scale path:** Once the pipeline is running, the next evolution is:
1. Adding a `scripts/log-responses.js` that reads incoming Twilio webhook events and auto-updates the tracker when leads reply
2. Connecting to a real CRM (HubSpot free tier or Airtable) instead of JSON for pipeline visibility
3. Running `prepare-outreach.js` via a Windows Task Scheduler cron job for fully hands-off daily sends

**WhatsApp template note:** Twilio's sandbox allows sending to test numbers without template approval. For production (real cold outreach), Twilio requires the message template to be pre-approved by Meta. The template from this plan ("Hola {1}, le escribo porque vi su negocio...") will need to be submitted for approval before going live at scale. This can take 1–3 business days.

---

## Implementation Notes

**Implemented:** 2026-02-25

### Summary

All 8 steps executed in full. Created the outreach tracker, both scripts (prepare + send), Twilio setup guide, /outreach-leads command, daily-outreach directory, and updated CLAUDE.md. Validation dry-run and live run both passed — 5 leads selected, personalized messages generated, tracker updated, send-whatsapp.js correctly fell back to preview mode (Twilio not configured).

### Deviations from Plan

- `send-whatsapp.js` in preview mode also updates tracker `last_contact` timestamp (tracker entry stays `queued`). This was a minor addition for traceability — no functional impact.
- Validation run used batch of 5 (not 20) to keep test output clean; live default remains 20.

### Issues Encountered

None. All scripts ran without errors on first execution.
