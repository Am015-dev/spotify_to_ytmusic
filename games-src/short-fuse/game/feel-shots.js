// feel-shots.js: the 7 "game feel" screenshots (title, Learn to play, Goal card, first turn, mid-game, rival turn, result) at one size.
//   node feel-shots.js [url=http://localhost:8765/] [WxH=390x844]   -> ../playable-shots/feel/<name>-<W>.png
// Real taps (touchscreen on phone) for every button; the human seat's wire moves use the engine's own best move (as shoot.js does).
const PW = require('playwright'); const path = require('path'); const fs = require('fs');
const URL_ = process.argv[2] || 'http://localhost:8765/'; const [W, H] = (process.argv[3] || '390x844').split('x').map(Number);
const OUT = path.join(__dirname, '..', 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const errs = [];
(async () => {
  const b = await PW.chromium.launch(); const touch = W < 800;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: touch, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  const tap = async sel => { const el = await p.waitForSelector(sel, { state: 'visible', timeout: 8000 }); const r = await el.boundingBox();
    if (touch) await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2); };
  const shot = async n => { await p.screenshot({ path: path.join(OUT, n + '-' + W + '.png') }); console.log('shot', n); };
  await p.goto(URL_); await sleep(1000); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('gxt-short-fuse', JSON.stringify({ done: 1 })) });
  await p.reload(); await sleep(1800); await shot('1-title');
  await tap('#start [data-a="offeryes"]'); await sleep(2600); await shot('2-learn');
  // back to a fresh Quick game through the start screen
  await p.evaluate(() => { try { localStorage.removeItem('sf_save') } catch (e) {} UI.coach = null; }); await p.reload(); await sleep(1800);
  await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('gxt-short-fuse', JSON.stringify({ done: 1 })) } catch (e) {} }); await p.reload(); await sleep(1800);
  await tap('#start [data-a="start"]'); await sleep(1500);
  if (await p.$('[data-a="briefok"]')) { await shot('3-goal'); await tap('[data-a="briefok"]'); } else console.log('no goal card');
  await sleep(2500); await shot('4-first-turn');
  let rival = false, mid = false;
  for (let i = 0; i < 900; i++) {
    await sleep(200);
    const r = await p.evaluate(() => { const V = UI.V; if (!V || G.over) return 'over'; const tot = G.st.reduce((a, s) => a + s.w.length, 0), cut = G.st.reduce((a, s) => a + s.w.filter(x => x.cut).length, 0);
      const s = decider(); const say = document.getElementById('say'); const hold = Date.now() < (TBL.sayT || 0);
      if (s !== V.seat) return (s >= 0 && hold && cut / tot > .2) ? 'rivalcap' : 'wait';
      if (cut / tot > .45 && !G.q && !UI.sel && !hold) return 'mid';
      if (hold) { TBL.sayT = 0; UI.aiNotBefore = 0; refresh(); return 'read' } const m = aiMove(V.seat); if (m && !legal(m, V.seat)) act(m, V.seat); return 'act' });
    if (r === 'over') break;
    if (r === 'rivalcap' && !rival) { rival = true; await sleep(700); await shot('6-rival-turn'); }
    if (r === 'mid' && !mid) { mid = true; await sleep(600); await shot('5-mid-game'); await p.evaluate(() => { UI.speed = 6 }); }
  }
  await sleep(2500); await shot('7-result');
  console.log('page errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close();
})();
