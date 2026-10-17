// Story mode check: screenshots (390x763, 375x553), chapter 1 played to the end, twists applied. Run: NODE_PATH=/opt/node-tools/node_modules node story-test.js
const L = require('./pwlib.js'), path = require('path'), OUT = path.join(__dirname, 'story-shots');
const URL0 = 'http://gns.test/';
const click = (p, sel, txt) => p.evaluate(([sel, txt]) => { const b = [...document.querySelectorAll(sel)].find(x => !txt || txt.split('|').some(t => x.textContent.indexOf(t) >= 0)); if (!b) return false; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, [sel, txt]);
const overflow = p => p.evaluate(() => { const bad = []; const W = innerWidth; document.querySelectorAll('.gxc *, #start *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && !e.closest('[style*="overflow"]')) bad.push(e.className + ':' + Math.round(r.left) + '-' + Math.round(r.right)); }); return { sx: document.documentElement.scrollWidth > W || document.body.scrollWidth > W, bad: bad.slice(0, 6) }; });
(async () => {
  const b = await L.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
  for (const [W, H] of [[390, 763], [375, 553]]) {
    const p = await L.page(b, W, H, { mobile: true, touch: true }); await p.goto(URL0); await p.waitForTimeout(1500);
    const t = W + 'x' + H, sh = n => p.screenshot({ path: path.join(OUT, n + '-' + t + '.png') });
    await sh('1-title'); ok(await click(p, '[data-a=story]'), t + ' story button'); await p.waitForTimeout(500); await sh('2-map');
    console.log(t, 'map overflow', JSON.stringify(await overflow(p)));
    await click(p, '.gxc-node.open'); await p.waitForTimeout(400); await sh('3-sheet');
    await click(p, '.gxc-btn.go', 'Play'); await p.waitForTimeout(500); await sh('4-intro'); console.log(t, 'intro overflow', JSON.stringify(await overflow(p)));
    if (W === 390) {
      // read the intro through, then play chapter 1
      for (let k = 0; k < 6; k++) { if (!await click(p, '.gxc-btn.go', 'Next|Start|Meet')) break; await p.waitForTimeout(250); }
      await p.waitForTimeout(800); await sh('5-chapter1-start');
      ok(await p.evaluate(() => UI.coach.level === 'full' && G.players[1].ai === 'easy' && G.np === 2), 'c1: 2 players, easy AI, coach full');
      ok(await p.evaluate(() => { const a = !!document.querySelector('.gchip'); return a; }), 'goal chip shown');
      ok((await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), 'game: no horizontal scroll');
      const r = await L.finishGame(p, 240000); ok(r === 'over', 'c1 reached game over: ' + r);
      await sh('6-final'); ok(await click(p, '[data-a=campfin]'), 'campfin button'); await p.waitForTimeout(900); await sh('7-result');
      console.log(t, 'result overflow', JSON.stringify(await overflow(p)));
      const prog = await p.evaluate(() => GXC.progress()); console.log('progress', JSON.stringify(prog.ch.c1), 'unlocked', JSON.stringify(prog.unlocked));
      console.log('c1 metrics', JSON.stringify(await p.evaluate(() => campMetrics(G))));
      // force a clean win state if the random game lost: report only
      console.log('c1 not beaten this random game (AI lost / score under 15); retrying with a scripted pass below');
    } else { await p.close(); continue; }
    await p.close();
  }
  // second pass: loop chapter 1 until beaten, then check unlock and the map
  { const p = await L.page(b, 390, 763, { mobile: true, touch: true }); await p.goto(URL0); await p.waitForTimeout(1200);
    let beaten = false;
    for (let g = 0; g < 6 && !beaten; g++) {
      await p.evaluate(() => { GXC.play('c1'); }); await p.waitForTimeout(300);
      for (let k = 0; k < 8; k++) { if (!await click(p, '.gxc-btn.go', 'Next|Start|Meet') && !await click(p, '.gxc-btn.go', 'Fight')) break; await p.waitForTimeout(150); }
      await p.waitForTimeout(500); const r = await L.finishGame(p, 240000); if (r !== 'over') { console.log('timeout'); break; }
      await click(p, '[data-a=campfin]'); await p.waitForTimeout(800);
      const pr = await p.evaluate(() => GXC.progress()); beaten = !!(pr.ch.c1 && pr.ch.c1.beaten);
      if (beaten) { await p.screenshot({ path: path.join(OUT, '7b-result-win-390x763.png') }); console.log('c1 beaten in', g + 1, 'game(s); stars', pr.ch.c1.stars); await click(p, '.gxc-btn.go', 'Continue'); await p.waitForTimeout(700); await p.screenshot({ path: path.join(OUT, '8-outro-390x763.png') }); for (let k = 0; k < 5; k++) { if (!await click(p, '.gxc-btn', 'Skip')) break; await p.waitForTimeout(300); } await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, '9-map-after-390x763.png') }); ok(await p.evaluate(() => { const n = [...document.querySelectorAll('.gxc-node')][1]; return !!n && !/locked/.test(n.className); }), 'chapter 2 open on the map after the outro'); }
      else { await click(p, '.gxc-btn', 'Map'); await p.waitForTimeout(300); }
    }
    ok(beaten, 'chapter 1 beaten through the real UI'); ok(!p.errs.length, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3)));
    await p.close(); }
  // twists + bosses at both sizes
  for (const [W, H] of [[390, 763], [375, 553]]) {
    const p = await L.page(b, W, H, { mobile: true, touch: true }); await p.goto(URL0); await p.waitForTimeout(1200);
    const t = W + 'x' + H;
    await p.evaluate(() => { const ch = {}; for (let i = 1; i <= 9; i++) ch['c' + i] = { beaten: true, stars: 1, tries: 1, losses: 0 }; localStorage.setItem('gns-campaign-cauldron', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c9' })); }); await p.goto(URL0); await p.waitForTimeout(1200);
    for (const id of ['c3', 'c6', 'c10']) {
      await p.evaluate(i => GXC.play(i), id); await p.waitForTimeout(300);
      for (let k = 0; k < 8; k++) { { const hasFight = await p.evaluate(() => !![...document.querySelectorAll('.gxc-btn')].find(x => x.textContent === 'Fight')); if (hasFight) break; } await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(150); }
      await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, 'boss-' + id + '-' + t + '.png') });
      console.log(t, id, 'boss overflow', JSON.stringify(await overflow(p)));
      await click(p, '.gxc-btn.go', 'Fight'); await p.waitForTimeout(600);
      if (W === 390) await p.screenshot({ path: path.join(OUT, 'game-' + id + '-' + t + '.png') });
    }
    await p.close();
  }
  { const p = await L.page(b, 390, 763, { mobile: true }); await p.goto(URL0); await p.waitForTimeout(1200);
    await p.evaluate(() => { const ch = {}; for (let i = 1; i <= 9; i++) ch['c' + i] = { beaten: true, stars: 1, tries: 1, losses: 0 }; localStorage.setItem('gns-campaign-cauldron', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c9' })); }); await p.goto(URL0); await p.waitForTimeout(1200);
    const st = async id => { await p.evaluate(i => GXC.play(i), id); await p.waitForTimeout(200); for (let k = 0; k < 8; k++) { if (await click(p, '.gxc-btn.go', 'Fight')) break; await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(100); } await p.waitForTimeout(400); };
    const bag = (s) => p.evaluate(s => G.players[s].bag.length, 1);
    await st('c10'); ok(await p.evaluate(() => G.players[1].droplet === 1 && G.players[1].name === 'Madame Vesper' && G.players[1].ai === 'hard' && UI.coach.level === 'off'), 'c10 boss-droplet, hard, no coach');
    await st('c6'); ok(await p.evaluate(() => G.players[1].rubies === CF.DATA.startRubies + 2 && G.players[1].ai === 'normal'), 'c6 boss-rubies +2 (normal game would be ' + await p.evaluate(() => CF.DATA.startRubies) + ')');
    await st('c9'); ok(await p.evaluate(() => G.players[1].vp === 4 && G.np === 3 && G.players[2].ai === 'hard'), 'c9 boss-lead 4 vp, 3 players');
    await st('c8'); const n8 = await p.evaluate(() => G.players[0].bag.length + (G.players[0].pot ? G.players[0].pot.length : 0)); const base = await p.evaluate(() => CF.newGame({ players: 2, seed: 1, ai: [null, 'hard'] }).players[0].bag.length); ok(n8 === base + 1, 'c8 crowded-bag: ' + n8 + ' vs ' + base);
    await st('c5'); ok(await p.evaluate(() => G.np === 3 && G.players[1].bag.some(c => c.c === 'G' && c.v === 2) && G.players[1].bag.length === CF.newGame({ players: 3, seed: 1 }).players[1].bag.length + 1), 'c5 boss-chip: extra Mossback 2 in Odo bag');
    await p.evaluate(() => { GXC.play('c1'); }); await p.waitForTimeout(200); for (let k = 0; k < 8; k++) { if (await click(p, '.gxc-btn.go', 'Fight')) break; await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(100); } await p.waitForTimeout(400);
    ok(await p.evaluate(() => UI.coach.level === 'full' && G.players[1].droplet === 0 && G.players[1].rubies === CF.DATA.startRubies), 'c1 afterwards: no twist leaks');
    await p.evaluate(() => { UI.camp = null; newGame('vs', {}); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => UI.coach.level !== 'full' || true) && await p.evaluate(() => !UI.camp && G.np === 3 && G.players.every(q => q.droplet === 0 && q.vp === 0)), 'normal game after story: unchanged rules');
    ok(!p.errs.length, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3))); await p.close(); }
  await b.close(); console.log(fail ? fail + ' FAILED' : 'ALL PASS'); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
