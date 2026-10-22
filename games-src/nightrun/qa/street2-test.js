#!/usr/bin/env node
// STREET2 (parts/street/street2.js, flag RET.street2): the rebuilt Zeil street run, stepped time (FOOT.sim), a human-style bot, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/street2-test.js     env: RUNS=8  Q='&street2=0' (old stage, numbers only)  GATE=0 (numbers only)
// Gates: (a) human-style clear 60-90%  (b) >= 8 destructibles broken per run (mean and min >= 6)  (c) no enemy alive > 25 s after it is seen
//        (d) Kai and grounded foes' feet within 6 px of the road line (or Kai's platform)  (e) 0 page errors  (f) 6 rooms reached in a clear, 60-120 s
// The bot: reacts after ~0.25 s, misses ~1 in 4 telegraphs, picks high or low path per room, opens a gold crate half the time.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 8, Q = process.env.Q || '', GATE = process.env.GATE !== '0';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const RUN = (seed) => { let s = seed; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const FL = 470, rnd = Math.random; let feetBad = 0, feetMax = 0, frames = 0, react = {}, path = {}, gold = {};
  const ctl = (S, I) => { const P = S.P, vw = (FOOT._in.L() || {}).vw || 960; frames++;
    // feet on the road line (or on the platform Kai stands on)
    if (P.onGround && P.hp > 0) { const d = Math.min(Math.abs(P.y - FL), ...S.st.plats.map(p => Math.abs(P.y - p[1]))); if (d > 6) feetBad++; feetMax = Math.max(feetMax, d); }
    for (const e of S.E) if (!e.dead && !e.fly && e.seen) { const d = Math.abs(e.y - FL); if (d > 6) feetBad++; feetMax = Math.max(feetMax, d); }
    I.l = I.r = I.u = I.d = 0; I.fire = 1; I.jump = P.vy < 0 ? 1 : 0;
    const live = S.E.filter(e => !e.dead && e.x > S.camX - 5 && e.x < S.camX + vw + 5);
    const room = S.s2 ? S.s2.rooms[S.s2.rooms.length - 1] : 0; if (path[room] == null) path[room] = rnd() < .5 ? 'high' : 'low';
    const see = (e, key) => { const k = e.id + (e._bid || (e._bid = rnd())) + key; if (react[k] == null) react[k] = { t: S.time + .2 + rnd() * .15, go: rnd() > .25 }; return S.time >= react[k].t && react[k].go; };
    let near = null, nd = 1e9; for (const e of live) { const d = Math.abs(e.x - P.x); if (d < nd) { nd = d; near = e; } }
    if (near) P.facing = near.x > P.x ? 1 : -1;
    const gun = live.find(e => e.id === 'gunner' && e.state !== 'charge');
    if (gun) { const plat = S.st.plats.find(p => p[0] < gun.x && p[0] + p[2] > gun.x - 320);
      if (path[room] === 'high' && plat && gun.cov && gun.cov.hp > 0) { const tx = plat[0] + plat[2] * .6; if (P.y > plat[1] + 5) { if (Math.abs(P.x - tx) > 30) I[tx > P.x ? 'r' : 'l'] = 1; if (Math.abs(P.x - tx) < 70 && P.onGround) { I.jumpP = 1; I.jump = 1; } } }
      else { const cov = S.pr.filter(p => p.hp > 0 && p.cover && p.x < gun.x - 60).sort((a, b) => b.x - a.x)[0];
        if (cov) { const tx = cov.x - cov.w / 2 - 14; if (Math.abs(P.x - tx) > 10) I[tx > P.x ? 'r' : 'l'] = 1; else if (gun.tele > 0 && see(gun, 'duck' + Math.floor(S.time))) I.d = 1; }
        else if (Math.abs(gun.x - P.x) > 200) I[gun.x > P.x ? 'r' : 'l'] = 1; } }
    else if (near) { if (Math.abs(near.x - P.x) > 260) I[near.x > P.x ? 'r' : 'l'] = 1; }
    else { const g = S.pr.find(p => p.hp > 0 && p.k === 'gold' && p.x > P.x - 10 && p.x - P.x < 260); if (g && (gold[g.i] == null ? (gold[g.i] = rnd() < .5) : gold[g.i])) { P.facing = 1; if (g.x - P.x > 120) I.r = 1; } else I.r = 1; }
    for (const e of live) { const dx = e.x - P.x, toward = Math.sign(-dx) === e.facing;
      if (e.id === 'rusher' && (e.state === 'crouch' || e.state === 'lunge') && Math.abs(dx) < 190 && P.onGround && see(e, 'j' + Math.floor(e.t))) { I.jumpP = 1; I.jump = 1; }
      if (e.heavy && (e.state === 'wind' || e.state === 'charge') && toward && Math.abs(dx) < 300 && see(e, 'h' + Math.floor(e.t * .5))) {
        if (e.state === 'charge' && Math.abs(dx) < 150 && P.onGround) { I.jumpP = 1; I.jump = 1; } }
      if (e.heavy && e.state !== 'stun' && Math.abs(dx) < 150 && !I.jumpP) I[dx > 0 ? 'l' : 'r'] = 1;   // keep off its front
      if (e.heavy && e.state === 'stun' && P.bombs > 0 && (!S._bt || S.time - S._bt > 3)) { I.bombP = 1; S._bt = S.time; } }
    if (P.y < FL - 20 && P.onGround && (!gun || !(gun.cov && gun.cov.hp > 0)) && live.some(e => !e.dead && Math.abs(e.x - P.x) < 220)) { I.d = 1; I.jumpP = 1; }   // drop off the platform once the cover is gone
    if (near && Math.abs(near.x - P.x) < 60 && Math.abs(near.y - P.y) < 80 && P.melCd <= 0 && see(near, 'k' + Math.floor(S.time * 2))) I.meleeP = 1;   // knife what is on top of you
    // bullets: hop low ones
    for (const b of S.eb) { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .3 && Math.abs(b.y + b.vy * t - (P.y - 40)) < 40 && P.onGround && see({ id: 'b', _bid: b.x0 || (b.x0 = b.x) }, 'b')) { I.jumpP = 1; I.jump = 1; } }
    for (const p of S.pk) if (Math.abs(p.x - P.x) < 200 && p.x > S.camX + 24 && !live.length) { I.r = p.x > P.x; I.l = p.x < P.x; } };
  document.getElementById('fMenu') && (document.getElementById('fMenu').hidden = true);
  let cerr = ''; FOOT.ctl = (S, I) => { try { ctl(S, I); } catch (x) { if (!cerr) cerr = x.message + ' ' + (x.stack || '').split('\n')[1]; } }; const tl = RET.tale; RET.tale = false; FOOT.start('zeil'); RET.tale = tl;
  let S = FOOT.S; for (let i = 0; i < 200 && S && !S.end; i++) S = FOOT.sim(1, 1 / 60);
  S = FOOT.S; const L = S.s2 || {}; const out = { clear: !!(S.end && S.end.cleared), time: +S.time.toFixed(1), hp: S.P.hp, broke: L.broke | 0, life: L.life || [], rooms: (L.rooms || []).length, feetBad, feetMax: +feetMax.toFixed(1), frames, hurts: S.hurts, kills: S.kills, boss: S.s2 && S.s2.bossLife, hlog: (S.hlog || []).slice(0, 12).join(' '), s2: !!S.st.s2, x: Math.round(S.P.maxX) };
  out.alive = cerr + ' ' + S.E.filter(e => !e.dead).map(e => e.id + ':' + e.state + ':' + Math.round(e.x - S.camX) + ':' + (e.hid ? 'H' : '') + ':' + e.hp.toFixed(1) + ':' + (e.seen ? 'S' : 'u')).join(' ') + ' P=' + Math.round(S.P.x - S.camX) + ',' + Math.round(S.P.y) + ',f' + S.P.facing + ',aim' + S.P.aim.toFixed(2) + ',pb' + S.pb.length + ',w' + S.P.w + ' props=' + S.pr.filter(p => p.hp > 0 && Math.abs(p.x - S.P.x) < 300).map(p => p.k + Math.round(p.x - S.camX) + (p.pass ? 'P' : '')).join(',') + ' lock=' + (S.lock && S.lock.id) + ' waves=' + S.waves.filter(w => !w.done).map(w => w.enemy + w.lock).join(','); FOOT.ctl = null; FOOT.stop(); return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch(), errs = [];
  const ctx = await br.newContext({ viewport: { width: 1440, height: 860 } });
  await ctx.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const R = []; for (let i = 0; i < RUNS; i++) { const r = await p.evaluate(`(${RUN})(${1234 + i * 7919})`); R.push(r);
    console.log(`  run ${i + 1}: ${r.clear ? 'CLEAR' : 'down '} t=${r.time}s hp=${r.hp} rooms=${r.rooms} broke=${r.broke} kills=${r.kills} hurts=${r.hurts} maxLife=${Math.max(0, ...r.life)}s bossLife=${r.boss}s feetMax=${r.feetMax} x=${r.x} hits: ${r.hlog} | ${r.alive}`); }
  const cl = R.filter(r => r.clear).length, br8 = R.map(r => r.broke), mean = br8.reduce((a, b) => a + b, 0) / R.length, life = Math.max(0, ...R.flatMap(r => r.life)), feet = Math.max(...R.map(r => r.feetMax)), ct = R.filter(r => r.clear).map(r => r.time);
  console.log(`  summary: clear ${cl}/${R.length}, broken mean ${mean.toFixed(1)} min ${Math.min(...br8)}, max enemy life ${life}s, feet max ${feet}px, clear times ${ct.join(',')}, page errors ${errs.length}${errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''}`);
  if (GATE) {
    ok(R[0].s2, 'street2 stage active');
    ok(cl / R.length >= .6 && cl / R.length <= .9, `(a) human-style clear ${cl}/${R.length} (60-90%)`);
    ok(mean >= 8 && Math.min(...br8) >= 6, `(b) destructibles broken per run mean ${mean.toFixed(1)} (>= 8), min ${Math.min(...br8)} (>= 6)`);
    ok(life <= 25, `(c) longest enemy life after seen ${life}s (<= 25)`);
    ok(feet <= 6, `(d) feet off the road line max ${feet}px (<= 6)`);
    ok(errs.length === 0, `(e) page errors ${errs.length}`);
    ok(ct.every(t => t >= 60 && t <= 120) && R.filter(r => r.clear).every(r => r.rooms >= 6), `(f) clears take 60-120 s and pass all 6 rooms (${ct.join(',')})`);
  }
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL street2-test' : 'PASS street2-test'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL street2-test ' + e.message); process.exit(1); });
