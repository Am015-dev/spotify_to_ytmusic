// terrain-flat-r22d2 (WHY_NOT_2K gap 1, "hills I cannot get out of"): GO why/slopes. The ground change itself is TR9_cap (src/53_terrain_roads.js, ?t9c=0 = old ground); the
// stuck ladder timings are in src/99skh_stuck.js. State asserts only, no graphics.
//   a) grade: 5000 seeded points within 25 m of a street centreline (water edges and pedestrian paths/stairs left out): at most 0.5 % steeper than 20 deg
//   b) wedge: a car put on each > 30 deg slope sample within 120 m of the start, nose uphill, gas held: >= 15 km/h or off the slope (slope < 30 deg) within 3 s
function TF_slope(x,z){const[gx,gz]=TR_grad(x,z,2);return Math.atan(Math.hypot(gx,gz))}
function TF_wet(x,z){try{return WATERS.length&&[[0,0],[7,0],[-7,0],[0,7],[0,-7]].some(([a,b])=>inRiver(x+a,z+b))}catch(e){return false}}
function TF_gradeStat(N=5000){const pts=[];for(const S of CITY_S){if(S.r.cls==='ped')continue;const P=S.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],m=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/10));for(let q=0;q<m;q++)pts.push([a.x+(b.x-a.x)*q/m,a.z+(b.z-a.z)*q/m])}}
  let s=12345;const R=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;let n=0,over=0,mx=0;const bad=[];
  for(let i=0;i<N*2&&n<N;i++){const p=pts[(R()*pts.length)|0],a=R()*6.283,d=R()*25,x=p[0]+Math.cos(a)*d,z=p[1]+Math.sin(a)*d;if(x<WX0+10||x>WX1-10||z<WZS+10||z>WZN-10||TF_wet(x,z))continue;
    let y;try{y=groundY(x,z)}catch(e){continue}if(!(y>-1.5))continue;const t=TF_slope(x,z)*57.3;n++;if(t>mx)mx=t;if(t>20){over++;if(bad.length<4)bad.push(Math.round(x)+','+Math.round(z)+' '+Math.round(t)+'deg')}}
  return{n,over,mx,bad,pts:pts.length}}
function TF_go(){const out=[];let bad=0;const g=TF_gradeStat(),fr=g.over/Math.max(1,g.n);
  if(g.n<4000||fr>.005)bad++;out.push('grade '+g.n+' pts <=25 m of a street: '+g.over+' > 20 deg ('+(fr*100).toFixed(2)+' %), max '+Math.round(g.mx)+' deg'+(g.bad.length?' ['+g.bad.join(' ')+']':'')+(g.n<4000||fr>.005?' FAIL':''));
  const p0=[RO.x,RO.z,RO.h],cx=RO.x,cz=RO.z,cand=[];
  for(let r=8;r<=120;r+=4)for(let a=0;a<6.283;a+=.1){const x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r;let y;try{y=groundY(x,z)}catch(e){continue}if(!(y>-1.5)||TF_wet(x,z))continue;const t=TF_slope(x,z);if(t<.524||t>1.4)continue;if(roamHit(x,z,2.8,y)||!ESC_clear(x,z,y))continue;cand.push([x,z,t])}
  const pick=[];for(const c of cand){if(pick.length>=24)break;if(pick.every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>9))pick.push(c)}
  const had=SKH.q,esc=ESC.q;let slow=0;const rows=[];
  try{for(const[x,z,t]of pick){for(const k in K)K[k]=false;const[gx,gz]=TR_grad(x,z,2),h=Math.atan2(gx,gz);roamWarp(x,z,h);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.y=groundAt(x,z,99);RO.vy=0;RO.v=0;ESC_end();SKH_reset();
      K.ArrowUp=true;let vm=0,off=false;for(let i=0;i<90;i++){roamStep(1/30);vm=Math.max(vm,Math.abs(RO.v)*3.6);if(Math.hypot(RO.x-x,RO.z-z)>3&&TF_slope(RO.x,RO.z)<.524){off=true;break}if(vm>=15)break}
      K.ArrowUp=false;if(!(vm>=15||off)){slow++;if(rows.length<4)rows.push(Math.round(t*57.3)+'deg@'+Math.round(x)+','+Math.round(z)+' '+vm.toFixed(0)+'km/h')}}}
  finally{SKH.q=had;ESC.q=esc;for(const k in K)K[k]=false;SKH_reset();ESC_end();RO.v=0;RO.vy=0;roamWarp(p0[0],p0[1],p0[2]);RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.y=groundAt(p0[0],p0[1],99)}
  if(slow)bad++;out.push(pick.length+' of '+cand.length+' slope samples > 30 deg within 120 m: '+slow+' stuck after 3 s of gas'+(rows.length?' ['+rows.join(' | ')+']':''));
  window.__chk=window.__chk||{};window.__chk.tf={out,bad};
  return'📍 why/slopes · '+CID+' · '+out.join(' · ')+(bad?' → ❌ FAIL':' → ✅ PASS')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'slopes',area:'drive',text:'terrain-flat-r22d2 (WHY_NOT_2K gap 1): no slope steeper than 20 deg within 25 m of a street (0.5 % of 5000 seeded samples allowed: pinned stair/overpass shoulders), and a car put on any > 30 deg slope within 120 m of the start with full gas moves >= 15 km/h or leaves the slope within 3 s; a wedged car backs off after 1.2 s and is put back on the road after 2.5 s. 📍 GO.'});
 __chk.GO['why/slopes']=['fra','ath'].map(c=>({c,n:'slopes '+(c==='fra'?'Frankfurt':'Athens'),secs:60,fn:()=>TF_go()}))},500)}
