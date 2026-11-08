/* Feel shots (BRIEF-GAMEFEEL point 8): title, Learn first screen, Goal card, first turn, mid-game, rival turn, result,
   at 390x844 (touch) and 1440x900 (mouse). Plays a whole race by real taps; fails on page errors or a stuck state.
   Usage: PW=../node_modules/playwright node shoot-feel.js [--noshots] */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
const OUT = path.join(__dirname, 'playable-shots', 'feel'), SHOTS = !process.argv.includes('--noshots');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let bad = 0;
  for (const [n, vp, t] of [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]]) {
    const c = await b.newContext({ viewport: vp, hasTouch: t, isMobile: t, deviceScaleFactor: 1 }), p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const shot = async s => { if (SHOTS) await p.screenshot({ path: path.join(OUT, `${s}-${n}.png`) }); };
    const tap = async sel => { const el = await p.$(sel); if (!el) return false; const bb = await el.boundingBox(); if (!bb) return false;
      const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; if (t) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); return true; };
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=7', { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await shot('1-title');
    // Learn to play first screen
    if (await tap('#tutSlot button')) { await p.waitForTimeout(800); await shot('2-learn'); }
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=7', { waitUntil: 'load' });
    await p.evaluate(() => { try { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); } catch (e) {} }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    await tap('#playB'); await p.waitForTimeout(1200);
    if (await p.$('#goalB')) { await shot('3-goal'); await tap('#goalB'); }
    await p.evaluate(() => { window.AIDELAY = 0.04; });
    let turns = 0, rivalShot = false, stuck = 0, last = '';
    for (let i = 0; i < 2500; i++) {
      await p.waitForTimeout(150);
      const st = await p.evaluate(() => ({ ph: G.phase, busy: UI.busy, over: !!G.over, modal: !document.getElementById('modal').hidden, r: G.round }));
      if (st.over) break;
      if (st.busy) { if (!rivalShot && turns === 2) { await p.waitForTimeout(900); await shot('6-rival'); rivalShot = true; await p.evaluate(() => { window.AIDELAY = 0.04; }); } continue; }
      if (st.modal) { const ok = await tap('#modal button.big') || await tap('#modal .gx-x') || await tap('#mx'); await p.waitForTimeout(300); if (!ok) stuck++; continue; }
      if (st.ph === 'plan' && await p.$('#goB')) {
        // pick gear 2 if allowed (or 1), then tap needed cards by touch
        const g = (turns % 3 === 2) ? 3 : 2; if (!(await tap(`.gb[data-g="${g}"]:not([disabled])`))) await tap('.gb:not([disabled])');
        await p.waitForTimeout(200); if (turns === 0) await shot('4-first-turn');
        for (let k = 0; k < 5 && await p.$('#goB[disabled]'); k++) { if (!(await tap('#hand .cd.glow')) && !(await tap('#hand .cd:not(.on):not(.dim)'))) break; await p.waitForTimeout(150); }
        if (turns === 4) await shot('5-mid');
        if (await p.$('#goB[disabled]')) { await tap('.gb[data-g="1"]'); await p.waitForTimeout(150); if (await p.$('#goB[disabled]')) await tap('#hand .cd:not(.on)'); }
        if (turns === 10) { const small = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { if (!e.childNodes.length || ![...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width && r.height && cs.visibility !== 'hidden' && parseFloat(cs.fontSize) < 14 && r.bottom > 0 && r.top < innerHeight; }).map(e => (e.id || e.className || e.tagName) + ':' + getComputedStyle(e).fontSize + ':' + e.textContent.trim().slice(0, 18))); console.log('SMALL ' + n + ' ' + small.length + ' ' + small.slice(0, 30).join(' | ')); }
        await p.evaluate(t => { window.AIDELAY = t === 2 ? 1 : 0.04; }, turns); console.log('turn ' + n + ' ' + turns);
        await tap('#goB'); turns++; stuck = 0; continue;
      }
      // React step or other buttons in panel
      const key = st.ph + st.r; if (key === last) stuck++; else stuck = 0; last = key;
      if (!(await tap('#panel button.go:not([disabled])')) && !(await tap('#panel button.big')) && !(await tap('#panel button:not([disabled])'))) {}
      if (stuck > 30) { console.log('STUCK ' + n + ' at ' + key); bad++; break; }
    }
    await p.waitForTimeout(2500); await shot('7-result');
    const end = await p.evaluate(() => ({ ph: G.phase, over: G.over, r: G.round }));
    console.log((errs.length ? 'FAIL ' : 'PASS ') + n + ' turns=' + turns + ' end=' + JSON.stringify(end) + (errs.length ? ' ' + errs[0] : '')); bad += errs.length; await c.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
