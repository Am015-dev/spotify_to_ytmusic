// F3: PC by mouse: node pc-mouse.js [WxH] [--shots DIR]. Title -> quick game -> drag a patch with the mouse, Rotate, Flip, Sew,
// Advance, rival quilt, Rules/Patches/Menu, a whole game by mouse to the result, Play again. Fails on text under 12 px, a control
// outside the window, or the rival quilt cut off.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const A = process.argv.slice(2), sz = (A.find(a => /^\d+x\d+$/.test(a)) || '1366x768').split('x').map(Number);
const SH = A.includes('--shots') ? A[A.indexOf('--shots') + 1] : null; if (SH) fs.mkdirSync(SH, { recursive: true });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: sz[0], height: sz[1] }, deviceScaleFactor: SH ? 2 : 1 }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { try { if (!sessionStorage.getItem('pcm')) { sessionStorage.setItem('pcm', '1'); localStorage.clear(); localStorage.setItem('sw_seen', '1'); localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'off', ai: 'fast' })); } } catch (e) { } });
  await pg.goto(process.env.URL || 'file://' + path.join(__dirname, 'stitchwise.html')); await pg.waitForTimeout(700);
  const click = async sel => { const el = await pg.$(sel); if (!el) { ok(false, 'missing ' + sel); return false; } const bb = await el.boundingBox(); ok(bb && bb.x >= 0 && bb.y >= 0 && bb.x + bb.width <= sz[0] + 1 && bb.y + bb.height <= sz[1] + 1, sel + ' inside the window'); await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(250); return true; };
  const myTurn = () => pg.waitForFunction(() => G && (G.over || (!UI.busy && swWho(G) === 0)), null, { timeout: 30000 }).catch(() => {});
  const small = async tag => { const r = await pg.evaluate(() => { const bad = []; document.querySelectorAll('body *').forEach(e => { if (e.closest('[hidden],#toast')) return; const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!t) return; const r = e.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity === 0) return; const f = parseFloat(getComputedStyle(e).fontSize); if (f < 12) bad.push(e.tagName + '.' + e.className + ' ' + f + 'px "' + e.textContent.trim().slice(0, 20) + '"'); }); return bad; }); ok(!r.length, tag + ': text under 12 px: ' + r.slice(0, 5).join(' | ')); };
  const shot = async n => { if (SH) await pg.screenshot({ path: path.join(SH, n + '-' + sz[0] + 'x' + sz[1] + '.png') }); };
  await small('title');
  await click('[data-a=start]'); await pg.click('text=Normal computer'); await pg.waitForTimeout(400);
  if (await pg.$('#goalcard [data-a=goalok]')) await click('#goalcard [data-a=goalok]');
  await myTurn(); await pg.waitForTimeout(900); ok(await pg.evaluate(() => document.documentElement.classList.contains('swpc')), 'PC layout is on');
  await small('play'); await shot('pc-play');
  // rival quilt visible in full with its income
  const oq = await pg.evaluate(() => { const q = document.querySelector('.oppq'), w = document.querySelector('.oppwrap'); if (!q) return null; const r = q.getBoundingClientRect(), s = document.querySelector('#side').getBoundingClientRect(); return { inside: r.bottom <= s.bottom + 1 && r.bottom <= innerHeight, cs: r.width / 9, txt: w.textContent }; });
  ok(oq && oq.inside && oq.cs >= 12, 'rival quilt fully visible: ' + JSON.stringify(oq)); ok(oq && /income/.test(oq.txt), 'rival income shown');
  // buy by mouse: click an offer, drag the ghost, rotate, flip, sew
  for (let k = 0; k < 6 && !(await pg.$('#offers .offer.can')); k++) { await click('[data-a=adv]'); await myTurn(); await pg.waitForTimeout(300); } /* nothing affordable: advance until something is */
  await click('#offers .offer.can'); await pg.waitForTimeout(300);
  if (await pg.$('[data-a=sugok]')) { const q = await (await pg.$('#quilt')).boundingBox(); await pg.mouse.click(q.x + q.width * .5, q.y + q.height * .5); await pg.waitForTimeout(300); }
  const g = await pg.$('#ghost'); ok(!!g, 'ghost on the quilt');
  if (g) { const gb = await g.boundingBox(), q = await (await pg.$('#quilt')).boundingBox(), cs = q.width / 9; const x0 = gb.x + Math.min(cs / 2, gb.width / 2), y0 = gb.y + Math.min(cs / 2, gb.height / 2); const p0 = await pg.evaluate(() => [UI.gx, UI.gy]);
    await pg.mouse.move(x0, y0); await pg.mouse.down(); for (let i = 1; i <= 8; i++) await pg.mouse.move(x0 + i * cs * 0.25, y0 + i * cs * 0.25); await pg.mouse.up(); await pg.waitForTimeout(500);
    const p1 = await pg.evaluate(() => [UI.gx, UI.gy]); ok(p1[0] !== p0[0] || p1[1] !== p0[1], 'mouse drag moved the patch ' + p0 + ' -> ' + p1); }
  await click('[data-a=rot]'); await click('[data-a=flip]'); await shot('pc-place'); await small('placing');
  const nb = await pg.evaluate(() => G.owned[0].length); await pg.evaluate(() => { if (!canSew()) snapNear(); render(); });
  await click('[data-a=sew]'); await pg.waitForTimeout(600); ok(await pg.evaluate(n => G.owned[0].length === n + 1, nb), 'Sew by mouse buys the patch');
  await myTurn();
  // Advance by mouse, the button says what it gains
  const at = await pg.$eval('[data-a=adv]', e => e.textContent).catch(() => ''); ok(/Advance \+\d+ button/.test(at) && /(past|payday|end)/.test(at), 'Advance says what it gains: ' + at);
  const p0 = await pg.evaluate(() => G.pos[0]); await click('[data-a=adv]'); await pg.waitForTimeout(500); ok(await pg.evaluate(p => G.pos[0] > p, p0), 'Advance by mouse moves the token');
  await myTurn();
  // rival quilt drawer, rules, patches, menu by mouse; Esc closes
  await click('.oppq'); await pg.waitForTimeout(400); ok(await pg.evaluate(() => !!document.querySelector('#oppd .oppwhy, .gx-drawer.open .oppwhy, #scored') || !!document.querySelector('.gx-drawer[aria-hidden=false]')), 'rival quilt opens');
  await shot('pc-rival'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  for (const s of ['[data-gx=rulesd]', '[data-gx=patchd]', '[data-gx=setd]']) { await click(s); await pg.waitForTimeout(300); await small('drawer ' + s); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); }
  // a whole game by mouse
  let n = 0;
  while (n++ < 160) { await myTurn(); const st = await pg.evaluate(() => ({ over: G.over, pend: !!G.pend, can: document.querySelectorAll('#offers .offer.can').length })); if (st.over) break;
    if (st.pend) { const c = await pg.evaluate(() => { const i = G.board[0].findIndex(v => v === -1); const q = document.querySelector('#quilt').getBoundingClientRect(), cs = q.width / 9; return [q.left + ((i % 9) + .5) * cs, q.top + (((i / 9) | 0) + .5) * cs]; }); await pg.mouse.click(c[0], c[1]); await pg.waitForTimeout(400); continue; }
    if (st.can && n % 3) { await click('#offers .offer.can'); if (await pg.$('[data-a=sugok]')) await click('[data-a=sugok]'); await pg.evaluate(() => { if (!canSew()) snapNear(); renderDockLight(); }); if (await pg.$('[data-a=sew]:not([disabled])')) await click('[data-a=sew]'); else await click('[data-a=cancel]'); }
    else await click('[data-a=adv]');
    await pg.waitForTimeout(150); }
  await pg.waitForSelector('#rs:not([hidden]) .rvban.on .rvt1', { timeout: 30000 }).catch(() => ok(false, 'result screen'));
  ok(!(await pg.$('#rs .rvskip')), 'no Skip button on the result'); await small('result'); await shot('pc-result');
  const why = await pg.$eval('#rs .rvt3.why', e => e.textContent).catch(() => ''); ok(/Paydays paid/.test(why), 'result says why: ' + why);
  await click('#rs [data-a=again]'); await pg.waitForTimeout(600); ok(await pg.evaluate(() => !!G && !G.over && UI.started), 'Play again by mouse');
  ok(!errs.length, 'no page errors: ' + errs.join(' | '));
  console.log((fails ? 'FAIL' : 'PASS') + ' pc-mouse ' + sz.join('x') + ': ' + fails + ' failures, game turns ' + n); await b.close(); process.exit(fails ? 1 : 0);
})();
