// tLights3Shot (lights-3): 852x393 proof of a queue at a red light at Frankfurt box 612,-2 (node 115). Sims until one approach is red with >= 3 stopped
// cars, puts the player ON that lane 12 m behind the last car, facing the junction (chase camera looks over it). node tools/tLights3Shot.js <url> <out.png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__l3&&window.__tq&&__tq.ready,null,{timeout:300000});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const L=__l3,CV=L.CV,J=CV.sig.slice().sort((a,b)=>Math.hypot(a.x-612,a.z+2)-Math.hypot(b.x-612,b.z+2))[0];
  const st=k=>{const u=((CV.t-J.off)%J.C+J.C)%J.C,s=J.s[k],g=J.g[k];return u>=s&&u<s+g?'g':u>=s+g&&u<s+g+2.5?'y':'r'};
  L.park(J.x+60,J.z+60);let found=null;for(let i=0;i<240*5&&!found;i++){L.sim(.2);for(let k=0;k<J.ap.length;k++){if(st(k)!=='r')continue;const q=L.cars().filter(c=>!(c.dead>0)&&c.l3S&&c.l3S.J===J&&c.l3S.k===k&&(c.cv||0)<.5&&c.l3S.d<40);
    if(q.length>=3){q.sort((a,b)=>b.l3S.d-a.l3S.d);const t=q[0],hx=t.CVhx,hz=t.CVhz;found={k,n:q.length,x:t.x-hx*12,z:t.z-hz*12,h:Math.atan2(hx,hz),last:[t.x|0,t.z|0],ds:q.map(c=>+c.l3S.d.toFixed(1))};break}}}
  if(!found)return{none:1};L.park(found.x,found.z,found.h);found.st=st(found.k);return found});
 console.log(JSON.stringify(r));await p.waitForTimeout(2500);
 console.log(await p.evaluate(()=>{const L=__l3,CV=L.CV,J=CV.sig.slice().sort((a,b)=>Math.hypot(a.x-612,a.z+2)-Math.hypot(b.x-612,b.z+2))[0];return 'after: stopped near box '+L.cars().filter(c=>!(c.dead>0)&&(c.cv||0)<.5&&Math.hypot(c.x-J.x,c.z-J.z)<J.R0+40).length}));
 await p.screenshot({path:OUT,type:'jpeg',quality:85});await b.close()})();
