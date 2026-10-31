// W246 FLOW: title -> launch -> pause -> resume -> pause -> quit to title -> launch -> die -> game over -> fly again / title; stage clear + boss.
// Phone 390x763 and PC 1440x860, scripted as a bot (stepped, no wall-clock play). PASS/FAIL lines only. SHOTS=dir saves pause + game-over shots.
//   GAME_DIR=<dir with index.html> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/flow-test.js
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L;
const SHOTS = process.env.SHOTS;
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }, sel);
// a control is usable when it is >= 44 px both ways, inside the viewport and the element on top at its centre is itself (or inside it)
const usable = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return 'missing'; const r = e.getBoundingClientRect(); if (r.width < 44 || r.height < 44) return `small ${r.width | 0}x${r.height | 0}`;
  if (r.left < 0 || r.top < 0 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) return 'offscreen'; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'ok' : 'covered by ' + (t && (t.id || t.className || t.tagName)); }, sel);
const st = p => p.evaluate(() => ({ run: !!window.__mnr.G.live && !window.__mnr.G.over, over: !!window.__mnr.G.over, paused: !document.getElementById('pausem').hidden, title: !document.getElementById('title').hidden, overEl: !document.getElementById('over').hidden, fs: [...document.querySelectorAll('[id*=fs],[class*=fscard],[id*=install]')].filter(e => e.offsetParent && getComputedStyle(e).display !== 'none').map(e => e.id || e.className) }));
const resShown = p => p.evaluate(() => { const e = document.getElementById('stres'); return !!e && !e.hidden; });
// step until the result screen is up; the pit stop (upgrade shop) that follows a clear is passed with its SKIP button, like a player would
const toResult = async (p, n) => { for (let i = 0; i < n && !(await resShown(p)); i++) { if (await vis(p, '#shop')) { const u = await usable(p, '#shGo'); if (u !== 'ok') return 'pit SKIP ' + u; await p.click('#shGo'); await sleep(150); } await step(p, 60); } await sleep(600); return (await resShown(p)) ? 'ok' : 'no result'; };
const step = (p, n, dt) => p.evaluate(([n, dt]) => { for (let i = 0; i < n; i++) window.__mnr.step(dt || 1 / 60); }, [n, dt]);
async function flow(b, W, H, touch) {
  const T = `${W}x${H} `; const p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch);
  const clickB = async sel => { const bb = await p.locator(sel).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(120); };
  let s = await st(p); ok(T + 'title shown at load', s.title && !s.run, JSON.stringify(s));
  for (const id of ['#focFlight']) { const u = await usable(p, id); ok(T + 'title ' + id + ' usable', u === 'ok', u); }
  await clickB('#focFlight'); await sleep(700); await step(p, 30); s = await st(p); ok(T + 'launch starts a run', s.run && !s.title && !s.paused, JSON.stringify(s)); ok(T + 'no install/fullscreen card over play', s.fs.length === 0, s.fs.join());
  if (touch) { const u = await usable(p, '#bPause'); ok(T + 'touch pause button usable', u === 'ok', u); await clickB('#bPause'); } else await p.keyboard.press('p');
  await sleep(150); s = await st(p); ok(T + 'pause opens', s.paused, JSON.stringify(s));
  for (const id of ['#resumeBtn', '#restartBtn', '#quitBtn']) { const u = await usable(p, id); ok(T + 'pause ' + id + ' usable', u === 'ok', u); }
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/pause-${W}.png` });
  const t0 = await p.evaluate(() => window.__mnr.G.t); await step(p, 60); ok(T + 'game frozen while paused', (await p.evaluate(() => window.__mnr.G.t)) === t0);
  await clickB('#resumeBtn'); await sleep(1700); await step(p, 20);   // resume counts 3-2-1 for <= 1.5 s
   s = await st(p); ok(T + 'resume returns to play', s.run && !s.paused, JSON.stringify(s));
  await p.evaluate(() => window.__mnr.G.t); if (touch) await clickB('#bPause'); else await p.keyboard.press('p'); await sleep(150);
  await clickB('#quitBtn'); await sleep(150); s = await st(p); ok(T + 'quit goes to title', s.title && !s.run && !s.paused && !s.overEl, JSON.stringify(s));
  await clickB('#focFlight'); await sleep(700); await step(p, 30); s = await st(p); ok(T + 'launch again after quit', s.run && !s.title, JSON.stringify(s));
  const kill = async () => { await p.evaluate(() => { const m = window.__mnr; m.P.inv = 0; m.P.sh = 0; m.P.hp = 0; if (m.hurt) m.hurt(99); }); for (let i = 0; i < 8 && !(await st(p)).overEl; i++) await step(p, 60); await sleep(700); };
  await p.evaluate(() => { window.__mnr.G.score = 1234; }); await kill(); s = await st(p);
  ok(T + 'death shows game-over screen', s.overEl && !s.run, JSON.stringify(s));
  const stat = await p.evaluate(() => ({ eye: document.getElementById('overEyebrow').textContent, sc: document.getElementById('oScore').textContent }));
  ok(T + 'game over says why and shows the score', stat.eye.length > 3 && /\d/.test(stat.sc), JSON.stringify(stat));
  for (const id of ['#againBtn', '#menuBtn']) { const u = await usable(p, id); ok(T + 'over ' + id + ' usable', u === 'ok', u); }
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/over-${W}.png` });
  await clickB('#againBtn'); await step(p, 30); s = await st(p); ok(T + 'retry starts a run', s.run && !s.overEl, JSON.stringify(s));
  await kill(); s = await st(p); ok(T + 'second death shows game over', s.overEl, JSON.stringify(s));
  await clickB('#menuBtn'); await sleep(150); s = await st(p); ok(T + 'over TITLE returns to title', s.title && !s.overEl && !s.run, JSON.stringify(s));
  // stage clear (timed goal) -> result screen
  await clickB('#focFlight'); await sleep(700); await step(p, 30);
  await p.evaluate(() => window.__mnr.ST.clear(false)); const r1 = await toResult(p, 12);
  ok(T + 'stage clear shows a result screen', r1 === 'ok', r1);
  for (const id of ['#srRetry', '#focTitle']) { const u = await usable(p, id); ok(T + 'result ' + id + ' usable', u === 'ok', u); }
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/clear-${W}.png` });
  await clickB('#srRetry'); await step(p, 30); s = await st(p); ok(T + 'result RETRY starts a run', s.run && !(await resShown(p)), JSON.stringify(s));
  // boss: fly to the boss gate, kill the boss
  const boss = await p.evaluate(async () => { const m = window.__mnr; m.G.dbar = m.ST.lead + 3; for (let i = 0; i < 1500 && !m.G.boss; i++) { m.P.inv = 9; m.step(1 / 60); } return !!m.G.boss; });
  ok(T + 'boss appears', boss);
  if (boss) { await p.evaluate(() => { const m = window.__mnr; m.G.boss = null; m.G.en = []; m.ST.bossDown({ nm: 'TEST BOSS' }, 1000); });   // boss armour (bosses/armour.js) holds hp, so enter at the game's own bossDown hand-off
    const r2 = await toResult(p, 20);
    ok(T + 'boss kill ends in the result screen', r2 === 'ok', r2); if (SHOTS) await p.screenshot({ path: `${SHOTS}/boss-${W}.png` });
    await clickB('#focTitle'); await sleep(150); s = await st(p); ok(T + 'result TITLE returns to title', s.title && !s.run, JSON.stringify(s)); }
  s = await st(p); if (!s.title) await clickB('#focTitle');
  // dying in the clear banner must not turn a cleared stage into "stage failed"
  await clickB('#focFlight'); await sleep(700); await step(p, 30);
  await p.evaluate(() => { const m = window.__mnr; m.ST.clear(true); m.P.inv = 0; m.P.sh = 0; m.P.hp = 0; m.hurt(99); });
  const r3 = await toResult(p, 20); s = await st(p); ok(T + 'dying after a clear still shows the clear result, not game over', r3 === 'ok' && !s.overEl, r3 + ' ' + JSON.stringify(s));
  ok(T + 'no page errors', p.errs.length === 0, p.errs.join('|'));
  await p.context().close();
}
// W292 PROGRESSION: clear 1 -> NEXT STAGE -> 2 -> NEXT STAGE -> 3 by real clicks; the save survives a reload (FLIGHT says Stage 3, the row replays 1..3); a corrupt save falls back to Stage 1 without errors.
async function chain(b, W, H, touch) {
  const T = `${W}x${H} chain: `; const p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch);
  const clickB = async sel => { const bb = await p.locator(sel).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(120); };
  const label = () => p.evaluate(() => { const l = document.getElementById('focStage'); return l ? l.textContent : 'none'; });
  const rowN = () => p.evaluate(() => { const r = document.getElementById('focStages'); return !r || r.hidden ? 0 : r.querySelectorAll('button').length; });
  const stageN = () => p.evaluate(() => window.__mnr.ST.n);
  const back = async () => { await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(500); };
  ok(T + 'fresh save: FLIGHT says Stage 1, no stage row', (await label()) === 'Stage 1' && (await rowN()) === 0, (await label()) + ' row ' + (await rowN()));
  await clickB('#focFlight'); await sleep(700); await step(p, 30); ok(T + 'FLIGHT starts stage 1', (await stageN()) === 1 && (await st(p)).run);
  for (const n of [1, 2]) {
    await p.evaluate(() => window.__mnr.ST.clear(false)); const r = await toResult(p, 20); ok(T + 'stage ' + n + ' clear shows the result screen', r === 'ok', r);
    const u = await usable(p, '#srNext'); ok(T + 'stage ' + n + ' result: NEXT STAGE usable (not hidden by focus mode)', u === 'ok', u);
    if (SHOTS && n === 1) await p.screenshot({ path: `${SHOTS}/next-${W}.png` });
    await clickB('#srNext'); await sleep(700); await step(p, 30); ok(T + 'NEXT STAGE click starts stage ' + (n + 1), (await stageN()) === n + 1 && (await st(p)).run && !(await resShown(p)), 'stage ' + (await stageN()));
  }
  await back(); ok(T + 'after reload FLIGHT continues at Stage 3', (await label()) === 'Stage 3', await label());
  ok(T + 'after reload the stage row offers 1..3', (await rowN()) === 3, 'n=' + (await rowN()));
  const u3 = await usable(p, '#focS1'); ok(T + 'stage row button 1 usable', u3 === 'ok', u3); if (SHOTS) await p.screenshot({ path: `${SHOTS}/title-stages-${W}.png` });
  await clickB('#focS2'); await sleep(700); await step(p, 30); ok(T + 'stage row replays stage 2', (await stageN()) === 2 && (await st(p)).run, 'stage ' + (await stageN()));
  await back(); await p.evaluate(() => localStorage.setItem('mnr_story', '{"stars":')); await back();
  ok(T + 'corrupt save: title still works and says Stage 1', (await label()) === 'Stage 1' && (await rowN()) === 0, await label());
  await p.evaluate(() => localStorage.setItem('mnr_story', 'null')); await back(); ok(T + 'null save falls back to Stage 1', (await label()) === 'Stage 1', await label());
  ok(T + 'no page errors', p.errs.length === 0, p.errs.join('|'));
  await p.context().close();
}
async function fsCard(b) {   // iOS Safari card: appears on the title after 2.5 s, must not cover LAUNCH, and must be gone once a run starts
  const p = await open(b.br, b.base, 390, 763, '?nomusic=1', { mnr_fscard: '0' }, true); await sleep(3000);
  const seen = await vis(p, '#fsCard'); ok('390x763 fullscreen card shown on iOS title (precondition)', seen, 'card not shown');
  if (seen) { const u = await usable(p, '#focFlight'); ok('390x763 fullscreen card does not cover LAUNCH', u === 'ok', u); }
  await p.evaluate(() => document.getElementById('focFlight').click()); await sleep(700);
  ok('390x763 fullscreen card gone when the run starts', !(await vis(p, '#fsCard')) && (await st(p)).run, JSON.stringify(await st(p)));
  await p.context().close();
}
(async () => { const b = await boot(); try { await flow(b, 390, 763, true); await flow(b, 1440, 860, false); await chain(b, 390, 763, true); await chain(b, 1440, 860, false); await fsCard(b); } finally { await b.close(); } done('flow'); })();
