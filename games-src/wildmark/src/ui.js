/* Wildmark UI: title (Story / Quick game / How to play), the hex map (SVG, pan + pinch + wheel zoom), the market dock, computer turns,
   hot-seat, scoring pops, result screen, save/resume. Story = campaign.js, tutorial = tutor.js, help + bulb = help.js. */
var G = null, AIDELAY = 650, ANIM = true;
var UI = { view: 0, mode: 'quick', ghost: null, free: null, wipe: null, undo: null, pan: { z: 1, tx: 0, ty: 0 }, panT: null, userPan: 0, lit: null, busy: false, camp: null, humans: 1, cfg: null, prefs: {} };
var SZ = 40, SQ3 = Math.sqrt(3), ZMIN = 47 / (SQ3 * (SZ - 1));   // smallest auto-fit zoom: a hex is 47 px wide (44 px tap rule + margin)
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
try { UI.prefs = JSON.parse(localStorage.getItem('wm-prefs') || '{}') || {}; } catch (e) { UI.prefs = {}; }
document.addEventListener('pointerdown', function () { if (G && !G.over && G.seats[G.cur] && G.seats[G.cur].ai) UI.aiQuick = true; }, true);   // tap during a rival turn: play it faster
function savePrefs() { try { localStorage.setItem('wm-prefs', JSON.stringify(UI.prefs)); } catch (e) { } }
function an(a) { return (/^[AEIOU]/.test(WM.ANI_NAME[a]) ? 'an ' : 'a ') + WM.ANI_NAME[a]; }
function toastPlace(e) {   // in play, toasts sit at the bottom of the valley, just above the instruction line (never over the score chips)
  var ln = $('#line'), st = $('#start'); e.style.top = ''; e.style.bottom = ''; if (!ln || !st || !st.hidden || !G) return;
  var pv = $('#pv'); if (pv && !pv.hidden && pv.offsetHeight) ln = pv;   // above the points strip when it shows
  var r = ln.getBoundingClientRect(); if (r.height && r.top > 200) { e.style.top = 'auto'; e.style.bottom = Math.round(innerHeight - r.top + 8) + 'px'; }
}
function toast(t, ms) { if (G && !G.over && !hintsOn() && $('#start').hidden) return; var e = $('#toast'); if (document.querySelector('.gx-drawer.on, .gx-drawer[aria-hidden="false"]')) return; e.textContent = t; toastPlace(e); e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, ms || 2200); }
// ---------------------------------------------------------------- sound (synth; music slots via gx-music when files exist)
var SND = { ctx: null };
function hintsOn() { return UI.mode === 'coach' || UI.prefs.hints !== 0; }   // G5: hints (goal chips + point previews) are on until the player switches them off
function hintsSync() { var on = hintsOn(); document.documentElement.classList.toggle('wm-clean', !on); var b = document.getElementById('hintsB'); if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', on); var l = b.querySelector('span'); if (l) l.textContent = on ? 'Hints on' : 'Hints'; } }
function sfxVol() { try { var p = GX.pref ? GX.pref() : {}; return (p.master == null ? 1 : p.master) * (p.sfx == null ? 0.8 : p.sfx); } catch (e) { return 0.8; } }
function sfx(kind) {
  if (UI.prefs.mute) return; var v = sfxVol(); if (!v) return;
  try {
    var c = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()), t = c.currentTime;
    var notes = { tap: [[660, 0.05]], place: [[330, 0.08], [440, 0.08]], tok: [[520, 0.07], [780, 0.1]], score: [[660, 0.08], [880, 0.08], [1180, 0.16]], wipe: [[300, 0.06], [240, 0.06], [200, 0.1]], acorn: [[880, 0.06], [1320, 0.12]], end: [[392, 0.15], [523, 0.15], [659, 0.3]] }[kind] || [[440, 0.05]];
    notes.forEach(function (n, i) { var o = c.createOscillator(), g = c.createGain(); o.type = kind === 'wipe' ? 'triangle' : 'sine'; o.frequency.value = n[0]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] + 0.02); t += n[1] * 0.8; });
  } catch (e) { }
}
// ---------------------------------------------------------------- hex geometry
function pix(c) { var p = WM.pk(c); return [SZ * SQ3 * (p[0] + p[1] / 2), SZ * 1.5 * p[1]]; }
function corner(x, y, s, j) { var a = (30 - 60 * j) * Math.PI / 180; return [x + s * Math.cos(a), y - s * Math.sin(a)]; }
function poly(x, y, s, js) { return js.map(function (j) { var p = corner(x, y, s, ((j % 6) + 6) % 6); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
// a hex tile (placed or in the market) as SVG at (x,y), size s
function tileSvg(tile, x, y, s, rot, opt) {
  opt = opt || {}; var out = '', r = rot || 0;
  if (tile.t.length === 1) out += '<polygon points="' + poly(x, y, s, [0, 1, 2, 3, 4, 5]) + '" fill="url(#pt-' + tile.t[0] + ')"/>';
  else {   // half A = corners r..r+3 (edges r, r+1, r+2), half B = the rest
    out += '<polygon points="' + poly(x, y, s, [r, r + 1, r + 2, r + 3]) + '" fill="url(#pt-' + tile.t[0] + ')"/>';
    out += '<polygon points="' + poly(x, y, s, [r + 3, r + 4, r + 5, r + 6]) + '" fill="url(#pt-' + tile.t[1] + ')"/>';
  }
  out += '<polygon points="' + poly(x, y, s, [0, 1, 2, 3, 4, 5]) + '" fill="none" stroke="' + (tile.key ? '#f2d27a' : 'rgba(20,30,20,.55)') + '" stroke-width="' + (tile.key ? s * 0.09 : s * 0.04) + '"/>';
  var zr = opt.map && UI.pan && UI.pan.z || 0;   // map only: keep portraits readable at phone zoom (36 px placed, 24 px slots), inside the hex
  if (opt.tok) out += (opt.hop ? '<g class="hop">' : '') + tokenSvg(opt.tok, x, y, zr ? Math.min(s * 0.66, Math.max(s * 0.46, 19 / zr)) : s * 0.46) + (opt.hop ? '</g>' : '');
  else if (!opt.noSlots) {   // the animals this tile accepts: small discs
    var n = tile.a.length, rr = s * (n === 1 ? 0.3 : 0.22), off = n === 1 ? [[0, 0]] : n === 2 ? [[-0.27, 0], [0.27, 0]] : [[-0.27, 0.16], [0.27, 0.16], [0, -0.3]];
    if (opt.big) { rr = s * (n === 1 ? 0.44 : n === 2 ? 0.33 : 0.29); off = n === 1 ? [[0, 0]] : n === 2 ? [[-0.37, 0], [0.37, 0]] : [[-0.34, 0.22], [0.34, 0.22], [0, -0.38]]; }   // market/preview: readable animal icons
    if (zr && !opt.big) rr = Math.min(s * (n === 1 ? 0.42 : 0.27), Math.max(rr, 12.5 / zr));
    tile.a.forEach(function (a, i) { out += tokenSvg(a, x + off[i][0] * s, y + off[i][1] * s, rr, ' sm'); });
  }
  return out;
}
// ---------------------------------------------------------------- game start / save
function seatHuman(i) { return G && !G.seats[i].ai; }
function meSeat() { if (!G) return 0; if (UI.humans > 1) return seatHuman(G.cur) ? G.cur : UI.lastHuman || 0; return 0; }
function newGame(cfg) {
  cfg = Object.assign({ np: 2, ai: 'gentle', humans: 1, seed: null, turns: 20 }, cfg || {});
  var ai = [], names = [];
  for (var i = 0; i < cfg.np; i++) { ai.push(i < cfg.humans ? null : (cfg.lvBy && cfg.lvBy[i]) || cfg.ai); names.push(i < cfg.humans ? (cfg.humans > 1 ? 'Ranger ' + (i + 1) : 'You') : (cfg.names && cfg.names[i]) || WM.RIVALS[(i - cfg.humans) % WM.RIVALS.length]); }
  if (cfg.humans === 1) names[0] = 'You';
  if (UI.mode === 'quick' && cfg.cards) { UI.prefs.variant = cfg.cards === 'mix' ? 1 : 0; savePrefs(); }   // Story follows the same switch
  var cards = cfg.cards === 'mix' ? (function () { var o = {}; WM.ANI.forEach(function (a) { o[a] = 'abcd'[1 + Math.floor(Math.random() * 3)]; }); return o; })() : (cfg.cards && typeof cfg.cards === 'object' ? cfg.cards : null);
  G = WM.newGame({ np: cfg.np, seed: cfg.seed, ai: ai, names: names, turns: cfg.turns, acorns: cfg.acorns, no3: cfg.no3, cards: cards });
  UI.cfg = cfg; UI.humans = cfg.humans; UI.view = 0; UI.lastHuman = 0; UI.ghost = null; UI.free = null; UI.wipe = null; UI.undo = null; UI.lit = null; UI.userPan = 0; UI.passed = -1;
  $('#start').hidden = true; document.documentElement.classList.remove('wm-title'); $('#rs').hidden = true; try { GX.close(); } catch (e) { }
  fitView(true); render(); step(); save(); musicSync(); goalShow();
  var q = window.CAMPAIGN && CAMPAIGN.quick; if (q && q.intro && UI.mode === 'quick' && !UI.fast) setTimeout(function () { toast(q.intro[Math.floor(Math.random() * q.intro.length)], 2600); }, 500);   // one-line flavour (text in campaign.json)
  return G;
}
function quickLine() { var q = window.CAMPAIGN && CAMPAIGN.quick; if (!q || UI.mode !== 'quick' || !G) return ''; var t = G.solo ? q.solo : G.winner === -2 ? q.tie : G.winner === 0 ? q.win : q.lose; return t ? '<p class="qline">' + esc(t) + '</p>' : ''; }
function save() { if (!G || UI.mode !== 'quick' || G.over) { if (G && G.over && UI.mode === 'quick') try { localStorage.removeItem('wm-save'); } catch (e) { } return; } try { localStorage.setItem('wm-save', JSON.stringify({ G: G, cfg: UI.cfg })); } catch (e) { } }
function loadSave() { try { var s = JSON.parse(localStorage.getItem('wm-save') || 'null'); return s && s.G && !s.G.over ? s : null; } catch (e) { return null; } }
function resume() { var s = loadSave(); if (!s) return; G = s.G; UI.cfg = s.cfg; UI.humans = s.cfg.humans || 1; UI.mode = 'quick'; UI.view = meSeat(); UI.ghost = UI.free = UI.wipe = UI.undo = null; UI.camp = null; $('#start').hidden = true; fitView(true); render(); step(); musicSync(); }
// ---------------------------------------------------------------- the flow
function step() {
  clearTimeout(UI.aiT);
  if (!G) return;
  if (G.over) { render(); setTimeout(showResult, ANIM ? 900 : 50); return; }
  if (G.seats[G.cur].ai) { UI.aiT = setTimeout(aiStep, UI.fast ? 30 : AIDELAY); return; }
  if (UI.humans > 1 && UI.passed !== G.cur && G.stage === 'pick') { showPass(); return; }
  UI.lastHuman = G.cur; if (UI.view !== G.cur) { UI.view = G.cur; fitView(); }
  var bk = G.cur + ':' + G.seats[G.cur].done; if (!UI.fast && G.np > 1 && UI.humans === 1 && UI.mode !== 'tutorial' && !UI.tut && G.stage === 'pick' && UI.banKey !== bk) { UI.banKey = bk; banner('Your turn'); }
  render(); if (typeof tutFix === 'function') tutFix();
  autoTok();
}
function autoTok() {   // one legal target for the animal, and it costs nothing: place it for the player (tap targets stay live until it lands)
  clearTimeout(UI.autoT); if (UI.fast || UI.tut || UI.mode === 'tutorial' || UI.mode === 'coach' || !myTurn() || G.stage !== 'tok') return;
  var env = G.seats[G.cur].env, sp = WM.tokSpots(env, G.hold.tok); if (sp.length !== 1 || pvTok(env, sp[0], G.hold.tok).d < 0) return;
  var key = G.cur + ':' + G.seats[G.cur].done; $('#line').innerHTML = '<b class="stepn" aria-label="Step 3 of 3">3<small>/3</small></b><span class="stept">Only one spot: the ' + esc(WM.ANI_NAME[G.hold.tok]) + ' goes here</span>';
  UI.autoT = setTimeout(function () { if (G && myTurn() && G.stage === 'tok' && G.cur + ':' + G.seats[G.cur].done === key) act({ t: 'tok', c: sp[0] }); }, 650);
}
// turn banner: "Your turn" / "<Rival>'s turn", one at a time, fades by itself
function banner(t) { var wait = UI.popAt ? 1100 - (Date.now() - UI.popAt) : 0; if (wait > 0) { clearTimeout(banner.t); banner.t = setTimeout(function () { banner(t); }, wait); return; }   // G5: a score pop is showing: the banner waits so the two never overlap
  var e = $('#turnban'); if (!e) { e = document.createElement('div'); e.id = 'turnban'; e.setAttribute('aria-live', 'polite'); $('#board').appendChild(e); } e.textContent = t; e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); }
function terrText(t) { return t.t.map(function (x) { return WM.TER_NAME[x]; }).join('/'); }
// the rival's turn, step by step (take -> place -> settle), each with a caption on the instruction bar; tap anywhere to speed it up
function aiStep() {
  if (!G || G.over || !G.seats[G.cur].ai || UI.tutor) return;
  var nm = G.seats[G.cur].name, seat = G.cur, slow = !UI.fast && UI.humans === 1 && UI.mode !== 'tutorial';
  var D = function (ms) { return UI.fast ? 10 : Math.round(ms * (UI.aiQuick ? 0.35 : 1)); };
  var m = WM.AI.choose(G);
  if (G.stage !== 'pick') { WM.apply(G, m); render(); step(); return; }
  var key = seat + ':' + G.seats[seat].done;
  if (!UI.fast && UI.banKey !== key) { UI.banKey = key; UI.aiQuick = false; $('#toast').classList.remove('on'); var prev = (seat + G.np - 1) % G.np; if (!UI.tut) banner(!G.seats[prev].ai && UI.humans === 1 ? 'Your turn is done: ' + nm + "'s turn" : nm + "'s turn"); }
  var col = m.t === 'take' ? [m.i, m.i] : m.t === 'free' ? [m.ti, m.ki] : null;
  if (slow && col) UI.showAI = { seat: UI.view, text: nm + ' takes the ' + terrText(G.market.tiles[col[0]]) + ' tile + ' + WM.ANI_NAME[G.market.toks[col[1]]] + (m.t === 'free' ? ' (acorn)' : '') };
  if (slow) render();
  if (col) $$('#mk .mt[data-i="' + col[0] + '"], #mk .mk[data-i="' + col[1] + '"]').forEach(function (e) { e.classList.add('flash'); });
  UI.aiT = setTimeout(function () {
    if (!G || G.over) return;
    try { WM.apply(G, m); } catch (e) { console.error(e); return; }
    if (m.t === 'wipe3' || m.t === 'wipe') { rivalNote(nm + (m.t === 'wipe3' ? ' swept three matching animals.' : ' spent an acorn to replace animals.')); sfx('wipe'); UI.showAI = null; render(); step(); return; }
    var h = G.hold, mp = WM.AI.choose(G);
    if (!slow) { WM.apply(G, mp); var mq = WM.AI.choose(G); WM.apply(G, mq); rivalNote(nm + (mq.t === 'tok' ? ' placed ' + an(h.tok) + '.' : ' returned ' + an(h.tok) + '.')); sfx(G.last && G.last.acorn ? 'acorn' : 'place'); render(); step(); return; }
    WM.apply(G, mp); UI.view = seat; UI.showAI = { seat: seat, text: nm + ' places the tile in their valley' }; fitView(); render(); sfx('place');
    UI.anim = ANIM && !UI.fast ? { c: mp.c, k: 'drop', until: Date.now() + 700 } : null; drawMap();
    UI.aiT = setTimeout(function () {
      if (!G) return;
      var env = G.seats[seat].env, s0 = WM.score(env, 0), m2 = WM.AI.choose(G); WM.apply(G, m2);
      var s1 = WM.score(env, 0), best = null; WM.ANI.forEach(function (a) { var d = s1.ani[a] - s0.ani[a]; if (d && (!best || d > best.d)) best = { a: a, d: d }; });
      UI.showAI = { seat: seat, text: m2.t === 'tok' ? nm + ' puts the ' + WM.ANI_NAME[h.tok] + ' on a tile' + (G.last && G.last.acorn ? ' (+1 acorn)' : '') : nm + ' returns the ' + WM.ANI_NAME[h.tok] };
      if (m2.t === 'tok' && ANIM && !UI.fast) UI.anim = { c: m2.c, k: 'hop', until: Date.now() + 700 };
      render(); if (m2.t === 'tok') { if (best && best.d > 0) pop(m2.c, nm + ' +' + best.d + ' ' + cinfo(best.a).title, 'ani', ['.cc[data-card="' + best.a + '"]', '#seats .seat[data-seat="' + seat + '"]']); sfx(G.last && G.last.acorn ? 'acorn' : 'tok'); }
      UI.aiT = setTimeout(function () { UI.showAI = null; if (!G) return; UI.view = meSeat(); fitView(); render(); step(); }, D(1000));
    }, D(900));
  }, D(slow ? 1100 : AIDELAY * 0.8));
}
function showPass() {
  var e = $('#pass'); e.hidden = false; e.innerHTML = '<div class="pbox"><h2>' + esc(G.seats[G.cur].name) + '</h2><p>Your turn. Pass the device.</p><button class="big" id="passB" type="button">I am ' + esc(G.seats[G.cur].name) + '</button></div>';
}
// ---------------------------------------------------------------- human actions
function act(m) {
  var before = G.seats[G.cur], sc0 = pvScore(before.env, before.acorns), at = null;
  WM.apply(G, m);
  if (m.t === 'place') { UI.ghost = null; UI.hov = null; sfx('place'); if (ANIM && !UI.fast) UI.anim = { c: m.c, k: 'drop', until: Date.now() + 700 }; var sp = pvScore(before.env, before.acorns), hp = pvParts(sc0, sp); if (pvSum(hp) > 0) { pop(m.c, pvPop(hp), 'hab', ['#terr', '#seats .seat[data-seat="' + G.cur + '"]']); UI.lit = { cells: pvLit(before.env, hp), until: Date.now() + 1600 }; setTimeout(function () { UI.lit = null; drawMap(); }, 1700); } }
  if (m.t === 'tok' || m.t === 'back') {
    UI.undo = null; at = m.c;
    if (UI.mode === 'quick' && !before.ai && (UI.prefs.coachN || 0) < 3) { UI.prefs.coachN = (UI.prefs.coachN || 0) + 1; savePrefs(); }
    if (m.t === 'tok') {
      if (ANIM && !UI.fast) UI.anim = { c: m.c, k: 'hop', until: Date.now() + 700 };
      var sc1 = pvScore(before.env, before.acorns), best = null, tp = pvParts(sc0, sc1);
      WM.ANI.forEach(function (a) { var d = sc1.ani[a] - sc0.ani[a]; if (d && (!best || d > best.d)) best = { a: a, d: d }; });
      var tot = sc1.aniT - sc0.aniT;
      var ta = G.last && G.last.acorn ? ' +1 acorn (keystone).' : '', tk = before.env[m.c] && before.env[m.c].tok;
      if (tot > 0) { UI.lit = { cells: pvLit(before.env, tp), a: best.a, until: Date.now() + 1600 }; pop(m.c, pvPop(tp), 'ani', ['.cc[data-card="' + best.a + '"]', '#seats .seat[data-seat="' + G.cur + '"]']); sfx('score'); setTimeout(function () { UI.lit = null; drawMap(); }, 1700); }
      else if (tot < 0) { pop(m.c, pvPop(tp), 'neg', [tk ? '.cc[data-card="' + tk + '"]' : '#cards', '#seats .seat[data-seat="' + G.cur + '"]']); sfx('tok'); } else sfx('tok');
      // (no extra toast over the board: the one-line verdict says what the move scored)
      if (G.last && G.last.acorn) { setTimeout(function () { pop(m.c, '+1 acorn', 'acorn', ['#acorn']); sfx('acorn'); }, 350); }
    } else sfx('tap');
    if (!before.ai) { pvTurnEnd(); if (!G.over && G.seats[G.cur].ai && UI.humans === 1 && !UI.fast && !UI.tut) { UI.banKey = G.cur + ':' + G.seats[G.cur].done; banner('Your turn is done: ' + G.seats[G.cur].name + "'s turn"); } }   // the turn-over beat, right as you finish
    save();
  }
  render(); step();
}
function popAt(list) {   // the first visible chip in the list (score chip, seat chip), else the turn/score pill in the top bar
  popAt.e = null; popAt.r = null;
  (list || []).concat(['#barstat']).some(function (q) { var e = document.querySelector(q); if (!e) return false; var r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).display === 'none') return false; popAt.e = e; popAt.r = r; return true; });
  return popAt.r;
}
function pop(c, text, cls, anchors) { UI.popAt = Date.now();   // score pops sit ON the score chip they change (never over the tiles) and the chip bumps
  var r = popAt(anchors), el = popAt.e, key = (anchors || []).join(); if (!r) return;
  $$('.pop').forEach(function (o) { if (o.dataset.anc === key) o.parentNode.removeChild(o); });
  var e = document.createElement('div'); e.className = 'pop ' + (cls || ''); e.textContent = text; e.dataset.anc = key; e.style.top = Math.round(r.top + r.height / 2) + 'px';
  document.body.appendChild(e); var hw = e.offsetWidth / 2 + 6, x = r.left + r.width / 2; e.style.left = Math.max(hw, Math.min(innerWidth - hw, x)) + 'px';
  if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); setTimeout(function () { el.classList.remove('bump'); }, 700); }
  setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 1300);
}
function tutOK(x) { return typeof tutAct === 'function' ? tutAct(x) : true; }
function myTurn() { return G && !G.over && !G.seats[G.cur].ai && UI.view === G.cur && $('#pass').hidden; }
function onMarket(kind, i) {
  if (myTurn() && G.stage === 'tile' && UI.undo && G.hold && (G.hold.ti === i || G.hold.ki === i)) { undoTake(); return; }   // tapping the slot you took from puts the pair back
  if (myTurn() && G.stage === 'tile' && UI.undo && !UI.free && !UI.wipe && G.market.tiles[i] && G.market.toks[i]) { if (!tutOK({ what: 'swap', i: i })) return; G = UI.undo; UI.undo = null; UI.ghost = null; }   // changed your mind: tapping another pair swaps the pick (same as Back + pick)
  if (!myTurn() || G.stage !== 'pick') return;
  if (UI.wipe) { if (!G.market.toks[i]) return; if (!tutOK({ what: 'wsel', i: i })) return; var j = UI.wipe.indexOf(i); if (j >= 0) UI.wipe.splice(j, 1); else UI.wipe.push(i); sfx('tap'); render(); return; }
  if (UI.free) {
    if (!tutOK({ what: 'free' + kind, i: i })) return;
    if (kind === 't') UI.free.ti = i; else UI.free.ki = i; sfx('tap');
    if (UI.free.ti != null && UI.free.ki != null) { if (UI.free.ti === UI.free.ki) { UI.free = null; take({ t: 'take', i: i }); return; } var f = UI.free; UI.free = null; take({ t: 'free', ti: f.ti, ki: f.ki }); return; }
    render(); return;
  }
  if (!tutOK({ what: 'take', i: i })) return;
  take({ t: 'take', i: i });
}
function take(m) { UI.undo = WM.clone(G); sfx('tap'); pvTurnStart(m); UI.verdict = null; WM.apply(G, m); UI.ghost = null; render(); fitView(); }
function onCell(c, isSpot) {
  var vx = G && G.seats[UI.view].env[c];
  if (vx && !isSpot && (!myTurn() || G.stage === 'pick' || (G.stage === 'tile' && !(UI.ghost && UI.ghost.c === c)))) { showBig('tile', vx, vx.tok); return; }
  if (!myTurn()) return;
  if (G.stage === 'tile') {
    if (UI.ghost && UI.ghost.c === c) { rotate(); return; }
    if (!isSpot) return;
    if (!tutOK({ what: 'spot', c: c })) return;
    UI.ghost = { c: c, rot: bestRot(c) }; sfx('tap'); render(); return;
  }
  if (G.stage === 'tok') {
    var x = G.seats[G.cur].env[c]; if (x && (x.tok || x.a.indexOf(G.hold.tok) < 0) && !isSpot) { showBig('tile', x, x.tok); return; } if (!x || x.tok || x.a.indexOf(G.hold.tok) < 0) { toast(an(G.hold.tok).replace(/^a/, 'A') + ' needs an empty tile showing it.'); return; }
    if (!tutOK({ what: 'tok', c: c })) return;
    act({ t: 'tok', c: c });
  }
}
function bestRot(c) {   // the rotation that joins the most matching edges (a friendly default; the player can turn it)
  var t = G.hold.tile; if (t.t.length === 1) return 0; var env = G.seats[G.cur].env, best = 0, bv = -1;
  for (var r = 0; r < 6; r++) { var v = 0, cell = { t: t.t, rot: r }; WM.nb(c).forEach(function (n, d) { if (env[n] && WM.edgeT(env[n], (d + 3) % 6) === WM.edgeT(cell, d)) v++; }); if (v > bv) { bv = v; best = r; } }
  return best;
}
function rotate() { if (!UI.ghost || !tutOK({ what: 'rot' })) return; if (G.hold.tile.t.length > 1) { UI.ghost.rot = (UI.ghost.rot + 1) % 6; sfx('tap'); } else toast('One terrain: no need to turn it.'); render(); }
function confirmPlace() { if (!UI.ghost || !tutOK({ what: 'ok' })) return; act({ t: 'place', c: UI.ghost.c, rot: UI.ghost.rot }); fitView(); }
function undoTake() { if (!UI.undo || !tutOK({ what: 'undo' })) return; G = UI.undo; UI.undo = null; UI.ghost = null; sfx('tap'); render(); fitView(); }
// ---------------------------------------------------------------- pan and zoom
function boardWH() { var b = $('#board'); return [b.clientWidth || 390, b.clientHeight || 500]; }
function overlayPads() {   // G5: fit between the chips really on screen at the top and the step line at the bottom (sizes differ per phone and mode)
  var bd = $('#board'); if (!bd || !bd.getBoundingClientRect) return null; var B = bd.getBoundingClientRect(); if (!B.height) return null;
  var top = 8, bot = 8; ['#cards', '#seats', '#terr', '#acorn', '#coachb'].forEach(function (q) { var e = $(q); if (!e || e.hidden) return; var r = e.getBoundingClientRect(); if (!r.height || r.top > B.top + B.height / 2) return; top = Math.max(top, r.bottom - B.top + 6); });
  ['#line', '#acts'].forEach(function (q) { var e = $(q); if (!e || e.hidden) return; var r = e.getBoundingClientRect(); if (!r.height || r.bottom < B.top + B.height / 2 || r.top > B.bottom) return; bot = Math.max(bot, B.bottom - r.top + 6); });
  return [top, bot];
}
// the safe area: the board minus every chip that floats over it (measured, so it holds at any size and with hints on/off)
function safeRect() {
  var bd = $('#board'), wh = boardWH(), r = { l: 6, t: 6, r: wh[0] - 6, b: wh[1] - 6 }; if (!bd) return r; var br = bd.getBoundingClientRect();
  function vis(e) { if (!e || e.hidden) return null; var q = e.getBoundingClientRect(); if (q.width < 2 || q.height < 2) return null; var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null; return { l: q.left - br.left, t: q.top - br.top, r: q.right - br.left, b: q.bottom - br.top }; }
  ['#cards', '#seats', '#terr', '#acorn', '#coachb'].forEach(function (s) { var q = vis($(s)); if (q && q.t < wh[1] * 0.45) r.t = Math.max(r.t, q.b + 4); });
  ['#line', '#pv', '#acts'].forEach(function (s) { var q = vis($(s)); if (q && q.b > wh[1] * 0.55 && q.t < wh[1]) r.b = Math.min(r.b, q.t - 4); });
  var z = vis($('#zoom')); r.rw = r.r; r.zt = z ? z.t - 4 : 1e9; if (z) r.r = Math.min(r.r, z.l - 4);   // rw / zt: above the zoom column the full width is free
  if (r.b - r.t < 120) r.b = Math.min(wh[1] - 6, r.t + 120);
  return r;
}
var HEX_MIN = 44;   // never shrink a hex below 44 px across (a finger's width)
function fitView(now) {
  if (!G) return; var env = G.seats[UI.view].env, cells = Object.keys(env), spots = (G.stage === 'tile' && UI.view === G.cur && !G.seats[G.cur].ai) ? WM.spots(env) : [];
  function box(list) { var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; list.forEach(function (c) { var p = pix(c); b.x0 = Math.min(b.x0, p[0]); b.x1 = Math.max(b.x1, p[0]); b.y0 = Math.min(b.y0, p[1]); b.y1 = Math.max(b.y1, p[1]); }); return b; }
  var sr = safeRect(), aw = sr.r - sr.l, ah = sr.b - sr.t, zMin = Math.max(ZMIN, HEX_MIN / (SZ * SQ3));
  function zFor(b) { return Math.min(aw / (b.x1 - b.x0 + SZ * SQ3 + 4), ah / (b.y1 - b.y0 + SZ * 2 + 4)); }
  var b = box(cells.concat(spots)), z = Math.min(2.5, zFor(b));
  if (z < zMin && spots.length) { var bs = box(spots); b = bs; z = Math.max(zMin, Math.min(1, zFor(bs))); }   // the whole valley cannot fit: fit the legal spots
  z = Math.max(z, zMin);
  if (!isFinite(z) || b.x0 > b.x1) z = 1;
  var t = { z: z, tx: sr.l + aw / 2 - (b.x0 + b.x1) / 2 * z, ty: sr.t + ah / 2 - (b.y0 + b.y1) / 2 * z };
  var fc = typeof tutOn === 'function' && tutOn() && spots.length && UI.tut.spot && spots.indexOf(UI.tut.spot) >= 0 ? UI.tut.spot : null;   // tutorial: its one glowing spot is always fully in view
  if (fc) { var q = pix(fc), m = SZ * z + 4, fx = t.tx + q[0] * z, fy = t.ty + q[1] * z; if (fx - m < sr.l) t.tx += sr.l - (fx - m); if (fx + m > sr.r) t.tx -= fx + m - sr.r; if (fy - m < sr.t) t.ty += sr.t - (fy - m); if (fy + m > sr.b) t.ty -= fy + m - sr.b; }
  UI.userPan = 0;
  if (now || !ANIM || UI.fast) { UI.pan = t; drawMap(); edgeArrows(); return; }
  var f = Object.assign({}, UI.pan), t0 = performance.now(), D = 380;
  cancelAnimationFrame(UI.panT);
  (function an(n) { var k = Math.min(1, (n - t0) / D), e = 1 - Math.pow(1 - k, 3); UI.pan = { z: f.z + (t.z - f.z) * e, tx: f.tx + (t.tx - f.tx) * e, ty: f.ty + (t.ty - f.ty) * e }; applyPan(); if (k < 1) UI.panT = requestAnimationFrame(an); })(t0);
}
// legal spots that are off screen (or under a chip) get an arrow on that edge; tap it to bring the nearest one into view
function edgeArrows() {
  var bd = $('#board'); if (!bd) return; var host = $('#edgea'); if (!host) { host = document.createElement('div'); host.id = 'edgea'; bd.appendChild(host); }
  var h = ''; if (G && G.stage === 'tile' && UI.view === G.cur && !G.seats[G.cur].ai && !UI.ghost) {
    var sr = safeRect(), p = UI.pan, rr = SZ * p.z * 0.75, side = { l: [], r: [], t: [], b: [] };
    var seen = [];   // spots on screen: an arrow never sits on one of them
    WM.spots(G.seats[UI.view].env).forEach(function (c) { var q = pix(c), x = p.tx + q[0] * p.z, y = p.ty + q[1] * p.z;
      var hw = SZ * SQ3 / 2 * p.z - 2, hh = SZ * p.z * 0.75;   // any real part of the spot outside the safe area counts as hidden (the pointed tips may touch the edge)
      if (x - hw < sr.l) side.l.push([x, y, c]); else if (x + hw > (y + hh < sr.zt ? sr.rw : sr.r)) side.r.push([x, y, c]); else if (y - hh < sr.t) side.t.push([x, y, c]); else if (y + hh > sr.b) side.b.push([x, y, c]); else seen.push([x, y]); });
    function free(x, y) { return seen.every(function (v) { return v[0] < x - rr || v[0] > x + 44 + rr || v[1] < y - rr || v[1] > y + 44 + rr; }); }
    Object.keys(side).forEach(function (k) { var L = side[k]; if (!L.length) return; var a = L[0], cx = (sr.l + sr.r) / 2, cy = (sr.t + sr.b) / 2;
      var x = k === 'l' ? sr.l : k === 'r' ? sr.r - 44 : Math.max(sr.l, Math.min(sr.r - 44, a[0] - 22)), y = k === 't' ? sr.t : k === 'b' ? sr.b - 44 : Math.max(sr.t, Math.min(sr.b - 44, a[1] - 22));
      for (var n = 0, ok = free(x, y); !ok && n < 12; n++) { var d = (n >> 1) * 24 + 24, sg = n % 2 ? -1 : 1; var nx = k === 'l' || k === 'r' ? x : Math.max(sr.l, Math.min(sr.r - 44, x + sg * d)), ny = k === 't' || k === 'b' ? y : Math.max(sr.t, Math.min(sr.b - 44, y + sg * d)); if (free(nx, ny)) { x = nx; y = ny; ok = true; } }
      if (!ok) return;
      h += '<button type="button" class="ea ea-' + k + '" data-c="' + a[2] + '" style="left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px" aria-label="' + L.length + ' more spot' + (L.length > 1 ? 's' : '') + ' this way">' + ({ l: '&#9664;', r: '&#9654;', t: '&#9650;', b: '&#9660;' })[k] + '<small>' + L.length + '</small></button>'; });
  }
  host.innerHTML = h;
}
function panTo(c) { var q = pix(c), sr = safeRect(), p = UI.pan; p.tx = (sr.l + sr.r) / 2 - q[0] * p.z; p.ty = (sr.t + sr.b) / 2 - q[1] * p.z; applyPan(); }
function applyPan() { var v = $('#vp'); if (v) v.setAttribute('transform', 'translate(' + UI.pan.tx.toFixed(1) + ',' + UI.pan.ty.toFixed(1) + ') scale(' + UI.pan.z.toFixed(3) + ')'); clearTimeout(UI.eaT); UI.eaT = setTimeout(edgeArrows, 60); }
function zoomAt(f, cx, cy) { var p = UI.pan, z = Math.max(0.3, Math.min(2.6, p.z * f)); f = z / p.z; p.tx = cx - (cx - p.tx) * f; p.ty = cy - (cy - p.ty) * f; p.z = z; applyPan(); }
(function wirePan() {
  var pts = {}, start = null, moved = false;
  function svgXY(e) { var r = $('#board').getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('#map')) return; pts[e.pointerId] = svgXY(e); moved = false; start = { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) }; });
  document.addEventListener('pointermove', function (e) {
    if (!(e.pointerId in pts) || !start) return; pts[e.pointerId] = svgXY(e); var ids = Object.keys(pts);
    if (ids.length === 1) { var a = start.pts[ids[0]], b = pts[ids[0]]; if (!a) return; var dx = b[0] - a[0], dy = b[1] - a[1]; if (Math.abs(dx) + Math.abs(dy) > 8) moved = true; if (moved) { UI.pan.tx = start.p.tx + dx; UI.pan.ty = start.p.ty + dy; applyPan(); UI.userPan = Date.now(); } }
    else if (ids.length >= 2) { var p0 = start.pts[ids[0]], p1 = start.pts[ids[1]]; if (!p0 || !p1) { start = { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) }; return; } var q0 = pts[ids[0]], q1 = pts[ids[1]];
      var d0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, d1 = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]), z = Math.max(0.3, Math.min(2.6, start.p.z * d1 / d0)), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, nx = (q0[0] + q1[0]) / 2, ny = (q0[1] + q1[1]) / 2;
      UI.pan = { z: z, tx: nx - (mx - start.p.tx) * z / start.p.z, ty: ny - (my - start.p.ty) * z / start.p.z }; applyPan(); moved = true; UI.userPan = Date.now(); }
  });
  function up(e) { if (e.pointerId in pts) { delete pts[e.pointerId]; start = Object.keys(pts).length ? { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) } : start; if (!Object.keys(pts).length) setTimeout(function () { start = null; }, 0); } }
  document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  document.addEventListener('wheel', function (e) { if (!e.target.closest || !e.target.closest('#map')) return; e.preventDefault(); var p = svgXY(e); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p[0], p[1]); UI.userPan = Date.now(); }, { passive: false });
  // G5: a listener on the map itself marks it tappable, so the browser's touch adjustment never moves a tap near the top chips onto them
  var mp = $('#map'); if (mp) mp.addEventListener('click', function () { });
  document.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('#map'); if (!m) return; if (moved) { moved = false; return; }
    var hx = e.target.closest('[data-c]'); if (!hx) return; onCell(hx.getAttribute('data-c'), hx.classList.contains('spot'));
  });
})();
// ---------------------------------------------------------------- rendering
function drawMap() {
  if (!G) return; var s = G.seats[UI.view], env = s.env, mine = myTurn(), out = '';
  var lit = UI.lit && UI.lit.until > Date.now() ? UI.lit.cells : [];
  if (UI.whyA) { var wi = {}; WM.scoreAnimal(env, UI.whyA, wi, G.cards && G.cards[UI.whyA]); lit = lit.concat(wi.lit || []); }   // the card's scoring groups stay lit while its why is open
  var hon = hintsOn(), pv = mine && hon ? pvNow() : null, pvl = pv ? pv.lit : [], brk = pv && pv.broke || [], bad = '';
  var an1 = UI.anim && UI.anim.until > Date.now() ? UI.anim : null;
  var keys = Object.keys(env).sort(function (a, b) { return WM.pk(a)[1] - WM.pk(b)[1]; });
  keys.forEach(function (c) {
    var x = env[c], p = pix(c), tgt = mine && G.stage === 'tok' && !x.tok && x.a.indexOf(G.hold.tok) >= 0, isLast = G.last && G.last.seat === UI.view && (G.last.tile === c);
    if (tgt && hon) { var tv = pvTok(env, c, G.hold.tok).d; bad += pvBadge(p[0] + SZ * 0.5, p[1] - SZ * 0.55, tv, c); }
    out += '<g class="hx' + (tgt ? ' tgt' : '') + (lit.indexOf(c) >= 0 ? ' lit' : '') + (pvl.indexOf(c) >= 0 ? ' pvlit' : '') + (brk.indexOf(c) >= 0 ? ' pvbrk' : '') + (isLast ? ' last' : '') + (an1 && an1.c === c && an1.k === 'drop' ? ' drop' : '') + '" data-c="' + c + '">' + tileSvg(x, p[0], p[1], SZ - 1, x.rot, { tok: x.tok, map: 1, hop: an1 && an1.c === c && an1.k === 'hop' }) + (tgt ? '<polygon class="ring" points="' + poly(p[0], p[1], SZ - 4, [0, 1, 2, 3, 4, 5]) + '"/>' : '') + '</g>';
  });
  if (mine && G.stage === 'tile') {
    WM.spots(env).forEach(function (c) { if (UI.ghost && UI.ghost.c === c) return; var p = pix(c); out += '<polygon class="spot' + (UI.hov === c ? ' hov' : '') + '" data-c="' + c + '" points="' + poly(p[0], p[1], SZ - 1, [0, 1, 2, 3, 4, 5]) + '"/>'; if (hon) bad += pvBadge(p[0], p[1], pvSpotBest(env, c), c, 1); });
    if (UI.ghost) { var p = pix(UI.ghost.c); out += '<g class="ghost" data-c="' + UI.ghost.c + '">' + tileSvg(G.hold.tile, p[0], p[1], SZ - 1, UI.ghost.rot) + '<polygon class="gring" points="' + poly(p[0], p[1], SZ + 2, [0, 1, 2, 3, 4, 5]) + '"/></g>'; }
  }
  var wh = boardWH();
  pvl.forEach(function (c) { var q = pix(c); bad = '<polygon class="pvring" points="' + poly(q[0], q[1], SZ - 3, [0, 1, 2, 3, 4, 5]) + '"/>' + bad; });
  brk.forEach(function (c) { var q = pix(c); bad = '<polygon class="pvring brk" points="' + poly(q[0], q[1], SZ - 3, [0, 1, 2, 3, 4, 5]) + '"/>' + bad; });
  if (UI.ghost && mine && hon && G.stage === 'tile') { var gp = pix(UI.ghost.c); bad += pvBadge(gp[0], gp[1] - SZ * 0.62, pv ? pv.d : 0, UI.ghost.c, 0, 1); }
  $('#map').innerHTML = terrainDefs() + '<rect class="bgr" x="0" y="0" width="' + wh[0] + '" height="' + wh[1] + '" fill="transparent"/><g id="vp">' + out + '<g class="pvbs">' + bad + '</g></g>';
  pvStrip(pv);
  $('#map').setAttribute('viewBox', '0 0 ' + wh[0] + ' ' + wh[1]); applyPan();
  $('#map').classList.toggle('dimtok', mine && G.stage === 'tok' && WM.tokSpots(env, G.hold.tok).length > 0);
  if (UI.tut && typeof tutDraw === 'function') tutDraw();   // the guided tutorial's glow survives map-only redraws
}
function mkTile(t, s) { var w = s * SQ3, h = s * 2; return '<svg viewBox="' + (-w / 2 - 2) + ' ' + (-h / 2 - 2) + ' ' + (w + 4) + ' ' + (h + 4) + '" aria-hidden="true">' + terrainDefs() + tileSvg(t, 0, 0, s, t.t.length > 1 ? 1 : 0, { big: 1 }) + '</svg>'; }
// pattern picture for an animal card (first set only): a small hex cluster showing a scoring shape, tokens drawn as on the map
var PAT = {
  bear: [[0, 0, 'bear'], [1, 0, 'bear'], [-1, 1, 0], [0, 1, 0], [2, -1, 0], [1, -1, 0]],
  elk: [[-1, 0, 'elk'], [0, 0, 'elk'], [1, 0, 'elk'], [-1, 1, 0], [0, -1, 0], [1, -1, 0]],
  salmon: [[-1, 0, 'salmon'], [0, 0, 'salmon'], [0, 1, 'salmon'], [1, 1, 'salmon'], [1, -1, 0], [-1, 1, 0]],
  hawk: [[-1, 0, 'hawk'], [1, -1, 'hawk'], [0, 1, 'hawk'], [0, 0, 0], [1, 0, 0], [-1, 1, 0]],
  fox: [[0, 0, 'fox'], [1, 0, 'bear'], [0, -1, 'elk'], [-1, 1, 'salmon'], [-1, 0, 0], [1, -1, 0], [0, 1, 0]]
};
function patSvg(a) {
  if (cset(a) !== 'a' || !PAT[a]) return '';
  var s = 13, out = '', xs = [], ys = [];
  PAT[a].forEach(function (c) { var x = s * SQ3 * (c[0] + c[1] / 2), y = s * 1.5 * c[1]; xs.push(x); ys.push(y);
    out += '<polygon points="' + poly(x, y, s - 0.6, [0, 1, 2, 3, 4, 5]) + '" fill="' + (c[2] ? 'rgba(243,234,210,.9)' : 'rgba(120,140,110,.22)') + '" stroke="rgba(20,30,20,.55)" stroke-width="1"/>';
    if (c[2]) out += tokenSvg(c[2], x, y, s * 0.62); });
  var x0 = Math.min.apply(null, xs) - s, x1 = Math.max.apply(null, xs) + s, y0 = Math.min.apply(null, ys) - s, y1 = Math.max.apply(null, ys) + s;
  return '<svg class="pat" viewBox="' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + (x1 - x0).toFixed(1) + ' ' + (y1 - y0).toFixed(1) + '" role="img" aria-label="Example: a scoring ' + esc(cinfo(a).title) + ' shape">' + out + '</svg>';
}
function mkTok(a) { return '<svg viewBox="-12 -12 24 24" aria-hidden="true">' + tokenSvg(a, 0, 0, 11) + '</svg>'; }
function cset(a) { return G && G.cards && G.cards[a] || 'a'; }
function cinfo(a) { return WM.cardInfo ? WM.cardInfo(a, cset(a)) : WM.CARDS[a]; }
function tileName(t) { return t.t.map(function (x) { return WM.TER_NAME[x]; }).join(' and ') + ' tile' + (t.key ? ' (keystone)' : '') + ', accepts ' + t.a.map(function (a) { return WM.ANI_NAME[a]; }).join(', '); }
function renderDock() {
  var swap = myTurn() && G.stage === 'tile' && !!UI.undo && !UI.free && !UI.wipe, mk = $('#mk'), mine = myTurn() && G.stage === 'pick' || swap, s = G.seats[G.cur], h = '', gv = mine && !UI.wipe && hintsOn() ? pvMarket() : null, gb = gv ? pvBestCol(gv) : -1;
  for (var i = 0; i < 4; i++) {
    var t = G.market.tiles[i], k = G.market.toks[i], fr = UI.free, sel = fr && (fr.ti === i), selk = fr && fr.ki === i, w = UI.wipe && UI.wipe.indexOf(i) >= 0;
    h += '<div class="pair' + (mine && !UI.free && !UI.wipe ? ' live' : '') + (gv && i === gb && !UI.free ? ' top' : '') + '" data-i="' + i + '">';
    if (gv && gv[i] != null && !UI.free) h += '<span class="gain' + (i === gb ? ' best' : gv[i] === 0 ? ' nil' : '') + '" title="Points this pair can add right now">' + (gv[i] > 0 ? 'up to +' + gv[i] : 'no points') + '</span>';
    h += t ? '<button type="button" class="mt' + (sel ? ' sel' : '') + '" data-i="' + i + '" aria-label="' + esc(tileName(t)) + '"' + (mine && !UI.wipe ? '' : ' disabled') + '>' + mkTile(t, 30) + '</button>' : swap && G.hold && G.hold.ti === i ? '<button type="button" class="mt gone back" data-i="' + i + '" aria-label="Put the tile back">' + mkTile(G.hold.tile, 30) + '</button>' : '<span class="mt gone"></span>';
    h += k ? '<button type="button" class="mk' + (selk ? ' sel' : '') + (w ? ' wsel' : '') + '" data-i="' + i + '" aria-label="' + esc(WM.ANI_NAME[k]) + ' token"' + (mine ? '' : ' disabled') + '>' + mkTok(k) + '<i>' + esc(WM.ANI_NAME[k]) + '</i></button>' : swap && G.hold && G.hold.ki === i ? '<button type="button" class="mk gone back" data-i="' + i + '" aria-label="Put the animal back">' + mkTok(G.hold.tok) + '<i>Put back</i></button>' : '<span class="mk gone"></span>';
    h += '</div>';
  }
  mk.innerHTML = h;
  // actions
  var a = '', me = G.seats[G.cur];
  if (myTurn()) {
    if (G.stage === 'pick') {
      if (UI.wipe) a += '<button type="button" class="ab pri" id="wokB"' + (UI.wipe.length ? '' : ' disabled') + '>Replace ' + UI.wipe.length + '</button><button type="button" class="ab" id="cancelB">Cancel</button>';
      else if (UI.free) a += '<span class="hint1">Any tile, then any token</span><button type="button" class="ab" id="cancelB">Cancel</button>';
      else {
        if (!G.used3 && !G.opts.no3 && WM.triple(G)) a += '<button type="button" class="ab" id="w3B">Sweep 3 ' + esc(WM.ANI_NAME[WM.triple(G)]) + '</button>';
        if (me.acorns > 0) a += UI.acornMenu ? '<button type="button" class="ab" id="freeB">Free pick</button><button type="button" class="ab" id="wipeB">Replace animals</button><button type="button" class="ab" id="acornX">Cancel</button>' : '<button type="button" class="ab" id="acornB">Use acorn (' + me.acorns + ')</button>';
      }
    } else if (G.stage === 'tile') {
      a += '<span class="held">' + mkTile(G.hold.tile, 24) + mkTok(G.hold.tok) + '</span>';
      if (UI.ghost) { if (G.hold.tile.t.length > 1) a += '<button type="button" class="ab" id="rotB" aria-label="Turn the tile">&#8635; Turn</button>'; a += '<button type="button" class="ab pri" id="okB">Place</button>'; }
      if (UI.undo) a += '<button type="button" class="ab" id="undoB">Back</button>';
    } else if (G.stage === 'tok') {
      a += '<span class="held">' + mkTok(G.hold.tok) + '</span><button type="button" class="ab" id="backB">Return token</button>';
    }
  }
  if (G.stage !== 'pick') UI.acornMenu = false;
  if (myTurn() && hintsOn() && UI.mode !== 'tutorial' && UI.mode !== 'coach' && !UI.wipe && !UI.free && !UI.acornMenu && !(G.stage === 'tile' && UI.ghost)) a += '<button type="button" class="ab whatB" id="whatB">What should I do?</button>';
  $('#acts').innerHTML = a;
  $('#acorn').innerHTML = '<button type="button" class="acn" id="acornCt" aria-label="Acorns: ' + G.seats[UI.view].acorns + '. Tap for what they do">' + mkTok('acorn') + '<b>' + G.seats[UI.view].acorns + '</b></button>';
}
function lineText() {
  if (!G) return '';
  if (G.over) return 'Season over';
  if (UI.showAI && UI.view === UI.showAI.seat) return UI.showAI.text;
  var s = G.seats[G.cur];
  if (UI.view !== G.cur && !s.ai) return (UI.view === meSeat() ? 'Your valley' : G.seats[UI.view].name + "'s valley") + ': tap ' + (G.cur === meSeat() ? 'You' : G.seats[G.cur].name) + ' to go back to the turn';
  if (UI.view !== meSeat() && !myTurn()) return G.seats[UI.view].name + "'s valley. Tap You to return";
  if (s.ai) return s.name + ' is choosing';
  if (G.stage === 'pick') return UI.wipe ? 'Tap the animals to replace, then Replace' : UI.free ? (UI.free.ti == null ? 'Acorn: pick any tile' : 'Now pick any animal') : 'Step 1 of 3: drag or tap a tile + animal pair';
  if (G.stage === 'tile') return UI.ghost ? (G.hold && G.hold.tile && G.hold.tile.t.length > 1 ? 'Step 2 of 3: turn it if you like, then Place' : 'Step 2 of 3: tap Place to put it here') : 'Step 2 of 3: tap a glowing spot for the tile';
  if (G.stage === 'tok') return WM.tokSpots(s.env, G.hold.tok).length ? 'Step 3 of 3: tap a glowing tile for the ' + WM.ANI_NAME[G.hold.tok] : 'Step 3 of 3: no tile takes a ' + WM.ANI_NAME[G.hold.tok] + ': tap Return';
  return '';
}
// first-game coach: one extra plain line per step for the player's first 3 Quick-game turns, then it switches itself off
var COACH = { pick: 'Each column is one choice: the tile on top and the animal under it come together.', tile: 'Tiles must touch your valley. Matching edges join terrain: 1 point per joined tile.', tok: 'Animals score by their card (the chips on top). A tile shows which animals it accepts.' };
function coachText() { return hintsOn() && G && !G.over && UI.mode === 'quick' && myTurn() && (UI.prefs.coachN || 0) < 3 && !UI.wipe && !UI.free ? COACH[G.stage] || '' : ''; }
function rivalOf(i) { var b = -1, fin = G.over ? G.res : WM.final(G); G.seats.forEach(function (s, j) { if (j !== i && (b < 0 || fin[j].total > fin[b].total)) b = j; }); return b; }
function renderTop() {
  var me = G.seats[UI.view], fin = G.over ? G.res : WM.final(G), sc = fin[UI.view], h = '';   // one honest score: live totals include the habitat bonuses (as the Scores drawer and result)
  var ri = rivalOf(UI.view), rv = ri >= 0 ? fin[ri] : null;
  function vs(m, r) { return r == null ? '' : '<span class="rv' + (r > m ? ' lead' : '') + '" aria-hidden="true">' + r + '</span>'; }
  function cls(m, r) { return r != null && m > r ? ' ahead' : r != null && r > m ? ' behind' : ''; }
  WM.ANI.forEach(function (a) { var r = rv ? rv.ani[a] : null; h += '<button type="button" class="cc' + cls(sc.ani[a], r) + '" data-card="' + a + '" aria-label="' + esc(WM.ANI_NAME[a] + ': ' + cinfo(a).title) + ' card, you ' + sc.ani[a] + (rv ? ', ' + G.seats[ri].name + ' ' + r : '') + ' points"><span class="ccr">' + mkTok(a) + '<b>' + sc.ani[a] + '</b>' + vs(sc.ani[a], r) + '</span><i>' + esc(WM.ANI_NAME[a]) + '</i></button>'; });
  $('#cards').innerHTML = h;
  var th = '';
  WM.TER.forEach(function (t) { var m = sc.hab[t], r = rv ? rv.hab[t] : null; th += '<span class="tc' + cls(m, r) + '" title="' + esc('Largest ' + WM.TER_NAME[t].toLowerCase() + ' area: you ' + m + (rv ? ', ' + G.seats[ri].name + ' ' + r : '')) + '"><i class="ti" data-art="ter-' + t + '" style="background-color:' + WM.TER_COL[t] + '" aria-hidden="true"></i><b>' + m + '</b>' + (rv ? '<i class="sep" aria-hidden="true">&middot;</i>' : '') + vs(m, r) + '</span>'; });
  var sh = '';
  if (G.np > 1) G.seats.forEach(function (s, i) { var t = fin[i].total; sh += '<button type="button" class="seat' + (i === UI.view ? ' on' : '') + (i === G.cur ? ' cur' : '') + '" data-seat="' + i + '"><i class="dot' + (i === UI.view ? ' me' : i === rivalOf(UI.view) ? ' riv' : '') + '" aria-hidden="true"></i>' + esc(s.name) + ' <b>' + t + '</b></button>'; });
  $('#seats').innerHTML = sh; $('#seats').hidden = G.np < 2;
  var tr = $('#terr'); if (!tr) { tr = document.createElement('button'); tr.type = 'button'; tr.id = 'terr'; tr.className = 'terr'; tr.setAttribute('data-gx', 'scored'); $('#board').appendChild(tr); }
  tr.classList.toggle('solo', G.np < 2);
  tr.setAttribute('aria-label', 'Largest area of each terrain' + (rv ? ', you vs ' + G.seats[ri].name : '') + ': open the score sheet');
  tr.innerHTML = '<span class="tl">Largest area' + (rv ? '<small><b class="me">' + (UI.view === meSeat() ? 'you' : esc(G.seats[UI.view].name)) + '</b> &middot; <b class="riv">' + (ri === meSeat() ? 'you' : esc(G.seats[ri].name)) + '</b></small>' : '') + '</span>' + th;
  var turn = Math.min(G.turns, G.seats[G.cur].done + 1);
  $('#barstat').innerHTML = '<span class="pill">Turn <b>' + turn + '/' + G.turns + '</b></span>' + (G.np > 1 ? '' : '<span class="pill">Score <b>' + sc.total + '</b></span>');
  var lt = lineText(), sm = /^Step (\d) of 3: (.*)$/.exec(lt), co = coachText();
  $('#line').innerHTML = sm ? '<b class="stepn" aria-label="Step ' + sm[1] + ' of 3">' + sm[1] + '<small>/3</small></b><span class="stept">' + esc(sm[2].charAt(0).toUpperCase() + sm[2].slice(1)) + (co ? '<span class="coach">' + esc(co) + '</span>' : '') + '</span>' : esc(lt);
  var te = $('#toast'); if (te && te.classList.contains('on')) toastPlace(te);   // the step bar may have grown: keep the toast above it
  var lp = $('#logp'); if (lp) lp.innerHTML = '<h3>Season log</h3><ol>' + G.log.slice(-8).reverse().map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
}
function render() {
  if (!G) return;
  hintsSync(); renderDock(); renderTop(); drawMap(); cardWhyRender();
  if (window.GXH && GXH.phase) try { GXH.phase(window.GXT && GXT.running() || UI.mode === 'quick' || UI.mode === 'coach' ? null : myTurn() ? (G.stage === 'pick' && G.seats[G.cur].acorns > 0 && !UI.prefs.seenAcorn ? 'acorn' : G.stage) : null); } catch (e) { }
  artApply();
  if (typeof coachCheck === 'function') coachCheck();
}
UI.redraw = function () { if (G) render(); };
// ---------------------------------------------------------------- drawers: scores, rules, cards
function scoresHTML() {   // every source with its why, you vs the rivals (also the end screen's walk-through)
  var sc = G.over ? G.res : WM.final(G), h = '<table class="st why"><tr><th>Source</th>' + G.seats.map(function (s, i) { return '<th>' + esc(i === meSeat() ? 'You' : s.name) + '</th>'; }).join('') + '</tr>';
  var best = function (vals) { var m = Math.max.apply(null, vals); return function (v) { return v === m && vals.filter(function (x) { return x === m; }).length < vals.length ? ' best' : ''; }; };
  var cell = function (cls, v, why) { return '<td class="n' + cls + '"><b>' + v + '</b><small>' + esc(why) + '</small></td>'; };
  WM.ANI.forEach(function (a) { var bf = best(sc.map(function (x) { return x.ani[a]; }));
    h += '<tr><td class="src">' + mkTok(a) + '<span>' + esc(WM.ANI_NAME[a]) + '<small>' + esc(pvSetA(a) ? PV_TABLE[a] : cinfo(a).rule) + '</small></span></td>' + sc.map(function (x, i) { return cell(bf(x.ani[a]), x.ani[a], pvDesc(G.seats[i].env, a).text); }).join('') + '</tr>'; });
  WM.TER.forEach(function (t) { var bt = best(sc.map(function (x) { return x.hab[t] + (x.bonus[t] || 0); }));
    h += '<tr><td class="src"><i class="sw" style="background:' + WM.TER_COL[t] + '"></i><span>' + WM.TER_NAME[t] + '<small>1 point per tile in your largest joined area</small></span></td>' + sc.map(function (x) { var b = x.bonus[t] || 0; return cell(bt(x.hab[t] + b), x.hab[t] + b, 'largest area ' + x.hab[t] + (b ? ' + bonus ' + b + (G.solo ? ' (7 or more)' : ' (biggest' + (b === 1 && G.np === 2 ? ', tied' : '') + ')') : '')); }).join('') + '</tr>'; });
  h += '<tr><td class="src"><span>Acorns<small>1 point each at the end</small></span></td>' + sc.map(function (x) { return cell('', x.acorns, pvPl(x.acorns, 'acorn', 'acorns') + ' kept'); }).join('') + '</tr>';
  h += '<tr class="tot"><td>Total</td>' + sc.map(function (x) { return '<td><b>' + x.total + '</b><small>animals ' + x.aniT + ' + land ' + (x.habT + x.bonusT) + ' + acorns ' + x.acorns + '</small></td>'; }).join('') + '</tr></table>';
  return h + '<p class="note">' + (G.solo ? 'Solo: a terrain area of 7 or more tiles earns 2 extra points.' : 'Bonus: the biggest area of a terrain earns ' + (G.np === 2 ? '+2 (a tie +1 each)' : '+3 first, +1 second') + '.') + '</p>';
}
function cardsHTML() {
  var h = '<div class="cards">';
  WM.ANI.forEach(function (a) { var C = cinfo(a), st = cset(a); var mine = G ? (G.over ? G.res : WM.final(G))[meSeat()].ani[a] : null; h += '<div class="card"><div class="cart" data-art="card-' + a + '-' + st + '">' + mkTok(a) + '</div><div><h3>' + esc(WM.ANI_NAME[a]) + ': ' + esc(C.title) + (mine != null ? ' <span class="minep">you: ' + mine + '</span>' : '') + '</h3><p>' + esc(C.rule) + '</p>' + patSvg(a) + '<p class="pts">' + (C.pts ? C.pts.slice(1).map(function (p, i) { return (i + 1) + (i + 2 === C.pts.length ? '+' : '') + ': ' + p; }).join(' &middot; ') : a === 'fox' && st === 'a' ? '0 to 5 per fox' : 'Card ' + st.toUpperCase()) + '</p></div></div>'; });
  return h + '</div>';
}
var RULES_HTML = '<div class="howturn"><h3>How a turn works</h3><ol><li>Pick one tile and the animal under it.</li><li>Tap a glowing spot to add the tile to your valley.</li><li>Put the animal on a tile that shows it (or return it).</li><li>Animals score by their card; joined terrain scores too.</li><li>After 20 turns the most points wins.</li></ol></div>' +
  '<h3>Keystones and acorns</h3><p>Keystone tiles (gold rim) have one terrain. An animal on a keystone earns an acorn. Spend an acorn to take any tile with any token, or to replace any tokens in the market. Each acorn left is 1 point at the end.</p>' +
  '<h3>Crowded market</h3><p>Four matching tokens are replaced at once. With three matching tokens you may replace those three once per turn, for free.</p>' +
  '<h3>Scoring</h3><p>Each animal scores by its card (below). Each terrain scores 1 point per tile in your largest connected habitat of it (edges must match). The largest habitat of each terrain earns a bonus: 2 players 2 (tie 1), 3-4 players 3 for first and 1 for second. Solo: 2 for a habitat of 7+.</p>' +
  '<h3>Solo</h3><p>After each turn the tile and the animal furthest from the stacks (rightmost) leave the game; the rest slide left toward the stacks and new ones fill in at the right.</p>' +
  '<h3>Ties</h3><p>Most acorns left wins a tie.</p>' +
  '<h3>Simplified on purpose</h3><ul><li>The animals on each tile and the starting tiles are our own balanced set.</li><li>Elk lines are counted longest first (rarely a point less than the best split).</li><li>Variant cards (B, C, D) use our own house tables and are off unless you switch them on.</li></ul>';
// ---------------------------------------------------------------- large view: tap a placed tile (when it is not a target) or hold a market tile/token
function tileText(t, tok) {
  var h = '<p><b>' + t.t.map(function (x) { return WM.TER_NAME[x]; }).join(' and ') + '</b> tile' + (t.key ? ', a <b>keystone</b>: an animal placed here earns an acorn.' : (t.t.length > 1 ? '. Each half counts for its own terrain; edges must match to join a habitat.' : '.')) + '</p>';
  h += '<p>Accepts: ' + t.a.map(function (a) { return WM.ANI_NAME[a]; }).join(', ') + '.</p>';
  if (tok) h += '<p>Home to a <b>' + WM.ANI_NAME[tok] + '</b> (' + esc(cinfo(tok).title) + ': ' + esc(cinfo(tok).rule) + ')</p>';
  return h;
}
function showBig(kind, obj, tok) {
  var body = document.createElement('div'); body.className = 'bigv';
  if (kind === 'tile') body.innerHTML = '<div class="bigpic">' + mkTile(obj, 60) + '</div>' + tileText(obj, tok);
  else { var C = cinfo(obj); body.innerHTML = '<div class="bigpic">' + mkTok(obj) + '</div><h3>' + esc(WM.ANI_NAME[obj]) + ' token</h3><p>Scores by <b>' + esc(C.title) + '</b>: ' + esc(C.rule) + '</p>' + patSvg(obj) + '<p class="pts">' + (C.pts ? C.pts.slice(1).map(function (p, i) { return (i + 1) + (i + 2 === C.pts.length ? '+' : '') + ': ' + p; }).join(' &middot; ') : obj === 'fox' && cset(obj) === 'a' ? '0 to 5 per fox' : 'Card ' + cset(obj).toUpperCase()) + '</p>'; }
  GX.drawer('bigd', kind === 'tile' ? 'Habitat tile' : 'Animal token', body, false); GX.show('bigd');
}
(function wireDrag() {   // drag a market column onto the valley: it lifts, snaps to the nearest glowing spot, and drops there (tap still works)
  var d = null, eatUntil = 0, LIFT = 30;
  function spotAt(x, y) {
    if (!G || G.stage !== 'tile') return null;
    var r = $('#board').getBoundingClientRect(); if (y > r.bottom + 10) return null;
    var bx = x - r.left, by = y - r.top, z = UI.pan, best = null, bd = 1e9;
    WM.spots(G.seats[G.cur].env).forEach(function (c) { var p = pix(c), dx = p[0] * z.z + z.tx - bx, dy = p[1] * z.z + z.ty - by, dd = Math.sqrt(dx * dx + dy * dy); if (dd < bd) { bd = dd; best = c; } });
    return bd < SZ * z.z * 1.35 ? best : null;
  }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('#mk .pair.live .mt, #mk .pair.live .mk');
    if (!b || !myTurn() || G.stage !== 'pick' || UI.wipe || UI.free || !G.market.tiles[+b.dataset.i]) return;
    d = UI.drag = { i: +b.dataset.i, kind: b.classList.contains('mt') ? 't' : 'k', x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
  });
  document.addEventListener('pointermove', function (e) {
    if (!d || e.pointerId !== d.id) return;
    if (!d.on) {
      if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 14) return;
      d.on = true; eatUntil = Date.now() + 1e6; onMarket(d.kind, d.i);
      if (!G || G.stage !== 'tile' || !G.hold) { d = UI.drag = null; eatUntil = Date.now() + 400; return; }
      var f = document.createElement('div'); f.id = 'dragt'; f.innerHTML = mkTile(G.hold.tile, 30); document.body.appendChild(f); d.f = f;
    }
    if (e.cancelable) e.preventDefault();
    var c = spotAt(e.clientX, e.clientY - LIFT), z = UI.pan;
    if (c) { var r = $('#board').getBoundingClientRect(), p = pix(c); d.f.style.left = (r.left + p[0] * z.z + z.tx) + 'px'; d.f.style.top = (r.top + p[1] * z.z + z.ty) + 'px'; }
    else { d.f.style.left = e.clientX + 'px'; d.f.style.top = (e.clientY - LIFT) + 'px'; }
    d.f.classList.toggle('snap', !!c);
    if (c !== UI.hov) { UI.hov = c; if (c) sfx('tap'); drawMap(); }
  }, { passive: false });
  function end(e) {
    if (!d || e.pointerId !== d.id) return; var D = d; d = UI.drag = null; if (!D.on) return;
    eatUntil = Date.now() + 80; var c = e.type === 'pointerup' ? spotAt(e.clientX, e.clientY - LIFT) : null; if (D.f && D.f.parentNode) D.f.parentNode.removeChild(D.f); UI.hov = null;
    if (c && G && G.stage === 'tile') onCell(c, true); else if (G) render();
  }
  document.addEventListener('pointerup', end, true); document.addEventListener('pointercancel', end, true);
  document.addEventListener('click', function (e) { if (Date.now() < eatUntil) { eatUntil = 0; e.stopImmediatePropagation(); e.preventDefault(); } }, true);   // only the one click the drag gesture itself makes
})();
(function wireHold() {
  var t = null, held = false, sx = 0, sy = 0;
  document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('#mk .mt, #mk .mk'); if (!b || !G) return; held = false; clearTimeout(t); sx = e.clientX; sy = e.clientY;
    t = setTimeout(function () { if (UI.drag && UI.drag.on) return; var i = +b.dataset.i; held = true; if (b.classList.contains('mt')) { if (G.market.tiles[i]) showBig('tile', G.market.tiles[i]); } else if (G.market.toks[i]) showBig('tok', G.market.toks[i]); }, 520); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { document.addEventListener(ev, function () { clearTimeout(t); }, true); });
  document.addEventListener('pointermove', function (e) { if ((UI.drag && UI.drag.on) || Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 10) clearTimeout(t); }, true);   // a drag is not a long press
  document.addEventListener('click', function (e) { if (held && e.target.closest && e.target.closest('#mk')) { held = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('#mk')) e.preventDefault(); });
})();
// ---------------------------------------------------------------- result
function whyLine(sc, me) {   // one short line: why you won or lost (the biggest gap between you and the best rival)
  if (G.solo || sc.length < 2) return '';
  var riv = -1; sc.forEach(function (x, i) { if (i !== me && (riv < 0 || x.total > sc[riv].total)) riv = i; });
  var a = sc[me], b = sc[riv], nm = G.seats[riv].name, parts = [
    { k: 'animals', d: a.aniT - b.aniT, t: 'animal cards ' + a.aniT + ' vs ' + b.aniT },
    { k: 'habitats', d: a.habT - b.habT, t: 'habitats ' + a.habT + ' vs ' + b.habT },
    { k: 'bonus', d: a.bonusT - b.bonusT, t: 'habitat bonuses +' + a.bonusT + ' vs +' + b.bonusT },
    { k: 'acorns', d: a.acorns - b.acorns, t: 'acorns ' + a.acorns + ' vs ' + b.acorns }];
  var win = a.total >= b.total; parts.sort(function (x, y) { return win ? y.d - x.d : x.d - y.d; });
  var p = parts[0]; if (!p.d) return '<p class="why">Neck and neck with ' + esc(nm) + ' in every column.</p>';
  return '<p class="why">' + (win ? 'You beat ' + esc(nm) + ' most on ' : esc(nm) + ' beat you most on ') + p.t + ' (you first).</p>';
}
function standHTML(sc, me) {   // final totals up top, winner first
  var ord = sc.map(function (x, i) { return i; }).sort(function (a, b) { return (sc[b].total * 100 + sc[b].acorns) - (sc[a].total * 100 + sc[a].acorns); });
  return '<ol class="stand">' + ord.map(function (i, r) { return '<li class="' + (r === 0 && G.winner !== -2 ? 'w' : '') + (i === me ? ' me' : '') + '"><span>' + esc(i === me ? 'You' : G.seats[i].name) + '</span><b>' + sc[i].total + '</b></li>'; }).join('') + '</ol>';
}
function showResult() {
  if (!G || !G.over || UI.resultShown === G.seed + ':' + G.logN) return; UI.resultShown = G.seed + ':' + G.logN;
  sfx('end'); save(); musicSync(); $('#toast').classList.remove('on');
  var sc = G.res, me = 0, title;
  if (G.solo) { var best = UI.prefs.best || 0; title = 'You scored ' + sc[0].total + (UI.mode === 'quick' && sc[0].total > best ? ': new best!' : best ? ' (best ' + best + ')' : ''); if (UI.mode === 'quick' && sc[0].total > best) { UI.prefs.best = sc[0].total; savePrefs(); } } else if (G.winner === -2) title = 'A shared win'; else title = (G.winner === me && UI.humans === 1 ? 'You win!' : G.seats[G.winner].name + ' wins!');
  var rs = $('#rs'); rs.hidden = false;
  var camp = UI.mode === 'camp' && window.GXC && GXC.active();
  rs.innerHTML = '<div class="rbox" data-art="' + (G.winner === 0 || G.solo ? 'result-win' : 'result-lose') + '"><h2 class="rbig">' + esc(title) + '</h2>' + standHTML(sc, me) + quickLine() + (typeof coachFinalHTML === 'function' ? coachFinalHTML() : '') + whyLine(sc, me) + '<div class="rbtn">' + (camp ? '<button type="button" class="big" id="campCont">Continue</button>' : '<button type="button" class="big" id="againB">Play again</button><button type="button" class="ab" id="titleB">Title</button>') + '</div>' + scoresHTML() + '</div>';
  try { if (!camp && window.GNS && GNS.result) GNS.result({ game: 'wildmark', mode: UI.mode === 'tutorial' || UI.mode === 'coach' ? 'tutorial' : G.solo ? 'solo' : 'vs', seats: G.seats.map(function (s, i) { return { name: s.name, me: i === 0, ai: s.ai || undefined }; }), winner: G.winner, scores: sc.map(function (x) { return x.total; }), turns: G.turns }); } catch (e) { }
  if (typeof coachEnd === 'function') coachEnd();
}
// ---------------------------------------------------------------- title + setup
function showTitle() {
  clearTimeout(UI.aiT); UI.mode = 'quick'; UI.camp = null; try { GX.close(); } catch (e) { } $('#rs').hidden = true; $('#pass').hidden = true;
  var st = $('#start'), sv = loadSave(), c = UI.setup || (UI.setup = { opp: 1, ai: 'gentle', humans: 1 });
  st.hidden = false; st.classList.toggle('front', UI.sv !== 'setup'); document.documentElement.classList.add('wm-title');
  if (UI.sv === 'setup') {
    var seg = function (id, list, cur) { return '<div class="seg" data-k="' + id + '">' + list.map(function (o) { return '<button type="button" class="sg' + (o[0] === cur ? ' on' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    st.innerHTML = '<div class="tbox"><h1 class="logo">Wildmark</h1><div class="lbl">Rival rangers</div>' + seg('opp', [[0, 'Solo'], [1, '1'], [2, '2'], [3, '3']], c.opp) +
      '<div class="lbl">Rival skill</div>' + seg('ai', [['gentle', 'Gentle'], ['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], c.ai) +
      '<div class="lbl">Players on this device</div>' + seg('humans', [[1, '1'], [2, '2'], [3, '3'], [4, '4']], c.humans) +
      '<div class="lbl">Variant cards (house tables)</div>' + seg('cards', [['a', 'Off'], ['mix', 'On']], c.cards || 'a') +
      '<p class="sum">' + esc(setupSum(c)) + '</p><button type="button" class="big" id="goB">Start</button><button type="button" class="ab" id="backT">Back</button></div>';
    return;
  }
  var p = window.GXC ? GXC.progress() : null, n = p && window.CAMPAIGN ? CAMPAIGN.chapters.filter(function (x) { return p.ch[x.id] && p.ch[x.id].beaten; }).length : 0;
  var tb = c.opp + c.humans < 2 ? 1 : c.opp + c.humans;   // "Table for": 1 = solo, 2-4 = you + rivals
  st.innerHTML = TITLE_SCENE + '<div class="ttop"><div class="tlogo" data-art="icon-logo" aria-hidden="true"><span class="crest">' + mkTok('elk') + '</span></div><div><h1 class="logo">Wildmark</h1><p class="tag">Grow a wild valley. Settle its animals.</p></div></div>' +
    '<div class="tbot">' +
    (window.GXT ? GXT.menuHTML({ game: 'wildmark', first: !UI.prefs.played, cls: 'ab wide tnew', launch: function () { tutStart(); } }) : '') +
    (sv ? '<button type="button" class="ab wide tres" id="resumeB">Resume game</button>' : '') +
    '<button type="button" class="big" id="playB">Play<small>' + (tb === 1 ? 'solo: beat your best valley' : 'against ' + (tb - 1) + ' computer ranger' + (tb > 2 ? 's' : '')) + '</small></button>' +
    '<div class="tsize" role="group" aria-label="Table size"><span>Table for</span>' + [1, 2, 3, 4].map(function (k) { return '<button type="button" class="tsz' + (k === tb ? ' on' : '') + '" data-n="' + k + '" aria-pressed="' + (k === tb) + '">' + (k === 1 ? 'Solo' : k) + '</button>'; }).join('') + '</div>' +
    '<div class="trow"><button type="button" class="ab" id="quickB">More options</button><button type="button" class="ab tstory" id="storyB">Story<small>' + (n ? n + '/' + CAMPAIGN.chapters.length + ' regions' : 'Ten chapters') + '</small></button><button type="button" class="ab" id="howB">How to play</button></div></div>';
}
// code-drawn title scene (shown under the painted title picture; it is the whole scene when no picture exists): dusk valley, river, pines, a hawk
var TITLE_SCENE = '<svg class="tscene" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
  '<linearGradient id="tsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3b5a"/><stop offset=".45" stop-color="#c9875a"/><stop offset=".62" stop-color="#f1c27a"/></linearGradient>' +
  '<linearGradient id="trv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d79a"/><stop offset="1" stop-color="#5f9bb8"/></linearGradient></defs>' +
  '<rect width="390" height="760" fill="url(#tsk)"/><circle cx="270" cy="300" r="46" fill="#fbe2a6" opacity=".9"/>' +
  '<path d="M0 360 L60 290 L110 330 L170 250 L230 320 L290 270 L350 330 L390 300 V760 H0Z" fill="#6c6f8a"/>' +
  '<path d="M0 400 L70 350 L140 390 L210 340 L280 395 L340 360 L390 380 V760 H0Z" fill="#4f6a5e"/>' +
  '<path d="M0 470 Q100 420 200 455 T390 440 V760 H0Z" fill="#3c5a40"/>' +
  '<path d="M180 455 Q215 520 160 580 Q100 650 190 760 H250 Q170 650 230 585 Q285 520 215 455Z" fill="url(#trv)" opacity=".85"/>' +
  '<path d="M0 560 Q120 520 170 560 L150 760 H0Z M390 540 Q300 520 250 570 L270 760 H390Z" fill="#2c4a31"/>' +
  [[30, 520, 1.3], [62, 540, 1], [330, 505, 1.4], [362, 530, 1.1], [300, 545, .9], [95, 575, .8]].map(function (t) { return '<g transform="translate(' + t[0] + ' ' + t[1] + ') scale(' + t[2] + ')"><path d="M0 -60 L18 -18 H8 L24 12 H-24 L-8 -18 H-18Z" fill="#1d3523"/><rect x="-3" y="12" width="6" height="10" fill="#3a2a1a"/></g>'; }).join('') +
  '<path d="M120 200 q10 -8 20 0 q10 -8 20 0" fill="none" stroke="#2a2a30" stroke-width="3" stroke-linecap="round"/>' +
  '<rect width="390" height="760" fill="url(#tsk)" opacity="0" /></svg>';
function setupSum(c) { return (c.cards === 'mix' ? 'Variant cards with house point tables. ' : '') + (c.opp === 0 && c.humans === 1 ? 'Solo: 20 turns, beat your best score.' : (c.humans > 1 ? c.humans + ' players on this device' : 'You') + (c.opp ? ' vs ' + c.opp + ' ' + c.ai + ' rival' + (c.opp > 1 ? 's' : '') : '') + ', 20 turns each.'); }
// ---------------------------------------------------------------- events
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('button'); if (!t) return;
  var id = t.id;
  if (t.classList.contains('mt')) return onMarket('t', +t.dataset.i);
  if (t.classList.contains('mk')) return onMarket('k', +t.dataset.i);
  if (t.classList.contains('sg')) { var k = t.parentNode.dataset.k, v = t.dataset.v; UI.setup[k] = k === 'ai' || k === 'cards' ? v : +v; if (UI.setup.humans + UI.setup.opp > 4) UI.setup.opp = 4 - UI.setup.humans; if (UI.setup.humans + UI.setup.opp < 1) UI.setup.opp = 0; showTitle(); return; }
  if (t.classList.contains('tsz')) { UI.setup.opp = +t.dataset.n - 1; UI.setup.humans = 1; showTitle(); return; }
  if (t.classList.contains('ea')) { panTo(t.dataset.c); return; }
  if (t.classList.contains('cc')) { cardWhy(t.getAttribute('data-card')); return; }
  if (t.id === 'whatB') { var bb = document.getElementById('bulbbtn'); if (bb) bb.click(); return; }
  if (t.classList.contains('seat')) { UI.view = +t.dataset.seat; render(); fitView(); return; }
  switch (id) {
    case 'storyB': storyOpen(); break;
    case 'quickB': UI.sv = 'setup'; showTitle(); break;
    case 'backT': UI.sv = 'title'; showTitle(); break;
    case 'howB': openRules(); break;
    case 'resumeB': resume(); break;
    case 'playB': UI.setup.humans = 1; case 'goB': UI.sv = 'title'; UI.mode = 'quick'; UI.prefs.played = 1; savePrefs(); var c = UI.setup; newGame({ np: c.humans + c.opp, humans: c.humans, ai: c.ai, cards: c.cards || 'a' }); break;
    case 'againB': if (UI.mode === 'quick' && UI.cfg) newGame(Object.assign({}, UI.cfg, { seed: null })); else showTitle(); break;
    case 'titleB': UI.sv = 'title'; showTitle(); break;
    case 'campCont': $('#rs').hidden = true; try { GXC.finish(G); } catch (er) { console.error(er); } break;
    case 'passB': $('#pass').hidden = true; UI.passed = G.cur; UI.view = G.cur; fitView(true); step(); break;
    case 'w3B': if (!tutOK({ what: 'w3' })) break; WM.apply(G, { t: 'wipe3' }); sfx('wipe'); toast('Three tokens swept away.'); render(); break;
    case 'acornB': if (!tutOK({ what: 'acorn' })) break; UI.acornMenu = true; render(); break;
    case 'acornX': if (!tutOK({ what: 'acornX' })) break; UI.acornMenu = false; render(); break;
    case 'freeB': if (!tutOK({ what: 'freeB' })) break; UI.acornMenu = false; UI.free = { ti: null, ki: null }; UI.prefs.seenAcorn = 1; savePrefs(); render(); break;
    case 'wipeB': if (!tutOK({ what: 'wipeB' })) break; UI.acornMenu = false; UI.wipe = []; UI.prefs.seenAcorn = 1; savePrefs(); render(); break;
    case 'wokB': if (!UI.wipe || !UI.wipe.length || !tutOK({ what: 'wok' })) break; WM.apply(G, { t: 'wipe', idx: UI.wipe.slice() }); UI.wipe = null; sfx('wipe'); render(); break;
    case 'cancelB': if (!tutOK({ what: 'cancel' })) break; UI.free = null; UI.wipe = null; render(); break;
    case 'rotB': rotate(); break;
    case 'okB': confirmPlace(); break;
    case 'undoB': undoTake(); break;
    case 'backB': if (!tutOK({ what: 'back' })) break; act({ t: 'back' }); break;
    case 'fitB': fitView(); break;
    case 'zinB': var wh = boardWH(); zoomAt(1.25, wh[0] / 2, wh[1] / 2); break;
    case 'zoutB': var wh2 = boardWH(); zoomAt(0.8, wh2[0] / 2, wh2[1] / 2); break;
  }
});
document.addEventListener('keydown', function (e) { if (!G || !myTurn()) return; if (e.key === 'r' || e.key === 'R') rotate(); if (e.key === 'Enter' && UI.ghost) confirmPlace(); });
// tap an animal chip: its pattern, your count = points with the table, the rival's line, and your scoring groups lit on the board
function cardWhy(a) { UI.whyA = UI.whyA === a ? null : a; sfx('tap'); render(); }
function cardWhyRender() {
  var e = $('#whyp'); if (!e) { e = document.createElement('div'); e.id = 'whyp'; e.setAttribute('role', 'dialog'); e.setAttribute('aria-label', 'Why these points'); $('#board').appendChild(e); }
  var a = UI.whyA; if (!a || !G || G.over) { e.hidden = true; e.innerHTML = ''; $$('.cc.on').forEach(function (c) { c.classList.remove('on'); }); return; }
  var ri = rivalOf(UI.view), C = cinfo(a), rl = ri >= 0 ? pvCardLine(a, ri) : '';
  if (rl.indexOf(' (') > 0) rl = rl.slice(0, rl.indexOf(' ('));
  e.innerHTML = '<div class="wpat">' + (patSvg(a) || mkTok(a)) + '</div><div class="wtx"><h3>' + esc(WM.ANI_NAME[a] + ': ' + C.title) + '</h3><p>' + esc(C.rule) + '</p><p class="wl me">' + esc(pvCardLine(a, UI.view)) + '</p>' + (rl ? '<p class="wl riv">' + esc(rl) + '</p>' : '') + '<p class="wh">Lit on the board: the ' + ({ bear: 'bears', elk: 'elk', salmon: 'salmon', hawk: 'hawks', fox: 'foxes' })[a] + ' that score.</p><button type="button" class="ab" id="whyAll">All cards</button></div><button type="button" class="cx" id="whyX" aria-label="Close">&times;</button>';
  e.hidden = false; $$('.cc').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-card') === a); });
}
document.addEventListener('click', function (ev) { var t = ev.target.closest && ev.target.closest('#whyX, #whyAll'); if (!t) return; UI.whyA = null; render(); if (t.id === 'whyAll') openCards(); });
function openCards() { GX.drawer('cardsd', 'Scoring cards', null, false); $('#cardsd .gx-drawer-body').innerHTML = cardsHTML(); artApply($('#cardsd')); GX.show('cardsd'); }
function fillRules() { var b = $('#rulesd .gx-drawer-body'); if (!b) return; b.innerHTML = RULES_HTML + '<h3>The animal cards</h3>' + cardsHTML(); artApply(b); b.scrollTop = 0; setTimeout(function () { b.scrollTop = 0; }, 0); }   // filled on every open (the drawer body is never empty, so an emptiness test left it blank)
function openRules() { fillRules(); GX.show('rulesd'); }
// ---------------------------------------------------------------- music (silent until files exist)
function musicSync() { try { if (window.GXMUS) GXMUS.sync(); } catch (e) { } }
// ---------------------------------------------------------------- boot
function boot() {
  GX.init({ key: 'wm' });
  var sb = document.createElement('div'); sb.id = 'scoresb'; GX.drawer('scored', 'Scores', sb, true);
  var rb = document.createElement('div'); GX.drawer('rulesd', 'How to play', rb, false);
  GX.onShow = function (id) { if (id === 'scored') $('#scoresb').innerHTML = G ? scoresHTML() : '<p>No game yet.</p>'; if (id === 'rulesd') fillRules(); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var a = document.createElement('button'); a.type = 'button'; a.className = 'gx-sb'; a.textContent = 'Title screen'; a.onclick = function () { GX.close(); UI.sv = 'title'; showTitle(); }; var b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'gx-sb'; b2.textContent = 'New game'; b2.onclick = function () { GX.close(); UI.sv = 'setup'; showTitle(); }; var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'gx-sb'; rs.textContent = 'Restart'; rs.onclick = function () { GX.close(); if (UI.mode === 'camp' && UI.camp) campStart(UI.camp); else if (UI.cfg && UI.mode === 'quick') newGame(Object.assign({}, UI.cfg, { seed: null })); else { UI.sv = 'setup'; showTitle(); } }; S.appendChild(GX.row('This game', [rs, b2, a])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(!UI.prefs.mute, function (v) { UI.prefs.mute = !v; savePrefs(); }))); if (window.GXMUS && (window.WM_MUSIC || []).length) { var m = document.createElement('button'); m.type = 'button'; m.className = 'gx-sb'; m.textContent = 'Choose tracks'; m.onclick = function () { GXMUS.open(); }; S.appendChild(GX.row('Music', [m])); } },
      help: function (S) { var r = document.createElement('button'); r.type = 'button'; r.className = 'gx-sb'; r.textContent = 'Rules'; r.onclick = function () { GX.close(); setTimeout(openRules, 50); }; var tu = document.createElement('button'); tu.type = 'button'; tu.className = 'gx-sb'; tu.textContent = 'Tutorial'; tu.onclick = function () { GX.close(); tutStart(); }; S.appendChild(GX.row('Read', [r, tu])); },
      about: { name: 'Wildmark', version: '1.0', text: 'Original names and rules text. Temporary art icons: game-icons.net (Delapouite, Lorc), CC BY 3.0.' } });
    AIDELAY = GX.aiDelay ? GX.aiDelay(650) : 650; if (GX.onPref) GX.onPref(function (k) { if (k === 'ai') AIDELAY = GX.aiDelay(650); });
  } catch (e) { console.error(e); }
  try { if (window.GA) { var mus = {}; (window.WM_MUSIC || []).forEach(function (n) { mus[n] = 'url:music/' + n + '.mp3'; }); GA.init({ sfx: {}, music: mus, key: 'wm' }); if (GX.applyPrefs) GX.applyPrefs(); }
    if (window.GXMUS) GXMUS.init({ key: 'wm', slots: [['menu', 'Title'], ['main', 'Game'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['menu', 'main'], slot: function () { return !G || !$('#start').hidden ? ['menu', 0] : G.over ? [G.winner === 0 || G.solo ? 'victory' : 'defeat', 1] : ['main', 0]; }, on: function () { return !UI.prefs.mute && (window.WM_MUSIC || []).length > 0; } }); } catch (e) { }
  if (typeof helpInit === 'function') helpInit();
  if (typeof campInit === 'function') campInit();
  GX.onResize(function () { if (G) fitView(true); });
  artLoad();
  var q = new URLSearchParams(location.search); if (q.get('fast')) { UI.fast = true; AIDELAY = 30; ANIM = false; }
  if (q.get('scn')) return;
  UI.sv = 'title'; showTitle();
  if (!UI.prefs.played && !UI.prefs.offered && window.GXT && !GXT.isDone('wildmark')) { UI.prefs.offered = 1; savePrefs(); }
}
window.addEventListener('DOMContentLoaded', boot);
window.render_game_to_text = function () { return G ? WM.text(G) : 'title'; };
window.UI = UI;
