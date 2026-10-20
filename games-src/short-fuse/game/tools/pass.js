const {load}=require('./load');const X=load(['data.js','engine.js','ai.js'],';globalThis.__L=()=>AILAST;');
const [job,np,N]=process.argv.slice(2).map(Number);let forced=0,vol=0,cuts=0,miss=0;const vs=[];
for(let g=0;g<N;g++){const seed=3000+g;X.setSeed(seed);X.ai.setAiSeed(seed);X.newGame({np,mission:job,mode:'ai',level:'hard'});let k=0;
 while(!X.G.over&&k++<3000){const s=X.G.cur;const K=X.knowledge(X.sideToAct());const st=X.ai.aiStep();if(!st)break;const m=st.m;
  const d0=X.G.dial;X.performMove(m,st.seat);
  if(m.a==='pass'){const L=K.legal;const n=L?(L.plain.length+L.solo.length):0;if(n)vol++;else forced++}
  else if(m.a==='dual'||m.a==='solo'){cuts++;if(X.G.dial<d0)miss++}}}
console.log(job,np,'forced pass',forced,'voluntary',vol,'cuts',cuts,'dial-drops on cuts',miss);
