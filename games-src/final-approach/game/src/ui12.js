// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged two-round flight that teaches every control by doing it once =====================
// The staged flight is the end of a real flight at Port Alder: round 1 at 1000 ft (the plane must reach the airport) and the landing round at 0 ft. Some switches are already set
// (two gears, one flap, the 2 brake), you hold one reroll token, the dice are made up (TUT_SCRIPT) and the co-pilot is scripted (TUT_AI), so every control has a die to teach with.
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act). Nothing of it is saved.
const TUT_GAME = 'final-approach';
// The coached first flight (owner, 8 Nov 2026: "the tutorial is not teaching the game"): the last four rounds at Port Alder (3000 ft to the runway) on an easy 4-space
// strip with one plane on space 3. Each round brings one system: 1 axis and engines (spare dice to Coffee), 2 radio and landing gear (plus the reroll token),
// 3 flaps and brakes, 4 the landing. The dice are made up (TUT_SCRIPT, checked by tut-sim.js: following the coach lands the plane); every legal move stays allowed.
// dice per round [pilot x4, co-pilot x4]
const TUT_SCRIPT = [[[3, 4, 2, 6], [3, 4, 1, 2]], [[2, 4, 3, 1], [4, 3, 2, 5]], [[2, 4, 5, 3], [3, 4, 1, 2]], [[2, 1, 3, 6], [4, 6, 2, 1]]];
const TUT_SETUP = { scenario: 'tt', seed: 23, row0: 3, pre: { script: TUT_SCRIPT } };
// the systems the coach (and the computer co-pilot) use each round; the player may still use anything legal
const TUT_ALLOW = [['axis', 'engines', 'conc'], ['axis', 'engines', 'conc', 'radio', 'gear'], ['axis', 'engines', 'conc', 'radio', 'gear', 'flaps', 'brakes'], null];
// the coach's advice: the computer's own judgement (AI.cost) over the moves of this round's systems; fair: only what this seat may know
function tutAdvise(g, seat, die) {
  let al = TUT_ALLOW[Math.min(g.round, 3)], best = null, bc = 1e9; const V = FA.stripView(g, seat); V.nolog = true;
  if (g.round === 0 && (!g.slots['ax' + seat] || !g.slots['en' + seat])) al = ['axis', 'engines'];   // round 1 teaches the two must-fill controls first
  if (g.phase === 'place' && !g.pend) for (const m of FA.validMoves(V, seat)) {
    if (m.t !== 'place' || m.d === 'p' || (m.c || 0) !== 0 || (al && !al.includes(FA.SLOT[m.to].grp)) || (die != null && m.d !== die)) continue;   // the coach never asks for coffee
    const S = FA.cloneLite(V); FA.performMove(S, m, seat, true); const c = FA.AI.cost(S, seat) - (seat === 1 && g.round >= 2 && FA.SLOT[m.to].grp === 'flaps' && !g.pl.sw.fl[FA.SLOT[m.to].ix] ? 5 : 0); if (c < bc) { bc = c; best = m; }
  }
  try { return best || FA.AI.move(g, seat, 'normal', { noMC: true }); } catch (e) { return null; }
}
const tutGame = () => !!(UI.cfg && UI.cfg.tutorial && UI.started && G && G.sid === 'tt');
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && tutGame();
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart });
function firstTime() { try { return newPlayer() && !localStorage.getItem('fa_offer'); } catch (e) { return false; } }
// ---------------------------------------------------------------- the computer crew is scripted
function tutAI(g, seat) {
  if (!tutGame() || seat !== 1 || !g || g.result) return null;
  if (g.phase === 'brief') { if (!g.ready[1]) { if (g.round === 0 && !g.say[1].length) return { t: 'say', c: 'adv2' }; return { t: 'ready' }; } return null; }
  if (g.pend && g.pend.h === 'rr') return g.pend.d.m[1] ? null : { t: 'rrpick', m: [false, false, false, false] };
  if (g.phase === 'place' && !g.pend && g.turn === 1) return tutAdvise(g, 1);   // the co-pilot sticks to this round's systems too
  return null;
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
if (!window.GXCOACH) window.GXCOACH = { running: false, explained: [], done: false };
function tutStart(o) {
  const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  try { GX.close(); } catch (e) { } try { if (typeof GXC !== 'undefined') GXC.close(); } catch (e) { } UI._aid = UI._aid || AIDELAY; AIDELAY = Math.min(AIDELAY, 700);
  closeRS(); newGame('vs', { scenario: 'tt', role: 0, level: 'normal', abil: [], tutorial: true, tipsOff: true });
  document.querySelectorAll('.fa-skip').forEach(e => e.remove());
  const sk = h('button.fa-skip', { type: 'button', 'aria-label': 'Skip the guided flight' }, 'Skip tutorial'); sk.addEventListener('click', e => { e.stopPropagation(); const wasPro = UI.fc && UI.fc.pro; tutLeave(); if (wasPro && typeof GXC !== 'undefined') { showStart(); GXC.open(); } else showStart(); }); document.body.appendChild(sk);
  UI.fc = { seen: {}, queue: [], cur: null, pro, first, ended: false, t: 0, goal: true }; window.GXCOACH = { running: true, explained: [], done: false }; UI.cpt = null; fcSay('intro'); clearInterval(UI.fcT); UI.fcT = setInterval(fcPoll, 450);
}
// leave the staged flight: nothing of it is saved, the computer stops and the board goes quiet behind the menu
function tutLeave() {
  if (window.GXCOACH && !window.GXCOACH.done) window.GXCOACH.running = false;
  clearInterval(UI.fcT); UI.fc = null; UI.cpt = null; document.querySelectorAll('.fa-coach,.fa-fin,.fa-skip').forEach(e => e.remove());
  clearTimeout(UI.tm); UI.seq++; UI.started = false; UI.sel = -1; UI.cof = 0; if (UI._aid) { AIDELAY = UI._aid; UI._aid = 0; }
  try { hideRecap(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { if (typeof pxClearEnd === 'function') pxClearEnd(); } catch (e) { }
  $$('#fx .gh,#fx .endb,#fx .pop').forEach(e => e.remove()); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a player with chapter progress goes straight to the chapter map
function storyGate() {
  // a first-time player's Play starts the coached flight (Learn to play); a clear Skip button leaves it for the chapter map
  return false;   // feel gate (8 Nov): Play is a clean game; Learn to play is its own title button
  if (typeof GXT === 'undefined' || GXT.isDone(TUT_GAME) || !newPlayer()) return false;
  tutStart({ prologue: true }); return true;
}
// a first-time Play: offer the tutorial once ("New here? Learn in 5 minutes"), or just play
function tutOffer(onPlay) {
  try { localStorage.setItem('fa_offer', '1'); } catch (e) { }
  const d = document.createElement('div'); d.className = 'gxt-end'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'New here?');
  d.innerHTML = '<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">A short guided landing: four rounds, one new control each round.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn" data-a="offeryes">Learn in 5 minutes</button><button type="button" class="gxt-b" data-offer="play" data-a="offerno">Just play</button></div></div>';
  d.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-offer]'); if (!b) return; d.remove(); if (b.dataset.offer === 'learn') tutStart({ prologue: !!onPlay }); else if (onPlay) onPlay(); else playNow(); });
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
// one bubble only: [a rule that just became relevant] + [what to do now and why]. It never blocks input; x hides it until the situation changes.
function fcSay(id) { const F = UI.fc, T = TS(); if (!F || !T || !T.coach[id] || F.seen[id]) return; F.seen[id] = true; try { window.GXCOACH.explained.push(id); } catch (e) { } F.queue.push(tsFill(T.coach[id])); }
function fcHide() { const F = UI.fc; if (!F || !F.cur) return; const c = F.cur; F.cur = null; clearTimeout(c.t); c.el.classList.add('out'); setTimeout(() => { try { c.el.remove(); } catch (e) { } try { render(); } catch (e) { } }, 250); }
function fcShow(key, txt, who, ms) {
  const F = UI.fc; if (!F || F.ended) return; if (F.cur && F.cur.key === key) return; if (F.cur) { const c = F.cur; F.cur = null; clearTimeout(c.t); try { c.el.remove(); } catch (e) { } }
  if (F.shut === key || !txt) return;
  const x = h('button.x', { type: 'button', 'aria-label': 'Got it' }, '×'); x.addEventListener('click', e => { e.stopPropagation(); F.shut = key; fcHide(); });
  const el = h('div.fa-coach', { role: 'status', 'data-coach': F.lastId || key }, tsPortrait(who || 'chief'), h('span.t', txt), x); document.body.appendChild(el);
  F.cur = { el, key, at: Date.now(), need: readMs(txt), t: ms ? setTimeout(fcHide, Math.max(ms, readMs(txt))) : 0 }; fcMute();
}
// while the coach speaks it is the one instruction on the board: the dock's line steps aside (UI bar rule 5)
function fcMute() { const F = UI.fc; if (!F || !F.cur || F.ended) return; for (const id of ['#prompt', '#barprompt']) { const p = $(id); if (p) p.textContent = ''; } }
const readMs = t => 4000 + Math.ceil(String(t || '').split(' ').length / 10) * 1000;   // BRIEF-GAMEFEEL point 3: 4 s + 1 s per 10 words
function tutGoal() {
  if (typeof roHide === 'function') roHide();
  const el = h('div.fa-ro.fa-goal', { role: 'dialog', 'aria-label': 'Goal' }, h('b', 'Goal: reach the runway by round 4 and land.'),
    h('ul', h('li', 'Land with gear and flaps down.'), h('li', 'Keep the wings level.'), h('li', 'Speed must not beat the brakes.')), h('button.rgo', { type: 'button', 'data-ro': 'go' }, "Let's fly"));
  el.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-ro]')) { el.remove(); fcPoll(); } }); document.body.appendChild(el);
}
function fcPump() { }
function fcFeedback() { }
// the reason in the turn line: the rule of that control, said before the move (R3: rules BEFORE the move)
function tutWhy(m) {
  const S = FA.SLOT[m.to], val = dv(m.d) + (m.c || 0), last = FA.isFinal(G); fcSay(S.grp === 'conc' ? 'coffee' : S.grp);
  switch (S.grp) {
    case 'axis': { const x = G.slots.ax1; if (!x) return 'Close dice keep the wings level.'; const nx = G.pl.axis + x.v - val; return nx === 0 ? 'Same as Ravi: wings level.' : 'Wings tilt ' + Math.abs(nx) + '. Three would crash.'; }
    case 'engines': { const x = G.slots.en1; if (!x) return 'Ravi adds his die. The sum is our speed.'; const sm = val + x.v + FA.windMod(G); if (last) return 'Speed ' + sm + ', brakes ' + FA.brakeVal(G) + '.'; const adv = G.pl.pos >= trackOf().sp.length ? 0 : sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return 'Speed ' + sm + ': ' + (adv ? 'we move ' + adv + '.' : 'we hold.'); }
    case 'radio': { const at = G.pl.pos + val - 1; return G.planes[at - 1] ? 'It clears the plane on space ' + at + '.' : 'Nothing to clear there.'; }
    case 'gear': return 'All three gear must be down to land.';
    case 'brakes': return 'We may land at speed ' + S.vals[0] + ' or less.';
    case 'conc': return 'It earns a coffee token.';
  }
  return '';
}
// "Put your 4 on Engines: ..." from the coach's advice
function fcLine(m) {
  if (!m) return '';
  if (m.t === 'toss') return 'Your ' + dv(m.d) + ' fits nowhere. Throw it away.';
  if (m.t !== 'place') return capW(hlpWhy(m, 0), 12) || 'Your move.';
  const v = dv(m.d), c = m.c || 0, where = slotName(m.to); let why = ''; try { why = tutWhy(m) || ''; } catch (e) { }
  const head = c ? 'Coffee makes your ' + v + ' a ' + (v + c) + '. Put it on ' + where + '.' : 'Your ' + v + ' goes on ' + where + '.';
  const all = head + (why ? ' ' + why : ''); return all.split(/\s+/).length <= 12 ? all : head;
}
function fcPoll() {
  const F = UI.fc; if (!F) return; if (!G || !UI.started || !tutGame()) return;
  if (G.result) { UI.cpt = null; if (!F.ended) { F.ended = true; fcHide(); setTimeout(fcEnd, 1400); } return; }
  const T = TS(), sl = G.slots, has = re => Object.keys(sl).some(k => re.test(k)), mine = G.phase === 'place' && !G.pend && G.turn === 0;
  // rules, the first time they matter (each said once)
  if (G.phase === 'place' && G.round === 0) { fcSay('seats'); fcSay('goal'); fcSay('turns'); }
  if (has(/^ax/)) fcSay('axis'); if (has(/^en/)) fcSay('engines'); if (has(/^co/) || G.coffee > 0 && mine) fcSay('coffee');
  if (G.round >= 1) { fcSay('rounds'); fcSay('radio'); fcSay('gear'); }
  if (has(/^ra/)) fcSay('radio'); if (has(/^lg/)) fcSay('gear'); if (G.pend && G.pend.h === 'rr' || G.rrHand > 0 && mine) fcSay('reroll');
  if (G.round >= 2) { fcSay('flaps'); fcSay('brakes'); } if (has(/^fl/)) fcSay('flaps'); if (has(/^br/)) fcSay('brakes');
  if (FA.isFinal(G) && G.phase === 'place') fcSay('final');
  if (F.goal && G.phase !== 'brief') { F.goal = false; document.querySelectorAll('.fa-goal').forEach(e => e.remove()); }
  if (F.goal) { if (!document.querySelector('.fa-goal')) { if (F.goalShown) F.goal = false; else { F.goalShown = true; tutGoal(); } } if (F.goal) return; }
  const R = T.rounds || [], n = Object.keys(sl).length;
  if (G.phase === 'brief') { UI.cpt = null; if (!G.ready[0]) fcShow('b' + G.round, tsFill(R[G.round] || '') + ' Tap Roll.', 'chief'); return; }
  if (G.pend && G.pend.h === 'rr') { UI.cpt = null; if (!G.pend.d.m[0]) fcShow('rr' + G.round + n, 'Tap dice to roll again, or keep them all.', 'ravi'); return; }
  if (mine) {
    const sel = typeof UI.sel === 'number' && UI.sel >= 0 ? UI.sel : null, key = 'p' + G.round + ':' + n + ':' + (sel == null ? '' : sel);
    if (F.cur && /^t/.test(F.cur.key) && Date.now() - F.cur.at < F.cur.need) return;   // let a rule line be read first
    if (!F.cur || F.cur.key !== key) {
      let m = tutAdvise(G, 0); if (sel != null && m && m.t === 'place' && m.d !== sel) { const m2 = tutAdvise(G, 0, sel); if (m2 && m2.t === 'place' && m2.d === sel) m = m2; }
      UI.cpt = m && m.t === 'place' ? { k: m.to, d: m.d } : null; F.lastId = 'turn'; fcShow(key, fcLine(m), 'chief'); render();
    }
    return;
  }
  UI.cpt = null;
  F.queue.length = 0;   // rules are said in the briefing and inside each turn line, never as a separate bubble
}
// the end: the landing check rule by rule with the real numbers, then what did not come up
function fcEnd() {
  const F = UI.fc, T = TS(); if (!F || !T || !G || !G.result) return; const win = !!G.result.win;
  clearInterval(UI.fcT); document.querySelectorAll('.fa-skip').forEach(e => e.remove()); try { GXT.markDone(TUT_GAME); } catch (e) { } window.GXCOACH = Object.assign(window.GXCOACH || { explained: Object.keys(F.seen) }, { running: false, done: true });
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
