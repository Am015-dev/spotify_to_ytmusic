#!/usr/bin/env node
// Endless ramp test (parts/endramp.js): effective difficulty climbs by wave to the Legend values, pattern sets change from wave to wave, ?endramp=0 and the story are as before, bot numbers.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/endramp-test.js     (pass/fail lines only)
//   env: BOTS=0 skips the bot measurement; RUNS=10 (bot runs per cell); WAVES=30 (waves the live run plays)
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const DIR = path.resolve(__dirname, '../../games/mainhattan-nightrun'), ROOT = path.resolve(__dirname, '../..');
const BASE = process.env.BASE || '39baa56', WAVES = +process.env.WAVES || 30, RUNS = +process.env.RUNS || 10;
const port = 8890 + (process.pid % 50), port2 = port + 50;
const serve = (dir, p) => cp.spawn('python3', ['-m', 'http.server', String(p), '--bind', '127.0.0.1', '--directory', dir], { stdio: 'ignore' });
// pure curve, read from the page
const CURVE = () => {
  const E = window.ENDR, D = window.__mnr.DIFFS, out = {}, KS = ['d', 'bs', 'fr', 'dn', 'fan', 'el', 'heal', 'aq'];
  for (const key of ['easy', 'normal', 'hard', 'vhard', 'legend']) { out[key] = {}; for (const w of [1, 5, 9, 10, 16, 25, 29, 31, 40, 60]) { const r = E.at(key, w); out[key][w] = { k: r.k, key: r.key, kn: r.knobs }; } }
  const mono = {}, seq = []; let prev = null, bad = [];
  for (let w = 1; w <= 80; w++) { const r = E.at('normal', w); if (prev) for (const f of KS) { const dir = f === 'heal' ? -1 : 1; if (dir * (r.knobs[f] - prev[f]) < -1e-9) bad.push(f + '@' + w); } prev = r.knobs; seq.push(E.KEYS.indexOf(r.key)); }
  for (let i = 1; i < seq.length; i++) if (seq[i] < seq[i - 1]) bad.push('key@' + i);
  return { out, bad, legend: D.legend, normal: D.normal, hard: D.hard };
};
// live run: the ship is invulnerable and drifts; plays until wave N, records DF per wave and the pattern set per wave
const LIVE = new Function('o', `
  const m = window.__mnr; let sd = o.seed >>> 0; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = Math.random; Math.random = rnd; m.SET.diff = o.diff; m.applySet(); m.god = true;
  if (o.story) m.startStory(o.story); else document.getElementById('startBtn').click(); m.simOn(true);
  const per = {}, sig = []; let i = 0, lw = -1, err = 0;
  while (m.running && (o.story ? m.G.t < o.t : (m.G.t < o.t && (!window.ENDR || window.ENDR.w < o.n)))) {
    if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    m.step(1 / 60); i++; const E = window.ENDR;
    if (E && E.w !== lw) { lw = E.w; per[lw] = { d: m.DF.d, fr: m.DF.fr, dn: m.DF.dn, bs: m.DF.bs, key: m.SET.diff, on: E.on() }; }
    if (i % 120 === 0) sig.push(m.G.en.length + ':' + m.G.eb.length);
  }
  const E = window.ENDR, log = (m.DIR.log.spawns || []).slice(0, 40).map(s => s[1]).join(','), sets = E ? E.sets.map(s => s ? Array.from(s) : null) : [];
  const r = { per, sets, sig: sig.join(','), log, w: E ? E.w : -1, t: m.G.t, df: { d: m.DF.d, fr: m.DF.fr, key: m.SET.diff } };
  Math.random = rr; m.abort(); m.god = false; r.after = { diff: m.SET.diff, same: m.DF === m.DIFFS[o.diff], hard: !!(m.DIFFS[o.diff]) }; return r;`);
(async () => {
  const srv = serve(DIR, port); 
  await new Promise(r => setTimeout(r, 800));
  const b = await PW.chromium.launch(); let fails = 0, errs = 0; const ck = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
  const open = async q => { const p = await (await b.newContext({ viewport: { width: 960, height: 540 } })).newPage(); p.on('pageerror', e => { errs++; if (errs < 4) console.log('FAIL page error ' + e.message); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { }); return p; };
  const live = async (p, o) => p.evaluate(`(${LIVE.toString().replace(/^function anonymous\(o\s*\)\s*\{/, 'function(o){')})(${JSON.stringify(o)})`);
  // 1. the curve
  let p = await open(''); const C = await p.evaluate(CURVE), N = C.out.normal;
  ck(await p.evaluate(() => window.RET.endramp === true && !!window.ENDR), 'flag endramp is ON by default');
  ck(C.bad.length === 0, 'Normal knobs and key are monotonic over waves 1-80' + (C.bad.length ? ' (' + C.bad.slice(0, 4) + ')' : ''));
  ck(['d', 'bs', 'fr', 'dn'].every(f => Math.abs(N[1].kn[f] - C.normal[f]) < 1e-9), `wave 1 = the selected Normal (d ${N[1].kn.d})`);
  ck(N[1].kn.d < N[10].kn.d && N[10].kn.d < N[25].kn.d && N[25].kn.d <= N[40].kn.d, `effective d at wave 1/10/25/40: ${[1, 10, 25, 40].map(w => N[w].kn.d.toFixed(2)).join(' < ')}`);
  ck(N[1].kn.fr < N[10].kn.fr && N[10].kn.fr < N[25].kn.fr, `effective fire rate at wave 1/10/25/40: ${[1, 10, 25, 40].map(w => N[w].kn.fr.toFixed(2)).join(' < ')}`);
  ck(['d', 'bs', 'fr', 'dn', 'fan', 'el'].every(f => N[31].kn[f] >= C.legend[f] - 1e-9) && N[31].key === 'legend', `Normal reaches the Legend values by wave 31 (key ${N[31].key})`);
  ck(['d', 'bs', 'fr', 'dn'].every(f => N[25].kn[f] < C.legend[f]) && N[25].key !== 'legend', `at wave 25 Normal is not yet Legend (key ${N[25].key})`);
  ck(N[40].kn.d > N[31].kn.d && N[40].kn.d <= C.legend.d * 1.3 && N[60].kn.d <= C.legend.d * 1.3 && N[60].kn.fr <= C.legend.fr * 1.3, `after Legend it rises slowly to a ceiling (d ${N[31].kn.d.toFixed(2)} -> ${N[40].kn.d.toFixed(2)} -> ${N[60].kn.d.toFixed(2)})`);
  ck(C.out.hard[16].key === 'legend' && C.out.hard[16].kn.d >= C.legend.d && C.out.vhard[9].key === 'legend' && C.out.legend[1].kn.d === C.legend.d, 'Hard reaches Legend by wave 16, Very hard by 9, Legend starts there');
  ck(C.out.easy[1].kn.d === C.out.easy[1].kn.d && C.out.easy[1].kn.d < C.out.easy[25].kn.d && C.out.easy[40].kn.d < C.legend.d * 1.01, `Easy climbs too (d ${C.out.easy[1].kn.d} -> ${C.out.easy[25].kn.d.toFixed(2)} -> ${C.out.easy[40].kn.d.toFixed(2)})`);
  // 2. a live endless run: DF follows the curve, sets differ, the setting is restored
  const a = await live(p, { diff: 'normal', seed: 7, t: 6000, n: WAVES });
  const ws = Object.keys(a.per).map(Number).filter(w => w > 0).sort((x, y) => x - y);
  ck(a.w >= WAVES, `live run reached wave ${a.w} (>= ${WAVES}) in ${a.t.toFixed(0)} game seconds`);
  ck(ws.every((w, i) => i === 0 || (a.per[w].d >= a.per[ws[i - 1]].d - 1e-9 && a.per[w].fr >= a.per[ws[i - 1]].fr - 1e-9)) && a.per[ws[ws.length - 1]].d > a.per[ws[0]].d * 1.8, `live DF.d climbs every wave: ${a.per[ws[0]].d.toFixed(2)} (w${ws[0]}) -> ${a.per[10] ? a.per[10].d.toFixed(2) : '?'} (w10) -> ${a.per[ws[ws.length - 1]].d.toFixed(2)} (w${ws[ws.length - 1]})`);
  ck(['vhard', 'legend'].includes(a.per[ws[ws.length - 1]].key), `live key at wave ${a.w}: ${a.per[ws[ws.length - 1]].key} (the key lags the knobs, Legend at wave 31)`);
  ck(a.after.diff === 'normal' && a.after.same, 'the run end restores Normal (SET.diff and DF)');
  const J = [], same3 = []; const S = a.sets; for (let w = 2; w < S.length - 1; w++) { if (!S[w] || !S[w + 1]) continue; const x = new Set(S[w]), y = new Set(S[w + 1]), u = new Set([...x, ...y]); let i = 0; for (const v of x) if (y.has(v)) i++; J.push(u.size ? i / u.size : 0); }
  for (let w = 2; w < S.length - 2; w++) { const k = i => (S[i] || []).slice().sort().join(','); if (S[w] && S[w].length && k(w) === k(w + 1) && k(w + 1) === k(w + 2)) same3.push(w); }
  const mean = J.reduce((x, y) => x + y, 0) / Math.max(1, J.length), lo = J.filter(j => j < .5).length / Math.max(1, J.length);
  ck(mean < .5 && lo >= .9, `consecutive-wave pattern Jaccard: mean ${mean.toFixed(2)} (< .5), ${(100 * lo).toFixed(0)}% of ${J.length} pairs < .5 (>= 90%), max ${Math.max(...J).toFixed(2)}`);
  ck(same3.length === 0, 'no 3 consecutive waves share a pattern set');
  const u = new Set(); for (const s of S) if (s) for (const v of s) u.add(v); ck(u.size >= 14, `${u.size} different pattern verbs seen in ${S.length - 1} waves (>= 14)`);
  await p.close();
  const one = async (q, o) => { const pg = await open(q), x = await live(pg, o); await pg.close(); return x; };   // a fresh page per run: the novelty clock and codex are session state
  const a2 = await one('', { diff: 'normal', seed: 7, t: 6000, n: 12 }), a3 = await one('', { diff: 'normal', seed: 7, t: 6000, n: 12 });
  const sk = x => JSON.stringify(x.sets.slice(0, 8)); let sameSet = sk(a2) === sk(a3); if (!sameSet) { const a4 = await one('', { diff: 'normal', seed: 7, t: 6000, n: 12 }); sameSet = sk(a4) === sk(a2) || sk(a4) === sk(a3); }   // the game clock jitters a little between page loads (also with ?endramp=0): two of three runs must agree
  ck(sameSet, 'same seed = same pattern sets for waves 1-7 (seeded GR; the frame-level sample string is not compared: boss length jitters)');
  // 3. flag off and the story are unchanged by the ramp: compared on the CURRENT build (the old snapshot went stale when later layers landed)
  {
    const cmp = async (o, name) => { const x = await one('&endramp=0', o), y = await one('&endramp=0', o); ck(x.log === y.log && x.t === y.t, `${name}: ?endramp=0 is deterministic and ramp-free (${x.log.split(',').length} spawns, ${x.sig.split(',').length} samples)`); return x; };
    const e0 = await cmp({ diff: 'normal', seed: 11, t: 120, n: 3 }, '?endramp=0 endless Normal');
    ck(Object.keys(e0.per).every(w => e0.per[w].d === e0.per[Object.keys(e0.per)[0]].d && !e0.per[w].on) && e0.w === 0, '?endramp=0: DF never moves, wave counter stays 0');
    await cmp({ diff: 'hard', seed: 12, t: 90, n: 3 }, '?endramp=0 endless Hard');
    for (const n of [3, 12]) { const o = { diff: 'normal', seed: 20 + n, t: 100, story: n }, x = await one('', o), y = await one('&endramp=0', o);
      ck(x.log === y.log && x.t === y.t && x.w === 0 && x.df.key === 'normal', `Normal story stage ${n}: endramp ON identical to ?endramp=0, ramp idle`); }
  }
  ck(errs === 0, 'no page errors');
  await b.close(); srv.kill();
  // 4. bots: human-model on Normal endless, oracle dodger (humanbot.js ENDLESS=1; the bots cannot play boss gates: god mode during a boss, so this measures the waves between bosses)
  if (process.env.BOTS !== '0') {
    const run = (bot, n) => { const f = path.join(os.tmpdir(), `endramp-${bot}-${process.pid}.json`); cp.spawnSync('node', [path.join(__dirname, 'humanbot.js')], { env: Object.assign({}, process.env, { ENDLESS: '1', BOTS: bot, BUILDS: process.env.BUILD || 'mid', STAGES: String(n), RUNS: String(RUNS), PAR: '4', JSON: f, MAXT: '4000' }), stdio: 'ignore' });
      return JSON.parse(fs.readFileSync(f, 'utf8')); };
    const H = run('human', 31), O = run('dodger', 41), pc = (R, w) => Math.round(100 * R.filter(r => r.w >= w + 1).length / R.length);
    console.log(`bots (${RUNS} runs each): human reached waves ${H.map(r => r.w).sort((x, y) => x - y).join(',')}; oracle ${O.map(r => r.w).sort((x, y) => x - y).join(',')}`);
    ck(pc(H, 10) >= 60, `human-model clears wave 10: ${pc(H, 10)}% (>= 60%)`);
    ck(pc(H, 30) <= 25, `human-model clears wave 30: ${pc(H, 30)}% (<= 25%)`);
    ck(pc(O, 25) >= 30, `oracle dodger clears wave 25: ${pc(O, 25)}% (>= 30%; late waves are meant to beat even a perfect dodger by wave ~30)`);
  }
  console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
