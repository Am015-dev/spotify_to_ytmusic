// Tutorial v3 gate (machine speed): screen-map labels non-overlapping and on screen, taps on non-suggested things work, every lesson
// completes by taps in order, a full practice game finishes, 0 JS errors. 402x874 (touch) and 1366x768 (mouse). Shots -> proof/v3-*.
const { chromium } = require('playwright'); const path = require('path');
const P = path.join(__dirname, 'proof');
async function run(W, H) {
  const tag = W + 'x' + H, b = await chromium.launch(), touch = W < 600;
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch });
  const errs = [], fail = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const ok = (c, m) => { if (!c) fail.push(m); };
  const st = () => p.evaluate(() => window.tutState && tutState());
  const tap = async s => { if (!await p.$(s)) throw new Error(tag + ' missing ' + s + ' in ' + JSON.stringify(await st())); const l = p.locator(s).first(); touch ? await l.tap({ timeout: 5000 }) : await l.click({ timeout: 5000 }); await p.waitForTimeout(30); };
  const shot = n => p.screenshot({ path: path.join(P, 'v3-' + tag + '-' + n + '.png') });
  await p.goto('file://' + path.join(__dirname, 'wildmark.html?fast=1')); await p.waitForSelector('[data-gxt-open="wildmark"]');
  await tap('[data-gxt-open="wildmark"]'); await p.waitForSelector('#twin');
  const boxes = await p.evaluate(() => tutMapBoxes());
  ok(boxes.length >= 12, 'map labels ' + boxes.length);
  for (let i = 0; i < boxes.length; i++) { const a = boxes[i]; ok(a.l >= 0 && a.t >= 0 && a.r <= W && a.b <= H, 'label off screen ' + a.k);
    for (let j = i + 1; j < boxes.length; j++) { const c = boxes[j]; ok(!(a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t), 'labels overlap ' + a.k + ' / ' + c.k); } }
  const w0 = await p.evaluate(() => { const r = document.querySelector('#twin').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  boxes.forEach(a => ok(!(a.l < w0.r && a.r > w0.l && a.t < w0.b && a.b > w0.t), 'window covers label ' + a.k));
  ok(await p.evaluate(() => !document.querySelector('.gxt-cell,.gxt-dim,#coachb')), 'no dim/blocker layer');
  await shot('0-hud-map');
  await tap('#tmap .tlab[data-k="#mk"]'); ok((await p.textContent('#twin')).includes('Four tile'), 'label tap explains');
  const z0 = await p.evaluate(() => UI.pan.z); await tap('#zinB'); ok(await p.evaluate(z => UI.pan.z > z, z0), 'zoom tap works with the map open');
  await tap('#fitB');
  await tap('#twMin'); ok(await p.$('#twMax'), 'minimised to chip'); await tap('#twMax');
  // drag the window by its title bar
  const hb = await (await p.$('#twin .twh b')).boundingBox();
  if (!touch) { await p.mouse.move(hb.x + 5, hb.y + 5); await p.mouse.down(); await p.mouse.move(hb.x + 45, hb.y + 25, { steps: 3 }); await p.mouse.up();
    ok(await p.evaluate(() => !!UI.tut.pos), 'window drags'); await p.evaluate(() => { UI.tut.pos = null; }); }
  await tap('#twGo');
  const lesson = async (id, n) => { const s = await st(); ok(s && s.id === id, tag + ' expected ' + id + ' got ' + (s && s.id)); await p.waitForTimeout(20); await shot(n + '-' + id);
    const cov = await p.evaluate(() => { const e = document.querySelector('.tsug'), w = document.querySelector('#twin'); if (!e || !w) return false; const a = e.getBoundingClientRect(), c = w.getBoundingClientRect(); return a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top && a.width < innerWidth * .5; });
    ok(!cov, 'window covers the suggestion in ' + id); };
  await lesson('goal', 1); await tap('#twNext');
  await lesson('pick', 2);
  ok(await p.$('#mk .mt.tsug'), 'pulse ring on a market column');
  await tap('#mk .mt:not(.tsug):not([disabled])'); ok(await p.evaluate(() => G.stage === 'tile'), 'non-suggested column tap works');
  await lesson('rotate', 3); await tap('#map .spot'); await tap('#rotB');
  await lesson('place', 4); await tap('#okB'); ok(await p.evaluate(() => G.stage === 'tok'), 'tile placed');
  await lesson('settle', 5); if (await p.$('#map .tgt')) await tap('#map .tgt'); else await tap('#backB');
  await lesson('keystone', 6); await tap('#twNext');
  const s6 = await st(); if (s6.id === 'rival') { await p.waitForFunction(() => tutState().id !== 'rival', null, { timeout: 10000 }).catch(() => {}); }
  await p.waitForFunction(() => G.cur === 0 && !UI.aiRun && !UI.aiHold, null, { timeout: 10000 });
  ok((await st()).done.includes('rival'), 'rival lesson done by play');
  for (const [id, k] of [['sweep', 8], ['acorn', 9], ['habitat', 10], ['majority', 11], ['bear', 12], ['elk', 13], ['salmon', 14], ['hawk', 15], ['fox', 16], ['end', 17]]) { await lesson(id, k); await tap('#twNext'); }
  const s = await st(); ok(s.id === 'practice' && s.done.length === 17, 'all lessons ticked ' + s.done.length);
  await shot('18-practice'); ok((await p.textContent('#twSay')).length > 5, 'practice what-to-do line');
  await tap('#tutQ'); ok((await st()).map, '? reopens the map'); await tap('#twGo');
  // full practice game at machine speed: the human seat plays the normal AI's plan through the engine
  await p.waitForFunction(() => {
    if (!G.over && G.cur === 0 && !UI.aiRun && !UI.aiHold && $('#pass').hidden) { const pl = WM.AI.plan(WM.clone(G), 'easy'); act(pl.pick.t === 'free' ? pl.pick : { t: 'take', i: pl.pick.i }); act({ t: 'place', c: pl.place.c, rot: pl.place.rot }); act(pl.tokC ? { t: 'tok', c: pl.tokC } : { t: 'back' }); }
    return G.over; }, null, { timeout: 90000, polling: 20 });
  await p.waitForSelector('#againB', { timeout: 10000 }).catch(() => {}); await shot('19-result');
  ok(await p.evaluate(() => G.over), 'game over'); ok(await p.$('#againB'), 'result screen');
  ok(!errs.length, 'js errors ' + errs.join(' | '));
  await b.close(); return { tag, fail };
}
(async () => { let bad = 0; for (const [w, h] of [[402, 874], [1366, 768]]) { const r = await run(w, h); console.log(r.tag, r.fail.length ? 'FAIL\n  ' + r.fail.join('\n  ') : 'PASS'); bad += r.fail.length; } process.exit(bad ? 1 : 0); })()
  .catch(e => { console.log('FAIL', e.message); process.exit(1); });
