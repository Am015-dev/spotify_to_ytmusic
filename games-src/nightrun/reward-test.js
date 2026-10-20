#!/usr/bin/env node
// Risk-pays gate (flag RET.reward, ?reward=0 = old). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/reward-test.js     env: RUNS=6 STAGES=3,6,10 PAR=4 REPORT=1
// Unit checks run in the real page (chain grows/resets, beat graze doubles, close bonus manual only and in range, caps, flag off identical).
// Bots (Normal, story-sim style dodger): dodge = the standard dodger, bold = hugs the nearest enemy (repulsion radius e.r+18), camp = parks far left (x=70) and only
// tracks height. Reports clear%, score, kills, hits, grazes for each; bold must beat camp, a parked ship must still fail, dodge >= 66%.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 6, PAR = +process.env.PAR || 4, STAGES = (process.env.STAGES || '3,6,10').split(',').map(Number), MAXT = 300;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UNIT = () => {
  const m = window.__mnr, out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' ' + x : ''));
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(3); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  const G = m.G, P = m.P, R = window.RWD; R.stat.graze = 0;
  ok('flag on by default', R.on);
  // chain grows and resets
  G.rw = null; for (let i = 0; i < 8; i++) R.graze(false); ok('chain reaches x5 after 8 grazes', R.tier() === 5, 'tier ' + R.tier());
  ok('damage buff +40% cap', Math.abs(R.buff() - .4) < 1e-6, R.buff());
  G.t += 1.6; ok('chain lapses after 1.5 s', R.tier() === 1);
  G.rw = null; R.graze(false); R.graze(false); const a = R.tier(); m.NR.emit('hurt'); ok('hit drops chain to x1', a === 2 && R.tier() === 1 && R.buff() === 0, a + '->' + R.tier());
  G.rw = null; R.graze(true); R.graze(true); const bt = R.tier(); G.rw = null; R.graze(false); R.graze(false); ok('beat graze counts double', bt === 3 && R.tier() === 2, 'beat x' + bt + ' vs x' + R.tier());
  G.rw = null; R.graze(false); G.rw.bt = 4; G.rw.bf = .1; G.t += 4.1; G.rw.bt -= 4.1; ok('buff lasts 4 s', R.buff() === 0);
  // close-range bonus
  G.rw = null; const e = { x: P.x + 30, y: P.y, r: 20, hp: 99 }, far = { x: P.x + 300, y: P.y, r: 20 }, mid = { x: P.x + 90, y: P.y, r: 20 };
  const man = { dm: 1 }, hom = { dm: 1, hk: 1 }, lock = { dm: 1, au: 1 }, zap = { dm: 1, ab: 1 };
  const k = (b, en) => R.dmK(b, en);
  ok('close bonus +35% point blank', Math.abs(k(man, e) - 1.35) < .01, k(man, e).toFixed(3));
  ok('falloff in between', k(man, mid) > 1.02 && k(man, mid) < 1.35, k(man, mid).toFixed(3));
  ok('none beyond 140 px', k(man, far) === 1);
  ok('homing / locked / ability shots get nothing', k(hom, e) === 1 && k(lock, e) === 1 && k(zap, e) === 1);
  G.rw = null; for (let i = 0; i < 8; i++) R.graze(false); const kk = k(man, e), cap = R.CAPK.normal; ok('buff x close inside the cap', kk <= cap + 1e-9 && kk > 1.4, kk.toFixed(3));
  for (const d of ['hard', 'vhard', 'legend']) { m.SET.diff = d; ok('cap ' + d + ' <= 1.4', k(man, e) <= 1.4 + 1e-9, k(man, e).toFixed(3)); } m.SET.diff = 'normal';
  // point-blank kill drops an extra shard; risk pickup pays double
  G.rw = null; const n0 = G.pk.filter(p => p.t === 'shard').length, ee = { x: 500, y: 200, r: 20, _rwC: G.t, type: 'drone', score: 1 }; m.NR.emit('kill', { e: ee, boss: false });
  ok('point-blank kill drops a shard', G.pk.filter(p => p.t === 'shard').length === n0 + 1);
  const ee2 = { x: 500, y: 200, r: 20, _rwC: G.t - 2, type: 'drone', score: 1 }; m.NR.emit('kill', { e: ee2, boss: false }); ok('far kill drops none', G.pk.filter(p => p.t === 'shard').length === n0 + 1);
  G.eb.length = 0; const sc0 = G.score, p = { t: 'shard', x: P.x, y: P.y, rk: 1, rkT: G.t }; R.pick(p); ok('risk pickup pays double', G.score > sc0 && R.stat.bold === 1);
  const sc1 = G.score; R.pick({ t: 'shard', x: P.x, y: P.y }); ok('safe pickup unchanged', G.score === sc1);
  m.abort(); return out;
};
const BOT = ({ n, mode, MAXT, off }) => {
  const m = window.__mnr, rnd = Math.random; m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } if (off) window.RET.reward = false; m.startStory(n); m.simOn(true);
  const er = mode === 'bold' ? 18 : 55, dt = 1 / 60; let i = 0, lastBeat = -1, d = null, cleared = false;
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9, tgt = null;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) { ty = e.y; tgt = e; } continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; tgt = e; } }
    if (mode === 'camp') tx = 70; else if (mode === 'bold' && tgt) tx = Math.max(90, tgt.x - tgt.r - 70);
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, dd = Math.hypot(px - cx, py - cy); if (dd < 70) c += (70 - dd) * (70 - dd) * (dd < 26 ? 30 : 1); }
      if (G.boss && G.boss.lasers) for (const l of G.boss.lasers) { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = cx - l.x, py = cy - l.y; if (px * vx + py * vy > -20) { const dl = Math.abs(px * vy - py * vx); if (dl < 40) c += (40 - dl) * 120; } }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const dd = Math.hypot(e.x - cx, e.y - cy), r = e.r + er; if (dd < r) c += (r - dd) * (r - dd) * 3; }
      if (window.MM && MM.col) c += MM.cost(cx);
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * (mode === 'dodge' ? .15 : .5) + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, dash: near && P.dashCd <= 0 && rnd() < .5, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  while (m.running && m.G.t < MAXT) {
    if (m.SH.active) m.SH.close();
    if (mode === 'park') m.touchTo(160, 270); else if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bn = Math.floor(m.bpos()); if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    m.step(dt); i++; if (m.G.dead) break; if (m.ST.over) { cleared = true; break; }
  }
  const G = m.G, r = { n, mode, clear: cleared, t: +G.t.toFixed(0), score: G.score, kills: G.kills, hits: m.ST.hits, gz: window.RWD ? RWD.stat.graze : 0, tier: window.RWD ? RWD.stat.maxTier : 0, close: window.RWD ? RWD.stat.close : 0, pb: window.RWD ? RWD.stat.pb : 0, bold: window.RWD ? RWD.stat.bold : 0 };
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0; const errs = [];
  const mk = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  const u = await mk(); for (const l of await u.evaluate(UNIT)) { console.log(l); if (l.startsWith('FAIL')) fails++; } await u.close();
  const off = await mk('&reward=0'); const o = await off.evaluate(() => { const m = window.__mnr, R = window.RWD; m.startStory(3); m.simOn(true); for (let i = 0; i < 20; i++) m.step(1 / 60); m.G.rw = null; m.NR.emit('graze', { pf: true }); m.NR.emit('graze', { pf: true }); const p = { t: 'shard', x: m.P.x, y: m.P.y, rk: 1, rkT: m.G.t }, s0 = m.G.score; R.pick(p); return { on: R.on, rw: !!m.G.rw, tier: R.tier(), buff: R.buff(), pickPaid: m.G.score !== s0 }; });
  const okOff = !o.on && !o.rw && o.tier === 1 && o.buff === 0 && !o.pickPaid; console.log((okOff ? 'PASS' : 'FAIL') + ' flag off: no chain, no buff, no bold pay ' + JSON.stringify(o)); if (!okOff) fails++; await off.close();
  const jobs = []; for (const mode of ['dodge', 'bold', 'camp', 'park']) for (const n of STAGES) for (let k = 0; k < (mode === 'park' ? 2 : RUNS); k++) jobs.push({ n, mode, MAXT, off: false });
  for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, mode: 'dodge', MAXT, off: true, tag: 'dodge-off' });
  const res = []; let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { const p = await mk(); while (next < jobs.length) { const j = jobs[next++]; try { const r = await p.evaluate(BOT, j); r.mode = j.tag || r.mode; res.push(r); } catch (e) { console.log('RUN ERROR', JSON.stringify(j), e.message.slice(0, 120)); } await p.reload(); await p.waitForFunction(() => window.__mnr, null, { timeout: 8000 }).catch(() => { }); } await p.close(); }));
  const agg = {}; for (const r of res) { const a = agg[r.mode] = agg[r.mode] || { n: 0, cl: 0, sc: 0, k: 0, h: 0, gz: 0, t: 0, tier: 0 }; a.n++; a.cl += r.clear ? 1 : 0; a.sc += r.score; a.k += r.kills; a.h += r.hits; a.gz += r.gz; a.t += r.t; a.tier = Math.max(a.tier, r.tier); }
  for (const m in agg) { const a = agg[m]; console.log('REPORT ' + m.padEnd(9) + ' runs ' + a.n + ' clear ' + Math.round(100 * a.cl / a.n) + '% score ' + Math.round(a.sc / a.n) + ' kills ' + Math.round(a.k / a.n) + ' hits ' + (a.h / a.n).toFixed(1) + ' grazes ' + Math.round(a.gz / a.n) + ' maxChain x' + a.tier + ' t ' + Math.round(a.t / a.n)); }
  const g = (m, k) => agg[m] ? agg[m][k] / agg[m].n : 0, cl = m => g(m, 'cl');
  const chk = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fails++; };
  chk('bold bot scores more than camping bot', g('bold', 'sc') > g('camp', 'sc'));
  chk('bold bot clears at least as often as camping bot', cl('bold') >= cl('camp'));
  chk('stationary bot still fails (<= 10% clear)', cl('park') <= .1);
  chk('dodging bot Normal clear >= 66%', cl('dodge') >= .66);
  chk('no page errors', errs.length === 0); if (errs.length) console.log(errs[0]);
  await br.close(); srv.kill(); console.log(fails ? 'RESULT FAIL ' + fails : 'RESULT PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
