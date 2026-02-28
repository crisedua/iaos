/**
 * Phase 3 + 4: Normalize raw Apify data and export to CSV
 * Run: node normalize-export.js
 */

const fs = require('fs');
const path = require('path');

const BASE = 'C:/ClaudeCode/outputs/leads/gmap-extracts/2026-02-25';
const RAW = path.join(BASE, 'raw');
const TODAY = '2026-02-25';

const JOBS = [
  { num: '01', query: 'dentista Santiago',           category: 'dentistas',    city: 'Santiago' },
  { num: '02', query: 'dentista Viña del Mar',        category: 'dentistas',    city: 'Viña del Mar' },
  { num: '03', query: 'dentista Valparaíso',          category: 'dentistas',    city: 'Valparaíso' },
  { num: '04', query: 'abogado Santiago',             category: 'abogados',     city: 'Santiago' },
  { num: '05', query: 'abogado Viña del Mar',         category: 'abogados',     city: 'Viña del Mar' },
  { num: '06', query: 'abogado Valparaíso',           category: 'abogados',     city: 'Valparaíso' },
  { num: '07', query: 'clínica médica Santiago',      category: 'clinicas',     city: 'Santiago' },
  { num: '08', query: 'clínica médica Viña del Mar',  category: 'clinicas',     city: 'Viña del Mar' },
  { num: '09', query: 'clínica médica Valparaíso',    category: 'clinicas',     city: 'Valparaíso' },
  { num: '10', query: 'inmobiliaria Santiago',        category: 'inmobiliarias', city: 'Santiago' },
  { num: '11', query: 'inmobiliaria Viña del Mar',    category: 'inmobiliarias', city: 'Viña del Mar' },
  { num: '12', query: 'inmobiliaria Valparaíso',      category: 'inmobiliarias', city: 'Valparaíso' },
];

// ── Phone normalization ───────────────────────────────────────────────────────
function normalizePhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) return '';
  // Already full E.164 with country code
  if (digits.startsWith('56') && digits.length >= 10) return '+' + digits;
  // 9-digit mobile starting with 9
  if (digits.length === 9 && digits.startsWith('9')) return '+56' + digits;
  // 8-digit landline starting with 2 (Santiago)
  if (digits.length === 8 && digits.startsWith('2')) return '+562' + digits;
  // 8-digit other
  if (digits.length === 8) return '+56' + digits;
  // Fallback
  if (digits.length >= 7) return '+56' + digits;
  return '';
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const CSV_COLS = [
  'business_name','category','city','address','phone','website',
  'maps_url','rating','review_count','extracted_date','source_query'
];

function toCsvRow(r) {
  return CSV_COLS.map(c => csvEscape(r[c])).join(',');
}

function writeCsv(filepath, records) {
  const header = CSV_COLS.join(',');
  const rows = records.map(toCsvRow);
  fs.writeFileSync(filepath, [header, ...rows].join('\n'), 'utf8');
}

// ── Main ──────────────────────────────────────────────────────────────────────
let rawTotal = 0;
let removedClosed = 0;
let removedNoContact = 0;
let removedDupes = 0;

const jobStats = [];
let allRecords = [];

for (const job of JOBS) {
  const file = path.join(RAW, `job-${job.num}.json`);
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  rawTotal += raw.length;

  const mapped = raw.map(r => ({
    business_name:  r.title || '',
    category:       job.category,
    city:           job.city,
    address:        r.address || '',
    phone:          normalizePhone(r.phone || r.phoneUnformatted || ''),
    website:        r.website || '',
    maps_url:       r.url || '',
    rating:         r.totalScore != null ? r.totalScore : '',
    review_count:   r.reviewsCount != null ? r.reviewsCount : 0,
    extracted_date: TODAY,
    source_query:   job.query,
    _closed:        r.permanentlyClosed === true,
  }));

  const beforeFilter = mapped.length;

  // Remove permanently closed
  const notClosed = mapped.filter(r => !r._closed);
  const closedCount = beforeFilter - notClosed.length;
  removedClosed += closedCount;

  // Remove no-contact
  const withContact = notClosed.filter(r => r.phone || r.website);
  const noContactCount = notClosed.length - withContact.length;
  removedNoContact += noContactCount;

  // Clean up internal field
  withContact.forEach(r => delete r._closed);

  jobStats.push({
    num: job.num,
    query: job.query,
    raw: raw.length,
    clean: withContact.length,
  });

  allRecords = allRecords.concat(withContact);
}

// ── Deduplication ─────────────────────────────────────────────────────────────
const seenPhone = new Set();
const seenUrl   = new Set();
const deduped   = [];

for (const r of allRecords) {
  const phoneKey = r.phone || null;
  const urlKey   = r.maps_url || null;
  const isDupe =
    (phoneKey && seenPhone.has(phoneKey)) ||
    (urlKey   && seenUrl.has(urlKey));

  if (isDupe) {
    removedDupes++;
    continue;
  }
  if (phoneKey) seenPhone.add(phoneKey);
  if (urlKey)   seenUrl.add(urlKey);
  deduped.push(r);
}

// ── Sort: city ASC → category ASC → review_count DESC ────────────────────────
deduped.sort((a, b) => {
  if (a.city < b.city) return -1;
  if (a.city > b.city) return 1;
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  return (b.review_count || 0) - (a.review_count || 0);
});

// ── Stats ─────────────────────────────────────────────────────────────────────
const finalCount = deduped.length;
console.log('\nNormalization complete:');
console.log(`  Raw records from Apify:       ${rawTotal}`);
console.log(`  Removed (permanently closed): ${removedClosed}`);
console.log(`  Removed (no contact info):    ${removedNoContact}`);
console.log(`  Removed (duplicates):         ${removedDupes}`);
console.log(`  ─────────────────────────────────`);
console.log(`  Final clean records:          ${finalCount}`);

// ── Export CSVs ───────────────────────────────────────────────────────────────
writeCsv(path.join(BASE, 'leads-all.csv'), deduped);
writeCsv(path.join(BASE, 'leads-santiago.csv'),    deduped.filter(r => r.city === 'Santiago'));
writeCsv(path.join(BASE, 'leads-vina-del-mar.csv'), deduped.filter(r => r.city === 'Viña del Mar'));
writeCsv(path.join(BASE, 'leads-valparaiso.csv'),  deduped.filter(r => r.city === 'Valparaíso'));

const cSantiago  = deduped.filter(r => r.city === 'Santiago').length;
const cVina      = deduped.filter(r => r.city === 'Viña del Mar').length;
const cValpo     = deduped.filter(r => r.city === 'Valparaíso').length;

// ── Per-city/category breakdown ───────────────────────────────────────────────
const cats = ['dentistas','abogados','clinicas','inmobiliarias'];
const cities = ['Santiago','Viña del Mar','Valparaíso'];
const grid = {};
for (const city of cities) {
  grid[city] = {};
  for (const cat of cats) {
    grid[city][cat] = deduped.filter(r => r.city === city && r.category === cat).length;
  }
}

// ── Top 10 by review_count ────────────────────────────────────────────────────
const top10 = [...deduped]
  .sort((a,b) => (b.review_count||0) - (a.review_count||0))
  .slice(0, 10);

// ── Summary MD ────────────────────────────────────────────────────────────────
const now = new Date().toISOString().replace('T',' ').slice(0,16);

const summaryRows = jobStats.map(j =>
  `| ${j.num} | ${j.query} | ${j.raw} | ${j.clean} |`
).join('\n');

const gridRows = cities.map(city => {
  const total = cats.reduce((s,c) => s + grid[city][c], 0);
  return `| ${city} | ${grid[city]['dentistas']} | ${grid[city]['abogados']} | ${grid[city]['clinicas']} | ${grid[city]['inmobiliarias']} | ${total} |`;
}).join('\n');
const totals = cats.map(c => cities.reduce((s,city) => s + grid[city][c], 0));
const grandTotal = totals.reduce((s,v) => s+v, 0);
const totalsRow = `| **Total** | ${totals[0]} | ${totals[1]} | ${totals[2]} | ${totals[3]} | **${grandTotal}** |`;

const top10Rows = top10.map(r =>
  `| ${r.business_name} | ${r.category} | ${r.city} | ${r.phone} | ${r.review_count} | ${r.rating} |`
).join('\n');

const summary = `# Extraction Summary — ${TODAY}

**Run date:** ${now}
**Command:** /extract-leads-gmap
**Total clean records:** ${finalCount}

## Results by Job

| Job | Query | Raw | Clean |
| --- | --- | --- | --- |
${summaryRows}

## Normalization Stats
- Raw total: ${rawTotal}
- Permanently closed removed: ${removedClosed}
- No contact info removed: ${removedNoContact}
- Duplicates removed: ${removedDupes}
- **Final clean records: ${finalCount}**

## Results by City & Category

| City | Dentistas | Abogados | Clínicas | Inmobiliarias | City Total |
| --- | --- | --- | --- | --- | --- |
${gridRows}
${totalsRow}

## Files
- \`leads-all.csv\` — ${finalCount} records
- \`leads-santiago.csv\` — ${cSantiago} records
- \`leads-vina-del-mar.csv\` — ${cVina} records
- \`leads-valparaiso.csv\` — ${cValpo} records

## Top 10 Priority Prospects (by review count)

| Business Name | Category | City | Phone | Review Count | Rating |
| --- | --- | --- | --- | --- | --- |
${top10Rows}
`;

fs.writeFileSync(path.join(BASE, 'extraction-summary.md'), summary, 'utf8');

console.log('\nFiles written:');
console.log(`  leads-all.csv          (${finalCount} records)`);
console.log(`  leads-santiago.csv     (${cSantiago} records)`);
console.log(`  leads-vina-del-mar.csv (${cVina} records)`);
console.log(`  leads-valparaiso.csv   (${cValpo} records)`);
console.log(`  extraction-summary.md`);

console.log('\n── Grid ──');
console.log('City           | Dent | Abog | Clin | Inmo | Total');
for (const city of cities) {
  const t = cats.reduce((s,c) => s + grid[city][c], 0);
  console.log(`${city.padEnd(14)} | ${String(grid[city]['dentistas']).padStart(4)} | ${String(grid[city]['abogados']).padStart(4)} | ${String(grid[city]['clinicas']).padStart(4)} | ${String(grid[city]['inmobiliarias']).padStart(4)} | ${t}`);
}
console.log(`${'TOTAL'.padEnd(14)} | ${totals.map(v=>String(v).padStart(4)).join(' | ')} | ${grandTotal}`);

console.log('\n── Top 10 ──');
top10.forEach((r,i) => {
  console.log(`${i+1}. ${r.business_name} | ${r.category} | ${r.city} | ${r.phone} | reviews: ${r.review_count} | rating: ${r.rating}`);
});
