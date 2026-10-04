# OB roads: fixing the unconnected roads (Frankfurt and Athens A–D)

## Files
- `pOB3.py`: the patch. It has one `R()` and inserts `ob_roads.js`.
- `ob_roads.js`: a self-contained module. All its globals start with `OB_`.
- `tOB_roads.js`: a playwright test. It prints the before/after audit, asserts the targets, checks GPS and takes 10 map shots.
- `shots/ob_road_{1..5}_{before,after}.jpg`: roam-map crops of the 5 biggest repairs. A red ring marks each spot.

Build: `bash reapply.sh pOB3.py` prints REAPPLY_OK. Page size: overdrive.html is 3,570,531 B (base 3,547,490 B, ≤ 3.6 MB).

## Anchors replaced
| # | anchor (exact, first ~80 chars) | count | change |
|---|---|---|---|
| 1 | `const CITY_G=new Map();CITY_S.forEach(` | 1 | prepends `ob_roads.js`. The module runs `OB_fix()` there. |

That is the only text edit. The anchor sits right after the `CITY_S` street samples are built and before anything is derived from them: the `CITY_G` grid, Athens `AJ` key junctions, `JUNC` plates, road meshes, the filler grid, buildings, `HUB.nodes`, and the QV/GPS graph. As a result the drawn roads, junction plates, traffic graph, GPS (`__mho.qv.path`, `__mho.rsnap`) and minimap all come from the same repaired data.

The Frankfurt filler grid is repaired by rebinding the hoisted `function rfGrid` at runtime (`{const _g=rfGrid;rfGrid=function(){...}}`). This needs no text anchor. `OB_fillFix` runs right after the grid is generated, and it runs only once.

## Algorithm (load time, about 50–330 ms per city)
"Joined" uses the game's own rules:
- **Athens**: samples share a vertex key `p.k`, which is what builds `AJ`/`JUNC` and the traffic links.
- **Frankfurt**: the `JUNC` distance rule, i.e. any sample < 6 m from another street, or an end < w/2+10 m from one.

Deliberate cuts do not count as dead ends: the world edge (±44 m), the river bank and bridge ends. Bridge ends are joined through the bridge deck. Only drivable classes are audited; `ped` and `hill` trails are excluded.

The repair passes, in order:
0. **Despike**: drop OSM hairpin vertices. These are samples that double back by less than 8 m (cos < −0.7) and are not shared junctions. Some of them made a street fold back over its own junction with no plate.
1. **Crossings without a junction**: where two drivable centerlines intersect with no join within 3 m (Athens) or 8 m (Frankfurt), insert one shared sample into both streets. Athens: a new shared key. Frankfurt: coincident samples. This gives a junction plate and a GPS link.
2. **Dead ends**, up to 8 rounds. For each dead end, look for the nearest street point within 40 m, forward-biased (score = d·(1.6−0.6·cos)). Beyond 12 m the target must lie ahead. The connector must not cross water, a bridge deck or the world edge.
   - If a target is found, extend the end with samples every 8 m onto the target and insert or reuse a sample on the target street. The two are tied as one junction.
   - Otherwise, if the stub (dead end to its first junction) is under 40 m, trim it back to that junction. A street with no junction at all is deleted.
3. **Orphan fragments** (Athens; Frankfurt is tied together at runtime by the grid, bridges and Autobahn). Link an end of the fragment to the main component within 60 m, or within 150 m for fragments of 400 m or more. Fragments still unlinked and shorter than 400 m are removed.
   - After this pass, passes 1 and 2 run again, and then pass 1 repeats until no crossings are left (`OB_RA.crossLeft` = 0).
4. **Filler grid** (Frankfurt, axis-aligned `FILL_R`). Each dead grid end marches up to 40 m along its axis. The march is blocked by parks, plazas, landmarks, water and `BLOCK_C` building blocks.
   - If it hits another grid street's centerline or runs into a drivable city street, the end is extended to it.
   - Otherwise a stub under 40 m is trimmed to its last crossing.
   - Then `cross`, `FILL_X` (crossings across grids, so they get plates) and `FILL_G` are rebuilt, and grid pieces not in the main component are dropped.

## Debug API
- `__ob.roadAudit()` audits the CURRENT drawn network: CITY_S drivable streets, filler grid, bridges and Autobahn joins. It returns:
  `{stubs40, gaps12, deadEnds, noPlate, crossings, mainFrac, mainFracCity, orphans, orphanKm, segs, km, fillKm, fillDead, fillStub, fillGap, cityStubs40, cityGaps12, deadBld, qvCov (drawn street samples with a GPS node near), juncs, spots, noPlateAt}`.
- `__ob.RA` holds:
  - `before`: the raw street audit captured before the fix.
  - `fixed`: the same audit after the fix.
  - `ops`: counts per repair type.
  - `log`: every repair as `[type,x,z,metres]`.
  - `crossLeft`, `ms`.
- `localStorage.ob_nofix='1'` disables the whole repair, so before and after can be measured from the same build. `tOB_roads.js` uses this.
- `__ob.roadsNear(x,z,R)` lists the street samples near a point, with their junction keys.

## Before → after (tOB_roads.js, same build, `ob_nofix` on/off)
| city | segs | km | dead ends | stubs<40 | gaps<=12 | no-plate crossings | orphans | main % |
|---|---|---|---|---|---|---|---|---|
| fra | 304 -> 297 | 234.37 -> 233.28 | 377 -> 215 | 74 -> 0 | 68 -> 0 | 0 -> 0 | 8 -> 0 | 92.69 -> 100.00 |
| A | 605 -> 600 | 109.88 -> 110.94 | 136 -> 62 | 28 -> 0 | 10 -> 0 | 3 -> 0 | 4 -> 0 | 98.63 -> 100.00 |
| B | 847 -> 837 | 160.12 -> 161.31 | 131 -> 58 | 31 -> 0 | 12 -> 0 | 10 -> 0 | 11 -> 0 | 99.48 -> 100.00 |
| C | 900 -> 894 | 196.03 -> 196.94 | 188 -> 103 | 26 -> 0 | 11 -> 0 | 8 -> 0 | 6 -> 1 | 98.86 -> 99.21 |
| D | 673 -> 666 | 173.11 -> 173.98 | 223 -> 149 | 20 -> 0 | 7 -> 0 | 8 -> 0 | 9 -> 0 | 99.22 -> 100.00 |

Notes on the table:
- Frankfurt has 26 real streets and about 270 filler-grid streets. Almost all of its problems were in the grid: 74 stubs, 68 gaps and 17 km of orphan grid pieces.
- The GPS graph covers 100 % of drawn street samples afterwards (C: 99.3 %).
- GPS routes across each map still work. Frankfurt: 144 nodes, 4.0 km for 3.5 km direct.
- `tOB_roads.js`: **ALL PASS** (41 checks, zero page errors).

Repair counts (ops):
| city | repairs |
|---|---|
| fra | 2 street snaps, 82 grid extensions, 54 grid trims, 7 grid pieces dropped (orphan or < 12 m) |
| A | 7 spikes, 9 crossings, 54 snaps, 10 trims, 5 stub deletes, 2 orphan links |
| B | 7 spikes, 15 crossings, 56 snaps, 3 trims, 9 deletes, 6 links, 1 orphan dropped |
| C | 15 crossings, 61 snaps, 12 trims, 3 deletes, 2 links, 3 orphans dropped |
| D | 23 spikes, 8 crossings, 52 snaps, 7 trims, 3 deletes, 5 links, 4 orphans dropped |

## tHop
`PAGE=w_roads/local_dbg.html node tHop.js` reports **ALL PASS** for districts A–D (all GPS routes and hill streets, 0 airborne frames, 0 vy spikes, no page errors).

## Shots (roam map; the red ring marks the repair)
1. Frankfurt: a grid street extended 40 m to the next crossing.
2. Frankfurt: a street end snapped 37 m onto the network.
3. Athens A: Pittakou extended 40 m to Amalias at Hadrian's Arch.
4. Athens B: Alkiviadou, an orphan, linked 60 m to Sourmeli.
5. Athens D: an orphan linked 49 m.

## Known gaps
- Athens C keeps one 1.55 km fragment that is not linked to the main network: no end is within 150 m. Main-component share is 99.21 %, which meets the ≥ 99 % target.
- Dead ends of 40 m or more are kept as real cul-de-sacs (fra 215, mostly grid ends at parks and grid borders; A 62, B 58, C 103, D 149). None of them runs into a building (`deadBld` 0).
- Snap connectors are straight lines, so an end can bend to meet its target street.
