// Sweep: plays full games against the computer through the real page with touch taps on glowing targets only.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=5] [sizes=390x763,375x553] [mode=vs]
// Fails on: page errors, a glowing target that does not respond, the ghost finger off a glowing target, chip scores that differ from
// the engine, anything stuck for 8 s, a covered glowing target, horizontal scroll, text over 8 words, a board under 55% (portrait).
// Help kit (gx-help): tips ON from a fresh profile in 4 of 5 games (every first-time bubble appears once, points at its target, is short, never covers its target or a
// glowing thing, dismisses on a tap, and the game still completes); the 5th game has tips OFF (no bubble may appear). The bulb is tapped like a finger: its finger
// must be on the helper's own move, why <= 15 words, rules cards 2-4 of <= 20 words with a picture.
// Prints "FAIL ..." lines and "SWEEP PASS" or "SWEEP FAIL n".
const PW = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'hollowbough.html'));
const NG = +process.argv[2] || 5, SIZES = (process.argv[3] || '390x763,375x553').split(',').map(s => s.split('x').map(Number)), MODE = process.argv[4] || 'vs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const fails = []; const helpTotals = [];
function fail(tag, msg) { bad++; if (fails.length < 40) { fails.push(tag + ' ' + msg); console.log('FAIL', tag, msg); } }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
async function playGame(browser, W, H, gi, mode) {
  const tag = `${W}x${H} g${gi}`, R = rng(1000 + gi * 7 + W);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => fail(tag, 'pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) fail(tag, 'console ' + m.text().slice(0, 100)); });
  await p.goto('https://gns.test/'); await sleep(500);
  await p.evaluate(([m, s]) => { try { localStorage.clear(); } catch (e) { } UI.seed = s; AIDELAY = 50; UI.opt = { np: 2 + (s % 3), level: 'normal', solo: 1 }; newGame(m); }, [mode, 11 + gi * 3]);
  const tipsOn = gi % 5 !== 4; if (!tipsOn) await p.evaluate(() => GXH.setEnabled(false));
  await sleep(400);
  const seenPh = new Set(); let bulbN = 0; const HT = { bubbles: {}, bulbs: 0, nul: 0, rules: 0 }; helpTotals.push(HT);
  const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
  const NEUTRAL = [40, 22];
  async function rulesCheck(ph) {
    HT.rules++;
    const Rr = await p.evaluate(() => { const e = document.querySelector('.gxh-rules'); if (!e) return null; const out = [], n = +e.dataset.count; for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg'), inside: (() => { const r = e.querySelector('.gxh-card').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; })() }); if (i < n - 1) e.querySelector('.gxh-next').click(); } return { n, cards: out }; });
    if (!Rr) { fail(tag, 'rules cards did not open (' + ph + ')'); return; }
    if (Rr.n < 2 || Rr.n > 4) fail(tag, 'rules for ' + ph + ' have ' + Rr.n + ' cards (want 2-4)');
    Rr.cards.forEach(c => { if (wc(c.x) > 20) fail(tag, 'rules card over 20 words (' + ph + '): ' + c.x); if (!c.pic) fail(tag, 'rules card without a picture (' + ph + '): ' + c.t); if (!c.inside) fail(tag, 'rules card outside the screen (' + ph + ')'); });
    await p.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await sleep(100);
    if (await p.evaluate(() => !!document.querySelector('.gxh-rules'))) fail(tag, 'rules cards did not close');
  }
  const sig = () => p.evaluate(() => G ? G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length + G.q.opts.map(o => o.label).join('|') : '') + ':' + G.players.map(p => p.hand.length + '.' + p.dep.length).join(',') + ':' + JSON.stringify(G.players.map(p => [p.res, p.pts])) + ':' + G.phase + ':' + (UI.sel ? 'sel' : '') + ':' + UI.cards.length : 'x');
  let lastSig = '', lastT = Date.now(), steps = 0, passTaps = 0, shots = 0, dead = 0;
  for (; steps < 900; steps++) {
    const st = await p.evaluate(() => ({ over: G.phase === 'over', cards: UI.cards.length, busy: !!UI.animBusy, mine: (() => { const a = HB.actor(G); return a >= 0 && !G.players[a].ai; })(), q: G.q ? G.q.kind : '', logN: G.logN }));
    if (st.over) { if (!st.cards) break; }
    const s0 = await sig(); if (s0 !== lastSig) { lastSig = s0; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { fail(tag, 'stuck >8 s at ' + s0); console.log('  state:', JSON.stringify(await p.evaluate(() => ({ glows: document.querySelectorAll('.glow').length, mm: myMoves().length, moves: movesFor(HB.actor(G)).map(m => m.type + ':' + (m.label || '')).slice(0, 4), q: G.q ? JSON.stringify(G.q.opts.map(o => o.d)).slice(0, 300) : null, holder: UI.holder, actor: HB.actor(G), view: viewSeat(), cityOpen: !!UI.cityOpen, sel: !!UI.sel, acts: (document.querySelector('#acts') || {}).outerHTML.slice(0, 260), tray: UI.tm2 && UI.tm2.length, mmc: UI.mmc ? UI.mmc.k + ':' + UI.mmc.v.length : null, logN: G.logN, after: (() => { UI.mmc = null; renderBoard(); return document.querySelectorAll('#acts .tchip').length; })() })).catch(e => String(e)))); await p.screenshot({ path: path.join(__dirname, 'shots', 'sweep_stuck_' + W + '.png') }).catch(() => { }); break; }
    if (st.cards) { const ok = await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (ok) { await ok.tap().catch(() => { }); await sleep(120); } else await sleep(150); continue; }
    if (!st.mine || st.busy) { await sleep(100); continue; }

    // ---- help kit
    { const hs = await p.evaluate(() => ({ ph: hlpPhase(), st: GXH.state() }));
      if (hs.st.rules) { fail(tag, 'rules overlay stuck open'); await p.evaluate(() => GXH.hide()); continue; }
      if (!tipsOn && hs.st.shown.length) fail(tag, 'tips off but bubbles shown: ' + hs.st.shown.join());
      // 1) the first-time bubble of this phase
      if (tipsOn && hs.ph && !seenPh.has(hs.ph)) {
        seenPh.add(hs.ph); let b = null; const t1 = Date.now();
        while (Date.now() - t1 < 2500) {
          b = await p.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect(); return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T }; }, hs.ph).catch(() => null);
          if (b) break; await sleep(80);
        }
        if (!b) fail(tag, 'no coach bubble for phase ' + hs.ph);
        else {
          HT.bubbles[hs.ph] = (HT.bubbles[hs.ph] || 0) + 1;
          if (b.id !== hs.ph) fail(tag, 'bubble for ' + b.id + ' shown in phase ' + hs.ph);
          if (wc(b.title) > 4) fail(tag, 'bubble title over 4 words: ' + b.title); if (wc(b.text) > 20) fail(tag, 'bubble text over 20 words: ' + b.text);
          if (!b.arrow || !b.ok) fail(tag, 'bubble without arrow or Got it (' + hs.ph + ')');
          if (b.T) { const [l, t, r, bt] = b.r; if (l < b.T.right && r > b.T.left && t < b.T.bottom && bt > b.T.top) fail(tag, 'bubble covers its target (' + hs.ph + ')'); }
          const bad = await p.evaluate(() => { const W = innerWidth, Hh = innerHeight, out = []; for (const e of document.querySelectorAll('.gxh-bub.on')) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > Hh + 1) out.push('help bubble outside the screen');
            const cores = [...document.querySelectorAll('.glow,#acts .btn')].filter(x => !x.closest('[data-help]') && !x.closest('[hidden]')).map(x => x.getBoundingClientRect()).filter(q => q.width && q.height && q.right > 0 && q.bottom > 0 && q.left < W && q.top < Hh).map(q => { let w = q.width, h = q.height; const cx = q.left + w / 2, cy = q.top + h / 2; if (w > 56) w = 32; if (h > 56) h = 32; return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 }; });
            for (const c of cores) if (r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top) { out.push('help bubble covers a glowing target'); break; }
            for (const x of document.querySelectorAll('button')) { if (x.closest('[data-help]') || x.closest('[hidden]')) continue; const q = x.getBoundingClientRect(); if (q.width < 4 || q.height < 4) continue; const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom) { out.push('help bubble covers the middle of a button (' + (x.className || x.id || x.getAttribute('aria-label') || '').toString().slice(0, 20) + ')'); break; } } } return out; });
          bad.forEach(x => fail(tag, x + ' (' + hs.ph + ')'));
          if (bad.length && shots < 3) { shots++; await p.screenshot({ path: path.join(__dirname, 'shots', 'helpbad_' + W + '_' + gi + '_' + hs.ph + '.png') }).catch(() => { }); }
          await p.touchscreen.tap(...NEUTRAL); await sleep(150);
          if (await p.evaluate(() => !!document.querySelector('.gxh-bub'))) fail(tag, 'bubble did not dismiss on a tap (' + hs.ph + ')');
          continue;
        }
      }
      // 2) the lightbulb: the first time in every phase, then now and then
      if (hs.ph && (!seenPh.has('bulb:' + hs.ph) || R() < .2) && bulbN < 12) {
        seenPh.add('bulb:' + hs.ph); bulbN++; HT.bulbs++;
        const pre = await p.evaluate(() => { const s = hlpSuggest(); const a = HB.actor(G); let adv = null; try { adv = HB.AI.choose(G, a, 'normal'); } catch (e) { } const el = s && hlpEl(s.m), r = el && el.getBoundingClientRect(); return { sug: !!s, same: !!(s && adv && sameM(s.m, adv)), legal: !!(s && myMoves().some(m => sameM(m, s.m))), c: r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }, sig: G.logN + '|' + (UI.sel ? 's' : '') + '|' + (G.q ? G.q.kind : '') }; });
        const bb = await p.$('#bulbbtn'); if (!bb) { fail(tag, 'no bulb button'); continue; }
        const bx = await bb.boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(350);
        const r = await p.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), ru = document.querySelector('.gxh-rules'); return { f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!ru }; });
        if (pre.sug) {
          if (!pre.same) fail(tag, 'bulb suggestion differs from the helper\'s move (' + hs.ph + ')'); if (!pre.legal) fail(tag, 'bulb suggestion is not a legal move (' + hs.ph + ')');
          if (!r.f) fail(tag, 'bulb tapped, no finger (' + hs.ph + ')');
          else if (pre.c && (Math.abs(+r.f.tx - pre.c.x) > 3 || Math.abs(+r.f.ty - pre.c.y) > 3)) fail(tag, 'bulb finger ' + r.f.tx + ',' + r.f.ty + ' != the helper\'s target ' + Math.round(pre.c.x) + ',' + Math.round(pre.c.y) + ' (' + hs.ph + ')');
          if (!r.ring) fail(tag, 'bulb: nothing glows at the suggestion (' + hs.ph + ')');
          if (!r.why || wc(r.why) > 15) fail(tag, 'bulb why ' + wc(r.why) + ' words: ' + r.why); if (!r.link) fail(tag, 'bulb bubble has no "How does this work?"');
          { const bad = await p.evaluate(() => { const W = innerWidth, Hh = innerHeight, b = document.querySelector('.gxh-bub.on'); if (!b) return []; const r = b.getBoundingClientRect(); return (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > Hh + 1) ? ['bulb bubble outside the screen'] : []; }); bad.forEach(x => fail(tag, x)); }
          if (R() < .5 && r.link) { const lk = await p.$('.gxh-bub .gxh-link'); const lb = lk && await lk.boundingBox(); if (lb) { await p.touchscreen.tap(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(250); await rulesCheck(hs.ph); } }
          else if (!(await p.evaluate(() => !!UI.sel))) { await p.touchscreen.tap(...NEUTRAL); await sleep(150); }
        } else { HT.nul++; if (r.f) fail(tag, 'bulb with no suggestion still pointed a finger (' + hs.ph + ')'); if (!r.rules) fail(tag, 'bulb with no suggestion did not open the rules (' + hs.ph + ')'); else await rulesCheck(hs.ph); }
        await p.evaluate(() => GXH.hide());
        const a = await p.evaluate(() => ({ g: !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'), sig: G.logN + '|' + (UI.sel ? 's' : '') + '|' + (G.q ? G.q.kind : '') }));
        if (a.g) fail(tag, 'help still on screen after a tap (' + hs.ph + ')'); if (a.sig !== pre.sig) fail(tag, 'tapping the bulb changed the game (' + pre.sig + ' -> ' + a.sig + ')');
        continue;
      }
    }
    // checks on the table
    const chk = await p.evaluate(() => {
      const W = innerWidth, H = innerHeight, out = [];
      const de = document.documentElement; if (de.scrollWidth > W + 1) out.push('hscroll ' + de.scrollWidth + '>' + W);
      const b = document.querySelector('[data-board]'); if (!b) out.push('no data-board'); else if (H > W) { const r = b.getBoundingClientRect(); const pc = Math.round(100 * r.width * r.height / (W * H)); if (pc < 55) out.push('board ' + pc + '%'); }
      // chip scores vs engine
      document.querySelectorAll('.chip').forEach(c => { const s = c.dataset.seat; const t = (c.querySelector('.cp') || {}).textContent || ''; const eng = s === 'G' ? HB.grimScore(G).total : HB.score(G, +s).total; if (t.replace(/[^0-9-]/g, '') !== String(eng)) out.push('score chip ' + s + ' shows ' + t + ' engine ' + eng); });
      // text over 8 words in the play area
      document.querySelectorAll('#board *, .gx-bar #prompt').forEach(e => { if (e.closest('#zoom,#pc')) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const cs = getComputedStyle(e); if (cs.display.startsWith('inline') || cs.visibility === 'hidden') return; const w = (e.innerText || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(x => /[a-z][a-z]/i.test(x)); if (w.length > 8) out.push('text ' + w.length + ' words: ' + w.slice(0, 5).join(' ')); });
      // glowing targets: visible, on screen, not covered; finger on a glowing target
      const gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
      gl.forEach(e => { const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 0 || cy < 0 || cx > W || cy > H) { out.push('glow off screen ' + (e.dataset.t || e.className)); return; } const t = document.elementFromPoint(cx, cy); if (!t || !(e === t || e.contains(t) || t.contains(e))) { /* overlapped strip cards: any point of the element must be hittable */ let ok = false; for (const [fx, fy] of [[.15, .5], [.85, .5], [.5, .2], [.5, .8]]) { const q = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy); if (q && (e === q || e.contains(q))) ok = true; } if (!ok) out.push('glow covered ' + (e.dataset.t || e.className) + ' by ' + (t ? (t.id ? '#' + t.id : '') + '.' + String(t.className && t.className.baseVal === undefined ? t.className : 'svg') + ' in ' + String(((t.closest('[class]') || {}).className) || '') : 'nothing') + ' at ' + Math.round(cx) + ',' + Math.round(cy)); } });
      const f = document.querySelector('#finger'); if (f && !f.hidden && gl.length) { const br0 = document.querySelector('#board').getBoundingClientRect(), tipx = br0.left + parseFloat(f.style.left) + 19, tipy = br0.top + parseFloat(f.style.top) + 4; const hit = gl.some(e => { const r = e.getBoundingClientRect(); return tipx >= r.left - 6 && tipx <= r.right + 6 && tipy >= r.top - 6 && tipy <= r.bottom + 6; }); if (!hit) out.push('finger not on a glowing target'); }
      return out;
    });
    chk.forEach(c => fail(tag, c));
    if (chk.length && shots < 3) { shots++; await p.screenshot({ path: path.join(__dirname, 'shots', 'fail_' + W + '_' + gi + '_' + shots + '.png') }).catch(() => { }); console.log('  q:', await p.evaluate(() => G.q ? JSON.stringify({ kind: G.q.kind, title: G.q.title, opts: G.q.opts.map(o => o.label) }) : 'none')); }
    // choose a glowing target (prefer a tray chip when open)
    const tg = await p.evaluate(() => { const gl = [...document.querySelectorAll('.glow')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; }); return gl.map(e => { const r = e.getBoundingClientRect(); return { t: e.dataset.t || e.dataset.mi || e.className, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, tray: e.classList.contains('tchip') }; }); });
    if (!tg.length) {
      // nothing glows: only Pass is left (tap twice, it asks "Sure?")
      const pb = await p.$('#acts .pass'); if (!pb) { await sleep(150); continue; }
      passTaps++; await pb.tap().catch(() => { }); await sleep(120); const pb2 = await p.$('#acts .pass'); if (pb2) await pb2.tap().catch(() => { }); await sleep(250); continue;
    }
    const trays = tg.filter(x => x.tray); const pool = trays.length ? trays : tg;
    // the compact city strip opens full screen: 15 slots, nothing changes in the game, a glowing destination in it can be used, Done closes it
    if (R() < .06) {
      const cb = await p.$('#acts:not(.tray) ~ .cityopen, .cityopen'); const trayUp = await p.$('#acts.tray');
      if (cb && !trayUp) {
        const l0 = await p.evaluate(() => G.logN); { const br = await cb.boundingBox(); await p.touchscreen.tap(br.x + br.width - 16, br.y + br.height - 8); } await sleep(250);
        const o = await p.evaluate(() => { const e = document.querySelector('#cityov'); if (!e) return null; const cells = e.querySelectorAll('.cvcell').length; const gl = [...e.querySelectorAll('.cvc.glow')].map(x => { const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); const other = document.querySelectorAll('#bd .glow:not(#cityov .glow):not(.tchip)').length; const de = document.documentElement; return { cells, gl, other, hs: de.scrollWidth > innerWidth + 1, logN: G.logN }; });
        if (!o) { const hit = await p.evaluate(() => { const b = document.querySelector('.cityopen'); if (!b) return 'no strip'; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (e ? (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal === undefined ? e.className : 'svg') : 'none') + ' busy=' + !!UI.animBusy + ' cards=' + UI.cards.length + ' mine=' + (myMoves().length > 0); }); fail(tag, 'tap on the city strip did not open the city (' + hit + ')'); }
        else {
          if (o.cells < 15) fail(tag, 'city view shows ' + o.cells + ' slots');
          if (o.other) fail(tag, 'glow outside the open city view: ' + o.other);
          if (o.hs) fail(tag, 'hscroll in city view');
          if (o.logN !== l0) fail(tag, 'opening the city changed the game');
          if (o.gl.length && R() < .6) { await p.touchscreen.tap(o.gl[0].x, o.gl[0].y); await sleep(500); const gone = await p.evaluate(() => !document.querySelector('#cityov')); if (!gone) { fail(tag, 'city view stayed open after using a destination'); } if (await p.$('#cityov')) { const x = await p.$('#cityov .cvx'); if (x) await x.tap().catch(() => { }); } continue; }
          const x = await p.$('#cityov .cvx'); if (x) await x.tap().catch(() => { }); await sleep(200);
          if (await p.$('#cityov')) fail(tag, 'Done did not close the city view');
        }
        continue;
      }
    }
    // sometimes explore a non-glowing card (must not act): a dead-looking tap must not change the game
    if (R() < .04) { const n = await p.evaluate(() => { const e = document.querySelector('.sc:not(.glow),.mc:not(.glow):not(.empty)'); if (!e) return null; const r = e.getBoundingClientRect(); const c = [r.left + r.width / 2, r.top + r.height / 2]; const hit = document.elementFromPoint(c[0], c[1]); return { c, logN: G.logN, ok: !!hit }; }); if (n && n.ok) { await p.touchscreen.tap(n.c[0], n.c[1]); await sleep(200); const l2 = await p.evaluate(() => G.logN); if (l2 !== n.logN) fail(tag, 'tap on a non-glowing card changed the game'); const cv = await p.$('#cityov .cvx'); if (cv) { await cv.tap().catch(() => { }); await sleep(150); } } }
    const pick = pool[Math.floor(R() * pool.length)];
    const before = await sig();
    await p.touchscreen.tap(pick.x, pick.y);
    let changed = false; for (let k = 0; k < 15; k++) { await sleep(100); if ((await sig()) !== before) { changed = true; break; } }
    if (!changed) { await p.screenshot({ path: path.join(__dirname, 'shots', 'dead_' + W + '_' + gi + '.png') }).catch(() => { }); console.log('  q:', await p.evaluate(() => G.q ? JSON.stringify({ kind: G.q.kind, title: G.q.title, opts: G.q.opts.map(o => o.label), sel: !!UI.sel }) : 'none')); dead++; const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal === undefined ? e.className : 'svg') + ' in ' + ((e.closest('[data-a]') || {}).className || '?') : 'none'; }, [pick.x, pick.y]); fail(tag, 'glowing target did not respond (top element ' + hit + '): ' + pick.t + ' at ' + Math.round(pick.x) + ',' + Math.round(pick.y)); if (dead > 3) break; }
    if (steps === 40 && shots < 1 && gi === 0) { shots++; await p.screenshot({ path: path.join(__dirname, 'shots', 'sweep_mid_' + W + 'x' + H + '.png') }).catch(() => { }); }
  }
  const fin = await p.evaluate(() => G && G.phase === 'over' ? G.over.scores.map(s => s.total) : null);
  if (!fin) fail(tag, 'game did not finish in ' + steps + ' steps');
  console.log(tag, 'done', fin ? 'scores ' + fin.join('/') : 'UNFINISHED', 'steps', steps, 'passTaps', passTaps);
  await ctx.close();
}
(async () => {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const jobs = []; for (let g = 0; g < NG; g++) jobs.push(() => playGame(b, W, H, g, MODE).catch(e => fail(`${W}x${H} g${g}`, 'crash ' + String(e.message).slice(0, 160)))); for (let i = 0; i < jobs.length; i += 3) await Promise.all(jobs.slice(i, i + 3).map(f => f())); }
  await b.close();
  { const T = { bubbles: {}, bulbs: 0, nul: 0, rules: 0 }; helpTotals.forEach(h => { for (const k in h.bubbles) T.bubbles[k] = (T.bubbles[k] || 0) + h.bubbles[k]; T.bulbs += h.bulbs; T.nul += h.nul; T.rules += h.rules; }); console.log('help: bubbles ' + JSON.stringify(T.bubbles) + ', bulb taps ' + T.bulbs + ' (' + T.nul + ' with no suggestion), rules opened ' + T.rules); }
  console.log(bad ? 'SWEEP FAIL ' + bad : 'SWEEP PASS');
  process.exit(bad ? 1 : 0);
})();
