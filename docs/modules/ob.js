// ===== OB (owner bugs): burst cause log + phantom-burst fixes
// every debris / stud burst / transform burst is logged with the function that fired it (cause); bursts fire only from real hits, pickups or real vehicle switches
const OB={log:[],on:false,n:0,unc:0,sw:[],off:(()=>{try{return localStorage.getItem('ob_off')==='1'}catch(e){return false}})()};  // ob_off=1: old behaviour (for before/after measurements)
function OB_who(){const L=(new Error().stack||'').split('\n').slice(2);if(L.some(l=>/AU_fountain/.test(l)))return'smashCheck';for(const l of L){const m=l.match(/at (?:[\w$]+\.)*([\w$]+) \(/);if(m&&!/^(OB_|debris$|studBurst$|burst$|AU_fountain$|forEach$|map$|apply$|call$)/.test(m[1]))return m[1]}return '?'}
function OB_prop(at){if(!at||!HUB.pgrid)return null;const L=HUB.pgrid.get(Math.floor(at.x/16)*10000+Math.floor(at.z/16))||[];for(const p of L)if(Math.abs(p.x-at.x)<.01&&Math.abs(p.z-at.z)<.01){let v=true;for(let o=p.im;o;o=o.parent)if(!o.visible)v=false;return{t:p.t,vis:v,dy:+(p.y-groundY(p.x,p.z)).toFixed(1),py:+p.y.toFixed(1),ry:+RO.y.toFixed(1)}}return null}
function OB_rec(k,at){OB.n++;OB.n0=OB.n0||0;if(!OB.on)return;const w=OB_who(),d=at?Math.round(Math.hypot(at.x-RO.x,at.z-RO.z)):-1;const hit=OB.hit&&OB.hit.f===OB.n0?OB.hit.k:null;OB.log.push({k,w,hit,hp:Math.round(RO.hp??100),wk:!!RO.wk,ch:RO.ch?(RO.ch.t||RO.ch.kind||1):0,p:k==='debris'&&w==='smashCheck'?OB_prop(V3(at.x,0,at.z)):undefined,x:Math.round(RO.x),z:Math.round(RO.z),d,st:state,t:+FL.clk.toFixed(2)});if(OB.log.length>400)OB.log.shift()}
debris=(f=>function(at){OB_rec('debris',at);return f.apply(this,arguments)})(debris);
studBurst=(f=>function(at){OB_rec('stud',at);return f.apply(this,arguments)})(studBurst);
FL_burst=(f=>function(v){OB.sw.push({v,s:FL.s,x:Math.round(RO.x),z:Math.round(RO.z),t:+FL.clk.toFixed(2)});if(OB.sw.length>60)OB.sw.shift();return f.apply(this,arguments)})(FL_burst);
window.__ob=Object.assign(window.__ob||{},{halfW:(x,z)=>{const q=cityAt(x,z);return q?q.road.w/2:6},near:()=>({cars:OB.cm.size,props:OB.pm.size}),get B(){return OB},logOn:v=>{OB.on=v!==false;OB.log=[];OB.sw=[];OB.cm.clear();OB.pm.clear()},get FL(){return FL}});
// ---- fix 1 · auto vehicle switch: wide hysteresis band so road ↔ pavement ↔ grass verge never flips the vehicle.
// leave the road only ≥ OB_LEAVE m past the road edge (pavement, verges, kerbs stay "road"); re-enter at ≤ 2.5 m;
// the new surface must hold for OB_HOLD s AND ≥ OB_DIST m of travel; at least OB_MINHOLD s between switches; never mid-air.
const OB_LEAVE=14,OB_HOLD=.9,OB_DIST=12,OB_MINHOLD=3;
const OB_raw0=FL_raw,OB_terr0=FL_terr;
if(!OB.off)FL_raw=function(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';return FL_road(RO.x,RO.z,FL.s==='road'?OB_LEAVE:2.5)?'road':'dirt'};
if(!OB.off)FL_terr=function(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0;FL.cD=0}FL.cT+=dt;FL.cD=(FL.cD||0)+Math.abs(RO.v)*dt;
    if(FL.cT>=OB_HOLD&&(FL.cD>=OB_DIST||raw==='water')&&FL.hold<=0){FL.s=raw;FL.hold=OB_MINHOLD;FL.cT=0;FL.cD=0}}
  else if(!air){FL.cand=FL.s;FL.cT=0;FL.cD=0}
  return raw};
// ---- fix 2 · contact tests: the old checks were circles (props: r+2.1 m, traffic: 5 m) so passing a lamp, bin or a car in the next lane
// 1–3 m away "smashed" it with a full brick burst. Now: the car's real footprint (oriented box) must touch the prop / the other car's box.
const OB_HW=1.25,OB_HL=2.45;
function OB_touch(px,pz,r,ox=RO.x,oz=RO.z,oh=RO.h){const dx=px-ox,dz=pz-oz,s=Math.sin(oh),c=Math.cos(oh),a=dx*s+dz*c,b=dx*c-dz*s;
  const qa=Math.max(0,Math.abs(a)-OB_HL),qb=Math.max(0,Math.abs(b)-OB_HW);const g=Math.hypot(qa,qb),ok=g<r+.25;if(ok)OB.hit={k:'prop',f:OB.fr};else OB.pm.add(px*7919+pz);return ok||OB.off}
function OB_obb(ax,az,ah,aw,al,bx,bz,bh,bw,bl){const A=[[Math.sin(ah),Math.cos(ah)],[Math.cos(ah),-Math.sin(ah)]],B=[[Math.sin(bh),Math.cos(bh)],[Math.cos(bh),-Math.sin(bh)]],d=[bx-ax,bz-az];
  for(const u of[...A,...B]){const ra=al*Math.abs(A[0][0]*u[0]+A[0][1]*u[1])+aw*Math.abs(A[1][0]*u[0]+A[1][1]*u[1]),rb=bl*Math.abs(B[0][0]*u[0]+B[0][1]*u[1])+bw*Math.abs(B[1][0]*u[0]+B[1][1]*u[1]);if(Math.abs(d[0]*u[0]+d[1]*u[1])>ra+rb+.2)return false}return true}
const OB_cdim=k=>{const n=HCAR[k]||'';return n==='#troll'?[1.4,6]:n==='#scoot'?[.5,1.1]:/truck|delivery|van/.test(n)?[1.3,3.3]:[1.15,2.4]};
function OB_car(x,z,dx,dz,c){const k=c.k,[w,l]=OB_cdim(k),r=OB_obb(RO.x,RO.z,RO.h,OB_HW,OB_HL,x,z,Math.atan2(dx,dz),w,l);if(r)OB.hit={k:'car',f:OB.fr};else OB.cm.add(c);return r||OB.off}
function OB_carP(k,P){const N=HUB.nodes,A=N[k.a],B=N[k.b];const h=A&&B?Math.atan2(B.x-A.x,B.z-A.z):0;const[w,l]=OB_cdim(k.k);return OB_obb(P.x,P.z,P.h??RO.h,OB_HW,OB_HL,k.x,k.z,h,w,l)}
OB.cm=new Set();OB.pm=new Set();OB.fr=0;
// frame counter for the contact flag (a burst is 'with contact' when a contact test passed in the same sim step)
roamStep=(f=>function(dt){OB.fr++;OB.n0=OB.fr;return f.apply(this,arguments)})(roamStep);
