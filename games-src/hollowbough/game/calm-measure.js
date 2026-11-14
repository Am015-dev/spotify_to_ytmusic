// Calm-play measure: plays normal games (html.calm) through the real page with touch taps and counts what made the owner call it "confusing and distracting".
//   NODE_PATH=/opt/node-tools/node_modules node calm-measure.js [games=2] [sizes=375x667,375x553]
// Counts (all must hold): continuous animations = 0, helpers on screen at once <= 1, bulb / idle-nudge targets off screen = 0, silent taps = 0.
// A "helper" is: the kit's bubble/ring/finger (bulb answer, one helper), the ghost finger, an idle-nudge outline; the tab dot counts when it competes with another.
const PW = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const NG = +process.argv[2] || (process.env.QUICK ? 1 : 2), SIZES = (process.argv[3] || '375x667,375x553').split(',').map(s => s.split('x').map(Number));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T = { loops: 0, bulbSamples: 0, selTaps: 0, qHandTaps: 0, anim: 0, helpersMax: 0, bulbOff: 0, nudgeOff: 0, silent: 0, bulbTaps: 0, nudges: 0, deadTaps: 0, prepTaps: 0, games: 0 }; let bad = 0;
function fail(tag, m) { bad++; if (bad < 40) console.log('FAIL', tag, m); }
async function game(browser, W, H, gi) {
  const tag = `${W}x${H} g${gi}`;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => fail(tag, 'pageerror ' + e.message));
  await p.goto(URL); await sleep(500);
  const seed = 22 + gi;
  await p.evaluate(s => { try { localStorage.clear(); } catch (e) { } UI.seed = s; AIDELAY = 50; UI.opt = { np: 2, level: 'normal', solo: 1 }; newGame('vs'); }, seed);
  await sleep(500);
  if (!(await p.evaluate(() => document.documentElement.classList.contains('calm')))) fail(tag, 'not a calm game');
  T.games++;
  const sample = () => p.evaluate(() => {
    const vis = e => { if (!e || e.closest('[hidden]')) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; };
    const anims = document.getAnimations().filter(a => { try { return a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity; } catch (e) { return false; } }).map(a => a.effect.target).filter(e => e && vis(e)).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).split(' ').slice(0, 3).join('.'));
    const kit = !!document.querySelector('.gxh-bub.on,.gxh-ring,.gxh-finger'), f = document.getElementById('finger'), fing = !!(f && !f.hidden && getComputedStyle(f).display !== 'none'), nudge = !!document.querySelector('.nudge');
    const dot = [...document.querySelectorAll('.pv-tab.hot:not(.on)')].some(e => getComputedStyle(e, '::after').display !== 'none');
    const n = (kit ? 1 : 0) + (fing ? 1 : 0) + (nudge ? 1 : 0);
    return { anims, helpers: n + (n && dot ? 1 : 0), kit, fing, nudge, dot };
  });
  const inView = `(r, pad) => { if (!r || r.width < 2) return false; pad = pad || 0; const l = r.left + pad, t = r.top + pad, rt = r.right - pad, b = r.bottom - pad; const vw = Math.max(0, Math.min(rt, innerWidth) - Math.max(l, 0)), vh = Math.max(0, Math.min(b, innerHeight) - Math.max(t, 0)); return vw * vh >= 0.7 * (rt - l) * (b - t) && (l + rt) / 2 > 0 && (l + rt) / 2 < innerWidth && (t + b) / 2 > 0 && (t + b) / 2 < innerHeight; }`;   // target (ring minus its 4px padding): centre on screen and at least 70% of it visible
  let steps = 0;
  for (; steps < 700; steps++) {
    const st = await p.evaluate(() => ({ over: G.phase === 'over', cards: UI.cards.length, busy: !!UI.animBusy, mine: (() => { const a = HB.actor(G); return a >= 0 && !G.players[a].ai; })() }));
    if (st.over && !st.cards) break;
    if (st.cards) { const ok = await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (ok) await ok.tap().catch(() => { }); await sleep(150); continue; }
    if (!st.mine || st.busy) { await sleep(100); continue; }
    if (steps % 3 === 0) {
      const hc = await p.evaluate(() => { if (!G.q || UI.sel) return null; const e = [...document.querySelectorAll('.hc')].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) .contains(x) || x.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); }); if (!e || e.classList.contains('glow')) return null; document.getElementById('toast').classList.remove('on'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, kind: G.q.kind }; });
      if (hc) { T.qHandTaps++; await p.touchscreen.tap(hc.x, hc.y); await sleep(150); const tx = await p.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('on') ? e.textContent : ''; }); if (!tx) { T.silent++; fail(tag, 'silent hand-card tap during choice ' + hc.kind); } }
    }
    const s = await sample(); if (s.anims.length) { T.anim++; fail(tag, 'continuous animation: ' + s.anims.slice(0, 4).join(' | ')); }
    if (s.helpers > T.helpersMax) T.helpersMax = s.helpers; if (s.helpers > 1) fail(tag, 'helpers at once ' + s.helpers + ' ' + JSON.stringify({ kit: s.kit, finger: s.fing, nudge: s.nudge, dot: s.dot }));
    const hasPh = await p.evaluate(() => !!hlpPhase());
    // bulb: tap it like a finger; its ring, finger and target must be inside the screen
    if (hasPh && steps % 5 === 1) {
      const bb = await (await p.$('#bulbbtn')).boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(350); T.bulbTaps++;
      const r = await p.evaluate(`(() => { const inV = ${inView}; const ring = [...document.querySelectorAll('.gxh-ring:not(.from)')][0]; const f = document.querySelector('.gxh-finger'); const rr = ring && ring.getBoundingClientRect(); return { has: !!ring, ok: inV(rr, 4), box: rr && [rr.left, rr.top, rr.right, rr.bottom].map(Math.round).join(','), x: rr && Math.round(rr.left + rr.width / 2), y: rr && Math.round(rr.top + rr.height / 2), rules: !!document.querySelector('.gxh-rules'), fx: f && +f.dataset.tx, fy: f && +f.dataset.ty }; })()`);
      if (r.has && (!r.ok || (r.fx != null && (r.fx < 0 || r.fx > W || r.fy < 0 || r.fy > H)))) { T.bulbOff++; fail(tag, 'bulb ring off screen at ' + r.x + ',' + r.y + ' box ' + r.box + ' tx ' + r.fx + ',' + r.fy); await p.screenshot({ path: path.join(__dirname, 'shots', 'calm_bulb_' + W + 'x' + H + '_' + gi + '.png') }).catch(() => { }); }
      // after a bulb tap: sample once a second (15 s for the first two taps of a game, 7 s after that); no infinite animation may run, and the ring and finger must be gone or still
      { const secs = T.bulbTaps % 7 < 2 ? 15 : 7; for (let k = 0; k < secs; k++) { const s2 = await sample(); T.bulbSamples++; if (s2.anims.length) { T.loops++; fail(tag, 'bulb answer still loops at ' + (k + 1) + ' s: ' + s2.anims.slice(0, 3).join(' | ')); } await sleep(1000); } }
      await p.evaluate(() => { GXH.hide(); document.querySelectorAll('.gxh-rules .gxh-x').forEach(e => e.click()); }); await sleep(100);
    }
    // idle nudge: fire it now; its outline (or nothing) must be on screen, and alone
    if (hasPh && steps % 5 === 3) {
      await p.evaluate(() => { hlpIdleClear(); hlpNudge(); }); await sleep(150); T.nudges++;
      const r = await p.evaluate(`(() => { const inV = ${inView}; const n = document.querySelector('.nudge'); const q = n && n.getBoundingClientRect(); const dot = [...document.querySelectorAll('.pv-tab.hot')].some(e => getComputedStyle(e, '::after').display !== 'none'); return { cls: n && (n.className + ' < ' + [...Array(4)].reduce((a) => { a.e = a.e && a.e.parentElement; a.s.push(a.e && (a.e.className + ':' + a.e.scrollLeft + '/' + a.e.scrollWidth + '/' + a.e.clientWidth)); return a; }, { e: n, s: [] }).s.join(' < ')), has: !!n, ok: inV(q), dot, x: q && Math.round(q.left), y: q && Math.round(q.top), kit: !!document.querySelector('.gxh-bub.on,.gxh-ring'), fing: !!(document.getElementById('finger') && !document.getElementById('finger').hidden) }; })()`);
      if (r.has && !r.ok) { T.nudgeOff++; fail(tag, 'idle nudge off screen at ' + r.x + ',' + r.y + ' ' + r.cls); }
      if (r.has && (r.dot || r.kit)) { T.helpersMax = Math.max(T.helpersMax, 2); fail(tag, 'nudge competes with ' + (r.dot ? 'tab dot' : 'kit')); }
      await p.evaluate(() => hlpIdleClear());
    }
    // silent taps: Prepare while workers remain; a hand card that cannot be built
    if (steps % 6 === 2) {
      const pb = await p.$('#acts .prep.dis');
      if (pb) { T.prepTaps++; await p.evaluate(() => document.getElementById('toast').classList.remove('on')); const b = await pb.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(120); const tx = await p.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('on') ? e.textContent : ''; }); if (!tx) { T.silent++; fail(tag, 'silent tap on Prepare with workers left'); } }
      const dead = await p.evaluate(() => { if (UI.sel || G.q) return null; const e = [...document.querySelectorAll('.hc:not(.glow)')].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && x.dataset.t && /^x:/.test(x.dataset.t) && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; }); if (!e) return null; document.getElementById('toast').classList.remove('on'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (dead) { T.deadTaps++; const logN = await p.evaluate(() => G.logN); await p.touchscreen.tap(dead.x, dead.y); await sleep(120); const tx = await p.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('on') ? e.textContent : ''; }); if (!tx) { T.silent++; fail(tag, 'silent tap on an unusable hand card'); } if (await p.evaluate(() => G.logN) !== logN) fail(tag, 'dead tap changed the game'); }
    }
    // play on: tap a glowing target (the bulb's own pick when none is on this tab)
    const tg = await p.evaluate(() => {
      let gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
      if (!gl.length) { try { computeRec(true); const m = UI.rec && UI.rec.m, el = m && hlpEl(m); if (el) { pvReveal(el); } } catch (e) { } gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; }); }
      gl.forEach(e => { if (e.closest('.hscroll,.pv-mead,.pv-scrolly')) pvReveal(e); });
      return gl.map(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }).filter(c => c.x > 0 && c.y > 0 && c.x < innerWidth && c.y < innerHeight);
    });
    if (!tg.length) { const pb = await p.$('#acts .pass'); if (pb) { await pb.tap().catch(() => { }); await sleep(120); const pb2 = await p.$('#acts .pass'); if (pb2) await pb2.tap().catch(() => { }); } await sleep(250); continue; }
    const pick = tg[Math.floor(Math.random() * tg.length)]; await p.touchscreen.tap(pick.x, pick.y); await sleep(250);
    // a second tap on the already-selected card must answer; a hand-card tap during a "tap a meadow card" choice must answer
    if (steps % 2 === 0) {
      const sel = await p.evaluate(() => { if (!UI.sel || !UI.tgEls[UI.sel.tg]) return null; const r = UI.tgEls[UI.sel.tg].getBoundingClientRect(); if (r.width < 4 || r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight) return null; document.getElementById('toast').classList.remove('on'); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (sel) { T.selTaps++; await p.touchscreen.tap(sel.x, sel.y); await sleep(150); const tx = await p.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('on') ? e.textContent : ''; }); if (!tx) { T.silent++; fail(tag, 'silent second tap on the selected card'); } else await p.evaluate(() => { UI.sel = null; render(); }); }
    }
  }
  if (!(await p.evaluate(() => G.phase === 'over'))) fail(tag, 'game did not finish in ' + steps + ' steps');
  console.log(tag, 'done, steps', steps); await ctx.close();
}
let URL;
(async () => {
  URL = await gx.url('hollowbough', { file: path.join(__dirname, 'hollowbough.html') });
  require('fs').mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) for (let g = 0; g < NG; g++) await game(b, W, H, g).catch(e => fail(`${W}x${H} g${g}`, 'crash ' + String(e.message).slice(0, 200)));
  await b.close();
  console.log('CALM MEASURE: games ' + T.games + ', continuous-animation samples ' + T.anim + ', max helpers at once ' + T.helpersMax + ', bulb taps ' + T.bulbTaps + ' (off-screen ' + T.bulbOff + '), idle nudges ' + T.nudges + ' (off-screen ' + T.nudgeOff + '), Prepare taps ' + T.prepTaps + ', dead-card taps ' + T.deadTaps + ', after-bulb samples ' + T.bulbSamples + ' (loops ' + T.loops + '), second taps on a selected card ' + T.selTaps + ', hand taps in a choice ' + T.qHandTaps + ', silent taps ' + T.silent);
  console.log(bad ? 'CALM FAIL ' + bad : 'CALM PASS'); process.exit(bad ? 1 : 0);
})();
