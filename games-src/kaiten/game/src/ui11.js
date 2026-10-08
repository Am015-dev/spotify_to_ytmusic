// ===================== part 11: the tutorial (shell/gx-tutor.js): a staged one-round meal that teaches every rule by doing it once =====================
// RULES CHECKLIST (from the rules drawer, the help-kit rules cards and rules-test.js); the step that teaches each one is in [brackets]:
//  [goal]     the goal: most points wins; a meal is 3 rounds (the tutorial is one round); a tie goes to more Custard Cups [end]
//  [chef]     the computer chefs pick at the same time by the same rules [chef]
//  [belt]     each turn take ONE dish; everyone reveals together; the rest of the hand passes to the next diner [belt, pick1, passed]
//  [pair]     Crispy Prawn: a pair scores 5, a lone one scores nothing [pick1, pick2, scoreSets]
//  [fish]     Fish Slice: three score 10, one or two score nothing [twinA, twinB, fish3, scoreSets, scoreChef]
//  [bun]      Steam Bun: 1, 3, 6, 10, then 15 for five or more [bun, scoreSets]
//  [roll]     Seaweed Roll: icons race, most scores 6, second most 3 [roll, scoreRoll]
//  [nigiri]   Nigiri: Sun 1, Sunset 2, Moon 3 points [nigiri, scoreNigiri]
//  [paste]    Fire Paste: the next nigiri lands on it and scores triple; with no nigiri it scores nothing [paste, nigiri, scoreNigiri]
//  [sticks]   Twin Sticks: stay on the table; on a later turn take two dishes, then the sticks go back into the hand you pass [sticksTake, sticksUse, twinA, twinB]
//  [custard]  Custard Cup: kept to the end; most scores 6, fewest loses 6 (nobody loses with 2 diners) [custard, scoreCustard]
//  [round]    round-end scoring on the trays [scoreSets .. scoreChef]; [end] how the game ends.
// The staged game: you and one chef, hand of 10, ONE round, cards dealt from a fixed script (tutDeal) and the chef's picks scripted (tutScript).
// Hands swap every turn, so on odd turns you hold hand X and on even turns hand Y. Each step spotlights one thing; only that answers.
var TUT_GAME = 'kaiten-kitchen';
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial'; }
function firstTime() { return !lsGet('kk_done') && !(typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME)); }
function tutBtn(cls, o) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML(Object.assign({ game: TUT_GAME, first: firstTime(), cls, launch: () => tutStart() }, o || {})); }
function tutNode(cls, o) { const t = h('div'); t.innerHTML = tutBtn(cls, o); return t.firstChild; }
// ---------------------------------------------------------------- the script
// [my picks, chef's picks] by turn. Types; a pair is two types in one turn (Twin Sticks).
const TUT_ME = { 1: 'tempura', 2: 'tempura', 3: 'wasabi', 4: 'squid', 5: 'chop', 6: ['sashimi', 'sashimi'], 7: 'sashimi', 8: 'roll3', 9: 'dumpling', 10: 'pudding' };
const TUT_CHEF = { 1: 'roll1', 2: 'sashimi', 3: 'dumpling', 4: 'dumpling', 5: 'salmon', 6: 'egg', 7: 'tempura', 8: 'tempura', 9: 'chop', 10: 'salmon' };
const TUT_X = ['tempura', 'sashimi', 'dumpling', 'egg', 'wasabi', 'tempura', 'chop', 'salmon', 'dumpling', 'sashimi'];                       // hand X: odd turns for you, even turns for the chef
const TUT_Y = ['roll1', 'tempura', 'squid', 'sashimi', 'dumpling', 'roll3', 'salmon', 'sashimi', 'tempura', 'pudding'];                    // hand Y: even turns for you, odd turns for the chef
var TUT = null;   // { me: {turn: [ids]}, chef: {turn: id} } once dealt
function tutDeal(Gm) {
  // take card ids by type out of the whole deck, in a fixed order; everything else stays in the deck, so every id is still used exactly once
  const all = []; for (let i = 0; i < KK.NCARDS; i++) all.push(i);
  const used = new Set(), take = k => { const id = all.find(i => KK.cardKey(i) === k && !used.has(i)); used.add(id); return id; };
  const X = TUT_X.map(take), Y = TUT_Y.map(take);
  const me = {}, chef = {}; const poolX = TUT_X.slice(), poolY = TUT_Y.slice();
  const grab = (turn, k, side) => { const types = side === 'X' ? poolX : poolY, arr = side === 'X' ? X : Y, i = types.indexOf(k); types[i] = null; return arr[i]; };
  for (let t = 1; t <= 10; t++) {
    const mine = t % 2 ? 'X' : 'Y', theirs = t % 2 ? 'Y' : 'X', m = TUT_ME[t];
    me[t] = (Array.isArray(m) ? m : [m]).map(k => grab(t, k, mine));
    if (t === 9) { chef[t] = -2; continue; }   // the chef takes the Twin Sticks that came back (their id is set once they are in the hand)
    chef[t] = grab(t, TUT_CHEF[t], theirs);
  }
  chef[9] = me[5][0];
  const rest = all.filter(i => !used.has(i));
  Gm.deck = rest; Gm.hand = 10;
  Gm.players[0].hand = X.slice(); Gm.players[1].hand = Y.slice();
  Gm.players.forEach(p => { p.table = []; p.pud = []; p.pick = null; p.picked = false; p.mem = [{ turn: 1, hand: p.hand.slice().sort((a, b) => a - b) }]; });
  Gm.discard = []; Gm.log = []; Gm.logN = 0;
  TUT = { me, chef };
  return TUT;
}
// the chef's move: the scripted dish of this turn (everything else is played by the normal Easy chef)
function tutScript(Gm, seat) {
  if (!TUT || !Gm || Gm.round !== 1 || seat !== 1 || !(UI.cfg && UI.cfg.tutorial)) return null;
  const want = TUT.chef[Gm.turn]; if (want == null) return null;
  const mv = KK.moves(Gm, seat).find(m => m.pick.length === 1 && m.ids[0] === want);
  return mv || null;
}
(function () { const o = KK.AI.choose; KK.AI.choose = function (Gm, seat) { const m = Gm === G ? tutScript(Gm, seat) : null; return m || o.apply(this, arguments); }; })();
// ---------------------------------------------------------------- where each step points
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; };
const beltCard = id => () => { const e = document.querySelector('#belt .hc[data-id="' + id + '"]'); return e && e.getBoundingClientRect().width ? e : null; };
const turnIs = t => !!G && G.round === 1 && G.turn === t && G.phase === 'pick' && canPick() && !UI.rsOpen;
const myPick = t => TUT && TUT.me[t];
const myTray = k => () => { const s = document.querySelector('#tbl .seat.me'); if (!s) return null; const e = s.querySelector('.grp[data-k="' + k + '"]') || s.querySelector('.ctr'); return e && e.getBoundingClientRect().width ? e : null; };
const trayStarts = k => () => { const s = document.querySelector('#tbl .seat.me'); if (!s) return null; const e = s.querySelector('.grp[data-k^="' + k + '"]') || s.querySelector('.ctr'); return e && e.getBoundingClientRect().width ? e : null; };
const tutDone = () => !!(G && G.phase === 'over' && UI.tutOver && UI.rsInfo && UI.rsInfo.done);
const RS = seat => G.rs[0][seat];   // round-1 score lines: 0 = you, 1 = the chef
const pickStep = (id, t, title, say, extra) => Object.assign({ id, title, say, target: () => beltCard(myPick(t)[0])(), wait: { type: 'tap', match: a => a.what === 'pick' && a.id === myPick(t)[0] }, ready: () => turnIs(t) && UI.sel.length === 0 && !UI.twin }, extra || {});
function tutSteps() {
  return [
    { id: 'goal', title: 'Your goal', say: 'Collect dishes that score points. After the last round the highest total wins. Today: one short round.', target: tq('#tbl .seat.me .av'), wait: null, ready: () => turnIs(1) },
    { id: 'chef', title: 'The chef', say: () => pname(1) + ' is a computer. They play by the same rules and choose at the same time as you.', target: tq('#tbl .seat:not(.me) .sh'), wait: null, ready: () => turnIs(1) },
    { id: 'belt', title: 'Your plates', say: 'Each turn you take one dish. Then your other dishes pass along the belt to the chef.', target: tq('#belt'), wait: null, ready: () => turnIs(1) },
    pickStep('pick1', 1, 'Take one dish', 'Tap the Crispy Prawn to take it.'),
    { id: 'passed', title: 'Picks flip together', say: 'Both picks were revealed at once, then the hands swapped. You now hold the chef\'s leftovers.', target: tq('#belt'), wait: null, ready: () => turnIs(2) },
    pickStep('pick2', 2, 'A pair scores 5', 'Two Crispy Prawns make a pair: 5 points. Tap this one.'),
    pickStep('paste', 3, 'Fire Paste', 'Fire Paste triples the next nigiri you take. Tap it.'),
    pickStep('nigiri', 4, 'Nigiri on paste', 'Moon Nigiri is worth 3. On your Fire Paste it scores 9. Tap it.'),
    pickStep('sticksTake', 5, 'Twin Sticks', 'Twin Sticks stay on your table. Take them now and use them next turn.'),
    { id: 'sticksUse', title: 'Use the sticks', say: 'The glowing sticks let you take two dishes this turn. Tap them.', target: tq('#tbl .seat.me .grp.usable'), wait: { type: 'tap', match: a => a.what === 'twin' }, ready: () => turnIs(6) && !!document.querySelector('#tbl .seat.me .grp.usable') && !UI.twin },
    { id: 'twinA', title: 'First dish', say: 'Fish Slices score 10 for a set of three. Tap a Fish Slice.', target: () => beltCard(myPick(6)[0])(), wait: { type: 'tap', match: a => a.what === 'pick' && a.id === myPick(6)[0] }, ready: () => turnIs(6) && UI.twin && UI.sel.length === 0 },
    { id: 'twinB', title: 'Second dish', say: 'Tap the other Fish Slice. The sticks go back into the hand you pass on.', target: () => beltCard(myPick(6)[1])(), wait: { type: 'tap', match: a => a.what === 'pick' && a.id === myPick(6)[1] }, ready: () => turnIs(6) && UI.twin && UI.sel.length === 1 },
    pickStep('fish3', 7, 'Complete the set', 'Three Fish Slices make a set: 10 points. Tap the third.'),
    pickStep('roll', 8, 'Seaweed Rolls', 'Roll icons race. Most icons this round scores 6, second most 3. Tap the three-icon roll.'),
    pickStep('bun', 9, 'Steam Buns', 'Each extra bun is worth more: 1, 3, 6, 10, then 15. Tap it.'),
    pickStep('custard', 10, 'Custard Cup', 'Custard scores only at the game end. Most cups gets 6. Tap it.'),
    { id: 'scoreSets', title: 'Sets scored', say: () => 'Prawn pair ' + RS(0).tempura + ', Fish Slice set ' + RS(0).sashimi + ', one Steam Bun ' + RS(0).dumpling + '. A lone dish scores nothing.', target: tq('#tbl .seat.me .ctr'), wait: null, ready: tutDone, pending: 'Counting the round' },
    { id: 'scoreRoll', title: 'Roll race', say: () => 'Your ' + RS(0).icons + ' icons beat the chef\'s ' + RS(1).icons + ': you get ' + RS(0).maki + ', they get ' + RS(1).maki + '.', target: myTray('roll'), wait: null, ready: tutDone },
    { id: 'scoreNigiri', title: 'Nigiri and paste', say: () => 'Nigiri score 1 to 3 points. Your Moon Nigiri on Fire Paste scored ' + (RS(0).nigiri + RS(0).wasabi) + '.', target: trayStarts('pn-'), wait: null, ready: tutDone },
    { id: 'scoreChef', title: 'The chef scored', say: () => pname(1) + ' got ' + RS(1).total + '. Their lone Fish Slice scored nothing. Same rules for everyone.', target: tq('#tbl .seat:not(.me)'), wait: null, ready: tutDone },
    { id: 'scoreCustard', title: 'Custard counts', say: 'Custard scores once, at the very end: most cups +6, fewest −6 (not with two diners).', target: tq('#tbl .seat.me .grp.shelf'), wait: null, ready: tutDone },
    { id: 'end', title: 'The meal ends', say: () => 'Real meals last three rounds. Highest total wins; ties go to more Custard Cups. You win ' + G.final.totals[0] + ' to ' + G.final.totals[1] + '!', target: tq('#tbl .seat.me .av'), wait: null, ready: tutDone }
  ];
}
// ---------------------------------------------------------------- the kit hooks
function tutLeave() {
  clearTimeout(UI.tm); UI.seq++; UI.rq = []; UI.started = false; UI.busy = false; UI.fz = null; UI.cards = []; UI.sel = []; UI.twin = false; UI.tutOver = false;
  try { closeRS(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { const g = $('#ghost'); if (g) g.hidden = true; } catch (e) { } try { stageClear(); } catch (e) { }
  G = null; TUT = null;
}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen() { if (typeof GXC === 'undefined' || !window.CAMPAIGN) return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen(); }
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null;
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the rules',
    endText: o ? 'Pick, pass, sets, rolls, paste, sticks and custard. Now the Story begins.' : 'Pick, pass, sets, rolls, paste, sticks and custard. A real meal has three rounds: the lightbulb helps.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } try { closePop(); } catch (e) { } closeRS(); newGame('tutorial', { np: 2, seats: [2] }); },
    onDone: r => { tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); campOpen(); }
      else { showStart(); UI.sv = 'setup'; renderStart(); } },
    onExit: () => { tutLeave(); showStart(); } });
}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
{ const o = tapHand; tapHand = function (i) {
  if (tutOn() && G && canPick()) { const id = G.players[viewSeat()].hand[i]; if (!GXT.act({ type: 'tap', what: 'pick', id, i })) return; }
  return o.apply(this, arguments); }; }
{ const o = toggleTwin; toggleTwin = function () {
  if (tutOn() && !UI.twin && !GXT.act({ type: 'tap', what: 'twin' })) return;
  return o.apply(this, arguments); }; }
// the final score pad is not shown in the tutorial: the table stays under the steps, and the end card closes it
{ const o = showFinal; showFinal = function () {
  if (UI.mode === 'tutorial') { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.overShown = true; UI.tutOver = true; try { renderDock(); markWinners(); } catch (e) { } return; }
  return o.apply(this, arguments); }; }
