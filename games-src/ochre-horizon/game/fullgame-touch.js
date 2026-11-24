// Plays ONE COMPLETE game of Ochre Horizon against the computer, menu -> final score, by touch only (402x874).
// Targets are read from the screen (DOM): glowing chips, enabled buttons, cards without the "can't play" mark, glowing hexes.
// No hard-coded coordinates, no engine calls to make moves (engine is only READ to log the result and check the screen).
// Checks at every tap: target >= 44 px, not covered (elementFromPoint), on screen. Unplayable cards must say why.
// Usage: node fullgame-touch.js [outDir] [video=1]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2] || path.resolve(__dirname, '../proof'), VIDEO = process.argv[3] !== '0';
(async () => {
  const b = await chromium.launch(); const vp = { width: 402, height: 874 };
  const ctx = await b.newContext(Object.assign({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }, VIDEO ? { recordVideo: { dir: out + '/vid', size: vp } } : {}));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, 'ochre-horizon.html') + '?fast=1&seed=4242'); await pg.waitForTimeout(600);
  const issues = new Set(), log = []; let taps = 0, idle = 0, whySeen = 0;
  // find the first visible element matching sel (optionally filtered), return its centre and checks
  const find = (sel, filt) => pg.evaluate(([sel, filt]) => {
    const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && !e.disabled; });
    const e = els.find(x => !filt || (filt === 'playable' ? !x.querySelector('.card.no') : filt === 'nodis' ? !x.disabled : true));
    if (!e) return null; e.scrollIntoView({ block: 'nearest' });
    const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), hit: !!h && (h === e || e.contains(h) || h.contains(e)), label: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 50), on: r.top >= 0 && r.bottom <= innerHeight };
  }, [sel, filt || null]);
  const tap = async (sel, filt, what) => {
    const t = await find(sel, filt); if (!t) return false;
    if (t.w < 44 || t.h < 44) issues.add(`small target ${what || sel} ${t.w}x${t.h} ` + (await pg.evaluate(() => OH.G.phase + ' gen ' + OH.G.gen + ' pending ' + JSON.stringify(OH.G.pending && OH.G.pending.d && OH.G.pending.d.t) + ' scale ' + UI.view.s.toFixed(2) + ' hexPx ' + hexPx().toFixed(1))));
    if (!t.hit) issues.add(`covered target ${what || sel} "${t.label}"`);
    if (!t.on) issues.add(`off-screen target ${what || sel}`);
    await pg.touchscreen.tap(t.x, t.y); taps++; await pg.waitForTimeout(260); return true;
  };
  const state = () => pg.evaluate(() => ({
    start: getComputedStyle(document.getElementById('start')).display !== 'none', modal: document.getElementById('modal').classList.contains('on'),
    sheet: !!document.querySelector('#sheet.on, .sheet.on'), over: OH.G && OH.G.over, gen: OH.G && OH.G.gen, phase: OH.G && OH.G.phase,
    tgt: !!document.querySelector('.hex.tgt'), confirm: !!document.querySelector('#confirmb') && getComputedStyle(document.getElementById('confirmb')).display !== 'none',
    myTurn: !document.getElementById('bPass').disabled, busy: UI.busy, hint: (document.getElementById('hintt') || {}).textContent || ''
  }));
  // every unplayable card in the hand must carry a visible reason
  const checkWhy = () => pg.evaluate(() => [...document.querySelectorAll('#shB [data-card] .card.no')].filter(c => !c.querySelector('.why') || !c.querySelector('.why').textContent.trim()).length);
  const t0 = Date.now(); let lastGen = 0;
  while (Date.now() - t0 < 900000) {
    const s = await state();
    if (s.over && !s.modal) break;
    if (s.gen !== lastGen) { lastGen = s.gen; log.push(`gen ${s.gen} taps ${taps}`); }
    if (s.start) { await tap('#stNew', null, 'New game'); continue; }
    if (s.modal) {
      if (await tap('#mb [data-corp]', null, 'company')) continue;
      if (await tap('#mKeep', null, 'Keep cards')) continue;
      if (await tap('#mb [data-dr]', null, 'draft card')) continue;
      if (await tap('#mBuy', null, 'Buy')) continue;
      if (await tap('#mb [data-ch]', 'nodis', 'choice')) continue;
      if (await tap('#mb [data-pr]', null, 'resource card')) continue;
      if (await tap('#mFg', null, 'final greenery')) continue;
      if (await tap('#mFd', null, 'final done')) continue;
      if (await tap('#mPlay', null, 'Play card')) continue;
      if (await tap('#mPassY', null, 'Pass yes')) continue;
      if (s.over) break;
      if (await tap('#mx, #modal .x, [aria-label="Close"]', null, 'close')) continue;
      issues.add('STUCK in a modal: ' + (await pg.evaluate(() => document.getElementById('mb').textContent.slice(0, 80)))); break;
    }
    if (s.tgt) { await tap('.hex.tgt', null, 'glowing space'); if (await find('#confirmb')) await tap('#confirmb', null, 'confirm place'); continue; }
    if (s.busy || !s.myTurn || s.phase !== 'action') { await pg.waitForTimeout(150); if (++idle > 400) { issues.add('STUCK waiting: ' + JSON.stringify(s)); break; } continue; }
    idle = 0;
    if (s.sheet) await pg.evaluate(() => closeSheet());
    if (await tap('#res [data-r="plant"].go', null, 'plants chip')) continue;
    if (await tap('#res [data-r="heat"].go', null, 'heat chip')) continue;
    if (await find('#bCards .badge')) {
      await tap('#bCards', null, 'Cards');
      if (await find('#shTabs [data-tab="all"]')) { await tap('#shTabs [data-tab="all"]', null, 'Hand tab'); }
      const bad = await checkWhy(); const seen = await pg.evaluate(() => document.querySelectorAll('#shB .card.no').length); whySeen += seen;
      if (await find('#shTabs [data-tab="play"]')) await tap('#shTabs [data-tab="play"]', null, 'Can play tab'); if (bad) issues.add(`${bad} unplayable card(s) without a reason`);
      if (await tap('#shB [data-card]', 'playable', 'playable card')) { if (await tap('#mPlay', null, 'Play')) continue; }
      await pg.evaluate(() => { closeModal(); closeSheet(); });
    }
    await tap('#bProj', null, 'Projects');
    let did = false;
    for (const k of ['city', 'greenery', 'aquifer', 'asteroid', 'power']) if (await tap(`#shB [data-std="${k}"]`, 'nodis', 'project ' + k)) { did = true; break; }
    if (did) continue;
    await pg.evaluate(() => closeSheet());
    await tap('#bPass', null, 'Pass'); if (await find('#mPassY')) await tap('#mPassY', null, 'Pass yes');
  }
  const fin = await pg.evaluate(() => ({ over: OH.G.over, gen: OH.G.gen, you: OH.G.final ? OH.G.final[0].total : OH.score(0).total, rival: OH.G.final ? OH.G.final[1].total : OH.score(1).total, end: document.getElementById('mb').textContent.slice(0, 120) }));
  await pg.waitForTimeout(1500);
  if (VIDEO) await pg.screenshot({ path: out + '/full-game-final-402x874.png' });
  const vid = VIDEO && pg.video(); await ctx.close();
  if (vid) { fs.copyFileSync(await vid.path(), `${out}/full-game-402x874.webm`); fs.rmSync(out + '/vid', { recursive: true, force: true }); }
  console.log(log.join(' | '));
  console.log('RESULT', JSON.stringify(fin), 'taps', taps, 'unplayable cards checked', whySeen, 'pageerrors', errs.length, errs.slice(0, 3).join(' | '));
  console.log('ISSUES', issues.size); [...issues].forEach(i => console.log('  ' + i));
  await b.close(); process.exit(!fin.over || errs.length || issues.size ? 1 : 0);
})();
