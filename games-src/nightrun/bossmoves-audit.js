#!/usr/bin/env node
// Boss moveset audit (parts/bossmoves.js, flag RET.bossmoves). Prints numbers and PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/bossmoves-audit.js      env: PARTS=table,stress,idle,bot  DIFFS=normal,legend  RUNS=2 (bot)
// table : per boss the verbs it uses, the pairwise verb overlap matrix, unique verbs, its signature and counter, ground rules, library size
// stress: every boss fight in the real page (god ship weaving, 1e6 damage per frame: the armour cap sets the length): verbs used, shortest telegraph,
//         smallest free space (computed: the largest clear disc in the play area while hazards are live), bullets vs ebCap, speed vs BCAP, fight length
// idle  : a ship that never moves or fires dies in every boss fight (Normal)
// bot   : balance-test.js bot clear rates on the ten boss stages, flag on vs ?bossmoves=0 (Normal, mid + late builds)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const PARTS = (process.env.PARTS || 'table,stress,idle,bot').split(','), DIFFS = (process.env.DIFFS || 'normal,legend').split(',');
const BOSSES = [[5, 'tresor'], [13, 'bruecke'], [21, 'schranke'], [29, 'messe'], [37, 'hoplite'], [8, 'adler'], [16, 'krake'], [24, 'ice'], [32, 'kronos'], [40, 'talos']];
const UP = { normal: { mini: 80, dist: 120, fin: 180 }, legend: { mini: 110, dist: 170, fin: 260 } };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const FIGHT = ({ n, diff, dmg, idle }) => {
  const m = window.__mnr, B = window.BMV; m.SET.diff = diff; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); if (!idle) m.god = true;
  let t0 = null, t1 = null, kind = '', T = 0, free = 1e9, freeV = '', fr = 0, id = null, dead = false;
  for (let i = 0; i < 700 * 60 && m.running; i++) { if (m.SH.active) m.SH.close();
    if (!idle) m.touchTo(200 + 60 * Math.sin(i / 140), 270 + 190 * Math.sin(i / 90));
    const e = m.G.boss; if (e && t0 == null && e.x < 800) { t0 = m.G.t; kind = window.B2X ? window.B2X.kind(e) : ''; T = window.B2X ? window.B2X.tf(e) : 0; }
    if (e && e.x < 940 && dmg) e.hp -= dmg;
    m.step(1 / 60); if (m.G.dead) { dead = true; break; }
    const b = m.G.boss; if (b && b.bm) id = b.bm.id;
    if (b && b.bm && i % 6 === 0 && B.hz.some(z => !z.mk && m.G.t >= z.on && m.G.t < z.off)) {   // the largest clear disc in the play area right now
      const x1 = b.x - b.r - 24; let best = -1e9; for (let x = 30; x <= x1; x += 20) for (let y = 20; y <= 520; y += 15) { const c = B.clear(x, y, 0); if (c > best) best = c; if (best > 200) break; }
      if (best < free) { free = best; freeV = B.hz.filter(z => !z.mk && m.G.t >= z.on).map(z => z.v).filter((v, i, a) => a.indexOf(v) === i).join('+'); } fr++; }
    if (t0 != null && !m.G.boss) { t1 = m.G.t; break; } }
  const st = B && B.st ? B.st : {}; const out = { n, diff, id, kind, T, ttk: t1 == null ? null : +(t1 - t0).toFixed(1), dead, t: +m.G.t.toFixed(1), free: Math.round(free), freeV, fr,
    verbs: Object.fromEntries(Object.entries(st.verbs || {}).map(([k, v]) => [k, { uses: v.uses, bul: v.bul, hz: v.hz, tel: +v.tel.toFixed(2) }])), maxEb: st.maxEb, cap: st.cap, maxV: Math.round(st.maxV || 0), BCAP: m.BCAP, counter: st.counter || 0, won: st.won || 0, guardT: +(st.guardT || 0).toFixed(1) };
  m.abort(); return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); let perr = 0;
  const page = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { perr++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV, null, { timeout: 30000 }); return p; };
  const p0 = await page(); const TB = await p0.evaluate(() => { const { BMT, VB } = window.__bmv; const o = {}; for (const id in BMT) { const T = BMT[id], v = [...new Set(T.ph.flat().map(x => Array.isArray(x) ? x[0] : x))]; o[id] = { v, sig: T.sig, ctr: T.ctr, ground: !!T.ground, ph: T.ph.map(l => l.length) }; } return { o, lib: Object.keys(VB).length, kind: Object.fromEntries(Object.entries(VB).map(([k, x]) => [k, { k: x.k, sig: !!x.sig, ctr: !!x.ctr, d: x.d }])) }; });
  await p0.close();
  if (PARTS.includes('table')) {
    const ids = Object.keys(TB.o), use = {}; for (const id of ids) for (const v of TB.o[id].v) (use[v] = use[v] || []).push(id);
    console.log(`library: ${TB.lib} verbs (${Object.values(TB.kind).filter(k => k.sig).length} signatures, ${Object.values(TB.kind).filter(k => k.ctr).length} counters, ${Object.values(TB.kind).filter(k => k.k === 'ground').length} ground verbs); unused: ${Object.keys(TB.kind).filter(v => !use[v]).join(',') || 'none'}`);
    line(TB.lib >= 30, `verb library has ${TB.lib} verbs (>= 30)`);
    console.log('overlap  ' + ids.map(i => i.slice(0, 5).padStart(6)).join(''));
    let maxO = 0; for (const a of ids) { const row = ids.map(b => { if (a === b) return '     -'; const o = TB.o[a].v.filter(v => TB.o[b].v.includes(v)).length; maxO = Math.max(maxO, o); return String(o).padStart(6); }); console.log(a.padEnd(9) + row.join('')); }
    for (const id of ids) { const T = TB.o[id], uniq = T.v.filter(v => use[v].length === 1), bad = T.v.filter(v => !TB.kind[v] || (TB.kind[v].k === 'ground' && !T.ground) || (TB.kind[v].k === 'air' && T.ground));
      console.log(`${id.padEnd(9)} ${T.v.length} verbs (phases ${T.ph.join('/')}), unique ${uniq.length}: ${uniq.join(',')} | sig ${T.sig} | counter ${T.ctr}`);
      line(T.v.length >= 8, `${id}: ${T.v.length} verbs (>= 8)`);
      line(use[T.sig] && use[T.sig].length === 1 && TB.kind[T.sig].sig && use[T.ctr] && use[T.ctr].length === 1 && TB.kind[T.ctr].ctr, `${id}: signature ${T.sig} and counter ${T.ctr} are its own (found on no other boss)`);
      line(!bad.length, `${id}: ${T.ground ? 'ground boss uses ground / any verbs only' : 'air boss uses no ground verbs'}${bad.length ? ' (bad: ' + bad.join(',') + ')' : ''}`); }
    line(maxO <= 2, `pairwise verb overlap at most ${maxO} (<= 2)`);
  }
  if (PARTS.includes('stress')) {
    const jobs = []; for (const diff of DIFFS) for (const [n] of BOSSES) jobs.push({ n, diff, dmg: 1e6 });
    const pages = await Promise.all([0, 1, 2, 3].map(() => page())), res = [];
    await Promise.all(pages.map(async (p, k) => { for (let j = k; j < jobs.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV); res.push(await p.evaluate(FIGHT, jobs[j])); } await p.close(); }));
    res.sort((a, b) => a.diff.localeCompare(b.diff) || a.n - b.n);
    for (const r of res) { const vs = Object.keys(r.verbs), tel = Math.min(...Object.values(r.verbs).map(v => v.tel)), want = TB.o[r.id] ? TB.o[r.id].v : [];
      console.log(`${r.diff.padEnd(6)} ${String(r.n).padStart(2)} ${String(r.id).padEnd(8)} ${r.ttk}s (floor ${r.T}) verbs ${vs.length}/${want.length} tel>=${tel.toFixed(2)}s free disc ${2 * r.free}px (${r.freeV}) bullets ${r.maxEb}/${r.cap} speed ${r.maxV}/${r.BCAP} counters ${r.counter} guard ${r.guardT}s`);
      line(r.id && vs.length >= Math.min(8, want.length) && want.every(v => vs.includes(v)), `${r.diff} ${r.id}: every verb of the moveset ran (${vs.length}${want.filter(v => !vs.includes(v)).length ? ', missing ' + want.filter(v => !vs.includes(v)).join(',') : ''})`);
      line(tel >= .5, `${r.diff} ${r.id}: shortest telegraph ${tel.toFixed(2)} s (>= 0.5)`);
      line(2 * r.free >= 64, `${r.diff} ${r.id}: smallest free disc ${2 * r.free} px while hazards are live (>= 64: ship + margin; worst with ${r.freeV})`);
      line(r.maxEb <= r.cap && r.maxV <= r.BCAP + 1, `${r.diff} ${r.id}: bullets ${r.maxEb} <= ebCap ${r.cap}, fastest ${r.maxV} <= BCAP ${r.BCAP}`);
      line(r.ttk != null && r.ttk >= r.T && r.ttk <= UP[r.diff][r.kind], `${r.diff} ${r.id}: fight ${r.ttk} s inside ${r.T}..${UP[r.diff][r.kind]} (armour.js sets the length)`); }
  }
  if (PARTS.includes('idle')) {
    const pages = await Promise.all([0, 1, 2, 3].map(() => page())), res = [];
    await Promise.all(pages.map(async (p, k) => { for (let j = k; j < BOSSES.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV); res.push(await p.evaluate(FIGHT, { n: BOSSES[j][0], diff: 'normal', dmg: 0, idle: 1 })); } await p.close(); }));
    for (const r of res.sort((a, b) => a.n - b.n)) line(r.dead, `idle ship, Normal stage ${r.n} (${r.id || 'before the boss'}): dies (${r.dead ? 'dead at ' + r.t + ' s' : 'alive'})`);
  }
  await br.close(); srv.kill();
  if (PARTS.includes('bot')) {
    const st = BOSSES.map(b => b[0]).join(','), run = q => { const js = path.join(os.tmpdir(), 'bmv-bot' + (q ? '-off' : '') + '.json');
      cp.spawnSync('node', [path.join(__dirname, 'balance-test.js')], { env: Object.assign({}, process.env, { RUNS: process.env.RUNS || '2', PAR: '4', STAGES: st, DIFFS: 'normal', BUILDS: 'mid,late', JSON: js, GAME_DIR, Q: q }), stdio: 'ignore' });
      const r = JSON.parse(fs.readFileSync(js, 'utf8')), o = {}; for (const x of r) { const k = x.n; o[k] = o[k] || { c: 0, n: 0, f: [], h: [] }; o[k].n++; if (x.clear) o[k].c++; o[k].f.push(x.fight); o[k].h.push(x.hits); } return o; };
    const on = run(''), off = run('&bossmoves=0'); let cOn = 0, cOff = 0, nOn = 0, nOff = 0;
    for (const [n, id] of BOSSES) { const a = on[n] || { c: 0, n: 1, f: [], h: [] }, b = off[n] || { c: 0, n: 1, f: [], h: [] }; cOn += a.c; nOn += a.n; cOff += b.c; nOff += b.n;
      console.log(`bot Normal stage ${String(n).padStart(2)} ${id.padEnd(8)} clear ${a.c}/${a.n} (old ${b.c}/${b.n}) fight s ${a.f.join(',')} (old ${b.f.join(',')}) hits ${a.h.join(',')} (old ${b.h.join(',')})`); }
    line(cOn / nOn >= cOff / nOff - .15, `bot Normal boss stages: clear ${cOn}/${nOn} with the movesets vs ${cOff}/${nOff} before (not worse beyond noise, 15 points)`);
    line(cOn > 0, 'Normal bosses are beatable by the bot');
  }
  line(perr === 0, `no page errors (${perr})`);
  console.log(fails ? `FAIL bossmoves-audit (${fails})` : 'PASS bossmoves-audit'); process.exit(fails ? 1 : 0);
})();
