# IA OS Session

> **You are operating as a Director.** You give direction — Claude executes. This session runs your IA OS workflow: you bring context and intention, Claude brings analysis, structure, and outputs.

## Variables

mode: $ARGUMENTS (format: `[mode] [client|personal]` — e.g., `review personal`, `onboard acme-corp`, `sprint personal`, `output proposal acme-corp`)

---

## Instructions

Parse the arguments to determine `mode` and `target` (client name or "personal").

- If no arguments provided: default to `mode=review`, `target=personal`
- If only one argument: treat as `mode`, default `target=personal`

**Target resolution:**
- `personal` → use this workspace's own context (`context/` folder)
- `[client-name]` → read `outputs/ia-os-clients/[client-name]/context-os.md`

---

## Mode: ONBOARD

**Trigger:** `/ia-os-session onboard [client-name]`

**Purpose:** Run the first IA OS session with a new client. Build their Context OS from scratch.

### Run

1. **Check for existing intake:**
   - Look for `outputs/ia-os-clients/[client-name]/intake.md`
   - If it exists and is filled: read it fully before proceeding
   - If it doesn't exist or is empty: conduct the intake live (use `reference/ia-os-intake.md` as the guide, ask questions section by section)

2. **Conduct intake (if needed):**
   Ask each section of the intake interactively. After each section, summarize what you heard and confirm before moving on.

3. **Build the Context OS:**
   - Copy structure from `reference/ia-os-context-template.md`
   - Fill in each section using the intake answers
   - Where information is missing, mark with `[PENDIENTE — preguntar al cliente]`
   - Save the result to: `outputs/ia-os-clients/[client-name]/context-os.md`

4. **Produce onboarding summary:**

   Output:
   ```
   ## IA OS Onboarding — [Client Name]
   **Fecha:** [today]

   ### Context OS: Estado Inicial
   ✅ Secciones completadas: [list]
   ⏳ Pendiente de completar: [list]

   ### Diagnóstico Rápido
   Top 3 dolores identificados:
   1. [pain]
   2. [pain]
   3. [pain]

   ### Capa Prioritaria para Empezar
   [Layer name] — porque [reason based on intake]

   ### Primera Automatización Recomendada
   [Specific automation] — estimado de impacto: [hours saved or problem solved]

   ### Paquete Sugerido
   [ ] Starter / [ ] Sistema / [ ] Director — porque [reason]

   ### Próximos Pasos
   - [ ] Completar secciones pendientes del Context OS
   - [ ] [Next specific action]
   - [ ] Agendar Sesión 2: [what it covers]
   ```

5. **Update session log:**
   Append to `outputs/ia-os-clients/[client-name]/session-log.md`:
   ```
   ## Sesión 1 — Onboarding | [date]
   Duración: ~90 min
   Completado: Context OS v1, intake, diagnóstico inicial
   Próximo: [next session focus]
   ```

---

## Mode: REVIEW

**Trigger:** `/ia-os-session review [client|personal]`

**Purpose:** Weekly IA OS review. Synthesize what happened, surface insights, set priorities.

### Run

1. **Load context:**
   - `personal` → read all files in `context/` folder + any metrics from `context/current-data.md`
   - `[client-name]` → read `outputs/ia-os-clients/[client-name]/context-os.md` + their data tracker (if linked in context OS)

2. **Ask for the week's update:**
   Prompt the user:
   > "Antes de la revisión: ¿qué pasó esta semana? Dame un resumen rápido — wins, blockers, decisiones pendientes, y algo que te esté rondando la cabeza."

3. **Receive their input, then produce the Weekly Director Briefing:**

   ```
   ## IA OS — Weekly Director Briefing
   **Semana del:** [date range]
   **Cliente/Perfil:** [name]

   ---

   ### Lo que pasó esta semana
   [Summary of what the user reported — structured, not just repeated]

   ### Análisis de métricas
   [If data is available: compare to targets, flag trends, note gaps]
   [If no data: note what's missing and suggest adding it to the tracker]

   ### 3 Insights Clave
   1. [Observation + implication]
   2. [Observation + implication]
   3. [Observation + implication]

   ### Prioridades para los próximos 7 días
   1. **[Priority 1]** — Por qué ahora: [reason]. Próximo paso concreto: [action]
   2. **[Priority 2]** — Por qué ahora: [reason]. Próximo paso concreto: [action]
   3. **[Priority 3]** — Por qué ahora: [reason]. Próximo paso concreto: [action]

   ### Una Automatización para Evaluar Esta Semana
   **Idea:** [Specific automation]
   **Qué resuelve:** [Pain it eliminates]
   **Esfuerzo estimado:** [Low / Medium / High]
   **Cómo implementarlo:** [Brief how-to or "run /ia-os-session sprint to build this"]

   ### Decisiones Abiertas
   [List any unresolved decisions from the user's update that need a choice]

   ---
   *Director Mode: tu trabajo es decidir y dirigir. Claude ejecuta.*
   ```

4. **Ask if any item needs immediate action:**
   "¿Quieres que trabajemos ahora en alguna de estas prioridades? Si es así, dime cuál y cambiamos a modo Sprint."

---

## Mode: SPRINT

**Trigger:** `/ia-os-session sprint [client|personal]`

**Purpose:** Focused work session. You bring a task or project — Claude executes it fully with your context loaded.

### Run

1. **Load context** (same as Review)

2. **Ask what to work on:**
   > "¿En qué trabajamos hoy? Dame el task o proyecto — sé específico sobre qué quieres al final de esta sesión."

3. **Confirm scope before starting:**
   Restate what you understood and confirm: "Entonces el objetivo de esta sesión es [X]. ¿Correcto?"

4. **Execute the work:**
   - Use the loaded context to produce output that sounds like the client/user
   - Work through the task completely — don't stop at outlines
   - If blocked by missing info, ask one specific question before continuing

5. **Deliver the output in full:**
   - Format clearly (headers, bullets, tables as appropriate)
   - Label it: `## Output: [Task Name] | [date]`

6. **End with:**
   ```
   ### Próximo Paso
   [One clear next action to move this forward]

   ### ¿Actualizar Context OS?
   [If anything new emerged that should be added to their context, flag it]
   Sugerencia: agregar a sección [X] de context-os.md: "[specific info]"
   ```

---

## Mode: OUTPUT

**Trigger:** `/ia-os-session output [type] [client|personal]`

**Supported types:** `proposal`, `sop`, `report`, `email`, `post`, `checklist`, `summary`

**Purpose:** Generate a specific deliverable using the client's context, voice, and templates.

### Run

1. **Load context** (same as Review)

2. **Check for existing template:**
   - Look for `outputs/ia-os-clients/[target]/template-[type].md`
   - If found: use it as the base structure
   - If not found: generate from scratch using context-os.md style and communication preferences

3. **Gather specifics:**
   Ask targeted questions based on type:

   - **proposal**: "¿Para quién es? ¿Cuál es el servicio/paquete? ¿Hay algún punto clave a enfatizar?"
   - **sop**: "¿Para qué proceso? ¿Quién lo ejecuta? ¿Cuántos pasos aproximados?"
   - **report**: "¿De qué período? ¿Para quién es (cliente, equipo, ti mismo)? ¿Qué métricas incluir?"
   - **email**: "¿A quién? ¿Cuál es el objetivo? ¿Hay contexto previo que deba saber?"
   - **post**: "¿Para qué plataforma? ¿Cuál es la idea central o historia? ¿CTA?"
   - **checklist**: "¿Para qué proceso o evento? ¿Quién lo usa?"
   - **summary**: "¿Resumen de qué? (reunión, documento, período). ¿Para quién?"

4. **Generate the full output** — not a stub, not an outline. The actual deliverable, ready to review and send.

5. **End with:**
   ```
   ### Para usar este output
   - Revisa [specific section] antes de enviar
   - Reemplaza [VARIABLE] con [what it needs]
   - [Any other specific instruction]

   ### ¿Guardar como template?
   Si quieres reusar este formato, puedo guardarlo como template en outputs/ia-os-clients/[target]/template-[type].md
   ```

---

## Notes for All Modes

- **Always read context first, then act.** Don't produce generic outputs.
- **Match the client's voice.** Use Section 8 (Estilo de Comunicación) of their context-os.md as the style guide.
- **Respect restrictions.** Check Section 9 (Qué NO Hacer) before producing any output.
- **Update session log after every session.** Append to `outputs/ia-os-clients/[name]/session-log.md`.
- **If context-os.md is missing or empty:** Stop and run `onboard` mode first. Don't produce outputs without context.

---

## Reference Files

- Service overview: `reference/ia-os-director-framework.md`
- Client intake: `reference/ia-os-intake.md`
- Delivery SOP: `reference/ia-os-delivery-sop.md`
- Context template: `reference/ia-os-context-template.md`
- Client files: `outputs/ia-os-clients/[client-name]/`
