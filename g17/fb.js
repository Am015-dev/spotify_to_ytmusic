// g17/fb.js <url> [out]: garage-17 real-touch check (852×393): RIDES → OFF-ROAD / WATER → ✎ BUILD (tap the ride, PLACE, ROTATE+PLACE) → back to RIDES (saved)
// → ▶ GUIDE (steps, next, done, exit); BUILD tab on the WATER tab edits the boat; SAVE & DRIVE keeps the street car; the drive's boat/4x4 use the edits.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'g17/fb';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev,tapXY}=T;const shot=async(n,w=1200)=>{await p.waitForTimeout(w);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const vis=s=>p.evaluate(s=>[...document.querySelectorAll(s)].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.y<innerHeight&&b.y>=0&&getComputedStyle(e).visibility!=='hidden'}).map(e=>{const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]}),s);
 const tapV=async s=>{const r=await vis(s);if(!r.length){console.log('NOVIS',s);return 0}await tapXY(r[0][0],r[0][1]);return 1};
 const J=c=>ev(typeof c==='function'?'('+c.toString()+')()':c);

 await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);
 const carN=await J(()=>GB.d.bricks.length);console.log('street car bricks',carN);
 const rideTop=()=>J(()=>{const U=GB.mesh.userData,b=new THREE.Box3();for(const o of U.gbM||[])b.union(new THREE.Box3().setFromObject(o));GB_cam&&GB_cam();const c=b.getCenter(new THREE.Vector3());const v=new THREE.Vector3(c.x,b.max.y,c.z).project(GB.cam);const r=$('#gbC').getBoundingClientRect();return[r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]});
 for(const[k,px,id]of[['boat',2,'t_speedboat'],['off',1,'t_beast'],['boat',2,'t_pboat']]){
  await tapV(`#r2C [data-r2px="${px}"]`);await p.waitForTimeout(1200);
  const bt=await vis(`.g9Card[data-gc="${id}"] [data-fbb]`);console.log(k,id,'BUILD btn',bt.length,'GUIDE btn',(await vis(`.g9Card[data-gc="${id}"] [data-fbg]`)).length);
  if(!await tapV(`.g9Card[data-gc="${id}"] [data-fbb]`)){await p.evaluate(id=>document.querySelector(`.g9Card[data-gc="${id}"]`).scrollIntoView(),id);await p.waitForTimeout(500);if(!await tapV(`.g9Card[data-gc="${id}"] [data-fbb]`)){console.log('FAIL no build button');continue}}
  await p.waitForTimeout(1500);const st=await J(()=>JSON.stringify(__fb.st())+' bk '+GB_.bk);console.log('in build',st);await shot(`${k}_${id}_1build`);
  const n0=await J(()=>GB_list().length);const xy=await J(()=>{const L=B25.L,list=GB_list();let best=null;for(const k in GB_.base){const[i,j]=k.split(',').map(Number);if(GB_top(i,j,list)===L&&i>=-1&&i<=0){if(!best||Math.abs(j)<Math.abs(best[1]))best=[i,j]}}if(!best)return[426,150];GB_cam();const m=GB.mesh.userData.m;const v=m.localToWorld(new THREE.Vector3((best[0]+.5)*GB_U,L*GB_PH,(best[1]+.5)*GB_U)).project(GB.cam);const r=$('#gbC').getBoundingClientRect();return[r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height,best,L]});console.log('target',JSON.stringify(xy));await tapXY(xy[0],xy[1]);await p.waitForTimeout(700);
  let held=await J(()=>!!GS.held);console.log('held',held,await J('B25.why'));if(held){await tapV('#gsBar [data-g="place"]')}else{await tapXY(xy[0],xy[1])}
  await p.waitForTimeout(700);const n1=await J(()=>GB_list().length);console.log('place',n0,'->',n1);
  await J('GB_.pc="b12"');await tapXY(xy[0],xy[1]-30);await p.waitForTimeout(700);held=await J(()=>!!GS.held);if(held){await tapV('#gsBar [data-g="rot"]');await p.waitForTimeout(400);await shot(`${k}_${id}_2rotate`,300);await tapV('#gsBar [data-g="place"]')}
  await p.waitForTimeout(700);const n2=await J(()=>GB_list().length);console.log('rotate+place',n1,'->',n2,'held',held);await shot(`${k}_${id}_3placed`,500);
  await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);console.log('after exit',await J(()=>JSON.stringify({st:__fb.st(),saved:__fb.saved(),car:GB.d.bricks.length,cur:null})),'cur',await J(`__fb.cur('${id}','${k}')`),'pre',await J(`__fb.pre('${id}','${k}')`));
  // guide
  await tapV(`#r2C [data-r2px="${px}"]`);await p.waitForTimeout(800);
  if(!await tapV(`.g9Card[data-gc="${id}"] [data-fbg]`)){await p.evaluate(id=>document.querySelector(`.g9Card[data-gc="${id}"]`).scrollIntoView(),id);await p.waitForTimeout(500);await tapV(`.g9Card[data-gc="${id}"] [data-fbg]`)}
  await p.waitForTimeout(1200);console.log('gvis',JSON.stringify(await vis(`.g9Card[data-gc="${id}"] [data-fbg]`)));console.log('guide',await J(()=>JSON.stringify({on:SB.on,n:SB.S.length,B:SB.B&&SB.B.length,st:__fb.st()})));await shot(`${k}_${id}_4guide1`,600);
  await tap('#sbG [data-sb="play"]');for(let i=0;i<4;i++){await tap('#sbG [data-sb="next"]');await p.waitForTimeout(150)}await shot(`${k}_${id}_5guide5`,1200);
  await p.evaluate(()=>{const s=document.querySelector('#sbG .sbSl');if(!s)return;s.value=s.max;s.dispatchEvent(new Event('input'))});await shot(`${k}_${id}_6guideDone`,1500);
  await tap('#sbG [data-sb="x"]');await p.waitForTimeout(1500);console.log('guide exit',await J(()=>JSON.stringify({on:SB.on,st:__fb.st(),car:GB.d.bricks.length})));
 }
 // BUILD tab while the WATER tab is showing → edits the equipped boat
 await tapV('#r2C [data-r2px="2"]');await p.waitForTimeout(800);await tap('#r2R [data-r2m="build"]');await p.waitForTimeout(1500);console.log('BUILD tab on WATER',await J(()=>JSON.stringify(__fb.st())));await shot('7_buildtab_water');
 // guide from BUILD ⋯ MORE inside a form session, then back
 if(await tapV('#gbBkP [data-r2b="more"]')){await p.waitForTimeout(500);if(await tapV('#r2More [data-r2a="sbg"]')){await p.waitForTimeout(1500);console.log('more guide',await J(()=>JSON.stringify({on:SB.on,n:SB.S.length,st:__fb.st()})));await tap('#sbG [data-sb="x"]');await p.waitForTimeout(1500);console.log('back',await J(()=>JSON.stringify({bk:GB_.bk,st:__fb.st()})))}}
 await tapV('#r2R [data-r2m="rides"]');await p.waitForTimeout(800);await tapV('#r2C [data-r2px="0"]');await p.waitForTimeout(800);
 console.log('street tab BUILD',await J(()=>{GB_enter();const r=JSON.stringify({st:__fb.st(),n:GB_list().length});GB_exit();return r}));
 await tap('#gbSave');await p.waitForTimeout(4000);
 console.log('after SAVE',await J(()=>JSON.stringify({build:(store.get('mho_build',{}).bricks||[]).length,saved:__fb.saved(),boatEq:GAR_get().boat,offEq:GAR_get().off})),'carN',carN);
 console.log('drive forms',await J(()=>{const U=pl&&pl.mesh&&pl.mesh.userData;return U&&U.gbV?JSON.stringify(Object.fromEntries(Object.entries(U.gbV).map(([k,g])=>{let n=0;g.traverse(o=>{if(o.isMesh)n+=o.geometry.attributes.position.count});return[k,n]}))):'no pl'}));
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,8)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
