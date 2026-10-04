# SC · real-world roam scale (sc.js) — applies after pDR*, before pSM*. Anchors listed in ANCHORS.md.
exec(open('P.py').read())
R('window.__mho={',open('sc.js').read()+'\nwindow.__mho={')
# roam collision hull: three circles along the heading (was one 2.2 m circle)
R('const hb=roamHit(nx,nz,2.2,RO.y);if(hb){const pp=bldPush(hb,nx,nz,2.2)','const hb=SC_hit(nx,nz,RO.y);if(hb){const pp=SC_push(hb,nx,nz)')
# pavement minifigs 2.6 m -> 1.9 m
R('S2=.66;','S2=SC_S&&SC_S.on?SC_K.ped:.66;')
# quest / passenger minifigs 6.8 m -> 2.0 m (kit pilot and drivers set their own scale afterwards)
R('g.scale.setScalar(1.7);g.userData={arm,ex}','g.scale.setScalar(SC_S&&SC_S.on?SC_K.fig:1.7);g.userData={arm,ex}')
# ownerbugs' oriented car boxes (OB_cdim half width/length) follow the scaled km cars (player box OB_HW/OB_HL 1.25 × 2.45 already matches 2.24 × 5.0 m)
R('/truck|delivery|van/.test(n)?[1.3,3.3]:[1.15,2.4]','/truck|delivery|van/.test(n)?(SC_S&&SC_S.on?[1.05,2.9]:[1.3,3.3]):(SC_S&&SC_S.on?[1.04,2.35]:[1.15,2.4])')
# skid marks under the (narrower) car
R('addScaledVector(fw,-2.6).addScaledVector(rs,sd*2.1)','addScaledVector(fw,SC_S&&SC_S.on?-SC_K.skid[1]:-2.6).addScaledVector(rs,sd*(SC_S&&SC_S.on?SC_K.skid[0]:2.1))')
# juice camera (ju.js): drop + pull limit scale with the chase camera; near-miss band follows the car widths
R('JU.drop+=(2.2*JU_ss','JU.drop+=(2.2*SC_cam()*JU_ss')
R('lim=boost?27:24','lim=(boost?27:24)*SC_cam()')
R('lat>4.8&&lat<8','lat>(SC_S&&SC_S.on?2.9:4.8)&&lat<(SC_S&&SC_S.on?5.5:8)')
save()
