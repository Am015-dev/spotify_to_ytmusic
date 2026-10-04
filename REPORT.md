# OC — owner bugs 2 (night lights, Acropolis, heights, props on roads)

Patch order: `pOC1.py` only (inserts `oc.js` + 13 small anchors, see ANCHORS.md). `./reapply.sh pOC1.py` → REAPPLY_OK. Page 3.58 MB (≤ 3.6 MB).
Scale: 1 world unit = 1 m (checked: WP(e,n) maps real metres 1:1 around the centre, hill frame sx = sz = 1; terrain = real DEM metres).

## 1 · Night lights
- Headlights: the 3.4 x 11 m flat white quad is replaced by a fan (14 x 8 cells, 20 m long, 1.9 → 14 m wide) whose vertex colour fades
  along its length ((1-t)² after a 6 % ramp) and to both edges ((1-u²)²). Peak added light 0.24 (≤ 0.25), additive, depthWrite off,
  16 cm above the road plus polygon offset (no z-fighting). Same single instanced mesh for all traffic + player as before.
- Street lamps: the 1.4 m white glow ball under every head becomes a small flattened bulb (0.8 x 0.3 m); a warm pool of light sits on
  the ground under every lamp (10 m, tilted to the slope, one instanced draw call for all lamps, hidden by day, smashed lamps lose it).
  The pool is 6 concentric discs adding 0.04 each (peak 0.24): in this renderer a gradient texture or vertex colours on the pool both
  came out black (verified with debug renders), a plain additive colour works.
- Race-track lamp pools (MAT.pool) capped at 0.24.

## 2 · Acropolis (real scale, real positions)
- Plateau: hill data 123 x 86 radii at the hill centre moved 8 m south; plateau raised to 156 m a.s.l. (real summit). Measured on the
  ground (flat top within 0.3 m): **269 x 154 m** (real ~270 x 156). 66 m above the median street within 450 m, 72 m above the lower
  quartile (Plaka side). Steep cliffs (0.27 rim), western approach ramp + 22 marble steps to the Propylaea.
- Base bug fixed: the old plateau ring wall was lifted by the full plateau height in TR_bldFix → a ~130 m tall curved wall. The ring is
  skipped; OC builds circuit walls (open to the west) after the terrain fix.
- Monuments (offsets from the Parthenon centre, from Wikipedia coordinates and the site plan): Parthenon 69.5 x 30.9 m stylobate on 3
  steps, 8 x 17 Doric columns (46) 10.43 m, entablature, both pediments (apex 17.4 m above the stylobate), ruined cella, inner porches,
  scaffolding on the west front and a 46 m tower crane on the north side; Erechtheion (23.5 x 11.6 m, east porch 6 Ionic columns, north
  porch, caryatid porch with 6 korai on the south side); Propylaea (central gate with 6+6 Doric columns and pediments, Pinakotheke,
  SW wing); Temple of Athena Nike (8.27 x 5.64 m, 4+4 Ionic columns) on its bastion; Odeon of Herodes Atticus (76 m cavea, 28 m arched
  stage wall); Theatre of Dionysus (cavea on the south slope, orchestra, stage foundations). One merged batch (LBatch), colliders on
  every monument. Old generic temples / crane are skipped.

## 3 · Heights (before → after, measured by `__oc.audit()`)
| object | before | after | real / range |
|---|---|---|---|
| Athens street tree | 4.8 m | 6.5 m | 6-12 |
| olive tree | 3.7 m | 6.1 m | 6-12 |
| Frankfurt trees (tree/tree2/tree3) | 10.3 / 8.6 / 10.7 | unchanged | 6-12 |
| lamp post | 7.4 m | 7.4 m | ~8 |
| parked cars (car…car4) | 3.0-3.5 m tall, 5.9-6.3 m long | 1.6 x 1.95 x 4.6 m | ~1.5 |
| traffic cars | 3.0-3.45 m | 1.6 m | ~1.5 |
| vans / trucks / buses | 2.5-3.8 m tall, 3.45 m wide | 2.5-3.4 m, 2.5 m wide | 1.9-4.3 |
| Athens trolleybus | 5.5 m | 4.2 m (with poles) | |
| scooter + rider | 2.35 m | 1.75 m | ~1.7 |
| neoclassical storey | 4.2 m | 3.3 m | 3-3.3 |
| polykatoikia, central districts | 3-8 storeys (65 below 5) | 5-8 | 5-8 |
| polykatoikia, old town / outer | up to 7 (81 above range) | 3-5 / 3-6 | |
| Frankfurt Altstadt core (Römer-Dom-Paulsplatz) non-landmark blocks | 19-76 m | 14.5-18 m (4-5 storeys incl. roof) | 3-5 storeys |
| Commerzbank / Messeturm | 259 / 257 m | unchanged | 259 / 257 |
| Main Tower | 248 m with antenna (roof 200) | unchanged | 240 with antenna / 200 roof |
| Athens Tower | 103 m | unchanged | 103 |
| Lycabettus summit | 256.6 m a.s.l. (DEM rounds the peak) | 277 m (smooth 190 m cone) | 277 |
| Acropolis plateau | ~250 x 140 m, 148 m a.s.l. | 269 x 154 m, 156 m a.s.l. | 270 x 156, 156 |

Floating / buried: props sit on the lowest ground under their footprint (and come up if below ground); props on > 1 m footprint relief
are dropped; colliders whose uphill side was buried > 1 m are lifted to (highest corner − 0.8 m) on a stone plinth (OC_unbury).
Frankfurt bridge piers / quay walls standing in the riverbed (36) are excluded on purpose.

## 4 · Props on drivable surfaces
OC_props (city props) and the biome-prop filter use one rule: footprint (½ radius, cars 1.1 m) must stay off every street, filler road,
Autobahn, biome road, trail, Taunus road and junction disc (exact segment distances). Trees, benches, posts… are pushed off the road
when a free spot exists 0.6-2 m further out, otherwise dropped; parked cars that overlap the carriageway are dropped.
Kept on purpose (gameplay smash pickups / roadworks placed on lanes): bricks, tower, gold, cone, barrier, clight.

## Tests (final build)
- `node tOC.js` (Frankfurt + Athens A, B, C, D): **ALL PASS**, 30 checks.
  - Night (fra, Athens A): headlight peak +0.21 (≤ 0.25), lamp pools peak 0.24 under 8,538 / 1,666 lamps, additive, depthWrite off;
    beam region of the night screenshot: 0 % near-white pixels, 0 % flat near-white.
  - Acropolis: plateau 269 x 154 m, 156 m a.s.l.; Parthenon 69.5 x 30.9 m, 8 x 17 = 46 columns; all 6 monuments + crane with colliders;
    screenshots street / aerial / summit (shots_oc/).
  - Height audit: 0 outliers in every city/district (21-28 rows each), 0 floating > 0.3 m, 0 buried > 1 m.
  - Props on roads: 0 in every city/district — 176,275 samples (346 km) Frankfurt, 72,592 / 96,856 / 107,226 / 94,479 samples Athens A-D
    (137-204 km each). Fixed at build: Frankfurt 80 moved, 1,007 dropped (643 parked cars, 363 lamps on the Autobahn centre line);
    Athens A-D 130-174 moved, 2,625-4,848 dropped (almost all curb-parked cars), ≤ 38 trees per district.
- `tHop.js` districts A, B, C, D: ALL PASS (0 airborne frames, 0 vy spikes).
- `node smoke.js .`: SMOKE PASS (608 s), contact sheet checked.

## Known gaps
- The player vehicles were not resized (stylised gameplay models, physics/camera tuned to them).
- Altstadt cap squashes kit models vertically (their window rows get shorter).
- Neoclassical storeys follow the owner's 3-3.3 m rule (real neoclassical floors are ~4 m).
- Many curb-parked cars are gone in Athens (2,600-4,800 per district overlapped the carriageway), and the Frankfurt Autobahn median lamps
  (placed on the centre line) are dropped; they could be re-placed on the verge later.
- From street level the convex south slope hides most of the summit; the aerial and summit shots show the monuments.
- Monument offsets come from Wikipedia coordinates plus the site plan (Pleiades pages were bot-blocked); expect ±10 m.
