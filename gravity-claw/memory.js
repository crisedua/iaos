import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const MAX_MESSAGES = 20;

/**
 * memory.js — 3-tier memory system
 *
 * Tier 1: Core Memory (SQL in Supabase) — loaded by soul.js
 * Tier 2: Conversation Buffer (this file) — last 20 msgs + rolling summary
 * Tier 3: Semantic Memory (future Pinecone integration) — not implemented yet
 */

export async function getConversationState(channel, userId) {
    const { data } = await supabase
        .from('conversation_buffer')
        .select('*')
        .eq('channel', channel)
        .eq('user_id', userId)
        .single();

    return data || { channel, user_id: userId, messages: [], summary: '' };
}

export async function addMessage(channel, userId, role, content) {
    const state = await getConversationState(channel, userId);
    const messages = Array.isArray(state.messages) ? state.messages : [];

    messages.push({ role, content, ts: new Date().toISOString() });

    // Compact if over limit
    let summary = state.summary || '';
    let trimmed = messages;

    if (messages.length > MAX_MESSAGES) {
        const toCompact = messages.slice(0, messages.length - MAX_MESSAGES);
        trimmed = messages.slice(messages.length - MAX_MESSAGES);
        summary = compactMessages(toCompact, summary);
    }

    await supabase.from('conversation_buffer').upsert({
        channel,
        user_id: userId,
        messages: trimmed,
        summary,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'channel,user_id' });

    return { messages: trimmed, summary };
}

export async function getMessagesForContext(channel, userId) {
    const state = await getConversationState(channel, userId);
    const messages = Array.isArray(state.messages) ? state.messages : [];
    const summary = state.summary || '';

    // Build API messages (no ts field)
    const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));

    // Prepend summary as a system note if there is one
    if (summary) {
        return {
            systemNote: `[Conversation summary from earlier:\n${summary}]`,
            messages: apiMessages,
        };
    }
    return { systemNote: null, messages: apiMessages };
}

export async function clearConversation(channel, userId) {
    await supabase.from('conversation_buffer').upsert({
        channel, user_id: userId,
        messages: [], summary: '',
        updated_at: new Date().toISOString(),
    }, { onConflict: 'channel,user_id' });
}

function compactMessages(oldMessages, existingSummary) {
    // Simple concatenation summary (could be enhanced with AI summarization)
    const lines = oldMessages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');
    const base = existingSummary ? existingSummary + '\n\n[Later:]\n' : '';
    return base + lines;
}
