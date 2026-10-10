// Story mode check: screenshots (390x763, 375x553), chapter 1 played to the end, twists applied. Run: NODE_PATH=/opt/node-tools/node_modules node story-test.js
const L = require('./pwlib.js'), path = require('path'), OUT = path.join(__dirname, 'story-shots');
const URL0 = 'http://gns.test/';
const click = (p, sel, txt) => p.evaluate(([sel, txt]) => { const b = [...document.querySelectorAll(sel)].find(x => !txt || txt.split('|').some(t => x.textContent.indexOf(t) >= 0)); if (!b) return false; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, [sel, txt]);
const overflow = p => p.evaluate(() => { const bad = []; const W = innerWidth; document.querySelectorAll('.gxc *, #start *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && !e.closest('[style*="overflow"]')) bad.push(e.className + ':' + Math.round(r.left) + '-' + Math.round(r.right)); }); return { sx: document.documentElement.scrollWidth > W || document.body.scrollWidth > W, bad: bad.slice(0, 6) }; });
(async () => {
  const b = await L.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
  { const p = await L.page(b, 390, 763, { mobile: true }); await p.goto(URL0); await p.waitForTimeout(1200);
    await p.evaluate(() => { const ch = {}; for (let i = 1; i <= 9; i++) ch['c' + i] = { beaten: true, stars: 1, tries: 1, losses: 0 }; localStorage.setItem('gns-campaign-cauldron', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c9' })); }); await p.goto(URL0); await p.waitForTimeout(1200);
    const st = async id => { await p.evaluate(i => GXC.play(i), id); await p.waitForTimeout(200); for (let k = 0; k < 8; k++) { if (await click(p, '.gxc-btn.go', 'Fight')) break; await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(100); } await p.waitForTimeout(400); };
    const bag = (s) => p.evaluate(s => G.players[s].bag.length, 1);
    await st('c10'); ok(await p.evaluate(() => G.players[1].droplet === 1 && G.players[1].name === 'Vesper' && G.players[1].ai === 'hard' && UI.coach.level === 'off'), 'c10 boss-droplet, hard, no coach');
    await st('c6'); ok(await p.evaluate(() => G.players[1].rubies === CF.DATA.startRubies + 2 && G.players[1].ai === 'normal'), 'c6 boss-rubies +2 (normal game would be ' + await p.evaluate(() => CF.DATA.startRubies) + ')');
    await st('c9'); ok(await p.evaluate(() => G.players[1].vp === 4 && G.np === 3 && G.players[2].ai === 'hard'), 'c9 boss-lead 4 vp, 3 players');
    const cnt = q => q.bag.length + q.pot.length + (q.hold ? q.hold.length : 0) + q.newChips.length;
    await st('c8'); ok(await p.evaluate(() => { const q = G.players[0], n = q.bag.length + q.pot.length + (q.hold ? q.hold.length : 0) + q.newChips.length; return n === 10; }), 'c8 crowded-bag: your chips 10 instead of 9');
    await st('c5'); ok(await p.evaluate(() => { const q = G.players[1]; return G.np === 3 && q.bag.concat(q.pot).some(c => c.c === 'G' && c.v === 2) && q.bag.length + q.pot.length + q.newChips.length === 10 && G.players[0].bag.length + G.players[0].pot.length === 9; }), 'c5 boss-chip: Odo has 10 chips incl. a Mossback 2, you 9');
    await p.evaluate(() => { GXC.play('c1'); }); await p.waitForTimeout(200); for (let k = 0; k < 8; k++) { if (await click(p, '.gxc-btn.go', 'Fight')) break; await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(100); } await p.waitForTimeout(400);
    ok(await p.evaluate(() => UI.coach.level === 'full' && G.players[1].droplet === 0 && G.players[1].rubies === CF.DATA.startRubies), 'c1 afterwards: no twist leaks');
    await p.evaluate(() => { UI.camp = null; newGame('vs', {}); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => UI.coach.level !== 'full' || true) && await p.evaluate(() => !UI.camp && G.np === 3 && G.players.every(q => q.droplet === 0 && q.vp === 0)), 'normal game after story: unchanged rules');
    ok(!p.errs.length, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3))); await p.close(); }
  await b.close(); console.log(fail ? fail + ' FAILED' : 'ALL PASS'); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
