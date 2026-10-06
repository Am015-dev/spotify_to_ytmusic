// Rotation test: play a few moves, rotate portrait <-> landscape several times (including the stale-size case iOS reports right after a turn),
// and after each rotation check: no page error, the board fills the screen, glowing squares / follower spots are inside the board and not covered, and a tap on one still works.
//   cd games-src/carc/game/src && python3 build.py   then   NODE_PATH=/opt/node-tools/node_modules node ../rotate-test.js
const PW = require(process.env.PW || 'playwright'), path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, 'rampart.html');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms)); let bad = 0; const fail = (...a) => { bad++; console.log('FAIL', ...a); };
const STATE = () => { const bd = document.querySelector('#board').getBoundingClientRect(), vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden'; };
  const c = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
  const spots = [...document.querySelectorAll('.glow,.fglow')].filter(vis).map(e => ({ ...c(e), cover: (() => { const t = document.elementFromPoint(c(e).x, c(e).y); return !t || !t.closest('.glow,.fglow'); })() }));
  const sk = document.querySelector('#hskip'); return { W: innerWidth, H: innerHeight, board: Math.round(100 * bd.width * bd.height / (innerWidth * innerHeight)), bw: bd.width, bh: bd.height, hscroll: document.documentElement.scrollWidth > innerWidth + 1, spots, skip: sk && vis(sk) ? c(sk) : null, mine: myTurn(), step: G.step, sig: G.turn + G.step, tw: !!UI.tw }; };
(async () => {
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of [[390, 763], [375, 553]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.goto(URL); await sleep(300);
    await p.evaluate(() => { UI.speed = 30; UI.first = false; }); await p.tap('[data-a=play]'); await sleep(500);
    const act = async tag => { // make one move with a real tap
      for (let i = 0; i < 80; i++) { const s = await p.evaluate(STATE); if (s.tw || !s.mine) { await sleep(100); continue; } const t = s.spots[0] || s.skip; if (!t) { await sleep(150); continue; } await p.touchscreen.tap(t.x, t.y); await sleep(250); return true; }
      fail(W + 'x' + H, tag, 'no tappable target'); return false; };
    const check = async tag => { await sleep(700); for (let i = 0; i < 30; i++) { const s = await p.evaluate(STATE); if (!s.tw && s.mine) break; await sleep(200); }
      const s = await p.evaluate(STATE); const isP = s.H > s.W;
      if (s.hscroll) fail(tag, 'horizontal scroll'); if (isP && s.board < 55) fail(tag, 'board only ' + s.board + '%'); if (s.bw < s.W * .6 && isP) fail(tag, 'board narrow');
      for (const sp of s.spots) { if (sp.cover) fail(tag, 'spot covered at ' + Math.round(sp.x) + ',' + Math.round(sp.y)); if (sp.x < 0 || sp.x > s.W || sp.y < 0 || sp.y > s.H) fail(tag, 'spot off screen'); }
      if (s.mine && !s.spots.length && !s.skip) fail(tag, 'my turn but nothing to tap'); if (errs.length) fail(tag, 'page error ' + errs[0]); };
    await act('start'); await act('start2'); await act('start3'); await act('start4');
    const rot = async (w, h, stale, tag) => { const ev = () => p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); if (stale) await ev(); await p.setViewportSize({ width: w, height: h }); await ev(); await check(tag); await act(tag + ' move'); await check(tag + ' after move'); };
    await rot(H, W, false, 'P>L'); await rot(W, H, false, 'L>P'); await rot(H, W, true, 'stale P>L'); await rot(W, H, true, 'stale L>P'); await rot(H, W, false, 'P>L again');
    console.log(W + 'x' + H, 'rotation done');
    await ctx.close();
  }
  await b.close(); console.log(bad ? 'ROTATE FAIL ' + bad : 'ROTATE CLEAN'); process.exit(bad ? 1 : 0);
})();
