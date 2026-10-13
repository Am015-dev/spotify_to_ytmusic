const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');const out=process.argv[3];fs.mkdirSync(require('path').dirname(out),{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:process.argv[2],phone:true});
const g=JSON.parse(await p.evaluate(()=>__oc.ev(`JSON.stringify(RO.marks.filter(m=>m.kind==='garage').map(q=>[q.id,q.name,Math.round(q.x),Math.round(q.z),q.h]))`)));console.log(JSON.stringify(g));
const G=g.find(q=>/Eleni/i.test(q[0]+q[1]))||g[0];
const H=G[4];await p.evaluate(([x,z,h])=>{__mho.warp(x-Math.sin(h)*110,z-Math.cos(h)*110,h,true)},[G[2],G[3],H]);for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
await p.keyboard.down('ArrowUp');
for(let n=0;n<120;n++){await p.evaluate(()=>__tick(6));const r=await p.evaluate(()=>{const f=s=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const q=e.getBoundingClientRect();return q.width?[q.left|0,q.top|0,q.right|0,q.bottom|0,e.textContent.trim().slice(0,30)]:null};return{pr:f('#roamPrompt'),bar:f('#artBoost'),spd:f('#roamGauge'),tut:f('#roamTut'),tG:f('#tG'),tB:f('#tB'),tL:f('#tL'),tR:f('#tR'),v:Math.round(__mho.RO.v*3.6)}});if(r.pr){console.log(JSON.stringify(r));await shot(out);break}}
await p.keyboard.up('ArrowUp');
console.log(errs);await b.close()})()
