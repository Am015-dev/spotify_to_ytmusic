// Playable test (Final Approach): everything is done with real taps on visible, uncovered UI (no engine shortcuts).
//   node playable-test.js [tutorial|quick|story|all] [sizes=390x763,1440x860]     Exit code 1 on any problem.
// tutorial: fresh storage, Play -> the whole story tutorial to the end card; every step's target must be uncovered at its centre, the bubble must not cover it,
//           every coverage id (campaign.json "tutorial") must have been shown; also Skip works.
// quick:    a Quick game (Computer) played to the result by tapping a die and a glowing space (390x763).
// story:    Story chapter 1 played to the result screen by taps (intro scene, flight, result).
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(__dirname + '/final-approach.html');
const MODE = process.argv[2] || 'all';
const SIZES = (process.argv[3] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number));
const SHOTS = process.env.SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const probs = []; const note = (t, m) => { if (probs.length < 80) probs.push(t + ': ' + m); };
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const lines = [];

async function mk(browser, W, H) {
  const ph = W < 700;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: ph, hasTouch: ph });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); const tag = W + 'x' + H;
  p.on('pageerror', e => note(tag, 'PAGE ERROR ' + e.message));
  p.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(t)) note(tag, 'console error ' + t.slice(0, 160)); });
  await p.goto('https://gns.test/' + (ph ? '?phone=1' : '')); await sleep(900);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(1000);
  const tap = async (x, y) => { if (ph) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  return { p, tag, tap, ph };
}
// tap the centre of the first visible element matching sel, but only when that point really hits it (not covered)
async function tapSel(c, sel, opt) {
  const r = await c.p.evaluate(([sel, txt]) => {
    const els = [...document.querySelectorAll(sel)].filter(e => { const b = e.getBoundingClientRect(); return b.width > 4 && b.height > 4 && getComputedStyle(e).visibility !== 'hidden' && (!txt || e.textContent.trim() === txt); });
    for (const e of els) { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t) || t.contains(e))) return { x, y }; }
    return els.length ? { covered: els.length } : null; }, [sel, opt && opt.text || null]);
  if (!r) return false; if (r.covered) return 'covered';
  await c.tap(r.x, r.y); return true;
}
const SHOT = async (c, n) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await c.p.screenshot({ path: path.join(SHOTS, c.tag.split('x')[0] + '-' + n + '.png') }); } };

// ------------------------------------------------------------------ the tutorial, to the end
async function tutorial(browser, W, H, skipMode) {
  const c = await mk(browser, W, H), { p, tag } = c, T = await p.evaluate(() => window.CAMPAIGN.tutorial);
  const want = [...T.chapters.map(x => x.id), ...Object.keys(T.steps)], seen = [];
  if (!(await tapSel(c, '#start .tbtn.story'))) { note(tag, 'no Play button'); return; }
  await sleep(700);
  let last = '', lastT = Date.now(), steps = 0;
  for (let g = 0; g < 3000; g++) {
    const st = await p.evaluate(() => GXT.state());
    if (!st.active) break; if (st.phase === 'end') break;
    const sig = [st.i, st.phase, st.count, st.shown].join('|'); if (sig !== last) { last = sig; lastT = Date.now(); } else if (Date.now() - lastT > 9000) { note(tag, 'stuck at step ' + st.i + ' ' + st.id); return; }
    if (!st.shown) { await sleep(60); continue; }
    const info = await p.evaluate(() => {
      const s = GXT.state(), b = document.querySelector('.gxt-bub'), q = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const h = s.hole, el = h ? document.elementFromPoint(h.cx, h.cy) : null, nb = b && b.querySelector('.gxt-next'), n = q(nb);
      const ne = n ? document.elementFromPoint((n.l + n.r) / 2, (n.t + n.b) / 2) : null;
      return { s, bub: q(b), say: b && b.querySelector('.gxh-tx').textContent, title: b && b.querySelector('.gxh-tt') && b.querySelector('.gxh-tt').textContent,
        inBub: !!(el && el.closest('.gxt-bub,.fa-react')), kitCover: !!(el && el.closest('[data-help]')), under: el && (el.id || String(el.className && el.className.baseVal != null ? el.className.baseVal : el.className)), nextOk: !!(nb && ne && (ne === nb || nb.contains(ne))),
        por: !!(b && b.querySelector('.fa-por')), w: innerWidth, hgt: innerHeight, sx: document.documentElement.scrollWidth > innerWidth + 1, skip: !!document.querySelector('.gxt-skip') };
    });
    const id = info.s.id; steps++; if (!seen.includes(id)) seen.push(id);
    if (wc(info.say) > 22) note(tag, id + ': bubble text over 22 words'); if (!info.say) note(tag, id + ': empty bubble'); if (!info.por) note(tag, id + ': no speaker portrait in the bubble');
    if (info.sx) note(tag, id + ': page scrolls sideways'); if (!info.skip) note(tag, id + ': no Skip button');
    const b = info.bub, h = info.s.hole;
    if (b && (b.l < -1 || b.t < -1 || b.r > info.w + 1 || b.b > info.hgt + 1)) note(tag, id + ': bubble outside the screen');
    if (h && b && h.cx > b.l && h.cx < b.r && h.cy > b.t && h.cy < b.b) note(tag, id + ': bubble covers the target centre');
    if (info.s.wait) { if (!h) note(tag, id + ': no target'); else if (info.inBub) note(tag, id + ': target centre is under the bubble'); else if (info.kitCover) note(tag, id + ': target centre covered by ' + info.under); }
    else if (!info.nextOk) note(tag, id + ': Next button missing or covered');
    if (skipMode && st.i >= 3) { if (!(await tapSel(c, '.gxt-skip'))) note(tag, 'Skip not tappable'); await sleep(600); const a = await p.evaluate(() => GXT.active()); if (a) note(tag, 'Skip did not leave the tutorial'); else lines.push('PASS tutorial skip ' + tag); await c.p.context().close(); return; }
    if (id === 'ch2') await SHOT(c, 'tut-ch2'); if (id === 'radio') await SHOT(c, 'tut-radio'); if (id === 'ch1') await SHOT(c, 'tut-ch1');
    let ok;
    if (!info.s.wait) ok = await tapSel(c, '.gxt-next'); else { const hh = info.s.hole; await c.tap(hh.cx, hh.cy); ok = true; }
    if (ok === 'covered' || !ok) note(tag, id + ': could not act (' + ok + ')');
    await sleep(info.s.wait ? 520 : 320);
  }
  const end = await p.evaluate(() => { const e = document.querySelector('.gxt-end'); return e ? { t: e.textContent.slice(0, 160), pri: !!e.querySelector('.gxt-b.pri,.gxt-b') } : null; });
  await SHOT(c, 'tut-end');
  if (!end) note(tag, 'no end card after the last step'); else if (!/Green Wings|rules/i.test(end.t)) note(tag, 'end card text unexpected: ' + end.t);
  const missing = want.filter(w => !seen.includes(w)); if (missing.length) note(tag, 'coverage steps never shown: ' + missing.join(','));
  const done = await p.evaluate(() => GXT.isDone('final-approach'));
  if (!done) note(tag, 'tutorial not marked done');
  lines.push((probs.filter(x => x.startsWith(tag)).length ? 'FAIL' : 'PASS') + ' tutorial-to-end ' + tag + ' (' + seen.length + '/' + want.length + ' story steps shown)');
  await c.p.context().close();
}

// ------------------------------------------------------------------ a game played by taps
async function playByTaps(c, label, maxMs) {
  const { p, tag } = c; const t0 = Date.now(); let moves = 0, lastSig = '', lastT = Date.now(), turnBanner = 0, rivalCap = 0;
  while (Date.now() - t0 < maxMs) {
    const s = await p.evaluate(() => {
      const vis = e => { const b = e.getBoundingClientRect(); return b.width > 4 && b.height > 4 && getComputedStyle(e).visibility !== 'hidden'; };
      const tb = document.querySelector('#fx .tbn'), tx = tb && tb.classList.contains('in') && !tb.classList.contains('out') ? tb.textContent : '';
      return { end: !!document.querySelector('#fx .endb') || !!(window.G && G.result), res: window.G && G.result ? (G.result.win ? 'win' : 'lose') : '', legal: [...document.querySelectorAll('#pz .slot.legal:not(.deadly)')].filter(vis).map(e => e.dataset.slot), anyLegal: [...document.querySelectorAll('#pz .slot.legal')].filter(vis).map(e => e.dataset.slot),
        dice: [...document.querySelectorAll('#pz .die.can')].filter(vis).length, sel: !!document.querySelector('#pz .die.sel'), ready: !![...document.querySelectorAll('[data-a=ready]')].find(vis),
        tb: /Your turn/.test(tx) ? 'me' : /used/.test(tx) ? 'cap' : tx ? 'rv' : '' };
    });
    if (s.tb === 'me') turnBanner++; if (s.tb === 'cap') rivalCap++;
    if (s.end) { await sleep(900); return { done: true, moves, res: s.res, turnBanner, rivalCap }; }
    const sig = JSON.stringify([s.legal, s.dice, s.sel, s.ready, moves]); if (sig !== lastSig) { lastSig = sig; lastT = Date.now(); } else if (Date.now() - lastT > 12000) { note(tag, label + ': stuck 12 s ' + sig + ' ' + (await p.evaluate(() => JSON.stringify(window.G ? { ph: G.phase, t: G.turn, pend: G.pend && G.pend.h, r: G.round } : {}))) + ' buttons: ' + (await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim().slice(0, 14)).join('|')))); return { done: false, moves }; }
    // overlays first (coach cards, story cards)
    let acted = false;
    for (const sel of ['.gxc-btn.go', '.gxh-ok', '[data-a=gotit]', '.gxc-btn.pri']) { if (await tapSel(c, sel) === true) { acted = true; await sleep(350); break; } }
    if (acted) continue;
    if (await tapSel(c, '[data-a=rrpick]') === true) { moves++; await sleep(700); continue; }
    if (s.ready) { if (await tapSel(c, '[data-a=ready]') === true) { moves++; await sleep(500); } continue; }
    if (await tapSel(c, '#start [data-a=start][data-m=vs]') === true) { await sleep(900); continue; }
    if (s.sel && s.legal.length) {
      const pri = ['ax0', 'ax1', 'en0', 'en1']; const k = s.legal.find(x => pri.includes(x)) || s.legal[Math.floor(Math.random() * s.legal.length)];
      const r = await tapSel(c, '#pz .slot[data-slot="' + k + '"]'); if (r === 'covered') note(tag, label + ': legal space ' + k + ' is covered'); else if (r) { moves++; await sleep(600); }
      continue;
    }
    if (s.sel && !s.legal.length && s.anyLegal.length && Date.now() - lastT > 3500) { const k = s.anyLegal[0]; await tapSel(c, '#pz .slot[data-slot="' + k + '"]'); await sleep(300); await tapSel(c, '#pz .slot[data-slot="' + k + '"]'); moves++; await sleep(700); continue; }
    if (s.dice) { const r = await tapSel(c, s.sel ? '#pz .die.can:not(.sel)' : '#pz .die.can'); if (r === 'covered') note(tag, label + ': my die is covered'); else await sleep(250); continue; }
    await sleep(200);
  }
  note(tag, label + ': did not finish in time'); return { done: false, moves };
}
async function quick(browser, W, H) {
  const c = await mk(browser, W, H), { p, tag } = c;
  await p.evaluate(() => { localStorage.setItem('fa_offer', '1'); localStorage.setItem('fa_prefs', JSON.stringify({ speed: 150, won: { g1: 1 } })); }); await p.reload(); await sleep(900);
  if (!(await tapSel(c, '#start button', { text: 'Computer' }))) { note(tag, 'quick: no Computer button'); return; }
  await sleep(900);
  const r = await playByTaps(c, 'quick', 240000); await SHOT(c, 'quick-result');
  lines.push((r.done ? 'PASS' : 'FAIL') + ' quick game to result ' + tag + ' (' + (r.res || '?') + ', ' + r.moves + ' taps)');
  if (r.done && !r.turnBanner) note(tag, 'quick: the "Your turn" banner was never seen'); if (r.done && !r.rivalCap) note(tag, 'quick: no rival caption was seen');
  await c.p.context().close();
}
async function story(browser, W, H) {
  const c = await mk(browser, W, H), { p, tag } = c;
  await p.evaluate(() => { localStorage.setItem('fa_offer', '1'); localStorage.setItem('fa_prefs', JSON.stringify({ speed: 150 })); }); await p.reload(); await sleep(900);
  // a new player's Computer button opens Story chapter 1 (intro scene, then the flight)
  if (!(await tapSel(c, '#start button', { text: 'Computer' }))) { note(tag, 'story: no Computer button'); return; } await sleep(900);
  const intro = await p.evaluate(() => { const e = document.querySelector('.gxc-sc-text'); return e ? e.textContent : ''; });
  if (!intro) note(tag, 'story: no intro scene text'); await SHOT(c, 'story-intro');
  const r = await playByTaps(c, 'story', 240000); await SHOT(c, 'story-result');
  lines.push((r.done ? 'PASS' : 'FAIL') + ' story chapter 1 to result ' + tag + ' (' + (r.res || '?') + ', ' + r.moves + ' taps)');
  await c.p.context().close();
}

(async () => {
  process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/tmp/claude-0/pw';
  const browser = await PW.chromium.launch();
  for (const [W, H] of SIZES) {
    if (MODE === 'all' || MODE === 'tutorial') { await tutorial(browser, W, H, false); if (W === 390) await tutorial(browser, W, H, true); }
    if ((MODE === 'all' || MODE === 'quick') && W === 390) await quick(browser, W, H);
    if ((MODE === 'all' || MODE === 'story') && W === 390) await story(browser, W, H);
  }
  await browser.close();
  lines.forEach(l => console.log(l)); probs.forEach(l => console.log('  ' + l));
  console.log(probs.length ? 'FAIL playable-test: ' + probs.length + ' problems' : 'PASS playable-test');
  process.exit(probs.length ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
