// Coverage: mixed computer play and random legal moves over every scenario, invariants after EVERY performMove, and a list of every rule path that fired.
//   node cover.js [games=600]
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const N = +process.argv[2] || 600; let r = 424242; const rnd = n => { r = (Math.imul(r, 1103515245) + 12345) >>> 0; return Math.floor(r / 4294967296 * n); };
const fired = {}; let applies = 0, problems = 0, games = 0, wins = 0; const probs = []; const P = m => { problems++; if (probs.length < 12) probs.push(m); };
const LV = ['easy', 'normal', 'random', 'random', 'normal', 'random'];
const ALLAB = Object.keys(D.abilities); const scs = D.scenarios;
const REQUIRED = ['win', 'lose_collision', 'lose_corridor', 'lose_fuel', 'lose_mandatory', 'lose_overshoot', 'lose_short', 'lose_spin', 'lose_checks', 'abil_adapt', 'abil_antic', 'abil_control', 'abil_mastery', 'abil_sync', 'abil_together', 'adv0', 'adv1', 'adv2', 'axisMove', 'brakes', 'coffeeGain', 'coffeeSpend', 'flaps', 'gear', 'iceCol', 'internTrain', 'keroDie', 'radioClear', 'rerollUse', 'toss', 'trafficRoll', 'place_axis', 'place_engines', 'place_radio', 'place_gear', 'place_flaps', 'place_brakes', 'place_conc', 'place_ice', 'lose_speed', 'timeout'];
for (let g = 0; g < N; g++) {
  const sc = scs[g % scs.length]; const lv = [LV[rnd(LV.length)], LV[rnd(LV.length)]];
  let abil = []; if (sc.ab) { const pool = ALLAB.slice(); for (let i = 0; i < sc.ab; i++) abil.push(pool.splice(rnd(pool.length), 1)[0]); }
  if (g % 7 === 3) { const pool = ALLAB.slice(); abil = []; for (let i = 0; i < 1 + rnd(3); i++) abil.push(pool.splice(rnd(pool.length), 1)[0]); }
  const G = FA.newGame({ scenario: sc.id, seed: 9000 + g, abil, ai: [null, null] }); games++;
  let steps = 0, timeoutsLeft = 1;
  while (!G.result && steps++ < 700) {
    const seats = FA.pending(G); if (!seats.length) { P(sc.id + ': nothing pending phase ' + G.phase); break; }
    const s = seats[rnd(seats.length)]; const mv = FA.validMoves(G, s);
    if (!mv.length) { P(sc.id + ': no legal move seat ' + s + ' phase ' + G.phase + ' pend ' + JSON.stringify(G.pend)); break; }
    let m;
    if (lv[s] === 'random') { const ms = mv.filter(x => x.t !== 'timeout' && x.t !== 'toss' || rnd(12) === 0); m = (ms.length ? ms : mv)[rnd((ms.length ? ms : mv).length)]; if (G.mods.real && timeoutsLeft && rnd(60) === 0) { const t = mv.find(x => x.t === 'timeout'); if (t) { m = t; timeoutsLeft--; } } }
    else m = FA.AI.move(G, s, lv[s]);
    if (!m) { P(sc.id + ': AI returned no move'); break; }
    // every move the validator offers must be accepted by the performer (spot check one other legal move on a clone)
    if (steps % 5 === 0) { const alt = mv[rnd(mv.length)], c = FA.clone(G); const rr = FA.performMove(c, alt, s); if (!rr.ok) P(sc.id + ': valid move refused ' + JSON.stringify(alt) + ' ' + rr.error); }
    const res = FA.performMove(G, m, s); applies++;
    if (!res.ok) { P(sc.id + ': refused ' + JSON.stringify(m) + ' ' + res.error); break; }
    const e = FA.checkInvariants(G); if (e.length) { P(sc.id + ': invariant ' + e.join(';')); break; }
    if (JSON.stringify(G).length > 400000) { P('state grew'); break; }
  }
  if (!G.result && steps >= 700) P(sc.id + ': stall');
  if (G.result && G.result.win) wins++;
  for (const k in G.used) fired[k] = (fired[k] || 0) + G.used[k];
  // saved state round-trips
  if (g % 25 === 0) { const j = JSON.parse(JSON.stringify(G)); const e = FA.checkInvariants(j); if (e.length) P('restored state invalid ' + e.join(';')); }
}
// directed: a die with no legal place must be offered as a toss and be accepted (random play almost never reaches it)
{ const G = T.round('g1', 11, [3, 3, 3, 3], [3, 3, 3, 3]); for (const k of G.keys) if (!G.slots[k]) G.slots[k] = { s: 0, v: 1, k: 'd' }; G.turn = 0;
  const mv = FA.validMoves(G, 0); const tm = mv.filter(m => m.t === 'toss'); if (mv.some(m => m.t === 'place') || !tm.length) P('directed toss: expected toss and no place, got ' + JSON.stringify(mv.slice(0, 4))); else { const r = FA.performMove(G, tm[0], 0); if (!r.ok) P('toss refused'); else for (const k in G.used) fired[k] = (fired[k] || 0) + G.used[k]; } }
// directed: stepping past the airport is an overshoot (random play loses to the other rules first)
{ const G = T.round('g1', 12, [3, 6, 1, 1], [3, 6, 1, 1]); G.pl.pos = G.planes.length; G.planes.fill(0); G.planes[G.planes.length - 1] = 0; T.axisEng(G, 3, 6, 3, 6); if (!(G.result && G.result.why === 'overshoot')) P('directed overshoot: expected an overshoot loss, got ' + JSON.stringify(G.result && G.result.why)); else for (const k in G.used) fired[k] = (fired[k] || 0) + G.used[k]; }
const missing = REQUIRED.filter(k => !fired[k]);
console.log('cover: ' + games + ' games, ' + applies + ' moves, ' + wins + ' landed, ' + problems + ' problems, scenarios ' + scs.length);
console.log('fired:', Object.keys(fired).sort().map(k => k + '=' + fired[k]).join(' '));
if (missing.length) { console.log('NEVER FIRED:', missing.join(', ')); problems += missing.length; }
for (const p of probs) console.log(p);
console.log(problems ? 'COVER FAILED' : 'COVER PASSED'); process.exit(problems ? 1 : 0);
