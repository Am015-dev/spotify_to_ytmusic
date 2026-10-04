// headless games: node gauntlet.js N np [ex,ex] ; env SEED
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,scoreOf,UI};';
const N=+process.argv[2]||10,np=+process.argv[3]||2,exl=(process.argv[4]||'').split(',').filter(Boolean);const ex={};for(const e of exl)ex[e]=true;
let errs=0,viol={},wins={},rounds=0,turns=0,scores=[],t0=Date.now(),stalls=0,djs=0,kills=0;
for(let g=0;g<N;g++){const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed((+process.env.SEED||100)+g);X.UI.sim=0;
  try{X.newGame({np,mode:'ai',ex});let n=0;while(!X.G.over&&n++<4000){const s=X.sideToAct();if(s<0){stalls++;break}const m=X.aiMove(s);if(!m){stalls++;console.log('no move',X.G.phase,X.G.step);break}const r=X.performMove(m,s);if(!r.success){errs++;if(errs<5)console.log('REJ',r.error,X.G.phase,X.G.step);break}
      if(n%25===0){for(const v of X.checkInvariants())viol[v]=(viol[v]||0)+1}}
    if(!X.G.over){stalls++;console.log('unfinished',X.G.phase,X.G.step,X.G.round)}else{for(const w of X.G.over.win)wins[w]=(wins[w]||0)+1;rounds+=X.G.round;turns+=X.G.turn;scores.push(X.G.over.scores.map(s=>s.s.total));djs+=X.G.stats.djinns;kills+=X.G.stats.kills}}
  catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}}
const done=scores.length;console.log(`np=${np} ex=${exl.join('+')||'base'} N=${N} done=${done} errs=${errs} stalls=${stalls} wins=${JSON.stringify(wins)} rounds=${(rounds/done).toFixed(1)} turns=${(turns/done).toFixed(1)} avgTop=${(scores.reduce((a,s)=>a+Math.max(...s),0)/done).toFixed(0)} djinns/game=${(djs/done).toFixed(1)} kills/game=${(kills/done).toFixed(1)} ${Date.now()-t0}ms`);if(Object.keys(viol).length)console.log('violations',viol);
