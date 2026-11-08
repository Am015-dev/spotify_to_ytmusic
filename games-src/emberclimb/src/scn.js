// Emberclimb scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return window.EC && EC.E && window.UI && UI.render; };
  var E = function () { return EC.E; }, G = function () { return EC.E.G(); }, D_ = function () { return EC.D; };
  function begin(heroes, seed) { try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); GX.close(); if (window.GXC) GXC.close(); } catch (e) { } window.EC_NOSAVE = 0; UI.camp = null; UI.mode = 'game'; UI.sel = -1; window.ANIM = false; E().newGame({ heroes: heroes, seed: seed || 11 }); }
  function fight(heroes, seed, one) {
    begin(heroes, seed); E().performMove({ t: 'go', n: E().validMoves()[0].n });
    if (one) { G().b.en = [G().b.en[0]]; }
    UI.render();
  }
  var snapBattle = function () { var g = G(), h = g.hs[0]; return { hand: h.hand.length, en: h.en, ph: g.b ? g.b.ph : '', turn: g.b ? g.b.turn : 0, scr: g.scr }; };
  GXS.boardOpen = function () { fight(['w'], 11); };
  GXS.add({ id: 'ec-map', name: 'Map: pick a room', ask: 'Can you see the glowing rooms?', seed: 3, when: booted,
    setup: function () { begin(['w'], 3); UI.render(); },
    checks: [{ kind: 'visible', sel: '.node.glow', name: 'glowing room' },
      { kind: 'tap', sel: '.node.glow', name: 'enter a room', state: function () { return G().scr; }, expect: function (b, a) { return a === 'battle' || a !== b; } }] });
  GXS.add({ id: 'ec-fight', name: 'Fight: play a card', ask: 'Tap a card twice to play it', seed: 5, when: booted,
    setup: function () { fight(['w'], 5, true); },
    checks: [{ kind: 'visible', sel: '#end', name: 'End turn button' }, { kind: 'visible', sel: '.hand .card', name: 'a card in hand' },
      { kind: 'play', name: 'play a card', snap: snapBattle, steps: [{ sel: '.hand .card.ok', until: function () { return !!document.querySelector('.hand .card.sel'); }, max: 1 }, { sel: '.hand .card.sel', after: 500 }], idle: function () { return !UI.busy; }, verify: function (b, a) { return (a.hand < b.hand || a.scr !== 'battle') ? true : 'card was not played'; } },
      { kind: 'tap', sel: '#end', name: 'End turn', state: snapBattle, expect: function (b, a) { return a.ph === 'e' || a.turn > b.turn || a.scr !== 'battle'; } }] });
  GXS.add({ id: 'ec-fight-two', name: 'Fight: two heroes', ask: 'Do both heroes show?', seed: 6, when: booted,
    setup: function () { fight(['s', 'm'], 6); }, checks: [{ kind: 'visible', sel: '.heropan', name: 'hero panel' }, { kind: 'visible', sel: '#end', name: 'End turn button' }] });
  GXS.add({ id: 'ec-reward', name: 'Reward: pick a card', ask: 'Pick one of three cards', seed: 7, when: booted,
    setup: function () { fight(['a'], 7); E().debug.win(); UI.render(); },
    checks: [{ kind: 'visible', sel: '.picks .card', name: 'reward card' },
      { kind: 'tap', sel: '.picks .card', name: 'pick a card', state: function () { return G().hs[0].deck.length; }, expect: function (b, a) { return a === b + 1; } }] });
  GXS.add({ id: 'ec-shop', name: 'Shop: buy something', ask: 'Can you buy an item?', seed: 8, when: booted,
    setup: function () { begin(['m'], 8); E().debug.shop(); UI.render(); },
    checks: [{ kind: 'visible', sel: '.items .item', name: 'shop item' }, { kind: 'play', name: 'buy an item (tap, then Buy)', snap: function () { return { gold: G().gold }; }, steps: [{ sel: '.items .item:not(.sold)', until: function () { return !!document.querySelector('#buy'); }, max: 1 }, { sel: '#buy', after: 400 }], idle: function () { return true; }, verify: function (b, a) { return a.gold < b.gold || 'gold did not drop'; } }] });
  GXS.add({ id: 'ec-rest', name: 'Campfire: heal or smith', ask: 'Rest or upgrade', seed: 9, when: booted,
    setup: function () { begin(['w'], 9); E().debug.rest(); UI.render(); },
    checks: [{ kind: 'visible', sel: '#rest-heal', name: 'Rest button' }, { kind: 'tap', sel: '#rest-heal', name: 'rest', state: function () { return G().hs[0].hp; }, expect: function (b, a) { return a > b; } }] });
  GXS.add({ id: 'ec-event', name: 'Event: make a choice', ask: 'Choose an option', seed: 10, when: booted,
    setup: function () { begin(['s'], 10); E().debug.event('ember-shrine'); UI.render(); }, checks: [{ kind: 'visible', sel: '.opts .btn', name: 'event option' }] });
  // W420: boss intro overlay (video when listed in MEDIA_VIDEO, else the zooming still) with Skip
  GXS.add({ id: 'bossintro', name: 'Boss intro', ask: 'Does the boss intro show its name and a Skip button?', seed: 13, when: booted,
    setup: function () { begin(['w'], 13); var g = G(), bn = g.map.filter(function (n) { return n.t === 'b'; })[0], pre = g.map.filter(function (n) { return n.nx.indexOf(bn.id) >= 0; })[0]; g.at = pre.id; g.floor = pre.f; E().performMove({ t: 'go', n: bn.id }); UI.render(); var be = G().b && G().b.en.filter(function (e) { return D_().ENEMIES[e.id].boss; })[0]; UI.bossIntro(be ? be.id : G().boss, function () { }); },
    checks: [{ kind: 'visible', sel: '.w4boss .w4bt h1', name: 'boss name' }, { kind: 'visible', sel: '#boss-skip', name: 'Skip button' },
      { kind: 'tap', sel: '#boss-skip', name: 'skip the intro', state: function () { return !!document.querySelector('.w4boss'); }, expect: function (b, a) { return b && !a; } }] });
  GXS.add({ id: 'ec-result', name: 'Result screen', ask: 'Can you start a new climb?', seed: 12, when: booted,
    setup: function () { begin(['w'], 12); E().debug.over(true); UI.render(); }, checks: [{ kind: 'visible', sel: '#again', name: 'Play again button' }] });
})();
