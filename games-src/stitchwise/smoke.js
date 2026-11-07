// Real-input smoke + playthrough: node smoke.js [WxH] [--full] [--anim] [--story] [--tut]
// Taps the real buttons (touch on phones, mouse on desktop). Default: title -> quick game -> 3 turns -> forced end -> result.
// --full: plays a whole game to the result screen. --story: story map + stage 1 played to its result. --tut: walks the tutorial.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const A = process.argv.slice(2), sz = (A.find(a => /^\d+x\d+$/.test(a)) || '390x763').split('x').map(Number), FULL = A.includes('--full'), STORY = A.includes('--story'), TUT = A.includes('--tut'), ANIM = A.includes('--anim');
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true }); let fails = 0; const log = [];
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else log.push(m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const touch = sz[0] < 900;
  const ctx = await b.newContext({ viewport: { width: sz[0], height: sz[1] }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(); const errs = [];
  await pg.addInitScript(p => { try { if (!sessionStorage.getItem('swinit')) { sessionStorage.setItem('swinit', '1'); localStorage.setItem('sw_seen', '1'); if (!p.anim) localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'off', ai: 'fast' })); } } catch (e) { } }, { anim: ANIM });
  pg.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); }); pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const cdp = await ctx.newCDPSession(pg);
  const tap = async el => { const bb = await el.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(60); } else await pg.mouse.click(x, y); };
  const tapSel = async s => { const el = await pg.$(s); if (!el) throw new Error('missing ' + s); await tap(el); };
  const waitMe = async () => { await pg.waitForFunction(() => !G || G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 60000 }); };
  const drag = async (x0, y0, x1, y1) => {
    if (!touch) { await pg.mouse.move(x0, y0); await pg.mouse.down(); for (let i = 1; i <= 6; i++) await pg.mouse.move(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6); await pg.mouse.up(); return; }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 6, y: y0 + (y1 - y0) * i / 6 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(900);
  };
  const base = process.env.URL || 'file://' + path.join(__dirname, 'stitchwise.html');
  const tag = sz.join('x') + (touch ? 't' : 'm');
  async function turn() { // one human turn by real taps; returns what was done
    await waitMe(); if (await pg.evaluate(() => G.over)) return 'over';
    if (await pg.evaluate(() => !!G.pend)) { const c = await pg.evaluate(() => G.board[0].findIndex(v => v === -1)); const cells = await pg.$$('#quilt .qc'); await tap(cells[c]); return 'leather'; }
    const pick = await pg.evaluate(() => { const m = aiMove(G, 'hard', () => .5); return m.t === 'buy' ? m.k : -1; });
    if (pick >= 0) {
      const offers = await pg.$$('#offers .offer'); await tap(offers[pick]); await pg.waitForSelector('#ghost', { timeout: 3000 });
      const q = await (await pg.$('#quilt')).boundingBox(); await drag(q.x + q.width * .2, q.y + q.height * .8, q.x + q.width * .55, q.y + q.height * .5);
      const valid = await pg.evaluate(() => ghostOk()); ok(valid, 'dropped patch snaps to a legal spot (' + tag + ')');
      const before = await pg.evaluate(() => G.owned[0].length); await tapSel('[data-a=sew]'); await pg.waitForFunction(n => G.owned[0].length === n + 1, before, { timeout: 5000 }).catch(async e => { console.log('buy stuck', JSON.stringify(await pg.evaluate(() => ({ sel: UI.sel, ok: ghostOk(), busy: UI.busy, gx: UI.gx, gy: UI.gy, o: UI.o, dis: document.querySelector('[data-a=sew]') && document.querySelector('[data-a=sew]').disabled, pend: G.pend, tut: UI.tutorial })))); await pg.screenshot({ path: path.join(OUT, tag + '-stuck.png') }); throw e; }); return 'buy';
    }
    await tapSel('[data-a=adv]'); return 'adv';
  }
  await pg.goto(base); await pg.waitForTimeout(500);
  if (!TUT && !STORY) {
    await tapSel('[data-a=quick]'); await pg.waitForTimeout(150); await pg.click('text=Normal computer'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => !!G && UI.started), 'game started from the title');
    const kinds = []; let n = 0;
    while (n < (FULL ? 200 : 3)) { const k = await turn(); if (k === 'over') break; kinds.push(k); n++; const e = await pg.evaluate(() => swCheck(G)); if (e) { ok(false, 'invariant ' + e); break; } if (n === 2) await pg.screenshot({ path: path.join(OUT, tag + '-mid.png') }); }
    ok(kinds.length > 0, 'played ' + kinds.length + ' turns: ' + kinds.slice(0, 12).join(','));
    if (!FULL) await pg.evaluate(() => { G.pos = [53, 53]; G.pend = null; G.pendQ = 0; G.over = true; G.ev = []; render(); schedule(); });
    await pg.waitForSelector('#rs:not([hidden]) .rvban.on .rvt1', { timeout: 30000 }); await pg.screenshot({ path: path.join(OUT, tag + '-result.png') });
    const res = await pg.evaluate(() => ({ t: document.querySelector('#rs .rvt1').textContent, a: swScore(G, 0).total, b: swScore(G, 1).total, shown: [...document.querySelectorAll('#rs .rvt')].map(e => e.textContent).join('|') + '|' + document.querySelector('#rs .rvt2').textContent }));
    ok(/win/i.test(res.t) && res.shown.indexOf(String(res.a)) >= 0 && res.shown.indexOf(String(res.b)) >= 0, 'result screen shows both totals: ' + res.t + ' ' + res.a + ' v ' + res.b);
    await tapSel('#rs [data-a=again]'); await pg.waitForTimeout(300); ok(await pg.evaluate(() => !!G && !G.over && UI.started), 'Play again starts a new game');
    await pg.evaluate(() => { GX.show('rulesd'); }); await pg.waitForTimeout(250); ok(await pg.evaluate(() => document.querySelector('#rulesd').classList.contains('on')), 'rules drawer opens'); await pg.keyboard.press('Escape');
  }
  if (TUT) {
    await tapSel('[data-gxt-open]'); await pg.waitForTimeout(600); let steps = 0;
    for (let i = 0; i < 40; i++) {
      const st = await pg.evaluate(() => { const c = typeof GXT !== 'undefined' && GXT.active() && GXT.current && GXT.current(); return c ? { id: c.id } : null; });
      if (!st) { if (!(await pg.evaluate(() => GXT.active()))) break; await pg.waitForTimeout(300); continue; }
      steps++; await pg.waitForTimeout(600);
      try {
        if (st.id === 'pick') await tap((await pg.$$('#offers .offer'))[2]);
        else if (st.id === 'drag') { const q = await (await pg.$('#quilt')).boundingBox(); await drag(q.x + q.width * .3, q.y + q.height * .8, q.x + q.width * .35, q.y + q.height * .4); }
        else if (st.id === 'sew') await tapSel('[data-a=sew]'); else if (st.id === 'adv') await tapSel('[data-a=advance],[data-a=adv]');
        else { const nx = await pg.waitForSelector('.gxt-next', { timeout: 12000 }).catch(() => null); if (nx) await tap(nx); }
      } catch (e) { console.log('tutorial step', st.id, e.message); }
      if (steps === 5) await pg.screenshot({ path: path.join(OUT, tag + '-tut.png') });
      await pg.waitForFunction(id => { const c = GXT.current && GXT.current(); return !GXT.active() || !c || c.id !== id; }, st.id, { timeout: 15000 }).catch(() => { ok(false, 'tutorial stuck on ' + st.id); });
      if (fails) { await pg.screenshot({ path: path.join(OUT, tag + '-tut-stuck.png') }); break; }
    }
    ok(steps >= 12, 'tutorial walked ' + steps + ' steps');
  }
  if (STORY) {
    await pg.evaluate(() => { try { GXT.markDone('stitchwise'); } catch (e) { } }); await tapSel('[data-a=story]'); await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(OUT, tag + '-map.png') });
    await pg.evaluate(() => GXC.play('c1'));
    for (let i = 0; i < 14; i++) {
      if (await pg.evaluate(() => !!G && UI.started && !!UI.camp)) break;
      const sk = await pg.$('.gxc button:has-text("Skip"), .gxc button:has-text("Next"), .gxc button:has-text("Start"), .gxc button:has-text("Play"), .gxc button:has-text("Begin"), .gxc button:has-text("Let")'); if (sk) await tap(sk); await pg.waitForTimeout(500);
    }
    ok(await pg.evaluate(() => !!UI.camp), 'story stage c1 started'); let n = 0; while (n++ < 200) { const k = await turn(); if (k === 'over') break; }
    await pg.waitForTimeout(2500); await pg.screenshot({ path: path.join(OUT, tag + '-story-c1.png') });
    const pr = await pg.evaluate(() => GXC.progress()); ok(pr && pr.ch && pr.ch.c1 && pr.ch.c1.tries >= 1, 'story progress saved after stage 1: ' + JSON.stringify(pr && pr.ch && pr.ch.c1));
  }
  const bad = errs.filter(e => !/favicon|manifest/.test(e)); ok(bad.length === 0, 'no page errors ' + JSON.stringify(bad.slice(0, 3)));
  console.log((fails ? 'FAIL ' : 'PASS ') + 'smoke ' + tag + ' (' + log.length + ' checks)'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL smoke crashed:', e.message); process.exit(1); });
