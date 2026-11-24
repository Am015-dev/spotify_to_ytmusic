// F2 tap checks by real touch at 375x667: a full bird in the egg question shakes ("Nest full") and never opens the big card;
// a second tap 100 ms after the question changes is dropped; "Lay all" lays every egg; the rival's turn summary shows and its
// button opens the rival's board; the score line reads "You N · Fern N" with the real points.
//   node tests/f2-taps.js [stageDir=/tmp/x] [W=375] [H=667]
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const gx = require(path.join(ROOT, 'scripts', 'gx-serve.js'));
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));
const STAGE = process.argv[2] || '/tmp/x', W = +(process.argv[3] || 375), H = +(process.argv[4] || 667);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await gx.startServer({ stage: STAGE }), base = srv.base.replace(/\/+$/, '');
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const R = []; const ok = (n, c, x) => { R.push([n, !!c, x || '']); };
  const tap = async sel => { const c = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel); if (c) await p.touchscreen.tap(c.x, c.y); return !!c; };
  await p.goto(base + '/perch-and-plume/'); await p.evaluate(() => localStorage.setItem('pp-played', '1')); await p.goto(base + '/perch-and-plume/'); await sleep(900);
  await p.evaluate(() => { startGame({ seats: [{ name: 'You', kind: 'human' }, { name: 'Fern', kind: 'ai', lvl: 'easy' }], seed: 11, mode: 'vs', first: 0 }); });
  await sleep(500);
  await p.evaluate(() => { PP.performMove(G, PPAI.setup(G, 0), 0); PP.performMove(G, PPAI.setup(G, 1), 1); G.fx = []; $('#setup').hidden = true; $('#pop').hidden = true;
    const pl = G.pl[0], gb = PP.DATA.birds.filter(b => b.h.indexOf('G') >= 0 && b.e >= 3);
    pl.board[1] = [{ id: gb[0].id, eggs: gb[0].e, cache: 0, tuck: 0 }, { id: gb[1].id, eggs: 0, cache: 0, tuck: 0 }, { id: gb[2].id, eggs: 0, cache: 0, tuck: 0 }];
    UI.turnKey = '0:' + G.round + ':' + pl.cubes; render(); pump(); });
  await sleep(1500);
  const sl = await p.evaluate(() => $('#opps').innerText.replace(/\s+/g, ' '));
  const real = await p.evaluate(() => 'You ' + PP.scoreOf(G, 0).total + ' · Fern ' + PP.scoreOf(G, 1).total);
  ok('score line plain and real', sl.indexOf(real.split(' · ')[0]) >= 0 && /Fern \d+/.test(sl) && !/leads/.test(sl), sl + ' / ' + real);
  // the egg question: tap Lay eggs, then a full bird
  await tap('.a4[data-k="eggs"]'); await sleep(900);
  for (let k = 0; k < 10 && !(await p.evaluate(() => G.q && G.q.h === 'egg')); k++) { await p.evaluate(() => { if (G.q && G.q.h === 'bonus') document.querySelector('#acts [data-a="mv"]').click(); }); await sleep(400); }
  const qn = await p.evaluate(() => G.q && G.q.h === 'egg' ? G.q.d.n : 0);
  ok('egg question open', qn >= 2, 'eggs to lay ' + qn);
  await sleep(300);
  await tap('.bc[data-a="bird"][data-h="1"][data-c="0"]'); await sleep(150);
  const full = await p.evaluate(() => ({ pop: !$('#pop').hidden, word: (document.querySelector('.nopefx') || {}).textContent || '', n: G.q && G.q.d.n }));
  ok('full bird: shake, no popup', !full.pop && /full/i.test(full.word) && full.n === qn, JSON.stringify(full));
  const sz = await p.evaluate(() => [...document.querySelectorAll('.bc[data-a="bird"][data-legal]')].map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  ok('egg targets >= 44 px', sz.length && sz.every(v => v >= 44), sz.join(','));
  // one egg by tap, then an immediate second tap on another bird is dropped only if the question changed; here it stays 'egg', so it counts
  await sleep(400); await tap('.bc[data-a="bird"][data-h="1"][data-c="1"]'); await sleep(900);
  const n2 = await p.evaluate(() => G.q && G.q.h === 'egg' ? G.q.d.n : 0);
  ok('one tap = one egg', n2 === qn - 1, qn + ' -> ' + n2);
  await p.evaluate(() => { UI.qT = Date.now(); }); await tap('.bc[data-a="bird"][data-legal]'); await sleep(500);
  const n3 = await p.evaluate(() => G.q && G.q.h === 'egg' ? G.q.d.n : 0);
  ok('tap within 250 ms of a new question is dropped', n3 === n2, n2 + ' -> ' + n3);
  if (n2 >= 2) { await tap('#acts [data-a="eggall"]'); }
  else if (n2 === 1) { await tap('.bc[data-a="bird"][data-legal]'); }
  for (let k = 0; k < 30 && await p.evaluate(() => G.q && G.q.h === 'egg'); k++) await sleep(250);
  ok('Lay all finishes the eggs', await p.evaluate(() => !(G.q && G.q.h === 'egg')), '');
  // rival summary
  let seen = false; for (let k = 0; k < 60; k++) { await sleep(200); if (await p.evaluate(() => !!document.querySelector('.rvsum'))) { seen = true; break; } }
  const txt = seen ? await p.evaluate(() => document.querySelector('.rvsum').innerText.replace(/\s+/g, ' ')) : '';
  ok('rival summary shown', seen && /Fern played/.test(txt), txt);
  await sleep(1500);
  ok('summary stays >= 1.5 s', await p.evaluate(() => !!document.querySelector('.rvsum')), '');
  await tap('.rvsum [data-rv="board"]'); await sleep(700);
  ok('one tap opens Fern\'s board', await p.evaluate(() => { const d = document.querySelector('#oppd'); return !!d && /Fern/.test(document.body.innerText) && !!document.querySelector('.minirow'); }), '');
  ok('no page errors', !errs.length, errs.slice(0, 2).join(' | '));
  R.forEach(r => console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? '  (' + r[2] + ')' : '')));
  const pass = R.every(r => r[1]); console.log((pass ? 'PASS' : 'FAIL') + ' f2-taps ' + W + 'x' + H);
  await b.close(); srv.close(); process.exit(pass ? 0 : 1);
})();
