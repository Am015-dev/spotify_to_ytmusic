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
    if (UI.cfg && UI.cfg.tutorial && !UI.cfg.coached && g === G && seat === 1) {
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
const tsay = (id, ...a) => { const v = HBS.steps[id].say; return typeof v === 'function' ? v(...a) : v; };
const tchip = id => (HBS.steps[id].ch ? 'Ch ' + HBS.steps[id].ch + ' · ' : '');
// Hazel's reaction after the action (a chip over the board, ~2.3 s; the next step waits for it: one thing at a time)
function tutReact(txt, ms) {
  if (!txt) return; let e = document.getElementById('hbsay');
  if (!e) { e = document.createElement('div'); e.id = 'hbsay'; e.setAttribute('role', 'status'); e.setAttribute('data-help', ''); document.body.appendChild(e); }
  e.innerHTML = '<span class="pt" style="background:' + HBS.guide.color + '">' + HBS.guide.emoji + '</span><span class="tx"><b>' + HBS.guide.name + '</b> ' + txt + '</span>';
  e.classList.add('on'); UI.reactUntil = Date.now() + (ms || 2300); clearTimeout(UI.reactTm); UI.reactTm = setTimeout(() => e.classList.remove('on'), ms || 2300);
}
function tutSteps() {
  const S = HBS.steps, L = [
    { id: 'goal', title: () => 'Ch 1 · Hazel', say: tsay('goal'), target: tq('#bd .chips'), wait: null, ready: myTurn },
    { id: 'places', title: S.places.title, say: tsay('places'), target: tutUnion('#bd .tile.t-basic, #bd .tile.t-forest'), wait: null, ready: myTurn },
    { id: 'twig', title: S.twig.title, say: tsay('twig'), target: tgEl('w:basic:4'), wait: tapIs('w:basic:4'), ready: () => myTurn() && !!tgEl('w:basic:4')() },
    { id: 'stock', title: S.stock.title, say: () => tsay('stock', G.players[0].res.twig), target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].dep.length === 1 && !UI.cards.length },
    { id: 'rival', title: S.rival.title, say: () => tsay('rival', pname(1)), target: () => { const e = document.querySelector('#bd .tile[data-k="basic"][data-i="3"]'); return e && e.getBoundingClientRect().width ? e : null; }, wait: null,
      ready: () => G.players[1].dep.length === 1 && myTurn() },
    { id: 'resin', title: S.resin.title, say: tsay('resin'), target: tgEl('w:basic:6'), wait: tapIs('w:basic:6'), ready: () => myTurn() && !!tgEl('w:basic:6')() },
    { id: 'hand', title: () => 'Ch 2 · Building', say: tsay('hand'), target: tq('#bd .strip.hand'), wait: null, ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'build', title: S.build.title, say: tsay('build'), target: () => tutHandRect('p:hand:' + tutId('farm')), wait: tapIs(() => 'p:hand:' + tutId('farm')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'city', title: S.city.title, say: () => tsay('city', G.players[0].city.length), target: tq('#bd .strip.city'), wait: null,
      ready: () => !!G && G.players[0].city.some(e => HB.cardKey(e.id) === 'farm') && !UI.cards.length },
    { id: 'prep', title: S.prep.title, say: tsay('prep'), target: tgEl('prep'), wait: tapIs('prep'),
      ready: () => myTurn() && !!tgEl('prep')() },
    { id: 'spring', title: S.spring.title, say: () => tsay('spring', G.players[0].workers, G.players[0].res.berry), target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].season === 1 && !UI.cards.length },
    { id: 'berry', title: () => 'Ch 3 · Sharing', say: tsay('berry'), target: tgEl('w:basic:0'), wait: tapIs('w:basic:0'), ready: () => myTurn() && !!tgEl('w:basic:0')() },
    { id: 'toad', title: S.toad.title, say: tsay('toad'), target: () => { const id = tutToad(); return id == null ? null : tgEl('p:meadow:' + id)(); },
      wait: { type: 'tap', match: a => /^p:meadow:/.test(a.tg || '') && HB.cardKey(+a.tg.split(':')[2]) === 'barge_toad' }, ready: () => myTurn() && tutToad() != null && !!tgEl('p:meadow:' + tutToad())() },
    { id: 'free', title: S.free.title, say: tsay('free'), target: () => tutHandRect('p:hand:' + tutId('wife')), wait: tapIs(() => 'p:hand:' + tutId('wife')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('wife'))() },
    { id: 'event', title: S.event.title, say: tsay('event'), target: tgEl('w:bev:1'), wait: tapIs('w:bev:1'),
      ready: () => myTurn() && !!tgEl('w:bev:1')() },
    { id: 'forest', title: S.forest.title, say: tsay('forest'), target: tgEl('w:forest:0'), wait: tapIs('w:forest:0'), ready: () => myTurn() && !!tgEl('w:forest:0')() },
    { id: 'pass', title: () => 'Ch 4 · Winter ends', say: tsay('pass'), target: tgEl('pass'), wait: { type: 'tap', times: 2, match: a => a.tg === 'pass' },
      ready: () => myTurn() && !!tgEl('pass')() },
    { id: 'score', title: S.score.title, say: () => tsay('score', sc0()), target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => /^Final score: You/.test(cardTitle('over-score')) },
    { id: 'rscore', title: S.rscore.title, say: () => tsay('rscore', pname(1), G.over.scores[1].total), target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => new RegExp('^Final score: ' + pname(1)).test(cardTitle('over-score')) },
    { id: 'end', title: S.end.title, say: () => tsay('end', G.over.winner === 0, G.over.scores[0].total, G.over.scores[1].total),
      target: tq('#pc .kv.tot'), wait: null, hold: c => c.kind === 'over', ready: () => !!cardTitle('over') }
  ];
  // reaction beat after each action, and the next step waits until it has been read
  L.forEach(st => {
    const r = HBS.steps[st.id].react, rd = st.ready; UI.tutLog = UI.tutLog || [];
    st.onEnter = () => { UI.tutLog.push(st.id); };
    if (r) st.onDone = () => { tutReact(r, st.id === 'resin' || st.id === 'forest' ? 3000 : 2300); };
    st.ready = () => (!UI.reactUntil || Date.now() >= UI.reactUntil) && (!rd || rd());
  });
  return L;
}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c) { if (typeof GXT === 'undefined' || !GXT.active()) return false; const st = GXT.current(); return !!(st && st.hold && st.hold(c)); }
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen(); }
function tutStart(o) {
  const pro = !!(o && o.prologue);
  try { GX.close(); } catch (e) { } closePop(); UI.camp = null; UI.reactUntil = 0; UI.tutLog = []; UI.coachDone = {}; UI.coachUntil = 0; UI.coachT0 = Date.now(); UI.coachPro = pro; UI.seed = TUT_SEED;
  newGame('tutorial');
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
// ===================== part 14: the coached first game (replaces the forced tap-by-tap tutorial) =====================
// A real game, all legal moves allowed, on a stacked deal (seed 4242, tutStage). Hazel speaks just-in-time: one chip at a time, never blocks input,
// tap it to dismiss. Each rule in COACH is explained the first time it becomes relevant; the rules that never came up are listed on
// "Things you'll meet later" at the end. The final score is walked through with the player's real numbers. Not saved, not counted.
const COACH = [
  { id: 'goal', when: () => true, say: () => 'The thaw is here and the Elderheart Oak needs a steward. Most points when we have both passed wins it. Start anywhere: the Twig Heap is a safe first pick.', later: 'Goal: most points when everyone has passed.' },
  { id: 'places', when: (p, r) => myTurnC() && p.dep.length === 0 && Date.now() - UI.coachT0 > 4000, say: () => 'Each turn you send one worker to one place. Basic places give goods, the forest gives more, and cards are bought from the meadow.', later: 'Each turn: one worker to one place.' },
  { id: 'stock', when: (p) => p.dep.length >= 1, say: p => 'Twigs, resin, pebbles and berries pay for buildings and critters. You hold ' + p.res.twig + ' twigs, ' + p.res.resin + ' resin, ' + p.res.pebble + ' pebbles and ' + p.res.berry + ' berries.', later: 'Goods pay for cards.' },
  { id: 'rival', when: (p, r) => r.dep.length >= 1 && p.dep.length >= 1, say: (p, r) => r.name + ' sent a worker. A place without the Shared mark holds one worker only, so it is closed to you this season.', later: 'A place without the Shared mark holds one worker.' },
  { id: 'hand', when: (p) => myTurnC() && p.hand.length > 0 && p.dep.length >= 1, say: () => 'Your hand holds plans: each shows its price, glowing ones you can afford. Build one by paying its price. Your city holds 15 buildings and your hand 8 cards.', later: 'Hand limit 8, city limit 15; glowing cards are affordable.' },
  { id: 'build', when: (p) => p.city.length > 3, say: () => 'A building! It stays in your city. Production buildings pay again every season.', later: 'Buildings stay in your city; production pays each season.' },
  { id: 'free', when: (p) => !!p.hand.find(id => HB.cardKey(id) === 'wife') && p.city.some(e => HB.cardKey(e.id) === 'farm') && myTurnC(), say: () => 'The Goodwife loves your Allotment: a critter moves into its matching building for free. Try her from your hand.', later: 'A critter moves into its matching building free.' },
  { id: 'meadow', when: (p) => myTurnC() && p.dep.length >= 2 && p.res.berry >= 1, say: () => 'The meadow is open to everyone. Critters cost berries; bought cards join your hand and the meadow refills.', later: 'The meadow of 8 is open to everyone; critters cost berries.' },
  { id: 'event', when: (p) => myTurnC() && p.season >= 1, say: () => 'Flags are events: the first to hold the right buildings claims one for three points. Only one claimer, so be quick.', later: 'Events: right buildings, first to claim, 3 points.' },
  { id: 'prep', when: (p) => !p.passed && p.season < 3 && p.workers - p.dep.length === 0 && myTurnC(), say: () => 'Every worker is out. Prepare for Season: they all come home, you gain one more, and production pays.', later: 'Prepare for Season: workers home, +1 worker, production.' },
  { id: 'spring', when: (p) => p.season >= 1, say: p => 'A new season! Seasons run Winter, Spring, Summer, Autumn. You have ' + p.workers + ' workers now. Summer draws cards, Autumn brings bonus workers.', later: 'Seasons: Winter, Spring, Summer (draw), Autumn (bonus workers).' },
  { id: 'shared', when: (p) => myTurnC() && p.season >= 1, say: () => 'Shared places take many workers: even rivals share the Berry Patch.', later: 'Shared places take many workers.' },
  { id: 'forest', when: (p) => myTurnC() && p.dep.length >= 2, say: () => 'The forest pays more goods than the basic places, but each spot holds one worker.', later: 'Forest places pay more.' },
  { id: 'pass', when: (p) => !p.passed && myTurnC() && (p.season >= 2 || (p.season >= 1 && p.workers - p.dep.length === 0)), say: () => 'When you are done, Pass. The game ends when everyone has passed, and workers left unused are wasted points.', later: 'Pass ends your game; unused workers are wasted.' }
];
// rules that need a situation we cannot count on: told at the end
const COACH_LATER = [
  { id: 'inn', later: 'The Inn and Post Office are open places: you play the rival\'s open card and they get a point.' },
  { id: 'haven', later: 'The Haven turns two discarded cards into one good.' },
  { id: 'longroad', later: 'The Long Road is a journey for Autumn only.' },
  { id: 'special', later: 'Special events need particular buildings and cost goods.' },
  { id: 'tie', later: 'Tie-break: most events, then most leftover goods.' }
];
const myTurnC = () => !!G && UI.started && G.phase !== 'over' && !UI.cards.length && !UI.animBusy && HB.actor(G) === 0;
function coachChip(txt, ms) {
  let e = document.getElementById('hbsay');
  if (!e) { e = document.createElement('div'); e.id = 'hbsay'; e.setAttribute('role', 'status'); e.setAttribute('data-help', ''); document.body.appendChild(e); }
  e.innerHTML = '<span class="pt" style="background:' + HBS.guide.color + '">' + HBS.guide.emoji + '</span><span class="tx"><b>' + HBS.guide.name + '</b> ' + txt + '</span>';
    UI.coachShown = Date.now(); e.classList.add('on'); UI.coachUntil = Date.now() + ms; clearTimeout(UI.coachTm); UI.coachTm = setTimeout(() => { e.classList.remove('on'); }, ms);
}
function coachSay(id, txt, ms) { UI.tutLog = UI.tutLog || []; if (!UI.tutLog.includes(id)) UI.tutLog.push(id); coachChip(txt, ms || 6500); }
function coachTick() {
  if (!UI.cfg || !UI.cfg.coached || !G || !UI.started) return;
  const p = G.players[0], r = G.players[1], now = Date.now(), cd = UI.coachDone = UI.coachDone || {};
  UI.coachT0 = UI.coachT0 || now;
  try {
    // the end: walk through the score with the real numbers, one chip per score card, then the "later" card
    if (G.phase === 'over' && G.over) {
      const t = UI.cards.length ? UI.cards[0] : null, s0 = G.over.scores[0], s1 = G.over.scores[1];
      if (t && t.kind === 'over-score' && /^Final score: You/.test(t.title) && !cd.score) { cd.score = 1; coachSay('score', 'The count: cards ' + (s0.cards != null ? s0.cards : '?') + ', tokens ' + (s0.tokens != null ? s0.tokens : '?') + ', events ' + (s0.events != null ? s0.events : '?') + (s0.bonus != null ? ', bonuses ' + s0.bonus : '') + '. You score ' + s0.total + '. Every point is a home.', 9000); }
      else if (t && t.kind === 'over-score' && !/^Final score: You/.test(t.title) && !cd.rscore) { cd.rscore = 1; coachSay('rscore', r.name + ' scores ' + s1.total + ' the same way. The higher total wins; a tie goes to most events, then most leftover goods.', 9000); }
      else if (t && t.kind === 'over' && !cd.end) { cd.end = 1; coachSay('end', G.over.winner === 0 ? 'The Oak bows to you, ' + s0.total + ' to ' + s1.total + '. A real game plays all four seasons.' : 'The Oak picks the higher total. A real game plays all four seasons.', 9000); setTimeout(coachLater, 2600); }
      return;
    }
    if (now < (UI.coachUntil || 0) + 400) return;   // one chip at a time
    for (const c of COACH) { if (cd[c.id] || !c.when(p, r)) continue; cd[c.id] = 1; coachSay(c.id, c.say(p, r)); break; }
  } catch (e) { console.warn('coach', e); }
}
function coachLater() {
  if (document.querySelector('.hb-later')) return;
  const left = COACH.filter(c => !(UI.coachDone || {})[c.id]).concat(COACH_LATER);
  const d = document.createElement('div'); d.className = 'gxt-end hb-later'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Things you will meet later');
  const pro = !!UI.coachPro, first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  d.innerHTML = '<div class="gxt-endc" style="max-height:86vh;overflow:auto"><div class="gxt-et">Things you\'ll meet later</div><div class="gxt-ex"><ul style="text-align:left;margin:6px 0 10px 18px;padding:0;font-size:14px;line-height:1.35">' + left.map(c => '<li data-rule="' + c.id + '">' + c.later + '</li>').join('') + '</ul>' + HBS.end.text + '</div><div class="gxt-eb">' + (pro && first ? '<button type="button" class="gxt-b pri" data-later="chapter">Start chapter 1</button><button type="button" class="gxt-b" data-later="menu">Menu</button>' : '<button type="button" class="gxt-b pri" data-later="menu">Done</button>') + '</div></div>';
  d.addEventListener('click', e => { const b = e.target.closest('[data-later]'); if (!b) return; d.remove(); try { GXT.markDone(TUT_GAME); } catch (x) { } const c = b.dataset.later; tutLeave(); if (c === 'chapter' && first && typeof GXC !== 'undefined') GXC.play(first.id); else showStart(); });
  UI.tutLog = UI.tutLog || []; UI.tutLog.push('later'); UI.laterList = left.map(c => c.id);
  document.body.appendChild(d);
}
// the chip never takes a tap (it must not cover a target); any tap on the board dismisses it after 2.5 s
document.addEventListener('pointerdown', () => { const e = document.getElementById('hbsay'); if (e && e.classList.contains('on') && Date.now() > (UI.coachShown || 0) + 2500) { e.classList.remove('on'); UI.coachUntil = 0; } }, true);
(function () { const o = render; render = function () { const r = o.apply(this, arguments); coachTick(); return r; }; })();
setInterval(() => { try { coachTick(); } catch (e) { } }, 800);
