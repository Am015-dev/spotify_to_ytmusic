const {load}=require('./load');const X=load(['data.js','engine.js','ai.js'],';globalThis.__S=(K,S)=>solve(K,S||40,mkRng(1));globalThis.__B=buildModel;');
let found=0;
for(const n of [4,5,6,7,8])for(const np of [2,3,4,5])for(let g=0;g<4&&found<3;g++){X.setSeed(n*1000+np*10+g);X.ai.setAiSeed(g);X.newGame({np,mission:n,mode:'ai'});let k=0;
  while(!X.G.over&&k++<3000&&found<3){const s=X.sideToAct();if(s>=0&&X.G.step==='act'&&!X.G.q&&s===X.G.actor){const K=X.knowledge(s);const Z=X.ctx.__S(K,20);
      if(!Z.exact){found++;const M=Z.M;console.log('JOB',n,np,'seat',s,'turn',X.G.turn,'bad',M.bad,'W',M.W.length,'bins',M.bins.map(b=>b.kind+':'+(b.slots?b.slots.length+'['+b.lo+','+b.hi+']':b.cap)).join(' '));
        console.log('glob',JSON.stringify(M.glob).slice(0,400));
        for(const st of K.stands)console.log(' st',st.i,st.owner,st.mine?'mine':'',st.slots.map(x=>(x.v==null?'?':x.v)+(x.cut?'c':'')+(x.tok.length?'{'+x.tok.map(t=>t.t+t.v).join()+'}':'')+(x.not.length?'!'+x.not.join('/'):'')+(x.na?'na':'')).join(' '));
        console.log(' truth',X.G.st.map(st=>st.w.map(x=>X.E.cv(x.id)).join(' ')).join(' | '));
        console.log(' U',M.W.map(w=>w.c+w.s).join(' '),'aside',K.aside,'markers',JSON.stringify(K.markers))}}
    const st=X.ai.aiStep();if(!st)break;X.performMove(st.m,st.seat)}}
