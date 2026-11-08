/* Redline Rally UI: title, canvas track (follow camera, animated cars), hand/gear panel, hot-seat, result. */
var G = null;
var UI = { sel: [], gear: 1, boost: false, busy: false, seat: 0, cam: { x: 0, y: 0, s: 0.4 }, vis: [], pops: [], focus: 0, fast: /[?&]fast=1/.test(location.search), flash: null, tipShown: false, set: { track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal', upg: false, wx: 'dry', sup: true } };
window.ANIM = true; window.AIDELAY = 1;
var $ = function (s) { return document.querySelector(s); };
function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
function wait(ms) { return new Promise(function (r) { setTimeout(r, (UI.fast || window.ANIM === false) ? Math.min(ms, 8) : ms * (window.AIDELAY || 1) * (UI.pace || 1) * (UI.skipStep ? 0.12 : 1)); }); }
function setSeed(n) { if (G) G.rs = n >>> 0; }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

/* ================= title / setup ================= */
function chooser(id, items, key, fmt) {
  var el = $(id); el.innerHTML = '';
  items.forEach(function (it) {
    var b = document.createElement('button'); b.className = 'opt' + (UI.set[key] === it.v ? ' on' : ''); b.innerHTML = it.h; b.onclick = function () { UI.set[key] = it.v; lsSet('rr_set', JSON.stringify(UI.set)); drawSetup(); }; el.appendChild(b);
  });
}
function drawSetup() {
  var s = UI.set; if (s.hum + s.opp > 6) s.opp = 6 - s.hum; if (s.hum + s.opp < 2) s.opp = 2 - s.hum;
  chooser('#s-track', Object.keys(TRACKDEFS).filter(function (k) { return !TRACKDEFS[k].hidden; }).map(function (k) { return { v: k, h: esc(TRACKDEFS[k].name) + '<small>' + esc(TRACKDEFS[k].blurb) + '</small>' }; }), 'track');
  chooser('#s-laps', [1, 2, 3].map(function (n) { return { v: n, h: n + (n > 1 ? ' laps' : ' lap') }; }), 'laps');
  chooser('#s-opp', [1, 2, 3, 4, 5].filter(function (n) { return n + s.hum <= 6 && n + s.hum >= 2; }).map(function (n) { return { v: n, h: String(n) }; }), 'opp');
  chooser('#s-hum', [1, 2, 3].map(function (n) { return { v: n, h: n === 1 ? '1 (you)' : n + ' (pass-and-play)' }; }), 'hum');
  chooser('#s-upg', [{ v: false, h: 'Off' }, { v: true, h: 'On<small>Draft 3 upgrade cards first</small>' }], 'upg');
  chooser('#s-wx', WX_IDS.concat(['random']).map(function (w) { return { v: w, h: w === 'random' ? 'Random' : esc(WEATHER[w].name) }; }), 'wx');
  chooser('#s-sup', [{ v: true, h: 'On' }, { v: false, h: 'Off' }], 'sup');
  chooser('#s-diff', ['easy', 'normal', 'hard'].map(function (d) { return { v: d, h: d[0].toUpperCase() + d.slice(1) }; }), 'diff');
  var qt = $('#quickT'); if (qt && !qt._set) { qt._set = 1; var op = innerHeight >= 880; $('#quickBody').hidden = !op; qt.setAttribute('aria-expanded', op ? 'true' : 'false'); qt.onclick = function () { var h = !$('#quickBody').hidden; $('#quickBody').hidden = h; qt.setAttribute('aria-expanded', h ? 'false' : 'true'); }; } $('#tutSlot').innerHTML = tutBtn('ghostb'); $('#storyLine').innerHTML = typeof campLine === 'function' ? campLine() : ''; $('#title').setAttribute('data-art', 'bg-title'); artApply($('#title'));
}
function showTitle() { try { GX.close(); } catch (e) { } $('#title').hidden = false; $('#game').hidden = true; closeModal(); drawSetup(); }
function modal(html) { var m = $('#modal'); m.innerHTML = '<div class="sheet"><button class="xb" aria-label="Close" id="mx">✕</button>' + html + '</div>'; m.hidden = false; $('#mx').onclick = closeModal; m.onclick = function (e) { if (e.target === m) closeModal(); }; artApply(m); }
function closeModal() { var m = $('#modal'); m.hidden = true; m.innerHTML = ''; m.onclick = null; }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#modal').hidden && !UI.lockModal) closeModal(); });
function rulesFill() {
  var h = ('<h3>How a turn works</h3><p>The strip in the side panel lights your phase: <b>Shift</b> (pick a gear), <b>Play</b> (pick the cards), <b>Move</b>, <b>React</b> (cooldown, boost, slipstream, corners), <b>Discard</b> (draw back to 7). Before you press Go, the track shows where you will land and what the corner costs.</p><ol class="turn5">' + STORY.turn.map(function (l) { return '<li>' + esc(l.replace(/^\d\. /, '')) + '</li>'; }).join('') + '</ol><h3>The rules in full</h3><p>Be first across the line after all laps. Each round you pick a <b>gear</b> and play that many cards. The total is your speed: you move that many spaces.</p>' +
    '<h3>Each round</h3><ul><li><b>Gear 1-4</b>: shift one step free, or two steps for 1 heat. Gear = cards you play.</li><li><b>Corners</b> have a speed limit. Every point over costs 1 heat from your engine. Not enough heat? You spin out: all your engine heat is lost, you stop behind the corner in gear 1, and get 1 stress card (2 if you were in gear 3 or 4).</li><li><b>Slipstream</b>: end next to or right behind another car and you may glide 2 more spaces. It does not count as speed.</li><li><b>Boost</b>: pay 1 heat to flip cards from your deck until a speed card shows, and add it.</li><li><b>Cooldown</b> (after your cards are shown): gear 1 sends up to 3 heat from your hand back to the engine, gear 2 sends 1.</li><li><b>Adrenaline</b>: the last car to move each round gets +1 move and +1 cooldown (the last two cars when 5 or more started).</li><li><b>Too few cards</b>: if your hand has fewer playable cards than your gear, you play them all, pay heat cards for the rest, do not move and drop to gear 1.</li><li><b>The finish</b>: no slipstream past the line. The race goes on until every car has finished; finishers are placed in the order they cross. Cars crossing in the same round: the one furthest past the line is ahead; on the same space, the one that got there first.</li></ul>' +
    '<h3>Cards</h3><ul><li>Speed 1, 2, 3, 4: three of each.</li><li>Stress (3): when played, flip your deck until a speed card shows and use it.</li><li>Heat (6 start in your engine): paying sends them to your discard pile. They clog your hand later and cannot be played.</li></ul>' +
    '<h3>Upgrades (optional)</h3><ul><li>Switch Upgrades on in setup. Before the race you pick 3 upgrade cards; they join your deck and are played like speed cards, each with a bonus (more cooling, higher corner limits, a big speed jump).</li></ul>' +
    '<h3>Starting upgrades (house values)</h3><ul><li>Every car shuffles a <b>Brake card</b> (speed 0), a <b>Burst card</b> (speed 5) and 1 extra heat card into its deck. The printed rules give no numbers for these, so these are this game\'s own fair values. A stress flip skips them. Switch off in setup.</li></ul>' +
    '<h3>Weather (optional, house rules)</h3><ul><li><b>Rain</b>: corner limits 1 lower (never below 2).</li><li><b>Heatwave</b>: every car starts with 1 heat card in its discard.</li><li><b>Tailwind</b>: slipstream carries you 3 spaces.</li></ul>' +
    '<h3>Championship (house values)</h3><ul><li>Three tracks in a row with the same drivers. Points per place: 9, 6, 4, 3, 2, 1. Ties: more wins, then the better place in the last race.</li></ul>' +
    '<h3>Simplified on purpose</h3><ul><li>Stress and heat cards never run out (the printed game has a limited reserve).</li><li>Three original tracks.</li></ul><p>Brake and keep your heat, or push and burn it. Heat comes back around.</p><div id="howTut">' + tutBtn('ghostb', { launch: function () { GX.close(); closeModal(); tutStart(); } }) + '</div>');
  var d = $('#rulesbody'); d.innerHTML = h; artApply(d);
}
function howTo() { rulesFill(); GX.show('rulesd'); }

/* ================= game start ================= */
function startGame(o) {
  var s = o || UI.set; UI.mode = o && o.tut ? 'tutorial' : ''; if (!(o && o.champ)) UI.champ = null;
  var wx = s.wx || 'dry'; if (wx === 'random') wx = WX_IDS[Math.floor(Math.random() * WX_IDS.length)]; if (!(o && o.cmp)) UI.cmpDef = null; if (!(o && o.tut)) lsSet('rr_seen', '1');
  G = newGame({ track: s.track, laps: s.laps, n: s.hum + s.opp, humans: s.hum, diff: s.diff, seed: o && o.seed, upg: !!s.upg, climit: s.climit, lowheat: s.lowheat, cmp: s.cmp, wx: o && (o.tut || o.cmp) ? 'dry' : wx, sup: !(o && o.tut) && s.sup !== false });
  if (s.hum === 1) { G.cars[0].name = 'You'; G.cars[0].drv = ''; }   /* the player is "You", never a named driver (the story's rival Kit must be someone else) */
  if (o && o.tut) { [['kit', 'Kit Marlow'], ['juno', 'Juno Vega']].forEach(function (d, k) { G.cars[k + 1].drv = d[0]; G.cars[k + 1].name = d[1]; }); }
  window.G = G; UI.seat = 0; UI.sel = []; UI.boost = false; UI.busy = false; UI.pops = [];
  UI.vis = G.cars.map(function (c) { return { p: c.pos, rot: 0, glow: 0 }; });
  UI.focus = 0; $('#title').hidden = true; $('#game').hidden = false; closeModal();
  $('#tTrk').textContent = TK[G.track].name;
  sizeCanvas(); var f = UI.vis[0]; snapCam(); UI.redraw();
  RACE.rate = ''; RACE.rateKeep = 0; RACE.rateShow = 0; RACE.flashHold = 0; RACE.lights = null; RACE.skids = []; RACE.spd = RACE.spdT = 0; RACE.prev = null; RACE.ph = 'shift'; lightsStart(); sfx('go');
  if (G.wx !== 'dry') setTimeout(function () { if (G && G.round === 1) banner(WEATHER[G.wx].name + ': ' + WEATHER[G.wx].txt, null, 'round'); }, 2600);
  if (o && o.tut) stageTutorial();
  if (G.drafting) { $('#panel').innerHTML = ''; setMsg('Pick your upgrade cards'); return runDraft(function () { UI.lockModal = false; closeModal(); planFor(needPlans(G)[0]); }); }
  if (!o || !(o.cmp || o.tut)) { var g0 = G; setTimeout(function () { if (G === g0 && G.round === 1 && G.phase === 'plan') { banner(pickLine(STORY.quickIntro), 0, 'plan'); setTimeout(function () { if (G === g0 && G.phase === 'plan') banner(STORY.yourTurn, 0, 'plan'); }, 2200); } }, 0); }
  planFor(needPlans(G)[0]);
}
/* Upgrade draft: each human picks DRAFT_PICKS cards one at a time from what is left in the shared pool; then the computer drivers pick and decks are dealt. */
function runDraft(done) {
  var hs = G.cars.filter(function (c) { return c.human; }), hi = 0;
  (function step() {
    while (hi < hs.length && hs[hi].upg.length >= DRAFT_PICKS) hi++;
    if (hi >= hs.length) { draftDone(G); return done(); }
    var c = hs[hi], n = c.upg.length;
    UI.lockModal = true;
    var h = '<h2>Pick an upgrade (' + (n + 1) + '/' + DRAFT_PICKS + ')</h2>' + (hs.length > 1 ? '<p><b>' + esc(c.name) + '</b></p>' : '') + '<p>It joins your deck and is played like a speed card.</p><div class="upgrid">';
    UPG_IDS.forEach(function (id) {
      var d = UPG[id], left = G.pool[id];
      h += '<button class="upc" data-u="' + id + '"' + (left > 0 ? '' : ' disabled') + '><span class="cd U" data-art="card-upgrade-' + id + '"><span class="v">' + d.sp + '</span></span><span class="un"><b>' + esc(d.name) + '</b><small>' + esc(d.txt) + '</small></span></button>';
    });
    modal(h + '</div>'); $('#mx').hidden = true;
    document.querySelectorAll('.upc').forEach(function (b) { b.onclick = function () { sfx('card'); draftPick(G, c.i, b.getAttribute('data-u')); step(); }; });
  })();
}
function you() { return G.cars[UI.seat]; }

/* ================= planning ================= */
function planFor(ci) {
  if (ci == null) return startRound();
  UI.seat = ci; UI.focus = ci; var c = G.cars[ci];
  UI.sel = []; UI.gear = c.gear; UI.boost = false;
  if (G.hot) { UI.lockModal = true; modal('<h2>Pass to ' + esc(c.name) + '</h2><p>Hide the other hands. Tap when it is your turn.</p><button class="big" id="rdy" style="width:100%">I am ' + esc(c.name.split(' ')[0]) + '</button>'); $('#mx').hidden = true; $('#rdy').onclick = function () { UI.lockModal = false; closeModal(); drawPlan(); }; return; }
  drawPlan();
}
function curveInfo() {   /* what the selected cards would do at the next corner */
  var c = you(), sp = 0, nx = 0, ul = 0; UI.sel.forEach(function (j) { var x = c.hand[j], u = upgId(x); if (u) { sp += UPG[u].sp; ul += UPG[u].lim; } else if (x === 'X') nx++; else sp += +x; });
  var avg = avgSpeed(c), spEst = sp + nx * avg + (UI.boost ? avg : 0), shown = Math.round(spEst);
  var adr = adrenalineFor(G).indexOf(c.i) >= 0 ? 1 : 0;
  var L = c.pos + shown + adr, ks = cornersIn(G, c.pos, L), cost = (Math.abs(UI.gear - c.gear) === 2 ? 1 : 0) + (UI.boost ? 1 : 0);
  var burn = 0; ks.forEach(function (k) { burn += Math.max(0, shown - k.limit - ul); });
  return { sp: shown, uncertain: nx > 0 || UI.boost, burn: burn, spin: burn > c.eng - cost, ks: ks, cost: cost, next: nextCorner(c.pos), adr: adr };
}
function nextCorner(pos) {
  var tk = T(G), N = tk.N;
  for (var d = 1; d <= N; d++) { var lim = tk.corners[(pos + d) % N]; if (lim) return { d: d, limit: climit(G, lim) }; } return null;
}
function drawPlan() {
  var c = you(), p = $('#panel'), need = needCards(c, UI.gear), go = gearOpts(c);
  if (UI.sel.length > need) UI.sel = UI.sel.slice(0, need);
  var h = '<div id="gears" data-art="ui-gear-dial"><span class="gl"><i class="ic hud f-gear" data-art="icon-gear"></i>Gear</span>';
  for (var g = 1; g <= GEARS; g++) { var o = go.filter(function (x) { return x.g === g; })[0]; h += '<button class="gb' + (UI.gear === g ? ' on' : '') + (o ? '' : ' off') + '" data-g="' + g + '" ' + (o ? '' : 'disabled') + ' aria-label="Gear ' + g + ': play ' + g + ' card' + (g > 1 ? 's' : '') + (o && o.cost ? ', costs 1 heat' : '') + '"><b>' + g + '</b><small>' + (o && o.cost ? '-1 heat' : g + (g > 1 ? ' cards' : ' card')) + '</small></button>'; }
  h += '</div><div id="hand">';
  var needNow = needCards(c, UI.gear), full = UI.sel.length >= needNow;
  c.hand.forEach(function (x, j) { var on = UI.sel.indexOf(j) >= 0; h += cardHtml(x, on, x === 'H' || (UI.swap && x === 'X'), j, x === 'H' ? '' : on ? '' : full ? 'dim' : tutOn() ? '' : 'glow'); });
  h += '</div><div id="acts"><button class="bo' + (UI.boost ? ' on' : '') + '" id="boostB"' + (c.eng - (Math.abs(UI.gear - c.gear) === 2 ? 1 : 0) < 1 ? ' disabled' : '') + '>Boost -1</button><button id="sugB">Suggest</button>' + (G.phase === 'plan' && c.dsc !== G.round && !G.hot && !tutOn() ? '<button type="button" id="swapB" class="swapb" title="Throw away cards you do not want and draw back to 7 (once a round)">' + (UI.swap ? 'Cancel' : 'Swap') + '</button>' : '') + '<button class="go" id="goB">Go!</button></div>';
  var hh = c.hand.filter(function (x) { return x === 'H'; }).length, pips = ''; for (var q = 0; q < ENGINE0; q++) pips += '<i class="pip' + (q < c.eng ? ' on' : '') + '"></i>';
  h += '<div class="chips tray" id="tray"><span class="eng" title="Engine heat: your fuel. Corners burn it."><em>Engine heat</em><span class="pips">' + pips + '</span><b data-engine="G.cars[' + c.i + '].eng">' + c.eng + '</b></span><span title="Heat cards stuck in your hand. Gear 1 or 2 cools them back."><em>Dead heat in hand</em> <b>' + hh + '</b></span>' + '</div>';
  p.innerHTML = h; artApply(p);
  p.querySelectorAll('.gb').forEach(function (b) { b.onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'gear', g: +b.getAttribute('data-g') })) return; sfx('gear'); UI.touchedGear = 1; UI.gear = +b.getAttribute('data-g'); UI.sel = UI.sel.slice(0, needCards(c, UI.gear)); if (c.eng - (Math.abs(UI.gear - c.gear) === 2 ? 1 : 0) < 1) UI.boost = false; drawPlan(); }; });
  p.querySelectorAll('.cd').forEach(function (b) { b.onclick = function () { var j = +b.getAttribute('data-i'); if (c.hand[j] === 'H') { setMsg('Heat cards cannot be played.', 'warn'); return; } var k = UI.sel.indexOf(j);
    if (tutOn()) { if (k >= 0 || !GXT.act({ type: 'tap', what: 'card', i: j })) return; }
    sfx('card'); UI.note = upgId(c.hand[j]) ? UPG[upgId(c.hand[j])].name + ': ' + UPG[upgId(c.hand[j])].txt : ''; if (k >= 0) UI.sel.splice(k, 1); else { if (UI.sel.length >= needCards(c, UI.gear)) UI.sel.shift(); UI.sel.push(j); } drawPlan(); }; });
  $('#boostB').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'boost' })) return; sfx('boost'); UI.boost = !UI.boost; drawPlan(); };
  $('#sugB').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'suggest' })) return; sfx('tap'); suggest(); }; $('#goB').onclick = commit;
  var ready = UI.sel.length === need; $('#goB').disabled = !ready; $('#goB').classList.toggle('glow', ready);
  if (!ready) setMsg(need === 0 ? 'Only heat cards: press Go.' : UI.sel.length === 0 && !UI.touchedGear ? 'Pick a gear, then tap ' + need + ' card' + (need > 1 ? 's' : '') + '.' : (UI.sel.length ? 'Tap ' + (need - UI.sel.length) + ' more card' + (need - UI.sel.length > 1 ? 's' : '') + '.' : STORY.planCards(need)));
  else { var ci = previewSet(curveInfo()); var sp = 'Speed ' + ci.sp + (ci.uncertain ? '?' : ''); if (UI.note && /upgrade|:/.test(UI.note) && UI.sel.some(function (j) { return upgId(c.hand[j]); })) sp += ' (' + UI.note.split(':')[0] + ')'; setMsg((ci.spin ? sp + ': you would spin out!' : ci.burn ? sp + ': the corner burns ' + ci.burn + ' heat' : ci.ks.length ? sp + ': the corner is safe' : ci.next ? sp + ': road clear, corner in ' + ci.next.d : sp + ': road clear') + (ci.slip && !ci.spin ? ', slipstream likely' : '') + (ci.spin ? '' : '. ' + STORY.planGo), ci.spin ? 'warn' : ci.burn ? 'warn' : 'good'); }
  if (!ready) previewSet(null);
  RACE.ph = UI.swap ? 'discard' : (UI.sel.length || UI.touchedGear) ? 'play' : 'shift'; RACE.spdT = ready && RACE.prev ? RACE.prev.sp : 0;
  if (!ready && need === 0) $('#goB').disabled = false;
  var dt = $('#dockt'); if (dt) dt.textContent = 'Round ' + G.round + ' · your turn'; if (RACE.rateShow && !G.hot) { RACE.rateShow = 0; RACE.rateKeep = 1; banner(RACE.rate, RACE.rateK === 'good' ? 2 : RACE.rateK === 'poor' ? 0 : 3, 'plan rate'); } else if (!RACE.rateKeep) banner(G.hot ? c.name.split(' ')[0] + "'s turn" : STORY.yourTurn, c.col, 'plan');
  if (UI.swap && c.dsc !== G.round) swapMode(c);
  else if (UI.mode === 'tutorial') coachPlan(c, ready ? curveInfo() : null);
  var sw = $('#swapB'); if (sw) sw.onclick = function () { UI.swap = !UI.swap; UI.sel = []; drawPlan(); };
  hud(); tracker();
}
var FLAME = '<svg viewBox="0 0 24 28" width="22" height="26" aria-hidden="true"><path d="M12 1C13 7 20 10 20 18a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 2 5 0-5 0-9 2-14z" fill="#ff7a3a" stroke="#ffd0a0" stroke-width="1.5"/></svg>';
function cardFace(x, big) {   /* one card face: type label (top), the key number or shape (middle), a one-line plain effect (bottom) */
  var u = upgId(x);
  if (u) return '<span class="k">' + esc(UPG[u].sn) + '</span><span class="v">' + UPG[u].sp + '</span><span class="t">move ' + UPG[u].sp + '</span>';
  if (x === 'H') return '<span class="k">Heat</span><span class="v">' + FLAME + '</span><span class="t">dead</span>';
  if (x === 'X') return '<span class="k">Stress</span><span class="v">?</span><span class="t">random</span>';
  return '<span class="k">Speed</span><span class="v">' + x + '</span><span class="t">move ' + x + '</span>';
}
function cardText(x) {
  var u = upgId(x); if (u) return UPG[u].name + ': ' + UPG[u].txt;
  if (x === 'H') return 'Heat card: a dead card, it cannot be played.';
  if (x === 'X') return 'Stress card: flips a random speed card from your deck.';
  return 'Speed ' + x + ': moves you ' + x + ' spaces.';
}
function swapMode(c) {   /* optional rulebook step: throw away speed cards you do not want (once per round), then draw back to a full hand */
  var n = UI.sel.length; setMsg(n ? 'Throw away ' + n + ' card' + (n > 1 ? 's' : '') + '?' : 'Tap the cards to throw away.');
  var g = $('#goB'); g.textContent = n ? 'Swap ' + n : 'Swap none'; g.disabled = !n; g.classList.toggle('glow', !!n);
  document.querySelectorAll('.gb').forEach(function (b) { b.disabled = true; });
  document.querySelectorAll('#hand .cd').forEach(function (b) { var j = +b.getAttribute('data-i'); b.onclick = function () { if (c.hand[j] === 'H' || c.hand[j] === 'X') { setMsg('Heat and Stress cards stay in your hand.', 'warn'); return; } var k = UI.sel.indexOf(j); if (k >= 0) UI.sel.splice(k, 1); else UI.sel.push(j); drawPlan(); }; });
  g.onclick = function () { var e = discardOptional(G, c.i, UI.sel.slice()); UI.swap = false; UI.sel = []; if (e) setMsg('Cannot swap: ' + e, 'warn'); drawPlan(); };
}
function cardHtml(x, sel, dead, j, cls) {
  var u = upgId(x), stem = u ? 'card-upgrade-' + u : x === 'H' ? 'card-heat' : x === 'X' ? 'card-stress' : 'card-speed-' + x;
  var kind = u ? 'U' : x === 'H' ? 'H' : x === 'X' ? 'X' : 's' + x;
  return '<button class="cd ' + kind + (sel ? ' sel' : '') + (dead ? ' dead' : '') + (cls ? ' ' + cls : '') + '" data-art="' + stem + '" data-i="' + j + '" aria-label="' + esc(cardText(x)) + '" title="' + esc(cardText(x)) + '">' + cardFace(x) + '</button>';
}
function suggest() {
  var c = you(), g2 = JSON.parse(JSON.stringify(G)), p = aiPlan(g2, g2.cars[c.i]);
  UI.gear = p.gear; UI.sel = p.idx.slice(); UI.boost = p.boost; drawPlan();
}
function commit() {
  if (tutOn() && !GXT.act({ type: 'tap', what: 'go' })) return; sfx('go');
  var c = you(); if (!G.hot) rateStart(c); var plan = { gear: UI.gear, idx: UI.sel.slice(), boost: UI.boost }, e = submitPlan(G, c.i, plan);
  if (e) { setMsg('Not allowed: ' + e, 'warn'); return; } RACE.prev = null; RACE.rateKeep = 0;
  $('#panel').innerHTML = '<div class="reveal"><div class="cd back" data-art="card-back"></div><div class="cd back" data-art="card-back"></div></div>'; artApply($('#panel'));
  var nx = needPlans(G)[0]; if (nx != null) planFor(nx); else startRound();
}
function startRound() { UI.busy = true; UI.skipStep = false; UI.pace = G.round > 2 && UI.mode !== 'tutorial' ? 0.6 : 1; startResolve(G); runResolve(); }

/* ================= resolving, with animation ================= */
function setMsg(t, cls) { var m = $('#msg'); m.textContent = t; m.className = cls || ''; }
function hud() {
  if (!G) return; var order = rankList(G), h = G.cars.filter(function (c) { return c.human; })[0] || G.cars[0], me = G.cars[UI.seat] || h;
  var lap = Math.min(G.laps, Math.floor(me.pos / T(G).N) + 1);
  $('#tLap').textContent = lap + '/' + G.laps; $('#tPos').textContent = (order.indexOf(me.i) + 1) + '/' + G.cars.length;
}
function banner(txt, col, kind) {
  var b = $('#banner'); if (!b) return; if (!txt) { b.className = ''; b.textContent = ''; return; }
  b.className = 'on ' + (kind || ''); b.style.setProperty('--bc', col != null && COLS[col] ? COLS[col].hex : '#ffc23a'); b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = txt;
}
async function runResolve() {
  hud(); UI.lastCar = -1; UI.skipStep = false;
  banner('Everyone has chosen', null, 'round'); setMsg('One car at a time. Tap: faster.'); await wait(900);
  while (G.phase === 'resolve') {
    var ev = resolveNext(G); await playEvents(ev);
    if (G.pend) { var use = await askSlip(); ev = slipChoice(G, use); await playEvents(ev); }
  }
  UI.busy = false; UI.pops = []; banner(''); RACE.spdT = 0; rateRound();
  if (G.over) { banner('Chequered flag!', null, 'round'); setMsg('Chequered flag!', 'good'); await wait(1100); banner(''); return showResult(); }
  if (window.__noPlan) return;
  UI.sel = []; UI.touchedGear = 0; RACE.ph = 'shift'; if (UI.mode === 'tutorial') tutStageRound(G.round); var nx = needPlans(G)[0]; setMsg('Round ' + G.round); if (nx != null) planFor(nx); else startRound();
}
function carName(i) { return G.cars[i].human ? G.cars[i].name.split(' ')[0] : G.cars[i].name.split(' ')[0]; }
function tween(i, to, ms) {
  var v = UI.vis[i], from = v.p; if (window.ANIM === false || UI.fast || ms <= 0 || from === to) { v.p = to; return Promise.resolve(); }
  ms = ms * (window.AIDELAY || 1) * (UI.skipStep ? 0.12 : 1); var n = Math.max(1, Math.round(Math.abs(to - from))), dir = to > from ? 1 : -1, last = 0;
  return new Promise(function (res) { var t0 = performance.now(); (function f(now) {   /* space by space: each space eases in and out, a tick on every space */
    var k = Math.min(1, (now - t0) / ms), x = k * n, i = Math.floor(x), fr = x - i, e = fr < .5 ? 2 * fr * fr : 1 - Math.pow(-2 * fr + 2, 2) / 2; if (i >= n) { i = n; e = 0; }
    if (i > last) { last = i; if (G.cars[UI.focus] && G.cars[UI.focus].human) sfx('tick'); }
    v.p = from + dir * Math.min(Math.abs(to - from), i + e); if (k < 1) requestAnimationFrame(f); else { v.p = to; res(); } })(t0); });
}
function pop(txt, at, col, stem) { UI.pops.push({ txt: txt, p: at, t: performance.now(), col: col || '#fff', stem: stem }); setTimeout(function () { UI.pops.shift(); }, 1500); }
function ord(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }
async function playEvents(ev) {
  for (var k = 0; k < ev.length; k++) {
    var e = ev[k], c = G.cars[e.car], nm = e.car != null ? carName(e.car) : '', you = e.car != null && c.human, who = you && !G.hot ? 'You' : nm;
    if (e.car != null) UI.focus = e.car;
    if (UI.mode === 'tutorial') coachEvent(e, you);
    if (e.car != null && e.car !== UI.lastCar && e.t !== 'done') { UI.lastCar = e.car; UI.skipStep = false; $('#panel').innerHTML = '<div class="who" style="color:' + COLS[c.col].hex + '">' + esc(nm) + ' ' + (you && !G.hot ? 'go' : 'is up') + '</div>'; var dt0 = $('#dockt'); if (dt0) dt0.textContent = 'Round ' + G.round + ' · ' + (you && !G.hot ? 'your car moves' : nm + ' moves'); banner(you && !G.hot ? 'Your move' : nm + "'s turn", c.col, 'turn'); setMsg(you && !G.hot ? 'Your car goes now.' : nm + ' is up.'); await wait(750); }
    if (you && !G.hot) { var ph = { shift: 'shift', play: 'play', move: 'move', cool: 'react', boost: 'react', slip: 'react', corner: 'react', spin: 'react', done: 'discard', stall: 'discard' }[e.t]; if (ph) RACE.ph = ph; } tracker();
    if (e.t === 'play') RACE.spdT = e.speed; else if (e.t === 'boost') RACE.spdT = e.speed; else if (e.t === 'done') RACE.spdT = 0;
    if (e.t === 'shift') { setMsg(who + (who === 'You' ? ' shift' : ' shifts') + ' to gear ' + e.to + (e.cost ? ' (-1 heat)' : '') + '.'); await wait(700); }
    else if (e.t === 'cool') { setMsg(who + ' cool' + (who === 'You' ? '' : 's') + ' ' + e.n + ' heat back into the engine.'); pop('+' + e.n + ' engine', UI.vis[e.car].p, '#8ce6ff'); await wait(750); }
    else if (e.t === 'play') { showPlayed(e); sfx('card'); setMsg(who + (who === 'You' ? ' play' : ' plays') + ': speed ' + e.speed + '.'); await wait(you ? 1000 : 950); }
    else if (e.t === 'boost') { sfx('boost'); setMsg(who + ' boost' + (who === 'You' ? '' : 's') + ': +' + e.add + ' from a flipped card.'); pop('Boost +' + e.add, UI.vis[e.car].p, '#ffd24a', 'fx-boost-flare'); await wait(800); }
    else if (e.t === 'adr') { setMsg(who + ' get' + (who === 'You' ? '' : 's') + ' adrenaline for being last: +1.'); pop('Adrenaline +1', UI.vis[e.car].p, '#ffd24a'); await wait(800); }
    else if (e.t === 'move') { var d = Math.abs(e.to - e.from); setMsg(who + ' drive' + (who === 'You' ? '' : 's') + ' ' + d + ' space' + (d === 1 ? '' : 's') + '.'); if (d) sfx('engine'); await tween(e.car, e.to, Math.min(1500, 170 * d + 250)); if (d) { pop('+' + d + ' spaces', UI.vis[e.car].p, '#fff'); await wait(450); } }
    else if (e.t === 'slip') { sfx('slip'); setMsg(who + ' slipstream' + (who === 'You' ? '' : 's') + ' +' + (e.to - e.from) + ': free spaces.'); pop('Slipstream +' + (e.to - e.from), UI.vis[e.car].p, '#8ce6ff', 'fx-slipstream-streaks'); await tween(e.car, e.to, 500); await wait(450); }
    else if (e.t === 'corner') { if (e.cost) { if (you) sfx('burn'); setMsg(who + ' burn' + (who === 'You' ? '' : 's') + ' ' + e.cost + ' heat: over the limit.', 'warn'); pop('-' + e.cost + ' heat: ' + e.speed + ' in a ' + e.limit, UI.vis[e.car].p, '#ff6a3a', 'fx-heat-flame'); await wait(900); } else { if (you) sfx('clean'); setMsg(who + ' took the corner clean.', 'good'); pop('Clean: ' + e.speed + ' in a ' + e.limit, UI.vis[e.car].p, '#8cf0b4'); await wait(750); } }
    else if (e.t === 'spin') { sfx('spin'); setMsg(nm + ' spins out: not enough heat.', 'warn'); pop('SPIN: ' + e.speed + ' in a ' + e.limit, e.to, '#ff4d3a', 'fx-spinout-smoke'); raceSpin(e); var v = UI.vis[e.car]; v.rot = 1; await tween(e.car, e.to, 500); await wait(700); v.rot = 0; }
    else if (e.t === 'finish') { setMsg(nm + ' crosses the line!', 'good'); banner(nm + ' crosses the line!', c.col, 'turn'); await wait(800); }
    else if (e.t === 'stall') { setMsg(nm + ' has only heat cards: no move, gear 1.', 'warn'); pop('No move', UI.vis[e.car].p, '#ff8f7a'); await wait(1000); }
    else if (e.t === 'done') { var pl = rankList(G).indexOf(e.car) + 1; setMsg(nm + ' is now ' + ord(pl) + '.'); await wait(450); }
    hud();
  }
  UI.redraw();
}
function showPlayed(e) {
  var h = '<div class="who" style="color:' + COLS[G.cars[e.car].col].hex + '">' + esc(carName(e.car) === 'You' ? 'You play' : carName(e.car) + ' plays') + '</div><div class="reveal">'; e.cards.forEach(function (x) {
    var stem = x.upg ? 'card-upgrade-' + x.upg : x.card === 'X' ? 'card-stress' : 'card-speed-' + x.card, v = x.v;
    h += '<div class="cd flip ' + (x.upg ? 'U' : x.card === 'X' ? 'X' : 's' + x.card) + '" data-art="' + stem + '"><span class="k">' + (x.upg ? esc(UPG[x.upg].sn) : x.card === 'X' ? 'Stress' : 'Speed') + '</span><span class="v">' + v + '</span><span class="t">' + (x.card === 'X' ? 'flipped' : 'move ' + v) + '</span></div>';
  });
  h += '</div><div class="chips"><span>Total speed <b>' + e.speed + '</b></span></div>'; $('#panel').innerHTML = h; artApply($('#panel'));
}
function askSlip() {
  if (UI.mode === 'tutorial') coachSay('slip');
  var p = G.pend, c = G.cars[p.car], cost = cornerCost(G, p.from, p.L1, p.speed, p.lim) - cornerCost(G, p.from, p.L0, p.speed, p.lim);
  var spin = cornerCost(G, p.from, p.L1, p.speed, p.lim) > c.eng;
  var sn = p.L1 - p.L0; setPhase('react'); setMsg(spin ? 'Slipstream +' + sn + ' would spin you out' : cost ? 'Slipstream +' + sn + ' costs ' + cost + ' more heat' : 'Slipstream: ' + sn + ' free spaces');
  $('#panel').innerHTML = '<div class="slipq"><button id="slipN">Stay</button><button class="y" id="slipY">Slipstream +' + sn + (spin ? ' (spin!)' : '') + (cost ? ' (-' + cost + ' heat)' : '') + '</button></div>';
  return new Promise(function (res) { $('#slipY').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'slip' })) return; res(true); }; $('#slipN').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'slipno' })) return; res(false); }; if (UI.fast) setTimeout(function () { res(!spin && cost === 0); }, 10); if (tutOn() && GXT.current() && GXT.current().id !== 'slip') { setMsg('No slipstream now: keep your heat.'); setTimeout(function () { res(false); }, 1400 * (window.AIDELAY || 1)); } });
}

/* ================= result ================= */
function showResult() {
  if (typeof GXC !== 'undefined' && GXC.active && GXC.active() && UI.cmpDef) { var wc = G.cars[G.rank[0]]; sfx(wc.human ? 'win' : 'lose'); return GXC.finish(G); }
  if (UI.mode === 'tutorial') return coachFinish();
  if (UI.champ) return champResult();
  UI.lockModal = true; var rows = '', me = G.cars.filter(function (c) { return c.human; });
  G.rank.forEach(function (ci, k) {
    var c = G.cars[ci], col = COLS[c.col].hex;
    rows += '<div class="stand' + (c.human ? ' you' : '') + '"><span class="n">' + (k + 1) + '</span><span class="pt" style="border-color:' + col + '" data-art="portrait-' + c.drv + '">' + (c.drv ? c.name[0] : '★') + '</span><div style="flex:1"><b>' + esc(c.name) + '</b><small>Heat burned ' + c.stats.heat + ' · spin-outs ' + c.stats.spins + ' · slipstreams ' + c.stats.slips + '</small></div></div>';
  });
  var w = G.cars[G.rank[0]]; sfx(w.human ? 'win' : 'lose');
  var line = UI.mode === 'tutorial' ? (w.human ? 'You beat Kit to the line. Coach Mara is grinning: the Sunline seat is yours.' : 'Kit took the flag, but you learned every trick. Coach Mara: "Again. You are close."') : w.human ? STORY.resultWin + ' ' + pickLine(STORY.quickWin) : STORY.resultLose(w.name.split(' ')[0]) + ' ' + pickLine(STORY.quickLose);
  modal('<div class="podium" data-art="bg-podium"><h2>' + (w.human ? 'You win!' : esc(w.name) + ' wins') + '</h2><i class="ic" data-art="ui-trophy" style="width:36px;height:36px"></i>' + podiumHtml(G.rank) + '<p class="rl">' + esc(line) + '</p></div>' + rows + '<div class="row" style="margin-top:10px"><button class="big" id="again">Race again</button><button class="ghostb" id="home">Title</button></div>');
  $('#mx').hidden = true; $('#again').onclick = function () { UI.lockModal = false; startGame(); }; $('#home').onclick = function () { UI.lockModal = false; showTitle(); };
}

/* ================= canvas ================= */
var cv, cx, dpr = 1, trackCache = {};
function sizeCanvas() {
  cv = cv || $('#cv'); cx = cx || cv.getContext('2d'); var r = $('#cvw').getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(2, Math.round(r.width * dpr)); cv.height = Math.max(2, Math.round(r.height * dpr)); UI.W = r.width; UI.H = r.height;
  UI.cam.s = Math.max(0.28, Math.min(0.62, Math.min(UI.W, UI.H * 1.15) / 880));
  UI.cam.s = Math.max(UI.cam.s, UI.W / 2000, UI.H / 1200);   /* never show beyond the 2000x1200 board */
}
function cvFit() { if (G && $('#cvw')) { var r = $('#cvw').getBoundingClientRect(); if (Math.abs(r.width - (UI.W || 0)) > .5 || Math.abs(r.height - (UI.H || 0)) > .5 || dpr !== Math.min(2, window.devicePixelRatio || 1)) sizeCanvas(); } }
window.addEventListener('resize', cvFit); window.addEventListener('orientationchange', function () { setTimeout(cvFit, 120); });
if (window.ResizeObserver) { var cvRO = new ResizeObserver(cvFit); document.addEventListener('DOMContentLoaded', function () { var w = $('#cvw'); if (w) cvRO.observe(w); }); if (document.readyState !== 'loading') { var w0 = $('#cvw'); if (w0) cvRO.observe(w0); } }
function carXY(i, p) {
  var tk = T(G), v = UI.vis[i]; var c = G.cars[i];
  var lane = laneOf(i); var q = tk.space(p, lane); return q;
}
function laneOf(i) {   /* lane = rank among cars sharing the same physical space */
  var N = T(G).N, me = G.cars[i], k = 0; G.cars.forEach(function (o) { if (o.i < me.i && o.pos % N === me.pos % N) k++; }); return k % 2;
}
function snapCam() { var q = carXY(UI.focus, UI.vis[UI.focus].p); UI.cam.x = q.x; UI.cam.y = q.y; }
function trackLayer(id) {
  if (trackCache[id]) return trackCache[id]; var tk = TK[id], c = document.createElement('canvas'); c.width = 1000; c.height = 600; var g = c.getContext('2d'); g.scale(0.5, 0.5);
  var gr = g.createRadialGradient(1000, 600, 100, 1000, 600, 1300); gr.addColorStop(0, '#2c6a3e'); gr.addColorStop(1, '#245c37'); g.fillStyle = gr; g.fillRect(0, 0, 2000, 1200);
  g.lineJoin = 'round'; g.lineCap = 'round';
  function stroke(w, col, dash) { g.beginPath(); tk.dense.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.lineWidth = w; g.strokeStyle = col; g.setLineDash(dash || []); g.stroke(); }
  stroke(150, '#e8e4d8'); stroke(138, '#c8352b', [34, 34]); stroke(124, '#33383f'); stroke(2, 'rgba(255,255,255,.35)', [22, 26]);
  /* space ticks */
  g.setLineDash([]); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2;
  for (var i = 0; i < tk.N; i++) { var q = tk.at(i * tk.seg); g.beginPath(); g.moveTo(q.x + Math.sin(q.a) * 60, q.y - Math.cos(q.a) * 60); g.lineTo(q.x - Math.sin(q.a) * 60, q.y + Math.cos(q.a) * 60); g.stroke(); }
  /* start / finish line */
  var s0 = tk.at(0); for (var r = 0; r < 6; r++) for (var cc = 0; cc < 2; cc++) { g.fillStyle = (r + cc) % 2 ? '#fff' : '#111'; g.save(); g.translate(s0.x, s0.y); g.rotate(s0.a); g.fillRect(-9 + cc * 9, -60 + r * 20, 9, 20); g.restore(); }
  /* corner markers: line across the road + limit sign */
  tk.list.forEach(function (k) { var q = tk.at(k.idx * tk.seg); g.strokeStyle = '#ffd24a'; g.lineWidth = 8; g.beginPath(); g.moveTo(q.x + Math.sin(q.a) * 62, q.y - Math.cos(q.a) * 62); g.lineTo(q.x - Math.sin(q.a) * 62, q.y + Math.cos(q.a) * 62); g.stroke(); });
  trackCache[id] = c; return c;
}
function drawCar(c, p, ang, rot, hi) {
  var col = COLS[c.col], W = 78, H = 38;
  cx.save(); cx.translate(p.x, p.y); cx.rotate(ang + rot * Math.PI * 2 * (UI.spinT || 0));
  if (!artDraw(cx, 'car-' + col.id, -W / 2, -H / 2, W, H, 'contain')) {
    cx.fillStyle = 'rgba(0,0,0,.3)'; cx.fillRect(-W / 2 + 3, -H / 2 + 4, W, H);
    cx.fillStyle = col.hex; rr(-W / 2, -H / 2, W, H, 9); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.85)'; rr(-6, -H / 2 + 6, 22, H - 12, 5); cx.fill();
    cx.fillStyle = '#111'; cx.fillRect(W / 2 - 14, -H / 2 + 5, 6, H - 10); cx.fillStyle = 'rgba(255,255,255,.7)'; cx.fillRect(-W / 2, -2, W * .5, 4);
  }
  cx.restore();
}
function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
function frame(now) {
  requestAnimationFrame(frame); if (!G || $('#game').hidden || !cx) return;
  cvFit(); var W = UI.W, H = UI.H, cam = UI.cam, tk = T(G); UI.spinT = (now % 600) / 600;
  var tgt = RACE.prev && G.phase === 'plan' ? T(G).space((G.cars[RACE.prev.car].pos + RACE.prev.L) / 2, 0) : carXY(UI.focus, UI.vis[UI.focus].p), k = (UI.fast || window.ANIM === false) ? 1 : 0.12; cam.x += (tgt.x - cam.x) * k; cam.y += (tgt.y - cam.y) * k; cam.x = Math.max(W / 2 / cam.s, Math.min(2000 - W / 2 / cam.s, cam.x)); cam.y = Math.max(H / 2 / cam.s, Math.min(1200 - H / 2 / cam.s, cam.y));
  cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.fillStyle = '#245c37'; cx.fillRect(0, 0, W, H);
  var shk = camShake(now); cx.save(); cx.translate(W / 2 + shk, H / 2 + shk * 0.5); cx.scale(cam.s, cam.s); cx.translate(-cam.x, -cam.y);
  if (!artDraw(cx, 'track-' + G.track, 0, 0, 2000, 1200, 'cover')) cx.drawImage(trackLayer(G.track), 0, 0, 2000, 1200);
  /* corner signs */
  tk.list.forEach(function (kk) {
    var q = tk.at(kk.idx * tk.seg), sx = q.x + Math.sin(q.a) * 98, sy = q.y - Math.cos(q.a) * 98;
    if (!artDraw(cx, 'ui-corner-sign', sx - 36, sy - 36, 72, 72, 'contain')) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(sx, sy, 34, 0, 7); cx.fill(); cx.lineWidth = 8; cx.strokeStyle = '#d8281d'; cx.stroke(); }
    cx.fillStyle = '#111'; cx.font = '900 38px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(climit(G, kk.limit), sx, sy + 2);
  });
  artDraw(cx, 'ui-flag-checkered', tk.at(0).x - 40, tk.at(0).y - 150, 80, 60, 'contain');
  raceWorld(now);
  /* cars: back to front */
  var ord = G.cars.map(function (c) { return c.i; }).sort(function (a, b) { return UI.vis[a].p - UI.vis[b].p; });
  ord.forEach(function (i) {
    var c = G.cars[i], p = carXY(i, UI.vis[i].p);
    drawCar(c, p, p.a, UI.vis[i].rot);
    if (c.human || i === UI.focus) { cx.fillStyle = '#fff'; cx.font = '800 26px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.strokeStyle = 'rgba(0,0,0,.75)'; cx.lineWidth = 6; var lb = c.human ? c.name.split(' ')[0] : String(c.name.split(' ')[0]); cx.strokeText(lb, p.x, p.y - 30); cx.fillText(lb, p.x, p.y - 30); }
  });
  /* pops */
  UI.pops.forEach(function (o) {
    var age = o.hold ? 0.15 : (now - o.t) / 1500; if (age > 1 || age < 0) return; var q = tk.space(o.p, 0); cx.globalAlpha = 1 - age * age; var y = q.y - 50 - age * 60;
    if (o.stem) artDraw(cx, o.stem, q.x - 50, y - 70, 100, 70, 'contain');
    cx.fillStyle = o.col; cx.font = '900 34px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.strokeStyle = '#000'; cx.lineWidth = 7; cx.strokeText(o.txt, q.x, y); cx.fillText(o.txt, q.x, y); cx.globalAlpha = 1;
  });
  cx.restore();
  /* minimap */
  var mw = Math.min(110, W * 0.3), mh = mw * 0.6, mx = W - mw - 6, my = 6, sc = mw / 2000;
  cx.fillStyle = 'rgba(8,12,20,.6)'; rr(mx - 3, my - 3, mw + 6, mh + 6, 8); cx.fill();
  cx.beginPath(); tk.dense.forEach(function (p, i) { if (i) cx.lineTo(mx + p[0] * sc, my + p[1] * sc); else cx.moveTo(mx + p[0] * sc, my + p[1] * sc); }); cx.closePath(); cx.strokeStyle = '#8b97ad'; cx.lineWidth = 3; cx.stroke();
  G.cars.forEach(function (c) { var q = tk.space(UI.vis[c.i].p, 0); cx.fillStyle = COLS[c.col].hex; cx.beginPath(); cx.arc(mx + q.x * sc, my + q.y * sc, c.human ? 3.6 : 2.6, 0, 7); cx.fill(); if (c.human) { cx.strokeStyle = '#fff'; cx.lineWidth = 1.2; cx.stroke(); } });
  raceHud(now, W, H);
}
UI.redraw = function () { };
requestAnimationFrame(frame);

/* ================= wiring ================= */
function boot() {
  try { var s = JSON.parse(lsGet('rr_set') || 'null'); if (s) for (var k in s) UI.set[k] = s[k]; } catch (e) { }
  if (!TRACKDEFS[UI.set.track]) UI.set.track = 'sunline';
  GX.init({ key: 'rr' }); GX.drawer('rulesd', 'How to play', (function () { var d = document.createElement('div'); d.id = 'rulesbody'; return d; })());
  GX.onShow = function (id) { if (id === 'rulesd') rulesFill(); }; rulesFill();
  GX.onResize(function () { if (G && !$('#game').hidden) sizeCanvas(); });
  $('#playB').onclick = function () { startGame(); }; $('#howB').onclick = howTo; $('#storyB').onclick = function () { campOpen(); }; $('#champB').onclick = function () { champStart(false); }; soundBoot(); if (typeof helpBoot === 'function') helpBoot();
  $('#menuB').onclick = function () { modal('<h2>Menu</h2><div style="display:flex;flex-direction:column;gap:8px"><button class="ghostb" id="m1">How to play</button><button class="ghostb" id="m4">Guide: learn by doing</button><button class="ghostb" data-snd id="m5"></button><button class="ghostb" id="m2">Quit to title</button><button class="big" id="m3">Keep racing</button></div>'); $('#m1').onclick = howTo; $('#m4').onclick = function () { closeModal(); chapterMenu(); }; $('#m2').onclick = function () { showTitle(); }; $('#m3').onclick = closeModal; $('#m5').textContent = sndLabel(); $('#m5').onclick = function () { setSound(!SND.on); }; };
  var q = new URLSearchParams(location.search); if (q.get('seed')) UI.seedArg = +q.get('seed');
  artLoad(); showTitle();
  document.addEventListener('pointerdown', function () { if (UI.busy) UI.skipStep = true; }, true);
}
/* test hooks */
UI.sim = function (n) { for (var i = 0; i < (n || 1); i++) { if (!G || G.over) return; if (G.phase === 'plan') { G.cars.forEach(function (c) { if (!c.plan) c.plan = aiPlan(G, c); }); startResolve(G); } while (G.phase === 'resolve') { if (G.pend) slipChoice(G, true); else resolveNext(G); } } };
UI.forceEnd = function () { if (!G) return; G.cars[0].pos = total(G); G.cars.forEach(function (c, i) { c.pos = i === 0 ? total(G) : c.pos; }); UI.vis.forEach(function (v, i) { v.p = G.cars[i].pos; }); };
window.RR = { newGame: newGame, performMove: submitPlan, validMoves: validMoves, sideToAct: sideToAct, checkInvariants: checkInvariants, start: startGame };
window.UI = UI;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
