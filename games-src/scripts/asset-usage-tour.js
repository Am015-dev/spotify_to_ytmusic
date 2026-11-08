// Runtime asset usage: plays a quick game on a 390x844 phone, logs every media/ and models/ request, lists shipped owner files that never loaded.
// Run: NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/asset-usage.js <slug> [seconds] [shotPrefix]
const fs = require('fs'), path = require('path'), { chromium } = require('playwright'), gx = require('./gx-serve.js');
const ROOT = path.resolve(__dirname, '..', '..');
(async () => {
  const slug = process.argv[2], secs = +process.argv[3] || 60, shot = process.argv[4];
  const url = await gx.url(slug, { file: process.env.HTML || path.join(ROOT, 'games', slug, 'index.html') });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const got = new Map(), errs = [];
  // three short sessions share one request log: a quick game, the story/campaign screens, and the learn/tutor flow
  const MODES = [['play', /^(just play|play|start|new game|vs|solo|begin|deal|ok|got it|next|continue|skip|close|done|end turn|confirm|roll|pass|draw|take|place|use|cut|let.?s)/i],
    ['story', /^(story|chapter|campaign|continue|next|ok|got it|close|start|begin|play|go|fight|deal|done|skip)|^\d|node/i],
    ['campaign', /^(story|chapter|campaign|continue|next|ok|got it|close|start|begin|play|go|fight|deal|done|skip|unlock|table|portrait|cast)|^\d|node/i, true],
    ['learn', /^(learn|new here|tutorial|got it|next|ok|continue|skip|close|done|place|take|draw|use|cut)/i]];
  let n = 0, page;
  for (const [mode, PRI, done] of MODES) {
  page = await ctx.newPage();
  page.on('response', r => { const m = /\/(media|models)\/([^?#]+)/.exec(r.url()); if (m) got.set(m[1] + '/' + decodeURIComponent(m[2]), r.status()); });
  page.on('pageerror', e => errs.push(String(e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 260)));
  await page.goto(url + (url.includes('?') ? '&' : '?') + (process.env.Q || ''), { waitUntil: 'load' });
  if (done) {   // a finished campaign: every chapter beaten and every reward unlocked, so portraits, nodes, tables and tile backs can show
    await page.evaluate(() => { try { const D = window.CAMPAIGN; if (!D) return; const p = { v: 1, ch: {}, unlocked: [], last: null };
      (D.chapters || []).forEach(c => { p.ch[c.id] = { beaten: true, stars: 3, best: null, tries: 1, losses: 0, easy: false }; (c.unlock || []).forEach(u => p.unlocked.push(u.type + ':' + (u.id || u.text))); });
      localStorage.setItem('gns-campaign-' + D.game, JSON.stringify(p)); } catch (e) { } });
    await page.reload({ waitUntil: 'load' });
  }
  const end = Date.now() + secs * 1000 / MODES.length;
  while (Date.now() < end) {
    n++;
    const acts = await page.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 6 && r.height > 6 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.pointerEvents !== 'none'; };
      return [...document.querySelectorAll('button,[role=button],[data-act],[onclick],.tile,.cell,.slot,.opt,.card')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 30), x: r.x + r.width / 2, y: r.y + r.height / 2, c: String(e.className).slice(0, 30), d: !!e.disabled }; }).filter(a => !a.d);
    }).catch(() => []);
    const pri = acts.filter(a => PRI.test(a.t));
    const pick = pri.length ? pri[n % pri.length] : acts.length ? acts[(n * 7) % acts.length] : { x: 100 + (n * 53) % 200, y: 200 + (n * 97) % 400 };
    if (/rules|settings|quit|menu|reset|exit|home|sound|music|mute/i.test(pick.t) && acts.length > 1) continue;
    await page.touchscreen.tap(pick.x, pick.y).catch(() => {});
    await page.waitForTimeout(250);
    if (shot && mode === 'play' && n === 14) await page.screenshot({ path: shot + '-mid.png' });
  }
  if (shot && mode === 'play') await page.screenshot({ path: shot + '.png' });
  if (shot) await page.screenshot({ path: shot + '-' + mode + '.png' });
  await page.close();
  }
  // scenario screens (?scn=<id>): jump to the title, story scene, start sheet, art page and 3D board the way a player reaches them
  const SCN = (process.env.SCN || 'menu,story-scene,ui-start,ui-3d,sg-art,rv-art,sf-art,ui-menu').split(',');
  for (const vp of [{ width: 390, height: 844 }]) for (const id of SCN) {
    const c2 = await b.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: true, isMobile: true }), pg = await c2.newPage();
    pg.on('response', r => { const m = /\/(media|models)\/([^?#]+)/.exec(r.url()); if (m) got.set(m[1] + '/' + decodeURIComponent(m[2]), r.status()); });
    await pg.goto(url + (url.includes('?') ? '&' : '?') + 'scn=' + id, { waitUntil: 'load' }).catch(() => { });
    await pg.waitForTimeout(2500); await c2.close();
  }
  const shipped = []; for (const d of ['media', 'models']) { const dir = path.join(ROOT, 'games', slug, d); if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) shipped.push(d + '/' + f); }
  const art = shipped.filter(f => /\.(webp|png|jpg|glb)$/.test(f));
  // a file counts as loaded if it, or its @512/-lite/-c/-k sibling-variant of the same stem, was fetched
  const stem = f => f.replace(/(@512|-lite|-c|-k)?\.(webp|png|jpg|glb)$/, '');
  const loadedStems = new Set([...got.keys()].map(stem));
  const miss = art.filter(f => !got.has(f) && !loadedStems.has(stem(f)));
  const models = art.filter(f => f.startsWith('models/') && f.endsWith('.glb') && !f.includes('-lite')), mLoaded = models.filter(f => got.has(f) || got.has(f.replace('.glb', '-lite.glb')));
  const pics = art.filter(f => f.startsWith('media/')), pLoaded = pics.filter(f => got.has(f) || loadedStems.has(stem(f)));
  console.log(JSON.stringify({ slug, taps: n, models: mLoaded.length + '/' + models.length, pictures: pLoaded.length + '/' + pics.length, notLoaded: miss, bad: [...got].filter(([k, v]) => v >= 400).map(x => x[0]), errs: errs.slice(0, 3) }, null, 1));
  await b.close(); process.exit(0);
})();
