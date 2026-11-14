// first-game length check: a newcomer (seat 0) taps a random tile that does not sink them now, vs N computers.
// node tools/firstgame.js [players=3] [games=300] [rivalLevel=easy] [startLev=default]
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const LEVD=X.E.LEV;
const np=+process.argv[2]||3,n=+process.argv[3]||300,lv=process.argv[4]||'easy',sl=process.argv[5]?+process.argv[5]:null;
let turns=0,mine=0,wins=0,dieByMon=0,early=0,rivalEarly=0,lt4=0;
for(let g=0;g<n;g++){X.setSeed(g*7919+3);X.ai.setAiSeed(g);const o={players:np,seats:['human'].concat(Array(np-1).fill('ai')),lv:['normal'].concat(Array(np-1).fill(lv)),first:g%np};if(sl)o.startLev=sl;X.newGame(o);
  let k=0,pl=0,r=Math.random;const rng=(()=>{let a=g*99+1;return()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff}})();
  while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();if(s<0)break;let m;
    if(s===0&&!X.G.q&&X.G.phase==='play'&&X.G.step==='act'){const mv=X.genMoves(X.knowledge(0),0).filter(m=>m.a==='place');
      const ok=mv.filter(m=>{const K=X.knowledge(0);const S=K.ships[0];const sim=X.E.simPlace(K,S.x,S.y,K.hands[0][m.t],m.r);const o=sim.res[0];return o&&o.st==='ok'&&!sim.coll.includes(0)});
      const reach=(K,sq)=>K.mons.some(M=>M.k==='L'&&LEVD[M.id].arr.some(a=>{if(a==='R')return false;const d=X.E.DIR[('NESW'.indexOf(a)+M.r)%4];return sq&&M.x+d[0]===sq[0]&&M.y+d[1]===sq[1]}));
      const safe=ok.filter(m=>{const K=X.knowledge(0);const S=K.ships[0];const o=X.E.simPlace(K,S.x,S.y,K.hands[0][m.t],m.r).res[0];return !reach(K,[o.x,o.y])&&!reach(K,o.on)});const pool=process.env.CHECK&&safe.length?safe:ok;
      m=(pool.length?pool:mv)[Math.floor(rng()*(pool.length?pool:mv).length)]||X.ai.aiMove(0,'easy');pl++}
    else m=X.ai.aiMove(s,s===0?'normal':lv);
    if(!m)break;X.performMove(m,s)}
  (globalThis.OUT=globalThis.OUT||{})[(X.G.ships[0].out||"alive").replace(/[0-9]+/g,"#").slice(0,40)]=(OUT[(X.G.ships[0].out||"alive").replace(/[0-9]+/g,"#").slice(0,40)]||0)+1;turns+=X.G.turn;mine+=pl;if(X.G.over&&X.G.over.win.includes(0))wins++;if(pl<4)lt4++;}
console.log(`${np}p rivals=${lv} startLev=${sl||'rule'}: avg turns ${(turns/n).toFixed(1)}, my placements ${(mine/n).toFixed(1)}, <4 placements ${(100*lt4/n).toFixed(0)}%, I win ${(100*wins/n).toFixed(0)}%`);
console.log(OUT)
