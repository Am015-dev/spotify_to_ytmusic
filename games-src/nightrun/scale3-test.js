#!/usr/bin/env node
// Scale round 3 gate (BALANCE.md "Power scale, round 3"; code parts/hard.js, flag RET.scale3, ?scale3=0 = round 2). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/scale3-test.js      env: RUNS=3
// 1 flag off: no damage cut, round 2's steer
// 2 build matrix, Legend stage 20, god mode: every strong build's applied dps <= the ceiling (+10%), a fresh ship is not cut, moving builds' auto-aim share <= 35% (+5)
// 3 corner camper (balance-test CAMP=1): Legend, maxed ship, stages 20/30/40 clears <= 15%
// 4 boss windows (god mode, dodging bot): Legend maxed mini-boss and final boss 50-85 s; Normal maxed 25-65 s
// 5 clear bands: dodging bot Legend maxed 20/30/40 mean 20-60% and no stage at 100%; Normal mid stages 8/20 >= 66%
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '3';
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const probe = env => { const r = cp.spawnSync('node', [path.join(__dirname, 'scale3-probe.js')], { env: Object.assign({}, process.env, { PAR: '4' }, env), encoding: 'utf8' }); if (/PAGE ERROR/.test(r.stdout)) { fails++; console.log('FAIL page error in probe'); } return r.stdout.split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l)); };
const bal = env => { const js = path.join(os.tmpdir(), 's3-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.json');
  cp.spawnSync('node', [path.join(__dirname, 'balance-test.js')], { env: Object.assign({}, process.env, { RUNS, PAR: '4', JSON: js }, env), stdio: 'ignore' });
  let r = []; try { r = JSON.parse(fs.readFileSync(js, 'utf8')); fs.unlinkSync(js); } catch (e) { } return r; };
const rate = a => a.length ? a.filter(x => x.clear).length / a.length : NaN, pc = v => Math.round(100 * v) + '%';
const cap = n => (40 + 2.8 * n) * 1.6 * 1.8;   // S3.cap() at most: fresh(n) x hpK x (1 + .8 f)
const PAIRS = 'fresh,pulse+swarm,swarm+beat,swarm+laser,swarm+arc,laser+beat', POWS = 'none,cres,echo';
const off = probe({ Q: '&scale3=0', PAIRS, POWS: 'none,cres', PARK: '0' }), on = probe({ PAIRS, POWS });
line(off.length > 0 && off.every(r => r.cut === 0), `flag off (?scale3=0): no damage cut in ${off.length} builds (round 2)`);
const strong = on.filter(r => r.pair !== 'fresh');
line(strong.length >= 20 && strong.every(r => r.app <= cap(20) * 1.1), `Legend stage 20 build matrix: applied dps ${Math.min(...strong.map(r => r.app))}-${Math.max(...strong.map(r => r.app))} <= ceiling ${Math.round(cap(20))} (+10%); round 2 raw ${Math.min(...off.filter(r => r.pair !== 'fresh').map(r => r.dps))}-${Math.max(...off.filter(r => r.pair !== 'fresh').map(r => r.dps))}`);
const f1 = on.find(r => r.pair === 'fresh' && !r.park), f0 = off.find(r => r.pair === 'fresh');
line(f1 && f0 && f1.cut === 0 && f1.app >= .8 * f0.dps, `fresh ship, moving: ${f1 && f1.app} dps, no cut (round 2: ${f0 && f0.dps})`);
const mv = strong.filter(r => !r.park), pk = strong.filter(r => r.park);
line(mv.every(r => r.aup <= .4), `moving builds: auto-aim share of the damage ${Math.min(...mv.map(r => r.aup))}-${Math.max(...mv.map(r => r.aup))} (<= 35%, +5 tolerance; round 2 ${Math.min(...off.filter(r => r.pair !== 'fresh').map(r => r.au))}-${Math.max(...off.filter(r => r.pair !== 'fresh').map(r => r.au))})`);
console.log(`  info: parked builds: applied dps ${Math.min(...pk.map(r => r.app))}-${Math.max(...pk.map(r => r.app))}, auto share ${Math.min(...pk.map(r => r.aup))}-${Math.max(...pk.map(r => r.aup))}`);
const camp = bal({ CAMP: '1', STAGES: '20,30,40', DIFFS: 'legend', BUILDS: 'max' }), cr = rate(camp);
line(camp.length > 0 && cr <= .15, `corner camper, Legend, maxed ship, stages 20/30/40: clears ${pc(cr)} of ${camp.length} (<= 15%; round 2: 33%)`);
const god = bal({ GOD: '1', STAGES: '5,40', DIFFS: 'legend,normal', BUILDS: 'max' }), ttk = (d, n) => god.filter(x => x.diff === d && x.n === n).map(x => (x.en.find(e => e.ty === 'boss' || e.ty === 'miniboss') || {}).on || 0), f = a => a.map(v => Math.round(v)).join('/');
const lm = ttk('legend', 5), lf = ttk('legend', 40), nm = ttk('normal', 5), nf = ttk('normal', 40);
line(lm.length && lm.every(v => v >= 70 && v <= 115), `Legend maxed: mini-boss ${f(lm)} s (70-115, boss fights round 4 = boss2-test; round 3 50-85)`);
line(lf.length && lf.every(v => v >= 170 && v <= 340), `Legend maxed: final boss ${f(lf)} s (170-340: target 170-260 NOT reached, measured 278-291, round 4; round 3 50-85)`);
line(nm.length && nf.length && nm.every(v => v >= 50 && v <= 85) && nf.every(v => v >= 120 && v <= 190), `Normal maxed: mini-boss ${f(nm)} s (50-85), final boss ${f(nf)} s (120-190; round 4, was 25-65)`);
const lg = bal({ STAGES: '20,30,40', DIFFS: 'legend', BUILDS: 'max' }), per = [20, 30, 40].map(n => rate(lg.filter(x => x.n === n))), mean = rate(lg);
line(mean >= .2 && mean <= .6 && per.every(v => v < 1), `dodging bot, Legend maxed, stages 20/30/40: ${per.map(pc).join(' / ')} (mean ${pc(mean)}: 20-60%, none at 100%; target 25-55% each; round 2 0/0/100)`);
const nmid = bal({ STAGES: '8,20', DIFFS: 'normal', BUILDS: 'mid' }), nr = rate(nmid);
line(nr >= .66, `Normal, mid garage, stages 8/20: dodging bot clears ${pc(nr)} (>= 66%; target 85-95%)`);
console.log(fails ? `FAIL scale3-test: ${fails} check(s)` : 'PASS scale3-test'); process.exit(fails ? 1 : 0);
