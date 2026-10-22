#!/usr/bin/env node
// Enemies that react (parts/enemies/react.js, flag RET.react). NODE_PATH=$(npm root -g) node games-src/nightrun/react-test.js   env: RUNS=6 (bot runs per stage) STAGES=3,7,12
// (a) predictability: the same stage 5 times (5 dice seeds, a fixed ship path): spread of enemy positions and fire times, ?react=0 vs on
// (b) every state acts in a scenario (?rxs=<state>), squads (pin/exit, leader, bearer) form
// (c) caps: bullets <= ebCap, speed <= BCAP, every tell >= 0.6 s, a free gap >= 96 px in front of the ship
// (d) flag off: with seeded dice, ?react=0 spawns and shoots exactly what the page without react.js does
// (e) Normal: dodging bot clears >= 66%, a tracker/camper bot (sits on the nearest foe's line, never dodges) <= 20%
// (f) no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = path.resolve(__dirname, '../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 10, STAGES = (process.env.STAGES || '3,7,12').split(',').map(Number);
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const pass = [], fail = [], ok = (c, m) => (c ? pass : fail).push(m);
// a fixed ship path, god mode: samples enemy positions and shots
const TRACE = (o) => {
  const m = window.__mnr; if (m.running) m.abort(); m.simOn(true); m.SET.diff = 'normal'; window.__reseed && window.__reseed(o.seed); window.__rxseed = o.rs; m.startStory(o.n); m.simOn(true);
  const G = m.G, P = m.P, dt = 1 / 60, ys = [], fires = [], spawns = []; let i = 0, nb = 0, maxEb = 0, maxV = 0, minGap = 1e9, gaps = 0;
  const cap = typeof ebCap === 'function' ? ebCap() : 25;
  while (m.running && G.t < o.T) {
    if (m.SH.active) m.SH.close(); P.hp = 99;
    m.touchTo((o.fx || 220) + 60 * Math.sin(G.t * .7), 270 + 170 * Math.sin(G.t * 1.1)); if (i % 20 === 0) m.press('Fire');
    if (o.pair && i % 300 === 150) { RX.spawn('turret', { y: 160 + 200 * Math.random(), stop: 760 }); RX.spawn('drone', { x: 1000, y: 300 }); }   // a gunner + a drone on one frame (bearer squad)
    const n0 = G.eb.length; m.step(dt); i++;
    if (G.eb.length > n0) fires.push(+G.t.toFixed(2));
    maxEb = Math.max(maxEb, G.eb.length); for (const b of G.eb) if (b.rxb) maxV = Math.max(maxV, Math.hypot(b.vx, b.vy));
    if (i % 15 === 0) { const e = G.en.filter(e => ['drone', 'flank', 'turret', 'gunship'].includes(e.type)); ys.push(e.map(e => [Math.round(e.x), Math.round(e.y)]));
      const col = G.eb.filter(b => b.x > P.x - 20 && b.x < P.x + 140).map(b => b.y).sort((a, b) => a - b); if (col.length) { let g = 0, last = 0; for (const y of col) { g = Math.max(g, y - 5 - last); last = y + 5; } g = Math.max(g, 540 - last); minGap = Math.min(minGap, g); gaps++; } } }
  const r = { ys, fires, spawns: (G.spawns || []).slice(0, 60), maxEb, cap: cap + 5, maxV, minGap, gaps, rx: window.RX ? { stat: RX.stat, act: RX.act } : null };
  m.abort(); return r;
};
const BOT = (o) => {
  const m = window.__mnr, rnd = Math.random; m.SET.diff = 'normal'; m.startStory(o.n); m.simOn(true); const G = m.G, P = m.P, dt = 1 / 60;
  const dec = () => { let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    if (o.track) return { bx: 200, by: ty };
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      if (G.boss && G.boss.lasers) for (const l of G.boss.lasers) { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = cx - l.x, py = cy - l.y; if (px * vx + py * vy > -20) { const dl = Math.abs(px * vy - py * vx); if (dl < 50) c += (50 - dl) * 80; } }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy); if (d < e.r + 50) c += (e.r + 50 - d) * 60; if (e.rx && e.rx.tl > 0 && e.rx.kind === 'dive') { const d2 = Math.hypot(e.rx.lx - cx, e.rx.ly - cy); if (d2 < 60) c += (60 - d2) * 40; } }
      if (window.MM && MM.col) c += MM.cost(cx);   // the column strike (fair.js, must move), as story-sim sees it
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; } }
    return { bx, by }; };
  let i = 0, lastBeat = -1, tapAt = -1, d = null, cleared = false;
  while (m.running && G.t < 420) { if (m.SH.active) m.SH.close();
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (!o.track) { const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30); if (near && P.dashCd <= 0 && rnd() < .5) m.press('Dash'); if (P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near))) m.press('Emp'); } }
    const bp = m.bpos(), bn = Math.floor(bp); if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); } if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    m.step(dt); i++; if (G.dead) break; if (m.ST.over) { cleared = true; break; } }
  const r = { clear: cleared }; m.abort(); return r;
};
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rx-')), html = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8'), rx = fs.readFileSync(path.join(__dirname, 'parts/enemies/react.js'), 'utf8');
  fs.symlinkSync(path.join(GAME_DIR, 'media'), path.join(tmp, 'media')); try { fs.symlinkSync(path.join(GAME_DIR, 'music'), path.join(tmp, 'music')); } catch (e) { }
  ok(html.includes(rx), 'built page carries parts/enemies/react.js'); fs.writeFileSync(path.join(tmp, 'index.html'), html.replace(rx, ''));
  const port = await freePort(), port2 = await freePort();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }), srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 900)); const br = await PW.chromium.launch(), errs = [];
  const open = async (url, seed) => { const p = await br.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', e => errs.push(e.message)); if (seed) await p.addInitScript(SEED); await p.goto(url); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { }); return p; };
  const U = (q, pt) => `http://127.0.0.1:${pt || port}/index.html?sim=1&all=1${q}${process.env.Q || ""}`;
  // (a)
  const spread = rs => { let s = 0, k = 0; for (let a = 0; a < rs.length; a++) for (let b = a + 1; b < rs.length; b++) { const L = Math.min(rs[a].ys.length, rs[b].ys.length); for (let j = 0; j < L; j++) for (const p of rs[a].ys[j]) { let md = 200; for (const q of rs[b].ys[j]) md = Math.min(md, Math.hypot(p[0] - q[0], p[1] - q[1])); s += md; k++; } } return s / Math.max(1, k); };
  const spreadOld = rs => { let sy = 0, k = 0; const L = Math.min(...rs.map(r => r.ys.length)); for (let j = 0; j < L; j++) { const ms = rs.map(r => r.ys[j].length ? r.ys[j].reduce((a, p) => a + p[1], 0) / r.ys[j].length : 270); const mu = ms.reduce((a, b) => a + b, 0) / ms.length; sy += Math.sqrt(ms.reduce((a, b) => a + (b - mu) ** 2, 0) / ms.length); k++; } return sy / Math.max(1, k); };
  const fspread = rs => { const L = Math.min(...rs.map(r => r.fires.length), 40); let s = 0; for (let j = 0; j < L; j++) { const v = rs.map(r => r.fires[j]), mu = v.reduce((a, b) => a + b, 0) / v.length; s += Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length); } return s / Math.max(1, L); };
  const res = {};
  for (const q of ['&react=0', '']) { res[q] = [];
    for (let s = 0; s < 5; s++) { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(SEED); await p.goto(U(q)); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { });   // a fresh page per attempt: no saved state carries over
      res[q].push(await p.evaluate(TRACE, { n: 7, seed: 4242, T: 45, rs: 1000 + 37 * s, pair: 1 }).catch(e => ({ ys: [], fires: [], err: '' + e }))); await ctx.close(); } }   // same dice: only react's own per-run seed differs
  const s0 = spread(res['&react=0']), s1 = spread(res['']), f0 = fspread(res['&react=0']), f1 = fspread(res['']);
  console.log(`  predictability, stage 7 + a scripted turret/drone pair every 10 s, x5 (same dice): enemy position gap between attempts ${s0.toFixed(1)} -> ${s1.toFixed(1)} px, fire-time spread ${f0.toFixed(2)} -> ${f1.toFixed(2)} s`);
  ok(s1 > s0 + 15 && f1 > f0 + .3, `(a) enemy position/fire-time spread rose (${s0.toFixed(1)}->${s1.toFixed(1)} px, ${f0.toFixed(2)}->${f1.toFixed(2)} s)`);
  // (b) + (c)
  const acts = {}, st = {}; let caps = true, minGap = 1e9, minTell = 9, gaps = 0;
  const all = res[''].slice();
  for (const s of ['hunt', 'feint', 'retreat', 'press', 'bait', 'window']) { const p = await open(U('&rxs=' + s), true); const r = await p.evaluate(TRACE, { n: s === 'window' ? 12 : 7, seed: 77, T: 60, rs: 5, fx: s === 'retreat' ? 520 : 0, pair: s === 'hunt' || s === 'retreat' || s === 'press' }); all.push(r); acts[s] = r.rx ? r.rx.act[s] : 0; await p.close(); }
  for (const r of all) { if (!r.rx) continue; for (const k in r.rx.stat) st[k] = (st[k] || 0) + (k === 'minTell' ? 0 : r.rx.stat[k]); minTell = Math.min(minTell, r.rx.stat.minTell); if (r.maxEb > r.cap || r.maxV > 401) caps = false; minGap = Math.min(minGap, r.minGap); gaps += r.gaps; }
  console.log('  state actions (forced): ' + JSON.stringify(acts) + '  squads: pin ' + st.pin + ' leader ' + st.leader + ' enrage ' + st.enrage + ' cover ' + st.cover + ' blocks ' + st.block);
  for (const s in acts) ok(acts[s] > 0, `(b) state ${s.toUpperCase()} acts in its scenario (${+(+acts[s]).toFixed(1)})`);
  ok(st.pin > 0 && st.leader > 0 && st.cover > 0, `(b) squads form: pin/exit ${st.pin}, leader ${st.leader}, bearer ${st.cover}`);
  ok(caps, `(c) bullets <= ebCap and react's shots <= BCAP in every trace (max ${Math.max(...all.map(r => r.maxEb || 0))}/${all[0].cap}, ${Math.max(...all.map(r => r.maxV || 0)).toFixed(0)} px/s)`);
  ok(minTell >= .6, `(c) every tell >= 0.6 s (min ${minTell.toFixed(2)})`);
  ok(minGap >= 96, `(c) free gap in front of the ship >= 96 px in ${gaps} samples (min ${minGap.toFixed(0)})`);
  // (d)
  { const a = await open(U('&react=0'), true), b = await open(U('', port2), true); let same = 0;
    for (const n of [3, 12, 20]) { const ra = await a.evaluate(TRACE, { n, seed: 555, T: 30 }), rb = await b.evaluate(TRACE, { n, seed: 555, T: 30 }); if (JSON.stringify([ra.spawns, ra.fires, ra.ys]) === JSON.stringify([rb.spawns, rb.fires, rb.ys])) same++; else console.log('  diff stage ' + n); }
    ok(same === 3, `(d) ?react=0 = the page without react.js (stages 3/12/20, seeded spawns, shots and positions) ${same}/3`); await a.close(); await b.close(); }
  // (e)
  const clr = async (track, q) => { let c = 0, n = 0; const p = await open(U(q || '')); for (const s of STAGES) for (let k = 0; k < RUNS; k++) { const r = await p.evaluate(BOT, { n: s, track }).catch(() => ({ clear: false })); n++; if (r.clear) c++; } await p.close(); return c / n; };
  const [cd, ct, c0, t0] = await Promise.all([clr(false), clr(true), clr(false, '&react=0'), clr(true, '&react=0')]);
  console.log(`  Normal clear, stages ${STAGES} x${RUNS}: dodging bot ${(100 * c0).toFixed(0)}% -> ${(100 * cd).toFixed(0)}%, tracker bot ${(100 * t0).toFixed(0)}% -> ${(100 * ct).toFixed(0)}% (react=0 -> on)`);
  ok(cd >= .66, `(e) dodging bot clears >= 66% on Normal (${(100 * cd).toFixed(0)}%)`); ok(ct <= .2, `(e) tracker/camper bot <= 20% (${(100 * ct).toFixed(0)}%)`);
  ok(!errs.length, '(f) no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await br.close(); srv.kill(); srv2.kill();
  for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
