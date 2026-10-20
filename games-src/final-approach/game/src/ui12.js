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
  if (g.phase !== 'place' || g.pend) return null;
  const n = g.dice[1].filter(d => d.u).length, sq = TUT_AI[g.round], mv = sq && sq[n];
  return mv ? { t: 'place', d: mv[1], to: mv[0], c: 0 } : null;
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
function tutSteps() {
  return [
    { id: 'plane', title: 'Land together', say: () => 'You and ' + rival() + ' fly one plane. Reach the airport, then land. You win or crash together.', target: tq('#pz .w.appr'), wait: null, ready: () => G && G.phase === 'brief' },
    { id: 'goal', title: 'Landing checklist', say: 'To land: no planes ahead, gear and flaps down, axis level, speed within the brakes.', target: tq('#goal'), wait: null, ready: () => G && G.phase === 'brief' },
    { id: 'seats', title: 'Hidden dice', say: () => 'You are the blue Pilot: only you see your dice. ' + rival() + ', the orange Co-pilot, hides his.', target: tq('#pz .tray.p'), also: tq('#pz .tray.c'), wait: null, ready: () => G && G.phase === 'brief' },
    { id: 'owners', title: 'Whose spaces?', say: () => 'Blue spaces are yours, orange are ' + rival() + '’s. Grey ones take anyone’s dice.', target: tSlot('ax0'), also: () => [tSlot('ax1')(), tSlot('co0')()].filter(Boolean), wait: null, ready: () => G && G.phase === 'brief' },
    { id: 'rounds', title: 'Two rounds left', say: 'Each round: roll, then take turns, one die each. Axis and engines must both be filled.', target: tq('#pz .w.altw'), wait: null, ready: () => G && G.phase === 'brief' },
    { id: 'roll', title: 'Roll the dice', say: 'Real crews plan out loud, never dice numbers. Roll now: after that, silence.', target: tq('#acts [data-a=ready]'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'ready' }, ready: () => G && G.phase === 'brief' && !G.ready[0] },
    // ---- round 1: the co-pilot goes first
    { id: 'axis1', title: 'Pick a die', say: () => rival() + ' put a ' + G.slots.ax1.v + ' on the axis. Tap your ' + dv(0) + ' to pick it up.', target: tDie(0, 0), wait: { type: 'tap', match: a => a.what === 'die' && a.s === 0 && a.d === 0 && !a.rr },
      ready: () => myMove(0, 1) && !!G.slots.ax1 && UI.sel === -1 },
    placeStep('axis2', 'Drop on the axis', 'The plane tilts toward the higher die, by the difference. A tilt of 3 is a spin: you lose.', 0, 1, 0, 'ax0'),
    placeStep('radio', 'Clear the way', () => 'A plane waits on space ' + planeAt() + ': flying through it crashes you. Your ' + dv(2) + ' on the radio clears it.', 0, 3, 2, 'ra0'),
    placeStep('engines', 'Engines set speed', () => 'Both engine dice add up: ' + G.slots.en1.v + ' + your ' + dv(1) + ' = ' + (G.slots.en1.v + dv(1)) + '. Blue ' + G.pl.aeroB + ' stays, orange ' + G.pl.aeroO + ' moves one, more moves two.', 0, 5, 1, 'en0'),
    placeStep('coffee', 'Coffee tokens', 'The plane flew two! Spare die? Coffee takes any value and earns a token to nudge a die by one.', 0, 7, 3, 'co0'),
    { id: 'round1', title: 'Round 1 done', say: 'The tilt carries over. The plane waits on the airport: flying past it would crash. Next: landing, 0 ft.', target: tq('#pz .w.altw'), wait: null, ready: () => G && !G.result && G.round === 1 && G.phase === 'brief' },
    // ---- the landing round: you go first
    { id: 'roll2', title: 'Landing round', say: 'Landing means no flying: speed must be within the brakes. Plan, then roll.', target: tq('#acts [data-a=ready]'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'ready' }, ready: () => G && G.round === 1 && G.phase === 'brief' && !G.ready[0] },
    { id: 'rr1', title: 'Reroll token', say: () => 'Your ' + dv(0) + ' cannot lower the last gear: it needs 5-6. Spend your reroll token.', target: tq('#acts [data-a=rr]'), also: tq('#pz .badge.rrb'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'rr' },
      ready: () => myMove(1, 0) && G.rrHand === 1 && !!document.querySelector('#acts [data-a=rr]') },
    { id: 'rr2', title: 'Pick dice to reroll', say: () => 'Tap the die you want to roll again. ' + rival() + ' keeps his dice.', target: tDie(0, 0), wait: { type: 'tap', match: a => a.what === 'die' && a.s === 0 && a.d === 0 && a.rr },
      ready: () => !!G && G.pend && G.pend.h === 'rr' && !G.pend.d.m[0] && !UI.rrm[0] },
    { id: 'rr3', title: 'Roll it again', say: 'Tap the green button to roll it.', target: tq('#acts [data-a=rrpick]'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'rrpick' }, ready: () => !!G && G.pend && G.pend.h === 'rr' && !!UI.rrm[0] },
    { id: 'cof', title: 'Spend coffee', say: () => 'The brake needs exactly 4. Tap + to spend your coffee token on your ' + dv(1) + '.', target: tq('[data-a=cof][aria-label="One more"]'), also: tDie(0, 1),
      wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'cof' && a.c === 1 }, ready: () => myMove(1, 0) && G.rrHand === 0 && G.coffee > 0 && tutPick(1) && UI.cof === 0 && !!document.querySelector('[data-a=cof][aria-label="One more"]') },
    placeStep('brake', 'Set the brake', 'Brakes go 2, then 4, then 6. The 2 is set: place the 4 now.', 1, 0, 1, 'br1', { ready: () => myMove(1, 0) && UI.sel === 1 && UI.cof === 1 }),
    placeStep('gear', 'Lower the gear', () => 'Gear takes 1-2, 3-4 or 5-6, in any order. Your new ' + dv(0) + ' lowers the last gear.', 1, 2, 0, 'lg2'),
    placeStep('axis3', 'Level for landing', () => 'The axis is ' + Math.abs(G.pl.axis) + ' ' + (G.pl.axis < 0 ? 'left' : 'right') + '. Your ' + dv(2) + ' against ' + rival() + '’s ' + G.slots.ax1.v + ' tips it back to level.', 1, 4, 2, 'ax0'),
    { id: 'flaps', title: 'The Co-pilot’s job', say: () => 'Flaps are ' + rival() + '’s: four spaces, in order. Each flap or gear lifts a speed marker.', target: tSlot('fl3'), wait: null, ready: () => myMove(1, 6) && !!G.slots.fl3 },
    placeStep('engines2', 'Landing speed', () => 'The plane stops now. Speed is your ' + dv(3) + ' plus ' + rival() + '’s ' + G.slots.en1.v + ' = ' + (dv(3) + G.slots.en1.v) + ', within the brakes ' + FA.brakeVal(G) + '.', 1, 6, 3, 'en0'),
    { id: 'landed', title: 'Landed!', say: 'Track clear, gear and flaps down, axis level, speed within the brakes. You landed together.', target: tq('#pz .w.appr'), wait: null, ready: () => !!(G && G.result && G.result.win) }
  ];
}
// ---------------------------------------------------------------- the kit hooks
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the rules', endText: pro ? 'Axis, engines, radio, gear, flaps, brakes, coffee, rerolls. Now flight school begins.' : 'Axis, engines, radio, gear, flaps, brakes, coffee, rerolls. Real flights add fuel, wind and more.',
    endButtons: pro && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } try { if (typeof GXC !== 'undefined') GXC.close(); } catch (e) { } UI._aid = UI._aid || AIDELAY; AIDELAY = Math.min(AIDELAY, 450);
      closeRS(); newGame('vs', { scenario: 'tt', role: 0, level: 'normal', abil: [], tutorial: true, tipsOff: true }); },
    onDone: r => { tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
      else { showStart(); UI.sv = 'setup'; UI.cfgOpen = false; renderStart(); } },
    onExit: () => { tutLeave(); showStart(); } });
}
// leave the staged flight: nothing of it is saved, the computer stops and the board goes quiet behind the menu
function tutLeave() {
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
