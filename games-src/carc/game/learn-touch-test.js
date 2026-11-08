// Learn to play, finished by touch only (BRIEF-GAMEFEEL feel gate): a 390x844 phone taps "Learn to play", then only taps what the
// game shows (Got it on Tamsin's bubble, a glowing square, Place here, a follower spot or Skip, the score-summary buttons) until the
// coached game is over and the start screen is back. It never calls a game function to move and never uses a Skip-tutorial button.
// The rival runs at test speed (AIDELAY small, UI.speed high) so a run takes about a minute.
//   URL=http://127.0.0.1:8770/games/rampart-and-vine/index.html node learn-touch-test.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const URL = process.env.URL || 'http://127.0.0.1:8770/games/rampart-and-vine/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await PW.chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  // tap the centre of an element only if the element itself is what a finger there would hit
  const tap = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); if (q.width < 4) return null; const x = q.left + q.width / 2, y = q.top + q.height / 2; const h = document.elementFromPoint(x, y); return h && (h === e || e.contains(h)) ? [x, y] : 'blocked'; }, sel); if (!r || r === 'blocked') return r; await p.touchscreen.tap(r[0], r[1]); return 'ok'; };
  await p.goto(URL); await sleep(1500);
  const learn = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => /learn/i.test(b.textContent)); if (e) e.setAttribute('data-lt', '1'); return !!e; });
  if (!learn || await tap('[data-lt]') !== 'ok') { console.log('FAIL no tappable Learn to play button'); process.exit(1); }
  await sleep(1200);
  await p.evaluate(() => { AIDELAY = 40; UI.speed = 20; });
  let taps = 0, blocked = 0, t0 = Date.now(), done = false, lastTurn = -1, same = 0;
  while (Date.now() - t0 < 240000) {
    const st = await p.evaluate(() => ({ coach: !!(typeof GXCOACH !== 'undefined' && GXCOACH.running), done: typeof GXCOACH !== 'undefined' && GXCOACH.done, start: !!document.querySelector('#modal [data-a=go],#modal .start,#modal [aria-label="New here"]'), over: !!(G && G.over), turn: G ? G.turn : -1,
      ok: !!document.querySelector('#coach .cbub:not([hidden]) .cok'), next: !!document.querySelector('#modal [data-a=cnext],#modal [data-a=cgo]'), place: typeof myTurn === 'function' && myTurn('place'), fig: typeof myTurn === 'function' && myTurn('fig') }));
    if (st.done && !st.coach && !st.next) { done = true; break; }
    let r = null;
    if (st.next) r = await tap('#modal [data-a=cnext],#modal [data-a=cgo]');
    else if (st.ok) r = await tap('#coach .cbub:not([hidden]) .cok');
    else if (st.place) {
      r = await tap('.glow.sel'); if (r !== 'ok') r = await tap('#hplace');
      if (r !== 'ok') { const n = await p.evaluate(() => { const g = [...document.querySelectorAll('.glow')].filter(e => e.style.visibility !== 'hidden'); g.forEach((e, i) => e.setAttribute('data-gi', i)); return g.length; }); for (let i = 0; i < n && r !== 'ok'; i++) r = await tap(`[data-gi="${i}"]`); }
      if (r !== 'ok') r = await tap('#recentre');
    } else if (st.fig) { r = st.turn % 2 ? await tap('.fglow') : null; if (r !== 'ok') r = await tap('#hskip'); }
    if (r === 'ok') taps++; else if (r === 'blocked') blocked++;
    if (st.turn === lastTurn && !st.next) same++; else { same = 0; lastTurn = st.turn; }
    if (same > 400) { console.log('FAIL stuck at turn', st.turn, JSON.stringify(st)); break; }
    await sleep(r === 'ok' ? 220 : 120);
  }
  console.log(`${done ? 'PASS' : 'FAIL'} Learn to play by touch: ${taps} taps, ${blocked} blocked taps, ${Math.round((Date.now() - t0) / 1000)} s${errs.length ? ', page errors: ' + errs.slice(0, 2).join(' | ') : ''}`);
  await b.close(); process.exit(done && !errs.length ? 0 : 1);
})();
