// v4 shots: plays N turns of a Quick game at phone sizes and screenshots 5 steps of each turn (pick, aim, tap spot, follower, rival),
// and lists overlapping text (any two visible text boxes intersecting) and text under 14px.
//   URL=http://localhost:8765/rampart.html TAG=before TURNS=10 RAW=<dir> node v4-shots.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/rampart.html', TAG = process.env.TAG || 'after', TURNS = +(process.env.TURNS || 10);
const RAW = process.env.RAW || path.join(__dirname, 'v4raw');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const overlaps = () => {
  const sel = '#status .tn,#status .ins,.pvb,.flab,#sheet .sc,#sheet .srate,#sheet .sbtn,.hname,.gxh-bub,.pop,.seat,#left,#recentre,#hskip,#hplace';
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; let p = e; while (p) { const q = getComputedStyle(p); if (q.visibility === 'hidden' || q.display === 'none' || +q.opacity === 0) return false; p = p.parentElement } return true; };
  const els = [...document.querySelectorAll(sel)].filter(vis);
  const nm = e => (e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : e.id || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 18);
  const out = [], small = [];
  for (const e of els) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.closest('#world') ? (+getComputedStyle(document.querySelector('#board')).getPropertyValue('--sc') || 1) : 1); if (e.textContent.trim() && f < 13.5 && !e.closest('#top')) small.push(nm(e) + ' ' + f.toFixed(1) + 'px'); }
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i], b = els[j]; if (a.contains(b) || b.contains(a)) continue;
    const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); const ix = Math.min(r.right, s.right) - Math.max(r.left, s.left), iy = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    if (ix > 2 && iy > 2) out.push(nm(a) + ' x ' + nm(b)); }
  const vt = [...document.querySelectorAll('.pvb')].filter(vis).length;
  return { out, small: [...new Set(small)].slice(0, 6), vt };
};
async function tapEl(p, el) { const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const t = document.elementFromPoint(x, y); return b.width > 8 && x > 0 && y > 0 && x < innerWidth && y < innerHeight && t && (t === e || e.contains(t)) ? { x, y } : null; }); if (!r) return false; await p.touchscreen.tap(r.x, r.y); return true; }
(async () => {
  fs.mkdirSync(RAW, { recursive: true });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  const report = {}; let total = 0;
  for (const [W, H] of [[390, 763], [375, 553]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
    await ctx.addInitScript(() => { try { localStorage.setItem('rv_seen', '1'); localStorage.setItem('gxt-rampart-and-vine', JSON.stringify({ done: true })); } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGE ERROR ' + e.message)); await p.goto(URL); await sleep(900);
    const play = await p.getByText('Play vs computer').first(); await play.tap().catch(() => play.click()); await sleep(500);
    const now = await p.$('#modal [data-a=go]'); if (now) { await now.tap().catch(() => now.click()); } await sleep(1200);
    const sz = W + 'x' + H; report[sz] = [];
    const shot = async (turn, step, wait) => { await sleep(wait == null ? 700 : wait); const o = await p.evaluate(overlaps); await p.screenshot({ path: `${RAW}/${TAG}-${sz}-t${turn}-${step}.png` }); report[sz].push({ turn, step, ...o }); total += o.out.length; };
    for (let t = 1; t <= TURNS; t++) {
      for (let k = 0; k < 80; k++) { const ok = await p.evaluate(() => typeof myTurn === 'function' && myTurn('place') && !!document.querySelector('.glow')); if (ok) break; if (await p.$('.card[aria-label=Result]')) break; const tip = await p.$('.gxh-bub .gxh-ok'); if (tip && await tip.isVisible()) await tapEl(p, tip); await sleep(300); }
      if (await p.$('.card[aria-label=Result]')) break;
      await shot(t, '1-pick');
      const ht = await p.$('#htile'); if (ht) await tapEl(p, ht);
      await shot(t, '2-aim');
      const gi = await p.evaluate(() => { const all = [...document.querySelectorAll('.glow')]; const gs = all.filter(g => g.style.visibility !== 'hidden'); const best = gs.find(g => g.querySelector('.pvb.good')) || gs.find(g => g.querySelector('.pvb')) || gs[0]; return best ? all.indexOf(best) : -1; });
      if (gi < 0) continue;
      const glows = await p.$$('.glow'); await tapEl(p, glows[gi]);
      await shot(t, '3-tapspot');
      const sel = await p.$('.glow.sel'); if (sel) { await tapEl(p, sel); }
      for (let k = 0; k < 20; k++) { if (await p.$('.fglow') || await p.evaluate(() => !myTurn())) break; await sleep(150); }
      if (await p.$('.fglow')) { await shot(t, '4-follower'); const fg = await p.$$('.fglow'); const sk = await p.$('#hskip'); if (t % 2 && fg.length) await tapEl(p, fg[0]); else if (sk) await tapEl(p, sk); }
      await shot(t, '5-rival', 1300);
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(RAW, TAG + '-report.json'), JSON.stringify(report, null, 1));
  for (const sz in report) for (const r of report[sz]) if (r.out.length || r.small.length || r.vt > 3) console.log(sz, 't' + r.turn, r.step, 'tags' + r.vt, r.out.slice(0, 5).join(' | '), r.small.length ? 'SMALL ' + r.small.join(',') : '');
  console.log('OVERLAPS ' + total);
})();
