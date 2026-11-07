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
  UI.campStart = start;
  document.addEventListener('click', function (e) { var b = e.target && e.target.closest && e.target.closest('.gxc-score'); if (b) b.setAttribute('data-opened', String(Date.now())); }, true);
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  // story text comes from src/story.js (EC_STORY): chapter intros and win outros replace campaign.json's lines; loss outros and boss lines are added here
  var ST = (window.EC_STORY || {}).chapters || {}, L = function (a) { return (a || []).map(function (x) { return { who: x[0], text: x[1] }; }); };
  window.CAMPAIGN.chapters.forEach(function (c) { var s = ST[c.id]; if (!s) return; if (s.intro) c.intro = L(s.intro); if (s.win) c.outro = L(s.win); });
  UI.bossLine = function (when) { var d = UI.camp, s = d && ST[d.id], t = s && (when === 'pre' ? s.bossPre : s.bossPost); if (!t || typeof GXC === 'undefined') return Promise.resolve(); return GXC.scene([{ who: 'rival', text: (d.opponent && d.opponent.name ? d.opponent.name + ': ' : '') + t }], { def: d, title: d.title, last: when === 'pre' ? 'Fight' : 'Continue' }); };
  GXC.init({
    game: 'emberclimb', artBase: 'media/', data: window.CAMPAIGN,
    startChapter: start,
    isWon: function (G) { return !!G.won; },
    metrics: function (G) { return { won: !!G.won, hpPct: pct(G), gold: G.gold }; },
    headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Guide'; b.setAttribute('aria-label', 'Replay the guide'); b.addEventListener('click', function () { UI.camp = { setup: { tutorial: 1 }, id: 'guide' }; UI.tutStart(); }); return [b]; },
    portrait: function (who, size) { if (!window.EC_A) return null; var e = EC_A('cast-' + who, '', { kind: 'portrait', ph: who === 'rival' ? '#5a4a3a' : '#a8431f' }); e.style.width = e.style.height = (size || 64) + 'px'; e.style.borderRadius = '50%'; e.style.backgroundSize = 'cover'; return e; },
    onExit: exitCamp,
    scores: function (G) { return [G.floor || 0]; },
    seats: function () { return [{ name: 'You', me: true }]; }
  });
  GXC.result = function (r) { var s = r && r.def && ST[r.def.id], pre = (r && !r.won && s && s.lose) ? GXC.scene(L(s.lose), { def: r.def, title: r.def.title, last: 'Continue' }) : Promise.resolve(); return pre.then(function () { return UI.showResult(r); }).then(function (p) { return p === 'again' ? 'retry' : p === 'next' ? 'next' : 'map'; }); };   // our own result screen (cause, floors, deck, relics, stars)
  var open0 = GXC.open; GXC.open = function () { try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); } catch (e) { } return open0.apply(this, arguments); };   // opening Story while a guide runs ends the guide
})();
