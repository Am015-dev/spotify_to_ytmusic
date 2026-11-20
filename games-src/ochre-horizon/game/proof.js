// Records the first 3 minutes of a Learn-to-play game at 375x667 with real taps (the computer's suggestion picks each move),
// plus 4 screenshots, into ../proof/.  node proof.js
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'proof'), F = 'file://' + __dirname + '/ochre-horizon.html';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 375, height: 667 } } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const tap = async sel => { const e = await pg.$(sel); if (!e) return false; const bb = await e.boundingBox(); if (!bb) return false; await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + Math.min(bb.height / 2, 40)); await pg.waitForTimeout(700); return true; };
  const shot = n => pg.screenshot({ path: path.join(OUT, n) });
  const t0 = Date.now();
  await pg.goto(F); await pg.waitForTimeout(1500); await shot('1-title.png');
  await tap('#stLearn'); await pg.waitForTimeout(1200);
  if (await pg.$('#coachB')) await tap('#coachB');
  await tap('[data-corp="c00"]'); await pg.waitForTimeout(800); await tap('#coachB'); await tap('#mKeep'); await pg.waitForTimeout(1500);
  let shots = 1;
  while (Date.now() - t0 < 178000) {
    const s = await pg.evaluate(() => ({ p: OH.sideToAct(), busy: UI.busy, ph: OH.G.phase, pend: OH.G.pending && OH.G.pending.h, coach: document.getElementById('coach').classList.contains('on'), over: OH.G.over, modal: document.getElementById('modal').classList.contains('on') }));
    if (s.over) break;
    if (process.env.V) console.log(Math.round((Date.now() - t0) / 1000), JSON.stringify(s));
    if (s.coach) { await pg.waitForTimeout(1600); await tap('#coachB'); continue; }
    if (s.p !== 0 || s.busy) { await pg.waitForTimeout(500); continue; }
    if (s.ph === 'research') { await pg.waitForTimeout(1200); await tap('#mBuy'); continue; }
    if (s.pend === 'place') {
      const m = await pg.evaluate(() => OHAI.decide('normal'));
      await tap('.hex[data-s="' + m.s + '"]'); await pg.waitForTimeout(500);
      if (shots === 2) { await shot('3-place.png'); shots++; }
      await tap('#confirmb'); await pg.waitForTimeout(900); continue;
    }
    if (s.pend === 'choose') { await tap('[data-ch]'); continue; }
    if (s.pend === 'pickres') { await tap('[data-pr]'); continue; }
    if (s.ph === 'final') { if (!(await tap('#mFg'))) await tap('#mFd'); continue; }
    const m = await pg.evaluate(() => OHAI.decide('normal'));
    if (m.t === 'play') {
      await tap('#bCards'); await pg.waitForTimeout(400);
      if (shots === 1) { await shot('2-cards.png'); shots++; }
      await pg.evaluate(id => { const e = document.querySelector('#shB [data-card="' + id + '"]'); if (e) e.scrollIntoView({ block: 'center' }); }, m.id);
      await tap('#shB [data-card="' + m.id + '"]'); await pg.waitForTimeout(500); await tap('#mPlay');
    } else if (m.t === 'std') { await tap('#bProj'); await pg.waitForTimeout(500); await tap('[data-std="' + m.k + '"]'); }
    else if (m.t === 'green') { await tap('#res [data-r="plant"]'); }
    else if (m.t === 'heat') { await tap('#res [data-r="heat"]'); }
    else if (m.t === 'pass') { await tap('#bPass'); if (await pg.$('#mPassY')) await tap('#mPassY'); }
    else if (m.t === 'end') { await tap('#bPass'); }
    else { await pg.evaluate(m => doMove(m), m); await pg.waitForTimeout(800); }
    await pg.waitForTimeout(400);
  }
  await shot('4-board.png');
  console.log('errors:', errs.length ? errs.join(' | ') : 0, 'gen', await pg.evaluate(() => OH.G.gen));
  const v = await pg.video().path(); await ctx.close(); await b.close();
  fs.renameSync(v, path.join(OUT, 'first-3-minutes-375x667.webm'));
})();
