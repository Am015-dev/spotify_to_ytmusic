// ===================== part 11: the tutorial (shell/gx-tutor.js): a staged two-day game that teaches every rule by doing it once =====================
// The staged game is a real game cut to TWO days (engine length 2): day 1 is the full brew, day 2 is "the last day" (its own rules). You (Tamsin) play Wynne; the seed, the
// fortune cards, both bags and Wynne's draws are fixed, so each rule comes up on cue. Nothing of it is ever saved. Each step spotlights ONE thing, everything else is dimmed
// and inert, and the step moves on only when the game reports that exact action (GXT.act from the input handlers in ui5.js).
//
// THE RULES THIS TUTORIAL TEACHES (read from the rules drawer and rules-test.js): each line is  rule -> the steps that do it.  tutor-test.js checks every rule has a step.
const TUT_RULES = [
  ['the goal: most victory points after 9 days', 'goal', 'end'],
  ['drawing chips from your bag', 'draw1'],
  ['moving along the cauldron spiral, the scoring space (coins, points, ruby)', 'spiral'],
  ['white chips and the explosion limit of 7 (the meter)', 'whites', 'keep'],
  ['the flask puts a white chip back (once a day)', 'flask'],
  ['stopping versus pushing your luck', 'seven', 'push', 'd2stop'],
  ['what happens when you explode: choose coins or points', 'choose'],
  ['the bonus die', 'report'],
  ['the fortune card (purple now, blue all day)', 'fortune', 'day2'],
  ['rubies: move the droplet / refill the flask', 'droplet', 'refill'],
  ['the droplet and the rat stone head start', 'droplet', 'day2'],
  ['buying chips in the shop; each colour has a power', 'shops1', 'shops2', 'shops3', 'buy'],
  ['a chip power at work (blue: peek and pick)', 'peek'],
  ['scoring at the end of a day', 'report', 'd2report'],
  ['the last day: secret Draw or Stop, no shop, 5 coins and 2 rubies = 1 point', 'd2draw', 'd2report'],
  ['how the game ends after 9 days', 'end']
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
  if (G.phase === 'brew' && G.round === 2 && !T.d2) { T.d2 = 1; tutOrder(me, ['B1', 'W2', 'W3']); tutOrder(wy, ['W2']); }
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
function tutSteps() {
  return [
    { id: 'goal', title: 'Welcome to the fair', say: 'Brew potions for 9 days. The most victory points wins. Your rival\'s points are here. This practice lasts two days.', target: tfirst('#others .th', '#cwrap'), wait: null,
      ready: () => !!(G && UI.started && G.round === 1 && document.querySelector('#acts,#qbox')) },
    { id: 'fortune', title: 'Fortune card', say: 'Each day starts with a fortune card. This purple one happens now. Take 3 rubies.', target: tmove(m => m.t === 'pick' && m.o === 'rubies'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'pick' && a.m.o === 'rubies' }, ready: () => !!(tp() && tp().q && tp().q.h === 'pick') },
    { id: 'draw1', title: 'Draw a chip', say: 'Your chips live in the bag. Tap it to pull one out.', target: tbag,
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 0 && G.round === 1 },
    { id: 'spiral', title: 'The spiral', say: () => 'It moved ' + tn(tp().pot[0].v, 'space') + ': its number. The ring marks the space you score if you stop.', target: tq('#cwrap'), wait: null,
      ready: () => tbrew() && tp().pot.length === 1 },
    { id: 'whites', title: 'White chips', say: 'White chips fill this meter. More than 7 and the pot explodes. Draw again.', target: tbag, also: tq('#acts .meter'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 1 && !!document.querySelector('#acts .meter') },
    { id: 'keep', title: 'Keep drawing', say: () => 'Whites are at ' + tws() + ' of 7. Draw once more.', target: tbag, also: tq('#acts .meter'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 2 },
    { id: 'flask', title: 'The flask', say: () => tws() + ' of 7 is risky. The flask puts the last white chip back. Tap it!', target: tq('#acts .flb'), also: tq('#acts .meter'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'flask' }, ready: () => tbrew() && tp().pot.length === 3 && !!document.querySelector('#acts .flb') },
    { id: 'seven', title: 'Seven is safe', say: 'The chip is back in the bag. Exactly 7 is still safe. Draw again.', target: tbag, also: tq('#acts .meter'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && tp().pot.length === 2 && tp().flask === false && tws() === 5 },
    { id: 'push', title: 'Push your luck', say: 'At 7, any white chip explodes the pot. Stopping is safe, but be bold: draw!', target: tbag, also: tq('#acts .meter'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, wrong: 'Be bold: tap the bag.', ready: () => tbrew() && tp().pot.length === 3 && tws() === 7 },
    { id: 'report', title: 'Counting the day', say: () => { const d = G.players[1].res && G.players[1].res.die; return 'Spaces pay coins and points. Only safe pots can roll the bonus die' + (d && d.length ? ': ' + G.players[1].name + '\'s did.' : '.'); }, target: tq('#rs .ds:not(.me) .dtile'), also: tq('#rs .ds:not(.me) .dout'), wait: null,
      ready: () => !!(UI.rsOpen && UI.rsMode === 'report' && !STG.run && tp().q && tp().q.h === 'de' && document.querySelector('#rs .ds:not(.me) .dtile')) },
    { id: 'choose', title: 'Boom: pick one', say: () => { const d = tp().q.d; return 'Exploded pots choose: ' + tn(d.vp, 'point') + ' or ' + d.coins + ' coins to shop. Take the coins.'; }, target: tq('#rs .dpick.dpc'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'de' && a.m.o === 'buy' }, ready: () => !!(UI.rsOpen && !STG.run && tp().q && tp().q.h === 'de' && document.querySelector('#rs .dpick.dpc')) },
    { id: 'shops1', title: 'The fair stalls', say: 'Marrow has no power: a cheap filler. Mossback gives rubies when it is one of your last two chips.', target: tq('#rs .stall.cO'), also: tq('#rs .stall.cG'), wait: null,
      ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .stall.cG')) },
    { id: 'shops2', title: 'More powers', say: 'Wren Feather peeks at extra chips when it lands. Scarlet Cap slides further for every Marrow already in your pot.', target: tq('#rs .stall.cB'), also: tq('#rs .stall.cR'), wait: null,
      ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .stall.cR')) },
    { id: 'shops3', title: 'Locked stalls', say: 'Cinder Moth: most moths win droplet steps. Sunroot opens on day 2 and Dusk Sigh on day 3.', target: tq('#rs .stall.cK'), also: tq('#rs .stall.cY'), wait: null,
      ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .stall.cK')) },
    { id: 'buy', title: 'Buy a chip', say: 'You may buy up to two chips of different colours. Tap the Wren Feather: it peeks at extra chips.', target: tq('#rs .tok[data-k="B1"]'),
      wait: { type: 'tap', match: a => a.what === 'shopsel' && a.k === 'B1' }, ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .tok[data-k="B1"]')) },
    { id: 'droplet', title: 'The droplet', say: '2 rubies move your droplet one space on. Your first chip starts further every day. Tap it.', target: tq('#rs .rbt.rdrop'),
      wait: { type: 'tap', match: a => a.what === 'rubysel' && a.k === '1' }, ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .rbt.rdrop:not([disabled])')) },
    { id: 'refill', title: 'Refill the flask', say: 'A used flask comes back for 2 rubies. Tap the flask to refill it.', target: tq('#rs .rbt.rflask'),
      wait: { type: 'tap', match: a => a.what === 'rubysel' && a.k === '1f' }, ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && document.querySelector('#rs .rbt.rflask:not([disabled])') && UI.rubySel && UI.rubySel.drop === 1) },
    { id: 'confirm', title: 'Start day 2', say: 'Chips go in your bag and rubies are spent. Tap to begin day 2.', target: tq('#rs [data-a=shopbuy]'),
      wait: { type: 'tap', match: a => a.what === 'shopbuy' }, ready: () => !!(UI.rsOpen && tp().q && tp().q.h === 'shop' && UI.rubySel && UI.rubySel.flask) },
    { id: 'day2', title: 'The last day', say: 'Blue cards last all day: the limit is 9 now. Trailing on points? The rat stone gives a head start.', target: tfirst('#fortchip', '#fort'), also: tq('#ratchip'), wait: null,
      ready: () => tbrew() && G.round === 2 && !!document.querySelector('#ratchip') },
    { id: 'd2draw', title: 'Draw together', say: 'On the last day both players secretly choose, then reveal together. Tap the bag.', target: tbag,
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'draw' }, ready: () => tbrew() && G.round === 2 && tp().pot.length === 0 },
    { id: 'peek', title: 'Peek and pick', say: 'The Wren Feather peeked at a chip. Place it as your next chip, or put it back.', target: tmove(m => m.t === 'crow' && m.idx === 0),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'crow' && a.m.idx === 0 }, ready: () => !!(tp() && tp().q && tp().q.h === 'crow') },
    { id: 'd2stop', title: 'Stop here', say: 'Stop keeps your space: its coins and points are yours. Tap Stop.', target: tq('#acts .stopb:not(.off)'),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'stop' }, wrong: 'Tap Stop.', ready: () => tbrew() && G.round === 2 && tp().pot.length === 2 },
    { id: 'd2report', title: 'The final count', say: () => 'Last day: every 5 coins and every 2 rubies give 1 point. Tap to see who won.', target: tq('#rs [data-a=rscont]:not(.off)'), also: tq('#rs .ds.me .dtile'),
      wait: { type: 'tap', match: a => a.what === 'rscont' }, ready: () => !!(UI.rsOpen && UI.rsMode === 'report' && !STG.run && G.phase === 'over' && document.querySelector('#rs [data-a=rscont]:not(.off)')) },
    { id: 'end', title: 'You know the game', say: () => { const a = G.players[0].vp, b = G.players[1].vp; return (G.winner === 0 ? 'You win, ' + a + ' to ' + b + (a === b ? ' on the tie-break!' : '!') : G.winner < 0 ? 'A tie, ' + a + ' each!' : G.players[1].name + ' wins, ' + b + ' to ' + a + '.') + ' A real game lasts 9 days.'; },
      target: tfirst('#rs .win', '#rs .rsbody'), wait: null, ready: () => !!(G && G.phase === 'over' && UI.rsMode === 'final' && document.querySelector('#rs .win')) }
  ];
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
    endTitle: 'You know the rules',
    endText: o ? 'Draw, stop, explode, shop, rubies, the last day. Now the Story begins.' : 'Draw, stop, explode, shop, rubies, the last day. The lightbulb explains anything new.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } const st = $('#start'); if (st) st.hidden = true; closeRS(true); UI.seed = TUT_SEED; UI.tut = {}; BF.pulling = false; newGame('tutorial'); },
    onDone: r => {
      tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { showStart(); GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { showStart(); GXC.open(); }
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
