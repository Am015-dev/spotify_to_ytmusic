const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const C=X.ctx;const n=+process.argv[2]||8,np=+process.argv[3]||4;
const Ks=[];for(let g=0;g<3;g++){X.setSeed(77+g);X.ai.setAiSeed(g);X.newGame({np,mission:n,mode:'ai',level:'normal'});let k=0;while(!X.G.over&&k++<2000){const st=X.ai.aiStep();if(!st)break;if(X.G.step==='act'&&st.seat===X.G.actor&&!X.G.q)Ks.push(X.knowledge(st.seat));X.performMove(st.m,st.seat)}}
const T=(f)=>{const t=Date.now();for(const K of Ks)f(K);return ((Date.now()-t)/Ks.length).toFixed(1)};
console.log('decisions',Ks.length);
for(const [S,ch] of [[60,1],[60,2],[200,4],[140,1]])console.log('solve S',S,'ch',ch,T(K=>C.solve(K,S,C.mkRng(1),0,ch)),'ms');
console.log('check',T(K=>{if(K.legal.plain[0]){const m=K.legal.plain[0];C.certainCheck(K,m.st,m.ks[0],m.v==='Y'?13:m.v,C.mkRng(2),{forget:0})}}));
console.log('knowledge',T(K=>X.knowledge(K.seat)));
let nc=0;const orig=C.certainCheck;
console.log('decide',T(K=>C.decide(K)));
const o2=C.sampleDeals;let calls=0;C.sampleDeals=function(...a){calls++;return o2(...a)};
console.log('decide again',T(K=>C.decide(K)),'sampleDeals calls/decision',(calls/Ks.length).toFixed(2));
