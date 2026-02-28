# WhatsApp Automation Setup — Twilio

> This guide walks through connecting `scripts/send-whatsapp.js` to Twilio's WhatsApp Business API so it can send outreach messages automatically. Read this before running `send-whatsapp.js` for the first time.
>
> **Looking for WhatsApp alternatives?** See `reference/alternative-channels-setup.md` for Twilio SMS and Cold Email setup.

---

## Overview

`send-whatsapp.js` can operate in two modes:

| Mode | When | What happens |
|---|---|---|
| **Preview (no Twilio)** | `TWILIO_*` env vars not set | Prints all messages to console for manual copying |
| **Auto-send (Twilio)** | All 3 env vars set | Sends messages via Twilio API, one per lead |

Start with Preview mode to verify messages look correct before going live.

---

## Step 1: Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up (free trial available)
2. Complete phone verification
3. From the Twilio Console dashboard, note your:
   - **Account SID** (starts with `AC...`) — shown on the dashboard
   - **Auth Token** — click the eye icon to reveal it

---

## Step 2: Enable WhatsApp (Sandbox for Testing)

**Option A — Sandbox (testing, no Meta approval needed):**

1. In Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Follow the sandbox join instructions (send a code from your WhatsApp to a Twilio number)
3. Your Twilio sandbox number is typically: `+14155238886`
4. **Limitation:** Sandbox only sends to numbers that have joined your sandbox. Good for testing with your own number.

**Option B — WhatsApp Business API (production, for real cold outreach):**

1. Twilio Console → Messaging → Senders → WhatsApp Senders
2. Click "Request Access" → fill in business details
3. Connect a phone number (or use a Twilio number)
4. Submit for Meta/WhatsApp approval (1–5 business days)
5. Once approved, your dedicated WhatsApp business number appears here

> **For real lead outreach at scale, Option B is required.** Meta requires message templates for business-initiated conversations (first contact with a new number).

---

## Step 3: Get Your WhatsApp Sender Number

- **Sandbox:** `+14155238886` (or whatever Twilio assigned)
- **Business API:** Your approved number in international format, e.g. `+56912345678`

---

## Step 4: Set Environment Variables

On Windows, set these as User environment variables:

1. Press `Win + R` → type `sysdm.cpl` → Advanced → Environment Variables
2. Under User variables, click New for each:

| Variable | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `your_auth_token_here` |
| `TWILIO_WHATSAPP_FROM` | `+14155238886` (sandbox) or your approved number |

3. Restart Claude Code (or any terminal) so the new vars are picked up

**Verify they're set:**
```bash
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_WHATSAPP_FROM
```

---

## Step 5: Submit Message Template (Production Only)

For production (Option B), WhatsApp requires pre-approved templates for first-contact messages. Submit this template:

**Template name:** `solia_cold_outreach_v1`
**Category:** Marketing
**Language:** es (Spanish)
**Body:**

```
Hola {{1}}, le escribo porque vi su negocio en Google Maps. Me llamo Esteban y trabajo con {{2}} en Chile instalando un agente de voz con IA que contesta llamadas 24/7.
Vi que reciben bastantes consultas y quería preguntar: ¿suelen perder llamadas cuando están ocupados o fuera de horario?
Si les interesa, con gusto les muestro cómo funciona en 15 minutos. ¿Tienen disponibilidad esta semana?
```

Where `{{1}}` = business name, `{{2}}` = category label.

**How to submit:**
1. Twilio Console → Messaging → Content Template Builder
2. Create new template → paste body above → map variables
3. Submit for approval → usually 1–3 business days

> **Note:** While waiting for approval, use Sandbox mode to test the full pipeline end-to-end with your own number.

---

## Step 6: Test the Pipeline

```bash
# 1. Generate today's queue (5 leads, dry run first)
node scripts/prepare-outreach.js --batch 5 --dry-run

# 2. Generate for real
node scripts/prepare-outreach.js --batch 5

# 3. Preview messages (no Twilio needed)
node scripts/send-whatsapp.js --preview

# 4. Send (Twilio configured, sandbox)
node scripts/send-whatsapp.js
```

---

## Rate Limits & Best Practices

| Setting | Recommended | Why |
|---|---|---|
| Batch size | 20/day | WhatsApp anti-spam threshold |
| Delay between sends | 5,000ms (5s) | Avoids triggering rate limiting |
| Daily volume | ≤ 20 new contacts | Safe for sustained daily use |

**Environment variable override:**
```bash
# Set delay to 3 seconds
WA_DELAY_MS=3000 node scripts/send-whatsapp.js
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `63016: Channel capability not found` | Number not WhatsApp-enabled | Enable WhatsApp on the Twilio number |
| `21211: Invalid To phone number` | Wrong number format | Ensure number is `+56XXXXXXXXX` format |
| `21614: To number not opted in` | Sandbox — recipient hasn't joined | Have recipient send join code, or use Business API |
| `Authentication Error` | Wrong SID or token | Re-check env vars; tokens don't have spaces |

---

## Cost Reference (Twilio WhatsApp, approx.)

| Item | Cost |
|---|---|
| Outbound WhatsApp message | ~$0.005 USD |
| 20 messages/day × 7 weeks (969 leads) | ~$0.68 USD total |
| Twilio phone number | ~$1/month |

Sandbox is free (test numbers only).

---

## Next Steps After Setup

Once sending works:
1. Monitor replies in Twilio Console → Messaging → Logs
2. Update `outputs/leads/outreach-tracker.json` manually with responses, or wait for `scripts/log-responses.js` (future feature)
3. Run `/outreach-leads` each morning to see who replied and get follow-up scripts
