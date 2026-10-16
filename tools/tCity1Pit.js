// tCity1Pit (city-1): close shot of a street tree with its pit, foliage mix ON. node tools/tCity1Pit.js <url> <outdir> <tag>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,TAG]=process.argv.slice(2);
(async()=>{for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
await p.goto(BASE+'?test='+c+'&cvf=1');await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__c1&&window.__cvf,null,{timeout:240000});await p.waitForTimeout(3000);
const t=await p.evaluate(()=>{const B=__cvf.CVF.B||[],ro=__bv.ro();let best=null,bd=1e9;for(const p of B){const d=Math.hypot(p.x-ro.x,p.z-ro.z),r=__c1.rd(p.x,p.z);if(d<bd&&r<8&&r>2){bd=d;best=p}}if(!best)return null;
 const cand=[0,1,2,3].map(i=>{const a=i*Math.PI/2;return{a,d:__c1.rd(best.x-Math.sin(a)*14,best.z-Math.cos(a)*14)}}).sort((p,q)=>p.d-q.d)[0];__bv.view({x:best.x,z:best.z,h:cand.a-.45});return{x:best.x|0,z:best.z|0,t:best.t,d:cand.d|0}});
console.log(c,JSON.stringify(t));await p.waitForTimeout(3500);await p.screenshot({path:`${OUT}/pit_${c}_${TAG}.png`});await b.close()}})();
