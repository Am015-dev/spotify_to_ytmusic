// novice-bench.js: a simple new-player bot (random legal tile spot half the time, otherwise the normal computer's pick;
// follower only about 60% of the time) against a computer level. node novice-bench.js N level [pGood]
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','geo.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,aiPlan,UI,legalPlacements};';
const N=+process.argv[2]||40,lvl=process.argv[3]||'easy',pGood=+(process.argv[4]||.5);let w=0,t=0,sc=[0,0];
let seed=1;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;X.setSeed(500+g);X.UI.sim=1;
  X.newGame({np:2,mode:'ai',ex:{},lv:['normal',lvl]});let n=0;
  while(!X.G.over&&n++<1000){const s=X.sideToAct();if(s<0)break;let m;
    if(s===1)m=X.aiMove(1);else{const mv=X.validMoves(0);
      if(X.G.step==='place'){if(rnd()<pGood)m=X.aiMove(0);else{const ps=mv.filter(a=>a.act==='place');m=ps[Math.floor(rnd()*ps.length)]}}
      else{const fs_=mv.filter(a=>a.act==='fig'&&a.k==='f');const good=X.aiMove(0);m=rnd()<pGood+.1&&good?good:(rnd()<.6&&fs_.length?fs_[Math.floor(rnd()*fs_.length)]:{act:'skip'})}}
    const r=X.performMove(m,s);if(!r.success){X.performMove(X.aiMove(s),s)}}
  if(X.G.over){const p=X.G.pl;sc[0]+=p[0].score;sc[1]+=p[1].score;t++;if(p[0].score>p[1].score)w++;else if(p[0].score===p[1].score)w+=.5}}
console.log(`novice(pGood=${pGood}) vs ${lvl}: wins ${w}/${t} = ${(100*w/t).toFixed(0)}%  avg ${(sc[0]/t).toFixed(0)}-${(sc[1]/t).toFixed(0)}`);
