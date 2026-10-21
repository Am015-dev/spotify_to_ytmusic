#!/usr/bin/env node
// Nightrun LESSONS test (parts/lessons.js: mini stages; real page, ?nomusic=1&lessons=1). Prints only PASS / FAIL lines; exit code 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/lessons-test.js     env: GAME_DIR=...  VP=390x763 (one size)
// At 390x763 and 375x553 (touch): (a) each lesson's mini stage opens the first time its feature appears (WEAPONS sheet, Garage FORGE twice, SHIPS,
// story stage 3, story stage 2) and never again; (b) an in-page bot plays it: in every phase that teaches a choice it first does the wrong thing and gets
// TRY AGAIN, then does the right thing and the phase turns green; every lesson reaches LESSON CLEAR in < 60 s; (c) SKIP closes it and it stays seen;
// (d) MENU > LESSONS replays a mini stage; (e) localStorage other than mnr_lessons and the Neon bank are untouched by the lessons, no run is live during one;
// (f) ?lessons=0 shows no lesson and no LESSONS button; (g) one short prompt line (<= 60 chars), text >= 13 px and inside the screen, buttons >= 44 px;
// (h) no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const out = [], ok = (name, pass, info) => { out.push(!!pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };
const VPS = [[390, 763], [375, 553]].filter(v => !process.env.VP || process.env.VP === v[0] + 'x' + v[1]);
const NOFAIL = ['m-fly', 's-fly'];   // fly-only phases: nothing to get wrong
const INIT = () => { try { if (!sessionStorage.getItem('ls0')) { localStorage.clear(); localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_best', JSON.stringify({ score: 4321, dist: 'TEST' })); sessionStorage.setItem('ls0', 1); } } catch (e) { } };
const snap = p => p.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'mnr_lessons') o.push([k, localStorage.getItem(k)]); } o.sort(); return JSON.stringify({ o, bank: window.__mnr.GA.bank }); });
const look = p => p.evaluate(() => { const bad = [], vw = innerWidth, vh = innerHeight, C = document.getElementById('lsC'); if (!C || C.hidden) return bad;
  const ln = document.getElementById('lsLine'); if (ln && ln.textContent.length > 60) bad.push('long line ' + ln.textContent.length);
  for (const el of C.querySelectorAll('*')) { if (!el.getClientRects().length) continue; const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (el.tagName === 'BUTTON' && r.height < 44) bad.push('small button ' + (el.id || el.textContent.slice(0, 12)));
    if (el.tagName === 'CANVAS' && r.height < 140) bad.push('canvas ' + Math.round(r.height));
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue;
    if (parseFloat(cs.fontSize) < 13) bad.push('font ' + cs.fontSize + ' ' + el.textContent.slice(0, 16));
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push('offscreen ' + el.textContent.slice(0, 16)); }
  return bad; });
// the in-page bot: wrong first (until a TRY AGAIN), then right
const BOT = () => { if (window.__lsBotI) return; const st = {}, L = window.__lessons;
  const click = v => { const b = document.getElementById('lsC_' + v.replace(':', '_')); if (b) b.click(); };
  window.__lsBotI = setInterval(() => { const m = L.ms; if (!m || m.state) return; const r = st[L.id + m.ph] || (st[L.id + m.ph] = { a: 0 }), failed = m.fails > 0;
    const near = () => { const f = m.foes.slice().sort((a, b) => a.x - b.x)[0]; return f ? f.y : m.h / 2; };
    switch (m.ph) {
      case 'w-line': case 'w-swarm': case 'sh-swarm': if (failed && !m.wp.includes(m.want)) click(m.want); break;
      case 'sh-plate': if (failed && !m.wp.includes(m.want)) click(m.want); if (failed) L.steer(m.w * .16, near()); break;
      case 'm-forge': if (r.a === 0) { click('pulse'); click('laser'); click('forge'); r.a = 1; } else if (failed && r.a === 1) { click('pulse'); click('swarm'); click('forge'); r.a = 2; } break;
      case 's-equip': if (r.a === 0) { click('i:c'); click('s:0'); r.a = 1; } else if (failed && r.a === 1) { for (const [i, s] of [['w1', 0], ['w2', 1], ['c', 2], ['p', 3]]) { click('i:' + i); click('s:' + s); } r.a = 2; } break;
      case 'm-fly': case 's-fly': L.steer(m.w * .16, near()); break;
      case 'c-shield': L.steer(m.w * .16, near()); if (failed && m.emp && m.foes.some(f => f.sh)) click('emp'); break;
      case 'c-wall': if (m.wall != null) { const d = m.wall - m.s.x; if (!failed) { if (d > 200 && m.emp && !r.a) { click('emp'); r.a = 1; } } else if (d < 120 && m.emp) click('emp'); } break;
      case 't-dash': if (m.wall != null) { const d = m.wall - m.s.x; if (!failed && !r.a && d > 150 && m.beat > .3 && m.beat < .5) { click('dash'); r.a = 1; } else if (failed && d > 20 && d < 130 && (m.beat > .86 || m.beat < .05)) click('dash'); } break; } }, 20); };
async function page(br, port, vp, q) {
  const ctx = await br.newContext({ viewport: { width: vp[0], height: vp[1] }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(INIT);
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__lessons && document.getElementById('mnMore')); await sleep(600);
  return { ctx, p, errs };
}
const L = p => p.evaluate(() => ({ open: window.__lessons.open, id: window.__lessons.id, seen: window.__lessons.seen() }));
const tap = async (p, sel) => { await p.waitForSelector(sel, { state: 'visible', timeout: 4000 }); await p.tap(sel); await sleep(120); };
// play the open mini stage with the bot; returns {clear, secs, bad (phases without a TRY AGAIN before green / never green), lay, keep (storage unchanged)}
async function play(p, id) { const s0 = await snap(p), t0 = Date.now(); let lay = [], n = 0, live = false;
  await p.evaluate(BOT);
  while (Date.now() - t0 < 60000) { await sleep(400); if (n++ % 5 === 0) lay = lay.concat(await look(p)); if (await p.evaluate(() => window.__lessons.running)) live = true; if (await p.$('#lsDone')) break; }
  const secs = (Date.now() - t0) / 1000, clear = !!(await p.$('#lsDone')), keep = (await snap(p)) === s0;
  const { log, ph } = await p.evaluate(id => ({ log: window.__lessons.log.filter(e => e.id === id), ph: window.__lessons.phases[id] }), id);
  const bad = ph.filter(x => { const okI = log.findIndex(e => e.ev === 'ok' && e.ph === x); if (okI < 0) return true; if (NOFAIL.includes(x)) return false; return !log.slice(0, okI).some(e => e.ev === 'miss' && e.ph === x); });
  if (clear) await tap(p, '#lsDone'); await sleep(150);
  return { clear, secs, bad, lay, keep, live }; }
async function run(br, port, vp) {
  const lab = vp.join('x'), { ctx, p, errs } = await page(br, port, vp, '&lessons=1'); let lay = [], keep = [], live = [];
  const check = (name, r) => { lay = lay.concat(r.lay); if (!r.keep) keep.push(name); if (r.live) live.push(name);
    ok(`${lab}: ${name} mini stage: TRY AGAIN on the wrong move, green on the right one, LESSON CLEAR in ${r.secs.toFixed(0)} s`, r.clear && !r.bad.length && r.secs < 60, 'clear ' + r.clear + ' phases ' + r.bad.join(',')); };
  // WEAPONS: the sheet from the menu
  await p.evaluate(() => RET.menuOpen()); await tap(p, '#wpBtn'); await sleep(200);
  let st = await L(p); ok(`${lab}: weapons lesson on the first WEAPONS sheet`, st.open && st.id === 'weapons', JSON.stringify(st));
  if (st.open) check('weapons', await play(p, 'weapons'));
  ok(`${lab}: weapons cleared and remembered`, (await L(p)).seen.weapons === 2);
  await p.evaluate(() => { const b = document.getElementById('wpGo'); if (b) b.click(); }); await sleep(150);
  await p.evaluate(() => RET.menuOpen()); await tap(p, '#wpBtn'); await sleep(200);
  ok(`${lab}: weapons lesson shows once`, !(await L(p)).open); await p.evaluate(() => { const b = document.getElementById('wpGo'); if (b) b.click(); });
  // GARAGE: FORGE (merge), FORGE again (slots), SHIPS (play), then SKIP test via replay
  const tab = async t => { await p.evaluate(t => document.querySelector(`#garage .tabs button[data-t="${t}"]`).click(), t); await sleep(250); };
  await p.evaluate(() => window.__inv.open('title')); await sleep(300); await tab('forge');
  st = await L(p); ok(`${lab}: merge lesson on the first FORGE tab`, st.open && st.id === 'merge', JSON.stringify(st));
  if (st.open) check('merge', await play(p, 'merge'));
  await tab('tune'); await tab('forge');
  st = await L(p); ok(`${lab}: slots lesson on the next FORGE tab`, st.open && st.id === 'slots', JSON.stringify(st));
  if (st.open) check('slots', await play(p, 'slots'));
  await tab('tune'); await tab('ships'); st = await L(p); ok(`${lab}: ship lesson on the first SHIPS tab`, st.open && st.id === 'ship', JSON.stringify(st));
  if (st.open) check('ship', await play(p, 'ship'));
  await tab('tune'); await tab('ships'); ok(`${lab}: ship lesson shows once`, !(await L(p)).open);
  await p.evaluate(() => window.__inv.close()); await sleep(200);
  // STORY: stage 3 = counter, stage 2 = timing (before the run starts; the run starts after GOT IT)
  await p.evaluate(() => window.__lessons.start(3)); await sleep(250); st = await L(p);
  ok(`${lab}: counter lesson before the first stage 3`, st.open && st.id === 'counter', JSON.stringify(st));
  if (st.open) { check('counter', await play(p, 'counter')); await sleep(400); ok(`${lab}: stage 3 starts after LESSON CLEAR`, await p.evaluate(() => window.__lessons.running)); }
  await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  const tOn = await p.evaluate(() => !!(window.TIM && TIM.on));
  await p.evaluate(() => window.__lessons.start(2)); await sleep(250); st = await L(p);
  if (!tOn) ok(`${lab}: timing lesson skipped (timing flag off)`, !st.open);
  else { ok(`${lab}: timing lesson before stage 2 (flight school not finished)`, st.open && st.id === 'timing', JSON.stringify(st)); if (st.open) check('timing', await play(p, 'timing')); }
  await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  await p.evaluate(() => window.__lessons.start(3)); await sleep(250); ok(`${lab}: counter lesson shows once`, !(await L(p)).open); await p.evaluate(() => window.__lessons.quit()); await sleep(500);
  // REPLAY + SKIP: MENU > LESSONS
  await p.evaluate(() => { clearInterval(window.__lsBotI); window.__lsBotI = 0; RET.menuOpen(); }); await tap(p, '#lsBtn'); lay = lay.concat(await look(p)); await tap(p, '#lsL_weapons');
  st = await L(p); ok(`${lab}: MENU > LESSONS replays a mini stage`, st.open && st.id === 'weapons'); lay = lay.concat(await look(p));
  await tap(p, '#lsSkip'); ok(`${lab}: SKIP returns to the list`, !!(await p.$('#lsBack')) && !(await p.evaluate(() => window.__lessons.ms)));
  await tap(p, '#lsBack'); ok(`${lab}: BACK closes the list`, !(await L(p)).open);
  // first-time SKIP on a fresh lesson: wipe only mnr_lessons.ship and reopen SHIPS
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('mnr_lessons')); delete s.ship; localStorage.setItem('mnr_lessons', JSON.stringify(s)); window.__inv.open('title'); }); await sleep(300);
  await tab('tune'); await tab('ships'); st = await L(p); const sk = st.open && st.id === 'ship'; if (sk) await tap(p, '#lsSkip'); st = await L(p);
  ok(`${lab}: SKIP closes a first-time lesson, it stays seen`, sk && !st.open && st.seen.ship === 1); await tab('tune'); await tab('ships');
  ok(`${lab}: a skipped lesson does not come back`, !(await L(p)).open); await p.evaluate(() => window.__inv.close());
  ok(`${lab}: lessons leave saves, stats and Neon untouched, no run live during one`, !keep.length && !live.length, 'storage ' + keep.join(',') + ' live ' + live.join(','));
  ok(`${lab}: one short line, text >= 13 px inside the screen, buttons >= 44 px`, !lay.length, [...new Set(lay)].slice(0, 5).join(' | '));
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
