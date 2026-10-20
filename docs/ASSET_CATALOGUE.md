# Asset catalogue (assets-r21p, batch 1): 29 part-list props

Source of truth: `A2_DEF` in `src/98a2_assets2.js` (each prop = a small parts list of bricks, cylinders and gable slopes in palette colours, the garage-builder approach). `window.__a2.table()` prints the rows below; regenerate with `tools/a2/probe.js <url> ath table` + `tools/a2/catalogue.js`.
Every prop is merged into ONE vertex-coloured geometry (shared palette `A2_PAL`), drawn instanced with ONE shared material. Limits (GO assets2/catalogue): ≤ 400 triangles, ≤ 3 palette colours, 1 material. All brick-built by us, so no external licence.
Placement is OFF unless `?assets2=1` (coordinator flips the default). Roam: kerb slots (Athens pool = Athens/both props only, Frankfurt = Frankfurt/both only), ≤ 5 instanced draws. Race: all race props of a track baked into one static mesh (1 draw).
**Collider** column is the record for the collision lane: `c` = circle of radius `cr` m around the origin (trunk/pole), `b` = footprint box (the `box` w×d, centred at `off` from the origin), `none` = decoration. Roam solids already get a plain push-out in A2 (no smash).

| id | name | category | city tag | tris | colours | box w×h×d (m) | box centre off x,z | collider |
|---|---|---|---|---|---|---|---|---|
| olive | Olive tree | tree | ath | 104 | tk,ol,ol2 | 3.31×3.35×3.23 | 0,0.08 | c r=0.35 |
| cypress | Cypress | tree | ath | 92 | tk,dg | 1.56×5.1×1.8 | 0,0 | c r=0.3 |
| aleppo | Aleppo pine | tree | ath | 104 | tk,pn,lg | 3.6×4.71×3.6 | 0.2,0 | c r=0.3 |
| plane | Plane tree | tree | both | 60 | st,lg,gr | 3.2×4.9×3.2 | 0,0 | c r=0.4 |
| bougain | Bougainvillea bush | bush | ath | 108 | tc,lg,mg | 1.36×1.6×1.33 | 0,0.03 | none |
| agave | Agave in pot | bush | ath | 120 | tc,ag,ol2 | 1.49×1.15×1.49 | 0,0 | none |
| apt1 | Whitewashed apartment block (5 floors) | building | ath | 288 | w,tc,bl | 9.5×16.4×9.64 | 0,0.57 | b |
| apt2 | Whitewashed apartment block (6 floors, setback) | building | ath | 228 | w,tc,bl | 7.5×17.95×8.64 | 0,0.57 | b |
| kiosk | Periptero kiosk | street | ath | 108 | cr,r,bl | 3.15×2.48×2.25 | 0.22,0.08 | b |
| taverna | Taverna table + parasol | food | ath | 232 | w,wd,r | 3.3×2.62×3.3 | 0,0 | c r=1.3 |
| column | Marble column | ruin | ath | 108 | st,mb | 1.24×3.88×1.24 | 0,0 | c r=0.5 |
| temple | Temple fragment | ruin | ath | 228 | st,mb,tn | 6.1×4.75×3.5 | -0.05,0 | b |
| church | Church with blue dome | building | ath | 208 | w,tc,bl | 6.18×7.5×6.4 | 0.39,0 | b |
| scooter | Parked scooter | vehicle | ath | 140 | r,k,w | 0.6×1.26×1.46 | 0,0.01 | none |
| taxi | Yellow taxi (parked) | vehicle | ath | 144 | y,k,w | 2.02×1.89×4.2 | 0,0 | b |
| trolley | Trolley-bus stop | street | ath | 104 | st,y,bl | 5×3.2×1.9 | 0.4,0 | b |
| wall | Stone wall segment | street | ath | 132 | st,tn,cc | 4.4×1.36×0.76 | 0,0 | b |
| rgate | Start/finish gate arch | race | race | 180 | r,k,w | 11.3×7.1×1.3 | 0,0 | b |
| rflags | Banner flags | race | race | 112 | k,r,w | 6.85×5×0.1 | 3.38,0 | none |
| rtyres | Tyre stack | race | race | 192 | k,r,w | 2.8×0.9×0.9 | 0.95,0 | c r=1 |
| rcones | Cone set | race | race | 240 | k,o,w | 2.3×0.75×2.3 | 0.8,0.8 | none |
| rbarrier | Concrete barrier | race | race | 72 | cc,r,w | 0.7×0.9×6.5 | 0,2.2 | b |
| rstand | Grandstand segment | race | race | 192 | cc,r,bl | 10.6×5.65×7.5 | 0,-3.15 | b |
| rpit | Pit sign | race | race | 92 | k,bl,w | 1.6×3.3×0.14 | 0,0.02 | c r=0.3 |
| rring | Checkpoint ring | race | race | 144 | y,k | 6×5.65×0.8 | 0,0 | none |
| rboost | Boost pad marker | race | race | 84 | k,y | 2.6×0.13×3.2 | 0,0 | none |
| timber | Half-timbered house | building | fra | 188 | cr,tc,tb | 6×9.6×7.8 | 0,0 | b |
| tram | Tram stop | street | fra | 92 | cc,bz,y | 5.28×3.05×1.8 | 0.44,0 | b |
| ebbelwoi | Apple-wine tavern table | food | fra | 228 | wd,bz,ol2 | 2.4×1.16×1.85 | 0,0 | b |

City sets: **Athens** (ath + both): olive, cypress, aleppo, plane, bougain, agave, apt1, apt2, kiosk, taverna, column, temple, church, scooter, taxi, trolley, wall. **Frankfurt** (fra + both): plane, timber, tram, ebbelwoi. **Race** (both cities): plane, rgate, rflags, rtyres, rcones, rbarrier, rstand, rpit, rring, rboost.
Palette keys: see A2_PAL.

