#!/usr/bin/env node
// POLISH B29 (stats, achievements, completion, credits). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/stats-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const AUDIT = ({ root, minPx }) => {
  const R = document.querySelector(root), out = { btn: [], txt: [], clip: [], n: 0 };
  if (!R) return { missing: true };
  const vp = { w: innerWidth, h: innerHeight };
  for (const e of R.querySelectorAll('button')) { const r = e.getBoundingClientRect(); if (!r.width) continue; out.n++; if (r.width < 43.5 || r.height < 43.5) out.btn.push((e.id || e.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); if (r.left < -0.5 || r.right > vp.w + 0.5) out.clip.push(e.id + ' x'); }
  const w = document.createTreeWalker(R, NodeFilter.SHOW_TEXT);
  for (let t; (t = w.nextNode());) { if (!t.textContent.trim()) continue; const e = t.parentElement; if (e.closest('svg') || !e.getBoundingClientRect().width) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < minPx - 0.01) out.txt.push(fs + 'px "' + t.textContent.trim().slice(0, 24) + '"');
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).textOverflow !== 'ellipsis' && getComputedStyle(e).overflow !== 'visible') out.clip.push('text ' + (e.className || e.tagName)); }
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', seed = null) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 800 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(s => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); if (s) for (const k in s) localStorage.setItem(k, s[k]); } } catch (e) { } }, seed);
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`);
    await p.waitForFunction(() => window.__mnr && window.RET && window.RET.st && (window.RET.titleDraw !== undefined || window.RET.title === false), null, { timeout: 9000 });
    await sleep(700); return p;
  };
  const tap = async (p, sel) => { await p.locator(sel).scrollIntoViewIfNeeded().catch(() => { }); const b = await p.locator(sel).boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; if (getComputedStyle(x).display === 'none') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, sel);

  // ---- flag off = nothing ----
  let p = await open(390, 763, '?stats=0');
  ok('off: flag is false', await p.evaluate(() => RET.stats === false));
  ok('off: no STATS button, no sheet, no % on the chip', await p.evaluate(() => !document.getElementById('statsBtn') && !document.getElementById('stSheet') && !document.getElementById('stPct')));
  await p.evaluate(() => { NR.emit('runStart', { daily: true }); NR.emit('perfect', { kind: 'dash' }); NR.emit('runEnd', { quit: true }); });
  await sleep(300);
  ok('off: nothing saved under mnr_stats', await p.evaluate(() => localStorage.getItem('mnr_stats') === null));
  await p.context().close();

  // ---- counters, unlocks, toasts, completion (phone) ----
  p = await open(390, 763);
  ok('on: STATS button in the menu', await (async () => { await tap(p, '#moreBtn'); await sleep(200); return await vis(p, '#statsBtn'); })());
  ok('on: title chip shows completion %', await p.evaluate(() => /\d+%/.test((document.getElementById('stPct') || {}).textContent || '')));
  ok('on: mnr_stats is in the export list', await p.evaluate(() => RET.sioKeys.includes('mnr_stats')));
  ok('on: 30 achievements, unique ids, hints and assets in the manifest', await p.evaluate(() => { const A = RET.st.A; return A.length === 30 && new Set(A.map(a => a.id)).size === 30 && A.every(a => a.n && a.d && a.g && 'bsg'.includes(a.t)); }));
  const man = require('./assets-manifest.json');
  ok('manifest has ach-<id>.webp 128x128 for all 30', await (async () => { const ids = await p.evaluate(() => RET.st.A.map(a => a.id)); return ids.every(i => man.some(e => e.file === `ach-${i}.webp` && e.w === 128 && e.h === 128)); })());
  ok('fresh save: nothing unlocked, completion small', await p.evaluate(() => Object.keys(RET.st.D().a).length === 0 && RET.st.completion() < 10));
  await p.evaluate(() => { __mnr.startStory(1); });
  await sleep(500);
  ok('story run started and counted', await p.evaluate(() => RET.st.S().runs === 1 && __mnr.running));
  await p.evaluate(() => {
    const E = (t, d) => NR.emit(t, d);
    for (let i = 0; i < 3; i++) E('kill', { e: { x: 300, y: 300, type: 'drone', score: 1 }, boss: false });
    E('kill', { e: { x: 300, y: 300, type: 'boss', score: 1 }, boss: true });
    for (let i = 0; i < 5; i++) E('graze', { pf: false });
    E('perfect', { kind: 'dash', x: 0, y: 0, combo: 1 }); E('perfect', { kind: 'shot', x: 0, y: 0, combo: 1 });
  });
  await sleep(1200);
  const s1 = await p.evaluate(() => ({ ...RET.st.S(), w: RET.st.D().w }));
  ok('events: kills 3, bosses 1, grazes 5, perfects 2, dashes 1', s1.kills === 3 && s1.bosses === 1 && s1.grazes === 5 && s1.perfects === 2 && s1.dashes === 1, JSON.stringify(s1));
  ok('events: play time and weapon time grow while live', s1.time > 0.5 && (s1.w.pulse || 0) > 0.5, JSON.stringify([s1.time, s1.w]));
  ok('unlock: boss1 (first boss) unlocked, boss10 not', await p.evaluate(() => !!RET.st.D().a.boss1 && !RET.st.D().a.boss10));
  const t1 = await p.evaluate(() => { const e = document.getElementById('achToast'); return e && e.className === 'show' && /Giant Slayer/.test(e.textContent); });
  ok('toast: shown for the unlock, non-blocking', t1 && await p.evaluate(() => getComputedStyle(document.getElementById('achToast')).pointerEvents === 'none'));
  // skill-gated rules: Assist never counts
  await p.evaluate(() => { window.__as = RET.assistRun; RET.assistRun = () => true; __mnr.ST.hits = 0; NR.emit('stageClear', { n: 1 }); });
  ok('assist: no-hit clear does not count', await p.evaluate(() => RET.st.S().noHit === 0 && !RET.st.D().a.nohit));
  await p.evaluate(() => { RET.assistRun = () => false; __mnr.ST.hits = 0; NR.emit('stageClear', { n: 1 }); });
  await sleep(300); await p.evaluate(() => RET.st.poll());
  ok('no-hit clear counts when not Assist, achievement unlocks', await p.evaluate(() => RET.st.S().noHit === 1 && !!RET.st.D().a.nohit));
  await p.evaluate(() => { RET.assistRun = () => true; NR.emit('runEnd', { story: 1, cleared: true, score: 5000, di: 0, kills: 4 }); });
  ok('assist: clear and best score count (Normal: no Hard credit anyway)', await p.evaluate(() => RET.st.S().hardClear === 0 && RET.st.S().clears === 1 && RET.st.S().bestScore === 5000 && RET.st.S().arcClears <= 1));
  await p.evaluate(() => { RET.assistRun = () => false; });
  // queue: one at a time, 2 s each
  const q = await p.evaluate(() => { RET.st.toast(RET.st.BY.clear1); RET.st.toast(RET.st.BY.clear10); RET.st.toast(RET.st.BY.story); return RET.st.toastQ(); });
  ok('toast queue: waits its turn', q >= 2, q);
  const names = [];
  for (let i = 0; i < 4; i++) { names.push(await p.evaluate(() => { const e = document.getElementById('achToast'); return e.className === 'show' ? e.querySelector('b').textContent : ''; })); await sleep(1100); }
  ok('toast queue: shows different toasts over time, never two at once', new Set(names.filter(Boolean)).size >= 2 && await p.evaluate(() => document.querySelectorAll('#achToast').length === 1), JSON.stringify(names));
  await sleep(6000);
  await p.evaluate(() => { __mnr.abort(); });
  // completion maths
  const cm = await p.evaluate(() => {
    const before = RET.st.completion(), parts = RET.st.parts(), W = parts.reduce((a, x) => a + x.w, 0), calc = Math.round(100 * parts.reduce((a, x) => a + x.w * x.f, 0) / W);
    for (let i = 1; i <= __mnr.MAIN; i++) __mnr.sSave.stars[i] = 3;
    const after = RET.st.completion(), pa = RET.st.parts();
    return { before, calc, after, story: pa.find(x => x.k === 'story').f, hasTale: pa.some(x => x.k === 'tale') };
  });
  ok('completion: equals the weighted sum, grows with stars, story part = 1', cm.calc === cm.before && cm.after > cm.before && cm.story === 1 && !cm.hasTale, JSON.stringify(cm));
  const tl = await p.evaluate(() => { RET.tale = { seen: 3, total: 6 }; const a = RET.st.parts().find(x => x.k === 'tale'); RET.tale = { seen() { throw new Error('x'); }, total: 6 }; const b = RET.st.parts().some(x => x.k === 'tale'); RET.tale = 'junk'; const c = RET.st.parts().some(x => x.k === 'tale'); delete RET.tale; return [a && a.f, b, c]; });
  ok('completion: story-log part read defensively (0.5 / ignored / ignored)', tl[0] === 0.5 && !tl[1] && !tl[2], JSON.stringify(tl));
  await p.evaluate(() => RET.st.poll()); await sleep(200);
  ok('story-derived unlocks (clear1, story, stars120) appear from the save', await p.evaluate(() => ['clear1', 'story', 'stars120', 'clear10'].every(i => RET.st.D().a[i])));
  // Hard: counts only when not Assist
  const hp = await open(390, 763, '', { mnr_set: JSON.stringify({ diff: 'hard' }) });
  await hp.evaluate(() => { __mnr.startStory(1); });
  await sleep(400);
  await hp.evaluate(() => { RET.assistRun = () => true; NR.emit('runEnd', { story: 1, cleared: true, score: 100, di: 0, kills: 1 }); });
  ok('hard: HARD is on in this page', await hp.evaluate(() => __mnr.HARD === true));
  ok('hard + Assist: no Hard credit', await hp.evaluate(() => RET.st.S().hardClear === 0 && !RET.st.D().a.hard));
  await hp.evaluate(() => { __mnr.abort(); RET.assistRun = () => false; __mnr.startStory(1); });
  await sleep(300);
  await hp.evaluate(() => { NR.emit('runEnd', { story: 1, cleared: true, score: 100, di: 0, kills: 1 }); RET.st.poll(); });
  ok('hard, no Assist: Hard credit and achievement', await hp.evaluate(() => RET.st.S().hardClear === 1 && !!RET.st.D().a.hard));
  await hp.context().close();
  // persistence + export round trip
  await p.evaluate(() => RET.st.save());
  const raw = await p.evaluate(() => localStorage.getItem('mnr_stats'));
  ok('saved under mnr_stats', !!raw && JSON.parse(raw).s.bosses === 1, raw && raw.slice(0, 80));
  const rt = await p.evaluate(() => { const pack = RET.sio.pack(), r = RET.sio.parse(pack); return { ok: r.ok, has: r.ok && !!r.keys.mnr_stats, why: r.reason }; });
  ok('export: pack parses and contains mnr_stats', rt.ok && rt.has, JSON.stringify(rt));
  await p.evaluate(() => { const pack = RET.sio.pack(); window.__pack = pack; localStorage.removeItem('mnr_stats'); });
  await p.evaluate(() => { RET.st.S().kills += 0; RET.st.poll(); });
  const rt2 = await p.evaluate(() => { const r = RET.sio.parse(window.__pack); const okI = RET.sio.doImport(r); RET.st.save(); return { okI, raw: localStorage.getItem('mnr_stats') }; });
  ok('import: stats key restored and not overwritten by the page', rt2.okI && !!rt2.raw && JSON.parse(rt2.raw).s.bosses === 1, JSON.stringify(rt2).slice(0, 120));
  await p.context().close();

  // ---- sheet layout, reset, credits ----
  for (const [w, h] of [[390, 763], [375, 553], [1280, 720]]) {
    const tag = ` ${w}x${h}`;
    p = await open(w, h, '', { mnr_story: JSON.stringify({ stars: { 1: 3, 2: 2, 3: 1 } }), mnr_stats: JSON.stringify({ v: 1, s: { runs: 12, time: 5000, kills: 1500, bosses: 11, grazes: 6000, perfects: 400, dashes: 60, fevers: 3, deaths: 8, bestScore: 123456, neon: 900, daily: 4, fuse: 70, clears: 3, arcClears: 1, hardClear: 0, noHit: 0 }, w: { pulse: 3000, laser: 900 }, a: { clear1: 1 }, arc: { 1: 1 } }) });
    await tap(p, '#moreBtn'); await sleep(250); await tap(p, '#statsBtn'); await sleep(300);
    ok('sheet: opens' + tag, await vis(p, '#stSheet'));
    const a = await p.evaluate(AUDIT, { root: '#stSheet', minPx: 14 });
    ok('sheet: buttons >= 44 px, text >= 14 px, nothing clipped' + tag, !a.btn.length && !a.txt.length && !a.clip.length, JSON.stringify(a));
    const lay = await p.evaluate(() => { const s = document.getElementById('stSheet'); return { hs: document.documentElement.scrollWidth > innerWidth + 1 || s.scrollWidth > s.clientWidth + 1, ach: s.querySelectorAll('.ac').length, locked: s.querySelectorAll('.ac:not(.got)').length, txt: s.textContent }; });
    ok('sheet: no horizontal scroll, 30 achievements, locked ones listed with a hint' + tag, !lay.hs && lay.ach === 30 && lay.locked >= 15, JSON.stringify([lay.hs, lay.ach, lay.locked]));
    ok('sheet: credits and privacy lines' + tag, /treblo/.test(lay.txt) && /saved only on this device/i.test(lay.txt) && /No data is collected/.test(lay.txt));
    ok('sheet: stat grid shows the saved numbers' + tag, /123\.456/.test(lay.txt) && /1\.500/.test(lay.txt) && /COMPLETE/.test(lay.txt));
    const reach = await p.evaluate(() => { const s = document.getElementById('stSheet'); s.scrollTop = s.scrollHeight; const r = document.getElementById('stReset').getBoundingClientRect(), b = document.getElementById('stsBack').getBoundingClientRect(); return r.bottom <= innerHeight + 1 && b.bottom <= innerHeight + 1 && r.height >= 44; });
    ok('sheet: RESET and BACK reachable by scrolling' + tag, reach);
    if (w === 390) {
      await tap(p, '#stReset'); await sleep(150);
      ok('reset: first tap only asks', await p.evaluate(() => /AGAIN/.test(document.getElementById('stReset').textContent) && RET.st.S().runs === 12));
      await tap(p, '#stReset'); await sleep(300);
      ok('reset: second tap clears counters and achievements', await p.evaluate(() => RET.st.S().runs === 0 && Object.keys(RET.st.D().a).length <= 3 && JSON.parse(localStorage.getItem('mnr_stats')).s.runs === 0));
    }
    await tap(p, '#stsBack'); await sleep(200);
    ok('sheet: BACK closes' + tag, !await vis(p, '#stSheet'));
    await p.context().close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
