// Plays a whole Quick game by DRAGGING pieces (dice onto stalls/spaces/goods, tiles onto spaces, workers onto dice) with real pointer moves.
// Taps are used only for buttons (End turn, workers, pop-up choices). SHOTS=1 saves playable-shots/gameplay/first-turn, mid-game, result (390x844). node drag-play.js ; phones 390x844 + 375x667 (touch) and PC 1440x900.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html') + '?fast=1';
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [name, vp, touch] of [['phone-touch', { width: 390, height: 844 }, true], ['phone-s-touch', { width: 375, height: 667 }, true], ['pc-mouse', { width: 1440, height: 900 }, false]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const SHOT = process.env.SHOTS && name === 'phone-touch' ? path.join(__dirname, 'playable-shots', 'gameplay') : null, shots = {}; if (SHOT) require('fs').mkdirSync(SHOT, { recursive: true });
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    const cdp = touch ? await ctx.newCDPSession(page) : null; let tp = { x: 0, y: 0 };
    const tch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const P = touch ? { move: async (x, y, o) => { const n = (o && o.steps) || 1, x0 = tp.x, y0 = tp.y; for (let i = 1; i <= n; i++) { tp.x = x0 + (x - x0) * i / n; tp.y = y0 + (y - y0) * i / n; if (tp.down) await tch('touchMove', tp.x, tp.y); } tp.x = x; tp.y = y; }, down: async () => { tp.down = true; await tch('touchStart', tp.x, tp.y); }, up: async () => { tp.down = false; await tch('touchEnd'); } } : page.mouse;
    const tapSel = async l => { if (touch) await l.tap(); else await l.click(); };
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); GXT.markDone('vale-of-banners'); }); await page.reload(); await page.waitForTimeout(300);
    await tapSel(page.locator('#quickB')); await tapSel(page.locator('#goB'));
    const ctr = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }, sel);
    const glide = async (to, steps = 6) => { await P.move(to.x, to.y, { steps }); };
    const drag = async (fromSel, path2) => { const a = await ctr(fromSel); if (!a) return false; await P.move(a.x, a.y); await P.down(); await P.move(a.x + 14, a.y - 14, { steps: 3 }); for (const st of path2) { if (st.wait) { await page.waitForTimeout(st.wait); continue; } const t = await ctr(st.sel); if (!t) { await P.up(); return false; } await glide(t); } await P.up(); await page.waitForTimeout(40); return true; };
    let missed = 0, combo1 = 0, drags = { combo: 0, take: 0, build: 0, sell: 0, worker: 0 }, taps = 0, guard = 0, stuck = 0;
    while (guard++ < 3000) {
      const st = await page.evaluate(() => ({ over: G.over, mine: !G.over && G.seats[VB.actor(G)].human && !UI.busy, tv: !document.getElementById('tv').hidden, top: !!pend() }));
      if (st.over) break;
      if (st.tv) { const b1 = page.locator('#tv .acts .btn:not(.alt)'); if (await b1.count()) await tapSel(b1.first()); else await tapSel(page.locator('#tvClose')); taps++; continue; }
      if (SHOT && st.mine && !st.tv && !st.top) { const k = await page.evaluate(() => G.phase + '/' + G.round); if (k === '0/0' && !shots.first) { shots.first = 1; await page.waitForTimeout(400); await page.screenshot({ path: SHOT + '/first-turn.png' }); } if (k === '2/2' && !shots.mid) { shots.mid = 1; await page.evaluate(() => { if (L.tabs) { UI.tab = 'estate'; render(); } }); await page.waitForTimeout(400); await page.screenshot({ path: SHOT + '/mid-game.png' }); } }
      if (!st.mine) { await page.waitForTimeout(25); if (++stuck > 4000) { console.log(name, 'FAIL waiting'); break; } continue; } stuck = 0;
      const plan = await page.evaluate(() => {
        if (pend()) return { k: 'tap' };
        const p = G.P[VB.actor(G)], vm = VB.validMoves(G).filter(m => bumpOk(m) && (!m.w || (typeof m.die === 'number' && bumpOf(m.die) && m.w <= Math.abs(bumpOf(m.die))))).map(m => Object.assign({}, m, { w: typeof m.die === 'number' && bumpOf(m.die) ? 0 : m.w })), free = [0, 1].filter(i => !p.used[i]);
        for (const i of free) for (const m of vm) if (m.k === 'take' && m.die === i && !m.w) { const o = free.find(j => j !== i); if (o == null) continue; const c = VB.fclone(G), r = VB.performMove(c, m); if (!r.ok) continue; const t = G.depots[m.v][m.slot], si = c.P[VB.actor(c)].store.findIndex(x => x.id === t.id); const pl = VB.validMoves(c).find(x => x.k === 'place' && x.s === si && x.die === o && !x.w); if (pl) return { k: 'combo', die: i, d: m.v, slot: m.slot, cell: pl.cell }; }
        for (const m of vm) if (m.k === 'place' && typeof m.die === 'number' && !m.w) return { k: 'build', die: m.die, cell: m.cell, s: m.s };
        for (const m of vm) if (m.k === 'sell' && !m.w) return { k: 'sell', die: m.die, g: m.v };
        for (const m of vm) if (m.k === 'take' && !m.w) return { k: 'take', die: m.die, d: m.v, slot: m.slot };
        const w1 = VB.validMoves(G).find(m => (m.k === 'take' || m.k === 'place') && m.w === 1 && typeof m.die === 'number');
        if (w1 && p.workers - bumpUsed() > 0 && !bumpOf(w1.die)) return { k: 'worker', die: w1.die, sign: wrap6(p.dice[w1.die] + 1) === w1.v ? 1 : -1 };
        return { k: 'tap' };
      });
      const onTab = async t => { if (await page.evaluate(() => L.tabs)) return [{ sel: '#tab-' + t }, { wait: 350 }]; return []; };
      let ok = false; const seq0 = await page.evaluate(() => G.seq);
      if (plan.k === 'combo' && (drags.combo % 2 === 1)) { if (await page.evaluate(() => L.tabs && UI.tab !== 'market')) { await tapSel(page.locator('#tab-market')); await page.waitForTimeout(150); } ok = await drag(`#mt-${plan.d}-${plan.slot}`, [{ wait: 480 }, { sel: '#ec-' + plan.cell }]); if (ok) { drags.combo++; drags.tileDrag = (drags.tileDrag || 0) + 1; } }
      else if (plan.k === 'combo') { ok = await drag('#die-' + plan.die, [...(await page.evaluate(() => L.tabs && UI.tab !== 'market')) ? [{ sel: '#tab-market' }, { wait: 350 }] : [], { sel: `#mt-${plan.d}-${plan.slot}` }, { wait: 520 }, { sel: '#ec-' + plan.cell }]); if (ok) drags.combo++; }
      else if (plan.k === 'build') { ok = await drag(Math.random() < .5 ? '#die-' + plan.die : '#st-' + plan.s, [...await onTab('estate'), { sel: '#ec-' + plan.cell }]); if (ok) drags.build++; }
      else if (plan.k === 'sell') { ok = await drag('#die-' + plan.die, [{ sel: '#gd-' + plan.g }]); if (ok) drags.sell++; }
      else if (plan.k === 'take') { ok = await drag('#die-' + plan.die, [...await onTab('market'), { sel: `#mt-${plan.d}-${plan.slot}` }, { sel: '#store' }]); if (ok) drags.take++; }
      else if (plan.k === 'worker') { const r = await page.evaluate(i => { const e = document.querySelector('#die-' + i).getBoundingClientRect(); return { l: e.left, w: e.width, y: e.top + e.height / 2 }; }, plan.die); const a = await ctr('#r-workers'); await P.move(a.x, a.y); await P.down(); await P.move(a.x + 12, a.y - 12, { steps: 3 }); await P.move(r.l + r.w * (plan.sign > 0 ? .8 : .2), r.y, { steps: 6 }); await P.up(); ok = await page.evaluate(i => !!bumpOf(i), plan.die); if (ok) drags.worker++; }
      if (ok && plan.k !== 'worker') { await page.waitForFunction(() => !UI.busy, null, { timeout: 5000 }).catch(() => { }); await page.waitForTimeout(plan.k === 'combo' ? 120 : 0); await page.waitForFunction(() => !UI.busy, null, { timeout: 5000 }).catch(() => { }); const seq1 = await page.evaluate(() => G.seq); if (seq1 === seq0) { drags[plan.k]--; missed++; ok = false; } else if (plan.k === 'combo' && seq1 - seq0 < 2) { combo1++; } }
      if (!ok || plan.k === 'tap') {
        const order = ['#endB', '#es .glow', '#store .glow', '#mk .stgoods.glow', '#goods .glow', '#mk .tilebtn.glow', '#tabs .tab.has', '#acts .btn.alt'].map(x => x + ' >> visible=true');
        let did = false; for (const s of order) { const l = page.locator(s); if (await l.count()) { if (process.env.DBG && taps > 300 && taps < 306) console.log(name, 'tap', s, plan.k, await page.evaluate(() => JSON.stringify({ tab: UI.tab, pend: pend(), dice: G.P[VB.actor(G)].dice, used: G.P[VB.actor(G)].used, fit: L.mkFit, vm: VB.validMoves(G).slice(0, 4) }))); await tapSel(l.first()); taps++; did = true; break; } }
        if (!did) { console.log(name, 'FAIL nothing to do', plan.k); fails++; break; }
      }
      await page.waitForTimeout(20);
    }
    await page.waitForSelector('#rs:not([hidden]) #again', { timeout: 30000 }).catch(() => { });
    const done = await page.locator('#rs:not([hidden]) #again').count();
    if (SHOT && done) { await page.waitForTimeout(1500); await page.screenshot({ path: SHOT + '/result.png' }); }
    console.log(name, done ? 'PASS full game by drag' : 'FAIL no result', JSON.stringify(drags), 'button taps', taps, 'missed drops', missed, 'combo-take-only', combo1, 'scores', await page.evaluate(() => G.P.map(p => p.vp).join('/')), 'errors', errs.length, errs[0] || '');
    if (!done || errs.length || drags.combo + drags.build + drags.take < 10) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
