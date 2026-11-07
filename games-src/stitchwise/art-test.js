// Loader proof: with media/<stem>.webp files present (SW_HAVE), the slots use them with zero code changes; absent slots keep the placeholder.
// Usage (dummy files are made and removed by the caller, never committed):  node art-test.js
const { chromium } = require('playwright'); const path = require('path'); let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 763 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(__dirname, 'stitchwise.html')); await pg.waitForTimeout(400);
  const have = await pg.evaluate(() => window.SW_HAVE); ok(have.length === 3, 'SW_HAVE lists the 3 dummy files: ' + have.join(','));
  ok(await pg.evaluate(() => $('#start').style.backgroundImage.indexOf('media/bg-title.webp') > 0), 'title background slot filled by bg-title.webp');
  await pg.evaluate(() => { newGame('vs', { seed: 3, first: 0, setup: function (g) { g.btn[0] = 40; } }); });
  await pg.waitForFunction(() => !UI.busy && isHuman(swWho(G)));
  await pg.evaluate(() => { var pid = swOffer(G)[0]; G.board[0][0] = 0; G.board[0][1] = 0; G.owned[0].push(0); render(); });
  ok(await pg.evaluate(() => { var c = $('#quilt .qc.f.img'); return !!c && c.style.backgroundImage.indexOf('fabric-01.webp') > 0; }), 'patch 1 cells use fabric-01.webp (square tile, not stretched)');
  ok(await pg.evaluate(() => { var c = $('#quilt .qc.f.img'); return c.style.backgroundSize.split(' ')[0] === c.style.backgroundSize.split(' ')[1]; }), 'fabric tile keeps a square size');
  ok(await pg.evaluate(() => !!(window.CAMPAIGN && artHas('portrait-wren') && artImg('portrait-wren'))), 'portrait slot returns an image for portrait-wren');
  ok(await pg.evaluate(() => !artHas('fabric-02') && !$('#quilt .qc.f:not(.img)')), 'slots without a file keep the code-drawn placeholder');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); process.exit(fails ? 1 : 0);
})();
