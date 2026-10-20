// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged short game that teaches every rule by doing it once =====================
// The staged game: you and Bramble, one fixed deal (seed 4242), a city that already holds three red buildings, a short season (Winter, then Spring, then both pass).
// Bramble is scripted (tutAi) so each rule appears on cue. Nothing of it is saved, scored or counted. Each step spotlights one thing; only that thing answers;
// the step moves on only when the game reports that exact tap (GXT.act from onTarget).
const TUT_GAME = 'hollowbough', TUT_SEED = 4242;
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && !!(UI.cfg && UI.cfg.tutorial); }
function tutBtn(cls) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart }); }
function tutNode(cls) { const w = document.createElement('div'); w.innerHTML = tutBtn(cls); return w.firstChild; }
function firstTime() { try { return !localStorage.getItem('hb_played'); } catch (e) { return true; } }
function tutDone() { return typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME); }
// ---------------------------------------------------------------- the staged deal (cards are taken out of wherever they are, so all 128 stay accounted for)
function tutTake(g, key, avoid) {
  for (let id = 0; id < HB.NCARDS; id++) {
    if (HB.cardKey(id) !== key || (avoid && avoid.includes(id))) continue;
    for (const pool of [g.deck, g.discard, g.limbo]) { const i = pool.indexOf(id); if (i >= 0) { pool.splice(i, 1); return id; } }
    const mi = g.meadow.indexOf(id); if (mi >= 0) { g.meadow[mi] = -1; HB._.withG(g, () => HB._.refill()); return id; }
    for (const p of g.players) { const hi = p.hand.indexOf(id); if (hi >= 0) { p.hand.splice(hi, 1); return id; } }
  }
  throw new Error('tutorial: no free ' + key);
}
function tutStage(g) {
  const p = g.players[0], out = [];
  while (p.hand.length) g.discard.push(p.hand.pop());
  for (const k of ['mine', 'twig_barge', 'resin_refinery', 'farm', 'wife']) { const id = tutTake(g, k, out); p.hand.push(id); out.push(id); }
  for (const k of ['inn', 'post_office', 'lookout']) { const id = tutTake(g, k, out); HB._.withG(g, () => HB._.placeInCity(0, id)); out.push(id); }
  const toad = tutTake(g, 'barge_toad', out); const old = g.meadow[2]; if (old >= 0) g.discard.push(old); g.meadow[2] = toad;
  g.forest = [6, 1, 5];   // Bumper Bramble, Foragers Crossing, Mixed Glade
  g.nolog = false;
}
const tutId = k => { const h = G && G.players[0].hand.find(id => HB.cardKey(id) === k); return h == null ? -1 : h; };
const tutToad = () => G.meadow.find(id => id >= 0 && HB.cardKey(id) === 'barge_toad');
// ---------------------------------------------------------------- Bramble is scripted: the same spots every time, then she passes
(function () {
  const o = HB.AI.choose;
  HB.AI.choose = function (g, seat, level) {
    if (UI.cfg && UI.cfg.tutorial && g === G && seat === 1) {
      const p = g.players[1], mv = HB.moves(g, 1), key = (p.season === 0 ? 'w' : 's') + p.dep.length;
      const basic = k => mv.find(m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === k);
      const want = { w0: () => basic('basic_pebble_bank'), w1: () => basic('basic_kindling_glen'), w2: () => mv.find(m => m.type === 'prepare'),
        s0: () => basic('basic_gossip_glade'), s1: () => basic('basic_amber_weep'), s2: () => mv.find(m => m.type === 'pass') };
      const m = want[key] && want[key](); if (m) return m;
    }
    return o.apply(this, arguments);
  };
})();
// ---------------------------------------------------------------- where each step points
const tgEl = tg => () => { const e = UI.tgEls && UI.tgEls[tg]; return e && e.isConnected && e.getBoundingClientRect().width ? e : null; };
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; };
function tutUnion(sel) { return () => { const l = Array.from(document.querySelectorAll(sel)).map(e => e.getBoundingClientRect()).filter(r => r.width); if (!l.length) return null;
  const a = Math.min(...l.map(r => r.left)), b = Math.min(...l.map(r => r.top)), c = Math.max(...l.map(r => r.right)), d = Math.max(...l.map(r => r.bottom)); return { left: a, top: b, width: c - a, height: d - b }; }; }
// a fanned hand card: only its visible strip (the next card overlaps its right side), so the tap lands on that card
function tutHandRect(tg, id) { const e = UI.tgEls && UI.tgEls[tg]; if (!e || !e.isConnected) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; let right = r.right;
  const nx = e.nextElementSibling; if (nx && nx.classList.contains('sc')) { const q = nx.getBoundingClientRect(); if (q.left > r.left + 6) right = Math.min(right, q.left); }
  const w = Math.max(24, right - r.left), cx = r.left + w / 2, cy = r.top + r.height / 2; return { left: cx - w * .45, top: cy - r.height * .4, width: w * .9, height: r.height * .8 }; }
const tutIdle = () => !!G && UI.started && !UI.cards.length && !UI.animBusy && !UI.sel && !UI.cityOpen && !G.q && G.phase !== 'over';
const myTurn = () => tutIdle() && HB.actor(G) === 0;
const tapIs = tg => ({ type: 'tap', match: a => a.tg === (typeof tg === 'function' ? tg() : tg) });
const sc0 = () => (G.over && G.over.scores[0]) || {};
const cardTitle = k => UI.cards.length && UI.cards[0].kind === k ? UI.cards[0].title : '';
function tutSteps() {
  return [
    { id: 'goal', title: 'Your goal', say: 'Build a woodland city. When everyone has passed, the most points wins. Scores show here.', target: tq('#bd .chips'), wait: null, ready: myTurn },
    { id: 'places', title: 'Places for workers', say: 'Each place gives goods or cards. Every turn you send one worker to one place.', target: tutUnion('#bd .tile.t-basic, #bd .tile.t-forest'), wait: null, ready: myTurn },
    { id: 'twig', title: 'Send a worker', say: 'Tap the Twig Heap. It gives 3 twigs.', target: tgEl('w:basic:4'), wait: tapIs('w:basic:4'), ready: () => myTurn() && !!tgEl('w:basic:4')() },
    { id: 'stock', title: 'Your goods', say: () => 'Twigs, resin, pebbles and berries pay for cards. You hold ' + G.players[0].res.twig + ' twigs now.', target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].dep.length === 1 && !UI.cards.length },
    { id: 'rival', title: 'One worker per place', say: () => pname(1) + ' took the Pebble Bank. A place without the Shared mark holds one worker only.', target: () => { const e = document.querySelector('#bd .tile[data-k="basic"][data-i="3"]'); return e && e.getBoundingClientRect().width ? e : null; }, wait: null,
      ready: () => G.players[1].dep.length === 1 && myTurn() },
    { id: 'resin', title: 'Your second worker', say: 'Tap the Resin Pool. It gives 2 resin.', target: tgEl('w:basic:6'), wait: tapIs('w:basic:6'), ready: () => myTurn() && !!tgEl('w:basic:6')() },
    { id: 'hand', title: 'Your hand', say: 'These are your cards. Each shows its price in goods. Glowing cards are ones you can pay for.', target: tq('#bd .strip.hand'), wait: null, ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'build', title: 'Build from your hand', say: 'Tap the Allotment. Pay 2 twigs and 1 resin.', target: () => tutHandRect('p:hand:' + tutId('farm')), wait: tapIs(() => 'p:hand:' + tutId('farm')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'city', title: 'Your city', say: () => 'Built cards live here, ' + G.players[0].city.length + ' of 15: that is the limit. The Allotment gave a berry.', target: tq('#bd .strip.city'), wait: null,
      ready: () => !!G && G.players[0].city.some(e => HB.cardKey(e.id) === 'farm') && !UI.cards.length },
    { id: 'prep', title: 'Prepare for Spring', say: 'All workers are out. Prepare: they come home, you gain one, and the Allotment makes a berry.', target: tgEl('prep'), wait: tapIs('prep'),
      ready: () => myTurn() && !!tgEl('prep')() },
    { id: 'spring', title: 'A new season', say: () => 'Spring! You have ' + G.players[0].workers + ' workers and ' + G.players[0].res.berry + ' berries. Seasons go Winter, Spring, Summer, Autumn.', target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].season === 1 && !UI.cards.length },
    { id: 'berry', title: 'A shared place', say: 'Tap the Berry Patch. Shared places take many workers.', target: tgEl('w:basic:0'), wait: tapIs('w:basic:0'), ready: () => myTurn() && !!tgEl('w:basic:0')() },
    { id: 'toad', title: 'Buy from the meadow', say: 'The meadow is open to everyone. Tap the Toad: critters cost berries.', target: () => { const id = tutToad(); return id == null ? null : tgEl('p:meadow:' + id)(); },
      wait: { type: 'tap', match: a => /^p:meadow:/.test(a.tg || '') && HB.cardKey(+a.tg.split(':')[2]) === 'barge_toad' }, ready: () => myTurn() && tutToad() != null && !!tgEl('p:meadow:' + tutToad())() },
    { id: 'free', title: 'A free critter', say: 'A critter plays free into its matching building. Tap Goodwife: your Allotment fits her.', target: () => tutHandRect('p:hand:' + tutId('wife')), wait: tapIs(() => 'p:hand:' + tutId('wife')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('wife'))() },
    { id: 'event', title: 'Claim an event', say: 'You own three red buildings. Tap this flag: your worker claims the event for 3 points.', target: tgEl('w:bev:1'), wait: tapIs('w:bev:1'),
      ready: () => myTurn() && !!tgEl('w:bev:1')() },
    { id: 'forest', title: 'Forest places', say: 'Forest cards pay more. Tap Bumper Bramble for 3 berries.', target: tgEl('w:forest:0'), wait: tapIs('w:forest:0'), ready: () => myTurn() && !!tgEl('w:forest:0')() },
    { id: 'pass', title: 'Pass when done', say: 'Summer would bring more workers. Here, tap Pass twice to finish your game.', target: tgEl('pass'), wait: { type: 'tap', times: 2, match: a => a.tg === 'pass' },
      ready: () => myTurn() && !!tgEl('pass')() },
    { id: 'score', title: 'Final score', say: () => { const s = sc0(); return 'Card points ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + ': you score ' + s.total + '.'; }, target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => /^Final score: You/.test(cardTitle('over-score')) },
    { id: 'rscore', title: 'The rival scores', say: () => { const s = G.over.scores[1]; return pname(1) + ' scores ' + s.total + ' the same way. Passing early leaves workers unused.'; }, target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => new RegExp('^Final score: ' + pname(1)).test(cardTitle('over-score')) },
    { id: 'end', title: 'Most points wins', say: () => { const o = G.over; return o.winner === 0 ? 'You win, ' + o.scores[0].total + ' to ' + o.scores[1].total + '. A real game plays all four seasons.' : 'Highest total wins. A real game plays all four seasons.'; },
      target: tq('#pc .kv.tot'), wait: null, hold: c => c.kind === 'over', ready: () => !!cardTitle('over') }
  ];
}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c) { if (typeof GXT === 'undefined' || !GXT.active()) return false; const st = GXT.current(); return !!(st && st.hold && st.hold(c)); }
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen(); }
function tutStart(o) {
  if (typeof GXT === 'undefined') return; const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the rules', endText: pro ? 'Workers, goods, cards, events, seasons, passing, scoring. Now the Story begins.' : 'Workers, goods, cards, events, seasons, passing, scoring. The lightbulb explains the rest while you play.',
    endButtons: pro && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } closePop(); UI.camp = null; UI.seed = TUT_SEED; newGame('tutorial'); },
    onDone: r => { tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { campOpen(); }
      else { showStart(); } },
    onExit: () => { tutLeave(); showStart(); } });
}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave() { clearTimeout(UI.tm); clearTimeout(UI.tr); UI.started = false; UI.cards = []; UI.sel = null; UI.cfg = null; G = null; fxClear(); try { GXH.hide(); } catch (e) { } try { const f = $('#finger'); if (f) f.hidden = true; } catch (e) { }
  const bd = $('#bd'); if (bd) bd.innerHTML = ''; try { GX.undo.clear(); } catch (e) { } }
// the first-time offer: tapping Play before ever playing or learning offers the tutorial once
function tutOffer(go) {
  if (typeof GXT === 'undefined' || !firstTime() || tutDone()) return false;
  try { if (localStorage.getItem('hb_offer')) return false; localStorage.setItem('hb_offer', '1'); } catch (e) { return false; }
  const d = document.createElement('div'); d.className = 'gxt-end'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'New here?');
  d.innerHTML = '<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in 5 minutes by doing them once. Or jump straight in.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-offer="play">Play now</button></div></div>';
  d.addEventListener('click', e => { const b = e.target.closest('[data-offer]'); if (!b) return; d.remove(); if (b.dataset.offer === 'learn') tutStart(); else go(); });
  document.body.appendChild(d); return true;
}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function () {
  const o = onTarget;
  onTarget = function (tg, el) {
    if (tutOn() && !UI._tutIn) { if (!G || UI.cards.length) return; if (!/^x:/.test(tg) && !UI.animBusy && !GXT.act({ type: 'tap', tg })) return; }
    return o.apply(this, arguments);
  };
})();
(function () { const o = doUndo; doUndo = function () { if (tutOn()) return; return o.apply(this, arguments); }; })();
(function () { const o = nextCard; nextCard = function () { if (tutOn() && !UI._tutIn && UI.cards.length && UI.cards[0].kind !== 'pass') return; return o.apply(this, arguments); }; })();
