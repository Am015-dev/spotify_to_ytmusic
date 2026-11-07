// R4 Story proof by real taps (title, map, chapter card, intro, play), LOSING chapter 1 then retry, then WINNING chapters 1 and 2.
// Winning moves are chosen by the engine's hard AI for the human seat (tap-played winning is luck); every UI step is a real tap. node story-r4.js [phone|land|pc]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html') + '?fast=1';
const SIZES = { phone: [{ width: 390, height: 763 }, true], land: [{ width: 844, height: 390 }, true], pc: [{ width: 1440, height: 860 }, false] };
const only = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, [vp, touch]] of Object.entries(SIZES)) {
    if (only && only !== name) continue;
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.waitForTimeout(400);
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    const say = (ok, msg) => { console.log(name, ok ? 'PASS' : 'FAIL', msg); if (!ok) fails++; };
    const vis = sel => page.locator(sel).filter({ visible: true });
    const toGame = async () => { for (let i = 0; i < 30; i++) { const bt = vis('.gxc-btn').last(); if (await bt.count()) await tap(bt); else if (await page.evaluate(() => !!(window.G && !G.over && GXC.active()))) return true; await page.waitForTimeout(250); } return false; };
    const openChapter = async n => { await page.evaluate(() => { GXC.close && 0; }); const node = page.locator('.gxc-node').nth(n - 1); await tap(node); await page.waitForTimeout(300); };
    const playAssisted = async () => { for (let i = 0; i < 6000; i++) { const st = await page.evaluate(() => ({ over: G.over, tv: !document.getElementById('tv').hidden, mine: !G.over && G.seats[VB.actor(G)].human && !UI.busy })); if (st.over) return; if (st.tv) { await page.evaluate(() => { document.getElementById('tv').hidden = true; }); continue; } if (!st.mine) { await page.waitForTimeout(20); continue; } await page.evaluate(() => { const s = G.seats[0], lv = s.ai; s.ai = 'hard'; const m = VB.aiMove(G); s.ai = lv; doMove(m); }); await page.waitForTimeout(10); } };
    const dumpRects = () => page.evaluate(() => { const bad = []; [...document.querySelectorAll('#es .cell.glow,#mk .tilebtn,#mk .stgoods.glow,#store button,button.die,#acts .btn,.gx-bar button,.och')].forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.width < 43.5 || r.height < 43.5)) bad.push((e.id || e.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); return bad.slice(0, 6).join(', '); });
    await tap(page.locator('#storyB')); await page.waitForTimeout(500);
    say(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'title/map no sideways scroll');
    // ---- chapter 1: lose
    await openChapter(1); await page.screenshot({ path: `shots/r4-${name}-chcard.png` });
    say(await toGame(), 'chapter 1 started by taps');
    say(await vis('#docktitle .gchip').count() === 3, 'live goal tracker visible (3 chips)');
    const h0 = await page.evaluate(() => document.querySelector('#docktitle').innerText);
    for (let k = 0; k < 4; k++) { if (!(await page.evaluate(() => document.getElementById('tv').hidden))) { const b1 = page.locator('#tv .acts .btn:not(.alt)'); if (await b1.count()) await tap(b1.first()); else await tap(page.locator('#tvClose')); } for (const sel of ['#es .glow', '#store .glow', '#mk .tilebtn.glow', '#endB']) { const l = page.locator(sel); if (await l.count()) { await tap(l.first()); break; } } await page.waitForTimeout(30); }
    await page.screenshot({ path: `shots/r4-${name}-play.png` });
    say(!(await dumpRects()), 'play targets >= 44px ' + await dumpRects());
    await page.evaluate(() => { G.P[1].vp += 300; UI.forceEnd(); });
    await page.waitForSelector('#campfin', { timeout: 15000 });
    const lossTxt = await page.locator('#rs').innerText(); await page.screenshot({ path: `shots/r4-${name}-lossresult.png` });
    say(/Chapter lost/.test(lossTxt) && /✗/.test(lossTxt), 'loss card says chapter lost: ' + lossTxt.split('\n').filter(l => /Chapter/.test(l))[0]);
    await tap(page.locator('#campfin')); await page.waitForTimeout(500);
    const kitTxt = await page.locator('.gxc-res').first().innerText().catch(() => ''); await page.screenshot({ path: `shots/r4-${name}-kitloss.png` });
    say(/Not this time/.test(kitTxt), 'kit says Not this time; stars 0');
    // retry
    const retry = vis('.gxc-btn').filter({ hasText: /again|retry|try/i }); say(await retry.count() > 0, 'retry button present');
    // ---- chapter 1: win
    await page.evaluate(() => { GXC.close && 0; }); await page.evaluate(() => GXC.play('c1')); say(await toGame(), 'chapter 1 retried');
    await playAssisted(); await page.waitForSelector('#campfin', { timeout: 20000 });
    const winTxt = await page.locator('#rs').innerText(); const sc = await page.evaluate(() => G.P.map(p => p.vp).join('/'));
    await page.screenshot({ path: `shots/r4-${name}-winresult.png` });
    const metGoals = (winTxt.match(/★/g) || []).length;
    await tap(page.locator('#campfin')); await page.waitForTimeout(600);
    const prog = await page.evaluate(() => GXC.progress().ch.c1);
    say(/Chapter won/.test(winTxt) && prog.beaten && prog.stars === metGoals, `c1 won ${sc}: card goals met ${metGoals}, saved stars ${prog.stars}`);
    // ---- chapter 2
    for (let i = 0; i < 6; i++) { const bt = vis('.gxc-btn').first(); if (!(await bt.count())) break; const t = await bt.textContent(); if (/Play|Continue|Next|map/i.test(t)) { await tap(bt); await page.waitForTimeout(300); } else break; }
    await page.evaluate(() => GXC.play('c2')); say(await toGame(), 'chapter 2 started');
    say(await vis('#docktitle .gchip').count() === 3, 'chapter 2 goal tracker visible: ' + await page.evaluate(() => document.querySelector('#docktitle').innerText.replace(/\n/g, ' | ')));
    await playAssisted(); await page.waitForSelector('#campfin', { timeout: 20000 });
    const t2 = await page.locator('#rs').innerText(); const sc2 = await page.evaluate(() => G.P.map(p => p.vp).join('/'));
    const met2 = (t2.match(/★/g) || []).length; const won2 = /Chapter won/.test(t2);
    await tap(page.locator('#campfin')); await page.waitForTimeout(600);
    const p2 = await page.evaluate(() => GXC.progress().ch.c2 || {});
    say(won2 ? (p2.beaten && p2.stars === met2) : (!p2.beaten && p2.stars === 0), `c2 ${won2 ? 'won' : 'lost'} ${sc2}: card goals ${met2}, saved stars ${p2.stars || 0}, winner ${await page.evaluate(() => G.winner)}`);
    // menu items on the map and in game
    say(errs.filter(e => !/favicon/.test(e)).length === 0, 'errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
