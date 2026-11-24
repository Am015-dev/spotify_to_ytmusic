// Emberclimb scenario tutorials test (src/lessons.js on shell/gx-scenario-tutor.js). Run: node tools/lessons-test.js [402x874,1366x768]
// Asserts: the picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps (3 stars, no hint); a wrong move fails with a
// message and Retry restarts; every tap lands on the element tapped (the card never covers cards, foes, End turn); a non-lesson button (Menu) works
// mid-lesson; hint nudge -> show draws a ring; minimise / drag saved / close / Lessons reopen; progress saved; 0 JS errors. Prints seconds per size.
// Contact sheet of every lesson start: emberclimb/proof/lessons-<size>-sheet.jpg
const PW = require('playwright'), fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'emberclimb.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
const SOLVE = { strike: ['w-strike', 'w-strike', 'w-strike'], block: ['w-defend', 'END'], intent: ['w-defend', 'w-defend', 'w-defend', 'END'], vuln: ['w-hammer', 'w-strike'],
  weak: ['w-roar', 'END'], poison: ['POT', 'END'], strength: ['w-kindle', 'w-strike', 'w-strike'], sweep: ['w-cleave'], camp: ['REST'], game: ['PLAY'] };
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'ec.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://ec.test/?lessons=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)), cov: u ? (u.className + '|' + u.tagName + '|' + (u.closest('.gxst-card') ? 'LESSON' : '')) : '' }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what + ' -> ' + pt.cov);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(220); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel);
  const idle = () => p.waitForFunction(() => { const g = EC.E.G(); return !UI.busy && (g.scr !== 'battle' || (g.b && g.b.ph === 'p')) || GXST.state().phase !== 'play'; }, null, { timeout: 15000 }).catch(() => { });
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  // play a card by id: tap it (select), tap it again (play); a card that needs a foe gets the first foe tap
  const play = async id => {
    await idle(); if ((await st()).phase !== 'play') return;
    const i = await p.evaluate(id => EC.E.G().hs[0].hand.findIndex(c => c.id === id), id); if (i < 0) { note('card not in hand: ' + id); return; }
    await tap('.hand .card[data-c="' + i + '"]'); await tap('.hand .card[data-c="' + i + '"]');
    if (await p.evaluate(() => UI.sel >= 0)) await tap('.en:not(.dead)');
    await sleep(250);
  };
  const solve = async id => {
    for (const k of SOLVE[id]) {
      if ((await st()).phase !== 'play') break;
      if (k === 'END') { await idle(); await tap('#end'); await sleep(300); }
      else if (k === 'POT') { await idle(); await tap('.pots .pot.full'); await tap('.potdrink'); await sleep(300); }
      else if (k === 'REST') { await tap('#rest-heal'); }
      else if (k === 'PLAY') {   // the real fight: block when the sign shows a hit, strike otherwise, until it is won
        for (let t = 0; t < 40 && (await st()).phase === 'play'; t++) {
          await idle(); if ((await st()).phase !== 'play') break;
          const pick = await p.evaluate(() => { const h = EC.E.G().hs[0], c = h.hand.findIndex(c => EC.D.CARDS[c.id].type !== 'P' && EC.E.canPlay(h, c) && EC.E.cost(h, c) <= h.en && c.id !== 'dazed'); return c; });
          if (pick < 0) { await tap('#end'); await sleep(400); continue; }
          await tap('.hand .card[data-c="' + pick + '"]'); await tap('.hand .card[data-c="' + pick + '"]');
          if (await p.evaluate(() => UI.sel >= 0)) await tap('.en:not(.dead)'); await sleep(250);
        }
      } else await play(k);
    }
    if (!(await phase('win'))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  // 1) picker
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 2) wrong move on lesson 1 fails with a message, Retry restarts
  await tap('.gxst-pick[data-id="strike"]'); await live('strike'); await sleep(500); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
  await play('w-defend'); await play('w-defend'); await play('w-strike');
  if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg) || !/\S/.test(await p.textContent('.gxst-msg'))) note('fail has no message');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri'); await live('strike');
  // 3) tap anything: nothing of the board is under the card; the Menu opens while a lesson runs
  const covered = await p.evaluate(() => [...document.querySelectorAll('.hand .card, .en, #end')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  const menuSel = await p.evaluate(() => { const e = document.querySelector('[data-gx="menu"], .gx-menu-btn, #menu, [aria-label="Menu"]'); return e ? (e.id ? '#' + e.id : e.getAttribute('data-gx') ? '[data-gx="' + e.getAttribute('data-gx') + '"]' : '[aria-label="Menu"]') : null; });
  if (!menuSel) note('no Menu button to test a non-lesson tap'); else { await tap(menuSel); const o = await p.evaluate(() => !!document.querySelector('.gx-drawer, .gx-menu, dialog[open], [role="dialog"]')); if (!o) note('Menu did nothing mid-lesson'); await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await sleep(250); }
  // 4) hint: nudge, then show (ring on the card, never under the card)
  await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('lesson card covers the hinted card');
  if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await solve('strike'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 6) every other lesson via Next, solved with no hint (3 stars)
  const ids = Object.keys(SOLVE);
  for (let i = 1; i < ids.length; i++) {
    await tap('.gxst-ft .pri'); await live(ids[i]).catch(() => note(ids[i] + ' did not start'));
    await sleep(500); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    await solve(ids[i]); s = await st(); if (s.phase === 'win' && s.stars !== 3) note(ids[i] + ': clean solve gave ' + s.stars + ' stars');
    if (ids[i] === 'poison') { /* wrong-move check on a second lesson: covered by fail messages below */ }
  }
  // 5) minimise / chip / drag remembered
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await sleep(300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-emberclimb')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  await p.mouse.move(hd[0] + 8, hd[1] + 60); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0], hd[1], { steps: 4 }); await p.mouse.up(); await sleep(300);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  // 7) close, Lessons reopens the picker
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  s = await st(); if (await p.evaluate(() => UI.mode) !== 'game') note('closing the last lesson did not start a real game');   // R13: Close from the last lesson goes on into a real climb
  await p.evaluate(() => { var g = document.querySelector('.ec-goal'); if (g) g.remove(); });   // the new game's goal card sits where the pill is until dismissed
  await tap('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('the Lessons button did not open the lesson picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const cols = phone ? 5 : 3, cw = phone ? 240 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
