// t18/strips.js (scenario for t16/b2k.js): real touch strips for the reviewer, with slip (car heading vs velocity) and camera lag (camera yaw vs car heading).
// 1 city turn 90°: GAS held at ~60 km/h, full ◀ until the heading turned 90°. 2 hard brake: GAS to ~90 km/h, release GAS, BRAKE 1.6 s (plain brake).
// 3 drift turn (new rule): GAS held, ▶, then BRAKE pressed while GAS stays held, until 90°. Each: 4 shots + per-6-frame samples.
module.exports=({p,tick,down,up,move,center,shot,st,res,F})=>{global.SCEN=async()=>{
 const steerTo=async(dir)=>{const want=dir<0?'#tL':dir>0?'#tR':null;if(!want){await up('st');return}const xy=await center(want);if(F.st&&F.st.x===xy[0])return;if(F.st)await move('st',xy);else await down('st',xy)};
 const smp=()=>p.evaluate(()=>{const R=__mho.RO,c=__dbg.camera,T=__dbg.THREE;const f=new T.Vector3();c.getWorldDirection(f);const cy=Math.atan2(f.x,f.z);const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
   return{kmh:Math.round(Math.abs(R.v)*3.6),h:+R.h.toFixed(3),slip:+(ad(R.h,R.vh??R.h)*57.3).toFixed(1),camLag:+(ad(R.h,cy)*57.3).toFixed(1),drift:R.dDir||0,brake:!!__mho.touch.brake,gas:!!__mho.touch.gas}});
 const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
 const g=await center('#tG'),b=await center('#tB');
 const speedTo=async(k)=>{await down('gas',g);for(let i=0;i<60;i++){await tick(10);if((await smp()).kmh>=k)break}};
 const strip=async(name,n,stepF,body,stop)=>{const S=[];const h0=(await smp()).h;let si=0;for(let i=0;i<n;i++){await body(i);await tick(6);const s=await smp();s.turn=+(Math.abs(ad(s.h,h0))*57.3).toFixed(0);S.push(s);
   if(i%stepF===0&&si<4){await shot(name+'_'+(si++));}if(stop&&stop(s))break}res[name]=S;return S};
 // 1 city turn
 await speedTo(60);await strip('turn',60,4,async i=>{if(i===0)await steerTo(-1)},s=>s.turn>=90);await steerTo(0);await tick(60);
 // 2 hard brake
 await speedTo(90);await up('gas');await tick(4);await strip('brake',20,4,async i=>{if(i===0)await down('brk',b)},s=>s.kmh<3);await up('brk');await tick(30);
 // 3 drift turn (GAS held, BRAKE pressed while GAS held)
 await speedTo(70);await steerTo(1);await tick(6);await strip('driftTurn',60,4,async i=>{if(i===0)await down('brk',b)},s=>s.turn>=90);await up('brk');await steerTo(0);await tick(30);
 const sum=S=>({n:S.length,kmh0:S[0].kmh,kmh1:S[S.length-1].kmh,turn:S[S.length-1].turn,sec:+(S.length*6/60).toFixed(2),slipMax:Math.max(...S.map(s=>Math.abs(s.slip))),camLagMax:Math.max(...S.map(s=>Math.abs(s.camLag))),driftFrames:S.filter(s=>s.drift).length});
 res.summary={turn:sum(res.turn),brake:sum(res.brake),driftTurn:sum(res.driftTurn)};await up('gas')}};
