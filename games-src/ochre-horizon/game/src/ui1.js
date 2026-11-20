// ===== part 1: globals, helpers, rendering (top strip, gauges, board, resources, action bar) =====
var A = window.OHART, M = OH.MAP;
var $ = function (id) { return document.getElementById(id); };
var UI = window.UI = { AIDELAY: 950, level: 'normal', sheet: null, tab: null, sel: null, evSeen: 0, logSeen: 0, busy: false, tut: false, sound: true, view: { s: 1, x: 0, y: 0 }, coachDone: {}, filter: 'play' };
Object.defineProperty(window, 'G', { get: function () { return OH.G; }, configurable: true });
var Q = new URLSearchParams(location.search);
if (Q.get('fast')) UI.AIDELAY = 60;
var LS = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } }, del: function (k) { try { localStorage.removeItem(k); } catch (e) { } } };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function who(p) { return p === 0 ? 'You' : 'Rival'; }
var RN = { mc: 'credits', steel: 'steel', ti: 'titanium', plant: 'plants', energy: 'energy', heat: 'heat' };

// ---------- words for ops / requirements ----------
function opWords(o) {
  var r = RN[o.r] || o.r;
  switch (o.op) {
    case 'prod': return (o.n >= 0 ? '+' + o.n : o.n) + ' ' + r + ' production';
    case 'gain': return 'Gain ' + o.n + ' ' + r;
    case 'lose': return 'Pay ' + o.n + ' ' + r;
    case 'rprod': return 'Rival loses ' + o.n + ' ' + r + ' production';
    case 'rres': return 'Rival loses ' + o.n + ' ' + r;
    case 'temp': return 'Raise temperature ' + o.n;
    case 'oxy': return 'Raise oxygen ' + o.n;
    case 'ocean': return 'Place ' + plural(o.n, 'ocean');
    case 'tr': return '+' + o.n + ' rating';
    case 'tile': return 'Place a ' + o.t + (o.t === 'special' ? ' tile' : '');
    case 'draw': return 'Draw ' + plural(o.n, (o.tag ? o.tag + ' ' : '') + 'card');
    case 'addres': return 'Add ' + o.n + ' ' + (o.kind || 'resource');
    case 'useres': return 'Remove ' + o.n + ' from this card';
    case 'gainper': return 'Gain ' + o.n + ' ' + r + ' per ' + o.per.replace('tag:', '').replace('tagAll:', 'any ');
    case 'prodper': return '+' + o.n + ' ' + r + ' production per ' + o.per.replace('tag:', '').replace('tagAll:', 'any ');
    case 'choose': return 'Choose one';
  }
  return o.op;
}
function opsWords(l) { return (l || []).map(opWords).join(', '); }
function reqWords(req) {
  if (!req) return '';
  var out = [];
  for (var k in req) {
    var q = req[k];
    if (k === 'temp') out.push((q.min !== undefined ? q.min + '°C+' : 'max ' + q.max + '°C'));
    else if (k === 'oxy') out.push((q.min !== undefined ? q.min + '% O₂+' : 'max ' + q.max + '% O₂'));
    else if (k === 'ocean') out.push((q.min !== undefined ? q.min + '+ oceans' : 'max ' + q.max + ' oceans'));
    else if (k === 'tags') for (var t in q) out.push(q[t] + ' ' + t);
    else if (k === 'prod') for (var r in q) out.push(q[r] + ' ' + RN[r] + ' prod');
    else if (k === 'cities') out.push((q.min || q) + ' cities');
    else if (k === 'greeneries') out.push((q.min || q) + ' greeneries');
  }
  return 'Needs ' + out.join(', ');
}
function vpWords(v) {
  if (!v) return '';
  if (typeof v === 'number') return v + ' VP';
  if (v.per === 'res') return '1 VP / ' + (v.every || 1);
  if (v.per === 'tag') return v.n + ' VP / ' + v.tag;
  if (v.per === 'adjOcean') return 'VP / ocean';
  if (v.per === 'cityAdj') return 'VP / city';
  return 'VP';
}
function whyNot(p, id) {
  var c = OH.CARDS[id];
  if (!OH.reqOk(p, c.req)) return reqWords(c.req) + '.';
  if (!OH.opsPossible(p, c.play, id)) return 'You lack the production or resources it takes.';
  var cost = OH.cardCost(p, id), pay = OH.maxPay(p, c, cost);
  if (pay.mc > G.pl[p].mc) return 'Costs ' + cost + '. You can pay ' + (G.pl[p].mc + (cost - pay.mc)) + '.';
  return '';
}

// ---------- card html ----------
function cardHTML(id, opt) {
  opt = opt || {};
  var c = OH.card(id), corp = !!OH.CORPS[id], p = 0;
  var cost = corp ? c.mc : (G && G.pl ? OH.cardCost(0, id) : c.cost);
  var reqOk = corp || !c.req || !G || !G.pl || OH.reqOk(p, c.req);
  var res = G && G.pl && G.pl[opt.owner || 0].res[id];
  var h = '<div class="card t-' + (corp ? 'active' : c.type) + (opt.no ? ' no' : '') + (opt.pick ? ' pick' : '') + '" data-id="' + id + '">';
  h += '<div class="ch"><span class="cost' + (!corp && cost < c.cost ? ' dis' : '') + '">' + cost + '</span><span class="cn">' + esc(c.name) + '</span></div>';
  h += '<div class="art">' + (corp ? A.corpArt(c, 160, 62) : A.cardArt(c, 160, 62)) + '<div class="tags">' + (c.tags || []).map(A.tagPill).join('') + (c.type === 'event' ? A.tagPill('event') : '') + '</div>' + (c.req ? '<span class="req' + (reqOk ? '' : ' bad') + '">' + esc(reqWords(c.req).replace('Needs ', '')) + '</span>' : '') + '</div>';
  h += '<div class="tx"><div class="ty">' + (corp ? 'Company · ' + c.mc + ' credits' : c.type === 'auto' ? 'Project' : c.type === 'active' ? 'Lasting' : 'Event') + '</div>' + esc(c.text || '');
  if (res) h += '<div><span class="rs">' + res + ' ' + (c.res || '') + ' here</span></div>';
  if (opt.flavor && c.flavor) h += '<div class="fl">' + esc(c.flavor) + '</div>';
  h += '</div>';
  if (c.vp) h += '<span class="vp">' + esc(vpWords(c.vp)) + '</span>';
  h += '<span class="chk">Keep</span></div>';
  return h;
}

// ---------- top strip + gauges ----------
function renderTop() {
  if (!G) return;
  $('gen').innerHTML = 'Gen<b>' + G.gen + '</b>';
  var s0 = OH.score(0), s1 = OH.score(1), t = OH.sideToAct();
  $('trYou').textContent = s0.total; $('trRiv').textContent = s1.total;
  $('trYou').setAttribute('data-engine', 'score0'); $('trRiv').setAttribute('data-engine', 'score1');
  $('nmYou').textContent = 'You'; $('nmRiv').textContent = 'Rival';
  $('vpYou').textContent = 'Rating ' + G.pl[0].tr; $('vpRiv').textContent = 'Rating ' + G.pl[1].tr;
  $('syou').classList.toggle('turn', t === 0 && G.phase === 'action'); $('sriv').classList.toggle('turn', t === 1 && G.phase === 'action');
  var tp = (G.temp + 30) / 38 * 100, op = G.oxy / 14 * 100;
  $('gTemp').className = 'gauge' + (G.temp >= 8 ? ' done' : '');
  $('gTemp').innerHTML = '<span class="gi">' + A.icon('temp', 22, '#ff9a5a') + '</span><div class="gv">' + G.temp + '°C</div><div class="gl">Heat · goal 8°C</div><div class="bar"><div class="fill" style="width:' + tp + '%;background:linear-gradient(90deg,#3a7bd5,#ff7a2f,#ff3b2f)"></div><i class="mk" style="left:' + (6 / 38 * 100) + '%"></i><i class="mk" style="left:' + (10 / 38 * 100) + '%"></i><i class="mk" style="left:' + (30 / 38 * 100) + '%"></i></div>';
  $('gOxy').className = 'gauge' + (G.oxy >= 14 ? ' done' : '');
  $('gOxy').innerHTML = '<span class="gi">' + A.icon('oxy', 22, '#9fe6ef') + '</span><div class="gv">' + G.oxy + '%</div><div class="gl">Air · goal 14%</div><div class="bar"><div class="fill" style="width:' + op + '%;background:linear-gradient(90deg,#1f8a8a,#9fe6ef)"></div><i class="mk" style="left:' + (8 / 14 * 100) + '%"></i></div>';
  $('gOcean').className = 'gauge' + (G.oceans >= 9 ? ' done' : '');
  var d = ''; for (var i = 0; i < 9; i++) d += '<i class="' + (i < G.oceans ? 'f' : '') + '"></i>';
  $('gOcean').innerHTML = '<span class="gi">' + A.icon('ocean', 22, '#4aa7d8') + '</span><div class="gv">' + G.oceans + '/9</div><div class="drops">' + d + '</div>';
}

// ---------- resources ----------
function renderRes() {
  if (!G) return;
  var P = G.pl[0], h = '', canG = G.phase === 'action' && OH.sideToAct() === 0 && !G.pending && P.plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length,
    canH = G.phase === 'action' && OH.sideToAct() === 0 && !G.pending && P.heat >= 8 && G.temp < 8;
  OH.RES.forEach(function (r) {
    var R = A.RES[r], go = (r === 'plant' && canG) || (r === 'heat' && canH);
    h += '<button class="rc' + (go ? ' go glow' : '') + '" data-r="' + r + '" style="background:' + R.col + ';color:' + R.fg + '" aria-label="' + R.name + '"><span class="n">' + A.icon(r, 15) + '<span data-engine="' + r + '">' + P[r] + '</span></span><span class="p">' + (P.prod[r] >= 0 ? '+' : '') + P.prod[r] + '</span><span class="w">' + R.name + '</span></button>';
  });
  $('res').innerHTML = h;
}

// ---------- action bar ----------
function renderBar() {
  if (!G) return;
  var my = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending, P = G.pl[0];
  var playN = P.hand.filter(function (id) { return OH.playable(0, id); }).length;
  $('bCardsS').textContent = P.hand.length + ' in hand';
  $('bCards').querySelector('.badge') && $('bCards').querySelector('.badge').remove();
  if (my && playN) $('bCards').insertAdjacentHTML('beforeend', '<span class="badge">' + playN + '</span>');
  var ready = 0; OH.actionSources(0).forEach(function (id) { OH.card(id).action.forEach(function (a, i) { if (OH.actOk(0, id, i)) ready++; }); });
  $('bActS').textContent = ready + ' ready';
  $('bPassT').textContent = G.acts === 1 ? 'Done' : 'Pass';
  $('bPassS').textContent = G.acts === 1 ? 'end turn' : 'out this round';
  ['bProj', 'bAct', 'bPass'].forEach(function (b) { $(b).disabled = !my; });
  $('bCards').disabled = false;
}

// ---------- hint line (8 words max) ----------
function setHint(t) { $('hintt').textContent = t; $('hint').style.display = t ? '' : 'none'; }
function hintNow() {
  if (!G) return '';
  if (G.over) return 'Game over';
  var p = OH.sideToAct();
  if (p === 1) return 'Rival is thinking…';
  if (G.pending) { if (G.pending.h === 'place') return 'Tap a glowing space'; return 'Make a choice'; }
  if (G.phase === 'setup') return 'Pick your company';
  if (G.phase === 'research' || G.phase === 'draft') return 'New round: pick cards';
  if (G.phase === 'final') return 'Last chance: plant greenery';
  if (G.phase === 'action') return G.acts === 1 ? 'One more action, or Done' : 'Your turn: play a card or project';
  return '';
}
function render() {
  renderTop(); renderRes(); renderBar(); renderBoard(); setHint(hintNow());
  if (UI.sheet && UI.refreshSheet) UI.refreshSheet();
}
