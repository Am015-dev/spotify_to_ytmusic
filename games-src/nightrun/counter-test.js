#!/usr/bin/env node
// COUNTER threats gate (parts/counter.js, flag RET.counter). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/counter-test.js
// a for each threat: the dodging bot WITHOUT the answer loses clearly more hull (or time) than the same bot WITH the timed answer
// c a bot that presses DASH / EMP at random (same number of presses) loses more than the one that times them
// e caps (ebCap, BCAP) under curtains, threats appear in a real Normal stage, ?counter=0 = no threats, no page errors
// b/d: mustmove-test, balance-test, scale-test, scale2-test (run them next to this one)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const READY = p => p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 10000 }).catch(() => { });
const SCN = () => {
  const m = window.__mnr, C = window.CTR, out = {}; let ebMax = 0, vMax = 0;
  const set = (god) => { m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(10); m.simOn(true); m.god = !!god; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1; C.reset(); C.noAuto = 1;
    m.P.x = 200; m.P.y = 270; m.P.hp = m.P.max = 40; m.P.inv = 0; for (let i = 0; i < 5; i++) m.step(1 / 60); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dodge = () => { const G = m.G, P = m.P; let bc = 1e18, bx = P.x, by = P.y;   // the balance-test cost grid, without the threat answers
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 700 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const d = Math.hypot(b.x + b.vx * .14 - cx, b.y + b.vy * .14 - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      for (const e of G.en) { const d = Math.hypot(e.x - cx, e.y - cy), r = (e.r || 14) + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      c += Math.abs(cy - (270 + 140 * Math.sin(G.t * .9))) * .6 + Math.abs(cx - (220 + 70 * Math.sin(G.t * .55))) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; } }
    m.touchTo(bx, by); };
  // the timed answers a good player gives
  const parryNow = () => m.G.eb.some(b => b.cxM && (Math.hypot(b.x - m.P.x, b.y - m.P.y) - (b.r + 3)) / (Math.hypot(b.vx, b.vy) || 1) < .13);
  const wallNear = () => C.walls.find(w => w.warn <= 0 && !w.hit && !w.dash && w.x > m.P.x);
  const curtOn = () => C.walls.some(w => w.cur && w.warn <= 0 && w.x < 900);
  const run = (secs, mode, pump) => { const h0 = m.P.hp; let presses = { d: 0, e: 0 }, i = 0;
    while (i < secs * 60 && m.running) { pump && pump(i);
      const w = wallNear();
      if (mode === 'with' && w && w.x - m.P.x < 340) { m.touchTo(m.P.x + 120, m.P.y); m.P.dx = 1; m.P.dy = 0; } else dodge();
      if (mode === 'with') { if (parryNow() || (w && w.x - m.P.x < 190 && w.x - m.P.x > 20)) { m.press('Dash'); presses.d++; } if (m.P.emp > 0 && (curtOn() || m.G.en.some(e => e.ctw && e.wsh && e.x < 900))) { m.press('Emp'); presses.e++; } }
      if (mode === 'rand') { if (rnd() < pump.rd) { m.press('Dash'); presses.d++; } if (m.P.emp > 0 && rnd() < pump.re) { m.press('Emp'); presses.e++; } }
      if (i % 15 === 0) m.press('Fire');
      m.step(1 / 60); i++; ebMax = Math.max(ebMax, m.G.eb.length); for (const b of m.G.eb) { const v = Math.hypot(b.vx, b.vy); if (v === v) vMax = Math.max(vMax, v); }; }
    return { lost: h0 - m.P.hp, presses }; };
  const shooter = () => { const e = { type: 'drone', x: 820, y: 270, r: 14, hp: 9999, max: 9999, hq: 9999, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, score: 0, vx: 0, vy: 0, dummy: 1 }; m.G.en.push(e); return e; };
  const pin = (e, x, y) => () => { e.x = x; e.y = y; e.hp = 9999; e.bf = 99; };
  const S = () => JSON.parse(JSON.stringify(C.stat));
  const threat = (k, mode, sec, every) => { set(false); let e = null; if (k === 'seek') e = shooter(); const pe = e && pin(e, 820, 270), s0 = S();
    const pump = i => { pe && pe(); if (i % (every * 60) === 30) { if (k === 'curt') m.P.emp = 1; C.start(k); } };
    const r = run(sec, mode, pump), s1 = C.stat, d = {}; for (const x in s1) d[x] = s1[x] - s0[x]; r.d = d; m.abort(); return r; };
  for (const k of ['seek', 'wall', 'curt']) out[k] = { without: threat(k, 'without', 24, k === 'seek' ? 3 : 4), with: threat(k, 'with', 24, k === 'seek' ? 3 : 4) };
  // warden: time to kill with the gun alone vs with an EMP whenever it is shielded
  const ward = (useEmp) => { set(true); C.start('ward'); const e = m.G.en.find(x => x.ctw); let t = 0; m.P.emp = useEmp ? 3 : 0; const s0 = S();
    while (t < 40 && e && !e.dead && e.hp > 0) { e.age = 0; if (e.x > 900) { m.step(1 / 60); continue; } m.touchTo(220, e.y); if (useEmp && e.wsh && e.x < 900 && m.P.emp > 0) m.press('Emp'); if (!useEmp) m.P.emp = 0; m.press('Fire'); m.step(1 / 60); t += 1 / 60; }
    const r = { t: +t.toFixed(1), strip: C.stat.strip - s0.strip }; m.abort(); return r; };
  const avg = (f) => { let a = 0, st = 0; for (let k = 0; k < 3; k++) { const r = f(); a += r.t; st += r.strip; } return { t: +(a / 3).toFixed(1), strip: st }; };
  out.ward = { without: avg(() => ward(false)), with: avg(() => ward(true)) };
  // combo: 5 foes of 30 hull around the ship; EMP alone vs DASH then EMP
  const combo = (dashFirst) => { set(true); const fs = []; for (let i = 0; i < 5; i++) { const e = shooter(); e.hp = e.max = e.hq = 30; e.x = 300 + 40 * i; e.y = 200 + 30 * i; fs.push([e, e.x, e.y]); }
    m.P.emp = 1; const s0 = C.stat.combo; if (dashFirst) { m.P.dx = 0; m.P.dy = 1; m.press('Dash'); for (let i = 0; i < 20; i++) m.step(1 / 60); m.P.x = 200; m.P.y = 270; }
    m.press('Emp'); for (let i = 0; i < 4; i++) { for (const [e, x, y] of fs) { e.x = x; e.y = y; } m.step(1 / 60); } const dmg = fs.reduce((a, [e]) => a + (30 - Math.max(0, e.hp)), 0); const r = { dmg, combo: C.stat.combo - s0 }; m.abort(); return r; };
  out.combo = { emp: combo(false), pair: combo(true) };
  // EMP timing: one press on an empty screen, one in a curtain
  { set(true); m.P.emp = 2; const g0 = C.stat.good, w0 = C.stat.waste; m.press('Emp'); m.step(1 / 60); C.start('curt'); for (let i = 0; i < 80; i++) m.step(1 / 60); const hot = document.getElementById('bEmp') ? document.getElementById('bEmp').classList.contains('abHot') || C.hot() : C.hot(); m.press('Emp'); m.step(1 / 60);
    out.timing = { waste: C.stat.waste - w0, good: C.stat.good - g0, hot }; m.abort(); }
  // vent: dash out of an overheat
  { set(true); m.P.heat = 100; m.P.over = true; m.press('Dash'); m.step(1 / 60); out.vent = !m.P.over; m.abort(); }
  // c: timed vs random on a mixed sequence (same press budget)
  const mixed = (mode, rd, re) => { set(false); const e = shooter(), pe = pin(e, 820, 270); const ks = ['seek', 'wall', 'curt', 'seek', 'wall', 'curt', 'seek', 'wall', 'curt', 'seek', 'wall', 'curt', 'seek'];
    const pump = i => { pe(); if (i % 240 === 30) { const k = ks[(i / 240) | 0]; if (k) { if (k === 'curt') m.P.emp = 1; C.start(k); } } }; pump.rd = rd; pump.re = re; const r = run(52, mode, pump); m.abort(); return r; };
  const tm = mixed('with'), t2 = mixed('with'); tm.lost = (tm.lost + t2.lost) / 2; const rd = tm.presses.d / (52 * 60), re = Math.max(.002, tm.presses.e / (52 * 60) * 3);
  let rs = [0, 0]; for (let k = 0; k < 3; k++) { seed = 11 + k * 97; const r = mixed('rand', rd, re); rs[0] += r.lost; rs[1] += r.presses.d; }
  out.mix = { timed: tm.lost, tpress: tm.presses, rand: +(rs[0] / 3).toFixed(1), rpress: Math.round(rs[1] / 3) };
  // e: threats in a real stage (Normal, stage 10, god), caps
  { m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(10); m.simOn(true); m.god = true; C.reset(); C.noAuto = 0; const s0 = S(); let i = 0; while (m.running && i < 60 * 90 && !m.ST.over) { if (m.SH.active) m.SH.close(); dodge(); if (i % 15 === 0) m.press('Fire'); m.step(1 / 60); i++; ebMax = Math.max(ebMax, m.G.eb.length); for (const b of m.G.eb) { const v = Math.hypot(b.vx, b.vy); if (v === v) vMax = Math.max(vMax, v); }; }
    const d = {}; for (const x in C.stat) d[x] = C.stat[x] - s0[x]; out.real = d; m.abort(); }
  out.ebMax = ebMax; out.vMax = Math.round(vMax); out.BCAP = m.BCAP; return out;
};
const OFF = () => { const m = window.__mnr, C = window.CTR; m.SET.diff = 'normal'; m.startStory(10); m.simOn(true); m.god = true; let i = 0, rr = 0; while (m.running && i < 60 * 60 && !m.ST.over) { if (m.SH.active) m.SH.close(); if (i % 15 === 0) m.press('Fire'); m.step(1 / 60); i++; rr += m.G.eb.filter(b => b.cxM).length + C.walls.length; }
  const r = { on: C.on, n: C.stat.seek + C.stat.wall + C.stat.curt + C.stat.ward, rr, walls: C.walls.length }; m.abort(); return r; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); const U = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`;
  let errs = 0;
  { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); });
    await p.goto(U('')); await READY(p); const o = await p.evaluate(SCN);
    const cmp = (k, label) => { const a = o[k].without, b = o[k].with; line(a.lost >= b.lost + 2 && a.lost >= 2 * Math.max(1, b.lost), `${label}: hull lost without ${a.lost}, with the timed answer ${b.lost} (${JSON.stringify(b.d)} / ${JSON.stringify(a.d)})`); };
    cmp('seek', 'SEEKER (parry dash)'); cmp('wall', 'LASER WALL (dash through)'); cmp('curt', 'CURTAIN (EMP)');
    line(o.ward.without.t >= 2 * o.ward.with.t && o.ward.with.strip > 0, `WARDEN (EMP strip): time to kill ${o.ward.without.t} s without EMP, ${o.ward.with.t} s with (${o.ward.with.strip} strips)`);
    line(o.combo.pair.combo === 1 && o.combo.pair.dmg >= o.combo.emp.dmg + 30, `COMBO dash->EMP: damage ${o.combo.pair.dmg} vs EMP alone ${o.combo.emp.dmg}`);
    line(o.timing.waste === 1 && o.timing.good === 1 && o.timing.hot, `EMP timing: empty screen = wasted (${o.timing.waste}), curtain = good (${o.timing.good}), button pulse ${o.timing.hot}`);
    line(o.vent, `DASH vents an overheat (${o.vent})`);
    line(o.mix.rand >= o.mix.timed + 2 && o.mix.rand >= 1.5 * o.mix.timed, `random presses lose ${o.mix.rand} hull (${o.mix.rpress} dashes), timed lose ${o.mix.timed} (${o.mix.tpress.d} dashes, ${o.mix.tpress.e} EMP)`);
    line(o.real.seek + o.real.wall + o.real.curt + o.real.ward >= 3, `real Normal stage 10 (90 s): seek ${o.real.seek} wall ${o.real.wall} curtain ${o.real.curt} warden ${o.real.ward}`);
    line(o.ebMax <= 48, `enemy bullets at most ${o.ebMax} (ebCap; tests add none by hand)`);
    line(o.vMax <= o.BCAP, `enemy bullet speed at most ${o.vMax} <= BCAP ${o.BCAP}`);
    await p.close(); }
  { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); await p.goto(U('&counter=0')); await READY(p); const o = await p.evaluate(OFF);
    line(!o.on && o.n === 0 && o.rr === 0 && o.walls === 0, `?counter=0: no threats (${o.n}), no marked bullets (${o.rr})`); await p.close(); }
  for (const [w, h] of [[390, 763], [763, 390]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }), p = await ctx.newPage(); p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); });
    await p.goto(`http://127.0.0.1:${port}/index.html?all=1`); await READY(p); await p.evaluate(() => window.__mnr.startStory(10)); await p.waitForTimeout(600);
    const r = await p.evaluate(() => ['bDash', 'bEmp'].map(id => { const e = document.getElementById(id); if (!e) return 0; const b = e.getBoundingClientRect(); return Math.min(b.width, b.height); }));
    line(r[0] >= 44 && r[1] >= 44, `${w}x${h}: DASH ${Math.round(r[0])} px, EMP ${Math.round(r[1])} px (>= 44)`); await ctx.close(); }
  line(errs === 0, `no page errors (${errs})`);
  await br.close(); srv.kill(); console.log(fails ? `FAIL counter-test: ${fails} check(s)` : 'PASS counter-test'); process.exit(fails ? 1 : 0);
})();
