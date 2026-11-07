// ui4: tutorial (GXT), story (GXC), help bulb (GXH), music slots (GXMUS), boot
var TUT_GAME = 'stitchwise', TUT_RING = [0, 2, 1, 4, 5, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.tutorial; }
function tutAct(x) { if (!tutOn()) return true; var ev = x.what === 'drop' || x.what === 'rot' || x.what === 'flip'; return GXT.act(Object.assign({ type: ev ? 'event' : 'tap' }, x)); }
function tq(sel) { return function () { return $(sel); }; }
function tutSteps() {
  var mine = function () { return G && !G.over && isHuman(swWho(G)) && !UI.busy; };
  var steps = [ // W381: 6 steps, each one real action (tap / drag / tap), ends inside a real game
    { id: 'pick', title: 'Buy a patch', say: 'Buttons are your money (you have 5). Tap the glowing long strip: it costs 3.', target: function () { return $$('#offers .offer')[2]; }, wait: { type: 'tap', match: function (a) { return a.what === 'offer' && a.k === 2; } }, wrong: 'Tap the long strip on the right.', ready: mine },
    { id: 'drag', title: 'Place it', say: 'Drag it onto your quilt, or tap a square. Empty squares cost 2 points at the end.', target: tq('#quilt'), wait: { type: 'event', match: function (a) { return a.what === 'drop' && a.valid; } }, ready: function () { return UI.sel === 2 && !!$('#ghost'); }, side: 'top' },
    { id: 'sew', title: 'Sew it on', say: 'Tap Sew it on. You pay 3 buttons and your token moves 3 spaces.', target: tq('[data-a=sew]'), wait: { type: 'tap', match: function (a) { return a.what === 'buy'; } }, ready: function () { var s = $('[data-a=sew]'); return !!s && !s.disabled; } },
    { id: 'opp', title: 'Marden\u2019s turn', say: 'Whoever is further back on the track plays next. Tap Next and watch Marden.', target: tq('#track'), wait: null, ready: function () { return G.owned[0].length === 1 && !UI.busy; }, ai: function () { UI.tutAi = true; schedule(); return new Promise(function (res) { (function lp() { if (!G || G.over || (isHuman(swWho(G)) && !UI.busy)) { UI.tutAi = false; return res(); } setTimeout(lp, 150); })(); }); } },
    { id: 'adv', title: 'Advance', say: 'Short on buttons? Tap Advance: jump just past Marden and take 1 button per space.', target: tq('[data-a=adv]'), wait: { type: 'tap', match: function (a) { return a.what === 'adv'; } }, ready: mine, wrong: 'Tap Advance.' },
    { id: 'end', title: 'Gold spots pay', say: 'Passing a gold spot pays the buttons on your patches. Most points when both reach the end wins.', target: tq('#track'), wait: null, ready: function () { return !UI.busy; } }
  ];
  var ST = ((window.CAMPAIGN || {}).story || {}).prologue; if (ST) steps.forEach(function (s) { var t = ST.steps[s.id]; if (t) { s.title = t[0]; s.say = t[1]; } });
  return steps;
}
function tutStart(o) {
  try { clearTimeout(toast.t); $('#toast').classList.remove('on'); } catch (e) { }
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null; var first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'), endTitle: o ? 'You know the rules' : (PRO().endTitle || 'You know the rules'), endText: o ? 'Buy, place, advance, gold spots. Now the Story begins.' : (PRO().endText || 'Buy, place, advance, gold spots. Finish this game against Marden.'),
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : [{ id: 'finish', label: (PRO().endButton || 'Finish this game') }, { id: 'title', label: 'Back to the title' }],
    setup: function () { try { GX.close(); } catch (e) { } $('#start').hidden = true; $('#rs').hidden = true; newGame('tutorial', { seed: 4242, ring: TUT_RING, first: 0 }); },
    onDone: function (r) { var c = r && r.choice; if (c === 'finish' && G && !G.over) { UI.tutorial = false; UI.tutAi = false; UI.lvl = 'easy'; UI.names[1] = 'Marden'; coachStart(); render(); saveGame(); schedule(); return; } tutLeave(); if (c === 'chapter' && first) { showStart(); GXC.play(first.id); } else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); } else showStart(); },
    onExit: function () { tutLeave(); showStart(); } });
}
function PRO() { return ((window.CAMPAIGN || {}).story || {}).prologue || {}; }
// ---------- coach: the rest of the tutorial game (chapters 2-4). Aunt Wren notices each rule the first time it happens; the player keeps playing for real.
function coachData() { return (window.CAMPAIGN || {}).story || {}; }
function coachStart() { UI.coach = { seen: {}, qk: {}, q: [], line: '', ch: 2, fresh: 0, shown: [] }; coachSay('start', null, true); }
function coachSay(key, vars, now) {
  var C = UI.coach; if (!C || C.seen[key] || C.qk[key]) return; var d = (coachData().coach || {})[key]; if (!d) return;
  var t = d[1].replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); C.qk[key] = 1; var it = { k: key, ch: d[0], t: t };
  if (now) { C.q.unshift(it); coachNext(); } else { C.q.push(it); if (!C.line || C.fresh <= 0) coachNext(); }
}
function coachNext() { var C = UI.coach; if (!C || !C.q.length) return; var n = C.q.shift(); C.seen[n.k] = 1; C.line = n.t; C.ch = n.ch; C.fresh = 2; C.shown.push(n.k); coachRender(); }
function coachRender() {
  var el = $('#guide'); if (!el) return; var C = UI.coach, txt = C && C.line ? C.line : UI.flavor || '';
  el.hidden = !txt || !G || G.over; if (el.hidden) return; el.innerHTML = '';
  var cast = ((window.CAMPAIGN || {}).cast || {}).wren || {}, chn = C ? (coachData().chapters || {})[C.ch] : '';
  el.appendChild(h('span.gface', { style: 'background:' + (C ? cast.color || '#3b7a8c' : '#a8432f'), 'aria-hidden': 'true' }, C ? (cast.emoji || '\u{1F9F5}') : '\u{1F380}'));
  el.appendChild(h('span.gtx', C ? h('b', (cast.name || 'Aunt Wren') + (chn ? ' \u00B7 Ch. ' + C.ch + ' ' + chn : '')) : null, h('span', txt)));
}
function coachCheck() { // after every move: what just happened for the first time?
  var C = UI.coach; if (!C || !G) return; C.fresh--;
  (G.ev || []).forEach(function (e) {
    if (e.k === 'move') SW.BTN_SPOTS.forEach(function (b) { if (b > e.from && b <= e.to) { if (e.s === 0) coachSay(G.inc[0] > 0 ? 'income_me' : 'income_zero', { n: G.inc[0] + ' button' + (G.inc[0] === 1 ? '' : 's') }); else coachSay('income_opp'); } });
    if (e.k === 'place' && e.pid === 100 && e.s === 1) coachSay('leather_opp');
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
function coachFinal(ban, w, A, B) { // the judging: the tutorial's climax line on the result banner
  var C = UI.coach; if (!C) return; var f = coachData().final || {}; C.seen.final = 1; C.shown.push('final');
  var t = A === B ? f.tie : w === 0 ? f.win : f.lose; if (G.bonus == null) { C.seen.bonus = 1; C.shown.push('bonus'); t += ' ' + (f.nobonus || ''); }
  ban.appendChild(h('div.rvt3.wren', t)); try { localStorage.setItem('sw_tutcov', JSON.stringify(Object.keys(C.seen))); } catch (e) { }
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
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: function () { return hlpPhase() || 'choose'; } });
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
  buildMenu(); buildRules(); buildPatchList(); bindQuilt(); campInit(); hlpInit(); musInit(); try { if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) GX.offline({ sw: '../sw.js', scope: '../' }); } catch (e) { }
  try { GNS.achievements('stitchwise', [{ id: 'win', name: 'First ribbon', how: 'Win a game.', test: function (r) { return r.won; } }, { id: 'tidy', name: 'Not a gap', how: 'Finish a game with at most 3 empty squares.', test: function (r, st, raw) { return r.won && raw && raw.scores && raw.scores[0] > 20; } }]); } catch (e) { }
  var rf = function () { if (G && UI.started) render(); }; try { var bk = ''; GX.onResize(function (w, hh) { var k = w + 'x' + hh; if (k !== bk && G && UI.started) { bk = k; render(); } }); } catch (e) { } if (typeof GXV !== 'undefined') GXV.watch(function () { rf(); }); else window.addEventListener('resize', rf);
  if (window.GXS && GXS.on) return; // scenarios build their own state
  var first = false; try { first = !localStorage.getItem('sw_seen'); localStorage.setItem('sw_seen', '1'); } catch (e) { }
  showStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
