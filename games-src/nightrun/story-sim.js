#!/usr/bin/env node
// Story balance bot: plays Nightrun Story stages headless in the real page, with the page stepped by hand (?sim=1: no audio, beat clock = game time at the real song tempo).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/story-sim.js
//   env: RUNS=20 (per stage) STAGES=1,6,12 PC=.4 (chance that a fire tap lands on the beat) PAR=4 MAXT=420 (game seconds before a run counts as failed) HARD=1 (Hard Endless instead: STAGES ignored)
// Prints clear-rate, time, hits and perfects per stage. The bot is the sweep's decide() (dodge grid, dash when a shot is near, EMP when swamped) with a ~50 ms reaction.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 20, PC = process.env.PC != null ? +process.env.PC : .4, PAR = +process.env.PAR || 4, MAXT = +process.env.MAXT || 420;
const STAGES = (process.env.STAGES || '1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(Number);
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
const BOT = (opts) => {
  const m = window.__mnr, rnd = Math.random; const { n, PC, MAXT, endless } = opts;
  if (opts.t2) Object.assign(m.TUNE2, opts.t2);
  if (endless) m.startStory(1); else m.startStory(n);
  m.simOn(true);
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270, tx = 220, bd = 1e9;
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
  const causes = {}; let hb = 0, hw = 0, lh = 0, bt0 = -1, bt1 = -1, i = 0, lastBeat = -1, tapAt = -1, d = null, cleared = false, fail = false;
  const dt = 1 / 60;
  while (m.running && m.G.t < MAXT) {
    if (m.SH.active) { m.SH.close(); }
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bp = m.bpos(), bn = Math.floor(bp);
    if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < PC ? 0 : (.15 + rnd() * .7)); }
    if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    if (m.G.boss && bt0 < 0 && m.G.boss.x < 800) bt0 = m.G.t;
    const pre = { eb: m.G.eb.map(b => [b.x, b.y]), en: m.G.en.map(e => [e.type, e.x, e.y, e.r]) };
    m.step(dt); i++;
    if (m.ST.hits > lh) { { let c = 'other'; const P = m.P; if (pre.eb.some(b => Math.hypot(b[0] - P.x, b[1] - P.y) < 40)) c = 'bullet'; else { const e = pre.en.find(e => Math.hypot(e[1] - P.x, e[2] - P.y) < e[3] + 40); if (e) c = 'touch:' + e[0]; else if (m.G.boss) c = 'boss/laser'; } causes[c] = (causes[c] || 0) + 1; } if (m.G.boss) hb += m.ST.hits - lh; else hw += m.ST.hits - lh; lh = m.ST.hits; }
    if (m.G.dead) break;
    if (!endless && m.ST.over) { cleared = true; bt1 = m.G.t; break; }
  }
  const G = m.G, P = m.P, ST = m.ST;
  const r = { n, clear: cleared, dead: G.dead, t: +G.t.toFixed(1), hits: ST.hits, perf: G.perf, score: G.score, kills: G.kills, bars: Math.floor(G.bc / 4), hp: P.hp, stars: cleared ? ST.stars.slice() : null, di: G.di, loop: G.loop, upg: Object.keys(m.SH.got).length, fight: bt0 >= 0 ? +((cleared ? bt1 : G.t) - bt0).toFixed(1) : 0, bhp: G.boss ? Math.round(G.boss.hp) : 0, hb, hw, causes };
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(); const jobs = [];
  for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push(n);
  const res = {}; let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await browser.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    while (next < jobs.length) { const n = jobs[next++]; const r = await p.evaluate(BOT, { n, PC, MAXT, endless: false, t2: process.env.T2 ? JSON.parse(process.env.T2) : null }); (res[n] = res[n] || []).push(r); if (errs.length) { console.log('PAGE ERROR', errs[0]); errs.length = 0; } }
    await p.close();
  }));
  await browser.close(); srv.kill();
  const avg = (a, k) => a.length ? (a.reduce((x, y) => x + (y[k] || 0), 0) / a.length) : 0;
  console.log('stage  clear%  time(s)  hits  perf  score   (runs ' + RUNS + ', perfect-chance ' + PC + ')');
  for (const n of STAGES) { const a = res[n], c = a.filter(x => x.clear); console.log(String(n).padStart(4), String(Math.round(100 * c.length / a.length)).padStart(6) + '%', avg(c.length ? c : a, 't').toFixed(0).padStart(7), avg(a, 'hits').toFixed(1).padStart(5), avg(a, 'perf').toFixed(0).padStart(5), avg(a, 'score').toFixed(0).padStart(8), ' hitsBoss ' + avg(a, 'hb').toFixed(1) + ' hitsWaves ' + avg(a, 'hw').toFixed(1) + ' fight ' + avg(a.filter(x => x.fight), 'fight').toFixed(0).padStart(3) + 's', '  3-star: ' + c.filter(x => x.stars[2]).length + ' perfStar: ' + c.filter(x => x.stars[1]).length); }
  for (const n of STAGES) { const cs = {}; for (const x of res[n]) for (const c in x.causes) cs[c] = (cs[c] || 0) + x.causes[c]; console.log('  hit causes stage ' + n + ': ' + JSON.stringify(cs)); }
  fs.writeFileSync(path.join(__dirname, 'playtest', 'story-sim.json'), JSON.stringify(res));
})().catch(e => { console.error(e); process.exit(2); });
