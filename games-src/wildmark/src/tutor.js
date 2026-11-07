/* Wildmark tutorial = a COACHED FIRST GAME (owner, 7 Nov: "not tap-tap"). A real 8-turn game against Bram with free choices from turn 1.
   Ward Elder Rowan explains each rule the first time it matters (one non-blocking bubble at a time, dismissable), praises or corrects a move
   in one line, and walks through the final score with the player's real numbers. Rules that never came up are listed at the end.
   Words: campaign.json prologue.coach[id]. Coverage list: TUTORIAL-COVERAGE.md. Proof: tutorial-end.js (plays any legal moves by UI taps). */
var TUT_GAME = 'wildmark', TUT_SEED = 11;
window.GXCOACH = { running: false, explained: [], done: false };   // read by the QA bot's coached mode
var COACH_RULES = ['goal', 'place', 'habitat', 'rotate', 'settle', 'bear', 'elk', 'salmon', 'hawk', 'fox', 'keystone', 'acornSpend', 'sweep3', 'wipe4', 'rival', 'majority', 'final', 'acornsEnd', 'tiebreak'];
function tutOn() { return false; }   // no forced steps any more: every legal move is allowed
function tutAct() { return true; }
function coachOn() { return UI.mode === 'coach' && G && UI.coach; }
function coachLine(id) { var c = window.CAMPAIGN && CAMPAIGN.prologue && CAMPAIGN.prologue.coach; return c && c[id] || ''; }
function coachSay(id, vars, force) {
  if (!coachOn()) return false; var C = UI.coach; if (C.seen[id] && !force) return false;
  var t = coachLine(id); if (!t) return false; if (vars) for (var k in vars) t = t.replace('{' + k + '}', vars[k]);
  if (COACH_RULES.indexOf(id) >= 0) C.seen[id] = 1;
  var b = $('#coachb'); if (!b) { b = document.createElement('div'); b.id = 'coachb'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); $('#board').appendChild(b); }
  b.innerHTML = '<i class="cface" aria-hidden="true"></i><p><b>Rowan</b> ' + esc(t) + '</p><button type="button" class="cx" id="coachX" aria-label="Dismiss">&times;</button>';
  b.dataset.rule = id; b.hidden = false; C.shown.push(id); window.GXCOACH.explained = Object.keys(C.seen); window.WM_COACH = { explained: Object.keys(C.seen), shown: C.shown.slice(), later: C.later || [] };
  return true;
}
function coachHide() { var b = $('#coachb'); if (b) b.hidden = true; }
// called after every render: say the rule that just became relevant (first match wins, so one bubble at a time)
function coachCheck() {
  if (!coachOn() || G.over) return; var C = UI.coach, me = G.seats[0], mine = myTurn();
  var sc = WM.score(me.env, me.acorns);
  if (me.done > C.done) {   // the player's turn just ended: one line on the move
    var d = sc.aniT - C.ani, best = null; WM.ANI.forEach(function (a) { var x = sc.ani[a] - C.aniBy[a]; if (x > 0 && (!best || x > best.x)) best = { a: a, x: x }; });
    C.done = me.done;
    if (G.last && G.last.acorn && G.last.seat === 0 && coachSay('keystone')) { }
    else if (d > 0 && C.fb < 3 && best) { C.fb++; coachSay('good', { n: best.x, card: WM.ANI_NAME[best.a] + 's (' + cinfo(best.a).title + ')' }, true); }
    else if (d <= 0 && C.fb < 3 && me.done <= 4) { C.fb++; coachSay('poor', null, true); }
  }
  C.ani = sc.aniT; WM.ANI.forEach(function (a) { C.aniBy[a] = sc.ani[a]; });
  if (sc.habT > C.hab && !C.seen.habitat) { C.hab = sc.habT; coachSay('habitat'); return; } C.hab = sc.habT;
  if ((G.wiped4 || 0) > C.w4) { C.w4 = G.wiped4 || 0; if (coachSay('wipe4')) return; }
  if (UI.showAI && !C.seen.rival) { coachSay('rival'); return; }
  if (!mine) return;
  if (G.stage === 'pick') {
    if (me.done === 0 && coachSay('goal')) return;
    if (!G.used3 && !G.opts.no3 && WM.triple(G) && coachSay('sweep3')) return;
    if (me.acorns > 0 && coachSay('acornSpend')) return;
    if (me.done >= 3 && coachSay('majority')) return;
  } else if (G.stage === 'tile') {
    if (!UI.ghost && coachSay('place')) return;
    if (UI.ghost && G.hold.tile.t.length > 1 && coachSay('rotate')) return;
  } else if (G.stage === 'tok') {
    var a = G.hold.tok;
    if (!C.seen[a]) { var spots = WM.tokSpots(me.env, a).length; C.seen.settle = 1; coachSay(a); if (!spots) { var b = $('#coachb p'); if (b) b.insertAdjacentText('beforeend', ' No tile shows one here, so Return it.'); } return; }
    if (coachSay('settle')) return;
  }
}
// the stacked market: the needed situations come up early, every choice stays free
function tutFix() {
  if (!coachOn() || G.over || G.stage !== 'pick' || G.cur !== 0) return;
  var n = G.seats[0].done, T = UI.coach.fixed; if (T['t' + n]) return; T['t' + n] = 1;
  var tok = function (a, slot) { var old = G.market.toks[slot]; if (old) G.bag[old]++; G.bag[a]--; G.market.toks[slot] = a; };
  var tile = function (t, slot) { G.market.tiles[slot] = Object.assign({ id: 900 + slot + n * 4 }, t); };
  if (n === 0) { tile({ t: ['forest'], a: ['bear'], key: true }, 0); tok('bear', 0); tok('elk', 1); tok('hawk', 2); tok('salmon', 3); }
  if (n === 1) { tile({ t: ['forest', 'meadow'], a: ['bear', 'fox'], key: false }, 1); tok('fox', 0); tok('bear', 1); tok('hawk', 2); tok('salmon', 3); }
  if (n === 2) { tok('elk', 0); tok('elk', 1); tok('elk', 2); tok('fox', 3); tile({ t: ['river'], a: ['salmon'], key: true }, 2); }
  if (n === 3) {   // four alike: the market clears them by itself (the engine's automatic wipe, shown once)
    ['hawk', 'hawk', 'hawk', 'hawk'].forEach(function (a, i) { tok(a, i); });
    var pool = WM.ANI.filter(function (a) { return a !== 'hawk'; });
    for (var i = 0; i < 4; i++) { G.bag.hawk++; var a = pool[i % pool.length]; G.bag[a]--; G.market.toks[i] = a; }
    G.wiped4 = (G.wiped4 || 0) + 1; G.log.push('Four Hawk tokens: the market is wiped.');
  }
  render();
}
// final scoring walk-through with the player's real numbers, then "things you'll meet later"
function coachFinalHTML() {
  if (UI.mode !== 'coach' || !G || !G.over || !UI.coach) return '';
  var C = UI.coach, r = G.res[0], b = G.res[1], tb = 0, hb = 0; WM.TER.forEach(function (t) { hb += r.hab[t]; tb += r.bonus[t] || 0; });
  ['final', 'acornsEnd', 'tiebreak', 'majority'].forEach(function (id) { C.seen[id] = 1; });
  var later = COACH_RULES.filter(function (id) { return !C.seen[id]; }); C.later = later;
  window.WM_COACH = { explained: Object.keys(C.seen), shown: C.shown.slice(), later: later };
  window.GXCOACH = { running: false, explained: Object.keys(C.seen), later: later, done: true };
  var h = '<div class="cfinal"><p class="ch"><i class="cface" aria-hidden="true"></i><b>Rowan</b> ' + esc(coachLine('final')) + '</p><ol>';
  h += '<li>Animals by their cards: ' + WM.ANI.map(function (a) { return WM.ANI_NAME[a] + ' ' + r.ani[a]; }).join(', ') + ' = <b>' + r.aniT + '</b></li>';
  h += '<li>Biggest joined habitat per terrain: <b>' + hb + '</b>, plus <b>' + tb + '</b> bonus for beating ' + esc(G.seats[1].name) + ' in a terrain (+2, a tie +1).</li>';
  h += '<li>' + esc(coachLine('acornsEnd')) + ' You kept <b>' + r.acorns + '</b>.</li>';
  h += '<li>Total <b>' + r.total + '</b> against ' + esc(G.seats[1].name) + ' <b>' + b.total + '</b>. ' + esc(coachLine('tiebreak')) + '</li></ol>';
  if (later.length) h += '<p class="ch2">' + esc(CAMPAIGN.prologue.later || 'Things you will meet later') + '</p><ul>' + later.map(function (id) { return '<li>' + esc(coachLine(id)) + '</li>'; }).join('') + '</ul>';
  return h + '</div>';
}
function coachEnd() {   // after the result is drawn: the tutorial counts as done, and Play again starts a real game
  if (UI.mode !== 'coach') return; try { GXT.markDone(TUT_GAME); } catch (e) { } coachHide();
  var pro = UI.coachPrologue; UI.mode = 'quick'; UI.cfg = { np: 2, humans: 1, ai: 'normal', turns: 20 };
  if (pro && window.GXC && CAMPAIGN.chapters[0]) { var t = $('#titleB'); if (t) { t.textContent = 'Start the story'; t.id = 'coachStory'; } }
}
function storyOpen() { if (!window.GXC) return; $('#start').hidden = true; GXC.open(); }   // the title steps aside so its buttons never sit under the map   // Story opens its map; the coached first game is the map's Tutorial button (and the title's New here?)
function tutLeave() { UI.mode = 'quick'; UI.tutor = false; }
function tutStart(o) {
  try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { }
  try { if (window.GXT && GXT.running()) GXT.stop(); } catch (e) { }
  var P = window.CAMPAIGN && CAMPAIGN.prologue || {};
  UI.coachPrologue = !!(o && o.prologue); UI.prefs.played = 1; savePrefs();
  UI.coach = { seen: {}, shown: [], fixed: {}, done: 0, ani: 0, aniBy: {}, hab: 0, w4: 0, fb: 0 };
  WM.ANI.forEach(function (a) { UI.coach.aniBy[a] = 0; });
  window.GXCOACH = { running: true, explained: [], done: false };
  UI.mode = 'coach'; newGame({ np: 2, humans: 1, ai: 'easy', seed: TUT_SEED, turns: P.turns || 8, names: [null, 'Bram'] }); UI.mode = 'coach';
  tutFix(); coachCheck();
}
document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('#coachX, #coachStory'); if (!t) return; if (t.id === 'coachX') coachHide(); else { $('#rs').hidden = true; showTitle(); GXC.play(CAMPAIGN.chapters[0].id); } });
