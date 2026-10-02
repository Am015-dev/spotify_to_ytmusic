// ===================== part 5: game flow (new game, turn driver, AI, one-card-at-a-time queue, save/load) =====================
const SAVEKEY = 'hb_save1';
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(UI.tt); UI.tt = setTimeout(() => e.classList.remove('on'), 2600); }
function setSeed(n) { UI.seed = n >>> 0; }
function setAiSeed(n) { UI.aiSeed = n; }
const DEF = { np: 2, level: 'normal', solo: 1 };
function newGame(mode, o) {
  mode = mode || 'vs'; o = Object.assign({}, UI.opt || DEF, o || {});
  const cfg = { mode, np: o.np || 2, level: o.level || 'normal', solo: o.solo || 1, names: o.names };
  let players, solo = null;
  if (mode === 'solo') { players = [{ name: 'You', ai: null }]; solo = { difficulty: cfg.solo }; }
  else if (mode === 'guided') { players = [{ name: 'You', ai: null }, { name: PNAMES[0], ai: 'easy' }]; }
  else if (mode === 'hot') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: (cfg.names && cfg.names[i]) || 'Player ' + (i + 1), ai: null }); }
  else if (mode === 'net') { players = o.players; }
  else if (mode === 'ai') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: PNAMES[i], ai: cfg.level }); if (cfg.np < 2) players.push({ name: PNAMES[1], ai: cfg.level }); }
  else { players = [{ name: 'You', ai: null }]; for (let i = 1; i < cfg.np; i++) players.push({ name: PNAMES[i - 1], ai: (o.levels && o.levels[i - 1]) || cfg.level }); }
  G = HB.newGame({ players, solo, seed: UI.seed != null ? UI.seed : undefined });
  UI.seed = null;
  UI.mode = mode; UI.cfg = cfg; UI.cards = []; UI.after = []; UI.rec = null; UI.recKey = ''; UI.pop = null; UI.over = null; UI.overShown = false; UI.lastAi = ''; UI.started = true; UI.focus = 0;
  UI.holder = hotSeat() ? -1 : -1;
  UI.coach = { level: UI.coach && UI.coach.level || 'full', seen: {} };
  if (mode !== 'guided') UI.coachOn = false; else UI.coachOn = true;
  const st = $('#start'); if (st) st.hidden = true;
  closePop(); try { GX.close(); } catch (e) { }
  render(); schedule();
  return G;
}
function render() {
  if (!G || !UI.started) return;
  try { if (window.PerfHUD) PerfHUD.wake(); } catch (e) { }
  renderBoard(); renderDock(); renderQ(); renderCard(); placePop(); markSel(); renderDrawers();
  if (NET.on) netRenderHook();
}
function markSel() {
  $$('.sel').forEach(x => x.classList.remove('sel')); const p = UI.pop; if (!p) return;
  let e = null;
  if (p.kind === 'tile') e = $(`.tile[data-k="${p.k}"][data-i="${p.i}"]`);
  else if (p.kind === 'card' && p.src === 'meadow') e = $$('.mc').find(x => G.meadow[+x.dataset.i] === p.id);
  else if (p.kind === 'card') e = $(`.sc[data-id="${p.id}"]`);
  if (e) e.classList.add('sel');
}
// ---- one-card-at-a-time queue
function pushCard(c) { UI.cards.push(c); closePop(); render(); }
function renderCard() {
  const pc = $('#pc');
  if (!UI.cards.length) { if (!(G && G.q && !G.players[G.q.who].ai && G.q.who === viewSeat() && G.phase !== 'over')) { pc.hidden = true; pc.innerHTML = ''; pc.removeAttribute('data-card'); } return; }
  const c = UI.cards[0]; pc.hidden = false; pc.innerHTML = ''; pc.setAttribute('data-card', c.kind); pc.removeAttribute('data-kind');
  pc.appendChild(h('div.ph-head', h('div.ph-t', h('b', c.title), c.sub ? h('span', c.sub) : null)));
  const body = h('div.ph-body'); const b = typeof c.body === 'function' ? c.body() : c.body; add(body, b);
  const btns = h('div.cbtns');
  (c.buttons || [{ label: 'Continue', a: 'cont' }]).forEach(x => btns.appendChild(h('button.btn.go' + (x.cls ? '.' + x.cls : ''), Object.assign({ 'data-a': x.a, type: 'button' }, x.at || {}), x.label)));
  body.appendChild(btns); pc.appendChild(body);
}
function nextCard() { const c = UI.cards.shift(); if (c && c.onDone) c.onDone(); render(); schedule(); }
function takeDevice() { const c = UI.cards.shift(); UI.holder = c && c.seat != null ? c.seat : HB.actor(G); render(); schedule(); }
// ---- driver
function schedule() {
  clearTimeout(UI.tm); clearTimeout(UI.tr); UI.tm = 0;
  if (!G || !UI.started || (UI.cards.length && !NET.on)) return;
  if (G.phase === 'over') { if (!UI.overShown) { UI.overShown = true; queueOver(); const w = G.over; snd(G.grim ? (w.win ? 'fanfare' : 'lose') : 'fanfare', { duck: true }); sndMusic(); } return; }
  const a = HB.actor(G), p = G.players[a], hs = humans();
  if (UI.after.length && hs.length && !(G.q && !G.players[G.q.who].ai)) { if (flushAfter()) return; }
  if (p.ai) { if (!isClient()) UI.tm = setTimeout(aiStep, ANIM ? AIDELAY : 0); return; }
  if (hotSeat() && UI.holder !== a) {
    UI.holder = -1; closePop(); render();
    pushCard({ kind: 'pass', seat: a, title: 'Pass the device to ' + p.name, sub: 'Hidden information', body: h('p', p.name + ', take the device. Nobody else should look at the screen. Your hand and resources appear when you tap the button.'), buttons: [{ label: "I am " + p.name, a: 'take' }] });
    return;
  }
  if (UI.coachOn && coachCheck()) return;
  if (UI.turnSnd !== G.turn + ':' + a && (!NET.on || a === viewSeat())) { UI.turnSnd = G.turn + ':' + a; snd('turn', { vol: .6 }); }
  if (!UI.noRec) UI.tr = setTimeout(() => { if (!G || G.phase === 'over') return; const had = UI.rec; computeRec(); if (UI.rec !== had) { renderBoard(); renderDock(); if (G.q) renderQ(); markSel(); } }, 40);
}
function aiStep() {
  UI.tm = 0; if (isClient() || !G || G.phase === 'over' || (UI.cards.length && !NET.on)) return;
  const a = HB.actor(G); if (a < 0) return; const p = G.players[a]; if (!p.ai) { schedule(); return; }
  const n0 = G.logN; let m;
  try { m = HB.AI.choose(G, a); } catch (e) { m = HB.moves(G, a)[0]; console.error('AI error', e); }
  const pre = sndPre();
  let r = HB.apply(G, m);
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { const ms = HB.moves(G, a); r = HB.apply(G, ms[0]); }
  const ls = logSince(n0); UI.lastAi = ls.length ? ls[0].replace(/^[^ ]+ /, '') : '';
  afterMove();
}
function afterMove() { save(); render(); sndMusic(); schedule(); if (NET.on) netPush(); }
function act(m) {
  if (!G || !m) return; const a = HB.actor(G);
  if (isClient()) { netAct(m); return; }
  if (NET.on && a !== NET.mySeat) return;
  const n0 = G.logN;
  if (m.type === 'prepare' && !NET.on) UI.after.push({ kind: 'season', seat: a, from: n0 });
  const pre = sndPre();
  const r = HB.apply(G, m);
  closePop(); UI.rec = null;
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { snd('error'); UI.after.pop(); toast(r.error || 'That move is not allowed.'); render(); return; }
  UI.lastAi = ''; afterMove();
}
function choose(i) { const a = HB.actor(G); const m = movesFor(a).find(x => x.type === 'choose' && x.i === i); if (m) act(m); }
function flushAfter() {
  const e = UI.after.shift(); if (!e) return false;
  const lines = G.log.filter(x => x.i > e.from).map(x => x.t).slice(-14);
  const p = G.players[e.seat];
  const s = p.season;
  pushCard({ kind: 'season', title: SEASN[s] + ' has come', sub: p.name + ' prepared for ' + SEASN[s], body: () => h('div', h('div.seasonrow', HBKit.season(SEAS[s], 56)), h('ul.need', lines.map(t => h('li', t)))), });
  return true;
}
// ---- end of game: one card per player, then the result
function queueOver() {
  const ov = G.over; if (!ov) return;
  const rows = (sc, name, s) => {
    const l = [['Printed card points', sc.cards], ['Point tokens', sc.tokens], ['Prosperity bonuses', sc.bonus], ['Events', sc.events], ['The Long Road', sc.journey]];
    const t = h('div.score');
    l.forEach(([k, v]) => t.appendChild(h('div.kv', h('span', k), h('b', v))));
    if (sc.detail && sc.detail.length) t.appendChild(h('p.sm', 'Bonuses: ' + sc.detail.map(d => cname(d.card) + ' +' + d.bonus).join(', ')));
    t.appendChild(h('div.kv.tot', h('span', 'Total'), h('b', sc.total)));
    return t;
  };
  G.players.forEach((p, s) => UI.cards.push({ kind: 'over-score', title: 'Final score: ' + p.name, sub: p.ai ? 'Computer player' : 'Player', body: () => h('div', h('div.seasonrow', pawn(s, 40)), rows(ov.scores[s], p.name, s), h('p.sm', p.workers + ' workers, ' + HB.cityCount(G, s) + ' cards in the city, ' + ov.scores[s].left + ' resources left.')) }));
  if (G.grim) UI.cards.push({ kind: 'over-score', title: 'Final score: ' + D.soloName, sub: 'Your solo rival', body: () => { const g = ov.grim, t = h('div.score'); [['Cards', g.cardPts], ['Events', g.basic + g.special], ['The Long Road', g.journey], ['Point tokens', g.tokens]].forEach(([k, v]) => t.appendChild(h('div.kv', h('span', k), h('b', v)))); t.appendChild(h('div.kv.tot', h('span', 'Total'), h('b', g.total))); return t; } });
  const order = G.players.map((p, i) => i).sort((a, b) => ov.scores[b].total - ov.scores[a].total);
  UI.cards.push({
    kind: 'over', title: G.grim ? (ov.win ? 'You beat ' + D.soloName + '!' : D.soloName + ' wins this time') : (ov.tie ? 'A tie at the top' : G.players[ov.winner].name + ' wins!'), sub: 'The game is over',
    body: () => { const t = h('div.score'); order.forEach((s, k) => t.appendChild(h('div.kv' + (k === 0 && !G.grim ? '.tot' : ''), h('span', (k + 1) + '. ', pawn(s, 16), ' ' + G.players[s].name), h('b', ov.scores[s].total + ' pts')))); if (G.grim) t.appendChild(h('div.kv', h('span', D.soloName), h('b', ov.grim.total + ' pts'))); if (ov.tie) t.appendChild(h('p.sm', 'Tie-breaks (events, then leftover resources) could not separate them.')); return t; },
    buttons: NET.on ? netOverButtons() : [{ label: 'Play again', a: 'again' }, { label: 'Look at the board', a: 'cont', cls: 'alt' }, { label: 'Main menu', a: 'menu', cls: 'alt' }]
  });
  clearSave(); render();
}
// ---- save / load
function save() { try { if (!G || G.phase === 'over' || NET.on) return; localStorage.setItem(SAVEKEY, JSON.stringify({ G, mode: UI.mode, cfg: UI.cfg, coach: UI.coach, coachOn: UI.coachOn, holder: -1 })); } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVEKEY); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem(SAVEKEY); } catch (e) { return false; } }
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVEKEY)); if (!s || !s.G) return false;
    G = s.G; UI.mode = s.mode; UI.cfg = s.cfg; UI.coach = s.coach || { level: 'full', seen: {} }; UI.coachOn = !!s.coachOn;
    UI.cards = []; UI.after = []; UI.rec = null; UI.recKey = ''; UI.pop = null; UI.overShown = false; UI.started = true; UI.holder = -1; UI.lastAi = ''; UI.focus = 0;
    const st = $('#start'); if (st) st.hidden = true; try { GX.close(); } catch (e) { }
    render(); schedule(); return true;
  } catch (e) { return false; }
}
