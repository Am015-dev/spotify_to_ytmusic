#!/usr/bin/env node
// Nightrun LESSONS test (parts/lessons.js; real page, ?nomusic=1&lessons=1). Prints only PASS / FAIL lines; exit code 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/lessons-test.js     env: GAME_DIR=...  VP=390x763 (one size)
// At 390x763 and 375x553 (touch): (a) each lesson shows the first time its feature appears (WEAPONS sheet, Garage FORGE twice, SHIPS, story stage 3, stage 2)
// and never again; (b) its practice gives TRY AGAIN on a wrong answer and completes on the right one; (c) SKIP closes it and it stays seen;
// (d) MENU > LESSONS replays a lesson; (e) localStorage other than mnr_lessons and the Neon bank are untouched by the lessons;
// (f) ?lessons=0 shows no lesson and no LESSONS button; (g) lesson text inside the viewport, >= 13 px, buttons >= 44 px; (h) no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const out = [], ok = (name, pass, info) => { out.push(!!pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };
const VPS = [[390, 763], [375, 553]].filter(v => !process.env.VP || process.env.VP === v[0] + 'x' + v[1]);
const INIT = () => { try { if (!sessionStorage.getItem('ls0')) { localStorage.clear(); localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_best', JSON.stringify({ score: 4321, dist: 'TEST' })); sessionStorage.setItem('ls0', 1); } } catch (e) { } };
const snap = p => p.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'mnr_lessons') o.push([k, localStorage.getItem(k)]); } o.sort(); return JSON.stringify({ o, bank: window.__mnr.GA.bank }); });
const look = p => p.evaluate(() => { const bad = [], vw = innerWidth, vh = innerHeight, C = document.getElementById('lsC'); if (!C || C.hidden) return bad;
  for (const el of C.querySelectorAll('*')) { if (!el.getClientRects().length) continue; const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (el.tagName === 'BUTTON' && r.height < 44) bad.push('small button ' + (el.id || el.textContent.slice(0, 12)));
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue;
    if (parseFloat(cs.fontSize) < 13) bad.push('font ' + cs.fontSize + ' ' + el.textContent.slice(0, 16));
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push('offscreen ' + el.textContent.slice(0, 16)); }
  return bad; });
async function page(br, port, vp, q) {
  const ctx = await br.newContext({ viewport: { width: vp[0], height: vp[1] }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(INIT);
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__lessons && document.getElementById('mnMore')); await sleep(600);
  return { ctx, p, errs };
}
const L = p => p.evaluate(() => ({ open: window.__lessons.open, id: window.__lessons.id, step: window.__lessons.step, seen: window.__lessons.seen() }));
const tap = async (p, sel) => { await p.waitForSelector(sel, { state: 'visible', timeout: 4000 }); await p.tap(sel); await sleep(120); };
const fb = p => p.evaluate(() => { const f = document.querySelector('#lsC .fb'); return f ? f.className : ''; });
// cards -> practice; returns layout findings seen on the way
async function toPractice(p) { let bad = []; for (let i = 0; i < 4; i++) { bad = bad.concat(await look(p)); if ((await L(p)).step === 'practice') break; await tap(p, '#lsNext'); } return bad.concat(await look(p)); }
async function solvePick(p) { let wrongOk = false;
  for (let r = 0; r < 4; r++) { const want = await p.evaluate(() => window.__lessons.pr.want), opts = await p.evaluate(() => [...document.querySelectorAll('#lsC .op .lo')].map(b => b.dataset.v));
    const wrong = opts.find(o => o !== want); if (wrong) { await tap(p, '#lsO_' + wrong); if ((await fb(p)).includes('bad')) wrongOk = true; }
    await tap(p, '#lsO_' + want); if (await p.$('#lsDone')) break; await sleep(1000); }
  return wrongOk; }
async function finish(p) { const done = !!(await p.$('#lsDone')); if (done) await tap(p, '#lsDone'); await sleep(150); return done; }
async function run(br, port, vp) {
  const lab = vp.join('x'), { ctx, p, errs } = await page(br, port, vp, '&lessons=1'); let lay = [];
  const diffs = [], G0 = async () => await snap(p), G1 = async (a, n) => { const b = await snap(p); if (a !== b) { const A = JSON.parse(a), B = JSON.parse(b); diffs.push(n + ':' + B.o.filter(x => !A.o.some(y => y[0] === x[0] && y[1] === x[1])).map(x => x[0]).join('+') + (A.bank !== B.bank ? ' bank' : '')); } };
  // WEAPONS: the sheet from the menu
  await p.evaluate(() => RET.menuOpen()); await tap(p, '#wpBtn'); await sleep(200);
  let st = await L(p); ok(`${lab}: weapons lesson on the first WEAPONS sheet`, st.open && st.id === 'weapons', JSON.stringify(st));
  let g = await G0(); lay = lay.concat(await toPractice(p)); const w1 = await solvePick(p), d1 = await finish(p); await G1(g, 'weapons');
  ok(`${lab}: weapons practice says TRY AGAIN on a wrong pick, completes on the right one`, w1 && d1 && (await L(p)).seen.weapons === 2);
  await p.evaluate(() => { const b = document.getElementById('wpGo'); if (b) b.click(); }); await sleep(150);
  await p.evaluate(() => RET.menuOpen()); await tap(p, '#wpBtn'); await sleep(200);
  ok(`${lab}: weapons lesson shows once`, !(await L(p)).open); await p.evaluate(() => { const b = document.getElementById('wpGo'); if (b) b.click(); });
  // GARAGE: FORGE (merge), FORGE again (slots), SHIPS (skip)
  const tab = async t => { await p.evaluate(t => document.querySelector(`#garage .tabs button[data-t="${t}"]`).click(), t); await sleep(250); };
  await p.evaluate(() => window.__inv.open('title')); await sleep(300); await tab('forge');
  st = await L(p); ok(`${lab}: merge lesson on the first FORGE tab`, st.open && st.id === 'merge', JSON.stringify(st));
  g = await G0(); lay = lay.concat(await toPractice(p));
  const pairs = await p.evaluate(() => window.__lessons.pr.want), tiles = await p.evaluate(() => [...document.querySelectorAll('#lsTiles .lo')].map(b => b.dataset.v));
  const good = pairs[0], badPair = (() => { for (const a of tiles) for (const b of tiles) if (a < b && !pairs.some(q => q.includes(a) && q.includes(b))) return [a, b]; })();
  let mWrong = false; if (badPair) { await tap(p, '#lsT_' + badPair[0]); await tap(p, '#lsT_' + badPair[1]); await tap(p, '#lsForgeGo'); mWrong = (await fb(p)).includes('bad'); }
  await tap(p, '#lsT_' + good[0]); await tap(p, '#lsT_' + good[1]); await tap(p, '#lsForgeGo'); const d2 = await finish(p); await G1(g, 'merge');
  ok(`${lab}: merge practice rejects a pair with no recipe, forges the right pair`, mWrong && d2 && (await L(p)).seen.merge === 2);
  await tab('tune'); await sleep(100); await tab('forge');
  st = await L(p); ok(`${lab}: slots lesson on the next FORGE tab`, st.open && st.id === 'slots', JSON.stringify(st));
  g = await G0(); lay = lay.concat(await toPractice(p));
  await tap(p, '#lsI_c'); await tap(p, '#lsSl_0'); const eWrong = (await fb(p)).includes('bad');
  for (const [i, s] of [['w1', 0], ['w2', 1], ['c', 2], ['p', 3]]) { await tap(p, '#lsI_' + i); await tap(p, '#lsSl_' + s); }
  const d3 = await finish(p); await G1(g, 'slots'); ok(`${lab}: slots practice rejects a core in a weapon slot, completes a full loadout`, eWrong && d3 && (await L(p)).seen.slots === 2);
  await p.evaluate(() => { document.querySelector('#garage .tabs button[data-t="tune"]')?.click(); }); await sleep(100);
  await tab('ships'); st = await L(p); ok(`${lab}: ship lesson on the first SHIPS tab`, st.open && st.id === 'ship', JSON.stringify(st));
  g = await G0(); lay = lay.concat(await look(p)); await tap(p, '#lsSkip'); await G1(g, 'ship'); st = await L(p);
  ok(`${lab}: SKIP closes the lesson, it stays seen`, !st.open && st.seen.ship === 1);
  await p.evaluate(() => { document.querySelector('#garage .tabs button[data-t="tune"]')?.click(); }); await sleep(100); await tab('ships');
  ok(`${lab}: skipped lesson does not come back`, !(await L(p)).open);
    await p.evaluate(() => window.__inv.close()); await sleep(200);
  // STORY: stage 3 = counter, stage 2 = timing (before the run starts; the run starts after GOT IT)
  await p.evaluate(() => window.__lessons.start(3)); await sleep(250);
  st = await L(p); const notRun = !(await p.evaluate(() => window.__lessons.running));
  ok(`${lab}: counter lesson before the first stage 3, no run live`, st.open && st.id === 'counter' && notRun, JSON.stringify(st));
  g = await G0(); lay = lay.concat(await toPractice(p)); const c1 = await solvePick(p); await G1(g, 'counter'); const d4 = await finish(p); await sleep(400);
  ok(`${lab}: counter practice (3 rounds) completes, then the stage starts`, c1 && d4 && (await p.evaluate(() => window.__lessons.running)));
  await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  const tOn = await p.evaluate(() => !!(window.TIM && TIM.on));
  await p.evaluate(() => window.__lessons.start(2)); await sleep(250); st = await L(p);
  if (!tOn) ok(`${lab}: timing lesson skipped (timing flag off)`, !st.open);
  else { ok(`${lab}: timing lesson before stage 2 (flight school not finished)`, st.open && st.id === 'timing', JSON.stringify(st));
    g = await G0(); lay = lay.concat(await toPractice(p));
    await p.waitForFunction(() => { const f = window.__lessons.phase(); return f > .3 && f < .5; }); await tap(p, '#lsDash'); const tWrong = (await fb(p)).includes('bad');
    for (let k = 0; k < 6 && !(await p.$('#lsDone')); k++) { await p.evaluate(() => new Promise(r => { const t = setInterval(() => { const f = window.__lessons.phase(); if (f > .9 && f < .97) { clearInterval(t); document.getElementById('lsDash').click(); r(); } }, 5); })); await sleep(200); }
    await p.waitForSelector('#lsDone'); await G1(g, 'timing'); const d5 = await finish(p); await sleep(400);
    ok(`${lab}: timing practice says TRY AGAIN off the beat, completes on the beat`, tWrong && d5 && (await L(p)).seen.timing === 2); }
  await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  await p.evaluate(() => window.__lessons.start(3)); await sleep(250); ok(`${lab}: counter lesson shows once`, !(await L(p)).open); await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  // REPLAY: MENU > LESSONS
  await p.evaluate(() => RET.menuOpen()); await tap(p, '#lsBtn'); lay = lay.concat(await look(p)); await tap(p, '#lsL_weapons');
  st = await L(p); ok(`${lab}: MENU > LESSONS replays a lesson`, st.open && st.id === 'weapons');
  await tap(p, '#lsSkip'); ok(`${lab}: SKIP in a replay returns to the list`, !!(await p.$('#lsBack'))); await tap(p, '#lsBack');
  ok(`${lab}: lessons leave saves, stats and Neon untouched`, !diffs.length, diffs.join(' | '));
  ok(`${lab}: lesson text inside the screen, >= 13 px, buttons >= 44 px`, !lay.length, [...new Set(lay)].slice(0, 5).join(' | '));
  ok(`${lab}: no page errors`, !errs.length, errs.slice(0, 3).join(' | ')); await ctx.close();
  // ?lessons=0
  const o = await page(br, port, vp, '&lessons=0');
  await o.p.evaluate(() => RET.menuOpen()); const btn = await o.p.$('#lsBtn'); await tap(o.p, '#wpBtn'); await sleep(200); let any = (await L(o.p)).open;
  await o.p.evaluate(() => { const b = document.getElementById('wpGo'); if (b) b.click(); window.__inv.open('title'); }); await sleep(300);
  for (const t of ['forge', 'ships', 'load']) { await o.p.evaluate(t => document.querySelector(`#garage .tabs button[data-t="${t}"]`)?.click(), t); await sleep(200); any = any || (await L(o.p)).open; }
  await o.p.evaluate(() => window.__inv.close()); await o.p.evaluate(() => window.__lessons.start(3)); await sleep(300); any = any || (await L(o.p)).open;
  ok(`${lab}: ?lessons=0 shows no lesson and no LESSONS button`, !any && !btn && (await o.p.evaluate(() => window.__lessons.running)));
  ok(`${lab}: ?lessons=0 no page errors`, !o.errs.length, o.errs.slice(0, 3).join(' | ')); await o.ctx.close();
}
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try { for (const vp of VPS) await run(br, port, vp); } catch (e) { ok('test harness', false, e.message.split('\n')[0]); }
  await br.close(); srv.kill(); process.exit(out.every(Boolean) ? 0 : 1);
})();
