// Coached first climb test: fresh storage, opens the tutorial from the title, does the 2 forced steps by tapping the spotlit element's centre,
// then plays the whole climb by choosing legal moves through the UI only (a playable card, a target, End turn, any glowing room, rewards, rest,
// shop leave, event choices), never blocked by the coach. Asserts the end card appears and every coach rule was either explained during play
// or listed under "Things you will meet later". Phone 390x763 + PC 1440x860. Run: node tools/tut-end.js   (ONLY=phone|pc to run one size)
const { chromium } = require('playwright'), { serve, sleep, tap } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    let covered = 0; const T = async s => { const r = await tap(pg, touch, s); if (r) { covered++; if (process.env.DBG) console.log('  skip', r); } return !r; };
    const byText = async (sel, re) => { for (const x of await pg.$$(sel)) { const t = (await x.innerText().catch(() => '')).trim(); if (re.test(t) && await x.isVisible()) return x; } return null; };
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title'); await sleep(400);
    await T('.gxt-menu'); await sleep(900);
    let forced = 0, endCard = false, last = '', stuck = 0;
    for (let i = 0; i < 3000 && !endCard; i++) {
      await sleep(220);
      const s = await pg.evaluate(() => { const g = EC.E.G(), c = window.GXT && GXT.active() ? (GXT.current() || {}) : null; return { scr: g && g.scr, ph: g && g.b && g.b.ph, busy: UI.busy, tut: c ? { id: c.id, next: !c.wait, times: (c.wait && c.wait.times) || 1, ready: !c.ready || c.ready() } : null, end: !!document.querySelector('.ec-endcard'), sig: document.body.innerText.length + ':' + (g && g.floor) + ':' + (g && g.b && g.b.turn) }; });
      if (s.end) { endCard = true; break; }
      const key = JSON.stringify(s); if (key === last) stuck++; else stuck = 0; last = key; if (stuck > 120) { bad++; console.log('FAIL', name, 'stuck at', key); await pg.screenshot({ path: require('path').join(__dirname, '..', 'shots', 'coach-stuck-' + name + '.png') }); break; }
      if (s.tut) {
        if (!s.tut.ready) continue;
        if (s.tut.next) { if (await pg.$('.gxt-next')) { await T('.gxt-next'); forced++; } continue; }
        const mark = () => pg.evaluate(() => { document.querySelectorAll('[data-spot]').forEach(x => x.removeAttribute('data-spot')); const c = GXT.current(); const t = c && c.target && c.target(); if (t) t.setAttribute('data-spot', '1'); return !!t; });
        if (!(await mark())) continue; if (!(await T('[data-spot]'))) { bad++; console.log('FAIL', name, 'forced step target covered', s.tut.id); continue; }
        if (s.tut.times > 1) { await sleep(300); await mark(); await T('[data-spot]'); } forced++; await sleep(700); continue;
      }
      if (s.scr === 'battle') {
        if (s.ph !== 'p' || s.busy) continue;
        const pot = await pg.$('.pot.full'); if (pot && Math.random() < 0.3) { await T(pot); await sleep(300); continue; }
        const oks = await pg.$$('.hand .card.ok'); const ok = oks.length ? oks[Math.floor(Math.random() * oks.length)] : null;
        if (ok) { await T(ok); await sleep(220); const tg = await pg.$$('.en.glow'); if (tg.length) await T(tg[Math.floor(Math.random() * tg.length)]); else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); } await sleep(380); }
        else if (await pg.$('#scry-done')) await T('#scry-done');
        else await T('#end');
        continue;
      }
      if (s.scr === 'map') { const ns = await pg.$$('.node.glow'); if (ns.length) await T(ns[Math.floor(Math.random() * ns.length)]); continue; }
      if (s.scr === 'reward') { const it = await pg.$('.reward .picks .item'); if (it) { await T(it); continue; } const pk = await pg.$$('.picks .card'); if (pk.length && Math.random() < 0.7) { await T(pk[Math.floor(Math.random() * pk.length)]); continue; } await T('#leave'); continue; }
      if (s.scr === 'rest') { await T(Math.random() < 0.8 ? '#rest-heal' : '#rest-heal'); continue; }
      if (s.scr === 'shop') { await T('#shop-leave'); continue; }
      if (s.scr === 'event') { const ov = await pg.$('.ov .grid .card'); if (ov) { await T(ov); continue; } const b = await pg.$('#ev-leave') || await pg.$('.opts button:not([disabled])'); if (b) await T(b); continue; }
      if (s.scr === 'over') continue;   // the coach walks through the numbers, then shows its end card
    }
    const cov = await pg.evaluate(() => { const C = UI.coach, R = Object.keys((window.EC_STORY.coach || {}).rules || {}); const later = [...document.querySelectorAll('.ec-endcard [data-rule]')].map(x => x.getAttribute('data-rule')); return { total: R.length, seen: R.filter(k => C.seen[k]), later, missing: R.filter(k => !C.seen[k] && later.indexOf(k) < 0), scr: EC.E.G().scr, won: EC.E.G().won }; });
    console.log(name, 'forced steps', forced, '| rules explained in play', cov.seen.length + '/' + cov.total, '| on end card', cov.later.length, '| result', cov.won ? 'won' : 'lost');
    if (forced > 2) { bad++; console.log('FAIL', name, 'more than 2 forced steps'); }
    if (!endCard) { bad++; console.log('FAIL', name, 'no coach end card'); }
    if (cov.missing.length) { bad++; console.log('FAIL', name, 'rules neither explained nor listed:', cov.missing.join(',')); }
    if (endCard) { await T('#coach-play'); await sleep(600); if (!(await pg.$('#play'))) { bad++; console.log('FAIL', name, 'end card did not open a real game'); } }
    if (errs.length) { bad++; console.log('FAIL', name, 'errors', errs.slice(0, 2).join(' | ')); }
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TUT-END FAIL' : 'TUT-END PASS'); process.exit(bad ? 1 : 0);
})();
