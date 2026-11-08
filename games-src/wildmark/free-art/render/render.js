// Renders the 5 terrain textures + table from the KayKit Medieval Hexagon Pack (CC0) with three.js in headless Chromium.
// usage: PW_MODULE=/opt/node22/lib/node_modules/playwright CHROME=/path/to/chrome node render.js [name ...]   -> out/<name>.png
const { chromium } = require(process.env.PW_MODULE || 'playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const N = 'decoration/nature/';
const G = 'tiles/base/hex_grass', W = 'tiles/base/hex_water';
const SPECS = {
  forest: { bases: [G], baseColors: { [G]: '#4a7f3e' }, seed: 3, pick: [[N + 'trees_A_large', 3], [N + 'trees_B_large', 3], [N + 'trees_A_medium', 2], [N + 'trees_B_medium', 2], [N + 'trees_A_small', 1]], props: [[N + 'rock_single_C', .25, 1, 0, 1.2]] },
  peak: { bases: [G], baseColors: { [G]: '#6f7466' }, seed: 5, pick: [[N + 'mountain_A', 3], [N + 'mountain_B', 3], [N + 'mountain_C', 3]], props: [[N + 'rock_single_A', .5, 1.6, 0, 1.3], [N + 'rock_single_D', .4, 1.4, 0, 1.3]] },
  meadow: { bases: [G], baseColors: { [G]: '#b9a554' }, seed: 9, pick: [[N + 'hills_A', 2], [N + 'hills_B', 2], [N + 'hill_single_A', 2], [N + 'hill_single_B', 1], [null, 2]], props: [[N + 'tree_single_A', .45, 1, 0, 1.3], [N + 'tree_single_B', .35, 1, 0, 1.3], [N + 'rock_single_B', .3, 1.4, 0, 1.2]] },
  marsh: { bases: [G, W], baseColors: { [G]: '#6c8f55', [W]: '#2f7c78' }, seed: 12, pick: [[N + 'waterplant_A', 1, 3.2, 0], [N + 'waterplant_B', 1, 3.2, 0], [N + 'waterplant_C', 1, 3.2, 0], [N + 'trees_A_small', 1], [null, 1]], props: [[N + 'waterlily_A', .6, 4, -0.2, 1.0], [N + 'waterlily_B', .6, 4, -0.2, 1.0], [N + 'waterplant_B', .6, 3.4, -0.2, 1.2]] },
  river: { bases: [W], baseColors: { [W]: '#3a82c0' }, seed: 21, pick: [[null, 2], [N + 'waterlily_A', 1, 4, -0.2], [N + 'rock_single_E', 1, 1.8, -0.2]], props: [[N + 'rock_single_A', .5, 1.8, -0.2, 1.4], [N + 'waterplant_C', .6, 3.6, -0.2, 1.3], [N + 'waterlily_B', .8, 4.5, -0.2, 1.6], [N + 'waterplant_A', .4, 3.4, -0.2, 1.4]] },
};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.png': 'image/png' };
const srv = http.createServer((q, s) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); s.end(d); } }); }).listen(0, async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('err', e.message));
  await p.goto('http://localhost:' + srv.address().port + '/scene.html'); await p.waitForFunction('window.ready', null, { timeout: 30000 });
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SPECS);
  for (const n of names) {
    const r = await p.evaluate(([s, px]) => window.renderTerrain(s, px), [SPECS[n], 1024]);
    fs.writeFileSync(path.join(__dirname, 'out', n + '.png'), Buffer.from(r.url.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(__dirname, 'out', n + '.json'), JSON.stringify({ view: r.view, flats: r.flats, pts: r.pts, pointy: r.pointy }));
    console.log('pass render', n);
  }
  await b.close(); srv.close();
});
