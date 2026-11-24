// Plays charter 1 twice by touch at 402x874: first the naive line, then (Replay from the debrief) the strategic line.
// Taps only on-screen option buttons / glowing hexes / debrief buttons; which option is naive is read from the charter state.
// Saves proof/story-402x874.webm and 3 stills. node story-touch.js [outDir]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2] || path.resolve(__dirname, '../proof');
(async () => {
  const b = await chromium.launch(), vp = { width: 402, height: 874 };
  const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1, recordVideo: { dir: out + '/vid', size: vp } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => { errs.push(e.message); if (process.env.DBG) console.log('PAGEERROR', e.stack.slice(0, 300)); });
  await pg.goto('file://' + path.resolve(__dirname, 'ochre-horizon.html') + '?fast=1'); await pg.waitForTimeout(800);
  const box = async sel => pg.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, hit: !!h && (h === e || e.contains(h)) }; }, sel);
  const issues = []; let taps = 0, stills = 0;
  const tap = async (sel, what) => { const t = await box(sel); if (!t) return false; if (t.w < 44 || t.h < 44) issues.push(`small ${what} ${Math.round(t.w)}x${Math.round(t.h)}`); if (!t.hit) issues.push('covered ' + what); await pg.touchscreen.tap(t.x, t.y); taps++; await pg.waitForTimeout(500); return true; };
  await tap('#stLearn', 'Learn to play');
  const results = [];
  for (const kind of ['naive', 'strategic']) {
    for (const t1 = Date.now(); Date.now() - t1 < 420000;) {
      const s = await pg.evaluate(() => { const R = CHUI.R, d = R && OHC.decision(R); return { ended: !!CHUI.R.result && document.getElementById('modal').classList.contains('on') && !!document.getElementById('chAgain'), d: d ? { kind: d.d.kind, naive: d.options.findIndex(o => o.naive), spaces: d.options.map(o => o.space || null) } : null }; });
      if (process.env.DBG && Math.random() < .03) console.log(JSON.stringify(s), await pg.evaluate(() => OH.G.gen + ' ' + OH.G.phase + ' ended ' + CHUI.R.ended + ' side ' + OH.sideToAct() + ' acts ' + OH.G.acts + ' busy ' + UI.busy + ' charter ' + UI.charter + ' last ' + JSON.stringify(CHUI.last.slice(-1)) + ' modal ' + document.getElementById('modal').classList.contains('on') + ' taken ' + JSON.stringify(CHUI.R.taken) + ' i ' + CHUI.R.i + ' pend ' + JSON.stringify(OH.G.pending) + ' mc ' + OH.G.pl[0].mc + ' hand ' + OH.G.pl[0].hand + ' tick ' + (Date.now() - CHUI.lastTick)));
      if (s.ended) break;
      if (!s.d) { await pg.waitForTimeout(200); continue; }
      let idx = kind === 'naive' ? s.d.naive : s.d.naive === 0 ? 1 : 0; if (idx < 0) idx = 0;
      await pg.waitForTimeout(1600);   // time to read the question on video
      if (stills < 2 && kind === 'naive') { await pg.screenshot({ path: `${out}/story-${++stills}-${stills === 1 ? 'decision' : 'consequence'}-402x874.png` }); }
      if (s.d.kind === 'place') await tap(`#hexes .hex[data-s="${s.d.spaces[idx]}"]`, 'hex option'); else await tap(`#chP [data-cho="${idx}"]`, 'option ' + idx);
    }
    await pg.waitForTimeout(1500);
    const r = await pg.evaluate(() => ({ ok: CHUI.R.result.ok, line: CHUI.R.result.line }));
    results.push(kind + ': ' + (r.ok ? 'WON' : 'LOST') + ' ' + r.line);
    if (kind === 'strategic') await pg.screenshot({ path: `${out}/story-3-debrief-402x874.png` });
    if (kind === 'naive') { await pg.screenshot({ path: `${out}/story-2-debrief-naive-402x874.png` }); await tap('#chAgain', 'Replay'); }
  }
  await pg.waitForTimeout(800); const vid = pg.video(); await ctx.close();
  fs.copyFileSync(await vid.path(), `${out}/story-402x874.webm`); fs.rmSync(out + '/vid', { recursive: true, force: true });
  console.log(results.join(' | '), '| taps', taps, '| pageerrors', errs.length, errs.slice(0, 2).join(' ; '), '| issues', issues.length, issues.slice(0, 5).join(' ; '));
  await b.close(); process.exit(errs.length || issues.length ? 1 : 0);
})();
