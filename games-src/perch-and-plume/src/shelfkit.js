// ===================== part 4: sound (synth + music slots), help kit, story (campaign), boot =====================
var SND = { on: true, ctx: null };
try { SND.on = localStorage.getItem('pp-snd') !== '0'; } catch (e) { }
function sfx(k) {
  if (!SND.on || (window.GXS && GXS.on)) return;
  try {
    var C = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume();
    var t = C.currentTime, o = C.createOscillator(), g = C.createGain(), v = 0.06;
    var P = { tap: [660, 700, .05], act: [392, 523, .12], chirp: [1800, 2600, .09], pink: [1400, 1000, .12], play: [523, 784, .18], egg: [880, 990, .07], dice: [220, 180, .1], goal: [523, 1046, .3], end: [392, 784, .5] }[k] || [600, 600, .05];
    o.type = k === 'chirp' || k === 'pink' ? 'sine' : 'triangle'; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[1], t + P[2]);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + P[2] + .05);
    o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + P[2] + .08);
    if (k === 'chirp') { var o2 = C.createOscillator(), g2 = C.createGain(); o2.frequency.setValueAtTime(2400, t + .1); o2.frequency.exponentialRampToValueAtTime(3000, t + .17); g2.gain.setValueAtTime(v * .8, t + .1); g2.gain.exponentialRampToValueAtTime(0.0001, t + .22); o2.connect(g2); g2.connect(C.destination); o2.start(t + .1); o2.stop(t + .25); }
  } catch (e) { }
}
// music: games/perch-and-plume/music/<slot>-a|b.mp3; the build lists the files present (PP_MUSIC), silent until they exist
var MUS_SLOTS = [['menu', 'Title'], ['main', 'Game'], ['fight', 'Boss'], ['victory', 'Victory'], ['defeat', 'Defeat']], MUS_ON = false;
function musicInit() {
  var files = window.PP_MUSIC || []; if (!files.length || !window.GA || !window.GXMUS) return;
  var m = {}; files.forEach(function (f) { m[f.replace(/\.mp3$/, '')] = 'url:music/' + f; });
  try { GA.init({ key: 'pp', music: m }); if (GX.applyPrefs) GX.applyPrefs(); } catch (e) { return; }
  try { GXMUS.init({ key: 'pp', slots: MUS_SLOTS, loops: ['menu', 'main', 'fight'], slot: musicSlot, on: function () { return SND.on; } }); MUS_ON = true; } catch (e) { }
}
function musicSlot() {
  if (!G || !$('#title').hidden) return ['menu', 0];
  if (G.phase === 'over') { var w = Array.isArray(G.winner) ? G.winner : [G.winner]; return [w.some(isHuman) ? 'victory' : 'defeat', 1]; }
  return [UI.camp && UI.camp.boss ? 'fight' : 'main', 0];
}
function musicSync() { if (MUS_ON) try { GXMUS.sync(); } catch (e) { } }
// ---------------- help kit: first-time bubbles per phase + the hint bulb (from the computer's own choice)
function helpPhase() {
  if (!G || !myTurn() || (typeof tutOn === 'function' && tutOn())) return null;
  if (panelUp()) return null;   // never over a drawer, the story map or a full-screen panel
  var Q = G.q; if (UI.sel != null && !Q) return 'play';
  if (!Q) return 'act'; return { die: 'die', egg: 'egg', draw: 'draw', bonus: 'bonus', pwTuck: 'power', pwTrade: 'power', play2: 'play', bonusPick: null }[Q.h] || null;
}
function panelUp() { var m = document.querySelector('.gxc'); return !!((window.GX && GX.open) || (m && !m.hidden) || !$('#title').hidden || !$('#setup').hidden || !$('#result').hidden || !$('#pass').hidden || !$('#pop').hidden); }
function hideHelp() { try { if (window.GXH) GXH.hide(); } catch (e) { } }
function moveTarget(m) {
  if (!m) return null;
  if (m.t === 'act') return $('.ract[data-h="' + ['food', 'eggs', 'cards'].indexOf(m.a) + '"]');
  if (m.t === 'play') return UI.sel === m.i ? $('.row[data-h="' + m.h + '"] .slot.next') : $('#hand .bc[data-i="' + m.i + '"]');
  if (m.t === 'die') return $('.die[data-i="' + m.i + '"]');
  if (m.t === 'egg' || m.t === 'trade') return $('.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]');
  if (m.t === 'tray') return $('.bc[data-a="tray"][data-i="' + m.i + '"]');
  if (m.t === 'deck') return $('#deckb');
  if (m.t === 'tuck') return $('#hand .bc[data-i="' + m.i + '"]');
  return $('#acts .btn');
}
function helpInit() {
  if (!window.GXH) return;
  try {
    GXH.init({ game: 'perch-and-plume', defaultOn: false, avoid: '.glow,#acts .btn,#feeder,#tray',
      steps: {
        act: { target: function () { return $('.ract[data-h="0"]'); }, title: 'One action a turn', text: 'Use a habitat row, or play a bird from your hand.' },
        play: { target: function () { return $('.slot.next.glow') || $('#mat'); }, title: 'Place your bird', text: 'A bird goes in the leftmost free space. Spaces further right cost eggs.' },
        die: { target: function () { return $('#feeder'); }, title: 'The birdfeeder', text: 'Each die is one food. An empty feeder rolls all five dice again.' },
        egg: { target: function () { return $('.bc[data-a="bird"].glow') || $('#mat'); }, title: 'Lay eggs', text: 'Each egg is a point. A bird holds only as many eggs as its nest shows.' },
        draw: { target: function () { return $('#tray'); }, title: 'Draw birds', text: 'The tray shows three birds; the deck is a surprise.' },
        bonus: { target: function () { return $('#acts'); }, title: 'A trade', text: 'This space offers a trade for one more. Yes or no thanks.' },
        power: { target: function () { return $('.bc.firing') || $('#hand'); }, title: 'A bird power', text: 'This bird asks for a decision. Skip is always allowed.' }
      },
      rules: RULES.map(function (r) { return { title: r[0], text: r[1].split('. ')[0].slice(0, 120) + '.' }; }).slice(0, 4)
        .concat([{ phase: 'act', title: 'Rows grow', text: 'More birds in a row means a bigger action, and every brown power in it fires.' },
          { phase: 'play', title: 'Paying for birds', text: 'Pay the food shown. Any two food can stand in for one.' },
          { phase: 'die', title: 'Food dice', text: 'The food your birds in hand need is the best food.' },
          { phase: 'egg', title: 'Nests', text: 'Each bird holds as many eggs as its nest shows.' },
          { phase: 'draw', title: 'The tray', text: 'The tray refills at the end of your turn.' }]) });
    GXH.bulb({ el: '#bulbbtn', rulesFor: function () { return helpPhase() || 'act'; },
      suggest: function () { if (!myTurn()) return null; var m = PPAI.choose(G, UI.view, 'hard'); if (!m) return null; var el = moveTarget(m); if (!el) return null; return { target: function () { return moveTarget(m); }, why: PPAI.why(G, UI.view, m) }; } });
  } catch (e) { }
}
// ---------------- story (shell/gx-campaign.js)
var CAST_FACE = { ottilie: 'ottilie', pip: 'pip', mags: 'mags', tobias: 'tobias', corvin: 'corvin', delphine: 'delphine', barnaby: 'barnaby', you: 'you' };
function campStart(def) {
  var su = def.setup || {}, op = def.opponent, seats = [{ name: 'You', kind: 'human', face: 'you' }];
  if (su.solo) seats.push({ name: op.name, kind: 'automa', lvl: op.aiLevel, face: op.cast });
  else seats.push({ name: op.name, kind: 'ai', lvl: op.aiLevel, face: op.cast });
  (su.extra || []).forEach(function (x) { seats.push({ name: x.name, kind: 'ai', lvl: def.easy ? 'easy' : (x.lvl || op.aiLevel), face: x.face }); });
  UI.hints = def.hints !== false;
  startGame({ seats: seats, mode: 'campaign', camp: def, twist: def.twist || null, seed: su.seed == null ? undefined : su.seed });
  if (def.twist) setTimeout(function () { if (G && G.phase !== 'over' && $('#setup').hidden) toast(def.twist.text, 3600); }, 1500);   // the goal itself lives in the live tracker and on the starting-hand screen
}
function campMetrics(g) {
  var me = g.final ? g.final[0] : PP.scoreOf(g, 0), best = 0; g.pl.forEach(function (p, i) { if (i) best = Math.max(best, (g.final ? g.final[i] : PP.scoreOf(g, i)).total); });
  return { won: g.winner === 0, score: me.total, margin: me.total - best, eggs: me.eggs, birds: PP.birds(g.pl[0]).length, forest: g.pl[0].board[0].length, goals: me.goals, bonus: me.bonus };
}
function campIsWon(g, def) {
  var m = campMetrics(g), gl = def.goal || {};
  if (gl.type === 'score') return m.score >= gl.value && (gl.winNotNeeded || m.won);
  if (gl.type === 'margin') return m.won && m.margin >= gl.value;
  if (gl.type === 'custom' && gl.k) return m[gl.k] >= gl.value && (gl.winNotNeeded || m.won);
  return m.won;
}
function campInit() {
  if (!window.GXC || !window.CAMPAIGN) return;
  try {
    GXC.init({ game: 'perch-and-plume', data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
      portrait: function (who, size, c) { var f = CAST_FACE[who] || (c && CAST_FACE[c.cast]); if (!f) return null; var st = 'portrait-' + f; if (ART.have[st]) return 'media/' + st + '.webp'; var d = document.createElement('span'); d.className = 'art ph'; d.style.cssText = 'display:block;width:100%;height:100%'; d.innerHTML = placeholder(st); return d; },
      headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', function () { GXC.close(); tutStart(); }); return [b]; },
      onExit: function () { if (G && G.phase !== 'over' && UI.mode !== 'tutorial' && $('#title').hidden) { render(); return; } UI.camp = null; showTitle(); },   // opened from a running game's Menu: Back returns to that game
      scores: function (g) { return (g.final || g.pl.map(function (p, i) { return PP.scoreOf(g, i); })).map(function (s) { return s.total; }); },
      seats: function (g) { return g.pl.map(function (p, i) { return { name: p.name, me: i === 0, ai: p.kind !== 'human' ? p.lvl : undefined }; }); } });
  } catch (e) { }
}
// ---------------- boot
function boot() {
  try { GX.init({ key: 'pp' }); } catch (e) { }
  bootDrawers(); campInit(); helpInit(); musicInit();
  try { var go = GXC.open; GXC.open = function () { hideHelp(); return go.apply(this, arguments); }; } catch (e) { }
  try { var gs = GX.show; GX.show = function () { hideHelp(); return gs.apply(this, arguments); }; } catch (e) { }
  try { if (GX.onResize) GX.onResize(function () { if (G) render(); }); } catch (e) { }
  try { if (window.GNS && GNS.achievements) GNS.achievements('perch-and-plume', [
    { id: 'win', name: 'Field champion', how: 'Win a game against the computer.', test: function (r) { return r.won && r.mode === 'vs'; } },
    { id: 'eighty', name: 'Teeming aviary', how: 'Score 80 or more.', test: function (r) { return r.score >= 80; } },
    { id: 'story', name: 'A year well spent', how: 'Win a story chapter.', test: function (r) { return r.won && r.mode === 'campaign'; } }]); } catch (e) { }
  if (window.GXS && GXS.on) { if (GXS.id === 'menu' && GXS.boardOpen) GXS.boardOpen(); return; }   // a ?scn= scenario builds its own state; the shelf's menu check opens panels over a running game, as in real play
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var pp = $('#pop'); if (pp && !pp.hidden) { pp.hidden = true; e.preventDefault(); } } });
  showTitle();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
