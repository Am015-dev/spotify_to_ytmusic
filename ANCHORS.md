# OB anchors (owner bugs) — patch order: pOB1.py → pOB2.py → pOB3.py

## pOB1.py (phantom brick bursts) — module ob.js
| anchor (exact, count 1) | change |
|---|---|
| `window.__mho={` | prepend ob.js (cause log, contact tests, auto-switch hysteresis); anchor re-emitted unchanged |
| `if(d>def.r+2.1\|\|Math.abs(p.y-RO.y)>4)continue;` (smashCheck) | `…\|\|!OB_touch(p.x,p.z,def.r))continue;` |
| `const d=Math.hypot(x-RO.x,z-RO.z);if(d<5&&Math.abs(c.y-RO.y)<3){` (hubTrafficStep) | `…&&OB_car(x,z,dx,dz,c)){` |
| `\|\|Math.hypot(k.x-P.x,k.z-P.z)>=5)continue;` (split-screen P2 traffic) | `…\|\|!OB_carP(k,P))continue;` |
Function rebinds in ob.js (no anchors): `debris`, `studBurst`, `FL_burst`, `roamStep` wrapped (logging only); `FL_raw`, `FL_terr` replaced.

## pOB2.py (€ sculpture) — module ob_euro.js
| anchor | change |
|---|---|
| `window.__mho={` | prepend ob_euro.js |
| the `{const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z;box(3,3,3,…reg('Euro-Skulptur',17,[x,z+0])}` block in lmBuildAll | `{…E=OB_euroBuild(bt,BM,x,z);hit(x,z,E.hw,E.hd,E.gy+14);reg('Euro-Skulptur',E.gy+14,[x,z+0])}` |

## pOB3.py (road network repair + audit) — module ob_roads.js
| anchor | change |
|---|---|
| `const CITY_G=new Map();CITY_S.forEach(` | prepend ob_roads.js (runs OB_fix() on CITY_S before grid/junctions/meshes/GPS graph are built); anchor re-emitted unchanged |
Function rebind (no anchor): `rfGrid` wrapped to repair the Frankfurt filler grid once.
