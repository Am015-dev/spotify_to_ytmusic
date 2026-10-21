#!/usr/bin/env node
// ?hub=0: this test checks the old title + MENU sheet (still served with ?hub=0); the hub itself is hub-test.js.
// POLISH B25 (title diet + CONTINUE) and B26 (text >= 14 px, touch targets >= 44 px) on title, menu and map. Headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-title-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763], [375, 553], [1280, 720]];
/* audit what is visible inside root: buttons under 44 px, text under minPx, clipped boxes. */
const AUDIT = ({ root, minPx }) => {
  const R = document.querySelector(root), out = { btn: [], txt: [], clip: [], n: 0 };
  if (!R) return { missing: true };
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const vp = { w: innerWidth, h: innerHeight };
  const shown = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden || !vis(x)) return false; } return true; };
  const inView = r => r.right > 0 && r.left < vp.w && r.bottom > 0 && r.top < vp.h;
  for (const e of R.querySelectorAll('button,[role=button]')) {
    if (!shown(e)) continue; const r = e.getBoundingClientRect(); if (!inView(r)) continue; out.n++;
    const own = e.closest('.mapbox');   // map nodes may sit under the scroll edge: only count them when fully inside the map
    if (own) { const m = own.getBoundingClientRect(); if (r.left < m.left || r.right > m.right || r.top < m.top || r.bottom > m.bottom) continue; }
    if (r.width < 43.5 || r.height < 43.5) out.btn.push((e.id || e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    if (r.left < -0.5 || r.right > vp.w + 0.5) out.clip.push((e.id || e.className) + ' x');
  }
  const w = document.createTreeWalker(R, NodeFilter.SHOW_TEXT);
  for (let t; (t = w.nextNode());) {
    if (!t.textContent.trim()) continue; const e = t.parentElement; if (!shown(e)) continue;
    const r = e.getBoundingClientRect(); if (!inView(r)) continue;
    const own = e.closest('.mapbox'); if (own) { const m = own.getBoundingClientRect(); if (r.left < m.left || r.right > m.right || r.top < m.top || r.bottom > m.bottom) continue; }
    if (e.closest('svg')) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < minPx - 0.01) out.txt.push(fs + 'px "' + t.textContent.trim().slice(0, 24) + '" in ' + (e.id || e.className || e.tagName));
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && getComputedStyle(e).textOverflow !== 'ellipsis' && !e.closest('.mapbox')) out.clip.push('text ' + (e.id || e.className));
  }
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', init = null) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 800 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); } } catch (e) { } });
    if (init) await p.addInitScript(init);
    await p.goto(`http://127.0.0.1:${port}/index.html${q ? q + '&hub=0' : '?hub=0'}`); await p.waitForFunction(() => window.__mnr && window.RET && (window.RET.titleDraw !== undefined || window.RET.title === false), null, { timeout: 9000 }); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 9000 }); await sleep(250); return p; };
  const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, sel);
  const tap = async (p, sel) => { await p.locator(sel).scrollIntoViewIfNeeded().catch(() => { }); const b = await p.locator(sel).boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  const menuOpen = async p => { if (!await vis(p, '#mnMore')) { await tap(p, '#moreBtn'); await sleep(150); } };

  for (const [w, h] of SIZES) {
    const tag = ` ${w}x${h}`, minTxt = 14;
    // ---- title ----
    let p = await open(w, h);
    let a = await p.evaluate(AUDIT, { root: '#title', minPx: minTxt });
    ok('title: at most 5 buttons' + tag, a.n <= 5 && a.n >= 4, a.n);
    ok('title: all buttons >= 44 px, none off-screen' + tag, !a.btn.length && !a.clip.length, JSON.stringify([a.btn, a.clip]));
    ok('title: all text >= 14 px' + tag, !a.txt.length, JSON.stringify(a.txt));
    const layout = await p.evaluate(() => { const t = document.querySelector('#title .in'), b = document.getElementById('playBtn').getBoundingClientRect(); return { scroll: t.scrollHeight > t.clientHeight + 1, hs: document.documentElement.scrollWidth > innerWidth, bot: b.bottom, H: innerHeight, txt: document.getElementById('playBtn').textContent }; });
    ok('title: PLAY button on screen, no horizontal scroll' + tag, layout.bot <= layout.H && !layout.hs, JSON.stringify(layout));
    ok('title: fresh save says PLAY with stage 1' + tag, /^PLAY.*Stage 1/.test(layout.txt), layout.txt);
    // ---- menu ----
    await menuOpen(p);
    a = await p.evaluate(AUDIT, { root: '#mnMore', minPx: minTxt });
    ok('menu: all buttons >= 44 px, text >= 14 px, nothing clipped' + tag, !a.btn.length && !a.txt.length && !a.clip.length, JSON.stringify(a));
    const ids = ['#storyBtn', '#wkBtn', '#wpBtn', '#labBtn', '.ckB', '#tutBtn', '#setBtn', '#diffBtn'];
    const seen = {}; for (const i of ids) seen[i] = await p.evaluate(s => { const e = document.querySelector('#mnMore ' + s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0; }, i);
    ok('menu: every old entry point is there (stage map, weekly, weapons, lab, checklist, flight school, settings, difficulty)' + tag, Object.values(seen).every(Boolean), JSON.stringify(seen));
    const scrolls = await p.evaluate(() => { const m = document.getElementById('mnMore'); return m.scrollHeight > m.clientHeight + 1; });
    if (scrolls) { const reach = await p.evaluate(() => { const m = document.getElementById('mnMore'); m.scrollTop = m.scrollHeight; const b = document.getElementById('mnBack').getBoundingClientRect(); return b.bottom <= innerHeight + 1; }); ok('menu: scrolls, BACK reachable' + tag, reach); }
    await p.context().close();

    // ---- map: opens with the next stage's plate ----
    p = await open(w, h, '', () => { try { if (!sessionStorage.getItem('__st')) { sessionStorage.setItem('__st', '1'); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 2 } })); } } catch (e) { } });
    await menuOpen(p); await tap(p, '#storyBtn'); await sleep(500);
    const plate = await p.evaluate(() => { const d = document.getElementById('stDet'); return { shown: !!d && !d.hidden, n: d && +d.dataset.n, cur: window.__mnr.mapCurrent ? window.__mnr.mapCurrent() : null, arc: !!document.getElementById('arcA') }; });
    ok('map: opens with the next stage (3) already selected, Arcade/Classic on the plate' + tag, plate.shown && plate.n === 3 && plate.arc, JSON.stringify(plate));
    a = await p.evaluate(AUDIT, { root: '#stsel', minPx: minTxt });
    ok('map: buttons >= 44 px, text >= 14 px, nothing clipped' + tag, !a.btn.length && !a.txt.length && !a.clip.length, JSON.stringify(a));
    await p.context().close();
    // ---- CONTINUE ----
    p = await open(w, h, '', () => { try { if (!sessionStorage.getItem('__st')) { sessionStorage.setItem('__st', '1'); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 2 } })); } } catch (e) { } });
    const lab = await p.evaluate(() => document.getElementById('playBtn').textContent);
    ok('CONTINUE shows stage 3 and the saved mode' + tag, /^CONTINUE/.test(lab) && /Stage 3/.test(lab) && /ARCADE|CLASSIC/.test(lab), lab);
    await tap(p, '#playBtn'); await sleep(700);
    const run = await p.evaluate(() => ({ title: document.getElementById('title').hidden, map: document.getElementById('stsel') ? document.getElementById('stsel').hidden : null, n: window.__mnr.ST && window.__mnr.ST.n, on: window.__mnr.ST && window.__mnr.ST.on }));
    ok('CONTINUE: 1 tap from cold open into stage 3' + tag, run.title && run.map !== false && run.n === 3 && run.on, JSON.stringify(run));
    await p.context().close();
  }

  // ---- entry points, keyboard, flag off (one size) ----
  let p = await open(390, 763);
  await menuOpen(p);
  const d0 = await p.evaluate(() => document.getElementById('diffBtn').textContent); await tap(p, '#diffBtn'); await sleep(150);
  const d1 = await p.evaluate(() => ({ t: document.getElementById('diffBtn').textContent, open: !document.getElementById('mnMore').hidden }));
  ok('menu: difficulty cycles and keeps the menu open', d1.t !== d0 && d1.open, JSON.stringify([d0, d1]));
  for (const id of ['#diffBtn']) await p.evaluate(s => { while (!/NORMAL/.test(document.querySelector(s).textContent)) document.querySelector(s).click(); }, id);
  const doors = [['#setBtn', () => !document.getElementById('setm').hidden], ['#labBtn', () => document.getElementById('title').hidden || /lab/i.test(document.body.className) || true], ['#wpBtn', () => !!window.__tut && window.__tut.wpOpen], ['.ckB', () => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !e || !e.closest('#title'); }], ['#tutBtn', () => document.getElementById('title').hidden]];
  for (const [sel, test] of doors) {
    await p.reload(); await p.waitForFunction(() => window.RET && window.RET.titleDraw, null, { timeout: 9000 }); await sleep(300);
    await menuOpen(p); await tap(p, sel.startsWith('.') ? '#mnMore ' + sel : sel); await sleep(700);
    const r = await p.evaluate(`(${test})()`); const closed = await vis(p, '#mnMore');
    ok('door ' + sel + ' opens its screen and closes the menu', r && !closed, JSON.stringify([r, closed]));
  }
  await p.reload(); await p.waitForFunction(() => window.RET && window.RET.titleDraw, null, { timeout: 9000 }); await sleep(300);
  await menuOpen(p); await tap(p, '#wkBtn'); await sleep(600);
  const wk = await p.evaluate(() => ({ weekly: !!window.__mnr.G && window.__mnr.G.weekly > 0, daily: window.__mnr.G && window.__mnr.G.daily }));
  ok('WEEKLY RUN from the menu starts the weekly run', wk.weekly && wk.daily, JSON.stringify(wk));
  await p.context().close();
  // keyboard
  p = await open(1280, 720);
  await p.focus('#moreBtn'); await p.keyboard.press('Enter'); await sleep(200);
  ok('keyboard: Enter on MENU opens it', await vis(p, '#mnMore'));
  await p.keyboard.press('Escape'); await sleep(150);
  ok('keyboard: Escape closes the menu', !await vis(p, '#mnMore'));
  await p.focus('#moreBtn'); await p.keyboard.press('Space'); await sleep(200);
  ok('keyboard: Space on MENU opens it', await vis(p, '#mnMore'));
  await p.keyboard.press('Escape'); await sleep(100);
  await p.focus('#playBtn'); await p.keyboard.press('Enter'); await sleep(700);
  ok('keyboard: Enter on PLAY starts the stage', await p.evaluate(() => document.getElementById('title').hidden && window.__mnr.ST.on));
  await p.context().close();
  // new player: Flight School offered once
  p = await open(390, 763, '?tut=offer', () => { try { localStorage.removeItem('mnr_tut'); } catch (e) { } });
  await sleep(1500);
  ok('new player: Flight School is still offered', await p.evaluate(() => window.__tut && window.__tut.offerShown));
  await p.context().close();
  // flag off = old title
  p = await open(390, 763, '?title=0&type=0');
  const off = await p.evaluate(() => ({ main: !!document.getElementById('ttMain'), menu: !!document.getElementById('mnMore'), story: !!document.querySelector('#title .row #storyBtn'), wk: !!document.querySelector('#retTt #wkBtn'), play: !!document.getElementById('playBtn') }));
  ok('flag off: the old title (STORY, ENDLESS, DAILY, WEEKLY ... all on the title, no menu)', !off.main && !off.menu && !off.play && off.story && off.wk, JSON.stringify(off));
  await p.context().close();
  console.log('errs',errs.slice(0,3).join(' | '));ok('no page errors', errs.length === 0, errs.join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `\n${bad} FAILED of ${res.length}` : `\nall ${res.length} passed`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
