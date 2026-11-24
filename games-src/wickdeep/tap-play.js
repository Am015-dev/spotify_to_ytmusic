// Plays Wickdeep through REAL touch taps only (no engine calls), like a person following the glows. Screenshots each step.
// node tap-play.js [width] [height] [steps] [outdir] [video]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const W = +process.argv[2] || 375, H = +process.argv[3] || 667, STEPS = +process.argv[4] || 60, OUT = process.argv[5] || '/tmp/claude-0/tap', VIDEO = process.argv[6] === 'video';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: VIDEO ? 1 : 1, hasTouch: true, isMobile: true }, VIDEO ? { recordVideo: { dir: OUT, size: { width: W, height: H } } } : {}));
  const p = await ctx.newPage(); const errs = []; let shot = 0, dead = 0, taps = 0;
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'wickdeep.html'));
  await p.waitForTimeout(800);
  const snap = async (n) => { if (!VIDEO || shot < 6) await p.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-${n}.png` }); };
  const tap = async (sel, ask) => { if (ask && (await p.evaluate(() => G && G.ask && G.ask.h)) !== ask) return false; const e = await p.$(sel); if (!e) return false; const bb = await e.boundingBox(); if (!bb) return false; const before = await p.evaluate(() => JSON.stringify([window.G && G.ask, window.UI && UI.pick, window.UI && UI.sel, (document.querySelector('#start:not([hidden]),#camp:not([hidden]),#rs:not([hidden])') || {}).id || ''])); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); taps++; await p.waitForTimeout(250); const after = await p.evaluate(() => JSON.stringify([window.G && G.ask, window.UI && UI.pick, window.UI && UI.sel, (document.querySelector('#start:not([hidden]),#camp:not([hidden]),#rs:not([hidden])') || {}).id || ''])); if (before === after) { dead++; console.log("DEAD", sel, before, await p.evaluate(() => document.getElementById("prompt").textContent)); } return true; };
  await snap('title'); await tap('#playbtn0'); await p.waitForTimeout(400); await snap('brief'); await tap('#enterbtn'); await p.waitForTimeout(900);
  for (let i = 0; i < STEPS; i++) {
    await p.waitForFunction(() => !window.UI || !UI.busy, null, { timeout: 30000 }).catch(() => {});
    const st = await p.evaluate(() => ({ ask: G && G.ask && G.ask.h, done: !!(G && G.done), rs: !document.getElementById('rs').hidden, pick: !!UI.pick, sel: G && G.ask && G.ask.h === 'sel' ? (UI.sel[(WD.liveHeroes(G)[UI.tab] || {}).id] || []).length : 0 }));
    if (st.rs || st.done) { await p.waitForTimeout(1200); await snap('result'); break; }
    if (i % 3 === 0) await snap(st.ask || 'x');
    if (st.ask === 'sel') { if (st.sel < 2) { const loc = p.locator('#tray .cd:not(.sel)'), n = await loc.count(); await loc.nth((i * 3 + st.sel) % Math.max(1, n)).tap(); taps++; await p.waitForTimeout(200); } else await tap('#readybtn'); }
    else if (st.ask === 'first' || st.ask === 'second') { if (st.pick) await tap('#playbtn'); else { const ok = await tap('#tray .half.can'); if (!ok) await tap('#tray .basic button.can'); } }
    else if (st.ask === 'move' || st.ask === 'summon') { const hs = await p.$$('#hot .glow'); if (hs.length) { const bb = await hs[Math.floor(hs.length / 2)].boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); taps++; } else await tap('#pbtns .btn'); }
    else if (st.ask === 'target' || st.ask === 'heal') { if (!(await tap('#hot .glow'))) await tap('#pbtns .btn'); }
    else if (st.ask === 'srest' || st.ask === 'srest2' || st.ask === 'stunned') await tap('#pbtns .btn.go', st.ask);
    else if (st.ask === 'lrest' || st.ask === 'recover') await tap('#tray .cd');
    else if (st.ask === 'block') await tap('#pbtns .btn');
    await p.waitForTimeout(300);
  }
  const fin = await p.evaluate(() => ({ round: G && G.round, done: G && G.done, ask: G && G.ask && G.ask.h }));
  console.log(JSON.stringify(fin), 'taps', taps, 'dead', dead);
  console.log(errs.slice(0, 5).join('\n') || 'no errors');
  await ctx.close(); await b.close();
})();
