# pART5 · filler-grid streets + crossing squares draped onto the physics ground (no green/buried or floating streets) (module art5.js)
exec(open('P.py').read());exec(open('artlib.py').read())
ART_mod('art5.js')
RR("const g=new THREE.PlaneGeometry(w,L);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i),uv.getY(i)*L/32);g.rotateY(yaw);g.translate(cx,.035,cz);bt.add(g,M.road);",
   "const g=new THREE.PlaneGeometry(w,L,1,Math.max(1,Math.ceil(L/6)));g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i),uv.getY(i)*L/32);g.rotateY(yaw);g.translate(cx,0,cz);ART_drape(g,.035);bt.add(g,M.road);")
RR("const g=new THREE.PlaneGeometry(X.wa,X.wb);g.rotateX(-Math.PI/2);g.translate(X.x,.04,X.z);bt.add(g,jm)",
   "const g=new THREE.PlaneGeometry(X.wa,X.wb,Math.max(1,Math.ceil(X.wa/6)),Math.max(1,Math.ceil(X.wb/6)));g.rotateX(-Math.PI/2);g.translate(X.x,0,X.z);ART_drape(g,.04);bt.add(g,jm)")
RR("yy=c==='hill'||S.hs?.22:.045","yy=c==='hill'||S.hs?.07:.045")
# Athens crowds: 160 pedestrians spawning 15 m from the car read as a dense crowd at every crossing; same density as Frankfurt
RR("const PED_N=CID==='fra'?70:160","const PED_N=CID==='fra'?70:70")
RR("pedPlace(p,CID==='fra'?30:15,CID==='fra'?380:200)","pedPlace(p,30,CID==='fra'?380:260)")
save()
