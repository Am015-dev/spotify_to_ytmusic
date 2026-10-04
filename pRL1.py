# RL1 (release-82 integration): CV's per-building storey variation is clamped by OC's per-district storey range (owner rule from ownerbugs2).
# Applied after pCV2; no-op if oc.js is not in the page. The clamp sits inside the expression so CV's balconies/shopfronts use the final storey count.
exec(open('P.py').read())
A="U.fl=kif?7+Math.floor(h0*6):Math.max(3,Math.min(9,U.fl+[-1,0,0,1,2][Math.floor(h0*5)]))"
R(A,"U.fl=(f=>typeof OC_fix==='function'?OC_fix({...U,fl:f},x,z).fl:f)(kif?7+Math.floor(h0*6):Math.max(3,Math.min(9,U.fl+[-1,0,0,1,2][Math.floor(h0*5)])))")
save()
