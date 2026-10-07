# Worker 13 (2026-10-07): see-through traffic, city speed feel, old planes in team select. Branch alex/od-w13 (src = live v87n 41e7926 re-split, verify_live LIVE_MATCH).
## 1. "Traffic cars are transparent"
Root cause: SC real-scale (96, buildHubTraffic wrapper) shrinks oversize traffic by cloning+scaling ONLY the body geometry. Glass/dark parts (im.userData.g) and tyres (im.userData.w) stayed full size:
truck/delivery/garbage body ×0.63-0.66 inside a full-size black frame + wheels = see-through skeleton (vans/SUVs slightly). Probe `tools/tW13.js TEST=geo` (bbox body vs glass vs wheels).
Fix (new `src/99a_w13_drive.js`, `W13_trafFit`): glass + wheels get the body's per-axis scale/offset right after buildHubTraffic, before ART8 builds shadow twins. Traffic tyre bottom 0.026 m.
Shots: docs/shots/w13/traffic_truck_before_after.jpg, side_city.jpg, side_autobahn.jpg.
## 2. "City driving slow like a bike"
Measured (tW13 TEST=speed, real GAS, FAST): live city street top 91 km/h (RO.inCity ×.62), 0-100 never; Autobahn 0-100 5 s, 171 km/h. FOV 68→76.
World: city lane 5.4 m (real 3.5), road 24 m kerb-to-kerb, dash period 8 m (3.8 m dash), car 4.5 m: wide roads make speed read low. Not changed (world geometry).
Fix (71 roamStep, W13S): city .82 (~121 km/h), open road 1.0 (147), throttle pull (1-(v/tt)²). Now city 0-60 2.5 s, 0-100 ≈5 s, top 121; AB 0-100 4.5 s, 173.
Camera (99a): chase b ×.92, h ×.9 via SC_RC0+SC_rcam. FOV (71 roamCam): 66 + min(24,14k+7k²), k=v/top (city 120 km/h ≈ 80°, was 76°). Speed lines (99a, W13_lines): 2D half-res canvas over #c, edges only, from 95 km/h, stronger on boost. No shake.
tPlay FAST phone 2 min: Fra walls 0/min (live .47), stuck 6.5 % (6.9), avg 75 km/h (63). Ath walls 1.87 (4.66), stuck 6.9 % (live 0; live DEBUG rerun 8.4 %: the bot orbits the first arrow target on both builds). First try with city .92 (135 km/h): Fra walls 1.4 → lowered to .82.
## 3. "Team select shows old planes"
Root cause: teamCard (40) still drew the pre-LEGO 2D plane silhouette. Now it renders each team's real shipMesh (LEGO car) once in a temp WebGL renderer (disposed after 4 s), cached per team; old drawing kept as fallback. Shot docs/shots/w13/teams.jpg.
Tools: tools/tW13.js (TEST=geo|kinds|traffic|speed|top|info), tools/tW13m.js (menu, team select, garage shots).
