#!/usr/bin/env node
// Boss movesets (parts/bossmoves.js, flag RET.bossmoves). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/bossmoves-test.js
// 1 library >= 30 verbs; every boss >= 8 verbs, its own signature + counter, pairwise overlap <= 2 (the table)
// 2 every boss fight, phone portrait 390x763 (Legend) and desktop 960x540 (Normal): its verbs run, telegraph >= 0.5 s, a free disc >= 64 px stays while
//   hazards are live, bullets <= ebCap and <= BCAP, the boss draws with its hazards, no page errors
// 3 counters: for each of the ten, the boss is shielded (HP held) until the ship does the thing, then STUNNED (silent) and hittable
// 4 flag off (?bossmoves=0): no moveset on any boss, the old pattern lists, no boss-move bullets or hazards
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const BOSSES = [[5, 'tresor'], [13, 'bruecke'], [21, 'schranke'], [29, 'messe'], [37, 'hoplite'], [8, 'adler'], [16, 'krake'], [24, 'ice'], [32, 'kronos'], [40, 'talos']];
const OLD = new Set(['fan5', 'fan7', 'fan9', 'ring', 'spiral', 'laser', 'summon']);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const FIGHT = ({ n, diff }) => {   // a weaving god ship, 1e6 damage a frame (armour.js holds the length at its floor), all phases
  const m = window.__mnr, B = window.BMV; m.SET.diff = diff; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true;
  let free = 1e9, id = null, drawn = 0, err = '';
  for (let i = 0; i < 400 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.touchTo(200 + 60 * Math.sin(i / 140), 270 + 190 * Math.sin(i / 90));
    const e = m.G.boss; if (e && e.x < 940) e.hp -= 1e6; m.step(1 / 60); const b = m.G.boss; if (b && b.bm) id = b.bm.id;
    if (b && b.bm && i % 8 === 0 && B.hz.some(z => !z.mk && m.G.t >= z.on && m.G.t < z.off)) { const x1 = b.x - b.r - 24; if (x1 < 30) continue; let best = -1e9; for (let x = 30; x <= x1; x += 20) for (let y = 20; y <= 520; y += 15) { const c = B.clear(x, y, 0); if (c > best) best = c; if (best > 200) break; } free = Math.min(free, best);
      if (drawn < 40) { try { m.render(m.G.t, 1 / 60); drawn++; } catch (x) { err = x.message; } } }
    if (i > 600 && !m.G.boss && id) break; }
  const st = B.st || { verbs: {} }, out = { n, id, free: Math.round(free), drawn, err, verbs: Object.keys(st.verbs), tel: Math.min(9, ...Object.values(st.verbs).map(v => v.tel)), maxEb: st.maxEb, cap: st.cap, maxV: st.maxV, BCAP: m.BCAP, want: id ? [...new Set(B.T[id].ph.flat().map(x => Array.isArray(x) ? x[0] : x))] : [] };
  m.abort(); return out; };
const COUNTER = ({ n, v }) => {   // force the counter verb and do the thing; the shield must hold the HP until then
  const m = window.__mnr, B = window.BMV, P = () => m.P; m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true;
  let keep = null, e = null, guarded = 0, held = true, won = false, hpAt = 0, forced = false, dmgAfter = false, stunBeats = 0;   // stunBeats counts frames since the counter
  for (let i = 0; i < 160 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); e = m.G.boss;
    if (e && e.bm && !forced && e.x < 800 && e.ph === 1) { keep = e.lists; e.lists = [[v], [v], [v]]; e.pi = 0; forced = true; }
    const g = e && e.bmG; let act = false;
    if (g && g.v === v) { guarded++; if (guarded === 1) hpAt = e.hp;
      if (guarded > 10 && guarded < 20) { e.hp -= e.max * .01; act = true; }                       // damage while shielded: must not stick
      if (guarded >= 30) {                                                                          // now do the thing
        if (g.tg.length) for (const t of g.tg) if (!t.dead) t.hp = 0;
        if (g.rings) { const r = g.rings.find(q => !q.ok); if (r) { P().x = r.x; P().y = r.y; } }
        if (g.blocks) { const a = g.goal(); P().x = a.x; P().y = a.y; }
        if (v === 'flank_shield') { P().x = 200; P().y = e.y > 270 ? 60 : 480; }
        if (v === 'overload' && guarded % 10 === 0) m.NR.emit('graze', { pf: false }); } }
    else if (!g && !(e && e.bmG)) m.touchTo(200, 270);
    m.step(1 / 60);
    if (act && e && e.bmG && Math.abs(e.hp - hpAt) > 1) held = false;
    if (e && (won || e.bmS > e.bt)) { won = true; stunBeats++; if (stunBeats === 1) e.lists = keep; if (stunBeats === 10) hpAt = e.hp; if (stunBeats > 10 && stunBeats < 130) e.hp -= e.max * .004; if (stunBeats === 130) { dmgAfter = !e.bmG && (e.hp < hpAt - 1 || e.hp <= e.max * (e.ph === 1 ? .645 : .315) + 1); break; }   /* or armour.js holds it at its phase line until the bar */ } }   // after the counter: the shield is gone
  const st = B.st || {}; m.abort(); return { n, v, forced, guarded, held, won, dmgAfter, wonN: st.won || 0 }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); let perr = 0;
  const page = async (q, vp) => { const ph = vp && vp.width < 500; const p = await br.newPage({ viewport: vp || { width: 960, height: 540 }, hasTouch: !!ph, isMobile: !!ph });
    p.on('pageerror', e => { perr++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q || ''}${process.env.QS || ''}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV, null, { timeout: 30000 }); return p; };
  // 1 the table
  const p0 = await page(); const TB = await p0.evaluate(() => { const { BMT, VB } = window.__bmv, o = {}; for (const id in BMT) o[id] = { v: [...new Set(BMT[id].ph.flat().map(x => Array.isArray(x) ? x[0] : x))], sig: BMT[id].sig, ctr: BMT[id].ctr }; return { o, lib: Object.keys(VB).length, sig: Object.keys(VB).filter(k => VB[k].sig), ctr: Object.keys(VB).filter(k => VB[k].ctr) }; }); await p0.close();
  const ids = Object.keys(TB.o); let maxO = 0; for (const a of ids) for (const b of ids) if (a < b) maxO = Math.max(maxO, TB.o[a].v.filter(v => TB.o[b].v.includes(v)).length);
  line(TB.lib >= 30 && ids.length === 10, `library ${TB.lib} verbs (>= 30), ${ids.length} boss movesets`);
  line(ids.every(id => TB.o[id].v.length >= 8), `every boss has >= 8 verbs (${ids.map(id => id + ' ' + TB.o[id].v.length).join(', ')})`);
  line(ids.every(id => ids.filter(j => TB.o[j].v.includes(TB.o[id].sig)).length === 1 && ids.filter(j => TB.o[j].v.includes(TB.o[id].ctr)).length === 1 && TB.sig.includes(TB.o[id].sig) && TB.ctr.includes(TB.o[id].ctr)), 'every boss has its own signature verb and its own counter verb');
  line(maxO <= 2, `pairwise verb overlap <= 2 (max ${maxO})`);
  // 2 every fight, phone (Legend) + desktop (Normal)
  const VPS = [[{ width: 390, height: 763 }, 'legend'], [{ width: 960, height: 540 }, 'normal']];
  for (const [vp, diff] of VPS) { const pages = await Promise.all([0, 1, 2, 3].map(() => page('', vp))), res = [];
    await Promise.all(pages.map(async (p, k) => { for (let j = k; j < BOSSES.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV); res.push(await p.evaluate(FIGHT, { n: BOSSES[j][0], diff })); } await p.close(); }));
    for (const r of res.sort((a, b) => a.n - b.n)) { const miss = r.want.filter(v => !r.verbs.includes(v)), tag = `${vp.width}x${vp.height} ${diff} ${r.id}`;
      line(r.id === BOSSES.find(b => b[0] === r.n)[1] && !miss.length, `${tag}: all ${r.want.length} verbs ran${miss.length ? ' (missing ' + miss.join(',') + ')' : ''}`);
      line(r.tel >= .5 && 2 * r.free >= 64, `${tag}: telegraph >= ${r.tel.toFixed(2)} s (>= 0.5), free disc >= ${2 * r.free} px (>= 64) while hazards are live`);
      line(r.maxEb <= r.cap && r.maxV <= r.BCAP + 1, `${tag}: bullets ${r.maxEb} <= ebCap ${r.cap}, speed ${Math.round(r.maxV)} <= BCAP ${r.BCAP}`);
      line(r.drawn > 0 && !r.err, `${tag}: drawn with live hazards (${r.drawn} frames${r.err ? ', error ' + r.err : ''})`); } }
  // 3 counters
  { const C = BOSSES.map(([n, id]) => ({ n, v: TB.o[id].ctr })), pages = await Promise.all([0, 1, 2, 3].map(() => page())), res = [];
    await Promise.all(pages.map(async (p, k) => { for (let j = k; j < C.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BMV); res.push(await p.evaluate(COUNTER, C[j])); } await p.close(); }));
    for (const r of res.sort((a, b) => a.n - b.n)) line(r.forced && r.guarded > 20 && r.held && r.won && r.dmgAfter, `counter ${r.v} (stage ${r.n}): shielded ${r.guarded} frames, HP held under fire ${r.held}, done -> STUNNED ${r.won}, hittable after ${r.dmgAfter}`); }
  // 4 flag off
  { const p = await page('&bossmoves=0'); const o = await p.evaluate(() => { const m = window.__mnr; const out = []; for (const n of [5, 8, 24, 40]) { m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true; let bmB = 0, hz = 0, lists = null, bm;
      for (let i = 0; i < 260 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); const e = m.G.boss; if (e) { bm = e.bm; lists = e.lists; for (const b of m.G.eb) if (b.bmv) bmB++; hz += window.BMV.hz.length; if (e.bt > 40) break; } }
      out.push({ n, on: window.BMV.on, bm: bm === undefined ? 'undef' : bm, lists: lists && lists.flat(), bmB, hz }); m.abort(); } return out; }); await p.close();
    for (const r of o) line(!r.on && !r.bm && r.lists && r.lists.every(v => OLD.has(v)) && !r.bmB && !r.hz, `flag off stage ${r.n}: no moveset (${r.bm}), old lists ${r.lists && [...new Set(r.lists)].join('/')}, boss-move bullets ${r.bmB}, hazards ${r.hz}`); }
  await br.close(); srv.kill(); line(perr === 0, `no page errors (${perr})`);
  console.log(fails ? `FAIL bossmoves-test (${fails})` : 'PASS bossmoves-test'); process.exit(fails ? 1 : 0);
})();
