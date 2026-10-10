// play/driftprobe.js: can a phone player drift without a DRIFT button? Touch flags (GAS held, ▶ held, BRAKE pressed for H s) on a flat
// pinned road (as tTurn26). Reports whether a drift starts (RO.dDir), when, and the speed then. usage: node play/driftprobe.js <url>
const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const B0=b.newContext.bind(b);b.newContext=async o=>{const c=await B0(o);await c.route('**/tune.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({v:99,values:Object.assign({'TUNE.traf':0},process.env.TUNE?JSON.parse(process.env.TUNE):{})})}));return c};
 const{p,errs}=await boot(b,{city:'fra',url:URL,phone:true});
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chAbort()}catch(e){}try{M1.auto=0}catch(e){}(()=>{const T=roamTerr,x0=-960,z0=760;roamTerr=(x,z,y)=>T(x0,z0,y);roamHit=()=>false;window.__dp={x0,z0}})()`));
 const out=[];
 for(const[kmh,H]of(process.env.CASES?JSON.parse(process.env.CASES):[[45,1.5],[60,1.5],[60,.3],[80,1.5],[80,.3],[100,1.5],[120,1.5]])){
  out.push(await p.evaluate(([kmh,H])=>__g9ev(`(()=>{const T=TOUCH;T.on=true;T.used=true;T.gas=true;T.brake=false;T.dir=0;T.steer=0;
   roamWarp(__dp.x0,__dp.z0,0);RO.v=${kmh}/3.6;RO.vh=RO.h;__tick(2);RO.v=${kmh}/3.6;for(let i=0;i<30;i++){T.gas=RO.v*3.6<${kmh};__tick(1)}T.gas=true;
   T.dir=1;for(let i=0;i<12;i++)__tick(1);const st0=+(T.steer||0).toFixed(2);
   let t=0,dT=null,dv=null,mx=0;for(;t<3;t+=1/60){T.brake=t<${H};__tick(1);if(RO.dDir&&dT==null){dT=+t.toFixed(2);dv=+(RO.v*3.6).toFixed(0)}if(RO.dDir)mx+=1/60}
   T.brake=false;T.dir=0;T.gas=false;for(let i=0;i<60;i++)__tick(1);
   return{kmh:${kmh},brakeHeld:${H},steerAtBrake:st0,driftStartS:dT,kmhAtDrift:dv,driftS:+mx.toFixed(2),d26:__d26()}})()`),[kmh,H]));
  console.log(JSON.stringify(out[out.length-1]))}
 console.log('errs',errs.length,errs.slice(0,3));await b.close()})();
