# Plan: Add /extract-leads-gmap Command — Automated Google Maps Lead Extraction

**Created:** 2026-02-24
**Status:** Implemented
**Request:** Create a /extract-leads-gmap command that uses a Claude extract agent to validate search parameters, an Apify Google Maps scraper (via MCP) to pull 80+ leads per category/city, then normalizes and exports the data to Google Sheets and local CSV.

---

## Overview

### What This Plan Accomplishes

This plan creates a fully automated `/extract-leads-gmap` command that orchestrates four phases: (1) a Claude extract agent validates and displays all search parameters before any scraping begins; (2) the Apify Google Maps actor (configured via MCP) scrapes 12 category/city combinations — 4 categories × 3 cities — targeting 80+ contacts per job; (3) the raw data is normalized, deduplicated, and filtered against ICP criteria; (4) the clean dataset is exported as CSV to `outputs/leads/gmap-extracts/` with instructions for Google Sheets import. The end result is 900+ structured business contacts ready for SolIA outreach — produced in a single command run.

### Why This Matters

The current Google Maps prospecting process is entirely manual: the user searches Maps by hand, reads each listing, and builds a prospect list one business at a time — capping weekly research at 30–40 businesses per session. Automating this extraction means going from ~40 manually reviewed listings per week to hundreds of pre-qualified contacts generated programmatically, dramatically accelerating the lead pipeline. This command also serves as a direct demonstration of what SolIA's parent business (AI OS for Business) builds for clients — turning a manual, time-intensive workflow into a repeatable AI-driven system.

---

## Current State

### Relevant Existing Structure

- `reference/google-maps-prospecting.md` — Step-by-step manual prospecting guide; the process this command automates
- `context/lead-generation.md` — ICP definitions, qualifying signals, target categories, and green/red flags; source of truth for what to extract and filter
- `context/business-info.md` — Acquisition channels: "Google Maps prospecting → cold call / WhatsApp" is already the primary channel
- `outputs/leads/leads-log.md` — Current lead tracking table; extracted leads will feed into this after manual triage
- `.claude/commands/weekly-leads.md` — Downstream beneficiary: a larger prospect pool makes weekly outreach planning more productive
- `.claude/skills/mcp-integration/SKILL.md` — MCP integration skill with full documentation on stdio, SSE, HTTP, WebSocket server types
- No `.mcp.json` at project root (no MCP servers configured yet)
- No `scripts/` content (no existing automation scripts)
- No `outputs/leads/gmap-extracts/` directory (bulk extraction output structure doesn't exist)

### Gaps or Problems Being Addressed

- No automated Google Maps data extraction exists — all prospecting is manual
- No Apify or external scraper integration anywhere in the workspace
- No MCP server configured at the project level (`.mcp.json` doesn't exist)
- No bulk lead output structure — `outputs/leads/` only has `leads-log.md`
- No normalization or deduplication pipeline
- No Google Sheets export workflow — data currently lives only in markdown logs
- The current process cannot produce the volume needed to build a pipeline of 50–100 prospects ahead of weekly outreach calls

---

## Proposed Changes

### Summary of Changes

- Create `.mcp.json` at project root — configures the Apify MCP server (`@apify/actors-mcp-server`) as a stdio process
- Create `reference/gmap-search-params.md` — canonical parameter file: cities, categories, keywords, Apify actor config, normalization rules, and output schema
- Create `.claude/commands/extract-leads-gmap.md` — the main command with 4 phases: validate, scrape, normalize, export
- Update `CLAUDE.md` — add `/extract-leads-gmap` to the Commands section with description and requirements

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `.mcp.json` | Project-level MCP configuration enabling Apify actor tools in Claude sessions |
| `reference/gmap-search-params.md` | Canonical source for all search parameters, Apify actor config, normalization rules, and output schema |
| `.claude/commands/extract-leads-gmap.md` | The command Claude executes: 4-phase extraction pipeline |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `CLAUDE.md` | Add `/extract-leads-gmap` entry to the Commands section |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Apify as the scraper via MCP**: Apify's `compass/crawler-google-places` actor is the most production-ready Google Maps extraction tool available — handles anti-bot measures, pagination, and returns clean structured JSON. The `@apify/actors-mcp-server` (stdio MCP via `npx`) exposes Apify actors as Claude tools without requiring custom scripts, making it the cleanest integration. The `APIFY_TOKEN` is passed as an environment variable so it never appears in committed files.

2. **12 independent jobs (4 categories × 3 cities)**: Each category/city pair runs as a separate Apify actor job. This gives granular progress visibility, allows partial re-runs if one job fails, and produces clean per-dimension output. Jobs run sequentially to respect Apify rate limits and make progress readable.

3. **Phase 1 extract agent as a mandatory validation gate**: Before triggering any scraping (which consumes Apify compute credits), Claude displays the full 12-job parameter matrix and waits for user confirmation. This prevents wasted runs from misconfiguration and gives the user a chance to adjust keywords or exclude a city. This is the "extract agent" function requested — Claude acting as the parameter definer and validator.

4. **CSV export as primary output, Google Sheets as instructed import**: Full Google Sheets API OAuth setup (service account or user OAuth) is a significant first-run burden and out of scope for this plan. The command saves normalized data to `outputs/leads/gmap-extracts/YYYY-MM-DD/` as structured CSV files and provides clear manual import instructions. A Google Sheets MCP integration can be added in a future plan once the scraping pipeline is validated and working.

5. **Deduplication by phone OR Maps URL**: A business can appear under multiple search queries (e.g., a dental clinic appearing in both "clínica médica" and "dentista" searches). Deduplication using the normalized phone number OR the Maps URL as a composite key ensures the same business isn't contacted twice from a single extraction run.

6. **Phone required as a filter (ICP alignment)**: Consistent with `context/lead-generation.md` green flag #1 — "Phone number visible on Google Maps (required)." Records extracted without a phone number are removed during normalization. This keeps the output actionable for cold calling.

7. **`reference/gmap-search-params.md` as a separate file**: Search parameters are a stable operational configuration — categories, cities, and keywords will be reused, adjusted, and extended over time (e.g., adding Concepción). Keeping them in `reference/` (not embedded in the command) makes them easy to edit without touching the command logic, and documents the configuration for future sessions.

### Alternatives Considered

- **Direct Apify REST API via Bash**: Could call Apify's HTTP API with curl, but requires manual JSON parsing, error handling, and polling for job completion. The MCP server abstracts all of this and lets Claude interact with Apify naturally as a tool call.
- **Other scrapers (Outscraper, Serper.dev, PhantomBuster)**: Apify's Google Maps actor is the most popular, best-maintained, and most consistent for this use case. Apify also has a first-party MCP server package, making it the natural choice.
- **One broad search per city**: Running one search per city (e.g., "negocios locales Santiago") and filtering by category afterward risks poor result quality — Google Maps search is category-sensitive. Per-keyword searches return more precise and complete results per category.
- **Google Sheets MCP server now**: The `@modelcontextprotocol/server-google-sheets` community package exists but requires Google Cloud OAuth setup (service account JSON or user consent flow). This is a non-trivial prerequisite that would block the primary scraping feature from being usable. Deferring to Phase 2 is the right call.
- **Embedding search params in the command file**: Would work, but creates a long, hard-to-scan command file and makes it harder to adjust parameters without reading through command logic. The reference file pattern is used elsewhere in this workspace (`context/lead-generation.md` references `reference/google-maps-prospecting.md`).

### Open Questions (if any)

1. **Apify account & token**: Implementation requires an active Apify account with a valid API token. The plan assumes this exists. If the user does not have an account, Step 2 notes setup instructions. Apify's free tier includes 5 compute units/month (enough for ~1 full 12-job run); a $49/month plan covers regular use.

2. **Google Sheets organization preference**: Plan defaults to one sheet per city (3 sheets: Santiago, Viña del Mar, Valparaíso) with a `category` column for filtering. If the user prefers one sheet per category (4 sheets) or a combined single sheet, the command file's Phase 4 section should be adjusted before implementation.

3. **Node.js availability**: The `npx` command used to run the Apify MCP server requires Node.js installed. On Windows, this is typically available if Node.js is installed. The plan assumes Node.js is available — verify with `node --version` before running.

---

## Step-by-Step Tasks

Execute these tasks in order during implementation.

### Step 1: Create `reference/gmap-search-params.md`

Create the canonical reference document for all search parameters. This file is read during Phase 1 of the command (parameter validation) and is the single place to update when adding cities, categories, or adjusting keywords.

**Actions:**

- Create `reference/gmap-search-params.md` with the full content below
- Include: city definitions, category definitions with primary + secondary keywords, Apify actor input config template, raw field → normalized field mapping, normalization rules, and the complete output schema

**Full file content:**

```markdown
# Google Maps Extraction — Search Parameters

> Canonical configuration used by /extract-leads-gmap. Edit this file to add cities, categories, or adjust keywords. Do not edit the command file directly for parameter changes.

---

## Target Cities

| City ID | Search Name | Region | Country Code |
| --- | --- | --- | --- |
| `santiago` | Santiago | Región Metropolitana | CL |
| `vina-del-mar` | Viña del Mar | Valparaíso | CL |
| `valparaiso` | Valparaíso | Valparaíso | CL |

**Note:** Use Spanish accented city names in search queries — they return more accurate local results from Google Maps.

---

## Target Categories

| Category ID | Primary Search Term | Secondary Search Terms | Min Target Results |
| --- | --- | --- | --- |
| `dentistas` | `dentista {city}` | `clínica dental {city}`, `odontólogo {city}` | 80 |
| `abogados` | `abogado {city}` | `bufete de abogados {city}`, `estudio jurídico {city}` | 80 |
| `clinicas` | `clínica médica {city}` | `policlínico {city}`, `centro médico {city}` | 80 |
| `inmobiliarias` | `inmobiliaria {city}` | `agencia inmobiliaria {city}`, `corredor de propiedades {city}` | 80 |

**Job matrix:** 4 categories × 3 cities = **12 scraping jobs** → target **960+ total records** before deduplication.

---

## Apify Actor Configuration

**Actor:** `compass/crawler-google-places`

**Per-job input template:**

```json
{
  "searchStringsArray": ["{primary_keyword}"],
  "maxCrawledPlacesPerSearch": 100,
  "language": "es",
  "countryCode": "CL",
  "includeReviews": false,
  "maxReviews": 0,
  "scrapeReviewerData": false,
  "exportPlaceUrls": true
}
```

Replace `{primary_keyword}` with the Primary Search Term for each job (e.g., `dentista Santiago`).

---

## Field Mapping: Apify Raw → Normalized

| Apify Field | Normalized Field | Notes |
| --- | --- | --- |
| `title` | `business_name` | Required |
| `categoryName` | `category_raw` | Then overwrite with category ID |
| `address` | `address` | Full street address |
| `phone` | `phone` | Normalize to +56 format |
| `website` | `website` | URL or empty string |
| `url` | `maps_url` | Full Google Maps URL |
| `totalScore` | `rating` | Float 1.0–5.0 or null |
| `reviewsCount` | `review_count` | Integer, 0 or positive |
| `permanentlyClosed` | _(filter)_ | Remove if true |
| _(added)_ | `category` | Category ID from the job config |
| _(added)_ | `city` | City name from the job config |
| _(added)_ | `extracted_date` | YYYY-MM-DD (today) |
| _(added)_ | `source_query` | Exact search string used in this job |

---

## Normalization Rules

1. **Remove permanently closed**: Drop records where `permanentlyClosed = true`
2. **Normalize phone numbers**:
   - Strip all non-numeric characters
   - If 9 digits and starts with 9: prepend `+56` (Chilean mobile → `+569XXXXXXXX`)
   - If 8 digits and starts with 2: prepend `+562` (Santiago landline → `+562XXXXXXXX`)
   - If 8 digits (other): prepend `+56` + first digit as area code
   - If < 7 digits after stripping: mark phone as empty (invalid)
3. **Filter: no contact info**: Remove records where both `phone` (after normalization) AND `website` are empty
4. **Deduplicate**: Group by normalized `phone` OR `maps_url` — keep the first occurrence (by order in the dataset), drop subsequent duplicates. A business appearing in multiple search queries is deduplicated here.
5. **Category override**: Replace `category_raw` with the job's category ID (e.g., `dentistas`) for consistent grouping across the dataset
6. **Sort**: `city` ASC → `category` ASC → `review_count` DESC

---

## Output Schema (Normalized)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `business_name` | string | Yes | |
| `category` | string | Yes | One of: dentistas, abogados, clinicas, inmobiliarias |
| `city` | string | Yes | One of: Santiago, Viña del Mar, Valparaíso |
| `address` | string | No | Full street address |
| `phone` | string | No | +56 format; empty if not available |
| `website` | string | No | URL; empty if not available |
| `maps_url` | string | Yes | Full Google Maps URL |
| `rating` | float | No | 1.0–5.0; null if no reviews |
| `review_count` | int | No | 0 or positive |
| `extracted_date` | string | Yes | YYYY-MM-DD |
| `source_query` | string | Yes | Exact Apify search string used |

---

## ICP Qualification Signals (for manual review after extraction)

Extracted records are not pre-filtered by these — they are guidance for prioritizing which leads to call first:

**High priority (call first):**
- `review_count` ≥ 20 (high customer volume = high call volume)
- `rating` between 3.5–4.5 (active business, room for improvement)
- `phone` is populated (required for SolIA outreach)
- `website` is populated (indicates some digital maturity)

**Lower priority / deprioritize:**
- `review_count` < 5 (too small or new)
- `rating` > 4.8 with few reviews (possibly not yet volume-oriented)
- `phone` is empty (cannot call — use website contact only)
```

**Files affected:**

- `reference/gmap-search-params.md` (create new)

---

### Step 2: Create `.mcp.json` at project root

Configure the Apify MCP server for the workspace. This enables Claude to call Apify actors as MCP tools during `/extract-leads-gmap` execution. Uses `npx` to run the official `@apify/actors-mcp-server` package as a stdio process — no local installation required.

**Actions:**

- Create `C:\ClaudeCode\.mcp.json` with the content below
- The `APIFY_TOKEN` is referenced as an environment variable — it must be set in the user's shell before running any command that uses Apify tools

**Full file content:**

```json
{
  "apify": {
    "command": "npx",
    "args": ["-y", "@apify/actors-mcp-server"],
    "env": {
      "APIFY_TOKEN": "${APIFY_TOKEN}"
    }
  }
}
```

**Setup instructions to note (will also appear in the command file prerequisites):**

The user must set `APIFY_TOKEN` as a persistent environment variable before this MCP server will function:

1. Log in to [apify.com](https://apify.com)
2. Go to Account → Integrations → API tokens → Copy the token
3. On Windows (persistent): Add `APIFY_TOKEN` as a User environment variable via System Properties → Environment Variables
4. Verify: open a new terminal and run `echo $APIFY_TOKEN` (bash) — should return the token value
5. After setting the variable, restart Claude Code so the new env var is picked up by the MCP server process

**Files affected:**

- `.mcp.json` (create at project root `C:\ClaudeCode\.mcp.json`)

---

### Step 3: Create `.claude/commands/extract-leads-gmap.md`

Create the main command file. This is what Claude executes in full when `/extract-leads-gmap` is invoked. The command is self-contained: it defines all 4 phases, references the params file, specifies Apify actor inputs, describes normalization, and formats the final report.

**Actions:**

- Create `.claude/commands/extract-leads-gmap.md` with the full content below
- Follow the pattern of existing commands: clear section headers, declarative instructions for Claude to follow, explicit output format

**Full file content:**

```markdown
# Extract Leads — Google Maps (Chile)

> Automated extraction of structured business leads from Google Maps for SolIA outreach. Scrapes 4 categories across 3 Chilean cities using Apify via MCP, normalizes results, and exports to CSV with Google Sheets import instructions.

---

## Prerequisites

Before starting, verify:

- [ ] `APIFY_TOKEN` is set in the environment (`echo $APIFY_TOKEN` returns a value)
- [ ] Node.js is installed (`node --version` returns a version)
- [ ] The Apify MCP server is configured in `.mcp.json` (present at project root)
- [ ] The `compass/crawler-google-places` actor is accessible on the Apify account linked to the token

If any prerequisite fails, stop and display a clear error message with remediation instructions before proceeding.

---

## Phase 1: Validate Search Parameters (Extract Agent)

Read `reference/gmap-search-params.md` and act as the extract agent: confirm, display, and validate all search parameters before triggering any scraping.

**Display the full job matrix:**

| Job # | Category | City | Search Query | Min Target |
| --- | --- | --- | --- | --- |
| 1 | Dentistas | Santiago | dentista Santiago | 80 |
| 2 | Dentistas | Viña del Mar | dentista Viña del Mar | 80 |
| 3 | Dentistas | Valparaíso | dentista Valparaíso | 80 |
| 4 | Abogados | Santiago | abogado Santiago | 80 |
| 5 | Abogados | Viña del Mar | abogado Viña del Mar | 80 |
| 6 | Abogados | Valparaíso | abogado Valparaíso | 80 |
| 7 | Clínicas | Santiago | clínica médica Santiago | 80 |
| 8 | Clínicas | Viña del Mar | clínica médica Viña del Mar | 80 |
| 9 | Clínicas | Valparaíso | clínica médica Valparaíso | 80 |
| 10 | Inmobiliarias | Santiago | inmobiliaria Santiago | 80 |
| 11 | Inmobiliarias | Viña del Mar | inmobiliaria Viña del Mar | 80 |
| 12 | Inmobiliarias | Valparaíso | inmobiliaria Valparaíso | 80 |

**Total:** 12 jobs · 100 results requested per job · estimated 900–1,200 raw records before deduplication.

**Ask the user:**

> "Ready to run all 12 jobs? You can also say: skip a city, change a keyword, or adjust the result limit per job. Confirm to proceed or describe changes."

Do not proceed to Phase 2 until the user explicitly confirms.

---

## Phase 2: Scrape via Apify MCP

For each of the 12 confirmed jobs, use the Apify MCP tool to run the `compass/crawler-google-places` actor.

**Per-job execution:**

1. Call the Apify MCP tool to start an actor run with this input:
   ```json
   {
     "searchStringsArray": ["{search_query}"],
     "maxCrawledPlacesPerSearch": 100,
     "language": "es",
     "countryCode": "CL",
     "includeReviews": false,
     "maxReviews": 0,
     "scrapeReviewerData": false,
     "exportPlaceUrls": true
   }
   ```
   Replace `{search_query}` with the exact query for this job (e.g., `dentista Santiago`).

2. Wait for the actor run to reach `SUCCEEDED` status.

3. Retrieve the full dataset from the actor run.

4. Log the result: `Job {N}/12 complete: "{query}" — {count} records returned`

5. If a job fails or returns 0 results: log the error, note it in the final report, and continue to the next job. Do not retry automatically.

**Run all 12 jobs sequentially.** Display progress after each job completes.

Store all raw results in memory, tagged with the job's `category` and `city` for use in Phase 3.

---

## Phase 3: Normalize & Clean

After all 12 jobs complete, process the combined raw dataset using the rules in `reference/gmap-search-params.md` (Field Mapping and Normalization Rules sections).

**Processing steps (in order):**

1. **Map fields**: Apply the Apify raw → normalized field mapping from the params file
2. **Add metadata fields**: Set `category` (from job config), `city` (from job config), `extracted_date` (today's date, YYYY-MM-DD), `source_query` (exact search string)
3. **Remove permanently closed**: Drop records where `permanentlyClosed = true`
4. **Normalize phone numbers**: Apply the phone normalization rules from the params file
5. **Filter no-contact records**: Remove records where both `phone` (after normalization) and `website` are empty
6. **Deduplicate**: Remove duplicate records by matching normalized `phone` OR `maps_url` — keep first occurrence
7. **Sort**: `city` ASC → `category` ASC → `review_count` DESC

**Display normalization stats:**

```
Normalization complete:
  Raw records from Apify:       {N}
  Removed (permanently closed): {N}
  Removed (no contact info):    {N}
  Removed (duplicates):         {N}
  ─────────────────────────────────
  Final clean records:          {N}
```

---

## Phase 4: Export

### Local Export (Primary — Always Run)

Save results to `outputs/leads/gmap-extracts/{YYYY-MM-DD}/` (create directory if it doesn't exist).

**Files to create:**

| Filename | Contents |
| --- | --- |
| `leads-all.csv` | Full normalized dataset, all cities and categories, CSV format |
| `leads-santiago.csv` | Santiago records only |
| `leads-vina-del-mar.csv` | Viña del Mar records only |
| `leads-valparaiso.csv` | Valparaíso records only |
| `extraction-summary.md` | Run summary: timestamp, job results, stats, file paths |

**CSV column order:** `business_name`, `category`, `city`, `address`, `phone`, `website`, `maps_url`, `rating`, `review_count`, `extracted_date`, `source_query`

**`extraction-summary.md` contents:**

```markdown
# Extraction Summary — {YYYY-MM-DD}

**Run date:** {YYYY-MM-DD HH:MM}
**Command:** /extract-leads-gmap
**Total clean records:** {N}

## Results by Job

| Job | Query | Raw | Clean |
| --- | --- | --- | --- |
| 1 | dentista Santiago | {N} | {N} |
... (all 12 rows)

## Files
- `leads-all.csv` — {N} records
- `leads-santiago.csv` — {N} records
- `leads-vina-del-mar.csv` — {N} records
- `leads-valparaiso.csv` — {N} records
```

### Google Sheets Import (Manual — Provide Instructions)

After saving CSV files, display these instructions:

> **To import into Google Sheets:**
> 1. Open [sheets.google.com](https://sheets.google.com) → create a new spreadsheet named `GMap Leads — {YYYY-MM-DD}`
> 2. File → Import → Upload → select `leads-all.csv` from `outputs/leads/gmap-extracts/{YYYY-MM-DD}/`
> 3. Import settings: Separator type = Comma; Convert text to numbers/dates/formulas = No (keeps phones as text)
> 4. After import: freeze row 1 (headers), add a filter (Data → Create a filter), and color-code by `city` or `category` for easier navigation
> 5. For separate sheets per city: create 3 additional sheets (Santiago, Viña del Mar, Valparaíso) and paste the respective per-city CSV data into each

---

## Report

Provide a final extraction report:

### Results Table

| City | Dentistas | Abogados | Clínicas | Inmobiliarias | City Total |
| --- | --- | --- | --- | --- | --- |
| Santiago | {N} | {N} | {N} | {N} | {N} |
| Viña del Mar | {N} | {N} | {N} | {N} | {N} |
| Valparaíso | {N} | {N} | {N} | {N} | {N} |
| **Total** | {N} | {N} | {N} | {N} | **{N}** |

### Data Quality

- Deduplication removed: {N} records
- No-contact-info removed: {N} records
- Permanently closed removed: {N} records
- Jobs returning < 80 results: {list or "none"}

### Output Files

- `outputs/leads/gmap-extracts/{YYYY-MM-DD}/leads-all.csv`
- `outputs/leads/gmap-extracts/{YYYY-MM-DD}/leads-santiago.csv`
- `outputs/leads/gmap-extracts/{YYYY-MM-DD}/leads-vina-del-mar.csv`
- `outputs/leads/gmap-extracts/{YYYY-MM-DD}/leads-valparaiso.csv`
- `outputs/leads/gmap-extracts/{YYYY-MM-DD}/extraction-summary.md`

### Top 10 Priority Prospects

List the 10 businesses with the highest `review_count` across all cities and categories:

| Business Name | Category | City | Phone | Review Count | Rating |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... |

### Next Steps

1. Import `leads-all.csv` to Google Sheets (see instructions above)
2. Filter by priority city/category for this week's outreach (Santiago dentistas and clinicas are highest-volume)
3. Use `reference/google-maps-prospecting.md` to qualify and prioritize — check review count and read reviews for pain signals before calling
4. Add selected prospects to `outputs/leads/leads-log.md` for tracking
5. Use `reference/outreach-scripts.md` for cold call and WhatsApp scripts
```

**Files affected:**

- `.claude/commands/extract-leads-gmap.md` (create new)

---

### Step 4: Update `CLAUDE.md`

Add the `/extract-leads-gmap` command to the Commands section in `CLAUDE.md`. This keeps the workspace documentation current so `/prime` sessions accurately reflect all available commands.

**Actions:**

- Read `CLAUDE.md` to locate the Commands section
- Add a new `### /extract-leads-gmap` subsection after the `### /weekly-leads` block

**Exact text to insert** (after the `/weekly-leads` block):

```markdown
### /extract-leads-gmap

**Purpose:** Bulk-extract structured business leads from Google Maps for SolIA outreach.

Run to automatically scrape 4 business categories (dentists, lawyers, medical clinics, real estate agents) across 3 Chilean cities (Santiago, Viña del Mar, Valparaíso). Targets 80+ contacts per category/city combination (12 total jobs). Normalizes, deduplicates, and exports results to `outputs/leads/gmap-extracts/YYYY-MM-DD/` as CSV files, with Google Sheets import instructions.

**Requires:** `APIFY_TOKEN` environment variable set; Node.js installed; Apify account with `compass/crawler-google-places` actor.

**Output:** `outputs/leads/gmap-extracts/YYYY-MM-DD/` (leads-all.csv, per-city CSVs, extraction-summary.md)
```

**Files affected:**

- `CLAUDE.md` (modify Commands section)

---

## Connections & Dependencies

### Files That Reference This Area

- `context/lead-generation.md` — ICP criteria and qualifying signals are the basis for what the extract agent validates and what post-extraction filtering removes
- `reference/google-maps-prospecting.md` — The manual process that this command automates; referenced in the report's "Next Steps" for manual qualification guidance
- `outputs/leads/leads-log.md` — Downstream: selected contacts from gmap-extracts are added here after manual triage
- `.claude/commands/weekly-leads.md` — Benefits indirectly from a larger prospect pool; no changes needed

### Updates Needed for Consistency

- After implementation, run `/prime` to verify the new command appears in Claude's session summary
- `reference/gmap-search-params.md` is the place to update when adding new cities (Concepción, Antofagasta) or new categories (veterinarias, centros de estética)
- If new categories are added to `context/lead-generation.md` ICP, add them to `reference/gmap-search-params.md` and the Phase 1 job matrix in the command file

### Impact on Existing Workflows

- `/weekly-leads` is unaffected — it continues to read `outputs/leads/leads-log.md`; the new command feeds prospects into the pipeline that eventually populates that log
- `reference/google-maps-prospecting.md` (manual guide) remains valid and useful for qualifying which extracted leads to call first
- No existing commands are modified or broken

---

## Validation Checklist

- [ ] `.mcp.json` exists at `C:\ClaudeCode\.mcp.json` and is valid JSON
- [ ] `reference/gmap-search-params.md` exists with cities table, categories table, Apify config, field mapping, normalization rules, and output schema
- [ ] `.claude/commands/extract-leads-gmap.md` exists with all 4 phases (validate, scrape, normalize, export) fully documented
- [ ] `CLAUDE.md` Commands section includes a `/extract-leads-gmap` entry with description, requirements, and output path
- [ ] Running `/prime` lists `/extract-leads-gmap` among available commands
- [ ] When `/extract-leads-gmap` is invoked, Phase 1 displays the 12-job matrix and waits for user confirmation before proceeding
- [ ] (Requires APIFY_TOKEN) Phase 2 triggers Apify actor runs and logs job progress after each of the 12 jobs
- [ ] Phase 3 displays normalization stats (raw → removed → clean)
- [ ] Phase 4 creates `outputs/leads/gmap-extracts/YYYY-MM-DD/` with all 5 output files
- [ ] Final report includes results table by city/category, data quality stats, file paths, and Top 10 prospects list

---

## Success Criteria

The implementation is complete when:

1. `/extract-leads-gmap` is a recognized command that Claude executes in full — Phase 1 displays the 12-job parameter matrix and explicitly waits for user confirmation before any Apify API call is made
2. The Apify MCP server is configured in `.mcp.json` such that, when `APIFY_TOKEN` is set in the environment, Claude can call Apify actor tools during the command session
3. All 4 files are created (`reference/gmap-search-params.md`, `.mcp.json`, `.claude/commands/extract-leads-gmap.md`) and `CLAUDE.md` is updated — with no placeholder text remaining in any file
4. The command's output structure (`outputs/leads/gmap-extracts/YYYY-MM-DD/`) and file format (CSV with 11-column normalized schema) are fully specified and producible without further clarification

---

## Notes

- **Apify credit budget**: `compass/crawler-google-places` costs approximately 1 compute unit per ~100 results. At 12 jobs × 100 = ~1,200 records, this is ~12 compute units per full run. Apify's free tier includes 5 compute units/month (half a run); the $49/month Starter plan includes 200 (16+ full runs/month). Verify credit balance before running.

- **Node.js requirement**: The `@apify/actors-mcp-server` runs via `npx`, which requires Node.js. On Windows, verify Node.js is installed: `node --version`. If not installed, download from nodejs.org.

- **Future Phase 2 — Google Sheets MCP**: Once the scraping pipeline is validated and producing good results, add a Google Sheets MCP server to `.mcp.json` for automated export. Options: `@modelcontextprotocol/server-google-sheets` (community) or a custom server. This would add Phase 4 automation: create spreadsheet → create sheets → write rows → share URL.

- **Future — additional cities**: Concepción, Antofagasta, Rancagua, and Temuco are natural next targets for SolIA (large urban centers with high business density). Adding them requires only a new row in `reference/gmap-search-params.md` and updating the Phase 1 job matrix in the command. Total jobs would scale from 12 to 4×N cities.

- **Future — additional categories**: Veterinarias, centros de estética, talleres mecánicos, and contadores are in the ICP (`context/lead-generation.md`) but not in the initial extraction. Adding them follows the same pattern: new row in params file, update command job matrix.

- **Future — scheduling**: The extraction could run on a bi-weekly or monthly cadence to refresh the prospect pool with new businesses and updated review counts. A cron job or Windows Task Scheduler entry could trigger the command and append results to a master Google Sheet.

- **Connection to manual workflow**: The automated extraction produces raw volume. The manual qualification process in `reference/google-maps-prospecting.md` — especially reading reviews for pain signals — still applies for prioritizing which extracted leads to call first. The extraction gives you the list; the manual guide teaches you how to prioritize within it.

- **Secondary search terms**: The params file documents secondary search terms per category (e.g., `clínica dental` alongside `dentista`). These are not used in the initial 12-job run to keep scope manageable. They can be added as additional jobs in a follow-up run if the primary queries return fewer results than expected in smaller cities like Valparaíso.

---

## Implementation Notes

**Implemented:** 2026-02-24

### Summary

All 4 steps executed in full. Created `reference/gmap-search-params.md` (canonical search config, Apify actor config, normalization rules, output schema). Created `.mcp.json` at project root (Apify MCP server via npx, APIFY_TOKEN from env). Created `.claude/commands/extract-leads-gmap.md` (4-phase command: validate → scrape → normalize → export, with prerequisites checklist, phase-by-phase instructions, and full report format). Updated `CLAUDE.md`: added `/extract-leads-gmap` to Commands section, updated Workspace Structure tree to include `.mcp.json` and `outputs/leads/gmap-extracts/`, updated Key directories table.

### Deviations from Plan

- Added a more detailed prerequisites section to the command file — included explicit remediation instructions for missing `APIFY_TOKEN` and missing Node.js (links to setup steps). The plan specified a checklist but didn't include the remediation text inline; adding it makes the command fully self-contained.
- Updated the Workspace Structure section in `CLAUDE.md` (tree diagram and Key directories table) to include `.mcp.json` and the new `outputs/leads/gmap-extracts/` subdirectory. The plan only specified adding to the Commands section, but the CLAUDE.md "Critical Instruction" requires updating structure documentation when new files/directories are added.
- Expanded the `extraction-summary.md` template in the command file to include all 12 job rows (the plan showed a truncated `...` — expanded to be unambiguous for Claude when executing).

### Issues Encountered

None.
