# pSC1.py anchors (apply after pDR*, before pSM*)
| # | anchor (exact, count 1) | where | change |
|---|---|---|---|
| 1 | `window.__mho={` | end of script | inserts sc.js (globals `SC_K`, `SC_S`, `SC_*`, `window.__sc`) |
| 2 | `const hb=roamHit(nx,nz,2.2,RO.y);if(hb){const pp=bldPush(hb,nx,nz,2.2)` | roamStep | 3-circle collision hull `SC_hit` / `SC_push` |
| 3 | `S2=.66;` | pedStep | pedestrian scale `SC_K.ped` |
| 4 | `g.scale.setScalar(1.7);g.userData={arm,ex}` | minifig() | quest / passenger minifig scale `SC_K.fig` |
| 6 | `addScaledVector(fw,-2.6).addScaledVector(rs,sd*2.1)` | roamPose skid marks | `SC_K.skid` |
| 7 | `JU.drop+=(2.2*JU_ss` | ju.js roamCam wrapper | × `SC_cam()` |
| 8 | `lim=boost?27:24` | ju.js roamCam wrapper | × `SC_cam()` |
| 9 | `lat>4.8&&lat<8` | ju.js near miss | band 2.9–5.5 m |

Wrapped (no text edits): `roamPose`, `sprintStart`, `buildHubTraffic`, `roamBounce` (counter only). `RCAM` presets are rescaled from a saved copy.
