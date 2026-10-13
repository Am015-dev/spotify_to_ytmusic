// tTurn26.js (drive26): physics-only 90° turn probe. Terrain is pinned to the start tile (flat road, no walls), so the numbers are the car
// model alone. At each speed: hold gas at a steady speed, then hold ▶ (key) until the heading has turned 90°. Records slip angle
// (heading vs velocity direction), yaw rate, speed, path radius. Variants: plain full lock, full lock with a 0.4 s brake tap at turn-in,
// brake only (gas off) 0.6 s, GAS+BRAKE held through the turn (gbHold), and DRIFT (X) held through the turn.
// usage: node tools/tTurn26.js <url> <out.json>   env SPEEDS=50,80 FPS=60 TUNE='{"TUNE.x":1}'
const fs=require('fs');const{chromium,boot}=require('./d24lib');
const URL=process.argv[2],OUT=process.argv[3]||'qa26/turn.json',FPS=+(process.env.FPS||60),SPEEDS=(process.env.SPEEDS||'50,80').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const tv=Object.assign({'TUNE.traf':0},process.env.TUNE?JSON.parse(process.env.TUNE):{});
 const B0=b.newContext.bind(b);b.newContext=async o=>{const c=await B0(o);await c.route('**/tune.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({v:99,note:'tTurn26',values:tv})}));return c};
 const{p,errs}=await boot(b,{city:'fra',fps:FPS,url:URL,phone:false});
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chAbort()}catch(e){}try{M1.auto=0}catch(e){}`));
 await p.evaluate(()=>__g9ev(`(()=>{const T=roamTerr,x0=-960,z0=760,t0=T(x0,z0,99);window.__t26T=t0;roamTerr=(x,z,y)=>T(x0,z0,y);roamHit=()=>false;window.__t26={x0,z0}})()`));
 const res=[];
 for(const kmh of SPEEDS)for(const mode of(process.env.MODES||'full,brakeTap,brakeOnly,drift').split(',')){
  const r=await p.evaluate(([kmh,mode,FPS])=>__g9ev(`(()=>{const K=__mho.K,kd=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));
   for(const c of['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','KeyX'])kd(c,false);
   roamWarp(__t26.x0,__t26.z0,0);RO.v=${kmh}/3.6;RO.yr=0;RO.dl=0;RO.vh=RO.h;__tick(2);RO.v=${kmh}/3.6;
   // hold the target speed for 1 s (gas on/off), no steering
   for(let i=0;i<${FPS};i++){kd('ArrowUp',RO.v*3.6<${kmh});__tick(1)}
   const h0=RO.h,v0=RO.v*3.6,S=[];let t=0,mx=0,sum=0,n=0,x0=RO.x,z0=RO.z;const half=${mode==='half'};
   if(${mode==='drift'})kd('KeyX',true);
   kd('ArrowRight',true);if(half)K.ArrowRight=false;
   for(;t<6;t+=1/${FPS}){if(half){window.__t26half=1}const bo=${mode==='brakeOnly'}&&t<.6;kd('ArrowUp',!bo&&RO.v*3.6<${kmh});if(${mode==='brakeTap'})kd('ArrowDown',t<.4);if(${mode==='gbHold'}){kd('ArrowUp',true);kd('ArrowDown',true)}if(${mode==='brakeOnly'})kd('ArrowDown',bo);
    if(half){/* half lock via the steer value hook */}
    __tick(1);const sl=Math.atan2(Math.sin(RO.h-RO.vh),Math.cos(RO.h-RO.vh))*180/Math.PI,turned=Math.abs(Math.atan2(Math.sin(RO.h-h0),Math.cos(RO.h-h0)))*180/Math.PI;
    S.push([+t.toFixed(3),+sl.toFixed(2),+(RO.yr||0).toFixed(3),+(RO.v*3.6).toFixed(1),+turned.toFixed(1),RO.dDir||0]);mx=Math.max(mx,Math.abs(sl));sum+=Math.abs(sl);n++;if(turned>=90)break}
   for(const c of['ArrowUp','ArrowDown','ArrowRight','ShiftLeft','KeyX'])kd(c,false);
   const trv=Math.atan2(Math.sin(RO.vh-h0),Math.cos(RO.vh-h0))*180/Math.PI;
   return{kmh:${kmh},mode:'${mode}',v0:+v0.toFixed(1),t90:+t.toFixed(2),maxSlip:+mx.toFixed(1),meanSlip:+(sum/n).toFixed(1),vEnd:+(RO.v*3.6).toFixed(1),velTurned:+trv.toFixed(1),drifted:S.some(s=>s[5]),trace:S.filter((s,i)=>i%6==0)}})()`),[kmh,mode,FPS]);
  res.push(r);console.log(JSON.stringify({...r,trace:undefined}))}
 fs.writeFileSync(OUT,JSON.stringify({errs,res},null,0));console.log('errors',errs.length,errs.slice(0,3));await b.close()})();
