# Extract Leads — Google Maps (Chile)

> Automated extraction of structured business leads from Google Maps for SolIA outreach. Scrapes 4 categories across 3 Chilean cities using Apify via MCP, normalizes results, and exports to CSV with Google Sheets import instructions.

---

## Prerequisites

Before starting, verify:

- [ ] `APIFY_TOKEN` is set in the environment (`echo $APIFY_TOKEN` returns a value)
- [ ] Node.js is installed (`node --version` returns a version)
- [ ] The Apify MCP server is configured in `.mcp.json` (present at project root)
- [ ] The `compass/crawler-google-places` actor is accessible on the Apify account linked to the token

**If APIFY_TOKEN is not set**, stop and display these setup instructions:

1. Create a free account at [apify.com](https://apify.com)
2. Go to Account → Integrations → API tokens → copy your token
3. On Windows: open System Properties → Environment Variables → add `APIFY_TOKEN` as a User variable
4. Restart Claude Code so the new env var is picked up by the MCP server process
5. Verify: open a terminal and run `echo $APIFY_TOKEN` — should return your token

**If Node.js is not installed**, stop and instruct: download Node.js from [nodejs.org](https://nodejs.org) (LTS version), install, then restart Claude Code.

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

**Do not proceed to Phase 2 until the user explicitly confirms.**

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

**Run all 12 jobs sequentially.** Display a progress line after each job completes.

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

**`extraction-summary.md` template:**

```markdown
# Extraction Summary — {YYYY-MM-DD}

**Run date:** {YYYY-MM-DD HH:MM}
**Command:** /extract-leads-gmap
**Total clean records:** {N}

## Results by Job

| Job | Query | Raw | Clean |
| --- | --- | --- | --- |
| 1 | dentista Santiago | {N} | {N} |
| 2 | dentista Viña del Mar | {N} | {N} |
| 3 | dentista Valparaíso | {N} | {N} |
| 4 | abogado Santiago | {N} | {N} |
| 5 | abogado Viña del Mar | {N} | {N} |
| 6 | abogado Valparaíso | {N} | {N} |
| 7 | clínica médica Santiago | {N} | {N} |
| 8 | clínica médica Viña del Mar | {N} | {N} |
| 9 | clínica médica Valparaíso | {N} | {N} |
| 10 | inmobiliaria Santiago | {N} | {N} |
| 11 | inmobiliaria Viña del Mar | {N} | {N} |
| 12 | inmobiliaria Valparaíso | {N} | {N} |

## Normalization Stats
- Raw total: {N}
- Permanently closed removed: {N}
- No contact info removed: {N}
- Duplicates removed: {N}
- **Final clean records: {N}**

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
> 3. Import settings: Separator type = Comma; Convert text to numbers/dates/formulas = **No** (keeps phones as text, not numbers)
> 4. After import: freeze row 1 (headers), then Data → Create a filter for easy sorting by city, category, or review count
> 5. For separate sheets per city: create 3 additional sheets named Santiago, Viña del Mar, Valparaíso — paste the respective per-city CSV data into each (File → Import → same steps per file)

---

## Report

Provide a final extraction report after Phase 4 completes:

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
- Jobs returning < 80 results: {list queries or "none"}

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
2. Filter by priority city/category for this week's outreach — Santiago dentistas and clinicas have the highest business density
3. Use `reference/google-maps-prospecting.md` to qualify and prioritize — check review count and read reviews for pain signals before calling
4. Add selected prospects to `outputs/leads/leads-log.md` for outreach tracking
5. Use `reference/outreach-scripts.md` for cold call openers, voicemail scripts, and WhatsApp messages
