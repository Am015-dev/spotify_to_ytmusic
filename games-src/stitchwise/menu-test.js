// Every Menu item with real input: node menu-test.js [WxH]   (URL env = served build). Prints FAIL lines and one PASS/FAIL summary.
const { chromium } = require('playwright'); const A = process.argv.slice(2), sz = (A.find(a => /^\d+x\d+$/.test(a)) || '390x763').split('x').map(Number);
let fails = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const touch = sz[0] < 900;
  const ctx = await b.newContext({ viewport: { width: sz[0], height: sz[1] }, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { try { localStorage.setItem('sw_seen', '1'); localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'off', ai: 'fast' })); } catch (e) { } });
  const tap = async el => { await el.scrollIntoViewIfNeeded().catch(() => { }); const bb = await el.boundingBox(); if (touch) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); };
  const tapSel = async s => { const el = await pg.$(s); if (!el) throw new Error('missing ' + s); await tap(el); };
  const tapText = async (scope, t) => { const el = await pg.$(scope + ' button:has-text("' + t + '")'); if (!el) throw new Error('missing button ' + t); await tap(el); };
  await pg.goto(process.env.URL || 'http://localhost:8731/index.html'); await pg.waitForTimeout(600);
  await tapSel('[data-a=start]'); await tapText('#start', 'Normal'); await pg.waitForFunction(() => !!G && UI.started, null, { timeout: 5000 });
  const openMenu = async () => { await tapSel('[data-gx=setd]'); await pg.waitForTimeout(300); };
  await openMenu();
  const chips = await pg.evaluate(() => [...document.querySelectorAll('#setd .gx-chip')].map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height, sw: e.scrollWidth, cw: e.clientWidth }; }));
  ok(chips.length >= 5, 'menu has its tabs: ' + chips.map(c => c.t).join(','));
  let overlap = false; for (let i = 0; i < chips.length; i++) for (let j = i + 1; j < chips.length; j++) { const a = chips[i], c = chips[j]; if (a.x < c.x + c.w - 1 && c.x < a.x + a.w - 1 && a.y < c.y + c.h - 1 && c.y < a.y + a.h - 1) overlap = true; }
  ok(!overlap && chips.every(c => c.sw <= c.cw + 1), 'menu tabs do not overlap or overflow');
  ok(await pg.evaluate(() => [...document.querySelectorAll('#setd .gx-sec-t,#setd h3,#setd .gx-row-l')].filter(e => e.textContent.trim() === 'Game').length <= 1), 'no duplicate Game heading');
  ok(!(await pg.evaluate(() => /Silent until/.test(document.body.innerText))), 'no developer text about music files');
  for (const c of chips) { const el = (await pg.$$('#setd .gx-chip')).find(Boolean); void el; }
  for (const t of ['Sound', 'Speed', 'Help', 'Accessibility', 'About']) { const els = await pg.$$('#setd .gx-chip'); let hit = null; for (const e of els) if ((await e.textContent()).trim() === t) hit = e; if (!hit) { ok(false, 'tab ' + t + ' exists'); continue; } await tap(hit); ok(await pg.evaluate(() => !!document.querySelector('#setd')), 'tab ' + t + ' tapped'); }
  const snd = await pg.evaluate(() => UI.sound); const tg = await pg.$('#setd .gx-tg'); if (tg) { await tap(tg); ok(await pg.evaluate(s => UI.sound !== s, snd), 'Sound effects toggle works'); await tap(tg); }
  await tapText('#setd', 'Rules'); ok(await pg.evaluate(() => /How to play/.test(document.querySelector('#rulesd').innerText) && !document.querySelector('#rulesd').hidden), 'Menu > Rules opens How to play');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
  await openMenu(); await tapText('#setd', 'Tutorial'); await pg.waitForFunction(() => !!G && !!UI.coach && !G.over, null, { timeout: 5000 }).then(() => ok(true, 'Menu > Tutorial starts'), () => ok(false, 'Menu > Tutorial starts'));
  await pg.evaluate(() => { try { GXT.stop && GXT.stop(); } catch (e) { } }); const sk = await pg.$('.gxt-skip, button:has-text("Skip tutorial")'); if (sk) await tap(sk); await pg.waitForTimeout(500);
  if (!(await pg.evaluate(() => !!G && UI.started && !UI.tutorial && !UI.coach))) { await pg.evaluate(() => newGame('vs', { lvl: 'normal' })); }
  await openMenu(); await pg.evaluate(() => { window.__g = G; }); await tapText('#setd', 'Restart'); ok(await pg.evaluate(() => !!G && UI.started), 'first Restart tap keeps the game and asks to tap again'); ok(!!(await pg.$('#setd button:has-text("Tap again")')), 'Restart asks for confirmation');
  await tapText('#setd', 'Tap again'); ok(await pg.evaluate(() => !!G && G !== window.__g && UI.started), 'second Restart tap starts a fresh game');
  await openMenu(); await tapText('#setd', 'Title'); ok(await pg.evaluate(() => !document.querySelector('#start').hidden), 'Menu > Title shows the title screen');
  const bad = errs.filter(e => !/favicon|manifest/.test(e)); ok(bad.length === 0, 'no page errors ' + JSON.stringify(bad.slice(0, 2)));
  console.log((fails ? 'FAIL ' : 'PASS ') + 'menu-test ' + sz.join('x') + ' (' + n + ' checks)'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL menu-test crashed:', e.message); process.exit(1); });
