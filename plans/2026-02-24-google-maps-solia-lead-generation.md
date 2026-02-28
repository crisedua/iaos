# Plan: Google Maps Prospecting for SolIA — 5 Leads/Week

**Created:** 2026-02-24
**Status:** Implemented
**Request:** Replace LinkedIn as the primary prospecting channel with Google Maps, and tailor the entire lead generation system specifically for selling SolIA (AI voice agent) to local service businesses found there.

---

## Overview

### What This Plan Accomplishes

This plan rewrites the lead generation strategy to match reality: prospects are found on Google Maps (not LinkedIn), contacted by phone or WhatsApp, and pitched specifically on SolIA — the 24/7 AI voice agent. It updates `context/lead-generation.md`, replaces the outreach scripts with phone and WhatsApp templates, creates a new `reference/google-maps-prospecting.md` guide, and aligns `context/business-info.md` and `context/current-data.md` with this workflow.

### Why This Matters

The original plan assumed LinkedIn as the primary channel — but the user's actual leads come from Google Maps. This mismatch means all outreach scripts, channel targets, and weekly routines are built around the wrong tool. Google Maps is actually the *ideal* prospecting channel for SolIA: every business listed has a visible phone number, a call volume problem, and a clear need to never miss incoming calls. The pitch writes itself. Fixing the channel alignment makes the 5-leads/week target realistic and the workflows immediately actionable.

---

## Current State

### Relevant Existing Structure

- `context/lead-generation.md` — Primary channel is LinkedIn (3 leads/week); WhatsApp communities secondary; weekly routine built around connection requests and DMs
- `reference/outreach-scripts.md` — All scripts are LinkedIn DM / WhatsApp community format; no cold call script; no voicemail script; no phone-first approach
- `context/business-info.md` — Acquisition channels listed as "LinkedIn content + DMs, WhatsApp communities and groups, referrals + partnerships"
- `context/current-data.md` — Funnel targets include "LinkedIn posts/week (3)" and "Outbound DMs/week (20)" — both LinkedIn-centric
- `outputs/leads/leads-log.md` — Channel column exists; currently empty; will continue to work without changes

### Gaps or Problems Being Addressed

- LinkedIn is not where the user's leads come from — the entire primary channel strategy is wrong
- No Google Maps prospecting guide exists anywhere in the workspace
- No cold call script exists — the primary contact method for Google Maps leads is a phone call
- No voicemail script exists — most cold calls go to voicemail on first attempt
- Outreach scripts assume the prospect knows who you are (post-connection DM); Maps calls are cold openers
- Funnel metrics track LinkedIn content output — irrelevant for Maps-based prospecting
- SolIA's core value prop ("never miss a call") is perfectly matched to Google Maps businesses, but no script explicitly uses this framing

---

## Proposed Changes

### Summary of Changes

- Rewrite `context/lead-generation.md` — Google Maps as primary channel (4 leads/week), WhatsApp as secondary (1 lead/week), referrals as bonus; SolIA-specific pitch framing throughout; updated ICP green flags using Maps-readable signals (reviews, hours, phone visible); new weekly routine built around prospect research → call → WhatsApp → follow-up
- Create `reference/google-maps-prospecting.md` — Step-by-step guide: how to search, which categories to target, how to read reviews for pain signals, how to qualify a business before calling, how to build a prospect list
- Replace `reference/outreach-scripts.md` — Remove LinkedIn DM scripts; add cold call opener, voicemail script, WhatsApp opener (for Maps numbers), follow-up call, follow-up WhatsApp, referral ask, objection responses — all SolIA-focused
- Update `context/business-info.md` — Change acquisition channels from LinkedIn-first to Google Maps-first
- Update `context/current-data.md` — Replace LinkedIn-centric funnel metrics with Maps/phone metrics: businesses researched/week, calls made/week, WhatsApp messages sent/week, call answer rate, WhatsApp response rate

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `reference/google-maps-prospecting.md` | Step-by-step process for finding and qualifying SolIA leads on Google Maps |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `context/lead-generation.md` | Full rewrite — Google Maps primary channel, SolIA pitch framing, updated ICP signals, new weekly routine |
| `reference/outreach-scripts.md` | Full replacement — cold call opener, voicemail, WhatsApp opener, follow-ups, referral ask, objections |
| `context/business-info.md` | Update Operating Model > Acquisition channels section |
| `context/current-data.md` | Replace LinkedIn-centric funnel metrics with Maps/phone metrics |

### Files to Delete (if any)

None. The leads log and all other workspace files remain valid as-is.

---

## Design Decisions

### Key Decisions Made

1. **Google Maps → phone call as the primary contact method**: Businesses on Google Maps are phone-first — they list a number specifically to receive calls. Calling them is the natural, expected, and fastest path to a conversation. A cold call is less friction than a cold DM because it doesn't require them to notice and open a message.

2. **WhatsApp as the secondary/follow-up method**: In Chile/LatAm, WhatsApp is ubiquitous for business. Most phone numbers on Google Maps also work on WhatsApp. After a missed call or no callback, a WhatsApp message is the most effective follow-up. It's also less intrusive than a second cold call for a first follow-up.

3. **SolIA framing in every script**: The old scripts pitched generic "AI for local businesses." Every new script will specifically pitch SolIA — the voice agent that answers calls 24/7. This is more concrete, more relevant to the channel (you're calling a business that gets calls), and more differentiated.

4. **New file `reference/google-maps-prospecting.md` instead of embedding in lead-generation.md**: The prospecting process (how to search Maps, read reviews, build a list) is a tactical reference — reused repeatedly, not context. Keeping it in `reference/` makes it easy to pull up mid-session without cluttering the strategy file.

5. **LinkedIn demoted to optional/secondary**: LinkedIn is not removed entirely — some prospects may be there. But it's no longer a primary channel with a target. If the user wants to occasionally post content or DM someone they see on LinkedIn, that's fine. It's no longer a weekly routine.

6. **Keep the 5 leads/week target**: The target stays at 5. Google Maps makes this *more* achievable than LinkedIn — there are thousands of local businesses listed, their phone numbers are public, and calls convert faster than DMs because they're synchronous.

### Alternatives Considered

- **Keep LinkedIn as secondary (1 lead/week)**: Rejected — the user confirmed they don't use it for leads. Keeping it would add noise and false expectations to the weekly routine.
- **Email outreach from Maps**: Some businesses list email. Rejected as primary — email is slower, easier to ignore, and harder to personalize at speed. Scripts will mention email as a last resort only.
- **Create a separate outreach-scripts file for phone vs. WhatsApp**: Rejected — one combined file per the existing pattern. Channel is distinguished within the file with clear section headers.

### Open Questions (if any)

1. **Do you call the business directly, or do you try to reach the owner specifically?** (e.g., "Is [owner name] available?" vs. pitching whoever answers) — Implementation assumes you ask for the owner/director. Adjust if your typical scenario is different.
2. **Do you have a short demo video or one-pager to send after calls?** — Scripts reference "te mando algo corto" (I'll send you something short). Implementation assumes yes. If not, the script should say "te agendo una demo de 15 minutos" instead.
3. **Do you prospect a specific city first (e.g., Santiago only) or all of Chile?** — Implementation defaults to Santiago/Chile. Easy to update once decided.

---

## Step-by-Step Tasks

### Step 1: Create `reference/google-maps-prospecting.md`

Create the tactical guide for finding and qualifying leads on Google Maps. This is the "how to find prospects" playbook — the user opens this file when they sit down to prospect.

**Actions:**

- Create `reference/google-maps-prospecting.md`
- Include: search methodology, business categories to prioritize, qualifying signals in the Maps listing, how to read reviews for pain signals, how to build a prospect list (table format), and a "before you call" checklist

**Full file content:**

```markdown
# Google Maps Prospecting Guide — SolIA Leads

> Use this guide every time you sit down to find new prospects. The goal is to identify 10–15 businesses per session that are worth calling — from which you'll generate 5 leads/week.

---

## Why Google Maps Works for SolIA

Every business on Google Maps:
- Has a phone number (they expect calls — SolIA is exactly what they need)
- Has reviews (you can see pain signals before you call)
- Shows hours (you know when to call and when they're probably missing calls)
- Is a local service business (your exact ICP)

The pitch is simple: "You're listed on Google Maps. Customers find you there and call you. What happens when you miss those calls?"

---

## Step 1: Pick Your Search

**Search format:** `[business category] [city]`

**Best categories to start with (high call volume, clear pain):**

| Category (ES) | Category (EN) | Why SolIA fits |
|---------------|---------------|----------------|
| Clínica dental [ciudad] | Dental clinic | High appointment call volume, after-hours missed calls |
| Clínica médica [ciudad] | Medical clinic | Same — and patients call to reschedule/ask questions |
| Inmobiliaria [ciudad] | Real estate agency | Buyers/renters call constantly; after-hours = lost opportunity |
| Veterinaria [ciudad] | Veterinary clinic | Urgent after-hours calls, high emotional stakes |
| Centro de estética [ciudad] | Beauty/aesthetics center | Booking calls, price queries, high volume |
| Taller mecánico [ciudad] | Auto repair shop | Customers call before bringing in car; often understaffed |
| Abogado / bufete [ciudad] | Law firm | Consultation inquiries, missed = lead lost |
| Contabilidad / contador [ciudad] | Accounting firm | Tax season volume spikes, admin overload |

**Recommended starting city:** Santiago (largest concentration of businesses, highest call expectations)

---

## Step 2: Scan the Results

For each business listing, check these qualifying signals quickly:

### Green Flags — Add to prospect list

- Phone number is visible (required)
- 20+ reviews (indicates high customer volume → high call volume)
- Rating between 3.5–4.5 ⭐ (good enough to still get customers, but room for improvement — likely has operational issues)
- "Open now" or has specific hours (they're active)
- Has a website linked (some digital maturity — they can adopt a tool)
- Category matches your ICP list above

### Red Flags — Skip or deprioritize

- No phone number listed
- Fewer than 5 reviews (too small or new — low call volume)
- Only 1–2 employees visible / looks like solo operator
- Permanently closed or hours unclear
- Pure e-commerce / no local service component

---

## Step 3: Read the Reviews for Pain Signals

Before calling, spend 30 seconds reading reviews. Look for:

**High-value pain signals (prioritize these businesses):**

| Signal in reviews | What it means for SolIA pitch |
|-------------------|-------------------------------|
| "No contestan el teléfono" | Direct proof of missed calls — pitch directly |
| "Difícil comunicarse" | Poor call handling — SolIA fixes this |
| "Siempre ocupado / línea ocupada" | Overloaded — they need 24/7 coverage |
| "No responden fuera de horario" | After-hours gap — SolIA's strongest use case |
| "Excelente atención" (repeated) | They value service quality — SolIA helps maintain it at scale |
| Many reviews in a short time | High volume business — they definitely get a lot of calls |

---

## Step 4: Build Your Prospect List

Before calling, collect info into a simple list (can be in the leads log or a scratch note):

| Business Name | Category | City | Phone | WhatsApp? | Review Count | Pain Signal Spotted | Priority |
|---------------|----------|------|-------|-----------|--------------|---------------------|----------|
| [name] | Dental | Santiago | +56 9 XXXX | ✓ | 87 | "no contestan" × 3 | High |

**Target:** Build a list of 10–15 prospects per session before starting calls.

**Check WhatsApp:** Paste the phone number into `wa.me/[number]` in your browser or just open WhatsApp and try adding the number. If they have WhatsApp Business, you'll see their profile.

---

## Step 5: Before You Call — Checklist

- [ ] It's within their listed business hours
- [ ] You've read at least 3–5 reviews
- [ ] You have a note on their specific pain signal (to personalize the call)
- [ ] You have the script open (`reference/outreach-scripts.md`)
- [ ] You're ready to note the outcome immediately in `outputs/leads/leads-log.md`

---

## Prospecting Session Template

**Time:** 30–45 minutes per session, 2–3 sessions per week

1. (5 min) Pick category + city for this session
2. (15 min) Scan 15–20 listings, qualify, build prospect list
3. (20–25 min) Call 8–10 businesses from the list
4. After session: Update leads-log.md with all outcomes
```

**Files affected:**

- `reference/google-maps-prospecting.md` (create new)

---

### Step 2: Rewrite `reference/outreach-scripts.md`

Replace all LinkedIn-centric scripts with phone-first scripts for SolIA outreach. Primary scenario: cold call to a business found on Google Maps. Secondary: WhatsApp message (either as first contact if preferred, or as follow-up to a missed call).

**Actions:**

- Overwrite the entire file — do not keep LinkedIn scripts
- Add: cold call opener, voicemail script, WhatsApp opener (Maps-sourced), follow-up call script, follow-up WhatsApp message, referral ask, objection responses
- All scripts in Spanish as primary; English translation for reference
- Personalization brackets clearly marked

**Full file content:**

```markdown
# Outreach Scripts — SolIA / AI OS for Business

> Phone and WhatsApp scripts for reaching businesses found on Google Maps. Always personalize [BRACKETS] before using. Never read robotically — use these as a guide, not a transcript.

---

## Cold Call — Opening Script

Use when calling a business for the first time from their Google Maps listing.

**ES (main script):**

> "Hola, buenos días/tardes. ¿Me podría comunicar con el/la [dueño/director/encargado]?
> [Pausa — si pasa:]
> Hola [Nombre], mi nombre es [Tu Nombre]. Te llamo porque vi su [clínica/agencia/negocio] en Google Maps y quería hacer una consulta rápida, ¿tiene un momento?
> [Pausa — si dice sí:]
> Trabajo con [clínicas/inmobiliarias/negocios locales] en Chile instalándoles un agente de voz con IA que contesta sus llamadas 24/7 — incluso cuando están ocupados o fuera de horario. Vi que reciben bastantes llamadas y quería saber: ¿cuántas llamadas estiman que se pierden a la semana cuando el equipo está ocupado o el negocio está cerrado?
> [Escuchar respuesta → continuar con demo offer:]
> Justamente para eso sirve lo que hacemos. ¿Le interesaría ver cómo funciona en 15 minutos esta semana?"

**EN (reference):**

> "Hi, good morning/afternoon. Could I speak with the owner/director?
> [If transferred:]
> Hi [Name], my name is [Your Name]. I'm calling because I saw your [clinic/agency/business] on Google Maps and had a quick question — do you have a moment?
> [If yes:]
> I work with [clinics/real estate agencies/local businesses] in Chile installing an AI voice agent that answers their calls 24/7 — even when the team is busy or the business is closed. I noticed you get quite a few calls and wanted to ask: how many do you estimate are missed per week when your team is occupied or you're after hours?
> [Listen → continue:]
> That's exactly what we solve. Would you be interested in seeing how it works in 15 minutes this week?"

**If gatekeeper (receptionist) answers:**

> "Hola, buenos días. Necesito hablar con el/la [dueño/encargado/director] sobre un tema relacionado con la gestión de llamadas del negocio. ¿Podría comunicarme? ¿Sabe si está disponible ahora o a qué hora le puedo llamar?"

---

## Voicemail Script

Leave this if they don't answer. Keep it under 25 seconds.

**ES:**

> "Hola, mensaje para el/la [dueño/encargado] de [nombre del negocio]. Mi nombre es [Tu Nombre] y les llamo porque vi su negocio en Google Maps. Trabajo con [clínicas/agencias] en Chile ayudándoles a nunca perder una llamada, incluso fuera de horario, con IA. Si les interesa saber más, les puedo devolver la llamada o pueden contactarme al [tu número]. ¡Hasta luego!"

---

## WhatsApp Opener (Google Maps Number)

Use when: (a) you tried calling and they didn't pick up, or (b) you prefer to start via WhatsApp.

**ES:**

> "Hola [Nombre / nombre del negocio], le escribo porque vi [Clínica/Agencia/Negocio] en Google Maps. Me llamo [Tu Nombre] y trabajo con negocios locales en Chile instalando un agente de voz con IA que contesta llamadas 24/7.
> Vi que reciben bastantes consultas y quería preguntar: ¿suelen perder llamadas cuando están ocupados o fuera de horario?
> Si les interesa, con gusto les muestro cómo funciona en 15 minutos. ¿Tienen disponibilidad esta semana?"

**EN (reference):**

> "Hi [Name / business name], I'm writing because I found [Clinic/Agency/Business] on Google Maps. My name is [Your Name] and I work with local businesses in Chile installing an AI voice agent that answers calls 24/7.
> I noticed you get quite a few inquiries and wanted to ask: do you often miss calls when the team is busy or you're after hours?
> If you're interested, I'd love to show you how it works in 15 minutes. Do you have availability this week?"

---

## Follow-Up Call (2–3 days after first call/no response)

**ES:**

> "Hola, buenos días/tardes. ¿Me podría comunicar con [Nombre/el encargado]?
> [Si pasa:]
> Hola [Nombre], le vuelvo a llamar. La semana pasada intenté contactarles porque vi su negocio en Google Maps. Trabajo instalando agentes de voz con IA para negocios como el suyo — básicamente para que nunca pierdan una llamada. ¿Tiene dos minutos para que le cuente rápidamente?"

---

## Follow-Up WhatsApp (2–3 days after WhatsApp opener / no response)

**ES:**

> "Hola [Nombre], solo quería hacer un seguimiento rápido. Entiendo que están ocupados. Si en algún momento quieren ver cómo otros [dentistas/agencias/clínicas] están resolviendo el tema de las llamadas perdidas con IA, con gusto les muestro. Sin compromiso."

---

## Soft Close (Final attempt — 5–7 days after follow-up)

**ES:**

> "[Nombre], último mensaje para no molestar más 😄. Si no es el momento correcto, sin problema — estaré por aquí. Solo recuerde que si en algún momento están perdiendo llamadas o consultas por capacidad, tenemos algo concreto que funciona. ¡Mucho éxito con el negocio!"

---

## Referral Ask (After a positive conversation or closed deal)

**ES:**

> "Por cierto, [Nombre], ¿conoce a otros dueños de [clínicas/agencias/negocios de servicio] que tengan el mismo problema con las llamadas? Si me presenta a alguien, lo atiendo con prioridad y si llega a implementar el sistema, hay una comisión o descuento en su próxima renovación para usted."

---

## Objection Responses

### "No tenemos ese problema / contestamos todas las llamadas"

**ES:** "Me alegra escuchar eso. Solo para entender mejor: ¿tienen alguien disponible para contestar los fines de semana y fuera de horario también? Muchos negocios creen que no pierden llamadas hasta que miran los registros de llamadas perdidas. Si en algún momento quiere revisarlo, con gusto le ayudo a hacer ese diagnóstico."

### "Ya tenemos recepcionista / alguien que contesta"

**ES:** "Perfecto. El agente no reemplaza a su equipo — trabaja en paralelo. Cuando la recepcionista está ocupada con otro cliente, o cuando llaman un sábado a las 9 de la noche, el agente contesta, captura los datos del paciente y agenda. ¿Le interesaría ver exactamente qué hace en esos momentos?"

### "No tenemos presupuesto"

**ES:** "Lo entiendo. Solo por curiosidad: ¿cuántas llamadas estiman que se pierden al mes? Si cada llamada perdida es un paciente o cliente que va a la competencia, a veces el costo de no hacer nada es mayor. Si quiere, le hago un cálculo rápido en base a su volumen."

### "Mándeme información"

**ES:** "Claro, le mando algo corto. Pero le soy honesto — esto funciona mucho mejor viéndolo en acción que leyendo sobre ello. Son 15 minutos y le muestro el agente respondiendo llamadas reales. ¿Tiene un espacio esta semana o la próxima?"

### "No me interesa / no es el momento"

**ES:** "Sin problema, lo entiendo totalmente. ¿Le puedo preguntar, es porque ya tienen una solución para el tema de llamadas, o simplemente no es una prioridad ahora mismo? Solo para saber si tiene sentido volver a contactarlos más adelante."
```

**Files affected:**

- `reference/outreach-scripts.md` (overwrite)

---

### Step 3: Rewrite `context/lead-generation.md`

Replace the LinkedIn-first strategy with a Google Maps-first strategy. The structure stays the same but every section is rewritten for the new reality.

**Actions:**

- Overwrite the file completely
- Channel 1: Google Maps → phone/WhatsApp (4 leads/week target)
- Channel 2: WhatsApp communities (1 lead/week — keep as secondary since it still applies)
- Channel 3: Referrals (bonus)
- Remove LinkedIn entirely from this file
- Update ICP green flags to include Google Maps-readable signals (review count, pain in reviews)
- Update weekly routine to: Maps research → calls → WhatsApp follow-ups → log updates

**Full file content:**

```markdown
# Lead Generation — AI OS for Business (SolIA)

> This file defines the operational strategy for generating 5 qualified leads per week for SolIA. Claude reads this during /prime and /weekly-leads to support outreach planning and pipeline management.

---

## Weekly Target

**Goal: 5 new qualified leads per week**

A "lead" is any business owner or decision-maker who has been contacted and has responded or shown interest. Calls that reach voicemail only, or messages that receive no reply within 5 days, are not counted as leads.

---

## Ideal Customer Profile (ICP)

**Primary targets:**
- Local service businesses in Chile / LatAm listed on Google Maps
- Industries: dental clinics, medical clinics, real estate agencies, veterinary clinics, beauty/aesthetics centers, auto repair shops, law firms, accounting firms
- Size: 2–20 employees; owner or director is the decision-maker
- Pain signal: Receives a meaningful volume of incoming calls, misses some (after-hours, busy periods, weekends)
- Budget signal: Comfortable spending $200–$600 USD on implementation; open to a monthly support plan

**Green flags — prioritize these businesses:**
- Phone number visible on Google Maps (required)
- 20+ reviews (high customer volume = high call volume)
- Reviews mention "no contestan", "difícil comunicarse", or "fuera de horario" (direct pain proof)
- Business is open 6–7 days/week or has extended hours (high call exposure)
- Has a website linked in their Maps profile (some digital maturity)
- Operates in an appointment-based or inquiry-heavy model (dental, medical, real estate)

**Red flags — skip or deprioritize:**
- No phone number listed on Maps
- Fewer than 5 reviews (low volume, may be too small)
- Solo operator with no team
- Primarily e-commerce or no local service component
- Outside Chile/LatAm without Spanish-speaking team

---

## Acquisition Channels

### 1. Google Maps → Phone / WhatsApp (Primary — 4 leads/week target)

**How to find prospects:**
- See full process: `reference/google-maps-prospecting.md`
- Search "[business category] [city]" → qualify by signals → build call list → call or WhatsApp

**Outreach method:**
- **First contact:** Cold call using the Maps phone number (during business hours)
- **If no answer:** Leave voicemail + send a WhatsApp message the same day
- **If answered:** Use call opener script → aim for 15-min demo booking

**Weekly volume targets to generate 4 leads:**
- Research: 30–40 businesses browsed/qualified on Maps per week
- Calls made: 20–25 calls per week
- Call answer rate target: ~40% (8–10 answered)
- Conversations that convert to "interested": ~50% of answered (4–5 warm leads)

**Content cadence (optional support):**
- 1–2 posts/week on any social channel (Instagram, LinkedIn, or WhatsApp Status) showing SolIA demos or results — backs up your credibility when prospects look you up after a call

### 2. WhatsApp Communities (Secondary — 1 lead/week target)

**Where to find them:**
- Local business owner groups (health/wellness, real estate, professional services)
- Entrepreneur communities in Chile/LatAm

**Outreach routine:**
- Engage in 1–2 active groups (react, comment, add value before DMing)
- DM 3–5 members per week with a relevant, personalized opener
- Pitch: same SolIA angle — "never miss a call"

### 3. Referrals & Partnerships (Bonus — 0–1 lead/week)

**Sources:**
- Web designers, digital marketing agencies, accountants who serve local service businesses
- Ask every new client: "Who else do you know in your industry with the same call problem?"
- Partner pitch: "I handle the AI voice layer — you refer clients and earn a commission"

---

## Qualification Criteria

A lead is "qualified" when:
1. They are the decision-maker (owner, director, or manager with budget authority)
2. Their business receives and sometimes misses incoming calls
3. They are open to a 15-min demo call
4. They operate in a targetable industry (see ICP above)

---

## Weekly Routine

| Day | Task |
| --- | ---- |
| Monday | Run /weekly-leads. Research 15–20 businesses on Google Maps. Build call list for the week. |
| Tuesday | Call 8–10 businesses from the list. Log all outcomes immediately in leads-log.md. |
| Wednesday | Follow up via WhatsApp on Tuesday's no-answers. Call 5–8 new businesses. Check WhatsApp community for DM opportunities. |
| Thursday | Follow up on all open conversations. Call any businesses that asked to be called back. Add new leads to log. |
| Friday | Week review: count qualified leads, demos booked. Update current-data.md with actuals. Archive log for the week. |

---

## Tracking

- Leads log: `outputs/leads/leads-log.md`
- Prospecting guide: `reference/google-maps-prospecting.md`
- Outreach scripts: `reference/outreach-scripts.md`
- Weekly metrics: `context/current-data.md` (Pipeline section)
- Use `/weekly-leads` command to start each week's review and planning session with Claude
```

**Files affected:**

- `context/lead-generation.md` (overwrite)

---

### Step 4: Update `context/business-info.md`

Update the Operating Model section to reflect Google Maps as the primary acquisition channel instead of LinkedIn.

**Actions:**

- In the "Acquisition channels" bullet list, replace "LinkedIn content + DMs" with "Google Maps prospecting → cold call / WhatsApp"
- Keep WhatsApp communities and referrals as listed

**Specific change (find and replace this block):**

Old:
```
**Acquisition channels**
- LinkedIn content + DMs
- WhatsApp communities and groups
- Referrals + partnerships (web agencies, marketers)
- Limited-slot pilots / trial offers (time-boxed)
```

New:
```
**Acquisition channels**
- Google Maps prospecting → cold call / WhatsApp (primary — find local businesses, call direct)
- WhatsApp communities and groups (secondary)
- Referrals + partnerships (web agencies, marketers, accountants)
- Limited-slot pilots / trial offers (time-boxed)
```

**Files affected:**

- `context/business-info.md` (modify Acquisition channels section)

---

### Step 5: Update `context/current-data.md`

Replace the LinkedIn-centric Funnel & Marketing metrics with metrics that match the Google Maps + phone outreach model.

**Actions:**

- Replace the entire Funnel & Marketing table with the new metrics below
- Keep all targets; just change the metric names to reflect the actual workflow

**New Funnel & Marketing table:**

```markdown
### Funnel & Marketing

| Metric | Current Value | Target | Notes |
| ------ | ------------- | ------ | ----- |
| Businesses researched on Maps/week |  | 30–40 | Qualifying sessions per week |
| Outbound calls made/week |  | 20–25 | Total calls placed |
| Call answer rate |  | 40% | % of calls actually answered |
| WhatsApp messages sent/week |  | 10–15 | Follow-ups + direct openers |
| WhatsApp response rate |  | 30% | % of WA messages that get a reply |
| Call/WA → demo booking rate |  | 20% | % of conversations that book a 15-min demo |
| Content posts/week (any channel) |  | 1–2 | Optional credibility support |
| Lead source mix |  |  | % Maps / WhatsApp community / referral |
```

**Files affected:**

- `context/current-data.md` (replace Funnel & Marketing table)

---

## Connections & Dependencies

### Files That Reference This Area

- `outputs/leads/leads-log.md` — Channel column will now show "Google Maps call", "WhatsApp (Maps)", "WhatsApp community", "Referral" instead of "LinkedIn"
- `.claude/commands/weekly-leads.md` — Reads `context/lead-generation.md` and `reference/outreach-scripts.md`; the command output will automatically improve once these files are updated
- `context/strategy.md` — References "LinkedIn cadence" in Priority #2; may need a minor update for accuracy (optional)

### Updates Needed for Consistency

- The `/weekly-leads` command will automatically produce better briefings after these changes — no update needed to the command itself
- `outputs/leads/leads-log.md` — No changes needed; the table structure works for any channel
- `context/strategy.md` — Optional: update "Weekly LinkedIn cadence" in Priority #2 to "Google Maps prospecting + cold outreach routine"

### Impact on Existing Workflows

- `/weekly-leads` immediately becomes more useful — it will read updated files and produce Maps/phone-specific outreach plans instead of LinkedIn plans
- No commands are broken or need modification
- The leads log continues to work — just the "Channel" field entries will change

---

## Validation Checklist

- [ ] `reference/google-maps-prospecting.md` exists with search methodology, qualifying signals, review pain signals, prospect list template, and pre-call checklist
- [ ] `reference/outreach-scripts.md` contains cold call opener, voicemail script, WhatsApp opener, follow-up call, follow-up WhatsApp, soft close, referral ask, and objection responses — no LinkedIn scripts remain
- [ ] `context/lead-generation.md` lists Google Maps as primary channel (4 leads/week) and contains no LinkedIn outreach routine
- [ ] `context/business-info.md` shows "Google Maps prospecting → cold call / WhatsApp" as first acquisition channel
- [ ] `context/current-data.md` Funnel & Marketing section tracks calls made, Maps research volume, and WhatsApp messages — not LinkedIn posts

---

## Success Criteria

The implementation is complete when:

1. Running `/weekly-leads` produces a briefing that tells you which Google Maps categories to search, how many calls to make, and what scripts to use — with no reference to LinkedIn activity
2. `reference/outreach-scripts.md` has a cold call opener and voicemail script ready to use on the first prospecting session
3. All four context/reference files accurately describe a Google Maps → phone/WhatsApp → SolIA demo workflow that the user can execute immediately without any mental translation

---

## Notes

- **SolIA is a perfect match for this channel:** Google Maps businesses get phone calls — that's their primary inbound channel. You're calling them to tell them you can make their phone answering better. The pitch is self-evident and the timing is natural.
- **Call volume math:** 20–25 calls/week at ~40% answer rate = 8–10 conversations. If 50% of those are interested enough to hear more, that's 4–5 warm leads. Add 1 from WhatsApp community = 5 total. The math works.
- **Review mining is a superpower:** Businesses with negative reviews about phone accessibility are pre-qualified. You already know their pain before you call. Mention it: "Vi en sus reseñas que algunos clientes mencionan dificultad para comunicarse — justamente para eso ayudamos."
- **Future: automation opportunity:** A script in `scripts/` could semi-automate Google Maps prospecting — searching categories, extracting phone numbers, and building prospect lists. This is a strong phase 2 opportunity given that the user builds AI agents.
- **strategy.md alignment:** Consider updating `context/strategy.md` Priority #2 to say "Weekly Google Maps prospecting + call outreach routine" instead of "LinkedIn cadence" after implementation.

---

## Implementation Notes

**Implemented:** 2026-02-24

### Summary

All 5 steps executed in full. Created `reference/google-maps-prospecting.md` (new). Replaced `reference/outreach-scripts.md` with phone/WhatsApp scripts (cold call opener, voicemail, WhatsApp opener, follow-ups, objection responses — all SolIA-specific). Rewrote `context/lead-generation.md` with Google Maps as primary channel. Updated acquisition channels in `context/business-info.md`. Replaced LinkedIn-centric funnel metrics in `context/current-data.md` with Maps/phone metrics.

### Deviations from Plan

- Added two supplementary sections to the cold call script: "If a gatekeeper (receptionist) answers" and "If they ask what this is about before transferring" — these are common real-world scenarios the plan's script block implied but didn't explicitly address.
- Added a "Logging Outcomes in leads-log.md" reference table to `reference/google-maps-prospecting.md` — useful tactical addition for maintaining the log during prospecting sessions.

### Issues Encountered

None.
