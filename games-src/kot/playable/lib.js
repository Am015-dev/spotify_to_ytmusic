// Crown City Smash playable-check helpers: UI taps only (a tap is made at the centre of an element after elementFromPoint proves it is the element on top).
const path = require('path'), http = require('http'), fs = require('fs');
const PW = require(path.resolve(__dirname, '../../node_modules/playwright'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const EXE = process.env.CHR || undefined;
async function launch() { return PW.chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }) }
async function open(b, w, h, url, qs = '') {
  const touch = w < 700;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const p = await ctx.newPage(); p.setDefaultTimeout(30000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g|404|WebGL|certificate/i.test(m.text())) p.errs.push(m.text().slice(0, 160)) });
  await p.goto(url + qs); await p.waitForSelector('[data-start]'); await sleep(1500);
  return { ctx, p };
}
// tap the centre of the first visible element matching sel whose centre is not covered; returns true if tapped
async function tapSel(p, sel, { text, nth = 0 } = {}) {
  const pt = await p.evaluate(({ sel, text, nth }) => {
    const out = []; for (const e of document.querySelectorAll(sel)) {
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || e.disabled || e.getAttribute('aria-disabled') === 'true') continue;
      if (text && !new RegExp(text, 'i').test(e.textContent)) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      const t = document.elementFromPoint(x, y); if (!t || !(t === e || e.contains(t) || t.contains(e))) continue;
      out.push([x, y]);
    } return out[nth] || null
  }, { sel, text, nth });
  if (!pt) return false; await p.mouse.click(pt[0], pt[1]); return true
}
// one decision of a human who only taps what is visible and on top
async function step(p) {
  if (await tapSel(p, '.gxh-ok')) return 'hint';
  if (await tapSel(p, '#choice:not(.hidden) [data-opt]', { text: 'stay|keep|ok|continue|let|smash|start|begin|play', })) return 'opt';
  if (await tapSel(p, '#choice:not(.hidden) [data-opt]')) return 'opt2';
  if (await tapSel(p, '#choice [data-intro], #choice button.go, #choice .btn.pri, #choice button', { text: "let.?s smash|begin|start|play|continue|close|ok" })) return 'intro';
  if (await tapSel(p, '#pacts [data-act="resolve"]')) return 'smash';
  if (await tapSel(p, '#pacts [data-act="reroll"]')) return 'roll';
  if (await tapSel(p, '#pacts [data-act="end"]')) return 'end';
  return null
}
module.exports = { PW, sleep, launch, open, tapSel, step };
