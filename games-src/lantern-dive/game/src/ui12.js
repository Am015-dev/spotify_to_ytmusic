// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged, never-saved dive that teaches every rule by doing it once =====================
// RULES CHECKLIST (from the rules drawer buildRules(), the help-kit rules cards HLP_RULES and rules-test.js). Each line names the step that teaches it by doing:
//   [x] The goal: the whole crew wins or loses together; every job is done = the dive is won ............ goal, won
//   [x] A job card is a task for ONE diver; it is met by the tricks that diver wins ...................... goal, take, mates
//   [x] The Commander holds Lantern 4, picks a job first, then clockwise, one job at a turn .............. cmd, take, mates
//   [x] A job is done when it is met and can no longer fail (green tick); a job that can no longer be met
//       is broken (red cross) and loses the dive for everybody; try again .............................. lost, done1, won
//   [x] The distress flare (optional card pass before signalling, costs an extra attempt) ................ flare
//   [x] No talking about cards; the ping: once per dive show your highest, lowest or only card of a colour,
//       between tricks; others read it; the token resets each attempt ................................... ping, readping, ping2
//   [x] The Commander leads the first trick; the winner leads the next one ............................... lead, win2, done1, win3
//   [x] The leader plays any card; everybody must follow its colour if they can ......................... lead, follow
//   [x] The highest card of the led colour wins; other colours never win ................................ win1, win2, win3
//   [x] You are never forced to win a trick ................................................................ lead2
//   [x] No card of the led colour: play anything; Lanterns are trumps and beat every colour ............. trump, win4
//   [x] The dive ends the moment every job is done; cards left in hand do not matter ..................... won
//   [-] Not taught here (the lightbulb and the Rules drawer cover them): job-sharing dives, murky water, deep narcosis,
//       the clock, predictions, the drone for two divers, the Last trick button.
// The staged game: seat 0 = you (Commander, Lantern 4), seat 1 = Dag, seat 2 = Sumi. Jobs: you "Win the Lantern 3", Dag "Win the first trick" (data.js tutorial).
// Attempt 1 ends on trick 1 on purpose: the player leads the Coral 9, wins, and breaks Dag's job. Attempt 2 (same deal, taken for you) is won in three tricks.
const TUT_GAME = 'lantern-dive';
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial';
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart });
const tcard = t => { const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }; return D.card(L[t[0]], +t.slice(1)); };
// ---------------------------------------------------------------- the scripted divers (Dag = seat 1, Sumi = seat 2)
// the cards they play, by attempt (1, or 2 = every later one), trick number and seat
const TUT_PLAY = { 1: [{ 1: 'C5', 2: 'C3' }], 2: [{ 1: 'C7', 2: 'C1' }, { 1: 'K4', 2: 'K9' }, { 2: 'T8', 1: 'T2' }] };
function tutMove(s) {
  const mv = LD.moves(G, s); if (!mv.length) return null;
  if (G.phase === 'assign') return mv.find(m => m.t === 'take') || null;
  if (G.phase === 'signal') {
    const k9 = tcard('K9');
    if (s === 2 && G.att === 1) { const p = mv.find(m => m.t === 'ping' && m.c === k9); if (p) return p; }
    return mv.find(m => m.t === 'nosig') || null;
  }
  if (G.phase === 'play') {
    const row = (TUT_PLAY[G.att > 1 ? 2 : 1] || [])[G.tricks.length]; const want = row && row[s]; if (!want) return null;
    return mv.find(m => m.t === 'play' && m.c === tcard(want)) || null;
  }
  return null;
}
function tutAiStep() {
  for (const s of LD.pending(G)) {
    if (!G.players[s].ai) continue;
    const m = tutMove(s); if (!m) continue;
    const r = LD.apply(G, s, m); if (r.ok) return true;
  }
  return LD.AI.step(G);   // anything unscripted: the normal computer diver
}
// attempt 2 starts with the same jobs and no flare, taken for you: those are not the player's taps, so they do not go through the kit
function tutAuto() {
  if (!tutOn() || UI.busy || !G || G.att < 2 || !iMustAct()) return false;
  let mv = null;
  if (G.phase === 'assign') mv = myMoves().find(m => m.t === 'take' && m.i === 0);
  else if (G.phase === 'distress') mv = myMoves().find(m => m.t === 'dist' && !m.on);
  if (!mv) return false;
  if (!UI._tutAutoT) UI._tutAutoT = setTimeout(() => { UI._tutAutoT = 0; if (tutOn() && G && !UI.busy) commit(0, mv); else schedule(); }, 420);
  return true;
}
// a step that waits for "Next" must not have the computer move on under it
function tutPaused() { try { const s = GXT.state(); return !!(s.active && s.shown && !s.wait); } catch (e) { return false; } }
// the kit gate for every move the player makes (doMove in ui3.js)
function tutGate(mv) { return GXT.act({ type: 'tap', what: 'move', mv }); }
// the trick stays on the table, with its winner marked, while the current step explains it (playEvs in ui3.js)
async function tutHoldWait() {
  for (let g = 0; g < 900 && tutOn(); g++) { const st = GXT.current(); if (!(st && st.hold && st.hold())) return; await wait(80); }
}
// ---------------------------------------------------------------- where each step points

// glowing things pulse a few pixels; a spotlight that follows every pulse would redraw its bubble all the time, so a rect only moves when it moved by more than 7 px
function tutSteady(key, r) {
  if (!r) { delete tutSteady.last[key]; return null; }
  const o = tutSteady.last[key];
  if (o && Math.abs(o.left - r.left) < 7 && Math.abs(o.top - r.top) < 7 && Math.abs(o.width - r.width) < 7 && Math.abs(o.height - r.height) < 7) return o;
  return (tutSteady.last[key] = r);
}
tutSteady.last = {};
const tq = sel => () => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? tutSteady('q' + sel, { left: r.left, top: r.top, width: r.width, height: r.height }) : null; };
// a hand card's visible part (later cards overlap it), so the tap lands on that card
function tutHandRect(id) {
  return tutSteady('hc' + id, tutHandRect0(id));
}
function tutHandRect0(id) {
  const e = document.querySelector('#hand .hc[data-id="' + id + '"]'); if (!e) return null;
  const r = e.getBoundingClientRect(); if (!r.width) return null;
  let right = r.right, bottom = r.bottom, seen = false;
  for (let q = e.nextElementSibling; q; q = q.nextElementSibling) {
    if (!q.classList.contains('hc')) continue; const b = q.getBoundingClientRect();
    if (b.right > r.left && b.left < r.right && b.bottom > r.top + 4 && b.top < r.bottom - 4) {
      if (b.top < r.top + r.height * .5 && b.left > r.left + 6) right = Math.min(right, b.left);
      else if (b.top > r.top + 6) bottom = Math.min(bottom, b.top);
    }
  }
  seen = true;
  return { left: r.left, top: r.top, width: Math.max(24, right - r.left), height: Math.max(24, bottom - r.top) };
}
const tutSpot = id => () => { const e = document.querySelector('#hand .hc[data-id="' + id + '"] .pspot'); return e && e.getBoundingClientRect().width ? e : null; };
const tutSeat = s => () => { const e = document.querySelector('[data-key="seat' + s + '"]'); const b = e && (e.closest('.seat') || e.closest('.me') || e); return b && b.getBoundingClientRect().width ? b : null; };
// a job's chip: my own sit under my hand (#mine), the others' inside their seat
const tutJobChip = i => () => {
  const o = G.tasks[i] && G.tasks[i].owner; if (o == null || o < 0) return null;
  const chips = o === viewSeat() ? Array.from(document.querySelectorAll('#mine .jc.me')) : (() => { const k = document.querySelector('[data-key="seat' + o + '"]'), root = k && k.closest('.seat'); return root ? Array.from(root.querySelectorAll('.jc')) : []; })();
  const el = chips.find(c => c.getBoundingClientRect().width); return el || null;
};
// the box around all the elements that match (the job cards on the table, the cards of the trick)
const tutBox = sel => () => {
  const rs = Array.from(document.querySelectorAll(sel)).map(e => e.getBoundingClientRect()).filter(r => r.width > 4 && r.height > 4); if (!rs.length) return null;
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r2 = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
  return tutSteady('box' + sel, { left: l - 4, top: t - 4, width: r2 - l + 8, height: b - t + 8 });
};
const tutFelt = tutBox('#slots .tslot');
const myTurnLead = () => G && G.phase === 'play' && iMustAct() && G.trick.plays.length === 0 && !UI.busy && !UI.fz;
const trickShown = () => !!(UI.fz && UI.fz.win);
const cn2 = c => D.cardName(c);
function lastTrickLine() { const k = G.tricks[G.tricks.length - 1]; return k; }
function tutSteps() {
  return [
    { id: 'goal', title: 'One crew', say: 'You, Dag and Sumi win or lose together. Each job card is a task for one diver.', target: tutBox('#pool .jcard'), wait: null,
      ready: () => G && G.phase === 'assign' && G.att === 1 && iMustAct() && !UI.busy && !!document.querySelector('#pool .jcard') },
    { id: 'cmd', title: 'You are Commander', say: 'You hold Lantern 4, so you are the Commander. The Commander picks a job first.', target: () => tutHandRect(tcard('L4')), wait: null,
      ready: () => G && G.phase === 'assign' && !UI.busy && !!tutHandRect(tcard('L4')) },
    { id: 'take', title: 'Take a job', say: 'Tap the "Lantern 3" job: win that card. You hold Lantern 3 and 4, so it is safe.', target: tq('#pool [data-key="job0"]'),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'take' && a.mv.i === 0 }, ready: () => G && G.phase === 'assign' && iMustAct() && !UI.busy },
    { id: 'mates', title: 'Dag takes one', say: 'Dag took "The first trick": he must win trick 1. Both jobs must be done to win.', target: tutJobChip(1), wait: null,
      ready: () => G && G.phase === 'distress' && G.tasks[1].owner === 1 && !UI.busy && !!tutJobChip(1)() },
    { id: 'flare', title: 'Distress flare', say: 'Optional: after a lost try, divers can swap cards. Not now: tap No flare.', target: tq('#acts [data-a=dist][data-on=false]'),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'dist' && !a.mv.on }, ready: () => G && G.phase === 'distress' && iMustAct() && !UI.busy },
    { id: 'ping', title: 'No talking!', say: 'Cards stay secret. Your only message is a ping: show one colour card. Tap the ping on Coral 9.', target: tutSpot(tcard('C9')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'ping' && a.mv.c === tcard('C9') }, ready: () => G && G.att === 1 && G.phase === 'signal' && iMustAct() && !UI.busy && !!tutSpot(tcard('C9'))() },
    { id: 'readping', title: 'Read the pings', say: 'Sumi shows her Kelp 9, her highest Kelp. Everyone pings once per dive, between tricks.', target: tutSeat(2), wait: null,
      ready: () => G && G.att === 1 && G.phase === 'play' && !UI.busy && G.pings.some(p => p.seat === 2) && !!tutSeat(2)() },
    { id: 'lead', title: 'Lead a card', say: 'You lead the first trick. Everyone must follow its colour. Tap your Coral 9.', target: () => tutHandRect(tcard('C9')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'play' && a.mv.c === tcard('C9') }, ready: () => G.att === 1 && myTurnLead() },
    { id: 'win1', title: 'Highest card wins', say: () => 'Coral was led, so all played Coral. The highest Coral wins: your 9 beats ' + otherVals() + '.', target: tutFelt, wait: null,
      hold: () => true, ready: () => G.att === 1 && trickShown() },
    { id: 'lost', title: 'A job broke', say: 'Dag needed to win the first trick, but you did. One broken job loses the dive for all.', target: tutJobChip(1), wait: null,
      onNext: () => nextAttempt(true), ready: () => G && G.phase === 'over' && !G.result.ok && !UI.busy && !UI.fz && !!tutJobChip(1)() },
    { id: 'ping2', title: 'Tell Dag', say: 'Same cards. This time let Dag win. Ping your lowest Coral, the 2.', target: tutSpot(tcard('C2')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'ping' && a.mv.c === tcard('C2') }, ready: () => G && G.att === 2 && G.phase === 'signal' && iMustAct() && !UI.busy && !!tutSpot(tcard('C2'))() },
    { id: 'lead2', title: 'Lead low', say: 'You never have to win. Lead your Coral 2 and let Dag take the trick.', target: () => tutHandRect(tcard('C2')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'play' && a.mv.c === tcard('C2') }, ready: () => G.att === 2 && G.tricks.length === 0 && myTurnLead() },
    { id: 'win2', title: 'Dag wins', say: 'Dag\'s Coral 7 is the highest Coral. Whoever wins a trick leads the next one.', target: tutFelt, wait: null,
      hold: () => true, ready: () => G.att === 2 && G.tricks.length === 1 && trickShown() },
    { id: 'done1', title: 'Job done', say: 'A green tick: Dag\'s job is done for good. Only a job that can still fail stays open.', target: tutJobChip(1), wait: null,
      ready: () => G.att === 2 && G.phase === 'play' && G.tricks.length === 1 && !UI.busy && !UI.fz && jobSt(1) > 0 && !!tutJobChip(1)() },
    { id: 'follow', title: 'Follow the colour', say: 'Dag led Kelp. If you hold Kelp, you must play it. Tap your Kelp 3.', target: () => tutHandRect(tcard('K3')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'play' && a.mv.c === tcard('K3') }, ready: () => G.att === 2 && G.tricks.length === 1 && G.phase === 'play' && iMustAct() && G.trick.plays.length === 2 && !UI.busy && !UI.fz },
    { id: 'win3', title: 'Who leads next', say: 'Sumi\'s Kelp 9 is the highest Kelp, so she wins and leads the next trick.', target: tutFelt, wait: null,
      hold: () => true, ready: () => G.att === 2 && G.tricks.length === 2 && trickShown() },
    { id: 'trump', title: 'Trumps!', say: 'Sumi led Tide. You have none, so play anything. A Lantern beats every colour: tap Lantern 3.', target: () => tutHandRect(tcard('L3')),
      wait: { type: 'tap', match: a => a.mv && a.mv.t === 'play' && a.mv.c === tcard('L3') }, ready: () => G.att === 2 && G.tricks.length === 2 && G.phase === 'play' && iMustAct() && G.trick.plays.length === 1 && !UI.busy && !UI.fz },
    { id: 'win4', title: 'Lantern wins', say: 'Your Lantern 3 beats Sumi\'s Tide 8. A higher Lantern would have won instead.', target: tutFelt, wait: null,
      hold: () => true, ready: () => G.att === 2 && G.tricks.length === 3 && trickShown() },
    { id: 'won', title: 'Dive won!', say: 'Both jobs are done, so the dive ends now and the crew wins. Cards left over do not matter.', target: tutJobChip(0), also: tutJobChip(1), wait: null,
      ready: () => G && G.phase === 'over' && G.result && G.result.ok && !UI.busy && !UI.fz }
  ];
}
function otherVals() { const k = UI.fz && UI.fz.plays ? UI.fz.plays.filter(p => p.s !== 0).map(p => valOf(p.c)) : []; return k.length === 2 ? k[0] + ' and ' + k[1] : 'the others'; }
// ---------------------------------------------------------------- the kit hooks
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  o = o && o.prologue ? o : null;
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the rules',
    endText: o ? 'Jobs, the Commander, pings, tricks, trumps. Now the Story begins.' : 'Jobs, the Commander, pings, tricks, trumps. Murky water, clocks and the drone are in the Rules and the lightbulb.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } try { GXC.close(); } catch (e) { } closePop(true); newGame('tutorial'); },
    onDone: r => {
      tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
      else { showStart(); UI.sv = 'setup'; UI.cfgOpen = false; renderStart(); }
    },
    onExit: () => { tutLeave(); showStart(); }
  });
}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave() {
  clearTimeout(UI.tm); clearTimeout(UI._tutAutoT); UI._tutAutoT = 0; UI.seq++; UI.busy = false; UI.fz = null; UI.rq = []; UI.cards = []; UI.started = false;
  try { GXH.hide(); } catch (e) { } try { const f = $('#finger'); if (f) f.hidden = true; } catch (e) { }
}
