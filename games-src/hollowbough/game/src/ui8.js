// ===================== part 8: shared GX kit (settings, reference, undo, recap, results, offline) =====================
const GAME_ID = 'hollowbough';
// ---- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH = [
  { id: 'first', name: 'First city', how: 'Finish a game.', test: r => true },
  { id: 'guide', name: 'Guide graduate', how: 'Finish the guided first game.', test: r => r.mode === 'guided' },
  { id: 'win', name: 'Top of the tree', how: 'Beat the computer players.', test: r => r.won && (r.mode === 'vs' || r.mode === 'guided') },
  { id: 'hard', name: 'Sharp claws', how: 'Beat hard computer players in a 3- or 4-player game.', test: r => r.won && r.mode === 'vs' && r.level === 'hard' && r.np >= 3 },
  { id: 'grumpy', name: 'Grumbles quieted', how: 'Beat Old Grimbeard on Grumpy.', test: r => r.won && r.mode === 'solo' },
  { id: 'gruff', name: 'Beard trimmed', how: 'Beat Old Grimbeard on Gruff or Ghastly.', test: r => r.won && r.mode === 'solo' && r.level >= 2 },
  { id: 'sixty', name: 'Bustling burrow', how: 'Score 60 points or more.', test: r => r.score >= 60 },
  { id: 'full', name: 'Fifteen roofs', how: 'End a game with 15 cards in your city.', test: (r, s, x) => x.extra && x.extra.city >= 15 },
  { id: 'events', name: 'Festival goer', how: 'Claim 3 or more events in one game.', test: (r, s, x) => x.extra && x.extra.events >= 3 },
  { id: 'hot', name: 'Pass the acorn', how: 'Finish a hot-seat game.', test: r => r.mode === 'hot' }
];
// ---- settings: the same sections as every game; Hollowbough adds its own rows
function kitSettings() {
  GX.settings({
    id: 'setd', title: 'Menu',
    game: S => {
      if (NET.on) S.appendChild(GX.row('Online', [h('button.gx-sb', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.gx-sb', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room')]));
      else S.appendChild(GX.row('This game', [h('button.gx-sb', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.gx-sb', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.gx-sb', { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load')]));
      S.appendChild(GX.row('Undo', h('button.gx-sb', { 'data-a': 'undo', type: 'button', disabled: GX.undo.can() ? null : true }, 'Undo my last step'), 'Works until a card is drawn or the turn passes'));
    },
    sound: S => { S.appendChild(GX.row('Sound', GX.onoff(UI.sound !== false, v => { UI.sound = v; try { if (window.GA) { GA.setSfx(v); GA.setMusic(v); } } catch (e) { } sndMusic(); }, 'Sound and music'))); },
    help: S => {
      S.appendChild(GX.row('Read', [h('button.gx-sb', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.gx-sb', { 'data-a': 'refopen', type: 'button' }, 'Cards & places')]));
      S.appendChild(GX.row('Guide', GX.seg([['full', 'Full'], ['light', 'Light'], ['off', 'Off']], UI.coach.level, v => { UI.coach.level = v; }, 'Guide level'), 'Tips that appear one at a time'));
    },
    about: { name: 'Hollowbough', version: 'preview', text: 'An original woodland city-building game. Names, texts and pictures are our own; the pictures are drawn in code. Sounds and music are CC0 recordings (Kenney, OpenGameArt).' }
  });
}
// ---- component reference
function refPic(it, big) {
  const p = it.pic || {}, px = big ? 200 : 52;
  if (p.card != null) return cardEl(p.card, px);
  const sz = big ? 44 : 22;
  if (p.place === 'basic') return items(basicItems(p.i), sz);
  if (p.place === 'forest') return items(FIC[D.forest[p.i].key] || [['any', '']], sz);
  if (p.place === 'haven') return items([['haven', ''], ['any', '']], sz);
  if (p.place === 'journey') return items([['road', ''], ['point', '2-5']], sz);
  if (p.event) return ic(p.event === 'b' ? 'flag' : 'star', big ? 64 : 34);
  if (p.res) return ic(p.res, big ? 64 : 34);
  if (p.point) return ic('point', big ? 64 : 34);
  if (p.occ) return ic('occ', big ? 64 : 34);
  return null;
}
function refInGame(it) {
  if (!G) return true;
  const p = it.pic || {};
  if (p.card != null) { const k = cdef(p.card).key, has = id => id >= 0 && cdef(id).key === k; const v = viewSeat();
    return G.meadow.some(has) || G.players.some(pl => pl.city.some(e => has(e.id))) || (v >= 0 && G.players[v].hand.some(has)) || (G.grim && G.grim.city.some(has)); }
  if (p.place === 'forest') return G.forest.indexOf(p.i) >= 0;
  if (p.event === 's') return G.sev.some(e => e.k === p.i);
  return true;
}
function kitReference() {
  GX.reference(HB.refSections(D), { title: 'Cards & places', label: 'Cards', picture: refPic, inGame: refInGame, before: '[data-gx="rivald"]' });
}
function refCardId(id) { return 'c' + D.cards.indexOf(cdef(id)); }
// ---- undo: snapshot the JSON state before each local human step; sealed once a card is drawn, the dice/shuffle moved,
// a private pile changed or the turn passed (GX.undo.check). Off online.
function revealed(a, b) { return !a || a.deck.length !== b.deck.length || a.rng !== b.rng || a.discard.length > b.discard.length || JSON.stringify(a.limbo) !== JSON.stringify(b.limbo) || a.phase !== b.phase; }
function kitUndo() {
  GX.undo.config({
    get: () => G, owner: g => g && g.phase !== 'over' ? HB.actor(g) : null, online: () => NET.on,
    set: s => { G = s; UI.rec = null; UI.recKey = ''; UI.after = UI.after.filter(e => e.from < G.logN); closePop(); UI.lastAi = ''; save(); render(); schedule(); toast('Step undone.'); },
    onChange: () => { if (G && UI.started) renderActs(); }
  });
}
function doUndo() { if (GX.undo.undo()) snd('click'); }
// ---- "since your last turn" strip in the dock
function kitRecap() { GX.recap.attach('#dockbody', { before: true, title: 'Since your turn' }); }
function recapSeats() { GX.recap.clear(); const hs = humans(); GX.recap.seats(hs.length ? hs : [0]); }
// ---- results, statistics, achievements
function kitResult() {
  if (!G || !G.over || UI.resultDone) return; UI.resultDone = true;
  const hs = humans(); if (!hs.length) return; // watching computers: not your game
  const ov = G.over, me = NET.on ? NET.mySeat : hs.length === 1 ? hs[0] : -1;
  const seats = G.players.map((p, i) => ({ name: p.name, ai: p.ai || null, me: i === me }));
  const winner = G.grim ? (ov.win ? 0 : -1) : ov.tie ? -1 : ov.winner;
  let extra = null;
  if (me >= 0) { const evs = G.bev.filter(e => e.o === me).length + G.sev.filter(e => e.o === me).length; extra = { city: HB.cityCount(G, me), events: evs }; }
  try {
    const r = GNS.result({ game: GAME_ID, mode: UI.mode === 'net' ? 'online' : UI.mode, seats, winner, scores: ov.scores.map(s => s.total), turns: G.turn, ms: UI.t0 ? Date.now() - UI.t0 : 0,
      level: UI.mode === 'solo' ? (UI.cfg && UI.cfg.solo) : (UI.cfg && UI.cfg.level), extra });
    if (r && r.earned.length) { UI.earned = r.earned.map(a => a.name); GX.buzz([30, 60, 30]); }
  } catch (e) { }
}
// ---- boot (called from boot() in part 6)
function kitBoot() {
  kitSettings(); kitReference(); kitUndo(); kitRecap();
  GNS.achievements(GAME_ID, ACH);
  AIDELAY = GX.aiDelay(650);
  GX.onPref((k) => { if (k === 'ai' || typeof k === 'object') AIDELAY = GX.aiDelay(650); if (k === 'cb' && G && UI.started) render(); });
  GX.offline({ sw: '../sw.js', scope: '../' });
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a;
  if (a === 'undo') doUndo();
  else if (a === 'refopen') { GX.close(); GX.show('gx-refd'); }
  else if (a === 'refcard') { closePop(); GX.refOpen(refCardId(+t.dataset.id)); }
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !GX.open && GX.undo.can()) { e.preventDefault(); doUndo(); } });
