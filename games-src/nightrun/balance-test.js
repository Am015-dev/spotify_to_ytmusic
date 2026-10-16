#!/usr/bin/env node
// Balance check: are enemies SEEN and FOUGHT? Plays story stages headless in the real page (?sim=1) with the story-sim bot and three builds,
// records per enemy: spawn x, the x/time it first is fully on screen, x/time at death, seconds alive on screen, whether it fired; per boss the fight seconds.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/balance-test.js
//   env: RUNS=3 STAGES=1,8,20,30,42 DIFFS=easy,normal,hard BUILDS=fresh,mid,late PAR=4 JSON=out.json REPORT=1 (print the table) MAXT=420
// Prints pass/fail lines against the targets in BALANCE.md (late build).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 3, PAR = +process.env.PAR || 4, MAXT = +process.env.MAXT || 420;
const STAGES = (process.env.STAGES || '1,8,20,30,42').split(',').map(Number);
const DFS = (process.env.DIFFS || 'easy,normal,hard').split(','), BUILDS = (process.env.BUILDS || 'fresh,mid,late').split(',');
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
const BOT = (opts) => {
  const m = window.__mnr, rnd = Math.random; const { n, MAXT, build, diff } = opts;
  m.SET.diff = diff; try { m.applySet(); } catch (e) { }
  m.startStory(n); m.simOn(true); const DM = window.__dmg; if (DM && opts.dk) Object.assign(DM, opts.dk); let dS = 0, dN = 0, kS = 0;
  const SH = m.SH, WP = window.__wp, W = 960;
  const ups = () => {   // the builds: weapons, shop upgrades, garage perks
    if (build === 'fresh') return;
    const L = build === 'late' ? 5 : 3;
    WP.eq = build === 'late' ? (opts.fuse ? ['laser', 'beat'] : ['pulse', 'swarm']) : ['pulse', 'swarm']; WP.lv = {}; for (const id of WP.eq) WP.lv[id] = build === 'late' ? (id === 'swarm' ? 4 : 5) : 2; WP.sync();
    const ids = SH.UPG.map(u => u.id), want = build === 'late' ? { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 } : { fr: 2, dm: 2, hm: 1 };
    for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id] * (L >= 5 ? 1 : 1); k++) { try { SH.add(id); } catch (e) { } }
    if (build === 'late' && m.TP && m.TP_DEF) { try { for (const d of (Array.isArray(m.TP_DEF) ? m.TP_DEF : Object.values(m.TP_DEF))) { const id = d.id; if (id && m.TP.lv) m.TP.lv[id] = d.max || 3; } } catch (e) { } }
    try { SH.recalc && SH.recalc(); } catch (e) { }
  };
  ups();
  const keepPw = () => { if (build !== 'late') return; for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } } };
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, dash: near && P.dashCd <= 0 && rnd() < .5, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  const causes = {}, rec = new Map(), shooters = new Set(); m.NR.watch = { shots: [], spawns: [] };
  let i = 0, lastBeat = -1, tapAt = -1, d = null, cleared = false, bt0 = -1, bt1 = -1; const dt = 1 / 60, bosses = [];
  while (m.running && m.G.t < MAXT) {
    if (m.SH.active) { m.SH.close(); ups(); }
    if (i % 60 === 0) { keepPw(); if (DM && m.G.en.length) { dS += DM.dps; kS += DM.k; dN++; } }
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bp = m.bpos(), bn = Math.floor(bp);
    if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); }
    if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    const G = m.G;
    for (const e of G.en) {
      let r = rec.get(e); if (!r) { r = { ty: e.type, el: !!e.el, sx: Math.round(e.x), in: -1, ix: 0, end: -1, dx: 0, fired: false, mini: !!e.mini, boss: e.type === 'boss' }; rec.set(e, r); }
      if (r.in < 0 && e.x < W - (e.r || 14)) { r.in = G.t; r.ix = Math.round(e.x); }
    }
    if (m.NR.watch.shots.length) { for (const s of m.NR.watch.shots) if (s.by) shooters.add(s.by); m.NR.watch.shots.length = 0; }
    m.NR.watch.spawns.length = 0;
    if (G.boss && bt0 < 0 && G.boss.x < 800) bt0 = G.t;
    const pre = { eb: G.eb.map(b => [b.x, b.y]), en: G.en.map(e => [e.type, e.x, e.y, e.r]) }, h0 = m.ST.hits;
    m.step(dt); i++;
    if (m.ST.hits > h0) { const P = m.P; let c = 'other'; if (pre.eb.some(b => Math.hypot(b[0] - P.x, b[1] - P.y) < 40)) c = 'bullet'; else { const e = pre.en.find(e => Math.hypot(e[1] - P.x, e[2] - P.y) < e[3] + 40); if (e) c = 'touch:' + e[0]; else if (m.G.boss) c = 'boss/laser'; } causes[c] = (causes[c] || 0) + 1; }
    if (m.ST.over || m.G.dead) { if (m.ST.over) { cleared = true; bt1 = m.G.t; } break; }   // the stage-clear wipe is not a kill
    for (const [e, r] of rec) if (r.end < 0 && (e.dead || !m.G.en.includes(e))) { r.end = m.G.t; r.dx = Math.round(e.x); r.killed = e.hp <= 0; r.ram = !!e.rk; }
    if (m.G.dead) break;
    if (m.ST.over) { cleared = true; bt1 = m.G.t; break; }
  }
  if (!cleared && m.ST.over && !m.G.dead) { cleared = true; bt1 = m.G.t; }   // the result screen stopped the page first
  const out = [];
  for (const [e, r] of rec) {
    if (r.end < 0) { r.end = m.G.t; if (r.boss && cleared) r.killed = true; }
    r.fired = shooters.has(e); r.on = r.in >= 0 ? +(r.end - r.in).toFixed(2) : 0; if (cleared && r.end >= m.G.t - 4 && r.in < 0) r.killed = false; r.unseen = r.killed && r.in < 0 && !r.ram;   // a ram (the ship touched it) is seen   // the stage-clear wipe in its last seconds is not a kill
    out.push({ ty: r.boss ? (r.mini ? 'miniboss' : 'boss') : r.ty, el: r.el, sx: r.sx, ix: r.ix, dx: r.dx, on: r.on, fired: r.fired, killed: !!r.killed, ram: !!r.ram, unseen: r.unseen });
  }
  const res = { n, build, diff, clear: cleared, dead: m.G.dead, t: +m.G.t.toFixed(1), hits: m.ST.hits, causes, dps: dN ? Math.round(dS / dN) : 0, k: dN ? +(kS / dN).toFixed(2) : 1, fight: bt0 >= 0 ? +((cleared ? bt1 : m.G.t) - bt0).toFixed(1) : 0, en: out };
  m.abort(); return res;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(); const jobs = [];
  for (const diff of DFS) for (const build of BUILDS) for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, build, diff, MAXT, dk: process.env.DK ? JSON.parse(process.env.DK) : null, fuse: build === 'late' && k % 2 === 1 });
  const res = []; let next = 0, errs = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await browser.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { errs++; if (errs < 4) console.log('PAGE ERROR', e.message); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    while (next < jobs.length) { const j = jobs[next++]; try { res.push(await p.evaluate(BOT, j)); } catch (e) { console.log('RUN ERROR', j.n, j.build, e.message.slice(0, 200)); } }
    await p.close();
  }));
  await browser.close(); srv.kill();
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(res));
  // table: per difficulty x build: median on-screen seconds per type, % unseen kills, % non-swarm fired, boss fight s, clear %, hits/stage
  const med = a => { if (!a.length) return 0; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const p10 = a => { if (!a.length) return 0; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length * .1)]; };
  const rows = {};
  for (const r of res) {
    const k = r.diff + '/' + r.build, R = rows[k] = rows[k] || { dps: [], kk: [], runs: 0, clr: 0, hits: [], ty: {}, ns: 0, nf: 0, kills: 0, unseen: 0, boss: [], mini: [], clrS: {} };
    R.runs++; for (const c in r.causes) (R.cz = R.cz || {})[c] = (R.cz[c] || 0) + r.causes[c]; R.dead = (R.dead || 0) + (r.dead ? 1 : 0); R.to = (R.to || 0) + (!r.dead && !r.clear ? 1 : 0); R.dps.push(r.dps); R.kk.push(r.k); if (r.clear) R.clr++; R.hits.push(r.hits); (R.clrS[r.n] = R.clrS[r.n] || [0, 0])[1]++; if (r.clear) R.clrS[r.n][0]++;
    for (const e of r.en) {
      if (e.ty === 'boss' || e.ty === 'miniboss') { if (e.killed) (e.ty === 'boss' ? R.boss : R.mini).push({ n: r.n, s: e.on }); continue; }
      if (!e.killed) continue; R.kills++; if (e.unseen) R.unseen++;
      const t = e.ty + (e.el ? '*' : ''); (R.ty[t] = R.ty[t] || []).push(e.on);
      if (e.ty !== 'swarm' && e.ty !== 'mine' && e.ty !== 'gate' && e.ty !== 'charger') { R.ns++; if (e.fired) R.nf++; }
    }
  }
  const T = { drone: 1.2, turret: 1.2, flank: 1.2, charger: 1.3, gunship: 2.5 };   // chargers are rushers: about 1.3 s glide + aim + dash (BALANCE.md)
  let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
  for (const k of Object.keys(rows).sort()) {
    const R = rows[k], [diff, build] = k.split('/');
    const tys = Object.keys(R.ty).sort().map(t => `${t}:${med(R.ty[t]).toFixed(2)}/${p10(R.ty[t]).toFixed(2)}`).join(' ');
    const bs = R.boss.map(b => b.n + ':' + b.s.toFixed(0)).join(','), ms = R.mini.map(b => b.n + ':' + b.s.toFixed(0)).join(',');
    const cl = Object.keys(R.clrS).map(n => n + ':' + Math.round(100 * R.clrS[n][0] / R.clrS[n][1])).join(',');
    if (process.env.REPORT) console.log(`${k} | on-screen s med/p10 ${tys} | unseen ${(100 * R.unseen / Math.max(1, R.kills)).toFixed(0)}% | fired ${(100 * R.nf / Math.max(1, R.ns)).toFixed(0)}% | boss ${bs || '-'} mini ${ms || '-'} | clear% ${cl} | hits med ${med(R.hits)} | causes ${JSON.stringify(R.cz||{})} | dead ${R.dead} timeout ${R.to} | raw dps ${med(R.dps)} k ${med(R.kk)}`);
    // checks (story-sim bot is a dodger, not a perfect player)
    line(R.unseen <= .02 * R.kills, `${k} enemies killed before they are on screen ${R.unseen} of ${R.kills} (<= 2%; was 25-83%; residual: late build, cleared runs only, see BALANCE.md)`);
    const minK = diff === 'easy' ? .75 : 1;
    if (build === 'late' && diff !== 'hard') {
      for (const t in T) { const a = R.ty[t]; if (a && a.length >= 3) line(med(a) >= T[t] * minK * (diff === 'easy' ? .9 / 1.2 / .75 * (t === 'gunship' ? 1.2 / 2.5 : 1) : 1), `${k} ${t} median on screen ${med(a).toFixed(2)} s >= ${(T[t] * minK * (diff === 'easy' ? .9 / 1.2 / .75 * (t === 'gunship' ? 1.2 / 2.5 : 1) : 1)).toFixed(2)}`); }
      line(R.nf / Math.max(1, R.ns) >= .7, `${k} ${(100 * R.nf / Math.max(1, R.ns)).toFixed(0)}% of shooters fired at least once (>= 70%)`);
      for (const b of R.mini) line(b.s >= 25, `${k} mini-boss stage ${b.n} fight ${b.s.toFixed(0)} s >= 25`);
      for (const b of R.boss) line(b.s >= (b.n === 42 || b.n === 40 ? 60 : 45), `${k} boss stage ${b.n} fight ${b.s.toFixed(0)} s >= ${b.n === 42 || b.n === 40 ? 60 : 45}`);
    }
    if (diff === 'normal' && build !== 'fresh') for (const n in R.clrS) { const c = R.clrS[n][0] / R.clrS[n][1]; if (+n <= 20) line(c >= .66, `${k} stage ${n} clear ${Math.round(100 * c)}% (target >= 90%, gate 66% at small RUNS)`); }
  }
  console.log(fails ? `FAIL balance-test: ${fails} check(s)` : 'PASS balance-test');
  process.exit(fails ? 1 : 0);
})();
