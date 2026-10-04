// ===================== part 9: clarity (every point change gets a cause, hand/city tabs on phones) =====================
// ---- points: snapshot every seat's score before a move, then say what changed and why
function ptsSnap() {
  return G.players.map((p, s) => { const sc = score(s); return { sc, res: Object.assign({}, p.res), hand: p.hand.length, workers: p.workers, city: p.city.map(e => e.id), bonus: Object.fromEntries((sc.detail || []).map(d => [d.card, d.bonus])), bev: G.bev.map(e => e.o), sev: G.sev.map(e => e.o) }; });
}
const sgn = n => (n > 0 ? '+' : '−') + Math.abs(n);
// returns [{seat, d, parts:[text...]}] for every seat whose total changed
function ptsExplain(before) {
  if (!before || !G) return [];
  const out = [];
  G.players.forEach((p, s) => {
    const a = before[s], sc = score(s); if (!a) return;
    const d = sc.total - a.sc.total; if (!d) return;
    const parts = []; let acc = 0;
    // printed points of cards that came or went
    const now = p.city.map(e => e.id), was = a.city.slice();
    const added = now.filter(id => { const i = was.indexOf(id); if (i >= 0) { was.splice(i, 1); return false; } return true; });
    added.forEach(id => { const v = cdef(id).pts; if (v) { parts.push(sgn(v) + ' ' + cname(id)); acc += v; } });
    was.forEach(id => { const v = cdef(id).pts; if (v) { parts.push(sgn(-v) + ' ' + cname(id) + ' left the city'); acc -= v; } });
    const rest = (sc.cards - a.sc.cards) - acc; if (rest) { parts.push(sgn(rest) + ' printed card points'); acc += rest; }
    const tk = sc.tokens - a.sc.tokens; if (tk) { parts.push(sgn(tk) + ' point token' + (Math.abs(tk) > 1 ? 's' : '')); acc += tk; }
    const nb = Object.fromEntries((sc.detail || []).map(x => [x.card, x.bonus])); let bacc = 0;
    new Set(Object.keys(nb).concat(Object.keys(a.bonus))).forEach(k => { const v = (nb[k] || 0) - (a.bonus[k] || 0); if (v) { parts.push(sgn(v) + ' ' + cname(+k) + ' bonus'); bacc += v; } });
    if (sc.bonus - a.sc.bonus - bacc) parts.push(sgn(sc.bonus - a.sc.bonus - bacc) + ' purple card bonus');
    acc += sc.bonus - a.sc.bonus;
    const ev = sc.events - a.sc.events;
    if (ev) {
      const names = []; G.bev.forEach((e, i) => { if (e.o === s && a.bev[i] !== s) names.push(D.basicEvents[e.k].name); }); G.sev.forEach((e, i) => { if (e.o === s && a.sev[i] !== s) names.push(D.specialEvents[e.k].name); });
      parts.push(sgn(ev) + ' event' + (names.length ? ': ' + names.join(', ') : '')); acc += ev;
    }
    const jr = sc.journey - a.sc.journey; if (jr) { parts.push(sgn(jr) + ' Long Road'); acc += jr; }
    if (acc !== d) parts.push(sgn(d - acc) + ' other');
    out.push({ seat: s, d, parts });
  });
  return out;
}
function ptsLine(x) { return pname(x.seat) + ' ' + sgn(x.d) + ' ★: ' + x.parts.join(', '); }
// show the changes: your own as a points banner, the others' inside the "Since your turn" list
function ptsShow(list, mover) {
  UI.scoreAudit = UI.scoreAudit || { n: 0, miss: [] };
  const lines = [];
  for (const x of list) {
    UI.scoreAudit.n++;
    if (!x.parts.length || x.parts.some(t => / other$/.test(t))) UI.scoreAudit.miss.push(ptsLine(x));
    lines.push(ptsLine(x));
  }
  if (!lines.length) return [];
  return lines;
}
// what the move did for the player who made it: resources, cards, workers (and points, with their causes)
function gainParts(b, s) {
  const p = G.players[s], a = b[s], o = [];
  for (const k of RESK) { const d = p.res[k] - a.res[k]; if (d) o.push(sgn(d) + ' ' + rname(k, Math.abs(d))); }
  const hd = p.hand.length - a.hand; if (hd) o.push(sgn(hd) + ' card' + (Math.abs(hd) > 1 ? 's' : '') + ' in hand');
  const wd = p.workers - a.workers; if (wd) o.push(sgn(wd) + ' worker' + (wd > 1 ? 's' : '') + ' (' + p.workers + ' now)');
  return o;
}
function gainBanner(b, s, pts) {
  const x = pts.find(y => y.seat === s), g = gainParts(b, s);
  if (!x && !g.length) return;
  ptsBanner(x ? x.d : 0, (x ? x.parts : []).concat(g));
}
function ptsBanner(d, parts) {
  const e = $('#ptsb'); if (!e) return;
  e.innerHTML = ''; e.className = d < 0 ? 'down' : 'up';
  e.appendChild(h('b', d ? (d > 0 ? '+' : '−') + Math.abs(d) + ' ★' : 'You:')); e.appendChild(h('span', parts.join(' · ')));
  e.hidden = false; clearTimeout(UI.ptsT); UI.ptsT = setTimeout(() => { e.hidden = true; }, 4200);
}
// ---- phones: one strip at a time (Hand or City), switched by two tabs
function stripTabs() {
  const t = $('#stabs'); if (!t) return;
  const ph = isPh(); t.hidden = !ph;
  const s = focusSeat(), v = viewSeat(), p = G.players[s];
  const city = ph && UI.tab === 'city';
  $('#cityS').classList.toggle('off', ph && !city); $('#handS').classList.toggle('off', ph && city);
  if (!ph) return;
  t.innerHTML = '';
  const hn = v >= 0 ? G.players[v].hand.length : 0;
  const cityOk = $$('#cityRow .sc.ok,#cityRow .sc.rec').length;
  t.appendChild(h('button.tab' + (city ? '' : '.on'), { 'data-a': 'tab', 'data-v': 'hand', type: 'button', 'aria-pressed': String(!city) }, (v >= 0 ? 'Your hand ' + hn + '/8' : 'Hand')));
  t.appendChild(h('button.tab' + (city ? '.on' : '') + (cityOk && !city ? '.glow' : ''), { 'data-a': 'tab', 'data-v': 'city', type: 'button', 'aria-pressed': String(city) }, (s === v ? 'Your city ' : p.name + "'s city ") + HB.cityCount(G, s) + '/15'));
}
document.addEventListener('click', ev => { const b = ev.target.closest('#ptsb'); if (b) { b.hidden = true; ev.stopPropagation(); return; } }, true);
document.addEventListener('click', ev => { const t = ev.target.closest('[data-a=tab]'); if (!t) return; UI.tab = t.dataset.v; renderDock(); });
// ---- one-card board map (guided game, and once at the start of every other game you play)
function boardMap() {
  const row = (ico, b, t) => h('li', h('span.mapi', ico), h('span', h('b', b), ' ' + t));
  return h('div', h('ul.map',
    row(ic('twig', 20), 'Brown and green tiles:', 'places for your workers. The icons show what you get. Glowing = open to you now.'),
    row(ic('flag', 20), 'Flags and stars:', 'events. Get the cards they ask for, then a worker claims the points. A ? star scores a varying amount: tap it to read how.'),
    row(ic('road', 20), 'Long Road:', 'opens in your last season (Autumn): a worker there scores 2–5 points.'),
    row(ic('deck', 20), 'Big cards:', 'the meadow. Anyone can buy them, just like cards in your hand.')),
    h('p.sm', 'Tap anything to see what it does. Hint suggests a move and says why.'));
}
function mapCard() {
  if (UI.mode === 'guided' || UI.mapShown || viewSeat() < 0 || UI.coach.level === 'off') return false;
  UI.mapShown = true;
  pushCard({ kind: 'coach', title: 'How to win', sub: 'Most points when everyone has passed', body: () => h('div', h('p', 'Each turn do one thing: place a worker, play a card, or Prepare for the next season once all your workers are out.'), boardMap()), buttons: [{ label: 'Got it', a: 'cont' }] });
  return true;
}
// ---- the score race, always visible in the top bar: you, then the leader among the others
function raceEl() {
  const v = viewSeat() >= 0 ? viewSeat() : focusSeat();
  const rows = G.players.map((p, s) => ({ s, n: s === viewSeat() ? 'You' : p.name, t: score(s).total, out: p.passed }));
  if (G.grim) rows.push({ s: 'G', n: D.soloName.split(' ').pop(), t: HB.grimScore(G).total });
  const me = rows.find(r => r.s === v), others = rows.filter(r => r !== me).sort((a, b) => b.t - a.t);
  const show = [me].concat(others.slice(0, G.np > 2 ? 1 : 2)).filter(Boolean);
  const e = h('span.race', { 'aria-label': 'Points so far: ' + rows.map(r => r.n + ' ' + r.t).join(', ') });
  show.forEach((r, k) => e.appendChild(h('span', '★' + r.t + ' ' + r.n, r.out ? h('i', ' ✓') : null)));
  return e;
}
// ---- sheets that run past the bottom say so ("more below") until you scroll to the end
function moreCue() {
  $$('#pc .ph-body,#ppop .ph-body').forEach(b => {
    const more = b.scrollHeight > b.clientHeight + 6 && b.scrollTop + b.clientHeight < b.scrollHeight - 6;
    const host = b.parentNode; let cue = host.querySelector(':scope > .morecue');
    if (more && !cue) { cue = h('div.morecue', { 'aria-hidden': 'true' }, '▼ more below, scroll'); host.insertBefore(cue, b.nextSibling); }
    else if (!more && cue) cue.remove();
  });
}
document.addEventListener('scroll', ev => { if (ev.target && ev.target.classList && ev.target.classList.contains('ph-body')) moreCue(); }, true);
// ---- the one-line "Since your turn" preview: cut it to whole words that fit, so no text runs past the panel
function fitRecap() {
  $$('.gx-recap-1').forEach(e => {
    const full = e.textContent; if (!full || e.dataset.fit === full || e.clientWidth <= 0) return;
    let t = full; e.title = full;
    while (e.scrollWidth > e.clientWidth + 1 && t.length > 8) { t = t.replace(/\s*\S+\s*$/, ''); e.textContent = t + '…'; }
    e.dataset.fit = e.textContent;
  });
}
