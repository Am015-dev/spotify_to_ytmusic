#!/usr/bin/env node
// Nightrun difficulty bench: plays Endless (or a Story stage) headless in the real page, stepped by hand (?sim=1: no audio, beat clock = game time), at Easy / Normal / Hard,
// with four kinds of player. Prints survival, hits, tier and score so the difficulty numbers are measured, not guessed.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/d-sim.js
//   env: DK='{"hard":{"xw":4}}' (try other difficulty numbers without a rebuild) RUNS=12 (per cell) DIFFS=easy,normal,hard TYPES=idle,careless,natural,skilled CAP=120 (game seconds) PAR=4 STAGE=0 (0 = Endless, 1..12 = that Story stage)
// idle = finger down, never steers; careless = drifts around at random, dashes at random; natural = the sweep's dodge bot, dashes when a shot is close, ignores the beat;
// skilled = the same bot but holds each dash for the next beat (what a player who reads the pulse does).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 12, CAP = +process.env.CAP || 120, PAR = +process.env.PAR || 4, STAGE = +process.env.STAGE || 0;
const DIFFS = (process.env.DIFFS || 'easy,normal,hard').split(','), TYPES = (process.env.TYPES || 'idle,careless,natural,skilled').split(',');
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
const BOT = (o) => {
  const m = window.__mnr; if (o.dk && o.dk[o.diff]) Object.assign(m.DIFFS[o.diff], o.dk[o.diff]); m.setVal('diff', o.diff);
  if (o.stage) m.startStory(o.stage); else document.getElementById('startBtn').click();
  m.simOn(true);
  const rnd = Math.random;
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270, tx = 220, bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      c += (m.FUN ? m.FUN.cost(cy) : 0); c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, near, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  let i = 0, d = null, rx = 300, ry = 270, tierSum = 0, tierN = 0, firstHit = -1, hp0 = m.P.hp, lastHp = hp0, cleared = false;
  const dt = 1 / 60;
  if (o.type === 'idle') m.touchTo(140, 270);
  while (m.running && m.G.t < o.cap) {
    if (m.SH.active) m.SH.close();
    if (o.type === 'natural' || o.type === 'skilled') {
      if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.emp) m.press('Emp'); }
      if (d && d.near && m.P.dashCd <= 0 && i % 3 === 0) {
        const bp = m.bpos(), fr = bp - Math.round(bp), win = (fr * m.BT.spb * 1000) > -(m.winMs()) && (fr * m.BT.spb * 1000) < 40;   // beat is coming up inside the window (or just passed)
        if (o.type === 'natural' ? rnd() < .5 : win) m.press('Dash');
      }
    } else if (o.type === 'careless') {
      if (i % 40 === 0) { rx = 100 + rnd() * 700; ry = 60 + rnd() * 420; m.touchTo(rx, ry); }
      if (i % 90 === 0 && rnd() < .5) m.press('Dash');
    }
    m.step(dt); i++;
    if (i % 30 === 0) { tierSum += m.tierOf(m.C.n); tierN++; }
    if (m.P.hp < lastHp) { if (firstHit < 0) firstHit = m.G.t; lastHp = m.P.hp; }
    if (m.G.dead) break;
    if (o.stage && m.ST.over) { cleared = true; break; }
  }
  const G = m.G, P = m.P;
  const r = { dead: !!G.dead, t: +G.t.toFixed(1), hits: hp0 - P.hp, firstHit: +firstHit.toFixed(1), tier: +(tierSum / Math.max(1, tierN)).toFixed(2), score: G.score, kills: G.kills, di: G.di, cleared, fun: m.FUN ? Object.assign({}, m.FUN.stat) : null, minis: m.DIR && m.DIR.log ? m.DIR.log.mini : 0 };
  m.abort(); return r;
};
module.exports = { BOT };
if (require.main === module) (async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(), jobs = [];
  for (const diff of DIFFS) for (const type of TYPES) for (let k = 0; k < RUNS; k++) jobs.push({ diff, type });
  const res = {}; let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await browser.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr);
    while (next < jobs.length) { const j = jobs[next++]; const r = await p.evaluate(BOT, { ...j, cap: CAP, stage: STAGE, dk: process.env.DK ? JSON.parse(process.env.DK) : null }); (res[j.diff + '/' + j.type] = res[j.diff + '/' + j.type] || []).push(r); if (errs.length) { console.log('PAGE ERROR', errs[0]); errs.length = 0; } }
    await p.close();
  }));
  await browser.close(); srv.kill();
  const avg = (a, k) => a.reduce((x, y) => x + (y[k] || 0), 0) / Math.max(1, a.length);
  console.log(`difficulty bench: ${STAGE ? 'Story stage ' + STAGE : 'Endless'}, ${RUNS} runs per cell, cap ${CAP} s`);
  console.log('diff    player    died%  survive(s)  firstHit(s)  hits  avgTier  score   ' + (STAGE ? 'clear%' : ''));
  const out = {};
  for (const diff of DIFFS) for (const type of TYPES) { const a = res[diff + '/' + type]; if (!a) continue;
    const row = { died: Math.round(100 * a.filter(x => x.dead).length / a.length), t: avg(a, 't'), fh: avg(a.filter(x => x.firstHit >= 0), 'firstHit'), hits: avg(a, 'hits'), tier: avg(a, 'tier'), score: avg(a, 'score'), clear: Math.round(100 * a.filter(x => x.cleared).length / a.length) };
    out[diff + '/' + type] = row;
    console.log(diff.padEnd(7), type.padEnd(9), String(row.died).padStart(5) + '%', row.t.toFixed(0).padStart(9), row.fh.toFixed(1).padStart(11), row.hits.toFixed(1).padStart(6), row.tier.toFixed(2).padStart(7), row.score.toFixed(0).padStart(8), STAGE ? String(row.clear).padStart(6) + '%' : ''); }
  { const f = Object.values(res).flat().filter(x => x.fun); if (f.length) console.log('fun events per run (' + f.length + ' runs): ' + ['sets', 'fences', 'drops', 'dropsHit', 'rewards'].map(k => k + ' ' + (f.reduce((a, x) => a + x.fun[k], 0) / f.length).toFixed(1)).join(', ') + ', minis ' + (f.reduce((a, x) => a + x.minis, 0) / f.length).toFixed(1)); }
  fs.writeFileSync(path.join(__dirname, 'playtest', 'd-sim' + (STAGE ? '-s' + STAGE : '') + '.json'), JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(2); });
