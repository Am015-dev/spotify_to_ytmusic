const {load}=require('./load');
const X=load(['data.js','engine.js','ai.js'],';globalThis.__L=()=>AILAST;');
const [job,np,N]=process.argv.slice(2).map(Number);
const bins={};let skips=0,moves=0,W=0;
for(let g=0;g<N;g++){const seed=1000+g;X.setSeed(seed);X.ai.setAiSeed(seed);X.newGame({np,mission:job,mode:'ai',level:'hard'});let k=0;
 while(!X.G.over&&k++<3000){const d0=X.G.dial;const st=X.ai.aiStep();if(!st)break;const L=X.ctx.__L();const m=st.m;const r=X.performMove(m,st.seat);moves++;
  if(m.a==='dual'||m.a==='solo'){const p=L&&L.p!=null?L.p:-1;const b=p<0?'na':p>=.995?'1':p>=.9?'.9':p>=.7?'.7':p>=.5?'.5':'lo';const bad=X.G.dial<d0||X.G.over&&!X.G.over.win;(bins[b]=bins[b]||[0,0]);bins[b][0]++;if(bad)bins[b][1]++}
  else if(m.a==='pass'&&X.G.dial<d0)skips++}
 if(X.G.over.win)W++}
console.log(job,np,'wins',W,'/',N,'skips',skips,'moves',moves,JSON.stringify(bins));
