// why do crews point at reds? node tools/reddiag.js from to seeds level
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const [a,b,seeds]=process.argv.slice(2,5).map(Number);const lv=process.argv[5]||'normal';const C=X.ctx;
for(let n=a;n<=b;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){const seed=7919*n+104729*np+g*31337;X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);X.newGame({np,mission:n,mode:'ai',level:lv});let k=0,last=null;
  while(!X.G.over&&k++<4000){const main=X.G.step==='act'&&!X.G.q;const st=X.ai.aiStep();if(!st)break;
    if(main&&st.m.a==='dual'){const K=X.knowledge(st.seat);const Z=C.solve(K,60,C.mkRng(1));const prs=st.m.ks.map(k=>C.pAt(Z,st.m.st,k,14));const legal=K.legal.plain;let minpr=1;for(const m of legal)minpr=Math.min(minpr,C.pAt(Z,m.st,m.ks[0],14));
      last={m:X.describeMove(st.m),p:C.AILAST&&C.AILAST.p,prs,exact:Z.exact,n:Z.samples.length,minpr,dial:X.G.dial,damper:K.tfx.damper,tool:st.m.tool}}
    X.performMove(st.m,st.seat)}
  if(X.G.over&&/red/.test(X.G.over.why))console.log(n,np,g,X.G.over.why.slice(0,40),JSON.stringify(last))}}
