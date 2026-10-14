// One Playwright test per game scenario (`?scn=<id>`, shell/gx-scenario.js): open it, run the scenario's own checks (visible / text / eq / tap / hold / play),
// the universal invariants and the glow-responds check, and fail on page errors. Config: ../playwright.config.js (projects phone | phone-s | pc).
// Env: SCN_SLUGS (games), SCN_LIST (set by the config), SCN_NOINV=1 (own checks only), SCN_MUT (JSON mutation for scenario-mutate.js).
const { test, expect } = require('@playwright/test');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const list = JSON.parse(process.env.SCN_LIST || '{}');
const ORIGIN = new URL(process.env.GX_URL).origin;

for (const [slug, scns] of Object.entries(list)) test.describe(slug, () => {
  if (!scns.length) test('no scenarios registered', () => { expect(scns.length, 'every game needs at least a board scenario and a zoom scenario').toBeGreaterThan(0); });
  for (const sc of scns) test(sc.id, async ({ page }, ti) => {
    const phone = ti.project.use.isMobile, fails = [], errs = [];
    test.skip((sc.sizes === 'phone' && !phone) || (sc.sizes === 'pc' && phone), 'scenario is not for this size');
    const tapAt = (x, y) => phone ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon|status of 40[34]|Blocked call to navigator.vibrate/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
    page.on('response', r => { const u = r.url(); if (u.startsWith(ORIGIN) && r.status() >= 400 && !/favicon/.test(u)) errs.push(`request ${r.status()} ${u.slice(ORIGIN.length).slice(0, 70)}`); });   // a same-origin 404 is a bug
    page.on('requestfailed', r => { const u = r.url(); if (u.startsWith(ORIGIN) && !/favicon|ERR_ABORTED/.test(u + (r.failure() && r.failure().errorText))) errs.push(`request failed ${u.slice(ORIGIN.length).slice(0, 70)}`); });
    await page.goto(`${ORIGIN}/${slug}/?scn=${encodeURIComponent(sc.id)}`, { waitUntil: 'load', timeout: 45000 }).catch(e => fails.push('load: ' + e.message.slice(0, 80)));
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => fails.push('scenario never became ready'));
    const info = await page.evaluate(() => window.GXSCN).catch(() => null);
    if (info && info.error) fails.push(info.error);
    const mut = process.env.SCN_MUT && JSON.parse(process.env.SCN_MUT);
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
    if (info && !info.error) {
      (await page.evaluate(inv => GXS.universal(inv), !process.env.SCN_NOINV).catch(() => [])).forEach(m => fails.push(m));
      if (!process.env.SCN_NOINV) for (let k = 0; k < 3; k++) {   // every glowing legal target must answer a real tap (the game state must change)
        const g = await page.evaluate(() => ({ t: GXS.glow(), fp: GXS.fp() })).catch(() => ({ t: [] }));
        if (!g.t.length) break;
        await tapAt(g.t[0].x, g.t[0].y); await sleep(500);
        if (g.fp === await page.evaluate(() => GXS.fp()).catch(() => g.fp)) { fails.push(`glowing target "${g.t[0].n}" did not respond to a tap`); break; }
      }
    }
    errs.forEach(e => fails.push('page error: ' + e));
    expect(fails, fails.slice(0, 3).join(' | ')).toEqual([]);
  });
});
