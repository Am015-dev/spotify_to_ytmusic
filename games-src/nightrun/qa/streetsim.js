#!/usr/bin/env node
// STREETSIM: the street stage (zeil) in fast stepped simulation, no drawing, no rAF, no wall clock (FOOT.sim(1, 1/60) loops), >= 100x real time.
// Bots: idle (no input), nearest (street2-test's human-style bot, shoots the nearest foe), gfirst (streethard-test's gunner-first bot with ducking), dodge (gunner-first, reacts to every telegraph
// in 0.1 s and always ducks level shots). Seeds are fixed (4321 + i * 7919), so a run is reproducible: ONLY=bot:seed prints that one run's record.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetsim.js     env: RUNS=50 (per bot)  PAR=1 (pages)  BOTS=idle,nearest,gfirst,dodge  OUT=<md>  RT=0 (skip the real-time check)  GATE=0 (numbers only)
// Gates (PASS/FAIL): no NaN/stuck  idle bot dies  best bot clears 50-80%  threat peak 80-90% (median over runs)  whole suite < 3 min  speed >= 100x  one seed equals a real-time run (deaths within 1 s)
// Records per run: cleared/died and when, hearts lost and to what, time to kill per foe type, gunner calls, cover blocks, shots dodged by ducking, threat curve (live foe weight each second) and its peak,
// seconds Kai stood still, NaN / stuck / lingering-foe checks.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 50, PAR = +process.env.PAR || 1, GATE = process.env.GATE !== '0';
const BOTS = (process.env.BOTS || 'idle,nearest,gfirst,dodge').split(','), OUT = process.env.OUT || path.join(__dirname, 'STREETSIM.md'), RT = process.env.RT !== '0';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const seedOf = i => 4321 + i * 7919;

// ---- the bots: taken from the street tests themselves (one source of truth)
const src = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'), RUN = src.slice(src.indexOf('const RUN = ') + 12, src.indexOf('\n(async () =>')).trim().replace(/;$/, '').replace('i < 200', 'i < 300');   // W168: a 45-90 s boss fight ends after 200 s game time
const NEAR = 'if (near) P.facing = near.x > P.x ? 1 : -1;', DUCK = '// bullets: hop low ones', REACT = 'S.time + .2 + rnd() * .15, go: rnd() > .25';
for (const k of [NEAR, DUCK, REACT, "for (const p of S.pk) if ("]) if (!RUN.includes(k)) { console.log('FAIL streetsim: street2-test bot changed, missing: ' + k); process.exit(2); }
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
    "for (const b of S.eb) if (b.ground && b.src === 'bigheavy') { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .25 && P.onGround) { I.d = 0; I.jumpP = 1; I.jump = 1; } }\n" + DUCK);
const CODE = { nearest: RUN, gfirst: RUNG, dodge: RUND };

// ---- in the page: telemetry wrapped round FOOT.ctl (called once per update step, before the step), then the bot / idle run
const TEL = () => {
  const T = window.__T = { steps: 0, nan: 0, nanEx: '', still: 0, stuckAt: -1, sig: '', sigT: 0, thr: [], thrT: -1, duck: 0, hits: [], hurtAt: [], ttk: {}, lingerMax: 0, linger: 0, left: 0, seen: new Map(), prevX: null, bl: new Map(), mel: [], lastHurts: 0, hpMin: 99, hpPrev: null, hpLost: 0, tEnd: 0 };
  const W = { rusher: 1, gunner: 2, heavy: 4, guard: 2 }, num = v => typeof v === 'number' && isFinite(v), FE = window.FOOT_ENEMIES;
  for (const id of ['rusher', 'gunner', 'heavy', 'guard']) { const d = FE[id]; if (!d || d.__tk) continue; d.__tk = 1; const od = d.onDeath; d.onDeath = function (e) { const S = FOOT.S, T = window.__T; if (T && !e._tk) { e._tk = 1; const t0 = e.seenAt2 != null ? e.seenAt2 : e.born; if (S.P.w === 'pistol' && num(t0)) (T.ttk[id] = T.ttk[id] || []).push(+(S.time - t0).toFixed(2)); } return od ? od.apply(this, arguments) : undefined; }; }
  let inner = null;
  const obs = (S) => {
    if (window.__dbgObs) window.__dbgObs(S);
    const P = S.P, T = window.__T, t = S.time, vw = (FOOT._in.L() || {}).vw || 960; T.steps++;
    if (!num(P.x) || !num(P.y) || !num(P.hp) || S.E.some(e => !num(e.x) || !num(e.y) || (e.hp !== undefined && !num(e.hp))) || S.eb.some(b => !num(b.x) || !num(b.y))) { T.nan++; if (!T.nanEx) T.nanEx = `t=${t.toFixed(1)} P(${P.x},${P.y},${P.hp})`; }
    if (T.prevX != null && Math.abs(P.x - T.prevX) < .01 && P.hp > 0) T.still += 1 / 60; T.prevX = P.x;
    const sig = [Math.round(P.maxX / 5), S.kills, S.score, S.hurts, S.boss ? Math.round(S.boss.hp) : 0].join('|'); if (sig !== T.sig) { T.sig = sig; T.sigT = t; } else if (t - T.sigT > 25 && T.stuckAt < 0 && !S.end && P.hp > 0 && !window.__idle) T.stuckAt = +t.toFixed(1);
    T.hpMin = Math.min(T.hpMin, P.hp); if (T.hpPrev != null && P.hp < T.hpPrev) T.hpLost += T.hpPrev - P.hp; T.hpPrev = P.hp;
    for (const e of S.E) if (e._o === undefined && !e.dead) e._o = e.x < S.camX ? 'L' : 'R';   // W161: which side a foe was born on
    if (S.hurts > T.lastHurts) { const src = (S.hlog || [])[S.hurts - 1] || '', m = /^(mel|touch):(.*)$/.exec(src);
      if (m) { let b = null; for (const e of S.E) if (e.id === m[2] && (!b || Math.abs(e.x - P.x) < Math.abs(b.x - P.x))) b = e; if (b && !b.boss) T.mel.push([b.seenT == null ? -1 : +(t - b.seenT).toFixed(2), b._o || '?', m[2]]); } }
    if (S.hurts > T.lastHurts) { T.hurtAt.push([+t.toFixed(2), (S.hlog || [])[S.hurts - 1] || '?']); T.lastHurts = S.hurts; }
    // threat: weight of the live foes on the street, sampled each second; lingering foes (alive > 25 s after seen) and foes left behind
    let w = 0; for (const e of S.E) { if (e.dead) continue; const inView = e.x > S.camX - 5 && e.x < S.camX + vw + 5; if (inView && e.id !== 'bigheavy') w += W[e.id] || 1;   // the boss is its own phase, not part of the wave curve
      if (e.seen) { const r = T.seen.get(e) || (T.seen.set(e, t), t); if (t - r > 25) { T.lingerMax = Math.max(T.lingerMax, t - r); if (!e._lg) { e._lg = 1; T.linger++; } } }
      if (!e.fly && e.x < S.camX - 250 && !e._lf) { e._lf = 1; T.left++; } }
    if (Math.floor(t) !== T.thrT) { T.thrT = Math.floor(t); T.thr.push(w); }
    // level shots passing Kai while he ducks (crouch) and does not get hit = ducked shots
    for (const b of S.eb) { const side = Math.sign(b.x - P.x), pr = T.bl.get(b); if (pr && pr.side !== side && P.crouch && Math.abs(b.y - (P.y - 40)) < 60 && S.hurts === pr.h) T.duck++; T.bl.set(b, { side, h: S.hurts }); }
    if (T.bl.size > 400) T.bl.clear();
  };
  const F = FOOT; delete F.ctl;
  Object.defineProperty(F, 'ctl', { configurable: true, get() { return inner ? (S, I) => { inner(S, I); obs(S); } : null; }, set(f) { inner = f; } });
  return () => { delete F.ctl; F.ctl = null; };
};
// run one bot+seed stepped (fast); returns the bot's own result plus the telemetry
const ONE = (bot, seed, codeFn) => `(() => { const un = (${TEL.toString()})(); window.__idle = ${bot === 'idle'}; const w0 = performance.now(); let r;
  if (${bot === 'idle'}) { let s = ${seed}; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; FOOT.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; };
    RET.tale = false; FOOT.start('zeil'); let S = FOOT.S; for (let j = 0; j < 200 && S && !S.end; j++) S = FOOT.sim(1, 1 / 60); S = FOOT.S; r = { clear: !!(S.end && S.end.cleared), time: +S.time.toFixed(1), hp: S.P.hp, hurts: S.hurts, kills: S.kills }; }
  else { window.__gf = ${bot !== 'nearest'}; r = (${codeFn})(${seed}); }
  const ms = performance.now() - w0, S = FOOT.S, T = window.__T, sh = S.sh || {}, s3 = S.s3 || {};
  const tu = {}; r.end = !!S.end; r.ms = ms; r.dbg = window.__dbgLog; r.tEnd = +S.time.toFixed(1);
  r.tel = { mel: T.mel, steps: T.steps, nan: T.nan, nanEx: T.nanEx, still: +T.still.toFixed(1), stuckAt: T.stuckAt, thr: T.thr, duck: T.duck, hurtAt: T.hurtAt, ttk: T.ttk, lingerMax: +T.lingerMax.toFixed(1), linger: T.linger, left: T.left, hpMin: T.hpMin, hpLost: +T.hpLost.toFixed(1),
    called: sh.called | 0, blocked: sh.blocked | 0, coverBroke: sh.coverBroke | 0, plan: (s3.waves || []).map(x => [x.t, x.thr]), boss: s3.boss, heals: s3.healN | 0, hlog: (S.hlog || []).join(' ') };
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
  if (process.env.LIST) for (const o of out) if (o.r.tel && o.r.tel.stuckAt >= 0) console.log('STUCK', o.j.bot, o.j.seed, 'at', o.r.tel.stuckAt, 'end', o.r.tEnd, (o.r.alive || '').slice(0, 300));
  const rows = {};
  for (const bot of BOTS) { const rs = out.filter(o => o.j.bot === bot).map(o => o.r), good = rs.filter(r => !r.err), cl = good.filter(r => r.clear), dead = good.filter(r => !r.clear && r.end), tl = good.map(r => r.tel);
    const hs = {}; for (const r of good) for (const h of (r.tel.hlog || '').split(' ').filter(Boolean)) hs[h] = (hs[h] || 0) + 1;
    const ttk = id => med([].concat(...tl.map(t => (t.ttk || {})[id] || []))), nttk = id => [].concat(...tl.map(t => (t.ttk || {})[id] || [])).length;
    const reach = good.filter(r => r.tEnd >= .9 * Lref), pk = reach.map(r => peakT(r.tel.thr) / Lref * 100), plan = good[0] && good[0].tel.plan.length ? good[0].tel.plan : [];
    const planPk = plan.length ? plan.reduce((a, w) => w[1] > a[1] ? w : a, [0, -1])[0] : 0, thrMax = tl.map(t => Math.max(0, ...t.thr));
    rows[bot] = { n: rs.length, err: rs.length - good.length, clear: cl.length, dead: dead.length, noend: good.filter(r => !r.end).length, clearPct: good.length ? 100 * cl.length / good.length : 0, deathT: med(dead.map(r => r.tEnd)), clearT: med(cl.map(r => r.tEnd)),
      hearts: mean(tl.map(t => t.hpLost || 0)), hits: mean(good.map(r => r.hurts || 0)), hs, ttk: { rusher: ttk('rusher'), gunner: ttk('gunner'), heavy: ttk('heavy'), guard: ttk('guard'), n: [nttk('rusher'), nttk('gunner'), nttk('heavy'), nttk('guard')] }, called: mean(tl.map(t => t.called)), blocked: mean(tl.map(t => t.blocked)), coverBroke: mean(tl.map(t => t.coverBroke)), duck: mean(tl.map(t => t.duck)),
      peakMed: pk.length ? med(pk) : null, peakN: pk.length, planPk, thrMax: med(thrMax), still: mean(tl.map(t => t.still)), nan: tl.reduce((a, t) => a + t.nan, 0), stuck: tl.filter(t => t.stuckAt >= 0).length, linger: tl.reduce((a, t) => a + t.linger, 0), lingerMax: Math.max(0, ...tl.map(t => t.lingerMax)), left: tl.reduce((a, t) => a + t.left, 0),
      ex: good.filter(r => r.tel.nan || r.tel.stuckAt >= 0 || r.tel.linger).slice(0, 2).map(r => r.tel.nanEx || ('stuck at ' + r.tel.stuckAt)), speed: good.length ? good.reduce((a, r) => a + r.tEnd, 0) / Math.max(1e-9, good.reduce((a, r) => a + r.ms, 0) / 1000) : 0 };
  }
  { const all = ok0.filter(o => o.r && o.r.tel).flatMap(o => o.r.tel.mel || []), under = all.filter(m => m[0] < 1.2), beh = all.filter(m => m[1] === 'L');
    rows.__mel = { tot: ok0.reduce((a, o) => a + ((o.r && o.r.hurts) || 0), 0), n: all.length, under: under.length, beh: beh.length, min: all.length ? Math.min(...all.map(m => m[0])) : null };
    console.log(`INFO melee hits ${all.length}: on screen >= 1.2 s before the hit ${all.length - under.length}/${all.length} (min ${rows.__mel.min} s), from foes born behind ${beh.length} (${all.length ? (100 * beh.length / all.length).toFixed(0) : 0}% of melee hits, ${(100 * beh.length / Math.max(1, rows.__mel.tot)).toFixed(0)}% of all ${rows.__mel.tot} hits)`); }
  const rps = ok0.length / (simMs / 1000), factor = simSecs / (simMs / 1000);
  console.log(`INFO ${ok0.length} runs, ${simSecs.toFixed(0)} s of game time stepped in ${(simMs / 1000).toFixed(1)} s page time (${suiteSecs.toFixed(1)} s suite): ${rps.toFixed(2)} runs/s, x${factor.toFixed(0)} real time`);
  for (const bot of BOTS) { const r = rows[bot]; console.log(`INFO ${bot}: clear ${r.clear}/${r.n} (${r.clearPct.toFixed(0)}%) died ${r.dead} at median ${r.deathT} s, hearts lost ${r.hearts.toFixed(1)}/run in ${r.hits.toFixed(1)} hits [${Object.entries(r.hs).map(([k, v]) => k + ' ' + v).join(', ')}], ttk r/g/h/guard ${r.ttk.rusher}/${r.ttk.gunner}/${r.ttk.heavy}/${r.ttk.guard} (n ${r.ttk.n[3]}) s, calls ${r.called.toFixed(1)} blocks ${r.blocked.toFixed(1)} ducked ${r.duck.toFixed(1)}, peak ${r.peakMed}% (n${r.peakN}), still ${r.still.toFixed(1)} s, nan ${r.nan} stuck ${r.stuck} linger ${r.linger}`); }

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
  const best = BOTS.filter(b => b !== 'idle').map(b => rows[b]).sort((x, y) => y.clearPct - x.clearPct)[0], bestName = BOTS.find(b => rows[b] === best), idleR = rows.idle;
  const peaks = BOTS.filter(b => b !== 'idle' && rows[b].peakN).map(b => rows[b].peakMed);
  const fmt = n => n == null ? '-' : n;
  let md = `# STREETSIM: the street stage in fast simulation\n\nGenerated by \`qa/streetsim.js\` on ${new Date().toISOString().replace(/\.\d+Z$/, 'Z')} (UTC). ${ok0.length} runs (${RUNS} per bot, seeds 4321 + i x 7919), ${simSecs.toFixed(0)} s of game time stepped in ${(simMs / 1000).toFixed(1)} s: **${rps.toFixed(2)} runs/s, x${factor.toFixed(0)} real time**. Nothing draws and nothing waits on the wall clock (\`FOOT.sim(1, 1/60)\`). Reproduce one run: \`ONLY=<bot>:<seed> node qa/streetsim.js\`.\n\n`;
  md += `Bots: **idle** = no input. **nearest** = street2-test's human-style bot (shoots the nearest foe, takes cover, hops low shots, 0.2-0.35 s late, misses 1 in 4). **gfirst** = streethard-test's gunner-first bot (walks up to the gunner, ducks level shots). **dodge** = gunner-first that reacts to every telegraph in 0.1 s and always ducks.\n\n`;
  md += `| bot | runs | cleared | died | median death (s) | median clear (s) | hearts lost (hits) / run | rusher / gunner / heavy / guard time to kill (s) | gunner calls / run | cover blocks / run | shots dodged by ducking / run | threat peak % (median) | Kai still (s / run) | NaN | stuck | lingering foes |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const b of BOTS) { const r = rows[b]; md += `| ${b} | ${r.n} | ${r.clear} (${r.clearPct.toFixed(0)}%) | ${r.dead} | ${fmt(r.deathT)} | ${fmt(r.clearT)} | ${r.hearts.toFixed(1)} (${r.hits.toFixed(1)}) | ${fmt(r.ttk.rusher)} / ${fmt(r.ttk.gunner)} / ${fmt(r.ttk.heavy)} / ${fmt(r.ttk.guard)} | ${r.called.toFixed(1)} | ${r.blocked.toFixed(1)} | ${r.duck.toFixed(1)} | ${r.peakMed == null ? '-' : r.peakMed + ' (n' + r.peakN + ')'} | ${r.still.toFixed(1)} | ${r.nan} | ${r.stuck} | ${r.linger} |\n`; }
  md += `\nHearts lost by source (all runs): ${BOTS.map(b => b + ': ' + (Object.entries(rows[b].hs).map(([k, v]) => k + ' ' + v).join(', ') || 'none')).join('; ')}.\n\n`;
  md += `Threat curve: the weight of the live foes on the street each second (rusher 1, gunner 2, heavy 4; the boss is left out, it is a separate phase), smoothed over 10 s; the peak is the second of its maximum as a percentage of ${Lref} s (the median cleared run, or the longest run if none cleared). Only runs that lasted >= 90% of that length count. The planned curve (waves) peaks at ${rows[BOTS.find(b => b !== 'idle')].planPk} s = ${(100 * rows[BOTS.find(b => b !== 'idle')].planPk / Lref).toFixed(0)}%. Time to kill = seen to dead with the pistol.\n\n`;
  const lines = [];
  const L = (p, n) => lines.push([p, n]);
  const nanTot = BOTS.reduce((a, b) => a + rows[b].nan + rows[b].stuck + rows[b].err, 0);
  L(nanTot === 0 && errs.length === 0, `no NaN / stuck / harness error / page error (NaN ${BOTS.reduce((a, b) => a + rows[b].nan, 0)}, stuck ${BOTS.reduce((a, b) => a + rows[b].stuck, 0)}, errors ${BOTS.reduce((a, b) => a + rows[b].err, 0)}, page errors ${errs.length}${errs[0] ? ' ' + errs[0].slice(0, 80) : ''})`);
  if (idleR) L(idleR.clear === 0 && idleR.dead === idleR.n, `idle bot dies (died ${idleR.dead}/${idleR.n}, median ${fmt(idleR.deathT)} s, cleared ${idleR.clear})`);
  if (best) L(best.clearPct >= 60 && best.clearPct <= 80, `best bot (${bestName}) clears 60-80% (${best.clearPct.toFixed(0)}%; ${BOTS.filter(b => b !== 'idle').map(b => b + ' ' + rows[b].clearPct.toFixed(0) + '%').join(', ')})`);
  if (rows.nearest) L(rows.nearest.clearPct >= 25 && rows.nearest.clearPct <= 40, `nearest-first (a casual player) clears 25-40% (${rows.nearest.clearPct.toFixed(0)}%)`);
  L(peaks.length && peaks.every(x => x >= 82 && x <= 88), `threat peak 82-88% as the median over runs (${BOTS.filter(b => b !== 'idle').map(b => b + ' ' + fmt(rows[b].peakMed) + '%').join(', ')})`);
  if (/shieldfoe=1/.test(process.env.Q || '')) { const src = new Set(); for (const b of BOTS) for (const k of Object.keys(rows[b].hs)) { const m = /^(?:mel|bul|touch):(.*)$/.exec(k); if (m) src.add(m[1]); }
    L(src.size >= 4, `W171 >= 4 foe types in hearts by source (${[...src].join(', ')})`);
    const gN = rows.nearest && rows.nearest.ttk.guard, gC = rows.dodge && rows.dodge.ttk.guard, gG = rows.gfirst && rows.gfirst.ttk.guard;
    L(gN != null && gC != null && Math.abs(gN - gC) >= .3 * Math.max(gN, gC), `W171 guard time to kill differs >= 30% with its counter (dodge gets behind it ${gC} s, gfirst ${gG} s; nearest shoots its front ${gN} s)`); }
  if (rows.nearest && rows.gfirst) L(rows.gfirst.clearPct - rows.nearest.clearPct >= 15, `kill order matters: gunner-first clears >= 15 points more than nearest-first (${rows.gfirst.clearPct.toFixed(0)}% vs ${rows.nearest.clearPct.toFixed(0)}%)`);
  if (rows.dodge) { L(rows.dodge.duck >= 3, `ducking prevents >= 3 hits per run for the dodge bot (${rows.dodge.duck.toFixed(1)})`); L(rows.dodge.blocked >= 3, `cover prevents >= 3 hits per run for the dodge bot (${rows.dodge.blocked.toFixed(1)})`); }
  L(rows.__mel.under === 0, `every melee hit comes from a foe on screen >= 1.2 s before it (${rows.__mel.n} hits, ${rows.__mel.under} under 1.2 s, min ${rows.__mel.min} s)`);
  L(rows.__mel.beh / Math.max(1, rows.__mel.tot) < .2, `< 20% of hearts lost to foes that entered from behind (${rows.__mel.beh} of ${rows.__mel.tot} hits)`);
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
