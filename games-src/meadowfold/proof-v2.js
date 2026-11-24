// Layout v2 proof: tutorial + full game by real touch at machine speed, panels, screenshots, audit.
// node proof-v2.js <width> <height> <tag>   -> proof/<tag>-*.png, prints errors + audit issues
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const [W, H, TAG] = [+process.argv[2] || 402, +process.argv[3] || 874, process.argv[4] || '402'];
const OUT = path.join(__dirname, 'proof'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const touch = W < 700;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: touch, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = [], issues = new Set(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await p.waitForSelector('#tutB');
  const shot = async n => { await p.waitForTimeout(450); return p.screenshot({ path: `${OUT}/${TAG}-${n}.png` }); };
  const audit = () => p.evaluate(() => {
    const out = [], vw = innerWidth, vh = innerHeight;
    if (document.documentElement.scrollWidth > vw + 1) out.push('page scrolls sideways');
    document.querySelectorAll('button,.pocket,.htok,.acard,[data-gx]').forEach(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none' || e.closest('[hidden]')) return;
      if (e.closest('.pp:not(.on)') || e.closest('.gx-drawer:not(.on)')) return;
      const nm = (e.id || e.className || e.tagName).toString().slice(0, 24) + ':' + (e.textContent || '').trim().slice(0, 12);
      if ((r.right > vw + 1 || r.left < -1 || r.bottom > vh + 1) && !e.closest('.gx-drawer-body')) out.push('offscreen ' + nm);
      if (e.tagName === 'BUTTON' && (r.height < 43.5 || r.width < 43.5)) out.push('small ' + nm + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    });
    // text under 13px
    const seen = new Set();
    document.querySelectorAll('body *').forEach(e => {
      if (e.closest('svg') || e.closest('[hidden]') || e.closest('.pp:not(.on)') || e.closest('.gx-drawer:not(.on)') || !e.childNodes.length) return;
      const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) return;
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width < 1 || cs.visibility === 'hidden' || cs.display === 'none') return;
      const fs = parseFloat(cs.fontSize); if (fs < 12.9) { const k = (e.className || e.tagName) + ' ' + fs; if (!seen.has(k)) { seen.add(k); out.push('text ' + fs + 'px ' + k + ' "' + e.textContent.trim().slice(0, 14) + '"'); } }
    });
    // overlap of main-screen controls
    const els = [...document.querySelectorAll('#rail .rb,#barstat .pill,#central button,#endw:not([hidden]),#line')].filter(e => e.getBoundingClientRect().width > 0);
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i].getBoundingClientRect(), c = els[j].getBoundingClientRect(); if (a.left < c.right - 1 && a.right > c.left + 1 && a.top < c.bottom - 1 && a.bottom > c.top + 1 && !els[i].contains(els[j]) && !els[j].contains(els[i])) out.push('overlap ' + (els[i].id || els[i].className) + ' / ' + (els[j].id || els[j].className)); }
    return out;
  });
  const note = async tag => { await p.waitForTimeout(350); (await audit()).forEach(i => issues.add(tag + ' | ' + i)); };
  const tap = async s => { const el = typeof s === 'string' ? await p.$(s) : s; if (!el) return false; try { await el.tap({ timeout: 3000 }); } catch (e) { issues.add('tap failed ' + s + ' ' + e.message.split('\n')[0]); return false; } return true; };
  const fast = () => p.evaluate(() => { window.AIDELAY = 0; UI.fast = true; window.ANIM = false; });

  // ---- tutorial ----
  await tap('#tutB'); await fast(); let g = 0;
  while (g++ < 300) {
    if (g % 25 === 0) console.log('tut loop', g, await p.evaluate(() => JSON.stringify({ i: TUT && TUT.i, cur: G.cur, busy: UI.busy, pp: UI.pp, a: tutBubbleAnchor() })));
    const st = await p.evaluate(() => ({ over: G.over, mine: !G.seats[G.cur].ai && !UI.busy && G.cur === 0, ok: !!document.getElementById('tutok'), a: window.tutBubbleAnchor && tutBubbleAnchor(), pp: UI.pp, mode: UI.mode }));
    if (st.over || st.mode !== 'tut') break;
    if (st.ok) { await note('tutend'); await tap('#tutok'); break; }
    if (!st.mine) { await p.waitForTimeout(30); continue; }
    const sel = st.a && st.a.sel || '';
    if (/railRow|railMine/.test(sel)) { await tap(sel); await note('tut-panel'); if (g < 40) await shot('tut-panel-' + (/Row/.test(sel) ? 'animals' : 'mine')); continue; }
    if (/acard\[data-row/.test(sel)) { await tap(sel); await tap('#takeB'); continue; }
    if (/acard\.ready/.test(sel)) { await tap(sel); continue; }
    const pg = await p.$('.pocket.glow'); if (pg) { await tap(pg); continue; }
    const mg = await p.$$('#map .hx.glow'); if (mg.length) { if (!(await p.$('.htok.sel'))) await tap('.htok'); await tap(mg[0]); continue; }
    if (await tap('#endB')) continue;
    issues.add('STUCK in tutorial: ' + sel); break;
  }
  const tutDone = await p.evaluate(() => UI.mode);
  console.log('tutorial finished, loops', g, 'mode', tutDone);

  // ---- real game by touch, machine speed ----
  await p.evaluate(() => { showTitle(); }); await p.click('#goB'); await fast();
  await shot('1-main'); await note('main-start');
  let turns = 0, shots = false; const T0 = Date.now();
  while (Date.now() - T0 < 240000) {
    const st = await p.evaluate(() => ({ over: G.over, mine: !G.seats[G.cur].ai && !UI.busy && G.cur === 0, ai: G.seats[G.cur].ai }));
    if (st.over) break;
    if (!st.mine) { await p.waitForTimeout(20); continue; }
    const plan = await p.evaluate(() => AI.plan('normal')); turns++;
    for (const m of plan) {
      if (m.t === 'take') await tap(`.pocket[data-pocket="${m.i}"]`);
      else if (m.t === 'place') { await tap(`.htok[data-h="${m.h}"]`); await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'card') { if (!(await p.evaluate(() => UI.pp === 'dock' && UI.tab === 'row'))) await tap('#railRow'); await tap(`.acard[data-row="${m.i}"]`); await tap('#takeB'); }
      else if (m.t === 'cube') { if (!(await p.evaluate(() => UI.pp === 'dock' && UI.tab === 'mine'))) await tap('#railMine'); await tap(`#dock .acard[data-ci="${m.ci}"]`); await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'end') await tap('#endB');
    }
    if (turns % 6 === 0) await note('turn' + turns);
    if (turns === 6 && !shots) {
      shots = true;
      await p.evaluate(() => { UI.fast = false; }); await shot('2-mid');
      await tap('#railRow'); await shot('3-panel-animals'); await note('panel-animals');
      await tap('#railMine'); await shot('4-panel-mycards'); await note('panel-mine');
      await tap('#railScore'); await shot('5-panel-scoring'); await note('panel-scoring');
      // tap outside closes
      await p.mouse.click(W < 700 ? W / 2 : 150, W < 700 ? 235 : H / 2); await p.waitForTimeout(300);
      const closed = await p.evaluate(() => UI.pp === null); if (!closed) issues.add('tap outside did not close panel');
      await tap('#railRow'); await tap('.pp.on .ppx'); await p.waitForTimeout(300);
      if (!(await p.evaluate(() => UI.pp === null))) issues.add('X did not close panel');
      await tap('[data-gx="rulesd"]'); await p.waitForTimeout(400); await shot('6-panel-rules'); await note('panel-rules');
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await tap('#railTot'); await p.waitForTimeout(400); await shot('7-panel-totals'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await p.evaluate(() => { UI.fast = true; });
    }
  }
  await p.waitForFunction(() => G.over, null, { timeout: 30000 }).catch(() => issues.add('game never ended'));
  await p.evaluate(() => { UI.fast = false; }); await p.waitForTimeout(900); await shot('8-result'); await note('result');
  console.log(TAG, 'over', await p.evaluate(() => G.over), 'turns', turns, 'JS errors', JSON.stringify(errs));
  console.log([...issues].slice(0, 40).join('\n') || 'no audit issues');
  await b.close();
})();
