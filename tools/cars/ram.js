// ram.js <url> <out>: SMASH test with real touch BOOST (+ arrow keys to aim). City: warp 22 m behind a traffic car on its lane, hold BOOST, count wrecks (10 tries).
// Race: put an AI rival 12 m ahead in the player's line, hold BOOST, count takedowns (10 tries).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true);__ju.step(60)});
const cdp=await ctx.newCDPSession(p);const K=p.keyboard;
const bpos=await p.evaluate(()=>{const r=document.getElementById('tN').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
const lbl=await p.evaluate(()=>document.getElementById('tN').innerText.replace(/\n/g,' / '));console.log('BOOST label:',lbl);
const out={city:[],race:[]};
for(let n=0;n<14&&out.city.filter(x=>x.ok!=null).length<10;n++){
 const tgt=await p.evaluate(n=>{const H=__mho.HUB,R=__dbg.RO,m=new __dbg.THREE.Matrix4(),v=new __dbg.THREE.Vector3(),z=new __dbg.THREE.Vector3();const C=H.cars.filter(c=>!(c.dead>0)&&!c.tr);const c=C[(n*7+3)%C.length];const im=H.cim[c.k];im.getMatrixAt(c.j,m);v.setFromMatrixPosition(m);z.setFromMatrixColumn(m,2).normalize();const h=Math.atan2(z.x,z.z);
   __m1.warp(v.x-z.x*22,v.z-z.z*22,h);R.h=R.vh=h;R.v=60/3.6;__dbg.PL.bm=100;return{i:H.cars.indexOf(c),h}},n);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bpos.x,y:bpos.y,id:3}]});let ok=null,kmh=0;let steer=0;
 for(let k=0;k<40;k++){const q=await p.evaluate(t=>{__ju.step(4);const H=__mho.HUB,c=H.cars[t.i],R=__dbg.RO,m=new __dbg.THREE.Matrix4(),v=new __dbg.THREE.Vector3();const im=H.cim[c.k];im.getMatrixAt(c.j,m);v.setFromMatrixPosition(m);const a=Math.atan2(v.x-R.x,v.z-R.z);let e=a-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));return{dead:c.dead>0,tum:!!c.crW,e,d:Math.hypot(v.x-R.x,v.z-R.z),kmh:R.v*3.6,boost:!!R.boosting}},tgt);
  kmh=Math.max(kmh,q.kmh);if(q.dead){ok=true;break}const ns=q.e>.04?1:q.e<-.04?-1:0;if(ns!==steer){if(steer>0)await K.up('ArrowLeft');if(steer<0)await K.up('ArrowRight');if(ns>0)await K.down('ArrowLeft');if(ns<0)await K.down('ArrowRight');steer=ns}if(q.d>40){ok=false;break}}
 if(steer>0)await K.up('ArrowLeft');if(steer<0)await K.up('ArrowRight');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 if(ok&&out.city.filter(x=>x.ok).length===0){await p.evaluate(()=>{__ju.step(8);__dbg.composer.render()});await p.screenshot({path:OUT+'_city_smash.png'})}
 out.city.push({n,ok,kmh:+kmh.toFixed(0)});await p.evaluate(()=>__ju.step(30))}
// race
await p.evaluate(()=>__dbg.RS('quick'));for(let k=0;k<60;k++){await p.evaluate(()=>__ju.step(10));if(await p.evaluate(()=>__dbg.ST==='race'))break}await p.evaluate(()=>__ju.step(200));
const rb=await p.evaluate(()=>{const r=document.getElementById('tN').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
for(let n=0;n<10;n++){const ai=await p.evaluate(n=>{const P=__dbg.PL,A=__dbg.SH.filter(s=>!s.isPlayer&&!(s.dead>0)&&!s.eliminated);const a=A[n%A.length];a.dist=P.dist+12;a.x=P.x;a.v=P.v*.8;P.bm=100;return __dbg.SH.indexOf(a)},n);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rb.x,y:rb.y,id:4}]});let ok=false,pk=0;
 for(let k=0;k<30;k++){const q=await p.evaluate(i=>{__ju.step(3);const a=__dbg.SH[i],P=__dbg.PL;return{dead:a.dead>0,gap:a.dist-P.dist,kmh:P.v*3.6,nitro:!!P.nitro}},ai);pk=Math.max(pk,q.kmh);if(q.dead){ok=true;break}if(q.gap<-8)break}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(ok&&!out.race.some(x=>x.ok)){await p.evaluate(()=>{__ju.step(6);__dbg.composer.render()});await p.screenshot({path:OUT+'_race_smash.png'})}
 out.race.push({n,ok,kmh:+pk.toFixed(0)});await p.evaluate(()=>__ju.step(90))}
console.log('CITY',out.city.filter(x=>x.ok).length+'/'+out.city.filter(x=>x.ok!=null).length,JSON.stringify(out.city));console.log('RACE',out.race.filter(x=>x.ok).length+'/'+out.race.length,JSON.stringify(out.race));console.log('errs',errs);await br.close()})();
