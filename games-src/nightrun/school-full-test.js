#!/usr/bin/env node
// Nightrun SCHOOL FULL test (flag RET.schoolfull, parts/schoolfull.js): every Flight School drill (22: tut steps, counter foes, gate, fan, the 6 lesson mini
// stages, on foot) is a real lesson. An oracle bot drives each one headless (?sim=1 stepped by hand; lessons stepped through lsTick; on foot via FOOT.sim) with
// human-model pacing (one success per HUMAN s of game time after each rep starts) and asserts: an 8 s demo first, the first success alone never clears,
// exactly 3 rounds passed, duration >= 45 s and <= 180 s, the clear card / line shows the time; a hit in round 2 repeats that round; ?schoolfull=0 = old
// behaviour (one success clears). Phone viewport 390x763. Prints only PASS / FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/school-full-test.js     env: GAME_DIR=..., ONLY=id,id
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const out = [], ok = (name, pass, info) => { out.push(pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };
const PHONE = { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const HUMAN = 2.2, LS_HUMAN = 3.0;   // seconds of game time a competent player needs per success (fly drill rep / lesson phase)
const seed = () => { try { localStorage.setItem('mnr_tut', '2'); } catch (e) { } };
async function page(br, port, q) {
  const ctx = await br.newContext(PHONE), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(seed);
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&sim=1${q || ''}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && window.__tut && window.__school && window.__schoolfull, null, { timeout: 15000 }); await sleep(500); return { ctx, p, errs };
}
// in-page oracle driver for one drill: returns {T, rounds, firstOkCleared, demoT, res, card}
const drive = (p, id, opt) => p.evaluate(([id, HUMAN, LS_HUMAN, opt]) => {
  const SFh = __schoolfull, m = __mnr, kind = __school.kinds()[id];
  __school.run(id); const r = { kind, firstOkCleared: false, demoSeen: false, steps: 0, hitDone: false };
  const dt = 1 / 60; let repT = 0, lastK = -1, lastR = 0, seenOk = 0;
  if (kind === 'tut') { m.simOn(true); m.god = true; }
  if (kind === 'lesson') SFh.lsSim();
  for (let i = 0; i < 60 * 400; i++) {
    const s = SFh.state; if (!s) { r.err = 'no state'; break; }
    if (s.ph === 'demo') r.demoSeen = true;
    if (kind === 'tut') { m.step(dt); if (!__tut.on) break; }
    else if (kind === 'lesson') { SFh.lsStep(dt); if (s.ph === 'done') break; }
    else { if (!FOOT.S || !__school.foot) break; FOOT.S.P.inv = 9; FOOT.sim(dt); }
    const st = SFh.state; if (!st) break;
    if (st.ph === 'done') break;
    // reps: count time since the rep became playable
    const playable = kind === 'tut' ? st.ph === 'play' && st.gap <= 0 : kind === 'lesson' ? st.ph === 'play' && !st.state : st.ph === 'play';
    const key = st.r * 100 + (st.k || 0) + (st.pid ? st.pid.length * 1000 : 0) + st.fails * 1e5;
    if (key !== lastK) { lastK = key; repT = 0; }
    if (playable) repT += dt;
    if (opt.hitR2 && !r.hitDone && st.r === 2 && (st.k >= 1 || kind === 'lesson') && repT > .5) {
      r.hitDone = true; r.failsBefore = st.fails;
      if (kind === 'tut') { m.god = false; SFh.hit(); m.step(dt); m.god = true; }
      else if (kind === 'lesson') SFh.lsFail(); else { FOOT.S.hurts = (FOOT.S.hurts | 0) + 1; NR.emit('footKill', { id: 'x' }); }
      const a = SFh.state; r.afterHit = { r: a.r, fails: a.fails, k: a.k }; lastK = -1; continue;
    }
    if (playable && repT >= (kind === 'lesson' ? LS_HUMAN : HUMAN)) {
      if (kind === 'foot') NR.emit('footKill', { id: 'x', boss: false, x: 0, y: 0 }); else SFh.rep();
      repT = 0; lastK = -2; seenOk++;
      if (seenOk === 1) { r.firstOkState = null; }
    }
    if (seenOk >= 1 && !r.firstChecked) { const a = SFh.state; if (a && (kind !== 'tut' || a.k >= 1 || a.r >= 1)) { r.firstChecked = true; r.firstOkCleared = a.ph === 'done' || !!__school.res; } }
    r.steps = i;
  }
  if (kind === 'tut') { for (let i = 0; i < 120 && __tut.on; i++) m.step(dt); m.simOn(false); m.god = false; }
  const s = SFh.state; r.T = s && s.T; r.rounds = s && s.rounds; r.fails = s && s.fails; r.ph = s && s.ph;
  return r;
}, [id, HUMAN, LS_HUMAN, opt || {}]);
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const { ctx, p, errs } = await page(br, port, '');
    let ids = await p.evaluate(() => __school.ids); if (process.env.ONLY) ids = ids.filter(i => process.env.ONLY.split(',').includes(i));
    ok('flag on by default, 22 drills listed', await p.evaluate(() => __schoolfull.on) && (process.env.ONLY || ids.length === 22), ids.length);
    for (const id of ids) {
      const r = await drive(p, id);
      await sleep(600);
      const card = await p.evaluate(k => k === 'lesson' ? (document.getElementById('lsLine') || {}).textContent || '' : (document.getElementById('tutC') || {}).textContent || '', r.kind);
      const res = await p.evaluate(() => __school.res);
      const good = r.demoSeen && !r.firstOkCleared && r.rounds === 3 && r.T >= 45 && r.T <= 180 && r.ph === 'done' && /\d+ s/.test(card) && (r.kind === 'lesson' || (res && res.pass && res.id === id));
      ok(`drill ${id} (${r.kind}): demo, 3 rounds, ${r.T ? r.T.toFixed(0) : '?'} s, first success alone never clears`, good, JSON.stringify({ demo: r.demoSeen, first: r.firstOkCleared, rounds: r.rounds, T: r.T, ph: r.ph, card: card.slice(0, 60), res, err: r.err }));
      await p.evaluate(() => { for (const b of ['lsDone', 'schCardList']) { const e = document.getElementById(b); if (e) e.click(); } try { __school.shut(); } catch (e) { } }); await sleep(200);
    }
    // a hit in round 2 repeats that round (one of each kind)
    for (const id of ['dodge', 'l-weapons', 'foot'].filter(i => ids.includes(i))) {
      const r = await drive(p, id, { hitR2: true }); await sleep(400);
      ok(`drill ${id}: a hit in round 2 repeats round 2, then it still clears`, r.hitDone && r.afterHit && r.afterHit.r === 2 && r.afterHit.fails === r.failsBefore + 1 && r.rounds === 3 && r.ph === 'done', JSON.stringify(r.afterHit) + ' ' + r.rounds + ' ' + r.ph);
      await p.evaluate(() => { for (const b of ['lsDone', 'schCardList']) { const e = document.getElementById(b); if (e) e.click(); } try { __school.shut(); } catch (e) { } }); await sleep(200);
    }
    ok('progress (mnr_school / mnr_lessons) still counts every drill', (await p.evaluate(() => __school.done().length)) >= ids.length, await p.evaluate(() => __school.done().join(',')));
    ok('no page errors', !errs.length, errs.slice(0, 3).join('|')); await ctx.close();
    // ?schoolfull=0 reproduces the old behaviour: one success (tut, foot) / one pass of the phases (lesson) clears, no demo
    const o = await page(br, port, '&schoolfull=0'); const P0 = o.p;
    for (const id of ids) {
      const r = await P0.evaluate(async id => {
        const k = __school.kinds()[id], t0 = performance.now(); __school.run(id); await new Promise(r => setTimeout(r, 300));
        if (k === 'tut') { if (!__tut.on) return { k, err: 'not on' }; __mnr.simOn(true); __school.pass(); for (let i = 0; i < 240 && !__school.res; i++)__mnr.step(1 / 60); __mnr.simOn(false); return { k, res: __school.res }; }
        if (k === 'lesson') { const h = document.getElementById('lsHead').textContent; __schoolfull.lsSim(); let n = 0; for (let i = 0; i < 60 * 30 && !document.getElementById('lsDone'); i++) { if (__schoolfull.lsWin()) n++; __schoolfull.lsStep(1 / 60); } return { k, h, n, done: !!document.getElementById('lsDone') }; }
        for (let i = 0; i < 3; i++) NR.emit('footKill', { id: 'x' }); await new Promise(r => setTimeout(r, 700)); return { k, res: __school.res };
      }, id);
      const good = r.k === 'lesson' ? r.done && !/DEMO|ROUND/.test(r.h) && r.n <= 2 : r.res && r.res.pass && r.res.id === id;
      ok(`?schoolfull=0 ${id}: old behaviour, one success clears`, good, JSON.stringify(r));
      await P0.evaluate(() => { for (const b of ['lsDone', 'schCardList']) { const e = document.getElementById(b); if (e) e.click(); } try { __school.shut(); } catch (e) { } }); await sleep(150);
    }
    ok('?schoolfull=0: no page errors', !o.errs.length, o.errs.slice(0, 3).join('|')); await o.ctx.close();
  } catch (e) { ok('test run', false, e.message.split('\n')[0]); }
  await br.close(); srv.kill();
  const bad = out.filter(x => !x).length; console.log(bad ? `FAIL ${bad} of ${out.length}` : `PASS all ${out.length}`); process.exit(bad ? 1 : 0);
})();
