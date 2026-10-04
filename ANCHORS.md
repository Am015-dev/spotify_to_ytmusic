# CV anchors (traffic signals & rules, city variety)
Patch order: `pCV1.py` → `pCV2.py`. Module: `cv.js` (all globals prefixed `CV`/`CV_`, test hooks `window.__cv*`).

| patch | anchor (exact, count 1) | change |
|---|---|---|
| pCV1.py | `window.__mho={` | `cv.js` inserted before it |
| pCV2.py | `const put=(U,x,z,ry,c,s,fr)=>{const{w,d,fl,fh,k}=U,h=fl*fh+(k==='villa'?.4:.6),col=hx(pc(ATH_COL[k]))` (athBuildG) | calls `CV_put(E,U,…)` first; colour = `U.cvc` (the original `pc()` is still called, so the RNG stream and layout are unchanged) |

Wrapped from the module (no text anchors; function declarations reassigned): `buildHubTraffic` (builds signals + Frankfurt variety after it),
`hubTrafficStep` (AI caps before, restore/blinkers/daredevil after), `pedStep` (kerb wait / walk phase), `CE_streets` (medians, tiled ped streets, fountains, parks after it).
Read-only uses: JUNC, CITY_S, HUB.nodes/cars/peds/blocks/bld/grp, districtAt, DIST_R, cityAt, groundY, roamHit, onAnyDeck, inRiver, season/saveSeason, feed, AU.
No ground height, terrain or building Y placement is touched (Frankfurt: only instance scale Y, tint and the collider height).
