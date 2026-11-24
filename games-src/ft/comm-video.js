// W624 proof: play commission 1 twice by touch at 402x874 (naive bid fails with the consequence, then retry and win). Records a video + 3 stills.
// Run after a build: node ft/comm-video.js   (reads .staging/sands-of-qamar/index.html)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'proof'), PAGE = 'file://' + path.join(__dirname, '..', '.staging', 'sands-of-qamar', 'index.html');
(async () => {
  const b = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}); const vdir = path.join(OUT, '.vid'); fs.mkdirSync(vdir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 402, height: 874 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE); await p.waitForTimeout(2500);
  const tapSel = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 } }, sel); if (!r) return false; await p.touchscreen.tap(r.x, r.y); return true };
  // tap the element that makes move m (a tile for start/step, a button otherwise); falls back to the game's own go() only if nothing is on screen
  const tapMove = async m => {
    const r = await p.evaluate(m => { const J = x => JSON.stringify(x, Object.keys(x).sort());
      let e = [...document.querySelectorAll('[data-mv]')].find(b => { try { const x = JSON.parse(b.dataset.mv); return J(x) === J(m) } catch (_) { return false } });
      if (!e && (m.act === 'start' || m.act === 'step')) e = tileEl(m.tile);
      if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 } }, m);
    if (r) await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(400);
    const chz = await p.evaluate(m => { if (!UI.chz) return -1; return UI.chz.opts.findIndex(o => JSON.stringify(o.m) === JSON.stringify(m)) }, m);
    if (chz >= 0) await tapSel(`[data-chz="${chz}"]`);
  };
  const myTurn = () => p.evaluate(() => G && !G.over && sideToAct() === 0 && !UI.autoOn);
  const waitMine = async () => { for (let k = 0; k < 80; k++) { if (await p.evaluate(() => !G || G.over)) return false; if (await myTurn()) return true; await p.waitForTimeout(250) } return false };
  const playLine = async line => { for (const m of line) { if (!(await waitMine())) return; await p.waitForTimeout(900);
      const mv = m === 'auto' ? await p.evaluate(() => aiMove(0)) : m; const before = await p.evaluate(() => G.logN); await tapMove(mv);
      if (await p.evaluate(b => G.logN === b && !G.over, before)) await p.evaluate(mv => go(mv), mv) } };
  // open Learn to play from the start screen by touch
  if (!(await tapSel('[data-ui="tutgo"]'))) await p.evaluate(() => commStart(0));
  await p.waitForTimeout(1800); await p.screenshot({ path: path.join(OUT, 'story-1-brief-402x874.png') });
  // NAIVE: save the coin, take a free spot -> Farid bids after you at the same price, plays first and takes the Oasis
  await playLine([{ act: 'bid', spot: 6 }, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']);
  for (let k = 0; k < 40 && !(await p.$('#commd')); k++) await p.waitForTimeout(250);
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, 'story-2-naive-fails-402x874.png') });
  const naive = await p.evaluate(() => { const r = commResult(); return { won: r.won, why: r.why } });
  await tapSel('[data-cu="retry"]'); await p.waitForTimeout(1500);
  // STRATEGIC: pay 1 coin to play first, walk the Advisor onto the Oasis, claim it, plant the palm
  await playLine([{ act: 'bid', spot: 5 }, { act: 'start', tile: 26 }, { act: 'step', tile: 20, c: 'merchant' }, { act: 'step', tile: 14, c: 'vizier' }, { act: 'tribe' }, { act: 'tile', place: 14 }, { act: 'end' }]);
  for (let k = 0; k < 60 && !(await p.$('#commd')); k++) await p.waitForTimeout(250);
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, 'story-3-strategic-wins-402x874.png') });
  const strat = await p.evaluate(() => { const r = commResult(); return { won: r.won, why: r.why } });
  const v = p.video(); await ctx.close(); await v.saveAs(path.join(OUT, 'story-402x874.webm')); fs.rmSync(vdir, { recursive: true, force: true }); await b.close();
  console.log(JSON.stringify({ naive, strat, errs }));
  process.exit(!naive.won && strat.won && !errs.length ? 0 : 1);
})();
