// Learn-to-play walk (owner rule 8 Nov: gameplay first): a phone taps "Learn in 5 minutes" and then ONLY what the guided game highlights
// (the glowing target of each step, "Place here" after a square, Next on explain steps, "Play a real game" at the end), by touch.
// Asserts: every core rule step appears, in order (TUT_RULES in src/tutor.js); each step says ONE sentence of 12 words or fewer;
// no rule is deferred to a "later" list; after the end card a real game is running (not the tutorial).
//   cd games-src/carc/game/src && python3 build.py && NODE_PATH=/opt/node-tools/node_modules node ../tut-walk-test.js [390x844,375x667]
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const SIZES = (process.argv[2] || '390x844,375x667').split(',').map(s => s.split('x').map(Number));
let bad = 0; const fail = (...a) => { bad++; console.log('FAIL', ...a); };
const centre = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
(async () => {
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.goto(URL); await sleep(1500);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } AIDELAY = 60; UI.speed = 30; UI.offered = false; UI.first = true; showStart(); });
    const tap = async (pt, what) => { if (!pt) return false; const ok = await p.evaluate(({ x, y }) => { const t = document.elementFromPoint(x, y); return !!t; }, pt); if (!ok) fail(W + 'x' + H, 'nothing at', what); await p.touchscreen.tap(pt.x, pt.y); return true; };
    await tap(await centre(p, '[data-a=play]'), 'Play'); await sleep(500);
    if (!await tap(await centre(p, '#modal [data-a=learn]'), 'Learn')) fail(W + 'x' + H, 'no Learn in 5 minutes offer');
    await sleep(1200);
    const rules = await p.evaluate(() => TUT_RULES), seen = [], says = {}; let taps = 0, t0 = Date.now(), endOk = false;
    while (Date.now() - t0 < 150000) {
      const st = await p.evaluate(() => { const c = typeof GXT !== 'undefined' && GXT.active() && GXT.current(); if (!c) return null; const b = document.querySelector('.gxt-bub .gxh-tx') || document.querySelector('.gxt-bub');
        let r = null; try { const t = typeof c.target === 'function' ? c.target() : null; const q = t && (t.getBoundingClientRect ? t.getBoundingClientRect() : t); if (q && q.width) r = { x: q.left + q.width / 2, y: q.top + q.height / 2 }; } catch (e) { }
        return { id: c.id, next: !c.wait, text: b ? b.textContent.trim() : '', r }; });
      if (!st) { const e = await centre(p, '[data-gxt-end="play"]'); if (e) { await tap(e, 'Play a real game'); await sleep(1500); endOk = true; } break; }
      if (seen[seen.length - 1] !== st.id) { seen.push(st.id); says[st.id] = st.text; if (process.env.SHOTS) { await sleep(400); await p.screenshot({ path: path.join(process.env.SHOTS, W + '-' + String(seen.length).padStart(2, '0') + '-' + st.id + '.png') }); } }
      if (st.next) { const n = await centre(p, '.gxt-next'); if (n) { await sleep(650); await tap(n, 'Next ' + st.id); taps++; await sleep(500); } else await sleep(200); continue; }
      if (st.r) { await tap(st.r, st.id); taps++; await sleep(350); const hp = await centre(p, '#hplace'); if (hp) { await tap(hp, 'Place here'); taps++; } await sleep(700); } else await sleep(250);
    }
    const tag = W + 'x' + H;
    const missing = rules.filter(r => !seen.includes(r)); if (missing.length) fail(tag, 'rule steps never shown:', missing.join(', '));
    const order = seen.filter(r => rules.includes(r)); if (order.join() !== rules.filter(r => order.includes(r)).join()) fail(tag, 'rule steps out of order:', order.join(','));
    for (const id of seen) { const w = (says[id] || '').split(/\s+/).filter(Boolean).length;
      if (w > 12) fail(tag, 'step', id, 'has', w, 'words:', says[id]); }
    if (await p.evaluate(() => /learn later/i.test(document.body.innerText))) fail(tag, 'a "learn later" list is shown');
    if (!endOk) fail(tag, 'no "Play a real game" end card');
    const real = await p.evaluate(() => !!G && !G.over && !UI.tut && !(typeof GXT !== 'undefined' && GXT.active()) && G.order.length === 1);
    if (!real) fail(tag, 'no real game after the tutorial');
    if (errs.length) fail(tag, 'page errors:', errs.slice(0, 2).join(' | '));
    console.log(tag, 'steps', seen.length, 'taps', taps, Math.round((Date.now() - t0) / 1000) + 's', 'order:', seen.join(' > '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? 'TUT WALK FAIL ' + bad : 'TUT WALK PASS'); process.exit(bad ? 1 : 0);
})();
