#!/usr/bin/env node
// SLICE (parts/waves/slice.js, flag RET.slice): stages 1-3 Normal, stepped sim through humanbot.js (human bot + a parked bot that never steers or dashes).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/slice-test.js    env: RUNS=8 STAGES=1,2,3 Q='&slice=0' (measure the old waves) GATE=0 (numbers only)
// Gates: (a) >= 85% of spawned foes are killed or stay >= 4 s on screen  (b) max threats on screen <= 6  (c) human clear 60-90% pooled
//        (d) parked clear < 20% pooled  (e) every spawn within 60 ms of a beat  (f) no page errors. The recorder is layer-independent (works with ?slice=0).
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '8', STAGES = process.env.STAGES || '1,2,3', Q = process.env.Q || '', GATE = process.env.GATE !== '0';
const pass = [], fail = [], ok = (c, m) => (c ? pass : fail).push(m);
const REC = `window.__rec=(m)=>{const S=window.__sl||(window.__sl={t:new Map(),max:0});const G=m.G,W=960;let on=0;
  for(const e of G.en){if(e.type==='boss'||e.mini||e.dead||e.hp<=0)continue;on++;let r=S.t.get(e);
    if(!r){const bp=m.bpos();r={ty:e.type,t0:G.t,ph:Math.abs(bp-Math.round(bp))*m.BT.spb*1000,tin:-1,t1:-1,k:0};S.t.set(e,r);}
    if(r.tin<0&&e.x<W-(e.r||14)&&e.x>-20&&e.y>-20&&e.y<560)r.tin=G.t;}
  S.max=Math.max(S.max,on);S.mh=Math.min(S.mh==null?99:S.mh,m.P.hp);if(S.se==null&&G.dbar>=m.ST.len-.5)S.se=G.score;for(const[e,r]of S.t)if(r.t1<0&&(e.dead||e.hp<=0||!G.en.includes(e))){r.t1=G.t;r.k=e.hp<=0?1:0;}};
  window.__recOut=m=>{const S=window.__sl||{t:new Map(),max:0};const a=[...S.t.values()].map(r=>({ty:r.ty,ph:+r.ph.toFixed(1),on:r.tin<0?0:+((r.t1<0?m.G.t:r.t1)-r.tin).toFixed(2),k:r.k,end:r.t1>=0}));
    const o={mh:S.mh,max:S.max,se:S.se,sv:m.ST.sv,a,dec:window.SL&&SL.on&&SL.log?SL.log.dec:null,sl:!!(window.SL&&SL.st&&SL.st.n)};window.__sl=null;return o;}`;
const run = (bot, pre) => { const out = path.join(os.tmpdir(), 'sl-' + bot + '.json');
  const r = cp.spawnSync('node', [path.join(__dirname, '..', 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human', BUILDS: 'fresh', STAGES, RUNS, PAR: '4', Q, PRE: REC + ';' + pre, JSON: out }), encoding: 'utf8', timeout: 900000 });
  for (const l of (r.stdout || '').split('\n')) if (/FAIL page error|RUN ERROR/.test(l)) fail.push('(f) ' + bot + ' ' + l.trim());
  return JSON.parse(fs.readFileSync(out, 'utf8')); };
const hu = run('human', ''), pk = run('parked', '{const m=window.__mnr;m.__p0=m.__p0||m.press;m.touchTo=()=>{};m.press=k=>k==="Fire"?m.__p0(k):0;}');
// the parked bot still fires on the beat: keep the real press for Fire only
let hc = 0, ht = 0, pc = 0, pt = 0, good = 0, all = 0, mx = 0, offBeat = 0, late = [];
for (const n of STAGES.split(',').map(Number)) {
  const a = hu.filter(r => r.n === n), b = pk.filter(r => r.n === n);
  const fo = a.flatMap(r => r.px.a), g = fo.filter(f => f.k || f.on >= 4 || !f.end).length, m = Math.max(...a.map(r => r.px.max)), ob = fo.filter(f => f.ph > 60).length;
  const dec = a.map(r => (r.px.dec || []).map(d => d.k + ':' + d.got).join(' ')).filter(Boolean);
  console.log(`  stage ${n}${a[0] && a[0].px.sl ? ' (slice)' : ''}: human clear ${a.filter(r => r.clear).length}/${a.length}, parked clear ${b.filter(r => r.clear).length}/${b.length}, foes/run ${(fo.length / a.length).toFixed(0)}, killed-or-4s ${(100 * g / Math.max(1, fo.length)).toFixed(0)}%, max on screen ${m}, off-beat spawns ${ob}/${fo.length}, run time med ${a.map(r => r.t).sort((x, y) => x - y)[a.length >> 1]} s, deaths ${a.filter(r => r.dead).length}, hits ${a.map(r => r.hits).join("/")}, lowest hull ${a.map(r => r.px.mh).join("/")}${n === 3 ? ', score at song end ' + a.map(r => r.px.se).join('/') + ' (goal ' + a[0].px.sv + ')' : ''}${dec.length ? ', decisions ' + dec[0] : ''}`);
  hc += a.filter(r => r.clear).length; ht += a.length; pc += b.filter(r => r.clear).length; pt += b.length; good += g; all += fo.length; mx = Math.max(mx, m); offBeat += ob;
}
const p = x => (100 * x).toFixed(0) + '%';
console.log(`  pooled: human clear ${hc}/${ht} = ${p(hc / ht)}, parked clear ${pc}/${pt} = ${p(pc / pt)}, killed-or-4s ${p(good / all)}, max on screen ${mx}, off-beat ${offBeat}/${all}`);
if (GATE) {
  ok(good / all >= .85, `(a) killed or >= 4 s on screen ${p(good / all)} (>= 85%)`);
  ok(mx <= 6, `(b) max threats on screen ${mx} (<= 6)`);
  ok(hc / ht >= .6 && hc / ht <= .9, `(c) human clear ${p(hc / ht)} (60-90%)`);
  ok(pc / pt < .2, `(d) parked clear ${p(pc / pt)} (< 20%)`);
  ok(offBeat === 0, `(e) spawns more than 60 ms off a beat: ${offBeat}`);
}
for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
console.log(fail.length ? 'FAIL slice-test' : 'PASS slice-test'); process.exit(fail.length ? 1 : 0);
