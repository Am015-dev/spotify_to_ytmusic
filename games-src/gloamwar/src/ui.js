/* Gloamwar page: board-first. Tap a die, pick what it does, then tap the glowing place on the map. The rival's moves play out one at a time. */
var G = null, AIDELAY = 700, ANIM = true;
var UI = { side: 'D', level: 'normal', die: null, src: null, split: 0, hold: false, timer: null, fast: /[?&]fast=1/.test(location.search), mode: 'quick', busy: false, lastEv: [] };
if (UI.fast) AIDELAY = 40;
var $ = function (s) { return document.querySelector(s); };
function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function ico(name, fill, size) { return '<svg viewBox="0 0 512 512" width="' + (size || 22) + '" height="' + (size || 22) + '" aria-hidden="true"><path d="' + ICONS[name] + '" fill="' + (fill || 'currentColor') + '"/></svg>'; }
var FACE_ICON = { C: 'char', A: 'army', M: 'muster', X: 'helm', E: 'raven', W: 'will', Y: 'eye' };
function sideName(s) { return s === 'D' ? 'Dawn' : 'Gloam'; }
function rn(rid) { return REG[rid] ? REG[rid].n : rid; }
// ---------------------------------------------------------------- sound (synth, short)
var SND = { on: ls('gw-snd') !== false, ctx: null };
function sfx(k) {
  if (!SND.on || UI.fast) return; try { var C = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()); var t = C.currentTime;
    var seq = { tap: [[300, .03, 'triangle']], move: [[180, .08, 'triangle'], [240, .06, 'triangle']], drum: [[90, .16, 'sine'], [70, .2, 'sine']], hit: [[140, .12, 'sawtooth']], win: [[392, .12, 'triangle'], [523, .14, 'triangle'], [659, .3, 'triangle']], lose: [[220, .3, 'sine'], [165, .45, 'sine']], hunt: [[880, .05, 'sine'], [660, .12, 'sine']], card: [[520, .05, 'triangle'], [700, .06, 'triangle']] }[k] || [[440, .05, 'triangle']];
    seq.forEach(function (n, i) { var o = C.createOscillator(), g = C.createGain(); o.type = n[2]; o.frequency.value = n[0]; o.connect(g); g.connect(C.destination); var s = t + i * .08; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(.16, s + .01); g.gain.exponentialRampToValueAtTime(.0001, s + n[1] + .06); o.start(s); o.stop(s + n[1] + .08); });
  } catch (e) { }
}
function buzz(ms) { try { if (window.GX && GX.buzz) GX.buzz(ms || 12); } catch (e) { } }
// ---------------------------------------------------------------- start
function startGame(o) {
  o = o || {}; clearTimeout(UI.timer);
  if (o.mode !== 'tut') { try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } }
  UI.side = o.side || UI.side || 'D'; UI.level = o.level || UI.level || 'normal'; UI.mode = o.mode || 'quick'; UI.die = null; UI.src = null; UI.hold = false; UI.ended = false;
  AI.s = (o.seed || Date.now()) & 0xffff;
  G = newGame({ seed: o.seed || (Date.now() & 0x7fffffff), deal: o.deal });
  if (o.dice) G.flags.forceDice = o.dice;
  ['title', 'res'].forEach(function (id) { $('#' + id).classList.remove('on'); }); document.body.classList.remove('scr-on'); closeSheet(); battleClose();
  ls('gw-side', UI.side);
  MV.fit(); MV.focus(UI.side === 'D' ? 'lanternvale' : 'blackgate', MV.k0, false);
  render();
  if (UI.mode !== 'tut' && !UI.fast && !o.noGoal) { goalCard(function () { later(step, 200); }); return; }
  later(step, UI.fast ? 20 : 400);
}
function goalCard(done) {
  var d = UI.side === 'D', el = $('#battle');
  el.innerHTML = '<h3>' + (d ? 'You lead the Dawn League' : 'You command the Gloam') + '</h3><p class="bnote">' + (d ? 'Walk the lantern to the Kiln, the red mountain.' : 'Hunt the lantern until its taint reaches 12.') + '</p><p class="bnote">' + (d ? 'Or take 4 points of Gloam strongholds.' : 'Or take 10 points of Dawn cities and strongholds.') + '</p><p class="bnote">Each turn: tap a die, then pick an action.</p><div class="row" style="justify-content:center"><button class="btn pri big" type="button" id="goalGo">Start</button></div>';
  el.classList.add('on'); $('#goalGo').onclick = function () { el.classList.remove('on'); done(); };
}
function later(f, ms) { clearTimeout(UI.timer); UI.timer = setTimeout(f, ms); }
function human(s) { return s === UI.side; }
// ---------------------------------------------------------------- driver
function step() {
  if (!G) return;
  if (G.win) { render(); later(showResult, UI.fast ? 30 : 1100); return; }
  var s = sideToAct(G);
  if (!human(s)) { UI.hold = true; render(); later(aiStep, AIDELAY); return; }
  UI.hold = false;
  // auto-skip moves with no real choice
  var ms = validMoves(G);
  if (ms.length === 1 && G.pend && ['damage', 'battle'].indexOf(G.pend.h) < 0) { apply(ms[0]); return; }
  render();
  try { if (window.GXH && UI.mode !== 'tut' && !(window.GXT && GXT.active())) GXH.phase(phaseId()); } catch (e) { }
}
function aiStep() {
  if (!G || G.win) { step(); return; }
  var s = sideToAct(G); if (human(s)) { step(); return; }
  var m = AI.move(G, UI.level);
  if (!m) { console.warn('AI has no move'); return; }
  apply(m, true);
}
function apply(m, byAI) {
  var before = G.pend && G.pend.h;
  try { performMove(G, m); } catch (e) { console.error(e, m); }
  var evs = G.ev.slice(); G.ev = [];
  UI.die = null; UI.src = null; UI.split = 0; UI.sub = null; UI.asFace = null;
  try { if (window.GXT && GXT.active()) GXT.act({ type: 'event', what: 'move', m: m }); } catch (e) { }
  var wait = playEvents(evs, byAI);
  render();
  later(step, UI.fast ? 20 : Math.max(byAI ? AIDELAY : 120, wait));
}
function playEvents(evs, byAI) {
  var wait = 0, said = null;
  evs.forEach(function (e) {
    switch (e.k) {
      case 'move': MV.flash(e.to); sfx('move'); if (byAI && !MV.seen(e.to)) MV.focus(e.to); said = said || sideName(e.s) + ' marches to ' + rn(e.to); wait = Math.max(wait, 650); break;
      case 'capture': toast(sideName(e.s) + ' takes ' + rn(e.rid) + '!', e.s === 'G'); MV.flash(e.rid); sfx('drum'); buzz(30); wait = Math.max(wait, 1100); break;
      case 'battle': sfx('drum'); if (!MV.seen(e.to)) MV.focus(e.to); break;
      case 'round': showRound(e); wait = Math.max(wait, 1300); break;
      case 'hunt': if (e.rolls.length) { said = 'Hunt: ' + e.rolls.join(' ') + (e.hits ? ' — found!' : ' — missed'); sfx('hunt'); wait = Math.max(wait, 900); } break;
      case 'tile': toast('Hunt tile: ' + tileName(e.t) + (e.dmg > 0 ? ' · ' + e.dmg + ' taint' : ''), true); wait = Math.max(wait, 1200); break;
      case 'reveal': toast('The Company is revealed!', true); break;
      case 'card': if (e.s !== UI.side) { toast(sideName(e.s) + ' plays ' + CARD[e.c].n, e.s === 'G'); wait = Math.max(wait, 1300); } sfx('card'); break;
      case 'recruit': MV.flash(e.rid); said = said || NATIONS[e.nat].short + ' musters at ' + rn(e.rid); wait = Math.max(wait, 500); break;
      case 'pol': said = said || NATIONS[e.n].n + ': ' + polText(G, e.n); wait = Math.max(wait, 600); break;
      case 'company': MV.flash(e.rid); break;
      case 'death': toast(CHARS[e.c].short + ' falls', CHARS[e.c].side !== 'G'); wait = Math.max(wait, 1000); break;
      case 'char': toast(CHARS[e.c].short + ' joins the ' + (CHARS[e.c].side === 'G' ? 'Gloam' : 'Dawn') + ': +1 die', CHARS[e.c].side === 'G'); MV.flash(e.rid); wait = Math.max(wait, 1100); break;
      case 'rider': MV.flash(e.to); said = said || 'A Gloamrider flies to ' + rn(e.to); wait = Math.max(wait, 450); break;
      case 'road': toast('The Company reaches the Ashen Road', false); break;
      case 'roll': said = 'New dice rolled'; break;
    }
  });
  if (said) UI.say = said;
  return UI.fast ? 20 : wait;
}
function toast(t, red) { var e = $('#toast'); e.textContent = t; e.className = 'on' + (red ? ' g' : ''); clearTimeout(UI.tt); UI.tt = setTimeout(function () { e.className = ''; }, UI.fast ? 50 : 1600); }
function phaseId() { if (!G) return null; if (G.pend) return G.pend.h; return G.phase; }
// ---------------------------------------------------------------- render
function render() {
  if (!G) return;
$('#vD').textContent = vpOf(G, 'D') + '/' + VPWIN.D; $('#vG').textContent = vpOf(G, 'G') + '/' + VPWIN.G;
  $('#vT').textContent = G.F.taint + '/12';
  var s = sideToAct(G), me = UI.side, ms = human(s) && !UI.hold ? validMoves(G) : [];
  var hl = { regions: [], tokens: [] };
  var acts = [], msg = '';
  if (!human(s) || UI.hold) {
    msg = '<span class="who">' + sideName(s) + '</span> is thinking…';
    if (UI.say) msg = '<span class="who">' + UI.say + '</span>';
  } else if (G.pend) { var r = pendUI(ms, hl, acts); msg = r; }
  else if (G.phase === 'company') msg = companyUI(ms, hl, acts);
  else if (G.phase === 'hunt') msg = huntUI(ms, acts);
  else if (G.phase === 'act') msg = actUI(ms, hl, acts);
  if (G.win) msg = G.win.side === me ? 'Victory!' : 'Defeat';
  $('#msg').innerHTML = '<span id="vturn">T' + G.turn + '</span>' + msg;
  renderDice(ms); renderActs(acts); renderTabs(ms);
  MV.render(G, hl, me);
  if (G.pend && G.pend.h === 'battle') battleRender(ms); else if (!UI.roundShow) battleClose();
  if (UI.sheet) refreshSheet();
}
function renderDice(ms) {
  var me = UI.side, them = other(me), d = $('#mydice'); d.innerHTML = '';
  (G.dice[me] || []).forEach(function (f, i) {
    var used = G.used[me][i], can = !used && G.phase === 'act' && !G.pend && human(sideToAct(G)) && !UI.hold;
    var b = mk('button', 'die' + (me === 'G' ? ' g' : '') + (used ? ' used' : '') + (can ? ' can' : '') + (UI.die === i ? ' sel' : ''), ico(FACE_ICON[f], me === 'G' ? '#f3e2be' : '#1f1812', 34));
    b.type = 'button'; b.setAttribute('aria-label', FACE_NAME[f] + ' die'); b.dataset.i = i; b.dataset.f = f;
    b.onclick = function () { if (!can) { toast(used ? 'That die is used' : 'Wait for your turn'); return; } if (!tutOk({ type: 'tap', what: 'die', f: f, i: i })) return; sfx('tap'); UI.die = UI.die === i ? null : i; UI.src = null; UI.sub = null; UI.asFace = null; render(); };
    d.appendChild(b);
  });
  var r = $('#rdice'); r.innerHTML = '';
  (G.dice[them] || []).forEach(function (f, i) { var e = mk('span', 'die mini' + (them === 'G' ? ' g' : '') + (G.used[them][i] ? ' used' : ''), ico(FACE_ICON[f], them === 'G' ? '#f3e2be' : '#1f1812', 21)); e.title = 'Rival die: ' + FACE_NAME[f]; r.appendChild(e); });
  $('#hunt').innerHTML = ico('eye', '#9a2117', 20) + '<span>Hunt ' + G.hb.g + (G.hb.d ? ' +' + G.hb.d : '') + '</span>'; $('#rlab').textContent = sideName(them) + ' dice';
}
function renderActs(acts) {
  var a = $('#acts'); a.innerHTML = '';
  acts.forEach(function (x) { var b = mk('button', 'act' + (x.cls ? ' ' + x.cls : ''), '<b>' + x.t + '</b>' + (x.s ? '<small>' + x.s + '</small>' : '')); b.type = 'button'; if (x.id) b.id = x.id; if (x.dis) b.disabled = true; b.dataset.key = x.key || ''; b.onclick = function () { if (!tutOk({ type: 'tap', what: 'act', key: x.key })) return; sfx('tap'); x.f(); }; a.appendChild(b); });
}
function renderTabs(ms) {
  var n = G.hand[UI.side].length, canPlay = ms.some(function (m) { return m.a === 'card' && (UI.die == null || m.i === UI.die); });
  $('#tCards').innerHTML = ico('event', '#1f1812', 20) + 'Cards <em>' + n + '</em>';
  $('#tNat').innerHTML = ico('watch', '#1f1812', 20) + 'Nations';
  $('#tComp').innerHTML = ico('lantern', '#1f1812', 20) + 'Company';
}
function tutOk(a) { try { if (window.GXT && GXT.active()) return GXT.act(a); } catch (e) { } return true; }
// ---------------------------------------------------------------- phase UIs (return the one-line message)
function companyUI(ms, hl, acts) {
  var decl = ms.filter(function (m) { return m.t === 'declare'; });
  decl.forEach(function (m) { hl.regions.push(m.to); });
  UI.tap = function (kind, rid) { var m = decl.filter(function (x) { return x.to === rid; })[0]; if (m) { if (!tutOk({ type: 'tap', what: 'declare', rid: rid })) return; apply(m); return true; } };
  acts.push({ t: 'Stay hidden', s: 'move it later with dice', cls: 'pri', key: 'cdone', f: function () { apply({ t: 'cdone' }); } });
  ms.filter(function (m) { return m.t === 'road'; }).forEach(function () { acts.push({ t: 'Ashen Road', s: 'start the last 5 steps', cls: 'red', key: 'road', f: function () { apply({ t: 'road' }); } }); });
  ms.filter(function (m) { return m.t === 'guide'; }).forEach(function (m) { acts.push({ t: CHARS[m.c].short + ' guides', s: 'change the guide', key: 'guide', f: function () { apply(m); } }); });
  return decl.length ? 'Declare: tap a glow, or stay hidden' : 'Company phase';
}
function huntUI(ms, acts) {
  ms.forEach(function (m) { acts.push({ t: m.n + (m.n === 1 ? ' die' : ' dice'), s: m.n ? 'to the Hunt' : 'no hunt', cls: m.n === 2 ? 'pri' : '', key: 'hunt' + m.n, f: function () { apply(m); } }); });
  return 'Send dice to hunt the Company';
}
var ACT_LABEL = { cmove: ['Move Company', ''], chide: ['Hide Company', 'it can move again'], csep: ['Leave Company', 'a hero sets out'], charmove: ['Move heroes', 'companions on the map'], nzmove: ['Fly riders', 'Gloamriders anywhere'],
  lmove: ['Lead army', 'an army with a leader'], lattack: ['Lead attack', 'an army with a leader'], amove: ['Move armies', 'up to 2 armies'], attack: ['Attack', 'one army fights'], sortie: ['Sally out', 'besieged army attacks'],
  recruit: ['Muster', 'new troops'], draw: ['Draw card', ''], card: ['Play card', ''], skip: ['Set aside', 'waste this die'] };
function actUI(ms, hl, acts) {
  var me = UI.side, F = G.F;
  if (UI.die == null) {
    G.dice[me].forEach(function (f, i) { if (!G.used[me][i]) hl.dice = 1; });
    ms.filter(function (m) { return m.t === 'pass'; }).forEach(function (m) { acts.push({ t: 'Pass', s: 'rival acts first', key: 'pass', f: function () { apply(m); } }); });
    if (ms.some(function (m) { return m.t === 'lamp'; })) acts.push({ t: me === 'D' ? 'Lamp of Dawn' : 'Shuttered Lamp', s: 'change one die', key: 'lamp', f: function () { lampPick(ms); } });
    UI.tap = function (kind, rid) { return false; };
    return 'Your turn: tap a die';
  }
  var dms = ms.filter(function (m) { return m.t === 'die' && m.i === UI.die; }), f = G.dice[me][UI.die];
  // group by action
  var seen = {};
  if (UI.src && UI.src.kind === 'attackFrom') {   // choose which army attacks
    var am = dms.filter(function (m) { return m.a === UI.src.a; });
    am.forEach(function (m) { hl.tokens.push(tokId(m.from)); hl.regions.push(m.from); });
    UI.tap = function (kind, rid) { var m = am.filter(function (x) { return x.from === rid; })[0]; if (m) { apply(m); return true; } };
    acts.push({ t: 'Back', key: 'back', f: function () { UI.src = null; render(); } });
    return 'Tap the ringed army';
  }
  // the Will of the Dawn: first pick which face it becomes (or a hero)
  if (f === 'W' && !UI.asFace) {
    var faces = {}; dms.forEach(function (m) { if (m.as) faces[m.as] = 1; });
    [['C', 'Character', 'the Company'], ['A', 'Army', 'march, fight'], ['M', 'Muster', 'troops, nations'], ['E', 'Event', 'cards']].forEach(function (x) { if (faces[x[0]]) acts.push({ t: x[1], s: x[2], key: 'as-' + x[0], cls: x[0] === 'C' ? 'pri' : '', f: function () { UI.asFace = x[0]; render(); } }); });
    dms.filter(function (m) { return m.a === 'hero'; }).forEach(function (m) { acts.push({ t: CHARS[m.c].short, s: 'rises at ' + rn(m.to), cls: 'red', key: 'hero-' + m.c, f: function () { apply(m); } }); });
    dms.filter(function (m) { return m.a === 'skip'; }).slice(0, 1).forEach(function (m) { acts.push({ t: 'Set aside', s: 'waste this die', key: 'skip', f: function () { apply(m); } }); });
    return 'Will of the Dawn: use it as…';
  }
  if (f === 'W') { dms = dms.filter(function (m) { return m.as === UI.asFace; }); }
  if (UI.sub === 'dip' || UI.sub === 'draw') {
    dms.filter(function (m) { return m.a === UI.sub; }).forEach(function (m) {
      if (m.a === 'dip') acts.push({ t: NATIONS[m.n].short, s: polText(G, m.n) + ' → ' + (G.pol[m.n].s - 1 === 0 ? 'war' : (G.pol[m.n].s - 1) + ' away'), key: 'dip-' + m.n, f: function () { apply(m); } });
      else acts.push({ t: m.d[1] === 'C' ? 'Character deck' : 'Strategy deck', s: G.deck[m.d].length + ' cards left', key: 'draw-' + m.d, f: function () { apply(m); } });
    });
    acts.push({ t: 'Back', key: 'back', f: function () { UI.sub = null; render(); } });
    return UI.sub === 'dip' ? 'Which nation steps toward war?' : 'Draw from which deck?';
  }
  var skip = null;
  dms.forEach(function (m) {
    var a = m.a;
    if (a === 'skip') { skip = m; return; }
    if (a === 'dip' || a === 'draw') { if (seen[a]) return; seen[a] = 1; var n = dms.filter(function (x) { return x.a === a; });
      acts.push({ t: a === 'dip' ? 'Stir a nation' : 'Draw a card', s: a === 'dip' ? n.length + ' nations' : 'either deck', key: a, f: function () { if (n.length === 1) apply(n[0]); else { UI.sub = a; render(); } } }); return; }
    if (a === 'minion' || a === 'hero') { acts.push({ t: CHARS[m.c].short, s: 'enters at ' + rn(m.to), cls: 'red', key: a + '-' + m.c, f: function () { apply(m); } }); return; }
    if (a === 'card') { if (seen.card) return; seen.card = 1; acts.push({ t: 'Play card', s: dms.filter(function (x) { return x.a === 'card'; }).length + ' playable', key: 'card', f: function () { openCards(); } }); return; }
    if (seen[a]) return; seen[a] = 1;
    var lab = ACT_LABEL[a] || [a, '']; var sub = lab[1];
    if (a === 'cmove') sub = F.road >= 0 ? 'step on the Ashen Road' : 'hunt risk ' + Math.round(riskOfMove(G) * 100) + '%';
    var x = { t: lab[0], s: sub, key: a, cls: a === 'cmove' || a === 'chide' ? 'pri' : '', f: null };
    if (a === 'attack' || a === 'lattack' || a === 'lmove' || a === 'sortie') { var cnt = dms.filter(function (y) { return y.a === a; }); x.f = function () { if (cnt.length === 1) apply(cnt[0]); else { UI.src = { kind: 'attackFrom', a: a }; render(); } }; }
    else x.f = function () { apply(m); };
    acts.push(x);
  });
  if (skip) acts.push({ t: 'Set aside', s: 'waste this die', key: 'skip', cls: 'low', f: function () { apply(skip); } });
  if (f === 'W') acts.push({ t: 'Back', key: 'back', f: function () { UI.asFace = null; render(); } });
  return FACE_NAME[f] + ' die: choose an action';
}
function tokId(rid) { var a = G.A[rid]; return 'tok-' + rid + '-' + (a ? armySide(a) : UI.side); }
function lampPick(ms) {
  var lm = ms.filter(function (m) { return m.t === 'lamp'; }); var acts = [];
  var faces = {}; lm.forEach(function (m) { (faces[m.f] = faces[m.f] || []).push(m); });
  Object.keys(faces).forEach(function (f) { var m = faces[f][0]; acts.push({ t: FACE_NAME[f], s: 'turn a die into it', key: 'lamp-' + f, f: function () { apply(m); } }); });
  acts.push({ t: 'Back', key: 'back', f: function () { render(); } });
  renderActs(acts); $('#msg').textContent = 'The Lamp turns a die into…';
}
// ---------------------------------------------------------------- pending UIs
function pendUI(ms, hl, acts) {
  var p = G.pend, d = p.d;
  UI.tap = function () { return false; };
  switch (p.h) {
    case 'discard': acts.push({ t: 'Pick a card', s: 'hand limit is 6', cls: 'pri', key: 'disc', f: function () { openCards(true); } }); if (!UI.sheet) openCards(true); return 'Too many cards: discard one';
    case 'damage':
      ms.forEach(function (m) {
        if (m.t === 'taint') acts.push({ t: 'Take ' + d.dmg + ' taint', s: 'now ' + G.F.taint + ' → ' + (G.F.taint + d.dmg) + ' of 12', cls: 'red', key: 'taint', f: function () { apply(m); } });
        else acts.push({ t: m.c === 'random' ? 'A random hero' : CHARS[m.c].short + ' falls', s: m.c === 'random' ? 'cuts taint by their level' : 'cuts ' + Math.min(d.dmg, CHARS[m.c].lv) + ' taint', key: 'absorb-' + m.c, f: function () { apply(m); } });
      });
      return 'The Hunt strikes: ' + d.dmg + ' taint';
    case 'reveal': return regionPick(ms, 'to', hl, acts, 'Revealed: tap where the Company is seen');
    case 'attack': var at = ms.filter(function (m) { return m.t === 'atk'; }), mine = units(atWarPart(G, G.A[d.from] || {})); return regionPick(at, 'to', hl, acts, 'Attack: your ' + mine + ' vs ' + at.map(function (m) { return units(G.A[m.to]); }).join(' or '), ms.filter(function (m) { return m.t === 'cancel'; })[0]);
    case 'recruit': return recruitUI(ms, hl, acts);
    case 'amove': return twoStep(ms, 'mv', 'from', 'to', hl, acts, 'Tap an army to move', 'mvdone', 'Stop moving');
    case 'sep': return sepUI(ms, hl, acts);
    case 'charmove': return twoStep(ms, 'cm', 'c', 'to', hl, acts, 'Tap a hero to move', 'cmdone', 'Done');
    case 'nzmove': return twoStep(ms, null, null, 'to', hl, acts, 'Tap a rider to fly', 'nzdone', 'Done');
    case 'battle': return 'Battle at ' + rn(d.to);
    case 'effect': return effectUI(ms, hl, acts);
  }
  return '';
}
function regionPick(ms, key, hl, acts, text, cancel) {
  ms.forEach(function (m) { hl.regions.push(m[key]); var t = tokId(m[key]); hl.tokens.push(t); });
  UI.tap = function (kind, rid) { var m = ms.filter(function (x) { return x[key] === rid; })[0]; if (m) { apply(m); return true; } };
  if (cancel) acts.push({ t: 'Cancel', s: 'keep the die', key: 'cancel', f: function () { apply(cancel); } });
  return text;
}
function recruitUI(ms, hl, acts) {
  var recs = ms.filter(function (m) { return m.t === 'rec'; }), done = ms.filter(function (m) { return m.t === 'recdone'; })[0];
  var got = G.pend.d.got;
  if (UI.src && UI.src.kind === 'rec') {
    var here = recs.filter(function (m) { return m.rid === UI.src.rid; });
    here.forEach(function (m) { acts.push({ t: { r: 'Regular', e: 'Elite', l: REG[m.rid].nat === 'pt' ? 'Gloamrider' : 'Leader' }[m.k], s: { r: '1 strength', e: '1 strength, takes 2 hits', l: 'adds a re-roll' }[m.k], cls: m.k === 'e' ? 'pri' : '', key: 'rec-' + m.k, f: function () { apply(m); } }); });
    acts.push({ t: 'Back', key: 'back', f: function () { UI.src = null; render(); } }); hl.sel = UI.src.rid;
    return 'Muster at ' + rn(UI.src.rid);
  }
  var rids = {}; recs.forEach(function (m) { rids[m.rid] = 1; }); Object.keys(rids).forEach(function (r) { hl.regions.push(r); });
  UI.tap = function (kind, rid) { if (!rids[rid]) return; var here = recs.filter(function (m) { return m.rid === rid; }); if (here.length === 1) apply(here[0]); else { UI.src = { kind: 'rec', rid: rid }; render(); } return true; };
  if (done) acts.push({ t: 'Done', s: 'muster no more', key: 'recdone', f: function () { apply(done); } });
  return got.length ? 'One more unit: tap a glowing town' : 'Tap a glowing town to muster';
}
function twoStep(ms, t, srcKey, dstKey, hl, acts, text, doneT, doneLabel) {
  var mv = ms.filter(function (m) { return t ? m.t === t : (m.t === 'nz' || m.t === 'cm'); }), done = ms.filter(function (m) { return m.t === doneT; })[0];
  var srcOf = function (m) { return m.t === 'nz' ? 'r:' + m.from : m.c ? 'c:' + m.c : 'r:' + m[srcKey]; };
  if (UI.src && UI.src.kind === 'two') {
    var mine = mv.filter(function (m) { return srcOf(m) === UI.src.id; });
    var dests = {}; mine.forEach(function (m) { (dests[m[dstKey]] = dests[m[dstKey]] || []).push(m); });
    Object.keys(dests).forEach(function (r) { hl.regions.push(r); });
    var hasSplit = mine.some(function (m) { return m.u && units(m.u) < units(G.A[m.from]); });
    UI.tap = function (kind, rid) { var opts = dests[rid]; if (!opts) { return false; } var m = opts.filter(function (x) { return !x.u || (UI.split ? units(x.u) < units(G.A[x.from]) : units(x.u) === units(G.A[x.from])); })[0] || opts[0]; if (!tutOk({ type: 'tap', what: 'dest', rid: rid })) return true; apply(m); return true; };
    if (hasSplit) acts.push({ t: UI.split ? 'Leave one: on' : 'Leave one: off', s: 'keep a regular behind', key: 'split', f: function () { UI.split = UI.split ? 0 : 1; render(); } });
    acts.push({ t: 'Back', key: 'back', f: function () { UI.src = null; render(); } });
    var sid = UI.src.id.split(':'); if (sid[0] === 'r') hl.selTok = tokId(sid[1]);
    return 'Tap where it goes';
  }
  var srcs = {}; mv.forEach(function (m) { srcs[srcOf(m)] = 1; });
  Object.keys(srcs).forEach(function (k) { var v = k.split(':'); if (v[0] === 'r') { hl.tokens.push(tokId(v[1])); hl.regions.push(v[1]); } else { var cl = G.C[v[1]]; if (REG[cl]) hl.regions.push(cl); } });
  UI.tap = function (kind, rid, extra) { var id = kind === 'c' ? 'c:' + rid : 'r:' + rid; if (kind === 'c' && !srcs[id]) { var c2 = Object.keys(srcs).filter(function (k) { return k.indexOf('c:') === 0 && G.C[k.slice(2)] === G.C[rid]; })[0]; if (c2) id = c2; } if (kind === 'r' && !srcs[id]) { var cc = Object.keys(srcs).filter(function (k) { return k.indexOf('c:') === 0 && G.C[k.slice(2)] === rid; })[0]; if (cc) id = cc; } if (!srcs[id]) return false; if (!tutOk({ type: 'tap', what: 'src', id: id })) return true; UI.src = { kind: 'two', id: id }; UI.split = 0; render(); return true; };
  if (done) acts.push({ t: doneLabel, s: 'end this action', key: doneT, f: function () { apply(done); } });
  return text;
}
function sepUI(ms, hl, acts) {
  if (UI.src && UI.src.kind === 'sep') {
    var mine = ms.filter(function (m) { return m.cs.join() === UI.src.cs; });
    return regionPick(mine, 'to', hl, acts, 'Tap where ' + (mine[0].cs.length > 1 ? 'they go' : CHARS[mine[0].cs[0]].short + ' goes'));
  }
  var groups = {}; ms.forEach(function (m) { groups[m.cs.join()] = m.cs; });
  Object.keys(groups).forEach(function (k) { var cs = groups[k]; acts.push({ t: cs.length > 1 ? 'Everyone' : CHARS[cs[0]].short, s: cs.length > 1 ? 'the whole Company' : 'level ' + CHARS[cs[0]].lv + (cs[0] === guideOf(G) ? ' · guide' : ''), key: 'sep-' + k, f: function () { UI.src = { kind: 'sep', cs: k }; render(); } }); });
  return 'Who leaves the Company?';
}
function effectUI(ms, hl, acts) {
  var d = G.pend.d, op = d.cur, c = CARD[d.cid];
  var reg = ms.filter(function (m) { return m.rid || m.r || m.to; });
  if (reg.length) {
    var key = function (m) { return m.t === 'eatk' ? m.to : m.rid || (m.r && m.r.replace('in:', '')) || m.to; };
    if (reg[0].t === 'eatk' && !UI.src) { var froms = {}; reg.forEach(function (m) { froms[m.from] = 1; }); if (Object.keys(froms).length > 1) { Object.keys(froms).forEach(function (r) { hl.regions.push(r); hl.tokens.push(tokId(r)); }); UI.tap = function (k, rid) { if (froms[rid]) { UI.src = { kind: 'efrom', rid: rid }; render(); return true; } }; return c.n + ': tap the attacking army'; } }
    var list = reg.filter(function (m) { return !(UI.src && UI.src.kind === 'efrom') || m.from === UI.src.rid; });
    var byR = {}; list.forEach(function (m) { (byR[key(m)] = byR[key(m)] || []).push(m); });
    Object.keys(byR).forEach(function (r) { hl.regions.push(r); });
    UI.tap = function (k, rid) { var o = byR[rid]; if (!o) return false; apply(o[0]); return true; };
  }
  ms.filter(function (m) { return !(m.rid || m.r || m.to); }).forEach(function (m) {
    if (m.t === 'eskip') acts.push({ t: 'Skip', s: 'no effect', key: 'eskip', f: function () { apply(m); } });
    else if (m.t === 'ewake' || m.t === 'epol') acts.push({ t: NATIONS[m.n].short, s: m.t === 'ewake' ? 'wakes up' : polText(G, m.n), key: m.t + m.n, f: function () { apply(m); } });
    else if (m.t === 'ekill') acts.push({ t: CHARS[m.c].short, s: 'falls', cls: 'red', key: 'ekill', f: function () { apply(m); } });
    else if (m.t === 'esortie') acts.push({ t: 'Sally at ' + rn(m.r), key: 'esortie', f: function () { apply(m); } });
  });
  return reg.length ? 'Tap a glowing place' : c.n + ': choose';
}
// ---------------------------------------------------------------- map taps
function onMapTap(kind, rid, extra, ev, under) {
  if (!G) return;
  if (kind === 't') kind = 'r';
  if (kind === 'co') kind = 'r';
  if (human(sideToAct(G)) && !UI.hold && UI.tap) { if (UI.tap(kind, rid, extra)) return; if (under && under !== rid && UI.tap('r', under)) return; }
  if (human(sideToAct(G)) && !UI.hold && MV.hl && (MV.hl.regions || []).length) { toast('Not there: tap a red glowing place'); return; }
  if (kind === 'c') { charInfo(rid); return; }
  regionInfo(rid);
}
// ---------------------------------------------------------------- battle overlay
function battleRender(ms) {
  var B = G.pend.d, el = $('#battle'), me = UI.side, myTurn = human(G.pend.side) && !UI.hold;
  var ar = bArmies(G, B), h = '<h3>' + (B.siege ? 'Siege of ' : B.sortie ? 'Sally at ' : 'Battle at ') + rn(B.to) + (B.round ? ' · round ' + B.round : '') + '</h3>';
  h += '<div class="bside">' + armyBox(ar.att, B.as, 'Attacker', B.last && B.last.ra) + '<div class="bvs">vs</div>' + armyBox(ar.def, B.ds, 'Defender', B.last && B.last.rd) + '</div>';
  var note = '';
  if (B.last) note = sideName(B.as) + ' scores ' + B.last.hA + ', ' + sideName(B.ds) + ' scores ' + B.last.hD + (B.last.cards.att || B.last.cards.def ? ' · cards: ' + [B.last.cards.att, B.last.cards.def].filter(Boolean).map(function (c) { return CARD[c].cb.t; }).join(', ') : '');
  h += '<div class="bnote">' + note + '</div><div class="bnote" style="font-size:.92rem">Dice hit on 5 or 6' + (B.siege ? ' (attacker needs 6 at the walls)' : '') + '. Leaders re-roll misses.</div>';
  var acts = [];
  if (myTurn) {
    if (B.stage === 'acard' || B.stage === 'dcard') {
      h += '<div class="bnote">Play a combat card?</div><div class="bcards">';
      ms.forEach(function (m) { if (m.c) { var c = CARD[m.c]; h += '<button class="bcard" type="button" data-c="' + m.c + '"><b>' + c.cb.t + '</b><small>' + c.cb.text + ' (first: ' + c.cb.i + ')</small></button>'; } });
      h += '</div>'; acts.push(['No card', { t: 'bcard', c: null }, 'pri']);
    } else ms.forEach(function (m) {
      var L = { field: ['Fight in the field', 0], walls: ['Behind the walls', 1], cont: ['Fight on', 1], cease: ['Stop the attack', 0], stand: ['Stand', 1], retreat: ['Retreat to ' + rn(m.to), 0], extend: ['Press on (elite → regular)', 0], stop: ['End the siege round', 1], stay: ['Stay', 0], adv: ['Advance into ' + rn(B.to), 1] }[m.t];
      if (L) acts.push([L[0], m, L[1] ? 'pri' : '']);
    });
  } else h += '<div class="bnote">' + sideName(G.pend.side) + ' decides…</div>';
  h += '<div class="row" style="justify-content:center;margin-top:6px" id="bacts"></div>';
  el.innerHTML = h; el.classList.add('on');
  var row = $('#bacts'); acts.forEach(function (a) { var b = mk('button', 'btn ' + a[2], a[0]); b.type = 'button'; b.onclick = function () { apply(a[1]); }; row.appendChild(b); });
  el.querySelectorAll('.bcard').forEach(function (b) { b.onclick = function () { apply({ t: 'bcard', c: b.dataset.c }); }; });
}
function armyBox(a, side, role, roll) {
  var u = units(a), r = 0, e = 0, l = 0; for (var n in a || {}) { r += a[n][0]; e += a[n][1]; l += a[n][2]; }
  var rolls = roll ? '<div class="rolls">' + roll.r.map(function (x) { return '<span class="cd6' + (x !== 1 && x >= roll.need ? ' hit' : '') + '">' + x + '</span>'; }).join('') + '</div>' : '<div class="rolls"></div>';
  return '<div class="barmy' + (side === 'G' ? ' g' : '') + '"><div class="nm">' + role + ' · ' + sideName(side) + '</div><div class="u">' + u + '</div><div class="s">' + r + ' regular · ' + e + ' elite · ' + l + ' leader</div>' + rolls + '</div>';
}
function showRound(e) { if (!$('#battle').classList.contains('on')) { UI.roundShow = true; setTimeout(function () { UI.roundShow = false; if (!(G.pend && G.pend.h === 'battle')) battleClose(); }, UI.fast ? 30 : 1300); } sfx('hit'); buzz(20); }
function battleClose() { $('#battle').classList.remove('on'); }
// ---------------------------------------------------------------- result
function showResult() {
  if (UI.ended) return; UI.ended = true; var w = G.win, me = UI.side, won = w.side === me;
  try { if (window.GXT && GXT.active()) { GXT.act({ type: 'event', what: 'done' }); return; } } catch (e) { }
  sfx(won ? 'win' : 'lose');
  $('#resH').textContent = won ? 'Victory' : 'Defeat';
  $('#resP').textContent = { taint: 'The Hollow Crown overcame the Bearers. The Gloam rules the dark.', kiln: 'The Hollow Crown was unmade in the Kiln of Kaldur. Dawn breaks.', vp: w.side === 'G' ? 'The Gloam took ten points of Dawn cities and strongholds.' : 'The Dawn League took four points of Gloam strongholds.' }[w.why] + ' Turn ' + G.turn + '.';
  var row = $('#resRow'); row.innerHTML = '';
  [['Play again', function () { startGame({ side: UI.side, level: UI.level }); }, 'pri'], ['Switch sides', function () { startGame({ side: other(UI.side), level: UI.level }); }, ''], ['Title', showTitle, '']].forEach(function (x) { var b = mk('button', 'btn big ' + x[2], x[0]); b.type = 'button'; b.onclick = x[1]; row.appendChild(b); });
  $('#res').classList.add('on'); document.body.classList.add('scr-on');
}
function showTitle() { clearTimeout(UI.timer); try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } closeSheet(); battleClose(); $('#res').classList.remove('on'); $('#title').classList.add('on'); document.body.classList.add('scr-on'); tutMenu(); }
function tutMenu() { try { $('#tutSlot').innerHTML = GXT.menuHTML({ game: 'gloamwar', first: !ls('gw-played'), cls: 'btn', launch: function () { startTutorial(); } }); } catch (e) { } }
// ---------------------------------------------------------------- boot
function crest() {
  var s = '<circle cx="100" cy="100" r="94" fill="#eadbb4" stroke="#1f1812" stroke-width="4"/><circle cx="100" cy="100" r="86" fill="none" stroke="#1f1812" stroke-width="1.5"/><circle cx="100" cy="100" r="58" fill="#1f1812"/>';
  for (var i = 0; i < 32; i++) { var a = i / 32 * Math.PI * 2, r1 = 60, r2 = i % 2 ? 76 : 84; s += '<path d="M' + (100 + Math.cos(a - 0.05) * r1).toFixed(1) + ',' + (100 + Math.sin(a - 0.05) * r1).toFixed(1) + ' L' + (100 + Math.cos(a) * r2).toFixed(1) + ',' + (100 + Math.sin(a) * r2).toFixed(1) + ' L' + (100 + Math.cos(a + 0.05) * r1).toFixed(1) + ',' + (100 + Math.sin(a + 0.05) * r1).toFixed(1) + 'Z" fill="' + (i % 2 ? '#1f1812' : '#9a2117') + '"/>'; }
  s += '<path d="' + ICONS.lantern + '" transform="translate(66,70) scale(.133)" fill="#f2d98a"/>';
  s += '<path d="' + ICONS.leader + '" transform="translate(78,40) scale(.086)" fill="#eadbb4"/>';
  $('#crest').innerHTML = s;
}
function boot() {
  UI.side = ls('gw-side') || 'D'; UI.level = ls('gw-lv') || 'normal';
  crest(); if ($('#title').classList.contains('on')) document.body.classList.add('scr-on'); MV.init(); MV.onTap = onMapTap; menuInit(); helpInit();
  var seg = $('#segL'); [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']].forEach(function (x) { var b = mk('button', UI.level === x[0] ? 'on' : '', x[1]); b.type = 'button'; b.onclick = function () { UI.level = x[0]; ls('gw-lv', x[0]); seg.querySelectorAll('button').forEach(function (y) { y.classList.toggle('on', y === b); }); }; seg.appendChild(b); });
  $('#playD').onclick = function () { ls('gw-played', 1); startGame({ side: 'D', level: UI.level }); };
  $('#playG').onclick = function () { ls('gw-played', 1); startGame({ side: 'G', level: UI.level }); };
  $('#howB').onclick = function () { GXH.rules(); };
  $('#helpB').onclick = function () { GXH.rules(phaseId() || undefined); };
  $('#menuB').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="#1f1812" stroke-width="2.4" stroke-linecap="round"/></svg>';
  $('#tCards').onclick = function () { openCards(); }; $('#tNat').onclick = openNations; $('#tComp').onclick = openCompany;
  $('#cT').onclick = openCompany; $('#msg').onclick = openLog;
  $('#zin').onclick = function () { MV.zoomBy(1.4); }; $('#zout').onclick = function () { MV.zoomBy(1 / 1.4); }; $('#cD').onclick = function () { openVP('D'); }; $('#cG').onclick = function () { openVP('G'); };
  $('#scrim').onclick = function (e) { closeSheet(e); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSheet(); } });
  try { GXV.watch(function () { MV.fit(); if (G) render(); }); } catch (e) { addEventListener('resize', function () { MV.fit(); if (G) render(); }); }
  tutMenu();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
