#!/usr/bin/env node
// Nightrun HUD coverage test (scenario nr-hud-busy = the worst-case phone moment). Fast: ~1 min.
//   NR_OUT=/tmp/nr.html python3 games-src/nightrun/parts/build.py && NODE_PATH=/opt/node-tools/node_modules node games-src/nightrun/hud-cover-test.js /tmp/nr.html
//   env: SHOTS=dir (screenshots: hud on, and hud-diff mask)   VP=390x763 (one size)
// For each phone size (390x763, 375x553 portrait) it opens ?scn=nr-hud-busy, freezes the frame, renders it with and without the HUD and diffs the pixels:
//   coverage   boxes round the HUD pixels (12 px apart = one box) cover <= 20% of the playfield
//   band       no HUD pixel in the middle 60% of the height, except a 50 px disc round the ship
//   edges      no HUD text runs off the left or right edge; every HUD text is >= 11 css px
//   dom        no FPS counter on a phone (without ?test=1); touch buttons >= 44 px
// Landscape phone (844x390) and PC (1366x768) only get "no page error + HUD text >= 11 px / inside the screen" so they cannot regress silently.
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const gx = require('../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || '/tmp/nr.html'), SHOTS = process.env.SHOTS;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const VPS = [[390, 763, 1, 'phone'], [375, 553, 1, 'phone'], [844, 390, 1, 'land'], [1366, 768, 0, 'pc']].filter(v => !process.env.VP || process.env.VP === v[0] + 'x' + v[1]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function inPage(mode) {   // runs in the page: freeze, render twice, diff
  const m = window.__mnr, cv = document.getElementById('cv') || document.querySelector('canvas');
  m.simOn(true); m.G.banner.t = 0; m.G.hint.t = 0; m.G.shake = 0; m.G.glitch = 0; m.G.flash = 0;
  const g = cv.getContext('2d'), w = cv.width, h = cv.height, r = cv.getBoundingClientRect(), cssK = r.width / w;
  const texts = [], proto = CanvasRenderingContext2D.prototype, ft = proto.fillText;
  proto.fillText = function (txt, x, y) {
    try { const t = this.getTransform(), px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)[1]) * Math.hypot(t.a, t.b) * cssK, tw = this.measureText(String(txt)).width * Math.hypot(t.a, t.b) * cssK;
      const cx = (t.a * x + t.c * y + t.e) * cssK, cy = (t.b * x + t.d * y + t.f) * cssK;
      const al = this.textAlign, x0 = al === 'right' || al === 'end' ? cx - tw : al === 'center' ? cx - tw / 2 : cx;
      if (window.__hudRec) texts.push({ t: String(txt), x0, x1: x0 + tw, y: cy, px }); } catch (e) { }
    return ft.apply(this, arguments);
  };
  const snap = (off) => { m.hudOff = off; window.__hudRec = !off; m.render(m.G.t, 0); return g.getImageData(0, 0, w, h).data.slice(); };
  const a = snap(false), b = snap(true); m.hudOff = false; window.__hudRec = false; proto.fillText = ft;
  const CELL = 6, cx = Math.ceil(w / CELL), cy = Math.ceil(h / CELL), mask = new Uint8Array(cx * cy);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) mask[((y / CELL) | 0) * cx + ((x / CELL) | 0)] = 1; }
  // ship position on screen (css px relative to the canvas)
  const sx = m.P.y * (r.width / m.G && 1), shipCss = mode === 'port' ? { x: m.P.y / 540 * r.width, y: (960 - m.P.x) / 960 * r.height } : { x: m.P.x / 960 * r.width, y: m.P.y / 540 * r.height };
  // connected boxes (cells within 2 cells = 12 px of each other merge)
  const seen = new Uint8Array(cx * cy), boxes = [];
  for (let i = 0; i < mask.length; i++) { if (!mask[i] || seen[i]) continue; let q = [i], bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1; seen[i] = 1;
    while (q.length) { const c = q.pop(), X = c % cx, Y = (c / cx) | 0; bx0 = Math.min(bx0, X); bx1 = Math.max(bx1, X); by0 = Math.min(by0, Y); by1 = Math.max(by1, Y);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X2 = X + dx, Y2 = Y + dy; if (X2 < 0 || Y2 < 0 || X2 >= cx || Y2 >= cy) continue; const j = Y2 * cx + X2; if (mask[j] && !seen[j]) { seen[j] = 1; q.push(j); } } }
    boxes.push([bx0 * CELL * cssK, by0 * CELL * cssK, (bx1 + 1) * CELL * cssK, (by1 + 1) * CELL * cssK]); }
  const cov = new Uint8Array(cx * cy); for (const bx of boxes) for (let Y = Math.floor(bx[1] / cssK / CELL); Y < Math.ceil(bx[3] / cssK / CELL); Y++) for (let X = Math.floor(bx[0] / cssK / CELL); X < Math.ceil(bx[2] / cssK / CELL); X++) cov[Y * cx + X] = 1;
  let covN = 0; for (let i = 0; i < cov.length; i++) covN += cov[i];
  // middle band: HUD cells in 20%..80% of the height, outside a 50 px disc round the ship
  let band = 0; const y0 = r.height * .2, y1 = r.height * .8;
  for (let Y = 0; Y < cy; Y++) for (let X = 0; X < cx; X++) { if (!mask[Y * cx + X]) continue; const px = (X + .5) * CELL * cssK, py = (Y + .5) * CELL * cssK; if (py < y0 || py > y1) continue; if (Math.hypot(px - shipCss.x, py - shipCss.y) < 50) continue; band++; }
  const bad = [], vw = innerWidth;
  for (const t of texts) { const ax = r.left + t.x0, bx = r.left + t.x1; if (ax < 0 || bx > vw) bad.push('cut-off "' + t.t + '"'); if (t.px < 10.9 && /\S/.test(t.t)) bad.push('small ' + t.px.toFixed(1) + 'px "' + t.t + '"'); }
  const fps = document.getElementById('fpsEl'), fpsVisible = !!fps && !fps.hidden && getComputedStyle(fps).display !== 'none';
  const btns = ['bDash', 'bEmp', 'bPause'].map(id => { const e = document.getElementById(id), b = e && e.getBoundingClientRect(); return b ? { id, w: Math.round(b.width), h: Math.round(b.height), vis: b.width > 0 } : null; }).filter(Boolean);
  const dash = document.getElementById('bDash'), emp = document.getElementById('bEmp');
  return { cov: covN / (cx * cy), band, bandCells: band, boxes: boxes.length, bad, fpsVisible, btns, hudText: texts.length, scroll: document.documentElement.scrollWidth > innerWidth + 1,
    rings: !!dash && !!emp && getComputedStyle(dash, '::after').content !== 'none' && getComputedStyle(emp, '::after').content !== 'none', frame: [r.width, r.height], mask: Array.from(mask), cx, cy, rp: 540 };
}

(async () => {
  const url = await gx.url('mainhattan-nightrun', { file: FILE, query: '?scn=nr-hud-busy' });
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); let fails = 0; const rows = [];
  for (const [W, H, touch, kind] of VPS) {
    const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: !!touch, isMobile: !!touch, userAgent: touch ? UA : undefined });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); } catch (e) { } });
    await p.goto(url, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.__mnr.running && window.__mnr.G.boss, null, { timeout: 25000 }).catch(() => errs.push('scenario did not start'));
    await sleep(4500);                                     // let the boss arrive and the boss warning banner go
    const mode = kind === 'phone' ? 'port' : 'land'; const sizeFail = [];
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `hud-${W}x${H}.png`) }); }
    const r = await p.evaluate(inPage, await p.evaluate(() => (window.__mnr.rotMode ? 'port' : 'land')));
    if (errs.length) sizeFail.push('page errors: ' + errs.slice(0, 2).join(' | '));
    if (kind === 'phone') {
      if (r.cov > .20) sizeFail.push(`HUD covers ${(r.cov * 100).toFixed(1)}% of the playfield (max 20%)`);
      if (r.band > 0) sizeFail.push(`${r.band} HUD cells (${r.band * 36} px2*) in the middle 60% band`);
      if (r.fpsVisible) sizeFail.push('FPS counter visible on a phone');
      if (!r.rings) sizeFail.push('no charge rings on the DASH / EMP buttons');
      for (const b of r.btns) if (b.vis && (b.w < 44 || b.h < 44)) sizeFail.push(`touch button ${b.id} ${b.w}x${b.h} < 44`);
    }
    for (const b of r.bad) sizeFail.push(b);
    if (r.scroll) sizeFail.push('horizontal scroll');
    rows.push(`${W}x${H} ${kind.padEnd(5)} coverage ${(r.cov * 100).toFixed(1).padStart(5)}%  band-cells ${String(r.band).padStart(4)}  hud-texts ${r.hudText}  ${sizeFail.length ? 'FAIL: ' + sizeFail.join('; ') : 'ok'}`);
    if (SHOTS && kind === 'phone') { // mask picture: white = HUD pixel
      const mk = r.mask, cx = r.cx, cy = r.cy; await p.evaluate(([mk, cx, cy]) => { const c = document.createElement('canvas'); c.width = cx; c.height = cy; c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;image-rendering:pixelated;background:#000'; const g = c.getContext('2d'); const d = g.createImageData(cx, cy); for (let i = 0; i < mk.length; i++) { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = mk[i] ? 255 : 0; d.data[i * 4 + 3] = 255; } g.putImageData(d, 0, 0); document.body.appendChild(c); }, [mk, cx, cy]); await p.screenshot({ path: path.join(SHOTS, `mask-${W}x${H}.png`) }); }
    fails += sizeFail.length ? 1 : 0; await ctx.close();
  }
  await br.close(); console.log(rows.join('\n')); console.log(fails ? `HUD-COVER FAIL (${fails} size(s))` : 'HUD-COVER PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
