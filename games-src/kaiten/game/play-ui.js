// UI-only play (W394): a Quick game and Story stage 1 played to the result by TAPS ON VISIBLE, UNCOVERED UI at 390x763 (no engine shortcuts:
// every tap is a touchscreen tap at the centre of an element whose elementFromPoint is that element). Only pre-seeded storage: tutorial marked done.
//   node play-ui.js     prints PASS/FAIL lines, exit 1 on a problem
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const note = (t, m) => probs.push(t + ': ' + m);
const SHOTS = process.env.SHOTS || '';
async function mk(b, seedDone) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) errs.push(m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?phone=1'); await sleep(700);
  await p.evaluate(done => { try { localStorage.clear(); if (done) localStorage.setItem('gxt-kaiten-kitchen', JSON.stringify({ done: true })); } catch (e) { } }, seedDone); await p.reload(); await sleep(900);
  return { ctx, p, errs };
}
// tap the first element matching sel that is visible AND uncovered at its centre; returns false when none
async function tapSel(p, sel) {
  const pt = await p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || e.disabled || e.closest('[hidden]')) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y]; } return null; }, sel);
  if (!pt) return false; await p.touchscreen.tap(pt[0], pt[1]); return true;
}
async function playMeal(p, tag, until) {
  await p.evaluate(() => { AIDELAY = 160; });   // timing only: the animations still play, just a little quicker
  const t0 = Date.now(); let taps = 0, picks = 0, lastSig = '', lastT = Date.now();
  while (Date.now() - t0 < 420000) {
    if (await until()) return { picks, taps };
    const sig = await p.evaluate(() => G ? [G.round, G.turn, G.phase, UI.busy ? 1 : 0, UI.cards.length, !document.querySelector('#rs').hidden ? 1 : 0].join('.') : 'none');
    if (sig !== lastSig) { lastSig = sig; lastT = Date.now(); } else if (Date.now() - lastT > 20000) { const top = await p.evaluate(() => { const b = document.querySelector('#belt .hc[data-up="1"]'); if (!b) return 'no glowing dish; canPick=' + canPick() + ' busy=' + UI.busy + ' cards=' + UI.cards.length; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e ? (e.id || String(e.className) || e.tagName) : 'none'; }); note(tag, 'stuck at ' + sig + ' (on top of the hand: ' + top + ')'); return { picks, taps }; }
    // order: step cards / drawers in the way, score pad buttons, then the hand
    if (await tapSel(p, '#kkgoal .kgo')) { taps++; await sleep(300); continue; }   // the Goal card (how you win) waits for a tap, like any player gives it
    if (await tapSel(p, '#pc [data-a=take],#pc [data-a=cont]')) { taps++; await sleep(250); continue; }
    if (await tapSel(p, '.gxh-bub.on .gxh-x,.gxh-bub.on [data-gxh=ok],.gxh-bub.on button')) { taps++; await sleep(250); continue; }
    if (await tapSel(p, '#rs [data-a=rsnext]')) { taps++; await sleep(350); continue; }
    const mine = await p.evaluate(() => !!G && G.phase === 'pick' && canPick() && !UI.busy && !UI.cards.length && document.querySelector('#rs').hidden && !document.querySelector('.gx-drawer.on'));
    if (mine) { const n = await p.evaluate(() => document.querySelectorAll('#belt .hc[data-up="1"]').length); const k = Math.floor(Math.random() * Math.max(1, n));
      if (await tapSel(p, '#belt .hc[data-up="1"]:nth-of-type(' + (k + 1) + ')') || await tapSel(p, '#belt .hc[data-up="1"]')) { picks++; taps++; await sleep(500); continue; } }
    await sleep(150);
  }
  note(tag, 'timeout'); return { picks, taps };
}
(async () => { const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  // ---- Quick game: title -> Play -> Normal game -> all three rounds -> result card
  { const tag = 'quick'; const { ctx, p, errs } = await mk(b, true);
    if (!await tapSel(p, '#start .ttl [data-a=play]')) note(tag, 'no Play on the title'); await sleep(500);
    if (!await tapSel(p, '#start [data-start=vs]')) note(tag, 'no Normal game button'); await sleep(1200);
    if (!await tapSel(p, '#kkgoal .kgo')) note(tag, 'no Goal card at the start'); await sleep(400);
    const r = await playMeal(p, tag, async () => p.evaluate(() => !!G && G.phase === 'over' && !!document.querySelector('#rs .kkres')));
    const res = await p.evaluate(() => { const c = document.querySelector('#rs .kkres'); return c && { t: c.innerText, again: !!document.querySelector('#rs [data-a=again]') }; });
    if (!res) note(tag, 'no result card'); else if (!res.again) note(tag, 'no Play again button');
    if (SHOTS && res) await p.screenshot({ path: path.join(SHOTS, 'result.png') });
    if (errs.length) note(tag, 'console errors: ' + errs.slice(0, 3).join(' | '));
    console.log((probs.some(x => x.startsWith(tag)) ? 'FAIL' : 'PASS') + ' quick game by UI taps, ' + r.picks + ' picks, ' + r.taps + ' taps'); await ctx.close(); }
  // ---- Story stage 1: title -> Story -> chapter 1 -> intro -> meal -> outro -> result
  { const tag = 'story'; const { ctx, p, errs } = await mk(b, true);
    if (!await tapSel(p, '#start .tbtn.story')) note(tag, 'no Story button'); await sleep(900);
    if (!await tapSel(p, '.gxc-node')) note(tag, 'no chapter node on the map'); await sleep(600);
    if (!await tapSel(p, '.gxc-btn.go')) note(tag, 'no Play on the chapter sheet'); await sleep(800);
    let intro = 0; for (let k = 0; k < 12; k++) { const sc = await p.evaluate(() => !!document.querySelector('.gxc-scene-on')); if (!sc) break; if (!await tapSel(p, '.gxc-scene-on .gxc-btn.go')) await sleep(300); else intro++; await sleep(500); }
    if (intro < 2) note(tag, 'chapter intro scene had ' + intro + ' beats');
    const r = await playMeal(p, tag, async () => p.evaluate(() => !!document.querySelector('.gxc-res-on')));
    const res = await p.evaluate(() => { const c = document.querySelector('.gxc-res-on'); return c && c.innerText.replace(/\n+/g, ' / ').slice(0, 160); });
    if (!res) note(tag, 'no stage result screen'); else if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'story-result.png') });
    if (errs.length) note(tag, 'console errors: ' + errs.slice(0, 3).join(' | '));
    console.log((probs.some(x => x.startsWith(tag)) ? 'FAIL' : 'PASS') + ' story stage 1 by UI taps, ' + r.picks + ' picks, result: ' + res); await ctx.close(); }
  await b.close(); console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0); })();
