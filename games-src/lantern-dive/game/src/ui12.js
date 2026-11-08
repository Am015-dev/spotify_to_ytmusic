// ===================== part 12: the coached first dive (W409). Replaces the 21 spotlight steps. =====================
// ONE forced tap (take a job, through the shell/gx-tutor.js spotlight), then the kit is stopped and the dive is a real, free game on a stacked deal
// (data.js tutorial): every legal move is allowed, the computer divers play normally, the guide (Brack) speaks just in time, one bubble at a time,
// never blocks a tap, can be dismissed. The end card walks the scoring with the real numbers and lists the rules that did not come up.
// RULES COVERAGE (TUTORIAL-COVERAGE.md): each id below is explained the first time it matters, else listed on the end card.
const TUT_GAME = 'lantern-dive';
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial';    // the forced spotlight step is up
const tutCoach = () => UI.mode === 'tutorial' && !!UI.tc;                                      // the coached dive is running
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart, sub: false });
const tcard = t => { const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }; return D.card(L[t[0]], +t.slice(1)); };
const tutAiStep = () => LD.AI.step(G);
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
// the only forced step: take a job (any job). Then the kit is stopped (a trailing never-ready step keeps it from showing its own end card).
function tutSteps() {
  return [
    { id: 'take', title: 'Welcome aboard', say: 'The crew wins when every job card is done. Lantern 4 makes you Captain. Tap a job.',
      target: tutBox('#pool .jcard'), wait: { type: 'tap', match: a => a.mv && a.mv.t === 'take' },
      ready: () => G && G.phase === 'assign' && iMustAct() && !UI.busy && !!document.querySelector('#pool .jcard'),
      onDone: () => setTimeout(() => { try { GXT.stop(); } catch (e) { } tutBegin(); }, 0) },
    { id: 'free', title: '', say: '', target: () => null, wait: null, ready: () => false }
  ];
}
// ---------------------------------------------------------------- the guide
const TUT_LATER = [   // always on the end card: the special dives (not in this deal)
  ['Hand-over, vote, volunteer', 'Some dives let the Commander take every job, or hand them over, or the crew votes.'],
  ['Murky water and deep narcosis', 'Signals change: show a card with no token, or grab shared tokens at any time.'],
  ['The clock', 'Real-time dives: the crew has a few minutes.'],
  ['Predictions', 'Some jobs ask you to name your trick count first.'],
  ['Two divers and the drone', 'The drone is an extra hand you play for.']
];
const tutJ = i => TASKS[G.tasks[i].id].t;
const tutWho = i => { const o = G.tasks[i].owner; return o === viewSeat() ? 'your' : pname(o) + '\'s'; };
function tutTips() {   // id, when(), say() (one or two plain lines), until() keeps it up while true, later = line for the end card
  const T = () => G.trick, myTurn = () => G.phase === 'play' && iMustAct() && !UI.busy && !UI.fz;
  const led = () => T().plays.length ? suitOf(T().plays[0].c) : -1;
  return [
    { id: 'jobs', when: () => G.phase !== 'assign' && G.tasks.every(t => t.owner >= 0), until: () => G.phase !== 'play' || G.tricks.length === 0,
      say: () => 'Each job belongs to one diver. Win its tricks to meet it. Every job must be done.', later: 'A job is one diver\'s task; all jobs done wins the dive.' },
    { id: 'flare', when: () => G.phase === 'distress' && iMustAct() && !UI.busy, until: () => G.phase === 'distress',
      say: () => 'The flare lets the crew pass a card after a loss. Skip it today.', later: 'Distress flare: pass a card, costs an extra attempt.' },
    { id: 'ping', when: () => G.phase === 'signal' && iMustAct() && !UI.busy, until: () => G.phase === 'signal',
      say: () => 'No talking down here. Once per dive, show one card with a ping. Or skip.', later: 'Signals: one ping per dive, between tricks.' },
    { id: 'readping', when: () => G.pings.some(p => p.seat !== viewSeat()) && !UI.busy && !UI.fz, until: () => true,
      say: () => { const p = G.pings.find(p => p.seat !== viewSeat()); return pname(p.seat) + ' shows ' + cname(p.c) + '. Its token says highest, lowest or only of that colour.'; }, later: 'Reading a crewmate\'s ping token.' },
    { id: 'lead', when: () => myTurn() && T().plays.length === 0, until: () => G.phase === 'play' && T().plays.length === 0 && iMustAct(),
      say: () => (G.tricks.length === 0 ? 'The Captain leads. ' : 'You won, so you lead. ') + 'Play any card. Others must follow its colour.', later: 'The leader plays any card; the winner leads next.' },
    { id: 'follow', when: () => myTurn() && T().plays.length > 0 && led() < 4 && G.players[viewSeat()].hand.some(c => suitOf(c) === led()), until: () => myTurn() && T().plays.length > 0,
      say: () => pname(T().plays[0].s) + ' led ' + ['Coral', 'Tide', 'Kelp', 'Sunstar'][led()] + '. Follow it: dim cards are blocked. You need not win.', later: 'Follow the colour led if you can; never forced to win.' },
    { id: 'void', when: () => myTurn() && T().plays.length > 0 && !G.players[viewSeat()].hand.some(c => suitOf(c) === led()), until: () => myTurn() && T().plays.length > 0,
      say: () => 'No card of that colour: play anything. Only a Lantern can win.', later: 'No card of the colour led: play anything; Lanterns are trumps.' },
    { id: 'win', when: () => G.tricks.length > 0 && !UI.busy && !UI.fz, until: () => true,
      say: () => { const k = G.tricks[G.tricks.length - 1]; return pname(k.w) + ' wins with ' + cname(k.wc) + (suitOf(k.wc) === 4 ? ': a Lantern beats every colour. ' : ', the highest of the colour led. ') + 'The winner leads next.'; }, later: 'Highest card of the colour led wins the trick.' },
    { id: 'trump', when: () => G.tricks.some(k => suitOf(k.wc) === 4 && suitOf(k.plays[0].c) !== 4) && !UI.busy && !UI.fz, until: () => true,
      say: () => 'A Lantern beats every colour. Two Lanterns? The higher wins.', later: 'Lanterns are trumps and beat every colour.' },
    { id: 'last', when: () => myTurn() && G.tricks.length > 0 && T().plays.length > 0, until: () => myTurn(),
      say: () => 'Forgot the last trick? Tap Last to look again.', later: 'The Last button shows the previous trick.' }
  ];
}
function tutBegin() {
  UI.tc = { seen: {}, q: [], evi: G.events.length, cur: null, at: 0, ended: false, att: G.att, prologue: !!UI.tcPro };
  UI.tcT = setInterval(tutTick, 350);
  tutSkipBtn();
}
function tutSkipBtn() {
  if (document.getElementById('tskip')) return;
  const b = document.createElement('button'); b.id = 'tskip'; b.type = 'button'; b.textContent = 'Skip tutorial'; b.setAttribute('aria-label', 'Skip tutorial');
  b.addEventListener('click', () => { tutFinish({ skipped: 1 }); }); document.body.appendChild(b);
}
function tutBubble(t) {
  tutHideBub(); const e = document.createElement('div'); e.id = 'tbub'; e.setAttribute('role', 'status'); e.setAttribute('aria-live', 'polite'); e.dataset.tip = t.id; e.className = t.good ? 'good' : t.poor ? 'poor' : '';
  e.innerHTML = '<span class="tg" aria-hidden="true"><img class="tgp" src="media/camp-brack.webp" alt="" width="40" height="40"><br>Brack</span><span class="tx"></span><button type="button" class="tx2" aria-label="Dismiss">×</button>';
  e.querySelector('.tx').textContent = t.text; e.querySelector('.tx2').addEventListener('click', ev => { ev.stopPropagation(); tutHideBub(); });
  document.body.appendChild(e); t.ms = readMs(t.text); UI.tc.cur = t; UI.tc.at = Date.now(); tutPlaceBub();
}
function tutPlaceBub() {   // just under the rival seats, over the empty top of the table
  const e = document.getElementById('tbub'); if (!e) return; let bot = 54;
  document.querySelectorAll(innerWidth < 700 ? '#opp .seat, #opp .dc, #tskip' : '#tskip').forEach(x => { const r = x.getBoundingClientRect(); if (r.width && r.top < innerHeight * .4) bot = Math.max(bot, r.bottom); });
  e.style.top = Math.round(bot + 6) + 'px';
}
function tutHideBub() { const e = document.getElementById('tbub'); if (e) e.remove(); if (UI.tc) UI.tc.cur = null; }
function tutSay(t) { const C = UI.tc; if (!C || C.seen[t.id] && !t.again) return; C.seen[t.id] = 1; C.q.push(t); }
function tutTick() {
  const C = UI.tc; if (!C || UI.mode !== 'tutorial' || !G) { return; }
  if (!C.q) C.q = [];
  // reactions to what just happened (good / poor)
  while (C.evi < G.events.length) {
    const e = G.events[C.evi++];
    if (e.t === 'job' && e.st) {
      const own = G.tasks[e.i].owner;
      if (e.st > 0) C.q.push({ id: 'jd' + e.i + '_' + e.n, good: 1, text: 'Job done: ' + tutWho(e.i).replace(/^your$/, 'your') + ' "' + tutJ(e.i) + '". Green tick: it cannot fail now.' });
      else C.q.push({ id: 'jb' + e.i + '_' + e.n, poor: 1, text: 'Poor luck: ' + tutWho(e.i) + ' job "' + tutJ(e.i) + '" cannot be met now. One broken job loses the dive.' });
    }
  }
  if (!UI.busy && !UI.fz && G.phase !== 'over') for (const t of tutTips()) { if (!C.seen[t.id] && t.when()) { C.seen[t.id] = 1; C.q.push({ id: t.id, text: t.say(), until: t.until }); } }
  const age = Date.now() - C.at;
  if (C.cur && age > C.cur.ms) tutHideBub();   // a bubble stays 4 s + 1 s per 10 words, or until tapped away
  if (!C.cur && C.q.length && age > 600) { const t = C.q.shift(); if (!t.until || t.until() || t.good || t.poor) tutBubble(t); else delete C.seen[t.id]; }
  else if (C.cur) tutPlaceBub();
  if (G.phase === 'over' && UI.overShown && !UI.busy && !UI.fz && !C.ended && !C.q.length && (!C.cur || age > C.cur.ms)) tutEnd();
}
// ---------------------------------------------------------------- the end: the scoring, rule by rule, with the real numbers
function tutEnd() {
  const C = UI.tc; C.ended = true; tutHideBub(); try { GXT.markDone(TUT_GAME); } catch (e) { }
  const R = G.result, ok = R.ok, mine = G.tricks.filter(k => k.w === viewSeat()).length;
  const later = []; tutTips().forEach(t => { if (!C.seen[t.id] || (t.id === 'trump' && !C.seen.trump)) later.push(t.later); }); const lr = Array.from(new Set(later)).filter(Boolean);
  UI.tc.later = lr.concat(TUT_LATER.map(x => x[0] + ': ' + x[1]));
  const rows = G.tasks.map((t, i) => '<li class="' + (R.tasks[i] > 0 ? 'ok' : R.tasks[i] < 0 ? 'bad' : '') + '"><b>' + (R.tasks[i] > 0 ? '✓ ' : R.tasks[i] < 0 ? '✗ ' : '• ') + '</b>' + (t.owner === viewSeat() ? 'Your' : pname(t.owner) + '\'s') + ' job: ' + TASKS[t.id].t + (R.tasks[i] < 0 && R.det && R.det[i] ? '<br><i>' + R.det[i] + '</i>' : '') + '</li>').join('');
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0], pro = !!(UI.tc.prologue && first);
  const c = document.createElement('div'); c.className = 'gxt-end'; c.id = 'tend'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true'); c.setAttribute('aria-label', 'Tutorial finished');
  c.innerHTML = '<div class="gxt-endc"><div class="gxt-ek" aria-hidden="true">' + (ok ? '✓' : '✗') + '</div><div class="gxt-et">' + (ok ? 'Nets free! Dive won' : 'The dive failed') + '</div>' +
    '<div class="gxt-ex">' + (ok ? 'Both jobs were done' + (G.tricks.length < G.ntr ? ' after trick ' + G.tricks.length + ', so the dive ended at once. Cards left in hand do not matter.' : '.') : String(R.why || 'A job could not be met.').replace(/:\s+/, '. ')) + ' You won ' + mine + ' of ' + G.tricks.length + ' tricks. There are no points: the crew wins together or loses together.</div>' +
    '<ul class="tjobs">' + rows + '</ul>' +
    '<details class="tlater"><summary>Things you\'ll meet later</summary><ul>' + UI.tc.later.map(x => '<li>' + x + '</li>').join('') + '</ul></details>' +
    '<div class="gxt-eb">' + (ok ? (pro ? '<button type="button" class="gxt-b pri" data-te="chapter">Start chapter 1</button>' : '<button type="button" class="gxt-b pri" data-te="play">Play a real game</button><button type="button" class="gxt-b" data-te="story">Story mode</button>') : '<button type="button" class="gxt-b pri" data-te="again">Dive again</button><button type="button" class="gxt-b" data-te="play">Finish tutorial</button>') + '</div></div>';
  c.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-te]'); if (!b) return; const k = b.dataset.te; c.remove(); if (k === 'again') { C.ended = false; C.q = []; C.evi = 0; nextAttempt(true); C.evi = G.events.length; } else tutFinish({ choice: k }); });
  document.body.appendChild(c);
}
function tutFinish(r) {
  const C = UI.tc; const pro = C && C.prologue; try { GXT.markDone(TUT_GAME); } catch (e) { }
  tutLeave(); const c = r && r.choice, first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
  else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
  else { showStart(); UI.sv = 'setup'; UI.cfgOpen = false; renderStart(); }
}
// ---------------------------------------------------------------- the kit hooks
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  o = o && o.prologue ? o : null;
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    setup: () => { try { GX.close(); } catch (e) { } try { GXC.close(); } catch (e) { } closePop(true); newGame('tutorial'); UI.tcPro = !!o; },
    onDone: () => { },
    onExit: () => { tutLeave(); showStart(); }
  });
}
function tutLeave() {
  clearInterval(UI.tcT); UI.tc = null; UI.tcPro = false; ['tbub', 'tend', 'tskip'].forEach(i => { const e = document.getElementById(i); if (e) e.remove(); });
  clearTimeout(UI.tm); UI.seq++; UI.busy = false; UI.fz = null; UI.rq = []; UI.cards = []; UI.started = false;
  try { GXT.stop(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { const f = $('#finger'); if (f) f.hidden = true; } catch (e) { }
}
