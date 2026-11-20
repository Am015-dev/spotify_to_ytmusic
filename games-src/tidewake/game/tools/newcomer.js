// newcomer win rate vs Easy computers (R92 target: about half, in 2- and 3-player games).
// The newcomer (seat 0): a random start mark, then each turn a random tile+turn that does not sink them at once (a careful first-timer), questions answered
// like the Normal computer. Rivals: the given level (default easy). Rulebook start (6 leviathans), no add-ons, random first player.
// node tools/newcomer.js [games=400] [level=easy] ['{"easy":{"rnd":.8}}' (AILV overrides)]
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const n=+process.argv[2]||400,lv=process.argv[3]||'easy',ov=JSON.parse(process.argv[4]||'{}');for(const l in ov)Object.assign(X.ai.AILV[l],ov[l]);
for(const np of [2,3]){let wins=0,turns=0;
  for(let g=0;g<n;g++){X.setSeed(g*7919+11*np+3);X.ai.setAiSeed(g*31+np);X.newGame({players:np,seats:['human'].concat(Array(np-1).fill('ai')),lv:['normal'].concat(Array(np-1).fill(lv)),first:g%np});
    let a=g*99+np;const rng=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff};let k=0;
    while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();if(s<0)break;let m=null;
      if(s===0&&!X.G.q){const K=X.knowledge(0),mv=X.genMoves(K,0);
        if(X.G.phase==='setup')m=mv[Math.floor(rng()*mv.length)];
        else if(X.G.step==='act'){const pl=mv.filter(m=>m.a==='place');const S=K.ships[0];
          const ok=pl.filter(m=>{const sim=X.E.simPlace(K,S.x,S.y,K.hands[0][m.t],m.r);const o=sim.res[0];return o&&o.st==='ok'&&!sim.coll.includes(0)});
          const pool=ok.length?ok:pl.length?pl:mv;m=pool[Math.floor(rng()*pool.length)]}}
      if(!m)m=X.ai.aiMove(s,s===0?'normal':lv);if(!m)break;X.performMove(m,s)}
    turns+=X.G.turn;if(X.G.over&&X.G.over.win.includes(0))wins++}
  console.log(`${np}p vs ${np-1}x ${lv}: newcomer wins ${(100*wins/n).toFixed(0)}% (fair share ${Math.round(100/np)}%), avg turns ${(turns/n).toFixed(1)}`)}
