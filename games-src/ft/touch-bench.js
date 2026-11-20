// Touch-style newcomer vs the rival: node touch-bench.js [games=40] [rival=easy] [hintStart=.7]
// Seat 0 plays like a person on a phone with the new hint (reason + starting tile only):
//  - start tile: the hinted tile with probability hintStart, else any tile from the better half;
//  - path: plans it by eye, one of the 3 best walks from that tile (never the computer's exact path);
//  - market, tribe and tile choices: the sensible one 70% of the time, else any; bids: a cheap affordable spot.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,scoreOf,UI,planTurn,legalStarts,outcomes,evalOutcome,bidPrice,P,setPlan(p){AIPLAN=p},getPlan(){return AIPLAN}};';
const N=+process.argv[2]||40,RL=process.argv[3]||'easy',HS=process.argv[4]!=null?+process.argv[4]:.7;
let w=0,margins=[],rounds=0,decisions=[];
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);if(process.env.LV)vm.runInContext('Object.assign(LVL.'+RL+','+process.env.LV+')',ctx);const X=ctx.__X;
  X.setSeed((+process.env.SEED||900)+g);X.UI.sim=0;X.newGame({np:2,seats:['ai','ai'],lv:['hard',RL],mode:'ai'});
  let n=0,plan=null;
  while(!X.G.over&&n++<6000){const s=X.sideToAct();if(s<0)break;let m;const G=X.G;
    if(s===0){const vms=X.validMoves(0);const R=()=>vms[Math.floor(Math.random()*vms.length)];
      if(G.q)m=Math.random()<.7?X.aiMove(0):R();
      else if(G.phase==='bid'){const p=X.P(0);const ok=vms.filter(v=>X.bidPrice(p,v.spot,v.fk)<=Math.max(1,p.coins*.3));m=ok.length?ok[Math.floor(Math.random()*ok.length)]:vms[vms.length-1]}
      else if(G.step==='move'&&!G.move){const p=X.P(0);const hp=X.planTurn(Object.assign({},p,{lv:'hard'}));let st=hp&&hp.s;
        const all=[];for(const t of X.legalStarts()){let b=-1e9;for(const o of X.outcomes(t,20000))b=Math.max(b,X.evalOutcome(Object.assign(p,{__nz:0}),o));all.push([b,t])}p.__nz=null;
        if(st==null||Math.random()>HS){all.sort((a,b)=>b[0]-a[0]);const h=all.slice(0,Math.max(1,Math.ceil(all.length/2)));st=h[Math.floor(Math.random()*h.length)][1]}
        const os=X.outcomes(st,20000).map(o=>[X.evalOutcome(Object.assign(p,{__nz:0}),o),o]).sort((a,b)=>b[0]-a[0]);p.__nz=null;
        plan=os.length?os[Math.floor(Math.random()*Math.min(3,os.length))][1]:null;X.setPlan(plan);m={act:'start',tile:st}}
      else if(G.step==='move'&&G.move){X.setPlan(plan);m=X.aiMove(0)}
      else m=Math.random()<.7?X.aiMove(0):R();
    }else m=X.aiMove(s);
    if(!m)break;const r=X.performMove(m,s);if(!r.success){const v=X.validMoves(s);if(!v.length)break;X.performMove(v[0],s)}}
  if(X.G.over){const sc=[0,1].map(i=>X.G.over.scores.find(x=>x.p===i).s.total);if(X.G.over.win.includes(0))w++;margins.push(sc[0]-sc[1]);rounds+=X.G.round}}
const d=margins.length;const ab=margins.map(Math.abs).sort((a,b)=>a-b);
console.log(`touch-newcomer hintStart=${HS} rival=${RL} N=${N} done=${d} wins=${w} (${(100*w/d).toFixed(0)}%) avgMargin=${(margins.reduce((a,b)=>a+b,0)/d).toFixed(1)} medianAbsMargin=${ab[ab.length>>1]} rounds=${(rounds/d).toFixed(1)}`);
