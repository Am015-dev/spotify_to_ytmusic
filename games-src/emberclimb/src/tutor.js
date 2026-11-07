// Emberclimb first-game guide: a fixed staged fight (never saved) taught with the shared tutor kit (gx-tutor.js).
// Core decision: read the enemy intent, attack or block, pick a reward card. 8 steps, about 2 minutes.
(function () {
  var E = EC.E, D = EC.D;
  function g() { return E.G(); }
  function handIdx(id) { var G = g(); if (!G || !G.b) return -1; var hd = G.hs[0].hand; for (var i = 0; i < hd.length; i++) if (hd[i].id === id) return i; return -1; }
  function cardEl(id) { var i = handIdx(id); return i < 0 ? null : document.querySelector('.hand .card[data-c="' + i + '"]'); }
  function battleP() { var G = g(); return !!(G && G.scr === 'battle' && G.b && G.b.ph === 'p' && !UI.busy); }
  function stage() {
    window.EC_NOSAVE = 1;
    E.newGame({ heroes: ['w'], seed: 7 });
    var G = g(); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = g();
    var e = G.b.en[0]; G.b.en = [e]; e.id = 'gnawer'; e.hp = e.mhp = 14; e.blk = 0; e.st = {}; e.i = 0; e.intent = { atk: 4, tg: 0 };
    var h = G.hs[0], mk = E.mk;
    h.hand = [mk('w-hammer'), mk('w-defend'), mk('w-strike'), mk('w-strike'), mk('w-defend')]; h.en = 3; h.blk = 0;
    h.draw = [mk('w-defend'), mk('w-strike'), mk('w-defend'), mk('w-defend'), mk('w-strike')]; h.disc = [];
    UI.mode = 'game'; UI.sel = -1; UI.ov = null; UI.render();
  }
  function steps() {
    var tap = function (id) { return { type: 'tap', times: 2, match: function (a) { return a.w === 'card' && a.id === id; } }; };
    return [
      { id: 'intent', title: 'Read the intent', target: function () { return document.querySelector('.en .intent'); }, side: 'bottom',
        say: function () { var e = g().b.en[0]; return 'The icon above the enemy shows its next move. This Gnawer will hit you for ' + ((e.intent && e.intent.atk) || 4) + '.'; }, wait: null, ready: battleP },
      { id: 'energy', title: 'Your energy', target: function () { return document.querySelector('.energy'); }, say: 'You get 3 energy every turn. A card costs the number in its corner. Spend it wisely.', wait: null, ready: battleP },
      { id: 'attack', title: 'Attack', target: function () { return cardEl('w-hammer'); }, say: 'Tap Anvil Blow twice: lift it, then play it. It hits hard and makes the enemy Vulnerable.', wait: tap('w-hammer'), ready: battleP },
      { id: 'block', title: 'Block', target: function () { return cardEl('w-defend'); }, say: 'That hit is coming. Tap Plate Guard twice to gain Block, which absorbs damage this turn.', wait: tap('w-defend'), ready: battleP },
      { id: 'end', title: 'End your turn', target: function () { return document.getElementById('end'); }, say: 'Out of energy? End your turn. The enemy acts and your Block takes the hit.', wait: { type: 'tap', match: function (a) { return a.w === 'end'; } }, ready: battleP },
      { id: 'finish', title: 'Finish it', target: function () { return cardEl('w-strike'); }, say: 'Vulnerable enemies take 50% more damage. Tap Cinder Strike twice to finish it.', wait: tap('w-strike'), ready: function () { return battleP() && g().b.turn >= 2 && cardEl('w-strike'); } },
      { id: 'reward', title: 'Pick a reward', target: function () { return document.querySelector('.picks'); }, say: 'Each win lets you add one card to your deck. Tap a card you like. A sharper deck climbs higher.', wait: { type: 'tap', match: function (a) { return a.w === 'pick'; } }, ready: function () { return g().scr === 'reward' && document.querySelector('.picks .card'); } }
    ];
  }
  function finish(play) {
    window.EC_NOSAVE = 0; UI.ov = null; UI.mode = 'title';
    if (play) { UI.start(); } else UI.render();
  }
  UI.tutStart = function () {
    if (!window.GXT) return;
    GXT.start({ game: 'emberclimb', setup: stage, steps: steps(), story: false, endTitle: 'You can climb now', endText: 'Read the intents, block or attack, pick cards that build a deck. Good luck.',
      onDone: function (r) { finish(!r || r.choice !== 'menu'); }, onExit: function () { finish(false); } });
  };
  window.EC_TUT_STEPS = steps;
})();
