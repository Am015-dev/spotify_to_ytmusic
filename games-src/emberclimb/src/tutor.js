// Emberclimb guided climb: ONE real short climb (7 rooms, fixed seed, staged hands) from setup to the result screen, taught with the shared
// tutor kit (gx-tutor.js). 4 chapters, each can be left and resumed (localStorage 'emberclimb.tutch'). Every rule it teaches is listed with its
// step id in TUTORIAL-COVERAGE.md. "free" steps let the player play on their own (any card, End turn, potions) until the screen changes.
(function () {
  var E = EC.E, D = EC.D, CHK = 'emberclimb.tutch';
  function g() { return E.G(); }
  function $(s) { return document.querySelector(s); }
  function handIdx(id) { var G = g(); if (!G || !G.b) return -1; var hd = G.hs[0].hand; for (var i = 0; i < hd.length; i++) if (hd[i].id === id) return i; return -1; }
  function cardEl(id) { var i = handIdx(id); return i < 0 ? null : $('.hand .card[data-c="' + i + '"]'); }
  function battleP() { var G = g(); return !!(G && G.scr === 'battle' && G.b && G.b.ph === 'p' && !UI.busy); }
  function scr(s) { return function () { var G = g(); return !!(G && G.scr === s && !UI.busy); }; }
  function ev(fn) { return { type: 'event', match: fn }; }
  function tap(id) { return { type: 'tap', times: 2, match: function (a) { return a.w === 'card' && a.id === id; } }; }
  function saveCh(n) { try { localStorage.setItem(CHK, String(n)); } catch (e) { } }
  function loadCh() { try { return +localStorage.getItem(CHK) || 0; } catch (e) { return 0; } }
  // the guided climb's fixed path: fight, treasure, fight, campfire, shop, event, boss
  var PATH = ['m', 't', 'm', 'r', 's', 'v', 'b'];
  function stage(ch) {
    window.EC_NOSAVE = 1;
    E.newGame({ heroes: ['w'], seed: 7, floors: 6 });
    var G = g(), mk = E.mk;
    G.map = PATH.map(function (t, i) { return { id: i, f: i + 1, c: 1.5, t: t, nx: i < PATH.length - 1 ? [i + 1] : [] }; }); G.F = 6;
    G.boss = D.ENEMIES['warden-captain'] ? 'warden-captain' : 'iron-warden';
    var h = G.hs[0];
    if (ch === 0) {
      E.performMove({ t: 'go', n: 0 }); G = g();
      var e = G.b.en[0]; G.b.en = [e]; e.id = 'gnawer'; e.hp = e.mhp = 14; e.blk = 0; e.st = {}; e.i = 0; e.intent = { atk: 4, tg: 0 };
      h.hand = [mk('w-hammer'), mk('w-defend'), mk('w-strike'), mk('w-strike'), mk('w-defend')]; h.en = 3; h.blk = 0;
      h.draw = [mk('w-defend'), mk('w-strike'), mk('w-defend'), mk('w-defend'), mk('w-strike')]; h.disc = [];
    } else {
      // later chapters start on the map after the rooms before them (same deck the guide would have built)
      var at = { 1: 0, 2: 2, 3: 5 }[ch]; for (var k = 0; k <= at; k++) G.map[k].vis = 1; G.at = at; G.floor = at + 1; G.scr = 'map';
      h.deck.push(mk('w-twin-slash')); if (ch >= 2) { G.pots = []; G.gold = 160; h.hp = 62; if (G.relics.length < 2) G.relics.push('iron-bangle'); } else { G.pots = ['venom-vial']; h.hp = 74; }
      if (ch === 3) { G.gold = 90; h.hp = 70; }
    }
    if (ch === 1 || ch === 0) G.pots = ['venom-vial'];
    UI.mode = 'game'; UI.sel = -1; UI.ov = null; UI.render();
  }
  // second fight: Iron Warden staged so potion, power, exhaust, die card and junk cards all come up
  function stageFight2() {
    var G = g(), mk = E.mk, h = G.hs[0]; if (!G.b || G.b.staged) return; G.b.staged = 1;
    var e = G.b.en[0]; G.b.en = [e]; e.id = 'iron-warden'; e.hp = e.mhp = 26; e.blk = 0; e.st = {}; e.i = 1; e.intent = { add: ['dazed', 2], tg: 0 };
    h.hand = [mk('w-kindle'), mk('w-roar'), mk('w-wild-swing'), mk('w-strike'), mk('w-defend')]; h.en = 3; h.blk = 0;
    h.draw = [mk('w-strike'), mk('w-hammer'), mk('w-strike'), mk('w-defend'), mk('w-strike'), mk('w-twin-slash')]; h.disc = [];
    UI.render();
  }
  function stageBoss() { var G = g(); if (!G.b || G.b.staged) return; G.b.staged = 1; var e = G.b.en[0]; e.hp = e.mhp = 34; UI.render(); }
  function free(id, title, say, done, chN) {
    return { ch: chN, id: id, title: title, free: true, target: function () { return $('.enemies') || $('#app'); }, also: function () { return [$('#end'), $('.pots'), $('.hand'), $('.ctl'), $('#mir')].filter(Boolean); }, side: 'bottom', say: say, wait: ev(done), ready: function () { return !!$('#stage'); } };
  }
  function steps(ch) {
    var S = [
      // ---- chapter 1: your first fight
      { ch: 0, id: 'setup', title: 'Ch 1: Your hero', target: function () { return $('.heropan'); }, say: 'This is Garrick: 80 HP. Your deck starts with 10 basic cards. If HP hits 0, the climb ends.', wait: null, ready: battleP, onEnter: function () { saveCh(0); } },
      { ch: 0, id: 'intent', title: 'Read the intent', target: function () { return $('.en .intent'); }, side: 'bottom', say: 'Above the enemy: its next move. This Gnawer will hit you for 4.', wait: null, ready: battleP },
      { ch: 0, id: 'energy', title: 'Your energy', target: function () { return $('.energy'); }, say: 'You draw 5 cards and get 3 energy each turn. A card costs the number in its corner.', wait: null, ready: battleP },
      { ch: 0, id: 'attack', title: 'Attack', target: function () { return cardEl('w-hammer'); }, say: 'Tap Anvil Blow twice: lift it, then play it. It hits and makes the enemy Vulnerable.', wait: tap('w-hammer'), ready: battleP },
      { ch: 0, id: 'block', title: 'Block', target: function () { return cardEl('w-defend'); }, say: 'Tap Plate Guard twice. Block soaks damage until your next turn.', wait: tap('w-defend'), ready: battleP },
      { ch: 0, id: 'end', title: 'End your turn', target: function () { var b = document.getElementById('end'); if (b) b.disabled = false; return b; }, say: 'Out of energy: tap End turn. Unplayed cards go to your used pile.', wait: { type: 'tap', match: function (a) { return a.w === 'end'; } }, ready: battleP },
      { ch: 0, id: 'enemyturn', title: 'The enemy acted', target: function () { return $('.heropan'); }, say: 'It attacked step by step; your Block took the hit. Block is gone at your next turn.', wait: null, ready: function () { return battleP() && g().b.turn >= 2; } },
      { ch: 0, id: 'piles', title: 'Draw and used piles', target: function () { return $('.piles'); }, say: 'Draw: cards left to draw. Used: played cards. When Draw runs out, Used is shuffled back in.', wait: null, ready: battleP },
      { ch: 0, id: 'finish', title: 'Finish it', target: function () { return cardEl('w-strike'); }, say: 'Vulnerable enemies take more damage. Tap Cinder Strike twice to finish it.', wait: tap('w-strike'), ready: function () { return battleP() && cardEl('w-strike'); } },
      { ch: 0, id: 'reward', title: 'Pick a reward', target: function () { return $('.picks .card'); }, say: 'A win gives gold and a card. Tap this card to add it to your deck.', wait: { type: 'tap', match: function (a) { return a.w === 'pick'; } }, ready: function () { return g().scr === 'reward' && $('.picks .card'); } },
      { ch: 0, id: 'leave1', title: 'Move on', target: function () { return $('#leave'); }, say: 'Tap Continue to go back to the map.', wait: ev(function (a) { return a.scr === 'map'; }), ready: scr('reward') },
      // ---- chapter 2: the map, treasure, potions and a harder fight
      { ch: 1, id: 'map', title: 'Ch 2: The map', target: function () { return $('.node.glow'); }, say: 'The map: glowing rooms are your next step. This chest room is a treasure. Tap it.', wait: ev(function (a) { return a.scr === 'reward'; }), ready: scr('map'), onEnter: function () { saveCh(1); } },
      { ch: 1, id: 'relic', title: 'Take the relic', target: function () { return $('.reward .picks .item') || $('.reward .item'); }, say: 'Treasure gives a relic: a lasting bonus for the whole climb. Tap it to take it.', wait: ev(function (a) { return a.relic; }), ready: scr('reward') },
      { ch: 1, id: 'leave2', title: 'Move on', target: function () { return $('#leave'); }, say: 'Tap Continue.', wait: ev(function (a) { return a.scr === 'map'; }), ready: scr('reward') },
      { ch: 1, id: 'map2', title: 'A fight room', target: function () { return $('.node.glow'); }, say: 'Crossed swords: a fight. Tap it.', wait: ev(function (a) { return a.scr === 'battle'; }), ready: scr('map') },
      { ch: 1, id: 'junkintent', title: 'A sneaky enemy', target: function () { return $('.en .intent'); }, side: 'bottom', say: 'This Iron Warden will add 2 Dazed to your deck: junk cards you cannot play.', wait: null, ready: battleP, onEnter: stageFight2 },
      { ch: 1, id: 'potion', title: 'Use a potion', target: function () { return $('.pot.full'); }, say: 'Potions are free, one use. Tap the Venom Vial: it poisons the enemy.', wait: ev(function (a) { return a.pots === 0; }), ready: battleP },
      { ch: 1, id: 'poison', title: 'Poison', target: function () { return $('.en .stc') || $('.en'); }, side: 'bottom', say: 'Poison: the enemy loses HP at the end of your turn, ignoring Block.', wait: null, ready: battleP },
      { ch: 1, id: 'power', title: 'Power card', target: function () { return cardEl('w-kindle'); }, say: 'Powers last the whole fight. Tap Kindle twice: +2 Strength, so every hit deals 2 more.', wait: tap('w-kindle'), ready: battleP },
      { ch: 1, id: 'exhaust', title: 'Weak and exhaust', target: function () { return cardEl('w-roar'); }, say: 'Tap Intimidating Roar twice: the enemy turns Weak (hits softer). It exhausts: gone for this fight.', wait: tap('w-roar'), ready: battleP },
      { ch: 1, id: 'die', title: 'Roll the die', target: function () { return cardEl('w-wild-swing'); }, say: 'Die cards roll 1-6: low, middle or high result. Tap Wild Swing twice.', wait: tap('w-wild-swing'), ready: battleP },
      { ch: 1, id: 'end2', title: 'End your turn', target: function () { var b = document.getElementById('end'); if (b) b.disabled = false; return b; }, say: 'Keep the last cards and tap End turn. Watch the poison tick.', wait: { type: 'tap', match: function (a) { return a.w === 'end'; } }, ready: battleP },
      { ch: 1, id: 'junk', title: 'Junk cards', target: function () { return $('.piles'); }, say: 'The Dazed cards went into your used pile. When you draw them they just clog your hand.', wait: null, ready: function () { return battleP() && g().b.turn >= 2; } },
      free('win2', 'Your fight now', 'Play it your way: glowing cards, then End turn. Win the fight.', function (a) { return a.scr === 'reward'; }, 1),
      { ch: 1, id: 'skip', title: 'Skip a card', target: function () { var b = [].slice.call(document.querySelectorAll('.reward .btn.alt')).filter(function (x) { return /Skip/.test(x.textContent); })[0]; return b; }, say: 'You may skip a card reward: a smaller deck draws your best cards more often. Tap Skip.', wait: ev(function (a) { return a.took0; }), ready: scr('reward') },
      { ch: 1, id: 'leave3', title: 'Move on', target: function () { return $('#leave'); }, say: 'Tap Continue.', wait: ev(function (a) { return a.scr === 'map'; }), ready: scr('reward') },
      // ---- chapter 3: campfire, shop, event
      { ch: 2, id: 'campfire', title: 'Ch 3: Campfire', target: function () { return $('.node.glow'); }, say: 'A campfire room. Tap it.', wait: ev(function (a) { return a.scr === 'rest'; }), ready: scr('map'), onEnter: function () { saveCh(2); } },
      { ch: 2, id: 'rest', title: 'Rest or smith', target: function () { return $('#rest-heal'); }, say: 'Rest heals you; Smith upgrades one card instead. You are hurt: tap Rest.', wait: ev(function (a) { return a.scr === 'map'; }), ready: scr('rest') },
      { ch: 2, id: 'shopnode', title: 'The shop', target: function () { return $('.node.glow'); }, say: 'A shop. Tap it.', wait: ev(function (a) { return a.scr === 'shop'; }), ready: scr('map') },
      { ch: 2, id: 'shopitem', title: 'Look at an item', target: function () { return $('.items .item:not(.poor):not(.sold)') || $('.items .item'); }, say: 'Gold buys cards, relics and potions; you can also pay to remove a card. Tap an item.', wait: ev(function (a) { return a.shopSel >= 0; }), ready: scr('shop') },
      { ch: 2, id: 'buy', title: 'Buy it', target: function () { return $('#buy'); }, say: 'Tap Buy.', wait: ev(function (a) { return a.bought; }), ready: function () { return scr('shop')() && $('#buy'); } },
      { ch: 2, id: 'shopleave', title: 'Leave the shop', target: function () { return $('#shop-leave'); }, say: 'Tap Leave.', wait: ev(function (a) { return a.scr === 'map'; }), ready: scr('shop') },
      { ch: 2, id: 'event', title: 'A ? room', target: function () { return $('.node.glow'); }, say: 'A ? room is a surprise event. Tap it.', wait: ev(function (a) { return a.scr === 'event'; }), ready: scr('map') },
      { ch: 2, id: 'choose', title: 'Choose', target: function () { return $('.opts button:not([disabled])'); }, say: 'Events give a choice. Tap Pray to heal.', wait: ev(function (a) { return a.evres || a.scr === 'map'; }), ready: scr('event'), onEnter: function () { var G = g(); if (G.evn && D.EVENTS['ember-shrine']) { G.evn = { id: 'ember-shrine', res: null }; UI.ov = null; UI.render(); } } },
      { ch: 2, id: 'evleave', title: 'Move on', target: function () { return $('#ev-leave'); }, say: 'Tap Continue.', wait: ev(function (a) { return a.scr === 'map'; }), ready: function () { return scr('event')() && $('#ev-leave'); } },
      // ---- chapter 4: boss and the end
      { ch: 3, id: 'boss', title: 'Ch 4: The boss', target: function () { return $('.node.glow'); }, say: 'The crown room at the top is the boss. Beat it to win the climb. Tap it.', wait: ev(function (a) { return a.scr === 'battle'; }), ready: scr('map'), onEnter: function () { saveCh(3); } },
      { ch: 3, id: 'spikes', title: 'Boss pattern', target: function () { return $('.en .intent'); }, side: 'bottom', say: 'Bosses repeat a pattern. When it shows Spikes, attacks on it hurt you: use Block cards that turn.', wait: null, ready: battleP, onEnter: stageBoss },
      free('win3', 'Beat the boss', 'Play your cards, then End turn. Read its move each turn.', function (a) { return a.scr === 'reward' || a.scr === 'over'; }, 3),
      { ch: 3, id: 'bossrelic', title: 'Boss treasure', target: function () { return $('.reward .picks .item'); }, say: 'A boss offers 3 relics (1 per hero + 1 in a duo). Take one.', wait: ev(function (a) { return a.relic || a.scr === 'over'; }), ready: function () { return scr('reward')() && $('.reward .picks .item'); } },
      { ch: 3, id: 'leave4', title: 'Finish the climb', target: function () { return $('#leave'); }, say: 'Tap Continue to finish the climb.', wait: ev(function (a) { return a.scr === 'over'; }), ready: scr('reward') },
      { ch: 3, id: 'result', title: 'Climb won', target: function () { return $('.over h1, .over h2, #app h1, #app h2'); }, side: 'bottom', say: 'Boss down: you win the climb. Stars and unlocks come in Story mode.', wait: null, ready: scr('over') },
      { ch: 3, id: 'heroes', title: 'More heroes', target: function () { return $('.over h1, .over h2, #app h1, #app h2'); }, side: 'bottom', say: 'Rogue: poison and Shivs. Automaton: orbs. Monk: stances. Each Story chapter teaches its hero.', wait: null, ready: scr('over') }
    ];
    return story(S).filter(function (s) { return s.ch >= (ch || 0); });
  }
  // ---- story layer (text in src/story.js): guide voice on every step, a reaction after each action, chapter intro and payoff beats, a count-up climax
  var PRO = (window.EC_STORY || {}).prologue || { chapters: [], steps: {} }, CAST = (window.EC_STORY || {}).cast || { guide: { name: 'Guide', emoji: '🔥' } };
  UI.say = function (text, ms, who) {
    var old = document.querySelector('.ec-say'); if (old) old.remove(); if (!text) return null;
    var c = CAST[who || 'guide'] || CAST.guide, d = document.createElement('div'); d.className = 'ec-say'; d.setAttribute('role', 'status'); d.setAttribute('data-help', '');
    var pic = window.EC_A ? EC_A('cast-' + (who || 'guide'), c.emoji || '', { kind: 'portrait', ph: c.color || '#a8431f' }) : document.createElement('div'); d.appendChild(pic);
    var t = document.createElement('div'), b = document.createElement('b'), sp = document.createElement('span'); b.textContent = c.name; sp.textContent = text; t.appendChild(b); t.appendChild(sp); d.appendChild(t);
    document.body.appendChild(d); setTimeout(function () { if (d.parentNode) d.remove(); }, ms || 2800); return sp;
  };
  function climax() {
    var G = g(), floors = G.floor || 0, gold = G.gold || 0, sp = UI.say('Floors 0 · Gold 0', 5200); if (!sp) return; var t0 = Date.now();
    (function tick() { var k = Math.min(1, (Date.now() - t0) / 1400); sp.textContent = 'Floors climbed ' + Math.round(floors * k) + ' · Gold ' + Math.round(gold * k) + (k >= 1 ? '. ' + (PRO.chapters[3] || {}).outro : ''); if (k < 1) requestAnimationFrame(tick); })();
  }
  function story(S) {
    var out = [], prev = null;
    S.forEach(function (st) {
      var cs = PRO.chapters[st.ch];
      if (!prev || prev.ch !== st.ch) {   // chapter opening beat
        var pc = prev; out.push({ ch: st.ch, id: 'intro' + (st.ch + 1), title: cs ? cs.title.replace(/^Prologue \d+: /, '') : 'Chapter', say: cs ? cs.intro : '', wait: null,
          target: st.ch === 0 ? function () { return document.querySelector('.en') || document.querySelector('#stage'); } : function () { return document.querySelector('.node.glow'); },
          ready: st.ready, onEnter: function () { var o = pc && PRO.chapters[pc.ch]; if (o && o.outro) UI.say(o.outro, 3000); } });
      }
      var tx = PRO.steps[st.id];
      if (tx) { st.say = tx.say; st.title = st.title && /^Ch \d/.test(st.title) ? st.title.replace(/^Ch \d: /, '') : st.title; }
      var p = prev, enter = st.onEnter;
      st.onEnter = function () { if (enter) enter(); var r = p && PRO.steps[p.id] && PRO.steps[p.id].react; if (r && !(p.ch !== st.ch)) UI.say(r); if (st.id === 'result') climax(); };
      out.push(st); prev = st;
    });
    return out;
  }
  function finish(play, done) {
    window.EC_NOSAVE = 0; UI.ov = null; if (done) saveCh(0);
    if (UI.camp) {
      var def = UI.camp;
      if (done && def.id !== 'guide') { var G = g(); G.won = 1; try { UI.mode = 'title'; UI.sub = ''; UI.render(); GXC.finish(G); } catch (e) { UI.campExit(); } return; }
      UI.campExit(); try { GXC.open(); } catch (e) { } return;
    }
    UI.mode = 'title'; UI.sub = '';
    if (play) { UI.pick = ['w']; UI.sub = 'quick'; UI.render(); } else UI.render();
  }
  UI.tutStart = function (fromCh) {
    if (!window.GXT) return;
    var ch = fromCh != null ? fromCh : loadCh();
    GXT.start({ game: 'emberclimb', setup: function () { stage(ch); }, steps: steps(ch), story: false, endTitle: (PRO.end || {}).title || 'You can climb now', endText: (PRO.end || {}).text || 'You played a whole climb.',
      onDone: function (r) { finish(!r || r.choice !== 'menu', true); }, onExit: function () { finish(false, false); } });
    try { if (GXT.active()) UI.render(); } catch (e) { }
  };
  UI.tutFree = function () { try { return !!(window.GXT && GXT.active() && (GXT.current() || {}).free); } catch (e) { return false; } };
  window.EC_TUT_STEPS = steps;
})();
