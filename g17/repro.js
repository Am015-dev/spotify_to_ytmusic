// g17/repro.js <url> [out]: RIDES → OFF-ROAD / WATER: per card ✎ BUILD / ▶ GUIDE, then BUILD + guide on the first owned card (real taps, 852×393)
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'g17/repro';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev,tapXY}=T;const shot=async(n,w=1200)=>{await p.waitForTimeout(w);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const vis=s=>p.evaluate(s=>{const r=[...document.querySelectorAll(s)].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.y<innerHeight&&b.y>=0&&getComputedStyle(e).visibility!=="hidden"}).map(e=>{const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2,e.textContent.trim().slice(0,30)]});return r},s);
 const tapV=async s=>{const r=await vis(s);if(!r.length){console.log('NOVIS',s);return 0}await tapXY(r[0][0],r[0][1]);return 1};
 await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);
 console.log('tabs',JSON.stringify(await vis('[data-gty],[data-r3t]')));
 const card=()=>p.evaluate(()=>JSON.stringify([...document.querySelectorAll('.g9Card,[data-r3c]')].filter(c=>c.getBoundingClientRect().width>0).map(c=>(c.dataset.gc||c.dataset.r3c)+'/'+(c.dataset.f||'')+':'+(c.querySelector('[data-ged]')?'B':'-')+(c.querySelector('[data-sbg]')?'G':'-'))));
 console.log('street',await card());
 for(const k of['off','boat']){await tapV(`#r2C [data-r2px="${k==="off"?1:2}"]`);await shot('02_'+k);console.log(k,await card())}
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
