// tCupStart.js (v88z): traffic around the Athens AKROPOLIS CUP start (x≈2040 z≈-1640), the tPlay wall/traffic hotspot.
// Player parked 60 m away (no input); for 90 s samples every 0.5 s: traffic cars within 30 m of the start, how many are stopped (<3 km/h),
// their types; also the street colliders within 12 m of the start (static). usage: node tools/tCupStart.js <url> [out.json]
const fs=require('fs');const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,errs,shot}=await boot(b,{city:'ath',url:process.argv[2],phone:true});
 await p.evaluate(()=>{const M=__mho,R=M.RO;R.ch=null;R.sp=null;M.warp(2040,-1580,Math.PI);R.v=0});await p.evaluate(()=>__tick(60));
 const S=[];for(let t=0;t<180;t++){S.push(await p.evaluate(()=>{const M=__mho,R=M.RO;R.v=0;let n=0,st=0,ty={};for(const c of M.HUB.cars){if(c.dead>0)continue;const d=Math.hypot(c.x-2040,c.z+1640);if(d<30){n++;if(Math.abs(c.v||0)*3.6<3)st++;const k=c.type||c.k||c.kind;ty[k]=(ty[k]||0)+1}}__tick(30);return{n,st,ty}}))}
 const col=await p.evaluate(()=>{const M=__mho;let h=0,t=0;for(let x=-12;x<=12;x+=2)for(let z=-12;z<=12;z+=2){t++;if(M.roamHitAt(2040+x,-1640+z,1.6,M.gnd(2040+x,-1640+z,50)+.6))h++}return{h,t}});
 if(process.argv[4])await shot(process.argv[4]);
 const avg=k=>+(S.reduce((a,s)=>a+s[k],0)/S.length).toFixed(2),ty={};S.forEach(s=>{for(const k in s.ty)ty[k]=(ty[k]||0)+s.ty[k]});
 const r={avgCars30m:avg('n'),avgStopped:avg('st'),maxCars:Math.max(...S.map(s=>s.n)),typeSamples:ty,collidersNearStart:col,errs:errs.length};console.log(JSON.stringify(r));
 if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify({r,S}));await b.close()})();
