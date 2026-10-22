#!/usr/bin/env node
// MENUFIX 2 (review 9 fixes #7, #12, #13). #7: DASH, EMP and the power slot each show a word + charge number under the button, on both phones.
// #12: Flight School drill bar = AGAIN + SKIP only (no SKIP DEMO pad), demo once, no district banner in a drill. #13: forge weapon cells draw no letters
// (no 'PU' text), and no forge cell label is clipped (scrollWidth <= clientWidth). Phones 390x763 and 375x553, Chromium, one at a time. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/menufix2-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763], [375, 553]];
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const [w, h] of SIZES) {
      const tag = w + 'x' + h, ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      const p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '2'); } catch (e) { } });
      await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&sim=1`, { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => window.__mnr && window.__tut && window.__school && window.__schoolfull, null, { timeout: 15000 }); await sleep(400);

      // #7 word labels: start a drill (in-stage controls), then read each button's label
      await p.evaluate(() => { __school.run('dodge'); }); await sleep(900);
      const lab = await p.evaluate(() => ['bDash', 'bEmp', 'bPwr'].map(id => {
        const b = document.getElementById(id); if (!b || b.hidden || getComputedStyle(b).display === 'none') return null;
        const s = b.querySelector('.bw'), r = b.getBoundingClientRect(), t = s ? s.getBoundingClientRect() : null;
        return { id, rb: Math.round(r.bottom), ih: innerHeight, text: s ? s.textContent : '', below: !!t && t.top >= r.bottom - 1, inView: !!t && t.left >= 0 && t.right <= innerWidth && t.bottom <= innerHeight };
      }).filter(Boolean));
      const need = lab.filter(q => q.id !== 'bPwr');
      ok(`${tag} #7 DASH and EMP are on screen with a word label`, need.length === 2, JSON.stringify(lab));
      ok(`${tag} #7 each in-stage label is "WORD number" and sits under its button`, lab.every(q => /^(DASH|EMP|[A-Z ]+) \d+$/.test(q.text) && q.below && q.inView), JSON.stringify(lab));

      // #12 drill bar: AGAIN and SKIP only, no SKIP DEMO pad, no district banner
      const bar = await p.evaluate(() => ({ btns: [...document.querySelectorAll('#tutB button')].filter(b => !b.hidden && getComputedStyle(b).display !== 'none').map(b => b.textContent.trim()), pad: !!document.getElementById('sfDemo'), banner: __mnr.G.banner.t > 0 && /BANKEN|SEKTOR|SCHICHT/.test(__mnr.G.banner.a + __mnr.G.banner.b), bt: __mnr.G.banner.a + ' | ' + __mnr.G.banner.b + ' ' + __mnr.G.banner.t }));
      ok(`${tag} #12 drill bar shows only AGAIN and SKIP`, bar.btns.length === 2 && bar.btns.includes('AGAIN') && bar.btns.includes('SKIP') && !bar.pad, JSON.stringify(bar));
      ok(`${tag} #12 no district banner in a drill`, !bar.banner, JSON.stringify(bar));
      await p.evaluate(() => { try { __school.shut(); } catch (e) { } }); await sleep(200);

      // #13 forge: weapon cells draw no letters and no label is clipped
      const forge = await p.evaluate(async () => {
        const txt = []; const f0 = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t) { txt.push(String(t)); return f0.apply(this, arguments); };
        try { const t = garageEl.querySelector('button[data-t="forge"]'); if (t) { t.hidden = false; t.click(); } } catch (e) { }
        await new Promise(r => setTimeout(r, 400));
        CanvasRenderingContext2D.prototype.fillText = f0;
        const box = document.getElementById('gaCards'), clipped = [];
        if (box) for (const e of box.querySelectorAll('span,small,b,button')) { if (!e.textContent.trim() || e.children.length && e.tagName !== 'BUTTON') continue; if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') clipped.push(e.textContent.trim().slice(0, 20)); }
        const dom = box ? box.textContent : '';
        return { canvasText: txt.filter(t => /^PU/.test(t)), puDom: /\bPU\b/.test(dom), clipped, cards: box ? box.children.length : -1 };
      });
      ok(`${tag} #13 forge draws no "PU" letters on weapon cells`, forge.canvasText.length === 0 && !forge.puDom, JSON.stringify(forge));
      ok(`${tag} #13 no clipped forge cell label (${forge.cards} forge cards checked)`, forge.clipped.length === 0 && forge.cards > 0, forge.clipped.join(' | ') || 'no forge cards rendered');
      ok(`${tag} no page error`, errs.length === 0, errs.slice(0, 3).join(' | '));
      await ctx.close();
    }
  } catch (e) { ok('run', false, e.message); }
  finally { await br.close(); srv.kill(); }
  const pass = res.filter(Boolean).length; console.log(`${pass}/${res.length} PASS`); process.exit(pass === res.length ? 0 : 1);
})();
