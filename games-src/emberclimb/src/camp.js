// Story mode through the shared campaign kit (gx-campaign.js); chapter data in campaign.json, notes in CAMPAIGN-DESIGN.md.
(function () {
  var E = EC.E;
  function pct(G) { var a = 0, m = 0; G.hs.forEach(function (h) { a += Math.max(0, h.hp); m += h.mhp; }); return m ? Math.round(100 * a / m) : 0; }
  function exitCamp() { UI.camp = null; UI.fin = 0; window.EC_NOSAVE = 0; UI.mode = 'title'; UI.sub = ''; UI.ov = null; UI.render(); }
  UI.campExit = exitCamp;
  function start(def) {
    UI.camp = def; UI.fin = 0; UI.ov = null; UI.sub = ''; window.EC_NOSAVE = 1;
    if (def.setup && def.setup.tutorial) { UI.tutStart(); return; }
    var o = JSON.parse(JSON.stringify(def.setup || {}));
    if (def.easy && o.hpPct) o.hpPct = Math.min(o.hpPct, 80);
    E.newGame(o); UI.mode = 'game'; UI.sel = -1; UI.render();
  }
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'emberclimb', artBase: 'media/', data: window.CAMPAIGN,
    startChapter: start,
    isWon: function (G) { return !!G.won; },
    metrics: function (G) { return { won: !!G.won, hpPct: pct(G), gold: G.gold }; },
    headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Guide'; b.setAttribute('aria-label', 'Replay the guide'); b.addEventListener('click', function () { UI.camp = { setup: { tutorial: 1 }, id: 'guide' }; UI.tutStart(); }); return [b]; },
    onExit: exitCamp,
    scores: function (G) { return [G.floor || 0]; },
    seats: function () { return [{ name: 'You', me: true }]; }
  });
})();
