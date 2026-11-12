// Mission-touch test: plays jobs 1-4 (3 crew, Normal) by touch taps only at 390x844 and 375x667, to the result card.
// Every tap is on a visible element whose centre hits itself (the crew area is scrolled to the wire first, like a thumb would).
// Fails on page errors, a stuck table (no state change for 40 s), a wire under 44x44, or a red tap that says nothing.
//   node mission-touch-test.js
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(__dirname, 'shortfuse.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PICK = `(() => {
  const ok = e => { e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); if (r.width < 3 || r.bottom > innerHeight || r.top < 0) return null; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && (h === e || e.contains(h)) ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, cls: e.className } : null; };
  for (const sel of ['#cover button.go', '#coach button', '#tb .chip.glow', '#tb .tile.glow', '#tb .plate.glow', '#tb .eqk.glow']) {
    const els = [...document.querySelectorAll(sel)]; if (sel === '#tb .tile.glow') els.sort(() => Math.random() - .5);
    for (const e of els) { const p = ok(e); if (p) return p; }
  }
  return null;
})()`;
(async () => {
  const URL = await gx.url('short-fuse', { file: FILE });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let fails = 0;
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await page.goto(URL); await sleep(900);
    for (let job = +(process.env.J0 || 1); job <= +(process.env.J1 || 4); job++) {
      await page.evaluate(`try{GXH.setEnabled(false)}catch(e){};AIDELAY=150;UI.speed=4;startJob({job:${job},np:3,seats:['human','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:0,seed:${job * 101 + w}});refresh()`);
      await sleep(600);
      const t0 = Date.now(); let smallTxt = '', taps = 0, small = 0, last = '', lastT = Date.now(), stuck = false, redSaid = null;
      while (!(await page.evaluate('!!G.over'))) { if (Date.now() - t0 > 150000) { stuck = true; break; }
        if (redSaid === null) {   // tap a red wire of mine once: it must say something
          const r = await page.evaluate(`(()=>{const e=document.querySelector('#mine .tile.known.r:not(.cut)');if(!e||UI.brief)return null;e.scrollIntoView({block:'nearest'});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);
          if (r) { await page.touchscreen.tap(r.x, r.y); await sleep(250); redSaid = await page.evaluate(`/red/i.test(document.getElementById('say').textContent)`); await page.evaluate('UI.sel=null;refresh()'); }
        }
        const p = await page.evaluate(PICK);
        if (p) { if (/tile/.test(p.cls) && (p.w < 43.5 || p.h < 43.5)) { small++; smallTxt = Math.round(p.w) + 'x' + Math.round(p.h) + ' ' + p.cls; } await page.touchscreen.tap(p.x, p.y); taps++; }
        await sleep(p ? 220 : 400);
        const sig = await page.evaluate('G.turn+":"+G.logN+":"+(G.step||"")');
        if (sig !== last) { last = sig; lastT = Date.now(); } else if (Date.now() - lastT > 40000) { stuck = true; break; }
      }
      const res = await page.evaluate('G.over?(G.over.win?"won":"lost"):"-"');
      const bad = stuck || small || redSaid === false;
      if (bad) fails++;
      console.log((bad ? 'FAIL ' : 'ok   ') + w + 'x' + h + ' job ' + job + ': ' + res + ', ' + taps + ' taps, ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s' + (small ? ', ' + small + ' small taps (' + smallTxt + ')' : '') + (stuck ? ', STUCK' : '') + (redSaid === null ? '' : redSaid ? ', red tap explained' : ', RED TAP SILENT'));
    }
    if (errs.length) { fails++; console.log('FAIL page errors: ' + [...new Set(errs)].slice(0, 3).join(' | ')); }
    await ctx.close();
  }
  await browser.close();
  console.log('MISSION-TOUCH ' + (fails ? 'FAIL (' + fails + ')' : 'PASS'));
  process.exit(fails ? 1 : 0);
})();
