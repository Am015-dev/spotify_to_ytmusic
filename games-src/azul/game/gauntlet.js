// headless computer-vs-computer games: node gauntlet.js N np [gray,prism] [lv,lv,..] ; env SEED
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,UI};';
const N=+process.argv[2]||10,np=+process.argv[3]||2,exl=(process.argv[4]||'').split(',').filter(x=>x&&x!=='base');const ex={};for(const e of exl)ex[e]=true;
const lv=(process.argv[5]||'').split(',').filter(Boolean);
let errs=0,viol={},wins={},rounds=[],turns=0,scores=[],t0=Date.now(),stalls=0,ties=0;const st={};const bySeatScore=Array(np).fill(0);
for(let g=0;g<N;g++){const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed((+process.env.SEED||100)+g);X.UI.sim=0;if(process.env.AIWS)vm.runInContext('AIWS='+process.env.AIWS,ctx);
  try{X.newGame({np,mode:'ai',ex,lv:Array.from({length:np},(_,i)=>lv[i%Math.max(1,lv.length)]||'normal')});let n=0;
    while(!X.G.over&&n++<3000){const s=X.sideToAct();if(s<0){stalls++;console.log('stuck',X.G.phase);break}const m=X.aiMove(s);if(!m){stalls++;console.log('no move',X.G.phase);break}const r=X.performMove(m,s);if(!r.success){errs++;if(errs<5)console.log('REJ',r.error,X.G.phase);break}
      for(const v of X.checkInvariants())viol[v]=(viol[v]||0)+1}
    if(!X.G.over){stalls++;console.log('unfinished',X.G.phase,X.G.round)}else{for(const w of X.G.over.win)wins[w]=(wins[w]||0)+1;if(X.G.over.win.length>1)ties++;rounds.push(X.G.round);turns+=X.G.turn;scores.push(X.G.pl.map(p=>p.score));X.G.pl.forEach((p,i)=>bySeatScore[i]+=p.score);for(const k in X.G.stats)st[k]=(st[k]||0)+X.G.stats[k]}}
  catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}}
const done=scores.length;const all=scores.flat();
console.log(`np=${np} ex=${exl.join('+')||'base'} lv=${lv.join(',')||'normal'} N=${N} done=${done} errs=${errs} stalls=${stalls} wins=${JSON.stringify(wins)} shared=${ties} rounds=${(rounds.reduce((a,b)=>a+b,0)/done).toFixed(1)} [${Math.min(...rounds)}-${Math.max(...rounds)}] turns=${(turns/done).toFixed(1)} winScore=${(scores.reduce((a,s)=>a+Math.max(...s),0)/done).toFixed(0)} avgScore=${(all.reduce((a,b)=>a+b,0)/all.length).toFixed(0)} min=${Math.min(...all)} max=${Math.max(...all)} seatAvg=${bySeatScore.map(x=>(x/done).toFixed(0)).join('/')} ${Date.now()-t0}ms`);
console.log('  per game:',Object.entries(st).map(([k,v])=>k+'='+(v/done).toFixed(1)).join(' '));
if(Object.keys(viol).length)console.log('violations',viol);
