#!/usr/bin/env node
/**
 * send-whatsapp.js
 *
 * Reads today's outreach queue and sends each message via Twilio's WhatsApp API.
 * Run AFTER prepare-outreach.js has generated the queue.
 *
 * Requires env vars for actual sending:
 *   TWILIO_ACCOUNT_SID    — Twilio Account SID (starts with AC...)
 *   TWILIO_AUTH_TOKEN     — Twilio Auth Token
 *   TWILIO_WHATSAPP_FROM  — Your Twilio WhatsApp number e.g. +14155238886
 *
 * Without Twilio env vars: prints all messages with copy instructions (dry preview).
 *
 * Usage:
 *   node scripts/send-whatsapp.js
 *   node scripts/send-whatsapp.js --date 2026-02-25
 *   node scripts/send-whatsapp.js --delay 3000     (ms between sends, default 5000)
 *   node scripts/send-whatsapp.js --preview        (print messages, no sending)
 */

const fs      = require('fs');
const path    = require('path');
const https   = require('https');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const getArg   = (flag, def) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };
const TODAY    = getArg('--date', new Date().toISOString().slice(0, 10));
const DELAY_MS = parseInt(getArg('--delay', process.env.WA_DELAY_MS || '5000'), 10);
const PREVIEW  = args.includes('--preview');

const BASE         = 'C:/ClaudeCode/outputs/leads';
const TRACKER_PATH = path.join(BASE, 'outreach-tracker.json');
const QUEUE_PATH   = path.join(BASE, 'daily-outreach', `${TODAY}-outreach.json`);
const LEADS_LOG    = path.join(BASE, 'leads-log.md');

// ── Twilio credentials ────────────────────────────────────────────────────────
const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM  = process.env.TWILIO_WHATSAPP_FROM;
const twilioReady  = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);

// ── Twilio REST API call (no SDK — pure https) ────────────────────────────────
function sendTwilioWhatsApp(to, body) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      From: `whatsapp:${TWILIO_FROM}`,
      To:   `whatsapp:${to}`,
      Body: body,
    });
    const postData = params.toString();
    const auth     = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      path:     `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization':  `Basic ${auth}`,
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, sid: json.sid, status: json.status });
          } else {
            resolve({ success: false, error: json.message || json.code || 'Unknown error', status: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, error: `Parse error: ${e.message}` });
        }
      });
    });

    req.on('error', e => resolve({ success: false, error: e.message }));
    req.write(postData);
    req.end();
  });
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ── Append to leads-log.md ───────────────────────────────────────────────────
function appendToLeadsLog(sent) {
  if (!fs.existsSync(LEADS_LOG)) return;
  const content = fs.readFileSync(LEADS_LOG, 'utf8');

  // Find the current week's table and append rows
  const rows = sent.map((lead, i) =>
    `| ${i + 1} | ${lead.business_name} | ${lead.business_name} | WhatsApp | ${TODAY} | Reached Out | Follow up in 2 days | Auto-sent via send-whatsapp.js |`
  ).join('\n');

  // Append a note at the bottom if we can't find the table cleanly
  const note = `\n\n### Auto-logged by send-whatsapp.js — ${TODAY}\n\n` +
    `| # | Name | Business | Channel | Date Contacted | Status | Next Action | Notes |\n` +
    `|---|------|----------|---------|----------------|--------|-------------|-------|\n` +
    rows + '\n';

  fs.appendFileSync(LEADS_LOG, note, 'utf8');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n── send-whatsapp.js ─────────────────────────────`);
  console.log(`Date:       ${TODAY}`);
  console.log(`Delay:      ${DELAY_MS}ms between sends`);
  console.log(`Twilio:     ${twilioReady ? 'CONFIGURED ✓' : 'NOT configured (preview/copy mode)'}`);
  console.log(`Preview:    ${PREVIEW || !twilioReady}\n`);

  // 1. Load queue
  if (!fs.existsSync(QUEUE_PATH)) {
    console.error(`ERROR: Queue file not found: ${QUEUE_PATH}`);
    console.error(`Run prepare-outreach.js first:`);
    console.error(`  node scripts/prepare-outreach.js`);
    process.exit(1);
  }
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  console.log(`Queue loaded: ${queue.length} leads from ${QUEUE_PATH}`);

  // 2. Load tracker
  let tracker = { meta: {}, contacts: {} };
  if (fs.existsSync(TRACKER_PATH)) {
    tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  }

  // 3. Filter: skip already-sent
  const toSend = queue.filter(lead => {
    const key = lead.phone || lead.maps_url;
    const entry = key && tracker.contacts[key];
    return !entry || (entry.status !== 'sent' && entry.status !== 'opted_out');
  });
  const alreadySent = queue.length - toSend.length;
  console.log(`To send: ${toSend.length} | Already sent / skipped: ${alreadySent}\n`);

  if (toSend.length === 0) {
    console.log('Nothing to send — all leads in queue are already marked sent.');
    return;
  }

  // 4. Preview mode (no Twilio or --preview flag)
  if (PREVIEW || !twilioReady) {
    if (!twilioReady) {
      console.log('══════════════════════════════════════════════════');
      console.log('TWILIO NOT CONFIGURED — showing messages for manual sending');
      console.log('See reference/whatsapp-automation-setup.md to configure.');
      console.log('══════════════════════════════════════════════════\n');
    }

    toSend.forEach((lead, i) => {
      console.log(`─── ${i + 1}/${toSend.length}: ${lead.business_name} (${lead.city}) ───`);
      console.log(`To: ${lead.phone || '(no phone)'}`);
      console.log(`Message:\n${lead.message}`);
      console.log(`Maps: ${lead.maps_url}`);
      console.log('');
    });

    // Still update tracker to "queued" status with preview timestamp
    const now = new Date().toISOString();
    toSend.forEach(lead => {
      const key = lead.phone || lead.maps_url;
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].status = 'queued';
        tracker.contacts[key].last_contact = now;
      }
    });
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    console.log(`\n[PREVIEW] ${toSend.length} messages shown above. Copy and send manually.`);
    console.log(`To send automatically, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.`);
    return;
  }

  // 5. Send via Twilio
  let sentCount   = 0;
  let failedCount = 0;
  const sentLeads = [];

  for (let i = 0; i < toSend.length; i++) {
    const lead = toSend[i];
    const key  = lead.phone || lead.maps_url;

    if (!lead.phone) {
      console.log(`[${i+1}/${toSend.length}] SKIP ${lead.business_name} — no phone number`);
      failedCount++;
      if (key && tracker.contacts[key]) tracker.contacts[key].status = 'failed_no_phone';
      continue;
    }

    process.stdout.write(`[${i+1}/${toSend.length}] Sending to ${lead.phone} (${lead.business_name})... `);
    const result = await sendTwilioWhatsApp(lead.phone, lead.message);

    const now = new Date().toISOString();
    if (result.success) {
      console.log(`✓ Sent (${result.sid})`);
      sentCount++;
      sentLeads.push(lead);
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].status         = 'sent';
        tracker.contacts[key].first_contacted = tracker.contacts[key].first_contacted || now;
        tracker.contacts[key].last_contact   = now;
        tracker.contacts[key].twilio_sid     = result.sid;
      }
    } else {
      console.log(`✗ Failed: ${result.error}`);
      failedCount++;
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].status       = 'failed';
        tracker.contacts[key].last_contact = now;
        tracker.contacts[key].error        = result.error;
      }
    }

    // Save tracker after each send (safe in case of interruption)
    tracker.meta.total_sent = Object.values(tracker.contacts).filter(c => c.status === 'sent').length;
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    // Rate limit delay (except after last message)
    if (i < toSend.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 6. Append to leads-log.md
  if (sentLeads.length > 0) {
    appendToLeadsLog(sentLeads);
    console.log(`\nLeads log updated: ${LEADS_LOG}`);
  }

  // 7. Final summary
  console.log(`\n── Results ──────────────────────────────────────`);
  console.log(`Sent:              ${sentCount}`);
  console.log(`Failed:            ${failedCount}`);
  console.log(`Already sent (skip): ${alreadySent}`);
  console.log(`Total tracker entries: ${Object.keys(tracker.contacts).length}`);
  console.log(`\nTracker saved: ${TRACKER_PATH}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
