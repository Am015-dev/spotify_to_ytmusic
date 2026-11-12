// Newcomer by real touch (R29 reviewer method): Play -> Start the expedition (default: 1 rival, easy). Each turn tap a random glowing
// site / hand card / market card / the research track, then its button; answer choosers with their first glowing choice; Pass when
// nothing glows, and at random 8% of the time after turn 3. Every tap is page.touchscreen.tap at an element centre; the element there
// must be the target (else a dead tap). Also counts toasts shown on my turn that overlap a tappable control.
// node newcomer-touch.js [games=6] [WxH=390x844]   (python3 build.py first). Prints one line per game and a summary.
const { chromium } = require('playwright'), serve = require('./serve.js');
const N = +(process.argv[2] || 6), [W, H] = (process.argv[3] || '390x844').split('x').map(Number);
(async () => {
  const S = await serve(), b = await chromium.launch(); let wins = 0, dead = 0, errsAll = 0, toastHits = 0; const rows = [];
  for (let g = 0; g < N; g++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    let rs = 9001 + g * 7919; const R = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
    const tapSel = async (sel, nth) => {
      const r = await p.evaluate(([s, n]) => { const e = [...document.querySelectorAll(s)].filter(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0; })[n || 0]; if (!e) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, top = document.elementFromPoint(x, y); return { x, y, ok: !!top && (top === e || e.contains(top)), on: top ? (top.id || top.className || top.tagName) : '' }; }, [sel, nth]);
      if (!r) return false; if (!r.ok) { dead++; console.log('  dead tap', sel, 'hit', r.on); return false; }
      await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(350); return true;
    };
    const toastCheck = () => p.evaluate(() => { const t = document.querySelector('#toast'); if (!t || !t.classList.contains('on') || getComputedStyle(t).display === 'none' || !myTurn()) return 0; const a = t.getBoundingClientRect(); return [...document.querySelectorAll('.site.glow,.cd.glow,#track.glow,.pawn.glow,#passbtn,#gobtn')].some(e => { const q = e.getBoundingClientRect(); return q.width && !(q.right < a.left || q.left > a.right || q.bottom < a.top || q.top > a.bottom); }) ? 1 : 0; });
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await tapSel('#start .tbtn');
    await p.waitForSelector('#goal .tbtn', { timeout: 8000 }); await tapSel('#goal .tbtn');
    const t0 = Date.now(); let turns = 0, acts = 0;
    for (let k = 0; k < 700 && Date.now() - t0 < 400000; k++) {
      await p.waitForFunction(() => (window.G && myTurn()) || G.phase === 'over' || !document.querySelector('#fx').hidden, null, { timeout: 60000 }).catch(() => { });
      if (await p.evaluate(() => G.phase === 'over')) break;
      if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { await tapSel('#fx .fxcard'); continue; }
      if (!(await p.evaluate(() => myTurn()))) continue;
      toastHits += await toastCheck();
      if (await p.locator('#qbox:not([hidden]) .btn').count()) {   /* a chooser: its first glowing / go choice, else the last button (Skip) */
        if (!(await tapSel('#qbox .cd.glow')) && !(await tapSel('#qbox .btn.go:not([disabled])'))) await tapSel('#qbox .btn:not([disabled])', 0); continue;
      }
      if (await p.evaluate(() => !!(G.q && myTurn()))) { if (!(await tapSel('.site.glow')) && !(await tapSel('#row .cd.glow'))) await tapSel('#qbox .btn'); continue; }
      const T0 = await p.evaluate(() => G.turns || 0);
      const els = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].flatMap(s => [...document.querySelectorAll(s)].map((e, i) => [s, i])));
      turns++;
      if (!els.length || (turns > 3 && R() < 0.08)) { await tapSel('#passbtn'); await p.waitForTimeout(400); continue; }
      const [s, i] = els[Math.floor(R() * els.length)];
      if (!(await tapSel(s, i))) continue;
      if (await p.locator('#gobtn').count()) await tapSel('#gobtn');
      else if (await p.locator('#qbox:not([hidden]) .btn.go').count()) await tapSel('#qbox .btn.go');
      await p.waitForTimeout(300); if ((await p.evaluate(() => G.turns || 0)) > T0) acts++;
    }
    const sc = await p.evaluate(() => G.p.map((x, i) => VG.score(G, i).total).concat([G.phase]));
    const won = sc[0] > sc[1]; if (won) wins++; errsAll += errs.length;
    const line = `game ${g + 1} ${W}x${H}: you ${sc[0]} - rival ${sc[1]} ${won ? 'WIN' : sc[0] === sc[1] ? 'TIE' : 'loss'} (${sc[2]}, ${acts} actions, ${Math.round((Date.now() - t0) / 1000)} s)${errs.length ? ' ERR ' + errs[0] : ''}`;
    console.log(line); rows.push(sc);
    if (g === 0) await p.screenshot({ path: '/tmp/claude-0/sh/nc-' + W + '.png' });
    await ctx.close();
  }
  const avg = k => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(1);
  console.log(`SUMMARY ${W}x${H}: newcomer won ${wins}/${N}, avg you ${avg(0)} rival ${avg(1)}, dead taps ${dead}, toast over controls on my turn ${toastHits}, page errors ${errsAll}`);
  await b.close(); S.close();
})();
