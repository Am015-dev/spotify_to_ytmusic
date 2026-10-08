// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// Twists exist only here; the normal rules never change. The boss seat is seat 1.
UI.camp = null;
function campTwist(def) {
  const t = def && def.twist; if (!t || !G) return; const n = t.param || 0;
  if (t.id === 'thin-forest') G.forest = G.forest.slice(0, n);
  else if (t.id === 'boss-extra-hand' && G.players[1]) { const p = G.players[1]; let k = 0; while (k < n && p.hand.length < HB.HAND && G.deck.length) { p.hand.push(G.deck.pop()); k++; } }
  else if (t.id === 'boss-pantry' && G.players[1]) { const r = G.players[1].res; r.twig += n; r.resin += n; r.berry += n; }
}
function campMetrics(g) {
  const ov = g.over; if (!ov) return { won: false };
  const me = ov.scores[0], won = g.grim ? !!ov.win : (ov.winner === 0 && !ov.tie);
  let best = 0; if (g.grim) best = ov.grim.total; else ov.scores.forEach((s, i) => { if (i) best = Math.max(best, s.total); });
  const evs = g.bev.filter(e => e.o === 0).length + g.sev.filter(e => e.o === 0).length;
  const p = g.players[0];
  return { won, score: me.total, margin: me.total - best, city: HB.cityCount(g, 0), events: evs, specialEvents: g.sev.filter(e => e.o === 0).length,
    occupied: p.city.filter(e => e.occ).length, green: p.city.filter(e => HB.cardOf(e.id).color === 'green').length, journey: me.journey, left: me.left };
}
function campIsWon(g, def) {
  const m = campMetrics(g); if (!m.won) return false; const gl = def.goal || {};
  if (gl.type === 'custom' || gl.type === 'score') { const need = gl.value || 0, id = def.id;
    if (id === 'c2') return m.occupied >= need; if (id === 'c3') return m.green >= need; if (id === 'c6') return m.events >= need; if (id === 'c9') return m.specialEvents >= need;
    if (gl.type === 'score') return m.score >= need; }
  return true;
}
function campStart(def) {
  const s = def.setup || {}, names = [def.opponent.name];
  if (def.id === 'c10') names.push('Quill'); else names.push('Bramble');
  UI.coach = { level: def.hints ? 'full' : 'off', seen: {} };
  const o = { camp: Object.assign({}, def, { names }), np: s.np || 2, level: s.level || 'normal', solo: s.solo || 1 };
  UI.seed = s.seed != null ? s.seed : null;
  newGame(s.mode === 'solo' ? 'solo' : 'vs', o);
  UI.camp = def; UI.coach.level = def.hints ? 'full' : 'off';
  try { toast('Goal: ' + def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; try { GX.close(); } catch (e) { } GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
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
    game: 'hollowbough', headButtons: () => { const b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', () => { GXC.close(); tutStart(); }); return [b]; }, data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => g.over ? g.over.scores.map(s => s.total) : [], seats: g => g.players.map((p, i) => ({ name: p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
