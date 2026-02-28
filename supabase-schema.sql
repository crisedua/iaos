-- ============================================================
-- Gravity Claw — Supabase Schema (iaos_ prefix)
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── iaos_core_memory ─────────────────────────────────────────
create table if not exists iaos_core_memory (
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

-- ── iaos_agent_jobs ──────────────────────────────────────────
create table if not exists iaos_agent_jobs (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  summary     text not null,
  details     jsonb,
  channel     text,
  status      text default 'done' check (status in ('pending', 'running', 'done', 'failed')),
  created_at  timestamptz default now()
);

-- ── iaos_reminders ───────────────────────────────────────────
create table if not exists iaos_reminders (
  id            uuid primary key default gen_random_uuid(),
  text          text not null,
  scheduled_at  timestamptz not null,
  recurrence    text check (recurrence in (null, 'daily', 'weekly', 'monthly')),
  sent          boolean default false,
  sent_at       timestamptz,
  channel       text default 'telegram',
  created_at    timestamptz default now()
);

-- ── iaos_documents ───────────────────────────────────────────
create table if not exists iaos_documents (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('invoice', 'proposal', 'sop', 'report', 'other')),
  storage_path  text,
  local_path    text,
  client        text,
  metadata      jsonb,
  created_at    timestamptz default now()
);

-- ── iaos_conversation_buffer ─────────────────────────────────
create table if not exists iaos_conversation_buffer (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null,
  user_id     text not null,
  messages    jsonb default '[]'::jsonb,
  summary     text default '',
  updated_at  timestamptz default now(),
  unique (channel, user_id)
);

-- ── iaos_agent_config ────────────────────────────────────────
create table if not exists iaos_agent_config (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz default now()
);

insert into iaos_agent_config (key, value, description) values
  ('active_model_cheap',  'claude-haiku-4-5',  'Model used in cheap mode'),
  ('active_model_smart',  'claude-opus-4-5',   'Model used in smart mode'),
  ('current_mode',        'cheap',              'Current routing mode: cheap | smart'),
  ('telegram_enabled',    'true',               'Whether Telegram webhook is active'),
  ('daily_brief_enabled', 'true',               'Whether daily brief is enabled')
on conflict (key) do nothing;

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_iaos_agent_jobs_created   on iaos_agent_jobs(created_at desc);
create index if not exists idx_iaos_reminders_scheduled  on iaos_reminders(scheduled_at) where sent = false;
create index if not exists idx_iaos_documents_created    on iaos_documents(created_at desc);
create index if not exists idx_iaos_core_memory_category on iaos_core_memory(category);

-- ── RLS ──────────────────────────────────────────────────────
alter table iaos_core_memory         enable row level security;
alter table iaos_agent_jobs          enable row level security;
alter table iaos_reminders           enable row level security;
alter table iaos_documents           enable row level security;
alter table iaos_conversation_buffer enable row level security;
alter table iaos_agent_config        enable row level security;

create policy if not exists "allow_all" on iaos_core_memory         for all using (true) with check (true);
create policy if not exists "allow_all" on iaos_agent_jobs          for all using (true) with check (true);
create policy if not exists "allow_all" on iaos_reminders           for all using (true) with check (true);
create policy if not exists "allow_all" on iaos_documents           for all using (true) with check (true);
create policy if not exists "allow_all" on iaos_conversation_buffer for all using (true) with check (true);
create policy if not exists "allow_all" on iaos_agent_config        for all using (true) with check (true);

-- ============================================================
-- Tables: iaos_core_memory, iaos_agent_jobs, iaos_reminders,
--         iaos_documents, iaos_conversation_buffer, iaos_agent_config
-- ============================================================
