# CAR21: city ramp jumps you can reach. A ramp takeoff gives a small launch boost (x1.12) and a floaty LEGO arc sized to the
#        takeoff speed: ~0.74 m of flight per km/h (65 m+ at a Rookie's normal ~88 km/h city speed, 45 m from ~55 km/h),
#        flown on lighter ramp gravity (14 instead of 30 m/s^2) so the landing stays soft (fall speed capped at 22 m/s, under the 24 m/s landing-damage line). Faster cars
#        still fly further. Race jumps are untouched (races use airStep). Needs pCAR20.
exec(open('P.py').read())
if 'CR_rampLaunch' in s:
    print('OK');raise SystemExit
assert 'CR_glowFar' in s, 'apply pCAR20 first'
R("RO.vy=Math.max(RO.vy,RO.rampV*1.15+3);RO.takeoff={x:RO.x,z:RO.z,r:RO.lastRamp};",
  "RO.vy=Math.max(RO.vy,RO.rampV*1.15+3);CR_rampLaunch(RO.lastRamp);RO.takeoff={x:RO.x,z:RO.z,r:RO.lastRamp};")
R("if(RO.y>g2+.05||RO.vy>0){RO.vy-=30*dt;RO.y+=RO.vy*dt;","if(RO.y>g2+.05||RO.vy>0){RO.vy-=(RO.crRJ?CR_RG:30)*dt;if(RO.crRJ&&RO.vy<-22)RO.vy=-22;RO.y+=RO.vy*dt;")
# the ramp arc ends on any ground contact (water and deck landings skip roamLanded)
R("}else if(g2-RO.y<1.6)RO.y+=(g2-RO.y)*Math.min(1,dt*14);else RO.y=g2;","}else{RO.crRJ=0;if(g2-RO.y<1.6)RO.y+=(g2-RO.y)*Math.min(1,dt*14);else RO.y=g2}")
JS0=r'''
// ---- city ramp launch: boost + an arc sized to the takeoff speed on lighter gravity (cleared on landing)
const CR_RG=14,CR_RJM=.74;
function CR_rampLaunch(r){try{if(!r||!(RO.v>3))return;const vb=Math.min(Math.max(RO.v,RO.v*1.12),Math.max(RO.v,CR_VBOOST));RO.v=vb;const kmh=vb*3.6;
 const D=kmh<=140?kmh*CR_RJM:140*CR_RJM+(kmh-140)*.35,T=D/vb,h0=Math.max(0,r.hgt||0);let vy=(CR_RG*T*T/2-h0)/T;vy*=Math.min(1,Math.max(.45,vb/15));
 RO.vy=Math.max(3,Math.min(20,vy));RO.crRJ=1}catch(e){}}
'''
JS=r'''
roamLanded=(f=>function(...a){RO.crRJ=0;return f.apply(this,a)})(roamLanded);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
