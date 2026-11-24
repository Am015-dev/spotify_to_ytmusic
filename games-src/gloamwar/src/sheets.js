/* Gloamwar drawers: cards, nations (political track), the Company and the Hunt, the log, region and character info. Menu and rules (gx-help). */
function openSheet(kind, html) { UI.sheet = kind; UI.sheetAt = Date.now(); var s = $('#sheet'); s.innerHTML = '<h2>' + html.title + '<button class="ib x" type="button" aria-label="Close" onclick="closeSheet()">✕</button></h2>' + html.body; s.classList.add('on'); $('#scrim').classList.add('on'); var app = $('#app'); app.setAttribute('aria-hidden', 'true'); app.inert = true; if (html.wire) html.wire(s); }
function closeSheet(ev) { if (ev && ev.type === 'click' && Date.now() - (UI.sheetAt || 0) < 450) return; UI.sheet = null; $('#sheet').classList.remove('on'); $('#scrim').classList.remove('on'); var app = $('#app'); app.removeAttribute('aria-hidden'); app.inert = false; }
function refreshSheet() { var k = UI.sheet; if (k === 'cards') openCards(UI.discardMode); else if (k === 'nations') openNations(); else if (k === 'company') openCompany(); else if (k === 'log') openLog(); }
var TYPE_NAME = { C: 'Character', A: 'Army', M: 'Muster' };
var TYPE_ICON = { C: 'char', A: 'army', M: 'muster' };
function cardHtml(cid, extra, cls) {
  var c = CARD[cid], g = c.deck[0] === 'G';
  return '<div class="card' + (g ? ' g' : '') + (cls ? ' ' + cls : '') + '"><div class="ctype">' + TYPE_NAME[c.type] + ' event · ' + (c.deck[1] === 'C' ? 'character deck' : 'strategy deck') + (c.tab ? ' · stays in play' : '') + '</div>' +
    '<div class="ct">' + ico(TYPE_ICON[c.type], g ? '#6e130d' : '#1f1812', 22) + c.n + '</div><div class="eff">' + c.text + '</div>' +
    '<div class="cb">In battle: <b>' + c.cb.t + '</b> ' + c.cb.text + ' Goes ' + ordinal(c.cb.i) + '.</div>' + (extra || '') + '</div>';
}
function ordinal(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
function openCards(discard) { try { if (window.TUT && TUT.on) TUT.act({ what: 'cards' }); } catch (e) { }
  UI.discardMode = !!discard; var me = UI.side, ms = human(sideToAct(G)) && !UI.hold ? validMoves(G) : [], body = '';
  if (discard) body += '<p>Your hand holds more than 6 cards. Tap one to discard it.</p>';
  else body += '<p>' + (UI.die != null ? 'Cards your ' + FACE_NAME[G.dice[me][UI.die]] + ' die can play glow red.' : 'Pick a die first to play a card. An Event die plays any card; Character, Army and Muster dice play their own type.') + '</p>';
  var order = G.hand[me].slice().sort(function (a, b) { var pa = ms.some(function (m) { return m.a === 'card' && m.c === a && (UI.die == null || m.i === UI.die); }) ? 0 : 1, pb = ms.some(function (m) { return m.a === 'card' && m.c === b && (UI.die == null || m.i === UI.die); }) ? 0 : 1; return pa - pb; });
  order.forEach(function (cid) {
    var play = ms.filter(function (m) { return m.a === 'card' && m.c === cid && (UI.die == null || m.i === UI.die); })[0], dm = ms.filter(function (m) { return m.t === 'discard' && m.c === cid; })[0];
    var btn = discard && dm ? '<button class="btn red play" type="button" data-d="' + cid + '">Discard</button>' : play && UI.die != null ? '<button class="btn pri play" type="button" data-p="' + cid + '">Play</button>' : '';
    body += cardHtml(cid, btn, play && UI.die != null ? 'can' : (!discard && !cardPre(G, me, CARD[cid]) ? 'no' : ''));
  });
  if (!G.hand[me].length) body += '<p>No cards in hand.</p>';
  var tb = G.table.D.concat(G.table.G); if (tb.length) { body += '<h2 style="font-size:1.1rem">In play</h2>'; tb.forEach(function (c) { body += cardHtml(c); }); }
  body += '<p style="color:var(--ink2)">Decks left: your character ' + G.deck[me + 'C'].length + ', strategy ' + G.deck[me + 'S'].length + '. Rival holds ' + G.hand[other(me)].length + ' cards.</p>';
  openSheet('cards', { title: discard ? 'Discard a card' : 'Your cards', body: body, wire: function (s) {
    s.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var cid = b.dataset.p, m = ms.filter(function (x) { return x.a === 'card' && x.c === cid && x.i === UI.die; })[0]; if (!m || !tutOk({ type: 'tap', what: 'card', c: cid })) return; closeSheet(); apply(m); }; });
    s.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { closeSheet(); apply({ t: 'discard', c: b.dataset.d }); }; });
  } });
}
function natTok(n) { var p = G.pol[n], g = natSide(n) === 'G'; return '<span class="ntok' + (g ? ' g' : '') + (p.a ? '' : ' sleep') + '"><i style="background:' + NATIONS[n].col + '"></i>' + NATIONS[n].short + (p.a ? '' : ' (asleep)') + '</span>'; }
function openNations() {
  var body = '<p>Each nation moves down to <b>At War</b>. Only nations at war can attack and muster with dice. Sleeping Dawn nations stop one step short until something wakes them: an attack, an invasion, a hero or the Company.</p><div class="pol">';
  ['3 steps', '2 steps', '1 step', 'At War'].forEach(function (l) { body += '<div class="lab">' + l + '</div>'; });
  [3, 2, 1, 0].forEach(function (s) { body += '<div class="box' + (s === 0 ? ' war' : '') + '">' + NAT_ORDER.filter(function (n) { return G.pol[n].s === s; }).map(natTok).join('') + '</div>'; });
  body += '</div><h2 style="font-size:1.1rem">Reserves</h2><p style="font-size:.95rem">' + NAT_ORDER.map(function (n) { var r = G.R[n]; return '<b>' + NATIONS[n].short + '</b> ' + r[0] + ' regular, ' + r[1] + ' elite' + (r[2] ? ', ' + r[2] + (n === 'pt' ? ' Gloamrider' : ' leader') : ''); }).join(' · ') + '</p>';
  body += '<p style="font-size:.9rem;color:var(--ink2)">Dawn losses are gone for good. Gloam losses return to its reserves.</p>';
  openSheet('nations', { title: 'Nations', body: body });
}
function tileHtml(t) { var cls = 'tile' + (t.r ? ' r' : '') + (t.sp ? (HUNT_SPECIAL[t.sp].side === 'D' ? ' d' : ' sp') : ''); var face = t.v === 'eye' ? ico('eye', '#9a2117', 20) : t.v === 'die' ? 'd6' : t.v; return '<span class="' + cls + '" title="' + tileName(t) + '">' + face + '</span>'; }
function openCompany() { try { if (window.TUT && TUT.on) TUT.act({ what: 'taint' }); } catch (e) { }
  var F = G.F, me = UI.side, g = guideOf(G), body = '';
  body += '<p>The Company carries the Hollow Crown. Walk it to the Kiln of Kaldur: reach a gate (Blackgate or Wraithpass), then take 5 steps on the Ashen Road. <b>12 taint</b> and the Gloam wins.</p>';
  body += '<div class="ctype" style="font-size:.9rem;text-transform:uppercase;letter-spacing:.06em">Taint</div><div class="track">'; for (var i = 0; i <= 12; i++) body += '<span class="' + (i === F.taint ? 'on' : i === 12 ? 'end' : '') + '">' + i + '</span>'; body += '</div>';
  body += '<p>' + (F.road >= 0 ? 'On the Ashen Road: step <b>' + F.road + ' of 5</b>.' : 'Last seen at <b>' + rn(F.loc) + '</b>, ' + gateDist(F.loc) + ' regions from a gate. Moved <b>' + F.prog + '</b> unseen.') + ' The Company is <b>' + (F.hid ? 'hidden' : 'revealed: hide it before it moves') + '</b>.</p>';
  body += '<div class="comp">'; COMPANIONS.concat(['wretch']).forEach(function (c) { var l = G.C[c]; if (c === 'wretch' && l !== 'F') return; body += '<div class="cmp' + (c === g ? ' guide' : '') + (l === 'dead' ? ' dead' : '') + '">' + ico(CHARS[c].icon, '#1f1812', 22) + '<div><b style="font-family:var(--fell);font-weight:400">' + CHARS[c].short + '</b><br><small>' + (l === 'F' ? (c === g ? 'guide · ' : '') + 'level ' + CHARS[c].lv : l === 'dead' ? 'fallen' : rn(l)) + '</small></div></div>'; }); body += '</div>';
  if (g && CHARS[g].guide) body += '<p><b>Guide ' + CHARS[g].short + ':</b> ' + CHARS[g].guide + '</p>';
  var counts = {}; G.pool.forEach(function (t) { var k = tileName(t); counts[k] = (counts[k] || 0) + 1; });
  body += '<h2 style="font-size:1.1rem">The Hunt</h2><p>Dice in the hunt box: <b>' + G.hb.g + '</b> Gloam' + (G.hb.d ? ' and ' + G.hb.d + ' Dawn (each makes the next roll easier)' : '') + '. Each 6 finds the Company; then a tile is drawn.</p><div class="tiles">' + G.pool.map(tileHtml).join('') + '</div>';
  if (G.specIn.length) body += '<p>Waiting for the Ashen Road: ' + G.specIn.map(function (k) { return HUNT_SPECIAL[k].n; }).join(', ') + '.</p>';
  body += '<p>Lamps of Dawn left: <b>' + G.lamps.D + '</b>. Shuttered Lamps (Gloam): <b>' + G.lamps.G + '</b>.</p>';
  openSheet('company', { title: 'The Company', body: body });
}
function openLog() { var body = '<div style="font-size:.95rem;line-height:1.4">' + G.log.slice(-60).reverse().map(function (l) { return '<div>' + (l.k === 'turn' ? '<b>' + l.x + '</b>' : '<span style="color:' + (l.s === 'G' ? 'var(--red)' : 'var(--ink)') + '">' + l.x + '</span>') + '</div>'; }).join('') + '</div>'; openSheet('log', { title: 'Chronicle', body: body }); }
function openVP(side) { try { if (window.TUT && TUT.on) TUT.act({ what: 'vp' }); } catch (e) { }
  var lst = REGIONS.filter(function (r) { return VP[r.set] && r.nat && natSide(r.nat) !== side; });
  var body = '<p>' + (side === 'D' ? 'The Dawn League wins at <b>4 points</b> of Gloam cities and strongholds.' : 'The Gloam wins at <b>10 points</b> of Dawn cities and strongholds.') + ' Strongholds are 2, cities 1. Checked at the end of each turn.</p>';
  body += '<p>' + lst.map(function (r) { return (G.ctl[r.id] === side ? '<b style="color:var(--red)">✓ ' : '') + r.n + ' (' + VP[r.set] + ')' + (G.ctl[r.id] === side ? '</b>' : ''); }).join(' · ') + '</p>';
  openSheet('vp', { title: (side === 'D' ? 'Dawn' : 'Gloam') + ' victory points', body: body });
}
function armyText(a) { if (!a) return ''; return natsIn(a).map(function (n) { var x = a[n]; return NATIONS[n].short + ': ' + [x[0] ? x[0] + ' regular' : '', x[1] ? x[1] + ' elite' : '', x[2] ? x[2] + (n === 'pt' ? ' Gloamrider' : ' leader') : ''].filter(Boolean).join(', '); }).join('<br>'); }
var WHAT = {
  t: ['Army', 'A round token: the number is its troops. It moves and attacks with an Army die.'],
  'in': ['Besieged garrison', 'Troops shut inside their stronghold walls. Attackers need a siege to get in.'],
  co: ['The Company', 'Carries the Hollow Crown. Walk it to the Kiln to win; the Hunt adds taint.'],
  s: ['Settlement', 'Its plate colour shows who holds it. Strongholds give 2 points, cities 1.'],
  r: ['Region', 'One space of the map. Armies move one region per step.'] };
function regionInfo(rid, kind, extra, hint) {
  var r = REG[rid]; if (!r) return; kind = kind === 't' && extra === 'in' ? 'in' : kind || 'r'; if (kind === 's') WHAT.s[0] = { strong: 'Stronghold', city: 'City', town: 'Town', fort: 'Fortification' }[r.set] || 'Settlement';
  var w = WHAT[kind] || WHAT.r, body = '<p class="what">' + w[0] + ': ' + w[1] + '</p>' + (hint ? '<p><b>' + hint + '</b></p>' : '') + '<p>' + (r.nat ? NATIONS[r.nat].n : 'No nation') + (r.set ? ' · ' + { strong: 'stronghold (2 VP)', city: 'city (1 VP)', town: 'town', fort: 'fortification' }[r.set] : '') + (r.set && controller(G, rid) !== ownerSide(rid) ? ' · held by the ' + (controller(G, rid) === 'G' ? 'Gloam' : 'Dawn League') : '') + '</p>';
  if (G.A[rid]) body += '<p>' + armyText(G.A[rid]) + '</p>'; if (G.IN[rid]) body += '<p><b>Behind the walls:</b><br>' + armyText(G.IN[rid]) + '</p>';
  var cs = Object.keys(G.C).filter(function (c) { return G.C[c] === rid; }); if (cs.length) body += '<p>' + cs.map(function (c) { return '<b>' + CHARS[c].n + '</b>: ' + CHARS[c].out; }).join('<br>') + '</p>';
  if (G.F.loc === rid && G.F.road < 0) body += '<p>The Company was last seen here.</p>';
  if (!G.A[rid] && !G.IN[rid] && !cs.length) body += '<p>Empty land. Dotted outlines are its neighbours.</p>';
  regionCard(rid, r.n, body);
}
function charInfo(c) { var d = CHARS[c]; openSheet('char', { title: d.n, body: '<p class="what">' + (d.side === 'G' ? 'Minion (dark shield): a Gloam champion. Each one gives the Gloam +1 action die.' : 'Hero (light shield): a Dawn champion. Leads armies and protects the Company.') + '</p><p>Level ' + (d.lv > 50 ? 'flies' : d.lv) + ' · leadership ' + d.ld + '</p>' + (d.guide ? '<p><b>As guide:</b> ' + d.guide + '</p>' : '') + (d.out ? '<p><b>On the map:</b> ' + d.out + '</p>' : '') }); }
// ---------------------------------------------------------------- menu + rules
function menuInit() {
  try {
    GX.init({ key: 'gw' });
    var b = function (label, f) { var x = mk('button', 'btn', label); x.type = 'button'; x.onclick = function () { GX.close(); f(); }; return x; };
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { S.appendChild(GX.row('This game', [b('Rules', function () { GXH.rules(); }), b('Tutorial', function () { startTutorial(); }), b('Restart', function () { startGame({ side: UI.side, level: UI.level }); }), b('Title', showTitle)])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(SND.on, function (v) { SND.on = v; ls('gw-snd', v); }))); },
      help: function (S) { try { S.appendChild(GXH.settingsRow()); } catch (e) { } },
      about: { name: 'Gloamwar', version: '1.0', text: 'An original world for the Game Night Shelf. Font: IM Fell English (SIL OFL). Icons: game-icons.net by Lorc and Delapouite, CC BY 3.0. Map and tokens drawn in code.' } });
    if (GX.aiDelay && !UI.fast) AIDELAY = GX.aiDelay(700);
    GX.onPref && GX.onPref(function (k) { if (k === 'ai' && !UI.fast) AIDELAY = GX.aiDelay(700); });
  } catch (e) { console.warn(e); }
}
function rp(t) { return '<div class="rpic" style="display:flex;gap:6px;align-items:center;justify-content:center;font-family:var(--fell)">' + t + '</div>'; }
var RULES = [
  { phase: ['act', 'company', 'hunt'], title: 'How to win', text: 'Dawn League: unmake the Hollow Crown in the Kiln, or hold 4 points of Gloam cities and strongholds. The Gloam: 12 taint on the Bearers, or 10 points of Dawn cities and strongholds.', pic: function () { return rp(ico('lantern', '#9a2117', 34) + ' → ' + ico('volcano', '#6e130d', 34)); } },
  { phase: 'act', title: 'A turn', text: 'Draw a card from each deck. The Dawn may declare the Company. The Gloam sends dice to the Hunt. Both roll. Then you take turns using one die each, Dawn first.', pic: function () { return rp(ico('char', '#1f1812', 30) + ico('army', '#1f1812', 30) + ico('muster', '#1f1812', 30) + ico('raven', '#1f1812', 30)); } },
  { phase: 'act', title: 'Action dice', text: 'Character: move the Company, heroes, Gloamriders, or an army with a leader. Army: move two armies or attack. Muster: stir a nation or raise troops. Event: draw or play any card. Will of the Dawn: any of these. The Gaze goes to the Hunt.', pic: function () { return rp(ico('will', '#1f1812', 30) + ' = any · ' + ico('eye', '#9a2117', 30) + ' = hunt'); } },
  { phase: ['company', 'act'], title: 'The Company', text: 'Each move is one step, unseen. Then the Gloam rolls its hunt dice: every 6 finds you (easier for each move this turn). A found Company draws a hunt tile: taint, and maybe revealed.', pic: function () { return rp(ico('eye', '#9a2117', 30) + ' 6 = found'); } },
  { phase: 'damage', title: 'Hunt damage', text: 'Take the taint, or let the guide or a random companion fall: they cut it by their level. A reveal moves the Company up to its steps and it must hide before moving again.', pic: function () { return rp(ico('hood', '#1f1812', 30) + ' level = taint saved'); } },
  { phase: 'company', title: 'Declaring', text: 'In the Company phase you may place the Company anywhere within its unseen steps. In a Dawn city or stronghold it rests: 1 taint heals and that nation wakes.', pic: function () { return rp(ico('strong', '#1f1812', 30) + ' −1 taint'); } },
  { phase: 'company', title: 'The Ashen Road', text: 'From Blackgate or Wraithpass the Company enters the Ashen Road. No hunt rolls there: each move draws a tile, the Gaze tile counts every hunt die. 5 steps reach the Kiln. Standing still costs 1 taint a turn.', pic: function () { return rp('1 · 2 · 3 · 4 · 5 → ' + ico('volcano', '#6e130d', 30)); } },
  { phase: 'act', title: 'Nations and war', text: 'Nations step down the political track to At War. Only nations at war attack or muster with dice. Sleeping Dawn nations stop one step short until woken by an attack, invasion, a hero or the Company.', pic: function () { return rp('3 → 2 → 1 → war'); } },
  { phase: 'battle', title: 'Battle', text: 'Roll one die per unit, up to 5. Hits on 5 or 6. Leaders and heroes re-roll misses, up to 5. Each hit kills a regular or turns an elite into a regular. Cities and forts: the attacker needs 6s in round 1.', pic: function () { return rp('<span class="cd6 hit">5</span><span class="cd6 hit">6</span><span class="cd6">3</span>'); } },
  { phase: 'battle', title: 'Sieges and cards', text: 'A stronghold\'s defenders may go behind the walls (5 units). Storming the walls needs 6s and lasts one round, unless the attacker spends an elite to press on. Each round both sides may play one card for its battle half.', pic: function () { return rp(ico('strong', '#1f1812', 30) + ' 6 to hit'); } },
  { phase: 'act', title: 'Heroes and minions', text: 'Companions can leave the Company to wake their nations and lead armies. The Gloam brings in Vael, the Wraith-Marshal and the Voice with muster dice; the Dawn can crown Kestrel or kindle Orrin. Each adds an action die.', pic: function () { return rp(ico('crown', '#1f1812', 30) + ico('wraith', '#6e130d', 30)); } },
  { phase: 'act', title: 'Lamps of Dawn', text: 'Three Lamps change one Dawn die to any other face, once per turn. A used Lamp passes to the Gloam, who may use it once to turn a die into the Gaze.', pic: function () { return rp(ico('candle', '#1f1812', 30) + ' ×3'); } }];
function suggest() {
  if (!G || !human(sideToAct(G)) || UI.hold) return null; var m = AI.move(G, 'hard'); if (!m) return null;
  var why = 'A strong move here.', target = null;
  if (m.t === 'die') { target = function () { return document.querySelector('#mydice .die[data-i="' + m.i + '"]'); }; why = { cmove: 'The hunt is weak now: move the Company.', chide: 'Hide the Company so it can move again.', dip: 'Bring a nation closer to war.', recruit: 'Raise troops where the fight is.', amove: 'March armies toward the front.', attack: 'This attack has good odds.', card: 'Play ' + (CARD[m.c] ? CARD[m.c].n : 'a card') + '.', draw: 'Draw a card for later.', nzmove: 'Fly Gloamriders to the Company to help the Hunt.' }[m.a] || why; }
  else if (m.t === 'cdone') { target = function () { return document.querySelector('#acts .act'); }; why = 'Keep the Company hidden and move on.'; }
  else if (m.to && REG[m.to]) { why = 'Choose ' + rn(m.to) + '.'; MV.focus(m.to); target = function () { return document.getElementById('rg-' + m.to); }; }
  return target ? { target: target, why: why } : null;
}
function helpInit() {
  try {
    GXH.init({ game: 'gloamwar', defaultOn: true, avoid: '.act,.die.can,#battle .btn',
      steps: { company: { target: function () { return $('#company'); }, title: 'The Company', text: 'Declare it on a glowing region, or keep moving.' },
        act: { target: function () { return $('#mydice'); }, title: 'Your dice', text: 'Tap a die, then pick what it does.' },
        battle: { target: function () { return $('#battle'); }, title: 'Battle', text: 'Play a combat card, then fight on or stop.' } },
      rules: RULES });
    GXH.bulb({ el: '#bulbbtn', suggest: suggest, rulesFor: function () { return phaseId() || 'act'; } });
  } catch (e) { console.warn(e); }
}

// ---------------------------------------------------------------- bubbles: a card with an arrow touching its target (UI-BAR rule 10)
function bubble(html, tr, o) {
  o = o || {}; var el = document.createElement('div'); el.className = 'gwb' + (o.cls ? ' ' + o.cls : ''); el.innerHTML = html + '<i class="gwa"></i>'; el.style.visibility = 'hidden'; document.body.appendChild(el);
  var br = document.getElementById('board').getBoundingClientRect(), V = { l: 6, t: Math.max(6, br.top + 4), r: innerWidth - 6, b: Math.min(innerHeight - 6, br.bottom - 4) };
  var w = el.offsetWidth, h = el.offsetHeight, A = 12, G2 = 6, cx = (tr.left + tr.right) / 2, cy = (tr.top + tr.bottom) / 2, clampX = function (x) { return Math.max(V.l, Math.min(V.r - w, x)); }, clampY = function (y) { return Math.max(V.t, Math.min(V.b - h, y)); };
  var cand = [
    { side: 'below', room: V.b - tr.bottom, x: clampX(cx - w / 2), y: tr.bottom + A + G2 }, { side: 'above', room: tr.top - V.t, x: clampX(cx - w / 2), y: tr.top - A - G2 - h },
    { side: 'right', room: V.r - tr.right, x: tr.right + A + G2, y: clampY(cy - h / 2) }, { side: 'left', room: tr.left - V.l, x: tr.left - A - G2 - w, y: clampY(cy - h / 2) }];
  var fits = function (c) { return c.x >= V.l - 0.5 && c.y >= V.t - 0.5 && c.x + w <= V.r + 0.5 && c.y + h <= V.b + 0.5; };
  var pick = cand.filter(fits).sort(function (a, b) { return b.room - a.room; })[0] || cand.slice().sort(function (a, b) { return b.room - a.room; })[0];
  var x = Math.max(V.l, Math.min(V.r - w, pick.x)), y = Math.max(V.t, Math.min(V.b - h, pick.y)), ar = el.querySelector('.gwa');
  el.className += ' s-' + pick.side; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.visibility = '';
  if (pick.side === 'below' || pick.side === 'above') { ar.style.left = Math.max(14, Math.min(w - 14, cx - x)) - 8 + 'px'; } else { ar.style.top = Math.max(14, Math.min(h - 14, cy - y)) - 8 + 'px'; }
  el.dataset.side = pick.side; el._tr = tr; return el;
}
function closeBubble(b) { if (b && b.parentNode) b.parentNode.removeChild(b); }
function tip(text, tr) { closeBubble(UI.tipEl); UI.tipEl = bubble('<span>' + text + '</span>', tr, { cls: 'tip' }); var e = UI.tipEl; clearTimeout(UI.tipT); UI.tipT = setTimeout(function () { closeBubble(e); }, 7000); if (e) e.onclick = function () { closeBubble(e); }; }
function closeRCard() { if (UI.rcard) { closeBubble(UI.rcard); UI.rcard = null; try { MV.setSel(null); } catch (e) { } document.removeEventListener('pointerdown', UI.rcardOff, true); } }
function regionCard(rid, title, body) {
  closeRCard(); MV.setSel(rid);
  var el = bubble('<h3>' + title + '<button class="x" type="button" aria-label="Close">✕</button></h3>' + body, MV.rectOf(rid), { cls: 'rcard' });
  el.querySelector('.x').onclick = closeRCard; UI.rcard = el;
  UI.rcardOff = function (e) { if (!el.contains(e.target)) closeRCard(); };
  setTimeout(function () { document.addEventListener('pointerdown', UI.rcardOff, true); }, 0);
}
