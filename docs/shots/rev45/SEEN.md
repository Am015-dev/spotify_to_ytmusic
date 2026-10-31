# rev45 SEEN: og3 (one HUD kit), BUILT page out/rev45, phone profile (iPhone UA, touch, 6x CPU), Frankfurt
Files: `{ON,OFF}_{1roam,2race,3builder}_{land,port}.jpg`, montages `land_ON_over_OFF.jpg` (top row ON) and `port_ON_over_OFF.jpg` (left 3 ON), `*_4roam_after_builder_land.jpg`. 2K reference: `ref2k_any_race_street_01.jpg`. ON = `?og1=1&og3=1`. Harness: `shots_rev45.js`.

Reference (2K race street): place top-left, lap and time small top-right, minimap bottom-left, a thin boost bar on the bottom edge. Nothing sits on the car or in the centre.

## Landscape 852x393
- **ON reads as one game.** All 3 modes show the same dark pill strip at top centre (place · lap · time) and the same speed pill at bottom centre, in the same italic font. OFF has 3 different layouts: a small top-right speed in roam; the neon race HUD in race (place/time top-left, "079 KPH" top centre, "LAP 1/1" over the minimap); a "0 km/h · CAR · CP 0/3 · LAP 1/2" text line plus a "-/6" plate in the builder.
- **The speed pill sits on the car.** In race it covers the rear wheels and bumper ("72 KM/H" over the car), and in roam and builder its top edge touches the bumper. 2K keeps that area clear.
- **Two boost meters.** In the race (top right) and in roam portrait (left), the old segmented `#boostCells` meter is still visible, next to the kit's `#hkBoost` bar.
- **Noise in roam:** the top strip reads "-- FREE 00:16.7". There is no place in free roam, and the timer is a stopwatch since you entered roam. The builder shows "--" until the race has a place.
- GAS is in all 3 modes ON (the race had no GAS OFF). No HUD rect is over the touch controls in any mode or size (probe: overTouch [] ×6). OFF builder landscape: the countdown `#bxCd` overlaps `#bxG`, and ON has no overlap.

## Portrait 390x844
- ON: the pill is top-right under the strip in all 3 modes, and the builder's is lowered under its button row. It is consistent and nothing sits over the controls or the car. Race: the pill lies over the 3D start gantry text, which is readable but busy.
- OFF race: "KPH" is **6.24 px** (under 12). ON: no text under 12 px in any mode or size (probe `small: []` ×6).

## Behaviour
- Race ON is `thrEff()==='pedal'`: let go of GAS and the car coasts (72 → 37 km/h in 3 s). OFF is auto (96 km/h without a touch).
- Builder → close → `enterRoam()`: `#touch` is shown and GAS is visible, both ON and OFF. 0 page errors in either run.
