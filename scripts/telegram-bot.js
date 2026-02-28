#!/usr/bin/env node
/**
 * telegram-bot.js — AI OS Workspace Bot
 *
 * Your personal Telegram bot for controlling the AI OS workspace from your phone.
 *
 * Setup:
 *   1. Set env vars: TELEGRAM_BOT_TOKEN and TELEGRAM_USER_ID
 *   2. Run: node scripts/telegram-bot.js
 *
 * Commands:
 *   /start        — Welcome + command list
 *   /status       — Pipeline stats from outreach-tracker.json
 *   /leads        — Show today's outreach queue (or top uncontacted leads)
 *   /prepare      — Run prepare-outreach.js (WhatsApp, 20 leads)
 *   /preparesms   — Run prepare-outreach.js --channel sms
 *   /prepareemail — Run prepare-outreach.js --channel email
 *   /preview      — Show today's WhatsApp messages ready to send
 *   /send         — Send today's WhatsApp messages (requires Twilio)
 *   /sendsms      — Send today's SMS messages (requires TWILIO_SMS_FROM)
 *   /sendemail    — Send today's emails (requires SMTP config)
 *   /top5         — Top 5 uncontacted leads by ICP score
 *   /help         — Command list
 */

const TelegramBot = require('node-telegram-bot-api');
const { execFile, spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const USER_ID = parseInt(process.env.TELEGRAM_USER_ID, 10);

if (!TOKEN) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN env var not set.');
  console.error('Get your token from @BotFather on Telegram.');
  process.exit(1);
}
if (!USER_ID) {
  console.error('ERROR: TELEGRAM_USER_ID env var not set.');
  console.error('Get your user ID from @userinfobot on Telegram.');
  process.exit(1);
}

const BASE         = 'C:/ClaudeCode/outputs/leads';
const TRACKER_PATH = path.join(BASE, 'outreach-tracker.json');
const TODAY        = () => new Date().toISOString().slice(0, 10);

// ── Bot init ──────────────────────────────────────────────────────────────────
const bot = new TelegramBot(TOKEN, { polling: true });
console.log(`\n🤖 AI OS Bot started. Listening for messages from user ${USER_ID}...`);

// ── Auth guard — only respond to your user ID ─────────────────────────────────
function isAuthorized(msg) {
  return msg.from && msg.from.id === USER_ID;
}

function deny(chatId) {
  bot.sendMessage(chatId, '⛔ No autorizado.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadTracker() {
  if (!fs.existsSync(TRACKER_PATH)) return { meta: { total_contacted: 0, total_sent: 0, total_responded: 0 }, contacts: {} };
  try { return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8')); }
  catch { return { meta: {}, contacts: {} }; }
}

function runScript(chatId, scriptPath, args = []) {
  bot.sendMessage(chatId, `⏳ Ejecutando...`);
  const proc = spawn('node', [scriptPath, ...args], { cwd: 'C:/ClaudeCode' });
  let output = '';
  proc.stdout.on('data', d => { output += d.toString(); });
  proc.stderr.on('data', d => { output += d.toString(); });
  proc.on('close', code => {
    // Trim and split into chunks (Telegram max 4096 chars per message)
    const trimmed = output.trim().slice(0, 3800);
    const status  = code === 0 ? '✅ Completado' : `❌ Error (code ${code})`;
    bot.sendMessage(chatId, `${status}\n\n\`\`\`\n${trimmed}\n\`\`\``, { parse_mode: 'Markdown' });
  });
}

// ── CSV parser (no deps) ──────────────────────────────────────────────────────
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    const obj = {}; headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  });
}

// ── /start ────────────────────────────────────────────────────────────────────
bot.onText(/\/start/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id,
    `👋 *AI OS Workspace Bot*\n\nComandos disponibles:\n\n` +
    `📊 /status — Estado del pipeline\n` +
    `📋 /leads — Cola de hoy\n` +
    `🎯 /top5 — Top 5 prospectos sin contactar\n` +
    `⚙️ /prepare — Preparar leads (WhatsApp)\n` +
    `⚙️ /preparesms — Preparar leads (SMS)\n` +
    `⚙️ /prepareemail — Preparar leads (Email)\n` +
    `👀 /preview — Ver mensajes de hoy (WhatsApp)\n` +
    `📤 /send — Enviar WhatsApp (requiere Twilio)\n` +
    `📱 /sendsms — Enviar SMS (requiere TWILIO_SMS_FROM)\n` +
    `✉️ /sendemail — Enviar emails (requiere SMTP)\n` +
    `❓ /help — Esta lista`,
    { parse_mode: 'Markdown' }
  );
});

// ── /help ─────────────────────────────────────────────────────────────────────
bot.onText(/\/help/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id,
    `*Comandos AI OS Bot*\n\n` +
    `/status — Cuántos leads enviados, respondidos, en cola\n` +
    `/leads — Muestra la cola de outreach de hoy\n` +
    `/top5 — Los 5 mejores prospectos sin contactar aún\n` +
    `/prepare — Prepara leads WhatsApp (20 leads)\n` +
    `/preparesms — Prepara leads SMS\n` +
    `/prepareemail — Prepara leads Email (requiere emails en tracker)\n` +
    `/preview — Muestra mensajes WhatsApp de hoy\n` +
    `/send — Envía WhatsApp vía Twilio\n` +
    `/sendsms — Envía SMS vía Twilio (TWILIO_SMS_FROM)\n` +
    `/sendemail — Envía emails vía SMTP`,
    { parse_mode: 'Markdown' }
  );
});

// ── /status ───────────────────────────────────────────────────────────────────
bot.onText(/\/status/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);

  const tracker  = loadTracker();
  const contacts = Object.values(tracker.contacts);
  const byStatus = contacts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const sent      = byStatus['sent']         || 0;
  const queued    = byStatus['queued']        || 0;
  const responded = byStatus['responded']    || 0;
  const booked    = byStatus['demo_booked']  || 0;
  const closed    = byStatus['closed']       || 0;
  const noResp    = byStatus['not_interested'] || 0;
  const total     = contacts.length;

  // Count leads contacted this week
  const weekAgo   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thisWeek  = contacts.filter(c => c.queued_date && c.queued_date >= weekAgo.slice(0,10)).length;

  // CSV remaining
  const csvPath = `C:/ClaudeCode/outputs/leads/gmap-extracts/2026-02-25/leads-all.csv`;
  let remaining = '?';
  if (fs.existsSync(csvPath)) {
    const leads = parseCSV(fs.readFileSync(csvPath, 'utf8'));
    const contactedKeys = new Set(Object.keys(tracker.contacts));
    remaining = leads.filter(l => {
      const key = l.phone || l.maps_url;
      return key && !contactedKeys.has(key);
    }).length;
  }

  bot.sendMessage(msg.chat.id,
    `📊 *Pipeline Status — ${TODAY()}*\n\n` +
    `📤 Enviados:     ${sent}\n` +
    `⏳ En cola:      ${queued}\n` +
    `💬 Respondieron: ${responded}\n` +
    `📅 Demo agendada: ${booked}\n` +
    `✅ Cerrados:     ${closed}\n` +
    `❌ No interesado: ${noResp}\n` +
    `─────────────────\n` +
    `📦 Total contactados: ${total}\n` +
    `🗓 Esta semana: ${thisWeek}\n` +
    `📁 Sin contactar en CSV: ${remaining}`,
    { parse_mode: 'Markdown' }
  );
});

// ── /leads ────────────────────────────────────────────────────────────────────
bot.onText(/\/leads/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);

  const queuePath = `C:/ClaudeCode/outputs/leads/daily-outreach/${TODAY()}-outreach.json`;
  if (!fs.existsSync(queuePath)) {
    bot.sendMessage(msg.chat.id,
      `📋 No hay cola para hoy (${TODAY()}).\n\nEjecuta /prepare para generar los leads de hoy.`
    );
    return;
  }

  try {
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const tracker = loadTracker();
    const unsent = queue.filter(l => {
      const key = l.phone || l.maps_url;
      const entry = key && tracker.contacts[key];
      return !entry || entry.status === 'queued';
    });

    if (queue.length === 0) {
      bot.sendMessage(msg.chat.id, `📋 Cola de hoy está vacía. Corre /prepare.`);
      return;
    }

    let text = `📋 *Cola de hoy — ${TODAY()}*\n${queue.length} leads en total, ${unsent.length} sin enviar\n\n`;
    const preview = queue.slice(0, 5);
    preview.forEach((l, i) => {
      const tracker_entry = tracker.contacts[l.phone || l.maps_url];
      const status = tracker_entry ? tracker_entry.status : 'queued';
      const icon = status === 'sent' ? '✅' : status === 'queued' ? '⏳' : '❓';
      text += `${icon} *${i+1}. ${l.business_name}*\n`;
      text += `   ${l.city} · ${l.category} · ⭐${l.review_count} reviews\n`;
      text += `   📞 ${l.phone || '(sin teléfono)'}\n\n`;
    });
    if (queue.length > 5) text += `_...y ${queue.length - 5} más_`;

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `❌ Error leyendo cola: ${e.message}`);
  }
});

// ── /top5 ─────────────────────────────────────────────────────────────────────
bot.onText(/\/top5/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);

  const csvPath = `C:/ClaudeCode/outputs/leads/gmap-extracts/2026-02-25/leads-all.csv`;
  if (!fs.existsSync(csvPath)) {
    bot.sendMessage(msg.chat.id, `❌ CSV no encontrado. Corre /extract-leads-gmap primero.`);
    return;
  }

  const tracker = loadTracker();
  const contactedKeys = new Set(Object.keys(tracker.contacts));
  const leads = parseCSV(fs.readFileSync(csvPath, 'utf8'));

  const scored = leads
    .filter(l => { const k = l.phone || l.maps_url; return k && !contactedKeys.has(k); })
    .map(l => {
      let score = 0;
      if (parseInt(l.review_count, 10) >= 20) score += 2;
      if (l.phone)   score += 1;
      if (l.website) score += 1;
      if (l.category === 'dentistas' || l.category === 'clinicas') score += 1;
      return { ...l, icp_score: score };
    })
    .sort((a, b) => b.icp_score - a.icp_score || parseInt(b.review_count,10) - parseInt(a.review_count,10))
    .slice(0, 5);

  if (scored.length === 0) {
    bot.sendMessage(msg.chat.id, `🎉 ¡Todos los leads han sido contactados!`);
    return;
  }

  let text = `🎯 *Top 5 prospectos — ${TODAY()}*\n_(sin contactar, mayor ICP score)_\n\n`;
  scored.forEach((l, i) => {
    text += `*${i+1}. ${l.business_name}*\n`;
    text += `   📍 ${l.city} · ${l.category}\n`;
    text += `   📞 ${l.phone || '(sin teléfono)'}\n`;
    text += `   ⭐ ${l.review_count} reviews · ICP: ${l.icp_score}/5\n\n`;
  });

  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// ── /prepare (WhatsApp) ───────────────────────────────────────────────────────
bot.onText(/^\/prepare$/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/prepare-outreach.js', ['--batch', '20', '--channel', 'whatsapp']);
});

// ── /preparesms ───────────────────────────────────────────────────────────────
bot.onText(/\/preparesms/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/prepare-outreach.js', ['--batch', '20', '--channel', 'sms']);
});

// ── /prepareemail ─────────────────────────────────────────────────────────────
bot.onText(/\/prepareemail/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/prepare-outreach.js', ['--batch', '20', '--channel', 'email']);
});

// ── /preview ──────────────────────────────────────────────────────────────────
bot.onText(/\/preview/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/send-whatsapp.js', ['--preview']);
});

// ── /send ─────────────────────────────────────────────────────────────────────
bot.onText(/\/send/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id, `⚠️ ¿Confirmas que quieres enviar los mensajes de hoy?\n\nResponde /sendconfirm para proceder.`);
});

bot.onText(/\/sendconfirm/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/send-whatsapp.js');
});

// ── /sendsms ──────────────────────────────────────────────────────────────────
bot.onText(/^\/sendsms$/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id, `⚠️ ¿Confirmas que quieres enviar los SMS de hoy?\n\nResponde /sendsmsconfirm para proceder.`);
});

bot.onText(/\/sendsmsconfirm/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/send-sms.js');
});

// ── /sendemail ────────────────────────────────────────────────────────────────
bot.onText(/^\/sendemail$/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id, `⚠️ ¿Confirmas que quieres enviar los emails de hoy?\n\nResponde /sendemailconfirm para proceder.`);
});

bot.onText(/\/sendemailconfirm/, msg => {
  if (!isAuthorized(msg)) return deny(msg.chat.id);
  runScript(msg.chat.id, 'C:/ClaudeCode/scripts/send-email.js');
});

// ── Unknown command ───────────────────────────────────────────────────────────
bot.on('message', msg => {
  if (!isAuthorized(msg)) return;
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id,
      `Usa un comando para controlar el workspace. Escribe /help para ver la lista.`
    );
  }
});

// ── Error handling ────────────────────────────────────────────────────────────
bot.on('polling_error', err => {
  console.error('Polling error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\nBot detenido.');
  bot.stopPolling();
  process.exit(0);
});
