# HANDOFF dev-5 (2026-10-13/14): sink fix, green blob, fast test harness

## Done (all on alex/od-int2)
- **Sinking parked car** (98of_onfoot.js OF_settle): three causes.
  1. Settle ran roamPose, whose TR_tilt already leans ud.m to the slope, then tilted pl.mesh again (slope doubled). ud.m is now kept level.
  2. OF_cam/OF_step re-posed the parked car at OF.car.y every frame; the settled height is now kept in OF.car.py.
  3. The slope fit used road + tyre radius (big rear wheels pitched the car nose-down); it now uses the road only.
  - Check: OF_parkChk(). GO v90k/park-sit (in-page assert): Hot Drop P1 start (2062,0), exit, tyres ≤ 0.05, body ≥ 0, pitch/roll ≤ 1° vs the road.
  - Also tools/tParkSit.js (standalone, slow).
- **Green blob** = OG.imC (named ogCollectible): the district collectible, a translucent unlit lathe "vase", coloured per district (Gallus = #5dd16a mint).
  - OG_tick only runs in the car, so on foot the vase froze in the lane. Fix: OF_ogVis hides OG.grp on foot.
  - Marker glows (97_art squashed sky beams, named beaconGlow) now follow their ground ring (ART_glowSync, also from roamHud so it runs on foot).
  - GO v90m/green-blob (in-page assert), check ART_blobChk().
  - The in-car look of the vase (art-1: upright 3D collectible on the ground, no markers on buildings) was handed to dev-4.
- **Harness**:
  - Warm page: __tq.reset() in 98tq returns to a clean roam at the boot spot without a reload (~25 ms). tChkGo resets between items and reloads only on navigation.
  - &draw=0 stubs avatar() (one canvas portrait cost 2.6 s of headless font set-up).
  - tChkGo screenshots are opt-in (SHOTS=1).
  - build.sh --local falls back to attic/P.py.

## Wall times (headless, this container)
| run | before | now |
|---|---|---|
| lane TAG run (3 GOs, fra) | 39 s | 25 s |
| full fra suite | 116 s (2 boots) | 92 s (1 boot) |
| full suite fra+ath parallel (tools/tGo.sh) | – | 99 s, 281/296 |
| fra boot (draw=0) | 17.4 s | ~15 s |
| ath boot (draw=0) | 40 s alone, ~50 s in parallel | unchanged |

## Next (coordinator's list: gym, fast-time sim, node unit tests, shards)
1. **Athens boot** (profile with CDP Profiler, ?test=ath&draw=0):
   - athShelfY (53_terrain_roads) takes 8.3 s self / 11 s inclusive, from ~10 M TR_Y calls with ≥3 M unique points.
   - "Planting trees & lamps" takes 12 s (buildHubProps → tH → groundY).
   - Ideas: per-8 m sub-cell segment prefilter in athShelfY (exact, keeps sum order); cook a heightfield like QTC (10b_qt_data.js, tools/qtdump.js).
   - Frankfurt ART7_quad live fit ≈ 3.5 s, which a fra QTC would cut, but it adds page size (cap 3.6 MB; load it as a separate file).
2. **Gym** (?gym=…): there's no small-world mode yet. Frankfurt LAZY outskirts already stream (98cl_stream). A gym could cap the build radius around the spawn.
3. **Node unit tests**: the code is one global script; you'd need a vm context with THREE + data modules, or extract the pure functions.
4. Remaining slow GOs: art1/road-gap 20.6 s (renders its own picture), v90k/ath-flip 16 s, v90n/cam-go-bus 5.7 s, v90k/kerb-park 4.9 s.

## Tools
- Probes in qa_dev5/ on alex/od-dev1: probe.js, blob.js, og.js, view.js.
- Render a fixed camera in headless with renderer.render + canvas.toDataURL in the same task; a plain screenshot gets the game's own frame.
- Always use &draw=0 for state tests. Rendering with software GL runs at about 1 fps.
