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
function tutStepsRaw() {
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
    { id: 'scoreNigiri', title: 'Nigiri and paste', say: () => 'Your Moon Nigiri on Fire Paste scored ' + (RS(0).nigiri + RS(0).wasabi) + '. Nigiri alone: 1 to 3.', target: trayStarts('pn-'), wait: null, ready: tutDone },
    { id: 'scoreChef', title: 'The chef scored', say: () => pname(1) + ' got ' + RS(1).total + '. Her lone Fish Slice scored nothing.', target: tq('#tbl .seat:not(.me)'), wait: null, ready: tutDone },
    { id: 'scoreCustard', title: 'Custard counts', say: 'Custard scores once, at the very end: most cups +6, fewest −6 (not with two diners).', target: tq('#tbl .seat.me .grp.shelf'), wait: null, ready: tutDone },
    { id: 'end', title: 'The meal ends', say: () => 'You win ' + G.final.totals[0] + ' to ' + G.final.totals[1] + '! Real meals last 3 rounds. Ties go to more custard.', target: tq('#tbl .seat.me .av'), wait: null, ready: tutDone }
  ];
}
// the story layer: every step is a reason (story.js), then the action; chapters open with a beat and pay off in the next one
function tutSteps() {
  const raw = tutStepsRaw(), T = KK.STORY.tut, C = KK.STORY.chapters, P = KK.STORY.payoff, DYN = { scoreSets: 1, scoreRoll: 1, scoreNigiri: 1, scoreChef: 1, end: 1 };
  raw.forEach(st => { const t = T[st.id]; if (!t) return; st.title = t.t; if (!DYN[st.id]) st.say = t.s; });
  const beat = (id, before, tgt, pay) => { const nx = raw.find(x => x.id === before); return { id, title: C[id].title, say: C[id].open, target: tgt, wait: null, ready: nx.ready, chapter: true }; };
  const out = [];
  raw.forEach(st => {
    if (st.id === 'goal') out.push(beat('c1', 'goal', tq('#belt')));
    if (st.id === 'paste') out.push(beat('c2', 'paste', tq('#belt'), 'c1'));
    if (st.id === 'fish3') out.push(beat('c3', 'fish3', tq('#belt'), 'c2'));
    if (st.id === 'scoreSets') out.push(beat('c4', 'scoreSets', tq('#tbl .seat.me .ctr'), 'c3'));
    out.push(st);
  });
  return out;
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
  const pro = !!(o && o.prologue); const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  try { GX.close(); } catch (e) { } try { closePop(); } catch (e) { } closeRS();
  newGame('coached', { np: 3, seats: [2, 3], level: 'easy', lv: ['easy', 'easy', 'easy', 'easy'] });
  coachBegin(pro, first);
}
// ================= the COACHED first game: a real 3-round game, free choices from turn 1; Suzu (and the rival) speak just in time =================
// One bubble at a time, never blocks input (only the x takes taps), dismissible. Rules that never came up are listed on the end card ("Things you'll meet later").
window.GXCOACH = { running: false, explained: [], later: [], done: false };
const COACH = { q: [], cur: null, seen: {}, on: false, pro: false, first: null, iv: 0, tm: 0, rounds: {}, poorN: 0, pick: null };
const COACH_ALL = ['intro', 'pass', 'pair', 'fish', 'bun', 'roll', 'nigiri', 'paste', 'pasteNigiri', 'sticks', 'custard', 'rival', 'rounds', 'walk', 'makiTie', 'custardEnd', 'penalty', 'custardTie', 'tieBreak'];
const coachOn = () => COACH.on && UI.mode === 'coached' && !!G;
function coachBegin(pro, first) {
  clearInterval(COACH.iv); clearTimeout(COACH.tm);
  Object.assign(COACH, { q: [], cur: null, seen: {}, on: true, pro, first, rounds: {}, poorN: 0, pick: null });
  Object.assign(window.GXCOACH, { running: true, explained: [], later: [], done: false });
  goalCard(() => setTimeout(coachPump, 250));   // ui10: the Goal card is the first screen; Suzu waits for it
  COACH.iv = setInterval(coachPoll, 450); coachSay('intro');
}
function coachStop() { COACH.on = false; clearInterval(COACH.iv); clearTimeout(COACH.tm); COACH.q = []; COACH.cur = null; window.GXCOACH.running = false; guideHide(); }
function coachSay(id, n) {
  if (COACH.seen[id] || !KK.STORY.coach[id]) return; COACH.seen[id] = 1; window.GXCOACH.explained.push(id);
  const c = KK.STORY.coach[id]; COACH.q.push({ id, t: c.t.replace(/%n/g, n == null ? '' : n).replace(/%r/g, rivalName()), w: c.w }); coachPump();
}
function rivalName() { return G ? pname(1) : 'Odile'; }
function coachPump() {
  if (COACH.cur || !COACH.q.length || goalOpen()) return; const m = COACH.q.shift(); COACH.cur = m;
  let g = $('#kkguide'); if (!g) { g = h('div#kkguide', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(g); }
  const who = m.w === 'o' ? { name: pname(1), color: '#e0a31c', portrait: 'camp-odile.webp' } : null;
  const kx = h('button.kx', { type: 'button', 'aria-label': 'Dismiss' }, '\u00d7'); kx.addEventListener('click', () => coachNext());
  g.replaceChildren(portraitEl(who, 40), h('div.kgt', h('b', (who || KK.STORY.guide).name), h('span', m.t)), kx); g.classList.remove('on'); void g.offsetWidth; g.classList.add('on');
  clearTimeout(COACH.tm); COACH.tm = setTimeout(coachNext, Math.max(5200, 5200 + Math.ceil(m.t.split(/\s+/).length / 10) * 1000));   // 4 s + 1 s per 10 words, plus the fade
}
function coachNext() { clearTimeout(COACH.tm); COACH.cur = null; const g = $('#kkguide'); if (g) g.classList.remove('on'); setTimeout(coachPump, 350); }
// situations: checked every ~0.5 s while nobody is mid-animation
function coachPoll() {
  if (!coachOn() || UI.busy || UI.fz || UI.rsOpen || UI.cards.length) return;
  const v = viewSeat(); if (v < 0) return; const me = G.players[v], C = KK.tableCounts(me.table);
  const all = G.players.flatMap(p => p.table.map(e => tkey(e.id))), handKeys = me.hand.map(tkey);
  if (G.round === 1 && G.turn >= 2) coachSay('pass');
  if (C.tempura >= 1) coachSay('pair', C.tempura % 2 ? C.tempura : 0), C.tempura >= 2 && coachSay('pair2');
  if (C.sashimi >= 1) coachSay('fish');
  if (C.dumpling >= 1) coachSay('bun');
  if (all.some(k => ICONS[k])) coachSay('roll');
  if (all.some(k => NIG[k])) coachSay('nigiri');
  if (C.wasabi >= 1 || handKeys.includes('wasabi')) coachSay('paste');
  if (G.used.wasabiNigiri) coachSay('pasteNigiri');
  if (C.chop >= 1 || handKeys.includes('chop')) coachSay('sticks');
  if (all.includes('pudding') || handKeys.includes('pudding')) coachSay('custard');
  const rv = G.players.filter((p, s) => s !== v);
  if (rv.some(p => KK.tableCounts(p.table).wasabi >= 1)) coachSay('rival');
  else if (rv.some(p => KK.tableCounts(p.table).icons >= 3) && C.icons < 3) coachSay('rival2');
  if (G.round === 2) coachSay('rounds'); if (G.round === 3) coachSay('round3');
}
// the player's own pick: remember what the best alternative was (called before the move is applied)
function coachPicked(seat, mv) {
  if (!coachOn() || seat !== viewSeat()) return;
  try { const mine = gainOf(seat, mv.ids); let best = -1, bi = null; for (const m of KK.moves(G, seat)) { if (m.pick.length !== mv.pick.length) continue; const g = gainOf(seat, m.ids); if (g > best) { best = g; bi = m; } } COACH.pick = { mine, best, name: bi ? TY[tkey(bi.ids[0])].name : '' }; } catch (e) { COACH.pick = null; }
}
function coachMove() {
  if (!coachOn() || !COACH.pick) return; const k = COACH.pick; COACH.pick = null;
  if (k.mine >= 5) coachSay('good'); else if (k.best - k.mine >= 4 && COACH.poorN < 2) { COACH.poorN++; COACH.seen.poor = 0; coachSay('poor', k.name); }
}
// after the round tally: Suzu walks the real numbers, one line at a time
function coachWalk(sc) {
  if (!coachOn() || !sc) return; const a = sc.seats[viewSeat()], b = sc.seats.find((x, i) => i !== viewSeat()), nm = rivalName();
  if (!COACH.seen.walk) { coachSay('walk'); KK.STORY.coach.walkL = null; }
  const lines = ['Prawn pairs +' + a.tempura + ', Fish sets +' + a.sashimi + ', Buns +' + a.dumpling + '.', 'Roll race: your ' + a.icons + ' icons ' + (a.maki ? 'won +' + a.maki : 'won nothing') + '. ' + nm + ' had ' + b.icons + '.', 'Nigiri +' + a.nigiri + (a.wasabi ? ', Fire Paste bonus +' + a.wasabi : '') + '. Round total: ' + a.total + ' (' + nm + ' ' + b.total + ').'];
  lines.forEach((t, i) => COACH.q.push({ id: 'walk' + i, t, w: 's' })); coachPump();
  if (G.used.makiTie) coachSay('makiTie');
}
function coachEnd() {
  const F = G.final, v = viewSeat(); coachSay('custardEnd');
  if (G.np > 2 && Math.min(...F.pudding) !== Math.max(...F.pudding)) coachSay('penalty');
  { const mx = Math.max(...F.pudding), mn = Math.min(...F.pudding), n = x => F.pudding.filter(c => c === x).length; if (mx > 0 && (n(mx) > 1 || (mn !== mx && n(mn) > 1))) coachSay('custardTie'); }
  if (G.used.tieBreak) coachSay('tieBreak'); if (G.used.makiTie) coachSay('makiTie');
  window.GXCOACH.later = COACH_ALL.filter(k => !COACH.seen[k]); window.GXCOACH.done = true; window.GXCOACH.running = false;
  clearInterval(COACH.iv); try { GXT.markDone(TUT_GAME); lsSet('kk_done', '1'); } catch (e) { }
  const rs = $('#rs'); rs.hidden = false; UI.rsOpen = true;
  const win = (G.winners || []).indexOf(v) >= 0, tot = F.totals, order = G.players.map((p, s) => s).sort((x, y) => tot[y] - tot[x]);
  const lat = window.GXCOACH.later;
  const btns = [h('button.btn.go', { type: 'button', 'data-a': 'coachplay' }, 'Play a real game')];
  if (COACH.pro && COACH.first) btns.unshift(h('button.btn.go', { type: 'button', 'data-a': 'coachchapter' }, 'Start chapter 1')); else if (window.CAMPAIGN) btns.push(h('button.btn.alt', { type: 'button', 'data-a': 'coachstory' }, 'Story mode'));
  rs.replaceChildren(h('div.rsbox.bar.kkcoachend', h('div.kkres', h('div.kkr1', portraitEl(null, 44), h('div', h('b', win ? 'You know the rules, Mina!' : 'You know the rules!'), h('span', win ? 'Odile owes you a custard.' : 'Odile keeps the custard. For now.'))),
    h('ol.kkrs', ...order.map(s => h('li' + ((G.winners || []).indexOf(s) >= 0 ? '.w' : ''), h('span.n', pname(s) + (s === v ? ' (you)' : '')), h('span.p', tot[s] + ' pts')))),
    lat.length ? h('div.kklater', h('b', 'Things you will meet later'), h('ul', ...lat.map(k => h('li', KK.STORY.coach[k].t)))) : null), ...btns));
  rs.classList.add('kkfin'); rs.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
    coachStop(); rs.hidden = true; rs.innerHTML = ''; rs.classList.remove('kkfin'); UI.rsOpen = false; const a = b.dataset.a;
    const done = () => { if (a === 'coachchapter' && COACH.first) { showStart(); GXC.play(COACH.first.id); } else if (a === 'coachstory' && typeof GXC !== 'undefined') { showStart(); campOpen(); } else { showStart(); UI.sv = 'setup'; renderStart(); } };
    UI.started = false; clearTimeout(UI.tm); UI.seq++; G = null; done(); }));
}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
{ const o = tapHand; tapHand = function (i) {
  if (tutOn() && G && canPick()) { const id = G.players[viewSeat()].hand[i], sid = GXT.state().id; if (!GXT.act({ type: 'tap', what: 'pick', id, i })) return; const r = KK.STORY.tut[sid] && KK.STORY.tut[sid].r; if (r) setTimeout(() => guideSay(r, 3000), 700); }
  return o.apply(this, arguments); }; }
{ const o = toggleTwin; toggleTwin = function () {
  if (tutOn() && !UI.twin) { const sid = GXT.state().id; if (!GXT.act({ type: 'tap', what: 'twin' })) return; const r = KK.STORY.tut[sid] && KK.STORY.tut[sid].r; if (r) guideSay(r, 2600); }
  return o.apply(this, arguments); }; }
// the final score pad is not shown in the tutorial: the table stays under the steps, and the end card closes it
{ const o = showFinal; showFinal = function () {
  if (UI.mode === 'coached') { UI.overShown = true; try { renderDock(); markWinners(); } catch (e) { } coachEnd(); return; }
  if (UI.mode === 'tutorial') { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.overShown = true; UI.tutOver = true; try { renderDock(); markWinners(); } catch (e) { } return; }
  return o.apply(this, arguments); }; }
