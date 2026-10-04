// node tools/exp.js '{"hard":{"look":0}}' hard normal 2 200   (override fields of levels then play a vs b)
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const ov=JSON.parse(process.argv[2]||'{}');for(const l in ov)Object.assign(X.ai.AILV[l],ov[l]);
const [a,b]=[process.argv[3]||'hard',process.argv[4]||'normal'];const np=+process.argv[5]||2,n=+process.argv[6]||100;
let wa=0,wb=0;const why={};for(let g=0;g<n;g++){const lv=[];for(let i=0;i<np;i++)lv.push((i+g)%2?b:a);X.setSeed(g*313+7);X.ai.setAiSeed(g);X.newGame({players:np,lv,first:g%np});let k=0;
 while(X.G.phase!=='over'&&k++<5000){const s=X.ai.aiStep();if(!s){console.log("NULL",g,JSON.stringify(X.G.ag),X.render_game_to_text(),X.G.log.slice(0,6).map(l=>l.t),X.G.phase,X.G.step,X.sideToAct(),X.G.q&&X.G.q.kind,JSON.stringify(X.validMoves(X.sideToAct())).slice(0,200));process.exit(1)}X.performMove(s.m,s.seat)}
 for(const i of X.G.over.win){if(lv[i]===a)wa+=1/X.G.over.win.length;else wb+=1/X.G.over.win.length}
 X.G.ships.forEach((s,i)=>{if(!s.alive){const w=lv[i]+':'+s.out.replace(/[A-Z][a-z]+( [A-Z][a-z]+)?$/,'X');why[w]=(why[w]||0)+1}})}
console.log(`${a} ${wa.toFixed(1)} vs ${b} ${wb.toFixed(1)} (${np}p, ${n}g)`,JSON.stringify(why));
