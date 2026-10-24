#!/usr/bin/env node
// SHOTS probe (W208, RET.shots): stage 1 stepped at game speed (no waits), 390x763 phone. Measures player-shot contrast/size, enemy-shot looks, enemy-under-player order.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/shots-probe.js     env: Q=?shots=0 (extra query), T=60 (game s), RUNS=3, SHOT=<png dir>, GAME_DIR
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const Q = process.env.Q || '', T = +process.env.T || 60, RUNS = +process.env.RUNS || 3, SHOT = process.env.SHOT || '', VP = (process.env.VP || '390x763').split('x').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const RUN = (o) => {
  const m = window.__mnr; let sd = o.seed >>> 0; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  m.god = true; m.startStory(1); m.simOn(true); const dt = 1 / 60, t0 = m.G.t; let i = 0, best = 0, bestI = 0;
  const looks = new Set(), kinds = {}, cv = document.querySelector('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
  const lum = (d, k) => (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255;
  const lin = v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
  const cr = (a, b) => { a = lin(a); b = lin(b); const h = Math.max(a, b), l = Math.min(a, b); return (h + .05) / (l + .05); };
  const RN = o.R, low = [], con = [], px = [], under = [], stat = { frames: 0, pbMax: 0, ebMax: 0 };
  while (m.running && m.G.t - t0 < o.t) {
    if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    m.step(dt); i++; const G = m.G; stat.pbMax = Math.max(stat.pbMax, G.pb.length); stat.ebMax = Math.max(stat.ebMax, G.eb.length);
    for (const b of G.eb) { const k = (b.et || '?') + '|' + (b.k || 'o'); kinds[k] = (kinds[k] || 0) + 1; }
    if (i % 30 === 0 && G.pb.length >= 6 && G.eb.length) {
      stat.frames++;
      if (window.SHOTS) SHOTS.reset();
      let bk = null, bw = 0; LGB.grab = c => { bw = c.canvas.width; bk = c.getImageData(0, 0, c.canvas.width, c.canvas.height).data; };   // legible.js hook: the backdrop alone, after the dim
      m.render(G.t, dt); LGB.grab = null;
      const L = window.SHOTS ? SHOTS.log() : { looks: [], pp: [], eUnderP: 0 }; for (const l of L.looks) looks.add(l); if (L.eUnderP) under.push(L.eUnderP);
      const c2 = SHOTS.cvs, x2 = c2.getContext('2d', { willReadFrequently: true });
      for (const [X0, Y0, w, wx, wy] of L.pp.slice(0, 60)) {
        if (Math.hypot(wx - m.P.x, wy - m.P.y) < 50) continue;   // still on the ship's nose: the ship is drawn over it
        const X = Math.round(X0), Y = Math.round(Y0); if (X < 30 || Y < 30 || X > c2.width - 30 || Y > c2.height - 30) continue; px.push(w);
        const d = x2.getImageData(X - 3, Y - 3, 7, 7).data; let c = 0; for (let q = 0; q < d.length; q += 4) c = Math.max(c, lum(d, q));
        const ring = [], R = RN; for (let a = 0; a < 8; a++) { const x = Math.round(X + R * Math.cos(a * .785)), y = Math.round(Y + R * Math.sin(a * .785)); if (bk && x >= 0 && y >= 0 && x < bw) ring.push(lum(bk, (y * bw + x) * 4)); }
        if (!ring.length) continue;
        ring.sort((a, b) => a - b); { const v = cr(c, ring[ring.length >> 1]); con.push(v); if (v < 3) low.push([+v.toFixed(2), +c.toFixed(2), +ring[ring.length >> 1].toFixed(2), Math.round(wx), Math.round(wy), +(Math.hypot(wx - m.P.x, wy - m.P.y)).toFixed(0)]); }
      }
      if (o.snap && G.t - t0 > 25 && G.eb.length >= o.snap && G.pb.length >= 12) break;
      if (G.eb.length > best) { best = G.eb.length; bestI = i; }
    }
  }
  con.sort((a, b) => a - b); px.sort((a, b) => a - b);
  return { i, ...stat, kinds, looks: [...looks], conN: con.length, conMed: con.length ? con[con.length >> 1] : 0, pxMin: px.length ? Math.round(px[0] * 10) / 10 : 0, pxMed: px.length ? Math.round(px[px.length >> 1] * 10) / 10 : 0, conP10: con.length ? con[Math.floor(con.length * .1)] : 0, under, low: low.slice(0, 6), nLow: low.length, t: m.G.t - t0 };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(); const errs = []; let bad = 0;
  for (let r = 0; r < RUNS; r++) {
    const ctx = await br.newContext({ viewport: { width: VP[0], height: VP[1] }, deviceScaleFactor: 1, hasTouch: VP[0] < 600, isMobile: VP[0] < 600 }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e).slice(0, 120))); await p.route(/fonts\./, x => x.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { }); await sleep(400);
    const res = await p.evaluate(RUN, { seed: 7 + r * 13, t: T, snap: +process.env.SNAP || 0, R: +process.env.R || 24 });
    console.log(JSON.stringify(res));
    if (SHOT && r === 0) { await p.evaluate(() => { const m = __mnr; m.god = true; }); await p.screenshot({ path: path.join(SHOT, `p${VP[0]}.png`) }); }
    await ctx.close();
  }
  console.log('errors', errs.length, errs.slice(0, 3)); await br.close(); srv.kill();
})();
