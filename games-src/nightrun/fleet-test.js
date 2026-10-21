#!/usr/bin/env node
// Enemy ships in the fly stages (parts/fleet.js, flag RET.fleet) through the real page (prints pass/fail lines only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/fleet-test.js      env: GAME_DIR=<dir with index.html>, V=1 (verbose)
//  (a) each kind is locked one stage before its first stage and spawns from it (interceptor 6, bomber 10, carrier 16, cruiser 22), cruiser never on a boss stage / with a boss
//  (b) ramp: single -> pair -> mixed group by stage, Easy smaller, Hard bigger; wave share .07 at 6 rising to .24
//  (c) telegraphs: dive line >= .6 s and the dive hurts on the line only; bomb ring >= .6 s and hurts inside only; beam warning >= .6 s then the live beam hurts
//  (d) carrier: shield absorbs hits while its drones live, drops when they die, the hull then takes damage, it relaunches later
//  (e) a 90 s stage-30 run: every unit that leaves alive spent >= 4 s on screen, no shot fired off screen, bullets under ebCap, shots-to-kill bands
//  (f) ?fleet=0 plays exactly like the page without fleet.js (seeded spawns, kills, score); no page errors (desktop + phone)
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const SEED = `(()=>{let a=777;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
const FIRST = { einterceptor: 6, ebomber: 10, ecarrier: 16, ecruiser: 22 };

const SETUP = (n, df) => { const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = df || 'normal'; m.SET.auto = false; m.applySet && m.applySet(); m.startStory(n); m.simOn(true);
  m.G.en.length = 0; m.G.eb.length = 0; if (window.FLEET) FLEET.reset(); m.P.hp = 50; m.P.x = 200; m.P.y = 270; m.SH.sh = 0; };
const S = (k, f) => { const m = window.__mnr; for (let i = 0; i < k; i++) { m.SH.sh = 0; if (m.SH.active) m.SH.close(); m.step(1 / 30); if (f && f(i) === false) return i; } return k; };

const SCHED = (FIRST) => {   // (a)
  const m = window.__mnr, F = window.FLEET, out = [], info = {};
  const p0 = F.p, b0 = F.busy;
  for (const id in FIRST) {
    let n = FIRST[id];
    SETUP(n - 1, 'normal'); if (F.unl(F.n()).includes(id)) out.push(`${id} unlocked at stage ${n - 1}`);
    SETUP(n, 'normal'); if (id === 'ecruiser') while (F.bossStage() && n < 40) { n++; SETUP(n, 'normal'); }
    if (!F.unl(F.n()).includes(id)) { out.push(`${id} not unlocked at stage ${n}`); continue; }
    F.p = () => 1; F.busy = () => false; let T = 0;
    while (m.running && T < 60 && !m.G.boss && !F.stat.kinds[id]) { m.P.hp = 99; m.P.inv = 1; m.P.y = 300 + 150 * Math.sin(T * 1.3); m.P.x = 200 + 80 * Math.sin(T * .7); S(1); T += 1 / 30; }
    info[id] = { n, T: +T.toFixed(1), kinds: Object.keys(F.stat.kinds) }; if (!F.stat.kinds[id]) out.push(`${id} never spawned on stage ${n} in ${T.toFixed(0)} s (kinds ${Object.keys(F.stat.kinds)})`);
    F.p = p0; F.busy = b0; m.abort();
  }
  // boss stage: no cruiser; a boss on screen sends a cruiser away
  let bs = 0; for (let n = 22; n <= 40; n++) { SETUP(n, 'normal'); if (F.bossStage()) { bs = n; break; } }
  if (bs) { if (F.unl(F.n()).includes('ecruiser')) out.push(`cruiser unlocked on boss stage ${bs}`); } else out.push('no boss stage found from 22 on');
  SETUP(30, 'normal'); const c = F.mk('ecruiser', { x: 700, y: 270 }); c.gr = 0; S(30); m.G.boss = { x: 900, y: 270, hp: 99, mini: 1 }; S(3); if (c.fs !== 2) out.push('cruiser did not leave when a boss arrived'); m.G.boss = null; m.abort();
  return { out, info };
};
const RAMP = (FIRST) => {   // (b)
  const m = window.__mnr, F = window.FLEET, out = [], rows = {};
  for (const df of ['easy', 'normal', 'hard']) { SETUP(30, df); rows[df] = {}; for (const id in FIRST) rows[df][id] = [0, 4, 8].map(a => F.group(id, FIRST[id] + a).length); m.abort(); }
  const want = { normal: { einterceptor: [1, 2, 3], ebomber: [1, 2, 3], ecarrier: [1, 1, 3], ecruiser: [1, 1, 3] } };
  for (const id in FIRST) { const g = rows.normal[id].join(','); if (g !== want.normal[id].join(',')) out.push(`normal ${id} groups ${g}, wanted ${want.normal[id]}`);
    for (let i = 0; i < 3; i++) { if (rows.easy[id][i] > rows.normal[id][i]) out.push(`easy ${id} tier ${i} bigger than normal`); if (rows.hard[id][i] < rows.normal[id][i]) out.push(`hard ${id} tier ${i} smaller than normal`); } }
  const ps = [5, 6, 16, 26, 40].map(n => F.p(n)); if (ps[0] !== 0 || Math.abs(ps[1] - .07) > 1e-9 || !(ps[2] > ps[1] && ps[3] > ps[2]) || ps[4] > .2400001) out.push('wave share ' + ps.map(x => x.toFixed(3)));
  return { out, rows, ps };
};
const TELE = () => {   // (c)
  const m = window.__mnr, F = window.FLEET, out = [], res = {}, ok = (c, s) => { if (!c) out.push(s); };
  const prep = () => { SETUP(30, 'normal'); m.P.x = 150; m.P.y = 270; m.P.inv = 0; m.P.hp = m.P.max; m.P.dq = 0; m.P.dashT = 0; };
  const quiet = () => { m.G.eb.length = 0; m.P.dashT = 0; };
  // interceptor: dive line, hurt on the line, safe off it
  for (const stay of [true, false]) { prep(); const e = F.mk('einterceptor', { x: 700, y: 270 }); e.gr = 0; e.tin = m.G.t - 5; e.fs = 1; e.sx = 700; e.sy = 270; e.h0 = m.G.t - 10; e.ph = 0; e.bf = 999;
    let t0 = 0, tl = -1, hp0 = m.P.hp;
    S(200, () => { quiet(); m.P.inv = 0; if (!t0 && e.fs === 2) { t0 = m.G.t; if (!stay) m.P.y = m.P.y > 270 ? 80 : 460; }
      if (t0 && tl < 0 && e.fs === 3) tl = m.G.t - t0; if (e.dead || e.hp <= 0) return false; if (stay && m.P.hp < hp0) return false; });
    ok(tl >= .6, `dive line shown ${tl.toFixed(2)} s (< .6)`); if (stay) { ok(m.P.hp < hp0, 'dive along the line did not hurt'); res.diveTele = +tl.toFixed(2); } else { ok(m.P.hp === hp0, 'dive hurt a ship off its line'); ok(F.stat.swerves >= 1, 'interceptor did not swerve'); } }
  // bomber: ring, hurt inside only
  for (const inside of [true, false]) { prep(); const e = F.mk('ebomber', { x: 700, y: 120 }); e.gr = 0; e.tin = m.G.t - 5; e.fs = 1; e.sx = 700; e.sy = 120; e.h0 = m.G.t; e.drops = 0; e.bc2 = 0;
    F.line(e); const bs = F.bombs.slice(), t0 = m.G.t; ok(bs.length === 4, `bomb line of ${bs.length}`);
    if (!inside) { let best = null; for (let x = 60; x < 900; x += 20) for (let y = 40; y < 500; y += 20) { const d = Math.min(...bs.map(b => Math.hypot(x - b.x, y - b.y))); if (d > bs[0].R + 30 && (!best || Math.hypot(x - 150, y - 270) < best.d)) best = { x, y, d: Math.hypot(x - 150, y - 270) }; } m.P.x = best.x; m.P.y = best.y; }
    else { m.P.x = bs[1].x; m.P.y = bs[1].y; }
    const hp0 = m.P.hp; let tb = -1; S(60, () => { quiet(); e.bc2 = 1; if (tb < 0 && !F.bombs.length) { tb = m.G.t - t0; return false; } });
    ok(tb >= .6, `bomb ring ${tb.toFixed(2)} s (< .6)`); res.bombTele = +tb.toFixed(2); if (inside) ok(m.P.hp < hp0, 'bomb did not hurt inside its ring'); else ok(m.P.hp === hp0, 'bomb hurt outside its ring'); }
  // cruiser: beam warning then a live beam that hurts on its line
  { prep(); const e = F.mk('ecruiser', { x: 760, y: 270 }); e.gr = 0; e.tin = m.G.t - 5; e.fs = 1; e.sx = 760; e.sy = 270; e.h0 = m.G.t; e.bf = 999; e.bm = { ph: 0, t: m.G.t, a: Math.PI, dir: 1 };
    m.P.x = 150; m.P.y = 60; let t0 = 0, tw = -1; S(90, () => { quiet(); e.bf = 999; if (!t0 && e.bm.ph === 1) t0 = m.G.t; if (t0 && e.bm.ph === 2) { tw = m.G.t - t0; return false; } });
    ok(tw >= .6, `beam warning ${tw.toFixed(2)} s (< .6)`); res.beamTele = +tw.toFixed(2);
    const hp0 = m.P.hp; let hurtB = false; S(6, () => { quiet(); e.bf = 999; const a = e.bm.a; m.P.x = e.x + Math.cos(a) * 200; m.P.y = e.y + Math.sin(a) * 200; m.P.inv = 0; if (m.P.hp < hp0) { hurtB = true; return false; } });
    ok(hurtB, 'live beam did not hurt on its line'); }
  m.abort(); return { out, res };
};
const CARRIER = () => {   // (d)
  const m = window.__mnr, F = window.FLEET, out = [], ok = (c, s) => { if (!c) out.push(s); };
  SETUP(30, 'normal'); m.P.x = 150; m.P.y = 270; const e = F.mk('ecarrier', { x: 1000, y: 270, nd: 3 });
  S(300, () => { m.P.hp = 99; m.G.eb.length = 0; if (e.fs === 1) return false; }); e.gr = 0; e.tin = m.G.t - 5;
  const kids = () => m.G.en.filter(q => q.par === e && q.hp > 0 && !q.dead);
  ok(e.fs === 1 && kids().length === 3 && e.fsh === 1, `carrier on station with 3 drones and shield (fs ${e.fs}, drones ${kids().length}, sh ${e.fsh})`);
  const shot = () => m.G.pb.push({ x: e.x - e.r - 30, y: e.y, vx: 900, vy: 0, dm: 2, pf: 0 });
  const hp0 = e.hp; for (let i = 0; i < 4; i++) { shot(); S(3, () => { m.P.hp = 99; m.G.eb.length = 0; }); }
  ok(e.hp === hp0 && F.stat.absorbed >= 3, `shield let damage through (hp ${e.hp}/${hp0}, absorbed ${F.stat.absorbed})`);
  for (const q of kids()) { q.tin = m.G.t - 5; q.gr = 0; q.hq = q.hp = 0; } S(3, () => { m.P.hp = 99; });
  ok(!e.fsh && F.stat.shDown === 1, 'shield did not drop when the drones died');
  shot(); S(3, () => { m.P.hp = 99; m.G.eb.length = 0; }); ok(e.hp < hp0, 'hull took no damage with the shield down');
  const l0 = F.stat.launches, b0 = m.G.bc; S(900, () => { m.P.hp = 99; m.G.eb.length = 0; e.hp = Math.max(e.hp, 1); if (F.stat.launches > l0) return false; });
  ok(F.stat.launches > l0 && m.G.bc - b0 >= 7, `no relaunch after the shield dropped (${m.G.bc - b0} beats)`);
  m.abort(); return { out };
};
const RUN = () => {   // (e) stage 30 with fleet waves forced, invulnerable dodging bot
  const m = window.__mnr, F = window.FLEET; SETUP(30, 'normal'); const p0 = F.p; F.p = () => .6; let T = 0, maxEb = 0; const kill = {};
  while (m.running && T < 90 && !m.G.boss) { m.P.hp = 99; m.P.inv = 1; m.P.y = 300 + 170 * Math.sin(T * 1.1); m.P.x = 180 + 90 * Math.sin(T * .6); S(1); T += 1 / 30; maxEb = Math.max(maxEb, m.G.eb.length); }
  F.p = p0; const s = JSON.parse(JSON.stringify(F.stat)); const dph = window.PAC ? PAC.dph : 1, u = (window.UPS && UPS.hp) || 1;
  const hits = {}; for (const id in F.K) { const e = F.mk(id, { x: 2000, y: 200 }); hits[id] = +(e.max / dph / u).toFixed(1); e.dead = 1; }
  m.abort(); return { s, T: Math.round(T), maxEb, hits };
};
const PLAY = () => {   // (f) seeded play, flag off vs no fleet.js
  const m = window.__mnr; SETUP(12, 'normal'); let T = 0; const log = [];
  while (m.running && T < 45) { m.P.hp = 99; m.P.y = 300 + 150 * Math.sin(T * 1.3); m.P.x = 220 + 80 * Math.sin(T * .7); S(1); T += 1 / 30; }
  const r = { spawns: m.G.spawns.length, sp: JSON.stringify(m.G.spawns).length, kills: m.G.kills, score: m.G.score, en: m.G.en.map(e => e.type).join(',') }; m.abort(); return r;
};

(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8'), i0 = html.indexOf('/* ---------- fleet.js:'), i1 = html.indexOf('/* ---------- ENDRAMP');
  const OLD = '__fleet_off_test.html'; if (i0 < 0 || i1 < i0) fails.push('fleet.js block not found in the build'); else fs.writeFileSync(path.join(GAME, OLD), html.slice(0, i0) + html.slice(i1));
  const br = await PW.chromium.launch(), url = (q, f) => `http://127.0.0.1:${port}/${f || 'index.html'}?sim=1&all=1&nomusic=1&mustmove=0${q || ''}`;
  const open = async (w, h, touch, q, f, seed) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    if (seed) await p.addInitScript(SEED);
    p.on('pageerror', e => fails.push(`page error @${w}x${h}${q || ''}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url(q, f));
    await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0 && window.ZOO && window.LEAK, null, { timeout: 20000 }).catch(() => fails.push('page did not start ' + (f || '') + (q || '')));
    await p.evaluate('window.SETUP=' + SETUP + ';window.S=' + S); return { ctx, p }; };
  const V = process.env.V;
  try {
    { const { ctx, p } = await open(1280, 720, false);
      const a = await p.evaluate(SCHED, FIRST); if (V) console.log('sched', JSON.stringify(a.info)); fails.push(...a.out);
      const b = await p.evaluate(RAMP, FIRST); if (V) console.log('ramp', JSON.stringify(b.rows), b.ps.map(x => x.toFixed(3)).join(' ')); fails.push(...b.out);
      const c = await p.evaluate(TELE); if (V) console.log('tele', JSON.stringify(c.res)); fails.push(...c.out);
      fails.push(...(await p.evaluate(CARRIER)).out);
      const r = await p.evaluate(RUN); if (V) console.log('run', JSON.stringify(r));
      const dw = [].concat(...Object.values(r.s.dwell)); if (dw.some(x => x < 4)) fails.push('a unit left after only ' + Math.min(...dw).toFixed(2) + ' s on screen ' + JSON.stringify(r.s.dwell));
      if (r.s.offFire) fails.push(r.s.offFire + ' shots asked for off screen'); if (r.maxEb > 35) fails.push(r.maxEb + ' enemy bullets at once');
      if (!r.s.waves.length) fails.push('no fleet wave in 90 s of stage 30');
      const band = { einterceptor: [2, 3], ebomber: [6, 9], ecarrier: [6, 9], ecruiser: [14, 18], efdrone: [1, 1] };
      for (const id in band) if (r.hits[id] < band[id][0] - .51 || r.hits[id] > band[id][1] + .51) fails.push(`${id} hull ${r.hits[id]} hits (band ${band[id]})`);
      console.log(`  stage 30 run: ${r.s.waves.length} fleet waves, kinds ${JSON.stringify(r.s.kinds)}, hits ${JSON.stringify(r.hits)}, max bullets ${r.maxEb}`);
      await ctx.close(); }
    { const { ctx, p } = await open(390, 763, true); const r = await p.evaluate(RUN); if (r.s.offFire) fails.push('phone: shots off screen'); if (r.maxEb > 18) fails.push('phone: ' + r.maxEb + ' bullets (> 18)'); fails.push(...(await p.evaluate(CARRIER)).out.map(x => 'phone: ' + x)); await ctx.close(); }
    if (i0 >= 0) { const a = await open(1280, 720, false, '&fleet=0', null, true), ra = await a.p.evaluate(PLAY); await a.ctx.close();
      const b = await open(1280, 720, false, '', OLD, true), rb = await b.p.evaluate(PLAY); await b.ctx.close();
      if (V) console.log('off', JSON.stringify(ra), '\nold', JSON.stringify(rb));
      if (JSON.stringify(ra) !== JSON.stringify(rb)) fails.push('?fleet=0 differs from the page without fleet.js: ' + JSON.stringify(ra) + ' vs ' + JSON.stringify(rb));
      const c = await open(1280, 720, false, '&fleet=0', null, true), rc = await c.p.evaluate(RUN); await c.ctx.close(); if (rc.s.waves.length) fails.push('?fleet=0 still made fleet waves'); }
  } catch (err) { fails.push('RUN ERROR ' + err.message); }
  try { fs.unlinkSync(path.join(GAME, OLD)); } catch (e) { }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 40).join('\n') : 'PASS fleet-test'); process.exit(fails.length ? 1 : 0);
})();
