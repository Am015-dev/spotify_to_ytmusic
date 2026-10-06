// Scripted bug sweep: plays the REAL page with touch taps (random choices) and checks every step.
//   (python3 -m http.server 8096 in this dir)  NODE_PATH=/opt/node-tools/node_modules node sweep.js
//   env: GAMES=40 (per run, split over both sizes) ROT=5 ANIM=6 (games that keep the full animations) PAR=3 (pages at once) STORY=1 C1=400 (headless chapter-1 games)
// Per step it asserts: no console/page errors, a tapped control responds, hint text and ghost finger agree, scores and bag on screen = engine,
// something changes within 8 s, no horizontal scroll, no tappable control covered. Then story chapters 1, 3 and 10 are played and their boss twists checked.
const PW = require(process.env.PW || 'playwright'), fs = require('fs'), path = require('path');
const URL = process.env.URL || 'http://localhost:8098/cauldron-fair.html';
const GAMES = process.env.GAMES != null ? +process.env.GAMES : 40, ROT = process.env.ROT == null ? 5 : +process.env.ROT, ANIMN = process.env.ANIM == null ? 6 : +process.env.ANIM, PAR = +process.env.PAR || 3, C1N = +process.env.C1 || 400;
const SHOTS = path.join(__dirname, 'sweep-shots'); fs.mkdirSync(SHOTS, { recursive: true });
for (const f of fs.readdirSync(SHOTS)) if (/\.png$/.test(f)) fs.unlinkSync(path.join(SHOTS, f));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const STAT = { ghost: 0, hint: 0, ruby: 0, boom: 0, shop: 0, steps: 0 }; const fails = [], counts = { pass: 0, fail: 0 }; let shotN = 0, seed = +process.env.SEED || 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fail(p, tag, kind, detail) {
  counts.fail++; const key = kind + ':' + String(detail).slice(0, 60);
  if (fails.some(f => f.key === key && f.tag === tag)) return;                       // the same failure in the same game is counted once
  const f = { key, tag, kind, detail: String(detail).slice(0, 300), shot: '' };
  if (shotN < 10) { f.shot = 'f' + (++shotN) + '-' + kind.replace(/\W+/g, '_') + '.png'; try { await p.screenshot({ path: path.join(SHOTS, f.shot) }); } catch (e) { } }
  fails.push(f); console.log('  FAIL', tag, kind, f.detail);
}
async function newPage(b, W, H, animate) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA, reducedMotion: animate ? 'no-preference' : 'reduce' });
  const p = await ctx.newPage(); p.setDefaultTimeout(20000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) p.errs.push('console ' + m.text()); });
  return p;
}
// ---------------- in-page helpers ----------------
const PROBE = () => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]') && !e.closest('details:not([open]) > :not(summary)'); };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const out = { over: false, sig: '', ctl: [], warn: [] };
  if (typeof G === 'undefined' || !G) return out;
  out.over = G.phase === 'over'; out.phase = G.phase; out.round = G.round;
  const doms = ['#acts', '#qbox', '#pc', '#rs', '#others', '#me', '#prompt'].map(s => { const e = document.querySelector(s); return e ? e.innerHTML.length + ':' + hash(e.innerHTML) : '-'; }).join('|');
  out.sig = [G.logN, G.phase, G.round, G.players.map(p => p.pot.length + p.st + (p.lock ? 'L' : '') + (p.q ? p.q.h : '')).join(','), UI.rsOpen, UI.rsMode, UI.focus, (UI.shopSel || []).join('+'), UI.rubySel ? JSON.stringify(UI.rubySel) : '', !!document.querySelector('.boomfx'), doms, innerWidth, window.__tn || 0].join('/');
  const boom = !!document.querySelector('.boomfx'); out.boom = boom; out.pulling = document.documentElement.classList.contains('pulling');
  // controls in the topmost layer
  const rs = document.querySelector('#rs'), rsOn = rs && !rs.hidden;
  const sels = rsOn ? '#rs button,#rs summary' : '#acts button,#qbox button,#pc button,#others .th,.gx-bar button';
  for (const e of document.querySelectorAll(sels)) {
    if (!vis(e)) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const sb = e.closest('.rsbody'), sbr = sb && sb.getBoundingClientRect(); const inVP = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight && (!sbr || (y >= sbr.top + 3 && y <= sbr.bottom - 3)); const h = inVP ? document.elementFromPoint(x, y) : null;
    out.ctl.push({ x, y, inVP, covered: !(h && (e.contains(h) || h.contains(e) && h !== document.body && h !== document.documentElement && h.closest('button,summary') === e)), geo: Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' body ' + (sbr ? Math.round(sbr.top) + '-' + Math.round(sbr.bottom) : '-') + ' vp ' + innerWidth + 'x' + innerHeight, by: h && (h.id || h.className && h.className.baseVal || h.className || h.tagName), dis: !!e.disabled, a: e.dataset.a || '', sel: e.getAttribute('aria-pressed') === 'true', k: e.dataset.k || '', cls: String(e.className).slice(0, 40), inQ: !!e.closest('#qbox'), t: (e.textContent || '').trim().slice(0, 26), pe: getComputedStyle(e).pointerEvents });
  }
  const gh0 = document.querySelector('#ghost'); out.stat = { ghost: !!gh0 && !gh0.hidden, hint: !!document.querySelector('#acts .bline') && !!document.querySelector('#acts .bline').textContent.trim(), ruby: !!document.querySelector('#rs .rubyp'), boom: boom, shop: !!document.querySelector('#rs .shop') };
  out.advAge = UI.advAt ? Date.now() - UI.advAt : 9999; out.rsOn = !!rsOn; const qb = document.querySelector('#qbox'); out.qAge = qb && !qb.hidden && UI.qT ? Date.now() - UI.qT : 9999;
  return out;
};
const CHECKS = () => {
  const bad = []; if (typeof G === 'undefined' || !G || !UI.started) return bad;
  const v = viewSeat(), f = focusSeat(); if (v < 0) return bad; const q = G.players[f];
  const txt = e => e ? e.textContent.trim() : null;
  if (document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1) bad.push(['hscroll', document.documentElement.scrollWidth + ' > ' + innerWidth]);
  { const box = document.querySelector('#rs .rsbox'), br = box && !document.querySelector('#rs').hidden ? box.getBoundingClientRect() : null;
    document.querySelectorAll('#rs button, #acts button, #qbox button').forEach(e => { if (e.closest('[hidden]') || e.closest('.rsbody') && e.closest('.rsbody').scrollWidth <= e.closest('.rsbody').clientWidth && false) return; const r = e.getBoundingClientRect(); if (r.width < 2) return;
      const inBox = br && e.closest('#rs'); if (r.right > innerWidth + 1 || r.left < -1 || (inBox && (r.right > br.right + 1 || r.left < br.left - 1))) bad.push(['cut-off', (e.dataset.a || e.className) + ' "' + e.textContent.trim().slice(0, 18) + '" ' + Math.round(r.left) + '-' + Math.round(r.right) + (inBox ? ' box ' + Math.round(br.left) + '-' + Math.round(br.right) : '')]); }); }
  if (!document.querySelector('.boomfx')) {
    const me = document.querySelector('#me'); if (me && !hotSeat()) {
      const sv = [...me.querySelectorAll('.st')].find(e => e.title === 'Victory points'), sr = [...me.querySelectorAll('.st')].find(e => e.title === 'Rubies');
      if (sv && +txt(sv.querySelector('b')) !== q.vp) bad.push(['score', 'VP shown ' + txt(sv.querySelector('b')) + ' engine ' + q.vp + ' seat ' + f]);
      if (sr && +txt(sr.querySelector('b')) !== q.rubies) bad.push(['score', 'rubies shown ' + txt(sr.querySelector('b')) + ' engine ' + q.rubies]);
    }
    document.querySelectorAll('#others .th').forEach(t => { const s = +t.dataset.seat, pp = G.players[s]; const tv = t.querySelector('.tv'); if (tv && pp && tv.textContent.replace(/\D/g, '') !== String(pp.vp) + String(pp.rubies)) bad.push(['score', 'strip ' + pp.name + ' shows "' + tv.textContent.trim() + '" engine ' + pp.vp + '/' + pp.rubies]); });
    const bn = document.querySelector('#acts .bagn'); if (bn && f === v && G.phase === 'brew' && +txt(bn) !== q.bag.length) bad.push(['bag', 'bag count shown ' + txt(bn) + ' engine ' + q.bag.length]);
    const cbs = [...document.querySelectorAll('#acts .rk .cb, #rs .rk .cb')]; if (cbs.length && f === v && G.phase === 'brew') { const n = cbs.reduce((a, e) => a + (+(e.textContent.match(/×(\d+)/) || [0, 0])[1]), 0); if (n && n !== q.bag.length) bad.push(['bag', 'bag contents shown ' + n + ' engine ' + q.bag.length]); }
    const mt = document.querySelector('#acts .meter .mn'); if (mt && f === v) { const m = txt(mt).match(/(\d+)\/(\d+)/); if (m && +m[1] !== CF.whiteSum(q)) bad.push(['score', 'white meter ' + m[1] + ' engine ' + CF.whiteSum(q)]); }
  }
  // hint line and ghost finger agree (one decision)
  const line = document.querySelector('#acts .bline:not(.watch)'), gh = document.querySelector('#ghost'); const hint = line ? line.textContent.trim() : '';
  if (hint && hint.split(/\s+/).length > 8) bad.push(['hint', 'more than 8 words: ' + hint]);
  const want = /Stop/.test(hint) ? '.stopb' : /flask/i.test(hint) ? '.flb' : /bag|Pull|brewing|chip/i.test(hint) && !/Decided/.test(hint) ? '.bagb' : '';
  const enabled = s => { const e = document.querySelector('#acts ' + s); return !!e && !e.disabled && !e.classList.contains('off'); };
  if (hint && want && !BF.pulling && !enabled(want)) bad.push(['hint', '"' + hint + '" but its button (' + want + ') is not enabled']);
  if (gh && !gh.hidden && gh.getBoundingClientRect().width > 4) {
    const gx = parseFloat(gh.style.left), gy = parseFloat(gh.style.top);
    const inBrew = !document.querySelector('#rs') || document.querySelector('#rs').hidden;
    if (inBrew) {
      const hit = ['.bagb', '.stopb', '.flb'].find(s => { const e = document.querySelector('#acts ' + s); if (!e) return false; const r = e.getBoundingClientRect(); return gx >= r.left - 2 && gx <= r.right + 2 && gy >= r.top - 2 && gy <= r.bottom + 2; });
      if (!hint) bad.push(['ghost', 'finger shown on ' + hit + ' with no hint text']);
      else if (!want || hit !== want) bad.push(['ghost', 'finger on ' + hit + ' but hint says "' + hint + '"']);
    } else {
      const tg = document.querySelector('#rs .tok.sug:not([disabled]), #rs .tok:not([disabled]), #rs [data-a=shopbuy]'); if (!tg) bad.push(['ghost', 'finger in report with no target']);
    }
  }
  return bad;
};
// every control of the report: scroll it to the middle of the body and make sure it is really there to tap (not under the footer)
const RSCOVER = () => {
  const bad = [], body = document.querySelector('#rs .rsbody'); if (!body || document.querySelector('#rs').hidden) return bad; const top = body.scrollTop;
  for (const e of document.querySelectorAll('#rs .rsbody button')) {
    if (e.disabled || e.closest('[hidden]') || e.closest('details:not([open]) > :not(summary)')) continue; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); if (r.width < 2) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); if (!(h && e.contains(h))) bad.push((e.dataset.a || e.className) + ' "' + e.textContent.trim().slice(0, 16) + '" under ' + (h && (h.id || h.className && h.className.baseVal || h.className)));
  }
  body.scrollTop = top; return bad;
};
const pageErrs = p => p.errs.splice(0);
// ---------------- one tap, checked ----------------
async function tapCtl(p, tag, c) {
  const before = await p.evaluate(PROBE);
  if (!before.ctl.some(z => z.a === c.a && z.k === c.k && z.t === c.t && z.cls === c.cls)) return true;   // the screen changed under the finger (the day report opened): choose again, don't tap what is no longer there
  await p.touchscreen.tap(c.x, c.y);
  if (before.boom || before.pulling || c.a === 'mv' && /Draw/.test(c.t) && before.pulling) { await sleep(120); return true; }
  const t0 = Date.now(); let moved = false;
  while (Date.now() - t0 < 1600) { await sleep(70); const s = await p.evaluate(PROBE).catch(() => null); if (!s) { moved = true; break; } if (s.sig !== before.sig) { moved = true; break; } }
  if (!moved) { const now = await p.evaluate(PROBE); if (now.boom || now.pulling) return true; await fail(p, tag, 'no-response', 'tap on ' + (c.a || c.cls) + ' "' + c.t + '" changed nothing'); return false; }
  return true;
}
function choose(s, st) {
  const ok = s.ctl.filter(c => c.inVP && !c.dis && !c.covered && c.pe !== 'none' && !(c.a === 'rubysel' && c.sel) && !(c.inQ && s.qAge < 600)); if (!ok.length) return null;
  if (s.advAge < 600) return null;       // the first screen after the report ignores taps for 450 ms on purpose
  if (s.qAge < 600 && s.ctl.some(c => c.inQ)) return null;       // a fresh question ignores the first 450 ms of taps on purpose: look again
  const by = f => ok.filter(f), pick = a => a.length ? a[Math.floor(rnd() * a.length)] : null;
  const bar = by(c => /^gx-|^gx/.test(c.cls) || false);
  if (s.rsOn) {
    const confirm = by(c => ['shopbuy', 'rscont', 'rubygo', 'take', 'hotgo'].includes(c.a));
    const others = by(c => ['shopsel', 'rubysel', 'mv'].includes(c.a));
    if (confirm.length && (!others.length || rnd() < (st.rsTaps > 1 ? .8 : .3))) { st.rsTaps = 0; return pick(confirm); }
    if (others.length) { st.rsTaps++; return pick(others); }
    return pick(ok);
  }
  const tip = by(c => c.a === 'tipok'); if (tip.length) return pick(tip);
  const take = by(c => c.a === 'take'); if (take.length) return pick(take);
  const q = by(c => c.a === 'mv' && !/Draw|^Stop/.test(c.t) && !/drawb|stopb/.test(c.cls));
  const draw = by(c => /drawb/.test(c.cls)), stop = by(c => /stopb/.test(c.cls));
  if (draw.length || stop.length) {
    const r = rnd(); if (r < .06) { const th = by(c => /\bth\b/.test(c.cls)); if (th.length) return pick(th); }
    if (q.length && r < .3) return pick(q);
    if (draw.length && stop.length) return rnd() < .72 ? draw[0] : stop[0]; return draw[0] || stop[0];
  }
  if (q.length) return pick(q);
  return pick(by(c => /\bth\b/.test(c.cls)) .concat(by(c => c.a === 'focus'))) || null;
}
const hook = p => p.evaluate(() => { const o = window.toast; window.toast = function (t) { window.__tn = (window.__tn || 0) + 1; return o.apply(this, arguments); }; });   // a toast counts as a response
async function startVs(p, coach) {
  await p.goto(URL); await sleep(900);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await p.evaluate(() => { const e = document.querySelector('[data-a=play]'); if (e) e.click(); }); await sleep(300);
  await p.evaluate(c => { UI.prefs.blgSeen = true; UI.coach.level = c; window.AIDELAY = 70; }, coach); await hook(p);
  const c = await p.evaluate(() => { const r = document.querySelector('[data-start=vs]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(...c); await sleep(1000);
}
// play one game to the final card
async function playGame(p, tag, opt) {
  opt = opt || {}; const st = { rsTaps: 0 }; let lastCov = '', last = '', lastT = Date.now(), steps = 0, rot = 0; const t0 = Date.now(); let size = p.viewportSize();
  while (Date.now() - t0 < (opt.maxMs || 260000)) {
    const s = await p.evaluate(PROBE).catch(() => null); if (!s) { await sleep(100); continue; }
    if (s.stat) { STAT.steps++; for (const k of Object.keys(s.stat)) if (s.stat[k]) STAT[k]++; }
    if (s.over && s.rsOn) { const fin = await p.evaluate(() => !!document.querySelector('#rs .win,#rs [data-a=again],#rs [data-a=campfin],#rs [data-a=title]')); if (fin || Date.now() - lastT > 1500) return 'over'; }
    if (s.sig !== last) { last = s.sig; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { await fail(p, tag, 'stuck', 'nothing changed for 8 s at day ' + s.round + ' phase ' + s.phase + ' rs=' + s.rsOn); return 'stuck'; }
    // rotation mid-game
    if (opt.rotate && s.round >= 4 && rot === 0 && s.phase === 'brew') { rot = 1; await p.setViewportSize({ width: 844, height: 390 }); await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(700); }
    if (opt.rotate && s.round >= 7 && rot === 1 && s.phase === 'brew') { rot = 2; await p.setViewportSize({ width: size.width, height: size.height }); await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(700); }
    // invariants (re-checked once after a beat, so a transition frame is not a failure)
    let bad = await p.evaluate(CHECKS); if (bad.length) { await sleep(700); bad = await p.evaluate(CHECKS); }
    for (const [k, d] of bad) await fail(p, tag, k, d);
    if (!s.boom) for (const c of s.ctl) if (c.inVP && !c.dis && c.covered && !/^gx|\bth\b/.test(c.cls) && (c.a || /btn|bagb|stopb/.test(c.cls))) { await sleep(300); const s2 = await p.evaluate(PROBE); const c2 = s2.ctl.find(z => z.a === c.a && z.k === c.k && z.t === c.t); if (c2 && c2.covered) await fail(p, tag, 'covered', (c.a || c.cls) + ' "' + c.t + '" covered by ' + c2.by + ' @ ' + c2.geo + ' dis=' + c2.dis); }
    if (s.rsOn && s.sig !== lastCov) { lastCov = s.sig; for (const d of await p.evaluate(RSCOVER)) await fail(p, tag, 'covered', d); }
    for (const e of pageErrs(p)) await fail(p, tag, 'js-error', e);
    if (s.boom) { if (rnd() < .5) { await p.touchscreen.tap(size.width / 2, size.height / 2); } await sleep(150); continue; }
    const c = choose(s, st); if (process.env.DBG && steps < 40) console.log(tag, 'step', steps, s.round, s.phase, 'ctl', s.ctl.map(z => (z.a || z.cls) + (z.covered ? '!cov' : '') + (z.dis ? '!dis' : '') + (z.inVP ? '' : '!vp')).join(','), '->', c && (c.a || c.cls), 'qAge', s.qAge); if (!c) { await sleep(120); continue; }
    await sleep(90); const s2 = await p.evaluate(PROBE).catch(() => null); const c2 = s2 && s2.ctl.find(z => z.a === c.a && z.k === c.k && z.t === c.t && z.cls === c.cls);
    if (!c2 || Math.abs(c2.x - c.x) > 2 || Math.abs(c2.y - c.y) > 2 || c2.covered) continue;     // still sliding in: look again
    let cc = c2; if (s.rsOn) { cc = await p.evaluate(c => { const e = [...document.querySelectorAll('#rs button')].find(z => (z.dataset.a || '') === c.a && (z.dataset.k || '') === c.k && z.textContent.trim().slice(0, 26) === c.t); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return Object.assign({}, c, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }, c2); if (!cc) continue; }
    steps++; await tapCtl(p, tag, cc);
  }
  await fail(p, tag, 'timeout', 'game not finished in time'); return 'timeout';
}
// ---------------- the headless chapter-1 newcomer (draw until risk > 30 %, then stop; buy the "best" shop pick) ----------------
function c1WinRate(n) {
  const CF = require('./src/engine.js'); require('./src/ai.js'); const ch = require('./campaign.json').chapters[0]; let win = 0, goal = 0, tie = 0;
  for (let g = 0; g < n; g++) {
    const G = CF.newGame({ players: ch.setup.players, seed: 9000 + g, ai: ['simple', ch.opponent.aiLevel], setMode: ch.setup.setMode, firstCard: ch.setup.firstCard }); G.nolog = true; let st = 0;
    while (G.phase !== 'over' && st++ < 6000) for (const s of CF.pending(G)) {
      let m; if (s === 0) { const L = CF.moves(G, 0); if (G.phase === 'brew' && G.players[0].st === 'draw') { const dr = L.find(x => x.t === 'draw'), sp = L.find(x => x.t === 'stop'); m = dr && (!sp || CF.risk(G, 0).pBoom <= .3) ? dr : (sp || dr); } if (!m) m = CF.AI.choose(G, 0, 'normal'); } else m = CF.AI.choose(G, s);
      if (!m) m = CF.moves(G, s)[0]; const mm = Object.assign({}, m); delete mm.label; CF.apply(G, s, mm);
    }
    const a = G.players[0].vp, b = G.players[1].vp; if (a > b) win++; else if (a === b) tie++; if (a >= 15) goal++;
  }
  return { n, win: win / n, tie: tie / n, goal: goal / n };
}
// ---------------- story ----------------
async function playStory(b, id, W, H) {
  const tag = 'story-' + id + '-' + W + 'x' + H, p = await newPage(b, W, H, false); await p.goto(URL); await sleep(900);
  await p.evaluate(() => { const ch = {}; for (let i = 1; i <= 9; i++) ch['c' + i] = { beaten: true, stars: 1, tries: 1, losses: 0 }; localStorage.setItem('gns-campaign-cauldron', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c9' })); });
  await p.goto(URL); await sleep(900); await p.evaluate(() => { window.AIDELAY = 70; });
  await p.evaluate(i => GXC.play(i), id); await sleep(300);
  for (let k = 0; k < 10; k++) { const did = await p.evaluate(() => { const b = [...document.querySelectorAll('.gxc-btn.go')].find(x => /Fight|Next|Start|Meet|Play/.test(x.textContent)); if (b) { b.click(); return true; } return false; }); if (!did) break; await sleep(150); }
  await sleep(500); await p.evaluate(() => { UI.pullMs = 0; }); await hook(p);
  const info = await p.evaluate(() => ({ np: G.np, ai: G.players.map(q => q.ai), droplet: G.players.map(q => q.droplet), vp: G.players.map(q => q.vp), rubies: G.players.map(q => q.rubies), bag: G.players.map(q => q.bag.length + q.pot.length + q.newChips.length), coach: UI.coach.level, base: CF.DATA.startRubies }));
  let twist = 'ok';
  if (id === 'c10') twist = info.droplet[1] === 1 && info.ai[1] === 'hard' ? 'ok' : 'WRONG ' + JSON.stringify(info);
  if (id === 'c3') twist = (info.droplet.every(d => d === 0) && info.rubies[1] === info.base && info.vp[1] === 0) ? 'ok (boss has no twist, none leaks)' : 'WRONG ' + JSON.stringify(info);
  if (id === 'c1') twist = (info.coach === 'full' && info.ai[1] === 'easy' && info.droplet[1] === 0) ? 'ok' : 'WRONG ' + JSON.stringify(info);
  if (twist.startsWith('WRONG')) await fail(p, tag, 'twist', twist);
  const r = await playGame(p, tag, { maxMs: 300000 });
  const res = await p.evaluate(() => ({ vp: G.players.map(q => q.vp), over: G.phase === 'over' }));
  for (const e of pageErrs(p)) await fail(p, tag, 'js-error', e);
  await p.context().close(); return { id, size: W + 'x' + H, ended: r === 'over', twist, vp: res.vp };
}
// ---------------- main ----------------
(async () => {
  const t0 = Date.now(); const b = await PW.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const jobs = []; for (let i = 0; i < GAMES; i++) jobs.push({ i, size: SIZES[i % 2], rot: false, anim: i < ANIMN });
  for (let i = 0; i < ROT; i++) jobs.push({ i: GAMES + i, size: SIZES[i % 2], rot: true, anim: false });
  let next = 0, done = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++], tag = 'g' + j.i + (j.rot ? 'R' : '') + '@' + j.size.join('x') + (j.anim ? 'A' : ''); const nf = counts.fail;
      let r = 'error'; let p;
      try { p = await newPage(b, j.size[0], j.size[1], j.anim); await startVs(p, j.i % 2 ? 'off' : 'full'); if (!j.anim) await p.evaluate(() => { UI.pullMs = 0; }); r = await playGame(p, tag, { rotate: j.rot, maxMs: j.anim ? 420000 : 260000 }); }
      catch (e) { if (p) await fail(p, tag, 'exception', e.message); }
      finally { if (p) await p.context().close().catch(() => { }); }
      const ok = r === 'over' && counts.fail === nf; if (ok) counts.pass++; done++;
      console.log((ok ? 'PASS ' : 'FAIL ') + tag + ' ' + r + ' (' + done + '/' + jobs.length + ')');
    }
  };
  await Promise.all(Array.from({ length: PAR }, worker));
  const story = [];
  if (process.env.STORY !== '0') for (const id of ['c1', 'c3', 'c10']) for (const [W, H] of SIZES) { const r = await playStory(b, id, W, H); story.push(r); console.log('STORY', JSON.stringify(r)); if (r.ended && r.twist.startsWith('WRONG') === false) counts.pass++; }
  await b.close();
  const c1 = c1WinRate(C1N); console.log('observed states (polls): ' + JSON.stringify(STAT));
  console.log('\n===== SWEEP SUMMARY =====');
  console.log('games: ' + jobs.length + ' (' + ROT + ' with rotation), checks PASS ' + counts.pass + ' / FAIL-events ' + counts.fail + ', distinct failures ' + fails.length + ', ' + Math.round((Date.now() - t0) / 1000) + ' s');
  story.forEach(s => console.log('story ' + s.id + ' ' + s.size + ': ' + (s.ended ? 'reached the end' : 'DID NOT END') + ', twist ' + s.twist + ', score ' + s.vp.join('-')));
  console.log('chapter 1 newcomer (draw until risk>30%, buy best) vs ' + require('./campaign.json').chapters[0].opponent.aiLevel + ': win ' + Math.round(c1.win * 100) + '%, tie ' + Math.round(c1.tie * 100) + '%, goal(15 pts) ' + Math.round(c1.goal * 100) + '% over ' + c1.n + ' games');
  fails.slice(0, 10).forEach((f, i) => console.log((i + 1) + '. [' + f.tag + '] ' + f.kind + ': ' + f.detail + (f.shot ? '  shot: sweep-shots/' + f.shot : '')));
  console.log(fails.length ? 'RESULT: FAIL' : 'RESULT: CLEAN'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
