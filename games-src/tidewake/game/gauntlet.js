// Computer-only games at 2-8 players, each expansion on/off, plus solo/easysolo/teams.
// node gauntlet.js [games per config] [level] [players list e.g. 2,3,4] [out.json]
const {load}=require('./tools/load');const fs=require('fs');
const A=process.argv.slice(2);const games=+A[0]||20,lv=A[1]||'normal',pls=(A[2]||'2,3,4,5,6,7,8').split(',').map(Number),outF=A[3]||null;
const X=load(['data.js','engine.js','ai.js']);
const EXPS={base:{},rift:{rift:1},wave:{wave:1},maelstrom:{maelstrom:1},cannon:{cannon:1},all:{rift:1,wave:1,maelstrom:1,cannon:1}};
const cfgs=[];for(const np of pls)for(const e in EXPS)cfgs.push({np,e,exp:EXPS[e]});
if(pls.includes(2)||pls.length>6){cfgs.push({np:1,e:'solo',variant:'solo',exp:{}},{np:1,e:'solo+all',variant:'solo',exp:EXPS.all},{np:1,e:'easysolo',variant:'easysolo',exp:{}},{np:1,e:'easysolo+all',variant:'easysolo',exp:EXPS.all},{np:4,e:'teams',variant:'teams',exp:{}},{np:6,e:'teams+all',variant:'teams',exp:EXPS.all})}
let errs=0,stalls=0,inv=0,tot=0;const rows=[];const t0=Date.now();const shared={};
for(const c of cfgs){const r={np:c.np,e:c.e,g:0,wins:new Array(c.np).fill(0),turns:0,draws:0,solo:0,ms:0,maxT:0};
  for(let g=0;g<games;g++){const seed=7919*c.np+104729*g+31*c.e.length+(c.variant?17:0);X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);const t1=Date.now();
    try{X.newGame({players:c.np,variant:c.variant,exp:c.exp,level:lv,first:g%c.np});let k=0,sig='',same=0;
      while(X.G.phase!=='over'&&k++<6000){const st=X.ai.aiStep();if(!st){stalls++;console.log('STALL',c.np,c.e,g,X.G.phase,X.G.step,X.G.q&&X.G.q.kind);break}
        const m=X.performMove(st.m,st.seat);if(!m.success){errs++;if(errs<15)console.log('REJ',c.np,c.e,g,m.error,JSON.stringify(st.m));break}
        const iv=X.checkInvariants();if(iv.length){inv++;if(inv<10)console.log('INV',c.np,c.e,g,iv[0]);break}
        const s2=X.G.turn+':'+X.G.logN;if(s2===sig){if(++same>120){stalls++;console.log('LOOP',c.np,c.e,g);break}}else{sig=s2;same=0}}
      if(X.G.phase!=='over'){stalls++;console.log('UNFINISHED',c.np,c.e,g)}
      else{const w=X.G.over.win;r.g++;r.turns+=X.G.turn;r.maxT=Math.max(r.maxT,X.G.turn);if(c.variant==='solo'||c.variant==='easysolo'){if(w.length)r.solo++}
        else{if(w.length>1&&w.length>=c.np-0){r.draws++}for(const i of w)r.wins[i]+=1/w.length}}}
    catch(e){errs++;if(errs<15)console.log('EXC',c.np,c.e,g,e.stack.split('\n').slice(0,4).join(' | '))}
    r.ms+=Date.now()-t1}
  rows.push(r);tot+=r.g;
  const sp=c.variant==='solo'||c.variant==='easysolo'?`survived ${r.solo}/${r.g}`:`seat wins ${r.wins.map(w=>(100*w/Math.max(1,r.g)).toFixed(0)+'%').join('/')}`;
  console.log(`${String(c.np).padStart(2)}p ${c.e.padEnd(13)} games ${String(r.g).padStart(3)}  avg turns ${(r.turns/Math.max(1,r.g)).toFixed(1).padStart(5)} max ${String(r.maxT).padStart(3)}  ${sp}  ${(r.ms/Math.max(1,games)).toFixed(0)}ms/g`)}
console.log(`TOTAL games ${tot} errors ${errs} stalls ${stalls} invariant-fails ${inv} level ${lv} time ${((Date.now()-t0)/1000).toFixed(0)}s`);
if(outF)fs.writeFileSync(outF,JSON.stringify({games,lv,rows,errs,stalls,inv}));
