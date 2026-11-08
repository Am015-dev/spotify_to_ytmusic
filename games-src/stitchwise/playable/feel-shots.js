// Feel shots: node playable/feel-shots.js WxH [outdir]   (URL env = served page). Real taps / clicks only.
// Title, Learn-to-play first screen, Goal card, first turn, mid-game (after ~10 turns), rival turn, result.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const [w, h] = (process.argv[2] || '390x844').split('x').map(Number);
const OUT = process.argv[3] || path.join(__dirname, '..', 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/stitchwise/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const touch = w < 900;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const shot = n => pg.screenshot({ path: path.join(OUT, `${w}x${h}-${n}.png`) });
  const tapXY = async (x, y) => { if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); };
  const click = async s => { const e = await pg.$(s); if (!e) return false; const bb = await e.boundingBox(); if (!bb) return false; await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };
  const humanTurn = () => pg.waitForFunction(() => window.G && !UI.busy && !UI.goal && (G.over || isHuman(swWho(G))), null, { timeout: 60000 });
  // one human turn by real input: pick the first buyable offer, sew at the suggested spot (ghost starts on a legal spot) or Advance
  const playTurn = async () => {
    await humanTurn(); if (await pg.evaluate(() => G.over)) return false;
    if (await pg.evaluate(() => !!G.pend)) { const c = await pg.$('#quilt .qc:not(.f):not(.lea):not(.torn)'); if (c) { const bb = await c.boundingBox(); await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await pg.evaluate(() => act(swMoves(G)[0])); await pg.waitForTimeout(800); return true; }
    if (await click('#offers .offer.can')) { await pg.waitForTimeout(700); if (await click('[data-a=sew]')) { await pg.waitForTimeout(900); return true; } }
    await click('[data-a=adv]'); await pg.waitForTimeout(900); return true;
  };
  await pg.goto(URL); await pg.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await pg.reload(); await pg.waitForTimeout(1200);
  await shot('1-title');
  if (await click('[data-a=start]')) { await pg.waitForTimeout(2200); await shot('2-learn'); }
  await pg.goto(URL); await pg.evaluate(() => { localStorage.setItem('sw_seen', '1'); }); await pg.reload(); await pg.waitForTimeout(900);
  await click('[data-a=quick]'); await pg.waitForTimeout(400); const nc = await pg.$('text=Normal computer'); if (nc) { const bb = await nc.boundingBox(); await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); }
  const st = await pg.$('text=Start the game'); if (st) { const bb = await st.boundingBox(); await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); }
  await pg.waitForTimeout(700); await shot('3-goal'); await click('#goalcard [data-a=goalok]');
  await humanTurn(); await pg.waitForTimeout(1500); await shot('4-first');
  if (await click('#offers .offer.can')) { await pg.waitForTimeout(700); await shot('4b-picked'); if (!(await click('[data-a=sew]'))) await click('[data-a=adv]'); } else await click('[data-a=adv]');
  // catch the rival mid-turn
  for (let i = 0; i < 80; i++) { await pg.waitForTimeout(100); if (await pg.evaluate(() => G && !G.over && !isHuman(swWho(G)) && UI.peek >= 0)) break; }
  await pg.waitForTimeout(500); await shot('6-rival');
  for (let t = 0; t < 9; t++) if (!(await playTurn())) break;
  await humanTurn(); await pg.waitForTimeout(1200); await shot('5-mid');
  for (let t = 0; t < 80; t++) if (!(await playTurn())) break;
  await pg.waitForTimeout(4000); await shot('7-result');
  const over = await pg.evaluate(() => !!(G && G.over));
  console.log(w + 'x' + h, 'over', over, 'errors', JSON.stringify(errs)); await b.close(); process.exit(over && !errs.length ? 0 : 1);
})();
