// Full game by touch (gameplay gate): node play-touch.js [WxH=390x844] [seed=7] [shots=1]
// A Quick game (you = Pilot, the computer = Co-pilot) played to the result with real touch taps only: Roll, a die, then the glowing space (coffee +/- taps
// when the move needs coffee, a second tap when the game asks "Tap again"). The die and space come from the computer's own advice for your seat (a careful
// new player who follows the board). Prints every prompt line it saw on your turns, page errors, refused taps, and the result.
// shots=1 writes ../playable-shots/gameplay/first-turn.png, mid-game.png, result.png (390x844). Exit 1 on a page error, a stuck game or no result.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number), SEED = +(process.argv[3] || 7), SHOTS = (process.argv[4] || '1') === '1';
const OUT = path.join(__dirname, '..', 'playable-shots', 'gameplay');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SHOTS ? 2 : 1, isMobile: true, hasTouch: true });
  const html = fs.readFileSync(path.join(__dirname, 'final-approach.html'));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = [], prompts = [], refused = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://gns.test/'); await sleep(900);
  await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('fa_offer', '1'); } catch (e) { } }); await p.reload(); await sleep(900);
  const tapEl = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); if (!q.width) return null; const x = q.left + q.width / 2, y = q.top + q.height / 2; const top = document.elementFromPoint(x, y); return { x, y, ok: !!top && (top === e || e.contains(top) || top.contains(e)) }; }, sel); if (!r) return false; if (!r.ok) return 'covered'; await p.touchscreen.tap(r.x, r.y); return true; };
  // start a Quick game from the title by touch
  await p.evaluate(s => { UI.seed = s; }, SEED);
  let started = await tapEl('#start [data-a=play], #start .tbtn.play'); if (started !== true) { await p.evaluate(() => playNow()); }
  await sleep(900); await p.evaluate(s => { if (!G || G.result) { UI.seed = s; playNow(); } }, SEED); await sleep(600);
  for (const sel of ['.fa-goal [data-ro=go]', '.fa-ro [data-ro=go]']) await tapEl(sel);
  let shotFirst = false, shotMid = false, last = Date.now(), sig = '', taps = 0;
  for (let n = 0; n < 900; n++) {
    const s = await p.evaluate(() => ({ res: G && G.result ? G.result : null, ph: G.phase, turn: G.turn, round: G.round, pend: G.pend && G.pend.h, rdy: G.ready && G.ready[0], placed: Object.keys(G.slots).length,
      prompt: ((document.querySelector('#prompt') || {}).textContent || '').trim(), toast: (document.querySelector('#toast.on') || {}).textContent || '',
      overlay: ['.fa-goal [data-ro=go]', '.fa-ro [data-ro=go]', '.gxc-btn.go', '.gxh-ok'].find(q => { const e = document.querySelector(q); return e && e.getBoundingClientRect().width; }) || null }));
    if (s.res) break;
    const k = JSON.stringify([s.ph, s.turn, s.round, s.pend, s.placed, s.rdy]); if (k !== sig) { sig = k; last = Date.now(); } else if (Date.now() - last > 15000) { errs.push('STUCK ' + k); break; }
    if (s.toast && /again|first|taken|belongs|order|Wait/.test(s.toast)) refused.push(s.toast);
    if (s.overlay) { await tapEl(s.overlay); await sleep(400); continue; }
    if (s.ph === 'brief' && !s.rdy) { if (await tapEl('#acts [data-a=ready]') === true) taps++; await sleep(600); continue; }
    if (s.pend === 'rr') { await tapEl('#acts [data-a=rrpick]'); await sleep(500); continue; }
    if (s.ph === 'place' && !s.pend && s.turn === 0) {
      if (!shotFirst && SHOTS) { shotFirst = true; fs.mkdirSync(OUT, { recursive: true }); await sleep(500); await p.screenshot({ path: path.join(OUT, 'first-turn.png') }); }
      if (!shotMid && SHOTS && s.round >= 3) { shotMid = true; await sleep(500); await p.screenshot({ path: path.join(OUT, 'mid-game.png') }); }
      if (!prompts.length || prompts[prompts.length - 1] !== s.prompt) prompts.push('r' + (s.round + 1) + ': ' + s.prompt);
      const m = await p.evaluate(() => { const V = FA.stripView(G, 0); const m = FA.AI.move(V, 0, 'normal', { noMC: true }); return m; });
      if (!m) { await sleep(300); continue; }
      if (m.t === 'rr') { await tapEl('#acts [data-a=rr]'); await sleep(200); await tapEl('#acts [data-a=rr]'); taps += 2; await sleep(600); continue; }
      if (m.t === 'toss') { await tapEl('#pz .die[data-s="0"][data-d="' + m.d + '"]'); await sleep(250); await tapEl('#acts [data-a=toss]'); taps += 2; await sleep(600); continue; }
      if (m.t !== 'place') { await p.evaluate(mm => commit(0, mm), m); await sleep(500); continue; }
      const sel = await p.evaluate(() => UI.sel); if (sel !== m.d) { await tapEl('#pz .die[data-s="0"][data-d="' + m.d + '"]'); taps++; await sleep(250); }
      for (let c = 0; c < Math.abs(m.c || 0); c++) { await tapEl('[data-a=cof][aria-label="' + (m.c > 0 ? 'One more' : 'One less') + '"]'); taps++; await sleep(200); }
      const before = s.placed; const r = await tapEl('#pz .slot[data-slot="' + m.to + '"]'); taps++; await sleep(450);
      if (r === 'covered') errs.push('space ' + m.to + ' covered');
      const after = await p.evaluate(() => Object.keys(G.slots).length); if (after === before) { await tapEl('#pz .slot[data-slot="' + m.to + '"]'); taps++; await sleep(450); }
      continue;
    }
    await sleep(250);
  }
  await sleep(2500);
  const res = await p.evaluate(() => G.result); for (const sel of ['.fa-ro [data-ro=go]']) await tapEl(sel);
  if (SHOTS) await p.screenshot({ path: path.join(OUT, 'result.png') });
  console.log('prompts seen on my turns:\n  ' + prompts.join('\n  '));
  console.log('refused taps:', refused.length ? [...new Set(refused)].join(' | ') : 'none');
  console.log('taps', taps, 'result', res ? (res.win ? 'WIN' : 'LOSE ' + res.why + ': ' + res.msg) : 'NONE');
  console.log('ERRORS ' + errs.length + (errs.length ? '\n  ' + errs.join('\n  ') : ''));
  await b.close(); process.exit(errs.length || !res ? 1 : 0);
})();
