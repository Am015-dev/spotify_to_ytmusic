// Crew red-wire check: computer crews (3 seats, Normal) play jobs 1-4. Counts losses where a crewmate pointed at a red wire,
// and whether a safe move existed then: a solo cut, or a wire that cannot be red (no red in play fits its sorted place and tokens)
// whose miss would not burn the last fuse step. node crew-red-test.js [jobs=30] [level=normal] [from=1] [to=4]
const {load}=require('./tools/load');
const A=process.argv.slice(2);const N=+A[0]||30,lv=A[1]||'normal',from=+A[2]||1,to=+A[3]||4;
const X=load(['data.js','engine.js','ai.js']);const C=X.ctx;
// a red still in play fits this wire's place in the sorted stand and its tokens (never calls a possible red safe)
function canBeRed(Z,st,k){const M=Z.M;const key=st+':'+k;if(M.known[key]!=null)return M.known[key]===14;const h=M.ref[key];if(h==null)return false;
  for(let t=0;t<M.T.length;t++)if(M.T[t].code===14&&M.ok[h][t])return true;return false}
let jobs=0,wins=0,red=0,redSafe=0,fuse=0,other=0,errs=0;const t0=Date.now();
for(let g=0;jobs<N;g++){const n=from+(g%(to-from+1));const seed=7919*n+104729*3+g*31337;X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);
  try{X.newGame({np:3,mission:n,mode:'ai',level:lv});let k=0,safeAtBoom=null,dialAt=null;
    while(!X.G.over&&k++<4000){const st=X.ai.aiStep();if(!st)break;const m=st.m;
      if(m.a==='dual'&&m.st!=null&&m.ks&&m.ks.some(kk=>X.E.cv(X.G.st[m.st].w[kk].id)==='R')){
        // a red is about to be pointed at: was there a move that could not be red?
        const K=X.knowledge(st.seat);let safe=K.legal.solo.length>0;
        if(!safe){const Z=C.solve(K,240,()=>Math.random(),0,3);for(const p of K.legal.plain){if(p.ks.some(kk=>canBeRed(Z,p.st,kk)))continue;const pv=C.pAt(Z,p.st,p.ks[0],p.v==='Y'?13:p.v);if((K.dial==null||K.dial>1)||pv>=.995){safe=true;break}}}
        dialAt=K.dial;
        safeAtBoom=safe;if(process.env.DBG){const Z=C.solve(K,240,()=>Math.random(),0,3);const ps=K.legal.plain.map(p=>({v:p.v,st:p.st,k:p.ks[0],p:+C.pAt(Z,p.st,p.ks[0],(p.v==='Y'?13:p.v)).toFixed(2),pr:+C.pAt(Z,p.st,p.ks[0],14).toFixed(3),loc:canBeRed(Z,p.st,p.ks[0])})).sort((a,b)=>a.pr-b.pr);console.log('  move',JSON.stringify(m),'exact',Z.exact,'chosen pr',C.pAt(Z,m.st,m.ks[0],14).toFixed(3),'solo',K.legal.solo.length,'eq',K.legal.eq.length,'tools',JSON.stringify(K.legal.tools),'dial',K.dial,'\n  lowest-pr',JSON.stringify(ps.slice(0,4)),'\n  red markers',JSON.stringify(K.markers))}}
      const r=X.performMove(m,st.seat);if(!r.success){errs++;break}}
    const o=X.G.over;jobs++;if(o&&o.win)wins++;else if(o&&/pointed at/.test(o.why)){red++;if(safeAtBoom)redSafe++;console.log('RED',n,g,o.why,'fuse left',dialAt,'safe move existed:',safeAtBoom)}
    else if(o&&/fuse/.test(o.why))fuse++;else other++}catch(e){errs++;jobs++;console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}}
console.log(`CREW-RED jobs ${jobs} (jobs ${from}-${to}, 3 crew, ${lv}) wins ${wins} red-losses ${red} (safe move existed ${redSafe}) fuse ${fuse} other ${other} errors ${errs} ${((Date.now()-t0)/1000).toFixed(0)}s`);
process.exit(errs?1:0);
