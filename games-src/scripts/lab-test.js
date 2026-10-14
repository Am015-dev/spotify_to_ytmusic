// LAB acceptance tests (tests first, 13 Oct 2026). One game, real touch taps, over the shared http server (GX_URL).
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/lab-test.js <slug...>
// (a) test mode OFF: the page has no LAB element / style (so phone-check and layout are untouched).
// (b) test mode ON: 🧪 LAB sits inside the screen, its list == the game's scenarios (GXSLIST), and EVERY ▶ GO opens that scenario (menu -> GO, no reload by hand)
//     whose machine checks pass (touch taps), with the LAB still one tap away; at 390x763 (all GOs) and 375x553 (menu fits, no sideways scroll).
// (c) pinned checklist: 📍 chip -> card shows this game's What's new items (updates.json); a touch ✅ is saved in the shelf's own key, shows as pressed on the
//     shelf checklist (games/index.html#<id>) and as ✅ in lab.html (390 wide, no sideways scroll).
// Output:  LAB <slug> ok|FAIL <n>/<m> checks :: first failures        (build-all.py reads this line)
const { chromium } = require('playwright');
const gx = require('./gx-serve.js');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const IDS = { 'crown-city-smash': 'crown', 'nebula-aces': 'nebula', 'doorkick-dungeon': 'doorkick', 'shipwreck-isle': 'shipwreck', 'sands-of-qamar': 'sands', 'sunglaze': 'sunglaze', 'rampart-and-vine': 'rampart', 'short-fuse': 'shortfuse', 'tidewake': 'tidewake', 'hollowbough': 'hollowbough', 'thornbound': 'thornbound', 'kaiten-kitchen': 'kaiten', 'lantern-dive': 'lantern', 'cauldron-fair': 'cauldron', 'final-approach': 'approach' };
const phoneCtx = (b, w, h) => b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });

async function openGame(ctx, base, slug, qs, errs) {
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.goto(`${base}/${slug}/${qs}`, { waitUntil: 'load', timeout: 45000 }).catch(e => errs.push('load: ' + e.message.slice(0, 80)));
  return page;
}
const tapSel = async (page, sel) => { const b = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel); if (!b) throw new Error('not found ' + sel); await page.touchscreen.tap(b.x, b.y); await sleep(250); };

async function runChecks(page, fails, id) {   // same step/tap protocol as scenario-test.js, touch only
  await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => fails.push(id + ': scenario never ready'));
  const info = await page.evaluate(() => window.GXSCN).catch(() => null);
  if (!info) return; if (info.error) { fails.push(id + ': ' + info.error); return; }
  if (info.id !== id) { fails.push(`${id}: GO opened ${info.id} (page ${page.url().slice(-40)})`); return; }
  await sleep(600);
  for (let i = 0; i < (info.checks || []).length; i++) {
    let r = await page.evaluate(i => GXS.step(i), i).catch(e => ({ ok: false, msg: 'step threw' }));
    for (let k = 0; !r.ok && info.checks[i].kind === 'eq' && k < 8; k++) { await sleep(400); r = await page.evaluate(i => GXS.step(i), i).catch(() => r); }   // an animated tally gets ~3 s to land
    if (!r.ok) { fails.push(`${id}: ${r.msg}`); continue; }
    if (r.play) {   // behaviour check: real taps step by step, the turn must settle, then the outcome is asserted (same protocol as scenario-test.js)
      let bad = '';
      for (let j = 0; j < r.play.n && !bad; j++) { let tries = 0, p;
        do { p = await page.evaluate(([i, j]) => GXS.pstep(i, j), [i, j]); if (p.err) { bad = p.err; break; } if (p.skip) break; await page.touchscreen.tap(p.x, p.y); await sleep(p.after); tries++; }
        while (p.until && tries < p.max && !(await page.evaluate(([i, j]) => GXS.puntil(i, j), [i, j]))); }
      if (bad) { fails.push(`${id}: ${bad}`); continue; }
      let idle = await page.evaluate(i => GXS.pidle(i), i);
      for (let k = 0; idle.assist && k < 12; k++) { await page.touchscreen.tap(idle.assist.x, idle.assist.y); await sleep(500); idle = await page.evaluate(i => GXS.pidle(i), i); }
      if (!idle.ok) { fails.push(`${id}: ${idle.msg || 'question never answered'}`); continue; }
      await sleep(200); const a = await page.evaluate(i => GXS.pend(i), i); if (!a.ok) fails.push(`${id}: ${a.msg}`); continue; }
    const pt = r.tap || r.hold; if (!pt) continue;
    if (r.hold) { const cd = await page.context().newCDPSession(page); await cd.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pt.x, y: pt.y }] }); await sleep(pt.ms);
      const a = await page.evaluate(i => GXS.after(i), i).catch(() => ({ ok: false, msg: 'after threw' })); if (!a.ok) fails.push(`${id}: ${a.msg}`);
      await cd.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); await cd.detach().catch(() => { }); continue; }
    await page.touchscreen.tap(pt.x, pt.y); await sleep(450);
    const a = await page.evaluate(i => GXS.after(i), i).catch(() => ({ ok: false, msg: 'after threw' })); if (!a.ok) fails.push(`${id}: ${a.msg}`);
  }
  (await page.evaluate(() => GXS.universal()).catch(() => [])).forEach(m => fails.push(`${id}: ${m}`));
}

async function testGame(browser, base, slug) {
  const fails = [], errs = []; let n = 0; const ok = (c, m) => { n++; if (!c) fails.push(m); return c; };
  const gid = IDS[slug];
  // ---- (a) off ----
  { const ctx = await phoneCtx(browser, 390, 763), page = await openGame(ctx, base, slug, '', errs); await sleep(800);
    const off = await page.evaluate(() => ({ el: document.querySelectorAll('[id^=gxlab],.gxl-panel,#gxlab-css').length, glob: typeof window.GXLAB, ui: !!(window.GXLAB && GXLAB.ui) }));
    ok(off.el === 0 && !off.ui, '(a) test mode off: LAB elements in the page ' + off.el + ' ui=' + off.ui);
    await ctx.close(); }
  // ---- list of scenarios ----
  const lctx = await phoneCtx(browser, 390, 763), lp = await openGame(lctx, base, slug, '?scn=list', errs);
  await lp.waitForFunction(() => window.GXSLIST, null, { timeout: 20000 }).catch(() => { });
  const list = await lp.evaluate(() => window.GXSLIST || []); await lctx.close();
  if (process.env.GX_STAGE) { const fs = require('fs'), path = require('path'); let all = {}; try { all = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'games', 'scenarios.json'), 'utf8')); } catch (e) { } try { Object.assign(all, JSON.parse(fs.readFileSync(path.join(process.env.GX_STAGE, 'scenarios.json'), 'utf8'))); } catch (e) { } all[slug] = list; fs.writeFileSync(path.join(process.env.GX_STAGE, 'scenarios.json'), JSON.stringify(all)); }
  ok(list.length >= 2, '(b) fewer than 2 scenarios registered (' + list.length + ')');
  // ---- (b) on, 390x763: menu lists GXSLIST, every GO runs ----
  { const ctx = await phoneCtx(browser, 390, 763), page = await openGame(ctx, base, slug, '?test=1', errs);
    try {
      await page.waitForSelector('#gxlab-btn', { timeout: 15000 });
      const bb = await page.evaluate(() => { const r = document.getElementById('gxlab-btn').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
      ok(bb.l >= 0 && bb.t >= 0 && bb.r <= 390 && bb.b <= 763 && bb.w >= 24 && bb.h >= 20, '(b) LAB button not inside the screen / too small ' + JSON.stringify(bb));
      await tapSel(page, '#gxlab-btn');
      const rows = await page.evaluate(() => [...document.querySelectorAll('#gxlab-menu .gxl-row')].map(r => r.dataset.id));
      ok(rows.length === list.length && list.every(s => rows.includes(s.id)), `(b) LAB rows [${rows.join(',')}] != scenarios [${list.map(s => s.id).join(',')}]`);
      for (const s of list.filter(x => x.sizes !== 'pc')) {   // PC-only scenarios cannot run at 390x763
        const open = await page.evaluate(() => { const m = document.getElementById('gxlab-menu'); return !!m && !m.hidden; });
        if (process.env.LABDBG) console.log('menu open?', open, page.url().slice(-45)); if (!open) await tapSel(page, '#gxlab-btn');
        await page.evaluate(id => { const b = document.querySelector('#gxlab-menu [data-go="' + id + '"]'); if (b) b.scrollIntoView({ block: 'center' }); }, s.id);
        await sleep(150);
        const nav = page.waitForURL(u => u.search.includes('scn=' + s.id + '&'), { waitUntil: 'load', timeout: 30000 }).catch(() => null);
        await tapSel(page, `#gxlab-menu [data-go="${s.id}"]`); await nav; if (process.env.LABDBG) console.log('after GO', s.id, page.url().slice(-45));
        const f0 = fails.length; await runChecks(page, fails, s.id);
        const lab = await page.evaluate(() => { const e = document.getElementById('gxlab-btn'); if (!e) return false; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.width > 10 && r.bottom <= innerHeight && (t === e || e.contains(t)); }).catch(() => false);
        ok(lab, `${s.id}: LAB not one tap away after GO`); ok(fails.length === f0, `${s.id} checks`); }
    } catch (e) { fails.push('(b) ' + String(e.message).slice(0, 100) + ' @' + (await page.evaluate(() => { const m = document.getElementById('gxlab-menu'); return location.search + ' menu=' + (m ? (m.hidden ? 'hidden' : 'open') + ' rows=' + m.querySelectorAll('.gxl-row').length : 'none'); }).catch(() => '?'))); }
    await ctx.close(); }
  // ---- (b2) 375x553: LAB menu fits, no sideways scroll ----
  { const ctx = await phoneCtx(browser, 375, 553), page = await openGame(ctx, base, slug, '?test=1#lab', errs);
    try { await page.waitForSelector('#gxlab-menu:not([hidden])', { timeout: 15000 }); await sleep(300);
      const m = await page.evaluate(() => { const p = document.getElementById('gxlab-menu').getBoundingClientRect(); return { l: p.left, r: p.right, t: p.top, sx: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }; });
      ok(m.l >= -1 && m.r <= 376 && m.t >= 0 && m.sx <= 376, '(b) 375x553 LAB menu/page overflows ' + JSON.stringify(m)); } catch (e) { fails.push('(b2) ' + String(e.message).slice(0, 100)); }
    await ctx.close(); }
  // ---- (c) pinned checklist -> shelf -> lab.html ----
  { const ctx = await phoneCtx(browser, 390, 763), page = await openGame(ctx, base, slug, '?test=1', errs);
    try {
      const upds = await page.evaluate(() => fetch('../updates.json').then(r => r.json()));
      const ents = upds.filter(e => e.game === gid || e.game === slug).slice(0, 4), tot = ents.reduce((a, e) => a + (e.items || []).length, 0);
      ok(ents.length > 0, '(c) no What\'s new entry for ' + gid + ' in updates.json');
      await page.waitForSelector('#gxlab-ck', { timeout: 15000 }); await tapSel(page, '#gxlab-ck');
      const shown = await page.evaluate(() => [...document.querySelectorAll('#gxlab-card .gxl-item')].map(e => e.querySelector('.gxl-p').textContent));
      ok(shown.length === tot && ents[0] && shown[0] === ents[0].items[0], `(c) pinned card shows ${shown.length}/${tot} items; first "${(shown[0] || '').slice(0, 30)}"`);
      let pick = null; ents.forEach((e, ei) => (e.items || []).forEach((_, i) => { if (!pick && e.scn && e.scn[i]) pick = { e, ei, i, sid: e.scn[i] }; }));
      ok(!!pick, '(c) no checklist item with a scenario (--scn) in the newest entries');
      if (pick) {
        await tapSel(page, `#gxlab-card [data-s="ok"][data-e="${pick.ei}"][data-i="${pick.i}"]`);
        const key = `${pick.e.date}|${pick.e.game}|${pick.i}`;
        const saved = await page.evaluate(k => (JSON.parse(localStorage.getItem('shelf_ck_res') || '{}')[k] || {}).s, key);
        ok(saved === 'ok', '(c) ✅ tap not saved in shelf_ck_res (' + saved + ')');
        const st = await ctx.storageState(), c2 = await browser.newContext({ viewport: { width: 1366, height: 768 }, storageState: st, serviceWorkers: 'block' });
        const sh = await c2.newPage(); sh.on('pageerror', e => errs.push('shelf: ' + String(e.message).slice(0, 100)));
        await sh.goto(`${base}/index.html#${gid}`, { waitUntil: 'load', timeout: 45000 }); await sh.waitForSelector('#cktest:not([hidden])', { timeout: 20000 }).catch(() => { });
        await sh.evaluate(() => { const c = document.getElementById('ck'); if (c && c.hidden) document.getElementById('cktest').click(); }); await sleep(500);
        const pressed = await sh.evaluate(k => { const b = [...document.querySelectorAll('#ckbody [data-ck="ok"]')].find(x => x.dataset.k === k); return b ? b.getAttribute('aria-pressed') : 'missing'; }, key);
        ok(pressed === 'true', '(c) shelf checklist does not show the ✅ (' + pressed + ')');
        await c2.close();
        const c3 = await browser.newContext({ viewport: { width: 390, height: 763 }, storageState: st, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
        const lab = await c3.newPage(); lab.on('pageerror', e => errs.push('lab.html: ' + String(e.message).slice(0, 100)));
        await lab.goto(`${base}/lab.html`, { waitUntil: 'load', timeout: 45000 }); await lab.waitForSelector('.lrow', { timeout: 15000 }).catch(() => { }); await sleep(300);
        const chip = await lab.evaluate(k => { const r = document.querySelector('.lrow[data-k="' + k + '"]'); return r ? r.dataset.res : 'missing'; }, slug + '/' + pick.sid);
        ok(chip === 'ok', '(c) lab.html does not show ✅ for ' + pick.sid + ' (' + chip + ')');
        const sx = await lab.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)); ok(sx <= 391, '(c) lab.html sideways scroll ' + sx);
        await c3.close(); }
    } catch (e) { fails.push('(c) ' + String(e.message).slice(0, 120)); }
    await ctx.close(); }
  errs.slice(0, 3).forEach(e => fails.push('page error: ' + e));
  return { n, fails };
}

(async () => {
  const slugs = process.argv.slice(2); if (!slugs.length) { console.error('usage: lab-test.js <slug...>'); process.exit(2); }
  let own = null, base = process.env.GX_URL; if (!base) { own = await gx.startServer({ stage: process.env.GX_STAGE }); base = own.base; } base = base.replace(/\/+$/, '');
  const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb'] }); let bad = 0;
  for (const slug of slugs) {
    const t0 = Date.now(), r = await testGame(browser, base, slug); if (r.fails.length) bad++;
    console.log(`LAB ${slug} ${r.fails.length ? 'FAIL' : 'ok'} ${r.n - r.fails.length}/${r.n} checks ${r.fails.slice(0, 3).join(' | ')}   (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  await browser.close(); if (own) await own.close(); process.exit(bad ? 1 : 0);
})();
