#!/usr/bin/env node
// Build stamp + update check (RET.stamp). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/stamp-test.js     env: GAME_DIR=...
// (saves.js keeps its own rolling backup keys mnr_sv*; they are ignored, every other key must be identical.)
// Serves a copy of the game (no songs) so the test can swap the page for a "new version" with another stamp.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const STAMP = /^build [0-9a-f]{10} · \d{4}-\d\d-\d\d \d\d:\d\d UTC$/;
(async () => {
  const tmp = fs.mkdtempSync('/tmp/nrstamp-'), root = path.join(tmp, 'mainhattan-nightrun');
  fs.mkdirSync(tmp, { recursive: true }); cp.execSync(`cp -r ${GAME_DIR} ${root} && rm -rf ${root}/music/*.mp3 && cp ${GAME_DIR}/music/tracks.json ${root}/music/`);
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const U = `http://127.0.0.1:${port}/mainhattan-nightrun/`, idx = path.join(root, 'index.html');
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errs = [];
  const mk = async (vp, qs) => { const ctx = await br.newContext({ viewport: vp || { width: 390, height: 763 }, hasTouch: true }), p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e))); await p.goto(U + 'index.html' + (qs || '')); await p.waitForTimeout(1500); return { ctx, p }; };
  try {
    const live = fs.readFileSync(idx, 'utf8'), hash = /const NR_STAMP='([0-9a-f]{10}) /.exec(live)[1], swHash = /const BUILD = '([^']*)'/.exec(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'))[1];
    ok('stamp hash = sw.js BUILD (names the cache)', hash === swHash, hash + ' vs ' + swHash);

    // 1. title + settings + cache name
    const { ctx, p } = await mk();
    const t = await p.evaluate(() => (document.getElementById('stampT') || {}).textContent);
    ok('stamp on the title screen (hash + UTC date)', STAMP.test(t || ''), t);
    await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; for (let i = 0; i < 50 && !(await caches.keys()).some(n => n.startsWith('nr-shell-')); i++) await new Promise(r => setTimeout(r, 100)); });
    const names = await p.evaluate(async () => (await caches.keys()).filter(n => n.startsWith('nr-')));
    ok('stamp hash matches the service worker cache name', names.includes('nr-shell-' + hash), JSON.stringify(names));
    await p.click('#moreBtn'); await sleep(300); await p.click('#setBtn'); await sleep(300);
    const s = await p.evaluate(() => ({ s: (document.getElementById('stampS') || {}).textContent, f: (document.getElementById('stampF') || {}).textContent, b: !!document.getElementById('stampBtn') }));
    ok('stamp + flags line + update button in Settings', s.s === t && /sprites on/.test(s.f) && /music pack on/.test(s.f) && /lessons on/.test(s.f) && /classes on/.test(s.f) && s.b, JSON.stringify(s));

    // 2. update button: up to date, then a mocked new hash
    await p.evaluate(() => { localStorage.setItem('nr-test-save', JSON.stringify({ a: 1 })); });
    const keys0 = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'nrStampSeen' && !/^mnr_sv/.test(k)) o[k] = localStorage.getItem(k); } return JSON.stringify(o); });
    await p.click('#stampBtn'); await p.waitForFunction(() => /Up to date|Could not/.test(document.getElementById('stampSt').textContent), null, { timeout: 8000 }).catch(() => { });
    ok('update button: "Up to date" when the live stamp matches', /Up to date/.test(await p.evaluate(() => document.getElementById('stampSt').textContent)));
    const NEW = 'deadbeef00 2099-01-01 00:00 UTC';
    fs.writeFileSync(idx, live.replace(/const NR_STAMP='[^']*'/, `const NR_STAMP='${NEW}'`));
    const nav = p.waitForNavigation({ timeout: 10000 }).catch(() => null);
    await p.click('#stampBtn');
    await p.waitForFunction(() => /New version found/.test(document.getElementById('stampSt').textContent), null, { timeout: 8000 }).then(() => ok('update button: shows "new version found, reloading"', true)).catch(() => ok('update button: shows "new version found, reloading"', false));
    await nav; await p.waitForTimeout(2500);
    const after = await p.evaluate(() => ({ t: (document.getElementById('stampT') || {}).textContent, toast: (document.getElementById('stampToast') || {}).textContent, keys: (() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'nrStampSeen' && !/^mnr_sv/.test(k)) o[k] = localStorage.getItem(k); } return JSON.stringify(o); })() }));
    ok('after the reload the page runs the new stamp', /deadbeef00/.test(after.t || ''), after.t);
    ok('one-time toast "Updated to <hash>"', after.toast === 'Updated to deadbeef00', after.toast);
    ok('saves / localStorage untouched by the update', after.keys === keys0, keys0 + ' -> ' + after.keys);
    await p.reload(); await p.waitForTimeout(1500);
    ok('toast not shown a second time', !(await p.evaluate(() => { const e = document.getElementById('stampToast'); return !!e && !e.hidden; })));

    // 3. no reload during a run; reload once on the title screen after the worker changes
    await p.evaluate(() => { window.__mark = 1; });
    await p.click('#playBtn'); await sleep(1500);
    await p.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
    await sleep(3000);
    ok('no reload while a run is going', await p.evaluate(() => window.__mark === 1 && document.getElementById('title').hidden));
    await p.keyboard.press('p'); await sleep(400);
    await p.click('#quitBtn').catch(() => { });
    await p.waitForFunction(() => window.__mark !== 1, null, { timeout: 8000 }).then(() => ok('worker change reloads the page once the title screen is back', true)).catch(() => ok('worker change reloads the page once the title screen is back', false));
    await ctx.close();

    // 4. flag off
    const o = await mk(null, '?stamp=0');
    const off = await o.p.evaluate(() => ({ t: (document.getElementById('stampT') || {}).textContent, row: !!document.getElementById('stampRow'), css: !!document.getElementById('stampCss') }));
    ok('?stamp=0 hides everything', !off.t && !off.row && !off.css, JSON.stringify(off));
    await o.ctx.close();
    ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { ok('test ran', false, String(e && e.stack || e)); }
  await br.close(); srv.kill(); fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(res.every(Boolean) ? 0 : 1);
})();
