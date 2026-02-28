import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'dummy_key'
);

/**
 * tools.js — Gravity Claw action toolkit
 *
 * Covers:
 * - Freedcamp task creation/lookup
 * - Reminder scheduling
 * - Document logging
 * - Agent job logging
 * - Soul.md update
 * - Daily brief generation
 */

// ── Job Logging ───────────────────────────────────────────────

export async function logJob({ type, summary, details = {}, channel = 'telegram', status = 'done' }) {
    const { data } = await supabase.from('iaos_agent_jobs')
        .insert({ type, summary, details, channel, status })
        .select().single();
    return data;
}

// ── Freedcamp ─────────────────────────────────────────────────

export async function createFreedcampTask({ title, description = '', projectId, assignee }) {
    if (!process.env.FREEDCAMP_API_KEY) throw new Error('FREEDCAMP_API_KEY not set');

    // Resolve assignee name → user ID from core_memory team_mappings
    let assigneeId = null;
    if (assignee) {
        const { data } = await supabase.from('iaos_core_memory')
            .select('value')
            .eq('category', 'team_mappings')
            .eq('key', assignee.toLowerCase())
            .single();
        assigneeId = data?.value || null;
    }

    const body = new URLSearchParams({
        api_key: process.env.FREEDCAMP_API_KEY,
        title,
        description,
        ...(projectId && { project_id: projectId }),
        ...(assigneeId && { assigned_user_id: assigneeId }),
    });

    const res = await fetch('https://freedcamp.com/api/v1/tasks', {
        method: 'POST',
        body,
    });
    const result = await res.json();

    if (result.data?.task) {
        await logJob({
            type: 'task_created',
            summary: `Created task: ${title}`,
            details: { taskId: result.data.task.id, projectId, assignee },
        });
    }
    return result;
}

export async function getFreedcampTasks(projectId) {
    if (!process.env.FREEDCAMP_API_KEY) return [];
    const url = `https://freedcamp.com/api/v1/tasks?api_key=${process.env.FREEDCAMP_API_KEY}&user_id=${process.env.FREEDCAMP_USER_ID}${projectId ? '&project_id=' + projectId : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data?.tasks || [];
}

// ── Reminders ─────────────────────────────────────────────────

export async function createReminder({ text, scheduledAt, recurrence = null, channel = 'telegram' }) {
    const { data } = await supabase.from('iaos_reminders')
        .insert({ text, scheduled_at: scheduledAt, recurrence, channel })
        .select().single();

    await logJob({
        type: 'reminder_created',
        summary: `Reminder set: "${text}" for ${scheduledAt}`,
        details: { reminderId: data.id, recurrence },
    });
    return data;
}

export async function getPendingReminders() {
    const { data } = await supabase
        .from('iaos_reminders')
        .select('*')
        .eq('sent', false)
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at');
    return data || [];
}

export async function markReminderSent(id) {
    await supabase.from('iaos_reminders')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', id);
}

// ── Documents ─────────────────────────────────────────────────

export async function saveDocument({ name, type, content, client }) {
    // Save to Supabase storage (base64 or text)
    let storagePath = null;
    try {
        const bytes = Buffer.from(content);
        const { data: uploadData, error } = await supabase.storage
            .from('iaos_documents')
            .upload(`${type}/${name}`, bytes, {
                contentType: type === 'pdf' ? 'application/pdf' : 'text/html',
                upsert: true,
            });
        if (!error) storagePath = uploadData.path;
    } catch (e) {
        console.error('Storage upload failed:', e.message);
    }

    const { data } = await supabase.from('iaos_documents')
        .insert({ name, type, storage_path: storagePath, client })
        .select().single();

    await logJob({
        type: 'doc_generated',
        summary: `Document created: ${name}`,
        details: { documentId: data.id, type, client, storagePath },
    });
    return data;
}

// ── Core Memory ───────────────────────────────────────────────

export async function rememberFact({ category = 'key_facts', key, value }) {
    // Upsert by category+key
    const { data: existing } = await supabase.from('iaos_core_memory')
        .select('id')
        .eq('category', category)
        .eq('key', key)
        .single();

    if (existing) {
        await supabase.from('iaos_core_memory')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
    } else {
        await supabase.from('iaos_core_memory').insert({ category, key, value });
    }

    await logJob({
        type: 'memory_updated',
        summary: `Remembered: ${key} = ${value}`,
        details: { category, key, value },
    });
}

// ── Daily Brief ───────────────────────────────────────────────

export async function buildDailyBrief() {
    const today = new Date().toISOString().split('T')[0];

    // Get today's Freedcamp tasks
    let dueTasks = [];
    try {
        const tasks = await getFreedcampTasks();
        dueTasks = tasks.filter(t => t.due_date?.startsWith(today));
    } catch { }

    // Get pending reminders for today
    const { data: reminders } = await supabase.from('iaos_reminders')
        .select('text, scheduled_at')
        .eq('sent', false)
        .gte('scheduled_at', today + 'T00:00:00.000Z')
        .lte('scheduled_at', today + 'T23:59:59.999Z');

    return {
        date: today,
        dueTasks,
        reminders: reminders || [],
        timestamp: new Date().toISOString(),
    };
}

// ── Text Parsers (used by index.js to detect intents) ─────────

export function parseReminderIntent(text) {
    // Pattern: "remind me [to/about/that] X [at/on] Y"
    const match = text.match(/remind me\s+(?:to|about|that)?\s*(.+?)\s+(?:at|on|in)\s+(.+)/i);
    if (match) return { text: match[1].trim(), timeStr: match[2].trim() };
    return null;
}

export function parseModeSwitch(text) {
    if (/switch to smart mode|use smart mode|go smart/i.test(text)) return 'smart';
    if (/switch to cheap mode|use cheap mode|go cheap/i.test(text)) return 'cheap';
    return null;
}

export function parseMemoryIntent(text) {
    const match = text.match(/remember (?:that\s+)?(.+?)\s*[=:]\s*(.+)/i);
    if (match) return { key: match[1].trim(), value: match[2].trim() };
    return null;
}
