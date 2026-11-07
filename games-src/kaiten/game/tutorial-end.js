// Coached first game, played to the end (W394b): from FRESH storage, at 390x763 (touch) and 1440x860 (mouse), by choosing ANY legal move through the UI
// (a random visible hand card each turn, whatever the coach says; no scripted tap list), then the end card.
//   node tutorial-end.js [sizes=390x763,1440x860]     prints PASS/FAIL lines, exit 1 on a problem
// Asserts: free choice works from turn 1 (the first tap on any card is accepted), never more than one coach bubble on screen, bubbles never cover the hand,
// text >= 14px, window.GXCOACH reaches done, every coverage rule is either explained during play or listed on the "Things you will meet later" card,
// and the end card offers "Play a real game".
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const SIZES = (process.argv[2] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number));
const ALL = ['intro', 'pass', 'pair', 'fish', 'bun', 'roll', 'nigiri', 'paste', 'pasteNigiri', 'sticks', 'custard', 'rival', 'rounds', 'walk', 'makiTie', 'custardEnd', 'penalty', 'custardTie', 'tieBreak'];
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const note = (t, m) => { if (probs.length < 40) probs.push(t + ': ' + m); };
async function run(b, W, H) {
  const tag = W + 'x' + H, touch = W < 600;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); p.on('pageerror', e => note(tag, 'PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note(tag, 'console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/' + (touch ? '?phone=1' : '')); await sleep(800); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(900);
  const tap = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  const tapSel = async sel => { const pt = await p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || e.disabled || e.closest('[hidden]')) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y]; } return null; }, sel); if (!pt) return false; await tap(pt[0], pt[1]); return true; };
  const first = await p.evaluate(() => { const bt = document.querySelector('#start [data-gxt-open]'); if (!bt) return null; const r = bt.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, bt.textContent]; });
  if (!first || !/New here/.test(first[2])) { note(tag, 'first title option is not the tutorial'); await ctx.close(); return; }
  await tap(first[0], first[1]); await sleep(900); await p.evaluate(() => { AIDELAY = 160; });
  const t0 = Date.now(); let picks = 0, maxBub = 0, lastSig = '', lastT = Date.now(), freeOk = false, fsMin = 99;
  while (Date.now() - t0 < 480000) {
    const g = await p.evaluate(() => window.GXCOACH && { done: GXCOACH.done, running: GXCOACH.running, n: GXCOACH.explained.length, bub: document.querySelectorAll('#kkguide.on').length, fs: (() => { const e = document.querySelector('#kkguide.on .kgt span'); return e ? parseFloat(getComputedStyle(e).fontSize) : null; })(), over: (() => { const e = document.querySelector('#kkguide.on'), h = document.querySelector('#belt'); if (!e || !h) return false; const a = e.getBoundingClientRect(), c = h.getBoundingClientRect(); return a.bottom > c.top + 4 && a.top < c.bottom; })() });
    if (!g) { note(tag, 'no window.GXCOACH'); break; } if (g.bub > maxBub) maxBub = g.bub; if (g.fs && g.fs < fsMin) fsMin = g.fs; if (g.over) note(tag, 'a coach bubble covers the hand');
    if (g.done) break;
    const sig = await p.evaluate(() => G ? [G.round, G.turn, G.phase, UI.busy ? 1 : 0, !document.querySelector('#rs').hidden ? 1 : 0, GXCOACH.explained.length].join('.') : 'none'); if (sig !== lastSig) { lastSig = sig; lastT = Date.now(); } else if (Date.now() - lastT > 25000) { note(tag, 'stuck at ' + sig); break; }
    if (await tapSel('#rs [data-a=rsnext]')) { await sleep(350); continue; }
    if (await tapSel('#pc [data-a=take],#pc [data-a=cont]')) { await sleep(250); continue; }
    const mine = await p.evaluate(() => !!G && G.phase === 'pick' && canPick() && !UI.busy && !UI.cards.length && document.querySelector('#rs').hidden);
    if (mine) { const n = await p.evaluate(() => document.querySelectorAll('#belt .hc[data-up="1"]').length); const k = Math.floor(Math.random() * Math.max(1, n)); const turn0 = await p.evaluate(() => G.turn + '.' + G.round);
      if (await tapSel('#belt .hc[data-up="1"]:nth-of-type(' + (k + 1) + ')') || await tapSel('#belt .hc[data-up="1"]')) { picks++; await sleep(500); if (picks === 1) { const ok = await p.evaluate(() => UI.busy || G.players[0].picked || G.turn > 1); freeOk = ok; } continue; } }
    await sleep(150);
  }
  const g = await p.evaluate(() => ({ done: GXCOACH.done, explained: GXCOACH.explained.slice(), later: GXCOACH.later.slice() }));
  if (!g.done) note(tag, 'the coached game did not reach the end');
  if (!freeOk) note(tag, 'the first free pick was not accepted');
  if (maxBub > 1) note(tag, 'more than one coach bubble at once');
  if (fsMin < 14) note(tag, 'coach text ' + fsMin + 'px < 14');
  const miss = ALL.filter(k => g.explained.indexOf(k) < 0 && g.later.indexOf(k) < 0); if (miss.length) note(tag, 'rules neither explained nor listed: ' + miss.join(','));
  const e = await p.evaluate(() => [...document.querySelectorAll('#rs [data-a]')].map(b => b.dataset.a)); if (g.done && e.indexOf('coachplay') < 0) note(tag, 'end card has no "Play a real game"');
  console.log((probs.filter(x => x.startsWith(tag)).length ? 'FAIL ' : 'PASS ') + 'coached game to the end ' + tag + ' (' + picks + ' free picks, explained ' + g.explained.length + ', later ' + g.later.length + ': ' + g.later.join(',') + ')'); await ctx.close();
}
(async () => { const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) { try { await run(b, W, H); } catch (e) { note(W + 'x' + H, 'CRASH ' + String(e.message).split('\n')[0]); } }
  await b.close(); console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0); })();
