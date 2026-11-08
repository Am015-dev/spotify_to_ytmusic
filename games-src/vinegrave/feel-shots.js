// GAMEFEEL brief shots: title, Learn-to-play first screen, Goal card, first turn, mid-game, rival turn, result at 390x844 and 1440x900.
// node feel-shots.js <outDir>   (python3 build.py first; png out, convert to webp after)
const { chromium } = require('playwright'), serve = require('./serve.js');
const OUT = process.argv[2] || 'shots';
(async () => {
  const S = await serve(), b = await chromium.launch(); let bad = 0;
  for (const [name, vp, touch] of [['390', { width: 390, height: 844 }, true], ['1440', { width: 1440, height: 900 }, false]]) {
    const mk = async played => { const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); await ctx.addInitScript(p => { try { if (p) { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } } catch (e) { } }, played); const pg = await ctx.newPage(); pg.on('pageerror', e => { bad++; console.log('err', String(e).slice(0, 120)); }); return [ctx, pg]; };
    const tap = (pg, sel) => touch ? pg.tap(sel) : pg.click(sel);
    // fresh player: title + learn to play first screen
    let [ctx, p] = await mk(false);
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/title-${name}.png` });
    await tap(p, '#start .tbtn'); await p.waitForTimeout(3500); await p.screenshot({ path: `${OUT}/learn-${name}.png` }); await ctx.close();
    // returning player: goal, first turn, rival turn, mid-game
    [ctx, p] = await mk(true);
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await tap(p, '#start .tbtn'); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/goal-${name}.png` });
    await tap(p, '#goal .tbtn'); await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 20000 }); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/first-turn-${name}.png` });
    await p.evaluate(() => { const m = VAI.choose(G, 'normal'); doMove(m); }); await p.waitForTimeout(1600); await p.screenshot({ path: `${OUT}/rival-turn-${name}.png` });
    await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 30000 });
    await p.evaluate(() => { UI.fast = true; let n = 0; while (G.phase === 'play' && G.round < 3 && n++ < 400) VG.apply(G, VAI.choose(G, 'normal')); UI.fast = false; render(); });
    await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/mid-game-${name}.png` }); await ctx.close();
    [ctx, p] = await mk(true);
    await p.goto(S.url + '?scn=vg-result'); await p.waitForSelector('#rs:not([hidden]) table', { timeout: 30000 }); await p.waitForTimeout(3500); await p.screenshot({ path: `${OUT}/result-${name}.png` }); await ctx.close();
  }
  console.log(bad ? 'FAIL feel shots, page errors ' + bad : 'PASS feel shots'); await b.close(); S.close();
})();
