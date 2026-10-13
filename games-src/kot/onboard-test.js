// Crown City Smash: play ON the board. Drives a real turn with taps on the board controls (no panel), at 390x763, 375x553, 844x390, 1280x800.
//   NODE_PATH=/opt/node-tools/node_modules node onboard-test.js      env: FILE=kot2.html  SHOTS=playtest  ONLY=390,375,844,1280
// Per size: SMASH! hangs over the city and is tappable; dice keep/roll/smash work from the board; the painted cards for sale sit on the board
// (hold shows the big card and does not buy; tap buys, twice on touch); End turn is on the board; the panel is not needed (it is hidden for the whole turn).
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs'), http = require('http');
const E = process.env, FILE = path.resolve(E.FILE || path.join(__dirname, 'kot2.html')), LIVE = path.resolve(__dirname, '../../games/crown-city-smash');
const SHOTS = path.resolve(E.SHOTS || path.join(__dirname, 'playtest')); fs.mkdirSync(SHOTS, { recursive: true });
const ONLY = (E.ONLY || '390,375,844,1280').split(',');
const SIZES = { 390: [390, 763, 1], 375: [375, 553, 1], 844: [844, 390, 1], 1280: [1280, 800, 0] };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  if ((!f.startsWith(LIVE) && f !== FILE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end() }
  r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.webp') ? 'image/webp' : f.endsWith('.mp4') ? 'video/mp4' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream' }); r.end(fs.readFileSync(f)) });
let bad = 0; const fail = (t, m) => { bad++; console.log('FAIL', t, m) }, ok = (t, m) => console.log('ok  ', t, m || '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r)); const BASE = 'http://127.0.0.1:' + srv.address().port;
  const b = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  for (const key of ONLY) {
    const [W, H, touch] = SIZES[key], tag = W + 'x' + H;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !!touch, isMobile: !!touch, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('ccs_tour2', '1'); localStorage.setItem('ccs_bf1', JSON.stringify({ keep: 1, roll: 1, done: 1, buy: 1 })) } catch (e) { } });
    const p = await ctx.newPage(); p.setDefaultTimeout(60000); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g|404|WebGL|certificate/i.test(m.text())) errs.push('console ' + m.text()) });
    const tap = async sel => { const el = await p.$(sel); if (!el) throw new Error('no ' + sel); const r = await el.boundingBox(); if (touch) await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2) };
    const shot = n => p.screenshot({ path: path.join(SHOTS, `crown-board-${W}-${n}.png`) });
    await p.goto(BASE + '/?gfx=low' + (touch ? '' : '&phone=0')); await p.waitForSelector('[data-start]'); await p.waitForTimeout(1500);
    await p.evaluate(() => { AIDELAY = 150; UI.n = 4 }); await p.click('[data-start="solo"]'); await sleep(900);
    for (let i = 0; i < 40; i++) { const st = await p.evaluate(() => ({ ht: humanTurn(), ph: G.phase, busy: !!UI.busy, ch: !!UI.choice, intro: !!UI.intro, rolls: G.rolls, nd: G.dice.length })); if (st.intro) { const bt = await p.$('[data-a="story"]'); if (bt) await bt.click(); await sleep(300); continue } if (st.ch) { const o = await p.$('#choice [data-opt]'); if (o) await o.click(); await sleep(300); continue } if (st.ht && st.ph === 'roll' && !st.busy && st.nd === 6) break; await sleep(300) }
    await sleep(1200);
    // layout: everything we need is inside the board
    const L = await p.evaluate(() => { const bd = document.querySelector('[data-board]').getBoundingClientRect(); const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } : null };
      return { bd: { l: bd.left, t: bd.top, r: bd.right, b: bd.bottom }, smash: q('#ob [data-act="resolve"]'), roll: q('#ob [data-act="reroll"]'), die0: q('#ob #dice .die[data-die="0"]'), die5: q('#ob #dice .die[data-die="5"]'), dockDice: q('.gx-dock #dice'), dockActs: q('.gx-dock #pacts'), dockW: q('.gx-dock'), vw: innerWidth, vh: innerHeight, hs: document.documentElement.scrollWidth > innerWidth + 1 } });
    const inB = r => r && r.l >= L.bd.l - 1 && r.r <= L.bd.r + 1 && r.t >= L.bd.t - 1 && r.b <= L.bd.b + 1;
    for (const k of ['smash', 'roll', 'die0', 'die5']) { if (!L[k]) fail(tag, k + ' not visible'); else if (!inB(L[k])) fail(tag, k + ' outside the board ' + JSON.stringify(L[k])) }
    if (L.dockDice || L.dockActs) fail(tag, 'dice/buttons still in the panel'); if (L.hs) fail(tag, 'horizontal scroll');
    if (L.smash && L.roll && !(L.smash.b < L.roll.t || L.smash.t > L.roll.b || L.smash.r < L.roll.l || L.smash.l > L.roll.r)) fail(tag, 'SMASH overlaps Roll');
    if (L.smash && L.die0 && !(L.smash.b < L.die0.t || L.smash.t > L.die0.b || L.smash.r < L.die0.l || L.smash.l > L.die5.r)) fail(tag, 'SMASH overlaps the dice');
    await shot('1-dice');
    // keep a die, roll, smash: all with taps on the board
    await tap('#ob #dice .die[data-die="0"]'); await sleep(250);
    const kept = await p.evaluate(() => G.dice[0].k); kept ? ok(tag, 'tap a die keeps it') : fail(tag, 'die did not keep');
    const r0 = await p.evaluate(() => G.rolls); await tap('#ob [data-act="reroll"]'); await sleep(1500);
    const r1 = await p.evaluate(() => G.rolls); if (r1 === r0) console.log('   dbg', JSON.stringify(await p.evaluate(() => { const e = document.querySelector('#ob [data-act="reroll"]'); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { dis: e.disabled, by: t && (t.id || t.className), ph: G.phase, busy: UI.busy, pend: UI.pending, cls: e.className } }))); r1 === r0 - 1 ? ok(tag, 'Roll works from the board') : fail(tag, 'Roll did nothing ' + r0 + '->' + r1);
    await shot('2-after-roll');
    await p.evaluate(() => { const q = G.pl[G.active]; q.en = Math.max(q.en, 9) });
    await tap('#ob [data-act="resolve"]');
    for (let i = 0; i < 60; i++) { const st = await p.evaluate(() => ({ ph: G.phase, ht: humanTurn(), busy: !!UI.busy, ch: !!UI.choice })); if (st.ph === 'buy' && st.ht && !st.busy) break; await sleep(250) }
    await sleep(900);
    const bp = await p.evaluate(() => G.phase); bp === 'buy' ? ok(tag, 'SMASH! on the city resolves the dice') : fail(tag, 'SMASH did not resolve: ' + bp);
    await p.evaluate(() => { const q = cur(); q.en = Math.max(q.en, 9); render() }); await sleep(500);
    const M = await p.evaluate(() => { const bd = document.querySelector('[data-board]').getBoundingClientRect(); return [...document.querySelectorAll('#ob #pshop .obc')].map(e => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height, img: !!e.querySelector('img.cpic'), ok: e.classList.contains('ok') } }).concat([{ bd: [bd.left, bd.top, bd.right, bd.bottom] }]) });
    const bdr = M.pop().bd; if (M.length < 2) fail(tag, 'market cards on the board: ' + M.length); else ok(tag, M.length + ' cards on the board, ' + Math.round(M[0].w) + 'x' + Math.round(M[0].h) + (M[0].img ? ' painted' : ' (no painting)'));
    for (const c of M) if (c.l < bdr[0] - 1 || c.r > bdr[2] + 1 || c.b > bdr[3] + 1) fail(tag, 'card outside the board');
    if (!(await p.$('#ob [data-act="end"]'))) fail(tag, 'End turn not on the board');
    await shot('3-market');
    // hold a card: the big card shows and nothing is bought
    const c0 = await p.evaluate(() => G.pl[G.active].cards.length + 100 * G.pl[G.active].en); const cb = await (await p.$('#ob #pshop .obc')).boundingBox();
    if (touch) { const cd = await ctx.newCDPSession(p); const x = cb.x + cb.width / 2, y = cb.y + cb.height / 2;
      await cd.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(650); const on = await p.evaluate(() => document.getElementById('obcard').classList.contains('on')); on ? ok(tag, 'hold shows the big card') : fail(tag, 'hold did not show the card'); await shot('4-hold');
      await cd.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400) }
    else { await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(700); const on = await p.evaluate(() => document.getElementById('obcard').classList.contains('on')); on ? ok(tag, 'hover shows the big card') : fail(tag, 'hover did not show the card'); await shot('4-hold'); await p.mouse.move(5, 5); await sleep(300) }
    const off = await p.evaluate(() => !document.getElementById('obcard').classList.contains('on')); off || fail(tag, 'big card stayed');
    const c1 = await p.evaluate(() => G.pl[G.active].cards.length + 100 * G.pl[G.active].en); c1 === c0 ? ok(tag, 'holding does not buy') : fail(tag, 'a hold bought a card');
    // tap to buy (touch: twice)
    const k = await p.evaluate(() => { const q = cur(), sg = suggestCard(q); const a = G.market.map((_, j) => j).filter(j => canBuy(q, j)); return a.find(j => j !== sg) ?? a[0] ?? -1 }); if (k < 0) fail(tag, 'nothing affordable to buy');
    else { await tap(`#ob #pshop [data-shop="${k}"]`); await sleep(500); if (touch) { const sel = await p.evaluate(() => BF.sel); sel === k ? ok(tag, 'first tap picks the card') : fail(tag, 'first tap did not pick'); await shot('5-picked'); await tap(`#ob #pshop [data-shop="${k}"]`); await sleep(900) }
      const c2 = await p.evaluate(() => G.pl[G.active].cards.length + 100 * G.pl[G.active].en); c2 !== c0 ? ok(tag, 'tap buys from the board') : fail(tag, 'card not bought ' + c0 + '->' + c2); await shot('6-bought') }
    await tap('#ob [data-act="end"]'); await sleep(2500); await shot('7-bots');
    const own = await p.evaluate(() => document.querySelectorAll('#ob #obown .obo').length === G.pl.find(q => q.human).cards.length ? 9 : 0); own ? ok(tag, 'owned cards show on the board (' + own + ')') : fail(tag, 'owned cards missing');
    if (errs.length) fail(tag, 'errors: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); srv.close(); console.log(bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);
})();
