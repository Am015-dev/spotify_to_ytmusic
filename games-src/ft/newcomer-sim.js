// Newcomer win rate vs the default rival: node newcomer-sim.js [games=30] [hintRate=.5] [rivalLevel=easy]
// Seat 0 = a newcomer: on each decision it takes the hint (the hard planner's move) with probability hintRate, otherwise any legal option at random.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,scoreOf,UI,planTurn,setPlan(p){AIPLAN=p}};';
const N=+process.argv[2]||30,HR=process.argv[3]!=null?+process.argv[3]:.5,RL=process.argv[4]||'easy';
let w=0,margins=[],rounds=0;
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);if(process.env.LV)vm.runInContext('Object.assign(LVL.easy,'+process.env.LV+')',ctx);const X=ctx.__X;
  X.setSeed((+process.env.SEED||500)+g);X.UI.sim=0;X.newGame({np:2,seats:['ai','ai'],lv:['hard',RL],mode:'ai'});
  let n=0,mode=null,lastKey='';
  while(!X.G.over&&n++<6000){const s=X.sideToAct();if(s<0)break;let m;
    if(s===0){const G=X.G;const vms=X.validMoves(0);
      const walking=G.phase==='turn'&&G.step==='move'&&G.move;
      if(!walking||mode==null)mode=Math.random()<HR?'hint':'rand';
      if(mode==='hint')m=X.aiMove(0);else m=vms[Math.floor(Math.random()*vms.length)];
      if(!(G.phase==='turn'&&G.step==='move'))mode=null;
      if(m&&m.act==='start'&&mode==='rand')X.setPlan(null);
    }else m=X.aiMove(s);
    if(!m)break;const r=X.performMove(m,s);if(!r.success){if(s===0){const v=X.validMoves(0);X.performMove(v[0],0)}else break}
    if(!(X.G.phase==='turn'&&X.G.step==='move'&&X.G.move))mode=null;}
  if(X.G.over){const sc=[0,1].map(i=>X.G.over.scores.find(x=>x.p===i).s.total);if(X.G.over.win.includes(0))w++;margins.push(sc[0]-sc[1]);rounds+=X.G.round}}
const d=margins.length;console.log(`hint=${HR} rival=${RL} N=${N} done=${d} newcomerWins=${w} (${(100*w/d).toFixed(0)}%) avgMargin=${(margins.reduce((a,b)=>a+b,0)/d).toFixed(1)} rounds=${(rounds/d).toFixed(1)}`);
