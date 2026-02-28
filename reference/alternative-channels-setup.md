# Alternative Outreach Channels — Setup Guide

> This guide configures the two WhatsApp-free automated outreach channels: **Twilio SMS** and **Cold Email via Gmail SMTP**.
> For the original WhatsApp setup, see `reference/whatsapp-automation-setup.md`.

---

## Channel Comparison

| | WhatsApp | SMS | Email |
|---|---|---|---|
| **Ban risk** | High (cold outreach) | Low | Very low |
| **Response rate** | High (~30–40% in CL) | Medium (~15–25%) | Low–Medium (~5–15%) |
| **Setup effort** | High (Meta approval) | Low (same Twilio) | Medium (App Password) |
| **Cost per message** | ~$0.005 | ~$0.007 | ~$0 (Gmail free tier) |
| **Daily safe limit** | 20 | 25 | 20–50 (warmup) |
| **Contact field required** | `phone` | `phone` | `email` |

**Recommended daily workflow:**
- Use SMS as the primary channel (same phone numbers, immediate).
- Use Email for leads where SMS gets no response after 3–4 days (or when email is available).

---

## Channel 1: Twilio SMS

### What It Does

Sends plain SMS text messages to the phone numbers already in your leads CSV.
No WhatsApp approval needed — SMS goes through Twilio's standard carrier network.

### Required Env Var

| Variable | Value | Where to find |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Twilio Console dashboard |
| `TWILIO_AUTH_TOKEN` | your auth token | Twilio Console → click eye icon |
| `TWILIO_SMS_FROM` | `+15551234567` | Your Twilio SMS-capable phone number |

> `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` may already be set from the WhatsApp setup.
> Only `TWILIO_SMS_FROM` is new.

### Setup Steps

1. **Log in to Twilio Console** → [twilio.com/console](https://www.twilio.com/console)

2. **Get or create an SMS-capable number:**
   - Go to Phone Numbers → Manage → Active Numbers
   - If you have a number with SMS capability, use it
   - If not: Buy a Number → filter by SMS capability → choose a US or local number (~$1/month)
   - Copy the number in E.164 format: `+15551234567`

3. **Set the environment variable on Windows:**
   - `Win + R` → `sysdm.cpl` → Advanced → Environment Variables
   - Add new User variable: `TWILIO_SMS_FROM` = your number
   - Restart terminal / Claude Code

4. **Verify:**
   ```bash
   echo $TWILIO_SMS_FROM
   node scripts/send-sms.js --preview
   ```

### Chilean Number Format

The leads CSV already stores phone numbers in `+56XXXXXXXXX` format.
Twilio SMS to Chilean numbers works via standard carrier delivery — no special setup needed.

### Recommended Limits

| Setting | Value | Why |
|---|---|---|
| Batch size | 20–25/day | Carrier spam filter threshold |
| Delay between sends | 3,000ms | Default; increase to 5,000ms if seeing errors |
| Daily volume | ≤ 25 new numbers | Sustainable without carrier flagging |

### SMS Opt-Out (Best Practice)

The SMS message template includes an implicit reply CTA. For compliance, consider adding at the end of messages:
> "Responda STOP para no recibir más mensajes."

This is standard practice even without a formal opt-out law in Chile.

### Workflow

```bash
# 1. Prepare queue with SMS messages
node scripts/prepare-outreach.js --channel sms --batch 20

# 2. Review the queue
cat outputs/leads/daily-outreach/YYYY-MM-DD-outreach.md

# 3. Preview messages (no sending)
node scripts/send-sms.js --preview

# 4. Send
node scripts/send-sms.js
```

### Cost Reference

| Item | Cost |
|---|---|
| Outbound SMS to Chile (Twilio) | ~$0.007 USD |
| 20 messages/day × 5 days | ~$0.70/week |
| Twilio phone number | ~$1/month |

---

## Channel 2: Cold Email via Gmail SMTP

### What It Does

Sends cold outreach emails to business email addresses discovered by `find-emails.js`.
Uses Gmail's SMTP server — completely free up to ~500 emails/day.

### Required Env Vars

| Variable | Value | Example |
|---|---|---|
| `SMTP_HOST` | Gmail SMTP hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Port number | `587` |
| `SMTP_USER` | Your Gmail address | `esteban@gmail.com` |
| `SMTP_PASS` | Gmail App Password (16 chars) | `abcd efgh ijkl mnop` |
| `SMTP_FROM_NAME` | Sender display name | `Esteban - AI OS for Business` |

### Setup Steps

#### Step 1: Choose a Gmail Account

Use a dedicated Gmail account for outreach (not your personal inbox).
Suggested: create `outreach@yourdomain.com` or use a Gmail like `esteban.aios@gmail.com`.

> **Tip:** Using a custom domain (e.g. `esteban@aiOSforbusiness.com`) via Google Workspace looks more professional and avoids Gmail spam penalties.

#### Step 2: Generate a Gmail App Password

App Passwords are 16-character passwords that work with SMTP even when 2FA is enabled.

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "How you sign in to Google" → enable **2-Step Verification** if not already on
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select app: **Mail** | Select device: **Windows Computer**
5. Click Generate → copy the 16-character password (e.g. `abcd efgh ijkl mnop`)
6. Store it securely — you won't see it again

#### Step 3: Set Environment Variables on Windows

1. `Win + R` → `sysdm.cpl` → Advanced → Environment Variables
2. Add User variables:

| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | the 16-char App Password |
| `SMTP_FROM_NAME` | `Esteban - AI OS for Business` |

3. Restart terminal / Claude Code

#### Step 4: Verify

```bash
node scripts/send-email.js --preview
```

### Email Discovery Workflow

Before sending emails, you need to discover email addresses for your leads.
Run `find-emails.js` to crawl business websites and extract contact emails:

```bash
# Crawl all leads with websites (runs in the background — can take 10-20 min)
node scripts/find-emails.js

# Or limit to first 50 leads:
node scripts/find-emails.js --limit 50

# Dry run — see what would be crawled:
node scripts/find-emails.js --dry-run
```

Results are saved to `outreach-tracker.json`. Run it once and the emails persist.

**Typical discovery rate:** 30–60% of leads with websites will yield a contact email.

### Full Email Outreach Workflow

```bash
# 1. Discover emails (run once per CSV batch)
node scripts/find-emails.js

# 2. Prepare email queue
node scripts/prepare-outreach.js --channel email --batch 15

# 3. Preview emails
node scripts/send-email.js --preview

# 4. Send
node scripts/send-email.js
```

### Recommended Limits (Gmail Warmup)

Gmail accounts flagged as spam get deliverability destroyed. Warm up gradually:

| Week | Max emails/day | Delay between sends |
|---|---|---|
| Week 1 | 10–15 | 15,000ms (15s) |
| Week 2 | 20–30 | 12,000ms |
| Week 3+ | 40–50 | 10,000ms |

Gmail free accounts: max ~500 sends/day. In practice, stay well below that.

### Spam Avoidance Tips

- Personalize the subject line (already done — uses business name)
- Include an opt-out line ("Responda STOP para cancelar")
- Don't attach files in cold emails
- Avoid spam trigger words in subject: "GRATIS", "OFERTA ESPECIAL", "GANA DINERO"
- Send at business hours (9am–5pm Chile time)

---

## Setting Env Vars (Reference)

On Windows, the fastest way without rebooting:

```bash
# In your terminal session (temporary — lasts until terminal closes)
export TWILIO_SMS_FROM="+15551234567"
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="you@gmail.com"
export SMTP_PASS="abcd efgh ijkl mnop"
export SMTP_FROM_NAME="Esteban - AI OS for Business"
```

For permanent setup: use Windows Environment Variables panel (sysdm.cpl → Advanced → Environment Variables).

---

## Troubleshooting

### SMS Issues

| Error | Cause | Fix |
|---|---|---|
| `21211: Invalid To phone number` | Wrong number format | Ensure numbers are `+56XXXXXXXXX` |
| `Authentication Error` | Wrong SID or token | Re-check env vars |
| `21606: From number not SMS-capable` | Number lacks SMS | Buy/enable SMS on the number |

### Email Issues

| Error | Cause | Fix |
|---|---|---|
| `Invalid login` | Wrong SMTP_PASS | Regenerate App Password |
| `Username and Password not accepted` | 2FA not enabled | Enable 2FA before App Password |
| `ETIMEDOUT` | Firewall blocking port 587 | Try port 465 with `SMTP_PORT=465` |
| High bounce rate | Bad email addresses | Run find-emails.js again — skip old crawled dates |
