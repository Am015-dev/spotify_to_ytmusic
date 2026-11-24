// ui2: the one prompt line and its buttons, taps on the map and the hand, sheets (market, trade, choices), moves, the rival's turn, effects.
function word(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function acts(list) {
  $('#acts').innerHTML = list.map(function (a, i) { return '<button type="button" class="btn' + (a.alt ? ' alt' : '') + (a.glow ? ' glow' : '') + '" data-act="' + i + '"' + (a.dis ? ' disabled' : '') + '>' + esc(a.t) + '</button>'; }).join('');
  UI._acts = list;
}
function say(t, wait) { var p = $('#prompt'); p.textContent = t; p.classList.toggle('wait', !!wait); }
function taxSum() { var s = 0; for (var k in G.prov) if (!G.prov[k].up && G.prov[k].g) s += D.BONUS_COIN[G.prov[k].g]; return s; }
function renderPrompt() {
  if (!G) return;
  if (G.phase !== 'play') { say('Game over'); acts([{ t: 'Scores', f: showResult }]); return; }
  var pi = VT.sideToAct(G);
  if (!isHuman(pi) || UI.busy) { say(G.pl[pi].name + ' is playing…', true); acts([]); UI.hint = null; showFinger(null); return; }
  var p = G.pl[pi], pd = G.pend, me = p.name === 'You' ? '' : p.name + ': ';
  computeHint();
  if (G.drop && G.drop.length) { say(me + 'Storehouse full: pick goods'); acts([]); openTake(); return; }
  if (!pd) {
    if (UI.sel == null) { say(me + 'Pick a card to play'); acts([{ t: 'Points', alt: true, f: function () { showScoreNow(); } }, { t: 'Market', alt: true, f: function () { openMarket(false); } }]); }
    else { var c = D.CARDS[p.hand[UI.sel]]; say(cardWhat(c) + patronTag(c, pi)); acts([{ t: 'Play ' + c.n, glow: true, f: function () { playSel(); } }]); }
    return;
  }
  var h = pd.h;
  if (h === 'arch-move') {
    if (pd.steps <= 0) say('No steps left: build now');
    else if (UI.selCol != null) say('Stops with a house let you build');
    else say('Move a cart or ship: ' + word(pd.steps, 'step', 'steps'));
    acts([{ t: 'Build ▸', glow: pd.steps <= 0, f: function () { UI.selCol = null; move({ t: 'mdone' }); } }]);
  } else if (h === 'arch-build') {
    var n = VT.validMoves(G).filter(function (m) { return m.t === 'build'; }).length;
    say(n ? 'Tap a glowing city to build' : buildWhy(pi));
    acts([{ t: 'Done', alt: n > 0, glow: n === 0, f: function () { move({ t: 'done' }); } }]);
  } else if (h === 'pref') {
    var tx = taxSum();
    if (UI.selProv) { var pv = prodPreview(UI.selProv); say(pv); acts([{ t: 'Produce', glow: true, f: function () { var x = UI.selProv; UI.selProv = null; move({ t: 'prov', p: x }); } }, { t: 'Taxes +' + tx, alt: true, f: function () { move({ t: 'pcoins' }); } }]); }
    else { say('Pick a region to produce'); acts([{ t: 'Taxes +' + tx, alt: true, f: function () { move({ t: 'pcoins' }); } }]); }
  } else if (h === 'merc') { say('Trade up to 2 kinds of goods'); acts([{ t: 'Trade', glow: true, f: openTrade }]); if (!UI.sheet && UI._auto !== 'm' + G.turn) { UI._auto = 'm' + G.turn; openTrade(); } }
  else if (h === 'buy') { say('Buy ' + (pd.consul ? '1 card, no extra' : 'up to ' + word(pd.left, 'card', 'cards'))); acts([{ t: 'Market', glow: true, f: function () { openMarket(true); } }, { t: 'Done', alt: true, f: function () { closeSheet(); move({ t: 'done' }); } }]); if (!UI.sheet && UI._auto !== 'b' + G.turn) { UI._auto = 'b' + G.turn; openMarket(true); } }
  else if (h === 'colo') {
    var coins = D.COLONIST_COINS + VT.onBoard(p), can = VT.validMoves(G).some(function (m) { return m.t === 'place'; });
    say(pd.placed ? (can ? 'Place more, or finish' : 'All placed') : (can ? 'Tap a city for a cart or ship' : 'Take the coins'));
    var a = []; if (!pd.placed) a.push({ t: '+' + coins + ' coins', glow: !can, f: function () { move({ t: 'ccoins' }); } }); else a.push({ t: 'Done', glow: !can, f: function () { move({ t: 'done' }); } });
    acts(a);
  } else if (h === 'trib') {
    say('New cart or ship? 1 grain + 1 tool');
    var a2 = [];
    if (VT.canPlaceCol(G, pi, D.CAPITAL, 'L')) a2.push({ t: 'Cart', f: function () { move({ t: 'place', c: D.CAPITAL, k: 'L' }); } });
    if (VT.canPlaceCol(G, pi, D.CAPITAL, 'S')) a2.push({ t: 'Ship', f: function () { move({ t: 'place', c: D.CAPITAL, k: 'S' }); } });
    a2.push({ t: 'No', alt: true, f: function () { move({ t: 'done' }); } }); acts(a2);
  } else if (h === 'dipl') {
    var o = G.pl[1 - pi], top = o.disc[o.disc.length - 1], ok = VT.validMoves(G).some(function (m) { return m.t === 'copy'; });
    if (ok) { say('Copy ' + o.name + '’s ' + D.CARDS[top].n + '?'); acts([{ t: 'Copy', glow: true, f: function () { move({ t: 'copy', o: 1 - pi }); } }, { t: 'Skip', alt: true, f: function () { move({ t: 'done' }); } }]); }
    else { say('Nothing to copy right now'); acts([{ t: 'Done', glow: true, f: function () { move({ t: 'done' }); } }]); }
  }
}
// why nothing can be built: no city next to a cart or ship, or the goods / coins are missing
function buildWhy(pi) {
  var p = G.pl[pi], near = VT.nearCities(G, pi).filter(function (c) { return G.city[c].h.indexOf(pi) < 0; });
  if (!near.length) return 'No new city next to your pieces';
  if (p.goods.brick < 1 && near.every(function (c) { return G.city[c].g !== 'brick'; })) return 'Need 1 brick to build';
  return 'Need more goods or coins';
}
// what ruling a region would give, before you commit
function prodPreview(pid) {
  var pi = VT.sideToAct(G), gains = G.pl.map(function () { return 0; }), st = G.prov[pid];
  D.CITIES.forEach(function (c) { if (c.p === pid) G.city[c.id].h.forEach(function (o) { gains[o]++; }); });
  gains[pi] += G.pm === pi ? 2 : 1;
  return 'You +' + gains[pi] + ', ' + G.pl[1 - pi].name + ' +' + gains[1 - pi] + ' goods';
}

// ---------- taps ----------
function onMapTap(e) {
  if (!G || G.phase !== 'play' || UI.busy) return;
  var pi = VT.sideToAct(G); if (!isHuman(pi)) return;
  var t = e.target, pd = G.pend;
  var colK = t.getAttribute && t.getAttribute('data-k'), slot = t.closest && t.closest('[data-r]'), city = t.closest && t.closest('[data-c]'), prov = t.closest && t.closest('[data-p]');
  if (pd && pd.h === 'arch-move') {
    if (slot && UI.selCol != null) { var rid = slot.getAttribute('data-r'), k = UI.selCol; move({ t: 'mv', k: k, r: rid }); return; }
    if (colK != null) { UI.selCol = +colK === UI.selCol ? null : +colK; render(); if (UI.selCol != null) frameTargets(); return; }
    banner(UI.selCol != null ? 'Tap a glowing stop on a line' : 'Tap your glowing cart or ship', UI.selCol != null ? '#map .slothit' : '#map .col.glow .colhit'); return;
  }
  if (pd && pd.h === 'arch-build' && city) { var cid = city.getAttribute('data-c'); if (VT.canBuild(G, pi, cid)) move({ t: 'build', c: cid }); else bump(city); return; }
  if (pd && pd.h === 'pref' && prov) { var p = prov.getAttribute('data-p'); if (G.prov[p].up) { UI.selProv = UI.selProv === p ? null : p; render(); } else bump(prov); return; }
  if (pd && pd.h === 'colo' && city) { var c2 = city.getAttribute('data-c'); var kinds = ['L', 'S'].filter(function (k) { return VT.canPlaceCol(G, pi, c2, k); }); if (!kinds.length) { bump(city); return; } if (kinds.length === 1) move({ t: 'place', c: c2, k: kinds[0] }); else openPlace(c2); return; }
  if (pd && pd.h === 'trib' && city && city.getAttribute('data-c') === D.CAPITAL) return;
  if (pd && pd.h === 'arch-move' && !slot) { banner('Tap your glowing cart or ship', '#map .col.glow .colhit'); return; }
  if (city) showCityTip(city.getAttribute('data-c'));
}
function bump(node) { node.classList.add('popin'); setTimeout(function () { node.classList.remove('popin'); }, 450); sfx('no'); }
function showCityTip(cid) {
  var c = VT.CITY[cid], st = G.city[cid];
  var an = '#map .city[data-c="' + cid + '"] .disc';
  if (cid === D.CAPITAL) { banner('Caput: carts and ships start here', an); return; }
  banner(c.n + ': ' + D.GOOD_NAME[st.g] + (st.h.length ? ', ' + word(st.h.length, 'house', 'houses') : ''), an);
}
function onHandTap(e) {
  var b = e.target.closest('.cd'); if (!b || b.disabled || !G || G.phase !== 'play' || UI.busy) return;
  var pi = VT.sideToAct(G); if (!isHuman(pi) || G.pend || (G.drop && G.drop.length)) return;
  var i = +b.getAttribute('data-i');
  if (UI.sel === i) { playSel(); return; }
  UI.sel = i; sfx('tick'); render();
}
function playSel() { var i = UI.sel; UI.sel = null; move({ t: 'play', i: i }); }
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-act]'); if (a && UI._acts && a.closest('#acts')) { var f = UI._acts[+a.getAttribute('data-act')]; if (f && f.f && !a.disabled) f.f(); }
});

// ---------- moves ----------
function snap() { return G.pl.map(function (p, i) { return { coins: p.coins, goods: Object.assign({}, p.goods), score: VT.score(G, i).total, houses: p.houses.length, hand: p.hand.length }; }); }
function move(m) {
  if (!G || G.phase !== 'play') return;
  var before = snap(), pi = VT.sideToAct(G), wasPend = G.pend && G.pend.h, t0 = Date.now();
  try { VT.performMove(G, m); } catch (err) { console.warn(err.message); render(); return; }
  if (m.t !== 'mv') UI.selCol = null;
  var human = isHuman(pi); if (human) UI.noteAt = noteAnchor(m, pi);
  afterMove(before, pi, m, wasPend);
  if (human && !(UI._bt >= t0)) { var rt = resultText(m, pi, before); if (rt) banner(rt, UI.noteAt); }
  UI.noteAt = null;
  if (G.pend && G.pend.h !== 'buy' && G.pend.h !== 'merc') closeSheet();
  if (!G.pend && !(G.drop && G.drop.length)) closeSheet();
  render(); save();
  if (G.pend && isHuman(VT.sideToAct(G)) && (G.pend.h !== wasPend || m.t === 'play')) frameTargets();
  if (G.phase === 'end') { setTimeout(showResult, UI.fast ? 50 : 900); return; }
  if (!isHuman(VT.sideToAct(G))) setTimeout(runAI, UI.fast ? 30 : 450);
  else if (UI.mode === 'hot' && VT.sideToAct(G) !== pi) banner(G.pl[VT.sideToAct(G)].name + '’s turn');
}
// plain result of the player's own action, shown beside what changed
function noteAnchor(m, pi) {
  if (m.t === 'build' || m.t === 'place') return '#map .city[data-c="' + m.c + '"] .disc';
  if (m.t === 'mv') return '#map .col[data-pk="' + pi + ':' + m.k + '"] circle:not(.halo)';
  if (m.t === 'prov') return '#map .prov[data-p="' + m.p + '"] .mk';
  if (m.t === 'play') return '#hand';
  return '#store';
}
function resultText(m, pi, before) {
  var p = G.pl[pi], after = snap()[pi], b = before[pi], dc = after.coins - b.coins, gs = [];
  D.GOODS.forEach(function (g) { var d = after.goods[g] - b.goods[g]; if (d > 0) gs.push('+' + d + ' ' + D.GOOD_NAME[g]); });
  var gain = gs.concat(dc > 0 ? ['+' + dc + ' coins'] : []).join(', ');
  if (m.t === 'play') { UI.noteAt = '#store'; return 'Played ' + D.CARDS[G.lastPlayed].n + (gain ? ': ' + gain : ''); }
  if (m.t === 'mv') { var s = G.pend && G.pend.h === 'arch-move' ? G.pend.steps : 0; return 'Moved. ' + (s > 0 ? word(s, 'step', 'steps') + ' left' : 'No steps left: build now'); }
  if (m.t === 'mdone') { UI.noteAt = '#acts .btn'; return 'Done moving. Now build'; }
  if (m.t === 'build') return 'House built in ' + VT.CITY[m.c].n + (after.score !== b.score ? ' (' + (after.score - b.score > 0 ? '+' : '') + (after.score - b.score) + ' points)' : '');
  if (m.t === 'prov') return 'Region ruled' + (gain ? ': ' + gain : '');
  if (m.t === 'pcoins') return 'Taxes collected' + (dc > 0 ? ': +' + dc + ' coins' : '');
  if (m.t === 'ccoins') return 'Took ' + dc + ' coins';
  if (m.t === 'trade') return 'Trade done' + (gain ? ': ' + gain : '');
  if (m.t === 'take') return 'Stored 1 ' + D.GOOD_NAME[m.g];
  if (m.t === 'place') return 'Placed in ' + VT.CITY[m.c].n;
  if (m.t === 'copy') return 'Copied the rival’s card';
  if (m.t === 'done') { UI.noteAt = '#race'; return 'Turn over'; }
  return '';
}
// visible cause and effect: who got what, flying from where it was earned
function afterMove(before, pi, m, wasPend) {
  var after = snap();
  if (m.t === 'play') { var c = D.CARDS[G.lastPlayed]; sfx('card'); if (!isHuman(pi) || UI.mode === 'hot') banner(G.pl[pi].name + ': ' + c.n); else if (c.act === 'trib') banner('Played cards back in hand'); }
  var left = G.deck.length + G.disp.filter(function (x) { return x != null; }).length;
  if (left <= 2 && left !== UI._warned && G.phase === 'play') { UI._warned = left; setTimeout(function () { banner(left ? 'Only ' + word(left, 'market card', 'market cards') + ' left' : 'Market empty: last turn'); }, 1300); }
  if (m.t === 'build') { sfx('build'); popAt(VT.CITY[m.c], '+house', PCOL[pi]); }
  if (m.t === 'mv') sfx('step');
  if (m.t === 'prov') { var pid = m.p; D.CITIES.forEach(function (cc) { if (cc.p === pid && G.city[cc.id].h.length) popAt(cc, '+1 ' + D.GOOD_NAME[G.city[cc.id].g], '#fff'); }); sfx('coin'); }
  after.forEach(function (a, i) {
    var b = before[i], parts = [];
    D.GOODS.forEach(function (g) { var d = a.goods[g] - b.goods[g]; if (d > 0) parts.push('+' + d + gIcon(g)); });
    var dc = a.coins - b.coins; if (dc > 0) parts.push('+' + dc + ' ' + icon('coins'));
    if (parts.length) flyTo(parts.join(' '), i);
    if (a.score !== b.score) pulseScore(i, a.score - b.score);
  });
}
function popAt(pt, text, col) {
  var t = el('text', { 'class': 'prodpop', x: pt.x, y: pt.y - 26, fill: col || '#fff' }, L.over); t.textContent = text;
  var t0 = performance.now(); (function f(now) { var k = (now - t0) / 1100; t.setAttribute('y', pt.y - 26 - k * 22); t.setAttribute('opacity', Math.max(0, 1 - k * k)); if (k < 1) requestAnimationFrame(f); else t.remove(); })(t0);
}
function flyTo(html, pi) {
  var fx = $('#fx'), d = document.createElement('div'); d.className = 'fly'; d.innerHTML = html; fx.appendChild(d);
  var bb = $('#board').getBoundingClientRect(), tgt = pi === 0 && UI.mode !== 'hot' ? $('#store').getBoundingClientRect() : $('#race').getBoundingClientRect();
  d.style.left = (bb.left + bb.width / 2 - 40) + 'px'; d.style.top = (bb.top + bb.height * 0.45) + 'px';
  requestAnimationFrame(function () { requestAnimationFrame(function () { d.style.transform = 'translate(' + (tgt.left + tgt.width / 2 - bb.left - bb.width / 2) + 'px,' + (tgt.top - bb.top - bb.height * 0.45) + 'px) scale(.9)'; d.style.opacity = '0.15'; }); });
  setTimeout(function () { d.remove(); }, 900);
}
function pulseScore(i, d) { var b = document.querySelector('[data-engine-score="' + i + '"]'); if (!b) return; b.parentNode.classList.add('popin'); setTimeout(function () { b.parentNode && b.parentNode.classList.remove('popin'); }, 500); }
var bannerT = null;
function banner(t, anchor) {
  UI._bt = Date.now(); anchor = anchor || UI.noteAt || '#race';
  if (anchor) { UI.noteAt = null; setTimeout(function () { if (!showNote(t, anchor)) plainBanner(t); }, 0); return; }
  plainBanner(t);
}
function plainBanner(t) { var b = $('#banner'); b.textContent = t; b.classList.add('on'); clearTimeout(bannerT); bannerT = setTimeout(function () { b.classList.remove('on'); }, UI.fast ? 400 : 2200); }

// ---------- the rival's turn: one step at a time, watchable ----------
function runAI() {
  if (!G || G.phase !== 'play') return;
  var pi = VT.sideToAct(G); if (isHuman(pi)) { render(); return; }
  UI.busy = true; render();
  var keepView = UI.view && Object.assign({}, UI.view), start = snap(), acts0 = [];
  var step = function () {
    if (!G || G.phase !== 'play') { UI.busy = false; render(); return; }
    var p2 = VT.sideToAct(G);
    if (isHuman(p2)) { UI.busy = false; render(); if (keepView) animView(keepView); recap(pi, start, acts0); return; }
    var m = VAI.choose(G, G.pl[p2].ai || UI.lvl), before = snap(), wasPend = G.pend && G.pend.h;
    // follow the action with the camera
    if (m.t === 'mv') { var col = G.pl[p2].cols[m.k], from = col.at.r != null ? { x: GEO[col.at.r].mx, y: GEO[col.at.r].my } : VT.CITY[col.at.c]; fitPoints([from, { x: GEO[m.r].mx, y: GEO[m.r].my }], 90, 420); }
    if (m.t === 'build') fitPoints([VT.CITY[m.c]], 120, 420);
    if (m.t === 'prov') fitPoints(D.CITIES.filter(function (c) { return c.p === m.p; }).concat([provPos(D.PROVS.filter(function (x) { return x.id === m.p; })[0])]), 90, 420);
    if (m.t === 'play') acts0.push(D.CARDS[G.pl[p2].hand[m.i]].n);
    if (m.t === 'build') acts0.push('house in ' + VT.CITY[m.c].n);
    VT.performMove(G, m);
    if (m.t === 'buy') acts0.push('bought ' + D.CARDS[G.pl[p2].hand[G.pl[p2].hand.length - 1]].n);
    if (m.t === 'trade' && m.ops.length) banner(G.pl[p2].name + ' ' + m.ops.map(function (o) { return (o[1] > 0 ? 'buys ' : 'sells ') + Math.abs(o[1]) + ' ' + D.GOOD_NAME[o[0]]; }).join(', '));
    if (m.t === 'buy') banner(G.pl[p2].name + ' buys ' + D.CARDS[G.pl[p2].hand[G.pl[p2].hand.length - 1]].n);
    if (m.t === 'pcoins') banner(G.pl[p2].name + ' collects taxes');
    if (m.t === 'ccoins') banner(G.pl[p2].name + ' takes coins');
    if (m.t === 'copy') banner(G.pl[p2].name + ' copies your card');
    afterMove(before, p2, m, wasPend);
    render(); save();
    if (G.phase === 'end') { UI.busy = false; setTimeout(showResult, UI.fast ? 50 : 1000); return; }
    setTimeout(step, UI.fast ? 20 : (m.t === 'play' ? UI.AIDELAY + 300 : UI.AIDELAY));
  };
  setTimeout(step, UI.fast ? 10 : 350);
}

// ---------- sheets ----------
function openSheet(title, html, closable) {
  var s = $('#sheet'); UI.sheet = title;
  s.innerHTML = '<div class="sh-head"><h2>' + esc(title) + '</h2>' + (closable !== false ? '<button type="button" class="x" data-x aria-label="Close">×</button>' : '') + '</div>' + html;
  s.hidden = false;
  var x = s.querySelector('[data-x]'); if (x) x.onclick = closeSheet;
  if (UI.learn && UI.hints) setTimeout(placeFinger, 60);
}
function closeSheet() { var s = $('#sheet'); if (!s.hidden) { s.hidden = true; } UI.sheet = null; UI.mktSel = null; }
function priceHTML(slot, consul) {
  var c = D.CARDS[G.disp[slot]], h = '';
  for (var g in c.cost) for (var i = 0; i < c.cost[g]; i++) h += gIcon(g);
  if (!consul) { var s = D.SURCHARGE[slot]; if (s.any) for (var j = 0; j < s.any; j++) h += '<span class="g any sur" title="any good">?</span>'; if (s.cloth) for (var k = 0; k < s.cloth; k++) h += gIcon('cloth', 'sur'); }
  return h || '<span class="small">free</span>';
}
function openMarket(buying) {
  var pi = Math.max(0, VT.sideToAct(G)), pd = G.pend, consul = buying && pd && pd.consul, h = '<p class="lead">' + (buying ? (consul ? 'Printed price only' : 'Price grows to the right') : 'Cards you can buy later') + '</p><div class="mrow">';
  var hs = UI.hint && UI.hint.t === 'buy' ? UI.hint.s : -1;
  G.disp.forEach(function (id, s) {
    if (id == null) { h += '<div class="mc"><div class="pile" style="width:76px;height:100px">bought</div></div>'; return; }
    var can = buying && pd && pd.left > 0 && VT.canBuyCard(G, pi, s, consul);
    h += '<div class="mc ' + (buying ? (can ? 'can' : 'no') : '') + '">' + cardHTML(id, (can ? 'glow ' : '') + (hs === s ? 'hint' : ''), 'data-s="' + s + '"' + (buying && !can ? ' aria-disabled="true"' : '')) + '<div class="price">' + priceHTML(s, consul) + '</div><div class="note">' + (buying && !can && pd && pd.left > 0 ? 'Need ' + esc(needText(pi, s, consul)) : esc(cardWhat(D.CARDS[id]).split(',')[0].split(' then')[0])) + '</div></div>';
  });
  h += '</div><div class="tsum"><span class="grow deckn">' + word(G.deck.length, 'card', 'cards') + ' left in the deck</span>' + (buying ? '<button type="button" class="btn alt" id="mdone">Done buying</button>' : '') + '</div>';
  openSheet(buying ? 'Buy a card' : 'Market', h);
  var md = $('#mdone'); if (md) md.onclick = function () { closeSheet(); move({ t: 'done' }); };
  var first = $('#sheet .mc.can'); if (first) { var row = $('#sheet .mrow'); row.scrollLeft = Math.max(0, first.offsetLeft - row.offsetLeft - 8); }
  $('#sheet').querySelectorAll('.mc .cd').forEach(function (b) {
    b.onclick = function () {
      var s = +b.getAttribute('data-s');
      if (!buying) { banner(D.CARDS[G.disp[s]].n + ': ' + cardWhat(D.CARDS[G.disp[s]]), b); return; }
      if (!VT.canBuyCard(G, pi, s, consul) || !G.pend || G.pend.left <= 0) { bump(b); banner('Need ' + needText(pi, s, consul), b); return; }
      var nm = D.CARDS[G.disp[s]].n;
      move({ t: 'buy', s: s });
      banner('Bought ' + nm + ': it is in your hand', '#hand');
      setTimeout(function () { var hd = $('#hand'); hd.scrollLeft = hd.scrollWidth; }, 60);
      if (G.pend && G.pend.h === 'buy' && isHuman(VT.sideToAct(G))) openMarket(true);
    };
  });
}
// what is missing to buy a market card (shown on the card and when tapped)
function needText(pi, s, consul) {
  var p = G.pl[pi], cost = VT.cardCost(G, s, consul), miss = [];
  for (var g in cost.goods) { var d = cost.goods[g] - p.goods[g]; if (d > 0) miss.push(d + ' ' + D.GOOD_NAME[g]); }
  if (!miss.length && cost.any) miss.push(cost.any + ' more good' + (cost.any > 1 ? 's' : ''));
  return miss.join(' + ') || 'nothing';
}
// one line after the rival's turn: what they did and what it scored
function recap(pi, start, list) {
  var now = VT.score(G, pi).total, d = now - start[pi].score, txt = G.pl[pi].name + (d ? (d > 0 ? ' +' : ' ') + d + ': ' : ': ') + (list.length ? list.slice(0, 3).join(', ') : 'passed');
  UI.lastRecap = txt; banner(txt);
}
function openTrade() {
  var pi = VT.sideToAct(G), p = G.pl[pi];
  UI.trade = UI.trade && UI.trade.turn === G.turn ? UI.trade : { turn: G.turn, q: { brick: 0, food: 0, tool: 0, wine: 0, cloth: 0 } };
  if (!UI.trade.filled && UI.hints && UI.learn && UI.hintTrade) { UI.trade.filled = 1; UI.hintTrade.forEach(function (o) { UI.trade.q[o[0]] = o[1]; }); }   // learn mode: the suggested trade is already set up
  drawTrade();
}
function tradeOps() { var q = UI.trade.q, ops = []; D.GOODS.forEach(function (g) { if (q[g]) ops.push([g, q[g]]); }); return ops; }
function drawTrade() {
  var pi = VT.sideToAct(G), p = G.pl[pi], q = UI.trade.q, ops = tradeOps(), kinds = ops.length, coins = p.coins;
  ops.forEach(function (o) { coins -= o[1] * D.PRICE[o[0]]; });
  var h = '<p class="lead">Same price to buy or sell</p>';
  D.GOODS.forEach(function (g) {
    var lock = kinds >= 2 && !q[g];
    var canMinus = !lock && VT.validTrade(G, pi, tradeOps().map(function (o) { return o[0] === g ? [g, o[1] - 1] : o; }).filter(function (o) { return o[1]; }).concat(q[g] ? [] : [[g, -1]]));
    var canPlus = !lock && VT.validTrade(G, pi, tradeOps().map(function (o) { return o[0] === g ? [g, o[1] + 1] : o; }).filter(function (o) { return o[1]; }).concat(q[g] ? [] : [[g, 1]]));
    h += '<div class="trow">' + gIcon(g) + '<span class="nm">' + D.GOOD_NAME[g] + ' <small>' + D.PRICE[g] + ' coins · have ' + p.goods[g] + '</small></span>' +
      '<button type="button" class="step" data-g="' + g + '" data-d="-1"' + (canMinus ? '' : ' disabled') + ' aria-label="Sell one ' + D.GOOD_NAME[g] + '">−</button><span class="q ' + (q[g] > 0 ? 'buy' : q[g] < 0 ? 'sell' : '') + '">' + (q[g] > 0 ? '+' : '') + q[g] + '</span>' +
      '<button type="button" class="step" data-g="' + g + '" data-d="1"' + (canPlus ? '' : ' disabled') + ' aria-label="Buy one ' + D.GOOD_NAME[g] + '">+</button></div>';
  });
  h += '<div class="tsum"><span class="coins">' + icon('coins') + coins + '</span><span class="grow small">' + (kinds ? word(kinds, 'kind', 'kinds') + ' of 2' : 'Tap + to buy, − to sell') + '</span>';
  if (UI.hints && UI.hintTrade && UI.hintTrade.length) h += '<button type="button" class="btn alt" id="tsug">Suggest</button>';
  h += '<button type="button" class="btn" id="tgo">' + (kinds ? 'Trade' : 'No trade') + '</button></div>';
  openSheet('Trade', h, false);
  $('#sheet').querySelectorAll('.step').forEach(function (b) { b.onclick = function () { var g = b.getAttribute('data-g'); q[g] += +b.getAttribute('data-d'); sfx('tick'); drawTrade(); }; });
  $('#tgo').onclick = function () { var ops = tradeOps(); closeSheet(); UI.trade = null; move({ t: 'trade', ops: ops }); };
  var sg = $('#tsug'); if (sg) sg.onclick = function () { D.GOODS.forEach(function (g) { q[g] = 0; }); UI.hintTrade.forEach(function (o) { q[o[0]] = o[1]; }); drawTrade(); };
}
function openPlace(cid) {
  var pi = VT.sideToAct(G), h = '<p class="lead">Costs 1 grain + 1 tool</p><div class="choice">';
  if (VT.canPlaceCol(G, pi, cid, 'L')) h += '<button type="button" class="btn" data-k="L">' + 'Cart' + '</button>';
  if (VT.canPlaceCol(G, pi, cid, 'S')) h += '<button type="button" class="btn" data-k="S">' + 'Ship' + '</button>';
  h += '</div>';
  openSheet('New in ' + VT.CITY[cid].n, h);
  $('#sheet').querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { closeSheet(); move({ t: 'place', c: cid, k: b.getAttribute('data-k') }); }; });
}
function openTake() {
  var pi = VT.sideToAct(G), q = VT.incoming(G, pi), h = '<p class="lead">Room for ' + word(VT.room(G.pl[pi]), 'more good', 'more goods') + '</p><div class="choice">';
  D.GOODS.forEach(function (g) { if (q && q[g] > 0) h += '<button type="button" class="btn alt" data-g="' + g + '">' + gIcon(g) + ' ' + q[g] + '</button>'; });
  h += '</div>';
  openSheet('Keep which goods?', h, false);
  $('#sheet').querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { move({ t: 'take', g: b.getAttribute('data-g') }); if (G.drop && G.drop.length && isHuman(VT.sideToAct(G))) openTake(); }; });
}

// ---------- hints (the same evaluation the computer uses) ----------
function computeHint() {
  UI.hint = null; UI.hintTrade = null;
  if (!UI.hints || !G || G.phase !== 'play') { showFinger(null); return; }
  var pi = VT.sideToAct(G); if (!isHuman(pi)) { showFinger(null); return; }
  var key = JSON.stringify([G.turn, G.pend, G.drop, G.inc, G.pl, G.disp, UI.selCol]);
  if (UI._hk !== key) { UI._hk = key; try { UI._hm = VAI.choose(G, 'normal'); } catch (e) { UI._hm = null; } }
  UI.hint = UI._hm;
  if (UI.hint && UI.hint.t === 'trade') UI.hintTrade = UI.hint.ops;
  setTimeout(placeFinger, 30);
}
function hintTarget() {
  var m = UI.hint; if (!m) return null;
  if (m.t === 'play') return UI.sel === m.i ? $('#acts .btn') : $('#hand .cd[data-i="' + m.i + '"]');
  if (m.t === 'mv') return UI.selCol === m.k ? document.querySelector('.slothit[data-r="' + m.r + '"]') : document.querySelector('.colhit[data-k="' + m.k + '"]');
  if (m.t === 'build') return document.querySelector('.city[data-c="' + m.c + '"] .hit');
  if (m.t === 'place') {
    if (G.pend && G.pend.h === 'trib') { var lb = m.k === 'L' ? 'Cart' : 'Ship', bb = document.querySelectorAll('#acts .btn'); for (var j = 0; j < bb.length; j++) if (bb[j].textContent === lb) return bb[j]; return null; }
    if (UI.sheet && UI.sheet.indexOf('New in') === 0) return document.querySelector('#sheet [data-k="' + m.k + '"]');
    return document.querySelector('.city[data-c="' + m.c + '"] .hit');
  }
  if (m.t === 'trade') return UI.sheet === 'Trade' ? $('#tgo') : $('#acts .btn');
  if (m.t === 'take') return document.querySelector('#sheet [data-g="' + m.g + '"]');
  if (m.t === 'prov') return UI.selProv === m.p ? $('#acts .btn') : document.querySelector('.prov[data-p="' + m.p + '"] .hit');
  if (m.t === 'buy') return UI.sheet ? document.querySelector('#sheet .cd[data-s="' + m.s + '"]') : $('#acts .btn');
  if (m.t === 'done' && UI.sheet === 'Buy a card') return $('#mdone');
  if (m.t === 'mdone' || m.t === 'done' || m.t === 'pcoins' || m.t === 'ccoins' || m.t === 'copy') {
    var lab = { mdone: /^Build/, done: /^(Done|No)$/, pcoins: /^Taxes/, ccoins: /coins$/, copy: /^Copy/ }[m.t];
    var bs = document.querySelectorAll('#acts .btn'); for (var i = 0; i < bs.length; i++) if (lab.test(bs[i].textContent)) return bs[i];
  }
  return null;
}
function placeFinger() {
  var t = UI.hints && UI.learn ? hintTarget() : null;
  // a hinted map target outside the view: bring it in once (never fights the player's own panning)
  if (t && t.closest && t.closest('#map') && UI._centered !== UI._hk) {
    UI._centered = UI._hk; var r = t.getBoundingClientRect(), b = $('#board').getBoundingClientRect();
    if (r.left < b.left || r.right > b.right || r.top < b.top || r.bottom > b.bottom) { var v = UI.view, sx = v.w / b.width; animView({ x: v.x + (r.left + r.width / 2 - b.left - b.width / 2) * sx, y: v.y + (r.top + r.height / 2 - b.top - b.height / 2) * sx, w: v.w }); setTimeout(placeFinger, 480); return; }
  }
  showFinger(t);
  document.querySelectorAll('.hint').forEach(function (x) { if (!x.classList.contains('cd')) x.classList.remove('hint'); });
}
function showFinger(t) {
  var f = $('#finger');
  if (!t) { f.classList.remove('on'); hideBubble(); return; }
  var sc = t.closest && t.closest('#hand,.mrow'); if (sc) { var tr = t.getBoundingClientRect(), hr = sc.getBoundingClientRect(); if (tr.right > hr.right - 4 || tr.left < hr.left) sc.scrollLeft += tr.left - hr.left - (hr.width - tr.width) / 2; }
  var r = t.getBoundingClientRect(); if (!r.width) { f.classList.remove('on'); hideBubble(); return; }
  showBubble(t);
  f.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l5.2 1.1c1 .2 1.7 1.2 1.5 2.2l-1 5.2A2 2 0 0 1 15.7 20H11a2 2 0 0 1-1.6-.8L5.5 14a1.4 1.4 0 0 1 2-1.9z" fill="#fff8ec" stroke="#2b2018" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  f.style.left = (r.left + r.width / 2 - 8) + 'px'; f.style.top = (r.top + r.height / 2 - 2) + 'px';
  f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
}

// ---------- bubbles: the guide text and the result text sit next to their target, arrow touching it ----------
function interactiveRects(skip) {
  var out = [];
  document.querySelectorAll('#hand .cd, #acts .btn, #sheet .cd, #sheet button, .zoom button, header .tb, #map .city.glow .hit, #map .colhit, #map .slothit, #map .prov.glow .hit').forEach(function (e) {
    if (e === skip || (skip && (skip.contains(e) || e.contains(skip)))) return;
    var r = e.getBoundingClientRect(); if (r.width && r.height) out.push(r);
  });
  return out;
}
function ovl(a, b) { var w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return w > 0 && h > 0 ? w * h : 0; }
// put bubble b beside target t on the side with room; never over t (or other taps, if avoidable); returns the placed rect
function placeBubble(b, t, extra) {
  var W = window.innerWidth, H = window.innerHeight, M = 6, GAP = 8, tr = t.getBoundingClientRect();
  b.style.left = '0px'; b.style.top = '0px'; b.style.maxWidth = Math.min(b.classList.contains('res') ? 240 : 270, W - 2 * M) + 'px';
  var bw = b.offsetWidth, bh = b.offsetHeight, others = interactiveRects(t).concat(extra || []), tcx = tr.left + tr.width / 2, tcy = tr.top + tr.height / 2;
  var cs = [
    { s: 'top', x: tcx - bw / 2, y: tr.top - GAP - bh }, { s: 'bottom', x: tcx - bw / 2, y: tr.bottom + GAP },
    { s: 'left', x: tr.left - GAP - bw, y: tcy - bh / 2 }, { s: 'right', x: tr.right + GAP, y: tcy - bh / 2 }];
  var best = null;
  cs.forEach(function (c, i) {
    var x = Math.max(M, Math.min(W - bw - M, c.x)), y = Math.max(M, Math.min(H - bh - M, c.y)), r = { left: x, top: y, right: x + bw, bottom: y + bh };
    var pen = ovl(r, tr) * 1000 + Math.abs(x - c.x) * (c.s === 'left' || c.s === 'right' ? 5000 : 3) + Math.abs(y - c.y) * (c.s === 'top' || c.s === 'bottom' ? 5000 : 3) + i;
    others.forEach(function (o) { pen += ovl(r, o) * 4; });
    if (!best || pen < best.pen) best = { pen: pen, s: c.s, x: x, y: y };
  });
  b.className = b.className.replace(/\s*\b(top|bottom|left|right)\b/g, '') + ' ' + best.s;
  b.style.left = best.x.toFixed(1) + 'px'; b.style.top = best.y.toFixed(1) + 'px';
  b.style.setProperty('--ax', Math.max(16, Math.min(bw - 16, tcx - best.x)).toFixed(1) + 'px'); b.style.setProperty('--ay', Math.max(16, Math.min(bh - 16, tcy - best.y)).toFixed(1) + 'px');
  return { left: best.x, top: best.y, right: best.x + bw, bottom: best.y + bh };
}
function hideBubble() { var g = $('#gbub'); g.classList.remove('on'); $('#prompt').classList.remove('sr'); }
function showBubble(t) {
  var g = $('#gbub'), txt = $('#prompt').textContent;
  if (!txt || !UI.learn || !UI.hints) { hideBubble(); return; }
  g.textContent = txt; if (UI.tipFor && G && G.pend && G.pend.h === UI.tipFor.h) { var sp = document.createElement('div'); sp.className = 'sub'; sp.textContent = UI.tipFor.t; g.appendChild(sp); } var n = $('#note'), ex = n.classList.contains('on') ? [n.getBoundingClientRect()] : [];
  placeBubble(g, t, ex); g.classList.add('on'); $('#prompt').classList.add('sr');
}
var noteT = null;
function showNote(t, anchor) {
  var n = $('#note'), a = anchor && (typeof anchor === 'string' ? document.querySelector(anchor) : anchor);
  if (!a || !a.getBoundingClientRect().width) return false;
  n.textContent = t; n.classList.remove('on'); var g = $('#gbub');
  placeBubble(n, a, g.classList.contains('on') ? [g.getBoundingClientRect()] : []); n.classList.add('on');
  clearTimeout(noteT); noteT = setTimeout(function () { n.classList.remove('on'); }, UI.fast ? 400 : 3200);
  UI.lastNote = t; return true;
}
window.addEventListener('resize', function () { if (typeof placeFinger === 'function' && G) setTimeout(placeFinger, 50); });
['#hand', '#sheet'].forEach(function (s) { var e = document.querySelector(s); if (e) e.addEventListener('scroll', function () { clearTimeout(UI._sct); UI._sct = setTimeout(function () { var t = UI.hints && UI.learn ? hintTarget() : null; if (t) showBubble(t); }, 60); }, true); });

// ---------- sound (WebAudio, generated) ----------
var AC = null;
function sfx(k) {
  if (UI.mute) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
  var f = { tick: [660, .04, 'triangle'], card: [392, .12, 'triangle'], build: [196, .22, 'square'], step: [520, .05, 'sine'], coin: [880, .14, 'sine'], no: [140, .1, 'sawtooth'], win: [523, .5, 'triangle'] }[k] || [440, .1, 'sine'];
  o.type = f[2]; o.frequency.setValueAtTime(f[0], t); if (k === 'coin' || k === 'win') o.frequency.exponentialRampToValueAtTime(f[0] * 1.5, t + f[1]);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(k === 'build' ? 0.06 : 0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + f[1]);
  o.start(t); o.stop(t + f[1] + 0.02);
}

function patronTag(c, pi) {
  var v = VT.patronValues(G, pi), g = D.GODS.filter(function (x) { return x.id === c.god; })[0], n = c.god === 'owl' ? (v.owl[c.spec] || 0) : v[c.god];
  return ' \u2022 Its ' + g.n + ' is worth +' + n + ' to you now.';
}
