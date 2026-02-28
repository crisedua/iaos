import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'dummy_key'
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * router.js — Model routing between cheap and smart modes.
 *
 * Cheap mode: faster, lower cost, good for simple tasks
 * Smart mode: most capable, for complex reasoning
 *
 * Models (Anthropic):
 *   cheap → claude-haiku-4-5  (fast, low cost)
 *   smart → claude-opus-4-5   (most capable)
 */

const MODELS = {
    cheap: 'claude-haiku-4-5',
    smart: 'claude-opus-4-5',
};

export async function getCurrentMode() {
    try {
        const { data } = await supabase
            .from('iaos_agent_config')
            .select('value')
            .eq('key', 'current_mode')
            .single();
        return data?.value || 'cheap';
    } catch {
        return 'cheap';
    }
}

export async function setMode(mode) {
    if (!['cheap', 'smart'].includes(mode)) throw new Error('Invalid mode: ' + mode);
    await supabase.from('iaos_agent_config')
        .update({ value: mode, updated_at: new Date().toISOString() })
        .eq('key', 'current_mode');
    return mode;
}

/**
 * Auto-detect if a task should escalate to smart mode.
 * Heuristics: mention of "strategy", "analyze", "write a proposal", multi-step tasks.
 */
export function shouldEscalate(text) {
    const smartKeywords = [
        'strategy', 'analyze', 'analyse', 'proposal', 'complex',
        'deep dive', 'research', 'plan for', 'how should i', 'help me think',
        'draft a', 'write a full', 'detailed report'
    ];
    const lower = text.toLowerCase();
    return smartKeywords.some(k => lower.includes(k));
}

/**
 * Send a message to the model and return the full response text.
 * Handles streaming internally and returns the complete message.
 */
export async function chat({ system, messages, forceMode = null }) {
    const mode = forceMode || await getCurrentMode();
    const model = MODELS[mode] || MODELS.cheap;

    console.log(`[Router] Using ${mode} mode → ${model}`);

    const response = await anthropic.messages.create({
        model,
        max_tokens: mode === 'smart' ? 8096 : 4096,
        system,
        messages,
    });

    return response.content[0]?.text || '';
}

export { MODELS };
