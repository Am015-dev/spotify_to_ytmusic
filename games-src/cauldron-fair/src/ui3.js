// ===================== part 3: flow: new game, computer players, applying moves, events, hot-seat, save / load =====================
function cfgOf(o) {
  const c = Object.assign({}, DEF, UI.opt || {}, o || {});
  c.seats = (c.seats || DEF.seats).slice(); c.lvBy = Object.assign({}, DEF.lvBy, c.lvBy || {});
  return c;
}
// players: seat 0 = you (or the first person), the others follow
function newGame(mode, o) {
  o = o || {}; const c = cfgOf(o); clearTimeout(UI.tm0); Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++;
  let np = Math.max(2, Math.min(4, c.np || 3)); const me = c.me != null ? c.me : 0;
  let chars = [me]; for (const s of c.seats) { if (chars.length >= np) break; if (chars.indexOf(s) < 0) chars.push(s); } for (let k = 0; chars.length < np; k++) if (chars.indexOf(k) < 0) chars.push(k);
  np = chars.length; let ai = [], sets = c.sets; const lvOf = ch => (c.lvBy && c.lvBy[ch]) || TEMPER[ch];
  if (mode === 'guided') { np = 2; sets = 1; chars = [me, me === 1 ? 2 : 1]; ai = [null, 'easy']; }
  else if (mode === 'hot') ai = new Array(np).fill(null);
  else if (mode === 'ai') ai = chars.map(ch => lvOf(ch));
  else ai = chars.map((ch, i) => i === 0 ? null : lvOf(ch));
  const names = chars.map(ch => PN[ch]);
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0; UI.seed = null;
  G = CF.newGame({ players: np, seed, names, ai, chars, setMode: sets === 'random' ? 'random' : sets, guided: mode === 'guided' });
  UI.mode = mode; UI.cfg = c; UI.started = true; UI.holder = -1; UI.focus = 0; UI.evN = G.evN; UI.over = null; UI.overShown = false; UI.rsOpen = false; UI.repSeen = 0; UI.shopSel = []; UI.potSig = ''; UI.tip = null; UI.tipq = []; UI.tipShown = {};
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && mode !== 'guided' ? 'light' : UI.coach.level), seen: {} };
  if (mode === 'guided' && UI.coach.level === 'off') UI.coach.level = 'full';
  window.G = G; try { const st = $('#start'); if (st) st.hidden = true; } catch (e) { }
  closeRS && closeRS(true); try { GX.close(); } catch (e) { }
  if (mode !== 'ai') save();
  afterApply(true);
  sndMusic();
  if (mode === 'guided') tipStart();
  return G;
}
const stripM = m => { const o = Object.assign({}, m); delete o.label; return o; };
// the local click path: apply a move for a seat on this machine (host or offline) -- clients send it to the host instead
function act(m, seat) {
  if (!G || G.phase === 'over') return false;
  seat = seat == null ? viewSeat() : seat; if (seat < 0) return false;
  if (typeof NET !== 'undefined' && NET.on && !isHost()) { return netAct(stripM(m)); }
  return commit(seat, stripM(m));
}
function commit(seat, m) {
  const r = CF.apply(G, seat, m);
  if (!r.ok) { if (!UI.sim) console.warn('refused', JSON.stringify(m), r.error); snd('error'); return false; }
  afterApply(false); return true;
}
function afterApply(first) {
  playEvents(first);
  if (UI.mode !== 'ai' && !(typeof NET !== 'undefined' && NET.on)) { if (G.phase === 'over') clearSave(); else save(); }
  updateHolder();
  if (typeof netPush === 'function' && typeof NET !== 'undefined' && NET.on && isHost()) netPush(false);
  tipCheck();
  checkReport();
  if (!UI.sim) render();
  checkFinal();
  schedule();
}
// ---------- events: sounds, animations, floating numbers ----------
function playEvents(first) {
  const evs = G.events.filter(e => e.n > UI.evN); UI.evN = G.evN; if (first || !evs.length) return;
  for (const e of evs) {
    try {
      switch (e.t) {
        case 'draw': if (e.how !== 'side') snd('draw'); break;
        case 'place': snd(e.ruby ? 'ruby' : 'plop'); setTimeout(() => snd('splash'), 120); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'side': if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'boom': snd('boom'); if (typeof pxEvent === 'function') pxEvent(e); if (isMine(e.seat) && !UI.sim) toast(e.prot ? 'Boom! But safe harbour saves your points.' : 'Your cauldron exploded!'); break;
        case 'flask': snd('flask'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'restart': snd('page'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'die': snd('die'); break;
        case 'gain': if (e.k === 'ruby') snd('ruby'); else if (e.k === 'vp') snd('coin'); else if (e.k === 'drop') snd('plop'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'buy': snd('buy'); break;
        case 'fortune': snd('page'); break;
        case 'round': snd('pass'); break;
        case 'eval': snd('round'); break;
        case 'gameEnd': snd('win'); break;
      }
    } catch (x) { console.error(x); }
  }
}
// ---------- the computer players ----------
function aiOK() { return !(typeof NET !== 'undefined' && NET.on && !isHost()); }
function schedule() {
  if (!G || !UI.started || G.phase === 'over' || !aiOK()) return;
  const pend = CF.pending(G);
  for (const s of pend) {
    const p = G.players[s]; if (!p.ai || UI.tm[s]) continue;
    if (UI.rsOpen && G.phase !== 'eval' && !UI.sim) continue;               // hold the next day until the report is closed
    if (UI.mode === 'guided' && (UI.tip && UI.tip.block) && !UI.sim) continue;
    if (UI.sim) { aiStep(s); continue; }
    let d = AIDELAY * (0.55 + Math.random() * 0.9); if (G.phase === 'brew' && p.st === 'draw' && p.pot.length === 0) d *= 0.7; if (G.phase !== 'brew') d *= 0.6;
    const seq = UI.seq; UI.tm[s] = setTimeout(() => { UI.tm[s] = 0; if (seq !== UI.seq) return; aiStep(s); }, d);
  }
}
function aiStep(s) {
  if (!G || G.phase === 'over' || !G.players[s] || !G.players[s].ai) return;
  if (CF.pending(G).indexOf(s) < 0) return;
  if (UI.rsOpen && G.phase !== 'eval' && !UI.sim) return;
  let m; try { m = CF.AI.choose(G, s); } catch (e) { console.error(e); m = null; }
  if (!m) { const l = CF.moves(G, s); m = l[0]; }
  if (!m) return;
  if (!commit(s, stripM(m))) { const l = CF.moves(G, s); if (l.length) commit(s, stripM(l[0])); }
}
// test hook: run every computer step at once (UI.sim = true skips animations and timers); returns when nothing is left for a computer to do
UI.simAll = function (max) { UI.sim = true; let n = 0; try { for (; n < (max || 2000); n++) { const pend = CF.pending(G).filter(s => G.players[s].ai); if (!pend.length) break; aiStep(pend[0]); } } finally { UI.sim = false; } render(); return n; };
// ---------- hot-seat: whose turn is it on the device ----------
function updateHolder() {
  if (!hotSeat()) { UI.pass = null; return; }
  const pend = CF.pending(G).filter(s => !G.players[s].ai);
  if (UI.holder >= 0 && pend.indexOf(UI.holder) >= 0) { UI.pass = null; return; }
  if (!pend.length) { if (UI.holder >= 0 && G.phase === 'over') UI.holder = -1; UI.pass = null; return; }
  const order = pend.slice().sort((a, b) => ((a - G.start + G.np) % G.np) - ((b - G.start + G.np) % G.np));
  UI.holder = -1; UI.pass = order[0]; UI.focus = order[0];
}
function takeDevice() { if (UI.pass == null) return; UI.holder = UI.pass; UI.focus = UI.pass; UI.pass = null; render(); checkReport(); }
// ---------- save / load ----------
function loadSave() {
  try {
    const o = JSON.parse(localStorage.getItem('cf_save') || 'null'); if (!o || o.v !== SAVEV || !o.G) return false;
    Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++;
    G = o.G; window.G = G; UI.mode = o.mode || 'vs'; UI.cfg = o.cfg; UI.started = true; UI.holder = -1; UI.focus = o.focus || 0; UI.evN = G.evN; UI.rsOpen = false; UI.repSeen = G.rep ? G.rep.round : 0; UI.over = null; UI.overShown = false; UI.potSig = ''; UI.tip = null; UI.tipq = [];
    UI.coach = { level: UI.coach.level, seen: {} }; const st = $('#start'); if (st) st.hidden = true; closeRS && closeRS(true);
    afterApply(true); sndMusic(); toast('Welcome back.'); return true;
  } catch (e) { console.error(e); return false; }
}
