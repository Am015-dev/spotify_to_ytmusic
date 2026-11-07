// Story stage 1 from the title screen to its result, tapping only visible, uncovered UI. Usage: CHR=<chrome> node story.js <url> <w> <h> [shotsDir]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
(async () => {
  const b = await L.launch(), { ctx, p } = await L.open(b, W, H, url);
  const shot = async n => { if (SH) await p.screenshot({ path: `${SH}/story-${n}.png` }) };
  if (!await L.tapSel(p, '[data-camp="open"]')) throw new Error('no Story button on the title screen');
  await L.sleep(1500);
  const log = []; let n = 0, idle = 0, t0 = Date.now(), inGame = false, tapped = new Set();
  while (Date.now() - t0 < +(process.env.MAXMS || 420000)) {
    const st = await p.evaluate(() => ({ g: typeof G !== 'undefined' && !!G, win: typeof G !== 'undefined' && !!(G && G.winner), res: !!document.querySelector('.gxc-res-on'), camp: typeof G !== 'undefined' && G ? !!UI.camp : false }));
    if (st.g) inGame = true;
    if (inGame && st.win) { await L.sleep(3500); if (SH) await shot('result'); break }
    let a = null;
    if (await L.tapSel(p, '[data-gxt-skip]')) a = 'skip-tutorial';
    else if (inGame && (a = await L.step(p))) { }
    else if (await L.tapSel(p, '.gxc-btn', { text: '^\\s*(play|start|begin|go|fight|smash|let.?s)' })) a = 'play';
    else if (await L.tapSel(p, '.gxc-btn', { text: '^\\s*(skip|next|continue|ok|got it)' })) a = 'next';
    else if (await L.tapSel(p, '.gxc-scene', {})) a = 'scene';
    else if (!inGame && await L.tapSel(p, '.gxc-node.open')) a = 'node';
    if (a) { idle = 0; n++; if (!tapped.has(a)) { tapped.add(a); log.push(a) } } else { idle++; await L.sleep(250) }
    if (idle > 400) { await shot('stuck'); throw new Error('stuck; last=' + log.join('>')) }
    await L.sleep(120);
  }
  const done = await p.evaluate(() => typeof G !== 'undefined' && !!(G && G.winner));
  const camp = await p.evaluate(() => !!(typeof UI !== 'undefined' && UI.camp));
  console.log((done && camp && !p.errs.length ? 'PASS' : 'FAIL') + ` story stage 1 ${W}x${H} taps=${n} winner=${done} campaign-game=${camp} errors=${p.errs.length} path=${log.join('>')}`, p.errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(done && camp && !p.errs.length ? 0 : 1);
})().catch(e => { console.log('FAIL story', e.message); process.exit(1) });
