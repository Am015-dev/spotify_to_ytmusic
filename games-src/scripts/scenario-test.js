// Scenario runner: opens every `?scn=<id>` scenario of a game at 390x763, 375x553 and 1366x768 over the shared http server, runs the
// scenario's machine asserts (shell/gx-scenario.js: visible / text / eq / tap / fn), screenshots, and fails on page errors. Seconds per scenario.
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/scenario-test.js <slug...> [--only <scn-id>] [--sizes phone|pc|all]
// Env: GX_URL (build-all.py sets it; else a private server over games-src/.staging + games/), SCN_OUT (screenshots + results.json, default games-src/.staging/.scn),
//      JOBS (pages at once, default 3).
// Output per game:   SCN <slug> ok|FAIL <passed>/<total> <first failures>      (build-all.py reads this line)
// A scenario that a game has not registered yet counts as a FAIL ("no scenarios"): every game needs at least a board scenario and a zoom scenario.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const gx = require('./gx-serve.js');
const SIZES = [
  { id: '390x763', w: 390, h: 763, phone: true }, { id: '375x553', w: 375, h: 553, phone: true }, { id: '1366x768', w: 1366, h: 768, phone: false },
];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2), slugs = [];
let only = null, sizeSel = 'all';
for (let i = 0; i < args.length; i++) { if (args[i] === '--only') only = args[++i]; else if (args[i] === '--sizes') sizeSel = args[++i]; else slugs.push(args[i]); }
const OUT = process.env.SCN_OUT ? path.resolve(process.env.SCN_OUT) : path.join(__dirname, '..', '.staging', '.scn');
const JOBS = +process.env.JOBS || 3;

async function openScn(browser, base, slug, id, sz) {
  const ctx = await browser.newContext(sz.phone
    ? { viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' }
    : { viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon|status of 40[34]|Blocked call to navigator.vibrate/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
  await page.goto(`${base}/${slug}/?scn=${encodeURIComponent(id)}`, { waitUntil: 'load', timeout: 45000 }).catch(e => errs.push('load: ' + e.message.slice(0, 80)));
  return { ctx, page, errs };
}

async function listScn(browser, base, slug) {
  const { ctx, page, errs } = await openScn(browser, base, slug, 'list', SIZES[0]);
  try { await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }); return { list: await page.evaluate(() => window.GXSLIST || []), errs }; }
  catch (e) { return { list: [], errs: errs.concat(['no GXS module / scenarios in the page']) }; }
  finally { await ctx.close(); }
}

async function runOne(browser, base, slug, sc, sz) {
  const t0 = Date.now(), fails = [], { ctx, page, errs } = await openScn(browser, base, slug, sc.id, sz);
  try {
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => fails.push('scenario never became ready'));
    const info = await page.evaluate(() => window.GXSCN).catch(() => null);
    if (info && info.error) fails.push(info.error);
    await sleep(600);   // let animations land; checks are about the settled state
    const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });   // the shot shows the state the owner is asked about (before the runner taps anything)
    await page.screenshot({ path: path.join(dir, `${sc.id}-${sz.id}.png`), scale: 'css' }).catch(() => { });
    const n = info && info.checks ? info.checks.length : 0;
    for (let i = 0; i < n; i++) {
      const r = await page.evaluate(i => GXS.step(i), i).catch(e => ({ ok: false, msg: 'step threw ' + e.message.slice(0, 60) }));
      if (!r.ok) { fails.push(r.msg); continue; }
      if (r.hold) {   // press and hold (touch: CDP touch events, pc: mouse hover), then read the state while held
        if (sz.phone) { const cd = await page.context().newCDPSession(page); await cd.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.hold.x, y: r.hold.y }] }); await sleep(r.hold.ms);
          const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) })); if (!a.ok) fails.push(a.msg);
          await cd.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); await cd.detach().catch(() => { }); }
        else { await page.mouse.move(r.hold.x, r.hold.y); await sleep(r.hold.ms); const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) })); if (!a.ok) fails.push(a.msg); await page.mouse.move(3, 3); await sleep(300); }
        continue;
      }
      if (r.tap) {
        if (sz.phone) await page.touchscreen.tap(r.tap.x, r.tap.y); else await page.mouse.click(r.tap.x, r.tap.y);
        await sleep(450);
        const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) }));
        if (!a.ok) fails.push(a.msg);
      }
    }
    if (info && !info.error) (await page.evaluate(() => GXS.universal()).catch(() => [])).forEach(m => fails.push(m));
    errs.forEach(e => fails.push('page error: ' + e));
  } catch (e) { fails.push('harness: ' + String(e.message).slice(0, 100)); }
  finally { await ctx.close(); }
  return { id: sc.id, size: sz.id, ok: !fails.length, fails, sec: +((Date.now() - t0) / 1000).toFixed(1) };
}

(async () => {
  if (!slugs.length) { console.error('usage: scenario-test.js <slug...> [--only id] [--sizes phone|pc|all]'); process.exit(2); }
  let own = null, base = process.env.GX_URL;
  if (!base) { own = await gx.startServer({}); base = own.base; }
  base = base.replace(/\/+$/, '');
  const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const all = {}; let badGames = 0;
  for (const slug of slugs) {
    const tg = Date.now(), { list, errs } = await listScn(browser, base, slug), jobs = [];
    const sel = list.filter(s => !only || s.id === only);
    for (const sc of sel) for (const sz of SIZES) {
      if (sizeSel !== 'all' && (sizeSel === 'phone') !== sz.phone) continue;
      if (sc.sizes === 'phone' && !sz.phone) continue; if (sc.sizes === 'pc' && sz.phone) continue;
      jobs.push([sc, sz]);
    }
    const res = []; let ix = 0;
    await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) || 1 }, async () => { while (ix < jobs.length) { const [sc, sz] = jobs[ix++]; res.push(await runOne(browser, base, slug, sc, sz)); } }));
    res.sort((a, b) => (a.id + a.size).localeCompare(b.id + b.size));
    all[slug] = { list, res, errs };
    const bad = res.filter(r => !r.ok), noScn = !sel.length;
    if (bad.length || noScn) badGames++;
    for (const r of res) console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${slug} ${r.id} @${r.size} ${r.sec}s${r.ok ? '' : ' :: ' + r.fails.slice(0, 3).join(' | ')}`);
    const nOk = new Set(sel.filter(sc => !res.some(r => r.id === sc.id && !r.ok)).map(s => s.id)).size;
    const why = noScn ? ' no scenarios registered (' + (errs[0] || 'empty list') + ')' : bad.slice(0, 2).map(r => `${r.id}@${r.size}: ${r.fails[0]}`).join(' ; ');
    console.log(`SCN ${slug} ${noScn || bad.length ? 'FAIL' : 'ok'} ${nOk}/${sel.length} scenarios ${why}   (${((Date.now() - tg) / 1000).toFixed(0)}s, ${jobs.length} runs)`);
  }
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(all, null, 1));
  await browser.close(); if (own) await own.close();
  process.exit(badGames ? 1 : 0);
})();
