// ===================== part 3: the dock (chips, resources, city and hand strips, prompt) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) return v; if (UI.focus != null && UI.focus < G.np) return UI.focus; return Math.max(0, G.phase === 'over' ? 0 : Math.min(G.np - 1, G.cur)); }
function stripW() { return isPh() ? 46 : 58; }
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return 'The game is over.';
  const a = HB.actor(G), p = G.players[a];
  if (UI.cards.length) return 'Read the card, then Continue.';
  if (NET.on && !p.ai && a !== viewSeat()) return p.name + ' is deciding…';
  if (hotSeat() && UI.holder !== a && !p.ai) return 'Pass the device to ' + p.name + '.';
  if (p.ai) { const l = G.log.length ? G.log[G.log.length - 1].t : ''; return p.name + ' is playing… ' + (UI.lastAi || ''); }
  if (G.q) return G.q.title;
  const n = availW(p);
  const pre = NET.on ? 'Your turn. ' : hotSeat() || humans().length > 1 ? p.name + ', ' : 'Your turn. ';
  return pre + (n > 0 ? 'Tap a place for a worker (' + n + ' free) or a card to play.' : 'No workers left: play a card, Prepare for ' + (p.season < 3 ? SEASN[p.season + 1] : 'the end') + ', or Pass.');
}
function chipEl(s) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total;
  const cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const wk = grim ? '—' : availW(p) + '/' + p.workers;
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s;
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' cards in city' + (grim ? '' : ', ' + wk + ' workers free') });
  e.style.borderColor = pcolor(s).c;
  e.appendChild(h('span.cn', pawn(s, 15), h('b', pname(s)), p ? h('span.cs', HBKit.season(SEAS[p.season], 16)) : null, p && p.passed ? h('i', 'out') : null));
  e.appendChild(h('span.cl', h('span', '★' + pts), h('span', '▢' + cards), p ? h('span', '⚑' + wk) : h('span', 'solo')));
  return e;
}
function renderChips() {
  const c = $('#chips'); c.innerHTML = '';
  for (let s = 0; s < G.np; s++) c.appendChild(chipEl(s));
  if (G.grim) c.appendChild(chipEl('G'));
}
function renderRes() {
  const r = $('#res'); r.innerHTML = ''; const s = focusSeat(), p = G.players[s];
  const show = viewSeat() >= 0 || watching();
  for (const k of RESK) r.appendChild(h('span.rs', { title: k }, ic(k, 20), h('b', show ? p.res[k] : '?')));
  r.appendChild(h('span.rs.pt', ic('point', 20), h('b', p.pts)));
  const wr = h('span.rs.wk', { title: 'free workers' }, pawn(s, 18), h('b', availW(p) + '/' + p.workers));
  r.appendChild(wr);
}
function renderActs() {
  const a = $('#acts'); a.innerHTML = '';
  if (!G || G.phase === 'over') return;
  const act = HB.actor(G), p = G.players[act], mine = !p.ai && act === viewSeat() && !G.q && !UI.cards.length;
  const ms = mine ? movesFor(act) : [];
  const prep = ms.find(m => m.type === 'prepare'), pass = ms.find(m => m.type === 'pass');
  const rec = UI.rec && UI.rec.m;
  a.appendChild(h('button.btn' + (prep ? '' : '.dis') + (rec && rec.type === 'prepare' ? '.rec' : ''), { 'data-a': 'prep', type: 'button', disabled: prep ? null : true }, prep ? 'Prepare: ' + SEASN[p.season + 1] : (mine && p.season >= 3 ? 'Last season' : 'Prepare')));
  a.appendChild(h('button.btn' + (pass ? '' : '.dis') + (rec && rec.type === 'pass' ? '.rec' : ''), { 'data-a': 'pass', type: 'button', disabled: pass ? null : true }, 'Pass'));
  a.appendChild(h('button.btn.alt' + (mine ? '' : '.dis'), { 'data-a': 'hint', type: 'button', disabled: mine ? null : true }, 'Hint'));
}
function renderStrips() {
  const s = focusSeat(), p = G.players[s], w = stripW();
  const cr = $('#cityRow'); cr.innerHTML = '';
  const mm = myMoves(), cityOk = new Set(mm.filter(m => m.type === 'worker' && m.k === 'dest' && m.o === s).map(m => m.c));
  p.city.forEach(e => { const b = h('button.sc', { 'data-a': 'ccard', 'data-seat': s, 'data-id': e.id, type: 'button', 'aria-label': cname(e.id) }, cardEl(e.id, w, { entry: e })); if (cityOk.has(e.id)) b.classList.add('ok'); const rec = UI.rec && UI.rec.m; if (rec && rec.type === 'worker' && rec.k === 'dest' && rec.c === e.id) b.classList.add('rec'); cr.appendChild(b); });
  if (!p.city.length) cr.appendChild(h('span.empty', 'No cards in the city yet.'));
  $('#cityLab').textContent = (s === viewSeat() ? 'City' : p.name) + ' ' + HB.cityCount(G, s) + '/15';
  const hr = $('#handRow'); hr.innerHTML = ''; const v = viewSeat();
  const hand = v >= 0 ? G.players[v].hand : [];
  const pset = new Set(mm.filter(m => m.type === 'play' && m.from === 'hand').map(m => m.card));
  const rec = UI.rec && UI.rec.m;
  if (v >= 0) {
    hr.setAttribute('data-owner', v);
    hand.forEach(id => { const b = h('button.sc', { 'data-a': 'hcard', 'data-id': id, 'data-owner': v, 'data-up': '1', type: 'button', 'aria-label': cname(id) }, cardEl(id, w)); if (pset.has(id)) b.classList.add('ok'); if (rec && rec.type === 'play' && rec.from === 'hand' && rec.card === id) b.classList.add('rec'); hr.appendChild(b); });
    if (!hand.length) hr.appendChild(h('span.empty', 'Your hand is empty.'));
    $('#handLab').textContent = 'Hand ' + hand.length + '/8';
  } else {
    hr.removeAttribute('data-owner');
    hr.appendChild(h('span.empty', watching() ? 'Watching the computers play.' : NET.on ? 'You are watching this game.' : 'Hand hidden until the device is passed.'));
    $('#handLab').textContent = 'Hand';
  }
}
function renderDock() {
  if (!G) return;
  $('#prompt').textContent = promptText();
  $('#prompt').classList.toggle('mine', !!(G.phase !== 'over' && !G.players[HB.actor(G)].ai && (!NET.on || HB.actor(G) === viewSeat())));
  renderChips(); renderRes(); renderActs(); renderStrips();
  const t = $('#barstat'); if (t) { const p = G.players[Math.max(0, focusSeat())]; t.innerHTML = ''; t.appendChild(HBKit.season(SEAS[p.season], 22)); t.appendChild(h('span', SEASN[p.season] + (G.phase === 'over' ? ' · over' : ''))); }
}
// place the prompt: in the bar on phones, in the dock otherwise
function placePrompt() {
  const pr = $('#prompt'), bar = $('#barprompt'), dockTop = $('#promptDock');
  const want = document.documentElement.classList.contains('ph-p') ? bar : dockTop;
  if (pr.parentNode !== want) want.appendChild(pr);
}
