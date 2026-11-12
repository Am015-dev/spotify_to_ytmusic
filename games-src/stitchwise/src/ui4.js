// ui4: tutorial (GXT), story (GXC), help bulb (GXH), music slots (GXMUS), boot
var TUT_GAME = 'stitchwise', TUT_RING = [0, 30, 8, 17, 7, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32], TUT_RULES = 10;
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.tutorial; }
function tutAct(x) { if (!tutOn()) return true; var ev = x.what === 'drop' || x.what === 'rot' || x.what === 'flip'; return GXT.act(Object.assign({ type: ev ? 'event' : 'tap' }, x)); }
function tq(sel) { return function () { return $(sel); }; }
window.GXCOACH = { running: false, explained: [], done: false };   // qa-bot / tests: the coached first game's state
function coachSkipToMap() { try { if (typeof GXT !== 'undefined' && GXT.markDone) GXT.markDone(TUT_GAME); } catch (e) { } UI.seq++; clearTimeout(UI.tm.ai); UI.coach = null; UI.prologue = false; GXCOACH.running = false; G = null; UI.started = false; try { localStorage.removeItem('sw_save'); } catch (e) { } showStart(); if (typeof GXC !== 'undefined') GXC.open(); }
function PRO() { return ((window.CAMPAIGN || {}).story || {}).prologue || {}; }
// ---------- coach: the rest of the tutorial game (chapters 2-4). Aunt Wren notices each rule the first time it happens; the player keeps playing for real.
function coachData() { return (window.CAMPAIGN || {}).story || {}; }
function coachStart() { GXCOACH.running = true; GXCOACH.done = false; GXCOACH.explained = []; UI.coach = { seen: {}, qk: {}, q: [], line: '', ch: 1, fresh: 0, shown: [], buy: 0 }; coachSay('start', null, true); }
function coachSay(key, vars, now) {
  var C = UI.coach; if (!C || C.seen[key] || C.qk[key]) return; var d = (coachData().coach || {})[key]; if (!d) return;
  var t = d[1].replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); C.qk[key] = 1; var it = { k: key, ch: d[0], t: t };
  if (now) { C.q.unshift(it); coachNext(); } else { C.q.push(it); if (!C.line || C.fresh <= 0) coachNext(); }
}
function coachNext() { var C = UI.coach; if (!C || !C.q.length) return; var n = C.q.shift(); C.seen[n.k] = 1; C.line = n.t; C.ch = n.ch; C.fresh = 2; C.shown.push(n.k); GXCOACH.explained.push(n.k); coachRender(); }
function coachRender() { try { if (UI.coach && UI.coach.line) { clearTimeout(toast.t); $('#toast').classList.remove('on'); } } catch (e) { } /* W470: one message at a time */
  var el = $('#guide'); if (!el) return; var C = UI.coach, txt = C && C.line ? C.line : '';
  var sk = $('#skipmap'); if (UI.coach && UI.prologue && G && !G.over) { if (!sk) { sk = h('button#skipmap.btn.alt.sm', { type: 'button', 'data-a': 'skipmap' }, 'Skip to map'); var db = $('#dockbody'); if (db) db.appendChild(sk); } } else if (sk) sk.remove();
  el.hidden = !txt || !G || G.over; if (el.hidden) { el.dataset.k = ''; return; } var key = txt + '|' + (C ? C.ch : ''); if (el.dataset.k === key) return; el.dataset.k = key; el.innerHTML = '';
  var cast = ((window.CAMPAIGN || {}).cast || {}).wren || {}, chn = C ? (coachData().chapters || {})[C.ch] : '';
  el.appendChild(h('span.gface', { style: 'background:' + (C ? cast.color || '#3b7a8c' : '#a8432f'), 'aria-hidden': 'true' }, C ? (cast.emoji || '\u{1F9F5}') : '\u{1F380}')); var pim = C && artHas('portrait-wren') ? artImg('portrait-wren') : null; if (pim) { var gf = el.lastChild; gf.textContent = ''; pim.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover'; gf.appendChild(pim); }
  if (C) { var xb = h('button.gx-x.gclose', { type: 'button', 'aria-label': 'Hide Aunt Wren' }, '\u00D7'); xb.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); C.line = ''; coachRender(); }); el.appendChild(xb); }
  el.insertBefore(h('span.gtx', C ? h('b', (cast.name || 'Aunt Wren') + (chn ? ' \u00B7 Ch. ' + C.ch + ' ' + chn : '')) : null, h('span', txt)), C ? el.lastChild : null);
}
function coachCheck() { // after every move: what just happened for the first time?
  var C = UI.coach; if (!C || !G) return; C.fresh--;
  (G.ev || []).forEach(function (e) {
    if (e.k === 'move') SW.BTN_SPOTS.forEach(function (b) { if (b > e.from && b <= e.to) { if (e.s === 0) coachSay(G.inc[0] > 0 ? 'income_me' : 'income_zero', { n: G.inc[0] + ' button' + (G.inc[0] === 1 ? '' : 's') }); else coachSay('income_opp'); } });
    if (e.k === 'place' && e.pid === 100 && e.s === 1) coachSay('leather_opp');
    if (e.k === 'place' && e.cost != null && e.pid != null && PATCHES[e.pid]) { var P = PATCHES[e.pid];
      if (e.s === 0 && !C.buy) { C.buy = 1; coachSay(P.time >= 5 && P.inc === 0 ? 'buy_poor' : P.inc > 0 ? 'buy_good' : P.n >= 5 ? 'buy_big' : 'buy_cheap', null, true); }
      if (e.s === 1 && P.time >= 5) coachSay('opp_slow'); }
    if (e.k === 'move' && e.s === 0 && e.gain) coachSay('adv_me', null, true);
    if (e.k === 'bonus') coachSay('bonus', { name: e.s === 0 ? 'You' : nameOf(e.s) });
  });
  if (!G.over) {
    var w = swWho(G); if (G.pend && w === 0) coachSay('leather_me', null, true);
    if (w === 0 && !G.pend && swOffer(G).some(function (pid) { return G.btn[0] < PATCHES[pid].cost; })) coachSay('cant');
    if (G.pos[0] >= 40) coachSay('late');
    if (G.pos[0] >= 53 && G.pos[1] < 53) coachSay('end_me', null, true); if (G.pos[1] >= 53 && G.pos[0] < 53) coachSay('end_opp', null, true);
  }
  if (C.q.length && C.fresh <= 0) coachNext(); coachRender();
}
function coachFinal(ban, w, A, B) { // the judging: the tutorial's climax line on the result banner, the score walked through, rules still to meet
  var C = UI.coach; if (!C) return; var f = coachData().final || {}; C.seen.final = 1; C.shown.push('final');
  var a = swScore(G, 0), b2 = swScore(G, 1); if (f.walk) ban.appendChild(h('div.rvt3.walk', f.walk.replace('{b}', a.btn).replace('{x}', a.bonus ? 7 : 0).replace('{e}', a.empty).replace('{t}', a.total).replace('{ob}', b2.btn).replace('{ox}', b2.bonus ? 7 : 0).replace('{oe}', b2.empty).replace('{ot}', b2.total)));
  var L = coachData().later || {}, miss = [], has = function () { for (var i = 0; i < arguments.length; i++) if (C.seen[arguments[i]]) return true; return false; };
  if (!has('income_me', 'income_zero', 'income_opp')) miss.push(L.income); if (!has('leather_me', 'leather_opp')) miss.push(L.leather); if (!has('cant')) miss.push(L.cant);
  if (!has('again', 'again_opp', 'opp_slow')) miss.push(L.again); if (!has('bonus') && G.bonus != null) miss.push(L.bonus); if (!has('end_me', 'end_opp')) miss.push(L.end); if (A !== B) miss.push(L.tie);
  if (miss.length) { var card = h('div.rvlater', h('b', 'Things you\u2019ll meet later')); miss.filter(Boolean).forEach(function (t) { card.appendChild(h('div', '\u2022 ' + t)); }); ban.appendChild(card); }
  C.later = miss.length; GXCOACH.explained.push('final'); GXCOACH.done = true; GXCOACH.running = false; try { if (typeof GXT !== 'undefined' && GXT.markDone) GXT.markDone(TUT_GAME); } catch (e) { }
  var t = A === B ? f.tie : w === 0 ? f.win : f.lose; if (G.bonus == null) { C.seen.bonus = 1; C.shown.push('bonus'); t += ' ' + (f.nobonus || ''); }
  var wl = h('div.rvt3.wren', t), t2 = ban.querySelector('.rvt2'); if (t2 && t2.nextSibling) ban.insertBefore(wl, t2.nextSibling); else ban.appendChild(wl); ban.classList.add('coachban'); try { localStorage.setItem('sw_tutcov', JSON.stringify(Object.keys(C.seen))); } catch (e) { }
}
function tutLeave() { UI.seq++; clearTimeout(UI.tm.ai); UI.tutorial = false; UI.tutAi = false; UI.started = false; UI.busy = 0; UI.sel = -1; try { GXH.hide(); } catch (e) { } G = null; $$('.flt,.coin').forEach(function (e) { e.remove(); }); }
// ---------- story
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else GXC.open(); }
function campLine() { try { if (typeof GXC === 'undefined' || !window.CAMPAIGN) return ''; var p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(function (c) { return p.ch[c.id] && p.ch[c.id].beaten; }).length; return n ? n + ' of ' + ch.length + ' stages done' : ''; } catch (e) { return ''; } }
function campStart(def) {
  var op = def.opponent || {}; $('#start').hidden = true; UI.lvl = op.aiLevel || 'normal'; var g = newGame('story', { camp: def, lvl: UI.lvl, seed: def.setup && def.setup.seed != null ? def.setup.seed : null, first: 0 });
  return g;
}

// Story result: our own best score per stage (the shared kit keeps only stars), and the totals + tie-break line the kit screen lacks
function campBest(g) { try { var id = UI.camp.id, b = JSON.parse(localStorage.getItem('sw_best') || '{}'), n = swScore(g, 0).total; if (b[id] == null || n > b[id]) b[id] = n; localStorage.setItem('sw_best', JSON.stringify(b)); } catch (e) { } }
function campResultNote(g) {
  try { GXH.hide(); setTimeout(function () { try { GXH.hide(); } catch (e) { } }, 700); } catch (e) { }
  var box = $('.gxc-res'); if (!box) return; var a = swScore(g, 0), b = swScore(g, 1), w = swWinner(g), best = null; try { best = (JSON.parse(localStorage.getItem('sw_best') || '{}'))[UI.camp.id]; } catch (e) { }
  var n = h('div.rvnote', h('div.rvsc', h('span', 'You'), h('b', String(a.total)), h('span.dash', '–'), h('b', String(b.total)), h('span', nameOf(1))));
  if (a.total === b.total) n.appendChild(h('div.rvtb', w === 0 ? 'Tied on points. You reached the end first, so you win the tie-break.' : 'Tied on points. ' + nameOf(w) + ' reached the end first and wins the tie-break, so this is a loss.'));
  else if (w !== 0) n.appendChild(h('div.rvtb', 'Lost by ' + (b.total - a.total) + ' point' + (b.total - a.total === 1 ? '' : 's') + '.'));
  else n.appendChild(h('div.rvtb', 'Won by ' + (a.total - b.total) + ' point' + (a.total - b.total === 1 ? '' : 's') + '.'));
  if (w !== 0) n.appendChild(h('div.rvtb', 'Stars are only earned on a win.'));
  try { var cc = (window.CAMPAIGN.chapters || []).filter(function (c) { return c.id === UI.camp.id; })[0], cast = window.CAMPAIGN.cast || {}; if (w !== 0 && cc && cc.outroLose) cc.outroLose.forEach(function (l) { n.appendChild(h('div.rvtb.wren', (cast[l.who] ? cast[l.who].name : l.who) + ': ' + l.text)); }); } catch (e) { }
  if (best != null) n.appendChild(h('div.rvtb', 'Your best here: ' + best));
  var h2 = $('h2', box); if (h2 && h2.nextSibling) box.insertBefore(n, h2.nextSibling); else box.appendChild(n);
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  var mapOpen = GXC.open; GXC.open = function () { var r = mapOpen.apply(GXC, arguments); setTimeout(function () { var e = $('.gxc'); if (e) artBg(e, 'bg-map'); }, 60); return r; };
  GXC.init({ game: 'stitchwise', data: window.CAMPAIGN,
    portrait: function (who, size, c) { var stem = c && c.portrait ? c.portrait.replace(/\.webp$/, '') : null; if (stem && artHas(stem)) { var i = artImg(stem); if (i) { i.style.width = i.style.height = size + 'px'; i.style.borderRadius = '50%'; i.style.objectFit = 'cover'; return i; } } return null; },
    startChapter: campStart, isWon: function (g) { return swWinner(g) === 0 && (!UI.camp || UI.camp.goal.type !== 'custom' || metrics(g).empty <= 6 || UI.camp.id !== 'c9') && (UI.camp && UI.camp.goal.type === 'score' ? metrics(g).score >= UI.camp.goal.value : true); }, metrics: metrics,
    onExit: function () { UI.camp = null; G = null; UI.started = false; showStart(); }, scores: function (g) { return [swScore(g, 0).total, swScore(g, 1).total]; }, seats: function () { return [{ name: 'You', me: true }, { name: UI.names[1], ai: UI.lvl }]; } });
}
// ---------- help bulb: suggests the computer's best move for you, with the why
function hlpPhase() { if (!G || G.over || UI.busy || !UI.started || !isHuman(swWho(G)) || (UI.camp ? false : false)) return null; return G.pend ? 'leather' : UI.sel >= 0 ? 'place' : 'choose'; }
function whatDo() { var sg = hlpSuggest(); if (!sg) return; var t = sg.target && sg.target(); if (t) { t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); } var dt = $('#detail'); if (dt) dt.textContent = 'Try this: ' + sg.why; }
function hlpSuggest() {
  if (!G || G.over || !isHuman(swWho(G)) || G.pend) return null; var m = aiMove(G, 'hard', function () { return .5; }), s = swWho(G);
  if (m.t === 'buy') { var p = PATCHES[swOffer(G)[m.k]]; return { target: function () { return $$('#offers .offer')[m.k]; }, why: p.name + ' fits well and is worth ' + p.n * 2 + ' points of squares.' }; }
  return { target: function () { return $('[data-a=adv]'); }, why: 'Advancing gets you buttons and the next turn.' };
}
function hlpPhaseUpdate() { try { if (typeof GXH !== 'undefined' && !tutOn()) GXH.phase(hlpPhase()); } catch (e) { } }
function hlpRefresh() { hlpPhaseUpdate(); }
function svgPatch(c) { return '<svg viewBox="0 0 60 40" width="60" height="40"><rect x="6" y="6" width="16" height="16" fill="' + c + '"/><rect x="22" y="6" width="16" height="16" fill="' + c + '"/><rect x="6" y="22" width="16" height="16" fill="' + c + '"/></svg>'; }
function hlpInit() {
  if (typeof GXH === 'undefined') return;
  GXH.init({ game: 'stitchwise', defaultOn: false, avoid: '.offer,#acts button,#quilt',
    steps: { choose: { target: function () { return $('#offers'); }, title: 'Choose a patch', text: 'Tap one of three patches to buy it, or Advance to earn buttons.' }, place: { target: function () { return $('#quilt'); }, title: 'Place it', text: 'Drag it on your quilt, rotate if needed, then Sew it on.' }, leather: { target: function () { return $('#quilt'); }, title: 'Free leather patch', text: 'Tap any empty square for your free 1 by 1 patch.' } },
    rules: [{ title: 'Buy or advance', text: 'Buy a patch with buttons, or advance your token to earn buttons.', pic: svgPatch('#c0527a') }, { title: 'Time decides turns', text: 'The token further back plays. Big patches take more time.', pic: svgPatch('#2a8a80') }, { title: 'Button spots', text: 'Passing a gold spot pays the buttons printed on your patches.', pic: svgPatch('#e0a82e') }, { title: 'Score', text: 'Buttons plus 7 bonus, minus 2 per empty square.', pic: svgPatch('#4a86b8') }] });
  var bb = $('#bulbbtn'); if (bb) { bb.removeAttribute('data-help'); bb.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setHints(!UI.hints); }, true); } setHints(UI.hints);
}
// ---------- music: five slots, silent until files exist
var MUS_SLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Last stretch'], ['victory', 'Victory'], ['defeat', 'Defeat']];
function musSlot() { if (!G || !UI.started || $('#start').hidden === false) return ['tavern', 0]; if (G.over) return [swWinner(G) === 0 ? 'victory' : 'defeat', 1]; if ((UI.camp && UI.camp.boss) || Math.min(G.pos[0], G.pos[1]) > 36) return ['fight', 0]; return ['main', 0]; }
function musInit() {
  try { var mm = {}; (window.SW_MUSIC || []).forEach(function (f) { mm[f.replace(/\.mp3$/, '')] = 'url:music/' + f; }); if (typeof GA !== 'undefined') GA.init({ key: 'sw', sfx: {}, music: mm }); GX.applyPrefs && GX.applyPrefs(); } catch (e) { }
  try { GXMUS.init({ key: 'sw', slots: MUS_SLOTS, slot: musSlot, on: function () { return UI.sound; } }); } catch (e) { }
}
// ---------- boot
document.addEventListener('click', function (e) { // mark the chosen menu section / the last pressed menu button
  var c = e.target.closest && e.target.closest('.gx-chip'); if (c) { $$('.gx-chip').forEach(function (x) { x.setAttribute('aria-current', 'false'); }); c.setAttribute('aria-current', 'true'); }
  var m = e.target.closest && e.target.closest('.gx-row .btn, .gxc-ib'); if (m) m.setAttribute('data-last', String(Date.now()));
}, true);
function boot() {
  try { GX.init({ key: 'sw' }); } catch (e) { console.error(e); }
  try { var gs = GX.show; GX.show = function () { try { GXH.hide(); } catch (e) { } return gs.apply(GX, arguments); }; } catch (e) { }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.querySelector('.gx-app.gx-dock-min') && G && UI.started) { try { GX.showDock(); } catch (x) { } } });
  try { var gr = GXT.running, gs2 = GXT.state; GXT.running = function () { return gr.apply(GXT, arguments) || !!(UI.coach && G && !G.over); }; GXT.state = function () { return gr.apply(GXT, arguments) ? gs2.apply(GXT, arguments) : null; }; } catch (e) { } // W470: the coached Learn game counts as a running tutorial for test drivers
  buildMenu(); buildRules(); buildPatchList(); bindQuilt(); campInit(); hlpInit(); musInit(); try { if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) GX.offline({ sw: '../sw.js', scope: '../' }); } catch (e) { }
  try { GNS.achievements('stitchwise', [{ id: 'win', name: 'First ribbon', how: 'Win a game.', test: function (r) { return r.won; } }, { id: 'tidy', name: 'Not a gap', how: 'Finish a game with at most 3 empty squares.', test: function (r, st, raw) { return r.won && raw && raw.scores && raw.scores[0] > 20; } }]); } catch (e) { }
  var rf = function () { if (G && UI.started) render(); }; try { var bk = ''; GX.onResize(function (w, hh) { var k = w + 'x' + hh; if (k !== bk && G && UI.started) { bk = k; render(); } }); } catch (e) { } if (typeof GXV !== 'undefined') GXV.watch(function () { rf(); }); else window.addEventListener('resize', rf);
  if (window.GXS && GXS.on) return; // scenarios build their own state
  var first = false; try { first = !localStorage.getItem('sw_seen'); localStorage.setItem('sw_seen', '1'); } catch (e) { }
  showStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

// ui5 (W491): the full ring of patches as a scrollable strip, the rival's quilt a tap away, and a guided first game
// that teaches every rule in order (one short line + one highlighted thing to tap per step), then hands over a real game.

// ---------- the ring: spool (neutral token), the 3 on sale lifted, then every other patch clockwise
function ringStrip() {
  var box = $('#offers'); if (!box || !G || G.over || G.pend || box.style.display === 'none' || box.classList.contains('placing')) return;
  var L = G.ring.length; box.classList.add('ring');
  box.insertBefore(h('span.ntok', { title: 'The spool: only the 3 patches after it are for sale', 'aria-label': 'Spool. The 3 patches after it are for sale' }, h('i')), box.firstChild);
  var cs = document.documentElement.classList.contains('sm') ? 8 : 10;
  for (var k = 3; k < L; k++) {
    var pid = G.ring[(G.start + k) % L], p = PATCHES[pid], bb = bbox(p.cells);
    var c = h('div.offer.up', { 'data-a': 'upnext', 'data-pid': pid, role: 'button', tabindex: '-1', 'aria-label': p.name + ', not for sale yet: ' + p.cost + ' buttons, ' + p.time + ' time, ' + p.inc + ' income' });
    c.appendChild(patchShape(pid, '', Math.max(6, Math.min(cs, Math.floor(56 / bb[0]), Math.floor(40 / bb[1])))));
    c.appendChild(h('div.upf', { html: '<span class="uc">' + p.cost + '</span><span class="ut">' + p.time + '</span><span class="ui">+' + p.inc + '</span>' }));
    box.appendChild(c);
  }
  if (L > 3) box.appendChild(h('span.ringend', { 'aria-hidden': 'true' }, '↻'));
  if (UI.ringSeen !== G.start + ':' + L) { UI.ringSeen = G.start + ':' + L; box.scrollLeft = 0; }
}
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('[data-a]'); if (!t || !G) return; var a = t.dataset.a;
  if (a === 'upnext') { e.stopImmediatePropagation(); t.classList.remove('nope'); void t.offsetWidth; t.classList.add('nope'); toast('Not for sale yet. Only the 3 after the spool.', 2200); return; }
  if (a === 'strip' && +t.dataset.seat !== viewSeat() && !T2) { e.stopImmediatePropagation(); showOppQuilt(+t.dataset.seat); return; }   // the rival's quilt, one tap away
  if (a === 't2next') { e.stopImmediatePropagation(); t2Next(); return; }
  if (a === 't2real') { e.stopImmediatePropagation(); t2Real(); return; }
}, true);

// ---------- guided first game
var T2 = null;
function t2Step() { return T2 ? T2.steps[T2.i] : null; }
function t2Allow(kind, k) {
  var st = t2Step(); if (!st) return true; if (kind === 'cancel') return false;
  var ok = st.allow ? st.allow(kind, k) : false; if (!ok) { t2Nudge(); } return ok;
}
function t2Nudge() { t2Targets().forEach(function (t) { t.classList.remove('t2-hl'); void t.offsetWidth; t.classList.add('t2-hl'); }); var b = $('#tutb'); if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); } sfx('bad'); }
function t2Target() { return t2Targets()[0] || null; }
function t2Targets() { var st = t2Step(), t = null; try { t = st && st.target ? st.target() : null; } catch (e) { } return !t ? [] : Array.isArray(t) ? t : [t]; }
function t2Offer(k) { return function () { return $$('#offers .offer:not(.up)')[k]; }; }
function t2OfferOk(k) { var st = t2Step(); return !st || !!(st.allow && st.allow('offer', k)); }   // only light up patches the current step accepts
function t2Mine() { return G && !G.over && !UI.busy && isHuman(swWho(G)); }
function t2Shape(pid, f) { return swNorm(PATCHES[pid].cells.map(f)); }
function t2OrIdx(pid, cells) { var k = JSON.stringify(cells), r = -1; PATCHES[pid].or.forEach(function (o, i) { if (JSON.stringify(o) === k) r = i; }); return r; }
function t2Setup() { // a practice fair, set before the first turn: tokens on 36/37, Wren's old quilt with 3 gaps (nothing changes later)
  G.pos = [36, 37]; G.stamp = [1, 2]; G.tick = 2; G.cur = 0;
  var r1 = t2Shape(8, function (q) { return [-q[1], q[0]]; }), f2 = t2Shape(7, function (q) { return [-q[0], q[1]]; });
  T2.h1 = r1.map(function (q) { return [q[0] + 2, q[1] + 2]; }); T2.o1 = t2OrIdx(8, r1);
  T2.h2 = f2.map(function (q) { return [q[0] + 4, q[1] + 5]; }); T2.o2 = t2OrIdx(7, f2); T2.hl = [6, 6];
  var gaps = {}; T2.h1.concat(T2.h2, [T2.hl]).forEach(function (q) { gaps[q[1] * 9 + q[0]] = 1; });
  var og = { 30: 1, 40: 1, 50: 1 };
  for (var i = 0; i < 81; i++) { G.board[0][i] = gaps[i] ? -1 : 101; G.board[1][i] = og[i] ? -1 : 101; }
}
function t2AtGap(gap) { var c = curCells() || []; return ghostOk() && c.every(function (q) { return gap.some(function (h) { return h[0] === UI.gx + q[0] && h[1] === UI.gy + q[1]; }); }); }
function t2Steps() {
  var adv = function () { return $('[data-a=adv]'); }, sew = function () { return $('[data-a=sew]'); }, ghost = function () { return $('#ghost'); };
  var advStep = function (id, rule, say, done) { return { id: id, rule: rule, say: say, target: adv, allow: function (a) { return a === 'adv'; }, done: done }; };
  return [
    { id: 'buy', rule: 'buy', say: 'Fill the 3 gold gaps. Only 3 patches are for sale: tap this.', target: t2Offer(1), allow: function (a, k) { return a === 'offer' && k === 1; }, done: function () { return UI.sel === 1; } },
    { id: 'rotate', rule: 'rotate', say: 'Turn it to match the top gap. Tap Rotate.', target: function () { return $('[data-a=rot]'); }, allow: function (a) { return a === 'rot'; }, done: function () { return UI.o === T2.o1; } },
    { id: 'place', rule: 'place', say: 'Drag the patch into the gold gap.', target: ghost, gap: 'h1', allow: function (a) { return a === 'rot' || a === 'flip'; }, done: function () { return t2AtGap(T2.h1); } },
    { id: 'pay', rule: 'pay', say: 'Sew it on. You pay its 4 buttons.', target: sew, gap: 'h1', allow: function (a) { return a === 'sew' && t2AtGap(T2.h1); }, done: function () { return G.owned[0].length >= 1; } },
    { id: 'time', rule: 'time', say: 'It cost 2 time: you moved 2. Furthest back plays next.', btn: 'Watch', target: function () { return $('#tutb .t2b'); },
      onBtn: function () { UI.tutAi = true; schedule(); }, done: function () { return T2.pressed && t2Mine(); } },
    advStep('advance', 'advance', 'Or Advance: jump just past Marden, +1 button per space.', function () { return G.log.some(function (l) { return l[0] === 0 && l[1] === 'adv'; }) && t2Mine(); }),
    advStep('income', 'income', 'Pass a gold spot: +1 button per button on your patches.', function () { return G.pos[0] > 41 && t2Mine(); }),
    advStep('leather', 'leather', 'First past the leather square gets a free 1x1 patch.', function () { return !!G.pend; }),
    { id: 'leather2', rule: 'leather', say: 'Tap the single gold gap to sew it.', target: function () { return $$('#quilt .qc')[T2.hl[1] * 9 + T2.hl[0]]; }, allow: function (a, k) { var ok = a === 'leather' && k === T2.hl[1] * 9 + T2.hl[0]; if (a === 'leather' && !ok) { var tt = $('#tutb .t2t'); if (tt) tt.textContent = 'That gap is for your next patch. Tap the single square.'; } return ok; }, done: function () { return G.board[0][T2.hl[1] * 9 + T2.hl[0]] === 100 && t2Mine(); } },
    { id: 'bonus', rule: 'bonus', say: 'First to fill a 7x7 square gets +7. Tap this patch.', target: t2Offer(1), allow: function (a, k) { return a === 'offer' && k === 1; }, done: function () { return UI.sel === 1; } },
    { id: 'flip', rule: 'flip', say: 'Mirror it to match the last gap. Tap Flip.', target: function () { return $('[data-a=flip]'); }, allow: function (a) { return a === 'flip'; }, done: function () { return UI.o === T2.o2; } },
    { id: 'place2', rule: 'bonus', say: 'Drag it into the last gold gap.', target: ghost, gap: 'h2', allow: function (a) { return a === 'rot' || a === 'flip'; }, done: function () { return t2AtGap(T2.h2); } },
    { id: 'sew2', rule: 'bonus', say: 'Sew it on: your 7x7 square is full, +7.', target: sew, gap: 'h2', allow: function (a) { return a === 'sew' && t2AtGap(T2.h2); }, done: function () { return G.bonus === 0 && t2Mine(); } },
    advStep('end', 'end', 'Game ends when both reach the end. Keep tapping Advance.', function () { return G.over; })
  ];
}
function tutStart(o) { // replaces the coached half-game: a guided first game, then a real one
  try { clearTimeout(toast.t); $('#toast').classList.remove('on'); GX.close(); } catch (e) { }
  if (typeof GXT !== 'undefined' && GXT.active && GXT.active()) try { GXT.stop(); } catch (e) { }
  t2Clear(); $('#start').hidden = true; $('#rs').hidden = true;
  newGame('tutorial', { seed: 4242, ring: TUT_RING, first: 0, lvl: 'easy', name: 'Marden', save: false });
  UI.prologue = !!(o && o.prologue); T2 = { steps: t2Steps(), i: 0, pressed: false, seen: [] }; window.GXT2 = T2; UI.tutAi = false; t2Setup();
  t2Enter(); clearInterval(UI.t2iv); UI.t2iv = setInterval(t2Tick, 120);
}
function t2Enter() { var st = t2Step(); T2.pressed = false; if (st.enter) st.enter(); if (T2.seen.indexOf(st.rule) < 0) T2.seen.push(st.rule); render(); t2Show(); }
function t2Next() { var st = t2Step(); if (!st || !st.btn || T2.pressed) return; T2.pressed = true; var b = $('#tutb .t2b'); if (b) b.disabled = true; if (st.onBtn) st.onBtn(); }
function t2Tick() {
  if (!T2) { clearInterval(UI.t2iv); return; } var st = t2Step(); if (!st || !G) return;
  if (!UI.busy && st.done()) { if (st.leave) st.leave(); if (G.over && st.id === 'end') return; if (T2.i < T2.steps.length - 1) { T2.i++; t2Enter(); } return; }
  t2Show();
}
function t2Show() {
  var st = t2Step(); if (!st || $('#tutfin')) return; var db = $('#dockbody'); if (!db) return; var b = $('#tutb');
  if (!b) { b = h('div#tutb', { role: 'status', 'aria-live': 'polite' }); } var bar = $('.gx-bar'), mb = bar && $('[data-gx=setd]', bar), ph = !UI.wide && innerWidth <= 600 && innerHeight > innerWidth; document.documentElement.classList.add('swtut'); /* R16: on a phone the coach line rides in the top bar (Menu stays), so the tutorial quilt is as big as the real game's */
  if (ph && mb) { if (b.nextSibling !== mb) { bar.insertBefore(b, mb); requestAnimationFrame(function () { if (T2 && G) render(); }); } } else if (b.parentNode !== db || db.firstChild !== b) db.insertBefore(b, db.firstChild);
  var n = T2.seen.length, key = st.id + ':' + T2.pressed;
  if (b.dataset.key !== key) { b.dataset.key = key; b.dataset.rule = st.rule; b.dataset.step = st.id; b.innerHTML = '';
    b.appendChild(h('span.t2n', Math.min(n, TUT_RULES) + '/' + TUT_RULES)); b.appendChild(h('span.t2t', st.say));
    if (st.btn) { var bt = h('button.btn.go.sm.t2b', { type: 'button', 'data-a': 't2next' }, T2.pressed ? 'Watching…' : st.btn); bt.disabled = !!T2.pressed; b.appendChild(bt); } }
  var t = t2Target(); $$('.t2-hl').forEach(function (e) { if (e !== t) e.classList.remove('t2-hl'); }); if (t && !UI.busy && !(st.btn && T2.pressed)) t.classList.add('t2-hl');
  var all = st.id === 'leather2' && T2.hl ? [T2.hl] : (T2.h1 || []).concat(T2.h2 || [], T2.hl ? [T2.hl] : []); /* R7: only the 1x1 gap glows while the free patch waits */ $$('#quilt .qc').forEach(function (e, i) { e.classList.toggle('t2gap', viewSeat() === 0 && G.board[0][i] === -1 && all.some(function (q) { return q[1] * 9 + q[0] === i; })); });
  var pr = $('#prompt'); if (pr) pr.classList.add('t2hide');
}
function t2Clear() { clearInterval(UI.t2iv); T2 = null; window.GXT2 = null; document.documentElement.classList.remove('swtut'); var b = $('#tutb'); if (b) b.remove(); var f = $('#tutfin'); if (f) f.remove(); $$('.t2-hl').forEach(function (e) { e.classList.remove('t2-hl'); }); var pr = $('#prompt'); if (pr) pr.classList.remove('t2hide'); }
function t2Final() { // end scoring, walked through with the real numbers
  if ($('#tutfin')) return; UI.finished = G; var A = swScore(G, 0), B = swScore(G, 1), line = function (nm, c) { return '<p><b>' + nm + ':</b> ' + c.btn + (c.btn === 1 ? ' button' : ' buttons') + (c.bonus ? ' + 7 bonus' : '') + ' − ' + c.empty + ' empty × 2 = <b>' + sgn(c.total) + '</b></p>'; };
  T2.seen.indexOf('end') < 0 && T2.seen.push('end');
  var ov = h('div#tutfin.ov'), c = h('div.card', { 'data-rule': 'end', 'data-step': 'score' });
  c.appendChild(h('div.t2n', TUT_RULES + '/' + TUT_RULES)); c.appendChild(h('h2', 'Score: buttons + 7 bonus − 2 per empty square.'));
  c.appendChild(h('div.t2sc', { html: line('You', A) + line('Marden', B) }));
  c.appendChild(h('p.t2sub', 'Most points wins. You know every rule now.'));
  c.appendChild(h('button.btn.go.t2-hl', { type: 'button', 'data-a': 't2real' }, 'Play a real game'));
  ov.appendChild(c); document.body.appendChild(ov); var b = $('#tutb'); if (b) b.remove();
}
function t2Real() {
  var pro = UI.prologue; t2Clear(); try { localStorage.setItem('sw_seen', '1'); if (typeof GXT !== 'undefined' && GXT.markDone) GXT.markDone(TUT_GAME); } catch (e) { }
  UI.prologue = false; if (pro && typeof GXC !== 'undefined') { G = null; UI.started = false; showStart(); GXC.open(); return; }
  UI.lvl = 'easy'; newGame('vs', { lvl: 'easy', first: 0 });
}
