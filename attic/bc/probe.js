// bc/probe.js <url> [tpl]: real taps: garage RIDES → template card → SAVE; enter roam (API); print size/hull numbers (+ forced re-measure)
const E=require('./enter.js');const TPL=process.argv[3]||'';(async()=>{const T=await E(process.argv[2]);const{p,tap,ev}=T;console.log('loaded');
 if(TPL){await tap('#gbMenuBtn');await p.waitForTimeout(1500);await tap('#gbx .gbTabs [data-t="veh"]');await p.waitForTimeout(1500);await tap(`#g9Col .g9Card[data-gc="${TPL}"] img`);await p.waitForTimeout(1000);console.log('sel',await ev('GAR_get().sel'));await tap('#gbSave');await p.waitForTimeout(1500)}
 await T.roamApi();console.log('roam');
 const q=`JSON.stringify({sel:GAR_get().sel,dims:__bc.dims(),hull:__bc.hull(),rcb:RCAM.chase.b,k:BC.k,f:BC.f,due:BC.due})`;console.log('A',await ev(q));console.log('M',JSON.stringify(await p.evaluate(()=>__bc.measure())),'rcb',await ev('RCAM.chase.b'));
 console.log('B',await ev(`(()=>{BC.k='';try{BC_upd()}catch(e){return 'ERR '+e.stack}return ${q}})()`));
 console.log('errs',T.errs.length,T.errs.slice(0,3));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
