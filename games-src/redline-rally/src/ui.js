/* Redline Rally UI: title, canvas track (follow camera, animated cars), hand/gear panel, hot-seat, result. */
var G = null;
var UI = { sel: [], gear: 1, boost: false, busy: false, seat: 0, cam: { x: 0, y: 0, s: 0.4 }, vis: [], pops: [], focus: 0, fast: /[?&]fast=1/.test(location.search), flash: null, tipShown: false, set: { track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal', upg: false } };
window.ANIM = true; window.AIDELAY = 1;
var $ = function (s) { return document.querySelector(s); };
function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
function wait(ms) { return new Promise(function (r) { setTimeout(r, (UI.fast || window.ANIM === false) ? Math.min(ms, 8) : ms * (window.AIDELAY || 1)); }); }
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
  chooser('#s-track', Object.keys(TRACKDEFS).map(function (k) { return { v: k, h: esc(TRACKDEFS[k].name) + '<small>' + esc(TRACKDEFS[k].blurb) + '</small>' }; }), 'track');
  chooser('#s-laps', [1, 2, 3].map(function (n) { return { v: n, h: n + (n > 1 ? ' laps' : ' lap') }; }), 'laps');
  chooser('#s-opp', [1, 2, 3, 4, 5].filter(function (n) { return n + s.hum <= 6 && n + s.hum >= 2; }).map(function (n) { return { v: n, h: String(n) }; }), 'opp');
  chooser('#s-hum', [1, 2, 3].map(function (n) { return { v: n, h: n === 1 ? '1 (you)' : n + ' (pass-and-play)' }; }), 'hum');
  chooser('#s-upg', [{ v: false, h: 'Off' }, { v: true, h: 'On<small>Draft 3 upgrade cards first</small>' }], 'upg');
  chooser('#s-diff', ['easy', 'normal', 'hard'].map(function (d) { return { v: d, h: d[0].toUpperCase() + d.slice(1) }; }), 'diff');
  var qt = $('#quickT'); if (qt && !qt._set) { qt._set = 1; var op = innerHeight >= 880; $('#quickBody').hidden = !op; qt.setAttribute('aria-expanded', op ? 'true' : 'false'); qt.onclick = function () { var h = !$('#quickBody').hidden; $('#quickBody').hidden = h; qt.setAttribute('aria-expanded', h ? 'false' : 'true'); }; } $('#tutSlot').innerHTML = tutBtn('ghostb'); $('#storyLine').innerHTML = typeof campLine === 'function' ? campLine() : ''; $('#title').setAttribute('data-art', 'bg-title'); artApply($('#title'));
}
function showTitle() { try { GX.close(); } catch (e) { } $('#title').hidden = false; $('#game').hidden = true; closeModal(); drawSetup(); }
function modal(html) { var m = $('#modal'); m.innerHTML = '<div class="sheet"><button class="xb" aria-label="Close" id="mx">✕</button>' + html + '</div>'; m.hidden = false; $('#mx').onclick = closeModal; m.onclick = function (e) { if (e.target === m) closeModal(); }; artApply(m); }
function closeModal() { var m = $('#modal'); m.hidden = true; m.innerHTML = ''; m.onclick = null; }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#modal').hidden && !UI.lockModal) closeModal(); });
function rulesFill() {
  var h = ('<p>Be first across the line after all laps. Each round you pick a <b>gear</b> and play that many cards. The total is your speed: you move that many spaces.</p>' +
    '<h3>Each round</h3><ul><li><b>Gear 1-4</b>: shift one step free, or two steps for 1 heat. Gear = cards you play.</li><li><b>Corners</b> have a speed limit. Every point over costs 1 heat from your engine. No heat left? You spin out: back behind the corner, gear 1, plus a stress card.</li><li><b>Slipstream</b>: end next to or right behind another car and you may glide 2 more spaces. It does not count as speed.</li><li><b>Boost</b>: pay 1 heat to flip cards from your deck until a speed card shows, and add it.</li><li><b>Cooldown</b>: gear 1 sends up to 3 heat from your hand back to the engine, gear 2 sends 1.</li><li><b>Adrenaline</b>: the car in last place gets +1 move and +1 cooldown.</li></ul>' +
    '<h3>Cards</h3><ul><li>Speed 1, 2, 3, 4: three of each.</li><li>Stress (3): when played, flip your deck until a speed card shows and use it.</li><li>Heat (6 start in your engine): paying sends them to your discard pile. They clog your hand later and cannot be played.</li></ul>' +
    '<h3>Upgrades (optional)</h3><ul><li>Switch Upgrades on in setup. Before the race you pick 3 upgrade cards; they join your deck and are played like speed cards, each with a bonus (more cooling, higher corner limits, a big speed jump).</li></ul>' +
    '<p>Kept simple: stress cards come from an unlimited reserve, the starting upgrade cards are left out, and cooldown is taken when you shift gear.</p><p>Brake and keep your heat, or push and burn it. Heat comes back around.</p><div id="howTut">' + tutBtn('ghostb', { launch: function () { GX.close(); closeModal(); tutStart(); } }) + '</div>');
  var d = $('#rulesbody'); d.innerHTML = h; artApply(d);
}
function howTo() { rulesFill(); GX.show('rulesd'); }

/* ================= game start ================= */
function startGame(o) {
  var s = o || UI.set; UI.mode = o && o.tut ? 'tutorial' : ''; if (!(o && o.cmp)) UI.cmpDef = null; if (!(o && o.tut)) lsSet('rr_seen', '1');
  G = newGame({ track: s.track, laps: s.laps, n: s.hum + s.opp, humans: s.hum, diff: s.diff, seed: o && o.seed, upg: !!s.upg, climit: s.climit, lowheat: s.lowheat, cmp: s.cmp });
  window.G = G; UI.seat = 0; UI.sel = []; UI.boost = false; UI.busy = false; UI.pops = [];
  UI.vis = G.cars.map(function (c) { return { p: c.pos, rot: 0, glow: 0 }; });
  UI.focus = 0; $('#title').hidden = true; $('#game').hidden = false; closeModal();
  $('#tTrk').textContent = TK[G.track].name;
  sizeCanvas(); var f = UI.vis[0]; snapCam(); UI.redraw();
  if (o && o.tut) stageTutorial();
  if (G.drafting) { $('#panel').innerHTML = ''; setMsg('Pick your upgrade cards'); return runDraft(function () { UI.lockModal = false; closeModal(); planFor(needPlans(G)[0]); }); }
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
  for (var g = 1; g <= GEARS; g++) { var o = go.filter(function (x) { return x.g === g; })[0]; h += '<button class="gb' + (UI.gear === g ? ' on' : '') + (o ? '' : ' off') + '" data-g="' + g + '" ' + (o ? '' : 'disabled') + ' aria-label="Gear ' + g + '">' + g + (o && o.cost ? '<i>-1</i>' : '') + '</button>'; }
  h += '</div><div id="hand">';
  c.hand.forEach(function (x, j) { h += cardHtml(x, UI.sel.indexOf(j) >= 0, x === 'H', j); });
  h += '</div><div id="acts"><button class="bo' + (UI.boost ? ' on' : '') + '" id="boostB"' + (c.eng - (Math.abs(UI.gear - c.gear) === 2 ? 1 : 0) < 1 ? ' disabled' : '') + '>Boost -1</button><button id="sugB">Suggest</button><button class="go" id="goB">Go!</button></div>';
  h += '<div class="chips tray" id="tray" data-art="ui-engine-tray"><span><i class="ic f-heat" data-art="icon-heat"></i>Engine <b data-engine="G.cars[' + c.i + '].eng">' + c.eng + '</b></span><span><i class="ic f-heat" data-art="icon-heat"></i>In hand <b>' + c.hand.filter(function (x) { return x === 'H'; }).length + '</b></span><span><i class="ic f-stress" data-art="icon-stress"></i>Stress in hand <b>' + c.hand.filter(function (x) { return x === 'X'; }).length + '</b></span><span>Deck <b>' + c.deck.length + '</b></span><span>Discard <b>' + c.disc.length + '</b></span></div>';
  p.innerHTML = h; artApply(p);
  p.querySelectorAll('.gb').forEach(function (b) { b.onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'gear', g: +b.getAttribute('data-g') })) return; sfx('gear'); UI.gear = +b.getAttribute('data-g'); UI.sel = UI.sel.slice(0, needCards(c, UI.gear)); if (c.eng - (Math.abs(UI.gear - c.gear) === 2 ? 1 : 0) < 1) UI.boost = false; drawPlan(); }; });
  p.querySelectorAll('.cd').forEach(function (b) { b.onclick = function () { var j = +b.getAttribute('data-i'); if (c.hand[j] === 'H') { setMsg('Heat cards cannot be played.', 'warn'); return; } var k = UI.sel.indexOf(j);
    if (tutOn()) { if (k >= 0 || !GXT.act({ type: 'tap', what: 'card', i: j })) return; }
    sfx('card'); UI.note = upgId(c.hand[j]) ? UPG[upgId(c.hand[j])].name + ': ' + UPG[upgId(c.hand[j])].txt : ''; if (k >= 0) UI.sel.splice(k, 1); else { if (UI.sel.length >= needCards(c, UI.gear)) UI.sel.shift(); UI.sel.push(j); } drawPlan(); }; });
  $('#boostB').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'boost' })) return; sfx('boost'); UI.boost = !UI.boost; drawPlan(); };
  $('#sugB').onclick = function () { if (tutOn() && !GXT.act({ type: 'tap', what: 'suggest' })) return; sfx('tap'); suggest(); }; $('#goB').onclick = commit;
  var ready = UI.sel.length === need; $('#goB').disabled = !ready;
  if (!ready) setMsg(need === 0 ? 'No playable cards: tap Go.' : 'Pick ' + (need - UI.sel.length) + ' more card' + (need - UI.sel.length > 1 ? 's' : ''));
  else { var ci = curveInfo(); var sp = 'Speed ' + ci.sp + (ci.uncertain ? '?' : ''); if (UI.note && /upgrade|:/.test(UI.note) && UI.sel.some(function (j) { return upgId(c.hand[j]); })) sp += ' (' + UI.note.split(':')[0] + ')'; setMsg(ci.spin ? sp + ': you would spin out!' : ci.burn ? sp + ': corner burns ' + ci.burn + ' heat' : ci.ks.length ? sp + ': corner is safe' : ci.next ? sp + ': clear road, corner in ' + ci.next.d : sp + ': clear road', ci.spin ? 'warn' : ci.burn ? 'warn' : 'good'); }
  if (!ready && need === 0) $('#goB').disabled = false;
  var dt = $('#dockt'); if (dt) dt.textContent = 'Round ' + G.round + ' · gear ' + UI.gear + ' · ' + UI.sel.length + '/' + need + ' cards';
  hud();
}
function cardHtml(x, sel, dead, j) {
  var u = upgId(x), stem = u ? 'card-upgrade-' + u : x === 'H' ? 'card-heat' : x === 'X' ? 'card-stress' : 'card-speed-' + x, lbl = u ? UPG[u].name : x === 'H' ? 'Heat' : x === 'X' ? 'Stress' : 'Speed';
  var val = u ? String(UPG[u].sp) : x === 'H' ? '' : x === 'X' ? '?' : x;
  if (u) return '<button class="cd U' + (sel ? ' sel' : '') + '" data-art="' + stem + '" data-i="' + j + '" aria-label="' + esc(UPG[u].name + ' speed ' + val + '. ' + UPG[u].txt) + '" title="' + esc(UPG[u].txt) + '"><span class="v">' + val + '</span><span class="t">' + esc(UPG[u].sn) + '</span></button>';
  return '<button class="cd ' + (x === 'H' ? 'H' : x === 'X' ? 'X' : 's' + x) + (sel ? ' sel' : '') + (dead ? ' dead' : '') + '" data-art="' + stem + '" data-i="' + j + '" aria-label="' + lbl + ' ' + (val || '') + '"><span class="v">' + val + '</span><span class="t">' + (x === 'H' ? 'Heat' : x === 'X' ? 'Stress' : '') + '</span></button>';
}
function suggest() {
  var c = you(), g2 = JSON.parse(JSON.stringify(G)), p = aiPlan(g2, g2.cars[c.i]);
  UI.gear = p.gear; UI.sel = p.idx.slice(); UI.boost = p.boost; drawPlan();
}
function commit() {
  if (tutOn() && !GXT.act({ type: 'tap', what: 'go' })) return; sfx('go');
  var c = you(), plan = { gear: UI.gear, idx: UI.sel.slice(), boost: UI.boost }, e = submitPlan(G, c.i, plan);
  if (e) { setMsg('Not allowed: ' + e, 'warn'); return; }
  $('#panel').innerHTML = '<div class="reveal"><div class="cd back" data-art="card-back"></div><div class="cd back" data-art="card-back"></div></div>'; artApply($('#panel'));
  var nx = needPlans(G)[0]; if (nx != null) planFor(nx); else startRound();
}
function startRound() { UI.busy = true; startResolve(G); runResolve(); }

/* ================= resolving, with animation ================= */
function setMsg(t, cls) { var m = $('#msg'); m.textContent = t; m.className = cls || ''; }
function hud() {
  if (!G) return; var order = rankList(G), h = G.cars.filter(function (c) { return c.human; })[0] || G.cars[0], me = G.cars[UI.seat] || h;
  var lap = Math.min(G.laps, Math.floor(me.pos / T(G).N) + 1);
  $('#tLap').textContent = lap + '/' + G.laps; $('#tPos').textContent = (order.indexOf(me.i) + 1) + '/' + G.cars.length;
}
async function runResolve() {
  hud();
  while (G.phase === 'resolve') {
    var ev = resolveNext(G); await playEvents(ev);
    if (G.pend) { var use = await askSlip(); ev = slipChoice(G, use); await playEvents(ev); }
  }
  UI.busy = false; UI.pops = [];
  if (G.over) { setMsg('Chequered flag!', 'good'); await wait(900); return showResult(); }
  if (window.__noPlan) return;
  UI.sel = []; var nx = needPlans(G)[0]; setMsg('Round ' + G.round); if (nx != null) planFor(nx); else startRound();
}
function carName(i) { return G.cars[i].human ? G.cars[i].name.split(' ')[0] : G.cars[i].name.split(' ')[0]; }
function tween(i, to, ms) {
  var v = UI.vis[i], from = v.p; if (window.ANIM === false || UI.fast || ms <= 0 || from === to) { v.p = to; return Promise.resolve(); }
  return new Promise(function (res) { var t0 = performance.now(); (function f(now) { var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; v.p = from + (to - from) * e; if (k < 1) requestAnimationFrame(f); else res(); })(t0); });
}
function pop(txt, at, col, stem) { UI.pops.push({ txt: txt, p: at, t: performance.now(), col: col || '#fff', stem: stem }); setTimeout(function () { UI.pops.shift(); }, 1500); }
async function playEvents(ev) {
  for (var k = 0; k < ev.length; k++) {
    var e = ev[k], c = G.cars[e.car], nm = e.car != null ? carName(e.car) : '';
    if (e.car != null) UI.focus = e.car;
    if (e.t === 'shift') setMsg(nm + ' shifts to gear ' + e.to + (e.cost ? ' (-1 heat)' : ''));
    else if (e.t === 'cool') { setMsg(nm + ' cools ' + e.n + ' heat'); }
    else if (e.t === 'play') { showPlayed(e); sfx('card'); setMsg(nm + ' plays speed ' + e.speed); await wait(c.human ? 750 : 520); }
    else if (e.t === 'boost') { sfx('boost'); setMsg(nm + ' boosts +' + e.add); pop('Boost +' + e.add, UI.vis[e.car].p, '#ffd24a', 'fx-boost-flare'); await wait(400); }
    else if (e.t === 'adr') setMsg(nm + ': adrenaline +1');
    else if (e.t === 'move') { var d = Math.abs(e.to - e.from); await tween(e.car, e.to, Math.min(1500, 170 * d + 200)); }
    else if (e.t === 'slip') { sfx('slip'); setMsg(nm + ' slipstreams +2'); pop('Slipstream', UI.vis[e.car].p, '#8ce6ff', 'fx-slipstream-streaks'); await tween(e.car, e.to, 450); }
    else if (e.t === 'corner') { if (e.cost) { if (c.human) sfx('burn'); setMsg(nm + ' burns ' + e.cost + ' heat in the corner'); pop('-' + e.cost + ' heat', UI.vis[e.car].p, '#ff6a3a', 'fx-heat-flame'); await wait(650); } else if (c.human) { sfx('clean'); setMsg(nm + ' takes the corner clean'); } }
    else if (e.t === 'spin') { sfx('spin'); setMsg(nm + ' spins out!', 'warn'); pop('SPIN OUT', e.to, '#ff4d3a', 'fx-spinout-smoke'); var v = UI.vis[e.car]; v.rot = 1; await tween(e.car, e.to, 500); await wait(500); v.rot = 0; }
    else if (e.t === 'finish') { setMsg(nm + ' crosses the line!', 'good'); await wait(500); }
    hud();
  }
  UI.redraw();
}
function showPlayed(e) {
  var h = '<div class="reveal">'; e.cards.forEach(function (x) {
    var stem = x.upg ? 'card-upgrade-' + x.upg : x.card === 'X' ? 'card-stress' : 'card-speed-' + x.card, v = x.v;
    h += '<div class="cd ' + (x.upg ? 'U' : x.card === 'X' ? 'X' : 's' + x.card) + '" data-art="' + stem + '"><span class="v">' + (x.card === 'X' ? '+' + v : x.upg ? v : x.card) + '</span><span class="t">' + (x.upg ? esc(UPG[x.upg].sn) : x.card === 'X' ? 'Stress' : '') + '</span></div>';
  });
  h += '</div><div class="chips"><span>Total speed <b>' + e.speed + '</b></span></div>'; $('#panel').innerHTML = h; artApply($('#panel'));
}
function askSlip() {
  var p = G.pend, c = G.cars[p.car], cost = cornerCost(G, p.from, p.L1, p.speed, p.lim) - cornerCost(G, p.from, p.L0, p.speed, p.lim);
  var spin = cornerCost(G, p.from, p.L1, p.speed, p.lim) > c.eng;
  setMsg(cost ? 'Slipstream +2 costs ' + cost + ' more heat' : 'Slipstream: glide 2 spaces free');
  $('#panel').innerHTML = '<div class="slipq"><button id="slipN">Stay</button><button class="y" id="slipY">Slipstream +2' + (cost ? ' (-' + cost + ' heat)' : '') + '</button></div>';
  return new Promise(function (res) { $('#slipY').onclick = function () { res(true); }; $('#slipN').onclick = function () { res(false); }; if (UI.fast) setTimeout(function () { res(!spin && cost === 0); }, 10); });
}

/* ================= result ================= */
function showResult() {
  if (typeof GXC !== 'undefined' && GXC.active && GXC.active() && UI.cmpDef) { var wc = G.cars[G.rank[0]]; sfx(wc.human ? 'win' : 'lose'); return GXC.finish(G); }
  UI.lockModal = true; var rows = '', me = G.cars.filter(function (c) { return c.human; });
  G.rank.forEach(function (ci, k) {
    var c = G.cars[ci], col = COLS[c.col].hex;
    rows += '<div class="stand' + (c.human ? ' you' : '') + '"><span class="n">' + (k + 1) + '</span><span class="pt" style="border-color:' + col + '" data-art="portrait-' + c.drv + '">' + (c.drv ? c.name[0] : '') + '</span><div style="flex:1"><b>' + esc(c.name) + (c.human ? ' (you)' : '') + '</b><small>Heat burned ' + c.stats.heat + ' · spin-outs ' + c.stats.spins + ' · slipstreams ' + c.stats.slips + '</small></div></div>';
  });
  var w = G.cars[G.rank[0]]; sfx(w.human ? 'win' : 'lose');
  modal('<div class="podium" data-art="bg-podium"><h2>' + (w.human ? 'You win!' : esc(w.name) + ' wins') + '</h2><i class="ic" data-art="ui-trophy" style="width:36px;height:36px"></i></div>' + rows + '<div class="row" style="margin-top:10px"><button class="big" id="again">Race again</button><button class="ghostb" id="home">Title</button></div>');
  $('#mx').hidden = true; $('#again').onclick = function () { UI.lockModal = false; startGame(); }; $('#home').onclick = function () { UI.lockModal = false; showTitle(); };
}

/* ================= canvas ================= */
var cv, cx, dpr = 1, trackCache = {};
function sizeCanvas() {
  cv = cv || $('#cv'); cx = cx || cv.getContext('2d'); var r = $('#cvw').getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(2, Math.round(r.width * dpr)); cv.height = Math.max(2, Math.round(r.height * dpr)); UI.W = r.width; UI.H = r.height;
  UI.cam.s = Math.max(0.28, Math.min(0.62, Math.min(UI.W, UI.H * 1.15) / 880));
}
window.addEventListener('resize', function () { if (G) { sizeCanvas(); } });
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
  var W = UI.W, H = UI.H, cam = UI.cam, tk = T(G); UI.spinT = (now % 600) / 600;
  var tgt = carXY(UI.focus, UI.vis[UI.focus].p), k = (UI.fast || window.ANIM === false) ? 1 : 0.12; cam.x += (tgt.x - cam.x) * k; cam.y += (tgt.y - cam.y) * k;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.fillStyle = '#245c37'; cx.fillRect(0, 0, W, H);
  cx.save(); cx.translate(W / 2, H / 2); cx.scale(cam.s, cam.s); cx.translate(-cam.x, -cam.y);
  if (!artDraw(cx, 'track-' + G.track, 0, 0, 2000, 1200, 'cover')) cx.drawImage(trackLayer(G.track), 0, 0, 2000, 1200);
  /* corner signs */
  tk.list.forEach(function (kk) {
    var q = tk.at(kk.idx * tk.seg), sx = q.x + Math.sin(q.a) * 98, sy = q.y - Math.cos(q.a) * 98;
    if (!artDraw(cx, 'ui-corner-sign', sx - 36, sy - 36, 72, 72, 'contain')) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(sx, sy, 34, 0, 7); cx.fill(); cx.lineWidth = 8; cx.strokeStyle = '#d8281d'; cx.stroke(); }
    cx.fillStyle = '#111'; cx.font = '900 38px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(climit(G, kk.limit), sx, sy + 2);
  });
  artDraw(cx, 'ui-flag-checkered', tk.at(0).x - 40, tk.at(0).y - 150, 80, 60, 'contain');
  /* cars: back to front */
  var ord = G.cars.map(function (c) { return c.i; }).sort(function (a, b) { return UI.vis[a].p - UI.vis[b].p; });
  ord.forEach(function (i) {
    var c = G.cars[i], p = carXY(i, UI.vis[i].p);
    drawCar(c, p, p.a, UI.vis[i].rot);
    if (c.human || i === UI.focus) { cx.fillStyle = '#fff'; cx.font = '800 26px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.strokeStyle = 'rgba(0,0,0,.75)'; cx.lineWidth = 6; var lb = c.human ? c.name.split(' ')[0] : String(c.name.split(' ')[0]); cx.strokeText(lb, p.x, p.y - 30); cx.fillText(lb, p.x, p.y - 30); }
  });
  /* pops */
  UI.pops.forEach(function (o) {
    var age = (now - o.t) / 1500; if (age > 1 || age < 0) return; var q = tk.space(o.p, 0); cx.globalAlpha = 1 - age * age; var y = q.y - 50 - age * 60;
    if (o.stem) artDraw(cx, o.stem, q.x - 50, y - 70, 100, 70, 'contain');
    cx.fillStyle = o.col; cx.font = '900 34px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.strokeStyle = '#000'; cx.lineWidth = 7; cx.strokeText(o.txt, q.x, y); cx.fillText(o.txt, q.x, y); cx.globalAlpha = 1;
  });
  cx.restore();
  /* minimap */
  var mw = Math.min(110, W * 0.3), mh = mw * 0.6, mx = W - mw - 6, my = 6, sc = mw / 2000;
  cx.fillStyle = 'rgba(8,12,20,.6)'; rr(mx - 3, my - 3, mw + 6, mh + 6, 8); cx.fill();
  cx.beginPath(); tk.dense.forEach(function (p, i) { if (i) cx.lineTo(mx + p[0] * sc, my + p[1] * sc); else cx.moveTo(mx + p[0] * sc, my + p[1] * sc); }); cx.closePath(); cx.strokeStyle = '#8b97ad'; cx.lineWidth = 3; cx.stroke();
  G.cars.forEach(function (c) { var q = tk.space(UI.vis[c.i].p, 0); cx.fillStyle = COLS[c.col].hex; cx.beginPath(); cx.arc(mx + q.x * sc, my + q.y * sc, c.human ? 3.6 : 2.6, 0, 7); cx.fill(); if (c.human) { cx.strokeStyle = '#fff'; cx.lineWidth = 1.2; cx.stroke(); } });
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
  $('#playB').onclick = function () { startGame(); }; $('#howB').onclick = howTo; $('#storyB').onclick = function () { campOpen(); }; soundBoot(); if (typeof helpBoot === 'function') helpBoot();
  $('#menuB').onclick = function () { modal('<h2>Menu</h2><div style="display:flex;flex-direction:column;gap:8px"><button class="ghostb" id="m1">How to play</button><button class="ghostb" id="m4">Guide: learn by doing</button><button class="ghostb" data-snd id="m5"></button><button class="ghostb" id="m2">Quit to title</button><button class="big" id="m3">Keep racing</button></div>'); $('#m1').onclick = howTo; $('#m4').onclick = function () { closeModal(); tutStart(); }; $('#m2').onclick = function () { showTitle(); }; $('#m3').onclick = closeModal; $('#m5').textContent = sndLabel(); $('#m5').onclick = function () { setSound(!SND.on); }; };
  var q = new URLSearchParams(location.search); if (q.get('seed')) UI.seedArg = +q.get('seed');
  artLoad(); showTitle();
}
/* test hooks */
UI.sim = function (n) { for (var i = 0; i < (n || 1); i++) { if (!G || G.over) return; if (G.phase === 'plan') { G.cars.forEach(function (c) { if (!c.plan) c.plan = aiPlan(G, c); }); startResolve(G); } while (G.phase === 'resolve') { if (G.pend) slipChoice(G, true); else resolveNext(G); } } };
UI.forceEnd = function () { if (!G) return; G.cars[0].pos = total(G); G.cars.forEach(function (c, i) { c.pos = i === 0 ? total(G) : c.pos; }); UI.vis.forEach(function (v, i) { v.p = G.cars[i].pos; }); };
window.RR = { newGame: newGame, performMove: submitPlan, validMoves: validMoves, sideToAct: sideToAct, checkInvariants: checkInvariants, start: startGame };
window.UI = UI;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
