# pCAR24b: steering never sticks after a crash / off-road at low speed.
# Root cause: CR_yaw is a pure bicycle model (yaw = v/WB*tan(delta)) so at v~0 (after a wall hit, a wreck rebuild or on slow dirt) steering gave ~0 yaw.
# Fix: blend in an arcade pivot below ~32 km/h (fades with speed, follows travel direction / gear intent), and if pinned >2 s with no open direction, back off.
exec(open('P.py').read())
R("""const cap=Math.max(.35,maxR);return clamp(-(v/CR_WB)*Math.tan(RO.dl),-cap,cap)+(ytg-base)}""",
"""const cap=Math.max(.35,maxR),pv=Math.max(0,1-sp/9),dS=v>.3?1:v<-.3?-1:(c.brk&&!c.thr?-1:1);return clamp(-(v/CR_WB)*Math.tan(RO.dl)-st*1.15*pv*pv*dS,-Math.max(cap,1.15),Math.max(cap,1.15))+(ytg-base)}""")
R("""     if(best!=null){RO.crTurn=best;RO.yr=0;RO.v=Math.max(RO.v,10)}RO.stkT=0}}""",
"""     if(best!=null){RO.crTurn=best;RO.yr=0;RO.v=Math.max(RO.v,10);RO.stkT=0}else if(RO.stkT>2){RO.v=c.brk&&!c.thr?8:-8;RO.stkT=0;say('','UNSTUCK',.6)}}}""")
save()
