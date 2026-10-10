// Athens outskirts drive at speed (real keys: hold ArrowUp + light steering to stay on the road), shots every ~2 s; checks errors
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89h/drive';fs.mkdirSync(OUT,{recursive:true});
const SP=JSON.parse(process.env.SP||'[[1049,-553],[3117,-2702]]');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 for(let k=0;k<SP.length;k++){const n=JSON.parse(await ev(`(()=>{let b=null,bd=1e9;for(const q of HUB.nodes){if(!q||!q.nb||!q.nb.length||q.ab)continue;const d=Math.hypot(q.x-(${SP[k][0]}),q.z-(${SP[k][1]}));if(d<bd){bd=d;b=q}}let m=null,ml=0;for(const i of b.nb){const o=HUB.nodes[i];const l=Math.hypot(o.x-b.x,o.z-b.z);if(l>ml){ml=l;m=o}}return JSON.stringify({x:b.x,z:b.z,h:Math.atan2(m.x-b.x,m.z-b.z)})})()`));
  await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[n.x,n.z,n.h]);for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
  await p.keyboard.down('ArrowUp');let vmax=0;
  for(let s=0;s<4;s++){for(let f=0;f<120;f+=6){await p.evaluate(()=>__tick(6));const st=JSON.parse(await ev(`JSON.stringify({v:RO.v,yr:RO.yr||0})`));vmax=Math.max(vmax,st.v)}
   await shot(`${OUT}/d${k}_${s}.jpg`)}
  await p.keyboard.up('ArrowUp');console.log('drive',k,JSON.stringify(n),'vmax km/h',(vmax*3.6).toFixed(0))}
 console.log('errs',JSON.stringify(errs));await b.close()})();
