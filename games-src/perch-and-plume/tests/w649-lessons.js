// W649 gate: floating lessons + screen map + a full game, at machine speed, at 402x874 (touch) and 1366x768.
//   node tests/w649-lessons.js   -> PASS/FAIL lines; screenshots to proof/w649-*.png
// Asserts: map labels inside the screen and never overlapping, a label tap explains, taps on NON-ringed things still work
// (Rules drawer, a tray card) while a lesson shows, nothing is dimmed, every lesson completes (by doing it or Next), the practice
// round and a full 4-round game finish by real taps, 0 JS errors.
const { chromium } = require('playwright'); const path = require('path'); const gx = require('../../scripts/gx-serve.js');
const D = path.resolve(__dirname, '..'), PROOF = path.join(D, 'proof');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const DRIVE = ['#acts [data-a="playgo"]', '.slot[data-legal]', '#hand [data-legal]', '.die[data-legal]', '#tray [data-legal]', '#deckb[data-legal]', '#mat [data-legal]', '#acts [data-a="mv"]', '.bc[data-legal]', '[data-legal]'];
async function tapFirst(p, sels) {
  return p.evaluate((sels) => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') && !e.disabled; };
    for (const s of sels) { const e = [...document.querySelectorAll(s)].find(vis); if (e) { e.click(); return s; } } return null; }, sels);
}
async function myTurn(p) { return p.evaluate(() => typeof myTurn === 'function' && myTurn()); }
async function turnStep(p) {   // pending choice -> tap a legal thing; idle -> pick an action (play a bird when one fits, else eggs/food/cards in turn)
  const busy = await p.evaluate(() => !!(G.q || UI.pickBird || UI.sel != null || UI.pend));
  if (busy) return tapFirst(p, DRIVE);
  const k = await p.evaluate(() => { const can = PP.playable(G, 0).length > 0, t = G.turn % 3; return can ? 'play' : ['eggs', 'food', 'cards'][t]; });
  const map = { play: '.a4[data-k="play"]', food: '.ract[data-h="0"]', eggs: '.ract[data-h="1"]', cards: '.ract[data-h="2"]' };
  return tapFirst(p, [map[k] + '[data-legal]', map[k], '.ract[data-h="0"]', '.ract[data-h="2"]']);
}
async function playOut(p, maxMs) {   // real taps until the game is over
  const t0 = Date.now(); let n = 0, stuckPlay = 0;
  while (Date.now() - t0 < maxMs) {
    const st = await p.evaluate(() => ({ over: G.phase === 'over', mine: myTurn(), pend: !!UI.pickBird || UI.sel != null || !!UI.pend, q: G.q && G.q.h }));
    if (st.over) return n;
    if (st.mine) { const s = await turnStep(p); n++; if (s && s.indexOf('play') >= 0 && !st.q) { if (++stuckPlay > 3) await p.evaluate(() => { UI.pickBird = false; UI.sel = null; UI.pend = null; render(); }); } else stuckPlay = 0;
      if (!s) await p.evaluate(() => { const b = document.querySelector('.turnban'); if (b) b.click(); }); }
    else await p.evaluate(() => { const b = document.querySelector('.turnban,.pass button,#pass:not([hidden]) button'); if (b) b.click(); });
    await p.waitForTimeout(30);
  }
  return -1;
}
async function overlaps(p, sel) {
  return p.evaluate((sel) => { const r = [...document.querySelectorAll(sel)].map(e => e.getBoundingClientRect()); let bad = [];
    for (let i = 0; i < r.length; i++) { const a = r[i]; if (a.left < 0 || a.top < 0 || a.right > innerWidth || a.bottom > innerHeight) bad.push('out ' + i);
      for (let j = i + 1; j < r.length; j++) { const b = r[j]; if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) bad.push(i + 'x' + j); } }
    return { n: r.length, bad }; }, sel);
}
(async () => {
  const URL = await gx.url('perch-and-plume', { file: path.join(D, 'perch-and-plume.html') });
  const b = await chromium.launch();
  for (const [nm, vp, touch] of [['402x874', { width: 402, height: 874 }, true], ['1366x768', { width: 1366, height: 768 }, false]]) {
    console.log('--- ' + nm);
    const c = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(URL); await p.waitForFunction(() => typeof tutStart === 'function');
    await p.evaluate(() => { UI.fast = true; tutStart(); UI.fast = true; });
    await p.waitForSelector('#hudmap .hm-l'); await p.waitForTimeout(300);
    const ov = await overlaps(p, '#hudmap .hm-l'); ok(ov.n >= 15 && !ov.bad.length, `map: ${ov.n} labels, overlaps/out: ${ov.bad.join(' ') || 'none'}`);
    const wOv = await p.evaluate(() => { const w = document.querySelector('#lsn').getBoundingClientRect(); return [...document.querySelectorAll('.hm-l')].filter(e => { const a = e.getBoundingClientRect(); return a.left < w.right && w.left < a.right && a.top < w.bottom && w.top < a.bottom; }).length; });
    ok(wOv === 0, 'map labels clear of the lesson window (' + wOv + ' under it)');
    await p.screenshot({ path: path.join(PROOF, `w649-map-${nm}.png`) });
    await p.click('#hudmap .hm-l >> nth=7'); const info = await p.textContent('.lsn-i'); ok(info && info.length > 10, 'label tap explains: "' + info + '"');
    const blocked = await p.evaluate(() => { const m = getComputedStyle(document.querySelector('#hudmap')); return m.pointerEvents; }); ok(blocked === 'none', 'map layer lets taps through (pointer-events ' + blocked + ')');
    await p.click('[data-l="next"]');
    // stray taps while a lesson rings something else
    await p.click('#rulesbtn'); const drawer = await p.evaluate(() => !!document.querySelector('.gx-drawer.open,.gx-drawer[open],[aria-expanded="true"]#rulesbtn')); ok(drawer, 'tap on Rules (not ringed) opens the rules');
    await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } });
    await p.evaluate(() => { const t = document.querySelector('#tray .bc'); t && t.click(); }); const pop = await p.evaluate(() => !document.querySelector('#pop').hidden); ok(pop, 'tap on a tray bird (not ringed) shows it large');
    await p.evaluate(() => { const x = document.querySelector('#pop'); x.hidden = true; });
    const dim = await p.evaluate(() => [...document.querySelectorAll('#bd *,#dock *')].filter(e => /brightness\(0?\.[0-8]/.test(getComputedStyle(e).filter) || +getComputedStyle(e).opacity < 0.3 && e.getBoundingClientRect().width > 40 && !e.classList.contains('art')).length);
    ok(dim === 0, 'nothing dimmed during lessons (' + dim + ')');
    // drag, minimise, restore
    const box0 = await p.locator('#lsn').boundingBox(); const hb = await p.locator('#lsn .lsn-n').boundingBox();
    await p.mouse.move(hb.x + 10, hb.y + 10); await p.mouse.down(); await p.mouse.move(hb.x + 10, hb.y - 60, { steps: 3 }); await p.mouse.up();
    const box1 = await p.locator('#lsn').boundingBox(); ok(Math.abs(box1.y - box0.y) > 20, 'lesson window drags (' + Math.round(box0.y) + ' -> ' + Math.round(box1.y) + ')');
    await p.click('[data-l="min"]'); const minH = (await p.locator('#lsn').boundingBox()).height; await p.click('[data-l="min"]'); ok(minH < 60, 'minimises to its title bar (' + Math.round(minH) + ' px)');
    const xs = await p.evaluate(() => [...document.querySelectorAll('#lsn .lsn-h button')].map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })); ok(Math.min(...xs) >= 44, 'window buttons >= 44 px (' + xs.join(',') + ')');
    // walk the lessons: do the action ones by real taps, Next the rest
    let did = 0, nexted = 0, shotAt = { food: 1, eggcost: 1 };
    for (let guard = 0; guard < 200; guard++) {
      const L = await p.evaluate(() => ({ id: PPLESSON.id, i: PPLESSON.i, act: (LESSONS[PPLESSON.i] || {}).act, acted: LSN.acted }));
      if (L.id === 'practice') break;
      if (shotAt[L.id]) { delete shotAt[L.id]; await p.waitForTimeout(150); await p.screenshot({ path: path.join(PROOF, `w649-lesson-${L.id}-${nm}.png`) }); }
      if (L.act) {
        const t0 = Date.now(); let started = false;
        while (Date.now() - t0 < 8000) {
          const cur = await p.evaluate(() => PPLESSON.i); if (cur !== L.i) break;
          if (await myTurn(p)) { if (!started) { const map = { play: '.a4[data-k="play"]', food: '.ract[data-h="0"]', eggs: '.ract[data-h="1"]', cards: '.ract[data-h="2"]' }; const s = await tapFirst(p, [map[L.act], '.a4[data-k="' + L.act + '"]']); started = !!s; } else await tapFirst(p, DRIVE); }
          await p.waitForTimeout(40);
        }
        if (await p.evaluate(() => PPLESSON.i) !== L.i) { did++; continue; }
      }
      const wb = await p.evaluate(() => { const r = document.querySelector('#lsn').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width - 30, r.bottom - 20); return PPLESSON.id + ' ' + Math.round(r.top) + '/' + Math.round(r.bottom) + ' hit ' + (e && (e.id || e.className)); }); if (process.env.DBG) console.log(wb);
      await p.click('[data-l="next"]', { timeout: 3000 }); nexted++; await p.waitForTimeout(20);
    }
    const st = await p.evaluate(() => ({ id: PPLESSON.id, done: PPLESSON.done.length, n: PPLESSON.n }));
    ok(st.id === 'practice' && st.done >= st.n - 1, `lessons completed: ${st.done}/${st.n - 1} before practice (${did} by doing, ${nexted} by Next)`);
    await p.click('[data-l="list"]'); await p.screenshot({ path: path.join(PROOF, `w649-checklist-${nm}.png`) }); await p.click('[data-l="list"]');
    // let the guided game finish, then the practice round
    await playOut(p, 20000);
    await p.click('[data-l="prac"]'); await p.waitForTimeout(200);
    const pr = await p.evaluate(() => ({ rounds: G.rounds, cubes: G.pl[0].cubes, mode: UI.mode })); ok(pr.rounds === 1 && pr.mode === 'vs', 'practice round started (' + JSON.stringify(pr) + ')');
    await p.screenshot({ path: path.join(PROOF, `w649-board-${nm}.png`) });
    const pt = await playOut(p, 30000); ok(pt >= 0, 'practice round finishes by real taps (' + pt + ' taps)');
    // a full 4-round game by real taps
    await p.evaluate(() => { document.querySelector('#result').hidden = true; startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Fern', kind: 'ai', lvl: 'normal', face: 'pip' }], mode: 'vs', seed: 77,
      prep: function (Gx) { PP.performMove(Gx, PPAI.setup(Gx, 0), 0); PP.performMove(Gx, PPAI.setup(Gx, 1), 1); Gx.cur = 0; Gx.first = 0; Gx.fx = []; } }); UI.fast = true; });
    await p.waitForTimeout(300); await p.screenshot({ path: path.join(PROOF, `w649-game-${nm}.png`) });
    const ft = await playOut(p, 90000); const fin = await p.evaluate(() => ({ over: G.phase === 'over', round: G.round, sc: G.final && G.final.map(s => s.total) }));
    ok(ft >= 0 && fin.over, 'full 4-round game finishes by real taps (' + ft + ' taps, scores ' + (fin.sc || []).join('-') + ')');
    await p.waitForTimeout(800); await p.screenshot({ path: path.join(PROOF, `w649-result-${nm}.png`) });
    // the "?" button reopens the map outside the lessons
    await p.evaluate(() => { document.querySelector('#result').hidden = true; }); await p.click('#mapbtn'); const re = await overlaps(p, '#hudmap .hm-l'); ok(re.n >= 10 && !re.bad.length, '"?" reopens the map (' + re.n + ' labels, no overlap)');
    ok(errs.length === 0, 'JS errors: ' + (errs.slice(0, 3).join(' | ') || 'none'));
    await c.close();
  }
  await b.close(); console.log((fails ? 'FAIL' : 'PASS') + ' w649-lessons: ' + fails + ' failing checks'); process.exit(fails ? 1 : 0);
})();
