// Contact-sheet shots for the W734 overhaul: title, each lesson start, rules/log/menu windows, a real game, end screen; phone + PC.
//   NODE_PATH=$(npm root -g) node games-src/wickdeep/sheet-shots.js <wickdeep.html> <outdir>   then: python3 sheet-compose.py <outdir> <prefix>
const PW = require('playwright'), fs = require('fs'), path = require('path');
const [HTML, OUT] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await PW.chromium.launch();
  for (const [W, H, tag] of [[402, 874, 'phone'], [1366, 768, 'pc']]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
    const html = fs.readFileSync(HTML);
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); await p.goto('https://gns.test/?2d=1'); await p.waitForFunction(() => window.WDL);
    const shot = async n => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, tag + '-' + n + '.png') }); };
    await shot('01-title');
    for (const id of ['pick', 'halves', 'shield', 'retal', 'door', 'coin', 'finish']) {
      await p.evaluate(id => GXST.start(id), id); await p.waitForFunction(() => GXST.state().live, null, { timeout: 15000 }).catch(() => { });
      await shot('02-lesson-' + id);
    }
    await p.evaluate(() => GXST.close && GXST.close());
    for (const d of ['rulesd', 'logd', 'setd']) {
      await p.evaluate(d => { const x = document.querySelector('[data-gx=' + d + ']'); x && x.click(); }, d); await shot('03-win-' + d);
      await p.evaluate(() => { try { GX.close(); } catch (e) { } });
    }
    await p.evaluate(() => { try { UI.tut = false; CAMP = WDC.newCamp(['warden'], 0); WDUI.startScenario(1, { seed: 3, party: [{ cls: 'warden', lvl: 1 }], tut: false }); } catch (e) { } });
    await shot('04-game');
    for (let k = 0; k < 600; k++) { const done = await p.evaluate(() => { if (G.done) return 1; try { WD.apply(G, WDAI.choose(G)); G.ev = []; } catch (e) { return 2; } return 0; }); if (done) break; }
    await p.evaluate(() => { try { WDUI.refresh(); showResult(); } catch (e) { } }); await shot('05-end');
    await ctx.close();
  }
  await b.close();
})();
