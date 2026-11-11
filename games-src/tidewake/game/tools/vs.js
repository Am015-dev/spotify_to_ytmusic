// level vs level: node tools/vs.js hard normal 3 100
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const [a,b]=[process.argv[2]||'hard',process.argv[3]||'normal'];const np=+process.argv[4]||2,n=+process.argv[5]||100;
let wa=0,wb=0;for(let g=0;g<n;g++){const lv=[];for(let i=0;i<np;i++)lv.push((i+g)%2?b:a);X.setSeed(g*313+7);X.ai.setAiSeed(g);X.newGame({players:np,lv,first:g%np});let k=0;
 while(X.G.phase!=='over'&&k++<5000){const s=X.ai.aiStep();X.performMove(s.m,s.seat)}
 for(const i of X.G.over.win){if(lv[i]===a)wa+=1/X.G.over.win.length;else wb+=1/X.G.over.win.length}}
console.log(`${a} ${wa.toFixed(1)} vs ${b} ${wb.toFixed(1)} (${np}p, ${n} games)`);
