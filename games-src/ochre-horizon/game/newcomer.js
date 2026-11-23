// Newcomer script: starts the guided game and ONLY taps what the guide highlights. Usage: node newcomer.js [iphone|402] [shotsDir]
const { chromium, devices } = require('playwright');
const mode = process.argv[2] || '402', dir = process.argv[3] || '', GENS = +process.argv[4] || 3;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(mode === 'iphone' ? { ...devices['iPhone 15 Pro'] } : { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + __dirname + '/ochre-horizon.html?fast=1'); await pg.waitForTimeout(500);
  await pg.evaluate(() => startGame({ level: 'easy', tut: true })); await pg.waitForTimeout(700);
  let n = 0, stuck = 0, last = '', taps = [], bad = [];
  const shot = async (tag) => { if (dir) await pg.screenshot({ path: `${dir}/${mode}-${String(n).padStart(3, '0')}-${tag}.png` }); };
  for (let i = 0; i < 400; i++) {
    const st = await pg.evaluate(() => ({ gen: OH.G.gen, over: OH.G.over, side: OH.sideToAct(), busy: UI.busy }));
    if (st.over || st.gen >= GENS) break;
    if (st.side === 1 || st.busy) { await pg.waitForTimeout(150); continue; }
    const r = await pg.evaluate(() => {
      const e = [...document.querySelectorAll('.gd-glow')].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.top >= 0 && r.bottom <= innerHeight; }); if (!e) return null;
      const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, line: document.getElementById('gdT').textContent, why: document.getElementById('gdW').textContent, ok: !!document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) && (e === document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) || e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))) };
    });
    if (!r) { if (++stuck > 25) { console.log('STUCK no glow', await pg.evaluate(() => document.getElementById('gdT').textContent + ' | ' + OH.G.phase)); await shot('stuck'); break; } await pg.waitForTimeout(200); continue; }
    stuck = 0; n++;
    const au = await pg.evaluate(() => { const o = []; const top = document.querySelector('#modal.on') ? '#modal' : document.querySelector('#sheet.on') ? '#sheet' : null; const root = top ? document.querySelector(top) : document.getElementById('app');
      root.querySelectorAll('button,[data-s][data-legal]').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.bottom < 0 || r.top > innerHeight || getComputedStyle(e).visibility === 'hidden' || e.closest('[style*="display: none"]')) return; if (e.disabled) return; if (Math.min(r.width, r.height) < 43.5) o.push('small ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.id || e.className.baseVal || e.className) + ' ' + e.textContent.trim().slice(0, 14)); });
      document.querySelectorAll('#guide *,#bar *,#res *,#top *,#mb h3,#shT').forEach(e => { if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && getComputedStyle(e).overflow !== 'visible') o.push('clip ' + (e.id || e.className) + ' ' + e.textContent.trim().slice(0, 14)); }); return o; });
    au.forEach(x => bad.push(x));
    if (!r.ok) bad.push('covered:' + r.line);
    if (r.h < 44 || r.w < 44) bad.push(`small ${Math.round(r.w)}x${Math.round(r.h)}:${r.line}`);
    taps.push(r.line); await shot(r.line.replace(/\W+/g, '_').slice(0, 24));
    await pg.touchscreen.tap(r.x, r.y); await pg.waitForTimeout(250);
    if (new Set(taps.slice(-24)).size <= 4 && taps.length >= 24) { console.log('LOOP on', r.line, await pg.evaluate(() => { const m = OHAI.suggest(0); return JSON.stringify(m) + ' acts=' + OH.G.acts + ' mc=' + OH.G.pl[0].mc + ' modal=' + document.getElementById('mb').innerText.slice(0, 200).replace(/\n/g, ' / '); })); await shot('loop'); break; }
  }
  const fin = await pg.evaluate(() => ({ gen: OH.G.gen, over: OH.G.over, tr: OH.G.pl[0].tr }));
  console.log(mode, 'taps', n, 'final', JSON.stringify(fin), 'errors', errs.length ? errs.slice(0, 3) : 0, 'issues', JSON.stringify([...new Set(bad)]));
  console.log(JSON.stringify([...new Set(taps)]));
  await b.close();
})();
