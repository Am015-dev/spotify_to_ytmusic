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
      if (typeof tutOn === 'function' && tutOn()) {   // F3: in the guided tutorial the bulb always agrees with Rowan: it points at the step's own target
        var st = tutCur(); if (!st || st.wait) return null; var h = st.hl || '', el = null;
        if (h.indexOf('col:') === 0) el = document.querySelector('#mk .mt[data-i="' + h.slice(4) + '"]'); else if (h.indexOf('tok:') === 0) el = document.querySelector('#mk .mk[data-i="' + h.slice(4) + '"]');
        else if (h === 'spot') el = document.querySelector('#map .spot[data-c="' + UI.tut.spot + '"]'); else if (h === 'cell') el = UI.ghost ? document.querySelector('#map .ghost') : document.querySelector('#map .hx[data-c="' + UI.tut.spot + '"]');
        else if (h === 'next') el = document.getElementById('tutNext'); else if (h.charAt(0) === '#') el = document.querySelector(h);
        return el ? { target: el, why: st.say } : null;
      }
      if (G.stage === 'tile' && UI.ghost && quickTok()) {   // F3: step 3 points at a real ringed tile (the one that scores most), or at Place tile when every ring loses points
        var env = G.seats[G.cur].env, bc = null, bd = -1e9; Object.keys(env).filter(quickTarget).forEach(function (c) { var d = pvTok(env, c, G.hold.tok).d; if (d > bd) { bd = d; bc = c; } });
        if (ghostTakes()) { env[UI.ghost.c] = { id: G.hold.tile.id, t: G.hold.tile.t, a: G.hold.tile.a, key: G.hold.tile.key, rot: UI.ghost.rot, tok: null }; var dg = pvTok(env, UI.ghost.c, G.hold.tok).d; delete env[UI.ghost.c]; if (dg > bd) { bd = dg; bc = UI.ghost.c; } }
        if (bc == null || bd < 0) { var ok = document.getElementById('okB'); return ok ? { target: ok, why: 'Every ringed tile loses points: place the tile, then Skip the animal.' } : null; }
        var tg = bc === UI.ghost.c ? document.querySelector('#map .ghost') : document.querySelector('#map g.tgt[data-c="' + bc + '"]');
        return tg ? { target: tg, why: 'This tile scores the most for the ' + WM.ANI_NAME[G.hold.tok] + ' (' + (bd > 0 ? '+' + bd : '0') + ').' } : null;
      }
      var plan = WM.AI.plan(WM.clone(G), 'hard');
      if (G.stage === 'pick') { var i = plan.pick.t === 'take' ? plan.pick.i : plan.pick.ti; var t = document.querySelector('#mk .mt[data-i="' + i + '"]'); return t ? { target: t, why: plan.pick.t === 'free' ? 'Worth an acorn: it fits your patterns.' : 'Best fit for your patterns and habitats.' } : null; }
      if (G.stage === 'tile') { var c = WM.AI.choose(WM.clone(G), 'hard'); var e = document.querySelector('#map [data-c="' + (c && c.c) + '"]'); return e ? { target: e, why: 'Joins matching edges and leaves good animal spots.' } : null; }
      if (G.stage === 'tok') { var m = WM.AI.choose(WM.clone(G), 'hard'); if (m.t === 'back') return { target: document.getElementById('backB'), why: 'No spot helps: returning keeps your patterns clean.' }; var e2 = document.querySelector('#map [data-c="' + m.c + '"]'); return e2 ? { target: e2, why: 'This spot scores the most for its card.' } : null; }
      return null;
    }
  });
}
// one instruction line on the board: while a coach bubble or tutorial bubble is up, the status line steps aside
(function () {
  function sync() { var on = !!document.querySelector('.gxh-bub, .gxh-tx'); document.documentElement.classList.toggle('wm-coach', on); var cb = document.getElementById('coachb'); document.documentElement.classList.toggle('wm-cb', !!cb && !cb.hidden); }
  if (window.MutationObserver) new MutationObserver(sync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
