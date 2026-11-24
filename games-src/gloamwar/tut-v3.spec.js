// Gate for the v3 HUD + floating tutorial: node tut-v3.spec.js  (402x874 and 1366x768, real touch taps, machine speed)
// Asserts: guide labels for every HUD part, no overlaps, labels tappable; lessons completable by taps; non-highlighted taps work during the tutorial;
// legend lists every icon class on the map; windows drag/minimise/close; text >= 13px; tap targets >= 44px; 0 JS errors. Screens go to proof/.
const path = require('path'), { chromium } = require('playwright');
const URL = 'file://' + path.join(__dirname, 'gloamwar.html'), OUT = path.join(__dirname, 'proof'); let fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const ov = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
(async () => {
  const b = await chromium.launch();
  for (const [W, H] of [[402, 874], [1366, 768]]) {
    const tag = W + 'x' + H, ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 700 }), p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tap = async (sel) => { const e = await p.$(sel); ok(e, tag + ' missing ' + sel); if (!e) return; await e.evaluate(x => x.scrollIntoView({ block: 'nearest' })); const bb = await e.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(120); };
    await p.goto(URL); await p.waitForTimeout(400);
    await tap('#tutB'); await p.waitForTimeout(900);
    // 1. screen guide
    const g = await p.evaluate(() => { const L = [...document.querySelectorAll('#guide .gl')].map(e => { const r = e.getBoundingClientRect(); return { f: e.dataset.for, r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } }; });
      const parts = HUD_PARTS.filter(p => { const e = document.querySelector(p[0]); return e && e.getBoundingClientRect().width > 0; }).map(p => p[0]);
      const hud = parts.map(s => { const r = document.querySelector(s).getBoundingClientRect(); return { s, r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } }; });
      const w = document.getElementById('tw-guide').getBoundingClientRect(); return { L, parts, hud, w: { left: w.left, top: w.top, right: w.right, bottom: w.bottom }, lines: document.querySelectorAll('#guide line').length }; });
    ok(g.L.length === g.parts.length, tag + ' guide labels ' + g.L.length + ' of ' + g.parts.length + ' HUD parts, missing ' + g.parts.filter(s => !g.L.some(l => l.f === s)).join(','));
    ok(g.lines >= g.L.length, tag + ' leader lines');
    g.L.forEach((a, i) => { g.L.forEach((c, j) => { if (j > i && ov(a.r, c.r)) fails.push(tag + ' labels overlap ' + a.f + ' ' + c.f); }); if (ov(a.r, g.w)) fails.push(tag + ' label over guide window ' + a.f); g.hud.forEach(h => { if (ov(a.r, h.r)) fails.push(tag + ' label ' + a.f + ' covers ' + h.s); }); if (a.r.left < 0 || a.r.right > W || a.r.top < 0 || a.r.bottom > H) fails.push(tag + ' label off screen ' + a.f); });
    for (const l of g.L) { await tap('#guide .gl[data-for="' + l.f + '"]'); const t = await p.textContent('#gtext'); ok(t.length > 10 && !t.startsWith('Every'), tag + ' label explains ' + l.f); }
    await p.screenshot({ path: OUT + '/v3-' + tag + '-1-hud-guide.png' });
    await tap('#gNext'); await p.waitForTimeout(200);
    // 2. non-highlighted taps still work during the tutorial (lessons window open, a ring is showing)
    await tap('#cG'); ok(await p.evaluate(() => !!UI.sheet || document.getElementById('sheet').classList.contains('on')), tag + ' Gloam card opens during tutorial'); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    const tp = await p.evaluate((W) => { const bd = document.getElementById('board').getBoundingClientRect(); const hr = (MV.hl && MV.hl.regions) || []; for (const e of document.querySelectorAll('#dyn .tok:not(.co):not(.ch)')) { if (hr.indexOf(e.id.split('-')[1]) >= 0) continue; const r = e.querySelector('.ts,.tc').getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; if (y > bd.top + 140 && y < bd.bottom - 80 && x > 80 && x < W - 150) { const hit = document.elementFromPoint(x, y); if (hit && hit.closest('.tok') === e) return { x, y, id: e.id }; } } return null; }, W);
    ok(tp, tag + ' a token to tap');
    if (tp) { await p.touchscreen.tap(tp.x, tp.y); await p.waitForTimeout(200); ok(await p.$('.gwb.rcard .what'), tag + ' tapping a token shows its name + use (' + tp.id + ') ' + await p.evaluate(() => [G.phase, !!UI.rcard, document.querySelectorAll('.gwb').length].join())); await p.screenshot({ path: OUT + '/v3-' + tag + '-2-token-info.png' }); }
    // 3. lessons, any order, completed by taps
    const ids = await p.evaluate(() => LESSONS.map(l => l.id));
    for (const id of ['turn', 'dice', 'win', 'move', 'attack', 'card', 'track', 'end']) {
      const li = await p.$('#tw-lessons [data-l="' + id + '"]'); if (!li || !(await li.isVisible())) { const chip = await p.$('#chip-lessons'); if (chip) await tap('#chip-lessons'); else await p.evaluate(() => TUT.lessons()); }
      await tap('#tw-lessons [data-l="' + id + '"]'); await p.waitForTimeout(200);
      const ring = await p.evaluate(() => { const r = document.getElementById('pring'); return !!r && r.style.display !== 'none'; });
      if (id !== 'end') ok(ring, tag + ' pulse ring for lesson ' + id);
      const ttl = await p.evaluate(() => { const w = document.querySelector('#tw-lesson header b'); return w ? w.textContent : 'none'; }); if (id === 'end') ok(ttl === 'What ends the game', tag + ' end lesson window: ' + ttl + ' ' + await p.evaluate(() => { const e = document.querySelector('#tw-lessons [data-l="end"]'); if (!e) return 'no item'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h ? (h.id || h.className) + ' ' + Math.round(r.top) : 'nothing'; }));
      const wins = await p.evaluate(() => [...document.querySelectorAll('.tw')].filter(e => e.style.display !== 'none').map(e => { const r = e.getBoundingClientRect(); return { id: e.id, r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } }; }));
      wins.forEach((a, i) => wins.forEach((c, j) => { if (j > i && ov(a.r, c.r)) fails.push(tag + ' windows overlap ' + a.id + ' ' + c.id); }));
      await p.screenshot({ path: OUT + '/v3-' + tag + '-3-lesson-' + id + '.png' });
      if (id === 'turn') { await tap('#acts .act[data-key="cdone"]'); await p.waitForTimeout(600); }
      if (id === 'dice') { await p.waitForFunction(() => document.querySelector('#mydice .die.can'), null, { timeout: 8000 }).catch(() => {}); await tap('#mydice .die.can'); await p.waitForTimeout(700); }
      if (await p.$('#lNext')) await tap('#lNext');
      await p.waitForTimeout(150);
    }
    const done = await p.evaluate(() => LESSONS.filter(l => !TUT.done[l.id]).map(l => l.id).join(',')); ok(!done, tag + ' lessons not ticked: ' + done);
    ok(await p.$('#lDone'), tag + ' end card'); if (await p.$('#lDone')) await tap('#lDone');
    // 4. window drag / minimise / close
    await tap('#helpB'); const w0 = await p.evaluate(() => document.getElementById('tw-help').getBoundingClientRect().left);
    const hb = await (await p.$('#tw-help header b')).boundingBox(); await p.mouse.move(hb.x + 10, hb.y + 10); await p.mouse.down(); await p.mouse.move(hb.x - 40, hb.y + 60, { steps: 4 }); await p.mouse.up();
    ok(await p.evaluate((w0) => document.getElementById('tw-help').getBoundingClientRect().left !== w0, w0), tag + ' window drags');
    await tap('#tw-help .tmin'); ok(await p.$('#chip-help'), tag + ' minimise to chip'); await tap('#chip-help'); await tap('#tw-help .tx'); ok(!(await p.$('#tw-help')), tag + ' window closes');
    // 5. legend lists every icon type on the map
    await tap('#keyB'); await p.waitForTimeout(150);
    const lg = await p.evaluate(() => { const pres = new Set(); document.querySelectorAll('#map [class*="ico-"]').forEach(e => (e.getAttribute('class') || '').split(/\s+/).forEach(c => { if (c.startsWith('ico-')) pres.add(c); })); const ks = new Set([...document.querySelectorAll('#legend .lg')].map(e => e.dataset.k)); return { pres: [...pres], miss: [...pres].filter(c => !ks.has(c)) }; });
    ok(!lg.miss.length, tag + ' legend misses ' + lg.miss.join(','));
    await p.screenshot({ path: OUT + '/v3-' + tag + '-4-map-key.png' }); await tap('#tw-key .tx');
    // 6. text >= 13px and tap targets >= 44px on the play screen
    const sz = await p.evaluate(() => { const bad = [], small = []; document.querySelectorAll('#app *, .tw *, #guide *').forEach(e => { if (e.closest('#map')) return; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
      const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (own && parseFloat(cs.fontSize) < 12.9) small.push(e.id || e.className || e.tagName);
      if ((e.tagName === 'BUTTON' || e.getAttribute('role') === 'button') && (r.width < 43.5 || r.height < 43.5)) bad.push((e.id || e.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); return { bad, small }; });
    ok(!sz.small.length, tag + ' text < 13px: ' + sz.small.slice(0, 6).join(', ')); ok(!sz.bad.length, tag + ' tap targets < 44px: ' + sz.bad.slice(0, 6).join(', '));
    await p.evaluate(() => MV.fit()); await p.waitForTimeout(150); await p.screenshot({ path: OUT + '/v3-' + tag + '-0-map.png' });
    ok(!errs.length, tag + ' JS errors: ' + errs.slice(0, 3).join(' | '));
    console.log(tag, 'labels', g.L.length + '/' + g.parts.length, 'icon types', lg.pres.length, 'errors', errs.length);
    await ctx.close();
  }
  await b.close();
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS'); process.exit(fails.length ? 1 : 0);
})();
