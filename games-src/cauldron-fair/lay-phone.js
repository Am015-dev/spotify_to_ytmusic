// Phone layout + touch-only play check. node lay-phone.js [WxH,...]   prints "FAIL <size> <check>" lines, then PROBLEMS n
// Default sizes: 390x844 390x763 390x664 375x553 412x780 844x390 750x342 (isMobile + hasTouch; ?phone=1 is NOT forced: phone mode must switch on by itself).
const DEF = '390x844,390x763,390x664,375x553,412x780,844x390,750x342';
if (!process.argv[2] || process.argv[2].startsWith('--')) process.argv.splice(2, 0, DEF);
const FIT = require('../phfit.js'); FIT.guard(2);
const L = require('./pwlib'); const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots', 'ph'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = process.argv[2].split(',').map(s => s.split('x').map(Number));
(async () => {
  const b = await L.launch(); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const p = await L.page(b, W, H, { mobile: true, touch: true }); const errs = p.errs;
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); }; const log = (...a) => console.log(t, ...a);
    const shot = async n => { (await FIT.run(p)).forEach(m => fail('FIT ' + n, m)); (await FIT.extra(p)).forEach(m => fail('FIT ' + n, m)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const targets = async tag => {
      const r = await p.evaluate(() => {
        const o = []; const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; return r; };
        for (const e of document.querySelectorAll('.gx-bar button,#dock button,#acts button,#qbox button,#others .th,#roster .rc,#pc button,#rs button,.gx-drawer.on button,#start button,#start summary,#netbox button')) {
          if (e.closest('[hidden]')) continue; if (e.closest('.gx-drawer') && !e.closest('.gx-drawer.on')) continue; if (e.closest('#dock') && getComputedStyle(document.querySelector('#dock')).visibility === 'hidden') continue; const r = vis(e); if (!r) continue;
          if (r.width < 43.9 || r.height < 43.9) o.push((e.dataset.a || e.dataset.gx || e.className) + ' ' + Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10);
        }
        const txt = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,#start[hidden],[hidden],.sr,#toast,.gx-drawer:not(.on),#netbox[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue; if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue; if (parseFloat(cs.fontSize) < 12.95) txt.push(s.slice(0, 18) + ':' + cs.fontSize); }
        return { small: o.slice(0, 6), txt: txt.slice(0, 6) };
      });
      if (r.small.length) fail('tap target <44 ' + tag, JSON.stringify(r.small)); if (r.txt.length) fail('text <13px ' + tag, JSON.stringify(r.txt));
    };
    const inVP = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return 'missing'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1 && e.contains(h) ? 'ok' : 'off ' + JSON.stringify([r.left, r.top, r.right, r.bottom].map(Math.round)) + ' hit ' + (h && (h.className || h.id)); }, sel);
    const reach = async tag => {
      const r = await p.evaluate(() => { const bad = []; const rsOn = !document.querySelector('#rs').hidden, pcOn = !document.querySelector('#pc').hidden; for (const e of document.querySelectorAll(rsOn ? '#rs .rsfoot button,#rs [data-a=take]' : pcOn ? '#pc button' : '#acts button,#qbox button,.gx-bar button,#others .th')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { let sc = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 1) { sc = true; break; } } if (sc && e.closest('#qbox,#rs .rsbody')) continue; bad.push('offscreen ' + (e.dataset.a || e.dataset.gx || e.className)); continue; } const h = document.elementFromPoint(x, y); if (!h || !e.contains(h)) bad.push('covered ' + (e.dataset.a || e.dataset.gx || e.className) + ' by ' + (h && (h.id || (h.className && h.className.baseVal) || h.className))); } return bad.slice(0, 6); });
      if (r.length) fail('unreachable ' + tag, JSON.stringify(r));
    };
    // answer a question the fortune card may ask first (e.g. score or remove a chip) so that Draw and Stop are on screen
    const toDraw = async () => { for (let k = 0; k < 8; k++) { if (await p.$('#acts .drawb')) return true; const q = await p.$('#qbox [data-a=mv],#acts [data-a=mv]'); if (!q) { await p.waitForTimeout(300); continue; } await shot('2q' + k); await q.tap().catch(() => { }); await p.waitForTimeout(500); } return !!(await p.$('#acts .drawb')); };
    await p.goto('https://gns.test/'); await p.waitForTimeout(900); await scroll('start'); await shot('0start'); await targets('start');
    const phc = await p.evaluate(() => document.documentElement.className); if (!/\bph\b/.test(phc)) fail('phone class missing', phc);
    { const x = await p.evaluate(() => [...document.querySelectorAll('#start .tbtns button')].map(b => b.dataset.a).join()); if (!/play/.test(x) || !/online/.test(x)) fail('title buttons', x); for (const a of ['play', 'online']) { const r = await inVP(`#start [data-a=${a}]`); if (r !== 'ok') fail('title button ' + a, r); } }
    // ---- setup: one summary line + Configure
    await p.tap('[data-a=play]'); await p.waitForTimeout(300); await scroll('setup'); await shot('1setup'); await targets('setup');
    { const st = await p.evaluate(() => ({ line: (document.querySelector('.ssum .sline') || {}).textContent, cfgHidden: document.querySelector('#cfg').hidden })); if (!/players|makers|brewers|table|You/.test(st.line || '')) fail('setup summary line', st.line); if (!st.cfgHidden) fail('Configure sheet open by default on a phone');
      for (const s of ['[data-start=vs]', '[data-a=cfgopen]']) { const r = await inVP(s); if (r !== 'ok') fail('setup button ' + s, r); } }
    await p.tap('[data-a=cfgopen]'); await p.waitForTimeout(300); await shot('1config'); await targets('configure');
    { const st = await p.evaluate(() => ({ open: !document.querySelector('#cfg').hidden, cards: document.querySelectorAll('#cfg .dcard').length })); if (!st.open || st.cards !== 4) fail('Configure sheet', JSON.stringify(st)); const r = await inVP('#cfg .cfghead [data-a=cfgclose]'); if (r !== 'ok') fail('Configure Done button', r); }
    await p.tap('#cfg [data-a=opt][data-k=np][data-v="4"]'); await p.waitForTimeout(150); await p.tap('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200);
    { const line = await p.evaluate(() => (document.querySelector('.ssum .sline') || {}).textContent); if (!/4/.test(line || '')) fail('summary after Configure', line); }
    // ---- a game against computers, by touch (tips off so only the table is judged first)
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; UI.coach.level = 'off'; });
    await p.tap('[data-start=vs]'); await p.waitForTimeout(900); await L.myTurn(p); await toDraw(); await scroll('game');
    const m = await p.evaluate(() => { const c = document.querySelector('#cpot').getBoundingClientRect(), d = document.querySelector('#dock').getBoundingClientRect(); return { w: c.width, h: c.height, short: Math.min(innerWidth, innerHeight), vw: innerWidth, vh: innerHeight, dock: [d.top, d.height] }; });
    log('cauldron', JSON.stringify(m)); const port = m.vw < m.vh;
    if (port && m.w < FIT.share(W, H) * m.short - 2) fail('cauldron width ' + Math.round(m.w) + ' < ' + FIT.share(W, H) + ' x ' + m.short); if (!port && m.h < .70 * m.short) fail('cauldron height landscape ' + Math.round(m.h) + ' < 0.70 x ' + m.short);
    await reach('turn'); await targets('turn'); await shot('2turn');
    { const dr = await p.$('#acts .drawb'), sr = await p.$('#acts .stopb'); if (!dr) fail('no Draw button'); else { const r = await dr.boundingBox(); if (r.height < 56 || r.width < 90) fail('Draw button too small for a thumb', JSON.stringify(r)); if (port && r.y + r.height / 2 < H * .5) fail('Draw button not in the lower half', JSON.stringify(r)); } if (sr) { const r = await sr.boundingBox(); if (r.height < 48) fail('Stop button too small', JSON.stringify(r)); } }
    // draw by touch, real animations
    await p.evaluate(() => { ANIM = 1; });
    for (let i = 0; i < 3; i++) { const d = await p.$('#acts .drawb'); if (!d) break; await d.tap({ timeout: 4000 }).catch(() => { }); await p.waitForTimeout(550); }
    await scroll('drawing'); await reach('drawing'); await targets('drawing'); await shot('3drawn');
    // thumbnails: tap another cauldron, look, tap back
    { const th = await p.$$('#others .th'); if (!th.length) fail('no thumbnails'); else { const f0 = await p.evaluate(() => focusSeat()); await th[0].tap(); await p.waitForTimeout(400); const f1 = await p.evaluate(() => focusSeat()); if (f1 === f0) fail('thumbnail tap did not focus another cauldron'); await shot('4other'); await scroll('other'); await reach('other'); await targets('other'); const me = await p.$('#others .th.me, #others .th[data-seat="0"], #roster .rc.me'); if (me) await me.tap().catch(() => { }); await p.evaluate(() => { UI.focus = viewSeat(); render(); }); await p.waitForTimeout(250); } }
    for (const id of ['scored', 'logd', 'refd', 'rulesd', 'setd']) { await p.tap(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); const idd = await p.evaluate(() => (document.querySelector('.gx-drawer.on') || {}).id); if (!idd) fail('drawer did not open', id); if (id === 'setd' || id === 'refd') { await shot('5' + id); await targets('drawer ' + id); } await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
    // play to the first day report by touch/fast, look at report and shop
    await p.evaluate(() => { ANIM = 0; AIDELAY = 0; });
    let r1 = await L.playTo(p, () => !document.querySelector('#rs').hidden && G.phase !== 'over', 3000);
    if (r1 === 'cond') { await p.waitForTimeout(500); await scroll('report'); await shot('6report'); await reach('report'); await targets('report'); const rr = await rect('.rsbox'); if (!rr || rr[0] < -1 || rr[1] < -1 || rr[2] > W + 1 || rr[3] > H + 1) fail('report box does not fit', JSON.stringify(rr)); } else fail('no day report', r1);
    let shopShot = false;
    for (let k = 0; k < 400; k++) { const st = await p.evaluate(() => ({ shop: !!document.querySelector('#rs [data-a=shopbuy]'), over: G.phase === 'over' && !document.querySelector('#rs').hidden })); if (st.shop && !shopShot) { shopShot = true; await p.waitForTimeout(300); await shot('7shop'); await scroll('shop'); await reach('shop'); await targets('shop'); const x = await p.evaluate(() => { const sb = document.querySelector('#rs [data-a=shopsel]:not([disabled])'); return !!sb; }); if (x) { await p.tap('#rs [data-a=shopsel]:not([disabled])'); await p.waitForTimeout(200); await shot('7shop2'); await reach('shop picked'); } } if (st.over || shopShot) break; const a = await L.autoStep(p); if (a === 'wait') await p.waitForTimeout(40); }
    { const fr = await L.finishGame(p); if (fr !== 'over') fail('game did not reach the final card', fr); } await p.waitForTimeout(500); await scroll('final'); await shot('8final'); await targets('final'); await reach('final'); { const rr = await rect('.rsbox'); if (!rr) fail('no final result'); else if (rr[0] < -1 || rr[1] < -1 || rr[2] > W + 1 || rr[3] > H + 1) fail('final box does not fit', JSON.stringify(rr)); }
    await p.tap('#rs [data-a=again],#rs [data-a=menu]').catch(() => { }); await p.waitForTimeout(300);
    // ---- guided game: the tip card sits in the dock
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.coach.level = 'light'; ANIM = 1; AIDELAY = 60; showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=play]'); await p.waitForTimeout(150); await p.tap('[data-start=guided]'); await p.waitForTimeout(900);
    { const tip = await p.evaluate(() => !document.querySelector('#pc').hidden); if (!tip) fail('guided game shows no tip card'); else { const pr = await rect('#pc'), dr = await rect('#dock'); if (!pr || pr[0] < -1 || pr[2] > W + 1 || pr[3] > H + 1 || pr[1] < 0) fail('tip card outside the screen', JSON.stringify([pr, dr])); if (!port && (pr[0] < dr[0] - 1 || pr[2] > dr[2] + 1)) fail('tip card outside the side panel', JSON.stringify([pr, dr])); const bb = await inVP('#pc [data-a=tipok].btn'); if (bb !== 'ok') fail('tip button', bb); await shot('9tip'); await targets('tip'); await reach('tip'); await p.tap('#pc [data-a=tipok].btn'); await p.waitForTimeout(300); await shot('9tip2'); } }
    // ---- hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=play]'); await p.waitForTimeout(150); await p.tap('[data-a=cfgopen]'); await p.waitForTimeout(150); await p.tap('#cfg [data-a=opt][data-k=np][data-v="3"]'); await p.tap('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(150); await p.tap('[data-start=hot]'); await p.waitForTimeout(700);
    { const pass = await p.evaluate(() => ({ card: !document.querySelector('#rs').hidden && !!document.querySelector('#rs [data-a=take]'), priv: document.querySelectorAll('[data-priv]').length }));
      if (!pass.card) fail('no pass-the-device card in hot-seat'); if (pass.priv) fail('private info visible before the pass card is taken'); await shot('10pass'); await scroll('pass'); await targets('pass'); await reach('pass');
      await p.tap('#rs [data-a=take]'); await p.waitForTimeout(500); await L.myTurn(p); await reach('hot'); await shot('11hot'); }
    // ---- watch computers to the end
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(200); await p.evaluate(() => { ANIM = 0; AIDELAY = 0; }); await p.tap('[data-a=play]'); await p.waitForTimeout(150); await p.tap('[data-start=ai]'); await p.waitForTimeout(300);
    for (let k = 0; k < 1500; k++) { const st = await p.evaluate(() => ({ fin: G.phase === 'over' && !document.querySelector('#rs').hidden })); if (st.fin) break; await L.autoStep(p); await p.waitForTimeout(60); }
    { const ok = await p.evaluate(() => G.phase === 'over' && !document.querySelector('#rs').hidden); if (!ok) fail('watch game did not reach the final card'); }
    log('errors', JSON.stringify(errs.slice(0, 3))); bad += errs.length; if (errs.length) console.log('FAIL', t, 'console errors', errs.length);
    await p.ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
