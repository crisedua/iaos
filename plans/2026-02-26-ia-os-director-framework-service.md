# Plan: IA OS Director Framework — Productized Service

**Created:** 2026-02-26
**Status:** Implemented
**Request:** Implement a service that installs the IA OS Framework for clients, transforming them from operators (doing everything manually) to directors (directing AI to act on their behalf).

---

## Overview

### What This Plan Accomplishes

This plan builds the full delivery infrastructure for the "IA OS — Director Framework" service: a structured engagement where you install a personalized AI Operating System for a client so they can start directing AI instead of doing everything themselves. It produces a formal service document, a client intake questionnaire, a delivery SOP, a reusable Context OS template, and a `/ia-os-session` Claude command to support live client and personal sessions.

### Why This Matters

The `reference/ia-so-asistente-personal.md` doc already defines the 5-layer framework (Context, Data, Intelligence, Automation, Output) but it exists only as a concept document — there's no productized service, no delivery playbook, no intake flow, and no Claude command to run sessions. Without these, every client engagement starts from scratch, takes longer, and relies on memory rather than system. Building this infrastructure makes the offer repeatable, scalable, and faster to deliver — and directly supports Q1 2026's priority of productizing core offers with repeatable delivery systems.

---

## Current State

### Relevant Existing Structure

- `reference/ia-so-asistente-personal.md` — Full 5-layer IA OS concept and FAQ (the framework exists in raw form)
- `reference/mini-diagnostico-ia-os.md` — Diagnostic questionnaire for B2B voice agent clients (partial overlap)
- `context/business-info.md` — Defines AI OS Setup as a core offer alongside SolIA and EduIA
- `context/strategy.md` — Q1 2026 priority: productize delivery, make it repeatable
- `.claude/commands/` — 6 existing commands (prime, create-plan, implement, weekly-leads, extract-leads-gmap, outreach-leads) — no command for IA OS client sessions

### Gaps or Problems Being Addressed

- No productized service definition with pricing, scope, and deliverables
- No client intake/discovery form to capture their current state before setup
- No delivery SOP — each engagement is improvised rather than systematic
- No reusable Context OS template (what clients fill in to "teach" their AI)
- No Claude command to run IA OS sessions — can't get Claude's help during live client sessions
- "Director vs operator" framing not yet used — this is the core transformation promise and the strongest hook for positioning

---

## Proposed Changes

### Summary of Changes

- Create a formal IA OS Director Framework service document with director/operator positioning, package tiers, and delivery overview
- Create a client intake questionnaire that maps current pain to the 5 IA OS layers
- Create a delivery SOP: the step-by-step playbook YOU follow from discovery to go-live
- Create a reusable Context OS template (clients complete this to configure their AI)
- Create `/ia-os-session` command — runs a structured client or personal IA OS work session
- Update `CLAUDE.md` to reference the new command and assets

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `reference/ia-os-director-framework.md` | Polished service document — the "director vs operator" offer, 5 layers, package tiers, pricing guidance, transformation promise |
| `reference/ia-os-intake.md` | Client intake/discovery questionnaire — maps current workflow, tools, pain points, and goals to 5 IA OS layers |
| `reference/ia-os-delivery-sop.md` | Step-by-step delivery playbook — what you do from "yes" to fully installed IA OS (reproducible across clients) |
| `reference/ia-os-context-template.md` | Blank Context OS template — filled in per client during onboarding to give Claude their operational knowledge base |
| `.claude/commands/ia-os-session.md` | `/ia-os-session` command — runs a structured IA OS work session (onboarding, weekly review, task session, output sprint) |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `CLAUDE.md` | Add `/ia-os-session` to Commands section; note new reference files in Workspace Structure |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Separate from `ia-so-asistente-personal.md`, don't replace it**: The existing doc stays as a raw concept/sales brief. New files are purpose-specific (service doc, intake, SOP, template). Avoids bloat and keeps each file focused.

2. **"Director vs operator" as the central positioning hook**: This is the transformation promise. Every piece of content anchors on this frame because it's concrete and resonant — business owners immediately understand "I'm in the weeds" vs "I want to direct."

3. **Three package tiers (Starter, Sistema, Director)**: Maps to the complexity and depth of engagement — from a one-time Context OS setup to full ongoing AI directorship. Mirrors the existing SolIA diagnostic profiles (green/yellow/red) for consistency.

4. **`/ia-os-session` covers 4 session types**: Onboarding, Weekly Review, Task Sprint, and Output Session. One command, mode-based — simpler than 4 separate commands and matches how the service actually runs.

5. **Context OS template is client-specific, stored in workspace**: When working with a client, their context template lives in `outputs/ia-os-clients/[client-name]/context-os.md` so Claude can reference it during sessions.

### Alternatives Considered

- **One mega-document**: Rejected — too hard to navigate during live sessions; each file serves a distinct workflow moment.
- **Separate commands per session type** (`/ia-os-onboard`, `/ia-os-review`, etc.): Rejected — adds complexity to CLAUDE.md; the mode argument is cleaner.
- **Integrate into `/prime` instead of a new command**: Rejected — prime is workspace initialization, not client session management; mixing them pollutes both.

### Open Questions (if any)

- **Pricing**: Should package pricing be included in the service doc, or kept in a separate (private) pricing file? — Defaulting to price ranges (not exact numbers) in the public service doc, since this file may be shared with prospects.
- **Client storage location**: Are clients tracked anywhere beyond `outputs/ia-os-clients/`? If you have a CRM or sheet, the delivery SOP should reference it. For now it defaults to local workspace files.

---

## Step-by-Step Tasks

Execute these tasks in order during implementation.

---

### Step 1: Create the IA OS Director Framework service document

**What to do:** Write the polished "IA OS Director Framework" service doc. This is the canonical description of what the service is, who it's for, and what transformation it delivers. Positioned around "director vs operator." Include: the core promise, who it's for, the 5 layers explained simply, 3 package tiers with outcomes and scope, what's included in each, and clear next steps. Written in Spanish (since the market is LatAm / Chile) — but keep layer names and framework terms in English for clarity.

**Actions:**

- Create `reference/ia-os-director-framework.md`
- Open with the director/operator transformation promise (bold, visceral)
- Explain the "Director Mindset" vs "Operator Trap" with concrete examples
- Describe the 5 IA OS layers (Context, Data, Intelligence, Automation, Output) in plain language
- Define 3 tiers:
  - **Starter — Context OS** (one-time): build the knowledge base + 1 workflow. No ongoing. ~3–5 days.
  - **Sistema** (90-day engagement): full 5-layer install + weekly checkpoints + 3 months of tuning.
  - **Director** (ongoing retainer): monthly continued optimization, new automations, and weekly session.
- Each tier: what's included, what client provides, expected outcomes, timeframe
- Close with next step CTA (discovery call / intake form)

**Files affected:**

- `reference/ia-os-director-framework.md` (create)

---

### Step 2: Create the client intake questionnaire

**What to do:** Build a structured intake document clients complete (or you complete with them on a discovery call) before setup begins. Covers their current workflow, tools, pain points, goals, and what "being a director" means to them. Maps answers to the 5 IA OS layers to determine what to build first.

**Actions:**

- Create `reference/ia-os-intake.md`
- Section 1: **Quién eres** — role, business type, team size, weekly hours worked
- Section 2: **Tu operación hoy** — describe your typical week; what takes the most time; what you do manually that you wish ran itself
- Section 3: **Herramientas actuales** — tools they use (Drive, Notion, TickTick/Todoist, CRM, WhatsApp, etc.)
- Section 4: **Dolores principales** — top 3 operational drains; where they feel most reactive
- Section 5: **Metas** — 12-week goal; what does "winning" look like in 3 months; which metric matters most
- Section 6: **Madurez IA** — current AI usage (none / occasional / daily); comfort level; what they've tried
- Section 7: **Prioridad por capa** (scored) — quick 1–5 rating of urgency for each of the 5 layers (Context, Data, Intelligence, Automation, Output) so you know where to start
- Close with: "Con estas respuestas, Claude construye tu Context OS en la primera sesión"
- Include: internal note at bottom — after completing with client, save their answers to `outputs/ia-os-clients/[name]/intake.md`

**Files affected:**

- `reference/ia-os-intake.md` (create)

---

### Step 3: Create the delivery SOP

**What to do:** Write the step-by-step delivery playbook you follow for every client. This makes the service reproducible — same quality, same structure, faster execution. Organized into phases that map to the package tiers.

**Actions:**

- Create `reference/ia-os-delivery-sop.md`
- **Phase 0 — Pre-Kickoff** (before first session): send intake form, schedule kickoff, set up client folder in `outputs/ia-os-clients/[client-name]/`
- **Phase 1 — Discovery & Context OS** (Session 1, ~90 min): complete intake, identify top 3 workflows, build Context OS draft together (fill `context-os.md` template)
- **Phase 2 — Data Layer Setup** (async + session 2, ~60 min): define 3–5 KPIs to track, choose the tool (Sheet/Notion), set up the weekly update rhythm
- **Phase 3 — First Automations** (Sessions 3–4, 2×60 min): pick 2–3 high-ROI repetitive tasks; build automations (Claude commands, Zapier/Make flows, scripts); test with client
- **Phase 4 — Intelligence Layer** (Session 5, ~60 min): configure weekly review session rhythm; run first structured review together; template the output format
- **Phase 5 — Output Templates** (async): create 3–5 output templates specific to their work (reports, proposals, emails, SOPs, etc.)
- **Phase 6 — Go-Live & Handoff**: client runs first solo session; review results; identify gaps; document their personal "director operating manual"
- **Ongoing (if retainer)**: monthly session cadence, quarterly context refresh, new automation queue
- Include: quality checklist at end of each phase; time estimates; what client provides vs you produce

**Files affected:**

- `reference/ia-os-delivery-sop.md` (create)

---

### Step 4: Create the Context OS template

**What to do:** Build the reusable blank template clients fill in during Session 1. This becomes their personal AI knowledge base — Claude reads it to operate with their context. It mirrors the structure of this workspace's own `context/` folder but simplified for non-technical clients.

**Actions:**

- Create `reference/ia-os-context-template.md`
- Include the following sections (with instructions for client on what to fill in):
  - **Tu Negocio / Rol**: what you do, who you serve, how you make money
  - **Tus Ofertas / Servicios**: what you sell (name, price, what's included, who it's for)
  - **Tu Proceso Comercial**: how leads come in → how you close → how you onboard
  - **Tu Equipo y Roles** (if any): who does what
  - **Prioridades del Trimestre**: what matters most right now (goals + focus areas)
  - **SOPs Clave** (list format): top 5–10 processes they follow regularly (link to separate docs)
  - **Herramientas Activas**: stack they use daily (and what each one does)
  - **Estilo de Comunicación**: tone, language, formality level (used for output generation)
  - **Qué NO hacer / Restricciones**: things Claude should never do or assume
- Each section: brief instruction in italics + blank fill-in area
- End with: "Este documento se actualiza mensualmente — es tu IA OS al día"

**Files affected:**

- `reference/ia-os-context-template.md` (create)

---

### Step 5: Create the `/ia-os-session` command

**What to do:** Write the command file that Claude executes during live IA OS sessions. Supports 4 modes: `onboard`, `review`, `sprint`, `output`. Each mode has a specific structure Claude follows.

**Actions:**

- Create `.claude/commands/ia-os-session.md`
- Command receives: `[mode] [client-name-or-"personal"]`
  - If no args, default to `review personal`
- **Mode: `onboard [client]`**
  - Read `reference/ia-os-intake.md` as guide
  - Ask intake questions interactively (or ask user to paste completed intake)
  - Build Context OS from answers using `reference/ia-os-context-template.md`
  - Save to `outputs/ia-os-clients/[client]/context-os.md`
  - Output: summary of what was captured, top 3 recommended first workflows to automate
- **Mode: `review [client|personal]`**
  - Read client's `context-os.md` + any data file they maintain
  - Ask: "What happened this week? Any wins, blockers, open decisions?"
  - Produce: executive summary, 3 key insights, recommended priorities for next 7 days, one automation idea
- **Mode: `sprint [client|personal]`**
  - Ask what task or project to work on now
  - Read context-os.md for client background
  - Execute the work: write, plan, structure, draft — produce the output
  - End with: next step and any new context to add to their OS
- **Mode: `output [type] [client|personal]`**
  - `type` options: proposal, sop, report, email, post, checklist
  - Read context-os.md for voice/style/context
  - Produce the requested output using client's templates if available
- Include: note at top — "This command helps you operate as a Director: you give direction, Claude executes"

**Files affected:**

- `.claude/commands/ia-os-session.md` (create)

---

### Step 6: Create client output directory structure

**What to do:** Create the folder that will store per-client IA OS files. Add a `.gitkeep` placeholder and a README explaining the structure.

**Actions:**

- Create `outputs/ia-os-clients/` directory (create `outputs/ia-os-clients/README.md` as placeholder)
- README content: one-line explanation of what goes here, and the per-client file structure:
  - `[client-name]/context-os.md` — their Context OS (from template)
  - `[client-name]/intake.md` — their completed intake questionnaire
  - `[client-name]/session-log.md` — running log of sessions + outputs
  - `[client-name]/automations/` — automation scripts/configs for this client

**Files affected:**

- `outputs/ia-os-clients/README.md` (create)

---

### Step 7: Update CLAUDE.md

**What to do:** Add the new command and updated file references to CLAUDE.md so future sessions know they exist.

**Actions:**

- In the **Workspace Structure** section: add `ia-os-clients/` subfolder under `outputs/`; add new reference files to `reference/` listing; add `tasks.md` to `.claude/commands/` listing
- In the **Commands** section: add `/ia-os-session` with description, modes, and example usage
- Update `.mcp.json` description line to mention TickTick (if already added, otherwise leave for TickTick plan)

**Specific text to add to Commands section:**

```markdown
### /ia-os-session [mode] [client|personal]

**Purpose:** Run a structured IA OS work session — for yourself or a client.

Modes:
- `onboard [client]` — Complete intake, build Context OS, identify first automations
- `review [client|personal]` — Weekly review: what happened, insights, priorities, one automation idea
- `sprint [client|personal]` — Focused work session: bring a task, Claude executes it with full client context
- `output [type] [client|personal]` — Generate a specific deliverable (proposal, SOP, report, email, post, checklist)

Default (no args): `review personal` — runs your own weekly IA OS review.

**Context files read:** `outputs/ia-os-clients/[client]/context-os.md`, `reference/ia-os-context-template.md`
```

**Files affected:**

- `CLAUDE.md`

---

## Connections & Dependencies

### Files That Reference This Area

- `reference/ia-so-asistente-personal.md` — existing framework doc; new service doc builds on it without replacing it
- `context/business-info.md` — AI OS Setup is listed as a core offer; this plan formalizes it
- `context/strategy.md` — Q1 priority: productize offers with repeatable delivery
- `context/current-data.md` — "Active Projects" includes "Standardized onboarding checklist (v1)" — this plan delivers it

### Updates Needed for Consistency

- `context/current-data.md` — After implementation, mark "Standardized onboarding checklist (v1)" as completed in Active Projects
- `context/business-info.md` — Consider adding "IA OS Director Framework" as a named offer alongside SolIA and EduIA

### Impact on Existing Workflows

- `/prime` will now show the new command in its summary
- Outreach and demo flows can reference the "director vs operator" framing from the new service doc
- No existing commands are modified

---

## Validation Checklist

- [ ] `reference/ia-os-director-framework.md` exists and includes: promise, 3 tiers, what's included, CTA
- [ ] `reference/ia-os-intake.md` exists and covers all 7 sections (rol, operación, herramientas, dolores, metas, madurez IA, prioridad por capa)
- [ ] `reference/ia-os-delivery-sop.md` exists with all 6 phases + ongoing + quality checklists
- [ ] `reference/ia-os-context-template.md` exists with all 9 sections and fill-in instructions
- [ ] `.claude/commands/ia-os-session.md` exists and handles all 4 modes correctly
- [ ] `outputs/ia-os-clients/README.md` exists explaining the folder structure
- [ ] `CLAUDE.md` updated: new command listed, new reference files documented
- [ ] Running `/ia-os-session` in a new session correctly triggers the review mode with no errors
- [ ] Running `/ia-os-session onboard test-client` produces a filled Context OS

---

## Success Criteria

The implementation is complete when:

1. You can onboard a new IA OS client in a single session using `/ia-os-session onboard [name]` and walk away with their `context-os.md` file built
2. You can run a weekly personal IA OS review using `/ia-os-session` (no args) and get a structured briefing with priorities and one automation idea
3. Any new Claude session can pick up where a client engagement left off by reading their `context-os.md` file — no memory required
4. The service is fully described, packaged, and priced in `reference/ia-os-director-framework.md` — ready to send to a prospect or use as a demo script

---

## Notes

- **The meta-point**: This workspace itself IS an example of the IA OS in action — the user operates as a director by giving Claude context and commands, and Claude executes. The best demo of the service is this workspace.
- **Spanish vs English**: Deliver-facing docs (intake, service doc) should be in Spanish for the LatAm market. Internal SOP and the command file can be in English. The Context OS template should be in Spanish (clients fill it in).
- **Future: client portal**: Once 3+ clients are active, consider a Notion-based client portal that syncs with this workspace — but don't build that now. Ship the file-based system first.
- **Pricing guidance**: Starter (~$200–400 one-time), Sistema (~$800–1500 for 90 days), Director ($300–500/month retainer). Adjust based on market feedback.
- **Connection to EduIA**: The IA OS Director Framework IS the productized version of EduIA training — clients learn by doing, and the output is their working system.

---

## Implementation Notes

**Implemented:** 2026-02-26

### Summary

- Created `reference/ia-os-director-framework.md` — full service doc in Spanish with director/operator positioning, 5 layers, 3 package tiers (Starter $250+, Sistema $900+, Director $350+/mo), and discovery call CTA
- Created `reference/ia-os-intake.md` — 7-section client intake questionnaire in Spanish covering role, current operation, tools, pain points, goals, AI maturity, and per-layer priority scoring
- Created `reference/ia-os-delivery-sop.md` — 6-phase delivery playbook in English with phase-by-phase agendas, quality checklists, time estimates, and troubleshooting guide
- Created `reference/ia-os-context-template.md` — 9-section Context OS template in Spanish with fill-in instructions and examples for every section
- Created `.claude/commands/ia-os-session.md` — `/ia-os-session` command with 4 modes (onboard, review, sprint, output) and full structured output formats
- Created `outputs/ia-os-clients/README.md` — documents per-client folder structure and setup commands
- Updated `CLAUDE.md` — added `/ia-os-session` to Commands section, added `ia-os-clients/` to outputs structure, updated `.mcp.json` description, updated commands listing

### Deviations from Plan

- Pricing included in the service doc as "Desde $XXX" ranges (not exact numbers) — as noted in the plan's open questions, ranges are appropriate for a shareable document
- Context OS template kept primarily in Spanish to match the LatAm client audience, with English instructions in comments for internal use
- SOP written in English as planned (internal document)
- Command file written in English as planned (technical document)

### Issues Encountered

None.
