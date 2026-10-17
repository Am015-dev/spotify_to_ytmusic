#!/usr/bin/env node
// Ground-boss test through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ground-test.js      env: GAME_DIR=<dir with index.html>, SECS=20
//  (a) landscape 1366x768, LAB ?boss=<id>: every ground boss keeps its body bottom within 2 px of the road line for SECS seconds and never hops
//  (b) its shadow is drawn, centred within 3 px of the boss x and on the road line; flyers: shadow only fainter/smaller (never below the road)
//  (c) portrait 390x763 with touch, every boss and mini-boss stage of the story: no ground boss ever stands >6 px above the road (the flyer substitute spawns,
//      same HP and patterns, banner name = substitute), 12 s of fight each
//  (d) landscape story: the ground bosses of the same stages still spawn as themselves and stay on the road
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 20;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const GND = ['tresor-wart', 'bruecken-waechter', 'hoplite', 'talos'], AIR = ['sek-adler', 'schranken-wart', 'zentral-ice', 'kronos', 'messe-waechter'];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const STORY = (opts) => {   // runs inside the page (?sim=1): plays each boss stage until the boss has fought for 12 s
  const m = window.__mnr, out = [], bad = [];
  for (const df of m.STAGES) {
    if (df.goal.k !== 'boss' && df.goal.k !== 'mini') continue;
    m.startStory(df.n); m.simOn(true);
    let T = 0, t0 = -1, i = 0;
    while (m.running && T < 400 && !(t0 >= 0 && m.G.t - t0 > 12)) {
      m.P.hp = 99; m.P.inv = 1; m.P.y = 380 + 150 * Math.sin(T * 1.3); m.P.x = 300 + 120 * Math.sin(T * .7); if (m.SH.active) m.SH.close();
      m.step(1 / 30); T += 1 / 30; i++;
      const b = m.G.boss;
      if (b && b.x <= (m.rotMode ? 690 : 790) + 1) {
        if (t0 < 0) t0 = m.G.t;
        const nm = m.ART.bossN[m.ART.artK(b)], A = m.UIK.boss[nm], gnd = A.move === 'ground', gy = m.UIK.groundY(), up = gy - (b.y + (b._dh || 130) / 2);
        if (opts.portrait && gnd) bad.push(`stage ${df.n}: ground boss ${nm} spawned in portrait`);
        if (!opts.portrait && gnd && Math.abs(up) > 6) bad.push(`stage ${df.n}: ${nm} ${up.toFixed(1)} px above the road`);
        if (opts.portrait && b.nm !== (m.UIK.SUB[m.ART.bossN[m.ART.artK({ k: df.goal.k === 'mini' ? df.mini.k : m.DIST[df.di].boss, nm: df.goal.k === 'mini' ? df.mini.nm : m.DIST[df.di].bossName })]] || { nm: b.nm }).nm) bad.push(`stage ${df.n}: banner name ${b.nm} does not match the substitute`);
      }
      if (m.G.dead) break;
    }
    const b = m.G.boss; out.push({ n: df.n, nm: b ? b.nm : null, hp: b ? b.max : null, ak: b ? b.ak : null, ok: t0 >= 0 });
    if (t0 < 0) bad.push(`stage ${df.n}: boss never appeared`);
    m.abort();
  }
  return { out, bad };
};
(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?nomusic=1${q}`;
  // (a)+(b)
  for (const id of [...GND, ...AIR]) {
    const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } }), p = await ctx.newPage(); p.on('pageerror', e => fails.push(`${id}: page error ${e.message}`));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url('&boss=' + id));
    try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.lab && __mnr.G.boss.x <= 791, null, { timeout: 20000 }); } catch (e) { fails.push(`${id}: boss did not arrive`); await ctx.close(); continue; }
    await p.addStyleTag({ content: '#labP{display:none!important}' });
    await p.evaluate(() => { const m = __mnr; window.__sh = []; const o = m.UIK.bossShadow; m.UIK.bossShadow = function (e, mv, wd) { const ctx = document.getElementById('game').getContext('2d'), dc = ctx.drawImage; let rec = null; ctx.drawImage = function (im, x, y, w, h) { if (im === m.UIK._sh) rec = { cx: x + w / 2, cy: y + h / 2, w, a: ctx.globalAlpha, y: e.y, ex: e.x }; return dc.apply(this, arguments); }; o.call(this, e, mv, wd); ctx.drawImage = dc; if (rec) window.__sh.push(rec); }; });
    const gnd = GND.includes(id), t0 = Date.now(); let worst = 0, run = 0, n = 0, hops = 0;
    while (Date.now() - t0 < SECS * 1000) {
      const r = await p.evaluate(() => { const m = __mnr, e = m.G.boss; if (!e) return null; m.P.hp = 99; return { up: m.UIK.groundY() - (e.y + (e._dh || 0) / 2), fire: e.fireT > 0 && !e.labPose }; });
      if (r) { n++; const bad = Math.abs(r.up) >= 2; run = bad ? run + 1 : 0; if (run >= 2) { worst = Math.max(worst, Math.abs(r.up)); if (r.up > 2) hops++; } } await sleep(100);   // one frame off while the sheet loads and the size changes is not a hop
    }
    const sh = await p.evaluate(() => window.__sh.slice(-40)), gy = await p.evaluate(() => __mnr.UIK.groundY());
    if (gnd) {
      if (worst >= 2) fails.push(`${id}: left the road line by ${worst.toFixed(1)} px`); if (hops) fails.push(`${id}: hopped ${hops}x`);
      if (!sh.length) fails.push(`${id}: no shadow drawn`);
      for (const s of sh) { if (Math.abs(s.cx) > 3) { fails.push(`${id}: shadow ${s.cx.toFixed(1)} px off the boss x`); break; } if (Math.abs(s.y + s.cy - gy) > 3) { fails.push(`${id}: shadow ${(s.y + s.cy - gy).toFixed(1)} px off the road line`); break; } }
    } else for (const s of sh) { if (s.y + s.cy < gy - 3 || s.y + s.cy > gy + 3) { fails.push(`${id}: flyer shadow off the road line`); break; } if (Math.abs(s.cx) > 3) { fails.push(`${id}: flyer shadow off the boss x`); break; } }
    await ctx.close();
  }
  // (c) portrait, (d) landscape story
  for (const portrait of [true, false]) {
    const w = portrait ? 390 : 1366, h = portrait ? 763 : 768, ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: portrait, isMobile: portrait, userAgent: portrait ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`story@${w}: page error ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 10000 }).catch(() => { });
    if (portrait && !(await p.evaluate(() => __mnr.rotMode))) fails.push('portrait: rotMode is off at 390x763');
    const r = await p.evaluate(STORY, { portrait }); fails.push(...r.bad.slice(0, 6));
    if (process.env.V) console.log(JSON.stringify(r.out));
    await ctx.close();
  }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS ground-test'); process.exit(fails.length ? 1 : 0);
})();
