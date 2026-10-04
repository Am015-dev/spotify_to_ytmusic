# RL3 (release integration, v83): otg2 under seamless Athens. og.js keyed its spot placement on ATHD, and with pSM ATHD follows the car,
# so every border crossing re-ran the full placement over the merged map (tSM: 0.24–1.26 s frame at crossings, ×4 CPU) and spots near
# other districts' borders were not excluded (tOG "on gate"). In seamless mode OG now places once for all of Athens A–D: district filter
# off, key without ATHD, fixed seed (same layout whatever district you boot in), per-area theme from the area's own district.
# No-op when seamless is off (localStorage mho_sm='0'). Applied after pSM6.
exec(open('P.py').read())
R("function OG_inD(x,z){return CID==='fra'||athIn(ATHD,...RW(x,z))}",
  "function OG_SM(){try{return CID!=='fra'&&!!SM_ON}catch(e){return false}}\nfunction OG_dOf(x,z){for(const d of Object.keys(ATH_DIST))if(athIn(d,...RW(x,z)))return d;return ATHD}\nfunction OG_inD(x,z){return CID==='fra'||OG_SM()||athIn(ATHD,...RW(x,z))}")
R("return CID+'|'+(CID==='fra'?'':ATHD)+'|'","return CID+'|'+(CID==='fra'||OG_SM()?'':ATHD)+'|'")
R("OG_rng((CID==='fra'?7:ATHD.charCodeAt(0)*977)+G.n)","OG_rng((CID==='fra'?7:OG_SM()?65*977:ATHD.charCodeAt(0)*977)+G.n)")
R("OG_TH.ath[ATHD];A[a]={th,n:0}","OG_TH.ath[OG_SM()?OG_dOf(L[0][0],L[0][1]):ATHD];A[a]={th,n:0}")
save()
