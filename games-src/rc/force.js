const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+';UI.pause=true;';
let bad=0,runs=0;const fails={};
for(const scen of ['marooned','hexed','stranded','settlers'])for(let seed=0;seed<3;seed++){
 const ctx={console,Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);vm.runInContext(src,ctx);
 const cards=vm.runInContext('[...EVENTS,...WRECKS,...ADVENTURES,...MYSTERIES].map(c=>c.k)',ctx);
 for(const k of cards){const errs=[];ctx.console={log(){},error:(...a)=>errs.push(a.join(' '))};
  try{vm.runInContext(`setSeed(${seed*1000+runs});newGame({scen:'${scen}',chars:['carpenter','cook','soldier'].slice(0,${1+seed}),mode:'ai'});
   function drain(){let s=0;while(!G.over&&s++<300){if(G.q){answer(aiChoose(G.q.title,G.q.opts,G.chars[G.q.who],G.q));continue}if(planOpen())return;if(!G.stk.length)return;run()}}
   for(let r=0;r<${seed+1}&&!G.over;r++){drain();if(planOpen()){aiPlan();startActions()}drain()}
   if(!G.over){const c=CARD['${k}'];const parts=[];if(c.th){parts.push(c.ev,c.th.rw||c.th.rw1||[],c.th.rw2||[],c.te)}else{parts.push(c.ops||[]);if(c.decide)parts.push(c.decide[0],c.decide[1]);if(c.ev)parts.push(c.ev.ops)}
    for(const p of parts){if(G.over)break;G.stk=[];ops(p,{actor:G.first,card:'${k}',pay:[G.first],fut:false,pos:G.camp.pos,srcI:0,gres:'food'});run();drain();const v=checkInvariants().filter(x=>!/stuck/.test(x));if(v.length)console.error('INV '+v[0])}}`,ctx)}
  catch(e){errs.push(String(e.stack).split('\n').slice(0,2).join(' '))}
  runs++;if(errs.length){bad++;fails[k]=(fails[k]||[]).concat(errs.slice(0,1))}}}
console.log('runs',runs,'failing',bad);for(const k in fails)console.log(k,fails[k][0].slice(0,220))
