// Phone layout + touch-only play check. node lay-phone.js [WxH,...] [--turns=N] [--dom]   prints "FAIL <size> <check>" lines, then PROBLEMS n
// Default sizes: 390x844 390x763 390x664 375x553 412x780 844x390 750x342 (isMobile + hasTouch; ?phone=1 is NOT forced: phone mode must switch on by itself).
// Checks: no page scroll, phone class, tap targets >= 44 px, visible text >= 13 px, no text clipped, slots / dice / windows inside the board and not overlapping,
// the dock holds the prompt, touch-only play (tap a die, tap a glowing space), drawers, guided tip card, hot-seat pass card, final card fits.
require('../../phfit.js').guard(2);   // one child process per size, results added up
const FIT = require('../../phfit.js');
const PW = (() => { try { return require('playwright'); } catch (e) { return require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); } })();
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.join(HERE, 'shots', 'ph'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'final-approach.html'));
const SIZES = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '390x844,390x763,390x664,375x553,412x780,844x390,750x342').split(',').map(s => s.split('x').map(Number));
const TURNS = +((process.argv.find(a => a.startsWith('--turns=')) || '').slice(8)) || 8; const DOM = process.argv.includes('--dom');
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); }; const log = (...a) => console.log(t, ...a);
    const shot = async n => { await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const targets = async tag => {
      const r = await p.evaluate(() => {
        const o = []; const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; return r; };
        for (const e of document.querySelectorAll('.gx-bar button,#dock button,.slot,.die,.sp,#pass button,#rs button,#start button,#start summary,#netbox button,.gx-drawer.on button,#cfg button')) {
          if (e.disabled || e.closest('[hidden]')) continue; if (e.closest('.gx-drawer') && !e.closest('.gx-drawer.on')) continue; const r = vis(e); if (!r) continue;
          if (r.width < 43.9 || r.height < 43.9) o.push((e.dataset.a || e.dataset.gx || e.className) + ' ' + Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10);
        }
        const txt = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,#start[hidden],[hidden],.sr,#toast,.gx-drawer:not(.on),.dv')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue; if (parseFloat(cs.fontSize) < 12.95) txt.push(Math.round(parseFloat(cs.fontSize) * 10) / 10 + 'px "' + s.slice(0, 18) + '" ' + (e.className || e.tagName)); }
        return { small: o.slice(0, 6), txt: txt.slice(0, 6) };
      });
      if (r.small.length) fail('tap target <44 ' + tag, JSON.stringify(r.small)); if (r.txt.length) fail('text <13px ' + tag, JSON.stringify(r.txt));
    };
    const clipped = async tag => {
      const r = await p.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,[hidden],.sr,#toast,.gx-drawer:not(.on),#start[hidden],.dv')) continue; const cs0 = getComputedStyle(e); if (cs0.visibility === 'hidden' || cs0.display === 'none' || +cs0.opacity === 0) continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const tr = rg.getBoundingClientRect(); if (!tr.width || !tr.height) continue;
          if (tr.left < -1 || tr.top < -1 || tr.right > innerWidth + 1 || tr.bottom > innerHeight + 1) { let sc = false; for (let a = e; a; a = a.parentElement) { const c = getComputedStyle(a); if (/auto|scroll/.test(c.overflowY + c.overflowX) && a !== document.documentElement) sc = true; } if (!sc) out.push('outside viewport: ' + s.slice(0, 20)); }
          for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && a.scrollHeight > a.clientHeight + 1) { out.push('line-clamped: ' + s.slice(0, 24)); break; } if (/auto|scroll/.test(cs.overflowY)) break; if (cs.position === 'fixed') break; const hid = v => v === 'hidden' || v === 'clip'; if (hid(cs.overflowX) || hid(cs.overflowY)) { const ar = a.getBoundingClientRect(); if (a.id === 'bd') continue; if ((hid(cs.overflowY) && (tr.top < ar.top - 1.5 || tr.bottom > ar.bottom + 1.5)) || (hid(cs.overflowX) && (tr.left < ar.left - 1.5 || tr.right > ar.right + 1.5))) { out.push('clipped ' + (a.id || a.tagName + '.' + a.className.toString().slice(0, 18)) + ': ' + s.slice(0, 20)); break; } } } }
        return out.slice(0, 5); });
      if (r.length) fail('clipped text ' + tag, JSON.stringify(r));
    };
    const fit = async n => { (await FIT.run(p)).concat(await FIT.extra(p)).forEach(m => fail('FIT ' + n, m)); };
    const panel = async tag => {
      const r = await p.evaluate(() => { const B = document.querySelector('#bd').getBoundingClientRect(); const bad = []; const items = [...document.querySelectorAll('#pz .slot,#pz .die:not(.used),#pz .w,#pz .dial,#pz .gau,#pz .tray')].map(e => { const r = e.getBoundingClientRect(); return { n: (e.dataset.slot || (e.dataset.d && 'die' + e.dataset.s + e.dataset.d) || e.className.toString().split(' ')[0]), slot: e.classList.contains('slot'), die: e.classList.contains('die'), r: [r.left, r.top, r.right, r.bottom] }; });
        for (const i of items) { if (i.r[2] <= i.r[0]) continue; if (i.r[0] < B.left - 1 || i.r[2] > B.right + 1 || i.r[1] < B.top - 1 || i.r[3] > B.bottom + 1) bad.push('outside board ' + i.n); }
        const ov2 = (L) => { for (let a = 0; a < L.length; a++) for (let c = a + 1; c < L.length; c++) { const A = L[a].r, C = L[c].r; if (A[0] < C[2] - 1 && A[2] > C[0] + 1 && A[1] < C[3] - 1 && A[3] > C[1] + 1) bad.push('overlap ' + L[a].n + '/' + L[c].n); } };
        ov2(items.filter(i => i.slot)); ov2(items.filter(i => i.die));
        return bad.slice(0, 6); });
      if (r.length) fail('panel ' + tag, JSON.stringify(r));
    };
    const gx = async () => p.evaluate(() => (typeof PX !== 'undefined' && PX.on) ? PX.kind : 'dom');
    await p.goto('https://gns.test/' + (DOM ? '?px=0' : '')); await p.waitForTimeout(1500); await scroll('title'); await shot('0title'); await targets('title');
    const phc = await p.evaluate(() => document.documentElement.className); if (!/\bph\b/.test(phc)) fail('phone class missing', phc);
    { const bt = await p.evaluate(() => [...document.querySelectorAll('#start button')].filter(e => e.offsetParent).map(b => b.dataset.a).join()); if (!/play/.test(bt) || !/online/.test(bt)) fail('title buttons', bt); }
    await p.tap('[data-a=play]'); await p.waitForTimeout(350); await scroll('setup'); await shot('0setup'); await targets('setup'); await clipped('setup');
    await p.tap('[data-a=cfgopen]'); await p.waitForTimeout(300); await shot('0config'); await targets('configure'); await clipped('configure');
    { const st = await p.evaluate(() => ({ open: !document.querySelector('#cfg').hidden })); if (!st.open) fail('Configure sheet did not open'); }
    await p.tap('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200);
    // ---- guided first flight: tip card, then touch-only play
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; });
    await p.tap('[data-start=guided]'); await p.waitForTimeout(1500); await scroll('guided'); await shot('1guided');
    { const tip = await p.evaluate(() => !document.querySelector('#pc').hidden); if (!tip) fail('guided flight shows no tip card'); else { const pr = await rect('#pc'); if (pr[3] > H + 1 || pr[0] < -1 || pr[2] > W + 1) fail('tip card outside the screen', JSON.stringify(pr)); if (W < H && pr[3] - pr[1] > .6 * H) fail('tip sheet taller than 60% of the screen', JSON.stringify(pr)); } }
    await panel('guided brief'); await targets('guided brief'); await clipped('guided brief'); await fit('guided brief');
    const m = await p.evaluate(() => { const b = document.querySelector('#bd').getBoundingClientRect(); return { w: b.width, h: b.height, vw: innerWidth, vh: innerHeight, mode: UI.LY && UI.LY.mode, k: UI.LY && +UI.LY.k.toFixed(3) }; }); log('board', JSON.stringify(m), await gx());
    { const short = Math.min(m.vw, m.vh), port = m.vw < m.vh, side = port ? m.w : m.h, sh = FIT.share(m.vw, m.vh); if (side < sh * short) fail('board share', side + ' < ' + sh * short); if (port && m.h < .75 * m.w) fail('board height < 0.75 width', JSON.stringify(m)); if (!port && m.w < .85 * m.vh) fail('board width in landscape', JSON.stringify(m)); }
    { const o = await p.$('#pc:not([hidden]) [data-a=tipoff]'); if (o) { await o.tap(); await p.waitForTimeout(300); } else fail('no No-more-tips button reachable in the tip card'); }
    await p.evaluate(() => { const b = document.querySelector('#acts [data-a=ready]'); if (b) b.click(); }); await p.waitForTimeout(2600); await scroll('rolled'); await shot('2rolled'); await panel('rolled'); await targets('rolled'); await clipped('rolled'); await fit('rolled');
    let placed = 0;
    for (let k = 0; k < TURNS * 6 && placed < TURNS; k++) {
      const st = await p.evaluate(() => ({ over: !!G.result, pend: FA.pending(G).filter(s => !G.ai[s]) })); if (st.over) break;
      if (!st.pend.includes(0)) { await p.waitForTimeout(200); continue; }
      const d = await p.$('#pz .die:not([disabled]):not(.used)'); if (!d) { const rd = await p.$('#acts [data-a=ready]'); if (rd) { await rd.tap(); await p.waitForTimeout(1800); } else await p.waitForTimeout(250); continue; }
      await d.tap(); await p.waitForTimeout(200);
      const sl = await p.$('#pz .slot.legal'); if (!sl) { fail('no glowing space after tapping a die'); break; }
      if (placed === 1) { await shot('3picked'); await panel('picked'); await targets('picked'); }
      await sl.tap(); await p.waitForTimeout(700); placed++;
      if (placed === 3) { await scroll('midgame'); await shot('4mid'); await panel('mid'); await targets('mid'); await clipped('mid'); await fit('mid'); }
    }
    log('placements by touch', placed); if (placed < Math.min(TURNS, 3)) fail('too few placements by touch', placed);
    { const over = await p.evaluate(() => !!G.result); if (over) { await shot('5over'); for (let k = 0; k < 20 && !(await p.$('#rs:not([hidden]) [data-a=rsclose]')); k++) await p.waitForTimeout(400); } const cl = await p.$('#rs:not([hidden]) [data-a=rsclose]'); if (cl) { await cl.tap(); await p.waitForTimeout(400); } }
    for (const id of ['logd', 'rulesd', 'setd', 'crewd']) { await p.tap(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) fail('drawer did not open', id); if (id === 'setd') { await shot('5menu'); await targets('menu'); await fit('menu'); } await p.tap('.gx-drawer.on .gx-x'); await p.waitForTimeout(250); }
    // ---- finish with computers on both seats, then look at the end screen
    if (await p.evaluate(() => !!G.result)) { await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=play]'); await p.waitForTimeout(250); await p.tap('[data-start=vs]'); await p.waitForTimeout(800); }
    await p.evaluate(() => { const k = document.querySelector('#pc [data-a=tipoff]'); if (k) k.click(); G.ai = [true, true]; AIDELAY = 0; schedule(); });
    for (let k = 0; k < 200; k++) { const o = await p.evaluate(() => !!(G && G.result && UI.overShown && !document.querySelector('#rs').hidden)); if (o) break; await p.waitForTimeout(400); }
    await p.waitForTimeout(500); await shot('6final'); await scroll('final'); await targets('final'); await clipped('final'); await fit('final');
    { const rr = await rect('.rsbox'); if (!rr) fail('no final card'); else if (rr[0] < -1 || rr[2] > W + 1 || rr[3] > H + 1) fail('final card does not fit', JSON.stringify(rr)); }
    await p.tap('#rs [data-a=rsclose]'); await p.waitForTimeout(250);
    // ---- story card of a normal flight
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=play]'); await p.waitForTimeout(150); await p.tap('[data-start=vs]'); await p.waitForTimeout(900);
    { const st = await p.evaluate(() => !!document.querySelector('#rs.story .stbox')); if (!st) fail('no story card at the start of a flight'); else { await shot('8story'); await scroll('story'); await targets('story'); await clipped('story'); await fit('story'); const rr = await rect('.stbox'); if (rr[0] < -1 || rr[2] > W + 1 || rr[3] > H + 1) fail('story card does not fit', JSON.stringify(rr)); await p.tap('#rs [data-a=rsclose]'); await p.waitForTimeout(300); } }
    // ---- hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=play]'); await p.waitForTimeout(150);
    await p.tap('[data-start=hot]'); await p.waitForTimeout(900); { const cl = await p.$('#rs.story [data-a=rsclose]'); if (cl) { await cl.tap(); await p.waitForTimeout(300); } }
    // the briefing needs nobody's dice: both crew get ready on the shared screen (no pass card), then the device is handed to the first player
    { const pre = await p.evaluate(() => !document.querySelector('#pass').hidden); if (pre) fail('pass card shown during the briefing (no hidden dice yet)'); }
    for (let k = 0; k < 2; k++) { const rd = await p.$('#acts [data-a=ready]'); if (rd) { await rd.tap(); await p.waitForTimeout(500); } }
    { const pass = await p.evaluate(() => ({ card: !document.querySelector('#pass').hidden, dice: [...document.querySelectorAll('#pz .die .dv')].filter(e => /^[1-6]$/.test(e.textContent)).length })); if (!pass.card) fail('no pass-the-device card in hot-seat'); if (pass.dice) fail('dice values visible before the pass card is taken'); await shot('7pass'); await targets('pass'); await clipped('pass'); await fit('pass'); }
    log('errors', JSON.stringify(errs.slice(0, 3))); bad += errs.length; if (errs.length) console.log('FAIL', t, 'console errors', errs.length);
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close(); process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
