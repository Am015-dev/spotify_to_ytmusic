# PIT_REVIEW (rev-pit, beta.66 built page, 2026-10-16)

Tool: `node tools/pitscan.js out/<ver> --city fra|ath [--only terrain] [--quick] --json f.json` (terrain part: 1 s). Rerun after terr-6 pushes.

## Counts
| | FRA | ATH |
|---|---|---|
| basins >3 m deep (local <=250k m2, <=600 m from road/POI) | 36 | 286 |
| ...of those wall slope >25° | 23 | 212 |
| big enclosed valleys (>250k m2, listed only as count) | 11 | 12 |
| steep >30° clusters within 30 m of road/POI | 117 | 584 |
| sink/float >0.1 m (QUICK: 30 points only, not 300) | 4/30 | 8/30 |
| pass-through (UNRELIABLE, see below) | 0 hits | 0 hits |
| escape test, 5 worst pits stuck (10 s gas + auto-steer) | 3/5 | 5/5 |

## FRA pits (ranked by depth)
| # | x,z | depth m | wall ° | spill ° (at) | area m2 | nearest |
|---|---|---|---|---|---|---|
| 1 | 790,1520 | 24.1 | 54 | 8 (740,1510) | 15500 | 104 m Alleenring |
| 2 | 1370,1270 | 23.8 | 49 | 3 (1420,1220) | 24000 | 210 m Alleenring |
| 3 | 790,1720 | 19 | 49 | 3 (750,1970) | 27000 | 68 m Alleenring |
| 4 | -1800,1750 | 18.7 | 46 | 13 (-1880,1710) | 25800 | 309 m P:sm1 |
| 5 | -350,1740 | 18.5 | 48 | 3 (-260,1700) | 24700 | 60 m Alleenring |
| 6 | 1130,1270 | 18.2 | 40 | 38 (1160,1290) | 21700 | 279 m Alleenring |
| 7 | -1850,1990 | 17.6 | 39 | 29 (-1770,1960) | 21500 | 353 m Berger Straße |
| 8 | -550,1820 | 16.2 | 51 | 9 (-680,1760) | 24900 | 176 m Alleenring |
| 9 | -2060,1780 | 15 | 44 | 42 (-1970,1840) | 23500 | 386 m P:sm1 |
| 10 | 580,2600 | 14.1 | 23 | 9 (890,2310) | 175700 | 75 m Eschersheimer Landstraße |
| 11 | -540,1980 | 12.2 | 39 | 15 (-610,1990) | 14600 | 150 m P:tt |
| 12 | -330,1990 | 12.2 | 38 | 32 (-410,1960) | 25000 | 163 m P:tt |
| 13 | 2670,-2680 | 12.1 | 22 | 22 (2690,-2640) | 30200 | 209 m Mörfelder Landstraße |
| 14 | -770,1490 | 10.6 | 45 | 1 (-880,1460) | 3700 | 54 m Alleenring |
| 15 | -1260,1260 | 9.9 | 30 | 28 (-1280,1290) | 5600 | 78 m Alleenring |

## FRA steep >30° near road/POI (top 15 of 117)
| # | x,z | max slope ° | cells(10 m) | dist to road edge m | nearest |
|---|---|---|---|---|---|
| 1 | -740,-1260 | 73 | 316 | 24 | Darmstädter Landstraße |
| 2 | 1980,200 | 70 | 407 | 29 | Friedrich-Ebert-Anlage |
| 3 | 930,320 | 70 | 223 | 13 | Anlagenring |
| 4 | -840,-1980 | 69 | 633 | 17 | Darmstädter Landstraße |
| 5 | 320,480 | 68 | 202 | 21 | Freßgass |
| 6 | -880,-1910 | 66 | 482 | 17 | Darmstädter Landstraße |
| 7 | 440,460 | 65 | 50 | 2 | P:garage |
| 8 | -1940,560 | 64 | 533 | 22 | Alleenring |
| 9 | -330,-1630 | 62 | 252 | 23 | Sachsenhäuser Landwehrweg |
| 10 | -500,860 | 62 | 229 | 18 | Friedberger Landstraße |
| 11 | -1970,430 | 62 | 96 | 21 | Alleenring |
| 12 | -40,690 | 62 | 45 | 26 | Anlagenring |
| 13 | 1730,1420 | 61 | 157 | 19 | Alleenring |
| 14 | -430,840 | 60 | 192 | 19 | Friedberger Landstraße |
| 15 | -520,-1350 | 59 | 266 | 24 | Hainer Weg |

## ATH pits (ranked by depth)
| # | x,z | depth m | wall ° | spill ° (at) | area m2 | nearest |
|---|---|---|---|---|---|---|
| 1 | 550,-2500 | 48 | 63 | 13 (580,-2450) | 80000 | 54 m Vasileos Konstantinou |
| 2 | 2430,-1500 | 40.2 | 56 | 5 (2420,-1550) | 46000 | 54 m Melidoni |
| 3 | -730,-1090 | 38.8 | 55 | 19 (-660,-1080) | 18500 | 49 m Petrou Kokkali |
| 4 | 1070,-2620 | 37.6 | 58 | 24 (880,-2580) | 111900 | 67 m Ardittou |
| 5 | 2310,-1330 | 36.5 | 55 | 2 (2310,-1420) | 20900 | 48 m Agion Asomaton |
| 6 | 2470,-1270 | 35 | 51 | 9 (2520,-1250) | 5200 | 50 m Panagi Tsaldari |
| 7 | 1310,-310 | 34.7 | 52 | 24 (1090,-520) | 73200 | 62 m Tositsa |
| 8 | 2660,-780 | 34.4 | 57 | 35 (2720,-790) | 31600 | 53 m Konstantinoupoleos |
| 9 | 0,-220 | 34.2 | 53 | 25 (0,-260) | 19800 | 52 m Alexandras |
| 10 | 2530,-940 | 34.1 | 69 | 6 (2560,-980) | 60200 | 51 m Thermopylon |
| 11 | 1670,-780 | 32.4 | 52 | 12 (1700,-730) | 6300 | 47 m Sokratous |
| 12 | -2010,570 | 32.2 | 51 | 49 (-2040,570) | 16200 | 44 m Papada |
| 13 | -1830,470 | 32.1 | 50 | 5 (-1850,390) | 77000 | 51 m Kifisias |
| 14 | 2870,-1020 | 32 | 71 | 27 (2880,-1090) | 39700 | 54 m Artemisiou |
| 15 | 2140,-1570 | 31.5 | 52 | 33 (2200,-1540) | 15500 | 50 m Ermou |

## ATH steep >30° near road/POI (top 15 of 584)
| # | x,z | max slope ° | cells(10 m) | dist to road edge m | nearest |
|---|---|---|---|---|---|
| 1 | 2680,-1180 | 71 | 385 | 0 | Mykinon |
| 2 | 1790,-1690 | 71 | 191 | 4 | Athinas |
| 3 | 700,-2830 | 70 | 667 | 3 | Trivonianou |
| 4 | 2980,-840 | 70 | 567 | -1 | Pellis |
| 5 | -1930,-360 | 69 | 464 | -2 | Zagoras |
| 6 | 2470,-1080 | 69 | 351 | 4 | Kynaigeirou |
| 7 | 1870,-2090 | 69 | 154 | 0 | Dioskouron |
| 8 | -2780,1790 | 67 | 258 | -2 | Kifisias |
| 9 | 1730,-1780 | 66 | 252 | -2 | Pandrosou |
| 10 | 260,-1310 | 64 | 205 | 4 | Aristippou |
| 11 | 140,-990 | 64 | 198 | 8 | u |
| 12 | 960,-360 | 63 | 389 | 11 | Tsamadou |
| 13 | 1700,-2120 | 62 | 237 | 12 | Theorias |
| 14 | 1280,-2360 | 62 | 126 | -2 | Gkoura |
| 15 | 160,-230 | 61 | 566 | 9 | Alexandras |

## FRA sink/float points (quick, wheel/body vs raycast of rendered terrain+street ribbons; gap=wheel bottom - mesh, m)
| x,z | kind | wheelGap | bodyGap | physics-mesh |
|---|---|---|---|---|
| -686.5,-63.8 | open | -0.33 | 0 | -0.17 |
| -2944.9,367.6 | open | -0.12 | 0 | -0.13 |
| -390.3,-120.8 | road | 0.14 | 0 | 0.12 |
| -1497.9,238.6 | open | 0.21 | 0 | 0.02 |

## FRA escape test (5 worst pits)
| pit | x,z | depth | moved m | dist to road start>end | stuck |
|---|---|---|---|---|---|
| 1 | 790,1520 | 24.1 | 54 | 117>102 | YES |
| 2 | 1370,1270 | 23.8 | 32 | 223>246 | YES |
| 3 | 790,1720 | 19 | 235 | 81>316 | no |
| 4 | -1800,1750 | 18.7 | 13 | 259>263 | no |
| 5 | -350,1740 | 18.5 | 101 | 73>174 | YES |

## ATH sink/float points (quick, wheel/body vs raycast of rendered terrain+street ribbons; gap=wheel bottom - mesh, m)
| x,z | kind | wheelGap | bodyGap | physics-mesh |
|---|---|---|---|---|
| -4022.2,3594.1 | open | -0.46 | 0 | -0.26 |
| 1527.7,-2686.9 | road | 0.13 | 0 | -0.07 |
| 868.7,-1463.4 | road | 0.38 | -0.07 | -0.07 |
| -5498.5,6596.5 | open | 0.88 | 0 | 0.6 |
| 1469.3,-362.6 | open | 0.33 | 0 | 0.07 |
| -404,-749.2 | road | 0.11 | 0 | 0.06 |
| -4746,3749.6 | open | 0.11 | 0 | 0.03 |
| 1942.8,-215 | open | 0.19 | 0 | 0.03 |

## ATH escape test (5 worst pits)
| pit | x,z | depth | moved m | dist to road start>end | stuck |
|---|---|---|---|---|---|
| 1 | 550,-2500 | 48 | 11 | 55>65 | YES |
| 2 | 2430,-1500 | 40.2 | 17 | 58>53 | YES |
| 3 | -730,-1090 | 38.8 | 11 | 53>51 | YES |
| 4 | 1070,-2620 | 37.6 | 5 | 77>74 | YES |
| 5 | 2310,-1330 | 36.5 | 8 | 52>49 | YES |

## Pass-through: NOT DONE, scan unreliable
Horizontal-ray scan returned 0 solid hits in both cities (avg 2-4 candidate meshes within 30 m), so 0 means the scan does not see the buildings/props, NOT that none are missing colliders. Likely cause: building visuals are streamed instanced/batched meshes my bbox filter or step count does not reach; props are smashable by design (smashCheck), so they are excluded. No ramp/pass-through spots were found. Needs a worker that reads the building batch layout.

## Caveats
- groundY (raw terrain function) used for pits; 10 m grid; wall = steepest 10 m step on the basin rim ring; spill = slope at the lowest rim cell.
- Fra CITY_S has only 26 major streets (+POIs), so nearest-road distances in Fra are to major roads only.
- Escape stuck = not above rim-0.5 m and not within road half-width+3 m after 10 s. ATH pits barely moved (5-17 m): car cannot climb the walls.
- Proof shots (3 x 852x393) NOT taken (time).
- terr-6 session was archived, top-10 reached the coordinator only.
