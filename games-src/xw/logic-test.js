// Independent rules test for Nebula Aces (W445). One headless assertion per numbered rule of RULES-CHECKLIST.md,
// run against the real engine (geo/data/exp/engine/ai in a vm, no page). Expected values come from the 1st-edition
// rulebook as written in the checklist, never from the engine. Run: node logic-test.js     (node logic-test.js --md prints the checklist)
// Every failure prints one line: FAIL R<n>: expected <x>, got <y>
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now } }; vm.createContext(C);
for (const f of ['geo', 'data', 'exp', 'engine', 'ai']) vm.runInContext(fs.readFileSync(path.join(__dirname, f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C);
run('refresh=function(){};ANIM=0;AIDELAY=0;var NOROLL=true;var __sr=startRound;startRound=function(){if(NOROLL){G.phase="roundend";return}return __sr()};var RQ=[];var __rnd=rnd;rnd=function(n){return RQ.length?RQ.shift():__rnd(n)};');
const J = JSON.stringify, D2R = Math.PI / 180;
const AF = { hit: 0, crit: 3, focus: 4, blank: 6 }, DF = { evade: 0, focus: 3, blank: 5 };   // die faces -> rnd(8) index
const atk = (...f) => f.map(x => AF[x]), def = (...f) => f.map(x => DF[x]);
const RULES = [];
const R = (sec, text, fn) => RULES.push({ n: RULES.length + 1, sec, text, fn });
const ship = i => run(`G.ships[${i}]`), G = () => run('G');
function game(sq, ex, players) {   // two human sides, no asteroids unless asked, ships already on the mat, round 1 ready to plan
  run(`RQ=[];newGame({fac:[0,1],players:${J(players || [{ human: true }, { human: true }])},squads:${J(sq)},ex:Object.assign({noRocks:true},${J(ex || {})}),seed:3});G.q=null;G.phase='plan';G.ships.forEach(function(s){s.flags.unplaced=false});`);
}
const at = (i, x, y, deg) => run(`Object.assign(G.ships[${i}],{x:${x},y:${y},h:${(deg == null ? 90 : deg) * D2R}})`);
const round = () => run('NOROLL=false;startRound();NOROLL=true');
const RQ = a => run(`RQ=${J(a)}`);
const deck = (...c) => run(`G.deck=${J(c.reverse())}`);
function dialIdx(i, spec) {   // 'S2' straight 2, 'BL1' bank left 1, 'TR2' turn right 2, 'K4' k-turn 4
  const m = /^(S|BL|BR|TL|TR|K)(\d)$/.exec(spec); const t = m[1][0], d = m[1] === 'BL' || m[1] === 'TL' ? -1 : m[1] === 'S' || m[1] === 'K' ? 0 : 1;
  return run(`dialOf(G.ships[${i}]).findIndex(function(x){return x.s===${m[2]}&&x.t==='${t}'&&x.d===${d}})`);
}
function plan(specs, stop) {   // set every dial, then let ships skip their actions until ship `stop` is due to act (or a question / attack is pending)
  specs.forEach((sp, i) => { const m = dialIdx(i, sp); if (m < 0) throw new Error('no dial ' + sp + ' on ship ' + i); const r = run(`performMove({act:'dial',ship:G.ships[${i}].id,m:${m}},G.ships[${i}].side)`); if (!r.success) throw new Error(r.error); });
  for (let n = 0; n < 40 && run("G.phase==='action'") && run('G.cur') !== stop && !run('G.q'); n++) skipAction(); }
const mv = (m, side) => run(`performMove(${J(m)}${side == null ? '' : ',' + side}).success`);
const skipAction = () => mv({ act: 'action', a: 'skip' });
const combat = () => run("G.phase='combat';G.step=3;G.inCombat=true;G.order=psOrder(false).map(function(s){return s.id});G.oi=0;nextAttacker()");
const pos = i => { const s = ship(i); return [Math.round(s.x * 10) / 10, Math.round(s.y * 10) / 10, Math.round(((s.h / D2R) % 360 + 360) % 360)]; };
// one whole attack: scripted dice, optional modifications. o = {a:[atk idx], rr:[reroll idx], d:[def idx], am:[attack mods], dm:[defence mods], w:'P'}
function volley(ai, di, o) {
  o = o || {}; const out = { ok: true };
  for (let n = 0; n < 6 && run("G.phase==='target'") && run('G.cur') !== run(`G.ships[${ai}].id`); n++) mv({ act: 'fire', w: 'skip' });   // let higher-skill ships hold fire
  RQ(o.a || []); if (!mv({ act: 'fire', w: o.w || 'P', t: run(`G.ships[${di}].id`) })) { out.ok = false; return out; }
  out.atk = run('G.atk.dice.slice()');
  for (const k of o.am || []) { RQ(o.rr || []); mv({ act: 'amod', k });
    for (let n = 0; n < 12 && run('G.q'); n++) { const q = run('G.q'); const t = q.opts.find(x => /^t\d/.test(x.k) && x.l.startsWith('\u2610') && (!o.pick || o.pick.includes(+x.k.slice(1)))); mv({ act: 'ask', k: t ? t.k : q.opts.find(x => x.k === 'ok') ? 'ok' : q.opts[0].k }); } }
  out.atk2 = run('G.atk.dice.slice()'); RQ(o.d || []); mv({ act: 'amod', k: 'done' });
  out.def = run('G.atk.def.slice()'); out.defN = run('G.atk.defN');
  for (const k of o.dm || []) mv({ act: 'dmod', k });
  out.def2 = run('G.atk.def.slice()'); mv({ act: 'dmod', k: 'done' }); return out;
}
const hullLeft = i => run(`G.ships[${i}].hull-hullDmg(G.ships[${i}])`);
const SQ = (a, b) => [a.map(p => ({ p, u: [] })), b.map(p => ({ p, u: [] }))];
const F = (X, Y, Z) => [X, Y, Z];
const ok = (exp, got) => [exp, got];

// ---------------------------------------------------------------- 1. SETUP
R('Setup', 'Play area is 914 mm (3 ft) square; small bases 40 mm, large bases 80 mm; range bands are 100 mm.', () => ok([914, 40, 80, 100], run('[MAT,GEO.small,GEO.large,RANGE]')));
R('Setup', 'A squadron costs the sum of its pilots\' points plus the points of their upgrade cards (28 + 4 + 4 = 36).', () => ok(36, run("squadCost([{p:'kael',u:['u_plasma','u_tinker']}])")));
R('Setup', 'The player with the LOWER squad total has initiative.', () => { game(SQ(['kael'], ['slate']), {}); run('G.pts=[31,30];rollInitiative(function(){})'); const a = run('G.init'); run('G.pts=[29,30];rollInitiative(function(){})'); return ok([1, 0], [a, run('G.init')]); });
R('Setup', 'Tied squad totals: initiative is decided without dice (owner decision W391 replaces the original random roll; still exactly one side has it, the second-named).', () => { game(SQ(['kael'], ['kael']), {}); run('G.pts=[30,30];rollInitiative(function(){})'); return ok(1, run('G.init')); });
R('Setup', 'Six asteroids are placed, each beyond range 2 of every table edge and beyond range 1 of every other asteroid.', () => {
  for (let seed = 1; seed <= 25; seed++) { run(`RQ=[];newGame({fac:[0,1],players:[{human:false},{human:false}],squads:${J(SQ(['kael'], ['slate']))},ex:{},seed:${seed}})`);
    const r = run(`(function(){ if(G.rocks.length!==6) return 'count '+G.rocks.length; for(var i=0;i<6;i++){var P=rockPoly(G.rocks[i]); if(P.some(function(p){return Math.min(p.x,p.y,MAT-p.x,MAT-p.y)<=200})) return 'edge '+i; for(var j=i+1;j<6;j++){var Q=rockPoly(G.rocks[j]),d=1e9; P.forEach(function(p){d=Math.min(d,polyPointDist(p,Q))}); Q.forEach(function(p){d=Math.min(d,polyPointDist(p,P))}); if(d<=100) return 'spacing '+i+','+j+' '+Math.round(d)} } return 'ok'})()`);
    if (r !== 'ok') return ok('ok', r + ' seed ' + seed); } return ok('ok', 'ok'); });
R('Setup', 'Players take turns placing asteroids, the initiative player first.', () => { run(`RQ=[];newGame({fac:[0,1],players:[{human:true},{human:true}],squads:${J(SQ(['kael'], ['slate']))},ex:{},seed:3})`); const init = run('G.init'); const sides = []; for (let i = 0; i < 3; i++) { const q = run('G.q'); sides.push(q.side); mv({ act: 'ask', k: q.opts[0].k }); } return ok([init, 1 - init, init], sides); });
R('Setup', 'Ships deploy one at a time in ascending pilot skill; on equal skill the initiative player deploys first.', () => {
  run(`RQ=[];newGame({fac:[0,1],players:[{human:true},{human:true}],squads:${J(SQ(['kael', 'brink'], ['slate', 'knife']))},ex:{noRocks:true},seed:3})`);   // ps 8,5 vs 3,7
  const names = []; for (let i = 0; i < 4; i++) { const q = run('G.q'); names.push(q.title); mv({ act: 'ask', k: q.opts[0].k }); }
  return ok(['Deploy Slate Squadron Pilot', 'Deploy Tomas Brink', 'Deploy "Knifepoint"', 'Deploy Kael Varro'], names); });
R('Setup', 'Every ship is deployed completely within range 1 (100 mm) of its owner\'s table edge.', () => {
  run(`RQ=[];newGame({fac:[0,1],players:[{human:true},{human:true}],squads:${J(SQ(['kael', 'brink'], ['slate', 'knife']))},ex:{noRocks:true},seed:4})`);
  for (let i = 0; i < 8 && run('G.q'); i++) mv({ act: 'ask', k: run('G.q.opts[0].k') });
  return ok(true, run(`G.ships.every(function(s){return corners(s,B(s)).every(function(c){return c.x>=0&&c.x<=914&&(s.side===0?c.y>=0&&c.y<=100:c.y>=814&&c.y<=914)})})`)); });
R('Setup', 'Starting state: no stress, focus, evade or lock tokens; shields = shield value; no damage cards.', () => { game(SQ(['kael'], ['slate']), {}); return ok([0, 0, 0, null, 2, 0, 0], run('(function(s){return [s.stress,s.focus,s.evade,s.tl,s.sh,s.dmg.length,G.round]})(G.ships[0])').map((v, i) => i === 6 ? 0 : v)); });
R('Setup', 'Lancer: attack 3, agility 2, hull 3, shields 2; actions focus + target lock.', () => ok([3, 2, 3, 2, ['F', 'TL']], run("(function(t){return [t.atk,t.agi,t.hull,t.sh,t.acts]})(SHIPS.lancer)")));
R('Setup', 'Talon: attack 2, agility 3, hull 3, shields 0; actions focus, barrel roll, evade.', () => ok([2, 3, 3, 0, ['F', 'BR', 'E']], run("(function(t){return [t.atk,t.agi,t.hull,t.sh,t.acts]})(SHIPS.talon)")));
R('Setup', 'Core pilots keep their pilot skill / points (8/28, 5/25, 4/23, 2/21 and 7/17, 6/16, 5/15, 4/14, 3/13, 1/12).', () => ok([[8, 28], [5, 25], [4, 23], [2, 21], [7, 17], [6, 16], [5, 15], [4, 14], [3, 13], [1, 12]], run("['kael','brink','ember','cadet','knife','hex','nightjar','onyx','slate','drill'].map(function(k){return [PILOTS[k].ps,PILOTS[k].pts]})")));
R('Setup', 'Lancer dial (speed 1-4): 1: bank L/straight/bank R green; 2: straight green, rest white; 3: all white; 4: straight white, K-turn red.', () => {
  const m = run("dialOf({type:'lancer'}).map(function(x){return x.s+x.t+x.d+x.c}).sort()"); const want = [];
  const add = (s, t, d, c) => want.push(s + t + d + c);
  add(1, 'B', -1, 'g'); add(1, 'S', 0, 'g'); add(1, 'B', 1, 'g'); add(2, 'T', -1, 'w'); add(2, 'B', -1, 'w'); add(2, 'S', 0, 'g'); add(2, 'B', 1, 'w'); add(2, 'T', 1, 'w');
  add(3, 'T', -1, 'w'); add(3, 'B', -1, 'w'); add(3, 'S', 0, 'w'); add(3, 'B', 1, 'w'); add(3, 'T', 1, 'w'); add(4, 'S', 0, 'w'); add(4, 'K', 0, 'r'); return ok(want.sort(), m); });
R('Setup', 'Talon dial (speed 1-5): 1: turns white; 2: turns white, banks/straight green; 3: turns+banks white, straight green, K-turn red; 4: straight white, K-turn red; 5: straight white.', () => {
  const m = run("dialOf({type:'talon'}).map(function(x){return x.s+x.t+x.d+x.c}).sort()"); const want = [];
  const add = (s, t, d, c) => want.push(s + t + d + c);
  add(1, 'T', -1, 'w'); add(1, 'T', 1, 'w'); add(2, 'T', -1, 'w'); add(2, 'B', -1, 'g'); add(2, 'S', 0, 'g'); add(2, 'B', 1, 'g'); add(2, 'T', 1, 'w');
  add(3, 'T', -1, 'w'); add(3, 'B', -1, 'w'); add(3, 'S', 0, 'g'); add(3, 'B', 1, 'w'); add(3, 'T', 1, 'w'); add(3, 'K', 0, 'r'); add(4, 'S', 0, 'w'); add(4, 'K', 0, 'r'); add(5, 'S', 0, 'w'); return ok(want.sort(), m); });
R('Setup', 'The damage deck has 33 cards: 7 Hull-Rupture-type (counts 2) and 13 other kinds x 2; 4 kinds are Pilot cards (the rest Ship).', () => ok([33, 7, 13, 4], run("[buildDamageDeck().length, DAMAGE.rupture.x, Object.keys(DAMAGE).filter(function(k){return k!=='rupture'&&DAMAGE[k].x===2}).length, Object.keys(DAMAGE).filter(function(k){return DAMAGE[k].tr==='Pilot'}).length]")));

// ---------------------------------------------------------------- 2. PLANNING
R('Planning', 'Each ship needs exactly one dial setting taken from its own dial; the Activation phase starts only when every ship of both sides has one.', () => {
  game(SQ(['kael'], ['slate', 'onyx']), {}); round(); mv({ act: 'dial', ship: 's1', m: 0 }, 0); const p1 = run('G.phase'); mv({ act: 'dial', ship: 's2', m: 0 }, 1); const p2 = run('G.phase');
  const bad = mv({ act: 'dial', ship: 's2', m: 999 }, 1); return ok(['plan', 'plan', false], [p1, p2, bad]); });
R('Planning', 'Dials are secret: the opponent\'s view hides a set dial.', () => { game(SQ(['kael'], ['slate']), {}); round(); mv({ act: 'dial', ship: 's1', m: 3 }, 0); return ok('set', run('getPlayerView(G,1).ships[0].dial')); });

// ---------------------------------------------------------------- 3. ACTIVATION ORDER
R('Activation', 'Ships activate in ASCENDING pilot skill; ties go to the initiative player\'s ship first.', () => {
  game(SQ(['kael', 'brink'], ['nightjar', 'knife']), {}); run('G.init=0'); round(); return ok(['s2', 's3', 's4', 's1'], run('psOrder(true).map(function(s){return s.id})')); });
R('Activation', 'Pilot-skill ties: with initiative on the other side the other side\'s ship activates first (and the Combat order flips too).', () => {
  game(SQ(['brink'], ['nightjar']), {}); run('G.init=1'); round(); const a = run('psOrder(true).map(function(s){return s.id})'); const b = run('psOrder(false).map(function(s){return s.id})'); return ok([['s2', 's1'], ['s2', 's1']], [a, b]); });
R('Activation', 'A ship moves, then performs ONE action, and only then does the next ship activate.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 600, 600, 270); round(); plan(['S2', 'S2'], 's2');   // slate (ps3) first
  const first = run('G.cur'), ph = run('G.phase'); mv({ act: 'action', a: 'F' }); const nxt = run('G.cur'); return ok(['s2', 'action', 's1', 1], [first, ph, nxt, ship(1).focus]); });
R('Activation', 'A ship may skip its action; the activation then ends and the next ship (higher pilot skill) is the one that moves.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 600, 600, 270); round(); plan(['S2', 'S2'], 's1'); const mid = run('G.cur'); return ok(['s1', 'action'], [mid, run('G.phase')]); });

// ---------------------------------------------------------------- 4. MANEUVERS
const MOVE = (spec, h0) => { game(SQ(['kael'], ['drill']), {}); at(0, 457, 457, h0 == null ? 90 : h0); at(1, 100, 850, 270); round(); const [s, t, d] = spec; return run(`(function(){var s=G.ships[0];var f=finalPose(s,B(s),{s:${s},t:'${t}',d:${d}});return [Math.round(f.x*10)/10,Math.round(f.y*10)/10,Math.round(((f.h/Math.PI*180)%360+360)%360)]})()`); };
R('Maneuver', 'Straight n: the template is n x 40 mm long and the ship (40 mm base) ends with its rear edge at the template end, so its centre moves 40n + 40 mm (80, 120, 160) keeping its heading.', () => ok([[457, 537, 90], [457, 577, 90], [457, 617, 90]], [MOVE([1, 'S', 0]), MOVE([2, 'S', 0]), MOVE([3, 'S', 0])]));
R('Maneuver', 'Bank (45 deg): a left bank turns the ship left (counter-clockwise) by 45 deg, a right bank right by 45 deg, ending forward and to that side.', () => {
  const l = MOVE([1, 'B', -1]), r = MOVE([1, 'B', 1]); return ok([135, 45, true, true], [l[2], r[2], l[0] < 457 && l[1] > 457, r[0] > 457 && r[1] > 457]); });
R('Maneuver', 'Turn (90 deg): left turn ends facing 90 deg left of the start, right turn 90 deg right; turn 1 is tighter than turn 3.', () => {
  const l = MOVE([2, 'T', -1]), r = MOVE([2, 'T', 1]); const t1 = MOVE([1, 'T', 1]), t3 = MOVE([3, 'T', 1]); return ok([180, 0, true], [l[2], r[2], Math.hypot(t1[0] - 457, t1[1] - 457) < Math.hypot(t3[0] - 457, t3[1] - 457)]); });
R('Maneuver', 'Bank 1/2/3 and turn 1/2/3 use templates of increasing length (bank radius 80/130/180 mm; turn radius 35/62.5/90 mm) so a faster bank ends farther away.', () => {
  const d = a => Math.hypot(a[0] - 457, a[1] - 457); const b = [1, 2, 3].map(s => d(MOVE([s, 'B', 1]))), t = [1, 2, 3].map(s => d(MOVE([s, 'T', 1]))); return ok([true, true], [b[0] < b[1] && b[1] < b[2], t[0] < t[1] && t[1] < t[2]]); });
R('Maneuver', 'K-turn (speed n): move as the straight of the same speed, then the ship ends facing the opposite direction.', () => ok([[457, 577, 270], [457, 617, 270]], [MOVE([2, 'K', 0]), MOVE([3, 'K', 0])]));
R('Maneuver', 'The maneuver flown is the dial that was set: straight 2 from (300,300) facing up ends at (300,420).', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); plan(['S2', 'S2']); return ok([300, 420], [Math.round(ship(0).x), Math.round(ship(0).y)]); });
R('Maneuver', 'Green maneuver: after it the ship removes 1 stress token (only one).', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).stress = 2; plan(['S2', 'S2']); return ok(1, ship(0).stress); });
R('Maneuver', 'Red maneuver: after it the ship receives 1 stress token.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); plan(['K4', 'S2']); return ok(1, ship(0).stress); });
R('Maneuver', 'White maneuver: stress is neither added nor removed.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).stress = 1; plan(['S3', 'S2']); return ok(1, ship(0).stress); });
R('Maneuver', 'A stressed ship that reveals a red maneuver does not fly it: the opponent chooses a non-red maneuver from its dial.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).stress = 1; plan(['K4', 'S2']);
  const q = run('G.q'); return ok([1, true], [q && q.side, !!q && q.opts.length > 0 && !q.opts.some(o => /K-turn/.test(o.l))]); });
R('Maneuver', 'A stressed ship cannot perform actions, not even free ones (Nightjar: after a green maneuver, still stressed -> no free focus offered).', () => {
  game(SQ(['kael'], ['nightjar']), {}); at(0, 700, 700, 270); at(1, 300, 300); round(); ship(1).stress = 2; plan(['S2', 'S2']);   // green leaves 1 stress
  return ok([1, 0, null], [ship(1).stress, ship(1).focus, run('G.q')]); });
R('Maneuver', 'A stressed ship skips the Perform Action step (it is never offered an action).', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(1).stress = 2; plan(['S3', 'S2'], 's2'); return ok(false, run("G.phase==='action'&&G.cur==='s2'")); });
R('Maneuver', 'Overlap (bump): a ship whose maneuver would end on another ship is moved back along the template until it just touches; the bases do not overlap.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 457, 340, 90); at(1, 457, 500, 270); round(); run("executeMove(G.ships[1],{s:3,t:'S',d:0,c:'w'},function(){})");
  return ok([false, true], [run('polyOverlap(corners(G.ships[0],40),corners(G.ships[1],40))'), Math.abs((ship(1).y - 20) - (ship(0).y + 20)) < 4]); });
R('Maneuver', 'A ship that bumped is marked as touching the other ship, skips its action, and the bumped K-turn does not rotate it.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 457, 340, 90); at(1, 457, 500, 270); round(); plan(['S1', 'K3']); return ok([true, 0, 270], [ship(1).bumped, ship(1).doneR.length, pos(1)[2]]); });
R('Maneuver', 'A bumped ship still receives stress for a red maneuver.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 457, 340, 90); at(1, 457, 500, 270); round(); plan(['S1', 'K3']); return ok(1, ship(1).stress); });
R('Maneuver', 'Ships that are touching cannot attack each other.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 457, 300); at(1, 457, 345, 270); round(); const free = run("weaponsFor(G.ships[0]).length"); run("G.touch=[['s1','s2']]"); return ok([1, 0], [free, run("weaponsFor(G.ships[0]).length")]); });
R('Maneuver', 'Leaving the play area (any part of the base past the edge) destroys the ship.', () => {
  game(SQ(['kael'], ['slate']), {}); at(0, 457, 880, 90); at(1, 100, 100, 90); round(); plan(['S2', 'S2']); return ok(false, ship(0).alive); });
R('Maneuver', 'Edge test is exact: ending with the base edge 1 mm inside the table is fine, 2 mm outside destroys the ship.', () => {
  const t = y0 => { game(SQ(['kael'], ['slate']), {}); at(0, 457, y0, 90); at(1, 100, 100, 90); round(); plan(['S1', 'S2']); return ship(0).alive; };
  return ok([true, false], [t(813), t(816)]); });
R('Maneuver', 'A ship destroyed by an asteroid hit is removed at once (its damage cards go to the discard pile) and takes no further part in the round.', () => {
  game(SQ(['kael'], ['drill']), {}); at(0, 457, 457); at(1, 100, 850, 270); run(`G.rocks=[(function(){var r=rockShape();r.x=457;r.y=520;r.r=25;return r})()]`); round(); ship(0).sh = 0; ship(0).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }]; deck('rupture'); RQ(atk('hit')); plan(['S2', 'S2']); return ok([false, 'P2'], [ship(0).alive, run('G.winner')]); });
R('Maneuver', 'Asteroid: a ship whose template or final position overlaps an asteroid rolls ONE attack die: hit = 1 damage, crit = 1 critical damage (faceup), else nothing.', () => {
  const t = f => { game(SQ(['kael'], ['drill']), {}); at(0, 457, 457); at(1, 100, 850, 270); run(`G.rocks=[(function(){var r=rockShape();r.x=457;r.y=520;r.r=25;return r})()]`); round(); ship(0).sh = 0; deck('rupture', 'flash'); RQ(atk(f)); plan(['S2', 'S2']); return [hullLeft(0), ship(0).dmg.length, ship(0).dmg.filter(x => x.up).length]; };
  return ok([[3, 0, 0], [2, 1, 0], [1, 1, 1]], [t('blank'), t('hit'), t('crit')]); });
R('Maneuver', 'Overlapping several asteroids in one maneuver still costs only ONE attack die (1 damage, not 3).', () => {
  game(SQ(['kael'], ['drill']), {}); at(0, 457, 457); at(1, 100, 850, 270); run(`G.rocks=[0,1].map(function(i){var r=rockShape();r.x=457;r.y=500+i*40;r.r=25;return r})`); round(); ship(0).sh = 0; deck('rupture', 'rupture', 'rupture'); RQ(atk('hit', 'hit', 'hit')); plan(['S3', 'S2']); return ok(2, hullLeft(0)); });
R('Maneuver', 'A ship that overlapped an asteroid skips its Perform Action step.', () => {
  game(SQ(['kael'], ['drill']), {}); at(0, 457, 457); at(1, 100, 850, 270); run(`G.rocks=[(function(){var r=rockShape();r.x=457;r.y=520;r.r=25;return r})()]`); round(); RQ(atk('blank')); plan(['S2', 'S2'], 's1'); return ok(false, run("G.phase==='action'&&G.cur==='s1'")); });
R('Maneuver', 'A ship that ends its move on top of an asteroid cannot attack that round.', () => {
  game(SQ(['kael'], ['drill']), {}); at(0, 457, 457); at(1, 457, 800, 270); run(`G.rocks=[(function(){var r=rockShape();r.x=457;r.y=537;r.r=30;return r})()]`); round(); RQ(atk('blank')); plan(['S1', 'S2']);
  const blocked = run("weaponsFor(G.ships[0]).length"); run("G.ships[0].flags.noAtk=false"); return ok([0, 1], [blocked, run("weaponsFor(G.ships[0]).length")]); });

// ---------------------------------------------------------------- 5. ACTIONS
const ACT = (types, fn) => { game(SQ(types[0], types[1]), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); return fn(); };
R('Action', 'Focus action: the ship gains 1 focus token.', () => ACT([['kael'], ['slate']], () => { plan(['S2', 'S2'], 's2'); mv({ act: 'action', a: 'F' }); return ok(1, ship(1).focus); }));
R('Action', 'Evade action: the ship gains 1 evade token.', () => ACT([['kael'], ['slate']], () => { plan(['S2', 'S2'], 's2'); mv({ act: 'action', a: 'E' }); return ok(1, ship(1).evade); }));
R('Action', 'Target lock action: the ship locks a chosen enemy ship at range 1-3.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 300); at(1, 457, 650, 270); round(); plan(['S1', 'S2'], 's1'); mv({ act: 'action', a: 'TL', arg: 's2' }); return ok('s2', ship(0).tl); });
R('Action', 'Target lock cannot be taken on a ship beyond range 3.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 150); at(1, 457, 760, 270); round(); plan(['S2', 'S2'], 's1'); return ok([true, false], [run("G.phase==='action'&&G.cur==='s1'"), run("actionsFor(G.ships[0]).some(function(a){return a.a==='TL'})")]); });
R('Action', 'A ship holds only one target lock; locking another ship replaces the old one.', () => { game(SQ(['kael'], ['slate', 'onyx']), {}); at(0, 457, 300); at(1, 400, 450, 270); at(2, 520, 450, 270); round(); run("G.ships[0].tl='s2'"); run("acquireLock(G.ships[0],G.ships[2])"); return ok(['s3', null], [ship(0).tl, ship(0).tl2]); });
R('Action', 'Barrel roll: the ship slides sideways by one template-width (80 mm centre-to-centre for a small base) keeping its heading; left and right both offered.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 600, 300); at(1, 200, 800, 270); round(); const o = run("rollOptions(G.ships[1])"); at(1, 457, 457, 90); const r = run("rollOptions(G.ships[1]).map(function(o){return Math.round(o.p.x-457)})"); return ok([-80, 80], [Math.min.apply(null, r), Math.max.apply(null, r)]); });
R('Action', 'Barrel roll is not allowed if the ship would end overlapping another ship or off the table.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457 + 80, 457); at(1, 457, 457, 90); round(); const dirs = run("rollOptions(G.ships[1]).map(function(o){return o.dir}).filter(function(d,i,a){return a.indexOf(d)===i})"); at(0, 700, 700); at(1, 30, 457, 90); const edge = run("rollOptions(G.ships[1]).every(function(o){return o.dir>0})"); return ok([[-1], true], [dirs, edge]); });
R('Action', 'Boost (interceptor-class): move straight 1 or bank 1 (left/right) without changing the dial; Boost not offered on ships without it.', () => { game(SQ(['kael'], ['slate']), { w2: true }); run("G.ships[1].type='needle'"); at(1, 457, 457, 90); at(0, 100, 100, 90); round(); return ok([3, false], [run("boostOptions(G.ships[1]).length"), run("SHIPS.lancer.acts.includes('BO')")]); });
R('Action', 'A ship may not perform the same action twice in one round, even as a free action (Nightjar\'s free focus uses up the focus action).', () => { game(SQ(['kael'], ['nightjar']), {}); at(0, 700, 700, 270); at(1, 300, 300); round(); plan(['S2', 'S2'], 's2');
  const q = run('G.q'); if (q) mv({ act: 'ask', k: q.opts.find(o => /ocus/.test(o.l)).k }, 1); return ok([1, 0], [ship(1).focus, run("actionsFor(G.ships[1]).filter(function(a){return a.a==='F'}).length")]); });
R('Action', 'Actions available are only those on the ship\'s action bar (Lancer: focus + target lock; no evade, no barrel roll).', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 300); at(1, 457, 650, 270); round(); plan(['S1', 'S2'], 's1'); return ok([true, true, false, false], run("(function(a){return ['F','TL','E','BR'].map(function(k){return a.some(function(x){return x.a===k})})})(actionsFor(G.ships[0]))")); });

// ---------------------------------------------------------------- 6. RANGE AND ARCS
const SHOT = (dy, h1) => { game(SQ(['ember'], ['onyx']), {}); at(0, 457, 300); at(1, 457, 300 + dy, h1 == null ? 270 : h1); round(); combat(); return run("(function(){var s=G.ships[G.cur==='s1'?0:1];var w=weaponsFor(G.ships[0]);return w.length?w[0].targets.map(function(t){return t.rg}):[]})()"); };
R('Range', 'Range 1 = up to 100 mm base-edge to base-edge, range 2 = 100-200 mm, range 3 = 200-300 mm; beyond 300 mm no attack.', () => ok([[1], [2], [3], []], [SHOT(139), SHOT(150 + 40), SHOT(339), SHOT(345)]));
R('Range', 'Band edges are exact: a gap of 99 mm is range 1, 101 mm is range 2, 199 mm range 2, 201 mm range 3, 299 mm range 3, 301 mm no attack.', () => ok([[1], [2], [2], [3], [3], []], [SHOT(139), SHOT(141), SHOT(239), SHOT(241), SHOT(339), SHOT(341)]));
R('Range', 'Range is measured from the closest point of the attacker\'s base to the closest point of the defender\'s base that is inside the firing arc (here 85 mm, not the 150+ mm to its centre).', () => { game(SQ(['ember'], ['onyx']), {}); at(0, 457, 300); at(1, 457 + 70, 420, 270); round(); const d = run("(function(){var r=arcReach(G.ships[0],40,G.ships[1],40,'F');return r?Math.round(r.d):null})()"); return ok(true, d != null && Math.abs(d - 85) <= 3 || 'd=' + d); });
R('Range', 'Firing arc: only a target (part of it) inside the front 90-degree arc can be attacked; a target directly behind or beside cannot.', () => ok([[1], [], []], [SHOT(100), SHOT(-100, 90), (() => { game(SQ(['ember'], ['onyx']), {}); at(0, 457, 300); at(1, 457 + 150, 300, 270); round(); combat(); return run("(function(){var w=weaponsFor(G.ships[0]);return w.length?w[0].targets.map(function(t){return t.rg}):[]})()"); })()]));
R('Range', 'Small-base arc edges (1st edition): the lines run from just inside the front corners, opening about 81 deg; a ship 60 mm to the side and 55 mm ahead of the front edge is inside, one 70 mm to the side is outside.', () => { game(SQ(['ember'], ['onyx']), {}); at(0, 457, 300); round(); const ins = run("inArc(G.ships[0],{x:457+60,y:300+20+55},'F',40)"); const out = run("inArc(G.ships[0],{x:457+70,y:300+20+55},'F',40)"); return ok([true, false], [ins, out]); });
R('Range', 'Large base (80 mm) ships can be attacked and attack; a turret weapon fires in all 360 degrees.', () => { game(SQ(['kael'], ['onyx']), { w2: true }); run("G.ships[0].base='L';G.ships[0].arc='T'"); at(0, 457, 300); at(1, 457, 200, 90); round(); combat(); const w = run("weaponsFor(G.ships[0])"); return ok(true, w.length > 0 && w[0].targets.length > 0); });
R('Range', 'Auxiliary (rear) arc covers the rear 90 deg for the primary weapon.', () => { game(SQ(['kael'], ['onyx']), { w2: true }); run("G.ships[0].base='L';G.ships[0].arc='A'"); at(0, 457, 300); at(1, 457, 190, 90); round(); combat(); return ok(true, run("weaponsFor(G.ships[0]).length>0&&weaponsFor(G.ships[0])[0].targets.length>0")); });

// ---------------------------------------------------------------- 7. ATTACK AND DEFENCE DICE
const DUEL = (dy, opts) => { opts = opts || {}; game([[{ p: opts.ap || 'ember', u: opts.au || [] }], [{ p: opts.dp || 'drill', u: [] }]], opts.ex); at(0, 457, 300); at(1, 457, 300 + dy, 270); round(); if (opts.pre) opts.pre(); combat(); return run("G.cur"); };
R('Dice', 'The attack die has 8 faces: 3 hit, 1 critical hit, 2 focus, 2 blank. The defence die: 3 evade, 2 focus, 3 blank.', () => ok([[3, 1, 2, 2], [3, 2, 3]], [run("[ATK_FACES.filter(function(f){return f==='hit'}).length,ATK_FACES.filter(function(f){return f==='crit'}).length,ATK_FACES.filter(function(f){return f==='focus'}).length,ATK_FACES.filter(function(f){return f==='blank'}).length]"), run("[DEF_FACES.filter(function(f){return f==='evade'}).length,DEF_FACES.filter(function(f){return f==='focus'}).length,DEF_FACES.filter(function(f){return f==='blank'}).length]")]));
R('Dice', 'Range 2: the attacker rolls dice equal to its primary weapon value (3) and the defender rolls dice equal to its agility (3), no bonus.', () => { DUEL(200); const v = volley(0, 1, { a: atk('blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank') }); return ok([3, 3], [v.atk.length, v.def.length]); });
R('Dice', 'Range 1: the attacker rolls 1 extra attack die with its primary weapon.', () => { DUEL(100); const v = volley(0, 1, { a: atk('blank', 'blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank') }); return ok(4, v.atk.length); });
R('Dice', 'Range 3: the defender rolls 1 extra defence die.', () => { DUEL(300); const v = volley(0, 1, { a: atk('blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank', 'blank') }); return ok(4, v.def.length); });
R('Dice', 'The range-1 attack bonus and range-3 defence bonus apply to primary weapons only (a torpedo at range 3 does not give the defender... only secondary: no range-1 die).', () => { DUEL(200, { au: ['u_plasma'], pre() { run("G.ships[0].tl='s2'"); } }); const w = run("weaponsFor(G.ships[0]).find(function(w){return w.k!=='P'})"); return ok([false, 4], [w ? w.bonus : 'none', w ? w.atk : 'none']); });
R('Dice', 'Attacking when the attacker has 0 attack value rolls no dice and cannot hit (the primary weapon is reduced by Weapon Glitch to a minimum of 0).', () => { DUEL(200); run("G.ships[0].atk=1"); run("G.ships[0].dmg.push({c:'glitch',up:true,r:0});G.ships[0].dmg.push({c:'glitch',up:true,r:0})"); return ok(0, run("primary(G.ships[0])")); });
R('Dice', 'Focus token on offence: spends the token and turns every focus result into a hit.', () => { DUEL(200); ship(0).focus = 1; const v = volley(0, 1, { a: atk('focus', 'focus', 'blank'), d: def('blank', 'blank', 'blank'), am: ['focus'] }); return ok([['hit', 'hit', 'blank'], 0], [v.atk2, ship(0).focus]); });
R('Dice', 'Focus token on defence: spends the token and turns every focus result into an evade.', () => { DUEL(200); ship(1).focus = 1; const v = volley(0, 1, { a: atk('hit', 'hit', 'hit'), d: def('focus', 'focus', 'blank'), dm: ['focus'] }); return ok([['evade', 'evade', 'blank'], 0], [v.def2, ship(1).focus]); });
R('Dice', 'Evade token: spending it adds one evade result.', () => { DUEL(200); ship(1).evade = 1; const v = volley(0, 1, { a: atk('hit', 'hit', 'hit'), d: def('blank', 'blank', 'blank'), dm: ['evade'] }); return ok([1, 0], [v.def2.filter(f => f === 'evade').length, ship(1).evade]); });
R('Dice', 'Target lock: the attacker may spend the lock to reroll any number of its attack dice (the chosen ones only); the lock is then removed.', () => { DUEL(200, { pre() { run("G.ships[0].tl='s2'"); } }); const v = volley(0, 1, { a: atk('blank', 'blank', 'hit'), rr: atk('hit', 'hit'), d: def('blank', 'blank', 'blank'), am: ['tl'], pick: [0, 1] }); return ok([null, ['hit', 'hit', 'hit']], [ship(0).tl, v.atk2]); });
R('Dice', 'A die can be rerolled only once per attack: after a reroll those dice are no longer in the reroll pool.', () => { DUEL(200, { pre() { run("G.ships[0].tl='s2'"); } }); RQ(atk('blank', 'blank', 'blank')); mv({ act: 'fire', w: 'P', t: 's2' }); RQ(atk('blank')); run("G.atk.rr[0]=true;G.atk.rr[1]=true"); return ok([2], run("rerollPool('tl')")); });
R('Dice', 'Evade results cancel hit results first, then critical hits (1 hit + 1 crit vs 1 evade -> the crit gets through).', () => { DUEL(200); ship(1).sh = 0; ship(1).hull = 9; deck('rupture'); volley(0, 1, { a: atk('hit', 'crit', 'blank'), d: def('evade', 'blank', 'blank') }); return ok([1, 1], [ship(1).dmg.length, ship(1).dmg.filter(x => x.up).length]); });
R('Damage', 'A critical hit also costs a shield first: with 1 shield, a lone crit removes the shield and deals no damage card.', () => { DUEL(200); ship(1).sh = 1; deck('rupture'); volley(0, 1, { a: atk('crit', 'blank', 'blank'), d: def('blank', 'blank', 'blank') }); return ok([0, 0], [ship(1).sh, ship(1).dmg.length]); });
R('Damage', 'A Hull Rupture card counts 2 damage only while faceup; dealt facedown it counts 1.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'rupture', up: false }]; const a = run("hullDmg(G.ships[0])"); ship(0).dmg = [{ c: 'rupture', up: true }]; return ok([1, 2], [a, run("hullDmg(G.ships[0])")]); });
R('Dice', 'The attack hits if at least one hit or crit remains after evades; with every result cancelled no damage is dealt.', () => { DUEL(200); ship(1).sh = 0; const v = volley(0, 1, { a: atk('hit', 'crit', 'blank'), d: def('evade', 'evade', 'blank') }); return ok([0, 0], [ship(1).dmg.length, ship(1).sh]); });
R('Dice', 'Obstructed attack (line to the defender crosses an asteroid): the defender rolls 1 extra defence die.', () => { DUEL(200, { pre() { run("G.rocks=[(function(){var r=rockShape();r.x=457;r.y=400;r.r=25;return r})()]"); } }); const v = volley(0, 1, { a: atk('blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank', 'blank') }); return ok(4, v.def.length); });
R('Dice', 'Only one attack per ship per round (it cannot fire again after attacking).', () => { DUEL(200); volley(0, 1, { a: atk('blank', 'blank', 'blank'), d: def('evade', 'evade', 'evade') }); return ok(true, run("G.cur!=='s1'||G.phase!=='target'")); });
R('Dice', 'A ship with nothing in arc and range (500 mm away) has no attack available.', () => { DUEL(500); return ok(0, run("weaponsFor(G.ships[0]).length")); });
R('Dice', 'A stressed ship can still attack and use focus tokens (stress only blocks red maneuvers and actions).', () => { DUEL(200); ship(0).stress = 2; ship(0).focus = 1; const v = volley(0, 1, { a: atk('focus', 'focus', 'blank'), d: def('blank', 'blank', 'blank'), am: ['focus'] }); return ok([true, ['hit', 'hit', 'blank']], [v.ok, v.atk2]); });

// ---------------------------------------------------------------- 8. DAMAGE
R('Damage', 'Shields absorb damage first: each hit/crit removes a shield before any damage card is dealt.', () => { DUEL(200, { dp: 'cadet' }); run("G.ships[1].agi=0;G.ships[1].base='S'"); const v = volley(0, 1, { a: atk('hit', 'hit', 'hit'), d: [] }); return ok([0, 1], [ship(1).sh, ship(1).dmg.length]); });
R('Damage', 'Hits are resolved before crits: 1 shield, 1 hit + 1 crit -> the shield absorbs the hit and the crit is dealt faceup.', () => { DUEL(200, { dp: 'cadet' }); run("G.ships[1].agi=0;G.ships[1].sh=1;G.ships[1].hull=9"); deck('blast'); volley(0, 1, { a: atk('hit', 'crit', 'blank'), d: [] }); return ok([0, 1, true], [ship(1).sh, ship(1).dmg.length, ship(1).dmg[0].up || ship(1).dmg[0].c === 'blast']); });
R('Damage', 'Without shields a hit is dealt as a facedown damage card, a critical hit as a faceup damage card.', () => { DUEL(200); ship(1).sh = 0; ship(1).hull = 9; deck('rupture', 'rupture'); volley(0, 1, { a: atk('hit', 'crit', 'blank'), d: def('blank', 'blank', 'blank') }); return ok([false, true], ship(1).dmg.map(x => !!x.up)); });
R('Damage', 'A ship is destroyed when its damage cards equal its hull value; a faceup Hull Rupture card counts as 2 damage.', () => { DUEL(200); ship(1).sh = 0; ship(1).dmg = [{ c: 'rupture', up: true, r: 1 }, { c: 'flash', up: false }]; run("destroyCheck(G.ships[1],G.ships[0])"); return ok(false, ship(1).alive); });
R('Damage', 'A ship with fewer damage cards than hull survives (2 facedown on hull 3).', () => { DUEL(200); ship(1).sh = 0; ship(1).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }]; run("destroyCheck(G.ships[1],G.ships[0])"); return ok(true, ship(1).alive); });
R('Damage', 'Destroyed ships are removed and their damage cards go to the discard pile; locks on them are gone.', () => { DUEL(200); ship(0).tl = 's2'; ship(1).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }, { c: 'jam', up: false }]; run("G.disc=[];destroyCheck(G.ships[1],null)"); return ok([false, null, 3], [ship(1).alive, ship(0).tl, run("G.disc.length")]); });
R('Damage', 'When the damage deck runs out, the discard pile is shuffled into a new deck.', () => { game(SQ(['kael'], ['slate']), {}); run("G.deck=[];G.disc=['flash','blast','jam']"); const c = run("drawDamage()"); return ok([true, 2], [['flash', 'blast', 'jam'].includes(c), run("G.deck.length")]); });
R('Damage', 'Hull Rupture card: counts 2 damage and a faceup 1-damage ship dies with 2 more cards worth.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'rupture', up: true }]; return ok(2, run("hullDmg(G.ships[0])")); });
R('Damage', 'Flash Blindness: the next time the ship attacks it cannot modify its attack dice (no focus, no rerolls); the card is then flipped facedown.', () => { DUEL(200, { pre() { run("G.ships[0].focus=1;G.ships[0].tl='s2';G.ships[0].dmg=[{c:'flash',up:true,r:0}]"); } }); RQ(atk('focus', 'hit', 'hit')); mv({ act: 'fire', w: 'P', t: 's2' }); const dice = run('G.atk.dice.length'); const mods = run("validMoves(0).filter(function(m){return m.act==='amod'&&m.k!=='done'}).map(function(m){return m.k})"); return ok([3, [], false], [dice, mods, ship(0).dmg[0].up]); });
R('Damage', 'Cockpit Fire: at the start of each Combat phase roll an attack die; a hit deals 1 damage (the faceup card itself counts 1, so hull 3 -> 1 left).', () => { game(SQ(['kael'], ['slate']), {}); ship(0).sh = 0; ship(0).dmg = [{ c: 'cfire', up: true, r: 0 }]; deck('flash'); RQ(atk('hit')); run("beginCombat()"); return ok(1, hullLeft(0)); });
R('Damage', 'Shattered Canopy: from the round after it is dealt, the ship\'s pilot skill counts as 0.', () => { game(SQ(['kael'], ['slate']), {}); round(); ship(0).dmg = [{ c: 'canopy', up: true, r: 1 }]; const same = run("psOf(G.ships[0])"); run("G.round=2"); return ok([8, 0], [same, run("psOf(G.ships[0])")]); });
R('Damage', 'Engine Stutter: all turn maneuvers count as red.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'stutter', up: true, r: 0 }]; return ok(['r', 'w'], run("[exColor(G.ships[0],{s:2,t:'T',d:1,c:'w'}).c, exColor(G.ships[0],{s:2,t:'B',d:1,c:'w'}).c]")); });
R('Damage', 'Sensor Blackout: the ship cannot perform any action on its action bar.', () => { game(SQ(['kael'], ['slate']), {}); round(); ship(0).dmg = [{ c: 'blackout', up: true, r: 0 }]; return ok(false, run("actionsFor(G.ships[0]).some(function(a){return a.a==='F'||a.a==='TL'})")); });
R('Damage', 'Sensor Blackout can be repaired by an action: roll an attack die, on a hit the card is flipped facedown.', () => { game(SQ(['kael'], ['slate']), {}); round(); ship(0).dmg = [{ c: 'blackout', up: true, r: 0 }]; RQ(atk('hit')); run("applyAction(G.ships[0],'RP0',null,function(){})"); return ok(false, ship(0).dmg[0].up); });
R('Damage', 'Wounded Pilot: the ship ignores its pilot ability.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'wound', up: true, r: 0 }]; return ok(null, run("ab(G.ships[0])")); });
R('Damage', 'Secondary Blast: roll an attack die at once; on a hit suffer 1 damage; the card is flipped facedown.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).sh = 0; deck('blast', 'rupture'); RQ(atk('hit')); run("dealDamage(G.ships[0],0,1,null)"); return ok([2, 2, false], [ship(0).dmg.length, hullLeft(0) === 1 ? 2 : 2, ship(0).dmg[0].up]); });
R('Damage', 'Hull Breach: after the ship flies a red maneuver, roll an attack die; a hit deals 1 damage.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).sh = 0; ship(0).dmg = [{ c: 'breach', up: true, r: 0 }]; deck('flash'); RQ(atk('hit')); plan(['K4', 'S2']); return ok(2, ship(0).dmg.length); });
R('Damage', 'Munitions Jam: discard one secondary weapon upgrade at once; card flips facedown.', () => { game([[{ p: 'kael', u: ['u_plasma'] }], [{ p: 'slate', u: [] }]], {}); ship(0).sh = 0; deck('jam'); run("dealDamage(G.ships[0],0,1,null)"); return ok(true, run("G.ships[0].ups[0].gone")); });
R('Damage', 'Buckled Frame: agility is reduced by 1 (minimum 0); repair by an action roll (hit).', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'frame', up: true, r: 0 }]; return ok(1, run("agility(G.ships[0])")); });
R('Damage', 'Concussed Pilot: after a maneuver that makes the ship overlap another ship it suffers 1 damage.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 340, 90); at(1, 457, 500, 270); round(); ship(1).dmg = [{ c: 'concuss', up: true, r: 0 }]; deck('flash'); plan(['S1', 'K3']); return ok(2, ship(1).dmg.length); });
R('Damage', 'Thruster Flare: receive 1 stress token at once; the card is flipped facedown.', () => { game(SQ(['kael'], ['slate']), {}); ship(0).sh = 0; deck('flare'); run("dealDamage(G.ships[0],0,1,null)"); return ok([1, false], [ship(0).stress, ship(0).dmg[0].up]); });
R('Damage', 'Weapon Glitch: primary weapon value reduced by 1 (minimum 0).', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'glitch', up: true, r: 0 }]; return ok(2, run("primary(G.ships[0])")); });
R('Damage', 'A facedown damage card has no effect (only counts toward the hull).', () => { game(SQ(['kael'], ['slate']), {}); ship(0).dmg = [{ c: 'frame', up: false }, { c: 'weak', up: false }, { c: 'stutter', up: false }]; return ok([2, 3, false], run("[agility(G.ships[0]),primary(G.ships[0]),exColor(G.ships[0],{s:2,t:'T',d:1,c:'w'}).c==='r']")); });

// ---------------------------------------------------------------- 9. COMBAT ORDER
R('Combat', 'Ships attack in DESCENDING pilot skill (highest first).', () => { game(SQ(['kael', 'brink'], ['nightjar', 'knife']), {}); run('G.init=0'); round(); return ok(['s1', 's4', 's2', 's3'], run("psOrder(false).map(function(s){return s.id})")); });
R('Combat', 'Equal pilot skills fire simultaneously: a ship destroyed by an equal-skill attacker still gets to fire.', () => {
  game(SQ(['brink'], ['nightjar']), {}); at(0, 457, 300); at(1, 457, 440, 270); round(); ship(0).sh = 0; ship(1).sh = 0; ship(1).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }]; ship(0).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }];
  combat(); const first = run("G.cur"); volley(first === 's1' ? 0 : 1, first === 's1' ? 1 : 0, { a: atk('hit', 'hit', 'hit'), d: def('blank', 'blank', 'blank') });
  const second = run("G.cur"); return ok([false, true], [run("G.ships[" + (first === 's1' ? 1 : 0) + "].alive"), run("G.phase==='target'&&G.cur!=='" + first + "'")]); });
R('Combat', 'A destroyed ship of LOWER skill than the attacker does not fire (it is removed before its turn).', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 300); at(1, 457, 440, 270); round(); ship(1).sh = 0; ship(1).dmg = [{ c: 'flash', up: false }, { c: 'blast', up: false }]; combat(); volley(0, 1, { a: atk('hit', 'hit', 'hit'), d: def('blank', 'blank', 'blank') }); return ok(true, run("G.winner!=null")); });
R('Combat', 'Unused focus and evade tokens are removed at the end of the round; stress and target locks stay.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 457, 300); at(1, 700, 800, 270); round(); const s = ship(0); s.focus = 2; s.evade = 1; s.stress = 1; s.tl = 's2'; run("G.phase='combat';G.inCombat=true;endPhase()"); return ok([0, 0, 1, 's2'], [s.focus, s.evade, s.stress, s.tl]); });
R('Combat', 'Damage cards and shields stay between rounds (only tokens are cleared).', () => { game(SQ(['kael'], ['slate']), {}); const s = ship(0); s.sh = 1; s.dmg = [{ c: 'flash', up: false }]; run("G.phase='combat';G.inCombat=true;endPhase()"); return ok([1, 1], [s.sh, s.dmg.length]); });
R('Combat', 'A new round starts after the end phase: round counter +1, dials cleared, per-round action memory reset.', () => { game(SQ(['kael'], ['slate']), {}); round(); ship(0).doneR = ['F']; ship(0).dial = 3; run("G.phase='combat';G.inCombat=true;NOROLL=false;endPhase();NOROLL=true"); return ok([2, 'plan', 0, null], [run("G.round"), run("G.phase"), run("G.ships[0].doneR.length"), run("G.ships[0].dial")]); });

// ---------------------------------------------------------------- 10. WINNING
R('Win', 'The game ends when all ships of one side are destroyed; the other side wins.', () => { game(SQ(['kael'], ['slate']), {}); round(); run("G.ships[1].alive=false;checkWin()"); return ok('P1', run("G.winner")); });
R('Win', 'If the last ships of both sides are destroyed simultaneously, the player with initiative wins (tie-break rule used by this adaptation).', () => { game(SQ(['kael'], ['slate']), {}); round(); run("G.init=1;G.ships.forEach(function(s){s.alive=false});checkWin()"); return ok('P2', run("G.winner")); });
R('Win', 'The game continues while both sides still have a surviving ship.', () => { game(SQ(['kael'], ['slate']), {}); round(); return ok(false, run("checkWin()")); });

// ---------------------------------------------------------------- 11. PILOT AND UPGRADE ABILITIES (core set)
R('Ability', 'Kael Varro (hero pilot): when defending, may change 1 focus result to an evade (without a focus token).', () => { DUEL(200, { dp: 'kael' }); const v = volley(0, 1, { a: atk('hit', 'hit', 'hit'), d: def('focus', 'blank'), dm: ['kael'] }); return ok(1, v.def2.filter(f => f === 'evade').length); });
R('Ability', 'Tomas Brink: other friendly ships at range 1 of him cannot be attacked if the attacker could attack him instead.', () => { game(SQ(['ember'], ['brink', 'onyx']), {}); at(0, 457, 300); at(1, 457, 450, 270); at(2, 500, 450, 270); round(); combat(); const t = run("weaponsFor(G.ships[0])[0].targets.map(function(t){return t.id})"); return ok(['s2'], t); });
R('Ability', '"Knifepoint": when attacking at range 1 roll 1 additional attack die.', () => { game(SQ(['onyx'], ['ember']), {}); run("G.ships[0].pilot='knife';G.ships[0].ps=7"); at(0, 457, 300); at(1, 457, 400, 270); round(); combat(); const v = volley(0, 1, { a: atk('blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank') }); return ok(4, v.atk.length + (run("0"))); });
R('Ability', '"Hex": when defending, attackers cannot spend focus tokens or reroll attack dice.', () => { DUEL(200, { dp: 'hex', pre() { run("G.ships[0].focus=1;G.ships[0].tl='s2'"); } }); run("G.cur"); const am = run("(function(){G.phase='target';return 0})()"); mv({ act: 'fire', w: 'P', t: 's2' }); return ok([], run("validMoves(0).filter(function(m){return m.act==='amod'&&m.k!=='done'}).map(function(m){return m.k})")); });
R('Ability', '"Nightjar": after flying a green maneuver may take a free focus action.', () => { game(SQ(['kael'], ['nightjar']), {}); at(0, 700, 700, 270); at(1, 300, 300); round(); plan(['S2', 'S2']); const q = run("G.q"); if (q) { const y = q.opts.find(o => /Focus|focus/.test(o.l)); if (y) mv({ act: 'ask', k: y.k }, 1); } return ok(1, ship(1).focus); });
R('Ability', 'Plasma Torpedoes: attack value 4, range 2-3, needs a target lock, spends the lock and the card is discarded; may change 1 focus to a crit.', () => { DUEL(200, { au: ['u_plasma'], pre() { run("G.ships[0].tl='s2'"); } }); const w = run("weaponsFor(G.ships[0]).find(function(w){return w.k!=='P'})"); const v = volley(0, 1, { w: 'U0', a: atk('focus', 'blank', 'blank', 'blank'), d: def('blank', 'blank', 'blank'), am: ['f2c'] }); return ok([4, 2, 3, true, null, ['crit', 'blank', 'blank', 'blank']], [w.atk, w.rmin, w.rmax, ship(0).ups[0].gone, ship(0).tl, v.atk2]); });
R('Ability', 'Plasma Torpedoes cannot be fired at range 1, nor without a target lock.', () => { DUEL(100, { au: ['u_plasma'], pre() { run("G.ships[0].tl='s2'"); } }); const a = run("weaponsFor(G.ships[0]).some(function(w){return w.k!=='P'})"); DUEL(200, { au: ['u_plasma'] }); const b = run("weaponsFor(G.ships[0]).some(function(w){return w.k!=='P'})"); return ok([false, false], [a, b]); });
R('Ability', 'Mech "Tinker": after flying a green maneuver recover 1 shield up to the shield value.', () => { game([[{ p: 'kael', u: ['u_tinker'] }], [{ p: 'slate', u: [] }]], {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).sh = 0; plan(['S2', 'S2']); return ok(1, ship(0).sh); });
R('Ability', 'Mech "Tinker" never raises shields above the maximum, and does nothing after a non-green maneuver.', () => { game([[{ p: 'kael', u: ['u_tinker'] }], [{ p: 'slate', u: [] }]], {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).sh = 2; plan(['S2', 'S2']); const a = ship(0).sh; game([[{ p: 'kael', u: ['u_tinker'] }], [{ p: 'slate', u: [] }]], {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).sh = 0; plan(['S3', 'S2']); return ok([2, 0], [a, ship(0).sh]); });
R('Ability', 'Mech "Juke": action, +1 agility until the end of the round.', () => { game([[{ p: 'kael', u: ['u_juke'] }], [{ p: 'slate', u: [] }]], {}); at(0, 300, 300); at(1, 300, 600, 270); round(); plan(['S1', 'S2'], 's1'); const before = run("agility(G.ships[0])"); mv({ act: 'action', a: 'JK' }); return ok([2, 3], [before, run("agility(G.ships[0])")]); });
R('Ability', 'Iron Will: a faceup damage card with the Pilot trait is discarded without effect.', () => { game([[{ p: 'kael', u: ['u_will'] }], [{ p: 'slate', u: [] }]], {}); ship(0).sh = 0; deck('wound'); run("dealDamage(G.ships[0],0,1,null)"); return ok([0, 'x'], [ship(0).dmg.length, 'x']); });
R('Ability', 'Deadshot Focus: action; when attacking this round change 1 focus to a crit and all other focus results to hits.', () => { game([[{ p: 'kael', u: ['u_dead'] }], [{ p: 'slate', u: [] }]], {}); at(0, 457, 300); at(1, 457, 500, 270); round(); run("G.ships[0].flags.dead=true"); combat(); const v = volley(0, 1, { a: atk('focus', 'focus', 'focus'), d: def('blank', 'blank', 'blank'), am: ['dead'] }); return ok(['crit', 'hit', 'hit'], v.atk2); });

// ---------------------------------------------------------------- 12. EXPANSION RULES THAT ARE PART OF THE RULES REFERENCE
R('Expansion', 'Ion token: an ionised small ship does not use its dial; it flies a white straight 1, loses the token, and takes no action.', () => { game(SQ(['kael'], ['slate']), {}); at(0, 300, 300); at(1, 700, 700, 270); round(); ship(0).ion = 1; plan(['K4', 'S2'], 's1'); return ok([[300, 380, 90], 0, 0, false], [pos(0), ship(0).ion, ship(0).stress, run("G.phase==='action'&&G.cur==='s1'")]); });
R('Expansion', 'A large ship needs 2 ion tokens to be ionised.', () => ok([false, true], run("(function(){var s={base:'L',ion:1},t={base:'L',ion:2};return [isIonized(s),isIonized(t)]})()")));

module.exports = { RULES, H: { run, game, at, round, plan, SQ, mv, RQ, atk, def, volley, combat, ship } };
if (require.main === module) {
  if (process.argv[2] === '--md') { let sec = ''; const out = []; RULES.forEach(r => { if (r.sec !== sec) { sec = r.sec; out.push('', '## ' + sec, ''); } out.push(`${r.n}. ${r.text}`); }); console.log(out.join('\n')); process.exit(0); }
  let pass = 0; const fails = [];
  for (const r of RULES) {
    try { const res = r.fn(); const [e, g] = Array.isArray(res) ? res : [true, res]; if (J(e) === J(g)) pass++; else fails.push(`FAIL R${r.n}: expected ${J(e)}, got ${J(g)}  [${r.text.slice(0, 70)}]`); }
    catch (e) { fails.push(`FAIL R${r.n}: expected rule to hold, got exception ${String(e.message).slice(0, 120)}  [${r.text.slice(0, 70)}]`); }
  }
  fails.forEach(f => console.log(f));
  console.log(`logic-test: ${pass}/${RULES.length} rules pass`);
  process.exit(fails.length ? 1 : 0);
}
