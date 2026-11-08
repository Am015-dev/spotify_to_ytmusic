// Feel shots of a Quick game played by real taps (touch on phones): node shoot-feel.js <outdir> [WxH,...]
// Captures rival-turn (the co-pilot placing), mid-game (round 4, your turn) and result. Moves are chosen with the computer's advice, then tapped.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(__dirname + '/final-approach.html');
const OUT = process.argv[2] || 'feel', SIZES = (process.argv[3] || '390x844,1440x900').split(',').map(s => s.split('x').map(Number)), sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) {
    const ph = W < 700, ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: ph, hasTouch: ph });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('https://gns.test/' + (ph ? '?phone=1' : '')); await sleep(800);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('fa_offer', '1'); localStorage.setItem('fa_prefs', JSON.stringify({ won: { g1: 1 } })); }); await p.reload(); await sleep(1200);
    const at = s => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const q = e.getBoundingClientRect(); if (q.width < 4) return false; const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return t && (t === e || e.contains(t)); }); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, s);
    const tap = async s => { const r = await at(s); if (!r) return false; if (ph) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y); return true; };
    const shot = n => p.screenshot({ path: path.join(OUT, 'feel-' + W + '-' + n + '.png') });
    await p.evaluate(() => { const e = [...document.querySelectorAll('#start button')].find(b => b.textContent.trim() === 'Computer'); e && e.click(); }); await sleep(900);
    await tap('#start [data-a=start][data-m=vs]'); await sleep(1500);
    const got = {}; const t0 = Date.now();
    while (Date.now() - t0 < 300000) {
      const s = await p.evaluate(() => window.G ? { r: G.round, ph: G.phase, t: G.turn, pend: G.pend && G.pend.h, res: !!G.result, sel: UI.sel } : {});
      if (s.res) { await sleep(3500); await shot('result'); got.res = 1; break; }
      if (await tap('.fa-ro [data-ro=go]') || await tap('[data-a=rsclose]')) { await sleep(400); continue; }
      if (s.pend === 'rr') { if (await tap('[data-a=rrpick]')) { await sleep(600); continue; } }
      if (s.ph === 'brief') { await tap('[data-a=ready]'); await sleep(700); continue; }
      if (s.ph === 'place' && s.t === 1 && !got.rival) { await sleep(700); await shot('rival-turn'); got.rival = 1; continue; }
      if (s.ph === 'place' && s.t === 0 && !s.pend) {
        if (s.r >= 3 && !got.mid) { await sleep(800); await shot('mid-game'); got.mid = 1; }
        const m = await p.evaluate(() => { try { const m = FA.AI.move(G, 0, 'normal', { noMC: true }); return m && m.t === 'place' && !m.c ? { d: m.d, to: m.to } : m ? { t: m.t } : null; } catch (e) { return null; } });
        if (m && m.to != null) { if (s.sel !== m.d) { await tap('#pz .die[data-s="0"][data-d="' + m.d + '"]'); await sleep(350); } if (!(await tap('#pz .slot[data-slot="' + m.to + '"]'))) await tap('#pz .slot.legal'); await sleep(700); continue; }
        if (s.sel < 0 || s.sel == null) await tap('#pz .die.can'); else if (!(await tap('#pz .slot.legal:not(.deadly)'))) if (!(await tap('#pz .slot.legal'))) await tap('[data-a=toss]');
        await sleep(600); continue;
      }
      await sleep(300);
    }
    console.log((got.rival && got.mid && got.res ? 'PASS' : 'FAIL') + ' feel ' + W + 'x' + H + ' ' + JSON.stringify(got) + (errs.length ? ' errors ' + errs[0] : ''));
    await ctx.close();
  }
  await b.close();
})();
