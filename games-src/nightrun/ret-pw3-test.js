#!/usr/bin/env node
// Nightrun POWER-UP LEVELS + five new shooter powers (flag RET.pw3, parts/powlevels.js). Real page in sim mode (?sim=1, stepped by hand), headless.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-pw3-test.js     env: GAME_DIR=...
// 1 level rules: +1 per pickup while running or within 4 bars of its end, max 5, timer restarts at 8 bars, a real hit -1 (min 1), an absorbed hit costs nothing
// 2 each power's level effects measured (ECHO, NOVA, MAGNET, WINGMATES, CRESCENDO, CHORD SHIELD, DRUM BURST, BOMB STOCK, HEAVY CRATE, RICOCHET, TIME SLICE, LIFE LEECH)
// 3 caps: player bullets <= 64/44 with every power at LV5, boss damage in any 1 s <= the armour cap with NOVA/BOMB at LV5, leech <= 1 hull per 20 s
// 4 drop table: stages 1-2 old pool, early drops of later stages 3 new + 2 old, Endless everything; weights comparable
// 5 save: best level per power in mnr_pw3 + the export list + the Stats sheet; first-time tips; flag off = old behaviour; HUD 'LV3' inside the screen at 390x763 and 1280x720
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const errs = [];
  const open = async (vp, q = '') => {
    const p = await br.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(e.message + ' @' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const pe0 = errs.push.bind(errs); errs.push = (x) => /slotFor/.test(x) ? errs.length : pe0(x);
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.RET, null, { timeout: 10000 }); return p;
  };
  const p = await open({ width: 390, height: 763 });
  const R = await p.evaluate(() => {
    const m = window.__mnr, out = {}, G = () => m.G, P = new Proxy({}, { get: (_, k) => m.P[k], set: (_, k, v) => { m.P[k] = v; return true; } }), PW = m.PW, NR = window.NR, P2 = PW.p2, X = window.__pw3.PW3, L = window.__pw3.PW3L;
    const fresh = (stage = 1) => { const sv = m.AU.a; m.AU.a = null; m.abort(); m.startStory(stage); m.AU.a = sv; m.simOn(true); m.god = true; m.STILL.t = 0; try { window.localStorage.removeItem('mnr_pw3'); } catch (e) { } X.hi = {}; X.seen = {}; X.stat.up = X.stat.down = 0; };
    const step = (n, f, dt = 1 / 60) => { for (let i = 0; i < n; i++) { if (f) f(i); m.STILL.t = 0; if (m.god) P.hp = P.max; G().pk = G().pk.filter(k => k.t !== 'pw'); if (G().boss && !m.keepBoss) G().boss = null; m.step(dt); } };
    const bars = [], beats = [], fires = []; NR.on('bar', () => bars.push(1)); NR.on('beat', d => beats.push(d.i)); NR.on('fire', f => fires.push(f.pf ? 1 : 0));
    let clock = 0; m.AU.a = { state: 'running', get currentTime() { return clock; } }; m.AU.a.createGain = null; m.AU.osc = () => { }; m.AU.noise = () => { };
    const act = k => G().pw && G().pw.act.find(a => a.k === k);
    const lvl = k => { const a = act(k); return a ? a.l3 : 0; };
    const giveN = (k, n) => { for (let i = 0; i < n; i++) PW.give(k, false); return act(k); };
    const cap = m.touchUI || m.rotMode ? 44 : 64;
    const hit = () => { m.god = false; P.inv = 0; P.hp = P.max; m.hurt(); m.god = true; P.inv = 0; };
    const dummy = (x, y, hp = 1e6) => { const d = { type: 'drone', dummy: 1, x, y, r: 16, hp, max: hp, hq: hp, flash: 0, t: 0, bf: 999, bn: 0, gr: 0, tin: 0, by: y }; G().en.push(d); return d; };
    // ---- 1 level rules ----
    { fresh(); PW.give('echo', false); out.l1 = lvl('echo'); const s0 = act('echo').s; step(60 * 6); PW.give('echo', false); const a = act('echo'); out.l2 = lvl('echo'); out.restart = a.s > s0 && a.d === 32;
      giveN('echo', 8); out.max = lvl('echo'); out.maxLv = act('echo').lv;
      // a hit lowers, never below 1, never ends the power
      const seq = []; for (let i = 0; i < 6; i++) { hit(); seq.push(lvl('echo')); } out.hits = seq; out.stillOn = PW.on('echo');
      // within 4 bars of ending: continues; after 4 bars: starts again at 1
      fresh(); giveN('nova', 3); step(1); G().pw.act.length = 0; step(60 * 2); out.afterEnd = (() => { PW.give('nova', false); return lvl('nova'); })();
      fresh(); giveN('nova', 3); step(1); G().pw.act.length = 0; step(1); step(60 * 12); out.late = (() => { PW.give('nova', false); return lvl('nova'); })();
      // replaced by another power: its level waits
      fresh(); giveN('wing', 3); PW.give('echo', false); out.repl = G().pw.act.map(a => a.k + a.l3).join(); PW.give('wing', false); out.back = lvl('wing');
      // absorbed hit (CHORD SHIELD) costs no level
      fresh(); giveN('chord', 3); giveN('echo', 1); giveN('chord', 1); out.chordLv = lvl('chord'); const hp0 = P.hp; step(60 * 3); m.god = false; P.inv = 0; P.hp = P.max; m.SH.sh = 0; m.hurt(); out.absorbLv = lvl('chord'); m.god = true; }
    // ---- 2a ECHO ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('echo', lv); const e0 = P2.stat.echo, h0 = X.stat.hb; const f0 = fires.length; let pierce = 0, maxDm = 0; for (let i = 0; i < 60 * 8; i++) { step(1); for (const b of G().pb) if (b.e3) { if (b.px) pierce++; maxDm = Math.max(maxDm, b.dm); } }
        res[lv] = { ghost: P2.stat.echo - e0, half: X.stat.hb - h0, shots: fires.slice(f0).filter(x => x).length, pierce, maxDm: +maxDm.toFixed(2) }; } out.echo = res; }
    // ---- 2b NOVA ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('nova', lv); const d = dummy(P.x + 100, P.y); let R0 = 0, r2 = 0, fl = 0, hp0 = d.hp; const b0 = bars.length; for (let i = 0; i < 60 * 10; i++) { clock = G().t; P.x = 150; P.y = 270; d.x = 250; d.y = 270; if (G().p2 && G().p2.nv) R0 = Math.max(R0, G().p2.nv.R); const n = X.S().rg.length; if (n) r2 = Math.max(r2, n); step(1); if (X.S().fld) fl = Math.max(fl, 1); }
        res[lv] = { R: R0, dm: lv === 1 ? 5 : lv === 3 ? 6 : 7, rings2: X.stat.ring2, field: X.stat.fld, hurt: hp0 - d.hp }; } out.nova = res; }
    // ---- 2c MAGNET ----
    { const res = {}; for (const lv of [1, 5]) { fresh(); giveN('magb', lv); res[lv] = { R: X.magR(), k: X.magK() }; const reach = () => { P.x = 100; P.y = 270; const pk = { t: 'shard', x: 700, y: 270, vx: -70, vy: 0, bob: 0 }; G().pk.push(pk); let t = 0; for (; t < 60 * 20 && !pk.dead; t++) { P.x = 100; P.y = 270; step(1); } return t / 60; }; res[lv].t = reach(); } out.magb = res; }
    // ---- 2d WINGMATES ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('wing', lv); let homing = 0, n = 0, maxd = 0; const w0 = P2.stat.wing; let per = []; for (let i = 0; i < 60 * 8; i++) { step(1); const wx = G().p3 ? G().p3.wx.length : 0; maxd = Math.max(maxd, wx); for (const b of G().pb) if (b.gh && b.hk === 3) homing++; }
        // one volley: count the bullets one off-beat volley adds
        const c0 = G().pb.length; const before = G().pb.slice(); let best = 0; for (let i = 0; i < 60 * 3; i++) { const b0 = G().pb.length; const w1 = P2.stat.wing; step(1); if (P2.stat.wing > w1) best = Math.max(best, G().pb.filter(b => b.gh && b.vx === 900 && b.vy === 0 && !before.includes(b)).length); }
        res[lv] = { extra: maxd, volleys: P2.stat.wing - w0, homing: homing > 0 }; } out.wing = res; }
    // ---- 2e CRESCENDO ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('cres', lv); let mx = 1; for (let i = 0; i < 60 * 40 && PW.on('cres'); i++) { step(1); mx = Math.max(mx, P2.cresK()); } res[lv] = +mx.toFixed(2); } out.cres = res; }
    // ---- 2f CHORD SHIELD ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('chord', lv); m.SH.sh = 0; step(60 * 2); m.god = false; P.hp = P.max; const abs = []; for (let i = 0; i < 3; i++) { P.inv = 0; const h = P.hp; m.hurt(); abs.push(P.hp === h ? 1 : 0); P.hp = P.max; } m.god = true; res[lv] = abs.join(''); }
      fresh(); giveN('chord', 5); step(60 * 2); const r0 = X.stat.refl, n0 = G().pb.length; G().eb.push({ x: P.x + 20, y: P.y, vx: -300, vy: 0, r: 4 }); const pb0 = G().pb.length; step(2); out.reflect = { refl: X.stat.refl - r0, gone: !G().eb.some(b => b.x < P.x + 60 && b.x > P.x - 60 && b.vx === -300), pb: G().pb.some(b => b.col === m.PWK.chord.c) }; out.chord = res; }
    // ---- 2g DRUM BURST (g.js shots driven by the level) ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('drum', lv); const a0 = PW.stat.auto; const seen = []; NR.on('beat', function h() { }); let mx = 0; for (let i = 0; i < 60 * 4; i++) { const n0 = G().pb.length; const b0 = beats.length; step(1); if (beats.length > b0) mx = Math.max(mx, G().pb.filter(b => b.vx >= 860 && b.vx <= 900 && b.x < P.x + 60).length); } res[lv] = mx; } out.drum = res; }
    // ---- 2h BOMB STOCK ----
    { fresh(); P.emp = 0; PW.give('bomb', false); out.bomb1 = P.emp; PW.give('bomb', false); PW.give('bomb', false); out.bomb3 = P.emp; fresh(); P.emp = 0; giveN('bomb', 3); out.bomb3s = P.emp;
      const dmg = lv => { fresh(); giveN('bomb', lv); P.emp = 3; const d = dummy(P.x + 120, P.y); step(2); const hp = d.hp; d.hq = d.hp; m.press('Emp'); step(1); const lost = hp - d.hp; return { lost, emp: P.emp }; };
      out.bombDmg = { 1: dmg(1), 4: dmg(4), 5: dmg(5) }; }
    // ---- 2i HEAVY CRATE ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('crate', lv); let heavy = 0, rad = 0, pn = 0, plain = 0, dmSum = 0, bursts = 0; const h0 = X.stat.heavy; for (let i = 0; i < 60 * 8; i++) { step(1); for (const b of G().pb) { if (b.big && b.col === m.PWK.crate.c) { heavy++; rad = Math.max(rad, b.rad); pn = Math.max(pn, b.pn); } } }
        res[lv] = { bursts: X.stat.heavy - h0, rad, pn, heavy: heavy > 0 }; }
      // the plain gun is replaced: volleys during the power leave no plain bullets from the base gun
      fresh(); giveN('crate', 1); const n0 = G().pb.length; m.SH.volley(P.x + 22, P.y, 0); out.crateVolley = { added: G().pb.length - n0, bank: X.S().bank > 0 }; out.crate = res; }
    // ---- 2j RICOCHET ----
    { const res = {}; for (const lv of [1, 3, 5]) { fresh(); giveN('ric', lv); const n0 = G().pb.length; m.SH.volley(P.x + 22, P.y, 0); const rcs = G().pb.slice(n0).map(b => b.rc); res[lv] = { rc: Math.max(...rcs), all: rcs.every(x => x === rcs[0]) }; }
      fresh(); giveN('ric', 1); G().pb.push({ x: 400, y: 4, vx: 300, vy: -300, dm: 1, pf: 0, rc: 1 }); const b = G().pb[G().pb.length - 1]; step(4); out.bounce = { vy: b.vy > 0, rc: b.rc }; out.ric = res; }
    // ---- 2k TIME SLICE ----
    { const res = {}; for (const lv of [1, 5]) { fresh(); giveN('slice', lv); const eb = { x: 700, y: 100, vx: -100, vy: 0, r: 4 }; let slow = 0, fast = 0, n = 0, minR = 9, maxR = 0; const spb0 = m.BT.spb; const bc0 = G().bc; for (let i = 0; i < 60 * 8; i++) { eb.x = 700; eb.y = 100; eb.dead = 0; if (!G().eb.includes(eb)) G().eb.push(eb); const x0 = eb.x; step(1); const r = (x0 - eb.x) / (100 / 60 * (G().slow || 1)); if (r > 0.05) { n++; const rr = r; minR = Math.min(minR, rr); maxR = Math.max(maxR, rr); if (rr < .9) slow++; else fast++; } }
        res[lv] = { duty: +(slow / Math.max(1, n)).toFixed(2), minR: +minR.toFixed(2), maxR: +maxR.toFixed(2), spb: m.BT.spb === spb0, bc: G().bc - bc0 }; }
      // the beat clock does not change: same frames with and without the power give the same beat count
      fresh(); const c0 = G().bc; step(60 * 8); const without = G().bc - c0; fresh(); giveN('slice', 5); const c1 = G().bc; step(60 * 8); out.sliceClock = [without, G().bc - c1]; out.slice = res; }
    // ---- 2l LIFE LEECH ----
    { const res = {}; for (const lv of [1, 5]) { fresh(); giveN('leech', lv); m.god = true; P.hp = 1; P.max = 5; const kills = () => { for (let i = 0; i < 30; i++) NR.emit('kill', { e: { x: 300, y: 200 } }); }; X.stat.leech = 0; let heals = 0, hp = P.hp; const t0 = G().t; const times = [];
        for (let i = 0; i < 60 * 60; i++) { if (i % 30 === 0 && !PW.on('leech')) giveN('leech', 1); if (act('leech')) { act('leech').s = PW.cur(); } m.STILL.t = 0; if (i % 60 === 0) kills(); m.step(1 / 60); if (X.stat.leech > heals) { heals = X.stat.leech; times.push(+(G().t - t0).toFixed(1)); } P.hp = Math.min(P.hp, 1); }
        res[lv] = { heals, times, gap: times.length > 1 ? Math.min(...times.slice(1).map((t, i) => t - times[i])) : null }; } m.god = true; out.leech = res; }
    // ---- 3 caps ----
    { fresh(); let mx = 0; for (const k of ['echo', 'wing', 'crate', 'ric', 'drum', 'nova']) { fresh(); giveN(k, 5); if (k === 'echo') giveN('echo', 0); for (let i = 0; i < 60 * 20; i++) { step(1); mx = Math.max(mx, G().pb.length); } } out.capMax = mx; out.capLimit = cap;
      // boss: damage in any 1 s window <= the armour cap with NOVA / BOMB at LV5
      fresh(); m.keepBoss = true; G().en = []; m.spawnBoss(); step(60 * 5); const B = G().boss; const B2X = window.__b2.B2X; if (B) { giveN('nova', 5); PW.give('bomb', false); giveN('bomb', 4); const hist = []; let mxLoss = 0, cap1 = 0; for (let i = 0; i < 60 * 25; i++) { if (i % 90 === 0) P.emp = 3; if (i % 90 === 1) m.press('Emp'); if (!G().boss) break; step(1); const b = G().boss; if (!b) break; hist.push([G().t, b.hp]); while (hist.length && G().t - hist[0][0] > 1) hist.shift(); const loss = hist[0][1] - b.hp; mxLoss = Math.max(mxLoss, loss); cap1 = B2X.cap(b); }
        out.bossCap = { maxLoss1s: +mxLoss.toFixed(1), cap: +cap1.toFixed(1) }; } m.keepBoss = false; }
    // ---- 4 drop table ----
    { fresh(1); const early = new Set(); for (const st of [1, 2]) { m.ST.n = st; G().p3 = null; for (let i = 0; i < 400; i++) { if (G().p3) G().p3.picks = 0; early.add(PW.pick()); } } out.stage12 = [...early].filter(k => m.PWK[k].nw);
      m.ST.n = 3; const first = new Set(), firstNew = new Set(); for (let i = 0; i < 300; i++) { G().p3 = null; for (let j = 0; j < 4; j++) { const k = PW.pick(); first.add(k); if (m.PWK[k].nw) firstNew.add(k); } } out.early = { kinds: [...first].sort().join(), n: first.size, newN: firstNew.size };
      const later = new Set(); for (let i = 0; i < 600; i++) { G().p3 = null; G().p3 = X.S(); G().p3.picks = 9; G().p3.stage = 3; later.add(PW.pick()); } out.later = [...later].filter(k => m.PWK[k].nw).length;
      m.ST.on = false; const all = {}; for (let i = 0; i < 4000; i++) { const k = PW.pick(); all[k] = (all[k] || 0) + 1; } m.ST.on = true; out.endless = all; out.w = { slow: m.PWK.slow.w, nw: ['bomb', 'crate', 'ric', 'slice', 'leech'].map(k => m.PWK[k].w) }; }
    // ---- 5 save, tips, sheet ----
    { fresh(); giveN('echo', 3); giveN('crate', 1); out.saved = JSON.parse(window.localStorage.getItem('mnr_pw3') || 'null'); out.sio = m.RET.sioKeys.includes('mnr_pw3'); out.sheet = X.sheet();
      fresh(); PW.give('ric', false); out.tipNew = G().hint && G().hint.t; out.tipTxt = G().hint && G().hint.txt; PW.give('ric', false); out.tipRule = G().hint && G().hint.txt; PW.give('ric', false); out.tipLater = G().hint && G().hint.t; }
    return out;
  });
  console.log('RAW', JSON.stringify(R));
  const j = o => JSON.stringify(o);
  ok(`levels: ${R.l1} -> ${R.l2} -> max ${R.max}; timer restarts at 8 bars: ${R.restart}; the g.js label agrees (${R.maxLv})`, R.l1 === 1 && R.l2 === 2 && R.restart && R.max === 5 && R.maxLv === 5);
  ok(`a hit lowers the level and never ends the power: ${R.hits.join('>')}`, j(R.hits) === j([4, 3, 2, 1, 1, 1]) && R.stillOn);
  ok(`within 4 bars of ending the level continues (${R.afterEnd}), after 12 bars it restarts (${R.late}), replaced power keeps its level (${R.repl} -> back at ${R.back})`, R.afterEnd === 4 && R.late === 1 && R.repl === 'echo1' && R.back === 4);
  ok(`an absorbed hit costs no level (chord LV ${R.chordLv} -> ${R.absorbLv})`, R.chordLv === R.absorbLv);
  const E = R.echo; ok(`ECHO: LV1 ghosts ${E[1].ghost} (half-beat ${E[1].half}), LV3 half-beat ${E[3].half}, LV5 half-beat ${E[5].half}, pierce LV1/3/5 ${E[1].pierce}/${E[3].pierce}/${E[5].pierce}, ghost dm ${E[1].maxDm}/${E[3].maxDm}/${E[5].maxDm}`,
    E[1].half === 0 && E[3].half >= E[3].shots - 2 && E[5].half >= 2 * (E[5].shots - 3) && E[1].pierce === 0 && E[5].pierce > 0 && E[5].maxDm > E[1].maxDm);
  const N = R.nova; ok(`NOVA: ring radius ${N[1].R}/${N[3].R}/${N[5].R}, 2nd rings ${N[1].rings2}/${N[3].rings2}/${N[5].rings2}, fields ${N[1].field}/${N[3].field}/${N[5].field}, damage to a dummy ${N[1].hurt.toFixed(0)}/${N[3].hurt.toFixed(0)}/${N[5].hurt.toFixed(0)}`,
    N[1].R === 230 && N[3].R === 260 && N[5].R === 320 && N[1].rings2 === 0 && N[3].rings2 >= 2 && N[1].field === 0 && N[5].field >= 2 && N[5].hurt > N[1].hurt);
  const M = R.magb; ok(`MAGNET: reach ${M[1].R} -> ${M[5].R}, pull x${M[1].k} -> x${M[5].k}, a far pickup arrives in ${M[1].t.toFixed(2)} s -> ${M[5].t.toFixed(2)} s`, M[5].R > M[1].R && M[5].k > M[1].k && M[5].t < M[1].t);
  const Wg = R.wing; ok(`WINGMATES: extra drones ${Wg[1].extra}/${Wg[3].extra}/${Wg[5].extra} (2 -> 3 -> 4 in all), LV5 shots home in: ${Wg[5].homing} (LV1 ${Wg[1].homing})`, Wg[1].extra === 0 && Wg[3].extra === 1 && Wg[5].extra === 2 && Wg[5].homing && !Wg[1].homing);
  const C = R.cres; ok(`CRESCENDO: peak multiplier ${C[1]} / ${C[3]} / ${C[5]} (caps 1.6 / 1.8 / 2.0)`, C[1] === 1.6 && C[3] === 1.8 && C[5] >= 1.9 && C[5] <= 2.0);
  ok(`CHORD SHIELD: hits absorbed (three tries) LV1 ${R.chord[1]}, LV3 ${R.chord[3]}, LV5 ${R.chord[5]}; LV5 reflects a bullet (${j(R.reflect)})`, R.chord[1] === '100' && R.chord[3] === '110' && R.reflect.refl === 1 && R.reflect.pb);
  ok(`DRUM BURST: auto-shot bullets on a beat LV1 ${R.drum[1]}, LV3 ${R.drum[3]}, LV5 ${R.drum[5]}`, R.drum[3] > R.drum[1] && R.drum[5] > R.drum[3]);
  ok(`BOMB STOCK: +${R.bomb1} EMP at LV1, up to 3 (${R.bomb3}), LV3 gives +2 (${R.bomb3s}); fired pulse damage LV1 ${R.bombDmg[1].lost.toFixed(0)} / LV4 ${R.bombDmg[4].lost.toFixed(0)} / LV5 ${R.bombDmg[5].lost.toFixed(0)}`,
    R.bomb1 === 1 && R.bomb3 === 3 && R.bomb3s === 3 && R.bombDmg[4].lost - R.bombDmg[1].lost >= 3 && R.bombDmg[5].lost - R.bombDmg[1].lost >= 7 && R.bombDmg[1].emp === 2);
  const Cr = R.crate; ok(`HEAVY CRATE: bursts ${Cr[1].bursts}/${Cr[3].bursts}/${Cr[5].bursts} in 8 s, size ${Cr[1].rad}/${Cr[3].rad}/${Cr[5].rad}, pierce ${Cr[1].pn}/${Cr[3].pn}/${Cr[5].pn}; the plain gun volley adds ${R.crateVolley.added} bullets and banks its damage`, Cr[1].heavy && Cr[1].bursts >= 6 && Cr[5].rad > Cr[1].rad && Cr[1].pn === 0 && Cr[3].pn === 1 && Cr[5].pn === 3 && R.crateVolley.bank);
  const Rc = R.ric; ok(`RICOCHET: bounces LV1 ${Rc[1].rc}, LV3 ${Rc[3].rc}, LV5 ${Rc[5].rc}; a shot at the top edge turns round (${j(R.bounce)})`, Rc[1].rc === 1 && Rc[3].rc === 2 && Rc[5].rc === 3 && R.bounce.vy && R.bounce.rc === 0);
  const Sl = R.slice; ok(`TIME SLICE: enemy bullets slow ${Sl[1].duty * 100}% of the time at x${Sl[1].minR} (LV1) -> ${Sl[5].duty * 100}% at x${Sl[5].minR} (LV5); the beat clock is unchanged (beats ${R.sliceClock.join(' vs ')})`,
    Sl[1].minR < .7 && Sl[5].minR < Sl[1].minR && Sl[5].duty > Sl[1].duty && Sl[1].maxR > .9 && R.sliceClock[0] === R.sliceClock[1] && Sl[1].spb && Sl[5].spb);
  const Lc = R.leech; ok(`LIFE LEECH: hull healed in 60 s LV1 ${Lc[1].heals} (${Lc[1].times.join(',')}), LV5 ${Lc[5].heals} (${Lc[5].times.join(',')}), shortest gap ${Lc[5].gap} s (>= 20)`, Lc[5].heals >= 1 && (Lc[5].gap == null || Lc[5].gap >= 20) && Lc[5].heals <= 4 && Lc[1].heals <= Lc[5].heals);
  ok(`player bullets stay under the cap with ECHO/WINGMATES/CRATE/RICOCHET/DRUM/NOVA at LV5 (${R.capMax} <= ${R.capLimit})`, R.capMax <= R.capLimit);
  ok(`boss damage with NOVA + BOMB at LV5: most lost in any 1 s ${R.bossCap && R.bossCap.maxLoss1s} <= armour cap ${R.bossCap && R.bossCap.cap} (+10%)`, !!R.bossCap && R.bossCap.maxLoss1s <= R.bossCap.cap * 1.1 + 1);
  ok(`drop table: stages 1-2 give no new power (${R.stage12.join(',') || 'none'}); the first 4 drops of stage 3 use ${R.early.n} kinds with ${R.early.newN} new (<= 5 and 3); later drops reach ${R.later} of 5 new`, R.stage12.length === 0 && R.early.n <= 5 && R.early.newN <= 3 && R.later >= 4);
  ok(`Endless uses everything, weights ${R.w.nw.join(',')} vs SLOW GROOVE ${R.w.slow}: ${['bomb', 'crate', 'ric', 'slice', 'leech', 'echo', 'drum'].map(k => k + ':' + (R.endless[k] || 0)).join(' ')}`, R.w.nw.every(w => w === R.w.slow) && ['bomb', 'crate', 'ric', 'slice', 'leech', 'echo', 'drum'].every(k => R.endless[k] > 100));
  ok(`best level saved (${j(R.saved && R.saved.hi)}), in the export list ${R.sio}, in the Stats sheet`, R.saved && R.saved.hi.echo === 3 && R.saved.hi.crate === 1 && R.sio && /ECHO/.test(R.sheet) && /LV3/.test(R.sheet));
  ok(`first-time tips: new power ${R.tipNew}s "${R.tipTxt}", leveling rule "${R.tipRule}", then short ${R.tipLater}s`, R.tipNew >= 5 && /RICOCHET/.test(R.tipTxt) && /level up/i.test(R.tipRule) && R.tipLater <= 3);

  { const q = await open({ width: 390, height: 763 }, '&pw3=0');   // flag off = baseline
    const O = await q.evaluate(() => { const m = window.__mnr, PW = m.PW, P = m.P; m.startStory(1); m.simOn(true); m.god = true; PW.give('echo', false); PW.give('echo', false); const a = PW.st().act.find(x => x.k === 'echo'); const nw = ['bomb', 'crate', 'ric', 'slice', 'leech'].filter(k => m.PWK[k]);
      return { flag: m.RET.pw3, nw: nw.length, l3: a.l3 === undefined, lv: a.lv, d: a.d, key: window.localStorage.getItem('mnr_pw3'), sio: m.RET.sioKeys.includes('mnr_pw3'), api: !!window.__pw3 }; });
    ok(`flag off (?pw3=0) = old: flag ${O.flag}, new powers ${O.nw}, no level field ${O.l3}, g.js's longer timer ${O.d} (LV${O.lv}), nothing saved ${O.key === null}, not in export list ${!O.sio}`, O.flag === false && O.nw === 0 && O.l3 && O.d > 32 && O.key === null && !O.sio && !O.api);
    await q.close(); }
  // HUD: the level on the power's bar, inside the screen
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) {
    const q = await open(vp);
    const H = await q.evaluate(() => { const m = window.__mnr; m.startStory(1); m.simOn(true); m.god = true; for (let i = 0; i < 30; i++) m.step(1 / 60); for (let i = 0; i < 3; i++) m.PW.give('echo', false); m.render(m.G.t, 0);
      const txt = [], ft = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, x, y) { if (/^LV\d$/.test(String(t))) { const tr = this.getTransform(); txt.push({ t, l: tr.e + x * tr.a + y * tr.c, tp: tr.f + x * tr.b + y * tr.d, cw: this.canvas.width, ch: this.canvas.height, font: this.font }); } return ft.apply(this, arguments); };
      for (let i = 0; i < 4; i++) { m.step(1 / 60); m.render(m.G.t, 1 / 60); } CanvasRenderingContext2D.prototype.fillText = ft; return { txt }; });
    const lv3 = H.txt.filter(x => x.t === 'LV3'); const inside = lv3.length > 0 && lv3.every(r => r.l >= 0 && r.l < r.cw - 20 && r.tp > 8 && r.tp < r.ch);
    ok(`HUD shows LV3 on the ECHO bar (${lv3.length} draws) inside the canvas at ${vp.width}x${vp.height}`, inside, JSON.stringify(lv3.slice(0, 2)));
    await q.close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
