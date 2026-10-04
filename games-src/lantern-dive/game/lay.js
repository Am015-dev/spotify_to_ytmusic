// Desktop/tablet layout check. node lay.js [WxH,...]  (default 1366x768, 1920x1080, 768x1024, 1100x700)
// Prints "FAIL <size> <check>" lines and "PROBLEMS n". Needs Playwright (PW env var or global) and Chromium (/opt/pw-browsers/chromium).
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots', 'desk'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const SIZES = (process.argv[2] || '1366x768,1920x1080,768x1024,1100x700').split(',').map(s => s.split('x').map(Number));
const LIB = require('./laylib.js');
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
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const reach = async tag => {
      const r = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#hand .hc:not(.dim),#opp .op,#acts button,.gx-bar button,#roster .chip,#pool .jcard')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; const nm = e.dataset.a || e.dataset.gx || e.className; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { bad.push('offscreen ' + nm); continue; } const h = document.elementFromPoint(x, y); if (!h || !e.contains(h)) bad.push('covered ' + nm + ' by ' + (h && (h.id || (h.className && h.className.baseVal) || h.className))); } return bad.slice(0, 6); });
      if (r.length) fail('unreachable ' + tag, JSON.stringify(r));
    };
    const tap = async x => { if (typeof x === 'string') await p.click(x); else await x.click(); await p.waitForTimeout(80); };
    const step = LIB.stepper(p, tap);
    await p.goto('https://gns.test/'); await p.waitForTimeout(1500); await scroll('start'); await shot('0start');
    { const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('#start .tbtns button')]; return { acts: bs.map(b => b.dataset.a), bad: bs.filter(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.bottom > innerHeight + 1 || r.top < 0 || r.height < 40 || !b.contains(h); }).map(b => b.dataset.a), art: !!document.querySelector('#start img.ttl-bg') }; });
      if (r.bad.length) fail('title button off screen or covered', JSON.stringify(r)); if (!r.art) fail('no title painting'); if (!r.acts.includes('play') || !r.acts.includes('online')) fail('title buttons', JSON.stringify(r.acts)); }
    await p.click('[data-a=play]'); await p.waitForTimeout(400); await scroll('setup'); await shot('1setup');
    { const st = await p.evaluate(() => { const b = document.querySelector('[data-start=vs]'); const r = b.getBoundingClientRect(); return { start: r.bottom <= innerHeight + 1 && r.top >= 0, cfg: !document.querySelector('#cfg').hidden }; }); if (!st.start) fail('Start button not visible without scrolling'); if (!st.cfg) fail('setup options hidden'); }
    // crew size and dive pick
    await p.evaluate(() => { UI.seed = 7; AIDELAY = 60; const o = optObj(); o.kind = 'log'; o.mission = 7; setNp(4); renderStart(); });
    await p.click('[data-start=vs]'); await p.waitForTimeout(1500);
    await p.evaluate(() => { if (UI.coach) UI.coach.level = 'off'; UI.tip = null; if (window.renderTip) renderTip(); });
    let shots = { assign: 0, signal: 0, play: 0, popup: 0, mid: 0 }, steps = 0, reachChecked = {};
    for (let k = 0; k < 700 && steps < 400; k++) {
      const o = await p.evaluate(() => ({ over: G.phase === 'over', ph: G.phase, must: iMustAct() && canAct(), rs: !document.querySelector('#rs').hidden, plays: G.tricks.length }));
      if (o.over) break;
      if (o.must) {
        if (!reachChecked[o.ph]) { reachChecked[o.ph] = 1; await p.waitForTimeout(500); await scroll('turn ' + o.ph); await reach('turn ' + o.ph); await shot('2' + o.ph); }
        if (o.ph === 'play' && o.plays === 2 && !shots.popup) { shots.popup = 1; await p.evaluate(() => { const c = document.querySelector('.jc'); if (c) c.click(); }); await p.waitForTimeout(350); const pr = await rect('#ppop'); if (!pr) fail('job pop-up did not open'); else { const br = await rect('#bd'); await shot('3jobpop'); await scroll('job popup'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); if (await rect('#ppop')) fail('Esc did not close the pop-up'); } }
        if (o.ph === 'play' && o.plays === 4 && !shots.mid) { shots.mid = 1; await p.evaluate(() => { document.querySelector('#hand .hc:not(.dim)') && document.querySelector('#hand .hc:not(.dim)').click(); }); await p.waitForTimeout(350); await shot('4lifted'); await reach('lifted'); await p.evaluate(() => { UI.sel = -1; render(); }); }
        const r = await step(); steps++; if (r && /^stuck|^no-card/.test(r)) { fail('step ' + r); break; }
      }
      await p.waitForTimeout(o.must ? 60 : 120);
    }
    for (const id of ['jobd', 'logd', 'rulesd', 'setd']) { await p.click(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) fail('drawer did not open', id); if (id === 'jobd' || id === 'setd') await shot('5' + id); await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.evaluate(i => document.getElementById(i).classList.contains('on'), id)) fail('Esc did not close drawer', id); }
    const m = await p.evaluate(() => { const B = document.querySelector('#board').getBoundingClientRect(); return { board: [Math.round(B.width), Math.round(B.height)], share: +(B.width * B.height / (innerWidth * innerHeight)).toFixed(2) }; });
    console.log(t, 'board', JSON.stringify(m)); if (m.share < .5) fail('board share', m.share);
    // finish fast
    await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
    for (let k = 0; k < 900; k++) { const o = await p.evaluate(() => ({ fin: G.phase === 'over' && UI.overShown })); if (o.fin) break; await step(); await p.waitForTimeout(50); }
    await p.waitForTimeout(600); await scroll('final'); await shot('6final');
    { const rr = await rect('.rsbox'); if (!rr) fail('no result card'); else if (rr[0] < 0 || rr[1] < 0 || rr[2] > W + 1 || rr[3] > H + 1) fail('result card does not fit', JSON.stringify(rr)); }
    await p.click('#rs [data-a=rsclose]').catch(() => fail('result card has no close')); await p.waitForTimeout(300); await scroll('after final');
    // hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(300); await p.click('[data-a=play]'); await p.evaluate(() => { setNp(3); renderStart(); }); await p.click('[data-start=hot]'); await p.waitForTimeout(900);
    if (await p.evaluate(() => document.querySelector('#pass').hidden || !document.querySelector('#pass [data-a=take]'))) fail('no pass-the-device card'); else { await shot('7pass'); if (await p.evaluate(() => document.querySelectorAll('#hand .hc').length)) fail('hand visible behind the pass card'); await scroll('pass'); }
    // the painted table exists
    { const px = await p.evaluate(() => ({ on: !!(window.PX && PX.on), cv: !!document.querySelector('canvas') })); console.log(t, 'pixi', JSON.stringify(px)); }
    if (errs.length) fail('console errors', JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
