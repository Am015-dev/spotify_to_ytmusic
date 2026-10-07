// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer diver's own choice for you (LD.AI.choose, the same one that plays the
// computer seats) + a short why + rules cards. Where the advisor has no safe call (signals, votes, passing) the bulb shows only the rules cards.
// ---------------------------------------------------------------- pictures for the rules cards (the real card art plus small SVGs)
const HP = {
  c: (s, v) => { try { return KIT.cardSVG(D.card(s, v), { w: 56 }); } catch (e) { return ''; } },
  lan: (v) => { try { return KIT.cardSVG(D.card(4, v), { w: 56 }); } catch (e) { return ''; } },
  ping: (k) => { try { return KIT.pingSVG({ size: 64, k }); } catch (e) { return ''; } },
  flare: () => { try { return KIT.flareSVG({ size: 64, on: true }); } catch (e) { return ''; } },
  drone: () => { try { return KIT.droneSVG({ size: 64 }); } catch (e) { return ''; } },
  job: () => '<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="6" fill="#fff6dd" stroke="#0b1f3a" stroke-width="3"/><path d="M18 20h28M18 30h28M18 40h16" stroke="#1d4a93" stroke-width="3.5" stroke-linecap="round"/><circle cx="46" cy="46" r="5" fill="#f1b82e" stroke="#0b1f3a" stroke-width="2"/></svg>',
  tick: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#3fa86d" stroke="#0b1f3a" stroke-width="3"/><path d="M19 33l9 9 17-20" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#c4473d" stroke="#0b1f3a" stroke-width="3"/><path d="M21 21l22 22M43 21L21 43" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>',
  crown: () => '<svg viewBox="0 0 64 64"><path d="M8 48h48l-4-28-13 12-7-19-7 19-13-12z" fill="#ffd873" stroke="#0b1f3a" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="48" width="48" height="6" rx="2" fill="#e0a31c" stroke="#0b1f3a" stroke-width="2"/></svg>',
  hand: () => '<svg viewBox="0 0 64 64"><rect x="8" y="22" width="24" height="34" rx="4" fill="#fff6dd" stroke="#0b1f3a" stroke-width="3" transform="rotate(-14 20 39)"/><rect x="20" y="16" width="24" height="34" rx="4" fill="#fff6dd" stroke="#0b1f3a" stroke-width="3"/><rect x="32" y="22" width="24" height="34" rx="4" fill="#fff6dd" stroke="#0b1f3a" stroke-width="3" transform="rotate(14 44 39)"/></svg>',
  vote: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="20" r="11" fill="#9fd0ff" stroke="#0b1f3a" stroke-width="3"/><path d="M12 56c2-17 10-22 20-22s18 5 20 22z" fill="#9fd0ff" stroke="#0b1f3a" stroke-width="3" stroke-linejoin="round"/><path d="M26 22l5 5 9-10" fill="none" stroke="#0b1f3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  num: (n) => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#ffe9a6" stroke="#0b1f3a" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="32" font-weight="800" fill="#0b1f3a" font-family="Georgia,serif">' + n + '</text></svg>'
};
function hpics(items) { return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' : '<figure>' + (HP[it[0]] ? HP[it[0]](it[2], it[3]) : '') + (it[1] ? '<figcaption>' + it[1] + '</figcaption>' : '') + '</figure>').join('') + '</div>'; }
// ---------------------------------------------------------------- where each bubble points
const hq = s => () => document.querySelector(s);
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const HLP_STEPS = {
  jobs: { target: hfirst('#pool .jcard.glow', '#acts .btn'), title: 'Pick a job', text: 'Tap a glowing job card. Choose one your own cards can win.', pic: () => HP.job() },
  jobsAsk: { target: hfirst('#acts .btn.go', '#acts .btn'), title: 'Your choice', text: 'Answer with a button below. Each button says what happens next.', pic: () => HP.job() },
  vote: { target: hfirst('.seat.glow', '.me.glow'), title: 'Vote for a diver', text: 'Tap the diver who should take every job. You may pick yourself.', pic: () => HP.vote() },
  flare: { target: hfirst('#acts [data-a=dist]'), title: 'Distress flare?', text: 'Optional. Pass cards to a neighbour, or tap the skip button.', pic: () => HP.flare() },
  pass: { target: hfirst('#hand .hc.glow', '#hand .hc'), title: 'Pass a card', text: 'Tap a colour card to pass to your neighbour. Lanterns cannot go.', pic: () => HP.c(1, 5) },
  predict: { target: hfirst('#acts .btn'), title: 'Predict your tricks', text: 'Tap how many tricks you will win. The job needs exactly that many.', pic: () => HP.num('?') },
  signal: { target: hfirst('.pspot', '#acts [data-a=nosig]'), title: 'Signal your crew', text: 'Tap a ping spot to show one card, or tap No signal.', pic: () => HP.ping('') },
  lead: { target: hfirst('#hand .hc.glow', '#hand .hc'), title: 'You lead', text: 'Tap a glowing card to play it. Everyone follows its colour.', pic: () => HP.c(0, 7) },
  follow: { target: hfirst('#hand .hc.glow', '#hand .hc'), title: 'Follow the colour', text: 'Play the colour that was led. Dim cards are blocked. Highest of that colour wins.', pic: () => HP.c(1, 6) },
  free: { target: hfirst('#hand .hc.glow', '#hand .hc'), title: 'Play anything', text: 'You have none of that colour. Play any card. A Lantern wins the trick.', pic: () => HP.lan(2) },
  drone: { target: hfirst('#opp .dc.can', '#opp .dc'), title: 'Play for the drone', text: 'The drone is on your team. Tap one of its glowing cards.', pic: () => HP.drone() }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES = [
  { title: 'The goal', text: 'The whole crew wins or loses together. Finish every job card and the dive is won.', pic: () => hpics([['job', 'Jobs'], '>', ['tick', 'All done'], '>', ['crown', 'Win']]) },
  { title: 'A trick', text: 'Each diver plays one card. The highest card of the colour led wins, unless a Lantern is played.', pic: () => hpics([['c', 'Led', 0, 4], ['c', '', 0, 8], ['c', 'Wins', 0, 9]]) },
  { phase: 'jobs', title: 'One job, one diver', text: 'Each job card is a task for one diver. It is done by the tricks that diver wins.', pic: () => hpics([['job', 'Job'], '>', ['vote', 'One diver']]) },
  { phase: 'jobs', title: 'Done or broken', text: 'A job is done when it is met and can no longer fail. One broken job ends the dive.', pic: () => hpics([['tick', 'Done'], ['cross', 'Dive over']]) },
  { phase: 'jobs', title: 'The Commander', text: 'The Commander holds Lantern 4 and picks first. Jobs marked with a crossed circle are not for them.', pic: () => hpics([['lan', 'Commander', 4], '>', ['job', 'Picks first']]) },
  { phase: 'jobsAsk', title: 'Who takes the jobs?', text: 'This dive lets the crew choose. The Commander may keep every job, or offer them to others.', pic: () => hpics([['crown', 'Commander'], '>', ['job', 'Jobs']]) },
  { phase: 'jobsAsk', title: 'Yes or no', text: 'Yes means you take the jobs on. No leaves them for someone else.', pic: () => hpics([['tick', 'Yes'], ['cross', 'No']]) },
  { phase: 'jobsAsk', title: 'Done or broken', text: 'A job is done when it is met and can no longer fail. One broken job ends the dive.', pic: () => hpics([['tick', 'Done'], ['cross', 'Dive over']]) },
  { phase: 'vote', title: 'Vote', text: 'The team agrees on one diver to take every job. Tap your vote. You may vote for yourself.', pic: () => hpics([['vote', 'Your vote'], '>', ['job', 'All jobs']]) },
  { phase: 'vote', title: 'No card talk', text: 'You may talk about the plan, but never about which cards you hold.', pic: () => hpics([['hand', 'Hidden'], ['cross', 'No talk']]) },
  { phase: 'flare', title: 'The distress flare', text: 'Optional, before signals: every diver passes one colour card to a neighbour.', pic: () => hpics([['flare', 'Flare'], '>', ['c', 'Pass', 2, 5]]) },
  { phase: 'flare', title: 'Left or right', text: 'Everyone passes the same way. Lanterns can never be passed.', pic: () => hpics([['c', 'Left', 3, 3], ['lan', 'Never', 3]]) },
  { phase: 'flare', title: 'It costs a try', text: 'In the logbook, lighting the flare counts as one extra attempt. Skipping it is fine.', pic: () => hpics([['flare', 'Flare'], '>', ['num', 'Extra try', '+1']]) },
  { phase: 'pass', title: 'Pass a card', text: 'Pick one colour card to pass to your neighbour. Lanterns cannot be passed.', pic: () => hpics([['c', 'Pass', 2, 6], '>', ['vote', 'Neighbour']]) },
  { phase: 'pass', title: 'Pass to help', text: 'Give a card your neighbour\'s jobs need. Keep the cards your own jobs need.', pic: () => hpics([['job', 'Their job'], '>', ['c', 'Give', 1, 8]]) },
  { phase: 'predict', title: 'An exact count', text: 'This job needs you to win exactly the number of tricks you predicted.', pic: () => hpics([['num', 'Predict', 2], '>', ['tick', 'Exactly 2']]) },
  { phase: 'predict', title: 'Count your strength', text: 'High cards and Lanterns win tricks. Few of them? Predict a low number.', pic: () => hpics([['lan', 'Wins', 3], ['c', 'Wins', 0, 9], ['c', 'Loses', 0, 2]]) },
  { phase: 'signal', title: 'The ping', text: 'Once per dive you may show one colour card to the crew. It stays in your hand.', pic: () => hpics([['c', 'Your card', 1, 9], '>', ['ping', 'Shown', 'top']]) },
  { phase: 'signal', title: 'Highest, lowest, only', text: 'You may show only your highest, lowest or only card of a colour. The token says which.', pic: () => hpics([['ping', 'Highest', 'top'], ['ping', 'Only', 'mid'], ['ping', 'Lowest', 'bot']]) },
  { phase: 'signal', title: 'Between tricks only', text: 'Signals come between tricks, never in the middle of one. Lanterns can never be shown.', pic: () => hpics([['lan', 'Never', 2], ['ping', 'Between tricks', 'mid']]) },
  { phase: 'lead', title: 'Leading a trick', text: 'Lead any card. Its colour is the colour everyone else must follow if they can.', pic: () => hpics([['c', 'You lead', 0, 5], '>', ['c', 'Follow', 0, 8]]) },
  { phase: 'lead', title: 'Who wins a trick', text: 'The highest card of the led colour wins. Other colours never win. The winner leads next.', pic: () => hpics([['c', 'Led', 2, 4], ['c', 'Higher', 2, 9], ['c', 'Never wins', 1, 9]]) },
  { phase: 'lead', title: 'Lanterns are trumps', text: 'A Lantern beats every colour. With several Lanterns, the highest Lantern wins.', pic: () => hpics([['c', 'Colour', 3, 9], ['lan', 'Beats it', 2]]) },
  { phase: 'lead', title: 'Show a card (ping)', text: 'Between tricks, once per dive, you may show your highest, lowest or only card of a colour.', pic: () => hpics([['c', 'Colour card', 1, 9], '>', ['ping', 'Ping', 'top']]) },
  { phase: 'follow', title: 'Follow the colour', text: 'If you hold the colour that was led, you must play it. Dim cards are not allowed.', pic: () => hpics([['c', 'Led', 1, 4], '>', ['c', 'You play', 1, 7]]) },
  { phase: 'follow', title: 'You never have to win', text: 'The highest card of the led colour wins. Play low to let a teammate win.', pic: () => hpics([['c', 'Low', 1, 2], ['c', 'High', 1, 9]]) },
  { phase: 'follow', title: 'Lanterns are trumps', text: 'A Lantern beats every colour. With several Lanterns, the highest Lantern wins.', pic: () => hpics([['c', 'Colour', 1, 9], ['lan', 'Beats it', 1]]) },
  { phase: 'free', title: 'None of that colour', text: 'You may play any card. A different colour can never win the trick.', pic: () => hpics([['c', 'Led', 0, 6], '>', ['c', 'Never wins', 2, 9]]) },
  { phase: 'free', title: 'Lanterns are trumps', text: 'Play a Lantern and you win the trick, unless someone plays a higher Lantern.', pic: () => hpics([['lan', 'Wins', 3], ['crown', 'The trick']]) },
  { phase: 'free', title: 'Save your strength', text: 'Play a card your jobs do not need. Keep what your jobs need for later.', pic: () => hpics([['c', 'Spare', 3, 1], ['job', 'Keep for it']]) },
  { phase: 'drone', title: 'The drone', text: 'With two divers, a drone joins as an extra player. You play its cards for it.', pic: () => hpics([['drone', 'Drone'], '>', ['hand', 'You play it']]) },
  { phase: 'drone', title: 'It follows the colour', text: 'The drone follows the colour led like anyone else. Blocked cards are dimmed.', pic: () => hpics([['c', 'Led', 2, 3], '>', ['drone', 'Follows']]) }
];
// ---------------------------------------------------------------- phases
// the phase the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || UI.busy || UI.fz || UI.dlg || UI.cards.length || UI.pop || UI.tip || (GX && GX.open)) return null;
    const st = $('#start'), rs = $('#rs'); if ((st && !st.hidden) || (rs && !rs.hidden)) return null;
    const v = viewSeat(); if (v < 0 || !iMustAct() || !myMoves().length) return null;
    if (hotSeat() && UI.holder < 0 && G.phase !== 'distress') return null;
    switch (G.phase) {
      case 'assign': { const m = G.as.mode; return m === 'vote' ? 'vote' : (m === 'cmd' || m === 'vol') ? 'jobsAsk' : 'jobs'; }
      case 'distress': return 'flare';
      case 'pass': return 'pass';
      case 'predict': return 'predict';
      case 'signal': return 'signal';
      case 'play': {
        const T = G.trick, turn = T.turn; if (ctlSeat(turn) !== v) return null;
        if (G.players[turn].helper) return 'drone';
        if (!T.plays.length) return 'lead';
        return G.players[turn].hand.some(c => suitOf(c) === T.ls) ? 'follow' : 'free';
      }
    }
  } catch (e) { }
  return null;
}
// ---------------------------------------------------------------- the bulb: the computer diver's choice for you
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); return w.length <= n ? w.join(' ') : ''; }
function hlpPlayWhy(v, c) {
  let w = ''; try { w = LD.AI.why(G, v, c) || ''; } catch (e) { }
  w = String(w).replace(/\s*\([^)]*\)/g, '').trim();
  const parts = w.split(/;\s*/).map(s => s.replace(/[.\s]+$/, '').trim()).filter(Boolean);
  let best = '';
  for (let k = parts.length; k >= 1 && !best; k--) { const t = capW(parts.slice(0, k).join('; '), 15); if (t) best = t; }
  if (!best) best = capW(parts[0], 15);
  if (!best) return 'This card suits your jobs best right now.';
  return best.charAt(0).toUpperCase() + best.slice(1) + '.';
}
// one planFor() gives the move, the card to pick up and where it goes: the finger, the glow and the bulb all use it
function hlpPlan() {
  const v = viewSeat(); if (!canAct() || !iMustAct() || G.phase === 'over') return null;
  let m = null;
  if (G.phase === 'play' && UI.mode === 'guided' && tutOnly() >= 0) m = { t: 'play', c: tutOnly(), tut: 1 };
  else { try { m = LD.AI.choose(G, v, 'normal'); } catch (e) { m = null; } }
  if (!m) return null;
  if (!myMoves().some(x => x.t === m.t && x.c === m.c && x.i === m.i && x.on === m.on && x.dir === m.dir)) return null;   // never advise an illegal move
  if (G.phase === 'play' && m.t === 'play') {
    const T = G.trick; if (G.players[T.turn].helper || ctlSeat(T.turn) !== v) return null;
    const card = () => document.querySelector('#hand .hc[data-id="' + m.c + '"]'), slot = () => document.querySelector('.tslot[data-seat="' + v + '"]') || document.querySelector('#felt');
    return { m, from: card, to: slot, why: () => m.tut ? 'The training dive wants this card now.' : hlpPlayWhy(v, m.c) };
  }
  if (G.phase === 'assign' && m.t === 'take') {
    const el = () => document.querySelector('#pool [data-key="job' + m.i + '"]');
    return { m, to: el, why: () => G.as.mode === 'hardfirst' ? 'This dive says: take the hardest job first.' : 'Your hand suits this job better than the others.' };
  }
  if (G.phase === 'distress' && m.t === 'dist') {
    const el = () => document.querySelector('#acts [data-a=dist][data-on="' + (m.on ? 'true' : 'false') + '"]' + (m.on ? '[data-dir="' + m.dir + '"]' : ''));
    return { m, to: el, why: () => m.on ? 'Earlier tries failed: the flare lets the crew swap cards.' : 'No flare needed on this attempt.' };
  }
  return null;
}
function hlpSuggest() {
  const p = hlpPlan(); if (!p || !p.to || !p.to()) return null;
  const why = p.why(); if (!why || capW(why, 15) === '') return null;
  return { why, key: p.m.t + ':' + (p.m.c !== undefined ? p.m.c : p.m.i !== undefined ? p.m.i : p.m.on), target: p.to, from: p.from && p.from() ? p.from : null };
}
// ---------------------------------------------------------------- wiring
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'lantern-dive', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '.glow,.pspot,#acts .btn,#opp .dc,#hand .hc,.me,.seat,.jcard,.gx-ibtn' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() { hlpInit(); if (typeof GXH === 'undefined') return; GXH.phase(hlpPhase()); }
