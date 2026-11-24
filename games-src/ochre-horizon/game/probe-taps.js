// One-shot random-tap probe: taps enabled/glowing targets at 375x667, counts taps that change nothing. Usage: node probe-taps.js [seed=1] [steps=400]
const { chromium } = require('playwright');
const F = 'file://' + __dirname + '/ochre-horizon.html?fast=1&play=1&seed=';
(async () => {
  const seed = process.argv[2] || 1, steps = +process.argv[3] || 400, b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(()=>{window.addEventListener('DOMContentLoaded',()=>{const t=window.toast;if(t)window.toast=function(){window.__tc=(window.__tc||0)+1;return t.apply(this,arguments)}})});await pg.goto(F + seed); await pg.waitForTimeout(400);
  const sig = () => pg.evaluate(() => JSON.stringify([OH.G && OH.G.log.length, OH.G && OH.G.phase, OH.G && OH.G.acts, OH.G && !!OH.G.pending, document.getElementById('mb').innerHTML.length, document.getElementById('modal').className, document.getElementById('sheet').className, document.getElementById('shT').textContent, document.getElementById('sheet').innerHTML.length, UI.sel, document.getElementById('toast').textContent, document.getElementById('coach').className, document.getElementById('hintt').textContent, document.getElementById('confirm').className, UI.setup && UI.setup.step, JSON.stringify(UI.setup && UI.setup.keep), JSON.stringify(UI.research && UI.research.keep), document.getElementById('board').getAttribute('viewBox'),window.__tc||0, (document.querySelector('#board g')||{getAttribute(){}}).getAttribute('transform')]));
  const targets = () => pg.evaluate(() => {
    const out = [], vis = e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null; return r; };
    const top = document.querySelector('#modal.on') ? '#modal' : document.querySelector('#sheet.on, #sheet.open') ? '#sheet' : null;
    const root = top ? document.querySelector(top) : document;
    root.querySelectorAll('button, [data-s][data-legal], .cw, [data-r]').forEach(e => {
      if (e.classList.contains('on') && e.closest('.tabs, .lv')) return; if (e.disabled || e.getAttribute('aria-disabled') === 'true') return;
      if (top === null && e.closest('#modal,#sheet')) return;
      const r = vis(e); if (!r) return;
      const x = r.x + r.width / 2, y = r.y + r.height / 2; if (x < 0 || y < 0 || x > 375 || y > 667) return;
      const hit = document.elementFromPoint(x, y); if (!hit || !(e === hit || e.contains(hit))) return;
      out.push({ x, y, d: (e.id || e.className.baseVal || e.className || e.tagName).toString().slice(0, 30) + '|' + (e.textContent || '').trim().slice(0, 30) });
    });
    return out;
  });
  let dead = [], taps = 0, lost = 0;
  for (let i = 0; i < steps; i++) {
    if (await pg.evaluate(() => OH.G && OH.G.over)) break;
    const act = await pg.evaluate(() => OH.sideToAct());
    if (act === 1) { await pg.waitForTimeout(60); continue; }
    const T = await targets();
    if (!T.length) { lost++; if (lost<4) console.log('NT', await pg.evaluate(()=>OH.G.phase+' pend='+JSON.stringify(OH.G.pending&&OH.G.pending.h)+' modal='+document.getElementById('modal').className+' sheet='+document.getElementById('sheet').className+' busy='+UI.busy+' scrim='+document.getElementById('scrim').className+' inert='+document.getElementById('app').inert+' coach='+document.getElementById('coach').className+' side='+OH.sideToAct()+' hand='+OH.G.pl[0].hand.length)); await pg.evaluate(() => { if (OH.sideToAct() === 0) { const m = OHAI.decide('normal'); closeModal(); UI.setup = null; doMove(m); } }); await pg.waitForTimeout(60); continue; }
    // mix: every 3rd step use the real hint-follower (AI) to keep the game moving
    if (i % 3 === 2) { await pg.evaluate(() => { if (OH.sideToAct() === 0 && !UI.busy) { const m = OHAI.decide('normal'); closeModal(); UI.setup = null; doMove(m); } }); await pg.waitForTimeout(80); continue; }
    const t = T[Math.floor(Math.random() * T.length)];
    const s0 = await sig(); await pg.touchscreen.tap(t.x, t.y); await pg.waitForTimeout(120); const s1 = await sig(); taps++;
    if (s0 === s1) { dead.push(t.d); }
  }
  console.log('taps', taps, 'dead', dead.length, 'noTarget', lost, 'errors', errs.length ? errs.slice(0, 3).join('|') : 0);
  const c = {}; dead.forEach(d => c[d] = (c[d] || 0) + 1); console.log(JSON.stringify(c, null, 1));
  await b.close();
})();
