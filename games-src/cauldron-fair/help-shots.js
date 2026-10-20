// Screenshots of the help kit at 390x763 into playtest/: help-coach-bubble.png (the first bubble), help-bulb-suggestion.png (the bulb's finger + why),
// help-rules-card.png (a rules card). Usage: NODE_PATH=/opt/node-tools/node_modules node help-shots.js
const PW = require(process.env.PW || 'playwright'), fs = require('fs'), path = require('path');
const html = fs.readFileSync(__dirname + '/cauldron-fair.html');
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await PW.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('https://gns.test/?phone=1&seed=5'); await sleep(900);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(900);
  await p.evaluate(() => { UI.pullMs = 0; window.AIDELAY = 400; UI.prefs.played = true; newGame('vs', optObj()); }); await sleep(1200);
  const tap = async sel => { const c = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); if (!c) return false; await p.touchscreen.tap(c[0], c[1]); return true; };
  const bubble = async () => { for (let i = 0; i < 25; i++) { if (await p.evaluate(() => !!document.querySelector('.gxh-bub.on[data-phase]'))) return true; await sleep(150); } return false; };
  // a fortune card that asks something comes first: its bubble, then the answer; then the first-time bubble of the brew ("Pull a chip")
  if (await p.evaluate(() => !!(G.players[0].q))) { await bubble(); await sleep(400); await p.screenshot({ path: path.join(OUT, 'help-coach-card.png') }); await tap('#qbox [data-a=mv]'); await sleep(900); }
  const ok = await bubble();
  console.log('coach bubble', ok, await p.evaluate(() => (document.querySelector('.gxh-bub.on') || {}).textContent));
  await sleep(400); await p.screenshot({ path: path.join(OUT, 'help-coach-bubble.png') });
  await tap('#acts .bagb:not(.off)'); await sleep(900);
  // draw three chips so the bulb has something to say about the next one
  for (let k = 0; k < 2; k++) { await tap('#acts .bagb:not(.off)'); await sleep(900); }
  await p.evaluate(() => { GXH.hide(); });
  await tap('#bulbbtn'); await sleep(600);
  console.log('bulb', await p.evaluate(() => ({ finger: !!document.querySelector('.gxh-finger'), why: (document.querySelector('.gxh-bub.on .gxh-tx') || {}).textContent })));
  await p.screenshot({ path: path.join(OUT, 'help-bulb-suggestion.png') });
  await tap('.gxh-bub .gxh-link'); await sleep(400);
  console.log('rules', await p.evaluate(() => ({ n: (document.querySelector('.gxh-rules') || { dataset: {} }).dataset.count, t: (document.querySelector('.gxh-rt') || {}).textContent })));
  await p.screenshot({ path: path.join(OUT, 'help-rules-card.png') });
  await b.close();
})();
