// HUD gate (W674): at phone 402x874 and PC 1366x768, at machine speed (turbo.js): each bar window (camp, log, cards, rules) opens by tap
// and closes by its X and by a tap outside, never two at once; status chips are >= 13px; then a full game is played through the real
// buttons to the end. 0 JS errors, < 60 s each.   usage: node hud-test.js [url]  (default http://localhost:8779/shipwreck-isle/)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../scripts/turbo');
const URL0 = process.argv[2] || 'http://localhost:8779/shipwreck-isle/';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [W, H, mob] of [[402, 874, true], [1366, 768, false]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud ' + W);
    const c = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(), errs = [], bad = []; p.on('pageerror', e => errs.push(e.message));
    const at = async (x, y) => { if (mob) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await tick(p, 300); };
    const tap = async s => { const r = await p.locator(s).first().boundingBox(); if (!r) throw new Error('no ' + s); await at(r.x + r.width / 2, r.y + r.height / 2); };
    await p.goto(URL0 + '?seed=11'); await tick(p, 500);
    await p.evaluate(() => { window.AIDELAY = 0; }); await tap('[data-a="start"]'); await tick(p, 300); if (await p.locator('button:has-text("Play anyway")').count()) await tap('button:has-text("Play anyway")'); await tick(p, 400);
    const bar = await p.evaluate(() => [...document.querySelectorAll('header.gx-bar > button')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height), r.right <= innerWidth]; }));
    bar.forEach(x => { if (x[1] < 44 || x[2] < 44 || !x[3]) bad.push('bar button ' + x.join(' ')); });
    const chips = await p.evaluate(() => [...document.querySelectorAll('#bfres > span, #bfres > span *')].filter(e => e.offsetParent && (e.textContent || '').trim() && !e.children.length).map(e => parseFloat(getComputedStyle(e).fontSize)));
    if (W < 600 && (!chips.length || Math.min(...chips) < 13)) bad.push('status chips ' + JSON.stringify(chips));
    const openN = () => p.evaluate(() => document.querySelectorAll('.gx-drawer.on').length);
    let wins = 0;
    for (const [sel, how] of [['campd', 'x'], ['logd', 'out'], ['cardsd', 'x'], ['rulesd', 'out'], ['campd', 'out'], ['logd', 'x']]) {
      if (sel === 'cardsd') await tap('header .menub'); const btn = (sel === 'cardsd' ? '#moremenu' : 'header') + ' [data-gx="' + sel + '"]'; if (!(await p.locator(btn).first().isVisible())) { bad.push(sel + ' button hidden'); continue; }
      await tap(btn); await p.waitForTimeout(60); const n = await openN(); if (n !== 1) bad.push(sel + ' open count ' + n);
      if (how === 'x') { const xb = await p.evaluate(() => { const x = document.querySelector('.gx-drawer.on .gx-x'), r = x && x.getBoundingClientRect(); return r ? [r.width, r.height] : null; }); if (!xb || xb[0] < 44 || xb[1] < 44) bad.push(sel + ' X ' + JSON.stringify(xb)); if (xb) await tap('.gx-drawer.on .gx-x'); }
      else { const r = await p.evaluate(() => { const e = document.querySelector('.gx-drawer.on'); if (!e) return null; const d = e.getBoundingClientRect(); return d.left > 60 ? [20, innerHeight / 2] : [innerWidth / 2, Math.max(10, d.top - 20)]; }); if (r) await at(r[0], r[1]); }
      await p.waitForTimeout(60); const n2 = await openN(); if (n2 !== 0) bad.push(sel + ' still open after ' + how); wins++;
    }
    // full game through the real buttons: story beats, questions, plan -> start day
    let steps = 0;
    for (let k = 0; k < 4000 && !(await p.evaluate(() => G.over)); k++) {
      const did = await p.evaluate(() => {
        const q = s => document.querySelector(s), vis = e => e && e.offsetParent, clk = e => { e.click(); return 1; };
        const m = q('#modal'); if (m && !m.hidden) { const bs = [...m.querySelectorAll('button:not([disabled])')].filter(x => !['new', 'rules', 'cards', 'close'].includes(x.dataset.a)); if (bs.length) return clk(bs.find(x => /anyway|got it|continue|ok/i.test(x.textContent)) || bs[0]); }
        let e = [...document.querySelectorAll('.gxh-pop button, .gxt-menu button, .gxh-coach button')].find(vis); if (e && /got it|skip|next|ok/i.test(e.textContent)) return clk(e);
        e = [...document.querySelectorAll('[data-ans]')].find(vis); if (e) return clk(e);
        e = [...document.querySelectorAll('[data-a="next"],[data-a="skip"]')].find(vis); if (e) return clk(e);
        if (planOpen()) { if (planProblems().length) { e = [...document.querySelectorAll('[data-a="suggest"]')].find(vis); if (e) return clk(e); } e = [...document.querySelectorAll('[data-a="go"]')].find(vis); if (e) return clk(e); }
        return 0;
      });
      if (did) steps++; await tick(p, did ? 120 : 250); if (process.env.DBG && k % 40 === 0) console.log(k, steps, ((Date.now() - t0) / 1000).toFixed(1), JSON.stringify(await p.evaluate(() => [G.round, G.phase, !!G.q, document.getElementById('story').hidden, document.getElementById('modal').hidden, UI.beats && UI.beats.length]))); 
    }
    const over = await p.evaluate(() => G.over);
    if (!over) bad.push('game did not finish'); const secs = ((Date.now() - t0) / 1000).toFixed(1); stop();
    const ok = !bad.length && !errs.length; if (!ok) fail = 1;
    console.log((ok ? 'ok  ' : 'FAIL') + ` hud ${W}x${H} ${secs}s steps=${steps} windows=${wins} over=${over} errors=${errs.length} ${bad.concat(errs).join('; ').slice(0, 500)}`);
    await c.close();
  }
  await b.close(); process.exit(fail);
})();
