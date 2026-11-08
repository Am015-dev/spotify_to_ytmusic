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
  ['play', 2, 0, { t: 'ping', c: 'T8', k: 'high' }, 'ping'],   // a signal out of turn: signals have no fixed order
  ['play', 1, 0, { t: 'play', c: 'K7' }, 'lead'], ['play', 2, 0, { t: 'play', c: 'K2' }, 'follow1'],
  ['play', 1, 1, { t: 'play', c: 'C4' }, 'done1'], ['play', 2, 1, { t: 'play', c: 'C8' }, 'done1'],
  ['play', 2, 2, { t: 'play', c: 'T3' }, 'nowin'], ['play', 1, 2, { t: 'play', c: 'T9' }, 'trump']
];
const tutIdx = id => tutSteps().findIndex(s => s.id === id);
const tutPingRow = () => G && G.phase === 'play' && G.trick.plays.length === 0 && TUT_AI.find(r => r[3].t === 'ping' && r[2] === G.trick.n && !G.players[r[1]].pingUsed);
const tutGateOk = id => !(typeof GXT !== 'undefined' && GXT.active() && GXT.index() <= tutIdx(id));
function tutPingDue() { const r = tutPingRow(); return !!r && tutGateOk(r[4]); }
function tutAiStep() {
  if (!G || G.phase === 'over') return false;
  { const r = tutPingRow(); if (r) { if (!tutGateOk(r[4])) return false; return LD.apply(G, r[1], { t: 'ping', c: tcard(r[3].c), k: r[3].k }).ok; } }
  const s = LD.pending(G)[0]; if (s === undefined || !G.players[s].ai) return false;
  const n = G.trick ? G.trick.n : 0;
  const row = TUT_AI.find(r => r[3].t !== 'ping' && r[0] === G.phase && r[1] === s && (G.phase !== 'play' || r[2] === n) && (!r[5] || r[5]()));
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
  ['notrump', 'Lanterns (trumps) can never be signalled'],
  ['ping', 'Signal between tricks: highest, lowest or only card of a colour'],
  ['pingonce', 'Each diver signals only once per dive'],
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
// G4 review fix: most steps are done by touch. A "look" step asks for a tap on the spotlit thing (a job, a seat, a token, a played card);
// the tap is caught here before the game sees it, so it teaches without making a move. Only 4 steps are Next-only reading.
const tutLook = (id, say, target, ready) => ({ id, say, target, look: true, wait: { type: 'tap', match: a => a.what === 'look' && a.id === id }, ready });
document.addEventListener('click', e => {
  if (!tutOn()) return; let st; try { st = GXT.state(); } catch (x) { return; }
  if (!st || !st.shown || st.wait !== 'tap') return;
  const step = tutSteps().find(q => q.id === st.id); if (!step || !step.look) return;
  const x = e.clientX, y = e.clientY;
  if (!(st.holes || []).some(r => x >= r.left - 2 && x <= r.left + r.width + 2 && y >= r.top - 2 && y <= r.top + r.height + 2)) return;
  e.preventDefault(); e.stopPropagation(); GXT.act({ type: 'tap', what: 'look', id: st.id });
}, true);
const tutLan = () => tutBox(['L4', 'L3'].map(t => '#hand .hc[data-id="' + tcard(t) + '"]').join(', '));
function tutSteps() {
  const T = () => G.trick, pl = n => G.phase === 'play' && T() && T().n === n;
  return [
    tutLook('goal', 'The crew wins together. Tap the jobs: all must be done.', tutBox('#pool .jcard'), () => G.phase === 'assign' && tutFree() && !!document.querySelector('#pool .jcard')),
    tutTap('take', 'Lantern 4 makes you Captain. Captains pick first: take this job.', tq('#pool .jcard[data-i="0"]'), m => m.t === 'take' && m.i === 0, () => G.phase === 'assign' && tutMy()),
    tutLook('mine', 'Tap your job: win the trick that holds Lantern 3.', tutBox('#me .jcard, #me [data-a="job"], [data-a="job"][data-i="0"]'), () => G.tasks[1].owner === 1 && tutFree()),
    tutLook('theirs', 'Tap Dag. He took the other job: win trick one.', tutSeat(1), () => G.tasks[1].owner === 1 && tutFree()),
    tutNext('lose', 'One failed job, and the whole crew loses the dive.', tutBox('[data-a="job"]'), () => G.tasks[1].owner === 1 && tutFree()),
    tutTap('flare', 'A flare swaps cards but costs an attempt. Skip it.', tq('#acts [data-a="dist"][data-on="false"]'), m => m.t === 'dist' && !m.on, () => G.phase === 'distress' && tutMy()),
    tutLook('notrump', 'Tap your Lanterns. Trumps can never be signalled.', tutLan(), () => pl(0) && T().plays.length === 0 && tutMy() && !G.players[0].pingUsed),
    tutTap('ping', 'Signal Kelp 3, your lowest Kelp. Tap its signal spot.', tq('#hand .pspot[data-id="' + tcard('K3') + '"]'), m => m.t === 'ping' && m.c === tcard('K3'), () => pl(0) && T().plays.length === 0 && tutMy() && !G.players[0].pingUsed),
    tutLook('pingonce', 'Tap your token. One signal per dive: yours is spent.', tutBox('#mine .tok'), () => G.players[0].pingUsed && tutFree()),
    tutLook('readping', 'Tap Sumi\'s token: Tide 8 is her highest Tide.', tutSeat(2), () => G.pings.some(p => p.seat === 2) && tutFree()),
    tutTap('lead', 'The Captain leads first. Lead Kelp 3, so Dag can win.', tutHand('K3'), m => m.t === 'play' && m.c === tcard('K3'), () => pl(0) && T().plays.length === 0 && G.pings.some(p => p.seat === 2) && tutMy()),
    tutLook('follow1', 'Tap Dag\'s card. Everyone must follow the colour led.', tq('#slots .tslot[data-seat="1"]'), () => pl(0) && T().plays.length === 2 && tutFree()),
    tutNext('win1', 'The highest card of the colour led wins. Dag takes it.', tutSeat(1), () => G.tricks.length >= 1 && tutFree()),
    tutLook('done1', 'Tap Dag. His job is done and cannot fail now.', tutSeat(1), () => G.tricks.length >= 1 && tutFree()),
    tutLook('winlead', 'Tap Dag\'s Coral 4. The trick winner leads next.', tq('#slots .tslot[data-seat="1"]'), () => pl(1) && T().plays.length === 2 && tutMy()),
    tutTap('nowin', 'Follow Coral. You need not win: play Coral 2.', tutHand('C2'), m => m.t === 'play' && m.c === tcard('C2'), () => pl(1) && tutMy()),
    tutNext('void', 'No Tide in your hand? Then you may play any card.', tq('#hand'), () => pl(2) && T().plays.length === 1 && tutMy()),
    tutTap('trump', 'Lanterns are trumps. Play Lantern 3 to win this trick.', tutHand('L3'), m => m.t === 'play' && m.c === tcard('L3'), () => pl(2) && tutMy()),
    tutNext('trumpwin', 'A Lantern beats any colour. Higher Lanterns beat lower ones.', tq('#felt'), () => G.phase === 'over' && tutFree()),
    tutLook('won', 'Tap the jobs: all done, so the crew wins at once!', tutBox('[data-a="job"]'), () => G.phase === 'over' && tutFree())
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
// ---------------------------------------------------------------- special dive rules: one guided step the first time each appears (W504)
// One sentence (<= 12 words), a spotlight on the part of the table it is about, one tap on it (or OK) to go on. The game waits meanwhile.
// Seen ids are remembered per device ('ld-rulesteps'). rulestep-test.js starts one dive per rule and checks the step shows once.
const RULE_STEPS = [
  { id: 'vote', when: () => G.phase === 'assign' && G.as.mode === 'vote', say: 'Crew vote: tap the diver who should take every job.', target: '#opp .seat, #me' },
  { id: 'handover', when: () => G.phase === 'assign' && G.as.mode === 'cmd', say: 'Captain keeps every job, or hands them all to a volunteer.', target: '#pool' },
  { id: 'volunteer', when: () => G.phase === 'assign' && (G.as.mode === 'vol' || G.as.mode === 'split'), say: 'Volunteers take every job. Say yes or no when asked.', target: '#pool' },
  { id: 'predict', when: () => G.phase === 'predict', say: 'Predict exactly how many tricks this job\'s owner will win.', target: '#acts' },
  { id: 'murky', when: () => G.phase === 'play' && G.comm === 'murky', say: 'Murky water: a signal shows the card, but no token.', target: '#hand' },
  { id: 'narc', when: () => G.phase === 'play' && G.comm === 'narc', say: 'Deep narcosis: shared tokens. Anyone may grab one between tricks.', target: '#hand' },
  { id: 'clock', when: () => G.phase === 'play' && !!G.clock, say: 'The clock is running. Finish every job before time runs out.', target: '#clk' },
  { id: 'drone', when: () => !!G.two && G.phase !== 'over', say: 'The drone is a third hand. The Captain plays its top cards.', target: '.seat.drone' }
];
function ruleSeen() { try { return JSON.parse(localStorage.getItem('ld-rulesteps') || '{}') || {}; } catch (e) { return UI.rsMem || (UI.rsMem = {}); } }
function ruleMark(id) { const o = ruleSeen(); o[id] = 1; UI.rsMem = o; try { localStorage.setItem('ld-rulesteps', JSON.stringify(o)); } catch (e) { } }
function ruleStepCheck() {   // true while a rule step is up (the turn driver waits)
  if (UI.rstep) return true;
  if (!G || UI.mode === 'tutorial' || NET.on || UI.busy || UI.fz || UI.cards.length || UI.dlg || G.phase === 'over') return false;
  const seen = ruleSeen();
  for (const r of RULE_STEPS) { let on = false; try { on = !seen[r.id] && r.when(); } catch (e) { } if (on && ruleStepShow(r)) return true; }
  return false;
}
function ruleBox(sel) {
  const rs = Array.from(document.querySelectorAll(sel)).map(e => e.getBoundingClientRect()).filter(r => r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight); if (!rs.length) return null;
  const l = Math.max(2, Math.min(...rs.map(r => r.left)) - 4), t = Math.max(2, Math.min(...rs.map(r => r.top)) - 4), r2 = Math.min(innerWidth - 2, Math.max(...rs.map(r => r.right)) + 4), b = Math.min(innerHeight - 2, Math.max(...rs.map(r => r.bottom)) + 4);
  return { left: l, top: t, width: r2 - l, height: b - t };
}
function ruleStepShow(r) {
  const box = ruleBox(r.target); if (!box) return false;
  UI.rstep = r.id;
  const o = document.createElement('div'); o.id = 'rstep'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'New rule'); o.dataset.rule = r.id;
  o.innerHTML = '<div class="rsh"></div><div class="rsb gxh-bub gxt-bub on"><div class="gxh-bd"><div class="gxh-tt">New rule</div><div class="gxh-tx"></div></div><div class="gxh-row2"><button type="button" class="gxh-ok rsok">OK</button></div></div>';
  o.querySelector('.gxh-tx').textContent = r.say;
  const hole = o.querySelector('.rsh'), bub = o.querySelector('.rsb');
  Object.assign(hole.style, { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' });
  [[0, 0, innerWidth, box.top], [0, box.top + box.height, innerWidth, innerHeight - box.top - box.height], [0, box.top, box.left, box.height], [box.left + box.width, box.top, innerWidth - box.left - box.width, box.height]]
    .forEach(q => { const d = document.createElement('div'); d.className = 'rsd'; Object.assign(d.style, { left: q[0] + 'px', top: q[1] + 'px', width: Math.max(0, q[2]) + 'px', height: Math.max(0, q[3]) + 'px' }); o.insertBefore(d, hole); });
  document.body.appendChild(o);
  const bh = bub.offsetHeight || 120, below = box.top + box.height + 10, above = box.top - bh - 10;
  bub.style.top = Math.round(below + bh < innerHeight - 6 ? below : Math.max(6, above)) + 'px'; bub.style.left = Math.round((innerWidth - bub.offsetWidth) / 2) + 'px';
  const at = Date.now();
  o.addEventListener('click', e => {
    e.stopPropagation(); e.preventDefault(); if (Date.now() - at < 500) return;
    const x = e.clientX, y = e.clientY, inHole = x >= box.left && x <= box.left + box.width && y >= box.top && y <= box.top + box.height;
    if (inHole || (e.target.closest && e.target.closest('.rsok'))) ruleStepDone();
    else { bub.classList.remove('gxt-shake'); void bub.offsetWidth; bub.classList.add('gxt-shake'); }
  }, true);
  return true;
}
function ruleStepDone() { const id = UI.rstep; if (!id) return; ruleMark(id); UI.rstep = null; const e = document.getElementById('rstep'); if (e) e.remove(); try { render(); } catch (x) { } schedule(); }
