# Plan: Mini-Diagnóstico para Implementar IA OS

**Created:** 2026-02-25
**Status:** Implemented
**Request:** Create a markdown document — "Mini-Diagnóstico para Implementar IA OS" — a short, conversational diagnostic tool for evaluating a business's readiness and fit for AI OS / SolIA implementation.

---

## Overview

### What This Plan Accomplishes

Creates a reusable Spanish-language diagnostic document (`reference/mini-diagnostico-ia-os.md`) that Esteban can use during or before a discovery call to quickly assess a prospect's current pain points, tech readiness, and which AI OS components would deliver the most value for them. The document serves two modes: self-assessment (sent to the prospect beforehand) and call guide (Esteban works through it live with the prospect).

### Why This Matters

The current discovery process is unstructured — there's no standard set of questions for qualifying a lead beyond the cold call opener. A mini-diagnóstico solves this by giving every discovery conversation a repeatable shape: ask the right questions, map answers to AI OS components, and arrive at a confident recommendation. It also serves as a leave-behind that helps prospects self-qualify before a demo, saving Esteban time and increasing demo quality. This directly supports the Q1 strategic priority: "Productize the core offer with a repeatable delivery system."

---

## Current State

### Relevant Existing Structure

```
reference/
  outreach-scripts.md         # Cold call + WhatsApp scripts (pre-discovery)
  google-maps-prospecting.md  # Prospecting qualification signals
  gmap-search-params.md       # ICP signals (review count, has phone, etc.)
  whatsapp-automation-setup.md

solia.md                       # SolIA product definition + onboarding inputs
context/business-info.md       # AI OS core offers and delivery model
context/lead-generation.md     # ICP definition and qualification criteria
```

### Gaps or Problems Being Addressed

- **No structured discovery tool**: After a cold call converts to "interested", there's no standard framework for the next conversation. The diagnostic fills this gap.
- **No self-assessment option**: Prospects can't pre-qualify themselves or prepare before a demo call. This increases no-show rates and reduces demo quality.
- **No offer-mapping artifact**: There's nothing that maps a prospect's specific pain signals to specific AI OS components. The diagnóstico creates this mapping explicitly, making recommendations defensible.
- **Gap between prospecting and implementation**: The workspace has outreach scripts (top of funnel) and SolIA onboarding inputs (post-sale), but nothing in between for the discovery/qualification stage.

---

## Proposed Changes

### Summary of Changes

- **New file**: `reference/mini-diagnostico-ia-os.md` — the complete diagnostic document in Spanish, dual-mode (call guide + self-assessment), with scoring and offer mapping

### New Files to Create

| File Path | Purpose |
|---|---|
| `reference/mini-diagnostico-ia-os.md` | Mini-diagnóstico template: 8 diagnostic questions, scoring guide, AI OS component mapping, and recommended next steps |

### Files to Modify

None — this is a standalone addition.

---

## Design Decisions

### Key Decisions Made

1. **Spanish throughout**: The target audience is Chilean business owners. The document should be 100% Spanish — questions, labels, scoring, and recommendations. Only the file name uses a mix for workspace consistency.

2. **Dual-mode design**: The document is structured so it works both as a WhatsApp/email pre-send to the prospect ("fill this out before we talk") AND as a script Esteban reads live. A single document serves both purposes by phrasing questions conversationally.

3. **8 questions, not more**: The "mini" in mini-diagnóstico is intentional. 8 questions can be covered in 5–8 minutes in a call or 3 minutes of self-filling. More than 10 kills completion rates and overwhelms non-technical business owners.

4. **Scoring system**: Each answer gets a point value. The total score maps to a recommended AI OS starting point (Voice Agent Only, Voice + WhatsApp, Full AI OS Setup). This gives Esteban an objective basis for the recommendation.

5. **Pain-to-component mapping table**: After the questions, include an explicit table mapping each pain signal to the AI OS component that addresses it. This is the artifact Esteban references when closing — "based on what you told me, here's exactly what we'd build."

6. **Placed in `reference/`**: This is a reusable template, not a one-time output. It belongs alongside `outreach-scripts.md` and `google-maps-prospecting.md` as a sales/delivery reference.

7. **No pricing in the document**: Pricing is handled in the proposal, not the diagnostic. The diagnóstico ends with a call-to-action toward a demo/proposal, not a price quote.

### Alternatives Considered

- **Google Form / Typeform**: More polished for self-assessment, but adds friction (another tool, account required). A Markdown document that can be pasted into WhatsApp, a Google Doc, or a Notion page is more flexible for the current stage.
- **Put in `outputs/` as a deliverable**: Rejected — this is a reusable template, not a one-time output. `reference/` is correct.
- **Full onboarding questionnaire**: Rejected — the SolIA onboarding inputs in `solia.md` already cover post-sale discovery. This is for pre-sale qualification, so shorter and more focused on pain/fit.

### Open Questions

None — all decisions can be made by the implementer based on workspace context.

---

## Step-by-Step Tasks

### Step 1: Create `reference/mini-diagnostico-ia-os.md`

Write the complete diagnostic document. The file must contain all sections below. Content should be polished, ready to send to a prospect as-is.

**Document structure and full content spec:**

---

**Header section:**
- Title: `# Mini-Diagnóstico: ¿Está tu negocio listo para IA OS?`
- Tagline: A brief intro paragraph (2–3 sentences) explaining what this is and how long it takes, written in a warm, direct tone. E.g.: "Este diagnóstico toma menos de 5 minutos y te ayuda a entender exactamente qué parte del sistema de IA le daría más valor a tu negocio hoy. No necesitas saber de tecnología — solo responde basándote en cómo funciona tu negocio ahora."
- Instructions note for two modes: "Para usar en llamada de descubrimiento" vs "Para enviar al prospecto"

---

**Section 1: Comunicación y llamadas** (3 questions)
Maps to: SolIA Voice Agent

Q1. ¿Cuántas llamadas reciben aproximadamente por semana?
- [ ] Menos de 10
- [ ] 10–30
- [ ] 30–60
- [ ] Más de 60

Q2. ¿Qué pasa con las llamadas cuando el equipo está ocupado o el negocio está cerrado?
- [ ] Siempre hay alguien disponible para contestar
- [ ] Algunas se pierden, pero no es un problema grave
- [ ] Perdemos bastantes llamadas, especialmente fuera de horario
- [ ] Perdemos muchas — es un problema serio

Q3. ¿Cuánto tiempo tarda tu equipo en responder consultas o mensajes de nuevos clientes?
- [ ] Menos de 1 hora
- [ ] 1–4 horas
- [ ] Más de 4 horas / al día siguiente
- [ ] No hay un proceso definido — varía mucho

---

**Section 2: Captura y seguimiento de leads** (2 questions)
Maps to: Lead capture + CRM routing / WhatsApp automation

Q4. ¿Cómo registran y hacen seguimiento de los clientes potenciales que contactan su negocio?
- [ ] Usamos un CRM o sistema estructurado
- [ ] Hojas de cálculo / notas informales
- [ ] Depende de quién atiende — no hay sistema fijo
- [ ] No los registramos formalmente

Q5. ¿Con qué frecuencia hacen seguimiento a prospectos que no contrataron en el primer contacto?
- [ ] Siempre — tenemos un proceso definido
- [ ] A veces, cuando hay tiempo
- [ ] Raramente
- [ ] Casi nunca

---

**Section 3: Tareas repetitivas y carga operativa** (2 questions)
Maps to: Knowledge base / FAQ automation / workflow automation

Q6. ¿Cuántas de las consultas que reciben son preguntas repetitivas (precios, horarios, servicios, ubicación)?
- [ ] Menos del 20% — la mayoría son consultas únicas
- [ ] 20–50% — hay bastante repetición
- [ ] 50–80% — la mayoría son las mismas preguntas
- [ ] Más del 80% — casi todo es lo mismo

Q7. ¿Qué tareas administrativas le quitan más tiempo a tu equipo hoy?
- [ ] Agendar citas / coordinar disponibilidad
- [ ] Responder preguntas básicas de clientes
- [ ] Registrar y actualizar datos de clientes
- [ ] Preparar presupuestos / propuestas
- [ ] Otro: _______________

---

**Section 4: Madurez digital** (1 question)
Maps to: Integration complexity / go-live speed

Q8. ¿Qué herramientas digitales usa tu negocio actualmente?
- [ ] Solo teléfono y WhatsApp — nada más
- [ ] WhatsApp + alguna planilla de Google / Excel
- [ ] Usamos un CRM o software de gestión básico
- [ ] Tenemos varias herramientas integradas (CRM, calendario, facturación, etc.)

---

**Scoring section:**
Title: `## Cómo Interpretar tus Respuestas`

Scoring guide (simple point system for Esteban to use during the call):

| Área | Señal de alta prioridad | Componente IA OS recomendado |
|---|---|---|
| Pierden llamadas / no hay cobertura 24/7 | Q2 = opción 3 o 4 | **SolIA Voice Agent** — prioridad inmediata |
| Tiempo de respuesta > 4 horas | Q3 = opción 3 o 4 | **SolIA Voice Agent + WhatsApp automation** |
| Sin sistema de registro de leads | Q4 = opción 3 o 4 | **Lead capture + routing (Sheet/CRM)** |
| Sin seguimiento a prospectos | Q5 = opción 3 o 4 | **Secuencia de follow-up automatizada** |
| Más del 50% de consultas repetitivas | Q6 = opción 3 o 4 | **Knowledge base + FAQ automation** |
| Alto volumen de llamadas (30+/semana) | Q1 = opción 3 o 4 | **SolIA Voice Agent (urgente)** |

**Perfil recomendado** (3 tiers based on answer patterns):

**🟢 Perfil: Empezar con Voice Agent**
- Pierden llamadas
- Pocas herramientas actuales
- Volumen medio-alto de llamadas
→ Recomendación: SolIA Voice Agent como primer paso. Setup en 1–2 semanas. ROI visible en 30 días.

**🟡 Perfil: Voice Agent + Automatización de seguimiento**
- Pierden leads por falta de seguimiento
- Algo de estructura digital (WhatsApp, hojas de cálculo)
- Preguntas repetitivas
→ Recomendación: SolIA + secuencia de WhatsApp para follow-up + captura de leads en Google Sheets.

**🔴 Perfil: AI OS Setup Completo**
- Múltiples cuellos de botella
- Ya tienen algunas herramientas pero no están integradas
- Alto volumen operativo
→ Recomendación: AI OS Setup completo — voice agent + knowledge base + lead routing + automatizaciones de seguimiento.

---

**Closing / CTA section:**
Title: `## Próximos Pasos`

Brief paragraph + 3 options:
1. "Quiero ver una demo en vivo de cómo funciona" → Demo call CTA
2. "Cuéntenme más sobre el proceso de implementación" → Link to SolIA one-pager or proposal
3. "Tengo preguntas antes de decidir" → Direct WhatsApp/email contact

---

**Footer note for Esteban (internal):**

`> **Nota para uso interno:** Después de completar el diagnóstico, actualiza el perfil del prospecto en \`outputs/leads/outreach-tracker.json\` con el perfil recomendado (voice_only / voice_plus_automation / full_ai_os) en el campo \`response_notes\`.`

---

**Actions:**
- Write the complete file with all sections above
- Use clear markdown formatting: headers, checkbox lists, tables
- Ensure Spanish is natural and professional (not stiff or literal)
- The tone should match `reference/outreach-scripts.md` — warm, direct, business-focused

**Files affected:**
- `reference/mini-diagnostico-ia-os.md` (create)

---

## Connections & Dependencies

### Files That Reference This Area

- `reference/outreach-scripts.md` — upstream of the diagnóstico (cold call → interest → diagnóstico → demo)
- `solia.md` — the "Ideal Onboarding Inputs" section maps exactly to what the diagnóstico collects
- `context/lead-generation.md` — the "Qualification Criteria" section aligns with what this diagnóstico measures

### Updates Needed for Consistency

- After implementation, optionally update `reference/outreach-scripts.md` to reference the diagnóstico as the logical next step after a positive cold call response: "¿Le envío un diagnóstico rápido de 5 minutos para que vea exactamente cómo aplicaría?"

### Impact on Existing Workflows

- **Adds a stage to the sales funnel**: cold call → (new) mini-diagnóstico → demo → proposal → close
- **Feeds into `/outreach-leads`**: when a lead responds positively, Claude can reference the diagnóstico to guide the follow-up conversation
- **Supports the demo prep**: before a demo call, Esteban reviews the completed diagnóstico to personalize the demo to the client's specific pain points

---

## Validation Checklist

- [ ] File created at `reference/mini-diagnostico-ia-os.md`
- [ ] Document is entirely in Spanish (except file path and internal note)
- [ ] Contains all 4 sections with 8 questions total
- [ ] Each question has 3–4 answer options in checkbox format
- [ ] Scoring/mapping table maps each pain signal to an AI OS component
- [ ] Three recommendation profiles are clearly defined with CTAs
- [ ] Internal note for Esteban is included at the bottom
- [ ] Formatting is clean and readable as raw Markdown

---

## Success Criteria

The implementation is complete when:

1. `reference/mini-diagnostico-ia-os.md` exists and can be read as a polished, ready-to-send Spanish document with no placeholder text.
2. All 8 questions are present with checkbox answer options that cover the full range of prospect situations.
3. The scoring/recommendation section clearly maps answer patterns to specific AI OS components so Esteban can make a confident recommendation at the end of any discovery conversation.

---

## Notes

**How to deploy this document:**
- WhatsApp: Copy-paste the questions as plain text into a message, ask the prospect to reply with the number of each answer
- Email: Send as a formatted message or attach a PDF (convert via WeasyPrint or copy to Google Doc)
- Discovery call: Screen-share the document or just read the questions aloud and note answers in real time
- Future: Build as a Typeform or Tally.so form once the template is validated

**Evolution path:** Once 5–10 prospects have completed the diagnóstico, review the patterns. Which sections trigger the most "aha" moments? Which answers correlate with faster closes? Use that data to simplify or prioritize questions in a v2.

---

## Implementation Notes

**Implemented:** 2026-02-25

### Summary

Created `reference/mini-diagnostico-ia-os.md` — a complete, polished Spanish-language diagnostic document with 8 questions across 4 sections, a pain-to-solution mapping table, 3 recommendation profiles (🟢🟡🔴), and a next-steps CTA section. Includes an internal note for tracker updates.

### Deviations from Plan

None. All sections implemented exactly as specified.

### Issues Encountered

None.
