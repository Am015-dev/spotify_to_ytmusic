// Desktop/tablet layout check. node lay.js [WxH,...]  (default 1366x768, 1920x1080, 768x1024, 1100x700)
// Prints "FAIL <size> <check>" lines and "PROBLEMS n". Needs Playwright (PW env var or global) and Chromium (/opt/pw-browsers/chromium).
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots', 'desk'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const SIZES = (process.argv[2] || '1366x768,1920x1080,768x1024,1100x700').split(',').map(s => s.split('x').map(Number));
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async n => { await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const inside = (A, V) => A[0] >= V[0] - 1 && A[1] >= V[1] - 1 && A[2] <= V[2] + 1 && A[3] <= V[3] + 1;
    const reach = async tag => {
      const r = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#belt .hc[data-up="1"],.seat .sh,#roster .chip,#acts button,.gx-bar button')) { const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { bad.push('offscreen ' + (e.dataset.a || e.dataset.gx || e.className)); continue; } const h = document.elementFromPoint(x, y); if (!h || !e.contains(h)) bad.push('covered ' + (e.dataset.a || e.dataset.gx || e.className) + ' by ' + (h && (h.id || h.className && h.className.baseVal || h.className))); } return bad.slice(0, 6); });
      if (r.length) fail('unreachable ' + tag, JSON.stringify(r));
    };
    const humanTurn = async () => { for (let k = 0; k < 160; k++) { if (await p.evaluate(() => canPick())) return true; await p.waitForTimeout(150); } return false; };
    await p.goto('https://gns.test/'); await p.waitForTimeout(600); await scroll('start'); await shot('0start');
    await p.evaluate(() => { UI.seed = 3; AIDELAY = 60; UI.opt = { np: 4, level: 'normal', lv: ['normal', 'normal', 'normal', 'normal'] }; });
    await p.click('[data-start=vs]'); await p.waitForTimeout(700);
    if (!(await humanTurn())) fail('no human turn'); await scroll('game'); await reach('turn');
    const m = await p.evaluate(() => { const B = document.querySelector('#board').getBoundingClientRect(), D = document.querySelector('#dock').getBoundingClientRect(), T = document.querySelector('#tbl').getBoundingClientRect(); return { board: [Math.round(B.width), Math.round(B.height)], share: +(B.width * B.height / (innerWidth * innerHeight)).toFixed(2), dock: [Math.round(D.width), Math.round(D.height)], tbl: [Math.round(T.width), Math.round(T.height)] }; });
    console.log(t, 'board', JSON.stringify(m)); if (m.share < .5) fail('board share', m.share);
    await shot('1game');
    // lift a plate: the dock shows it and a Serve button; nothing is covered
    await p.click('#belt .hc[data-up="1"] >> nth=1'); await p.waitForTimeout(250);
    if (!(await p.$('#acts [data-a=serve]'))) fail('no Serve button after lifting a plate'); if (!(await p.evaluate(() => document.querySelector('#selinfo').textContent.length > 10))) fail('selinfo empty'); await reach('lifted'); await shot('2lifted');
    // table group pop-up beside the board
    await p.evaluate(() => { const g = [...document.querySelectorAll('#tbl .grp')].find(e => e.dataset.k !== 'pud'); (g || document.querySelector('#tbl .grp')).click(); }); await p.waitForTimeout(250);
    if (await p.evaluate(() => document.querySelector('#ppop').hidden)) fail('group pop-up did not open');
    else { const pr = await rect('#ppop'), br = await rect('#bd'), dr = await rect('#dock'); if (ov(pr, br)) fail('pop-up over the board', JSON.stringify([pr, br])); if (!inside(pr, dr)) fail('pop-up outside the dock'); await shot('3pop'); await scroll('popup'); await p.keyboard.press('Escape'); await p.waitForTimeout(150); if (!(await p.evaluate(() => document.querySelector('#ppop').hidden))) fail('Esc did not close the pop-up'); }
    for (const id of ['rivald', 'logd', 'rulesd', 'setd']) { await p.click(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) fail('drawer did not open', id); if (id === 'rulesd') await shot('4rules'); if (id === 'setd') await shot('4menu'); if (id === 'rivald') await shot('4diners'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.evaluate(i => document.getElementById(i).classList.contains('on'), id)) fail('Esc did not close drawer', id); }
    // serve with real animations and look at the reveal
    await p.click('#acts [data-a=serve]'); await p.waitForTimeout(500); await shot('5cover'); await scroll('cover');
    let revealShot = false; for (let k = 0; k < 40; k++) { const st = await p.evaluate(() => ({ lift: !!document.querySelector('.kk-cloche.kk-lift'), can: canPick() })); if (st.lift && !revealShot) { revealShot = true; await shot('6reveal'); } if (st.can) break; await p.waitForTimeout(150); }
    await reach('after reveal'); await shot('7landed');
    // play on fast to the end of round 1 (taps through the real belt)
    await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
    let rsShot = false;
    for (let k = 0; k < 500; k++) {
      const st = await p.evaluate(() => ({ rs: !document.querySelector('#rs').hidden, pk: canPick(), over: G.phase === 'over' && UI.overShown, pc: !document.querySelector('#pc').hidden }));
      if (st.over) break;
      if (st.rs) { if (!rsShot) { rsShot = true; await p.waitForTimeout(300); await scroll('round pad'); await shot('8roundpad'); const rr = await rect('.rsbox'); if (rr && (rr[0] < 0 || rr[1] < 0 || rr[2] > W + 1 || rr[3] > H + 1)) fail('round pad does not fit', JSON.stringify(rr)); } await p.click('#rs [data-a=rsnext]'); await p.waitForTimeout(100); continue; }
      if (st.pk) { await p.click('#belt .hc[data-up="1"] >> nth=0'); await p.click('#belt .hc.sel'); } await p.waitForTimeout(40);
    }
    await p.waitForTimeout(400); await scroll('final'); await shot('9final'); { const rr = await rect('.rsbox'); if (!rr) fail('no final result'); else if (rr[0] < 0 || rr[1] < 0 || rr[2] > W + 1 || rr[3] > H + 1) fail('final box does not fit', JSON.stringify(rr)); }
    await p.click('#rs [data-a=rsclose]'); await p.waitForTimeout(200); await scroll('after final'); await shot('10after');
    // hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(200); await p.click('[data-a=opt][data-k=np][data-v="3"]'); await p.click('[data-start=hot]'); await p.waitForTimeout(500);
    if (await p.evaluate(() => document.querySelector('#pc').hidden || !document.querySelector('#pc [data-a=take]'))) fail('no pass-the-device card'); else { const pr = await rect('#pc'), br = await rect('#bd'); if (ov(pr, br)) fail('pass card over the board'); await shot('11pass'); if (await p.evaluate(() => document.querySelectorAll('#belt [data-up="1"]').length)) fail('hand visible before the pass card was taken'); }
    await scroll('hot');
    if (errs.length) fail('console errors', JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
