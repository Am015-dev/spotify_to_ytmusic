// qa_gx/clear.js <url> <outdir>: CLEAR in BUILD by real taps (MORE → CLEAR) on a normal template, the Bus and My Build (custom); before/after shots, base cells, UNDO.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/clear';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal'});const{p,tap,ev}=T;const t0=Date.now();const W=t=>p.waitForTimeout(t);const R=[];
 const ck=(n,ok,x='')=>{R.push([n,!!ok]);console.log(ok?'PASS':'FAIL',n,x)};
 const shot=async n=>{await W(2500);await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n,((Date.now()-t0)/1000|0)+'s')};
 const info=()=>ev("JSON.stringify({n:GB_list().length,w:GB_list().filter(CR_isW).length,bp:GB.d.bp||0,base:Object.keys(GB_.base||{}).length,hi:Math.max(...Object.values(GB_.base||{}),-99),ty:[...new Set(GB_list().map(b=>b.t))].join(' '),L:B25.L,plate:(GB.mesh.userData.gbM||[]).length})");
 const clear=async()=>{await tap('#gbBkP [data-r2b="more"]');await W(700);await tap('#r2More [data-r2a="clr"]');await W(2000)};
 await tap('#gbMenuBtn');await W(2500);
 for(const id of(process.env.SETS||'posei,t_bus,mine').split(',')){
  if(id==='mine'){await tap('#gbBkP [data-r2b="more"]');await W(600);await ev('GNB_pick()');await W(1500);await tap('#gnbP [data-ch="sc8"]');await W(2500);
   await ev("(()=>{const L=GB_list();let k=0;for(let x=-6;x<=4&&k<5;x+=2)for(let z=-8;z<=6&&k<5;z+=3){const b={t:'b22',x,z,y:B25.L,r:0,m:0,c:k%12};if(B25_why(b)==='ok'){L.push(b);k++}}GB_refresh()})()")}
  else{if(!await p.evaluate(()=>{const e=document.querySelector('#g9Col');return !!(e&&e.offsetParent)})){await tap('#r2R [data-r2m="rides"]');await W(2000)}if(!await tap(`#g9Col .g9Card[data-gc="${id}"] img`))await tap(`#g9Col .g9Card[data-gc="${id}|car"] img`);await W(1500);await tap('#r2R [data-r2m="build"]');await W(3000)}
  const a=await info();console.log(id,'before',a);await shot(id+'_1_before');
  await clear();const b=JSON.parse(await info());console.log(id,'after',JSON.stringify(b));await shot(id+'_2_cleared');
  const A=JSON.parse(a);ck(id+': CLEAR leaves only chassis + wheels',b.n<A.n&&(A.w?b.w===A.w:b.n===0),JSON.stringify(b));
  ck(id+': base rescanned, layer on the chassis deck (no floating grid)',b.base>0&&b.hi<=4&&b.L<=b.hi+3,`cells ${b.base} highest ${b.hi} (before ${A.hi})`);
  await tap('#r2H [data-r2h="undo"]');await W(2000);ck(id+': UNDO restores the build',JSON.parse(await info()).n===A.n);
  console.log(id,'set',await ev('GAR_get().sel'));if(id!=='mine'){await tap('#r2R [data-r2m="rides"]');await W(2000)}}
 console.log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,6)));ck('0 console errors',!T.errs.length);console.log('RESULT',R.filter(r=>!r[1]).length?'FAIL':'PASS',R.filter(r=>r[1]).length+'/'+R.length);await T.b.close()})().catch(e=>{console.log('CRASH',e);process.exit(1)});
