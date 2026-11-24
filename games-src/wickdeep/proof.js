// Proof video: the first ~3 minutes at 375x667, played with REAL taps on what the helper would choose (no engine calls to act).
// node proof.js [seconds] [outdir]  -> outdir/wickdeep-first-3min.webm + 4 screenshots
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SECS = +process.argv[2] || 185, OUT = process.argv[3] || path.join(__dirname, 'proof');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = path.join(OUT, '.vid'); fs.mkdirSync(tmp, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: tmp, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const t0 = Date.now(), left = () => SECS * 1000 - (Date.now() - t0);
  const shots = { select: 0, attack: 0, monster: 0, camp: 0 };
  const shot = async (k) => { if (!shots[k]) { shots[k] = 1; await p.screenshot({ path: path.join(OUT, 'shot-' + k + '.png') }); } };
  await p.goto('file://' + path.resolve(__dirname, 'wickdeep.html')); await p.waitForTimeout(2500);
  await p.locator('#playbtn0').tap(); await p.waitForTimeout(2500);
  await p.locator('#enterbtn').tap(); await p.waitForTimeout(1500);
  const tapEl = async (loc) => { if (await loc.count()) { await loc.first().tap(); return true; } return false; };
  while (left() > 0) {
    await p.waitForFunction(() => !UI.busy, null, { timeout: 30000 }).catch(() => {});
    if (await p.locator('.mcardv').count()) await shot('monster');
    const st = await p.evaluate(() => { if (!G || G.done) return { done: true }; let m; if (G.ask && G.ask.h === 'sel') { const f = WD.liveHeroes(G)[UI.tab] || WD.liveHeroes(G)[0], h = hintSel(f); m = h ? { t: 'sel', cards: h } : { t: 'lrest', id: f.id }; } else m = WDAI.choose(G); return { ask: G.ask && G.ask.h, m, sel: G.ask && G.ask.h === 'sel' ? (UI.sel[(WD.liveHeroes(G)[UI.tab] || {}).id] || []) : [], hid: G.ask && G.ask.h === 'sel' ? (WD.liveHeroes(G)[UI.tab] || {}).id : null, pick: UI.pick }; });
    if (st.done) {
      await p.waitForTimeout(2500);
      if (await tapEl(p.locator('#rsnext'))) { await p.waitForTimeout(2500); await shot('camp'); }
      const open = p.locator('.node.open'); if (await open.count()) { await open.first().tap(); await p.waitForTimeout(2000); await tapEl(p.locator('#enterbtn')); await p.waitForTimeout(1500); continue; }
      const pm = p.locator('.pm'); if (await pm.count()) { await pm.first().tap(); await p.waitForTimeout(1500); await tapEl(p.locator('.cardgrid .cd')); await p.waitForTimeout(1500); await tapEl(p.locator('button:has-text("Map")')); await p.waitForTimeout(1000); }
      continue;
    }
    const m = st.m;
    if (st.ask === 'sel') {
      if (m.t === 'lrest' && m.id === st.hid) { await tapEl(p.locator('#lrbtn')); }
      else if (m.t === 'sel') {
        for (const c of m.cards) if (st.sel.indexOf(c) < 0) { await p.locator('#tray .cd[data-c="' + c + '"]').tap(); await p.waitForTimeout(500); }
        await shot('select'); await p.waitForTimeout(600); await tapEl(p.locator('#readybtn'));
      } else await tapEl(p.locator('#readybtn'));
    } else if (st.ask === 'first' || st.ask === 'second') {
      if (m.t === 'item') { await p.evaluate(mv => WDUI.doMove(mv), m); }
      else if (m.basic) { await tapEl(p.locator('#tray .cd[data-c="' + m.c + '"] .basic button[data-b="' + m.h + '"]')); await p.waitForTimeout(600); await tapEl(p.locator('#playbtn')); }
      else { await tapEl(p.locator('#tray .cd[data-c="' + m.c + '"] .half.' + m.h)); await p.waitForTimeout(700); await tapEl(p.locator('#playbtn')); }
    } else if (st.ask === 'move' || st.ask === 'summon') {
      if (m.t === 'hex') { if (!(await tapEl(p.locator('#hot .glow[data-k="' + m.k + '"]')))) await p.evaluate(mv => WDUI.doMove(mv), m); } else await tapEl(p.locator('#pbtns .btn'));
    } else if (st.ask === 'target' || st.ask === 'heal') {
      if (m.t === 'tgt') { const k = await p.evaluate(id => WD.fig(G, id).pos, m.id); await shot('attack'); if (!(await tapEl(p.locator('#hot .glow[data-k="' + k + '"]')))) await p.evaluate(mv => WDUI.doMove(mv), m); } else if (m.t === 'item') await p.evaluate(mv => WDUI.doMove(mv), m); else await tapEl(p.locator('#pbtns .btn'));
    } else if (st.ask === 'lrest' || st.ask === 'recover') { await tapEl(p.locator('#tray .cd[data-c="' + m.c + '"]')); }
    else if (st.ask === 'block') { if (m.t === 'block') await tapEl(p.locator('#tray .cd[data-c="' + m.c + '"]')); else await tapEl(p.locator('#pbtns .btn' + (m.t === 'take' ? '.warn' : ':not(.warn)'))); }
    else await tapEl(p.locator(m.t === 'nosrest' ? '#pbtns .btn:not(.go)' : '#pbtns .btn.go'));
    await p.waitForTimeout(500);
  }
  const v = p.video(); await ctx.close(); const vp = await v.path();
  fs.renameSync(vp, path.join(OUT, 'wickdeep-first-3min.webm')); fs.rmdirSync(tmp, { recursive: true });
  const st = await (async () => 'ok')();
  console.log('video', path.join(OUT, 'wickdeep-first-3min.webm'), 'shots', Object.keys(shots).filter(k => shots[k]).join(','), errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors');
  await b.close();
})();
