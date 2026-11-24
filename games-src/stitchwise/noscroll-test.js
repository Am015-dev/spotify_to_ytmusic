// W767 no-scroll gate: phone 402x874 and PC 1366x768, every phase. Fails if the page scrolls (scrollHeight > innerHeight) or if any
// enabled action button is outside the viewport, clipped by a scrolling parent, or covered (elementFromPoint at its centre is not it).
// Phases: choose (sw-board), placing (tap an offer), advance, income, leather (free 1x1), torn, result, zoom. Turbo, < 60 s per size.
// Also run at 402x720 and 1366x640: the owner plays inside a browser, whose bars eat ~150 px of height.
// usage: node noscroll-test.js [url]   (default http://localhost:8779/stitchwise/)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../scripts/turbo');
const URL0 = process.argv[2] || 'http://localhost:8779/stitchwise/';
const PROBE = () => {
  const out = { sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, bad: [], btns: [] };
  const modal = [...document.querySelectorAll('.ov:not([hidden]), .gx-drawer.on')].filter(e => e.offsetParent || getComputedStyle(e).position === 'fixed').pop();
  const sel = modal ? 'button' : 'button[data-a], header.gx-bar button';
  (modal || document).querySelectorAll(sel).forEach(b => {
    const cs = getComputedStyle(b); if (b.disabled || !b.offsetParent || cs.visibility === 'hidden' || +cs.opacity < .1) return;
    const r = b.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const rd = b.closest('.gx-drawer-body'); if (rd && rd.scrollHeight > rd.clientHeight + 2) return; // a reading window (rules text) may scroll inside itself; the game screen may not
    const name = (b.dataset.a || b.getAttribute('aria-label') || b.textContent).trim().slice(0, 20);
    out.btns.push(name + '@' + Math.round(r.top) + '-' + Math.round(r.bottom));
    if (r.bottom > innerHeight + 1 || r.top < -1 || r.right > innerWidth + 1 || r.left < -1) { out.bad.push('off-viewport ' + name + ' y=' + Math.round(r.top) + '..' + Math.round(r.bottom)); return; }
    for (let a = b.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/(auto|scroll|hidden)/.test(s.overflowY + s.overflowX) && (a.scrollHeight > a.clientHeight + 2 || a.scrollWidth > a.clientWidth + 2)) { const q = a.getBoundingClientRect(); if (r.bottom > q.bottom + 1 || r.top < q.top - 1) { out.bad.push('clipped-by-scroll ' + name + ' in ' + (a.id || a.className).toString().slice(0, 20) + ' ' + Math.round(r.top) + '-' + Math.round(r.bottom) + ' vs ' + Math.round(q.top) + '-' + Math.round(q.bottom)); return; } } }
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (e && !b.contains(e) && !e.contains(b)) out.bad.push('covered ' + name + ' by ' + (e.id || e.className || e.tagName).toString().slice(0, 30));
  });
  if (out.sh > out.ih + 1) out.bad.push('page scrolls ' + out.sh + '>' + out.ih); if (out.sw > out.iw + 1) out.bad.push('page scrolls sideways ' + out.sw + '>' + out.iw);
  return out;
};
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  const SIZES = [[402, 874, true], [1366, 768, false], [402, 720, true], [1366, 640, false]]; // last two: the same screens inside a real browser (address bar, tabs)
  for (const [W, H, mob] of SIZES) {
    const t0 = Date.now(), stop = budget(60000, 'noscroll ' + W);
    const c = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob }); await turbo(c);
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    const run = async (label, scn, then) => {
      await p.goto(URL0 + '?scn=' + scn); await tick(p, 800); if (then) { await then(); await tick(p, 400); }
      const r = await p.evaluate(PROBE); const ok = !r.bad.length; if (!ok) fail++;
      console.log((ok ? 'ok  ' : 'FAIL') + ' ' + W + 'x' + H + ' ' + label + (ok ? '' : ': ' + r.bad.join('; ')) + (process.env.V ? '\n     ' + r.btns.join(' ') : ''));
    };
    const tapOffer = async () => { const l = p.locator('.offer.can').first(); if (await l.count()) { if (mob) await l.tap(); else await l.click(); } };
    await run('choose', 'sw-board'); await run('placing', 'sw-board', tapOffer); await run('placing-place', 'sw-place', tapOffer);
    for (const s of ['sw-advance', 'sw-income', 'sw-leather', 'sw-torn', 'sw-result', 'sw-zoom', 'menu']) await run(s.replace('sw-', ''), s);
    if (errs.length) { fail++; console.log('FAIL ' + W + ' js errors: ' + errs.slice(0, 3).join(' | ')); }
    console.log('time ' + W + 'x' + H + ': ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s'); stop(); await c.close();
  }
  await b.close(); console.log(fail ? 'FAIL ' + fail : 'PASS'); process.exit(fail ? 1 : 0);
})();
