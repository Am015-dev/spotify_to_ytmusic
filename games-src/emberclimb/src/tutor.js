// Emberclimb coached first climb (the tutorial). A REAL short climb with free choices: only the first 2 steps are forced (read the intent,
// play Anvil Blow) through the shared tutor kit; then the kit stops and the coach speaks just in time: the first time a rule matters, after a
// good or poor play, never blocking input (one dismissable line at a time). The end walks through the real numbers and lists the rules that
// did not come up ("Things you will meet later"). Text: src/story.js (EC_STORY.coach). Rule keys = TUTORIAL-COVERAGE.md.
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
    var old = $('.ec-say'); if (old) old.remove(); if (!text) return null;
    var c = (ST.cast || {})[who || 'guide'] || { name: 'Warden Ashgrove', emoji: '🔥', color: '#a8431f' }, d = document.createElement('div'); d.className = 'ec-say'; d.setAttribute('role', 'status');
    var pic = window.EC_A ? EC_A('cast-' + (who || 'guide'), c.emoji || '', { kind: 'portrait', ph: c.color || '#a8431f' }) : document.createElement('div'); d.appendChild(pic);
    var t = document.createElement('div'), b = document.createElement('b'), sp = document.createElement('span'); b.textContent = c.name; sp.textContent = text; t.appendChild(b); t.appendChild(sp); d.appendChild(t);
    d.addEventListener('click', function (e) { e.stopPropagation(); d.remove(); });
    document.body.appendChild(d); setTimeout(function () { if (d.parentNode) d.remove(); }, ms || 5200); return sp;
  };
  function speak(key, text, ms) { if (!text) return; C.q.push({ key: key, text: text, ms: ms }); pump(); }
  function pump() { if ($('.ec-say') || !C.q.length) return; var it = C.q.shift(); UI.say(it.text, it.ms); }
  setInterval(function () { if (C.on) { pump(); tick(); } }, 400);
  function rule(k) { if (!C.on || C.seen[k] || !CO.rules[k]) return; C.seen[k] = 1; speak(k, CO.rules[k]); }
  UI.coachRule = rule;
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
    if (b.kind === 'e') rule('elite'); if (b.kind === 'b') rule('boss');
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
    C.q = []; lines.forEach(function (l, i) { setTimeout(function () { UI.say(l, 2600); }, i * 2800); });
    setTimeout(endCard, lines.length * 2800 + 200);
  }
  function endCard() {
    var later = Object.keys(CO.rules).filter(function (k) { return !C.seen[k]; });
    var o = document.createElement('div'); o.className = 'ec-endcard'; o.setAttribute('role', 'dialog');
    var c = document.createElement('div'); c.className = 'ec-endc'; o.appendChild(c);
    var add = function (tag, txt) { var e = document.createElement(tag); e.textContent = txt; c.appendChild(e); return e; };
    add('h2', CO.end.title || 'You climbed the tower');
    add('p', 'Rules you met on the way: ' + Object.keys(C.seen).filter(function (k) { return CO.rules[k]; }).length + ' of ' + Object.keys(CO.rules).length + '.');
    if (later.length) { add('h3', CO.end.later || 'Things you will meet later'); var ul = add('ul', ''); later.forEach(function (k) { var li = document.createElement('li'); li.textContent = CO.rules[k]; li.setAttribute('data-rule', k); ul.appendChild(li); }); }
    var row = document.createElement('div'); row.className = 'ec-endrow';
    var b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'btn'; b1.id = 'coach-play'; b1.textContent = CO.end.play || 'Play a real game';
    var b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'btn alt'; b2.id = 'coach-title'; b2.textContent = CO.end.title2 || 'Title';
    b1.addEventListener('click', function () { o.remove(); finish(true); }); b2.addEventListener('click', function () { o.remove(); finish(false); });
    row.appendChild(b1); row.appendChild(b2); c.appendChild(row); document.body.appendChild(o);
    C.later = later;
  }
  // ---- the climb: Warrior, fixed seed, a small branching map so paths are real choices; foes 75% HP
  var MAP = [[1, 'm'], [2, 't'], [2, 'm'], [3, 'm'], [3, 'v'], [4, 'r'], [4, 's'], [5, 'e'], [5, 'm'], [6, 'b']];
  function stage() {
    window.EC_NOSAVE = 1; E.newGame({ heroes: ['w'], seed: 7, floors: 5, hpPct: 75, boss: D.ENEMIES['warden-captain'] ? 'warden-captain' : undefined });
    var G = g(), cols = { 1: [1.5], 2: [0.8, 2.2], 3: [0.8, 2.2], 4: [0.8, 2.2], 5: [0.8, 2.2], 6: [1.5] }, used = {};
    G.map = MAP.map(function (m, i) { var k = used[m[0]] || 0; used[m[0]] = k + 1; return { id: i, f: m[0], c: cols[m[0]][k], t: m[1], nx: [] }; });
    G.map.forEach(function (n) { G.map.forEach(function (o) { if (o.f === n.f + 1) n.nx.push(o.id); }); }); G.F = 5; G.pots = ['venom-vial'];
    E.performMove({ t: 'go', n: 0 }); G = g();
    var e = G.b.en[0]; G.b.en = [e]; e.id = 'gnawer'; e.hp = e.mhp = 14; e.blk = 0; e.st = {}; e.i = 0; e.intent = { atk: 4, tg: 0 };
    var h = G.hs[0], mk = E.mk; h.hand = [mk('w-hammer'), mk('w-defend'), mk('w-strike'), mk('w-strike'), mk('w-defend')]; h.en = 3; h.blk = 0;
    h.draw = [mk('w-defend'), mk('w-kindle'), mk('w-strike'), mk('w-roar'), mk('w-wild-swing')]; h.disc = [];
    C.on = false; C.seen = {}; C.q = []; C.done = 0; C.lastDraw = -1; C.later = null;
    UI.mode = 'game'; UI.sel = -1; UI.ov = null; UI.render();
  }
  function steps() {
    var tap = function (id) { return { type: 'tap', times: 2, match: function (a) { return a.w === 'card' && a.id === id; } }; };
    return [
      { id: 'intent', title: 'Warden Ashgrove', target: function () { return $('.en .intent'); }, side: 'bottom', say: 'The summit ember is fading. Climb, Garrick!\nThis Gnawer shows its next move: a bite for 4.', wait: null, ready: battleP },
      { id: 'attack', title: 'Your first card', target: function () { return cardEl('w-hammer'); }, say: 'Crack its hide with Anvil Blow: lift it, then play it.\nAfter that, the climb is yours.', wait: tap('w-hammer'), ready: battleP },
      { id: 'free', title: 'Your climb', target: function () { return $('#app'); }, say: 'Your climb now.', wait: null, ready: function () { return true; },
        onEnter: function () { setTimeout(function () { try { GXT.stop(); } catch (e) { } C.on = true; C.seen.intent = 1; C.seen.vuln = 1; speak('free', 'It is Vulnerable now: your next hit lands double. Play on your own; I speak up when something new matters.', 4600); UI.render(); }, 60); } }
    ];
  }
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
  window.EC_TUT_STEPS = steps;
})();
