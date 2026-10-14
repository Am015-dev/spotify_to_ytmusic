// stuck.js <url> <city> <spots.json [[x,z,label],...]> [shotdir]: per spot, 8 headings: warp, hold W (real key events) for 3 s of fixed-step sim
// (__qa.step, 1/60 s: no headless frame stalls), report moved m + the nearest collider ahead. Shot of each heading that moved < 5 m.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [U,C,J,SD]=process.argv.slice(2);const S=JSON.parse(fs.readFileSync(J,'utf8'));if(SD)fs.mkdirSync(SD,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(300000);
 await p.goto(U+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:300000});
 const ev=(s,a)=>p.evaluate(async([s,a])=>{try{return await window.__qa.ev('('+s+')('+JSON.stringify(a)+')')}catch(e){return{err:String(e)}}},[s,a]);
 let tot=0;
 for(const [x,z,lab] of S){const row=[];
  for(let k=0;k<8;k++){const h=k*Math.PI/4;
   const r=await ev(`a=>{try{__tq.reset()}catch(e){}const ok=roamWarp(a[0],a[1],a[2],true);RO.v=0;camSnap=true;__qa.step(20);const x0=RO.x,z0=RO.z;
     const K=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));K('KeyW',true);__qa.step(180);K('KeyW',false);
     const d=Math.hypot(RO.x-x0,RO.z-z0),fx=Math.sin(RO.h),fz=Math.cos(RO.h);let blk=null;for(let s=1;s<=6;s+=.5){const q=roamHit(RO.x+fx*s,RO.z+fz*s,1,RO.y);if(q){blk={s,hw:+(q.hw||0).toFixed(1),hd:+(q.hd||0).toFixed(1),r:q.r,h:+(q.h||0).toFixed(1),y0:q.y0!=null?+q.y0.toFixed(1):null,x:Math.round(q.x),z:Math.round(q.z),tr:q.trMin!=null};break}}
     return {ok,d:+d.toFixed(1),v:+RO.v.toFixed(1),x:Math.round(RO.x),z:Math.round(RO.z),y:+RO.y.toFixed(1),air:!!(pl&&pl.air),blk}}`,[x,z,h]);
   row.push([k*45,r]);
   if(SD&&r.d<5){await p.evaluate(()=>{__qa.live();__tq.o.draw=1});await p.waitForTimeout(1200);await p.screenshot({path:`${SD}/${lab}_${k*45}.jpg`,type:'jpeg',quality:60});await p.evaluate(()=>{__tq.o.draw=0})}}
  const bad=row.filter(q=>!(q[1].d>=5));tot+=bad.length;console.log(`${bad.length?'FAIL':'PASS'} ${lab} (${x},${z}): stuck ${bad.length}/8`);for(const q of bad)console.log('  h'+q[0]+' '+JSON.stringify(q[1]))}
 console.log('STUCK_TOTAL '+tot);await b.close()})();
