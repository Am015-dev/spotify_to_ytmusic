#!/usr/bin/env node
// HUMAN-MODEL bot + measurement table (Normal, story stages, headless ?sim=1). Prints pass/fail lines and, with REPORT=1, the table.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/humanbot.js
//   env: BOTS=human,dodger BUILDS=fresh,mid,late,owner STAGES=3,8,20 RUNS=12 PAR=4 REPORT=1 Q='&grit=0' PRE='GRIT.fkM={drone:1.15}' JSON=out.json
// human: acts on a view 180-250 ms old, sees only bullets within 260 px ahead of the ship (no oracle), ~12% of dodge needs are missed (0.4 s blind),
//   steering noise, DASH on 40% of the threats, EMP when 4+ bullets are within 150 px, manual aim with error and slow retarget, a 1 s lapse about every 25 s.
// dodger: the oracle used by balance-test.js (perfect player proxy). owner build = PULSE 3 + SWARM 10 on top of the mid shop.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 12, PAR = +process.env.PAR || 4, MAXT = +process.env.MAXT || (process.env.ENDLESS ? 1200 : 300), ENDLESS = !!process.env.ENDLESS, DIFF = process.env.DIFF || 'normal';
const STAGES = (process.env.STAGES || '3,8,20').split(',').map(Number), BOTS = (process.env.BOTS || 'human,dodger').split(','), BUILDS = (process.env.BUILDS || 'fresh,mid,late,owner').split(',');
const HP = process.env.HP ? JSON.parse(process.env.HP) : {};   // human parameters override
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const BOT = (o) => {
  const process_noBossGod = !!o.noBossGod;
  const m = window.__mnr, { n, build, bot, seed } = o; m.SET.diff = o.diff || 'normal'; try { m.applySet(); } catch (e) { }
  if (o.endless) { m.ST.on = false; document.getElementById('startBtn').click(); } else if(n>0)m.startStory(n);else{m.ST.on=false;document.getElementById('startBtn').click();} m.simOn(true); const e0 = window.ABIL ? window.ABIL.stat.emp : 0;
  let sd = seed * 7919 + 13; const rnd = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };   // own dice: a run is repeatable
  const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += rnd(); return (s - 2) * 1.73; };
  const WP = window.__wp, SH = m.SH, late = build === 'late';
  const ups = () => {
    if (build === 'fresh') return;
    const owner = build === 'owner';
    WP.eq = late ? ['pulse', 'swarm'] : ['pulse', 'swarm']; WP.lv = {};
    for (const id of WP.eq) WP.lv[id] = owner ? (id === 'swarm' ? 10 : 3) : late ? (id === 'swarm' ? 4 : 5) : 2; WP.sync();
    const ids = SH.UPG.map(u => u.id), want = late ? { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 } : { fr: 2, dm: 2, hm: 1 };
    for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id]; k++) { try { SH.add(id); } catch (e) { } }
    try { SH.recalc && SH.recalc(); } catch (e) { }
  };
  ups();
  const keepPw = () => { if (!late) return; for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } } };
  const H = Object.assign({ home: 220, dMin: .18, dMax: .2, xtra: .7, miss: .1, blind: .4, look: 260, noise: 8, dash: .4, emp: 4, empR: 150, aimErr: 38, retarget: .45, lapseEvery: 30, lapse: 1 }, o.hp || {});
  const pol = o.policy || 'hold', sqm = new Map(); let mode = -1, sw = 0;
  const hist = []; let delay = H.dMin + rnd() * (H.dMax - H.dMin), blindUntil = -1, wasThreat = false, lapseAt = H.lapseEvery * (.5 + rnd()), lapseUntil = -1, aimY = 270, aimT = -9, nx = 0, ny = 0, nT = -9, hold = null;
  const snap = () => { const G = m.G; return { t: G.t, px: m.P.x, py: m.P.y, eb: G.eb.map(b => [b.x, b.y, b.vx, b.vy]), en: G.en.map(e => [e.type, e.x, e.y, e.r, e.gy, e.gap]) }; };
  let BM = null; const bmUpd = () => { BM = window.BMV && window.BMV.on && m.G.boss ? window.BMV : null; };   // endless meets bosses mid-run: look each decision
  let PULL = .6, XW = .15;   // as balance-test: a boss counter target is chased only between telegraphs
  const pickHp = () => { if (!o.endless || m.P.hp >= m.P.max) return null; let b = null; for (const q of m.G.pk) if (q.t === 'hp' && q.x > 40 && q.x < 700 && (!b || q.x < b.x)) b = q; return b; };   // endless: a hurt ship goes for a hull drop, as a player does
  const cost = (S, cx, cy, ty, tx, look) => {   // same grid cost as the oracle, but over what a human sees
    let c = BM ? BM.cost(cx, cy) : 0, dtp = .14 + (S.age || 0);
    for (const b of S.eb) { if (look && (b.x - S.px > look || b.x - S.px < -120)) continue; const px = b[0] + b[2] * dtp, py = b[1] + b[3] * dtp, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
    for (const e of S.en) { if (e[0] === 'gate') { if (Math.abs(e[1] - cx) < 60 && (cy < e[4] - e[5] / 2 + 12 || cy > e[4] + e[5] / 2 - 12)) c += 3000; continue; } if (look && e[1] - S.px > look + 120) continue; const d = Math.hypot(e[1] - cx, e[2] - cy), r = e[3] + 55; if (d < r) c += (r - d) * (r - d) * 3; }
    return c + Math.abs(cy - ty) * PULL + Math.abs(cx - tx) * XW;
  };
  const decide = (human) => {
    const G = m.G, P = m.P;
    if (!human) {   // the oracle (balance-test dec, minus boss/camp hooks that never matter below the stage-8 boss)
      let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
      for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.cores && e.cores.length ? e.cores[0].y : e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
      const S = snap(); const bt = BM && BM.target(); if (bt) ty = bt.y; PULL = bt && BM.hz.some(z => !z.mk && z.on - G.t < .9 && G.t < z.off) ? .08 : .6; XW = .15; const hk = pickHp(); if (hk) { ty = hk.y; tx = hk.x; PULL = 1.2; XW = .6; } let bc = 1e18, bx = P.x, by = P.y;
      for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = cost(S, cx, cy, ty, tx, 0) + Math.hypot(ix, iy) * 4; if (window.MM && MM.col) c += MM.cost(cx); if (c < bc) { bc = c; bx = cx; by = cy; } }
      const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
      return { bx, by, dash: near && P.dashCd <= 0 && rnd() < .5, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
    }
    // human: the view from `delay` seconds ago
    hist.push(snap()); while (hist.length > 2 && hist[1].t <= G.t - delay) hist.shift(); const S = hist[0]; S.age = (G.t - S.t) * H.xtra;   // a human extrapolates bullet motion (xtra = how much of the view age)
    if (G.t < lapseUntil) return hold || { bx: P.x, by: P.y, dash: false, emp: false };
    if (G.t > lapseAt) { lapseUntil = G.t + H.lapse * (.6 + .8 * rnd()); lapseAt = lapseUntil + H.lapseEvery * (.5 + rnd()); hold = { bx: P.x + (rnd() - .5) * 60, by: P.y + (rnd() - .5) * 60, dash: false, emp: false }; return hold; }
    if (G.t - aimT > H.retarget) {   // manual aim: the nearest foe ahead, with an error that changes slowly
      aimT = G.t; let bd = 1e9, ty = 270 + 140 * Math.sin(G.t * .9);
      for (const e of S.en) { if (e[0] === 'boss') { ty = e[2]; continue; } const dx = e[1] - S.px; if (dx > 0 && dx < bd && e[1] < 940) { bd = dx; ty = e[0] === 'gate' ? e[4] : e[2]; } }
      aimY = ty + gauss() * H.aimErr;
    }
    if (G.t - nT > .3) { nT = G.t; nx = gauss() * H.noise; ny = gauss() * H.noise; }
    let tx = H.home + 70 * Math.sin(G.t * .55); PULL = .6; XW = .15;
    const WV = window.WV, B = WV && WV.bt, live = B && B.live;   // W293 policy: hold (home x, the old bot) | push (fly in on every bounty squad) | choose (push when hull >= 2 and no charger aims at its row)
    let push = false;
    if (WV && pol !== 'hold' && (live || pol === 'push')) {   // push: every squad, gold or not; choose: soft squads (drones) at hull >= 2, hard ones (guns, chargers) only at hull >= 3 with DASH or EMP ready
      let f = null, hard = false; for (const e of WV.st.foes) if ((live ? e.bq === live : e.bq) && e.hp > 0 && !e.dead && !(e.wv && e.wv.st === 'out') && !(e.sl && e.sl.out)) { if (!f || e.x < f.x) f = e; if (/turret|gunship|charger|shielder|mine/.test(e.type)) hard = true; }
      if (f && pol === 'choose') for (const e of WV.st.foes) if (e.bq && e.hp > 0 && !e.dead && /turret|gunship|shielder/.test(e.type) && Math.hypot(e.x - (f.x - 100), e.y - f.y) < 200) hard = true;   // a gun near the push spot counts too
      const aimed = G.en.some(e => e.aimL && Math.abs(e.y - P.y) < 70), ready = (H.dash > 0 && P.dashCd <= 0) || (H.emp < 99 && P.emp > 0);
      push = !!f && (pol === 'push' || (!aimed && (hard ? P.hp >= 3 && ready : P.hp >= 2)));
      if (push) { tx = Math.max(H.home, Math.min(f.x - 100, 700)); aimY = f.y + gauss() * H.aimErr * .5; XW = .5; }
    }
    const md = push ? 1 : 0; if (md !== mode) { if (mode >= 0) sw++; mode = md; }
    const cur = B && (B.live || B.now); if (cur) { const c = sqm.get(cur.id) || [0, 0]; c[md]++; sqm.set(cur.id, c); }
    const hk = pickHp(); if (hk) { tx = hk.x; aimY = hk.y; PULL = 1.2; XW = .6; } let bc = 1e18, bx = P.x, by = P.y, c0 = 0;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) { const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; const c = cost(S, cx, cy, aimY, tx, H.look) + Math.hypot(ix, iy) * 4; if (ix === 0 && iy === 0) c0 = c; if (c < bc) { bc = c; bx = cx; by = cy; } }
    const threat = c0 > 4000;   // standing where it is costs a lot: a dodge is needed
    if (threat && !wasThreat && G.t > blindUntil && rnd() < H.miss) blindUntil = G.t + H.blind;   // one roll per threat episode
    wasThreat = threat;
    if (G.t < blindUntil) { bx = P.x; by = P.y; }
    const near = S.eb.some(b => Math.hypot(b[0] + b[2] * .08 - S.px, b[1] + b[3] * .08 - S.py) < 30 && b[0] - S.px < H.look);
    let cnt = 0; for (const b of G.eb) if (Math.hypot(b.x - P.x, b.y - P.y) < H.empR) cnt++;
    return { bx: bx + nx, by: by + ny, dash: near && P.dashCd <= 0 && G.t > blindUntil && rnd() < H.dash * .5, emp: P.emp > 0 && cnt >= H.emp };
  };
  const CF = { t: 0, push: 0, live: 0, livePush: 0, c: {}, cp: {} };
  const human = bot === 'human', rec = new Map(); let i = 0, lastBeat = -1, tapAt = -1, d = null, cleared = false; const dt = 1 / 60;
  const LK = window.LEAK;
  while (m.running && m.G.t < o.MAXT && !(n === 0 && !o.endless && LK && LK.waves >= 10) && !(o.endless && window.ENDR.w >= n)) {   // ENDLESS=1: n = the endramp wave to reach (endramp-test.js)
    if (SH.active) { SH.close(); ups(); }
    if (o.endless && window.ENDR.w !== window.__lw) { window.__lw = window.ENDR.w; (window.__wt = window.__wt || []).push([window.__lw, Math.round(m.G.t), m.G.eb.length, m.P.hp, m.G.boss ? 'B' : '']); }
    if (o.endless && !process_noBossGod) m.god = !!m.G.boss;   // endless: the bot cannot play the boss gates (BOSSGOD=0 turns this off); the ramp is measured on the waves between bosses
    if (i % 60 === 0) keepPw();
    if (i % 3 === 0) { bmUpd(); d = decide(human); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bp = m.bpos(), bn = Math.floor(bp);
    if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); }
    if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    const G = m.G;
    for (const e of G.en) { let r = rec.get(e); if (!r) { r = { ty: e.type + (e.el ? '*' : ''), in: -1, end: -1, boss: e.type === 'boss', mini: !!e.mini }; rec.set(e, r); } if (r.in < 0 && e.x < 960 - (e.r || 14)) r.in = G.t; }
    const hp0 = m.P.hp, ebs = m.G.eb.map(b => [b.x, b.y, !!b.fl]), ens = m.G.en.map(e => [e.type, e.x, e.y, e.r]), px0 = m.P.x, py0 = m.P.y, bspan = m.G.boss ? 1 : 0;
    m.step(dt); i++; CF.t++; if (mode === 1) CF.push++; if (window.WV && WV.bt && WV.bt.live) { CF.live++; if (mode === 1) CF.livePush++; }
    if (m.P.hp < hp0) { const near = ebs.filter(b => Math.hypot(b[0] - px0, b[1] - py0) < 45); let c = bspan ? 'boss' : near.some(b => b[2]) ? 'flak' : near.length ? 'bullet' : ens.some(e => Math.hypot(e[1] - px0, e[2] - py0) < e[3] + 25) ? 'collision' : 'other'; CF.c[c] = (CF.c[c] || 0) + hp0 - m.P.hp; if (mode === 1) CF.cp[c] = (CF.cp[c] || 0) + hp0 - m.P.hp; } if (window.__rec) window.__rec(m, i);   // optional recorder (pacing-test.js)
    for (const [e, r] of rec) if (r.end < 0 && (e.dead || !m.G.en.includes(e))) { r.end = m.G.t; r.killed = e.hp <= 0; }
    if (m.ST.over || m.G.dead) { cleared = !!m.ST.over && !m.G.dead; break; }
  }
  const life = []; for (const [e, r] of rec) { if (r.boss || r.mini || !r.killed || r.in < 0 || r.end - r.in <= 0) continue; life.push([r.ty, +(r.end - r.in).toFixed(2)]); }
  let sp = 0, lk = 0, lw = 0; for (const [e, r] of rec) { if (r.boss || r.mini || !LK || !(LK.weight(e) > 0)) continue; sp++; if (e.lkd) { lk++; lw += LK.weight(e); } }
  if (o.endless) cleared = window.ENDR.w >= n && !m.G.dead;
  const res = { px: window.__recOut ? window.__recOut(m) : null, w: o.endless ? window.ENDR.w : 0, wt: window.__wt, sp, lk, lw, hl: window.HOLD ? window.HOLD.stat() : null, n, build, bot, clear: cleared, dead: !!m.G.dead, t: +m.G.t.toFixed(1), hits: o.endless ? 0 : m.ST.hits, life, emp: m.ST.emps || (window.ABIL ? window.ABIL.stat.emp - e0 : 0), seed, policy: pol, score: m.G.score, gold: window.WV && WV.bt ? WV.bt.n : 0, sqs: window.WV && WV.bt ? WV.bt.m : 0, sw, sqMode: [...sqm.entries()].sort((a, b) => a[0] - b[0]).map(([k, c]) => c[1] > c[0] ? 1 : 0), sqLog: window.WV ? WV.log.sqs : [], cf: CF, flak: window.WV ? WV.log.flak | 0 : 0 };
  m.abort(); return res;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), jobs = [], res = []; let next = 0, errs = 0;
  for (const bot of BOTS) for (const build of BUILDS) for (const n of STAGES) for (let k = 0; k < RUNS; k++) jobs.push({ n, build, bot, seed: k + 1 + (+process.env.SEEDBASE || 0), MAXT, hp: HP, policy: process.env.POLICY || 'hold', endless: ENDLESS, diff: DIFF, noBossGod: process.env.BOSSGOD === '0' });
  await Promise.all(Array.from({ length: PAR }, async () => {
    const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { errs++; if (errs < 4) console.log('FAIL page error ' + e.message); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${process.env.Q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    if (process.env.PRE) await p.evaluate(process.env.PRE);
    while (next < jobs.length) { const j = jobs[next++]; try { res.push(await p.evaluate(BOT, j)); } catch (e) { console.log('RUN ERROR', j.n, j.build, e.message.slice(0, 200)); } }
    await p.close();
  }));
  await br.close(); srv.kill();
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(res));
  const med = a => { if (!a.length) return 0; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const pct = a => a.length ? Math.round(100 * a.filter(r => r.clear).length / a.length) : 0;
  let fails = errs ? 1 : 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
  const cell = (bot, build, n) => res.filter(r => r.bot === bot && r.build === build && (n == null || r.n === n));
  for (const bot of BOTS) for (const build of BUILDS) {
    const a = cell(bot, build), by = {}; for (const r of a) for (const [t, s] of r.life) (by[t] = by[t] || []).push(s);
    const lifes = Object.keys(by).sort().filter(t => by[t].length >= 3).map(t => `${t}:${med(by[t]).toFixed(1)}`).join(' ');
    console.log(`${bot}/${build} clear% ` + STAGES.map(n => n + ':' + pct(cell(bot, build, n))).join(' ') + ' | hits med ' + STAGES.map(n => n + ':' + med(cell(bot, build, n).map(r => r.hits))).join(' ') + ' | life med s ' + lifes + ` | all-kill med ${med([].concat(...a.map(r => r.life.map(l => l[1])))).toFixed(2)} (n=${a.length})`);
  }
  for (const bot of BOTS) for (const build of BUILDS) for (const n of STAGES) { const a = cell(bot, build, n); if (!a.length) continue; const sp = a.reduce((x, r) => x + r.sp, 0), lk = a.reduce((x, r) => x + r.lk, 0), mins = a.reduce((x, r) => x + r.t, 0) / 60; console.log(`leaks ${bot}/${build} stage ${n}: ${(lk / Math.max(mins, .01)).toFixed(1)}/min, share ${(100 * lk / Math.max(sp, 1)).toFixed(1)}% of ${sp} spawns, clear ${pct(a)}%`); }
  // calibration gate: the human bot clears Normal stage 3 about 95% on the fresh/mid/late builds; with parts/difficulty/bite.js (default ON, Q='&bite=0' = off) the target is 60-85%
  const BITE0 = /[?&]bite=0/.test(process.env.Q || '') || DIFF !== 'normal';
  if (BOTS.includes('human') && STAGES.includes(3)) for (const build of BUILDS) if (build !== 'owner') { const c = pct(cell('human', build, 3)); line(BITE0 ? c >= 85 : c >= 45 && c <= 95, BITE0 ? `human ${build} Normal stage 3 clear ${c}% (calibration target ~95%, gate >= 85% at small RUNS)` : `human ${build} Normal stage 3 clear ${c}% (bite: target 60-85%, gate 45-95% at small RUNS)`); }
  console.log(fails ? `FAIL humanbot-test: ${fails} check(s)` : 'PASS humanbot-test'); process.exit(fails ? 1 : 0);
})();
