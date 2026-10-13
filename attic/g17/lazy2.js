// g17/lazy2.js <url>: fresh boot → RIDES → Turbo 74 (lazy LDraw) then WATER → Power Boat (lazy LDraw boat): the build-up plays on each after its model arrives
const E=require('../bc/enter.js');const fs=require('fs');const OUT='g17/lazy2';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev,tapXY}=T;const st=()=>ev('JSON.stringify(Object.assign(__ba.st(),{got:[...__ld.L.got].join(",")}))');
 const tapImg=async s=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]},s);if(r)await tapXY(r[0],r[1]);else console.log('NO',s)};
 await tap('#gbMenuBtn');await p.waitForTimeout(3500);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(6000);console.log('before',await st());
 await tapImg('.g9Card[data-gc="t_turbo"] img');for(const ms of[600,1500]){await p.waitForTimeout(ms===600?600:900);await p.screenshot({path:`${OUT}/turbo_${ms}.png`});console.log('turbo',ms,await st())}await p.waitForTimeout(4000);
 await tapImg('#r2C [data-r2px="2"]');await p.waitForTimeout(1500);await tapImg('.g9Card[data-gc="t_pboat"] img');for(const ms of[600,1500]){await p.waitForTimeout(ms===600?600:900);await p.screenshot({path:`${OUT}/pboat_${ms}.png`});console.log('pboat',ms,await st())}
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,6)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
