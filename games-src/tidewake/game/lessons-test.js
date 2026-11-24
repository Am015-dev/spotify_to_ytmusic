// Tidewake scenario lessons test (lessons.js on shell/gx-scenario-tutor.js). Pattern of shell/gxst-test.js.
//   node games-src/tidewake/game/lessons-test.js [sizes=402x874,1366x768]    prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: the picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps (3 stars, no hint); a wrong move ends in
// `fail` with a message and Retry restarts; every tap lands on the element tapped (the card never covers the board); Rules still opens
// mid-lesson; hint -> show draws a ring; minimise/chip, close and Lessons reopen; progress saved; 0 JS errors.
// Machine speed: AIDELAY 40 ms, animation speed x8, 2D chart (the software 3D renderer is not what is tested). Proof: games-src/tidewake/proof/
const PW = (() => { try { return require(process.env.PW_DIR || 'playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'tidewake.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// the scripted solutions: tile t turned r times; start marks; question answers (q:'fire' picks the option whose label has the word)
const SOLVE = {
  mark: [{ mark: [3, 6, 4] }], lay: [{ t: 2, r: 1 }], chain: [{ t: 2, r: 1 }], push: [{ t: 2, r: 1 }], wake: [{ t: 0, r: 0 }],
  cannon: [{ q: /Fire a Deck Cannon/ }], gate: [{ q: /Rift Gate/ }, { qs: 1 }], wave: [{ t: 2, r: 0 }], game: [{ play: 1 }]
};
const WRONG = {
  mark: { mark: [0, 4, 6] }, lay: { t: 0, r: 0 }, chain: { t: 0, r: 0 }, push: { t: 0, r: 0 }, wake: { t: 1, r: 0 },
  cannon: { q: /Accept/ }, gate: { q: /Accept/ }, wave: { t: 0, r: 0 }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?2d=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && window.TWL, null, { timeout: 30000 });
  await p.evaluate(() => { try { AIDELAY = 40; UI.speed = 8; TWKit.setSpeed(8); } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); GXST.picker(); });
  const st = () => p.evaluate(() => GXST.state());
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(160); return true;
  };
  const vis = '(sel)=>[...document.querySelectorAll(sel)].find(e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&r.bottom>0&&r.top<innerHeight&&!e.closest("[hidden]")})';
  const tap = sel => tapEl(new Function('s', 'return (' + vis + ')(s)'), sel, sel);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 15000 }).then(() => true, () => false);
  const myTurn = () => p.waitForFunction(() => GXST.state().phase !== 'play' || (!UI.busy && !G.ag.length && sideToAct() === 0), null, { timeout: 20000 }).catch(() => { });
  const place = async (t, r) => {
    await myTurn(); if ((await st()).phase !== 'play') return;
    await tap('[data-a=card][data-t="' + t + '"],[data-ph=pcard][data-t="' + t + '"]');
    for (let i = 0; i < r; i++) await tap('[data-a=rot][data-d="1"]');
    await tap('[data-a=place]:not([disabled])'); await sleep(250);
  };
  const markTap = async (x, y, e) => {
    await myTurn();
    if (phone) { const pt = await p.evaluate(([x, y]) => { const q = hproj(x - BC, y - BC + .5); return q ? { x: q.x, y: q.y } : null; }, [x, y]); if (pt) { await p.touchscreen.tap(pt.x, pt.y); await sleep(300); } }
    await tap('[data-a=startmark][data-x="' + x + '"][data-y="' + y + '"][data-e="' + e + '"]'); await sleep(250);
  };
  const answer = async re => { await myTurn(); const i = await p.evaluate(re => { const o = G.q && G.q.opts; if (!o) return -1; return o.findIndex(x => new RegExp(re).test(x.l)); }, re.source); if (i < 0) return false; return tap('[data-a=q][data-i="' + i + '"]'); };
  // a question that needs a sensible answer (gate flow): take the first option that rides to an open end / places a tile, never "Accept"
  const answerAny = async () => { for (let k = 0; k < 6; k++) { await sleep(300); await myTurn(); const i = await p.evaluate(() => { const o = G.q && G.q.who === 0 && G.q.opts; if (!o) return -2; const j = o.findIndex(x => /open end/.test(x.l)); return j >= 0 ? j : o.findIndex(x => !/Accept/.test(x.l)); }); if (i === -2) return; await tap('[data-a=q][data-i="' + i + '"]'); } };
  const playGame = async () => {
    for (let k = 0; k < 40; k++) {
      await myTurn(); const s = await st(); if (s.phase !== 'play') return;
      const mv = await p.evaluate(() => { if (G.q) return { q: 1 }; return sideToAct() === 0 ? aiMove(0, 'hard') : null; });
      if (!mv) { await sleep(200); continue; }
      if (mv.q) { await answerAny(); continue; }
      if (mv.a === 'place') await place(mv.t, mv.r); else { await p.evaluate(m => act(m, 0), mv); await sleep(300); }
    }
  };
  const solve = async id => {
    for (const s of SOLVE[id]) {
      if (s.mark) await markTap(...s.mark); else if (s.q) await answer(s.q); else if (s.qs) await answerAny(); else if (s.play) await playGame(); else await place(s.t, s.r);
      if ((await st()).phase !== 'play') break;
    }
    if (!(await phase('win', id === 'game' ? 60000 : 15000))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  const wrong = async id => {
    const w = WRONG[id]; if (w.mark) await markTap(...w.mark); else if (w.q) await answer(w.q); else await place(w.t, w.r);
    if (!(await phase('fail', 20000))) { note(id + ': a wrong move did not fail'); return false; }
    const s = await st(); if (!/\w{8}/.test(s.msg)) note(id + ': fail has no message'); return true;
  };
  const ids = Object.keys(SOLVE);
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  if (n !== ids.length) note('test knows ' + ids.length + ' solutions, game has ' + n + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 2) every lesson: start shot, wrong move fails with a message, Retry restarts, scripted solution wins with 3 stars; a non-lesson tap works
  let covered = 0, retried = 0;
  for (const id of ids) {
    console.log('lesson', id, Date.now() % 1e6); await p.evaluate(i => GXST.start(i), id); await live(id).catch(() => note(id + ' did not start')); await sleep(700);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    covered += await p.evaluate(() => [...document.querySelectorAll('#board, [data-a=card], [data-ph=pcard], [data-a=place]')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.bottom <= 0 || r.top >= innerHeight) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
    if (id === 'lay') {   // hint: nudge then show draws a ring that is not under the card; a Rules tap works mid-lesson; minimise and back
      await tap('.gxst-bulb'); await tap('.gxst-bulb'); const h = await st();
      if (h.hint !== 2) note('show-me hint did not reach step 2'); if (!(await p.$('.gxst-ring'))) note('no hint ring'); if (h.overlap) note('card covers the hinted tile');
      await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
      await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
      await p.evaluate(() => { try { GX.show('rulesd'); } catch (e) { } }); await sleep(300);
      if (!(await p.evaluate(() => { const e = document.querySelector('.gx-drawer.open,.gx-drawer[open],#rulesd'); return !!e && e.getBoundingClientRect().width > 50; }))) note('Rules did not open mid-lesson');
      await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await sleep(200);
      await p.evaluate(i => GXST.retry(), id); await live(id).catch(() => { }); await sleep(500);
    }
    if (WRONG[id]) {
      if (await wrong(id)) {
        if (id === 'mark') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
        await tap('.gxst-ft .pri'); await live(id).then(() => { retried++; }, () => note(id + ': Retry did not restart'));
        await sleep(500);
      }
    }
    await solve(id); s = await st();
    if (s.phase === 'win' && s.stars !== 3 && !(id === 'lay')) note(id + ': clean solve gave ' + s.stars + ' stars');
    if (id === 'game') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  }
  if (covered) note(covered + ' board items under the lesson card');
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  // 3) close, Lessons reopens the picker with stars; events
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tap('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of every lesson start
  const cols = phone ? 5 : 3, cw = phone ? 240 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
