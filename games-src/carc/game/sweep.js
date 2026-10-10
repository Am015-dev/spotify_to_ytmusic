// Scripted bug sweep: plays the REAL page with touch taps (only glowing targets) and checks every step.
//   cd games-src/carc/game/src && python3 build.py   then   NODE_PATH=/opt/node-tools/node_modules node ../sweep.js
//   env: GAMES=24 (full games, split over both phone sizes) ROT=4 (of them rotate mid-game) STORY=1 (play story chapters) C1=300 (headless chapter-1 simulations) PAR=3 URL=file://...
// Per step: no page/console errors; a placement glow or a follower spot or Skip exists on my turn; a tap on it changes the game within 2 s;
// ghost finger sits on the control it points at and that move is legal; scores, followers and tiles-left on screen = engine;
// no horizontal scroll; no glow covered or cut off; nothing stuck for 8 s; the result card appears at the end.
const PW = require(process.env.PW || 'playwright'), fs = require('fs'), path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, 'rampart.html');
const GAMES = process.env.GAMES != null ? +process.env.GAMES : 24, ROT = process.env.ROT != null ? +process.env.ROT : 4, PAR = +process.env.PAR || 3;
const STORY = process.env.STORY != null ? +process.env.STORY : 1, C1N = process.env.C1 != null ? +process.env.C1 : 300;
const SHOTS = path.join(__dirname, 'sweep-shots'); fs.mkdirSync(SHOTS, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]], VARIANTS = [{}, { river: 1 }, { river: 1, ic: 1 }, { river: 1, ic: 1, tb: 1 }, { tb: 1 }, { ic: 1 }];
const fails = [], stat = { games: 0, steps: 0, hints: 0, places: 0, figs: 0, rotates: 0, scorePops: 0, results: 0, rots: 0 }; let seed = +process.env.SEED || 777;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let shotN = 0;
async function fail(p, tag, kind, detail) {
  const key = tag + kind + String(detail).slice(0, 50); if (fails.some(f => f.key === key)) return;
  const f = { key, tag, kind, detail: String(detail).slice(0, 300) };
  if (shotN < 12) { f.shot = 'f' + (++shotN) + '.png'; try { await p.screenshot({ path: path.join(SHOTS, f.shot) }); } catch (e) { } }
  fails.push(f); console.log('  FAIL', tag, kind, f.detail);
}
async function newPage(b, W, H) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Fetch API cannot load|Failed to load|favicon|fonts/.test(m.text())) p.errs.push('console ' + m.text()); });
  await p.goto(URL); await sleep(300); return p;
}
// ---------- in-page probe ----------
const PROBE = () => {
  const out = { over: false, sig: '', bad: [] };
  if (typeof G === 'undefined' || !G) return out;
  out.tw = !!UI.tw; out.over = !!G.over; out.mine = myTurn(); out.step = G.step; out.turn = G.turn; out.sig = G.turn + ':' + G.step + ':' + G.order.length + ':' + G.figs.length + ':' + (G.over ? 'o' : '');
  const bd = document.querySelector('#board').getBoundingClientRect();
  const center = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none'; };
  out.glows = [...document.querySelectorAll('.glow')].filter(vis).map(e => ({ ...center(e), x0: +e.dataset.x, y0: +e.dataset.y, hint: e.classList.contains('hintspot') }));
  out.fglows = [...document.querySelectorAll('.fglow')].filter(vis).map(e => ({ ...center(e), hint: e.classList.contains('hintspot') }));
  const sk = document.querySelector('#hskip'); out.skip = sk && vis(sk) ? { ...center(sk), hint: sk.classList.contains('hintspot') } : null;
  const ht = document.querySelector('#htile'); out.htile = ht && !ht.disabled && vis(ht) ? center(ht) : null; out.rots = UI.rots ? UI.rots.length : 0; out.rot = UI.rot;
  const gh = document.querySelector('#ghost'); out.ghost = gh ? center(gh) : null; out.hint = UI.hint; out.hintFig = UI.hintFig;
  out.legalAtRot = UI.legal ? UI.legal.filter(g => g.r === UI.rot).length : 0;
  out.status = document.querySelector('#status').textContent; out.words = out.status.trim().split(/\s+/).length;
  // on-screen = engine
  G.pl.forEach(p => { const c = document.querySelector('.seat[data-i="' + p.i + '"]'); if (!c) { out.bad.push('no chip ' + p.i); return; }
    const sc = +c.querySelector('b').textContent; if (sc !== p.score) out.bad.push('score ' + p.nm + ' shows ' + sc + ' engine ' + p.score);
    const fl = c.querySelector('.fl').textContent.replace(/\s+/g, ''); if (!fl.startsWith(String(p.sup.f))) out.bad.push('followers ' + p.nm + ' shows ' + fl + ' engine ' + p.sup.f); });
  const tl = +document.querySelector('#left b').textContent; if (tl !== tilesLeft()) out.bad.push('tiles left shows ' + tl + ' engine ' + tilesLeft());
  const nt = document.querySelectorAll('#world .tl').length; if (nt !== G.order.length) out.bad.push('tiles drawn ' + nt + ' engine ' + G.order.length);
  const nm = document.querySelectorAll('#ov .mp:not(.gone)').length; if (nm !== G.figs.length) out.bad.push('followers drawn ' + nm + ' engine ' + G.figs.length);
  const de = document.documentElement; if (Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1) out.bad.push('hscroll ' + de.scrollWidth);
  for (const g of out.glows) { const t = document.elementFromPoint(g.x, g.y); if (t && t.closest('[data-help]')) { } else if (!t || !t.closest('.glow')) out.bad.push('glow covered by ' + (t ? t.tagName + '#' + t.id + '.' + t.className : 'nothing')); if (g.x - g.w / 2 < bd.left - 2 || g.x + g.w / 2 > bd.right + 2 || g.y + g.h / 2 > bd.bottom + 2) out.bad.push('glow cut off'); }
  for (const g of out.fglows) { const t = document.elementFromPoint(g.x, g.y); if (!t || !t.closest('.fglow')) out.bad.push('follower spot covered'); if (g.x < bd.left || g.x > bd.right || g.y < bd.top || g.y > bd.bottom) out.bad.push('follower spot off board'); }
  // help kit: a bubble stays on screen and never covers a follower spot or Skip
  for (const bb of document.querySelectorAll('.gxh-bub.on')) { const r = bb.getBoundingClientRect(); if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) out.bad.push('help bubble off screen');
    for (const e of document.querySelectorAll('.fglow,#hskip')) { const q = e.getBoundingClientRect(); if (!q.width) continue; const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx > r.left - 12 && cx < r.right + 12 && cy > r.top - 12 && cy < r.bottom + 12) out.bad.push('help bubble covers ' + (e.id || e.className)); } }
  if (out.mine && out.step === 'place' && !out.glows.length && !out.over) out.bad.push('my turn: no glowing square (' + out.legalAtRot + ' legal at this turn) dbg ' + JSON.stringify({ tw: UI.tw, user: UI.user, rot: UI.rot, all: document.querySelectorAll('#world .glow').length, hid: [...document.querySelectorAll('#world .glow')].filter(e => e.style.visibility === 'hidden').length, view: UI.view, gx: UI.legal.filter(g => g.r === UI.rot).slice(0, 3), board: [bd.width, bd.height], help: GXH.state().cur }));
  if (out.mine && out.step === 'fig' && !out.fglows.length && !out.skip) out.bad.push('my turn: no follower spot and no Skip');
  if (out.words > 8) out.bad.push('status > 8 words: ' + out.status);
  // portrait: board >= 55% of the screen
  if (innerHeight > innerWidth) { const a = Math.round(100 * bd.width * bd.height / (innerWidth * innerHeight)); out.board = a; if (a < 55) out.bad.push('board only ' + a + '%'); }
  // wordy text anywhere (play screen)
  if (!document.querySelector('#modal .scrim') && !document.querySelector('.gxc')) for (const e of document.querySelectorAll('#app *')) { if (!e.children.length && e.textContent.trim().split(/\s+/).length > 8) out.bad.push('wordy: ' + e.textContent.trim().slice(0, 40)); }
  return out;
};
async function probe(p) { return p.evaluate(PROBE); }
async function waitChange(p, sig, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { await sleep(60); const o = await p.evaluate(() => (typeof G !== 'undefined' && G) ? G.turn + ':' + G.step + ':' + G.order.length + ':' + G.figs.length + ':' + (G.over ? 'o' : '') : 'x').catch(() => sig); if (o !== sig) return Date.now() - t0; } return -1; }
const pick = a => a[Math.floor(rnd() * a.length)];
async function tapAt(p, x, y) { await p.touchscreen.tap(x, y); }

// ---------- help kit checks: each bubble once, never covers its target, dismisses on a tap; the bulb's finger = the advice; rules cards ----------
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const NEUTRAL = [40, 24];
const hstat = { bubbles: {}, bulbs: 0, bulbNull: 0, rules: 0 };
async function rulesCheck(p, tag, ph) {
  hstat.rules++;
  const R = await p.evaluate(() => { const e = document.querySelector('.gxh-rules'); if (!e) return null; const out = [], n = +e.dataset.count;
    for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg') }); if (i < n - 1) e.querySelector('.gxh-next').click(); }
    const r = e.querySelector('.gxh-card').getBoundingClientRect(); return { n, cards: out, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
  if (!R) { await fail(p, tag, 'help', 'rules cards did not open (' + ph + ')'); return; }
  if (ph && (R.n < 2 || R.n > 4)) await fail(p, tag, 'help', 'rules for ' + ph + ' have ' + R.n + ' cards');
  for (const c of R.cards) { if (wc(c.x) > 20) await fail(p, tag, 'help', 'rules card over 20 words: ' + c.x); if (wc(c.t) > 4) await fail(p, tag, 'help', 'rules title over 4 words: ' + c.t); if (!c.pic) await fail(p, tag, 'help', 'rules card without a picture: ' + c.t); }
  if (!R.inside) await fail(p, tag, 'help', 'rules card outside the screen (' + ph + ')');
  await p.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await sleep(100);
  if (await p.evaluate(() => !!document.querySelector('.gxh-rules'))) await fail(p, tag, 'help', 'rules cards did not close');
}
// returns true when it did something (the caller re-probes)
async function helpFlow(p, tag, st, o) {
  const ph = await p.evaluate(() => hlpPhase());
  if (!ph) return false;
  const tipsOn = await p.evaluate(() => GXH.enabled());
  // 1) the first-time bubble of this phase
  if (tipsOn && !st.seen.has(ph)) { st.seen.add(ph);
    let b = null; const t1 = Date.now();
    while (Date.now() - t1 < 3000) { b = await p.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect();
        return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T }; }, ph).catch(() => null); if (b) break; await sleep(80); }
    if (b) { for (let k = 0; k < 20 && await p.evaluate(() => UI.tw); k++) await sleep(100); await sleep(700);   // let the view settle; the kit re-places the bubble when its target moved
      b = await p.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect();
        return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T }; }, ph).catch(() => null) || b; }
    if (!b) { await fail(p, tag, 'help', 'no coach bubble for phase ' + ph); return false; }
    hstat.bubbles[ph] = (hstat.bubbles[ph] || 0) + 1;
    if (b.id !== ph) await fail(p, tag, 'help', 'bubble for ' + b.id + ' shown in phase ' + ph);
    if (wc(b.title) > 4) await fail(p, tag, 'help', 'bubble title over 4 words: ' + b.title); if (wc(b.text) > 20) await fail(p, tag, 'help', 'bubble text over 20 words: ' + b.text);
    if (!b.arrow || !b.ok) await fail(p, tag, 'help', 'bubble without arrow or Got it (' + ph + ')');
    if (b.T) { const [l, t, r, bt] = b.r; if (l < b.T.right && r > b.T.left && t < b.T.bottom && bt > b.T.top) await fail(p, tag, 'help', 'bubble covers its target (' + ph + ')'); }
    for (const m of (await probe(p)).bad) if (/help bubble/.test(m)) await fail(p, tag, 'help', m);
    await tapAt(p, ...NEUTRAL); await sleep(150);
    if (await p.evaluate(() => !!document.querySelector('.gxh-bub'))) await fail(p, tag, 'help', 'bubble did not dismiss on a tap (' + ph + ')');
    return true; }
  if (!tipsOn && await p.evaluate(() => !!document.querySelector('.gxh-bub[data-phase]'))) await fail(p, tag, 'help', 'a coach bubble with tips off');
  // 2) the lightbulb: the first time in every phase, then now and then
  if ((!st.seen.has('bulb:' + ph) || rnd() < .2) && hstat.bulbs < 400) { st.seen.add('bulb:' + ph); hstat.bulbs++;
    const pre = await p.evaluate(() => { const s = G.cur.p, h = hlpPlan(); let adv = null; try { adv = G.step === 'place' ? aiPlan(s, 'normal').place : bestFigNow(s, 'normal'); } catch (e) { } return { has: !!h, move: h && h.move, adv, legal: !!(h && isLegal(h.move, s)), sig: G.turn + ':' + G.step + ':' + G.order.length + ':' + G.figs.length }; });
    if (pre.has && JSON.stringify(pre.move) !== JSON.stringify(pre.adv)) await fail(p, tag, 'help', 'bulb suggestion ' + JSON.stringify(pre.move) + ' differs from the advice function ' + JSON.stringify(pre.adv));
    if (pre.has && !pre.legal) await fail(p, tag, 'help', 'bulb suggestion not legal');
    const bb = await p.evaluate(() => { const r = document.querySelector('#bulbbtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await tapAt(p, ...bb); await sleep(450);
    const r = await p.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), h = hlpPlan(); let el = null;
      if (h) { const m = h.move; el = m.act === 'place' ? hGlow(m.x, m.y) : m.act === 'skip' ? document.querySelector('#hskip') : (UI.figs || []).find(q => q._m.k === m.k && q._m.l === m.l); }
      const q = el && el.getBoundingClientRect(); const cr = q && { x: q.left + q.width / 2, y: q.top + q.height / 2 };
      return { f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!document.querySelector('.gxh-rules'), el: !!el, cr, hasPlan: !!h, sig: G.turn + ':' + G.step + ':' + G.order.length + ':' + G.figs.length }; });
    if (pre.has && r.hasPlan) {
      if (!r.el) await fail(p, tag, 'help', 'bulb: the suggested spot is not on screen (' + ph + ')');
      else if (!r.f) await fail(p, tag, 'help', 'bulb tapped, no finger (' + ph + ')');
      else { if (Math.abs(+r.f.tx - r.cr.x) > 2 || Math.abs(+r.f.ty - r.cr.y) > 2) await fail(p, tag, 'help', 'bulb finger ' + r.f.tx + ',' + r.f.ty + ' != suggestion ' + Math.round(r.cr.x) + ',' + Math.round(r.cr.y) + ' (' + ph + ')');
        if (!r.ring) await fail(p, tag, 'help', 'bulb: nothing glows at the suggestion'); if (!r.why || wc(r.why) > 15) await fail(p, tag, 'help', 'bulb why ' + wc(r.why) + ' words: ' + r.why); if (!r.link) await fail(p, tag, 'help', 'bulb bubble has no "How does this work?"');
        for (const m of (await probe(p)).bad) if (/help bubble/.test(m)) await fail(p, tag, 'help', m);
        if (rnd() < .4 && r.link) { await p.evaluate(() => document.querySelector('.gxh-bub .gxh-link').click()); await sleep(250); await rulesCheck(p, tag, ph); } }
    } else { hstat.bulbNull++; if (r.f) await fail(p, tag, 'help', 'bulb with no suggestion still pointed a finger'); if (!r.rules) await fail(p, tag, 'help', 'bulb with no suggestion did not open the rules'); else await rulesCheck(p, tag, ph); }
    await p.evaluate(() => GXH.hide());
    const a = await p.evaluate(() => ({ g: !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'), sig: G.turn + ':' + G.step + ':' + G.order.length + ':' + G.figs.length }));
    if (a.g) await fail(p, tag, 'help', 'help still on screen after hide (' + ph + ')'); if (a.sig !== pre.sig) await fail(p, tag, 'help', 'tapping the bulb changed the game (' + pre.sig + ' -> ' + a.sig + ')');
    return true; }
  return false;
}
// ---------- play one full game ----------
async function playGame(b, W, H, variant, tag, opt) {
  opt = opt || {}; const p = await newPage(b, W, H); const hst = { seen: new Set() }; let steps = 0, rotated = false, lastSig = '', lastT = Date.now(), maxStuck = 0;
  try {
    await p.evaluate(v => { UI.speed = 30; UI.first = !!v.first; UI.offered = true; UI.setup.river = !!v.river; UI.setup.ic = !!v.ic; UI.setup.tb = !!v.tb; UI.setup.rivals = v.rivals || 1; UI.setup.lv = v.lv || 'normal'; try { localStorage.removeItem('rv_seen'); } catch (e) { } }, { ...variant, first: opt.first });
    await p.evaluate(() => showStart()); await p.tap('[data-a=play]'); await sleep(500);
    const seen = new Set(); if (opt.tipsOff) await p.evaluate(() => GXH.setEnabled(false));
    for (let it = 0; it < 900; it++) {
      const o = await probe(p); steps++; stat.steps++;
      if (p.errs.length) { await fail(p, tag, 'js-error', p.errs[0]); break; }
      if (o.tw && !o.over) { await sleep(80); continue; }
      for (const m of o.bad) await fail(p, tag, 'check', m);
      if (o.over) break;
      if (o.sig !== lastSig) { lastSig = o.sig; lastT = Date.now(); } else { const st = Date.now() - lastT; maxStuck = Math.max(maxStuck, st); if (st > 8000) { await fail(p, tag, 'stuck', 'no change for 8 s at ' + o.sig); break; } }
      if (!o.mine) { await sleep(120); continue; }
      if (await helpFlow(p, tag, hst, o)) continue;
      // ghost finger must sit on the control it points at, and that move must be legal
      if (o.step === 'place' && o.hint && o.rot === o.hint.r) { stat.hints++; const g = o.glows.find(q => q.hint); if (!g) await fail(p, tag, 'hint', 'hint set but no hint glow'); else if (!o.ghost) await fail(p, tag, 'hint', 'no finger for hint'); else if (Math.hypot(o.ghost.x - g.x, o.ghost.y - g.y) > 80) await fail(p, tag, 'hint', 'finger ' + Math.round(o.ghost.x) + ',' + Math.round(o.ghost.y) + ' glow ' + Math.round(g.x) + ',' + Math.round(g.y)); }
      if (o.step === 'place') {
        // sometimes turn the tile first
        if (o.htile && o.rots > 1 && rnd() < .35) { const r0 = o.rot; await tapAt(p, o.htile.x, o.htile.y); await sleep(350); const o2 = await probe(p); stat.rotates++; if (o2.rot === r0) await fail(p, tag, 'rotate', 'tile did not turn'); if (!o2.glows.length && o2.legalAtRot) await fail(p, tag, 'rotate', 'no glow after turning though ' + o2.legalAtRot + ' legal'); continue; }
        if (!opt.noMid && !rotated && opt.rotate && o.turn > 6) { rotated = true; await p.setViewportSize({ width: H, height: W }); await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(900); await probe(p).then(async q => { for (const m of q.bad) await fail(p, tag + '-rot', 'check', m); }); await p.setViewportSize({ width: W, height: H }); await p.evaluate(() => dispatchEvent(new Event('resize'))); await sleep(900); stat.rots++; continue; }
        if (!o.glows.length) { await sleep(200); continue; }
        const g = pick(o.glows); await tapAt(p, g.x, g.y); stat.places++;
        const dt = await waitChange(p, o.sig, 2500); if (dt < 0) await fail(p, tag, 'dead-tap', 'tap on glow ' + g.x0 + ',' + g.y0 + ' did nothing (rot ' + o.rot + ')');
      } else if (o.step === 'fig') {
        if (o.ghost && (o.hintFig || true) && (o.hintFig)) { stat.hints++; const t = o.hintFig.act === 'skip' ? o.skip : o.fglows.find(q => q.hint); if (!t) await fail(p, tag, 'hint', 'fig hint has no target'); else if (Math.hypot(o.ghost.x - t.x, o.ghost.y - t.y) > 80) await fail(p, tag, 'hint', 'fig finger far from target'); }
        const useFig = o.fglows.length && rnd() < .7; const t = useFig ? pick(o.fglows) : (o.skip || pick(o.fglows)); await tapAt(p, t.x, t.y); stat.figs++;
        const dt = await waitChange(p, o.sig, 2500); if (dt < 0) await fail(p, tag, 'dead-tap', 'follower tap did nothing');
      } else await sleep(100);
    }
    const o = await probe(p); stat.games++;
    if (!o.over) await fail(p, tag, 'unfinished', 'game did not end');
    else { await sleep(opt.fast ? 5200 : 5200); const res = await p.evaluate(() => !!document.querySelector('#modal .card .rescore') || !!document.querySelector('.gxc')); if (res) stat.results++; else await fail(p, tag, 'result', 'no result card after the game'); const sc = await p.evaluate(() => G.pl.map(q => q.score).join('-')); console.log('  game', tag, 'done', steps, 'steps, score', sc, 'maxStuck', maxStuck + 'ms'); }
    if (shotN < 14 && opt.shot) await p.screenshot({ path: path.join(SHOTS, opt.shot) });
  } catch (e) { await fail(p, tag, 'crash', e.message); }
  await p.context().close();
}
// ---------- story chapters through the real campaign screens ----------
async function playChapter(b, W, H, id, tag) {
  const p = await newPage(b, W, H);
  try {
    await p.evaluate(i => { const ch = {}; for (const c of window.CAMPAIGN.chapters) { if (c.id === i) break; ch[c.id] = { beaten: true, stars: 1, best: null, tries: 1, losses: 0, easy: false }; } localStorage.setItem('gns-campaign-rampart', JSON.stringify({ v: 1, ch, unlocked: [], last: null })); }, id);
    await p.reload(); await sleep(400); await p.evaluate(() => { UI.speed = 30; });
    await p.evaluate(i => { showStart(); GXC.open(); setTimeout(() => GXC.play(i), 50); }, id); await sleep(500);
    // skip scenes and boss cards until the board is up
    for (let i = 0; i < 12; i++) { const hasG = await p.evaluate(() => typeof G !== 'undefined' && !!G && !!G.cur && !document.querySelector('.gxc.on,.gxc[class*=on]') ); if (hasG && await p.evaluate(() => !document.querySelector('.gxc'))) break; const t = await p.evaluate(() => { const bs = [...document.querySelectorAll('.gxc button')].filter(e => e.offsetWidth > 0); const r = bs.find(e => e.classList.contains('go')) || bs.find(e => /^(skip|play|let.?s go|start|go|begin|next|continue|ok|meet|face|fight|accept)/i.test(e.textContent.trim())) || bs.find(e => /skip/i.test(e.textContent)); if (!r) return null; const q = r.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, t: r.textContent }; }); if (!t) { await sleep(300); continue; } await tapAt(p, t.x, t.y); await sleep(450); }
    const info = await p.evaluate(() => ({ camp: UI.camp && UI.camp.id, np: G.pl.length, lv: G.pl.map(q => q.lv), sc: G.pl.map(q => q.score), sup: G.pl.map(q => q.sup.f), first: G.cur.p, hints: UI.camp && UI.camp.hints, human: G.pl.map(q => q.human) }));
    console.log('  chapter', id, JSON.stringify(info));
    let lastSig = '', lastT = Date.now();
    for (let it = 0; it < 900; it++) {
      const o = await probe(p); if (p.errs.length) { await fail(p, tag, 'js-error', p.errs[0]); break; }
      if (o.tw && !o.over) { await sleep(80); continue; }
      if (o.tw && !o.over) { await sleep(80); continue; }
      for (const m of o.bad) await fail(p, tag, 'check', m);
      if (o.over) break;
      if (o.sig !== lastSig) { lastSig = o.sig; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { await fail(p, tag, 'stuck', 'no change for 8 s'); break; }
      if (!o.mine) { await sleep(100); continue; }
      if (o.step === 'place') { if (!o.glows.length) { await sleep(200); continue; } const g = pick(o.glows); await tapAt(p, g.x, g.y); if (await waitChange(p, o.sig, 2500) < 0) await fail(p, tag, 'dead-tap', 'glow'); }
      else if (o.step === 'fig') { const useFig = o.fglows.length && rnd() < .6; const t = useFig ? pick(o.fglows) : (o.skip || pick(o.fglows)); await tapAt(p, t.x, t.y); if (await waitChange(p, o.sig, 2500) < 0) await fail(p, tag, 'dead-tap', 'fig'); }
    }
    await sleep(5500);
    const end = await p.evaluate(() => ({ over: !!G.over, res: !!document.querySelector('.gxc-res'), txt: (document.querySelector('.gxc-res h2') || {}).textContent, prog: JSON.stringify(GXC.progress().ch) }));
    console.log('  chapter', id, 'end', JSON.stringify(end)); if (!end.over) await fail(p, tag, 'unfinished', 'chapter game did not end'); else if (!end.res) await fail(p, tag, 'story', 'no chapter result screen'); else stat.results++;
  } catch (e) { await fail(p, tag, 'crash', e.message); }
  await p.context().close();
}
// ---------- chapter-1 win rate: a newcomer who follows the hint (the normal computer's pick) about half the time, and plays like the easy computer otherwise ----------
async function winRates(b) {
  const p = await newPage(b, 390, 763);
  const r = await p.evaluate(n => {
    const camp = window.CAMPAIGN.chapters[0]; UI.sim = 1; const out = {};
    const run = (style) => { let wins = 0, ties = 0, sc = [0, 0];
      for (let g = 0; g < n; g++) {
        DEFSEED = 1000 + g; newGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', camp.opponent.aiLevel], ex: camp.setup.ex }); DEFSEED = null;
        let guard = 0; while (!G.over && guard++ < 400) { const s = sideToAct(), me = P(s).human; let mv;
          if (!me) mv = aiMove(s); else { const lvl = rnd(100) < style * 100 ? 'normal' : 'easy'; if (G.step === 'place') { const pl = aiPlan(s, lvl); AIPLAN = { turn: G.turn, p: s, plan: pl }; mv = pl.place; } else mv = (AIPLAN && AIPLAN.turn === G.turn && AIPLAN.p === s) ? AIPLAN.plan.fig : bestFigNow(s, lvl); }
          if (!mv || !performMove(mv, s).success) break; }
        if (G.over) { const w = G.over.win; if (w.length === 1 && w[0] === 0) wins++; else if (w.length > 1) ties++; sc[0] += G.pl[0].score; sc[1] += G.pl[1].score; } }
      return { wins: wins / n, ties: ties / n, avg: sc.map(x => Math.round(x / n)) }; };
    for (const st of (window.__P || [0, .15, .3, .5, 1])) out['follows hint ' + Math.round(st * 100) + '%'] = run(st);
    return out; }, C1N);
  console.log('Chapter 1 simulated win rates (' + C1N + ' games each; a newcomer who follows the ghost finger X% of turns and otherwise plays like the easy computer):', JSON.stringify(r));
  await p.context().close(); return r;
}
(async () => {
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  const jobs = [];
  for (let i = 0; i < GAMES; i++) { const [W, H] = SIZES[i % 2], v = VARIANTS[i % VARIANTS.length]; jobs.push(() => playGame(b, W, H, { ...v, rivals: i % 5 === 4 ? 2 : 1, lv: i % 3 === 2 ? 'hard' : i % 3 === 1 ? 'easy' : 'normal' }, `g${i}-${W}x${H}`, { rotate: i < ROT, first: i % 4 === 0, tipsOff: i % 6 === 5, shot: i === 1 ? 'game-end.png' : null })); }
  if (STORY) { const ids = (process.env.CH || 'c1,c7,c10').split(','); ids.slice(0, Math.max(STORY, 1) * 3).forEach((id, k) => jobs.push(() => playChapter(b, SIZES[k % 2][0], SIZES[k % 2][1], id, 'story-' + id))); }
  const q = jobs.slice(); await Promise.all(Array.from({ length: PAR }, async () => { while (q.length) await q.shift()(); }));
  if (C1N) await winRates(b);
  await b.close();
  console.log('help kit', JSON.stringify(hstat)); console.log('\nsteps', stat.steps, JSON.stringify(stat)); console.log(fails.length ? 'FAILURES: ' + fails.length : 'SWEEP CLEAN');
  fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify({ stat, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
})();
