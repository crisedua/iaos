import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * soul.js — Loads the agent constitution and core memory.
 * Called at every message processing cycle.
 */

const SOUL_PATH = process.env.SOUL_PATH
    || path.resolve(process.env.WORKSPACE_PATH || '.', '..', 'soul.md');

export async function loadSoulContext() {
    let soulContent = '';
    let coreMemory = [];

    // Load soul.md
    try {
        if (fs.existsSync(SOUL_PATH)) {
            soulContent = fs.readFileSync(SOUL_PATH, 'utf8');
        } else {
            soulContent = '[soul.md not found — place at C:\\ClaudeCode\\soul.md]';
        }
    } catch (e) {
        soulContent = '[Error loading soul.md: ' + e.message + ']';
    }

    // Load core memory from Supabase
    try {
        const { data } = await supabase
            .from('iaos_core_memory')
            .select('category, key, value')
            .order('category')
            .order('key');
        coreMemory = data || [];
    } catch (e) {
        console.error('Core memory load failed:', e.message);
    }

    // Format core memory as readable block
    const memoryBlock = formatMemoryBlock(coreMemory);

    return `${soulContent}\n\n---\n\n## CORE MEMORY (Live from Supabase)\n\n${memoryBlock}`;
}

function formatMemoryBlock(entries) {
    if (!entries.length) return '(No core memory entries yet)';
    const grouped = {};
    for (const e of entries) {
        if (!grouped[e.category]) grouped[e.category] = [];
        grouped[e.category].push(`- **${e.key}**: ${e.value}`);
    }
    return Object.entries(grouped)
        .map(([cat, items]) => `### ${cat}\n${items.join('\n')}`)
        .join('\n\n');
}

export async function updateSoulMd(instruction) {
    if (!fs.existsSync(SOUL_PATH)) throw new Error('soul.md not found at ' + SOUL_PATH);
    const current = fs.readFileSync(SOUL_PATH, 'utf8');
    // Return instruction for the AI to apply — the model will determine the new content
    return { current, instruction };
}
