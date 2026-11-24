// Sunglaze scenario lessons (src/lessons.js, engine shell/gx-scenario-tutor.js). node lessons-test.js [402x874,1366x768]
// Asserts, with real touch taps: the title's Lessons button opens the picker; EVERY lesson is solved by its scripted solution (3 stars,
// no hint); a wrong move fails with a one-line message and Retry restarts to play; the player can tap anything (no board item under the
// card, the menu opens mid-lesson); hint nudge then show-me ring; minimise/chip, close returns to the title; the player's saved game is
// never overwritten; 0 JS errors. Contact sheet of every lesson start per size: ../proof/lessons/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'sunglaze.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof', 'lessons'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// one move = [source, colour, rack]: source -1 the middle, 0..4 a kiln; rack 0..4 (5 = floor)
const SOLVE = { take: [[0, 2, 2]], racks: [[0, 0, 3]], blocked: [[0, 1, 3]], sun: [[-1, 2, 1]], tiling: [[0, 2, 2]], chain: [[0, 0, 2]], floor: [[0, 0, 3]], end: [[0, 4, 0]], game: [[4, 4, 0]] };
const WRONG = { take: [1, 2, 0], racks: [0, 0, 0], blocked: [0, 1, 1], sun: [1, 3, 0], tiling: [1, 3, 3], chain: [1, 4, 4], floor: [0, 0, 0], end: [1, 0, 2] };
const words = t => t.trim().split(/\s+/).filter(Boolean).length;
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); return r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/'); await sleep(600);
  await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem(SAVE, 'REAL-GAME-SENTINEL'); } catch (e) { } });
  await p.reload(); await sleep(1800); p.on('console', m => { if (process.env.DBG) console.log('  [c]', m.text().slice(0, 120)); });
  await p.evaluate(() => { try { AIDELAY = 60; } catch (e) { } window.bfD = ms => ms * .2; window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  // tap the centre of an element; what is under the finger must be that element, never the lesson card
  const tapEl = async (fn, arg, what, ui) => {
    const pt = await p.evaluate(([fn, arg, ui]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (ui || !u.closest('.gxst-card')) && (u === e || e.contains(u) || !!u.closest('[data-k],[data-bfrow]')) }; }, [fn.toString(), arg, !!ui]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(120); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel, true);
  const mine = () => p.waitForFunction(() => G && !G.over && sideToAct() === 0 && !BF.busy && !BF.q.length && G.phase === 'offer', null, { timeout: 15000 });
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 14000 }).then(() => true, () => false);
  const key = ([src, c]) => p.evaluate(([src, c]) => { const a = src < 0 ? G.ctr : G.fac[src]; const k = a.indexOf(c); return k < 0 ? null : (src < 0 ? 'c' : 'f' + src) + '_' + k; }, [src, c]);
  const move = async ([src, c, rk]) => {
    await mine(); const k = await key([src, c]); if (!k) { note('no tile ' + src + '/' + c); return false; }
    await tapEl(s => document.querySelector('.bf-table [data-k="' + s + '"]'), k, 'tile ' + k); await sleep(150);
    if (await p.evaluate(() => !UI.sel)) return true;   // nothing fits: the tile tap alone went to the floor
    await tapEl(r => document.querySelector(r === 5 ? '.bf-fl' : '[data-bfrow="' + r + '"] .bf-rack'), rk, 'rack ' + rk); return true;
  };
  const solve = async id => {
    for (const m of SOLVE[id]) { await move(m); if ((await st()).phase !== 'play') break; }
    if (id === 'game') for (let i = 0; i < 40 && (await st()).phase === 'play'; i++) {   // then play it out with the computer's best moves
      await p.waitForFunction(() => GXST.state().phase !== 'play' || (G && !G.over && sideToAct() === 0 && !BF.busy && !BF.q.length), null, { timeout: 20000 }).catch(() => { });
      if ((await st()).phase !== 'play') break;
      const m = await p.evaluate(() => { const m = aiMove(0); return m ? [m.src, G.ctr.concat(...G.fac).length && m.c, m.line] : null; }); if (!m) break; await move(m);
    }
    if (!(await phase('win'))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  // 0) entry: the title's Lessons button takes a touch and opens the picker over the real screen
  if (!(await tap('#modal [data-a=tutorial]'))) { await p.evaluate(() => lsnOpen()); note('title has no tappable lessons button'); }
  await p.waitForFunction(() => GXST.state() && GXST.state().open, null, { timeout: 8000 });
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE);
  if (s.phase !== 'picker' || n !== s.count || n !== ids.length || n < 6 || n > 10) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 1) wrong move on lesson 1 fails with a message; Retry restarts; hint nudge then show-me; tap anything; chip
  await tap('.gxst-pick[data-id="take"]'); await live('take'); await sleep(500);
  const copy = await p.evaluate(() => GXST.state()); if (!copy.card) note('no card');
  const wordsBad = await p.evaluate(() => { const o = []; ['.gxst-goal'].forEach(q => document.querySelectorAll(q).forEach(e => o.push(e.textContent))); return o; });
  wordsBad.forEach(t => { if (words(t) > 12) note('goal over 12 words: ' + t); });
  await move(WRONG.take); if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg)) note('fail has no message'); await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri'); await live('take'); await sleep(500); await mine();
  const covered = await p.evaluate(() => [...document.querySelectorAll('.bf-table [data-k], [data-bfrow] .bf-rack, .bf-fl')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  await tap('[data-bf="menu"]'); const menu = await p.evaluate(() => !!BF.menu); if (!menu) note('non-lesson tap (menu) did nothing');
  await p.evaluate(() => { BF.menu = false; bfDraw(); }); await sleep(200);
  if ((await st()).phase !== 'play') note('lesson ended by opening the menu');
  await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target'); if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  await solve('take'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 2) every lesson: start picture for the sheet, a wrong move fails (except the free game), then the scripted solution wins with 3 stars
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (i > 0) { await tap('.gxst-ft .pri'); await live(id).catch(() => note(id + ' did not start')); }
    else { await p.evaluate(() => GXST.start('take')); await live('take'); }   // (lesson 1 was just solved with hints: replay it clean)
    await sleep(500); await mine().catch(() => note(id + ': never my turn'));
    shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    const g = await p.evaluate(() => document.querySelector('.gxst-goal').textContent); if (words(g) > 12) note(id + ' goal over 12 words');
    if (WRONG[id]) {   // a wrong move on every lesson fails with its message, Retry brings the lesson back to play
      await move(WRONG[id]);
      if (!(await phase('fail', 25000))) note(id + ': wrong move did not fail'); else { s = await st(); if (!/\w{4}/.test(s.msg) || words(s.msg) > 24) note(id + ': fail message "' + s.msg + '"'); await tap('.gxst-ft .pri'); await live(id).catch(() => note(id + ' Retry did not restart')); await sleep(400); }
    }
    await mine().catch(() => { }); await solve(id); s = await st(); if (s.phase === 'win' && s.stars !== 3) note(id + ': clean solve gave ' + s.stars + ' stars (' + s.hint + ' hints)');
    if (s.phase === 'win') { const dd = await p.evaluate(() => [...document.querySelectorAll('.gxst-say,.gxst-rule')].map(e => e.textContent).join('|')); if (!/\S/.test(dd)) note(id + ': win card has no debrief'); }
  }
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  // 3) close returns to the title; the real saved game was never touched; events fired
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); await sleep(500);
  if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  const back = await p.evaluate(() => ({ g: !!G, modal: UI.modal, save: localStorage.getItem(SAVE) })); if (back.g || back.modal !== 'start') note('closing did not return to the title');
  if (back.save !== 'REAL-GAME-SENTINEL') note('the saved real game was overwritten');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  const cols = phone ? 5 : 3, cw = phone ? 240 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b2, i) => '<figure><img src="data:image/jpeg;base64,' + b2.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch(Object.assign({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }, fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}));
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
