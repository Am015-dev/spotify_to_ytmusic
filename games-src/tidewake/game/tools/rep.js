const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const c={np:4,e:{rift:1,cannon:1}},g=49;X.setSeed(g*911+c.np*7);X.ai.setAiSeed(g);X.newGame({players:c.np,exp:c.e,level:['easy','normal','hard'][g%3]});let k=0,r=g*17+1;const rr=()=>{r=(Math.imul(r,1103515245)+12345)>>>0;return r/4294967296};
let hist=[];
while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();let m;const mode=rr();if(mode<.55){const st=X.ai.aiStep(true);m=st&&st.m}else{const mv=X.validMoves(s);m=mv[Math.floor(rr()*mv.length)]}
 hist.push(JSON.stringify(m)+' by '+s+' q='+(X.G.q&&X.G.q.kind));X.performMove(m,s);const iv=X.checkInvariants();if(iv.length){console.log(iv,hist.slice(-3).join('\n'));console.log(X.G.log.slice(0,28).reverse().map(l=>l.t).join('\n'));console.log(X.render_game_to_text());console.log(JSON.stringify(X.G.ships.map(s=>[s.x,s.y,s.e,s.on,s.alive])),JSON.stringify(X.G.gates));break}}
