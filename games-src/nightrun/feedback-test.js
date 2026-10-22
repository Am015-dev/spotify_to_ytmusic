#!/usr/bin/env node
// FEEDBACK strip on the end screens (FUN / SAME AGAIN / BORING). Headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/feedback-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ok = (n, p, i) => { console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); if (!p) process.exitCode = 1; };
const SIZES = [[390, 763], [844, 390]];
const AUDIT = rootSel => { const R = document.querySelector(rootSel), o = { btn: [], txt: [], overlap: [] }; if (!R) return { missing: true };
  const bs = [...R.querySelectorAll('button')].filter(e => !e.closest('[hidden]') && e.getBoundingClientRect().width > 0);
  for (const e of bs) { const r = e.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) o.btn.push(e.id || e.textContent); if (parseFloat(getComputedStyle(e).fontSize) < 13.99) o.txt.push(e.textContent); }
  const fb = [...R.querySelectorAll('.fbB')];
  for (const f of fb) { const a = f.getBoundingClientRect(); for (const e of bs) { if (e === f) continue; const b = e.getBoundingClientRect(); if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) o.overlap.push(f.textContent + '/' + (e.id || e.textContent)); } }
  for (const e of R.querySelectorAll('.fbQ')) if (parseFloat(getComputedStyle(e).fontSize) < 13.99) o.txt.push('fbQ'); o.n = fb.length; return o; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', rm = false) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 800, reducedMotion: rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`); await p.waitForFunction(() => window.__mnr && window.FB !== undefined || window.__mnr && window.RET, null, { timeout: 9000 }); await sleep(600); return p; };
  const tap = async (p, sel) => { const b = await p.locator(sel).first().boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) if (x.hidden) return false; return e.getBoundingClientRect().width > 0; }, sel);
  for (const [w, h] of SIZES) {
    const tag = ` ${w}x${h}`;
    for (const [scr, root, end] of [['over', '#over', 'm.startStory(1); m.G.score=900; m.ST.fail();'], ['stres', '#stres', 'm.startStory(1); m.ST.stars=[1,1,0]; m.ST.finish();']]) {
      const p = await open(w, h); await p.evaluate(`localStorage.removeItem('mnr_fb'); const m=window.__mnr; ${end}`); await sleep(500);
      const a = await p.evaluate(AUDIT, root);
      ok(`${scr}: 3 answer buttons shown, >=44px, text >=14px, no overlap` + tag, a.n === 3 && !a.btn.length && !a.txt.length && !a.overlap.length, JSON.stringify(a));
      const nextOk = await p.evaluate(r => { const b = document.querySelector(r + ' .row .go'); const x = b.getBoundingClientRect(); return !b.disabled && x.width > 0; }, root);
      ok(`${scr}: main button still there, not delayed` + tag, nextOk);
      const sel = `${root} .fbB[data-a="fun"]`;
      // scroll into view when the overlay scrolls
      await p.locator(sel).scrollIntoViewIfNeeded(); await tap(p, sel); await sleep(200);
      const st = await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_fb') || '[]'));
      ok(`${scr}: tap FUN stores {stage,mode,diff,wp,sec,ts}` + tag, st.length === 1 && st[0].a === 'fun' && st[0].stage === 1 && st[0].mode === 'story' && st[0].diff && Array.isArray(st[0].wp) && st[0].wp.length && typeof st[0].sec === 'number' && st[0].ts > 0, JSON.stringify(st));
      ok(`${scr}: buttons gone after answer, thanks shown` + tag, !(await p.evaluate(r => !!document.querySelector(r + ' .fbB'), root)) && /Thanks/.test(await p.textContent(root)));
      await p.evaluate(() => { FB.answer('bore'); }); const n2 = await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_fb')).length);
      ok(`${scr}: second answer for the same run ignored` + tag, n2 === 1, n2);
      await p.context().close();
    }
  }
  // each answer + new run shows it again + sheet counts + copy
  let p = await open(390, 763);
  for (const a of ['fun', 'same', 'bore']) { await p.evaluate(`localStorage.getItem('mnr_fb'); const m=window.__mnr; if(m.running!==undefined){} m.abort&&m.abort(); m.startStory(2); m.ST.fail();`); await sleep(400); await p.locator(`#over .fbB[data-a="${a}"]`).scrollIntoViewIfNeeded(); await tap(p, `#over .fbB[data-a="${a}"]`); await sleep(150); }
  const all = await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_fb')));
  ok('tap each answer: 3 stored, one per run', all.map(x => x.a).join() === 'fun,same,bore' && all.every(x => x.stage === 2), JSON.stringify(all.map(x => x.a)));
  const c = await p.evaluate(() => FB.counts()); ok('counts per stage', c[2] && c[2].fun === 1 && c[2].same === 1 && c[2].bore === 1, JSON.stringify(c));
  await p.evaluate(() => { for (let i = 0; i < 520; i++) { FB.answer; } const a = []; for (let i = 0; i < 510; i++) a.push({ a: 'fun', stage: 3, ts: i }); localStorage.setItem('mnr_fb', JSON.stringify(a)); });
  await p.evaluate(`const m=window.__mnr; m.abort&&m.abort(); m.startStory(2); m.ST.fail();`); await sleep(400); await tap(p, '#over .fbB[data-a="same"]');
  ok('cap 500', (await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_fb')).length)) === 500);
  await p.evaluate(() => { RET.st.open(); }); await sleep(200);
  ok('stats sheet has FEEDBACK list + COPY', /FEEDBACK/.test(await p.textContent('#stSheet')) && await vis(p, '#fbCopy'));
  await p.context().close();
  // reduced motion
  p = await open(390, 763, '', true);
  await p.evaluate(`const m=window.__mnr; m.startStory(1); m.ST.fail();`); await sleep(500);
  const a = await p.evaluate(AUDIT, '#over'); ok('reduced motion: strip shown and usable', a.n === 3 && !a.btn.length);
  await p.context().close();
  ok('no page errors', !errs.length, errs.join('|'));
  await br.close(); srv.kill();
})();
