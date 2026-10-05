# SC2 · humans 1.8 m, road/facade setback, forgiving walls (sc2.js) — applies right after pSC1.py. Anchors listed in ANCHORS.md.
exec(open('P.py').read())
R('window.__mho={',open('sc2.js').read()+'\nwindow.__mho={')
# seated garage driver: bigger only in world ships (GB_attach with cache, flagged by sc2.js)
R('const s=sit?1.5:1,tf=g=>','const s=sit?1.5*(SC_S&&SC_S.drv?SC_K.drv:1):1,tf=g=>')
# Athens: road reserve (building setback) per street class
R('const SBC={ped:1.2,res:2.2,link:2.5,sec:3,main:3.2,arterial:4,hill:3}','const SBC=SC_S&&SC_S.on?SC_K.sbA:{ped:1.2,res:2.2,link:2.5,sec:3,main:3.2,arterial:4,hill:3}')
# Frankfurt: building footprint sample points keep sbF beyond the street / filler-road half width
R('q.road.w/2+2.5)return false;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+2.5)return false','q.road.w/2+(SC_S&&SC_S.on?SC_K.sbF:2.5))return false;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+(SC_S&&SC_S.on?SC_K.sbF:2.5))return false')
save()
