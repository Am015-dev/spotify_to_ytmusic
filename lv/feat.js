// lv/feat.js <url> <outdir>: close-up look shots of the v88m life features (Frankfurt, 852x393 normal gfx): boat on the Main, rooftop flag, pigeons before/after scatter, blimp, pedestrians waving
const enter=require('../bc/enter.js');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const dis=async()=>{for(let i=0;i<4;i++){const l=p.getByText('CONTINUE',{exact:false}).first();if(await l.count()&&await l.isVisible()){await E.tapEl(await l.elementHandle());await p.waitForTimeout(800)}else break}};await dis();
 const ev=c=>p.evaluate(c=>{try{return __g9ev(c)}catch(e){return 'ERR '+e}},c);const shot=async n=>{await p.waitForTimeout(2500);await dis();await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const warp=(x,z,h)=>ev(`(()=>{const x=${x},z=${z},h=${h};__mho.warp(x,z,h,performance.now());RO.x=x;RO.z=z;RO.y=groundAt(x,z,RO.y+60);RO.v=0;RO.vh=h;RO.h=h;return 1})()`);
 // 1 boat: stand on the quay next to boat 0, camera from the bank
 const bt=JSON.parse(await ev(`JSON.stringify(LV.boats&&LV.boats.bt.map(b=>[b.x,b.z,b.h]))`)||'null');console.log('boats',JSON.stringify(bt&&bt.slice(0,2)));
 if(bt){const [x,z,h]=bt[0];await ev(`(()=>{const b=LV.boats.bt[0];b.v=0;LV.boats.bt.forEach(q=>q.v=0);return 1})()`);await ev(`__gnb.cam([${x}+Math.cos(${h})*14,groundAt(${x},${z},60)+4,${z}-Math.sin(${h})*14,${x},groundAt(${x},${z},60)+1,${z}])`);await shot('f1_boat');await ev('__gnb.cam(null)');await ev(`LV.boats.bt.forEach(q=>q.v=6)`)}
 // 2 pigeons: park on a street, spawn the first flock 20 m ahead on the pavement, low camera, then roll the car at it
 await ev(`(()=>{const F=LV.birds.fl[0];const fx=Math.sin(RO.h),fz=Math.cos(RO.h);F.on=true;F.st=0;F.t=0;F.x=RO.x+fx*16+fz*4;F.z=RO.z+fz*16-fx*4;F.y=groundAt(F.x,F.z,RO.y+5);for(const b of F.b){b.x=F.x+b.ox;b.z=F.z+b.oz;b.y=Math.max(0,groundAt(b.x,b.z,F.y+3))}return 1})()`);
 await ev(`(()=>{const F=LV.birds.fl[0];__gnb.cam([F.x+Math.cos(RO.h)*7,F.y+1.4,F.z-Math.sin(RO.h)*7,F.x,F.y+.3,F.z]);return 1})()`);await shot('f2_pigeons');
 await ev(`(()=>{const F=LV.birds.fl[0];RO.x=F.x-Math.sin(RO.h)*12;RO.z=F.z-Math.cos(RO.h)*12;RO.v=8;return 1})()`);await p.waitForTimeout(1500);await ev(`RO.v=0`);await shot('f3_scatter');await ev('__gnb.cam(null)');
 // 3 flag: nearest active flag, camera on the street 35 m away looking up
 const fl=JSON.parse(await ev(`JSON.stringify(LV.flags&&LV.flags.L[0])`)||'null');console.log('flag',JSON.stringify(fl));
 if(fl){await ev(`__gnb.cam([${fl[0]}+11,${fl[1]}+6,${fl[2]}+11,${fl[0]},${fl[1]}+5,${fl[2]}])`);await shot('f4_flag');await ev('__gnb.cam(null)')}
 // 4 blimp from the ground
 await ev(`(()=>{const m=LV.blimp.m.position;__gnb.cam([m.x+90,m.y-25,m.z+90,m.x,m.y,m.z]);return 1})()`);await shot('f5_blimp');await ev('__gnb.cam(null)');
 // 5 people: chase view, car rolling slowly past the pavement (waves)
 await ev(`RO.v=6`);await shot('f6_people');await ev(`RO.v=0`);
 console.log('n',JSON.stringify(await p.evaluate(()=>__lv.n())),'calls',await ev('renderer.info.render.calls'));console.log('errors',errs.length,errs.slice(0,4).join(' | '));await E.b.close()})();
