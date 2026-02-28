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
- Research: 30–40 businesses browsed and qualified on Maps per week
- Calls made: 20–25 calls per week
- Call answer rate target: ~40% (8–10 answered conversations)
- Conversations that convert to interested: ~50% of answered (4–5 warm leads)

**Optional content support:**
- 1–2 posts/week on any social channel (Instagram, LinkedIn, or WhatsApp Status) showing SolIA demos or results — builds credibility when prospects look you up after a call

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

---

## IA OS Director Framework — Lead Generation

> This section covers acquisition for the **IA OS Director Framework** personal AI OS service — a completely different offer and buyer from SolIA. Do not mix these pipelines.

### Weekly Target

**Goal: 3 meaningful conversations per week → 1 diagnostic call per week → 1 proposal per month (early stage)**

A "conversation" is a reply from someone you contacted. A "diagnostic" is a booked and completed 30-min call using `reference/ia-os-intake.md`.

---

### Ideal Customer Profile (ICP)

**Who they are:**
- Solopreneurs, independent consultants, coaches, freelancers, or small business managers (1–5 people teams)
- 3+ years of professional experience — they're competent, not beginners
- Overwhelmed by operational work; can't find time for strategy, vision, or the things only they can do
- Already use some digital tools (WhatsApp, Drive, Notion) but not in a systematic way
- Tried AI (ChatGPT, etc.) occasionally but haven't built a consistent workflow

**Budget signals (they're a fit):**
- Pays for tools, software, or subscriptions without heavy friction
- Has invested in courses, coaching, or books for their own development
- Comfortable spending $250–900 USD on something that demonstrably saves hours per week

**NOT this ICP:**
- A business that needs external-facing automation (that's SolIA)
- A corporate employee with no autonomy over their own tools or workflow
- Someone who has never tried any digital or AI tool — adoption curve too steep

---

### Pain Signals — What to Listen For

When someone says these things, they are describing the "operator trap" the IA OS framework solves:

| What they say | What it means |
|---------------|--------------|
| "No tengo tiempo" / "siempre estoy apagando incendios" | Reactive, never proactive — classic operator |
| "Debería hacer X pero nunca llego" | High-value work keeps getting pushed by low-value tasks |
| "Uso ChatGPT a veces pero no sé bien cómo sacarle partido" | AI curiosity without system = big opportunity |
| "Me cuesta delegar / no confío en que salga bien" | No documented processes — Context OS directly solves this |
| "Cada semana empiezo de cero" | No operating rhythm or planning system |
| "Sé lo que tengo que hacer pero no llego a hacerlo" | Intention without execution infrastructure |

---

### Acquisition Channels

#### 1. Personal Network — WhatsApp (Primary for first clients)

**Why:** Trust already exists. Conversion rate 5–10x higher than cold outreach. No content or credibility required. First 1–2 clients almost always come from here.

**How:**
- Identify 10 contacts who match the ICP (ex-colleagues running their own thing, overwhelmed professionals you know personally, clients who've mentioned they're swamped)
- Send a personal WhatsApp using `reference/ia-os-outreach-scripts.md` — Script A, B, or C depending on closeness
- Goal: book a 30-min diagnostic call — not pitch on the first message

**Volume:** 10 people contacted in week 1 → expect 3–5 replies → 1–2 diagnostic calls

---

#### 2. LinkedIn — Content + DMs (Primary warm channel, weeks 2+)

**Why:** IA OS Director buyers are consultants, freelancers, and managers — they're on LinkedIn. The "director vs. operator" content resonates with this audience directly.

**How:**
- Post 2x/week using templates from `reference/ia-os-linkedin-content.md`
- DM people who engage (like, comment, share) using the LinkedIn DM sequence in `reference/ia-os-outreach-scripts.md`
- Post at least 2 times before starting cold DMs — credibility first

**Volume:** 2 posts/week → 3–5 people who engage per post → DM the most relevant 2–3 → expect 1 response per 3–4 DMs

---

#### 3. WhatsApp Communities (Secondary — weeks 2+)

**Why:** LatAm entrepreneur and professional communities on WhatsApp are active and warm. You're already in some of these for SolIA.

**How:**
- Add value in groups first (answer questions, share insights on AI/productivity) for 5–7 days before DMing anyone
- DM 3–5 members per week whose posts signal the "operator trap"
- Use community opener script from `reference/ia-os-outreach-scripts.md`

**Volume:** 3–5 DMs/week → expect 1–2 replies → 1 diagnostic call every 2 weeks from this channel

---

#### 4. Referrals from SolIA Clients (Bonus)

**Why:** People who've already seen you implement AI are warm referrers. SolIA clients often know a consultant or manager who fits the IA OS Director profile.

**How:**
- After SolIA go-live, ask: "¿Conoces a algún consultor, coach, o dueño de negocio que sienta que la operación lo tiene atrapado? Estoy lanzando algo específico para ellos."
- Offer: if they refer someone who becomes a client, they get a discount on their next support month

---

### Qualification Criteria

A prospect is "qualified" for IA OS Director when:
1. They are the decision-maker for their own workflow (always true for solopreneurs)
2. They feel the "operator trap" — too much execution, not enough direction
3. They are open to a 30-min diagnostic call
4. Budget is not a blocker ($250+ USD comfortable)

---

### Weekly Routine

| Day | Task |
| --- | ---- |
| Monday | Review `outputs/ia-os-clients/prospects.md`. Identify who needs follow-up. Identify 3 new contacts to reach out to this week (personal network or LinkedIn). |
| Tuesday | Send 3 openers (WhatsApp personal or LinkedIn DM). Post to LinkedIn. Log all contacts in prospects.md. |
| Wednesday | Follow up on any responses. Engage with LinkedIn comments. DM 1–2 people who engaged with Tuesday's post. |
| Thursday | Post to LinkedIn. Confirm any diagnostic calls scheduled. Send any follow-up messages due (3–5 days since last contact). |
| Friday | Update prospects.md. Count: contacts made, responses received, diagnostics done, proposals sent. |

---

### Tracking

- Pipeline tracker: `outputs/ia-os-clients/prospects.md`
- Outreach scripts: `reference/ia-os-outreach-scripts.md`
- LinkedIn content: `reference/ia-os-linkedin-content.md`
- Service doc (to send post-opener): `reference/ia-os-director-framework.md`
- Diagnostic questionnaire: `reference/ia-os-intake.md`
- Run `/ia-os-session review personal` to get weekly pipeline status from Claude
