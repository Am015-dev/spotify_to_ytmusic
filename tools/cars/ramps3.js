// ramps2.js <url> <city> [maxRamps]: every roam ramp: warp 220 m before it (verified), real keys (gas, steer taps toward the ramp centre line, no boost),
// log speed at -100/-50/-20 m, at the lip, takeoff speed, jump distance, landing (wreck?)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,CITY='fra',MAX='99',ONLY='']=process.argv.slice(2);const ONLYS=ONLY?ONLY.split(',').map(Number):null;const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const RA=await p.evaluate(()=>__dbg.RAMPS);const K=p.keyboard;const out=[];
const rel=r=>`const R=__dbg.RO,dx=R.x-(${r.x}),dz=R.z-(${r.z}),s=Math.sin(${r.h}),c=Math.cos(${r.h});const al=dx*s+dz*c,lat=dx*c-dz*s;`;
for(let i=0;i<Math.min(RA.length,+MAX);i++){const r=RA[i];if(!(r.len>0))continue;if(ONLYS&&!ONLYS.includes(i))continue;
 const w=await p.evaluate(r=>{const back=r.back,x=r.x-Math.sin(r.h)*back,z=r.z-Math.cos(r.h)*back;try{__m1.warp(x,z,r.h)}catch(e){return 'nowarp '+e}const R=__dbg.RO;R.takeoff=null;R.v=0;R.h=r.h;R.vh=r.h;__ju.step(30);return Math.hypot(R.x-x,R.z-z)},{...r,back:+(process.env.BACK||220)});
 if(typeof w==='string'||w>15){out.push({i,len:r.len,hgt:r.hgt,warpErr:w});continue}
 await K.down('ArrowUp');const rec={i,len:r.len,hgt:r.hgt,w:r.w,v:{}};let t=null,maxAir=0;let steer=0;
 for(let k=0;k<520;k++){const q=await p.evaluate(([r])=>{__ju.step(4);const R=__dbg.RO,dx=R.x-r.x,dz=R.z-r.z,s=Math.sin(r.h),c=Math.cos(r.h);const al=dx*s+dz*c,lat=dx*c-dz*s;const P=__dbg.PL;window.__TR=(window.__TR||[]);if(al>-r.len-60)window.__TR.push([+lat.toFixed(1),+al.toFixed(1),+R.y.toFixed(2),+(R.vy||0).toFixed(1),+(R.v*3.6).toFixed(0),!!R.takeoff,R.crRJ|0,!!R.lastRamp,!!(P&&P.air),!!R.wk]);return{al,lat,air:!!(P&&P.air),kmh:R.v*3.6,to:!!R.takeoff,x:R.x,z:R.z,y:R.y,wk:!!R.wk,herr:Math.atan2(Math.sin(R.h-r.h),Math.cos(R.h-r.h))}},[r]);
  for(const m of[-100,-50,-20])if(rec.v[m]==null&&q.al>m-r.len/2)rec.v[m]=+q.kmh.toFixed(0);
  if(rec.lip==null&&q.al>r.len/2-1)rec.lip=+q.kmh.toFixed(0);
  // human steering: aim at the ramp centre line 30 m ahead
  if(!q.air&&!t){const want=Math.atan2(-q.lat,30),e=want-q.herr;const ns=e>.03?-1:e<-.03?1:0;if(ns!==steer){if(steer<0)await K.up('ArrowLeft');if(steer>0)await K.up('ArrowRight');if(ns<0)await K.down('ArrowLeft');if(ns>0)await K.down('ArrowRight');steer=ns}}
  if(!t&&q.to){t={x:q.x,z:q.z,kmh:+q.kmh.toFixed(0),y:q.y,k};if(steer<0)await K.up('ArrowLeft');if(steer>0)await K.up('ArrowRight');steer=0}
  if(t&&q.air)t.seen=1;if(t&&q.air)maxAir=Math.max(maxAir,q.y-t.y);
  if(t&&t.seen&&!q.air){rec.take=t.kmh;rec.dist=+Math.hypot(q.x-t.x,q.z-t.z).toFixed(1);rec.land=+q.kmh.toFixed(0);rec.wreck=q.wk;rec.landY=+(q.y-t.y).toFixed(1);rec.hp=await p.evaluate(()=>__dbg.RO.hp);rec.apex=+maxAir.toFixed(1);break}
  if(!t&&q.al>r.len/2+25){rec.miss=true;rec.lat=+q.lat.toFixed(1);break}}
 if(steer<0)await K.up('ArrowLeft');if(steer>0)await K.up('ArrowRight');await K.up('ArrowUp');await p.evaluate(()=>{__ju.step(30)});out.push(rec);console.log(JSON.stringify(rec));if(process.env.TR)console.log(JSON.stringify(await p.evaluate(()=>{const t=window.__TR;window.__TR=[];return t.slice(0,80)})))}
console.log('errs',errs);await br.close()})();
