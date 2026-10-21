// ===== hud-cam-r22d3 (docs/WHY_NOT_2K.md gaps 6+7, Alex's Athens phone shot: palm/leaf geometry in the foreground, HUD crowding the corners)
// 1) CAMERA CLEAR (roam car camera, Frankfurt + Athens): every frame the props of the 3x3 prop-grid cells around the camera (HUB.pgrid, 16 m cells; ~15 props, no allocations)
//    are tested against (a) the camera sphere swept 0.3 s ahead along its velocity (R = 2.5 m + 0.25 m) and (b) the car -> camera line (cylinder radius + 0.35 m, never the first 3 m
//    next to the car). A blocking prop shrinks to 0 about its base over 0.15 s (plain instanced props) or is hidden at once (asset-system trees: alive:false + AS refill, like FC),
//    and comes back 0.4 s after it stopped blocking. Never snaps the camera. Near clip 2.5 m while the camera is >= 5 m from the car (2 m closer in).
//    ?hc=0 or ?cam=old turns it off. Works with 98fc_foliage_cam.js (crown hiding + wall pull-in), which skips props held here.
// 2) HUD-6 (phone, free roam): always on = speed readout, minimap (<= 12 % of the short screen side), steer pair, GAS, BRAKE, pause. BOOST and the boost bar fade in (150 ms) only
//    when relevant (>= 25 km/h with >= 25 % meter, boosting, drifting). ?hud=full, ?hc=0 or ?dbg=1 restore the old set.
// GO why/cam-clear and why/hud6 (state asserts).
const HC={on:!/[?&](hc=0|cam=old)\b/.test(location.search),hud:!/[?&](hud=full|hc=0|dbg=1)\b/.test(location.search),T:0,F:[],R:2.5,M:.25,look:.3,fade:.15,back:.4,keep:0,
 pc:null,px:0,py:0,pz:0,vx:0,vy:0,vz:0,bT:0,bOn:false,hidden:0,faded:0,steps:0,ms:0,minD:99,Z:new THREE.Matrix4().makeScale(0,0,0),M0:new THREE.Matrix4()};
// extents [r, y0, y1] of a prop (cached before it is ever scaled); null = nothing to hide (no instance)
function HC_ext(p){let c=p._hc;if(c!==undefined)return c;
 const A=window.__as&&__as.A,V=A&&p.av&&A.V&&A.V[p.av];
 if(V&&V.H&&V.rx&&V.cls!=='keep'){const a=p.cvs?p.cvs[0]:1,b=p.cvs?p.cvs[1]:1;return p._hc=[V.rx*a+1.5,p.y,p.y+V.H*b,1]}
 const g=p.im&&p.im.geometry;if(!g||p.i==null||p.im.count<=p.i)return p._hc=null;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;p.im.getMatrixAt(p.i,HC.M0);const e=HC.M0.elements,s=Math.hypot(e[4],e[5],e[6])||1,sx=Math.hypot(e[0],e[1],e[2])||1;
 return p._hc=[Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*.5*sx,p.y+b.min.y*s,p.y+b.max.y*s,0]}
function HC_scale(e){const m=e.m.elements,t=HC.M0.elements,s=e.s;for(let i=0;i<16;i++)t[i]=m[i];t[0]*=s;t[1]*=s;t[2]*=s;t[4]*=s;t[5]*=s;t[6]*=s;t[8]*=s;t[9]*=s;t[10]*=s;
 const im=e.p.im;if(!im||im.count<=e.p.i)return;im.setMatrixAt(e.p.i,HC.M0);im.instanceMatrix.needsUpdate=true}
function HC_drop(i){const e=HC.F[i];e.p._hcE=null;HC.F.splice(i,1)}
function HC_restoreAll(){if(HC.A.length){for(const it of HC.A)it._hc=false;HC.A.length=0;if(typeof AD_fill==='function')try{AD_fill()}catch(e){}}for(let i=HC.F.length-1;i>=0;i--){const e=HC.F[i];if(e.av){if(e.p.alive===false){e.p.alive=true;HC.kick=1}}if(e.p.alive!==false&&e.p.im&&e.p.im.count>e.p.i){e.s=1;HC_scale(e)}HC_drop(i)}if(HC.kick){HC.kick=0;FC_kick()}}
// Athens street dressing (98la_ath_dress.js AD items {t,x,y,z,s}: tree, kiosk, scooter, bollard): not in HUB.props; hidden at once through it._hc (AD_fill skips it) and back 0.4 s after it stopped blocking
const HC_AD=[[1,3.7],[1.7,2.7],[.7,1.5],[.3,.95]];
function HC_adExt(it){let c=it._hx;if(c)return c;const q=HC_AD[it.t]||HC_AD[0],s=it.s||1;return it._hx=[q[0]*s,it.y,it.y+q[1]*s]}
HC.A=[];
function HC_adStep(cx,cy,cz,vx,vy,vz,ox,oy,oz,lx,lz,ll,len){const R=HC.R+HC.M;let ch=0;
 if(typeof AD!=='undefined'&&AD.C&&AD.M&&CID!=='fra'){const kx=Math.floor(cx/40),kz=Math.floor(cz/40);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=AD.C.get((kx+a)*100000+kz+b);if(!l)continue;
   for(let i=0;i<l.length;i++){const it=l[i];if(Math.abs(it.x-cx)>40||Math.abs(it.z-cz)>40)continue;const x=HC_adExt(it);
    let hit=HC_dist(cx,cy,cz,vx,vy,vz,HC.look,it,x)<R;
    if(!hit&&len>5&&x[2]-x[1]>1.2&&ll>1e-6){let u=((it.x-ox)*lx+(it.z-oz)*lz)/ll;u=u<0?0:u>1?1:u;
     if(u*len>=3){const hd=Math.hypot(ox+lx*u-it.x,oz+lz*u-it.z),yy=oy+(cy-oy)*u;if(hd<x[0]*.9+.35&&yy>x[1]-.4&&yy<x[2]+.4)hit=true}}
    if(!hit)continue;if(it._hc){it._hcT=HC.T;continue}
    it._hc=true;it._hcT=HC.T;HC.A.push(it);HC.hidden++;ch=1}}}
 for(let i=HC.A.length-1;i>=0;i--){const it=HC.A[i];if(HC.T-it._hcT>HC.back){it._hc=false;HC.A.splice(i,1);ch=1}}
 if(ch&&typeof AD_fill==='function')try{AD_fill()}catch(e){}}
// distance of the prop's cylinder [r, y0, y1] from the segment c0 -> c0 + v*L (closest horizontal point, its height clamped to the cylinder)
function HC_dist(cx,cy,cz,vx,vy,vz,L,p,x){const ax=vx*L,az=vz*L,q=ax*ax+az*az;let t=q>1e-6?((p.x-cx)*ax+(p.z-cz)*az)/q:0;t=t<0?0:t>1?1:t;
 const dh=Math.hypot(cx+ax*t-p.x,cz+az*t-p.z)-x[0],y=cy+vy*L*t,dy=y<x[1]?x[1]-y:y>x[2]?y-x[2]:0;return Math.hypot(dh>0?dh:0,dy)}
// one frame. c = camera, o = car aim point, dt in s. Returns nothing; HC.F holds the faded props.
function HC_step(dt,cx,cy,cz,ox,oy,oz){const t0=performance.now();HC.T+=dt;HC.steps++;
 let vx=0,vy=0,vz=0;if(HC.pc&&dt>0){vx=(cx-HC.px)/dt;vy=(cy-HC.py)/dt;vz=(cz-HC.pz)/dt;const s=Math.hypot(vx,vy,vz);if(s>80){vx*=80/s;vy*=80/s;vz*=80/s}if(s>2000){vx=vy=vz=0}}
 HC.pc=1;HC.px=cx;HC.py=cy;HC.pz=cz;
 const R=HC.R+HC.M,R2=R*R,lx=cx-ox,lz=cz-oz,ll=lx*lx+lz*lz,len=Math.sqrt(ll+(cy-oy)*(cy-oy));
 const kx=Math.floor(cx/16),kz=Math.floor(cz/16),pg=HUB.pgrid;
 if(pg)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=pg.get((kx+a)*10000+kz+b);if(!l)continue;
  for(let i=0;i<l.length;i++){const p=l[i];const held=p._hcE;if(p.alive===false&&!held)continue;if(!p.im)continue;const x=HC_ext(p);if(!x)continue;
   let hit=HC_dist(cx,cy,cz,vx,vy,vz,HC.look,p,x)<R;
   if(!hit&&len>5&&x[2]-x[1]>1.2&&ll>1e-6){const dx=p.x-ox,dz=p.z-oz;let u=(dx*lx+dz*lz)/ll;u=u<0?0:u>1?1:u;
    if(u*len>=3){const hd=Math.hypot(ox+lx*u-p.x,oz+lz*u-p.z),yy=oy+(cy-oy)*u;if(hd<x[0]*.9+.35&&yy>x[1]-.4&&yy<x[2]+.4)hit=true}}
   if(!hit)continue;
   if(held){held.t=HC.T;continue}
   const e={p,m:new THREE.Matrix4(),s:1,t:HC.T,av:!!x[3]};p.im.getMatrixAt(p.i,e.m);p._hcE=e;HC.F.push(e);HC.hidden++;
   if(e.av){e.s=0;p.alive=false;p.rt=1e9;p.im.setMatrixAt(p.i,HC.Z);p.im.instanceMatrix.needsUpdate=true;HC.kick=1}}}
 // fade
 for(let i=HC.F.length-1;i>=0;i--){const e=HC.F[i],p=e.p;
  if(!e.av&&(p.alive===false||!p.im||p.im.count<=p.i)){HC_drop(i);continue}              // smashed / re-streamed while held: not ours any more
  const want=HC.T-e.t>HC.back?1:0;
  if(e.av){if(want){p.alive=true;HC.kick=1;if(p.im.count>p.i){p.im.setMatrixAt(p.i,e.m);p.im.instanceMatrix.needsUpdate=true}HC_drop(i)}continue}
  const s0=e.s;e.s=want?Math.min(1,e.s+dt/HC.fade):Math.max(0,e.s-dt/HC.fade);
  if(e.s>=1){HC_scale(e);HC_drop(i);continue}
  if(e.s!==s0||e.s<1)HC_scale(e);if(e.s<=0)HC.faded++}
  HC_adStep(cx,cy,cz,vx,vy,vz,ox,oy,oz,lx,lz,ll,len);
 if(HC.kick){HC.kick=0;FC_kick()}
 HC.ms+=performance.now()-t0}
// a prop counts as drawn while it is alive and more than 5 % of its size
function HC_drawn(p){if(p._hx!==undefined)return!p._hc&&!(typeof AD!=='undefined'&&AD.dead.has(p));const e=p._hcE;return p.alive!==false&&(!e||e.s>.05)}
// ---- HUD-6
function HC_boostRel(){const s=pl;if(!s)return false;const kmh=Math.abs(RO.v||0)*3.6;
 return !!(RO.boosting||B2K.bash||B2K.dm>1||(kmh>=25&&s.bm>=25))}
{const st=document.createElement('style');st.id='hcCss';st.textContent=`
body.hc6.touch #tN,body.hc6.touch #b2kM{transition:opacity .15s linear}
body.hc6.touch:not(.hcBoost) #tN,body.hc6.touch:not(.hcBoost) #b2kM{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:opacity .15s linear,visibility 0s linear .15s}
html body.hc6.touch #roamMini#roamMini#roamMini{width:11.9vmin!important;height:11.9vmin!important;border-width:3px!important;box-sizing:border-box!important}
body.hc6.touch #tP{min-width:44px!important;min-height:44px!important;height:44px!important}
@media (orientation:portrait){html body.hc6.touch #roamGauge#roamGauge#roamGauge#roamGauge{top:calc(84px + 11.9vmin + 8px + env(safe-area-inset-top,0px))!important}
 html body.hc6.touch #b2kM#b2kM#b2kM#b2kM{top:calc(84px + 11.9vmin + 8px + 46px + env(safe-area-inset-top,0px))!important}}`;document.head.appendChild(st)}
roamCam=(f=>function(dt){f(dt);
 const b=document.body,hud=HC.hud&&state==='roam'&&!!pl;if(b.classList.contains('hc6')!==hud)b.classList.toggle('hc6',hud);
 if(hud){const r=HC_boostRel();const nw=performance.now();if(r)HC.bT=nw+1000;const on=r||nw<HC.bT;if(on!==HC.bOn){HC.bOn=on;b.classList.toggle('hcBoost',on)}}
 const ok=HC.on&&state==='roam'&&(!RO.foot||RO.foot==='car')&&!(typeof M1!=='undefined'&&M1.cs)&&!!pl;
 if(!ok){if(HC.F.length)HC_restoreAll();HC.pc=null;return}
 try{const c=camera.position,d=Math.hypot(c.x-RO.x,c.z-RO.z),n=d>=5?2.5:2;if(Math.abs(camera.near-n)>.01){camera.near=n;camera.updateProjectionMatrix()}
  HC_step(dt,c.x,c.y,c.z,RO.x,RO.y+1,RO.z)}catch(e){HC.err=String(e)}})(roamCam);
window.__hc=HC;
// ---- GOs
function HC_spots(n){const L=[];const ok=/^(CE_)?(tree\d?|bush|pine|cypress|olive|plane|palm|lamp|sign|post|stop|tlight)$/;for(const p of HUB.props)if(p.im&&p.i!=null&&p.alive!==false&&ok.test(p.t)){const x=HC_ext(p);if(x&&x[2]-x[1]>1.8)L.push(p)}
 const out=[],st=Math.max(1,Math.floor(L.length/n)),cx=RO.x,cz=RO.z;for(let i=Math.floor(st/2);i<L.length&&out.length<n;i+=st)out.push(L[i]);
 if(typeof AD!=='undefined'&&AD.C&&CID!=='fra'){const T=[];for(const l of AD.C.values())for(const it of l)if(it.t===0||it.t===1)T.push(it);const m=Math.min(6,T.length),d=Math.max(1,Math.floor(T.length/Math.max(m,1)));out.length=Math.min(out.length,n-m);for(let i=0,j=0;j<m;i+=d,j++)out.push(T[i])}   // Athens: street-dressing trees/kiosks are not HUB props
 return out}
async function HC_goCam(){const R=[],ck=(m,b)=>R.push((b?'✓ ':'✗ ')+m);
 if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 const cam=camera.position,c0=cam.clone(),sv={near:camera.near,hc:HC.on,pc:HC.pc};HC.on=true;HC_restoreAll();
 const spots=HC_spots(20);let line=0,lineMs=[],close=0,worst=99,pass=0,tn=0,who='';
 try{for(const p of spots){const H=((spots.indexOf(p)*37)%360)*Math.PI/180,fx=Math.sin(H),fz=Math.cos(H);
   // (1) the prop sits on the car -> camera line, 5 m behind the car (camera 9 m behind): hidden within 0.3 s
   HC_restoreAll();HC.pc=null;HC.T+=10;const oy=p.y+1,cy=p.y+3.6;let hid=-1;
   const ox2=p.x-fx*5,oz2=p.z-fz*5,cx2=p.x+fx*4,cz2=p.z+fz*4;   // car 5 m on one side of the prop, camera 4 m on the other
   for(let k=0;k<18;k++){HC_step(1/60,cx2,cy,cz2,ox2,oy,oz2);if(hid<0&&!HC_drawn(p))hid=k+1}
   const pulled=hid>0&&hid<=18;if(pulled)line++;lineMs.push(hid);
   // (2) the camera drives straight through the prop at 30 m/s (0.5 m/frame): no frame with a drawn prop closer than 2.5 m (sphere to the prop's cylinder)
   HC_restoreAll();HC.pc=null;let bad=0,md=99;const sp=30,dtf=1/60;
   for(let k=0;k<110;k++){const px=p.x-fx*(25-k*sp*dtf),pz=p.z-fz*(25-k*sp*dtf),py=p.y+3;HC_step(dtf,px,py,pz,px-fx*9,py-2.5,pz-fz*9);
    const kx=Math.floor(px/16),kz=Math.floor(pz/16);tn++;const cnt=k>=10;   // the first 10 frames (0.17 s) are the 0.15 s fade of anything that sits at the camera's start point
    if(typeof AD!=='undefined'&&AD.C&&CID!=='fra'){const ax=Math.floor(px/40),az=Math.floor(pz/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=AD.C.get((ax+a)*100000+az+b);if(!l)continue;for(const q of l){if(Math.abs(q.x-px)>30||Math.abs(q.z-pz)>30||!HC_drawn(q))continue;const d=HC_dist(px,py,pz,0,0,0,0,q,HC_adExt(q));if(d<md)md=d;if(d<2.5&&cnt){bad++;who='AD'+q.t+' d'+d.toFixed(2)+' f'+k}}}}
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=HUB.pgrid.get((kx+a)*10000+kz+b);if(!l)continue;for(const q of l){if(!q.im||!HC_drawn(q))continue;const e=HC_ext(q);if(!e)continue;const d=HC_dist(px,py,pz,0,0,0,0,q,e);if(d<md)md=d;if(d<2.5&&cnt){bad++;who=q.t+' al'+q.alive+' h'+!!q._hcE+' d'+d.toFixed(2)+' f'+k+' i'+q.i+'/'+(q.im&&q.im.count)+' y'+(e[1]-py).toFixed(1)+'..'+(e[2]-py).toFixed(1)+' r'+e[0].toFixed(1)+' av'+e[3]}}}}
   if(md<worst)worst=md;close+=bad;if(!bad)pass++;HC_restoreAll()}
 }catch(e){R.push('✗ threw '+e)}
 finally{HC_restoreAll();HC.on=sv.hc;HC.pc=null;cam.copy(c0);camera.near=sv.near;camera.updateProjectionMatrix()}
 ck('line test: '+line+'/'+spots.length+' blocking props faded/hidden within 0.3 s (frames '+lineMs.join(',')+')',spots.length>=15&&line===spots.length);
 ck('fly-through at 30 m/s: '+pass+'/'+spots.length+' spots with no drawn prop < 2.5 m (closest drawn '+worst.toFixed(2)+' m, '+close+' violations in '+tn+' frames'+(who?' e.g. '+who:'')+')',close===0&&spots.length>=15);
 ck('cost '+(HC.steps?(HC.ms/HC.steps).toFixed(3):0)+' ms/frame (<0.3)',HC.steps===0||HC.ms/HC.steps<.3);
 const ok=R.every(r=>r[0]==='✓');return'📍 why/cam-clear · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
async function HC_goHud(){const R=[],ck=(m,b)=>R.push((b?'✓ ':'✗ ')+m),W=ms=>new Promise(r=>setTimeout(r,ms));
 if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';if(!HC.hud)return'📍 HUD-6 is off (?hud=full)';
 const w0=innerWidth,h0=innerHeight,sv={v:RO.v,bm:pl.bm,ch:RO.ch,wp:RO.wp};
 const sizes=[[393,852],[852,393]];let fadeOk=true;
 try{RO.ch=null;RO.wp=null;RO.v=0;pl.bm=100;
  for(const [w,h] of sizes){if(typeof window.__vp==='function'){await window.__vp(w,h);await W(500)}
   const o=innerWidth+'x'+innerHeight,short=Math.min(innerWidth,innerHeight);if(innerWidth!==w&&innerHeight!==h&&typeof window.__vp==='function')ck(o+' viewport',false);
   RO.v=0;await W(400);                                                                   // standing: nothing boost-ish
   const ids=FD.hud(),groups=ids.filter(i=>i!=='tR');
   ck(o+' always-on '+groups.length+' (steer pair = 1) ['+ids.join(' ')+'] <= 6',groups.length<=6&&!ids.includes('tN')&&!ids.includes('b2kM'));
   const mm=document.getElementById('roamMini'),mr=mm.getBoundingClientRect();
   ck(o+' minimap '+Math.round(mr.width)+' px = '+(mr.width/short*100).toFixed(1)+' % of '+short+' (<= 12 %)',mr.width<=short*.12+.6);
   const bad=[];for(const id of['tL','tR','tG','tB'])if(FD.vis(document.getElementById(id))){const r=document.getElementById(id).getBoundingClientRect();if(Math.min(mr.right,r.right)-Math.max(mr.left,r.left)>1&&Math.min(mr.bottom,r.bottom)-Math.max(mr.top,r.top)>1)bad.push(id)}
   ck(o+' minimap clear of the steering/GAS/BRAKE zone'+(bad.length?' (covers '+bad.join(',')+')':''),!bad.length);
   const sm=[],tiny=[];for(const id of['tL','tR','tG','tB','tP']){const e=document.getElementById(id);if(!e||!FD.vis(e))continue;const r=e.getBoundingClientRect();if(r.width<44||r.height<44)tiny.push(id+' '+Math.round(r.width)+'x'+Math.round(r.height))}
   ck(o+' touch targets >= 44 px'+(tiny.length?' ('+tiny.join(', ')+')':''),!tiny.length);
   for(const e of document.querySelectorAll('#roamGauge *,#tL,#tR,#tG,#tB,#tP,#tN'))if(e.children.length===0&&(e.textContent||'').trim().length>1&&FD.vis(e)&&parseFloat(getComputedStyle(e).fontSize)<12)sm.push((e.id||e.className||e.tagName)+' '+getComputedStyle(e).fontSize);
   ck(o+' HUD text >= 12 px'+(sm.length?' ('+sm.join(', ')+')':''),!sm.length);
   // relevant: fast and charged -> BOOST + bar fade in within 150 ms (+1 frame)
   let on=[];for(let k=0;k<20&&!(on.includes('tN')&&on.includes('b2kM'));k++){RO.v=22;pl.bm=100;await W(150);on=FD.hud()}ck(o+' driving 79 km/h charged: boost + bar visible ['+on.join(' ')+']',on.includes('tN')&&on.includes('b2kM'));
   let off=on;for(let k=0;k<30&&(off.includes('tN')||off.includes('b2kM'));k++){RO.v=0;pl.bm=100;await W(150);off=FD.hud()}ck(o+' stopped again: boost + bar gone',!off.includes('tN')&&!off.includes('b2kM'));
   const t=document.getElementById('tN'),cs=getComputedStyle(t);fadeOk=fadeOk&&/0\.15s/.test(cs.transitionDuration||'');}
  ck('boost fade is 150 ms',fadeOk)
 }catch(e){R.push('✗ threw '+e)}
 finally{RO.v=sv.v;pl.bm=sv.bm;RO.ch=sv.ch;RO.wp=sv.wp;if(typeof window.__vp==='function'&&(innerWidth!==w0||innerHeight!==h0))await window.__vp(w0,h0)}
 const ok=R.every(r=>r[0]==='✓');return'📍 why/hud6 · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'cam-clear',area:'cam',text:'hud-cam-r22d3 (WHY_NOT_2K gap 7): the chase camera never has a prop (vegetation, lamp, sign, pole) between it and the car, and no prop is drawn closer than 2.5 m to the camera: a blocking prop shrinks away in 0.15 s (asset-system trees hide at once), the camera is never snapped. 📍 GO at 20 spots in each city: line test + 30 m/s fly-through.'},
  {ver:'why',id:'hud6',area:'ui',text:'hud-cam-r22d3 (WHY_NOT_2K gap 6): phone free-roam HUD = speed, minimap (<= 12 % of the short side), steer pair, GAS, BRAKE, pause (6 groups); BOOST + boost bar fade in (150 ms) only when relevant. ?hud=full restores the old set. 📍 GO at 393x852 and 852x393.'});
 __chk.GO['why/cam-clear']=['fra','ath'].map(c=>({c,n:'cam-clear '+(c==='fra'?'Frankfurt':'Athens'),secs:30,fn:()=>HC_goCam()}));
 __chk.GO['why/hud6']=['fra','ath'].map(c=>({c,n:'hud-6 '+(c==='fra'?'Frankfurt':'Athens'),secs:30,fn:()=>HC_goHud()}))},500)}
