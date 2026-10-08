// ===================== part 3: game flow (new game, AI driver, human actions, event sequences, hot-seat, save) =====================
function lvAt(opt, k) { const a = opt.lv || DEF.lv; return a[Math.max(0, Math.min(3, k))] || opt.level || 'normal'; }
// which divers sit at the table: seat 0 is you (portrait YOU), the others are companions 0..3 chosen on the setup screen
function chefsFor(np, opt) {
  const pick = Array.isArray(opt.seats) ? opt.seats.filter((c, i, a) => c >= 0 && c <= 3 && a.indexOf(c) === i) : [];
  const n = Math.max(1, np - 1); if (pick.length >= n) return [YOU].concat(pick.slice(0, n));
  const out = [YOU].concat(pick); for (let c = 0; c <= 3 && out.length < np; c++) if (out.indexOf(c) < 0) out.push(c);
  return out;
}
function missionFrom(opt) {
  if (opt.kind === 'free') return { kind: 'free', d: opt.d, cmt: opt.cmt };
  if (opt.kind === 'job') return { kind: 'free', d: 1, jobs: [Math.max(1, Math.min(96, opt.job | 0 || 1)) - 1] };
  if (opt.kind === 'deep') return { kind: 'deep', level: opt.deep };
  return { kind: 'log', id: Math.max(1, Math.min(32, opt.mission | 0 || 1)) };
}
function resetUI(mode, cfg) {
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  Object.assign(UI, { started: true, mode, cfg, holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, over: null, overShown: false, enter: 'deal', hint: null, why: '', predN: -1, tip: null, evN: G.evN, clockLeft: G.clock || null, timerAt: 0, fingerOn: mode !== 'ai' && mode !== 'tutorial' && (+lsGet('ld_finger') || 0) < 3, holdJobs: null });
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } const pa = $('#pass'); if (pa) { pa.hidden = true; pa.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
}
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 4)), names = [], ai = [];
  if (mode === 'tutorial') { np = 3; opt.kind = 'log'; opt.mission = 1; opt.seats = [3, 2]; }   // the staged tutorial (ui12.js): you, Dag and Sumi
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  const chefs = mode === 'net' ? null : chefsFor(np, opt);
  if (mode !== 'net') for (let i = 0; i < np; i++) {
    const c = chefs[i], lv = c !== YOU ? lvAt(opt, c) : (opt.level || 'normal');
    if (mode === 'hot') { names.push(i === 0 ? 'Diver 1' : 'Diver ' + (i + 1)); ai.push(null); }
    else if (mode === 'ai') { names.push(D.names[c]); ai.push(lv); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(D.names[c]); ai.push(mode === 'tutorial' ? 'normal' : lv); }
  }
  UI.chefs = chefs;
  let mission = mode === 'net' ? (opt.mission && typeof opt.mission === 'object' ? opt.mission : missionFrom(opt)) : missionFrom(opt);
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  let tries = 0;
  // the staged tutorial is a fixed, stacked deal (data.js tutorial); the computer divers are scripted (ui12.js tutMove)
  const gs = mode === 'tutorial' ? tutorialStack() : null;
  G = LD.newGame({ players: np, seed, names, ai, mission, timer: !!opt.timer, stack: gs, boss: mode === 'descent' ? opt.boss || null : null });
  G.noProg = mode === 'tutorial' || (mission.kind !== 'log' && mission.kind !== 'deep');
  resetUI(mode, { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null, kind: opt.kind, mission: opt.mission, d: opt.d, cmt: opt.cmt, deep: opt.deep, job: opt.job, timer: !!opt.timer });
  UI.news = [];
  UI.coach = { level: mode === 'tutorial' ? 'off' : (UI.prefs.guide === 'light' ? 'light' : UI.prefs.guide === 'off' ? 'off' : 'light'), seen: {}, keep: false };
  UI.said = {}; UI.dlg = null; try { drawDlg(); } catch (e) { }
  placePrompt(); render(); sndMusic(); autosave(); schedule();
}
function tutorialStack() {
  const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }, h = t => t.split(' ').map(x => D.card(L[x[0]], +x.slice(1)));
  return { tasks: D.tutorial.tasks.slice(), hands: D.tutorial.hands.map(h), nopass: true };
}
function nextAttempt(same) {
  if (!G || G.phase !== 'over') return;
  const fresh = !same;
  LD.nextAttempt(G, { same: !fresh });
  const keep = { mode: UI.mode, cfg: UI.cfg };
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  Object.assign(UI, { holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, over: null, overShown: false, enter: 'deal', hint: null, predN: -1, tip: null, evN: G.evN, clockLeft: G.clock || null, timerAt: 0 });
  const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false;
  closePop(); render(); sndMusic(); autosave(); if (NET.on && isHost()) netPush(true); schedule();
}
// ---------- the turn driver ----------
function aiWants() {
  if (!G || G.phase === 'over') return false;
  for (const s of LD.pending(G)) if (G.players[s].ai) return true;
  if (G.phase === 'play' && G.trick.plays.length === 0 && UI.mode !== 'tutorial') for (const p of G.players) if (p.ai && !p.helper && LD.canPing(G, p.seat) && LD.AI.pingChoice(G, p.seat)) return true;
  return false;
}
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') { if (!UI.busy && !UI.overShown) showResult(); return; }
  if (UI.busy) return;
  if (isClient()) { try { coachCheck(); } catch (e) { } return; }
  if (UI.cards.length) return;
  if (UI.mode === 'tutorial' && tutAuto()) return;
  if (UI.mode === 'tutorial' && tutPaused()) { UI.tm = setTimeout(schedule, 200); return; }
  try { if (storyCheck()) return; } catch (e) { console.error(e); }
  if (G.clock && G.clockRun && UI.timerAt === 0) { UI.timerAt = Date.now(); UI.clockLeft = G.clock; startClock(); }
  if (aiWants()) {
    const d = AIDELAY <= 0 ? 0 : Math.round(AIDELAY * (.25 + .6 * Math.random()));
    const tok = UI.seq; UI.tm = setTimeout(() => { if (tok === UI.seq) aiTurn(); }, d); return;
  }
  if (hotSeat()) hotNext();
  try { coachCheck(); } catch (e) { console.error(e); }
}
function aiTurn() {
  if (!G || UI.busy || G.phase === 'over') return;
  let ok = false; try { ok = UI.mode === 'tutorial' ? tutAiStep() : LD.AI.step(G); } catch (e) { console.error(e); }
  if (!ok) { schedule(); return; }
  afterApply(G.events.slice());
}
function commit(seat, mv) {
  if (!G || G.phase === 'over') return false;
  const r = LD.apply(G, seat, mv);
  if (!r.ok) { snd('error'); toast(r.error || 'That did not work.'); return false; }
  const evs = G.events.slice(); const v = viewSeat();
  if (seat === v) { UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1; UI.hint = null; UI.predN = -1; }
  if (hotSeat()) { const nx = LD.pending(G).filter(s => !G.players[s].ai); if (!nx.includes(UI.holder)) UI.holder = -1; }
  afterApply(evs); return true;
}
const ANIM_EV = new Set(['play', 'trick', 'swap', 'take', 'ping', 'deal', 'over', 'job']);
function afterApply(evs) {
  if (NET.on && isHost()) { try { netRecord(evs); netPush(); } catch (e) { console.error(e); } }
  autosave();
  if (evs.some(e => e.t === 'play' || e.t === 'trick' || e.t === 'swap' || e.t === 'take' || e.t === 'ping')) { playEvs(evs); return; }
  if (evs.some(e => e.t === 'over')) { playEvs(evs); return; }
  render(); schedule();
}
// ---------- human actions ----------
function doMove(mv) {
  const v = viewSeat(); if (v < 0) return false;
  if (tutOn() && !tutGate(mv)) return false;      // the staged tutorial: only the action the step asks for goes through
  fingerDone();
  if (isClient()) { netAct(mv); UI.sel = -1; UI.pingSel = false; UI.giveSel = -1; UI.job = -1; render(); return true; }
  return commit(v, mv);
}
function pickMove(pred) { return myMoves().find(pred); }
function tapHand(id) {
  if (!canAct()) { if (G && !isOver()) toast(UI.busy ? 'One moment…' : 'Wait for your turn.'); return; }
  const v = viewSeat(), ph = G.phase;
  if (UI.pingSel) { const ok = LD.pingMoves(G, v).some(m => m.c === id); if (!ok) { snd('error'); toast('Pick your highest, lowest or only card.'); return; } UI.sel = UI.sel === id ? -1 : id; snd('click'); render(); return; }
  if (ph === 'pass') { const m = myMoves().find(x => x.t === 'give' && x.c === id); if (!m) { snd('error'); toast('Lanterns cannot be passed.'); return; } UI.giveSel = id; doMove(m); return; }
  if (ph === 'play') {
    const T = G.trick, turn = T.turn;
    if (ctlSeat(turn) !== v || G.players[turn].helper) { toast(G.players[turn].helper ? 'Tap the drone\'s cards.' : 'Wait for ' + pname(turn) + '.'); return; }
    const legal = LD.playable(G, turn); if (!legal.includes(id)) { snd('error'); const ls = T.ls; toast(T.plays.length ? 'Follow ' + (ls === 4 ? 'the Lantern' : D.suits[ls].name) + ' if you can.' : 'That card cannot lead now.'); return; }
    UI.sel = id; UI.hint = null; playSel(); return;
  }
  toast('Not your turn yet.');
}
function tapDrone(id) {
  if (!canAct() || G.phase !== 'play') return; const T = G.trick, turn = T.turn, v = viewSeat();
  if (!G.players[turn].helper || ctlSeat(turn) !== v) { toast('Not the drone\'s turn.'); return; }
  if (!LD.playable(G, turn).includes(id)) { snd('error'); toast('The drone must follow ' + (T.ls === 4 ? 'the Lantern' : D.suits[T.ls].name) + '.'); return; }
  UI.sel = id; playSel();
}
function playSel() {
  if (!canAct() || UI.sel < 0 || G.phase !== 'play') return; const v = viewSeat(), turn = G.trick.turn;
  const m = myMoves().find(x => x.t === 'play' && x.c === UI.sel); if (!m) { snd('error'); return; }
  doMove(m);
}
// tap a job card on the table: it flies to your seat
function tapJob(i) {
  if (!canAct() || G.phase !== 'assign') return; const m = myMoves().find(x => x.t === 'take' && x.i === i);
  if (!m) { snd('error'); toast(iMustAct() ? (!TASKS[G.tasks[i].id].cap && actorSeat() === G.cap ? 'Not for the Commander.' : 'You cannot take that one.') : 'Wait for your turn.'); return; }
  doMove(m);
}
// tap a ping spot on a card of your hand
function tapPing(id) {
  if (!canAct()) return; const m = myMoves().find(x => x.t === 'ping' && x.c === id);
  if (!m) { snd('error'); toast('That card cannot be shown.'); return; }
  UI.pxPing = viewSeat(); doMove(m);
}
// ---------- hot-seat ----------
function hotNext() {
  if (!hotSeat() || UI.cards.length || UI.busy) return;
  const pend = LD.pending(G).filter(s => !G.players[s].ai); if (!pend.length) return;
  // the flare decision needs no hidden information: nobody has to take the device, and the hand stays hidden meanwhile
  if (G.phase === 'distress') { if (UI.holder >= 0) { UI.holder = -1; render(); } return; }
  if (UI.holder >= 0 && pend.includes(UI.holder)) return;
  const nx = pend[0]; UI.holder = -1; UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1;
  pushCard({ kind: 'pass', seat: nx, title: 'Pass the device to ' + pname(nx), body: 'Hand the device to ' + pname(nx) + '. Their cards stay hidden until they press the button.', btn: pname(nx) + ' is ready' });
  render();
}
function pushCard(c) { UI.cards.push(c); drawCard(); }
function drawCard() {
  const pa = $('#pass'); if (!pa) return; const c = UI.cards[0];
  if (!c) { pa.hidden = true; pa.innerHTML = ''; return; }
  pa.hidden = false; pa.innerHTML = '';
  pa.append(h('div.pbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': c.title }, h('h2', c.title), h('p', c.body), h('button.btn.go', { type: 'button', 'data-a': 'takedev' }, c.btn || 'Continue')));
}
function takeDevice() { const c = UI.cards[0]; if (!c || c.kind !== 'pass') return; UI.cards.shift(); UI.holder = c.seat; drawCard(); render(); schedule(); }
// ---------- the event sequences: cards fly to the table, the trick is swept to its winner ----------
// ---------- "what just happened": one plain line per event that touches the team (jobs taken, tricks won, jobs done or failed, signals) ----------
function trickWhy(e, cu) {
  const lan = e.plays.filter(p => suitOf(p.c) === 4).length, ws = suitOf(e.wc);
  if (ws === 4) return lan > 1 ? ', the highest Lantern.' : ': a Lantern beats every colour.';
  if (cu === 'low') return ', the lowest ' + D.suits[ws].name + ' (Undertow curse).';
  if (cu === 'any') return ', the highest number of any colour (Riptide curse).';
  if (cu === 'sleep' && lan) return ', the highest ' + D.suits[ws].name + ': the Lanterns slept (curse).';
  return ', the highest ' + D.suits[ws].name + '.';
}
function newsFrom(evs) {
  const out = [], q = '“', qq = '”';
  for (const e of evs) {
    if (e.t === 'deal') UI.news = [];
    else if (e.t === 'take') out.push((e.seat === viewSeat() ? 'You took ' : pname(e.seat) + ' took ') + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'swap') out.push('Every diver passed one card ' + (G.hn === 2 ? 'to the partner.' : e.dir > 0 ? 'to the left.' : 'to the right.'));
    else if (e.t === 'ping') out.push(pname(e.seat) + ' showed ' + cname(e.c) + (e.k ? ': ' + (e.seat === viewSeat() ? 'your' : 'their') + (e.k === 'high' ? ' highest ' : e.k === 'low' ? ' lowest ' : ' only ') : ' ') + (e.k ? D.suits[suitOf(e.c)].name + '.' : '(highest, lowest or only one?)') + (e.seat === viewSeat() ? '' : ' Their signal is now used (red cross).'));
    else if (e.t === 'trick') { const ti = G.tricks.findIndex(k => k.plays[0].c === e.plays[0].c); out.push((ti >= 0 ? 'Trick ' + (ti + 1) + ': ' : '')  + pname(e.w) + ' won with ' + cname(e.wc) + trickWhy(e, ti >= 0 ? G.tricks[ti].cu : '')); }
    else if (e.t === 'job' && e.st > 0 && isBoss()) { UI.hitAt = Date.now(); const B = bossChar(); out.push('\u2714 ' + pname(G.tasks[e.i].owner) + ' finished \u201c' + jobShort(e.i) + '\u201d. ' + B.name + ' takes a hit: \u201c' + B.hit[(G.tasks.filter((t, k) => jobSt(k) > 0).length - 1) % B.hit.length] + '\u201d'); setTimeout(() => { try { bossBar(); } catch (er) { } }, 750); }
    else if (e.t === 'job' && e.st > 0) out.push('✔ ' + pname(G.tasks[e.i].owner) + ' finished ' + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'job' && e.st < 0) out.push('✖ ' + (G.tasks[e.i].owner === viewSeat() ? 'Your' : pname(G.tasks[e.i].owner) + '’s') + ' job ' + q + jobShort(e.i) + qq + ' can no longer be done.');
  }
  if (out.length) UI.news = (UI.news || []).concat([out.join(' ')]).slice(-3); // one sentence per moment
}
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playEvs(q); } }
// a +1 (or any short word) that rises from a seat
function floatAt(seat, text, cls) {
  try {
    const bd = $('#bd'), el = document.querySelector('[data-key="seat' + seat + '"]'); if (!bd || !el) return;
    const B = bd.getBoundingClientRect(), r = el.getBoundingClientRect(), f = h('div.fl' + (cls ? '.' + cls : ''), text);
    f.style.left = Math.round(r.left - B.left + r.width / 2) + 'px'; f.style.top = Math.round(r.top - B.top + r.height / 2) + 'px'; bd.appendChild(f); setTimeout(() => f.remove(), 1500);
  } catch (e) { }
}
// a job card taken from the table flies to the seat that took it
function flyJobs(list) {
  if (!ANIM || !document.body.animate) return;
  for (const f of list) {
    try {
      const to = document.querySelector('[data-job="' + f.i + '"]'); const tr = to ? to.getBoundingClientRect() : null;
      const seatEl2 = document.querySelector('[data-key="seat' + f.seat + '"]'); const sr = seatEl2 ? seatEl2.getBoundingClientRect() : null;
      const dst = tr && tr.width > 4 ? { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2, s: Math.max(.3, tr.width / f.r.width) } : sr ? { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2, s: .3 } : null; if (!dst) continue;
      const el = f.node; el.className = 'jcard jfly'; el.style.cssText = 'position:fixed;z-index:40;pointer-events:none;margin:0;left:' + f.r.left + 'px;top:' + f.r.top + 'px;width:' + f.r.width + 'px;height:' + f.r.height + 'px'; document.body.appendChild(el);
      const dx = dst.x - (f.r.left + f.r.width / 2), dy = dst.y - (f.r.top + f.r.height / 2), d = 520 * Math.max(.6, AIDELAY / 650);
      const an = el.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + dst.s + ')', opacity: .85 }], { duration: d, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      an.onfinish = () => el.remove(); setTimeout(() => el.remove(), d + 400);
    } catch (e) { }
  }
}
async function playEvs(evs) {
  if (UI.busy) { UI.rq.push(evs); return; }
  const tok = UI.seq; UI.busy = true; closePop();
  try {
    const tr = evs.find(e => e.t === 'trick'), pls = evs.filter(e => e.t === 'play'), sw = evs.find(e => e.t === 'swap'), take = evs.filter(e => e.t === 'take'), pg = evs.filter(e => e.t === 'ping'), jb = evs.filter(e => e.t === 'job');
    try { newsFrom(evs); } catch (e) { console.error(e); }
    // job cards still lying on the table: remember where they are, so they can fly to the seat that takes them
    const flights = []; for (const e of take) { const el = document.querySelector('[data-key="job' + e.i + '"]'); if (el) flights.push({ i: e.i, seat: e.seat, r: el.getBoundingClientRect(), node: el.cloneNode(true) }); }
    if (pls.length) snd('play');
    if (pg.length) { snd('ping'); UI.pxPing = pg[0].seat; }
    if (sw) { snd('pass'); try { animatePass(); } catch (e) { } }
    if (take.length) snd('take');
    if (tr) {
      UI.holdJobs = new Set(jb.map(j => j.i));      // the stamps land only after the cards have been swept
      UI.fz = { plays: tr.plays.map(p => ({ s: p.s, c: p.c })), winner: tr.w, win: false };
      render(); await wait(ANIM ? 750 : 0); if (tok !== UI.seq) return;
      UI.fz.win = true; render(); snd('trick'); await wait(ANIM ? 900 : 0); if (tok !== UI.seq) return;
      await tutHoldWait(); if (tok !== UI.seq) return;
      UI.pxExit = { seat: tr.w }; UI.fz = null; render(); floatAt(tr.w, '+1', 'plus'); await wait(520); if (tok !== UI.seq) return;
      UI.holdJobs = null; if (jb.length) { render(); for (const j of jb) { if (j.st > 0) snd('done'); else if (j.st < 0) snd('fail'); } await wait(700); if (tok !== UI.seq) return; }
    } else {
      render(); flyJobs(flights); await wait(pls.length ? 420 : (take.length ? 460 : 220)); if (tok !== UI.seq) return;
      if (jb.length) { for (const j of jb) { if (j.st > 0) snd('done'); else if (j.st < 0) snd('fail'); } await wait(500); if (tok !== UI.seq) return; }
    }
  } catch (e) { console.error(e); UI.fz = null; }
  UI.busy = false; UI.fz = null; UI.holdJobs = null;
  try { render(); } catch (e) { console.error(e); }
  if (G && G.phase === 'over') { schedule(); drainQ(); return; }
  schedule(); drainQ(); if (NET.on && isHost()) netPush(true);
}
function animatePass() {
  if (!document.body.animate || !ANIM) return;
  const np = G.np, dir = (G.pass && G.pass.dir) || 1, rect = s => { const e = document.querySelector('[data-key="seat' + s + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 - 15, y: r.top + r.height / 2 - 21 }; };
  const ds = LD.diverSeats(G);
  for (let k = 0; k < ds.length; k++) {
    const a = rect(ds[k]), b = rect(ds[((k + dir) % ds.length + ds.length) % ds.length]); if (!a || !b) continue;
    const el = h('div.pkt'); el.innerHTML = KIT.backSVG({ w: 30 }); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el);
    const an = el.animate([{ transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 0 }, { transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 1, offset: .12 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 1, offset: .88 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 0 }], { duration: 800 * Math.max(.5, AIDELAY / 650), easing: 'ease-in-out' });
    an.onfinish = () => el.remove(); setTimeout(() => el.remove(), 1500);
  }
}
// ---------- the clock (real-time dives) ----------
function startClock() {
  clearInterval(UI.clk); if (!G || !G.clock) return;
  UI.clk = setInterval(() => {
    if (!G || G.phase === 'over' || !UI.started) { clearInterval(UI.clk); return; }
    if (UI.busy && false) return;
    UI.clockLeft = Math.max(0, G.clock - (Date.now() - UI.timerAt) / 1000);
    const c = $('#clk'); if (c) { c.textContent = clockText(); c.classList.toggle('low', UI.clockLeft < 20); }
    if (UI.clockLeft <= 0 && !isClient()) { clearInterval(UI.clk); if (LD.expire(G)) afterApply(G.events.slice()); }
  }, 250);
}
// ---------- save / load (local games only) ----------
function hasSave() { return !!lsGet('ld_save'); }
function autosave() { if (NET.on || !G || !UI.started) return false; return save(true); }
function save(quiet) {
  if (NET.on || !G || !UI.started || UI.mode === 'tutorial') return false;
  try { const g = LD.clone(G); delete g.events; lsSet('ld_save', JSON.stringify({ G: g, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, coach: UI.coach })); return true; } catch (e) { return false; }
}
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('ld_save')); } catch (e) { return false; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  G = o.G; G.events = [];
  try { if (G.phase !== 'over' && LD.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.hn ? o.chefs : null;
  resetUI(o.mode === 'guided' || o.mode === 'tutorial' ? 'vs' : (o.mode || 'vs'), o.cfg || null); if (o.coach) UI.coach = o.coach;
  UI.timerAt = 0; placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showResult(); else schedule();
  return true;
}
