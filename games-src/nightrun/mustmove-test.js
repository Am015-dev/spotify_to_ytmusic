#!/usr/bin/env node
// Must-move gate (flag RET.mustmove, ?mustmove=0 = the old behaviour). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/mustmove-test.js     env: RUNS=1 STAGES=1,5,10,20,30,40 BUILDS=mid,max Q=&mustmove=0 PAR=4 REPORT=1
// park = a ship that NEVER moves; hop = 48 px up/down every 1.5 s, blind to bullets; track = lines up with the nearest foe, never dodges.
// Each (parked at a fixed spot, fires on the beat, auto weapons on) flies Normal story stages with each weapon paired with the
// homing Swarm (Swarm itself with Pulse), mid and max builds, at three heights (top/middle/bottom). Target: from stage 3 on each bot clears <= 10% over all weapons (<= 20% per weapon: one run each).
// The dodging bot's side is balance-test.js / afk-test.js (>= 66% on Normal).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 1, PAR = +process.env.PAR || 4, STAGES = (process.env.STAGES || '1,5,10,20,30,40').split(',').map(Number);
const MODES = (process.env.MODES || 'park,hop,track').split(','), BUILDS = (process.env.BUILDS || 'mid,max').split(','), YS = (process.env.YS || '130,270,410').split(',').map(Number);
const WEAPONS = (process.env.WEAPONS || 'swarm,pulse,laser,beat,arc,orbit,disc,mine,flame,frost,drone,rail,shell,storm,wave,well').split(',');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const PARK = ({ n, build, w, y, mode }) => {
  const m = window.__mnr, WP = window.__wp, SH = m.SH; m.SET.diff = 'normal'; m.SET.auto = true; try { m.applySet(); } catch (e) { }
  m.startStory(n); m.simOn(true);
  const ups = () => {
    WP.eq = w === 'swarm' ? ['pulse', 'swarm'] : [w, 'swarm']; WP.lv = {}; for (const id of WP.eq) WP.lv[id] = build === 'max' ? 5 : 3;
    if (build === 'max') { const GA = window.__ga && window.__ga.GA; if (GA) { GA.eqAll = true; for (const d of m.TP_DEF) GA.tune[d.id] = d.max || 3; } WP.pl = WP.pl || {}; for (const id of WP.eq) WP.pl[id] = 10; }
    WP.sync();
    const want = build === 'max' ? { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 } : { fr: 2, dm: 2, hm: 1 }, ids = SH.UPG.map(u => u.id);
    for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id]; k++) { try { SH.add(id); } catch (e) { } }
    try { SH.recalc && SH.recalc(); } catch (e) { }
  };
  ups();
  let i = 0, lastBeat = -1, x0 = null, moved = 0; const dt = 1 / 60;
  while (m.running && m.G.t < 400) {
    if (SH.active) SH.close();
    if (i % 60 === 0 && build === 'max') for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } }
    let ty = y; if (mode === 'hop') ty = y + (Math.floor(m.G.t / 1.5) % 2 ? 48 : 0);   // hops 48 px every 1.5 s, never looks at bullets
    else if (mode === 'track') { let bd = 1e9; for (const e of m.G.en) { const dx = e.x - m.P.x; if (e.type !== 'boss' && dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } } if (m.G.boss && bd > 1e8) ty = m.G.boss.y; ty = Math.max(60, Math.min(480, ty)); }   // lines up with the nearest foe, never dodges
    m.touchTo(160, ty);
    const bn = Math.floor(m.bpos()); if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    m.step(dt); i++;
    if (m.G.t > 4 && mode === 'park') { if (!x0) x0 = [m.P.x, m.P.y]; else moved = Math.max(moved, Math.hypot(m.P.x - x0[0], m.P.y - x0[1])); }
    if (m.ST.over || m.G.dead) break;
  }
  const r = { n, build, w, y, mode, clear: !!m.ST.over && !m.G.dead, dead: !!m.G.dead, t: +m.G.t.toFixed(1), moved: Math.round(moved) };
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), jobs = [], res = []; let next = 0, errs = 0;
  for (const n of STAGES) for (const build of BUILDS) for (const w of WEAPONS) for (const y of (w === 'swarm' ? YS : [YS[1]])) for (const mode of MODES) for (let k = 0; k < RUNS; k++) jobs.push({ n, build, w, y, mode });
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { errs++; if (errs < 4) console.log('FAIL page error ' + e.message); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${process.env.Q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    while (next < jobs.length) { const j = jobs[next++]; try { res.push(await p.evaluate(PARK, j)); } catch (e) { console.log('RUN ERROR', JSON.stringify(j), e.message.slice(0, 160)); } }
    await p.close();
  }));
  await br.close(); srv.kill();
  let fails = errs ? 1 : 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
  const pct = a => a.length ? Math.round(100 * a.filter(r => r.clear).length / a.length) : 0;
  const mv = res.filter(r => r.moved > 8); console.log(`INFO parked ship pushed > 8 px by the game in ${mv.length} of ${res.filter(r => r.mode === 'park').length} runs (it never steers)`);
  for (const mode of MODES) for (const w of WEAPONS) { const a = res.filter(r => r.w === w && r.mode === mode), late = a.filter(r => r.n >= 3);
    if (process.env.REPORT) console.log(`  ${mode} ${w}: ` + STAGES.map(n => n + ':' + pct(a.filter(r => r.n === n))).join(' ') + ` | ${a.filter(r => r.dead).length}/${a.length} died, mean t ${(a.reduce((s, r) => s + r.t, 0) / Math.max(1, a.length)).toFixed(0)}s`);
    line(pct(late) <= 20, `${mode} ${w}+${w === 'swarm' ? 'pulse' : 'swarm'}, Normal, stages >= 3: clears ${pct(late)}% of ${late.length} (<= 20% per weapon at RUNS=1)`); }
  for (const mode of MODES) { const late = res.filter(r => r.mode === mode && r.n >= 3); line(pct(late) <= 10, `${mode}, all weapons, Normal, stages >= 3: clears ${pct(late)}% of ${late.length} (<= 10%)`); }
  const s1 = res.filter(r => r.n < 3); console.log(`INFO stage 1-2 parked clears ${pct(s1)}% of ${s1.length} (tutorial stages, no target)`);
  console.log(fails ? `FAIL mustmove-test: ${fails} check(s)` : 'PASS mustmove-test'); process.exit(fails ? 1 : 0);
})();
