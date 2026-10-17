// Scenario check protocol, shared by the Playwright Test spec (scenarios.spec.js) and scenario-mutate.js. Runs ONE scenario on an open page:
// the scenario's own checks (visible / text / eq / tap / hold / play, shell/gx-scenario.js), the universal invariants, "every glowing target answers a tap".
// Env: SCN_NOINV=1 (own checks only). Replaces the old scenario-test.js CLI (job pool, arg parsing, reporting): Playwright Test does that now.
const { chromium } = require('playwright');
const gx = require('./gx-serve.js');
const SIZES = [
  { id: '390x763', w: 390, h: 763, phone: true }, { id: '375x553', w: 375, h: 553, phone: true }, { id: '1366x768', w: 1366, h: 768, phone: false },
];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Collect page errors on a page; returns the array (page errors, console errors, same-origin 404s / failed requests).
function watchErrors(page, origin) {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon|status of 40[34]|Blocked call to navigator.vibrate/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
  page.on('response', r => { const u = r.url(); if (u.startsWith(origin) && r.status() >= 400 && !/favicon/.test(u)) errs.push(`request ${r.status()} ${u.slice(origin.length).slice(0, 70)}`); });   // a same-origin 404 is a bug
  page.on('requestfailed', r => { const u = r.url(); if (u.startsWith(origin) && !/favicon|ERR_ABORTED/.test(u + (r.failure() && r.failure().errorText))) errs.push(`request failed ${u.slice(origin.length).slice(0, 70)}`); });
  return errs;
}

// Open `?scn=<id>` and run the checks. `mut` (scenario-mutate.js) breaks the feature on purpose first. Returns {info, fails}.
async function checkScenario(page, base, slug, id, phone, mut) {
  const fails = [], errs = watchErrors(page, new URL(base).origin);
  const tapAt = (x, y) => phone ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
  await page.goto(`${base}/${slug}/?scn=${encodeURIComponent(id)}`, { waitUntil: 'load', timeout: 45000 }).catch(e => errs.push('load: ' + e.message.slice(0, 80)));
  await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => fails.push('scenario never became ready'));
  const info = await page.evaluate(() => window.GXSCN).catch(() => null);
  if (info && info.error) fails.push(info.error);
  if (mut && info && !info.error) {   // scripts/scenario-mutate.js: break the feature on purpose before any check runs
    const ok = await page.evaluate(m => { try { if (m.t === 'named') return GXS.mutateNamed(m.name); GXS.mutate(m); return true; } catch (e) { return String(e.message); } }, mut);
    if (ok !== true) fails.push('mutation did not apply: ' + ok);
  }
  await sleep(600);   // let animations land; checks are about the settled state
  const after = i => page.evaluate(i => GXS.after(i), i).catch(e => ({ ok: false, msg: 'after threw ' + e.message.slice(0, 60) }));
  const n = info && info.checks ? info.checks.length : 0;
  for (let i = 0; i < n; i++) {
    let r = await page.evaluate(i => GXS.step(i), i).catch(e => ({ ok: false, msg: 'step threw ' + e.message.slice(0, 60) }));
    for (let k = 0; !r.ok && info.checks[i].kind === 'eq' && k < 8; k++) { await sleep(400); r = await page.evaluate(i => GXS.step(i), i).catch(() => r); }   // an animated tally gets ~3 s to land
    if (!r.ok) { fails.push(r.msg); continue; }
    if (r.hold) {   // press and hold (touch: CDP touch events, pc: mouse hover), then read the state while held
      if (phone) { const cd = await page.context().newCDPSession(page); await cd.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.hold.x, y: r.hold.y }] }); await sleep(r.hold.ms);
        const a = await after(i); if (!a.ok) fails.push(a.msg);
        await cd.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); await cd.detach().catch(() => { }); }
      else { await page.mouse.move(r.hold.x, r.hold.y); await sleep(r.hold.ms); const a = await after(i); if (!a.ok) fails.push(a.msg); await page.mouse.move(3, 3); await sleep(300); }
      continue;
    }
    if (r.play) {   // real taps, one step at a time; then the engine must have moved on to a valid state and the outcome must be right
      let bad = '';
      for (let j = 0; j < r.play.n && !bad; j++) {
        let tries = 0, p;
        do {
          p = await page.evaluate(([i, j]) => GXS.pstep(i, j), [i, j]);
          if (p.err) { bad = p.err; break; } if (p.skip) break;
          await tapAt(p.x, p.y); await sleep(p.after); tries++;
        } while (p.until && tries < p.max && !(await page.evaluate(([i, j]) => GXS.puntil(i, j), [i, j])));
      }
      if (bad) { fails.push(bad); continue; }
      let idle = await page.evaluate(i => GXS.pidle(i), i);
      for (let k = 0; idle.assist && k < 12; k++) { await tapAt(idle.assist.x, idle.assist.y); await sleep(500); idle = await page.evaluate(i => GXS.pidle(i), i); }
      if (!idle.ok) { fails.push(idle.msg || 'question never answered'); continue; }
      await sleep(200);
      const a = await page.evaluate(i => GXS.pend(i), i); if (!a.ok) fails.push(a.msg);
      continue;
    }
    if (r.tap) { await tapAt(r.tap.x, r.tap.y); await sleep(450); const a = await after(i); if (!a.ok) fails.push(a.msg); }
  }
  const invFails = [];   // universal invariants + glow-answers-tap, kept apart from the scenario's own checks (build-all.py warns on them, blocks on `fails`); one run gives both
  if (info && !info.error) {
    const all = await page.evaluate(() => GXS.universal(true)).catch(() => []), base = await page.evaluate(() => GXS.universal(false)).catch(() => []);
    base.forEach(m => fails.push(m)); all.filter(m => !base.includes(m)).forEach(m => invFails.push(m));
    if (!process.env.SCN_NOINV) for (let k = 0; k < 3; k++) {   // every glowing legal target must answer a real tap (the game state must change)
      const g = await page.evaluate(() => ({ t: GXS.glow(), fp: GXS.fp() })).catch(() => ({ t: [] }));
      if (!g.t.length) break;
      await tapAt(g.t[0].x, g.t[0].y); await sleep(500);
      if (g.fp === await page.evaluate(() => GXS.fp()).catch(() => g.fp)) { invFails.push(`glowing target "${g.t[0].n}" did not respond to a tap`); break; }
    }
  }
  errs.forEach(e => fails.push('page error: ' + e));
  return { info, fails, invFails };
}

// For scenario-mutate.js (own browser, no Playwright Test): same check in a fresh context.
async function runOne(browser, base, slug, sc, sz, mut) {
  const t0 = Date.now(), ctx = await browser.newContext(sz.phone
    ? { viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' }
    : { viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  try { const page = await ctx.newPage(), { info, fails: own, invFails } = await checkScenario(page, base, slug, sc.id, sz.phone, mut), fails = own.concat(process.env.SCN_NOINV ? [] : invFails);
    return { info, id: sc.id, size: sz.id, ok: !fails.length, fails, sec: +((Date.now() - t0) / 1000).toFixed(1) }; }
  catch (e) { return { info: null, id: sc.id, size: sz.id, ok: false, fails: ['harness: ' + String(e.message).slice(0, 100)] }; }
  finally { await ctx.close(); }
}

async function listScn(browser, base, slug) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 763 } }), page = await ctx.newPage();
  try { await page.goto(`${base}/${slug}/?scn=list`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }); return { list: await page.evaluate(() => window.GXSLIST || []), errs: [] }; }
  catch (e) { return { list: [], errs: ['no GXS module / scenarios in the page'] }; }
  finally { await ctx.close(); }
}

module.exports = { SIZES, UA, checkScenario, runOne, listScn };
