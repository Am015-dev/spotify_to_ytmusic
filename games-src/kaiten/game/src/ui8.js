// ===================== part 8: shared GX kit (settings, reference, undo window, recap, results, offline) + the guided lesson =====================
const GAME_ID = 'kaiten';
// ---- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH = [
  { id: 'first', name: 'First meal', how: 'Finish a meal.', test: r => true },
  { id: 'guide', name: 'Belt trained', how: 'Finish the guided first game.', test: r => r.mode === 'guided' },
  { id: 'win', name: 'Clean plate', how: 'Beat the computer chefs.', test: r => r.won && (r.mode === 'vs' || r.mode === 'guided') },
  { id: 'hard', name: 'Night-shift champion', how: 'Win a 4- or 5-diner meal with a hard chef at the table.', test: (r, s, x) => r.won && r.mode === 'vs' && r.np >= 4 && x.extra && x.extra.hard },
  { id: 'fifty', name: 'Full belly', how: 'Score 50 points or more.', test: r => r.score >= 50 },
  { id: 'ladder', name: 'Bun tower', how: 'Stack five Steam Buns in one round (15 points).', test: (r, s, x) => x.extra && x.extra.buns15 },
  { id: 'paste', name: 'Fire breather', how: 'Score 10 or more Fire Paste bonus points in one meal.', test: (r, s, x) => x.extra && x.extra.paste >= 10 },
  { id: 'custard', name: 'Sweet tooth', how: 'End a meal with the most Custard Cups on your own (3 or more diners).', test: (r, s, x) => x.extra && x.extra.custardTop && r.np >= 3 },
  { id: 'rounds', name: 'Top of every round', how: 'Score the most points in all three rounds of a meal.', test: (r, s, x) => x.extra && x.extra.roundsTop === 3 },
  { id: 'hot', name: 'Pass the plate', how: 'Finish a hot-seat meal.', test: r => r.mode === 'hot' }
];
// ---- settings: the same sections as every game; Kaiten adds its own rows
const HOLD = { off: 0, short: 1200, long: 2600 };
function kitSettings() {
  GX.settings({
    id: 'setd', title: 'Menu',
    game: S => {
      if (NET.on) S.appendChild(GX.row('Online', [h('button.gx-sb', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.gx-sb', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room')]));
      else S.appendChild(GX.row('This game', [h('button.gx-sb', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.gx-sb', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.gx-sb', { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load')]));
      if (!isClient()) S.appendChild(GX.row('Take back a plate', GX.seg([['off', 'Off'], ['short', 'Short'], ['long', 'Long']], UI.prefs.undo || 'short', v => { UI.prefs.undo = v; savePrefs(); }, 'Take-back window'), 'After you serve, a moment to press Undo before the covers lift'));
      S.appendChild(GX.row('Serving', GX.onoff(!!UI.prefs.tap2, v => { UI.prefs.tap2 = v; savePrefs(); if (G) render(); }, 'Tap twice to serve'), 'Tap a lifted plate again to serve it (otherwise press Serve)'));
    },
    sound: S => {
      S.appendChild(GX.row('Sound effects', GX.onoff(UI.prefs.sound !== false, v => { UI.prefs.sound = v; savePrefs(); try { if (window.GA) GA.setSfx(v); } catch (e) { } }, 'Sound effects')));
      S.appendChild(GX.row('Music', GX.onoff(UI.prefs.music !== false, v => { UI.prefs.music = v; savePrefs(); try { if (window.GA) GA.setMusic(v); } catch (e) { } sndMusic(); }, 'Music')));
    },
    help: S => {
      S.appendChild(GX.row('Read', [h('button.gx-sb', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.gx-sb', { 'data-a': 'refopen', type: 'button' }, 'Plates')]));
      if (!NET.on) S.appendChild(GX.row('Guide', GX.seg([['full', 'Full'], ['light', 'Light'], ['off', 'Off']], UI.coach.level, v => { UI.coach.level = v; UI.coach.keep = v === 'full'; }, 'Guide level'), 'Tips that appear one at a time'));
      S.appendChild(GX.row('Show +N', GX.onoff(!!UI.prefs.hint, v => { UI.prefs.hint = v; savePrefs(); if (G) render(); }, 'Show +N scores'), 'What each plate on your belt scores right now'));
    },
    graphics: S => {
      const g = gfxPref();
      S.appendChild(GX.row('Graphics', GX.seg([['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']], g, v => { setGfx(v); }, 'Graphics level'), PX.on ? (g === 'auto' ? 'Now ' + PX.q : '') : 'Simple view (this browser has no painted table)'));
    },
    about: { name: 'Kaiten Kitchen', version: 'preview', text: 'An original conveyor-belt card game. Names, card text and paintings are our own. Music and sounds are CC0 recordings (Pro Sensory, LEGIT Audio and Kenney on OpenGameArt and kenney.nl). Online play uses Trystero (MIT); the painted table uses PixiJS (MIT).' }
  });
}
// ---- component reference
function refPic(it, big) { const p = it.pic; if (!p || !p.type) return null; return cardDiv(p.type, big ? 170 : 44, p.on); }
function refInGame(it) {
  if (!G || !it.pic || !it.pic.type || !/^p-/.test(it.id)) return true;
  const t = it.pic.type, has = id => tkey(id) === t, v = viewSeat();
  return G.players.some(p => p.table.some(e => has(e.id)) || p.pud.some(has)) || (v >= 0 && G.players[v].hand.some(has));
}
function kitReference() { GX.reference(KK.refSections(D), { title: 'Plates & scoring', label: 'Plates', picture: refPic, inGame: refInGame, before: '[data-gx="rulesd"]' }); }
// ---- undo: the rules let you change your mind until every diner has chosen. Kaiten resolves the turn the moment the last plate
// is served, so a local serve is held for a short take-back window (Menu → Take back a plate) before it is committed.
function holdMs() { const k = UI.prefs.undo || 'short'; return HOLD[k] ? Math.max(600, GX.aiDelay(HOLD[k])) : 0; }
function canHold(seat) { return !isClient() && holdMs() > 0 && !(UI.tut && UI.tut.on); }
function holdServe(seat, mv) {
  clearTimeout(UI.holdT); UI.hold = { seat, mv, sel: UI.sel.slice(), twin: UI.twin, round: G.round, turn: G.turn };
  UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render();
  const tok = UI.seq; UI.holdT = setTimeout(() => { if (tok === UI.seq) commitHold(); }, holdMs());
}
function commitHold() {
  const H = UI.hold; clearTimeout(UI.holdT); UI.hold = null; if (!H || !G || G.round !== H.round || G.turn !== H.turn) { if (G) render(); return; }
  commit(H.seat, H.mv);
}
function undoHold() {
  const H = UI.hold; if (!H) return false; clearTimeout(UI.holdT); UI.hold = null;
  UI.sel = H.sel; UI.twin = H.twin; snd('click'); render(); toast('Plate back on your belt.'); return true;
}
function dropHold() { clearTimeout(UI.holdT); UI.hold = null; }
// ---- "since your last turn" strip in the dock
function kitRecap() { GX.recap.attach('#dockbody', { before: true, title: 'Since your pick' }); }
function recapSeats() { GX.recap.clear(); const hs = NET.on ? [NET.mySeat] : humans(); GX.recap.seats(hs.length ? hs : [0]); }
function recapReveal(evs) {
  try {
    const rv = evs.find(e => e.t === 'reveal'), sc = evs.find(e => e.t === 'score');
    if (rv) rv.picks.forEach(p => GX.recap.push(pname(p.seat) + (G.players[p.seat] && G.players[p.seat].name === 'You' ? ' took ' : ' took ') + p.cards.map(c => TY[c.key].name + (c.w >= 0 ? ' on Fire Paste' : '')).join(' and ') + '.', p.seat));
    if (sc) GX.recap.push('Round ' + sc.round + ' scored: ' + sc.seats.map(s => pname(s.seat) + ' +' + s.total).join(', ') + '.', -1);
  } catch (e) { }
}
// ---- results, statistics, achievements
function kitResult() {
  if (!G || G.phase !== 'over' || UI.resultDone) return; UI.resultDone = true;
  if (UI.mode === 'ai' || (!NET.on && !humans().length)) return; // watching the chefs: not your meal
  const hs = humans(), me = NET.on ? NET.mySeat : UI.mode === 'hot' ? -1 : (hs.length ? hs[0] : -1);
  const F = G.final, seats = G.players.map((p, i) => ({ name: p.name, ai: p.ai || null, me: i === me }));
  const winner = G.winners && G.winners.length > 1 ? G.winners.slice() : G.winner;
  let extra = null;
  if (me >= 0) {
    const mx = Math.max(...F.pudding);
    extra = { buns15: G.rs.some(r => r[me].dumpling >= 15), paste: G.rs.reduce((a, r) => a + (r[me].wasabi || 0), 0),
      custardTop: F.pudding[me] === mx && F.pudding.filter(x => x === mx).length === 1,
      roundsTop: G.rs.filter(r => r[me].total === Math.max(...r.map(x => x.total))).length, hard: G.players.some(p => p.ai === 'hard') };
  }
  const mode = UI.mode === 'net' ? 'online' : UI.mode;
  try {
    const r = GNS.result({ game: GAME_ID, mode, seats, winner, scores: F.totals.slice(), turns: G.round * 100 + G.turn, ms: UI.t0 ? Date.now() - UI.t0 : 0, level: UI.cfg && UI.cfg.level, extra });
    if (r && r.earned.length) { UI.earned = r.earned.map(a => a.name); GX.buzz([30, 60, 30]); }
  } catch (e) { }
  if (UI.mode === 'guided') lsSet('kk_guided_done', '1');
}
function earnedEl() { return UI.earned && UI.earned.length ? h('div.earned', h('b', 'New achievement' + (UI.earned.length > 1 ? 's' : '') + ': '), UI.earned.join(' · ')) : null; }
// ---- the guided first game: a scripted opening (fixed deal, one idea per step, a "why", one glowing plate), then free play
// Seat 1 (the partner chef) follows its own short script so the plates the lesson needs come back round.
const TUT_A = ['tempura', 'tempura', 'squid', 'dumpling', 'dumpling', 'roll1', 'egg', 'salmon', 'sashimi', 'roll2'];
const TUT_B = ['sashimi', 'sashimi', 'wasabi', 'roll3', 'pudding', 'pudding', 'chop', 'salmon', 'dumpling', 'egg'];
const TUT_PARTNER = ['sashimi', 'dumpling', 'salmon', 'roll2', 'pudding', 'sashimi'];
const TUT = [
  { take: 'tempura', title: 'Step 1 of 6 · Start a pair', why: 'Crispy Prawns score 5 for every pair, and a lone one scores nothing. There are two prawns on this belt: take one now, and with only two diners this hand comes back to you, so you can finish the pair later.' },
  { take: 'wasabi', title: 'Step 2 of 6 · The hands swapped', why: 'You are now holding the plates that were in front of {P}. Take the Fire Paste: the next nigiri you serve lands on it and scores triple.' },
  { take: 'squid', title: 'Step 3 of 6 · Use the paste', why: 'Your first belt is back. The Moon Nigiri is worth 3 points, but on your waiting Fire Paste it scores 9. Look for the +9 on the plate.' },
  { take: 'roll3', title: 'Step 4 of 6 · The roll race', why: 'At the end of the round, the most roll icons on a counter scores 6 and the second most 3. This roll has three icons, the most a single plate can have.' },
  { take: 'tempura', title: 'Step 5 of 6 · Finish the pair', why: 'The second Crispy Prawn came back round, as promised. Two prawns make a pair: +5 right away.' },
  { take: 'pudding', title: 'Step 6 of 6 · Think ahead', why: 'Custard Cups score nothing now, but they stay on your counter for all three rounds. At the end the most custard scores 6 (with more diners, the fewest also loses 6).' }
];
function tutDeal() {
  // rebuild the two first hands from the shuffled deck; every card stays where the invariants expect it (108 cards, no copies)
  const pool = G.deck.concat(G.players[0].hand, G.players[1].hand), take = t => { const i = pool.findIndex(id => tkey(id) === t); return pool.splice(i, 1)[0]; };
  const A = TUT_A.map(take), B = TUT_B.map(take);
  G.players[0].hand = A; G.players[1].hand = B; G.deck = pool;
  G.players.forEach(p => { p.mem = [{ turn: 1, hand: p.hand.slice().sort((a, b) => a - b) }]; });
  UI.tut = { on: true, step: -1 };
  Object.assign(UI.coach.seen, { welcome: 1, pick: 1, tempura: 1, wasabi: 1, squid: 1, roll3: 1, roll2: 1, roll1: 1, pudding: 1, pasteReady: 1 });
}
function tutStep() { return UI.tut && UI.tut.on && G && G.round === 1 && G.turn <= TUT.length ? TUT[G.turn - 1] : null; }
function tutTarget() { const s = tutStep(), v = viewSeat(); if (!s || v < 0) return -1; return G.players[v].hand.findIndex(id => tkey(id) === s.take); }
function tutPartner(seat) {
  if (!UI.tut || !UI.tut.on || seat !== 1 || G.round !== 1 || G.turn > TUT_PARTNER.length) return null;
  const t = TUT_PARTNER[G.turn - 1]; return KK.moves(G, seat).find(m => m.ids.length === 1 && tkey(m.ids[0]) === t) || null;
}
// called from coachCheck: the lesson card for this turn (once per turn), then the hand-over card after the last step
function tutCheck() {
  if (!UI.tut || !UI.tut.on) return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  if (G.round > 1 || G.turn > TUT.length) {
    UI.tut.on = false; UI.coach.turn = G.round + '.' + G.turn;
    pushCard({ kind: 'coach', title: 'Your turn to choose', sub: 'Lesson done', body: h('div', h('p', 'From now on every plate is your choice. The green +N on a plate is what it scores you right now; Hint suggests a pick and says why.'), h('p.sm', 'New plates still get a short tip the first time you see them. Plates (top bar) lists every plate and how it scores.')), buttons: [{ label: 'Play on', a: 'cont', cls: 'go' }] });
    return true;
  }
  const turn = G.round + '.' + G.turn; if (UI.tut.seen === turn) return false; UI.tut.seen = turn; UI.coach.turn = turn;
  const s = tutStep(); if (!s) return false;
  const cw = isPh() ? 52 : 96, why = s.why.replace('{P}', pname(1));
  const body = h('div.cwrap', h('div.cardbox', cardDiv(s.take, cw)), h('div.cinfo', h('p', h('b', 'Take the ' + TY[s.take].name + '.')), h('p', h('i', 'Why: '), why)));
  const intro = G.turn === 1 ? h('p.sm.tutintro', 'You and ' + pname(1) + ' each pick one plate at the same time; then the covers lift and the hands swap. Highest score after three rounds wins.') : null;
  pushCard({ kind: 'coach', title: s.title, sub: 'Lesson', body: intro ? h('div', intro, body) : body, buttons: [{ label: 'Show me', a: 'cont', cls: 'go' }] });
  return true;
}
function tutGuard(i) {
  const s = tutStep(); if (!s) return true; const v = viewSeat(); const id = G.players[v].hand[i];
  if (id != null && tkey(id) === s.take) return true;
  snd('error'); toast('In this step, take the glowing ' + TY[s.take].name + '.'); return false;
}
// ---- boot (called from boot() in part 5)
function kitBoot() {
  kitSettings(); kitReference(); kitRecap();
  GNS.achievements(GAME_ID, ACH);
  const sync = () => { AIDELAY = GX.aiDelay(650); ANIM = GX.pref('anim') === 'off' || GX.reduced() ? 0 : 1; };
  sync();
  GX.onPref(k => { if (k === 'ai' || k === 'anim' || k === 'reduce' || typeof k === 'object') sync(); if (k === 'cb' && G && UI.started) render(); });
  GX.offline({ sw: '../sw.js', scope: '../' });
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a;
  if (a === 'undo') undoHold();
  else if (a === 'refopen') { GX.close(); GX.show('gx-refd'); }
  else if (a === 'refbig') { const ty = t.dataset.type; closePop(); GX.refOpen('p-' + ty); }
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !GX.open && UI.hold) { e.preventDefault(); undoHold(); } });
