# CV: Athens unit hook (per-building seed: height, colour, balconies, shopfront, roofs, glass on Kifisias, villa gardens)
# release-82: also accepts the ownerbugs2 (pOC1) form of the anchor, where OC_fix(U) runs first; CV_put then sees the clamped storeys
exec(open('P.py').read())
T="const{w,d,fl,fh,k}=U,h=fl*fh+(k==='villa'?.4:.6),col=hx(pc(ATH_COL[k]))"
N="const{w,d,fl,fh,k}=U,h=fl*fh+(k==='villa'?.4:.6),col=(c0=>U.cvc??c0)(hx(pc(ATH_COL[k])))"
H="const put=(U,x,z,ry,c,s,fr)=>{"
OC="U=OC_fix(U,x,z);"
if s.count(H+OC+T)==1: R(H+OC+T, H+OC+"CV_put(E,U,x,z,ry,c,s,fr);"+N)
else: R(H+T, H+"CV_put(E,U,x,z,ry,c,s,fr);"+N)
save()
