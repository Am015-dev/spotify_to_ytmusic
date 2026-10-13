// Mutation proof for scenarios: a scenario that still passes on a broken build is useless.
// For every scenario of a game this opens the page at 390x763, breaks the feature it claims to test (shell/gx-scenario.js GXS.mutate) and runs
// the scenario again: it must FAIL. Mutants (derived from the scenario's own checks, plus its declared `mut:[{name, js}]` engine mutants):
//   dead   - the tapped element's click/touch handlers do nothing        throw - the handler throws
//   named  - the scenario's own engine mutant (change a cost, swap a score, skip the refill ...)
//   num    - an on-screen number is off by one                           (these four are BEHAVIOUR mutants)
//   hide / font / cover - the element is hidden, shrunk to 8 px, or covered  (presentation mutants)
// A scenario with no mutant at all is UNPROVEN and counts as a survivor. Kill rate target: >= 90% (exit 1 below --min, default 90).
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/scenario-mutate.js <slug...> [--only <scn-id>] [--min 90] [--list]
// Env: GX_URL (else a private server over games-src/.staging + games/), JOBS (default 3), SCN_NOINV=1 (old behaviour: no invariants; to measure a "before" rate).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const gx = require('./gx-serve.js');
const T = require('./scenario-test.js');
const args = process.argv.slice(2), slugs = []; let only = null, min = 90;
for (let i = 0; i < args.length; i++) { if (args[i] === '--only') only = args[++i]; else if (args[i] === '--min') min = +args[++i]; else if (!args[i].startsWith('--')) slugs.push(args[i]); }
const JOBS = +process.env.JOBS || 3, SZ = T.SIZES[0], BEHAVIOUR = new Set(['dead', 'throw', 'named', 'num']);
const uniq = a => [...new Set(a.filter(Boolean))];

function mutantsOf(info) {
  const cs = info.checks || [], act = uniq(cs.filter(c => c.kind === 'tap' || c.kind === 'hold').map(c => c.sel).concat(...cs.filter(c => c.kind === 'play').map(c => c.sels || [])));
  const vis = uniq(cs.filter(c => c.kind === 'visible' || c.kind === 'text').map(c => c.sel)), txt = uniq(cs.filter(c => c.kind === 'text').map(c => c.sel));
  const eqs = uniq(cs.filter(c => c.kind === 'eq').map(c => c.eqsel)), m = [];
  (info.mut || []).forEach(n => m.push({ t: 'named', name: n }));
  act.slice(0, 4).forEach(sel => m.push({ t: 'dead', sel }));
  if (act[0]) m.push({ t: 'throw', sel: act[0] });
  eqs.slice(0, 2).forEach(sel => m.push({ t: 'num', sel }));
  if (info.engine) m.push({ t: 'num', sel: '[data-engine]' });   // an on-screen engine number that is off by one must be caught by the data-engine invariant
  if (info.glowN) m.push({ t: 'dead', sel: info.glowSel });   // a glowing legal target whose handler is dead
  act.slice(0, 1).concat(vis.slice(0, 2)).forEach(sel => m.push({ t: 'hide', sel }));
  txt.slice(0, 1).forEach(sel => m.push({ t: 'font', sel }));
  vis.slice(0, 1).forEach(sel => m.push({ t: 'cover', sel }));
  return m.filter((x, i) => m.findIndex(y => JSON.stringify(y) === JSON.stringify(x)) === i);
}

(async () => {
  if (!slugs.length) { console.error('usage: scenario-mutate.js <slug...> [--only id] [--min 90]'); process.exit(2); }
  let own = null, base = process.env.GX_URL;
  if (!base) { own = await gx.startServer({ stage: process.env.GX_STAGE }); base = own.base; }
  base = base.replace(/\/+$/, '');
  const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const out = {}; let bad = 0;
  for (const slug of slugs) {
    const t0 = Date.now(), { list } = await T.listScn(browser, base, slug), sel = list.filter(s => (!only || s.id === only) && s.sizes !== 'pc');
    const rows = [], jobs = []; let ix = 0;
    // 1. the unbroken scenario must pass at all, else a "kill" proves nothing
    await Promise.all(Array.from({ length: Math.min(JOBS, sel.length) || 1 }, async () => { for (;;) { const sc = sel[ix++]; if (!sc) return; const r = await T.runOne(browser, base, slug, sc, SZ); rows.push({ id: sc.id, base: r.ok, baseFails: r.fails.slice(0, 2), mutants: [], info: r.info }); } }));
    rows.sort((a, b) => a.id.localeCompare(b.id));
    for (const row of rows) if (row.base && row.info) for (const m of mutantsOf(row.info)) jobs.push([row, m]);
    ix = 0;
    await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) || 1 }, async () => { for (;;) { const j = jobs[ix++]; if (!j) return; const [row, m] = j; const r = await T.runOne(browser, base, slug, { id: row.id }, SZ, m); row.mutants.push({ m, killed: !r.ok, why: r.fails[0] || '' }); } }));
    let K = 0, N = 0, BK = 0, BN = 0; const survivors = [];
    for (const row of rows) {
      const nm = r => r.m.t + (r.m.name ? ':' + r.m.name : r.m.sel ? ' ' + r.m.sel : '');
      if (!row.base) { console.log(`  BASE-FAIL ${slug} ${row.id}: ${row.baseFails.join(' | ').slice(0, 200)}`); N += 1; BN += 1; survivors.push(row.id + ' (does not pass unbroken)'); continue; }
      if (!row.mutants.length) { console.log(`  UNPROVEN  ${slug} ${row.id}: no mutant applies`); N += 1; BN += 1; survivors.push(row.id + ' (no mutant)'); continue; }
      if (!row.mutants.some(r => BEHAVIOUR.has(r.m.t))) { console.log(`  PRESENTATION-ONLY ${slug} ${row.id}: no behaviour mutant`); BN += 1; survivors.push(row.id + ' (no behaviour mutant)'); }
      for (const r of row.mutants) { N++; if (r.killed) K++; if (BEHAVIOUR.has(r.m.t)) { BN++; if (r.killed) BK++; } if (!r.killed) survivors.push(row.id + ' ' + nm(r)); console.log(`  ${r.killed ? 'killed  ' : 'SURVIVED'} ${slug} ${row.id} ${nm(r)}${r.killed ? '  <- ' + r.why.slice(0, 70) : ''}`); }
    }
    const pct = N ? Math.round(100 * K / N) : 0, bp = BN ? Math.round(100 * BK / BN) : 0;
    console.log(`MUT ${slug} ${pct >= min ? 'ok' : 'FAIL'} killed ${K}/${N} = ${pct}%  (behaviour mutants ${BK}/${BN} = ${bp}%)  survivors: ${survivors.slice(0, 6).join('; ') || 'none'}   (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    if (pct < min) bad++;
    out[slug] = { killed: K, total: N, pct, behaviour: { killed: BK, total: BN, pct: bp }, survivors, rows: rows.map(r => ({ id: r.id, base: r.base, mutants: r.mutants })) };
  }
  const dir = process.env.SCN_OUT ? path.resolve(process.env.SCN_OUT) : path.join(__dirname, '..', '.staging', '.scn');
  fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'mutate.json'), JSON.stringify(out, null, 1));
  await browser.close(); if (own) await own.close(); process.exit(bad ? 1 : 0);
})();
