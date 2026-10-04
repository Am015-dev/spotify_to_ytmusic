# TR (terrain) anchors — pTR1.py

Exact-string replacements in base.html (each count = 1):

| # | Anchor | Change |
|---|--------|--------|
| 1 | `// ---------- Sachsenhäuser Berg (Henninger Turm / Goetheturm) and the Taunus in the north-west` | `tr_core.js` (+ `tr_data.js` grids) inserted before it |
| 2 | `function hillH(x,z){if(CID!=='fra')return shelfY(x,z,athHillH(x,z));` | Athens `hillH` = hill-feature mask only (`athHillH`) |
| 3 | `const groundY=CID==='fra'?(x,z)=>inRiver(x,z)?HWY:hillH(x,z)+tauH(x,z):(x,z)=>hillH(x,z);` | `groundY` → `TR_Y` (river stays `HWY`) |
| 4 | `const tH=CID==='fra'?(x,z)=>hillH(x,z)+tauH(x,z):(x,z)=>hillH(x,z);` | ground mesh height `tH` → `TR_Y` |
| 5 | `lim=.055*Math.max(L,1)` | junction-to-junction grade → `TR_GJ` (11 %) |
| 6 | `const G=.06;for(let it=0;it<3;it++)` | per-sample road grade cap → `TR_GR` (12 %) |
| 7 | `gy=hillH(cx,cz)-.3;` | Henninger Turm stands on `groundY` |
| 8 | `window.__mho={` | `tr_game.js` inserted before it |
| 9 | `hillRoads:()=>{const L=CITY_S.filter(S=>(S.prof\|\|S.r.cls==='hill')&&S.L>120)` | test API: hill streets only from inside the playable map and away from district gates (with real heights the highest pieces sit on the map edge / run through the A→B gate, which reloads the page) |
| 10 | `if(Math.abs(P[i].y\|\|0)>.25\|\|Math.abs(P[i-1].y\|\|0)>.25)cap(` | Athens placement: keep buildings clear only where a street profile leaves the real ground by > 1.5 m (was: any street above y = 0.25) |

Functions wrapped/reassigned (no text edits): `tauH`, `athBlurH`, `athShelfMark`, `athRoadProfiles` (tr_core.js);
`gndBuild`, `hubGrid`, `roamStep`, `roamPose`, `roamCam`, `buildRoam`, `miniPaint` (tr_game.js).
New globals are prefixed `TR_`; test API `window.__tr`.
