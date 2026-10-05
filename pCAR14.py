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
# race chase camera sized for a 4.6 m LEGO car (was framed for the 7 m hover ship): 10.5 m back, 3.4 m up
R("back=18.5*tall*cd-(s.nitro?.8:0)","back=10.5*tall*cd-(s.nitro?.5:0)")
R("addScaledVector(up,5.8*tall*cd-(s.nitro?.4:0))","addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0))")
JS=r'''
(()=>{const st=document.createElement('style');st.id='crRaceHud';st.textContent=`html body.touch #itemBox{display:none!important}`;document.head.appendChild(st)})();
// laps: same race length in time at the lower car speeds
setupRace=(f=>function(cfg){try{if(cfg&&cfg.laps>1&&cfg.laps<20&&!cfg.crL){cfg=Object.assign({},cfg,{laps:Math.max(1,Math.round(cfg.laps*CR_RK)),crL:1})}}catch(e){}return f(cfg)})(setupRace);
// race pose: nose dives under braking, squats under throttle
posShip=(f=>function(s,dt,snap){f(s,dt,snap);try{if(!s||!s.mesh||state==='roam'||s.air||(s.rollT>0)||(s.boatK||0)>.5||(s.wreck&&s.dead>0)||!dt)return;const ud=s.mesh.userData;if(!ud.gbM||!ud.gbM.length)return;
  const acc=(s.v-(s.crPv??s.v))/dt;s.crPv=s.v;const tp=clamp(acc*.002,-.014,.01);s.crPitch=snap?tp:(s.crPitch||0)+(tp-(s.crPitch||0))*Math.min(1,dt*6);if(Math.abs(s.crPitch)<1e-4)return;
  _crQ.setFromAxisAngle(_crA.set(1,0,0),s.crPitch);ud.m.quaternion.multiply(_crQ);}catch(e){}})(posShip);
const _crQ=new THREE.Quaternion();
// race cars: the lowest tyre always touches the track (after roll / pitch), so no wheel sinks or floats
const _crW=new THREE.Vector3(),_crWS=new THREE.Vector3();
posShip=(f=>function(s,dt,snap){f(s,dt,snap);try{if(!s||!s.mesh||state==='roam'||s.air||(s.rollT>0)||(s.boatK||0)>.5||(s.wreck&&s.dead>0))return;const ud=s.mesh.userData;if(!ud.gbM||!ud.gbM.length)return;
  s.mesh.updateMatrixWorld(true);let mn=1e9;const P=s.mesh.position;ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(!v)return;
   w.getWorldPosition(_crW);w.getWorldScale(_crWS);const h=(_crW.x-P.x)*F.u.x+(_crW.y-P.y)*F.u.y+(_crW.z-P.z)*F.u.z-w.userData.r*_crWS.y;if(h<mn)mn=h});
  if(mn<1e8&&Math.abs(mn-.01)>.002){ud.m.position.addScaledVector(F.u,.01-mn);if(ud.shield)ud.shield.position.copy(ud.m.position)}}catch(e){}})(posShip);

'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
