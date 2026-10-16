// tCity1Wall (city-1): close shots of the biggest Frankfurt filler blocks. node tools/tCity1Wall.js <url> <outdir> <tag>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,TAG]=process.argv.slice(2,5);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
await p.goto(BASE+'?test=fra'+(process.argv[5]||''));await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__c1,null,{timeout:240000});await p.waitForTimeout(4000);
const R=await p.evaluate(()=>__c1.dr().filter(r=>Math.max(r.x1-r.x0,r.z1-r.z0)>90).slice(0,3).map(r=>({x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1})));console.log(TAG,R.length,JSON.stringify(R[0]));
let i=0;for(const r of R.slice(0,2)){for(const side of[0]){const ax=(r.x1-r.x0)>=(r.z1-r.z0);const cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2;
 // target a point on the long edge (south/west side), car 16 m outside facing it, then step back along the edge for a wider view
 const tx=ax?cx-(r.x1-r.x0)*.2:r.x0,tz=ax?r.z0:cz-(r.z1-r.z0)*.2,a=ax?0:Math.PI/2;// heading into the wall: +z for z0 edge, +x for x0 edge
 await p.evaluate(([x,z,a])=>__bv.view({x,z,h:a-.45}),[tx,tz,a]);await p.waitForTimeout(5000);await p.screenshot({path:`${OUT}/wall${i++}_${TAG}.png`})}}
await b.close()})();
