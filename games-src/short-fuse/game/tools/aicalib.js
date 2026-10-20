// calibration of the AI's single-wire dual cuts: node tools/aicalib.js jobs seeds level chains
// buckets predicted p (and predicted red) against the real wire
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const C=X.ctx;const A=process.argv.slice(2);
const jobs=A[0].split(',').flatMap(r=>{const [a,b]=r.split('-').map(Number);return b?[...Array(b-a+1).keys()].map(i=>a+i):[a]});const seeds=+A[1]||2,lv=A[2]||'normal';if(A[3])C.setAiChains(+A[3]);
const B={};const add=(k,hit)=>{B[k]=B[k]||[0,0];B[k][0]++;B[k][1]+=hit};let reds=0,redHi=0;
for(const n of jobs)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){const seed=7919*n+104729*np+g*31337;X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);X.newGame({np,mission:n,mode:'ai',level:lv});let k=0;
  while(!X.G.over&&k++<4000){const main=X.G.step==='act'&&!X.G.q;C.AIDBG={};const st=X.ai.aiStep();if(!st)break;
    if(main&&st.m.a==='dual'&&st.m.ks.length===1&&!st.m.v2&&!st.m.own&&C.AIDBG.cand){const c=C.AIDBG.cand.find(c=>c.m===JSON.stringify(Object.assign({},st.m,{})))||C.AIDBG.cand[0];
      const p=c.p;const real=X.E.cv(X.G.st[st.m.st].w[st.m.ks[0]].id);const hit=real===st.m.v?1:0;const b=p>=.995?'100':p>=.95?'95-99':p>=.9?'90-95':p>=.8?'80-90':p>=.6?'60-80':'<60';add(b,hit);if(real==='R'){reds++;if(p>=.95)redHi++}}
    X.performMove(st.m,st.seat)}}}
for(const k of ['100','95-99','90-95','80-90','60-80','<60'])if(B[k])console.log(k.padStart(6),'n',String(B[k][0]).padStart(5),'hit',(100*B[k][1]/B[k][0]).toFixed(1)+'%');
console.log('red targets',reds,'of which predicted >=95% safe',redHi);
