// node tools/one.js job np seed [maxSteps] - plays one AI game and prints timing and outcome
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const [n,np,seed,max]=process.argv.slice(2).map(Number);X.setSeed(seed||1);X.ai.setAiSeed(seed||1);X.newGame({np,mission:n,mode:'ai'});
const t0=Date.now();let k=0,slow=0;while(!X.G.over&&k++<(max||3000)){const t=Date.now();const st=X.ai.aiStep();if(!st){console.log('stall',X.G.step);break}const r=X.performMove(st.m,st.seat);if(!r.success){console.log('REJ',r.error,JSON.stringify(st.m));break}
  const dt=Date.now()-t;if(dt>400&&slow++<5)console.log('slow step',dt,'ms',JSON.stringify(st.m).slice(0,100),'hid',X.knowledge(st.seat).stands.reduce((a,s)=>a+s.slots.filter(x=>x.v==null).length,0))}
console.log('job',n,np,'steps',k,'turns',X.G.turn,'ms',Date.now()-t0,X.G.over&&X.G.over.why);
