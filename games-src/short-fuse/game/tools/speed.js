const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
for(const lv of ['easy','normal','hard']){let t=0,n=0;for(let g=0;g<3;g++){X.setSeed(77+g);X.ai.setAiSeed(g);X.newGame({np:4,mission:8,mode:'ai',level:lv});let k=0;
  while(!X.G.over&&k++<2000){const s=X.sideToAct();const t0=Date.now();const st=X.ai.aiStep();const dt=Date.now()-t0;if(!st)break;if(X.G.step==='act'&&st.seat===X.G.actor&&!X.G.q){t+=dt;n++}X.performMove(st.m,st.seat)}}
  console.log(lv,'main decisions',n,'avg ms',(t/n).toFixed(1))}
