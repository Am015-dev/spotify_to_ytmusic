// experiment: which harshness dominates? run with parts switched off
const fs=require('fs'),vm=require('vm');const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
for(const [nm,patch] of [['base',''],['no events',"FN.event=fr=>{G.phase='event'};"],['no adventures',"FN.adventure=fr=>{};"],['no weather',"FN.weather=fr=>{G.phase='weather'};"],['no rot',"const _n4=FN.night4;FN.night4=fr=>{const f=G.res.food;_n4(fr);G.res.food=f};"]]){
 let wins=0,rs=0;for(let g=0;g<40;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);
  vm.runInContext(src+';UI.pause=true;'+patch+`setSeed(${900+g});newGame({scen:'marooned',chars:['carpenter','cook'],mode:'ai'});let s=0;while(!G.over&&s++<600){if(G.q){answer(aiChoose(G.q.title,G.q.opts,G.chars[G.q.who],G.q));continue}if(planOpen()){aiPlan();startActions()}else if(G.stk.length)run();else break}`,ctx);
  const G=vm.runInContext('G',ctx);if(G.over&&G.over.win)wins++;rs+=G.round}
 console.log(nm.padEnd(14),'wins',wins,'/40 avg round',(rs/40).toFixed(1))}
