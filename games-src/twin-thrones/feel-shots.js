// BRIEF-GAMEFEEL shots: title, Learn-to-play first screen, Goal card, first turn, mid-game, rival turn, result at 390x844 and 1440x900.
// node feel-shots.js [html in games/twin-thrones/] [outdir]   (default: games/twin-thrones/index.html, playable-shots/feel)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const html = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'games', 'twin-thrones', 'index.html'));
const out = process.argv[3] || path.join(__dirname, 'playable-shots', 'feel'); fs.mkdirSync(out, { recursive: true });
async function run(tag, vp, touch) {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const shot = n => pg.screenshot({ path: path.join(out, tag + '-' + n + '.png') });
  await pg.goto('file://' + html + '?seed=11'); await pg.waitForTimeout(700); await shot('1-title');
  await pg.evaluate(() => TT_TUTOR.start()); await pg.waitForTimeout(1800); await shot('2-learn');
  await pg.evaluate(() => { TT_TUTOR.cancel(); try { GXC.close(); } catch (e) { } TT_UI.showStart(); }); await pg.waitForTimeout(300);
  await pg.evaluate(() => TT_TEST.newGame('cpu', 11)); await pg.waitForTimeout(500); await shot('3-goal');
  await pg.evaluate(() => { document.getElementById('peek').hidden = true; window.AIDELAY = 0; TT_TEST.toPlay(0); }); await pg.waitForTimeout(800); await shot('4-first-turn');
  await pg.evaluate(() => TT_TEST.toPlay(22)); await pg.waitForTimeout(800); await shot('5-mid-game');
  await pg.evaluate(() => { window.AIDELAY = 900; const G = TT_TEST.U.G, E = TT_TEST.E; const m = E.validMoves(G).filter(x => x.t === 'discard')[0]; TT_TEST.select(m.i); });
  await pg.waitForTimeout(300); await pg.evaluate(() => document.querySelector('#zoom [data-a="discard"]').click()); await pg.waitForTimeout(500);
  for (let k = 0; k < 150 && !(await pg.evaluate(() => document.getElementById('instr').dataset.k === 'rival' && /takes|builds|sells|raises/.test(document.querySelector('#instr .tx').textContent))); k++) { await pg.waitForTimeout(150); }
  await pg.waitForTimeout(600); await shot('6-rival-turn');
  await pg.evaluate(() => { TT_TEST.U.seq++; TT_TEST.forceEnd(0); }); await pg.waitForTimeout(2500); await shot('7-result');
  await b.close(); console.log(tag, 'errors', errs.length, errs.slice(0, 2).join('|'));
}
(async () => { await run('phone', { width: 390, height: 844 }, true); await run('pc', { width: 1440, height: 900 }, false); })();
