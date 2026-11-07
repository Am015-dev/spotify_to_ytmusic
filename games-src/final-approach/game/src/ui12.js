// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged two-round flight that teaches every control by doing it once =====================
// The staged flight is the end of a real flight at Port Alder: round 1 at 1000 ft (the plane must reach the airport) and the landing round at 0 ft. Some switches are already set
// (two gears, one flap, the 2 brake), you hold one reroll token, the dice are made up (TUT_SCRIPT) and the co-pilot is scripted (TUT_AI), so every control has a die to teach with.
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act). Nothing of it is saved.
const TUT_GAME = 'final-approach';
// dice per round [pilot x4, co-pilot x4]; the pilot's first die in the landing round is a 2 that the reroll turns into a 5 (TUT_SETUP.pre.rrScript)
const TUT_SCRIPT = [[[3, 5, 2, 1], [5, 2, 6, 4]], [[2, 3, 5, 1], [2, 5, 3, 1]]];
const TUT_SETUP = { scenario: 'tt', seed: 23, row0: 5, pre: { lg: [1, 1, 0], fl: [1, 0, 0, 0], br: [1, 0, 0], rr: 1, script: TUT_SCRIPT, rrScript: [[5, 0, 0, 0], [0, 0, 0, 0]] } };
// the co-pilot's placements, in order: [slot, index of the die]
const TUT_AI = [[['ax1', 0], ['fl1', 1], ['en1', 2], ['fl2', 3]], [['en1', 0], ['ax1', 2], ['fl3', 1], ['co0', 3]]];
const tutGame = () => !!(UI.cfg && UI.cfg.tutorial && UI.started && G && G.sid === 'tt');
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && tutGame();
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart });
function firstTime() { try { return newPlayer() && !localStorage.getItem('fa_offer'); } catch (e) { return false; } }
// ---------------------------------------------------------------- the computer crew is scripted
function tutAI(g, seat) {
  if (!tutGame() || seat !== 1 || !g || g.result) return null;
  if (g.phase === 'brief') { if (!g.ready[1]) { if (g.round === 0 && !g.say[1].length) return { t: 'say', c: 'adv2' }; return { t: 'ready' }; } return null; }
  if (g.pend && g.pend.h === 'rr') return g.pend.d.m[1] ? null : { t: 'rrpick', m: [false, false, false, false] };
  return null;   // placements are the real computer's: the first game is free play
}
(function () { const o = FA.AI.move; FA.AI.move = function (g, seat, level, opt) { const m = tutAI(g, seat); return m || o.apply(this, arguments); }; })();
// ---------------------------------------------------------------- where each step points
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; };
const tDie = (s, d) => tq('#pz .die[data-s="' + s + '"][data-d="' + d + '"]');
const tSlot = k => tq('#pz .slot[data-slot="' + k + '"]');
const placed = () => Object.keys(G.slots).length;
// my turn, in this round, after this many dice are on the panel, nothing pending
const myMove = (round, n) => !!G && !G.result && G.round === round && G.phase === 'place' && !G.pend && G.turn === 0 && placed() === n;
// the die is lifted already, so a placement step is one tap on the glowing space
function tutPick(d) {
  if (UI.sel === d) return true;
  if (!G || G.phase !== 'place' || G.pend || G.turn !== 0 || G.dice[0][d].u) return false;
  UI.sel = d; UI.cof = 0; UI.warnK = null; render(); return UI.sel === d;
}
const dv = d => G.dice[0][d].v;
const rival = () => name(1);
const planeAt = () => G.planes.findIndex(n => n > 0) + 1;
// a step that puts die d on slot k: the slot is the target, the die stays lit, the finger drags from the die
const placeStep = (id, title, say, round, n, d, k, extra) => Object.assign({ id, title, say, target: tSlot(k), also: tDie(0, d), from: tDie(0, d),
  wait: { type: 'drag', match: a => a.what === 'slot' && a.ok && a.k === k }, ready: () => myMove(round, n) && tutPick(d) }, extra || {});
// ---------------------------------------------------------------- the kit hooks
function tutStart(o) {
  const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  try { GX.close(); } catch (e) { } try { if (typeof GXC !== 'undefined') GXC.close(); } catch (e) { } UI._aid = UI._aid || AIDELAY; AIDELAY = Math.min(AIDELAY, 700);
  closeRS(); newGame('vs', { scenario: 'tt', role: 0, level: 'normal', abil: [], tutorial: true, tipsOff: true });
  UI.fc = { seen: {}, queue: [], cur: null, pro, first, ended: false, t: 0 }; fcSay('intro'); clearInterval(UI.fcT); UI.fcT = setInterval(fcPoll, 450);
}
// leave the staged flight: nothing of it is saved, the computer stops and the board goes quiet behind the menu
function tutLeave() {
  clearInterval(UI.fcT); UI.fc = null; document.querySelectorAll('.fa-coach,.fa-fin').forEach(e => e.remove());
  clearTimeout(UI.tm); UI.seq++; UI.started = false; UI.sel = -1; UI.cof = 0; if (UI._aid) { AIDELAY = UI._aid; UI._aid = 0; }
  try { hideRecap(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { if (typeof pxClearEnd === 'function') pxClearEnd(); } catch (e) { }
  $$('#fx .gh,#fx .endb,#fx .pop').forEach(e => e.remove()); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a player with chapter progress goes straight to the chapter map
function storyGate() {
  if (typeof GXT === 'undefined' || GXT.isDone(TUT_GAME) || !newPlayer()) return false;
  tutStart({ prologue: true }); return true;
}
// a first-time Play: offer the tutorial once ("New here? Learn in 5 minutes"), or just play
function tutOffer() {
  try { localStorage.setItem('fa_offer', '1'); } catch (e) { }
  const d = document.createElement('div'); d.className = 'gxt-end'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'New here?');
  d.innerHTML = '<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn every control in about 5 minutes, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-offer="play">Just play</button></div></div>';
  d.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-offer]'); if (!b) return; d.remove(); if (b.dataset.offer === 'learn') tutStart(); else playNow(); });
  document.body.appendChild(d);
}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function () { const o = dieTap; dieTap = function (s, d) { if (tutOn() && !GXT.act({ type: 'tap', what: 'die', s, d, rr: !!(G.pend && G.pend.h === 'rr') })) return; return o(s, d); }; })();
(function () {
  const o = slotTap; slotTap = function (k) {
    if (tutOn()) { const v = actSeat(), ok = typeof v === 'number' && v >= 0 && typeof UI.sel === 'number' && UI.sel >= 0 && !G.slots[k] && FA.validMoves(G, v).some(m => m.t === 'place' && m.d === UI.sel && m.to === k && (m.c || 0) === UI.cof);
      if (!GXT.act({ type: 'tap', what: 'slot', k, ok })) return; }
    return o(k);
  };
})();
(function () {
  const o = doAction; doAction = function (a, t) {
    if (tutOn()) { if (!GXT.act({ type: 'tap', what: 'act', a, c: t && t.dataset && t.dataset.c != null ? +t.dataset.c : 0 })) return; if (a === 'rr') UI.rrAsk = true; }
    return o(a, t);
  };
})();
// ---------------------------------------------------------------- the tutorial as a story
const TS = () => (window.CAMPAIGN && window.CAMPAIGN.tutorial) || null;
function tsCast(id) { const C = window.CAMPAIGN.cast; return C[id] || C.chief; }
function tsFill(t) {
  const d = i => (G && G.dice && G.dice[0][i]) ? G.dice[0][i].v : '?', en1 = G && G.slots && G.slots.en1 ? G.slots.en1.v : '?';
  const x = { rival: name(1), d0: d(0), d1: d(1), d2: d(2), d3: d(3), en1, ax1: G && G.slots && G.slots.ax1 ? G.slots.ax1.v : '?', planeAt: G ? planeAt() : '?',
    sumE: typeof en1 === 'number' ? en1 + d(1) : '?', aeroB: G ? G.pl.aeroB : '?', aeroO: G ? G.pl.aeroO : '?', tilt: G ? Math.abs(G.pl.axis) : '?', tdir: G && G.pl.axis < 0 ? 'left' : 'right', brake: G ? FA.brakeVal(G) : '?' };
  return String(t).replace(/\{(\w+)\}/g, (m, k) => x[k] != null ? String(x[k]) : m);
}
function tsPortrait(who) {
  const c = tsCast(who), e = h('span.fa-por', { 'aria-hidden': 'true' }); e.style.setProperty('--fa-pc', c.color || '#2f4f7a');
  if (c.portrait) e.style.backgroundImage = 'url(media/' + c.portrait + ')';
  e.setAttribute('data-e', c.emoji || '');   // the emoji is drawn by CSS (not a text node): it sits under the painting until it loads
  return e;
}
function tsReact(text, who) {
  $$('.fa-react').forEach(e => e.remove());
  const e = h('div.fa-react', { 'aria-hidden': 'true' }, tsPortrait(who || 'chief'), h('span', text)); document.body.appendChild(e);
  setTimeout(() => e.classList.add('out'), 2300); setTimeout(() => { try { e.remove(); } catch (er) { } }, 2700);
}

// ---------------------------------------------------------------- the coached first game (owner, 7 Nov 2026: the tutorial must be a GAME, not tap-tap)
// A real game from turn 1, every legal move allowed (the dice are stacked, the computer is the real one). Voss speaks just-in-time, one bubble at a time, never blocking input;
// text lives in campaign.json tutorial.coach. Each rule is said the first time it matters; rules that never came up go to "Things you'll meet later" at the end.
const FC_CORE = ['seats', 'goal', 'turns', 'axis', 'radio', 'engines', 'gear', 'flaps', 'brakes', 'coffee', 'reroll', 'rounds', 'final'];
function fcSay(id) {
  const F = UI.fc, T = TS(); if (!F || !T || !T.coach[id] || F.seen[id]) return; F.seen[id] = true; F.queue.push({ id, text: T.coach[id] }); fcPump();
}
function fcHide() { const F = UI.fc; if (!F || !F.cur) return; const c = F.cur; F.cur = null; clearTimeout(c.t); c.el.classList.add('out'); setTimeout(() => { try { c.el.remove(); } catch (e) { } }, 250); setTimeout(fcPump, 450); }
function fcPump() {
  const F = UI.fc; if (!F || F.cur || !F.queue.length || F.ended) return; const q = F.queue.shift(), txt = tsFill(q.text);
  const x = h('button.x', { type: 'button', 'aria-label': 'Got it' }, '×'); x.addEventListener('click', e => { e.stopPropagation(); fcHide(); });
  const el = h('div.fa-coach', { role: 'status', 'data-coach': q.id }, tsPortrait(q.fb ? 'ravi' : 'chief'), h('span.t', txt), x); document.body.appendChild(el);
  const words = txt.split(/\s+/).length; F.cur = { el, id: q.id, t: setTimeout(fcHide, Math.max(5500, words * 380)) };
}
function fcFeedback(text) { const F = UI.fc; if (!F || F.cur || F.queue.length || F.ended || !text) return; F.queue.push({ id: 'fb', text: 'Your move: ' + text, fb: 1 }); fcPump(); }
function fcPoll() {
  const F = UI.fc; if (!F) return; if (!G || !UI.started || !tutGame()) return;
  if (G.result) { if (!F.ended) { F.ended = true; fcHide(); setTimeout(fcEnd, 1400); } return; }
  const sl = G.slots, has = re => Object.keys(sl).some(k => re.test(k)), mine = G.phase === 'place' && !G.pend && G.turn === 0;
  if (G.pend && G.pend.h === 'rr') fcSay('reroll');
  if (G.phase === 'place' && G.round === 0) { fcSay('seats'); fcSay('goal'); fcSay('turns'); }
  if (has(/^ax/)) fcSay('axis'); if (has(/^ra/) || (mine && F.seen.turns && planeAt() > 0 && G.planes.some(n => n > 0))) fcSay('radio');
  if (has(/^en/)) fcSay('engines'); if (has(/^lg/)) fcSay('gear'); if (has(/^fl/)) fcSay('flaps'); if (has(/^br/)) fcSay('brakes');
  if (has(/^co/) || G.coffee > 0 && mine) fcSay('coffee'); if (G.rrHand > 0 && mine && Object.keys(sl).length >= 2) fcSay('reroll');
  if (G.round >= 1) fcSay('rounds'); if (FA.isFinal(G) && G.phase === 'place') { fcSay('final'); fcSay('brakes'); }
}
// the end: the landing check rule by rule with the real numbers, then what did not come up
function fcEnd() {
  const F = UI.fc, T = TS(); if (!F || !T || !G || !G.result) return; const win = !!G.result.win;
  clearInterval(UI.fcT); try { GXT.markDone(TUT_GAME); } catch (e) { }
  const later = FC_CORE.filter(k => !F.seen[k]).map(k => tsFill(T.coach[k])).concat(T.later); F.later = later;
  const rows = landList().map(r => h('li.' + (r[0] === true ? 'ok' : 'no'), h('b', r[0] === true ? '✓' : '✗'), h('span', r[1])));
  const btn = (id, label, pri) => { const b = h('button.fb' + (pri ? '.pri' : ''), { type: 'button', 'data-fin': id }, label); return b; };
  const el = h('div.fa-fin', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Check ride result' },
    h('div.fc', tsPortrait(win ? 'chief' : 'pell'), h('h2', win ? 'Check ride passed' : 'Not this time'), h('p', T.endText[win ? 'win' : 'lose']),
      h('h3', 'Your final check'), h('ul.fchk', ...rows), win ? null : h('p.why', lossText(G.result)),
      h('div.fr', win && F.pro && F.first ? btn('chapter', 'Start chapter 1', 1) : btn(win ? 'menu' : 'again', win ? 'Back to menu' : 'Try again', 1), win ? btn('again', 'Fly it again') : btn('menu', 'Back to menu')),
      h('h3', 'Things you will meet later'), h('ul.flat', ...later.map(t => h('li', t)))));
  el.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-fin]'); if (!b) return; const id = b.dataset.fin, pro = F.pro, first = F.first;
    tutLeave();
    if (id === 'chapter' && first) { showStart(); GXC.play(first.id); } else if (id === 'again') tutStart({ prologue: pro }); else showStart();
  });
  document.body.appendChild(el);
}
