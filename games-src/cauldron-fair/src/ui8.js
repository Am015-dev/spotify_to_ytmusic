// ===================== part 8: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// A chapter is a normal game with the chapter's table, AI level, books and coach setting, plus one optional twist applied once
// right after CF.newGame (before any chip is drawn). The twists only exist here: the normal game's rules never change.
UI.camp = null;
const CAMP_CHAR = { wynne: 0, odo: 1, tamsin: 2, mirabel: 3, vesper: 2 };      // who sits where (cast id -> maker)
const CAMP_THIRD = { c5: 'wynne', c9: 'mirabel' };                              // the 3rd pot in the 3-player chapters
const CAMP_ME = [3, 2, 1, 0];                                                    // your maker: the first one not already a rival
function campTwist(g, tw) {
  if (!tw || !tw.id) return;
  const boss = g.players[1], me = g.players[0], n = tw.param;
  switch (tw.id) {
    case 'boss-rubies': boss.rubies += n; break;
    case 'boss-chip': CF._.give(g, boss, n, true); break;
    case 'boss-droplet': boss.droplet = n; break;
    case 'boss-lead': boss.vp = n; break;
    case 'crowded-bag': for (let k = 0; k < n; k++) CF._.give(g, me, 'W1', true); break;
  }
}
// act 1 teaches with the full coach; later acts have none. The player's own guide setting comes back outside the story.
function campCoach(def) {
  if (def) { if (UI.coachPref == null) UI.coachPref = UI.coach.level; UI.coach.level = def.hints ? 'full' : 'off'; }
  else if (UI.coachPref != null) { UI.coach.level = UI.coachPref; UI.coachPref = null; }
}
function campMetrics(g) {
  const mine = g.hist.filter(x => x.seat === 0), won = g.winner === 0, vp = g.players[0].vp;
  const best = Math.max.apply(null, g.players.slice(1).map(p => p.vp));
  return { won, score: vp, margin: vp - best, winScore: won ? vp : 0, booms: mine.filter(x => x.boom).length,
    best: mine.reduce((a, x) => Math.max(a, x.space || 0), 0), bought: mine.reduce((a, x) => a + ((x.bought && x.bought.length) || 0), 0), rounds: g.round };
}
function campIsWon(g, def) {
  const m = campMetrics(g), gl = def.goal || {}, needWin = !gl.winNotNeeded;
  if (needWin && !m.won) return false;
  switch (gl.type) {
    case 'score': return m.score >= gl.value;
    case 'margin': return m.margin >= gl.value;
    case 'custom': return m.bought >= gl.value;      // c2: buy chips
    default: return m.won;
  }
}
function campStart(def) {
  const s = def.setup || {}, op = def.opponent || {}, np = s.players || 2, lv = op.aiLevel || 'normal';
  const rv = [CAMP_CHAR[op.cast] != null ? CAMP_CHAR[op.cast] : 1];
  if (np > 2) { const t = CAMP_CHAR[CAMP_THIRD[def.id]]; rv.push(t != null && rv.indexOf(t) < 0 ? t : [0, 1, 2, 3].find(c => rv.indexOf(c) < 0)); }
  const me = CAMP_ME.find(c => rv.indexOf(c) < 0), lvBy = {}; rv.forEach(c => lvBy[c] = lv);
  UI.seed = s.seed != null ? s.seed : null;
  return newGame('vs', { camp: def, np, me, seats: rv, lvBy, sets: s.setMode != null ? s.setMode : 1 });
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; GXC.open(); }
function campGoalToast() { const d = UI.camp; if (d) toast('Goal: ' + d.goal.text + (d.twist ? ' ' + d.twist.text : '')); }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : '';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'cauldron', data: window.CAMPAIGN,
    startChapter: campStart,
    isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; campCoach(null); showStart(); },
    scores: g => g.players.map(p => p.vp),
    seats: g => g.players.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
