# Garage ride audit (garage-18, 2026-10-10): v90h

Alex: "lot of bugs in the garage: some are inside the floor, some have a dummy base with small wheels, I see errors."

Tool: `g18/audit.js <url> <out> [ids]`, env `SHARD=i/n`. Phone 852×393 with real touch: GARAGE → RIDES → STREET / OFF-ROAD / WATER tab → tap each card
(thumbnail) → wait for the model chunk and the build-up → stage shot + card thumbnail. Per ride it measures the lowest visible ride geometry against the
platform top (`gap`, m in garage units), the lowest tyre, a bare base plate, base-ship meshes drawn with it, the visible form, and console errors.
Sheets: `python3 g18/sheet.py <dir> <out.jpg> <title>`; grids per the shot rule: `tools/grid.py`.

## Results

| | rides | off the floor (abs(gap) > 0.05) | sunk | floating | dummy base plate | console errors |
|---|---|---|---|---|---|---|
| BEFORE (v90f src) | 83 | 79 | 77 (to −0.98) | 2 | 1 (3180) | 0 |
| AFTER (v90h = v90g + fix) | AFTER_N | AFTER_BAD | | | 0 | AFTER_ERR |

Sheets: `docs/shots/g18_before.jpg`, `docs/shots/g18_after.jpg`; grids `docs/shots/garage18/GRID*.jpg`.

## Root causes

1. **Platform height measured mid build-up** (all "inside the floor" reports, 77 rides). `GS_fitY` (98s) puts the platform under the lowest
   VISIBLE wheel and runs on the first garage frame after a ride shows. Since the v90b build-up (98ba) that frame has the real ride hidden and the
   first batches falling from 1.8 units up. The platform was set from a wheel in mid-air (ride up to 0.98 m into the floor) or, with no wheel batch
   visible yet, reset to its default (0.19 m into the floor). Only the first ride opened on a fresh garage stood right. Off-road monsters sank
   about 1 m, so only a flat body and the tops of the wheels showed: the **"dummy base with small wheels"**.
   Fix (`src/98gf_garage_floor.js`): measure the ride at rest (the hidden real meshes, never the falling batches).
2. **Rides without wheels** (all boats, LDraw rides with their own tyres): no wheel → the platform stayed at its default and hulls sank into it
   (Power Boat −0.48). Fix: no wheel → the lowest point of the ride's own geometry.
3. **Bare-chassis plate under LDraw rides with their own tyres** (3180 Tanker Cab): `GB_attach` (92) draws the build plate under every brick list
   without a catalogue wheel (`CR_isW`). The dark plate showed under the truck, and the platform was fitted to it (the truck floated 0.35 m).
   Fix: a brick list with imported LDraw parts gets no plate.
4. **Dark dithered patch on the platform** (coordinator, build-8, rescue-1: 1572/6668/6526/6669/621/6507): the platform's tile plane sat 1 mm
   above its dark rim box, so it z-fights when the camera is far (BUILD, big rides). It stays with shadows off; it's gone with the rim 3 cm lower.
   Fix: `src/98s_garage_studio.js` rim top 3 cm under the tiles.
5. **Console errors**: 0 in every run of all rides (before and after). Alex's "errors" were not reproduced here: Chromium headless only, no iPhone Safari.

## Not changed (model data, reported)
- 60083 Snowplow: the blade hangs 7 cm below the tyre line; tyres are on the floor (gap 0), the blade dips into the tiles.

## Thumbnails vs stage
The card thumbnail is drawn from the same brick list as the stage (`G9C_render` → `GB_attach`), so the model matches. Before the fix the stage
differed only by the floor height, and by the plate under 3180.
