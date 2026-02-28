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
