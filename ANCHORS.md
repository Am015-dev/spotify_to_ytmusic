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

# pSC2.py anchors (right after pSC1.py)
| # | anchor (exact, count 1) | where | change |
|---|---|---|---|
| 1 | `window.__mho={` | end of script | inserts sc2.js |
| 2 | `const s=sit?1.5:1,tf=g=>` | gb.js GB_figGeo | seated driver × `SC_K.drv` in world ships |
| 3 | `const SBC={ped:1.2,res:2.2,link:2.5,sec:3,main:3.2,arterial:4,hill:3}` | athBuildG | Athens road reserve `SC_K.sbA` |
| 4 | `q.road.w/2+2.5)return false;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+2.5)return false` | fpOK (Frankfurt) | footprint margin `SC_K.sbF` |

Wrapped: `GB_attach` (driver flag), `M1_goon` (goon size), `roamBounce` (glancing slide).
