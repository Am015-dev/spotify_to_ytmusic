# CV: Athens unit hook (per-building seed: height, colour, balconies, shopfront, roofs, glass on Kifisias, villa gardens)
exec(open('P.py').read())
R("const put=(U,x,z,ry,c,s,fr)=>{const{w,d,fl,fh,k}=U,h=fl*fh+(k==='villa'?.4:.6),col=hx(pc(ATH_COL[k]))",
  "const put=(U,x,z,ry,c,s,fr)=>{CV_put(E,U,x,z,ry,c,s,fr);const{w,d,fl,fh,k}=U,h=fl*fh+(k==='villa'?.4:.6),col=(c0=>U.cvc??c0)(hx(pc(ATH_COL[k])))")
save()
