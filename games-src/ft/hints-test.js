// HINTS TEST (W480): with Hints on in a normal Play game, the points preview line is reachable on your move step and the
// turn-over rating card shows after your turn. (Learn hides both on purpose: one message at a time, the coach speaks.)
//   node hints-test.js        Exit code 1 on any problem. Needs the build in games-src/.staging (build-all.py --quick sands-of-qamar).
const path = require('path');
const PW = (() => { try { return require('playwright'); } catch (e) { return require(path.join(__dirname, '..', 'node_modules', 'playwright')); } })();
const gx = require(path.join(__dirname, '..', 'scripts', 'gx-serve.js'));
const probs = [];
const note = m => { if (probs.length < 20) probs.push(m); };
(async () => {
  const url = await gx.url('sands-of-qamar', {});
  const b = await PW.chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  await p.goto(url); await p.waitForTimeout(1500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await p.reload(); await p.waitForTimeout(1500);
  await p.tap('[data-a=start]'); await p.waitForTimeout(600);
  await p.tap('[data-ui=goalgo]'); await p.waitForTimeout(400);
  await p.tap('#hintsbtn'); await p.waitForTimeout(400);
  if (!(await p.evaluate(() => HINTS.on))) note('Hints button did not turn hints on');
  await p.evaluate(() => { ANIM = 0; });
  // let the engine play for both seats until the human has the first move step
  let sawPreview = false, sawCard = false;
  for (let i = 0; i < 400 && !(sawPreview && sawCard); i++) {
    const r = await p.evaluate(() => { if (!G || G.over) return 'over'; const s = sideToAct(); if (s < 0) return 'none'; if (P(s).human && G.phase === 'turn' && G.step === 'move' && !G.move) return 'mine'; go(aiMove(s)); return 'step'; });
    if (r === 'mine') {
      await p.evaluate(() => { render(); }); await p.waitForTimeout(150);
      const t = await p.evaluate(() => { const e = document.getElementById('trk2'); return e && !e.hidden ? e.textContent : ''; });
      if (/Best start/.test(t)) sawPreview = true;
      // finish the human turn with the engine, then look for the rating card
      await p.evaluate(() => { const h = sideToAct(); let n = 0; while (!G.over && sideToAct() === h && n++ < 60) go(aiMove(h)); });
      for (let k = 0; k < 20 && !sawCard; k++) {
        await p.evaluate(() => { render(); }); await p.waitForTimeout(100);
        sawCard = await p.evaluate(() => { const e = document.getElementById('turnover'); return !!e && e.classList.contains('on') && /(Good|Okay|Poor):/.test(e.textContent); });
        if (!sawCard) await p.evaluate(() => { if (!G.over) { const s = sideToAct(); if (s >= 0 && !P(s).human) go(aiMove(s)); } });
      }
    } else if (r !== 'step') break;
  }
  if (!sawPreview) note('no points preview line ("Best start") with Hints on');
  if (!sawCard) note('no turn-over rating card with Hints on');
  console.log('hints-test preview ' + sawPreview + ' card ' + sawCard + (probs.length ? ' PROBLEMS' : ' PASS'));
  probs.forEach(x => console.log(' - ' + x));
  await b.close();
  process.exit(probs.length ? 1 : 0);
})();
