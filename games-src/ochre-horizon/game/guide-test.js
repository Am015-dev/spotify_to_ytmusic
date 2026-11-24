// Learn-to-play gate: Interface tour + floating lessons by TOUCH, at machine speed, then the same game played to the end.
// Asserts: tour labels never overlap each other or the window; each label tappable; taps on NON-suggested things work during the
// tutorial (the guide never blocks); every lesson ticks; 0 JS errors; a full game finishes. Screenshots -> proof/guide-*.png
// Usage: node guide-test.js [WxH] [shots=1]
const { chromium } = require('playwright'); const path = require('path');
const WH = (process.argv[2] || '402x874').split('x').map(Number), SHOTS = process.argv[3] !== '0', TAG = WH.join('x');
const OUT = path.resolve(__dirname, '../proof');
(async () => {
  const b = await chromium.launch(); const phone = WH[0] < 900;
  const ctx = await b.newContext({ viewport: { width: WH[0], height: WH[1] }, hasTouch: true, isMobile: phone, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = [], fails = [];
  pg.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => { if (!c) fails.push(m); };
  const shot = async (n) => { if (SHOTS) await pg.screenshot({ path: `${OUT}/guide-${n}-${TAG}.png` }); };
  const W = (ms) => pg.waitForTimeout(ms);
  await pg.goto('file://' + path.resolve(__dirname, 'ochre-horizon.html') + '?fast=1'); await W(300);
  const tapSel = async (sel) => {
    const r = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 2 && r.height > 2 && !x.disabled && getComputedStyle(x).visibility !== 'hidden'; }); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { x: r.x + r.width / 2, y: r.y + r.height / 2, hit: !!h && (h === e || e.contains(h)), by: h ? (h.id || h.className || h.tagName) + '<' + (h.parentElement && (h.parentElement.id || h.parentElement.className)) : '' }; }, sel);
    if (!r) return false; if (!r.hit) fails.push('covered: ' + sel + ' by ' + r.by);
    await pg.touchscreen.tap(r.x, r.y); await W(60); return true;
  };
  const S = () => pg.evaluate(() => ({ phase: OH.G && OH.G.phase, gen: OH.G && OH.G.gen, over: OH.G && OH.G.over, side: OH.sideToAct(), busy: UI.busy, sheet: UI.sheet, modal: document.getElementById('modal').classList.contains('on'), pend: OH.G && OH.G.pending && OH.G.pending.h, done: LESSONS.filter(lessonDone).map(l => l.k), tw: document.getElementById('tw').classList.contains('on'), pc: !!UI.pc }));
  const closeAll = async () => { for (let i = 0; i < 3; i++) { const s = await S(); if (s.modal && !s.pend) { if (!(await tapSel('#mb .mx')) && !(await tapSel('#mb [data-close]'))) await pg.evaluate(() => closeModal()); } else if (s.sheet && !s.pc) { await tapSel('#shX'); } else break; } };
  // resolve whatever the engine is waiting for (tile spot, choice, resource card), by touch
  const resolve = async () => { for (let i = 0; i < 12; i++) { const s = await S(); if (!s.pend || s.side !== 0) return; if (s.pend === 'place') { if (!(await tapSel('#confirmb'))) await tapSel('#hexes .hex.tgt'); } else if (s.pend === 'choose') await tapSel('#mb [data-ch]:not([disabled])'); else if (s.pend === 'pickres') await tapSel('#mb [data-pr]'); await W(80); } };
  const waitMine = async () => { for (let i = 0; i < 200; i++) { const s = await S(); if (s.over || (s.side === 0 && !s.busy)) return s; await W(40); } return S(); };

  // ---- 1. start screen -> Learn to play
  ok(await tapSel('#stLearn'), 'no Learn to play button'); await W(300);
  let s = await S(); ok(s.phase === 'action', 'learn game not in action phase: ' + s.phase); ok(s.tw, 'floating window not shown');
  // ---- 2. tour: labels, overlaps, window
  const geo = () => pg.evaluate(() => { const L = [...document.querySelectorAll('#hg .hgl')].map(e => { const r = e.getBoundingClientRect(); return { id: e.getAttribute('data-hud'), l: r.left, r: r.right, t: r.top, b: r.bottom }; }); const w = document.getElementById('tw').getBoundingClientRect(); return { L, w: { l: w.left, r: w.right, t: w.top, b: w.bottom }, n: HUD.length, vw: innerWidth, vh: innerHeight }; });
  const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  let g = await geo();
  ok(g.L.length === g.n, `labels shown ${g.L.length} of ${g.n}`);
  for (let i = 0; i < g.L.length; i++) { const a = g.L[i]; ok(a.l >= 0 && a.t >= 0 && a.r <= g.vw && a.b <= g.vh, 'label off screen ' + a.id); ok(!hit(a, g.w), 'label under window ' + a.id); for (let j = i + 1; j < g.L.length; j++) ok(!hit(a, g.L[j]), `labels overlap ${a.id} / ${g.L[j].id}`); }
  await shot('1-tour');
  for (const L of g.L) { await tapSel(`#hg [data-hud="${L.id}"]`); const t = await pg.evaluate(() => document.querySelector('#tw .twt').textContent); ok(t.length > 20 && !/Tap any label/.test(t), 'label gave no explanation ' + L.id); }
  await shot('2-tour-explain');
  g = await geo(); for (const a of g.L) ok(!hit(a, g.w), 'label under window after taps ' + a.id);
  ok((await pg.evaluate(() => Object.keys(TW.seen).length)) === g.n, 'not every label seen');
  // non-restrictive: tap something that is NOT suggested -> it works
  await tapSel('#bCards'); s = await S(); ok(s.sheet === 'cards', 'hand did not open during tour (blocked tap)'); await closeAll();
  // minimise to a chip and back, drag the window
  await tapSel('#twMin'); ok(await pg.evaluate(() => document.getElementById('twChip').classList.contains('on') && !document.getElementById('tw').classList.contains('on')), 'minimise failed');
  await tapSel('#twChip'); ok(await pg.evaluate(() => document.getElementById('tw').classList.contains('on')), 'chip did not reopen');
  // ---- 3. lessons
  await tapSel('#twNext'); await W(80); ok(await pg.evaluate(() => TW.mode === 'lessons' && !document.getElementById('hg').classList.contains('on')), 'lessons did not open');
  const ring = () => pg.evaluate(() => document.getElementById('twRing').classList.contains('on'));
  ok(await ring(), 'no pulse ring on the suggested target'); await shot('3-goal');
  await tapSel('#blog'); s = await S(); ok(s.sheet === 'log', 'log did not open during lessons (blocked tap)'); await closeAll();
  await tapSel('#glob'); await W(300); await tapSel('#gen'); await W(300); await shot('4-stock');
  await tapSel('#res .rc[data-r="mc"]'); await W(300); await closeAll(); await shot('5-inspect');
  await tapSel('#bCards'); await W(100); await tapSel('#shTabs [data-tab="play"]'); await W(80);
  await tapSel('#shB [data-card]'); await W(300); await shot('6-play');
  if (!(await tapSel('#mPlay'))) fails.push('no playable card'); await W(200); await resolve(); await closeAll(); await W(300);
  s = await waitMine(); await shot('7-std');
  await tapSel('#bProj'); await W(100);
  if (!(await tapSel('#shB [data-std="ocean"]:not([disabled])')) && !(await tapSel('#shB [data-std="green"]:not([disabled])'))) await tapSel('#shB [data-std]:not([disabled])');
  await W(200); await resolve(); await closeAll(); await W(300); await shot('8-pass');
  // Done / Pass until the round ends (income), then the research buy
  for (let i = 0; i < 40; i++) {
    s = await waitMine(); if (s.over || s.gen >= 2 && s.phase === 'action') break;
    if (s.phase === 'research' || s.phase === 'draft') { if (!(await tapSel('#mBuy'))) await tapSel('#mb [data-dr]'); await W(100); continue; }
    if (s.pend) { await resolve(); continue; }
    await closeAll(); await tapSel('#bPass'); await W(80); await tapSel('#mPassY'); await W(150);
    if (i === 1) await shot('9-rival');
  }
  await W(400); await shot('10-income');
  await tapSel('#tMile'); await W(150); await shot('11-goals'); await closeAll();
  const byActionS = await S(); s = byActionS; const byAction = s.done.slice(); console.log(TAG, 'ticked by doing (not Next):', byAction.join(','));
  for (let i = 0; i < 12 && s.done.length < 10; i++) { await tapSel('#twNext'); await W(300); s = await S(); }
  const done = await S(); ok(done.done.length === 10, 'lessons ticked ' + done.done.join(','));
  await shot('12-done');
  ok(await tapSel('#twEnd'), 'no Keep playing button');
  // ---- 4. play the same game to the end at machine speed (engine picks the player's moves; rival runs as normal)
  for (let i = 0; i < 4000; i++) {
    s = await S(); if (s.over) break;
    if (s.side !== 0 || s.busy) { await W(20); continue; }
    await pg.evaluate(() => { const m = OHAI.decide('normal'); if (m) { closeModal(); UI.setup = null; UI.research = null; doMove(m); } }); await W(15);
  }
  s = await S(); ok(s.over, 'game did not finish: gen ' + s.gen + ' ' + s.phase);
  await W(300); const end = await pg.evaluate(() => ({ t: document.getElementById('mb').innerText.slice(0, 80).replace(/\n/g, ' '), again: !!document.getElementById('mAgain'), sc: OH.G.final && [OH.G.final[0].total, OH.G.final[1].total] }));
  ok(end.again, 'no Play again on end screen'); await shot('13-end');
  ok(errs.length === 0, 'JS errors: ' + errs.slice(0, 3).join(' | '));
  console.log(TAG, fails.length ? 'FAIL' : 'PASS', 'gen', s.gen, 'score', JSON.stringify(end.sc), 'labels', g.L.length, 'lessons', done.done.length, 'errors', errs.length);
  fails.forEach(f => console.log('  -', f));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
