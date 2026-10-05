# CAR10: the player drives a CAR, not a hover ship.
#  - steering: kinematic bicycle model (yaw rate = v / wheelbase * tan(steer angle), steer angle shrinks with speed, capped by the old
#    handling envelope); the steer angle eases in over ~0.1 s and straightens in ~0.07 s, so there is no yaw "float" after letting go
#  - grip: velocity heading follows the car 3x faster (slip ~1-2 deg in normal turns); drift (handbrake + steer) slides as before
#  - chase camera: fixed distance/height behind the car, yaw follows the heading with a 0.15 s lag, no positional rubber band
#  - body: small outward roll in turns (was 18 deg banking into the turn like a boat), stiffer pitch
#  - wheels: spin = v*dt/r every sim step, front wheels show the real steer angle, each wheel sits on the ground under it
#    (suspension travel -0.12..+0.22 m), the body is raised whenever a wheel or a body corner would go below the ground
exec(open('P.py').read())
if 'CR_yaw' in s:
    print('OK');raise SystemExit
assert 'CR_clamp' in s, 'apply pCAR4 first'
JS=r'''
const CR_WB=2.7,CR_CAMK=1/.15;
function CR_yaw(c,dt,ytg,maxR,air){const v=RO.v||0,sp=Math.abs(v),st=clamp(c.steer||0,-1,1),base=-st*maxR*Math.sign(v||1),dm=.55/(1+sp/14),tg=st*dm,d0=RO.dl||0;
 RO.dl=d0+(tg-d0)*Math.min(1,dt*(Math.abs(tg)>Math.abs(d0)&&tg*d0>=0?11:16));
 if(RO.dDir||air)return(RO.yr||0)+(ytg-(RO.yr||0))*Math.min(1,dt*6.5);
 const cap=Math.max(.35,maxR);return clamp(-(v/CR_WB)*Math.tan(RO.dl),-cap,cap)+(ytg-base)}
const CR_roll=()=>clamp(-(RO.yr||0)*(RO.v||0)/26,-1,1)*.055;
const CR_PS={};
function CR_bodyPts(ud){const host=ud.m,key=host.uuid+'|'+(ud.gbM?ud.gbM.length:0)+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:'');if(CR_PS.k===key)return CR_PS.p;
 const inv=new THREE.Matrix4().copy(host.matrixWorld).invert(),B=new THREE.Box3(),bb=new THREE.Box3(),m4=new THREE.Matrix4();host.updateMatrixWorld(true);
 host.traverse(o=>{if(!o.isMesh||o.userData.r)return;let v=true,q=o;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}if(!v||o.material&&(o.material.transparent||o.material.depthWrite===false))return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.copy(o.geometry.boundingBox).applyMatrix4(m4.multiplyMatrices(inv,o.matrixWorld));B.union(bb)});
 const P=[];if(!B.isEmpty())for(const x of[B.min.x,(B.min.x+B.max.x)/2,B.max.x])for(const z of[B.min.z,(B.min.z+B.max.z)/2,B.max.z])if(x!==(B.min.x+B.max.x)/2||z!==(B.min.z+B.max.z)/2)P.push(new THREE.Vector3(x,B.min.y,z));
 CR_PS.k=key;CR_PS.p=P;CR_PS.b=B.isEmpty()?null:B.clone();return P}
const _crA=new THREE.Vector3(),_crS=new THREE.Vector3();
// no hover-ship leftovers on the player car: underglow, thruster ribbons/flares, stock ship parts and the 7 m ship shadow go;
// a tight soft contact shadow sits under the body and BOOST lights flames at the tailpipes
let CR_SH=null;
function CR_shTex(){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.shadowColor='rgba(0,0,0,.92)';g.shadowBlur=9;g.shadowOffsetX=400;g.fillStyle='#000';g.fillRect(12-400,12,40,104);const t=new THREE.CanvasTexture(c);if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
function CR_fx(s,ud){const host=ud.m,boat=(s.boatK||0)>.5;if(ud.under)ud.under.visible=false;for(const r of ud.ribbons||[])r.visible=false;for(const f of ud.flares||[])f.visible=false;if(ud.shadow)ud.shadow.visible=false;
 if(ud.carG)for(const o of ud.carG.children)if(o.visible&&!(o.userData.gb||o.userData.gbG||o.userData.crKeep||o===ud.boat||o===ud.wheels||Object.values(ud.gbV||{}).includes(o)))o.visible=false;
 if(!CR_SH){CR_SH=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:CR_shTex(),color:0,transparent:true,opacity:.6,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));CR_SH.renderOrder=1;CR_SH.userData.keep=1;CR_SH.frustumCulled=false;scene.add(CR_SH)}
 if(!CR_SH.parent)scene.add(CR_SH);CR_bodyPts(ud);const B=CR_PS.b;CR_SH.visible=!boat&&!!B&&state==='roam';
 if(CR_SH.visible){host.getWorldScale(_crS);_crA.set((B.min.x+B.max.x)/2,B.min.y,(B.min.z+B.max.z)/2).applyMatrix4(host.matrixWorld);const g=groundAt(_crA.x,_crA.z,RO.y+1.5);
  CR_SH.position.set(_crA.x,g+.025,_crA.z);CR_SH.rotation.y=RO.h;CR_SH.scale.set((B.max.x-B.min.x)*_crS.x*1.12,1,(B.max.z-B.min.z)*_crS.z*1.06);CR_SH.material.opacity=.6*clamp(1-(RO.y-g)/5,0,1)}
 if(B&&!ud.crFl){const m=new THREE.MeshBasicMaterial({color:0xff8a1c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),geo=new THREE.ConeGeometry(.5,1,10).rotateX(Math.PI/2).translate(0,0,.5);
  ud.crFl=[-1,1].map(sd=>{const c=new THREE.Mesh(geo,m);c.userData.crKeep=1;c.userData.sd=sd;c.visible=false;host.add(c);return c})}
 if(ud.crFl&&B){const W=B.max.x-B.min.x,H=B.max.y-B.min.y,L=B.max.z-B.min.z,on=!!s.nitro&&!boat;for(const c of ud.crFl){c.visible=on;if(on){const k=.75+Math.random()*.5;c.position.set((B.min.x+B.max.x)/2+c.userData.sd*W*.2,B.min.y+H*.2,B.max.z-L*.01);c.scale.set(W*.07*k,W*.07*k,L*.2*k)}}}}

// wheels on the ground + spin + steer, body never below the ground (runs every sim step, independent of rendering)
function CR_carPose(s,dt){const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m)return;CR_fx(s,ud);if((s.boatK||0)>.5){RO.crPX=RO.x;RO.crPZ=RO.z;return}const host=ud.m,W=[];
 host.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)});
 if(!W.length){RO.crPX=RO.x;RO.crPZ=RO.z;return}if(s.air){for(const w of W){w.userData.crSim=1;w.updateMatrixWorld();w.getWorldScale(_crS);w.rotation.x-=(RO.v||0)*dt/(w.userData.r*_crS.y)}RO.crPX=RO.x;RO.crPZ=RO.z;return}s.mesh.updateMatrixWorld(true);const need=[];let mx=-9;
 for(const w of W){w.userData.crSim=1;if(w.userData.by==null)w.userData.by=w.position.y;w.position.y=w.userData.by;w.updateMatrixWorld(true);w.getWorldPosition(_crA);w.getWorldScale(_crS);
  const r=w.userData.r*_crS.y,g=groundAt(_crA.x,_crA.z,_crA.y+1),d=g+.005-(_crA.y-r);need.push([w,d,_crS.y,r]);mx=Math.max(mx,d)}
 let lift=Math.max(Math.min(0,mx),mx-.22);
 for(const p of CR_bodyPts(ud)){_crA.copy(p).applyMatrix4(host.matrixWorld);lift=Math.max(lift,groundAt(_crA.x,_crA.z,_crA.y+1.5)+.02-_crA.y)}
 lift=clamp(lift,-.3,1.2);const gx=RO.x-(RO.crPX??RO.x),gz=RO.z-(RO.crPZ??RO.z);RO.crPX=RO.x;RO.crPZ=RO.z;let gd=gx*Math.sin(RO.h)+gz*Math.cos(RO.h);if(Math.abs(gd)>5)gd=0;host.position.y+=lift/(s.mesh.scale.y||1);
 for(const[w,d,sc,r]of need){w.position.y=w.userData.by+clamp(d-lift,-.12,.22)/(sc/(w.scale.y||1));w.rotation.x-=gd/r;if(w.position.z<-.2){w.rotation.order='YXZ';w.rotation.y=-(RO.dl||0)}}}
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
# steering + grip
R("RO.yr=(RO.yr||0)+(ytg-(RO.yr||0))*Math.min(1,dt*(c.steer||RO.dDir?6.5:4.5));RO.h+=RO.yr*dt;","RO.yr=CR_yaw(c,dt,ytg,maxR,air);RO.h+=RO.yr*dt;")
R("terr==='dirt'?(veh==='offroad'?8:2.6):13)*(RO.dDir?(terr==='road'?.15:.22):1)","terr==='dirt'?(veh==='offroad'?20:14):40)*(RO.dDir?(terr==='road'?.049:.22):1)")
# body roll / pitch
R("const target=clamp(-CTL.steer*.32*Math.min(1,s.v/30)+(RO.dDir?RO.dDir*.22:0)+wR,-.6,.6)","const target=clamp(bk*(-CTL.steer*.32*Math.min(1,s.v/30)+(RO.dDir?RO.dDir*.22:0))+(1-bk)*CR_roll()+wR,-.6,.6)")
R("clamp(acc*.004,-.09,.09)","clamp(acc*.0012,-.035,.035)")
# player wheels are posed by the sim, not by the render-time spin/clamp
R("o.onBeforeRender=function(...a){CR_clamp(this);return ob.apply(this,a)}","o.onBeforeRender=function(...a){if(this.userData.crSim)return;CR_clamp(this);return ob.apply(this,a)}")
R("say('',want==='boat'?'BOAT':want==='4x4'?'4×4':'SHIP',.6)","say('',want==='boat'?'BOAT':want==='4x4'?'4×4':'CAR',.6)")
# the hover ship's blue thruster fire (two glow puffs 3 m behind, 1.1 m to each side) is gone; boost = tailpipe flames (CR_fx)
R("function LK_boost(){if(state!=='roam'","function LK_boost(){return;if(state!=='roam'")

# default HOT ROD: no flame bricks on the body (read as "on fire"), rear tyres 1 stud wider so they show at the corners from behind
R("sym('flame',-4,-2,2,Y,5);","")
R("sym('wL',-4,3,0,K,wy('wL',.36));sym('flame',-4,3,2,Y,7);sym('flame',-3,3,2,o.acc2||'#fac80a',7);","sym('wL',-5,3,0,K,wy('wL',.36));")
# street props right in front of the lens (bollards, posts) no longer fill the screen: roam near plane 1.2 -> 2.0 m (the car is >= 4 m away)
R("camera.far=SET.q==='high'?3400:2600;camera.near=1.2;","camera.far=SET.q==='high'?3400:2600;camera.near=2;")
# chase camera: rigid distance + height, yaw lag 0.15 s, look direction snaps with camSnap
i=s.index('function roamCam(dt){');j=s.index('if(shake>0){camera.position.x+=',i)
CAM=r'''function roamCam(dt){const C=RCAM[SET.rcam]||RCAM.chase;const sn=camSnap;camSnap=false;const k1=clamp(Math.abs(RO.v)/Math.max(30,RO.top||60),0,1.4);
  RO.camH=sn||RO.camH==null?RO.h:RO.camH+angDiff(RO.h,RO.camH)*Math.min(1,dt*(RO.dDir?3:CR_CAMK));const fw=V3(Math.sin(RO.camH),0,Math.cos(RO.camH)),p=V3(RO.x,RO.y,RO.z);
  const bmax=C.b+C.bk*k1;let back=bmax;for(let d=2;d<=bmax;d+=.5)if(roamHit(RO.x-fw.x*d,RO.z-fw.z*d,1.5,RO.y+2.5)){back=Math.max(3.5,d-1);break}
  RO.camB=sn||RO.camB==null||back<RO.camB?back:RO.camB+(back-RO.camB)*Math.min(1,dt*3);RO.camY=sn||RO.camY==null?RO.y:RO.camY+(RO.y-RO.camY)*Math.min(1,dt*10);
  camera.position.set(RO.x-fw.x*RO.camB,RO.camY+C.h+C.hk*k1+(pl&&pl.air?2:0),RO.z-fw.z*RO.camB);if(camera.position.y<RO.y+2)camera.position.y=RO.y+2;
  {const vt=RO.vh??RO.h;RO.camL=sn||RO.camL==null?vt:RO.camL+angDiff(vt,RO.camL)*Math.min(1,dt*CR_CAMK);RO.camR=sn?0:(RO.camR||0)+((RO.yr||0)-(RO.camR||0))*Math.min(1,dt*3)}const vf=V3(Math.sin(RO.camL),0,Math.cos(RO.camL));camera.lookAt(p.clone().addScaledVector(vf,C.l+C.lk*k1).add(V3(0,C.ly,0)));camera.rotateZ(clamp(-RO.camR*.02,-.035,.035));'''
s=s[:i]+CAM+s[j:]
# outermost pose step for the player car
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+"\nroamPose=(f=>function(s,dt){f(s,dt);try{if(s===pl&&state==='roam'){CR_carPose(s,dt);const cp=camera.position;for(const st of RO.studs||[])if(st.alive&&st.m&&st.m.visible&&st.m.position.distanceToSquared(cp)<12.25)st.m.visible=false;for(const st of (typeof HUB!=='undefined'&&HUB.studFX)||[])if(st.alive&&st.m.visible){if(st.m.scale.x>.56)st.m.scale.setScalar(.55);if(st.m.position.distanceToSquared(cp)<20.25)st.m.visible=false}}else if(CR_SH&&state!=='roam')CR_SH.visible=false}catch(e){if(!CR_PS.e){CR_PS.e=1;console.warn('CR pose',e)}}})(roamPose);\n"+s[m.end(1):]
save()
print('OK')
