#!/usr/bin/env node
// Pending-assets register check: every picture id a code hook asks for (ART.pic / ART.sp / ART.img / FXW.pic literals in parts/*.js)
// that is NOT in media/ready.json must be a row of the newest ASSETS-PENDING-<date>.md with a Flow prompt line. Prints pass/fail lines only.
//   node games-src/nightrun/pending-test.js      (regenerate the report first: python3 games-src/scripts/pending-assets.py)
const fs = require('fs'), path = require('path');
const NR = __dirname, MEDIA = path.resolve(NR, '../../games/mainhattan-nightrun/media');
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const reports = fs.readdirSync(NR).filter(f => /^ASSETS-PENDING-\d{4}-\d\d-\d\d\.md$/.test(f)).sort();
line(reports.length > 0, 'a report ASSETS-PENDING-<date>.md exists' + (reports.length ? ' (' + reports[reports.length - 1] + ')' : ''));
if (!reports.length) process.exit(1);
const md = fs.readFileSync(path.join(NR, reports[reports.length - 1]), 'utf8');
const rows = new Map();   // id -> cells
for (const l of md.split('\n')) {
  const m = /^\| `([^`]+)` \|/.exec(l); if (!m) continue;
  rows.set(m[1], l.split(/\s\|\s/).map(c => c.trim()));
}
const ready = new Set(JSON.parse(fs.readFileSync(path.join(MEDIA, 'ready.json'), 'utf8')));
const RE = /\bART\.(?:pic|sp|img|isReal|artK)\(\s*['"]([a-z0-9_.-]+)['"](\s*\+)?|\bFXW\.pic\(\s*['"]([a-z0-9_.-]+)['"]/g;
const hooks = new Map();
for (const f of fs.readdirSync(path.join(NR, 'parts')).filter(f => f.endsWith('.js'))) {
  const t = fs.readFileSync(path.join(NR, 'parts', f), 'utf8'); let m;
  while ((m = RE.exec(t))) {
    const id = m[3] ? 'fx-' + m[3] : m[1];
    if (m[2] || id.endsWith('-')) continue;   // built names ('rx-'+state) are covered through the manifest rows
    if (!hooks.has(id)) hooks.set(id, []); hooks.get(id).push(f);
  }
}
const missing = [...hooks.keys()].filter(id => !ready.has(id + '.webp') && !ready.has(id)).sort();
line(missing.length > 0 || hooks.size === 0, 'hook scan found ' + hooks.size + ' literal picture ids, ' + missing.length + ' not in ready.json');
let unreg = [], noprompt = [];
for (const id of missing) {
  const c = rows.get(id);
  if (!c) { unreg.push(id); continue; }
  // columns: id | kind | where | size | prompt | priority | status | source
  if (!c[4] || c[4].length < 20) noprompt.push(id);
}
line(unreg.length === 0, 'every hook id missing from ready.json is a row in the register' + (unreg.length ? ': NOT LISTED ' + unreg.join(', ') + ' (run pending-assets.py)' : ''));
line(noprompt.length === 0, 'every such row carries a Flow prompt line' + (noprompt.length ? ': EMPTY ' + noprompt.join(', ') : ''));
const head = /Grand total pending: (\d+) ids/.exec(md);
line(!!head && +head[1] === rows.size, 'summary total matches the table (' + (head ? head[1] : '?') + ' vs ' + rows.size + ' rows): report is not stale');
const bad = [...rows].filter(([id, c]) => c.length < 8).map(([id]) => id);
line(bad.length === 0, 'every table row has all 8 columns' + (bad.length ? ': ' + bad.slice(0, 5).join(', ') : ''));
process.exit(fails ? 1 : 0);
