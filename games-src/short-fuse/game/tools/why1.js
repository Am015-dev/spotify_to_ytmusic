const {load}=require('./load');const X=load(['data.js','engine.js','ai.js'],';globalThis.__L=()=>AILAST;globalThis.__S=(K)=>{const Z=solve(K,60,mkRng(1));return Z};');
let found=0;
for(const n of [4,5,6,7,8])for(const np of [2,3,4,5])for(let g=0;g<4&&found<2;g++){X.setSeed(n*1000+np*10+g);X.ai.setAiSeed(g);X.newGame({np,mission:n,mode:'ai'});let k=0;
  while(!X.G.over&&k++<3000&&found<2){const st=X.ai.aiStep();if(!st)break;const isDual=st.m.a==='dual'&&!st.m.tool&&X.G.step==='act'&&st.seat===X.G.actor;
    let K=null,L=null;if(isDual){K=X.knowledge(st.seat);L=X.ctx.__L()}
    const m0=X.G.stats.miss;const sl=isDual?X.G.st[st.m.st].w[st.m.ks[0]]:null;const real=sl?X.E.cv(sl.id):null;
    X.performMove(st.m,st.seat);
    if(isDual&&L&&L.p>=0.999&&real!==st.m.v){found++;console.log('JOB',n,np,'seat',st.seat,'move',JSON.stringify(st.m),'real',real,'L',JSON.stringify(L));
      const s=K.stands[st.m.st];console.log('target stand (seat view):',s.slots.map((x,i)=>(i===st.m.ks[0]?'>>':'')+(x.v==null?'?':x.v)+(x.cut?'c':'')+(x.tok.length?'{'+x.tok.map(t=>t.t+t.v).join()+'}':'')+(x.not.length?'!'+x.not.join('/'):'')).join(' '));
      console.log('truth:',X.G.st[st.m.st].w.map(x=>X.E.cv(x.id)+(x.cut?'c':'')).join(' '));
      console.log('markers',JSON.stringify(K.markers),'ann',JSON.stringify(K.ann).slice(0,300),'marks',JSON.stringify(K.marks));
      const Z=X.ctx.__S(K);const h=Z.M.ref[st.m.st+':'+st.m.ks[0]];console.log('model bad',Z.M.bad,'exact',Z.exact,'P',Array.from(Z.P[h]).map((p,c)=>p>0?c+':'+p.toFixed(2):'').filter(Boolean).join(' '));
      const bin=Z.M.bins.find(b=>b.slots&&b.slots.includes(h));console.log('bin',JSON.stringify({lo:bin.lo,hi:bin.hi,n:bin.slots.length}),'W',Z.M.W.length,'caps',Z.M.bins.map(b=>b.kind+(b.slots?b.slots.length:b.cap)).join(','))}}}
