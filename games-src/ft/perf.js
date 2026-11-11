const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';const ctx={console,Math,JSON,Date,performance};vm.createContext(ctx);
vm.runInContext(['data.js','djinns.js','engine.js','ai.js','story.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.X={get G(){return G},newGame,setSeed,allPlans,P,sideToAct,aiMove,performMove,UI}',ctx);
const X=ctx.X;for(const [np,ex] of [[2,{}],[5,{sultan:true}],[4,{artisans:true,sultan:true,thieves:true}]]){X.setSeed(5);X.newGame({np,mode:'ai',ex});let n=0;while(X.G.phase==='bid'&&n++<50){const s=X.sideToAct();X.performMove(X.aiMove(s),s)}
  const t=performance.now();const pl=X.allPlans(X.P(X.G.cur));console.log(np,JSON.stringify(ex),'plans',pl.length,Math.round(performance.now()-t)+'ms')}
