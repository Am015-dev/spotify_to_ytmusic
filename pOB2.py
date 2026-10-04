# OB: Euro-Skulptur rebuilt as a readable € (blue C arc, yellow bars, 12 stars, ~14 m), one merged geometry. Module: ob_euro.js
exec(open('P.py').read())
R('window.__mho={', open('ob_euro.js').read()+'\nwindow.__mho={')
R("""{const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z;box(3,3,3,x,1.5,z,'#8a8f98');cyl(.4,.4,4,x,5,z,'#8a8f98',8);{const g=new THREE.TorusGeometry(4,.75,8,24,Math.PI*1.6);g.rotateZ(Math.PI*.2);g.translate(x,10,z);A(g,'#2a4ab8')}for(const o of[-1,1])box(6.5,.7,.8,x-.6,10+o*.9,z,'#2a4ab8');
   for(let k=0;k<12;k++){const a=k/12*Math.PI*2;box(.9,.9,.4,x+Math.cos(a)*6.4,10+Math.sin(a)*6.4,z,'#ffd12c')}hit(x,z,2,2,17);reg('Euro-Skulptur',17,[x,z+0])}""",
"""{const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z,E=OB_euroBuild(bt,BM,x,z);hit(x,z,E.hw,E.hd,E.gy+14);reg('Euro-Skulptur',E.gy+14,[x,z+0])}""")
save()
