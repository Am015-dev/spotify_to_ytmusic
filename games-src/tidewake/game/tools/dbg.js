const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const [np,e,g,variant]=[+process.argv[2],process.argv[3],+process.argv[4],process.argv[5]||null];
const EXPS={base:{},rift:{rift:1},all:{rift:1,wave:1,maelstrom:1,cannon:1}};const seed=7919*np+104729*g+31*e.length+(variant?17:0);
X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);X.newGame({players:np,variant,exp:EXPS[e.split('+').pop()]||{},level:'normal',first:g%np});let k=0;
while(X.G.phase!=='over'&&k++<6000){const st=X.ai.aiStep();if(!st)break;X.performMove(st.m,st.seat);if(X.checkInvariants().length){console.log(JSON.stringify(st.m),X.G.log.slice(0,14).reverse().map(l=>l.t).join('\n'));break}}
console.log(X.checkInvariants(),X.render_game_to_text(),JSON.stringify(X.G.ag),JSON.stringify(X.G.q),'cur',X.G.cur,X.G.step);console.log(X.G.log.slice(0,8).map(l=>l.t).join('\n'));
console.log(JSON.stringify(X.G.hands),JSON.stringify(X.G.ships.map(s=>[s.x,s.y,s.e,s.on])),JSON.stringify(X.validMoves(X.G.cur)));
