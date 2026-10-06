# CAR19: the city box truck (truck / delivery / garbage truck) gets LEGO detail: dark cab side windows, a grille, ribs every
#        3 studs and a top rail on the cargo box (light-grey bricks, so the paint tint shows them as a darker shade), and
#        dark mudguards over every wheel. Needs pCAR17.
exec(open('P.py').read())
if 'CR_boxWall' in s:
    print('OK');raise SystemExit
assert 'CR_camHide' in s, 'apply pCAR17 first'
R(" add('T8x32',-4,-16,0,K,0);for(const z of[-15,5,10])sym('arch',-4,z,0,K,0),sym('wL',-4,z,0,K,wy);",
  " add('T8x32',-4,-16,0,K,0);for(const z of[-15,5,10])sym('arch',-5,z,0,K,1),sym('wL',-4,z,0,K,wy);")
R("add('ws6',-3,-16,0,B,7);sym('B1x3',-4,-16,0,B,7);",
  "add('ws6',-3,-16,0,B,7);sym('B1x1',-4,-16,0,B,7);sym('B1x2',-4,-15,0,K,7);for(const y of[3,4])for(const x of[-3,-1,1])add('grl',x,-17,1,'#d8dde4',y);")
R(" add('B8x21',-4,-10,0,W,3);add('B8x21',-4,-10,0,W,6);add('B8x21',-4,-10,0,W,9);add('B8x21',-4,-10,0,W,12);add('T8x21',-4,-10,0,W,15);",
  " for(const y of[3,6,9,12])CR_boxWall(add,sym,W,y);add('T8x21',-4,-10,0,W,15);")
JS0=r'''
// one layer of the truck's cargo box: a 6-wide core and side walls of panels with a lighter rib every 3 studs (top layer = rail)
function CR_boxWall(add,sym,W,y){const Rb='#c9ced6';add('B6x21',-3,-10,0,W,y);for(let k=0;k<7;k++){const z=-10+3*k;sym('B1x1',-4,z,0,Rb,y);sym('B1x2',-4,z+1,0,y===12?Rb:W,y)}}
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
