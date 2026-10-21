#!/usr/bin/env node
// LEGEND gate (parts/legend.js, flag RET.legend, default OFF: the bots run with ?legend=1, Q='&legend=0' measures the old Legend). Prints PASS/FAIL lines; REPORT=1 prints the bot table.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/legend-test.js
//   env: DIFFS=legend STAGES=10,20 MODES=human,dodger,noor,beat,nodash,camp,rand RUNS=8 PAR=4 Q='&legend=0' ENDLESS=1 (endless: median wave reached) GATE=0 (table only)
// BUILD=mid|late|owner (default mid). Bots ( story stages, headless ?sim=1): human = humanbot.js human model (late view, misses, lapses, aim error); dodger = the oracle (balance-test cost grid,
// reads strikes and boss targets, dash on 50% of near misses); noor = oracle that does not read the column strike or boss targets; beat = oracle + dash in the beat window
// (timing-test); every bot but rand reads a laser wall's gap, dodger / noor / human (half the time) dash a wall that has none; nodash = oracle that never presses DASH or EMP; camp = parks at x 70 and only tracks height; rand = oracle moves + random DASH / EMP presses.
// Gates (Legend, pooled over stages 10 and 20; noisy bots fail only on a clear miss): human 8-25% (fail outside 0-35), dodger 35-65% (fail outside 25-75),
// nodash <= beat - 25 (fail above beat - 15), camp <= 5% (fail > 12), rand <= 3% (fail > 10); the default page (flag off) loads with RET.legend false and Legend rows unchanged; no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 8, PAR = +process.env.PAR || 4, ENDLESS = !!process.env.ENDLESS, MAXT = +process.env.MAXT || (ENDLESS ? 1500 : 300);
const STAGES = (process.env.STAGES || (ENDLESS ? '0' : '10,20')).split(',').map(Number), DIFFS = (process.env.DIFFS || 'legend').split(',');
const BUILD = process.env.BUILD || 'mid', MODES = (process.env.MODES || (ENDLESS ? 'human' : 'human,dodger,noor,beat,nodash,camp,rand')).split(','), Q = process.env.Q == null ? '&legend=1' : process.env.Q;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const BOT = (o) => {
  const m = window.__mnr, { n, mode, seed } = o; m.SET.diff = o.diff; try { m.applySet(); } catch (e) { }
  if (o.endless) { m.ST.on = false; document.getElementById('startBtn').click(); } else m.startStory(n); m.simOn(true);
  let sd = seed * 7919 + 13 + mode.length * 131; const rnd = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
  const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += rnd(); return (s - 2) * 1.73; };
  const WP = window.__wp, SH = m.SH, C = window.CTR;
  const late = o.build === 'late' || o.build === 'owner';   // builds as humanbot.js: mid = level 2 + a few shop picks; late = level 5/4 + a deep shop + timed powers kept up; owner = late + PULSE 3 / SWARM 10
  const ups = () => { WP.eq = ['pulse', 'swarm']; WP.lv = o.build === 'owner' ? { pulse: 3, swarm: 10 } : late ? { pulse: 5, swarm: 4 } : { pulse: 2, swarm: 2 }; WP.sync(); const ids = SH.UPG.map(u => u.id);
    const want = late ? { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 } : { fr: 2, dm: 2, hm: 1 };
    for (const id in want) if (ids.includes(id)) for (let q = 0; q < want[id]; q++) { try { SH.add(id); } catch (e) { } } try { SH.recalc && SH.recalc(); } catch (e) { } };
  const keepPw = () => { if (!late) return; for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } } };
  ups();
  const H = { dMin: .18, dMax: .2, xtra: .7, miss: .1, blind: .4, look: 260, noise: 8, dash: .4, emp: 4, empR: 150, aimErr: 38, retarget: .45, lapseEvery: 30, lapse: 1 };
  const hist = []; let delay = H.dMin + rnd() * (H.dMax - H.dMin), blindUntil = -1, wasThreat = false, lapseAt = H.lapseEvery * (.5 + rnd()), lapseUntil = -1, aimY = 270, aimT = -9, nx = 0, ny = 0, nT = -9, hold = null;
  const snap = () => { const G = m.G; return { t: G.t, px: m.P.x, py: m.P.y, eb: G.eb.map(b => [b.x, b.y, b.vx, b.vy]), en: G.en.map(e => [e.type, e.x, e.y, e.r, e.gy, e.gap]) }; };
  let BM = null; const bmUpd = () => { BM = window.BMV && window.BMV.on && m.G.boss && mode !== 'noor' ? window.BMV : null; };
  let PULL = .6, XW = .15;
  const cost = (S, cx, cy, ty, tx, look) => {
    let c = BM ? BM.cost(cx, cy) : 0, dtp = .14 + (S.age || 0);
    for (const b of S.eb) { if (look && (b[0] - S.px > look || b[0] - S.px < -120)) continue; const px = b[0] + b[2] * dtp, py = b[1] + b[3] * dtp, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
    for (const e of S.en) { if (e[0] === 'gate') { if (Math.abs(e[1] - cx) < 60 && (cy < e[4] - e[5] / 2 + 12 || cy > e[4] + e[5] / 2 - 12)) c += 3000; continue; } if (look && e[1] - S.px > look + 120) continue; const d = Math.hypot(e[1] - cx, e[2] - cy), r = e[3] + 55; if (d < r) c += (r - d) * (r - d) * 3; }
    if (C && mode !== 'rand') for (const w of C.walls) { if (w.hit || w.done || w.dash || !w.gap) continue; const dx = w.x - cx; if (dx < -20 || dx > 170 || (look && w.x - S.px > look)) continue; if (Math.abs(cy - w.gap.y) > w.gap.h / 2 - 10) c += 2500; }   // the laser wall's gap is read like any telegraph
    return c + Math.abs(cy - ty) * PULL + Math.abs(cx - tx) * XW;
  };
  const wallShut = R => C && C.walls.some(w => !w.hit && !w.done && !w.dash && w.warn <= 0 && !w.gap && w.x > m.P.x - 4 && w.x - m.P.x < R);
  const oracle = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = mode === 'camp' ? 70 : 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.cores && e.cores.length ? e.cores[0].y : e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    const S = snap(); const bt = BM && BM.target(); if (bt) ty = bt.y; PULL = bt && BM.hz.some(z => !z.mk && z.on - G.t < .9 && G.t < z.off) ? .08 : .6; XW = mode === 'camp' ? .5 : .15; let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = cost(S, cx, cy, ty, tx, 0) + Math.hypot(ix, iy) * 4; if (mode !== 'noor' && window.MM && MM.col) c += MM.cost(cx); if (c < bc) { bc = c; bx = cx; by = cy; } }
    return { bx, by };
  };
  const humanDec = () => {
    const G = m.G, P = m.P;
    hist.push(snap()); while (hist.length > 2 && hist[1].t <= G.t - delay) hist.shift(); const S = hist[0]; S.age = (G.t - S.t) * H.xtra;
    if (G.t < lapseUntil) return hold || { bx: P.x, by: P.y, dash: false, emp: false };
    if (G.t > lapseAt) { lapseUntil = G.t + H.lapse * (.6 + .8 * rnd()); lapseAt = lapseUntil + H.lapseEvery * (.5 + rnd()); hold = { bx: P.x + (rnd() - .5) * 60, by: P.y + (rnd() - .5) * 60, dash: false, emp: false }; return hold; }
    if (G.t - aimT > H.retarget) { aimT = G.t; let bd = 1e9, ty = 270 + 140 * Math.sin(G.t * .9); for (const e of S.en) { if (e[0] === 'boss') { ty = e[2]; continue; } const dx = e[1] - S.px; if (dx > 0 && dx < bd && e[1] < 940) { bd = dx; ty = e[0] === 'gate' ? e[4] : e[2]; } } aimY = ty + gauss() * H.aimErr; }
    if (G.t - nT > .3) { nT = G.t; nx = gauss() * H.noise; ny = gauss() * H.noise; }
    const tx = 220 + 70 * Math.sin(G.t * .55); PULL = .6; XW = .15; let bc = 1e18, bx = P.x, by = P.y, c0 = 0;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; const c = cost(S, cx, cy, aimY, tx, H.look) + Math.hypot(ix, iy) * 4; if (ix === 0 && iy === 0) c0 = c; if (c < bc) { bc = c; bx = cx; by = cy; } }
    const threat = c0 > 4000; if (threat && !wasThreat && G.t > blindUntil && rnd() < H.miss) blindUntil = G.t + H.blind; wasThreat = threat;
    if (G.t < blindUntil) { bx = P.x; by = P.y; }
    const near = S.eb.some(b => Math.hypot(b[0] + b[2] * .08 - S.px, b[1] + b[3] * .08 - S.py) < 30 && b[0] - S.px < H.look);
    let cnt = 0; for (const b of G.eb) if (Math.hypot(b.x - P.x, b.y - P.y) < H.empR) cnt++;
    return { bx: bx + nx, by: by + ny, dash: near && P.dashCd <= 0 && G.t > blindUntil && rnd() < H.dash * .5, emp: P.emp > 0 && cnt >= H.emp };
  };
  const close = (R, t) => m.G.eb.some(b => Math.hypot(b.x + b.vx * t - m.P.x, b.y + b.vy * t - m.P.y) < R);
  const inWin = () => { const p = m.bpos(); return Math.abs(p - Math.round(p)) * m.BT.spb * 1000 <= m.winMs() * (window.TIM && TIM.PK || 1) - 15; };
  const ready = () => { const S = window.ABIL.st(); return S.n >= 1 && m.P.dashT <= 0 && (!window.TIM || TIM.ready()); };
  const wallNear = () => C && C.walls.find(w => !w.cur && w.warn <= 0 && !w.hit && !w.dash && w.x > m.P.x && w.x - m.P.x < 150);
  const cz = {}; let i = 0, lastBeat = -1, tapAt = -1, cleared = false, nd = 0, ne = 0; const dt = 1 / 60, human = mode === 'human';
  while (m.running && m.G.t < o.MAXT) {
    if (SH.active) { SH.close(); ups(); }
    if (i % 60 === 0) keepPw();
    if (o.endless) m.god = !!m.G.boss;   // endless: as humanbot / endramp-test, the ramp is measured on the waves between bosses
    const G = m.G, P = m.P;
    if (i % 3 === 0) {
      bmUpd(); let dsh = false, emp = false;
      if (human) { const d = humanDec(); m.touchTo(d.bx, d.by); dsh = d.dash || (wallShut(40) && G.t > blindUntil && rnd() < .5); emp = d.emp; }
      else {
        const d = oracle(); m.touchTo(d.bx, d.by);
        if (mode === 'dodger' || mode === 'noor') { const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30); dsh = (near && P.dashCd <= 0 && rnd() < .5) || wallShut(34); emp = P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)); }
        if (mode === 'beat') {
          const mk = G.eb.some(b => b.cxM && (Math.hypot(b.x - P.x, b.y - P.y) - b.r - 3) / (Math.hypot(b.vx, b.vy) || 1) < .4);
          if (inWin() && (mk || close(75, .25) || wallNear())) dsh = ready(); else if (close(24, .05) && P.hp <= 2) dsh = true; else if (wallNear() && wallNear().x - P.x < 40) dsh = true;
          const hot = C && (C.walls.some(w => w.cur && w.warn <= 0 && w.x < 900) || G.en.some(e => e.ctw && e.wsh && e.x < 900));
          const ov = G.eb.filter(b => b.ew && Math.hypot(b.x - P.x, b.y - P.y) < 150).length >= 6;
          emp = P.emp > 0 && (hot || ov || (P.emp >= 3 && G.eb.length >= 14) || (P.emp >= 2 && G.eb.length >= 22) || (P.hp <= 2 && G.eb.length >= 8));
        }
        if (mode === 'rand') { dsh = rnd() < .09; emp = P.emp > 0 && rnd() < .012; }
      }
      if (dsh) { m.press('Dash'); nd++; } if (emp) { m.press('Emp'); ne++; }
    }
    const bp = m.bpos(), bn = Math.floor(bp);
    if (human) { if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); } if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; } }
    else if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    const h0 = m.ST.hits, px = m.P.x, py = m.P.y, nb = G.eb.some(b => Math.hypot(b.x - px, b.y - py) < 40), ne0 = G.en.find(e => e.type !== 'boss' && Math.hypot(e.x - px, e.y - py) < (e.r || 14) + 40);
    m.step(dt); i++;
    if (m.ST.hits > h0) { const c = C && C.walls.some(w => w.warn <= 0 && Math.abs(w.x - px) < 40) ? 'wall' : window.MM && MM.col && Math.abs(MM.col.x - px) < 40 ? 'strike' : nb ? (m.G.boss ? 'bossbullet' : 'bullet') : ne0 ? 'touch:' + ne0.type : m.G.boss ? 'boss' : 'other'; cz[c] = (cz[c] || 0) + 1; }
    if (m.ST.over || m.G.dead) { cleared = !!m.ST.over && !m.G.dead; break; }
  }
  const r = { n, mode, diff: o.diff, clear: cleared, dead: !!m.G.dead, t: +m.G.t.toFixed(1), hits: m.ST.hits, w: o.endless ? window.ENDR.w : 0, cz, boss: !!m.G.boss, nd, ne, leg: JSON.stringify([window.CTR && CTR.stat, window.LEG && LEG.stat]) };
  m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), jobs = [], res = []; let next = 0, errs = 0, fails = 0;
  const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
  const url = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`;
  const mk = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { errs++; if (errs < 4) console.log('FAIL page error ' + e.message); }); await p.goto(url(q)); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  if (process.env.GATE !== '0') {   // flag: default (off) = the old rows exactly
    const rows = () => ({ on: !!(window.RET && RET.legend), d: JSON.stringify(window.__mnr.DIFFS.legend), fill: window.ABIL && ABIL.FILL.legend, ev: window.CTR && CTR.EV.legend });
    const p0 = await mk(''), p1 = await mk('&legend=1'); const a = await p0.evaluate(rows), b = await p1.evaluate(rows); await p0.close(); await p1.close();
    line(!a.on && b.on, `flag: default off (${a.on}), ?legend=1 on (${b.on})`);
    line(a.d === '{"d":4.7,"bs":2.4,"fr":6.6,"dn":1.8,"sd":2,"sbs":1.5,"sfr":1.7,"fan":5,"heal":0.15,"el":1.9,"aq":6}' && a.fill === .35 && a.ev === 4, `flag off keeps the old Legend rows (fill ${a.fill}, pressure every ${a.ev} bars)`);
  }
  for (const diff of DIFFS) for (const mode of MODES) for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, mode, diff, seed: k + 1, MAXT, endless: ENDLESS, build: BUILD });
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await mk(Q); if (process.env.PRE) await p.evaluate(process.env.PRE);
    while (next < jobs.length) { const j = jobs[next++]; try { res.push(await p.evaluate(BOT, j)); } catch (e) { console.log('RUN ERROR', j.n, j.mode, e.message.slice(0, 200)); } }
    await p.close();
  }));
  await br.close(); srv.kill();
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(res));
  const pct = a => a.length ? Math.round(100 * a.filter(r => r.clear).length / a.length) : 0, med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
  const cell = (d, mo, n) => res.filter(r => r.diff === d && r.mode === mo && (n == null || r.n === n));
  for (const d of DIFFS) for (const mo of MODES) { const a = cell(d, mo); if (!a.length) continue;
    console.log(ENDLESS ? `${d} ${mo} endless: wave med ${med(a.map(r => r.w))} [${a.map(r => r.w).sort((x, y) => x - y).join(' ')}] reach10 ${pct(a.map(r => ({ clear: r.w >= 10 })))}% reach25 ${pct(a.map(r => ({ clear: r.w >= 25 })))}%`
      : `${d} ${mo} clear% ` + STAGES.map(n => n + ':' + pct(cell(d, mo, n))).join(' ') + ` | pooled ${pct(a)}% | hits med ${med(a.map(r => r.hits))} | boss reached ${a.filter(r => r.boss || r.clear).length} | causes ${JSON.stringify(a.reduce((z, r) => { for (const k in r.cz) z[k] = (z[k] || 0) + r.cz[k]; return z; }, {}))} | dash/run ${Math.round(a.reduce((x, r) => x + r.nd, 0) / a.length)} (n=${a.length})`); }
  line(errs === 0, `no page errors (${errs})`);
  if (process.env.GATE !== '0' && Q === '&legend=1' && DIFFS.includes('legend')) {
    const L = mo => { const a = cell('legend', mo).filter(r => r.n === 10 || r.n === 20); return a.length ? pct(a) : null; };
    const g = (mo, lo, hi, flo, fhi, t) => { const v = L(mo); if (v == null) return; line(v >= flo && v <= fhi, `Legend ${mo} st10/20 pooled ${v}% (target ${t}${v >= lo && v <= hi ? '' : ', outside target, inside the noise band'})`); };
    g('human', 8, 25, 0, 35, '8-25%'); g('dodger', 35, 65, 25, 75, '35-65%'); g('camp', 0, 5, 0, 12, '<= 5%'); g('rand', 0, 3, 0, 10, '<= 3%');
    if (L('nodash') != null && L('beat') != null) line(L('nodash') <= L('beat') - 15, `Legend no-dash ${L('nodash')}% <= beat ${L('beat')}% - 25 (fail above -15)`);
    if (ENDLESS) { const a = cell('legend', 'human'); if (a.length) line(med(a.map(r => r.w)) <= 20, `Legend endless human median wave ${med(a.map(r => r.w))} <= 20`); }
  }
  console.log(fails ? `FAIL legend-test: ${fails} check(s)` : 'PASS legend-test'); process.exit(fails ? 1 : 0);
})();
