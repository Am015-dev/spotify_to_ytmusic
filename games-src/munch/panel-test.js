// Card-panel test: plays full games vs the computer (touch, phone sizes, tips on). At every one of your decisions it taps an equipped item chip,
// which opens the card panel, then checks: the panel is open; the × is >= 44 px and closes it; tapping outside closes it; Back (Escape) closes it;
// the panel never covers the action bar's End turn / main button; after closing, the game goes on. Then the game is played on to the end.
//   NODE_PATH=/opt/node-tools/node_modules node panel-test.js [games=4] [sizes=390x844,375x667]      Exit 1 on any problem.
const { chromium } = require('playwright');
const gx = require('../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = +process.argv[2] || 4, SIZES = (process.argv[3] || '390x844,375x667').split(',').map(s => s.split('x').map(Number));
const probs = []; let checks = 0, games = 0;
(async () => {
  const URL = await gx.url('doorkick-dungeon', { file: __dirname + '/doorkick.html' });
  const b = await chromium.launch();
  for (const [W, H] of SIZES) for (let g = 0; g < N; g++) {
    const tag = W + 'x' + H + ' g' + g;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true }); const page = await ctx.newPage();
    page.on('pageerror', e => probs.push(tag + ' page error: ' + e.message));
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('dkd_offer', '1'); localStorage.setItem('dkd_goal', '1') }); await page.reload(); await sleep(500);
    await page.evaluate(s => { setSeed(s); UI.n = 4; ANIM = 0; AIDELAY = 0; if (!document.querySelector('#modal [data-start="F"]')) { UI.quick = true; render() } }, 900 + g * 13 + W);
    await page.click('#modal [data-start="F"]'); await sleep(400);
    await page.evaluate(() => { GXH.setEnabled(true); render() });
    const tap = async (x, y) => { await page.touchscreen.tap(x, y); await sleep(260) };
    const ctr = sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height] : null }, sel);
    const open = () => page.evaluate(() => GX.open);
    const chipSel = async () => page.evaluate(() => { const c = [...document.querySelectorAll('.mine .gear .gchip[data-card]')].find(e => P(0).eq.some(x => x.id === +e.dataset.card)); if (!c) return null; c.scrollIntoView({ block: 'nearest', inline: 'center' }); return '.mine .gear .gchip[data-card="' + c.dataset.card + '"]' });
    let n = 0, t0 = Date.now(), seen = new Set();
    for (let i = 0; i < 6000; i++) {
      const st = await page.evaluate(() => { if (G.winner) return { win: G.winner }; const s = sideToAct(); return { s, sig: G.turn + '|' + G.phase + '|' + (G.q && G.q.kind) + '|' + (G.cb && G.cb.stage), eq: P(0).eq.length } });
      if (st.win) { games++; break }
      if (Date.now() - t0 > 4 * 60000) { probs.push(tag + ' game ran over 4 min'); break }
      if (st.s === 0 && st.eq && !seen.has(st.sig) && n < 25) {
        seen.add(st.sig); n++;
        await page.evaluate(() => { try { GXH.hide() } catch (e) { } const r = document.getElementById('bfrev'); if (r) r.remove(); BF.kicking = false });
        await sleep(150);
        const sel = await chipSel();
        if (sel) {
          const c = await ctr(sel);
          if (c) {
            const how = ['x', 'outside', 'back'][n % 3];
            await tap(c[0], c[1]);
            if (await open() === 'dkCard') {
              checks++;
              const x = await ctr('#dkCard .gx-x'); if (!x || x[2] < 44 || x[3] < 44) probs.push(tag + ' × smaller than 44px (' + (x && x.slice(2)) + ')');
              const cov = await page.evaluate(() => { const d = document.getElementById('dkCard').getBoundingClientRect(); const bs = [...document.querySelectorAll(".gx-dock .acts.main button")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 3 }); return bs.filter(e => { const r = e.getBoundingClientRect(); const y = r.top + r.height / 2; return y > d.top && y < d.bottom && r.left + r.width / 2 > d.left && r.left + r.width / 2 < d.right }).map(e => e.textContent.trim().slice(0, 14)) });
              if (cov.length) probs.push(tag + ' panel covers ' + cov.join(', ') + ' (' + st.sig + ')');
              if (how === 'x' && x) await tap(x[0], x[1]);
              else if (how === 'outside') { const d = await page.evaluate(() => { const r = document.getElementById('dkCard').getBoundingClientRect(); return [r.left, r.top, r.right] }); await tap(Math.round(W / 2), Math.max(60, Math.round(d[1] / 2))) }
              else await page.keyboard.press('Escape');
              await sleep(200);
              if (await open()) probs.push(tag + ' panel did not close by ' + how + ' (' + st.sig + ')');
              await page.evaluate(() => { if (GX.open) GX.close() });
            }
          }
        }
      }
      if (st.s === -1 || st.s == null) { await sleep(30); continue }
      const r = await page.evaluate(s => { const m = s === 0 ? ((coach(0) || {}).rec || aiMove(0)) : aiMove(s); if (!m) return 'none'; let x = performMove(m, s); if (!x.success) { const vm = validMoves(s); x = performMove(vm.find(v => v.act === 'end') || vm[0], s) } render(); return x.success ? 'ok' : 'fail' }, st.s);
      if (r !== 'ok') { await sleep(30) }
    }
    await ctx.close();
  }
  await b.close();
  console.log('panel-test: ' + games + '/' + N * SIZES.length + ' games ended, ' + checks + ' panel checks, ' + probs.length + ' problems');
  for (const p of probs.slice(0, 40)) console.log('  ' + p);
  process.exit(probs.length || games < N * SIZES.length ? 1 : 0);
})();
