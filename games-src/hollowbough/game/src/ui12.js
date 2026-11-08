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
  g.tale = true;          // the lesson is a short year: it may end before Autumn (a real game passes only in Autumn)
  g.nolog = false;
}
const tutId = k => { const h = G && G.players[0].hand.find(id => HB.cardKey(id) === k); return h == null ? -1 : h; };
const tutToad = () => G.meadow.find(id => id >= 0 && HB.cardKey(id) === 'barge_toad');
// ---------------------------------------------------------------- Bramble is scripted: the same spots every time, then she passes
(function () {
  const o = HB.AI.choose;
  HB.AI.choose = function (g, seat, level) {
    if (UI.cfg && UI.cfg.coached && UI.coachEnd && g === G && seat === 1) { const ps = HB.moves(g, 1).find(m => m.type === 'pass'); if (ps) return ps; }
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
    { id: 'goal', title: S.goal.title, say: tsay('goal'), target: tq('#bd .chips'), wait: null, ready: myTurn },
    { id: 'places', title: S.places.title, say: tsay('places'), target: tutUnion('#bd .tile.t-basic, #bd .tile.t-forest'), wait: null, ready: myTurn },
    { id: 'twig', title: S.twig.title, say: tsay('twig'), target: tgEl('w:basic:4'), wait: tapIs('w:basic:4'), ready: () => myTurn() && !!tgEl('w:basic:4')() },
    { id: 'stock', title: S.stock.title, say: () => tsay('stock', G.players[0].res.twig), target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].dep.length === 1 && !UI.cards.length },
    { id: 'rival', title: S.rival.title, say: () => tsay('rival', pname(1)), target: () => { const e = document.querySelector('#bd .tile[data-k="basic"][data-i="3"]'); return e && e.getBoundingClientRect().width ? e : null; }, wait: null,
      ready: () => G.players[1].dep.length === 1 && myTurn() },
    { id: 'resin', title: S.resin.title, say: tsay('resin'), target: tgEl('w:basic:6'), wait: tapIs('w:basic:6'), ready: () => myTurn() && !!tgEl('w:basic:6')() },
    { id: 'hand', title: S.hand.title, say: tsay('hand'), target: tq('#bd .strip.hand'), wait: null, ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'build', title: S.build.title, say: tsay('build'), target: () => tutHandRect('p:hand:' + tutId('farm')), wait: tapIs(() => 'p:hand:' + tutId('farm')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'city', title: S.city.title, say: () => tsay('city', G.players[0].city.length), target: tq('#bd .strip.city'), wait: null,
      ready: () => !!G && G.players[0].city.some(e => HB.cardKey(e.id) === 'farm') && !UI.cards.length },
    { id: 'prep', title: S.prep.title, say: tsay('prep'), target: tgEl('prep'), wait: tapIs('prep'),
      ready: () => myTurn() && !!tgEl('prep')() },
    { id: 'spring', title: S.spring.title, say: () => tsay('spring', G.players[0].workers, G.players[0].res.berry), target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].season === 1 && !UI.cards.length },
    { id: 'berry', title: S.berry.title, say: tsay('berry'), target: tgEl('w:basic:0'), wait: tapIs('w:basic:0'), ready: () => myTurn() && !!tgEl('w:basic:0')() },
    { id: 'toad', title: S.toad.title, say: tsay('toad'), target: () => { const id = tutToad(); return id == null ? null : tgEl('p:meadow:' + id)(); },
      wait: { type: 'tap', match: a => /^p:meadow:/.test(a.tg || '') && HB.cardKey(+a.tg.split(':')[2]) === 'barge_toad' }, ready: () => myTurn() && tutToad() != null && !!tgEl('p:meadow:' + tutToad())() },
    { id: 'free', title: S.free.title, say: tsay('free'), target: () => tutHandRect('p:hand:' + tutId('wife')), wait: tapIs(() => 'p:hand:' + tutId('wife')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('wife'))() },
    { id: 'event', title: S.event.title, say: tsay('event'), target: tgEl('w:bev:1'), wait: tapIs('w:bev:1'),
      ready: () => myTurn() && !!tgEl('w:bev:1')() },
    { id: 'forest', title: S.forest.title, say: tsay('forest'), target: tgEl('w:forest:0'), wait: tapIs('w:forest:0'), ready: () => myTurn() && !!tgEl('w:forest:0')() },
    { id: 'prep2', title: S.prep2.title, say: tsay('prep2'), target: tgEl('prep'), wait: tapIs('prep'), ready: () => myTurn() && G.players[0].season === 1 && !!tgEl('prep')() },
    { id: 'summer', title: S.summer.title, say: tsay('summer'), target: tq('#bd [data-t^="q:"]'), wait: { type: 'tap', times: 2, match: a => /^q:/.test(a.tg || '') },
      ready: () => !!G && !!G.q && HB.actor(G) === 0 && !UI.cards.length && !UI.animBusy && !!tq('#bd [data-t^="q:"]')() },
    tutLook('haven', tq('#bd .tile[data-k="haven"]'), tg => /w:haven$/.test(tg)),
    tutLook('journey', tq('#bd .tile[data-k="journey"]'), tg => /w:journey$/.test(tg)),
    tutLook('inn', () => { const e = G && G.players[0].city.find(c => HB.cardKey(c.id) === 'inn'); return e ? tq('#bd .strip.city .sc[data-id="' + e.id + '"]')() : null; },
      tg => { const e = G && G.players[0].city.find(c => HB.cardKey(c.id) === 'inn'); return !!e && (tg === 'd:' + e.id || tg === 'x:c' + e.id); }),
    tutLook('special', tq('#bd .tile[data-k="sev"][data-i="0"]'), tg => /w:sev:0$/.test(tg)),
    { id: 'autumn', title: S.autumn.title, say: tsay('autumn'), target: tq('#bd .chips'), wait: null, ready: myTurn },
    { id: 'pass', title: S.pass.title, say: tsay('pass'), target: tgEl('pass'), wait: { type: 'tap', times: 2, match: a => a.tg === 'pass' },
      ready: () => myTurn() && !!tgEl('pass')() },
    { id: 'score', title: S.score.title, say: () => tsay('score', sc0(), pname(1), G.over.scores[1].total), target: tq('#pc table.vs'), wait: null,
      hold: c => c.kind === 'over-score', ready: () => !!cardTitle('over-score') && !!document.querySelector('#pc:not([hidden]) table.vs') },
    { id: 'bonus', title: S.bonus.title, say: tsay('bonus'), target: tq('#pc table.vs'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => !!cardTitle('over-score') && !!document.querySelector('#pc:not([hidden]) table.vs') },
    { id: 'end', title: S.end.title, say: () => tsay('end', G.over.winner === 0, G.over.scores[0].total, G.over.scores[1].total),
      target: tq('#pc:not([hidden]) > :first-child'), wait: null, hold: c => c.kind === 'over', ready: () => !!cardTitle('over') && !!tq('#pc:not([hidden])')() }
  ];
  // reaction beat after each action, and the next step waits until it has been read
  L.forEach(st => {
    const r = HBS.steps[st.id].react, rd = st.ready; UI.tutLog = UI.tutLog || [];
    const tab = { twig: 'places', places: 'places', resin: 'places', rival: 'places', berry: 'places', forest: 'places', toad: 'meadow', event: 'goals', city: 'city', summer: 'meadow', haven: 'places', journey: 'goals', inn: 'city', special: 'goals' }[st.id];
    if (tab) st.avoid = () => { const pn = document.querySelector('#bd .pv-panel.on'); return pn ? [pn.getBoundingClientRect()] : null; };   // the bubble keeps the board it talks about visible
    st.onEnter = () => { UI.tutLog.push(st.id); UI.tutTab = tab || null; if (tab) { UI.pvTab = tab; try { pvSetTab(tab, true); } catch (e) { } } };
    st.ready = () => { if (tab && G && UI.pvTab !== tab && HB.actor(G) === 0 && !UI.cards.length) { UI.pvTab = tab; try { pvSetTab(tab, true); } catch (e) { } }
      try { const el = st.target && st.target(); const row = el && el.closest && el.closest('.hscroll'); if (row) { const r = el.getBoundingClientRect(), q = row.getBoundingClientRect(); if (r.left < q.left - 1 || r.right > q.right + 1) { row.scrollLeft += r.left - q.left - (q.width - r.width) / 2; UI.pvMx = row.scrollLeft; } } } catch (e) { }   // the target is never half off screen
      return (!UI.reactUntil || Date.now() >= UI.reactUntil) && (!rd || rd()); };
  });
  return L;
}
// a "look" step: tap the real thing on the board to learn it; the tap teaches, it does not move a worker
function tutLook(id, target, isIt) {
  const S = HBS.steps;
  return { id, title: S[id].title, say: tsay(id), target, look: isIt, wait: tapIs('look:' + id), ready: () => myTurn() && !!target() };
}
// one spotlight: a single box-shadow hole that follows the kit's ring (the kit's tiled dim cells leave 1px seams on phones)
(function spot() {
  requestAnimationFrame(spot);
  let s = document.getElementById('hbspot'); const r = typeof GXT !== 'undefined' && GXT.running() && document.querySelector('.gxt-cell') ? document.querySelector('.gxt-ring') : null;
  if (!r) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement('div'); s.id = 'hbspot'; s.setAttribute('aria-hidden', 'true'); document.body.appendChild(s); }
  const k = r.style.left + r.style.top + r.style.width + r.style.height; if (s._k !== k) { s._k = k; s.style.left = r.style.left; s.style.top = r.style.top; s.style.width = r.style.width; s.style.height = r.style.height; }
})();
// ---------------------------------------------------------------- the kit hooks
function tutHold(c) { if (typeof GXT === 'undefined' || !GXT.active()) return false; const st = GXT.current(); return !!(st && st.hold && st.hold(c)); }
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen(); }
function tutStart(o) {
  const pro = !!(o && o.prologue);
  try { GX.close(); } catch (e) { } closePop(); UI.camp = null; UI.reactUntil = 0; UI.tutTab = null; UI.tutLog = []; UI.coachDone = {}; UI.coachUntil = 0; UI.coachT0 = Date.now(); UI.coachPro = pro; UI.coachActs = 0; UI.coachKey = 0; UI.coachEnd = 0; UI.coachSnap = null; UI.fbLog = []; UI.fbQ = []; UI.seed = TUT_SEED; window.GXCOACH = { running: true, explained: [], done: false };
  newGame('tutorial');
  // Learn to play: one step at a time. Each step names the exact thing to tap, glows it, and waits for that tap.
  if (typeof GXT !== 'undefined') GXT.start({ game: TUT_GAME, steps: tutSteps(), endTitle: 'You know the rules', endText: HBS.end.text,
    endButtons: pro && window.CAMPAIGN && window.CAMPAIGN.chapters ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    onDone: o => { tutLeave(); const c = o && o.choice; if (c === 'play') { newGame('vs'); return; } if (c === 'chapter' || c === 'story') { const f = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0]; if (c === 'chapter' && f && typeof GXC !== 'undefined') GXC.play(f.id); else campOpen(); } else showStart(); },
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
    if (tutOn() && !UI._tutIn) { if (!G || UI.cards.length) return;
      const st = GXT.current(); if (st && st.look) { let hit = false; try { hit = !!st.look(String(tg)); } catch (e) { } GXT.act({ type: 'tap', tg: hit ? 'look:' + st.id : String(tg) }); return; }
      if (!/^x:/.test(tg) && !UI.animBusy && !GXT.act({ type: 'tap', tg })) return; }
    return o.apply(this, arguments);
  };
})();
(function () { const o = doUndo; doUndo = function () { if (tutOn()) return; return o.apply(this, arguments); }; })();
(function () { const o = nextCard; nextCard = function () { if (tutOn() && !UI._tutIn && UI.cards.length && UI.cards[0].kind !== 'pass') return; return o.apply(this, arguments); }; })();
// ===================== part 14: the coached first game (replaces the forced tap-by-tap tutorial) =====================
// A real game, all legal moves allowed, on a stacked deal (seed 4242, tutStage). Hazel speaks just-in-time: one chip at a time, never blocks input,
// tap it to dismiss. Each rule in COACH is explained the first time it becomes relevant; the rules that never came up are listed on
// "Things you'll meet later" at the end. The final score is walked through with the player's real numbers. Not saved, not counted.
window.GXCOACH = { running: false, explained: [], done: false };   // read by the QA bot's coached mode
const COACH = [
  { id: 'goal', when: () => true, say: () => 'Most points when everyone has passed wins. Start with the 3 twigs place.', later: 'Goal: most points when everyone has passed.' },
  { id: 'places', when: (p, r) => myTurnC() && p.dep.length === 0 && Date.now() - UI.coachT0 > 4000, say: () => 'Each turn, send one worker to one place. Basic places give goods. The forest gives more.', later: 'Each turn: one worker to one place.' },
  { id: 'stock', when: (p) => p.dep.length >= 1, say: p => 'Twigs, resin, pebbles and berries pay for cards. You hold ' + p.res.twig + ' twigs, ' + p.res.resin + ' resin, ' + p.res.pebble + ' pebbles and ' + p.res.berry + ' berries.', later: 'Goods pay for cards.' },
  { id: 'rival', when: (p, r) => r.dep.length >= 1 && p.dep.length >= 1, say: (p, r) => r.name + ' sent a worker. A place without the Shared mark holds one worker. It is closed to you.', later: 'A place without the Shared mark holds one worker.' },
  { id: 'hand', when: (p) => myTurnC() && p.hand.length > 0 && p.dep.length >= 1, say: () => 'Your hand holds plans. Glowing ones are affordable. Pay the price to build. City holds 15, hand holds 8.', later: 'Hand holds 8, city holds 15. Glowing cards are affordable.' },
  { id: 'build', when: (p) => p.city.length > 3, say: () => 'A building! It stays in your city. Production cards pay again each season.', later: 'Buildings stay in your city. Production pays each season.' },
  { id: 'free', when: (p) => !!p.hand.find(id => HB.cardKey(id) === 'wife') && p.city.some(e => HB.cardKey(e.id) === 'farm') && myTurnC(), say: () => 'The Goodwife fits your Allotment. She moves in free. Play her from your hand.', later: 'A critter moves into its matching building free.' },
  { id: 'meadow', when: (p) => myTurnC() && p.dep.length >= 2 && p.res.berry >= 1, say: () => 'Anyone can buy from the meadow. Critters cost berries. The meadow refills.', later: 'The meadow holds 8 cards for anyone. Critters cost berries.' },
  { id: 'event', when: (p) => myTurnC() && p.season >= 1, say: () => 'Flags are events. Build what one needs, then claim it for three points. Only one player can.', later: 'Events: build what they need, claim first, 3 points.' },
  { id: 'prep', when: (p) => !p.passed && p.season < 3 && p.workers - p.dep.length === 0 && myTurnC(), say: () => 'All workers are out. Prepare: they come home, you gain one, production pays.', later: 'Prepare: workers come home, +1 worker, production pays.' },
  { id: 'spring', when: (p) => p.season >= 1, say: p => 'A new season! You have ' + p.workers + ' workers. Summer draws cards. Autumn brings extra workers.', later: 'Seasons: Winter, Spring, Summer (draw cards), Autumn (extra workers).' },
  { id: 'shared', when: (p) => myTurnC() && p.season >= 1, say: () => 'Shared places take many workers. Rivals share the Berry Patch.', later: 'Shared places take many workers.' },
  { id: 'forest', when: (p) => myTurnC() && p.dep.length >= 2, say: () => 'The forest pays more goods. Each spot holds one worker.', later: 'Forest places pay more.' },
  { id: 'pass', when: (p) => !p.passed && myTurnC() && (p.season >= 2 || (p.season >= 1 && p.workers - p.dep.length === 0)), say: () => 'When you are done, Pass. The game ends when all have passed. Unused workers are wasted.', later: 'Pass ends your game. Unused workers are wasted.' }
];
// rules that need a situation we cannot count on: told at the end
const COACH_TALE = 14;   // the first game is a short tale: after this many of your own actions Hazel passes for you
const COACH_LATER = [
  { id: 'inn', later: 'The Inn and Post Office are open. You play a rival\'s open card. They get a point.' },
  { id: 'haven', later: 'The Haven turns two discarded cards into one resource.' },
  { id: 'longroad', later: 'The Long Road opens in Autumn only.' },
  { id: 'special', later: 'Special events need certain buildings and cost goods.' },
  { id: 'tie', later: 'Ties go to most events, then most leftover goods.' }
];
const myTurnC = () => !!G && UI.started && G.phase !== 'over' && !UI.cards.length && !UI.animBusy && HB.actor(G) === 0;
function coachChip(txt, ms) {
  let e = document.getElementById('hbsay');
  if (!e) { e = document.createElement('div'); e.id = 'hbsay'; e.setAttribute('role', 'status'); e.setAttribute('data-help', ''); document.body.appendChild(e); }
  e.innerHTML = '<span class="pt" style="background:' + HBS.guide.color + '">' + HBS.guide.emoji + '</span><span class="tx"><b>' + HBS.guide.name + '</b> ' + txt + '</span>';
    const words = String(txt).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length, read = 4000 + 100 * words; ms = Math.max(ms || 0, read);   // readable: 4 s + 1 s per 10 words
    UI.coachShown = Date.now(); UI.coachRead = Date.now() + read; e.classList.add('on'); UI.coachUntil = Date.now() + ms; clearTimeout(UI.coachTm); UI.coachTm = setTimeout(() => { e.classList.remove('on'); }, ms);
}
function coachSay(id, txt, ms) { UI.tutLog = UI.tutLog || []; if (!UI.tutLog.includes(id)) UI.tutLog.push(id); window.GXCOACH.explained = UI.tutLog.slice(); coachChip(txt, ms || 6500); }
// good / poor move feedback: one line, with the reason, after what the player just did (compared with the board before it)
function coachFeedback(p) {
  const tot = q => q.res.twig + q.res.resin + q.res.pebble + q.res.berry, snap = { city: p.city.length, hand: p.hand.length, pts: p.pts, res: tot(p), dep: p.dep.length, passed: !!p.passed, un: p.workers - p.dep.length, season: p.season }, b = UI.coachSnap; UI.coachSnap = snap;
  if (!b || b.season !== snap.season && snap.dep === 0) return null;
  const say = (k, t) => { const L = UI.fbLog = UI.fbLog || []; if (L.filter(x => x === k).length >= 2) return null; L.push(k); return t; };
  if (snap.passed && !b.passed) return snap.un > 0 ? say('poor:pass', 'You passed with ' + snap.un + ' worker' + (snap.un > 1 ? 's' : '') + ' still home. Each was a lost action.') : say('good:pass', 'Good: every worker was used before you passed.');
  if (snap.city > b.city) { const e = p.city[p.city.length - 1], sp = e && spec(e.id); return say('good:build', 'Good: ' + (sp ? sp.name : 'a building') + ' is built' + (sp && sp.points ? ', worth ' + sp.points + ' point' + (sp.points > 1 ? 's' : '') + ' for good.' : '. It will keep paying every season.')); }
  if (snap.pts >= b.pts + 3) return say('good:points', 'Good: +' + (snap.pts - b.pts) + ' points in one move. Events and big cards pay best.');
  if (snap.hand >= 8 && b.hand < 8) return say('poor:hand', 'Careful: your hand is full at 8. Extra cards are lost. Play one soon.');
  if (snap.dep > b.dep && snap.res <= b.res && snap.hand <= b.hand && snap.pts <= b.pts) return say('poor:empty', 'That worker gained nothing. Check what glows before you send one.');
  if (snap.res >= b.res + 3 && snap.dep > b.dep) return say('good:goods', 'Good: ' + (snap.res - b.res) + ' goods at once. Goods pay for buildings.');
  return null;
}
function coachTick() {
  if (!UI.cfg || !UI.cfg.coached || !G || !UI.started) return;
  const p = G.players[0], r = G.players[1], now = Date.now(), cd = UI.coachDone = UI.coachDone || {};
  UI.coachT0 = UI.coachT0 || now;
  try {
    // the end: walk through the score with the real numbers, one chip per score card, then the "later" card
    if (G.phase === 'over' && G.over) {
      const t = UI.cards.length ? UI.cards[0] : null, s0 = G.over.scores[0], s1 = G.over.scores[1];
      if (t && t.kind === 'over-score' && !cd.score) { cd.score = 1; cd.rscore = 1; coachSay('score', 'You score ' + s0.total + ' and ' + r.name + ' scores ' + s1.total + '. Card points, tokens and events all count.', 9000); UI.tutLog.push('rscore'); window.GXCOACH.explained = UI.tutLog.slice(); }
      else if (t && t.kind === 'over' && !cd.end) { cd.end = 1; coachSay('end', G.over.winner === 0 ? 'The Oak bows to you, ' + s0.total + ' to ' + s1.total + '. A real game plays all four seasons.' : 'The Oak picks the higher total. A real game plays all four seasons.', 9000); setTimeout(coachLater, 2600); }
      return;
    }
    const ck = p.season * 100 + p.dep.length; if (ck > (UI.coachKey || 0)) { UI.coachActs = (UI.coachActs || 0) + 1; } UI.coachKey = ck;
    if ((UI.coachActs || 0) >= COACH_TALE && !p.passed && !UI.coachEnd && myTurnC()) { UI.coachEnd = 1; coachSay('tale', 'Nice first game! Let us pass here and count points. Real games run longer.', 4500); setTimeout(() => { try { const m = HB.moves(G, 0).find(x => x.type === 'pass'); if (m && G && !G.over) act(m); } catch (e) { console.warn('coach end', e); } }, 2400); return; }
    const fb = coachFeedback(p); if (fb) UI.fbQ = [{ t: fb, at: now }];   // the board snapshot always moves on; only the newest line waits, and only 8 s
    if (now < (UI.coachUntil || 0) + 400) return;   // one chip at a time
    for (const c of COACH) { if (cd[c.id] || !c.when(p, r)) continue; cd[c.id] = 1; coachSay(c.id, c.say(p, r)); UI.fbQ = []; return; }   // a rule to explain beats a move comment
    const q = UI.fbQ && UI.fbQ[0]; if (q && now - q.at < 8000) { UI.fbQ = []; coachChip(q.t, 5000); }
  } catch (e) { console.warn('coach', e); }
}
function coachLater() {
  if (document.querySelector('.hb-later')) return;
  const left = COACH.filter(c => !(UI.coachDone || {})[c.id]).concat(COACH_LATER);
  const d = document.createElement('div'); d.className = 'gxt-end hb-later'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Things you will meet later');
  const pro = !!UI.coachPro, first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  d.innerHTML = '<div class="gxt-endc" style="max-height:86vh;overflow:auto"><div class="gxt-et">Things you\'ll meet later</div><div class="gxt-ex"><ul style="text-align:left;margin:6px 0 10px 18px;padding:0;font-size:14px;line-height:1.35">' + left.map(c => '<li data-rule="' + c.id + '">' + c.later + '</li>').join('') + '</ul>' + HBS.end.text + '</div><div class="gxt-eb">' + (pro && first ? '<button type="button" class="gxt-b pri" data-later="chapter">Start chapter 1</button><button type="button" class="gxt-b" data-later="menu">Menu</button>' : '<button type="button" class="gxt-b pri" data-later="menu">Done</button>') + '</div></div>';
  d.addEventListener('click', e => { const b = e.target.closest('[data-later]'); if (!b) return; d.remove(); try { GXT.markDone(TUT_GAME); } catch (x) { } const c = b.dataset.later; tutLeave(); if (c === 'chapter' && first && typeof GXC !== 'undefined') GXC.play(first.id); else showStart(); });
  window.GXCOACH.running = false; window.GXCOACH.done = true; window.GXCOACH.later = left.map(c => c.id);
  UI.tutLog = UI.tutLog || []; UI.tutLog.push('later'); UI.laterList = left.map(c => c.id);
  document.body.appendChild(d);
}
// the chip never takes a tap (it must not cover a target); any tap on the board dismisses it after 2.5 s
document.addEventListener('pointerdown', () => { const e = document.getElementById('hbsay'); if (e && e.classList.contains('on') && Date.now() > (UI.coachRead || 0)) { e.classList.remove('on'); UI.coachUntil = 0; } }, true);
(function () { const o = render; render = function () { const r = o.apply(this, arguments); coachTick(); return r; }; })();
setInterval(() => { try { coachTick(); } catch (e) { } }, 800);
