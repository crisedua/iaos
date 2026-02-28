-- ============================================================
-- Gravity Claw — Supabase Schema
-- Run this in Supabase SQL Editor. Safe to re-run (idempotent).
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "pgcrypto";

-- ── Core Memory ──────────────────────────────────────────────
-- Permanent structured memory: facts, preferences, team/project
-- mappings, operating rules, client notes.
-- Always loaded into agent context.
create table if not exists core_memory (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in (
                'key_facts', 'preferences', 'team_mappings',
                'project_mappings', 'rules', 'client_notes'
              )),
  key         text not null,
  value       text not null,
  notes       text,
  updated_at  timestamptz default now()
);

-- Seed some starter entries
insert into core_memory (category, key, value, notes)
values
  ('key_facts',    'owner_name',    'replace_with_your_name',       'Full name of the workspace owner'),
  ('preferences',  'default_model', 'cheap',                         'cheap | smart'),
  ('preferences',  'daily_brief_time', '08:00',                     'Time to send daily brief (local)'),
  ('rules',        'task_confirmation', 'always',                    'always | skip_simple')
on conflict do nothing;

-- ── Agent Job Log ─────────────────────────────────────────────
-- Every action Gravity Claw takes is logged here.
-- Mission Control reads this to show AI task history.
create table if not exists agent_jobs (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,  -- task_created | reminder_sent | doc_generated | message_sent | brief_sent
  summary     text not null,
  details     jsonb,
  channel     text,           -- telegram | web | scheduled
  status      text default 'done' check (status in ('pending', 'running', 'done', 'failed')),
  created_at  timestamptz default now()
);

-- ── Reminders ─────────────────────────────────────────────────
create table if not exists reminders (
  id            uuid primary key default gen_random_uuid(),
  text          text not null,
  scheduled_at  timestamptz not null,
  recurrence    text check (recurrence in (null, 'daily', 'weekly', 'monthly')),
  sent          boolean default false,
  sent_at       timestamptz,
  channel       text default 'telegram',  -- telegram | dashboard
  created_at    timestamptz default now()
);

-- ── Documents ─────────────────────────────────────────────────
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('invoice', 'proposal', 'sop', 'report', 'other')),
  storage_path  text,          -- Supabase Storage path
  local_path    text,          -- local outputs/ path fallback
  client        text,
  metadata      jsonb,
  created_at    timestamptz default now()
);

-- ── Conversation Buffer ───────────────────────────────────────
-- Per-channel rolling context. Keeps last 20 messages + summary.
create table if not exists conversation_buffer (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null,   -- telegram | web
  user_id     text not null,
  messages    jsonb default '[]'::jsonb,   -- [{role, content, ts}]
  summary     text default '',             -- rolling compacted summary
  updated_at  timestamptz default now(),
  unique (channel, user_id)
);

-- ── Agent Config ──────────────────────────────────────────────
-- Runtime configuration the agent reads and Mission Control edits.
create table if not exists agent_config (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz default now()
);

insert into agent_config (key, value, description) values
  ('active_model_cheap',  'openai/gpt-4o-mini',        'Model used in cheap mode'),
  ('active_model_smart',  'anthropic/claude-opus-4-5', 'Model used in smart mode'),
  ('current_mode',        'cheap',                      'Current routing mode: cheap | smart'),
  ('telegram_enabled',    'true',                       'Whether Telegram webhook is active'),
  ('daily_brief_enabled', 'true',                       'Whether daily brief is enabled')
on conflict (key) do nothing;

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_agent_jobs_created   on agent_jobs(created_at desc);
create index if not exists idx_reminders_scheduled  on reminders(scheduled_at) where sent = false;
create index if not exists idx_documents_created    on documents(created_at desc);
create index if not exists idx_core_memory_category on core_memory(category);

-- ── Row Level Security ────────────────────────────────────────
-- For now: service role only (agent uses service key). Enable RLS
-- and add policies when you add multi-user support.
alter table core_memory         enable row level security;
alter table agent_jobs          enable row level security;
alter table reminders           enable row level security;
alter table documents           enable row level security;
alter table conversation_buffer enable row level security;
alter table agent_config        enable row level security;

-- Allow anon/service reads (tighten when ready for production)
create policy if not exists "allow_all_core_memory"
  on core_memory for all using (true) with check (true);

create policy if not exists "allow_all_agent_jobs"
  on agent_jobs for all using (true) with check (true);

create policy if not exists "allow_all_reminders"
  on reminders for all using (true) with check (true);

create policy if not exists "allow_all_documents"
  on documents for all using (true) with check (true);

create policy if not exists "allow_all_conversation_buffer"
  on conversation_buffer for all using (true) with check (true);

create policy if not exists "allow_all_agent_config"
  on agent_config for all using (true) with check (true);

-- ── Storage Bucket ────────────────────────────────────────────
-- Run this only once. Creates the documents storage bucket.
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', false)
-- on conflict (id) do nothing;

-- ============================================================
-- Done. Tables created:
--   core_memory, agent_jobs, reminders, documents,
--   conversation_buffer, agent_config
-- ============================================================
