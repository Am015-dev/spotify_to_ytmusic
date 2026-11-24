// Capture start + scenario screenshots of each game for the contact-sheet page (games/sheets/).
// Usage: NODE_PATH=$(npm root -g) node games-src/scripts/sheets-capture.js [slug ...] --out <dir> [--base http://localhost:8779] [--max 6]
// Output: <out>/<slug>/<size>-<i>.png and <out>/<slug>/<size>.json (cells + page errors). Compose with contact-sheet-compose.py.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..', 'games');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(opt('--out', 'contact-raw'));
const BASE = opt('--base', 'http://localhost:8779');
const MAX = parseInt(opt('--max', '6'), 10);
const SKIP = /^(mainhattan-|deep-signal$|sheets$|proof$|panel$|covers$|shots$|asset-viewer$|look$|.*-next$)/;
const SIZES = { phone: { width: 402, height: 874, isMobile: true, hasTouch: true }, pc: { width: 1280, height: 800 } };

let slugs = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
if (!slugs.length) {
  slugs = fs.readdirSync(ROOT).filter(d => !SKIP.test(d) && fs.existsSync(path.join(ROOT, d, 'index.html')));
}
let scenarios = {};
try { scenarios = JSON.parse(fs.readFileSync(path.join(ROOT, 'scenarios.json'), 'utf8')); } catch (e) { }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const slug of slugs) {
    const ids = (scenarios[slug] || []).map(s => s.id).slice(0, Math.max(0, MAX - 1));
    const urls = [{ name: 'start', q: '' }, ...ids.map(id => ({ name: id, q: '?scn=' + encodeURIComponent(id) }))];
    fs.mkdirSync(path.join(OUT, slug), { recursive: true });
    for (const [size, vp] of Object.entries(SIZES)) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, serviceWorkers: 'block' });
      const cells = [];
      for (let i = 0; i < urls.length; i++) {
        const page = await ctx.newPage();
        const errs = [];
        page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
        let loadErr = '';
        await page.goto(`${BASE}/${slug}/${urls[i].q}`, { waitUntil: 'load', timeout: 45000 }).catch(e => { loadErr = String(e.message).slice(0, 120); });
        await page.waitForTimeout(2500);
        const file = `${size}-${i}.png`;
        await page.screenshot({ path: path.join(OUT, slug, file), timeout: 20000 }).catch(e => { loadErr = loadErr || 'shot: ' + e.message.slice(0, 80); });
        cells.push({ name: urls[i].name, file, errors: errs, loadError: loadErr });
        await page.close();
      }
      fs.writeFileSync(path.join(OUT, slug, `${size}.json`), JSON.stringify({ slug, size, cells }, null, 1));
      await ctx.close();
      console.log(`${slug} ${size}: ${cells.length} cells`);
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
