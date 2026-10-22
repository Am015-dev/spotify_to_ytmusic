// tSolidCarsShot (solid-cars-r22e1): node tools/tSolidCarsShot.js <base url> <out png> [city]  852x393 phone; the player noses into the side of a stopped bus at 10 km/h, shot after ~1.5 s (gas off at the first push-out)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,CITY='fra']=process.argv.slice(2);
// game code runs in the game scope through __tk.q (like tCLsmashShot)
const Q=(p,f)=>p.evaluate(src=>__tk.q(src),'('+f.toString()+')()');
const setup=()=>{const N=HUB.nodes,nm=c=>String(HCAR.get?HCAR.get(c.k):HCAR[c.k]);const bus=HUB.cars.filter(c=>!(c.dead>0)&&/bus/.test(nm(c))&&!c.CVin&&!c.pk&&N[c.a]&&N[c.b]&&c.t>.2&&c.t<.8).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z))[0];if(!bus)return'no bus';
 const A=N[bus.a],B=N[bus.b],L=Math.hypot(B.x-A.x,B.z-A.z),dx=(B.x-A.x)/L,dz=(B.z-A.z)/L,nx=dz,nz=-dx;window.__bus=bus;bus.v=.001;bus.cv=0;roamWarp(bus.x+nx*4.0-dx*1.5,bus.z+nz*4.0-dz*1.5,Math.atan2(-nx,-nz)-.5);
 RO.x=bus.x+nx*4.0-dx*1.5;RO.z=bus.z+nz*4.0-dz*1.5;RO.y=bus.y;RO.h=RO.vh=Math.atan2(-nx,-nz)-.5;RO.v=10/3.6;camSnap=true;window.__n0=NC.n.push+NC.n.wall;window.__bk=setInterval(()=>{bus.v=.001;bus.cv=0;K.ArrowUp=RO.v<10/3.6&&NC.n.push+NC.n.wall===__n0},16);return nm(bus)};
const after=()=>{clearInterval(__bk);K.ArrowUp=false;const c=__bus,M=__nc.mtv(RO.x,RO.z,RO.h,OB_HW,OB_HL,c.x,c.z,Math.atan2(c.hdx,c.hdz),...OB_cdim(c.k));
 return Math.hypot(c.x-RO.x,c.z-RO.z).toFixed(2)+' m centres, overlap '+(M?M[2]:0).toFixed(2)+' m, push-outs '+(NC.n.push+NC.n.wall-__n0)+', bus dead '+(c.dead>0)+', player '+(RO.v*3.6).toFixed(1)+' km/h'};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test='+CITY);await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const r=await Q(p,setup);await p.waitForTimeout(1500);const s=r==='no bus'?'':await Q(p,after);await p.screenshot({path:OUT});console.log('bus',r,s);await b.close()})();
