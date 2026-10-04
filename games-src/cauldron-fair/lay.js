// Desktop/tablet layout check. node lay.js [WxH,...]  (default 1366x768, 1920x1080, 768x1024, 1100x700)
// Prints "FAIL <size> <check>" lines and "PROBLEMS n". Needs Playwright (PW env var) and Chromium (/opt/pw-browsers/chromium).
const L = require('./pwlib'); const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots', 'desk'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = (process.argv[2] || '1366x768,1920x1080,768x1024,1100x700').split(',').map(s => s.split('x').map(Number));
(async () => {
  const b = await L.launch(); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const p = await L.page(b, W, H);
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async n => { await p.waitForTimeout(250); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const reach = async tag => {
      const r = await p.evaluate(() => { const bad = []; const rsOn = !document.querySelector('#rs').hidden; for (const e of document.querySelectorAll(rsOn ? '#rs .rsfoot button,#rs [data-a=take],#rs .rsbox > h2' : '#acts button,#qbox button,.gx-bar button,#others .th,#roster .rc,#pc button')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { bad.push('offscreen ' + (e.dataset.a || e.dataset.gx || e.className)); continue; } const h = document.elementFromPoint(x, y); if (!h || !e.contains(h)) bad.push('covered ' + (e.dataset.a || e.dataset.gx || e.className) + ' by ' + (h && (h.id || (h.className && h.className.baseVal) || h.className))); } return bad.slice(0, 6); });
      if (r.length) fail('unreachable ' + tag, JSON.stringify(r));
    };
    await p.goto('https://gns.test/'); await p.waitForTimeout(900); await scroll('start'); await shot('0start');
    { const x = await p.evaluate(() => { const bs = [...document.querySelectorAll('#start .tbtns button')]; return { acts: bs.map(b => b.dataset.a), bad: bs.filter(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.bottom > innerHeight + 1 || r.top < 0 || r.height < 44 || !b.contains(h); }).map(b => b.dataset.a), art: !!document.querySelector('#start img.ttl-bg') }; });
      if (!x.acts.includes('play') || !x.acts.includes('online')) fail('title buttons', JSON.stringify(x)); if (x.bad.length) fail('title button off screen or covered', JSON.stringify(x.bad)); if (!x.art) fail('no title painting'); }
    await p.click('[data-a=play]'); await p.waitForTimeout(300); await scroll('setup'); await shot('1setup');
    { const st = await p.evaluate(() => ({ cfg: !document.querySelector('#cfg').hidden, starts: ['guided', 'vs', 'hot', 'ai'].map(k => { const b = document.querySelector('[data-start=' + k + ']'); if (!b) return k + ':missing'; const r = b.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0 ? 'ok' : k + ':off'; }) }));
      if (!st.cfg) fail('setup options hidden on desktop'); if (st.starts.some(x => x !== 'ok')) fail('start buttons not all visible without scrolling', JSON.stringify(st.starts)); }
    await p.evaluate(() => { UI.seed = 3; });
    await p.click('[data-a=opt][data-k=np][data-v="3"]'); await p.waitForTimeout(100);
    await p.click('[data-start=vs]'); await p.waitForTimeout(900);
    if (!(await L.myTurn(p))) fail('no human turn'); await scroll('game'); await reach('turn');
    const m = await p.evaluate(() => { const B = document.querySelector('#board').getBoundingClientRect(), D = document.querySelector('#dock').getBoundingClientRect(), P = document.querySelector('#cpot').getBoundingClientRect(); return { board: [Math.round(B.width), Math.round(B.height)], share: +(B.width * B.height / (innerWidth * innerHeight)).toFixed(2), dock: [Math.round(D.width), Math.round(D.height)], pot: [Math.round(P.width), Math.round(P.height)] }; });
    console.log(t, 'layout', JSON.stringify(m)); if (m.share < .45) fail('board share', m.share); if (m.pot[1] < H * .3) fail('cauldron too small', JSON.stringify(m.pot));
    await shot('2game');
    // draw by real clicks with the animation on
    await p.evaluate(() => { ANIM = 1; AIDELAY = 60; });
    for (let i = 0; i < 4; i++) { const d = await p.$('#acts .drawb'); if (!d) break; await d.click({ timeout: 4000 }).catch(() => { }); await p.waitForTimeout(500); if (i === 1) await shot('3drawing'); }
    await reach('after draws'); await scroll('after draws'); await shot('4mid');
    for (const id of ['scored', 'logd', 'refd', 'rulesd', 'setd']) { await p.click(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); const idd = await p.evaluate(i => (document.querySelector('.gx-drawer.on') || {}).id, id); if (!idd) fail('drawer did not open', id); await shot('5' + id); await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.evaluate(() => !!document.querySelector('.gx-drawer.on'))) fail('Esc did not close drawer', id); }
    // thumbnails: focus another cauldron
    { const th = await p.$('#others .th'); if (th) { await th.click(); await p.waitForTimeout(300); await shot('6focus'); await reach('focus'); await scroll('focus'); } else fail('no thumbnails of the other cauldrons'); }
    // play on: first day report and the final
    await p.evaluate(() => { ANIM = 0; AIDELAY = 0; });
    let r1 = await L.playTo(p, () => !document.querySelector('#rs').hidden && G.phase !== 'over', 3000);
    if (r1 === 'cond') { await p.waitForTimeout(500); await scroll('report'); await shot('7report'); const rr = await rect('.rsbox'); if (!rr || rr[0] < 0 || rr[1] < 0 || rr[2] > W + 1 || rr[3] > H + 1) fail('report box does not fit', JSON.stringify(rr)); await reach('report'); } else fail('no day report', r1);
    let shopShot = false; await p.evaluate(() => { ANIM = 0; });
    for (let k = 0; k < 400; k++) { const st = await p.evaluate(() => ({ shop: !!document.querySelector('#rs [data-a=shopbuy]'), over: G.phase === 'over' && !document.querySelector('#rs').hidden })); if (st.shop && !shopShot) { shopShot = true; await p.waitForTimeout(300); await shot('8shop'); await scroll('shop'); const rr = await rect('.rsbox'); if (!rr || rr[2] > W + 1 || rr[3] > H + 1) fail('shop box does not fit', JSON.stringify(rr)); } if (st.over || shopShot) break; const a = await L.autoStep(p); if (a === 'wait') await p.waitForTimeout(40); }
    { const fr = await L.finishGame(p); if (fr !== 'over') fail('game did not reach the final card', fr); } await p.waitForTimeout(500); await scroll('final'); await shot('9final'); { const rr = await rect('.rsbox'); if (!rr) fail('no final result'); else if (rr[0] < 0 || rr[1] < 0 || rr[2] > W + 1 || rr[3] > H + 1) fail('final box does not fit', JSON.stringify(rr)); }
    // hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.click('[data-a=play]'); await p.click('[data-a=opt][data-k=np][data-v="3"]'); await p.click('[data-start=hot]'); await p.waitForTimeout(600);
    if (await p.evaluate(() => document.querySelector('#rs').hidden || !document.querySelector('#rs [data-a=take]'))) fail('no pass-the-device card'); else { const pr = await rect('#rs .passc'), br = await rect('#bd'); if (!pr || pr[0] < 0 || pr[1] < 0 || pr[2] > W + 1 || pr[3] > H + 1) fail('pass card does not fit', JSON.stringify(pr)); await shot('10pass'); if (await p.evaluate(() => document.querySelectorAll('[data-priv]').length)) fail('private info visible before the pass card was taken'); }
    await scroll('hot');
    if (p.errs.length) fail('console errors', JSON.stringify(p.errs.slice(0, 3)));
    await p.ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
