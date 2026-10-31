#!/usr/bin/env node
// W294 iframe test: the store zip embedded the way itch.io embeds a game. Page on port A, game (unzipped nightrun-web.zip) on port B.
//   python3 -I -c "import zipfile;zipfile.ZipFile('release/dist/nightrun-web.zip').extractall('/tmp/nrzip')" ; NODE_PATH=$(npm root -g) node games-src/nightrun/release/iframe-test.js [/tmp/nrzip]
// PASS/FAIL lines only. Env SHOTS=<dir> also saves a screenshot per size.
const PW = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const DIR = process.argv[2] || '/tmp/nrzip', SHOTS = process.env.SHOTS;
const MIME = { html: 'text/html', js: 'text/javascript', json: 'application/json', webp: 'image/webp', png: 'image/png', mp3: 'audio/mpeg', webmanifest: 'application/manifest+json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + String(i).slice(0, 300))); };
const serve = (root, port, html) => new Promise(r => { const s = http.createServer((q, res) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (html) { res.setHeader('content-type', 'text/html'); return res.end(html); }
  let f = path.join(root, u === '/' ? 'index.html' : u); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('no'); }
  res.setHeader('content-type', MIME[f.split('.').pop()] || 'application/octet-stream'); fs.createReadStream(f).pipe(res); }).listen(port, '127.0.0.1', () => r(s)); });
(async () => {
  const A = 18101, B = 18102;
  const host = (w, h) => `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#111"><iframe id="g" width="${w}" height="${h}" frameborder="0" allowfullscreen allow="autoplay; fullscreen *; gamepad" src="http://127.0.0.1:${B}/index.html" style="border:0"></iframe>`;
  let html = host(1, 1); const sa = await serve(null, A, null).catch(() => null); sa && sa.close();
  const sB = await serve(DIR, B), sA = http.createServer((q, res) => { res.setHeader('content-type', 'text/html'); res.end(html); }).listen(A, '127.0.0.1');
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=document-user-activation-required'] });
  for (const [W, H, touch] of [[390, 763, true], [1440, 860, false]]) {
    const tag = (touch ? 'phone ' : 'pc ') + W + 'x' + H;
    html = host(W, H);
    const ctx = await br.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined });
    const p = await ctx.newPage(), errs = [], reqs = [], failed = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    p.on('pageerror', e => errs.push('pageerror ' + String(e.message).slice(0, 160)));
    p.on('request', r => reqs.push(r.url()));
    p.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    await p.goto(`http://127.0.0.1:${A}/`, { waitUntil: 'domcontentloaded' });
    const fe = await p.waitForSelector('#g'); const fr = await fe.contentFrame();
    await fr.waitForFunction(() => window.__mnr, null, { timeout: 20000 }).catch(() => { });
    ok(tag + ': game loads in cross-origin iframe', await fr.evaluate(() => !!window.__mnr && location.origin).then(o => o && o !== 'null' && !o.includes(':' + A), () => false));
    await fr.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 20000 }).catch(() => { }); await sleep(2800);   // past the 2.5 s install-card timer
    ok(tag + ': no Add-to-Home-Screen card or text in iframe', await fr.evaluate(() => !document.getElementById('fsCard') && !/Add to Home Screen/i.test(document.body.innerText)), 'card present');
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/iframe-title-${touch ? 'phone' : 'pc'}.png` });
    // first gesture: FLIGHT by touch tap / mouse click; audio must start
    const b = await (await fr.waitForSelector('#focFlight')).boundingBox(); const fb = await fe.boundingBox();
    const x = fb.x + b.x + b.width / 2, y = fb.y + b.y + b.height / 2;
    ok(tag + ': audio not running before first gesture (no autoplay cheat)', await fr.evaluate(() => { const a = __mnr.AU; return !a.a || a.a.state !== 'running'; }));
    if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
    for (let i = 0; i < 8; i++) { await sleep(500); await fr.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); }
    await sleep(1500);
    const st = await fr.evaluate(() => ({ run: __mnr.running, au: __mnr.AU.a && __mnr.AU.a.state, title: !document.getElementById('title').hidden }));
    ok(tag + ': FLIGHT starts a run (' + JSON.stringify(st) + ')', st.run === true);
    ok(tag + ': audio running after first gesture', st.au === 'running', JSON.stringify(st));
    // input inside the iframe: ship moves
    // portrait phones move the ship along the other axis, so the position is x + y
    const pos = () => fr.evaluate(() => { return __mnr.P && (__mnr.P.x + __mnr.P.y); });
    console.log('INFO paused before input: ' + await fr.evaluate(() => __mnr.paused));
    const x0 = await pos();
    if (touch) { const cx = fb.x + W / 2, cy = fb.y + H * 0.8; await p.touchscreen.tap(cx, cy); const cdp = await ctx.newCDPSession(p);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
      for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + i * 8, y: cy }] }); await sleep(40); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    else { await p.keyboard.down('ArrowRight'); await sleep(700); await p.keyboard.up('ArrowRight'); }
    await sleep(300);
    const x1 = await pos();
    ok(tag + ': ' + (touch ? 'touch drag' : 'keyboard') + ' moves the ship inside the iframe (x ' + x0 + ' -> ' + x1 + ')', typeof x0 === 'number' && typeof x1 === 'number' && Math.abs(x1 - x0) > 3);
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/iframe-flight-${touch ? 'phone' : 'pc'}.png` });
    // fullscreen: button either works (document.fullscreenEnabled in the frame) or is hidden
    const fs0 = await fr.evaluate(() => ({ en: document.fullscreenEnabled, btn: !!document.getElementById('fsBtn') }));
    ok(tag + ': iframe may use fullscreen (allowfullscreen) ' + JSON.stringify(fs0), fs0.en === true);
    // service worker + network
    await sleep(1500);
    const sw = await fr.evaluate(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? (r.active ? 'active' : 'installing') : 'none'; } catch (e) { return 'err ' + e.message; } });
    ok(tag + ': service worker registers inside the iframe (' + sw + ')', sw === 'active' || sw === 'installing');
    const abs = reqs.filter(u => /github\.io|am015/i.test(u));
    ok(tag + ': no github.io URL requested (' + reqs.length + ' requests)', abs.length === 0, abs.slice(0, 3).join(' '));
    const ext = [...new Set(reqs.map(u => { try { return new URL(u).host; } catch (e) { return ''; } }).filter(h => h && !h.startsWith('127.0.0.1')))];
    console.log('INFO external hosts: ' + (ext.join(', ') || 'none'));
    const e2 = errs.filter(e => !/fonts\.(googleapis|gstatic)|ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION|TUNNEL|PROXY)/.test(e)), f2 = failed.filter(u => !/fonts\./.test(u));
    ok(tag + ': 0 console errors', e2.length === 0, e2.join(' | '));
    ok(tag + ': 0 HTTP >= 400 from the zip', f2.length === 0, f2.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await br.close(); sA.close(); sB.close();
  console.log((bad ? 'FAIL' : 'PASS') + ' iframe-test: ' + bad + ' failed'); process.exit(bad ? 1 : 0);
})();
