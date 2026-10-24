/* bricks-r24i (2026-10-24, ?proto=1, default OFF): LEGO Racers power-up bricks in the Westend race (TK_C, the proto stretch and the whole course).
   SPDX-License-Identifier: LGPL-3.0-or-later. This file (and only this file) is a port of logic from the LEGO Racers decompilation:
     isledecomp/racers@5bb9f133b5e14d5d060ea7f8d3897ec52ef382f2 (LGPL-3.0), LEGORacers/src/:
     race/racer/racer.cpp           Racer::CollectColorBrick, Racer::CollectWhiteBrick, Racer::AiConsiderPowerup, Racer::AiUsePowerup, Racer::DropWhiteBrick
     race/powerups/whitebrick.cpp   WhiteBrick::Update / OnTouched (500 ms re-arm, 10 s dropped -> home)
     race/powerups/pickupbrick.cpp  PickupBrick (3000 ms colour respawn)
     race/powerups/turboaction.h/.cpp, shieldaction.h, race/racer/racerphysics.cpp (RacerPhysics::StartBoost: max speed 120 -> 176, grip x1.5)
     race/powerups/racepowerupmanager.cpp UseRed/Blue/Green/YellowPowerup (level table, 25-effect budget, AI holds at >= 20)
   Rewritten in JS in our own words for our engine; no LEGO assets (bricks are built with our garage builder, GB_piece). You may redistribute and/or modify this
   file under the terms of the GNU Lesser General Public License v3 or later (https://www.gnu.org/licenses/lgpl-3.0.html). The rest of the game is not LGPL.
   Racers colours (powerupaction.h): 1 red = weapon, 2 blue = shield, 3 green = turbo, 4 yellow = hazard. One colour held; a new colour swaps it; white bricks stack
   0-3 independently and set the level of the next use, then all go home. Effects reuse our VFX (burst/debris/studBurst, RO.turbo flames, the R17 rim shield). */
const RBK={red:1,blue:2,green:3,yellow:4,whiteMax:3,colRespawn:3,whiteRearm:.5,dropHome:10,turbo:[1,1.5,5],shield:[4,6,8,10],shieldFade:1,vmax:176/120,grip:1.5,thrust:432/54,
  budget:25,aiBudget:20,aiCheck:.3,aiCheckSlow:1,warp:150,hit:{r:4.5,ai:5},names:{1:'WEAPON',2:'SHIELD',3:'TURBO',4:'HAZARD'},
  lv:{1:['CANNONBALL','GRAPPLE','LIGHTNING','HOMING ×3'],2:['SHIELD 4 s','SHIELD 6 s','SHIELD 8 s','SHIELD 10 s'],3:['TURBO 1 s','TURBO 1.5 s','TURBO 5 s','WARP'],4:['OIL','DYNAMITE','MAGNET','CURSE']},
  hex:{0:'#f4f4f4',1:'#d01712',2:'#0055bf',3:'#00852b',4:'#fac80a'}};
const RBR={on:false,force:false,inst:false,B:[],fx:[],hz:[],p:null,sp:null,im:null,iw:null,ispk:null,bub:null,log:[],last:null,live:0,K:RBK};window.RBR=RBR;
function RB_racer(){return{col:0,w:0,wb:[],turboT:0,turboDur:0,shieldT:0,vPeak:0,vTop:0,blocked:0,hits:0,used:0,aiT:0,aiTarget:0,aiWait:0}}
function RB_live(sp){return!!(sp&&sp.tk&&sp.C===TK_C&&(PROTO.on||RBR.force))}
// ---- pickups (Racer::CollectColorBrick / CollectWhiteBrick): a colour replaces the held one, a white stacks up to 3; a full stack plays the cheer
function RB_touch(r,b,who){if(!b||b.cd>0||b.own)return false;
  if(b.kind==='c'){r.col=b.col;r.aiT=RBK.aiCheck;b.cd=RBK.colRespawn;RB_pop(b,who);if(who==='me'){feed(RBK.names[b.col]+' BRICK',50,RBK.hex[b.col]);AU.sfx('pick')}return true}
  if(r.w>=RBK.whiteMax)return false;r.w++;r.wb.push(b);b.own=r;RB_pop(b,who);if(who==='me'){feed(r.w>=RBK.whiteMax?'MAX POWER':'POWER '+r.w,30,'#ffffff');AU.sfx(r.w>=RBK.whiteMax?'nitro':'pick')}return true}
// all whites go home when the power-up is used (Racer::ReturnAllWhiteBricks): visible again after the 500 ms re-arm
function RB_return(r){for(const b of r.wb){b.own=null;b.cd=RBK.whiteRearm}r.wb.length=0;r.w=0}
// hit by a weapon: the racer drops one white (Racer::DropWhiteBrick); it is back home after 10 s (we send it straight home, re-armed)
function RB_dropWhite(r){const b=r.wb.pop();if(!b)return;r.w--;b.own=null;b.cd=RBK.whiteRearm}
// ---- use (Racer::AiUsePowerup and the player call): the level is the white count, then colour and whites are spent
function RB_use(who,a){const sp=RBR.sp;if(!RB_live(sp)||sp.cd>0)return null;const r=who==='me'?RBR.p:a.rb;if(!r||!r.col)return null;const col=r.col,lvl=Math.min(3,r.w);
  if(who!=='me'&&RBR.live>=RBK.aiBudget)return null;r.col=0;RB_return(r);r.used++;const ev={who,col,lvl,name:RBK.lv[col][lvl],t:sp.t};RBR.last=ev;RBR.log.push(ev);if(RBR.log.length>40)RBR.log.shift();
  try{(col===RBK.green?RB_turbo:col===RBK.blue?RB_shield:col===RBK.red?RB_weapon:RB_hazard)(who,a,lvl,ev)}catch(e){console.warn('RBR use',e)}
  if(who==='me'){feed(ev.name,0,RBK.hex[col]);RB_hud(true)}return ev}
// green: RacerPhysics::StartBoost (max speed x176/120, grip x1.5) for 1 / 1.5 / 5 s; level 3 is the warp portal
function RB_turbo(who,a,lvl,ev){const sp=RBR.sp;
  if(lvl===3){if(who==='me'){const G=tkGeo(),q=tkPosOn(G.pA,Math.min(G.lenA-30,(sp.myS||0)+RBK.warp));RB_flash(RO.x,RO.y,RO.z,'#8c55ff');RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;camSnap=true;RB_flash(RO.x,RO.y,RO.z,'#8c55ff');AU.sfx('launch')}
    else a.s+=RBK.warp;ev.warp=RBK.warp;return}
  const d=RBK.turbo[lvl];ev.dur=d;ev.mul=RBK.vmax;
  if(who==='me'){const r=RBR.p;r.turboT=r.turboDur=d;r.vTop=0;r.vPeak=0;RO.turbo=Math.max(RO.turbo||0,d);if(pl)pl.bm=100;fovKick=Math.max(fovKick,10+4*lvl);AU.sfx('nitro');shake=Math.max(shake||0,.12)}
  else a.rb.turboT=d}
// blue: ShieldAction 4 / 6 / 8 / 10 s (+1 s fade); the tk race already blocks a rival blast while sp.shieldT > 0
function RB_shield(who,a,lvl,ev){const d=RBK.shield[lvl]+RBK.shieldFade;ev.dur=d;if(who==='me'){RBR.p.shieldT=d;RBR.sp.shieldT=Math.max(RBR.sp.shieldT||0,d);AU.sfx('pick')}else a.rb.shieldT=d}
// red: L0 cannonball, L1 grappling hook (hit + pulls you on), L2 lightning (everyone ahead), L3 homing missiles (3 nearest ahead)
function RB_ahead(){const sp=RBR.sp,G=tkGeo();return sp.ai.filter(b=>b.fin==null).map(b=>({b,d:b.s/tkLen(tkPath(b))*G.lenA-sp.myS})).filter(o=>o.d>2&&o.d<260).sort((x,y)=>x.d-y.d).map(o=>o.b)}
function RB_weapon(who,a,lvl,ev){const sp=RBR.sp;
  if(who!=='me'){RB_shoot(a.g.position,null,1,a);return}
  const T0=RB_ahead(),from=new THREE.Vector3(RO.x,RO.y+1.4,RO.z);ev.targets=T0.length;
  if(lvl===2){for(const b of T0){RB_bolt(b.g.position);RB_hitAi(b,1.5,'LIGHTNING')}if(!T0.length)feed('LIGHTNING · nobody ahead',0,'#9fb0c0');AU.sfx('crash');shake=Math.max(shake||0,.2);return}
  const n=lvl===3?3:1;for(let k=0;k<n;k++)RB_shoot(from,T0[k]||null,lvl,null);if(lvl===1&&T0[0])RBR.p.pull=1.2}
function RB_shoot(from,tgt,lvl,src){const m=new THREE.Mesh(RBR.gC,RBR.mProj||(RBR.mProj=new THREE.MeshStandardMaterial({color:0xd01712,roughness:.25,metalness:0,emissive:0x400000})));m.scale.setScalar(.55);m.position.copy(from);RO.grp.add(m);
  const fw=new THREE.Vector3(Math.sin(RO.h),0,Math.cos(RO.h));RBR.fx.push({k:'proj',m,t:0,dur:src?.9:.75,from:from.clone(),tgt,src,lvl,miss:from.clone().addScaledVector(fw,120)});RBR.live++;AU.sfx('launch')}
function RB_hitAi(b,stun,what){if(b.rb&&b.rb.shieldT>0){feed(what+' · '+b.name+' SHIELDED',0,'#5dffb0');return false}b.stun=Math.max(b.stun||0,stun);b.v*=.35;RB_dropWhite(b.rb||RB_racer());
  try{debris(b.g.position.clone().setY(b.g.position.y+1.5),new THREE.Vector3(0,4,0),6,[new THREE.Color('#d01712'),new THREE.Color('#fac80a'),new THREE.Color('#f4f4f4')],.6,b.g.position.y+.2)}catch(e){}
  feed(what+' · '+b.name,250,'#ff2d95');return true}
// a rival weapon reaches the player: the shield blocks it, else speed x0.5, a shake and one white dropped
function RB_hitMe(src){const r=RBR.p;if(r.shieldT>0){r.blocked++;feed('SHIELD · BLOCKED',150,'#5dffb0');AU.sfx('pick');return false}
  r.hits++;RO.v*=.5;shake=Math.max(shake||0,.35);RB_dropWhite(r);AU.sfx('crash');try{studBurst(new THREE.Vector3(RO.x,RO.y+1.5,RO.z),new THREE.Vector3(0,1,0),8)}catch(e){}feed('HIT · '+(src?src.name:'RIVAL'),0,'#ff5050');return true}
// yellow: L0 oil slick and L1 dynamite dropped behind, L2 magnet (holds the racer ahead back), L3 curse (everyone ahead slowed)
function RB_hazard(who,a,lvl,ev){const sp=RBR.sp;let x,y,z,h;if(who==='me'){x=RO.x;y=RO.y;z=RO.z;h=RO.h}else{const p=a.g.position;x=p.x;y=p.y;z=p.z;h=a.h||0}
  if(lvl>=2&&who==='me'){const T0=RB_ahead(),L=lvl===2?T0.slice(0,1):T0;for(const b of L){b.rbSlow=lvl===2?4:6;RB_bolt(b.g.position,lvl===2?'#36aebf':'#8a12a8')}ev.targets=L.length;if(!L.length)feed(RBK.lv[4][lvl]+' · nobody ahead',0,'#9fb0c0');return}
  if(lvl>=2){if(sp.myS>a.s&&RBR.p.shieldT<=0){RBR.p.slowT=lvl===2?3:5;feed(RBK.lv[4][lvl]+' · '+a.name,0,'#fac80a')}return}
  const bx=x-Math.sin(h)*6,bz=z-Math.cos(h)*6,by=groundAt(bx,bz,y+3);let m;
  if(lvl===0){m=new THREE.Mesh(RBR.gOil||(RBR.gOil=new THREE.CircleGeometry(3.2,20).rotateX(-Math.PI/2)),RBR.mOil||(RBR.mOil=new THREE.MeshBasicMaterial({color:0x14121a,transparent:true,opacity:.85,depthWrite:false})));m.position.set(bx,by+.06,bz)}
  else{m=new THREE.Mesh(RBR.gDyn||(RBR.gDyn=new THREE.CylinderGeometry(.35,.35,1.6,10)),RBR.mDyn||(RBR.mDyn=new THREE.MeshStandardMaterial({color:0xd01712,roughness:.4,emissive:0x300000})));m.position.set(bx,by+.8,bz)}
  RO.grp.add(m);RBR.hz.push({k:lvl?'dyn':'oil',m,x:bx,z:bz,t:0,by:who,src:a||null,done:new Set()});RBR.live++;AU.sfx('pick')}
// ---- VFX helpers (our pools)
function RB_pop(b,who){if(who!=='me'&&Math.hypot(b.x-RO.x,b.z-RO.z)>90)return;try{const at=new THREE.Vector3(b.x,b.y,b.z),c=new THREE.Color(RBK.hex[b.col]);burst(SPARK,at,who==='me'?22:10,14,.45,c.clone().multiplyScalar(2.2));
  debris(at,new THREE.Vector3(0,3,0),who==='me'?5:2,[c,new THREE.Color('#ffffff')],.55,b.y-2.4)}catch(e){}}
function RB_flash(x,y,z,c){try{burst(SPARK,new THREE.Vector3(x,y+1.5,z),24,14,.5,new THREE.Color(c).multiplyScalar(2))}catch(e){}}
function RB_bolt(p,c='#fff36a'){const m=new THREE.Mesh(RBR.gBolt||(RBR.gBolt=new THREE.BoxGeometry(.5,40,.5).translate(0,20,0)),neonMat(c,3));m.position.set(p.x,p.y,p.z);RO.grp.add(m);RBR.fx.push({k:'bolt',m,t:0,dur:.35});RBR.live++}
// ---- meshes: 2x2 colour bricks and 1x2 white bricks from the garage builder (GB_piece), glossy, one instanced draw each + one for the sparkles
function RB_geo(t,s){const M=[],L=[];GB_piece(t,'#ffffff',M,L);const g=mergeGeometries(M.concat(L).map(x=>x.attributes.normal?x:x.computeVertexNormals()||x),false);const H=GB_PC[t].h*GB_PH;g.translate(0,-H/2,0);g.scale(s,s,s);return g}
function RB_starTex(){const[c,g]=cv(64,64);const r=g.createRadialGradient(32,32,0,32,32,30);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,250,210,.7)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
  g.fillStyle='#fff';for(const[w,hh]of[[3,30],[30,3]]){g.beginPath();g.ellipse(32,32,w,hh,0,0,Math.PI*2);g.fill()}const t=tex(c);KEEP_TEX.add(t);return t}
function RB_meshes(){if(RBR.gC)return;RBR.gC=RB_geo('b22',3.0);RBR.gW=RB_geo('b12',2.6);
  RBR.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.22,metalness:0,emissive:0x202020});
  RBR.mSpk=new THREE.MeshBasicMaterial({map:RB_starTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,color:new THREE.Color(1.6,1.5,1.2)});RBR.gSpk=new THREE.PlaneGeometry(2.4,2.4);
  RBR.bubM=R17_SH.clone();RBR.bubM.uniforms.c.value=new THREE.Color('#3aa0ff').multiplyScalar(1.8);RBR.bub=new THREE.Mesh(new THREE.SphereGeometry(3.4,24,16),RBR.bubM);RBR.bub.visible=false}
// ---- course layout: colour rows (3 across) where the ? bricks were, white rows between them, plus a white + colour row on the start straight
// heights: probe from the road surface just below (a top-down probe lands on the checkpoint arches); rows keep 14 m clear of the gates
function RB_build(sp){RB_drop();RB_meshes();const C=sp.C,Gm=tkGeoOf(C),B=[];let row=0;const yRoad={};
  const roadY=(sg,f)=>{const P=Gm.seg[sg];let y=yRoad[sg];if(y==null){const q0=tkAt(P,0),pv={A:'start',B:'start',fin:'A'}[sg];y=groundAt(q0.x,q0.z,(pv?roadY(pv,1):RO.y)+4);yRoad[sg+'f']=0}for(let k=1;k<=8;k++){const fk=(yRoad[sg+'f']||0)+(f-(yRoad[sg+'f']||0))*k/8,q=tkAt(P,clamp(fk,0,1));y=groundAt(q.x,q.z,y+4)}yRoad[sg]=y;yRoad[sg+'f']=f;return y};
  const put=(sg,f,kind)=>{for(const g of sp.G)for(let k=0;k<4;k++){const q=tkAt(Gm.seg[sg],clamp(f,.01,.99));if(Math.hypot(q.x-g.x,q.z-g.z)>=14)break;f+=.012}
    const q=tkAt(Gm.seg[sg],clamp(f,.01,.99)),yc=roadY(sg,clamp(f,.01,.99));for(const o of[-6,0,6]){const x=q.x+Math.cos(q.h)*o,z=q.z-Math.sin(q.h)*o;B.push({kind,col:kind==='c'?1+((row+o/6+1+4)%4):0,x,z,y:groundAt(x,z,yc+3)+2.6,cd:0,own:null})}row++};
  const Ls=tkLen(Gm.seg.start);if(Ls>180){put('start',70/Ls,'w');put('start',95/Ls,'c')}
  const bySeg={};for(const[sg,f]of C.items)(bySeg[sg]=bySeg[sg]||[]).push(f);
  for(const sg in bySeg){const F=bySeg[sg].sort((a,b)=>a-b);let prev=sg==='start'?Math.max(.12,150/Ls):0;for(const f of F){const mid=(prev+f)/2;if(f-prev>.1)put(sg,mid,'w');put(sg,f,'c');prev=f}if(.99-prev>.15)put(sg,(prev+.99)/2,'w')}
  RBR.B=B;const nc=B.filter(b=>b.kind==='c').length,nw=B.length-nc;
  const mk=(g,n,m)=>{const im=new THREE.InstancedMesh(g,m,Math.max(1,n));im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);RO.grp.add(im);return im};
  RBR.im=mk(RBR.gC,nc,RBR.mat);RBR.iw=mk(RBR.gW,nw,RBR.mat);RBR.ispk=mk(RBR.gSpk,B.length,RBR.mSpk);
  let ic=0,iw=0;const c=new THREE.Color();for(const b of B){if(b.kind==='c'){b.i=ic++;RBR.im.setColorAt(b.i,c.set(RBK.hex[b.col]))}else{b.i=iw++;RBR.iw.setColorAt(b.i,c.set('#f4f4f4'))}}
  RBR.im.instanceColor.needsUpdate=RBR.iw.instanceColor.needsUpdate=true;RO.grp.add(RBR.bub);
  RBR.p=RB_racer();for(const a of sp.ai){a.rb=RB_racer();a.rb.aiTarget=Math.floor(Math.random()*3)}RBR.sp=sp;RBR.fx=[];RBR.hz=[];RBR.live=0;RBR.log=[];RBR.last=null;
  for(const it of sp.items){it.cd=1e9;it.g.visible=false}   // the ? bricks of this race give way to the Racers bricks
  RB_tick(0);RB_hud(true);return B}
function RB_drop(){for(const k of['im','iw','ispk']){const m=RBR[k];if(m){RO.grp.remove(m);m.dispose&&m.dispose();RBR[k]=null}}for(const f of RBR.fx.concat(RBR.hz))RO.grp.remove(f.m);RBR.fx=[];RBR.hz=[];RBR.B=[];RBR.live=0;
  if(RBR.bub){RO.grp.remove(RBR.bub);RBR.bub.visible=false}RBR.sp=null;RB_hud(false)}
// ---- per frame: spin + bob + sparkle, pickups (player and rivals), effects, rival AI
const _rbM=new THREE.Matrix4(),_rbQ=new THREE.Quaternion(),_rbQ2=new THREE.Quaternion(),_rbX=new THREE.Vector3(1,0,0),_rbY=new THREE.Vector3(0,1,0),_rbE=new THREE.Euler(),_rbS=new THREE.Vector3(),_rbP=new THREE.Vector3();
function RB_tick(dt){const sp=RBR.sp;if(!sp||!RBR.im)return;const t=typeof T==='number'?T:performance.now()/1000,cq=camera.quaternion;
  const cp=camera.position;RBR.B.forEach((b,k)=>{if(b.cd>0){b.cd-=dt}const hid=b.cd>0||!!b.own,s=hid?0:1;   // faces the camera, top tipped 0.45 rad toward it (studs show), spins on its own axis
    _rbQ.setFromAxisAngle(_rbY,Math.atan2(cp.x-b.x,cp.z-b.z));_rbQ2.setFromAxisAngle(_rbX,.45+.08*Math.sin(t*1.7+k));_rbQ.multiply(_rbQ2);_rbQ2.setFromAxisAngle(_rbY,t*2+k);_rbQ.multiply(_rbQ2);_rbS.setScalar(s);
    _rbP.set(b.x,b.y+Math.sin(t*3+k)*.35,b.z);_rbM.compose(_rbP,_rbQ,_rbS);(b.kind==='c'?RBR.im:RBR.iw).setMatrixAt(b.i,_rbM);
    const tw=hid?0:.45+.55*Math.max(0,Math.sin(t*4.2+k*1.9));_rbS.setScalar(tw);_rbP.set(b.x+1.3*Math.sin(k),b.y+2.1+Math.sin(t*3+k)*.35,b.z+.9*Math.cos(k));_rbM.compose(_rbP,cq,_rbS);RBR.ispk.setMatrixAt(k,_rbM)});
  RBR.im.instanceMatrix.needsUpdate=RBR.iw.instanceMatrix.needsUpdate=RBR.ispk.instanceMatrix.needsUpdate=true;if(!dt)return;
  if(sp.cd<=0&&!sp.done){for(const b of RBR.B)if(!(b.cd>0)&&!b.own&&(b.x-RO.x)**2+(b.z-RO.z)**2<RBK.hit.r**2&&Math.abs(b.y-2.6-RO.y)<5)RB_touch(RBR.p,b,'me');
    for(const a of sp.ai){if(a.fin!=null)continue;const p=a.g.position;for(const b of RBR.B)if(!(b.cd>0)&&!b.own&&(b.x-p.x)**2+(b.z-p.z)**2<RBK.hit.ai**2)RB_touch(a.rb,b,'ai');RB_ai(a,dt)}}
  // player turbo: hold the boosted top speed (x176/120 of the car's normal top) with Racers' x8 thrust, keep our flames on
  const r=RBR.p;if(r.turboT>0){r.turboT-=dt;RO.turbo=Math.max(RO.turbo||0,Math.min(.25,r.turboT))}   // the speed itself is set after the drive step (RB_post)
  if(r.shieldT>0){r.shieldT=Math.max(0,r.shieldT-dt);sp.shieldT=Math.max(sp.shieldT||0,r.shieldT)}
  const bub=RBR.bub;bub.visible=r.shieldT>0;if(bub.visible){const pm=pl&&pl.mesh?pl.mesh.position:{x:RO.x,y:RO.y,z:RO.z};bub.position.set(pm.x,pm.y+1.3,pm.z);const f=Math.min(1,r.shieldT/RBK.shieldFade);bub.scale.setScalar(.92+.08*Math.sin(t*9));RBR.bubM.uniforms.c.value.set('#3aa0ff').multiplyScalar(1.8*f)}
  for(const a of sp.ai){const q=a.rb;if(!q)continue;if(q.turboT>0){q.turboT-=dt;a.s+=a.v*dt*(RBK.vmax-1)}if(q.shieldT>0)q.shieldT-=dt;if(a.rbSlow>0){a.rbSlow-=dt;a.s-=a.v*dt*.45}}
  for(let i=RBR.fx.length-1;i>=0;i--){const f=RBR.fx[i];f.t+=dt;const u=Math.min(1,f.t/f.dur);
    if(f.k==='proj'){const to=f.src?new THREE.Vector3(RO.x,RO.y+1.4,RO.z):f.tgt?f.tgt.g.position.clone().setY(f.tgt.g.position.y+1.4):f.miss;f.m.position.lerpVectors(f.from,to,u);f.m.position.y+=Math.sin(u*Math.PI)*(f.lvl===3?7:3);f.m.rotation.x+=dt*14;
      if(u>=1){if(f.src)RB_hitMe(f.src);else if(f.tgt){RB_hitAi(f.tgt,f.lvl===3?2:f.lvl===1?1.5:1.2,RBK.lv[1][f.lvl])}else feed(RBK.lv[1][f.lvl]+' · missed',0,'#9fb0c0');RB_flash(to.x,to.y-1.4,to.z,'#ff7a1a')}}
    else if(f.k==='bolt')f.m.scale.x=f.m.scale.z=1+2*(1-u);
    if(u>=1){RO.grp.remove(f.m);RBR.fx.splice(i,1);RBR.live--}}
  for(let i=RBR.hz.length-1;i>=0;i--){const h=RBR.hz[i];h.t+=dt;let end=h.t>20;
    if(h.k==='dyn'){h.m.scale.setScalar(1+.15*Math.sin(h.t*20));if(h.t>1.5){RB_flash(h.x,h.m.position.y,h.z,'#ff7a1a');shake=Math.max(shake||0,.15);for(const a of sp.ai)if(a!==h.src&&Math.hypot(a.g.position.x-h.x,a.g.position.z-h.z)<10)RB_hitAi(a,2,'DYNAMITE');if(h.by!=='me'&&Math.hypot(RO.x-h.x,RO.z-h.z)<10)RB_hitMe(h.src);end=true}}
    else{for(const a of sp.ai)if(a!==h.src&&!h.done.has(a)&&Math.hypot(a.g.position.x-h.x,a.g.position.z-h.z)<3.6){h.done.add(a);if(!(a.rb&&a.rb.shieldT>0)){a.stun=Math.max(a.stun||0,.9);a.v*=.5;feed('OIL · '+a.name,100,'#fac80a')}}
      if(h.by!=='me'&&!h.done.has('me')&&Math.hypot(RO.x-h.x,RO.z-h.z)<3.6){h.done.add('me');if(RBR.p.shieldT>0){RBR.p.blocked++;feed('SHIELD · OIL',0,'#5dffb0')}else{RO.v*=.5;RO.h+=.35;RO.vh=RO.h;shake=Math.max(shake||0,.3);RBR.p.hits++;feed('OIL SLICK!',0,'#fac80a')}}}
    if(end){RO.grp.remove(h.m);RBR.hz.splice(i,1);RBR.live--}}
  RB_hud(false)}
// player speed effects, applied after the whole drive step (99_api's roamStep caps a gain at the car's boost top; Racers' turbo goes past it):
// turbo holds x176/120 of the car's normal top with a strong push (Racers' thrust x8), the grapple pulls you on, a magnet/curse holds you back
function RB_post(dt){const r=RBR.p,sp=RBR.sp;if(!r||!sp||RO.sp!==sp||!dt||state!=='roam')return;
  if(r.turboT>0){const top=RO.qsV||RO.top||30,vT=top*RBK.vmax;r.vTop=vT;if(r.vCur==null||RO.v<r.vLast*.7)r.vCur=RO.v;   /* a crash (speed down 30 % in a frame) restarts the push from the new speed */
    r.vCur=Math.min(vT,r.vCur+Math.max(vT-r.vCur,4)*Math.min(1,dt*2.4));RO.v=Math.min(vT,Math.max(RO.v,r.vCur));r.vLast=RO.v;r.vPeak=Math.max(r.vPeak,RO.v/top)}else r.vCur=null
  if(r.pull>0){r.pull-=dt;RO.v+=10*dt}if(r.slowT>0){r.slowT-=dt;RO.v*=Math.pow(.6,dt)}}
// rivals (Racer::AiConsiderPowerup, simple): check every 0.3 s after a pickup, 1 s otherwise; wait for its white target (max 8 s); the weapon only with you
// ahead in range; one roll per check; no use while 20+ effects are live
function RB_ai(a,dt){const q=a.rb;if(!q||!q.col)return;q.aiT-=dt;q.aiWait+=dt;if(q.aiT>0)return;q.aiT=RBK.aiCheckSlow;const sp=RBR.sp;
  if(RBR.live>=RBK.aiBudget||a.stun>0)return;if(q.w<q.aiTarget&&q.aiWait<8)return;const gap=sp.myS-a.s;
  const chance=q.col===RBK.red?(gap>15&&gap<160?.5:0):q.col===RBK.yellow?(gap<0&&gap>-120?.45:.15):q.col===RBK.green?.35:.25;
  if(Math.random()<chance){RB_use('ai',a);q.aiWait=0;q.aiTarget=Math.floor(Math.random()*3)}}
// ---- HUD: a chunky brick of the held colour + 0-3 white pips, top-left under the race box (clear of the controls); tap it (or the item button, or E) to use
function RB_hudEl(){let el=document.getElementById('rbHud');if(el)return el;el=document.createElement('div');el.id='rbHud';el.innerHTML='<div class="rbB"><i></i><i></i></div><div class="rbP"><b></b><b></b><b></b></div><div class="rbN"></div>';
  const st=document.createElement('style');st.textContent=`#rbHud{position:fixed;left:calc(env(safe-area-inset-left,0px) + 66px);top:58px;z-index:30;display:none;align-items:center;gap:8px;padding:7px 10px 7px 8px;border-radius:14px;background:rgba(10,18,40,.62);box-shadow:0 2px 0 rgba(0,0,0,.35);pointer-events:auto;touch-action:manipulation;-webkit-user-select:none;user-select:none;cursor:pointer}
#rbHud .rbB{position:relative;width:58px;height:36px;margin-top:9px;border-radius:5px;background:var(--c,#555);box-shadow:inset 0 -6px 0 rgba(0,0,0,.28),inset 0 4px 0 rgba(255,255,255,.35),0 3px 0 rgba(0,0,0,.4)}
#rbHud .rbB i{position:absolute;top:-9px;width:18px;height:10px;border-radius:4px 4px 2px 2px;background:var(--c,#555);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),inset 0 -2px 0 rgba(0,0,0,.25)}#rbHud .rbB i:first-child{left:8px}#rbHud .rbB i:last-child{right:8px}
#rbHud .rbP{display:flex;flex-direction:column;gap:3px}#rbHud .rbP b{display:block;width:16px;height:9px;border-radius:2px;background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}#rbHud .rbP b.on{background:#fff;box-shadow:0 0 6px #fff}
#rbHud .rbN{font:900 13px/1.15 system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000;min-width:74px}#rbHud .rbN small{display:block;font-weight:700;font-size:12px;opacity:.85}
#rbHud.empty .rbB{opacity:.35}#rbHud.held{animation:rbPulse 1s ease-in-out infinite}@keyframes rbPulse{50%{box-shadow:0 0 0 3px rgba(255,255,255,.55)}}
@media (orientation:portrait){#rbHud{top:96px}}`;document.head.appendChild(st);document.body.appendChild(el);
  const use=e=>{if(RBR.p&&RBR.p.col){e.preventDefault();e.stopPropagation();RB_use('me')}};el.addEventListener('pointerdown',use);
  const tF=document.getElementById('tF');if(tF)tF.addEventListener('pointerdown',e=>{if(RB_live(RBR.sp)&&RBR.p&&RBR.p.col){use(e);pressed.fire=false}},true);
  addEventListener('keydown',e=>{if(e.code==='KeyE'&&RB_live(RBR.sp))use(e)});return el}
function RB_hud(force){const sp=RBR.sp,show=!!(sp&&RB_live(sp)&&!sp.done);const el=show||document.getElementById('rbHud')?RB_hudEl():null;if(!el)return;if(!show){el.style.display='none';return}
  const r=RBR.p,key=r.col+'|'+r.w;if(!force&&el.dataset.k===key&&el.style.display==='flex')return;el.dataset.k=key;el.style.display='flex';el.style.setProperty('--c',r.col?RBK.hex[r.col]:'#7a8090');
  el.classList.toggle('empty',!r.col);el.classList.toggle('held',!!r.col);el.querySelectorAll('.rbP b').forEach((b,i)=>b.classList.toggle('on',i<r.w));
  el.querySelector('.rbN').innerHTML=r.col?`${RBK.lv[r.col][Math.min(3,r.w)]}<small>LEVEL ${Math.min(3,r.w)} · TAP</small>`:`GRAB A BRICK<small>${r.w?'POWER '+r.w+'/3':'colour + white'}</small>`}
// ---- hooks (only with ?proto=1, or RB_enable() from the GO)
function RB_enable(){if(RBR.inst)return;RBR.inst=true;const _st=tkStart,_step=tkStep,_end=sprintEnd;
  tkStart=function(m,C0){const sp=_st.apply(this,arguments);try{if(RB_live(sp))RB_build(sp);else RB_drop()}catch(e){console.warn('RBR build',e)}return sp};
  tkStep=function(dt){const r=_step.apply(this,arguments);try{const sp=RO.sp;if(RBR.sp&&sp===RBR.sp)RB_tick(dt||0);else if(RBR.sp)RB_drop()}catch(e){console.warn('RBR tick',e)}return r};
  sprintEnd=function(){RB_drop();return _end.apply(this,arguments)};
  roamStep=(f=>function(dt){const r=f.apply(this,arguments);try{if(RBR.sp)RB_post(dt)}catch(e){}return r})(roamStep)}
Object.assign(RBR,{enable:RB_enable,touch:RB_touch,ret:RB_return,use:RB_use,hitMe:RB_hitMe,build:RB_build,drop:RB_drop,tick:RB_tick,racer:RB_racer,live:0});
RBR.on=PROTO.on;if(RBR.on&&typeof tkStart==='function')RB_enable();
