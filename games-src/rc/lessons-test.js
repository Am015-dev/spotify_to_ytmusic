// Shipwreck Isle scenario lessons (lessons.js on shell/gx-scenario-tutor.js). node lessons-test.js [402x874,1366x768]
// Real touch taps at turbo speed (scripts/turbo.js, hard budget 60 s per size). Asserts: the title's Lessons button opens the picker; EVERY lesson
// is solved by its scripted solution (3 stars, no hint); a wrong move fails with a one-line message and Retry restarts to play; nothing the player
// might tap is under the card and the menu opens mid-lesson; hint nudge then show-me ring; minimise/chip; close returns to the title; the player's
// saved game is never overwritten; 0 JS errors. Contact sheet of every lesson start per size: proof/lessons/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const { turbo, budget } = require('../scripts/turbo');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'shipwreck.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof', 'lessons'); fs.mkdirSync(PROOF, { recursive: true });
const T0 = Date.now();
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// a move = [pawn id, place index, optional text the option's data-place must hold]; pile = true taps "Add wood to the signal pile" first
const A = [['c0_0', 2], ['c0_1', 2]], CAMP = (k) => [['c0_0', 7, k], ['c0_1', 7, k]];
const SOLVE = {
  jobs: [['c0_0', 6, '"i":1'], ['c0_1', 6, '"i":1']], sure: A, shelter: CAMP('"k":"shelter"'), roof: CAMP('"k":"roof"'), hunt: CAMP('"type":"hunt"'),
  wreck: CAMP('"type":"threat"'), signal: [['c0_0', 7, 'pilemax'], ['c0_1', 2]], skill: 'skill', game: 'game'
};
const WRONG = { jobs: [['c0_0', 6, '"i":0'], ['c0_1', 6, '"i":0']], sure: [['c0_0', 2], ['c0_1', 6]], shelter: A, roof: A, hunt: A, wreck: A, signal: A, skill: A };
const words = t => t.trim().split(/\s+/).filter(Boolean).length;
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { probs.push(tag + ': ' + m); if (process.env.DBG) console.log('  ! ' + m + ' @' + ((Date.now() - T0) / 1000).toFixed(0) + 's'); }, shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'swi.test') return r.abort(); if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); return r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message)); p.on('crash', () => console.log('  PAGE CRASHED')); p.on('close', () => { if (process.env.DBG) console.log('  page closed @' + ((Date.now() - T0) / 1000).toFixed(0)); });
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404|WebGL/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://swi.test/?gl=0'); await sleep(500);
  await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem(SAVE, 'REAL-GAME-SENTINEL'); } catch (e) { } });
  await p.reload(); await sleep(1500);
  await p.evaluate(() => { try { setGfx('low'); GXH.setEnabled(false); } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const dump = async w => { if (process.env.DBG) console.log('  DUMP ' + w + ' ' + await p.evaluate(() => JSON.stringify({ gx: GXST.state().phase + '/' + GXST.state().live, g: !!G, round: G && G.round, ph: G && G.phase, st: PHO.st, modal: UI.modal, q: G && !!G.q, beats: UI.beats.length, shown: UI.shown, pop: PHO.pop && PHO.pop.k, pawn: !!document.querySelector('#bf [data-pawn]'), ft: [...document.querySelectorAll('.gxst-ft button')].map(e => e.textContent).join('|') }))); };
  // tap the centre of an element; what is under the finger must be that element (or inside it), never the lesson card
  const tap = async (sel, what, filt, quiet) => {
    const pt = await p.evaluate(([sel, filt]) => { const es = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 6 && r.height > 6 && (!filt || decodeURIComponent(e.dataset.place || '').indexOf(filt) >= 0 || (e.dataset.a || '').indexOf(filt) >= 0); }); const e = es[0]; if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (e === u || e.contains(u) || u.contains(e) || (/bfgl/.test(e.className) && u.tagName === 'CANVAS')), what: u && (u.className || u.tagName) }; }, [sel, filt || null]);
    if (!pt) { if (!quiet) note('nothing to tap: ' + (what || sel)); return false; }
    if (!pt.ok) note('something covers ' + (what || sel) + ' (' + pt.what + ')');
    await p.touchscreen.tap(pt.x, pt.y); await sleep(25); return true;
  };
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live && G && G.phase === 'plan' && /^plan/.test(PHO.st || '') && document.querySelector('#bf [data-pawn]'); }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 14000 }).then(() => true, () => false);
  const place = async ([pid, t, opt]) => {
    if (!(await tap('#bf [data-pawn="' + pid + '"]', 'pawn ' + pid))) return;
    if (!(await tap('#bfglow>[data-t="' + t + '"]', 'place ' + t))) return;
    if (opt) { await sleep(120); await tap(opt === 'pilemax' ? '[data-a="pilemax"]' : '#ppop [data-place],[data-place]', 'option ' + opt, opt === 'pilemax' ? 'pilemax' : opt); await sleep(120); if (opt === 'pilemax') await p.evaluate(() => { try { PHO.closePop(true); } catch (e) { } }); }
  };
  // the day replays by itself except for Continue taps: click them in the page until the lesson is judged (the moves above are the real taps)
  const finishDay = () => p.evaluate(() => new Promise(res => { let n = 0; const iv = setInterval(() => { const b = document.querySelector('#bf [data-a="next"],.bf-opts .opt'); if (b) b.click(); if (GXST.state().phase !== 'play' || ++n > 4000) { clearInterval(iv); res(); } }, 5); }));
  const play = async mv => { for (const m of mv) await place(m); await sleep(250); await tap('#bf [data-a="go"]', 'Start day'); await sleep(200); if (await p.$('#bf [data-a="go"][data-force]')) await tap('#bf [data-a="go"][data-force]', 'Start anyway'); await finishDay(); };
  const gameLoop = async () => {   // a real game: let the wand plan each day, play it out
    for (let i = 0; i < 12 && (await st()).phase === 'play'; i++) {
      await p.waitForFunction(() => GXST.state().phase !== 'play' || (G && (G.over || (G.phase === 'plan' && /^plan/.test(PHO.st || '') && !UI.modal && !G.q))), null, { timeout: 15000 }).catch(() => { });
      if ((await st()).phase !== 'play') break;
      const need = await p.evaluate(() => planProblems().length); if (need) { await tap('#bf [data-a="suggest"]', 'wand'); await sleep(100); }
      await tap('#bf [data-a="go"]', 'Start day'); await sleep(200);
      for (let k = 0; k < 12; k++) { if (!(await tap('.bf-opts .opt', 'option'))) break; await sleep(100); }
    }
  };
  const solve = async id => {
    const s = SOLVE[id];
    if (s === 'game') await gameLoop();
    else if (s === 'skill') { await tap('[data-gx="campd"]', 'Camp'); await sleep(200); await tap('[data-skill="0:broth"]', 'Pebble Broth'); await sleep(150); await tap('[data-gx="close"]', 'close drawer'); await sleep(150); await play(A); }
    else await play(s);
    if (!(await phase('win', 8000))) { const x = await st(); if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify({ a: G.plan.acts.map(a => a.type + ':' + JSON.stringify(a.tgt) + ':' + a.pw), r: G.round, st: PHO.st, pop: PHO.pop && PHO.pop.k, res: G.res, w: G.chars[0].w, sh: G.camp.shelter, roof: G.camp.roof, btn: [...document.querySelectorAll('#bf [data-a]')].map(e => e.dataset.a + ':' + e.textContent.trim().slice(0, 12)).join('|'), opts: [...document.querySelectorAll('[data-place]')].map(e => decodeURIComponent(e.dataset.place)).slice(0, 6) }))); note(id + ': scripted solution did not win (phase ' + x.phase + (x.msg ? ', ' + x.msg : '') + ')'); }
  };
  const stop = budget(+process.env.BUD || 60000, 'shipwreck lessons ' + tag);
  // 0) entry: the title's Lessons button takes a touch and opens the picker over the real screen
  if (!(await tap('#modal [data-a="lessons"]', 'title Lessons'))) await p.evaluate(() => lessonsOpen());
  await p.waitForFunction(() => GXST.state() && GXST.state().open, null, { timeout: 8000 });
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE);
  if (s.phase !== 'picker' || n !== s.count || n !== ids.length || n < 6 || n > 10) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 1) lesson 1: wrong move fails with a message; Retry restarts; non-lesson taps work; hint nudge then show-me; chip
  await tap('.gxst-pick[data-id="jobs"]', 'lesson 1'); await live('jobs'); await sleep(300);
  (await p.evaluate(() => [...document.querySelectorAll('.gxst-goal')].map(e => e.textContent))).forEach(t => { if (words(t) > 12) note('goal over 12 words: ' + t); });
  await play(WRONG.jobs); if (!(await phase('fail', 6000))) { note('a wrong move did not fail'); if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify({ a: G.plan.acts, pr: planProblems(), r: G.round, st: PHO.st, ph: G.phase, pop: PHO.pop, beats: UI.beats.length, shown: UI.shown, auto: UI.auto, modal: UI.modal, q: !!G.q, over: G.over, btn: [...document.querySelectorAll('#bf [data-a]')].map(e => e.dataset.a + ':' + e.textContent.trim().slice(0, 14)).join('|') }))); }
  s = await st(); if (!/\w{4}/.test(s.msg || '')) note('fail has no message'); await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri', 'Retry'); await live('jobs'); await sleep(300);
  const covered = await p.evaluate(() => [...document.querySelectorAll('#bfglow>*,#bf [data-pawn],#bf [data-a="go"]')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest && u.closest('.gxst-card,.gxst-chip'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  await tap('[data-gx="rulesd"], [data-gx="logd"]', 'a non-lesson button'); const dr = await p.evaluate(() => !!document.querySelector('.gx-drawer.open,.gx-drawer.on,[aria-expanded="true"]')); if (!dr) note('non-lesson tap (drawer) did nothing');
  await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await sleep(150);
  if ((await st()).phase !== 'play') note('lesson ended by opening a drawer');
  await tap('.gxst-bulb', 'bulb'); await tap('.gxst-bulb', 'bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target'); if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]', 'minimise'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await sleep(300); await tap('.gxst-chip', 'chip'); if ((await st()).min) note('chip did not restore');
  await solve('jobs'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 2) every lesson: start picture for the sheet, a wrong move fails (not the game), the scripted solution wins with 3 stars
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (i > 0) { await tap('.gxst-ft .pri', 'Next'); await live(id).catch(async () => { note(id + ' did not start'); if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify({ g: !!G, ph: G && G.phase, st: PHO.st, modal: UI.modal, q: G && !!G.q, beats: UI.beats.length, shown: UI.shown, s: GXST.state(), pawn: !!document.querySelector('#bf [data-pawn]'), btn: [...document.querySelectorAll('#bf [data-a],#modal button')].map(e => e.dataset.a + ':' + e.textContent.trim().slice(0, 12)).join('|') }))); }); } else { await p.evaluate(() => GXST.start('jobs')); await live('jobs'); }
    await sleep(500);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    const g = await p.evaluate(() => document.querySelector('.gxst-goal').textContent); if (words(g) > 12) note(id + ' goal over 12 words');
    if (WRONG[id] && i > 0) {
      await play(WRONG[id]);
      if (!(await phase('fail', 20000))) note(id + ': wrong move did not fail'); else { s = await st(); if (!/\w{4}/.test(s.msg || '') || words(s.msg) > 26) note(id + ': fail message "' + s.msg + '"'); await tap('.gxst-ft .pri', 'Retry'); await live(id).catch(async () => { note(id + ': retry did not restart'); await dump('retry ' + id); }); }
    }
    await solve(id); s = await st(); if (s.phase === 'win' && s.stars !== 3 && id !== 'jobs') note(id + ': clean solve gave ' + s.stars + ' stars (' + s.hint + ' hints)');
    if (s.phase === 'win') { const dd = await p.evaluate(() => [...document.querySelectorAll('.gxst-say,.gxst-rule')].map(e => e.textContent).join('|')); if (!/\S/.test(dd)) note(id + ': win card has no debrief'); }
  }
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  // 3) close returns to the title; the real saved game was never touched; events fired
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]', 'close'); await sleep(400);
  if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  const back = await p.evaluate(() => ({ g: !!G, modal: UI.modal, save: localStorage.getItem(SAVE) })); if (back.g || back.modal !== 'start') note('closing did not return to the title');
  if (back.save !== 'REAL-GAME-SENTINEL') note('the saved real game was overwritten');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  stop();
  const cols = phone ? 5 : 3, cw = phone ? 240 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b2, i) => '<figure><img src="data:image/jpeg;base64,' + b2.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await b.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true }); await sp.close();
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch(Object.assign({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}));
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
