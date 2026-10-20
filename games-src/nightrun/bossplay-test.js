#!/usr/bin/env node
// Boss encounter mechanics (parts/bossplay.js, flag RET.bossplay). Prints PASS/FAIL lines and one table.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/bossplay-test.js      env: GAME_DIR, DIFF (default easy: the shortest fights)
// 1 every boss: its mechanics trigger and are resolved by the real action (shoot nodes / kill medic or dash the link / EMP / parry / flank), arena rule seen
// 2 a bot that ignores the mechanic (weaves and shoots the bar) takes >= 2x the time of a bot that plays it (same 1e6 HP/frame: the cap sets the pace)
// 3 seeds: two attempts with different seeds differ in picks or attack order; the same seed repeats exactly
// 4 caps hold (ebCap, BCAP), telegraph >= 0.6 s, free gap >= 96 px, phone portrait + reduced motion draw without errors, hints one short line
// 5 flag off (?bossplay=0): no mechanics, the bossmoves order untouched, BPL.k = 1
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), DIFF = process.env.DIFF || 'easy';
const BOSSES = [[5, 'tresor'], [13, 'bruecke'], [21, 'schranke'], [29, 'messe'], [37, 'hoplite'], [8, 'adler'], [16, 'krake'], [24, 'ice'], [32, 'kronos'], [40, 'talos']];
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const FIGHT = ({ n, diff, play, seed, rm }) => {
  const m = window.__mnr, L = window.BPL, B2 = window.B2X; m.SET.diff = diff; if (rm) m.SET.reduce = true; try { m.applySet(); } catch (e) { } L.seed = seed; m.startStory(n); m.simOn(true); m.god = true;
  let t0 = null, t1 = null, T = 0, id = null, err = '', drawn = 0, wy = 270, lastK = 0;
  for (let i = 0; i < 900 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); const e = m.G.boss, P = m.P;
    let tx = 200, ty = 270 + 120 * Math.sin(i / 90);
    if (e && t0 == null && e.x < 800) { t0 = m.G.t; T = B2.tf(e); }
    if (e && e.bp) { id = e.bp.id; const g = e.bp.g;
      if (play && g && g.up) {
        if (g.m === 'nodes') { const x = g.tg.find(q => !q.dead && q.hp > 0); if (x) { tx = 200; ty = x.y; if (Math.abs(P.y - x.y) < 30 && m.G.t - lastK > .5) { x.hp = 0; lastK = m.G.t; } } }   // flies to a node's row and shoots it
        if (g.m === 'medic') { const x = g.tg.find(q => !q.dead && q.hp > 0); if (x) { tx = 200; ty = x.y; if (Math.abs(P.y - x.y) < 60 && m.G.t - lastK > .5) { x.hp = 0; lastK = m.G.t; } } }   // flies to the medic's row and shoots it
        if (g.m === 'emp' && m.G.t - g.tu > .8 && !(m.G.empT > 0)) { P.emp = Math.max(P.emp, 1); m.press('KeyX'); }                  // presses EMP
        if (g.m === 'parry' && g.orb && m.G.t >= g.orb.on && !g.orb.back && Math.hypot(P.x - g.orb.x, P.y - g.orb.y) < 90 && !(P.dashT > 0)) P.dashT = .2;
        if (g.m === 'parry') { tx = 260; ty = e.y; }
        if (g.m === 'back') { if (Math.abs(P.y - wy) < 30 && g.sy != null && Math.abs(P.y - g.sy) < 120) wy = P.y < 270 ? 500 : 40; tx = 220; ty = wy; }   // fly past the shield to the far side
      } }
    m.touchTo(tx, ty);
    if (e && e.x < 940) e.hp -= 1e6;
    try { m.step(1 / 60); } catch (x) { err = x.message; break; }
    if (rm && e && e.bp && i % 20 === 0) { try { m.render(m.G.t, 1 / 60); drawn++; } catch (x) { err = x.message; } }
    if (t0 != null && !m.G.boss) { t1 = m.G.t; break; }
    if (t0 != null && m.G.t - t0 > 4 * T) break; }
  const s = L.st || {}; const out = { n, id, play, seed: s.seed, T, ttk: t1 == null ? null : +(t1 - t0).toFixed(1), cut: t1 == null ? +(m.G.t - (t0 || 0)).toFixed(1) : null, res: s.res || {}, how: s.how || {}, seen: Object.keys(s.seen || {}), pick: s.pick, order: s.order,
    fb: s.fb, open: s.open, tel: s.tel, gap: s.gap, maxEb: s.maxEb, cap: s.cap, maxV: s.maxV, BCAP: m.BCAP, hints: s.hints || [], parry: s.parry | 0, cutN: s.cut | 0, err, drawn, mech: id ? L.T[id].m : [] };
  m.abort(); return out; };
const SEEDS = ({ n }) => { const m = window.__mnr, L = window.BPL, o = []; for (const seed of [11, 12, 11]) { m.SET.diff = 'easy'; try { m.applySet(); } catch (e) { } L.seed = seed; m.startStory(n); m.simOn(true); m.god = true;
    for (let i = 0; i < 400 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); if (m.G.boss && m.G.boss.bp) break; }
    const s = L.st || {}; o.push(JSON.stringify([s.pick, s.order])); m.abort(); } return o; };
const CUT = ({ n }) => {   // the medic's link beam is cut by a DASH through it (the ship sits on the beam and dashes)
  const m = window.__mnr, L = window.BPL; m.SET.diff = 'easy'; try { m.applySet(); } catch (e) { } L.seed = 5; m.startStory(n); m.simOn(true); m.god = true; let how = null, forced = 0;
  for (let i = 0; i < 400 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); const e = m.G.boss, P = m.P;
    if (e && e.bp && e.x <= 900 && !forced) { e.bp.gs = ['medic']; e.bp.gi = 0; L.gate(e, m.G.t); forced = 1; }
    const g = e && e.bp && e.bp.g; if (g && g.up && g.m === 'medic') { const x = g.tg.find(q => !q.dead); if (x) { P.x = (e.x + x.x) / 2; P.y = (e.y + x.y) / 2; if (!(P.dashT > 0) && m.G.t - g.tu > .5) P.dashT = .2; } }
    m.step(1 / 60); const s = L.st || {}; if (s.how && s.how['medic:dash']) { how = 'dash'; break; } }
  m.abort(); return { n, how }; };
const OFF = ({ n }) => { const m = window.__mnr, L = window.BPL; m.SET.diff = 'easy'; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true; let e = null;
  for (let i = 0; i < 400 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); e = m.G.boss; if (e && e.bm && e.bt > 8) break; }
  const want = e && e.bm ? e.bm.T.ph.map(l => l.map(x => Array.isArray(x) ? x[0] : x)) : null, out = { on: L.on, bp: e ? e.bp : 'none', same: !!want && JSON.stringify(want) === JSON.stringify(e.lists), k: e ? L.k(e) : -1 }; m.abort(); return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); let perr = 0;
  const page = async (q, vp) => { const ph = vp && vp.width < 500; const p = await br.newPage({ viewport: vp || { width: 960, height: 540 }, hasTouch: !!ph, isMobile: !!ph });
    p.on('pageerror', e => { perr++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q || '&bossplay=1'}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BPL, null, { timeout: 30000 }); return p; };
  const run = async (jobs, fn, q, vp) => { const res = [], pages = await Promise.all([0, 1, 2, 3].map(() => page(q, vp)));
    await Promise.all(pages.map(async (p, k) => { for (let j = k; j < jobs.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory && window.BPL); res.push(await p.evaluate(fn, jobs[j])); } await p.close(); })); return res; };
  // 1 + 2 + 4: play vs ignore, every boss
  const jobs = []; for (const [n] of BOSSES) for (const play of [true, false]) jobs.push({ n, diff: DIFF, play, seed: 1000 + n });
  const res = await run(jobs, FIGHT, '&bossplay=1'); const get = (n, play) => res.find(r => r.n === n && r.play === play);
  console.log('boss       mechanics                     play s  ignore s  ratio  resolved by the action (play)');
  for (const [n, id] of BOSSES) { const p = get(n, true), ig = get(n, false), tp = p.ttk, ti = ig.ttk != null ? ig.ttk : ig.cut, ratio = tp ? ti / tp : 0;
    console.log(`${id.padEnd(10)} ${p.mech.join('+').padEnd(29)} ${String(tp).padStart(6)}  ${(ig.ttk != null ? String(ti) : '>' + ti).padStart(8)}  ${ratio.toFixed(2).padStart(5)}  ${JSON.stringify(p.res)} ignore: ${JSON.stringify(ig.how)}`);
    const gates = [...new Set(p.pick.flat())].filter(x => ['nodes', 'medic', 'emp', 'parry', 'back'].includes(x)), arena = p.mech[2], pickedArena = p.pick.flat().includes(arena);
    line(p.id === id && gates.every(gm => p.res[gm] > 0) && (!pickedArena || p.seen.includes(arena)) && p.open > 0, `${id} (stage ${n}): mechanics trigger and resolve by the action (${gates.join(', ')}${pickedArena ? ', arena ' + arena : ''}); overloads ${p.fb}`);
    line(tp != null && ratio >= 2, `${id}: ignoring the mechanic takes ${ratio.toFixed(2)}x the time of playing it (>= 2)`);
    line(tp != null && tp >= p.T && tp <= 1.6 * p.T, `${id}: playing it, the fight lasts ${tp} s (armour floor ${p.T} s, <= ${(1.6 * p.T).toFixed(0)} s)`);
    line(p.maxEb <= p.cap && p.maxV <= p.BCAP + 1 && p.tel >= .6 && p.gap >= 96 && !p.err, `${id}: bullets ${p.maxEb} <= ebCap ${p.cap}, speed ${Math.round(p.maxV)} <= BCAP, telegraph ${(+p.tel).toFixed(2)} s >= 0.6, free gap ${p.gap >= 1e9 ? 'n/a' : Math.round(p.gap)} >= 96${p.err ? ', error ' + p.err : ''}`);
    line(p.hints.length >= 2 && p.hints.every(h => h.length <= 60), `${id}: intro / phase / outro hints shown (${p.hints.length}), longest ${Math.max(...p.hints.map(h => h.length))} chars (<= 60)`); }
  { const r = await run([[13], [16]].map(([n]) => ({ n })), CUT); for (const x of r) line(x.how === 'dash', `stage ${x.n}: a DASH through the medic's link beam cuts it (${x.how})`); }
  // 3 seeds
  { const r = await run(BOSSES.map(([n]) => ({ n })), SEEDS); let diffN = 0; for (const o of r) { if (o[0] !== o[1]) diffN++; }
    line(diffN === r.length && r.every(o => o[0] === o[2]), `seeds: ${diffN}/${r.length} bosses differ between seed 11 and 12 (picks or order); the same seed repeats ${r.every(o => o[0] === o[2])}`);
    let pk = 0, od = 0; for (const o of r) { const a = JSON.parse(o[0]), b = JSON.parse(o[1]); if (JSON.stringify(a[0]) !== JSON.stringify(b[0])) pk++; if (JSON.stringify(a[1]) !== JSON.stringify(b[1])) od++; }
    console.log(`seed variance: mechanic picks differ on ${pk}/${r.length} bosses, attack order differs on ${od}/${r.length}`); }
  // 4 phone portrait + reduced motion
  { const r = await run([[5], [24]].map(([n]) => ({ n, diff: 'legend', play: true, seed: 7, rm: true })), FIGHT, '', { width: 390, height: 763 });
    for (const x of r) line(x.drawn > 20 && !x.err, `phone 390x763 Legend, reduced motion, stage ${x.n}: ${x.drawn} frames drawn with mechanics${x.err ? ', error ' + x.err : ''}`); }
  // 5 flag off
  { const r = await run([5, 8, 24, 40].map(n => ({ n })), OFF, '&bossplay=0');
    for (const o of r) line(!o.on && !o.bp && o.same && o.k === 1, `flag off: no mechanics (${o.bp}), bossmoves order untouched ${o.same}, BPL.k ${o.k}`); }
  await br.close(); srv.kill(); line(perr === 0, `no page errors (${perr})`);
  console.log(fails ? `FAIL bossplay-test (${fails})` : 'PASS bossplay-test'); process.exit(fails ? 1 : 0);
})();
