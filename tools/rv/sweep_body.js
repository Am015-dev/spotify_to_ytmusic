// /run body: runs in node with p (page). Globals via process.env-less: read view list from window.__RVV (set beforehand)
const fs=require('fs');const OUT=globalThis.__RVOUT;fs.mkdirSync(OUT,{recursive:true});
const H=js=>p.evaluate(async s=>{try{const v=await window.__hot(s);return v}catch(e){return'ERR '+String(e).slice(0,200)}},js);
const views=globalThis.__RVVIEWS;const res=[];
const shot=async(f,w,h,ms)=>{await p.setViewportSize({width:w,height:h});await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(ms);await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:70});await p.evaluate(()=>{__tq.o.draw=0});};
await p.evaluate(()=>{__tq.o.draw=0});
let i=0;for(const v of views){i++;const t0=Date.now();
 const r0=await H('(async()=>{try{__tq.reset()}catch(e){};await new Promise(r=>setTimeout(r,150));'+v.js+'})()').catch(e=>'ERR '+e);
 await p.waitForTimeout(v.wait||1500);
 const met=await H(globalThis.__RVMET).catch(e=>'ERR '+e);
 const n=String(i).padStart(2,'0')+'_'+v.n;
 await shot(n+'_L.jpg',852,393,900);await shot(n+'_P.jpg',393,852,1300);await p.setViewportSize({width:852,height:393});
 res.push({n,r0:typeof r0==='string'?r0.slice(0,120):r0,met,s:((Date.now()-t0)/1000).toFixed(1)})}
await p.evaluate(()=>{__tq.o.draw=0});fs.writeFileSync(OUT+'/res.json',JSON.stringify(res,null,1));return res.length
