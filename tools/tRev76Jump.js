// tRev76Jump: place the car on the Westend Split start segment before the first ramp at speed, hold throttle, shoot in the air.
// node tools/tRev76Jump.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 console.log('start',await Q(`(()=>{const C=TK_C;tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C);const r=C.ramps[0];const P=G.seg[r[0]],L=tkLen(P),f=r[1]-45/L,q=tkAt(P,f);const R=RO.ramps.map(o=>[Math.hypot(o.x-q.x,o.z-q.z),o]).sort((a,b)=>a[0]-b[0])[0][1];const bx=R.x-Math.sin(R.h)*(R.len/2+40),bz=R.z-Math.cos(R.h)*(R.len/2+40);RO.x=bx;RO.z=bz;RO.h=RO.vh=R.h;q.ramp=[R.x,R.z,R.h,R.len,R.hgt];RO.y=groundAt(bx,bz,99);RO.v=30;K.ArrowUp=K.KeyW=true;return JSON.stringify({r,f,q})})()`));
 let n=0;for(let i=0;i<600&&n<2;i++){const a=await Q(`(()=>{K.ArrowUp=K.KeyW=true;RO.sp&&(RO.sp.cd=0);return[RO.y-groundAt(RO.x,RO.z,99),RO.v]})()`);
  if(i%50==0)console.log(i,JSON.stringify(await Q('[RO.x,RO.z,RO.v,RO.y,RO.h]')));if(a[0]>1.5&&a[1]>10){await p.screenshot({path:OUT+'/jump_westend_'+n+'.png'});console.log('air',JSON.stringify(a));n++;await p.waitForTimeout(1500)}await p.waitForTimeout(100)}
 console.log('done',n);await b.close()})();
