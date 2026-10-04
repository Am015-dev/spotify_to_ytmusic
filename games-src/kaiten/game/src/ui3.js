// ===================== part 3: game flow (new game, picking, AI, reveal / pass / round sequence, hot-seat, save) =====================
function lvAt(opt, k) { const a = opt.lv || DEF.lv; return a[Math.max(0, Math.min(3, k - 1))] || opt.level || 'normal'; }
// which chefs sit at the table: seat 0 is you (Mina's portrait), the others come from the setup screen (opt.seats, chef numbers 1-4)
function chefsFor(np, opt) {
  const pick = Array.isArray(opt.seats) ? opt.seats.filter((c, i, a) => c >= 1 && c <= 4 && a.indexOf(c) === i) : [];
  if (pick.length >= np - 1) return [0].concat(pick.slice(0, np - 1));
  const out = [0].concat(pick); for (let c = 1; c <= 4 && out.length < np; c++) if (out.indexOf(c) < 0) out.push(c);
  return out;
}
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 3)), names = [], ai = [];
  if (mode === 'guided') np = 2;
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  const chefs = mode === 'net' ? null : chefsFor(np, opt);
  if (mode !== 'net') for (let i = 0; i < np; i++) {
    const c = chefs[i], lv = c > 0 ? lvAt(opt, c) : (opt.level || 'normal');
    if (mode === 'hot') { names.push(PN[c]); ai.push(null); }
    else if (mode === 'ai') { names.push(PN[c]); ai.push(lv); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(PN[c]); ai.push(mode === 'guided' ? 'easy' : lv); }
  }
  UI.chefs = chefs;
  clearTimeout(UI.tm); UI.seq++; UI.rq = []; dropHold(); UI.tut = null;
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  G = KK.newGame({ players: np, seed, names, ai });
  Object.assign(UI, { started: true, mode, cfg: { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null }, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, over: null, enter: 'deal', land: null, focus: 0, overShown: false, evN: G.evN, resultDone: false, earned: null, t0: Date.now() });
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && UI.coach.keep ? 'full' : 'off'), seen: {}, turn: '', keep: UI.coach.keep };
  if (mode === 'guided') { UI.coach.level = 'full'; try { tutDeal(); } catch (e) { console.error(e); UI.tut = null; } }
  recapSeats();
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic(); schedule();
}
// ---------- the turn driver ----------
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') return;
  try { autoSave(); } catch (e) { }
  if (UI.busy) return;
  if (isClient()) { try { coachCheck(); } catch (e) { } return; }
  if (UI.cards.length && !NET.on) return;
  const ai = KK.pending(G).filter(s => G.players[s].ai);
  if (ai.length) {
    const d = AIDELAY <= 0 ? 0 : Math.round(AIDELAY * (.2 + .55 * Math.random()));
    const tok = UI.seq; UI.tm = setTimeout(() => { if (tok === UI.seq) aiPick(ai[0]); }, d); return;
  }
  if (hotSeat()) hotNext();
  try { coachCheck(); } catch (e) { console.error(e); }
}
function aiPick(seat) {
  if (!G || UI.busy || G.phase !== 'pick') return;
  const p = G.players[seat]; if (!p || p.picked || !p.ai) { schedule(); return; }
  let mv = tutPartner(seat); if (!mv) try { mv = KK.AI.choose(G, seat); } catch (e) { console.error(e); mv = KK.moves(G, seat)[0]; }
  commit(seat, mv);
}
function commit(seat, mv) {
  if (!G || G.phase !== 'pick') return false;
  const v = viewSeat(), preHand = v >= 0 ? G.players[v].hand.slice() : null, wasHolder = UI.holder;
  const r = KK.apply(G, seat, { pick: mv.pick });
  if (!r.ok) { snd('error'); toast('That did not work: ' + r.error); return false; }
  const evs = G.events.slice();
  if (seat === v) { snd('pick'); UI.sel = []; UI.twin = false; UI.rec = null; }
  if (hotSeat() && seat === wasHolder) UI.holder = -1;
  afterApply(evs, preHand);
  return true;
}
function afterApply(evs, preHand) {
  if (NET.on && isHost()) { try { netRecord(evs); netPush(); } catch (e) { console.error(e); } }
  if (evs.some(e => e.t === 'reveal')) { playResolve(evs, preHand); return; }
  render(); schedule();
}
// ---------- human actions ----------
function myMoves() { const v = viewSeat(); return v >= 0 && G ? KK.moves(G, v) : []; }
function tapHand(i) {
  if (!canPick()) { const v = viewSeat(); if (v >= 0 && G && G.players[v].picked) toast('You have served. Waiting for the others.'); return; }
  const hand = G.players[viewSeat()].hand; if (!(i >= 0 && i < hand.length)) return;
  const cur = UI.sel.slice();
  if (UI.twin) {
    const k = cur.indexOf(i);
    if (k >= 0) cur.splice(k, 1); else { if (cur.length >= 2) cur.shift(); cur.push(i); }
    UI.sel = cur; UI.rec = null; render(); return;
  }
  if (!tutGuard(i)) return;
  if (cur.length === 1 && cur[0] === i && UI.prefs.tap2) { serveSel(); return; }
  UI.sel = [i]; UI.rec = null; snd('click', { vol: .4 }); render();
}
function serveSel() {
  const v = viewSeat(); if (!canPick() || !UI.sel.length) return;
  const pick = UI.sel.slice().sort((a, b) => a - b);
  const mv = myMoves().find(m => mkey(m) === pick.join(','));
  if (!mv) { snd('error'); toast('That choice is not allowed.'); return; }
  doPick(v, mv);
}
function doPick(seat, mv) {
  // the lifted plate flies to the seat under a cover
  try { if (ANIM && !pxServe() && document.body.animate) flyPick(); } catch (e) { }
  try { GX.recap.mark(seat); } catch (e) { }
  if (isClient()) { netAct({ pk: mv.pick.join(',') }); UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render(); return; }
  if (canHold(seat)) { holdServe(seat, mv); return; }
  commit(seat, mv);
}
function flyPick() {
  const sels = $$('#belt .hc.sel'); if (!sels.length) return; const v = viewSeat(); const slot = document.querySelector('.seat[data-seat="' + v + '"] .slot');
  const to = slot ? slot.getBoundingClientRect() : null; if (!to || !to.width) return;
  sels.forEach((b, k) => {
    const r = b.getBoundingClientRect(); const c = h('div.flyc'); c.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px'; c.innerHTML = KIT.backSVG({ w: Math.round(r.width) }); document.body.appendChild(c);
    const dx = to.left + to.width / 2 - (r.left + r.width / 2), dy = to.top + to.height / 2 - (r.top + r.height / 2);
    const a = c.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * .6 + 'px,' + (dy * .6 - 30) + 'px) scale(.8)', opacity: 1, offset: .55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + Math.max(.25, to.width / r.width) + ')', opacity: .85 }], { duration: 480, easing: 'ease-in-out' });
    a.onfinish = () => c.remove(); setTimeout(() => c.remove(), 900);
  });
  snd('slide', { vol: .5 });
}
function toggleTwin() {
  const v = viewSeat(); if (!canPick() || !KK._.hasChop(G.players[v]) || G.players[v].hand.length < 2) { UI.twin = false; render(); return; }
  UI.twin = !UI.twin; if (!UI.twin && UI.sel.length > 1) UI.sel = UI.sel.slice(0, 1);
  render();
}
function hint() {
  const v = viewSeat(); if (!canPick() || tutStep()) return;
  let mv; try { mv = KK.AI.choose(G, v, 'normal'); } catch (e) { return; }
  if (!mv) return;
  UI.rec = { ids: mv.ids.slice(), pick: mv.pick.slice() };
  UI.twin = mv.pick.length === 2; UI.sel = mv.pick.slice(); render();
  const pp = $('#prompt'); const why = whyPick(mv.ids);
  toast('A good pick: ' + mv.ids.map(cname).join(' + ') + '. ' + why);
}
// ---------- hot-seat ----------
function hotNext() {
  if (!hotSeat() || UI.cards.length || UI.busy) return;
  if (UI.holder >= 0 && !G.players[UI.holder].picked) return;
  const pend = KK.pending(G).filter(s => !G.players[s].ai);
  if (!pend.length) return;
  UI.holder = -1; UI.sel = []; UI.twin = false; UI.rec = null;
  pushCard({ kind: 'pass', seat: pend[0], title: 'Pass the device to ' + pname(pend[0]), sub: 'Hands are hidden', body: h('p', 'Hand the device to ' + pname(pend[0]) + '. The plates on their belt stay hidden until they press the button.'), buttons: [{ label: pname(pend[0]) + ' is ready', a: 'take' }] });
  render();
}
function takeDevice() {
  const c = UI.cards[0]; if (!c || c.kind !== 'pass') return; UI.cards.shift(); UI.holder = c.seat; UI.sel = []; UI.twin = false;
  drawCard(); render(); schedule();
}
// ---------- the reveal / pass / round sequence ----------
const keyOfCard = c => { const k = c.key; return ICONS[k] ? 'roll' : NIG[k] ? (c.w >= 0 ? 'pn-' : 'n-') + k : k === 'pudding' ? 'pud' : k; };
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playResolve(q[0], q[1]); } }
async function playResolve(evs, preHand) {
  if (UI.busy) { UI.rq.push([evs, preHand]); return; }
  const tok = UI.seq; UI.busy = true; closePop(); recapReveal(evs);
  const rv = evs.find(e => e.t === 'reveal'), ps = evs.find(e => e.t === 'pass'), sc = evs.find(e => e.t === 'score'), ge = evs.find(e => e.t === 'gameEnd');
  const v = viewSeat(), np = G.np, block = !NET.on;
  try {
    const T = sc ? sc.seats.map(s => s.table.map(e => ({ id: e.id, w: e.w }))) : G.players.map(p => p.table.map(e => ({ id: e.id, w: e.w })));
    const before = T.map((t, s) => { const pk = rv.picks[s]; const ids = new Set(pk.cards.map(c => c.id)); const b = t.filter(e => !ids.has(e.id)); if (pk.chop >= 0) b.push({ id: pk.chop, w: -1 }); return b; });
    let hand = null;
    if (v >= 0 && preHand) { const pk = rv.picks[v]; const gone = new Set(pk.cards.map(c => c.id)); hand = preHand.filter(id => !gone.has(id)); if (pk.chop >= 0) hand.push(pk.chop); }
    const backN = hand ? hand.length : (ps ? ps.sizes[0] : 0);
    const pudSub = sc ? T.map(t => t.filter(e => tkey(e.id) === 'pudding').length) : new Array(np).fill(0);
    UI.fz = { tables: before, slots: rv.picks.map(() => ({ mode: 'cover' })), hand: hand || (hotSeat() || v < 0 ? null : []), backN, pudSub, roundEnd: false, say: 'Everyone has chosen. The plates are under covers…' };
    if (!hand && v < 0) UI.fz.hand = null;
    UI.sel = []; UI.twin = false; UI.rec = null;
    render(); await wait(450); if (tok !== UI.seq) return;
    // 2: the covers lift together
    UI.fz.slots = rv.picks.map(p => ({ mode: 'faces', cards: p.cards })); UI.fz.say = 'Reveal! ' + rv.picks.map(p => pname(p.seat) + ': ' + p.cards.map(c => TY[c.key].name).join(' + ')).join(' · ');
    render();
    if (ANIM) { snd('cloche'); const hosts = $$('#tbl .hostc'); try { pxReveal(); await KIT.revealAll(hosts, { stagger: 110 }); } catch (e) { } await wait(850); } if (tok !== UI.seq) return;
    // 3: plates land on the counters
    const land = new Set(); rv.picks.forEach(p => p.cards.forEach(c => land.add(p.seat + '|' + keyOfCard(c)))); UI.land = land;
    UI.fz.slots = null; UI.fz.tables = T; UI.fz.say = ps ? 'The plates land. Hands slide to the left…' : 'The plates land. The round is over!';
    if (sc) { UI.fz.roundEnd = true; UI.fz.hand = []; UI.fz.backN = 0; }
    render(); snd('clink'); await wait(750); if (tok !== UI.seq) return;
    if (ps) {
      // 4: every hand moves one seat to the left
      if (ANIM) { try { if (PX.on) { snd('pass'); await pxPassOut(); if (!pxPackets(ps.sizes)) animatePass(ps.sizes); } else { await slideOutBelt(); animatePass(ps.sizes); snd('pass'); } } catch (e) { } }
      UI.fz = null; UI.enter = v >= 0 ? 'pass' : ''; render();
      await wait(ANIM ? 900 : 0); if (tok !== UI.seq) return;
      UI.busy = false; render(); schedule(); drainQ(); if (NET.on && isHost()) netPush(true); return;
    }
    if (sc) {
      if (block) { showRound(sc, ge); return; }   // the table stays frozen under the score pad until Continue
      UI.fz = null; UI.enter = 'deal'; UI.busy = false; render(); showRound(sc, ge); schedule(); drainQ(); return;
    }
    UI.fz = null; UI.busy = false; render(); schedule(); drainQ();
  } catch (e) { console.error(e); UI.fz = null; UI.busy = false; try { render(); schedule(); } catch (x) { } }
}
function slideOutBelt() {
  const b = $('#belt'); if (!b || !b.animate) return Promise.resolve();
  return new Promise(res => { const a = b.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-70vw)', opacity: .2 }], { duration: 420 * Math.max(.5, AIDELAY / 650), easing: 'ease-in' }); a.onfinish = () => res(); setTimeout(res, 800); });
}
function animatePass(sizes) {
  if (!document.body.animate) return;
  const np = G.np, rect = s => { const e = document.querySelector('.seat[data-seat="' + s + '"] .sh'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 - 15, y: r.top + r.height / 2 - 21 }; };
  for (let s = 0; s < np; s++) {
    const a = rect(s), b = rect((s + 1) % np); if (!a || !b) continue;
    const el = h('div.pkt'); el.innerHTML = KIT.backSVG({ w: 30 }); el.appendChild(h('b', String(sizes ? sizes[s] : ''))); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el);
    const an = el.animate([{ transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 0 }, { transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 1, offset: .12 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 1, offset: .88 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 0 }], { duration: 900 * Math.max(.5, AIDELAY / 650), easing: 'ease-in-out' });
    an.onfinish = () => el.remove(); setTimeout(() => el.remove(), 1500);
  }
}
// after the score pad: the next round is dealt (or the final screen)
function afterRound(ge) {
  if (UI.rsInfo) UI.rsInfo.skip = true;
  UI.fz = null; UI.busy = false; UI.enter = G.phase === 'over' ? '' : 'deal';
  const rs = $('#rs'); rs.hidden = true; rs.innerHTML = ''; UI.rsOpen = false; clearTimeout(UI.rsT);
  render();
  if (G.phase === 'over') { showFinal(); return; }
  snd('slide', { vol: .5 }); schedule(); drainQ(); if (NET.on && isHost()) netPush(true);
}
// ---------- save / load (local games only) ----------
// SAVE_V goes up whenever G or the save layout changes: an older save is then refused politely instead of resuming a broken meal
const SAVE_V = 2;
function hasSave() { return !!lsGet('kk_save'); }
function saveInfo() { try { const o = JSON.parse(lsGet('kk_save')); if (o && o.sv === SAVE_V && o.G && o.G.phase !== 'over') return { round: o.G.round, np: o.G.np, mode: o.mode }; } catch (e) { } return null; }
function save() {
  if (NET.on || !G || !UI.started || G.phase === 'over') return false;
  try { localStorage.setItem('kk_save', JSON.stringify({ sv: SAVE_V, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, holder: -1, coach: UI.coach, tut: UI.tut || null, t0: UI.t0 || 0 })); GNS.saved(GAME_ID, true); return true; } catch (e) { return false; }
}
// autosave: after every resolved turn (schedule runs after each one) and when the page is hidden or closed (iPhone app switch)
function autoSave() { if (!G || !UI.started || NET.on || G.phase === 'over') return; const k = G.round + '.' + G.turn + '.' + G.evN + '.' + G.players.map(p => p.picked ? 1 : 0).join(''); if (UI.svk === k) return; if (save()) UI.svk = k; }
function flushSave() { UI.svk = ''; autoSave(); }
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('kk_save')); } catch (e) { return false; }
  if (o && o.G && o.sv !== SAVE_V) { lsSet('kk_save', ''); try { GNS.saved(GAME_ID, false); } catch (e) { } toast('That saved meal is from an older version of the game, so it could not be resumed.'); if (!G) renderStart(); return 'old'; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  clearTimeout(UI.tm); UI.seq++; dropHold();
  G = o.G; try { if (KK.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  Object.assign(UI, { started: true, mode: o.mode || 'vs', cfg: o.cfg || null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, enter: 'deal', focus: 0, evN: G.evN, over: null, resultDone: false, earned: null, t0: o.t0 || Date.now(), tut: o.tut && o.tut.on ? { on: true, step: -1 } : null });
  if (o.coach) UI.coach = o.coach;
  recapSeats();
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.np ? o.chefs : null;
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showFinal(); else schedule();
  return true;
}
