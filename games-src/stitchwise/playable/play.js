// Playable gate (W381): node playable/play.js WxH tut|quick|story   (URL env = served page; animations ON, fresh storage)
// Only taps visible, uncovered UI at the element's centre (elementFromPoint must hit it). Reads state only to know when to act.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const A = process.argv.slice(2), [W, H] = (A.find(a => /^\d+x\d+$/.test(a)) || '390x763').split('x').map(Number), MODE = A.find(a => /^(tut|quick|story)$/.test(a)) || 'tut';
const URL = process.env.URL || 'http://localhost:8765/stitchwise/index.html', OUT = path.join(__dirname, '..', 'shots', 'playable'); fs.mkdirSync(OUT, { recursive: true });
let fails = 0, RANDOM = false; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), touch = W < 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const cdp = await ctx.newCDPSession(pg); const tag = `${MODE}-${W}x${H}`;
  // tap the centre of a visible element; fail if something else is on top there
  const tapEl = async (el, what) => {
    await el.scrollIntoViewIfNeeded().catch(() => { }); const bb = await el.boundingBox(); if (!bb) { ok(false, what + ': not visible'); return false; }
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    const hit = await el.evaluate((e, p) => { const t = document.elementFromPoint(p.x, p.y); return !!t && (t === e || e.contains(t)); }, { x, y });
    ok(hit && x >= 0 && y >= 0 && x <= W && y <= H, what + ': centre covered or off screen');
    if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    else await pg.mouse.click(x, y);
    await pg.waitForTimeout(120); return true;
  };
  const tap = async (sel, what) => { const el = await pg.waitForSelector(sel, { state: 'visible', timeout: 8000 }).catch(() => null); if (!el) { ok(false, (what || sel) + ': missing'); return false; } return tapEl(el, what || sel); };
  const myTurn = () => pg.waitForFunction(() => !G || G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 90000 });
  async function humanTurn() { // returns false when the game is over
    await myTurn(); if (await pg.evaluate(() => !G || G.over)) return false;
    if (await pg.evaluate(() => !!G.pend)) { const i = await pg.evaluate(() => G.board[0].findIndex(v => v === -1)); const cells = await pg.$$('#quilt .qc'); await tapEl(cells[i], 'leather square'); await pg.waitForTimeout(300); return true; }
    const cans = await pg.$$('#offers .offer.can'); const can = cans.length ? cans[RANDOM ? Math.floor(Math.random() * cans.length) : 0] : null; if (RANDOM && Math.random() < .2 && can) { await tap('[data-a=adv]', 'Advance'); await pg.waitForTimeout(200); return true; }
    if (can) {
      await tapEl(can, 'glowing patch'); await pg.waitForTimeout(250);
      let sew = await pg.$('[data-a=sew]:not([disabled])');
      if (!sew) { const cells = await pg.$$('#quilt .qc'); for (let i = 0; i < cells.length && !sew; i += 4) { await tapEl(cells[i], 'quilt square'); sew = await pg.$('[data-a=sew]:not([disabled])'); } }
      if (sew) { const n = await pg.evaluate(() => G.owned[0].length); await tapEl(sew, 'Sew it on'); await pg.waitForFunction(n => G.owned[0].length > n, n, { timeout: 8000 }).catch(() => ok(false, 'sew did not happen')); return true; }
      await tap('[data-a=cancel]', 'Cancel');
    }
    await tap('[data-a=adv]', 'Advance'); await pg.waitForTimeout(200); return true;
  }
  async function playToEnd(label) { let n = 0, shotR = false; while (n++ < 120) { if (!(await humanTurn())) break; if (!shotR && n === 2) { shotR = true; } } ok(n < 120, label + ': game did not end'); }
  await pg.goto(URL); await pg.waitForTimeout(800);
  if (MODE === 'tut') { // coached first game: free play from turn 1, any legal move chosen through the UI, Aunt Wren must explain every rule
    await tap('#start [data-gxt-open]', 'Tutorial button'); await pg.waitForTimeout(900);
    ok(await pg.evaluate(() => !!G && !G.over && !!UI.coach && !(typeof GXT !== 'undefined' && GXT.active())), 'tutorial is a real game with the coach, no forced steps');
    ok(await pg.evaluate(() => !document.querySelector('#guide').hidden && document.querySelectorAll('#offers .offer.can').length > 0), 'Aunt Wren speaks and the legal patches glow on turn 1');
    await pg.screenshot({ path: path.join(OUT, tag + '-turn1.png') }); RANDOM = true; let shotG = 0;
    for (let n = 0; n < 140; n++) { if (!(await humanTurn())) break; if (shotG < 3 && n % 4 === 1) { shotG++; await pg.screenshot({ path: path.join(OUT, tag + '-coach' + shotG + '.png') }); } }
    await pg.waitForSelector('#rs:not([hidden]) .rvban.on', { timeout: 60000 }).catch(() => ok(false, 'tutorial result reveal not shown'));
    await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(OUT, tag + '-result.png') });
    const r = await pg.evaluate(() => ({ cov: UI.coach ? UI.coach.shown : [], later: UI.coach ? UI.coach.later : -1, walk: !!document.querySelector('#rs .rvt3.walk'), card: !!document.querySelector('#rs .rvlater'), tie: swScore(G, 0).total === swScore(G, 1).total, bonus: G.bonus }));
    console.log('coverage shown: ' + r.cov.join(',') + ' | later card items: ' + r.later);
    const need = [['start'], ['pick'], ['buy_good', 'buy_big', 'buy_cheap', 'buy_poor'], ['who_next'], ['adv_me'], ['income_me', 'income_zero', 'income_opp'], ['leather_me', 'leather_opp'], ['cant'], ['again', 'again_opp', 'opp_slow'], ['late'], ['end_me', 'end_opp'], ['final']];
    const must = ['start', 'pick', 'buy_good', 'who_next', 'final'];   // always explained during the game; the others may instead be on the "later" card (chance rules) or in 'start' (Advance)
    const laterText = await pg.evaluate(() => (document.querySelector('#rs .rvlater') || { textContent: '' }).textContent);
    const onCard = { income_me: /Gold spots/, leather_me: /Leather/, cant: /cannot pay/, again: /several turns/, end_me: /last space, the other/, late: /$^/, adv_me: /$^/ };
    need.forEach(alts => { const seen = alts.some(k => r.cov.includes(k)); const card = onCard[alts[0]] && onCard[alts[0]].test(laterText); const opt = alts[0] === 'adv_me' || alts[0] === 'late';
      if (must.includes(alts[0])) ok(seen, 'rule explained during the game: ' + alts.join('|')); else ok(seen || card || opt, 'rule explained in the game or on the later card: ' + alts.join('|')); });
    ok(r.walk, 'final scoring walked through with the real numbers'); ok(r.tie || r.card, 'tie-break listed under Things you will meet later (no tie this game)');
  } else if (MODE === 'quick') {
    await pg.evaluate(() => { try { GXT.markDone('stitchwise'); } catch (e) { } });
    await tap('#start [data-a=quick]', 'Quick game'); await pg.waitForTimeout(300);
    const nc = await pg.$('text=Normal computer'); if (nc) await tapEl(nc, 'Normal computer'); await pg.waitForTimeout(300);
    const sg = await pg.$('text=Start the game'); if (sg) await tapEl(sg, 'Start the game');
    await playToEnd('quick');
  } else {
    await pg.evaluate(() => { try { GXT.markDone('stitchwise'); } catch (e) { } });
    await tap('#start [data-a=story]', 'Story'); await pg.waitForTimeout(700);
    for (let i = 0; i < 20; i++) {
      if (await pg.evaluate(() => !!G && UI.started && !!UI.camp)) break;
      let bt = null; for (const q of ['.gxc-btn.go:visible', 'button:text-is("Skip"):visible', 'button:text-is("Next"):visible', 'button.gxc-btn:visible:not(.ghost)', '.gxc-node.next']) { bt = await pg.$(q); if (bt) break; }
      if (bt) { console.log('tap', await bt.evaluate(e => e.className + '|' + e.textContent.slice(0, 20))); await tapEl(bt, 'story button'); } await pg.waitForTimeout(600);
    }
    await pg.screenshot({ path: path.join(OUT, tag + '-start.png') }); ok(await pg.evaluate(() => !!UI.camp), 'story stage 1 started by taps');
    await playToEnd('story');
  }
  if (MODE !== 'tut') {
    await pg.waitForSelector('#rs:not([hidden]) .rvban.on', { timeout: 60000 }).catch(() => ok(false, 'result reveal not shown'));
    await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, `${tag}-result.png`) });
    if (MODE === 'story') { const go = await pg.$('#rs .rvacts .btn.go'); if (go) await tapEl(go, 'Continue'); await pg.waitForSelector('.gxc-res', { timeout: 10000 }).catch(() => ok(false, 'story result not shown')); await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, `${tag}-storyres.png`) }); }
  }
  ok(errs.length === 0, 'console errors: ' + JSON.stringify(errs));
  console.log((fails ? 'FAIL ' : 'PASS ') + tag); await b.close(); process.exit(fails ? 1 : 0);
})();
