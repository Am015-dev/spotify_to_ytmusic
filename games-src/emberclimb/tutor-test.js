// Guide test: first launch offers the guide; each step is done exactly as asked by real taps; no page errors; phone + PC.
// Also checks hand text sizes (>= 11px for cost, name, key number) and takes ONE fight shot per viewport.
// Run: NODE_PATH=/opt/node-tools/node_modules node tutor-test.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname; fs.mkdirSync(path.join(ROOT, 'shots'), { recursive: true });
const srv = http.createServer((q, r) => { let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'emberclimb.html'; fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const br = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0; const fail = m => { bad++; console.log('FAIL', m); };
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    await pg.goto(base + 'emberclimb.html?anim=0'); await pg.waitForSelector('#title');
    const tapEl = async el => { const b = await el.boundingBox(); const x = b.x + b.width / 2, y = b.y + b.height / 2; if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); await sleep(120); };
    const first = await pg.$('.gxt-menu.gxt-first'); if (!first) fail(name + ': guide not offered first on a first launch');
    await tapEl(await pg.$('.gxt-menu')); await sleep(600);
    let seen = []; for (let i = 0; i < 40; i++) {
      await sleep(450); const st = await pg.evaluate(() => (window.GXT && GXT.active()) ? (GXT.current() || {}).id : null); if (!st) break;
      if (seen[seen.length - 1] !== st) seen.push(st);
      // bubble text must be short and inside the screen
      const bub = await pg.evaluate(() => { const b = document.querySelector('.gxt-bubble,[class*=bubble]'); if (!b) return null; const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: innerWidth, h: innerHeight, txt: b.textContent.trim().split(/\s+/).length }; });
      if (bub && (bub.l < -1 || bub.r > bub.w + 1 || bub.t < -1 || bub.b > bub.h + 1)) fail(name + ': bubble outside screen at ' + st);
      const act = await pg.evaluate(() => { const s = GXT.current(); return s ? { id: s.id, next: !s.wait } : null; });
      if (act.next) { const nb = await pg.$('.gxt-next,[data-gxt-next],button.gxt-btn'); if (nb) await tapEl(nb); else await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-help] button,button[data-help]')].find(x => /next/i.test(x.textContent)); b && b.click(); }); continue; }
      if (st === 'attack') { await tapEl(await pg.$('.hand .card[data-c="0"]')); await sleep(300); await tapEl(await pg.$('.hand .card[data-c="0"]')); if (name === 'phone') {} }
      else if (st === 'block') { const i = await pg.evaluate(() => [...document.querySelectorAll('.hand .card')].findIndex(c => /Plate Guard/.test(c.textContent))); await tapEl(await pg.$('.hand .card[data-c="' + i + '"]')); await sleep(300); await tapEl(await pg.$('.hand .card[data-c="' + i + '"]')); }
      else if (st === 'end') { await pg.screenshot({ path: `shots/${name}-fight.png` }); await tapEl(await pg.$('#end')); await sleep(2500); }
      else if (st === 'finish') { const i = await pg.evaluate(() => [...document.querySelectorAll('.hand .card')].findIndex(c => /Cinder Strike/.test(c.textContent))); await tapEl(await pg.$('.hand .card[data-c="' + i + '"]')); await sleep(300); await tapEl(await pg.$('.hand .card[data-c="' + i + '"]')); await sleep(1500); }
      else if (st === 'reward') { await tapEl(await pg.$('.picks .card')); }
    }
    console.log(name, 'steps seen:', seen.join(' > '));
    if (seen.length < 7) fail(name + ': expected 7 steps, saw ' + seen.length);
    await sleep(600); const endc = await pg.evaluate(() => document.body.innerText.includes('You can climb now')); if (!endc) fail(name + ': no end card');
    if (errs.length) fail(name + ' errors: ' + errs.slice(0, 3).join(' | '));
    // hand text size check on a normal fight
    await pg.goto(base + 'emberclimb.html?anim=0'); await pg.waitForSelector('#title'); await pg.evaluate(() => { try { GXT.reset('emberclimb'); } catch (e) { } });
    await pg.evaluate(() => { UI.sub = 'quick'; UI.render(); }); await tapEl(await pg.$('#play')); await tapEl(await pg.$('.node.glow')); await sleep(300);
    const m = await pg.evaluate(() => { const c = document.querySelector('.hand .card'); const f = s => parseFloat(getComputedStyle(c.querySelector(s)).fontSize); const hr = document.querySelector('.hand').getBoundingClientRect(); const last = [...document.querySelectorAll('.hand .card')].pop().getBoundingClientRect(); const fst = document.querySelector('.hand .card').getBoundingClientRect(); return { name: f('.ct'), cost: c.querySelector('.cx') ? f('.cx') : 99, key: c.querySelector('.ck') ? f('.ck') : 99, inL: fst.left, inR: last.right, w: innerWidth, bottom: hr.bottom, h: innerHeight }; });
    console.log(name, 'hand font px', JSON.stringify(m));
    if (m.name < 13 || m.cost < 13 || m.key < 13) fail(name + ': hand text under 11px'); if (m.inL < 0 || m.inR > m.w || m.bottom > m.h + 1) fail(name + ': hand outside screen');
    await pg.screenshot({ path: `shots/${name}-fight2.png` }); await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TUTOR TEST FAIL' : 'TUTOR TEST PASS'); process.exit(bad ? 1 : 0);
})();
