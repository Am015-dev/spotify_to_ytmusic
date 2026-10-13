const L=require('./lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{ev}=T;
 await T.tap('#roamBtn').catch(()=>0);await T.pg.waitForTimeout(500);
 const r=await ev(()=>{try{return __g9ev(`(()=>{if(state!=='roam')enterRoam();return 1})()`)}catch(e){return String(e)}});console.log('enter',r);
 await T.p.waitForFunction(()=>{try{return __g9ev("state==='roam'&&RO.on&&RO.marks.length>0")}catch(e){return false}},null,{timeout:180000});await T.pg.waitForTimeout(4000);
 console.log(await ev(()=>__g9ev(`JSON.stringify((()=>{const C={};for(const m of RO.marks){const k=m.kind+(m.dyn?'/dyn':'')+(m.ev&&m.ev.story?'/story':'');C[k]=C[k]||{n:0,ex:[]};C[k].n++;if(C[k].ex.length<2)C[k].ex.push((m.name||m.ev&&(m.ev.name||m.ev.title)||'')+'|'+mapIcon(m)+'|known'+markKnown(m)+'|lk'+markLocked(m))}const O={};for(const s of OG.S){O[s.k]=(O[s.k]||0)+1}return{C,O,keys:Object.keys(RO.marks[0])}})())`)));
 await T.close()})();
