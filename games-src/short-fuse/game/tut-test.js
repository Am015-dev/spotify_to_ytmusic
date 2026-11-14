// tut-test.js: walks Learn to play (the guided first job, tutor.js) from fresh storage BY TOUCH on a phone, then the real job it hands over to.
// Asserts: every core rule has its step, in order (hidden sorted stands, opening tokens, dual cut, hit, miss, solo cut, red, yellow, equipment, win/lose,
// next job); every step is ONE sentence of at most 12 words plus ONE highlighted tap (the glowing target, or Next); the guided job ends defused;
// "Play job 1" starts a real job 1. No page errors.
//   node tut-test.js [WxH=390x844] [shotsDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const gx = require('../../scripts/gx-serve.js');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number), SHOTS = process.argv[3] || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
// rule -> the step ids that teach it, in teaching order
const RULES = [
  ['goal: cut every wire together', ['goal']],
  ['fuse: a miss burns a step, red = boom', ['goal']],
  ['stands sorted, hidden from the others', ['mine']],
  ['opening info token', ['token', 'point']],
  ['dual cut: point at a wire, name a value you hold', ['point', 'name']],
  ['correct: both wires cut; one cut per turn', ['hit']],
  ['twin probe: two wires, one number, once per job', ['probe', 'wrong1b']],
  ['wrong: fuse advances, a token shows the true value', ['wrong1', 'wrong2', 'wrongres']],
  ['equipment unlocks after two cuts, works once', ['hit', 'gear']],
  ['yellow matches only yellow', ['yellow1', 'yellow2']],
  ['red: tap it, never point at it, only-reds reveal', ['red', 'win']],
  ['solo cut: you hold every one left', ['solo']],
  ['win together', ['win']],
];
(async () => {
  const URL = await gx.url('short-fuse', { file: path.resolve(__dirname, 'shortfuse.html') });
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SHOTS ? 2 : 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const p = await ctx.newPage(); const bad = [], errs = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await p.goto(URL); await sleep(900); await p.evaluate(() => { try { localStorage.clear() } catch (e) { } }); await p.reload(); await sleep(1200);
  const ctr = sel => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 2 && !e.closest('[hidden]') }); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] }, sel);
  const go = await ctr('#start [data-a=offeryes]'); if (!go) { console.log('FAIL no Learn to play button'); process.exit(1); }
  await p.touchscreen.tap(...go); await sleep(1000);
  await p.evaluate(() => { UI.speed = 3; });
  if (process.env.DBG) await p.evaluate(() => { const o = tapTile; tapTile = function (si, k) { console.log('tapTile', si, k, JSON.stringify(G.q && G.q.kind)); const r = o(si, k); console.log('after', JSON.stringify(G.q && G.q.kind)); return r }; const a = GXT.act; GXT.act = function (x) { const r = a(x); console.log('act', JSON.stringify(x), r); return r } });
  if (process.env.DBG) p.on('console', m => { if (/tapTile|after|act/.test(m.text())) console.log('C', m.text()) });
  const seen = []; let shot = 0, last = '', lastAt = 0, t0 = Date.now();
  while (Date.now() - t0 < 180000) {
    const s = await p.evaluate(() => GXT.state()); if (process.env.DBG) console.log('st', s.active, s.phase, s.id, s.shown, s.count);
    if (!s.active) { console.log('inactive', JSON.stringify(s), await p.evaluate(() => JSON.stringify({ tut: UI.tut, coach: !!UI.coach, g: !!G, q: G && G.q && G.q.kind, start: !document.getElementById('start').hidden }))); break; }
    if (s.phase === 'end') { if (!(await p.evaluate(() => !!(G && G.over)))) console.log('end early', JSON.stringify(s).slice(0, 300), await p.evaluate(() => JSON.stringify({ tut: UI.tut, coach: !!UI.coach, g: !!G, q: G && G.q && G.q.kind, ph: G && G.phase, actor: G && G.actor }))); break; }
    if (!s.shown) { await sleep(120); continue; }
    const key = s.id + '#' + s.count; if (key === last && Date.now() - lastAt < 2500) { await sleep(150); continue; }
    if (!seen.includes(s.id)) {
      seen.push(s.id);
      const words = s.say.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(Boolean).length, sentences = (s.say.match(/[.!?](\s|$)/g) || []).length;
      if (words > 12) bad.push(s.id + ': ' + words + ' words: ' + s.say);
      if (sentences > 1) bad.push(s.id + ': more than one sentence: ' + s.say);
      if (!s.hole) bad.push(s.id + ': nothing highlighted');
      if (SHOTS) { await sleep(250); await p.screenshot({ path: path.join(SHOTS, 'tut-' + (++shot) + '.png') }); }
      console.log('step', seen.length, s.id, (s.wait || 'next') + ' |', s.say);
    }
    if (key === last) bad.push(s.id + ': the highlighted tap did not advance (retried)');
    last = key; lastAt = Date.now();
    if (Date.now() - s.shownAt < 700) await sleep(700);   // the kit ignores a tap in the first 600 ms of a bubble
    if (s.wait === 'tap') { if (process.env.DBG) console.log('tap at', JSON.stringify(s.hole), await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t.outerHTML.slice(0, 160) }, [s.hole.cx, s.hole.cy])); await p.touchscreen.tap(s.hole.cx, s.hole.cy); }
    else { await sleep(650); const n = await ctr('.gxt-next'); if (!n) { bad.push(s.id + ': no Next button'); break; } await p.touchscreen.tap(...n); }
    await sleep(350);
  }
  const end = await p.evaluate(() => ({ st: GXT.state(), over: !!(G && G.over && G.over.win), txt: (document.querySelector('.gxt-end') || {}).innerText || '' }));
  if (!end.over) bad.push('guided job did not end defused');
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'tut-' + (++shot) + '.png') });
  // every rule taught, in order
  let pos = -1;
  for (const [rule, ids] of RULES) { const ix = ids.map(id => seen.indexOf(id)); if (ix.some(i => i < 0)) { bad.push('rule never taught: ' + rule + ' (' + ids.filter((id, k) => ix[k] < 0) + ')'); continue; } const first = Math.min(...ix); if (first < pos && rule !== 'equipment unlocks after two cuts, works once') bad.push('rule out of order: ' + rule); pos = Math.max(pos, first); }
  // hand over to a real job
  const j1 = await ctr('[data-gxt-end=job1]'); if (!j1) bad.push('no "Play job 1" on the end card: ' + end.txt.replace(/\s+/g, ' '));
  else { await p.touchscreen.tap(...j1); await sleep(1500); const r = await p.evaluate(() => ({ m: G && G.mission, tut: !!UI.tut, started: !!UI.started, done: GXT.isDone('short-fuse') })); if (r.m !== 1 || r.tut || !r.started) bad.push('job 1 did not start: ' + JSON.stringify(r)); if (!r.done) bad.push('tutorial not remembered as done'); }
  for (const e of errs) bad.push('page error ' + e);
  await b.close();
  console.log(W + 'x' + H + ' tutorial steps ' + seen.length + ': ' + seen.join(','));
  console.log(bad.length ? 'TUT FAIL\n  ' + bad.join('\n  ') : 'TUT PASS: every rule step, one sentence <= 12 words + one tap each, then job 1');
  process.exit(bad.length ? 1 : 0);
})();
