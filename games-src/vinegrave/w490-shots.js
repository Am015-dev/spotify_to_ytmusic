// W490 shots (390x844, touch): first turn, an explorer mid-drag, a guardian on a ruin, mid-game. node w490-shots.js  (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms)), OUT = __dirname + '/playable-shots/w490/';
(async () => {
  const S = await serve(), b = await chromium.launch(); let errs = 0;
  const ctx = await b.newContext({ viewport: { width: +(process.env.W || 390), height: +(process.env.H || 844) }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.on('pageerror', e => { errs++; console.log('err', String(e).slice(0, 200)); });
  const cdp = await ctx.newCDPSession(p); const pre = process.env.PRE || 'phone-';
  const ctr = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  const dragHold = async (a, z, shot) => { await touch('touchStart', a.x, a.y); for (let k = 1; k <= 12; k++) { await touch('touchMove', a.x + (z.x - a.x) * k / 12, a.y + (z.y - a.y) * k / 12); await sleep(16); } await sleep(150); if (shot) await p.screenshot({ path: shot }); await touch('touchEnd'); };
  await p.goto(S.url); await p.evaluate(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); } catch (e) { } });
  await p.goto(S.url); await p.waitForSelector('#start [data-a=start]'); await sleep(500);
  await p.tap('#start [data-a=start]'); await sleep(600); await p.tap('#goal .tbtn').catch(() => { }); await sleep(1200);
  await p.screenshot({ path: OUT + pre + '1-first-turn.png' });
  // 2: drag an explorer toward a glowing camp site, shot while held over it
  const a = await ctr('.pawn.mine'), z = await ctr('.site.glow'); await dragHold(a, z, OUT + pre + '2-drag-explorer.png'); await sleep(1500);
  // 3: give compasses, discover a ruin by drag: the guardian wakes and stands on the site
  for (let t = 0; t < 40 && !(await p.evaluate(() => myTurn())); t++) { await p.tap('#board').catch(() => { }); await sleep(500); }
  await p.evaluate(() => { G.p[UI.view].res.compass = 6; render(); });
  const pw = await ctr('.pawn.mine'), ru = await ctr('.site.l1.hid.glow'); if (pw && ru) await dragHold(pw, ru, null);
  await sleep(1300); await p.screenshot({ path: OUT + pre + '3-guardian-wakes.png' });
  for (let k = 0; k < 6 && await p.evaluate(() => !document.querySelector('#fx').hidden); k++) { const f = await ctr('#fx .fxcard') || await ctr('#fx'); if (f) await p.touchscreen.tap(f.x, f.y); await sleep(700); }
  await sleep(600); await p.screenshot({ path: OUT + pre + '3-guardian.png' });
  // 4: play on (moves by the normal AI for you) to round 3
  for (let t = 0; t < 400; t++) {
    const st = await p.evaluate(() => { if (!G || G.phase === 'over' || G.round >= 3) return 'stop'; if (!document.querySelector('#fx').hidden) return 'fx'; if (myTurn()) { const m = VAI.choose(G, 'normal'); act(m); return 'me'; } return 'wait'; });
    if (st === 'stop') break; if (st === 'fx') { const f = await ctr('#fx .fxcard') || await ctr('#fx'); if (f) await p.touchscreen.tap(f.x, f.y); }
    await sleep(st === 'me' ? 900 : 400);
  }
  await sleep(1500); await p.evaluate(() => { const m = VAI.choose(G, 'normal'); if (myTurn() && m && m.t === 'play') { UI.sel = { k: 'hand', x: m.i, at: G.turns + ':' + G.round + ':' + G.p[UI.view].hand.length }; render(); } });
  await p.screenshot({ path: OUT + pre + '4-mid-game.png' });
  console.log(errs ? 'FAIL ' + errs + ' page errors' : 'PASS shots, 0 page errors'); await b.close(); S.close(); process.exit(errs ? 1 : 0);
})();
