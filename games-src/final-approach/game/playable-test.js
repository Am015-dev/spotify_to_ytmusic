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

// ------------------------------------------------------------------ the coached first game, to the end (free legal moves through the UI; no scripted tap list)
async function tutorial(browser, W, H, dismissMode) {
  const c = await mk(browser, W, H), { p, tag } = c, T = await p.evaluate(() => window.CAMPAIGN.tutorial);
  const core = ['seats', 'goal', 'turns', 'axis', 'radio', 'engines', 'gear', 'flaps', 'brakes', 'coffee', 'reroll', 'rounds', 'final'];
  if (!(await tapSel(c, '#start .ttut'))) { note(tag, 'no Learn to play button'); return; }
  await sleep(900);
  const first = await p.evaluate(() => !!document.querySelector('.fa-coach,.fa-goal') && !!(UI.fc));
  if (!first) note(tag, 'no coach bubble at the start');
  let maxBub = 0, blocked = 0; const seenBub = new Set();
  const watch = setInterval(async () => { try { const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('.fa-coach')]; return { n: bs.length, ids: bs.map(b => b.dataset.coach), pe: bs.map(b => getComputedStyle(b).pointerEvents) }; }); maxBub = Math.max(maxBub, r.n); r.ids.forEach(i => seenBub.add(i)); if (r.pe.some(x => x !== 'none')) blocked++; } catch (e) { } }, 250);
  if (dismissMode) {
    await tapSel(c, '.fa-goal [data-ro=go]'); await sleep(900); const x = await tapSel(c, '.fa-coach .x'); await sleep(500);
    const gone = await p.evaluate(() => !document.querySelector('.fa-coach:not(.out)') || document.querySelector('.fa-coach').dataset.coach !== 'intro');
    clearInterval(watch); if (x !== true || !gone) note(tag, 'coach bubble could not be dismissed'); else lines.push('PASS coach bubble dismiss ' + tag); await c.p.context().close(); return;
  }
  const r = await playByTaps(c, 'coached', 300000);
  for (let i = 0; i < 40 && !(await p.evaluate(() => !!document.querySelector('.fa-fin'))); i++) await sleep(250);
  clearInterval(watch);
  await SHOT(c, 'tut-end');
  const fin = await p.evaluate(() => { const e = document.querySelector('.fa-fin'); return e ? { t: e.textContent, rows: e.querySelectorAll('ul.fchk li').length, later: e.querySelectorAll('ul.flat li').length, seen: Object.keys(UI.fc.seen), laterTxt: UI.fc.later || [] } : null; });
  if (!r.done) note(tag, 'coached game did not reach the result');
  if (!fin) { note(tag, 'no final check card after the result'); await c.p.context().close(); return; }
  if (!fin.rows) note(tag, 'final check has no rule rows');
  const seen = fin.seen.filter(k => core.includes(k)), unseen = core.filter(k => !fin.seen.includes(k));
  const laterCovered = unseen.every(k => fin.laterTxt.some(t => t.length > 10) );
  if (fin.laterTxt.length < unseen.length + T.later.length) note(tag, 'things-you-will-meet-later card misses unseen rules');
  if (maxBub > 1) note(tag, 'more than one coach bubble at once (' + maxBub + ')'); if (blocked) note(tag, 'coach bubble blocked input');
  if (seen.length < 7) note(tag, 'only ' + seen.length + ' rules explained in play: ' + seen.join(','));
  lines.push((probs.filter(x => x.startsWith(tag)).length ? 'FAIL' : 'PASS') + ' coached-game-to-end ' + tag + ' (' + (r.res || '?') + '; ' + seen.length + '/' + core.length + ' rules explained in play, ' + unseen.length + ' moved to the later card: ' + unseen.join(',') + ')');
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
    for (const sel of ['.gxc-btn.go', '.gxh-ok', '[data-a=gotit]', '.gxc-btn.pri', '.fa-ro [data-ro=go]']) { if (await tapSel(c, sel) === true) { acted = true; await sleep(350); break; } }
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
  const r = await playByTaps(c, 'quick', 240000); await sleep(3000); await SHOT(c, 'quick-result');
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
  const r = await playByTaps(c, 'story', 240000); await sleep(3000); await SHOT(c, 'story-result');
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
