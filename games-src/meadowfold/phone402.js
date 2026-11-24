// Full game by touch at 402x874 (iPhone 17): guided tutorial, then a real game to the result.
// Checks tap targets, clipping, sideways scroll, stuck screens.
// node phone402.js [--video]  -> proof/full-game-402x874.webm + proof/402-{1-start,2-mid,3-result}.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'proof'); fs.mkdirSync(OUT, { recursive: true });
const VIDEO = process.argv.includes('--video'), wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: VIDEO ? 1 : 2,
    ...(VIDEO ? { recordVideo: { dir: OUT, size: { width: 402, height: 874 } } } : {}) });
  const p = await ctx.newPage(); const errs = [], issues = new Set(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await wait(1500);
  await p.screenshot({ path: OUT + '/402-1-start.png' });
  const audit = () => p.evaluate(() => {
    const out = [], vw = innerWidth;
    if (document.documentElement.scrollWidth > vw + 1) out.push('page scrolls sideways');
    document.querySelectorAll('button,.pocket,.htok,.acard,[data-gx]').forEach(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') return;
      if (e.closest('[hidden]')) return;
      const nm = (e.id || e.className || e.tagName).toString().slice(0, 30) + ':' + (e.textContent || '').trim().slice(0, 14);
      if (r.right > vw + 1 || r.left < -1) out.push('offscreen-x ' + nm);
      if ((r.height < 44 || r.width < 44) && e.tagName === 'BUTTON') out.push('small ' + nm + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      if (e.scrollWidth > e.clientWidth + 2 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && cs.overflowX !== 'visible') out.push('clipped ' + nm);
    });
    return out;
  });
  const tap = async s => { const el = typeof s === 'string' ? await p.$(s) : s; if (!el) return false; await el.scrollIntoViewIfNeeded().catch(() => { }); await el.tap(); await wait(700); return true; };
  const note = async tag => { (await audit()).forEach(i => issues.add(tag + ' | ' + i)); };
  await tap('#tutB'); await wait(1000); await note('tut0');
  let guard = 0;
  while (guard++ < 400) {
    const st = await p.evaluate(() => ({ over: G.over, mine: !G.seats[G.cur].ai && !UI.busy && G.cur === 0, tut: UI.mode === 'tut' && !!document.getElementById('tutok') }));
    if (st.over) break;
    if (st.tut) { await note('tutend'); await tap('#tutok'); break; }
    if (!st.mine) { await wait(300); continue; }
    const g = await p.$('.pocket.glow'); if (g) { await tap(g); await note('tutpocket'); continue; }
    const mg = await p.$$('#map .hx.glow'); if (mg.length) { if (!(await p.$('.htok.sel,.htok.on'))) await tap('.htok'); await tap(mg[0]); continue; }
    if (await tap('.acard.ready')) { await tap('#map .hx.glow'); continue; }
    if (await tap('.acard[data-row="0"]')) { await tap('#takeB'); continue; }
    if (await tap('#endB')) continue;
    issues.add('STUCK in tutorial: ' + await p.evaluate(() => document.getElementById('line').innerText)); break;
  }
  console.log('tutorial done, loops', guard);
  const T0 = Date.now(); let turns = 0, shotMid = false;
  while (Date.now() - T0 < 600000) {
    const st = await p.evaluate(() => ({ over: G.over, mine: !G.seats[G.cur].ai && !UI.busy && G.cur === 0 }));
    if (st.over) break;
    if (!st.mine) { await wait(350); continue; }
    const plan = await p.evaluate(() => AI.plan('normal')); turns++;
    for (const m of plan) {
      if (m.t === 'take') await tap(`.pocket[data-pocket="${m.i}"]`);
      else if (m.t === 'place') { await tap(`.htok[data-h="${m.h}"]`); await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'card') { await p.evaluate(() => { UI.tab = 'row'; render(); }); await tap(`.acard[data-row="${m.i}"]`); await tap('#takeB'); }
      else if (m.t === 'cube') { await p.evaluate(() => { UI.tab = 'mine'; render(); }); await tap(`.acard[data-ci="${m.ci}"]`); await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'end') await tap('#endB');
      await note('turn' + turns);
    }
    if (!shotMid && turns >= 5) { await p.screenshot({ path: OUT + '/402-2-mid.png' }); shotMid = true; }
  }
  await p.waitForFunction(() => G.over, null, { timeout: 60000 }).catch(() => issues.add('game never ended'));
  await wait(1500); await p.screenshot({ path: OUT + '/402-3-result.png' }); await note('result');
  console.log('over', await p.evaluate(() => G.over), 'turns', turns, 'errors', errs);
  console.log([...issues].slice(0, 40).join('\n'));
  const vid = p.video(); await ctx.close(); if (VIDEO) fs.renameSync(await vid.path(), OUT + '/full-game-402x874.webm'); await b.close();
})();
