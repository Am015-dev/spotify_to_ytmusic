// Scenario tutorial engine (gx-scenario-tutor.js) test on Kaiten Kitchen with ?lessons=1.
//   node shell/gxst-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps; a wrong move fails with a message
// and Retry restarts it; every tap lands on the thing tapped (nothing of the kit covers the board); a non-lesson tap (Rules) works;
// hint -> show ring never under the card; minimise/chip, drag remembered, close and Lessons reopen; progress saved; 0 JS errors.
// Contact sheet of every lesson start per size: games-src/kaiten-kitchen/proof/gxst-<size>-sheet.jpg
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'kaiten', 'game', 'kaiten.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'kaiten-kitchen', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
const SOLVE = { take: ['squid'], prawns: ['tempura'], paste: ['wasabi', 'squid'], buns: ['dumpling', 'dumpling'], deny: ['sashimi'], rolls: ['roll3'], sticks: ['twin', 'tempura', 'tempura'] };
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1' + (phone ? '&phone=1' : ''));
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { try { AIDELAY = 60; } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  // tap the centre of an element; the element under the finger must be that element (the kit never covers what you tap)
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(250); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel);
  const tapDish = k => tapEl(k => [...document.querySelectorAll('#belt .hc[data-id]:not(.sel)')].find(e => KK.cardKey(+e.dataset.id) === k), k, 'dish ' + k);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 });
  const canPick = () => p.waitForFunction(() => typeof canPick === 'function' && canPick(), null, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  const solve = async id => {
    for (const k of SOLVE[id]) {
      if (k === 'twin') { await canPick(); await tap('#tbl .seat.me .grp.usable'); continue; }
      await canPick(); await tapDish(k);
      if ((await st()).phase === 'win') break;
      await p.waitForFunction(() => !UI.busy && (canPick() || GXST.state().phase !== 'play'), null, { timeout: 15000 }).catch(() => { });
    }
    if (!(await phase('win'))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'gxst-' + tag + '-picker.png') });
  // 2) wrong move on lesson 1 fails with a message, Retry restarts
  await tap('.gxst-pick[data-id="take"]'); await live('take');
  await sleep(400); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
  await canPick(); await tapDish('egg');
  if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg) || !/\S/.test(await p.textContent('.gxst-msg'))) note('fail has no message');
  await p.screenshot({ path: path.join(PROOF, 'gxst-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri'); await live('take');
  // 3) tap anything: every dish is uncovered, Rules opens while a lesson runs
  const covered = await p.evaluate(() => [...document.querySelectorAll('#belt .hc[data-id], #tbl .seat')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  await tap('[data-gx="rulesd"]');
  const opened = await p.evaluate(() => document.querySelector('[data-gx="rulesd"]').getAttribute('aria-expanded') === 'true' || !!document.querySelector('.gx-drawer[open], dialog[open], .gxh-card'));
  if (!opened) note('non-lesson tap (Rules) did nothing');
  await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } }); await sleep(300);
  // 4) hint: nudge, then show (ring on the dish, never under the card)
  await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted dish');
  if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await solve('take'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 5) minimise / chip / drag / remembered
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await sleep(300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-kaiten')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  await p.mouse.move(hd[0] + 8, hd[1] + 60); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0], hd[1], { steps: 4 }); await p.mouse.up(); await sleep(300);   // back, so the sheet shows the default spot
  // 6) every other lesson via Next, solved by its scripted solution with no hint (3 stars)
  const ids = Object.keys(SOLVE);
  for (let i = 1; i < ids.length; i++) {
    await tap('.gxst-ft .pri'); await live(ids[i]).catch(() => note(ids[i] + ' did not start'));
    await sleep(400); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    await solve(ids[i]); s = await st(); if (s.phase === 'win' && s.stars !== 3) note(ids[i] + ': clean solve gave ' + s.stars + ' stars');
  }
  await p.screenshot({ path: path.join(PROOF, 'gxst-' + tag + '-win.png') });
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  // 7) close, Lessons reopens the picker with stars
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tap('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const cols = phone ? 4 : 3, cw = phone ? 300 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'gxst-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
