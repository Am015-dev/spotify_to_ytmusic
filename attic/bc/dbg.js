// bc/dbg.js <url>: why does __mho.enterRoam() not reach roam? prints state every 10 s
const E=require('./enter.js');(async()=>{const T=await E(process.argv[2]);console.log('loaded');
 const r=await T.p.evaluate(()=>{try{const x=__mho.enterRoam();return typeof x+' '+String(x)}catch(e){return 'ERR '+e}});console.log('enterRoam ->',r);
 for(let i=0;i<30;i++){await T.p.waitForTimeout(10000);console.log(i,await T.p.evaluate(()=>JSON.stringify({st:__mho.state,ld:__mho.LD&&{on:__mho.LD.on,busy:!!__mho.LD.busy}})),T.errs.slice(-2));if(await T.p.evaluate(()=>__mho.state==='roam'))break}
 await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
