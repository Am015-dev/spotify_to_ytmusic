// Scripted bug sweep for Nebula Aces: plays REAL battles through the real page with touch taps (random-ish choices) at
// 390x763 and 375x553, rotations in some of them, and two story sorties through the story map. Run before every deploy.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js            env: GAMES=10 (per size) PAR=3 ROT=3 STORY=1 FILE=nebula.html SEED=1 MAXMS=420000
// Per step it fails on: page errors; a glowing control that does not respond to a tap (4 s); the same screen for >8 s
// with nothing moving; a control covered / off screen / under 30 px; the ghost finger pointing at nothing; a text block
// over 8 words (long-press popups excepted); the top strip (ships, hull+shields) differing from the engine;
// horizontal scroll; the board (data-board) under 55% of a portrait screen; after a rotation controls off screen.
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs');
const E = process.env, FILE = path.resolve(E.FILE || 'nebula.html');
const GAMES = +(E.GAMES || 10), PAR = +(E.PAR || 3), ROT = +(E.ROT || 3), STORY = E.STORY == null ? 2 : +E.STORY, MAXMS = +(E.MAXMS || 420000);
let seed = +(E.SEED || 1); const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const SIZES = [[390, 763], [375, 553]].filter(s => !E.ONLY || String(s[0]) === E.ONLY), SHOTS = path.join(__dirname, 'sweep-shots'); fs.mkdirSync(SHOTS, { recursive: true });
for (const f of fs.readdirSync(SHOTS)) if (/\.png$/.test(f)) fs.unlinkSync(path.join(SHOTS, f));
const fails = []; let shotN = 0, battles = 0, wins = 0, losses = 0, steps = 0, boardMin = 100, taps = 0, fingers = 0;
async function fail(p, tag, kind, detail) {
  const key = tag + kind + String(detail).slice(0, 40); if (fails.some(f => f.key === key)) return;
  const f = { key, tag, kind, detail: String(detail).slice(0, 240) }; fails.push(f); console.log('  FAIL', tag, kind, f.detail);
  if (shotN < 12) { try { await p.screenshot({ path: path.join(SHOTS, `f${++shotN}-${kind.replace(/\W+/g, '_')}.png`) }); } catch (e) { } }
}
const PROBE = () => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]'); };
  const out = { ok: typeof G !== 'undefined' && !!G, ctl: [], wordy: [], gxc: !!document.querySelector('.gxc:not([hidden])') };
  const de = document.documentElement; out.hscroll = Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1;
  if (!out.ok) return out;
  out.win = G.winner; out.round = G.round; out.phase = G.phase; out.key = (typeof BF !== 'undefined' && BF.key) || ''; out.bf = typeof BF !== 'undefined' && BF.on;
  out.pop = !!(window.PHN && PHN.pop); out.hint = (document.getElementById('bfhint') || {}).textContent || '';
  out.moving = Object.values(V3.anim || {}).filter(a => a && a.path && a.path.length > 2 && a.dur < 1e8).length + (document.getElementById('bfdice') && !document.getElementById('bfdice').hidden ? 0 : 0);
  out.busy = !!V3.ez || !!(V3.busy);
  const sels = '#bfl button,#bfbtns button,#bfdice .die.pick,#prompt button,.gxc button,.gx-bar button,#modal button,.gx-dock .btn';
  for (const e of document.querySelectorAll(sels)) {
    if (!vis(e) || e.disabled) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const inVP = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight; const t = inVP ? document.elementFromPoint(x, y) : null;
    const dock = e.closest('.gx-dock'); const scroll = !!(dock && !e.closest('#bfl'));
    out.ctl.push({ c: String(e.className).slice(0, 40) + (e.dataset.bf ? '/' + e.dataset.bf : ''), x, y, w: r.width, h: r.height, inVP, cov: inVP && !(t && (t === e || e.contains(t) || t.contains(e))), by: t && ((t.id || t.className) + ' ' + (() => { const o = []; for (let q = t; q && q !== document.body && o.length < 4; q = q.parentElement) { const cs = getComputedStyle(q); o.push(q.className + '{op' + cs.opacity + ',' + cs.visibility + ',' + Math.round(q.getBoundingClientRect().top) + '}') } return o.join('<') })()), bf: !!e.closest('#bfl,#bfbtns,#bfdice'), anim: !!(e.getAnimations && (e.getAnimations().length || (e.parentElement && e.parentElement.getAnimations && e.parentElement.getAnimations().length))), gxc: !!e.closest('.gxc'), scroll, txt: e.textContent.trim().slice(0, 18) });
  }
  const words = t => (t || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|TEXT|TSPAN|BUTTON)$/i.test(e.tagName) || !vis(e)) continue; if (getComputedStyle(e).display.startsWith('inline')) continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    if (e.closest('.gxc,[class*=drawer],[class*=Drawer],[class*=rules],[class*=menu],[class*=-log],[id$=log],[id=log],[class*=settings],[aria-modal=true],#more,#roster,.gx-more,.gx-sheet,#fulltip,#modal')) continue;
    const w = words(e.innerText); if (w.length > 8) out.wordy.push(w.length + 'w "' + w.slice(0, 6).join(' ') + '" in ' + e.tagName + '.' + e.className + ' < ' + (e.parentElement && e.parentElement.className) + ' :: ' + e.outerHTML.slice(0, 160).replace(/\s+/g, ' '));
  }
  const bd = document.querySelector('[data-board]'); if (bd && innerHeight > innerWidth) { const r = bd.getBoundingClientRect(); out.board = Math.round(100 * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (innerWidth * innerHeight)); }
  const f = document.getElementById('bffing'); if (f && !f.hidden && vis(f)) { const r = f.getBoundingClientRect(); const fe = BF.fing && document.body.contains(BF.fing) ? BF.fing : null, fr = fe && fe.getBoundingClientRect(); out.finger = { x: r.left + 12, y: r.top + 8, el: fe ? String(fe.className) + ' ' + Math.round(fr.left + fr.width / 2) + ',' + Math.round(fr.top + fr.height / 2) + ' vis=' + (fe.offsetParent !== null) : 'none' }; }
  // the top strip vs the engine
  const top = document.getElementById('bftop'); if (top && top.textContent.trim() && G.round >= 1) {
    const me = soloSide() >= 0 ? soloSide() : 0, side = k => { const a = G.ships.filter(s => s.side === k && s.alive); return [a.length, a.reduce((x, s) => x + Math.max(0, s.hull - hullDmg(s)) + s.sh, 0)]; };
    const b = [...top.querySelectorAll('b')].map(x => +x.textContent), h = top.textContent.match(/♥\s*(\d+)/g) || [];
    out.top = { shown: [b[0], b[1], h[0] && +h[0].replace(/\D/g, ''), h[1] && +h[1].replace(/\D/g, '')], eng: [side(me)[0], side(1 - me)[0], side(me)[1], side(1 - me)[1]] };
  }
  return out;
};
async function newPage(b, W, H) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(90000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g/.test(m.text())) p.errs.push('console ' + m.text()); });
  await p.goto('file://' + FILE + '?phone=1'); await p.waitForSelector('[data-start]', { timeout: 30000 }); await p.waitForTimeout(1200);
  await p.evaluate(() => { AIDELAY = 70; try { localStorage.clear() } catch (e) { } }); return p;
}
// choose the next tap like a player would: the glowing / recommended control, sometimes another one
async function choose(p, st, r) {
  return p.evaluate(([k, r1]) => {
    const q = s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null && !e.disabled && e.getBoundingClientRect().width > 4);
    const pickR = a => a.length ? a[Math.floor(r1 * a.length) % a.length] : null; let el = null;
    if (k === 'brief') el = q('[data-bf=brief]')[0];
    else if (k === 'setup') el = q('.bfspot.rec')[0] || q('#bfbtns button')[0] || pickR(q('.bfspot'));
    else if (k === 'plan') el = r1 < .12 ? pickR(q('.bfm')) : (q('[data-bf=fly]')[0] || q('.bfm.sug')[0] || pickR(q('.bfm')) || q('.bfring.need')[0]);
    else if (k === 'action') el = r1 < .25 ? pickR(q('.bfact')) : (q('.bfact.rec')[0] || pickR(q('.bfact')));
    else if (k === 'sub') el = q('[data-bfarg]')[0];
    else if (k === 'target') el = r1 < .25 ? pickR(q('.bftgt')) : (q('.bftgt.rec')[0] || pickR(q('.bftgt')));
    else if (k === 'dice') el = q('#bfdice .die.pick:not(.on)')[0] && !q('#bfdice .die.pick.on')[0] && r1 < .3 ? q('#bfdice .die.pick')[0] : (q('#bfbtns .primary')[0] || q('#bfbtns .btn')[0]);
    else if (k === 'res' || k === 'note') return { x: 8, y: 100, c: 'any', nochk: 1 };
    else if (k === 'ask') el = q('#prompt [data-act=ask].primary')[0] || q('#prompt [data-act=ask]')[0] || q('#bfbtns button')[0];
    if (!el) el = q('#bfbtns .primary')[0] || q('#bfbtns button')[0];
    if (!el) return null; const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2, c: String(el.className) + (el.dataset.bf || '') };
  }, [st.key.split('|')[0], r]);
}
const SIG = () => typeof G === 'undefined' || !G ? '-' : [G.round, G.phase, G.step, G.cur, G.oi, (typeof BF !== 'undefined' && BF.key) || '', G.ships.map(s => s.x + ',' + s.y + ',' + s.hull + s.sh).join(';'), G.log && G.log.length, document.querySelectorAll('.gxc:not([hidden])').length, (document.getElementById('bfhint') || {}).textContent].join('|');
async function checkStep(p, tag, st, who) {
  if (st.pop) return;
  if (p.errs.length) await fail(p, tag, 'page error', p.errs[0]);
  if (st.hscroll) await fail(p, tag, 'hscroll', 'page scrolls sideways');
  if (st.board != null && st.bf) { boardMin = Math.min(boardMin, st.board); if (st.board < 55) await fail(p, tag, 'board small', st.board + '%'); }
  if (st.hint && st.hint.split(/\s+/).filter(Boolean).length > 8) await fail(p, tag, 'hint >8 words', st.hint);
  if (st.wordy.length) await fail(p, tag, 'text >8 words', st.wordy.slice(0, 2).join(' / '));
  for (const c of st.ctl) {
    if (c.gxc) continue; if (!c.bf && c.scroll) continue;
    if (c.inVP && c.cov && !/bfring|bfm small/.test(c.c)) await fail(p, tag, 'covered', c.c + ' by ' + c.by);
    if (c.bf && !c.inVP) await fail(p, tag, 'off screen', c.c);
    if (c.bf && !c.anim && Math.min(c.w, c.h) < 29.5) await fail(p, tag, 'too small', c.c + ' ' + Math.round(c.w) + 'x' + Math.round(c.h));
  }
  if (st.top) { const a = st.top.shown, b = st.top.eng; if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2] || a[3] !== b[3]) { st.topBad = (st.topBad || 0); await fail(p, tag, 'score mismatch', 'shown ' + a + ' engine ' + b); } }
  if (!st.finger) p._fb = 0; if (st.finger) { fingers++; const near = st.ctl.some(c => c.bf && Math.hypot(c.x - st.finger.x, c.y - st.finger.y) < Math.max(60, c.w * .75)); p._fb = near || st.key.split('|')[0] === 'brief' ? 0 : (p._fb || 0) + 1; if (p._fb >= 3) await fail(p, tag, 'finger at nothing', st.key + ' ' + Math.round(st.finger.x) + ',' + Math.round(st.finger.y) + ' target ' + st.finger.el); }
}
async function play(p, tag, o) {
  const t0 = Date.now(); let last = '', lastAt = Date.now(), n = 0, rotated = 0, st;
  while (Date.now() - t0 < MAXMS) {
    n++; steps++; st = await p.evaluate(PROBE); if (!st.ok) { await p.waitForTimeout(300); continue; }
    if (p.errs.length || n % 1 === 0) await checkStep(p, tag, st);
    if (st.win && !(o.story && !st.gxc)) { await p.waitForTimeout(400); }
    if (st.win) return st;
    if (o.rotAt && n === o.rotAt && !rotated) { // rotate to landscape and back; controls must still fit
      const vp = p.viewportSize(); await p.setViewportSize({ width: vp.height, height: vp.width }); await p.waitForTimeout(900);
      const s2 = await p.evaluate(PROBE); if (s2.hscroll) await fail(p, tag, 'hscroll after rotation', ''); if (p.errs.length) await fail(p, tag, 'page error', p.errs[0]);
      await p.setViewportSize(vp); await p.waitForTimeout(900); rotated = 1; continue;
    }
    const sig = await p.evaluate(SIG); if (sig !== last) { last = sig; lastAt = Date.now(); } else if (Date.now() - lastAt > 8000 && !st.moving && !st.busy) { await fail(p, tag, 'stuck >8s', st.key + ' ' + st.phase); lastAt = Date.now(); if (Date.now() - t0 > 60000 && n > 60) break; }
    if (st.gxc) { const g = await p.evaluate(() => { const b = [...document.querySelectorAll('.gxc button')].filter(e => e.offsetParent && !e.disabled); const pr = b.find(e => /go|primary/.test(e.className)) || b.find(e => /next|start|continue|fight|play/i.test(e.textContent)) || b[0]; if (!pr) return null; const R = pr.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }); if (g) await p.touchscreen.tap(g.x, g.y); await p.waitForTimeout(500); continue; }
    if (st.pop) { await p.touchscreen.tap(8, 120); await p.waitForTimeout(400); if (await p.evaluate(() => !!PHN.pop)) { p._popStuck = (p._popStuck || 0) + 1; if (p._popStuck > 3) { await fail(p, tag, 'info sheet will not close', 'a tap on the board does not close it'); await p.evaluate(() => PHN.closePop()); p._popStuck = 0; } } continue; }
    const pick = await choose(p, st, rnd());
    if (pick) { taps++; await p.touchscreen.tap(pick.x, pick.y); if (!pick.nochk && Date.now() - lastAt > 3500) { /* a glowing target that ignores taps: still the same screen 1.5 s after the tap */ await p.waitForTimeout(1500); const s2 = await p.evaluate(SIG); if (s2 === sig) await fail(p, tag, 'tap did nothing', pick.c + ' @' + st.key); } }
    await p.waitForTimeout(pick ? 420 : 350);
  }
  await fail(p, tag, 'battle too long', 'no winner after ' + MAXMS / 1000 + 's'); return st;
}
async function battle(b, W, H, i) {
  const tag = `${W}x${H}#${i}`; const p = await newPage(b, W, H); battles++;
  try {
    const kind = i % 3; const sortie = Math.floor(rnd() * 10);
    if (kind === 0) await p.tap('[data-start]'); else { const nS = await p.evaluate(() => SORTIES.length); await p.evaluate(k => startGame('solo', k), kind === 1 ? Math.min(sortie, nS - 1) : undefined); }
    await p.waitForTimeout(1500);
    const st = await play(p, tag, { rotAt: i < ROT ? 12 : 0 });
    if (st && st.win) { st.win === 'P1' ? wins++ : losses++; await p.waitForTimeout(2800); const s2 = await p.evaluate(PROBE); await checkStep(p, tag, s2); if (i === 0) await p.screenshot({ path: path.join(SHOTS, `end-${W}x${H}.png`) }); }
  } catch (e) { await fail(p, tag, 'exception', e.message.split('\n')[0]); }
  await p.context().close();
}
async function story(b, W, H, ch) {
  const tag = `story${ch}@${W}x${H}`; const p = await newPage(b, W, H); battles++;
  try {
    await p.tap('[data-a=story]'); await p.waitForTimeout(800);
    const opened = await p.evaluate(() => !!document.querySelector('.gxc:not([hidden]) .gxc-node')); if (!opened) { await fail(p, tag, 'story map', 'did not open'); return }
    // chapter 2 needs chapter 1 beaten: unlock through the real API for the test
    if (ch > 1) await p.evaluate(c => { const P = GXC.progress(); const d = window.CAMPAIGN.chapters; for (let i = 0; i < c - 1; i++) P.ch[d[i].id] = { beaten: true, stars: 1, tries: 1 }; localStorage.setItem(Object.keys(localStorage).find(k => /camp|gxc/i.test(k)) || 'x', JSON.stringify(P)); }, ch);
    if (ch > 1) { await p.evaluate(() => GXC.open()); await p.waitForTimeout(500); }
    const tap = async sel => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({ block: 'center' }); const R = e.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }, sel); if (r) await p.touchscreen.tap(r.x, r.y); return !!r; };
    const nodes = ch; const sel = `.gxc-node.open`; const all = await p.evaluate(s => document.querySelectorAll(s).length, sel);
    await p.evaluate(n => { const a = [...document.querySelectorAll('.gxc-node.open, .gxc-node.won')]; const e = a[Math.min(n - 1, a.length - 1)]; e.scrollIntoView({ block: 'center' }); }, nodes); await p.waitForTimeout(300);
    const pt = await p.evaluate(n => { const a = [...document.querySelectorAll('.gxc-node.open, .gxc-node.won')]; const e = a[Math.min(n - 1, a.length - 1)]; const R = e.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }, nodes); await p.touchscreen.tap(pt.x, pt.y); await p.waitForTimeout(700);
    // sheet -> scene -> (boss card) -> fight: press the main button until the battle starts
    for (let k = 0; k < 14; k++) { const started = await p.evaluate(() => typeof G !== 'undefined' && !!G && !!G.camp && !document.querySelector('.gxc:not([hidden])')); if (started) break;
      const r = await p.evaluate(() => { const b = [...document.querySelectorAll('.gxc:not([hidden]) button')].filter(e => e.offsetParent && !e.disabled); const pr = b.find(e => /gxc-btn go|go/.test(e.className)) || b.find(e => /play|start|next|fight|continue|meet/i.test(e.textContent)); if (!pr) return null; const R = pr.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }); if (r) await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(700); }
    const started = await p.evaluate(() => typeof G !== 'undefined' && !!G && !!G.camp); if (!started) { await fail(p, tag, 'story did not start', 'battle never began'); return }
    await p.waitForTimeout(1200);
    const st = await play(p, tag, { story: true });
    if (st && st.win) { st.win === 'P1' ? wins++ : losses++; await p.waitForTimeout(3500); const shown = await p.evaluate(() => !!document.querySelector('.gxc:not([hidden])')); if (!shown) await fail(p, tag, 'story result', 'no result screen after the battle'); else await p.screenshot({ path: path.join(SHOTS, `story-result-${W}x${H}-c${ch}.png`) }); }
  } catch (e) { await fail(p, tag, 'exception', e.message.split('\n')[0]); }
  await p.context().close();
}
(async () => {
  const b = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const jobs = [];
  for (const [W, H] of SIZES) { for (let i = 0; i < GAMES; i++) jobs.push(() => battle(b, W, H, i)); for (let c = 1; c <= STORY; c++) jobs.push(() => story(b, W, H, c)); }
  let next = 0; await Promise.all([...Array(PAR)].map(async () => { while (next < jobs.length) { const j = jobs[next++]; await j() } }));
  console.log(`\nSWEEP: ${battles} battles (won ${wins}, lost ${losses}), ${steps} steps, ${taps} taps, finger seen ${fingers}x, smallest board ${boardMin}%, ${fails.length} failure(s)`);
  for (const f of fails) console.log(' -', f.tag, f.kind, f.detail); await b.close(); process.exit(fails.length ? 1 : 0);
})();
