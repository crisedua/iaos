# Plan: Weekly Lead Generation System — 5 Leads/Week

**Created:** 2026-02-24
**Status:** Implemented
**Request:** Build and embed a structured lead generation workflow in the workspace to consistently generate 5 qualified leads per week for AI OS for Business.

---

## Overview

### What This Plan Accomplishes

This plan installs a repeatable, workspace-native lead generation system targeting 5 new qualified leads per week. It creates an outreach playbook, a weekly tracking command, a leads log in `outputs/`, and updates core workspace files (CLAUDE.md, context files) so every Claude session is aware of the lead generation routine and can actively assist with it.

### Why This Matters

The Q1 2026 strategy explicitly calls for "predictable weekly pipeline: leads → demos → proposals → closes." Right now, the pipeline table in `current-data.md` is empty — there are no targets set and no tracking in place. Without a consistent, structured outreach routine, lead generation will remain reactive. Five leads per week (20+/month) is the minimum volume needed to hit demo and close targets at realistic conversion rates.

---

## Current State

### Relevant Existing Structure

- `context/strategy.md` — Q1 priority #2 is outbound pipeline (LinkedIn + WhatsApp DMs)
- `context/business-info.md` — Acquisition channels defined: LinkedIn, WhatsApp, referrals
- `context/current-data.md` — Pipeline table exists but all values are blank; "New leads this week" target is empty
- `context/personal-info.md` — Role includes "Plan launches and marketing: LinkedIn posts, outreach scripts, case studies"
- `CLAUDE.md` — Lists three commands: `/prime`, `/create-plan`, `/implement` — no lead generation command exists
- `.claude/commands/` — Only `prime.md`, `implement.md`, `create-plan.md`
- `outputs/` — Empty; no leads tracking folder
- `reference/` — Empty; no outreach scripts or templates

### Gaps or Problems Being Addressed

- No weekly lead target is documented anywhere in the workspace
- No outreach scripts or templates exist in `reference/`
- No leads log or tracker exists in `outputs/`
- No Claude command exists to support the weekly review/tracking routine
- `current-data.md` has no target values set for pipeline metrics
- CLAUDE.md does not reflect the lead generation workflow as an active system

---

## Proposed Changes

### Summary of Changes

- Create `context/lead-generation.md` — strategy, channels, ICP, weekly routine, and targets
- Create `reference/outreach-scripts.md` — LinkedIn DM sequences, WhatsApp openers, referral asks, follow-up templates
- Create `outputs/leads/leads-log.md` — weekly running log of leads contacted, status, and notes
- Create `.claude/commands/weekly-leads.md` — `/weekly-leads` command for weekly pipeline review and planning
- Update `context/current-data.md` — Set "New leads this week" target to 5; fill pipeline section targets
- Update `CLAUDE.md` — Document the new `/weekly-leads` command and the `outputs/leads/` directory

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `context/lead-generation.md` | Core lead gen strategy: ICP, channels, weekly routine, targets, and qualification criteria |
| `reference/outreach-scripts.md` | Ready-to-use DM/message templates for LinkedIn, WhatsApp, and referral channels |
| `outputs/leads/leads-log.md` | Running tracker of leads contacted each week — status, source, next action |
| `.claude/commands/weekly-leads.md` | `/weekly-leads` slash command for weekly pipeline review and outreach planning |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `context/current-data.md` | Set target = 5 for "New leads this week"; fill in targets for demos, close rate, DM volume |
| `CLAUDE.md` | Add `/weekly-leads` to Commands section; add `outputs/leads/` to Workspace Structure table |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Lead generation lives in `context/lead-generation.md`, not `strategy.md`**: Strategy already exists and should stay high-level. Lead gen needs its own operational file with channel breakdowns, ICPs, and daily/weekly routines — too granular for strategy.

2. **Outreach scripts go in `reference/`, not `context/`**: Scripts are reusable tools, not background context. `reference/` is the right home per workspace structure. Claude will pull from here when asked to write or adapt messages.

3. **Leads log in `outputs/leads/leads-log.md`**: Outputs are deliverables and tracked work products. A running leads log fits here perfectly and keeps the workspace tidy. One file to start (not one per week) — can be split later when it grows.

4. **5 leads/week as the hard weekly target**: This is the user's stated goal. At typical B2B conversion rates for this type of offer (DM → demo ~10–20%, demo → close ~20–30%), 5 leads/week produces 2–4 demos/month and 1 close every 1–2 months minimum — a realistic starting baseline.

5. **LinkedIn + WhatsApp as primary channels (for now)**: These are already in `business-info.md` as the existing acquisition channels. Referrals are a bonus multiplier, not a reliable primary source at this stage.

6. **`/weekly-leads` command for structured weekly review**: A dedicated command makes it easy to start every week with a pipeline snapshot, review last week's leads, and plan this week's outreach. This is the habit-forming anchor.

### Alternatives Considered

- **One outreach script per channel file** (e.g., `reference/linkedin-scripts.md`, `reference/whatsapp-scripts.md`): Rejected — overkill at this stage. One combined file is easier to maintain and reference.
- **A spreadsheet/CSV for leads tracking**: Rejected — Claude can't natively update CSVs. A markdown log is simpler, Claude-readable, and consistent with the workspace pattern.
- **Adding lead gen targets to `strategy.md`**: Rejected — strategy.md is directional, not operational. A dedicated `lead-generation.md` keeps it operational and detailed without cluttering strategy.

### Open Questions (if any)

1. **Target niche for outreach**: Should outreach scripts be written specifically for one niche (e.g., dentists or real estate) or kept generic and adaptable? — Implementation will default to generic/adaptable with niche examples, but user should confirm if they want niche-specific versions.
2. **Offer/CTA in outreach**: Is the primary CTA a discovery call, a demo, or a free audit? — Implementation will use "15-min discovery call" as default. User should confirm or adjust.
3. **Pricing to mention (if at all)**: Some DM sequences mention price ranges to filter. Implementation will omit specific pricing in scripts until user confirms packages are finalized.

---

## Step-by-Step Tasks

### Step 1: Create `context/lead-generation.md`

Create the core operational document for lead generation — the single source of truth Claude reads to understand who to target, how, and at what volume each week.

**Actions:**

- Create file at `context/lead-generation.md`
- Include sections: ICP definition, weekly target (5 leads), channel breakdown and daily/weekly routine, qualification criteria, disqualification criteria, and how success is measured
- Link to `reference/outreach-scripts.md` for message templates
- Link to `outputs/leads/leads-log.md` for tracking

**File content spec:**

```markdown
# Lead Generation — AI OS for Business

> This file defines the operational strategy for generating 5 qualified leads per week. Claude reads this during /prime and /weekly-leads to support outreach planning and pipeline management.

---

## Weekly Target

**Goal: 5 new qualified leads per week**

A "lead" is any business owner or decision-maker who has been contacted and has responded or shown interest. Reach-outs that receive no response within 5 days are not counted as leads.

---

## Ideal Customer Profile (ICP)

**Primary targets:**
- Local service business owners in Chile / LatAm (can expand to all LatAm)
- Industries: real estate agencies, dental clinics, medical clinics, professional services (lawyers, accountants)
- Size: 2–20 employees; owner is also the sales/ops decision-maker
- Pain signal: "We're missing calls / losing leads / wasting time on repetitive admin"
- Budget signal: Comfortable spending $200–$600 USD on implementation; open to monthly support plans

**Green flags (prioritize):**
- Has a website or active social media (Instagram/Facebook)
- Mentions slow follow-up or missed calls in their content or bio
- Uses WhatsApp for business communication
- Has a team (not solo — needs the time savings)

**Red flags (skip or deprioritize):**
- B2B companies that sell to other enterprises (complex sales cycle)
- Businesses with no digital presence
- Freelancers / solo operators with no admin burden
- Outside LatAm without a Spanish-speaking team

---

## Acquisition Channels

### 1. LinkedIn (Primary — 3 leads/week target)

**Profile types to target:**
- Dentists, clinic directors, real estate brokers, agency owners
- Search: "[industry] + [city/Chile]" or people in LinkedIn groups for local business owners

**Outreach routine:**
- Monday–Friday: Send 5–7 connection requests/day (with a personalized note)
- Follow up on accepted connections within 24h with an opener
- Goal: 3 warm conversations started per week → 1 that books a call

**Content cadence:**
- 3 posts/week (Mon/Wed/Fri): before/after stories, demos, client results, explainers
- Engage on 5–10 posts/day in target industries to stay visible

### 2. WhatsApp Communities (Secondary — 1–2 leads/week target)

**Where to find them:**
- Local business owner groups (real estate, health/wellness, professional services)
- Entrepreneur communities in Chile/LatAm

**Outreach routine:**
- Join 3–5 active groups per week (look for groups with regular activity)
- Engage for 2–3 days before DMing (react, comment, add value)
- DM 3–5 people per group with a relevant opener (NOT a copy-paste pitch)

### 3. Referrals & Partnerships (Bonus — 0–1 lead/week)

**Sources:**
- Web designers, digital marketing agencies, accountants who serve local SMBs
- Ask every new client: "Who else do you know who struggles with [problem]?"
- Partner pitch: "I handle the AI/automation layer; you refer clients who need it"

---

## Qualification Criteria

A lead is "qualified" when:
1. They are a decision-maker (owner, director, manager with budget authority)
2. Their business has a repeatable process that loses leads or wastes time
3. They are open to a 15-min discovery call
4. They are in a targetable industry (see ICP above)

---

## Weekly Routine

| Day | Task |
| --- | ---- |
| Monday | Review last week's pipeline. Plan this week's outreach targets. Send 5–7 LinkedIn requests. |
| Tuesday | Follow up on accepted connections. DM 3–5 WhatsApp contacts. Publish LinkedIn post. |
| Wednesday | Follow up on pending conversations. Publish LinkedIn post. Send 5–7 new LinkedIn requests. |
| Thursday | Follow up. Add any new leads to leads-log.md. Adjust approach if response rate is low. |
| Friday | Week review: count leads, demos booked, updates to current-data.md. Plan next week. |

---

## Tracking

- Leads log: `outputs/leads/leads-log.md`
- Weekly metrics: `context/current-data.md` (Pipeline section)
- Use `/weekly-leads` command to start each week's review and planning session with Claude
```

**Files affected:**

- `context/lead-generation.md` (create new)

---

### Step 2: Create `reference/outreach-scripts.md`

Create a ready-to-use script library with LinkedIn DM sequences, WhatsApp openers, follow-up messages, and referral asks. These should be conversational, non-salesy, and adapted to the ICP.

**Actions:**

- Create file at `reference/outreach-scripts.md`
- Include: LinkedIn connection note, LinkedIn opener (post-connect), WhatsApp opener, follow-up #1 (no response), follow-up #2 (soft close), referral ask, objection responses
- Write in Spanish (primary market) with English translations noted
- Keep each template under 100 words — short messages perform better in DMs

**File content spec:**

```markdown
# Outreach Scripts — AI OS for Business

> Ready-to-use message templates for LinkedIn and WhatsApp outreach. Adapt tone and specifics to each prospect. Never copy-paste without personalizing the [BRACKETS].

---

## LinkedIn

### Connection Request Note (300 chars max)

**ES:**
"Hola [Nombre], vi que tienes [clínica/agencia/etc.] en [ciudad]. Trabajo con negocios locales ayudándoles a capturar más leads y automatizar tareas repetitivas con IA. Me encantaría conectar."

**EN:**
"Hi [Name], I noticed you run [clinic/agency/etc.] in [city]. I help local service businesses capture more leads and automate repetitive tasks with AI. Would love to connect."

---

### LinkedIn Opener (After Connection Accepted)

**ES:**
"Gracias por conectar, [Nombre]. Curiosidad rápida: ¿en tu [negocio] tienen algún proceso donde se pierden leads o el equipo pierde tiempo respondiendo lo mismo a clientes? Trabajo con negocios como el tuyo y a veces hay ganancias rápidas con IA. Sin compromiso, solo curiosidad."

**EN:**
"Thanks for connecting, [Name]. Quick question — at your [business], do you have any processes where leads slip through or your team wastes time answering the same questions? I work with businesses like yours and there are often quick wins with AI. No pitch, just curious."

---

### WhatsApp Opener

**ES:**
"Hola [Nombre], te vi en [grupo/comunidad]. Trabajo con [dentistas/inmobiliarias/clínicas] ayudándoles a nunca perder una llamada o consulta, incluso fuera de horario, con un agente de IA. ¿Tienen ese problema? Si te interesa lo que hacemos, con gusto te muestro cómo funciona en 15 minutos."

**EN:**
"Hi [Name], I saw you in [group/community]. I help [dentists/real estate/clinics] never miss a call or inquiry — even after hours — with an AI agent. Does that sound familiar? Happy to show you how it works in 15 minutes if you're curious."

---

### Follow-Up #1 — No Response (3–5 days later)

**ES:**
"Hola [Nombre], solo quería hacer un seguimiento rápido. Si no es el momento correcto, sin problema — puedo volver en otro momento. Pero si lidias con leads que se pierden o respuestas lentas, me encantaría mostrarte algo concreto."

**EN:**
"Hey [Name], just a quick follow-up. No worries if the timing isn't right — happy to reconnect later. But if missed leads or slow responses are something you deal with, I'd love to show you something concrete."

---

### Follow-Up #2 — Soft Close (5–7 days after follow-up #1)

**ES:**
"[Nombre], último intento para no ser pesado 😄. Si no es algo relevante para tu negocio ahora mismo, lo entiendo totalmente. Si en algún momento quieres ver cómo otros [dentistas/agencias] están usando IA para capturar más clientes, aquí estaré."

**EN:**
"[Name], last attempt — don't want to be a nuisance 😄. Totally get it if it's not relevant right now. If you ever want to see how other [dentists/agencies] are using AI to capture more clients, I'm here."

---

### Referral Ask (After a positive conversation or closed deal)

**ES:**
"Por cierto, [Nombre], ¿conoces a otros dueños de negocios que estén batallando con llamadas perdidas, respuestas lentas o mucho trabajo manual? Si me presentas alguien que encaje, lo atiendo con prioridad y, si cierra, te doy una comisión o un descuento en tu próxima renovación."

**EN:**
"By the way, [Name], do you know other business owners dealing with missed calls, slow responses, or too much manual work? If you intro someone who's a good fit, I'll give them priority attention — and if they close, there's a referral bonus for you."

---

## Objection Responses

### "We already have someone for that"

**ES:** "Perfecto, ¿qué están usando actualmente? Solo pregunto para entender si lo que hacemos es complementario o diferente. No estoy aquí para reemplazar lo que ya funciona."

### "We don't have the budget"

**ES:** "Lo entiendo. Solo por curiosidad, ¿cuántos leads o llamadas estiman que se pierden al mes? A veces el costo de no hacer nada es más alto que la herramienta. Si quieres, te hago un cálculo rápido."

### "Send me more info"

**ES:** "Claro, te mando algo corto. Pero honestamente, lo que hago es difícil de explicar en texto — funciona mucho mejor en 10–15 minutos viendo una demo. ¿Tienes un hueco esta semana?"
```

**Files affected:**

- `reference/outreach-scripts.md` (create new)

---

### Step 3: Create `outputs/leads/leads-log.md`

Create the weekly leads tracker. This is a living document updated each week to log every lead contacted, their status, source, and next action.

**Actions:**

- Create directory `outputs/leads/` (by creating the file within it)
- Create `outputs/leads/leads-log.md` with a structured table and instructions
- Include the current week (Week of 2026-02-24) as the first entry section

**File content spec:**

```markdown
# Leads Log — AI OS for Business

> Running tracker of all leads contacted. Update weekly. Use `/weekly-leads` command to review with Claude.

**Target:** 5 qualified leads/week
**A "lead" is:** a decision-maker who has responded or shown interest (not just a reach-out sent)

---

## How to Use

1. Add leads to the current week's table as you contact them
2. Update status each time you follow up
3. At end of week, count totals and update `context/current-data.md`
4. Archive completed weeks below the current one (keep the log in one file)

**Status options:** `Reached Out` | `Responded` | `Interested` | `Demo Booked` | `Proposal Sent` | `Closed` | `Not Interested` | `No Response`

---

## Week of 2026-02-24

| # | Name | Business | Channel | Date Contacted | Status | Next Action | Notes |
|---|------|----------|---------|----------------|--------|-------------|-------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |

**Week Summary:**
- Leads contacted: 0
- Leads responded: 0
- Demos booked: 0
- Closed: 0

---

## Archive

_(Completed weeks will be moved here)_
```

**Files affected:**

- `outputs/leads/leads-log.md` (create new)

---

### Step 4: Create `.claude/commands/weekly-leads.md`

Create the `/weekly-leads` slash command. When run, Claude reviews the leads log, checks current data, and generates a structured weekly plan with outreach targets, follow-ups needed, and content suggestions.

**Actions:**

- Create `.claude/commands/weekly-leads.md`
- Structure the command to: read the leads log, read current-data.md, read lead-generation.md, then produce a weekly briefing and plan

**File content spec:**

```markdown
# Weekly Leads

> Run this command every Monday to review last week's pipeline and plan this week's lead generation activity.

## Run

Read the following files:
- `context/lead-generation.md`
- `context/current-data.md`
- `outputs/leads/leads-log.md`

## Produce

Generate a structured **Weekly Lead Generation Briefing** with these sections:

### 1. Last Week Summary
- Leads contacted vs. target (5)
- Leads who responded
- Demos booked / completed
- Any deals moved forward

### 2. Follow-Ups Needed This Week
- List any leads from the log with status "Reached Out" or "Responded" that need a follow-up
- For each: suggest the specific message to send (pull from reference/outreach-scripts.md)

### 3. This Week's Outreach Plan
- Suggest 5 new prospect types or specific search angles for LinkedIn and WhatsApp
- How many new connection requests to send per day to hit the target
- Any content angles to post this week that support outreach (based on recent conversations/objections)

### 4. Pipeline Health Check
- Are we on track for demos and closes this month?
- Any conversion rate concerns based on the data so far?
- One thing to optimize or test this week

### 5. Action List
A clear checklist of this week's lead gen actions (in priority order)
```

**Files affected:**

- `.claude/commands/weekly-leads.md` (create new)

---

### Step 5: Update `context/current-data.md`

Set the pipeline targets in the existing table. Right now all targets are blank — this makes it impossible to track progress. Set concrete weekly targets based on the 5-leads-per-week goal and realistic conversion rates.

**Actions:**

- In the Pipeline section, set the following targets:
  - New leads this week → Target: **5**
  - Demos booked this week → Target: **2**
  - Demos completed this week → Target: **2**
  - Proposals sent this week → Target: **1**
  - Close rate (proposal → won) → Target: **30%**
  - Sales cycle length → Target: **14 days**
- In the Funnel & Marketing section, set:
  - LinkedIn posts/week → Target: **3**
  - Outbound DMs/week → Target: **20** (to generate 5 responses)
  - DM → demo booking rate → Target: **10%**

**Files affected:**

- `context/current-data.md` (modify Pipeline and Funnel sections)

---

### Step 6: Update `CLAUDE.md`

Add the new command and directory to CLAUDE.md so all future sessions are aware of them without needing to rediscover.

**Actions:**

- Add `/weekly-leads` entry to the Commands section with a description
- Add `outputs/leads/` row to the Workspace Structure table (or a note under `outputs/`)
- Optionally add a brief note about the lead generation system in the Session Workflow section

**Specific changes:**

In the **Commands** section, add after the `/implement` block:

```markdown
### /weekly-leads

**Purpose:** Run a weekly lead generation review and planning session.

Run every Monday. Claude will:

1. Review last week's leads log and pipeline metrics
2. Identify follow-ups needed
3. Generate this week's outreach plan (5 leads/week target)
4. Produce a prioritized action checklist
```

In the **Workspace Structure** table, update the `outputs/` row description to:
> Deliverables, analyses, reports, and work products. Includes `leads/` subfolder for weekly lead tracking.

**Files affected:**

- `CLAUDE.md` (modify Commands section and Workspace Structure table)

---

## Connections & Dependencies

### Files That Reference This Area

- `context/strategy.md` — Priority #2 references outbound pipeline; this plan operationalizes it
- `context/current-data.md` — Pipeline section will now have targets and be updated weekly
- `context/personal-info.md` — Mentions outreach scripts as a workspace output; now fulfilled

### Updates Needed for Consistency

- After implementation, user should update `context/strategy.md` to note that the lead gen system is now active (optional but good hygiene)
- `context/current-data.md` should be updated every Friday as part of the weekly routine

### Impact on Existing Workflows

- `/prime` will now surface `context/lead-generation.md` in its context read — Claude will be lead-gen aware from session start
- `/weekly-leads` becomes a new Monday ritual, feeding into the existing pipeline metrics in `current-data.md`
- No existing commands are changed or broken

---

## Validation Checklist

- [ ] `context/lead-generation.md` exists and contains ICP, weekly routine, and 5-lead target
- [ ] `reference/outreach-scripts.md` exists with LinkedIn DM sequence, WhatsApp opener, follow-ups, and objection responses
- [ ] `outputs/leads/leads-log.md` exists with current week's table ready to fill
- [ ] `.claude/commands/weekly-leads.md` exists and the `/weekly-leads` command runs without errors
- [ ] `context/current-data.md` has targets set for: new leads/week (5), demos/week (2), outbound DMs/week (20), DM→demo rate (10%), close rate (30%)
- [ ] `CLAUDE.md` lists `/weekly-leads` in Commands section with description
- [ ] `CLAUDE.md` references `outputs/leads/` in the Workspace Structure section

---

## Success Criteria

The implementation is complete when:

1. Running `/weekly-leads` produces a structured weekly briefing with last-week summary, follow-up list, and this week's outreach plan
2. `outputs/leads/leads-log.md` is ready to track the first week of leads with a clear table format
3. All workspace files (CLAUDE.md, current-data.md) reflect the 5-leads/week system so future `/prime` sessions immediately understand the lead generation routine

---

## Notes

- **Conversion math (sanity check):** 20 DMs/week → ~10% response = 2 warm leads from DMs. Add LinkedIn content inbound + WhatsApp + referrals to reach 5 total. This is aggressive but achievable if outreach is personalized and consistent.
- **Niche specificity:** The outreach scripts are currently generic/adaptable. Once the user commits to a primary niche (e.g., dentists), all scripts should be updated to be niche-specific — this dramatically improves response rates.
- **Future enhancement:** A script in `scripts/` could generate a weekly summary by auto-reading the leads log and prompting Claude — but that's a phase 2 addition.
- **Language:** Scripts are in Spanish (primary market) with English translations. User can remove the English versions once they're comfortable with the templates.
- **Trial offer consideration:** If the user decides on a "2-week free pilot" or similar hook (noted as open question in strategy.md), the outreach scripts should be updated to lead with that offer as the CTA.

---

## Implementation Notes

**Implemented:** 2026-02-24

### Summary

All 6 steps executed in full. Created 4 new files (lead-generation.md, outreach-scripts.md, leads-log.md, weekly-leads.md command) and modified 2 existing files (current-data.md targets filled in, CLAUDE.md updated with new command and outputs/leads/ reference).

### Deviations from Plan

- Added `reference/outreach-scripts.md` to the `/weekly-leads` command's Read list (plan omitted it; including it ensures Claude has scripts available when generating follow-up suggestions).

### Issues Encountered

None.
