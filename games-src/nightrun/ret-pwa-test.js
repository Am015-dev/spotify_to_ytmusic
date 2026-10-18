#!/usr/bin/env node
// POLISH test B30 (installable PWA + offline cache). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-pwa-test.js     env: GAME_DIR=...
// The server mounts the games/ folder, so the shelf worker (games/sw.js) can be checked beside the Nightrun worker.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAMES = process.env.GAMES_DIR || path.resolve(__dirname, '../../games');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), start = () => cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAMES], { stdio: 'ignore' });
  let srv = start();
  await new Promise(r => setTimeout(r, 800));
  const O = `http://127.0.0.1:${port}`, NR = `${O}/mainhattan-nightrun/`;
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    // 1. manifest
    const mj = JSON.parse(fs.readFileSync(path.join(GAMES, 'mainhattan-nightrun/manifest.webmanifest'), 'utf8'));
    ok('manifest fields', mj.name && mj.short_name && (mj.display === 'standalone' || mj.display === 'fullscreen') && mj.orientation === 'any' && /^#/.test(mj.theme_color) && /^#/.test(mj.background_color) && mj.start_url && mj.scope);
    const inside = u => new URL(u, NR).href.startsWith(NR);
    ok('start_url and scope inside games/mainhattan-nightrun/', inside(mj.start_url) && inside(mj.scope) && new URL(mj.scope, NR).href === NR);
    const need = { '192x192': 0, '512x512': 0 }, maskable = mj.icons.some(i => i.purpose === 'maskable');
    let iconsOk = true;
    for (const i of mj.icons) { const f = path.join(GAMES, 'mainhattan-nightrun', i.src); if (!fs.existsSync(f)) { iconsOk = false; continue; } const b = fs.readFileSync(f), w = b.readUInt32BE(16), h = b.readUInt32BE(20); if (`${w}x${h}` !== i.sizes) iconsOk = false; if (i.sizes in need) need[i.sizes]++; }
    ok('icons exist, sizes match, 192 + 512 + maskable', iconsOk && need['192x192'] > 0 && need['512x512'] > 0 && maskable);

    // 2. flag off: no worker, no manifest link
    {
      const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true }), p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(String(e)));
      await p.goto(NR + 'index.html?pwa=0'); await p.waitForTimeout(2500);
      const r = await p.evaluate(async () => ({ regs: (await navigator.serviceWorker.getRegistrations()).length, link: !!document.querySelector('link[rel=manifest]'), flag: RET.pwa, row: !!document.getElementById('pwaRow') }));
      ok('flag off: no worker, no manifest link, no MENU row', r.regs === 0 && !r.link && r.flag === false && !r.row, JSON.stringify(r));
      ok('flag off: no page errors', errs.length === 0, errs.join('|'));
      await ctx.close();
    }

    // 3. flag on: register, activate, offline
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) errs.push(m.text()); });
    await p.goto(NR + 'index.html');
    const act = await p.evaluate(async () => { const reg = await navigator.serviceWorker.ready; for (let i = 0; i < 50 && reg.active.state !== 'activated'; i++) await new Promise(r => setTimeout(r, 100)); return { scope: reg.scope, state: reg.active && reg.active.state, link: document.querySelector('link[rel=manifest]') && document.querySelector('link[rel=manifest]').href }; });
    ok('SW registers and activates, scope = Nightrun folder', act.state === 'activated' && act.scope === NR, JSON.stringify(act));
    ok('manifest link added', act.link === NR + 'manifest.webmanifest');
    await p.waitForTimeout(1500);
    // play a song once online, the way the game loads it (whole file, force-cache), and a media file
    const song = await p.evaluate(async () => { const r = await fetch('music/menu.mp3', { cache: 'force-cache' }); const b = await r.blob(); await fetch('media/ui-panel.webp'); return { st: r.status, n: b.size }; });
    ok('song fetched online', song.st === 200 && song.n > 100000, JSON.stringify(song));
    await p.waitForTimeout(500);
    const cn = await p.evaluate(async () => { const out = {}; for (const n of await caches.keys()) out[n] = (await (await caches.open(n)).keys()).map(r => new URL(r.url).pathname.split('/mainhattan-nightrun/')[1]); return out; });
    const shellN = Object.keys(cn).find(n => n.startsWith('nr-shell-')), assetN = Object.keys(cn).find(n => n.startsWith('nr-assets-'));
    ok('shell cache holds index.html, manifest, icons', shellN && ['index.html', 'manifest.webmanifest', 'icons/icon-192.png'].every(x => cn[shellN].includes(x)), JSON.stringify(cn[shellN]));
    ok('asset cache holds the song and the art', assetN && cn[assetN].includes('music/menu.mp3') && cn[assetN].includes('media/ui-panel.webp'), JSON.stringify(cn[assetN]));
    await p.reload(); await p.waitForTimeout(800);   // controlled now

    // offline: reload reaches the title
    await ctx.setOffline(true); srv.kill(); await new Promise(r => setTimeout(r, 600));   // really offline: the server is gone too (context.setOffline does not always cover worker fetches)
    const t0 = Date.now();
    await p.reload({ waitUntil: 'domcontentloaded' });
    const title = await p.waitForFunction(() => window.RET && document.getElementById('playBtn') && !document.getElementById('playBtn').closest('[hidden]'), null, { timeout: 8000 }).then(() => true).catch(() => false);
    ok('offline reload reaches the title in < 3 s', title && Date.now() - t0 < 3000, (Date.now() - t0) + ' ms');
    const off = await p.evaluate(async () => {
      const out = {}; let r = await fetch('music/menu.mp3', { cache: 'force-cache' }); out.full = r.status; out.size = (await r.blob()).size;
      r = await fetch('music/menu.mp3', { headers: { range: 'bytes=1000-1999' } }); out.range = r.status; out.cr = r.headers.get('content-range'); out.rlen = (await r.arrayBuffer()).byteLength;
      const have = (await (await caches.open((await caches.keys()).find(n => n.startsWith('nr-assets-')))).keys()).map(r => r.url); const un = ['stage1', 'stage2', 'stage3', 'boss', 'boss2', 'boss3', 'endless', 'endless2', 'athina', 'athina2'].find(n => !have.some(u => u.endsWith('/' + n + '.mp3'))); out.un = un;
      try { r = await fetch('music/' + un + '.mp3?x=' + Date.now(), { cache: 'no-store' }); out.uncached = r.status; } catch (e) { out.uncached = 'network error'; }
      const a = new Audio(); a.src = URL.createObjectURL(await (await fetch('music/menu.mp3', { cache: 'force-cache' })).blob()); await new Promise(res => { a.onloadedmetadata = res; a.onerror = res; setTimeout(res, 3000); }); out.dur = a.duration;
      const t = await fetch('music/tracks.json'); out.tracks = t.status;
      return out; });
    ok('song streams offline (whole file, from cache)', off.full === 200 && off.size === song.n, JSON.stringify(off));
    ok('Range request offline answered 206 from cache', off.range === 206 && off.cr && off.rlen === 1000, JSON.stringify(off));
    ok('offline <audio> from the cached blob has a duration', off.dur > 30, String(off.dur));
    ok('tracks.json served offline from cache', off.tracks === 200);
    ok('a song never heard is not available offline (documented limit)', off.uncached === 'network error' || off.uncached >= 400, JSON.stringify(off));
    // MENU hint
    await p.waitForTimeout(500);
    await p.evaluate(() => document.getElementById('moreBtn').click()); await p.waitForTimeout(500);
    const mn = await p.evaluate(() => { const n = document.getElementById('pwaNote'), row = document.getElementById('pwaRow'), m = document.getElementById('mnMore'); return { note: n && !n.hidden && n.textContent, inMenu: !!(row && m && m.contains(row)), btnHidden: document.getElementById('pwaBtn').hidden }; });
    ok('MENU shows "Offline ready", install button hidden without a prompt', /^Offline ready/.test(mn.note || '') && mn.inMenu && mn.btnHidden, JSON.stringify(mn));
    await p.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__pr = 1; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); RET.pwaX.draw(); });
    await p.waitForTimeout(300);
    const ib = await p.evaluate(() => { const b = document.getElementById('pwaBtn'); b.click(); return { shown: !b.hidden, pr: window.__pr }; });
    ok('beforeinstallprompt shows INSTALL APP and calls prompt()', ib.shown && ib.pr === 1, JSON.stringify(ib));
    ok('no page errors / console errors (offline run)', errs.length === 0, errs.slice(0, 3).join('|'));
    await ctx.setOffline(false); srv = start(); await new Promise(r => setTimeout(r, 800));

    // 4. version bump replaces the old caches, keeps the songs
    const ver = await p.evaluate(async () => {
      const before = (await caches.keys()).filter(n => n.startsWith('nr-'));
      const old = await caches.open('nr-assets-oldbuild'); await old.put(new URL('music/stage1.mp3', location.href).href.split('?')[0], new Response('x', { headers: { 'content-type': 'audio/mpeg' } }));
      await caches.open('nr-shell-oldbuild');
      const reg = await navigator.serviceWorker.ready; await reg.unregister();
      return { before }; });
    // a new build of the worker: copy the site, change the stamp, serve it
    const tmp = fs.mkdtempSync('/tmp/nrpwa-'); cp.execSync(`cp -r ${GAMES}/mainhattan-nightrun ${tmp}/ && rm -rf ${tmp}/mainhattan-nightrun/music/*.mp3 && cp ${GAMES}/mainhattan-nightrun/music/tracks.json ${tmp}/mainhattan-nightrun/music/`);
    const swp = path.join(tmp, 'mainhattan-nightrun/sw.js'); fs.writeFileSync(swp, fs.readFileSync(swp, 'utf8').replace(/const BUILD = '[^']*'/, "const BUILD = 'bump2'"));
    const port2 = await freePort(), srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 700));
    const ctx2 = await br.newContext({}), p2 = await ctx2.newPage(), U2 = `http://127.0.0.1:${port2}/mainhattan-nightrun/`;
    await p2.goto(U2 + 'index.html'); await p2.evaluate(() => navigator.serviceWorker.ready); await p2.waitForTimeout(800);
    const seed = await p2.evaluate(async () => { const c = await caches.open('nr-assets-oldbuild'); await c.put(new URL('music/stage1.mp3', location.href).href, new Response('x', { headers: { 'content-type': 'audio/mpeg' } })); await caches.open('nr-shell-oldbuild'); return (await caches.keys()).filter(n => n.startsWith('nr-')); });
    // bump: serve a worker with another stamp, update
    fs.writeFileSync(swp, fs.readFileSync(swp, 'utf8').replace("'bump2'", "'bump3'"));
    await p2.evaluate(async () => { const reg = await navigator.serviceWorker.ready; await reg.update(); });
    await p2.evaluate(async () => { for (let i = 0; i < 100; i++) { const k = await caches.keys(); if (k.includes('nr-assets-bump3') && !k.includes('nr-shell-bump2') && !k.includes('nr-shell-oldbuild')) return; await new Promise(r => setTimeout(r, 100)); } });
    const after = await p2.evaluate(async () => { const ks = (await caches.keys()).filter(n => n.startsWith('nr-')); const a = ks.find(n => n === 'nr-assets-bump3'); return { ks, carried: a ? (await (await caches.open(a)).keys()).some(r => /stage1\.mp3$/.test(r.url)) : false }; });
    ok('cache version bump: old shell/asset caches deleted, new ones present', after.ks.includes('nr-shell-bump3') && after.ks.includes('nr-assets-bump3') && !after.ks.some(n => /bump2|oldbuild/.test(n)), JSON.stringify({ seed, after }));
    ok('cache version bump: cached songs carried to the new asset cache', after.carried);
    srv2.kill(); await ctx2.close(); fs.rmSync(tmp, { recursive: true, force: true });

    // 5. other games unaffected
    const ctx3 = await br.newContext({}), p3 = await ctx3.newPage(), e3 = [];
    p3.on('pageerror', e => e3.push(String(e)));
    await p3.goto(`${O}/index.html`); await p3.waitForTimeout(1500);
    const sh = await p3.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => r.scope));
    ok('shelf worker keeps scope games/', sh.length === 1 && sh[0] === O + '/', JSON.stringify(sh));
    const nrOnShelf = await p3.evaluate(async () => (await caches.keys()).filter(n => n.startsWith('nr-')).length);
    ok('shelf page does not create Nightrun caches', nrOnShelf === 0);
    await p3.goto(`${O}/hollowbough/index.html`); await p3.waitForTimeout(1200);
    const g = await p3.evaluate(async () => ({ regs: (await navigator.serviceWorker.getRegistrations()).map(r => r.scope), link: !!document.querySelector('link[rel=manifest][href*="nightrun"]') }));
    ok('another game page loads, no Nightrun manifest/worker, shelf scope intact', e3.length === 0 && g.regs.every(s => s === O + '/') && !g.link, JSON.stringify({ g, e3 }));
    await ctx3.close(); await ctx.close();
  } catch (e) { ok('test crashed', false, String(e && e.stack || e)); }
  await br.close(); srv.kill();
  console.log(res.every(Boolean) ? 'ALL PASS' : 'FAILURES'); process.exit(res.every(Boolean) ? 0 : 1);
})();
