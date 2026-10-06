# CAR18: race opponents near the chase camera fade in/out over 1 m of distance instead of popping (pCAR17 was a hard hide)
# Needs pCAR17.
exec(open('P.py').read())
if 'CR_fadeA' in s:
    print('OK');raise SystemExit
assert 'CR_camHide' in s, 'apply pCAR17 first'
R("if(_crCD.lengthSq()<3.8*3.8||(dz>-2&&dz<5.5&&_crCD.lengthSq()<8*8)){s.mesh.visible=false;CR_camHide.push(s.mesh)}",
  "const a=CR_fadeA(Math.sqrt(_crCD.lengthSq()),dz);if(a<=.02){s.mesh.visible=false;CR_camHide.push(s.mesh)}else if(a<.98)CR_fadeOn(s,a)")
R("finally{for(const m of CR_camHide)m.visible=true;CR_camHide.length=0}",
  "finally{for(const m of CR_camHide)m.visible=true;CR_camHide.length=0;for(const[o,m]of CR_fadeR)o.material=m;CR_fadeR.length=0}")
JS=r'''
// opacity for an opponent at distance d from the camera, dz in front of it: 0 inside the pCAR17 zone, 1 a metre outside it
function CR_fadeA(d,dz){const c=(v,a,b)=>Math.min(1,Math.max(0,(v-a)/(b-a)));const aD=c(d,3.8,4.8),aZ=dz<=-2?1:Math.max(c(dz,5.5,6.5),c(d,8,9));return Math.min(aD,aZ)}
const CR_fadeM=new WeakMap(),CR_fadeR=[];
function CR_fadeOn(s,a){let C=CR_fadeM.get(s);if(!C)CR_fadeM.set(s,C=new Map());s.mesh.traverse(o=>{if(!o.isMesh||!o.visible||!o.material||Array.isArray(o.material))return;const m=o.material;let k=C.get(m);
 if(!k){k=m.clone();k.transparent=true;k.userData.crO=m.transparent?m.opacity:1;C.set(m,k)}k.opacity=k.userData.crO*a;CR_fadeR.push([o,m]);o.material=k})}
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
