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
  const origin = new URL(base).origin;   // a same-origin 404 / failed image, music file or model is a bug
  page.on('response', r => { const u = r.url(); if (u.startsWith(origin) && r.status() >= 400 && !/favicon/.test(u)) errs.push(`request ${r.status()} ${u.slice(origin.length).slice(0, 70)}`); });
  page.on('requestfailed', r => { const u = r.url(); if (u.startsWith(origin) && !/favicon|ERR_ABORTED/.test(u + (r.failure() && r.failure().errorText))) errs.push(`request failed ${u.slice(origin.length).slice(0, 70)}`); });
  await page.goto(`${base}/${slug}/?scn=${encodeURIComponent(id)}`, { waitUntil: 'load', timeout: 45000 }).catch(e => errs.push('load: ' + e.message.slice(0, 80)));
  return { ctx, page, errs };
}

async function listScn(browser, base, slug) {
  const { ctx, page, errs } = await openScn(browser, base, slug, 'list', SIZES[0]);
  try { await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }); return { list: await page.evaluate(() => window.GXSLIST || []), errs }; }
  catch (e) { return { list: [], errs: errs.concat(['no GXS module / scenarios in the page']) }; }
  finally { await ctx.close(); }
}

const tapAt = (page, sz, x, y) => sz.phone ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);

async function runOne(browser, base, slug, sc, sz, mut) {
  const t0 = Date.now(), fails = [], { ctx, page, errs } = await openScn(browser, base, slug, sc.id, sz); let info = null, skipped = 0;
  try {
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => fails.push('scenario never became ready'));
    info = await page.evaluate(() => window.GXSCN).catch(() => null);
    if (info && info.error) fails.push(info.error);
    if (mut && info && !info.error) {   // scripts/scenario-mutate.js: break the feature on purpose before any check runs
      const ok = await page.evaluate(m => { try { if (m.t === 'named') return GXS.mutateNamed(m.name); GXS.mutate(m); return true; } catch (e) { return String(e.message); } }, mut);
      if (ok !== true) fails.push('mutation did not apply: ' + ok);
    }
    await sleep(600);   // let animations land; checks are about the settled state
    const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });   // the shot shows the state the owner is asked about (before the runner taps anything)
    if (process.env.SCN_SHOTS) await page.screenshot({ path: path.join(dir, `${sc.id}-${sz.id}.png`), scale: 'css' }).catch(() => { });
    const n = info && info.checks ? info.checks.length : 0;
    for (let i = 0; i < n; i++) {
      let r = await page.evaluate(i => GXS.step(i), i).catch(e => ({ ok: false, msg: 'step threw ' + e.message.slice(0, 60) }));
      for (let k = 0; !r.ok && info.checks[i].kind === 'eq' && k < 8; k++) { await sleep(400); r = await page.evaluate(i => GXS.step(i), i).catch(() => r); }   // an animated tally gets ~3 s to land
      if (!r.ok) { fails.push(r.msg); continue; }
      if (r.hold) {   // press and hold (touch: CDP touch events, pc: mouse hover), then read the state while held
        if (sz.phone) { const cd = await page.context().newCDPSession(page); await cd.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.hold.x, y: r.hold.y }] }); await sleep(r.hold.ms);
          const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) })); if (!a.ok) fails.push(a.msg);
          await cd.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); await cd.detach().catch(() => { }); }
        else { await page.mouse.move(r.hold.x, r.hold.y); await sleep(r.hold.ms); const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) })); if (!a.ok) fails.push(a.msg); await page.mouse.move(3, 3); await sleep(300); }
        continue;
      }
      if (r.play) {   // real taps, one step at a time; then the engine must have moved on to a valid state and the outcome must be right
        let bad = '';
        for (let j = 0; j < r.play.n && !bad; j++) {
          let tries = 0, p;
          do {
            p = await page.evaluate(([i, j]) => GXS.pstep(i, j), [i, j]);
            if (p.err) { bad = p.err; break; } if (p.skip) break;
            await tapAt(page, sz, p.x, p.y); await sleep(p.after); tries++;
          } while (p.until && tries < p.max && !(await page.evaluate(([i, j]) => GXS.puntil(i, j), [i, j])));
        }
        if (bad) { fails.push(bad); continue; }
        let idle = await page.evaluate(i => GXS.pidle(i), i);
        for (let k = 0; idle.assist && k < 12; k++) { await tapAt(page, sz, idle.assist.x, idle.assist.y); await sleep(500); idle = await page.evaluate(i => GXS.pidle(i), i); }
        if (!idle.ok) { fails.push(idle.msg || 'question never answered'); continue; }
        await sleep(200);
        const a = await page.evaluate(i => GXS.pend(i), i); if (!a.ok) fails.push(a.msg);
        continue;
      }
      if (r.tap) {
        await tapAt(page, sz, r.tap.x, r.tap.y);
        await sleep(450);
        const a = await page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) }));
        if (!a.ok) fails.push(a.msg);
      }
    }
    if (info && !info.error) {
      (await page.evaluate(inv => GXS.universal(inv), !process.env.SCN_NOINV).catch(() => [])).forEach(m => fails.push(m));
      skipped = await page.evaluate(() => GXS.skipped || 0).catch(() => 0);
      if (!process.env.SCN_NOINV) for (let k = 0; k < 3; k++) {   // every glowing legal target must answer a real tap (the game state must change)
        const g = await page.evaluate(() => ({ t: GXS.glow(), fp: GXS.fp() })).catch(() => ({ t: [] }));
        if (!g.t.length) break;
        await tapAt(page, sz, g.t[0].x, g.t[0].y); await sleep(500);
        if (g.fp === await page.evaluate(() => GXS.fp()).catch(() => g.fp)) { fails.push(`glowing target "${g.t[0].n}" did not respond to a tap`); break; }
      }
    }
    errs.forEach(e => fails.push('page error: ' + e));
  } catch (e) { fails.push('harness: ' + String(e.message).slice(0, 100)); }
  finally { await ctx.close(); }
  return { info, skipped, id: sc.id, size: sz.id, mut: mut ? (mut.name || mut.t) : undefined, ok: !fails.length, fails, sec: +((Date.now() - t0) / 1000).toFixed(1) };
}

module.exports = { SIZES, openScn, listScn, runOne };
if (require.main === module) (async () => {
  if (!slugs.length) { console.error('usage: scenario-test.js <slug...> [--only id] [--sizes phone|pc|all]'); process.exit(2); }
  let own = null, base = process.env.GX_URL;
  if (!base) { own = await gx.startServer({ stage: process.env.GX_STAGE }); base = own.base; }
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
    const skip = res.reduce((a, r) => Math.max(a, r.skipped || 0), 0); if (skip) console.log(`  note: ${slug} lists known findings that are skipped (up to ${skip} per scenario): see GXS.known in its scn.js and HANDOFF.md`);
    console.log(`SCN ${slug} ${noScn || bad.length ? 'FAIL' : 'ok'} ${nOk}/${sel.length} scenarios ${why}   (${((Date.now() - tg) / 1000).toFixed(0)}s, ${jobs.length} runs)`);
  }
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(all, null, 1));
  await browser.close(); if (own) await own.close();
  process.exit(badGames ? 1 : 0);
})();
