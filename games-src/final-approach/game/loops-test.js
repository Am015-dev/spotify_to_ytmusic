// Calm + phone checks for Final Approach (run: NODE_PATH=../../node_modules node loops-test.js [file=final-approach.html])
// States: start, die lifted, 15 s after the bulb, 15 s after "What should I do?", 15 s with a die lifted. Passes only with 0 infinite animations running in every state
// (counted with document.getAnimations(): CSS and script loops), and at 375x553 and 375x667 every board space is >= 44 px and the altitude strip is not tappable.
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(__dirname, process.argv[2] || 'final-approach.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const url = await gx.url('final-approach', { file: FILE, query: '?phone=1' });
  const browser = await chromium.launch({ args: ['--no-sandbox'] }); let fails = 0;
  for (const [W, H] of [[375, 553], [375, 667]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(url); await sleep(2500);
    await p.evaluate(() => { try { GXH.setEnabled(false); } catch (e) { } try { GX.close(); } catch (e) { } UI.prefs.story = false; UI.seed = 1; newGame('vs', { scenario: 'g1', role: 0, level: 'normal', tipsOff: true }); });
    await sleep(2000); await p.tap('#acts [data-a=ready]'); await sleep(3500);
    const loops = () => p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).map(a => (a.animationName || a.constructor.name) + ' on ' + String(a.effect.target && a.effect.target.className && a.effect.target.className.baseVal != null ? a.effect.target.className.baseVal : (a.effect.target && a.effect.target.className) || '').slice(0, 30)));
    const row = {}; const rec = async k => { row[k] = await loops(); };
    await rec('start');
    await p.evaluate(() => { const d = document.querySelector('#pz .die.can'); d && d.click(); }); await sleep(600); await rec('lifted die');
    await p.evaluate(() => { const d = document.querySelector('#pz .die.sel'); d && d.click(); }); await sleep(300);
    await p.tap('#bulbbtn'); await sleep(15500); await rec('15 s after the bulb');
    const ask = await p.$('[data-a=ask]'); if (ask) { await ask.tap(); await sleep(15500); await rec('15 s after What should I do?'); }
    await p.evaluate(() => { const d = document.querySelector('#pz .die.can'); d && d.click(); }); await sleep(15500); await rec('15 s with a die lifted (hints on)');
    const m = await p.evaluate(() => { const s = [...document.querySelectorAll('#pz .slot')].map(e => e.getBoundingClientRect()); const a = document.querySelector('.w.altw'); return { minSlot: Math.min(...s.map(r => Math.min(r.width, r.height))), strip: a ? [a.getBoundingClientRect().height, getComputedStyle(a).pointerEvents] : null }; });
    console.log(W + 'x' + H, JSON.stringify(row), 'min space ' + m.minSlot.toFixed(1) + ' px', 'strip ' + JSON.stringify(m.strip));
    for (const k of Object.keys(row)) if (row[k].length) { fails++; console.log('FAIL loops in "' + k + '": ' + row[k].join('; ')); }
    if (m.minSlot < 44) { fails++; console.log('FAIL board space under 44 px'); }
    if (m.strip && m.strip[0] < 44 && m.strip[1] !== 'none') { fails++; console.log('FAIL altitude strip under 44 px and tappable'); }
    if (errs.length) { fails++; console.log('FAIL page errors', errs.slice(0, 3)); }
    await ctx.close();
  }
  await browser.close(); console.log(fails ? 'LOOPS FAIL' : 'LOOPS PASS'); process.exit(fails ? 1 : 0);
})();
