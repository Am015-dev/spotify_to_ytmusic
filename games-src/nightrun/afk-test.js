#!/usr/bin/env node
// Nightrun AFK test (desktop Chromium 1280x800, ?nomusic=1, real page, real time):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/afk-test.js     env: SECS=70 (cap per run) JSON=1 GAME_DIR=...
// A ship that NEVER moves, with a strong loadout (both weapon slots at LV5, top garage perks, pit-stop upgrades), must lose its hull
// within ~35 s on Normal and ~20 s on Hard, and score far less than a moving, dodging bot with the same loadout. The bot must survive (fair).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SECS = +process.env.SECS || 70, sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const LIMIT = { normal: 35, hard: 20 };
async function run(br, port, diff, mode) {
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tune', JSON.stringify({ dmg: 12, rof: 12, crt: 12, drn: 5, prc: 5, sdc: 4, hul: 2, shd: 1, mag: 5 })); localStorage.setItem('mnr_wp', JSON.stringify({ eq: ['pulse', 'swarm'] })); localStorage.setItem('mnr_wpseen', 'true'); } catch (e) { } });
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
  await p.evaluate(d => { const m = window.__mnr; m.SET.diff = d; m.SET.auto = true; m.applySet(); }, diff);
  await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 8000 });
  await p.evaluate(mode => {
    const m = window.__mnr, w = window.__wp; w.lvl('pulse', 5); w.lvl('swarm', 5);
    const g = m.SH.got; Object.assign(g, { hm: 5, pc: 4, sc: 3, rg: 2, dr: 3, fr: 5, rc: 3, dm: 5, cr: 5, bd: 3, dc: 3 }); m.SH.recalc();
    window.__log = []; const B = { up: 'ArrowUp', dn: 'ArrowDown', lf: 'ArrowLeft', rt: 'ArrowRight' };
    window.__stop = false; window.__bot = mode === 'bot';
    setInterval(() => { if (!m.G || !m.G.live) return; if (m.G.dead) { if (!window.__end) window.__end = { t: m.G.t, score: m.G.score }; return; }
      if (m.SH.active) { try { m.SH.skip && m.SH.skip(); } catch (e) { } }
      const P = m.P, K = m.K; for (const k of Object.values(B)) K[k] = false;
      if (!window.__bot) return;
      let fx = 0, fy = 0; for (const b of m.G.eb) { const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy); if (d < 150 && d > 1) { const w = (150 - d) / d / d * 150; fx += dx * w; fy += dy * w; } }
      for (const e of m.G.en) { const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy); if (e.type !== 'boss' && d < 130 && d > 1) { const w = (130 - d) / d / d * 150; fx += dx * w; fy += dy * w; } }
      fx += (200 - P.x) * .01; fy += (400 + 170 * Math.sin(m.G.t * .9) - P.y) * .02;   // sways about like a player does, and dodges
      if (fx > .3) K[B.rt] = true; else if (fx < -.3) K[B.lf] = true; if (fy > .3) K[B.dn] = true; else if (fy < -.3) K[B.up] = true;
    }, 30);
  }, mode);
  const t0 = Date.now(); let end = null, maxEb = 0, ebSum = 0, ebN = 0, x0 = null, moved = 0;
  while (Date.now() - t0 < SECS * 1000) {
    await sleep(250); const s = await p.evaluate(() => { const m = window.__mnr; return { e: window.__end || null, eb: m.G.eb.length, t: m.G.t, sc: m.G.score, x: m.P.x, y: m.P.y, hp: m.P.hp, run: m.running }; });
    if (x0 == null) x0 = [s.x, s.y]; else moved = Math.max(moved, Math.hypot(s.x - x0[0], s.y - x0[1]));
    maxEb = Math.max(maxEb, s.eb); ebSum += s.eb; ebN++; if (s.e) { end = s.e; break; } if (!s.run) break;
  }
  const last = await p.evaluate(() => { const m = window.__mnr; return { t: m.G.t, sc: m.G.score, hp: m.P.hp, di: m.G.di }; });
  await ctx.close();
  return { diff, mode, dead: !!end, surv: +(end ? end.t : last.t).toFixed(1), score: end ? end.score : last.sc, maxEb, avgEb: +(ebSum / Math.max(1, ebN)).toFixed(1), moved: Math.round(moved), errs };
}
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), res = [], fails = [];
  for (const [d, m] of [['normal', 'afk'], ['hard', 'afk'], ['normal', 'bot'], ['hard', 'bot']]) { const r = await run(br, port, d, m); res.push(r); console.log(JSON.stringify(r)); }
  const g = (d, m) => res.find(r => r.diff === d && r.mode === m);
  for (const d of ['normal', 'hard']) {
    const a = g(d, 'afk'), b = g(d, 'bot');
    if (!(a.dead && a.surv <= LIMIT[d])) fails.push(`${d}: AFK ship ${a.dead ? 'died only at' : 'still alive after'} ${a.surv}s (limit ${LIMIT[d]}s), score ${a.score}`);
    if (a.moved > 6) fails.push(`${d}: the AFK ship moved ${a.moved}px (test is not AFK)`);
    if (a.score > b.score * .5 && b.surv >= a.surv) fails.push(`${d}: AFK score ${a.score} is not far below the bot's ${b.score}`);
    if (!(b.surv >= Math.min(SECS - 2, 45) || b.dead === false)) fails.push(`${d}: the dodging bot died at ${b.surv}s (unfair)`);
  }
  for (const r of res) if (r.errs.length) fails.push(`${r.diff}/${r.mode} page errors: ${r.errs[0]}`);
  srv.kill(); console.log(fails.length ? 'FAIL\n  ' + fails.join('\n  ') : 'PASS'); process.exit(fails.length ? 1 : 0);
})();
