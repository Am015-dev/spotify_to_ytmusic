#!/usr/bin/env node
// Boss check through the real page: ?boss=<id> deep link into the LAB, every pose frame of every boss at 1366x768 and 390x763.
//  - sheet art: boss-sheet-check.py (no light matte, walkers' feet on one baseline)
//  - facing: boss stands right of the player, art face = left (config)
//  - ground bosses (landscape): body bottom within 3 px of the road line in every pose; water bosses: same line (a stomp-jump on the shot is allowed in AUTO)
//  - rendered: no big flat light rectangle in the boss region
//   NODE_PATH=$(npm root -g) node games-src/nightrun/boss-check.js      env: GAME_DIR=<dir with index.html>, ONLY=talos,hoplite
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const IDS = ['sek-adler', 'flusskrake', 'zentral-ice', 'kronos', 'tresor-wart', 'bruecken-waechter', 'schranken-wart', 'messe-waechter', 'hoplite', 'talos'];
(async () => {
  const fails = [], sc = cp.spawnSync('python3', [path.join(__dirname, 'boss-sheet-check.py')], { encoding: 'utf8' });
  console.log(sc.stdout.trim()); if (sc.status) fails.push('sheet art: ' + sc.stdout.trim().split('\n').length + ' problems');
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch();
  for (const [w, h] of [[1366, 768], [390, 763]]) for (const id of IDS) {
    if (ONLY.length && !ONLY.includes(id)) continue;
    const touch = w < 600, ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, userAgent: touch ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' : undefined });
    const p = await ctx.newPage(); p.on('pageerror', e => fails.push(`${id}@${w}: page error ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&boss=${id}`);
    try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.lab && __mnr.G.boss.x <= (__mnr.rotMode ? 690 : 790) + 1, null, { timeout: 20000 }); } catch (e) { fails.push(`${id}@${w}: LAB deep link did not open the boss`); await ctx.close(); continue; }
    await p.addStyleTag({ content: '#labP{display:none!important}' }); await sleep(900);
    const n = await p.$$eval('#labPoseR .lc', e => e.length);
    for (let i = 0; i < n; i++) {
      await p.evaluate(i => document.querySelectorAll('#labPoseR .lc')[i].click(), i); await sleep(260);
      const r = await p.evaluate(() => { const m = __mnr, e = m.G.boss, U = m.UIK, A = U.boss[m.ART.bossN[m.ART.artK(e)]]; return { nm: e.nm, mv: A.move, face: A.face, rot: m.rotMode, x: e.x, px: m.P.x, bot: e.y + (e._dh || 0) / 2, gy: U.groundY(), dh: e._dh || 0, hop: e.fireT > 0 && !e.labPose }; });
      const t = `${id}@${w} pose#${i}`;
      if (r.face !== 'left' || r.x <= r.px) fails.push(`${t}: not facing the player`);
      if (!r.rot && (r.mv === 'ground' || r.mv === 'water') && !r.hop && Math.abs(r.bot - r.gy) > 3) fails.push(`${t}: ${r.mv} boss ${(r.bot - r.gy).toFixed(1)} px off the road line`);
      if (i === 0 || i === n - 1) {   // rendered: a flat light rectangle behind the boss would be a matte
        const clip = await p.evaluate(() => { const f = document.getElementById('frame').getBoundingClientRect(), m = __mnr, e = m.G.boss, k = f.width / 960; if (m.rotMode) return null; return { x: Math.max(0, f.left + (e.x - 100) * k), y: Math.max(0, f.top + (e.y - 100) * k), width: 200 * k, height: 200 * k }; });
        if (clip) { const b64 = (await p.screenshot({ clip, type: 'png' })).toString('base64');
          const bad = await p.evaluate(async b => { const im = new Image(); im.src = 'data:image/png;base64,' + b; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let j = 0; j < d.length; j += 4) if (Math.min(d[j], d[j + 1], d[j + 2]) > 232 && Math.max(d[j], d[j + 1], d[j + 2]) - Math.min(d[j], d[j + 1], d[j + 2]) < 20) n++; return n / (c.width * c.height); }, b64);
          if (bad > 0.03) fails.push(`${t}: ${(bad * 100).toFixed(1)}% flat light pixels around the boss`); }
      }
    }
    await ctx.close();
  }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + fails.slice(0, 40).join('\n') : 'boss-check PASS (10 bosses x all poses x 2 sizes)'); process.exit(fails.length ? 1 : 0);
})();
