# CAR22: the player's tyres rest on the visible asphalt: the wheel sim targets groundAt + 0.03 m (the road mesh sits ~3 cm above
#        the physics ground), was + 0.005. Independent of pCAR21.
exec(open('P.py').read())
if 'CR_TYRE_Y' in s:
    print('OK');raise SystemExit
assert 'CR_glowFar' in s, 'apply pCAR20 first'
R("d=g+.005-(_crA.y-r)","d=g+CR_TYRE_Y-(_crA.y-r)")
JS0=r'''
const CR_TYRE_Y=.03;
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
