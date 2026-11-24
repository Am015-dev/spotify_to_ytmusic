// lessons-test.js: Short Fuse scenario lessons (lessons.js on shell/gx-scenario-tutor.js), real taps, 402x874 and 1366x768.
//   node lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds; exit 1 on a problem.
// Asserts: picker lists every lesson; every lesson is solved by its scripted solution with real taps (3 stars, no hint);
// a wrong move fails with a message and Retry restarts it; the player can tap anything (nothing of the kit covers a wire, the gear or
// the tray; a non-lesson button works); hint nudge then show ring; minimise/chip, drag saved, close and reopen; progress saved; 0 JS errors.
// Contact sheet of every lesson start per size: games-src/short-fuse/proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'shortfuse.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const T0 = Date.now(), dbg = m => { if (process.env.DBG) console.log(((Date.now() - T0) / 1000).toFixed(1) + 's ' + m); };
// action: ['c', stand, value] tap a crew wire; ['m', value] tap my wire; ['gear'] tap the ready gear card; ['probe'] pick the personal tool
const SOLVE = {
  dual: [['c', 1, 5], ['m', 5]], order: [['c', 1, 1], ['m', 1]], miss: [['c', 1, 8], ['m', 6], ['shot'], ['c', 1, 8], ['m', 8]], solo: [['m', 7]],
  gear: [['c', 1, 6], ['m', 6], ['gear']], probe: [['probe'], ['cn', 1, 0], ['cn', 1, 1], ['m', 4]], yellow: [['c', 1, 'Y'], ['m', 'Y']],
  red: [['c', 1, 4], ['m', 4]], reveal: [['c', 1, 5], ['m', 5]], game: [['game']]
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { dbg('NOTE ' + m); probs.push(tag + ': ' + m); }, shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'sf.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|Fetch API/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://sf.test/'); await sleep(1500);
  await p.evaluate(() => { try { AIDELAY = 60; ANIM = 0; } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); lessonsOpen(); });
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  const st = () => p.evaluate(() => GXST.state());
  // tap the centre of an element; the element under the finger must be that element (the kit never covers what you tap)
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; e.scrollIntoView && e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) { note('something covers ' + what); if (process.env.DBG) await p.screenshot({ path: '/tmp/cov-' + tag + '-' + what.replace(/\W+/g, '_') + '.png' }); }
    await p.touchscreen.tap(pt.x, pt.y); await sleep(220); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel);
  const crew = (si, v) => tapEl(([si, v]) => { const sl = G.st[si].w.find(x => !x.cut && cv(x.id) === v); return sl && tileEl(sl.u); }, [si, v], 'crew wire ' + si + '/' + v);
  const crewN = (si, k) => tapEl(([si, k]) => { const sl = G.st[si].w[k]; return sl && tileEl(sl.u); }, [si, k], 'crew wire #' + k);
  const mine = v => tapEl(v => { const sl = G.st[0].w.find(x => !x.cut && cv(x.id) === v); return sl && tileEl(sl.u); }, v, 'my wire ' + v);
  const myTurn = () => p.waitForFunction(() => GXST.state().phase !== 'play' || (G && !UI.aiT && (G.over || (G.q && G.q.who === 0) || (decider() === 0 && G.step === 'act' && UI.V && UI.V.legal))), null, { timeout: 15000 }).catch(() => note('never my turn again'));
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  const solve = async id => {
    dbg('solve ' + id);
    for (const a of SOLVE[id]) {
      if ((await st()).phase !== 'play') break;
      await myTurn(); if ((await st()).phase !== 'play') break;
      if (a[0] === 'c') await crew(a[1], a[2]); else if (a[0] === 'cn') await crewN(a[1], a[2]); else if (a[0] === 'm') await mine(a[1]);
      else if (a[0] === 'shot') { await sleep(700); await myTurn(); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 })); }
      else if (a[0] === 'gear') await tap('#tb .eqk.glow, #tb .eqk');
      else if (a[0] === 'probe') await tapEl(() => [...document.querySelectorAll('#tb .chip')].find(e => /probe|twin/i.test(e.textContent)) || document.querySelector('#tb .chip'), 0, 'probe chip');
      else if (a[0] === 'game') {   // a whole short job: the crew's own deduction plays our seat, through the same act() the taps use
        for (let i = 0; i < 80; i++) { const done = await p.evaluate(() => { if (!G || G.over) return true; if (G.q && G.q.who === 0) { act(aiMove(0), 0); return false; } if (decider() === 0 && G.step === 'act') { const m = aiMove(0); if (m) act(m, 0); } return false; }); if (done) break; await sleep(120); }
      }
    }
    if (id !== 'game') await myTurn();
    if (!(await phase('win', id === 'game' ? 20000 : 12000))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 2) wrong move on lesson 1 fails with a message, Retry restarts
  await tap('.gxst-pick[data-id="dual"]'); await live('dual'); await myTurn();
  await sleep(300); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
  await crew(1, 7); await mine(5);
  if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg || '') || !/\S/.test(await p.textContent('.gxst-msg'))) note('fail has no message');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri'); await live('dual'); await myTurn();
  // 3) tap anything: every wire, the gear and the tray are uncovered by the card; a non-lesson button works while a lesson runs
  const covered = await p.evaluate(() => [...document.querySelectorAll('#tb .tile, #tb .eqk, #tb .chip, #mine .tile')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.bottom < 0 || r.top > innerHeight) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  const btn = await p.evaluate(() => { const b = [...document.querySelectorAll('[data-gx]')].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.top >= 0 && r.bottom <= innerHeight && (function (u) { return u === e || e.contains(u); })(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); }); return b ? b.getAttribute('data-gx') : null; });
  if (btn) { await tap('[data-gx="' + btn + '"]'); const opened = await p.evaluate(() => !!(document.querySelector('.gx-drawer.open,.gx-drawer[open],.gx-drawer:not([hidden])') || GX.open)); if (!opened) note('non-lesson tap (' + btn + ') did nothing'); await p.evaluate(() => { try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } }); await sleep(300); } else note('no non-lesson button found');
  // 4) hint: nudge, then show (ring on the wire, never under the card)
  await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted wire');
  if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await solve('dual'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 6) every other lesson via Next, solved by its scripted solution with no hint (3 stars)
  const ids = Object.keys(SOLVE);
  for (let i = 1; i < ids.length; i++) {
    await tap('.gxst-ft .pri'); await live(ids[i]).catch(() => note(ids[i] + ' did not start')); await myTurn();
    await sleep(300); shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    await solve(ids[i]);
    s = await st(); if (s.phase === 'win' && s.stars !== 3 && ids[i] !== 'miss') note(ids[i] + ': clean solve gave ' + s.stars + ' stars');
  }
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  // 5) (after the lessons, so the dragged spot does not move the card in later ones) minimise / chip / drag / remembered
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await sleep(300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-short-fuse')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  await p.mouse.move(hd[0] + 8, hd[1] + 60); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0], hd[1], { steps: 4 }); await p.mouse.up(); await sleep(300);
  const real = Object.keys(SOLVE);
  s = await st(); if (Object.keys(s.best).length !== real.length) note('progress saved for ' + Object.keys(s.best).length + '/' + real.length);
  // 7) close, the Tutorial entry reopens the picker with stars
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await p.evaluate(() => tutStart()); await sleep(500); s = await st(); if (!s.open || s.phase !== 'picker') note('Tutorial did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const names = ['dual', 'order', 'miss', 'miss (after a miss)', 'solo', 'gear', 'probe', 'yellow', 'red', 'reveal', 'game'];
  const cols = phone ? 4 : 3, cw = phone ? 300 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + (names[i] || '') + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined, args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
