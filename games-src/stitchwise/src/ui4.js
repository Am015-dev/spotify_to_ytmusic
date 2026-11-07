// ui4: tutorial (GXT), story (GXC), help bulb (GXH), music slots (GXMUS), boot
var TUT_GAME = 'stitchwise', TUT_RING = [0, 2, 1, 4, 5, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.tutorial; }
function tutAct(x) { if (!tutOn()) return true; var ev = x.what === 'drop' || x.what === 'rot' || x.what === 'flip'; return GXT.act(Object.assign({ type: ev ? 'event' : 'tap' }, x)); }
function tq(sel) { return function () { return $(sel); }; }
function tutSteps() {
  var mine = function () { return G && !G.over && isHuman(swWho(G)) && !UI.busy; };
  return [
    { id: 'board', title: 'Your quilt', say: 'This is your quilt: 9 by 9 squares. Every empty square costs you 2 points at the end.', target: tq('#quilt'), wait: null, ready: function () { return !!$('#quilt'); } },
    { id: 'buttons', title: 'Buttons', say: 'Buttons are your money and your score. You start with 5.', target: function () { return $('.pstrip:last-child') || $('.pstrip'); }, wait: null },
    { id: 'offers', title: 'Three patches', say: 'Each turn you may buy one of these three patches. The cost is the button number.', target: tq('#offers'), wait: null },
    { id: 'pick', title: 'Pick a patch', say: 'Tap the long strip: it costs 3 buttons and earns 1 button at every button spot.', target: function () { return $$('#offers .offer')[2]; }, wait: { type: 'tap', match: function (a) { return a.what === 'offer' && a.k === 2; } }, wrong: 'Tap the long strip on the right.', ready: mine },
    { id: 'drag', title: 'Place it', say: 'Drag it onto your quilt, or tap a square. It snaps to the grid. Try the Rotate button too.', target: tq('#quilt'), wait: { type: 'event', match: function (a) { return a.what === 'drop' && a.valid; } }, ready: function () { return UI.sel === 2 && !!$('#ghost'); }, side: 'top' },
    { id: 'sew', title: 'Sew it on', say: 'Happy with the spot? Tap Sew it on. You pay 3 buttons.', target: tq('[data-a=sew]'), wait: { type: 'tap', match: function (a) { return a.what === 'buy'; } }, ready: function () { var s = $('[data-a=sew]'); return !!s && !s.disabled; } },
    { id: 'time', title: 'Time passes', say: 'Sewing costs time: your token moved 3 spaces. Whoever is further back on the track plays next.', target: tq('#track'), wait: null, ready: function () { return G.owned[0].length === 1 && !UI.busy; } },
    { id: 'opp', title: 'Their turn', say: 'Marden plays now. Watch the track, then it is your turn again.', target: tq('#track'), wait: null, ai: function () { UI.tutAi = true; schedule(); return new Promise(function (res) { (function lp() { if (!G || G.over || (isHuman(swWho(G)) && !UI.busy)) { UI.tutAi = false; return res(); } setTimeout(lp, 150); })(); }); } },
    { id: 'adv', title: 'Advance', say: 'Short on buttons? Advance: your token jumps just past theirs and you take 1 button per space.', target: tq('[data-a=adv]'), wait: { type: 'tap', match: function (a) { return a.what === 'adv'; } }, ready: mine, wrong: 'Tap Advance.' },
    { id: 'income', title: 'Button spots', say: 'The gold spots on the track pay you the buttons printed on your patches. Pass one to collect.', target: tq('#track'), wait: null, ready: function () { return !UI.busy; } },
    { id: 'leather', title: 'Leather patches', say: 'The brown spots hold free 1 by 1 leather patches. Pass one first and you sew it on at once.', target: tq('#track'), wait: null },
    { id: 'bonus', title: 'The 7 by 7 bonus', say: 'Fill a full 7 by 7 block on your quilt before your rival and you earn 7 bonus points.', target: tq('#quilt'), wait: null },
    { id: 'end', title: 'Ready to stitch', say: 'When both tokens reach the end, buttons minus 2 per empty square decides it. Go win a fair!', target: tq('#track'), wait: null }
  ];
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null; var first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'), endTitle: 'You know the rules', endText: o ? 'Buy, place, advance, button spots. Now the Story begins.' : 'Buy, place, advance, button spots. The lightbulb explains anything new.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: function () { try { GX.close(); } catch (e) { } $('#start').hidden = true; $('#rs').hidden = true; newGame('tutorial', { seed: 4242, ring: TUT_RING, first: 0 }); },
    onDone: function (r) { tutLeave(); var c = r && r.choice; if (c === 'chapter' && first) { showStart(); GXC.play(first.id); } else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); } else showStart(); },
    onExit: function () { tutLeave(); showStart(); } });
}
function tutLeave() { UI.seq++; clearTimeout(UI.tm.ai); UI.tutorial = false; UI.tutAi = false; UI.started = false; UI.busy = 0; UI.sel = -1; try { GXH.hide(); } catch (e) { } G = null; $$('.flt,.coin').forEach(function (e) { e.remove(); }); }
// ---------- story
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else GXC.open(); }
function campLine() { try { if (typeof GXC === 'undefined' || !window.CAMPAIGN) return ''; var p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(function (c) { return p.ch[c.id] && p.ch[c.id].beaten; }).length; return n ? n + ' of ' + ch.length + ' stages done' : ''; } catch (e) { return ''; } }
function campStart(def) {
  var op = def.opponent || {}; $('#start').hidden = true; UI.lvl = op.aiLevel || 'normal'; var g = newGame('story', { camp: def, lvl: UI.lvl, seed: def.setup && def.setup.seed != null ? def.setup.seed : null, first: 0 });
  later(400, function () { toast('Goal: ' + def.goal.text + (def.twist ? ' ' + def.twist.text : ''), 4200); }); return g;
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({ game: 'stitchwise', data: window.CAMPAIGN,
    portrait: function (who, size, c) { var stem = c && c.portrait ? c.portrait.replace(/\.webp$/, '') : null; if (stem && artHas(stem)) { var i = artImg(stem); if (i) { i.style.width = i.style.height = size + 'px'; i.style.borderRadius = '50%'; i.style.objectFit = 'cover'; return i; } } return null; },
    headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', function () { GXC.close(); tutStart(); }); return [b]; },
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
  GXH.init({ game: 'stitchwise', defaultOn: true, avoid: '.offer,#acts button,#quilt',
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
  buildMenu(); buildRules(); buildPatchList(); bindQuilt(); campInit(); hlpInit(); musInit(); try { if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) GX.offline({ sw: '../sw.js', scope: '../' }); } catch (e) { }
  try { GNS.achievements('stitchwise', [{ id: 'win', name: 'First ribbon', how: 'Win a game.', test: function (r) { return r.won; } }, { id: 'tidy', name: 'Not a gap', how: 'Finish a game with at most 3 empty squares.', test: function (r, st, raw) { return r.won && raw && raw.scores && raw.scores[0] > 20; } }]); } catch (e) { }
  var rf = function () { if (G && UI.started) render(); }; try { var bk = ''; GX.onResize(function (w, hh) { var k = w + 'x' + hh; if (k !== bk && G && UI.started) { bk = k; render(); } }); } catch (e) { } if (typeof GXV !== 'undefined') GXV.watch(function () { rf(); }); else window.addEventListener('resize', rf);
  if (window.GXS && GXS.on) return; // scenarios build their own state
  var first = false; try { first = !localStorage.getItem('sw_seen'); localStorage.setItem('sw_seen', '1'); } catch (e) { }
  showStart(); if (first && typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) setTimeout(function () { if (!UI.started && !GXT.active() && !$('#start').hidden) { try { GXT.menuHTML; } catch (e) { } toast('New here? Tap the Tutorial button to learn in 3 minutes.', 4500); } }, 700);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
