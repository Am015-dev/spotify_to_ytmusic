# pART9 · v87e: van-chase dropped crates are real LEGO crates (module art9.js); hit radius follows the smaller crate
exec(open('P.py').read());exec(open('artlib.py').read())
ART_mod('art9.js')
RR("S.dropT=3.6;const o=new THREE.Mesh(QV.cg||(QV.cg=new THREE.BoxGeometry(1.6,1,1.6)),QV.cm||(QV.cm=new THREE.MeshStandardMaterial({color:0x9a6a3a,roughness:.7})));o.scale.setScalar(2.2);o.position.set(a.x,groundY(a.x,a.z)+1.1,a.z);",
   "S.dropT=3.6;const o=ART9_crate();o.rotation.y=a.h+(Math.random()-.5)*.5;o.position.set(a.x,groundY(a.x,a.z),a.z);")
RR("if(Math.hypot(o.x-RO.x,o.z-RO.z)<4.2&&RO.y<groundY(o.x,o.z)+4){o.dead=1;o.m.visible=false;RO.v*=.55;",
   "if(Math.hypot(o.x-RO.x,o.z-RO.z)<3.2&&RO.y<groundY(o.x,o.z)+3){o.dead=1;o.m.visible=false;RO.v*=.55;")
save()
