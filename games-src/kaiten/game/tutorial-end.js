// Tutorial-to-end (W394): plays the guided story game from FRESH storage by tapping the centre of each spotlit element, at 390x763 (touch) and 1440x860 (mouse).
//   node tutorial-end.js [sizes=390x763,1440x860]     exit 1 on any problem; prints only PASS/FAIL lines
// Asserts per step: the target is on screen and fully uncovered (elementFromPoint at its centre is the target or inside it, never the bubble / kit overlay),
// the right tap advances (and a wrong tap does not), bubble text >= 14px and <= 3 lines, no page error; Skip works; at the end every COVERAGE step was shown
// and the end card offers "Play a real game".
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const SIZES = (process.argv[2] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number));
// rule -> the step ids that teach it (the same table as ../TUTORIAL-COVERAGE.md)
const COVERAGE = { 'goal+story': ['c1', 'goal'], 'rival': ['chef'], 'one dish per turn + pass': ['belt', 'pick1', 'passed'], 'prawn pair': ['pick2', 'scoreSets'], 'fire paste': ['paste'], 'nigiri on paste x3': ['nigiri', 'scoreNigiri'],
  'twin sticks': ['sticksTake', 'sticksUse', 'twinA', 'twinB'], 'fish set of 3': ['fish3'], 'roll race': ['roll', 'scoreRoll'], 'steam bun ladder': ['bun'], 'custard': ['custard', 'scoreCustard'], 'round scoring': ['c4', 'scoreSets'], 'rival scored by same rules': ['scoreChef'], 'meal end and tie-break': ['end'] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const probs = []; const note = (t, m) => { if (probs.length < 40) probs.push(t + ': ' + m); };
async function run(b, W, H, mode) {
  const tag = W + 'x' + H + (mode === 'skip' ? ' skip' : ''); const touch = W < 600;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note(tag, 'PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note(tag, 'console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/' + (touch ? '?phone=1' : '')); await sleep(800); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(900);
  const tap = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  const first = await p.evaluate(() => { const bt = document.querySelector('#start [data-gxt-open]'); if (!bt) return null; const r = bt.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, bt.textContent]; });
  if (!first || !/New here/.test(first[2])) { note(tag, 'first title option is not the tutorial'); await ctx.close(); return; }
  await tap(first[0], first[1]); await sleep(600); await p.evaluate(() => { AIDELAY = 120; });
  const state = () => p.evaluate(() => GXT.state());
  const seen = []; let last = '', lastT = Date.now(), wrongDone = false, steps = 0;
  for (let g = 0; g < 4000; g++) {
    const st = await state(); if (!st.active || st.phase === 'end') break;
    const sig = [st.i, st.phase, st.count, st.shown].join('|'); if (sig !== last) { last = sig; lastT = Date.now(); } else if (Date.now() - lastT > 9000) { note(tag, 'stuck at ' + st.id); break; }
    if (!st.shown) { await sleep(60); continue; }
    if (!seen.includes(st.id)) seen.push(st.id);
    const info = await p.evaluate(() => { const s = GXT.state(), b = document.querySelector('.gxt-bub'), nb = b && b.querySelector('.gxt-next'), tx = b && b.querySelector('.gxh-tx');
      const q = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      const h = s.hole; let top = null; if (h) { const el = document.elementFromPoint(h.cx, h.cy); top = el ? { kit: !!(el.closest('.gxt-bub,.gxt-top,.gxt-end,[data-help]')), id: el.id || (el.className && el.className.baseVal) || el.className || el.tagName } : null; }
      const cs = tx && getComputedStyle(tx), lh = cs && (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25);
      return { s, nx: q(nb), top, fs: cs && parseFloat(cs.fontSize), lines: tx && lh ? Math.round(tx.getBoundingClientRect().height / lh) : 0, skip: q(document.querySelector('.gxt-skip')), V: { w: innerWidth, h: innerHeight } }; });
    steps++; const s = info.s;
    if (info.fs && info.fs < 14) note(tag, s.id + ': bubble text ' + info.fs + 'px < 14');
    if (info.lines > 3) note(tag, s.id + ': bubble text has ' + info.lines + ' lines (max 3 with the title)');
    if (!s.hole) note(tag, s.id + ': no spotlight');
    else if (s.wait) {
      if (info.top && info.top.kit) note(tag, s.id + ': target covered by the tutorial overlay (' + info.top.id + ')');
      if (s.hole.cx < 0 || s.hole.cy < 0 || s.hole.cx > info.V.w || s.hole.cy > info.V.h) note(tag, s.id + ': target off screen');
    }
    // a wrong tap once per run (outside every spotlight and the bubble) must not advance
    if (s.wait && !wrongDone && s.id === 'pick1') { wrongDone = true; const before = await state(); await tap(info.V.w * .5, info.V.h * .3); await sleep(160); const after = await state(); if (after.i !== before.i || after.count !== before.count) note(tag, 'a wrong tap advanced the tutorial'); }
    if (mode === 'skip' && s.i >= 3) { const sk = info.skip; await tap((sk.left + sk.right) / 2, (sk.top + sk.bottom) / 2); await sleep(500);
      const o = await p.evaluate(() => ({ run: GXT.running(), dom: document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-top,.gxt-end').length, start: !document.querySelector('#start').hidden }));
      if (o.run || o.dom) note(tag, 'Skip left tutorial elements on screen'); if (!o.start) note(tag, 'Skip did not return to the menu'); await ctx.close(); return; }
    if (!s.wait) { const nx = info.nx; if (!nx) { note(tag, s.id + ': Next missing'); break; } await tap((nx.left + nx.right) / 2, (nx.top + nx.bottom) / 2); }
    else { const bf = await state(); await tap(s.hole.cx, s.hole.cy); const t1 = Date.now(); let moved = false; while (Date.now() - t1 < 2200) { await sleep(60); const a = await state(); if (a.i !== bf.i || a.count !== bf.count || a.phase !== 'show') { moved = true; break; } } if (!moved) { note(tag, s.id + ': tapping the target did not advance'); break; } }
    await sleep(40);
  }
  if (mode !== 'skip') {
    const fin = await state();
    if (!(fin.active && fin.phase === 'end')) note(tag, 'did not reach the end card (at ' + fin.id + ')');
    else {
      for (const [rule, ids] of Object.entries(COVERAGE)) { const miss = ids.filter(i => !seen.includes(i)); if (miss.length) note(tag, 'coverage "' + rule + '": steps not shown: ' + miss.join(',')); }
      await sleep(300);
      const e = await p.evaluate(() => { const c = document.querySelector('.gxt-end'); return c && [...c.querySelectorAll('[data-gxt-end]')].map(x => x.dataset.gxtEnd); });
      if (!e || e.indexOf('play') < 0) note(tag, 'end card has no "play a real game"');
    }
  }
  console.log((probs.filter(x => x.startsWith(tag)).length ? 'FAIL ' : 'PASS ') + 'tutorial-to-end ' + tag + ' (' + steps + ' step views, ' + seen.length + ' distinct steps)');
  await ctx.close();
}
(async () => { const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) { try { await run(b, W, H, 'full'); } catch (e) { note(W + 'x' + H, 'CRASH ' + String(e.message).split('\n')[0]); } }
  const [W0, H0] = SIZES[0]; try { await run(b, W0, H0, 'skip'); } catch (e) { note('skip', 'CRASH ' + String(e.message).split('\n')[0]); }
  await b.close(); console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0); })();
