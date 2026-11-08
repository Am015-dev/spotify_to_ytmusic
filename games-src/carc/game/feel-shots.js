// Feel shots (BRIEF-GAMEFEEL point 8): title, learn-to-play first screen, goal card, first turn, mid-game, rival turn, result
// at 390x844 (touch) and 1440x900 (mouse), plus 375x667 checks. Prints overlaps, text under 14px, horizontal scroll and stuck states.
//   URL=http://localhost:8770/games/rampart-and-vine/index.html OUT=<dir> SIZES=390x844,1440x900,375x667 node feel-shots.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const URL = process.env.URL || 'http://localhost:8770/games/rampart-and-vine/index.html';
const OUT = process.env.OUT || path.join(__dirname, '../playable-shots/feel');
const SIZES = (process.env.SIZES || '390x844,1440x900,375x667').split(',').map(s => s.split('x').map(Number));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const check = () => {
  const sel = '#status .tn,#status .ins,.pvb,.flab,.hname,.gxh-bub,.pop,.seat,#left,#recentre,#hskip,#hplace,#goal,#coach .cbub';
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; let p = e; while (p) { const q = getComputedStyle(p); if (q.visibility === 'hidden' || q.display === 'none' || +q.opacity === 0) return false; p = p.parentElement } return true; };
  const els = [...document.querySelectorAll(sel)].filter(vis);
  const nm = e => (e.id || (typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName)) + ':' + (e.textContent || '').trim().slice(0, 18);
  const out = [], small = [];
  for (const e of document.querySelectorAll('body *')) {
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (e.closest('#world,svg,script,style,#perfhud') || !vis(e)) continue;
    const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const f = parseFloat(getComputedStyle(e).fontSize); if (f < 13.5) small.push(nm(e) + ' ' + f.toFixed(1));
  }
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i], b = els[j]; if (a.contains(b) || b.contains(a)) continue;
    const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); const ix = Math.min(r.right, s.right) - Math.max(r.left, s.left), iy = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    if (ix > 2 && iy > 2) out.push(nm(a) + ' x ' + nm(b));
  }
  return { out, small: [...new Set(small)].slice(0, 8), hs: document.documentElement.scrollWidth > innerWidth + 1 };
};
async function tap(p, el, touch) {
  if (!el) return false;
  const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const t = document.elementFromPoint(x, y); return b.width > 8 && x > 0 && y > 0 && x < innerWidth && y < innerHeight && t && (t === e || e.contains(t)) ? { x, y } : null; });
  if (!r) return false; if (touch) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y); return true;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  let bad = 0;
  for (const [W, H] of SIZES) {
    const touch = W < 700, sz = W + 'x' + H, keep = sz !== '375x667';
    const ctx = await b.newContext(touch ? { viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const shot = async (name, wait) => {
      await sleep(wait == null ? 600 : wait); const o = await p.evaluate(check);
      if (keep || /mid|result/.test(name)) await p.screenshot({ path: `${OUT}/${name}-${sz}.png` });
      if (o.out.length || o.small.length || o.hs) { bad += o.out.length + (o.hs ? 1 : 0) + o.small.length; console.log(sz, name, o.out.slice(0, 4).join(' | '), o.small.length ? 'SMALL ' + o.small.join(', ') : '', o.hs ? 'HSCROLL' : ''); }
    };
    await p.goto(URL); await sleep(1800);
    await shot('1-title');
    const learn = p.getByText(/Learn in 5 minutes|Learn to play/i).first();
    if (await learn.count()) { await tap(p, await learn.elementHandle(), touch); await shot('2-learn-first', 2500); }
    else console.log(sz, 'no Learn to play button');
    await p.evaluate(() => { try { localStorage.setItem('rv_seen', '1'); localStorage.setItem('gxt-rampart-and-vine', JSON.stringify({ done: true })); } catch (e) { } });
    await p.goto(URL); await sleep(1800);
    const play = p.getByText('Play vs computer').first(); if (await play.count()) await tap(p, await play.elementHandle(), touch); await sleep(700);
    const now = await p.$('#modal [data-a=go]'); if (now) await tap(p, now, touch); await sleep(1500);
    if (await p.$('#goal')) { await shot('3-goal'); await tap(p, await p.$('#goalok'), touch); } else { console.log(sz, 'NO GOAL CARD'); }
    let rivalShot = false, turns = 0;
    for (let t = 1; t <= 90; t++) {
      let ok = false;
      for (let k = 0; k < 160; k++) {
        if (await p.$('.card[aria-label=Result]')) break;
        ok = await p.evaluate(() => typeof myTurn === 'function' && myTurn('place') && !!document.querySelector('.glow'));
        if (ok) break;
        if (!rivalShot && t === 2 && k === 6) { await shot('6-rival', 0); rivalShot = true; }
        const tip = await p.$('.gxh-bub .gxh-ok'); if (tip && await tip.isVisible()) await tap(p, tip, touch);
        await sleep(250);
      }
      if (await p.$('.card[aria-label=Result]')) break;
      if (!ok) { console.log(sz, 'STUCK at turn', t); bad++; break; }
      turns = t;
      if (t === 1) await shot('4-first-turn');
      if (t === 10) await shot('5-mid-t10');
      let gl = null;
      for (let k = 0; k < 3 && !gl; k++) {
        const cands = await p.$$('.glow');
        for (const g of cands) { if (await g.evaluate(e => e.style.visibility !== 'hidden') && await tap(p, g, touch)) { gl = g; break; } }
        if (!gl) { const rc = await p.$('#recentre'); if (rc) await tap(p, rc, touch); await sleep(700); }
      }
      if (!gl) { console.log(sz, 'no tappable glow at turn', t); bad++; break; }
      await sleep(350);
      const sel = await p.$('.glow.sel'); if (sel) await tap(p, sel, touch);
      const hp = await p.$('#hplace'); if (hp && await hp.isVisible()) await tap(p, hp, touch);
      for (let k = 0; k < 24; k++) { if (await p.$('.fglow') || await p.evaluate(() => !myTurn('place'))) break; await sleep(150); }
      if (await p.$('.fglow')) {
        const fg = await p.$$('.fglow'), sk = await p.$('#hskip');
        if (t % 3 === 1 && fg.length) { let done = false; for (const f of fg) if (await tap(p, f, touch)) { done = true; break; } if (!done && sk) await tap(p, sk, touch); }
        else if (sk) await tap(p, sk, touch);
      }
    }
    for (let k = 0; k < 80 && !await p.$('.card[aria-label=Result]'); k++) await sleep(300);
    if (await p.$('.card[aria-label=Result]')) await shot('7-result', 900); else { console.log(sz, 'NO RESULT after', turns, 'turns'); bad++; }
    console.log(sz, 'turns played', turns);
    if (errs.length) { console.log(sz, 'PAGE ERRORS', errs.slice(0, 3)); bad++; }
    await ctx.close();
  }
  await b.close();
  console.log('FEEL BAD ' + bad);
})();
