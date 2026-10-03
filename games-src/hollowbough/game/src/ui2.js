// ===================== part 2: the board (shared Evertree area): layout + render =====================
const FIC = {
  forest_berry_thicket: [['berry', 2], ['card', 1]], forest_foragers_crossing: [['any', 2]], forest_rummage_hollow: [['discard', '*'], ['card', '2ea']],
  forest_echoing_meadow: [['copy', ''], ['card', 1]], forest_quarry_burrow: [['pebble', 1], ['card', 3]], forest_mixed_glade: [['twig', 1], ['resin', 1], ['berry', 1]],
  forest_bumper_bramble: [['berry', 3]], forest_sapwell_copse: [['resin', 2], ['twig', 1]], forest_postbag_clearing: [['card', 2], ['any', 1]],
  forest_barter_stump: [['discard', '3'], ['any', '']], forest_meadow_bazaar: [['meadow', '2']]
};
const EVT = { production: 'production', destination: 'destination', governance: 'governance', traveler: 'traveler' };
function items(list, px) {
  const w = h('div.its' + (list.length > 2 ? '.its3' : ''));
  for (const [k, n] of list) w.appendChild(h('span.it', ic(k, px), (n !== '' && n !== 1) ? h('b', (/^\d+$/.test(String(n)) ? '×' : '') + n) : null));
  return w;
}
function basicItems(i) { const b = D.basic[i], l = []; for (const r of RESK) if (b.gain[r]) l.push([r, b.gain[r]]); if (b.draw) l.push(['card', b.draw]); if (b.pts) l.push(['point', b.pts]); return l; }
// ---- layout: returns rects for every board item
function boardLayout(W, H) {
  const nf = G.forest.length, g = 2, tall = W < H * 1.0 || (document.documentElement.classList.contains('ph-p') && H >= 270);
  const R = { W, H, tall, tiles: [], meadow: [], g };
  const tl = (kind, i, x, y, w, hh) => R.tiles.push({ kind, i, x, y, w, h: hh });
  const extra = [['haven', 0], ['journey', 0], ['deck', 0], ['tree', 0]];
  const rowB = []; for (let i = 0; i < nf; i++) rowB.push(['forest', i]); extra.forEach(e => rowB.push(e)); if (nf === 3) rowB.push(['disc', 0]);
  const evs = []; G.bev.forEach((e, i) => evs.push(['bev', i])); G.sev.forEach((e, i) => evs.push(['sev', i]));
  if (tall) {
    const gx = 6, tw = (W - 7 * 1) / 8; let tr = 46;
    let cw = Math.min((W - 3 * gx) / 4, 130), avail = H - 3 * tr - 3 * g - 4;
    let ch = Math.min(avail / 2 - 3, cw * 1.406); cw = ch / 1.406;
    const left = H - (3 * tr + 3 * g + 2 * ch + 4 + 3); if (left > 0) tr += Math.min(10, left / 3);
    let y = 0;
    for (let i = 0; i < 8; i++) tl('basic', i, i * (tw + 1), y, tw, tr); y += tr + g;
    rowB.forEach((e, i) => tl(e[0], e[1], i * (tw + 1), y, tw, tr)); y += tr + g;
    evs.forEach((e, i) => tl(e[0], e[1], i * (tw + 1), y, tw, tr)); y += tr + g + 2;
    const rest = H - y, tot = 2 * ch + 4; const y0 = y + Math.max(0, (rest - tot) / 2), x0 = (W - (4 * cw + 3 * gx)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: x0 + (s % 4) * (cw + gx), y: y0 + Math.floor(s / 4) * (ch + 4), w: cw, h: ch });
  } else {
    const gp = Math.max(6, Math.round(W * .012)); const Lw = Math.round(W * .40), tw = (Lw - 3 * g) / 4;
    const th = Math.min(tw * 1.3, (H - 3 * g - 8) / 4);
    for (let i = 0; i < 8; i++) tl('basic', i, (i % 4) * (tw + g), Math.floor(i / 4) * (th + g), tw, th);
    const y2 = 2 * (th + g) + 6;
    rowB.forEach((e, i) => tl(e[0], e[1], (i % 4) * (tw + g), y2 + Math.floor(i / 4) * (th + g), tw, th));
    const x0 = Lw + gp * 2, Rw = W - x0; let cw = Math.min((Rw - 3 * g * 2) / 4, 170);
    const evh = Math.max(44, Math.min(th * .9, 70));
    let ch = cw * 1.406; const maxch = (H - 2 * evh - 4 * g - 10) / 2; if (ch > maxch) { ch = maxch; cw = ch / 1.406; }
    const gm = Math.min(g * 3, (Rw - 4 * cw) / 3);
    const mx = x0 + (Rw - (4 * cw + 3 * gm)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: Math.floor(s / 4) * (ch + g * 2), w: cw, h: ch });
    const ey = 2 * ch + g * 4 + 8, etw = (Rw - 3 * g) / 4;
    evs.forEach((e, i) => tl(e[0], e[1], x0 + (i % 4) * (etw + g), ey + Math.floor(i / 4) * (evh + g), etw, evh));
  }
  if (!tall) { let mx = 0; R.tiles.forEach(t => mx = Math.max(mx, t.y + t.h)); R.meadow.forEach(t => mx = Math.max(mx, t.y + t.h)); const off = Math.max(0, Math.min(80, (H - mx) / 2)); if (off > 1) { R.tiles.forEach(t => t.y += off); R.meadow.forEach(t => t.y += off); } }
  return R;
}
// who stands where
function placements() {
  const out = [];
  G.players.forEach((p, s) => p.dep.forEach(pl => out.push({ s, pl })));
  if (G.grim) { const gr = G.grim; if (gr.bi >= 0) out.push({ s: 'G', pl: { k: 'basic', i: gr.bi } }); if (gr.fi >= 0) out.push({ s: 'G', pl: { k: 'forest', i: gr.fi } }); if (gr.ji >= 0) out.push({ s: 'G', pl: { k: 'journey', i: gr.ji } }); }
  return out;
}
function workersAt(kind, i) {
  const o = [];
  for (const { s, pl } of placements()) {
    if (kind === 'haven' && pl.k === 'haven') o.push(s);
    else if ((kind === 'basic' || kind === 'forest') && pl.k === kind && pl.i === i) o.push(s);
    else if (kind === 'journey' && pl.k === 'journey') o.push(s);
  }
  return o;
}
function wmoveKey(m) { return m.k + ':' + (m.k === 'dest' ? m.c : m.k === 'event' ? m.e + m.i : m.i == null ? '' : m.i); }
// legal worker moves of the human whose turn it is
function myMoves() {
  if (!G || G.phase === 'over') return [];
  const a = HB.actor(G), p = G.players[a];
  if (!p || p.ai || a !== viewSeat() || G.q) return [];
  return movesFor(a);
}
function tileInfo(kind, i) {
  switch (kind) {
    case 'basic': { const b = D.basic[i]; return { name: b.name, text: b.text, shared: b.shared, key: 'basic:' + i }; }
    case 'forest': { const f = D.forest[G.forest[i]]; return { name: f.name, text: f.text, shared: false, key: 'forest:' + i }; }
    case 'haven': return { name: D.haven.name, text: D.haven.text, shared: true, key: 'haven:' };
    case 'journey': return { name: D.journeyName, text: 'Autumn only. Discard 5, 4, 3 or 2 cards from your hand; that worker stays for the rest of the game and scores the same number of points.', shared: false, key: 'journey:' };
    case 'bev': { const e = D.basicEvents[G.bev[i].k]; return { name: e.name, text: e.text, key: 'event:b' + i }; }
    case 'sev': { const e = D.specialEvents[G.sev[i].k]; return { name: e.name, text: e.text, key: 'event:s' + i }; }
  }
  return {};
}
function tileFace(t, big) {
  const px = big ? 28 : 20; let f = h('div.face');
  switch (t.kind) {
    case 'basic': f.appendChild(items(basicItems(t.i), px)); break;
    case 'forest': f.appendChild(items(FIC[D.forest[G.forest[t.i]].key] || [['any', '']], px)); break;
    case 'haven': f.appendChild(items([['haven', ''], ['any', '']], px)); break;
    case 'journey': f.appendChild(items([['road', ''], ['point', '2-5']], px)); break;
    case 'deck': f.appendChild(h('div.its', h('span.it', ic('deck', px), h('b', G.deck.length)))); break;
    case 'disc': f.appendChild(h('div.its', h('span.it', ic('discard', px), h('b', G.discard.length)))); break;
    case 'tree': { const s = G.players[Math.max(0, viewSeat() >= 0 ? viewSeat() : (G.phase === 'over' ? 0 : HB.actor(G)))]; f.appendChild(h('div.its', h('span.it', HBKit.season(SEAS[s ? s.season : 0], px + 4)))); break; }
    case 'bev': { const e = G.bev[t.i], dd = D.basicEvents[e.k], need = Object.keys(dd.need)[0]; const col = HBKit.TYPES[need] ? HBKit.TYPES[need].c : '#888'; f.style.setProperty('--ec', col); f.appendChild(h('div.its', h('span.it', ic('flag', px), h('b', dd.pts)))); break; }
    case 'sev': { const e = G.sev[t.i], dd = D.specialEvents[e.k]; f.style.setProperty('--ec', '#7f5496'); f.appendChild(h('div.its', h('span.it', ic('star', px), dd.pts ? h('b', dd.pts) : h('b', '?')))); break; }
  }
  if (big) { const nm = t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discards' : t.kind === 'tree' ? 'Seasons' : (tileInfo(t.kind, t.i).name || ''); f.appendChild(h('div.nm', nm)); }
  return f;
}
function renderBoard() {
  const host = $('#board'), bd = $('#bd'); if (!host || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 470;
  const R = boardLayout(W, H); UI.lay = R;
  bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  bd.className = R.tall ? 'tall' : 'wide';
  const mm = myMoves(), ok = new Set(mm.filter(m => m.type === 'worker').map(wmoveKey)), mine = mm.length > 0;
  const rec = UI.rec && UI.rec.m;
  const big = !R.tall && R.tiles.some(t => t.kind === 'basic' && t.w >= 84 && t.h >= 70);
  bd.classList.toggle('big', big);
  for (const t of R.tiles) {
    const info = tileInfo(t.kind, t.i);
    const e = h('button.tile.t-' + t.kind, { 'data-a': 'tile', 'data-k': t.kind, 'data-i': t.i, type: 'button', 'aria-label': info.name || (t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discard pile' : 'Seasons') });
    e.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
    e.appendChild(tileFace(t, big));
    let legal = false;
    if (t.kind === 'basic' || t.kind === 'forest') legal = ok.has(t.kind + ':' + t.i);
    else if (t.kind === 'haven') legal = ok.has('haven:');
    else if (t.kind === 'journey') legal = [0, 1, 2, 3].some(i => ok.has('journey:' + i));
    else if (t.kind === 'bev') legal = ok.has('event:b' + t.i);
    else if (t.kind === 'sev') legal = ok.has('event:s' + t.i);
    if (mine && legal) e.classList.add('ok'); else if (mine && !/deck|disc|tree/.test(t.kind)) e.classList.add('no');
    if (rec && rec.type === 'worker' && legal && (rec.k === t.kind || (rec.k === 'event' && ((rec.e === 'b' && t.kind === 'bev' && rec.i === t.i) || (rec.e === 's' && t.kind === 'sev' && rec.i === t.i)))) && (rec.k === 'event' || rec.k === 'haven' || rec.k === 'journey' || rec.i === t.i)) e.classList.add('rec');
    // workers
    if (t.kind === 'bev' || t.kind === 'sev') {
      const ev = (t.kind === 'bev' ? G.bev : G.sev)[t.i];
      if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, 16))); }
    } else if (/basic|forest|haven|journey/.test(t.kind)) {
      const ws = workersAt(t.kind, t.i);
      if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, 16))); e.appendChild(pw); if (!info.shared && t.kind !== 'journey' && t.kind !== 'haven') e.classList.add('taken'); }
    }
    bd.appendChild(e);
  }
  const mset = new Set(mm.filter(m => m.type === 'play' && m.from === 'meadow').map(m => m.card));
  const blocked = G.grim ? G.grim.mb : [];
  for (const m of R.meadow) {
    const id = G.meadow[m.i];
    const e = h('button.mc', { 'data-a': 'mcard', 'data-i': m.i, type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    e.style.cssText = `left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px`;
    if (id >= 0) { e.appendChild(cardEl(id, Math.round(m.w))); if (mine && mset.has(id)) e.classList.add('ok'); if (rec && rec.type === 'play' && rec.from === 'meadow' && rec.card === id) e.classList.add('rec'); }
    else e.classList.add('empty');
    if (blocked.indexOf(m.i) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    bd.appendChild(e);
  }
}
