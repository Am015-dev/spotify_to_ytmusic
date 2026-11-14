// ===================== part 11: the tutorial (shell/gx-tutor.js): a staged two-day game that teaches every rule by doing it once =====================
// The staged game is a real game cut to TWO days (engine length 2): day 1 is the full brew, day 2 is "the last day" (its own rules). You (Tamsin) play Wynne; the seed, the
// fortune cards, both bags and Wynne's draws are fixed, so each rule comes up on cue. Nothing of it is ever saved. Each step spotlights ONE thing, everything else is dimmed
// and inert, and the step moves on only when the game reports that exact action (GXT.act from the input handlers in ui5.js).
//
// THE RULES THIS TUTORIAL TEACHES (read from the rules drawer and rules-test.js): each line is  rule -> the steps that do it.  tutor-test.js checks every rule has a step.
const TUT_RULES = [
  ['the goal: most victory points after 9 days', 'goal'],
  ['the fortune card: purple happens now', 'fortune'],
  ['everyone draws at the same time, from their own bag', 'draw1'],
  ['a chip moves as many spaces as its number', 'keep'],
  ['the scoring space is the one after your last chip', 'keep'],
  ['white chips and the explosion limit of 7 (the meter)', 'keep2'],
  ['you may stop any time', 'keep2'],
  ['the flask puts the last white chip back (once a day)', 'flask', 'seven'],
  ['pushing your luck: one more white explodes', 'push'],
  ['the bonus die: the furthest safe pot rolls; its faces', 'report'],
  ['a ruby on the scoring space gives a ruby', 'd2stop'],
  ['an exploded pot takes points or coins, not both', 'choose'],
  ['every stall says what its chip does', 'shops'],
  ['yellow opens on day 2, purple on day 3', 'shops'],
  ['buying: up to two chips of different colours', 'buy'],
  ['rubies: 2 move the droplet, 2 refill the flask', 'droplet', 'refill'],
  ['bought chips go into the bag; a new day starts', 'confirm'],
  ['an extra white chip before day 6', 'confirm'],
  ['the fortune card: blue lasts all day', 'day2'],
  ['rat tails: one on every second space behind the leader, a head start (counted)', 'rats', 'd2draw'],
  ['the last day: secret Draw or Stop, revealed together', 'd2draw'],
  ['red: moves extra when orange chips are in the pot (done)', 'red', 'redsaw'],
  ['yellow: right after a white, it may send that white back (done)', 'yellow', 'yback'],
  ['blue: peek and pick (done)', 'bdraw', 'peek'],
  ['purple: pays at the count, 1 point for one (done)', 'peek', 'd2report'],
  ['black: more than your neighbour moves the droplet (and a ruby) (done)', 'black', 'chipfx'],
  ['green: a green in your last two chips pays a ruby (done)', 'green', 'chipfx'],
  ['stopping keeps your scoring space', 'd2stop'],
  ['the last day: no shop, 5 coins and 2 rubies = 1 point', 'd2report'],
  ['tie-break: furthest pot on the last day', 'end'],
  ['the game ends after the last day; most points wins', 'end']
];
const TUT_GAME = 'cauldron-fair', TUT_SEED = 23;
const tutOn = () => typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial';
const firstTime = () => !UI.prefs.played;
const tutBtn = cls => typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls, launch: tutStart });
function tutNode(cls, row) { const w = document.createElement('div'); w.innerHTML = tutBtn(cls); const b = w.firstChild; if (!b) return null; return row ? h('div.mrow', b) : b; }
// the game's input handlers ask the kit BEFORE they act; false = not what this step asks (the click is ignored)
function tutAct(x) { if (!tutOn()) return true; return GXT.act(Object.assign({ type: 'tap' }, x)); }
// ---------------------------------------------------------------- the script: fixed draws (the next chips come in this order, the rest follow)
function tutOrder(p, keys) {
  const rest = p.bag.slice(), pick = [];
  for (const k of keys) { const i = rest.findIndex(c => c && c.c + c.v === k); if (i >= 0) pick.push(rest.splice(i, 1)[0]); }
  p.bag = rest.concat(pick.reverse());       // a draw takes the END of the bag
}
UI.tut = {};
function tutFix() {
  if (UI.mode !== 'tutorial' || !G || G.phase === 'over') return;
  const T = UI.tut = UI.tut || {}, me = G.players[0], wy = G.players[1];
  UI.focus = 0;
  if (G.phase === 'brew' && G.round === 1 && !T.d1) { T.d1 = 1; tutOrder(me, ['W2', 'W3', 'W1']); tutOrder(wy, ['W2', 'O1', 'W1', 'G1', 'W1']); }
  if (G.round === 1 && T.d1 && !T.fl && me.flask === false) { T.fl = 1; tutOrder(me, ['W2', 'W1']); }        // the flask put the white 1 back at a random place
  // day 2: Hask slips a red, a yellow, a purple, a black and a green into the bag, so each colour's power is seen by doing it: orange then red (+1), a white then yellow (sends it back),
  // then blue peeks at the purple (the right pick, and the hint agrees), which pays 1 point at the count
  if (G.phase === 'brew' && G.round === 2 && !T.d2) { T.d2 = 1; ['R1', 'Y1', 'P1', 'K1', 'G1'].forEach(k => CF._.give(G, me, k, true)); tutOrder(me, ['O1', 'R1', 'W1', 'Y1', 'B1', 'P1', 'K1', 'G1']); tutOrder(wy, ['W2']); }
  if (G.round === 2 && T.d2 && !T.yb && me.pot.some(c => c.c === 'Y') && !me.q) { T.yb = 1; tutOrder(me, ['B1', 'P1', 'K1', 'G1']); }      // the white that yellow sent back must not land on top
}
// Wynne is scripted too: she takes a Wren Feather 2 from the card, draws 4 chips on day 1 and 1 on day 2, then stops; shopping and rubies are the normal computer's.
function tutAI(Gx, seat) {
  if (UI.mode !== 'tutorial' || Gx !== G || seat !== 1) return null;
  const p = Gx.players[1], mv = CF.moves(Gx, 1);
  if (p.q) return p.q.h === 'pick' ? (mv.find(m => m.o === 'B2') || null) : null;
  if (Gx.phase === 'brew' && p.st === 'draw') { const want = Gx.round === 1 ? 4 : 1; return mv.find(m => m.t === (p.pot.length >= want ? 'stop' : 'draw')) || null; }
  return null;
}
(function () { const o = CF.AI.choose; CF.AI.choose = function (Gx, seat, level) { const m = tutAI(Gx, seat); return m || o.call(CF.AI, Gx, seat, level); }; })();
// ---------------------------------------------------------------- where each step points
const tp = () => G && G.players[0];
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width && !e.disabled ? e : null; };
const tfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width && !e.disabled) return e; } return null; };
const tbrew = () => { const p = tp(); return !!(G && p && G.phase === 'brew' && p.st === 'draw' && !p.q && !p.lock && !BF.pulling && !document.querySelector('.boomfx')); };
const tbag = tq('#acts .bagb:not(.off)');
const tmove = pred => () => { const L = UI.legal[0] || []; const b = [...document.querySelectorAll('#qbox [data-a=mv]')].find(e => { const m = L[+e.dataset.i]; return m && pred(m); }); return b && b.getBoundingClientRect().width ? b : null; };
const tws = () => CF.whiteSum(tp());
const tn = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
// Every step: ONE sentence of 12 words or fewer (the words live in story-data.js STORY.steps), ONE highlighted target, ONE tap (the action itself, or Next).
// The order is the order the rules happen in a real day: goal, fortune, drawing, the spiral, whites, flask, stop or push, boom, scoring, shop, rubies, the last day, the end.
function tutSteps() {
  const rep = () => !!(UI.rsOpen && UI.rsMode === 'report' && !STG.run && tp().q && tp().q.h === 'de' && document.querySelector('#rs .ds:not(.me) .dtile'));
  const shop = sel => () => { const e = UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector(sel); if (e && e.closest('.stalls')) { const st = e.closest('.stalls'), a = e.getBoundingClientRect(), b = st.getBoundingClientRect(); if (a.top < b.top || a.bottom > b.bottom) e.scrollIntoView({ block: 'nearest' }); } return !!e; };   // R8: the stall list can scroll on small phones; bring the spotlit chip into view
  const fin = () => !!(G && G.phase === 'over' && UI.rsMode === 'final' && document.querySelector('#rs .win'));
  const lastC = () => { const p = tp(); return p && p.pot.length ? p.pot[p.pot.length - 1].c : ''; };
  const d2 = () => tbrew() && G.round === 2;
  return [
    { id: 'goal', target: tfirst('#others .th', '#cwrap'), wait: null, ready: () => !!(G && UI.started && G.round === 1 && document.querySelector('#acts,#qbox')) },
    { id: 'fortune', target: tmove(m => m.t === 'pick' && m.o === 'rubies'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'pick' && a.m.o === 'rubies' }, ready: () => !!(tp() && tp().q && tp().q.h === 'pick') },
    { id: 'draw1', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 0 && G.round === 1 },
    { id: 'keep', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 1 && G.round === 1 },
    { id: 'keep2', target: tbag, also: tq('#acts .meter'), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 2 && G.round === 1 },
    { id: 'flask', target: tq('#acts .flb'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'flask' }, ready: () => tbrew() && tp().pot.length === 3 && !!document.querySelector('#acts .flb') },
    { id: 'seven', target: tbag,
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 2 && tp().flask === false && tws() === 5 },
    { id: 'push', target: tbag,
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, wrong: 'Tap the bag.', ready: () => tbrew() && tp().pot.length === 3 && tws() === 7 },
    { id: 'report', target: tq('#rs .ds:not(.me) .dtile'), wait: null, ready: rep },
    { id: 'choose', target: tq('#rs .dpick.dpc'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'de' && a.m.o === 'buy' }, ready: () => !!(UI.rsOpen && !STG.run && tp().q && tp().q.h === 'de' && document.querySelector('#rs .dpick.dpc')) },
    { id: 'shops', target: tq('#rs .stall.cG'), wait: null, ready: shop('#rs .stall.cG') },
    { id: 'buy', target: tq('#rs .tok[data-k="B1"]'),
      wait: { type: 'tap', match: a => a.what === 'shopsel' && a.k === 'B1' }, ready: shop('#rs .tok[data-k="B1"]') },
    { id: 'droplet', target: tq('#rs .rbt.rdrop'),
      wait: { type: 'tap', match: a => a.what === 'rubysel' && a.k === '1' }, ready: shop('#rs .rbt.rdrop:not([disabled])') },
    { id: 'refill', target: tq('#rs .rbt.rflask'),
      wait: { type: 'tap', match: a => a.what === 'rubysel' && a.k === '1f' }, ready: () => shop('#rs .rbt.rflask:not([disabled])')() && !!(UI.rubySel && UI.rubySel.drop === 1) },
    { id: 'confirm', target: tq('#rs [data-a=shopbuy]'),
      wait: { type: 'tap', match: a => a.what === 'shopbuy' }, ready: () => shop('#rs [data-a=shopbuy]')() && !!(UI.rubySel && UI.rubySel.flask) },
    { id: 'day2', target: tfirst('#fortchip', '#fort'), wait: null, ready: () => d2() && tp().pot.length === 0 && !!document.querySelector('#ratchip') },
    { id: 'rats', target: tq('#ratchip .ratb'), also: tfirst('#others .th', '#others'), wait: { type: 'tap', match: a => a.what === 'ratopen' }, wrong: 'Tap the rat.', ready: () => d2() && tp().pot.length === 0 && tp().ratTails > 0 && !!document.querySelector('#ratchip') },
    { id: 'd2draw', target: tbag, also: tq('#ratchip'), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && tp().pot.length === 0 },
    { id: 'red', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && tp().pot.length === 1 && lastC() === 'O' },
    { id: 'redsaw', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && tp().pot.length === 2 && lastC() === 'R' },
    { id: 'yellow', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && tp().pot.length === 3 && lastC() === 'W' },
    { id: 'yback', target: tmove(m => m.t === 'y1' && m.yes), also: () => document.querySelector('#qbox'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'y1' && a.m.yes }, ready: () => !!(tp() && tp().q && tp().q.h === 'y1') },
    { id: 'bdraw', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && lastC() === 'Y' },
    { id: 'peek', target: tmove(m => m.t === 'crow' && m.idx === 0), also: () => document.querySelector('#qbox'),   // the whole peek card stays clear of the bubble
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'crow' && a.m.idx === 0 }, ready: () => !!(tp() && tp().q && tp().q.h === 'crow') },
    { id: 'black', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && lastC() === 'P' },
    { id: 'green', target: tbag, wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => d2() && lastC() === 'K' },
    { id: 'd2stop', target: tq('#acts .stopb:not(.off)'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'stop' }, wrong: 'Tap Stop.', ready: () => d2() && lastC() === 'G' },
    { id: 'chipfx', target: tfirst('#rs .ds.me', '#rs .rsbody'), wait: null, ready: () => !!(UI.rsOpen && UI.rsMode === 'report' && !STG.run && G.phase === 'over' && document.querySelector('#rs [data-a=rscont]:not(.off)')) },
    { id: 'd2report', target: tq('#rs [data-a=rscont]:not(.off)'),
      wait: { type: 'tap', match: a => a.what === 'rscont' }, ready: () => !!(UI.rsOpen && UI.rsMode === 'report' && !STG.run && G.phase === 'over' && document.querySelector('#rs [data-a=rscont]:not(.off)')) },
    { id: 'end', target: tfirst('#rs .win', '#rs .rsbody'), wait: null, wrong: 'Tap Finish.', ready: fin }
  ].map(s => { const t = STORY.steps[s.id]; s.title = t[0]; s.say = t[1]; return s; });
}
// ---------------------------------------------------------------- the kit hooks
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen() {
  if (typeof GXC === 'undefined') return;
  if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen();
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null;
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'Now a real game',
    endText: o ? 'You know every rule. Chapter 1 is next.' : 'You know every rule. Your first real game starts now.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : [{ id: 'real', label: 'Play a real game' }],
    setup: () => { try { GX.close(); } catch (e) { } const st = $('#start'); if (st) st.hidden = true; closeRS(true); UI.seed = TUT_SEED; UI.tut = {}; BF.pulling = false; newGame('tutorial'); },
    onDone: r => {
      tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
      else if (c === 'real') newGame('vs', optObj());   // straight into a real 9-day game against the computer
      else { UI.sv = 'setup'; UI.cfgOpen = false; showStart(); UI.sv = 'setup'; renderStart(); }
    },
    onExit: () => { tutLeave(); showStart(); }
  });
}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave() {
  UI.seq++; Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; clearTimeout(UI.advT); UI.advT = 0; UI.started = false; UI.rsOpen = false; UI.rsMode = ''; UI.mode = 'vs'; UI.tut = {}; BF.pulling = false;
  try { stgAbort(); } catch (e) { } try { GXH.hide(); } catch (e) { }
  document.documentElement.classList.remove('pulling'); $$('.boomfx,.bfchip,.dfly,#ghost').forEach(e => e.remove());
}
