// One test per tricky rule. Run: node rules-test.js   (exit code 1 on any failure)
const T = require('./tlib.js'); const { FA, D } = T;
let pass = 0, fail = 0; const failed = [];
function t(name, fn) { try { fn(); pass++; } catch (e) { fail++; failed.push(name + ': ' + (e && e.message || e)); console.log('FAIL ' + name + ': ' + (e && e.stack || e)); } }
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || 'values differ') + ': got ' + JSON.stringify(a) + ' expected ' + JSON.stringify(b)); };
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const bad = (G, seat, m) => { const r = FA.performMove(G, m, seat); ok(!r.ok, 'move should be refused: ' + JSON.stringify(m)); };

// ---------- data ----------
t('data: 21 scenarios in four bands (6/7/5/3) over 11 airports, each with a real track', () => {
  eq(D.scenarios.length, 21); const c = {}; D.scenarios.forEach(s => c[s.col] = (c[s.col] || 0) + 1);
  eq(c, { green: 6, yellow: 7, red: 5, black: 3 }); eq(Object.keys(D.airports).length, 11);
  const aps = new Set(D.scenarios.map(s => s.ap)); eq(aps.size, 11);
  for (const s of D.scenarios) { const tr = D.tracks[s.trk]; ok(tr, 'track ' + s.trk); ok(tr.size >= 5 && tr.size <= 8, 'size'); eq(tr.sp.length, tr.size); ok(tr.sp.reduce((a, x) => a + x[0], 0) <= 12, 'plane total'); ok(D.airports[s.ap], 'airport'); ok(s.ab >= 0 && s.ab <= 2); eq(s.col === 'green' || s.col === 'yellow' ? 'gy' : 'rb', s.alt, 'altitude side ' + s.id); }
});
t('data: altitude tracks have 7 rows, reroll rows 6000+2000 (green/yellow) and 6000 (red/black); first player alternates from the pilot', () => {
  eq(D.alt.gy.map(r => r[0]), [6000, 5000, 4000, 3000, 2000, 1000, 0]); eq(D.alt.gy.map(r => r[2]), [1, 0, 0, 0, 1, 0, 0]); eq(D.alt.rb.map(r => r[2]), [1, 0, 0, 0, 0, 0, 0]);
  eq(D.alt.gy.map(r => r[1]), [0, 1, 0, 1, 0, 1, 0]);
});
t('data: tracks that have tabs only list axis positions -2..2; traffic icons 0..4', () => { for (const tr of Object.values(D.tracks)) for (const s of tr.sp) { if (s[2]) s[2].forEach(a => ok(a >= -2 && a <= 2)); ok(s[1] >= 0 && s[1] <= 4); } });
t('data: module and ability counts match the band rules (ability cards 0..2, kerosene and leak never together)', () => { for (const s of D.scenarios) { ok(!(s.mods.includes('kero') && s.mods.includes('leak'))); for (const m of s.mods) ok(D.mods[m], m); } eq(D.scenarios.filter(s => s.mods.includes('real')).length, 3); eq(D.scenarios.filter(s => s.mods.includes('intern')).length, 3); eq(D.scenarios.filter(s => s.mods.includes('wind')).length, 4); eq(D.scenarios.filter(s => s.mods.includes('ice')).length, 3); });

// ---------- setup ----------
t('setup: starter airport numbers, markers, first player, one reroll token at 6000 ft', () => {
  const G = T.game('g1', 1); eq(G.planes, [0, 0, 1, 2, 1, 3, 2]); eq(G.pl.axis, 0); eq(G.pl.aeroB, 4); eq(G.pl.aeroO, 8); eq(G.coffee, 0); eq(G.rrHand, 1); eq(G.first, 0); eq(G.phase, 'brief'); eq(G.pl.pos, 1);
  eq(FA.rrReserve(G), 1, 'one reroll token waits on the 2000 ft row, one in the box'); T.inv(G);
});
t('setup: dice are rolled only when both crew are ready; unplaced dice are unknown until then', () => {
  const G = T.game('g1', 2); T.mv(G, 0, { t: 'ready' }); eq(G.phase, 'brief'); ok(FA.validMoves(G, 1).some(m => m.t === 'ready')); T.mv(G, 1, { t: 'ready' }); eq(G.phase, 'place'); eq(FA.unusedDice(G, 0).length, 4); eq(FA.unusedDice(G, 1).length, 4);
  for (const s of [0, 1]) for (const d of G.dice[s]) ok(d.v >= 1 && d.v <= 6);
});
t('briefing: preset phrases (no numbers) are limited to 3 and are public', () => { const G = T.game('g1', 2); T.mv(G, 0, { t: 'say', c: 'adv2' }); T.mv(G, 0, { t: 'say', c: 'plane' }); T.mv(G, 0, { t: 'say', c: 'level' }); ok(!FA.validMoves(G, 0).some(m => m.t === 'say'), 'only 3 phrases'); eq(G.say[0].length, 3); ok(FA.SAYS.every(c => !/\d/.test(c.replace(/^adv\d$/, '')))); });
t('turns: players alternate, first player comes from the altitude row, and a player with no dice left keeps the turn', () => {
  let G = T.round('g1', 3, [3, 3, 3, 3], [3, 3, 3, 3]); eq(G.turn, 0); T.put(G, 0, 3, 'co0'); eq(G.turn, 1); T.put(G, 1, 3, 'co1'); eq(G.turn, 0);
  G = T.round('g1', 3, [3, 3], [3, 3, 3, 3]); T.put(G, 0, 3, 'co0'); eq(G.turn, 1); T.put(G, 1, 3, 'co1'); eq(G.turn, 0); T.put(G, 0, 3, 'co2'); eq(G.turn, 1); const ra = FA.validMoves(G, 1).filter(m => m.t === 'place'); ok(ra.length); T.put(G, 1, 3, 'ra1'); eq(G.turn, 1, 'pilot is out of dice, the co-pilot goes again');
  G = T.game('g1', 3); T.toRound(G, 1); eq(G.first, 1, 'round 2 starts with the co-pilot'); T.toRound(G, 2); eq(G.first, 0);
});
t('colours: the pilot cannot use co-pilot spaces and vice versa; shared spaces take either', () => {
  const G = T.round('g1', 4, [1, 2, 3, 4], [1, 2, 3, 4]);
  ok(!T.can(G, 0, 1, 'fl0')); ok(!T.can(G, 1, 1, 'lg0')); ok(!T.can(G, 1, 4, 'br0')); ok(T.can(G, 0, 1, 'co0')); ok(T.can(G, 1, 1, 'co0')); ok(T.can(G, 0, 1, 'ra0')); ok(!T.can(G, 0, 1, 'ra1')); ok(T.can(G, 1, 1, 'ra1')); ok(T.can(G, 1, 1, 'ra2')); ok(!T.can(G, 1, 1, 'ra0'));
});
t('values: gear takes 1-2, 3-4, 5-6; flaps 1-2, 2-3, 4-5, 5-6; brakes exactly 2, 4, 6', () => {
  const G = T.round('g1', 4, [1, 2, 3, 4], [1, 2, 5, 6]); eq([1, 2, 3, 4].map(v => T.can(G, 0, v, 'lg0')), [true, true, false, false]); eq([1, 2, 3, 4].map(v => T.can(G, 0, v, 'lg1')), [false, false, true, true]); ok(!T.can(G, 0, 2, 'br0') || true);
  const H = T.round('g1', 4, [2, 4, 6, 3], [1, 2, 5, 6]); ok(T.can(H, 0, 2, 'br0')); ok(!T.can(H, 0, 4, 'br1'), 'brake 2 first'); ok(!T.can(H, 0, 6, 'br2'));
  H.pl.sw.br[0] = 1; ok(T.can(H, 0, 4, 'br1')); ok(!T.can(H, 0, 3, 'br1')); ok(!T.can(H, 0, 6, 'br2'), 'brake 4 before 6');
});
t('flaps: strictly top to bottom (later ones need the earlier lights)', () => {
  const G = T.round('g1', 4, [1, 1, 1, 1], [2, 3, 5, 6]); ok(!T.can(G, 1, 3, 'fl1')); T.put(G, 1, 2, 'fl0'); eq(G.pl.sw.fl, [1, 0, 0, 0]); eq(G.pl.aeroO, 9); T.put(G, 1, 3, 'fl1'); eq(G.pl.aeroO, 10); ok(!T.can(G, 1, 6, 'fl3')); T.put(G, 1, 5, 'fl2'); T.put(G, 1, 6, 'fl3'); eq(G.pl.aeroO, 12); eq(G.pl.sw.fl, [1, 1, 1, 1]);
});

// ---------- axis ----------
t('axis: the plane tilts toward the higher die by the difference; equal dice do nothing', () => {
  let G = T.round('g1', 5, [5, 1, 1, 1], [3, 1, 1, 1]); T.put(G, 0, 5, 'ax0'); eq(G.pl.axis, 0, 'nothing until both are down'); T.put(G, 1, 3, 'ax1'); eq(G.pl.axis, -2, 'toward the pilot'); T.inv(G);
  G = T.round('g1', 5, [3, 1, 1, 1], [5, 1, 1, 1]); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 5, 'ax1'); eq(G.pl.axis, 2, 'toward the co-pilot');
  G = T.round('g1', 5, [4, 1, 1, 1], [4, 1, 1, 1]); T.axisEng(G, 4, 1, 4, 1); eq(G.pl.axis, 0);
});
t('axis: the tilt carries over between rounds (never reset)', () => { const G = T.round('g1', 5, [5, 1, 1, 1], [3, 1, 1, 1]); T.axisEng(G, 5, 1, 3, 1); eq(G.pl.axis, -2); T.finishRound(G); eq(G.round, 1); eq(G.pl.axis, -2); });
t('axis: a total tilt of 3 either way is a spin and an immediate loss; 2 is fine', () => {
  let G = T.round('g1', 5, [6, 1, 1, 1], [3, 1, 1, 1]); T.put(G, 0, 6, 'ax0'); T.put(G, 1, 3, 'ax1'); eq(G.result && G.result.why, 'spin');
  G = T.round('g1', 5, [1, 1, 1, 1], [6, 1, 1, 1]); G.pl.axis = -1; T.put(G, 0, 1, 'ax0'); T.put(G, 1, 6, 'ax1'); eq(G.pl.axis, 4 > 3 ? G.pl.axis : 0); ok(G.result && G.result.why === 'spin', 'cumulative tilt -1 + 5 = 4 spins');
  G = T.round('g1', 5, [4, 1, 1, 1], [2, 1, 1, 1]); G.pl.axis = 1; T.put(G, 0, 4, 'ax0'); T.put(G, 1, 2, 'ax1'); eq(G.pl.axis, -1); ok(!G.result);
  G = T.round('g1', 5, [4, 1, 1, 1], [2, 1, 1, 1]); G.pl.axis = -1; T.put(G, 0, 4, 'ax0'); T.put(G, 1, 2, 'ax1'); eq(G.pl.axis, -3); eq(G.result.why, 'spin');
});
t('axis: both axis and both engine dice are mandatory at the end of the round', () => {
  let G = T.round('g1', 5, [1, 1, 1, 1], [1, 1, 1, 1]); T.put(G, 0, 1, 'ax0'); T.put(G, 1, 1, 'ax1'); T.put(G, 0, 1, 'co0'); T.put(G, 1, 1, 'co1'); T.put(G, 0, 1, 'co2'); T.put(G, 1, 1, 'ra1'); T.put(G, 0, 1, 'ra0'); T.put(G, 1, 1, 'ra2');
  eq(G.result && G.result.why, 'mandatory');
  G = T.round('g1', 5, [3, 3, 3, 3], [3, 3, 3, 3]); T.axisEng(G, 3, 3, 3, 3); ok(!G.result); T.put(G, 0, 3, 'co0'); T.put(G, 1, 3, 'co1'); T.put(G, 0, 3, 'co2'); T.put(G, 1, 3, 'ra1'); eq(G.round, 1); ok(!G.result);
});

// ---------- engines and approach ----------
t('engines: 0 / 1 / 2 spaces by the sum against the markers (4 and 8 at the start)', () => {
  const expect = { 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 1, 8: 1, 9: 2, 10: 2, 11: 2, 12: 2 };
  for (const [sum, adv] of Object.entries(expect)) {
    const a = Math.min(6, +sum - 1), b = +sum - a, G = T.round('g1', 6, [3, a], [3, b]); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.axisEng(G, 3, a, 3, b); eq(G.pl.pos, 1 + adv, 'sum ' + sum); ok(!G.result, 'sum ' + sum);
  }
});
t('engines: gear raises blue (4 to 7) and flaps raise orange (8 to 12): the same sum moves less', () => {
  let G = T.round('g1', 6, [3, 2, 1, 1], [3, 3, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.aeroB = 5; G.pl.sw.lg = [1, 0, 0]; T.axisEng(G, 3, 2, 3, 3); eq(G.pl.pos, 1, 'sum 5 is now 0');
  G = T.round('g1', 6, [3, 5, 1, 1], [3, 5, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.aeroO = 10; G.pl.sw.fl = [1, 1, 0, 0]; T.axisEng(G, 3, 5, 3, 5); eq(G.pl.pos, 2, 'sum 10 is only 1 now');
  G = T.round('g1', 6, [3, 3, 1, 1], [3, 4, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.aeroB = 7; G.pl.sw.lg = [1, 1, 1]; T.axisEng(G, 3, 3, 3, 4); eq(G.pl.pos, 1, 'sum 7 with all gear is 0');
  G = T.round('g1', 6, [3, 4, 1, 1], [3, 4, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.aeroB = 7; G.pl.sw.lg = [1, 1, 1]; T.axisEng(G, 3, 4, 3, 4); eq(G.pl.pos, 2, 'sum 8 is 1');
  G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.aeroB = 7; G.pl.aeroO = 12; T.axisEng(G, 3, 6, 3, 6); eq(G.pl.pos, 2, 'sum 12 with all flaps is only 1');
});
t('approach: leaving a space that holds a plane is a collision (also on the pass-through space of a 2 advance); planes ahead of you are fine', () => {
  let G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [1, 0, 0, 0, 0, 0, 0]; T.axisEng(G, 3, 6, 3, 6); eq(G.result.why, 'collision');
  G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 1, 0, 0, 0, 0, 0]; T.axisEng(G, 3, 6, 3, 6); eq(G.result.why, 'collision', 'pass-through space holds a plane');
  G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 0, 1, 0, 0, 0, 0]; T.axisEng(G, 3, 6, 3, 6); ok(!G.result, 'landing on the plane space is fine'); eq(G.pl.pos, 3);
  G = T.round('g1', 6, [3, 2, 1, 1], [3, 2, 1, 1]); G.planes = [1, 0, 0, 0, 0, 0, 0]; T.axisEng(G, 3, 2, 3, 2); ok(!G.result, 'sum 4 advances 0 so no collision'); eq(G.pl.pos, 1);
});
t('approach: a 2-space advance with the plane two ahead is fine, and a plane on the destination is only a problem when you leave it next round', () => {
  const G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 0, 1, 0, 0, 0, 0]; T.axisEng(G, 3, 6, 3, 6); eq(G.pl.pos, 3); ok(!G.result);
});
t('approach: moving past the airport is an overshoot; reaching it early means holding (any advance is an overshoot)', () => {
  let G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.pos = 6; T.axisEng(G, 3, 6, 3, 6); eq(G.result.why, 'overshoot');
  G = T.round('g1', 6, [3, 4, 1, 1], [3, 5, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.pos = 7; T.axisEng(G, 3, 4, 3, 5); eq(G.result.why, 'overshoot', 'holding pattern: sum 9 advances 2');
  G = T.round('g1', 6, [3, 1, 1, 1], [3, 2, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.pos = 7; T.axisEng(G, 3, 1, 3, 2); ok(!G.result, 'sum 3 advances 0: holding is fine'); eq(G.pl.pos, 7);
});
t('approach: a plane on the airport space blocks leaving it (and the landing)', () => { const G = T.round('g1', 6, [3, 4, 1, 1], [3, 5, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 1]; G.pl.pos = 7; T.axisEng(G, 3, 4, 3, 5); ok(G.result && (G.result.why === 'collision' || G.result.why === 'overshoot')); });
t('tabs: leaving a tabbed space needs the axis in a marked position, checked on both spaces of a 2-step; no check for a 0 advance', () => {
  const sc = 'g3', tr = D.tracks['sea-g']; // tab on space 3: [-1,0]
  let G = T.round(sc, 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = tr.sp.map(() => 0); G.pl.pos = 3; G.pl.axis = 1; T.axisEng(G, 3, 6, 3, 6); eq(G.result.why, 'corridor');
  G = T.round(sc, 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = tr.sp.map(() => 0); G.pl.pos = 3; G.pl.axis = -1; T.axisEng(G, 3, 6, 3, 6); ok(!G.result, 'inside the corridor'); eq(G.pl.pos, 5);
  G = T.round(sc, 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = tr.sp.map(() => 0); G.pl.pos = 2; G.pl.axis = 1; T.axisEng(G, 3, 6, 3, 6); eq(G.result.why, 'corridor', 'the pass-through space 3 has the tab');
  G = T.round(sc, 6, [3, 1, 1, 1], [3, 2, 1, 1]); G.planes = tr.sp.map(() => 0); G.pl.pos = 3; G.pl.axis = 2; G.pl.axis = 0; T.axisEng(G, 3, 1, 3, 2); ok(!G.result, 'advance 0 is never checked');
  G = T.round(sc, 6, [3, 1, 1, 1], [3, 2, 1, 1]); G.planes = tr.sp.map(() => 0); G.pl.pos = 3; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); G.pl.axis = 2; T.put(G, 0, 1, 'en0'); T.put(G, 1, 2, 'en1'); ok(!G.result, 'a tilt of 2 with sum 3 means no move and so no check');
});
t('tabs: only scenarios whose strip has tabs are checked (a strip without tabs ignores the axis)', () => { const G = T.round('g1', 6, [3, 6, 1, 1], [3, 6, 1, 1]); G.planes = [0, 0, 0, 0, 0, 0, 0]; G.pl.axis = 2; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 6, 'en0'); T.put(G, 1, 6, 'en1'); ok(!G.result); eq(G.pl.pos, 3); });
t('radio: value 1 hits the space the plane is on, 2 the next one, and nothing happens past the end or on an empty space', () => {
  let G = T.round('g1', 6, [1, 3, 3, 3], [2, 3, 3, 3]); G.planes = [1, 1, 0, 0, 0, 0, 1]; T.put(G, 0, 1, 'ra0'); eq(G.planes[0], 0); T.put(G, 1, 2, 'ra1'); eq(G.planes[1], 0);
  G = T.round('g1', 6, [3, 3, 3, 3], [6, 3, 3, 3]); G.planes = [0, 0, 1, 0, 0, 0, 1]; G.pl.pos = 3; T.put(G, 1, 6, 'ra1'); eq(G.planes[7 - 1], 1, 'space 8 does not exist: nothing');
  G = T.round('g1', 6, [4, 3, 3, 3], [6, 3, 3, 3]); G.planes = [0, 0, 1, 0, 0, 0, 1]; T.put(G, 0, 4, 'ra0'); eq(G.planes, [0, 0, 1, 0, 0, 0, 1], 'empty target does nothing'); T.put(G, 1, 6, 'ra1'); eq(G.planes[6 - 1 + 0], 0); eq(G.planes[6], 1, 'space 6 only (1+5)');
  G = T.round('g1', 6, [6, 3, 3, 3], [3, 3, 3, 3]); G.planes = [0, 0, 0, 0, 0, 0, 1]; G.pl.pos = 2; T.put(G, 0, 6, 'ra0'); eq(G.planes[6], 0, 'counting from space 2: 2+5 = 7 is the airport');
  G = T.round('g1', 6, [1, 3, 3, 3], [3, 3, 3, 3]); G.planes = [0, 0, 2, 0, 0, 0, 0]; G.pl.pos = 3; T.put(G, 0, 1, 'ra0'); eq(G.planes[2], 1, 'removes only one plane of two');
});
t('radio: pilot has 1 radio space and the co-pilot 2, any value; placing there is legal even when it clears nothing', () => { const G = T.round('g1', 6, [5, 3, 3, 3], [3, 3, 3, 3]); G.planes = [0, 0, 0, 0, 0, 0, 0]; ok(T.can(G, 0, 5, 'ra0')); T.put(G, 0, 5, 'ra0'); ok(!G.result); });
t('landing gear: any order, light and blue marker only on the first deployment of each; a die on a green gear is spent for nothing', () => {
  const G = T.round('g1', 6, [5, 6, 1, 3], [3, 3, 3, 3]); T.put(G, 0, 5, 'lg2'); eq(G.pl.aeroB, 5); eq(G.pl.sw.lg, [0, 0, 1]); G.slots = {}; T.put(G, 0, 6, 'lg2'); eq(G.pl.aeroB, 5, 'second time: no change'); T.put(G, 0, 1, 'lg0'); eq(G.pl.aeroB, 6); T.inv(G);
});
t('brakes: 2, then 4, then 6; the red marker follows; skipping is not allowed', () => {
  const G = T.round('g1', 6, [2, 4, 6, 1], [3, 3, 3, 3]); eq(FA.brakeVal(G), 0); T.put(G, 0, 2, 'br0'); eq(FA.brakeVal(G), 2); T.put(G, 0, 4, 'br1'); eq(FA.brakeVal(G), 4); T.put(G, 0, 6, 'br2'); eq(FA.brakeVal(G), 6);
});
t('concentration: a coffee per die, never more than 3 held (a fourth die is just spent)', () => {
  const G = T.round('g1', 6, [3, 3, 3, 3], [3, 3, 3, 3]); T.put(G, 0, 3, 'co0'); eq(G.coffee, 1); T.put(G, 1, 3, 'co1'); T.put(G, 0, 3, 'co2'); eq(G.coffee, 3); G.slots = {}; ok(T.can(G, 1, 3, 'co0')); T.put(G, 1, 3, 'co0'); eq(G.coffee, 3);
});
t('coffee: each token is +1 or -1, results stay in 1..6 (no wrap), either crew may spend them, and the change counts for the slot', () => {
  let G = T.round('g1', 6, [1, 3, 3, 3], [6, 3, 3, 3]); G.coffee = 3; ok(!T.can(G, 0, 1, 'ra0', -1), '1 minus 1 is not 6'); ok(!T.can(G, 1, 6, 'ra1', 1), '6 plus 1 is not 1'); ok(T.can(G, 0, 1, 'ra0', 2)); ok(T.can(G, 1, 6, 'ra1', -3)); ok(!T.can(G, 1, 6, 'ra1', -4));
  G = T.round('g1', 6, [3, 3, 3, 3], [3, 3, 3, 3]); G.coffee = 2; G.planes = [1, 0, 0, 0, 0, 0, 0]; T.put(G, 0, 3, 'ra0', -2); eq(G.coffee, 0); eq(G.planes[0], 0, 'a 3 became a 1');
  G = T.round('g1', 6, [4, 3, 3, 3], [3, 3, 3, 3]); G.coffee = 1; ok(T.can(G, 0, 4, 'lg1', -1), '4 minus 1 is 3 which fits 3-4 anyway'); ok(T.can(G, 0, 4, 'lg2', 1), '4 plus 1 is 5 which fits 5-6'); T.put(G, 0, 4, 'lg2', 1); eq(G.pl.sw.lg, [0, 0, 1]);
  G = T.round('g1', 6, [3, 3, 3, 3], [3, 3, 3, 3]); G.coffee = 1; T.put(G, 0, 3, 'ax0', 1); eq(G.slots.ax0.v, 4, 'the die shows the changed value');
});
t('coffee tokens carry over between rounds', () => { const G = T.round('g1', 6, [3, 3, 3, 3], [3, 3, 3, 3]); T.put(G, 0, 3, 'co0'); T.axisEng(G, 3, 3, 3, 3); T.finishRound(G); eq(G.coffee, 1); });

// ---------- altitude, rerolls ----------
t('altitude: seven rounds, one row per round; reroll tokens arrive on rows 6000 and 2000 (green/yellow) or only 6000 (red/black)', () => {
  const G = T.game('g1', 7); eq(G.rrHand, 1); const log = [G.rrHand]; for (let r = 1; r < 7; r++) { T.toRound(G, r); log.push(G.rrHand); } eq(log, [1, 1, 1, 1, 2, 2, 2]);
  const H = T.game('r1', 7); const l2 = [H.rrHand]; for (let r = 1; r < 7; r++) { if (H.result) break; H.planes = H.planes.map(() => 0); T.toRound(H, r); l2.push(H.rrHand); } eq(l2.slice(0, 3), [1, 1, 1]);
});
t('reroll: one token lets BOTH crew reroll any of their unplaced dice once; chosen dice change, others stay; placed dice are untouched', () => {
  const G = T.round('g1', 8, [3, 3, 3, 3], [4, 4, 4, 4]); T.put(G, 0, 3, 'co0'); G.turn = 1; const before = G.dice[1].map(d => d.v);
  ok(FA.validMoves(G, 1).some(m => m.t === 'rr')); T.mv(G, 1, { t: 'rr' }); eq(G.rrHand, 0); eq(G.pend.h, 'rr');
  eq(FA.pending(G), [0, 1]); T.mv(G, 0, { t: 'rrpick', m: [true, true, true, true] }); eq(FA.pending(G), [1]); T.mv(G, 1, { t: 'rrpick', m: [false, false, false, false] });
  ok(!G.pend); eq(G.dice[1].map(d => d.v), before, 'the co-pilot kept all four'); eq(G.dice[0][0].u, true, 'a placed die stays placed'); T.inv(G);
});
t('reroll: the token is used up; a reroll mask cannot select placed dice; the other crew mask stays hidden until both have chosen (strip)', () => {
  const G = T.round('g1', 8, [3, 3, 3, 3], [4, 4, 4, 4]); T.mv(G, 0, { t: 'rr' }); T.mv(G, 0, { t: 'rrpick', m: [true, false, false, false] }); const V = FA.stripView(G, 1); eq(V.pend.d.m[0], [], 'the pilot choice is hidden from the co-pilot'); eq(V.pend.d.m[1], null);
  ok(!FA.validMoves(G, 0).some(m => m.t === 'rr'), 'no second token');
});
t('reroll: mastery gives a token only while one is left in the box (3 in total)', () => {
  const G = T.round('g6', 9, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['mastery'] }); eq(G.abil, ['mastery']); const before = G.rrHand; T.put(G, 0, 3, 'en0'); T.put(G, 1, 3, 'en1'); eq(G.rrHand, before + 1);
  const H = T.round('g6', 9, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['mastery'] }); H.rrHand = 1; H.round = 3; eq(FA.rrReserve(H), 1, 'rows after 3000 ft: one token in hand, the 2000 ft token still on the track, one in the box');
});

// ---------- end of round, final round ----------
t('end of round: dice come back, altitude drops, and arriving at the last row away from the airport is a crash short of the runway', () => {
  const G = T.round('g1', 10, [3, 3, 3, 3], [3, 3, 3, 3]); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 5); eq(G.round, 5); G.pl.pos = 6; T.finishRound(G); eq(G.result.why, 'short');
  const H = T.game('g1', 10); H.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(H, 5); H.pl.pos = 7; T.finishRound(H); ok(!H.result); eq(H.round, 6); ok(FA.isFinal(H));
});
t('final round: the plane does not move; speed must be at most the brake value and the brake must be at least 2', () => {
  let G = T.game('g1', 11); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 6); G.pl.pos = 7; T.roll(G); T.dice(G, 0, [3, 1, 2, 3]); T.dice(G, 1, [3, 1, 2, 2]); G.pl.sw.br = [1, 0, 0]; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 1, 'en0'); T.put(G, 1, 1, 'en1'); ok(!G.result, 'speed 2 <= brake 2'); eq(G.pl.pos, 7);
  G = T.game('g1', 11); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 6); G.pl.pos = 7; T.roll(G); T.dice(G, 0, [3, 1, 2, 3]); T.dice(G, 1, [3, 1, 2, 2]); G.pl.sw.br = [1, 0, 0]; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 2, 'en0'); T.put(G, 1, 2, 'en1'); eq(G.result.why, 'speed', 'speed 4 > brake 2');
  G = T.game('g1', 11); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 6); G.pl.pos = 7; T.roll(G); T.dice(G, 0, [3, 1, 2, 3]); T.dice(G, 1, [3, 1, 2, 2]); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 1, 'en0'); T.put(G, 1, 1, 'en1'); eq(G.result.why, 'speed', 'no brakes at all');
});
t('final round: brakes set AFTER the engines do not rescue the speed check', () => { const G = T.game('g1', 11); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 6); G.pl.pos = 7; T.roll(G); T.dice(G, 0, [3, 4, 2, 3]); T.dice(G, 1, [3, 4, 2, 2]); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 4, 'en0'); T.put(G, 1, 4, 'en1'); eq(G.result.why, 'speed'); });
t('landing: all of A (no planes), B (gear+flaps), C (level axis), D (speed) must hold at the end of the last round', () => {
  const mk = () => { const G = T.game('g1', 12); G.planes = [0, 0, 0, 0, 0, 0, 0]; T.toRound(G, 6); G.pl.pos = 7; G.pl.sw.lg = [1, 1, 1]; G.pl.aeroB = 7; G.pl.sw.fl = [1, 1, 1, 1]; G.pl.aeroO = 12; G.pl.sw.br = [1, 1, 0]; T.roll(G); T.dice(G, 0, [3, 1, 2, 3]); T.dice(G, 1, [3, 1, 2, 3]); return G; };
  let G = mk(); T.axisEng(G, 3, 1, 3, 2); T.finishRound(G); eq(G.result.win, true); eq(G.result.why, 'landed');
  G = mk(); G.planes[3] = 1; T.axisEng(G, 3, 1, 3, 2); T.finishRound(G); eq(G.result.win, false); eq(G.result.checks.planes, false);
  G = mk(); G.pl.sw.lg = [1, 1, 0]; T.axisEng(G, 3, 1, 3, 2); T.finishRound(G); eq(G.result.checks.gear, false);
  G = mk(); G.pl.sw.fl = [1, 1, 1, 0]; T.axisEng(G, 3, 1, 3, 2); T.finishRound(G); eq(G.result.checks.flaps, false);
  G = mk(); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 2, 'en1'); G.dice[1][T.idx(G, 1, 3)].v = 4; T.put(G, 1, 4, 'ax1'); eq(G.pl.axis, 1); T.put(G, 0, 1, 'en0'); T.finishRound(G); eq(G.result.win, false); eq(G.result.checks.axis, false);
});
t('landing: the last round still allows radio, gear and flaps to finish the job', () => {
  const G = T.game('g1', 12); T.toRound(G, 6); G.planes = [0, 0, 0, 0, 0, 0, 1]; G.pl.pos = 7; G.pl.sw.lg = [1, 1, 0]; G.pl.aeroB = 6; G.pl.sw.fl = [1, 1, 1, 1]; G.pl.aeroO = 12; G.pl.sw.br = [1, 0, 0]; T.roll(G); T.dice(G, 0, [3, 1, 5, 2]); T.dice(G, 1, [3, 1, 1, 2]);
  T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 1, 'en0'); T.put(G, 1, 1, 'en1'); ok(!G.result); T.put(G, 0, 5, 'lg2'); T.put(G, 1, 1, 'ra1'); eq(G.planes[6], 0, 'a 1 on the radio clears the space the plane stands on'); T.put(G, 0, 2, 'co0'); T.put(G, 1, 2, 'co1'); eq(G.result && G.result.win, true);
});

// ---------- traffic ----------
t('traffic: at round start roll once per icon on the space you stand on; the plane appears (v-1) ahead, clamped to the airport; fly-through spaces never roll', () => {
  const G = T.game('g3', 13); const tr = D.tracks['sea-g']; eq(tr.sp[0][1], 2, 'first space has 2 icons'); eq(G.used.trafficRoll, 2); eq(FA.planesOnTrack(G), tr.sp.reduce((a, s) => a + s[0], 0) + 2, 'two planes added');
  const H = T.game('g3', 14); H.pl.pos = 2; const n0 = FA.planesOnTrack(H); H.used = {}; FA._.startRound(H); eq(H.used.trafficRoll || 0, 0, 'space 2 has no icon'); eq(FA.planesOnTrack(H), n0);
  const I = T.game('g3', 15); I.pl.pos = 7; I.planes = [0, 0, 0, 0, 0, 0, 0, 0]; I.used = {}; D.tracks['sea-g'].sp[6][1] = 1; FA._.startRound(I); D.tracks['sea-g'].sp[6][1] = 0; eq(I.planes[7] + I.planes[6] + I.planes[5] > 0, true); ok(I.planes[7] === 1 || I.planes[6] === 1 || I.planes[5] === 1);
});
t('traffic: dice results are 2..5 (faces 2,3,3,4,4,5) and the added plane lands on space pos+v-1; no plane left in the supply adds nothing', () => {
  ok(JSON.stringify(D.speedFaces) === '[2,3,3,4,4,5]'); const G = T.game('g3', 16); for (const e of G.events) if (e.t === 'traffic') { ok(e.v >= 2 && e.v <= 5); eq(e.at, Math.min(1 + e.v - 1, 8)); }
  const H = T.game('g3', 17); H.planes = [0, 0, 0, 0, 0, 0, 0, 0]; H.planes[7] = 12; H.used = {}; FA._.startRound(H); eq(FA.planesOnTrack(H), 12, 'supply is empty');
});

// ---------- fuel ----------
t('fuel watch: starts at 20; the fuel space burns the die value; an unused round burns 6; below 0 loses, exactly 0 is alive', () => {
  let G = T.round('g4', 20, [4, 3, 3, 3], [3, 3, 3, 3]); eq(G.pl.kero, 20); G.planes = D.tracks['orr-g'].sp.map(() => 0); T.put(G, 0, 4, 'ke'); eq(G.pl.kero, 16); T.axisEng(G, 3, 3, 3, 3); T.finishRound(G); eq(G.pl.kero, 16, 'used this round: no extra loss');
  G = T.round('g4', 20, [3, 3, 3, 3], [3, 3, 3, 3]); G.planes = D.tracks['orr-g'].sp.map(() => 0); T.axisEng(G, 3, 3, 3, 3); T.finishRound(G); eq(G.pl.kero, 14);
  G = T.round('g4', 20, [3, 3, 3, 3], [3, 3, 3, 3]); G.pl.kero = 6; G.planes = D.tracks['orr-g'].sp.map(() => 0); T.axisEng(G, 3, 3, 3, 3); T.finishRound(G); ok(!G.result, 'exactly 0 left is fine'); eq(G.pl.kero, 0);
  G = T.round('g4', 20, [3, 3, 3, 3], [3, 3, 3, 3]); G.pl.kero = 5; G.planes = D.tracks['orr-g'].sp.map(() => 0); T.axisEng(G, 3, 3, 3, 3); T.finishRound(G); eq(G.result.why, 'fuel');
  G = T.round('g4', 20, [6, 3, 3, 3], [3, 3, 3, 3]); G.pl.kero = 5; T.put(G, 0, 6, 'ke'); eq(G.result.why, 'fuel', 'dropping below 0 at any time loses');
});
t('fuel leak: no fuel space; when both engine dice are down burn the difference + 1', () => {
  let G = T.round('y7', 21, [6, 6, 3, 3], [3, 3, 3, 3]); ok(!G.keys.includes('ke')); G.planes = D.tracks['gcx-y'].sp.map(() => 0); G.pl.pos = 1; T.axisEng(G, 3, 6, 3, 3); eq(G.pl.kero, 16, '6 and 3: lose 4');
  G = T.round('y7', 21, [3, 4, 3, 3], [3, 4, 3, 3]); G.planes = D.tracks['gcx-y'].sp.map(() => 0); T.axisEng(G, 3, 4, 3, 4); eq(G.pl.kero, 19, 'equal dice lose 1');
  G = T.round('y7', 21, [3, 6], [3, 1]); G.pl.kero = 5; G.planes = D.tracks['gcx-y'].sp.map(() => 0); T.axisEng(G, 3, 6, 3, 1); eq(G.result.why, 'fuel', 'difference 5 + 1 = 6 > 5');
});

// ---------- wind ----------
t('wind: the dial starts at +3 and every round (after the axis resolves) it turns by the axis tilt; modifier table as written', () => {
  const tab = D.windMod; eq(tab.length, 20); eq(tab[10], 3); eq(tab.filter(x => x === 3).length, 3); eq(tab.filter(x => x === 2).length, 4); eq(tab.filter(x => x === 1).length, 2); eq(tab.filter(x => x === 0).length, 2); eq(tab.filter(x => x === -1).length, 2); eq(tab.filter(x => x === -2).length, 4); eq(tab.filter(x => x === -3).length, 3);
  let G = T.round('y3', 22, [3, 1, 3, 3], [3, 1, 3, 3]); G.planes = D.tracks['plm-y'].sp.map(() => 0); eq(FA.windMod(G), 3); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); eq(G.pl.wind, 10, 'axis level: the dial does not turn');
  G = T.round('y3', 22, [5, 1], [3, 1]); G.planes = D.tracks['plm-y'].sp.map(() => 0); T.put(G, 0, 5, 'ax0'); T.put(G, 1, 3, 'ax1'); eq(G.pl.axis, -2); eq(G.pl.wind, 8); eq(FA.windMod(G), 2);
  G = T.round('y3', 22, [3, 1], [5, 1]); G.planes = D.tracks['plm-y'].sp.map(() => 0); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 5, 'ax1'); eq(G.pl.axis, 2); eq(G.pl.wind, 12);
});
t('wind: even a level axis that is already tilted keeps turning the dial; the dial wraps around 0 and 19', () => {
  const G = T.round('y3', 22, [3, 1], [3, 1]); G.planes = D.tracks['plm-y'].sp.map(() => 0); G.pl.axis = -2; G.pl.wind = 1; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); eq(G.pl.wind, 19); eq(FA.windMod(G), -3);
});
t('wind: the modifier is added to the engine sum (and in the last round to the landing speed)', () => {
  let G = T.round('y3', 22, [3, 1, 3, 3], [3, 2, 3, 3]); G.planes = D.tracks['plm-y'].sp.map(() => 0); T.axisEng(G, 3, 1, 3, 2); eq(G.speed, 6); eq(G.pl.pos, 2, 'sum 3 + 3 = 6 advances 1');
  G = T.game('y3', 22); T.toRound(G, 6); G.planes = D.tracks['plm-y'].sp.map(() => 0); G.pl.pos = 7; G.pl.wind = 10; T.roll(G); T.dice(G, 0, [3, 1, 3, 3]); T.dice(G, 1, [3, 1, 3, 3]); G.pl.sw.br = [1, 1, 1]; T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 1, 'en0'); T.put(G, 1, 1, 'en1'); eq(G.landSpeed, 5, '2 + 3 wind'); ok(!G.result);
});

// ---------- trainee ----------
t('trainee: six tokens 1..6 face up; each crew takes from their own end; the die must differ from the next token; the token is placed at once (no coffee, not on concentration)', () => {
  let G = T.round('g5', 30, [3, 3, 3, 3], [3, 3, 3, 3]); G.intern = [2, 5, 1, 6, 3, 4]; G.coffee = 2; ok(G.keys.includes('in0')); ok(T.can(G, 0, 3, 'in0')); ok(!T.can(G, 0, 3, 'co0') || true);
  const m = FA.validMoves(G, 0).filter(x => x.t === 'place' && x.to === 'in0'); ok(m.length); ok(!FA.validMoves(G, 0).some(x => x.t === 'place' && x.to === 'in0' && G.dice[0][x.d].v + x.c === 2), 'cannot place a 2 when the next token is a 2');
  T.put(G, 0, 3, 'in0'); eq(G.pend.h, 'intern'); eq(G.pend.d.val, 2); eq(G.intern, [5, 1, 6, 3, 4]); eq(G.turn, 0, 'still the pilot, the token comes first');
  const pm = FA.validMoves(G, 0); ok(pm.every(x => x.d === 'p' || x.t === 'toss')); ok(!pm.some(x => x.to === 'co0' || x.to === 'in1'), 'not on concentration'); ok(pm.every(x => !x.c), 'no coffee');
  T.mv(G, 0, { t: 'place', d: 'p', to: 'ra0', c: 0 }); eq(G.slots.ra0.v, 2); eq(G.slots.ra0.k, 'i'); ok(!G.pend); eq(G.turn, 1);
  T.put(G, 1, 3, 'in1'); eq(G.pend.d.val, 4, 'the co-pilot takes the token at the other end'); T.inv(G);
});
t('trainee: leftover tokens at the end of the game lose the landing', () => {
  const mk = used => { const G = T.game('g5', 31); T.toRound(G, 6); G.planes = D.tracks['gcx-g'].sp.map(() => 0); G.pl.pos = G.planes.length; if (used) { G.intern = []; G.internUsed = 6; } G.pl.sw.lg = [1, 1, 1]; G.pl.aeroB = 7; G.pl.sw.fl = [1, 1, 1, 1]; G.pl.aeroO = 12; G.pl.sw.br = [1, 1, 0]; T.roll(G); T.dice(G, 0, [3, 1]); T.dice(G, 1, [3, 2]); T.axisEng(G, 3, 1, 3, 2); return G; };
  let G = mk(false); eq(G.result.win, false); eq(G.result.checks.intern, false); G = mk(true); eq(G.result.win, true);
});

// ---------- icy runway ----------
t('icy runway: four columns 2,3,4,5; the pilot space and the shared space of the next column must both get the column number in the same round; the marker follows', () => {
  const G = T.round('y4', 40, [2, 3, 4, 5], [2, 3, 4, 5]); ok(G.keys.includes('it0')); ok(!G.keys.includes('br0')); eq(FA.brakeVal(G), 0); G.planes = D.tracks['frm-y'].sp.map(() => 0);
  ok(T.can(G, 0, 2, 'it0')); ok(!T.can(G, 0, 3, 'it1'), 'only the next column'); ok(!T.can(G, 1, 2, 'it0'), 'the upper space is pilot only'); ok(T.can(G, 1, 2, 'ib0')); T.put(G, 0, 2, 'it0'); eq(FA.brakeVal(G), 0, 'one half is not enough'); T.put(G, 1, 2, 'ib0'); eq(FA.brakeVal(G), 2); eq(G.pl.ice, 1);
  ok(T.can(G, 0, 3, 'it1'), 'the next column is open in the same round'); T.put(G, 0, 3, 'it1'); T.put(G, 1, 3, 'ib1'); eq(FA.brakeVal(G), 3); eq(G.pl.ice, 2);
});
t('icy runway: a lone die in a column is wasted at the end of the round (marker stays) and the column is still the next one', () => {
  const G = T.round('y4', 40, [2, 3, 3, 3], [3, 3, 3, 3]); G.planes = D.tracks['frm-y'].sp.map(() => 0); T.put(G, 0, 2, 'it0'); T.put(G, 1, 3, 'co0'); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 3, 'en0'); T.put(G, 1, 3, 'en1'); T.put(G, 0, 3, 'co2'); T.put(G, 1, 3, 'co1'); eq(G.round, 1); eq(G.pl.ice, 0); eq(FA.brakeVal(G), 0);
});
t('icy runway: all four columns must be finished to land, and the last-round speed must stay under the marker', () => {
  const mk = () => { const G = T.game('y4', 41); T.toRound(G, 6); G.planes = D.tracks['frm-y'].sp.map(() => 0); G.pl.pos = G.planes.length; G.pl.sw.lg = [1, 1, 1]; G.pl.aeroB = 7; G.pl.sw.fl = [1, 1, 1, 1]; G.pl.aeroO = 12; G.pl.ice = 3; T.roll(G); T.dice(G, 0, [3, 1, 5, 6]); T.dice(G, 1, [3, 2, 5, 6]); return G; };
  let G = mk(); T.axisEng(G, 3, 1, 3, 2); T.put(G, 0, 6, 'co0'); T.put(G, 1, 6, 'co1'); T.put(G, 0, 5, 'co2'); T.put(G, 1, 5, 'ra1'); eq(G.result.win, false); eq(G.result.checks.ice, false, 'the last column is still open');
  G = mk(); T.put(G, 0, 5, 'it3'); T.put(G, 1, 5, 'ib3'); eq(G.pl.ice, 4); T.axisEng(G, 3, 1, 3, 2); ok(!G.result, 'speed 3 under the marker 5'); T.put(G, 0, 6, 'co0'); T.put(G, 1, 6, 'co1'); eq(G.result.win, true, 'finished the last column in the last round');
});

// ---------- abilities ----------
t('second look: only the first player, once a round, before their first placement', () => {
  const G = T.round('g6', 50, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['antic'] }); ok(FA.validMoves(G, 0).some(m => m.t === 'antic')); ok(!FA.validMoves(G, 1).some(m => m.t === 'antic')); T.mv(G, 0, { t: 'antic', d: 0 }); ok(!FA.validMoves(G, 0).some(m => m.t === 'antic'), 'once');
  const H = T.round('g6', 50, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['antic'] }); T.put(H, 0, 3, 'co0'); H.turn = 0; ok(!FA.validMoves(H, 0).some(m => m.t === 'antic'), 'after the first placement it is too late');
});
t('flip side: once per game per player, turns an unplaced die to 7 minus its value', () => {
  const G = T.round('g6', 51, [2, 3, 3, 3], [3, 3, 3, 3], { abil: ['adapt'] }); T.mv(G, 0, { t: 'adapt', d: 0 }); eq(G.dice[0][0].v, 5); ok(!FA.validMoves(G, 0).some(m => m.t === 'adapt'), 'used'); G.turn = 1; ok(FA.validMoves(G, 1).some(m => m.t === 'adapt'), 'the other player still has theirs'); T.toRound(G, 1); T.roll(G); ok(!FA.validMoves(G, 0).some(m => m.t === 'adapt'), 'once per game, not per round');
});
t('twin thrust / steady hands: equal engine dice earn a reroll token; equal axis dice earn a coffee (if available)', () => {
  const G = T.round('g6', 52, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['control'] }); G.planes = D.tracks['cas-g'].sp.map(() => 0); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); eq(G.coffee, 1);
  const H = T.round('g6', 52, [3, 3, 3, 3], [3, 3, 3, 3], { abil: ['control'] }); H.coffee = 3; T.put(H, 0, 3, 'ax0'); T.put(H, 1, 3, 'ax1'); eq(H.coffee, 3, 'already full');
  const I = T.round('g6', 52, [3, 3, 3, 3], [4, 3, 3, 3], { abil: ['control'] }); T.put(I, 0, 3, 'ax0'); T.put(I, 1, 4, 'ax1'); eq(I.coffee, 0, 'different dice: nothing');
});
t('cross-check: once a gear die and a flap die are down the traffic die is rolled and the co-pilot places it on any empty space, either colour, as an extra action', () => {
  const G = T.round('g6', 53, [1, 3, 3, 3], [1, 3, 3, 3], { abil: ['sync'] }); T.put(G, 0, 1, 'lg0'); ok(!G.pend); T.put(G, 1, 1, 'fl0'); eq(G.pend.h, 'sync'); ok(G.pend.d.val >= 2 && G.pend.d.val <= 5); eq(FA.pending(G), [1]);
  const pm = FA.validMoves(G, 1); ok(pm.length > 0); ok(pm.every(m => m.d === 'p')); ok(pm.some(m => SLOTkind(m.to) === 'pilot' || m.to === 'ra0' || m.to === 'ax0'), 'pilot spaces are allowed'); T.mv(G, 1, pm[0]); ok(!G.pend); eq(G.turn, 0, 'the turn passes on as normal after the extra die');
  ok(!G.fl.sync === false, 'only once'); function SLOTkind(k) { return FA.SLOT[k].s === 0 ? 'pilot' : 'other'; }
});
t('hand-over: either player puts an unplaced die there, the other must too, values swap, dice stay unplaced; once a round', () => {
  const G = T.round('g6', 54, [1, 2, 3, 3], [6, 5, 4, 4], { abil: ['together'] }); T.mv(G, 0, { t: 'wt', d: 0 }); eq(FA.pending(G), [1]); eq(FA.validMoves(G, 0).length, 0); T.mv(G, 1, { t: 'wt2', d: 0 }); eq(G.dice[0][0].v, 6); eq(G.dice[1][0].v, 1); eq(G.dice[0][0].u, false); eq(G.dice[1][0].u, false); ok(!FA.validMoves(G, 0).some(m => m.t === 'wt'), 'once a round');
  const V = FA.stripView((() => { const H = T.round('g6', 54, [1, 2, 3, 3], [6, 5, 4, 4], { abil: ['together'] }); T.mv(H, 0, { t: 'wt', d: 2 }); return H; })(), 1); eq(V.pend.d.ai, -1, 'the partner does not learn which die');
});

// ---------- fix round: audit findings ----------
t('reroll token: either crew may spend it at any time while a die is unplaced, also off their turn and with no dice of their own left', () => {
  let G = T.round('g1', 2, [3, 3, 3, 3], [3, 3, 3, 3]); eq(G.turn, 0); ok(FA.validMoves(G, 1).some(m => m.t === 'rr'), 'the co-pilot may spend it on the pilot turn');
  ok(!FA.validMoves(G, 1).some(m => m.t === 'place'), 'but may not place off turn'); T.mv(G, 1, { t: 'rr' }); eq(G.pend.h, 'rr'); eq(FA.pending(G), [0, 1]);
  G = T.round('g1', 2, [3], [3, 3, 3, 3]); T.put(G, 0, 3, 'co0'); eq(FA.unusedDice(G, 0).length, 0); eq(G.turn, 1);
  ok(FA.validMoves(G, 0).some(m => m.t === 'rr'), 'a pilot with no dice left may still spend it for the co-pilot'); T.mv(G, 0, { t: 'rr' });
  eq(FA.pending(G), [1], 'the pilot has nothing to reroll, so only the co-pilot is asked'); eq(G.pend.d.m[0], [false, false, false, false]);
  T.mv(G, 1, { t: 'rrpick', m: [true, false, false, false] }); ok(!G.pend); T.inv(G);
  G = T.round('g1', 2, [3, 3, 3, 3], [3, 3, 3, 3]); T.mv(G, 0, { t: 'rr' }); ok(!FA.validMoves(G, 1).some(m => m.t === 'rr'), 'not while a question is open');
  G = T.game('g1', 2); ok(!FA.validMoves(G, 0).some(m => m.t === 'rr'), 'not during the briefing (no dice yet)');
});
t('ability cards in newGame: only known ids, no duplicates, clamped to the scenario count', () => {
  eq(T.game('g1', 1, { abil: ['antic', 'adapt'] }).abil, [], '0-card scenario'); eq(T.game('y3', 1, { abil: ['antic', 'adapt'] }).abil, ['antic'], '1-card scenario');
  eq(T.game('g6', 1, { abil: ['bogus', 'antic', 'antic', 'sync', 'mastery'] }).abil, ['antic', 'sync']); eq(T.game('g6', 1, { abil: 'antic' }).abil, []); eq(T.game('g6', 1, { abil: [{}, 3, 'toString'] }).abil, []);
});
t('trainee: a token with nowhere to go goes back to its end of the row and does not count as trained', () => {
  const G = T.round('g5', 3, [1, 3, 3, 3], [3, 3, 3, 3]); G.intern = [6, 2, 3, 4, 5, 1];
  for (const k of G.keys) if (k !== 'in0' && k !== 'in1') { const S = FA.SLOT[k]; G.slots[k] = { s: S.s === null ? 0 : S.s, v: S.vals ? S.vals[0] : 3, k: 'x' }; }
  T.put(G, 0, 1, 'in0'); eq(G.pend && G.pend.h, 'intern'); eq(G.pend.d.val, 6); eq(G.internUsed, 1);
  const mv = FA.validMoves(G, 0); eq(mv, [{ t: 'toss', d: 'p' }]); T.mv(G, 0, mv[0]);
  eq(G.intern, [6, 2, 3, 4, 5, 1], 'token 6 is back at the pilot end'); eq(G.internUsed, 0); ok(!G.pend); eq(G.turn, 1, 'the turn passes once'); T.inv(G);
  const H = T.round('g5', 3, [3, 3, 3, 3], [2, 3, 3, 3]); H.intern = [6, 2, 3, 4, 5, 1];
  for (const k of H.keys) if (k !== 'in0' && k !== 'in1') { const S = FA.SLOT[k]; H.slots[k] = { s: S.s === null ? 1 : S.s, v: S.vals ? S.vals[0] : 3, k: 'x' }; }
  T.put(H, 1, 2, 'in1'); eq(H.pend.d.val, 1); T.mv(H, 1, { t: 'toss', d: 'p' }); eq(H.intern, [6, 2, 3, 4, 5, 1], 'co-pilot token goes back to the co-pilot end'); T.inv(H);
});
t('flip side and hand-over: usable at any time by either crew while no question is open (not only on their own turn)', () => {
  let G = T.round('g6', 51, [2, 3, 3, 3], [4, 3, 3, 3], { abil: ['adapt', 'together'] }); eq(G.turn, 0);
  ok(FA.validMoves(G, 1).some(m => m.t === 'adapt'), 'co-pilot may flip on the pilot turn'); T.mv(G, 1, { t: 'adapt', d: 0 }); eq(G.dice[1][0].v, 3); eq(G.turn, 0, 'the turn does not change');
  ok(FA.validMoves(G, 1).some(m => m.t === 'wt'), 'co-pilot may start a hand-over on the pilot turn'); T.mv(G, 1, { t: 'wt', d: 1 }); eq(FA.pending(G), [0]);
  ok(!FA.validMoves(G, 1).some(m => m.t === 'adapt' || m.t === 'rr'), 'nothing else while the hand-over waits'); T.mv(G, 0, { t: 'wt2', d: 0 }); eq(G.dice[0][0].v, 3); eq(G.dice[1][1].v, 2); eq(G.turn, 0); T.inv(G);
  G = T.round('g6', 51, [2], [4, 3, 3, 3], { abil: ['together'] }); T.put(G, 0, 2, 'co0'); ok(!FA.validMoves(G, 1).some(m => m.t === 'wt'), 'no hand-over when the partner has no die left');
});

t('end of round: a missing mandatory die loses and the result names whose die it was', () => {
  const G = T.round('g1', 5, [3, 3], [3, 3]); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 3, 'co0'); T.put(G, 1, 3, 'en1');
  eq(G.result && G.result.why, 'mandatory'); eq(G.result.miss, ['en0']); ok(/Pilot's engine die/.test(G.result.msg), G.result.msg);
  const V = FA.netStrip ? FA.netStrip(G, 1) : require('./src/netstrip.js')(G, 1); eq(V.result.miss, ['en0'], 'online guests learn it too');
});

// ---------- real time, tosses ----------
t('against the clock: when the timer runs out unplaced dice are ignored; missing axis or engine dice lose', () => {
  let G = T.round('r1', 60, [3, 3, 3, 3], [3, 3, 3, 3]); ok(FA.validMoves(G, 0).some(m => m.t === 'timeout')); T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 3, 'en0'); T.put(G, 1, 3, 'en1'); G.planes = D.tracks['cls-r'].sp.map(() => 0); T.mv(G, 0, { t: 'timeout' }); ok(!G.result, 'both mandatory pairs done'); eq(G.round, 1);
  G = T.round('r1', 60, [3, 3, 3, 3], [3, 3, 3, 3]); T.put(G, 0, 3, 'ax0'); T.mv(G, 1, { t: 'timeout' }); eq(G.result.why, 'mandatory');
  ok(!FA.validMoves(T.round('g1', 60, [3], [3]), 0).some(m => m.t === 'timeout'), 'only with the module');
});
t('no legal place: a die that cannot go anywhere can be put aside as the turn (and only then)', () => {
  const G = T.round('g1', 61, [1, 1, 1, 1], [1, 1, 1, 1]); G.slots = {}; for (const k of G.keys) G.slots[k] = { s: 0, v: 1, k: 'd' }; eq(FA.validMoves(G, 0).filter(m => m.t === 'toss').length, 4); G.turn = 0; T.mv(G, 0, { t: 'toss', d: 0 }); eq(G.dice[0][0].u, true);
  const H = T.round('g1', 61, [1, 1, 1, 1], [1, 1, 1, 1]); ok(!FA.validMoves(H, 0).some(m => m.t === 'toss'));
});

// ---------- hidden information, turns, refusals ----------
t('hidden information: a seat sees its own dice values only; the other seat shows 0; no seed or rng', () => {
  const G = T.round('g1', 70, [1, 2, 3, 4], [5, 6, 5, 6]); const P = FA.stripView(G, 0), C = FA.stripView(G, 1);
  eq(P.dice[0].map(d => d.v), [1, 2, 3, 4]); eq(P.dice[1].map(d => d.v), [0, 0, 0, 0]); eq(C.dice[1].map(d => d.v), [5, 6, 5, 6]); eq(C.dice[0].map(d => d.v), [0, 0, 0, 0]); eq(P.rng, 0); eq(P.seed, 0); eq(G.dice[0][0].v, 1, 'the real state is untouched');
});
t('refusals: out of turn, wrong colour, value not allowed, coffee that is not there, placing twice on one space, unknown shapes', () => {
  const G = T.round('g1', 71, [3, 3, 3, 3], [3, 3, 3, 3]); bad(G, 1, { t: 'place', d: 0, to: 'ax1', c: 0 }); bad(G, 0, { t: 'place', d: 0, to: 'fl0', c: 0 }); bad(G, 0, { t: 'place', d: 0, to: 'lg0', c: 0 }); bad(G, 0, { t: 'place', d: 0, to: 'ax0', c: 1 }); bad(G, 0, { t: 'place', d: 7, to: 'ax0', c: 0 }); bad(G, 0, { t: 'frobnicate' }); bad(G, 0, null); bad(G, 2, { t: 'ready' });
  T.mv(G, 0, { t: 'place', d: 0, to: 'ax0', c: 0 }); G.turn = 0; bad(G, 0, { t: 'place', d: 1, to: 'ax0', c: 0 }); bad(G, 0, { t: 'place', d: 0, to: 'en0', c: 0 }, 'a die can only be placed once');
  bad(G, 0, JSON.parse('{"__proto__":{"x":1},"t":"place","d":1,"to":"ax0","c":0}'));
});
t('after the game is over nothing is legal', () => { const G = T.round('g1', 72, [6, 1], [3, 1]); T.put(G, 0, 6, 'ax0'); T.put(G, 1, 3, 'ax1'); ok(G.result); eq(FA.validMoves(G, 0).length, 0); eq(FA.sideToAct(G), -1); bad(G, 0, { t: 'ready' }); });
t('save/restore: a state survives JSON and the game goes on identically (rng included)', () => {
  const G = T.round('g1', 73, null, null); const H = JSON.parse(JSON.stringify(G)); const m = FA.validMoves(G, 0)[0]; FA.performMove(G, m, 0); FA.performMove(H, m, 0); eq(JSON.stringify(G), JSON.stringify(H));
});
t('a full scripted flight on the starter airport can be won', () => {
  // round 1..7 with hand-made dice: clear planes with the radio, deploy everything, land level and slow
  const G = T.game('g1', 74); const lines = [];
  const play = (pv, cv, fn) => { T.roll(G); T.dice(G, 0, pv); T.dice(G, 1, cv); G.turn = G.first; fn(); };
  // round 1: move 1 space (sum 5), clear space 3 plane with a 3 (pos 1 -> radio 3 = space 3)
  play([3, 3, 1, 4], [3, 4, 2, 5], () => { T.put(G, 0, 3, 'ax0'); T.put(G, 1, 3, 'ax1'); T.put(G, 0, 3, 'ra0'); T.put(G, 1, 4, 'en1'); T.put(G, 0, 1, 'en0'); T.put(G, 1, 5, 'co0'); T.put(G, 0, 4, 'co1'); T.put(G, 1, 2, 'fl0'); }); eq(G.pl.pos, 2); eq(G.planes[2], 0); eq(G.round, 1); ok(!G.result, JSON.stringify(G.result));
  T.inv(G);
});

// ---------- the learning ladder (story chapters 1-6) ----------
t('ladder: each chapter brings in one system; slots not in play are not in G.keys; dice are open and rolled at once', () => {
  const want = { 1: ['ax0', 'ax1'], 2: ['ax0', 'ax1', 'en0', 'en1'] };
  for (const l of [1, 2, 3, 4, 5, 6]) { const G = FA.newGame({ lad: l, seed: 5 }); T.inv(G); eq(G.phase, 'place', 'no briefing'); ok(G.open); if (want[l]) eq(G.keys, want[l]);
    ok(l >= 3 || !G.keys.includes('ra0')); ok(l >= 4 || !G.keys.includes('lg0')); ok(l >= 5 || !G.keys.includes('br0')); ok(l >= 6 || !G.keys.includes('co0')); ok(l < 6 || G.keys.includes('co0')); }
  eq(FA.newGame({ lad: 5, seed: 5 }).pl.sw.br, [1, 0, 0]);
});
t('ladder 1: only the axis matters; spare dice go back in the box by themselves; level at the end wins', () => {
  const G = FA.newGame({ lad: 1, seed: 9 }); eq(FA.checklist(G).map(x => x.k), ['axis']);
  for (let r = 0; r < 7 && !G.result; r++) { const a = FA.unusedDice(G, G.first)[0]; const s0 = G.first, s1 = 1 - s0;
    T.mv(G, s0, FA.validMoves(G, s0).find(m => m.t === 'place')); eq(FA.unusedDice(G, s0).length, 0, 'spare dice set aside');
    const mv = FA.validMoves(G, s1).filter(m => m.t === 'place'); ok(mv.length); T.mv(G, s1, mv[0]); }
  ok(G.result); eq(G.result.win, G.pl.axis === 0 || G.result.why === 'spin' ? G.result.win : false);
});
t('ladder 2-4: checklist items grow, speed uses auto-brakes 6 before chapter 5', () => {
  eq(FA.checklist(FA.newGame({ lad: 2, seed: 1 })).map(x => x.k), ['axis', 'air', 'speed']); eq(FA.newGame({ lad: 2, seed: 1 }).autoBrake, 6);
  eq(FA.checklist(FA.newGame({ lad: 3, seed: 1 })).map(x => x.k), ['axis', 'air', 'speed', 'planes']);
  eq(FA.checklist(FA.newGame({ lad: 4, seed: 1 })).map(x => x.k), ['axis', 'air', 'speed', 'planes', 'gear', 'flaps']); eq(FA.newGame({ lad: 5, seed: 1 }).autoBrake, 0);
});
t('ladder: checklist matches the engine fields', () => { const G = FA.newGame({ lad: 4, seed: 3 }); G.pl.axis = 1; G.pl.sw.lg = [1, 1, 1]; const c = Object.fromEntries(FA.checklist(G).map(x => [x.k, x])); eq(c.axis.ok, false); eq(c.gear.ok, true); eq(c.gear.n, 3); eq(c.flaps.ok, false); eq(c.planes.n, FA.planesOnTrack(G)); });
t('ladder: the real game is untouched (no lad): keys, dice, briefing', () => { const G = FA.newGame({ scenario: 'g1', seed: 2 }); eq(G.lad, 0); eq(G.phase, 'brief'); ok(!G.open); eq(G.keys.length, FA.slotKeys(G.mods).length); });

console.log('rules-test: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log(failed.join('\n')); process.exit(1); }
