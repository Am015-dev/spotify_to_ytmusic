// Plays the guided first game at 402x874 (touch) by following only the on-screen target, and checks every step:
// the guide bubble is within 120 px of its target, does not overlap it, and stays inside the screen.
// Run: node clarity-402x874.js   (needs via-tessera.html built; records clarity-402x874.webm next to this file)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..'), out = path.join(__dirname, '_vid');
const MAXTAPS = +(process.env.MAXTAPS || 140), NEED = ['arch-move', 'arch-build', 'pref', 'merc', 'buy'];
const gap = (a, b) => Math.max(0, Math.max(a.left - b.right, b.left - a.right)) + 0 * 0 + Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
const dist = (a, b) => Math.hypot(Math.max(0, a.left - b.right, b.left - a.right), Math.max(0, a.top - b.bottom, b.top - a.bottom));
const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
(async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: 402, height: 874 } } });
  const p = await ctx.newPage(); const errs = [], fails = []; let steps = 0, notes = 0, taps = 0, maxDist = 0, minGapSeen = 1e9;
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(root, 'via-tessera.html')); await p.waitForTimeout(1200);
  await p.tap('#tlearn'); await p.waitForTimeout(1500);
  const snapState = () => p.evaluate(() => {
    const t = VTUI.hintTarget(), g = document.querySelector('#gbub'), st = { ph: G.phase, busy: VTUI.UI.busy, seen: Object.keys(VTUI.UI.tipsSeen || {}) };
    if (!t || !g.classList.contains('on')) return Object.assign(st, { ready: false });
    const tr = t.getBoundingClientRect(), br = g.getBoundingClientRect(), pr = document.querySelector('#prompt').textContent;
    const cut = ['left', 'right', 'top', 'bottom'].reduce((o, k) => (o[k] = tr[k], o), {}); const bb = ['left', 'right', 'top', 'bottom'].reduce((o, k) => (o[k] = br[k], o), {});
    return Object.assign(st, { ready: true, t: cut, b: bb, text: g.textContent, prompt: pr, tx: tr.left + tr.width / 2, ty: tr.top + tr.height / 2, tw: tr.width, th: tr.height, vw: innerWidth, vh: innerHeight, side: g.className, tname: (t.className.baseVal ?? t.className) + '|' + t.id });
  });
  let idle = 0, last = '';
  while (taps < MAXTAPS) {
    const s = await snapState();
    if (s.ph !== 'play') break;
    if (NEED.every(k => s.seen.includes(k))) { console.log('guide covered all step kinds after', taps, 'taps'); break; }
    if (!s.ready) { await p.waitForTimeout(250); if (++idle > 60) { fails.push('no bubble/target for 15 s'); await p.screenshot({ path: path.join(out, 'stuck.png') }); break; } continue; }
    idle = 0; await p.waitForTimeout(450);                // let the camera and bubble settle
    const s2 = await snapState(); if (!s2.ready) continue; Object.assign(s, s2);
    steps++;
    const d = dist(s.b, s.t), ov = overlap(s.b, s.t), inside = s.b.left >= 0 && s.b.top >= 0 && s.b.right <= s.vw && s.b.bottom <= s.vh;
    maxDist = Math.max(maxDist, d);
    const tag = `step ${steps} [${s.tname.slice(0, 40)}] "${s.text.slice(0, 40)}" side=${s.side.replace(/bub|on|res/g, '').trim()} dist=${d.toFixed(0)} overlap=${ov.toFixed(0)}`;
    if (d > 120) fails.push(tag + ' TOO FAR'); if (ov > 0) fails.push(tag + ' OVERLAPS TARGET'); if (!inside) fails.push(tag + ' OFF SCREEN');
    if (!s.text.startsWith(s.prompt.slice(0, 20))) fails.push(tag + ' text differs from prompt');
    if (s.tx >= s.b.left && s.tx <= s.b.right && s.ty >= s.b.top && s.ty <= s.b.bottom) fails.push(tag + ' tap point under bubble');
    if (s.tw < 44 || s.th < 44) { if (!/colhit|hit|slothit/.test(s.tname) || true) if (s.tw < 44 || s.th < 44) fails.push(tag + ` target ${s.tw | 0}x${s.th | 0} < 44`); }
    if (steps <= 6 || steps % 10 === 0) console.log(tag);
    await p.touchscreen.tap(s.tx, s.ty); taps++;
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => { const e = document.querySelector('#note'); return e.classList.contains('on') ? e.textContent : ''; });
    if (n) { notes++; if (notes <= 5) console.log('  result bubble: ' + n); }
  }
  await p.waitForTimeout(800);
  const final = await p.evaluate(() => ({ turn: G.turn, sc: G.pl.map(x => 0) , prompt: document.querySelector('#prompt').textContent }));
  console.log(`steps ${steps} taps ${taps} result bubbles ${notes} maxDist ${maxDist.toFixed(0)}px errors ${errs.length}`, errs.slice(0, 3));
  await p.screenshot({ path: path.join(out, 'end.png') });
  const vp = p.video(); await ctx.close(); await b.close();
  fs.copyFileSync(await vp.path(), path.join(__dirname, 'clarity-402x874.webm'));
  if (fails.length || errs.length || steps < 10) { console.log('FAIL (' + fails.length + ')\n' + fails.slice(0, 15).join('\n')); process.exit(1); }
  console.log('PASS: all ' + steps + ' guide bubbles within 120 px of their target, none overlapping it');
})();
