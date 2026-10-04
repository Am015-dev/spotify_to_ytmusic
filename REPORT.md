# OB — owner bug fixes (phantom bursts, € sculpture, unconnected roads)

Patch order: `./reapply.sh pOB1.py pOB2.py pOB3.py` → REAPPLY_OK. Page 3,579,249 B (≤ 3.6 MB). Anchors: ANCHORS.md.

## 1 · Phantom brick bursts (pOB1.py, ob.js)
Every `debris` / `studBurst` / `FL_burst` call is logged with the function that fired it and whether a contact test passed that step (`__ob.B`).
`localStorage.ob_off=1` restores the old behaviour for before/after measurement.
Causes found:
- **Traffic**: any traffic car within 5 m counted as a crash, so overtaking a car in the next lane gave a full brick burst. Now the car outlines must overlap (oriented boxes, per vehicle type; also for split-screen P2).
- **Props**: a circle of r+2.1 m around the car's centre, so a lamp, bin, tree or parked car beside the car was smashed without contact. Now the prop must touch the car's footprint (2.5 × 4.9 m).
- **Auto vehicle switch**: flipped at the road edge (6 m margin, 0.35 s hold), firing two transform bursts per flip. Now pavement and verges up to 14 m past the edge count as road. A switch needs 0.9 s and 12 m on the new surface, with ≥ 3 s between switches, never mid-air.
- Other callers (goons, chases, M1/M2 walls, wreck, item crates) were already tied to real hits and are unchanged. LOD-culled props and invisible traffic were not a cause: all hit props were visible.

3-min open-road bot, old (`ob_off`) → new:

| | Frankfurt | Athens A | Athens B |
|---|---|---|---|
| Hits without contact (cars) | 7 → 0 | 10 → 0 | 4 → 0 |
| Hits without contact (props) | 0 → 0 | 26 → 0 | 11 → 0 |
| Vehicle flips while driving | 0 → 0 | 4 → 0 | 5 → 1 (the warp onto the road at start) |
| Kerb weave flips (3 streets) | 0–4 → 0 | 8–13 → 0 | 10–13 → 0 |

## 2 · € sculpture (pOB2.py, ob_euro.js)
The old sculpture was built at y=0 on ~21 m terrain. The terrain lift only raised the vertices near its 2×2 m collider, so the arc, bars and stars were torn apart.
The new one: a blue C arc (open right), two yellow bars, a ring of 12 gold five-pointed stars and a stone plinth.
- One merged vertex-coloured geometry in the existing landmark batch: 0 extra draw calls.
- Bbox 13.1 × 13.98 × 4.2 m; collider 6.8 × 4.2 m.
- Shots: `shots/ob_euro_before.jpg`, `shots/ob_euro_after.jpg`.

## 3 · Unconnected roads (pOB3.py, ob_roads.js; details in OB_roads_notes.md)
A load-time repair of `CITY_S` runs before the street grid, junction plates, meshes, traffic and GPS graph are built, so the drawn roads and the GPS graph share the same data. The Frankfurt filler grid is repaired via an `rfGrid` wrapper.
The repair:
- despike OSM hairpins;
- add shared junctions where streets cross without one;
- extend dead ends (≤ 40 m, never over water or bridges) or trim or delete short stubs;
- link or drop orphans.

Audit `__ob.roadAudit()`; `localStorage.ob_nofix=1` gives the before numbers.

| | stubs < 40 m | gaps ≤ 12 m | crossings without plate | main component |
|---|---|---|---|---|
| Frankfurt | 74 → 0 | 68 → 0 | 0 → 0 | 92.7 → 100 % |
| Athens A | 28 → 0 | 10 → 0 | 3 → 0 | 98.6 → 100 % |
| Athens B | 31 → 0 | 12 → 0 | 10 → 0 | 99.5 → 100 % |
| Athens C | 26 → 0 | 11 → 0 | 8 → 0 | 98.9 → 99.2 % |
| Athens D | 20 → 0 | 7 → 0 | 8 → 0 | 99.2 → 100 % |

Shots: `shots/ob_road_1..5_{before,after}.jpg` (roam map, red ring = repair).

## Tests (merged build)
- `node tOB.js`: **ALL PASS** (59 PASS: bursts, weave, € and the road audit via `tOB_roads.js`).
- `node tHop.js`: **ALL PASS** (A–D, 0 airborne frames, 0 vy spikes).
- `node tOB_euro.js`: renders the € screenshot.
- `node smoke.js .`: **SMOKE PASS** (348 s, 0 errors); `smoke/sheet.png` checked by eye.

## Known gaps
- Athens C keeps one 1.55 km fragment with no end within 150 m of the network (99.2 % still in the main component).
- Dead ends ≥ 40 m are kept as cul-de-sacs; none runs into a building. Snap connectors are straight.
- The cause log uses stack names (debug only, active when `__ob.logOn()`).
- The bot still crashes into real traffic and props on its route; those are logged as real hits with contact.
- Not verified on a real iPhone.
