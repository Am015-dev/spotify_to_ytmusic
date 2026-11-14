// Plays a Quick game (vs 1 computer) and Story chapter 1 to the result using ONLY what is on screen: it taps glowing pieces,
// visible buttons and the keep/pass/story buttons, never calls the engine to choose. Every tap is checked with elementFromPoint
// (the element at the centre of the target must be the target or inside it).   node tests/ui-play.js [phone|pc] [quick|story|all] [url]
const { chromium } = require('playwright');
const SIZE = process.argv[2] || 'phone', WHAT = process.argv[3] || 'all', URL = process.argv[4] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : { width: +(process.env.VPW || 390), height: +(process.env.VPH || 763) }, TOUCH = SIZE !== 'pc';   // VPW/VPH env: other phone sizes (390x844, 375x667)
let fails = 0, covered = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
async function tapEl(p, h) {
  const el = h.asElement ? h.asElement() : h; if (!el) return false;
  const inSheet = await el.evaluate(e => !!e.closest('.gxc,#hand,.gx-dock-body'));
  if (inSheet) await el.scrollIntoViewIfNeeded().catch(() => { });   // scrolling a scroller is what a player does too
  const r = await el.boundingBox(); if (!r || r.width < 2) return false;
  const x = r.x + r.width / 2, y = r.y + Math.min(r.height / 2, 30);
  const ok = await el.evaluate((e, [x, y]) => { if (!e.isConnected) return 'stale'; const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, [x, y]);
  if (ok === 'stale') return false;
  if (!ok) { covered++; if (covered <= 4) console.log('     covered: ' + await el.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return (e.className || e.id) + ' by ' + (t ? (t.className || t.id || t.tagName) : 'nothing') + ' @' + Math.round(x) + ',' + Math.round(y); }, [x, y])); return false; }
  if (TOUCH) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
  return true;
}
// choose what a newcomer following the glow and the instruction bar would tap
async function pick(p, rnd) {
  return p.evaluateHandle(rnd => {
    const vis = e => { if (!e || e.hidden) return false; for (let x = e; x; x = x.parentElement) { if (x.hidden || getComputedStyle(x).display === 'none') return false; } return e.getBoundingClientRect().width > 0; };
    const q = s => [...document.querySelectorAll(s)].filter(vis);
    if (q('.turnban,.reveal').length) return null;
    const res = document.getElementById('result'); if (vis(res)) return 'result';
    const one = s => q(s)[0] || null;
    const pop = document.getElementById('pop'); if (vis(pop)) return pop.querySelector('[data-a="popx"]') || pop;
    const ord = [one('#passgo'), one('#keepgo')]; for (const e of ord) if (e) return e;
    const acts = q('#acts button'); const playgo = acts.find(b => b.dataset.a === 'playgo'); if (playgo) return playgo;
    const glows = q('.glow'); if (glows.length) {
      const slot = glows.filter(e => e.matches('.slot')); if (slot.length) return slot[0];
      const hand = glows.filter(e => e.closest('#hand')); const rows = glows.filter(e => e.matches('.ract'));
      if (hand.length && rows.length) return rnd < 0.55 ? hand[Math.floor(rnd * 100) % hand.length] : rows[Math.floor(rnd * 100) % rows.length];
      return glows[Math.floor(rnd * 100) % glows.length];
    }
    const mv = acts.filter(b => b.dataset.a === 'mv'); if (mv.length) return mv.find(b => /no thanks|skip/i.test(b.textContent)) || mv[0];
    const pick = q('.bonc'); if (pick.length) return pick[0];
    return null;
  }, rnd);
}
async function playOut(p, label, maxMs) {
  const t0 = Date.now(); let n = 0, idle = Date.now();
  while (Date.now() - t0 < maxMs) {
    const h = await pick(p, Math.random());
    const v = await h.jsonValue().catch(() => undefined);
    if (v === 'result') { log(true, `${label}: result screen after ${n} taps, ${Math.round((Date.now() - t0) / 1000)} s`); return true; }
    if (h.asElement() && await tapEl(p, h)) { n++; idle = Date.now(); await p.waitForTimeout(120); continue; }
    if (Date.now() - idle > 20000) { await p.screenshot({ path: `shots/uiplay-${SIZE}-stuck.png` }); log(false, label + ': nothing tappable for 20 s'); return false; }
    await p.waitForTimeout(150);
  }
  log(false, label + ': timed out'); return false;
}
async function tapSel(p, s) { const h = await p.$(s); if (!h || !(await tapEl(p, h))) throw new Error('cannot tap ' + s); await p.waitForTimeout(350); }
(async () => {
  require('fs').mkdirSync('shots', { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH });
  await ctx.addInitScript(() => { try { localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'fast', ai: 'fast' })); localStorage.setItem('pp-played', '1'); } catch (e) { } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (WHAT !== 'story') {
    await p.goto(URL); await p.waitForTimeout(700);
    await tapSel(p, '[data-t="quick"]'); await tapSel(p, '[data-n="2"]'); await tapSel(p, '[data-go]');
    await playOut(p, 'quick game vs 1 computer', 900000);
    await p.screenshot({ path: `shots/uiplay-${SIZE}-quick-result.png` });
  }
  if (WHAT !== 'quick') {
    await p.goto(URL); await p.waitForTimeout(700);
    await tapSel(p, '[data-t="story"]'); await p.waitForTimeout(500);
    await tapSel(p, '.gxc-node[aria-label^="Chapter 1:"]');
    for (let k = 0; k < 24; k++) {
      await p.waitForTimeout(400);
      const st = await p.evaluate(() => { const g = document.querySelector('.gxc'); if (G && UI.camp && (!g || !g.offsetParent)) return 'in'; return 'sheet'; });
      if (st === 'in') break;
      const h = await p.evaluateHandle(() => [...document.querySelectorAll('.gxc button:not(.gxc-node)')].find(x => /play|start|begin|skip|continue|next|let/i.test(x.textContent) && x.offsetParent) || null);
      if (h.asElement()) await tapEl(p, h);
    }
    const r = await playOut(p, 'story chapter 1', 900000);
    if (r) { await p.screenshot({ path: `shots/uiplay-${SIZE}-story1-result.png` });
      const txt = await p.evaluate(() => document.getElementById('result').innerText.slice(0, 160).replace(/\s+/g, ' ')); console.log('     result: ' + txt); }
  }
  log(covered < 25, 'covered-target retries ' + covered + ' (a covered target is never tapped)');
  log(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 3).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
