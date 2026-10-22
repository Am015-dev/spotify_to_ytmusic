#!/usr/bin/env node
// Ground enemies, calmer pacing and the BREACH meter (parts/waves/leak.js, flag RET.leak) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-leak-test.js      env: GAME_DIR=<dir with index.html>, SECS=70 (sim seconds per stage)
//  (a) landscape 1366x768 and 1280x720, the 3rd stage of every city: the three ground types appear (all three over the run), stand on the road line
//      (bottom within 1.5 px of UIK.groundY for their whole life), never above it, are reachable by a level shot (a hit lowers hp), stages 1-2 and the ferry stage have none
//  (b) portrait 390x763 touch (rotMode): no ground enemy at all, no floating
//  (c) pacing: flyer speed factor easy/normal .78, hard .8, legend .9 (zoo.js; ?zoo=0 gives .9 / 1) (measured on a real drone), bosses and ground enemies unchanged;
//      breathing gap: easy/normal get gaps, no spawn lands while one is on, legend gets none
//  (d) breach: leak counting by weight, free warning, group size per difficulty (easy 4, normal 3, hard/legend 2 leaks a hull), decay 1 per 2 quiet bars, never takes the last
//      hull on easy/normal but does on hard, a real enemy walking off screen counts, a boss never does, a leaking bullet never does, fever stops filling for the bar
//  (e) HUD: 'BREACH' drawn, >= 14 css px, inside the screen, at 390x763 and 1280x720
//  (f) ?leak=0: no ground, no leaks, no speed change, no gap
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 70;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

const PLAY = (o) => {   // inside the page: play stage n for o.secs sim seconds with a dodging, auto-firing bot that cannot die
  const m = window.__mnr, L = window.LEAK; m.SET.diff = o.diff || 'normal'; m.SET.auto = true; m.applySet && m.applySet();
  m.startStory(o.n); m.simOn(true); L.reset();
  const seen = {}, bad = [], gy = () => m.UIK.groundY(), spawnsAt = [], r = { shots: 0, hits: 0 }; let T = 0, lastSp = 0, gapSteps = 0, gapSpawns = 0, gapTypes = [], probe = new Set();
  while (m.running && T < o.secs && !(m.G.boss)) {
    m.P.hp = 99; m.P.inv = 1; m.P.y = 360 + 150 * Math.sin(T * 1.3); m.P.x = 260 + 100 * Math.sin(T * .7); if (m.SH.active) m.SH.close();
    const sp0 = m.G.spawns.length, gap0 = L.gap; m.step(1 / 30); T += 1 / 30;
    if (L.gap === 2) { gapSteps++; if (gap0 === 2 && m.G.spawns.length > sp0 && m.G.spawns.slice(sp0).some(q => q[0] !== 'flank')) { gapSpawns++; gapTypes.push(m.G.spawns.slice(sp0).map(q => q[0]).join()); } }   // (a flank pattern started before the gap enters 1-2 beats later: allowed)
    for (const e of m.G.en) if (e.gnd) {
      seen[e.type] = (seen[e.type] || 0) + 1;
      const off = gy() - (e.y + e.r); if (Math.abs(off) > 1.5) bad.push(`${e.type} ${off.toFixed(1)} px off the road line`);
      if (!probe.has(e) && e.x < 700 && e.t > 4 && e.hp > 0) {   // reach test: a level shot at its height must hurt it
        probe.add(e); const hp0 = e.hp; m.G.pb.push({ x: e.x - 24, y: e.y, vx: 870, vy: 0, dm: 2, pf: 0 }); m.step(1 / 30); T += 1 / 30; r.shots++; if (e.hp < hp0 || e.hp <= 0 || e.dead) r.hits++;
        const cy = Math.min(Math.max(e.y, 36), m.UIK.groundY() + 16); if (Math.abs(cy - e.y) > e.r + 4) bad.push(`${e.type} out of the ship's reach (y ${e.y})`);
      }
    }
  }
  const out = { seen, bad: [...new Set(bad)].slice(0, 4), reach: r, ground: L.ground, okWaves: L.okWaves, waves: L.waves, gaps: L.gaps, gapSteps, gapSpawns, gapTypes, T: Math.round(T), name: m.ST.def && m.ST.def.name };
  m.abort(); return out;
};
const UNIT = () => {   // leak rules, driven directly
  const m = window.__mnr, L = window.LEAK, out = [], ok = (c, msg) => { if (!c) out.push(msg); };
  const dr = (hp) => ({ type: 'drone', x: -40, y: 300, r: 14, hp: hp == null ? 2 : hp, max: 2, t: 5, flash: 0 }), ship = { type: 'gunship', y: 300, x: 0, r: 36, hp: 20 };
  m.SET.diff = 'normal'; m.startStory(3); m.simOn(true); L.reset(); m.P.hp = m.P.max = 7;
  const cases = { easy: 4, normal: 3, hard: 2, legend: 2 };
  for (const [df, g] of Object.entries(cases)) {
    m.SET.diff = df; L.reset(); m.P.hp = 7; m.G.dead = false; m.P.inv = 0; m.P.dashT = 0; m.P.dq = 0; m.SH.sh = 0;
    for (let i = 0; i < L.free; i++) { L.leak(1, dr()); ok(m.P.hp === 7, `${df}: leak ${i + 1} cost hull (should only warn)`); }
    for (let i = 1; i < g; i++) { L.leak(1, dr()); ok(m.P.hp === 7, `${df}: hull lost before ${g} leaks past the warning (${i})`); }
    L.leak(1, dr()); ok(m.P.hp === 6, `${df}: group of ${g} leaks did not cost 1 hull (hp ${m.P.hp})`); ok(L.M === L.free, `${df}: meter should fall back to the warning level (${L.M})`);
  }
  m.SET.diff = 'normal'; L.reset(); m.P.hp = 7; m.P.inv = 0; L.leak(3, ship); ok(L.M === 3, 'gunship should count 3'); ok(L.weight({ type: 'drone', el: 1 }) === 3, 'elite should count 3');
  ok(L.weight({ type: 'swarm' }) === 0 && L.weight({ type: 'mine' }) === 0 && L.weight({ type: 'gate' }) === 0 && L.weight({ type: 'boss' }) === 0, 'swarm/mine/gate/boss must not count');
  // decay: 1 per 2 quiet bars
  L.reset(); L.M = 3; m.NR.emit('bar', {}); ok(L.M === 3, 'decayed after 1 bar'); m.NR.emit('bar', {}); ok(L.M === 2, 'no decay after 2 quiet bars (' + L.M + ')');
  L.reset(); L.M = 3; m.NR.emit('bar', {}); L.leak(1, dr()); m.NR.emit('bar', {}); ok(L.M === 4, 'a leak should restart the quiet count (' + L.M + ')');
  // never the last hull on easy/normal, may on hard
  for (const df of ['easy', 'normal']) { m.SET.diff = df; L.reset(); m.G.dead = false; m.P.hp = 1; m.P.inv = 0; L.pay(); ok(m.P.hp === 1 && !m.G.dead, `${df}: breach took the last hull`); }
  m.SET.diff = 'hard'; L.reset(); m.G.dead = false; m.P.hp = 1; m.P.inv = 0; L.pay(); ok(m.P.hp === 0 && m.G.dead, 'hard: breach should be able to take the last hull'); m.G.dead = false;
  // the cost is normal damage: counted as a hit (medals), not invulnerable at the moment of the breach
  m.SET.diff = 'normal'; L.reset(); m.P.hp = 7; m.P.inv = 1.5; const h0 = m.ST.hits; L.pay(); ok(m.P.hp === 6 && m.ST.hits === h0 + 1, 'breach should count as a hit even while the ship blinks (hp ' + m.P.hp + ')');
  // real flow: an enemy that leaves alive counts, a dead one, a boss and a bullet do not
  L.reset(); m.G.en.length = 0; m.P.x = 700; const a = L.en('drone', { x: -60, y: 200 }); a.el = 0; a.ldr = 0; a.hp = a.max = 2; const b = L.en('drone', { x: -60, y: 260 }); b.hp = 0; b.dead = 1; const c = L.en('swarm', { x: -60, y: 320 });
  m.G.eb.push({ x: -60, y: 100, vx: -50, vy: 0, r: 5 }); m.step(1 / 30); ok(L.total === 1, 'only the live drone should count (' + L.total + ', ' + JSON.stringify(L.log) + ')');
  L.reset(); m.G.en.length = 0; m.G.en.push({ type: 'boss', x: -300, y: 200, r: 40, hp: 100, max: 100, t: 1, flash: 0 }); L.tick(1 / 30); ok(L.total === 0, 'a boss must not leak'); m.G.en.length = 0;
  // fever
  L.reset(); const fv = m.RET.fv; fv.m = 0; fv.on = false; fv.armed = false; L.leak(1, dr()); const g0 = m.RET.fvGain(5); m.NR.emit('bar', {}); fv.m = 0; const g1 = m.RET.fvGain(5);
  ok(g0 === false, 'fever filled in the bar of a leak'); ok(g1 !== false || m.G.boss || m.STILL.t > fv.still, 'fever should fill again on the next bar');
  m.abort(); return out;
};
const SPEED = (flip) => {   // measured speed of a drone entering: per difficulty, flag as it is vs flag off (ratio); flip=false only measures
  const m = window.__mnr, L = window.LEAK, res = {}, R = m.RET, keep = R.leak;
  const run = (df, on) => { R.leak = on; m.SET.diff = df; m.startStory(3); m.simOn(true); m.G.en.length = 0; m.G.eb.length = 0; m.P.hp = 99; m.P.inv = 99; m.P.x = 40;
    const d = L.en('drone', { x: 800, y: 100, amp: 0 }); d.gr = 0; if (window.ZOO) { d.zs = { x: 200, y: 100 }; d.zph = 0; d.zst = 0; } const x0 = d.x; for (let i = 0; i < 15; i++) m.step(1 / 30); const v = (x0 - d.x) / 0.5; m.abort(); return v; };
  for (const df of ['easy', 'normal', 'hard', 'vhard', 'legend']) res[df] = run(df, keep) / run(df, false);
  R.leak = keep; m.SET.diff = 'normal'; m.startStory(3); m.simOn(true); m.G.en.length = 0; const e = L.mk('gtank', 800); const x0 = e.x; for (let i = 0; i < 15; i++) m.step(1 / 30); res.tank = (x0 - e.x) / 0.5; m.abort();
  return res;
};
const HUDPX = () => {   // BREACH text size in css px and position
  const m = window.__mnr, L = window.LEAK, cv = document.getElementById('cv') || document.querySelector('canvas'); m.SET.diff = 'normal'; m.startStory(3); m.simOn(true); L.reset(); L.M = 3; m.step(1 / 30);
  const proto = CanvasRenderingContext2D.prototype, ft = proto.fillText, r = cv.getBoundingClientRect(), cssK = r.width / cv.width, got = [];
  proto.fillText = function (txt, x, y) { try { if (/BREACH/.test(String(txt))) { const t = this.getTransform(), px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)[1]) * Math.hypot(t.a, t.b) * cssK, cx = (t.a * x + t.c * y + t.e) * cssK + r.left, cy = (t.b * x + t.d * y + t.f) * cssK + r.top, w = this.measureText(String(txt)).width * Math.hypot(t.a, t.b) * cssK; got.push({ px, x0: cx, x1: cx + w, y: cy }); } } catch (e) { } return ft.apply(this, arguments); };
  m.render(m.G.t, 0); proto.fillText = ft; m.abort(); return { got, vw: innerWidth, vh: innerHeight };
};
(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`;
  const open = async (w, h, touch, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`page error @${w}x${h}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url(q));
    await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0 && window.LEAK, null, { timeout: 15000 }).catch(() => fails.push('page did not start')); return { ctx, p }; };
  // (a) landscape, 3rd stage of every city; stage numbers: city k stage 3 = 8k+3
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    const { ctx, p } = await open(w, h, false), tot = {}; let hits = 0, shots = 0;
    for (const n of [3, 11, 19, 27, 35]) {
      const r = await p.evaluate(PLAY, { n, secs: SECS, diff: 'normal' }); r.bad.forEach(b => fails.push(`stage ${n} @${w}: ${b}`));
      for (const k in r.seen) tot[k] = (tot[k] || 0) + r.seen[k]; hits += r.reach.hits; shots += r.reach.shots;
      if (process.env.V) console.log(w, n, r.name, JSON.stringify(r));
      if (r.okWaves >= 6 && r.ground === 0) fails.push(`stage ${n} @${w}: ${r.okWaves} ground-capable waves but no ground wave`);
    }
    for (const k of ['gtank', 'gturret', 'gwalker']) if (!tot[k]) fails.push(`@${w}: never saw a ${k} over 5 stages`);
    if (shots && hits < shots * .7) fails.push(`@${w}: level shots hit ground enemies only ${hits}/${shots}`);
    if (!shots) fails.push(`@${w}: no ground enemy reached the shot probe`);
    for (const n of [1, 2, 12]) { const r = await p.evaluate(PLAY, { n, secs: 40, diff: 'normal' }); if (r.ground) fails.push(`stage ${n} @${w} (${r.name}) must have no ground enemies`); }
    if (w === 1366) {   // (c) pacing
      const s = await p.evaluate(SPEED), want = { easy: .78, normal: .78, hard: .8, vhard: 1, legend: .9 };
      for (const k in want) if (Math.abs(s[k] - want[k]) > .03) fails.push(`speed ${k}: ${s[k].toFixed(2)} of full, wanted ${want[k]}`);
      if (s.tank < 60 || s.tank > 110) fails.push(`ground tank speed odd (${s.tank})`);
      const gp = {}; for (const df of ['easy', 'normal', 'legend']) gp[df] = await p.evaluate(PLAY, { n: 3, secs: 80, diff: df });
      for (const df of ['easy', 'normal']) { if (gp[df].gaps < 1) fails.push(`${df}: no breathing gap in 80 s`); if (gp[df].gapSpawns) fails.push(`${df}: ${gp[df].gapSpawns} spawns during a breathing gap (${gp[df].gapTypes})`); }
      if (gp.legend.gaps) fails.push('legend must have no breathing gap');
      if (process.env.V) console.log('gaps', JSON.stringify({ e: gp.easy.gaps, n: gp.normal.gaps, l: gp.legend.gaps }), JSON.stringify(s));
      const u = await p.evaluate(UNIT); fails.push(...u);   // (d)
    }
    const hp = await p.evaluate(HUDPX); if (!hp.got.length) fails.push(`@${w}: BREACH not drawn`);
    for (const g of hp.got.slice(0, 2)) { if (g.px < 13.5 && w >= 1280) fails.push(`@${w}: BREACH text ${g.px.toFixed(1)} px`); if (g.x0 < 0 || g.x1 > hp.vw || g.y < 0 || g.y > hp.vh) fails.push(`@${w}: BREACH outside the screen`); }
    await ctx.close();
  }
  // (b)+(e) portrait phone
  for (const [w, h] of [[390, 763], [375, 553]]) {
    const { ctx, p } = await open(w, h, true);
    if (!(await p.evaluate(() => __mnr.rotMode))) fails.push(`portrait: rotMode off at ${w}x${h}`);
    for (const n of [3, 35]) { const r = await p.evaluate(PLAY, { n, secs: 50, diff: 'normal' }); r.bad.forEach(b => fails.push(`portrait ${w} stage ${n}: ${b}`)); if (r.ground) fails.push(`portrait ${w} stage ${n}: ${r.ground} ground waves (would float)`); }
    const hp = await p.evaluate(HUDPX); if (!hp.got.length) fails.push(`@${w}: BREACH not drawn`);
    for (const g of hp.got.slice(0, 2)) { if (g.px < 13.5) fails.push(`@${w}: BREACH text ${g.px.toFixed(1)} css px (< 14)`); if (g.x0 < 0 || g.x1 > hp.vw || g.y < 0 || g.y > hp.vh) fails.push(`@${w}: BREACH outside the screen`); }
    if (process.env.V) console.log('hud', w, JSON.stringify(hp.got.slice(0, 1)));
    await ctx.close();
  }
  // (f) flag off
  { const { ctx, p } = await open(1366, 768, false, '&leak=0'); const r = await p.evaluate(PLAY, { n: 3, secs: 60, diff: 'normal' }), s = await p.evaluate(SPEED);
    if (r.ground || r.gaps || (await p.evaluate(() => LEAK.total))) fails.push('leak=0: ground / gap / leaks still on'); if (['easy', 'normal', 'hard', 'legend'].some(k => Math.abs(s[k] - 1) > .01)) fails.push('leak=0: speed changed');
    const hp = await p.evaluate(HUDPX); if (hp.got.length) fails.push('leak=0: BREACH drawn'); await ctx.close(); }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 30).join('\n') : 'PASS ret-leak-test'); process.exit(fails.length ? 1 : 0);
})();
