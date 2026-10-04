# OC anchors (pOC1.py, applied on the live base v81)

Every `R(old,new)` in `pOC1.py`, all count 1. Everything else lives in `oc.js` (inserted once before `window.__mho={`) and extends
existing functions by wrapping/reassigning them.

| # | anchor (old text) | change | why |
|---|---|---|---|
| 1 | `["akro","Acropolis",65,-490,125,70,55,"mesa",{"apron":3.2,"cliff":0.3}]` | centre `65,-498`, radii `123,86`, cliff `0.27` | plateau measures 270 x 156 m on the ground (flat top within 0.3 m), Parthenon ~45 m from the south cliff |
| 2 | `const H0=A.H;for(let j=0;j<nz;j++)` (TR_init) | prefix `top=OC_top(top);` | plateau at the real summit level, 156 m a.s.l. |
| 2b | `TR_W={r,nx,nz,h};return TR_W}` (TR_init) | `OC_lyka(h,nx,nz,r);` before | Lycabettus summit back to 277 m a.s.l. (the 20 m DEM rounds it to 257 m) |
| 3 | `if(A){const N=64,pt=t=>` (athTerrainBuild) | `if(A&&OC.ring0){…` (skipped) | the base ring wall was lifted by the full plateau height in TR_bldFix (a ~130 m tall wall); OC builds the circuit walls after the fix |
| 4 | `const have=id=>HUB.lmk.find(L=>L.id===id)` (athLandmarksBuild) | `!OC.skip.test(id)&&…` | the old Parthenon / Erechtheion / Propylaea / Odeon / crane are skipped, OC builds them |
| 5 | `const put=(U,x,z,ry,c,s,fr)=>{const{w,d,fl,fh,k}=U,` (athBuildG) | `U=OC_fix(U,x,z);` first | polykatoikia storeys clamped to the range of the district they stand in (no random draw consumed) |
| 6 | `CT.push(performance.now());HUB.props=L;` (buildHubProps) | `OC_props(L,D);` before | props off the drivable surface (moved or dropped), sunk to the lowest footprint ground, real tree/car sizes |
| 7 | `continue;out.push({t,x,z,y:y??groundY(x,z)` (lzPropsG, biome props) | `if(OC_onRoad(t,x,z))continue;out.push({gp:y==null,t,x,z,y:y??OC_gy(t,x,z)` | same rule for lazily built biome props |
| 8 | `MAT.pool.opacity=.38*m.lamps` (race-track lamp pools) | `.24*m.lamps` | no light pool brighter than +0.25 |
| 9 | `fl:3+Math.floor(rnd()*3),fh:3.1,nb:1}` (interior pass) | `fl:OC_ifl(…,sty)` | central interior polykatoikia 5-7 storeys (same random draw) |
| 10 | `fh:4.2}` (athSpecK neo) | `fh:3.3}` | storey height 3.3 m |
| 11 | `neo:athIM(BM.neo,4.2)` | `3.3` | facade UV repeat follows the storey height |
| 12 | `for(const L of LMX)cap(L.x,L.z,L.x,L.z,L.r+4,3);` (athBuildG raster) | `+OC_zone(cap);` | Acropolis south slope (Odeon - Theatre of Dionysus) kept free of apartment blocks, as in reality |
| 13 | `window.__mho={` | `oc.js` + `window.__mho={` | module insert |

Wrapped / reassigned in oc.js: `FL_headlights` (replaced: soft beam + lamp-pool step), `hubGrid` (Altstadt cap before the terrain fix;
unbury + Acropolis after it), `buildHubProps` (lamp bulbs + pools), `hubTrafficStep` (traffic vehicle sizes once per hub).
