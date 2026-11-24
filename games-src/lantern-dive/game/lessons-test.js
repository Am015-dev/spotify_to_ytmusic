// Lantern Dive scenario lessons (lessons.js) test, pattern of shell/gxst-test.js.
//   node games-src/lantern-dive/game/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: picker lists every lesson; every lesson fails on a wrong move with a message and Retry restarts it, then is solved by its scripted
// solution with real taps (3 stars, no hint); the player can tap anything (cards, jobs, buttons never under the lesson card; Rules opens
// mid-lesson); hint nudge then show ring; minimise/drag/close/reopen; progress saved; 0 JS errors.
// Contact sheet of every lesson start per size: games-src/lantern-dive/proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// hand card / job / button taps per lesson: [wrong, ...right]
const T = { hand: c => ({ hand: c }), job: id => ({ job: id }), btn: s => ({ btn: s }) };
const SOLVE = {
  lead: { wrong: [T.hand('K1')], right: [T.hand('K9')] },
  follow: { wrong: [T.hand('K9')], right: [T.hand('C9')] },
  void: { wrong: [T.hand('L1')], right: [T.hand('K9')] },
  trump: { wrong: [T.hand('L1')], right: [T.hand('L3')] },
  duck: { wrong: [T.hand('K9')], right: [T.hand('K3')] },
  jobs: { wrong: [T.job(56)], right: [T.job(53)] },
  ping: { wrong: [T.btn('signal'), T.hand('K7'), T.btn('pingok')], right: [T.btn('signal'), T.hand('C3'), T.btn('pingok')] },
  flare: { wrong: [T.btn('dist-off')], right: [T.btn('dist-left'), T.hand('C3')] },
  dive: { wrong: [T.hand('L4')], right: 'dive' }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1' + (phone ? '&phone=1' : ''));
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { try { AIDELAY = 0; ANIM = 0; } catch (e) { } window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; e.scrollIntoView && e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(220); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel);
  const tapHand = c => tapEl(c => { const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }, id = D.card(L[c[0]], +c.slice(1)); return document.querySelector('#hand .hc[data-id="' + id + '"]'); }, c, 'card ' + c);
  const tapJob = id => tapEl(id => [...document.querySelectorAll('#pool .jcard')].find(e => G.tasks[+e.dataset.i].id === id), id, 'job ' + id);
  const myTurn = () => p.waitForFunction(() => typeof canAct === 'function' && canAct() && !UI.busy && !UI.cards.length, null, { timeout: 15000 }).then(() => true, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  const doStep = async s => {
    if (s.hand) return tapHand(s.hand);
    if (s.job) return tapJob(s.job);
    if (s.btn === 'dist-off') return tap('#acts [data-a="dist"][data-on="false"]');
    if (s.btn === 'dist-left') return tap('#acts [data-a="dist"][data-on="true"][data-dir="1"]');
    return tap('#acts [data-a="' + s.btn + '"]');
  };
  const play = async (id, steps) => {
    if (steps === 'dive') {   // real play: lead low so the crewmate wins trick 1, then take the Lantern 3 on the first chance
      for (let n = 0; n < 12; n++) {
        if ((await st()).phase !== 'play') break; await myTurn(); if ((await st()).phase !== 'play') break;
        const c = await p.evaluate(() => { const lg = LD.playable(G, 0), L3 = D.card(4, 3), k = G.tricks.length; if (k === 0) return D.card(2, 3); if (lg.includes(L3)) return L3; return lg[0]; });
        const code = await p.evaluate(c => 'CTKSL'[c < 36 ? (c / 9) | 0 : 4] + (c < 36 ? c % 9 + 1 : c - 35), c);
        await tapHand(code); await sleep(150);
      }
      return;
    }
    for (const s of steps) { await myTurn(); await doStep(s); }
  };
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n !== ids.length) note('picker shows ' + n + ' of ' + s.count + ' lessons, test knows ' + ids.length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await sleep(300);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    const q = await p.evaluate(() => ({ card: !!document.querySelector('.gxst-card'), g: (document.querySelector('.gxst-goal') || {}).textContent || '' }));
    if (!q.card) note(id + ': no objective card');
    if (i === 0) {   // tap anything: every hand card is uncovered, Rules opens mid-lesson; hint nudge then show ring
      const covered = await p.evaluate(() => [...document.querySelectorAll('#hand .hc, #pool .jcard, #acts button')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
      if (covered) note(covered + ' board items under the lesson card');
      await tap('[data-gx="rulesd"]'); await sleep(300);
      const opened = await p.evaluate(() => document.querySelector('[data-gx="rulesd"]').getAttribute('aria-expanded') === 'true' || !!document.querySelector('.gx-drawer[open], .gxh-card, .drawer.open'));
      if (!opened) note('non-lesson tap (Rules) did nothing');
      await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } }); await sleep(300);
      await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
      if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await p.evaluate(id => GXST.start(id), id); await live(id); await sleep(300);   // hints cost stars: start clean for the 3-star check
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-lantern-dive') || '{}'); b.best = {}; localStorage.setItem('gxst-lantern-dive', JSON.stringify(b)); });
    }
    // wrong move -> fail with a message, Retry restarts it
    await play(id, SOLVE[id].wrong === 'x' ? [] : SOLVE[id].wrong);
    if (!(await phase('fail', 14000))) { note(id + ': a wrong move did not fail'); await p.evaluate(() => GXST.retry()); }
    else {
      s = await st(); if (!/\w{4}/.test(s.msg || '') || !/\S/.test(await p.textContent('.gxst-msg'))) note(id + ': fail has no message');
      if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
      await tap('.gxst-ft .pri');
    }
    await live(id).catch(() => note(id + ': Retry did not restart')); await sleep(200);
    // the scripted solution wins with 3 stars
    await play(id, SOLVE[id].right);
    if (!(await phase('win', 16000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (s.stars !== 3) note(id + ': clean solve gave ' + s.stars + ' stars; plays ' + await p.evaluate(() => JSON.stringify([G.tricks.map(t => t.plays.map(x => x.s + ':' + x.c)), G.trick && G.trick.plays.map(x => x.s + ':' + x.c)]))); }
    if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  }
  // 2) minimise / chip / drag / close / reopen, progress saved
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await sleep(300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-lantern-dive')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tap('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const cols = phone ? 5 : 3, cw = phone ? 250 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
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
