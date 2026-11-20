// Records the first 3 minutes of a Play game at 375x667 (touch, human pace, the 3-tap turn) to proof/first-3-minutes-375x667.webm.
// Usage: node proof-record.js [seconds=180]
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
const SECS = +process.argv[2] || 180, OUT = path.join(__dirname, 'proof'), TMP = path.join(OUT, 'tmp');
(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: TMP, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(), t0 = Date.now(), W = ms => p.waitForTimeout(ms), errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem('wm-prefs', JSON.stringify({ played: 1, offered: 1 })); } catch (e) { } });
  await p.goto('file://' + path.join(__dirname, 'wildmark.html')); await p.waitForSelector('#playB'); await W(1500);
  await p.tap('#playB'); await W(2500);
  const goal = p.locator('#goalB, .goalc button, #goal button'); if (await goal.count()) { await goal.first().tap().catch(() => { }); await W(800); }
  const at = sel => p.evaluate(s => { for (const e of document.querySelectorAll(s)) { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const h = document.elementFromPoint(x, y); if (h && (h === e || e.contains(h) || h.closest(s) === e)) return [x, y]; } return null; }, sel);
  let turns = 0, taps = 0;
  while (Date.now() - t0 < SECS * 1000) {
    const ok = await p.waitForFunction(() => G && (G.over || (!G.seats[G.cur].ai && G.stage === 'pick' && document.querySelector('#mk .mt:not([disabled])'))), null, { timeout: 30000 }).then(() => 1, () => 0);
    if (!ok || await p.evaluate(() => G.over)) break;
    await W(1600);
    const col = await p.evaluate(() => { const b = document.querySelector('#mk .pair.top'); return b ? +b.dataset.i : 0; });
    await p.locator(`#mk .mt[data-i="${col}"]`).tap(); taps++; await W(1500);
    const sp = await p.evaluate(() => { const env = G.seats[G.cur].env; let best = null, bv = -99; for (const c of WM.spots(env)) { const v = pvSpotBest(env, c); const e = document.querySelector('#map polygon.spot[data-c="' + c + '"]'); if (!e) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; if (document.elementFromPoint(x, y) !== e) continue; if (v > bv) { bv = v; best = [x, y]; } } return best; });
    if (!sp) break; await p.touchscreen.tap(sp[0], sp[1]); taps++; await W(1800);
    const tg = await at('#map g.tgt');
    if (tg) { await p.touchscreen.tap(tg[0], tg[1]); taps++; } else { await p.locator('#okB').tap(); taps++; }
    turns++; await W(1500);
  }
  await W(1200); const v = p.video(); await ctx.close(); await b.close();
  const dst = path.join(OUT, 'first-3-minutes-375x667.webm'); fs.copyFileSync(await v.path(), dst); fs.rmSync(TMP, { recursive: true, force: true });
  console.log('recorded', Math.round((Date.now() - t0) / 1000) + 's', turns, 'turns', (taps / Math.max(1, turns)).toFixed(2), 'taps/turn', 'errors', errs.length, '->', path.relative(process.cwd(), dst));
})();
