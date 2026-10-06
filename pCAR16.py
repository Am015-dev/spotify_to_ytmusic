# CAR16: (a) English UI: race jump popup "JUMP!", jump banners "JUMP · <name> · FULL THROTTLE", start arch "START · FINISH", A5 label
#        (b) camera never inside the vehicle: the wall-avoid pull-in keeps at least the vehicle's own length behind it
#            (car 3.5 m, 4x4 5.5 m, boat 5 m) and rises when it has to come closer than its normal distance
exec(open('P.py').read())
if 'CR_minBack' in s:
    print('OK');raise SystemExit
assert 'CR_SMASHV' in s, 'apply pCAR15 first'
R("say('',s.v<need?'TOO SLOW!':'SPRUNG!',.8)","say('',s.v<need?'TOO SLOW!':'JUMP!',.8)")
R("'▲  SPRUNG · '+j.name+' · VOLLGAS  ▲'","'▲  JUMP · '+j.name+' · FULL THROTTLE  ▲'")
R("'START · ZIEL — '","'START · FINISH — '")
R("'A5 · SPRUNG'","'A5 · JUMP'")
# (b2) the vehicle-swap burst no longer fills the lens: half the sparks and bricks, dimmer, and no glow points over the car
R("debris(at,V3(0,9,0),16,['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff'].map(c=>new THREE.Color(c)),.7,RO.y);burst(SPARK,at,18,14,.35,new THREE.Color(2.2,2,1.4));",
  "CR_noGlow=1;try{debris(at,V3(0,5,0),8,['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff'].map(c=>new THREE.Color(c)),.45,RO.y);burst(SPARK,at,8,9,.25,new THREE.Color(1.3,1.2,.9))}finally{CR_noGlow=0}")
R("if(GLOWP&&Math.random()<.25)_em(GLOWP","if(GLOWP&&!CR_noGlow&&Math.random()<.25)_em(GLOWP")
R("back=Math.max(3.5,d-1);break}","back=Math.max(CR_minBack(),d-1);break}")
R("camera.position.set(RO.x-fw.x*RO.camB,RO.camY+C.h+C.hk*k1+(pl&&pl.air?2:0),RO.z-fw.z*RO.camB)","camera.position.set(RO.x-fw.x*RO.camB,RO.camY+C.h+C.hk*k1+(pl&&pl.air?2:0)+Math.max(0,bmax-RO.camB)*.35,RO.z-fw.z*RO.camB)")
JS=r'''
let CR_noGlow=0;
function CR_minBack(){const v=pl&&pl.vmode||'car';return v==='4x4'?5.5:v==='boat'?5:3.5}
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS+s[m.start(1):]
save()
print('OK')
