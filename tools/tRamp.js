// tRamp.js — city ramp jumps with real keyboard input (free roam, Rookie car, no boost key). For every ramp in RO.ramps (not decks):
// car primed at its normal top speed (V0 km/h) RUN m before the ramp on its axis, hold ArrowUp, steer onto the axis with ArrowLeft/Right; logs takeoff speed,
// jump distance (takeoff → touchdown, the game's own JUMP metric) and the margin over the hardest city jump goal (60 m).
// usage: node tools/tRamp.js <url> [city fra|ath] ; env RUN=260 NEED=60
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],CITY=process.argv[3]||'fra',RUN=+(process.env.RUN||150),V0=+(process.env.V0||150)/3.6,NEED=+(process.env.NEED||60);
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16);window.__auto=true})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.addInitScript(INIT);await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
if(CITY==='ath'){await p.evaluate(()=>{localStorage.setItem('mho_city@1','ath')})}
await p.evaluate(()=>__mho.enterRoam());for(let i=0;i<300;i++){try{if(await p.evaluate(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)))break}catch(e){}await p.waitForTimeout(2000)}
await p.evaluate(()=>{window.__auto=false;if(window.__dbg)__dbg.composer.render=()=>{}});const tick=n=>p.evaluate(n=>__tick(n),n);await tick(120);
const ramps=await p.evaluate(()=>__mho.RO.ramps.map((r,i)=>({i,x:r.x,z:r.z,h:r.h,len:r.len,hgt:r.hgt,w:r.w,dk:!!r.dk,og:!!r.og})).filter(r=>r.hgt>0));
let LIST=ramps;if(process.env.ONLY){const ids=process.env.ONLY.split(',').map(Number);LIST=ramps.filter(r=>ids.includes(r.i))}
if(process.env.VAR){const out=[];for(const r of LIST)for(const v of process.env.VAR.split(',')){const[l,h]=v.split('x').map(Number);out.push({...r,len:l,hgt:h,var:v})}LIST=out}
console.log('ramps',ramps.length,'testing',LIST.length);
// which way does ArrowLeft turn?
await p.evaluate(()=>{const R=__mho.RO;R.v=20});await p.keyboard.down('ArrowLeft');const h0=await p.evaluate(()=>__mho.RO.h);await tick(20);const h1=await p.evaluate(()=>__mho.RO.h);await p.keyboard.up('ArrowLeft');const LS=Math.sign(h1-h0)||1;
const rows=[];
for(const r of LIST){if(r.var)await p.evaluate(([r])=>{const q=__mho.RO.ramps[r.i];q.len=r.len;q.hgt=r.hgt},[r]);
  const st=await p.evaluate(([r,RUN,V0])=>{const M=__mho,R=M.RO,fx=Math.sin(r.h),fz=Math.cos(r.h);let run=RUN;
    for(;run>=60;run-=10){let ok=true;for(let d=r.len/2+4;d<=run;d+=4){const x=r.x-fx*d,z=r.z-fz*d;if(M.roamHitAt(x,z,2,M.gnd(x,z)+.5)){ok=false;break}}if(ok)break}
    const x=r.x-fx*run,z=r.z-fz*run;M.warp(x,z,r.h,true);R.x=x;R.z=z;R.h=r.h;R.v=V0;R.vy=0;R.y=M.gnd(x,z);R.takeoff=null;R.lastRamp=null;if(M.pl){M.pl.nitro=0;M.pl.bm=0}return run},[r,RUN,V0]);
  await tick(5);await p.keyboard.down('ArrowUp');let side=0,to=null,res=null,vmax=0;
  for(let f=0;f<1800;f+=2){
    const o=await p.evaluate(([r])=>{const R=__mho.RO,dx=R.x-r.x,dz=R.z-r.z;return{a:dx*Math.sin(r.h)+dz*Math.cos(r.h),b:dx*Math.cos(r.h)-dz*Math.sin(r.h),h:R.h,v:R.v,vy:R.vy,y:R.y,g:__mho.gnd(R.x,R.z,R.y+.3),to:R.takeoff?{x:R.takeoff.x,z:R.takeoff.z}:null,x:R.x,z:R.z}},[r]);
    vmax=Math.max(vmax,o.v);
    if(o.to&&!to)to={...o.to,v:o.v};
    if(to&&o.vy===0&&o.y<=o.g+.06){res={dist:+Math.hypot(o.x-to.x,o.z-to.z).toFixed(1)};break}
    if(!to&&o.a>r.len/2+30){res={miss:true,b:+o.b.toFixed(1)};break}
    let hd=r.h-Math.max(-.35,Math.min(.35,o.b*.04));let e=Math.atan2(Math.sin(hd-o.h),Math.cos(hd-o.h));const want=(o.vy!==0||Math.abs(e)<.015)?0:Math.sign(e)*LS;
    if(want!==side){if(side)await p.keyboard.up(side>0?'ArrowLeft':'ArrowRight');if(want)await p.keyboard.down(want>0?'ArrowLeft':'ArrowRight');side=want}
    await tick(2)}
  if(side)await p.keyboard.up(side>0?'ArrowLeft':'ArrowRight');await p.keyboard.up('ArrowUp');
  const row={var:r.var,i:r.i,x:Math.round(r.x),z:Math.round(r.z),len:r.len,hgt:r.hgt,og:r.og,run:st,vTake:to&&+(to.v*3.6).toFixed(0),vmax:+(vmax*3.6).toFixed(0),...res};if(res&&res.dist)row.margin=+(res.dist-NEED).toFixed(1);
  rows.push(row);console.log(JSON.stringify(row))}
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})();
