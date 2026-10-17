// calibration: predicted chance of the chosen dual cut vs the real outcome
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js'],';globalThis.__L=()=>AILAST;');
const jobs=(process.argv[2]||'4,5,6,7,8').split(',').map(Number);const seeds=+process.argv[3]||6;const lv=process.argv[4]||'normal';
const B=[0,0,0,0,0,0,0,0,0,0,0].map(()=>({n:0,hit:0,ps:0}));let inexact=0,tot=0;
for(const n of jobs)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){X.setSeed(n*1000+np*10+g);X.ai.setAiSeed(g);X.newGame({np,mission:n,mode:'ai',level:lv});let k=0;
  while(!X.G.over&&k++<3000){const st=X.ai.aiStep();if(!st)break;const isDual=st.m.a==='dual'&&X.G.step==='act'&&st.seat===X.G.actor;const L=isDual?X.ctx.__L():null;const ok0=X.G.stats.dualOk,m0=X.G.stats.miss,ov=X.G.over;
    X.performMove(st.m,st.seat);if(isDual&&L){const hit=X.G.stats.dualOk>ok0?1:(X.G.stats.miss>m0||(X.G.over&&!X.G.over.win))?0:null;if(hit==null)continue;tot++;if(!L.exact)inexact++;const b=B[Math.min(10,Math.floor(L.p*10))];b.n++;b.hit+=hit;b.ps+=L.p}}}}
console.log('bucket  n  predicted  actual');B.forEach((b,i)=>{if(b.n)console.log(`${(i/10).toFixed(1)}  ${String(b.n).padStart(4)}  ${(b.ps/b.n).toFixed(2)}  ${(b.hit/b.n).toFixed(2)}`)});console.log('inexact samples',inexact,'of',tot);
