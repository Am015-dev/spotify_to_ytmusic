// bc/garshot.js <url> <outdir>: real taps. Garage → RIDES → tap each big template card → shot; open BUILD on it → shot; part counts + builder fit checks
const E=require('./enter.js');const fs=require('fs');const OUT=process.argv[3]||'bc/gar';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal',tick:0});const{p,tap,ev}=T;const shot=async n=>{await p.waitForTimeout(+(process.env.WAIT||2500));await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n)};
 await shot('00_start');
 for(const id of(process.env.TPLS||'t_bus,t_truck,t_limo,t_mt').split(',')){
  await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#gbx .gbTabs [data-t="veh"]');await p.waitForTimeout(1500);
  const ok=await tap(`#g9Col .g9Card[data-gc="${id}|car"] img`)||await tap(`#g9Col .g9Card[data-gc="${id}"] img`);await p.waitForTimeout(1500);
  console.log(id,'card',ok,'sel',await ev('GAR_get().sel'),'parts',await ev(`__bc.n('${id}')`));await shot(id+'_rides');
  await tap('#gbx .gbTabs [data-t="parts"]');await p.waitForTimeout(1500);await shot(id+'_garage');
  if(await tap('#r2R [data-r2m="build"]')){await p.waitForTimeout(3000);await shot(id+'_build');console.log(id,'build bricks',await ev('GB.d&&GB_list().length'),'base cells',await ev('Object.keys(GB_.base||{}).length'))}
  await tap('#gbBack');await p.waitForTimeout(1000);await tap('#gbBack');await p.waitForTimeout(1500)}
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
