// PLAY2 proof bot: a newcomer-paced first 3 minutes through the real page, by touch only, recorded as video.
//   NODE_PATH=games-src/node_modules node games-src/hollowbough/play/proof-bot.js [out.webm] [seconds=180] [WxH=375x667]
// From the title: Play > Play now > goal card, then each turn: tap the move a sensible player picks (the computer's best move),
// read the sheet that slides up (about 2 s), confirm. Choices, payouts and bubbles are answered the same way. Logs every tap.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const gx = require('../../scripts/gx-serve.js');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'proof', 'after2-first-3min-375x667.webm'));
const SECS = +process.argv[3] || 180, [W, H] = (process.argv[4] || '375x667').split('x').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const URL = await gx.url('hollowbough', { file: path.join(__dirname, '..', 'game', 'hollowbough.html') });
  const vdir = fs.mkdtempSync('/tmp/hbvid-');
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: W, height: H } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('hb_seen_tut', '1'); } catch (e) { } });
  await p.reload(); await sleep(1200);
  const t0 = Date.now(), log = [], say = (k, t) => { const l = ((Date.now() - t0) / 1000).toFixed(1) + 's ' + k + ' ' + String(t || '').replace(/\s+/g, ' ').slice(0, 60); log.push(l); console.log(l); };
  const tapAt = async (x, y) => { await p.touchscreen.tap(x, y); };
  const vis = `e => { if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; const x = Math.max(r.left + 2, Math.min(r.right - 2, r.left + r.width / 2)), y = Math.max(r.top + 2, Math.min(r.bottom - 2, r.top + r.height / 2)); const at = document.elementFromPoint(x, y); if (!at || !(at === e || e.contains(at) || at.contains(e))) return null; return { x, y, t: (e.innerText || e.getAttribute('aria-label') || '').trim() }; }`;
  let taps = 0;
  while (Date.now() - t0 < SECS * 1000) {
    const step = await p.evaluate(vis => {
      const V = eval(vis), q = s => [...document.querySelectorAll(s)];
      const first = (sel, kind) => { for (const e of q(sel)) { const r = V(e); if (r) return Object.assign(r, { kind }); } return null; };
      let r = first('#pc:not([hidden]) [data-a=lookgo], #pc:not([hidden]) [data-a=cont], #pc:not([hidden]) [data-a=take], #pc:not([hidden]) .cbtns .btn:not(.alt)', 'sheet/card'); if (r) return r;
      r = first('.gxh-bub.on button, .gxh-bub.on [data-a]', 'bubble'); if (r) return r;
      if (typeof G === 'undefined' || !G || !UI.started) { r = first('[data-a=play]', 'title') || [...document.querySelectorAll('button')].map(V).find(x => x && /Play now|Just play|No thanks|Skip/i.test(x.t)); if (r) { r.kind = r.kind || 'offer'; return r; } return { wait: 1 }; }
      if (G.phase === 'over') return { over: 1 };
      const a = HB.actor(G); if (G.players[a].ai || UI.animBusy) return { wait: 1 };
      let best = null; try { const rk = HB.AI.rank(G, a); best = rk.reduce((x, y) => (y.v > x.v ? y : x)).m; } catch (e) { best = myMoves()[0]; }
      if (!best) return { wait: 1 };
      const tg = tgOf(best); let el = UI.tgEls && UI.tgEls[tg];
      if (!el && best.type === 'choose') { const i = (UI.tm2 || []).findIndex(m => sameM(m, best)); if (i >= 0) el = document.querySelector('#acts [data-a=tm][data-mi="' + i + '"]'); }
      if (!el && best.type === 'prepare') el = document.querySelector('#acts [data-t=prep]');
      if (!el && best.type === 'pass') el = document.querySelector('#acts [data-t=pass]');
      if (el) { const rr = V(el); if (rr) return Object.assign(rr, { kind: best.type === 'choose' ? 'choice' : 'move', t: el.getAttribute('aria-label') || rr.t });
        const pn = el.closest && el.closest('.pv-panel'); if (pn && !pn.classList.contains('on')) { const tb = document.querySelector('.pv-tab[data-v="' + pn.dataset.p + '"]'); const rt = V(tb); if (rt) return Object.assign(rt, { kind: 'tab' }); }
        try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { } return { wait: 1 }; }
      r = first('#bd .pv-panel.on .glow, #acts .glow', 'move'); if (r) return r;
      return { wait: 1 };
    }, vis);
    if (step.over) { say('over', ''); break; }
    if (step.wait) { await sleep(250); continue; }
    await tapAt(step.x, step.y); taps++; say(step.kind, step.t);
    await sleep(step.kind === 'sheet/card' ? 1800 : step.kind === 'tab' ? 900 : 2600);   // a newcomer reads the sheet, then confirms
  }
  const fin = await p.evaluate(() => G ? { turn: G.turn, season: G.players[0].season, score: score(0).total, log: G.logN } : null).catch(() => null);
  const v = p.video(); await ctx.close(); await b.close();
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.copyFileSync(await v.path(), OUT);
  fs.writeFileSync(OUT.replace(/\.webm$/, '-taps.txt'), JSON.stringify({ taps, fin, errs }) + '\n' + log.join('\n') + '\n');
  console.log('wrote', OUT, 'taps', taps, 'errors', errs.length); process.exit(errs.length ? 1 : 0);
})();
