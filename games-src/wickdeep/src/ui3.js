
// Wickdeep page, part 3: title, party, campaign map, briefing, results, hero sheet (cards, perks, shop), rules, tutorial coach, saves, boot.
var GKEY = 'wickdeep-game-v1';
function save() { try { if (G && !G.done && !UI.tut) localStorage.setItem(GKEY, JSON.stringify({ G: G, goals: UI.goals || null })); else localStorage.removeItem(GKEY); } catch (e) { } if (CAMP && !UI.tut) C.save(CAMP); }
function loadGame() { try { var s = localStorage.getItem(GKEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function showOnly(id) { ['start', 'camp', 'rs'].forEach(function (x) { $(x).hidden = x !== id; }); UI.mode = id || 'play'; document.documentElement.classList.toggle('gx-play', !id); if (!id) setTimeout(resize, 30); }
function btn(t, cls, fn, id) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (cls ? ' ' + cls : ''); b.textContent = t; if (id) b.id = id; b.addEventListener('click', fn); return b; }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

// ---------- title ----------
function showTitle() {
  var s = $('start'); s.innerHTML = '';
  s.appendChild(el('div', 'logo', 'WICKDEEP'));
  s.appendChild(el('p', 'sub', 'A co-op dungeon crawl by candlelight. Pick two cards, outsmart the dark.'));
  var row = el('div', 'heroes'); row.style.maxWidth = '300px'; row.style.gridTemplateColumns = 'repeat(4,1fr)';
  D.HERO_ORDER.forEach(function (h) { var d = el('div', 'hpick'); d.style.cursor = 'default'; d.appendChild(tileCanvas(D.HERO[h].tile)); row.appendChild(d); });
  s.appendChild(row);
  var m = el('div', 'menu'); m.style.marginTop = '16px';
  var saved = loadGame(), camp = C.load();
  m.appendChild(btn(saved ? 'Continue' : camp ? 'Play campaign' : 'Play', 'go', function () { quickPlay(); }, 'playbtn0'));
  m.appendChild(btn('Learn to play', '', function () { startTutorial(); }));
  m.appendChild(btn('New campaign', '', function () { showParty(); }));
  s.appendChild(m);
  s.appendChild(el('p', 'sub', '<br>1–4 heroes, you control them all.'));
  showOnly('start');
}
function quickPlay() {
  var saved = loadGame(); CAMP = C.load();
  if (saved && CAMP) { G = saved.G; UI.goals = saved.goals; UI.tut = false; enterBoard(); return; }
  if (!CAMP) { CAMP = C.newCamp(['warden', 'ringer'], 0); C.save(CAMP); showBrief(1); return; }
  showCamp();
}
function showParty() {
  var s = $('start'); s.innerHTML = ''; var pick = ['warden', 'ringer'];
  s.appendChild(el('div', 'logo', 'HEROES')); s.appendChild(el('p', 'sub', 'Pick 1 to 4. Two is a good start.'));
  var grid = el('div', 'heroes');
  function draw() {
    grid.innerHTML = '';
    D.HERO_ORDER.forEach(function (h) {
      var H = D.HERO[h], d = el('button', 'hpick' + (pick.indexOf(h) >= 0 ? ' on' : '')); d.type = 'button';
      d.appendChild(el('span', 'ck', '✓')); d.appendChild(tileCanvas(H.tile)); d.appendChild(el('b', '', esc(H.n))); d.appendChild(el('small', '', esc(H.role) + '<br>HP ' + H.hp[0] + ' · ' + H.hand + ' cards'));
      d.addEventListener('click', function () { var i = pick.indexOf(h); if (i >= 0) pick.splice(i, 1); else pick.push(h); draw(); go.disabled = !pick.length; });
      grid.appendChild(d);
    });
  }
  var go = btn('Start campaign', 'go', function () { CAMP = C.newCamp(D.HERO_ORDER.filter(function (h) { return pick.indexOf(h) >= 0; }), 0); C.save(CAMP); try { localStorage.removeItem(GKEY); } catch (e) { } showBrief(1); }, 'startcamp');
  draw(); s.appendChild(grid);
  var m = el('div', 'menu'); m.style.marginTop = '12px'; m.appendChild(go); m.appendChild(btn('Back', '', showTitle)); s.appendChild(m);
  showOnly('start');
}

// ---------- campaign ----------
function showCamp() {
  UI.tut = false;
  var s = $('camp'); s.innerHTML = '';
  var head = el('div', 'camphead'); head.appendChild(el('h2', '', 'The Wickdeep')); head.appendChild(btn('Menu', '', showTitle)); s.appendChild(head);
  var party = el('div', 'party');
  CAMP.party.forEach(function (h, i) {
    var H = D.HERO[h.cls], b = el('button', 'pm'); b.type = 'button';
    b.appendChild(tileCanvas(H.tile));
    var need = C.cardPending(h) || C.perksLeft(h) > 0;
    b.appendChild(el('div', '', '<b>' + esc(H.n) + (need ? '<span class="dot" title="Level up"></span>' : '') + '</b><small>Lv ' + C.lvl(h) + ' · ' + h.gold + 'g · ' + h.xp + 'xp</small>'));
    b.addEventListener('click', function () { showHero(i); });
    party.appendChild(b);
  });
  s.appendChild(party);
  var acts = ['Act I · The Cellars', 'Act II · The Drowned Abbey', 'Act III · The Saltmarsh', 'Act IV · The Unlit'];
  [1, 2, 3, 4].forEach(function (a) {
    s.appendChild(el('div', 'chap', acts[a - 1]));
    var g = el('div', 'nodes');
    D.SCEN_LIST.filter(function (sc) { return sc.act === a; }).forEach(function (sc) {
      var open = CAMP.unlocked.indexOf(sc.id) >= 0, done = !!CAMP.done[sc.id];
      var b = el('button', 'node' + (done ? ' done' : open ? ' open' : '') + (sc.boss ? ' boss' : '')); b.type = 'button';
      b.innerHTML = '<span class="no">' + sc.id + '</span><span>' + (open || done ? esc(sc.n) : '???') + (done ? ' ✓' : '') + '</span>';
      if (open || done) b.addEventListener('click', function () { showBrief(sc.id); }); else b.disabled = true;
      g.appendChild(b);
    });
    s.appendChild(g);
  });
  if (C.finished(CAMP)) s.appendChild(el('div', 'panel', '<h3>The light returns</h3><p>You beat the campaign. Replay any scenario.</p>'));
  showOnly('camp'); s.scrollTop = 0;
}
function monTypes(sc) { var t = {}; Object.keys(sc.legend).forEach(function (k) { var L = sc.legend[k]; if (L.m) t[L.m] = 1; if (L.boss) t[L.boss] = 1; }); return Object.keys(t); }
function showBrief(id) {
  var sc = D.SCEN[id], s = $('camp'); s.innerHTML = '';
  var head = el('div', 'camphead'); head.appendChild(el('h2', '', esc(sc.id + '. ' + sc.n))); head.appendChild(btn('Map', '', showCamp)); s.appendChild(head);
  var p = el('div', 'panel'); p.innerHTML = sc.intro.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '<h3 style="margin-top:10px">Goal</h3><p>' + esc(sc.goal.text) + '</p>';
  var ml = el('div', 'monlist');
  monTypes(sc).forEach(function (t) { var d = el('span', 'mon'); d.appendChild(tileCanvas(D.MON[t] ? D.MON[t].tile : D.BOSS[t].tile, D.BOSS[t] ? 'rgba(160,30,20,.25)' : '')); d.appendChild(document.createTextNode(D.MON[t] ? D.MON[t].n : D.BOSS[t].n)); ml.appendChild(d); });
  p.appendChild(el('h3', '', 'Foes')); p.appendChild(ml);
  s.appendChild(p);
  var pend = CAMP.party.some(function (h) { return C.cardPending(h) || D.HERO[h.cls].hand !== h.hand.length; });
  var m = el('div', 'menu'); m.style.marginTop = '10px';
  m.appendChild(btn(pend ? 'Level up your heroes first' : 'Enter', 'go', function () { if (pend) { showHero(CAMP.party.findIndex(function (h) { return C.cardPending(h) || D.HERO[h.cls].hand !== h.hand.length; })); return; } startScenario(id); }, 'enterbtn'));
  s.appendChild(m);
  // secret goals: each hero picks one of two
  var seed = (CAMP.history.length + 1) * 7 + id * 3;
  UI.goals = CAMP.party.map(function (h, i) { return C.goalsFor(seed + i * 5)[0]; });
  var gp = el('div', 'panel'); gp.appendChild(el('h3', '', 'Secret goals'));
  CAMP.party.forEach(function (h, i) {
    var opts = C.goalsFor(seed + i * 5), row = el('div', 'goalpick');
    row.appendChild(el('div', 'chip', esc(D.HERO[h.cls].n))); row.lastChild.style.width = '100%';
    opts.forEach(function (gid) { var b = btn(D.GOAL_BY[gid].text, UI.goals[i] === gid ? 'on' : '', function () { UI.goals[i] = gid; row.querySelectorAll('.btn').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); }); row.appendChild(b); });
    gp.appendChild(row);
  });
  gp.appendChild(el('p', '', '<small style="color:var(--dim)">Finish a goal and win: 1 check. 3 checks = a perk.</small>'));
  s.appendChild(gp);
  var lvls = CAMP.party.map(function (h) { return C.lvl(h); }), L = Math.max(0, Math.min(7, Math.ceil(lvls.reduce(function (a, b) { return a + b; }, 0) / lvls.length / 2) + CAMP.diff + (CAMP.party.length === 1 ? 1 : 0)));
  var dp = el('div', 'panel'); dp.appendChild(el('h3', '', 'Danger level ' + L));
  dp.appendChild(el('p', '', 'Traps ' + D.trapDmg(L) + ' · coins worth ' + D.goldPerCoin(L) + 'g · win bonus ' + D.bonusXp(L) + ' XP'));
  var dr = el('div', 'row'); [[-1, 'Easier'], [0, 'Normal'], [1, 'Harder']].forEach(function (x) { var b = btn(x[1], CAMP.diff === x[0] ? 'go' : '', function () { CAMP.diff = x[0]; C.save(CAMP); showBrief(id); }); dr.appendChild(b); });
  dp.appendChild(dr); s.appendChild(dp);
  showOnly('camp'); s.scrollTop = 0;
}
function startScenario(id, o) {
  o = o || {};
  var party = o.party || C.partyFor(CAMP, UI.goals);
  G = E.newScenario(id, party, { seed: o.seed || ((Date.now() / 1000) | 0), diff: o.tut ? 0 : CAMP.diff, tut: !!o.tut });
  UI.sel = {}; UI.tab = 0; UI.log = []; UI.pick = null; UI.view = null;
  enterBoard();
}
function enterBoard() {
  showOnly(null); CAM.fit = true;
  setTimeout(function () { resize(); fitCam(true); refresh(); }, 40);
  save();
}

// ---------- results ----------
function showResult() {
  if (!G || !G.done || UI.mode === 'rs') return;
  var won = G.done.won, s = $('rs'); s.innerHTML = '';
  sfx(won ? 'win' : 'die');
  s.appendChild(el('div', 'rshead ' + (won ? 'win' : 'lose'), won ? 'VICTORY' : 'DEFEAT'));
  var sc = D.SCEN[G.sc];
  s.appendChild(el('p', 'sub', esc(won ? sc.outro : 'The dark wins this time. Keep your XP and gold, and try again.')));
  var p = el('div', 'panel');
  if (UI.tut) {
    p.innerHTML = '<p>' + (won ? 'You know the basics now.' : 'Close! You know the basics now.') + '</p><p>Start a campaign to level up, earn perks and buy gear.</p>';
    s.appendChild(p);
    var m0 = el('div', 'menu'); m0.style.marginTop = '12px';
    m0.appendChild(btn('Start campaign', 'go', function () { UI.tut = false; G = null; showParty(); }, 'rsnext'));
    m0.appendChild(btn('Title', '', function () { UI.tut = false; G = null; showTitle(); }));
    s.appendChild(m0); showOnly('rs'); return;
  }
  var sum = C.result(CAMP, G.sc, G.done); C.save(CAMP); try { localStorage.removeItem(GKEY); } catch (e) { }
  sum.heroes.forEach(function (h) {
    var r = el('div', 'rsrow'); r.appendChild(tileCanvas(D.HERO[h.cls].tile));
    r.appendChild(el('div', '', '<b>' + esc(D.HERO[h.cls].n) + '</b> +' + h.xp + ' XP · +' + h.gold + ' gold' + (h.goal ? '<br><small>Goal ' + esc(h.goal) + ': ' + (h.gotGoal ? '✓ check' : '✗') + '</small>' : '') + (h.lvlUp ? '<br><span class="lvup">LEVEL ' + h.lvl + '!</span>' : '')));
    p.appendChild(r);
  });
  if (sum.items.length) p.appendChild(el('p', '', 'Found: ' + sum.items.map(function (i) { return esc(D.ITEM_BY[i].n); }).join(', ')));
  if (sum.unlocked.length) p.appendChild(el('p', '', 'New: ' + sum.unlocked.map(function (u) { return esc(D.SCEN[u].n); }).join(', ')));
  if (sum.shop.length) p.appendChild(el('p', '', 'Shop gets: ' + sum.shop.map(function (i) { return esc(D.ITEM_BY[i].n); }).join(', ')));
  s.appendChild(p);
  var id = G.sc, m = el('div', 'menu'); m.style.marginTop = '12px';
  m.appendChild(btn('Continue', 'go', function () { G = null; showCamp(); }, 'rsnext'));
  if (!won) m.appendChild(btn('Try again', '', function () { G = null; showBrief(id); }));
  s.appendChild(m);
  showOnly('rs');
}

// ---------- hero sheet: new cards, perks, hand, shop ----------
function showHero(i) {
  var h = CAMP.party[i], H = D.HERO[h.cls], s = $('camp'); s.innerHTML = '';
  var head = el('div', 'camphead'); head.appendChild(el('h2', '', esc(H.n) + ' · Lv ' + C.lvl(h))); head.appendChild(btn('Map', '', showCamp)); s.appendChild(head);
  var L = C.lvl(h), next = D.XP_LEVEL[L] || null;
  s.appendChild(el('div', 'panel', '<p>' + esc(H.blurb) + '</p><p>HP ' + H.hp[L - 1] + ' · ' + H.hand + ' cards · ' + h.gold + ' gold · XP ' + h.xp + (next ? ' / ' + next : '') + ' · checks ' + h.checks + '</p>'));
  if (C.cardPending(h)) {
    var p = el('div', 'panel'); p.appendChild(el('h3', '', 'Level up: take a new card'));
    var g = el('div', 'cardgrid');
    C.levelChoices(h).forEach(function (c) { var e = cardEl(c); e.addEventListener('click', function () { var out = C.pickCard(h, c); C.save(CAMP); toast(D.CARD[c].n + ' in, ' + (out ? D.CARD[out].n + ' out' : '')); showHero(i); }); g.appendChild(e); });
    p.appendChild(g); s.appendChild(p);
  }
  var pl = C.perksLeft(h);
  var pp = el('div', 'panel'); pp.appendChild(el('h3', '', 'Perks' + (pl ? ' · ' + pl + ' to take' : '')));
  H.perks.forEach(function (pk, j) {
    var r = el('div', 'perk'), has = h.perks.indexOf(j) >= 0;
    r.appendChild(el('span', '', (has ? '✓ ' : '') + esc(pk.text)));
    if (!has && pl > 0) r.appendChild(btn('Take', 'go', function () { C.takePerk(h, j); C.save(CAMP); showHero(i); }));
    pp.appendChild(r);
  });
  s.appendChild(pp);
  var hp = el('div', 'panel'); hp.appendChild(el('h3', '', 'Hand ' + h.hand.length + '/' + H.hand + ' · tap to swap'));
  var hg = el('div', 'cardgrid');
  C.pool(h).forEach(function (c) { var e = cardEl(c, { sel: h.hand.indexOf(c) >= 0, dim: h.hand.indexOf(c) < 0 }); e.addEventListener('click', function () { C.toggleHand(h, c); C.save(CAMP); showHero(i); }); hg.appendChild(e); });
  hp.appendChild(hg); s.appendChild(hp);
  var sp = el('div', 'panel'); sp.appendChild(el('h3', '', 'Shop · ' + h.gold + ' gold'));
  h.items.forEach(function (id) { var it = D.ITEM_BY[id], r = el('div', 'shopit'); r.appendChild(el('div', '', '<b>' + esc(it.n) + '</b> <small>' + it.slot + '</small><br><small>' + esc(it.text) + ' · ' + it.use + '</small>')); r.appendChild(btn('Sell ' + Math.floor(it.cost / 2), '', function () { C.sell(CAMP, h, id); C.save(CAMP); showHero(i); })); sp.appendChild(r); });
  CAMP.shop.filter(function (id) { return h.items.indexOf(id) < 0; }).forEach(function (id) {
    var it = D.ITEM_BY[id], why = C.canBuy(CAMP, h, id), r = el('div', 'shopit');
    r.appendChild(el('div', '', '<b>' + esc(it.n) + '</b> <small>' + it.slot + (it.use === 'lost' ? ' · once' : '') + '</small><br><small>' + esc(it.text) + '</small>'));
    var b = btn(it.cost + 'g', why ? '' : 'go', function () { var w = C.buy(CAMP, h, id); if (w) toast(w); C.save(CAMP); showHero(i); }); if (why) { b.disabled = true; b.title = why; } r.appendChild(b); sp.appendChild(r);
  });
  s.appendChild(sp);
  showOnly('camp'); s.scrollTop = 0;
}

// ---------- tutorial ----------
function startTutorial() {
  UI.tut = true; UI.seen = {}; UI.goals = null;
  CAMP = CAMP || C.load();
  startScenario(1, { tut: true, seed: 4242, party: [{ cls: 'warden', lvl: 1 }, { cls: 'ringer', lvl: 1 }] });
}
function nextLesson() {
  var A = G.ask, S = UI.seen = UI.seen || {}, heroes = E.liveHeroes(G), h = heroes[UI.tab] || heroes[0];
  var L = function (k, t, x) { return S[k] ? null : { k: k, t: t, h: '<p>' + x + '</p>' }; };
  if (A.h === 'sel') {
    if (G.round > 1 && h && h.disc.length >= 2 && h.hand.length <= 6) { var r = L('rest', 'Resting', 'Played cards wait in your played pile. <b>Rest</b> takes your turn: you lose one played card for good, take the rest back and heal 2. A short rest after a round does the same, losing a random card.'); if (r) return r; }
    if (h && (UI.sel[h.id] || []).length === 2) { var i = L('init', 'Initiative', 'The small number in a card corner is its <b>initiative</b>. You act at the lower of your two numbers. Lowest goes first; monsters have numbers too (top left bar).'); if (i) return i; }
    return L('cards', 'Two cards', 'Each round you secretly choose <b>2 cards</b> from your hand. Tap two cards, then Ready.');
  }
  if (A.h === 'first') return L('halves', 'Top and bottom', 'Every card has a <b>top half</b> and a <b>bottom half</b>. On your turn play the top of one card and the bottom of the other, in either order.');
  if (A.h === 'second') { var lo = L('lost', 'Lost or played', 'A half marked <b>LOST</b> removes its card from the scenario for good. Other cards go to your played pile and come back when you rest.'); if (lo) return lo; }
  if (A.h === 'target') { var m = L('mods', 'Luck card', 'Each attack flips a <b>modifier card</b>: +1, −1, ×2 or MISS. It changes the damage, so a hit is never sure.'); if (m) return m; }
  var any = function (fn) { return heroes.concat(G.figs.filter(function (f) { return f.team === 'm' && f.hp > 0; })).some(fn); };
  if (E.EL.some(function (e) { return G.el[e] > 0; })) { var e = L('elem', 'Elements', 'The icons at the top are <b>elements</b>. Some halves charge one; another half can spend it for a bonus. They fade after a round or two.'); if (e) return e; }
  if (any(function (f) { return Object.keys(f.cond || {}).some(function (k) { return f.cond[k] && (D.COND_NAME[k] || k === 'imm'); }); })) { var c = L('cond', 'Conditions', 'A figure with a status like Poison, Stuck or Stun is marked. Tap any figure to read what it does.'); if (c) return c; }
  return null;
}
function coachLine() {
  if (!G || !G.ask) return '';
  var A = G.ask, f = curFig();
  switch (A.h) {
    case 'sel': { var heroes = E.liveHeroes(G), h = heroes[UI.tab] || heroes[0], n = (UI.sel[h.id] || []).length; if (G.round > 2 && h.disc.length >= 2 && h.hand.length <= 3) return 'Low on cards? Rest to get them back.'; return n === 0 ? 'Pick 2 cards. The small number sets who goes first.' : n === 1 ? 'Pick one more card.' : 'Tap Ready.'; }
    case 'first': return UI.pick ? 'Tap Play. The other card gives the other half.' : 'Use the top of one card, the bottom of the other.';
    case 'second': return UI.pick ? 'Tap Play.' : 'Now the other half of the other card.';
    case 'move': return 'Tap a lit hex to walk there.';
    case 'target': return 'Tap a red foe. A flipped card adds luck.';
    case 'srest': return 'Rest: lose 1 random played card, get the rest back.';
    case 'lrest': return 'Pick a card to lose. Resting heals 2.';
    case 'block': return 'Lose a card to ignore this hit, or take it.';
  }
  return '';
}

// ---------- drawers: log, rules, reference ----------
function rulesHTML() {
  return '<h4>Goal</h4><p>Work together to finish the scenario goal (top right). If every hero is out, you lose.</p>' +
    '<h4>Each round</h4><p>1. Every hero picks 2 cards from their hand (or rests).</p><p>2. Each monster type flips an ability card.</p><p>3. Everyone acts from the lowest number (initiative) up. A hero uses its lower card\'s number.</p>' +
    '<h4>Your turn</h4><p>Play the <b>top half</b> of one card and the <b>bottom half</b> of the other, in either order. Any top can be "Hit 2", any bottom "Move 2".</p><p>Played cards go to your played pile. Cards marked LOST are gone for the scenario.</p>' +
    '<h4>Resting</h4><p>Short rest (end of round): lose one random played card, take the rest back. You may swap the card once for 1 damage.</p><p>Long rest (instead of cards, number 99): pick a card to lose, heal 2, refresh used items.</p><p>If you cannot play 2 cards or rest, you are out. You can lose a card from your hand (or 2 played cards) to ignore a hit that would knock you out.</p>' +
    '<h4>Attacks</h4><p>Every attack flips a card from that side\'s modifier deck: +0, ±1, ±2, ×2 or MISS. ×2 and MISS reshuffle the deck at round end. Shields lower damage. Strong and similar effects flip two cards and keep the better; Muddle keeps the worse. A ranged attack against a foe next to you keeps the worse.</p>' +
    '<h4>Elements</h4><p>Some halves make an element strong (Fire, Frost, Wind, Earth, Light, Dark). It fades each round. Other halves use it up for a bonus.</p>' +
    '<h4>Conditions</h4>' + Object.keys(D.COND_NAME).map(function (c) { return '<p><b>' + D.COND_NAME[c] + '</b>: ' + esc(D.COND_TIP[c]) + '</p>'; }).join('') +
    '<h4>Monsters</h4><p>Monsters pick the foe they can reach with the least movement (ties: closest, then lowest number). Elites have gold rings. Tap any monster to see its numbers and this round\'s card.</p>' +
    '<h4>Map</h4><p>Doors open when you step in, revealing the next room. Traps hurt once; brine hurts each time; rubble costs 2 moves. Coins are picked up at the end of your turn.</p>' +
    '<h4>Campaign</h4><p>Win to unlock new scenarios. XP levels you up: a new card and a perk each level. Gold buys gear. Secret goals give checks; 3 checks = a perk.</p>';
}
function refHTML() {
  var L = G ? G.L : 1, h = '<h4>Monsters at danger ' + L + ' (normal / elite)</h4>';
  Object.keys(D.MON).forEach(function (t) { var n = D.monStats(t, L, false), e = D.monStats(t, L, true), m = D.MON[t]; h += '<p><b>' + esc(m.n) + '</b>: HP ' + n.hp + '/' + e.hp + ' · Move ' + n.mv + ' · Hit ' + n.atk + '/' + e.atk + (n.rng ? ' · Range ' + n.rng : '') + (n.shd || e.shd ? ' · Shield ' + n.shd + '/' + e.shd : '') + (n.ret ? ' · Hits back ' + n.ret + '/' + e.ret : '') + (m.fly ? ' · flies' : '') + (m.poi ? ' · poison' : '') + '</p>'; });
  h += '<h4>Bosses</h4>'; Object.keys(D.BOSS).forEach(function (b) { var x = D.BOSS[b]; h += '<p><b>' + esc(x.n) + '</b>: ' + esc(x.tip) + ' Specials: ' + x.sp.map(function (s) { return esc(s.text); }).join('; ') + '</p>'; });
  h += '<h4>Modifier deck (20 cards)</h4><p>6× +0, 5× +1, 5× −1, 1× +2, 1× −2, 1× ×2, 1× MISS. Perks change your own deck.</p>';
  h += '<h4>Items</h4>' + D.ITEM.map(function (i) { return '<p><b>' + esc(i.n) + '</b> (' + i.slot + ', ' + i.cost + 'g, ' + i.use + '): ' + esc(i.text) + '</p>'; }).join('');
  return h;
}
function logHTML() { return (UI.log || []).slice(-120).reverse().map(function (l) { return '<div class="logl">' + esc(l) + '</div>'; }).join('') || '<p>Nothing yet.</p>'; }
function initDrawers() {
  GX.drawer('logd', 'Log', el('div', '', ''));
  GX.drawer('rulesd', 'How to play', el('div', '', rulesHTML()), true);
  GX.drawer('refd', 'Monsters and items', el('div', '', ''), true);
  var prev = GX.onShow;
  GX.onShow = function (id) { if (prev) try { prev(id); } catch (e) { } if (id === 'logd') $('logd').querySelector('.gx-drawer-body').innerHTML = logHTML(); if (id === 'refd') $('refd').querySelector('.gx-drawer-body').innerHTML = refHTML(); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { S.appendChild(GX.row('This game', [btn('Campaign map', '', function () { GX.close(); save(); if (UI.tut) showTitle(); else showCamp(); }), btn('Restart', '', function () { GX.close(); if (G) { var id = G.sc; if (UI.tut) startTutorial(); else startScenario(id); } }), btn('Title', '', function () { GX.close(); save(); showTitle(); })])); },
      help: function (S) { S.appendChild(GX.row('Read', [btn('Rules', '', function () { GX.show('rulesd'); }), btn('Monsters & items', '', function () { GX.show('refd'); }), btn('Learn to play', '', function () { GX.close(); startTutorial(); })])); },
      about: { name: 'Wickdeep', version: '1.0', text: 'Art: Tiny Dungeon by Kenney (CC0). Effects: Sprite Fusion pixel VFX (MIT). Font: Silkscreen (OFL).' } });
  } catch (e) { }
}
$('goalchip') && $('goalchip').addEventListener('click', function () { if (!G) return; var sc = D.SCEN[G.sc]; showInsp('Goal', '<p>' + esc(sc.goal.text) + '</p><p>' + esc(goalLine()) + ' · Round ' + G.round + '</p>' + sc.intro.map(function (l) { return '<p style="color:var(--dim)">' + esc(l) + '</p>'; }).join('')); });
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-el]'); if (!b || !G) return; var x = b.dataset.el, s = G.el[x]; showInsp(D.EL_NAME[x], '<p>' + (s === 2 ? 'Strong: can be used this round and next.' : s === 1 ? 'Fading: last round to use it.' : 'Not active. Cards with “+' + D.EL_NAME[x] + '” make it strong.') + '</p>'); });

// ---------- boot ----------
(function boot() {
  try { GX.init({ key: 'wd' }); } catch (e) { }
  CV = $('cv'); CX = CV.getContext('2d');
  initBoardInput(); initDrawers();
  try { GX.onResize(function () { resize(); }); } catch (e) { }
  window.addEventListener('resize', resize);
  try { if (GX.onPref) GX.onPref(function (k) { if (k === 'anim' || k === 'reduce') ANIM = GX.animMs(100) > 0; }); ANIM = GX.animMs(100) > 0; } catch (e) { }
  CAMP = C.load();
  resize();
  if (!(window.GXS && GXS.on)) showTitle();
})();
// test hooks
window.WDUI = { doMove: doMove, refresh: refresh, startScenario: startScenario, showTitle: showTitle, showCamp: showCamp, quickPlay: quickPlay, startTutorial: startTutorial, get G() { return G; } };
