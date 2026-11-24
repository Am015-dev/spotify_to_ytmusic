// Floating tutorial test (src/float.js). Build first: python3 src/build.py. Run: node float-test.js [402x874,1366x768]
// Asserts: opens on the HUD map, labels apart and on screen, label tap explains; non-highlighted taps work; every lesson completes by taps
// (predicate or Next), the window never covers the suggested target; 0 JS errors; whole run under 60 s (turbo). Shots in proof/float/.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const { turbo, budget, tick } = require('../../scripts/turbo'); const gx = require('../../scripts/gx-serve.js');
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof', 'float'); fs.mkdirSync(PROOF, { recursive: true });
const probs = []; const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
(async () => {
  const stop = budget(150000, 'float tutorial');
  const URL = await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') });
  const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  for (const [W, H] of SIZES) {
    const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), n0 = probs.length, t0 = Date.now();
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: phone, serviceWorkers: 'block' }); await turbo(ctx);
    const p = await ctx.newPage(); p.on('pageerror', e => note('PAGE ERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404/.test(m.text())) note('console ' + m.text().slice(0, 120)); });
    await p.goto(URL); await p.waitForFunction(() => typeof showStart === 'function' && window.GXF); await tick(p, 800);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } AIDELAY = 60; UI.first = true; showStart(); }); await tick(p, 300);
    const st = () => p.evaluate(() => GXF.state());
    const shot = n => p.screenshot({ path: path.join(PROOF, tag + '-' + n + '.jpg'), type: 'jpeg', quality: 62 });
    const tapEl = async sel => { const pt = await p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; } return null; }, sel);
      if (!pt) return false; if (!pt.ok) note('something covers ' + sel); await p.touchscreen.tap(pt.x, pt.y); await tick(p, 500); return true; };
    // start the tutorial from the start card by tap
    const learn = await p.evaluate(() => { const b = [...document.querySelectorAll('#modal button')].find(x => /learn|tutorial|play 5|how to/i.test(x.textContent)); if (!b) return null; b.setAttribute('data-t', 'learn'); return true; });
    if (!learn) note('no tutorial button on the start card'); else await tapEl('[data-t=learn]');
    await tick(p, 4000);
    let s = await st(); if (!s || !s.open || !s.map) { note('did not open on the HUD map'); await ctx.close(); continue; }
    if (s.labels.length < 7) note('only ' + s.labels.length + ' HUD labels');
    for (let i = 0; i < s.labels.length; i++) for (let j = i + 1; j < s.labels.length; j++) if (hit(s.labels[i], s.labels[j])) note('labels overlap ' + s.labels[i].sel + ' / ' + s.labels[j].sel);
    if (s.labels.some(l => l.left < 0 || l.top < 0 || l.right > W || l.bottom > H)) note('a label is off screen');
    for (const l of s.labels) if (hit(s.win, l)) note('window covers label ' + l.sel);
    await shot('00-map');
    await tapEl('.gxf-lab[data-sel="#hand"]'); if (!/Your tile:/.test(await p.textContent('.gxf-say'))) note('label tap did not explain #hand'); await shot('00-map-label');
    // a tap on something that is NOT highlighted works: the menu
    await tapEl('#menubtn'); if (!(await p.$('#menu'))) note('non-highlighted tap (menu) did nothing'); await tapEl('#menubtn'); await tick(p, 300);
    await tapEl('.gxf-ft .pri');   // Start lessons
    const seen = []; let guard = 0;
    while (guard++ < 400) {
      s = await st(); if (s.complete) break; if (s.map) { await tapEl('.gxf-ft .pri'); continue; }
      const id = s.id; const first = seen[seen.length - 1] !== id;
      if (first) { seen.push(id); await tick(p, 4000); s = await st(); if (s.overlap) note('window covers the target at ' + id + ' win ' + JSON.stringify(s.win && [s.win.left|0, s.win.top|0, s.win.right|0, s.win.bottom|0]) + ' tgt ' + JSON.stringify(s.target && [s.target.left|0, s.target.top|0, s.target.right|0, s.target.bottom|0])); await shot(String(seen.length).padStart(2, '0') + '-' + id); }
      const act = await p.evaluate(id => {
        const q = f => { try { return f(); } catch (e) { return null; } };
        if (id === 'turn') return { sel: '#htile' };
        if (/^place\d$/.test(id)) { if (UI.sel && document.querySelector('#hplace')) return { sel: '#hplace' }; if (myTurn('place')) { const n = +id.slice(5), m = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11 }[n]; if (G.turn !== m) return { wait: 1 }; const e = tutT(m); if (!UI.rots.includes(e[3])) return { wait: 1 }; if (UI.rot !== e[3]) { hlpTurnTo(e[3]); } const g = hGlow(e[1], e[2]); if (g) { const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } } return { wait: 1 }; }
        if (/^fig_/.test(id)) { const m = { fig_road: 1, fig_priory: 3, fig_town: 5, fig_farmer: 7 }[id]; if (G.turn !== m || !myTurn('fig')) return { wait: 1 }; const t = tutFig(m)(); if (t) { const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } return { wait: 1 }; }
        if (id === 'skip') { return document.querySelector('#hskip') ? { sel: '#hskip' } : { wait: 1 }; }
        if (id === 'claimed' || id === 'road_done' || id === 'town_done' || id === 'priory_done' || id === 'final' || id === 'farmers' || id === 'winner') return { wait: 1 };
        return { next: 1 };
      }, id);
      if (act.sel) await tapEl(act.sel); else if (act.x != null) { await p.touchscreen.tap(act.x, act.y); await tick(p, 500); }
      else if (act.next) { await tapEl('.gxf-ft .pri'); }
      else { await tick(p, 400); if (guard % 6 === 0 && (await p.evaluate(() => !!G && !!G.over)) !== false || guard % 6 === 0) { const s2 = await st(); if (s2.id === id && guard > 150) await tapEl('.gxf-ft .pri'); } }
    }
    s = await st(); if (!s.complete) note('tutorial did not complete (stuck at ' + s.id + ')');
    const ck = s.done.length; if (ck < 28) note('checklist ticked only ' + ck);
    if (!(await p.evaluate(() => !!G.over))) note('practice game did not reach the end');
    await shot('99-complete');
    await tapEl('.gxf-hd .gxf-ib[aria-label="Close"]'); if ((await st()).open) note('close left the window');
    await tapEl('.gxf-q'); s = await st(); if (!s.open || !s.map) note('? did not reopen the HUD map'); await shot('98-reopen-map');
    const secs = (Date.now() - t0) / 1000; if (secs > 60) note('took ' + secs.toFixed(0) + ' s (limit 60)');
    console.log((probs.length === n0 ? 'PASS ' : 'FAIL ') + tag + ' lessons seen ' + seen.length + ', ticked ' + ck + ', ' + secs.toFixed(0) + ' s');
    await ctx.close();
  }
  await b.close(); stop(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
