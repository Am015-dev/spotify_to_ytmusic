// ===================== part 13: painted extras (card backs, tables, title and end art, portraits) and music (per screen + picker) =====================
const MEDIA = 'media/';
try { GXSK.init({}); } catch (e) {}
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = f => { const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
// ---- card backs: the deck tile and the help pictures wear the painted back; campaign unlocks (sprout, frost) replace the default
function backApply() {
  const R = document.documentElement, id = unl('cardback') || 'default';
  R.style.setProperty('--back-img', 'url(' + MEDIA + 'back-' + id + '.webp)');
  R.style.setProperty('--back-meadow', 'url(' + MEDIA + 'back-meadow.webp)');
}
// ---- tables: painted tree stump behind the board; the CSS green stays while it loads and if the file is missing
// bench + player mat paintings (transparent): the drawn ones hide once the picture has loaded
['bench','mat'].forEach(n => { const im = new Image(); im.onload = () => { document.documentElement.dataset[n] = '1'; }; im.src = MEDIA + n + '.webp'; });
const tblSeen = {}; let tblCur = '';
function tableApply() {
  const R = document.documentElement, id = unl('table') || 'woodland';
  const f = id === 'woodland' && matchMedia('(max-aspect-ratio:4/5)').matches ? 'table-woodland-phone' : 'table-' + id;
  if (f === tblCur) return;
  const go = () => { tblCur = f; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + '.webp)'); R.dataset.timg = '1'; };
  if (tblSeen[f]) return go();
  const im = new Image(); im.onload = () => { tblSeen[f] = 1; go(); }; im.src = MEDIA + f + '.webp';
}
// ---- title key art behind the start card (only once the picture has loaded)
function titleArt() {
  const R = document.documentElement; if (R.dataset.tart) return;
  const im = new Image(); im.onload = () => { R.dataset.tart = '1'; const s = $('#start'); if (s) s.classList.add('art'); }; im.src = MEDIA + (matchMedia('(max-aspect-ratio:4/5)').matches ? 'title-phone' : 'title') + '.webp';
}
// ---- end art: a painted banner on top of the result card
function hbWon() {
  if (!G || !G.over) return true; const ov = G.over;
  if (G.grim) return !!ov.win; if (watching()) return true;
  return ov.tie || humans().includes(ov.winner);
}
function endBanner() {
  const pc = $('#pc'); if (!pc || pc.getAttribute('data-card') !== 'over' || pc.querySelector('.endart')) return;
  const w = hbWon(); if (!IMG_OK[w ? 'end-win' : 'end-lose']) return;
  pc.insertBefore(h('div.endart.' + (w ? 'win' : 'lose'), { 'aria-hidden': 'true' }), pc.firstChild);
}
// ---- campaign portraits on the rival drawer
function portraitFor(name) {
  try { const c = window.CAMPAIGN && window.CAMPAIGN.cast; if (!c || !name) return null; for (const k in c) { const last = c[k].name.split(' ').pop(); if (name === c[k].name || name === last) return c[k]; } } catch (e) { }
  return null;
}
function rivalPortrait() {
  const b = $('#rivalbody'); if (!b || !G || UI.rseat == null || UI.rseat === 'G') return;
  const p = portraitFor(G.players[UI.rseat] && G.players[UI.rseat].name); if (!p || !UI.camp) return;
  const im = h('img.rport', { src: MEDIA + p.portrait, alt: '', draggable: 'false' }); im.style.borderColor = p.color; im.onerror = () => im.remove();
  b.insertBefore(h('div.rhead', im, h('b', p.name)), b.firstChild.nextSibling);
}
// ---- music: five slots (Menu, Game, Fight, Victory, Defeat), two tracks each, saved choice a / b / shuffle / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Fight'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'The Village Wakes', 'tavern-b': 'Sunlight Through the Canopy','tavern-short-a': 'Short menu loop A','tavern-short-b': 'Short menu loop B', 'main-a': 'Quiet Cartographer', 'main-b': 'Meadowlight Turn', 'fight-a': 'Last Harvest Before Winter', 'fight-b': "Fiddle at the Wood's Edge", 'victory-a': 'Grove of Golden Light', 'victory-b': 'Tambourine at the Woodland Gate', 'defeat-a': 'Late October', 'defeat-b': 'Last Chord, Golden Light' };
const MDEF = { tavern:'all',main:'all',fight:'all', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
// 'all' = shuffle through every looping song (menu, game and fight tracks), a new one every ~2.5 min
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('hb_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over') return [hbWon() ? 'victory' : 'defeat', 1];
  if (UI.camp && UI.camp.boss) return ['fight', 0];
  try { const p = G.players[Math.max(0, focusSeat())]; if (p && p.season === 3 && !(UI.cfg && UI.cfg.tutorial)) return ['fight', 0]; } catch (e) { }
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicSync() {
  if (UI.sound === false || !window.GA || MUS.prev) return;
  const w = musicSlot(); if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
  else if (MUS.pick[w[0]] === 'all' && !w[1] && MUS.since && Date.now() - MUS.since > MALL_MS) MUS.res[w[0]] = null;
  const n = musicName(w[0]); if (MUS.want === n) return; MUS.want = n; MUS.since = Date.now(); if (n !== '-') MUS.last = n;
  if (n === '-') { GA.music(null, { fade: 1 }); return; }
  GA.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
  if (w[0] === 'tavern' || w[0] === 'main') setTimeout(() => { try { const nx = w[0] === 'tavern' ? 'main' : 'fight', c = MUS.pick[nx]; if (c !== 'off' && c !== 'shuffle' && c !== 'all') GA.preload(musicName(nx)); } catch (e) { } }, 4000);
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('hb_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
function musicPreview(slot) {
  if (!window.GA || UI.sound === false || MUS.wslot === slot) return; const n = musicName(slot); if (n === '-') return;
  clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; GA.music(n, { fade: .5, once: true });
  MUS.prevT = setTimeout(() => { MUS.prev = null; MUS.want = null; musicSync(); renderMusic(); }, 8000);
}
function musicPreviewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; musicSync(); }
function renderMusic() {
  const b = $('#musicbody'); if (!b) return; b.innerHTML = '';
  const on = UI.sound !== false; let vol = .5; try { vol = GA.state().musVol; } catch (e) { }
  const chip = (cls, at, label) => h('button.mchip' + cls, Object.assign({ type: 'button' }, at), label);
  const slider = h('input#mvol', { type: 'range', min: 0, max: 1, step: .05, value: vol, 'aria-label': 'Music volume' });
  slider.addEventListener('input', () => { try { GA.setVolume('music', +slider.value); } catch (e) { } });
  b.appendChild(h('div.mtop', chip(on ? '.on' : '', { 'data-a': 'mmus' }, 'Music: ' + (on ? 'on' : 'off')), h('label.mvol', 'Volume ', slider)));
  b.appendChild(h('div.mtop', chip(MLOOPS.every(k => MUS.pick[k] === 'all') ? '.on' : '', { 'data-a': 'mall' }, '⇄ Shuffle all songs')));
  MSLOTS.forEach(([k, nm]) => {
    const cur = MUS.pick[k], act = MUS.wslot === k && on && cur !== 'off';
    const row = h('div.mchips');
    ['a', 'b'].forEach(v => row.appendChild(chip(cur === v ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': v }, MTITLE[k + '-' + v])));
    row.appendChild(chip(cur === 'shuffle' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
    if (MLOOPS.includes(k)) row.appendChild(chip(cur === 'all' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'all' }, '⇄ All songs'));
    row.appendChild(chip(cur === 'off' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'off' }, 'Off'));
    if (MUS.prev === k) row.appendChild(chip('.prev', { 'data-a': 'mprevx', 'data-s': k }, '■ Stop preview'));
    else if (!act && cur !== 'off' && on) row.appendChild(chip('.prev', { 'data-a': 'mprev', 'data-s': k }, '▶ Preview'));
    b.appendChild(h('div.mrow2', h('h3', nm, act ? h('small', ' playing now') : null), row));
  });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  if (a === 'musicopen') { try { GX.close(); } catch (x) { } renderMusic(); GX.show('musicd'); }
  else if (a === 'mpick') { musicPick(t.dataset.s, t.dataset.c); renderMusic(); }
  else if (a === 'mall') { const on = MLOOPS.every(k => MUS.pick[k] === 'all'); MLOOPS.forEach(k => musicPick(k, on ? MDEF[k] : 'all')); renderMusic(); }
  else if (a === 'mprev') { musicPreview(t.dataset.s); renderMusic(); }
  else if (a === 'mprevx') { musicPreviewStop(); renderMusic(); }
  else if (a === 'mmus') { UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); try { GX.renderSettings(); } catch (x) { } }
});
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  backApply(); tableApply(); titleArt();
  ['back-default', 'back-meadow', 'camp-hazel', 'camp-bramble', 'end-win', 'end-lose'].forEach(preImg);
  addEventListener('resize', () => { tableApply(); });
  setInterval(() => { try { sndMusic(); backApply(); tableApply(); } catch (e) { } }, 800);
}
// the start card, the result card and the rival drawer pick up the new pieces after each render
(function () {
  const rs = renderStart; renderStart = function () { const r = rs.apply(this, arguments); try { titleArt(); sndMusic(); } catch (e) { } return r; };
  const rc = renderCard; renderCard = function () { const r = rc.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
  const rr = renderRival; renderRival = function () { const r = rr.apply(this, arguments); try { rivalPortrait(); } catch (e) { } return r; };
})();
// ===================== see what to do, how points come in, when a turn ends (owner, Addendum 5) =====================
// 1 turn tracker + always-visible score breakdown in the top bar; 2 "Turn over: why" card; 3 points pop with the reason; 4 best-value badge on the best spot / meadow card / hand card;
// 5 preview of what a spot or card yields (hover, focus or touch-down); 6 one-line good / okay / poor rating of your move, compared with the computer's evaluation.
// HINTS (top-bar toggle, OFF by default; always on inside Learn to play): previews, best badges, good/okay/poor line, "What should I do?"
try { UI.hints = localStorage.getItem('hb_hints') === '1'; } catch (e) { UI.hints = false; }
function hintsActive() { return !!(UI.hints || (UI.cfg && UI.cfg.coached)); }
function goalCard() {
  const D2 = (t) => h('li', t);
  UI.cards.unshift({ kind: 'goal', title: 'Goal', sub: 'Win the Elderheart Oak', body: () => h('div', h('p', 'Have the most points when everyone has passed.'), h('ul.goal', D2('Buildings and critters you build score the points printed on them.'), D2('Point tokens, flags (events) you claim and bonus cards add more.'), D2('Pass when your workers are used up: the highest total wins.'))), buttons: [{ label: 'Start', a: 'cont' }] }); render();
}
const SEE = { vals: null, key: '', last: null, scores: null, actor: -1, rate: null };
function seeToast(id, html, ms, top) {
  let e = document.getElementById(id);
  if (!e) { e = document.createElement('div'); e.id = id; e.className = 'hbtoast'; e.setAttribute('role', 'status'); e.setAttribute('data-help', ''); document.body.appendChild(e); }
  e.style.top = top + 'px'; e.innerHTML = html; e.classList.add('on'); clearTimeout(e._t); if (ms) e._t = setTimeout(() => e.classList.remove('on'), ms);
}
function seeToastOff(id) { const e = document.getElementById(id); if (e) e.classList.remove('on'); }
const seeMine = () => !!G && UI.started && G.phase !== 'over' && HB.actor(G) === viewSeat() && viewSeat() >= 0 && !G.players[viewSeat()].ai;
// ---- values for all my legal moves, once per position
function seeVals() {
  if (!seeMine() || G.q) return null;
  const k = G.logN + ':' + G.turn; if (SEE.key === k) return SEE.vals;
  SEE.key = k; SEE.vals = null;
  try { const r = HB.AI.rank(G, viewSeat()); if (r.length > 1) { const mx = Math.max(...r.map(x => x.v)), mn = Math.min(...r.map(x => x.v)); SEE.vals = { r, mx, mn, rng: Math.max(1e-6, mx - mn), seat: viewSeat(), p: G.players[viewSeat()], sc: score(viewSeat()).total }; } } catch (e) { SEE.vals = null; }
  return SEE.vals;
}
// ---- tracker + score breakdown
function seeTracker() {
  const bp = $('#barprompt'); if (!bp || !G) return; let t = $('#trk');
  if (!t) { t = document.createElement('div'); t.id = 'trk'; t.setAttribute('data-help', ''); bp.appendChild(t); }
  const v = Math.max(0, viewSeat()), me = G.players[v], a = G.phase === 'over' ? -1 : HB.actor(G), sc = G.players.map((_, s) => score(s));
  const best = Math.max(...sc.map(x => x.total)), lead = sc.filter(x => x.total === best).length === 1 ? sc.findIndex(x => x.total === best) : -1;
  const free = availW(me), used = me.workers - free;
  const who = G.phase === 'over' ? 'Game over' : a === v ? 'Your turn' : G.players[a].name + "'s turn";
  const tok = '<span class="tk" aria-label="' + free + ' of ' + me.workers + ' workers left">' + '<i class="on"></i>'.repeat(free) + '<i></i>'.repeat(Math.max(0, used)) + '</span>';
  const part = s => { const x = sc[s], nm = s === v ? 'You' : G.players[s].name; return '<span class="sp' + (s === lead ? ' lead' : '') + '"><b>' + nm + ' ' + x.total + (s === lead ? ' ♛' : '') + '</b> <small>cards ' + x.cards + ' · tokens ' + x.tokens + ' · events ' + x.events + (x.bonus ? ' · bonus ' + x.bonus : '') + '</small></span>'; };
  t.innerHTML = '<div class="tr1"><b>' + SEASN[me.season] + '</b> season ' + (me.season + 1) + ' of 4 · <span class="who' + (a === v ? ' mine' : '') + '">' + who + '</span> ' + (G.phase === 'over' ? '' : tok + ' <span class="fw">workers left</span>') + '</div>';
  // the points pop: what each player just earned and why
  const prev = SEE.scores; SEE.scores = sc.map(x => ({ total: x.total, cards: x.cards, tokens: x.tokens, events: x.events, bonus: x.bonus, journey: x.journey }));
  if (prev && prev.length === sc.length) sc.forEach((x, s) => { const o = prev[s], d = x.total - o.total; if (d <= 0) return;
    const why = x.events > o.events ? 'event claimed' : x.cards > o.cards ? 'card points' : x.tokens > o.tokens ? 'point tokens' : x.bonus > o.bonus ? 'bonus' : x.journey > o.journey ? 'journey' : 'points';
    const chip = $('.chip[data-seat="' + s + '"]'); try { if (chip && typeof fxFloat === 'function') fxFloat(frameRect(chip), 'point', '+' + d + ' ' + why, null, { n: 1 }); } catch (e) { }
    seeToast('hbpop', '<b>+' + d + '</b> ' + (s === v ? 'You' : G.players[s].name) + ': ' + why, 4600, 168); });
}
// ---- "Turn over: why"
function seeTurnOver() {
  if (!G || !UI.started) return; const v = viewSeat(), a = G.phase === 'over' ? -2 : HB.actor(G);
  if (!hintsActive()) { SEE.actor = a; return; }
  if (SEE.actor === v && a !== v && v >= 0 && !(a === -2)) {
    const me = G.players[v], free = availW(me), n = G.players[a] ? G.players[a].name : 'The rival';
    const why = me.passed ? 'You passed, so you are done for the game.' : free === 0 ? 'All your workers are out, so only a card, Prepare or Pass is left.' : 'Each player takes one action, then the turn moves on (' + free + ' worker' + (free === 1 ? '' : 's') + ' left).';
    seeToast('hbover', '<b>Turn over:</b> ' + why + ' ' + n + ' plays now.', 3600, 214);
  }
  SEE.actor = a;
}
// ---- badges + preview
function seeBadges() {
  if (!hintsActive()) { document.querySelectorAll('.hbbest').forEach(e => e.classList.remove('hbbest')); return; }
  document.querySelectorAll('.hbbest').forEach(e => e.classList.remove('hbbest'));
  const V = seeVals(); if (!V || !UI.tgEls) return;
  const grp = tg => /^w:(basic|forest)/.test(tg) ? 'spot' : /^p:meadow:/.test(tg) ? 'meadow' : /^p:hand:/.test(tg) ? 'hand' : '';
  const best = {};
  for (const x of V.r) { const tg = tgOf(x.m), g = grp(tg); if (!g || !UI.tgEls[tg]) continue; if (!best[g] || x.v > best[g].v) best[g] = { v: x.v, tg }; }
  for (const g in best) { const n = V.r.filter(x => grp(tgOf(x.m)) === g).length; if (n > 1 && best[g].v > V.mn + 1e-6) { const e = UI.tgEls[best[g].tg]; if (e) e.classList.add('hbbest'); } }
}
function seeDelta(x, V) {
  const q = x.W.players[V.seat], p = V.p, parts = [];
  for (const k of ['twig', 'resin', 'pebble', 'berry']) { const d = q.res[k] - p.res[k]; if (d) parts.push((d > 0 ? '+' : '') + d + ' ' + k); }
  const dp = HB.score(x.W, V.seat).total - V.sc; if (dp) parts.push((dp > 0 ? '+' : '') + dp + ' point' + (Math.abs(dp) === 1 ? '' : 's'));
  const dc = q.hand.length - p.hand.length; if (dc > 0) parts.push('+' + dc + ' card' + (dc > 1 ? 's' : '')); if (q.city.length > p.city.length) parts.push('built');
  return parts.join(', ') || 'nothing now';
}
function seePreview(el) {
  if (!hintsActive()) return;
  const V = seeVals(); if (!V) return; const tg = el && el.dataset && el.dataset.t; if (!tg) return;
  const xs = V.r.filter(x => tgOf(x.m) === tg); if (!xs.length) return; const x = xs.reduce((a, b) => (b.v > a.v ? b : a));
  let name = '', ab = '';
  if (x.m.type === 'worker') { const m = /^w:(basic|forest):(\d+)/.exec(tg); if (m) { const t = tileInfo(m[1], +m[2]); name = t.name; ab = t.text || ''; } }
  else if (/^p:(hand|meadow):/.test(tg)) { const id = +tg.split(':')[2]; try { const sp = spec(id); name = sp.name; ab = sp.text || ''; } catch (e) { } }
  const tag = V.r.every(y => y.v <= x.v + 1e-9) ? ' <em>best now</em>' : '';
  seeToast('hbprev', '<b>' + (name || 'This move') + ':</b> ' + seeDelta(x, V) + tag + (ab ? '<small>' + ab + '</small>' : ''), 0, 260);
}
document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('[data-t]'); if (t && t.classList.contains('glow')) seePreview(t); else if (!e.target.closest('#hbprev')) seeToastOff('hbprev'); }, true);
document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('[data-t]'); if (t) seePreview(t); }, true);
document.addEventListener('pointerdown', e => { const t = e.target.closest && e.target.closest('[data-t]'); if (t && t.classList.contains('glow')) seePreview(t); }, true);
document.addEventListener('pointerup', () => setTimeout(() => seeToastOff('hbprev'), 500), true);
// ---- rating of my move: good / okay / poor, with the reason, against the computer's evaluation of the same position
(function () {
  const o = act;
  act = function (m) {
    let rate = null;
    try { if (!hintsActive()) throw 0; const V = SEE.vals; if (V && seeMine() && G.players[viewSeat()] === V.p && m && m.type !== 'choose' && !(UI.cfg && UI.cfg.tutorial && false)) {
      const me = V.r.find(x => sameM(x.m, m)); if (me) { const best = V.r.reduce((a, b) => (b.v > a.v ? b : a)), d = (best.v - me.v) / V.rng;
        const nm = x => x.m.type === 'worker' ? (x.m.label || 'another spot') : x.m.type === 'pass' ? 'passing' : x.m.type === 'prepare' ? 'Prepare' : (x.m.label || 'another move');
        rate = d <= .12 ? ['good', 'Good: ' + (me === best ? 'the best of ' + V.r.length + ' moves' : 'close to the best') + '. ' + seeDelta(me, V) + '.'] : d <= .4 ? ['okay', 'Okay: ' + nm(best) + ' was a bit better (' + seeDelta(best, V) + ').'] : ['poor', 'Poor: ' + nm(best) + ' was much better (' + seeDelta(best, V) + ').']; } }
    } catch (e) { rate = null; }
    seeToastOff('hbprev');
    const r = o.apply(this, arguments);
    if (rate) { SEE.rate = rate; if (UI.cfg && UI.cfg.coached) UI.fbQ = [{ t: rate[1], at: Date.now() }]; else seeToast('hbrate', '<b class="r-' + rate[0] + '">' + rate[1] + '</b>', 4200, 168); }
    return r;
  };
})();
(function () { const o = render; render = function () { const r = o.apply(this, arguments); try { seeTracker(); seeTurnOver(); setTimeout(() => { try { seeBadges(); } catch (e) { } }, 60); } catch (e) { console.warn('see', e); } return r; }; })();

document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#hintsbtn'); if (!b) return; UI.hints = !UI.hints; try { localStorage.setItem('hb_hints', UI.hints ? '1' : '0'); } catch (x) { } seeToastOff('hbprev'); seeToastOff('hbrate'); seeToastOff('hbover'); SEE.key = ''; render(); });
(function () { const o = render; render = function () { const r = o.apply(this, arguments); try { const on = hintsActive(); document.documentElement.classList.toggle('hints-on', on); const b = $('#hintsbtn'); if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', on); b.hidden = !!(UI.cfg && UI.cfg.coached); }
  if (typeof GXH !== 'undefined' && UI._gxhOn !== on) { UI._gxhOn = on; try { GXH.setEnabled(on); } catch (e) { } }
  if (!on) ['hbprev', 'hbrate', 'hbover'].forEach(seeToastOff); } catch (e) { } return r; }; })();
