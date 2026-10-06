# CAR20: no glow ball around the car: the glow points that ride along with sparks (wall scrapes, bumps, swaps) are only spawned
#        more than 14 m from the camera (near the lens one 6-unit point covered the whole car). Needs pCAR19 (pCAR18 dropped).
exec(open('P.py').read())
if 'CR_glowFar' in s:
    print('OK');raise SystemExit
assert 'CR_boxWall' in s, 'apply pCAR19 first'
R("if(GLOWP&&!CR_noGlow&&Math.random()<.25)_em(GLOWP","if(GLOWP&&!CR_noGlow&&CR_glowFar(p)&&Math.random()<.25)_em(GLOWP")
JS0=r'''
function CR_glowFar(p){try{return p.distanceToSquared(camera.position)>14*14}catch(e){return true}}
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
