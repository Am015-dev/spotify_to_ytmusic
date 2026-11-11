// Computer-only crews at 2/3/4/5 players across the jobs. node gauntlet.js [fromJob] [toJob] [seeds] [level] [out.json]
// Counts wins per job and player count, errors (rejected moves, exceptions, invariant failures) and stalls.
const {load}=require('./tools/load');const fs=require('fs');
const A=process.argv.slice(2);const from=+A[0]||1,to=+A[1]||66,seeds=+A[2]||4,lv=A[3]||'normal',outF=A[4]||null;
const X=load(['data.js','engine.js','ai.js']);
const R={};let errs=0,stalls=0,games=0,inv=0;const t0=Date.now();const why={};
for(let n=from;n<=to;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;const key=n+'/'+np;R[key]={n,np,g:0,w:0,turns:0,ms:0,why:{}};
  for(let g=0;g<seeds;g++){const seed=7919*n+104729*np+g*31337;X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);const tg=Date.now();
    try{X.newGame({np,mission:n,mode:'ai',level:lv});let k=0,sig='',same=0;
      while(!X.G.over&&k++<4000){const st=X.ai.aiStep();if(!st){stalls++;console.log('STALL',key,g,X.G.step,X.G.q&&X.G.q.kind,X.sideToAct());break}
        const r=X.performMove(st.m,st.seat);if(!r.success){errs++;if(errs<20)console.log('REJ',key,g,r.error,JSON.stringify(st.m).slice(0,200));break}
        if(k%10===0){const iv=X.checkInvariants();if(iv.length){inv++;if(inv<10)console.log('INV',key,g,iv[0])}}
        const s2=X.G.turn+':'+X.G.logN;if(s2===sig){if(++same>60){stalls++;console.log('LOOP',key,g);break}}else{sig=s2;same=0}}
      games++;const o=R[key];o.g++;o.turns+=X.G.turn;o.ms+=Date.now()-tg;
      if(X.G.over&&X.G.over.win)o.w++;else if(X.G.over){const w=X.G.over.why.replace(/[A-Z][a-z]+(\'s)?/g,'X').slice(0,60);o.why[w]=(o.why[w]||0)+1;why[w]=(why[w]||0)+1}else{stalls++;console.log('UNFINISHED',key,g,X.G.step)}}
    catch(e){errs++;if(errs<20)console.log('EXC',key,g,e.stack.split('\n').slice(0,4).join(' | '))}
    if(Date.now()-tg>8000)console.log('SLOW',key,g,Date.now()-tg,'ms turns',X.G.turn,X.G.step)}
  {const r=R[key];console.log(`job ${String(r.n).padStart(2)} ${r.np}p  win ${r.w}/${r.g}  turns ${(r.turns/Math.max(1,r.g)).toFixed(0)}  ${(r.ms/Math.max(1,r.g)/1000).toFixed(1)}s  ${Object.entries(r.why).map(([k,v])=>v+'x '+k).join('; ')}`)}}
const rows=Object.values(R);const W=rows.reduce((a,r)=>a+r.w,0),Gn=rows.reduce((a,r)=>a+r.g,0);
if(0)for(const r of rows)console.log(`job ${String(r.n).padStart(2)} ${r.np}p  win ${r.w}/${r.g}  turns ${(r.turns/Math.max(1,r.g)).toFixed(0)}  ${(r.ms/Math.max(1,r.g)/1000).toFixed(1)}s  ${Object.entries(r.why).map(([k,v])=>v+'x '+k).join('; ')}`);
console.log(`TOTAL games ${games} wins ${W} (${(100*W/Math.max(1,Gn)).toFixed(0)}%) errors ${errs} stalls ${stalls} invariant-fails ${inv} time ${((Date.now()-t0)/1000).toFixed(0)}s level ${lv}`);
console.log('loss reasons',JSON.stringify(why));
if(outF)fs.writeFileSync(outF,JSON.stringify({from,to,seeds,lv,rows,errs,stalls,inv,games}));
