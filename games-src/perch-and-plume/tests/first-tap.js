// First-tap gate (G4 review): every button answers the FIRST tap within 1 s, at real speed (no fast mode), at 390x844 and 375x667.
// Walks Quick game -> Start -> Keep these -> Play a bird -> a bird -> a glowing space -> Play, then Get food -> a die.
// Then a full game by touch (touch-game.js): every glowing target in every round answers its first tap. Also checks: nothing covers a button when it is tapped; after choosing a space the Play button and the chosen card are on
// screen without scrolling, below the sticky "Your turn" header; the prompt says "Tap Play"; the card no longer says
// "tap a glowing space"; board spaces are at least 44 px.        node tests/first-tap.js [url]
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const errs = [];
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('pp-played', '1'); } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL); await p.waitForTimeout(800);
    // tap once: the element at the button's centre must be the button (or inside it), and `answered` must turn true within 1 s
    const tap1 = async (sel, answered, name) => {
      const loc = p.locator(sel).first(); await loc.waitFor({ state: 'visible', timeout: 15000 }); await loc.scrollIntoViewIfNeeded();
      const top = await loc.evaluate(e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (e === t || e.contains(t)) ? 'ok' : (t ? (t.id || t.className || t.tagName) : 'none'); });
      const t0 = Date.now(); await loc.tap();
      const done = await p.waitForFunction(answered, null, { timeout: 1000 }).then(() => true).catch(() => false);
      ok(top === 'ok' && done, `${w}x${h} "${name}" answers the first tap (${done ? Date.now() - t0 + ' ms' : 'no answer in 1 s'}${top === 'ok' ? '' : ', covered by ' + top})`);
    };
    await tap1('[data-t="quick"]', () => !!document.querySelector('[data-go]'), 'Quick game');
    await tap1('[data-go]', () => !!document.querySelector('#keepgo'), 'Start');
    await tap1('#keepgo', () => document.querySelector('#setup').hidden, 'Keep these');
    await p.waitForFunction(() => myTurn() && document.querySelector('#act4') && !document.querySelector('.turnban') && !UI.busy, null, { timeout: 15000 });
    ok(await p.evaluate(() => document.querySelector('#pop').hidden), `${w}x${h} no pop-up covers the board when the first turn starts`);
    await tap1('.a4[data-k="play"]', () => UI.pickBird === true, 'Play a bird');
    await tap1('#hand .bc.glow', () => UI.sel != null, 'a playable bird');
    const sz = await p.evaluate(() => { const r = document.querySelector('.slot.glow').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
    ok(sz[0] >= 44 && sz[1] >= 44, `${w}x${h} board space is ${sz[0]}x${sz[1]} (44 px or more)`);
    await tap1('.slot.glow', () => !!UI.pend, 'a glowing space');
    await p.waitForTimeout(150);
    const v = await p.evaluate(() => {
      const db = document.querySelector('#dockbody').getBoundingClientRect(), hd = document.querySelector('.gx-dock-head').getBoundingClientRect(), pr = document.querySelector('#prompt').getBoundingClientRect();
      const go = document.querySelector('[data-a="playgo"]').getBoundingClientRect(), t = document.elementFromPoint(go.left + go.width / 2, go.top + go.height / 2);
      const card = document.querySelector('#hand .bc.sel'), cr = card && card.getBoundingClientRect();
      return { goIn: go.top >= Math.max(db.top, hd.bottom, pr.bottom) - 1 && go.bottom <= Math.min(db.bottom, innerHeight) + 1, goTop: !!t && !!t.closest('[data-a="playgo"]'),
        cardOn: !!cr && cr.top < innerHeight - 80 && cr.bottom > db.top, prompt: document.querySelector('#prompt').textContent, stale: /glowing space/.test(card ? card.textContent : ''), y: Math.round(go.top) };
    });
    ok(v.goIn && v.goTop, `${w}x${h} after choosing a space, the Play button is on screen and uncovered (y=${v.y})`);
    ok(v.cardOn, `${w}x${h} after choosing a space, the chosen bird card shows on screen`);
    ok(/^Tap Play/.test(v.prompt) && !v.stale, `${w}x${h} prompt matches the step: "${v.prompt}"${v.stale ? ' (card still says tap a glowing space)' : ''}`);
    await tap1('[data-a="playgo"]', () => G.pl[UI.view].board.some(r => r.length > 0), 'Play (confirm)');
    // the next turn: Get food -> a die
    await p.waitForFunction(() => myTurn() && document.querySelector('#act4') && !document.querySelector('.turnban') && !UI.busy && !G.q, null, { timeout: 30000 });
    await tap1('.a4[data-k="food"]', () => !!(G.q && G.q.h === 'die') || UI.busy, 'Get food');
    if (await p.evaluate(() => !!(G.q && G.q.h === 'die'))) {
      await p.evaluate(() => { window.__f0 = G.feeder.filter(Boolean).length; });
      await tap1('.die.glow', () => G.feeder.filter(Boolean).length !== window.__f0 || UI.gsDie != null || !G.q || G.q.h !== 'die', 'a food die');
    }
    await ctx.close();
  }
  ok(errs.length === 0, 'console/page errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close();
  // R6 review: a glowing "+2 food" row ignored a tap in round 4. Every glowing target in a FULL game must answer its first tap:
  // tests/touch-game.js plays a whole Quick game by touch at both sizes, following the glow (QUICK=1 skips it).
  if (!process.env.QUICK) { const r = require('child_process').spawnSync(process.execPath, [require('path').join(__dirname, 'touch-game.js'), URL], { stdio: 'inherit' }); if (r.status !== 0) fails++; } process.exit(fails ? 1 : 0);
})();
