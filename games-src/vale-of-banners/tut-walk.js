// Guided tutorial walked by real touch taps at 390x844, 375x667, 360x640 and 375x553 (phone; touch targets must be 44x44) and mouse at 1440x900: every step's glowing target must be on
// screen and uncovered (elementFromPoint), every line one sentence of 12 words or fewer, every core rule must appear in order, then
// "Play a real game" must start a real 5-season game. SHOTS=1 saves playable-shots/gameplay/tut-N.png (390x844). node tut-walk.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
/* STAGED build (the page players get, shell included): VB_URL, else build-all's GX_URL, else gx-serve on GX_STAGE. VB_HTML=<file> tests a bare html. */
let URL = process.env.VB_URL || (process.env.VB_HTML ? 'file://' + process.env.VB_HTML : null);
const RULES = ['dice', 'goal', 'take', 'storage', 'build', 'region', 'end', 'order', 'white', 'sell', 'workers', 'kinds', 'bend', 'wrap', 'back', 'keep',
  'building', 'hall', 'pasture', 'lore', 'barge', 'discard', 'colour', 'season', 'final', 'tie'];
const SHOTDIR = path.join(__dirname, 'playable-shots', 'gameplay');
(async () => {
  if (!URL) URL = await require('../scripts/gx-serve.js').url('vale-of-banners');
  const b = await chromium.launch(); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 844 }, true], ['phone-s', { width: 375, height: 667 }, true], ['phone-xs', { width: 360, height: 640 }, true], ['phone-xxs', { width: 375, height: 553 }, true], ['pc', { width: 1440, height: 900 }, false]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [], fails = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });   // picture slots without a local file are expected
    await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
    const tapXY = async (x, y) => { if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
    const tb = await page.evaluate(() => { const e = document.getElementById('tutB'); const r = e && e.getBoundingClientRect(); return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
    if (!tb) { console.log(name, 'FAIL no tutorial button'); bad++; continue; } await tapXY(tb.x, tb.y); await page.waitForTimeout(900);
    const seen = [], rulesSeen = []; let shot = 0, guard = 0, starSteps = 0, starOn = 0, w0 = 0, wMax = 0, wAt = '';   /* longest silent wait between two steps (rival turns included) */
    while (guard++ < 2500) {
      const st = await page.evaluate(() => {
        if (document.querySelector('.gxt-end')) return { end: true };
        if (!GXT.running()) return { done: true };
        const s0 = GXT.state(), c = GXT.current(); if (!c || s0.phase !== 'show') return { wait: true };
        const bub = document.querySelector('.gxt-bub .gxh-tx, .gxh-tx'), say = typeof c.say === 'function' ? c.say() : c.say;
        if (!c.wait) { const nb = document.querySelector('.gxt-next'); if (!nb) return { wait: true }; const r = nb.getBoundingClientRect(); return { id: c.id, rule: c.rule, say, x: r.left + r.width / 2, y: r.top + r.height / 2, ok: true, next: true }; }
        const t = c.target && c.target(); if (!t) return { wait: true };
        const r = t.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        const inView = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
        return { id: c.id, rule: c.rule, say, x, y, ok: inView && !!hit && (hit === t || t.contains(hit)), hit: hit ? (hit.id || hit.className) : 'none', w: r.width, hh: r.height };
      });
      if (st.wait) { if (!w0) w0 = Date.now(); } else if (w0) { const d = Date.now() - w0; if (d > wMax) { wMax = d; wAt = st.id; } w0 = 0; }
      if (st.end || st.done) break; if (st.wait) { if (guard % 40 === 39 && process.env.DBG) console.log(name, 'waiting', await page.evaluate(() => { const c = GXT.current(); return (c && c.id) + ' ' + GXT.state().phase + ' busy ' + UI.busy + ' actor ' + VB.actor(G) + ' tab ' + UI.tab + ' tv ' + !document.getElementById('tv').hidden; })); await page.waitForTimeout(150); continue; }
      if (process.env.STOPAT === st.id) { console.log(await page.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return s + ' none'; const b = e.getBoundingClientRect(); return s + ' ' + [b.top, b.bottom, b.height].map(Math.round).join('/'); }; return [r('#bd'), r('#mk'), r('#lane'), r('#dock'), r('.drow'), r('#store'), r('#goods'), r('#acts'), r('#endB'), r('#prompt'), 'dock sh ' + document.getElementById('dock').scrollHeight + ' ov ' + getComputedStyle(document.getElementById('dock')).overflowY + ' ' + [...document.getElementById('dock').querySelectorAll('*')].filter(e => getComputedStyle(e).overflowY === 'auto' || getComputedStyle(e).overflowY === 'scroll').map(e => e.id || e.className).join(','), 'sw ' + document.documentElement.scrollWidth + ' bd ' + document.getElementById('bd').clientWidth + ' iw ' + innerWidth + ' wide: ' + [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 2).slice(0, 8).map(e => (e.id || e.className) + ':' + Math.round(e.getBoundingClientRect().right)).join(' '), JSON.stringify(L.mkFit), JSON.stringify({ ey: L.ey, eh: L.eh })].join('\n'); })); await page.screenshot({ path: process.env.STOPSHOT || '/tmp/stop.png' }); break; }
      if (seen[seen.length - 1] !== st.id) {
        seen.push(st.id); if (rulesSeen[rulesSeen.length - 1] !== st.rule) rulesSeen.push(st.rule);
        const w = String(st.say || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length, sent = (String(st.say).match(/[.!?](\s|$)/g) || []).length;
        if (w > 12) fails.push(st.id + ' line has ' + w + ' words'); if (sent > 2) fails.push(st.id + ' more than two sentences');
        if (!st.ok) fails.push(st.id + ' target covered by ' + st.hit);
        await page.waitForTimeout(320); const sc = await page.evaluate(() => { const c = GXT.current(), t = c && c.target && c.target(); const want = t && t.id && /^(mt-|bl-|ec-|st-|gd-|gs-)/.test(t.id) ? [t.id] : []; const got = [].slice.call(document.querySelectorAll('.bestx,.bestt,.cell.best,.bestb,.bestq')).map(e => /bestb|bestq/.test(e.className) ? (e.parentElement && e.parentElement.id) : e.id).filter(x => x && !/^tab-/.test(x)); return { want, got: [...new Set(got)] }; });
        starSteps++; if (sc.got.some(g => sc.want.indexOf(g) < 0) || sc.want.some(w => sc.got.indexOf(w) < 0)) fails.push(st.id + ' star ' + JSON.stringify(sc.got) + ' but coach ' + JSON.stringify(sc.want)); else if (sc.want.length) starOn++;
        if (touch && st.w && (st.w < 43.5 || st.hh < 43.5)) fails.push(st.id + ' target only ' + Math.round(st.w) + 'x' + Math.round(st.hh));
        if (name === 'phone' && process.env.SHOTS) { await page.waitForTimeout(250); fs.mkdirSync(SHOTDIR, { recursive: true }); await page.screenshot({ path: path.join(SHOTDIR, 'tut-' + (++shot) + '.png') }); }
      }
      await tapXY(st.x, st.y); await page.waitForTimeout(st.next ? 700 : 450);
    }
    const missing = RULES.filter(r => rulesSeen.indexOf(r) < 0); if (missing.length) fails.push('rules never taught: ' + missing.join(','));
    const order = RULES.filter(r => rulesSeen.indexOf(r) >= 0).map(r => rulesSeen.indexOf(r)); if (order.some((v, i) => i && v < order[i - 1])) fails.push('rules out of order: ' + rulesSeen.join(','));
    const endOk = await page.evaluate(() => !!document.querySelector('.gxt-end'));
    if (!endOk) fails.push('end card not reached (last step ' + seen[seen.length - 1] + ')');
    else {
      if (name === 'phone' && process.env.SHOTS) await page.screenshot({ path: path.join(SHOTDIR, 'tut-' + (++shot) + '.png') });
      const p = await page.evaluate(() => { const e = document.querySelector('[data-gxt-end="play"]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await tapXY(p.x, p.y); await page.waitForTimeout(1500);
      const real = await page.evaluate(() => ({ mode: UI.mode, phases: G.nPhases, phase: G.phase, round: G.round, over: G.over }));
      if (real.mode !== 'quick' || real.phases !== 5 || real.phase !== 0 || real.round !== 0) fails.push('real game did not start: ' + JSON.stringify(real));
      const later = await page.evaluate(() => /meet later/i.test(document.body.innerText)); if (later) fails.push('a "learn later" list is shown');
    }
    if (errs.length) fails.push('errors: ' + errs.slice(0, 3).join(' | '));
    console.log(name, fails.length ? 'FAIL' : 'PASS', seen.length + ' steps, star = coach on ' + (starSteps - fails.filter(f => / star /.test(f)).length) + '/' + starSteps + ' (star on target ' + starOn + '), longest wait ' + (wMax / 1000).toFixed(1) + ' s before "' + wAt + '", rules in order: ' + rulesSeen.join(' > '), fails.length ? '\n  ' + fails.join('\n  ') : '');
    if (fails.length) bad++; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
