// v3 shots of the coached first flight: node shoot-v3.js <outdir> [sizes=390x763,1440x860] [prefix=v3]
// Plays the tutorial through the UI, following the coach's pointed slot, and captures: tutorial round 1, a die selected with the preview,
// the round-over card and the landing checklist on the end card. Writes <prefix>-<W>-<name>.png (convert to webp afterwards).
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(__dirname + '/final-approach.html');
const OUT = process.argv[2] || 'shots', SIZES = (process.argv[3] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number)), PRE = process.argv[4] || 'v3';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) {
    const ph = W < 700, ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: ph, hasTouch: ph });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('https://gns.test/' + (ph ? '?phone=1' : '')); await sleep(800); await p.evaluate(() => localStorage.clear()); await p.reload(); await sleep(1000);
    const tap = async sel => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const q = e.getBoundingClientRect(); if (q.width < 5 || q.height < 5) return false; const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return t && (t === e || e.contains(t)); }); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) return false; if (ph) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y); return true; };
    const shot = n => p.screenshot({ path: path.join(OUT, PRE + '-' + W + '-' + n + '.png') });
    await tap('#start .ttut'); await sleep(1500);
    const got = {}; const t0 = Date.now();
    while (Date.now() - t0 < 240000) {
      const s = await p.evaluate(() => ({ fin: !!document.querySelector('.fa-fin'), ro: !!document.querySelector('.fa-ro:not(.out)'), r: G && G.round, ph: G && G.phase, turn: G && G.turn, pend: !!(G && G.pend), sel: UI.sel, res: !!(G && G.result),
        pt: UI.cpt ? UI.cpt.k : null, ptd: UI.cpt ? UI.cpt.d : null }));
      if (Date.now() - (global.lastLog || 0) > 6000) { global.lastLog = Date.now(); console.log(JSON.stringify(s)); }
      if (s.fin) { await sleep(900); await shot('landing-checklist'); got.fin = 1; break; }
      if (s.ro) { if (!got.ro) { await sleep(300); await shot('round-over'); got.ro = 1; } await tap('.fa-ro [data-ro=go]'); await sleep(500); continue; }
      if (await tap('.gxc-btn.go') || await tap('.gxh-ok')) { await sleep(400); continue; }
      if (await tap('[data-a=rrpick]')) { await sleep(700); continue; }
      if (s.ph === 'brief') { if (await tap('[data-a=ready]')) await sleep(800); else await sleep(300); continue; }
      if (s.ph === 'place' && !s.pend && s.turn === 0) {
        if (!got.r1) { for (let i = 0; i < 30 && !(await p.evaluate(() => !!document.querySelector('.fa-coach[data-coach=turn]'))); i++) await sleep(300); await sleep(600); await shot('tutorial-round1'); got.r1 = 1; }
        if (s.sel < 0) { const d = s.ptd != null ? '#pz .die[data-s="0"][data-d="' + s.ptd + '"]' : '#pz .die.can'; await tap(d); await sleep(500);
          if (!got.sel) { await sleep(400); await shot('die-selected-preview'); got.sel = 1; } continue; }
        const k = await p.evaluate(() => { const c = UI.cpt && document.querySelector('#pz .slot.legal[data-slot="' + UI.cpt.k + '"]'); if (c) return c.dataset.slot; const l = [...document.querySelectorAll('#pz .slot.legal:not(.deadly)')]; return l.length ? l[0].dataset.slot : null; });
        if (k) { await tap('#pz .slot[data-slot="' + k + '"]'); await sleep(700); } else { await tap('[data-a=toss]'); await sleep(500); }
        continue;
      }
      await sleep(300);
    }
    console.log((got.r1 && got.sel && got.ro && got.fin ? 'PASS' : 'FAIL') + ' shots ' + W + 'x' + H + ' ' + JSON.stringify(got) + (errs.length ? ' errors: ' + errs.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
})();
