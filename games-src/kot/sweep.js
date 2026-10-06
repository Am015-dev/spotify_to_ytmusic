// Scripted bug sweep for Crown City Smash: plays REAL games through the real page with touch taps (random choices, like a
// careless player) at 390x763 and 375x553, rotations in some of them, and two story chapters through the story map.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js     env: GAMES=10 (per size) PAR=2 ROT=3 STORY=2 FILE=kot2.html SEED=1 MAXMS=300000
// Per step it fails on: page errors; a control covered / off screen / under 30 px; the same screen for >8 s with nothing
// moving; a tap on a glowing control that changes nothing; a text block over 8 words (the long-press / drawers excepted);
// the score chips (hearts, stars, energy) differing from the engine for 3 probes in a row; the one board line over 8 words;
// the ghost finger pointing at nothing; horizontal scroll; the board (data-board) under 55% of a portrait screen.
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs');
const E = process.env, FILE = path.resolve(E.FILE || 'kot2.html');
const GAMES = +(E.GAMES || 10), PAR = +(E.PAR || 2), ROT = +(E.ROT || 3), STORY = E.STORY == null ? 2 : +E.STORY, MAXMS = +(E.MAXMS || 300000);
let seed = +(E.SEED || 1); const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const SIZES = [[390, 763], [375, 553]].filter(s => !E.ONLY || String(s[0]) === E.ONLY), SHOTS = path.join(__dirname, 'sweep-shots'); fs.mkdirSync(SHOTS, { recursive: true });
for (const f of fs.readdirSync(SHOTS)) if (/\.png$/.test(f)) fs.unlinkSync(path.join(SHOTS, f));
const fails = []; let shotN = 0, battles = 0, wins = 0, losses = 0, steps = 0, boardMin = 100, taps = 0, fingers = 0, buys = 0, keeps = 0;
async function fail(p, tag, kind, detail) {
  const key = tag + kind + String(detail).slice(0, 40); if (fails.some(f => f.key === key)) return;
  const f = { key, tag, kind, detail: String(detail).slice(0, 260) }; fails.push(f); console.log('  FAIL', tag, kind, f.detail);
  if (shotN < 12) { try { await p.screenshot({ path: path.join(SHOTS, `f${++shotN}-${kind.replace(/\W+/g, '_')}.png`) }); } catch (e) { } }
}
const PROBE = () => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden],.hidden'); };
  const out = { ok: typeof G !== 'undefined' && !!G, ctl: [], wordy: [], gxc: !!document.querySelector('.gxc:not([hidden])') };
  const de = document.documentElement; out.hscroll = Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1;
  if (!out.ok) return out;
  out.win = G.winner; out.turn = G.turn; out.phase = G.phase; out.humanTurn = humanTurn(); out.choice = !!UI.choice && !document.getElementById('choice').classList.contains('hidden');
  out.line = (document.getElementById('bline') || {}).textContent || '';
  out.fx = (document.getElementById('bfx') || { children: [] }).children.length;
  out.busy = !!UI.busy || !!UI.pending || out.fx > 0;
  const sels = '#dice .die,#pacts button,#pshop [data-shop],#choice button,.gxc button,.gx-bar button,#pchips .pchip,#moment button,#advice button,.gx-dock .btn,#bfinger';
  for (const e of document.querySelectorAll(sels)) {
    if (e.id === 'bfinger' || !vis(e)) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const inVP = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight; const t = inVP ? document.elementFromPoint(x, y) : null;
    out.ctl.push({ c: String(e.className).slice(0, 30) + (e.dataset.act ? '/' + e.dataset.act : '') + (e.dataset.die != null ? '/die' + e.dataset.die : '') + (e.dataset.shop != null ? '/shop' + e.dataset.shop : ''), x, y, w: r.width, h: r.height, inVP, dis: !!e.disabled,
      cov: inVP && !(t && (t === e || e.contains(t) || t.contains(e))), by: t && (t.id || String(t.className).slice(0, 30)), gxc: !!e.closest('.gxc'), chip: e.classList.contains('pchip'), scroll: !!e.closest('.gx-dock') && !e.closest('#dice,#pacts,#pshop'),
      anim: !!(e.getAnimations && e.getAnimations().length), die: e.matches('#dice .die'), shop: e.matches('#pshop [data-shop]'), act: e.matches('#pacts button'), ch: e.matches('#choice button'), txt: e.textContent.trim().slice(0, 18) });
  }
  const words = t => (t || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|TEXT|TSPAN|BUTTON)$/i.test(e.tagName) || !vis(e)) continue; if (getComputedStyle(e).display.startsWith('inline')) continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    if (e.closest('.gxc,[class*=drawer],[class*=Drawer],[class*=rules],[class*=menu],[class*=-log],[id$=log],[id=log],[class*=settings],[aria-modal=true],#more,.gx-more,.gx-sheet,#fulltip,#menuwrap,.gx-drawer,#dr-market,#dr-mine,#dr-mons,#dr-log,#dr-rules,.gx-scrim')) continue;
    const w = words(e.innerText); if (w.length > 8) out.wordy.push(w.length + 'w "' + w.slice(0, 6).join(' ') + '" in ' + e.tagName + '.' + e.className + '#' + e.id + ' < ' + (e.parentElement && (e.parentElement.id || e.parentElement.className)));
  }
  const bd = document.querySelector('[data-board]'); if (bd && innerHeight > innerWidth) { const r = bd.getBoundingClientRect(); out.board = Math.round(100 * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (innerWidth * innerHeight)); }
  const f = document.getElementById('bfinger'); if (f && vis(f) && getComputedStyle(f).opacity > .05) { const r = f.getBoundingClientRect(); out.finger = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  // score chips vs the engine
  out.chips = []; for (const c of document.querySelectorAll('#pchips .pchip[data-pm]')) { const k = +c.dataset.pm, q = G.pl[k]; if (!q) continue; const m = c.textContent.match(/♥\s*(\d+)\s*★\s*(\d+)\s*⚡\s*(\d+)/); out.chips.push(m ? { k, shown: [+m[1], +m[2], +m[3]], eng: [Math.max(0, q.hp), q.vp, q.en] } : { k, bad: c.textContent.slice(0, 30) }); }
  return out;
};
async function newPage(b, W, H) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(90000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g/.test(m.text())) p.errs.push('console ' + m.text()); });
  await p.goto('file://' + FILE + '?phone=1'); await p.waitForSelector('[data-start]', { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { AIDELAY = 120; try { localStorage.clear() } catch (e) { } }); return p;
}
const SIG = () => typeof G === 'undefined' || !G ? '-' : [G.turn, G.phase, G.step, G.active, G.rolls, G.dice.map(d => d.f + (d.k ? 'k' : '')).join(''), G.pl.map(q => q.hp + ',' + q.vp + ',' + q.en + ',' + q.cards.length).join(';'), G.market.join(','), G.log && G.log.length, !!UI.choice, (document.getElementById('bline') || {}).textContent, document.querySelectorAll('.gxc:not([hidden])').length, UI.intro, UI.coach].join('|');
async function choose(p, st, r) {
  return p.evaluate(([c, r1]) => {
    const q = s => [...document.querySelectorAll(s)].filter(e => { const R = e.getBoundingClientRect(); return e.offsetParent !== null && !e.disabled && R.width > 4 && R.top >= 0 && R.bottom <= innerHeight && R.left >= 0 && R.right <= innerWidth && !e.closest('.hidden') });
    const pickR = a => a.length ? a[Math.floor(r1 * a.length) % a.length] : null; let el = null, kind = '';
    const ch = q('#choice [data-opt]'); if (c) { el = r1 < .25 ? pickR(ch) : (ch.find(e => /primary|sugg|rec/.test(e.className)) || pickR(ch)); kind = 'choice' }
    if (!el && G.phase === 'roll' && humanTurn()) {
      const dice = q('#dice .die'), nk = G.dice.filter(d => !d.k).length;
      if (G.rolls > 0 && nk && r1 < .35 && dice.length) { el = pickR(dice); kind = 'die' } else if (G.rolls > 0 && nk && r1 < .7) { el = q('#pacts [data-act=reroll]')[0]; kind = 'roll' } else { el = q('#pacts [data-act=resolve]')[0] || q('#pacts [data-act=reroll]')[0]; kind = 'done' }
    }
    if (!el && G.phase === 'buy' && humanTurn()) { const sh = q('#pshop [data-shop]'); if (r1 < .5 && sh.length) { el = pickR(sh); kind = 'shop' } else { el = q('#pacts [data-act=end]')[0] || pickR(sh); kind = 'end' } }
    if (!el) el = q('.gxc button.go')[0] || q('#moment button')[0] || q('[data-start]')[0] || q('#pacts [data-act=again]')[0] || q('#advice button')[0] || q('#pacts .btn.primary')[0] || q('#pacts button')[0];
    if (!el) return null; const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2, c: String(el.className) + (el.dataset.act || '') + (el.dataset.shop || ''), kind };
  }, [st.choice, r]);
}
async function checkStep(p, tag, st) {
  if (p.errs.length) await fail(p, tag, 'page error', p.errs[0]);
  if (st.hscroll) await fail(p, tag, 'hscroll', 'page scrolls sideways');
  if (st.board != null) { boardMin = Math.min(boardMin, st.board); if (st.board < 55) await fail(p, tag, 'board small', st.board + '%'); }
  if (st.line && st.line.split(/\s+/).filter(Boolean).length > 8) await fail(p, tag, 'line >8 words', st.line);
  if (st.wordy.length) await fail(p, tag, 'text >8 words', st.wordy.slice(0, 2).join(' / '));
  for (const c of st.ctl) {
    if (c.gxc || c.scroll || c.chip) continue;
    if (c.inVP && c.cov && !c.dis) await fail(p, tag, 'covered', c.c + ' by ' + c.by);
    if (!c.inVP && (c.die || c.shop || c.act || c.ch)) await fail(p, tag, 'off screen', c.c + ' ' + Math.round(c.x) + ',' + Math.round(c.y));
    if (!c.anim && (c.die || c.shop || c.act || c.ch) && Math.min(c.w, c.h) < 29.5) await fail(p, tag, 'too small', c.c + ' ' + Math.round(c.w) + 'x' + Math.round(c.h));
  }
  const bad = st.chips.filter(c => c.bad || c.shown.some((v, i) => v !== c.eng[i])); p._cb = bad.length && !st.busy ? (p._cb || 0) + 1 : 0;
  if (p._cb >= 4) { const c = bad[0]; await fail(p, tag, 'score mismatch', 'chip ' + c.k + ' ' + (c.bad || 'shows ' + c.shown + ' engine ' + c.eng)); p._cb = 0; }
  if (!st.finger) p._fb = 0; else { fingers++; const near = st.ctl.some(c => !c.chip && Math.hypot(c.x - st.finger.x, c.y - st.finger.y) < Math.max(70, c.w * .8)); p._fb = near ? 0 : (p._fb || 0) + 1; if (p._fb >= 4) await fail(p, tag, 'finger at nothing', Math.round(st.finger.x) + ',' + Math.round(st.finger.y)); }
}
async function play(p, tag, o) {
  const t0 = Date.now(); let last = '', lastAt = Date.now(), n = 0, rotated = 0, st;
  while (Date.now() - t0 < MAXMS) {
    n++; steps++; st = await p.evaluate(PROBE); if (!st.ok) { await p.waitForTimeout(300); continue; }
    await checkStep(p, tag, st);
    if (st.win) return st;
    if (o.rotAt && n === o.rotAt && !rotated) {
      const vp = p.viewportSize(); await p.setViewportSize({ width: vp.height, height: vp.width }); await p.waitForTimeout(900);
      const s2 = await p.evaluate(PROBE); if (s2.hscroll) await fail(p, tag, 'hscroll after rotation', ''); if (p.errs.length) await fail(p, tag, 'page error', p.errs[0]);
      for (const c of s2.ctl) if ((c.die || c.shop || c.act) && !c.inVP && !c.scroll) await fail(p, tag, 'off screen after rotation', c.c);
      await p.setViewportSize(vp); await p.waitForTimeout(900); rotated = 1; continue;
    }
    const sig = await p.evaluate(SIG); if (sig !== last) { last = sig; lastAt = Date.now(); } else if (Date.now() - lastAt > 8000 && !st.busy) { await fail(p, tag, 'stuck >8s', st.phase + ' ' + (st.humanTurn ? 'human' : 'computer') + ' ' + st.line); lastAt = Date.now(); }
    if (st.gxc) { const g = await p.evaluate(() => { const b = [...document.querySelectorAll('.gxc button')].filter(e => e.offsetParent && !e.disabled); const pr = b.find(e => /go|primary/.test(e.className)) || b.find(e => /next|start|continue|fight|play|meet/i.test(e.textContent)) || b[0]; if (!pr) return null; const R = pr.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }); if (g) await p.touchscreen.tap(g.x, g.y); await p.waitForTimeout(500); continue; }
    if (!st.humanTurn && !st.choice) { await p.waitForTimeout(350); if (rnd() < .1) await p.touchscreen.tap(200, 200); continue; } // the computer plays; a tap on the board speeds it up
    const pick = await choose(p, st, rnd());
    if (pick) { taps++; if (pick.kind === 'shop') buys++; if (pick.kind === 'die') keeps++; await p.touchscreen.tap(pick.x, pick.y); if (Date.now() - lastAt > 3500 && pick.kind !== 'die' && pick.kind !== 'shop') { await p.waitForTimeout(1500); if ((await p.evaluate(SIG)) === sig) await fail(p, tag, 'tap did nothing', pick.c + ' @' + st.phase); } }
    await p.waitForTimeout(pick ? 400 : 350);
  }
  await fail(p, tag, 'game too long', 'no winner after ' + MAXMS / 1000 + 's'); return st;
}
async function game(b, W, H, i) {
  const tag = `${W}x${H}#${i}`; const p = await newPage(b, W, H); battles++;
  try {
    await p.evaluate(s => { setSeed(s); }, 500 + i * 31); await p.tap('[data-start]'); await p.waitForTimeout(1800);
    const st = await play(p, tag, { rotAt: i < ROT ? 14 : 0 });
    if (st && st.win) { /^P/.test(st.win) && st.win === 'P' + (await p.evaluate(() => G.pl.findIndex(q => q.human) + 1)) ? wins++ : losses++; await p.waitForTimeout(3000); const s2 = await p.evaluate(PROBE); await checkStep(p, tag, s2); if (i === 0) await p.screenshot({ path: path.join(SHOTS, `end-${W}x${H}.png`) }); }
  } catch (e) { await fail(p, tag, 'exception', e.message.split('\n')[0]); }
  await p.context().close();
}
async function story(b, W, H, ch) {
  const tag = `story${ch}@${W}x${H}`; const p = await newPage(b, W, H); battles++;
  try {
    await p.tap('[data-camp=open]'); await p.waitForTimeout(800);
    if (!(await p.evaluate(() => !!document.querySelector('.gxc:not([hidden]) .gxc-node')))) { await fail(p, tag, 'story map', 'did not open'); return }
    if (ch > 1) { await p.evaluate(c => { const P = GXC.progress(), d = window.CAMPAIGN.chapters; for (let i = 0; i < c - 1; i++) P.ch[d[i].id] = { beaten: true, stars: 1, tries: 1 }; localStorage.setItem(Object.keys(localStorage).find(k => /camp|gxc|crown/i.test(k)) || 'x', JSON.stringify(P)); }, ch); await p.evaluate(() => GXC.open()); await p.waitForTimeout(500); }
    const pt = await p.evaluate(n => { const a = [...document.querySelectorAll('.gxc-node.open, .gxc-node.won')]; const e = a[Math.min(n - 1, a.length - 1)]; e.scrollIntoView({ block: 'center' }); const R = e.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }, ch); await p.waitForTimeout(300);
    const pt2 = await p.evaluate(n => { const a = [...document.querySelectorAll('.gxc-node.open, .gxc-node.won')]; const e = a[Math.min(n - 1, a.length - 1)]; const R = e.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }, ch); await p.touchscreen.tap(pt2.x, pt2.y); await p.waitForTimeout(700);
    for (let k = 0; k < 14; k++) { if (await p.evaluate(() => typeof G !== 'undefined' && !!G && !!G.camp && !document.querySelector('.gxc:not([hidden])'))) break;
      const r = await p.evaluate(() => { const b = [...document.querySelectorAll('.gxc:not([hidden]) button')].filter(e => e.offsetParent && !e.disabled); const pr = b.find(e => /gxc-btn go|go/.test(e.className)) || b.find(e => /play|start|next|fight|continue|meet/i.test(e.textContent)); if (!pr) return null; const R = pr.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 } }); if (r) await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(700); }
    if (!(await p.evaluate(() => typeof G !== 'undefined' && !!G && !!G.camp))) { await fail(p, tag, 'story did not start', 'game never began'); return }
    await p.waitForTimeout(1500);
    const st = await play(p, tag, { story: true });
    if (st && st.win) { await p.waitForTimeout(4500); const shown = await p.evaluate(() => !!document.querySelector('.gxc:not([hidden])')); if (!shown) await fail(p, tag, 'story result', 'no result screen after the game'); else await p.screenshot({ path: path.join(SHOTS, `story-result-${W}x${H}-c${ch}.png`) }); }
  } catch (e) { await fail(p, tag, 'exception', e.message.split('\n')[0]); }
  await p.context().close();
}
(async () => {
  const b = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const jobs = [];
  for (const [W, H] of SIZES) { for (let i = 0; i < GAMES; i++) jobs.push(() => game(b, W, H, i)); for (let c = 1; c <= STORY; c++) jobs.push(() => story(b, W, H, c)); }
  let next = 0; await Promise.all([...Array(PAR)].map(async () => { while (next < jobs.length) { const j = jobs[next++]; await j() } }));
  console.log(`\nSWEEP: ${battles} games (won ${wins}, lost ${losses}), ${steps} steps, ${taps} taps (${keeps} dice, ${buys} shop), finger seen ${fingers}x, smallest board ${boardMin}%, ${fails.length} failure(s)`);
  for (const f of fails) console.log(' -', f.tag, f.kind, f.detail); await b.close(); process.exit(fails.length ? 1 : 0);
})();
