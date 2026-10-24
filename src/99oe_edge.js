// onfoot-edge-r22e31: registers the on-foot world-edge GO (OF_edgeGo in 98of_onfoot.js); a separate module because 99c_checklist.js is at its 200 KB cap
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.push({ver:'edge1',id:'onfoot-edge',area:'people',text:'foot: · WORLD EDGE (📍 GO: on foot, runs straight at each edge N S E W and at the 2 spots where the bot left the world, 20 s each). You stop 10 m inside the world box like the car (slow-down + TURN BACK banner), never below the ground, no jump. Frankfurt + Athens.'});
 __chk.GO['edge1/onfoot-edge']=['fra','ath'].map(c=>({c,n:'run at the edges',secs:60,fn:()=>OF_edgeGo()}))},500)}
// onfoot-collide-r24a: GO foot/solid. On foot, run straight at 3 building walls, 3 parked cars, 3 props and 3 fill-blocks (big low colliders); the walker never ends a frame inside a collider (roamHit at 0.6 R) and stops within 3 m of the face (the walk-fra line)
function OF_solidGo(){const r=OF_go('jump');if(RO.foot!=='walk')return r;const sv={x:OF.x,z:OF.z,y:OF.y},kk={KeyW:K.KeyW,ShiftLeft:K.ShiftLeft},bad=[],cnt={bld:0,car:0,prop:0,fill:0},want={bld:3,car:3,prop:3,fill:3};
  const T=[],seen=new Set();for(const L of HUB.grid.values())for(const b of L){if(!(b.hw>1&&b.hd>1))continue;const y=groundY(b.x,b.z),h=(b.h||0)-y;if(h<1.4||(b.y0!=null&&b.y0>y+1.5)||seen.has(b))continue;seen.add(b);T.push([h>12?'bld':'fill',b.x,b.z,Math.hypot(b.hw,b.hd)+4])}
  const D=HUB.ptypes||{};for(const L of HUB.pgrid.values())for(const p of L)if(p.alive&&D[p.t])T.push(['prop',p.x,p.z,5]);
  for(const c of HUB.cars||[])if(!(c.dead>0)&&c.x!=null&&!(c.x===0&&c.z===0))T.push(['car',c.x,c.z,6]);
  const o=sv,near=T.filter(t=>Math.hypot(t[1]-o.x,t[2]-o.z)<900).sort((a,b)=>Math.hypot(a[1]-o.x,a[2]-o.z)-Math.hypot(b[1]-o.x,b[2]-o.z));
  try{K.KeyW=true;K.ShiftLeft=false;
   for(const[kd,tx,tz,rad]of near){if(cnt[kd]>=want[kd])continue;const y=groundY(tx,tz);let ok=null;
    for(let a=0;a<8&&!ok;a++){const sx=tx+Math.sin(a*.785)*rad,sz=tz+Math.cos(a*.785)*rad;if(!roamHit(sx,sz,OF_R+.6,y+1)&&Math.abs(groundAt(sx,sz,y+1)-y)<.4)ok=[sx,sz]}
    if(!ok||!roamHit(tx,tz,.1,y+1))continue;cnt[kd]++;const yaw=Math.atan2(tx-ok[0],tz-ok[1]);
    OF.x=ok[0];OF.z=ok[1];OF.y=groundAt(ok[0],ok[1],y+1);OF.vx=OF.vz=OF.vy=0;OF.air=false;OF.cy=OF.cyIn=OF.h=yaw;OF.inA=0;OF.camT=9;
    let why='';for(let i=0;i<120&&!why;i++){OF.cy=OF.cyIn=yaw;OF.inA=0;OF_step(1/30);if(roamHit(OF.x,OF.z,OF_R*.6,OF.y+1))why='inside'}
    if(!why&&!roamHit(OF.x,OF.z,OF_R+3,OF.y+1)){cnt[kd]--;continue}/* slid off a corner or a gap: not a straight hit, does not count */;
    if(why)bad.push(kd+'@'+Math.round(tx)+','+Math.round(tz)+' '+why)}}
  finally{K.KeyW=kk.KeyW;K.ShiftLeft=kk.ShiftLeft;OF.x=sv.x;OF.z=sv.z;OF.y=sv.y}
  const n=cnt.bld+cnt.car+cnt.prop+cnt.fill;
  return'📍 ON-FOOT SOLID · '+n+' runs (bld '+cnt.bld+' car '+cnt.car+' prop '+cnt.prop+' fill '+cnt.fill+')'+(n<8?' ❌ too few targets':bad.length?' ❌ '+bad.join(' | '):' ✅')}
{const reg2=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg2);
 __chk.items.push({ver:'solid1',id:'foot-solid-go',area:'people',text:'foot: · SOLID ON FOOT (📍 GO: on foot, runs straight at 3 building walls, 3 parked cars, 3 props and 3 fill-blocks). Pass line: never a frame inside a collider, stops within 3 m of the face (the walk-fra line). Frankfurt + Athens.'});
 __chk.GO['solid1/foot-solid-go']=['fra','ath'].map(c=>({c,n:'walk into solids',secs:60,fn:()=>OF_solidGo()}))},500)}
