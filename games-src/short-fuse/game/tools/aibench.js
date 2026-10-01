// AI benchmark on a job list (same seeds as gauntlet.js): node tools/aibench.js 29,43,45 [seeds] [level] [seed0] [out.json]
// prints wins per job / player count, loss reasons and decision timing (main decisions only)
const {load}=require('./load');const fs=require('fs');const A=process.argv.slice(2);
const jobs=A[0].split(',').flatMap(r=>{const [a,b]=r.split('-').map(Number);return b?[...Array(b-a+1).keys()].map(i=>a+i):[a]});const seeds=+A[1]||8,lv=A[2]||'normal',s0=+A[3]||0,outF=A[4];
const X=load(['data.js','engine.js','ai.js'],process.env.AIPATCH||'');const R=[];let dt=0,dn=0,dmax=0;const t0=Date.now();
for(const n of jobs)for(const np of (process.env.NPS||'2,3,4,5').split(',').map(Number)){if(!X.MISSIONS[n].pl.includes(np))continue;const o={n,np,g:0,w:0,why:{}};R.push(o);
  for(let g=s0;g<s0+seeds;g++){const seed=7919*n+104729*np+g*31337;X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);X.newGame({np,mission:n,mode:'ai',level:lv,turnSec:+process.env.TURNSEC||undefined});let k=0;
    while(!X.G.over&&k++<4000){const main=X.G.step==='act'&&!X.G.q;const t=Date.now();const st=X.ai.aiStep();const d=Date.now()-t;if(main&&st&&st.seat===X.G.actor){dt+=d;dn++;if(d>dmax)dmax=d}if(!st)break;if(!X.performMove(st.m,st.seat).success){console.log('REJ',n,np,g,JSON.stringify(st.m));break}}
    o.g++;if(X.G.over&&X.G.over.win)o.w++;else{const w=X.G.over?X.G.over.why.replace(/[A-Z][a-z]+('s)?/g,'X').slice(0,50):'unfinished';o.why[w]=(o.why[w]||0)+1}}
  console.log(`job ${String(n).padStart(2)} ${np}p win ${o.w}/${o.g}  ${Object.entries(o.why).map(([k,v])=>v+'x '+k).join('; ')}`)}
const W=R.reduce((a,r)=>a+r.w,0),Gn=R.reduce((a,r)=>a+r.g,0);
console.log(`TOTAL ${lv} wins ${W}/${Gn} (${(100*W/Gn).toFixed(0)}%)  decision avg ${(dt/Math.max(1,dn)).toFixed(1)} ms max ${dmax} ms  time ${((Date.now()-t0)/1000).toFixed(0)}s`);
if(outF)fs.writeFileSync(outF,JSON.stringify({lv,seeds,s0,rows:R,dAvg:dt/Math.max(1,dn),dMax:dmax}));
