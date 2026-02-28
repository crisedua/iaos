#!/usr/bin/env node
/**
 * send-email.js
 *
 * Reads today's outreach queue and sends each message as a cold email via SMTP.
 * Run AFTER:
 *   1. find-emails.js has populated emails in outreach-tracker.json
 *   2. prepare-outreach.js --channel email has generated the queue
 *
 * Requires env vars:
 *   SMTP_HOST          — SMTP server hostname (e.g. smtp.gmail.com)
 *   SMTP_PORT          — SMTP port (e.g. 587)
 *   SMTP_USER          — Your email address
 *   SMTP_PASS          — Gmail App Password (16 chars) or SMTP password
 *   SMTP_FROM_NAME     — Display name (e.g. "Esteban - AI OS for Business")
 *
 * Without SMTP env vars: prints all emails with copy instructions (preview mode).
 *
 * Usage:
 *   node scripts/send-email.js
 *   node scripts/send-email.js --date 2026-02-26
 *   node scripts/send-email.js --delay 15000     (ms between sends, default 10000)
 *   node scripts/send-email.js --preview         (print emails, no sending)
 */

const fs   = require('fs');
const path = require('path');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const getArg   = (flag, def) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };
const TODAY    = getArg('--date', new Date().toISOString().slice(0, 10));
const DELAY_MS = parseInt(getArg('--delay', process.env.EMAIL_DELAY_MS || '10000'), 10);
const PREVIEW  = args.includes('--preview');

const BASE         = 'C:/ClaudeCode/outputs/leads';
const TRACKER_PATH = path.join(BASE, 'outreach-tracker.json');
const QUEUE_PATH   = path.join(BASE, 'daily-outreach', `${TODAY}-outreach.json`);
const LEADS_LOG    = path.join(BASE, 'leads-log.md');

// ── SMTP credentials ──────────────────────────────────────────────────────────
const SMTP_HOST      = process.env.SMTP_HOST;
const SMTP_PORT      = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER      = process.env.SMTP_USER;
const SMTP_PASS      = process.env.SMTP_PASS;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Esteban - AI OS for Business';
const smtpReady      = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

// ── Category label mapping ────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  dentistas:     'clínicas dentales',
  abogados:      'estudios jurídicos',
  clinicas:      'clínicas médicas',
  inmobiliarias: 'agencias inmobiliarias',
};

// ── Build email subject + body ────────────────────────────────────────────────
function buildEmail(lead) {
  const label   = CATEGORY_LABELS[lead.category] || 'negocios locales';
  const subject = `¿${lead.business_name} pierde llamadas fuera de horario?`;
  const body    =
    `Hola equipo de ${lead.business_name},\n\n` +
    `Mi nombre es Esteban y trabajo con ${label} en Chile instalando agentes de voz con IA que contestan llamadas las 24 horas.\n\n` +
    `Vi su negocio en Google Maps y quería preguntar: ¿suelen perder llamadas cuando están ocupados o fuera de horario?\n\n` +
    `Si les interesa ver cómo funciona, puedo mostrarles en 15 minutos.\n` +
    `¿Tienen disponibilidad esta semana?\n\n` +
    `Saludos,\n` +
    `${SMTP_FROM_NAME}\n\n` +
    `---\n` +
    `Para no recibir más correos de nuestra parte, responda con "STOP".`;
  return { subject, body };
}

// ── Send email via Nodemailer ─────────────────────────────────────────────────
async function sendEmail(to, subject, body) {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    return { success: false, error: 'nodemailer not installed. Run: npm install nodemailer' };
  }

  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const info = await transporter.sendMail({
      from:    `"${SMTP_FROM_NAME}" <${SMTP_USER}>`,
      to,
      subject,
      text:    body,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Append to leads-log.md ────────────────────────────────────────────────────
function appendToLeadsLog(sent) {
  if (!fs.existsSync(LEADS_LOG)) return;

  const rows = sent.map((lead, i) =>
    `| ${i + 1} | ${lead.business_name} | ${lead.business_name} | Email | ${TODAY} | Reached Out | Follow up in 2 days | Auto-sent via send-email.js |`
  ).join('\n');

  const note =
    `\n\n### Auto-logged by send-email.js — ${TODAY}\n\n` +
    `| # | Name | Business | Channel | Date Contacted | Status | Next Action | Notes |\n` +
    `|---|------|----------|---------|----------------|--------|-------------|-------|\n` +
    rows + '\n';

  fs.appendFileSync(LEADS_LOG, note, 'utf8');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n── send-email.js ────────────────────────────────`);
  console.log(`Date:    ${TODAY}`);
  console.log(`Delay:   ${DELAY_MS}ms between sends`);
  console.log(`SMTP:    ${smtpReady ? `CONFIGURED ✓ (${SMTP_USER})` : 'NOT configured (preview/copy mode)'}`);
  console.log(`Preview: ${PREVIEW || !smtpReady}\n`);

  // 1. Load queue
  if (!fs.existsSync(QUEUE_PATH)) {
    console.error(`ERROR: Queue file not found: ${QUEUE_PATH}`);
    console.error(`Run prepare-outreach.js --channel email first:`);
    console.error(`  node scripts/prepare-outreach.js --channel email`);
    process.exit(1);
  }
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  console.log(`Queue loaded: ${queue.length} leads from ${QUEUE_PATH}`);

  // 2. Load tracker
  let tracker = { meta: {}, contacts: {} };
  if (fs.existsSync(TRACKER_PATH)) {
    tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  }

  // 3. Enrich queue with emails from tracker, filter out those without email
  const enriched = queue.map(lead => {
    const key   = lead.phone || lead.maps_url;
    const entry = key && tracker.contacts[key];
    return { ...lead, email: (entry && entry.email) || lead.email || null };
  });

  const toSend = enriched.filter(lead => {
    if (!lead.email) return false;
    const key   = lead.phone || lead.maps_url;
    const entry = key && tracker.contacts[key];
    return !entry || (entry.status !== 'sent' && entry.status !== 'opted_out');
  });

  const noEmail     = enriched.filter(l => !l.email).length;
  const alreadySent = enriched.length - toSend.length - noEmail;

  console.log(`To send:         ${toSend.length}`);
  console.log(`No email found:  ${noEmail} (run find-emails.js to discover them)`);
  console.log(`Already sent:    ${alreadySent}\n`);

  if (toSend.length === 0) {
    console.log('Nothing to send.');
    if (noEmail > 0) {
      console.log(`\nTip: ${noEmail} leads are missing emails. Run:`);
      console.log(`  node scripts/find-emails.js`);
    }
    return;
  }

  // 4. Preview mode
  if (PREVIEW || !smtpReady) {
    if (!smtpReady) {
      console.log('══════════════════════════════════════════════════');
      console.log('SMTP NOT CONFIGURED — showing emails for manual sending');
      console.log('Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      console.log('See reference/alternative-channels-setup.md for setup steps.');
      console.log('══════════════════════════════════════════════════\n');
    }

    toSend.forEach((lead, i) => {
      const { subject, body } = buildEmail(lead);
      console.log(`─── ${i + 1}/${toSend.length}: ${lead.business_name} (${lead.city}) ───`);
      console.log(`To:      ${lead.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${body}`);
      console.log('');
    });

    console.log(`\n[PREVIEW] ${toSend.length} emails shown above.`);
    console.log(`To send automatically, configure SMTP env vars.`);
    return;
  }

  // 5. Send emails
  let sentCount   = 0;
  let failedCount = 0;
  const sentLeads = [];

  for (let i = 0; i < toSend.length; i++) {
    const lead          = toSend[i];
    const key           = lead.phone || lead.maps_url;
    const { subject, body } = buildEmail(lead);

    process.stdout.write(`[${i+1}/${toSend.length}] Emailing ${lead.email} (${lead.business_name})... `);
    const result = await sendEmail(lead.email, subject, body);

    const now = new Date().toISOString();
    if (result.success) {
      console.log(`✓ Sent (${result.messageId})`);
      sentCount++;
      sentLeads.push(lead);
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].status          = 'sent';
        tracker.contacts[key].channel         = 'email';
        tracker.contacts[key].email_sent      = true;
        tracker.contacts[key].first_contacted = tracker.contacts[key].first_contacted || now;
        tracker.contacts[key].last_contact    = now;
      }
    } else {
      console.log(`✗ Failed: ${result.error}`);
      failedCount++;
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].status       = 'failed';
        tracker.contacts[key].channel      = 'email';
        tracker.contacts[key].last_contact = now;
        tracker.contacts[key].error        = result.error;
      }
    }

    tracker.meta.total_sent = Object.values(tracker.contacts).filter(c => c.status === 'sent').length;
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    if (i < toSend.length - 1) await sleep(DELAY_MS);
  }

  // 6. Append to leads-log.md
  if (sentLeads.length > 0) {
    appendToLeadsLog(sentLeads);
    console.log(`\nLeads log updated: ${LEADS_LOG}`);
  }

  // 7. Final summary
  console.log(`\n── Results ──────────────────────────────────────`);
  console.log(`Sent:            ${sentCount}`);
  console.log(`Failed:          ${failedCount}`);
  console.log(`No email / skip: ${noEmail + alreadySent}`);
  console.log(`\nTracker saved: ${TRACKER_PATH}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
