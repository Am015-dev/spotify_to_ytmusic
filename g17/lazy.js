// g17/lazy.js <url> [out]: fresh boot → garage → RIDES → tap the Recycler (7991, model not loaded yet): the build-up must start after models/<id>.js arrives
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'g17/lazy';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev,tapXY}=T;const st=()=>ev('JSON.stringify(Object.assign(__ba.st(),{got:__ld.L.got.has("v7991_1")||[...__ld.L.got].filter(x=>/7991/.test(x)).length,wait:__ld.L.wait.size,sel:GAR_get().sel}))');
 await tap('#gbMenuBtn');await p.waitForTimeout(3500);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);console.log('before',await st());
 const r=await p.evaluate(()=>{const e=document.querySelector('.g9Card[data-gc="t_v7991_1"] img');e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]});
 await tapXY(r[0],r[1]);const t0=Date.now();for(const ms of[100,400,900,1500,2200,3000,4000]){const w=ms-(Date.now()-t0);if(w>0)await p.waitForTimeout(w);await p.screenshot({path:`${OUT}/r_${ms}.png`});console.log(ms,await st())}
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,6)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
