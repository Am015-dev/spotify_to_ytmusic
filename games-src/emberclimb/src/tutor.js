// Emberclimb coached first climb (the tutorial, W494). A guided first fight + the first map screen teach every core rule in order (one
// line of 12 words or fewer, one highlighted tap per step, src steps() below); then the kit stops, the REAL short climb goes on and the coach speaks just in time: the first time a rule matters, after a
// good or poor play, never blocking input (one dismissable line at a time). The end walks through the real numbers and ticks off the rules you used;
// hero-only rules show once in a real game the first time they happen (tips()). Text: src/story.js (EC_STORY.coach). Rule keys = TUTORIAL-COVERAGE.md.
(function () {
  var E = EC.E, D = EC.D, ST = window.EC_STORY || {}, CO = ST.coach || { rules: {}, good: {}, poor: {}, end: {} };
  function g() { return E.G(); }
  function $(s) { return document.querySelector(s); }
  function handIdx(id) { var G = g(); if (!G || !G.b) return -1; var hd = G.hs[0].hand; for (var i = 0; i < hd.length; i++) if (hd[i].id === id) return i; return -1; }
  function cardEl(id) { var i = handIdx(id); return i < 0 ? null : $('.hand .card[data-c="' + i + '"]'); }
  function battleP() { var G = g(); return !!(G && G.scr === 'battle' && G.b && G.b.ph === 'p' && !UI.busy); }
  var C = UI.coach = { on: false, seen: {}, q: [], last: {} };
  // ---- speech card: portrait + one line; tap it to dismiss; sits at the top, away from the hand and End turn
  UI.say = function (text, ms, who) {
    var old = $('.ec-say'); if (!text) { if (old) old.remove(); return null; }
    // one message at a time: a bubble that has not been on screen long enough is never replaced; the new line waits its turn
    var tw = document.querySelector('.toast');   // a toast still being read is never removed: the bubble waits (R1: relic toast cut after 250 ms)
    if ((old && Date.now() < (+old.getAttribute('data-until') || 0)) || (tw && Date.now() < (+tw.getAttribute('data-until') || 0))) { C.q.unshift({ key: 'say', text: text, ms: ms }); return null; }
    if (old) old.remove(); if (tw) tw.remove();
    var c = (ST.cast || {})[who || 'guide'] || { name: 'Warden Ashgrove', emoji: '🔥', color: '#a8431f' }, d = document.createElement('div'); d.className = 'ec-say'; d.setAttribute('role', 'status');
    var pic = window.EC_A ? EC_A('cast-' + (who || 'guide'), c.emoji || '', { kind: 'portrait', ph: c.color || '#a8431f' }) : document.createElement('div'); d.appendChild(pic);
    var t = document.createElement('div'), b = document.createElement('b'), sp = document.createElement('span'); b.textContent = c.name; sp.textContent = text; t.appendChild(b); t.appendChild(sp); d.appendChild(t);
    d.addEventListener('click', function (e) { e.stopPropagation(); d.remove(); });
    var dur = UI.readMs ? UI.readMs(text, ms) : (ms || 5200); d.setAttribute('data-until', String(Date.now() + dur)); document.body.appendChild(d); setTimeout(function () { if (d.parentNode) d.remove(); }, dur); return sp;
  };
  function speak(key, text, ms) { if (!text) return; C.q.push({ key: key, text: text, ms: ms }); pump(); }
  function pump() { if ($('.ec-say') || !C.q.length) return; var it = C.q.shift(); UI.say(it.text, it.ms); var b = $('.ec-say'); if (b) b.setAttribute('data-k', it.key || ''); }
  // R7: a fight reaction ("Fully blocked") never follows you to the next screen: drop it from the queue and the screen when the screen changes
  function scrChange() { var G = g(); if (!G || C.lastScr === G.scr) return; C.lastScr = G.scr; C.q = C.q.filter(function (it) { return !/^(good|poor):/.test(it.key || ''); }); var b = $('.ec-say'); if (b && /^(good|poor):/.test(b.getAttribute('data-k') || '')) b.remove(); }
  setInterval(function () { if (C.on) { scrChange(); pump(); tick(); } else { try { tips(); } catch (e) { } } }, 400);
  function rule(k) { if (!C.on || C.seen[k] || !CO.rules[k]) return; C.seen[k] = 1; speak(k, CO.rules[k]); }
  UI.coachRule = rule;
  // R7: also check on every render, so a room left quickly (the campfire) still gets its line
  var r0 = UI.render; UI.render = function () { var out = r0.apply(this, arguments); if (C.on) { try { tick(); } catch (e) { } } return out; };
  // the rules the coached climb teaches (Warrior); hero-only tricks (Shivs, Orbs, stances, Scry, Retain), two-hero rules, Frail (act 2) and
  // multi-act climbs are shown once, the first time they happen in a real game (tips below), never as a list
  var CORE = ['intent', 'energy', 'vuln', 'block', 'endturn', 'strength', 'power', 'weak', 'exhaust', 'poison', 'potion', 'reward', 'gold', 'map',
    'event', 'die', 'relic', 'rest', 'shop', 'elite', 'target', 'junk', 'piles', 'preview', 'boss', 'split', 'lose'];
  window.EC_TUT_CORE = CORE;
  var TIPS = ['shiv', 'orbs', 'stance', 'scry', 'retain', 'frail', 'laststand', 'acts', 'split', 'die', 'junk', 'target'];
  function tipSeen(k) { try { return localStorage.getItem('ec-tip-' + k) === '1'; } catch (e) { return true; } }
  function tip(k) { if (tipSeen(k) || !CO.rules[k] || $('.ec-say') || $('.gxt-bub')) return; try { localStorage.setItem('ec-tip-' + k, '1'); } catch (e) { } UI.say(CO.rules[k], 5200); }
  function tips() {
    var G = g(); if (!G || UI.mode !== 'game' || window.EC_NOSAVE || /[?&]scn=/.test(location.search)) return;
    if (G.scr === 'map' && (G.acts || 1) > 1) tip('acts');
    if (G.scr !== 'battle' || !G.b || G.b.ph !== 'p' || UI.busy) return;
    var hs = G.hs.filter(function (x) { return !x.dead; }), al = G.b.en.filter(function (e) { return !e.dead; });
    hs.forEach(function (h) {
      if (h.k === 's' && h.hand.concat(h.draw, h.disc).some(function (c) { return c.id === 'shiv' || /shiv/i.test(JSON.stringify(E.eff(c).ops || [])); })) tip('shiv');
      if (h.k === 'a') tip('orbs'); if (h.k === 'm') tip('stance');
      if (h.hand.some(function (c) { return /scry/.test(JSON.stringify(E.eff(c).ops || [])); })) tip('scry');
      if (h.hand.some(function (c) { return (E.eff(c).fl || '').indexOf('t') >= 0; })) tip('retain');
      if (h.st.frail > 0) tip('frail'); if (h.hand.some(function (c) { return c.id === 'dazed'; })) tip('junk');
      if (h.hand.some(function (c) { return (E.eff(c).ops || []).some(function (o) { return o[0] === 'roll'; }); })) tip('die');
    });
    if (al.length > hs.length) tip('target'); if (G.b.kind === 'b' && G.hs.length > 1 && G.lastStand) tip('laststand');
    if (G.b.en.some(function (e) { return e.spawn; })) tip('split');
  }

  // ---- triggers: each rule fires once, the first time it matters
  function tick() {
    var G = g(); if (!G || UI.mode !== 'game') return;
    if (G.scr === 'map') rule('map');
    if (G.scr === 'reward') { rule('reward'); if (G.rw && G.rw.relics && G.rw.relics.length) rule('relic'); }
    if (G.gold > 110) rule('gold');
    if (G.scr === 'rest') rule('rest'); if (G.scr === 'shop') rule('shop'); if (G.scr === 'event') rule('event');
    if (G.relics.length > 1) rule('relic');
    if (G.scr === 'over') return finale();
    if (G.scr !== 'battle' || !G.b) return;
    var b = G.b, h = G.hs[0], al = b.en.filter(function (e) { return !e.dead; });
    if (b.kind === 'e' && !C.elitePrep && b.turn <= 1) {   // the coached elite opens with its Dazed step (a real step of its own pattern)
      C.elitePrep = 1; var w = b.en[0], pt = (D.ENEMIES[w.id] || {}).pat || []; pt.forEach(function (st, k) { if (st.add && w.i !== k) { w.i = k; w.intent = JSON.parse(JSON.stringify(st)); w.intent.tg = 0; } }); UI.render();
    }
    if (b.kind === 'e') rule('elite'); if (b.kind === 'b') rule('boss'); if (b.en.some(function (e) { return e.spawn || (e.dead && e.splitSaid); })) rule('split');
    if (b.ph === 'p' && !UI.busy) {
      rule('energy');
      if (al.length > 1) rule('target');
      if (al.some(function (e) { return e.intent && e.intent.atk; }) && h.hand.some(function (c) { return (E.eff(c).ops || []).some(function (o) { return o[0] === 'blk'; }); })) rule('block');
      if (h.hand.some(function (c) { return E.eff(c).type === 'P'; })) rule('power');
      if (h.hand.some(function (c) { return E.eff(c).fl.indexOf('x') >= 0; })) rule('exhaust');
      if (h.hand.some(function (c) { return (E.eff(c).ops || []).some(function (o) { return o[0] === 'roll'; }); })) rule('die');
      if (h.hand.concat(h.disc).some(function (c) { return c.id === 'dazed'; })) rule('junk');
      if (G.pots.some(Boolean)) rule('potion');
      var ok = h.hand.some(function (c) { return E.canPlay(h, c) && (E.cost(h, c) <= h.en || E.eff(c).cost === 'X'); }); if (!ok && h.hand.length) rule('endturn');
      if (b.turn >= 2 && C.lastDraw >= 0 && h.draw.length > C.lastDraw) rule('piles'); C.lastDraw = h.draw.length;
    }
    if (al.some(function (e) { return e.st.vuln > 0; })) rule('vuln');
    if (al.some(function (e) { return e.st.weak > 0; }) || h.st.weak > 0) rule('weak');
    if (h.st.frail > 0) rule('frail'); if (UI.sel >= 0 && C.seen.energy) rule('preview');
    if (al.some(function (e) { return e.st.poison > 0; })) rule('poison');
    if (h.st.str > 0) rule('strength');
    if (h.hp < h.mhp * 0.5) rule('lose');
  }
  // ---- reactions to good / poor plays (ui.js calls this after a card and after the enemy turn)
  UI.coachReact = function (kind, info) {
    if (!C.on) return; var k = kind + ':' + info; if (C.last[k] && Date.now() - C.last[k] < 60000) return; C.last[k] = Date.now();
    var t = (kind === 'good' ? CO.good : CO.poor)[info]; if (t) speak(k, t, 3200);
  };
  // ---- finale: the real numbers, then the end card with the rules that did not come up
  function finale() {
    if (C.done) return; C.done = 1; var G = g(), h = G.hs[0];
    var lines = [(G.won ? 'Climb won! ' : 'The climb ends here. ') + 'Floors climbed: ' + (G.floor || 0) + ' of ' + ((G.F || 5) + 1) + '.', 'HP left: ' + Math.max(0, h.hp) + ' of ' + h.mhp + '. Gold: ' + G.gold + '. Deck: ' + h.deck.length + ' cards. Relics: ' + G.relics.length + '.'];
    C.q = []; var at = 0; lines.forEach(function (l) { setTimeout(function () { UI.say(l); }, at); at += (UI.readMs ? UI.readMs(l) : 4000) + 300; });   // each line stays long enough to read
    setTimeout(endCard, at + 200);
  }
  function endCard() {
    var o = document.createElement('div'); o.className = 'ec-endcard'; o.setAttribute('role', 'dialog');
    var c = document.createElement('div'); c.className = 'ec-endc'; o.appendChild(c);
    var add = function (tag, txt) { var e = document.createElement(tag); e.textContent = txt; c.appendChild(e); return e; };
    add('h2', CO.end.title || 'You climbed the tower');
    // what you did, as a checklist (no counts, no "later" list): each line is a rule you used on this climb
    add('h3', CO.end.did || 'What you did on this climb');
    var ul = add('ul', ''); ul.className = 'ec-did';
    CORE.forEach(function (k) { if (!C.seen[k] || !CO.rules[k]) return; var li = document.createElement('li'); li.textContent = '\u2713 ' + CO.rules[k]; li.setAttribute('data-rule', k); ul.appendChild(li); });
    add('p', CO.end.heroes || 'Each other hero brings one new trick. Its first fight shows it.');
    var row = document.createElement('div'); row.className = 'ec-endrow';
    var b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'btn'; b1.id = 'coach-play'; b1.textContent = CO.end.play || 'Play a real game';
    var b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'btn alt'; b2.id = 'coach-title'; b2.textContent = CO.end.title2 || 'Title';
    b1.addEventListener('click', function () { o.remove(); finish(true); }); b2.addEventListener('click', function () { o.remove(); finish(false); });
    row.appendChild(b1); row.appendChild(b2); c.appendChild(row); document.body.appendChild(o);
  }
  // ---- the climb: Warrior, fixed seed, a small branching map so paths are real choices; foes 75% HP
  // every room type is on the path: one real choice on floor 2 (fight or ? event), then treasure, campfire, shop, elite (two foes: targets +
  // Dazed), and the boss that splits into slimes when it falls. One foe per hero in normal fights (tabletop).
  var MAP = [[1, 'm'], [2, 'm'], [2, 'v'], [3, 't'], [4, 'r'], [5, 's'], [6, 'e'], [7, 'b']];
  function stage() {
    window.EC_NOSAVE = 1; E.newGame({ heroes: ['w'], seed: 7, floors: 6, hpPct: 75, boss: 'mire-behemoth' });
    var G = g(), cols = { 1: [1.5], 2: [0.8, 2.2], 3: [1.5], 4: [1.5], 5: [1.5], 6: [1.5], 7: [1.5] }, used = {};
    G.map = MAP.map(function (m, i) { var k = used[m[0]] || 0; used[m[0]] = k + 1; return { id: i, f: m[0], c: cols[m[0]][k], t: m[1], nx: [] }; });
    G.map.forEach(function (n) { G.map.forEach(function (o) { if (o.f === n.f + 1) n.nx.push(o.id); }); }); G.F = 6; G.pots = ['venom-vial']; G.boss = 'mire-behemoth';
    G.tutEnc = { 2: ['rust-tick'], 6: ['iron-warden', 'iron-warden'], 7: ['mire-behemoth'] }; G.tutHp = { 6: 55, 7: 40 };
    E.performMove({ t: 'go', n: 0 }); G = g();
    // guided first fight: one slug with a fixed pattern (bite 5, then bite 3 + Weak), sized so it falls to the second Strike of turn 2
    var e = G.b.en[0]; G.b.en = [e]; e.id = 'mire-slug'; e.hp = e.mhp = 36; e.blk = 0; e.st = {}; e.i = 0; e.intent = { atk: 5, tg: 0 };
    var h = G.hs[0], mk = E.mk; h.hand = [mk('w-hammer'), mk('w-defend'), mk('w-strike'), mk('w-strike'), mk('w-defend')]; h.en = 3; h.blk = 0;
    h.draw = [mk('w-strike'), mk('w-defend'), mk('w-strike'), mk('w-roar'), mk('w-kindle')]; h.disc = [];
    h.deck.push(mk('w-cleave'), mk('w-wild-swing'));   // a hit-all attack and a die card, so both rules come up by playing them
    C.on = false; C.seen = {}; C.q = []; C.done = 0; C.elitePrep = 0; C.lastDraw = -1; C.later = null;
    UI.mode = 'game'; UI.sel = -1; UI.ov = null; UI.render();
  }
  function scr(s) { return function () { var G = g(); return !!(G && G.scr === s && !UI.busy); }; }
  function turn2() { var G = g(); return battleP() && G.b.turn >= 2; }
  function node(t) { return function () { return $('#map .node.t-' + t); }; }
  function goldEl() { var xs = document.querySelectorAll('.reward .chip'); for (var i = 0; i < xs.length; i++) if (/gold/.test(xs[i].textContent)) return xs[i]; return null; }
  // Every core rule in order, one line of 12 words or fewer, one highlighted tap each. ids = the rule keys tools/tut-walk.js checks.
  var RULES = ['intent', 'energy', 'vuln', 'block', 'endturn', 'pattern', 'strength', 'exhaust', 'potion', 'finish', 'reward', 'leave', 'map', 'go'];   // G3 r2: mostly doing steps, 4 Next-only lines
  function steps() {
    var tap = function (id, n) { return { type: 'tap', times: n || 2, match: function (a) { return a.w === 'card' && a.id === id; } }; };
    var info = function (id, target, say, ready, side) { return { id: id, title: 'Warden Ashgrove', target: target, say: say, wait: null, ready: ready || battleP, side: side }; };
    var en = function () { return $('.en'); }, intent = function () { return $('.en .intent') || $('.en'); };
    return [
      info('intent', intent, 'Goal: beat the boss on top. This icon is its next move.'),
      info('energy', function () { return $('.energy') || $('#end'); }, 'Each turn: 3 energy and 5 new cards. Cards cost energy.'),
      { id: 'vuln', title: 'Attack', target: function () { return cardEl('w-hammer'); }, say: 'Tap Anvil Blow twice. Vulnerable: it takes double damage.', wait: tap('w-hammer'), ready: battleP },
      { id: 'block', title: 'Block', target: function () { return cardEl('w-defend'); }, say: 'Tap Plate Guard twice. Block soaks hits, this turn only.', wait: tap('w-defend'), ready: battleP },
      { id: 'endturn', title: 'End turn', target: function () { return $('#end'); }, endOk: 1, onEnter: function () { setTimeout(function () { UI.render(); }, 30); }, say: 'Tap End turn. Leftover cards go to the discard pile.', wait: { type: 'tap', match: function (a) { return a.w === 'end'; } }, ready: battleP },
      info('pattern', intent, 'Foes repeat a pattern. Next: a bite that makes you Weak.', turn2),
      { id: 'strength', title: 'Power', target: function () { return cardEl('w-kindle'); }, say: 'Tap Kindle twice. Strength adds 2 to every hit.', wait: tap('w-kindle'), ready: turn2 },
      { id: 'exhaust', title: 'Weak', target: function () { return cardEl('w-roar'); }, say: 'Tap the Roar twice. Weak foes hit 3 less. Roar exhausts.', wait: tap('w-roar'), ready: turn2 },
      { id: 'potion', title: 'Potion', target: function () { return $('.ec-potpop .potdrink') || $('.pot.full'); }, say: 'Tap the potion, then Drink. Poison hurts through Block.', wait: { type: 'event', match: function (a) { return a.pots === 0; } }, ready: turn2 },
      { id: 'finish', title: 'Finish it', target: function () { return cardEl('w-strike'); }, say: 'Tap each Strike twice to finish it.', wait: tap('w-strike', 4), ready: turn2 },
      { id: 'reward', title: 'Card reward', target: function () { return $('.picks .card') && $('.picks .card').parentNode; }, say: 'Gold won! Pick 1 of 3 cards for your deck.', wait: { type: 'tap', match: function (a) { return a.w === 'pick'; } }, ready: scr('reward') },
      { id: 'leave', title: 'Onward', target: function () { return $('#leave'); }, say: 'Tap Continue to climb.', wait: { type: 'event', match: function (a) { return a.scr === 'map'; } }, ready: scr('reward') },
      info('map', function () { return $('#map'); }, 'Choose your path. The boss waits at the top.', scr('map')),
      { id: 'go', title: 'Your climb', target: function () { return $('#map .node.glow'); }, also: function () { return [].slice.call(document.querySelectorAll('#map .node.glow')).slice(1); }, say: 'Tap a glowing room: a fight or a ? event.', wait: { type: 'event', match: function (a) { return a.scr !== 'map'; } }, ready: scr('map') },
      { id: 'free', title: 'Your climb', target: function () { return $('#app'); }, say: 'Your climb now.', wait: null, ready: function () { return true; },
        onEnter: function () { setTimeout(function () { try { GXT.stop(); } catch (e) { } C.on = true; ['intent', 'vuln', 'energy', 'block', 'endturn', 'weak', 'poison', 'strength', 'power', 'exhaust', 'potion', 'reward', 'gold', 'map'].forEach(function (k) { C.seen[k] = 1; }); UI.render(); }, 60); } }
    ];
  }
  window.EC_TUT_RULES = RULES;
  function finish(play) {
    C.on = false; window.EC_NOSAVE = 0; UI.ov = null; try { GXT.markDone('emberclimb'); } catch (e) { } var sy = $('.ec-say'); if (sy) sy.remove();
    if (UI.camp) {
      var def = UI.camp;
      if (def.id !== 'guide') { var G = g(); try { UI.mode = 'title'; UI.sub = ''; UI.render(); GXC.finish(G); } catch (e) { UI.campExit(); } return; }
      UI.campExit(); try { GXC.open(); } catch (e) { } return;
    }
    UI.mode = 'title'; UI.sub = '';
    if (play) { UI.pick = ['w']; UI.sub = 'quick'; }
    UI.render();
  }
  UI.coachFinish = finish;
  UI.tutStart = function () {
    if (!window.GXT) return;
    GXT.start({ game: 'emberclimb', setup: stage, steps: steps(), story: false, endTitle: 'Your climb', endText: '', onDone: function () { }, onExit: function () { if (C.on) return; if (UI.camp) { C.on = true; C.seen.intent = 1; UI.render(); } else finish(false); } });
    try { if (GXT.active()) UI.render(); } catch (e) { }
  };
  UI.tutFree = function () { return false; };
  UI.coachOn = function () { return !!C.on; };   // Addendum 7: bubbles only in Learn to play
  window.EC_TUT_STEPS = steps;
})();
