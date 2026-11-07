// Render a batch of SVGs to PNG in one Chromium: node render.js list.json  (list = [[svgPath, pngPath, w, h, transparent]])
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const list = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const b = await chromium.launch(); const p = await b.newPage();
  for (const [svg, png, w, h, tr] of list) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent('<html><body style="margin:0;background:transparent">' + fs.readFileSync(svg, 'utf8') + '</body></html>');
    await p.screenshot({ path: png, omitBackground: !!tr, clip: { x: 0, y: 0, width: w, height: h } });
  }
  await b.close(); console.log('pass render', list.length);
})();
