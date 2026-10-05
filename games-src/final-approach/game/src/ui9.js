// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// Each chapter is one airport with its own crew line-up and (at most) one twist. Twists exist only here; the normal rules never change.
// aiLevel is the co-pilot's skill (a sharper Ravi makes the landing EASIER), see CAMPAIGN-DESIGN.md.
UI.camp = null;
const CAMP_SEATS = () => [{ name: 'You', me: true }, { name: 'Ravi', ai: (UI.camp && UI.camp.opponent && UI.camp.opponent.aiLevel) || 'normal' }];
// applied right after FA.newGame (called from newGame in ui3.js)
function campTwist(g, t) {
  if (!t || !t.id) return; const n = +t.param || 0;
  switch (t.id) {
    case 'extra-plane': { const at = Math.min(3, g.planes.length - 1) - 1; if (at >= 0 && FA.planesOnTrack(g) + n <= D.planeSupply) g.planes[at] += n; break; }
    case 'short-fuel': if (g.mods.kero || g.mods.leak) g.pl.kero = D.keroStart - n; break;
    case 'red-altitude': g.alt = 'rb'; break;
    case 'held-reroll': g.rrHand = Math.max(0, g.rrHand - n); break;
    case 'tilted-start': g.pl.axis = n; break;
    case 'spare-coffee': g.coffee = Math.min(D.coffeeMax, n); break;
  }
}
function campWon(g) { return !!(g && g.result && g.result.win); }
function campMetrics(g) {
  const u = g.used || {};
  return { won: campWon(g), coffee: g.coffee, rerolls: g.rrHand, fuel: g.pl.kero, coffeeSpent: u.coffeeSpend || 0, radio: u.radioClear || 0, brakeMargin: g.landSpeed >= 0 ? FA.brakeVal(g) - g.landSpeed : 0 };
}
function campStart(def) {
  const s = def.setup || {}; UI.seed = s.seed != null ? s.seed : null;
  closeRS(); try { GX.close(); } catch (e) { }
  newGame('vs', { scenario: s.scenario || 'g1', role: s.role || 0, level: (def.opponent && def.opponent.aiLevel) || 'normal', abil: [], camp: def, tipsOff: !def.hints });
  UI.camp = def; UI.coach.level = def.hints ? 'full' : 'off';
  try { toast(def.goal.text.length > 70 ? def.goal.text.slice(0, 67) + '...' : def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; closeRS(); GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return 'Ten airports, three bosses';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' airports done' : 'Ten airports, three bosses';
  } catch (e) { return 'Ten airports, three bosses'; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'approach', data: window.CAMPAIGN, startChapter: campStart, isWon: g => campWon(g), metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => [campWon(g) ? 1 : 0, 0], seats: () => CAMP_SEATS()
  });
}
campInit();
