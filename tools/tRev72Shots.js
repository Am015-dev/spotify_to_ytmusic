// tRev72Shots (rev-72): (a) queue at red light node 115 fra, (b) ath bend x-610 z36 approach, (c) ath park canopy, (d) fra roam + HUD. node tools/tRev72Shots.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+c);await p.waitForFunction(()=>window.__chk&&window.__l3&&window.__tq&&__tq.ready,null,{timeout:300000});await p.waitForTimeout(4000);
 if(c==='fra'){
  const r=await p.evaluate(()=>{const L=__l3,CV=L.CV,J=CV.sig.slice().sort((a,b)=>Math.hypot(a.x-612,a.z+2)-Math.hypot(b.x-612,b.z+2))[0];
   const st=k=>{const u=((CV.t-J.off)%J.C+J.C)%J.C,s=J.s[k],g=J.g[k];return u>=s&&u<s+g?'g':u>=s+g&&u<s+g+2.5?'y':'r'};
   L.park(J.x+60,J.z+60);let found=null;for(let i=0;i<240*5&&!found;i++){L.sim(.2);for(let k=0;k<J.ap.length;k++){if(st(k)!=='r')continue;const q=L.cars().filter(c=>!(c.dead>0)&&c.l3S&&c.l3S.J===J&&c.l3S.k===k&&(c.cv||0)<.5&&c.l3S.d<40);
    if(q.length>=3){q.sort((a,b)=>b.l3S.d-a.l3S.d);const t=q[0],hx=t.CVhx,hz=t.CVhz;found={k,n:q.length,x:t.x-hx*12,z:t.z-hz*12,h:Math.atan2(hx,hz)};break}}}
   if(!found)return{none:1};L.park(found.x,found.z,found.h);found.st=st(found.k);return found});
  console.log('a',JSON.stringify(r));await p.waitForTimeout(3000);await p.screenshot({path:OUT+'/a_queue.png'});
  await p.evaluate(()=>__chk.go('bv1/fra')).catch(e=>console.log('go',e));await p.waitForTimeout(6000);await p.screenshot({path:OUT+'/d_fra_roam.png'});
 }else{
  await p.evaluate(()=>__cvf.park());await p.waitForTimeout(6000);await p.screenshot({path:OUT+'/c_ath_park.png'});
  await p.evaluate(()=>{try{__tq.reset&&__tq.reset()}catch(e){}});
  console.log('b',await p.evaluate(()=>{const f=window.__l3||{};return Object.keys(window).filter(k=>/^__/.test(k)).join(',')}));
 }
 await b.close()}})();
