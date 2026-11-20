// F2 probe: plays one dive per size by the AI's suggested moves, screenshots + measures (tap targets, text size, pop-up edges, scroll, dead area)
//   node probe-f2.js [file] -> proof/shots-f2/*.png and a line per size
const { chromium } = require('playwright'); const path = require('path'); const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || '/tmp/x/lantern-dive/index.html'), OUT = path.join(__dirname, '..', 'proof', 'shots-f2');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEAS = () => {
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || x.hidden) return false; } return r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight; };
  const small = [], tiny = [];
  for (const e of document.querySelectorAll('#bd button,#bd .dc,#hand .hc,#acts button,#opp .seat,#opp .dc')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if ((e.matches('.dc,.hc,.seat,#acts button') ) && (r.width < 44 || r.height < 44)) small.push(e.className + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  for (const e of document.querySelectorAll('body *')) { if (!e.firstChild || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; if (!vis(e)) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 12) tiny.push(e.className + ':' + fs + ':' + e.textContent.trim().slice(0, 14)); }
  const fl = [...document.querySelectorAll('.fl')].map(e => Math.round(e.getBoundingClientRect().left));
  return { small: [...new Set(small)].slice(0, 6), tiny: [...new Set(tiny)].slice(0, 8), docScroll: document.documentElement.scrollHeight - innerHeight, bodyScroll: document.body.scrollHeight - innerHeight, fl };
};
(async () => {
  const URL = await gx.url('lantern-dive', { file: FILE }); const b = await chromium.launch();
  for (const [W, H, touch, np] of [[375, 667, 1, 4], [375, 553, 1, 2], [910, 512, 0, 4], [1366, 768, 0, 4], [1920, 1080, 0, 4]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: !!touch, hasTouch: !!touch, deviceScaleFactor: 1 }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const t = W + 'x' + H; await p.goto(URL); await sleep(1800); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(1500);
    await p.evaluate(() => { try { showStart(); } catch (e) { } }); await sleep(400); await p.screenshot({ path: path.join(OUT, t + '-title.png') });
    await p.evaluate(np => { try { GX.close(); } catch (e) { } AIDELAY = 300; UI.seed = 6; newGame('vs', { np, mission: 5, kind: 'log', level: 'normal' }); }, np); await sleep(1500);
    global.__l = -99; const ms = []; let shot = 0, over = false;
    for (let i = 0; i < 400; i++) {
      await sleep(250);
      const st = await p.evaluate(() => { const ok = document.querySelector('#dlg button, #rstep button, .gxh-bub.on .gxh-ok'); if (ok) { ok.click(); return 'dlg'; } const rd = document.querySelector('#acts [data-a="ready"]'); if (rd && !UI.busy) { rd.click(); return 'rdy'; } if (G.phase === 'over') return 'over'; if (UI.started && !UI.busy && iMustAct()) { const m = LD.AI.choose(G, viewSeat(), 'normal'); if (m) doMove(m); return 'mv' + G.phase; } return 'w'; });
      if (st === 'mvplay' && shot < 2 && i - (global.__l || -99) >= 12 && (global.__l = i, true)) { await p.screenshot({ path: path.join(OUT, t + '-play' + shot++ + '.png') }); }
      if (i % 4 === 0) ms.push(await p.evaluate(MEAS));
      if (st === 'over') { over = true; await sleep(1500); await p.screenshot({ path: path.join(OUT, t + '-result.png') }); break; }
    }
    const agg = k => [...new Set(ms.flatMap(m => m[k]))].slice(0, 8);
    console.log(t, 'over=' + over, 'errs=' + errs.length, 'small=' + JSON.stringify(agg('small')), 'tiny=' + JSON.stringify(agg('tiny')), 'docScroll=' + Math.max(...ms.map(m => m.docScroll)), 'fl=' + JSON.stringify([...new Set(ms.flatMap(m => m.fl))]));
    await ctx.close();
  }
  await b.close(); gx.close && gx.close();
})();
