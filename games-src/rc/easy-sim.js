// Easy island win rate, headless: the default first real game (Marooned, 2 players, Easy) played like a new player:
// ✨ Plan it for me every day, and on every question either the ✨ pick (PICK=adv) or the first option (PICK=first).
//   node easy-sim.js [N=80]      env PICK=adv|first, EASYK='{...}' to try knobs. Prints wins and the pile at the end.
const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const ui=fs.readFileSync(__dirname+'/ui.js','utf8');const grab=n=>{const i=ui.indexOf('function '+n+'(');let d=0,j=ui.indexOf('{',i);for(let k=j;k<ui.length;k++){if(ui[k]==='{')d++;if(ui[k]==='}'){d--;if(!d)return ui.slice(i,k+1)}}};
const TUT=fs.readFileSync(__dirname+'/tutor.js','utf8');
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+'\n'+(process.env.EASYK?'var EASYK='+process.env.EASYK+';':'')+TUT.slice(TUT.indexOf('var EASYK'),TUT.indexOf('function tutDeal('))+'\n'+grab('pawnLabel')+'\n'+grab('invNeedPlain')+'\n'+fs.readFileSync(__dirname+'/advisor.js','utf8');
const N=+process.argv[2]||80,PICK=process.env.PICK||'adv';let wins=0;const piles=[],why={};
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);
  vm.runInContext(src,ctx);const R=c=>vm.runInContext(c,ctx);
  R(`UI.pause=true;setSeed(${101+g*17});newGame({scen:'marooned',chars:['carpenter','cook'],humans:[true,true],mode:'solo',friday:true,dog:true,items:4,diff:'easy'});easyDeal();`);
  let steps=0;while(!R('G.over')&&steps++<600){
    if(R('!!G.q')){R(PICK==='first'?'answer(0)':'answer(aiChoose(G.q.title,G.q.opts,G.chars[G.q.who],G.q)||0)');continue}
    if(R('planOpen()')){R('suggestPlan()');if(R('startActions()'))break;continue}
    if(!R('G.stk.length'))break;R('run()')}
  const o=JSON.parse(R('JSON.stringify({w:!!(G.over&&G.over.win),why:G.over&&G.over.why,pile:G.sc.pile,r:G.round})'));if(o.w)wins++;piles.push(o.pile);why[o.why]=(why[o.why]||0)+1}
console.log(`easy-sim PICK=${PICK} N=${N}: wins ${wins} (${Math.round(wins/N*100)}%) avg pile ${(piles.reduce((a,b)=>a+b,0)/N).toFixed(1)}`);console.log(why);
