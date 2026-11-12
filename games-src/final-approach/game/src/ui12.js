// ===================== part 12: the tutorial (shell/gx-tutor.js): a guided first landing, one rule per step =====================
// The last four rounds at Port Alder (3000 ft to the runway) on a 4-space strip with one plane on space 3. The dice and the co-pilot are scripted (tut-plan.js,
// checked by tut-sim.js and rules-test: playing the plan lands). Every step is ONE sentence of 12 words or fewer and ONE highlighted tap; only that tap answers.
// The steps teach every core rule in order (TUT_RULES); tutor-test.js walks them by touch and checks each rule step appears. Nothing of it is saved.
const TUT_GAME = 'final-approach';
const TUT_SETUP = TUT_PLAN.setup;
const tutGame = () => !!(UI.cfg && UI.cfg.tutorial && UI.started && G && G.sid === 'tt');
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && tutGame();
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart });
function firstTime() { try { return newPlayer() && !localStorage.getItem('fa_offer'); } catch (e) { return false; } }
// ---------------------------------------------------------------- the computer co-pilot plays the plan
function tutAI(g, seat) {
  if (!tutGame() || seat !== 1 || !g || g.result) return null;
  if (g.phase === 'brief') return g.ready[1] ? null : { t: 'ready' };
  if (g.pend && g.pend.h === 'rr') return g.pend.d.m[1] ? null : { t: 'rrpick', m: [false, false, false, false] };
  if (g.phase === 'place' && !g.pend && g.turn === 1) { const q = (TUT_PLAN.cop[g.round] || [])[g.dice[1].filter(d => d.u).length]; if (q && !g.slots[q[1]]) return { t: 'place', d: q[0], to: q[1], c: 0 }; }
  return null;
}
(function () { const o = FA.AI.move; FA.AI.move = function (g, seat, level, opt) { const m = tutAI(g, seat); return m || o.apply(this, arguments); }; })();
// ---------------------------------------------------------------- where each step points
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; };
const tDie = (s, d) => tq('#pz .die[data-s="' + s + '"][data-d="' + d + '"]');
const tSlot = k => tq('#pz .slot[data-slot="' + k + '"]');
const tAct = a => tq('#acts [data-a=' + a + ']');
// my turn in this round, nothing pending
const tutMine = r => !!G && !G.result && G.round === r && G.phase === 'place' && !G.pend && G.turn === 0;
// the die is lifted already, so a placement step is one tap on the glowing space
function tutPick(d, c) {
  if (!G || G.phase !== 'place' || G.pend || G.turn !== 0 || G.dice[0][d].u) return false;
  if (UI.sel !== d) { UI.sel = d; UI.cof = 0; UI.warnK = null; render(); }
  if (c != null && UI.cof !== c) return false;
  return UI.sel === d;
}
function tutUnpick(d) { if (UI.sel === d) { UI.sel = -1; render(); } return true; }
const slotOk = k => a => a.what === 'slot' && a.ok && a.k === k;
// one placement: the slot glows, the die is lit; rule = which core rule this step teaches
const tPlace = (rule, say, r, d, k, c) => ({ id: rule + ':' + k + ':' + r, rule, say, target: tSlot(k), also: tDie(0, d), wait: { type: 'tap', match: slotOk(k) }, ready: () => tutMine(r) && !G.slots[k] && tutPick(d, c) });
const tRoll = (rule, say, r) => ({ id: rule + ':' + r, rule, say, target: tAct('ready'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'ready' }, ready: () => !!G && !G.result && G.round === r && G.phase === 'brief' && !G.ready[0] });
const tLift = (rule, say, r, d, need) => ({ id: rule, rule, say, target: tDie(0, d), wait: { type: 'tap', match: a => a.what === 'die' && a.d === d && !a.rr }, ready: () => tutMine(r) && (!need || !!G.slots[need]) && tutUnpick(d) });
// the core rules, in the order the steps teach them (tutor-test.js checks each appears)
const TUT_RULES = ['together', 'secret', 'axis', 'turns', 'engines', 'coffee', 'gear', 'altitude', 'radio', 'reroll', 'coffee-spend', 'tilt-crash', 'flaps', 'overshoot', 'brakes', 'final', 'speed', 'win'];
function tutSteps() {
  const rrD = TUT_PLAN.rrDie;
  return [
    // round 1, 3000 ft: Ravi goes first
    tRoll('together', 'We land or crash together. Plan now, then tap Roll.', 0),
    tLift('secret', 'Dice are secret now. Never say numbers. Tap your 4.', 0, 0),
    tPlace('axis', 'Axis: the higher die tips the wings. Your 4 beats 3.', 0, 0, 'ax0'),
    tLift('turns', 'Take turns. Fill Axis and Engines every round, or we crash.', 0, 1, 'en1'),
    tPlace('engines', "Engines add up: 5 plus Ravi's 2 is 7. We move one.", 0, 1, 'en0'),
    tPlace('coffee', 'A spare die on Concentration earns a coffee token.', 0, 2, 'co1'),
    tPlace('gear', 'Gear needs 1-2, 3-4 or 5-6. Each raises blue.', 0, 3, 'lg0'),
    // round 2, 2000 ft: you go first; a reroll token comes aboard
    tRoll('altitude', 'We drop 1000 feet each round. Reach the runway in time.', 1),
    tPlace('radio', "Leaving a plane's space crashes. Radio 2 clears the next space.", 1, 0, 'ra0'),
    { id: 'reroll', rule: 'reroll', say: 'A reroll token lets us both roll again. Tap it.', target: tAct('rr'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'rr' }, ready: () => tutMine(1) && !!G.slots.ax1 && G.rrHand > 0 && tutUnpick(UI.sel) },
    { id: 'rrpick', rule: 'reroll', say: 'Tap your 1 to roll it again.', target: tDie(0, rrD), wait: { type: 'tap', match: a => a.what === 'die' && a.d === rrD && a.rr }, ready: () => !!G && !!G.pend && G.pend.h === 'rr' && !G.pend.d.m[0] && !UI.rrm[rrD] },
    { id: 'rrgo', rule: 'reroll', say: 'Tap Reroll. Only the dice you picked change.', target: tAct('rrpick'), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'rrpick' }, ready: () => !!G && !!G.pend && G.pend.h === 'rr' && !G.pend.d.m[0] && !!UI.rrm[rrD] },
    { id: 'coffee-spend', rule: 'coffee-spend', say: 'Spend coffee: tap minus to turn your 4 into 3.', target: tq('[data-a=cof][aria-label="One less"]'), also: tDie(0, 1), wait: { type: 'tap', match: a => a.what === 'act' && a.a === 'cof' && a.c === -1 }, ready: () => tutMine(1) && !G.slots.ax0 && tutPick(1, 0) },
    tPlace('tilt-crash', "Your 3 under Ravi's 4 levels the wings. Tilt 3 crashes.", 1, 1, 'ax0', -1),
    tPlace('engines', "Your 5 plus Ravi's 3 is 8: one space closer.", 1, 3, 'en0'),
    tPlace('flaps', "Ravi's flaps go out in order. Your new 6 drops gear.", 1, rrD, 'lg2'),
    // round 3, 1000 ft: Ravi first; reach the airport
    tRoll('altitude', 'Last chance to reach the airport. Tap Roll.', 2),
    tPlace('axis', "Match Ravi's 5 on Axis to keep the wings level.", 2, 0, 'ax0'),
    tPlace('overshoot', "Your 4 plus Ravi's 4 reaches the airport. Flying past crashes.", 2, 1, 'en0'),
    tPlace('gear', 'Your 3 drops the last gear. All three are down.', 2, 2, 'lg1'),
    tPlace('brakes', 'Brakes take exactly 2, then 4, then 6, in order.', 2, 3, 'br0'),
    // round 4, 0 ft: the landing
    tRoll('final', 'Landing round: the plane stops moving. Tap Roll.', 3),
    tPlace('speed', 'Brake 4. Speed is checked when the 2nd engine die lands.', 3, 0, 'br1'),
    tPlace('axis', "Match Ravi's 3. We must land with level wings.", 3, 1, 'ax0'),
    tPlace('brakes', 'Brake 6 now. Brakes set after the engines come too late.', 3, 3, 'br2'),
    tPlace('speed', "Your 2 plus Ravi's 2 is speed 4. Brakes 6: slow enough.", 3, 2, 'en0'),
    { id: 'win', rule: 'win', say: 'Landed! Runway clear, gear, flaps, level wings, slow enough.', target: tq('#pz'), wait: null, ready: () => !!G && !!G.result && !!G.result.win }
  ];
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You can fly', endText: 'Now a real flight: seven rounds, Ravi plays his own dice.',
    endButtons: pro && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => {
      try { GX.close(); } catch (e) { } try { if (typeof GXC !== 'undefined') GXC.close(); } catch (e) { } UI._aid = UI._aid || AIDELAY; AIDELAY = Math.min(AIDELAY, 700);
      closeRS(); newGame('vs', { scenario: 'tt', role: 0, level: 'normal', abil: [], tutorial: true, tipsOff: true });
    },
    onDone: r => { const c = r && r.choice; tutLeave(); if (c === 'chapter' && first) { showStart(); GXC.play(first.id); } else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); } else playNow(); },
    onExit: () => { tutLeave(); showStart(); }
  });
}
// leave the guided flight: nothing of it is saved, the computer stops and the board goes quiet behind the menu
function tutLeave() {
  clearTimeout(UI.tm); UI.seq++; UI.started = false; UI.sel = -1; UI.cof = 0; if (UI._aid) { AIDELAY = UI._aid; UI._aid = 0; }
  try { hideRecap(); } catch (e) { } try { GXH.hide(); } catch (e) { } try { if (typeof pxClearEnd === 'function') pxClearEnd(); } catch (e) { }
  $$('#fx .gh,#fx .endb,#fx .pop,.fa-ro').forEach(e => e.remove()); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
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
