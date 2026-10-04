// AI level check: node levels.js N A B [np]  -> how often level A beats level B (2 players, seats swapped every game, base game)
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,scoreOf,UI};';
const N=+process.argv[2]||20,A=process.argv[3]||'hard',B=process.argv[4]||'easy',np=+process.argv[5]||2;
let wa=0,wb=0,tie=0,sa=0,sb=0,t0=Date.now(),ms=0,moves=0;
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed(500+g);const lv=[];for(let i=0;i<np;i++)lv.push((i+g)%2===0?A:B);
  X.newGame({np,mode:'ai',seats:lv.map(()=>'ai'),lv,ex:{}});let n=0;
  while(!X.G.over&&n++<5000){const s=X.sideToAct();const t=Date.now();const m=X.aiMove(s);ms+=Date.now()-t;moves++;if(!m)break;if(!X.performMove(m,s).success)break}
  if(!X.G.over){console.log('unfinished',g);continue}
  const sc=X.G.pl.map(p=>X.scoreOf(p).total);const ia=lv.indexOf(A),ib=lv.indexOf(B);const bestA=Math.max(...sc.filter((_,i)=>lv[i]===A)),bestB=Math.max(...sc.filter((_,i)=>lv[i]===B));
  sa+=bestA;sb+=bestB;if(bestA>bestB)wa++;else if(bestB>bestA)wb++;else tie++}
console.log(`${A} vs ${B} (${np}p, ${N} games): ${A} ${wa} – ${B} ${wb} – ties ${tie} · ${A} wins ${(100*wa/N).toFixed(0)}% · avg ${(sa/N).toFixed(0)} vs ${(sb/N).toFixed(0)} · ${(ms/moves).toFixed(1)} ms/move · ${Math.round((Date.now()-t0)/1000)}s`);
