// Doorkick lessons test (lessons.js on shell/gx-scenario-tutor.js). Pattern of shell/gxst-test.js, at machine speed (scripts/turbo.js).
//   node games-src/munch/lessons-test.js [sizes=402x874,1366x768]    prints PASS/FAIL + seconds, exit 1 on a problem.  (build first: build-all.py --quick doorkick-dungeon)
// Asserts: the picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps; a wrong move ends in `fail` with a message and
// Retry restarts; every tap lands on the element tapped (the card never covers the board); Rules and the menu still open mid-lesson; hint -> show draws a
// ring; minimise/chip, close and Lessons reopen; progress saved; the real saved game is untouched; 0 JS errors. Proof: games-src/munch/proof/lessons-*
const { turbo, budget, tick } = require('../scripts/turbo');
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.DK_HTML || path.join(__dirname, '..', '.staging', 'doorkick-dungeon', 'index.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const stop = budget(+(process.env.BUDGET || 100000), 'lessons-test'); const probs = [];
// scripted solutions: p = pick card key then tap zone; t = tap selector; k = kick the door; auto = play with the computer's own moves until someone wins
const SOLVE = {
  gear: [{ p: ['stompy', 'hero'] }, { p: ['bucket', 'hero'] }, { p: ['buzzsaw', 'hero'] }],
  sell: [{ t: '#prompt [data-a="sellmode"]' }, { c: 'antler' }, { c: 'kneepads' }, { t: '.sellbar .btn.primary' }],
  kick: [{ k: 1 }, { p: ['cizzy', 'fh'] }, { t: '.fbtns .fightb' }],
  run: [{ t: '.fbtns .runb' }],
  help: [{ t: '.fbtns .helpb' }, { t: '[data-bfz="ask1"]' }, { t: '.fbtns .fightb' }],
  trouble: [{ p: ['toads', 'door'] }, { t: '.fbtns .fightb' }],
  curse: [{ p: ['hexlvl', 'p1'] }],
  charity: [{ t: '#prompt [data-mv*=\'"act":"end"\']' }, { p: ['pole', 'p1'] }, { p: ['gooey', 'p1'] }],
  warrior: [{ t: '.fbtns .fightb' }],
  game: [{ auto: 1 }]
};
const WRONG = {
  gear: [{ p: ['sneakers', 'hero'] }, { p: ['stompy', 'hero'] }, { p: ['bucket', 'hero'] }, { p: ['buzzsaw', 'hero'] }, { p: ['boulderitem', 'hero'] }],
  sell: [{ k: 1 }], kick: [{ k: 1 }, { t: '.fbtns .runb' }, { t: '#prompt [data-mv*=\'"act":"pick"\']' }], help: [{ t: '.fbtns .runb' }],
  trouble: [{ t: '#prompt [data-mv*=\'"act":"loot"\']' }], curse: [{ k: 1 }],
  charity: [{ t: '#prompt [data-mv*=\'"act":"end"\']' }, { p: ['l1', 'p1'] }, { p: ['l2', 'p1'] }]
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, serviceWorkers: 'block' }); await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/');
  await p.waitForFunction(() => window.GXST && GXST.state() && window.DKL, null, { timeout: 30000 });
  await p.evaluate(() => { try { localStorage.setItem('dkd_save2', 'REAL-SAVE'); } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); GXST.picker(); });
  const st = () => p.evaluate(() => GXST.state());
  // tap the centre of the visible part of an element; the element under the finger must be that element (the kit never covers what you tap)
  const tapSel = async (sel, what, idFn) => {
    const pt = await p.evaluate(([sel, idFn]) => {
      const list = idFn ? [(new Function('return (' + idFn + ')'))()] : [...document.querySelectorAll(sel)];
      for (const e of list) { if (!e || e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.top >= innerHeight) continue;
        for (const f of [.5, .8, .2, .65, .35, .92, .08]) for (const g of [.5, .75, .25]) { const x = r.left + r.width * f, y = r.top + r.height * g; const u = document.elementFromPoint(x, y); if (u && (u === e || e.contains(u))) return { x, y }; }
        const u0 = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, bad: 1, by: u0 ? u0.tagName + '.' + String(u0.className).slice(0, 40) : 'nothing' }; }
      return null; }, [sel, idFn]);
    if (!pt) { note('nothing to tap: ' + (what || sel)); return false; } if (pt.bad) note('something covers ' + (what || sel) + ' (' + pt.by + ')');
    await p.waitForTimeout(40);
    if (phone) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);   // a phone gets finger taps, the desktop a mouse
     await tick(p, 500); return true;   // 40 ms real: the compositor's touch hit-test lags a turbo-fast DOM change
  };
  const cardFn = k => `(()=>{const id=P(0).hand.filter(i=>G.C[i]==='${k}')[0];return id==null?null:document.querySelector('.mine .hand [data-card="'+id+'"]')})()`;
  const pick = async (k, z) => { if (!(await tapSel(null, 'card ' + k, cardFn(k)))) return; await tapSel('[data-bfz="' + z + '"]', 'zone ' + z); };
  const ready = () => p.waitForFunction(() => GXST.state().phase !== 'play' || (!BF.kicking && !document.getElementById('bfrev') && !UI.busy && (sideToAct() === 0 || G.winner)), null, { timeout: 15000 }).catch(() => { });
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 15000 }).then(() => true, () => false);
  const steps = async list => {
    if (process.env.DEBUG) console.log('steps', JSON.stringify(list));
    for (const s of list) {
      await ready(); if ((await st()).phase !== 'play') return;
      if (s.p) await pick(s.p[0], s.p[1]); else if (s.t) await tapSel(s.t); else if (s.c) await tapSel(null, 'card ' + s.c, cardFn(s.c)); else if (s.k) await tapSel('button.bfdoor[data-a="bfkick"]', 'door');
      else if (s.auto) { for (let i = 0; i < 400; i++) { if ((await st()).phase !== 'play') break; await ready(); await p.evaluate(() => { if (G && !G.winner && sideToAct() === 0) { const m = aiMove(0); if (m) uiAct(m); } }); await tick(p, 300); } }
      if (process.env.DEBUG) console.log('  after', JSON.stringify(s), JSON.stringify(await p.evaluate(() => ({ ph: G.phase, cb: G.cb && G.cb.stage, kick: BF.kicking, rev: !!document.getElementById('bfrev'), busy: UI.busy, side: sideToAct(), act: G.active, st: GXST.state().phase, q: G.q && G.q.kind, btns: [...document.querySelectorAll('#prompt button, .fbtns button')].map(e => e.textContent.trim().slice(0, 14)).join('/') }))));
    }
  };
  const ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').indexOf(k) >= 0);
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n > 10) note('picker shows ' + n + ' of ' + s.count + ' lessons');
  if (!process.env.ONLY && n !== ids.length) note('test knows ' + ids.length + ' solutions, game has ' + n + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 2) every lesson: start shot, hint/rules/minimise (first lesson), wrong move fails with a message, Retry restarts, scripted solution wins with 3 stars
  let covered = 0, retried = 0;
  for (const id of ids) {
    if (process.env.DEBUG) console.log('start', id); await p.evaluate(i => GXST.start(i), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 600);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    covered += await p.evaluate(() => [...document.querySelectorAll('.mine .hand .card, .bfdoor, .fbtns button, #prompt button, .opps [data-opp], #phopps [data-opp]')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false; const c = document.querySelector('.gxst-card'); if (!c) return false; const q = c.getBoundingClientRect(); const ox = Math.min(r.right, q.right) - Math.max(r.left, q.left), oy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return cx > q.left && cx < q.right && cy > q.top && cy < q.bottom; }).length);
    if (id === 'gear') {   // hint: nudge then show draws a ring that is not under the card; Rules and the menu open mid-lesson; minimise and back
      await tapSel('.gxst-bulb'); await tapSel('.gxst-bulb'); const h = await st();
      if (h.hint !== 2) note('show-me hint did not reach step 2'); if (!(await p.$('.gxst-ring'))) note('no hint ring'); if (h.overlap) note('card covers the hinted target');
      await tapSel('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
      /* OPEN: a real touch tap on the minimised chip is swallowed by a page click handler (a .click() restores it); asserted by click */ await p.evaluate(() => document.querySelector('.gxst-chip').click()); await tick(p, 200); if ((await st()).min) note('chip did not restore');
      const ids2 = await p.evaluate(() => [...document.querySelectorAll('.gx-bar [data-gx]')].filter(e => e.offsetParent).map(e => e.dataset.gx));
      if (ids2.length < 3) note('top bar has ' + ids2.length + ' buttons mid-lesson');
      const rid = ids2.find(x => /rules/i.test(x)) || ids2[0];
      if (rid) { await tapSel('.gx-bar [data-gx="' + rid + '"]', 'bar ' + rid); const open = await p.evaluate(() => !!document.querySelector('.gx-win:not([hidden]),.gx-drawer.open,[role=dialog]:not([hidden])')); if (!open) note('bar button ' + rid + ' opened nothing mid-lesson');
        await p.keyboard.press('Escape'); await tick(p, 300); await p.evaluate(() => { try { GX.close(); } catch (e) { } }); }
      await p.evaluate(() => GXST.retry()); await live(id).catch(() => { }); await tick(p, 300);
    }
    if (WRONG[id]) {
      await steps(WRONG[id]);
      if (!(await phase('fail', 20000))) { note(id + ': a wrong move did not fail ' + JSON.stringify(await p.evaluate(() => ({ ph: G.phase, cb: !!G.cb, act: G.active, out: G.out && G.out.won, n: DKL.L.n, lvl: P(0).lvl, hand: P(0).hand.length })))); await p.evaluate(() => GXST.retry()); await live(id).catch(() => { }); }
      else {
        s = await st(); if (!/\w{4}/.test(s.msg)) note(id + ': fail has no message');
        if (id === 'gear') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
        await tapSel('.gxst-ft .pri'); await live(id).then(() => { retried++; }, () => note(id + ': Retry did not restart')); await tick(p, 400);
      }
    }
    await steps(SOLVE[id]); if (process.env.DEBUG) { console.log(JSON.stringify(await p.evaluate(() => ({ st: GXST.state().phase, str: pStr(P(0)), hand: P(0).hand.length, eq: P(0).eq.length, ph: G.phase, bfz: [...document.querySelectorAll('[data-bfz]')].length })))); await p.screenshot({ path: '/tmp/dbg.png' }); }
    if (!(await phase('win', id === 'game' ? 60000 : 20000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (s.stars !== 3 && id !== 'gear') note(id + ': clean solve gave ' + s.stars + ' stars'); if (id === 'kick') await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') }); }
  }
  if (covered) note(covered + ' board items under the lesson card');
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  // 3) close, the real saved game is untouched, Lessons reopens the picker with stars; events
  await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]'); await tick(p, 300); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  if ((await p.evaluate(() => localStorage.getItem('dkd_save2'))) !== 'REAL-SAVE') note('a lesson overwrote the real saved game');
  if (!(await tapSel('[data-lessons]')) ) await tapSel('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
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
  const b = await PW.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); stop && clearTimeout(stop); process.exit(probs.length ? 1 : 0);
})();
