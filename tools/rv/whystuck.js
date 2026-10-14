// whystuck.js <url> <monkey.json> [city]: replay every "stuck" record (start 6 m back along its heading, hold W 3 s fixed-step) and name the
// function that cut the speed (stack of each ≥5 % drop while > 2 m/s), plus the street-life piece / building nearby. One line per record.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [U,J,CF]=process.argv.slice(2);const D=JSON.parse(fs.readFileSync(J,'utf8'));
const recs=[];for(const r of D.runs)for(const b of r.bugs||[])if(b.name==='stuck'&&(!CF||b.city===CF))recs.push(b);
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of [...new Set(recs.map(r=>r.city))]){const p=await (await br.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(300000);
  await p.goto(U+'?test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:300000});
  for(const b of recs.filter(r=>r.city===c)){const out=await p.evaluate(async a=>{try{return await window.__qa.ev(`(${a.js})(${JSON.stringify(a.b)})`)}catch(e){return{err:String(e)}}},{b,js:String(function(b){
    try{__tq.reset()}catch(e){}const bx=b.x-Math.sin(b.h)*6,bz=b.z-Math.cos(b.h)*6;roamWarp(bx,bz,b.h,true);RO.v=0;__qa.step(10);const x0=RO.x,z0=RO.z;
    let v=RO.v;const S={};Object.defineProperty(RO,'v',{configurable:true,get(){return v},set(n){if(Math.abs(v)>2&&Math.abs(n)<Math.abs(v)*.95){const l=(new Error().stack.split('\n')[2]||'').trim().split(' ')[1]||'?';S[l]=(S[l]||0)+1}v=n}});
    const K=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));K('KeyW',true);__qa.step(180);K('KeyW',false);delete RO.v;RO.v=v;
    const fx=Math.sin(RO.h),fz=Math.cos(RO.h);let bld=null;for(let s=0;s<=5;s+=.5){const q=roamHit(RO.x+fx*s,RO.z+fz*s,1.2,RO.y);if(q){bld={s,hw:+(q.hw||0).toFixed(1),hd:+(q.hd||0).toFixed(1),tr:q.trMin!=null};break}}
    let life=null;try{const L=window.__life.LIFE;const it=(L.H||[]).filter(i=>i.c==='set').map(i=>[Math.hypot(RO.x-i.x,RO.z-i.z)-i.r,i]).sort((a,b)=>a[0]-b[0])[0];if(it&&it[0]<2)life={t:it[1].t,r:it[1].r,gap:+it[0].toFixed(1)}}catch(e){}
    let road=null;try{const cc=cityAt(RO.x,RO.z);road=cc?+(Math.abs(cc.lat)-cc.S.r.w/2).toFixed(1):null}catch(e){}
    return {moved:+Math.hypot(RO.x-x0,RO.z-z0).toFixed(1),cut:S,bld,life,offRoad:road,edge:RO.x<=WX0+21||RO.x>=WX1-21||RO.z<=WZS+21||RO.z>=WZN-21}})});
   console.log(`${c} ${b.x},${b.z} h${(+b.h).toFixed(2)}: ${JSON.stringify(out)}`)}}
 await br.close()})();
