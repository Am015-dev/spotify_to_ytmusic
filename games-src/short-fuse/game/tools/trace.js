// prints the public log of one AI game: node tools/trace.js job np seed
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const [n,np,seed]=process.argv.slice(2).map(Number);X.setSeed(seed);X.ai.setAiSeed(seed);X.newGame({np,mission:n,mode:'ai'});
let k=0;while(!X.G.over&&k++<3000){const st=X.ai.aiStep();if(!st)break;X.performMove(st.m,st.seat)}console.log(X.G.log.slice().reverse().map(l=>l.t).join('\n'));
