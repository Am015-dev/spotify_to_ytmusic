// W485 r16 overlap gate at 375x667 and 390x844 (touch). Screens: fight, two-foe elite (both with the coach bubble and a toast forced on and the
// prompt pill visible), reward, map, shop, result (won). Nothing floating (coach bubble, toast, prompt pill, phase banner, pops) may intersect the
// top bar's buttons / HP / gold, any enemy intent badge, or the result title and buttons. Also: reward card text is not cut (>= 13px, no clipping),
// and in the two-foe elite both foes are fully on screen. Exit 1 on failure. Run: node tools/probe-overlap.js
const { chromium } = require('playwright'), { serve, sleep } = require('./tap-lib');
const FIGHT = "EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.performMove({ t: 'go', n: EC.E.validMoves()[0].n }); UI.mode = 'game';";
const SCREENS = {
  fight: () => { eval(FIGHT); UI.render(); },
  elite: () => { eval(FIGHT); const g = EC.E.G(); g.b.kind = 'e'; g.b.en = [0, 1].map(i => { const e = JSON.parse(JSON.stringify(g.b.en[0])); e.id = 'iron-warden'; e.hp = e.mhp = 40; e.i = i; return e; }); UI.render(); },
  reward: () => { eval(FIGHT); EC.E.debug.win(); UI.render(); },
  map: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); UI.mode = 'game'; UI.render(); },
  shop: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.shop(); UI.mode = 'game'; UI.render(); },
  result: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.over(1); UI.mode = 'game'; UI.render(); }
};
const measure = () => {
  const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || !r.width || !r.height) return null; return r; };
  const hit = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
  const floats = [...document.querySelectorAll('.ec-say,.toast,.w7now,.ec-phase,.pop,.w4hbf,.gxt-bub')].map(e => [e, vis(e)]).filter(x => x[1]);
  const prot = [];
  document.querySelectorAll('.gx-bar button,.gx-bar .chip,#hud,#hud *,.intent,.over.res h1,.rbtns button,.over.res .rbtns').forEach(e => { const r = vis(e); if (r && !prot.some(p => p[0] === e)) prot.push([e, r]); });
  const out = []; for (const [f, fr] of floats) if (!f.matches('.pop,.w4hbf') && (fr.left < -1 || fr.right > innerWidth + 1 || fr.top < 0 || fr.bottom > innerHeight + 1)) out.push(f.className.toString().split(' ')[0] + ' off screen');
  for (const [f, fr] of floats) for (const [p, pr] of prot) { if (f.contains(p) || p.contains(f)) continue; if (hit(fr, pr)) out.push((f.className.toString().split(' ')[0]) + ' over ' + (p.id ? '#' + p.id : p.className.toString().split(' ')[0] || p.tagName)); }
  return { floats: floats.length, out: [...new Set(out)] };
};
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [w, hh] of [[375, 667], [390, 844]]) {
    const V = w + 'x' + hh, ctx = await br.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { try { GXT.markDone('emberclimb'); } catch (e) { } window.EC_NOSAVE = 1; UI.setHints(true); });
    for (const [k, fn] of Object.entries(SCREENS)) {
      await pg.evaluate('(' + fn.toString().replace(/eval\(FIGHT\)/g, FIGHT) + ')()'); await sleep(700);
      const probe = async what => { await pg.evaluate(() => { document.querySelectorAll('.ec-say,.toast').forEach(n => n.remove()); }); await pg.evaluate(what); await sleep(350); return pg.evaluate(measure); };
      const fails = [];
      const a = await probe(() => { UI.say('Boss rule: when it falls, it splits into two smaller foes, so keep your block up for both.', 60000); });
      if (a.out.length) fails.push('coach: ' + a.out.join(', '));
      const b = await probe(() => { UI.toast('Iron Warden adds 2 Dazed to your deck, so your hand will clog up for a while.', 60000); });
      if (b.out.length) fails.push('toast: ' + b.out.join(', '));
      await pg.evaluate(() => document.querySelectorAll('.ec-say,.toast').forEach(n => n.remove()));
      const c = await pg.evaluate(measure); if (c.out.length) fails.push('base: ' + c.out.join(', '));
      if (k === 'result') { const rs = await pg.evaluate(() => { const r = e => e && e.getBoundingClientRect(); const bt = r(document.querySelector('.rbtns')), sc = r(document.querySelector('.rscroll')), t = r(document.querySelector('.over.res h1')); const sy = document.querySelectorAll('.ec-say').length; return { under: bt && sc && sc.bottom > bt.top + 1, tOk: t && t.top >= 0, sy }; }); if (rs.under) fails.push('deck scroll runs under the buttons'); if (!rs.tOk) fails.push('title off screen'); }
      if (k === 'reward') {
        const cut = await pg.evaluate(() => { const o = []; document.querySelectorAll('.picks .card').forEach(cd => { cd.querySelectorAll('.cb,.cl').forEach(e => { const fs = parseFloat(getComputedStyle(e).fontSize); if (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) o.push('clipped ' + (e.textContent || '').slice(0, 20)); else if (e.classList.contains('cl') && fs < 13) o.push('font ' + fs); }); const r = cd.getBoundingClientRect(), cb = cd.querySelector('.cb'); if (cb) { const b = cb.getBoundingClientRect(); [...cb.querySelectorAll('.cl')].forEach(l => { if (l.getBoundingClientRect().bottom > r.bottom + 1) o.push('text below card'); }); } if (r.left < 0 || r.right > innerWidth) o.push('card off screen'); }); return o; }); if (cut.length) fails.push('reward text: ' + cut.slice(0, 3).join(', '));
      }
      if (k === 'elite') {
        const off = await pg.evaluate(() => [...document.querySelectorAll('.enemies .en, #stage .en')].map(e => e.getBoundingClientRect()).filter(r => r.left < 0 || r.right > innerWidth + 0.5).map(r => Math.round(r.left) + '..' + Math.round(r.right)));
        const n = await pg.evaluate(() => document.querySelectorAll('.en').length); if (n < 2) fails.push('elite shows ' + n + ' foes'); if (off.length) fails.push('foe off screen ' + off.join(', '));
      }
      if (fails.length) { bad++; console.log('FAIL', V, k, fails.join(' | ')); } else console.log('PASS', V, k);
    }
    if (errs.length) { bad++; console.log('FAIL page errors', errs.slice(0, 3)); }
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'OVERLAP FAIL' : 'OVERLAP PASS'); process.exit(bad ? 1 : 0);
})();
