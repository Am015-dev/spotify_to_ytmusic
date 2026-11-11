const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const [job,np,N]=process.argv.slice(2).map(Number);const tot={};
for(let g=0;g<N;g++){const seed=2000+g;X.setSeed(seed);X.ai.setAiSeed(seed);X.newGame({np,mission:job,mode:'ai',level:'hard'});let k=0;
 while(!X.G.over&&k++<3000){const st=X.ai.aiStep();if(!st)break;X.performMove(st.m,st.seat)}
 for(const e of X.G.eq){const key=e.id+':'+e.st;tot[key]=(tot[key]||0)+1}tot.W=(tot.W||0)+(X.G.over.win?1:0)}
console.log(job,np,JSON.stringify(tot));
