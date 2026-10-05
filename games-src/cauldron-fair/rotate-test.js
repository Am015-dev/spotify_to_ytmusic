// Rotation / orientation responsiveness test. Usage: (python3 -m http.server 8096 in this dir) NODE_PATH=/opt/node-tools/node_modules node rotate-test.js
// For each tap it records: did the click reach the intended element, latency touchstart->click, and what elementFromPoint says at the centre.
const PW = require(process.env.PW || 'playwright');
const URL = process.env.URL || 'http://localhost:8096/cauldron-fair.html';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const LIMIT = +process.env.LIMIT || 150;
let bad = 0; const rows = [];
const fail = (...a) => { bad++; console.log('FAIL', ...a); };
async function newPage(b, W, H) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA });
  const p = await ctx.newPage(); p.setDefaultTimeout(20000); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  await p.addInitScript(() => {
    window.__T = { ts: 0, clicks: [], long: [] };
    addEventListener('touchstart', () => { __T.ts = performance.now(); }, true);
    addEventListener('click', e => { __T.clicks.push({ t: performance.now(), tg: e.target, m: !!(window.__S && e.target.closest && e.target.closest(window.__S)) || !!(window.__E && window.__E.contains(e.target)) }); }, true);
    try { new PerformanceObserver(l => l.getEntries().forEach(e => __T.long.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch (e) { }
  });
  return p;
}
async function rotate(p, W, H) {
  await p.setViewportSize({ width: W, height: H });
  await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); });
  await p.waitForTimeout(700);
}
// tap the centre of the first visible element matching sel; returns result row
async function tapSel(p, tag, name, sel, opt) {
  opt = opt || {};
  const info = await p.evaluate(s => {
    const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && !x.closest('[hidden]') && !x.disabled; });
    if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const h = document.elementFromPoint(x, y); window.__T.clicks.length = 0; window.__T.long.length = 0; window.__T.ts = 0; window.__E = e; window.__S = s;
    return { x, y, inVP: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight, covered: !(h && e.contains(h)), by: h && (h.id || (h.className && h.className.baseVal) || h.className || h.tagName), pe: getComputedStyle(e).pointerEvents };
  }, sel);
  if (!info) { if (!opt.optional) { rows.push({ tag, name, ok: false, why: 'not found' }); fail(tag, name, 'not found'); } return null; }
  await p.touchscreen.tap(info.x, info.y); await p.waitForTimeout(opt.wait || 350);
  const r = await p.evaluate(() => { const T = __T, e = window.__E; const c = T.clicks.find(c => c.m); return { hit: !!c, lat: c && T.ts ? Math.round(c.t - T.ts) : null, long: T.long.slice(), n: T.clicks.length, tg: T.clicks.map(c => (c.tg.id || c.tg.className && (c.tg.className.baseVal || c.tg.className) || c.tg.tagName) + (document.contains(c.tg) ? '' : '(detached)')).join(','), eAttached: document.contains(e) }; });
  const ok = info.inVP && !info.covered && r.hit && r.lat !== null && r.lat < LIMIT;
  rows.push({ tag, name, ok, lat: r.lat, why: ok ? '' : (!info.inVP ? 'offscreen' : info.covered ? 'covered by ' + info.by : !r.hit ? 'click never arrived' : 'slow') });
  if (!ok) { const who = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); const c = h && h.closest('[id]'); return h && ((h.dataset && h.dataset.a) + ' in #' + (c && c.id) + ' "' + (h.textContent || '').slice(0, 30) + '" rsHidden=' + document.querySelector('#rs').hidden + ' phase=' + (window.G && G.phase) + ' acts=' + [...document.querySelectorAll('#acts button')].map(e => { const r = e.getBoundingClientRect(); return e.className + '@' + [r.left, r.top, r.right, r.bottom].map(Math.round); }).join(';')); }, [info.x, info.y]); fail(tag, name, JSON.stringify({ ...info, ...r }), who); }
  else if (r.long.length) console.log('  longtask after', tag, name, r.long);
  return r;
}
const closeDrawer = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(300); const on = await p.$('.gx-drawer.on'); if (on) { await p.evaluate(() => { const e = document.querySelector('.gx-drawer.on [data-gx-close],.gx-drawer.on .gx-x,.gx-drawer.on button'); e && e.click(); }); await p.waitForTimeout(300); } };
async function scrollCheck(p, tag) { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth, bw: document.body.scrollWidth })); if (r.w > r.vw + 1 || r.h > r.vh + 1 || r.bw > r.vw + 1) fail(tag, 'scroll/overflow', JSON.stringify(r)); }
async function cutCheck(p, tag) {
  const bad = await p.evaluate(() => { const o = []; for (const e of document.querySelectorAll('.gx-bar button,#acts button,#prompt,#me')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || r.left < -1 || r.top < -1) { let sc = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 1 && r.right <= innerWidth + 1) { sc = true; break; } } if (sc) continue; } else continue; const d = document.querySelector('#dockbody'); o.push(e.textContent.trim().slice(0, 25) + '|' + e.className + '|' + (d ? 'dockbody sh=' + d.scrollHeight + ' ch=' + d.clientHeight + ' ov=' + getComputedStyle(d).overflowY + ' ' : '') + (e.dataset.gx || e.dataset.a || e.id || e.className) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); } return o; });
  if (bad.length) { fail(tag, 'cut off', JSON.stringify(bad)); if (process.env.SHOTS) await p.screenshot({ path: process.env.SHOTS + '/cut-' + tag.replace(/\W+/g, '_') + '.png' }); }
}
// one pass over every visible control in the current orientation
async function pass(p, tag) {
  await toNextTurn(p, tag); await scrollCheck(p, tag); await cutCheck(p, tag);
  // game buttons: DRAW then Stop-adjacent controls
  await tapSel(p, tag, 'DRAW', '#acts .drawb');
  await p.waitForTimeout(900);
  await tapSel(p, tag, 'DRAW2', '#acts .drawb', { optional: true });
  await p.waitForTimeout(900);
  await tapSel(p, tag, 'flask', '#acts .flaskb,#acts [data-a=flask],.flask', { optional: true });
  await tapSel(p, tag, 'thumb', '#others .th', { optional: true }); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.focus = viewSeat(); render(); }); await p.waitForTimeout(200);
  for (const id of ['scored', 'rulesd', 'setd']) {
    await tapSel(p, tag, 'bar ' + id, `.gx-bar [data-gx=${id}]`);
    const on = await p.evaluate(() => !!document.querySelector('.gx-drawer.on')); if (!on) fail(tag, 'drawer did not open', id);
    await scrollCheck(p, tag + ' drawer ' + id); await closeDrawer(p);
  }
  await tapSel(p, tag, 'Stop', '#acts .stopb');
  await toNextTurn(p, tag);
}
// after Stop: tap through the day report / shop / questions with real touches (each tap measured) until Draw is back
async function toNextTurn(p, tag) {
  const sels = [['report take', '#rs [data-a=take],#rs [data-a=hotgo]'], ['report continue', '#rs [data-a=rscont]'], ['shop buy', '#rs [data-a=shopbuy]'], ['report choice', '#rs .dec [data-a=mv]'], ['tip ok', '#pc [data-a=tipok]'], ['question', '#qbox [data-a=mv]']];
  for (let k = 0; k < 60; k++) {
    if (await p.$('#acts .drawb') && await p.evaluate(() => document.querySelector('#rs').hidden)) { await p.waitForTimeout(300); return; }
    let did = false;
    for (const [n, s] of sels) { if (await tapSel(p, tag, n, s, { optional: true, wait: 250 })) { did = true; break; } }
    if (!did) await p.waitForTimeout(400);
  }
  fail(tag, 'never got back to a Draw turn');
}
async function startGame(p) {
  await p.goto(URL); await p.waitForTimeout(1200);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await p.touchscreen.tap(...await centre(p, '[data-a=play]')); await p.waitForTimeout(400);
  await p.evaluate(() => { UI.prefs.blgSeen = true; UI.seed = 5; UI.coach.level = 'off'; });
  await p.touchscreen.tap(...await centre(p, '[data-start=vs]')); await p.waitForTimeout(1200);
  for (let k = 0; k < 30; k++) { if (await p.$('#acts .drawb')) break; const q = await p.$('#qbox [data-a=mv],#acts [data-a=mv],#pc [data-a=tipok]'); if (q) await q.tap().catch(() => { }); await p.waitForTimeout(400); }
}
const centre = (p, s) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
async function lat(p) { return p.evaluate(() => { const o = []; return new Promise(res => { let n = 0, last = performance.now(), mx = 0; const t = setInterval(() => { const now = performance.now(); mx = Math.max(mx, now - last - 50); last = now; if (++n > 20) { clearInterval(t); res(Math.round(mx)); } }, 50); }); }); }
(async () => {
  const b = await PW.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const sizes = (process.env.SIZES || '390x763,844x390,667x375').split(',').map(s => s.split('x').map(Number));
  // 1. portrait -> landscape -> portrait, per landscape size
  for (const [LW, LH] of sizes.filter(s => s[0] > s[1])) {
    const p = await newPage(b, 390, 763); await startGame(p);
    await pass(p, `P(390x763)`);
    await rotate(p, LW, LH); console.log(`rotated to ${LW}x${LH}; main-thread stall ms:`, await lat(p), 'html:', await p.evaluate(() => document.documentElement.className));
    await pass(p, `L(${LW}x${LH})`);
    await rotate(p, 390, 763); await pass(p, `P-again`);
    await rotate(p, LW, LH); await pass(p, `L-again(${LW}x${LH})`);
    if (p.errs.length) fail('page errors', p.errs.slice(0, 3).join(' | '));
    await p.context().close();
  }
  // 2. start directly in landscape
  for (const [LW, LH] of sizes.filter(s => s[0] > s[1])) {
    const p = await newPage(b, LW, LH); await startGame(p); await pass(p, `direct-L(${LW}x${LH})`);
    if (p.errs.length) fail('page errors', p.errs.slice(0, 3).join(' | '));
    await p.context().close();
  }
  await b.close();
  const lats = rows.filter(r => r.lat != null).map(r => r.lat); lats.sort((a, c) => a - c);
  console.log(`taps ${rows.length}, responded ${rows.filter(r => r.ok).length}, median ${lats[lats.length >> 1]}ms, max ${lats[lats.length - 1]}ms`);
  console.log(bad ? `PROBLEMS ${bad}` : 'ALL OK');
  process.exit(bad ? 1 : 0);
})();
