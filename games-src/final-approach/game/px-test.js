// Painted panel (PixiJS) check.   node px-test.js
// WebGL renderer on; canvas renderer (?px=canvas); plain DOM (?px=0); Graphics levels; dice fly from the tray into a slot and land; hidden dice show their back;
// the ending animation runs and the final card follows; a lost WebGL context drops back to the DOM view and the game stays playable.
const PW = (() => { try { return require('playwright'); } catch (e) { return require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); } })();
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'final-approach.html'));
let bad = 0; const fail = (c, d) => { bad++; console.log('FAIL', c, d || ''); }; const ok = (c, d) => console.log('ok  ', c, d || '');
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  async function open(query, vw, vh) {
    const ctx = await b.newContext({ viewport: { width: vw || 1366, height: vh || 768 } }); await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(40000); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) p.errs.push(m.text()); });
    await p.goto('https://gns.test/' + (query || '')); await p.waitForTimeout(1800); return p;
  }
  const start = async p => { await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; }); await p.click('[data-a=play]'); await p.waitForTimeout(250); await p.click('[data-start=vs]'); await p.waitForTimeout(900); const sc = await p.$('#rs.story [data-a=rsclose]'); if (sc) await sc.click(); await p.waitForTimeout(300); const t = await p.$('#pc [data-a=tipoff]'); if (t) await t.click(); };
  const roll = async p => { await p.evaluate(() => { const b = document.querySelector('#acts [data-a=ready]'); if (b) b.click(); }); };
  // ---- 1. WebGL
  { const p = await open(''); const st0 = await p.evaluate(() => PX.state()); if (!st0.on) fail('Pixi not on', JSON.stringify({ err: st0.err })); else ok('webgl renderer', st0.kind + ' res ' + st0.res + ' q ' + st0.q);
    await start(p); await roll(p); await p.waitForTimeout(300);
    const fly = await p.evaluate(() => PX.state()); if (fly.dice.length !== 8) fail('expected 8 dice sprites after the roll', JSON.stringify(fly.dice.length)); else ok('8 dice sprites after the roll');
    if (!fly.tweens) fail('no dice flight after the roll'); else ok('dice are flying in', fly.tweens + ' tweens');
    for (let i = 0; i < 40; i++) { const m = await p.evaluate(() => PX.state().moving); if (!m) break; await p.waitForTimeout(250); }
    { const s = await p.evaluate(() => { const S = PX.state(); const dom = [...document.querySelectorAll('#pz .die:not(.used)')].map(e => { const r = e.getBoundingClientRect(), B = document.querySelector('#bd').getBoundingClientRect(); return { s: +e.dataset.s, d: e.dataset.d, x: Math.round(r.left - B.left + r.width / 2), y: Math.round(r.top - B.top + r.height / 2) }; }); return { S, dom }; });
      let off = 0; for (const d of s.dom) { const sp = s.S.dice.find(x => x.key === 'die:' + d.s + ':' + d.d); if (!sp || Math.abs(sp.x - d.x) > 3 || Math.abs(sp.y - d.y) > 3) off++; } if (off) fail('dice sprites not on their DOM buttons', off + ' off'); else ok('dice settle exactly on their buttons');
      const hid = s.S.dice.filter(x => /^die:1:/.test(x.key) && x.val !== '?'); if (hid.length) fail('co-pilot dice show values on the painted layer', JSON.stringify(hid)); else ok('co-pilot dice show their back (?)'); }
    // pick a die, place it, watch it fly and land
    const n0 = (await p.evaluate(() => PX.state())).nLand; await p.click('#pz .die:not([disabled]):not(.used)'); await p.waitForTimeout(200); await p.click('#pz .slot.legal'); await p.waitForTimeout(150);
    const mid = await p.evaluate(() => PX.state()); if (!mid.tweens) fail('no flight from the tray to the slot'); else ok('die flies tray -> slot', mid.tweens + ' tweens');
    for (let i = 0; i < 40; i++) { const m = await p.evaluate(() => PX.state()); if (m.nLand > n0 && !m.moving) break; await p.waitForTimeout(250); }
    const aft = await p.evaluate(() => PX.state()); if (aft.nLand <= n0) fail('die did not land'); else ok('die landed (squash + dust)', 'nLand ' + aft.nLand); if (!aft.objs.some(o => /^slot:/.test(o.key))) fail('no die sprite in the slot'); else ok('die sprite sits in the slot');
    const pc = await p.evaluate(() => pxPainted()); if (!(pc > .5)) fail('canvas mostly empty', pc); else ok('canvas painted', pc);
    // Graphics levels
    for (const q of ['low', 'medium', 'high']) { await p.evaluate(v => setGfx(v), q); await p.waitForTimeout(250); const st = await p.evaluate(() => PX.state()); if (st.q !== q) fail('level not applied ' + q, st.q); const pr = await p.evaluate(() => pxPainted()); if (!(pr > .5)) fail('blank after switching to ' + q); else ok('level ' + q, 'res ' + st.res + ' painted ' + pr); }
    { const reg = await p.evaluate(() => !!(window.PerfHUD && PerfHUD.register)); ok('PerfHUD present', String(reg)); }
    // ending animation
    await p.evaluate(() => { G.ai = [true, true]; AIDELAY = 0; schedule(); });
    let sawEnd = false; for (let i = 0; i < 300; i++) { const st = await p.evaluate(() => ({ e: PX.state().ending, f: !!(G.result && UI.overShown && !document.querySelector('#rs').hidden) })); if (st.e) sawEnd = true; if (st.f) break; await p.waitForTimeout(200); }
    if (!sawEnd) fail('ending animation never ran'); else ok('ending animation ran'); const fin = await p.evaluate(() => !!(G.result && !document.querySelector('#rs').hidden)); if (!fin) fail('final card did not follow the ending'); else ok('final card follows the ending');
    // new flight after the ending clears the overlay
    await p.click('#rs [data-a=again]'); await p.waitForTimeout(900); const ce = await p.evaluate(() => ({ cls: document.querySelector('#bd').classList.contains('ending'), e: PX.state().ending })); if (ce.cls || ce.e) fail('ending overlay still on after Again', JSON.stringify(ce)); else ok('Again clears the ending overlay');
    // context loss -> DOM view, still playable
    await p.evaluate(() => { PX.cv.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); }); await p.waitForTimeout(500); const off = await p.evaluate(() => ({ on: PX.on, cls: document.documentElement.classList.contains('fapx'), die: document.querySelectorAll('#pz .die').length })); if (off.on || off.cls) fail('context loss did not drop to the DOM view', JSON.stringify(off)); else ok('context loss -> DOM view', JSON.stringify(off));
    if (p.errs.length) fail('console errors', JSON.stringify(p.errs.slice(0, 3))); await p.context().close(); }
  // ---- 2. canvas renderer
  { const p = await open('?px=canvas'); const st = await p.evaluate(() => PX.state()); if (!st.on) fail('canvas renderer not on', st.err); else { ok('canvas renderer', st.kind); await start(p); await roll(p); await p.waitForTimeout(2500); const pr = await p.evaluate(() => pxPainted()); if (!(pr > .5)) fail('canvas renderer blank', pr); else ok('canvas renderer paints', pr); } if (p.errs.length) fail('console errors (canvas)', JSON.stringify(p.errs.slice(0, 3))); await p.context().close(); }
  // ---- 3. DOM only
  { const p = await open('?px=0'); const st = await p.evaluate(() => PX.state()); if (st.on) fail('?px=0 still has Pixi'); else ok('?px=0 -> plain DOM'); await start(p); await roll(p); await p.waitForTimeout(500); const d = await p.evaluate(() => ({ dice: document.querySelectorAll('#pz .die .dv').length, cls: document.documentElement.classList.contains('fapx') })); if (d.cls || d.dice < 8) fail('DOM view incomplete', JSON.stringify(d)); else ok('DOM view shows the dice', JSON.stringify(d));
    await p.click('#pz .die:not([disabled]):not(.used)'); await p.waitForTimeout(150); await p.click('#pz .slot.legal'); await p.waitForTimeout(300); const pl = await p.evaluate(() => document.querySelectorAll('#pz .slot.full').length); if (pl < 1) fail('cannot place a die in the DOM view'); else ok('placing works in the DOM view');
    if (p.errs.length) fail('console errors (dom)', JSON.stringify(p.errs.slice(0, 3))); await p.context().close(); }
  // ---- 4. phone portrait + landscape with Pixi
  for (const [vw, vh] of [[390, 763], [844, 390]]) { const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: true, hasTouch: true }); await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort()); const p = await ctx.newPage(); p.setDefaultTimeout(40000); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.goto('https://gns.test/'); await p.waitForTimeout(1800); await start(p); await roll(p); await p.waitForTimeout(3000); const st = await p.evaluate(() => ({ s: PX.state(), q: PX.q })); const pr = await p.evaluate(() => pxPainted()); if (!st.s.on || !(pr > .4)) fail('phone ' + vw + 'x' + vh + ' panel not painted', JSON.stringify({ on: st.s.on, pr })); else ok('phone ' + vw + 'x' + vh + ' painted', 'q ' + st.q + ' res ' + st.s.res + ' ' + pr); if (p.errs.length) fail('console errors (phone)', JSON.stringify(p.errs.slice(0, 3))); await ctx.close(); }
  console.log(bad ? 'PX TEST FAILED (' + bad + ')' : 'PX TEST PASSED'); await b.close(); process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
