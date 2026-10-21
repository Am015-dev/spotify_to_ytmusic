#!/usr/bin/env node
// (c) save/resume: play a story stage, quit mid-stage, reload: progress / Neon / unlocks persist, nothing is awarded or duplicated by the quit, reload or a second quit; then clear a stage, reload, check stars.
const { boot, open, ok, done, sleep } = require('./lib');
const KEYS = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^mnr_(sv|svauto|svinfo|svbk|svpre)/.test(k) || /time|stamp|seen|last/i.test(k)) continue; o[k] = localStorage.getItem(k); } return o; });
const dups = o => { const out = []; const walk = (v, path) => { if (Array.isArray(v)) { const prim = v.filter(x => x !== null && typeof x !== "object"); if (new Set(prim).size < prim.length) out.push(path); v.forEach((x, i) => walk(x, path + '[' + i + ']')); } else if (v && typeof v === 'object') for (const k in v) walk(v[k], path + '.' + k); };
  for (const k in o) { let v; try { v = JSON.parse(o[k]); } catch (e) { continue; } walk(v, k); } return out; };
const diff = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k]);
(async () => {
  const B = await boot(); const SEED = { mnr_bank: '500', mnr_tut: '2', mnr_tutgift: '1', mnr_runs: '5', mnr_story: '{"stars":{"1":3},"snap":{},"all":false}', mnr_own: '{"ship_wasp":true}' };
  const p = await open(B.br, B.base, 390, 763, '?sim=1', SEED);
  const bank = () => p.evaluate(() => +localStorage.getItem('mnr_bank')), stars = () => p.evaluate(() => (JSON.parse(localStorage.getItem('mnr_story') || '{}').stars) || {});
  await p.evaluate(() => { __mnr.simOn(true); __mnr.startStory(2); __mnr.god = true; });
  await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 }).catch(() => { });
  ok('stage 2 starts', await p.evaluate(() => __mnr.running && __mnr.ST.on));
  const b0 = await bank();
  for (let i = 0; i < 40; i++) { await p.evaluate(() => { __mnr.touchTo(200 + 80 * Math.sin(Math.random() * 6), 500); for (let k = 0; k < 30; k++) __mnr.step(1 / 60); }); }
  const earned = await p.evaluate(() => (__mnr.G.neon || __mnr.G.bankd || 0));
  await p.evaluate(() => { __mnr.abort(); }); await sleep(1700);
  const s1 = await KEYS(p), b1 = await bank();
  ok('quit mid-stage: Neon never goes down', b1 >= b0, `${b0} -> ${b1}`);
  ok('quit mid-stage: no star for the unfinished stage', !(await stars())[2] && (await stars())[1] === 3, JSON.stringify(await stars()));
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(600);
  const s2 = await KEYS(p);
  const dv = diff(s1, s2).filter(k => !/^mnr_(tipdone|fscard)$/.test(k));
  ok('reload: every progress key identical to before the reload', !dv.length, dv.slice(0, 5).map(k => k + ' ' + String(s1[k]).slice(0, 40) + ' => ' + String(s2[k]).slice(0, 40)).join(' | '));
  ok('reload: unlock (ship_wasp) still owned', await p.evaluate(() => !!__mnr.GA.own.ship_wasp));
  ok('reload: Neon / stage-1 stars restored in memory', await p.evaluate(b => __mnr.GA.bank === b && __mnr.sSave.stars[1] === 3, b1));
  // second and third quit/reload cycle: no growth from nothing
  for (let c = 0; c < 2; c++) {
    await p.evaluate(() => { __mnr.simOn(true); __mnr.startStory(2); }); await sleep(300);
    await p.evaluate(() => { for (let k = 0; k < 20; k++) __mnr.step(1 / 60); __mnr.abort(); }); await sleep(1700);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(600);
  }
  const b3 = await bank(), st3 = await stars();
  ok('3 short quit/reload cycles: Neon only grows by what a 0.3 s run can earn', b3 - b1 < 60 && b3 >= b1, `${b1} -> ${b3}`);
  ok('3 cycles: stars unchanged', st3[1] === 3 && !st3[2], JSON.stringify(st3));
  // clear stage 2, reload
  await p.evaluate(() => { __mnr.simOn(true); __mnr.startStory(2); __mnr.god = true; }); await sleep(300);
  await p.evaluate(() => { for (let k = 0; k < 120; k++) __mnr.step(1 / 60); __mnr.ST.finish(); }); await sleep(2000);
  const sc = await stars(), bc = await bank();
  ok('clearing stage 2 saves at least 1 star', (sc[2] | 0) >= 1, JSON.stringify(sc));
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(600);
  ok('after reload the stage-2 stars and Neon are the same', JSON.stringify(await stars()) === JSON.stringify(sc) && (await bank()) === bc, `${JSON.stringify(sc)} ${bc} -> ${JSON.stringify(await stars())} ${await bank()}`);
  const all = await KEYS(p), dp = dups(all);
  ok('no duplicate entries in any saved list', !dp.length, dp.join(' '));
  ok('no page errors', !p.errs.length, p.errs[0]);
  await B.close(); done('save');
})().catch(e => { console.log('FAIL save crash :: ' + e.message); process.exit(1); });
