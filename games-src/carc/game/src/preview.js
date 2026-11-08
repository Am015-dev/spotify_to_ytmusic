// ---------- Addendum 5: the player must SEE how they score ----------
// 1) a live preview of the points a placement adds (badge on every glowing square, full line + highlighted feature on hold/hover),
// 2) points on each follower spot, 3) an always-visible score breakdown (roads, towns, priories, fields: you vs rivals),
// 4) one line after every turn rating the move good / okay / poor against the computer's best move.
// All numbers come from the engine's own probe() (what a placement would do, nothing changes) and featPoints().
const PV_TY = { C: 'town', R: 'road', M: 'priory', F: 'field' };
function pvMe() { return G.pl.findIndex(p => p.human); }
function pvHolders(figs) { const s = strength(figs), top = Math.max(0, ...Object.values(s)); return top > 0 ? Object.keys(s).filter(k => s[k] === top).map(Number) : []; }
function pvTilesOfRoots(roots, k) { const t = new Set([k]); for (const r of roots) { const F = G.fd[r]; if (F && F.tiles) for (const q of F.tiles) t.add(q); else if (F && F.ty === 'M') t.add(key(F.x, F.y)); } return [...t]; }
// what placing the current tile at x,y with rotation r would do now. Returns {badge, line, hl:[tile keys], pts}
function prevCalc(x, y, r) {
  const ck = G.turn + ':' + x + ',' + y + ',' + r; UI.pvc = UI.pvc || {}; if (UI.pvc[ck]) return UI.pvc[ck];
  const me = pvMe(), k = key(x, y), pr = probe(G.cur.t, r, x, y), items = [];
  for (const g of pr.groups) {
    if (g.ty !== 'C' && g.ty !== 'R') continue;
    const name = PV_TY[g.ty], hold = pvHolders(g.figs), mine = hold.includes(me), rv = hold.filter(i => i !== me);
    if (g.done) { const pts = g.ty === 'C' ? (g.cat ? 3 : 2) * (g.tiles + g.pen) : (g.inn ? 2 : 1) * g.tiles; if (hold.length) items.push({ k: 'close', name, pts, mine, rv, hl: pvTilesOfRoots(g.roots, k), n: g.tiles }); else items.push({ k: 'closefree', name, pts, hl: pvTilesOfRoots(g.roots, k), n: g.tiles }); }
    else if (hold.length && g.roots.length) { const pot = g.ty === 'C' ? (g.cat ? 3 : 2) * (g.tiles + g.pen) : (g.inn ? 2 : 1) * g.tiles; items.push({ k: mine ? 'grow' : 'feed', name, pts: pot, mine, rv, hl: pvTilesOfRoots(g.roots, k), n: g.tiles }); }
  }
  for (const rt of pr.mons) { const F = G.fd[rt]; const hold = pvHolders(figsIn(rt)); if (hold.length) items.push({ k: 'close', name: 'priory', pts: 9, mine: hold.includes(me), rv: hold.filter(i => i !== me), hl: [key(F.x, F.y), k], n: 9 }); }
  if (pr.groups.some(g => g.ty === 'M' && g.done)) items.push({ k: 'closefree', name: 'priory', pts: 9, hl: [k], n: 9 });
  const nm = i => P(i).human ? 'You' : P(i).nm;
  let best = null, rank = it => it.k === 'close' && it.mine ? 100 + it.pts : it.k === 'close' ? 50 + it.pts : it.k === 'closefree' ? 20 + it.pts : it.k === 'grow' ? 10 + it.pts : 1;
  for (const it of items) if (!best || rank(it) > rank(best)) best = it;
  let out = { badge: '', line: 'Nothing scores here yet.', hl: [k], pts: 0 };
  if (best) {
    const hl = best.hl;
    if (best.k === 'close' && best.mine) out = { badge: '+' + best.pts, line: 'Finishes your ' + best.name + ': +' + best.pts + ' for you.', hl, pts: best.pts, kind: 'good' };
    else if (best.k === 'close') out = { badge: nm(best.rv[0]) + ' +' + best.pts, line: 'Finishes ' + nm(best.rv[0]) + '’s ' + best.name + ': +' + best.pts + ' for them.', hl, pts: -best.pts, kind: 'bad' };
    else if (best.k === 'closefree') out = { badge: 'closes', line: 'Closes a ' + best.name + ' nobody holds: no points.', hl, pts: 0 };
    else if (best.k === 'grow') out = { badge: 'grows', line: 'Grows your ' + best.name + ' to ' + best.n + ' tiles: +' + best.pts + ' when finished.', hl, pts: 0, kind: 'good' };
    else out = { badge: 'helps them', line: 'Grows ' + nm(best.rv[0]) + '’s ' + best.name + ' to ' + best.n + ' tiles.', hl, pts: 0, kind: 'bad' };
  }
  UI.pvc[ck] = out; return out;
}
// the plain label for a follower spot: what it is and what it is worth
function prevFig(l) {
  const T = G.tiles[G.cur.k], id = find(T.s0 + +l), F = G.fd[id]; if (!F) return '';
  const nm = PV_TY[F.ty];
  if (F.ty === 'F') return 'farmer';
  if (F.ty === 'M') return 'priory 9';
  const done = F.oe && F.oe.length === 0;
  if (done) return nm + ' +' + featPoints(F, true) + ' now';
  return nm + ' +' + featPoints(F, true);
}
// highlight a feature's tiles while a spot is held or hovered
function pvHighlight(keys) { for (const e of document.querySelectorAll('#world .pvhl')) e.classList.remove('pvhl'); if (keys) for (const k of keys) { const e = UI.tl[k]; if (e) e.classList.add('pvhl'); } }
function pvShow(g, x, y) {
  try { const pv = prevCalc(x, y, UI.rot); UI.prev = { t: pv.line }; pvHighlight(pv.hl); if (G && G.cur) renderStatus(); } catch (e) { }
}
function pvRank(pv) { if (!pv || !pv.badge) return 0; return pv.kind === 'good' && pv.pts > 0 ? 100 + pv.pts : pv.kind === 'bad' && pv.pts < 0 ? 80 - pv.pts : pv.badge === 'grows' ? 30 : pv.badge === 'feeds' ? 20 : 10; }
function pvHide() { UI.prev = null; let hl = null; if (UI.sel) try { hl = prevCalc(UI.sel.x, UI.sel.y, UI.sel.r).hl; } catch (e) { } pvHighlight(hl); if (G && G.cur) try { renderStatus(); } catch (e) { } }
// ---------- always-visible score sheet ----------
function renderSheet() {   // PLAY: one score line (you vs rivals); tap it for where the points came from. HINTS adds the move rating.
  const el = document.getElementById('sheet'); if (!el || !G) return;
  const cat = [['road', 'Road'], ['town', 'Town'], ['priory', 'Priory'], ['field', 'Field']];
  const tot = '<span class="stot">' + G.pl.map(p => '<span class="sc"><i>' + esc(seatName(p)) + '</i><b style="--c:' + PCOL[p.i] + '">' + p.score + '</b></span>').join('<u>–</u>') + '</span>';
  const rt = hintsOn() ? UI.rating : null, w = rt ? rt.word.toLowerCase() : '';
  const chip = '<span class="schip ' + w + '">' + (rt ? rt.word : 'Why') + '<em aria-hidden="true">' + (UI.sheetOpen ? '▴' : '▾') + '</em></span>';
  const bd = cat.map(([k, nm]) => '<span class="sc"><i>' + nm + '</i>' + G.pl.map(p => '<b style="--c:' + PCOL[p.i] + '">' + (p.sc[k] + p.end[k]) + '</b>').join('<u>–</u>') + '</span>').join('');
  const fl = '<span class="sc"><img class="sico" src="media/icon-follower.webp" alt=""><i>Followers left</i>' + G.pl.map(p => '<b style="--c:' + PCOL[p.i] + '">' + p.sup.f + '</b>').join('<u>–</u>') + '</span><span class="sc"><img class="sico" src="media/icon-tile.webp" alt=""><i>Tiles left</i><b>' + tilesLeft() + '</b></span>';
  const head = '<div class="shead"><img class="sico" src="media/icon-score.webp" alt=""><span>' + G.pl.map(p => esc(seatName(p)) + ' <b style="--c:' + PCOL[p.i] + '">' + p.score + '</b>').join(' <u>–</u> ') + '</span></div>';
  const drawer = UI.sheetOpen ? '<div class="srate ' + w + '">' + head + '<div class="srow">' + bd + fl + '</div>' + (rt ? '<div><b>' + rt.word + ':</b> ' + esc(rt.text) + '</div>' : '') + '</div>' : '';
  el.innerHTML = '<button type="button" class="sbtn" aria-expanded="' + !!UI.sheetOpen + '" aria-label="Scores; tap for where the points came from">' + tot + chip + '</button>' + drawer;
  if (!el._seatTap) { el._seatTap = 1; const st = document.getElementById('seats'); if (st) { st.setAttribute('role', 'button'); st.tabIndex = 0; st.setAttribute('aria-label', 'Scores; tap for where the points came from'); st.addEventListener('click', () => el.firstChild && el.firstChild.click()); } }
  el.firstChild.onclick = () => { UI.sheetOpen = !UI.sheetOpen; clearTimeout(UI.sheetT); if (UI.sheetOpen) UI.sheetT = setTimeout(() => { UI.sheetOpen = false; renderSheet(); }, 6000); renderSheet(); };
}
// ---------- rating the move ----------
function ratingBegin(x, y, r) {   // just before the human places: the computer's best plan and the value of this placement
  try {
    const s = sideToAct(), t = G.cur.t, virt = { x, y, t, r }, best = aiPlan(s, 'normal'), pr = probe(t, r, x, y), pv = placeValue(pr, s, 'normal', virt);
    UI.mine = { s, best, pr, pv, virt, fig: 0, turn: G.turn };
  } catch (e) { UI.mine = null; }
}
function ratingFig(m) {   // the follower choice (m = {k,l}) or null for skip
  const q = UI.mine; if (!q) return; if (!m) { q.fig = 0; return; }
  try { const op = figOptionsFromProbe(q.pr, q.s).find(o => o.k === m.k && o.l === m.l); q.fig = op ? figValue(op.k, descGroup(op.g, q.pr, 'normal', q.virt), op.g.figs, q.s, 'normal') : 0; } catch (e) { q.fig = 0; }
}
function ratingEnd() {
  const q = UI.mine; UI.mine = null; if (!q) return;
  const mine = q.pv.v + q.fig, diff = q.best.v - mine;
  let word = diff <= 0.6 ? 'Good' : diff <= 2.6 ? 'Okay' : 'Poor', text;
  if (word === 'Good') text = 'the best score available.';
  else { const w = (q.best.why || [])[0]; const nm = w && w.ty ? PV_TY[w.ty] : '';
    text = w ? (w.k === 'close' ? 'finishing the ' + nm + ' was better.' : w.k === 'grow' ? 'growing the ' + nm + ' was better.' : w.k === 'priory' ? 'the priory was a better spot.' : 'a better spot was open.') : 'a stronger spot was open.'; }
  UI.rating = { word, text, turn: q.turn }; renderSheet();
  if (UI.coach && typeof coachSay === 'function') coachSay('rate_' + word.toLowerCase());
}
