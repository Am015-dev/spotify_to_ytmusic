// Phone sizes gate (R19 row 5): at 390x844 and 375x667, on a mid-game board (?scn=pp-chain), tray cards, hand cards and board birds
// are tap targets of at least 44x44 px, tray and hand cards show the bird's name, and no visible game text is under 14 px.
//   node tests/phone-sizes.js [url] [shotdir]
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/', SHOT = process.argv[3] || 'shots';
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('pp-played', '1'); } catch (e) { } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + '?scn=pp-chain'); await p.waitForSelector('#tray .bc', { timeout: 15000 }); await p.waitForTimeout(1500);
    const m = await p.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const box = sel => [...document.querySelectorAll(sel)].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), name: !!(e.querySelector('.nm,.hn,.bk-nm') && e.querySelector('.nm,.hn,.bk-nm').textContent.trim()) }; });
      let small = []; document.querySelectorAll('.gx-main *').forEach(e => { if (!vis(e)) return; const t = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' '); if (!t) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 14) small.push(fs + 'px "' + t.slice(0, 18) + '" ' + (e.className || e.tagName)); });
      return { tray: box('#tray .bc'), hand: box('#hand .bc'), board: box('#mat .slot .bc'), small };
    });
    const mn = a => a.length ? a.reduce((x, y) => ({ w: Math.min(x.w, y.w), h: Math.min(x.h, y.h) })) : { w: 0, h: 0 };
    for (const k of ['tray', 'hand', 'board']) { const s = mn(m[k]); ok(m[k].length && s.w >= 44 && s.h >= 44, `${w}x${h} ${k} cards ${m[k].length}, smallest ${s.w}x${s.h}`); }
    ok(m.tray.every(x => x.name), `${w}x${h} every tray card shows its name`);
    ok(m.hand.every(x => x.name), `${w}x${h} every hand card shows its name`);
    ok(m.small.length === 0, `${w}x${h} text under 14 px: ${m.small.length} ${m.small.slice(0, 4).join(' | ')}`);
    ok(errs.length === 0, `${w}x${h} page errors ${errs.length}`);
    await p.screenshot({ path: `${SHOT}/sizes-${w}.png` });
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
