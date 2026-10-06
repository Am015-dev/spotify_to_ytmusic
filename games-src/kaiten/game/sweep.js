// Kaiten Kitchen sweep: full games vs the computer through the REAL page, touch taps only, on phone sizes (+ rotations).
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=20] [sizes=390x763,375x553] [seed0=1] [fast=0]
// Fails on: page errors, a tap on a glowing target that does nothing, stuck > 8 s, chips on screen != engine totals (every round end and
// the final), text blocks > 8 words, buttons covered by something else, horizontal scroll. Plays the whole game: grabs, hints, Twin Sticks,
// round-end counts (tap to hurry), Play again. Rotations happen mid-game in some games.
const PW = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const N = +(process.argv[2] || 20), SIZES = (process.argv[3] || '390x763,375x553').split(',').map(s => s.split('x').map(Number)), SEED0 = +(process.argv[4] || 1), FAST = process.argv[5] === '1';
let rs = 12345; const R = () => (rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const LIB = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width >= 4 && r.height >= 4 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && s.pointerEvents !== 'none' && !e.closest('[hidden]'); };
  const ctr = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  window.__sw = {
    st() { return { over: G.phase === 'over', pick: canPick(), busy: !!UI.busy, round: G.round, turn: G.turn, done: !!(UI.rsInfo && UI.rsInfo.done), rsOpen: !!UI.rsOpen, fz: !!UI.fz }; },
    sig() { return [G.round, G.turn, G.phase, G.players.map(p => (p.picked ? 1 : 0) + ':' + p.hand.length).join(), UI.busy ? 1 : 0, UI.rsOpen ? 1 : 0, UI.fz && UI.fz.tally ? UI.fz.tally.join('/') : '', document.querySelectorAll('.tl,.tl0,.tpop').length, !!document.querySelector('.flyc,.pkt,#stage')].join('|'); },
    btn(sel) { const e = [...document.querySelectorAll(sel)].find(vis); return e ? ctr(e) : null; },
    cards() { const br = document.querySelector('#belt').getBoundingClientRect(); return [...document.querySelectorAll('#belt .hc[data-up="1"]')].filter(vis).map(e => { const c = ctr(e), t = document.elementFromPoint(c.x, c.y); return Object.assign(c, { i: +e.dataset.i, rec: e.classList.contains('rec'), hit: !!t && e.contains(t), inb: c.x > br.left + 2 && c.x < br.right - 2 && c.y > br.top && c.y < br.bottom }); }).filter(x => x.inb && x.hit); },
    mine() { const c = document.querySelector('#tbl .seat.me .ctr'); if (!c) return null; const r = c.getBoundingClientRect(); const u = document.querySelector('#tbl .seat.me .grp.usable'); let uok = true; if (u) { const q = u.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2; const t = document.elementFromPoint(cx, cy); uok = !!t && u.contains(t); } return { over: c.scrollWidth > c.clientWidth + 3, usable: !!u, uok }; },
    chips() { return G.players.map((p, s) => { const e = document.querySelector('#tbl .seat[data-seat="' + s + '"] .av .sc'); return e ? +e.textContent : null; }); },
    engine() { if (G.phase === 'over' && G.final) return G.final.totals.slice(); return G.players.map((p, s) => G.rs.reduce((a, r) => a + r[s].total, 0)); },
    audit() {
      const W = innerWidth, H = innerHeight, covered = [], wordy = [];
      for (const e of document.querySelectorAll('button,[role=button]')) { if (!vis(e) || e.matches('.hc,.grp')) continue; const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 0 || cy < 0 || cx > W || cy > H) continue;
        const t = document.elementFromPoint(cx, cy); if (t && t !== e && !e.contains(t) && !t.contains(e) && !(t.closest && t.closest('svg') && t.closest('svg').getBoundingClientRect().width < 120)) { if (e.closest('.gx-drawer,[aria-modal=true]')) continue; covered.push((e.dataset.a || e.className || e.tagName) + ' <- ' + (t.id || t.className || t.tagName)); } }
      for (const e of document.body.querySelectorAll('*')) { if (/^(SCRIPT|STYLE|SVG|TEXT|TSPAN|PATH)$/i.test(e.tagName) || !vis(e) || getComputedStyle(e).display.startsWith('inline')) continue; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        if (e.closest('[class*=drawer],[class*=Drawer],[class*=rules],[class*=menu],[id$=log],[class*=settings],[aria-modal=true],#start,.gx-drawer,#netbox')) continue;
        const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
        const w = (e.innerText || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(x => /[a-z][a-z]/i.test(x)); if (w.length > 8) wordy.push(w.length + 'w "' + w.slice(0, 6).join(' ') + '"'); }
      return { covered, wordy, hscroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > W + 1 };
    },
    board() { const b = document.querySelector('[data-board]'); if (!b) return -1; const r = b.getBoundingClientRect(); return Math.round(100 * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (innerWidth * innerHeight)); }
  };
})()`;
async function game(b, gi, [W, H]) {
  const seed = SEED0 + gi, tag = `g${gi}@${W}x${H}`; rs = seed * 7919 + 13;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); const errs = [], fails = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
  const fail = m => { if (!fails.includes(m)) fails.push(m); };
  const tap = async (x, y) => { await p.touchscreen.tap(x, y); };
  const ev = s => p.evaluate(s);
  const stats = { turns: 0, rounds: 0, twin: 0, hints: 0, hurry: 0, rot: 0, board: 999 };
  try {
    await p.goto('https://gns.test/'); await p.waitForTimeout(1200); await p.evaluate(LIB);
    await p.evaluate(s => { try { localStorage.clear(); } catch (e) { } UI.seed = s; }, seed);
    if (FAST) await p.evaluate(() => { AIDELAY = 120; });
    let c = await ev(`__sw.btn('[data-a=play]')`); if (!c) { fail('no Play button'); throw 0; } await tap(c.x, c.y); await p.waitForTimeout(400);
    const np = 3 + Math.floor(R() * 2); await p.evaluate(n => { UI.opt = UI.opt || {}; UI.opt.np = n; setNp(n); renderStart(); }, np);
    c = await ev(`__sw.btn('[data-start=vs]')`); if (!c) { fail('no vs button'); throw 0; } await tap(c.x, c.y); await p.waitForTimeout(900);
    await p.evaluate(LIB);
    let lastSig = '', lastT = Date.now(), over = false, handled = new Set(), rotated = 0, nodead = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 420000) {
      const st = await ev(`__sw.st()`), sig = await ev(`__sw.sig()`);
      if (sig !== lastSig) { lastSig = sig; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { fail('stuck 8s at ' + sig); break; }
      // tally / round end
      const nx = await ev(`__sw.btn('#rs [data-a=rsnext]')`), ag = await ev(`__sw.btn('#rs [data-a=again]')`);
      if (ag || nx) {
        const key = 'rs' + st.round + (ag ? 'f' : '');
        if (!handled.has(key)) {
          handled.add(key); stats.rounds++;
          const ch = await ev(`__sw.chips()`), en = await ev(`__sw.engine()`);
          if (JSON.stringify(ch) !== JSON.stringify(en)) fail(`chips ${ch} != engine ${en} (round ${st.round}${ag ? ' final' : ''})`);
          const a = await ev(`__sw.audit()`); a.covered.forEach(x => fail('covered ' + x)); a.wordy.forEach(x => fail('wordy ' + x)); if (a.hscroll) fail('hscroll');
          if (W < H) { const bd = await ev(`__sw.board()`); stats.board = Math.min(stats.board, bd); if (bd < 55) fail('board ' + bd + '%'); }
          if (ag) { over = true; break; }
        }
        await p.waitForTimeout(200); if (R() < .5) await p.waitForTimeout(500);
        const n2 = await ev(`__sw.btn('#rs [data-a=rsnext]')`); if (n2) { await tap(n2.x, n2.y); await p.waitForTimeout(250); }
        continue;
      }
      if (st.over && st.rsOpen === false && !st.busy) { fail('game over without result buttons'); break; }
      if (st.pick) {
        const cards = await ev(`__sw.cards()`); if (!cards.length) { if (await ev(`!!document.querySelector('.gx-drawer.on') || !!document.querySelector('#ppop:not([hidden])')`)) await p.keyboard.press('Escape'); await p.waitForTimeout(150); continue; }
        // rotations mid-game
        if (rotated < 2 && R() < .07 && st.turn > 2) { rotated++; stats.rot++; await p.setViewportSize(rotated === 1 ? { width: Math.max(W, H), height: Math.min(W, H) } : { width: W, height: H }); await ev(`window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'))`); await p.waitForTimeout(900); await p.evaluate(LIB); continue; }
        { const portrait = await ev(`innerWidth < innerHeight`), a = await ev(`__sw.audit()`); a.covered.forEach(x => fail('covered ' + x)); a.wordy.forEach(x => fail('wordy ' + x)); if (a.hscroll) fail('hscroll');
          if (portrait) { const bd = await ev(`__sw.board()`); stats.board = Math.min(stats.board, bd); if (bd < 55) fail('board ' + bd + '%'); } }
        { const m = await ev(`__sw.mine()`); if (m) { if (m.over) stats.over = (stats.over || 0) + 1; if (m.usable && !m.uok) fail('Twin Sticks glow is covered or scrolled away'); } }
        const before = await ev(`({ h: G.players[0].hand.length, p: G.players[0].picked, t: G.turn, r: G.round })`);
        let did = false;
        // Twin Sticks: tap the glowing sticks on my tray, then two dishes
        const tw = await ev(`__sw.btn('#tbl .seat.me .grp.usable') || __sw.btn('#tbl .grp.usable')`);
        if (tw && cards.length >= 2 && R() < .8) { stats.twin++; await tap(tw.x, tw.y); await p.waitForTimeout(250); const tw2 = await ev(`UI.twin`); if (!tw2) fail('Twin Sticks glow did not respond'); else { const cs = await ev(`__sw.cards()`); const a = cs[0], b2 = cs[cs.length - 1]; await tap(a.x, a.y); await p.waitForTimeout(200); await tap(b2.x, b2.y); did = true; } }
        if (!did && R() < .2) { // hint: tap the bulb, then the glowing dish
          const bulb = await ev(`__sw.btn('#labacts .bulb') || __sw.btn('#acts [data-a=hint]')`);
          if (bulb) { stats.hints++; await tap(bulb.x, bulb.y); await p.waitForTimeout(350); const rec = (await ev(`__sw.cards()`)).filter(x => x.rec); const two = await ev(`UI.rec && UI.rec.pick.length === 2`);
            if (two) { const t2 = await ev(`__sw.btn('#tbl .grp.usable')`); if (t2) { await tap(t2.x, t2.y); await p.waitForTimeout(250); const cs = await ev(`__sw.cards().filter(x => UI.rec.pick.includes(x.i))`); for (const q of cs) { await tap(q.x, q.y); await p.waitForTimeout(200); } did = true; } else fail('hint wants Twin Sticks but nothing glows'); }
            else if (!rec.length) fail('hint shows no glowing dish'); else { await tap(rec[0].x, rec[0].y); did = true; } }
        }
        if (!did) { const cs = await ev(`__sw.cards()`); const q = cs[Math.floor(R() * cs.length)]; await tap(q.x, q.y); did = true; }
        await p.waitForTimeout(500);
        const after = await ev(`({ h: G.players[0].hand.length, p: G.players[0].picked, t: G.turn, r: G.round })`);
        if (JSON.stringify(before) === JSON.stringify(after) && (await ev(`canPick()`))) { nodead++; await p.waitForTimeout(300); const a2 = await ev(`({ h: G.players[0].hand.length, p: G.players[0].picked, t: G.turn, r: G.round })`); if (JSON.stringify(a2) === JSON.stringify(before) && (await ev(`canPick()`)) && !(await ev(`UI.twin`))) fail('tap on a dish did nothing'); }
        stats.turns++;
        continue;
      }
      // watching: a tap on the table hurries the reveal / pass / count
      if (st.busy && R() < .7) { const t = await ev(`(() => { const r = document.querySelector('#tbl').getBoundingClientRect(); return { x: r.left + r.width * (.3 + R0 * .4), y: r.top + r.height * .45 }; })()`.replace('R0', R().toFixed(3))); await tap(t.x, t.y); stats.hurry++; }
      await p.waitForTimeout(160);
    }
    if (!over && !fails.length) fail('game did not finish in time');
    if (over) { // Play again must start a fresh game
      const ag = await ev(`__sw.btn('#rs [data-a=again]')`); if (ag) { await tap(ag.x, ag.y); await p.waitForTimeout(900); const ok = await ev(`G.phase === 'pick' && G.round === 1 && !UI.busy`); if (!ok) fail('Play again did not start a new game'); }
    }
  } catch (e) { if (e) fail('crash ' + String(e.message || e).slice(0, 120)); }
  errs.forEach(e => fail(e));
  if (fails.length) { try { await p.screenshot({ path: path.join(__dirname, 'sweep-fail-' + tag + '.png') }); } catch (e) { } }
  await ctx.close();
  return { tag, fails, stats };
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0; const t0 = Date.now();
  for (let gi = 0; gi < N; gi++) for (const sz of SIZES) {
    const r = await game(b, gi, sz); const s = r.stats;
    console.log((r.fails.length ? 'FAIL ' : 'ok   ') + r.tag + ` overflowTurns ${s.over || 0} turns ${s.turns} rounds ${s.rounds} twin ${s.twin} hint ${s.hints} hurry ${s.hurry} rot ${s.rot} board ${s.board}% ${Math.round((Date.now() - t0) / 1000)}s` + (r.fails.length ? '\n   ' + r.fails.slice(0, 6).join('\n   ') : ''));
    if (r.fails.length) bad++;
  }
  console.log(bad ? 'SWEEP FAILED: ' + bad : 'SWEEP CLEAN'); await b.close(); process.exit(bad ? 1 : 0);
})();
