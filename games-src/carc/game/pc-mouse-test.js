// pc-mouse-test.js: the PC layout by mouse at 1366x768 and 1920x1080: side panel, big board, text >= 12 px, rotate / drag / place / follower / skip all clickable.
//   node pc-mouse-test.js [shotDir]
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const fail = (...a) => { bad++; console.log('FAIL', ...a); };
(async () => {
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of [[1366, 768], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }), p = await ctx.newPage(), errs = []; const tag = W + 'x' + H;
    p.on('pageerror', e => errs.push(e.message)); await p.goto(URL); await sleep(1200);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } AIDELAY = 30; UI.speed = 30; UI.offered = true; setSeed(5); beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {} }); });
    await sleep(900);
    const lay = await p.evaluate(() => { const R = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect() };
      const b = R('#board'), sd = R('#side'), h = R('#hand'), st = R('#status'), g = R('#goal');
      return { wide: document.documentElement.classList.contains('wide'), boardW: b && b.width, sideW: sd && sd.width, handInSide: !!document.querySelector('#side #hand'), seatsInSide: !!document.querySelector('#side #seats'), statusInSide: !!document.querySelector('#side #status'), goalInSide: !!document.querySelector('#side #goal'), goalOverBoard: !!(g && b && g.left < b.right && g.right > b.left && g.top < b.bottom && g.bottom > b.top) }; });
    console.log(tag, JSON.stringify(lay));
    if (!lay.wide || !lay.handInSide || !lay.seatsInSide || !lay.statusInSide) fail(tag, 'side panel missing');
    if (lay.goalOverBoard) fail(tag, 'goal card covers the board');
    if (!(lay.boardW > W * 0.6)) fail(tag, 'board too narrow', lay.boardW);
    await p.mouse.click(60, 140); await sleep(500);   // a tap on empty table closes the goal sheet
    if (await p.evaluate(() => !!document.querySelector('#goal'))) fail(tag, 'goal sheet did not close on a board tap');
    // text >= 12 px
    const small = await p.evaluate(() => [...document.querySelectorAll('#app *')].filter(e => e.children.length === 0 && e.textContent.trim() && e.offsetParent && getComputedStyle(e).visibility !== 'hidden').filter(e => parseFloat(getComputedStyle(e).fontSize) < 12).map(e => e.className + ':' + e.textContent.trim().slice(0, 16)));
    if (small.length) fail(tag, 'text under 12 px', small.slice(0, 6).join(' | '));
    // rotate by mouse (only meaningful if the tile can turn)
    const info = await p.evaluate(() => ({ rots: UI.rots.length, rot: UI.rot }));
    if (info.rots > 1) { await p.click('#htile'); await sleep(300); const r2 = await p.evaluate(() => UI.rot); if (r2 === info.rot) fail(tag, 'mouse click did not rotate'); }
    // drag the tile onto a glow
    const tgt = await p.evaluate(() => { const g = [...document.querySelectorAll('#world .glow')].find(g => g.style.visibility !== 'hidden'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
    if (!tgt) fail(tag, 'no visible glow'); else {
      const hb = await p.evaluate(() => { const r = document.querySelector('#htile').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
      await p.mouse.move(hb.x, hb.y); await p.mouse.down(); await p.mouse.move((hb.x + tgt.x) / 2, (hb.y + tgt.y) / 2, { steps: 8 }); await p.mouse.move(tgt.x, tgt.y, { steps: 8 }); await p.mouse.up(); await sleep(600);
      const sel = await p.evaluate(() => !!UI.sel || G.step === 'fig'); if (!sel) fail(tag, 'drag did not select/place a square');
      if (await p.evaluate(() => G.step === 'place')) { if (await p.$('#hplace')) await p.click('#hplace'); await sleep(900); }
    }
    if (await p.evaluate(() => G.step !== 'fig')) fail(tag, 'could not reach the follower step'); else {
      await sleep(800); const f = await p.$('#ov .fglow'); if (f) { await f.click(); } else await p.click('#hskip'); await sleep(900);
      const s2 = await p.evaluate(() => ({ turn: G.turn, step: G.step })); console.log(tag, 'after follower step', JSON.stringify(s2));
    }
    await p.waitForFunction(() => myTurn('place') || G.over, null, { timeout: 30000 }).catch(() => fail(tag, 'rival never handed the turn back')); await sleep(1500);
    if (process.argv[2]) await p.screenshot({ path: path.join(process.argv[2], `pc-${tag}.png`) });
    if (errs.length) fail(tag, 'page errors', errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? 'PC MOUSE FAIL ' + bad : 'PC MOUSE PASS'); process.exit(bad ? 1 : 0);
})();
