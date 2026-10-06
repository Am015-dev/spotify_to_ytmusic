# CAR23: spark glow points are also skipped within 8 m of the player's car (a 6-unit glow point 15 m from the camera still
#        covered the whole car, e.g. the mid-air burst over a ramp jump). Needs pCAR22.
exec(open('P.py').read())
if 'CR_glowCar' in s:
    print('OK');raise SystemExit
assert 'CR_TYRE_Y' in s, 'apply pCAR22 first'
R("function CR_glowFar(p){try{return p.distanceToSquared(camera.position)>14*14}catch(e){return true}}",
  "function CR_glowFar(p){try{if(p.distanceToSquared(camera.position)<=14*14)return false;return CR_glowCar(p)}catch(e){return true}}\nfunction CR_glowCar(p){const m=typeof pl!=='undefined'&&pl&&pl.mesh;return !m||p.distanceToSquared(m.position)>8*8}")
save()
print('OK')
