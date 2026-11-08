// ===================== part 14: the Play view (W457): one focus at a time =====================
// Phone: a top bar (scores, resource piles, worker meeples), ONE focus panel (Places | Meadow | City), a fanned hand, the action row.
// Wide: the same pieces side by side. Same contract as the old board (src/ui2.js renderBoard, kept behind ?board=old):
// UI.tgEls + data-a="t"/data-t targets, UI.tiles / UI.cr rects, UI.lay.{W,H,acts,hand}, and the classes the coach, help and tests
// look for (.tile.t-*, .mc, .sc, .hc, .chip[data-seat], .chips, .rs[data-res], .resrow, .strip.city, .strip.hand).
// PV_FEEL holds the game-agnostic feel bits (drag to a target, hop, vibrate) so they can move to the shell later.
const PV_ON = (() => { try { return new URLSearchParams(location.search).get('board') !== 'old'; } catch (e) { return true; } })();
const PV_FEEL = {
  tick(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 14); } catch (e) { } },
  // el hops in an arc from rect `from` (board coords) to where it is now
  hop(el, from, ms) {
    if (!el || !from || !ANIM) return; const to = frameRect(el); if (!to) return;
    const a = ctr(from), b = ctr(to), dx = a.x - b.x, dy = a.y - b.y, lift = Math.min(90, 40 + Math.hypot(dx, dy) * .18);
    el.style.zIndex = 70;
    const an = animate(el, [{ transform: `translate(${dx}px,${dy}px) scale(.85)` }, { transform: `translate(${dx / 2}px,${dy / 2 - lift}px) scale(1.3)`, offset: .5 },
      { transform: 'translate(0,-6px) scale(1.12,.9)', offset: .86 }, { transform: 'none' }], { duration: ms || 560, easing: 'cubic-bezier(.3,.7,.4,1)' });
    if (an) an.onfinish = () => { el.style.zIndex = ''; };
  },
  // a draggable thing: onStart(), onMove(x,y) -> element under the finger, onDrop(x,y,under) -> true when it landed
  drag: null
};
// ---- plain words for a place
function pvWord(k, n) {
  if (RESK.indexOf(k) >= 0) { n = +n || 1; return n + ' ' + rname(k, n); }
  if (k === 'card') return n === '2ea' ? '2 cards each' : ((+n || 1) + ((+n || 1) === 1 ? ' card' : ' cards'));
  if (k === 'any') return 'any ' + (n === '' ? 1 : n);
  if (k === 'point') return (+n || 1) + ((+n || 1) === 1 ? ' point' : ' points');
  return '';
}
const PV_SPECIAL = {
  forest_rummage_hollow: ['Swap cards', 'draw 2 per discard', 'card'], forest_echoing_meadow: ['Copy a place', '+ 1 card', 'copy'],
  forest_barter_stump: ['Cards to goods', '1 each, up to 3', 'any'], forest_meadow_bazaar: ['Take 2 meadow', 'play 1 for 1 less', 'meadow']
};
function pvSpot(kind, i) {
  const join = l => { const w = l.map(([k, n]) => pvWord(k, n)).filter(Boolean); return { main: w.slice(0, 2).join(' + '), sub: w.slice(2).join(' + '), ico: l[0] ? l[0][0] : 'any' }; };
  if (kind === 'basic') { const o = join(basicItems(i)); if (D.basic[i].shared) o.sub = o.sub ? o.sub + ' · shared' : 'shared'; return o; }
  if (kind === 'forest') { const k = D.forest[G.forest[i]].key; if (PV_SPECIAL[k]) { const s = PV_SPECIAL[k]; return { main: s[0], sub: s[1], ico: s[2] }; } return join(FIC[k] || [['any', '']]); }
  if (kind === 'haven') return { main: 'Cards to goods', sub: '2 cards = any 1', ico: 'haven' };
  if (kind === 'journey') return { main: 'Journey', sub: 'Autumn only: points', ico: 'road' };
  if (kind === 'bev') { const dd = D.basicEvents[G.bev[i].k]; return { main: dd.name, sub: 'Goal · ' + dd.pts + ' points', ico: 'flag' }; }
  if (kind === 'sev') { const dd = D.specialEvents[G.sev[i].k]; return { main: dd.name, sub: 'Goal · ' + (dd.pts || '?') + ' points', ico: 'star' }; }
  return { main: '', sub: '', ico: 'any' };
}
// ---- card faces: name, painted art, cost as big icons with numbers, points
function pvArt(sp) { const a = h('div.pvc-art'); const u = HBKit.paintedHref && HBKit.paintedHref(sp.art); if (u) a.style.backgroundImage = 'url("' + u + '")'; else { const g = HBKit.art(sp.art, 200); g.setAttribute('width', '100%'); g.setAttribute('height', '100%'); g.setAttribute('preserveAspectRatio', 'xMidYMid slice'); a.appendChild(g); } return a; }
function pvCost(cost, px) {
  const w = h('span.pvc-cost'); let any = false;
  for (const r of RESK) if (cost && cost[r]) { any = true; w.appendChild(h('span.pvc-ci', { 'data-r': r }, ic(r, px), h('b', cost[r]))); }
  if (!any) w.appendChild(h('span.pvc-free', 'Free'));
  return w;
}
function pvNeed(cost, res) { const a = []; for (const r of RESK) { const d = (cost && cost[r] || 0) - (res[r] || 0); if (d > 0) a.push(d + ' ' + rname(r, d)); } return a; }
function pvFace(id, o) {
  o = o || {}; const sp = spec(id), T = (HBKit.TYPES && HBKit.TYPES[sp.type]) || { c: '#a67c52', d: '#6b4a2a' };
  const f = h('div.pvc' + (o.small ? '.small' : ''), { style: `--tc:${T.c};--td:${T.d}` });
  f.appendChild(h('div.pvc-name', sp.name));
  const art = pvArt(sp); f.appendChild(art);
  art.appendChild(h('span.pvc-pts', { title: (sp.points || 0) + ' points' }, h('b', sp.points || 0)));
  if (o.small) art.appendChild(pvCost(sp.cost, 17));
  else { f.appendChild(h('div.pvc-row', pvCost(sp.cost, 26))); f.appendChild(h('div.pvc-type', (TYPEN[sp.type] || '') + (sp.unique ? ' · unique' : ''))); }
  if (o.state) f.appendChild(h('div.pvc-aff.' + o.state[0], o.state[1]));
  return f;
}
function pvMini(id, entry) {
  const sp = spec(id), T = (HBKit.TYPES && HBKit.TYPES[sp.type]) || { c: '#a67c52' };
  const f = h('div.pvm', { style: `--tc:${T.c}` }); const art = pvArt(sp); f.appendChild(art);
  f.appendChild(h('span.pvm-pts', h('b', sp.points || 0)));
  if (entry && (entry.tok || entry.w)) f.appendChild(h('span.pvm-x', (entry.tok ? '+' + entry.tok : '') + (entry.w ? ' ⚑' + entry.w : '')));
  f.appendChild(h('span.pvm-name', sp.name)); return f;
}
// ---- panels (phone: one at a time)
const PV_TABS = [['places', 'Places'], ['meadow', 'Meadow'], ['city', 'City'], ['goals', 'Goals']];
function pvTall() { return !!document.querySelector('#bd.pv.tall'); }
function pvSetTab(v, quiet) {
  UI.pvTab = v; const bd = $('#bd'); if (!bd || !bd.classList.contains('pv')) return;
  bd.querySelectorAll('.pv-panel').forEach(p => p.classList.toggle('on', p.dataset.p === v));
  bd.querySelectorAll('.pv-tab').forEach(t => { const on = t.dataset.v === v; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
  if (!quiet) { const p = bd.querySelector('.pv-panel.on'); if (p) { p.classList.remove('pvin'); void p.offsetWidth; p.classList.add('pvin'); } }
  pvRects(); if (!quiet) { try { placeFinger(); } catch (e) { } }
}
// where things are, for the flying pieces (a piece on a hidden panel flies to / from its tab)
function pvRects() {
  const bd = $('#bd'); if (!bd || !bd.classList.contains('pv')) return; UI.tiles = {}; UI.cr = {};
  const tabR = p => frameRect(bd.querySelector('.pv-tab[data-v="' + p + '"]'));
  const rr = el => { const r = frameRect(el); if (r && r.w > 2) return r; const p = el.closest('.pv-panel'); return (p && tabR(p.dataset.p)) || r; };
  bd.querySelectorAll('.tile').forEach(e => { UI.tiles[e.dataset.k + ':' + e.dataset.i] = rr(e); });
  bd.querySelectorAll('.mc[data-id]').forEach(e => { UI.cr['m' + e.dataset.id] = rr(e); });
  bd.querySelectorAll('.strip.city .sc[data-id]').forEach(e => { UI.cr['c' + e.dataset.id] = rr(e); });
  bd.querySelectorAll('.hc[data-id]').forEach(e => { UI.cr['h' + e.dataset.id] = rr(e); });
  if (UI.lay) UI.lay.hand = frameRect(bd.querySelector('.strip.hand'));
}
function pvChip(s, n) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total, cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s, me = s === focusSeat();
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' of 15 in city' + (grim ? '' : ', ' + availW(p) + ' workers free') });
  e.style.setProperty('--pc', pcolor(s).c);
  const nm = s === viewSeat() && humans().length === 1 ? 'You' : pname(s);
  e.appendChild(pawn(s, 24));
  e.appendChild(h('span.pvch-t', h('b.pvch-n', n >= 4 ? nm.slice(0, 5) : nm), h('span.pvch-s', (p && p.passed ? 'done · ' : '') + cards + '/15 city')));
  e.appendChild(h('b.pvch-pt' + (me ? '.rs' : ''), me ? { 'data-res': 'point' } : {}, h('span.pvch-star', '★'), String(pts)));
  return e;
}
// ---- the view
function pvRender() {
  const host = $('#board'), bd = $('#bd'); if (!host || !bd || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 600;
  const tall = W < H && !document.documentElement.classList.contains('ph-l');
  bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  bd.className = 'pv ' + (tall ? 'tall' : 'wide');
  UI.tgEls = {}; UI.cr = {}; UI.tiles = {};
  const mm = myMoves(), mine = mm.length > 0, v = viewSeat(), fs = focusSeat(), me = G.players[fs];
  const okw = new Set(mm.filter(m => m.type === 'worker').map(tgOf));
  const okp = new Set(mm.filter(m => m.type === 'play').map(tgOf));
  const qm = G.q && mine ? mm.filter(m => m.type === 'choose') : [];
  const qCard = new Map(); qm.forEach(m => { if (m.card !== undefined && !qCard.has(m.card)) qCard.set(m.card, m.i); });
  const qShown = new Set(), qLoc = new Map();
  if (qm.length) G.q.opts.forEach((o, i) => { let loc = o.d && o.d.loc; if (!loc && o.d && o.d.j != null && o.d.seat != null && G.players[o.d.seat] && (o.h === 'rangerTo' || o.h === 'recallGo')) loc = G.players[o.d.seat].dep[o.d.j]; const tg = loc ? tgOf(Object.assign({ type: 'worker' }, loc)) : ''; if (tg && !qLoc.has(tg)) qLoc.set(tg, i); });
  if (UI.sel && (UI.sel.logN !== G.logN || !UI.sel.ms.every(m => mm.some(x => sameM(x, m))))) UI.sel = null;
  if (UI.cityOpen) { UI.cityOpen = null; UI.pvForce = 'city'; }
  const regTg = (tg, e) => { if (tg) { e.setAttribute('data-t', tg); e.setAttribute('data-a', 't'); UI.tgEls[tg] = e; } };
  const actsH = 54, R = { W, H, tall, acts: { x: 6, y: H - actsH, w: W - 12, h: actsH - 4 } }; UI.lay = R;
  const col = h('div.pv-col'); col.style.height = (H - actsH) + 'px'; bd.appendChild(col);
  // ---- top bar: scores, then my resource piles and my workers
  const hud = h('div.pv-hud'); col.appendChild(hud);
  { const c = h('div.chips'), n = G.np + (G.grim ? 1 : 0); c.setAttribute('data-n', n);
    for (let s = 0; s < G.np; s++) c.appendChild(pvChip(s, n)); if (G.grim) c.appendChild(pvChip('G', n));
    const sea = h('span.pvsea', { title: SEASN[me.season] }, seasonIcon(me.season, 30), h('b', SEASN[me.season])); c.appendChild(sea);
    hud.appendChild(c); }
  { const r = h('div.resrow'), show = v >= 0 || watching();
    for (const k of RESK) r.appendChild(h('span.rs' + (show && me.res[k] ? '' : '.zero'), { 'data-res': k, title: rname(k, 2) }, ic(k, 30), h('b', show ? me.res[k] : '?')));
    if (me.pts) r.appendChild(h('span.rs.tok', { 'data-res': 'ptok', title: 'point tokens' }, ic('point', 24), h('b', me.pts)));
    const wk = h('span.rs.wk', { 'data-res': 'worker' }), free = availW(me), canW = mine && okw.size > 0 && !G.q && !UI.sel;
    for (let i = 0; i < me.workers; i++) { const m = h('span.pv-meeple' + (i < free ? '' : '.out') + (i < free && canW ? '.can' : ''), { 'aria-hidden': 'true' }, pawn(fs, 30)); wk.appendChild(m); }
    wk.appendChild(h('b.pv-wn', free + ' left'));
    if (canW) wk.setAttribute('title', 'Drag a worker to a glowing place');
    r.appendChild(wk); hud.appendChild(r); }
  // ---- tabs (phone)
  const tabs = h('div.pv-tabs', { role: 'tablist' }); if (tall) col.appendChild(tabs);
  const tabEl = {};
  for (const [k, l] of PV_TABS) { const t = h('button.pv-tab', { 'data-a': 'pvtab', 'data-v': k, type: 'button', role: 'tab' }, h('span', l), k === 'city' ? h('b.pv-tn', me.city.length + '/15') : k === 'meadow' ? h('b.pv-tn', G.meadow.filter(x => x >= 0).length) : k === 'goals' ? h('b.pv-tn', G.bev.concat(G.sev).filter(x => x.o === -1 || x.o == null).length) : h('b.pv-tn', availW(me))); tabEl[k] = t; tabs.appendChild(t); }
  const stage = h('div.pv-stage'); col.appendChild(stage);
  const panel = (k, title) => { const p = h('section.pv-panel', { 'data-p': k, 'aria-label': title }); if (!tall) p.appendChild(h('h2.pv-h', title)); stage.appendChild(p); return p; };
  // ---- places
  const pPl = panel('places', 'Places: send a worker'), spots = h('div.pv-spots.pv-scrolly'); pPl.appendChild(spots);
  const tile = (kind, i, small) => {
    const info = tileInfo(kind, i), tg = tileTg(kind, i), w = pvSpot(kind, i);
    const e = h('button.tile.t-' + kind + (small ? '.pv-small' : ''), { 'data-zoom': 'tile:' + kind + ':' + i, 'data-k': kind, 'data-i': i, type: 'button', 'aria-label': (info.name || '') + ': ' + w.main + (w.sub ? ', ' + w.sub : '') });
    e.appendChild(h('span.pv-tin', h('span.pv-sico', ic(w.ico, small ? 22 : 26)), h('span.pv-sw', h('b', w.main), w.sub ? h('span', w.sub) : null)));
    const legal = tg && okw.has(tg);
    if (legal) { e.classList.add('glow'); regTg(tg, e); }
    else if (tg && qLoc.has(tg)) { e.classList.add('glow'); regTg('q:' + qLoc.get(tg), e); qShown.add(qLoc.get(tg)); }
    else if (tg) { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:' + tg); if (mine) e.classList.add('no'); }
    if (UI.sel && UI.sel.tg === tg) e.classList.add('sel');
    if (kind === 'bev' || kind === 'sev') { const ev = (kind === 'bev' ? G.bev : G.sev)[i]; if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, 22))); } }
    else { const ws = workersAt(kind, i); if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, 26))); e.appendChild(pw); if (!info.shared && kind !== 'journey' && kind !== 'haven') { e.classList.add('taken'); e.appendChild(h('span.pv-taken', 'Taken')); } } }
    return e;
  };
  const cell = e => spots.appendChild(h('div.pv-cell', e));   // a plain grid cell around each button: rows then size to the words
  for (let i = 0; i < D.basic.length; i++) cell(tile('basic', i));
  for (let i = 0; i < G.forest.length; i++) cell(tile('forest', i));
  cell(tile('haven', 0));
  // ---- goals (events): their own panel, so Places fits one screen
  const pGo = panel('goals', 'Goals: first to qualify claims'), gl = h('div.pv-spots.pv-goals.pv-scrolly'); pGo.appendChild(gl);
  if (tall) gl.appendChild(h('div.pv-sub', 'Goals score points. Have the cards one needs? Send a worker to claim it.'));
  const gcell = e => gl.appendChild(h('div.pv-cell', e));
  gcell(tile('journey', 0, true)); G.bev.forEach((x, i) => gcell(tile('bev', i, true))); G.sev.forEach((x, i) => gcell(tile('sev', i, true)));
  // ---- meadow: a swipeable row of big readable cards
  const pMe = panel('meadow', 'Meadow: cards anyone can build'), mead = h('div.pv-mead.hscroll'); pMe.appendChild(mead);
  const blocked = G.grim ? G.grim.mb : [];
  G.meadow.forEach((id, mi) => {
    const e = h('button.mc', { type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    if (id >= 0) {
      const sp = spec(id), ptg = 'p:meadow:' + id, need = pvNeed(sp.cost, me.res);
      const st = qCard.has(id) ? ['ok', 'Tap to choose'] : okp.has(ptg) ? ['ok', 'You can build it'] : need.length ? ['no', 'Need ' + need.join(', ')] : mine && availW(me) >= 0 && HB.cityCount(G, fs) >= 15 ? ['no', 'City is full'] : ['meh', mine ? 'Not now' : 'Affordable'];
      e.setAttribute('data-zoom', 'card:' + id); e.setAttribute('data-id', id); e.appendChild(pvFace(id, { state: st }));
      if (okp.has(ptg)) { e.classList.add('glow'); regTg(ptg, e); }
      else if (qCard.has(id)) { e.classList.add('glow'); regTg('q:' + qCard.get(id), e); qShown.add(qCard.get(id)); }
      else { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:m' + id); }
      if (UI.sel && UI.sel.tg === ptg) e.classList.add('sel');
    } else e.classList.add('empty');
    if (blocked.indexOf(mi) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    mead.appendChild(e);
  });
  mead.addEventListener('scroll', () => { UI.pvMx = mead.scrollLeft; }, { passive: true });
  // ---- city: 15 slots that fill with the cards' art
  const pCi = panel('city', 'My city'), vis = visitList();
  const city = h('div.strip.city'); pCi.appendChild(city);
  city.appendChild(h('div.pv-ch', h('b', (fs === viewSeat() ? 'My city' : pname(fs) + "'s city")), h('span', me.city.length + ' of 15 · ' + score(fs).total + ' points')));
  const grid = h('div.pv-grid'); city.appendChild(grid);
  const cityCard = (b, it) => {
    const tg = 'd:' + it.id;
    if (okw.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (qLoc.has(tg)) { b.classList.add('glow'); regTg('q:' + qLoc.get(tg), b); qShown.add(qLoc.get(tg)); }
    else if (qCard.has(it.id)) { b.classList.add('glow'); regTg('q:' + qCard.get(it.id), b); qShown.add(qCard.get(it.id)); }
    else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:c' + it.id); }
  };
  const nSl = Math.max(15, me.city.length);
  for (let i = 0; i < nSl; i++) {
    const it = me.city[i];
    if (!it) { grid.appendChild(h('i.pv-slot', { 'aria-hidden': 'true' }, i === me.city.length ? h('span', '+') : null)); continue; }
    const b = h('button.sc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, pvMini(it.id, it));
    cityCard(b, { id: it.id }); grid.appendChild(b);
  }
  if (vis.length) {
    const vr = h('div.pv-visit', h('span.pv-sub', 'Visit a rival’s place:')); city.appendChild(vr);
    vis.forEach(x => { const b = h('button.sc.pv-vc', { 'data-zoom': 'card:' + x.id, 'data-id': x.id, type: 'button', 'aria-label': 'Visit ' + cname(x.id) }, pvMini(x.id), h('span.vb', pawn(x.o, 18))); cityCard(b, x); vr.appendChild(b); });
  }
  city.appendChild(h('div.pv-drop', 'Drop here to build'));
  // ---- my hand: a fan at the bottom; drag a card up to build it, or tap it
  const hand = v >= 0 ? G.players[v].hand : [], nH = hand.length;
  const hs = h('div.strip.hand'); col.appendChild(hs);
  const cw = tall ? Math.min(92, Math.max(70, Math.floor((W - 20) / Math.max(4.2, nH * .62)))) : 118, ch = Math.round(cw * 1.36);
  hs.style.height = (ch + (tall ? 14 : 22)) + 'px';
  hs.appendChild(h('span.scount', v >= 0 ? 'Hand ' + nH + '/8' : ''));
  const span = Math.min(W - 40, tall ? W - 40 : Math.min(W * .7, nH * (cw + 8))), step = nH > 1 ? Math.min(cw + 6, (span - cw) / (nH - 1)) : 0, x0 = (W - (cw + step * (nH - 1))) / 2;
  hand.forEach((id, i) => {
    const tg = 'p:hand:' + id, off = i - (nH - 1) / 2;
    const b = h('button.sc.hc', { 'data-zoom': 'card:' + id, 'data-id': id, type: 'button', 'aria-label': cname(id) + ' (in hand)' }, pvFace(id, { small: true }));
    b.style.cssText = `left:${x0 + i * step}px;width:${cw}px;height:${ch}px;--dy:${Math.round(off * off * (nH > 6 ? 1.6 : 2.6))}px;z-index:${i + 2}`;
    if (okp.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (qCard.has(id)) { b.classList.add('glow'); regTg('q:' + qCard.get(id), b); qShown.add(qCard.get(id)); }
    else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:h' + id); }
    if (UI.sel && UI.sel.tg === tg) b.classList.add('sel');
    hs.appendChild(b);
  });
  if (!nH) hs.appendChild(h('span.sempty', v >= 0 ? 'No cards in hand' : ''));
  // ---- which panel is in front (phone): my turn starts on Places (or the Meadow when no worker is left); a pending choice shows its panel
  const glowIn = k => !!stage.querySelector('.pv-panel[data-p="' + k + '"] .glow');
  const myNow = mine && !G.q && !UI.sel;
  if (UI.pvCityN != null && fs === UI.pvSeat && me.city.length > UI.pvCityN && fs === viewSeat()) { UI.pvForce = 'city'; UI.pvCityAt = Date.now(); }
  UI.pvCityN = me.city.length; UI.pvSeat = fs;
  if (UI.pvForce) { UI.pvTab = UI.pvForce; UI.pvForce = null; }
  else if (myNow && !UI.pvMine) UI.pvTab = availW(me) > 0 && okw.size ? 'places' : (glowIn('meadow') ? 'meadow' : 'places');
  else if (mine && (G.q || UI.sel) && !glowIn(UI.pvTab || 'places')) { const k = PV_TABS.map(x => x[0]).find(glowIn); if (k) UI.pvTab = k; }
  UI.pvMine = myNow;
  if (!UI.pvTab) UI.pvTab = 'places';
  for (const [k] of PV_TABS) if (glowIn(k)) tabEl[k].classList.add('hot');
  // ---- action row / choice tray (shared with the old board)
  renderActs(mm, qm, qShown);
  if (UI.sel) bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow'));
  pvSetTab(UI.pvTab, true);
  mead.scrollLeft = UI.pvMx || 0;
  renderPrompt(); renderBar(); placeFinger();
  if (typeof hlpMarks === 'function' && G.phase !== 'over') hlpMarks();
}
// ---- hook into the existing game: board renderer, scroll-into-view, flights, rival moves, prompt words
if (PV_ON) {
  const _rb = renderBoard; renderBoard = function () { return pvRender(); }; UI.oldBoard = _rb;
  const _hs = hscrollTo;
  hscrollTo = function (el) {
    const p = el && el.closest && el.closest('#bd.pv .pv-panel');
    if (p && pvTall() && !p.classList.contains('on')) pvSetTab(p.dataset.p, true);
    const sy = el && el.closest && el.closest('.pv-scrolly');
    if (sy) { const a = el.offsetTop, b = a + el.offsetHeight; if (a < sy.scrollTop) sy.scrollTop = a - 4; else if (b > sy.scrollTop + sy.clientHeight) sy.scrollTop = b - sy.clientHeight + 4; }
    const hm = el && el.closest && el.closest('.pv-mead');
    if (hm) { const a = el.offsetLeft, b = a + el.offsetWidth; if (a < hm.scrollLeft) hm.scrollLeft = Math.max(0, a - 8); else if (b > hm.scrollLeft + hm.clientWidth) hm.scrollLeft = b - hm.clientWidth + 8; UI.pvMx = hm.scrollLeft; return; }
    return _hs(el);
  };
  // my worker hops from the meeple pile (or where I dropped it) to its place; the rival's from its score chip
  const _fl = fxLand;
  fxLand = function (m, seat, src, preChip) {
    if (!ANIM || !m || !$('#bd.pv')) return _fl(m, seat, src, preChip);
    if (m.type === 'worker' && m.k !== 'dest') {
      const sel = '.tile[data-k="' + (m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k) + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]');
      const t = $(sel), pw = t && t.querySelectorAll('.pw .pawnw'), mine = seat === viewSeat();
      const from = (mine && UI.pvDropAt) || (mine && frameRect($('#bd .rs.wk'))) || preChip || seatRect(seat); UI.pvDropAt = null;
      if (pw && pw.length && from) PV_FEEL.hop(pw[pw.length - 1], from, 600);
      if (t) { t.classList.add('pv-hit'); setTimeout(() => t.classList.remove('pv-hit'), 700); }
      return;
    }
    if (m.type === 'play') { const el = $('#bd .strip.city .sc[data-id="' + m.card + '"]'); if (el) { if (src) flipFrom(el, src, 620); el.classList.add('pv-new'); setTimeout(() => el.classList.remove('pv-new'), 1500); } return; }
    return _fl(m, seat, src, preChip);
  };
  // the rival's move plays out where it happens: its worker over Places, a meadow card over the Meadow
  const _af = aiFly;
  aiFly = function (m, a, done) {
    if (!pvTall()) { pvRects(); return _af(m, a, done); }
    const want = m.type === 'worker' && m.k !== 'dest' ? 'places' : m.type === 'play' && m.from === 'meadow' ? 'meadow' : null, tok = UI.animTok;
    const go = () => {
      if (tok !== UI.animTok) return;
      if (want) {
        pvSetTab(want, true);
        if (m.type === 'play') hscrollTo($('#bd .mc[data-id="' + m.card + '"]'));
        else { const k = m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k; const t = $('#bd .tile[data-k="' + k + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]')); if (t) hscrollTo(t); }
      }
      pvRects(); _af(m, a, done);
    };
    const wait = UI.pvCityAt ? Math.max(0, 1100 - (Date.now() - UI.pvCityAt)) : 0;
    if (wait) setTimeout(go, wait); else go();
  };
  const _pt = promptText;
  promptText = function () { return String(_pt()).replace('tap a glowing spot.', 'place a worker.').replace('play a card, Prepare or Pass.', 'build, Prepare or Pass.'); };
  document.addEventListener('click', e => {
    if (UI.pvDragEnd && Date.now() - UI.pvDragEnd < 450) { e.stopPropagation(); e.preventDefault(); return; }
    const t = e.target.closest && e.target.closest('[data-a="pvtab"]'); if (t) { e.stopPropagation(); pvSetTab(t.dataset.v); snd('click', { vol: .4 }); }
    // a board tap while a message card is up (or before the game starts) still answers: a small 'not now' shake
    const bt = e.target.closest && e.target.closest('#bd.pv [data-a="t"]'); if (bt && (!G || UI.cards.length || !UI.started)) shake(bt);
  }, true);
  // ---- drag: a worker meeple onto a place (or a rival's open place), a hand card up into the city
  (function () {
    let d = null;
    const under = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.closest('#bd .pv-panel [data-a="t"]'); };
    const clear = () => { document.querySelectorAll('#bd .pv-over').forEach(e => e.classList.remove('pv-over')); };
    document.addEventListener('pointerdown', e => {
      if (!PV_ON || (e.button != null && e.button > 0)) return;
      const src = e.target.closest && e.target.closest('#bd.pv .pv-meeple.can, #bd.pv .hc');
      if (!src || UI.animBusy || UI.cards.length || !G || G.phase === 'over') return;
      d = { src, x0: e.clientX, y0: e.clientY, on: false, kind: src.classList.contains('hc') ? 'card' : 'worker', pid: e.pointerId };
    }, true);
    document.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.pid) return;
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
      if (!d.on) {
        if (Math.hypot(dx, dy) < 10) return;
        if (d.kind === 'card' && dy > -4) { d = null; return; }
        d.on = true; UI.lp = false;
        const r = d.src.getBoundingClientRect(); d.ox = d.x0 - r.left; d.oy = d.y0 - r.top;
        const g = d.src.cloneNode(true); g.className = 'pv-ghost ' + d.kind; g.removeAttribute('data-a'); g.style.cssText = `width:${r.width}px;height:${r.height}px`; document.body.appendChild(g); d.g = g;
        d.src.classList.add('pv-lifted');
        if (d.kind === 'card') { if (pvTall()) pvSetTab('city', true); $('#bd').classList.add('pv-dragcard'); }
        else { if (pvTall() && UI.pvTab === 'meadow') pvSetTab('places', true); $('#bd').classList.add('pv-dragw'); }
      }
      if (d.g) d.g.style.transform = `translate(${e.clientX - d.ox}px,${e.clientY - d.oy}px) rotate(${d.kind === 'card' ? Math.max(-12, Math.min(12, dx / 12)) : 0}deg) scale(1.08)`;
      clear();
      if (d.kind === 'worker') { const t = under(e.clientX, e.clientY); if (t) t.classList.add('pv-over'); }
      else { const hs = $('#bd .strip.hand'), top = hs ? hs.getBoundingClientRect().top : innerHeight; $('#bd').classList.toggle('pv-armed', e.clientY < top - 10); }
      e.preventDefault();
    }, { passive: false });
    const end = (e, cancel) => {
      if (!d || (e && e.pointerId !== d.pid)) return; const dd = d; d = null;
      if (!dd.on) return;
      UI.pvDragEnd = Date.now(); clear(); const bd = $('#bd'); bd.classList.remove('pv-dragcard', 'pv-dragw', 'pv-armed');
      const x = e ? e.clientX : 0, y = e ? e.clientY : 0; let ok = false, tg = null, el = null;
      if (!cancel && dd.kind === 'worker') { el = under(x, y); tg = el && el.dataset.t; ok = !!tg && /^(w:|d:|q:)/.test(tg); }
      if (!cancel && dd.kind === 'card') { const hs = $('#bd .strip.hand'), top = hs ? hs.getBoundingClientRect().top : innerHeight; el = dd.src; tg = el.dataset.t; ok = y < top - 10 && !!tg; }
      const br = $('#board').getBoundingClientRect(), at = { x: x - br.left - 20, y: y - br.top - 20, w: 40, h: 40 };
      if (dd.g) dd.g.remove(); dd.src.classList.remove('pv-lifted');
      if (ok && !/^x:/.test(tg)) {
        PV_FEEL.tick(16);
        if (dd.kind === 'worker') UI.pvDropAt = at; else { const r = frameRect(dd.src); if (r) dd.src.style.transform = `translate(${at.x + 20 - (r.x + r.w / 2)}px,${at.y + 20 - (r.y + r.h / 2)}px)`; }
        onTarget(tg, el);
      } else if (ok || (el && tg && /^x:/.test(tg))) { onTarget(tg, el); if (pvTall() && dd.kind === 'card') pvSetTab(UI.pvMine && availW(G.players[Math.max(0, viewSeat())]) ? 'places' : 'meadow', true); }
      else if (pvTall() && dd.kind === 'card') render();
    };
    document.addEventListener('pointerup', e => end(e, false), true);
    document.addEventListener('pointercancel', e => end(e, true), true);
  })();
  // a tap on a place or card I can use: a short tick, like a drop
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#bd.pv .glow[data-a="t"]'); if (t) PV_FEEL.tick(10); });
}
