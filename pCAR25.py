# CAR25: race tracks at a car's scale: every race track is narrowed from 22-60 m (built for 7 m hover ships) to 14-20 m
#        (0.38 x, clamped), so speed reads as speed. Everything lateral derives from HALF / MARGIN. Needs pCAR24.
exec(open('P.py').read())
if 'CR_trackW' in s:
    print('OK');raise SystemExit
assert 'CR_SPDCAM' in s, 'apply pCAR24 first'
R("W=def.w||48;HALF=W/2;","W=CR_trackW(def.w||48);HALF=W/2;")
JS0=r'''
function CR_trackW(w){return Math.min(20,Math.max(14,w*.38))}
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
