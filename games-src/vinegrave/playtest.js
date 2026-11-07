// Plays like a person with real taps: a whole game to the result screen (the move is the normal AI's choice, executed only through taps on
// the board / sheet / dock), the guided round, and Story stages 1-2 (start + a few turns). node playtest.js [phone|pc] [rounds]
const { chromium } = require('playwright'), serve = require('./serve.js');
const which = process.argv[2] || 'both';
const MARK = () => {   // mark the element to tap for the AI's chosen move; returns 'insp' when a second tap in the sheet will be needed
  document.querySelectorAll('[data-pt]').forEach(e => e.removeAttribute('data-pt'));
  const m = VAI.choose(G, 'normal'); window.__m = m; const sameIdx = () => UI.mv.findIndex(x => VG.same(x, m) && VG.same(m, x));
  let el = null, second = true;
  if (m.t === 'pass') { el = document.querySelector('#acts .btn'); second = false; }
  else if (m.t === 'ans' && (G.q.h === 'exile' || G.q.h === 'or' || m.v == null)) { el = document.querySelector(`#qbox [data-a=mv][data-m="${sameIdx()}"]`); second = false; }
  else el = moveTarget(m);
  if (!el) return 'none ' + JSON.stringify(m);
  el.setAttribute('data-pt', '1'); return second ? 'insp' : 'direct';
};
const MARK2 = () => { const m = window.__m, i = UI.mv.findIndex(x => VG.same(x, m) && VG.same(m, x)); const b = document.querySelector(`#insp [data-a=mv][data-m="${i}"]`); if (!b) return false; b.setAttribute('data-pt', '2'); return true; };
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: '/opt/pw-browsers/chromium' }); let fails = 0;
  const sizes = [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]].filter(s => which === 'both' || s[0] === which);
  for (const [name, vp, touch] of sizes) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text() + ' @' + JSON.stringify(m.location())); }); page.on('requestfailed', r => errs.push('reqfail ' + r.url()));
    page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    const tap = async sel => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => { }); touch ? await l.tap() : await l.click(); };
    await page.goto(S.url, { waitUntil: 'load' }); await page.waitForTimeout(1200);
    // ---- 1) first launch offers the tutorial: play it through
    const offer = await page.locator('#start .tbtn.primary[data-a=start]').count(); if (offer) await tap('#start .tbtn.primary'); await page.waitForTimeout(900);
    const tut = await page.evaluate(() => typeof GXT !== 'undefined' && GXT.active());
    console.log(name, offer && tut ? 'PASS tutorial offered on first launch and started' : 'FAIL tutorial offer'); if (!tut || !offer) fails++;
    let steps = 0, lastId = '';
    for (let k = 0; k < 120 && await page.evaluate(() => GXT.active()); k++) {
      const st = await page.evaluate(() => { const c = GXT.current && GXT.current(); return c ? { id: c.id || (c.step && c.step.id), wait: c.wait || (c.step && c.step.wait) } : null; });
      const s2 = await page.evaluate(() => { const s = GXT.state ? GXT.state() : null; return s; });
      const id = s2 && (s2.id || s2.step); if (id !== lastId) { steps++; lastId = id; if (steps === 3 || steps === 7) await page.screenshot({ path: `shots/tut-${name}-${steps}.png` }); }
      const nxt = page.locator('.gxt-next:visible, [data-gxt="next"]:visible').first();
      if (await nxt.count()) { touch ? await nxt.tap() : await nxt.click(); await page.waitForTimeout(350); continue; }
      const hole = await page.evaluate(() => { const s = GXT.state && GXT.state(); return s && s.hole ? s.hole : null; });
      const tgt = await page.evaluate(() => { const s = GXT.current(); if (!s) return null; let t = s.target; try { t = typeof t === 'function' ? t() : t; } catch (e) { t = null; } if (!t || !t.getBoundingClientRect) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (tgt) { touch ? await page.touchscreen.tap(tgt.x, tgt.y) : await page.mouse.click(tgt.x, tgt.y); }
      const end = page.locator('.gxt-end button, .gxt-done button').first();
      if (await end.count() && await end.isVisible()) break;
      await page.waitForTimeout(500);
    }
    const endShown = await page.locator('.gxt-end button:visible, .gxt-done button:visible, .gxt button:visible').count();
    await page.screenshot({ path: `shots/tut-${name}-end.png` });
    console.log(name, 'tutorial steps seen', steps, endShown ? 'PASS end card' : 'FAIL no end card'); if (!endShown || steps < 7) fails++;
    // leave through the end card's Play button (or exit)
    const playB = page.locator('.gxt button:visible', { hasText: /play/i }).first();
    if (await playB.count()) { touch ? await playB.tap() : await playB.click(); } else await page.evaluate(() => { GXT.stop(); UIACT.quick(); });
    await page.waitForTimeout(800);
    // ---- 2) a whole game by taps
    await page.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } });
    if (!(await page.evaluate(() => !!(window.G && G.phase === 'play')))) await page.evaluate(() => UIACT.quick());
    await page.evaluate(() => { UI.fast = true; });
    let turns = 0, stuck = 0, shot = 0;
    for (let k = 0; k < 900; k++) {
      const st = await page.evaluate(() => G ? (G.phase === 'over' ? 'over' : (typeof myTurn === 'function' && myTurn() ? 'me' : 'wait')) : 'none');
      if (st === 'over') break; if (st !== 'me') { await page.waitForTimeout(120); if (++stuck > 400) break; continue; } stuck = 0;
      if (await page.locator('#pass:not([hidden])').count()) { await tap('#pass .tbtn'); continue; }
      const r = await page.evaluate(MARK); if (r.startsWith('none')) { console.log(name, 'FAIL no target for', r); fails++; break; }
      await tap('[data-pt="1"]');
      if (r === 'insp') { await page.waitForSelector('#insp:not([hidden])', { timeout: 3000 }); const ok = await page.evaluate(MARK2); if (!ok) { console.log(name, 'FAIL no sheet button for', JSON.stringify(await page.evaluate(() => window.__m))); fails++; await tap('#insp .ix'); break; } await tap('[data-pt="2"]'); }
      turns++; if (turns === 12 && !shot++) await page.screenshot({ path: `shots/play-${name}.png` });
      await page.waitForTimeout(60);
    }
    await page.waitForSelector('#rs:not([hidden]) table', { timeout: 15000 }).catch(() => { });
    const res = await page.locator('#rs:not([hidden]) table').count(); await page.screenshot({ path: `shots/full-result-${name}.png` });
    const sc = await page.evaluate(() => G && G.p.map((p, i) => p.name + ' ' + VG.score(G, i).total).join(', '));
    console.log(name, res ? 'PASS full game to result' : 'FAIL no result', 'my taps', turns, '|', sc); if (!res) fails++;
    // ---- 3) Story stages 1 and 2: open the map, start, play 4 turns by taps
    for (const chId of ['c1', 'c2']) {
      await page.evaluate(id => { document.querySelector('#rs').hidden = true; UI.fast = true; if (id === 'c2') { try { const k = 'gns-campaign-vinegrave', o = JSON.parse(localStorage.getItem(k) || '{"v":1,"ch":{}}'); o.ch = o.ch || {}; o.ch.c1 = { beaten: true, stars: 1, best: 1, tries: 1, losses: 0 }; localStorage.setItem(k, JSON.stringify(o)); } catch (e) { } } else GXC.play(id); }, chId);
      if (chId === 'c2') { await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200); await page.evaluate(() => { UI.fast = true; try { GXH.setEnabled(false); } catch (e) { } GXC.play('c2'); }); await page.waitForTimeout(700); } await page.waitForTimeout(700);
      for (let k = 0; k < 8; k++) { const sk = page.locator('.gxc button:visible', { hasText: /^(Skip|Play|Start|Begin|Next|Let)/ }).first(); if (!(await sk.count())) break; touch ? await sk.tap() : await sk.click(); await page.waitForTimeout(350); }
      const ok = await page.evaluate(id => !!(window.G && UI.camp && UI.camp.id === id && G.phase === 'play'), chId);
      let t2 = 0; for (let k = 0; k < 200 && t2 < 4 && ok; k++) { if (!(await page.evaluate(() => myTurn()))) { await page.waitForTimeout(100); continue; } const r = await page.evaluate(MARK); if (r.startsWith('none')) break; await tap('[data-pt="1"]'); if (r === 'insp') { await page.waitForSelector('#insp:not([hidden])'); if (await page.evaluate(MARK2)) await tap('[data-pt="2"]'); else await tap('#insp .ix'); } t2++; }
      if (chId === 'c1') await page.screenshot({ path: `shots/story-${name}.png` });
      console.log(name, 'story', chId, ok && t2 >= 4 ? 'PASS started and played ' + t2 + ' turns' : 'FAIL'); if (!ok || t2 < 4) fails++;
    }
    console.log(name, 'errors', errs.length, errs.slice(0, 4).join(' | ')); if (errs.length) fails++;
    await ctx.close();
  }
  await b.close(); S.close(); console.log(fails ? 'FAIL ' + fails : 'PASS playtest'); process.exit(fails ? 1 : 0);
})();
