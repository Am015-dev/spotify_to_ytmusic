// Staged tutorial walked BY TOUCH from fresh storage, then the real game it hands over to, played to the result by touch (W499).
//   node tut-walk.js [sizes=390x844,375x667] [shotDir]     prints PASS/FAIL lines, exit 1 on a problem
// Tutorial asserts: the first title option opens it; every rule id in TUT_RULES (ui11.js) appears as a step, in order; every sentence is one sentence of
// 12 words or fewer; every step shows ONE glowing target and moves on only by a touch tap on it (no Next buttons); the end card's
// "Play a real game" starts a real 3-round game. Real game asserts: played to the final result by touch taps, 0 page/console errors.
// With shotDir (390x844 only): tut-1..tut-N.png, first-turn.png, mid-game.png, result.png.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const SIZES = (process.argv[2] || '390x844,375x667').split(',').map(s => s.split('x').map(Number)); const SHOTS = process.argv[3] || '';
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const note = (t, m) => { if (probs.length < 60) probs.push(t + ': ' + m); };
const words = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const sentences = t => String(t || '').split(/[.!?](?:\s|$)/).filter(x => x.trim()).length;
async function run(b, W, H) {
  const tag = W + 'x' + H, shots = SHOTS && W === 390 && H === 844;
  if (shots) fs.mkdirSync(SHOTS, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); p.on('pageerror', e => note(tag, 'PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note(tag, 'console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?phone=1'); await sleep(800); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(900);
  const tap = (x, y) => p.touchscreen.tap(x, y);
  const tapSel = async sel => { const pt = await p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || e.disabled || e.closest('[hidden]')) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y]; } return null; }, sel); if (!pt) return false; await tap(pt[0], pt[1]); return true; };
  const first = await p.evaluate(() => { const bt = document.querySelector('#start [data-gxt-open]'); if (!bt) return null; const r = bt.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, bt.textContent]; });
  if (!first) { note(tag, 'no tutorial button on the title'); await ctx.close(); return; }
  await tap(first[0], first[1]); await sleep(1200); await p.evaluate(() => { AIDELAY = 120; });
  const rules = await p.evaluate(() => TUT_RULES.slice());
  // ---- the staged tutorial
  const seen = []; let lastId = '', lastT = Date.now(), nextBtns = 0, n = 0;
  while (Date.now() - lastT < 30000) {
    const s = await p.evaluate(() => { if (!GXT.running()) return { gone: true }; const end = document.querySelector('[data-gxt-end]'); if (end) return { end: true };
      const st = GXT.current(); if (!st) return null; const bub = document.querySelector('.gxt-bub');
      const tgt = (() => { try { return st.target(); } catch (e) { return null; } })(); const say = typeof st.say === 'function' ? st.say() : st.say;
      if (!bub || !tgt || !tgt.getBoundingClientRect) return { id: st.id, wait: true };
      const r = tgt.getBoundingClientRect(), br = bub.getBoundingClientRect(); let pt = null;
      for (let fy = 0.5; fy <= 0.9 && !pt; fy += 0.1) for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 1 || y < 1 || x > innerWidth - 1 || y > innerHeight - 1) continue; const e = document.elementFromPoint(x, y); if (e && !bub.contains(e) && !(e.closest && e.closest('.gxt-cell, .gxt-top'))) { pt = [x, y]; break; } }
      return { id: st.id, say, title: st.title, pt, next: !!bub.querySelector('.gxt-next'), shown: !!bub.offsetWidth };
    });
    if (!s || s.wait) { await sleep(200); continue; }
    if (s.gone || s.end) break;
    if (s.id !== lastId) { lastId = s.id; lastT = Date.now(); seen.push(s.id); n++;
      if (words(s.say) > 12) note(tag, 'step ' + s.id + ' says ' + words(s.say) + ' words: ' + s.say);
      if (sentences(s.say) > 2) note(tag, 'step ' + s.id + ' has ' + sentences(s.say) + ' sentences');
      if (s.next) nextBtns++;
      await sleep(700); if (shots) await p.screenshot({ path: path.join(SHOTS, 'tut-' + n + '.png') }); }
    if (!s.pt) { await sleep(200); continue; }
    await tap(s.pt[0], s.pt[1]); await sleep(650);
  }
  const end = await p.evaluate(() => !!document.querySelector('[data-gxt-end="play"]'));
  if (!end) note(tag, 'tutorial did not reach its end card (last step ' + lastId + ')');
  if (nextBtns) note(tag, nextBtns + ' steps used a Next button instead of a tap on the board');
  const miss = rules.filter(r => seen.indexOf(r) < 0); if (miss.length) note(tag, 'rule steps never shown: ' + miss.join(','));
  const order = seen.filter(r => rules.indexOf(r) >= 0); if (order.join() !== rules.filter(r => seen.indexOf(r) >= 0).join()) note(tag, 'rule steps out of order');
  if (shots && end) await p.screenshot({ path: path.join(SHOTS, 'tut-' + (n + 1) + '.png') });
  console.log((probs.some(x => x.startsWith(tag)) ? 'FAIL ' : 'PASS ') + 'tutorial by touch ' + tag + ' (' + seen.length + ' steps, ' + rules.length + ' rules)');
  // ---- the real game it hands over to
  const nb = probs.length;
  if (!await tapSel('[data-gxt-end="play"]')) { note(tag, 'no Play a real game button'); await ctx.close(); return; }
  await sleep(1200); await p.evaluate(() => { AIDELAY = 120; });
  const gi = await p.evaluate(() => G && { mode: UI.mode, np: G.np, rounds: G.rounds || 3, round: G.round });
  if (!gi || gi.mode !== 'vs') note(tag, 'Play a real game did not start a real game: ' + JSON.stringify(gi));
  await tapSel('#kkgoal .kgo'); await sleep(500);
  if (shots) { await sleep(600); await p.screenshot({ path: path.join(SHOTS, 'first-turn.png') }); }
  let sig0 = '', st0 = Date.now(), picks = 0, mid = false; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    const g = await p.evaluate(() => G ? { over: G.phase === 'over', fin: !!document.querySelector('#rs:not([hidden]) .kkres, #rs:not([hidden]).kkfin, #rs:not([hidden]) [data-a=again]'), sig: [G.round, G.turn, G.phase, UI.busy ? 1 : 0].join('.'), round: G.round, turn: G.turn } : null);
    if (!g) { note(tag, 'game vanished'); break; }
    if (g.over && g.fin) break;
    if (g.sig !== sig0) { sig0 = g.sig; st0 = Date.now(); } else if (Date.now() - st0 > 25000) { note(tag, 'real game stuck at ' + g.sig); break; }
    if (shots && !mid && g.round === 2 && g.turn === 4) { mid = true; await sleep(300); await p.screenshot({ path: path.join(SHOTS, 'mid-game.png') }); }
    if (await tapSel('#rs [data-a=rsnext]')) { await sleep(350); continue; }
    if (await tapSel('#pc [data-a=take],#pc [data-a=cont]')) { await sleep(250); continue; }
    const mine = await p.evaluate(() => !!G && G.phase === 'pick' && canPick() && !UI.busy && !UI.cards.length && document.querySelector('#rs').hidden);
    if (mine) { const k = await p.evaluate(() => document.querySelectorAll('#belt .hc[data-up="1"]').length);
      if (await tapSel('#belt .hc[data-up="1"]:nth-of-type(' + (1 + Math.floor(Math.random() * Math.max(1, k))) + ')') || await tapSel('#belt .hc[data-up="1"]')) { picks++; await sleep(450); continue; } }
    await sleep(150);
  }
  const fin = await p.evaluate(() => G && G.phase === 'over' && G.final ? { totals: G.final.totals, rounds: G.rs.length } : null);
  if (!fin) note(tag, 'real game did not reach the result'); else if (fin.rounds !== 3) note(tag, 'real game had ' + fin.rounds + ' rounds');
  if (shots && fin) { await sleep(1500); await p.screenshot({ path: path.join(SHOTS, 'result.png') }); }
  console.log((probs.length > nb ? 'FAIL ' : 'PASS ') + 'real game by touch ' + tag + ' (' + picks + ' taps, totals ' + (fin ? fin.totals.join('/') : '-') + ')');
  await ctx.close();
}
(async () => { const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) { try { await run(b, W, H); } catch (e) { note(W + 'x' + H, 'CRASH ' + String(e.message).split('\n')[0]); } }
  await b.close(); console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0); })();
