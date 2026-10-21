// stuck-hills-r22h (Alex, Athens: "hills that I can not get out of"): a universal stuck ladder that does not care where the car is (the escape ladder in 98esc_escape.js only runs
// OFF the road, 3 m beyond the road edge, so a wedge between a slope and a building next to a road never started).
//   STUCK = free roam, gas or boost held, ground speed (real position change, not the wheel speed) < 1 m/s, on the ground, for 2.5 s.
//   1) 2.5 s: reverse-assist, a 1 s push at 7 m/s backwards (along the line away from the blocker; a blocked direction tries +-45 deg), once per episode.
//   2) 5 s: soft re-place = the same lift as the R button (ESC_lift), with the note BACK ON THE ROAD {must:1} (shown even under the popup governor).
//   3) steep slope (> 35 deg, not a deck) with a standing car: slide it down the fall line 4 m/s; if a wall blocks that, along the wall (+-60 deg).
// Nothing runs unless the car is nearly standing with gas held, so a normal drive is unchanged. ?stk=0 switches it off.
const SKH={q:new URLSearchParams(location.search).get('stk')!=='0',t1:2.5,t2:5,v:1,slope:.61,cnt:{rev:0,lift:0,slide:0},t:0,rv:0,px:null,pz:null,done1:0};
/* the note is a body-level pill (#hud is hidden in roam, so say() never showed it): top centre below the quest pills, 14 px, auto-hides after 3 s */
function SKH_note(txt){let d=document.getElementById('skhNote');if(!d){d=document.createElement('div');d.id='skhNote';d.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 196px);transform:translateX(-50%);z-index:58;pointer-events:none;font:800 14px system-ui,sans-serif;padding:9px 16px;border-radius:10px;border:1px solid #5dffb0;background:rgba(7,24,39,.92);color:#5dffb0;white-space:nowrap;max-width:92vw;transition:opacity .25s';document.body.appendChild(d)}
  d.textContent=txt;d.style.display='block';d.style.opacity='1';clearTimeout(SKH_note.q);SKH_note.q=setTimeout(()=>{d.style.opacity='0';SKH_note.q=setTimeout(()=>{d.style.display='none'},300)},3000);return d}
function SKH_vis(){const d=document.getElementById('skhNote');if(!d)return false;const r=d.getBoundingClientRect(),s=getComputedStyle(d);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility==='visible'&&+s.opacity>0&&parseFloat(s.fontSize)>=12&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth}
function SKH_ok(){return !!pl&&state==='roam'&&RO.on!==false&&!RO.sp&&!RO.wk&&!RO.card&&!RO.mapOpen&&!RO.frozen&&!RO.ch&&RO.veh!=='boat'&&!RO.dDir}
function SKH_reset(){SKH.t=0;SKH.rv=0;SKH.done1=0;SKH.px=null}
function SKH_dir(h){for(const d of[0,.785,-.785,1.57,-1.57]){const a=h+d,x=RO.x+Math.sin(a)*4,z=RO.z+Math.cos(a)*4;if(!roamHit(x,z,2.2,RO.y)&&!roamTerr(x,z,RO.y+.3).low)return a}return h}
function SKH_pre(dt){
  if(!SKH.q||!SKH_ok()||!CTL||!(CTL.thr||CTL.boost)){SKH_reset();return}
  const T=roamTerr(RO.x,RO.z,RO.y+.3,_rtA);if(RO.y>T.g+.5){SKH_reset();return}
  if(SKH.px==null){SKH.px=RO.x;SKH.pz=RO.z;return}
  const g=Math.hypot(RO.x-SKH.px,RO.z-SKH.pz)/Math.max(dt,1e-3);SKH.px=RO.x;SKH.pz=RO.z;
  if(g*dt>8){SKH_reset();return}   // a warp
  if(g>=SKH.v){SKH.t=Math.max(0,SKH.t-dt*2);if(SKH.t<=0)SKH_reset();return}
  SKH.t+=dt;
  if(SKH.t>=SKH.t2){if(ESC_lift('reset','stuck')){SKH.cnt.lift++;say('','BACK ON THE ROAD',1,{must:1});SKH_note('BACK ON THE ROAD');SKH_reset()}return}
  if(SKH.t>=SKH.t1&&!SKH.done1){SKH.done1=1;SKH.cnt.rev++;SKH.rv=1;const th=Math.atan2(Math.sin(RO.vh??RO.h),Math.cos(RO.vh??RO.h));SKH.rh=SKH_dir(th+Math.PI)}
  if(SKH.rv>0){SKH.rv-=dt;RO.v=-7;const a=SKH.rh,x=RO.x+Math.sin(a)*7*dt,z=RO.z+Math.cos(a)*7*dt;if(!roamHit(x,z,2.2,RO.y)){RO.x=x;RO.z=z}}
}
function SKH_post(dt){
  if(!SKH.q||!SKH_ok()||SKH.t<=0||RO.trDeck)return;
  const[gx,gz]=TR_grad(RO.x,RO.z,2),s=Math.hypot(gx,gz);if(Math.atan(s)<SKH.slope||s<1e-6)return;
  const fx=-gx/s,fz=-gz/s;let ok=false;
  for(const d of[0,1.05,-1.05]){const c=Math.cos(d),n=Math.sin(d),dx=(fx*c-fz*n)*4*dt,dz=(fx*n+fz*c)*4*dt;if(!roamHit(RO.x+dx,RO.z+dz,2.2,RO.y)){RO.x+=dx;RO.z+=dz;ok=true;break}}
  if(ok)SKH.cnt.slide++}
{const _rs=roamStep;roamStep=dt=>{try{SKH_pre(dt)}catch(e){}_rs(dt);try{SKH_post(dt)}catch(e){}}}
// GO stuck/hills: a car pinned on a > 35 deg slope with the gas held (the pin stands in for the wedge: the car is put back on its spot every frame until a recovery happens) must be free within 6 s,
// and the reverse-assist must have fired first
function SKH_go(){const out=[];let bad=0;const cand=[];const B=[WX0+80,WX1-80,WZS+80,WZN-80];
  for(let x=B[0];x<B[1];x+=11)for(let z=B[2];z<B[3];z+=11){let g;try{g=groundY(x,z)}catch(e){continue}if(!(g>-1.5))continue;const[gx,gz]=TR_grad(x,z,2);const th=Math.atan(Math.hypot(gx,gz));if(th<.62||th>1.3)continue;if(roamHit(x,z,2.8,g)||!ESC_clear(x,z,g))continue;cand.push([x,z,th,gx,gz,TR8_onRoad(x,z)?0:1])}
  cand.sort((a,b)=>a[5]-b[5]||b[2]-a[2]);const pick=[];for(const c of cand){if(pick.length>=3)break;if(pick.every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>120))pick.push(c)}
  const p0=[RO.x,RO.z,RO.h],had=SKH.q,esc=ESC.q,sy=say,notes=[];say=function(a,b,t,o){notes.push([b,o&&o.must]);return sy.apply(this,arguments)};
  try{for(const[x,z,th,gx,gz,off]of pick){for(const k in K)K[k]=false;const h=Math.atan2(gx,gz);roamWarp(x,z,h);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.y=groundAt(x,z,99);RO.vy=0;RO.v=0;ESC_end();SKH_reset();
    const c0={...SKH.cnt},n0=RO.t6n||0;notes.length=0;K.ArrowUp=true;let tr=null,tl=null;
    for(let i=0;i<8*30;i++){const t=(i+1)/30;if(tr==null&&SKH.cnt.rev>c0.rev)tr=t;if((RO.t6n||0)===n0){RO.x=x;RO.z=z;RO.v=Math.min(RO.v,1)}else{tl=t;break}roamStep(1/30)}
    K.ArrowUp=false;const free=tl!=null&&tl<=6.2,moved=Math.hypot(RO.x-x,RO.z-z),rev=tr!=null&&tr<=3.1,note=notes.some(n=>n[0]==='BACK ON THE ROAD'&&n[1]);
    const mine=SKH.cnt.lift>c0.lift,ok=free&&(mine?rev&&note:true);if(!ok)bad++;out.push((off?'off':'road')+' '+Math.round(th*57.3)+'deg free '+(tl&&tl.toFixed(1))+'s rev '+(tr&&tr.toFixed(1))+'s note '+note+(ok?'':' FAIL'))}
   SKH_note('BACK ON THE ROAD');const vis=SKH_vis();if(!vis)bad++;out.push('note '+(vis?'visible':'NOT VISIBLE FAIL'))}
  finally{say=sy;SKH.q=had;ESC.q=esc;for(const k in K)K[k]=false;SKH_reset();ESC_end();RO.v=0;RO.vy=0;roamWarp(p0[0],p0[1],p0[2]);RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.y=groundAt(p0[0],p0[1],99);const nd=document.getElementById('skhNote');if(nd)nd.style.display='none'}
  window.__chk=window.__chk||{};window.__chk.skh={out,bad};
  return'📍 STUCK ON HILLS · '+pick.length+' wedges on >35 deg slopes in '+CID+', gas held: '+out.join(' | ')+(pick.length<1?' · no slope found':'')+(bad||!pick.length?' ❌':' ✅')}
function SKH_rows(GO,goSay,CK){CK.push({ver:'stuck',id:'hills',area:'drive',text:'stuck-hills-r22h:2026-10-21 · a car wedged on a steep hill (> 35 deg, next to a road, building or wall) with the gas held always gets out: after 2.5 s without moving it backs off, after 5 s it is put back on the road with a BACK ON THE ROAD note (works on and beside the road, free roam). 📍 GO pins the car on 3 steep slopes of this city with full gas. Pass line: recovered within 6 s each, when the stuck ladder does the lift: reverse-assist within 3.1 s and a must-show note shown in a visible pill (>= 12 px, in view) (off the road the older escape ladder may get there first).'});
 for(const c of['fra','ath'])(GO['stuck/hills']=GO['stuck/hills']||[]).push({c,n:'stuck hills '+(c==='fra'?'Frankfurt':'Athens'),secs:60,fn:()=>SKH_go()})}

