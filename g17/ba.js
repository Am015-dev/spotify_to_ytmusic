// g17/ba.js <url> [out]: task B: garage build-up animation (852×393, real taps): open garage → frames; pick another STREET ride, a WATER ride, an OFF-ROAD ride → frames; tap skips
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'g17/ba';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev,tapXY}=T;const st=()=>ev('JSON.stringify(__ba.st())');
 const strip=async(nm,at=[350,800,1400,2100])=>{const t0=Date.now();for(const ms of at){const w=ms-(Date.now()-t0);if(w>0)await p.waitForTimeout(w);await p.screenshot({path:`${OUT}/${nm}_${ms}.png`});console.log(nm,ms,await st())}};
 const tapBtn=async s=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2,h=document.elementFromPoint(x,y);return[x,y,!!h&&(h===e||e.contains(h))]},s);if(!r||!r[2]){console.log('NOTAP',s,JSON.stringify(r));return 0}await tapXY(r[0],r[1]);return 1};
 await tap('#gbMenuBtn');await strip('a_open');await p.waitForTimeout(2500);console.log('end',await st());
 await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);console.log('rides (same ride, no replay)',await st());
 await tapBtn('.g9Card[data-gc="t_taxi"] img');await strip('b_taxi');await p.waitForTimeout(2500);
 await tapBtn('#r2C [data-r2px="2"]');await strip('c_water');await p.waitForTimeout(2500);
 await tapBtn('#r2C [data-r2px="1"]');await p.waitForTimeout(400);await tapBtn('.g9Card[data-gc="t_beast"] img');await strip('d_beast');await p.waitForTimeout(2500);
 await tapBtn('#r2C [data-r2px="0"]');await p.waitForTimeout(400);await tapBtn('.g9Card[data-gc="t_v7639_1"] img');await p.waitForTimeout(500);console.log('before skip',await st());await tapXY(430,200);await p.waitForTimeout(300);console.log('after tap skip',await st());await p.screenshot({path:`${OUT}/e_skip.png`});
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,6)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
