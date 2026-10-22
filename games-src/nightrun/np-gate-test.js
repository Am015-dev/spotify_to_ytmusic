#!/usr/bin/env node
// NP-GATE (first30 layer, F11): a new player who gives no input must be alive at 45 s on stage 1 (first run), on both phones.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/np-gate-test.js     env: RUNS=6 GAME_DIR=... Q='&first30=0' (old behaviour)  Prints PASS / FAIL lines only.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 6, Q = process.env.Q || '';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(); let bad = 0;
  try {
    for (const [w, h] of [[390, 763], [375, 553]]) {
      const deaths = [], aimed = [];
      for (let r = 0; r < RUNS; r++) {
        const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }), p = await ctx.newPage();
        await p.route(/fonts\.(googleapis|gstatic)\.com/, x => x.abort());
        await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${Q}`, { waitUntil: 'domcontentloaded' });
        await p.waitForFunction(() => window.__mnr && document.getElementById('playBtn'), null, { timeout: 30000 }); await sleep(300);
        const out = await p.evaluate(({ seed }) => {
          const m = window.__mnr; m.startStory(1); m.simOn(true); let a = 0, i = 0, sd = seed;
          const rn = Math.random; Math.random = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
          let t15 = 0;
          const seen = new WeakSet(); let am = 0;
          while (m.running && m.G.t < 60 && !m.G.dead) { m.step(1 / 60); i++; if (i > 6000) break;
            for (const b of m.G.eb) { if (seen.has(b)) continue; seen.add(b); if (m.G.t < 15 && b.vx < 0) { const a = Math.atan2(b.vy, b.vx), d = Math.abs(((a - Math.atan2(m.P.y - b.y, m.P.x - b.x)) % 6.2832 + 9.4248) % 6.2832 - 3.1416); if (d < .3) am++; } } }
          Math.random = rn; return { dead: !!m.G.dead, t: +m.G.t.toFixed(1), hp: m.P.hp, am };
        }, { seed: r * 7919 + 5 });
        deaths.push(out.dead ? out.t : 99); aimed.push(out.am); await ctx.close();
      }
      const min = Math.min(...deaths), alive = deaths.filter(d => d >= 45).length;
      const am = aimed.reduce((a, b) => a + b, 0), pass = alive === RUNS && (am === 0 || /first30=0/.test(Q)); if (!pass) bad++;
      console.log((pass ? 'PASS ' : 'FAIL ') + `parked new player alive at 45 s ${w}x${h}: ${alive}/${RUNS} (death times ${deaths.join(',')}); aimed shots before 15 s: ${am}`);
    }
  } finally { await br.close(); srv.kill(); }
  process.exit(bad ? 1 : 0);
})();
