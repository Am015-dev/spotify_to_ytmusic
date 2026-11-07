// Plays a Quick game and Story chapter 1 to the result at 390x763 by tapping only visible, uncovered UI (tap-lib checks elementFromPoint).
// No engine calls drive the game; page state is only READ to choose the next tap. Run: node tools/play-taps.js [quick|story|both]
const { chromium } = require('playwright'), path = require('path'), { serve, sleep, tap } = require('./tap-lib');
const MODE = process.argv[2] || 'both', SHOTS = path.join(__dirname, '..', 'shots');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
  const T = async s => { const r = await tap(pg, true, s); if (r) console.log('  skip-tap', r); return !r; };
  const byText = async (sel, re) => { for (const x of await pg.$$(sel)) { const t = (await x.innerText().catch(() => '')).trim(); if (re.test(t) && await x.isVisible()) return x; } return null; };
  async function drive(label, maxSteps) {
    let last = '', stuck = 0, sawGame = false;
    for (let i = 0; i < maxSteps; i++) {
      await sleep(250);
      const s = await pg.evaluate(() => { const g = window.EC && EC.E.G(); const c = window.GXT && GXT.active() ? (GXT.current() || {}) : null; return { mode: UI.mode, scr: g && g.scr, ph: g && g.b && g.b.ph, busy: UI.busy, tut: c ? { id: c.id, free: !!c.free, next: !c.wait, ready: !c.ready || c.ready(), times: (c.wait && c.wait.times) || 1 } : null, end: !!document.querySelector('.gxt-end'), won: g && g.won, txt: document.body.innerText.slice(0, 4000) }; });
      const key = JSON.stringify([s.mode, s.scr, s.ph, s.busy, s.tut, s.end, s.txt.length]); if (key === last) stuck++; else stuck = 0; last = key;
      if (stuck > 80) { await pg.screenshot({ path: path.join(SHOTS, 'stuck-' + label + '.png') }); console.log('FAIL', label, 'stuck at', key); return false; }
      if (s.mode !== 'title') sawGame = true;
      if (label === 'quick' && s.scr === 'over') { console.log('PASS quick reached result:', s.won ? 'won' : 'lost'); return true; }
      if (s.end) { const b = await pg.$('.gxt-end .gxt-b.pri'); if (b) { await T(b); continue; } }
      if (s.tut && !s.tut.free) {
        if (!s.tut.ready) continue;
        if (s.tut.next && await pg.$('.gxt-next')) { await T('.gxt-next'); continue; }
        const mark = () => pg.evaluate(() => { document.querySelectorAll('[data-spot]').forEach(x => x.removeAttribute('data-spot')); const c = GXT.current(); const t = c && c.target && c.target(); if (t) t.setAttribute('data-spot', '1'); });
        await mark(); await T('[data-spot]'); if (s.tut.times > 1) { await sleep(300); await mark(); await T('[data-spot]'); } await sleep(700); continue;
      }
      if (label === 'story' && sawGame && /Chapter 1|Story map|Next chapter|stars?/i.test(s.txt) && await byText('button', /^(Story map|Next chapter|Map)\b/i)) { console.log('PASS story chapter 1 reached its result screen'); return true; }
      const cb = await byText('[class*="gxc"] button', /^(Play|Start|Begin|Next|Continue)\b/i);
      if (cb && (s.mode === 'title' || s.scr === 'over' || !s.scr)) { await T(cb); continue; }
      if (s.mode === 'title') {
        if (label === 'quick') { if (await pg.$('#play')) await T('#play'); else { const q = await byText('#title button', /^Quick game/); if (q) await T(q); } }
        else if (!cb) { const nx = await pg.$('.gxc-node.next'); if (nx) await T(nx); else await T('#story'); }
        continue;
      }
      const sc = await byText('button', /^Fight$/) || await byText('[class*="gxc"] button', /^(Next|Continue)$/); if (sc) { await T(sc); continue; }
      if (s.scr === 'over') { const b = await byText('button', /^(Story map|Next chapter|Map|Continue)/i); if (b) { await T(b); } continue; }
      if (s.scr === 'map') { await T('.node.glow'); continue; }
      if (s.scr === 'battle') {
        if (s.ph !== 'p' || s.busy) continue;
        const ok = await pg.$('.hand .card.ok');
        if (ok) { await T(ok); await sleep(200); if (await pg.$('.en.glow')) await T('.en.glow'); else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); } await sleep(400); }
        else await T('#end');
        continue;
      }
      if (s.scr === 'reward') { const pk = await pg.$('.picks .card'); if (pk) { await T(pk); continue; } await T('#leave'); continue; }
      if (s.scr === 'rest') { await T('#rest-heal'); continue; }
      if (s.scr === 'shop' || s.scr === 'event') { const b = await byText('#app button', /^(Leave|Continue|Walk on|Ignore|Skip|Move on)/i) || (s.scr === 'event' ? await pg.$('#app button.btn') : null); if (b) await T(b); continue; }
    }
    console.log('FAIL', label, 'ran out of steps'); return false;
  }
  await pg.goto(base); await pg.waitForSelector('#title');
  if (MODE !== 'story') { if (!(await drive('quick', 5000))) bad++; await pg.screenshot({ path: path.join(SHOTS, 'taps-quick-result.png') }); }
  if (MODE !== 'quick') { await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title'); if (!(await drive('story', 3000))) bad++; await pg.screenshot({ path: path.join(SHOTS, 'taps-story-result.png') }); }
  if (errs.length) { bad++; console.log('FAIL errors', errs.slice(0, 3).join(' | ')); }
  await br.close(); srv.close(); console.log(bad ? 'PLAY-TAPS FAIL' : 'PLAY-TAPS PASS'); process.exit(bad ? 1 : 0);
})();
