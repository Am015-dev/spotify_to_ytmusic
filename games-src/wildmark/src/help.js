/* Wildmark help (shell/gx-help.js): one coach bubble per phase the first time, and the lightbulb (suggested move + rules cards). */
function helpInit() {
  if (!window.GXH) return;
  var mkT = function (i) { return function () { return document.querySelector('#mk .pair[data-i="' + i + '"]') || document.querySelector('#mk'); }; };
  GXH.init({
    game: 'wildmark', defaultOn: true, avoid: '#mk,#acts button,#map .spot,#map .ghost,#map .tgt',
    steps: {
      pick: { target: function () { return document.querySelector('#mk'); }, title: 'The market', text: 'Each column is a tile and the token under it. Tap one to take both.' },
      tile: { target: function () { return document.querySelector('#map .spot') || document.querySelector('#map'); }, title: 'Place the tile', text: 'Tap a glowing spot next to your valley. Matching edges grow habitats.' },
      tok: { target: function () { return document.querySelector('#map .tgt') || document.querySelector('#acts'); }, title: 'Settle the animal', text: 'Put the token on a glowing tile that shows it, or return it.' },
      acorn: { target: function () { return document.querySelector('#freeB') || document.querySelector('#acorn'); }, title: 'Acorns', text: 'Spend an acorn to take any tile with any token, or to replace tokens.' }
    },
    rules: [
      { phase: 'pick', title: 'Take a pair', text: 'Take one column: its tile and its token. Three matching tokens may be swept once per turn.' },
      { phase: 'tile', title: 'Habitats', text: 'Each terrain scores its largest connected group. Edges must match to connect. Turn split tiles.' },
      { phase: 'tok', title: 'Animal cards', text: 'Bears in pairs, elk in lines, salmon in chains, hawks alone, foxes next to many kinds.' },
      { phase: 'acorn', title: 'Keystones', text: 'An animal on a gold-rimmed keystone earns an acorn. Each left at the end is 1 point.' }
    ]
  });
  GXH.bulb({
    el: document.getElementById('bulbbtn'),
    rulesFor: function () { return G && !G.over ? G.stage : 'pick'; },
    suggest: function () {
      if (!G || G.over || G.seats[G.cur].ai || !myTurn()) return null;
      var plan = WM.AI.plan(WM.clone(G), 'hard');
      if (G.stage === 'pick') { var i = plan.pick.t === 'take' ? plan.pick.i : plan.pick.ti; var t = document.querySelector('#mk .mt[data-i="' + i + '"]'); return t ? { target: t, why: plan.pick.t === 'free' ? 'Worth an acorn: it fits your patterns.' : 'Best fit for your patterns and habitats.' } : null; }
      if (G.stage === 'tile') { var c = WM.AI.choose(WM.clone(G), 'hard'); var e = document.querySelector('#map [data-c="' + (c && c.c) + '"]'); return e ? { target: e, why: 'Joins matching edges and leaves good animal spots.' } : null; }
      if (G.stage === 'tok') { var m = WM.AI.choose(WM.clone(G), 'hard'); if (m.t === 'back') return { target: document.getElementById('backB'), why: 'No spot helps: returning keeps your patterns clean.' }; var e2 = document.querySelector('#map [data-c="' + m.c + '"]'); return e2 ? { target: e2, why: 'This spot scores the most for its card.' } : null; }
      return null;
    }
  });
}
