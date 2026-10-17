const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const lv=process.argv[2]||'normal',v=process.argv[3]||'solo',n=+process.argv[4]||60;
const why={};let win=0,turns=0;
for(let g=0;g<n;g++){X.setSeed(g*101+5);X.ai.setAiSeed(g);X.newGame({variant:v,level:lv,exp:{},soloLev:+process.argv[5]||0});let k=0;while(X.G.phase!=='over'&&k++<5000){const s=X.ai.aiStep();X.performMove(s.m,s.seat)}
 turns+=X.G.turn;if(X.G.over.win.length)win++;else{const w=X.G.ships[0].out.replace(/[A-Z][a-z]+( [A-Z][a-z]+)?$/,'X');why[w]=(why[w]||0)+1}}
console.log(lv,v,'win',win+'/'+n,'avg turns',(turns/n).toFixed(1),JSON.stringify(why));
