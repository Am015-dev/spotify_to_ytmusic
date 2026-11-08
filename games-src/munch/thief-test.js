// Thief "Let it be" test: you play a Thief in full games vs the computer (touch, phone sizes). Every time a rival fights and the game asks you
// (backstab or let it be), the test taps "Let it be" in the action bar, as a player would, and checks the game moves on within 3 s. Then the game
// is played to the end. Fails on a tap that does nothing, a missing "Let it be" button, a stuck game, or a page error.
//   NODE_PATH=/opt/node-tools/node_modules node thief-test.js [games=3] [sizes=390x844,375x667]
const { chromium } = require('playwright');
const gx = require('../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = +process.argv[2] || 3, SIZES = (process.argv[3] || '390x844,375x667').split(',').map(s => s.split('x').map(Number));
const probs = []; let asks = 0, games = 0;
(async () => {
  const URL = await gx.url('doorkick-dungeon', { file: __dirname + '/doorkick.html' });
  const b = await chromium.launch();
  for (const [W, H] of SIZES) for (let g = 0; g < N; g++) {
    const tag = W + 'x' + H + ' g' + g;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true }); const page = await ctx.newPage();
    page.on('pageerror', e => probs.push(tag + ' page error: ' + e.message));
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('dkd_offer', '1'); localStorage.setItem('dkd_goal', '1') }); await page.reload(); await sleep(500);
    await page.evaluate(s => { setSeed(s); UI.n = 4; ANIM = 0; AIDELAY = 0; if (!document.querySelector('#modal [data-start="F"]')) { UI.quick = true; render() } }, 300 + g * 17 + W);
    await page.click('#modal [data-start="F"]'); await sleep(400);
    // make seat 0 a Thief (the class card from the deck, so the engine treats it like a played class)
    await page.evaluate(() => { const id = CARDS.findIndex(c => c.k === 'thief'); for (const a of [G.dd, ...G.pl.map(p => p.hand)]) { const i = a.indexOf(id); if (i >= 0) a.splice(i, 1) } P(0).cls = [id]; render() });
    let t0 = Date.now(), lastSig = '', lastAt = Date.now();
    for (let i = 0; i < 8000; i++) {
      const st = await page.evaluate(() => { if (G.winner) return { win: 1 }; const s = sideToAct(); const vm = s === 0 ? validMoves(0) : [];
        return { s, sig: G.ln + '|' + G.turn + '|' + G.phase + '|' + (G.q && G.q.kind) + '|' + (G.cb && G.cb.stage), ask: s === 0 && !!G.cb && G.cb.who !== 0 && G.cb.help !== 0 && vm.some(m => m.act === 'backstab') && vm.some(m => m.act === 'pass') } });
      if (st.win) { games++; break }
      if (st.sig !== lastSig) { lastSig = st.sig; lastAt = Date.now() } else if (Date.now() - lastAt > 8000) { probs.push(tag + ' stuck 8 s at ' + st.sig); break }
      if (Date.now() - t0 > 4 * 60000) { probs.push(tag + ' game ran over 4 min'); break }
      if (st.ask) {
        asks++;
        await page.evaluate(() => { try { GXH.hide() } catch (e) { } if (GX.open) GX.close(); render() }); await sleep(120);
        const c = await page.evaluate(() => { const e = [...document.querySelectorAll('.gx-dock [data-mv]')].find(b => { try { return JSON.parse(b.dataset.mv).act === 'pass' } catch (x) { return false } }); if (!e) return null; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: e.textContent.trim(), top: !!t && (t === e || e.contains(t)) } });
        if (!c) { probs.push(tag + ' no "Let it be" button (' + st.sig + ')'); break }
        if (!c.top) probs.push(tag + ' "Let it be" covered (' + st.sig + ')');
        await page.touchscreen.tap(c.x, c.y);
        let moved = false; for (let k = 0; k < 30 && !moved; k++) { await sleep(100); moved = await page.evaluate(sig => (G.winner ? true : (G.ln + '|' + G.turn + '|' + G.phase + '|' + (G.q && G.q.kind) + '|' + (G.cb && G.cb.stage)) !== sig || sideToAct() !== 0), st.sig) }
        if (!moved) { probs.push(tag + ' tapping "' + c.label + '" did nothing (' + st.sig + ')'); break }
        continue;
      }
      if (st.s == null || st.s < 0) { await sleep(30); continue }
      await page.evaluate(s => { const m = s === 0 ? ((coach(0) || {}).rec || aiMove(0)) : aiMove(s); if (!m) return; let x = performMove(m, s); if (!x.success) { const vm = validMoves(s); performMove(vm.find(v => v.act === 'end' || v.act === 'pass') || vm[0], s) } render() }, st.s);
    }
    await ctx.close();
  }
  await b.close();
  console.log('thief-test: ' + games + '/' + N * SIZES.length + ' games ended, ' + asks + ' "Let it be" taps, ' + probs.length + ' problems');
  for (const p of probs.slice(0, 30)) console.log('  ' + p);
  process.exit(probs.length || games < N * SIZES.length || !asks ? 1 : 0);
})();
