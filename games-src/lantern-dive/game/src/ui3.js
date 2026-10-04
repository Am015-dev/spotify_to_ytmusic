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
  Object.assign(UI, { started: true, mode, cfg, holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, over: null, overShown: false, enter: 'deal', hint: null, why: '', predN: -1, tip: null, evN: G.evN, clockLeft: G.clock || null, timerAt: 0 });
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } const pa = $('#pass'); if (pa) { pa.hidden = true; pa.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
}
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 4)), names = [], ai = [];
  if (mode === 'guided') { np = 3; opt.kind = 'log'; opt.mission = 1; }
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  const chefs = mode === 'net' ? null : chefsFor(np, opt);
  if (mode !== 'net') for (let i = 0; i < np; i++) {
    const c = chefs[i], lv = c !== YOU ? lvAt(opt, c) : (opt.level || 'normal');
    if (mode === 'hot') { names.push(i === 0 ? 'Diver 1' : 'Diver ' + (i + 1)); ai.push(null); }
    else if (mode === 'ai') { names.push(D.names[c]); ai.push(lv); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(D.names[c]); ai.push(mode === 'guided' ? 'normal' : lv); }
  }
  UI.chefs = chefs;
  let mission = mode === 'net' ? (opt.mission && typeof opt.mission === 'object' ? opt.mission : missionFrom(opt)) : missionFrom(opt);
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  let tries = 0;
  // the guided first dive is a fixed, stacked deal that cannot be lost: you hold the Commander's Lantern 4 AND the Lantern 3, the job is to win the Lantern 3
  const gs = mode === 'guided' ? guidedStack() : null;
  G = LD.newGame({ players: np, seed, names, ai, mission, timer: !!opt.timer, stack: gs });
  G.noProg = mission.kind !== 'log' && mission.kind !== 'deep';
  resetUI(mode, { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null, kind: opt.kind, mission: opt.mission, d: opt.d, cmt: opt.cmt, deep: opt.deep, job: opt.job, timer: !!opt.timer });
  UI.news = [];
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.prefs.guide === 'light' ? 'light' : UI.prefs.guide === 'off' ? 'off' : 'light'), seen: {}, keep: false };
  if (mode === 'guided') UI.coach.level = 'full';
  placePrompt(); render(); sndMusic(); autosave(); schedule();
}
function guidedStack() {
  const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }, h = t => t.split(' ').map(x => D.card(L[x[0]], +x.slice(1)));
  return { tasks: D.guided.tasks.slice(), hands: D.guided.hands.map(h), nopass: true };
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
  if (G.phase === 'play' && G.trick.plays.length === 0) for (const p of G.players) if (p.ai && !p.helper && LD.canPing(G, p.seat) && LD.AI.pingChoice(G, p.seat)) return true;
  return false;
}
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') { if (!UI.busy && !UI.overShown) showResult(); return; }
  if (UI.busy) return;
  if (isClient()) { try { coachCheck(); } catch (e) { } return; }
  if (UI.cards.length) return;
  if (UI.tip && UI.mode === 'guided') return;
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
  let ok = false; try { ok = LD.AI.step(G); } catch (e) { console.error(e); }
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
  if (UI.tip) { markSeen(UI.tip.id); UI.tip = null; renderTip(); } // acting answers the tip
  if (isClient()) { netAct(mv); UI.sel = -1; UI.pingSel = false; UI.giveSel = -1; UI.job = -1; render(); return true; }
  return commit(v, mv);
}
function pickMove(pred) { return myMoves().find(pred); }
function tapHand(id) {
  if (!canAct()) { if (G && !isOver()) toast(UI.busy ? 'One moment…' : 'Wait for your turn.'); return; }
  const v = viewSeat(), ph = G.phase;
  if (UI.pingSel) { const ok = LD.pingMoves(G, v).some(m => m.c === id); if (!ok) { snd('error'); toast('That card cannot be shown: pick your highest, lowest or only card of a colour.'); return; } UI.sel = UI.sel === id ? -1 : id; snd('click'); render(); return; }
  if (ph === 'pass') { const ok = myMoves().some(m => m.t === 'give' && m.c === id); if (!ok) { snd('error'); toast('Lanterns cannot be passed.'); return; } UI.giveSel = UI.giveSel === id ? -1 : id; snd('click'); render(); return; }
  if (ph === 'play') {
    const T = G.trick, turn = T.turn;
    if (ctlSeat(turn) !== v || G.players[turn].helper) { toast(G.players[turn].helper ? 'Tap the drone\'s cards to play for it.' : 'Wait for ' + pname(turn) + '.'); return; }
    const legal = LD.playable(G, turn); if (!legal.includes(id)) { snd('error'); const ls = T.ls; toast(T.plays.length ? 'You must follow ' + (ls === 4 ? 'the Lantern lead' : D.suits[ls].name) + ' if you can.' : 'That card cannot lead now.'); return; }
    if (UI.sel === id) { playSel(); return; }
    UI.sel = id; UI.hint = null; snd('click', { vol: .4 }); render(); return;
  }
  toast('You cannot play a card right now.');
}
function tapDrone(id) {
  if (!canAct() || G.phase !== 'play') return; const T = G.trick, turn = T.turn, v = viewSeat();
  if (!G.players[turn].helper || ctlSeat(turn) !== v) { toast('It is not the drone\'s turn.'); return; }
  if (!LD.playable(G, turn).includes(id)) { snd('error'); toast('The drone must follow ' + (T.ls === 4 ? 'the Lantern lead' : D.suits[T.ls].name) + '.'); return; }
  if (UI.sel === id) { playSel(); return; } UI.sel = id; snd('click', { vol: .4 }); render();
}
function playSel() {
  if (!canAct() || UI.sel < 0 || G.phase !== 'play') return; const v = viewSeat(), turn = G.trick.turn;
  const m = myMoves().find(x => x.t === 'play' && x.c === UI.sel); if (!m) { snd('error'); return; }
  doMove(m);
}
function doHint() {
  const v = viewSeat(); if (!canAct() || !iMustAct()) return;
  let m; try { m = LD.AI.choose(G, v, 'normal'); } catch (e) { return; } if (!m) return;
  // guided first dive: the lesson comes first. While fewer than 3 tricks are played, suggest a colour card so the trick rules can be seen.
  if (UI.mode === 'guided' && G.phase === 'play' && G.tricks.length < 3 && m.t === 'play' && suitOf(m.c) === 4) {
    const col = myMoves().filter(x => x.t === 'play' && suitOf(x.c) < 4).sort((a, b) => valOf(a.c) - valOf(b.c));
    if (col.length) { UI.hint = { c: col[0].c, why: 'Lesson first: play a low colour card and watch how the trick is won. Keep your Lanterns for your job.' }; UI.sel = col[0].c; render(); return; }
  }
  if (m.t === 'play') { let why = ''; try { why = LD.AI.why(G, v, m.c); } catch (e) { } UI.hint = { c: m.c, why }; UI.sel = m.c; render(); }
  else if (m.t === 'take') { UI.job = m.i; render(); toast('A good job for you: ' + jobShort(m.i)); }
  else { toast('Suggested: ' + (m.t === 'ping' ? 'signal ' + cname(m.c) : m.t)); }
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
function newsFrom(evs) {
  const out = [], q = '“', qq = '”';
  for (const e of evs) {
    if (e.t === 'deal') UI.news = [];
    else if (e.t === 'take') out.push((e.seat === viewSeat() ? 'You took ' : pname(e.seat) + ' took ') + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'swap') out.push('Every diver passed one card ' + (G.hn === 2 ? 'to the partner.' : e.dir > 0 ? 'to the left.' : 'to the right.'));
    else if (e.t === 'ping') out.push(pname(e.seat) + ' showed ' + cname(e.c) + (e.k === 'high' ? ': their highest ' : e.k === 'low' ? ': their lowest ' : e.k === 'only' ? ': their only ' : ' ') + (e.k ? D.suits[suitOf(e.c)].name + '.' : '(highest, lowest or only one?)'));
    else if (e.t === 'trick') { const ti = G.tricks.findIndex(k => k.plays[0].c === e.plays[0].c); out.push((ti >= 0 ? 'Trick ' + (ti + 1) + ': ' : '')  + pname(e.w) + ' won with ' + cname(e.wc) + (suitOf(e.wc) === 4 ? (e.plays.filter(p => suitOf(p.c) === 4).length > 1 ? ', the highest Lantern.' : ': a Lantern beats every colour.') : ', the highest ' + D.suits[suitOf(e.wc)].name + '.')); }
    else if (e.t === 'job' && e.st > 0) out.push('✔ ' + pname(G.tasks[e.i].owner) + ' finished ' + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'job' && e.st < 0) out.push('✖ ' + (G.tasks[e.i].owner === viewSeat() ? 'Your' : pname(G.tasks[e.i].owner) + '’s') + ' job ' + q + jobShort(e.i) + qq + ' can no longer be done.');
  }
  if (out.length) UI.news = (UI.news || []).concat(out).slice(-3);
}
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playEvs(q); } }
async function playEvs(evs) {
  if (UI.busy) { UI.rq.push(evs); return; }
  const tok = UI.seq; UI.busy = true; closePop();
  try {
    const tr = evs.find(e => e.t === 'trick'), pls = evs.filter(e => e.t === 'play'), sw = evs.find(e => e.t === 'swap'), take = evs.filter(e => e.t === 'take'), pg = evs.filter(e => e.t === 'ping');
    try { newsFrom(evs); } catch (e) { console.error(e); }
    if (pls.length) snd('play');
    if (pg.length) snd('ping');
    if (sw) { snd('pass'); try { animatePass(); } catch (e) { } }
    if (take.length) snd('take');
    if (tr) {
      UI.fz = { plays: tr.plays.map(p => ({ s: p.s, c: p.c })), winner: tr.w, win: false };
      render(); await wait(ANIM ? 1000 : 0); if (tok !== UI.seq) return;
      UI.fz.win = true; render(); snd('trick'); await wait(ANIM ? 1100 : 0); if (tok !== UI.seq) return;
      UI.pxExit = { seat: tr.w }; UI.fz = null; render(); await wait(520); if (tok !== UI.seq) return;
      for (const j of evs.filter(e => e.t === 'job')) { if (j.st > 0) snd('done'); else if (j.st < 0) snd('fail'); }
    } else { render(); await wait(pls.length ? 420 : (take.length ? 380 : 220)); if (tok !== UI.seq) return; }
    if (evs.some(e => e.t === 'start') ) { /* nothing */ }
  } catch (e) { console.error(e); UI.fz = null; }
  UI.busy = false; UI.fz = null;
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
  if (NET.on || !G || !UI.started) return false;
  try { const g = LD.clone(G); delete g.events; lsSet('ld_save', JSON.stringify({ G: g, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, coach: UI.coach })); return true; } catch (e) { return false; }
}
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('ld_save')); } catch (e) { return false; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  G = o.G; G.events = [];
  try { if (G.phase !== 'over' && LD.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.hn ? o.chefs : null;
  resetUI(o.mode || 'vs', o.cfg || null); if (o.coach) UI.coach = o.coach;
  UI.timerAt = 0; placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showResult(); else schedule();
  return true;
}
