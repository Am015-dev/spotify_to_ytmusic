#!/usr/bin/env node
// Runtime asset usage: plays a quick game at 390x844 in Playwright, logs every media/, models/, music/ request and lists the shipped
// files that never load. Usage: node games-src/scripts/play-usage.js [--secs=60] [--shots=DIR] [--json=FILE] <slug> [<slug>...]
// Counts per game: loaded/shipped for models (.glb), pictures (.webp/.png/.jpg), music (.mp3), video (.mp4). "@512"/"-lite"/"-c"/"-k"
// variants of the same name count as one asset (a name is "loaded" when any of its variants loaded).
const fs = require('fs'), path = require('path');
const gx = require('./gx-serve.js');
const { chromium } = require('playwright');
const REPO = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2), opt = {}, slugs = [];
args.forEach(a => { const m = a.match(/^--(\w+)(?:=(.*))?$/); if (m) opt[m[1]] = m[2] === undefined ? true : m[2]; else slugs.push(a); });
const SECS = +(opt.secs || 60), query = opt.query || '?glb=1';   // glb=1: force the live models even on the software GL of a headless run
const KINDS = { models: /\.glb$/, media: /\.(webp|png|jpg|jpeg|svg|mp4|webm)$/, music: /\.(mp3|ogg|m4a|wav)$/ };
const base = f => f.replace(/\.[a-z0-9]+$/i, '').replace(/@\d+$/, '').replace(/-lite$/, '').replace(/-(c|k)$/, '');
function shipped(slug) {
  const out = [];
  ['media', 'models', 'music'].forEach(d => { const p = path.join(REPO, 'games', slug, d); if (!fs.existsSync(p)) return;
    fs.readdirSync(p).forEach(f => { if (fs.statSync(path.join(p, f)).isFile()) out.push(d + '/' + f); }); });
  return out;
}
const PRIORITY = /^(play|start|new game|quick|begin|let'?s|continue|next|go|ok|got it|done|skip|end turn|draw|roll|kick|deal|ready|confirm|close|resume|yes|again)\b/i;
async function clickSome(page) {
  return page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .1 && !e.disabled; };
    const all = [...document.querySelectorAll('button,[role=button],.btn,[onclick],canvas,.card,.hero,.door,.slot,.tile,.cell,.opt,li,a')].filter(vis);
    if (!all.length) return '';
    const P = /^(play|start|new game|quick|begin|let'?s|continue|next|go|ok|got it|done|skip|end turn|draw|roll|kick|deal|ready|confirm|close|resume|yes|again)\b/i;
    const nm = e => (e.innerText || e.getAttribute('aria-label') || '').trim(), SKIP = /how to play|hint|diary|menu|setting|sound|online|friends|story mode|learn in|rules|help|share|copy|quit|exit/i;
    const pri = all.filter(e => P.test(nm(e)));
    const safe = all.filter(e => !SKIP.test(nm(e)));
    const pool = pri.length && Math.random() < .8 ? pri : (safe.length ? safe : all), pick = pool[Math.floor(Math.random() * pool.length)];
    const r = pick.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2), (pick.innerText || pick.tagName).slice(0, 20)].join('|');
  });
}
(async () => {
  const srv = await gx.url(slugs[0] || 'tidewake', {});   // starts one shared server
  const baseUrl = srv.replace(/\/[^/]*\/?(\?.*)?$/, '');
  const browser = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = {};
  const domClick = (page, s) => page.evaluate(s => { const b = [...document.querySelectorAll('button,[role=button]')].find(e => (e.innerText || '').trim().toLowerCase().startsWith(s.toLowerCase()) && e.getBoundingClientRect().width > 8); if (b) { b.scrollIntoView({ block: 'center' }); b.click(); return true; } return false; }, s).catch(() => false);
  for (const slug of slugs) {
    const seen = new Map(), errs = [], per = {};
    for (const pass of (opt.desktop ? ['phone', 'desktop'] : ['phone'])) {
      const desk = pass === 'desktop';
      const ctx = await browser.newContext(desk ? { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
      const page = await ctx.newPage(), before = seen.size;
      page.on('response', r => { try { const u = new URL(r.url()); const m = u.pathname.match(/\/(media|models|music)\/(.+)$/); if (m && u.pathname.includes('/' + slug + '/')) seen.set(m[1] + '/' + decodeURIComponent(m[2]), r.status()); } catch (e) {} });
      page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
      if (opt.speed) await page.addInitScript(sp => { try { Object.keys(sp).forEach(k => localStorage.setItem(k, sp[k])); } catch (e) {} }, JSON.parse(opt.speed));
      const shot = n => opt.shots && fs.mkdirSync(opt.shots, { recursive: true }) === undefined || opt.shots ? page.screenshot({ path: path.join(opt.shots, slug + '-' + (opt.tag || 'run') + '-' + pass + '-' + n + '.png') }).catch(() => {}) : null;
      const secs = opt.onlystory ? 0 : desk ? Math.min(SECS, 25) : SECS;
      // a) Story mode: the campaign map (camps, nodes, story map)
      await page.goto(baseUrl + '/' + slug + '/' + query, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500);
      if (opt.shots) await shot('title');
      if (opt.seed) {   // campaign progress seeded (chapters 1..n-1 beaten, 3 stars) so the map shows done nodes, banners, stars and every rival portrait
        await page.evaluate(() => { try { if (window.CAMPAIGN) { const ch = {}; CAMPAIGN.chapters.slice(0, -1).forEach(c => ch[c.id] = { beaten: true, stars: 3, best: null, tries: 1, losses: 0, easy: false }); localStorage.setItem('gns-campaign-' + CAMPAIGN.game, JSON.stringify({ v: 1, ch, unlocked: [], last: null })); } } catch (e) {} }).catch(() => {});
        await page.goto(baseUrl + '/' + slug + '/' + query, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500);
        if (await domClick(page, 'Story mode')) { await page.waitForTimeout(2000);
          for (const s of ['Skip tutorial', 'Skip', 'Back', 'Close']) { if (await page.evaluate(() => document.querySelectorAll('.gxc-node').length).catch(() => 0)) break; await domClick(page, s); await page.waitForTimeout(1500); }
          const nn = await page.evaluate(() => document.querySelectorAll('.gxc-node').length).catch(() => 0);
          for (let i = 0; i < nn; i++) { await page.evaluate(i => { const e = document.querySelectorAll('.gxc-node')[i]; if (e) { e.scrollIntoView({ block: 'center' }); e.click(); } }, i).catch(() => {}); await page.waitForTimeout(700); if (opt.shots && i === 2) await shot('seeded-brief'); await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300); }
          if (opt.shots) await shot('seeded-map'); }
      }
      if (await domClick(page, 'Story mode')) { await page.waitForTimeout(2500); for (let i = 0; i < 4; i++) { await clickSome(page).then(c => { if (c) { const [x, y] = c.split('|'); return page.mouse.click(+x, +y); } }).catch(() => {}); await page.waitForTimeout(1200); } if (opt.shots) await shot('story'); }
      // b) a quick game: the computer plays itself, the bot taps whatever is next
      await page.goto(baseUrl + '/' + slug + '/' + query, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500);
      for (const s of ['Quick game', 'Watch the computer', 'Start']) { await domClick(page, s); await page.waitForTimeout(900); }
      const t0 = Date.now(); let n = 0;
      while (Date.now() - t0 < secs * 1000) {
        const c = await clickSome(page).catch(() => '');
        if (c) { const [x, y] = c.split('|'); if (desk) await page.mouse.click(+x, +y).catch(() => {}); else await page.touchscreen.tap(+x, +y).catch(() => {}); }
        await page.waitForTimeout(350); n++;
        if (opt.shots && n === 12) await shot('play');
      }
      if (opt.shots) await shot('end');
      // c) every registered ?scn= moment
      if (opt.scn && !opt.onlystory) {
        await page.goto(baseUrl + '/' + slug + '/?scn=list&glb=1', { waitUntil: 'load' }).catch(() => {});
        const ids = await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }).then(() => page.evaluate(() => (window.GXSLIST || []).map(s => s.id))).catch(() => []);
        for (const id of ids) { await page.goto(baseUrl + '/' + slug + '/?scn=' + id + '&glb=1', { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(+(opt.scnwait || 3500)); }
      }
      per[pass] = seen.size - before; await ctx.close();
    }
    const ship = shipped(slug), loadedBases = new Set([...seen.keys()].map(f => f.split('/')[0] + '/' + base(f.split('/').slice(1).join('/'))));
    const res = {};
    for (const k of Object.keys(KINDS)) {
      const files = ship.filter(f => f.startsWith(k + '/') && KINDS[k].test(f));
      const names = [...new Set(files.map(f => k + '/' + base(f.split('/').slice(1).join('/'))))];
      const lb = k === 'models' ? new Set([...seen.keys()].filter(f => /\.glb$/.test(f)).map(f => 'models/' + base(f.slice(7)))) : loadedBases;
      const load = names.filter(n => lb.has(n));
      res[k] = { shipped: names.length, loaded: load.length, missing: names.filter(n => !lb.has(n)).map(n => n.split('/')[1]) };
    }
    res.errors = errs.slice(0, 5); res.bad = [...seen].filter(([, s]) => s >= 400).map(([f]) => f);
    report[slug] = res;
    console.log(slug.padEnd(18), Object.keys(KINDS).map(k => k + ' ' + res[k].loaded + '/' + res[k].shipped).join('  '), res.bad.length ? ' BAD ' + res.bad.join(',') : '');
    if (opt.verbose) Object.keys(KINDS).forEach(k => res[k].missing.length && console.log('   never loaded ' + k + ': ' + res[k].missing.join(' ')));
  }
  if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(report, null, 1));
  await browser.close(); process.exit(0);
})();
