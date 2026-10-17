const {load}=require('./load');const X=load();
let errs=0,games=0,turns=0;const seen={};
const cfgs=[];for(const np of [2,3,4,5,8])for(const e of [{},{rift:1,wave:1,maelstrom:1,cannon:1}])cfgs.push({np,e});
cfgs.push({np:1,v:'solo',e:{rift:1,cannon:1}},{np:1,v:'easysolo',e:{}},{np:4,v:'teams',e:{cannon:1,rift:1}});
for(const c of cfgs)for(let g=0;g<20;g++){X.setSeed(g*77+c.np);X.newGame({players:c.np,variant:c.v,exp:c.e});let k=0;
  try{while(X.G.phase!=='over'&&k++<3000){const s=X.sideToAct();const mv=X.validMoves(s);if(!mv.length){console.log('NOMOVES',JSON.stringify(c),X.G.phase,X.G.step,s,X.G.q&&X.G.q.kind);errs++;break}
    const m=mv[Math.floor(Math.random()*mv.length)];const r=X.performMove(m,s);if(!r.success){console.log('REJ',r.error,JSON.stringify(m));errs++;break}
    const iv=X.checkInvariants();if(iv.length){console.log('INV',JSON.stringify(c),g,iv[0],X.render_game_to_text());errs++;break}}}
  catch(e){errs++;console.log('EXC',JSON.stringify(c),g,e.stack.split('\n').slice(0,4).join('|'))}
  if(X.G.phase!=='over'&&k>=3000){console.log('STALL',JSON.stringify(c));errs++}
  games++;turns+=X.G.turn;for(const k2 in X.G.stats)seen[k2]=(seen[k2]||0)+1}
console.log('games',games,'errs',errs,'avgturns',(turns/games).toFixed(1));console.log(JSON.stringify(seen));
