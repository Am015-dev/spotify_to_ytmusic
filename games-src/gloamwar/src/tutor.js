/* Gloamwar teaching layer: map key, help menu, screen guide (labelled callouts) and a free-order lesson checklist.
   Every window floats, drags, minimises to a chip and closes. Nothing dims the screen or blocks a tap. */
var TUT_DICE = { D: ['C', 'M', 'X', 'E'], G: ['A', 'M', 'C', 'E', 'X', 'A', 'M'] };
var LEGEND = [
  ['ico-army', 'Army', 'Round token, big number = troops. Blue is Dawn, red is Gloam.', function () { return '<circle cx="20" cy="20" r="17" fill="#0d0a07"/><circle cx="20" cy="20" r="14" fill="#1d4fae" stroke="#fff" stroke-width="2.5"/><text x="20" y="26" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" font-family="Arial">3</text>'; }],
  ['ico-elite', 'Elite troops', 'Gold square on an army: how many elites. An elite takes two hits.', function () { return '<rect x="7" y="7" width="26" height="26" rx="4" fill="#f2c230" stroke="#0d0a07" stroke-width="2.5"/><text x="20" y="26" text-anchor="middle" font-size="17" font-weight="700" font-family="Arial">2</text>'; }],
  ['ico-leader', 'Leader', 'White shield on an army: leaders let you re-roll misses.', function () { return '<path transform="translate(20,20)" d="' + shieldD(28) + '" fill="#fff" stroke="#0d0a07" stroke-width="2.5"/><text x="20" y="26" text-anchor="middle" font-size="17" font-weight="700" fill="#1d4fae" font-family="Arial">1</text>'; }],
  ['ico-garrison', 'Besieged garrison', 'Square token: troops inside their walls. Hard to attack.', function () { return '<rect x="6" y="9" width="28" height="26" rx="4" fill="#b3161c" stroke="#fff" stroke-width="2.5"/><path d="M6,9 h6 v-4 h6 v4 h6 v-4 h6 v4 h4" fill="none" stroke="#fff" stroke-width="2"/>'; }],
  ['ico-rider', 'Gloamrider', 'Black disc with a wraith: a Gloam leader that flies anywhere.', function () { return '<circle cx="20" cy="20" r="16" fill="#0d0a07" stroke="#ff4b4b" stroke-width="2.5"/>' + icoPath('wraith', 20, 19, 24, '#fff'); }],
  ['ico-hero', 'Hero', 'Light shield: a Dawn champion who leads armies.', function () { return '<path transform="translate(20,20)" d="' + shieldD(30) + '" fill="#f4f1ea" stroke="#1d4fae" stroke-width="3"/>' + icoPath('sword', 20, 19, 20, '#1d4fae'); }],
  ['ico-minion', 'Minion', 'Dark shield: a Gloam champion. Each gives the Gloam +1 die.', function () { return '<path transform="translate(20,20)" d="' + shieldD(30) + '" fill="#2a0d0d" stroke="#b3161c" stroke-width="3"/>' + icoPath('skull', 20, 19, 20, '#ff6b6b'); }],
  ['ico-company', 'The Company', 'Lantern disc: carries the Crown. Black while hidden, red once found.', function () { return '<circle cx="20" cy="20" r="16" fill="#14100c" stroke="#ffcf5a" stroke-width="3"/>' + icoPath('lantern', 20, 19, 20, '#ffcf5a'); }],
  ['ico-progress', 'Company steps', 'Gold +N on the lantern: steps walked since it was last seen.', function () { return '<circle cx="20" cy="20" r="14" fill="#ffcf5a" stroke="#0d0a07" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-size="15" font-weight="700" font-family="Arial">+2</text>'; }],
  ['ico-strong', 'Stronghold', 'Square castle plate, 2 points. Plate colour = who holds it.', function () { return plateSvg('strong', 20, 20, '#1d4fae').replace(/46/g, '30'); }],
  ['ico-city', 'City', 'Round town plate, 1 point. Plate colour = who holds it.', function () { return '<circle cx="20" cy="20" r="16" fill="#b3161c" stroke="#fff" stroke-width="3"/>' + icoPath('city', 20, 20, 22, '#fff'); }],
  ['ico-fort', 'Fortification', 'Diamond plate: a river crossing that defends well. No points.', function () { return '<path d="M20,3 L37,20 L20,37 L3,20Z" fill="#1d4fae" stroke="#fff" stroke-width="3"/>' + icoPath('fort', 20, 20, 18, '#fff'); }],
  ['ico-town', 'Town', 'Small round plate: musters troops. No points.', function () { return '<circle cx="20" cy="20" r="13" fill="#1d4fae" stroke="#fff" stroke-width="3"/>' + icoPath('watch', 20, 20, 16, '#fff'); }],
  ['ico-mountain', 'Mountain wall', 'Grey peaks: nobody crosses them.', function () { return peak(20, 26, 30); }],
  ['ico-river', 'River', 'Blue line: only a border, armies may cross.', function () { return '<path d="M2,30 C12,10 26,34 38,12" fill="none" stroke="#0d0a07" stroke-width="7"/><path d="M2,30 C12,10 26,34 38,12" fill="none" stroke="#6fb0dc" stroke-width="4"/>'; }],
  ['ico-road', 'Ashen Road step', 'Numbered gold dots: the last 5 steps to the Kiln.', function () { return '<circle cx="20" cy="20" r="13" fill="#1a1410" stroke="#ffcf5a" stroke-width="3"/><text x="20" y="26" text-anchor="middle" font-size="16" font-weight="700" fill="#ffcf5a" font-family="Arial">3</text>'; }],
  ['ico-kiln', 'The Kiln', 'Orange mountain: bring the Company here to win.', function () { return '<circle cx="20" cy="20" r="17" fill="#1a1410" stroke="#ff7a1a" stroke-width="3"/>' + icoPath('volcano', 20, 20, 24, '#ff7a1a'); }]];
function infoKey(k) { var x = LEGEND.filter(function (l) { return l[0] === 'ico-' + k; })[0]; if (x) TUT.win('info', x[1], '<p>' + x[2] + '</p>', { near: true }); }
var TUT = { on: false, done: {}, cur: null };
TUT.stop = function () { TUT.on = false; ['lessons', 'guide', 'lesson'].forEach(function (k) { TUT.close(k); }); TUT.ring(null); TUT.guideOff(); document.body.classList.remove('tut'); };
/* ---- floating window: drag by the header, minimise to a chip, close */
TUT.wins = {};
TUT.win = function (id, title, html, o) {
  o = o || {}; var w = TUT.wins[id];
  if (!w) { w = document.createElement('div'); w.className = 'tw'; w.id = 'tw-' + id; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'false'); document.body.appendChild(w); TUT.wins[id] = w; }
  w.innerHTML = '<header><b>' + title + '</b><button type="button" class="tmin" aria-label="Minimise">–</button><button type="button" class="tx" aria-label="Close">✕</button></header><div class="twb">' + html + '</div>';
  w.style.display = ''; var chip = document.getElementById('chip-' + id); if (chip) chip.remove();
  if (o.width) w.style.width = o.width + 'px';
  if (!w._placed) { var W = innerWidth, H = innerHeight, ww = o.width || Math.min(320, W - 24); w.style.left = (o.left != null ? o.left : W < 700 ? (W - ww) / 2 : W - ww - 180) + 'px'; w.style.top = (o.top != null ? o.top : W < 700 ? H * 0.40 : 70) + 'px'; w._placed = true; }
  TUT.keepIn(w);
  w.querySelector('.tx').onclick = function () { TUT.close(id); if (o.onClose) o.onClose(); };
  w.querySelector('.tmin').onclick = function () { TUT.minimise(id, o.chip || title); };
  var hd = w.querySelector('header'), st = null;
  hd.onpointerdown = function (e) { if (e.target.tagName === 'BUTTON') return; st = { x: e.clientX, y: e.clientY, l: w.offsetLeft, t: w.offsetTop }; try { hd.setPointerCapture(e.pointerId); } catch (er) { } };
  hd.onpointermove = function (e) { if (!st) return; w._moved = true; w.style.left = st.l + e.clientX - st.x + 'px'; w.style.top = st.t + e.clientY - st.y + 'px'; TUT.keepIn(w); };
  hd.onpointerup = hd.onpointercancel = function () { st = null; };
  return w;
};
TUT.keepIn = function (w) { var r = w.getBoundingClientRect(); w.style.left = Math.max(6, Math.min(innerWidth - r.width - 6, r.left)) + 'px'; w.style.top = Math.max(6, Math.min(innerHeight - Math.min(r.height, 120) - 6, r.top)) + 'px'; };
TUT.close = function (id) { var w = TUT.wins[id]; if (w) { w.remove(); delete TUT.wins[id]; } var c = document.getElementById('chip-' + id); if (c) c.remove(); if (id === 'lesson') TUT.ring(null); if (id === 'guide') TUT.guideOff(); };
TUT.minimise = function (id, label) {
  var w = TUT.wins[id]; if (!w) return; w.style.display = 'none'; if (id === 'guide') TUT.guideOff();
  var c = document.createElement('button'); c.type = 'button'; c.className = 'twchip'; c.id = 'chip-' + id; c.textContent = label; c.style.left = '8px'; c.style.bottom = (document.getElementById('dock').offsetHeight + 70) + 'px';
  c.onclick = function () { c.remove(); w.style.display = ''; if (id === 'guide') TUT.guideOn(); }; document.body.appendChild(c);
};
/* ---- pulse ring on the suggested target (never blocks taps) */
TUT.ring = function (fn) { TUT.ringFn = fn; clearInterval(TUT.ringT); var r = document.getElementById('pring'); if (!fn) { if (r) r.remove(); return; }
  if (!r) { r = document.createElement('div'); r.className = 'pring'; r.id = 'pring'; document.body.appendChild(r); }
  var upd = function () { var e = null; try { e = TUT.ringFn && TUT.ringFn(); } catch (er) { } if (!e || !e.getBoundingClientRect) { r.style.display = 'none'; return; } var b = e.getBoundingClientRect(), d = Math.max(52, Math.min(140, Math.max(b.width, b.height) + 14)); r.style.display = ''; r.style.width = r.style.height = d + 'px'; r.style.left = (b.left + b.width / 2 - d / 2) + 'px'; r.style.top = (b.top + b.height / 2 - d / 2) + 'px'; };
  upd(); TUT.ringT = setInterval(upd, 300); };
/* ---- help menu (from the ? button) */
function helpMenu() {
  TUT.win('help', 'Help', '<div class="row2" style="flex-direction:column"><button type="button" id="hmG" class="pri">Screen guide: what is on screen</button><button type="button" id="hmL">Lessons checklist</button><button type="button" id="hmK">Map key: every icon</button><button type="button" id="hmR">Full rules</button></div>', { chip: 'Help' });
  $('#hmG').onclick = function () { TUT.close('help'); TUT.guide(); }; $('#hmL').onclick = function () { TUT.close('help'); TUT.lessons(); };
  $('#hmK').onclick = function () { TUT.close('help'); openLegend(); }; $('#hmR').onclick = function () { TUT.close('help'); try { GXH.rules(phaseId() || undefined); } catch (e) { } };
}
function openLegend() {
  var present = {}; document.querySelectorAll('#map [class*="ico-"]').forEach(function (e) { (e.getAttribute('class') || '').split(/\s+/).forEach(function (c) { if (c.indexOf('ico-') === 0) present[c] = 1; }); });
  var html = '<div id="legend">' + LEGEND.map(function (l) { return '<div class="lg" data-k="' + l[0] + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + l[3]() + '</svg><div><b>' + l[1] + '</b><span>' + l[2] + '</span></div></div>'; }).join('') + '</div><p class="why"><b>Region colour = nation.</b> Tap anything on the map for its name.</p><div style="display:flex;flex-wrap:wrap;gap:6px">' + NAT_ORDER.map(function (k) { return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:.87rem"><i style="width:16px;height:16px;border-radius:4px;border:2px solid #14100c;background:' + TINT[k] + '"></i>' + NATIONS[k].short + ' (' + (NATIONS[k].side === 'D' ? 'Dawn' : 'Gloam') + ')</span>'; }).join('') + '</div>';
  TUT.win('key', 'Map key', html, { chip: 'Key' });
  try { if (window.TUT && TUT.on) TUT.act({ what: 'legend' }); } catch (e) { }
}
/* ---- screen guide: a callout label with a leader line for every HUD element */
var HUD_PARTS = [
  ['#menuB', 'Menu', 'Settings, sound, new game and quit.'],
  ['#helpB', 'Help', 'Opens this guide, the lessons, the map key and the rules.'],
  ['#logB', 'War log', 'Everything that happened, including every dice roll.'],
  ['#msg', 'What to do now', 'One line that always says your next step.'],
  ['#cD', 'Dawn card', 'Dawn points to win, troops and regions held. Tap for the list.'],
  ['#cG', 'Gloam card', 'Gloam points to win, troops and regions held. Tap for the list.'],
  ['#cT', 'Taint track', 'At 12 taint the Gloam wins. The Hunt pushes it up.'],
  ['#rival', 'Rival dice', 'The dice the rival rolled this turn, and its hunt box.'],
  ['#keyB', 'Map key', 'What every token and icon on the map means.'],
  ['#bulbbtn', 'Hint', 'Suggests a good move when you are stuck.'],
  ['#zin', 'Zoom', 'Zoom in and out; you can also pinch and drag the map.'],
  ['#phase', 'Phase banner', 'Which phase it is, whose turn, and how far the turn is.'],
  ['#mydice', 'Your dice', 'Your action dice. Tap one, then choose what it does.'],
  ['#tCards', 'Cards', 'Your hand of cards; the number is how many.'],
  ['#tNat', 'Nations', 'How close each nation is to war; the number is how many fight.'],
  ['#tComp', 'Company', 'The Company and its taint; the number is the taint.'],
  ['#acts', 'Choices', 'The things you can do right now.']];
TUT.guideOff = function () { var g = document.getElementById('guide'); if (g) g.remove(); };
TUT.guideOn = function () {
  TUT.guideOff(); var g = document.createElement('div'); g.id = 'guide'; document.body.appendChild(g);
  var placed = [], lines = [], W = innerWidth, H = innerHeight, tw = TUT.wins.guide;
  var avoid = tw && tw.style.display !== 'none' ? [tw.getBoundingClientRect()] : [];
  HUD_PARTS.forEach(function (p) { var e = document.querySelector(p[0]); if (e) { var r = e.getBoundingClientRect(); if (r.width) avoid.push(r); } }); document.querySelectorAll('#acts .act,#side .pc,#hudL .rb,#zoomb .rb').forEach(function (e) { avoid.push(e.getBoundingClientRect()); });
  var hit = function (a, b) { return a.left < b.right + 3 && a.right > b.left - 3 && a.top < b.bottom + 3 && a.bottom > b.top - 3; };
  HUD_PARTS.forEach(function (p) {
    var e = document.querySelector(p[0]); if (!e) return; var r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    var l = document.createElement('button'); l.type = 'button'; l.className = 'gl'; l.textContent = p[1]; l.dataset.for = p[0]; g.appendChild(l);
    var w = l.offsetWidth, h = l.offsetHeight, cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null;
    for (var dist = 8; dist < 480 && !best; dist += 10) {
      var c = [[cx - w / 2, r.bottom + dist], [cx - w / 2, r.top - dist - h], [r.right + dist, cy - h / 2], [r.left - dist - w, cy - h / 2]];
      for (var an = 0; an < 16; an++) { var A = an * Math.PI / 8, ex = Math.cos(A) * (dist + r.width / 2 + w / 2), ey = Math.sin(A) * (dist + r.height / 2 + h / 2); c.push([cx + ex - w / 2, cy + ey - h / 2]); }
      for (var i = 0; i < c.length; i++) { var b = { left: c[i][0], top: c[i][1], right: c[i][0] + w, bottom: c[i][1] + h }; if (b.left < 4 || b.top < 4 || b.right > W - 4 || b.bottom > H - 4) continue; if (placed.some(function (q) { return hit(b, q); }) || avoid.some(function (q) { return hit(b, q); })) continue; best = b; break; }
    }
    if (!best) { l.remove(); return; }
    l.style.left = best.left + 'px'; l.style.top = best.top + 'px'; placed.push(best);
    var lx = Math.max(best.left, Math.min(best.right, cx)), ly = Math.max(best.top, Math.min(best.bottom, cy)), tx = Math.max(r.left, Math.min(r.right, lx)), ty = Math.max(r.top, Math.min(r.bottom, ly));
    lines.push('<line x1="' + lx + '" y1="' + ly + '" x2="' + tx + '" y2="' + ty + '" stroke="#14100c" stroke-width="4"/><line x1="' + lx + '" y1="' + ly + '" x2="' + tx + '" y2="' + ty + '" stroke="#ffcf5a" stroke-width="2"/><circle cx="' + tx + '" cy="' + ty + '" r="4" fill="#ffcf5a" stroke="#14100c" stroke-width="1.5"/>');
    l.onclick = function () { g.querySelectorAll('.gl').forEach(function (x) { x.classList.remove('on'); }); l.classList.add('on'); var t = document.getElementById('gtext'); if (t) t.innerHTML = '<b>' + p[1] + ':</b> ' + p[2]; TUT.seenParts[p[0]] = 1; };
  });
  var sv = document.createElementNS(SVGNS, 'svg'); sv.innerHTML = lines.join(''); g.insertBefore(sv, g.firstChild);
};
TUT.seenParts = {};
TUT.guide = function () {
  var W = innerWidth, H = innerHeight;
  TUT.win('guide', 'Screen guide', '<p id="gtext">Every yellow label names a part of the screen. Tap a label to hear what it does.</p><div class="row2"><button type="button" class="pri" id="gNext">Got it: lessons</button></div>', { chip: 'Guide', width: W < 700 ? 230 : 320, left: W < 700 ? W - 240 : (W - 320) / 2, top: W < 700 ? H * 0.42 : H * 0.36, onClose: function () { TUT.guideOff(); } });
  $('#gNext').onclick = function () { TUT.close('guide'); TUT.done.guide = 1; TUT.lessons(); };
  TUT.guideOn();
};
/* ---- lessons: a tick-off checklist on the real board, any order */
var q = function (s) { return function () { return document.querySelector(s); }; };
var LESSONS = [
  { id: 'win', t: 'What wins', target: q('#cD'), say: ['The Dawn League wins by carrying the Company into the Kiln, or by taking 4 points of Gloam strongholds and cities.', 'The Gloam wins with 10 points of Dawn places, or when taint reaches 12.'], why: 'So every move either walks the Company or guards your points.', ok: function (a) { return a.what === 'vp'; } },
  { id: 'turn', t: 'How a turn works', target: q('#phase'), say: ['Each turn has phases: Company (hide or reveal it), Hunt (the Gloam sets dice aside to hunt), then Actions.', 'In Actions both sides take turns, one die each, until all dice are used.'], why: 'The strip under the banner shows where you are in the turn.', ok: function (a) { return a.what === 'move' && G && G.phase === 'act'; } },
  { id: 'dice', t: 'Your action dice', target: function () { return document.querySelector('#mydice .die.can') || document.querySelector('#mydice'); }, say: ['Each die face is a kind of action: hood = Character (the Company and heroes), crossed swords = Army, scroll = Muster (troops and nations), helmet = Muster or Army, raven = Event (cards).', 'Tap a die to see what it can do.'], why: 'Dice are your whole budget: plan which job each one does.', ok: function (a) { return a.what === 'die'; } },
  { id: 'move', t: 'Move an army', target: function () { return document.querySelector('#mydice .die.can[data-f="X"]') || document.querySelector('#acts .act[data-key="amove"]') || document.querySelector('#dyn .tok.legal'); }, say: ['Tap the helmet or crossed-swords die, then Move armies.', 'Tap a glowing army, then a glowing region next to it.'], why: 'Armies must stand next to a target before they can attack it.', ok: function (a) { return a.what === 'move' && a.side === UI.side && (a.evs || []).some(function (e) { return e.k === 'move' && e.s === UI.side; }); } },
  { id: 'attack', t: 'Attack and dice', target: q('#cG'), say: ['An attack rolls one die per troop, up to 5. Each 5 or 6 is a hit (a 1 always misses); leaders re-roll misses.', 'Each hit removes a troop. Only nations at war can attack.'], why: 'Big armies hit more often, so gather troops before you strike.', ok: function (a) { return a.what === 'move' && (a.evs || []).some(function (e) { return e.k === 'battle' || e.k === 'round'; }); } },
  { id: 'card', t: 'Use a card', target: q('#tCards'), say: ['The Event die draws a card or plays one. The badge shows how many you hold.', 'Cards also help in battles: one is played each round.'], why: 'Cards bend the rules in your favour at the right moment.', ok: function (a) { return a.what === 'move' && (a.evs || []).some(function (e) { return e.k === 'card' || e.k === 'draw'; }) || a.what === 'cards'; } },
  { id: 'track', t: 'The taint track', target: q('#cT'), say: ['When the Company moves, the Gloam rolls its hunt dice. Each 6 finds it and adds taint.', 'Taint never goes down easily: at 12 the Gloam wins.'], why: 'Move the Company in bursts, and hide again when the hunt grows.', ok: function (a) { return a.what === 'taint'; } },
  { id: 'end', t: 'What ends the game', target: q('#cG'), say: ['The game ends at once when the Company reaches the Kiln or taint hits 12.', 'Points are checked at the end of each turn.'], why: 'A race: the Dawn sprints, the Gloam counts points and taint.', ok: function () { return false; } }];
TUT.lessons = function () {
  var n = LESSONS.filter(function (l) { return TUT.done[l.id]; }).length;
  var html = '<p>' + n + ' of ' + LESSONS.length + ' done. Pick any lesson; you can keep playing while you learn.</p><ul>' + LESSONS.map(function (l) { return '<li class="' + (TUT.done[l.id] ? 'done' : '') + '"><button type="button" data-l="' + l.id + '"><i>' + (TUT.done[l.id] ? '✓' : '') + '</i>' + l.t + '</button></li>'; }).join('') + '</ul>';
  var w = TUT.win('lessons', 'Lessons ' + n + '/' + LESSONS.length, html, { chip: 'Lessons ' + n + '/' + LESSONS.length, top: innerWidth < 700 ? 124 : 70 });
  w.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { TUT.lesson(b.dataset.l); }; });
  if (innerWidth < 700 && !w._moved) { var dt = document.getElementById('dock').getBoundingClientRect().top; w.style.top = Math.max(150, dt - w.offsetHeight - 64) + 'px'; }
};
TUT.lesson = function (id) {
  var l = LESSONS.filter(function (x) { return x.id === id; })[0]; TUT.cur = id; TUT.minimise('lessons', 'Lessons');
  TUT.win('lesson', l.t, l.say.map(function (t) { return '<p>' + t + '</p>'; }).join('') + '<p class="why">Why: ' + l.why + '</p><div class="row2"><button type="button" id="lBack">List</button><button type="button" class="pri" id="lNext">Next</button></div>', { chip: l.t });
  TUT.ring(l.target);
  $('#lNext').onclick = function () { TUT.tick(id); }; $('#lBack').onclick = function () { TUT.close('lesson'); TUT.lessons(); };
};
TUT.tick = function (id) {
  TUT.done[id] = 1; TUT.close('lesson'); TUT.cur = null; TUT.close('lessons');
  var left = LESSONS.filter(function (l) { return !TUT.done[l.id]; });
  if (!left.length) { TUT.win('lesson', 'You know the basics', '<p>Hide the Company, wake the nations, and reach the Kiln.</p><p class="why">The ? button reopens the guide, the lessons and the map key at any time.</p><div class="row2"><button type="button" class="pri" id="lDone">Play on</button></div>', {}); $('#lDone').onclick = function () { TUT.close('lesson'); TUT.on = false; ls('gw-played', 1); }; return; }
  TUT.lessons();
};
TUT.act = function (a) {
  if (!TUT.on || !TUT.cur) return true; var l = LESSONS.filter(function (x) { return x.id === TUT.cur; })[0];
  try { if (l && l.ok(a)) setTimeout(function () { if (TUT.cur === l.id) TUT.tick(l.id); }, 400); } catch (e) { }
  return true;
};
function startTutorial() {
  TUT.stop(); TUT.on = true; TUT.done = {}; TUT.seenParts = {};
  document.body.classList.add('tut');
  startGame({ side: 'D', level: 'easy', seed: 4242, mode: 'tut', dice: TUT_DICE });
  setTimeout(function () { TUT.guide(); }, 350);
}
