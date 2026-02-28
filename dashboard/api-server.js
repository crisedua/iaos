import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Supabase client (optional — graceful fallback when not configured)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Helper: safe path resolution (keep within workspace)
function resolveSafe(relPath) {
  const abs = path.resolve(WORKSPACE, relPath);
  if (!abs.startsWith(WORKSPACE)) throw new Error('Path traversal blocked');
  return abs;
}

// Helper: load all context files into a system prompt
function buildSystemPrompt() {
  const files = [
    'CLAUDE.md',
    'context/personal-info.md',
    'context/business-info.md',
    'context/strategy.md',
    'context/current-data.md',
  ];

  let systemPrompt = `You are Claude, operating within the AI OS for Business workspace. 
You have full context about the user's business, identity, strategy, and current priorities.
When the user types commands like /prime, /ia-os-session, /create-plan, /review, etc., execute them just as you would in a Claude Code session.
You can create plans, write content, review strategy, generate outreach scripts, and produce any output the user needs.
If asked to save output to a file, include the content clearly marked so it can be saved.

Here is the full workspace context:\n\n`;

  for (const f of files) {
    const full = path.join(WORKSPACE, f);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      systemPrompt += `\n\n---\n## FILE: ${f}\n\n${content}`;
    }
  }

  // Also load any plans
  const plansDir = path.join(WORKSPACE, 'plans');
  if (fs.existsSync(plansDir)) {
    const plans = fs.readdirSync(plansDir).filter(f => f.endsWith('.md')).slice(0, 5);
    for (const p of plans) {
      const content = fs.readFileSync(path.join(plansDir, p), 'utf8');
      systemPrompt += `\n\n---\n## PLAN: plans/${p}\n\n${content}`;
    }
  }

  return systemPrompt;
}

// ── Chat endpoint (streaming SSE) ──
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const systemPrompt = buildSystemPrompt();

    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    });

    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    });

  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

// ── Save output to file ──
app.post('/api/save-output', (req, res) => {
  try {
    const { filename, content } = req.body;
    const filePath = path.join(WORKSPACE, 'outputs', filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ ok: true, path: filePath });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Existing endpoints ──

app.get('/api/files', (req, res) => {
  try {
    const dir = resolveSafe(req.query.path || '.');
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const result = entries.map(e => ({
      name: e.name,
      isDir: e.isDirectory(),
      size: e.isFile() ? fs.statSync(path.join(dir, e.name)).size : null,
    }));
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/file', (req, res) => {
  try {
    const file = resolveSafe(req.query.path);
    const content = fs.readFileSync(file, 'utf8');
    res.json({ content });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/file', (req, res) => {
  try {
    const file = resolveSafe(req.query.path);
    fs.writeFileSync(file, req.body.content, 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/outreach-tracker', (req, res) => {
  try {
    const file = path.join(WORKSPACE, 'outputs', 'leads', 'outreach-tracker.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/mcp-config', (req, res) => {
  try {
    const file = path.join(WORKSPACE, '.mcp.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/scripts', (req, res) => {
  try {
    const dir = path.join(WORKSPACE, 'scripts');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.sh'));
    res.json(files);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/run-script', (req, res) => {
  const scriptName = req.query.name;
  const scriptPath = path.join(WORKSPACE, 'scripts', scriptName);
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: 'Script not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const ext = path.extname(scriptName);
  const cmd = ext === '.sh' ? 'bash' : 'node';
  const child = spawn(cmd, [scriptPath], { cwd: WORKSPACE, shell: true });

  child.stdout.on('data', d => res.write(`data: ${d.toString().replace(/\n/g, '\ndata: ')}\n\n`));
  child.stderr.on('data', d => res.write(`data: [err] ${d.toString().replace(/\n/g, '\ndata: ')}\n\n`));
  child.on('close', code => {
    res.write(`data: [done] exit code: ${code}\n\n`);
    res.end();
  });
});

app.get('/api/tree', (req, res) => {
  function walk(dir, depth = 0) {
    if (depth > 3) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.map(e => {
      const full = path.join(dir, e.name);
      const rel = path.relative(WORKSPACE, full);
      if (e.isDirectory()) {
        return { name: e.name, path: rel, isDir: true, children: walk(full, depth + 1) };
      }
      return { name: e.name, path: rel, isDir: false, size: fs.statSync(full).size };
    });
  }
  try {
    const base = resolveSafe(req.query.path || 'outputs');
    res.json(walk(base));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


// ── Freedcamp Tasks ──
app.get('/api/freedcamp/tasks', async (req, res) => {
  if (!process.env.FREEDCAMP_API_KEY) {
    return res.json({ notConfigured: true, tasks: [] });
  }
  try {
    const resp = await fetch(
      `https://freedcamp.com/api/v1/tasks?api_key=${process.env.FREEDCAMP_API_KEY}&user_id=${process.env.FREEDCAMP_USER_ID}`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await resp.json();
    const tasks = (data.data?.tasks || []).map(t => ({
      title: t.title,
      status: t.status_name || 'pending',
      project: t.project_name,
      due_date: t.due_date,
      link: t.url || `https://freedcamp.com/view/${t.project_id}/tasks/${t.id}`,
    }));
    res.json({ tasks });
  } catch (e) {
    res.status(500).json({ error: e.message, tasks: [] });
  }
});

// ── Core Memory ──
app.get('/api/core-memory', async (req, res) => {
  if (!supabase) return res.json({ entries: [] });
  const { data, error } = await supabase.from('core_memory').select('*').order('category').order('key');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ entries: data || [] });
});

app.post('/api/core-memory', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { category, key, value, notes } = req.body;
  const { data, error } = await supabase.from('core_memory')
    .insert({ category, key, value, notes })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ entry: data });
});

app.put('/api/core-memory/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { value } = req.body;
  const { error } = await supabase.from('core_memory')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/core-memory/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { error } = await supabase.from('core_memory').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Reminders ──
app.get('/api/reminders', async (req, res) => {
  if (!supabase) return res.json({ reminders: [] });
  const { data, error } = await supabase.from('reminders')
    .select('*').order('scheduled_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reminders: data || [] });
});

app.post('/api/reminders', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { text, scheduled_at, recurrence } = req.body;
  const { data, error } = await supabase.from('reminders')
    .insert({ text, scheduled_at, recurrence: recurrence === 'none' ? null : recurrence })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reminder: data });
});

app.delete('/api/reminders/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { error } = await supabase.from('reminders').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Documents ──
app.get('/api/documents', async (req, res) => {
  if (!supabase) return res.json({ documents: [] });
  const { data, error } = await supabase.from('documents')
    .select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ documents: data || [] });
});

// ── Agent Jobs ──
app.get('/api/agent-jobs', async (req, res) => {
  if (!supabase) return res.json({ jobs: [] });
  const { data, error } = await supabase.from('agent_jobs')
    .select('*').order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ jobs: data || [] });
});

app.listen(3001, () => console.log('Mission Control API server running on http://localhost:3001'));
