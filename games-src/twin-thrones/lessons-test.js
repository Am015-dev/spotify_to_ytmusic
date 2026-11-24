// Twin Thrones scenario lessons test (src/lessons.js on shell/gx-scenario-tutor.js). Pattern of tidewake/game/lessons-test.js.
//   node games-src/twin-thrones/lessons-test.js [sizes=402x874,1366x768]    prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: the picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps (win, 3 stars, no hint); a wrong move ends in
// `fail` with a message and Retry restarts; every tap lands on the element tapped (the card never covers the board); Rules still opens mid-lesson;
// hint -> show draws a ring; minimise/chip, close and Lessons reopen; progress saved; 0 JS errors. Machine speed via scripts/turbo.js.
const PW = (() => { try { return require(process.env.PW_DIR || 'playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const { turbo, budget, tick } = require('../scripts/turbo');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'twin-thrones.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = []; const stop = budget(120000, 'twin-thrones lessons');
// scripted solutions: {pick:wonderId} | {card:id, act:build|discard|wonder} | {token:1} | {play:1}
const SOLVE = {
  board: [{ tour: 1 }], draft: [{ pick: 'w-sky-tomb' }], take: [{ card: 'a1-timber-stand', act: 'build' }], own: [{ card: 'a1-pony-pen', act: 'build' }],
  trade: [{ card: 'a1-barrack-yard', act: 'build' }], chain: [{ card: 'a2-horse-yard', act: 'build' }], sell: [{ card: 'a1-timber-stand', act: 'discard' }],
  war: [{ card: 'a3-war-pavilion', act: 'build' }], pair: [{ card: 'a2-measure-hall', act: 'build' }, { token: 1 }],
  warwin: [{ card: 'a2-city-wall', act: 'build' }], sciwin: [{ card: 'a2-chart-room', act: 'build' }],
  wonder: [{ card: 'a1-lookout', act: 'wonder' }], game: [{ play: 1 }]
};
const WRONG = {
  draft: { pick: 'w-bronze-titan' }, take: { card: 'a1-roadside-inn', act: 'build' }, own: { card: 'a1-bathhouse', act: 'build' },
  trade: { card: 'a1-bathhouse', act: 'build' }, chain: { card: 'a2-sawpit', act: 'build' }, sell: { card: 'a1-pony-pen', act: 'build' },
  war: { card: 'a1-lookout', act: 'build' }, warwin: { card: 'a1-lookout', act: 'build' }, sciwin: { card: 'a1-open-stage', act: 'build' }, pair: { card: 'a1-scribe-room', act: 'build' }, wonder: { card: 'a1-open-stage', act: 'build' }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/');
  await p.waitForFunction(() => window.GXST && window.TTL && GXST.state(), null, { timeout: 30000 });
  await p.evaluate(() => { window.AIDELAY = 40; window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); GXST.picker(); });
  const st = () => p.evaluate(() => GXST.state());
  const wait = async (f, a) => { for (let i = 0; i < 400; i++) { if (await p.evaluate(f, a)) return true; await tick(p, 150); } return false; };
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)), by: u && (u.id || String(u.className).slice(0, 40)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what + ' (' + pt.by + ') at ' + Math.round(pt.x) + ',' + Math.round(pt.y));
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 200); return true;
  };
  const vis = '(sel)=>[...document.querySelectorAll(sel)].find(e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&r.bottom>0&&r.top<innerHeight&&!e.closest("[hidden]")})';
  const tap = sel => tapEl(new Function('s', 'return (' + vis + ')(s)'), sel, sel);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = async want => wait(w => GXST.state().phase === w, want);
  const myTurn = () => wait(() => GXST.state().phase !== 'play' || (!TT_UI.U.busy && !TT_UI.U.narr && TT_UI.E.sideToAct(TT_UI.U.G) === 0));
  const cardSel = id => p.evaluate(id => { const g = TT_UI.U.G; const c = g.pyr.filter(c => c.id === id && !c.taken)[0]; return c ? '#c' + c.i : null; }, id);
  const doCard = async (id, act) => {
    await myTurn(); if ((await st()).phase !== 'play') return;
    const sel = await cardSel(id); if (!sel) { note('card not on the board: ' + id); return; }
    await tap(sel); await tick(p, 200); await tap('#zoom [data-a="' + act + '"]:not([disabled])'); await tick(p, 300);
  };
  const doPick = async w => { await myTurn(); await tap('[data-pick="' + w + '"]'); await tick(p, 300); };
  const doTour = async () => {   // W771 board tour: every step's bubble sits next to (touches) the region it names, then a tap goes on
    for (let k = 0; k < 20 && await p.$('#tt-tour'); k++) {
      const g = await p.evaluate(() => { const b = document.querySelector('#tt-tour .bub'), h = document.querySelector('.tt-hl'); if (!b || !h) return null; const r = b.getBoundingClientRect(), t = h.getBoundingClientRect(), f = parseFloat(getComputedStyle(b).fontSize); const gap = Math.max(t.top - r.bottom, r.top - t.bottom, t.left - r.right, r.left - t.right); return { gap: Math.round(gap), f, words: b.querySelector('.tx').textContent.split(/\s+/).length, tx: b.querySelector('.tx').textContent }; });
      if (g) { if (g.gap > 20) note('tour bubble ' + g.gap + 'px from its region: ' + g.tx); if (g.words > 15) note('tour step over 15 words: ' + g.tx); if (g.f < (phone ? 12 : 16)) note('tour text ' + g.f + 'px'); }
      await tap('#tt-tour .bub'); await tick(p, 150);
    }
    if (await p.$('#tt-tour')) note('tour did not end');
  };
  const doToken = async () => { await myTurn(); await tap('[data-token]'); await tick(p, 300); };
  const playGame = async () => {
    for (let k = 0; k < 14; k++) {
      await myTurn(); if ((await st()).phase !== 'play') return;
      const mv = await p.evaluate(() => { const g = TT_UI.U.G, E = TT_UI.E, M = E.validMoves(g); if (!M.length) return null; const val = m => { const c = TT_UI.BY[g.pyr[m.i] && g.pyr[m.i].id]; return m.t === 'build' ? 10 + ((c && c.vp) || 0) : m.t === 'wonder' ? 8 : 0; }; M.sort((a, b) => val(b) - val(a)); const m = M[0]; return { t: m.t, id: m.i != null ? g.pyr[m.i].id : null, w: m.w, tk: m.id }; });
      if (!mv) return;
      if (mv.t === 'token') await doToken(); else await doCard(mv.id, mv.t);
    }
  };
  const solve = async id => {
    for (const s of SOLVE[id]) {
      if (s.tour) await doTour(); else if (s.pick) await doPick(s.pick); else if (s.token) await doToken(); else if (s.play) await playGame(); else await doCard(s.card, s.act);
      if ((await st()).phase !== 'play') break;
    }
    if (!(await phase('win'))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')' + (process.env.DBG ? JSON.stringify(await p.evaluate(() => { const U = TT_UI.U, g = U.G; return { busy: U.busy, narr: U.narr, side: TT_UI.E.sideToAct(g), over: g.over, w: g.winner, left: g.pyr.filter(c => !c.taken).length, sc: [TT_UI.E.score(g, 0).total, TT_UI.E.score(g, 1).total], res: !document.getElementById('res').hidden }; })) : '')); }
  };
  const wrong = async id => {
    const w = WRONG[id]; if (w.pick) await doPick(w.pick); else await doCard(w.card, w.act);
    if (!(await phase('fail'))) { note(id + ': a wrong move did not fail'); return false; }
    const s = await st(); if (!/\w{4}/.test(s.msg)) note(id + ': fail has no message'); return true;
  };
  const ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').indexOf(k) >= 0);
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  if (!process.env.ONLY && n !== ids.length) note('test knows ' + ids.length + ' solutions, game has ' + n + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  let covered = 0, retried = 0;
  for (const id of ids) {
    await p.evaluate(i => GXST.start(i), id); await live(id).catch(() => note(id + ' did not start')); await myTurn(); await tick(p, 1500);
    if (process.env.DBG) console.log(id, JSON.stringify(await p.evaluate(() => ({ c: GXST.state().card, ih: innerHeight, sy: scrollY, ob: document.body.getBoundingClientRect().height, de: document.documentElement.scrollHeight })))); shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    covered += await p.evaluate(() => [...document.querySelectorAll('#pyr .card.av, [data-pick]')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.bottom <= 0 || r.top >= innerHeight) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
    if (id === 'take') {   // hint: nudge then show draws a ring; Rules opens mid-lesson; minimise and back
      await tap('.gxst-bulb'); await tick(p, 1500); await tap('.gxst-bulb'); await tick(p, 1500); const h = await st();
      if (h.hint !== 2) note('show-me hint did not reach step 2'); if (!(await p.$('.gxst-ring'))) note('no hint ring'); if (h.overlap) note('card covers the hinted card');
      await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
      await tick(p, 1500); await tap('.gxst-chip'); await tick(p, 500); if ((await st()).min) note('chip did not restore');
      await p.evaluate(() => { try { GX.show('rulesd'); } catch (e) { } }); await tick(p, 300);
      if (!(await p.evaluate(() => { const e = document.querySelector('.gx-drawer.open,.gx-drawer[open],#rulesd'); return !!e && e.getBoundingClientRect().width > 50; }))) note('Rules did not open mid-lesson');
      await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await tick(p, 200);
      await p.evaluate(() => GXST.retry()); await live(id).catch(() => { }); await myTurn(); await tick(p, 300);
    }
    if (WRONG[id]) {
      if (await wrong(id)) {
        if (id === 'chain') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
        await tap('.gxst-ft .pri'); await live(id).then(() => { retried++; }, () => note(id + ': Retry did not restart')); await myTurn(); await tick(p, 300);
      }
    }
    await solve(id); s = await st();
    if (s.phase === 'win' && s.stars !== 3 && id !== 'take') note(id + ': clean solve gave ' + s.stars + ' stars');
    if (id === 'game') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  }
  if (covered) note(covered + ' board items under the lesson card');
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await p.evaluate(() => GXST.picker()); await tick(p, 200); if (!(await p.$('.gxst-q'))) note('no Lessons button'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  const cols = phone ? 5 : 3, cw = phone ? 240 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); clearTimeout(stop); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
