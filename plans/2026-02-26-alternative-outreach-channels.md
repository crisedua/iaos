# Plan: Alternative Automated Outreach Channels (SMS + Email)

**Created:** 2026-02-26
**Status:** Implemented
**Request:** Replace WhatsApp outreach with 2 automated alternatives that avoid WhatsApp's ban risk

---

## Overview

### What This Plan Accomplishes

This plan adds two fully automated outreach channels — **Twilio SMS** and **Cold Email** — that reuse the existing lead data, tracker, and pipeline infrastructure. Both channels integrate with the existing `prepare-outreach.js` → send → tracker flow so the daily routine stays the same.

### Why This Matters

WhatsApp cold outreach at volume risks account bans (Meta flags unsolicited bulk messages). SMS uses the same phone numbers already extracted but via a completely separate, ban-safe regulatory path. Email is the most professional, scalable, and ban-proof channel — with websites already in the CSV for ~70% of leads, email addresses are extractable automatically.

---

## Current State

### Relevant Existing Structure

```
scripts/
  prepare-outreach.js     — scores leads, builds daily queue, writes messages
  send-whatsapp.js        — sends queue via Twilio WhatsApp API
  telegram-bot.js         — mobile control bot (/send triggers send-whatsapp.js)
outputs/leads/
  outreach-tracker.json   — master contact log (status, channel, timestamps)
  daily-outreach/         — YYYY-MM-DD-outreach.json + .md review files
  gmap-extracts/          — CSVs with: business_name, phone, website, category, city
reference/
  whatsapp-automation-setup.md
```

### Gaps or Problems Being Addressed

- **Single channel dependency:** All automation is hardwired to WhatsApp/Twilio. No fallback.
- **Ban risk:** WhatsApp flags cold outreach at volume. Account bans kill the pipeline overnight.
- **Email field missing:** The CSV has `website` URLs but no `email` field — needs an extraction step.
- **No channel routing in tracker:** `outreach-tracker.json` doesn't record which channel was used per contact.

---

## Proposed Changes

### Summary of Changes

- Add `scripts/send-sms.js` — drop-in replacement for send-whatsapp.js using Twilio SMS API
- Add `scripts/find-emails.js` — crawls business websites from the CSV to extract contact emails
- Add `scripts/send-email.js` — sends the daily queue via SMTP (Gmail/SendGrid)
- Update `scripts/prepare-outreach.js` — add `--channel` flag (`whatsapp`|`sms`|`email`) to adapt message tone and select only leads with the required contact field
- Update `scripts/telegram-bot.js` — add `/sendsms` and `/sendemail` commands
- Add `reference/alternative-channels-setup.md` — env vars and setup guide for both channels
- Update `CLAUDE.md` — document new scripts and channel flags

### New Files to Create

| File Path | Purpose |
|---|---|
| `scripts/send-sms.js` | Sends daily outreach queue via Twilio SMS (not WhatsApp) |
| `scripts/find-emails.js` | Crawls websites in the CSV to discover business email addresses |
| `scripts/send-email.js` | Sends daily outreach queue via SMTP email |
| `reference/alternative-channels-setup.md` | Setup guide: env vars, limits, compliance tips |

### Files to Modify

| File Path | Changes |
|---|---|
| `scripts/prepare-outreach.js` | Add `--channel` flag; filter leads by available contact field; adapt message template per channel |
| `scripts/telegram-bot.js` | Add `/sendsms` and `/sendemail` commands alongside existing `/send` |
| `CLAUDE.md` | Add new scripts to the Scripts section with usage notes |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Twilio SMS as Channel 1 (not a new provider):** Same Twilio credentials already set up. Just change the API endpoint from `whatsapp:+number` to plain `+number`. Zero new accounts, zero new billing setup. Immediate.

2. **Email via SMTP (Nodemailer) with Gmail, not SendGrid:** SendGrid requires domain verification and approval workflows. Gmail SMTP works immediately with an App Password — lower friction for getting started. Can upgrade to SendGrid later for higher volume.

3. **Email discovery via website crawling (find-emails.js):** ~70% of leads already have a `website` in the CSV. Crawling the `/contact`, `/contacto`, `/nosotros` pages extracts emails without paying for a Hunter.io subscription. Results are saved back to the CSV/tracker so the work isn't repeated.

4. **`--channel` flag on prepare-outreach.js instead of separate scripts:** One preparation script handles all channels. It filters the lead pool to only leads with the required field (phone for SMS, email for email channel) and adjusts message tone (SMS = shorter/punchier, Email = more formal with subject line).

5. **Tracker records channel per contact:** Each tracker entry gets a `channel` field (`whatsapp`|`sms`|`email`) so you know how each lead was reached and avoid double-contacting on multiple channels at once.

6. **No Instagram/LinkedIn automation:** These platforms have aggressive bot detection and API restrictions — risk of ban is equal or worse than WhatsApp. Not worth the complexity.

### Alternatives Considered

- **SendGrid instead of Gmail SMTP:** More robust for high volume, but requires domain setup and approval. Deferred — easy to swap later.
- **Hunter.io / Apollo for email lookup:** Paid APIs. Avoided — website crawling is free and the data is already in the CSV.
- **Telegram as outreach channel:** Telegram bot already exists but it's a *control interface*, not an outreach channel. Chilean local businesses (dentists, clinics, real estate) are not reliably on Telegram.

### Open Questions (if any)

1. **Gmail account to use for email outreach:** Do you have a dedicated email address for outreach (e.g. esteban@aiOSforbusiness.com or a Gmail)? This affects the SMTP setup instructions in the reference doc.
2. **SMS message language/tone:** Should SMS messages be shorter (160-char limit) and more direct, or similar length to WhatsApp messages? (Plan assumes shorter/punchier.)
3. **Email subject line approach:** Direct ("¿Pierden llamadas fuera de horario?") or softer ("Idea para [Business Name]")?

---

## Step-by-Step Tasks

### Step 1: Create `scripts/send-sms.js`

Mirror the structure of `send-whatsapp.js` but use Twilio's standard SMS API (no `whatsapp:` prefix). Reuse all queue loading, tracker updating, and leads-log logging logic.

**Key difference from send-whatsapp.js:**
- `From` is `TWILIO_SMS_FROM` (a Twilio phone number, not WhatsApp sandbox)
- `To` is the plain phone number (no `whatsapp:` prefix)
- Default delay: 3000ms (SMS rate limits are more lenient)
- Env var: `TWILIO_SMS_FROM` instead of `TWILIO_WHATSAPP_FROM`

**Actions:**
- Create `scripts/send-sms.js` with the full implementation below
- Reuse same CLI flags: `--date`, `--delay`, `--preview`
- Update tracker entries with `channel: "sms"` on send

**File content specification:**

```javascript
#!/usr/bin/env node
/**
 * send-sms.js
 *
 * Sends today's outreach queue via Twilio SMS (plain text message, not WhatsApp).
 * Run AFTER prepare-outreach.js --channel sms has generated the queue.
 *
 * Requires env vars:
 *   TWILIO_ACCOUNT_SID   — Twilio Account SID
 *   TWILIO_AUTH_TOKEN    — Twilio Auth Token
 *   TWILIO_SMS_FROM      — Your Twilio SMS number e.g. +15551234567
 *
 * Usage:
 *   node scripts/send-sms.js
 *   node scripts/send-sms.js --date 2026-02-26
 *   node scripts/send-sms.js --delay 3000
 *   node scripts/send-sms.js --preview
 */
```

Structure mirrors send-whatsapp.js exactly, with these changes:
- `TWILIO_FROM = process.env.TWILIO_SMS_FROM`
- `twilioReady = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM)`
- In `sendSMS()`: POST to same Twilio endpoint but `From: TWILIO_FROM` (no `whatsapp:` prefix), `To: lead.phone` (no `whatsapp:` prefix)
- Log channel as `"sms"` in tracker entries

**Files affected:**
- `scripts/send-sms.js` (new)

---

### Step 2: Create `scripts/find-emails.js`

Crawl each lead's website URL (from leads-all.csv) to find email addresses. Save discovered emails back to the tracker and optionally enrich the CSV.

**Actions:**
- Read `outputs/leads/gmap-extracts/2026-02-25/leads-all.csv` (or `--csv` arg)
- Filter to leads that have a `website` but no `email` in the tracker yet
- For each website, fetch the page + common sub-pages (`/contacto`, `/contact`, `/nosotros`, `/about`, `/equipo`) using Node's built-in `https`/`http`
- Extract emails via regex: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
- Filter out generic/spam emails (noreply@, info@ unless it's the only one, example.com)
- Save discovered emails to `outreach-tracker.json` under each contact entry as `email` field
- Output a summary: how many websites crawled, how many emails found
- Respect a delay of 1000ms between requests to avoid overloading servers

**CLI flags:**
```
node scripts/find-emails.js
node scripts/find-emails.js --csv path/to/leads.csv
node scripts/find-emails.js --limit 50    (only process first N leads with websites)
node scripts/find-emails.js --delay 1500  (ms between requests)
```

**Output:** Updates `outreach-tracker.json` entries with `email` field. Prints summary table.

**Files affected:**
- `scripts/find-emails.js` (new)
- `outputs/leads/outreach-tracker.json` (enriched with email fields)

---

### Step 3: Create `scripts/send-email.js`

Send today's outreach queue via SMTP email using Nodemailer. Uses Gmail SMTP with App Password (or any SMTP provider).

**Actions:**
- Create `scripts/send-email.js`
- Read today's queue (same `daily-outreach/YYYY-MM-DD-outreach.json`)
- For each lead: look up email from `outreach-tracker.json` entry
- Skip leads with no email — log as `failed_no_email`
- Send via Nodemailer SMTP with configurable subject + body
- Update tracker: `status: "sent"`, `channel: "email"`, `email_sent: true`
- Default delay: 10000ms between sends (to avoid Gmail spam flags)

**Env vars required:**
```
SMTP_HOST         e.g. smtp.gmail.com
SMTP_PORT         e.g. 587
SMTP_USER         your Gmail address
SMTP_PASS         Gmail App Password (16-char, not regular password)
SMTP_FROM_NAME    e.g. Esteban - AI OS for Business
```

**Email template (Spanish, professional):**
```
Subject: ¿{BusinessName} pierde llamadas fuera de horario?

Hola equipo de {BusinessName},

Mi nombre es Esteban y trabajo con [clínicas / dentistas / inmobiliarias] en Chile
instalando agentes de voz con IA que contestan llamadas las 24 horas.

Vi su negocio en Google Maps y quería preguntar: ¿suelen perder llamadas
cuando están ocupados o es fuera de horario?

Si les interesa ver cómo funciona, puedo mostrarles en 15 minutos.
¿Tienen disponibilidad esta semana?

Saludos,
Esteban
AI OS for Business
```

**CLI flags:**
```
node scripts/send-email.js
node scripts/send-email.js --preview      (print emails, don't send)
node scripts/send-email.js --delay 15000  (ms between sends)
```

**Files affected:**
- `scripts/send-email.js` (new)

---

### Step 4: Update `scripts/prepare-outreach.js` — add `--channel` flag

Add a `--channel` argument that controls:
1. Which leads are selected (SMS: must have `phone`; email: must have `email` in tracker; whatsapp: must have `phone`)
2. Message format (SMS: condensed to ~160 chars; email: full paragraph with subject; whatsapp: current format)

**Actions:**
- Add `const CHANNEL = getArg('--channel', 'whatsapp')` to CLI arg parsing
- Add channel validation: throw error if channel is not one of `whatsapp|sms|email`
- For SMS channel: use a shorter message template (2 sentences max, no "¿Tienen disponibilidad esta semana?" — just a CTA like "¿Les interesa? Respóndame aquí")
- For email channel: the queue JSON includes `subject` and `body` fields (not just `message`)
- Filter lead pool per channel: skip leads missing the required contact info
- Tag each queued lead with `channel` in the output JSON

**Modified section (prepare-outreach.js buildMessage function):**
```javascript
function buildMessage(lead, channel) {
  const label = CATEGORY_LABELS[lead.category] || 'negocios locales';
  if (channel === 'sms') {
    return `Hola ${lead.business_name}, soy Esteban. Instalo agentes de voz IA para ${label} en Chile — contestan 24/7. ¿Pierden llamadas fuera de horario? Cuénteme: +56 9 XXXX XXXX`;
  }
  // Default (whatsapp) — existing message
  return `Hola ${lead.business_name}, le escribo porque vi su negocio en Google Maps. ...`;
}
```

**Files affected:**
- `scripts/prepare-outreach.js`

---

### Step 5: Update `scripts/telegram-bot.js` — add SMS and email send commands

Add `/sendsms` and `/sendemail` commands that trigger the new scripts, following the same pattern as the existing `/send` → `/sendconfirm` flow.

**Actions:**
- Add `/sendsms` command: sends a confirmation prompt
- Add `/sendsmssconfirm` command: runs `send-sms.js` via `runScript()`
- Add `/sendemail` command: sends a confirmation prompt
- Add `/sendemailconfirm` command: runs `send-email.js` via `runScript()`
- Update `/help` and `/start` to list the new commands
- Update `/prepare` command to accept channel: `/prepare sms` or `/prepare email` → passes `--channel` flag

**Files affected:**
- `scripts/telegram-bot.js`

---

### Step 6: Install Nodemailer dependency

Nodemailer is needed for `send-email.js`.

**Actions:**
- Run `npm install nodemailer` in the project root
- Verify `package.json` is updated with the new dependency

**Files affected:**
- `package.json`
- `package-lock.json`

---

### Step 7: Create `reference/alternative-channels-setup.md`

Setup guide documenting how to configure both channels from scratch.

**Actions:**
- Create `reference/alternative-channels-setup.md` with sections:
  - **Channel 1: Twilio SMS** — what env vars to set, how to get a Twilio SMS number, Chilean number format tips, cost estimate (~$0.007/SMS), compliance note (include opt-out instruction in message)
  - **Channel 2: Email via Gmail SMTP** — how to generate a Gmail App Password, env vars to set, daily send limits (Gmail: ~500/day free), warmup advice (start with 20/day), spam avoidance tips
  - **Workflow comparison table:** WhatsApp vs SMS vs Email — ban risk, response rate, setup effort, cost
  - **Recommended daily limits:** SMS: 25/day, Email: 20/day (first week), 50/day (after warmup)

**Files affected:**
- `reference/alternative-channels-setup.md` (new)

---

### Step 8: Update `CLAUDE.md`

Add new scripts to the Scripts section.

**Actions:**
- In the `scripts/` row of the Workspace Structure table, add new scripts
- Add to the `/outreach-leads` command description a note about channel selection
- Add a brief "Outreach channels" note explaining the three available channels

**Files affected:**
- `CLAUDE.md`

---

### Step 9: Validate end-to-end

Test that both new channels work in preview mode before going live.

**Actions:**
- Run `node scripts/prepare-outreach.js --channel sms --batch 3 --dry-run` — verify queue is generated
- Run `node scripts/send-sms.js --preview` — verify messages print correctly
- Run `node scripts/find-emails.js --limit 5` — verify it crawls 5 websites and reports results
- Run `node scripts/prepare-outreach.js --channel email --batch 3 --dry-run`
- Run `node scripts/send-email.js --preview` — verify email bodies print correctly

---

## Connections & Dependencies

### Files That Reference This Area

- `scripts/telegram-bot.js` — calls send-whatsapp.js; will also call new scripts
- `outputs/leads/outreach-tracker.json` — shared state updated by all send scripts
- `outputs/leads/daily-outreach/` — queue files consumed by all send scripts
- `.claude/commands/outreach-leads.md` — references the outreach pipeline; no structural changes needed

### Updates Needed for Consistency

- `reference/whatsapp-automation-setup.md` — add a note at the top: "For alternatives to WhatsApp, see alternative-channels-setup.md"
- `outputs/leads/outreach-tracker.json` — existing entries don't have `channel` field; new send scripts will add it on contact, leaving old entries as-is (backward compatible)

### Impact on Existing Workflows

- `prepare-outreach.js` gains a new optional `--channel` flag; default is `whatsapp`, so existing behavior is unchanged
- `send-whatsapp.js` is untouched — still works as before
- `telegram-bot.js` gets new commands added; existing commands unchanged
- Daily routine: same as before, but now you can choose which channel to use per day

---

## Validation Checklist

- [ ] `node scripts/send-sms.js --preview` prints messages with plain phone numbers (no `whatsapp:` prefix)
- [ ] `node scripts/find-emails.js --limit 5` crawls 5 websites and outputs found emails (or "none found")
- [ ] `node scripts/send-email.js --preview` prints formatted email subjects + bodies
- [ ] `node scripts/prepare-outreach.js --channel sms --dry-run` generates queue with SMS-formatted messages
- [ ] `node scripts/prepare-outreach.js --channel email --dry-run` generates queue with email subject + body fields
- [ ] `outreach-tracker.json` entries updated with `channel` field after a preview run
- [ ] Telegram bot `/sendsms` and `/sendemail` commands appear in `/help`
- [ ] `reference/alternative-channels-setup.md` exists with all env vars documented
- [ ] `CLAUDE.md` scripts section updated

---

## Success Criteria

The implementation is complete when:

1. You can run `node scripts/send-sms.js --preview` and see 20 SMS-formatted messages with Chilean phone numbers ready to send — with zero WhatsApp involvement
2. You can run `node scripts/find-emails.js` and it crawls business websites and discovers at least some email addresses from the existing CSV
3. You can run `node scripts/send-email.js --preview` and see properly formatted cold emails in Spanish ready to send
4. All three channels share the same tracker and queue infrastructure — no duplicate contacts, one source of truth

---

## Notes

- **Start with SMS:** It's the fastest win — same phone numbers, same Twilio account, just a different API call. You can be live with SMS outreach within minutes of setting `TWILIO_SMS_FROM`.
- **Email is the long game:** Email discovery via crawling takes time (1-2 seconds per website × hundreds of leads) but the results persist in the tracker. Run `find-emails.js` once overnight and you'll have an email list for weeks.
- **Compliance:** Chilean SMS marketing doesn't have a formal opt-out law equivalent to CAN-SPAM, but including "Responda STOP para no recibir más mensajes" in SMS is good practice and reduces spam complaints. For email, include an unsubscribe line.
- **WhatsApp not deleted:** `send-whatsapp.js` remains in place. If you ever get a verified WhatsApp Business API account (Meta Business Manager), the channel becomes viable again. Keep it.
- **Future idea:** A channel rotation strategy — contact lead via SMS first, if no response in 3 days try email. Could be added to `prepare-outreach.js` logic later.

---

## Implementation Notes

**Implemented:** 2026-02-26

### Summary

- Created `scripts/send-sms.js` — Twilio SMS send script, mirrors send-whatsapp.js
- Created `scripts/find-emails.js` — crawls business websites to discover contact emails, saves to tracker
- Created `scripts/send-email.js` — sends cold emails via SMTP (Nodemailer)
- Updated `scripts/prepare-outreach.js` — added `--channel whatsapp|sms|email` flag, channel-aware message templates, channel-aware lead filtering
- Updated `scripts/telegram-bot.js` — added `/preparesms`, `/prepareemail`, `/sendsms`, `/sendemail`, `/sendsmsconfirm`, `/sendemailconfirm` commands
- Installed `nodemailer` npm package
- Created `reference/alternative-channels-setup.md` — full setup guide for both channels
- Updated `reference/whatsapp-automation-setup.md` — added cross-reference note
- Updated `CLAUDE.md` — documented all new scripts and channel setup

### Deviations from Plan

- Fixed a filtering bug discovered during validation: leads enriched by `find-emails.js` are added to the tracker with `status: 'uncontacted'`. The original filter would have incorrectly excluded them from the email channel queue. Fixed by checking `status !== 'uncontacted'` rather than checking tracker key presence alone.
- Improved the "Already contacted" log line to distinguish actively-contacted leads from enrichment-only entries.

### Issues Encountered

- None beyond the filter bug noted above, which was caught and fixed during the validation step.
