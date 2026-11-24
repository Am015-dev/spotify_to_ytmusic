// Vale of Banners scenario lessons (src/lessons.js) test, pattern of shell/gxst-test.js; machine speed (scripts/turbo.js).
//   node games-src/vale-of-banners/tools/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: picker lists every lesson; every lesson fails on a wrong move with a message and Retry restarts it, then is solved by its scripted
// solution with real taps (3 stars, no hint); the player can tap anything (stalls, storage, dice, buttons never under the lesson card; Rules
// opens mid-lesson); hint nudge then show ring; minimise/drag/close/reopen; progress saved; 0 JS errors.
// Contact sheet of every lesson start per size: games-src/vale-of-banners/proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path'); const { turbo, budget, tick } = require('../../scripts/turbo');
const html = fs.readFileSync(path.join(__dirname, '..', 'vale-of-banners.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [];
const B = '#tv .acts .btn:not(.alt)', MK = { tab: 'market' }, ES = { tab: 'estate' };
// taps per lesson: strings are selectors, {tab} switches the phone tab (skipped when there are no tabs), 'game:ai' / 'game:dumb' play the whole season
const SOLVE = {
  take: { wrong: [MK, '#mt-2-0', B], right: [MK, '#mt-4-0', B] },
  build: { wrong: ['#wk0', '#wk1'], right: ['#st-0', '#ec-11'] },
  region: { wrong: ['#st-1', '#ec-11'], right: ['#st-0', '#ec-12'] },
  pasture: { wrong: ['#st-0', '#ec-7'], right: ['#st-1', '#ec-7'] },
  sell: { wrong: ['#gd-1', B], right: ['#gd-3', B] },
  bend: { wrong: [MK, '#mt-3-0', B], right: [MK, '#mt-1-0', B] },
  lane: { wrong: ['#wk0'], right: [MK, '#bl-0', B] },
  hall: { wrong: ['#wk0', '#wk1'], right: ['#st-0', '#ec-11', '#st-0', '#ec-12'] },
  barge: { wrong: ['#wk0', '#wk1'], right: ['#st-0', '#ec-4', MK, '#gs-3'] },
  game: { wrong: ['game:dumb'], right: ['game:ai'] }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const where = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && e.offsetParent; }); if (!e) return null; e.scrollIntoView && e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e)), by: u && (u.id || u.className) }; }, sel);
  const tapSel = async sel => {   // the lesson card re-places itself when its text changes: tap only once the target has stopped moving and is reachable
    let pt = await where(sel);
    for (let k = 0; k < 6 && !pt; k++) { await tick(p, 400); pt = await where(sel); }   // a tab or dialog may still be opening
    if (!pt && /^#(gs|mt|bl)-/.test(sel) && phone) { await tapSel('#tab-market'); pt = await where(sel); }   // a player whose market view closed taps the Market tab
    for (let k = 0; k < 10 && pt; k++) { await tick(p, 300); const q = await where(sel); if (!q) { pt = q; break; } const still = Math.abs(q.x - pt.x) < 1 && Math.abs(q.y - pt.y) < 1; pt = q; if (still && pt.ok) break; }
    if (!pt) { await dbgSel(sel); note('nothing to tap: ' + sel); return false; } if (!pt.ok) note('something covers ' + sel + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 400); return true;
  };
  const dbgSel = async sel => process.env.DBG && console.log('SEL', JSON.stringify(await p.evaluate(() => ({ tab: UI.tab, busy: UI.busy, pend: G.pend.length, sel: [...document.querySelectorAll('.tab')].map(t => t.id + ':' + t.getAttribute('aria-selected')) }))), sel, JSON.stringify(await p.evaluate(sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), !!e.offsetParent, e.className]; }), sel)));
  const myTurn = () => p.waitForFunction(() => G && !G.over && isHuman(VB.actor(G)) && !UI.busy, null, { timeout: 5000 }).then(() => true, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(async ok => { await tick(p, 1500); return ok; }, () => false);   // the card re-places itself within 250 ms of a change: let it settle like a human would
  const step = async s => {
    if (typeof s === 'object') { const has = await p.$('#tab-' + s.tab); for (let k = 0; k < 3 && has && await has.isVisible() && (await has.getAttribute('aria-selected')) !== 'true'; k++) await tapSel('#tab-' + s.tab); return; }
    if (s.startsWith('game:')) {
      for (let n = 0; n < 60; n++) {
        if (!(await myTurn())) break;
        await p.evaluate(m => { const mv = VB.validMoves(G); let x = m === 'ai' ? VB.aiMove(G) : (mv.find(q => q.k === 'workers') || mv.find(q => q.k === 'end')); if (x) doMove(x); }, s.slice(5));
        await tick(p, 300);
      } return;
    }
    return tapSel(s);
  };
  const play = async (steps) => { for (const s of steps) { if (!(typeof s === 'string' && s.startsWith('game:'))) await myTurn(); await step(s); } };
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n !== Object.keys(SOLVE).length) note('picker shows ' + n + ' of ' + s.count + ' lessons, test knows ' + Object.keys(SOLVE).length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], tl = Date.now();
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 1500);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    if (!(await p.$('.gxst-card'))) note(id + ': no objective card');
    if (i === 0) {   // tap anything: stalls/storage/dice/buttons are uncovered, Rules opens mid-lesson; hint nudge then show ring
      const covered = await p.evaluate(() => [...document.querySelectorAll('#mk .tilebtn, #store .tilebtn, #dicerow .die, #acts button, #goods button')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || !e.offsetParent) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest && u.closest('.gxst-card'); }).length);
      if (covered) note(covered + ' board items under the lesson card');
      await tapSel('[data-gx="rulesd"]'); await tick(p, 400);
      const opened = await p.evaluate(() => document.querySelector('[data-gx="rulesd"]').getAttribute('aria-expanded') === 'true' || !!document.querySelector('.gx-drawer[open], .gx-drawer.open, .drawer.open'));
      if (!opened) note('non-lesson tap (Rules) did nothing');
      await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await tick(p, 300);
      if (phone) { if (!(await p.$('.gxst-chip'))) note('phone lesson does not start as a chip'); await tapSel('.gxst-chip'); }
      await tapSel('.gxst-bulb'); await tapSel('.gxst-bulb'); await tick(p, 600); s = await st();
      if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 400);
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-vale-of-banners') || '{}'); b.best = {}; localStorage.setItem('gxst-vale-of-banners', JSON.stringify(b)); });
    }
    await play(SOLVE[id].wrong);   // wrong move -> fail with a message, Retry restarts it
    if (!(await phase('fail', 14000))) { note(id + ': a wrong move did not fail'); if (process.env.DBG) console.log('STATE', JSON.stringify(await p.evaluate(() => ({ over: G.over, ph: G.phase, rd: G.round, vp: G.P.map(x => x.vp), mode: UI.mode, busy: UI.busy, actor: VB.actor(G), pend: G.pend })))); await p.evaluate(() => GXST.retry()); }
    else {
      s = await st(); if (!/\w{4}/.test(s.msg || '') || !/\S/.test(await p.textContent('.gxst-msg'))) note(id + ': fail has no message');
      if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
      if (process.env.DBG) console.log('before retry', JSON.stringify(await st()).slice(0, 300), JSON.stringify(await where('.gxst-ft .pri')));
      for (let k = 0; k < 4 && (await st()).phase === 'fail'; k++) await tapSel('.gxst-ft .pri');   // the card moves once when the board changes tab: a player taps again
      if (process.env.DBG) console.log('after retry', JSON.stringify(await st()).slice(0, 300));
    }
    await live(id).catch(() => note(id + ': Retry did not restart')); await tick(p, 1500);
    await play(SOLVE[id].right);   // the scripted solution wins with 3 stars
    if (!(await phase('win', 16000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (s.stars !== 3 && id !== 'game') note(id + ': clean solve gave ' + s.stars + ' stars'); }
    if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
    if (process.env.DBG) console.log('  lesson', id, ((Date.now() - tl) / 1000).toFixed(1) + 's');
  }
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tapSel('.gxst-hd .gxst-ib[aria-label="Minimise"]'); await tick(p, 1500); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tapSel('.gxst-chip'); await tick(p, 1500); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await tick(p, 300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-vale-of-banners')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  await tick(p, 1500); await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tapSel('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  const cols = phone ? 5 : 3, cw = phone ? 250 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const stop = budget(120000, 'vale lessons test');
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
