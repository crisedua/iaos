# Outreach Leads

> Daily interactive outreach session. Run each morning to review today's queue, log responses from previous days, and get ready-to-use follow-up scripts.

---

## Run

Read the following files:

- `outputs/leads/outreach-tracker.json`
- `outputs/leads/leads-log.md`
- `reference/outreach-scripts.md`

Also check if today's outreach file exists:
- `outputs/leads/daily-outreach/{TODAY}-outreach.md` (where `{TODAY}` = current date YYYY-MM-DD)

---

## Produce

Generate a structured **Daily Outreach Briefing** with these sections:

### 1. Pipeline Status (from tracker)

Count and summarize all contacts in `outreach-tracker.json` by status:

| Status | Count |
|---|---|
| queued | N |
| sent | N |
| responded | N |
| demo_booked | N |
| not_interested | N |
| opted_out | N |
| failed | N |

Show: total leads in CSV remaining (hint: 969 total from last extraction, minus contacts in tracker = remaining).

### 2. Today's Queue

- If `{TODAY}-outreach.md` exists: confirm it's ready and show how many leads are queued
- If it does NOT exist: remind user to run `node scripts/prepare-outreach.js` first, and stop here with that instruction

If queue exists, show the top 3 leads from the queue as a preview (business name, city, category, phone, ICP score).

### 3. Pending Follow-Ups (from tracker)

Find all contacts where:
- `status = "sent"` AND `last_contact` was 2–4 days ago AND `response_notes` is empty

For each, generate a follow-up WhatsApp message using the **Follow-Up WhatsApp** template from `reference/outreach-scripts.md`:

> "Hola [Nombre], solo quería hacer un seguimiento rápido. Entiendo que están ocupados. Si en algún momento quieren ver cómo otros [dentistas/agencias/clínicas] están resolviendo el tema de las llamadas perdidas con IA, con gusto les muestro. Sin compromiso."

Fill in the business name and category label. Show each follow-up message ready to copy.

### 4. Responses to Handle

Find all contacts where `status = "responded"` (or where `response_notes` is non-empty but status isn't yet updated).

For each responded lead:
- Show their business info and what they said (from `response_notes`)
- Suggest the appropriate next action:
  - Positive / curious → Demo booking script (from `reference/outreach-scripts.md`)
  - Objection → Matching objection response from `reference/outreach-scripts.md`
  - "Send info" → Response to "Mándeme información" objection

### 5. Daily Action Checklist

A clear, ordered checklist for today:

```
[ ] Run: node scripts/prepare-outreach.js  (if not done yet)
[ ] Review: outputs/leads/daily-outreach/{TODAY}-outreach.md
[ ] Send:   node scripts/send-whatsapp.js
[ ] Log any responses received in outreach-tracker.json
[ ] Follow up on leads contacted 2–4 days ago (messages above)
[ ] Update context/current-data.md weekly metrics (on Fridays)
```

### 6. Quick Stats

- Leads contacted this week (sent this week from tracker)
- Leads contacted this month
- Response rate (responded / sent, from tracker)
- Demos booked this week (if any in tracker with status `demo_booked`)

---

## How to Update the Tracker

When a lead responds, manually update `outreach-tracker.json`:

```json
"contact_key": {
  "status": "responded",
  "response_notes": "Interesado, quiere ver demo el jueves",
  "last_contact": "2026-02-26"
}
```

Status options: `queued` | `sent` | `responded` | `demo_booked` | `proposal_sent` | `closed` | `not_interested` | `opted_out` | `failed` | `failed_no_phone`

To mark opted out (never contact again):
```json
"status": "opted_out",
"response_notes": "Asked to not be contacted"
```
