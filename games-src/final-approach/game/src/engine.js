// ===================== Final Approach rules engine =====================
// Plain JS (browser global FA / node module). State G is one JSON-serialisable object with its own seeded RNG; no functions inside G
// (pending questions are {h, d}). Seat 0 = Pilot (blue, left), seat 1 = Co-pilot (orange, right).
//   FA.newGame({scenario:'g1', seed, names:[], ai:[level|null, level|null], abil:[ids]}) -> G
//   FA.validMoves(G, seat) -> [move]        every legal move of that seat right now (briefing, placement, reroll answers, free actions)
//   FA.performMove(G, move, seat) -> {ok:true} | {ok:false, error}
//   FA.sideToAct(G) -> seat that is asked next (-1 when the game is over); FA.pending(G) -> every seat that owes a move now
//   FA.stripView(G, seat) / FA.checkInvariants(G) / FA.toText(G, seat) (render_game_to_text) / FA.clone(G) / FA.cloneLite(G)
// Moves: {t:'say',c} {t:'ready'} {t:'place',d,to,c} {t:'toss',d} {t:'rr'} {t:'rrpick',m:[b,b,b,b]} {t:'antic',d} {t:'adapt',d}
//        {t:'wt',d} {t:'wt2',d} {t:'timeout'}   (d = die index 0..3, or 'p' for the pending trainee token / cross-check die; c = coffee change)
(function (g) {
'use strict';
const FA = g.FA = g.FA || {};
const D = FA.DATA || (typeof require === 'function' ? require('./data.js') : null);

// ---------- rng ----------
function rnd(G, n) { let t = (G.rng = (G.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
const d6 = G => rnd(G, 6) + 1;
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(G, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const clone = o => JSON.parse(JSON.stringify(o));
function lg(G, t) { if (G.nolog) return; G.logN++; G.log.push({ i: G.logN, r: G.round + 1, t }); if (G.log.length > 300) G.log.splice(0, 80); }
function ev(G, e) { if (!G.nolog) { e.n = ++G.evN; G.events.push(e); if (G.events.length > 200) G.events.splice(0, 60); } }
function use(G, k, n) { G.used[k] = (G.used[k] || 0) + (n === undefined ? 1 : n); }

// ---------- slots ----------
// every space on the control panel: seat (0 pilot, 1 co-pilot, null = either), group, allowed values (null = any), order (index inside the group)
const SLOT = {};
const defSlot = (k, o) => { SLOT[k] = o; o.k = k; };
defSlot('ax0', { s: 0, grp: 'axis', ix: 0 }); defSlot('ax1', { s: 1, grp: 'axis', ix: 1 });
defSlot('en0', { s: 0, grp: 'engines', ix: 0 }); defSlot('en1', { s: 1, grp: 'engines', ix: 1 });
defSlot('ra0', { s: 0, grp: 'radio', ix: 0 }); defSlot('ra1', { s: 1, grp: 'radio', ix: 1 }); defSlot('ra2', { s: 1, grp: 'radio', ix: 2 });
if (D) {
  D.gear.forEach((v, i) => defSlot('lg' + i, { s: 0, grp: 'gear', ix: i, vals: v }));
  D.flaps.forEach((v, i) => defSlot('fl' + i, { s: 1, grp: 'flaps', ix: i, vals: v }));
  D.brakes.forEach((v, i) => defSlot('br' + i, { s: 0, grp: 'brakes', ix: i, vals: [v] }));
  D.iceBrakes.forEach((v, i) => { defSlot('it' + i, { s: 0, grp: 'ice', ix: i, vals: [v], row: 0 }); defSlot('ib' + i, { s: null, grp: 'ice', ix: i, vals: [v], row: 1 }); });
}
for (let i = 0; i < 3; i++) defSlot('co' + i, { s: null, grp: 'conc', ix: i });
defSlot('ke', { s: null, grp: 'kero', ix: 0 });
defSlot('in0', { s: 0, grp: 'intern', ix: 0 }); defSlot('in1', { s: 1, grp: 'intern', ix: 1 });
const ALLKEYS = Object.keys(SLOT);
function slotKeys(mods) {
  const o = ['ax0', 'ax1', 'en0', 'en1', 'ra0', 'ra1', 'ra2', 'lg0', 'lg1', 'lg2', 'fl0', 'fl1', 'fl2', 'fl3'];
  if (mods.ice) for (let i = 0; i < 4; i++) o.push('it' + i, 'ib' + i); else o.push('br0', 'br1', 'br2');
  o.push('co0', 'co1', 'co2');
  if (mods.kero) o.push('ke');
  if (mods.intern) o.push('in0', 'in1');
  return o;
}

// ---------- scenario helpers ----------
const scen = id => D.scenarios.find(s => s.id === id);
const track = G => D.tracks[G.tk];
const altRow = G => D.alt[G.alt][G.round + G.row0];
const isFinal = G => G.round >= D.rounds - 1 - G.row0;
const brakeVal = G => G.mods.ice ? [0].concat(D.iceBrakes)[G.pl.ice] : (G.pl.sw.br[2] ? 6 : G.pl.sw.br[1] ? 4 : G.pl.sw.br[0] ? 2 : 0);
const windMod = G => G.mods.wind ? D.windMod[G.pl.wind] : 0;
const planesOnTrack = G => { let n = 0; for (const x of G.planes) n += x; return n; };
const unusedDice = (G, s) => { const o = []; for (let i = 0; i < 4; i++) if (!G.dice[s][i].u) o.push(i); return o; };
const hasModsTabs = G => track(G).sp.some(s => s[2]);
function rrOnTrack(G) { let n = 0; const rows = D.alt[G.alt]; for (let r = G.round + G.row0 + 1; r < rows.length; r++) if (rows[r][2]) n++; return n; }
const rrReserve = G => D.rerollTotal - G.rrHand - rrOnTrack(G);

// ---------- setup ----------
// ability cards: only known ids, no duplicates, at most as many as the scenario allows (0 to 2)
function cleanAbil(a, sc) { const out = []; if (Array.isArray(a)) for (const id of a) if (typeof id === 'string' && Object.prototype.hasOwnProperty.call(D.abilities, id) && !out.includes(id)) out.push(id); return out.slice(0, sc.ab || 0); }
function newGame(o) {
  o = o || {};
  const sc = scen(o.scenario || 'g1'); if (!sc) throw new Error('unknown scenario ' + o.scenario);
  const seed = (o.seed === undefined ? Date.now() : o.seed) | 0;
  const mods = { kero: sc.mods.includes('kero'), leak: sc.mods.includes('leak'), wind: sc.mods.includes('wind'), intern: sc.mods.includes('intern'), ice: sc.mods.includes('ice'), real: sc.mods.includes('real') };
  mods.fuel = mods.kero || mods.leak;
  const tr = D.tracks[sc.trk];
  mods.tabs = tr.sp.some(s => s[2]); mods.traffic = tr.sp.some(s => s[1] > 0);
  const G = { v: 1, seed, rng: seed, sid: sc.id, tk: sc.trk, alt: sc.alt, row0: 0, mods, abil: cleanAbil(o.abil, sc), names: (o.names || ['Captain Marlow', 'First Officer Okoro']).slice(0, 2), ai: o.ai ? o.ai.slice(0, 2) : [null, null],
    round: 0, phase: 'brief', first: 0, turn: 0, ready: [false, false], say: [[], []],
    pl: { axis: 0, aeroB: 4, aeroO: 8, pos: 1, kero: D.keroStart, wind: D.windStart, ice: 0, sw: { lg: [0, 0, 0], fl: [0, 0, 0, 0], br: [0, 0, 0] } },
    planes: tr.sp.map(s => s[0]), coffee: 0, rrHand: 0, rrTaken: -1,
    dice: [[], []], slots: {}, keys: slotKeys(mods), pend: null, fl: { antic: false, sync: false, wt: false, keroUsed: false }, adaptUsed: [false, false],
    intern: [], internUsed: 0, speed: -1, landSpeed: -1, result: null, log: [], logN: 0, events: [], evN: 0, used: {}, nolog: false };
  for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) G.dice[s].push({ v: 1, u: true });
  if (mods.intern) G.intern = shuffle(G, [1, 2, 3, 4, 5, 6]);
  lg(G, 'Briefing for ' + D.airports[sc.ap].name + ': ' + sc.title + '.');
  startRound(G);
  return G;
}

// ---------- round flow ----------
function startRound(G) {
  const row = altRow(G);
  G.first = row[1]; G.turn = G.first; G.phase = 'brief'; G.ready = [false, false]; G.say = [[], []]; G.slots = {}; G.pend = null; G.speed = -1;
  G.fl = { antic: false, sync: false, wt: false, keroUsed: false };
  for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) G.dice[s][i].u = true;
  ev(G, { t: 'round', r: G.round + 1, ft: row[0], first: G.first, fin: isFinal(G) });
  lg(G, 'Round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + ' at ' + row[0] + ' ft' + (isFinal(G) ? ' (final round: landing)' : '') + '.');
  if (row[2] && G.rrTaken < G.round) { G.rrHand++; G.rrTaken = G.round; ev(G, { t: 'rrget' }); lg(G, 'A reroll token comes aboard.'); }
  // traffic die: once for each icon on the space the plane stands on
  const sp = track(G).sp[G.pl.pos - 1];
  if (sp && sp[1] > 0) {
    for (let k = 0; k < sp[1]; k++) {
      const v = D.speedFaces[rnd(G, 6)], at = Math.min(G.pl.pos + v - 1, track(G).sp.length);
      let added = false;
      if (planesOnTrack(G) < D.planeSupply) { G.planes[at - 1]++; added = true; }
      ev(G, { t: 'traffic', v, at, added }); lg(G, 'Traffic die: ' + v + (added ? ': a plane appears on space ' + at + '.' : ': no plane left to add.'));
      use(G, 'trafficRoll');
    }
  }
}
function rollDice(G) {
  for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) { const d = G.dice[s][i]; d.v = d6(G); d.u = false; }
  // guided flights use made-up hands so each lesson has a die to teach with: G.script[round] = [[pilot x4], [co-pilot x4]]
  if (G.script && G.script[G.round]) for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) G.dice[s][i].v = G.script[G.round][s][i];
  G.phase = 'place'; G.turn = G.first;
  ev(G, { t: 'roll' }); lg(G, 'Both crew roll their dice behind the screens. Silence in the cockpit.');
}
function nextTurn(G, from) {
  if (G.pend || G.result) return;
  const a = unusedDice(G, 0).length, b = unusedDice(G, 1).length;
  if (!a && !b) { endRound(G); return; }
  const other = 1 - from;
  G.turn = (other === 0 ? a : b) ? other : from;
}
function lose(G, why, msg) {
  if (G.result) return;
  G.result = { win: false, why, msg, checks: landingChecks(G) }; G.phase = 'over'; G.pend = null;
  ev(G, { t: 'lose', why, msg }); lg(G, 'LOST: ' + msg); use(G, 'lose_' + why);
}
function landingChecks(G) {
  const c = { planes: planesOnTrack(G) === 0, gear: G.pl.sw.lg.every(x => x), flaps: G.pl.sw.fl.every(x => x), axis: G.pl.axis === 0, speed: G.landSpeed >= 0 && G.landSpeed <= brakeVal(G) && brakeVal(G) >= 2 };
  if (G.mods.intern) c.intern = G.intern.length === 0;
  if (G.mods.ice) c.ice = G.pl.ice === 4;
  return c;
}
function endRound(G) {
  G.pend = null;
  const miss = ['ax0', 'ax1', 'en0', 'en1'].filter(k => !G.slots[k]);
  if (miss.length) { lose(G, 'mandatory', 'Missing at the end of the round: ' + miss.map(k => 'the ' + (SLOT[k].s ? 'Co-pilot' : 'Pilot') + "'s " + (SLOT[k].grp === 'axis' ? 'axis' : 'engine') + ' die').join(' and ') + '.'); G.result.miss = miss; return; }
  if (G.mods.kero && !G.fl.keroUsed) { G.pl.kero -= D.keroSkip; ev(G, { t: 'kero', n: G.pl.kero, d: -D.keroSkip }); lg(G, 'Nobody used the fuel space: lose ' + D.keroSkip + ' fuel (' + G.pl.kero + ' left).'); if (G.pl.kero < 0) { lose(G, 'fuel', 'The fuel ran out.'); return; } }
  ev(G, { t: 'endround' });
  if (isFinal(G)) {
    const c = landingChecks(G), ok = Object.values(c).every(Boolean);
    G.result = { win: ok, why: ok ? 'landed' : 'checks', msg: ok ? 'Landed! The passengers applaud.' : 'The landing failed.', checks: c }; G.phase = 'over';
    ev(G, { t: ok ? 'win' : 'lose', why: G.result.why, msg: G.result.msg, checks: c }); lg(G, ok ? 'LANDED.' : 'LOST: the landing failed (' + Object.keys(c).filter(k => !c[k]).join(', ') + ').'); use(G, ok ? 'win' : 'lose_checks');
    return;
  }
  G.round++;
  if (isFinal(G) && G.pl.pos < track(G).sp.length) { lose(G, 'short', 'The plane reached the last altitude before reaching the airport.'); return; }
  startRound(G);
}

// ---------- effects of placing ----------
function brakeSwitch(G, ix) { G.pl.sw.br[ix] = 1; }
function removePlane(G, v) {
  const at = G.pl.pos + v - 1, sp = track(G).sp;
  const had = at >= 1 && at <= sp.length && G.planes[at - 1] > 0;
  if (had) G.planes[at - 1]--;
  ev(G, { t: 'radio', at, v, ok: had }); lg(G, had ? 'Radio: a plane leaves space ' + at + '.' : 'Radio: nothing on space ' + at + '.');
  if (had) use(G, 'radioClear');
}
function advance(G, steps) {
  const sp = track(G).sp, size = sp.length;
  for (let i = 0; i < steps; i++) {
    const cur = G.pl.pos <= size ? sp[G.pl.pos - 1] : null;
    if (cur && G.mods.tabs && cur[2] && !cur[2].includes(G.pl.axis)) { lose(G, 'corridor', 'The axis was outside the corridor while leaving space ' + G.pl.pos + '.'); return false; }
    if (cur && G.planes[G.pl.pos - 1] > 0) { lose(G, 'collision', 'Collision with a plane on space ' + G.pl.pos + '.'); return false; }
    if (G.pl.pos >= size) { lose(G, 'overshoot', 'The plane overshot the airport.'); return false; }
    G.pl.pos++;
    ev(G, { t: 'step', pos: G.pl.pos });
  }
  return true;
}
function afterAxis(G) {
  const a = G.slots.ax0, b = G.slots.ax1; if (!a || !b) return true;
  const diff = b.v - a.v, from = G.pl.axis; G.pl.axis += diff;
  ev(G, { t: 'axis', from, to: G.pl.axis, p: a.v, c: b.v });
  lg(G, 'Axis: ' + (diff === 0 ? 'level dice, no change' : 'tilts ' + Math.abs(diff) + ' toward the ' + (diff < 0 ? 'Pilot' : 'Co-pilot')) + ' (now ' + (G.pl.axis === 0 ? 'level' : Math.abs(G.pl.axis) + ' ' + (G.pl.axis < 0 ? 'left' : 'right')) + ').');
  if (diff !== 0) use(G, 'axisMove');
  if (diff === 0 && G.abil.includes('control') && G.coffee < D.coffeeMax && coffeeReserve(G) > 0) { G.coffee++; ev(G, { t: 'coffee', n: G.coffee, why: 'control' }); lg(G, 'Steady Hands: equal axis dice earn a coffee.'); use(G, 'abil_control'); }
  if (Math.abs(G.pl.axis) >= 3) { lose(G, 'spin', 'The plane tilted too far and went into a spin.'); return false; }
  if (G.mods.wind) { const w0 = G.pl.wind; G.pl.wind = ((G.pl.wind + G.pl.axis) % 20 + 20) % 20; ev(G, { t: 'wind', from: w0, to: G.pl.wind, mod: windMod(G) }); lg(G, 'Wind dial turns to ' + (windMod(G) >= 0 ? '+' : '') + windMod(G) + '.'); }
  return true;
}
const coffeeReserve = G => D.coffeeMax - G.coffee;
function afterEngines(G) {
  const a = G.slots.en0, b = G.slots.en1; if (!a || !b) return true;
  const sum = a.v + b.v, wm = windMod(G), s = sum + wm; G.speed = s;
  if (G.abil.includes('mastery') && a.v === b.v && rrReserve(G) > 0) { G.rrHand++; ev(G, { t: 'rrget', why: 'mastery' }); lg(G, 'Twin Thrust: equal engine dice earn a reroll token.'); use(G, 'abil_mastery'); }
  if (G.mods.leak) { const burn = Math.abs(a.v - b.v) + 1; G.pl.kero -= burn; ev(G, { t: 'kero', n: G.pl.kero, d: -burn }); lg(G, 'Fuel leak: lose ' + burn + ' (' + G.pl.kero + ' left).'); if (G.pl.kero < 0) { lose(G, 'fuel', 'The fuel ran out.'); return false; } }
  if (isFinal(G)) {
    G.landSpeed = s; const br = brakeVal(G);
    ev(G, { t: 'engine', sum, wm, s, final: true, brake: br }); lg(G, 'Landing speed ' + s + (wm ? ' (wind ' + (wm > 0 ? '+' : '') + wm + ')' : '') + ' against brakes ' + br + '.');
    if (s > br || br < 2) { lose(G, 'speed', br < 2 ? 'No brakes were set: the plane cannot stop.' : 'Too fast: speed ' + s + ' is above the brakes (' + br + ').'); return false; }
    return true;
  }
  const adv = s <= G.pl.aeroB ? 0 : s <= G.pl.aeroO ? 1 : 2;
  ev(G, { t: 'engine', sum, wm, s, adv, final: false }); lg(G, 'Speed ' + s + (wm ? ' (wind ' + (wm > 0 ? '+' : '') + wm + ')' : '') + ': the plane advances ' + adv + ' space' + (adv === 1 ? '' : 's') + '.');
  use(G, 'adv' + adv);
  if (adv > 0 && !advance(G, adv)) return false;
  return true;
}
function applyEffect(G, seat, key, v, val) {   // val = final die value, v = whether it came from a token (no change in effect)
  const S = SLOT[key], grp = S.grp;
  if (grp === 'axis') return afterAxis(G);
  if (grp === 'engines') return afterEngines(G);
  if (grp === 'radio') { removePlane(G, val); return true; }
  if (grp === 'gear') { if (!G.pl.sw.lg[S.ix]) { G.pl.sw.lg[S.ix] = 1; G.pl.aeroB++; ev(G, { t: 'sw', g: 'lg', ix: S.ix, aero: G.pl.aeroB }); lg(G, 'Landing gear ' + (S.ix + 1) + ' down. Blue marker at ' + G.pl.aeroB + '.'); use(G, 'gear'); } return true; }
  if (grp === 'flaps') { if (!G.pl.sw.fl[S.ix]) { G.pl.sw.fl[S.ix] = 1; G.pl.aeroO++; ev(G, { t: 'sw', g: 'fl', ix: S.ix, aero: G.pl.aeroO }); lg(G, 'Flaps ' + (S.ix + 1) + ' out. Orange marker at ' + G.pl.aeroO + '.'); use(G, 'flaps'); } return true; }
  if (grp === 'brakes') { if (!G.pl.sw.br[S.ix]) { G.pl.sw.br[S.ix] = 1; ev(G, { t: 'sw', g: 'br', ix: S.ix, brake: brakeVal(G) }); lg(G, 'Brakes: marker at ' + brakeVal(G) + '.'); use(G, 'brakes'); } return true; }
  if (grp === 'conc') { if (G.coffee < D.coffeeMax) { G.coffee++; ev(G, { t: 'coffee', n: G.coffee, why: 'conc' }); lg(G, 'Concentration: a coffee token.'); use(G, 'coffeeGain'); } else { ev(G, { t: 'coffee', n: G.coffee, why: 'full' }); lg(G, 'Concentration: already three coffees, the die is simply spent.'); } return true; }
  if (grp === 'kero') { G.pl.kero -= val; G.fl.keroUsed = true; ev(G, { t: 'kero', n: G.pl.kero, d: -val }); lg(G, 'Fuel space: burn ' + val + ' (' + G.pl.kero + ' left).'); use(G, 'keroDie'); if (G.pl.kero < 0) { lose(G, 'fuel', 'The fuel ran out.'); return false; } return true; }
  if (grp === 'intern') {
    const tok = seat === 0 ? G.intern.shift() : G.intern.pop(); G.internUsed++;
    G.pend = { h: 'intern', d: { seat, val: tok } }; ev(G, { t: 'intern', seat, val: tok }); lg(G, 'The trainee gets token ' + tok + ' and must place it now.'); use(G, 'internTrain'); return true;
  }
  if (grp === 'ice') {
    if (S.ix !== G.pl.ice) return true;
    const t = G.slots['it' + S.ix], b = G.slots['ib' + S.ix];
    if (t && b) { G.pl.ice++; ev(G, { t: 'ice', n: G.pl.ice, brake: brakeVal(G) }); lg(G, 'Icy runway: column ' + G.pl.ice + ' done. Brake marker at ' + brakeVal(G) + '.'); use(G, 'iceCol'); }
    return true;
  }
  return true;
}

// ---------- legality ----------
function fits(G, seat, key, val, mode) {   // mode: 'die' (own colour), 'any' (cross-check die: any colour), 'tok' (trainee token: own colour, not concentration)
  const S = SLOT[key]; if (!S || !G.keys.includes(key) || G.slots[key]) return false;
  if (mode !== 'any' && S.s !== null && S.s !== seat) return false;
  if (S.vals && !S.vals.includes(val)) return false;
  switch (S.grp) {
    case 'flaps': if (S.ix > 0 && !G.pl.sw.fl[S.ix - 1]) return false; break;
    case 'brakes': if (S.ix > 0 && !G.pl.sw.br[S.ix - 1]) return false; break;
    case 'ice': if (S.ix !== G.pl.ice) return false; break;
    case 'intern': if (mode === 'any' || mode === 'tok') return false; if (!G.intern.length) return false; if (val === (seat === 0 ? G.intern[0] : G.intern[G.intern.length - 1])) return false; break;
    case 'conc': if (mode === 'tok') return false; break;
  }
  return true;
}
function placeMoves(G, seat, out) {
  const h = G.dice[seat];
  for (let i = 0; i < 4; i++) {
    const d = h[i]; if (d.u) continue;
    for (let c = -Math.min(G.coffee, d.v - 1); c <= Math.min(G.coffee, 6 - d.v); c++) {
      const val = d.v + c;
      for (const key of G.keys) if (fits(G, seat, key, val, 'die')) out.push({ t: 'place', d: i, to: key, c });
    }
  }
}
function pendMoves(G, seat, out) {
  const p = G.pend; if (!p) return;
  if (p.h === 'intern' && p.d.seat === seat) { for (const key of G.keys) if (fits(G, seat, key, p.d.val, 'tok')) out.push({ t: 'place', d: 'p', to: key, c: 0 }); if (!out.length) out.push({ t: 'toss', d: 'p' }); }
  else if (p.h === 'sync' && seat === 1) {
    for (let c = -Math.min(G.coffee, p.d.val - 1); c <= Math.min(G.coffee, 6 - p.d.val); c++) for (const key of G.keys) if (fits(G, 1, key, p.d.val + c, 'any')) out.push({ t: 'place', d: 'p', to: key, c });
    if (!out.length) out.push({ t: 'toss', d: 'p' });
  } else if (p.h === 'rr') { if (!p.d.m[seat]) out.push({ t: 'rrpick', m: [false, false, false, false] }); }
  else if (p.h === 'wt' && seat !== p.d.a) { for (const i of unusedDice(G, seat)) out.push({ t: 'wt2', d: i }); }
}
function validMoves(G, seat) {
  const out = [];
  if (!G || G.result || (seat !== 0 && seat !== 1)) return out;
  if (G.phase === 'brief') {
    if (!G.ready[seat]) { out.push({ t: 'ready' }); for (const c of SAYS) if (!G.say[seat].includes(c) && G.say[seat].length < 3) out.push({ t: 'say', c }); }
    return out;
  }
  if (G.phase !== 'place') return out;
  if (G.pend) { pendMoves(G, seat, out); if (G.mods.real) out.push({ t: 'timeout' }); return out; }
  const h = unusedDice(G, seat);
  if (G.turn === seat && h.length) {
    const start = out.length; placeMoves(G, seat, out);
    if (out.length === start) for (const i of h) out.push({ t: 'toss', d: i });
  }
  // free actions: "at any time during the round", so either seat may use them while no question is open, not only on its own turn
  if (G.rrHand > 0 && (h.length || unusedDice(G, 1 - seat).length)) out.push({ t: 'rr' });
  if (G.turn === seat && h.length && G.abil.includes('antic') && seat === G.first && !G.fl.antic && !Object.values(G.slots).some(x => x.s === seat)) for (const i of h) out.push({ t: 'antic', d: i });
  if (G.abil.includes('adapt') && !G.adaptUsed[seat]) for (const i of h) out.push({ t: 'adapt', d: i });
  if (G.abil.includes('together') && !G.fl.wt && unusedDice(G, 1 - seat).length) for (const i of h) out.push({ t: 'wt', d: i });
  if (G.mods.real && G.turn === seat) out.push({ t: 'timeout' });
  return out;
}
const SAYS = ['adv0', 'adv1', 'adv2', 'plane', 'level', 'gear', 'flaps', 'brakes', 'coffee', 'slow', 'fuel', 'trainee', 'first', 'ok'];

function pendingSeats(G) {
  if (!G || G.result) return [];
  if (G.phase === 'brief') return [0, 1].filter(s => !G.ready[s]);
  if (G.pend) { const p = G.pend; if (p.h === 'intern') return [p.d.seat]; if (p.h === 'sync') return [1]; if (p.h === 'rr') return [0, 1].filter(s => !p.d.m[s]); if (p.h === 'wt') return [1 - p.d.a]; }
  return G.phase === 'place' ? [G.turn] : [];
}
const sideToAct = G => { const p = pendingSeats(G); return p.length ? p[0] : -1; };

// ---------- performing a move ----------
function afterPlace(G, seat) {
  // cross-check: once a gear die and a flap die are down this round, roll the traffic die for the co-pilot
  if (G.abil.includes('sync') && !G.fl.sync && !G.result && !G.pend) {
    const hasG = Object.keys(G.slots).some(k => SLOT[k].grp === 'gear'), hasF = Object.keys(G.slots).some(k => SLOT[k].grp === 'flaps');
    if (hasG && hasF) { G.fl.sync = true; const v = D.speedFaces[rnd(G, 6)]; G.pend = { h: 'sync', d: { seat: 1, val: v } }; ev(G, { t: 'sync', v }); lg(G, 'Cross-check: the traffic die shows ' + v + '. The co-pilot places it.'); use(G, 'abil_sync'); }
  }
}
function performMove(G, m, seat, trust) {
  if (!G || G.result) return { ok: false, error: 'the game is over' };
  if ((seat !== 0 && seat !== 1) || !m || typeof m !== 'object') return { ok: false, error: 'bad move' };
  if (!trust) { const ok = validMoves(G, seat).find(x => same(x, m)); if (!ok) return { ok: false, error: 'illegal move' }; }
  if (!G.nolog) G.events = [];
  switch (m.t) {
    case 'say': G.say[seat].push(m.c); ev(G, { t: 'say', seat, c: m.c }); break;
    case 'ready': G.ready[seat] = true; ev(G, { t: 'ready', seat }); if (G.ready[0] && G.ready[1]) rollDice(G); break;
    case 'place': {
      let val, src;
      if (m.d === 'p') { val = G.pend.d.val + (m.c || 0); src = G.pend.h === 'intern' ? 'i' : 'x'; }
      else { const d = G.dice[seat][m.d]; val = d.v + m.c; src = 'd'; d.u = true; d.v = val; }
      if (m.c) { G.coffee -= Math.abs(m.c); use(G, 'coffeeSpend', Math.abs(m.c)); ev(G, { t: 'coffeeuse', seat, n: Math.abs(m.c), d: m.c }); }
      const wasPend = G.pend; if (m.d === 'p') G.pend = null;
      G.slots[m.to] = { s: seat, v: val, k: src };
      ev(G, { t: 'place', seat, to: m.to, v: val, c: m.c || 0, d: m.d, k: src });
      lg(G, (seat === 0 ? 'Pilot' : 'Co-pilot') + ' puts a ' + val + ' on ' + niceSlot(m.to) + (m.c ? ' (coffee ' + (m.c > 0 ? '+' : '') + m.c + ')' : '') + '.');
      use(G, 'place_' + SLOT[m.to].grp);
      applyEffect(G, seat, m.to, src, val);
      if (!G.result) afterPlace(G, seat);
      if (!G.result && !G.pend) nextTurn(G, G.turn);
      break;
    }
    case 'toss': {
      if (m.d === 'p') { const p = G.pend; G.pend = null; if (p && p.h === 'intern') { if (p.d.seat === 0) G.intern.unshift(p.d.val); else G.intern.push(p.d.val); G.internUsed--; ev(G, { t: 'internback', seat, val: p.d.val }); lg(G, 'The trainee token ' + p.d.val + ' has nowhere to go and goes back to the row.'); use(G, 'internBack'); } }
      else G.dice[seat][m.d].u = true;
      ev(G, { t: 'toss', seat, d: m.d }); lg(G, (seat === 0 ? 'Pilot' : 'Co-pilot') + ' has no legal place and puts a die aside.'); use(G, 'toss');
      nextTurn(G, G.turn);
      break;
    }
    case 'rr': G.rrHand--; G.pend = { h: 'rr', d: { m: [0, 1].map(s => unusedDice(G, s).length ? null : [false, false, false, false]), by: seat } }; ev(G, { t: 'rruse', seat }); lg(G, 'A reroll token is spent: both crew may reroll.'); use(G, 'rerollUse'); break;
    case 'rrpick': {
      const mask = m.m.map((b, i) => !!b && !G.dice[seat][i].u); G.pend.d.m[seat] = mask; ev(G, { t: 'rrdone', seat });
      if (G.pend.d.m[0] && G.pend.d.m[1]) {
        const n = [0, 0];
        for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) if (G.pend.d.m[s][i]) { G.dice[s][i].v = d6(G); n[s]++; }
        ev(G, { t: 'reroll', n }); lg(G, 'Rerolled: Pilot ' + n[0] + ' dice, Co-pilot ' + n[1] + ' dice.'); G.pend = null;
      }
      break;
    }
    case 'antic': G.fl.antic = true; G.dice[seat][m.d].v = d6(G); ev(G, { t: 'antic', seat }); lg(G, 'Second Look: the first player rerolls one die.'); use(G, 'abil_antic'); break;
    case 'adapt': { const d = G.dice[seat][m.d]; d.v = 7 - d.v; G.adaptUsed[seat] = true; ev(G, { t: 'adapt', seat }); lg(G, (seat === 0 ? 'Pilot' : 'Co-pilot') + ' flips a die (Flip Side).'); use(G, 'abil_adapt'); break; }
    case 'wt': G.pend = { h: 'wt', d: { a: seat, ai: m.d } }; ev(G, { t: 'wtstart', seat }); break;
    case 'wt2': {
      const a = G.pend.d.a, ai = G.pend.d.ai, A = G.dice[a][ai], B = G.dice[seat][m.d], t = A.v; A.v = B.v; B.v = t; G.fl.wt = true; G.pend = null;
      ev(G, { t: 'wt', a, ai, b: seat, bi: m.d }); lg(G, 'Hand-Over: the two dice swap values.'); use(G, 'abil_together'); break;
    }
    case 'timeout': {
      for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) G.dice[s][i].u = true;
      G.pend = null; ev(G, { t: 'timeout' }); lg(G, 'The timer ran out: unplaced dice are ignored.'); use(G, 'timeout'); endRound(G); break;
    }
  }
  return { ok: true };
}
const niceSlot = k => ({ ax0: 'the axis (pilot)', ax1: 'the axis (co-pilot)', en0: 'the engines (pilot)', en1: 'the engines (co-pilot)', ra0: 'the radio', ra1: 'the radio', ra2: 'the radio', ke: 'the fuel space', in0: 'the trainee space', in1: 'the trainee space' }[k] || ({ gear: 'landing gear', flaps: 'the flaps', brakes: 'the brakes', conc: 'concentration', ice: 'the icy-runway brakes' }[SLOT[k].grp]));
function same(a, b) {
  if (a.t !== b.t) return false;
  switch (a.t) {
    case 'say': return a.c === b.c;
    case 'place': return a.d === b.d && a.to === b.to && (a.c || 0) === (b.c || 0);
    case 'toss': case 'antic': case 'adapt': case 'wt': case 'wt2': return a.d === b.d;
    case 'rrpick': return Array.isArray(b.m) && b.m.length === 4 && b.m.every(x => typeof x === 'boolean' || x === 0 || x === 1);
    default: return true;
  }
}

// ---------- hidden information ----------
// What a seat may know: its own dice values, everything public (slots, tracks, tokens, who has dice left, who has chosen a reroll).
function stripView(G, seat) {
  const V = clone(G); V.rng = 0; V.seed = 0; delete V.script;
  for (let s = 0; s < 2; s++) if (s !== seat) { for (const d of V.dice[s]) d.v = 0; }
  if (V.pend && V.pend.h === 'rr') V.pend.d.m = V.pend.d.m.map((m, s) => s === seat ? m : (m ? [] : null));
  if (V.pend && V.pend.h === 'wt' && V.pend.d.a !== seat) V.pend.d.ai = -1;
  return V;
}
function checkInvariants(G) {
  const e = [];
  if (!G) return ['no game'];
  const used = [0, 0];
  for (let s = 0; s < 2; s++) { if (G.dice[s].length !== 4) e.push('dice count'); for (const d of G.dice[s]) if (!(d.v >= 0 && d.v <= 6)) e.push('die value ' + d.v); }
  for (const k of Object.keys(G.slots)) { const S = SLOT[k]; if (!S) { e.push('bad slot ' + k); continue; } if (!G.keys.includes(k)) e.push('slot not in play ' + k); const x = G.slots[k]; if (!(x.v >= 1 && x.v <= 6)) e.push('slot value ' + k + '=' + x.v); if (x.k === 'd') used[x.s]++; if (S.vals && !S.vals.includes(x.v)) e.push('slot value not allowed ' + k); }
  if (G.phase === 'place') for (let s = 0; s < 2; s++) { const un = unusedDice(G, s).length, placed = used[s]; if (un + placed > 4) e.push('dice accounting seat ' + s); }
  const pt = planesOnTrack(G); if (pt > D.planeSupply) e.push('too many planes ' + pt); if (G.planes.some(x => x < 0)) e.push('negative planes');
  if (G.planes.length !== track(G).sp.length) e.push('plane array length');
  if (G.coffee < 0 || G.coffee > D.coffeeMax) e.push('coffee ' + G.coffee);
  if (rrReserve(G) < 0) e.push('reroll tokens negative reserve ' + rrReserve(G)); if (G.rrHand < 0) e.push('rr hand');
  if (G.pl.aeroB !== 4 + G.pl.sw.lg.reduce((a, b) => a + b, 0)) e.push('blue marker'); if (G.pl.aeroO !== 8 + G.pl.sw.fl.reduce((a, b) => a + b, 0)) e.push('orange marker');
  G.pl.sw.fl.forEach((x, i) => { if (x && i > 0 && !G.pl.sw.fl[i - 1]) e.push('flap order'); }); G.pl.sw.br.forEach((x, i) => { if (x && i > 0 && !G.pl.sw.br[i - 1]) e.push('brake order'); });
  if (!G.result && Math.abs(G.pl.axis) >= 3) e.push('axis out of range');
  if (G.pl.pos < 1 || G.pl.pos > track(G).sp.length + (G.result ? 1 : 0)) e.push('position ' + G.pl.pos);
  if (G.mods.fuel && !G.result && G.pl.kero < 0) e.push('fuel below 0 but not over');
  if (G.mods.intern) { if (G.intern.length + G.internUsed !== 6) e.push('trainee tokens'); if (new Set(G.intern).size !== G.intern.length) e.push('trainee dup'); }
  if (G.mods.wind && (G.pl.wind < 0 || G.pl.wind > 19)) e.push('wind');
  if (G.mods.ice && (G.pl.ice < 0 || G.pl.ice > 4)) e.push('ice');
  if (G.round < 0 || G.round >= D.rounds - G.row0) e.push('round');
  if (G.phase === 'place' && !G.pend && !G.result && !(G.turn === 0 || G.turn === 1)) e.push('turn');
  if (G.phase === 'place' && !G.pend && !G.result && unusedDice(G, G.turn).length === 0 && (unusedDice(G, 0).length + unusedDice(G, 1).length) > 0) e.push('turn holder has no dice');
  if (G.phase === 'over' && !G.result) e.push('over without result');
  if (G.result && G.phase !== 'over') e.push('result without over');
  if (G.pend && !['intern', 'sync', 'rr', 'wt'].includes(G.pend.h)) e.push('bad pending');
  return e;
}

// ---------- lite copy for rollouts, text snapshot ----------
function cloneLite(G) {
  const o = Object.assign({}, G);
  o.pl = { axis: G.pl.axis, aeroB: G.pl.aeroB, aeroO: G.pl.aeroO, pos: G.pl.pos, kero: G.pl.kero, wind: G.pl.wind, ice: G.pl.ice, sw: { lg: G.pl.sw.lg.slice(), fl: G.pl.sw.fl.slice(), br: G.pl.sw.br.slice() } };
  o.planes = G.planes.slice(); o.dice = [G.dice[0].map(d => ({ v: d.v, u: d.u })), G.dice[1].map(d => ({ v: d.v, u: d.u }))];
  const sl = {}; for (const k in G.slots) { const x = G.slots[k]; sl[k] = { s: x.s, v: x.v, k: x.k }; } o.slots = sl;
  o.fl = Object.assign({}, G.fl); o.adaptUsed = G.adaptUsed.slice(); o.ready = G.ready.slice(); o.intern = G.intern.slice(); o.say = [G.say[0].slice(), G.say[1].slice()];
  o.pend = G.pend ? JSON.parse(JSON.stringify(G.pend)) : null; o.result = null; o.log = []; o.events = []; o.used = {}; o.nolog = true; return o;
}
function toText(G, seat) {
  if (!G) return 'no game';
  const s = G.pl, tr = track(G), row = altRow(G);
  const L = ['FINAL APPROACH ' + G.sid + ' ' + D.airports[scen(G.sid).ap].name + ' | round ' + (G.round + 1) + '/' + (D.rounds - G.row0) + ' ' + row[0] + 'ft | phase ' + G.phase + (G.pend ? '/' + G.pend.h : '') + ' | turn ' + (G.phase === 'place' ? (G.turn === 0 ? 'pilot' : 'co-pilot') : '-')];
  L.push('axis ' + s.axis + ' | speed markers blue ' + s.aeroB + ' orange ' + s.aeroO + ' | brakes ' + brakeVal(G) + (G.mods.ice ? ' (ice col ' + s.ice + '/4)' : '') + ' | gear ' + s.sw.lg.join('') + ' flaps ' + s.sw.fl.join('') + ' | coffee ' + G.coffee + ' reroll ' + G.rrHand + (G.mods.fuel ? ' | fuel ' + s.kero : '') + (G.mods.wind ? ' | wind ' + windMod(G) : '') + (G.mods.intern ? ' | trainee left ' + G.intern.join(',') : ''));
  L.push('track (' + tr.sp.length + ' spaces, you are on ' + s.pos + '): ' + tr.sp.map((x, i) => (i + 1 === s.pos ? '>' : '') + (i + 1) + ':' + G.planes[i] + 'p' + (x[1] ? '/' + x[1] + 'T' : '') + (x[2] ? '/[' + x[2].join(',') + ']' : '')).join('  '));
  L.push('slots: ' + (Object.keys(G.slots).map(k => k + '=' + G.slots[k].v + (G.slots[k].s === 0 ? 'P' : 'C')).join(' ') || 'empty'));
  for (let q = 0; q < 2; q++) L.push((q === 0 ? 'pilot' : 'co-pilot') + ' dice: ' + G.dice[q].map(d => d.u ? '-' : (seat === q || seat === 'all' ? d.v : '?')).join(' ') + (G.ai[q] ? ' (computer ' + G.ai[q] + ')' : ''));
  if (G.result) L.push('RESULT ' + (G.result.win ? 'WIN' : 'LOSS') + ': ' + G.result.msg);
  return L.join('\n');
}

Object.assign(FA, { cleanAbil, newGame, validMoves, performMove, sideToAct, pending: pendingSeats, stripView, checkInvariants, toText, clone, cloneLite, rnd, d6, shuffle, SLOT, SAYS, slotKeys, fits, scen, track, altRow, isFinal, brakeVal, windMod, planesOnTrack, unusedDice, rrReserve, landingChecks, niceSlot,
  _: { startRound, rollDice, endRound, lose, advance, applyEffect, afterAxis, afterEngines, nextTurn, removePlane, ALLKEYS } });
if (typeof module === 'object' && module.exports) module.exports = FA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
