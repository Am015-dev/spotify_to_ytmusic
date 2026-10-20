#!/usr/bin/env node
// WEAPONS sheet: opaque (nothing shows through), rows fixed-size without overlap, fusion row inside the list, no PLACEHOLDER text, DONE never covers a row, text >= 14 px, targets >= 44 px.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ui-weapons-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const CHECK = () => {
  const W = document.getElementById('wpm'), L = document.getElementById('wpL'), out = {};
  const R = e => e.getBoundingClientRect();
  const bg = getComputedStyle(W).backgroundColor.match(/[\d.]+/g).map(Number); out.alpha = bg.length > 3 ? bg[3] : 1;
  out.shown = !W.hidden && R(W).width > 0;
  out.ph = /placeholder/i.test(W.innerText) || /placeholder/i.test(W.textContent);
  const items = [...L.children]; out.n = items.length; out.fuInList = !!L.querySelector('#wpFu') && !W.querySelector(':scope > #wpFu');
  out.overlap = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = R(items[i]), b = R(items[j]); if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.overlap.push(i + '/' + j); }
  const hd = R(W.querySelector('.top')), lr = R(L), done = R(document.getElementById('wpGo'));
  out.listBelowHeader = lr.top >= hd.bottom - 1; out.listAboveDone = lr.bottom <= done.top + 1;
  L.scrollTop = L.scrollHeight; const last = R(items[items.length - 1]); out.lastClear = last.bottom <= done.top + 1; out.lastInList = last.bottom <= lr.bottom + 1;
  L.scrollTop = 0; const first = R(items[0]); out.firstInList = first.top >= lr.top - 1;
  out.small = []; for (const c of L.querySelectorAll('.card')) { const r = R(c); if (r.height < 43.5) out.small.push('card ' + Math.round(r.height)); if (r.width > R(L).width + 1 || r.left < -0.5 || r.right > innerWidth + .5) out.small.push('card x'); }
  if (done.height < 43.5 || done.width < 43.5) out.small.push('DONE ' + Math.round(done.width) + 'x' + Math.round(done.height));
  out.txt = []; const w = document.createTreeWalker(W, NodeFilter.SHOW_TEXT); for (let t; (t = w.nextNode());) { if (!t.textContent.trim()) continue; const e = t.parentElement, fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13.99) out.txt.push(fs + 'px "' + t.textContent.trim().slice(0, 20) + '"'); }
  out.cut = []; for (const e of L.querySelectorAll('.n,.t,.slot')) { if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && getComputedStyle(e).textOverflow !== 'ellipsis') out.cut.push(e.className + ' ' + e.textContent.slice(0, 16)); }
  out.through = 0; for (const [fx, fy] of [[.2, .3], [.5, .5], [.8, .6], [.5, .9]]) { const e = document.elementFromPoint(innerWidth * fx, innerHeight * fy); if (e && !W.contains(e)) out.through++; }
  out.hs = document.documentElement.scrollWidth > innerWidth + 1;
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const br = await PW.chromium.launch(), errs = [];
  for (const [w, h] of [[390, 763], [360, 640], [844, 390]]) {
    const tag = ` ${w}x${h}`, ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`); await p.waitForFunction(() => window.__wp && window.__mnr && __mnr.ART, null, { timeout: 9000 }); await sleep(1200);
    for (const eq of [['pulse', 'laser'], ['pulse', null]]) {
      const lab = tag + (eq[1] ? ' fused' : ' single');
      await p.evaluate(eq => { const wp = window.__wp; for (const id of ['pulse', 'laser', 'swarm', 'arc', 'orbit', 'disc', 'mine']) wp.pl && (wp.pl[id] = wp.pl[id] || 1); wp.eq = eq; wp.show('title'); }, eq); await sleep(400);
      const r = await p.evaluate(CHECK);
      ok('weapons: sheet opaque, nothing shows through' + lab, r.shown && r.alpha === 1 && r.through === 0, JSON.stringify([r.shown, r.alpha, r.through]));
      ok('weapons: no PLACEHOLDER text' + lab, !r.ph);
      ok('weapons: rows do not overlap, list between header and DONE' + lab, !r.overlap.length && r.listBelowHeader && r.listAboveDone && r.firstInList, JSON.stringify(r));
      ok('weapons: last row clear of DONE, fusion row inside the list' + lab, r.lastClear && r.lastInList && r.fuInList, JSON.stringify([r.lastClear, r.lastInList, r.fuInList]));
      ok('weapons: text >= 14 px, targets >= 44 px, nothing cut, no side scroll' + lab, !r.txt.length && !r.small.length && !r.cut.length && !r.hs, JSON.stringify([r.txt, r.small, r.cut, r.hs]));
      await p.evaluate(() => window.__wp.hide());
    }
    await ctx.close();
  }
  ok('weapons: no page errors', !errs.length, errs.join('|')); await br.close(); srv.kill(); console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });
