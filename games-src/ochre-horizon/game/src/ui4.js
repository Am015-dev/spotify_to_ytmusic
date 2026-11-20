// ===== part 4: drawers (cards, projects, actions, players, log) and pop-up choices =====
function openSheet(kind, tab) {
  UI.sheet = kind; UI.tab = tab || UI.tab;
  $('sheet').classList.add('on');
  if (!UI.pc) { $('scrim').classList.add('on'); $('app').inert = true; }
  UI.sheetSig = ''; UI.refreshSheet(); $('shB').scrollTop = 0;
}
function closeSheet() { if (UI.pc && G && !$('start').style.display.match(/flex/)) { UI.tab = null; UI.sheet = 'cards'; UI.refreshSheet(); return; } UI.sheet = null; $('sheet').classList.remove('on'); if (!$('modal').classList.contains('on')) $('scrim').classList.remove('on'); $('app').inert = false; }
function tabs(list, cur) { return list.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (t[0] === cur ? 'on' : '') + '">' + t[1] + '</button>'; }).join(''); }
UI.refreshSheet = function (auto) {
  var k = UI.sheet; if (!k || !G) return;
  if (k === 'cards') {   // never re-sort the list under the finger: only rebuild when the hand itself changes
    var sig = UI.tab + '|' + G.pl[0].hand.join() + '|' + G.pl[0].played.length;
    if (auto && sig === UI.sheetSig) { $('shB').querySelectorAll('.cw[data-card]').forEach(function (b) { var id = b.getAttribute('data-card'), cd = b.querySelector('.card'); if (cd && G.pl[0].hand.indexOf(id) >= 0) cd.classList.toggle('no', !OH.playable(0, id)); }); return; }
    UI.sheetSig = sig;
  }
  var P = G.pl[0], T = '', B = '', title = '';
  if (k === 'cards') {
    var playable = P.hand.filter(function (id) { return OH.playable(0, id); });
    var tab = UI.tab === 'all' || UI.tab === 'played' || UI.tab === 'play' ? UI.tab : (playable.length ? 'play' : 'all');
    title = 'Your cards';
    T = tabs([['play', 'Can play ' + playable.length], ['all', 'Hand ' + P.hand.length + ' · by cost'], ['played', 'Played ' + P.played.length]], tab);
    var list = tab === 'play' ? playable : tab === 'all' ? P.hand.slice().sort(function (a, b) { return OH.CARDS[a].cost - OH.CARDS[b].cost || (a < b ? -1 : 1); }) : (P.corp ? [P.corp] : []).concat(P.played.slice().reverse());
    B = list.length ? '<div class="grid">' + list.map(function (id) { return '<button class="cw" data-card="' + id + '" aria-label="' + esc(OH.card(id).name) + '">' + cardHTML(id, { no: tab !== 'played' && !OH.playable(0, id) }) + '</button>'; }).join('') + '</div>'
      : '<div class="empty">' + (tab === 'play' ? 'Nothing affordable yet. Try Projects, or pass to get income.' : 'No cards here.') + '</div>';
  } else if (k === 'proj') {
    var tb = UI.tab === 'mile' || UI.tab === 'award' ? UI.tab : 'std';
    title = 'Projects & goals';
    T = tabs([['std', 'Standard'], ['mile', 'Milestones ' + Object.keys(G.milestones).length + '/3'], ['award', 'Awards ' + G.awards.length + '/3']], tb);
    var my = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending;
    if (tb === 'std') {
      var rows = [['power', 'Power plant', '+1 energy production'], ['asteroid', 'Comet strike', 'Raise temperature 1 (+1 rating)'], ['aquifer', 'Aquifer', 'Place an ocean (+1 rating)'], ['greenery', 'Greenery', 'Place greenery, raise oxygen'], ['city', 'City', 'Place a city, +1 credit production']];
      B = rows.map(function (r) { var c = OH.stdCost(0, r[0]), ok = my && OH.stdOk(0, r[0]); return '<div class="row"><div class="rt"><b>' + r[1] + '</b><span>' + r[2] + '</span></div><button data-std="' + r[0] + '"' + (ok ? '' : ' disabled') + '>' + c + ' credits</button></div>'; }).join('');
      B += '<div class="row"><div class="rt"><b>Sell cards</b><span>1 credit per card from your hand</span></div><button data-sell="1"' + (my && P.hand.length ? '' : ' disabled') + '>Choose</button></div>';
      B += '<div class="row"><div class="rt"><b>Plant greenery</b><span>' + OH.greenCost(0) + ' plants → greenery (you have ' + P.plant + ')</span></div><button data-conv="green"' + (my && P.plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length ? '' : ' disabled') + '>Plant</button></div>';
      B += '<div class="row"><div class="rt"><b>Warm the air</b><span>8 heat → +1 temperature (you have ' + P.heat + ')</span></div><button data-conv="heat"' + (my && P.heat >= 8 && G.temp < 8 ? '' : ' disabled') + '>Warm</button></div>';
    } else if (tb === 'mile') {
      B = '<p style="margin:2px 2px 10px;opacity:.85">8 credits to claim. 5 points each. Only 3 can be claimed.</p>' + M.MILESTONES.map(function (m) {
        var own = G.milestones[m.k], have = OH.mileMetric(0, m.m), rv = OH.mileMetric(1, m.m);
        return '<div class="row' + (own !== undefined ? ' taken' : '') + '"><div class="rt"><b>' + m.name + '</b><span>' + m.text + ' · you ' + have + ', rival ' + rv + '</span></div><button data-mile="' + m.k + '"' + (my && OH.mileOk(0, m.k) ? '' : ' disabled') + '>' + (own !== undefined ? who(own) : '8 credits') + '</button></div>';
      }).join('');
    } else {
      B = '<p style="margin:2px 2px 10px;opacity:.85">Fund for ' + (OH.AWARD_COST[G.awards.length] || '-') + ' credits. Leader at game end gets 5 points.</p>' + M.AWARDS.map(function (a) {
        var f = G.awards.indexOf(a.k) >= 0, me = OH.awardMetric(0, a.m), rv = OH.awardMetric(1, a.m);
        return '<div class="row' + (f ? ' taken' : '') + '"><div class="rt"><b>' + a.name + '</b><span>' + a.text + ' · you ' + me + ', rival ' + rv + '</span></div><button data-award="' + a.k + '"' + (my && OH.awardOk(0, a.k) ? '' : ' disabled') + '>' + (f ? 'Funded' : (OH.AWARD_COST[G.awards.length] || '-') + ' credits') + '</button></div>';
      }).join('');
    }
  } else if (k === 'act') {
    title = 'Card actions'; var my2 = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending;
    var srcs = OH.actionSources(0);
    B = '<p style="margin:2px 2px 10px;opacity:.85">Each card action works once per round.</p>';
    B += srcs.length ? srcs.map(function (id) {
      var c = OH.card(id);
      return c.action.map(function (a, i) { var used = G.pl[0].used[id]; return '<div class="row"><div class="rt"><b>' + esc(c.name) + '</b><span>' + esc((a.cost && a.cost.length ? opsWords(a.cost) + ' → ' : '') + opsWords(a.do)) + (G.pl[0].res[id] ? ' · ' + G.pl[0].res[id] + ' ' + (c.res || '') + ' here' : '') + '</span></div><button data-act="' + id + '" data-i="' + i + '"' + (my2 && OH.actOk(0, id, i) ? '' : ' disabled') + '>' + (used ? 'Used' : 'Use') + '</button></div>'; }).join('');
    }).join('') : '<div class="empty">No action cards yet. Teal "Lasting" cards with Action: go here.</div>';
  } else if (k === 'player') {
    var p = UI.tab === 'p1' ? 1 : 0, Q2 = G.pl[p], s = OH.score(p);
    title = p ? 'Rival' : 'You';
    T = tabs([['p0', 'You'], ['p1', 'Rival']], p ? 'p1' : 'p0');
    B = '<div class="row"><div class="rt"><b>' + esc(Q2.corp ? OH.card(Q2.corp).name : '—') + '</b><span>' + esc(Q2.corp ? OH.card(Q2.corp).text : '') + '</span></div></div>';
    B += '<div style="margin:6px 0 10px">' + OH.RES.map(function (r) { return A.resPill(r, Q2[r]) + ' <small>' + (Q2.prod[r] >= 0 ? '+' : '') + Q2.prod[r] + '</small>'; }).join(' ') + '</div>';
    B += scoreTable(p);
    B += '<div class="gen-sep">Played cards (' + Q2.played.length + ')</div><div class="grid">' + Q2.played.slice().reverse().map(function (id) { return '<button class="cw" data-card="' + id + '" data-owner="' + p + '">' + cardHTML(id, { owner: p }) + '</button>'; }).join('') + '</div>';
  } else if (k === 'log') {
    title = 'What happened';
    var g = -1; B = G.log.slice(-120).map(function (l) { var sep = l.g !== g ? '<div class="gen-sep">Generation ' + l.g + '</div>' : ''; g = l.g; return sep + '<div class="logl p' + l.p + '">' + esc(l.s) + '</div>'; }).join('');
  } else if (k === 'menu') { title = 'Menu'; B = menuHTML(); }
  else if (k === 'rules') { title = 'How to play'; B = rulesHTML(); }
  else if (k === 'ref') {
    title = 'All cards';
    var tb2 = UI.tab && UI.tab.indexOf('r-') === 0 ? UI.tab : 'r-auto';
    T = tabs([['r-auto', 'Projects'], ['r-active', 'Lasting'], ['r-event', 'Events'], ['r-corp', 'Companies'], ['r-board', 'Map & goals']], tb2);
    if (tb2 === 'r-corp') B = '<div class="grid">' + DATAC().corps.map(function (c) { return '<div>' + cardHTML(c.id, { flavor: 1 }) + '</div>'; }).join('') + '</div>';
    else if (tb2 === 'r-board') B = boardRefHTML();
    else { var ty = tb2.slice(2); var cs = DATAC().cards.filter(function (c) { return c.type === ty; }); B = '<p style="opacity:.85;margin:2px">' + cs.length + ' cards</p><div class="grid">' + cs.map(function (c) { return '<div>' + cardHTML(c.id, { flavor: 1 }) + '</div>'; }).join('') + '</div>'; }
  }
  $('sheet').classList.toggle('docked', !!UI.pc && k === 'cards');
  $('shT').textContent = title; $('shTabs').innerHTML = T; $('shTabs').style.display = T ? '' : 'none'; $('shB').innerHTML = B;
};
function DATAC() { return window.OH_DATA; }
function scoreTable(p) {
  var s = OH.score(p);
  return '<table class="sc2"><tr><td>Rating</td><td>' + s.tr + '</td></tr><tr><td>Milestones</td><td>' + s.mile + '</td></tr><tr><td>Awards (if it ended now)</td><td>' + s.award + '</td></tr><tr><td>Greeneries</td><td>' + s.green + '</td></tr><tr><td>Cities next to greenery</td><td>' + s.city + '</td></tr><tr><td>Cards</td><td>' + s.cards + '</td></tr><tr class="tot"><td>Total</td><td>' + s.total + '</td></tr></table>';
}
function boardRefHTML() {
  var h = '<div class="rules"><h4>Map</h4><p>61 spaces, 12 kept for oceans. Bonus icons give steel, titanium, plants or cards. Each ocean next to a new tile pays 2 credits.</p><p>Named spaces: ' + M.order.filter(function (s) { return M.spaces[s].name; }).map(function (s) { return M.spaces[s].name; }).join(', ') + '; off the map: Lantern Moon Port, Far-Moon Habitat.</p>';
  h += '<h4>Milestones (8 credits, 5 points, 3 max)</h4>' + M.MILESTONES.map(function (m) { return '<p><b>' + m.name + '</b>: ' + m.text + '</p>'; }).join('');
  h += '<h4>Awards (8, 14, 20 credits; 3 max)</h4>' + M.AWARDS.map(function (a) { return '<p><b>' + a.name + '</b>: ' + a.text + '</p>'; }).join('') + '</div>';
  return h;
}
// sheet clicks
$('shX').addEventListener('click', closeSheet);
$('scrim').addEventListener('click', function () { if ($('modal').classList.contains('on')) { if (UI.modalClosable) closeModal(); return; } closeSheet(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if ($('modal').classList.contains('on')) { if (UI.modalClosable) closeModal(); } else if (UI.sheet) closeSheet(); } });
$('shTabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; UI.tab = b.getAttribute('data-tab'); UI.refreshSheet(); $('shB').scrollTop = 0; });
$('shB').addEventListener('click', function (e) {
  var t = e.target.closest('button'); if (!t) return;
  if (t.hasAttribute('data-card')) return showCard(t.getAttribute('data-card'), +(t.getAttribute('data-owner') || 0));
  if (t.hasAttribute('data-std')) { closeSheet(); return doMove({ t: 'std', k: t.getAttribute('data-std') }); }
  if (t.hasAttribute('data-sell')) return showSell();
  if (t.hasAttribute('data-conv')) { closeSheet(); return doMove({ t: t.getAttribute('data-conv') }); }
  if (t.hasAttribute('data-mile')) { closeSheet(); return doMove({ t: 'mile', k: t.getAttribute('data-mile') }); }
  if (t.hasAttribute('data-award')) { closeSheet(); return doMove({ t: 'award', k: t.getAttribute('data-award') }); }
  if (t.hasAttribute('data-act')) { closeSheet(); return doMove({ t: 'act', id: t.getAttribute('data-act'), i: +t.getAttribute('data-i') }); }
  if (t.hasAttribute('data-menu')) return menuDo(t.getAttribute('data-menu'));
});
// ---------- modal ----------
function modal(html, closable) {
  UI.modalClosable = closable !== false;
  $('mb').innerHTML = (UI.modalClosable ? '<button class="mx" id="mxb" aria-label="Close">' + A.icon('x', 18) + '</button>' : '') + html;
  $('modal').classList.add('on'); $('scrim').classList.add('on'); $('app').inert = true;
  if (UI.modalClosable) $('mxb').addEventListener('click', closeModal);
}
function closeModal() { $('modal').classList.remove('on'); if (!UI.sheet || UI.pc) { $('scrim').classList.remove('on'); $('app').inert = false; } }
$('modal').addEventListener('click', function (e) { if (e.target === $('modal') && UI.modalClosable) closeModal(); });
function preview(m) {
  var G0 = OH.G, b = JSON.parse(JSON.stringify(G0)), out = [];
  OH.G = JSON.parse(JSON.stringify(G0)); OH.G.ev = []; OH.G.log = [];
  try {
    if (OH.performMove(m)) {
      var a = OH.G.pl[0], z = b.pl[0], pay = m.t === 'play' ? OH.maxPay(0, OH.CARDS[m.id], OH.cardCost(0, m.id)) : {};
      OH.RES.forEach(function (r) { var d = a.prod[r] - z.prod[r]; if (d) out.push((d > 0 ? '+' : '') + d + ' ' + RN[r] + ' production'); });
      if (a.tr - z.tr) out.push('+' + (a.tr - z.tr) + ' rating');
      ['mc', 'plant', 'steel', 'ti', 'heat', 'energy'].forEach(function (r) { var d = a[r] - z[r] + (pay[r] || 0); if (d > 0) out.push('+' + d + ' ' + RN[r]); });
      var dh = a.hand.length - z.hand.length + (m.t === 'play' ? 1 : 0); if (dh > 0) out.push('+' + plural(dh, 'card'));
      var rs = 0; for (var k in a.res) rs += (a.res[k] || 0) - (z.res[k] || 0); if (rs > 0) out.push('+' + rs + ' on a card');
      var r1 = OH.G.pl[1], r0 = b.pl[1]; OH.RES.forEach(function (r) { var d = r1.prod[r] - r0.prod[r]; if (d < 0) out.push('rival ' + d + ' ' + RN[r] + ' production'); var e = r1[r] - r0[r]; if (e < 0) out.push('rival ' + e + ' ' + RN[r]); });
      if (OH.G.pending && OH.G.pending.h === 'place') out.push('place a tile');
      if (m.t === 'play') {
        var c = OH.CARDS[m.id];
        if (c.vp) out.push(typeof c.vp === 'number' ? (c.vp > 0 ? c.vp + ' VP at the end' : c.vp + ' VP at the end') : 'VP at the end (' + vpWords(c.vp) + ')');
        if (c.type === 'active' && c.action && c.action.length) out.push('a new action each round');
        if (c.type === 'active' && c.effect && c.effect.length) out.push('a lasting effect');
      }
    }
  } catch (e) { }
  OH.G = G0;
  return out;
}
function showCard(id, owner) {
  var c = OH.card(id), P = G.pl[0], inHand = owner === 0 && P.hand.indexOf(id) >= 0, my = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending;
  var h = '<div class="big">' + cardHTML(id, { flavor: 1, owner: owner }) + '</div>';
  if (inHand && OH.CARDS[id]) {
    if (OH.playable(0, id)) {
      var cost = OH.cardCost(0, id), pay = OH.maxPay(0, c, cost), parts = [];
      if (pay.steel) parts.push(pay.steel + ' steel'); if (pay.ti) parts.push(pay.ti + ' titanium'); if (pay.heat) parts.push(pay.heat + ' heat'); parts.push(pay.mc + ' credits');
      var gets = my ? preview({ t: 'play', id: id }) : [];
      if (my) h += '<div class="' + (gets.length ? 'row' : 'why') + '" style="min-height:0;margin-top:8px">' + (gets.length ? 'Gives: ' + esc(gets.join(', ')) : 'No gain right now. Check the card text.') + '</div>';
      h += '<button class="btn pickable" id="mPlay"' + (my ? '' : ' disabled') + '>Play it<small>Pay ' + parts.join(' + ') + (my ? '' : ' · wait for your turn') + '</small></button>';
    } else h += '<div class="why">' + esc(whyNot(0, id)) + '</div>';
    h += '<button class="btn alt" id="mSell"' + (my ? '' : ' disabled') + '>Sell for 1 credit</button>';
  }
  modal(h);
  if ($('mPlay')) $('mPlay').addEventListener('click', function () { closeModal(); closeSheet(); doMove({ t: 'play', id: id }); });
  if ($('mSell')) $('mSell').addEventListener('click', function () { closeModal(); closeSheet(); doMove({ t: 'sell', ids: [id] }); });
}
function showSell() {
  var P = G.pl[0], picks = {};
  function draw() {
    var n = Object.keys(picks).length;
    modal('<h3>Sell cards</h3><p style="margin:0 0 8px;opacity:.85">Tap cards to sell. 1 credit each.</p><div class="grid">' + P.hand.map(function (id) { return '<button class="cw pickable" data-sp="' + id + '">' + cardHTML(id, { pick: picks[id], chk: 'Sell' }) + '</button>'; }).join('') + '</div><div class="stick"><button class="btn" id="mSellGo"' + (n ? '' : ' disabled') + '>Sell ' + plural(n, 'card') + '<small>+' + n + ' credits</small></button></div>');
    $('mb').querySelectorAll('[data-sp]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-sp'); if (picks[id]) delete picks[id]; else picks[id] = 1; draw(); }); });
    $('mSellGo').addEventListener('click', function () { closeModal(); closeSheet(); doMove({ t: 'sell', ids: Object.keys(picks) }); });
  }
  draw();
}
function showChoose() {
  var d = G.pending.d, c = OH.card(d.src);
  modal('<h3>' + esc(c ? c.name : 'Choose') + '</h3><p style="margin:0 0 4px">Pick one:</p>' + d.opts.map(function (o, i) { return '<button class="btn pickable' + (i ? ' cr' : '') + '" data-ch="' + i + '"' + (d.ok.indexOf(i) >= 0 ? '' : ' disabled') + '>' + esc(opsWords(o)) + '</button>'; }).join(''), false);
  $('mb').querySelectorAll('[data-ch]').forEach(function (b) { b.addEventListener('click', function () { closeModal(); doMove({ t: 'choose', i: +b.getAttribute('data-ch') }); }); });
}
function showPickRes() {
  var d = G.pending.d;
  modal('<h3>Add ' + d.n + ' ' + esc(d.kind) + '</h3><p style="margin:0 0 4px">Which card gets it?</p>' + d.cards.map(function (id) { return '<button class="btn cr pickable" data-pr="' + id + '">' + esc(OH.card(id).name) + '<small>' + (G.pl[0].res[id] || 0) + ' there now · ' + esc(vpWords(OH.card(id).vp)) + '</small></button>'; }).join(''), false);
  $('mb').querySelectorAll('[data-pr]').forEach(function (b) { b.addEventListener('click', function () { closeModal(); doMove({ t: 'pickres', id: b.getAttribute('data-pr') }); }); });
}
function suggestBuys(ids, budget) { try { var save = OH.G; var r = OHAI.chooseBuys(0, ids, Math.max(0, budget), 'normal'); OH.G = save; return r; } catch (e) { return []; } }
function OHAI_buys(ids, budget) { var sc = ids.map(function (id) { return { id: id, w: OHAI.cardWorth(0, id) }; }).sort(function (a, b) { return b.w - a.w; }), out = []; sc.forEach(function (s) { if (s.w > 2 && (out.length + 1) * 3 <= budget) out.push(s.id); }); return out; }
function showSetup() {
  var P = G.pl[0], st = UI.setup || (UI.setup = { step: 0, corp: null, keep: {} });
  if (st.step === 0) {
    var cs = P.offer.corps.slice(); if (cs.indexOf('c00') < 0 && UI.tut) cs.push('c00');
    var first = UI.tut || !LS.get('oh_done'); if (cs.indexOf('c00') >= 0) { cs.splice(cs.indexOf('c00'), 1); cs.unshift('c00'); }
    modal('<h3>Pick your company</h3><p style="margin:0 0 8px;opacity:.85">Each company has one power.</p><div class="grid">' + cs.map(function (id) { var rec = first && id === 'c00'; return '<button class="cw pickable" data-corp="' + id + '">' + (rec ? '<span class="recb">Best for a first game</span>' : '') + cardHTML(id, { flavor: 1, pick: rec, chk: 'Pick' }) + '</button>'; }).join('') + '</div>', false);
    $('mb').querySelectorAll('[data-corp]').forEach(function (b) { b.addEventListener('click', function () { st.corp = b.getAttribute('data-corp'); st.step = 1; if (P.offer.corps.indexOf(st.corp) < 0) P.offer.corps.push(st.corp); var C = OH.CORPS[st.corp]; st.keep = {}; if (!C.beginner) suggestBuys(P.offer.cards, C.mc - 14).forEach(function (id) { st.keep[id] = 1; }); if (!OH.CORPS[st.corp].beginner) coachShow('keep'); showSetup(); }); });
    coachShow('corp'); return;
  }
  var C = OH.CORPS[st.corp], n = Object.keys(st.keep).length, beg = !!C.beginner;
  modal('<h3>Keep cards</h3><p style="margin:0 0 8px;opacity:.85">' + (beg ? 'Open Charter keeps all 10 free.' : '3 credits each. Suggested ones are marked.') + '</p><div class="grid">' + P.offer.cards.map(function (id) { return '<button class="cw pickable" data-keep="' + id + '">' + cardHTML(id, { pick: beg || st.keep[id] }) + '</button>'; }).join('') + '</div><div class="stick"><button class="btn pickable" id="mKeep">' + (beg ? 'Keep all 10' : 'Keep ' + plural(n, 'card')) + '<small>' + (beg ? 'Start with 42 credits' : 'Pay ' + 3 * n + ', start with ' + (C.mc - 3 * n) + ' credits') + '</small></button><button class="btn alt" id="mBack">Other company</button></div>', false);
  $('mb').querySelectorAll('[data-keep]').forEach(function (b) { b.addEventListener('click', function () { if (beg) { b.querySelector('.card').classList.remove('pop'); void b.offsetWidth; b.querySelector('.card').classList.add('pop'); toast('<b>' + esc(OH.card(b.getAttribute('data-keep')).name) + ': kept</b>Open Charter keeps all 10 cards for free.', true, 2000, { now: true, key: 'beg' }); return; } var id = b.getAttribute('data-keep'); if (st.keep[id]) delete st.keep[id]; else if ((n + 1) * 3 <= C.mc) st.keep[id] = 1; else { toast('Not enough credits: each card costs 3.', true, 2000, { now: true, key: 'buy' }); return; } showSetup(); }); });
  $('mKeep').addEventListener('click', function () { var m = { t: 'setup', corp: st.corp, buy: Object.keys(st.keep) }; UI.setup = null; closeModal(); doMove(m); });
  $('mBack').addEventListener('click', function () { st.step = 0; showSetup(); });
}
function showResearch() {
  var P = G.pl[0], st = UI.research;
  if (!st || st.gen !== G.gen) { st = UI.research = { gen: G.gen, keep: {} }; suggestBuys(P.research, P.mc - 3).forEach(function (id) { st.keep[id] = 1; }); }
  var n = Object.keys(st.keep).length;
  modal('<h3>Round ' + G.gen + ': new cards</h3><p style="margin:0 0 8px;opacity:.85">Tap a card to buy or skip it. 3 credits each. You have ' + P.mc + '.</p><div class="grid">' + P.research.map(function (id) { return '<button class="cw pickable" data-rk="' + id + '">' + cardHTML(id, { pick: st.keep[id] }) + '</button>'; }).join('') + '</div><div class="stick"><button class="btn pickable" id="mBuy">' + (n ? 'Buy ' + plural(n, 'card') : 'Buy none') + '<small>' + (n ? 'Pay ' + 3 * n + ' credits' : 'Keep your credits') + '</small></button></div>', false);
  $('mb').querySelectorAll('[data-rk]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-rk'); if (st.keep[id]) delete st.keep[id]; else if ((n + 1) * 3 <= P.mc) st.keep[id] = 1; else { toast('Not enough credits: each card costs 3.', true, 2000, { now: true, key: 'buy' }); return; } showResearch(); }); });
  $('mBuy').addEventListener('click', function () { closeModal(); doMove({ t: 'buy', ids: Object.keys(st.keep) }); });
  coachShow('research');
}
function showDraft() {
  var h = G.draft.hands[0];
  modal('<h3>Draft: keep 1</h3><p style="margin:0 0 8px;opacity:.85">The rest go to the rival. Pick ' + (G.draft.picked[0].length + 1) + ' of 4.</p><div class="grid">' + h.map(function (id) { return '<button class="cw pickable" data-dr="' + id + '">' + cardHTML(id) + '</button>'; }).join('') + '</div>', false);
  $('mb').querySelectorAll('[data-dr]').forEach(function (b) { b.addEventListener('click', function () { closeModal(); doMove({ t: 'draft', id: b.getAttribute('data-dr') }); }); });
}
function showFinal() {
  var P = G.pl[0], can = P.plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length;
  modal('<h3>Ochre is finished!</h3><p>Last step: turn plants into greenery for points. You have ' + P.plant + ' plants.</p>' + (can ? '<button class="btn" id="mFg">Plant a greenery<small>' + OH.greenCost(0) + ' plants → +1 point</small></button>' : '') + '<button class="btn alt" id="mFd">Count the points</button>', false);
  if ($('mFg')) $('mFg').addEventListener('click', function () { closeModal(); doMove({ t: 'green' }); });
  $('mFd').addEventListener('click', function () { closeModal(); doMove({ t: 'done' }); });
}
function showPass() {
  if (G.acts === 1) { doMove({ t: 'end' }); return; }
  var playN = G.pl[0].hand.filter(function (id) { return OH.playable(0, id); }).length;
  if (!playN && G.pl[0].mc < 11) { doMove({ t: 'pass' }); return; }
  modal('<h3>Pass this round?</h3><p>You sit out until next round. Income next round: <b>+' + (G.pl[0].prod.mc + G.pl[0].tr) + ' credits</b>. ' + (playN ? 'You can still play ' + plural(playN, 'card') + '.' : '') + '</p><button class="btn" id="mPassY">Yes, pass</button><button class="btn alt" id="mPassN">Keep playing</button>');
  $('mPassY').addEventListener('click', function () { closeModal(); doMove({ t: 'pass' }); });
  $('mPassN').addEventListener('click', closeModal);
}
// action bar + top strip
$('bCards').addEventListener('click', function () { UI.tab = null; openSheet('cards', null); });
$('bProj').addEventListener('click', function () { openSheet('proj', 'std'); });
$('bAct').addEventListener('click', function () { openSheet('act'); });
$('bPass').addEventListener('click', showPass);
$('syou').addEventListener('click', function () { openSheet('player', 'p0'); });
$('sriv').addEventListener('click', function () { openSheet('player', 'p1'); });
$('res').addEventListener('click', function (e) {
  var b = e.target.closest('[data-r]'); if (!b || !G) return;
  var r = b.getAttribute('data-r'), P = G.pl[0], my = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending;
  if (r === 'plant' && my && P.plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length) return doMove({ t: 'green' });
  if (r === 'heat' && my && P.heat >= 8 && G.temp < 8) return doMove({ t: 'heat' });
  var R = A.RES[r];
  toast('<b>' + R.name + ': ' + P[r] + '</b>+' + P.prod[r] + ' each round' + (r === 'plant' ? ' · ' + OH.greenCost(0) + ' plants = greenery' : r === 'heat' ? ' · 8 heat = +1 temperature' : r === 'steel' ? ' · pays ' + OH.steelVal(0) + ' for building cards' : r === 'ti' ? ' · pays ' + OH.tiVal(0) + ' for space cards' : r === 'energy' ? ' · turns into heat each round' : ' · income = production + rating'), true, 2600);
});
