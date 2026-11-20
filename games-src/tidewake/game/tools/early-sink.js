// F3: how often a computer sinks in turns 1-5, and game length. Same newcomer as newcomer.js (seat 0), rivals = given level.
// node tools/early-sink.js [games=400] [level=easy] [AILV overrides json]
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const n=+process.argv[2]||400,lv=process.argv[3]||'easy',ov=JSON.parse(process.argv[4]||'{}');for(const l in ov)Object.assign(X.ai.AILV[l],ov[l]);
for(const np of [2,3]){const why={};let ccN=0,selfE=0,wins=0,turns=0,early=0,anyElim=0,early2=0;
  for(let g=0;g<n;g++){X.setSeed(g*7919+11*np+3);X.ai.setAiSeed(g*31+np);X.newGame({players:np,seats:['human'].concat(Array(np-1).fill('ai')),lv:['normal'].concat(Array(np-1).fill(lv)),first:g%np});
    let a=g*99+np;const rng=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff};let k=0,cc=false,e5=false,e5self=false,alive=X.G.ships.map(s=>s.alive);
    while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();if(s<0)break;let m=null;
      if(s===0&&!X.G.q){const K=X.knowledge(0),mv=X.genMoves(K,0);
        if(X.G.phase==='setup')m=mv[Math.floor(rng()*mv.length)];
        else if(X.G.step==='act'){const pl=mv.filter(m=>m.a==='place');const S=K.ships[0];
          const ok=pl.filter(m=>{const sim=X.E.simPlace(K,S.x,S.y,K.hands[0][m.t],m.r);const o=sim.res[0];return o&&o.st==='ok'&&!sim.coll.includes(0)});
          const pool=ok.length?ok:pl.length?pl:mv;m=pool[Math.floor(rng()*pool.length)]}}
      if(!m)m=X.ai.aiMove(s,s===0?'normal':lv);if(!m)break;X.performMove(m,s);
      X.G.ships.forEach((sh,i)=>{if(alive[i]&&!sh.alive){alive[i]=false;if(i>0){anyElim++;if(X.G.turn<=5){e5=true;const o=X.G.ships[i].out||'';const c=o.includes('crushed')?'lev':o.includes('blocked')?'blk':o.includes('collided')?'col':'move';const act=s===i?'self':s===0?'newcomer':'otherAI';const key=c+'/'+act;why[key]=(why[key]||0)+1;if(s===i)e5self=true;if(s!==0)cc=true}}}})}
    turns+=X.G.turn;if(e5)early++;if(e5self)selfE++;if(cc)ccN++;if(X.G.over&&X.G.over.win.includes(0))wins++}
  console.log(`${np}p vs ${np-1}x ${lv}: newcomer wins ${(100*wins/n).toFixed(0)}%, avg turns ${(turns/n).toFixed(1)}, games with a computer sunk in turns 1-5: ${(100*early/n).toFixed(1)}% (computers' own turn caused: ${(100*ccN/n).toFixed(1)}%; own move: ${(100*selfE/n).toFixed(1)}%; causes ${JSON.stringify(why)})`)}
