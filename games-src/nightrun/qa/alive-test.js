#!/usr/bin/env node
// ALIVE (parts/enemies/alive.js, flag RET.alive): stages 1-3 Normal, stepped sim through humanbot.js (human bot), measured on and off (?alive=0).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/alive-test.js    env: RUNS=8 STAGES=1,2,3 GATE=0 (numbers only) OFF=0 (skip the ?alive=0 run)
// Measures (layer-independent recorder): mean enemy speed on screen (px/s), % of enemy-time idle (< 20 px/s), longest idle stretch,
//   enemy shots per enemy per 10 s, mean enemy bullet speed, human clear rate.
// Gates (alive on): (a) idle < 15%  (b) no idle stretch > 1.2 s  (c) speed >= 1.5x the old  (d) human clear 60-85% pooled  (e) no page errors
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '8', STAGES = process.env.STAGES || '1,2,3', GATE = process.env.GATE !== '0';
const pass = [], fail = [], ok = (c, m) => (c ? pass : fail).push(m);
const REC = `window.__rec=(m)=>{const S=window.__al||(window.__al={p:new Map(),seen:new WeakSet(),et:0,mv:0,idle:0,stk:0,sh:0,bv:0});const G=m.G,dt=1/60;
  for(const b of G.eb)if(!S.seen.has(b)){S.seen.add(b);S.sh++;S.bv+=Math.hypot(b.vx,b.vy);}
  for(const e of G.en){if(e.type==='boss'||e.mini||e.dead||e.hp<=0)continue;const r=S.p.get(e);
    if(e.x<960-(e.r||14)&&e.x>0&&e.y>0&&e.y<540&&r){const v=Math.hypot(e.x-r.x,e.y-r.y)/dt;if(v<400*3){S.et+=dt;S.mv+=v*dt;if(v<20){S.idle+=dt;r.id+=dt;S.stk=Math.max(S.stk,r.id);}else r.id=0;}}
    if(r){r.x=e.x;r.y=e.y;}else S.p.set(e,{x:e.x,y:e.y,id:0});}};
  window.__recOut=()=>{const S=window.__al||{};window.__al=null;return{et:S.et||0,mv:S.mv||0,idle:S.idle||0,stk:S.stk||0,sh:S.sh||0,bv:S.bv||0};}`;
const run = (q) => { const out = path.join(os.tmpdir(), 'al-' + (q ? 'off' : 'on') + '.json');
  const r = cp.spawnSync('node', [path.join(__dirname, '..', 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human', BUILDS: 'fresh', STAGES, RUNS, PAR: '4', Q: q, PRE: REC, JSON: out }), encoding: 'utf8', timeout: 900000 });
  for (const l of (r.stdout || '').split('\n')) if (/FAIL page error|RUN ERROR/.test(l)) fail.push('(e) ' + (q || 'on') + ' ' + l.trim());
  return JSON.parse(fs.readFileSync(out, 'utf8')); };
const sum = (a) => { const s = { et: 0, mv: 0, idle: 0, stk: 0, sh: 0, bv: 0, c: 0, n: 0 }; for (const r of a) { const x = r.px || {}; for (const k of ['et', 'mv', 'idle', 'sh', 'bv']) s[k] += x[k] || 0; s.stk = Math.max(s.stk, x.stk || 0); s.c += r.clear ? 1 : 0; s.n++; s.h = (s.h || 0) + (r.hits || 0); } return s; };
const line = (s) => `speed ${(s.mv / Math.max(1e-6, s.et)).toFixed(0)} px/s, idle ${(100 * s.idle / Math.max(1e-6, s.et)).toFixed(0)}%, longest idle ${s.stk.toFixed(1)} s, shots/enemy/10s ${(10 * s.sh / Math.max(1e-6, s.et)).toFixed(1)}, bullet speed ${(s.bv / Math.max(1, s.sh)).toFixed(0)}, human clear ${s.c}/${s.n}, hits/run ${((s.h || 0) / Math.max(1, s.n)).toFixed(1)}`;
const on = run(''), off = process.env.OFF === '0' ? null : run('&alive=0');
for (const n of STAGES.split(',').map(Number)) { console.log(`  stage ${n} on : ${line(sum(on.filter(r => r.n === n)))}`); if (off) console.log(`  stage ${n} off: ${line(sum(off.filter(r => r.n === n)))}`); }
const A = sum(on), B = off ? sum(off) : null;
console.log('  pooled on : ' + line(A)); if (B) console.log('  pooled off: ' + line(B));
if (GATE) {
  ok(A.idle / A.et < .15, `(a) idle ${(100 * A.idle / A.et).toFixed(0)}% (< 15%)`);
  ok(A.stk <= 1.25, `(b) longest idle stretch ${A.stk.toFixed(2)} s (<= 1.2 s)`);
  if (B) ok(A.mv / A.et >= 1.5 * B.mv / B.et, `(c) speed ${(A.mv / A.et).toFixed(0)} vs old ${(B.mv / B.et).toFixed(0)} px/s (>= 1.5x)`);
  ok(A.c / A.n >= .6 && A.c / A.n <= .85, `(d) human clear ${(100 * A.c / A.n).toFixed(0)}% (60-85%)`);
}
for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
console.log(fail.length ? 'FAIL alive-test' : 'PASS alive-test'); process.exit(fail.length ? 1 : 0);
