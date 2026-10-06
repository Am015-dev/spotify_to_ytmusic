// ===================== part 3: game flow (new game, computer crew, human actions, hot-seat, timer, end) =====================
const mkey = m => JSON.stringify(m);
function newGame(mode, o) {
  o = o || {}; clearTimeout(UI.tm); UI.seq++;
  const cfg = UI.cfg = Object.assign({ scenario: 'g1', role: 0, level: 'normal', abil: [] }, UI.opt || {}, o);
  const sc = FA.scen(cfg.scenario);
  const abil = (cfg.abil && cfg.abil.length ? cfg.abil : suggestAbil(sc)).slice(0, sc.ab);
  const ai = [null, null], lv = cfg.level || 'normal';
  if (mode === 'vs' || mode === 'guided') ai[1 - cfg.role] = lv; else if (mode === 'watch') { ai[0] = lv; ai[1] = lv; }
  else if (mode === 'net') { (cfg.ai || []).forEach((l, i) => ai[i] = l || null); }
  const seed = (UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0);
  const names = [D.crew[0].name, D.crew[1].name];
  G = FA.newGame({ scenario: sc.id, seed, abil: mode === 'guided' ? [] : abil, names, ai });
  if (mode === 'guided') { G.script = GUIDED_SCRIPT.slice(); }
  if (o.camp && typeof campTwist === 'function') campTwist(G, o.camp.twist);
  UI.mode = mode; UI.seat = mode === 'guided' ? 0 : cfg.role; UI.holder = mode === 'hot' ? -1 : UI.seat; UI.started = true; UI.sel = -1; UI.cof = 0; UI.hint = null; UI.over = null; UI.overShown = false; UI.rrm = [false, false, false, false];
  UI.coach = { level: o.tipsOff ? 'off' : mode === 'guided' ? 'full' : (UI.prefs.guide || 'off'), seen: {}, tip: '', queue: [] }; UI.lastPlace = null; UI.rt = G.mods.real ? { left: 60000, last: 0 } : null;
  const st = $('#start'); if (st) st.hidden = true; closeRS(); try { GX.close(); } catch (e) { } closePass(); hideRecap();
  { const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } }   // a tip left over from the last flight
  $$('#fx .endb').forEach(e => e.remove()); UI.rfx = null; clearSave(); render(); sndMusic(); coachTick(); schedule();
  if (mode !== 'guided' && mode !== 'watch' && UI.prefs.story !== false && !o.camp && !isPh()) showStory();
}
function suggestAbil(sc) { const order = ['mastery', 'control', 'antic', 'together', 'sync', 'adapt']; return order.slice(0, sc.ab); }
// ---- applying a move (every route goes through here: a human tap, the computer, a remote player)
function commit(seat, m) {
  if (!G || G.result) return false;
  const was = { round: G.round, phase: G.phase, slots: Object.assign({}, G.slots), axis: G.pl.axis, pos: G.pl.pos, planes: FA.planesOnTrack(G), sw: JSON.stringify(G.pl.sw) };
  UI.lastPlace = m.t === 'place' ? { seat, to: m.to, d: m.d } : null;
  const r = FA.performMove(G, m, seat); if (!r.ok) { if (mayAct(seat)) toast(r.error); return false; }
  sfxFor(m, was); UI.sel = -1; UI.cof = 0; UI.hint = null; if (m.t === 'rrpick') UI.rrm = [false, false, false, false];
  if (G.round !== was.round) { UI.rt = G.mods.real ? { left: 60000, last: 0 } : null; UI.sel = -1; }
  saveGame(); if (typeof netPush === 'function') netPush(); coachTick(); render(); schedule();
  return true;
}
function sfxFor(m, was) {
  try {
    if (m.t === 'place') { snd('dieland'); if (G.pl.axis !== was.axis) snd('axis'); if (G.pl.pos !== was.pos) snd('engine'); if (FA.planesOnTrack(G) < was.planes) snd('radio'); if (JSON.stringify(G.pl.sw) !== was.sw) snd('switch'); if (FA.SLOT[m.to].grp === 'conc') snd('coffee'); }
    else if (m.t === 'ready' && G.phase === 'place') snd('roll'); else if (m.t === 'rrpick' && !G.pend) snd('roll'); else if (m.t === 'say') snd('click');
    if (G.round !== was.round && !G.result) snd('round');
  } catch (e) { }
}
// ---- the scheduler: asks the computer for its move, waits for humans, shows pass screens
function schedule() {
  clearTimeout(UI.tm); if (!G || !UI.started) return;
  if (G.result) { onEnd(); return; }
  if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) return;
  const seats = FA.pending(G); if (!seats.length) return;
  const myUi = seats.filter(s => !G.ai[s]);
  // hot-seat: hand the device over only when the next decision needs a player's hidden dice; the briefing and public tokens are done on the shared screen
  if (UI.mode === 'hot') { if (hiddenFree() && (G.phase === 'brief' || !myUi.includes(UI.holder))) { if (UI.holder >= 0) { UI.holder = -1; UI.sel = -1; render(); } } else if (myUi.length && !myUi.includes(UI.holder)) { showPass(myUi[0]); return; } }
  const aiSeat = seats.find(s => G.ai[s]);
  if (aiSeat != null) {
    const seq = UI.seq, delay = G.phase === 'brief' ? Math.min(AIDELAY, 500) : AIDELAY, aiS = aiSeat;
    UI.tm = setTimeout(() => { if (seq !== UI.seq || !G || G.result) return; try { const m = FA.AI.move(G, aiS, G.ai[aiS], {}); if (!m) { console.warn('no AI move'); return; } commit(aiS, m); } catch (e) { console.error(e); } }, ANIM || UI.mode === 'net' ? delay : 0);
  }
}
// ---- human actions
function dieTap(s, d) {
  if (!mayAct(s)) { if (G.phase === 'place' && !G.result) toast(s === viewSeat() ? 'Not your move yet.' : 'Those dice are hidden behind the screen.'); return; }
  const v = actSeat(); if (v !== s) return;
  if (G.pend && G.pend.h === 'rr') { if (!G.pend.d.m[s] && typeof d === 'number' && !G.dice[s][d].u) { UI.rrm[d] = !UI.rrm[d]; render(); } return; }
  if (G.pend && G.pend.h === 'wt' && G.pend.d.a !== s) { const m = { t: 'wt2', d }; if (FA.validMoves(G, s).some(x => x.t === 'wt2' && x.d === d)) commit(s, m); return; }
  if (G.turn !== s && !(G.pend && (G.pend.h === 'intern' || G.pend.h === 'sync'))) { toast('Not your move yet.'); return; }
  if (G.dice[s][d] && G.dice[s][d].u && d !== 'p') return;
  UI.sel = UI.sel === d ? -1 : d; UI.cof = 0; UI.hint = null; UI.warnK = null; snd('click'); render(); coachTick();
}
function slotTap(k) {
  const v = actSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v)) { if (G && !G.result) toast('Wait for your turn.'); return; }
  if (G.slots[k]) { toast(slotName(k) + ' is taken.'); return; }
  if (UI.sel === -1 || UI.sel == null) { toast('Pick a die first.'); return; }
  const m = { t: 'place', d: UI.sel, to: k, c: UI.cof };
  if (FA.validMoves(G, v).some(x => x.t === 'place' && x.d === m.d && x.to === k && (x.c || 0) === m.c)) {
    // the last dice are needed on the empty Axis / Engines: a second tap on the same space places anyway
    const mi = mandInfo(v); if (UI.sel !== 'p' && mi && mi.tight && !mi.lost && !mi.need.includes(k) && UI.warnK !== k) { UI.warnK = k; snd('error'); toast(needNames(mi.need) + ' still empty. Tap again.'); return; }
    // this die here ends the flight at once: the first tap only explains, a second tap places it
    if (UI.dead && UI.dead[k] && UI.warnK !== k) { UI.warnK = k; snd('error'); toast('This ends the flight. Tap again.'); return; }
    UI.warnK = null; sendMove(v, m); return; }
  const val = (UI.sel === 'p' ? G.pend.d.val : G.dice[v][UI.sel].v) + UI.cof; const S = FA.SLOT[k];
  const why = S.s !== null && S.s !== v ? 'That space belongs to the ' + (S.s === 0 ? 'pilot' : 'co-pilot') + '.' : (S.grp === 'flaps' && S.ix > 0 && !G.pl.sw.fl[S.ix - 1]) ? 'Flaps go in order: use the one above first.' : (S.grp === 'brakes' && S.ix > 0 && !G.pl.sw.br[S.ix - 1]) ? 'Brakes go in order: 2, then 4, then 6.' : (S.grp === 'ice' && S.ix !== G.pl.ice) ? 'Only the next icy-runway column can be used.' : (S.grp === 'intern' && G.intern.length && val === (v === 0 ? G.intern[0] : G.intern[G.intern.length - 1])) ? 'The die must differ from the next trainee token.' : S.vals ? slotName(k) + ' ' + slotNeed(k) + ' (your die shows ' + val + ').' : 'That does not fit.';
  snd('error'); toast(why);
}
// route: online clients send to the host, everybody else applies at once
function sendMove(seat, m) { if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { if (typeof netAct === 'function') netAct(m); UI.sel = -1; UI.cof = 0; render(); return; } commit(seat, m); }
function doAction(a, t) {
  const v = actSeat(); if (typeof v !== 'number' || v < 0) return;
  const mv = FA.validMoves(G, v);
  switch (a) {
    case 'ready': sendMove(v, { t: 'ready' }); break;
    case 'say': sendMove(v, { t: 'say', c: t.dataset.c }); break;
    case 'rr': if (!UI.rrAsk) { UI.rrAsk = true; render(); toast('Spend a token? Tap again.'); clearTimeout(UI.rrAskT); UI.rrAskT = setTimeout(() => { UI.rrAsk = false; if (G && UI.started) render(); }, 5000); break; }
      UI.rrAsk = false; sendMove(v, { t: 'rr' }); break;
    case 'rrpick': sendMove(v, { t: 'rrpick', m: UI.rrm.slice() }); break;
    case 'antic': case 'adapt': case 'wt': case 'toss': if (typeof UI.sel === 'number' && UI.sel >= 0) sendMove(v, { t: a, d: UI.sel }); break;
    case 'cof': UI.cof = +t.dataset.c; render(); break;
    case 'hint': showHint(); break;
  }
}
function showHint() {
  const v = actSeat(); if (typeof v !== 'number' || !mayAct(v)) return;
  try {
    const m = FA.AI.move(G, v, 'normal', { noMC: true }); if (!m) { toast('No suggestion.'); return; }
    let why = whyMove(m, v), d = m.d;
    UI.hint = { d: m.t === 'place' || m.t === 'toss' ? d : null, why: '' };
    if (m.t === 'place') { UI.sel = d; UI.cof = m.c || 0; }   // the reason shows in the dock under the die, never as a toast over the buttons
  } catch (e) { console.error(e); }
  render();
}
function whyMove(m, v) {
  if (m.t === 'ready') return 'Roll when you have finished the briefing.';
  if (m.t === 'rr') return 'Spend a reroll token: your hand does not fit the jobs that are waiting.';
  if (m.t === 'toss') return 'Nothing takes this die, so put it aside.';
  if (m.t !== 'place') return m.t + ' looks useful here.';
  const val = (m.d === 'p' ? G.pend.d.val : G.dice[v][m.d].v) + (m.c || 0), S = FA.SLOT[m.to], pre = m.c ? 'With a coffee making it ' + val + ', ' : 'A ' + val + ' ';
  switch (S.grp) {
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0, sp = at === G.planes.length ? 'the airport' : 'space ' + at; return n ? pre + 'on the radio clears a plane on ' + sp + '.' : pre + 'on the radio would clear nothing; it only gets rid of a spare die.'; }
    case 'axis': { const o = G.slots['ax' + (1 - v)]; if (o) { const nx = G.pl.axis + (v === 0 ? o.v - val : val - o.v); return pre + 'on the axis against ' + name(1 - v) + '’s ' + o.v + ' leaves the plane ' + (nx === 0 ? 'level' : 'tilted ' + Math.abs(nx) + (nx < 0 ? ' left' : ' right')) + ' (3 is a spin).'; }
      return pre + 'on the axis goes first. ' + name(1 - v) + ' cannot see it coming and will answer with what their dice allow; a middle value leaves the most room.'; }
    case 'engines': { const o = G.slots['en' + (1 - v)]; if (o) { const sm = val + o.v + FA.windMod(G), adv = FA.isFinal(G) ? -1 : sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return pre + 'on the engines makes ' + sm + (adv < 0 ? ' for the landing (brakes ' + FA.brakeVal(G) + ').' : ': the plane ' + (adv ? 'moves ' + adv + ' space' + (adv > 1 ? 's' : '') + '.' : 'stays put.')); }
      return pre + 'on the engines sets half of the speed; ' + name(1 - v) + ' adds the other half (up to ' + G.pl.aeroB + ' stays, up to ' + G.pl.aeroO + ' moves 1, more moves 2).'; }
    case 'gear': return pre + 'lowers a landing gear (needed to land); the blue marker moves up.';
    case 'flaps': return pre + 'extends a flap (needed to land); the orange marker moves up.';
    case 'brakes': case 'ice': return pre + 'sets a brake: the last-round speed must be no more than the brake value.';
    case 'conc': return pre + 'on Coffee earns a coffee token: later, either of you can bend a die by one with it.';
    case 'kero': return pre + 'on the fuel space burns ' + val + '; skipping it would burn 6.';
    case 'intern': return pre + 'trains the trainee: take the next token and place it too.';
  }
  return 'Good use of this die.';
}
// ---- pass-the-device screens (hot-seat)
function showPass(seat) {
  UI.holder = -1; const el = $('#pass'); if (!el) return; el.hidden = false; el.innerHTML = '';
  const waiting = G.pend && G.pend.h === 'rr' ? 'reroll choice' : G.pend && G.pend.h === 'wt' ? 'hand-over choice' : 'turn';
  el.appendChild(h('div.passbox', ART['crew-' + seat] ? h('img', { src: ART['crew-' + seat], alt: '' }) : null, h('h2', 'Pass to ' + name(seat)), h('p', name(seat) + ', ' + pname(seat) + ' (' + (seat ? 'orange' : 'blue') + '): it is your ' + waiting + '. Make sure only you can see the screen.'), h('p.sm', 'Your dice are hidden until you tap the button.'), h('button.btn.go', { type: 'button', 'data-a': 'take', 'data-s': seat }, "I'm " + name(seat) + ' – show my dice')));
  render();
}
function takeDevice(seat) { UI.holder = seat; closePass(); render(); schedule(); }
function closePass() { const el = $('#pass'); if (el) { el.hidden = true; el.innerHTML = ''; } }
// ---- real-time module: a 60 s timer that only runs while someone is deciding
setInterval(() => {
  if (!G || !UI.started || G.result || !UI.rt || G.phase !== 'place') return; if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { return; }
  const now = Date.now(); if (!UI.rt.last) { UI.rt.last = now; return; } const dt = now - UI.rt.last; UI.rt.last = now;
  const seats = FA.pending(G), human = seats.some(s => !G.ai[s]); if (!human) return; if (UI.mode === 'hot' && UI.holder < 0) return;
  UI.rt.left -= dt; const sec = Math.max(0, Math.ceil(UI.rt.left / 1000));
  for (const e of $$('.rtleft')) { e.textContent = '⏱ ' + sec + ' s'; e.classList.toggle('low', sec <= 10); e.setAttribute('aria-label', sec + ' seconds left this round'); }
  if (sec <= 10 && sec !== UI.rtBeep) { UI.rtBeep = sec; try { snd('click'); } catch (e) { } }
  if (UI.rt.left <= 0) { UI.rt = null; toast('Time is up!'); commit(seats[0], { t: 'timeout' }); }
}, 250);
// ---- the end
function onEnd() {
  if (UI.overShown) return; UI.overShown = true; clearSave(); hideRecap();   // no round card over the ending picture
  const win = G.result.win; try { if (win) { UI.won[G.sid] = 1; savePrefs(); } snd(win ? 'win' : 'lose'); } catch (e) { }
  const fin = () => { if (typeof campOn === 'function' && campOn()) campFinish(); else showEndBoard(); };
  if (typeof pxEnd === 'function' && ANIM && typeof PX !== 'undefined' && PX.on) { pxEnd(win, fin); } else setTimeout(fin, ANIM ? 500 : 0);
}
