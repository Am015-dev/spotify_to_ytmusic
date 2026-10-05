// ===================== part 4: guide tips, pop-ups (job, diver, last trick) and the result card =====================
// ---------- tips: one at a time, never stacked; the guided dive shows all of them, other dives each tip once per device ----------
const TIPS = [
  { id: 'welcome', when: () => UI.mode === 'guided' && G.phase === 'assign' && G.tricks.length === 0, title: 'Welcome aboard', body: 'Your team wins or loses together. Each job card is a task for ONE diver. Do every job and the dive is won.', btn: 'Next' },
  { id: 'commander', when: () => G.phase === 'assign' && G.cap >= 0, title: () => G.cap === viewSeat() ? 'You are the Commander' : pname(G.cap) + ' is the Commander', body: () => (G.cap === viewSeat() ? 'You hold Lantern 4, the strongest card, so you pick a job first and lead the first trick.' : pname(G.cap) + ' holds Lantern 4, so picks a job first and leads the first trick.') + ' The gold badge on an avatar marks the Commander.' },
  { id: 'pickjob', when: () => G.phase === 'assign' && iMustAct() && UI.mode !== 'net' && !G.players[G.as.actor].helper && G.as.mode === 'draft', title: 'Pick a job', body: 'Tap a job card, then "Take this job". Pick one your cards can do.' },
  { id: 'flare', when: () => G.phase === 'distress' && iMustAct(), title: 'Distress flare (optional)', body: 'Light it and everyone passes one card to a neighbour. It costs one extra attempt in the logbook. "No flare" is fine.' },
  { id: 'signal', when: () => G.phase === 'signal' && iMustAct(), title: 'Signal (optional)', body: 'Once per dive you may show the team one card: your highest, lowest or only card of a colour. Or skip.' },
  { id: 'gplan', when: () => UI.mode === 'guided' && G.phase === 'play' && G.tricks.length === 0 && iMustAct() && G.trick.plays.length === 0, title: 'Your plan', body: 'Your job: win the Lantern 3. You also hold Lantern 4, so it is safe. First play a few colour cards to see how tricks work. The dive ends the moment your job is done.' },
  { id: 'lead', when: () => UI.mode === 'guided' && G.phase === 'play' && iMustAct() && G.trick.plays.length === 0 && !G.players[G.trick.turn].helper, title: 'You lead', body: 'Tap a card, then Play. Everyone plays one card; the highest card of the colour you led wins the trick.' },
  { id: 'follow', when: () => G.phase === 'play' && iMustAct() && G.trick.plays.length > 0 && !G.players[G.trick.turn].helper && LD.playable(G, G.trick.turn).length < G.players[G.trick.turn].hand.length, title: 'Follow the colour', body: 'You must play the colour that was led if you have it (dim cards are not allowed). You never have to win.' },
  { id: 'nofollow', when: () => G.phase === 'play' && iMustAct() && G.trick.plays.length > 0 && G.trick.ls < 4 && !G.players[G.trick.turn].helper && !G.players[G.trick.turn].hand.some(c => suitOf(c) === G.trick.ls), title: 'None of that colour', body: 'Play anything. Another colour never wins; a Lantern always does.' },
  { id: 'trump', when: () => G.phase === 'play' && G.trick.plays.some(p => suitOf(p.c) === 4) || (UI.fz && UI.fz.plays.some(p => suitOf(p.c) === 4)), title: 'Lanterns are trumps', body: 'A Lantern beats every colour. With several Lanterns the highest wins.' },
  { id: 'won', when: () => UI.mode === 'guided' && G.tricks.length >= 1 && G.phase === 'play' && !UI.busy && iMustAct(), title: 'The winner leads next', body: () => 'Whoever wins a trick leads the next one. The line above the buttons tells you who won and why.' },
  { id: 'jobdone', when: () => G.phase === 'play' && G.tasks.some((t, i) => jobSt(i) > 0) && !UI.busy, title: 'A job is done', body: 'Green tick = done for good. A red cross would end the dive.' }
];
function seen(id) { return !!UI.coach.seen[id]; }
function markSeen(id) { UI.coach.seen[id] = 1; if (UI.coach.level !== 'full') { try { const s = JSON.parse(lsGet('ld_tips') || '{}'); s[id] = 1; lsSet('ld_tips', JSON.stringify(s)); } catch (e) { } } }
function seenEver(id) { try { return !!JSON.parse(lsGet('ld_tips') || '{}')[id]; } catch (e) { return false; } }
function coachCheck() {
  return; // no tip cards: play happens on the board
  if (!G || !UI.started || UI.coach.level === 'off' || UI.tip || UI.cards.length || UI.dlg) return;
  if (UI.busy || (G.phase === 'play' && UI.fz)) return;
  if (viewSeat() < 0) return;
  const light = UI.coach.level === 'light';
  for (const t of TIPS) {
    if (UI.coach.seen[t.id]) continue; if (light && seenEver(t.id)) continue;
    if (light && !['commander', 'pickjob', 'flare', 'signal', 'follow', 'nofollow', 'trump', 'jobdone'].includes(t.id)) continue;
    let ok = false; try { ok = t.when(); } catch (e) { }
    if (!ok) continue;
    const title = typeof t.title === 'function' ? t.title() : t.title, body = typeof t.body === 'function' ? t.body() : t.body;
    UI.tip = { id: t.id, title, body, btn: t.btn || 'Got it' }; renderTip(); return;
  }
}
function tipOk() { if (!UI.tip) return; markSeen(UI.tip.id); UI.tip = null; renderTip(); schedule(); coachCheck(); }
// ---------- pop-ups inside the dock ----------
function closePop() { UI.pop = null; document.documentElement.classList.remove('popon'); const p = $('#ppop'); if (p) { p.hidden = true; p.innerHTML = ''; p.removeAttribute('aria-modal'); } }
function openPop(title, sub, body) {
  const p = $('#ppop'); if (!p) return; UI.pop = { title }; document.documentElement.classList.add('popon');
  p.innerHTML = ''; p.hidden = false;
  p.append(h('div.ph-head', h('div.ph-t', h('b', title), sub ? h('span', sub) : null), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), h('div.ph-body', body));
  p.setAttribute('aria-modal', 'true'); clearTimeout(UI.popT); UI.popT = setTimeout(closePop, 7000);
}
function openJob(i) {
  if (!G || !G.tasks[i]) return; const t = G.tasks[i], d = TASKS[t.id], st = jobSt(i);
  const kids = [h('p', d.t)];
  kids.push(h('div.kv', h('span', 'Taken by'), h('b', t.owner >= 0 ? pname(t.owner) : 'nobody yet')));
  kids.push(h('div.kv', h('span', 'Difficulty (' + G.np + ' divers)'), h('b', jobDiff(i))));
  kids.push(h('div.kv', h('span', 'State'), h('b', st > 0 ? 'Done' : st < 0 ? 'Failed' : 'Open')));
  if (d.k === 'pred' && t.pn >= 0) kids.push(h('div.kv', h('span', 'Prediction'), h('b', d.open || G.phase === 'over' || ctlSeat(t.owner) === viewSeat() ? (t.pn === -2 ? 'secret' : t.pn) : 'secret')));
  if (!d.cap) kids.push(h('p.sm', 'The Commander may not take this job.'));
  kids.push(h('p.sm', hintFor(d)));
  openPop(d.s, 'Job card', kids);
}
function hintFor(d) {
  const k = d.k;
  if (k === 'cmp') return 'Count the tricks each diver wins. Ties do not count as more or fewer.';
  if (k === 'cards') return 'You win a card by winning the trick it is in.';
  if (k === 'with') return 'The card you play to win the trick has to be a colour card of that number.';
  if (k === 'pos') return 'The first trick is the first one played; the last is the final one of the dive.';
  if (k === 'pred') return 'Aim for exactly your number of tricks at the end.';
  if (k === 'subx') return 'Lanterns you win count: every Lantern in a trick you win.';
  if (k === 'avoidc' || k === 'avoidv' || k === 'avoidsub') return 'Cards in tricks you win count as won, even the ones other divers played.';
  return 'All cards in the tricks you win count as won by you.';
}
function openSeat(s) {
  if (!G) return; const p = G.players[s], kids = [];
  kids.push(h('div', { style: 'display:flex;gap:10px;align-items:center' }, h('span.av56', { style: 'width:56px;height:56px;flex:0 0 56px;display:block', html: avatarS(s, 96) }), h('div', h('b', p.name + (s === G.cap ? ' (Commander)' : '')), h('div.sm', p.helper ? 'The drone: ' + pname(G.cap) + ' flies it and decides without talking.' : (p.ai ? 'Computer diver (' + p.ai + ')' : (NET.on && s === NET.mySeat ? 'You' : 'Diver'))))));
  kids.push(h('div.kv', h('span', 'Cards in hand'), h('b', p.hand.length)));
  kids.push(h('div.kv', h('span', 'Tricks won'), h('b', tricksWon()[s])));
  if (!p.helper) kids.push(h('div.kv', h('span', 'Ping'), h('b', G.comm === 'none' ? 'No signalling in this dive' : G.comm === 'narc' ? 'Shared pool: ' + G.pool + ' left' : (p.pingUsed ? 'Used' : 'Ready'))));
  const sh = shownBy(s); sh.forEach(x => kids.push(h('div.kv', h('span', 'Showed'), h('b', cname(x.c) + (x.k === 'high' ? ' (highest)' : x.k === 'low' ? ' (lowest)' : x.k === 'only' ? ' (only one)' : '')))));
  const js = jobs(s); kids.push(h('h4', { style: 'margin:6px 0 0' }, js.length ? 'Jobs' : 'No jobs'));
  js.forEach(i => kids.push(h('div.rjob' + (jobSt(i) > 0 ? '.ok' : jobSt(i) < 0 ? '.bad' : ''), h('span.mk', { html: jobSt(i) > 0 ? KIT.iconSVG('tick', 22) : jobSt(i) < 0 ? KIT.iconSVG('cross', 22) : KIT.iconSVG('list', 22) }), h('span', jobText(i)))));
  openPop(p.name, 'Diver', kids);
}
function openLast() {
  if (!G || !G.tricks.length) return; const k = G.tricks[G.tricks.length - 1];
  const row = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center' });
  k.plays.forEach(p => row.append(h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:3px;font-size:13px;font-weight:800' }, h('div', { style: 'width:62px;height:87px', html: cardS(p.c, 62) }), pname(p.s) + (p.s === k.w ? ' ★' : ''))));
  openPop('Last trick', 'Trick ' + (k.n + 1), [row, h('p', pname(k.w) + ' won it with ' + cname(k.wc) + '.'), h('p.sm', 'Only the most recent trick can be looked at again.')]);
}
// ---------- the result card ----------
function showResult() {
  if (!G || G.phase !== 'over' || UI.overShown) return; UI.overShown = true;
  try { Prog.ended(G); } catch (e) { console.error(e); }
  clearInterval(UI.clk);
  const rs = $('#rs'); rs.hidden = false; rs.innerHTML = ''; UI.rsOpen = true;
  const R = G.result, ok = R.ok, m = G.mission, p = Prog.load();
  const box = h('div.rsbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': ok ? 'Dive complete' : 'Dive failed' });
  box.append(ok ? h('div.win', h('span', { html: KIT.iconSVG('star', 34) }), h('span', 'Dive complete!')) : h('div.lose', h('span', { html: KIT.iconSVG('cross', 30) }), h('span', 'The dive failed.')));
  if (!ok && R.why) box.append(h('p', R.why));
  if (ok && G.tricks.length < G.ntr && G.mission.id !== 27) box.append(h('p.sm', 'Every job was done after trick ' + G.tricks.length + ', so the dive ended at once. Cards still in hand do not matter.'));
  box.append(h('p.sm', diveLabel() + (UI.mode === 'descent' ? '' : ' · attempt ' + G.att) + (G.distress ? ' · distress flare lit (+1)' : '')));
  // done = tick; broken = cross + which trick, card and diver broke it; never broken (the dive stopped for another reason) = "not finished"
  G.tasks.forEach((t, i) => {
    const st = R.tasks[i], det = R.det && R.det[i], nb = ok || st > 0 ? '' : st < 0 ? (det || 'It could not be met by the end of the dive.') : 'Not finished: the dive ended first.';
    box.append(h('div.rjob' + (st > 0 ? '.ok' : st < 0 ? '.bad' : '.open'), h('span.mk', { html: st > 0 ? KIT.iconSVG('tick', 24) : st < 0 ? KIT.iconSVG('cross', 24) : '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12H18"/></svg>' }), h('span', h('b', pname(t.owner) + ': '), jobText(i), nb ? h('small.why', nb) : null)));
  });
  if (!ok && !guidedWon()) box.append(h('p.sm', 'Tip: the red cross marks the job that broke the dive. Grey jobs were still open.'));
  if (ok && UI.mode === 'guided') guidedDebrief(box);
  if (m.kind === 'log') {
    if (ok) { const n = p.done[m.id]; box.append(h('p', 'Logged in your logbook: dive ' + m.id + ' done in ' + n + ' attempt' + (n === 1 ? '' : 's') + (p.flare[m.id] ? ' (the flare counts one).' : '.'))); }
    else box.append(h('p.sm', 'Attempts so far on this dive: ' + (p.tries[m.id] || 0) + '. If the jobs could not be done from the start, try with new jobs.'));
  } else if (m.kind === 'deep' && ok) box.append(h('p', 'Deep dive ' + m.d + ' complete. The next one is difficulty ' + (m.d + 1) + '.'));
  if (UI.camp && typeof GXC !== 'undefined' && GXC.active()) { campResult(box, ok); rs.append(box); snd(ok ? 'win' : 'lose'); return; }
  if (UI.mode === 'descent') { descResult(box, ok); rs.append(box); snd(ok ? 'win' : 'lose'); return; }
  const bt = h('div.cbtns');
  const host = !NET.on || isHost();
  if (ok) {
    if (UI.mode === 'guided') bt.append(h('button.btn.go', { 'data-a': 'descgo', type: 'button' }, 'Start The Descent'));
    else if (host && m.kind === 'log' && m.id < 32) bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Next dive'));
    else if (host && m.kind === 'log') bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Deep dive ' + D.deep.start));
    else if (host && m.kind === 'deep') bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Next: deep dive ' + (m.d + 1)));
    else if (host) bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Play again'));
  } else if (host) {
    bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Try again (same jobs)'));
    bt.append(h('button.btn', { 'data-a': 'retrynew', type: 'button' }, 'Try again (new jobs)'));
  }
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  bt.append(h('button.btn.alt', { 'data-a': NET.on ? 'netopen' : 'menu', type: 'button' }, NET.on ? 'Lobby' : 'Menu'));
  box.append(bt); rs.append(box); snd(ok ? 'win' : 'lose');
}
function guidedWon() { return UI.mode === 'guided' && G && G.result && G.result.ok; }
function guidedDebrief(box) {
  const me = viewSeat(), mine = tricksWon()[me >= 0 ? me : 0] || 0;
  box.append(h('div.debrief', h('b', 'What you just learned'), h('ul',
    h('li', 'A job card tells ONE diver what to do with the tricks that diver wins. Yours: win the Lantern 3.'),
    h('li', 'Lanterns are trumps: any Lantern beats every colour, and the highest Lantern wins. You held the two highest, so the job was safe.'),
    h('li', 'The whole team wins when every job is done, and the dive ends at once. It took ' + G.tricks.length + ' trick' + (G.tricks.length === 1 ? '' : 's') + ' and you won ' + mine + '.'),
    h('li', 'Next dives have jobs for every diver. Watch the job chips under each name, and use the signal token to tell your team one card you hold.'))),
    h('div.say', h('span.dpt', { html: portraitSVG('mara', 52) }), h('p', h('b', 'Mara: '), 'You are ready. Now take on The Descent: four zones, and a boss at the bottom of each.')));
}
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; }
function nextDive() {
  if (!G || G.phase !== 'over' || NET.on && !isHost()) return;
  const m = G.mission; const o = Object.assign({}, UI.opt || {});
  if (m.kind === 'log') { if (m.id < 32) { o.kind = 'log'; o.mission = m.id + 1; } else { o.kind = 'deep'; o.deep = Math.max(D.deep.start, Prog.load().deep.level); } }
  else if (m.kind === 'deep') { o.kind = 'deep'; o.deep = m.d + 1; }
  closeRS(); const mode = UI.mode === 'guided' ? 'vs' : UI.mode;
  UI.opt = Object.assign(UI.opt || {}, { kind: o.kind, mission: o.mission, deep: o.deep });
  if (NET.on) { netStart(); return; }
  newGame(mode, Object.assign({}, UI.cfg || {}, { kind: o.kind, mission: o.mission, deep: o.deep, np: (UI.cfg && UI.cfg.np) || G.hn, seats: UI.cfg && UI.cfg.seats || undefined }));
}
