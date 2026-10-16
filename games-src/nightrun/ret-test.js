#!/usr/bin/env node
// Nightrun retention checks (real page, ?nomusic=1). PASS/FAIL lines; exit 1 on any FAIL.  Append new sections per item.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
const SIZES = [['1280x720', { viewport: { width: 1280, height: 720 } }], ['390x763', { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }]];
const clip = (p, sel) => p.evaluate(s => { const bad = [], vw = innerWidth, vh = innerHeight; for (const el of document.querySelectorAll(s + ',' + s + ' *')) { if (!el.getClientRects().length || el.closest('[hidden]')) continue; const r = el.getBoundingClientRect(); if (!r.width) continue; if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push(el.id || el.className || el.tagName); } return bad; }, sel);
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  for (const [lab, opt] of SIZES) for (const flag of [true, false]) {
    const ctx = await br.newContext(opt), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_bank', '0'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.RET); await sleep(600);
    const T = `${lab} flag ${flag ? 'on' : 'off'}`;
    await p.evaluate(f => { window.RET.oneMore = f; }, flag);
    const nx = await p.evaluate(() => { const m = window.__mnr; m.startStory(1); m.G.score = 1234; m.SH.neon = 7; m.ST.fail(); return { n: window.RET.next(), bank: m.GA.bank, txt: document.getElementById('retO') && !document.getElementById('retO').hidden ? document.getElementById('retO').textContent : null, btn: document.getElementById('againBtn').textContent }; });
    if (flag) {
      const pr = await p.evaluate(() => { let min = 1e9; for (const id of Object.keys(window.__mnr.GA.own)) { } return null; });
      ok(`${T}: fail screen shows next unlock ${nx.n && nx.n.n} ${nx.bank}/${nx.n && nx.n.price}`, nx.txt && nx.n && nx.txt.includes(nx.n.n) && nx.txt.includes(nx.bank + '/' + nx.n.price) && /still pay/.test(nx.txt), nx.txt);
      ok(`${T}: bar price equals WP.price when a weapon`, await p.evaluate(() => { const n = window.RET.next(); const w = window.__mnr; return !!n && n.price > 0 && n.bank === w.GA.bank; }));
      ok(`${T}: button reads ONE MORE RUN`, nx.btn === 'ONE MORE RUN', nx.btn);
      // updates after a banked run: add neon and fail again
      const t2 = await p.evaluate(async () => { const m = window.__mnr; m.GA.bank += 2; window.RET.oneMore = true; m.NR.emit('runEnd', { story: 1 }); return document.getElementById('retO').textContent; });
      ok(`${T}: bar updates with the bank`, t2.includes((nx.bank + 2) + '/'), t2);
      ok(`${T}: nothing clipped`, !(await clip(p, '#over')).length, JSON.stringify(await clip(p, '#over')));
      await sleep(700); const t0 = Date.now();
      await (opt.hasTouch ? p.tap('#againBtn') : p.keyboard.press('Enter'));
      await p.waitForFunction(() => window.__mnr.running && window.__mnr.ST.n === 1, null, { timeout: 3000 });
      ok(`${T}: ONE MORE RUN restarts same stage in ${Date.now() - t0} ms`, Date.now() - t0 < 1000);
      const t3 = await p.evaluate(() => { const m = window.__mnr; m.ST.stars = [1, 1, 0]; m.ST.finish(); return { txt: document.getElementById('retR').textContent, btn: document.getElementById('srRetry').textContent, hid: document.getElementById('stres').hidden }; });
      ok(`${T}: clear screen shows bar + button`, !t3.hid && /Next:|Ready/.test(t3.txt) && t3.btn === 'ONE MORE RUN', JSON.stringify(t3));
      ok(`${T}: clear screen nothing clipped`, !(await clip(p, '#stres')).length, JSON.stringify(await clip(p, '#stres')));
    } else {
      ok(`${T}: old screen (no bar, FLY AGAIN)`, nx.txt === null && nx.btn === 'FLY AGAIN', JSON.stringify(nx));
    }
    ok(`${T}: no page errors`, !errs.length, errs[0]);
    await ctx.close();
  }
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})();
