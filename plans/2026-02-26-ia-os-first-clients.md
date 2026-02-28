# Plan: IA OS Director Framework — First Client Acquisition

**Created:** 2026-02-26
**Status:** Implemented
**Request:** Build the acquisition infrastructure to get the first 1–3 clients for the IA OS Director Framework service.

---

## Overview

### What This Plan Accomplishes

This plan builds the outreach assets, prospect pipeline, and LinkedIn content playbook needed to sign the first 3 clients for the IA OS Director Framework — the "director vs. operator" personal AI OS service. It covers three acquisition channels in priority order: personal network (fastest), LinkedIn (warm, scalable), and WhatsApp communities (secondary warm). All materials are written and ready to use within the same session as implementation.

### Why This Matters

The IA OS Director Framework service now has a complete delivery system but zero acquisition infrastructure. The existing SolIA outreach machine (Google Maps → cold call) targets completely different buyers — local service businesses, not solopreneurs and overwhelmed professionals. Without scripts, a pipeline, and content, the service will sit unused. This plan gives a clear weekly routine and ready-to-send messages so outreach can start immediately after implementation.

---

## Current State

### Relevant Existing Structure

- `reference/outreach-scripts.md` — SolIA-specific scripts (cold call B2B, voice agent pitch) — wrong product, wrong buyer, cannot reuse as-is
- `context/lead-generation.md` — SolIA lead gen strategy (Google Maps, 5 leads/week, dentists/clinics/real estate) — no mention of IA OS Director
- `outputs/leads/outreach-tracker.json` — SolIA pipeline tracker; separate from IA OS
- `reference/ia-os-director-framework.md` — the service doc (from previous plan) — exists but has no accompanying outreach materials
- `reference/ia-os-intake.md` — client intake questionnaire (exists) — already serves as the "diagnostic" the outreach invites people to
- `.claude/commands/weekly-leads.md` — SolIA weekly review command — IA OS has no equivalent routine

### Gaps or Problems Being Addressed

1. **No ICP definition** for IA OS Director buyer — who exactly to target, what pain signals to look for, where they live online
2. **No outreach scripts** for this offer — can't reach out without messaging
3. **No pipeline tracker** — no way to track IA OS prospects separately from SolIA
4. **No LinkedIn content** — the primary warm channel for this offer has no content strategy or templates
5. **No weekly routine** — nothing telling you what to do each week to progress IA OS acquisition
6. **No personal network activation** — the fastest path to first clients (people you already know) isn't addressed anywhere

---

## Proposed Changes

### Summary of Changes

- Define the IA OS Director ICP and add it to `context/lead-generation.md`
- Create outreach scripts for all three channels: personal network WhatsApp, LinkedIn DM, WhatsApp community, follow-up, diagnostic invitation
- Create LinkedIn content playbook: post formats, 5 ready-to-post examples, DM sequence, profile positioning
- Create a simple Markdown pipeline tracker for IA OS prospects
- Define a weekly IA OS acquisition routine

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `reference/ia-os-outreach-scripts.md` | All outreach messages for IA OS Director: personal network opener, LinkedIn DM, WhatsApp community DM, diagnostic invitation, follow-up, objection responses |
| `reference/ia-os-linkedin-content.md` | LinkedIn content playbook: post format templates, 5 ready-to-use posts about director/operator concept, DM follow-up sequence, profile positioning tips |
| `outputs/ia-os-clients/prospects.md` | Lightweight pipeline tracker for IA OS prospects (name, contact, channel, status, next action, notes) |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `context/lead-generation.md` | Add "IA OS Director Framework" section at the bottom: ICP, acquisition channels, qualification criteria, weekly routine — parallel to existing SolIA section |
| `CLAUDE.md` | Add `ia-os-outreach-scripts.md` and `ia-os-linkedin-content.md` to reference/ listing |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Personal network first, not cold outreach**: For a new productized service without case studies or testimonials, cold outreach has low conversion. People who already know and trust you are 5–10x more likely to say yes. The plan starts there.

2. **LinkedIn as the primary warm channel (not Google Maps)**: IA OS Director buyers — solopreneurs, consultants, managers — are on LinkedIn, not on Google Maps. The existing cold-call infrastructure doesn't apply. LinkedIn content + DMs is the right channel.

3. **Simple Markdown pipeline tracker, not extending outreach-tracker.json**: The SolIA pipeline tracker is tied to a specific JSON schema and scripts. Adding IA OS prospects to it would create confusion. A simple `prospects.md` is faster to update and easier to review during sessions.

4. **Scripts in a dedicated file, not merged into `outreach-scripts.md`**: The existing `outreach-scripts.md` is tight, B2B-focused, and tuned for cold calls. IA OS scripts have a completely different tone (personal, peer-to-peer) and audience. Merging would make both worse.

5. **5 LinkedIn posts pre-written, not just templates**: Templates are often not used because they require too much creative work at the moment of posting. Pre-written, ready-to-post content removes that friction.

6. **Weekly routine added to `lead-generation.md`**: This is where the existing SolIA routine lives, so adding an IA OS routine there maintains consistency and keeps all acquisition context in one file.

### Alternatives Considered

- **New `/ia-os-weekly` command**: Considered, but the command overhead is not justified before there's a consistent pipeline to review. Add the command after the first 2–3 clients are in motion.
- **Cold LinkedIn outreach without content**: Rejected — cold DMs without content credibility get ignored. At least 1–2 posts need to go out before or alongside DMs.
- **Extending SolIA outreach tracker**: Rejected — different schema, different scripts, different buyer. Separation keeps both clean.

### Open Questions (if any)

- **LinkedIn profile**: Is the LinkedIn profile already positioned around AI consulting / AI OS? If not, the content plan will note specific profile updates needed — but those are done manually by the user, not created as workspace files.
- **Personal network size**: The plan assumes 10+ professional contacts who could fit the ICP. If the network is smaller, the personal network sprint can be shorter.

---

## Step-by-Step Tasks

Execute these tasks in order during implementation.

---

### Step 1: Update `context/lead-generation.md` — Add IA OS Director ICP and acquisition strategy

**What to do:** Add a second major section to `lead-generation.md` covering the IA OS Director buyer. Keep the SolIA section intact. The new section defines who to target, where to find them, how to qualify them, and what the weekly routine looks like.

**Actions:**

- Append at the bottom of `context/lead-generation.md` a clear section break, then the full "IA OS Director Framework — Lead Generation" section
- Include:
  - **ICP**: Solopreneurs, consultants, coaches, freelancers, and small business managers (not the business itself — the person running it). They have 3+ years of experience, feel overwhelmed by operational work, already use some digital tools, and are open to paying for systems that work. Budget signals: they invest in their own professional development (courses, books, tools).
  - **Pain signals to listen for**: "no tengo tiempo," "siempre estoy apagando incendios," "sé que debería hacer X pero nunca llego," "me cuesta delegar," "uso IA a veces pero no sistemáticamente"
  - **Where to find them**: LinkedIn (primary), WhatsApp entrepreneur communities, referrals from SolIA clients, personal network
  - **Qualification criteria**: They are the decision-maker for their own work (always yes), they feel the "operator trap" (have the pain), they're open to a 30-min diagnostic call
  - **Weekly targets**: 3 meaningful conversations/week → 1 diagnostic call → 1 proposal every 2 weeks
  - **Weekly routine table** (Mon–Fri)

**Files affected:**

- `context/lead-generation.md`

---

### Step 2: Create `reference/ia-os-outreach-scripts.md`

**What to do:** Write the full outreach script library for the IA OS Director offer. Three channels: personal network (WhatsApp), LinkedIn, WhatsApp communities. Plus follow-up messages, the diagnostic invitation, and objection responses. Tone is peer-to-peer and personal — not cold B2B sales.

**Actions:**

- Create `reference/ia-os-outreach-scripts.md`
- Include all of the following sections:

**Section 1 — Personal Network Sprint (WhatsApp)**
The fastest path to first clients. Send to 10 people you already know who might be the ICP. This is NOT a pitch — it's a personal question.

```
Script A — Direct ask (best for close contacts):
"Oye [Nombre], tengo algo nuevo que estoy lanzando y creo que podría ser justo lo que necesitas. Estoy ayudando a profesionales y solopreneurs a instalar un sistema de IA personalizado para que dejen de estar en lo operativo y empiecen a dirigir desde afuera. ¿Tienes 30 min esta semana para que te cuente? No te voy a vender nada en la llamada — es un diagnóstico gratuito."

Script B — Softer ask (for contacts you're less close with):
"[Nombre], ¿cómo vas? Tengo una pregunta rápida: ¿sientes que el trabajo te controla más de lo que tú lo controlas? Estoy lanzando algo que creo que encaja con eso y me gustaría contarte. ¿Te parece si hablamos 20 minutos esta semana?"

Script C — Info-first approach (for people who prefer context before committing):
"[Nombre], te mando esto porque creo que te puede interesar. Estoy lanzando un servicio donde instalo un sistema de IA personalizado para profesionales que sienten que están operando en vez de dirigiendo. Le llamo IA OS — básicamente es una capa de inteligencia sobre cómo trabajas que te devuelve tiempo y claridad. ¿Lo reviso contigo en una llamada corta?"
```

**Section 2 — LinkedIn DM Sequence**
For people who engage with your posts (liked, commented, shared) or whom you identify as matching the ICP.

```
Mensaje 1 — Opener después de interacción:
"[Nombre], vi que reaccionaste a mi post sobre [tema]. Curioso — ¿sientes ese tema en tu propio trabajo? Te pregunto porque estoy haciendo diagnósticos gratis esta semana para ver si lo que hago encaja con alguien en esa situación."

Mensaje 1B — Opener cold (sin interacción previa, perfil claramente encaja):
"[Nombre], vi tu perfil y me llamó la atención tu trabajo en [área]. Tengo una pregunta directa: ¿cuánto de tu semana se va en tareas operativas que sientes que 'alguien más debería hacer'? Estoy ayudando a profesionales como tú a resolver exactamente eso con IA. ¿Hablamos 20 minutos?"

Mensaje 2 — Follow-up si no responde (3–4 días después):
"[Nombre], solo para seguir en contacto — dejé un mensaje hace unos días. No pasa nada si no es el momento. Si en algún momento sientes que la operación te come el tiempo estratégico, estaré por acá."

Mensaje 3 — Cierre suave (si tampoco responde):
"[Nombre], último mensaje para no molestar. Si alguna vez quieres explorar cómo instalar IA en tu forma de trabajar de forma personalizada, avísame. ¡Mucho éxito con [su trabajo]!"
```

**Section 3 — WhatsApp Community Opener**
For people in entrepreneur/professional groups where you've already been active.

```
DM después de interacción en el grupo:
"[Nombre], vi tu mensaje en [nombre del grupo] sobre [tema]. Me identifiqué mucho. Justamente estoy trabajando con personas en esa situación — solopreneurs y profesionales que sienten que la operación los tiene atrapados. ¿Te interesaría que te contara en 20 minutos qué hago al respecto? No es una venta — es un diagnóstico para ver si encaja."

Mensaje sin interacción previa (solo si llevas tiempo activo en el grupo):
"Hola [Nombre], llevo un tiempo en el grupo y vi que trabajas en [área]. Tengo una pregunta: ¿cómo manejas el balance entre lo estratégico y lo operativo en tu trabajo? Estoy lanzando algo relacionado con eso y me gustaría tu perspectiva."
```

**Section 4 — Diagnostic Invitation (to send post-opener, when they say they're interested)**

```
"Perfecto. El diagnóstico es una llamada de 30 minutos donde:
1. Me cuentas cómo trabajas hoy (qué se te va el tiempo, qué herramientas usas, cuál es tu mayor dolor operativo)
2. Yo analizo si tu caso encaja con lo que hago y cómo
3. Al final, te doy un plan concreto de qué instalaría primero — sea o no sea con mi ayuda

No hay compromiso de nada. ¿Cuándo tienes 30 minutos esta semana? [adjunta link de Calendly o propón 2 horarios]"
```

**Section 5 — Follow-Up After Diagnostic (if they go quiet post-call)**

```
2 días después:
"[Nombre], ¿tuviste oportunidad de revisar lo que hablamos? Si tienes preguntas o quieres que profundice en algo, dime."

5 días después:
"[Nombre], solo para seguir — sé que estas cosas a veces quedan en pausa. Si el momento no es este, sin problema. Si en algún punto quieres retomar, avísame."

10 días después (cierre):
"[Nombre], último seguimiento de mi parte. Si en algún momento quieres instalar tu IA OS, estaré por acá. ¡Mucho éxito!"
```

**Section 6 — Objection Responses**

```
"¿En qué consiste exactamente?"
→ "Es básicamente instalar un sistema de IA personalizado para tu forma de trabajar. En lugar de usar ChatGPT de forma aleatoria, construimos una capa inteligente que conoce tu negocio, tus procesos, y tus metas — y produce resultados útiles cuando le das una instrucción. En la llamada de diagnóstico te muestro exactamente cómo funciona para alguien en tu situación."

"¿Cuánto cuesta?"
→ "Depende del nivel de implementación. El punto de entrada es desde $250 USD — es un setup de una semana donde construimos tu base de conocimiento y un primer flujo automatizado. Hay opciones más completas para quienes quieren las 5 capas funcionando. En la llamada de diagnóstico sabrás exactamente qué encajaría para ti."

"Ahora no tengo tiempo"
→ "Lo entiendo — y es justamente la paradoja: los que más necesitan esto son los que menos tiempo sienten que tienen. No te quiero quitar más tiempo del que te voy a devolver. Son 30 minutos que, si encaja, te van a devolver horas cada semana."

"Ya uso ChatGPT / ya uso IA"
→ "Perfecto, ya tienes la base. Lo que hago es diferente: no es usar la IA de vez en cuando — es instalar un sistema que conoce tu contexto específico, tiene tus procesos documentados, y produce outputs con tu voz cada vez que le das una instrucción. Es pasar de usuario a director. ¿Te interesa ver la diferencia en la llamada?"

"¿Puedes mandarme más información?"
→ "Claro, te mando algo corto. [Envía reference/ia-os-director-framework.md o un resumen de 3 párrafos]. Pero te aviso que el sistema funciona mucho mejor viéndolo en acción. Son 30 minutos — ¿cuándo tienes?"
```

**Section 7 — Personal Network Sprint: The 10-Person List**
Include a blank table for the user to fill before running the sprint:

```
| Nombre | Contacto (WA/LI) | ¿Por qué encaja? | Script a usar | Enviado | Respuesta | Estado |
|--------|-----------------|-----------------|---------------|---------|-----------|--------|
| | | | | | | |
```

And guidance on who to put there:
- Former colleagues who run their own thing now
- Clients (from SolIA or other work) who seem overwhelmed
- Peers in entrepreneur communities you know personally
- People who've mentioned "no tengo tiempo" or "estoy desbordado" in the last 3 months
- Anyone who's asked you about AI or showed curiosity about your work

**Files affected:**

- `reference/ia-os-outreach-scripts.md` (create)

---

### Step 3: Create `reference/ia-os-linkedin-content.md`

**What to do:** Write a LinkedIn content playbook specifically for the IA OS Director Framework offer. Include profile positioning notes, 5 ready-to-post posts, post format templates, and the DM sequence (cross-referenced from outreach scripts).

**Actions:**

- Create `reference/ia-os-linkedin-content.md`
- Include:

**Section 1 — Profile Positioning (1 paragraph)**
What the LinkedIn headline and About section should communicate to attract the IA OS buyer. Note: user implements these changes manually.

```
Headline example:
"Instalo IA OS para que dejes de operar y empieces a dirigir | AI Transformation Consultant"

About section key points to hit:
- Who you help (solopreneurs, consultants, small business owners overwhelmed by operations)
- The transformation promise (director vs. operator)
- One concrete result or process (e.g., "en 90 días tienes un sistema que corre contigo")
- CTA: diagnóstico gratuito de 30 minutos
```

**Section 2 — Content Strategy (brief)**
- Post 2x per week: Tues + Thurs
- Rotate through 4 post types (see below)
- Always end with a question or soft CTA ("¿Te identificas? DM abierto")
- No heavy selling — build the "director mindset" as a concept, let it attract

**Section 3 — 4 Post Format Templates**
Each template: structure description + example hook + body pattern

Template A — "The Operator Trap" (story format)
Template B — "Before / After Director" (contrast format)
Template C — "One thing I noticed" (insight format)
Template D — "Here's how it works" (education format, how the IA OS layers work simply explained)

**Section 4 — 5 Ready-to-Post LinkedIn Posts**
Full text, ready to copy-paste. Topics:
1. "El lunes del operador vs. el lunes del director" (contrast story — their most relatable pain)
2. "¿Cuántas horas a la semana le das a tareas que 'alguien más debería hacer'?" (engagement question)
3. "Le pregunté a un cliente qué le quitaba más tiempo. Me dijo 3 cosas. Las 3 se automatizan en una tarde." (insight + credibility)
4. "Esto es lo que cambia cuando tu IA te conoce de verdad" (education — what context OS enables)
5. "Instalé mi propio IA OS hace [X tiempo]. Esto es lo que cambió." (personal story — using your own workspace as the demo)

**Section 5 — Weekly Content Rhythm**
Simple table: what to post when, how to engage with comments, when to DM people who react.

**Files affected:**

- `reference/ia-os-linkedin-content.md` (create)

---

### Step 4: Create `outputs/ia-os-clients/prospects.md`

**What to do:** Create a simple pipeline tracker for IA OS prospects. Markdown table format — easy to update during sessions, easy to review in `/ia-os-session review`. Separate from SolIA's `outreach-tracker.json`.

**Actions:**

- Create `outputs/ia-os-clients/prospects.md`
- Include:
  - Header with date and current pipeline summary
  - Status definitions: `Identified → Contacted → Responded → Diagnostic Scheduled → Diagnostic Done → Proposal Sent → Closed Won → Closed Lost`
  - Main prospect table with columns: Name, Channel (WA/LI/Community/Referral), Status, Last Contact, Next Action, Notes
  - Start with 5 blank rows (to be filled during personal network sprint)
  - Weekly metrics section: contacts made, responses, diagnostics done, proposals sent, closes
  - Note at top: "Update this before every `/ia-os-session review` so Claude can track pipeline"

**Files affected:**

- `outputs/ia-os-clients/prospects.md` (create)

---

### Step 5: Update `context/lead-generation.md`

**What to do:** Append the IA OS Director Framework acquisition strategy to the existing lead-generation context file. Keep the SolIA section fully intact — add a clean section break and a new parallel section.

**Actions:**

- Read the current file end (already done in research)
- Append after the final `---` line:

```
---

## IA OS Director Framework — Lead Generation

[Full new section — ICP, channels, weekly routine, qualification criteria, pipeline targets]
```

Content specifics for the new section:

**ICP — IA OS Director Buyer:**
- Who: Solopreneurs, consultants, coaches, freelancers, managers running small operations (1–5 people)
- Situation: They have 3+ years experience; they're good at their craft but drowning in operational work
- Pain: Feels like they're always in "execution mode" — can't find time for strategy, vision, or rest
- Tools: Uses some combination of WhatsApp, Drive, and/or Notion — not fully systematized
- AI maturity: Tried ChatGPT occasionally, sees the potential, but hasn't built a consistent workflow
- Budget signal: Pays for tools, courses, or subscriptions without too much friction; invests in their own productivity
- NOT: A business that needs external-facing automation (that's SolIA); a corporate employee with no autonomy over their tools

**Pain signals to listen for:**
- "No tengo tiempo" / "Estoy siempre apagando incendios"
- "Debería hacer X pero nunca llego"
- "Uso ChatGPT a veces pero no de forma consistente"
- "Me cuesta delegar / no confío en que salga bien"
- "Sé lo que tengo que hacer pero no llego a hacerlo"

**Where they are:**
- LinkedIn (primary): consultants, coaches, freelancers, founders post regularly here
- WhatsApp entrepreneur communities: active in LatAm business/startup groups
- Personal network: people you already know who match the profile
- Referrals: existing SolIA clients often know someone who fits the profile

**Qualification criteria:**
- They are the sole decision-maker for their own workflow (always yes)
- They feel the "operator trap" — too much execution, not enough direction
- Open to a 30-min diagnostic call
- Can afford $250–900 USD for implementation

**Weekly routine (IA OS acquisition):**

| Day | Task |
| --- | ---- |
| Monday | Review prospects.md. Identify who needs follow-up. Identify 3 new people to contact (personal network or LinkedIn). |
| Tuesday | Send 3 openers (WhatsApp or LinkedIn DM). Post to LinkedIn. |
| Wednesday | Follow up on any responses. Engage with LinkedIn comments. DM anyone who engaged with the post. |
| Thursday | Post to LinkedIn. Confirm any diagnostic calls scheduled this week. |
| Friday | Update prospects.md with all activity. Review weekly metrics (contacts, responses, diagnostics, closes). |

**Weekly targets:**
- 3 new contacts/week
- 1 diagnostic call/week (after week 2 of consistent outreach)
- 1 proposal/month initially
- First client: within 3–4 weeks of starting

**Files affected:**

- `context/lead-generation.md`

---

### Step 6: Update `CLAUDE.md`

**What to do:** Add the two new reference files to the `reference/` listing in the Workspace Structure section.

**Actions:**

- In the Workspace Structure section, the `reference/` bullet or description does not list individual files currently — just update the description to note that IA OS acquisition and LinkedIn content reference files now exist there

**Files affected:**

- `CLAUDE.md`

---

## Connections & Dependencies

### Files That Reference This Area

- `reference/ia-os-director-framework.md` — the service doc; outreach scripts reference it for the "send more info" response
- `reference/ia-os-intake.md` — the diagnostic questionnaire; outreach scripts reference it as what the diagnostic call follows
- `outputs/ia-os-clients/prospects.md` — new file; `/ia-os-session review` should prompt user to check it during weekly reviews
- `context/lead-generation.md` — updated; `/weekly-leads` still runs SolIA section; there's currently no equivalent command for IA OS

### Updates Needed for Consistency

- After first clients are signed, update `context/current-data.md` to add IA OS acquisition metrics alongside SolIA metrics
- When 3+ clients are in pipeline, consider adding `/ia-os-weekly` command (out of scope for this plan)

### Impact on Existing Workflows

- SolIA outreach is completely unaffected — this plan adds parallel infrastructure, never modifies existing
- `/weekly-leads` and `/outreach-leads` commands still work exactly as before
- `/ia-os-session review` now has a prospects tracker to reference during personal reviews

---

## Validation Checklist

- [ ] `reference/ia-os-outreach-scripts.md` exists with all 7 sections (personal network A/B/C, LinkedIn DM sequence, community opener, diagnostic invitation, follow-up sequence, objections, 10-person list table)
- [ ] `reference/ia-os-linkedin-content.md` exists with profile notes, 4 post format templates, 5 complete ready-to-post posts, weekly content rhythm
- [ ] `outputs/ia-os-clients/prospects.md` exists with status definitions, tracker table, and weekly metrics section
- [ ] `context/lead-generation.md` has a new IA OS section with ICP, pain signals, channels, qualification criteria, weekly routine, and weekly targets
- [ ] `CLAUDE.md` reflects the new reference files
- [ ] All scripts are in Spanish (or bilingual where noted)
- [ ] The 10-person list table in outreach scripts is blank (user fills it in)

---

## Success Criteria

The implementation is complete when:

1. You can open `reference/ia-os-outreach-scripts.md` and send a first message to 10 people from your personal network without writing anything from scratch — just fill in names and choose the script
2. You can copy-paste any of the 5 LinkedIn posts from `reference/ia-os-linkedin-content.md` directly into LinkedIn with zero editing
3. `outputs/ia-os-clients/prospects.md` is ready to track the first 10 contacts and their status through the pipeline
4. During a `/ia-os-session review personal` session, Claude can see prospects.md and give you a pipeline status update alongside your weekly review

---

## Notes

- **Fastest path to first client**: Personal network sprint (Script A to 5 close contacts, same day as implementation). Don't wait for LinkedIn content to get traction first.
- **The meta-pitch for personal network**: You ARE the case study. Show them this workspace. The best demo of the IA OS Director Framework is watching how you use Claude Code to direct rather than operate. If you can show someone your Monday briefing or how Claude helped you produce a proposal in 5 minutes, you've sold it.
- **LinkedIn credibility before cold DMs**: Post at least 2 times before sending LinkedIn DMs to cold connections. The DM will land better if they can see you have a point of view.
- **Pilot pricing**: For the first 1–2 clients, consider offering a "founding client" discount (e.g., Starter at $150 instead of $250) in exchange for a testimonial and case study. Speed of first client matters more than margin at this stage.
- **IA OS Director vs. SolIA**: These are separate offers with separate pipelines. Don't confuse leads. A SolIA client might need IA OS too (for themselves, not their business) — but pitch them separately.
- **Future command**: Once there are 3+ IA OS prospects in the pipeline, build `/ia-os-weekly` — a parallel to `/weekly-leads` for this offer's pipeline. That's out of scope now.

---

## Implementation Notes

**Implemented:** 2026-02-26

### Summary

- Updated `context/lead-generation.md` — appended full "IA OS Director Framework — Lead Generation" section with ICP definition, pain signals table, 4 acquisition channels (personal network, LinkedIn, WhatsApp communities, referrals), qualification criteria, weekly Mon–Fri routine, and tracking references
- Created `reference/ia-os-outreach-scripts.md` — 10-person prospect table, 4 WhatsApp personal network scripts (A/B/C/D), full LinkedIn 3-message DM sequence, WhatsApp community opener (2 variants), diagnostic invitation, 3-message post-diagnostic follow-up, 7 objection responses, usage notes
- Created `reference/ia-os-linkedin-content.md` — profile positioning notes + example headlines + About section guidance, content strategy rules, 4 post format templates with structure guides, 5 complete ready-to-post LinkedIn posts, weekly content rhythm table with DM conversion guidance
- Created `outputs/ia-os-clients/prospects.md` — pipeline status summary table, status definitions, 10-row prospect tracker with canal codes, diagnostics log, weekly metrics tracker, free-text notes section, and reference links
- Updated `CLAUDE.md` — added `prospects.md` to `ia-os-clients/` tree, added all 6 IA OS reference files to the `reference/` tree, updated `outputs/` and `reference/` key directory descriptions

### Deviations from Plan

- Added a 4th WhatsApp script (Script D — Referral ask) not explicitly in the plan but clearly useful for the referral channel and consistent with the plan's intent
- Added a 7th objection response ("No soy tan tecnológico") — common objection for this offer, not in the original list but critical to have
- `CLAUDE.md` update listed all 6 individual IA OS reference files in the tree view rather than just a general mention — more useful for session orientation

### Issues Encountered

None.
