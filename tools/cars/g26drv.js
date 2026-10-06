// g26drv.js <page url> <outdir> <tag>: city driving feel, phone 852x393, real keyboard input on stepped frames.
//  1) steering step response at 60 and 100 km/h (yaw rate, lateral g, slip per frame)
//  2) braking strip from 100 km/h (side view): stopping distance, peak decel, body pitch
//  3) hard corner: 100 km/h, brake + full lock into the turn (chase view): slip angle, roll, speed
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [URL,OUT,TAG]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
p.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
await p.goto(URL);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.goto(URL);
await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const st=n=>p.evaluate(n=>{for(let i=0;i<n;i++){__dbg.RO.ch=null;__ju.step(1)}const R=__dbg.RO,s=__dbg.PL;return{x:R.x,z:R.z,h:R.h,vh:R.vh??R.h,v:R.v,yr:R.yr||0,terr:R.terr,
  nb:typeof __dbg.NB==='number'?__dbg.NB:0,pitch:R.c26p!=null?R.c26p:(s.pitch||0),roll:R.c26r!=null?R.c26r:(s.roll||0),wk:!!R.wk,rd:__mho.roadD(R.x,R.z)}},n);
// a long straight road with nothing in the way for 260 m
const spot=await p.evaluate(()=>{const R=__dbg.RO;const X0=R.x,Z0=R.z;for(let r=0;r<1200;r+=37)for(let a=0;a<6.28;a+=.7){const x=R.x+Math.cos(a)*r,z=R.z+Math.sin(a)*r;if(__mho.roadD(x,z)>1)continue;
  for(let hh=0;hh<6.28;hh+=.0872){const fx=Math.sin(hh),fz=Math.cos(hh);let ok=r<60||(fx*(X0-x)+fz*(Z0-z))/r>.3;for(let d=-20;d<=260&&ok;d+=6){const px=x+fx*d,pz=z+fz*d;if(__mho.roadD(px,pz)>2.5||__tr.hit(px,pz))ok=false;
     for(const sd of[-14,14])if(ok&&__tr.hit(px+fz*sd,pz-fx*sd))ok=false}if(ok)return{x,z,h:hh}}}return null});
console.log('spot',JSON.stringify(spot));const EN=()=>p.evaluate(()=>__dbg.RO.edgeN||0);if(!spot){console.log('NO SPOT');process.exit(1)}
const place=async(kmh)=>{await p.evaluate(([S,v])=>{const R=__dbg.RO;R.x=S.x;R.z=S.z;R.y=__dbg.GY(S.x,S.z);R.h=S.h;R.vh=S.h;R.v=v/3.6;R.vy=0;R.yr=0;R.dl=0;R.thA=1;R.bkA=0;R.c26p=null;(__dbg.PL.pitch=0);(__dbg.PL.roll=0);
  for(const c of(__cr25&&__cr25.cars)||[])if(c.x!=null&&Math.hypot(c.x-S.x,c.z-S.z)<400){c.x=1e5;c.z=1e5}},[spot,kmh]);
  await p.keyboard.down('ArrowUp');for(let i=0;i<20;i++){await p.evaluate(v=>{__dbg.RO.v=v/3.6},kmh);await st(1)}};
const res={};const RDS=[];const __rd=b=>b.rd;let si=0;
const shot=async(tag,cam)=>{await p.evaluate(cam=>{const D=__dbg,R=D.RO,c=D.camera;if(cam==='side'){const fx=Math.sin(R.h),fz=Math.cos(R.h);c.position.set(R.x+fz*5.2,R.y+.75,R.z-fx*5.2);c.lookAt(R.x,R.y+.8,R.z);c.updateMatrixWorld()}
  D.SS&&D.SS();D.composer.render()},cam);await p.screenshot({path:`${OUT}/${TAG}_${String(si++).padStart(2,'0')}_${tag}.png`})};
// 1) steering step response
for(const kmh of(process.env.KMH||"60,100").split(",").map(Number)){await place(kmh);const a=await st(1);await p.keyboard.down('ArrowRight');const L=[];for(let i=0;i<54;i++){const b=await st(1);L.push(b)}await p.keyboard.up('ArrowRight');
  const yr=L.map(b=>Math.abs(b.yr)),pk=Math.max(...yr),i90=yr.findIndex(y=>y>=.9*yr[yr.length-1]);const lat=L.map((b,i)=>i?Math.abs((b.vh-L[i-1].vh)*60*b.v)/9.81:0);
  res['step'+kmh]={yawSS:+yr[yr.length-1].toFixed(3),yawPk:+pk.toFixed(3),t90:+((i90+1)/60).toFixed(3),latG:+Math.max(...lat.slice(2)).toFixed(2),latGend:+lat[lat.length-1].toFixed(2),
   slipDeg:+Math.max(...L.map(b=>Math.abs(b.h-b.vh)*57.3)).toFixed(1),rollDeg:+Math.max(...L.map(b=>Math.abs(b.roll)*57.3)).toFixed(2),kmhEnd:+(L[L.length-1].v*3.6).toFixed(0),terr:[...new Set(L.map(b=>b.terr))].join('/'),
   yawCurve:yr.filter((_,i)=>i%6===5).map(y=>+y.toFixed(2)),kmhCurve:L.filter((_,i)=>i%6===5).map(b=>+(b.v*3.6).toFixed(0)),bumps:L[L.length-1].nb-a.nb,offRoad:L.filter((_,i)=>i%6===5).map(b=>+__rd(b).toFixed(0))};await p.keyboard.up('ArrowUp');await st(40)}
// 2) braking strip from 100 km/h, side view
{await place(100);await p.keyboard.up('ArrowUp');const a=await st(1);await p.keyboard.down('ArrowDown');const L=[];let n=0;for(let i=0;i<300;i++){const b=await st(1);L.push(b);if([2,8,14,22,32].includes(i))await shot('brake_f'+i,'side');if(b.v<=.05){n=i;break}}
  await st(10);await shot('brake_stop','side');await p.keyboard.up('ArrowDown');const d=Math.hypot(L[L.length-1].x-a.x,L[L.length-1].z-a.z);
  const dec=L.map((b,i)=>i?(L[i-1].v-b.v)*60/9.81:0);res.brake={dist:+d.toFixed(1),time:+(L.length/60).toFixed(2),peakG:+Math.max(...dec).toFixed(2),g_first5:dec.slice(1,6).map(x=>+x.toFixed(2)),pitchMinDeg:+(Math.min(...L.map(b=>b.pitch))*57.3).toFixed(2),pitchCurve:L.filter((_,i)=>i%4===0).slice(0,12).map(b=>+(b.pitch*57.3).toFixed(1))}}
await st(30);
// 3) hard corner: 100 km/h, brake + full lock right for 0.5 s then release brake, keep lock 1 s (chase cam)
{await place(100);await p.keyboard.up('ArrowUp');await p.keyboard.down('ArrowDown');await p.keyboard.down('ArrowRight');const L=[];for(let i=0;i<90;i++){if(i===30)await p.keyboard.up('ArrowDown');if(i===30)await p.keyboard.down('ArrowUp');const b=await st(1);L.push(b);if(i%12===4)await shot('corner_f'+i,'chase')}
  await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowUp');
  res.corner={slipDegMax:+Math.max(...L.map(b=>Math.abs(b.h-b.vh)*57.3)).toFixed(1),slipCurve:L.filter((_,i)=>i%6===0).map(b=>+(Math.abs(b.h-b.vh)*57.3).toFixed(1)),rollDegMax:+(Math.max(...L.map(b=>Math.abs(b.roll)))*57.3).toFixed(2),
   kmh:L.filter((_,i)=>i%15===0).map(b=>+(b.v*3.6).toFixed(0)),headingDeg:+((L[L.length-1].h-L[0].h)*57.3).toFixed(0),terr:[...new Set(L.map(b=>b.terr))].join('/'),wreck:L.some(b=>b.wk)}}
res.edgeWarnings=await EN();console.log(TAG,JSON.stringify(res,null,1));fs.writeFileSync(`${OUT}/${TAG}_metrics.json`,JSON.stringify(res,null,1));await br.close()})();
