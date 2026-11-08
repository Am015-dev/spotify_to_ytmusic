// Drag the held tile from the tray onto a glowing square: a 390x844 phone (real touch events through CDP) and a 1440x900 PC (mouse).
// PASS = the tile lands on that square (a new tile in G.order at the drop spot) and a plain tap on the tray tile still turns it.
//   URL=http://127.0.0.1:8770/games/rampart-and-vine/index.html node drag-test.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const URL = process.env.URL || 'http://127.0.0.1:8770/games/rampart-and-vine/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await PW.chromium.launch(); let fails = 0;
  for (const [W, H, touch] of [[390, 844, true], [1440, 900, false]]) {
    const ctx = await b.newContext(touch ? { viewport: { width: W, height: H }, isMobile: true, hasTouch: true } : { viewport: { width: W, height: H } });
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('rv_seen', '1'); localStorage.setItem('gxt-rampart-and-vine', JSON.stringify({ done: true })); } catch (e) { } });
    await p.goto(URL); await sleep(1200);
    await p.evaluate(() => { document.querySelector('#modal').innerHTML = ''; beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'normal'], ex: {}, seed: 5 }); const g = document.getElementById('goal'); if (g) g.remove(); });
    await sleep(1500);
    const cdp = touch ? await ctx.newCDPSession(p) : null;
    const move = async (pts) => { // pts: [[x,y],...] first = down, last = up
      if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] }); for (const q of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q[0], y: q[1] }] }); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
      else { await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down(); for (const q of pts.slice(1)) { await p.mouse.move(q[0], q[1]); await sleep(16); } await p.mouse.up(); }
    };
    // 1) a tap on the tray tile turns it
    const r0 = await p.evaluate(() => UI.rot), hr = await p.evaluate(() => { const r = document.querySelector('#htile').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await move([hr, hr]); await sleep(400);
    const r1 = await p.evaluate(() => UI.rot), rots = await p.evaluate(() => UI.rots.length);
    const tapOk = rots < 2 || r1 !== r0;
    // 2) drag onto the first visible glow
    const tgt = await p.evaluate(() => { const g = [...document.querySelectorAll('#world .glow')].find(e => e.style.visibility !== 'hidden'); const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, gx: +g.dataset.x, gy: +g.dataset.y, n: G.order.length }; });
    const path = []; for (let i = 0; i <= 14; i++) path.push([hr[0] + (tgt.x - hr[0]) * i / 14, hr[1] + (tgt.y - hr[1]) * i / 14]);
    await move(path); await sleep(500);
    const after = await p.evaluate(t => ({ n: G.order.length, at: !!G.tiles[t.gx + ',' + t.gy] || G.order.some(k => k === t.gx + ',' + t.gy) || G.order.length > t.n, step: G.step, ghost: !!document.getElementById('dragtile') }), tgt);
    const dragOk = after.n === tgt.n + 1 && !after.ghost;
    console.log(`${tapOk && dragOk && !errs.length ? 'PASS' : 'FAIL'} ${W}x${H} ${touch ? 'touch' : 'mouse'}: tap turns tile ${tapOk}, drag places tile ${dragOk} (step ${after.step})${errs.length ? ' errors ' + errs.slice(0, 2).join(' | ') : ''}`);
    if (!(tapOk && dragOk) || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
