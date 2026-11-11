// Feel gate (W456, shell/FEEL.md): (1) a full game played by DRAG only (market pair -> valley spot, animal -> tile / market),
// phone (CDP touch) and PC (mouse); (2) one full game by TAP only (smoke.js humanTurn); (3) long tasks during animated turns
// on a 4x CPU-throttled phone; (4) a 6-frame strip per viewport showing drag, camera and flights (shots/feel-*.png).
//   node feel-test.js            (needs a built wildmark.html)
const { chromium } = require('playwright'); const { humanTurn } = require('./smoke.js');
const fs = require('fs'), path = require('path'); let URL = 'file://' + __dirname + '/wildmark.html';   // replaced by the shared server (real art) below
const SHOTS = path.join(__dirname, 'feel-shots'); fs.mkdirSync(SHOTS, { recursive: true });
const VPS = [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]];
async function dragger(p, ctx, touch) {
  const cdp = touch ? await ctx.newCDPSession(p) : null;
  return async (x0, y0, x1, y1, n = 14, hold) => {
    const lift = touch ? 28 : 6; y1 += lift;   // the piece floats above the finger: aim the piece, not the finger
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for (let k = 1; k <= n; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / n, y: y0 + (y1 - y0) * k / n }] }); await p.waitForTimeout(12); if (hold && k === n - 2) await hold(); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await p.mouse.move(x0, y0); await p.mouse.down();
      for (let k = 1; k <= n; k++) { await p.mouse.move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await p.waitForTimeout(12); if (hold && k === n - 2) await hold(); }
      await p.mouse.up();
    }
  };
}
const ctr = async (p, sel) => { const b = await p.locator(sel).first().boundingBox(); return b ? [b.x + b.width / 2, b.y + b.height / 2] : null; };
// one turn by drag only: returns false if a drag was refused
async function dragTurn(p, drag, hold) {
  await p.waitForFunction(() => window.G && (G.over || (!G.seats[G.cur].ai && G.stage === 'pick' && document.querySelector('#mk .mt:not([disabled])') && document.getElementById('pass').hidden)), null, { timeout: 30000 });
  if (await p.evaluate(() => G.over)) return 'over';
  const plan = await p.evaluate(() => { const g = WM.clone(G); g.seats[g.cur].acorns = 0; const pl = WM.AI.plan(g, 'normal'); const r = WMF.cellRect(pl.place.c); return { i: pl.pick.i, c: pl.place.c, x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const a = await ctr(p, `#mk .mt[data-i="${plan.i}"]`);
  await drag(a[0], a[1], plan.x, plan.y, 14, hold && hold.pair);
  await p.waitForFunction(() => G.stage === 'tile' && UI.ghost, null, { timeout: 4000 }).catch(() => { });
  if (!(await p.evaluate(() => G.stage === "tile" && !!UI.ghost))) { await p.screenshot({ path: "feel-shots/fail-" + Date.now() + ".png" }); console.log("  pair drop refused", JSON.stringify(plan), await p.evaluate(() => [G.stage, G.cur, document.querySelectorAll("#map .spot").length])); return false; }
  await p.waitForTimeout(60);
  const tgt = await p.evaluate(() => {   // where the animal goes: a tile that takes it (the ghost counts), else back to the market
    const env = G.seats[G.cur].env, tok = G.hold.tok, spots = WM.tokSpots(env, tok); let c = spots[0];
    if (!c && G.hold.tile.a.indexOf(tok) >= 0) c = UI.ghost.c;
    if (c) { const r = WMF.cellRect(c); return { x: r.left + r.width / 2, y: r.top + r.height / 2, c }; }
    const m = document.querySelector('#mk').getBoundingClientRect(); return { x: m.left + m.width / 2, y: m.top + m.height / 2, back: 1 };
  });
  const h = await ctr(p, '#acts .htok');
  await drag(h[0], h[1], tgt.x, tgt.y, 14, hold && hold.tok);
  await p.waitForFunction(() => G.over || G.stage === 'pick', null, { timeout: 4000 }).catch(() => { });
  const ok2 = await p.evaluate(() => G.over || G.stage === "pick"); if (!ok2) console.log("  token drop refused", JSON.stringify(tgt), await p.evaluate(() => { UI.dragTok = true; drawMap(); const rr = [...document.querySelectorAll("#map .ring.dropt")].map(e => { const b = e.getBoundingClientRect(); return e.getAttribute("data-c") + "@" + (b.left|0) + "," + (b.top|0) + "," + (b.width|0); }).join(" "), n = rr + " vs " + JSON.stringify(WMF.cellRect(WM.tokSpots(G.seats[G.cur].env, G.hold.tok)[0] || "0,0")), k = Object.keys(G.seats[G.cur].env).length; const o = [G.stage, JSON.stringify(UI.ghost), n, k, G.hold.tok, JSON.stringify(G.seats[G.cur].env["0,1"])]; UI.dragTok = false; drawMap(); return o; })); return ok2;
}
(async () => {
  URL = (await require('../scripts/gx-serve.js').url('wildmark', { file: path.join(__dirname, 'wildmark.html') })).replace(/[?#].*$/, '').replace(/\/$/, '') + '/';
  const b = await chromium.launch(); let fails = 0; const log = (...a) => console.log(...a);
  for (const [name, vp, touch] of VPS) {
    const ONLY = process.env.ONLY || '';
    // 1) drag-only full game (fast AI)
    if (!ONLY || ONLY === 'drag') { const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(String(e))); if (process.env.DBG) p.on('console', m => { if (/^DBG/.test(m.text())) console.log(m.text()); });
      if (process.env.DBG) await p.addInitScript(() => { document.addEventListener('pointerup', e => console.log('DBG up', e.clientX|0, e.clientY|0, window.GXF && GXF.dragging(), document.querySelectorAll('.gxf-ok').length, document.querySelectorAll('.gxf-hov').length), true); document.addEventListener('pointerdown', e => console.log('DBG down', e.clientX|0, e.clientY|0, e.target.tagName, e.target.closest && (e.target.closest('[data-gxf-drag]') || {}).className), true); });
      await p.goto(URL + '?fast=1'); await p.waitForSelector('#playB, #goB, #quickB');
      await p.evaluate(() => { UI.setup = Object.assign(UI.setup || {}, { humans: 1, opp: 1 }); UI.mode = 'quick'; newGame({ np: 2, humans: 1, ai: 'normal' }); });
      const drag = await dragger(p, ctx, touch); let t = 0, bad = 0;
      for (; t < 25; t++) { const r = await dragTurn(p, drag); if (r === 'over') break; if (!r) { bad++; break; } }
      const over = await p.waitForFunction(() => G.over, null, { timeout: 20000 }).then(() => true).catch(() => false);
      const ok = over && !bad && !errs.length; if (!ok) fails++;
      log(name, ok ? 'PASS' : 'FAIL', 'drag-only full game', t, 'turns', over ? await p.evaluate(() => G.res.map(r => r.total).join('/')) : 'not over', errs.slice(0, 2).join(' | '));
      await ctx.close(); }
    // 2) tap-only full game
    if (!ONLY || ONLY === 'tap') { const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(String(e)));
      const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
      await p.goto(URL + '?fast=1'); await p.evaluate(() => { UI.mode = 'quick'; newGame({ np: 2, humans: 1, ai: 'normal' }); });
      for (let t = 0; t < 20; t++) await humanTurn(p, tap, true);
      const over = await p.waitForFunction(() => G.over, null, { timeout: 20000 }).then(() => true).catch(() => false);
      const ok = over && !errs.length; if (!ok) fails++;
      log(name, ok ? 'PASS' : 'FAIL', 'tap-only full game', over ? await p.evaluate(() => G.res.map(r => r.total).join('/')) : 'not over', errs.slice(0, 2).join(' | '));
      await ctx.close(); }
    // 3) + 4) animated turns: long tasks (phone: 4x CPU throttle) and the frame strip
    if (!ONLY || ONLY === 'anim') for (const pass of ['measure', 'shots']) { const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: pass === 'shots' ? 2 : 1 }), p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(String(e)));
      if (touch && pass === 'measure') { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
      await p.goto(URL); await p.evaluate(() => { try { localStorage.setItem('wm-prefs', JSON.stringify({ coachN: 9, played: 1, offered: 1 })); } catch (e) { } });
      await p.goto(URL); await p.waitForTimeout(400);
      await p.evaluate(() => { try { GXH.setEnabled(false); } catch (e) { } UI.mode = 'quick'; newGame({ np: 2, humans: 1, ai: 'normal', seed: 11 }); window.__lt = []; setTimeout(() => new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lt.push(Math.round(e.duration)); (window.__lts = window.__lts || []).push(Math.round(e.startTime) + ':' + Math.round(e.duration)); })).observe({ type: 'longtask', buffered: false }), 1200); });
      await p.waitForTimeout(1600);
      const frames = []; const shot = async tag => { if (pass === 'measure') return; console.log('  t=' + await p.evaluate(() => Math.round(performance.now())) + ' ' + tag); const f = path.join(SHOTS, `f-${name}-${frames.length}.png`); await p.screenshot({ path: f }); frames.push([f, tag]); };
      const drag = await dragger(p, ctx, touch);
      await p.waitForFunction(() => !G.seats[G.cur].ai && G.stage === 'pick' && !document.querySelector('#turnban.on'), null, { timeout: 8000 }).catch(() => { });
      await p.waitForTimeout(900);
      const r1 = await dragTurn(p, drag, { pair: () => shot('drag: pair lifted, spots glow'), tok: () => shot('drag: animal over a tile') });
      await p.waitForTimeout(200); await shot('drop: token hops, points fly');
      // the rival: tile flies from the market, camera leans in, token hops
      await p.waitForFunction(() => G.seats[G.cur].ai && UI.showAI, null, { timeout: 8000 }).catch(() => { });
      await p.waitForFunction(() => UI.showAI && /places/.test(UI.showAI.text), null, { timeout: 8000 }).catch(() => { });
      await p.waitForTimeout(touch ? 700 : 520); await shot('rival: tile in flight, camera on it');
      await p.waitForFunction(() => UI.showAI && /puts|returns/.test(UI.showAI.text), null, { timeout: 8000 }).catch(() => { });
      await p.waitForTimeout(200); await shot('rival: animal hops on');
      await p.waitForFunction(() => !G.seats[G.cur].ai && G.stage === 'pick', null, { timeout: 10000 }).catch(() => { });
      await p.waitForTimeout(500);
      const t2 = await p.evaluate(() => { const i = 0; const el = document.querySelector('#mk .mt[data-i="0"]'); el.click(); return true; });
      await p.waitForTimeout(touch ? 260 : 200); await shot('tap path: the pair flies to your hand');
      const lt = await p.evaluate(() => window.__lt); console.log('  longtasks', await p.evaluate(() => (window.__lts || []).join(' ')));
      const worst = lt.length ? Math.max.apply(null, lt) : 0, okLt = worst <= 100;
      if ((pass === 'measure' && !okLt) || errs.length || !r1) fails++;
      if (pass === 'shots') log(name, r1 && !errs.length ? 'PASS' : 'FAIL', 'animated drag turn + rival turn + tap flight, 6 frames', errs.slice(0, 2).join(' | '));
      else log(name, okLt ? 'PASS' : 'FAIL', 'long tasks during animated turns' + (touch ? ' (4x CPU)' : '') + ': ' + lt.length + ' over 50ms, worst ' + worst + 'ms', r1 ? '' : 'drag turn failed', errs.slice(0, 2).join(' | '));
      if (pass === 'shots') fs.writeFileSync(path.join(SHOTS, `frames-${name}.json`), JSON.stringify(frames));
      await ctx.close(); }
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
