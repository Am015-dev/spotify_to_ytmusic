#!/usr/bin/env node
// Nightrun endless bot bench (F): how far do three kinds of player get through the endless cycle? Headless in the real page (?sim=1: no audio, the beat clock is game time).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/f-sim.js
//   env: RUNS=8 per cell, TYPES=careless,average,good, DIFFS=normal, CAP=5400 (game seconds), PAR=4, GARAGE=1 (the good bot has bought garage perks), DK='{"normal":{"d":1.6}}'
// careless = drifts about at random and dashes at random, buys nothing. average = dodges (the sweep's bot), dashes when a shot is close and ignores the beat, buys the first card it can afford.
// Perception is delayed like a person's: average sees the world 200 ms late (LAGA frames, default 12), good 100 ms (LAGG, default 6).
// good = the same bot but holds each dash for the beat, buys the recommended card at every pit stop and has a mid-game garage (GARAGE=1).
// Output: districts cleared (a district counts when its boss is down; cycle = Bank, Main, Ostend, Athens, Messe, then loop 2), death place, hits, Neon, upgrades, score.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 8, CAP = +process.env.CAP || 5400, PAR = +process.env.PAR || 4;
const DIFFS = (process.env.DIFFS || 'normal').split(','), TYPES = (process.env.TYPES || 'careless,average,good').split(',');
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
const BOT = (o) => {
  const m = window.__mnr; if (o.dk && o.dk[o.diff]) Object.assign(m.DIFFS[o.diff], o.dk[o.diff]); if (o.t2) Object.assign(m.TUNE2, o.t2); m.setVal('diff', o.diff);
  if (o.type === 'good' && o.garage) { const t = { dmg: 4, rof: 3, shd: 1, hul: 1, dsh: 1, mag: 2, ckp: 2, crt: 2, drn: 1, rgn: 1 }; for (const k in t) m.GA.tune[k] = t[k]; }
  document.getElementById('startBtn').click(); m.simOn(true);
  const rnd = Math.random;
  // perception is delayed like a person's: the bot decides from a snapshot taken `lag` frames ago (bullets are extrapolated, bullets fired since are unseen)
  const snaps = [];
  const snap = (i) => { const G = m.G; const sn = { i, eb: G.eb.map(b => [b.x, b.y, b.vx, b.vy]), en: G.en.map(e => [e.type, e.x, e.y, e.r, e.gy, e.gap]) }; snaps.push(sn); if (snaps.length > 12) snaps.shift(); };
  const view = (i, lag) => { let v = snaps[0]; for (const s of snaps) if (s.i <= i - lag) v = s; return v; };
  const dec = (v, i) => {
    const G = m.G, P = m.P, dtl = (i - v.i) / 60; let ty = 270, tx = 220, bd = 1e9;
    for (const e of v.en) { if (e[0] === 'boss') { if (e[1] < 960) ty = e[2]; continue; } const dx = e[1] - P.x; if (dx > 0 && dx < bd && e[1] < 940) { bd = dx; ty = e[0] === 'gate' ? e[4] : e[2]; } }
    const eb = v.eb.map(b => [b[0] + b[2] * dtl, b[1] + b[3] * dtl, b[2], b[3]]);
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of eb) { const px = b[0] + b[2] * .14, py = b[1] + b[3] * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      for (const e of v.en) { if (e[0] === 'gate') { if (Math.abs(e[1] - cx) < 60 && (cy < e[4] - e[5] / 2 + 12 || cy > e[4] + e[5] / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e[1] - cx, e[2] - cy), r = e[3] + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = eb.some(b => Math.hypot(b[0] + b[2] * .08 - P.x, b[1] + b[3] * .08 - P.y) < 30);
    return { bx, by, near, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  let i = 0, d = null, rx = 300, ry = 270, hp0 = m.P.hp, lastHp = hp0, bossKills = 0, wasBoss = false, hits = 0, neonMax = 0, pits = 0; const causes = {}, hitsBy = {};
  const dt = 1 / 60, LAG = { average: +o.lagA || 12, good: +o.lagG || 6 };
  const shop = () => {                                      // a pit stop: wait for the lock, buy by the bot's rule, go
    const h = m.SH; pits++;
    if (o.type === 'careless') { h.close(); return; }
    for (let k = 0; k < 40 && h.lock > 0; k++) m.step(dt);
    for (let guard = 0; guard < 6; guard++) {
      let idx = -1;
      if (o.type === 'good') idx = h.rec != null && h.rec >= 0 ? h.rec : -1;
      else idx = h.cards.findIndex(c => !c.sold && h.neon >= h.price(c.u));
      if (idx < 0 || !h.cards[idx] || h.cards[idx].sold) break;
      if (!h.buy(idx)) break; h.draw();
    }
    h.close();
  };
  while (m.running && m.G.t < o.cap) {
    if (m.SH.active) { shop(); continue; }
    if (o.type === 'average' || o.type === 'good') {
      if (i % 3 === 0) snap(i);
      if (i % 3 === 0) { d = dec(view(i, LAG[o.type]), i); m.touchTo(d.bx, d.by); if (d.emp) m.press('Emp'); }
      if (d && d.near && m.P.dashCd <= 0 && i % 3 === 0) {
        const bp = m.bpos(), fr = bp - Math.round(bp), win = (fr * m.BT.spb * 1000) > -(m.winMs()) && (fr * m.BT.spb * 1000) < 40;
        if (o.type === 'average' ? rnd() < .5 : win) m.press('Dash');
      }
    } else if (o.type === 'careless') {
      if (i % 40 === 0) { rx = 100 + rnd() * 700; ry = 60 + rnd() * 420; m.touchTo(rx, ry); }
      if (i % 90 === 0 && rnd() < .5) m.press('Dash');
    }
    const pre = { eb: m.G.eb.map(b => [b.x, b.y]), en: m.G.en.map(e => [e.type, e.x, e.y, e.r]) };
    m.step(dt); i++;
    if (m.P.hp < lastHp) { hits += lastHp - m.P.hp; { const k = m.G.pos + 5 * m.G.loop; hitsBy[k] = (hitsBy[k] || 0) + lastHp - m.P.hp; } let c = 'laser/gate/other'; const P = m.P;
      if (pre.eb.some(b => Math.hypot(b[0] - P.x, b[1] - P.y) < 40)) c = 'bullet'; else { const e = pre.en.find(e => Math.hypot(e[1] - P.x, e[2] - P.y) < e[3] + 40); if (e) c = 'touch:' + e[0]; else if (m.G.boss) c = 'boss/laser'; } causes[c] = (causes[c] || 0) + 1; } lastHp = m.P.hp;
    if (!wasBoss && m.G.boss && !m.G.boss.mini) wasBoss = true;
    if (m.G.dead) break;
  }
  const G = m.G, P = m.P, SH = m.SH;
  const cleared = G.pos + 5 * G.loop + (G.bossDone ? 1 : 0);
  const r = { dead: !!G.dead, t: +G.t.toFixed(0), pos: G.pos, loop: G.loop, bar: +G.dbar.toFixed(0), cleared, hits, score: G.score, kills: G.kills, pits, upg: SH.order.reduce((s, id) => s + SH.n(id), 0), neon: SH.earned, boss: !!G.boss, bossHp: G.boss ? Math.round(G.boss.hp / G.boss.max * 100) : 0, ups: +m.UPS.u.toFixed(2), causes, hitsBy };
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
    while (next < jobs.length) { const j = jobs[next++];
      await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr); await p.evaluate(() => { localStorage.clear(); });
      await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr);
      const r = await p.evaluate(BOT, { ...j, cap: CAP, garage: process.env.GARAGE !== '0', lagA: process.env.LAGA, lagG: process.env.LAGG, dk: process.env.DK ? JSON.parse(process.env.DK) : null, t2: process.env.T2 ? JSON.parse(process.env.T2) : null }); (res[j.diff + '/' + j.type] = res[j.diff + '/' + j.type] || []).push(r); if (errs.length) { console.log('PAGE ERROR', errs[0]); errs.length = 0; } }
    await p.close();
  }));
  await browser.close(); srv.kill();
  const avg = (a, k) => a.reduce((x, y) => x + (y[k] || 0), 0) / Math.max(1, a.length);
  console.log(`endless bot bench, ${RUNS} runs per cell, cap ${CAP} s. "cleared" = districts finished (5 per loop); "end" = where the run stopped (position in cycle 1-5, loop, bar)`);
  const causeSum = {}; for (const k in res) for (const x of res[k]) for (const c in x.causes) causeSum[k + ' ' + c] = (causeSum[k + ' ' + c] || 0) + x.causes[c];
  console.log('diff    player    died%  minutes  cleared(avg/min/max)  hits  pits  upgrades  neon   score      end (first runs)');
  const out = {};
  for (const diff of DIFFS) for (const type of TYPES) { const a = res[diff + '/' + type]; if (!a) continue;
    const cl = a.map(x => x.cleared), row = { died: Math.round(100 * a.filter(x => x.dead).length / a.length), min: avg(a, 't') / 60, cl: avg(a, 'cleared'), clmin: Math.min(...cl), clmax: Math.max(...cl), hits: avg(a, 'hits'), pits: avg(a, 'pits'), upg: avg(a, 'upg'), neon: avg(a, 'neon'), score: avg(a, 'score'), runs: a.map(x => x.cleared) };
    out[diff + '/' + type] = row;
    console.log(diff.padEnd(7), type.padEnd(9), String(row.died).padStart(4) + '%', row.min.toFixed(1).padStart(7), (row.cl.toFixed(1) + ' / ' + row.clmin + ' / ' + row.clmax).padStart(20), row.hits.toFixed(1).padStart(6), row.pits.toFixed(1).padStart(5), row.upg.toFixed(1).padStart(8), row.neon.toFixed(0).padStart(6), row.score.toFixed(0).padStart(10), '  ', a.slice(0, 4).map(x => `${x.pos + 1}/L${x.loop + 1}@${x.bar}${x.boss ? 'B' + x.bossHp : ''}`).join(' ')); }
  for (const k in res) { const by = {}; for (const x of res[k]) for (const j in x.hitsBy) by[j] = (by[j] || 0) + x.hitsBy[j] / res[k].length; console.log('hits per district index (0-based) ' + k + ': ' + Object.keys(by).map(j => j + ':' + by[j].toFixed(1)).join(' ')); }
  console.log('hit causes:', JSON.stringify(causeSum));
  fs.writeFileSync(path.join(__dirname, 'playtest', 'f-sim.json'), JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(2); });
