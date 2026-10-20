#!/usr/bin/env node
// DASH + EMP abilities gate (parts/abilities.js, flag RET.abil). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/abil-test.js      env: RUNS=3 (stationary bot runs per stage)
// 1 a stationary bot that spams DASH (and comes back) and EMP clears no more stages than with ?abil=0 (+10 points), stages 3/8/20 Normal mid build
// 2 the dodging bot / Legend bands are balance-test and scale/scale2-test (run them next to this one)
// 3 every dash trait and EMP effect fires in its own scenario
// 4 caps hold: enemy bullets <= ebCap, speed <= BCAP, boss HP loss per 1 s <= the armour cap under EMP + ram spam
// 5 ?abil=0: the hooks take the old paths (old dash cooldown, EMP without the meter, ABIL.tick idle)
// 6 DASH / EMP buttons >= 48 px, inside the screen, apart, with a charge ring, phone portrait + landscape
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 3;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const READY = p => p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 10000 }).catch(() => { });
const STILLBOT = ({ n }) => {   // never dodges: sits at one spot, dashes every 30 frames (then flies back), EMP whenever it has one
  const m = window.__mnr, WP = window.__wp, SH = m.SH; m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { }
  m.startStory(n); m.simOn(true); WP.eq = ['pulse', 'swarm']; WP.lv = { pulse: 2, swarm: 2 }; WP.sync(); for (const id of ['fr', 'dm', 'hm']) { try { SH.add(id); } catch (e) { } }
  let i = 0, clear = false; while (m.running && m.G.t < 400) { if (SH.active) SH.close();
    m.touchTo(140, 270); if (i % 30 === 0) m.press('Dash'); if (m.P.emp > 0 && i % 20 === 0) m.press('Emp'); if (i % 15 === 0) m.press('Fire');
    m.step(1 / 60); i++; if (m.ST.over && !m.G.dead) { clear = true; break; } if (m.G.dead) break; }
  m.abort(); return clear;
};
const SCN = () => {   // one scenario per trait: start a stage, give the power, set the scene, press, step
  const m = window.__mnr, A = window.ABIL, out = {}; let ebMax = 0, vMax = 0, cap = 40;   // ebCap() is at most 35 + 5 in a boss fight
  const set = (k) => { pin.length = 0; m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1; if (k) { try { m.PW.give(k); } catch (e) { } } m.P.x = 200; m.P.y = 270; m.P.dx = 1; m.P.dy = 0; };
  const foe = (x, y, o) => { const e = Object.assign({ type: 'drone', x, y, r: 14, hp: 6, max: 6, hq: 6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, score: 100, vx: 0, vy: 0, dummy: 1, by: y }, o || {}); m.G.en.push(e); e.px = x; e.py = y; pin.push(e); return e; };
  const pin = []; const run = (f) => { for (let i = 0; i < f; i++) { for (const e of pin) { e.x = e.px; e.y = e.py; } m.step(1 / 60); ebMax = Math.max(ebMax, m.G.eb.length); for (const b of m.G.eb) vMax = Math.max(vMax, Math.hypot(b.vx, b.vy)); } };
  const S0 = () => JSON.parse(JSON.stringify(A.stat));
  const dash = (k, scene, f) => { set(k); scene(); const s0 = S0(); m.press('Dash'); run(f || 30); const s1 = A.stat, d = {}; for (const x in s1) d[x] = s1[x] - s0[x]; m.abort(); return d; };
  const bullets = () => { for (let i = 0; i < 8; i++) m.G.eb.push({ x: 240 + i * 12, y: 270, vx: -20, vy: 0, r: 5, dmg: 1 }); };
  out.burn = dash('nova', () => foe(300, 270, { hp: 40, max: 40, hq: 40 }), 40).burn;
  out.ram = dash('chord', () => { foe(300, 270, { type: 'shielder', sh: 8, el: 1 }); }).ram;
  out.phase = dash('slice', bullets).phase;
  out.decoy = dash('wing', () => { }, 4).decoy;
  out.mag = dash('magb', () => { for (let i = 0; i < 4; i++) m.G.pk.push({ t: 'shard', x: 300 + i * 20, y: 300, vx: 0, vy: 0, bob: 0 }); }).mag;
  { set('wing'); m.press('Dash'); run(3); const e = foe(700, 270); for (let i = 0; i < 20; i++) { const a = Math.atan2(m.P.y - e.y, m.P.x - e.x); m.G.eb.push({ x: e.x, y: e.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, r: 5, dmg: 1 }); } const d0 = A.stat.decoy; run(2); out.reaim = A.stat.decoy - d0; m.abort(); }
  { set(''); const d0 = A.stat.dash; let n = 0; for (let i = 0; i < 60; i++) { m.press('Dash'); run(1); } n = A.stat.dash - d0; out.burst = n; run(60 * 2); const b = A.stat.dash; m.press('Dash'); run(2); out.refills = A.stat.dash - b; m.abort(); }
  const emp = (k, scene) => { set(k); scene && scene(); m.P.emp = 3; const s0 = S0(); m.press('Emp'); run(20); const s1 = A.stat, d = {}; for (const x in s1) d[x] = s1[x] - s0[x]; d.eb = m.G.eb.length; m.abort(); return d; };
  out.wave = emp('nova', bullets).conv; out.bubble = emp('slice').slow; out.chain = emp('wing', () => { foe(400, 200, { hp: 40, max: 40, hq: 40 }); foe(500, 300, { hp: 40, max: 40, hq: 40 }); }).chain;
  out.od = emp('drum').od; out.pull = emp('magb', () => m.G.pk.push({ t: 'shard', x: 800, y: 100, vx: 0, vy: 0, bob: 0 })).mag; out.base = emp('', bullets);
  { set(''); m.P.emp = 0; A.st().m = 0; for (let i = 0; i < 30; i++) A.gain(.035); out.meter = m.P.emp; m.abort(); }
  // core breaker + boss cap: a boss with cores, EMP + ram spam, measure the boss's worst 1 s loss against its armour cap
  { set('chord'); m.startStory(8); m.simOn(true); m.god = true; try { m.PW.give('chord'); } catch (e) { } m.spawnBoss({}); run(300); const B = m.G.boss; let worst = 0, capB = 0, core = 0;
    if (B) { capB = window.B2X ? window.B2X.cap(B) : 0; const hist = [];
      B.cores = B.cores || []; B.cores.push(foe(B.x - 60, B.y, { type: 'turret', hp: 50, max: 50, hq: 50 })); m.P.emp = 3; const c0 = A.stat.core; m.press('Emp'); run(2); core = A.stat.core - c0;
      for (let i = 0; i < 600; i++) { if (i % 20 === 0) { m.P.emp = 3; m.press('Emp'); } if (i % 10 === 0) { m.P.x = B.x - B.r - 60; m.P.y = B.y; m.press('Dash'); } hist.push([m.G.t, B.hp]); run(1); }
      for (let i = 0; i < hist.length; i++) for (let j = i; j < hist.length && hist[j][0] - hist[i][0] <= 1; j++) worst = Math.max(worst, hist[i][1] - hist[j][1]); }
    out.boss = { have: !!B, worst: Math.round(worst), cap: Math.round(capB), core }; m.abort(); }
  out.ebMax = ebMax; out.cap = cap; out.vMax = Math.round(vMax); out.BCAP = m.BCAP; return out;
};
const OFF = () => {   // ?abil=0
  const m = window.__mnr; m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; for (let i = 0; i < 30; i++) m.step(1 / 60);
  m.press('Dash'); let cd = 0; for (let i = 0; i < 30; i++) { m.step(1 / 60); cd = Math.max(cd, m.P.dashCd); } m.P.emp = 2; m.press('Emp'); m.step(1 / 60); const e = m.P.emp; const r = { on: window.ABIL.on, cd: +cd.toFixed(2), emp: e, ab: !!m.G.ab }; m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); const U = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`;
  let errs = 0;
  { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); });
    await p.goto(U('')); await READY(p); const o = await p.evaluate(SCN);
    const tmOn = await p.evaluate(() => !!(window.TIM && TIM.on));   // timing.js: an off-beat press costs 2 charges and locks .45 s, so mashing gets 1-3
    line(tmOn ? o.burst >= 1 && o.burst <= 3 : o.burst >= 3 && o.burst <= 4, `dash: ${o.burst} dashes from 1 s of mashing (${tmOn ? '1-3 with timing' : '3-4'}), then a recharge`);
    line(o.refills >= 1, `dash: a charge is back within 2 s (${o.refills})`);
    for (const [k, v] of [['burn', o.burn], ['ram', o.ram], ['phase', o.phase], ['decoy', o.decoy], ['mag', o.mag]]) line(v > 0, `dash trait ${k} fires (${Math.round(v)})`);
    line(o.reaim > 0, `dash decoy: aimed shots turn to the afterimage (${o.reaim})`);
    for (const [k, v] of [['wave', o.wave], ['bubble', o.bubble], ['chain', o.chain], ['overdrive', o.od], ['pull', o.pull]]) line(v > 0, `EMP effect ${k} fires (${v})`);
    line(o.base.eb === 0 && o.base.emp === 1, `EMP base clears every bullet (${o.base.eb} left)`);
    line(o.meter >= 1, `EMP meter: 30 kills give ${o.meter} charge(s)`);
    line(o.boss.have && o.boss.core > 0, `EMP core breaker hits boss shield cores (${o.boss.core})`);
    line(o.boss.have && o.boss.worst <= o.boss.cap * 1.1 + 1, `boss worst 1 s loss under EMP+ram spam ${o.boss.worst} <= armour cap ${o.boss.cap}`);
    line(o.ebMax <= o.cap + 8, `enemy bullets at most ${o.ebMax} (scenes add 20 by hand; cap ${o.cap})`);
    line(o.vMax <= o.BCAP, `enemy bullet speed at most ${o.vMax} <= BCAP ${o.BCAP}`);
    await p.close(); }
  { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); await p.goto(U('&abil=0')); await READY(p); const o = await p.evaluate(OFF);
    line(!o.on && !o.ab && o.cd >= .45 && o.emp === 1, `?abil=0: old dash cooldown ${o.cd}, old EMP (2 -> ${o.emp}), no ability state`); await p.close(); }
  { const res = {}; for (const q of ['', '&abil=0']) { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); await p.goto(U(q)); await READY(p); let c = 0, t = 0;
      for (const n of [3, 8, 20]) for (let k = 0; k < RUNS; k++) { t++; if (await p.evaluate(STILLBOT, { n })) c++; } res[q || 'on'] = [c, t]; await p.close(); }
    const on = res.on[0] / res.on[1], off = res['&abil=0'][0] / res['&abil=0'][1];
    line(on <= off + .1, `stationary DASH/EMP spam bot clears ${Math.round(100 * on)}% with abilities, ${Math.round(100 * off)}% without (stages 3/8/20 Normal, ${res.on[1]} runs)`); }
  for (const [w, h] of [[390, 763], [763, 390]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }), p = await ctx.newPage(); await p.goto(`http://127.0.0.1:${port}/index.html?all=1`); await READY(p);
    await p.evaluate(() => { const m = window.__mnr; m.startStory(3); }); await p.waitForTimeout(600);
    const r = await p.evaluate(() => { const g = id => { const e = document.getElementById(id); if (!e) return null; const b = e.getBoundingClientRect(), s = getComputedStyle(e, '::after'); return { w: b.width, h: b.height, x: b.x, y: b.y, vis: !!e.offsetParent, ring: /conic/.test(s.backgroundImage), n: e.dataset.n }; };
      return { d: g('bDash'), e: g('bEmp'), W: innerWidth, H: innerHeight }; });
    const ok = b => b && b.vis && b.w >= 48 && b.h >= 48 && b.x >= 0 && b.y >= 0 && b.x + b.w <= r.W && b.y + b.h <= r.H && b.ring;
    const apart = r.d && r.e && (Math.abs(r.d.x - r.e.x) >= 48 || Math.abs(r.d.y - r.e.y) >= 48);
    line(ok(r.d) && ok(r.e) && apart, `${w}x${h}: DASH ${r.d ? Math.round(r.d.w) : '-'} px (${r.d && r.d.n}) EMP ${r.e ? Math.round(r.e.w) : '-'} px (${r.e && r.e.n}), on screen, apart, charge rings`);
    await ctx.close(); }
  line(errs === 0, `no page errors (${errs})`);
  await br.close(); srv.kill(); console.log(fails ? `FAIL abil-test: ${fails} check(s)` : 'PASS abil-test'); process.exit(fails ? 1 : 0);
})();
