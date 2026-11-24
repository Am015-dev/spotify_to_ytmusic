// Cauldron Fair scenario lessons (lessons.js) test, pattern of shell/gxst-test.js, at machine speed (scripts/turbo.js).
//   node games-src/cauldron-fair/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem. ONLY=walk,limit filters lessons.
// Asserts: picker lists every lesson; every lesson fails on a wrong move with a message and Retry restarts it, then is solved by its scripted solution with real
// taps (3 stars, no hint); the player can tap anything (draw / stop / flask / report buttons never under the lesson card; Rules opens mid-lesson); hint nudge then
// show ring; minimise / drag / close / reopen; progress saved; 0 JS errors. Contact sheet of every lesson start: games-src/cauldron-fair/proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path');
const { turbo, tick, budget } = require('../scripts/turbo.js');
const html = fs.readFileSync(path.join(__dirname, 'wildmark.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = []; const dbg = m => { if (process.env.DBG) console.log(((Date.now() - T0) / 1000).toFixed(1) + 's ' + m); }; const T0 = Date.now();
const col = i => ({ c: '#mk .mt[data-i="' + i + '"]' }), spot = c => ({ c: c ? '#map .spot[data-c="' + c + '"]' : '#map .spot' }), ok = { c: '#okB' }, at = c => ({ c: '#map .hx.tgt[data-c="' + c + '"]' }), skip = { c: '#backB' };
const turn = (i, tc, c) => [col(i), spot(tc), ok, c ? at(c) : skip];
const SOLVE = {
  pair: { wrong: turn(0), right: turn(2, null, '1,0') },
  key: { wrong: turn(1, null, '0,0'), right: turn(1, null, '1,0') },
  acorn: { wrong: [col(0), spot(), ok, skip], right: [{ c: '#acornB' }, { c: '#freeB' }, col(0), { c: '#mk .mk[data-i="1"]' }, spot(), ok, { c: '#map .hx.tgt' }] },
  sweep: { wrong: turn(3), right: [{ c: '#w3B' }] },
  land: { wrong: turn(1, null, '1,0'), right: turn(0, '1,0', '1,0') },
  bear: { wrong: turn(0, null, '2,0'), right: turn(0, null, '3,2') },
  hawk: { wrong: turn(0, null, '1,0'), right: turn(0, null, '0,3') },
  fox: { wrong: turn(2, null, '2,0'), right: turn(2, null, '0,0') }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { probs.push(tag + ': ' + m); dbg('NOTE ' + m); }, shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await turbo(ctx);
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/' + (phone ? '?phone=1' : ''));
  await p.waitForFunction(() => window.GXST && GXST.state(), null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); GXST.picker(); });
  const st = () => p.evaluate(() => GXST.state());
  // tap a real element: find it, check nothing covers its centre (the player can tap anything), then a real touch tap
  const tapStep = async s => {
    await p.waitForTimeout(260);   // 260 ms apart so two taps are never read as a double-tap; measure after the wait (the card may have moved)
    const pt = await p.evaluate(s => {
      let e = null;
      if (s.c) { const l = [...document.querySelectorAll(s.c)].filter(x => x.getBoundingClientRect().width > 3), okc = x => { const r = x.getBoundingClientRect(), u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!u && (u === x || x.contains(u)); }; e = l.find(okc) || l[0]; } else e = [...document.querySelectorAll(s.t)].find(x => s.re.test(x.textContent));
      if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 3) return null;
      const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)), u: u && (u.className || u.tagName) };
    }, s);
    if (!pt) return false; if (!pt.ok) note('something covers ' + JSON.stringify(s.c || s.t) + ' : ' + pt.u);
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 500); return true;
  };
  const waitFor = (fn, ms) => p.waitForFunction(fn, null, { timeout: ms || 12000, polling: 30 }).then(() => true, () => false);
  const myTurn = () => waitFor(() => !!window.G && !UI.aiRun && !!document.querySelector('#mk .mt'));
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  const play = async (id, steps) => {
    for (const s of steps) { await myTurn(); await tapStep(s); }
  };
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n !== Object.keys(SOLVE).length) note('picker shows ' + n + ' of ' + s.count + ' lessons, test knows ' + Object.keys(SOLVE).length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]; dbg('lesson ' + id);
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 1500); if (i === 0) { await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 1500); }   // the very first board paint can lag under turbo timers: start once more
    await myTurn();
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    const q = await p.evaluate(() => ({ card: !!document.querySelector('.gxst-card'), g: (document.querySelector('.gxst-goal') || {}).textContent || '', gc: !!document.querySelector('#goalcard') }));
    if (!q.card) note(id + ': no objective card'); if (q.gc) note(id + ': the game goal popup is over the lesson');
    if (i === 0) {   // tap anything: the board buttons are uncovered, Rules opens mid-lesson; hint nudge then show ring
      const covered = await p.evaluate(() => [...document.querySelectorAll('#acts button, #mk .mt, .gx-bar button')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
      if (covered) note(covered + ' board items under the lesson card');
      await tapStep({ c: '.gxst-bulb' }); await tapStep({ c: '.gxst-bulb' }); s = await st();
      if (s.hint !== 2 || !s.target) note('show-me hint has no target ' + JSON.stringify({ h: s.hint, ph: s.phase, t: s.target, i: s.id }) + await p.evaluate(() => (document.querySelector('.gxst-card') || {}).className)); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await tapStep({ c: '[data-gx="rulesd"]' }); await tick(p, 500);
      const opened = await p.evaluate(() => { const e = document.querySelector('[data-gx="rulesd"]'); return (e && e.getAttribute('aria-expanded') === 'true') || !!document.querySelector('.gx-drawer.on, .gx-drawer[open], .drawer.open, .gxh-card'); });
      if (!opened) note('non-lesson tap (Rules) did nothing');
      await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } }); await tick(p, 500);
      await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 1500);   // hints cost stars: start clean for the 3-star check
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-wildmark') || '{}'); b.best = {}; localStorage.setItem('gxst-wildmark', JSON.stringify(b)); });
    }
    // wrong move -> fail with a message, Retry restarts it
    dbg(id + ' wrong'); await play(id, SOLVE[id].wrong); dbg(id + ' wrong played');
    if (!(await phase('fail', 14000))) { note(id + ': a wrong move did not fail'); await p.evaluate(() => GXST.retry()); }
    else {
      s = await st(); if (!/\w{4}/.test(s.msg || '') || !/\S/.test(await p.textContent('.gxst-msg'))) note(id + ': fail has no message');
      if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
      await tapStep({ c: '.gxst-ft .pri' });
    }
    await live(id).catch(() => note(id + ': Retry did not restart')); await tick(p, 1500);
    // the scripted solution wins with 3 stars
    dbg(id + ' right'); await play(id, SOLVE[id].right); dbg(id + ' right played');
    if (!(await phase('win', 6000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ') ' + await p.evaluate(() => JSON.stringify({ st: G.stage, d: G.seats[0].done, ac: G.seats[0].acorns, free: UI.free, hold: G.hold && G.hold.tok }))); }
    else { s = await st(); if (s.stars !== 3) note(id + ': clean solve gave ' + s.stars + ' stars'); }
    if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  }
  // 2) minimise / chip / drag / close / reopen, progress saved
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tapStep({ c: '.gxst-hd .gxst-ib[aria-label="Minimise"]' }); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tapStep({ c: '.gxst-chip' }); if ((await st()).min) note('chip did not restore');
  await tick(p, 1500); const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  const dy = hd[1] > H / 2 ? -60 : 60;
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + dy / 2, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + dy, { steps: 4 });
  const moved = await p.evaluate(y0 => Math.abs(document.querySelector('.gxst-card').getBoundingClientRect().top + 10 - y0) > 20, hd[1]);   // the card follows the finger
  await p.mouse.up(); await tick(p, 500);
  if (!moved) note('the card did not follow the drag');
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-wildmark')).pos; } catch (e) { return null; } }) || phone)) note('drag position not saved');   // on a phone the saved spot is dropped when it would cover the board (place() keeps the board clear)
  await tapStep({ c: '.gxst-hd .gxst-ib[aria-label="Close"]' }); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  // closing a lesson returns to the title; its Tutorial button reopens the picker
  await tick(p, 500); const tb = await p.evaluate(() => !!document.querySelector('[data-gxt-open="wildmark"]'));
  if (!tb) note('no Tutorial button on the title'); else { await tapStep({ c: '[data-gxt-open="wildmark"]' }); await tick(p, 500); s = await st(); if (!s.open || s.phase !== 'picker') note('Tutorial button did not open the lesson picker ' + JSON.stringify(s)); }
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const cols = phone ? 4 : 3, cw = phone ? 250 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const stopB = budget(+(process.env.BUDGET||60000), 'wildmark lessons test'); const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + (process.env.DBG ? e.stack : e.message.split('\n')[0]))); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
