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
    else { names.push(PN[c]); ai.push(mode === 'guided' ? 'normal' : lv); }
  }
  UI.chefs = chefs;
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  G = KK.newGame({ players: np, seed, names, ai, twist: o.twist || null });
  UI.news = null; UI.tip = null; Object.assign(UI, { started: true, mode, cfg: { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null }, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, over: null, enter: 'deal', land: null, focus: 0, overShown: false, evN: G.evN });
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && UI.coach.keep ? 'full' : UI.coach.userOff ? 'off' : 'light'), seen: {}, turn: '', keep: UI.coach.keep, userOff: UI.coach.userOff };
  if (mode === 'guided') UI.coach.level = 'full';
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
  let mv; try { mv = KK.AI.choose(G, seat, undefined, UI.camp && UI.camp.twist && UI.camp.twist.id === 'long-think' ? { units: UI.camp.twist.param || 250 } : undefined); } catch (e) { console.error(e); mv = KK.moves(G, seat)[0]; }
  flyAI(seat); commit(seat, mv);
}
// a computer's pick: a covered plate hops from its diner to its seat (about half a second), then the cover lands
function flyAI(seat) {
  try {
    if (!ANIM || !document.body.animate || pxRM() || seat === viewSeat()) return;
    const sh = document.querySelector('.seat[data-seat="' + seat + '"] .sh'), sl = document.querySelector('.seat[data-seat="' + seat + '"] .slot .sbox'); if (!sh || !sl) return;
    const a = sh.getBoundingClientRect(), b = sl.getBoundingClientRect(); if (!a.width || !b.width) return;
    const c = h('div.flyc'); c.style.cssText = 'left:' + (a.left + a.width / 2 - 16) + 'px;top:' + (a.top + a.height / 2 - 22) + 'px;width:32px;height:45px'; c.innerHTML = KIT.backSVG({ w: 32 }); document.body.appendChild(c);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const an = c.animate([{ transform: 'translate(0,0) scale(.8)', opacity: .2 }, { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 18) + 'px) scale(1.1)', opacity: 1, offset: .5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.9)', opacity: .9 }], { duration: Math.round(480 * Math.max(.5, Math.min(1.6, AIDELAY / 650))), easing: 'ease-in-out' });
    const done = () => c.remove(); an.onfinish = done; setTimeout(done, 1200);
  } catch (e) { }
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
  const cur = UI.sel.slice(), one = UI.prefs.grab1 !== false;
  if (UI.twin) {
    const k = cur.indexOf(i);
    if (k >= 0) cur.splice(k, 1); else { if (cur.length >= 2) cur.shift(); cur.push(i); }
    UI.sel = cur; UI.rec = null;
    if (one && cur.length === 2) { grabNow(); return; }   // Twin Sticks: the second dish grabs both
    snd('click', { vol: .4 }); render(); return;
  }
  if (one) { UI.sel = [i]; UI.rec = null; grabNow(); return; }   // one tap grabs the dish: it flies to your seat under a cover
  if (cur.length === 1 && cur[0] === i && UI.prefs.tap2) { serveSel(); return; }
  UI.sel = [i]; UI.rec = null; snd('click', { vol: .4 }); render();
}
// the chosen dishes get .sel on the belt first, so the flight to the seat starts from them
function grabNow() { for (const b of $$('#belt .hc[data-i]')) b.classList.toggle('sel', UI.sel.indexOf(+b.dataset.i) >= 0); lsSet('kk_grab', '1'); UI.coach.seen.grabbed = 1; serveSel(); }
function serveSel() {
  const v = viewSeat(); if (!canPick() || !UI.sel.length) return;
  const pick = UI.sel.slice().sort((a, b) => a - b);
  const mv = myMoves().find(m => mkey(m) === pick.join(','));
  if (!mv) { snd('error'); toast('That choice is not allowed.'); return; }
  doPick(v, mv);
}
function doPick(seat, mv) {
  // the lifted plate flies to the seat under a cover
  try { if (ANIM && !pxServe() && document.body.animate) flyPick(); } catch (e) { } UI.flyFrom = null;
  if (isClient()) { netAct({ pk: mv.pick.join(',') }); UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render(); return; }
  commit(seat, mv);
}
function flyPick() {
  const sels = $$('#belt .hc.sel'); if (!sels.length) return; const v = viewSeat(); const slot = document.querySelector('.seat[data-seat="' + v + '"] .slot');
  const to = slot ? slot.getBoundingClientRect() : null; if (!to || !to.width) return;
  sels.forEach((b, k) => {
    const r = k === 0 && UI.flyFrom ? UI.flyFrom : b.getBoundingClientRect(); const c = h('div.flyc'); c.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px'; c.innerHTML = KIT.backSVG({ w: Math.round(r.width) }); document.body.appendChild(c);
    const dx = to.left + to.width / 2 - (r.left + r.width / 2), dy = to.top + to.height / 2 - (r.top + r.height / 2);
    const a = c.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * .6 + 'px,' + (dy * .6 - 30) + 'px) scale(.8)', opacity: 1, offset: .55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + Math.max(.25, to.width / r.width) + ')', opacity: .85 }], { duration: 480, easing: 'ease-in-out' });
    a.onfinish = () => c.remove(); setTimeout(() => c.remove(), 900);
  });
  snd('slide', { vol: .5 }); UI.flyFrom = null;
}
function toggleTwin() {
  UI.coach.seen.twinUsed = 1;
  const v = viewSeat(); if (!canPick() || !KK._.hasChop(G.players[v]) || G.players[v].hand.length < 2) { UI.twin = false; render(); return; }
  UI.twin = !UI.twin; if (!UI.twin && UI.sel.length > 1) UI.sel = UI.sel.slice(0, 1);
  render();
}
function hint() {
  const v = viewSeat(); if (!canPick()) return;
  let mv; try { mv = KK.AI.choose(G, v, 'normal'); } catch (e) { return; }
  if (!mv) return;
  UI.rec = { ids: mv.ids.slice(), pick: mv.pick.slice(), turn: G.round + '.' + G.turn };
  // one tap grabs: the hint only glows the dish (a ghost finger points at it); otherwise it lifts it as before
  UI.twin = mv.pick.length === 2; UI.sel = UI.prefs.grab1 === false ? mv.pick.slice() : []; render();
}
// ---------- hot-seat ----------
function hotNext() {
  if (!hotSeat() || UI.cards.length || UI.busy) return;
  if (UI.holder >= 0 && !G.players[UI.holder].picked) return;
  const pend = KK.pending(G).filter(s => !G.players[s].ai);
  if (!pend.length) return;
  UI.holder = -1; UI.sel = []; UI.twin = false; UI.rec = null;
  pushCard({ kind: 'pass', seat: pend[0], title: 'Pass to ' + pname(pend[0]), sub: '', body: h('span'), buttons: [{ label: pname(pend[0]) + ' is ready', a: 'take' }] });
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
  const tok = UI.seq; UI.busy = true; closePop();
  const rv = evs.find(e => e.t === 'reveal'), ps = evs.find(e => e.t === 'pass'), sc = evs.find(e => e.t === 'score'), ge = evs.find(e => e.t === 'gameEnd');
  const v = viewSeat(), np = G.np, block = !NET.on;
  try {
    const T = sc ? sc.seats.map(s => s.table.map(e => ({ id: e.id, w: e.w }))) : G.players.map(p => p.table.map(e => ({ id: e.id, w: e.w })));
    const before = T.map((t, s) => { const pk = rv.picks[s]; const ids = new Set(pk.cards.map(c => c.id)); const b = t.filter(e => !ids.has(e.id)); if (pk.chop >= 0) b.push({ id: pk.chop, w: -1 }); return b; });
    let hand = null;
    if (v >= 0 && preHand) { const pk = rv.picks[v]; const gone = new Set(pk.cards.map(c => c.id)); hand = preHand.filter(id => !gone.has(id)); if (pk.chop >= 0) hand.push(pk.chop); }
    const backN = hand ? hand.length : (ps ? ps.sizes[0] : 0);
    const pudSub = sc ? T.map(t => t.filter(e => tkey(e.id) === 'pudding').length) : new Array(np).fill(0);
    UI.fz = { tables: before, slots: rv.picks.map(() => ({ mode: 'cover' })), hand: hand || (hotSeat() || v < 0 ? null : []), backN, pudSub, roundEnd: false, scoring: !!sc, say: 'Everyone has chosen. The plates are under covers…' };
    if (!hand && v < 0) UI.fz.hand = null;
    UI.sel = []; UI.twin = false; UI.rec = null;
    UI.fast = false; render(); await wait(300); if (tok !== UI.seq) return;
    // 2: the covers lift together, big, in the middle of the table (ui8: the reveal stage); without it, in the seats
    UI.fz.say = 'Reveal! ' + rv.picks.map(p => pname(p.seat) + ': ' + p.cards.map(c => TY[c.key].name).join(' + ')).join(' · ');
    const gains = (() => { try { const a = liveScores(before), b = liveScores(T); return b.map((x, s) => x.total - a[s].total); } catch (e) { return null; } })();
    if (ANIM && stageOK()) { try { await stageReveal(rv.picks, tok, gains); } catch (e) { console.error(e); stageClear(); } }
    else {
      UI.fz.slots = rv.picks.map(p => ({ mode: 'faces', cards: p.cards }));
      render();
      if (ANIM) { snd('cloche'); const hosts = $$('#tbl .hostc'); try { pxReveal(); await KIT.revealAll(hosts, { stagger: 110 }); } catch (e) { } await wait(850); }
    }
    if (tok !== UI.seq) return;
    // 3: plates land on the counters
    const land = new Set(); rv.picks.forEach(p => p.cards.forEach(c => land.add(p.seat + '|' + keyOfCard(c)))); UI.land = land;
    try { UI.news = buildNews(before, T, rv.picks, !!sc); } catch (e) { UI.news = null; }
    UI.fz.slots = null; UI.fz.tables = T; UI.fz.say = ps ? 'The plates land. Hands slide to the left…' : 'The plates land. The round is over!';
    if (sc) { UI.fz.roundEnd = true; UI.fz.hand = []; UI.fz.backN = 0; }
    render(); stageClear(); snd('clink'); try { scorePops(before, T); } catch (e) { } await wait(800); if (tok !== UI.seq) return;
    if (ps) {
      // 4: every hand moves one seat on, visibly: your dishes ride the belt off to the next diner, the next hand rides in
      if (ANIM) { try { await passAlong(ps.sizes); } catch (e) { console.error(e); } }
      UI.fz = null; UI.enter = v >= 0 ? 'pass' : ''; render(); passDone();
      await wait(ANIM ? 450 : 0); if (tok !== UI.seq) return;
      UI.busy = false; render(); schedule(); drainQ(); if (NET.on && isHost()) netPush(true); return;
    }
    if (sc) {
      if (block) { showRound(sc, ge); return; }   // the table stays frozen under the score pad until Continue
      UI.fz = null; UI.enter = 'deal'; UI.busy = false; render(); showRound(sc, ge); schedule(); drainQ(); return;
    }
    UI.fz = null; UI.busy = false; render(); schedule(); drainQ();
  } catch (e) { console.error(e); UI.fz = null; UI.busy = false; try { stageClear(); passDone(); render(); schedule(); } catch (x) { } }
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
  try { localStorage.setItem('kk_save', JSON.stringify({ sv: SAVE_V, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, holder: -1, coach: UI.coach })); return true; } catch (e) { return false; }
}
// autosave: after every resolved turn (schedule runs after each one) and when the page is hidden or closed (iPhone app switch)
function autoSave() { if (!G || !UI.started || NET.on || G.phase === 'over') return; const k = G.round + '.' + G.turn + '.' + G.evN + '.' + G.players.map(p => p.picked ? 1 : 0).join(''); if (UI.svk === k) return; if (save()) UI.svk = k; }
function flushSave() { UI.svk = ''; autoSave(); }
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('kk_save')); } catch (e) { return false; }
  if (o && o.G && o.sv !== SAVE_V) { lsSet('kk_save', ''); toast('That saved meal is from an older version of the game, so it could not be resumed.'); if (!G) renderStart(); return 'old'; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  clearTimeout(UI.tm); UI.seq++;
  G = o.G; try { if (KK.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  UI.news = null; UI.tip = null; Object.assign(UI, { started: true, mode: o.mode || 'vs', cfg: o.cfg || null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, enter: 'deal', focus: 0, evN: G.evN, over: null });
  if (o.coach) UI.coach = o.coach;
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.np ? o.chefs : null;
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showFinal(); else schedule();
  return true;
}
