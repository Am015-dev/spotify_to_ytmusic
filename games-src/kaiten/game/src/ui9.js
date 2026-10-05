// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// A chapter is a real 3-round meal against named chefs. Twists exist only here; the normal rules never change.
UI.camp = null;
const CAMP_BASE = { makiFut: KK.AI.params.makiFut, pudFut: KK.AI.params.pudFut };
function campParams(def) {
  const P = KK.AI.params, t = def && def.twist; P.makiFut = CAMP_BASE.makiFut; P.pudFut = CAMP_BASE.pudFut;
  if (t && t.id === 'roll-fever') P.makiFut = CAMP_BASE.makiFut * (t.param || 1);
  if (t && t.id === 'sweet-tooth') P.pudFut = CAMP_BASE.pudFut * (t.param || 1);
}
function campMetrics(g) {
  const sum = f => g.rs.reduce((a, r) => a + (r[0][f] || 0), 0), T = g.final ? g.final.totals : [0, 0];
  let rollWins = 0; g.rs.forEach(r => { const m = Math.max(...r.map(x => x.maki)); if (m > 0 && r[0].maki === m) rollWins++; });
  const over = g.phase === 'over';
  return { won: over && g.winner === 0, score: T[0], margin: T[0] - Math.max(...T.slice(1)), bunPts: sum('dumpling'), fishPts: sum('sashimi'), rollPts: sum('maki'), rollWins,
    pasteBonus: sum('wasabi'), custardPts: g.final ? g.final.puddingPts[0] : 0, bestRound: Math.max(...g.rs.map(r => r[0].total)), wastedPaste: g.rs.reduce((a, r) => a + (r[0].counts.wasabiUnused || 0), 0) };
}
function campIsWon(g, def) {
  if (!g || g.phase !== 'over' || g.winner !== 0) return false; const m = campMetrics(g), gl = def.goal || {};
  if (gl.type === 'score') return m.score >= gl.value;
  if (gl.type === 'custom') { const k = def.id === 'c2' ? m.fishPts : def.id === 'c3' ? m.rollWins : null; return k == null || k >= gl.value; }
  return true;
}
function campStart(def) {
  const s = def.setup || {}, t = def.twist || null;
  campParams(def);
  UI.seed = s.seed != null ? s.seed : null;
  newGame('vs', { camp: def, np: s.np, seats: s.seats, level: s.level, lv: s.lv, twist: t });
  UI.camp = def;
  UI.coach.level = def.hints ? 'full' : 'off'; UI.coach.keep = !!def.hints; UI.coach.userOff = !def.hints; UI.tip = null; render();
  try { toast('Goal: ' + def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; closeRS(); GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) { if (UI.camp) { UI.coach.keep = false; UI.coach.userOff = false; } UI.camp = null; campParams(null); } return _ng.apply(this, arguments); }; }
{ const _sf = showFinal; showFinal = function () { if (campOn()) { UI.overShown = true; closeRS(); campFinish(); return; } return _sf.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : 'Ten chapters, three bosses';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'kaiten', data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; campParams(null); showStart(); },
    scores: g => (g.final ? g.final.totals : g.players.map(() => 0)), seats: g => g.players.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
