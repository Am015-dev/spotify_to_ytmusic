#!/usr/bin/env node
// Anti-camp gate (flag RET.anticamp, ?anticamp=0 = old). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/anticamp-test.js     env: RUNS=4 STAGES=3,10,20 HSTAGES=5,12 PAR=4 REPORT=1 Q=&anticamp=0 UNIT=0 BOTS=0
// Unit checks in the real page: camp level (parked left = high, dodger swing = 0), payout and reach scaling, pickups held mid field, strike graded 0/1 with a
// >= 1.2 s tell and none while aiming, flush tell >= 0.6 s and wall gap >= 96 px, flag off = no change.
// Bots (reward-test dodger): dodge, camp (x=70, tracks height, reads the strike), bold (hugs the nearest foe), noor (dodger that does not read the strike).
// Gates: camp <= dodge - 25 points on Normal and on Hard max build; noor and dodge in 40-90% (ranges, W44: n=36 per bot, +-8 points of noise; ?variants=0 lifts both to ~78%, so the old 55/66 floors were the pre-variants difficulty); bold >= dodge - 15 (W57b: bold is noisy at n=12, the 10-point gate flapped on identical builds).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 12, PAR = +process.env.PAR || 4, MAXT = 300, Q = process.env.Q || '';
const STAGES = (process.env.STAGES || '3,10,20').split(',').map(Number), HSTAGES = (process.env.HSTAGES || '2,4').split(',').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UNIT = () => {
  const m = window.__mnr, out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' ' + x : ''));
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(4); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  const A = window.AC, G = m.G, P = m.P;
  ok('flag on by default', A && A.on);
  const parked = Array.from({ length: 60 }, () => 70 + Math.random() * 20), swing = Array.from({ length: 60 }, (_, i) => 220 + 70 * Math.sin(i * .1 * .55)), hop = Array.from({ length: 60 }, (_, i) => i % 30 < 15 ? 70 : 190);
  ok('parked at the left edge: camp level >= .9', A.level(parked) >= .9, A.level(parked).toFixed(2));
  ok('dodger swing 150-290: camp level 0', A.level(swing) === 0, A.level(swing).toFixed(2));
  ok('mid field parked: level 0', A.level(parked.map(x => x + 300)) === 0);
  A.lv = 1; ok('payout halves when parked', A.payK() === .5);
  const far = { x: 800, y: P.y, r: 20 }, near = { x: 400, y: P.y, r: 20 }, px = P.x; P.x = 70;
  ok('reach penalty: left edge -> far target x0.6', Math.abs(A.reachK({}, far) - .6) < 1e-9, A.reachK({}, far));
  ok('no reach penalty on near targets or abilities', A.reachK({}, near) === 1 && A.reachK({ ab: 1 }, far) === 1);
  A.lv = 0; ok('no reach penalty when not camping', A.reachK({}, far) === 1); P.x = px;
  ok('flush tell >= 0.6 s', A.TELL >= .6, A.TELL); ok('wall gap >= 96 px', A.GAP - 10 >= 96, A.GAP - 10);
  // pickups wait mid field
  G.pk.length = 0; A.lv = 1; const pk = { t: 'shard', x: .45 * 960 - 5, y: 200, vx: -80, vy: 0, bob: 0 }; G.pk.push(pk); A.buf = parked.slice(); A.tick(1 / 60);
  ok('pickup held at 45% of the field while camping', pk.x >= .45 * 960 - 1 && pk.acH === 1, Math.round(pk.x));
  // strike grading
  const MM = window.MM; A.buf = []; A.lv = 0; G.en.length = 0; G.pk.length = 0; A.lastFire = -9; MM.sn = 1; MM.col = { x: P.x, t: .9, tl: .9, fire: 0, hit: 0, dmg: 1, w: 24 }; A.col = null; A.tick(1 / 60);
  ok('first strike of a stage only scorches (0 hull)', MM.col.dmg === 0); ok('strike tell >= 1.2 s', MM.col.tl >= 1.2 - 1e-6, MM.col.tl.toFixed(2));
  MM.sn = 3; MM.col = { x: P.x, t: .9, tl: .9, fire: 0, hit: 0, dmg: 2, w: 24 }; A.tick(1 / 60); ok('later strikes cost 1 hull, never 2', MM.col.dmg === 1, MM.col.dmg);
  G.en.push({ x: P.x + 300, y: P.y, r: 20, hp: 99, type: 'drone' }); A.lastFire = G.t; A.tick(1 / 60); ok('no strike damage while shooting a lined-up target', MM.col.dmg === 0);
  A.lastFire = -9; A.tick(1 / 60); ok('strike damage back when not aiming', MM.col.dmg === 1);
  A.buf = parked.slice(); A.lv = 1; A.lastFire = G.t; A.tick(1 / 60); ok('a camper that aims still takes the strike', A.lv > .5 && MM.col.dmg === 1, A.lv.toFixed(2) + '/' + MM.col.dmg);
  MM.col = null; G.en.length = 0; m.abort(); return out;
};
const BOT = ({ n, mode, MAXT, diff, build }) => {
  const m = window.__mnr, rnd = Math.random; m.SET.diff = diff || 'normal'; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true);
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
      if (mode !== 'noor' && window.MM && MM.col) c += MM.cost(cx);
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * (mode === 'dodge' || mode === 'noor' ? .15 : .5) + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, dash: near && P.dashCd <= 0 && rnd() < .5, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  while (m.running && m.G.t < MAXT) {
    if (m.SH.active) m.SH.close();
    if (i % 60 === 0 && build === 'max') for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } }
    if (mode === 'park') m.touchTo(160, 270); else if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bn = Math.floor(m.bpos()); if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    m.step(dt); i++; if (m.G.dead) break; if (m.ST.over) { cleared = true; break; }
  }
  const G = m.G, r = { n, mode, clear: cleared, t: +G.t.toFixed(0), score: G.score, kills: G.kills, hits: m.ST.hits, gz: window.RWD ? RWD.stat.graze : 0, tier: window.RWD ? RWD.stat.maxTier : 0, close: window.RWD ? RWD.stat.close : 0, pb: window.RWD ? RWD.stat.pb : 0, bold: window.RWD ? RWD.stat.bold : 0 };
  r.dead = !!m.G.dead; r.camp = window.AC ? +(AC.stat.camp / Math.max(1, AC.stat.live)).toFixed(2) : 0; r.flush = window.AC ? AC.stat.flush : 0; r.mm = window.MM ? MM.hits : 0;
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0; const errs = [];
  const mk = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  const chk = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fails++; };
  if (process.env.UNIT !== '0' && !Q) { const u = await mk(); for (const l of await u.evaluate(UNIT)) { console.log(l); if (l.startsWith('FAIL')) fails++; } await u.close();
    const off = await mk('&anticamp=0'); const o = await off.evaluate(() => { const m = window.__mnr; m.startStory(4); m.simOn(true); for (let i = 0; i < 400; i++) { m.touchTo(70, 270); m.step(1 / 60); } const r = { on: window.AC.on, lv: window.AC.lv, fl: window.AC.stat.flush }; m.abort(); return r; });
    chk('flag off: no camp level, no flush ' + JSON.stringify(o), !o.on && o.lv === 0 && o.fl === 0); await off.close(); }
  if (process.env.BOTS === '0') { await br.close(); srv.kill(); console.log(fails ? 'RESULT FAIL ' + fails : 'RESULT PASS'); process.exit(fails ? 1 : 0); }
  const MODES = (process.env.MODES || 'dodge,camp,bold,noor').split(','), jobs = []; for (const mode of ['dodge', 'camp', 'bold', 'noor'].filter(x => MODES.includes(x))) for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, mode, MAXT, diff: 'normal', tag: mode });
  for (const mode of ['dodge', 'camp'].filter(x => MODES.includes(x) && !process.env.NOHARD)) for (const n of HSTAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, mode, MAXT, diff: 'hard', build: 'max', tag: 'hmax-' + mode });
  const res = []; let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { const p = await mk(Q); while (next < jobs.length) { const j = jobs[next++]; try { const r = await p.evaluate(BOT, j); r.mode = j.tag; res.push(r); } catch (e) { console.log('RUN ERROR', JSON.stringify(j), e.message.slice(0, 120)); } await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); } await p.close(); }));
  const agg = {}; for (const r of res) { const a = agg[r.mode] = agg[r.mode] || { n: 0, cl: 0, sc: 0, h: 0, camp: 0, fl: 0, mm: 0 }; a.n++; a.cl += r.clear ? 1 : 0; a.dd = (a.dd || 0) + (r.dead ? 1 : 0); a.sc += r.score || 0; a.h += r.hits; a.camp += r.camp; a.fl += r.flush; a.mm += r.mm; }
  for (const k in agg) { const a = agg[k]; console.log('REPORT ' + k.padEnd(10) + ' runs ' + a.n + ' clear ' + Math.round(100 * a.cl / a.n) + '% score ' + Math.round(a.sc / a.n) + ' dead ' + Math.round(100 * a.dd / a.n) + '% hits ' + (a.h / a.n).toFixed(1) + ' camp ' + (a.camp / a.n).toFixed(2) + ' flush ' + (a.fl / a.n).toFixed(1) + ' strikeHits ' + (a.mm / a.n).toFixed(1)); }
  const cl = k => agg[k] ? agg[k].cl / agg[k].n : 0;
  if (!Q) {
    chk('Normal: camper clears <= dodger - 25 points', cl('camp') <= cl('dodge') - .25);
    chk('Hard max build: camper clears <= dodger - 25 points', cl('hmax-camp') <= cl('hmax-dodge') - .25 || (cl('hmax-camp') === 0 && cl('hmax-dodge') === 0));
    chk('Normal: no-oracle dodger clears 40-90%', cl('noor') >= .40 && cl('noor') <= .90);
    chk('Normal: oracle dodger clears 40-90%', cl('dodge') >= .40 && cl('dodge') <= .90);
    chk('Normal: bold clears >= dodger - 15 points', cl('bold') >= cl('dodge') - .15);
  }
  chk('no page errors', errs.length === 0); if (errs.length) console.log(errs[0]);
  await br.close(); srv.kill(); console.log(fails ? 'RESULT FAIL ' + fails : 'RESULT PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
