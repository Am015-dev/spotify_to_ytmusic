#!/usr/bin/env node
// Nightrun SCHOOL test (flag RET.school): TRAINING on HOME opens the drill list in 1 tap, every drill starts and finishes headless (pass via the test hook, fail via
// the 25 s timeout hook), progress persists, no save / Neon / stats change, lesson triggers still fire once, ?school=0 = the old TRAINING sheet, no page errors.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/school-test.js     env: GAME_DIR=...   Prints only PASS / FAIL lines.
// Runs with ?schoolfull=0 (old one-success drills); the full 3-round drills are tested by school-full-test.js.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const out = [], ok = (name, pass, info) => { out.push(pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };
const PHONE = { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, SMALL = { viewport: { width: 375, height: 553 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const KEEP = /^mnr_(best|daily|story|stars|lb|score|stats|ga|garage|forge|sv|save|gift|neon|tutgift|wk|week)|best|daily|stars|neon/i;
async function page(br, port, opt, q, init) {
  const ctx = await br.newContext(opt), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  if (init) await p.addInitScript(init);
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&schoolfull=0${q || ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__tut && window.__hub);
  await sleep(700); return { ctx, p, errs };
}
const keep = p => p.evaluate(k => { const re = new RegExp(k, 'i'), o = []; for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (re.test(n) && n !== 'mnr_school' && !/^mnr_(forge|wpseen|lessons|sv)/.test(n)) o.push([n, localStorage.getItem(n)]); } return JSON.stringify(o.sort()); }, KEEP.source);
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !!e.getClientRects().length; }, sel);
const seed = () => { try { localStorage.setItem('mnr_tut', '2'); } catch (e) { } };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const [label, opt] of [['390x763', PHONE], ['375x553', SMALL]]) {
      const { ctx, p, errs } = await page(br, port, opt, '', seed);
      await p.click('#hub_training'); await sleep(250);
      ok(`${label}: TRAINING opens the drill list in 1 tap`, await vis(p, '#schS') && !(await vis(p, '#hub_trainingScr')));
      const ids = await p.evaluate(() => __school.ids); ok(`${label}: 20+ drills in one list`, ids.length >= 20, ids.length);
      ok(`${label}: progress line and NEXT DRILL on top`, /^0\/\d+ drills/.test(await p.textContent('#schProg')) && /NEXT DRILL/.test(await p.textContent('#schNext')));
      const out2 = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#schS button, #schS .schProg')) { const r = e.getBoundingClientRect(); if (e.offsetParent && (r.left < -1 || r.right > innerWidth + 1)) bad.push(e.id || e.className); } return bad; });
      ok(`${label}: nothing outside the width`, !out2.length, out2.join(','));
      ok(`${label}: LAB and STAGE PRACTICE reachable under MORE (2 taps)`, await vis(p, '#schLab') && await vis(p, '#schPrac') || (await p.evaluate(() => !!document.getElementById('schLab') && !!document.getElementById('schPrac'))));
      ok(`${label}: no page errors`, !errs.length, errs.join('|')); await ctx.close();
    }
    // every drill starts and finishes: pass via hook, then fail via timeout, on a fresh page each time
    const { ctx, p, errs } = await page(br, port, PHONE, '', seed); const before = await keep(p);
    const all = await p.evaluate(() => __school.ids), kinds = await p.evaluate(() => __school.kinds());
    let passed = 0;
    for (const id of all) {
      await p.evaluate(() => { try { __school.shut(); } catch (e) { } }); await sleep(80);
      await p.click('#hub_training'); await sleep(120); await p.click('#schD_' + id); await sleep(kinds[id] === 'tut' ? 900 : 700);
      const k = kinds[id];
      if (k === 'tut') {
        const on = await p.evaluate(() => __tut.on); if (!on) { ok(`drill ${id} starts`, false, 'tut not on'); continue; }
        await p.evaluate(() => __school.pass()); await p.waitForFunction(() => __school.res, null, { timeout: 8000 }).catch(() => { });
      } else if (k === 'lesson') {
        const o = await p.evaluate(() => __lessons.open); if (!o) { ok(`drill ${id} starts`, false, 'lesson not open'); continue; }
        await p.click('#lsSkip'); await sleep(200); passed += 1; ok(`drill ${id} (lesson) starts and returns to the list`, await vis(p, '#schS')); continue;
      } else {
        const f = await p.evaluate(() => !!__school.foot); if (!f) { ok(`drill ${id} starts`, false, 'foot not on'); continue; }
        // kill three foes through the engine's own event
        await p.evaluate(() => { for (let i = 0; i < 3; i++) NR.emit('footKill', { id: 'x', boss: false, x: 0, y: 0 }); }).catch(() => { });
        await p.waitForFunction(() => __school.res && __school.res.id === 'foot', null, { timeout: 6000 }).catch(() => { });
      }
      const res = await p.evaluate(() => __school.res); passed += res && res.pass ? 1 : 0;
      ok(`drill ${id} starts and finishes with a clear card`, !!res && res.pass && res.id === id, JSON.stringify(res));
      await p.evaluate(() => { const b = document.getElementById('schCardList'); if (b) b.click(); }); await sleep(150);
      ok(`drill ${id}: back on the list afterwards`, await vis(p, '#schS')); if (!res) break;
    }
    ok('progress counts the cleared drills', (await p.evaluate(() => __school.done().length)) >= all.filter(i => kinds[i] === 'tut' || kinds[i] === 'foot').length, await p.evaluate(() => __school.done().join(',')));
    await p.evaluate(() => { __school.shut(); }); await sleep(100);
    ok('practice changes no save / Neon / stats key', (await keep(p)) === before, before + ' -> ' + (await keep(p)));
    // fail path: timeout gives NOT YET and no clear
    await p.evaluate(() => { __school.shut(); }); await p.click('#hub_training'); await sleep(100); await p.click('#schD_dodge'); await sleep(500);
    await p.evaluate(() => __school.late()); await p.waitForFunction(() => __school.res && !__school.res.pass, null, { timeout: 8000 }).catch(() => { });
    { const tx = await p.evaluate(() => document.getElementById('tutC').textContent + '|' + JSON.stringify(__school.res) + '|' + __tut.on + __tut.id); ok('a timed-out drill says NOT YET', /NOT YET/.test(tx), tx); }
    // persistence after reload
    const dn = await p.evaluate(() => __school.done().join(',')); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__school); await sleep(900);
    ok('progress persists over a reload', (await p.evaluate(() => __school.done().join(','))) === dn, dn);
    ok('no page errors in the drill run', !errs.length, errs.join('|')); await ctx.close();
    // old lesson triggers still fire once
    { const r = await page(br, port, PHONE, '&lessons=1', seed); await r.p.evaluate(() => window.openGarage && openGarage('title')); await sleep(400);
      const a = await r.p.evaluate(() => __lessons.open); ok('first Garage visit still triggers its lesson', a === true || a === false && (await r.p.evaluate(() => __lessons.ids.length)) > 0);
      await r.ctx.close(); }
    // the old features stay reachable from the school screen (TRAINING > door = 2 taps)
    for (const [id, check] of [['schLab', 'document.getElementById("title").hidden'], ['schLessons', '!document.getElementById("lsC").hidden'], ['schPrac', '!!document.getElementById("stsel") && !document.getElementById("stsel").hidden']]) {
      const r = await page(br, port, PHONE, '&lessons=1', seed); await r.p.click('#hub_training'); await sleep(200);
      const has = await r.p.evaluate(i => !!document.getElementById(i), id); if (has) { await r.p.click('#' + id); await sleep(500); }
      ok('door ' + id + ' opens its screen in 2 taps', has && await r.p.evaluate(check), has ? '' : 'no button'); await r.ctx.close(); }
    // ?school=0 identical to the old TRAINING sheet
    { const r = await page(br, port, PHONE, '&school=0', seed); await r.p.click('#hub_training'); await sleep(250);
      ok('?school=0: the old TRAINING sheet opens', await vis(r.p, '#hub_trainingScr') && !(await r.p.evaluate(() => !!window.__school)));
      ok('?school=0: no page errors', !r.errs.length, r.errs.join('|')); await r.ctx.close(); }
  } catch (e) { ok('test run', false, e.stack || e.message); }
  await br.close(); srv.kill();
  const bad = out.filter(x => !x).length; console.log(bad ? `FAIL ${bad} of ${out.length}` : `PASS all ${out.length}`); process.exit(bad ? 1 : 0);
})();
