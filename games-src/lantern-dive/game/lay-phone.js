require('../../phfit.js').guard(2);
// Phone layout + touch-only play check. node lay-phone.js [WxH,...]   prints "FAIL <size> <check>" lines, then PROBLEMS n
// Default sizes cover portrait and landscape phones (isMobile + hasTouch; ?phone=1 is NOT forced: the phone mode switches on by itself).
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.join(HERE, 'shots', 'ph'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'lantern-dive.html'));
const LIB = require('./laylib.js');
const arg = process.argv[2] || process.env.SIZES || '390x844,390x763,390x664,375x553,412x780,844x390,750x342';
const SIZES = arg.split(',').filter(Boolean).map(s => s.split('x').map(Number));
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const FIT = require('../../phfit.js');
    const prob = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); }; const log = (...a) => console.log(t, ...a);
    const shot = async n => { (await FIT.run(p)).forEach(m => prob('FIT ' + n, m)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) prob('scroll ' + tag, JSON.stringify(r)); };
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden || e.closest('[hidden]')) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const insideVP = A => A && A[0] >= -1 && A[1] >= -1 && A[2] <= W + 1 && A[3] <= H + 1;
    let feltTop0 = null;
    const targets = async tag => {
      const r = await p.evaluate(() => {
        const o = []; const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; return r; };
        for (const e of document.querySelectorAll('.gx-bar button,#dock button,#hand .hc,#opp .op,.jc:not(.opp),#pool .jcard,#ppop button,#pc button,#pass button,#rs button,.gx-drawer.on button,#start button,#netbox button')) {
          if (e.closest('[hidden]')) continue; if (e.closest('.gx-drawer') && !e.closest('.gx-drawer.on')) continue; const r = vis(e); if (!r) continue;
          if (e.matches('#hand .hc') && e.classList.contains('dim')) continue;
          if (r.width < 43.9 || r.height < 43.9) o.push((e.dataset.a || e.dataset.gx || e.className) + ' ' + Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10);
        }
        const txt = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,#start[hidden],[hidden],.sr,#toast,.gx-drawer:not(.on),.hc,.dc,.tc')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue; if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue; if (parseFloat(cs.fontSize) < 12.95) txt.push(s.slice(0, 18) + ':' + cs.fontSize); }
        return { small: o.slice(0, 6), txt: txt.slice(0, 6) };
      });
      if (r.small.length) prob('tap target <44 ' + tag, JSON.stringify(r.small)); if (r.txt.length) prob('text <13px ' + tag, JSON.stringify(r.txt));
    };
    const boardCheck = async tag => {
      if (await p.evaluate(() => !document.querySelector('#rs').hidden || !document.querySelector('#pass').hidden)) return;
      const r = await p.evaluate(() => { const B = document.querySelector('#bd').getBoundingClientRect(); const bad = [];
        for (const e of document.querySelectorAll('#hand .hc:not(.dim),#opp .op,#acts button')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; const inHand = !!e.closest('#hand'); const x = r.left + r.width / 2; let y = r.top + r.height / 2; if (inHand) { y = r.top + Math.min(r.height / 2, 24); }  if (inHand) { const hr = document.querySelector('#hand').getBoundingClientRect(); if (x < hr.left + 1 || x > hr.right - 1) continue; } if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { bad.push('offscreen ' + (e.dataset.a || e.className)); continue; } const hit = document.elementFromPoint(x, y); if (!hit || !e.contains(hit)) bad.push('covered ' + (e.dataset.a || e.className) + ' by ' + (hit && (hit.id || (hit.className && hit.className.baseVal) || hit.className))); }
        return bad.slice(0, 5); });
      if (r.length) prob('board ' + tag, JSON.stringify(r));
      const ft = await p.evaluate(() => { if (UI.tip || UI.pop || !document.querySelector('#felt')) return null; const f = document.querySelector('#felt').getBoundingClientRect(); const pr = [...document.querySelectorAll('#pile button,#pile span,#lead span')].map(e => e.getBoundingClientRect()); const bad = []; for (const c of document.querySelectorAll('#slots .tc')) { const r = c.getBoundingClientRect(); for (const q of pr) if (q.width && q.left < r.right - 1 && q.right > r.left + 1 && q.top < r.bottom - 1 && q.bottom > r.top + 1) bad.push('Last trick / Won / lead text over a played card'); } return { top: Math.round(f.top), bad: bad.slice(0, 2) }; });
      if (ft) { if (ft.bad.length) prob('felt strip ' + tag, JSON.stringify(ft.bad)); }
      if (ft) { if (feltTop0 == null) feltTop0 = ft.top; else if (Math.abs(ft.top - feltTop0) > 3) prob('layout jump: felt top moved ' + feltTop0 + ' -> ' + ft.top + ' ' + tag); }
      const gap = await p.evaluate(() => { const hd = document.querySelector('#hand'); return hd && hd.dataset.pitch ? +hd.dataset.pitch : 999; });
      if (gap < 44) prob('hand cards: only ' + gap + 'px of each card visible ' + tag);
    };
    const tap = async x => { try { if (typeof x === 'string') await p.tap(x, { timeout: 5000 }); else await x.tap({ timeout: 5000 }); } catch (e) { } await p.waitForTimeout(80); };
    const step = LIB.stepper(p, tap);
    const dockOf = () => rect('#dock');
    const inVP = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return 'missing'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1 && e.contains(h) ? 'ok' : 'off ' + JSON.stringify([r.left, r.top, r.right, r.bottom].map(Math.round)) + ' hit ' + (h && (h.className || h.id)); }, sel);
    await p.goto('https://gns.test/'); await p.waitForTimeout(1500); await scroll('start'); await shot('0start'); await targets('start');
    { const phc = await p.evaluate(() => document.documentElement.className); if (!/\bph\b/.test(phc)) prob('phone class missing', phc); }
    for (const a of ['play', 'online']) { const r = await inVP(`#start [data-a=${a}]`); if (r !== 'ok') prob('title button ' + a, r); }
    // setup: one summary line + Configure; the sheet holds the dive and the divers
    await p.tap('[data-a=play]'); await p.waitForTimeout(400); await scroll('setup'); await shot('1setup'); await targets('setup');
    { const st = await p.evaluate(() => ({ cfgHidden: document.querySelector('#cfg').hidden })); if (!st.cfgHidden) prob('Configure sheet open by default on a phone'); for (const s of ['[data-start=vs]', '[data-a=cfgopen]']) { const r = await inVP(s); if (r !== 'ok') prob('setup button ' + s, r); } }
    await p.tap('[data-a=cfgopen]'); await p.waitForTimeout(400); await shot('1config'); await targets('configure');
    { const r = await inVP('#cfg .cfghead [data-a=cfgclose]'); if (r !== 'ok') prob('Configure Done button', r); }
    await p.tap('#cfg [data-a=opt][data-k=np][data-v="4"]'); await p.waitForTimeout(150);
    { const r = await p.evaluate(() => UI.opt.np); if (r !== 4) prob('crew size by touch', r); }
    await p.tap('#cfg [data-a=pickdive][data-v="7"]'); await p.waitForTimeout(150); await p.tap('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(250);
    { const line = await p.evaluate(() => (document.querySelector('.ssum .sline') || {}).textContent); if (!/4/.test(line || '')) prob('summary after Configure', line); }
    // a game against computers, by touch only
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; });
    await p.tap('[data-start=vs]'); await p.waitForTimeout(1200);
    await p.evaluate(() => { if (UI.coach) UI.coach.level = 'off'; UI.tip = null; if (window.renderTip) renderTip(); });
    await scroll('game');
    const m = await p.evaluate(() => { const b = document.querySelector('#bd').getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), short: Math.min(innerWidth, innerHeight), vw: innerWidth, vh: innerHeight }; });
    log('board', JSON.stringify(m));
    const port = m.vw < m.vh; if (port && m.w < .95 * m.vw) prob('board width < 95% of the screen', m.w); if (port && m.h < .75 * m.w) prob('board height < 0.75 width', m.h); if (!port && m.h < .8 * m.vh) prob('board height in landscape < 80%', m.h);
    let seen = {}, steps = 0, plays = 0;
    for (let k = 0; k < 900 && steps < 500; k++) {
      const o = await p.evaluate(() => ({ over: G.phase === 'over', ph: G.phase, must: iMustAct() && canAct(), pl: G.tricks.length, sel: UI.sel, tip: !!document.querySelector('#tip [data-a=tipok]') }));
      if (o.over) break;
      if (process.env.LPDBG && k % 5 === 0) log('dbg', k, JSON.stringify(o), 'steps', steps, 'plays', plays);
      if (o.must) {
        if (!seen[o.ph]) { seen[o.ph] = 1; await p.waitForTimeout(700); await scroll('turn ' + o.ph); await boardCheck('turn ' + o.ph); await targets('turn ' + o.ph); await shot('2' + o.ph); }
        if (o.ph === 'play' && o.pl === 1 && !seen.lift) { seen.lift = 1; if (await p.$('#hand .hc:not(.dim)')) { await tap('#hand .hc:not(.dim) >> nth=0'); await p.waitForTimeout(350); const pb = await p.evaluate(() => !!document.querySelector('#acts [data-a=playcard]')); if (!pb) prob('no Play button after lifting a card'); const ab = await p.evaluate(() => [...document.querySelectorAll('#acts button')].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, e.dataset.a]; })); const dd = await dockOf(); for (const a of ab) if (a[2] > dd[2] + 1 || a[3] > dd[3] + 1 || a[0] < dd[0] - 1) prob('action button outside the dock ' + a[4], JSON.stringify([a, dd])); await boardCheck('lifted'); await targets('lifted'); await shot('3lifted'); await p.evaluate(() => { UI.sel = -1; render(); }); } }
        if (o.ph === 'play' && o.pl === 2 && !seen.pop) { seen.pop = 1; if (await p.$('.jc')) { await tap('.jc >> nth=0'); await p.waitForTimeout(350); const pr = await rect('#ppop'), fr = await rect('#felt'); if (!pr) prob('job pop-up did not open'); else { if (ov(pr, fr)) prob('job pop-up over the felt (a played card could be hidden)', JSON.stringify([pr, fr])); if (!insideVP(pr)) prob('job pop-up outside the screen', JSON.stringify(pr)); const sc = await p.evaluate(() => { const b = document.querySelector('#ppop .ph-body'); return b ? { sh: b.scrollHeight, ch: b.clientHeight, oy: getComputedStyle(b).overflowY } : null; }); if (sc && sc.sh > sc.ch + 1 && !/auto|scroll/.test(sc.oy)) prob('pop-up text cut off and not scrollable', JSON.stringify(sc)); await shot('4jobpop'); await targets('jobpop'); await tap('#ppop [data-a=popx]'); await p.waitForTimeout(200); if (await rect('#ppop')) prob('x did not close the pop-up'); } } }
        if (o.ph === 'play' && o.pl === 3 && !seen.drawers) { seen.drawers = 1; for (const id of ['jobd', 'logd', 'rulesd', 'setd']) { await tap(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) prob('drawer did not open', id); if (id === 'setd' || id === 'jobd') { await shot('5' + id); await targets(id); } await p.keyboard.press('Escape'); await p.waitForTimeout(300); } }
        const r = await step(); steps++; if (r === 'play') plays++; if (r && /^stuck|^no-card/.test(r)) { prob('step ' + r); break; }
        if (plays === 4 && !seen.mid) { seen.mid = 1; await p.waitForTimeout(900); await scroll('midgame'); await boardCheck('midgame'); await targets('midgame'); await shot('6mid'); }
      }
      await p.waitForTimeout(o.must ? 50 : 120);
    }
    log('cards played by touch', plays, 'steps', steps); if (plays < 4) prob('too few cards played by touch', plays);
    await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
    for (let k = 0; k < 900; k++) { const st = await p.evaluate(() => G.phase === 'over' && UI.overShown); if (st) break; await step(); await p.waitForTimeout(50); }
    await p.waitForTimeout(500); await shot('7final'); await scroll('final'); await targets('final'); { const rr = await rect('.rsbox'); if (!rr) prob('no final result'); else if (!insideVP(rr)) prob('final result does not fit', JSON.stringify(rr)); }
    await tap('#rs [data-a=rsclose]'); await p.waitForTimeout(300); await scroll('after final');
    // guided dive: the tip card is readable and has a visible button
    await p.evaluate(() => { ANIM = 1; AIDELAY = 60; showStart(); }); await p.waitForTimeout(300); await p.tap('[data-a=play]'); await p.waitForTimeout(200); await p.tap('[data-start=guided]'); await p.waitForTimeout(1200);
    { const tip = await p.evaluate(() => { const b = document.querySelector('#tip [data-a=tipok]'); if (!b) return null; const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { vis: r.bottom <= innerHeight + 1 && r.top >= 0 && b.contains(h), over: !!(document.querySelector('#tip').getBoundingClientRect().height) }; });
      if (!tip) prob('guided dive shows no tip card'); else { if (!tip.vis) prob('tip button not visible or covered', JSON.stringify(tip)); const tr = await rect('#tip'), br = await rect('#bd'); if (tr && br && ov(tr, br)) prob('tip card over the board', JSON.stringify([tr, br])); await shot('8tip'); await targets('tip'); await tap('#tip [data-a=tipok]'); await p.waitForTimeout(300); } }
    // hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(300); await p.tap('[data-a=play]'); await p.waitForTimeout(200); await p.tap('[data-a=cfgopen]'); await p.waitForTimeout(200); await p.tap('#cfg [data-a=opt][data-k=np][data-v="3"]'); await p.tap('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200); await p.tap('[data-start=hot]'); await p.waitForTimeout(900);
    { const pass = await p.evaluate(() => ({ card: !document.querySelector('#pass').hidden && !!document.querySelector('#pass [data-a=takedev]'), hand: document.querySelectorAll('#hand .hc').length }));
      if (!pass.card) prob('no pass-the-device card in hot-seat'); if (pass.hand) prob('hand visible before the pass card is taken'); const r = await inVP('#pass [data-a=takedev]'); if (r !== 'ok') prob('pass card button', r); await shot('9pass'); await scroll('pass'); await targets('pass');
      await p.tap('#pass [data-a=takedev]'); await p.waitForTimeout(500); const hh = await p.evaluate(() => document.querySelectorAll('#hand .hc').length); if (!hh) prob('hand not shown after taking the device'); await shot('9hot'); await boardCheck('hot'); }
    log('errors', JSON.stringify(errs.slice(0, 3))); bad += errs.length; if (errs.length) console.log('FAIL', t, 'console errors', errs.length);
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
