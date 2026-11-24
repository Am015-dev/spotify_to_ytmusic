// Tutorial v3 gate (machine speed): HUD map labels non-overlapping, taps on non-suggested things work, every lesson completes by taps
// in order, a full practice game finishes, 0 JS errors. Runs 402x874 and 1366x768. Shots -> proof/v3-*. node tut-v3.js
const { chromium } = require('playwright'); const path = require('path');
const P = path.join(__dirname, 'proof');
async function run(W, H) {
  const tag = W + 'x' + H, b = await chromium.launch(), touch = W < 600;
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch });
  const errs = [], fail = []; p.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => { if (!c) fail.push(m); };
  const tap = async s => { const e = await p.$(s); if (!e) throw new Error(tag + ' missing ' + s + ' in ' + JSON.stringify(await st())); touch ? await e.tap() : await e.click(); await p.waitForTimeout(40); };
  const st = () => p.evaluate(() => window.tutState && tutState());
  const shot = n => p.screenshot({ path: path.join(P, 'v3-' + tag + '-' + n + '.png') });
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await p.waitForTimeout(300);
  await tap('#tutB'); await p.waitForTimeout(200);
  await p.evaluate(() => { UI.fast = true; AIDELAY = 0; });
  // HUD map
  const boxes = await p.evaluate(() => tutMapBoxes());
  ok(boxes.length >= 10, 'map labels ' + boxes.length);
  for (let i = 0; i < boxes.length; i++) { const a = boxes[i]; ok(a.l >= 0 && a.t >= 0 && a.r <= W && a.b <= H, 'label off screen ' + a.k);
    for (let j = i + 1; j < boxes.length; j++) { const c = boxes[j]; ok(!(a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t), 'labels overlap ' + a.k + ' / ' + c.k); } }
  const win = () => p.evaluate(() => { const r = document.querySelector('#twin').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  const w0 = await win(); boxes.forEach(a => ok(!(a.l < w0.r && a.r > w0.l && a.t < w0.b && a.b > w0.t), 'window covers label ' + a.k));
  await shot('0-hud-map');
  await tap('#tmap .tlab[data-k="#railScore"]');
  ok((await p.textContent('#twin')).includes('How every landscape'), 'label tap explains');
  // a non-highlighted tap works while the map is open
  await tap('#railScore'); ok(await p.evaluate(() => UI.pp === 'scorep'), 'rail tap opens scoring with map open');
  await tap('#scorep .ppx'); ok(await p.evaluate(() => !UI.pp), 'panel closes');
  // minimise / restore / drag
  await tap('#twMin'); ok(await p.$('#twMax'), 'minimised to chip'); await tap('#twMax');
  await tap('#twGo');
  const lesson = async (id, n) => { const s = await st(); ok(s && s.id === id, tag + ' expected ' + id + ' got ' + (s && s.id)); await shot(n + '-' + id);
    const ring = await p.evaluate(() => { const e = document.querySelector('.tsug'), w = document.querySelector('#twin'); if (!e) return null; const a = e.getBoundingClientRect(), c = w.getBoundingClientRect(); return a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top && !(a.width > innerWidth * .5); });
    ok(ring !== true, 'window covers the suggestion in ' + id); };
  await lesson('pick', 1);
  const n = await p.$$eval('.pocket.glow', x => x.length); const notSug = await p.evaluate(() => { const a = [...document.querySelectorAll('.pocket.glow')]; return a.findIndex(e => !e.classList.contains('tsug')); });
  ok(notSug >= 0, 'a non-suggested pocket exists');
  await tap('.pocket.glow:not(.tsug)'); ok(await p.evaluate(() => G.turn.took >= 0), 'non-suggested pocket tap works');
  await lesson('place', 2);
  for (let i = 0; i < 3; i++) { await tap('.htok'); await tap('#map .hx.glow'); }
  await lesson('stack', 3); await tap('#twNext');
  await lesson('card', 4);
  await tap('#railRow'); await tap('.acard.playable'); if (await p.$('#takeB')) await tap('#takeB');
  await lesson('cube', 5);
  if (await p.evaluate(() => E.moves().some(m => m.t === 'cube'))) { await tap('#railMine'); await tap('.acard.ready'); await tap('#map .hx.glow'); } else await tap('#twNext');
  await lesson('animal', 6); await tap('#twNext');
  await lesson('end', 7); await p.evaluate(() => closePanel()); await tap('#endB');
  await p.waitForFunction(() => G.cur === 0 && !UI.busy, null, { timeout: 10000 });
  for (const [id, k] of [['land', 8], ['water', 9], ['spirit', 10], ['over', 11]]) { await lesson(id, k); await tap('#twNext'); }
  const s = await st(); ok(s.id === 'practice' && s.done.length === 11, 'all lessons ticked ' + s.done.length);
  await shot('12-practice');
  ok((await p.textContent('#twSay')).length > 5, 'practice what-to-do line');
  // full practice game at machine speed: the human seat plays greedy legal moves through act()
  await p.evaluate(() => { let g = 0; while (!G.over && g++ < 2000) { if (G.cur !== 0 || UI.busy) break; const ms = E.moves(); const m = ms.find(x => x.t === 'cube') || ms.find(x => x.t === 'take') || ms.find(x => x.t === 'place') || ms.find(x => x.t === 'end'); act(m); } });
  await p.waitForFunction(() => { if (!G.over && G.cur === 0 && !UI.busy) { const ms = E.moves(); act(ms.find(x => x.t === 'cube') || ms.find(x => x.t === 'take') || ms.find(x => x.t === 'place') || ms.find(x => x.t === 'end')); } return G.over; }, null, { timeout: 60000, polling: 10 });
  await p.waitForTimeout(300); await shot('13-result');
  ok(await p.evaluate(() => G.over), 'game over');
  ok(!errs.length, 'js errors ' + errs.join(' | '));
  await b.close(); return { tag, fail };
}
(async () => { let bad = 0; for (const [w, h] of [[402, 874], [1366, 768]]) { const r = await run(w, h); console.log(r.tag, r.fail.length ? 'FAIL\n  ' + r.fail.join('\n  ') : 'PASS'); bad += r.fail.length; } process.exit(bad ? 1 : 0); })()
  .catch(e => { console.log('FAIL', e.message); process.exit(1); });
