// shared bits for the Nightrun QA runner (qa.sh). PASS/FAIL lines only.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
// serve GAME_DIR, launch chromium; returns {br, base, srv, close}
async function boot(args) {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', ...(args || [])] });
  return { br, base: `http://127.0.0.1:${port}/index.html`, srv, close: async () => { await br.close().catch(() => { }); srv.kill(); } };
}
// a page at WxH (touch phone); errs = page errors; skips the iOS add-to-home card and tutorial tip like ui-align-test does
async function open(br, base, W, H, query, seed, touch, init) {
  touch = touch !== false;
  const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 200)));
  p.bad = []; p.on('response', r => { if (r.status() >= 400) p.bad.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); }); p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)|^blob:/.test(r.url())) p.bad.push('FAILED ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(s => { if (!sessionStorage.getItem('__qa')) { sessionStorage.setItem('__qa', '1'); try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); if (s) for (const k in s) localStorage.setItem(k, s[k]); } catch (e) { } } }, seed || null);
  if (init) await p.addInitScript(init);
  await p.goto(base + (query || ''), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 });
  await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { });
  await sleep(500); return p;
}
let nbad = 0; const res = n => n;
const ok = (n, pass, info) => { if (!pass) nbad++; console.log((pass ? 'PASS ' : 'FAIL ') + n + (pass || !info ? '' : ' :: ' + String(info).slice(0, 300))); };
const done = (name) => { console.log(`${nbad ? 'FAIL' : 'PASS'} ${name}: ${nbad} failed`); process.exit(nbad ? 1 : 0); };
module.exports = { PW, GAME_DIR, sleep, boot, open, ok, done, UA, bad: () => nbad };
