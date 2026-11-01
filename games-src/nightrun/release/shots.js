#!/usr/bin/env node
// W294: store screenshots from real play of the unzipped store build (served over http, real input, audio muted by autoplay policy only).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/release/shots.js /tmp/nrzip games-src/nightrun/release/shots /tmp/gif
const PW = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const DIR = process.argv[2], OUT = process.argv[3], GIF = process.argv[4];
const MIME = { html: 'text/html', js: 'text/javascript', json: 'application/json', webp: 'image/webp', png: 'image/png', mp3: 'audio/mpeg', webmanifest: 'application/manifest+json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = http.createServer((q, res) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(DIR, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', MIME[f.split('.').pop()] || 'application/octet-stream'); fs.createReadStream(f).pipe(res); }).listen(18103, '127.0.0.1');
const J = { type: 'jpeg', quality: 85 };
async function open(br, W, H) { const c = await br.newContext({ viewport: { width: W, height: H } }); const p = await c.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_tut', '2'); } catch (e) { } });
  await p.goto('http://127.0.0.1:18103/index.html'); await p.waitForFunction(() => window.__mnr); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 20000 }).catch(() => { }); await sleep(2500); return p; }
const cards = async p => { for (let i = 0; i < 8; i++) { await sleep(450); await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); } };
(async () => {
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  // 1280x720: title, flight, boss
  let p = await open(br, 1280, 720);
  await p.screenshot({ path: OUT + '/01-title-1280x720.jpg', ...J });
  await p.click('#focFlight'); await cards(p); await sleep(1500);
  await p.keyboard.down('Space');   // hold fire
  const rec = async (n, ms, dir) => { for (let i = 0; i < n; i++) { await p.screenshot({ path: `${GIF}/f${dir}${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 70 }); await sleep(ms); } };
  // flight: weave left/right for a moving shot; record 10 s of frames (every ~100 ms of wall time)
  let t0 = Date.now(), k = 0;
  while (Date.now() - t0 < 10000) { const d = (Math.floor((Date.now() - t0) / 900) % 2) ? 'ArrowLeft' : 'ArrowRight'; await p.keyboard.down(d);
    await p.screenshot({ path: `${GIF}/f${String(k++).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 70 }); await p.keyboard.up(d); }
  await p.screenshot({ path: OUT + '/02-flight-1280x720.jpg', ...J });
  console.log('gif frames', k, 'in', Date.now() - t0, 'ms');
  await p.evaluate(() => { try { __mnr.godMode = true; } catch (e) { } try { __mnr.spawnBoss(); } catch (e) { console.log('noboss', e.message); } });
  await sleep(6000); await p.screenshot({ path: OUT + '/04-boss-1280x720.jpg', ...J });
  await p.context().close();
  // street (on foot)
  p = await open(br, 1280, 720);
  await p.evaluate(() => { const f = [...document.querySelectorAll('button')].find(x => /ON FOOT/.test(x.textContent) && x.offsetParent); f && f.click(); }); await cards(p); await sleep(2500);
  await p.keyboard.down('d'); await sleep(6000); await p.screenshot({ path: OUT + '/03-street-1280x720.jpg', ...J }); await p.keyboard.up('d');
  await p.context().close();
  // 630x500 cover candidate: a flight frame at that size
  p = await open(br, 630, 500);
  await p.click('#focFlight'); await cards(p); await sleep(1500); await p.keyboard.down('Space'); await p.keyboard.down('ArrowRight'); await sleep(2500); await p.keyboard.up('ArrowRight');
  await p.screenshot({ path: OUT + '/cover-630x500.jpg', ...J });
  await br.close(); srv.close();
})();
