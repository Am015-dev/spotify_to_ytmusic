# CAR25a: (1) respawn camera: on the REBUILT frame the chase camera snaps behind the car, and the car stays visible during the
#         2 s grace (it used to blink: hidden every other 0.1 s, so it seemed missing for ~1 s);
#         (2) coupe glass (Alex: "fully transparent"): tinted smoky LEGO trans-black-blue windscreen, semi-opaque, driver still visible.
exec(open('P.py').read())
if 'CR25A' in s:
    print('OK');raise SystemExit
R("RO.wk=null;RO.hp=100;RO.inv=2;","RO.wk=null;RO.hp=100;RO.inv=2;camSnap=true;RO.camH=RO.camB=RO.camY=RO.camL=null;")
R("if(RO.inv>0)s.mesh.visible=Math.floor(RO.inv*10)%2===0;else if(!s.mesh.visible)s.mesh.visible=true;","if(!s.mesh.visible&&!(typeof M1!=='undefined'&&M1.ghost>0))s.mesh.visible=true;")
R("const CR_GM=new THREE.MeshPhysicalMaterial({vertexColors:true,transparent:true,opacity:.62,","const CR25A=1,CR_GM=new THREE.MeshPhysicalMaterial({color:new THREE.Color(.42,.48,.56),vertexColors:true,transparent:true,opacity:.7,")
save()
print('OK')
