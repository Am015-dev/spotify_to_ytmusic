#!/usr/bin/env node
// TIMING gate (parts/timing.js, flag RET.timing, default off: this test opens ?timing=1; ?timing=0 = old). Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/timing-test.js     env: RUNS=4 STAGES=3,10,20 PAR=4 HARD=1
// No ?all=1 here: the real beat window decides. Unit: beat dash parries + refunds, off-beat costs 2 and locks, late x2 breaks the chain,
// EMP spends all charges with tiers 1/2/3, empty screen wastes, ?timing=0 = one charge per EMP and the old dash.
// Bots (Normal st 3/10/20 + Hard st 5 mid build): reflex (dash when a bullet is within 30 px) <= 70%, beat (dash in the window when something is close) >= 90%,
// random DASH/EMP <= 40%, parked <= 10%, dodger with no DASH/EMP below the beat bot; smart EMP >= .5 uses/min.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 4, PAR = +process.env.PAR || 4, STAGES = (process.env.STAGES || '3,10,20').split(',').map(Number), MAXT = 300;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UNIT = () => {
  const m = window.__mnr, T = window.TIM, A = window.ABIL, out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' ' + x : ''));
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(10); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  const G = m.G, P = m.P, clr = () => { G.en = []; G.eb = []; G.pk = []; G.waveT = 99; G.waveWait = 1; if (window.CTR) { CTR.reset(); CTR.noAuto = 1; } P.inv = 0; P.hp = P.max = 40; };
  const to = (on) => { for (let i = 0; i < 400; i++) { const p = m.bpos(), d = Math.abs(p - Math.round(p)) * m.BT.spb * 1000; if (on ? d < 15 : (d > 200 && p - Math.round(p) > 0)) return; m.step(1 / 240); } };
  const dash = () => { m.press('Dash'); m.step(1 / 60); };
  ok('flag on with ?timing=1', T.on);
  clr(); G.dt = 0; to(true); const S = A.st(); S.n = 2; S.r = 0; G.en.push({ type: 'drone', x: 700, y: P.y, r: 14, hp: 999, max: 999, flash: 0, t: 0, bf: 99, gr: 0, score: 0, vx: 0, vy: 0 });
  for (let k = 0; k < 4; k++) m.eb(P.x + 60 + k * 10, P.y + 30, Math.PI, 60, '#fff', 5);
  const s0 = JSON.parse(JSON.stringify(T.stat)); dash();
  ok('beat dash near bullets = parry, charge back, i-frames .5 s', T.stat.parry === s0.parry + 1 && S.n === 2 && P.inv > .4 && m.G.pb.some(b => b.tm), `parry ${T.stat.parry - s0.parry} n ${S.n} inv ${P.inv.toFixed(2)} refl ${T.stat.refl - s0.refl}`);
  for (let i = 0; i < 40; i++) m.step(1 / 60); clr(); to(true); S.n = 3; S.r = 0; dash(); ok('beat dash into empty air costs one charge', S.n === 2, 'n ' + S.n);
  for (let i = 0; i < 40; i++) m.step(1 / 60); clr(); to(false); S.n = 3; S.r = 0; dash(); const pen = G.tm.pen; ok('off-beat dash costs 2 and locks the dash', S.n === 1 && pen > .3, `n ${S.n} lock ${pen.toFixed(2)}`);
  S.n = 3; dash(); ok('no dash during the lock', S.n === 3);
  for (let i = 0; i < 40; i++) m.step(1 / 60); const b0 = T.stat.brk; S.n = 4; to(false); dash(); for (let i = 0; i < 40; i++) m.step(1 / 60); to(false); S.n = 4; dash(); ok('late twice in a row breaks the chain', T.stat.brk === b0 + 1, 'brk ' + (T.stat.brk - b0));
  // seeker: a marked shot due within .45 s is caught by a beat dash, flies back for 40
  for (let i = 0; i < 40; i++) m.step(1 / 60); clr(); to(true); S.n = 3; G.en.push({ type: 'drone', x: 760, y: P.y, r: 14, hp: 999, max: 999, flash: 0, t: 0, bf: 99, gr: 0, score: 0, vx: 0, vy: 0 }); m.eb(P.x + 90, P.y, Math.PI, 300, '#f00', 7); G.eb[G.eb.length - 1].cxM = 1; const mk0 = T.stat.mark, ne0 = G.eb.length, cx0 = G.eb.some(b => b.cxM), pr0 = T.stat.parry, pf0 = T.stat.pf; dash();
  ok('beat dash catches a marked seeker shot (40 dmg back)', T.stat.mark === mk0 + 1 && m.G.pb.some(b => b.tm && b.dm === 40), `mark ${T.stat.mark - mk0} pb40 ${m.G.pb.filter(b => b.tm).map(b => b.dm).join(',')} eb ${ne0} marked ${cx0} pf ${T.stat.pf - pf0} parry ${T.stat.parry - pr0} pen ${G.tm.pen.toFixed(2)} n ${S.n} dashT ${P.dashT.toFixed(2)}`);
  // EMP tiers
  const emp = (n, nb) => { clr(); for (let k = 0; k < nb; k++) m.eb(500 + k * 8, 100 + k * 30, Math.PI, 40, '#fff', 5); P.emp = n; A.st().m = 0; const st = JSON.parse(JSON.stringify(T.stat)); m.press('Emp'); m.step(1 / 60); return { left: P.emp, w: T.stat.waste - st.waste, t: [1, 2, 3].map(i => T.stat['e' + i] - st['e' + i]), bub: !!(A.st().bub) }; };
  const e1 = emp(1, 8), e2 = emp(2, 8), e3 = emp(3, 8), e0 = emp(3, 1);
  ok('EMP spends every held charge', e1.left === 0 && e2.left === 0 && e3.left === 0, [e1.left, e2.left, e3.left].join('/'));
  ok('EMP x1 / x2 (+bubble) / x3 tiers', e1.t[0] === 1 && e2.t[1] === 1 && e2.bub && e3.t[2] === 1, JSON.stringify([e1.t, e2.t, e3.t]));
  ok('EMP on a near-empty screen = wasted', e0.w === 1 && e0.left === 0);
  m.abort(); return out;
};
const OFF = () => { const m = window.__mnr, A = window.ABIL; m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(10); m.simOn(true); for (let i = 0; i < 20; i++) m.step(1 / 60);
  m.G.eb = []; m.P.emp = 3; m.press('Emp'); m.step(1 / 60); const r = { on: window.TIM.on, emp: m.P.emp }; m.abort(); return r; };
const BOT = ({ n, mode, diff, mid, MAXT, k }) => {
  const m = window.__mnr, dt = 1 / 60; let s = n * 7919 + mode.length * 131 + 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  m.SET.diff = diff; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true);
  if (mid) { const wp = window.__wp, GA = window.__ga.GA; GA.eqAll = true; for (const d of m.TP_DEF) GA.tune[d.id] = Math.floor((d.max || 3) / 2); wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 4, swarm: 4 }; wp.eq = ['pulse', 'swarm']; wp._fk = null; wp.reset(); wp.sync();
    for (const id of ['fr', 'dm', 'hm']) for (let k = 0; k < 2; k++) { try { m.SH.add(id); } catch (e) { } } try { m.SH.recalc(); } catch (e) { } }
  if (!mid) { const WP = window.__wp, w = ['laser', 'disc', 'flame'][k % 3]; WP.eq = [w]; WP.lv = {}; WP.lv[w] = 3; WP._fk = null; try { WP.reset(); } catch (e) { } WP.sync(); }   // one plain weapon each (the review probe: 3 weapons x runs)
  let i = 0, lastBeat = -1, cleared = false, nd = 0, ne = 0;
  const C = window.CTR;
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, dd = Math.hypot(px - cx, py - cy); if (dd < 70) c += (70 - dd) * (70 - dd) * (dd < 26 ? 30 : 1); }
      if (G.boss && G.boss.lasers) for (const l of G.boss.lasers) { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = cx - l.x, py = cy - l.y; if (px * vx + py * vy > -20) { const dl = Math.abs(px * vy - py * vx); if (dl < 40) c += (40 - dl) * 120; } }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const dd = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (dd < r) c += (r - dd) * (r - dd) * 3; }
      if (window.MM && MM.col) c += MM.cost(cx);
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    m.touchTo(bx, by);
  };
  const ready = () => { const S = window.ABIL.st(); return S.n >= 1 && m.P.dashT <= 0 && window.TIM.ready(); };
  const close = (R, t) => m.G.eb.some(b => Math.hypot(b.x + b.vx * t - m.P.x, b.y + b.vy * t - m.P.y) < R);
  const inWin = () => { const p = m.bpos(); return Math.abs(p - Math.round(p)) * m.BT.spb * 1000 <= m.winMs() * window.TIM.PK - 15; };
  const wallNear = () => C && C.walls.find(w => !w.cur && w.warn <= 0 && !w.hit && !w.dash && w.x > m.P.x && w.x - m.P.x < 150);
  while (m.running && m.G.t < MAXT) {
    if (m.SH.active) m.SH.close();
    const G = m.G, P = m.P;
    if (mode === 'park') m.touchTo(160, 270); else if (i % 3 === 0) dec();
    let dsh = false, emp = false;
    if (mode === 'reflex') { dsh = close(30, .08) && P.dashCd <= 0; emp = P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && close(30, .08))); }
    if (mode === 'beat') {
      const mk = G.eb.some(b => b.cxM && (Math.hypot(b.x - P.x, b.y - P.y) - b.r - 3) / (Math.hypot(b.vx, b.vy) || 1) < .4);
      if (inWin() && (mk || close(75, .25) || wallNear())) dsh = true;
      else if (close(24, .05) && P.hp <= 2) dsh = true;   // emergency, off the beat
      else if (wallNear() && wallNear().x - P.x < 40) dsh = true;
      const hot = C && (C.walls.some(w => w.cur && w.warn <= 0 && w.x < 900) || G.en.some(e => e.ctw && e.wsh && e.x < 900));
      emp = P.emp > 0 && (hot || (P.emp >= 3 && G.eb.length >= 14) || (P.emp >= 2 && G.eb.length >= 22) || (P.hp <= 2 && G.eb.length >= 8));
    }
    if (mode === 'rand') { dsh = rnd() < .03; emp = P.emp > 0 && rnd() < .004; }
    if (dsh && (mode !== 'beat' || ready())) { m.press('Dash'); nd++; }
    if (emp) { m.press('Emp'); ne++; }
    const bn = Math.floor(m.bpos()); if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    m.step(dt); i++; if (m.G.dead) break; if (m.ST.over) { cleared = true; break; }
  }
  const T = window.TIM.stat, r = { n, mode, diff, clear: cleared, t: m.G.t, hits: m.ST.hits, nd, ne, parry: T.parry, off: T.off, e: T.emp, waste: T.waste, tiers: [T.e1, T.e2, T.e3] };
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0; const errs = [];
  const chk = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fails++; };
  const mk = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1${q === undefined ? '&timing=1' : q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  const u = await mk(); for (const l of await u.evaluate(UNIT)) { console.log(l); if (l.startsWith('FAIL')) fails++; } await u.close();
  const off = await mk('&timing=0'); const o = await off.evaluate(OFF); chk('?timing=0: flag off, EMP spends one charge (' + JSON.stringify(o) + ')', !o.on && o.emp === 2); await off.close();
  const jobs = []; if (process.env.UNIT_ONLY) { await br.close(); srv.kill(); process.exit(fails ? 1 : 0); }
  for (const mode of ['reflex', 'beat', 'rand', 'nodash', 'park']) for (const n of STAGES) for (let k = 0; k < (mode === 'park' ? 1 : RUNS); k++) jobs.push({ n: n + 0, mode, diff: 'normal', MAXT, k });
  if (process.env.HARD !== '0') for (const mode of ['reflex', 'beat', 'rand', 'nodash']) for (let k = 0; k < RUNS; k++) jobs.push({ n: +(process.env.HARD_ST || 5), mode, diff: 'hard', mid: 1, MAXT, k });
  const res = []; let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { const p = await mk(); while (next < jobs.length) { const j = jobs[next++]; try { const r = await p.evaluate(BOT, j); r.key = (j.diff === 'hard' ? 'H-' : '') + j.mode; res.push(r); if (process.env.REPORT) console.log('RUN', j.mode, j.diff, j.n, j.k, r.clear ? 'clear' : 'fail', 'hits', r.hits); } catch (e) { console.log('RUN ERROR', JSON.stringify(j), e.message.slice(0, 120)); } await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); } await p.close(); }));
  const agg = {}; for (const r of res) { const a = agg[r.key] = agg[r.key] || { n: 0, cl: 0, h: 0, t: 0, nd: 0, ne: 0, pa: 0, off: 0, w: 0, ti: [0, 0, 0] }; a.n++; a.cl += r.clear ? 1 : 0; a.h += r.hits; a.t += r.t; a.nd += r.nd; a.ne += r.e; a.pa += r.parry; a.off += r.off; a.w += r.waste; r.tiers.forEach((x, i) => a.ti[i] += x); }
  for (const k in agg) { const a = agg[k]; console.log('REPORT ' + k.padEnd(9) + ' runs ' + a.n + ' clear ' + Math.round(100 * a.cl / a.n) + '% hits ' + (a.h / a.n).toFixed(1) + ' dash/min ' + (a.nd / (a.t / 60)).toFixed(1) + ' parry ' + (a.pa / a.n).toFixed(1) + ' offbeat ' + (a.off / a.n).toFixed(1) + ' EMP/min ' + (a.ne / (a.t / 60)).toFixed(2) + ' wasted ' + a.w + ' tiers ' + a.ti.join('/')); }
  const cl = k => agg[k] ? agg[k].cl / agg[k].n : NaN, epm = k => agg[k] ? agg[k].ne / (agg[k].t / 60) : 0;
  const hp = k => agg[k] ? agg[k].h / agg[k].n : NaN;
  chk(`hits per run: beat ${hp('beat').toFixed(1)} < reflex ${hp('reflex').toFixed(1)} < no DASH/EMP ${hp('nodash').toFixed(1)}, random ${hp('rand').toFixed(1)} > beat`, hp('beat') < hp('reflex') && hp('reflex') < hp('nodash') && hp('rand') > hp('beat'));
  chk(`reflex-dash bot <= 70% clear (${Math.round(100 * cl('reflex'))}%)`, cl('reflex') <= .7);
  chk(`beat-timed bot >= 90% clear (${Math.round(100 * cl('beat'))}%)`, cl('beat') >= .9);
  chk(`random DASH/EMP bot <= 40% clear (${Math.round(100 * cl('rand'))}%)`, cl('rand') <= .4);
  chk(`parked bot <= 10% (${Math.round(100 * cl('park'))}%)`, cl('park') <= .1);
  chk(`no DASH/EMP below the beat bot (${Math.round(100 * cl('nodash'))}% < ${Math.round(100 * cl('beat'))}%)`, cl('nodash') < cl('beat'));
  chk(`smart bot uses EMP >= .5 per min (${epm('beat').toFixed(2)}), few wasted (${agg.beat ? agg.beat.w : '?'})`, epm('beat') >= .5 && (!agg.beat || agg.beat.w <= agg.beat.ne * .2));
  if (agg['H-beat']) chk(`Hard mid: beat ${Math.round(100 * cl('H-beat'))}% > reflex ${Math.round(100 * cl('H-reflex'))}% and random ${Math.round(100 * cl('H-rand'))}%`, cl('H-beat') > cl('H-reflex') && cl('H-beat') > cl('H-rand'));
  chk('no page errors', errs.length === 0); if (errs.length) console.log(errs[0]);
  await br.close(); srv.kill(); console.log(fails ? 'RESULT FAIL ' + fails : 'RESULT PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
