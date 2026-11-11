// headless computer-vs-computer games: node gauntlet.js N np [river,ic,tb] [levels e.g. normal,hard]; env SEED
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','geo.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,UI,tilesLeft};';
const N=+process.argv[2]||10,np=+process.argv[3]||2,exl=(process.argv[4]||'').split(',').filter(x=>x&&x!=='base');const ex={};for(const e of exl)ex[e]=true;
const lvs=(process.argv[5]||'').split(',').filter(Boolean);
let errs=0,viol={},wins={},turns=0,scores=[],t0=Date.now(),stalls=0,disc=0,bonus=0,figsLeft=0,margins=0;const parts={};
for(let g=0;g<N;g++){const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed((+process.env.SEED||100)+g);X.UI.sim=1;
  const lv=Array.from({length:np},(_,i)=>lvs.length?lvs[(i+g)%lvs.length]:'normal');
  try{X.newGame({np,mode:'ai',ex,lv});let n=0;while(!X.G.over&&n++<1000){const s=X.sideToAct();if(s<0){stalls++;break}const m=X.aiMove(s);if(!m){stalls++;console.log('no move',X.G.step);break}const r=X.performMove(m,s);if(!r.success){errs++;if(errs<5)console.log('REJ',r.error,X.G.step);break}
      if(n%20===0){for(const v of X.checkInvariants())viol[v]=(viol[v]||0)+1}}
    for(const v of X.checkInvariants())viol[v]=(viol[v]||0)+1;
    if(!X.G.over){stalls++;console.log('unfinished',X.G.step)}else{const G=X.G;const top=Math.max(...G.pl.map(p=>p.score));for(const w of G.over.win){const key=lvs.length?G.pl[w].lv+'@'+w:w;wins[key]=(wins[key]||0)+1}turns+=G.turn;scores.push(G.pl.map(p=>p.score));disc+=G.stats.discards;bonus+=G.stats.bonus;
      const srt=G.pl.map(p=>p.score).sort((a,b)=>b-a);margins+=srt[0]-srt[1];for(const p of G.pl){for(const k in p.sc)parts[k]=(parts[k]||0)+p.sc[k];for(const k in p.end)parts['end-'+k]=(parts['end-'+k]||0)+p.end[k]}}}
  catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,4).join(' | '))}}
const done=scores.length;const avg=a=>(a/done).toFixed(1);
console.log(`np=${np} ex=${exl.join('+')||'base'} lv=${lvs.join('/')||'normal'} N=${N} done=${done} errs=${errs} stalls=${stalls} wins=${JSON.stringify(wins)} turns=${avg(turns)} avgScore=${(scores.flat().reduce((a,b)=>a+b,0)/(done*np)).toFixed(0)} avgTop=${avg(scores.reduce((a,s)=>a+Math.max(...s),0))} margin=${avg(margins)} discards=${avg(disc)} masonTurns=${avg(bonus)} ${Date.now()-t0}ms`);
console.log('points per player by kind:',Object.entries(parts).map(([k,v])=>k+' '+(v/(done*np)).toFixed(1)).join(', '));
if(Object.keys(viol).length)console.log('violations',viol);
