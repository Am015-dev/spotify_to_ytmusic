// Desktop/tablet layout check. node lay.js [WxH,...]  (default 1366x768, 1920x1080, 768x1024, 1100x700)
// Prints "FAIL <size> <check>" lines and "PROBLEMS n". Checks: no page scroll, the panel fits the board (slots, dice, windows, dial, gauge inside and not overlapping),
// every action button reachable, readable text (>= 12 px), the painted canvas is not blank, drawers open, final card fits.
const PW = (() => { try { return require('playwright'); } catch (e) { return require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); } })();
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots', 'desk'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'final-approach.html'));
const SIZES = (process.argv[2] || '1366x768,1920x1080,768x1024,1100x700').split(',').map(s => s.split('x').map(Number));
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async n => { await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const panel = async tag => {
      const r = await p.evaluate(() => { const B = document.querySelector('#bd').getBoundingClientRect(); const bad = []; const items = [...document.querySelectorAll('#pz .slot,#pz .die:not(.used),#pz .w,#pz .dial,#pz .gau,#pz .tray,#pz .hudc')].map(e => { const r = e.getBoundingClientRect(); return { n: (e.dataset.slot || (e.dataset.d && 'die' + e.dataset.s + e.dataset.d) || e.className.toString().split(' ')[0]), slot: e.classList.contains('slot'), die: e.classList.contains('die'), box: e.classList.contains('w') || e.classList.contains('dial') || e.classList.contains('gau') || e.classList.contains('hudc') || e.classList.contains('tray'), r: [r.left, r.top, r.right, r.bottom] }; });
        for (const i of items) { if (i.r[2] <= i.r[0]) continue; if (i.r[0] < B.left - 1 || i.r[2] > B.right + 1 || i.r[1] < B.top - 1 || i.r[3] > B.bottom + 1) bad.push('outside board ' + i.n); }
        const ov2 = (L, M) => { for (const a of L) for (const c of M) { if (a === c) continue; const A = a.r, C = c.r; if (A[0] < C[2] - 1 && A[2] > C[0] + 1 && A[1] < C[3] - 1 && A[3] > C[1] + 1 && (L !== M || a.n < c.n)) bad.push('overlap ' + a.n + '/' + c.n); } };
        const S = items.filter(i => i.slot), D = items.filter(i => i.die), X = items.filter(i => i.box && i.n !== 'tray');
        ov2(S, S); ov2(D, D); ov2(S, X); ov2(X, X);
        return bad.slice(0, 8); });
      if (r.length) fail('panel ' + tag, JSON.stringify(r));
    };
    const reach = async tag => {
      const r = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#acts button,.gx-bar button,#roster .chip,#pz .slot,#pz .die:not([disabled])')) { const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { bad.push('offscreen ' + (e.dataset.a || e.className)); continue; } const t = document.elementFromPoint(x, y); if (!t || !(e === t || e.contains(t) || t.contains(e))) bad.push('covered ' + (e.dataset.a || e.dataset.slot || e.className) + ' by ' + (t && (t.id || t.className))); } return bad.slice(0, 6); });
      if (r.length) fail('reach ' + tag, JSON.stringify(r));
    };
    const text = async tag => { const r = await p.evaluate(() => { const o = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,[hidden],.sr,#toast,.gx-drawer:not(.on),.dv')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue; if (parseFloat(cs.fontSize) < 11.95) o.push(cs.fontSize + ' ' + s.slice(0, 18)); } return o.slice(0, 5); }); if (r.length) fail('text <12px ' + tag, JSON.stringify(r)); };
    await p.goto('https://gns.test/'); await p.waitForTimeout(1500); await scroll('title'); await shot('0title');
    await p.click('[data-a=play]'); await p.waitForTimeout(350); await scroll('setup'); await shot('1setup');
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; });
    await p.click('[data-start=guided]'); await p.waitForTimeout(1500); await scroll('guided'); await shot('2guided'); await panel('guided brief'); await text('guided');
    { const o = await p.$('#pc:not([hidden]) [data-a=tipoff],[data-a=tipoff]'); if (o) { await o.click(); await p.waitForTimeout(300); } }
    await p.evaluate(() => { const b = document.querySelector('#acts [data-a=ready]'); if (b) b.click(); }); await p.waitForTimeout(2600); await scroll('rolled'); await shot('3rolled'); await panel('rolled'); await reach('rolled');
    { const d = await p.$('#pz .die:not([disabled]):not(.used)'); if (!d) fail('no clickable die of your own'); else { await d.click(); await p.waitForTimeout(250); const n = await p.evaluate(() => document.querySelectorAll('#pz .slot.legal').length); if (!n) fail('no glowing slot after picking a die'); await shot('4picked'); await panel('picked'); await reach('picked'); const s = await p.$('#pz .slot.legal'); if (s) { await s.click(); await p.waitForTimeout(900); } } }
    { const over = await p.evaluate(() => !!G.result); if (over) { for (let k = 0; k < 20 && !(await p.$('#rs:not([hidden]) [data-a=rsclose]')); k++) await p.waitForTimeout(400); } const cl = await p.$('#rs:not([hidden]) [data-a=rsclose]'); if (cl) { await cl.click(); await p.waitForTimeout(400); } }
    for (const id of ['logd', 'rulesd', 'setd', 'crewd']) { await p.click(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(400); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) fail('drawer did not open', id); if (id === 'setd') await shot('5menu'); await p.click('.gx-drawer.on .gx-x'); await p.waitForTimeout(200); }
    if (await p.evaluate(() => !!G.result)) { await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.click('[data-a=play]'); await p.waitForTimeout(250); await p.click('[data-start=vs]'); await p.waitForTimeout(800); }
    await p.evaluate(() => { const k = document.querySelector('#pc [data-a=tipoff]'); if (k) k.click(); G.ai = [true, true]; AIDELAY = 0; schedule(); });
    for (let k = 0; k < 150; k++) { const o = await p.evaluate(() => !!(G && G.result && UI.overShown && !document.querySelector('#rs').hidden)); if (o) break; await p.waitForTimeout(400); }
    await p.waitForTimeout(500); await shot('6final'); await scroll('final'); { const rr = await rect('.rsbox'); if (!rr) fail('no final card'); else if (rr[0] < -1 || rr[2] > W + 1 || rr[3] > H + 1) fail('final card does not fit', JSON.stringify(rr)); }
    { const st = await p.evaluate(() => (typeof PX !== 'undefined' && PX.on) ? { kind: PX.kind, ok: pxPainted() } : { kind: 'dom' }); console.log(t, 'renderer', JSON.stringify(st)); if (st.kind !== 'dom' && !(st.ok > 0.5)) fail('painted canvas looks blank', JSON.stringify(st)); }
    console.log(t, 'errors', JSON.stringify(errs.slice(0, 3))); bad += errs.length; await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close(); process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error('FATAL', e); process.exitCode = 1; });
