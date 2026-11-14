// First-game bench (W486): a sensible-novice policy on side 0 vs the default first-game rival on side 1, headless.
// Run: node bench-first.js [N=200] [lvl=<default from ui.js>] [sizeK=core]     (loads geo/data/exp/engine/ai into a vm, no page)
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now } }; vm.createContext(C);
for (const f of ['geo', 'data', 'exp', 'engine', 'ai']) vm.runInContext(fs.readFileSync(path.join(__dirname, f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C);
const N = +process.argv[2] || 200, NOV = +process.env.NOV || 30;   // NOV: how sloppy the novice is (random wobble added to each maneuver score)
const uiSrc = fs.readFileSync(path.join(__dirname, 'ui.js'), 'utf8');
const dm = /Object\.assign\(UI,\{mode:'solo',fac:\[0,1\],lvl:'(\w+)',size:'(\w+)'/.exec(uiSrc);
const LVL = process.argv[3] || (dm && dm[1]) || 'normal', SIZE = process.argv[4] || (dm && dm[2]) || 'core';
run('refresh=function(){};ANIM=0;AIDELAY=0;var NOV='+NOV+';');
if (process.env.LVX) run('Object.assign(LV.'+LVL+','+process.env.LVX+')');   // experiment: LVX='{noise:1}'
if (process.env.AIWX) run('Object.assign(AIW,'+process.env.AIWX+')');
// novice pilot: flies at the nearest enemy, likes green moves, takes focus, never flies off the mat, never picks a stress-breaking red
run(`(function(){
  const near=(p,s)=>{let b=1e9;for(const e of enemiesOf(s))b=Math.min(b,len(sub(e,p)));return b};
  const inArc=(p,s)=>enemiesOf(s).some(e=>{const r=arcReach(p,B(s),e,B(e),s.arc);return r&&rangeOf(r.d)<=3});
  const shots=s=>enemiesOf(s).filter(e=>{const r=arcReach(s,B(s),e,B(e),s.arc);return r&&rangeOf(r.d)<=3});
  aiPlan=function(k){for(const s of alive().filter(s=>s.side===k)){let best=0,bv=-1e9;
    dialOf(s).forEach((m,i)=>{const mm=exColor(s,m);if(mm.c==='r'&&s.stress)return;const p=finalPose(s,B(s),m);let v=-Math.abs(near(p,s)-230)/8;
      if(offBoard(p,B(s)))v-=1000;const ed=Math.min(p.x,p.y,MAT-p.x,MAT-p.y);if(ed<130)v-=(130-ed)/3;const fx=p.x+Math.cos(p.h)*170,fy=p.y+Math.sin(p.h)*170;if(fx<30||fy<30||fx>MAT-30||fy>MAT-30)v-=40;// don't fly toward a wall
      if(inArc(p,s))v+=25;if(mm.c==='g')v+=12;else if(mm.c==='r')v-=25;if(m.t==='K')v-=15;v+=Math.random()*NOV;if(v>bv){bv=v;best=i}});
    s.dial=best}};
  const baseAction=aiAction;
  aiAction=function(s,acts){if(s.side!==0)return baseAction(s,acts);acts=acts||actionsFor(s);const has=k=>acts.find(a=>a.a===k);
    if(has('F')&&!s.focus)return ['F'];if(has('E')&&!shots(s).length&&!s.evade)return ['E'];if(has('F'))return ['F'];return ['skip']};
  aiFree=function(s,acts,why){return null};
})()`);
const rounds = [];let wins = 0, draws = 0, cap = 0;
for (let g = 0; g < N; g++) {
  run(`newGame({fac:[0,1],players:[{human:false,lvl:'normal'},{human:false,lvl:'${LVL}'}],sizeK:'${SIZE}',close:${SIZE==='core'},${SIZE==='core'&&!process.env.SQ0&&!process.env.SQ1?'squads:FIRST_GAME.sq,':''}${SIZE==='core'&&!process.env.EXX?'ex:FIRST_GAME.ex,':''}${(process.env.SQ1||process.env.SQ0)?`squads:[${process.env.SQ0||"CORE_DUEL[0]"},${process.env.SQ1||"CORE_DUEL[1]"}],`:''}${process.env.EXX?`ex:${process.env.EXX},`:''}seed:${1000 + g}});`);
  let n = 0;
  while (!run('G.winner') && n++ < 20000) { if (run("G.phase==='roundend'")) run('startRound()'); run('aiStep()'); if (run('G.round') > 40) break; }
  const w = run('G.winner'), r = run('G.round');
  if (w === 'P1' || w === 0 || w === '0') wins++; else if (!w) cap++; else if (w !== 'P2' && w !== 1 && w !== '1') draws++;
  rounds.push(r);
  if (g === 0) console.log('first winner value', JSON.stringify(w));
}
rounds.sort((a, b) => a - b);
console.log(`lvl=${LVL} size=${SIZE} N=${N} novice win%=${(100 * wins / N).toFixed(1)} draws=${draws} unfinished=${cap} median rounds=${rounds[N >> 1]} p90=${rounds[Math.floor(N * .9)]} max=${rounds[N - 1]}`);
