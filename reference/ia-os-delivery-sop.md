# IA OS Director Framework — Delivery SOP

> **Purpose:** Step-by-step playbook for delivering the IA OS Director Framework service. Follow this for every client engagement — from "yes" to fully installed AI OS. Makes delivery reproducible, consistent, and faster with each repetition.

---

## Before You Start: Client Folder Setup

When a client signs, immediately create their workspace:

```
outputs/ia-os-clients/[client-name]/
├── intake.md          ← completed intake questionnaire
├── context-os.md      ← their Context OS (built in Session 1)
├── session-log.md     ← running log of all sessions + outputs
└── automations/       ← any scripts/configs built for this client
```

Run in terminal:
```bash
mkdir -p "outputs/ia-os-clients/[client-name]/automations"
touch "outputs/ia-os-clients/[client-name]/intake.md"
touch "outputs/ia-os-clients/[client-name]/context-os.md"
touch "outputs/ia-os-clients/[client-name]/session-log.md"
```

---

## Phase 0 — Pre-Kickoff

**Timing:** Before Session 1
**Your effort:** ~30 min
**Client effort:** ~20 min

### Your Actions

- [ ] Send intake form (`reference/ia-os-intake.md`) via WhatsApp or email
- [ ] Schedule Session 1 (kickoff) for 90 minutes
- [ ] Send calendar invite with this prep note: _"Antes de nuestra sesión, completa el formulario que te envié. Si tienes dudas, déjalo en blanco y lo completamos juntos."_
- [ ] If client completes intake: read it fully before Session 1 and fill in the "Resumen para el Consultor" section
- [ ] Copy blank context template to client folder: `cp reference/ia-os-context-template.md outputs/ia-os-clients/[name]/context-os.md`

### Quality Check — Phase 0 Complete When:
- [ ] Intake sent (or scheduled to do live in Session 1)
- [ ] Session 1 calendared
- [ ] Client folder created

---

## Phase 1 — Discovery & Context OS

**Session 1 | Duration: 90 min | Format: Video call**

### Objective

Leave this session with a complete first draft of the client's Context OS — the knowledge base their AI will use to operate with their context.

### Session Agenda

**0:00–0:20 — Discovery (if intake not pre-completed)**
Walk through `reference/ia-os-intake.md` sections 1–6 verbally. Take notes directly in their `intake.md`.

**0:20–0:40 — Pain Prioritization**
Review Section 7 (prioridad por capa) together. Ask: "Si pudieras resolver solo UNO de estos problemas en el primer mes, ¿cuál elegiría?" Identify the #1 layer to install first.

**0:40–1:20 — Build Context OS Together**
Open `outputs/ia-os-clients/[name]/context-os.md` and fill in each section live with the client. Use Claude to help structure and clean their answers in real time:
- Run `/ia-os-session onboard [client-name]` if helpful
- Focus on: Negocio, Ofertas, Proceso Comercial, Prioridades del Trimestre

**1:20–1:30 — Wrap + Next Steps**
- Confirm: "Este documento es tu base de operaciones. Lo iremos actualizando."
- Preview: what happens in Session 2
- Assign async homework: fill in any blank sections of context-os.md before Session 2

### After Session 1

- [ ] Finalize context-os.md (clean up and structure what was captured)
- [ ] Update session-log.md with date, what was covered, and 3 key insights
- [ ] Confirm package tier and scope with client (if not already done)
- [ ] Schedule Sessions 2–3

### Quality Check — Phase 1 Complete When:
- [ ] `context-os.md` has at least 6/9 sections filled
- [ ] Top priority layer identified
- [ ] First automation target identified
- [ ] Session log updated

---

## Phase 2 — Data Layer Setup

**Sessions: 1 dedicated session (60 min) + async setup**
**Applies to: Sistema and Director packages only (Starter skips this phase)**

### Objective

Define 3–5 KPIs the client will track weekly, choose the tool, and build the tracking structure. Establish the weekly update habit.

### Session Agenda

**0:00–0:15 — Define what to measure**
Ask: "Si al final de cada semana pudieras ver 3 números que te dijeran si la semana fue buena o mala, ¿cuáles serían?" Capture 3–5 metrics. Map to their business goals from intake.

**0:15–0:35 — Build the tracking structure**
Open the tool they use (Sheets preferred for simplicity). Build:
- A simple weekly log table (date, metric 1, metric 2, metric 3, notes)
- One summary view (current vs target vs last week)

**0:35–0:50 — Set the update routine**
Agree: what day/time each week they update the tracker. How long it takes (<10 min). Where the data comes from (sales tool, WhatsApp, gut estimate).

**0:50–1:00 — Connect to IA OS review**
Show how their data will feed into the weekly `/ia-os-session review` — Claude reads their numbers and produces insights automatically.

### After Session 2

- [ ] Tracker built and shared with client
- [ ] Update routine agreed and calendared
- [ ] session-log.md updated
- [ ] context-os.md updated with "Herramientas Activas" section (add tracker link)

### Quality Check — Phase 2 Complete When:
- [ ] Weekly tracker exists with at least 3 metrics
- [ ] Client has updated it at least once solo
- [ ] Context OS references where data lives

---

## Phase 3 — First Automations

**Sessions: 2 sessions (60 min each) + async build time**
**Applies to: All packages (Starter: 1 automation; Sistema/Director: 2–3)**

### Objective

Build the 2–3 highest-ROI automations based on the intake's top pain points. Test each with the client present.

### Identifying the Right Automations

Use the intake's "top 3 tareas repetitivas" + Phase 2 data to rank automation candidates:

**Highest-ROI automation types:**

| Automation | When to prioritize |
|------------|-------------------|
| `/ia-os-session sprint` for proposals/SOPs | Client spends 1+ hours/week on documents |
| Claude command for weekly review | Client has no planning rhythm |
| Automated follow-up sequence | Client loses leads due to no follow-up |
| FAQ/intake template → context fill | Client answers the same questions repeatedly |
| Task capture from notes → TickTick/Todoist | Client has scattered task management |
| Weekly data pull → summary report | Client tracks metrics but doesn't analyze them |

### Session 3 — Build Automation #1

- [ ] Confirm target automation with client
- [ ] Build it live during session (Claude command / Zapier / Make / script)
- [ ] Test with a real example from client's business
- [ ] Walk client through how to use it independently
- [ ] Document the automation in `outputs/ia-os-clients/[name]/automations/`

### Session 4 — Build Automations #2 and #3

- [ ] Review how Automation #1 is performing (any issues?)
- [ ] Build #2 and #3 using same format
- [ ] Run a "Director Simulation": client directs, AI executes — you observe and coach

### After Phase 3

- [ ] Each automation documented (what it does, how to trigger, what to do if it breaks)
- [ ] context-os.md updated with automation descriptions
- [ ] session-log.md updated

### Quality Check — Phase 3 Complete When:
- [ ] Agreed automations built and tested
- [ ] Client can trigger each automation independently
- [ ] Documentation exists for each automation

---

## Phase 4 — Intelligence Layer

**Session 5 | Duration: 60 min**
**Applies to: Sistema and Director packages**

### Objective

Configure the weekly review rhythm. Run the first structured review session together so the client knows how it works.

### Session Agenda

**0:00–0:15 — Define the review format**
Agree on: what day/time (Monday morning recommended), how long (30 min), what Claude covers (data review + priorities + one automation idea), output format (bullet points, narrative, action list).

**0:15–0:45 — Run the first review live**
Run `/ia-os-session review [client-name]` with them present. Walk through the output. Adjust the prompt/template based on their feedback.

**0:45–1:00 — Lock the habit**
Add a recurring 30-min calendar block each week: "IA OS Weekly Review." Show them exactly what to do each time.

### After Phase 4

- [ ] Weekly review cadence calendared
- [ ] Client knows how to run `/ia-os-session review` independently
- [ ] First review output saved to session-log.md

### Quality Check — Phase 4 Complete When:
- [ ] Client ran one review solo (without you present) and reported results

---

## Phase 5 — Output Templates

**Async delivery: 3–5 days after Phase 4**
**Applies to: Sistema and Director packages**

### Objective

Build 3–5 output templates specific to the client's most common deliverables. These let them generate polished outputs instantly rather than from scratch.

### Template Priorities (based on intake)

Choose 3–5 from this list based on their answers:

| Template | When to build |
|----------|--------------|
| Propuesta comercial | Client writes proposals regularly |
| Email de seguimiento | Client does manual follow-ups |
| Reporte ejecutivo | Client sends reports to team/clients |
| SOP / checklist | Client has processes to document |
| Guión de llamada / demo | Client does sales calls |
| Resumen de reunión | Client has meetings to document |
| Plan de acción semanal | Client wants structured weekly planning |

### Deliverable Format

Each template saved in `outputs/ia-os-clients/[name]/` as:
- `template-propuesta.md`
- `template-email-seguimiento.md`
- etc.

Each template includes:
- Instructions at top (what to fill in)
- The actual template with `[VARIABLES]` for client-specific info
- Example output (completed version)

### Quality Check — Phase 5 Complete When:
- [ ] 3–5 templates built and tested
- [ ] Client used at least 2 templates to produce real outputs
- [ ] Templates linked from context-os.md

---

## Phase 6 — Go-Live & Handoff

**Session 6 | Duration: 60 min | Format: Video call**
**Applies to: All packages (adapted to scope)**

### Objective

The client runs a full Director Workflow independently. You observe and coach. Produce their "Director Manual."

### Session Agenda

**0:00–0:30 — Full solo run**
Client runs their IA OS without guidance:
1. Opens Claude Code session
2. Reads their context-os.md
3. Runs `/ia-os-session review [name]` or appropriate session
4. Produces one real output using a template

You observe. Take notes on gaps or hesitation points.

**0:30–0:50 — Debrief + gap fill**
Review what went well, what was unclear. Fix any gaps in context-os.md or templates.

**0:50–1:00 — Director Manual**
Create `outputs/ia-os-clients/[name]/director-manual.md` — a 1-page summary of:
- Their IA OS stack (what's installed, how it works)
- Their weekly rhythm (when to run each session type)
- How to update context-os.md
- What to do when something breaks

### After Phase 6

- [ ] Director manual written and shared
- [ ] Final context-os.md saved and backed up
- [ ] session-log.md closed with completion note
- [ ] Collect testimonial (written or audio) + case study data points
- [ ] Offer: Director retainer or follow-up session in 30 days

### Quality Check — Phase 6 Complete When:
- [ ] Client ran a full session solo with no help
- [ ] Director manual exists
- [ ] Testimonial collected (or request sent)

---

## Ongoing — Director Retainer

**Applies to: Director package only**
**Cadence: 1 session/month (60 min) + async support**

### Monthly Session Agenda

1. **Data review** (10 min): What happened last month? How do the metrics look?
2. **System health check** (10 min): Are automations running? Is context-os.md current?
3. **New automation sprint** (20 min): Build 1–2 new automations based on current pain
4. **Context OS refresh** (10 min): Update any sections that changed (new offers, new goals, etc.)
5. **Next month priorities** (10 min): Set 3 focal areas for next 30 days

### Async Support Between Sessions

- Respond to questions within 24 hours (business days)
- Help unstick blockers with automations or templates
- Don't build complete new sessions async — save scope for monthly call

### Quality Check — Retainer Active When:
- [ ] Monthly session cadence on calendar
- [ ] Client updating context-os.md independently
- [ ] Client successfully running weekly reviews solo

---

## Troubleshooting Common Issues

| Issue | Fix |
|-------|-----|
| Client stops updating data tracker | Simplify to 1–2 metrics; schedule reminder in their calendar |
| Context OS goes stale | Add quarterly "OS refresh" to their calendar; do it in 30 min |
| Client reverts to manual work | Run Phase 3 again with a different automation; lower friction |
| Client can't remember how to use sessions | Create a 1-page "cheat sheet" with exact commands and when to use each |
| Automation breaks or gives wrong output | Update context-os.md with missing info; re-test |
| Client feels overwhelmed | Slow down — focus on 1 automation at a time; Director mindset takes time |

---

## Notes

- **The 90/10 rule**: 90% of value comes from Context OS + 1 good automation. Don't over-engineer Phase 3.
- **Speed matters**: Ship a v1 of everything. Polish comes from real usage, not perfection upfront.
- **Your best clients are the ones who engage**: If a client stops responding between sessions, check in with a brief message. Low engagement = low results = no testimonial.
- **This workspace IS the demo**: When prospects ask "what does IA OS look like?", show them this workspace. You are the case study.
