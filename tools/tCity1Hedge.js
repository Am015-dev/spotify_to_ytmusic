// tCity1Hedge (city-1): close shot of a hedge run per city. node tools/tCity1Hedge.js <url> <outdir> <tag>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,TAG]=process.argv.slice(2);
(async()=>{for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
await p.goto(BASE+'?test='+c);await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__c1,null,{timeout:240000});await p.waitForTimeout(3000);
const t=await p.evaluate(()=>{const A=__c1.h1(),ro=__bv.ro();let best=null,bs=-1;for(let i=0;i<A.length;i+=3){const[x,z,ry]=A[i];if(Math.hypot(x-ro.x,z-ro.z)>900)continue;let n=0;for(const o of A)if((o[0]-x)**2+(o[1]-z)**2<900)n++;if(n>bs){bs=n;best=A[i]}}
 const[x,z,ry]=best;const cand=[ry+Math.PI/2,ry-Math.PI/2].map(a=>({a,d:__c1.rd(x-Math.sin(a)*16,z-Math.cos(a)*16)})).sort((p,q)=>p.d-q.d)[0];__bv.view({x,z,h:cand.a-.45});return{x:x|0,z:z|0,n:bs,d:cand.d|0}});
console.log(c,JSON.stringify(t));await p.waitForTimeout(6000);await p.screenshot({path:`${OUT}/hedge_${c}_${TAG}.png`});await b.close()}})();
