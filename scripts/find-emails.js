#!/usr/bin/env node
/**
 * find-emails.js
 *
 * Crawls business websites from leads-all.csv to discover contact email
 * addresses. Saves found emails to outreach-tracker.json so send-email.js
 * can use them without re-crawling.
 *
 * For each lead with a website:
 *   1. Fetches the homepage + common contact sub-pages
 *   2. Extracts emails via regex
 *   3. Saves the best email to the tracker entry
 *
 * Usage:
 *   node scripts/find-emails.js
 *   node scripts/find-emails.js --csv outputs/leads/gmap-extracts/2026-02-25/leads-all.csv
 *   node scripts/find-emails.js --limit 50      (process first N leads with websites)
 *   node scripts/find-emails.js --delay 1500    (ms between requests, default 1000)
 *   node scripts/find-emails.js --dry-run       (show what would be crawled, no requests)
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');
const url   = require('url');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const getArg = (flag, def) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };
const CSV_PATH  = getArg('--csv', 'C:/ClaudeCode/outputs/leads/gmap-extracts/2026-02-25/leads-all.csv');
const LIMIT     = parseInt(getArg('--limit', '0'), 10);   // 0 = no limit
const DELAY_MS  = parseInt(getArg('--delay', '1000'), 10);
const DRY_RUN   = args.includes('--dry-run');

const TRACKER_PATH = 'C:/ClaudeCode/outputs/leads/outreach-tracker.json';

// ── Contact sub-pages to try ──────────────────────────────────────────────────
const CONTACT_PATHS = ['/contacto', '/contact', '/nosotros', '/about', '/equipo', '/team', '/contactenos'];

// ── Email extraction regex ────────────────────────────────────────────────────
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// ── Domains to skip as generic / unhelpful ────────────────────────────────────
const SKIP_DOMAINS = ['example.com', 'sentry.io', 'google.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'whatsapp.com', 'wixpress.com', 'shopify.com'];

// ── Prefixes to deprioritize (keep only if nothing better found) ──────────────
const LOW_PRIORITY_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'bounce', 'mailer-daemon'];

// ── CSV parser (no external deps) ────────────────────────────────────────────
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    const obj = {}; headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  });
}

// ── HTTP fetch (follows one redirect, 5s timeout) ─────────────────────────────
function fetchPage(rawUrl, timeoutMs = 5000) {
  return new Promise(resolve => {
    let resolved = false;
    const done = (result) => { if (!resolved) { resolved = true; resolve(result); } };

    let parsedUrl;
    try { parsedUrl = new URL(rawUrl); } catch { return done({ ok: false, body: '' }); }

    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      path:     parsedUrl.pathname + parsedUrl.search,
      method:   'GET',
      headers:  { 'User-Agent': 'Mozilla/5.0 (compatible; SolIA-EmailFinder/1.0)' },
      timeout:  timeoutMs,
    };

    const req = lib.request(options, res => {
      // Follow one redirect
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const redirect = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsedUrl.origin}${res.headers.location}`;
        return fetchPage(redirect, timeoutMs).then(done);
      }
      if (res.statusCode < 200 || res.statusCode >= 400) return done({ ok: false, body: '' });

      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; if (body.length > 200000) { req.destroy(); done({ ok: true, body }); } });
      res.on('end', () => done({ ok: true, body }));
    });

    req.on('error', () => done({ ok: false, body: '' }));
    req.on('timeout', () => { req.destroy(); done({ ok: false, body: '' }); });
    req.end();

    // Hard timeout fallback
    setTimeout(() => done({ ok: false, body: '' }), timeoutMs + 500);
  });
}

// ── Extract and score emails from HTML body ───────────────────────────────────
function extractEmails(html, hostname) {
  const matches = html.match(EMAIL_RE) || [];
  const seen    = new Set();
  const emails  = [];

  for (const raw of matches) {
    const email = raw.toLowerCase().trim();
    if (seen.has(email)) continue;
    seen.add(email);

    // Skip generic domains
    const domain = email.split('@')[1] || '';
    if (SKIP_DOMAINS.some(d => domain.includes(d))) continue;
    // Skip emails from completely different domains (e.g. tracking pixels)
    if (hostname && !domain.includes(hostname.replace('www.', '').split('.')[0])) {
      // Allow if it's the business hostname or a common mail provider
      const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      if (!commonProviders.includes(domain)) continue;
    }

    const prefix  = email.split('@')[0];
    const isLow   = LOW_PRIORITY_PREFIXES.some(p => prefix.startsWith(p));
    emails.push({ email, isLow });
  }

  // Return high-priority emails first; fallback to low-priority if nothing else
  const high = emails.filter(e => !e.isLow).map(e => e.email);
  const low  = emails.filter(e => e.isLow).map(e => e.email);
  return [...high, ...low];
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n── find-emails.js ────────────────────────────────`);
  console.log(`CSV:     ${CSV_PATH}`);
  console.log(`Limit:   ${LIMIT || 'none'}`);
  console.log(`Delay:   ${DELAY_MS}ms between requests`);
  console.log(`Dry run: ${DRY_RUN}\n`);

  // 1. Load CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }
  const leads = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'));
  console.log(`Loaded ${leads.length} leads from CSV.`);

  // 2. Load tracker
  let tracker = { meta: {}, contacts: {} };
  if (fs.existsSync(TRACKER_PATH)) {
    tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  }

  // 3. Filter: leads with website but no email yet in tracker
  const candidates = leads.filter(lead => {
    if (!lead.website) return false;
    const key   = lead.phone || lead.maps_url;
    const entry = key && tracker.contacts[key];
    return !entry || !entry.email;   // skip if already have email
  });

  const toProcess = LIMIT > 0 ? candidates.slice(0, LIMIT) : candidates;
  console.log(`Leads with website but no email yet: ${candidates.length}`);
  console.log(`Processing: ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log('Nothing to crawl. All leads with websites already have emails, or no websites found.');
    return;
  }

  if (DRY_RUN) {
    console.log('[DRY RUN] Would crawl these websites:');
    toProcess.forEach((lead, i) => console.log(`  ${i+1}. ${lead.business_name} → ${lead.website}`));
    console.log(`\nRemove --dry-run to execute.`);
    return;
  }

  // 4. Crawl websites
  let foundCount  = 0;
  let failedCount = 0;
  const results   = [];

  for (let i = 0; i < toProcess.length; i++) {
    const lead     = toProcess[i];
    const key      = lead.phone || lead.maps_url;
    const siteUrl  = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
    let parsedHost = '';
    try { parsedHost = new URL(siteUrl).hostname; } catch {}

    process.stdout.write(`[${i+1}/${toProcess.length}] ${lead.business_name} (${siteUrl})... `);

    let foundEmails = [];

    // Fetch homepage
    const home = await fetchPage(siteUrl);
    if (home.ok) foundEmails.push(...extractEmails(home.body, parsedHost));

    // Try contact sub-pages if homepage didn't yield emails
    if (foundEmails.length === 0) {
      const base = siteUrl.replace(/\/$/, '');
      for (const contactPath of CONTACT_PATHS) {
        const pageUrl = `${base}${contactPath}`;
        const page    = await fetchPage(pageUrl);
        if (page.ok) {
          const emails = extractEmails(page.body, parsedHost);
          if (emails.length > 0) { foundEmails.push(...emails); break; }
        }
        await sleep(300);
      }
    }

    // Deduplicate
    foundEmails = [...new Set(foundEmails)];

    if (foundEmails.length > 0) {
      const bestEmail = foundEmails[0];
      console.log(`✓ ${bestEmail}${foundEmails.length > 1 ? ` (+${foundEmails.length - 1} more)` : ''}`);
      foundCount++;
      results.push({ lead, email: bestEmail, allEmails: foundEmails });

      // Update tracker entry
      if (key) {
        if (!tracker.contacts[key]) {
          tracker.contacts[key] = {
            business_name:   lead.business_name,
            category:        lead.category,
            city:            lead.city,
            phone:           lead.phone,
            maps_url:        lead.maps_url,
            status:          'uncontacted',
            channel:         null,
            first_contacted: null,
            last_contact:    null,
            message_sent:    '',
            response_notes:  '',
            queued_date:     null,
          };
        }
        tracker.contacts[key].email      = bestEmail;
        tracker.contacts[key].all_emails = foundEmails;
        tracker.contacts[key].email_found_date = new Date().toISOString().slice(0, 10);
      }
    } else {
      console.log(`— none found`);
      failedCount++;
      // Mark that we tried to avoid re-crawling
      if (key && tracker.contacts[key]) {
        tracker.contacts[key].email_crawled = new Date().toISOString().slice(0, 10);
      }
    }

    // Save tracker after each lead (safe in case of interruption)
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    if (i < toProcess.length - 1) await sleep(DELAY_MS);
  }

  // 5. Summary
  console.log(`\n── Results ──────────────────────────────────────`);
  console.log(`Crawled:       ${toProcess.length} websites`);
  console.log(`Emails found:  ${foundCount}`);
  console.log(`None found:    ${failedCount}`);
  console.log(`Success rate:  ${Math.round((foundCount / toProcess.length) * 100)}%`);
  console.log(`\nTracker updated: ${TRACKER_PATH}`);

  if (results.length > 0) {
    console.log(`\nFound emails:`);
    results.forEach(r => console.log(`  ${r.lead.business_name} → ${r.email}`));
  }

  console.log(`\nNext step: prepare email queue and send:`);
  console.log(`  node scripts/prepare-outreach.js --channel email`);
  console.log(`  node scripts/send-email.js --preview`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
