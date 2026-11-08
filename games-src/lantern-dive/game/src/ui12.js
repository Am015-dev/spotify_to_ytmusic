// ===================== part 12: the guided first dive (W504). Every core rule in order, one sentence (<= 12 words) + one highlighted tap per step. =====================
// A fixed deal (data.js tutorial), the crewmates are scripted (TUT_AI) so every step happens exactly as told; a step's tap is the only input
// that goes through (shell/gx-tutor.js spotlight). The kit's end card starts a real game. TUT_RULES maps every core rule to its step (tutor-test.js walks it).
const TUT_GAME = 'lantern-dive';
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial';
const tutCoach = () => false;
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart, sub: false });
const tcard = t => { const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }; return D.card(L[t[0]], +t.slice(1)); };
const tutAuto = () => false;
function tutPaused() { try { const s = GXT.state(); return !!(s.active && s.shown && !s.wait); } catch (e) { return false; } }
function tutGate(mv) { return GXT.act({ type: 'tap', what: 'move', mv }); }
async function tutHoldWait() { }
const tq = sel => () => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { left: r.left, top: r.top, width: r.width, height: r.height } : null; };
const tutBox = sel => () => {
  const rs = Array.from(document.querySelectorAll(sel)).map(e => e.getBoundingClientRect()).filter(r => r.width > 4 && r.height > 4); if (!rs.length) return null;
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r2 = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
  return { left: l - 4, top: t - 4, width: r2 - l + 8, height: b - t + 8 };
};
// the scripted crewmates: [phase, seat, trick, move, the step that must be finished first]
const TUT_AI = [
  ['assign', 1, 0, { t: 'take', i: 1 }, 'take'],
  ['signal', 2, 0, { t: 'ping', c: 'T8', k: 'high' }, 'ping'],
  ['signal', 1, 0, { t: 'nosig' }, 'ping', () => !G.pings.some(p => p.seat === 2)], ['signal', 1, 0, { t: 'nosig' }, 'readping'],
  ['play', 1, 0, { t: 'play', c: 'K7' }, 'lead'], ['play', 2, 0, { t: 'play', c: 'K2' }, 'follow1'],
  ['play', 1, 1, { t: 'play', c: 'C4' }, 'done1'], ['play', 2, 1, { t: 'play', c: 'C8' }, 'done1'],
  ['play', 2, 2, { t: 'play', c: 'T3' }, 'nowin'], ['play', 1, 2, { t: 'play', c: 'T9' }, 'trump']
];
const tutIdx = id => tutSteps().findIndex(s => s.id === id);
function tutAiStep() {
  if (!G || G.phase === 'over') return false;
  const s = LD.pending(G)[0]; if (s === undefined || !G.players[s].ai) return false;
  const n = G.trick ? G.trick.n : 0;
  const row = TUT_AI.find(r => r[0] === G.phase && r[1] === s && (G.phase !== 'play' || r[2] === n) && (!r[5] || r[5]()));
  if (!row) { if (G.phase === 'signal') return LD.apply(G, s, { t: 'nosig' }).ok; return LD.AI.step(G); }
  if (typeof GXT !== 'undefined' && GXT.active() && GXT.index() <= tutIdx(row[4])) return false;   // wait until the step that sets this move up is finished
  const m = Object.assign({}, row[3]); if (typeof m.c === 'string') m.c = tcard(m.c);
  return LD.apply(G, s, m).ok;
}
const tutFree = () => !!G && !UI.busy && !UI.fz && !UI.cards.length;
const tutMy = () => tutFree() && iMustAct();
const tutHand = t => tq('#hand .hc[data-id="' + tcard(t) + '"]');
const tutSeat = s => tutBox('#opp .seat[data-seat="' + s + '"], #opp [data-a="seat"][data-seat="' + s + '"]');
const tutNext = (id, say, target, ready) => ({ id, say, target, wait: null, ready });
const tutTap = (id, say, target, match, ready) => ({ id, say, target, wait: { type: 'tap', match: a => !!a.mv && match(a.mv) }, ready });
// every core rule, in the order the steps teach it (tutor-test.js checks each step is reached and each sentence is <= 12 words)
const TUT_RULES = [
  ['goal', 'The crew wins together: every job card must be done'],
  ['take', 'Lantern 4 = Captain; the Captain picks a job first'],
  ['mine', 'A job is met by the tricks its owner wins'],
  ['theirs', 'Jobs are taken in turn; each job has one owner'],
  ['lose', 'One failed job loses the dive for everyone'],
  ['flare', 'Distress flare: optional card pass, costs an attempt'],
  ['ping', 'Signal once per dive: highest, lowest or only card of a colour'],
  ['readping', 'Reading a crewmate\'s signal token'],
  ['lead', 'The Captain leads trick one; the leader plays any card'],
  ['follow1', 'Everyone must follow the colour led if they can'],
  ['win1', 'Highest card of the colour led wins the trick'],
  ['done1', 'A job done stays done'],
  ['winlead', 'The trick winner leads the next trick'],
  ['nowin', 'You are never forced to win'],
  ['void', 'No card of the colour led: play any card'],
  ['trump', 'Lanterns are trumps'],
  ['trumpwin', 'A Lantern beats every colour; higher Lanterns beat lower'],
  ['won', 'All jobs done ends the dive at once with a win']
];
function tutSteps() {
  const T = () => G.trick, pl = n => G.phase === 'play' && T() && T().n === n;
  return [
    tutNext('goal', 'The crew wins together when every job card is done.', tutBox('#pool .jcard'), () => G.phase === 'assign' && tutFree() && !!document.querySelector('#pool .jcard')),
    tutTap('take', 'Lantern 4 makes you Captain. Captains pick first: take this job.', tq('#pool .jcard[data-i="0"]'), m => m.t === 'take' && m.i === 0, () => G.phase === 'assign' && tutMy()),
    tutNext('mine', 'Your job: win the trick that holds Lantern 3.', tutBox('#me .jcard, #me [data-a="job"], [data-a="job"][data-i="0"]'), () => G.tasks[1].owner === 1 && tutFree()),
    tutNext('theirs', 'Dag took the other job: win the first trick.', tutSeat(1), () => G.tasks[1].owner === 1 && tutFree()),
    tutNext('lose', 'One failed job, and the whole crew loses the dive.', tutBox('[data-a="job"]'), () => G.tasks[1].owner === 1 && tutFree()),
    tutTap('flare', 'A flare swaps cards but costs an attempt. Skip it.', tq('#acts [data-a="dist"][data-on="false"]'), m => m.t === 'dist' && !m.on, () => G.phase === 'distress' && tutMy()),
    tutTap('ping', 'Once per dive, show your highest, lowest or only colour card.', tq('#hand .pspot[data-id="' + tcard('K3') + '"]'), m => m.t === 'ping' && m.c === tcard('K3'), () => G.phase === 'signal' && tutMy()),
    tutNext('readping', 'Sumi\'s top token: Tide 8 is her highest Tide.', tutSeat(2), () => G.pings.some(p => p.seat === 2) && tutFree()),
    tutTap('lead', 'The Captain leads first. Lead Kelp 3, so Dag can win.', tutHand('K3'), m => m.t === 'play' && m.c === tcard('K3'), () => pl(0) && tutMy()),
    tutNext('follow1', 'Dag follows Kelp. Everyone must follow the colour led, if able.', tq('#felt'), () => pl(0) && T().plays.length === 2 && tutFree()),
    tutNext('win1', 'The highest card of the colour led wins. Dag takes it.', tutSeat(1), () => G.tricks.length >= 1 && tutFree()),
    tutNext('done1', 'Dag\'s job is done. A done job cannot fail now.', tutSeat(1), () => G.tricks.length >= 1 && tutFree()),
    tutNext('winlead', 'The winner leads next. Dag led Coral 4.', tq('#felt'), () => pl(1) && T().plays.length === 2 && tutMy()),
    tutTap('nowin', 'Follow Coral. You need not win: play Coral 2.', tutHand('C2'), m => m.t === 'play' && m.c === tcard('C2'), () => pl(1) && tutMy()),
    tutNext('void', 'No Tide in your hand? Then you may play any card.', tq('#hand'), () => pl(2) && T().plays.length === 1 && tutMy()),
    tutTap('trump', 'Lanterns are trumps. Play Lantern 3 to win this trick.', tutHand('L3'), m => m.t === 'play' && m.c === tcard('L3'), () => pl(2) && tutMy()),
    tutNext('trumpwin', 'A Lantern beats any colour. Higher Lanterns beat lower ones.', tq('#felt'), () => G.phase === 'over' && tutFree()),
    tutNext('won', 'Every job is done, so the crew wins the dive at once!', tutBox('[data-a="job"]'), () => G.phase === 'over' && tutFree())
  ];
}
// ---------------------------------------------------------------- the kit hooks
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  o = o && o.prologue ? o : null;
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'Dive won! You know the rules', endText: 'Now a real dive: new cards, new jobs.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : [{ id: 'play', label: 'Play a real game' }, { id: 'story', label: 'Story mode' }],
    setup: () => { try { GX.close(); } catch (e) { } try { GXC.close(); } catch (e) { } closePop(true); newGame('tutorial'); UI.tcPro = !!o; },
    onDone: r => tutFinish(r),
    onExit: () => { tutLeave(); showStart(); }
  });
}
function tutFinish(r) {
  try { GXT.markDone(TUT_GAME); } catch (e) { }
  tutLeave(); const c = r && r.choice, first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
  else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
  else newGame('vs');   // straight into a real game
}
function tutLeave() {
  clearInterval(UI.tcT); UI.tc = null; UI.tcPro = false; ['tbub', 'tend', 'tskip'].forEach(i => { const e = document.getElementById(i); if (e) e.remove(); });
  clearTimeout(UI.tm); UI.seq++; UI.busy = false; UI.fz = null; UI.rq = []; UI.cards = []; UI.started = false;
  try { GXT.stop(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { const f = $('#finger'); if (f) f.hidden = true; } catch (e) { }
}
