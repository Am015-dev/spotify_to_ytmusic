# CAR13: (1) race opponents (Cup / Race / Time trial / minigames / 2-player) sit on the road like the player car: no hover bob,
#            no underglow / thruster ribbons / flares / stock ship parts, a tight contact shadow, small outward roll, wheels spin
#        (2) roam handling with weight: progressive acceleration (0-100 km/h ~4.5 s), city top speed ~155 km/h, boost ~200 km/h,
#            braking ~11 m/s^2 with nose dive, the anti-stuck turn rotates instead of snapping, engine pitch climbs through gears
#        (3) FIRE button with the item icon whenever a power-up is held outside free roam (touch), Space on the keyboard
# Needs pCAR10.
exec(open('P.py').read())
if 'CR_RBX' in s:
    print('OK');raise SystemExit
assert 'CR_yaw' in s, 'apply pCAR10 first'
JS=r'''
// ---- (1) race cars on the road
const CR_RBX=new WeakMap();
function CR_raceHide(ud){if(ud.under)ud.under.visible=false;for(const r of ud.ribbons||[])r.visible=false;for(const f of ud.flares||[])f.visible=false;
 if(ud.carG)for(const o of ud.carG.children)if(o.visible&&!(o.userData.gb||o.userData.gbG||o.userData.crKeep||o===ud.boat||o===ud.wheels||Object.values(ud.gbV||{}).includes(o)))o.visible=false}
function CR_raceBox(s,ud){const host=ud.m,key=(ud.gbM?ud.gbM.length:0)+'|'+(s.vmode||'car');let o=CR_RBX.get(s);if(o&&o.k===key)return o;
 const q0=host.quaternion.clone(),p0=host.position.clone(),mq=s.mesh.quaternion.clone();host.quaternion.identity();host.position.set(0,0,0);s.mesh.quaternion.identity();s.mesh.updateMatrixWorld(true);
 const inv=new THREE.Matrix4().copy(s.mesh.matrixWorld).invert(),B=new THREE.Box3(),bb=new THREE.Box3(),m4=new THREE.Matrix4();
 host.traverse(m=>{if(!m.isMesh)return;let v=true,q=m;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}const mt=m.material;if(!v||mt&&(mt.transparent||mt.depthWrite===false||mt.blending===THREE.AdditiveBlending))return;
  if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bb.copy(m.geometry.boundingBox).applyMatrix4(m4.multiplyMatrices(inv,m.matrixWorld));B.union(bb)});
 host.quaternion.copy(q0);host.position.copy(p0);s.mesh.quaternion.copy(mq);if(B.isEmpty())return null;o={k:key,B};CR_RBX.set(s,o);return o}
posShip=(f=>function(s,dt,snap){f(s,dt,snap);try{if(!s||!s.mesh||(s.wreck&&s.dead>0)||state==='roam')return;const ud=s.mesh.userData;if(!ud.gbM||!ud.gbM.length||!ud.m)return;
  const boat=(s.boatK||0)>.5;CR_raceHide(ud);const o=CR_raceBox(s,ud);if(!o)return;const B=o.B;
  if(!s.air&&!(s.rollT>0)&&!boat){const tr=clamp((s.latV||0)*.004,-.035,.035);s.crRoll=snap?tr:(s.crRoll||0)+(tr-(s.crRoll||0))*Math.min(1,dt*8);
   const cr=Math.cos(s.crRoll),sr=Math.sin(s.crRoll),r2=rs.clone().multiplyScalar(cr).addScaledVector(us,sr),u2=us.clone().multiplyScalar(cr).addScaledVector(rs,-sr);
   ud.m.quaternion.setFromRotationMatrix(_m.makeBasis(r2,u2,fw.clone().negate()));ud.m.position.copy(F.u).multiplyScalar(-B.min.y+.02);ud.shield.position.copy(ud.m.position)}
  const sh=ud.shadow;if(sh){if(!sh.userData.crG){sh.geometry.computeBoundingBox();const g=sh.geometry.boundingBox;sh.userData.crG=[Math.max(.01,g.max.x-g.min.x),Math.max(.01,g.max.y-g.min.y,g.max.z-g.min.z)]}
   const G=sh.userData.crG;sh.scale.set((B.max.x-B.min.x)*1.1/G[0],(B.max.z-B.min.z)*1.05/G[1],1);sh.position.copy(F.u).multiplyScalar(.04);sh.visible=!s.air&&!boat&&s.mesh.visible;if(sh.material)sh.material.opacity=.55}
 }catch(e){if(!CR_RBX.e){CR_RBX.e=1;console.warn('CR race',e)}}})(posShip);
// ---- (2) roam handling with weight
const CR_VMAX=155/3.6,CR_VBOOST=200/3.6;
const CR_acc=(v,vm,b)=>Math.max(0,(b?14:7.5)*(1-Math.pow(Math.max(0,v)/vm,2)));
roamStep=(f=>function(dt){if(state!=='roam'||!pl||RO.wk||RO.frozen||!dt)return f(dt);const v0=RO.v||0,nb0=typeof SC_S!=='undefined'?SC_S.nb:0,air0=!!pl.air,c=CTL||{};
 if(RO.crTurn!=null){const e=angDiff(RO.crTurn,RO.h),k=Math.min(Math.abs(e),5*dt)*Math.sign(e);RO.h+=k;RO.vh=RO.h;if(Math.abs(e)<.02)RO.crTurn=null}
 const r=f(dt);if(RO.wk||!pl)return r;const bumped=(typeof SC_S!=='undefined'?SC_S.nb:0)!==nb0;
 if(!bumped&&!air0&&!pl.air){const boost=!!(RO.boosting||RO.turbo>0),vm=boost?CR_VBOOST:CR_VMAX;
  if(RO.v>v0&&RO.v>0)RO.v=Math.min(RO.v,v0+CR_acc(v0,vm,boost)*dt);
  if(RO.v>vm)RO.v=Math.max(vm,Math.min(RO.v,v0)-(Math.min(RO.v,v0)-vm)*1.6*dt);
  if(c.brk&&v0>0&&RO.v<v0)RO.v=Math.max(RO.v,v0-11*dt)}
 return r})(roamStep);
// wall hits: the velocity deflects at once, the body turns to the new heading over ~0.15 s instead of snapping
roamBounce=(f=>function(...a){const h0=RO.h;const r=f.apply(this,a);try{if(state==='roam'){const d=angDiff(RO.h,h0);if(Math.abs(d)>.12){RO.crBT=RO.h;RO.h=h0}}}catch(e){}return r})(roamBounce);
roamStep=(f=>function(dt){if(RO.crBT!=null&&dt){const e=angDiff(RO.crBT,RO.h),k=Math.min(Math.abs(e),6*dt)*Math.sign(e);RO.h+=k;if(Math.abs(e)<.02)RO.crBT=null}return f(dt)})(roamStep);
// engine pitch climbs through gears
AU.engine=(f=>function(s,thr,on){f.call(this,s,thr,on);try{if(!this.a||state!=='roam'||s!==pl)return;const kmh=Math.abs(RO.v||0)*3.6,G=[0,32,62,95,128,165,230];let g=1;while(g<G.length-1&&kmh>G[g])g++;
  const u=clamp((kmh-G[g-1])/(G[g]-G[g-1]),0,1),rpm=.32+.68*u,t=this.a.currentTime,fr=42+rpm*105+(s.air?20:0);this.o1.frequency.setTargetAtTime(fr,t,.04);this.o2.frequency.setTargetAtTime(fr*1.016,t,.04)}catch(e){}})(AU.engine);
// ---- (3) FIRE / item button in races
(()=>{const st=document.createElement('style');st.id='crFire';st.textContent=`html body.v85.crItem #tF{display:flex!important;align-items:center;justify-content:center;font:900 11px system-ui}html body.touch.v85.crItem #tF{font-size:0!important;color:transparent!important;position:absolute!important;left:auto!important;top:auto!important;right:calc(136px + env(safe-area-inset-right,0px))!important;bottom:calc(28px + env(safe-area-inset-bottom,0px))!important;width:56px!important;height:56px!important;transform:none!important;margin:0!important;background-size:70%!important;background-position:center!important;background-repeat:no-repeat!important;z-index:6}`;document.head.appendChild(st)})();
setInterval(()=>{try{const on=!!pl&&!!pl.item&&state!=='roam'&&state!=='menu'&&state!=='results'&&document.body.dataset.mode!=='roam';document.body.classList.toggle('crItem',on)}catch(e){}},120);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
# body pitch: braking dive / acceleration squat that you can see
R("clamp(acc*.0012,-.035,.035)","clamp(acc*.0045,-.06,.045)")
# anti-stuck: remember the target, CR rotates towards it
R("if(best!=null){RO.h=RO.vh=best;RO.yr=0;RO.v=Math.max(RO.v,10)}RO.stkT=0}}","if(best!=null){RO.crTurn=best;RO.yr=0;RO.v=Math.max(RO.v,10)}RO.stkT=0}}")
save()
print('OK')
