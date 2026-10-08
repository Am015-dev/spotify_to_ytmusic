// gfxprobe.js: seconds per step of a worker cycle, normal vs minimum graphics (see lowgfx.js, docs/TESTING_FAST.md).
// usage: GFX=normal|min node tools/gfxprobe.js <url of local_dbg.html> [outdir]      (or --gfx=min)
// steps: load-to-menu, STORY to drivable (Frankfurt), one 852x393 screenshot, open pause -> garage -> builder, garage fps,
//        10 builder taps (real down->up wall time seen by the page; the game ignores a tap held > 900 ms), 4-frame tap like tPlay's old tap().
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path'), G = require('./lowgfx');
const gfx = G.parse(process.argv, process.env), URL = process.argv.find((a, i) => i > 1 && /^http/.test(a)) || 'http://127.0.0.1:8801/local_dbg.html';
const OUT = process.argv.find((a, i) => i > 2 && !/^(http|--)/.test(a)) || 'probe_' + gfx; fs.mkdirSync(OUT, { recursive: true });
const R = { gfx }, now = () => Date.now(), T = {};
const lap = (k, t0) => { T[k] = +((now() - t0) / 1000).toFixed(1); console.log(k.padEnd(28), T[k] + ' s') };
(async () => {
  const b = await chromium.launch({ args: G.launchArgs(gfx) });
  const ctx = await b.newContext(G.contextOpts(gfx, { phone: true, width: 852, height: 393 })), p = await ctx.newPage(); p.setDefaultTimeout(600000);
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await ctx.addInitScript(G.initScript(gfx));
  const cdp = await ctx.newCDPSession(p);
  let t = now(); await p.goto(URL); await p.waitForFunction(() => window.__mho && __mho.state === 'menu', null, { polling: 250 }); lap('load_to_menu', t);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mho_slot', '1') }); await G.seed(p, gfx);
  t = now(); await p.reload(); await p.waitForFunction(() => window.__mho && __mho.state === 'menu', null, { polling: 250 }); lap('reload_to_menu', t);
  const heldTap = (x, y) => G.tap(p, x, y, { noClick: true });
  const rawTap = async (x, y, holdMs) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] }); if (holdMs) await p.waitForTimeout(holdMs); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) };
  const center = async sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 4 ? [r.left + r.width / 2, r.top + r.height / 2] : null }, sel);
  const tap = async sel => { const c = await center(sel); if (!c) return false; await rawTap(c[0], c[1]); await p.waitForTimeout(150); return true };
  t = now(); await tap('#hcStory'); await p.waitForTimeout(500); await tap('#slotList .go');
  const CONT = ['#storyGo', '#m1Cs', '#rcGo', '#ogRetryB', '.m1go', '#resBtn', '#tutSkip'];
  for (let i = 0; i < 600; i++) { if (await p.evaluate(() => __mho.state === 'roam' && !(__mho.LD && __mho.LD.on))) break; for (const s of CONT) if (await tap(s)) break; await p.waitForTimeout(500) }
  lap('story_to_drivable', t);
  for (let i = 0; i < 12; i++) { let any = false; for (const s of CONT) if (await tap(s)) { any = true; break } if (!any) break; await p.waitForTimeout(300) }
  const fps = async ms => p.evaluate(ms => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else r(+(n / ((performance.now() - t0) / 1000)).toFixed(2)) }; requestAnimationFrame(f) }), ms);
  R.fps_roam = await fps(4000); console.log('fps_roam'.padEnd(28), R.fps_roam);
  t = now(); await p.screenshot({ path: path.join(OUT, 'roam.jpg'), type: 'jpeg', quality: 60 }); lap('screenshot_852x393', t);
  // garage: pause -> garage -> OPEN GARAGE BUILDER
  const vis = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth > 4 && b.getBoundingClientRect().bottom > 0).map(b => b.textContent.trim().slice(0, 18)).slice(0, 14).join(' | '));
  // the builder refuses while an event runs ("FINISH THE EVENT FIRST"): abandon it from the pause menu first
  await tap('#tP'); await p.waitForTimeout(600); console.log('pause:', await vis());
  if (await tap('#roamPause [data-p=eva]')) { await p.waitForTimeout(800); console.log('after abandon:', await vis()); for (const s of ['#roamPause [data-p=resume]']) { if (await p.evaluate(() => !document.querySelector('#roamPause').hidden)) await tap(s) } await p.waitForTimeout(500) }
  t = now(); if (await p.evaluate(() => document.querySelector('#roamPause').hidden)) { await tap('#tP'); await p.waitForTimeout(600) } const g1 = await tap('#roamPause [data-p=garage]'); await p.waitForTimeout(1500); console.log('garage:', await vis());
  const opened = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /OPEN GARAGE BUILDER/.test(b.textContent) && b.offsetWidth); if (b) { b.setAttribute('data-qa', 'gbo'); return true } return false });
  if (opened) await tap('[data-qa=gbo]'); await p.waitForFunction(() => { const c = document.querySelector('#gbC'); return c && c.offsetWidth > 100 }, null, { timeout: 120000 }).catch(() => {}); await p.waitForTimeout(1500); lap('open_builder', t);
  const gbOk = await p.evaluate(() => { const c = document.querySelector('#gbC'); return !!c && c.offsetWidth > 100 }); R.builderOpen = gbOk; console.log('builder open', gbOk, 'garage btn', g1);
  if (gbOk) {
    await p.screenshot({ path: path.join(OUT, 'builder.jpg'), type: 'jpeg', quality: 60 });
    R.fps_builder = await fps(4000); console.log('fps_builder'.padEnd(28), R.fps_builder);
    await p.evaluate(() => { const c = document.querySelector('#gbC'); window.__tp = []; let d = 0; c.addEventListener('pointerdown', () => { d = performance.now() }, true); c.addEventListener('pointerup', () => { __tp.push(+(performance.now() - d).toFixed(0)) }, true) });
    const r = await p.evaluate(() => { const r = document.querySelector('#gbC').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] });
    const pts = Array.from({ length: 10 }, (_, i) => [r[0] + r[2] * (.3 + .04 * i), r[1] + r[3] * (.45 + .02 * (i % 5))]);
    t = now(); for (const q of pts) { await rawTap(q[0], q[1]); await p.waitForTimeout(100) } lap('10_taps_plain_cdp', t);
    R.tap_ms_b2b = await p.evaluate(() => __tp.splice(0)); console.log('page-seen down->up ms', JSON.stringify(R.tap_ms_b2b), 'under 900 ms:', R.tap_ms_b2b.filter(x => x < 900).length + '/10');
    R.tap_ms_plain = R.tap_ms_b2b;
    t = now(); const hit = []; for (const q of pts) { hit.push(await heldTap(q[0], q[1])); await p.waitForTimeout(100) } console.log('sync tap target:', hit.slice(0, 3).join(','), 'canvas rect', JSON.stringify(r), 'first pt', pts[0].map(Math.round)); lap('10_taps_sync', t);
    R.tap_ms_sync = await p.evaluate(() => __tp.splice(0)); console.log('SYNC page-seen down->up ms', JSON.stringify(R.tap_ms_sync), 'under 900 ms:', R.tap_ms_sync.filter(x => x < 900).length + '/10');
    if (process.env.SKIP4F) { R.T = T; fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(R, null, 1)); console.log('DONE', JSON.stringify(R)); await b.close(); return }
    // old tPlay tap: down, wait 4 rendered frames, up
    const frames4 = () => p.evaluate(() => new Promise(r => { let n = 0; const f = () => { if (++n >= 4) r(); else requestAnimationFrame(f) }; requestAnimationFrame(f) }));
    t = now(); for (const q of pts) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: q[0], y: q[1], id: 0 }] }); await frames4(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(100) } lap('10_taps_hold_4_frames', t);
    R.tap_ms_4f = await p.evaluate(() => __tp.splice(0)); console.log('page-seen down->up ms', JSON.stringify(R.tap_ms_4f), 'under 900 ms:', R.tap_ms_4f.filter(x => x < 900).length + '/10');
  }
  R.T = T; R.errs = errs.slice(0, 5); fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(R, null, 1)); console.log('DONE', JSON.stringify(R)); await b.close();
})().catch(e => { console.log('PROBE ERROR', e.message.slice(0, 300)); process.exit(1) });
