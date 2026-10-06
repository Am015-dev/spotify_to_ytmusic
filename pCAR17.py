# CAR17: in races an AI car that passes through the chase camera is hidden for those frames instead of filling the screen
#        (any opponent less than 5.5 m in front of the camera or within 3.8 m of it; it reappears as it pulls level with the player). Needs pCAR16.
exec(open('P.py').read())
if 'CR_camHide' in s:
    print('OK');raise SystemExit
assert 'CR_minBack' in s, 'apply pCAR16 first'
JS=r'''
// ---- race: opponents never fill the lens
const CR_camHide=[],_crCF=new THREE.Vector3(),_crCD=new THREE.Vector3();
composer.render=(f=>function(...a){try{if(state!=='roam'&&state!=='menu'&&typeof ships!=='undefined'){const cp=camera.position;camera.getWorldDirection(_crCF);for(const s of ships){if(s.isPlayer||!s.mesh||!s.mesh.visible)continue;_crCD.copy(s.mesh.position).sub(cp);const dz=_crCD.dot(_crCF);if(_crCD.lengthSq()<3.8*3.8||(dz>-2&&dz<5.5&&_crCD.lengthSq()<8*8)){s.mesh.visible=false;CR_camHide.push(s.mesh)}}}}catch(e){}
 try{return f.apply(this,a)}finally{for(const m of CR_camHide)m.visible=true;CR_camHide.length=0}})(composer.render);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
