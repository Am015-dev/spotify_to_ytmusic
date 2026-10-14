// tools/matrix/page.js: injected into the warm hot page (window.__hot = eval in the game's module scope). Defines window.MX: generated player-experience cases,
// each asserted from STATE in a few ms (no real time, no drawing). Every check has an id; a case result = {fam, tag, fails:[ids]}.
(()=>{
const D2R=Math.PI/180,ang=(ax,az,bx,bz)=>{const a=Math.hypot(ax,az),b=Math.hypot(bx,bz);if(a<1e-6||b<1e-6)return 180;return Math.acos(Math.max(-1,Math.min(1,(ax*bx+az*bz)/(a*b))))/D2R};
const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.width<2||r.height<2)return null;return r};
const ovl=(a,b)=>!(a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1);
const VW=()=>({w:innerWidth,h:innerHeight});
// HUD: required controls for the profile exist, are visible, inside the viewport, not overlapping each other
function hud(ids,fails,pre){const rs={},V=VW();for(const id of ids){const e=document.getElementById(id),r=vis(e);if(!r){fails.push(pre+'hud-missing-'+id);continue}
  rs[id]=r;if(r.left<-1||r.top<-1||r.right>V.w+1||r.bottom>V.h+1)fails.push(pre+'hud-offscreen-'+id)}
 const k=Object.keys(rs);for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++)if(ovl(rs[k[i]],rs[k[j]]))fails.push(pre+'hud-overlap-'+k[i]+'-'+k[j])}
const R=[];const MX={R,prof:'phone',ang,hud,
 reset(){R.length=0},
 async setRide(id){TQ.car=id;gbOpen();GAR_select(id);let k=0;while(typeof LDL!=='undefined'&&LDL.wait.size&&k++<200)await new Promise(r=>setTimeout(r,25));gbClose(true);await new Promise(r=>setTimeout(r,20));
  if(typeof BX!=='undefined'){try{if(BX.mode==='drive')BX_driveStop()}catch(e){}try{if(BX.car&&BX.car.parent)BX.car.parent.remove(BX.car)}catch(e){}BX.car=null}return id},
 // ---------------- builder tracks ----------------
 bxLap(demo,prof,rid,maxS){const fails=[],t0=performance.now(),info={};
  try{if(BX.name!==demo||!BX.pcs.length){if(!BX.on)BX_open();BX_load(BX_DEMOS[demo],demo)}
   const touch=prof!=='desktop';BX.keys={};BX.tc={};BX.touch=touch;BX_driveStart();const V=BX.v,m=BX.m,sm=BX.samp,n=sm.length;let ci=0,back=0,maxI=0,N=Math.round((maxS||150)*120);
   if(!touch)BX.keys.ArrowUp=true;
   for(let i=0;i<N;i++){let best=1e9,bj=ci;for(let j=ci;j<Math.min(n,ci+40);j++){const q=sm[j].s.p,d=(q.x-V.p.x)**2+(q.y-V.p.y)**2*.2+(q.z-V.p.z)**2;if(d<best){best=d;bj=j}}ci=bj;maxI=Math.max(maxI,ci);
    const T=sm[Math.min(n-1,ci+7)].s.p,S=new THREE.Vector3().crossVectors(V.F,V.U).normalize(),lat=(T.x-V.p.x)*S.x+(T.z-V.p.z)*S.z;const inp=BX_input();inp.s=Math.max(-1,Math.min(1,lat/5));
    BX_step(1/120,inp);if(V.v.dot(V.F)<-1)back+=1/120;if(m.laps>=1&&!info.t1){info.t1=m.t}if(m.laps>=(BX_RACE_LAPS||2))break}
   info.back=+back.toFixed(2);info.resp=m.resp;info.why=m.respWhy.join(',');info.wall=m.wall;info.cp=V.cpN;info.laps=m.laps;info.prog=+(maxI/n).toFixed(2);info.t=+m.t.toFixed(1);
   if(back>.5)fails.push('bx-lap-drives-backwards');if(m.laps<1&&maxI<n*.93)fails.push('bx-lap-incomplete');if(m.resp>3)fails.push('bx-lap-many-respawns');BX.keys={}
  }catch(e){fails.push('bx-crash:'+String(e).slice(0,60))}
  R.push({fam:'builder-lap',tag:demo+'|'+prof+'|'+rid,fails,info,ms:performance.now()-t0});return info},
 bxFrame(){const V=BX.v;BX.car.position.copy(V.p);const S=new THREE.Vector3().crossVectors(V.F,V.U).normalize();BX.car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(S.negate(),V.U,V.F));BX.car.updateMatrixWorld(true)},
 bxCase(demo,prof,rid){const fails=[],t0=performance.now();
  try{
   if(BX.name!==demo||!BX.pcs.length){if(!BX.on)BX_open();BX_load(BX_DEMOS[demo],demo)}
   const touch=prof!=='desktop';BX.keys={};BX.tc={};BX.touch=touch;
   BX_driveStart();const V=BX.v,L=BX.pcs.filter(p=>!p.dead),st=L.find(p=>p.def.start)||L[0],S0=st.S[0],a=S0[0].p,b=S0[S0.length-1].p,F0=V.F.clone(),p0=V.p.clone();
   // spawn heading = start piece's path tangent
   if(ang(F0.x,F0.z,b.x-a.x,b.z-a.z)>20)fails.push('bx-heading-vs-path');
   // the DRAWN car faces where it drives (mesh forward = +z of the ride's own frame; BX.cyaw rotates it)
   MX.bxFrame();{const m=BX.carM.userData.m||BX.carM;m.updateMatrixWorld(true);const wd=new THREE.Vector3(0,0,-1).transformDirection(m.matrixWorld);/* roam builds the ride with its FRONT on local -z (roamPose: basis(right,up,-fwd)) */if(ang(wd.x,wd.z,F0.x,F0.z)>20)fails.push('bx-visual-facing')}
   try{BX_tick(performance.now()+16)}catch(e){fails.push('bx-tick-throws')}
   {const c=BX.cam.position,dx=c.x-V.p.x,dz=c.z-V.p.z,h=Math.hypot(dx,dz);if(!(h>2&&(dx*F0.x+dz*F0.z)/h<-.5))fails.push('bx-camera-behind');if(!(c.y>V.p.y-.5))fails.push('bx-camera-below')}
   const kb=prof==='desktop';if(kb)BX.keys.ArrowUp=true;
   let minVf=1e9,g=0,N=240;for(let i=0;i<N;i++){BX_step(1/120,BX_input());const vf=V.v.dot(F0);if(i>60)minVf=Math.min(minVf,vf);if(V.g)g++}
   const prog=V.p.clone().sub(p0).dot(F0);if(!(prog>5))fails.push('bx-no-forward-progress');if(minVf<-1)fails.push('bx-reverses');if(BX.m.resp>0)fails.push('bx-respawned-in-2s');if(g<N*.6)fails.push('bx-not-grounded');
   // after the run the car still faces its travel direction
   {const vh=V.v.clone();vh.y=0;if(vh.length()>3&&ang(vh.x,vh.z,V.F.x,V.F.z)>35)fails.push('bx-travel-vs-facing')}
   BX.keys={};
   // HUD for the profile (phone/portrait: the ◀ ▶ BRAKE pad + respawn + back; desktop: back + respawn)
   hud(touch?['bxL','bxR','bxB','bxRsp','bxBack']:['bxRsp','bxBack'],fails,'bx-')
  }catch(e){fails.push('bx-crash:'+String(e).slice(0,60))}
  R.push({fam:'builder',tag:demo+'|'+prof+'|'+rid,fails,ms:performance.now()-t0});return fails.length},
};
window.MX=MX;return 'MX ready'})()
