// Final Approach art generator: authors layered SVG paintings (brush.js, items.js, scenes.js), rasterises them in Chromium and writes
// WebP files + manifest.json into ../art/. Re-runnable; the same seeds give the same pictures.
//   node paint.js                 every item
//   node paint.js dice,dial       only these ids
//   node paint.js --sheet         also write a contact sheet to ../game/shots/art/sheet.png
// Needs Playwright (PW env var, NODE_PATH, or the games-src node_modules) and Chromium at /opt/pw-browsers/chromium.
'use strict';
const fs = require('fs'), path = require('path');
function req(n) { try { return require(n); } catch (e) { } if (process.env.PW) return require(process.env.PW); try { return require(path.join(__dirname, '..', '..', 'node_modules', n)); } catch (e) { } return require(require('child_process').execSync('npm root -g').toString().trim() + '/' + n); }
const { chromium } = req('playwright');
const B = require('./brush.js'), I = require('./items.js');
let S = {}; try { S = require('./scenes.js'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const OUT = path.join(__dirname, '..', 'art'); fs.mkdirSync(OUT, { recursive: true });
const SHOTS = path.join(__dirname, '..', 'game', 'shots', 'art');
const ITEMS = {};
// a sheet: cells laid out on a grid, each cell is an SVG fragment drawn in its own cw x ch box
const sheet = (cw, ch, cols, cells) => cells.map((c, i) => `<g transform="translate(${(i % cols) * cw} ${Math.floor(i / cols) * ch})">${c}</g>`).join('');
const add = (id, file, w, h, vb, svg, q, extra) => ITEMS[id] = Object.assign({ file, w, h, vb: vb || [w, h], q: q || .8, svg }, extra || {});
// atlases: cell geometry is also written into the manifest (the page reads it from there)
const diceCells = [];
for (let v = 1; v <= 6; v++) diceCells.push(I.dieBlue(v, 10 + v));
for (let v = 1; v <= 6; v++) diceCells.push(I.dieOrange(v, 30 + v));
[2, 3, 4, 5].forEach(v => diceCells.push(I.dieBlack(v, 50 + v))); diceCells.push(I.dieBack(I.BLUE, 61), I.dieBack(I.ORANGE, 62));
for (let v = 1; v <= 6; v++) diceCells.push(I.chit(v, 70 + v));
add('dice', 'dice', 768, 512, null, () => sheet(128, 128, 6, diceCells), .82, { atlas: { cw: 128, ch: 128, cols: 6, names: [...[1, 2, 3, 4, 5, 6].map(v => 'b' + v), ...[1, 2, 3, 4, 5, 6].map(v => 'o' + v), 'k2', 'k3', 'k4', 'k5', 'bb', 'ob', ...[1, 2, 3, 4, 5, 6].map(v => 't' + v)] } });
const tokCells = [I.coffee(81), I.reroll(82), I.planeToken(83), I.youMarker(84), I.sw(false, 85), I.sw(true, 86), I.marker('#3d86e6', 87), I.marker('#f08a24', 88), I.brakeMarker(89), I.marker('#33b6a5', 90, 'drop'), I.windArrow(91), '', I.well(I.BLUE, 92), I.well(I.ORANGE, 93), I.well('#7d8fa3', 94), I.bezelRound(95)];
add('tokens', 'tokens', 512, 512, null, () => sheet(128, 128, 4, tokCells), .82, { atlas: { cw: 128, ch: 128, cols: 4, names: ['coffee', 'reroll', 'plane', 'you', 'swoff', 'swon', 'blue', 'orange', 'brake', 'drop', 'wind', 'spare', 'wellB', 'wellO', 'wellN', 'bezel'] } });
const iconNames = Object.keys(I.ICON);
const iconCells = iconNames.map((n, i) => I.icon(n, ['axis', 'gear', 'brakes', 'radio'].includes(n) ? '#2f6fd0' : (['flaps'].includes(n) ? '#e8821f' : '#46556a')));
add('icons', 'icons', 768, 192, null, () => sheet(96, 96, 8, iconCells), .8, { atlas: { cw: 96, ch: 96, cols: 8, names: iconNames } });
add('dial', 'dial', 320, 320, null, () => I.dial(101), .8);
add('planefront', 'planefront', 320, 140, null, () => I.planeFront(111), .8);
add('gauge', 'gauge', 480, 260, null, () => I.gauge(121), .78);
add('pillbar', 'pillbar', 256, 48, null, () => I.pillBar(131), .8);
if (S.register) S.register(add, sheet, ITEMS);

function doc(id, it, imgs) {
  const [vw, vh] = it.vb; const inner = it.svg(imgs || {});
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${it.w + (it.ov || 0)}" height="${it.h}" viewBox="0 0 ${vw} ${vh}">${B.filters(7 + id.length * 13)}<g filter="url(#paper)">${inner}</g></svg>`;
}
(async () => {
  const want = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2].split(',') : Object.keys(ITEMS);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ deviceScaleFactor: 2 });
  const man = fs.existsSync(path.join(OUT, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8')) : { note: '', items: {}, size: {}, atlas: {} };
  const cache = {};
  const ids = want.slice(); for (const id of want) for (const d of (ITEMS[id] && ITEMS[id].after) || []) if (!ids.includes(d)) ids.unshift(d);
  for (const id of ids) {
    const it = ITEMS[id]; if (!it) { console.log('unknown', id); continue; }
    const t0 = Date.now(); const svg = doc(id, it, cache);
    const RW = it.w + (it.ov || 0); await pg.setViewportSize({ width: RW, height: it.h });
    await pg.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await pg.waitForTimeout(60);
    const png = await pg.screenshot({ omitBackground: !it.opaque, clip: { x: 0, y: 0, width: RW, height: it.h } });
    cache[id] = 'data:image/png;base64,' + png.toString('base64');
    const webp = await pg.evaluate(async ([src, w, h, q, ov]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w + ov, h);
      if (ov) { const k = im.naturalWidth / (w + ov); const t = document.createElement('canvas'); t.width = ov; t.height = h; const y = t.getContext('2d'); y.imageSmoothingQuality = 'high'; y.drawImage(im, w * k, 0, ov * k, im.naturalHeight, 0, 0, ov, h); y.globalCompositeOperation = 'destination-in'; const g = y.createLinearGradient(0, 0, ov, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); y.fillStyle = g; y.fillRect(0, 0, ov, h); x.drawImage(t, 0, 0); }
      return c.toDataURL('image/webp', q); }, [cache[id], it.w, it.h, it.q, it.ov || 0]);
    const buf = Buffer.from(webp.split(',')[1], 'base64');
    if (want.includes(id)) { fs.writeFileSync(path.join(OUT, it.file + '.webp'), buf); man.items[id] = it.file; if (it.atlas) man.atlas[id] = it.atlas; console.log(id.padEnd(14), it.w + 'x' + it.h, (buf.length / 1024).toFixed(1) + ' KB', (Date.now() - t0) + ' ms'); }
  }
  man.note = 'id -> base file name in this folder. build.py embeds <name>.png if present (a user painting, resized to the size below), else <name>.webp (made by ../paint/paint.js). Atlases (dice, tokens, icons) keep the grid listed under "atlas".';
  man.size = Object.fromEntries(Object.entries(ITEMS).map(([k, v]) => [k, [v.w, v.h]]));
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(man, null, 1));
  if (process.argv.includes('--sheet')) {
    fs.mkdirSync(SHOTS, { recursive: true });
    const files = Object.entries(man.items).map(([k, v]) => [k, path.join(OUT, v + '.webp')]).filter(x => fs.existsSync(x[1]));
    const cells = files.map(([k, f]) => `<figure style="margin:6px;display:inline-block;text-align:center;font:12px sans-serif"><img src="data:image/webp;base64,${fs.readFileSync(f).toString('base64')}" style="max-width:${(man.size[k] || [400])[0] > 900 ? 640 : (man.size[k] || [400])[0]}px;background:#6b7a88"><figcaption>${k}</figcaption></figure>`).join('');
    const p2 = await b.newPage({ deviceScaleFactor: 1 }); await p2.setViewportSize({ width: 1500, height: 900 });
    await p2.setContent(`<body style="margin:0;background:#8794a2">${cells}</body>`); await p2.waitForTimeout(400);
    await p2.screenshot({ path: path.join(SHOTS, 'sheet.png'), fullPage: true }); console.log('sheet', path.join(SHOTS, 'sheet.png'));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
