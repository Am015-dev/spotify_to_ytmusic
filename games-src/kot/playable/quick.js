// Quick game from the title to the result screen, tapping only visible, uncovered UI. Usage: CHR=<chrome> node quick.js <url> <w> <h> [shotsDir]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
(async () => {
  const b = await L.launch(), { ctx, p } = await L.open(b, W, H, url);
  const shot = async n => { if (SH) await p.screenshot({ path: `${SH}/${n}.png` }) };
  await shot('title');
  if (!await L.tapSel(p, '[data-start="solo"]')) throw new Error('no Play now');
  await L.sleep(2000);
  // speed: tap the menu Speed button twice is a UI path but the menu is closed on phone; use the in-game setting if visible, else wait at Normal
  let n = 0, idle = 0, t0 = Date.now(), shotsDone = {};
  while (Date.now() - t0 < +(process.env.MAXMS || 420000)) {
    const done = await p.evaluate(() => !!(typeof G !== 'undefined' && G && G.winner));
    if (done) break;
    const a = await L.step(p);
    const st = await p.evaluate(() => typeof G !== 'undefined' && G ? { act: G.active, ph: G.phase, vp: G.pl.map(x => x.vp) } : null);
    if (st) { const k = st.act === 0 ? 'mine' : 'rival'; if (!shotsDone[k] && st.ph === 'roll' && a) { if (k === 'rival') { await L.sleep(1200); } shotsDone[k] = 1; await shot(k) } }
    if (a) { idle = 0; n++ } else { idle++; await L.sleep(250) }
    if (idle > 400) throw new Error('stuck: no tappable control for 100 s');
    await L.sleep(120);
  }
  await L.sleep(2500); const w = await p.evaluate(() => typeof G !== 'undefined' && G && G.winner != null);
  await shot('result');
  console.log((w ? 'PASS' : 'FAIL') + ' quick game ' + W + 'x' + H + ' taps=' + n + ' errors=' + p.errs.length, p.errs.slice(0, 3).join(' | '));
  await b.close(); process.exit(w && !p.errs.length ? 0 : 1);
})().catch(e => { console.log('FAIL quick', e.message); process.exit(1) });
