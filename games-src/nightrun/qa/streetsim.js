#!/usr/bin/env node
// STREETSIM: the street stage (zeil) in fast stepped simulation, no drawing, no rAF, no wall clock (FOOT.sim(1, 1/60) loops), >= 100x real time.
// Bots: idle (no input), nearest (street2-test's human-style bot, shoots the nearest foe), gfirst (streethard-test's gunner-first bot with ducking), dodge (gunner-first, reacts to every telegraph
// in 0.1 s and always ducks level shots). Seeds are fixed (4321 + i * 7919), so a run is reproducible: ONLY=bot:seed prints that one run's record.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetsim.js     env: RUNS=50 (per bot)  PAR=1 (pages)  BOTS=idle,nearest,gfirst,dodge(,melee,parry)  OUT=<md>  RT=0 (skip the real-time check)  GATE=0 (numbers only)
// Gates (PASS/FAIL): no NaN/stuck  idle bot dies  best bot clears 50-80%  threat peak 80-90% (median over runs)  whole suite < 3 min  speed >= 100x  one seed equals a real-time run (deaths within 1 s)
// Records per run: cleared/died and when, hearts lost and to what, time to kill per foe type, gunner calls, cover blocks, shots dodged by ducking, threat curve (live foe weight each second) and its peak,
// seconds Kai stood still, NaN / stuck / lingering-foe checks.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 50, PAR = +process.env.PAR || 1, GATE = process.env.GATE !== '0';
const BOTS = (process.env.BOTS || 'idle,nearest,gfirst,dodge').split(','), OUT = process.env.OUT || path.join(__dirname, 'STREETSIM.md'), RT = process.env.RT !== '0';
const XB = ['melee', 'dash'];   // bots left out of the whole-street gates (own flags)
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const seedOf = i => 4321 + i * 7919;

// ---- the bots: taken from the street tests themselves (one source of truth)
const src = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'); let RUN = src.slice(src.indexOf('const RUN = ') + 12, src.indexOf('\n(async () =>')).trim().replace(/;$/, '').replace('i < 200', 'i < 300');   // W168: a 45-90 s boss fight ends after 200 s game time
const NEAR = 'if (near) P.facing = near.x > P.x ? 1 : -1;', DUCK = '// bullets: hop low ones', REACT = 'S.time + .2 + rnd() * .15, go: rnd() > .25';
for (const k of [NEAR, DUCK, REACT, "for (const p of S.pk) if ("]) if (!RUN.includes(k)) { console.log('FAIL streetsim: street2-test bot changed, missing: ' + k); process.exit(2); }
// W180: the platforms have no depth yet (HANDOFF-W173), so on the belt the bots stay on the road: shots from a platform fly over the foes on the floor
const PATHK = "rnd() < .5 ? 'high' : 'low'";
if (!RUN.includes(PATHK)) { console.log('FAIL streetsim: street2-test bot changed, missing: ' + PATHK); process.exit(2); }
RUN = RUN.replace(PATHK, "rnd() < .5 && !RET.belt ? 'high' : 'low'");
// W186: every bot sees the pound's red line (jumps it at the end of the wind-up) and the leap's red landing ring (0.8 s; after its own reaction time it leaves it in x) (the casual bot used to ignore it: 0-9% dodged)
RUN = RUN.replace(DUCK, "for (const e of live) if (e.boss && e.state === 'sb_poundW' && Math.abs(e.x - P.x) < 260 && see(e, 'pd' + (e.L ? e.L.at.length : 0)) && e.sT > .62 && P.onGround) { I.jumpP = 1; I.jump = 1; }\n    for (const e of live) if (e.boss && /^sb_leap/.test(e.state) && e.tx != null && see(e, 'lp' + (e.L ? e.L.at.length : 0))) { if (Math.abs(e.tx - P.x) < 120) { const rt = P.x - S.camX < vw / 2; I.r = rt ? 1 : 0; I.l = rt ? 0 : 1; } }\n    " + DUCK);
const RUNG = RUN.replace(NEAR, "{ const ga = window.__gf && live.find(e => e.id === 'gunner'), gf = ga && !ga.hid ? ga : null, tg = gf || near; if (tg) P.facing = tg.x > P.x ? 1 : -1;" +
    " if (ga && !live.some(e => e.id === 'rusher' && Math.abs(e.x - P.x) < 170)) { window.__gpush = ga.x > P.x ? 1 : -1; window.__gpd = Math.abs(ga.x - P.x); } else window.__gpush = 0; }")
  .replace("for (const p of S.pk) if (", "if (window.__gpush && window.__gpd > 150) { I.l = window.__gpush < 0 ? 1 : 0; I.r = window.__gpush > 0 ? 1 : 0; P.facing = window.__gpush; }\n" +
    // W171: get behind the shield guard (step or jump past its front, then shoot its back while it turns)
    "{ const gd = live.find(e => e.id === 'guard' && !e.open); if (gd && !live.some(e => e.id === 'rusher' && Math.abs(e.x - P.x) < 120)) { const dx = gd.x - P.x, inFront = Math.sign(-dx) === gd.facing;" +
    " if (inFront && Math.abs(dx) < 320) { I.l = dx < 0 ? 1 : 0; I.r = dx > 0 ? 1 : 0; if (gd.state === 'wind' && Math.abs(dx) < 150 && P.onGround) { I.jumpP = 1; I.jump = 1; } }" +
    " else if (!inFront) { I.l = I.r = 0; if (Math.abs(dx) < 90) I[dx > 0 ? 'l' : 'r'] = 1; } P.facing = dx > 0 ? 1 : -1; } }\n    for (const p of S.pk) if (")
  .replace(DUCK, "for (const b of S.eb) { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .35 && !b.vy && P.onGround && see({ id: 'd', _bid: b.x0 || (b.x0 = b.x) }, 'd')) b.duck = 1; if (b.duck && t > -.1 && t < .35) I.d = 1; }\n" + DUCK);
const RUND = RUNG.replace(REACT, 'S.time + .1, go: true')
  .replace(DUCK, "for (const e of live) if (e.boss && e.atk) { const dx = e.x - P.x;   // W167 streetboss (?sboss=1): the answer to each boss attack on its telegraph\n" +
    "  if (e.state === 'charge' && Math.sign(-dx) === e.facing && P.onGround) { I.l = I.r = 0; I.jumpP = I.jump = (Math.abs(dx) - 60) / 560 < .12 ? 1 : 0; }\n" +
    "  if (e.state === 'sb_poundW' && e.sT > .65 && Math.abs(dx) < 260 && P.onGround) { I.jumpP = 1; I.jump = 1; }\n" +
    "  if (/^sb_throw/.test(e.state)) { I.l = dx > 0 ? 1 : 0; I.r = dx < 0 ? 1 : 0; }\n" +
    "  if (/^sb_leap/.test(e.state)) { const m = e.tx - P.x; if (Math.abs(m) < 110) { I.l = m > 0 ? 1 : 0; I.r = m < 0 ? 1 : 0; if (e.state === 'sb_leap' && e.sT > .45) I.dashP = 1; } } }\n" +
    "for (const e of live) if (e.id === 'shound' && Math.abs(e.x - P.x) < 300) { if (P.onGround && ((e.state === 'set' && e.tele < .12) || (e.state === 'pounce' && e.sT < .25))) { I.jumpP = 1; S._hjP = S.time; } if (e.state === 'pounce' || (e.state === 'set' && e.tele < .12)) { I.jump = 1; S._hj = S.time; } }   // W185: jump the hound's pounce\n" +
    "for (const b of S.eb) if (b.ground && b.src === 'bigheavy') { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .25 && P.onGround) { I.d = 0; I.jumpP = 1; I.jump = 1; } }\n" + DUCK);
// W173 belt (default ON since W180; Q=&belt=0 = old road): every bot lines up with its target's depth (stick up/down); the dodge bot steps 0.35 of the band out of line on every telegraph and every shot in its lane
const BEND = 'I.l = p.x < P.x; } };';
if (!RUN.includes(BEND)) { console.log('FAIL streetsim: street2-test bot changed, missing: ' + BEND); process.exit(2); }
const BELT = "I.l = p.x < P.x; }\n    if (RET.belt && P.z != null) { I.u = I.d = 0; const gt = window.__gf && live.find(e => e.id === 'gunner' && !e.hid), nb = live.filter(e => !(e._sk > S.time)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0], tg = gt || nb || near; if (tg) { if (S._tg !== tg || S._tgH !== tg.hp) { S._tg = tg; S._tgH = tg.hp; S._tgT = S.time; } else if (S.time - S._tgT > 2.5) { tg._sk = S.time + 3; S._tg = null; } } let tz = tg && tg.z != null ? tg.z : P.z;" +
  " if (!live.length) { const pk = S.pk.find(p => Math.abs(p.x - P.x) < 220 && p.z != null); if (pk) tz = pk.z; }" +
  " if (__DZ__) { const th = live.find(e => e.z != null && Math.abs(e.z - P.z) < .22 && Math.abs(e.x - P.x) < 420 && (e.tele > 0 || e.wind > 0 || /wind|charge|lunge|crouch/.test(e.state || '')))," +
  " bl = S.eb.find(b => { const t = (P.x - b.x) / (b.vx || 1e-6); return b.z != null && Math.abs(b.z - P.z) < .22 && t > 0 && t < .5; }), src = th || bl;" +
  " if (src) { S._dzT = S.time + .35; S._dzTo = src.z > .5 ? Math.max(0, src.z - .4) : Math.min(1, src.z + .4); } }" +
  " if (I.jumpP && P.onGround && P.y > 464) { const th = live.some(e => e.z != null && Math.abs(e.z - P.z) <= .15 && Math.abs(e.x - P.x) < 330 && /crouch|lunge|charge|wind|sb_poundW/.test(e.state || '')) || S.eb.some(b => b.z != null && Math.abs(b.z - P.z) <= .15); if (!th || S.time - (S._jt || -9) < 1.6) I.jumpP = I.jump = 0; else S._jt = S.time; }" +
  " if (S._dzT > S.time) tz = S._dzTo; if (tz > P.z + .04) I.d = 1; else if (tz < P.z - .04) I.u = 1; } };";
// W184 melee bot (?combo=1): nearest-first that closes in, drops the gun and chains the knife; once a string has started it keeps swinging (a player mashing KNIFE)
const MELEE = "{ const cand = live.filter(e => !e.boss && !e.fly && !e.hid && Math.abs(e.x - P.x) < 460), pair = cand.filter(e => cand.some(o => o !== e && Math.sign(o.x - P.x) === Math.sign(e.x - P.x) && Math.abs(o.x - P.x) > Math.abs(e.x - P.x) && Math.abs(o.x - e.x) < 220 && (e.z == null || Math.abs(o.z - e.z) <= .15))), mt = (pair.length ? pair : cand).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] || null; if (mt && Math.abs(mt.x - P.x) < 460) { const dx = mt.x - P.x; I.fire = 0; I.l = I.r = 0; P.facing = dx > 0 ? 1 : -1; const rd = window.FOOT && FOOT.reachD ? FOOT.reachD(mt) : 58; if (Math.abs(dx) > rd - 6) I[dx > 0 ? 'r' : 'l'] = 1;" +
  " const cb = S.cmb || {}, mid = cb.n > 0 && cb.n < 3 && S.time - (cb.t0 + .2) < .3; if (P.melCd <= 0 && (mid || Math.abs(dx) < rd + 2 && (mt.z == null || Math.abs(mt.z - P.z) < .12))) I.meleeP = 1; } }\n";
// W192 parry bot (?guard2): the dodge bot's answers to the boss and the hound, but no stepping out of line: it waits for each attack and raises the guard ~0.1 s before it lands
// (a parry), faces the threat, then shoots the OPEN foe. PJ=0.3: a human-like bot that raises it up to 0.3 s too early (a block, not a parry)
const PARRYB = "{ const PJ = " + (+process.env.PJ || 0) + "; const g = S.gd || {}; let src = null; for (const e of live) { if (e.boss || (e.z != null && Math.abs(e.z - P.z) > .15)) continue; const dx = e.x - P.x, atk = /lunge|charge|swing|slam|bash|stomp|pounce/.test(e.state || ''), ttc = (Math.abs(dx) - 34) / Math.max(120, Math.abs(e.vx || 0)), lead = .12 + PJ * (e._pj == null ? (e._pj = Math.random()) : e._pj);" +
  " if (Math.abs(dx) < 260 && ((atk && ttc < lead) || ((e.tele > 0 && e.tele < .08) || (e.wind > 0 && e.wind < .08)) && Math.abs(dx) < 110)) { src = e; break; } }" +
  " if (!src) for (const b of S.eb) { if (b.z != null && Math.abs(b.z - P.z) > .15) continue; const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .1 && Math.abs(b.y - (P.y - 34)) < 50) { src = b; break; } }" +
  " if (src) { P.facing = src.x > P.x ? 1 : -1; if (!g.on) I.guardP = 1; I.guard = 1; I.l = I.r = 0; I.d = 0; } else I.guard = 0;" +
  " const op = live.find(e => e._opn > S.time); if (op && !src) { P.facing = op.x > P.x ? 1 : -1; I.fire = 1; } }\n";
// W197 dash bot (?dodgei=1): gunner-first that DASHES through each attack at the last moment (a rusher's lunge or a heavy's charge about to land, a bullet 0.08 s away) and still ducks level shots
const DASHC = "{ if (P.dashCd <= 0 && !(P.dash > 0)) { const w = live.find(e => !e.boss && Math.abs(e.x - P.x) < 120 && (e.z == null || Math.abs(e.z - P.z) <= .15) && ((e.id === 'rusher' && e.state === 'lunge' && Math.abs(e.x - P.x) < 110 && Math.sign(P.x - e.x) === e.facing) || (e.heavy && e.state === 'charge' && Math.abs(e.x - P.x) < 80 && Math.sign(P.x - e.x) === e.facing))), bl = S.eb.find(b => { const t = (P.x - b.x) / (b.vx || 1e-6); return t > 0 && t < .08 && (b.z == null || Math.abs(b.z - P.z) <= .15) && Math.abs(b.y - (P.y - 30)) < 40; }), src = w || bl; if (src) { S._dgD = src.x > P.x ? 1 : -1; S._dgU = S.time + .25; I.dashP = 1; } } if (S._dgU > S.time) { P.facing = S._dgD; I.l = S._dgD < 0 ? 1 : 0; I.r = S._dgD > 0 ? 1 : 0; } }\n";
const CODE = { nearest: RUN.replace(BEND, BELT.replace('__DZ__', 'false')), gfirst: RUNG.replace(BEND, BELT.replace('__DZ__', 'false')), dodge: RUND.replace(BEND, BELT.replace('__DZ__', 'true')), melee: RUN.replace(DUCK, MELEE + DUCK).replace(BEND, BELT.replace('__DZ__', 'false')), parry: RUND.replace(DUCK, PARRYB + DUCK).replace(BEND, BELT.replace('__DZ__', 'false')), dash: RUNG.replace(DUCK, DASHC + DUCK).replace(BEND, BELT.replace('__DZ__', 'false')) };

// W187: the getter below also fires a full OVERDRIVE for the bot when 3 foes are near
// ---- in the page: telemetry wrapped round FOOT.ctl (called once per update step, before the step), then the bot / idle run
const TEL = () => {
  const T = window.__T = { steps: 0, nan: 0, nanEx: '', still: 0, stuckAt: -1, sig: '', sigT: 0, thr: [], thrT: -1, duck: 0, hits: [], hurtAt: [], ttk: {}, lingerMax: 0, linger: 0, left: 0, seen: new Map(), prevX: null, bl: new Map(), mel: [], lastHurts: 0, hpMin: 99, hpPrev: null, hpLost: 0, tEnd: 0, cw: { n: 0, still: 0 }, zb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], zs: [] };
  const W = { rusher: 1, gunner: 2, heavy: 4, guard: 2 }, num = v => typeof v === 'number' && isFinite(v), FE = window.FOOT_ENEMIES;
  for (const id of ['rusher', 'gunner', 'heavy', 'guard', 'sninja', 'shound', 'sflamer']) { const d = FE[id]; if (!d || d.__tk) continue; d.__tk = 1; const od = d.onDeath; d.onDeath = function (e) { const S = FOOT.S, T = window.__T; if (T && !e._tk) { e._tk = 1; const t0 = e.seenAt2 != null ? e.seenAt2 : e.born; if (S.P.w === 'pistol' && num(t0)) (T.ttk[id] = T.ttk[id] || []).push(+(S.time - t0).toFixed(2)); } return od ? od.apply(this, arguments) : undefined; }; }
  let inner = null;
  const obs = (S) => {
    if (window.__dbgObs) window.__dbgObs(S);
    const P = S.P, T = window.__T, t = S.time, vw = (FOOT._in.L() || {}).vw || 960; T.steps++;
    if (!num(P.x) || !num(P.y) || !num(P.hp) || S.E.some(e => !num(e.x) || !num(e.y) || (e.hp !== undefined && !num(e.hp))) || S.eb.some(b => !num(b.x) || !num(b.y))) { T.nan++; if (!T.nanEx) T.nanEx = `t=${t.toFixed(1)} P(${P.x},${P.y},${P.hp})`; }
    if (T.prevX != null && Math.abs(P.x - T.prevX) < .01 && P.hp > 0) T.still += 1 / 60; T.prevX = P.x;
    const snap = () => 'on' + S.bossOn + ' t' + (S.time|0) + ' lock' + (S.lock && S.lock.id) + ' E' + S.E.map(e => e.id + ':' + e.state + ':dx' + Math.round(e.x - P.x) + ':z' + (e.z||0).toFixed(2) + ':hp' + e.hp.toFixed(1) + ':sk' + (e._sk > S.time ? 1 : 0)).join(' ') + ' P z' + (+P.z).toFixed(2) + ' y' + Math.round(P.y) + ' vy' + Math.round(P.vy) + (P.onGround ? 'G' : 'A') + ' x' + Math.round(P.x) + ' hp' + P.hp + ' hs' + (S.hitstop|0) + ' pz' + !!S.paused + ' w' + P.w + ' aim' + P.aim.toFixed(2) + ' fc' + P.facing + ' pb' + S.pb.length + ' ' + JSON.stringify(S.pb.slice(-1).map(b => [Math.round(b.x - P.x), Math.round(b.y), +(b.z||0).toFixed(2), Math.round(b.vx), Math.round(b.vy)])) + ' pr' + JSON.stringify(S.pr.filter(q => Math.abs(q.x - P.x) < 400).map(q => [q.k, Math.round(q.x - P.x), q.hp, +(q.z||0).toFixed(2), q.cover ? 1 : 0]));
        if (T.stuckAt >= 0 && !T.tr && t > T.stuckAt + 1 && t < T.stuckAt + 5 && T.steps % 12 === 0) { (T.trb = T.trb || []).push('t' + t.toFixed(1) + ' shots' + S.shots + ' k' + S.kills + ' hurts' + S.hurts + ' ' + snap().replace(/ lock\w* /, ' ').slice(0, 700)); if (T.trb.length >= 14) T.tr = T.trb; }
    const sig = [Math.round(P.maxX / 5), S.kills, S.score, S.hurts, S.boss ? Math.round(S.boss.hp) : 0].join('|'); if (sig !== T.sig) { T.sig = sig; T.sigT = t; } else if (t - T.sigT > 25 && T.stuckAt < 0 && !S.end && P.hp > 0 && !window.__idle) { T.stuckAt = +t.toFixed(1); T.stuckBoss = snap(); }
    if (T.stuckAt >= 0 && !T.s2 && t > T.stuckAt + 4) { T.s2 = 1; T.stuckBoss += ' || ' + snap(); }
    T.hpMin = Math.min(T.hpMin, P.hp); if (T.hpPrev != null && P.hp < T.hpPrev) T.hpLost += T.hpPrev - P.hp; T.hpPrev = P.hp;
    for (const e of S.E) if (e._o === undefined && !e.dead) e._o = e.x < S.camX ? 'L' : 'R';   // W161: which side a foe was born on
    if (S.hurts > T.lastHurts) { const src = (S.hlog || [])[S.hurts - 1] || '', m = /^(mel|touch):(.*)$/.exec(src);
      if (m) { let b = null; for (const e of S.E) if (e.id === m[2] && (!b || Math.abs(e.x - P.x) < Math.abs(b.x - P.x))) b = e; if (b && !b.boss) T.mel.push([b.seenT == null ? -1 : +(t - b.seenT).toFixed(2), b._o || '?', m[2]]); } }
    { const w = S.E.filter(e => !e.dead && !e.boss && (e.wind > 0 || e.tele > 0 || ({ rusher: "crouch lunge", heavy: "wind charge", bigheavy: "wind charge", gunner: "pop charge" }[e.id] || "").split(" ").includes(e.state))).length; if (w > (T.aa | 0)) T.aa = w; if (w >= 3 && !T.aaI) T.aaI = S.E.filter(e => !e.dead && (e.wind > 0 || e.tele > 0 || ({ rusher: "crouch lunge", heavy: "wind charge", bigheavy: "wind charge", gunner: "pop charge" }[e.id] || "").split(" ").includes(e.state))).map(e => e.id + ":" + (e.state || "") + ":w" + (+e.wind || 0).toFixed(2) + ":t" + (+e.tele || 0).toFixed(2) + ":d" + Math.round(e.x - S.P.x)).join(" "); }   // W243 E2: foes in an attack at once (same states as streetcircle.js' slots)
    if (S.hurts > T.lastHurts) { T.hurtAt.push([+t.toFixed(2), (S.hlog || [])[S.hurts - 1] || '?']); T.lastHurts = S.hurts; }
    // threat: weight of the live foes on the street, sampled each second; lingering foes (alive > 25 s after seen) and foes left behind
    let w = 0; for (const e of S.E) { if (e.dead) continue; const inView = e.x > S.camX - 5 && e.x < S.camX + vw + 5; if (inView && e.id !== 'bigheavy') w += W[e.id] || 1;   // the boss is its own phase, not part of the wave curve
      if (e.seen && !e.boss && e.id !== 'bigheavy') { const r = T.seen.get(e) || (T.seen.set(e, t), t); if (t - r > 8 && Math.abs(e.x - S.P.x) > 320 && !e.fly && Math.floor(t) !== e._ft) { e._ft = Math.floor(t); T.far = (T.far || 0) + 1; } if (t - r > 25) { T.lingerMax = Math.max(T.lingerMax, t - r); if (!e._lg) { e._lg = 1; T.linger++; (T.lingerInfo || (T.lingerInfo = [])).push(e.id + ' ' + e.state + ' dx' + Math.round(e.x - S.P.x) + ' z' + (e.z == null ? '-' : e.z.toFixed(2)) + ' seen' + (t - r | 0)); } } }
      if (!e.fly && e.x < S.camX - 250 && !e._lf) { e._lf = 1; T.left++; } }
    if (Math.floor(t) !== T.thrT) { T.thrT = Math.floor(t); T.thr.push(w);
      if (P.z != null) { const a = S.E.filter(e => !e.dead && !e.boss && e.z != null && Math.abs(e.x - P.x) < 500).map(e => e.z); if (a.length >= 2) T.zs.push(Math.max(...a) - Math.min(...a)); } }   // W173 D3: depth spread of the foes near Kai
    if (P.z != null) { T.zb[Math.min(9, Math.floor(P.z * 10))]++; for (const e of S.E) if (!e.dead && e.z != null && e.x > S.camX && e.x < S.camX + vw) T.zb[Math.min(9, Math.floor(e.z * 10))]++; }   // W173 D1: depth use
    for (const e of S.E) { if (e.dead || e.boss || !e.seen || e.z == null) { e._qx = undefined; continue; } if (e._qx !== undefined && Math.abs(e.x - P.x) < 250 && !(e.tele > 0 || ['crouch', 'lunge', 'wind', 'charge', 'pop'].includes(e.state))) { T.cw.n++; if (Math.abs(e.x - e._qx) < .001 && Math.abs(e.z - e._qz) < .00005) T.cw.still++; } e._qx = e.x; e._qz = e.z; }   // W196: non-attacking foes within 250 of Kai: share of their time spent standing still
    // level shots passing Kai while he ducks (crouch) and does not get hit = ducked shots
    for (const b of S.eb) { const side = Math.sign(b.x - P.x), pr = T.bl.get(b); if (pr && pr.side !== side && P.crouch && Math.abs(b.y - (P.y - 40)) < 60 && S.hurts === pr.h) T.duck++; T.bl.set(b, { side, h: S.hurts }); }
    if (T.bl.size > 400) T.bl.clear();
  };
  const F = FOOT; delete F.ctl;
  Object.defineProperty(F, 'ctl', { configurable: true, get() { return inner ? (S, I) => { inner(S, I); const O = F.OD; if (O && RET.overdrive && O.v >= O.max && !I.bombP) { const P = S.P, n = S.E.filter(e => !e.dead && Math.abs(e.x - P.x) < O.r).length; if (n >= 3) I.bombP = 1; } if (F.odCtl) F.odCtl(S, I); obs(S); } : null; }, set(f) { inner = f; } });
  return () => { delete F.ctl; F.ctl = null; };
};
// run one bot+seed stepped (fast); returns the bot's own result plus the telemetry
const ONE = (bot, seed, codeFn) => `(() => { const un = (${TEL.toString()})(); window.__idle = ${bot === 'idle'}; window.__TR0 = ${+process.env.TR0 || 0}; const w0 = performance.now(); let r;
  if (${bot === 'idle'}) { let s = ${seed}; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; FOOT.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; };
    RET.tale = false; FOOT.start('zeil'); let S = FOOT.S; for (let j = 0; j < 200 && S && !S.end; j++) S = FOOT.sim(1, 1 / 60); S = FOOT.S; r = { clear: !!(S.end && S.end.cleared), time: +S.time.toFixed(1), hp: S.P.hp, hurts: S.hurts, kills: S.kills }; }
  else { window.__gf = ${bot !== 'nearest'}; r = (${codeFn})(${seed}); }
  const ms = performance.now() - w0, S = FOOT.S, T = window.__T, sh = S.sh || {}, s3 = S.s3 || {};
  const tu = {}; r.zmiss = S.zmiss | 0; r.cmb = S.cmb || null; r.dg = S.dg || null; r.gd = S.gd ? { b: S.gd.blocks, p: S.gd.parries, rf: S.gd.refl, br: S.gd.breaks, mx: +S.gd.maxOn.toFixed(2) } : null; r.rch = S.rch ? { log: S.rch.log } : null; r.mh = (S.hlog || []).filter(x => /^mel:(rusher|heavy|bigheavy)$/.test(x)).length; r.band = (() => { try { if (!RET.belt) return 0; const L = FOOT._in.L(); FOOT.look.draw(L.ctx); return +(FOOT.look.band / FOOT.look.VV).toFixed(3); } catch (e) { return -1; } })(); r.end = !!S.end; r.ms = ms; r.dbg = window.__dbgLog; r.tEnd = +S.time.toFixed(1);
  r.tel = { aa: T.aa | 0, aaI: T.aaI, cw: T.cw, tr: T.tr, stuckBoss: T.stuckBoss, mel: T.mel, steps: T.steps, nan: T.nan, nanEx: T.nanEx, zb: T.zb, zs: T.zs, still: +T.still.toFixed(1), stuckAt: T.stuckAt, thr: T.thr, duck: T.duck, hurtAt: T.hurtAt, ttk: T.ttk, lingerMax: +T.lingerMax.toFixed(1), linger: T.linger, far: T.far || 0, lingerInfo: T.lingerInfo, left: T.left, hpMin: T.hpMin, hpLost: +T.hpLost.toFixed(1),
    called: sh.called | 0, blocked: sh.blocked | 0, coverBroke: sh.coverBroke | 0, plan: (s3.waves || []).map(x => [x.t, x.thr]), boss: s3.boss, heals: s3.healN | 0, hlog: (S.hlog || []).join(' '), od: FOOT.OD && FOOT.OD.log, combo: window.FOOT.COMBO ? FOOT.COMBO.best : -1, bnc: window.FOOT.COMBO ? FOOT.COMBO.bounces : 0 };
  try { FOOT.stop(); } catch (e) {} un(); return r; })()`;
const SEED = () => { try { localStorage.clear(); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} };
const med = a => a && a.length ? +a.slice().sort((x, y) => x - y)[a.length >> 1].toFixed(2) : null, mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
// threat peak: time of the max of the 10 s moving average of the live weight, as % of the reference stage length
const peakT = thr => { let best = -1, bt = 0; for (let i = 0; i < thr.length; i++) { let s = 0, n = 0; for (let j = Math.max(0, i - 9); j <= i; j++) { s += thr[j]; n++; } const a = s / n; if (a > best + 1e-9) { best = a; bt = i; } } return bt; };

(async () => {
  const t0 = Date.now(), port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch(), errs = [];
  const open = async () => { const ctx = await br.newContext({ viewport: { width: 1440, height: 860 } }); await ctx.addInitScript(SEED); if (process.env.DBG) await ctx.addInitScript(fs.readFileSync(process.env.DBG, 'utf8')); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${process.env.Q || ""}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 }); await sleep(300); return { ctx, p }; };
  const jobs = []; for (const bot of BOTS) for (let i = 0; i < RUNS; i++) jobs.push({ bot, i, seed: seedOf(i) });
  const only = process.env.ONLY && process.env.ONLY.split(':'), list = only ? jobs.filter(j => j.bot === only[0] && j.seed === +only[1]) : jobs, out = [];
  let next = 0; const pages = await Promise.all(Array.from({ length: PAR }, open));
  await Promise.all(pages.map(async ({ p }) => { while (next < list.length) { const j = list[next++]; let r; try { r = await p.evaluate(ONE(j.bot, j.seed, j.bot === 'idle' ? 'null' : CODE[j.bot])); } catch (e) { r = { err: String(e.message).slice(0, 160), ms: 0, tel: { thr: [], hurtAt: [], ttk: {} } }; } out.push({ j, r }); } }));
  const suiteSecs = (Date.now() - t0) / 1000;
  if (only) { for (const o of out) console.log(JSON.stringify(o.r)); }
  // ---- aggregate per bot
  const ok0 = out.filter(o => !o.r.err), simSecs = ok0.reduce((a, o) => a + (o.r.tEnd || 0), 0), simMs = ok0.reduce((a, o) => a + o.r.ms, 0);
  const clearT = out.filter(o => o.r.clear).map(o => o.r.tEnd), Lref = clearT.length ? med(clearT) : Math.max(1, ...ok0.map(o => o.r.tEnd));
  if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out.map(o => ({ bot: o.j.bot, seed: o.j.seed, clear: !!o.r.clear, tEnd: o.r.tEnd, dbg: o.r.dbg }))));   // DUMP=<json>: every run's probe record (W169)
  if (process.env.LIST) for (const o of out) if (o.r.tel && o.r.tel.stuckAt >= 0) { console.log('STUCK', o.j.bot, o.j.seed, 'at', o.r.tel.stuckAt, 'end', o.r.tEnd, o.r.tel.stuckBoss.slice(0, 200)); if (process.env.TR && o.r.tel.tr) console.log(o.r.tel.tr.join('\n')); }
  const rows = {};
  for (const bot of BOTS) { const rs = out.filter(o => o.j.bot === bot).map(o => o.r), good = rs.filter(r => !r.err), cl = good.filter(r => r.clear), dead = good.filter(r => !r.clear && r.end), tl = good.map(r => r.tel);
    const hs = {}; for (const r of good) for (const h of (r.tel.hlog || '').split(' ').filter(Boolean)) hs[h] = (hs[h] || 0) + 1;
    const ttk = id => med([].concat(...tl.map(t => (t.ttk || {})[id] || []))), nttk = id => [].concat(...tl.map(t => (t.ttk || {})[id] || [])).length;
    const reach = good.filter(r => r.tEnd >= .9 * Lref), pk = reach.map(r => peakT(r.tel.thr) / Lref * 100), plan = good[0] && good[0].tel.plan.length ? good[0].tel.plan : [];
    const planPk = plan.length ? plan.reduce((a, w) => w[1] > a[1] ? w : a, [0, -1])[0] : 0, thrMax = tl.map(t => Math.max(0, ...t.thr));
    rows[bot] = { n: rs.length, err: rs.length - good.length, clear: cl.length, dead: dead.length, noend: good.filter(r => !r.end).length, clearPct: good.length ? 100 * cl.length / good.length : 0, deathT: med(dead.map(r => r.tEnd)), clearT: med(cl.map(r => r.tEnd)),
      hearts: mean(tl.map(t => t.hpLost || 0)), hits: mean(good.map(r => r.hurts || 0)), hs, ttk: { rusher: ttk('rusher'), gunner: ttk('gunner'), heavy: ttk('heavy'), guard: ttk('guard'), sninja: ttk('sninja'), shound: ttk('shound'), sflamer: ttk('sflamer'), n: [nttk('rusher'), nttk('gunner'), nttk('heavy'), nttk('guard')] }, called: mean(tl.map(t => t.called)), blocked: mean(tl.map(t => t.blocked)), coverBroke: mean(tl.map(t => t.coverBroke)), duck: mean(tl.map(t => t.duck)),
      peakMed: pk.length ? med(pk) : null, peakN: pk.length, planPk, thrMax: med(thrMax), still: mean(tl.map(t => t.still)), nan: tl.reduce((a, t) => a + t.nan, 0), stuck: tl.filter(t => t.stuckAt >= 0).length, linger: tl.reduce((a, t) => a + t.linger, 0), far: tl.reduce((a, t) => a + (t.far || 0), 0), lingerMax: Math.max(0, ...tl.map(t => t.lingerMax)), left: tl.reduce((a, t) => a + t.left, 0),
      ex: good.filter(r => r.tel.nan || r.tel.stuckAt >= 0 || r.tel.linger).slice(0, 99).map(r => r.tel.nanEx || (r.tel.stuckAt >= 0 ? 'stuck at ' + r.tel.stuckAt : 'linger ' + (r.tel.lingerInfo || []).join('; '))), speed: good.length ? good.reduce((a, r) => a + r.tEnd, 0) / Math.max(1e-9, good.reduce((a, r) => a + r.ms, 0) / 1000) : 0 };
  }
  { const all = ok0.filter(o => o.r && o.r.tel).flatMap(o => o.r.tel.mel || []), under = all.filter(m => m[0] < 1.2), beh = all.filter(m => m[1] === 'L');
    rows.__mel = { tot: ok0.reduce((a, o) => a + ((o.r && o.r.hurts) || 0), 0), n: all.length, under: under.length, beh: beh.length, min: all.length ? Math.min(...all.map(m => m[0])) : null };
    console.log(`INFO melee hits ${all.length}: on screen >= 1.2 s before the hit ${all.length - under.length}/${all.length} (min ${rows.__mel.min} s), from foes born behind ${beh.length} (${all.length ? (100 * beh.length / all.length).toFixed(0) : 0}% of melee hits, ${(100 * beh.length / Math.max(1, rows.__mel.tot)).toFixed(0)}% of all ${rows.__mel.tot} hits)`); }
  const rps = ok0.length / (simMs / 1000), factor = simSecs / (simMs / 1000);
  console.log(`INFO ${ok0.length} runs, ${simSecs.toFixed(0)} s of game time stepped in ${(simMs / 1000).toFixed(1)} s page time (${suiteSecs.toFixed(1)} s suite): ${rps.toFixed(2)} runs/s, x${factor.toFixed(0)} real time`);
  for (const bot of BOTS) if (rows[bot].ex.length && process.env.EX) console.log(`INFO ${bot} examples: ${rows[bot].ex.join(' | ')}`);
  for (const bot of BOTS) { const r = rows[bot]; console.log(`INFO ${bot}: clear ${r.clear}/${r.n} (${r.clearPct.toFixed(0)}%) died ${r.dead} at median ${r.deathT} s, hearts lost ${r.hearts.toFixed(1)}/run in ${r.hits.toFixed(1)} hits [${Object.entries(r.hs).map(([k, v]) => k + ' ' + v).join(', ')}], ttk r/g/h/guard ${r.ttk.rusher}/${r.ttk.gunner}/${r.ttk.heavy}/${r.ttk.guard} ninja/hound/flamer ${r.ttk.sninja}/${r.ttk.shound}/${r.ttk.sflamer} (n ${r.ttk.n[3]}) s, calls ${r.called.toFixed(1)} blocks ${r.blocked.toFixed(1)} ducked ${r.duck.toFixed(1)}, peak ${r.peakMed}% (n${r.peakN}), still ${r.still.toFixed(1)} s, nan ${r.nan} stuck ${r.stuck} linger ${r.linger} (far-off foe-seconds ${r.far})`); }

  // ---- determinism + real-time check (once): seed 0 of the idle bot, the real game loop (rAF, wall clock) for 60 s vs the stepped run: same hurts within 1 s
  let rt = null;
  if (RT && !only) {
    const { ctx, p } = await open(), seed = seedOf(0), a = await p.evaluate(ONE('idle', seed, 'null')), b = await p.evaluate(ONE('idle', seed, 'null'));
    const real = await p.evaluate(`(async () => { const un = (${TEL.toString()})(); window.__idle = true; let s = ${seed}; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; FOOT.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; };
      RET.tale = false; FOOT.start('zeil'); const w0 = performance.now(); await new Promise(done => { const tick = () => { const S = FOOT.S; if (!S || S.end || performance.now() - w0 > 60000) done(); else setTimeout(tick, 100); }; tick(); });
      const S = FOOT.S, T = window.__T, r = { hurtAt: T.hurtAt, t: +S.time.toFixed(1), end: !!S.end, hp: S.P.hp, wall: (performance.now() - w0) / 1000 }; try { FOOT.stop(); } catch (e) {} un(); return r; })()`);
    await ctx.close();
    const lim = real.t, A = a.tel.hurtAt.filter(h => h[0] <= lim - 1), B = real.hurtAt.filter(h => h[0] <= lim - 1), same = A.length === B.length && A.every((h, k) => Math.abs(h[0] - B[k][0]) <= 1), rep = JSON.stringify(a.tel.hurtAt) === JSON.stringify(b.tel.hurtAt) && a.tEnd === b.tEnd && a.clear === b.clear;
    rt = { same, rep, stepped: a.tel.hurtAt.map(h => h[0] + 's ' + h[1]).join(', '), real: real.hurtAt.map(h => h[0] + 's ' + h[1]).join(', '), lim, wall: real.wall, endStep: a.tEnd, endReal: real.end ? real.t : null, clear: a.clear };
    console.log(`INFO real-time run (idle, seed ${seed}): ${real.wall.toFixed(0)} s wall for ${real.t} s of game, hurts ${rt.real || 'none'}; stepped: ${rt.stepped || 'none'}; stepped end ${a.tEnd} s`);
  }
  await br.close(); srv.kill();

  // ---- the report
  const best = BOTS.filter(b => b !== 'idle' && !XB.includes(b)).map(b => rows[b]).sort((x, y) => y.clearPct - x.clearPct)[0], bestName = BOTS.find(b => rows[b] === best), idleR = rows.idle;
  const peaks = BOTS.filter(b => b !== 'idle' && !XB.includes(b) && rows[b].peakN).map(b => rows[b].peakMed);
  const fmt = n => n == null ? '-' : n;
  let md = `# STREETSIM: the street stage in fast simulation\n\nGenerated by \`qa/streetsim.js\` on ${new Date().toISOString().replace(/\.\d+Z$/, 'Z')} (UTC). ${ok0.length} runs (${RUNS} per bot, seeds 4321 + i x 7919), ${simSecs.toFixed(0)} s of game time stepped in ${(simMs / 1000).toFixed(1)} s: **${rps.toFixed(2)} runs/s, x${factor.toFixed(0)} real time**. Nothing draws and nothing waits on the wall clock (\`FOOT.sim(1, 1/60)\`). Reproduce one run: \`ONLY=<bot>:<seed> node qa/streetsim.js\`.\n\n`;
  md += `Bots: **idle** = no input. **nearest** = street2-test's human-style bot (shoots the nearest foe, takes cover, hops low shots, 0.2-0.35 s late, misses 1 in 4). **gfirst** = streethard-test's gunner-first bot (walks up to the gunner, ducks level shots). **dodge** = gunner-first that reacts to every telegraph in 0.1 s and always ducks.\n\n`;
  md += `| bot | runs | cleared | died | median death (s) | median clear (s) | hearts lost (hits) / run | rusher / gunner / heavy / guard time to kill (s) | gunner calls / run | cover blocks / run | shots dodged by ducking / run | threat peak % (median) | Kai still (s / run) | NaN | stuck | lingering foes |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const b of BOTS) { const r = rows[b]; md += `| ${b} | ${r.n} | ${r.clear} (${r.clearPct.toFixed(0)}%) | ${r.dead} | ${fmt(r.deathT)} | ${fmt(r.clearT)} | ${r.hearts.toFixed(1)} (${r.hits.toFixed(1)}) | ${fmt(r.ttk.rusher)} / ${fmt(r.ttk.gunner)} / ${fmt(r.ttk.heavy)} / ${fmt(r.ttk.guard)} | ${r.called.toFixed(1)} | ${r.blocked.toFixed(1)} | ${r.duck.toFixed(1)} | ${r.peakMed == null ? '-' : r.peakMed + ' (n' + r.peakN + ')'} | ${r.still.toFixed(1)} | ${r.nan} | ${r.stuck} | ${r.linger} |\n`; }
  md += `\nHearts lost by source (all runs): ${BOTS.map(b => b + ': ' + (Object.entries(rows[b].hs).map(([k, v]) => k + ' ' + v).join(', ') || 'none')).join('; ')}.\n\n`;
  md += `Threat curve: the weight of the live foes on the street each second (rusher 1, gunner 2, heavy 4; the boss is left out, it is a separate phase), smoothed over 10 s; the peak is the second of its maximum as a percentage of ${Lref} s (the median cleared run, or the longest run if none cleared). Only runs that lasted >= 90% of that length count. The planned curve (waves) peaks at ${rows[BOTS.find(b => b !== 'idle' && !XB.includes(b))].planPk} s = ${(100 * rows[BOTS.find(b => b !== 'idle' && !XB.includes(b))].planPk / Lref).toFixed(0)}%. Time to kill = seen to dead with the pistol.\n\n`;
  const lines = [];
  const L = (p, n) => lines.push([p, n]);
  const nanTot = BOTS.reduce((a, b) => a + rows[b].nan + rows[b].stuck + rows[b].err, 0);
  L(nanTot === 0 && errs.length === 0, `no NaN / stuck / harness error / page error (NaN ${BOTS.reduce((a, b) => a + rows[b].nan, 0)}, stuck ${BOTS.reduce((a, b) => a + rows[b].stuck, 0)}, errors ${BOTS.reduce((a, b) => a + rows[b].err, 0)}, page errors ${errs.length}${errs[0] ? ' ' + errs[0].slice(0, 80) : ''})`);
  if (idleR) L(idleR.clear === 0 && idleR.dead === idleR.n, `idle bot dies (died ${idleR.dead}/${idleR.n}, median ${fmt(idleR.deathT)} s, cleared ${idleR.clear})`);
  if (best) L(best.clearPct >= 60 && best.clearPct <= 80, `best bot (${bestName}) clears 60-80% (${best.clearPct.toFixed(0)}%; ${BOTS.filter(b => b !== 'idle' && !XB.includes(b)).map(b => b + ' ' + rows[b].clearPct.toFixed(0) + '%').join(', ')})`);
  if (rows.nearest) L(rows.nearest.clearPct >= 25 && rows.nearest.clearPct <= 40, `nearest-first (a casual player) clears 25-40% (${rows.nearest.clearPct.toFixed(0)}%)`);
  L(peaks.length && peaks.every(x => x >= 82 && x <= 88), `threat peak 82-88% as the median over runs (${BOTS.filter(b => b !== 'idle' && !XB.includes(b)).map(b => b + ' ' + fmt(rows[b].peakMed) + '%').join(', ')})`);
  if (/shieldfoe=1/.test(process.env.Q || '')) { const src = new Set(); for (const b of BOTS) for (const k of Object.keys(rows[b].hs)) { const m = /^(?:mel|bul|touch):(.*)$/.exec(k); if (m) src.add(m[1]); }
    L(src.size >= 4, `W171 >= 4 foe types in hearts by source (${[...src].join(', ')})`);
    const gN = rows.nearest && rows.nearest.ttk.guard, gC = rows.dodge && rows.dodge.ttk.guard, gG = rows.gfirst && rows.gfirst.ttk.guard;
    L(gN != null && gC != null && Math.abs(gN - gC) >= .3 * Math.max(gN, gC), `W171 guard time to kill differs >= 30% with its counter (dodge gets behind it ${gC} s, gfirst ${gG} s; nearest shoots its front ${gN} s)`); }
  if (/morefoes=1/.test(process.env.Q || '')) { const src = new Set(); for (const b of BOTS) for (const k of Object.keys(rows[b].hs)) { const m = /^(?:mel|bul|touch):(.*)$/.exec(k); if (m && m[1] !== 'bigheavy') src.add(m[1]); }   // W185
    L(src.size >= 6, `W185 >= 6 live foe types in hearts by source (${[...src].join(', ')})`);
    for (const id of ['sninja', 'shound', 'sflamer']) { const c = rows.dodge && rows.dodge.ttk[id], g = rows.gfirst && rows.gfirst.ttk[id];
      L(c != null && g != null && Math.abs(c - g) >= .3 * Math.max(c, g), `W185 ${id} time to kill differs >= 30% between its counter (dodge ${c} s) and gfirst (${g} s; nearest ${rows.nearest && rows.nearest.ttk[id]} s)`); } }
  if (rows.nearest && rows.gfirst) L(rows.gfirst.clearPct - rows.nearest.clearPct >= 15, `kill order matters: gunner-first clears >= 15 points more than nearest-first (${rows.gfirst.clearPct.toFixed(0)}% vs ${rows.nearest.clearPct.toFixed(0)}%)`);
  if (/overdrive=1/.test(process.env.Q || '')) { const od = b => ok0.filter(o => o.j.bot === b && o.r.tel.od).map(o => o.r.tel.od), fl = [].concat(...od('dodge').map(x => x.fills)), us = [].concat(...od('dodge').map(x => x.hits)), uses3 = us.filter(n => n >= 3).length;   // W187
    console.log(`INFO overdrive dodge: ${fl.length} fills, median ${med(fl)} s apart; ${us.length} specials, hits per use median ${med(us)}, >= 3 foes in ${us.length ? (100 * uses3 / us.length).toFixed(0) : 0}%; resets by a hurt ${od('dodge').reduce((a, x) => a + x.resets, 0)}; casual specials ${[].concat(...od('nearest').map(x => x.hits)).length}`);
    L(fl.length > 0 && med(fl) >= 25 && med(fl) <= 40, `W187 the dodge bot fills OVERDRIVE every 25-40 s (median ${fl.length ? med(fl) : '-'} s over ${fl.length} fills)`);
    L(us.length > 0 && uses3 / us.length >= .5, `W187 specials hit >= 3 foes in >= 50% of uses (${uses3}/${us.length})`); }
  if (/combocount=1/.test(process.env.Q || '')) for (const bot of BOTS) { if (bot === 'idle') continue; const cb = ok0.filter(o => o.j.bot === bot).map(o => o.r.tel.combo); L(bot !== 'dodge' || med(cb) >= 12, `W188 median best hit streak per run, ${bot}: ${med(cb)} (gate >= 12 for dodge; max ${Math.max(...cb)}, bounces/run ${med(ok0.filter(o => o.j.bot === bot).map(o => o.r.tel.bnc))})`); }
  if (GATE) {   // W243 fairness: a recovery window after every hit (street bar F4/E1/E2 in the footer of the cue), per bot, from the hurt log of every run
    const hk = b => ok0.filter(o => o.j.bot === b && o.r.tel);
    const rate = o => (o.r.tel.hurtAt.length / Math.max(1, o.r.tEnd)) * 10, gaps = [].concat(...ok0.filter(o => o.r.tel).map(o => o.r.tel.hurtAt.map((h, i, a) => i ? h[0] - a[i - 1][0] : 99)));
    const mg = Math.min(...gaps); L(mg >= 1.49, `W243 at most 1 heart per 1.5 s from all sources (min gap between hurts ${mg.toFixed(2)} s over ${gaps.length} hurts)`);
    { const mx = Math.max(0, ...ok0.filter(o => o.r.tel).map(o => o.r.tel.aa)); const n3 = ok0.filter(o => o.r.tel && o.r.tel.aa > 2).length; L(n3 === 0, `W243 E2 at most 2 foes in an active melee attack at once (max ${mx}, ${n3} runs over)`); if (n3) console.log("INFO E2 examples: " + ok0.filter(o => o.r.tel && o.r.tel.aa > 2).slice(0, 8).map(o => o.r.tel.aaI).join(" | ")); }
    for (const b of ['nearest']) if (BOTS.includes(b)) { const rs = hk(b), r10 = med(rs.map(rate)), ts = med(rs.map(o => o.r.tEnd)); L(r10 <= 1 && ts >= 60, `W243 ${b} bot loses <= 1 heart per 10 s (median ${r10.toFixed(2)}) and survives >= 60 s (median ${ts.toFixed(0)} s)`); }
    if (BOTS.includes('gfirst')) L(Math.abs(rows.gfirst.clearPct - 75) <= 8, `W243 gfirst clear rate 75 +-8 (${rows.gfirst.clearPct.toFixed(0)}%)`);
    if (BOTS.includes('dodge')) L(Math.abs(rows.dodge.clearPct - 65) <= 8, `W243 dodge clear rate 65 +-8 (${rows.dodge.clearPct.toFixed(0)}%)`);
  }
  if (rows.dodge) { if (/belt=0/.test(process.env.Q || '')) L(rows.dodge.duck >= 3, `ducking prevents >= 3 hits per run for the dodge bot (${rows.dodge.duck.toFixed(1)})`); L(rows.dodge.blocked >= 3, `cover prevents >= 3 hits per run for the dodge bot (${rows.dodge.blocked.toFixed(1)})`); }
  L(rows.__mel.under === 0, `every melee hit comes from a foe on screen >= 1.2 s before it (${rows.__mel.n} hits, ${rows.__mel.under} under 1.2 s, min ${rows.__mel.min} s)`);
  L(rows.__mel.beh / Math.max(1, rows.__mel.tot) < .2, `< 20% of hearts lost to foes that entered from behind (${rows.__mel.beh} of ${rows.__mel.tot} hits)`);
  if (!/belt=0/.test(process.env.Q || '')) { const G = ok0.filter(o => o.j.bot !== 'idle' && !XB.includes(o.j.bot)), zb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; for (const o of G) o.r.tel.zb.forEach((v, i) => zb[i] += v); const zt = zb.reduce((a, b) => a + b, 0), used = zb.filter(v => v >= .02 * zt).length;
    const band = med(ok0.map(o => o.r.band)), dg = ok0.filter(o => o.j.bot === 'dodge'), zm = dg.reduce((a, o) => a + o.r.zmiss, 0), zh = dg.reduce((a, o) => a + (o.r.hurts || 0), 0), sp = med(G.flatMap(o => o.r.tel.zs));
    L(band >= .25 && used >= 6, `W173 D1 floor band >= 25% of the view (${(100 * band).toFixed(0)}%) and actors use >= 60% of it (${used * 10}% of depth slices hold >= 2% of actor time)`);
    L(zh + zm > 0 && zm / (zm + zh) >= .3, `W173 D2 the dodge bot avoids >= 30% of attacks by depth (${zm} out-of-depth misses vs ${zh} hits = ${(100 * zm / Math.max(1, zm + zh)).toFixed(0)}%)`);
    L(sp != null && sp >= .3, `W173 D3 median depth spread of foes near Kai >= 30% of the band (${sp == null ? '-' : (100 * sp).toFixed(0) + '%'})`); }
  if (BOTS.includes('parry')) { const gd = ok0.filter(o => o.j.bot === 'parry').map(o => o.r.gd || { b: 0, p: 0, rf: 0, br: 0, mx: 0 }), ps = gd.map(x => x.p), mx = Math.max(0, ...ok0.filter(o => o.r.gd).map(o => o.r.gd.mx));   // W192
    console.log(`INFO parry bot: parries/run median ${med(ps)} mean ${mean(ps).toFixed(1)}, blocks/run ${mean(gd.map(x => x.b)).toFixed(1)}, reflected slugs/run ${mean(gd.map(x => x.rf)).toFixed(1)}, guard breaks/run ${mean(gd.map(x => x.br)).toFixed(1)}, longest guard ${mx} s`);
    if (rows.dodge) L(rows.parry.hearts <= .7 * rows.dodge.hearts, `W192 the parry bot loses >= 30% fewer hearts than the dodge bot (${rows.parry.hearts.toFixed(2)} vs ${rows.dodge.hearts.toFixed(2)} per run)`);
    L(mean(ps) >= 5, `W192 >= 5 parries per run for the parry bot (mean ${mean(ps).toFixed(1)})`);
    L(mx <= .6 + 1e-6, `W192 the guard never covers Kai for > 0.6 s in a row (longest ${mx} s)`); }
  { const cw = ok0.filter(o => o.j.bot !== 'idle').reduce((a, o) => ({ n: a.n + o.r.tel.cw.n, s: a.s + o.r.tel.cw.still }), { n: 0, s: 0 }); console.log(`INFO W196 non-attacking foes within 250 of Kai: ${cw.n} foe-steps, standing still ${(100 * cw.s / Math.max(1, cw.n)).toFixed(1)}%`);   L(cw.n > 0 && cw.s / cw.n < .2, `W196 non-attacking foes within 250 units stand still < 20% of their time (${(100 * cw.s / Math.max(1, cw.n)).toFixed(1)}%)`); }
  if (BOTS.includes('melee')) { const cs = ok0.filter(o => o.j.bot === 'melee' && o.r.cmb).map(o => o.r.cmb), sum = k => cs.reduce((a, c) => a + (c[k] | 0), 0), st = sum('strings'), c3 = sum('c3'), fin = sum('fin'), f2 = sum('fin2');
    L(st >= 50 && c3 / st >= .6, `W184 knife chains of 3 in >= 60% of the melee bot's strings (${c3} of ${st} strings = ${(100 * c3 / Math.max(1, st)).toFixed(0)}%)`);
    L(fin >= 20 && f2 / fin >= .25, `W184 >= 25% of finishers hit a second foe (${f2} of ${fin} = ${(100 * f2 / Math.max(1, fin)).toFixed(0)}%)`);
    console.log(`INFO melee bot: clear ${rows.melee.clear}/${rows.melee.n}, hearts lost ${rows.melee.hearts.toFixed(1)}/run`); }
  if (BOTS.includes('dash') && BOTS.includes('gfirst')) { const ds = ok0.filter(o => o.j.bot === 'dash' && o.r.dg).map(o => o.r.dg), sum = k => ds.reduce((a, c) => a + (c[k] | 0), 0), hd = rows.dash.hearts, hg = rows.gfirst.hearts;   // W197
    L(ds.length > 0 && hd <= .75 * hg, `W197 the dash bot loses >= 25% fewer hearts than gfirst (${hd.toFixed(1)} vs ${hg.toFixed(1)} per run = ${(100 * (1 - hd / Math.max(.01, hg))).toFixed(0)}% fewer)`);
    L(ds.length > 0 && sum('ifOut') === 0, `W197 0 i-frame steps outside the dash (${sum('ifOut')} over ${sum('dashes')} dashes)`);
    L(ds.length > 0 && sum('stack') === 0, `W197 the close-call slow-down never stacks (${sum('stack')} over-long slows, ${sum('cc')} close calls, ${sum('crit')} crits)`);
    L(sum('cc') >= 20, `W197 close calls happen (${sum('cc')} in ${ds.length} runs)`);
    console.log(`INFO dash bot: clear ${rows.dash.clear}/${rows.dash.n}, hearts lost ${hd.toFixed(1)}/run, gfirst ${hg.toFixed(1)}/run`); }
  if (!/reach=0/.test(process.env.Q || '')) {   // W191: every landed melee hit, measured against the sheets (qa/reach-sheets.py reads the webp strips, not the table in streetreach.js)
    const sh = JSON.parse(cp.execFileSync('python3', [path.join(__dirname, 'reach-sheets.py')]).toString()), ACT = ['melee', 'combo2', 'combo3'], byFr = [0, 0, 0, 0];
    let n = 0, bad = 0, gapMax = -99, inact = 0, foeLog = 0, foeHurt = 0;
    for (const o of ok0) { const r = o.r; foeHurt += r.mh | 0; if (!r.rch) continue;
      for (const h of r.rch.log) { n++; const key = h.k === 'kai' ? 'kai/' + ACT[h.act] : (h.who === 'rusher' ? 'knife/melee' : 'bruiser/melee'), t = sh[key], tipPx = t[h.fr];
        if (!(tipPx >= .8 * Math.max(...t)) && !(h.k === 'foe' && h.who !== 'rusher' && h.fr >= 1)) inact++;   // the heavy's charge counts as active from frame 1 (the held last frame)
        const ts = h.tsh ? sh[h.tsh + '/idle'][0] : null, th = Math.min(h.tw / 2, ts == null ? h.tw / 2 : ts * h.thh / 256), gap = h.f * ((h.tx - h.f * th) - (h.ax + h.f * tipPx * h.ah / 256));
        byFr[h.fr]++; if (gap > 8) bad++; gapMax = Math.max(gapMax, gap); if (h.k === 'foe') foeLog++; } }
    L(n > 0 && bad === 0, `W191 every landed melee hit: gap between the attacker's reach edge (read from the sheets) and the target's body edge <= 8 units (${n} hits, ${bad} over 8, largest gap ${gapMax.toFixed(1)}; hits per strike frame ${byFr.join('/')})`);
    L(n > 0 && inact === 0, `W191 hits land only on active strike frames (${inact} of ${n} on an inactive frame)`);
    L(foeLog === foeHurt, `W191 every foe melee hurt went through the reach check (${foeLog} logged of ${foeHurt} hurts)`); }
  L(suiteSecs < 180, `whole suite < 3 min (${suiteSecs.toFixed(0)} s)`);
  L(factor >= 100, `speed >= x100 real time (x${factor.toFixed(0)}, ${rps.toFixed(2)} runs/s; slowest single run x${Math.min(...ok0.map(o => (o.r.tEnd || 0) / (o.r.ms / 1000))).toFixed(0)})`);
  if (rt) { L(rt.rep, `determinism: the same seed twice gives the same hurts and end time`); L(rt.same, `one seed equals a real-time run (idle, seed ${seedOf(0)}: stepped hurts [${rt.stepped}] vs real-time [${rt.real}] over the first ${rt.lim} s, tolerance 1 s)`); }
  md += `## Gates\n\n` + lines.map(([p, n]) => `- ${p ? 'PASS' : 'FAIL'} ${n}`).join('\n') + '\n';
  fs.writeFileSync(OUT, md);
  if (process.env.JSONOUT) fs.writeFileSync(process.env.JSONOUT, JSON.stringify(out.map(o => ({ bot: o.j.bot, seed: o.j.seed, clear: o.r.clear, tEnd: o.r.tEnd, dbg: o.r.dbg }))));   // every run, for qa/bossprobe.js
  for (const [p, n] of lines) console.log((p ? 'PASS ' : 'FAIL ') + n);
  console.log(`INFO wrote ${OUT}`);
  const speedFail = lines.filter(([p, n]) => !p && /speed|determinism|real-time|suite/.test(n)).length;
  process.exit(GATE && speedFail ? 1 : 0);
})().catch(e => { console.log('FAIL streetsim crashed: ' + e.stack); process.exit(2); });
