/* Redline Rally Story mode: the shared chapter map (gx-campaign.js) wired to this game. Data: campaign.json, design: CAMPAIGN-DESIGN.md.
   A chapter is a normal race (the game's own rules) with the chapter's track, laps, rivals and skill, plus an optional twist (upgrades, corner limits -1, 4 starting heat). */
UI.cmpDef = null;
function campPlace(g) { var me = g.cars.filter(function (c) { return c.human; })[0] || g.cars[0]; return rankList(g).indexOf(me.i) + 1; }
function campWon(g, def) { def = def || UI.cmpDef; return !!(g && g.over && campPlace(g) <= ((def && def.goal && def.goal.value) || 1)); }
function campMetrics(g) { var me = g.cars.filter(function (c) { return c.human; })[0] || g.cars[0]; return { won: campWon(g), place: campPlace(g), heat: me.stats.heat, spins: me.stats.spins, slips: me.stats.slips, rounds: g.round }; }
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'redline-rally', data: window.CAMPAIGN,
    startChapter: function (def) {
      var s = def.setup || {}, tw = def.twist && def.twist.id; UI.cmpDef = def;
      startGame({ track: s.track, laps: s.laps, opp: s.opp, hum: 1, diff: (def.opponent && def.opponent.aiLevel) || s.diff || 'normal', upg: !!s.upg || tw === 'upgrades',
        climit: tw === 'tight' ? (def.twist.param || -1) : 0, lowheat: tw === 'lowheat', cmp: { id: def.id } });
    },
    isWon: function (g, def) { return campWon(g, def); },
    metrics: campMetrics,
    onExit: function () { UI.cmpDef = null; showTitle(); },
    seats: function (g) { return g.cars.map(function (c) { return { name: c.name, me: !!c.human, ai: c.human ? undefined : g.diff }; }); }
  });
}
/* Story button: the first time, the guide runs first (it is also chapter 1's lesson), then the map opens */
function campOpen() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) { tutStart({ then: function () { GXC.open(); } }); return; }
  closeModal(); GXC.open();
}
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    var p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(function (c) { return p.ch[c.id] && p.ch[c.id].beaten; }).length;
    var nx = ch.filter(function (c) { return !(p.ch[c.id] && p.ch[c.id].beaten); })[0];
    return '<span>' + (n ? n + ' of ' + ch.length + ' chapters done' + (nx ? ', next: ' + esc(nx.title) : '') : 'Nine chapters, three acts, bosses') + '</span>';
  } catch (e) { return ''; }
}
campInit();
