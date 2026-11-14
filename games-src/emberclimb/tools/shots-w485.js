// W485 stage shots at 390x844 (real media): map, combat with a hit, card drag onto a foe, reward. Run: node tools/shots-w485.js
const { chromium } = require('playwright'), path = require('path'), { serve, sleep } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'playable-shots', 'w485');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch(); const errs = [];
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  const shot = n => pg.screenshot({ path: path.join(OUT, n) });
  await pg.goto(base); await pg.waitForSelector('#title');
  await pg.evaluate(() => { try { GXT.skip && GXT.skip(); } catch (e) { } localStorage.setItem('gxt-done-emberclimb', '1'); UI.sub = 'quick'; UI.render(); }); await sleep(300);
  await pg.click('#play'); await sleep(600); const gb = await pg.$('.ec-goal button'); if (gb) await gb.click(); await sleep(900); await shot('phone-1-map.png');
  await pg.click('.node.glow'); await sleep(1400);
  // drag the first attack card onto the first foe (pointer events, like a finger)
  const atk = await pg.evaluate(() => { const g = EC.E.G(), h = g.hs[0]; return h.hand.findIndex(c => EC.E.eff(c).tgt); });
  const card = await pg.$('.hand [data-c="' + atk + '"]'), foe = await pg.$('.en[data-w="e0"]');
  const a = await card.boundingBox(), b = await foe.boundingBox();
  await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
  for (let k = 1; k <= 12; k++) { await pg.mouse.move(a.x + a.width / 2 + (b.x + b.width / 2 - a.x - a.width / 2) * k / 12, a.y + a.height / 2 + (b.y + b.height * .45 - a.y - a.height / 2) * k / 12); await sleep(30); }
  await sleep(250); await shot('phone-3-card-drag.png');
  await pg.mouse.up(); await sleep(400); if (process.env.HOLD_SHOT) await pg.screenshot({ path: process.env.HOLD_SHOT }); await sleep(700); await shot('phone-2-combat.png');
  await sleep(1200);
  // finish the fight by playing attacks (foes set to low HP so the shot run stays short)
  await pg.evaluate(() => { EC.E.G().b.en.forEach(e => { if (!e.dead) e.hp = Math.min(e.hp, 3); }); UI.render(); }); await sleep(300);
  for (let t = 0; t < 10; t++) { const s = await pg.evaluate(() => EC.E.G().scr); if (s !== 'battle') break; const c = await pg.$('.hand .card.ok'); if (!c) { await pg.click('#end'); await sleep(2500); continue; } await c.click(); await sleep(200); const e = await pg.$('.en.glow'); if (e) await e.click(); else { const sl = await pg.$('.hand .card.sel'); if (sl) await sl.click(); } await sleep(900); }
  await sleep(1600); await shot('phone-4-reward.png');
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await br.close(); srv.close();
})();
