import 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import { loadSoulContext } from './soul.js';
import { addMessage, getMessagesForContext, clearConversation } from './memory.js';
import { chat, getCurrentMode, setMode, shouldEscalate } from './router.js';
import {
    logJob,
    createFreedcampTask,
    createReminder,
    getPendingReminders,
    markReminderSent,
    buildDailyBrief,
    rememberFact,
    parseReminderIntent,
    parseModeSwitch,
    parseMemoryIntent,
} from './tools.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ALLOWED_USER_IDS = (process.env.ALLOWED_TELEGRAM_USER_IDS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

// ── Telegram Helpers ──────────────────────────────────────────

async function sendTelegram(chatId, text) {
    if (!BOT_TOKEN) return;
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
}

async function setWebhook(url) {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url,
            secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        }),
    });
    const data = await res.json();
    console.log('[Webhook]', data.ok ? 'Set successfully' : data.description);
}

// ── Message Handler ───────────────────────────────────────────

async function handleMessage(userId, userText, send) {
    const channel = 'telegram';
    const lower = userText.toLowerCase().trim();

    // ── Built-in commands ──
    if (lower === '/start' || lower === '/help') {
        return send(`👋 *Gravity Claw online*\n\nCommands:\n• /brief — daily brief\n• /mode — current model mode\n• /smart — switch to smart mode\n• /cheap — switch to cheap mode\n• /clear — clear conversation\n\nOr just talk to me naturally.`);
    }

    if (lower === '/brief') {
        const brief = await buildDailyBrief();
        const text = formatBrief(brief);
        await logJob({ type: 'brief_sent', summary: 'Daily brief sent', details: brief, channel });
        return send(text);
    }

    if (lower === '/clear') {
        await clearConversation(channel, userId);
        return send('🧹 Conversation cleared.');
    }

    if (lower === '/mode') {
        const mode = await getCurrentMode();
        return send(`Current mode: *${mode}*\nModel: ${mode === 'smart' ? 'claude-opus-4-5' : 'claude-haiku-4-5'}`);
    }

    if (lower === '/smart') {
        await setMode('smart');
        return send('🧠 Switched to *smart mode* (claude-opus-4-5)');
    }

    if (lower === '/cheap') {
        await setMode('cheap');
        return send('⚡ Switched to *cheap mode* (claude-haiku-4-5)');
    }

    // ── Intent detection ──

    // Mode switch from natural language
    const modeSwitch = parseModeSwitch(userText);
    if (modeSwitch) {
        await setMode(modeSwitch);
        return send(`✓ Switched to *${modeSwitch} mode*.`);
    }

    // Reminder intent
    const reminderIntent = parseReminderIntent(userText);
    if (reminderIntent) {
        const scheduledAt = resolveTime(reminderIntent.timeStr);
        if (scheduledAt) {
            await createReminder({ text: reminderIntent.text, scheduledAt, channel });
            return send(`⏰ Reminder set: "${reminderIntent.text}" at ${scheduledAt}`);
        }
    }

    // Memory intent
    const memoryIntent = parseMemoryIntent(userText);
    if (memoryIntent) {
        await rememberFact({ key: memoryIntent.key, value: memoryIntent.value });
        return send(`📌 Remembered: *${memoryIntent.key}* = ${memoryIntent.value}`);
    }

    // ── AI response ──
    await addMessage(channel, userId, 'user', userText);
    const { messages, systemNote } = await getMessagesForContext(channel, userId);
    const soul = await loadSoulContext();

    const system = [soul, systemNote].filter(Boolean).join('\n\n---\n\n');
    const forceMode = shouldEscalate(userText) ? 'smart' : null;

    try {
        const reply = await chat({ system, messages, forceMode });
        await addMessage(channel, userId, 'assistant', reply);
        await logJob({
            type: 'message_replied',
            summary: `Replied to: "${userText.slice(0, 60)}"`,
            details: { userText, mode: forceMode || 'auto' },
            channel,
        });
        send(reply);
    } catch (e) {
        console.error('Chat error:', e.message);
        send(`❌ Error: ${e.message}`);
    }
}

// ── Telegram Webhook ──────────────────────────────────────────

app.post('/webhook', async (req, res) => {
    res.sendStatus(200); // Respond immediately to Telegram

    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return console.warn('[Webhook] Invalid secret');
    }

    const msg = req.body?.message;
    if (!msg?.text) return;

    const userId = String(msg.from.id);
    const chatId = msg.chat.id;

    // Auth check
    if (ALLOWED_USER_IDS.length > 0 && !ALLOWED_USER_IDS.includes(userId)) {
        return fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: '⛔ Not authorized.' }),
        });
    }

    await handleMessage(userId, msg.text, (text) => sendTelegram(chatId, text));
});

// ── Health check ──────────────────────────────────────────────

app.get('/', (req, res) => res.json({
    status: 'online',
    agent: 'Gravity Claw',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
}));

// ── Cron Jobs ─────────────────────────────────────────────────

// Check for pending reminders every 2 minutes
cron.schedule('*/2 * * * *', async () => {
    try {
        const pending = await getPendingReminders();
        for (const reminder of pending) {
            console.log(`[Cron] Sending reminder: ${reminder.text}`);
            // Send to all allowed users (simplified — in production, store chat_id per user)
            for (const uid of ALLOWED_USER_IDS) {
                await sendTelegram(uid, `⏰ *Reminder:* ${reminder.text}`);
            }
            await markReminderSent(reminder.id);
            await logJob({ type: 'reminder_sent', summary: `Sent reminder: ${reminder.text}`, channel: 'telegram' });
        }
    } catch (e) {
        console.error('[Cron] Reminder check failed:', e.message);
    }
});

// Daily brief at configured time (default 8:00 AM)
cron.schedule('0 8 * * *', async () => {
    try {
        const brief = await buildDailyBrief();
        const text = formatBrief(brief);
        for (const uid of ALLOWED_USER_IDS) {
            await sendTelegram(uid, text);
        }
        await logJob({ type: 'brief_sent', summary: 'Daily brief sent automatically', channel: 'scheduled' });
        console.log('[Cron] Daily brief sent');
    } catch (e) {
        console.error('[Cron] Daily brief failed:', e.message);
    }
});

// ── Helpers ───────────────────────────────────────────────────

function formatBrief(brief) {
    const lines = [`📋 *Daily Brief — ${brief.date}*\n`];

    if (brief.dueTasks?.length > 0) {
        lines.push('*Tasks Due Today:*');
        brief.dueTasks.forEach(t => lines.push(`• ${t.title} [${t.project || 'General'}]`));
    } else {
        lines.push('*Tasks Due Today:* None');
    }

    if (brief.reminders?.length > 0) {
        lines.push('\n*Reminders:*');
        brief.reminders.forEach(r => lines.push(`• ${r.text}`));
    }

    lines.push('\n_Gravity Claw is watching. 👁_');
    return lines.join('\n');
}

function resolveTime(str) {
    // Simple time parser — handles "tomorrow at 9am", "in 2 hours", specific datetime
    const now = new Date();
    str = str.trim().toLowerCase();

    if (/in (\d+) hour/i.test(str)) {
        const h = parseInt(str.match(/in (\d+) hour/i)[1]);
        return new Date(now.getTime() + h * 3600000).toISOString();
    }
    if (/tomorrow at (\d+)(am|pm)?/i.test(str)) {
        const m = str.match(/tomorrow at (\d+)(am|pm)?/i);
        let h = parseInt(m[1]);
        if (m[2] === 'pm' && h !== 12) h += 12;
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        d.setHours(h, 0, 0, 0);
        return d.toISOString();
    }
    // Try direct Date parse as fallback
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
    return null;
}

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, async () => {
    console.log(`\n⚡ Gravity Claw agent running on port ${PORT}`);
    console.log(`   Telegram: ${BOT_TOKEN ? 'configured' : '⚠️ NOT configured'}`);
    console.log(`   Supabase: ${process.env.SUPABASE_URL ? 'configured' : '⚠️ NOT configured'}`);
    console.log(`   Freedcamp: ${process.env.FREEDCAMP_API_KEY ? 'configured' : '⚠️ NOT configured'}`);

    // Auto-set webhook if RAILWAY_STATIC_URL is set (Railway injects this)
    if (process.env.RAILWAY_STATIC_URL && BOT_TOKEN) {
        const webhookUrl = `https://${process.env.RAILWAY_STATIC_URL}/webhook`;
        await setWebhook(webhookUrl);
        console.log(`   Webhook: ${webhookUrl}`);
    }
});
