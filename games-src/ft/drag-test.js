// DRAG TEST (W480): in a Play game, lift a tile's people by dragging them and drop one on a glowing neighbour (mouse on PC, touch events on phone).
//   node drag-test.js        Exit code 1 on any problem. Needs the build in games-src/.staging.
const path = require('path');
const PW = (() => { try { return require('playwright'); } catch (e) { return require(path.join(__dirname, '..', 'node_modules', 'playwright')); } })();
const gx = require(path.join(__dirname, '..', 'scripts', 'gx-serve.js'));
const probs = []; const note = m => { if (probs.length < 20) probs.push(m); };
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
async function toMyMove(p) {
  for (let i = 0; i < 400; i++) {
    const r = await p.evaluate(() => { if (!G || G.over) return 'over'; const s = sideToAct(); if (s < 0) return 'none'; if (P(s).human && G.phase === 'turn' && G.step === 'move' && !G.move) return 'mine'; go(aiMove(s)); return 'step'; });
    if (r === 'mine') return true; if (r !== 'step') return false;
  }
  return false;
}
async function run(kind, url, b) {
  const phone = kind === 'touch';
  const click = kind === 'click';   // a plain mouse click (no movement) must lift and drop as before
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); p.on('pageerror', e => note(kind + ' PAGE ERROR ' + e.message));
  await p.goto(url); await p.waitForTimeout(1500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await p.waitForTimeout(1500);
  if (phone) { await p.tap('[data-a=start]'); await p.waitForTimeout(500); await p.tap('[data-ui=goalgo]'); } else { await p.click('[data-a=start]'); await p.waitForTimeout(500); await p.click('[data-ui=goalgo]'); }
  await p.waitForTimeout(400);
  await p.evaluate(() => { ANIM = 0; window.__vib = 0; navigator.vibrate = () => { window.__vib++; return true; }; });
  if (!(await toMyMove(p))) { note(kind + ': never reached my move step'); await ctx.close(); return; }
  await p.evaluate(() => render()); await p.waitForTimeout(200);
  const start = await p.evaluate(() => UI.pick[0]);
  const s = await ctr(p, `#grid [data-tile="${start}"]`);
  if (click) {
    await p.mouse.click(s.x, s.y); await p.waitForTimeout(300);
    const lifted = await p.evaluate(() => !!G.move); if (!lifted) note('click: a plain mouse click on a glowing start tile did not lift (pointer capture eats the click?)');
    const j = await p.evaluate(() => UI.pick[0]); const t2 = j == null ? null : await ctr(p, `#grid [data-tile="${j}"]`);
    if (t2) { await p.mouse.click(t2.x, t2.y); await p.waitForTimeout(300); if (await p.evaluate(() => !!UI.chz)) { const c = await ctr(p, '#chz [data-chz="0"]'); if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(300); } } }
    const d = await p.evaluate(() => G.move ? G.move.drops.length : -1); if (!(d >= 1)) note('click: the second click did not drop a person (' + d + ')');
    console.log('drag-test click lifted ' + lifted + ' drops ' + d); await ctx.close(); return;
  }
  const drag = async (from, toSel) => {
    if (phone) {   // real touch events through CDP
      const c = await ctx.newCDPSession(p);
      const pt = (x, y) => [{ x, y, id: 1 }];
      await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) });
      for (let k = 1; k <= 3; k++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + k * 6, from.y + k * 6) });
      const to = await toSel();
      if (!to) { await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return false; }
      for (let k = 1; k <= 8; k++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * k / 8, from.y + (to.y - from.y) * k / 8) });
      await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true;
    }
    await p.mouse.move(from.x, from.y); await p.mouse.down();
    for (let k = 1; k <= 3; k++) await p.mouse.move(from.x + k * 6, from.y + k * 6);
    const to = await toSel(); if (!to) { await p.mouse.up(); return false; }
    for (let k = 1; k <= 8; k++) await p.mouse.move(from.x + (to.x - from.x) * k / 8, from.y + (to.y - from.y) * k / 8);
    const over = await p.evaluate(() => document.querySelectorAll('#grid .dragover').length); if (!over) note(kind + ': no glow under the dragged piece');
    const gh = await p.evaluate(() => !!document.querySelector('.dragghost')); if (!gh) note(kind + ': no ghost piece follows the pointer');
    await p.mouse.up(); return true;
  };
  const handBefore = await p.evaluate(() => G.move ? G.move.hand.length : -1);
  const ok = await drag(s, async () => { const j = await p.evaluate(() => UI.pick[0]); return j == null ? null : await ctr(p, `#grid [data-tile="${j}"]`); });
  await p.waitForTimeout(300);
  if (await p.evaluate(() => !!UI.chz)) {   // a mixed hand: the game asks who stays on the tile
    const c = await ctr(p, '#chz [data-chz="0"]');
    if (!c) note(kind + ': chooser has no option'); else { if (phone) await p.touchscreen.tap(c.x, c.y); else await p.mouse.click(c.x, c.y); await p.waitForTimeout(300); }
  }
  const st =await p.evaluate(() => ({ move: !!G.move, hand: G.move ? G.move.hand.length : -1, drops: G.move ? G.move.drops.length : -1, at: G.move ? G.move.at : -1, vib: window.__vib, dragging: document.documentElement.classList.contains('dragging') }));
  if (!ok) note(kind + ': the drag found no glowing neighbour after the lift');
  if (!st.move) note(kind + ': drag did not lift the people');
  else if (st.drops < 1) note(kind + ': drag lifted but dropped nobody (' + JSON.stringify(st) + ')');
  if (st.dragging) note(kind + ': drag state stuck on');
  if (!(st.vib > 0)) note(kind + ': no vibrate tick');
  console.log('drag-test ' + kind + ' hand ' + handBefore + ' ' + JSON.stringify(st));
  await ctx.close();
}
(async () => {
  const url = await gx.url('sands-of-qamar', {}); const b = await PW.chromium.launch();
  await run('click', url, b); await run('mouse', url, b); await run('touch', url, b);
  console.log('drag-test ' + (probs.length ? 'PROBLEMS' : 'PASS')); probs.forEach(x => console.log(' - ' + x));
  await b.close(); process.exit(probs.length ? 1 : 0);
})();
