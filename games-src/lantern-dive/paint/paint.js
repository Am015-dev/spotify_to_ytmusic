// Lantern Dive art generator: authors layered SVG paintings (brush.js, items.js, scenes.js), rasterises them in Chromium
// and writes WebP files + manifest.json into ../art/. Re-runnable; same seeds give the same pictures.
//   node paint.js                 every item
//   node paint.js emb0,back    only these ids
//   node paint.js --sheet         also write a contact sheet to ../game/shots/art/sheet.png
// Needs Playwright (PW env var, NODE_PATH, or the games-src node_modules) and Chromium at /opt/pw-browsers/chromium.
'use strict';
const fs = require('fs'), path = require('path');
function req(n) { try { return require(n); } catch (e) { } if (process.env.PW) return require(process.env.PW); try { return require(path.join(__dirname, '..', '..', 'node_modules', n)); } catch (e) { } return require(require('child_process').execSync('npm root -g').toString().trim() + '/' + n); }
const { chromium } = req('playwright');
const B = require('./brush.js'), I = require('./items.js'), S = require('./scenes.js');
const OUT = path.join(__dirname, '..', 'art'); fs.mkdirSync(OUT, { recursive: true });
const SHOTS = path.join(__dirname, '..', 'game', 'shots', 'art');
// id -> { file name the user may drop in (ART-PROMPTS.md), output size, svg builder, webp quality }
const Q = .8;
const ITEMS = {};
const EM = [['emb0', 'coral', 11], ['emb1', 'tide', 21], ['emb2', 'kelp', 31], ['emb3', 'star', 41], ['emb4', 'lantern', 51]];
EM.forEach(([id, k, seed]) => ITEMS[id] = { file: id, w: 320, h: 320, vb: [512, 512], q: Q, svg: () => I.EMB[k](seed) });
ITEMS.back = { file: 'back', w: 320, h: 448, vb: [512, 717], q: .78, svg: () => I.back(61) };
ITEMS.ping = { file: 'ping', w: 192, h: 192, vb: [512, 512], q: .8, svg: () => I.ping(71) };
ITEMS.flare = { file: 'flare', w: 192, h: 192, vb: [512, 512], q: .8, svg: () => I.flare(73) };
ITEMS.cmd = { file: 'cmd', w: 192, h: 192, vb: [512, 512], q: .8, svg: () => I.cmd(75) };
ITEMS.drone = { file: 'drone', w: 256, h: 256, vb: [512, 512], q: .8, svg: () => I.drone(77) };
for (let i = 0; i < 5; i++) ITEMS['diver' + i] = { file: 'diver' + i, w: 256, h: 256, vb: [512, 512], q: .8, svg: () => S.diver(i, 81 + i * 9) };
ITEMS.table = { file: 'table', w: 1280, h: 720, vb: [1280, 720], q: .6, svg: () => S.table(91), opaque: true };
ITEMS.title = { file: 'title', w: 1440, h: 810, vb: [1600, 900], q: .66, svg: imgs => S.title(101, imgs), opaque: true, after: ['emb0', 'emb1', 'emb2', 'emb3', 'emb4'] };

function doc(id, it, imgs) {
  const [vw, vh] = it.vb; const inner = it.svg(imgs || {});
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${it.w + (it.ov || 0)}" height="${it.h}" viewBox="0 0 ${vw} ${vh}">${B.filters(7 + id.length * 13, { ink: '#0b2038' })}<g filter="url(#paper)">${inner}</g></svg>`;
}
(async () => {
  const want = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2].split(',') : Object.keys(ITEMS);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ deviceScaleFactor: 2 });
  const man = fs.existsSync(path.join(OUT, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8')) : { note: '', items: {} };
  const cache = {};   // id -> data URI (PNG) for scenes that reuse other items
  const ids = want.slice(); for (const id of want) for (const d of (ITEMS[id] && ITEMS[id].after) || []) if (!ids.includes(d)) ids.unshift(d);
  for (const id of ids) {
    const it = ITEMS[id]; if (!it) { console.log('unknown', id); continue; }
    const t0 = Date.now();
    const svg = doc(id, it, cache);
    const RW = it.w + (it.ov || 0); await pg.setViewportSize({ width: RW, height: it.h });
    await pg.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await pg.waitForTimeout(50);
    const png = await pg.screenshot({ omitBackground: !it.opaque, clip: { x: 0, y: 0, width: RW, height: it.h } });
    cache[id] = 'data:image/png;base64,' + png.toString('base64');
    // 2x render -> downscale with high-quality smoothing -> WebP
    const webp = await pg.evaluate(async ([src, w, h, q, ov]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; const k = im.naturalWidth / (w + ov); x.drawImage(im, 0, 0, w + ov, h);
      if (ov) { // seamless tile: cross-fade the overlap onto the start
        const t = document.createElement('canvas'); t.width = ov; t.height = h; const y = t.getContext('2d'); y.imageSmoothingQuality = 'high'; y.drawImage(im, w * k, 0, ov * k, im.naturalHeight, 0, 0, ov, h); y.globalCompositeOperation = 'destination-in'; const g = y.createLinearGradient(0, 0, ov, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); y.fillStyle = g; y.fillRect(0, 0, ov, h); x.drawImage(t, 0, 0); }
      return c.toDataURL('image/webp', q); }, [cache[id], it.w, it.h, it.q, it.ov || 0]);
    const buf = Buffer.from(webp.split(',')[1], 'base64');
    if (want.includes(id)) { fs.writeFileSync(path.join(OUT, it.file + '.webp'), buf); man.items[id] = it.file; console.log(id.padEnd(14), it.w + 'x' + it.h, (buf.length / 1024).toFixed(1) + ' KB', (Date.now() - t0) + ' ms'); }
  }
  man.note = 'id -> base file name in this folder. build.py embeds <name>.png if present (a user painting, resized to the size below), else <name>.webp (made by ../paint/paint.js).';
  man.size = Object.fromEntries(Object.entries(ITEMS).map(([k, v]) => [k, [v.w, v.h]]));
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(man, null, 1));
  if (process.argv.includes('--sheet')) {
    fs.mkdirSync(SHOTS, { recursive: true });
    const files = Object.entries(man.items).map(([k, v]) => [k, path.join(OUT, v + '.webp')]).filter(x => fs.existsSync(x[1]));
    const cells = files.map(([k, f]) => `<figure style="margin:6px;display:inline-block;text-align:center;font:12px sans-serif"><img src="data:image/webp;base64,${fs.readFileSync(f).toString('base64')}" style="max-width:${k === 'title' ? 720 : k === 'belt' || k === 'counter' ? 512 : 192}px;background:#31527a"><figcaption>${k}</figcaption></figure>`).join('');
    const small = files.filter(([k]) => ITEMS[k].w <= 320 && ITEMS[k].h <= 448).map(([k, f]) => `<img src="data:image/webp;base64,${fs.readFileSync(f).toString('base64')}" style="width:70px;margin:3px;background:#31527a">`).join('');
    await pg.setViewportSize({ width: 1500, height: 900 }); const p2 = await b.newPage({ deviceScaleFactor: 1 }); await p2.setViewportSize({ width: 1500, height: 900 });
    await p2.setContent(`<body style="margin:0;background:#1b2f4d">${cells}<div>${small}</div></body>`); await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(SHOTS, 'sheet.png'), fullPage: true }); console.log('sheet', path.join(SHOTS, 'sheet.png'));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
