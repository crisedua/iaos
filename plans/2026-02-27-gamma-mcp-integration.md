# Plan: Gamma MCP Integration

**Created:** 2026-02-27
**Status:** Draft
**Request:** Connect to Gamma (gamma.app) via MCP to enable AI-powered presentation and document generation from within the workspace.

---

## Overview

### What This Plan Accomplishes

Adds Gamma as an MCP server in this workspace, giving Claude the ability to create presentations, pitch decks, proposals, and documents directly — without leaving the workspace. Claude will be able to call Gamma's Generate API to produce polished visual assets from existing workspace content (Sprint offers, challenge landing pages, client proposals, etc.).

### Why This Matters

The workspace has strong content assets — Sprint offer doc, challenge emails, LinkedIn posts, IA OS Director framework — but everything is text. Gamma closes the gap: with a single command, a polished pitch deck or client proposal can be generated from those files. This is directly relevant to:
- **AI CEO Challenge conversions:** Sending a Gamma-generated sprint proposal deck instead of a plain markdown doc raises perceived value
- **IA OS Director delivery:** Client onboarding deliverables (Context OS overview, roadmap) as shareable presentations
- **LinkedIn/content:** Visual posts and carousels generated from existing content

---

## Current State

### Relevant Existing Structure

| Asset | Location | Relevance |
|---|---|---|
| MCP config | `.mcp.json` | All existing servers use `npx` or `node` command + env vars pattern |
| Google MCP setup guide | `reference/google-mcp-setup.md` | Model for the setup doc this plan will create |
| Sprint offer doc | `reference/sprint-director-ia-offer.md` | Primary content to turn into a pitch deck |
| Challenge content | `reference/challenge-ia-content.md` | Challenge overview → landing page presentation |
| IA OS framework | `reference/ia-os-director-framework.md` | Framework deck for prospects and clients |
| LinkedIn content | `reference/ia-os-linkedin-content.md` | Post carousels |

### Gaps or Problems Being Addressed

1. **No visual output capability** — all deliverables are text/markdown. Gamma enables polished decks from that content.
2. **No Gamma connection documented** — no setup guide, no MCP entry, no usage patterns in the workspace.
3. **Manual presentation work** — any deck currently requires leaving the workspace, copy-pasting, and manual formatting in Gamma's editor.

---

## Proposed Changes

### Summary of Changes

- Add Gamma to `.mcp.json` using the recommended connection method (see Design Decisions below)
- Create `reference/gamma-mcp-setup.md` — step-by-step setup guide + usage examples for this workspace
- Update `CLAUDE.md` to note Gamma as an available MCP tool

### New Files to Create

| File Path | Purpose |
|---|---|
| `reference/gamma-mcp-setup.md` | Complete setup guide: API key setup, .mcp.json config, available tools, workspace use cases, example prompts |

### Files to Modify

| File Path | Changes |
|---|---|
| `.mcp.json` | Add `gamma` entry with the correct connection config |
| `CLAUDE.md` | Update `.mcp.json` description line to include Gamma |

---

## Design Decisions

### Key Decisions Made

1. **Official Gamma MCP server (hosted) as primary approach:**
   Gamma ships an official hosted MCP server documented at `developers.gamma.app/docs/gamma-mcp-server`. This is the most stable, zero-maintenance option. No local clone or build step required. Authentication is via Gamma API key (same key used for the REST API).

2. **Community server (CryptoJym/gamma-mcp-server) as fallback:**
   If the hosted MCP endpoint doesn't work with Claude Code's `.mcp.json` format (some hosted MCPs require OAuth flows not compatible with the CLI), the fallback is cloning and building a community server locally. The plan documents both paths.

3. **API key (not OAuth) as the auth mechanism:**
   The Gamma REST API uses a static API key (`X-API-KEY` header), which matches the pattern used for Apify in this workspace (`APIFY_TOKEN` env var). This is simpler than OAuth and more appropriate for a CLI tool context.

4. **Gamma requires a paid plan:**
   The Generate API (which MCP uses) is only available on Pro, Ultra, Teams, or Business plans. Free plan accounts cannot use the API. This is a prerequisite the user must satisfy before implementation.

5. **No new slash command created:**
   Gamma capabilities are best used inline — "generate a pitch deck from the Sprint offer doc" — rather than as a dedicated command. The setup guide documents example prompts instead.

### Alternatives Considered

| Alternative | Why Not Recommended |
|---|---|
| Build a custom MCP wrapper around Gamma REST API | Unnecessary — official + community servers already exist and are maintained |
| Use Gamma's web editor manually | Defeats the purpose of workspace-native generation |
| Generic HTTP MCP server pointing at Gamma REST API | More boilerplate, less capability than a purpose-built server |

### Open Questions

1. **Gamma plan:** Do you have a Pro, Ultra, Teams, or Business Gamma plan? The API key is only available on paid plans. If not, this is a blocker — implementation cannot proceed until a paid plan is active.

2. **Hosted vs. local server preference:** The plan implements the hosted MCP first (simpler). If you prefer to run a local server for more control or offline use, say so and we'll use the community server approach instead.

---

## Step-by-Step Tasks

### Step 1: Get Gamma API Key

Retrieve your Gamma API key from your account settings.

**Actions:**
- Log in to gamma.app
- Go to **Settings → API** (or `gamma.app/settings/api`)
- Generate a new API key — it will look like `gsk_...` or similar
- Store it somewhere safe — you'll add it as an environment variable

**Files affected:**
- None (manual action in browser)

---

### Step 2: Add Gamma to `.mcp.json` — Option A (Hosted MCP, Recommended)

Add the official Gamma hosted MCP server to the workspace MCP config.

**Actions:**
- Read `.mcp.json` to confirm current structure
- Add the `gamma` entry using the hosted server URL

The official Gamma MCP server uses HTTP/SSE transport. The `.mcp.json` entry:

```json
"gamma": {
  "command": "npx",
  "args": ["-y", "@gamma-app/mcp-server"],
  "env": {
    "GAMMA_API_KEY": "${GAMMA_API_KEY}"
  }
}
```

**If `@gamma-app/mcp-server` is not published on npm** (verify by running `npm view @gamma-app/mcp-server` — if it errors, use Option B below instead):

**Option B — Community Server (fallback):**

```bash
# In terminal, from a permanent location (not the workspace):
git clone https://github.com/CryptoJym/gamma-mcp-server.git C:/tools/gamma-mcp-server
cd C:/tools/gamma-mcp-server
npm install
npm run build
```

Then in `.mcp.json`:
```json
"gamma": {
  "command": "node",
  "args": ["C:/tools/gamma-mcp-server/dist/index.js"],
  "env": {
    "GAMMA_API_KEY": "${GAMMA_API_KEY}"
  }
}
```

**Files affected:**
- `.mcp.json`

---

### Step 3: Set the Environment Variable

Add `GAMMA_API_KEY` to the system environment so Claude Code can read it (matching how `APIFY_TOKEN` is set).

**Actions:**
- Open Windows Environment Variables: Start → Search "Edit the system environment variables" → Environment Variables
- Under **User variables**, click New:
  - Variable name: `GAMMA_API_KEY`
  - Variable value: `[the key from Step 1]`
- Click OK
- **Restart Claude Code** — environment variables are read at startup

**Verification:**
```bash
echo $GAMMA_API_KEY
```
Should print the key (not empty).

**Files affected:**
- None (system environment variable — not a workspace file)

---

### Step 4: Create `reference/gamma-mcp-setup.md`

Write the setup and usage guide, following the same structure as `reference/google-mcp-setup.md`.

**Content to include:**

**Section 1 — Prerequisites:**
- Gamma paid plan (Pro or higher)
- API key from gamma.app/settings/api
- Node.js installed (already required for existing MCPs)

**Section 2 — Setup steps** (Steps 1-3 from this plan, summarized concisely)

**Section 3 — Available tools** (what Claude can do with Gamma MCP):
- `generate_presentation` — create a presentation from a text prompt or structured content
- `generate_document` — create a Gamma document (long-form)
- `generate_webpage` — create a Gamma webpage
- `list_themes` — browse available Gamma themes
- `list_folders` — list workspace folders in Gamma account

**Section 4 — Workspace use cases with example prompts:**

Use case 1 — Sprint Director IA pitch deck:
```
Using the content in reference/sprint-director-ia-offer.md, create a
Gamma presentation for the Sprint Director IA offer. Structure it as:
slide 1: headline + problem statement, slides 2-3: what's included,
slide 4: timeline, slide 5: investment + guarantee, slide 6: next step CTA.
Use a professional dark theme.
```

Use case 2 — AI CEO Challenge landing page:
```
Using the AI CEO Challenge content (the 4-day structure, deliverables,
and target audience), create a Gamma webpage that functions as a
landing page. Include the problem statement, day-by-day breakdown,
who it's for, and the signup CTA.
```

Use case 3 — Client Context OS overview:
```
Create a Gamma document summarizing [client name]'s Context OS from
outputs/ia-os-clients/[client]/context-os.md. Format it as a visual
overview they can share with their team.
```

Use case 4 — IA OS Director framework deck:
```
Generate a 6-slide presentation from reference/ia-os-director-framework.md
to use as a prospect-facing overview. Cover: the problem, the 5 layers,
before/after contrast, the 3 packages, and the next step.
```

**Section 5 — Tips and limits:**
- Gamma API uses credits: presentations ~1-5 credits, images ~2-125
- Monitor credit usage in gamma.app/settings/billing
- Generated content appears in your Gamma workspace (can be edited there)
- API is rate-limited but generous: hundreds of requests/hour on v1.0

**Files affected:**
- `reference/gamma-mcp-setup.md` (create)

---

### Step 5: Update `CLAUDE.md`

Add Gamma to the `.mcp.json` description in the workspace structure.

**Actions:**
- Find the line in CLAUDE.md that describes `.mcp.json`
- Update it to include Gamma

Current text:
```
├── .mcp.json              # MCP server config (Apify for Google Maps; TickTick for tasks; Google Drive + Gmail)
```

New text:
```
├── .mcp.json              # MCP server config (Apify for Google Maps; Google Drive + Gmail; Gamma for presentations)
```

**Files affected:**
- `CLAUDE.md`

---

### Step 6: Test the Integration

Verify Gamma MCP is working from within Claude Code.

**Actions:**
- Restart Claude Code after the environment variable is set
- Ask Claude: *"List the available Gamma themes"* — this calls `list_themes` and confirms the connection works without spending credits
- If that works, test generation: *"Create a short 3-slide Gamma presentation with the title 'AI OS for Business' and a subtitle 'De operar a dirigir'"*
- Verify the presentation appears in your Gamma workspace at gamma.app

**If the connection fails:**
- Verify `GAMMA_API_KEY` is set correctly: `echo $GAMMA_API_KEY` in terminal
- Check that Node.js is available: `node --version`
- If using Option B (local server): verify the build succeeded at `C:/tools/gamma-mcp-server/dist/index.js`
- Try restarting Claude Code again

**Files affected:**
- None (test only)

---

## Connections & Dependencies

### Files That Reference This Area

- `.mcp.json` — core config file being modified
- `CLAUDE.md` — workspace overview that lists MCP servers
- `reference/google-mcp-setup.md` — structural model for the new setup guide

### Updates Needed for Consistency

- `CLAUDE.md` description of `.mcp.json` (Step 5)
- The new `reference/gamma-mcp-setup.md` cross-references the Sprint offer, challenge content, and IA OS framework files as use case sources

### Impact on Existing Workflows

- **`/ia-os-session output`:** With Gamma connected, `output proposal` or `output report` can optionally generate a Gamma presentation in addition to (or instead of) a markdown file
- **AI CEO Challenge:** Sprint pitch deck can be generated and shared as a Gamma link instead of a markdown file — dramatically raises perceived value with prospects
- **Existing MCPs:** No impact — Gamma is additive, no conflicts with Apify, Google Drive, or Gmail

---

## Validation Checklist

- [ ] Gamma API key obtained from gamma.app/settings/api
- [ ] `GAMMA_API_KEY` environment variable set in Windows User Variables
- [ ] `.mcp.json` updated with `gamma` entry (Option A or B)
- [ ] Claude Code restarted after env var was added
- [ ] `list_themes` tool call returns results without error
- [ ] Test presentation created and visible in gamma.app workspace
- [ ] `reference/gamma-mcp-setup.md` created with all sections
- [ ] `CLAUDE.md` updated with Gamma in the `.mcp.json` description
- [ ] Option B only: `C:/tools/gamma-mcp-server/dist/index.js` exists and is built

---

## Success Criteria

The implementation is complete when:

1. Running "list Gamma themes" from Claude Code returns theme data from the Gamma API — confirming the MCP connection is live
2. A test presentation created by Claude appears in your Gamma workspace without manual steps
3. `reference/gamma-mcp-setup.md` is complete enough that you can reproduce the setup in a new machine without searching anything

---

## Notes

- **Credit cost:** Each presentation generation uses credits (typically 1-5 for the deck structure, more if images are generated). For a workspace where you're generating proposals and pitch decks, this is negligible — budget ~$10-20/month at heavy usage. Monitor at gamma.app/settings/billing.
- **Gamma plan required:** Implementation is blocked until you confirm you have a Pro or higher Gamma plan. Free plan = no API access.
- **Option A vs B:** Attempt Option A (npx `@gamma-app/mcp-server`) first — it's simpler and zero-maintenance. If that package doesn't exist on npm, fall to Option B. The implementation step documents how to detect which path to take.
- **Generated decks live in Gamma:** Claude creates the deck, but it lives in gamma.app where you can edit, share as link, export to PDF/PPTX, or embed. This is a feature, not a limitation — you get full editing control after generation.
- **Future workflow:** Once working, the most powerful use is chaining — Claude reads `reference/sprint-director-ia-offer.md`, drafts a personalized cover email via Gmail MCP, and generates the pitch deck via Gamma MCP, all in one session.
