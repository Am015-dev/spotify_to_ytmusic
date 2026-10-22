#!/usr/bin/env node
// SHEET TESTER in the Lab (parts/lab/lab3.js, flag RET.lab3). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/lab3-test.js     env: GAME_DIR=<dir with index.html>, SHOTS=<dir> saves screenshots there (never in git)
//  (a) ON FOOT viewer and FLIGHT viewer both have the SHEET TESTER button; it opens the tester on the character/state shown
//  (b) ALL STATES: every state of the character is drawn, all feet on one road line
//  (c) a generated sheet dropped with setInputFiles (a copy of the current art) is drawn at game scale: same height and feet as the current art; USE puts it
//      in ART for this session (viewer + PLAY TEST), UNDO puts the old art back
//  (d) a deliberately mis-padded sheet (40% extra headroom) is flagged by the report ('shrinks'); the frame guess reads the width
//  (e) share link ?footlab=1&who=..&act=..&l3=one opens that view
//  (f) perf at 2560x1440 dpr 2: every tester canvas <= 2.3 MP, <= 31 draws a second, no draws while hidden; prints frames/s and main-thread ms per second
//  (g) phone 390x763 dpr 2: no text < 14 css px, tap targets >= 44 px, no sideways scroll; 0 page errors; ?lab3=0 = no tester
const { boot, open, sleep, ok, done, PW } = require('./lib.js');
const SHOTS = process.env.SHOTS;
const make = (p, k, pad) => p.evaluate(([k, pad]) => {   // a PNG strip from the current art of k; pad = extra empty rows on top (fraction of the cell)
  const meta = LAB3._S(k), img = LAB3.img(k); const n = meta[0], w = meta[2], h = meta[3], H = Math.round(h * (1 + pad)), c = document.createElement('canvas'); c.width = n * w; c.height = H;
  const g = c.getContext('2d'); for (let i = 0; i < n; i++) g.drawImage(img, i * w, 0, w, h, i * w, H - h, w, h); return c.toDataURL('image/png').split(',')[1];
}, [k, pad]);
async function audit(p) {
  return p.evaluate(() => {
    const R = document.getElementById('l3P'); const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; for (let q = e; q; q = q.parentElement) { const cs = getComputedStyle(q); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
    const small = [], tiny = [], side = [];
    for (const e of [R, ...R.querySelectorAll('*')]) {
      if (!vis(e)) continue; const cs = getComputedStyle(e);
      const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|SELECT)$/.test(e.tagName);
      if (txt && parseFloat(cs.fontSize) < 14) small.push(e.tagName + ' ' + cs.fontSize + ' ' + (e.textContent || '').trim().slice(0, 20));
      if (/^(BUTTON|INPUT|SELECT)$/.test(e.tagName)) { const r = e.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) tiny.push((e.id || e.textContent.trim().slice(0, 16)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      if (/(auto|scroll)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 2) side.push(e.tagName + '.' + e.className);
    }
    return { small: small.slice(0, 5), tiny: tiny.slice(0, 5), side, page: document.documentElement.scrollWidth > innerWidth + 1 };
  });
}
async function perf(br, base, q, fn) {   // frames drawn per second and main-thread ms per second over 3 s at 2560x1440 dpr 2
  const ctx = await br.newContext({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message)));
  await p.goto(base + q, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.FOOTVIEW && FOOTVIEW.on, null, { timeout: 20000 }); await sleep(800);
  if (fn) { await p.evaluate(fn); await sleep(1500); }
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  const m = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  const n0 = await p.evaluate(() => window.LAB3 && LAB3.on ? LAB3.n : FOOTVIEW._n), a = await m(); await sleep(3000); const b = await m(), n1 = await p.evaluate(() => window.LAB3 && LAB3.on ? LAB3.n : FOOTVIEW._n);
  const mp = await p.evaluate(() => [...document.querySelectorAll('#l3P canvas,#fvP canvas')].map(c => +(c.width * c.height / 1e6).toFixed(2)));
  await p.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })); const h0 = await p.evaluate(() => window.LAB3 && LAB3.on ? LAB3.n : FOOTVIEW._n); await sleep(1000); const h1 = await p.evaluate(() => window.LAB3 && LAB3.on ? LAB3.n : FOOTVIEW._n);
  const r = { fps: +((n1 - n0) / ((b.Timestamp - a.Timestamp))).toFixed(1), msPerS: +((b.TaskDuration - a.TaskDuration) * 1000 / (b.Timestamp - a.Timestamp)).toFixed(0), mp, hidden: h1 - h0, errs: p.errs };
  await ctx.close(); return r;
}
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 1440, 860, '?nomusic=1&footlab=1', 0, false);
    await p.waitForFunction(() => window.FOOTVIEW && FOOTVIEW.on && document.getElementById('fvL3'), null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => { FOOTVIEW.pick('kai'); });
    await p.click('#fvL3'); await sleep(400);
    const a = await p.evaluate(() => ({ on: LAB3.on, sh: LAB3.sheet }));
    ok('(a) ON FOOT viewer: SHEET TESTER opens on the shown character', a.on && a.sh === 'kai', JSON.stringify(a));
    // helpers for the generator (test only)
    // (b) grid
    await p.click('#l3Grid'); await p.waitForFunction(() => LAB3.drawn && LAB3.drawn.length === LAB3.states('kai').length, null, { timeout: 15000 }).catch(() => { });
    const g = await p.evaluate(() => ({ n: LAB3.drawn.length, want: LAB3.states('kai').length, ys: [...new Set(LAB3.drawn.map(d => Math.round(d.y)))] }));
    ok('(b) ALL STATES shows every state of Kai on one road line', g.n === g.want && g.n >= 5 && g.ys.length === 1, JSON.stringify(g));
    if (SHOTS) await p.screenshot({ path: SHOTS + '/l3-pc-grid.png' });
    // (c) a good dropped sheet (copy of kai/run) at game scale
    const act = await p.evaluate(() => LAB3.states('kai').find(a => a === 'run') || LAB3.states('kai')[1]);
    await p.evaluate(a => { LAB3.pick('kai', a); }, act); await p.click('#l3One');
    await p.waitForFunction(k => !!LAB3.img(k), 'kai/' + act, { timeout: 10000 }).catch(() => { });
    const good = await make(p, 'kai/' + act, 0);
    await p.setInputFiles('#l3File', { name: 'kai-' + act + '-test.png', mimeType: 'image/png', buffer: Buffer.from(good, 'base64') });
    await p.waitForFunction(() => LAB3.drop && LAB3.drawn && LAB3.drawn.some(d => d.drop), null, { timeout: 8000 }).catch(() => { });
    const c = await p.evaluate(() => { const d = LAB3.drawn, cur = d.find(x => !x.drop), me = d.find(x => x.drop), m = LAB3.dmeta(), o = LAB3._S('kai/' + LAB3.act); return { cur, me, frames: m[0], want: o[0] }; });
    ok('(c) a dropped sheet is drawn at game scale next to the current art (same height, same feet line, frames guessed from the width)',
      c.cur && c.me && Math.abs(c.cur.h - c.me.h) < 1 && Math.abs(c.cur.y - c.me.y) < 1 && c.frames === c.want, JSON.stringify(c));
    if (SHOTS) await p.screenshot({ path: SHOTS + '/l3-pc-drop.png' });
    const u = await p.evaluate(k => { const before = LAB3._S(k)[2]; document.getElementById('l3Use').click(); const inUse = LAB3._VB(k) === LAB3.drop.img && !!LAB3.ovr[k]; document.getElementById('l3Undo').click(); return { inUse, back: !LAB3.ovr[k] && !LAB3._VB(k) && LAB3._S(k)[2] === before }; }, 'kai/' + act);
    ok('(c) USE puts the sheet in the game art for this tab (viewer + PLAY TEST), UNDO restores the old art', u.inUse && u.back, JSON.stringify(u));
    // (d) mis-padded sheet: 40% more headroom
    const bad = await make(p, 'kai/' + act, .4);
    await p.setInputFiles('#l3File', { name: 'kai-' + act + '-padded.png', mimeType: 'image/png', buffer: Buffer.from(bad, 'base64') }); await sleep(600);
    const d = await p.evaluate(() => { const r = [...document.querySelectorAll('#l3Rep .l3r[data-drop]')].map(e => e.textContent); return { r, n: LAB3.dmeta()[0] }; });
    ok('(d) the report flags a mis-padded sheet with plain advice (it shrinks)', d.r.length === 1 && /shrinks \d+%/.test(d.r[0]) && /headroom/.test(d.r[0]), JSON.stringify(d).slice(0, 300));
    if (SHOTS) await p.screenshot({ path: SHOTS + '/l3-pc-report.png' });
    const link = await p.evaluate(() => { LAB3.pick('ninja', LAB3.states('ninja').find(a => a !== 'idle') || 'idle'); return { u: LAB3.link(), act: LAB3.act }; });
    await p.evaluate(() => LAB3.close());
    ok('0 page errors (PC)', p.errs.length === 0, p.errs.join(' | '));
    // (e) share link
    const q = link.u.slice(link.u.indexOf('?'));
    const p2 = await open(b.br, b.base, 1440, 860, q + '&nomusic=1', 0, false);
    await p2.waitForFunction(() => window.LAB3 && LAB3.on, null, { timeout: 20000 }).catch(() => { });
    const e = await p2.evaluate(() => ({ on: window.LAB3 && LAB3.on, sh: LAB3.sheet, act: LAB3.act, fv: FOOTVIEW.who }));
    ok('(e) the share link opens the same character and state', e.on && e.sh === 'ninja' && e.act === link.act && e.fv === 'ninja', JSON.stringify(e) + ' ' + q);
    await p2.context().close();
    // flight viewer entry
    const p3 = await open(b.br, b.base, 1440, 860, '?nomusic=1&lab=1&l2=viewer', 0, false);
    await p3.waitForFunction(() => document.getElementById('l2L3'), null, { timeout: 20000 }).catch(() => { }); await sleep(800);
    await p3.click('#l2L3').catch(() => { }); await sleep(800);
    const f = await p3.evaluate(() => ({ on: window.LAB3 && LAB3.on, sh: LAB3.sheet, n: (LAB3.drawn || []).length }));
    ok('(a) FLIGHT viewer: SHEET TESTER opens on the shown flight sheet', f.on && !/^kai/.test(f.sh) && f.n >= 1, JSON.stringify(f));
    if (SHOTS) await p3.screenshot({ path: SHOTS + '/l3-pc-flight.png' });
    ok('0 page errors (flight)', p3.errs.length === 0, p3.errs.join(' | ')); await p3.context().close();
    // (g) phone
    const ctx = await b.br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const ph = await ctx.newPage(); ph.errs = []; ph.on('pageerror', e => ph.errs.push(String(e.message)));
    await ph.goto(b.base + '?nomusic=1&footlab=1&who=ninja&l3=grid', { waitUntil: 'domcontentloaded' }); await ph.waitForFunction(() => window.LAB3 && LAB3.on, null, { timeout: 20000 }).catch(() => { }); await sleep(1500);
    const au = await audit(ph);
    ok('(g) phone: text >= 14 px, taps >= 44 px, no sideways scroll', !au.small.length && !au.tiny.length && !au.side.length && !au.page, JSON.stringify(au));
    if (SHOTS) { await ph.screenshot({ path: SHOTS + '/l3-phone-top.png' }); await ph.evaluate(() => document.querySelector('#l3P .l3main').scrollTo(0, 99999)); await sleep(300); await ph.screenshot({ path: SHOTS + '/l3-phone-bottom.png' }); }
    ok('0 page errors (phone)', ph.errs.length === 0, ph.errs.join(' | ')); await ctx.close();
    // (f) perf
    const before = await perf(b.br, b.base, '?nomusic=1&footlab=1', null);
    const after = await perf(b.br, b.base, '?nomusic=1&footlab=1', () => { LAB3.open('kai', 'run', 'grid'); });
    console.log('PERF 2560x1440 dpr2 · viewer alone: ' + before.fps + ' draws/s, ' + before.msPerS + ' main-thread ms/s, canvases ' + before.mp.join('+') + ' MP · sheet tester ALL STATES: ' + after.fps + ' draws/s, ' + after.msPerS + ' ms/s, canvases ' + after.mp.join('+') + ' MP, hidden ' + after.hidden + ' draws/s');
    ok('(f) perf: tester canvases <= 2.3 MP each, <= 31 draws/s, 0 draws while hidden, 0 errors', after.mp.length >= 3 && after.mp.every(x => x <= 2.3) && after.fps <= 31 && after.hidden === 0 && !after.errs.length, JSON.stringify(after));
    // ?lab3=0
    const p4 = await open(b.br, b.base, 1440, 860, '?nomusic=1&footlab=1&lab3=0', 0, false); await p4.waitForFunction(() => window.FOOTVIEW && FOOTVIEW.on, null, { timeout: 20000 }).catch(() => { });
    const o = await p4.evaluate(() => ({ l3: !!window.LAB3, btn: !!document.getElementById('fvL3') }));
    ok('?lab3=0: no tester, no button', !o.l3 && !o.btn, JSON.stringify(o)); await p4.context().close();
  } catch (e) { ok('no crash', false, e.stack); }
  await b.close(); done('lab3-test');
})();
