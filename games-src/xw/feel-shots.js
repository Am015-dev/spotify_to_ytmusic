// Feel shots (BRIEF-GAMEFEEL point 8): title, Learn first screen, Goal card, first turn, mid-game, rival turn, result
// at 390x844 (touch) and 1440x900 (mouse). Plays by real taps/clicks only. usage: node feel-shots.js [stagedIndexHtml]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '../..'), OUT = __dirname + '/playable-shots/feel/';
const SITE = process.env.SITE || '/tmp/na-site'; fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SITE, { recursive: true });
fs.copyFileSync(process.argv[2] || __dirname + '/nebula.html', SITE + '/index.html');
for (const d of ['media', 'models', 'music']) { try { fs.symlinkSync(R + '/games/nebula-aces/' + d, SITE + '/' + d); } catch (e) { } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const [w, h, mob] of (process.env.SIZES==='pc'?[[1440, 900, false]]:process.env.SIZES==='phone'?[[390, 844, true]]:[[390, 844, true], [1440, 900, false]])) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const shot = n => p.screenshot({ path: OUT + n + '-' + w + '.png' });
    const tap = async sel => { const el = await p.$(sel); if (!el) return false; const bx = await el.boundingBox(); if (!bx) return false;
      const x = bx.x + bx.width / 2, y = bx.y + bx.height / 2; if (mob) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); return true; };
    await p.goto('file://' + SITE + '/index.html'); await sleep(2500); await shot('1-title');
    await tap('.gxt-first:visible, button.gxt-menu:visible'); await sleep(6000); await shot('2-learn-first');
    await p.evaluate(() => { try { GXT.stop(); } catch (e) { } try { tutLeave(); } catch (e) { } try { localStorage.setItem('na_played', '1'); } catch (e) { } });
    await p.goto('file://' + SITE + '/index.html'); await sleep(2500);
    await tap('button.primary:visible:has-text("Launch")'); await sleep(2500); await shot('3-goal-card');
    await tap('[data-bf="brief"]'); await sleep(2500); await p.evaluate(() => { try { UI.speed = 'fast'; } catch (e) { } });
    const PC = '.gx-dock button.primary:not([disabled]):visible, .gx-dock button.sug:not([disabled]):visible, .gx-dock button:has-text("★"):not([disabled]):visible, .gx-dock button:has-text("Roll"):visible, .gx-dock button:has-text("Next"):visible, .gx-dock button:has-text("Continue"):visible, .gx-dock button:has-text("OK"):visible';
    let rival = false, mid = false, first = false;
    for (let i = 0; i < 900; i++) {
      const st = await p.evaluate(() => ({ ph: G.phase, r: G.round, win: G.winner, ht: humanTurn(), hold: !!UI.hold }));
      if (st.win) break;
      if (!first && st.ph === 'plan' && st.r === 1) { await tap('.bfring.need'); await sleep(900); await shot('4-first-turn'); first = true; }
      if (!rival && st.r >= 1 && !st.ht && st.ph !== 'plan') { await sleep(500); await shot('6-rival-turn'); rival = true; }
      if (!mid && st.r >= 3 && st.ht) { await shot('5-mid-game'); mid = true; }
      const done = await tap('[data-bf="auto"]') && (await sleep(300), await tap('[data-bf="fly"]:not([disabled])'));
      if (!done && !(await tap('#bfbtns .btn.primary:not([disabled])')) && !(await (async () => { for (const q of ['.bftgt', '.bfact', '.bfring.need', '.bfm.sug', '#bfdice .die.pick', '#bfbtns .btn:not([disabled])']) if (await tap(q)) return true; return false; })())) await p.evaluate(() => { try { if (UI.hold) releaseHold(); } catch (e) { } });
      await sleep(700);
    }
    await sleep(3000); await shot('7-result');
    const res = await p.evaluate(() => ({ win: G.winner, r: G.round }));
    console.log(w + 'x' + h, 'result', JSON.stringify(res), 'errors', errs.length, errs.slice(0, 2)); if (!res.win || errs.length) bad++;
    await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0); })();
