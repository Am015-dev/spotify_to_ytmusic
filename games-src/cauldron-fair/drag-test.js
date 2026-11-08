// W471: drag a choice card onto the cauldron with real touch events (390x844), and a shop chip onto the bag. node drag-test.js
const { chromium } = require('playwright'); const gx = require('../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const url = await gx.url('cauldron-fair', { file: __dirname + '/cauldron-fair.html' });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(url); await sleep(1500);
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const drag = async (a, z) => { await touch('touchStart', a.x, a.y); for (let k = 1; k <= 12; k++) { await touch('touchMove', a.x + (z.x - a.x) * k / 12, a.y + (z.y - a.y) * k / 12); await sleep(16); } const glow = await p.evaluate(() => !!document.querySelector('.droptgt.dropover')); await touch('touchEnd'); await sleep(500); return glow; };
  const ctr = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const lb = await p.$$eval('button', bs => { const e = bs.find(x => /New here|Learn/i.test(x.textContent) && x.getBoundingClientRect().width); if (e) e.setAttribute('data-t', 'l'); return !!e; });
  const l = await ctr('[data-t=l]'); await p.touchscreen.tap(l.x, l.y); await sleep(2500);
  await p.evaluate(() => { const o = document.querySelector('#coach [data-cx=ok]'); if (o) o.click(); });
  const before = await p.evaluate(() => G.players[0].rubies);
  const card = await p.evaluate(() => { const L = UI.legal[0] || []; const e = [...document.querySelectorAll('#qbox [data-a=mv]')].find(x => { const m = L[+x.dataset.i]; return m && m.o === 'rubies'; }); if (!e) return null; e.setAttribute('data-t', 'c'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const pot = await ctr('#cwrap');
  if (!card || !pot) { console.log('FAIL no card/pot', !!card, !!pot); process.exit(1); }
  const glow = await drag(card, pot); await sleep(800);
  const after = await p.evaluate(() => G.players[0].rubies);
  console.log((after === before + 3 && glow ? 'PASS' : 'FAIL') + ' card drag: rubies ' + before + ' -> ' + after + ', target glowed ' + glow);
  // shop: draw 3, stop, wait for the stalls, drag a chip onto the bag
  await p.evaluate(() => { AIDELAY = 60; });
  for (let i = 0; i < 3; i++) { const bg = await ctr('#acts .bagb:not(.off)'); if (bg) await p.touchscreen.tap(bg.x, bg.y); await sleep(1300); await p.evaluate(() => { document.querySelectorAll('#coach [data-cx=ok]').forEach(o => o.click()); }); }
  { const st = await ctr('#acts .stopb'); if (st) await p.touchscreen.tap(st.x, st.y); }
  let tok = null; for (let i = 0; i < 60 && !tok; i++) { await sleep(500); await p.evaluate(() => { document.querySelectorAll('#coach [data-cx=ok]').forEach(o => o.click()); const c = document.querySelector('#rs [data-a=repnext],#rs .confirm:not([disabled])'); if (c && !document.querySelector('#rs .tok')) c.click(); }); tok = await ctr('#rs .tok:not([disabled])'); }
  const bag = await ctr('#rs .sbimg');
  if (tok && bag) { const n0 = await p.evaluate(() => (UI.shopSel || []).length); const g2 = await drag(tok, bag); await sleep(700); const n1 = await p.evaluate(() => (UI.shopSel || []).length); console.log((n1 === n0 + 1 && g2 ? 'PASS' : 'FAIL') + ' shop drag: picked ' + n0 + ' -> ' + n1 + ', bag glowed ' + g2); if (!(n1 === n0 + 1 && g2)) errs.push('shop drag'); }
  else { console.log('FAIL shop not reached', !!tok, !!bag); errs.push('no shop'); }
  console.log('errors', errs.length, errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(after === before + 3 && glow && !errs.length ? 0 : 1);
})();
