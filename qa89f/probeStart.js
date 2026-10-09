// Frankfurt story start on phone: shots while Hilde's tip card shows; logs the tip / checklist-pin rects and overlap
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89f/start';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'fra',url:URL,phone:true});
 const R=()=>p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);if(e.hidden||cs.display==='none'||cs.visibility==='hidden')return null;const q=e.getBoundingClientRect();return q.width?{l:q.left|0,t:q.top|0,r:q.right|0,b:q.bottom|0,txt:e.textContent.trim().slice(0,50),fs:cs.fontSize}:null};
   const a=r('#npcSay'),c=r('#odPin');const ov=a&&c?Math.max(0,Math.min(a.r,c.r)-Math.max(a.l,c.l))*Math.max(0,Math.min(a.b,c.b)-Math.max(a.t,c.t)):0;
   const cards=['#npcSay','#odPin','#roamTut','#roamObj','#qvCard','#m1Card','#chBanner'].map(s=>[s,r(s)]).filter(x=>x[1]);return{tip:a,pin:c,ov,cards}});
 let n=0,seen=0;for(let f=0;f<1500&&n<4;f+=10){await p.evaluate(()=>__tick(10));const q=await R();if(q.tip&&(f%60===0||!seen)){seen=1;console.log(f,JSON.stringify(q));await shot(`${OUT}/start_${n++}.jpg`)}if(!q.tip&&seen&&n>=2)break}
 if(!n){console.log('no tip seen',JSON.stringify(await R()));await shot(`${OUT}/start_none.jpg`)}
 // after the tip: the pin comes back
 for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));console.log('after',JSON.stringify(await R()));await shot(`${OUT}/start_after.jpg`);
 const vis=()=>p.evaluate(()=>{const P=document.getElementById('odPin'),cs=getComputedStyle(P);const R=e=>{if(!e||e.hidden)return null;const q=e.getBoundingClientRect();return q.width?[q.left|0,q.top|0,q.right|0,q.bottom|0]:null};return{pin:cs.display!=='none'&&!P.hidden?R(P):null,yieldCls:document.body.classList.contains('odYield'),pause:R(document.getElementById('roamPause')),cards:[...document.querySelectorAll('#roamPause button,#roamPause h1,#roamPause h2,#roamPause b')].slice(0,6).map(e=>e.textContent.trim().slice(0,14)+':'+JSON.stringify(R(e)))}});
 console.log('drive',JSON.stringify(await vis()));
 {const t=await p.$('#tP');const bb=t&&await t.boundingBox();if(bb){await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2)}else console.log('no #tP')}await p.waitForTimeout(400);for(let i=0;i<3;i++)await p.evaluate(()=>__tick(1));
 console.log('pause',JSON.stringify(await vis()));await shot(`${OUT}/pause.jpg`);
 console.log('errs',JSON.stringify(errs));await b.close()})();
