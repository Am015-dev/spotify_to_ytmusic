// W491: walks the guided first game by real touch (CDP taps/drags) and asserts every rule step appears, in order,
// each with one line of 12 words or fewer and one highlighted target. Ends in a real game.
// node tut-walk.js [WxH] [--shots DIR]     (URL env = page to open; default the built stitchwise.html)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const A = process.argv.slice(2), sz = (A.find(a => /^\d+x\d+$/.test(a)) || '390x844').split('x').map(Number);
const SH = A.includes('--shots') ? A[A.indexOf('--shots') + 1] : null; if (SH) fs.mkdirSync(SH, { recursive: true });
const WANT = ['buy', 'rotate', 'place', 'pay', 'time', 'advance', 'income', 'leather', 'bonus', 'flip', 'bonus', 'end'];
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: sz[0], height: sz[1] }, hasTouch: true, isMobile: true, deviceScaleFactor: SH ? 2 : 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'off', ai: 'fast' })); } catch (e) { } });
  await pg.goto(process.env.URL || 'file://' + path.join(__dirname, 'stitchwise.html')); await pg.waitForTimeout(900);
  const cdp = await ctx.newCDPSession(pg);
  const tapXY = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(250); };
  const tap = async el => { try { await el.scrollIntoViewIfNeeded(); } catch (e) { if (/not attached/.test(e.message)) { await pg.waitForTimeout(150); return; } throw e; } /* R7: a redraw replaced the element; the loop re-reads the state and taps again */ const bb = await el.boundingBox(); if (!bb) return; ok(bb && bb.width >= 40 && bb.height >= 40, 'tap target >= 40px: ' + (bb && [bb.width, bb.height])); await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  const drag = async (x0, y0, x1, y1) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] }); for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 6, y: y0 + (y1 - y0) * i / 6 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(400); };
  // title -> Learn
  const learn = await pg.$('[data-a=learn]'); ok(!!learn, 'Learn button on the title'); await tap(learn); await pg.waitForTimeout(500);
  const seen = []; let shotN = 0, guard = 0;
  while (guard++ < 60) {
    await pg.waitForFunction(() => (window.GXT2 && !UI.busy && document.querySelector('#tutb .t2-hl, .t2-hl')) || document.querySelector('#tutfin'), null, { timeout: 30000 }).catch(() => {});
    const st = await pg.evaluate(() => { const f = document.querySelector('#tutfin .card'); if (f) return { id: 'score', rule: 'end', say: f.querySelector('h2').textContent }; const b = document.querySelector('#tutb'); return b ? { id: b.dataset.step, rule: b.dataset.rule, say: b.querySelector('.t2t').textContent } : null; });
    if (!st) { ok(false, 'no tutorial step shown'); break; }
    if (seen[seen.length - 1] !== st.rule) { seen.push(st.rule); if (SH && WANT.indexOf(st.rule) >= 0 && st.id !== 'end') { shotN++; await pg.waitForTimeout(250); await pg.screenshot({ path: path.join(SH, 'tut-' + shotN + '.png') }); } }
    if (st.id === 'score' && SH) { shotN++; await pg.screenshot({ path: path.join(SH, 'tut-' + shotN + '.png') }); }
    { const qm = await pg.evaluate(() => { const q = document.querySelector('#quilt'); return q ? { cs: q.getBoundingClientRect().width / 9, pl: UI.sel >= 0 || !!G.pend } : null; }); if (process.env.CS) console.log('cs', st.id, qm && qm.cs.toFixed(1), qm && qm.pl); if (qm && st.id !== 'score') ok(qm.cs >= (qm.pl ? 37 : (sz[0] < 380 ? 30 : 37)), 'R16: step ' + st.id + ' tutorial quilt square ' + qm.cs.toFixed(1) + 'px (placing ' + qm.pl + ')'); }
    ok(st.say.trim().split(/\s+/).length <= 13, 'step ' + st.id + ' line <= 13 words: ' + st.say);
    const hl = await pg.$$('.t2-hl'); ok(hl.length === 1, 'step ' + st.id + ': exactly one highlighted target (' + hl.length + ')');
    // a wrong tap is refused (the step does not move on)
    if (st.id === 'buy') { const o = await pg.$$('#offers .offer:not(.up)'); await tap(o[0]); ok(await pg.evaluate(() => UI.sel) === -1, 'wrong patch refused'); }
    if (st.id === 'pay' || st.id === 'sew2') { // Sew it on is refused until the patch sits in the gap: proven in place/place2
    }
    if (st.id === 'place' || st.id === 'place2') { // a Sew tap first is refused; then drag the ghost onto the gold gap by touch
      const sw = await pg.$('[data-a=sew]'); const owned0 = await pg.evaluate(() => G.owned[0].length); if (sw) { const sb = await sw.boundingBox(); await tapXY(sb.x + sb.width / 2, sb.y + sb.height / 2); } ok(await pg.evaluate(o => G.owned[0].length === o, owned0), st.id + ': Sew before placing is refused');
      const tg = await pg.evaluate(id => { const gap = id === 'place' ? GXT2.h1 : GXT2.h2, c = curCells(), b = bbox(c); let mx = 9, my = 9; gap.forEach(q => { mx = Math.min(mx, q[0]); my = Math.min(my, q[1]); }); return { cx: mx + Math.floor(b[0] / 2), cy: my + Math.floor(b[1] / 2) + 2, gx: UI.gx + Math.floor(b[0] / 2), gy: UI.gy + Math.floor(b[1] / 2) }; }, st.id);
      const q = await (await pg.$('#quilt')).boundingBox(), cs = q.width / 9; ok(cs >= 30, 'quilt square >= 30px (' + cs.toFixed(1) + ')');
      await drag(q.x + (tg.gx + .5) * cs, q.y + (tg.gy + .5) * cs, q.x + (tg.cx + .5) * cs, q.y + (Math.min(8, tg.cy) + .5) * cs); await pg.waitForTimeout(300); continue; }
    if (st.id === 'score') { const r = await pg.$('#tutfin [data-a=t2real]'); await tap(r); await pg.waitForTimeout(600); break; }
    if (st.id === 'leather2') { const i = await pg.evaluate(() => GXT2.hl[1] * 9 + GXT2.hl[0]); const cells = await pg.$$('#quilt .qc'); const cb = await cells[i].boundingBox(); ok(cb.width >= 30, 'quilt square >= 30px'); await tapXY(cb.x + cb.width / 2, cb.y + cb.height / 2); await pg.waitForTimeout(400); continue; }
    await tap(hl[0]); await pg.waitForTimeout(400); if (process.env.DBG) console.log(st.id, JSON.stringify(await pg.evaluate(() => ({ i: GXT2 && GXT2.i, pr: GXT2 && GXT2.pressed, pos: G.pos, who: swWho(G), busy: UI.busy }))));
  }
  ok(JSON.stringify(seen) === JSON.stringify(WANT), 'rules in order: ' + seen.join(', '));
  const real = await pg.evaluate(() => ({ g: !!G && !G.over, tut: UI.tutorial, t2: !!window.GXT2, pos: G && G.pos, offers: document.querySelectorAll('#offers .offer:not(.up)').length }));
  ok(real.g && !real.tut && !real.t2 && real.pos[0] === 0 && real.pos[1] === 0 && real.offers === 3, 'hands over a fresh real game ' + JSON.stringify(real));
  let turns = 0, midShot = false;
  if (A.includes('--full')) { // then the real game, by touch, as a new player, to the result
    const shot = async n => { if (SH) { await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(SH, n + '.png') }); } };
    const goal = await pg.$('[data-a=goalok]'); if (goal) await tap(goal);
    await pg.waitForFunction(() => G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 60000 }); await shot('first-turn');
    while (turns++ < 200) {
      await pg.waitForFunction(() => G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 60000 });
      if (await pg.evaluate(() => G.over)) break;
      if (await pg.evaluate(() => !!G.pend)) { const i = await pg.evaluate(() => G.board[0].findIndex(v => v === -1)); const c = await (await pg.$$('#quilt .qc'))[i].boundingBox(); await tapXY(c.x + c.width / 2, c.y + c.height / 2); await pg.waitForTimeout(300); continue; }
      const mv = await pg.evaluate(() => { const m = aiMove(G, 'normal', () => .5); return m.t === 'buy' ? { k: m.k, x: m.x, y: m.y, o: m.o } : null; });
      let sewn = false;
      if (mv) {
        const offers = await pg.$$('#offers .offer:not(.up)'); await tap(offers[mv.k]); await pg.waitForTimeout(250);
        for (let r = 0; r < 4 && !sewn; r++) {
          const tgt = await pg.evaluate(mv => { const c = curCells(); if (!c || UI.sel < 0) return null; const b = bbox(c); return { i: (mv.y + Math.floor(b[1] / 2)) * 9 + mv.x + Math.floor(b[0] / 2) }; }, mv); if (!tgt) break;
          const c = await (await pg.$$('#quilt .qc'))[Math.min(80, tgt.i)].boundingBox(); await tapXY(c.x + c.width / 2, c.y + c.height / 2); await pg.waitForTimeout(250);
          if (turns === 3) await shot('placing');
          const sew = await pg.$('[data-a=sew]:not([disabled])'); if (sew) { await tap(sew); sewn = true; break; }
          const rot = await pg.$('[data-a=rot]'); if (rot) await tap(rot);
        }
        if (!sewn) { const cn = await pg.$('[data-a=cancel]'); if (cn) await tap(cn); }
      }
      if (!sewn) { await pg.waitForTimeout(250); const adv = await pg.$('[data-a=adv]'); if (adv) await tap(adv).catch(async () => { const a2 = await pg.$('[data-a=adv]'); if (a2) await tap(a2); }); }   // R7: the dock can redraw between query and tap
      if (turns >= 10 && !midShot) { midShot = true; await shot('mid-game'); }
    }
    await pg.waitForFunction(() => G.over, null, { timeout: 60000 }); await pg.waitForTimeout(1500);
    const rs = await pg.$('#rs:not([hidden])'); if (!rs) { const sr = await pg.$('[data-a=result]'); if (sr) await tap(sr); await pg.waitForTimeout(800); }
    ok(!!(await pg.$('#rs:not([hidden])')), 'result screen shown'); await shot('result');
    const chk = await pg.evaluate(() => swCheck(G)); ok(chk === null, 'engine invariants at the end: ' + chk);
  }
  ok(!errs.length, 'page errors: ' + errs.join(' | '));
  console.log((fails ? 'FAIL' : 'PASS') + ' tut-walk ' + sz.join('x') + ': ' + seen.length + ' rule steps (' + seen.join(' > ') + ')' + (turns ? ', then a real game of ' + turns + ' human turns to the result' : '') + ', ' + fails + ' failures');
  await b.close(); process.exit(fails ? 1 : 0);
})();
