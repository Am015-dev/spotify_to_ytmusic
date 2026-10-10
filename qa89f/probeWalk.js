// diagnosis: what stops the walker at (2127.6,-1629.4) walking east in Athens
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89f/walk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 console.log('start',await ev(`JSON.stringify([RO.x,RO.z,RO.h,RO.y])`));
 await p.evaluate(()=>{__mho.warp(2117,-1627.5,Math.PI/2,true)});for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
 for(let i=0;i<60;i++){await p.evaluate(()=>__tick(5));const bt=await ev(`OF.btn`);if(bt==='exit')break}
 console.log('btn',await ev(`OF.btn+' '+RO.v`));
 const tb=await p.$('#tB');const bb=await tb.boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);for(let i=0;i<10;i++)await p.evaluate(()=>__tick(10));
 console.log('foot',await ev(`RO.foot+' '+OF.x.toFixed(2)+','+OF.z.toFixed(2)+' y'+OF.y.toFixed(2)`));
 // walk east with D... use the stick: set the camera yaw east and hold W
 await ev(`(()=>{OF.cy=Math.PI/2;OF.cyIn=OF.cy})()`);
 await p.keyboard.down('KeyW');
 for(let f=0;f<40;f++){await p.evaluate(()=>__tick(6));const s=await ev(`JSON.stringify({x:+OF.x.toFixed(2),z:+OF.z.toFixed(2),y:+OF.y.toFixed(2),h:+OF.h.toFixed(2),cy:+OF.cy.toFixed(2),spd:+OF.spd.toFixed(2),stk:(OF.stk||[]).slice(-2),
   hit:(()=>{const b=roamHit(OF.x+.4,OF.z,OF_R,OF.y+1);return b?JSON.stringify(b).slice(0,200):null})(),g1:+(groundAt(OF.x+.4,OF.z,OF.y+.6)-OF.y).toFixed(2),
   cars:OF_cars(true).filter(o=>bHit(OF_box(o.x,o.z,o.h,o.hw,o.hd),OF.x+.4,OF.z,OF_R)).map(o=>o.k+':'+o.x.toFixed(1)+','+o.z.toFixed(1)),
   props:(()=>{const PG=HUB.pgrid,D=HUB.ptypes,out=[];const x=OF.x+.4,z=OF.z,kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=PG.get((kx+a)*10000+kz+c);if(!L)continue;for(const q of L){if(!q.alive)continue;const d=D[q.t];if(!d)continue;const r=Math.max(.15,Math.min(1.1,d.r*.45))+OF_R;if(Math.hypot(x-q.x,z-q.z)<r)out.push(q.t+'@'+q.x.toFixed(1)+','+q.z.toFixed(1)+' y'+(q.y||0).toFixed(1))}}return out})()})`);
  if(f%4===0)console.log(f,s)}
 await shot(OUT+'/stuck.jpg');console.log('errs',JSON.stringify(errs));await b.close()})();
