// Sweep: plays full games against the computer through the real page with touch taps on glowing targets only.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=5] [sizes=390x763,375x553] [mode=vs]
// Fails on: page errors, a glowing target that does not respond, the ghost finger off a glowing target, chip scores that differ from
// the engine, anything stuck for 8 s, a covered glowing target, horizontal scroll, text over 8 words, a board under 55% (portrait).
// Prints "FAIL ..." lines and "SWEEP PASS" or "SWEEP FAIL n".
const PW = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'hollowbough.html'));
const NG = +process.argv[2] || 5, SIZES = (process.argv[3] || '390x763,375x553').split(',').map(s => s.split('x').map(Number)), MODE = process.argv[4] || 'vs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const fails = [];
function fail(tag, msg) { bad++; if (fails.length < 40) { fails.push(tag + ' ' + msg); console.log('FAIL', tag, msg); } }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
async function playGame(browser, W, H, gi, mode) {
  const tag = `${W}x${H} g${gi}`, R = rng(1000 + gi * 7 + W);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => fail(tag, 'pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) fail(tag, 'console ' + m.text().slice(0, 100)); });
  await p.goto('https://gns.test/'); await sleep(500);
  await p.evaluate(([m, s]) => { try { localStorage.clear(); } catch (e) { } UI.seed = s; AIDELAY = 50; UI.opt = { np: 2 + (s % 3), level: 'normal', solo: 1 }; newGame(m); }, [mode, 11 + gi * 3]);
  await sleep(400);
  const sig = () => p.evaluate(() => G ? G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length + G.q.opts.map(o => o.label).join('|') : '') + ':' + G.players.map(p => p.hand.length + '.' + p.dep.length).join(',') + ':' + JSON.stringify(G.players.map(p => [p.res, p.pts])) + ':' + G.phase + ':' + (UI.sel ? 'sel' : '') + ':' + UI.cards.length : 'x');
  let lastSig = '', lastT = Date.now(), steps = 0, passTaps = 0, shots = 0, dead = 0;
  for (; steps < 900; steps++) {
    const st = await p.evaluate(() => ({ over: G.phase === 'over', cards: UI.cards.length, busy: !!UI.animBusy, mine: (() => { const a = HB.actor(G); return a >= 0 && !G.players[a].ai; })(), q: G.q ? G.q.kind : '', logN: G.logN }));
    if (st.over) { if (!st.cards) break; }
    const s0 = await sig(); if (s0 !== lastSig) { lastSig = s0; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { fail(tag, 'stuck >8 s at ' + s0); await p.screenshot({ path: path.join(__dirname, 'shots', 'sweep_stuck_' + W + '.png') }).catch(() => { }); break; }
    if (st.cards) { const ok = await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (ok) { await ok.tap().catch(() => { }); await sleep(120); } else await sleep(150); continue; }
    if (!st.mine || st.busy) { await sleep(100); continue; }
    // checks on the table
    const chk = await p.evaluate(() => {
      const W = innerWidth, H = innerHeight, out = [];
      const de = document.documentElement; if (de.scrollWidth > W + 1) out.push('hscroll ' + de.scrollWidth + '>' + W);
      const b = document.querySelector('[data-board]'); if (!b) out.push('no data-board'); else if (H > W) { const r = b.getBoundingClientRect(); const pc = Math.round(100 * r.width * r.height / (W * H)); if (pc < 55) out.push('board ' + pc + '%'); }
      // chip scores vs engine
      document.querySelectorAll('.chip').forEach(c => { const s = c.dataset.seat; const t = (c.querySelector('.cp') || {}).textContent || ''; const eng = s === 'G' ? HB.grimScore(G).total : HB.score(G, +s).total; if (t.replace(/[^0-9-]/g, '') !== String(eng)) out.push('score chip ' + s + ' shows ' + t + ' engine ' + eng); });
      // text over 8 words in the play area
      document.querySelectorAll('#board *, .gx-bar #prompt').forEach(e => { if (e.closest('#zoom,#pc')) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const cs = getComputedStyle(e); if (cs.display.startsWith('inline') || cs.visibility === 'hidden') return; const w = (e.innerText || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(x => /[a-z][a-z]/i.test(x)); if (w.length > 8) out.push('text ' + w.length + ' words: ' + w.slice(0, 5).join(' ')); });
      // glowing targets: visible, on screen, not covered; finger on a glowing target
      const gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
      gl.forEach(e => { const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 0 || cy < 0 || cx > W || cy > H) { out.push('glow off screen ' + (e.dataset.t || e.className)); return; } const t = document.elementFromPoint(cx, cy); if (!t || !(e === t || e.contains(t) || t.contains(e))) { /* overlapped strip cards: any point of the element must be hittable */ let ok = false; for (const [fx, fy] of [[.15, .5], [.85, .5], [.5, .2], [.5, .8]]) { const q = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy); if (q && (e === q || e.contains(q))) ok = true; } if (!ok) out.push('glow covered ' + (e.dataset.t || e.className)); } });
      const f = document.querySelector('#finger'); if (f && !f.hidden && gl.length) { const br0 = document.querySelector('#board').getBoundingClientRect(), tipx = br0.left + parseFloat(f.style.left) + 19, tipy = br0.top + parseFloat(f.style.top) + 4; const hit = gl.some(e => { const r = e.getBoundingClientRect(); return tipx >= r.left - 6 && tipx <= r.right + 6 && tipy >= r.top - 6 && tipy <= r.bottom + 6; }); if (!hit) out.push('finger not on a glowing target'); }
      return out;
    });
    chk.forEach(c => fail(tag, c));
    if (chk.length && shots < 3) { shots++; await p.screenshot({ path: path.join(__dirname, 'shots', 'fail_' + W + '_' + gi + '_' + shots + '.png') }).catch(() => { }); console.log('  q:', await p.evaluate(() => G.q ? JSON.stringify({ kind: G.q.kind, title: G.q.title, opts: G.q.opts.map(o => o.label) }) : 'none')); }
    // choose a glowing target (prefer a tray chip when open)
    const tg = await p.evaluate(() => { const gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; }); return gl.map(e => { const r = e.getBoundingClientRect(); return { t: e.dataset.t || e.dataset.mi || e.className, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, tray: e.classList.contains('tchip') }; }); });
    if (!tg.length) {
      // nothing glows: only Pass is left (tap twice, it asks "Sure?")
      const pb = await p.$('#acts .pass'); if (!pb) { await sleep(150); continue; }
      passTaps++; await pb.tap().catch(() => { }); await sleep(120); const pb2 = await p.$('#acts .pass'); if (pb2) await pb2.tap().catch(() => { }); await sleep(250); continue;
    }
    const trays = tg.filter(x => x.tray); const pool = trays.length ? trays : tg;
    // the compact city strip opens full screen: 15 slots, nothing changes in the game, a glowing destination in it can be used, Done closes it
    if (R() < .06) {
      const cb = await p.$('.cityopen');
      if (cb) {
        const l0 = await p.evaluate(() => G.logN); await cb.tap().catch(() => { }); await sleep(250);
        const o = await p.evaluate(() => { const e = document.querySelector('#cityov'); if (!e) return null; const cells = e.querySelectorAll('.cvcell').length; const gl = [...e.querySelectorAll('.cvc.glow')].map(x => { const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); const other = document.querySelectorAll('#bd .glow:not(#cityov .glow):not(.tchip)').length; const de = document.documentElement; return { cells, gl, other, hs: de.scrollWidth > innerWidth + 1, logN: G.logN }; });
        if (!o) fail(tag, 'tap on the city strip did not open the city');
        else {
          if (o.cells < 15) fail(tag, 'city view shows ' + o.cells + ' slots');
          if (o.other) fail(tag, 'glow outside the open city view: ' + o.other);
          if (o.hs) fail(tag, 'hscroll in city view');
          if (o.logN !== l0) fail(tag, 'opening the city changed the game');
          if (o.gl.length && R() < .6) { await p.touchscreen.tap(o.gl[0].x, o.gl[0].y); await sleep(500); const gone = await p.evaluate(() => !document.querySelector('#cityov')); if (!gone) { fail(tag, 'city view stayed open after using a destination'); } if (await p.$('#cityov')) { const x = await p.$('#cityov .cvx'); if (x) await x.tap().catch(() => { }); } continue; }
          const x = await p.$('#cityov .cvx'); if (x) await x.tap().catch(() => { }); await sleep(200);
          if (await p.$('#cityov')) fail(tag, 'Done did not close the city view');
        }
        continue;
      }
    }
    // sometimes explore a non-glowing card (must not act): a dead-looking tap must not change the game
    if (R() < .04) { const n = await p.evaluate(() => { const e = document.querySelector('.sc:not(.glow),.mc:not(.glow):not(.empty)'); if (!e) return null; const r = e.getBoundingClientRect(); const c = [r.left + r.width / 2, r.top + r.height / 2]; const hit = document.elementFromPoint(c[0], c[1]); return { c, logN: G.logN, ok: !!hit }; }); if (n && n.ok) { await p.touchscreen.tap(n.c[0], n.c[1]); await sleep(200); const l2 = await p.evaluate(() => G.logN); if (l2 !== n.logN) fail(tag, 'tap on a non-glowing card changed the game'); const cv = await p.$('#cityov .cvx'); if (cv) { await cv.tap().catch(() => { }); await sleep(150); } } }
    const pick = pool[Math.floor(R() * pool.length)];
    const before = await sig();
    await p.touchscreen.tap(pick.x, pick.y);
    let changed = false; for (let k = 0; k < 15; k++) { await sleep(100); if ((await sig()) !== before) { changed = true; break; } }
    if (!changed) { await p.screenshot({ path: path.join(__dirname, 'shots', 'dead_' + W + '_' + gi + '.png') }).catch(() => { }); console.log('  q:', await p.evaluate(() => G.q ? JSON.stringify({ kind: G.q.kind, title: G.q.title, opts: G.q.opts.map(o => o.label), sel: !!UI.sel }) : 'none')); dead++; const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal === undefined ? e.className : 'svg') + ' in ' + ((e.closest('[data-a]') || {}).className || '?') : 'none'; }, [pick.x, pick.y]); fail(tag, 'glowing target did not respond (top element ' + hit + '): ' + pick.t + ' at ' + Math.round(pick.x) + ',' + Math.round(pick.y)); if (dead > 3) break; }
    if (steps === 40 && shots < 1 && gi === 0) { shots++; await p.screenshot({ path: path.join(__dirname, 'shots', 'sweep_mid_' + W + 'x' + H + '.png') }).catch(() => { }); }
  }
  const fin = await p.evaluate(() => G && G.phase === 'over' ? G.over.scores.map(s => s.total) : null);
  if (!fin) fail(tag, 'game did not finish in ' + steps + ' steps');
  console.log(tag, 'done', fin ? 'scores ' + fin.join('/') : 'UNFINISHED', 'steps', steps, 'passTaps', passTaps);
  await ctx.close();
}
(async () => {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const jobs = []; for (let g = 0; g < NG; g++) jobs.push(() => playGame(b, W, H, g, MODE).catch(e => fail(`${W}x${H} g${g}`, 'crash ' + String(e.message).slice(0, 160)))); for (let i = 0; i < jobs.length; i += 3) await Promise.all(jobs.slice(i, i + 3).map(f => f())); }
  await b.close();
  console.log(bad ? 'SWEEP FAIL ' + bad : 'SWEEP PASS');
  process.exit(bad ? 1 : 0);
})();
