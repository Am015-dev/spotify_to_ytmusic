// Scripted sweep (no AI eyes): plays full Doorkick Dungeon games vs the computer through the real page with touch taps (and some mouse drags),
// only on things that glow, at phone sizes, plus a few rotations.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=doorkick.html] [maxMinutesPerGame=4]
// Fails on: page errors, a glowing target that does not respond, a picked card with no glow, a status line over 8 words, other visible text
// over 8 words, on-screen strengths / levels differing from the engine, anything stuck > 8 s, hand cards off screen, buttons covered,
// horizontal scroll, the [data-board] table under 55 % of a portrait screen, a ghost finger pointing at a move the engine would not allow.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 24, FILE = path.resolve(__dirname, process.argv[3] || 'doorkick.html'), MAXMIN = +process.argv[4] || 8;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const NPS = [4, 3, 5, 4, 6, 4];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TOT = { bubbles: {}, bulbs: 0, bulbNull: 0, rules: 0, tipsOff: 0, shots: {}, saved: {} };

const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .05 && !e.closest('[hidden]'); };
  const words = t => t.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
  window.__sw = {
    sig() { return JSON.stringify([G.turn, G.active, G.phase, G.ln, G.q && G.q.kind, G.cb && G.cb.stage, G.cb && G.cb.mons.length, G.cb && G.cb.os.length, UI.menu ? 1 : 0, UI.sell ? UI.sell.join('.') : 0, !!document.getElementById('bfrev'), BF.pick, !!BF.ask, GX.open || '', !document.getElementById('modal').hidden]); },
    st() { const me = 0, s = sideToAct(); return { turn: G.turn, win: G.winner, mine: s === me && P(me).human, phase: G.phase, q: G.q && G.q.kind, rev: !!document.getElementById('bfrev') || !!document.getElementById('bfclip'), kicking: BF.kicking, drag: !!BF.drag, pick: BF.pick, modal: !document.getElementById('modal').hidden, open: GX.open || '', menu: !!UI.menu, sell: !!UI.sell, ask: !!BF.ask }; },
    // things a player would tap right now (only glowing / lit things and the big buttons)
    cands() {
      const out = [], W = innerWidth, H = innerHeight;
      const add = (e, kind, pts) => { if (!vis(e) || e.disabled) return; const r = e.getBoundingClientRect();
        for (const [fx, fy] of pts || [[.5, .5]]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 2 || y < 2 || x > W - 2 || y > H - 2) continue; const t = document.elementFromPoint(x, y); if (t && (e === t || e.contains(t))) { out.push({ kind, x, y, id: e.dataset.card || e.dataset.bfz || e.dataset.opp || (e.textContent || '').trim().slice(0, 20), bfz: e.dataset.bfz || '' }); return } } };
      if (document.getElementById('bfrev') || document.getElementById('bfclip')) return out;
      const tg = [...document.querySelectorAll('[data-bfz]')];
      if (tg.length) { for (const e of tg) add(e, 'target', [[.5, .5], [.3, .4], [.7, .6], [.5, .25]]); return out }
      const mod = document.getElementById('modal'); if (!mod.hidden) { for (const b of mod.querySelectorAll('button')) { if (/new game|play again/i.test(b.textContent)) continue; add(b, 'modal') } return out }
      if (GX.open === 'dkCard') { for (const b of document.querySelectorAll('#dkCard [data-mv]')) add(b, 'cardopt'); for (const b of document.querySelectorAll('#dkCard [data-a=close],#dkCard .gx-x')) add(b, 'close'); return out }
      if (GX.open) { for (const b of document.querySelectorAll('.gx-drawer.on .gx-x')) add(b, 'close'); return out }
      for (const b of document.querySelectorAll('.arena .bfdoor')) add(b, 'kick');
      for (const b of document.querySelectorAll('.fbtns button')) add(b, 'fbtn');
      for (const b of document.querySelectorAll('#prompt .acts button, #prompt .asks [data-mv]')) { if (b.dataset.a === 'sellmode') { if (Math.random() < .12) add(b, 'dock'); continue } add(b, 'dock') }
      for (const b of document.querySelectorAll('#prompt [data-mv]')) add(b, 'dock');
      const hand = [...document.querySelectorAll('.mine .hand .card.play')];
      for (const e of hand) add(e, 'card', [[.2, .5], [.5, .5], [.8, .5], [.12, .35], [.9, .6]]);
      for (const e of document.querySelectorAll('.mine .gear .gchip.play')) add(e, 'gear');
      return out;
    },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const bd = document.querySelector('[data-board]'); if (!bd) bad.push('no data-board');
      else if (H > W) { const r = bd.getBoundingClientRect(); const pc = 100 * Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / (W * H); if (pc < 55) bad.push('board ' + pc.toFixed(1) + '% phase ' + G.phase + ' q ' + (G.q && G.q.kind) + ' sell ' + !!UI.sell + ' dock ' + Math.round(document.querySelector('.gx-dock').getBoundingClientRect().height) + ' ' + (document.querySelector('#prompt') || {}).className); }
      if (UI.lastErr) bad.push('UI.lastErr ' + UI.lastErr);
      const ln = document.querySelector('#prompt .bfline'); if (ln && vis(ln)) { const w = words(ln.textContent); if (w.length > 8) bad.push('status ' + w.length + ' words: ' + w.join(' ')); }
      // any other visible block over 8 words (outside the pop-ups the player opened)
      for (const e of document.body.querySelectorAll('*')) {
        if (/^(SCRIPT|STYLE|SVG|TEXT|TSPAN|PATH)$/i.test(e.tagName) || !vis(e) || getComputedStyle(e).display.startsWith('inline')) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        if (e.closest('.gx-drawer,#modal,#bfrev,.gx-scrim,.card,.gchip,.sr,[aria-hidden=true],[data-help]')) continue;
        const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
        const w = words(e.innerText || ''); if (w.length > 8) bad.push('wordy ' + w.length + 'w "' + w.slice(0, 5).join(' ') + '"');
      }
      // hand cards on screen, and every card shows a tappable slice
      const cards = [...document.querySelectorAll('.mine .hand .card')];
      cards.forEach((e, i) => { const r = e.getBoundingClientRect(); if ((r.left < -5 || r.right > W + 5) && !e.parentElement.classList.contains('scrolls') && !e.getAnimations().length) bad.push('hand card off screen x ' + Math.round(r.left) + '..' + Math.round(r.right));
        if (i < cards.length - 1 && !document.querySelector('.mine .hand.scrolls')) { const d = cards[i + 1].offsetLeft - e.offsetLeft; if (d < 22) bad.push('hand card slice ' + d + 'px'); } });
      // action buttons are not covered
      for (const b of document.querySelectorAll('.fbtns button, #prompt .acts button, .bfdoor')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); if (r.bottom > H + 1 || r.right > W + 1) { const dk = b.closest('.gx-dock-body') || b.closest('.gx-dock'); if (dk && dk.scrollHeight > dk.clientHeight + 2) continue; bad.push('button off screen ' + (b.textContent || '').trim().slice(0, 12)); continue }
        const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (t && !b.contains(t) && !t.contains(b) && !document.getElementById('bfrev')) bad.push('button covered ' + (b.textContent || '').trim().slice(0, 12) + ' by ' + t.tagName + '.' + String(t.className).split(' ')[0]); }
      // seats do not sit on the felt content, the fight is inside the table
      const ar = document.querySelector('.arena'), tb = document.querySelector('.table');
      if (ar && tb) { const a = ar.getBoundingClientRect(), t = tb.getBoundingClientRect(); for (const e of ar.querySelectorAll('.fbtns,.fbtns button,.score .num,.row.mons .card')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.bottom > t.bottom + 1 || r.top < t.top - 1) { bad.push('fight clipped: ' + [...ar.children].map(x => x.className.toString().split(' ')[0]).join('/') + ' ' + e.className.toString().slice(0, 18) + ' ' + Math.round(r.top) + '..' + Math.round(r.bottom) + ' table ' + Math.round(t.top) + '..' + Math.round(t.bottom)); break } } }
      // on-screen numbers equal the engine (not mid-flight)
      if (!document.getElementById('bfrev') && !BF.kicking) {
        const me = 0; const cb = G.cb;
        const h = document.querySelector('.arena .score.hero .num'), m = document.querySelector('.arena .score.mons .num');
        if (cb && !G.winner) { if (!h || +h.textContent !== sideStr(cb)) bad.push('hero total ' + (h && h.textContent) + ' != ' + sideStr(cb)); if (!m || +m.textContent !== monStr(cb)) bad.push('monster total ' + (m && m.textContent) + ' != ' + monStr(cb)); }
        else if (!cb && (h || m) && !document.querySelector('.outcome')) { /* a fight totals leftover with no fight */ if (G.phase !== 'main') bad.push('totals shown without a fight'); }
        const str = document.querySelector('.mine .bfstr'); if (str && !G.winner && +str.textContent.replace(/[^0-9-]/g, '') !== pStr(P(me))) bad.push('my strength ' + str.textContent + ' != ' + pStr(P(me)));
        const lv = document.querySelector('.mine .lv'); if (lv && +lv.textContent.replace(/\\D/g, '') !== P(me).lvl) bad.push('my level ' + lv.textContent + ' != ' + P(me).lvl);
        document.querySelectorAll('.opps .opp[data-opp]').forEach(e => { const p = G.pl[+e.dataset.opp]; if (!p) return; const l = e.querySelector('.slv'), w = e.querySelector('.sw'), g = e.querySelector('.sg');
          if (l && +l.textContent !== p.lvl) bad.push('seat level ' + l.textContent + ' != ' + p.lvl); if (w && +w.textContent.replace(/[^0-9-]/g, '') !== pStr(p)) bad.push('seat strength ' + w.textContent + ' != ' + pStr(p)); if (g && +g.textContent.replace(/\\D/g, '') !== p.eq.length) bad.push('seat gear ' + g.textContent + ' != ' + p.eq.length); });
        if (document.querySelectorAll('.opps .opp').length !== G.pl.length - 1) bad.push('seat count');
      }
      // the finger points at a move the engine allows
      const f = document.getElementById('bffing');
      if (f) { const [k, a, b] = (f.dataset.key || '').split(':'); if (k === 'kick') { if (!validMoves(0).some(x => x.act === 'kick')) bad.push('finger: kick not allowed'); }
        else if (k === 'drag') { if (!bfMoves(0, +a).some(x => x.z === b)) bad.push('finger: drag ' + a + ' to ' + b + ' not allowed'); const el = document.querySelector('.mine [data-card="' + a + '"]'); if (!el || !el.classList.contains('play')) bad.push('finger: card not glowing'); } }
      // help kit: bubbles stay on screen and never cover a glowing target; with tips off no coach bubble appears
      { const hb = [...document.querySelectorAll('.gxh-bub.on')]; if (!GXH.enabled() && hb.some(b => b.dataset.phase)) bad.push('a coach bubble with tips off');
        const cores = [...document.querySelectorAll('.mine .hand .card.play,[data-bfz],.bfdoor,.fbtns button,#prompt .acts button,.rec,.pulse')].filter(e => !e.closest('[data-help]') && vis(e)).map(e => e.getBoundingClientRect()).filter(q => q.right > 0 && q.bottom > 0 && q.left < W && q.top < H).map(q => { let w = q.width, h = q.height; const cx = q.left + w / 2, cy = q.top + h / 2; if (w > 56) w = 32; if (h > 56) h = 32; return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 }; });
        for (const b of hb) { const r = b.getBoundingClientRect(); if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) bad.push('help bubble outside the screen');
          for (const c of cores) if (r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top) { bad.push('help bubble covers a glowing target in phase ' + (typeof hlpPhase === 'function' ? hlpPhase() : '?') + ' ' + JSON.stringify(c)); break; } } }
      return bad;
    }
  };
})()`;

async function tapAt(page, x, y) { await page.touchscreen.tap(x, y); }
async function dragTo(page, from, to) { await page.mouse.move(from.x, from.y); await page.mouse.down(); const n = 8; for (let i = 1; i <= n; i++) { await page.mouse.move(from.x + (to.x - from.x) * i / n, from.y + (to.y - from.y) * i / n); await sleep(16); } await page.mouse.up(); }

async function playGame(browser, size, gi, rep) {
  const [W, H] = size, tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, drags: 0, turns: 0, fights: 0, kinds: {}, rot: 0 };
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load|net::/.test(m.text())) errs.push('console: ' + m.text().slice(0, 140)); });
  const anim = gi % 3 === 0 ? 1 : 0, learn = gi % 5 === 4, np = NPS[gi % NPS.length];
  try {
    await page.goto('file://' + FILE); await page.evaluate(() => { try { localStorage.clear(); localStorage.setItem('dkd_offer', '1') } catch (e) { } }); await page.reload(); await sleep(500);   // dkd_offer: a player who already saw the "New here?" tutorial offer (tutor-test.js covers the offer)
    await page.evaluate(PAGE);
    await page.evaluate(([seed, anim, np, learn]) => { setSeed(seed); ANIM = anim; AIDELAY = anim ? 90 : 0; UI.n = np; UI.lvl = ['easy', 'normal', 'hard'][seed % 3]; UI.learn = learn; UI.speed = 1; }, [1000 + gi * 7 + W, anim, np, learn]);
    if (learn) await page.evaluate(() => { try { localStorage.removeItem('dkd_learned'); localStorage.removeItem('dkd_bf') } catch (e) { } });
    await page.evaluate(() => { const b = document.querySelector('#modal [data-set="n"][data-v="' + UI.n + '"]'); b && b.click(); const l = document.querySelector('#modal [data-a="learnon"]'); if (UI.learn && !(UI.learn === true && l && /✓/.test(l.textContent))) { } });
    await page.click('#modal [data-start="F"]'); await sleep(500);
    await page.evaluate(([learn]) => { G.learn = !!learn; render(); }, [learn]);
    const tipsOn = gi % 5 !== 3; if (!tipsOn) { await page.evaluate(() => GXH.setEnabled(false)); TOT.tipsOff++; }
    const t0 = Date.now(); let lastDragFail = null, lastNothing = null, last = '', lastAt = Date.now(), steps = 0, audits = 0, rotated = false;
    // ---- help kit checks: each bubble once, never over the target or a glow, dismisses on a tap; the bulb finger == the advisor's move; rules cards
    const seenPh = new Set(); let bulbN = 0; const NEUTRAL = [50, 14];
    const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
    const ctr = sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; }, sel);
    const rulesCheck = async ph => { TOT.rules++;
      const R = await page.evaluate(() => { const e = document.querySelector('.gxh-rules'); if (!e) return null; const out = [], n = +e.dataset.count;
        for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg') }); if (i < n - 1) e.querySelector('.gxh-next').click(); }
        const r = e.querySelector('.gxh-card').getBoundingClientRect(); return { n, cards: out, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
      if (!R) { issues.add('rules cards did not open (' + ph + ')'); return; }
      if (R.n < 2 || R.n > 4) issues.add('rules for ' + ph + ' have ' + R.n + ' cards (want 2-4)');
      R.cards.forEach(c => { if (wc(c.x) > 20) issues.add('rules card over 20 words (' + ph + '): ' + c.x); if (!c.pic) issues.add('rules card without a picture (' + ph + '): ' + c.t); });
      if (!R.inside) issues.add('rules card outside the screen (' + ph + ')');
      await page.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await sleep(100);
      if (await page.evaluate(() => !!document.querySelector('.gxh-rules'))) issues.add('rules cards did not close'); };
    const audit = async () => { const bad = await page.evaluate(() => __sw.audit()); bad.forEach(b => issues.add(b)); const hb = bad.find(b => /help bubble/.test(b)); if (hb && (TOT.badshots = (TOT.badshots || 0) + 1) <= 4) await page.screenshot({ path: '/tmp/claude-0/helpbad_' + W + '_' + gi + '_' + TOT.badshots + '.png' }).catch(() => { }); };
    const helpFlow = async () => {
      const hs = await page.evaluate(() => ({ ph: hlpPhase(), step: !!HLP_STEPS[hlpPhase()], st: GXH.state() }));
      if (hs.st.rules) { issues.add('rules overlay stuck open'); await page.evaluate(() => GXH.hide()); return false; }
      // 1) the first-time bubble of this phase (once)
      if (tipsOn && hs.ph && hs.step && !seenPh.has(hs.ph)) { seenPh.add(hs.ph);
        let b = null; const t1 = Date.now();
        while (Date.now() - t1 < 2500) { b = await page.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const r = e.getBoundingClientRect();
            return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T: tq && [tq.left, tq.top, tq.right, tq.bottom] }; }, hs.ph).catch(() => null); if (b) break; await sleep(80); }
        if (!b) { if (await page.evaluate(ph => hlpPhase() === ph && HLP_STEPS[ph].target() && !GXH.state().cur, hs.ph)) issues.add('no coach bubble for phase ' + hs.ph); return false; }
        TOT.bubbles[hs.ph] = (TOT.bubbles[hs.ph] || 0) + 1;
        if (b.id !== hs.ph) issues.add('bubble for ' + b.id + ' shown in phase ' + hs.ph);
        if (wc(b.title) > 4) issues.add('bubble title over 4 words: ' + b.title); if (wc(b.text) > 20) issues.add('bubble text over 20 words (' + wc(b.text) + '): ' + b.text);
        if (!b.arrow || !b.ok) issues.add('bubble without arrow or Got it (' + hs.ph + ')');
        if (b.T) { const [l, t, r, bt] = b.r; if (l < b.T[2] && r > b.T[0] && t < b.T[3] && bt > b.T[1]) issues.add('bubble covers its target (' + hs.ph + ')'); }
        await audit(); TOT.shots[hs.ph] || await shotOnce('bubble', hs.ph);
        await tapAt(page, ...NEUTRAL); await sleep(140);
        if (await page.evaluate(() => !!document.querySelector('.gxh-bub'))) issues.add('bubble did not dismiss on a tap (' + hs.ph + ')');
        return true; }
      // 2) the lightbulb: the first time in every phase, then now and then
      if (hs.ph && (!seenPh.has('bulb:' + hs.ph) || Math.random() < .2) && bulbN < 14) { seenPh.add('bulb:' + hs.ph); bulbN++; TOT.bulbs++;
        const pre = await page.evaluate(() => { const me = viewSeat(); const co = coach(me); const m = co && co.rec; const sug = hlpSuggest(); let p = null;
          if (sug && m) { const q = hlpPlan(m, me), c = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); if (q) p = { to: c(q.toR), from: q.fromR ? c(q.fromR) : null }; }
          return { has: !!sug, key: m && mvKey(m), card: m && m.card, act: m && m.act, legal: !!(m && validMoves(me).some(x => mvKey(x) === mvKey(m))), plan: p, sig: G.ln + '|' + (G.q && G.q.kind) + '|' + G.phase + '|' + (UI.sell ? 1 : 0) }; });
        const bb = await ctr('#bulbbtn'); if (!bb) { issues.add('no bulb button'); return false; }
        await tapAt(page, ...bb); await sleep(350);
        const r = await page.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), ru = document.querySelector('.gxh-rules'); let fromCard = null, toKey = null;
          if (f && f.dataset.fx != null) { const e = document.elementFromPoint(+f.dataset.fx, +f.dataset.fy); const c = e && e.closest('[data-card]'); fromCard = c ? +c.dataset.card : null; window.__fe = e ? (e.id || String(e.className).slice(0, 40)) + '@' + Math.round(+f.dataset.fx) + ',' + Math.round(+f.dataset.fy) : 'none'; }
          if (f) { const e = document.elementFromPoint(+f.dataset.tx, +f.dataset.ty); const c = e && e.closest('[data-mv]'); try { toKey = c ? mvKey(JSON.parse(c.dataset.mv)) : (e && e.closest('.bfdoor') ? 'door' : null); } catch (x) { } }
          return { fe: window.__fe, f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!ru, fromCard, toKey, sig: G.ln + '|' + (G.q && G.q.kind) + '|' + G.phase + '|' + (UI.sell ? 1 : 0) }; });
        if (pre.has && pre.plan) {
          if (!pre.legal) issues.add('bulb suggestion not legal (' + pre.key + ')');
          if (!r.f) issues.add('bulb tapped, no finger (' + hs.ph + ' ' + pre.key + ')');
          else { if (Math.abs(+r.f.tx - pre.plan.to.x) > 2 || Math.abs(+r.f.ty - pre.plan.to.y) > 2) issues.add('bulb finger target != the advisor move (' + hs.ph + ' ' + pre.key + ')');
            if (pre.plan.from && (r.f.fx == null || Math.abs(+r.f.fx - pre.plan.from.x) > 2 || Math.abs(+r.f.fy - pre.plan.from.y) > 2)) issues.add('bulb finger start != the suggested card (' + hs.ph + ')');
            if (pre.card != null && pre.plan.from && r.fromCard !== pre.card) issues.add('bulb finger starts on card ' + r.fromCard + ' (' + r.fe + '), advisor says ' + pre.card);
            if (pre.card == null && pre.act !== 'ask' && r.toKey != null && r.toKey !== pre.key && !(pre.act === 'kick' && r.toKey === 'door')) issues.add('bulb finger points at ' + r.toKey + ', advisor says ' + pre.key); }
          if (!r.ring) issues.add('bulb: nothing glows at the suggestion');
          if (!r.why || wc(r.why) > 15 || /…/.test(r.why)) issues.add('bulb why ' + wc(r.why) + ' words: ' + r.why); if (!r.link) issues.add('bulb bubble has no "How does this work?"');
          await audit(); TOT.shots.bulb || await shotOnce('bulb', 'suggestion');
          if (Math.random() < .5 && r.link) { const lk = await ctr('.gxh-bub .gxh-link'); if (lk) { await tapAt(page, ...lk); await sleep(250); await rulesCheck(hs.ph); } } else { await tapAt(page, ...NEUTRAL); await sleep(150); }
        } else { TOT.bulbNull++; if (r.f) issues.add('bulb with no suggestion still pointed a finger (' + hs.ph + ')'); if (!r.rules) issues.add('bulb with no suggestion did not open the rules (' + hs.ph + ')'); else { TOT.shots.rules || !['main', 'fight', 'after', 'post'].includes(hs.ph) || await shotOnce('rules', 'card'); await rulesCheck(hs.ph); } }
        await page.evaluate(() => GXH.hide());
        const a = await page.evaluate(() => ({ g: !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'), sig: G.ln + '|' + (G.q && G.q.kind) + '|' + G.phase + '|' + (UI.sell ? 1 : 0) }));
        if (a.g) issues.add('help still on screen after a tap (' + hs.ph + ')');
        if (a.sig !== pre.sig && !(r.f && r.f.tx == null)) issues.add('tapping the bulb changed the game (' + pre.sig + ' -> ' + a.sig + ')');
        return true; }
      return false; };
    const shotOnce = async (kind, ph) => { if (!process.env.HELPSHOTS || W !== 390 || H !== 763) { if (kind === 'bubble') TOT.shots[ph] = 1; return; } TOT.shots[kind === 'bubble' ? ph : kind] = 1; if (TOT.saved[kind]) return; TOT.saved[kind] = 1;
      const name = { bubble: 'help-coach-bubble', bulb: 'help-bulb-suggestion', rules: 'help-rules-card' }[kind]; await page.screenshot({ path: path.join(__dirname, 'playtest', name + '-390x763.png') }).catch(() => { }); };
    for (; ;) {
      steps++;
      if (Date.now() - t0 > MAXMIN * 60000) { issues.add('game ran over ' + MAXMIN + ' min (turn ' + (await page.evaluate(() => G.turn)) + ')'); break; }
      const st = await page.evaluate(() => __sw.st());
      if (st.win) break;
      const sig = await page.evaluate(() => __sw.sig());
      if (sig !== last) { last = sig; lastAt = Date.now(); } else if (Date.now() - lastAt > 8000) { issues.add('stuck > 8 s: ' + JSON.stringify(st)); await page.screenshot({ path: path.join(__dirname, 'playtest', 'sweep-stuck-' + W + '-' + gi + '.png') }).catch(() => { }); break; }
      // audit at idle moments (every few steps; always when it is my decision)
      if ((st.mine && !st.rev && !st.kicking && !st.open && !st.modal && !st.menu) && steps % 3 === 0) { if (process.env.SHOTS && steps % +process.env.SHOTS === 0) await page.screenshot({ path: process.env.SHOTDIR + '/' + W + '-g' + gi + '-' + steps + '.png' }).catch(() => { }); audits++; const bad = await page.evaluate(() => __sw.audit()); bad.forEach(b => issues.add(b)); }
      // one rotation in the middle of some games
      if (!rotated && gi % 4 === 1 && st.turn >= 6 && st.mine) { rotated = true; stats.rot++; await page.setViewportSize({ width: H, height: W }); await sleep(700); const bad = await page.evaluate(() => { const de = document.documentElement; const o = []; if (Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1) o.push('rot hscroll'); const ar = document.querySelector('.arena'); const t = document.querySelector('.table'); if (!t) o.push('rot no table'); return o }); bad.forEach(b => issues.add(b)); await page.setViewportSize({ width: W, height: H }); await sleep(700); continue; }
      if (!st.mine || st.rev || st.kicking || st.drag) { await sleep(st.rev ? 150 : 60); continue; }
      if (await helpFlow()) continue;
      const cs = await page.evaluate(() => __sw.cands());
      if (!cs.length) { await sleep(120); continue; }
      // prefer progress (kick / fight / end), sometimes play a card, sometimes drop a held card
      const pri = cs.filter(c => c.kind === 'kick' || c.kind === 'fbtn' || (c.kind === 'dock'));
      let c; const r = Math.random();
      if (cs.some(x => x.kind === 'target')) c = cs[Math.floor(Math.random() * cs.length)];
      else if (cs.some(x => x.kind === 'modal' || x.kind === 'cardopt')) c = cs[Math.floor(Math.random() * cs.length)];
      else if (pri.length && r < .5) c = pri[Math.floor(Math.random() * pri.length)];
      else { const cards = cs.filter(x => x.kind === 'card' || x.kind === 'gear'); c = cards.length ? cards[Math.floor(Math.random() * cards.length)] : cs[Math.floor(Math.random() * cs.length)]; }
      stats.kinds[c.kind] = (stats.kinds[c.kind] || 0) + 1;
      const before = await page.evaluate(() => __sw.sig());
      if ((c.kind === 'card' || c.kind === 'gear') && Math.random() < .4 && !st.sell) {
        // drag it: pick the card up with a mouse drag onto a glowing target (found after a tap-less pointerdown)
        await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x, c.y - 24, { steps: 3 }); await sleep(60);
        const tg = await page.evaluate(() => [...document.querySelectorAll('[data-bfz]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 3 }).map(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
        if (!tg.length) { const dbg = await page.evaluate(id => JSON.stringify({ n: cname(+id), drag: !!BF.drag, down: !!BF.down, mv: bfMoves(0, +id).map(x => x.z), vm: validMoves(0).filter(m => m.card === +id).map(m => m.act), sell: !!UI.sell, ph: G.phase }), c.id); await page.mouse.up(); await sleep(300); if (lastDragFail === c.id) issues.add('dragged glowing card shows no glow ' + c.id + ' ' + dbg); lastDragFail = c.id; continue }
        const t = tg[Math.floor(Math.random() * tg.length)]; await page.mouse.move(t.x, t.y, { steps: 8 }); await sleep(40); await page.mouse.up(); stats.drags++; stats.taps++; await sleep(420);
      } else { await tapAt(page, c.x, c.y); stats.taps++; }
      await sleep(anim ? 220 : 90);
      // a tapped card must now glow some target (or open its choices); a tapped target must change the game
      if ((c.kind === 'card' || c.kind === 'gear') && !st.sell) { const g = await page.evaluate(() => ({ t: document.querySelectorAll('[data-bfz]').length, m: !!UI.menu, pick: BF.pick, ask: !!BF.ask, ln: G.ln, q: !!G.q })); if (!g.t && !g.m && g.pick == null && !g.ask) { const s2 = await page.evaluate(() => __sw.sig()); if (s2 === before && lastNothing === c.id) issues.add('tapped glowing card did nothing ' + c.id + ' ' + await page.evaluate(id => { const e = document.querySelector('.mine [data-card="' + id + '"]'); return JSON.stringify({ n: cname(+id), ph: G.phase, cls: e && e.className, sell: !!UI.sell, mv: bfMoves(0, +id).length, vm: validMoves(0).filter(m => m.card === +id).map(m => m.act), x: Math.round(e ? e.getBoundingClientRect().left : -1) }) }, c.id)); if (s2 === before) lastNothing = c.id; else lastNothing = null } }
      if (c.kind === 'target') { await sleep(anim ? 500 : 100); const s2 = await page.evaluate(() => __sw.sig()); if (s2 === before) { await sleep(900); const s3 = await page.evaluate(() => __sw.sig()); if (s3 === before) issues.add('glowing target did not respond ' + c.bfz) } }
      if (c.kind === 'kick') await sleep(anim ? 700 : 150);
    }
    const end = await page.evaluate(() => ({ turn: G.turn, win: G.winner, lvl: G.pl.map(p => p.lvl).join(',') }));
    return { tag, errs, issues: [...issues], stats, end, audits, anim, learn, np };
  } catch (e) { return { tag, errs: errs.concat(['harness: ' + String(e.message).slice(0, 200)]), issues: [...issues], stats, end: null, audits: 0 }; }
  finally { await ctx.close(); }
}

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  require('fs').mkdirSync(path.join(__dirname, 'playtest'), { recursive: true });
  const jobs = []; for (let i = 0; i < N; i++) jobs.push([SIZES[i % 2], Math.floor(i / 2)]);
  const POOL = +process.env.JOBS || 3; let bad = 0, idx = 0; const results = [];
  const worker = async () => { while (idx < jobs.length) { const j = jobs[idx++]; const r = await playGame(browser, j[0], j[1], 0); results.push(r);
    const flag = r.errs.length || r.issues.length; if (flag) bad++;
    console.log((flag ? 'FAIL ' : 'ok   ') + r.tag + ' turn ' + (r.end && r.end.turn) + ' win ' + (r.end && r.end.win) + ' taps ' + r.stats.taps + ' drags ' + r.stats.drags + ' audits ' + r.audits + (r.anim ? ' anim' : '') + (r.learn ? ' learn' : '') + ' np' + r.np + (flag ? '\n   errs: ' + r.errs.join(' | ') + '\n   issues: ' + r.issues.slice(0, 8).join(' | ') : '')); } };
  await Promise.all(Array.from({ length: POOL }, worker));
  console.log('help kit: bubbles per phase ' + JSON.stringify(TOT.bubbles) + ', bulb taps ' + TOT.bulbs + ' (rules only ' + TOT.bulbNull + '), rules cards opened ' + TOT.rules + ', tips-off games ' + TOT.tipsOff);
  const done = results.filter(r => r.end && r.end.win).length;
  console.log('\n' + (bad ? 'SWEEP FAILED ' + bad + '/' + results.length : 'SWEEP CLEAN ' + results.length + ' games') + ' (' + done + ' reached a winner)');
  await browser.close(); process.exit(bad ? 1 : 0);
})();
