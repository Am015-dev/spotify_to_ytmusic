// traffic-in-view-r22e15 (2026-10-22, BUGHUNT_x1000 §4.3, rows #4 #6 #11 #14): traffic never slides sideways or teleports while the player can see it.
// One rule on the DRAWN pose. HT_pose is the only place a traffic car is drawn, whoever moved its a/b/t or x/z in between (junction hand-offs, CV routes,
// recycle, RD_unstack, yield dodges). Within IV.r m of the camera (60 m around the player), or in the view frustum, a car moves at most v·dt + IV.sl m along its heading and IV.lat m/s
// sideways in one step; it closes the rest towards its pose at that rate. A gap it cannot close (> IV.tp m: recycle, respawn, a re-route back to a node) on a spot
// the player can see (HT_canPop false) is hidden in that frame and the car respawns out of sight (c.dead → HT_dead → HT_place), so a recycle shows only behind the camera.
// Cars touching the player (< 8 m, hitT, tumble) keep their physical shove. ?iv=0 = off. GO: why/traffic-inview (fra + ath).
const IV={on:!/[?&]iv=0/.test(location.search),r:70/* 60 m around the player + the chase-camera offset */,sl:.5,so:1.5,lat:2.5,tp:20,n:{cl:0,hide:0,snap:0},wT:-1,lt:null,lx:0,lz:0,ft:-1,fm:new THREE.Matrix4(),fr:new THREE.Frustum()},_ivM=new THREE.Matrix4(),_ivZ=new THREE.Matrix4().makeScale(0,0,0);
function IV_zone(x,z,y){const C=camera.position,d2=(x-C.x)**2+(z-C.z)**2;if(d2<IV.r*IV.r)return true;if(d2>62500)return false;/* traffic-pop-r25h: the view frustum is the camera's own, every frame. It used to be HT_POP.f, which only exists with the traffic law ON (default OFF), so beyond 70 m no car counted as seen: a 6-9 m junction hand-off step was closed at the out-of-sight 1.5 m per frame (90 m/s) on cars 60-250 m away, in plain view */if(IV.ft!==T){IV.ft=T;camera.updateMatrixWorld();IV.fm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);IV.fr.setFromProjectionMatrix(IV.fm)}HT_PS.center.set(x,(y||0)+1,z);return IV.fr.intersectsSphere(HT_PS)}
function IV_each(im,fn){if(!im)return;fn(im);if(im.userData.w)fn(im.userData.w);if(im.userData.g)fn(im.userData.g)}
function IV_hide(c,im){IV_each(im,m=>m.setMatrixAt(c.j,_ivZ));c.dead=.3;c.ivx=null;IV.n.hide++;return 1}
function IV_guard(c,A,B,gA,im){const x=c.x,z=c.z,ox=c.ivx,oz=c.ivz;let el=T-c.ivT;
 if(ox==null||IV.wT>=c.ivT)return;/* first pose, or the player warped since: nothing drawn to slide from */const gx=x-ox,gz=z-oz,g=Math.hypot(gx,gz);
 if(!(el<.6&&el>-1e-6)){if(g>IV.tp&&!HT_canPop(x,z,c.y))return IV_hide(c,im);return}/* after a gap (pose skipped while far: c.x went stale) a car may not reappear in sight */el=Math.max(el,1/60);
 const v=Math.abs(c.cv||0);let sl=Math.min(IV.sl,Math.max(1.5,.5*v)*el),lm=IV.lat*el;if(g<.02)return;let hx=c.hdx,hz=c.hdz;const hm=Math.hypot(hx||0,hz||0);if(!(hm>.5)){hx=gx/g;hz=gz/g}else{hx/=hm;hz/=hm}
 const a0=gx*hx+gz*hz,l0=gz*hx-gx*hz;if(g<=IV.tp&&a0>=-sl&&a0<=v*el+sl&&Math.abs(l0)<=lm)return;/* already inside the rule */
 if((x-RO.x)**2+(z-RO.z)**2<64||c.hitT>0||c.crW)return;/* a shove from the player is physics */
 const vis=IV_zone(x,z,c.y)||IV_zone(ox,oz,c.y);if(g>IV.tp){if(vis&&!HT_canPop(x,z,c.y))return IV_hide(c,im);IV.n.snap++;return}/* a recycle out of sight snaps */
 if(!vis){sl=Math.max(sl,IV.so);lm=Math.max(lm,IV.so)}/* out of sight it still closes, 1.5 m a step: a lag snapped as the camera turned away was a 7-13 m step when it turned back (why/solid-cars d) */
 const a=Math.max(-sl,Math.min(v*el+sl,a0)),l=Math.max(-lm,Math.min(lm,l0)),nx=ox+a*hx-l*hz,nz=oz+a*hz+l*hx,sx=nx-x,sz=nz-z;
 const y=A.ab||gA?groundAt(nx,nz,(c.y||0)+4):groundY(nx,nz),sy=isFinite(y)&&Math.abs(y-c.y)<3?y-c.y:0;
 IV_each(im,m=>{m.getMatrixAt(c.j,_ivM);const e=_ivM.elements;e[12]+=sx;e[13]+=sy;e[14]+=sz;m.setMatrixAt(c.j,_ivM)});c.x=nx;c.z=nz;c.y+=sy;IV.n.cl++}
HT_pose=(f=>function(c,A,B,dx,dz,gA,W,dt,im){const r=f.apply(this,arguments);if(T!==IV.lt&&typeof camera!=='undefined'){const P=camera.position;if(IV.lt!=null&&Math.hypot(P.x-IV.lx,P.z-IV.lz)>50)IV.wT=T;/* fast travel / warp: every car is new to the eye */IV.lt=T;IV.lx=P.x;IV.lz=P.z}if(IV.on&&!c.pk&&!c.tr&&im&&typeof camera!=='undefined'){let h=0;try{h=IV_guard(c,A,B,gA,im)}catch(e){}if(h)return r}c.ivx=c.x;c.ivz=c.z;c.ivT=T;return r})(HT_pose);
// GO why/traffic-inview: a live car in front of the camera is forced through the three bughunt cases in one step each and must obey the rule while drawn:
// a 9 m jump along its lane (fra start-junction hand-off), a 3 m sideways jump (Athens slide), a teleport onto a visible spot 30 m ahead (recycle into view).
function IV_go(){const R=[],ck=(n,b)=>R.push((b?'✓ ':'✗ ')+n),dt=1/30,N=HUB.nodes;const step=()=>{T+=dt;HT_popF();HT_cars(N,dt)};
 /* flake-kill: put a car on a road node 18-46 m from the camera and >= 16 m from the player (the guard leaves a car within 8 m of the player to physics; a car that drove past you during the settle steps is not testable) */
 const placeCar=(o,st,k0)=>{const C=camera.position,L=[];for(let i=0;i<N.ng;i++){const n=N[i];if(!n||!n.nb||!n.nb.length||n.ab)continue;const d=Math.hypot(n.x-C.x,n.z-C.z);if(d<(st?12:18)||d>(st?50:46)||Math.hypot(n.x-RO.x,n.z-RO.z)<16)continue;if(st){const Q=N[n.nb[0]];if(!Q||Q.ab||Math.hypot(Q.x-n.x,Q.z-n.z)<30)continue}L.push([d,i])}
  L.sort((p,q)=>p[0]-q[0]);for(let k=k0|0;k<Math.min((k0|0)+6,L.length);k++){const nb=L[k][1],n=N[nb];o.pk=0;o.tr=0;o.dz=0;o.route=null;o.dead=0;o.ivx=null;o.a=nb;o.b=n.nb[0];o.t=.1;o.v=o.cv=6;const Q=N[o.b]||n;o.x=n.x+(Q.x-n.x)*.1;o.z=n.z+(Q.z-n.z)*.1;o.y=n.y||o.y;for(let q=0;q<4;q++)step();
   if(!(o.dead>0)&&Math.hypot(o.x-C.x,o.z-C.z)<=55&&Math.hypot(o.x-RO.x,o.z-RO.z)>=14)return true}return false};
 const nearMe=o=>Math.hypot(o.x-RO.x,o.z-RO.z)<14||Math.hypot(o.x-camera.position.x,o.z-camera.position.z)>50;/* too close to the player (physics) or driven out of the 70 m zone (out of sight a car may close 1.5 m a step) */
 const fx=Math.sin(RO.h),fz=Math.cos(RO.h);let c=null;for(let w=0;w<20&&!c;w++){let bd=1e9;if(w)for(let k=0;k<30;k++)step();else HT_popF();const C=camera.position;for(const o of HUB.cars){if(o.dead>0||o.pk||o.tr||o.route||!N[o.a]||!N[o.b])continue;const d=Math.hypot(o.x-C.x,o.z-C.z);if(d<10||d>55||Math.hypot(o.x-RO.x,o.z-RO.z)<10)continue;if(d<bd){bd=d;c=o}}}
 let dg='';if(!c){/* flake-kill: earlier GOs of a batch leave traffic parked / on routes / dead: place a car instead of hoping the traffic happens to be there */const o=HUB.cars.filter(q=>!q.tr).sort((p,q)=>(p.dead>0)-(q.dead>0))[0];dg=' [cars '+HUB.cars.length+' live '+HUB.cars.filter(q=>!(q.dead>0)).length+']';if(o&&placeCar(o))c=o}
 if(!c)return'📍 why/traffic-inview · ✗ no live car 10-55 m from the camera in 20 s (and none could be placed)'+dg+' → ❌ FAIL';
 const im=HUB.cim[c.k],pos=()=>{im.getMatrixAt(c.j,_ivM);return[_ivM.elements[12],_ivM.elements[14],_ivM.elements[0]**2+_ivM.elements[1]**2+_ivM.elements[2]**2]};
 const hold=c.hold,cv0=c.cv,v0=c.v;c.v=c.cv=Math.max(4,Math.min(8,c.cv||0));step();
 // 1) along: +9 m on its edge
 let A=N[c.a],B=N[c.b],L=Math.hypot(B.x-A.x,B.z-A.z)||1,p=pos();c.t=Math.min(.98,c.t+9/L);step();let q=pos(),m=Math.hypot(q[0]-p[0],q[1]-p[1]);ck('9 m lane jump drawn as '+m.toFixed(2)+' m (<= v·dt + 0.5 = '+(c.cv*dt+.5).toFixed(2)+')',m<=c.cv*dt+.5+.02);
 for(let k=0;k<90;k++)step();
 if(nearMe(c)||c.dead>0){dg=dg||' ';placeCar(c)}/* it drove past the player during the settle */
 // 2) sideways: a 3 m yield offset in one step
 if(!(c.dead>0)){const yo=c.yo,lat=(a,b)=>{const hx=c.hdx,hz=c.hdz;return Math.abs((b[0]-a[0])*hz-(b[1]-a[1])*hx)/(3*dt)};
  /* control, same 3 steps without the offset: needs a straight-edge car (lane drift ~0), so the strict rule 3 m/s (2.5 + slack) applies unchanged: re-place the car on a long edge until the control reads <= 0.6 m/s */
  let l0=9,pl=0,no=0;for(let a=0;a<6&&l0>.6;a++){if(!placeCar(c,1,a)){no=1;break}pl=1;p=pos();step();step();step();q=pos();l0=c.dead>0?9:lat(p,q)}
  if(l0>.6)ck('a straight-edge spot in view for the sideways case (control '+l0.toFixed(2)+' m/s'+(no?', none found':'')+')',false);else if(!(c.dead>0)){p=q;c.yo=(c.yo||0)+3;step();step();step();q=pos();const l=lat(p,q);ck('3 m sideways jump drawn at '+l.toFixed(1)+' m/s over 3 steps [car '+(pl?'placed':'live')+', straight-edge control '+l0.toFixed(2)+' hitT'+(+c.hitT||0).toFixed(1)+(c.crW?' crW':'')+(c.cn?' cn':'')+(c.dz?' dz':'')+' d'+Math.round(Math.hypot(c.x-RO.x,c.z-RO.z))+'m from you, ivT '+(c.ivT===T?'now':'stale')+']  (<= 3.05; a missing guard reads 30)',l0<=.6&&l<=3.05)}else ck('car alive for the offset step',false);c.yo=yo}else ck('car alive for the sideways case',false);
 for(let k=0;k<60;k++)step();
 if(nearMe(c))placeCar(c);
 // 3) teleport: onto the node in view nearest 30 m ahead of the player
 let tn=-1,tb=1e9;for(let i=0;i<N.ng;i++){const n=N[i];if(!n||!n.nb||!n.nb.length||n.ab)continue;const rx=n.x-RO.x,rz=n.z-RO.z,al=rx*fx+rz*fz,d=Math.hypot(rx,rz);if(al<.8*d||d<20||d>45||Math.hypot(n.x-c.x,n.z-c.z)<IV.tp+5||HT_canPop(n.x,n.z,n.y))continue;const e=Math.abs(d-30);if(e<tb){tb=e;tn=i}}
 if(tn<0)ck('a visible node 20-45 m ahead for the teleport case',false);else if(!(c.dead>0)){c.a=tn;c.b=N[tn].nb[0];c.t=0;c.route=null;step();q=pos();ck('teleport into view hidden (dead '+(c.dead>0)+', drawn scale '+q[2].toFixed(2)+')',c.dead>0&&q[2]<1e-6)}
 c.hold=hold;c.v=v0;if(!(c.dead>0))c.cv=cv0;
 ck('counters cl '+IV.n.cl+' hide '+IV.n.hide+' snap '+IV.n.snap,IV.n.cl>0&&IV.n.hide>0);
 const ok=R.every(r=>r[0]==='✓');return'📍 why/traffic-inview · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'traffic-inview',area:'traffic',text:'traffic-in-view-r22e15 (bughunt §4.3): a car in view is forced through a 9 m lane jump, a 3 m sideways jump and a teleport onto a visible spot: drawn step <= v·dt + 0.5 m, sideways <= 3 m/s, the teleport is hidden (respawns out of sight). 📍 GO.'});
 __chk.GO['why/traffic-inview']=['fra','ath'].map(c=>({c,n:'traffic in view '+(c==='fra'?'Frankfurt':'Athens'),secs:30,fn:()=>IV_go()}))},500)}
