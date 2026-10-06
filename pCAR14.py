# CAR14: race physics (Race / Cup / Time trial / Zone / Arena / Derby / Junction / 2-player, player + AI + race traffic) on the same
# car scale as free roam: Rookie top ~155 km/h (Pro 185, Elite 215), nitro +30 % (~200 km/h for Rookie), 0-100 km/h ~4.5 s,
# braking ~12 m/s^2, weight you can see (nose dive / squat + small outward roll on the race pose). Jump gravity scales with the
# speed (same arcs, so every jump still clears), traffic keeps the same relative speed, laps shrink so a race lasts about as long
# as before. Needs pCAR13 (race pose).
exec(open('P.py').read())
if 'CR_RK' in s:
    print('OK');raise SystemExit
assert 'CR_RBX' in s, 'apply pCAR13 first'
R("const BASE_TOP=120;","const CR_RK=.42,BASE_TOP=120*CR_RK;")
R("stats:{top,top0:BASE_TOP*cls.mul,acc:42*cls.mul*team.acc,brake:55*cls.mul,han:team.han,hull:team.hull}","stats:{top,top0:BASE_TOP*cls.mul,acc:8.4*cls.mul*team.acc,brake:8+cls.mul,han:team.han,hull:team.hull}")
R("pl.stats.acc=42*m*t.acc;pl.stats.brake=55*m;","pl.stats.acc=8.4*m*t.acc;pl.stats.brake=8+m;")
R("if(s.turbo>0)a+=18*cls.mul;if(s.boost>0)a+=26*cls.mul;if(s.nitro)a+=36*cls.mul;","if(s.turbo>0)a+=4.5*cls.mul;if(s.boost>0)a+=6.5*cls.mul;if(s.nitro)a+=9*cls.mul;")
R("+(s.boost>0?20*H:0)+(s.nitro?30*cls.mul*H:0)","+(s.boost>0?5*H:0)+(s.nitro?7.5*cls.mul*H:0)")
R("AI_BRK=52","AI_BRK=14")
# glow trails under race cars: the radial speed blur smeared each car's colour down the track. Off in races (speed lines stay).
R("FX.uniforms.uSpeed.value=lerp(FX.uniforms.uSpeed.value,(state==='menu'?.2:spd*.7)*fxK(),Math.min(1,dt*4))","FX.uniforms.uSpeed.value=lerp(FX.uniforms.uSpeed.value,(state==='menu'?.2:0)*fxK(),Math.min(1,dt*4))")
# softer race roll (pCAR13 pose)
R("const tr=clamp((s.latV||0)*.006,-.06,.06);","const tr=clamp((s.latV||0)*.004,-.035,.035);")
# smash studs: small, low glow, pulled to the bumper height (not over the roof), never filling the lens
R("dy=RO.y+1.4-p.y","dy=RO.y+.6-p.y")
R("dy=RO.y+1.4-st.m.position.y","dy=RO.y+.6-st.m.position.y")
R("emissiveIntensity:.8,metalness:.8,roughness:.25","emissiveIntensity:.3,metalness:.8,roughness:.3",2)
R("if(st.m.scale.x>.56)st.m.scale.setScalar(.55)","if(st.m.scale.x>.41)st.m.scale.setScalar(.4)")
R("shipKey.position.copy(sp).addScaledVector(F2.u,6).addScaledVector(F2.t,-7)","shipKey.position.copy(sp).addScaledVector(F2.u,11).addScaledVector(F2.t,4)")
R("const shipKey=new THREE.PointLight(0xe4ecff,160,48,2)","const shipKey=new THREE.PointLight(0xe4ecff,70,40,2)")
# the wet-road light streak every ship dragged 3 m behind it in its team glow colour (a thruster trail): cars have none
R("for(const s of ships){if(s.dead>0||s.eliminated||s.air)continue;const g=s.mesh.position,f=s._fw;if(!f)continue;streak(g.clone().addScaledVector(f,-3.2),Yup,_sc.set(s.team.glow),wet*1.1,2.4)}","")
# race chase camera sized for a 4.6 m LEGO car (was framed for the 7 m hover ship): 10.5 m back, 3.4 m up
R("back=18.5*tall*cd-(s.nitro?.8:0)","back=10.5*tall*cd-(s.nitro?.5:0)")
R("addScaledVector(up,5.8*tall*cd-(s.nitro?.4:0))","addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0))")
JS=r'''
(()=>{const st=document.createElement('style');st.id='crRaceHud';st.textContent=`html body.touch #itemBox,html body.touch #itemChip,html body.touch #boostCells,html body.touch #hullCells,html body.touch #boostCells~.lab,html body.touch #spdbar~.lab{display:none!important}`;document.head.appendChild(st)})();
// laps: same race length in time at the lower car speeds
setupRace=(f=>function(cfg){try{if(cfg&&cfg.laps>1&&cfg.laps<20&&!cfg.crL){cfg=Object.assign({},cfg,{laps:Math.max(1,Math.round(cfg.laps*CR_RK)),crL:1})}}catch(e){}return f(cfg)})(setupRace);
// race pose: the wheels stay level on the track; only the body (bricks) leans: roll outward in turns, nose dive / squat
const _crD=new THREE.Vector3(),_crF=mkF(),_crQ=new THREE.Quaternion(),_crEu=new THREE.Euler(),_crW=new THREE.Vector3(),_crWS=new THREE.Vector3();
posShip=(f=>function(s,dt,snap){f(s,dt,snap);try{if(!s||!s.mesh||state==='roam'||s.air||(s.rollT>0)||(s.boatK||0)>.5||(s.wreck&&s.dead>0))return;const ud=s.mesh.userData;if(!ud.gbM||!ud.gbM.length)return;
  ud.m.quaternion.setFromRotationMatrix(_m.makeBasis(rs,us,fw.clone().negate()));
  if(dt){const acc=(s.v-(s.crPv??s.v))/dt;s.crPv=s.v;const tp=clamp(acc*.003,-.025,.02);s.crPitch=snap?tp:(s.crPitch||0)+(tp-(s.crPitch||0))*Math.min(1,dt*6)}
  _crQ.setFromEuler(_crEu.set(s.crPitch||0,0,s.crRoll||0));ud.crBody=1;
  ud.m.traverse(o=>{if(!o.isMesh||o.userData.r||!o.userData.gb)return;const u=o.userData;if(!u.crP0){u.crP0=o.position.clone();u.crQ0=o.quaternion.clone()}o.position.copy(u.crP0).applyQuaternion(_crQ);o.quaternion.copy(_crQ).multiply(u.crQ0)});
  ud.m.traverse(w=>{if(w.isMesh&&w.userData.r&&w.userData.crY0!=null)w.position.y=w.userData.crY0});s.mesh.updateMatrixWorld(true);let mn=1e9;const P=s.mesh.position,WH=[];ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(!v)return;
   w.getWorldPosition(_crW);w.getWorldScale(_crWS);_crD.copy(_crW).sub(P);const al=_crD.dot(F.t),la=_crD.dot(F.r);frameAt(TD,s.dist+al,_crF);_crD.copy(_crW).sub(_crF.p).addScaledVector(_crF.r,-(s.x+la));const h=_crD.dot(_crF.u)-w.userData.r*_crWS.y;if(h<mn)mn=h;WH.push([w,h]);w.userData.crS=_crWS.y/(w.scale.y||1)});
  if(mn<1e8)ud.m.position.addScaledVector(F.u,.01-mn);if(ud.shield)ud.shield.position.copy(ud.m.position);
  // suspension: each wheel drops onto the track under it (max 0.2 m)
  for(const[w,h]of WH){const u=w.userData;if(u.crY0==null)u.crY0=w.position.y;const d=Math.min(.2,Math.max(0,h-mn));w.position.y=u.crY0-d/Math.max(1e-3,u.crS||1)}}catch(e){}})(posShip);
// back in free roam: the player's bricks return to their built pose
roamPose=(f=>function(s,dt){try{const ud=s&&s.mesh&&s.mesh.userData;if(ud&&ud.crBody){ud.crBody=0;ud.m.traverse(o=>{const u=o.userData;if(u&&u.crP0){o.position.copy(u.crP0);o.quaternion.copy(u.crQ0)}if(u&&u.crY0!=null){o.position.y=u.crY0;u.crY0=null}})}}catch(e){}return f(s,dt)})(roamPose);
// the key light that lit the old hover ship from behind made a bright white cone on the glossy race track: lift it above the car, softer
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
