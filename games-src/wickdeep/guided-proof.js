// Plays the guided first game at 402x874 touch by tapping ONLY where the coach bubble points (window.coachTarget),
// plus the one button any overlay offers. Records proof/redesign-402x874.webm. node guided-proof.js [maxSteps]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const MAX = +process.argv[2] || 400, OUT = path.join(__dirname, 'proof'), VD = path.join(OUT, 'vid-tmp');
(async () => {
  fs.mkdirSync(VD, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, recordVideo: { dir: VD, size: { width: 402, height: 874 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'wickdeep.html')); await p.waitForTimeout(900);
  const tapEl = async loc => { const bb = await loc.boundingBox(); if (!bb) return false; await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };
  await tapEl(p.getByRole('button', { name: 'Learn to play' }).first()); await p.waitForTimeout(800);
  let taps = 0, noTarget = 0, res = null, shots = 0;
  for (let i = 0; i < MAX; i++) {
    await p.waitForFunction(() => !window.UI || !UI.busy, null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(250);
    const st = await p.evaluate(() => ({ done: !!(window.G && G.done), rs: !document.getElementById('rs').hidden, start: !document.getElementById('start').hidden, camp: !document.getElementById('camp').hidden, lesson: !!document.querySelector('#lesson:not([hidden]) #inspx'), t: window.coachTarget && coachTarget(), ask: window.G && G.ask && G.ask.h, fight: window.G && G.figs.some(f => f.team === 'm' && f.pos && E.seen(G, f.pos)) }));
    if (st.rs || st.done) { await p.waitForTimeout(1500); res = await p.evaluate(() => ({ won: G.won, round: G.round, text: document.getElementById('rs').innerText.slice(0, 80) })); await p.screenshot({ path: path.join(OUT, 'after/end.png') }); break; }
    if (st.fight && shots < 1) { shots++; await p.screenshot({ path: path.join(OUT, 'after/fight-guided.png') }); }
    if (st.lesson) { await tapEl(p.locator('#inspx')); taps++; continue; }
    if (st.start || st.camp) { const go = p.locator('.ov:not([hidden]) .btn.go').first(); if (await go.count()) { await tapEl(go); taps++; continue; } }
    if (i % 15 === 0) console.log(i, st.ask, await p.evaluate(() => G.round + " " + document.getElementById("prompt").textContent.slice(0, 50)), JSON.stringify(st.t));
    if (st.t) { await p.touchscreen.tap(st.t.x, st.t.y); taps++; noTarget = 0; continue; }
    noTarget++; if (noTarget === 3) console.log("no target", st.ask, await p.evaluate(() => document.getElementById("pbtns").innerHTML.slice(0, 300) + " busy=" + UI.busy));
    if (noTarget > 20) { console.log('STUCK: no coach target, ask=' + st.ask); break; }
  }
  console.log(JSON.stringify({ taps, res, errs: errs.slice(0, 3) }));
  const v = p.video(); await ctx.close(); await b.close();
  fs.renameSync(await v.path(), path.join(OUT, 'redesign-402x874.webm')); fs.rmSync(VD, { recursive: true, force: true });
})();
