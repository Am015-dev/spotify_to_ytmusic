// F14 proof: a webm of the first 3 minutes at 375x667 from a fresh profile: title, Learn to play (taps only what the tutor rings),
// then "Play a real game" and real turns, tapping what glows like a newcomer (bottom-sheet choices: the first button). Writes proof/*.webm + 4 shots.
// node proof-video.js   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = await serve(), b = await chromium.launch(), dir = path.join(__dirname, 'proof'), tmp = path.join(dir, 'tmpvid');
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: tmp, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); let errs = 0; p.on('pageerror', e => { errs++; console.log('err', String(e).slice(0, 160)); });
  const at = async sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); if (!q.width) return null; return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
  const tapSel = async sel => { const r = await at(sel); if (r) { await p.touchscreen.tap(r.x, r.y); return true; } return false; };
  const t0 = Date.now(), shot = async n => p.screenshot({ path: path.join(dir, n) });
  await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(2500); await shot('01-title-375x667.png'); await tapSel('#start [data-a=tut]');
  let shots = 1;
  while (Date.now() - t0 < 150000) {
    const g = await p.evaluate(() => typeof GXT !== 'undefined' && GXT.running() ? GXT.state() : null);
    if (g && g.phase === 'end') break;
    if (g && g.shown) { if (g.wait === null) await tapSel('.gxt-next'); else if (g.hole) { await sleep(900); await p.touchscreen.tap(g.hole.cx, g.hole.cy); await sleep(900); } if (shots === 1 && g.id === 'g-disc2') { await shot('02-tutorial-375x667.png'); shots++; } }
    else { if (!(await tapSel('#rs [data-a=again], #rs .btn.go, .gxt-end .btn.go'))) await sleep(300); }
    await sleep(500);
  }
  await sleep(1500); await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /real game/i.test(x.textContent) && x.getBoundingClientRect().width); if (b) b.click(); });
  await sleep(2500);
  if (await p.evaluate(() => !G || G.phase !== 'play' || UI.mode === 'tutorial')) { await p.evaluate(() => { try { GX.close(); } catch (e) { } startGame('vs', { np: 2, lvl: 'easy' }); }); await sleep(1500); }
  let n = 0; while (Date.now() - t0 < 182000) {
    const st = await p.evaluate(() => ({ my: typeof myTurn === 'function' && myTurn(), over: G && G.phase === 'over' }));
    if (st.over) break;
    if (st.my) {
      const done = (await tapSel('body.vg-sheet #qbox [data-a=mv]')) || (await tapSel('#gobtn')) || (await tapSel('#map .site.glow')) || (await tapSel('#row .cd.glow')) || (await tapSel('#hand .cd.glow')) || (await tapSel('#track.glow')) || (await tapSel('#passbtn'));
      n++; if (n === 6) await shot('03-real-game-375x667.png'); await sleep(1300);
    } else { await sleep(700); }
  }
  await shot('04-after-3min-375x667.png');
  const v = p.video(); await ctx.close(); const src = await v.path(); fs.renameSync(src, path.join(dir, 'first-3min-375x667.webm')); fs.rmSync(tmp, { recursive: true, force: true });
  console.log('VIDEO proof/first-3min-375x667.webm', Math.round((Date.now() - t0) / 1000) + 's', 'page errors', errs); await b.close(); S.close();
})();
