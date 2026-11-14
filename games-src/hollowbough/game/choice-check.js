// Forces a "take a meadow card" choice and checks: hand tap answers; the big meadow card is not covered by the hand strip. NODE_PATH=/opt/node-tools/node_modules node choice-check.js
const PW = require('playwright'), path = require('path'), gx = require('../../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const URL = await gx.url('hollowbough', { file: path.join(__dirname, 'hollowbough.html') }), b = await PW.chromium.launch(); let bad = 0;
  for (const [W, H] of [[375, 553], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true }), p = await ctx.newPage();
    await p.goto(URL); await sleep(500);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 50; UI.opt = { np: 2, level: 'normal', solo: 1 }; newGame('vs'); });
    await sleep(600);
    const st = await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (st) await st.tap().catch(() => { }); await sleep(600);
    // give seat 0 a hand, then ask a meadow choice
    await p.evaluate(() => { const me = G.players[0]; while (me.hand.length < 3) me.hand.push(G.deck.pop()); const c = G.meadow.filter(i => i >= 0); HB._.withG(G, () => HB._.ask(0, 'meadow', 'Take a card from the meadow', c.map(id => ({ label: 'Take ' + id, card: id, h: 'mtakeOne', d: { seat: 0, card: id, left: 1 } })))); render(); });
    await sleep(500);
    const r = await p.evaluate(() => {
      const hs = document.querySelector('.strip.hand'), hr = hs && hs.getBoundingClientRect(), vis = [...document.querySelectorAll('.pv-mead .sc, .pv-mead .glow, .pv-mead [data-t]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.bottom > 0 && r.top < innerHeight; });
      const over = vis.map(e => { const r = e.getBoundingClientRect(); return hr ? Math.max(0, r.bottom - Math.max(r.top, hr.top)) : 0; });
      const hc = [...document.querySelectorAll('.hc')].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.top >= 0 && r.bottom <= innerHeight && x.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); });
      let hx = null; if (hc) { const r = hc.getBoundingClientRect(); hx = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
      return { handTop: hr && Math.round(hr.top), n: vis.length, maxOver: Math.round(Math.max(0, ...over)), hx, handDisp: hs && getComputedStyle(hs).display + '/' + getComputedStyle(hs).opacity, tab: UI.pvTab };
    });
    console.log(W + 'x' + H, JSON.stringify(r));
    if (r.maxOver > 2) { bad++; console.log('FAIL meadow card covered by hand strip by', r.maxOver, 'px'); }
    await p.screenshot({ path: path.join(__dirname, 'shots', `choice_${W}x${H}.png`) });
    if (r.hx) { await p.evaluate(() => document.getElementById('toast').classList.remove('on')); await p.touchscreen.tap(r.hx.x, r.hx.y); await sleep(150); const tx = await p.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('on') ? e.textContent : ''; }); console.log(' hand tap says:', JSON.stringify(tx)); if (!tx) bad++; } else console.log(' no tappable hand card (hidden)');
    await ctx.close();
  }
  await b.close(); console.log(bad ? 'CHOICE FAIL' : 'CHOICE PASS'); process.exit(bad ? 1 : 0);
})();
