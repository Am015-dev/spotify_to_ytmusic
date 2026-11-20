// record-3min.js: a video of a newcomer's first 3 minutes at 375x667, touch only: Play, "Learn in 5 minutes", every lit tutorial target,
// "Play a real game", then the real game by tapping glows / follower circles / Skip like a person (no engine calls).
//   node record-3min.js [out=../proof/first-3min-375x667.webm]
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const gx = require('../../scripts/gx-serve.js');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'proof', 'first-3min-375x667.webm'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const centre = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
(async () => {
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') });
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rv-vid-'));
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, userAgent: UA, recordVideo: { dir, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const t0 = Date.now(), END = 180000, log = [];
  const tap = async pt => { if (pt) { await p.touchscreen.tap(pt.x, pt.y); return true; } return false; };
  await p.goto(URL); await sleep(1800);
  await tap(await centre(p, '[data-a=play]')); await sleep(900);
  await tap(await centre(p, '#modal [data-a=learn]')); await sleep(1500); log.push('tutorial ' + Math.round((Date.now() - t0) / 1000) + 's');
  while (Date.now() - t0 < END) {   // the tutorial: tap what it lights
    const st = await p.evaluate(() => { const c = typeof GXT !== 'undefined' && GXT.active() && GXT.current(); if (!c) return null; let r = null;
      try { const t = typeof c.target === 'function' ? c.target() : null; const q = t && (t.getBoundingClientRect ? t.getBoundingClientRect() : t); if (q && q.width) r = { x: q.left + q.width / 2, y: q.top + q.height / 2 }; } catch (e) { }
      return { id: c.id, next: !c.wait, r }; });
    if (!st) { const e = await centre(p, '[data-gxt-end="play"]'); if (e) { await sleep(1500); await tap(e); await sleep(1500); } break; }
    await sleep(1400);   // reading time
    if (st.next) { await tap(await centre(p, '.gxt-next')); await sleep(600); continue; }
    if (st.r) { await tap(st.r); await sleep(500); const hp = await centre(p, '#hplace'); if (hp) { await sleep(300); await tap(hp); } await sleep(900); } else await sleep(300);
  }
  log.push('real game ' + Math.round((Date.now() - t0) / 1000) + 's');
  for (let k = 0; k < 4; k++) { const d = await p.$('#modal [data-a=go]:visible, #goalok:visible'); if (!d) break; await sleep(1200); await d.tap(); await sleep(500); }
  let moves = 0;
  while (Date.now() - t0 < END) {   // the real game, by touch: a glow (turning the tile now and then), a follower circle or Skip
    const o = await p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && getComputedStyle(e).visibility !== 'hidden' && r.top >= 0 && r.bottom <= innerHeight ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
      const gk = document.querySelector('#goalok'); if (gk && vis(gk)) return { goal: vis(gk) };
      if (!G || G.over || !myTurn()) return { wait: true, over: !!(G && G.over) };
      if (G.step === 'place') return { place: [...document.querySelectorAll('#world .glow')].map(vis).filter(Boolean), tile: vis(document.querySelector('#htile') || document.body), rots: (UI.rots || []).length };
      return { fig: [...document.querySelectorAll('#ov .fglow')].map(vis).filter(Boolean), skip: document.querySelector('#hskip') && vis(document.querySelector('#hskip')) }; });
    if (o.goal) { await tap(o.goal); await sleep(400); continue; }
    if (o.over) { await sleep(3000); break; }
    if (o.wait) { await sleep(300); continue; }
    await sleep(1600);   // a person looks first
    if (o.place) { if (o.rots > 1 && Math.random() < .4) { await tap(o.tile); await sleep(900); continue; }
      if (!o.place.length) { await tap(await centre(p, '#recentre')); await sleep(700); continue; }
      await tap(o.place[Math.floor(Math.random() * o.place.length)]); await sleep(700); const hp = await centre(p, '#hplace'); if (hp) await tap(hp); moves++; await sleep(900); }
    else if (o.fig) { const t = o.fig.length && Math.random() < .6 ? o.fig[Math.floor(Math.random() * o.fig.length)] : o.skip; if (t) await tap(t); await sleep(900); }
  }
  log.push('moves ' + moves + ', stopped at ' + Math.round((Date.now() - t0) / 1000) + 's');
  const v = p.video(); await ctx.close(); await v.saveAs(OUT); await b.close();
  console.log(log.join(' | ')); console.log('saved', path.relative(process.cwd(), OUT), (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB');
})();
