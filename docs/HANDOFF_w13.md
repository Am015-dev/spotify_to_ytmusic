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

## UPDATE 12:25 — status after reviewer FAIL on fe67bf2 (feel gate missing) — handoff to the next worker
Shipped separately: **v87o** = traffic fit + LEGO team cards only, branch alex/od-w13-v87o 6740222, out/v87o (DEPLOY sent to coordinator). The speed change is NOT shipped.
Branch alex/od-w13 (this) = v87o fixes + speed WIP. Speed WIP state in 71 (`W13S={city:.82,open:1,cp:2,scrub:0,lift:.6}`, `W13_corner`, `W13_lift`):
city top 121 km/h, 0-100 ≈5 s, open 147, AB 173; FOV/camera/speed lines in 99a. `W13_lift` cuts throttle up to 60% while hard lock is held >0.2 s above ~40 km/h.
`W13_corner` scrub (m/s² at full lock above 55 km/h, ramps in over ~1 s of held lock) is currently 0.
Feel probe: `tools/tW13f.js` (TEST=turn,slalom,brake; OFF=78 = same approach distance for both builds; quest abandoned via pause menu so no WRONG WAY;
lane = side traffic drives on; on-road = distance from the exit leg centre line vs cityAt road half-width). Live baseline build: `git worktree` at the re-split
commit, served on :8767 (`cd ../odlive && python3 -m http.server 8767`), copy tW13f.js there.
Numbers (FAST, phone touch):
- Live: braked turn 50 km/h on road (-2.8 m), no-brake 71 km/h OFF road +6.1 m; slalom city capped 91 km/h (swing 18.5°), AB 160 slip 0.1° swing 9.9°; brake 170→0 100.9 m / 4.15 s.
- w13, no scrub/lift (fe67bf2): braked turn +7.2 m off (accelerates through the turn: exit 106 vs live 73), no-brake 94 km/h far off.
- w13, scrub 12 always-on + lift: braked turn ON road (-3.5 m), no-brake 89 km/h ON road (-0.1 m); BUT slalom loses speed (city 120→70, AB 160→81) and Fra stuck 10.5 %.
- w13, scrub 12 with ~1 s hold ramp: braked +/-0.7 on road, no-brake +8.4 off; city slalom 3 wall hits (noisy run).
- w13 now (scrub 0, lift .6 with hold ramp): slalom city 120 clean (slip 0.2°, swing 13.6°, 0 hits), AB 160 slip 0.1° swing 10°; brake 120→0 50.6 m / 2.9 s yaw 0.2°,
  170→0 100.8 m; braked turn +1.1 m off, no-brake 89 km/h +28 m off. tPlay 2 min: Fra walls 0, stuck 6.9 %, avg 87 km/h; Ath walls 1.87, stuck 6.9 %.
- Slip < 1° and camera lag 0.07-0.10 s in every run (pass). Remaining gate item: the 90° junction turn must finish on the road at the 5-s-of-GAS speed.
Left to do: find a cornering rule that keeps the braked AND ~90 km/h no-brake turn on the road without slowing slaloms. Suggested: scrub only while
|steer|≈1 is held >0.6 s AND yaw rate is at its maxR limit (true cornering, not flicks), or a slightly larger maxR at mid speed in 71 (`1.35-.75*vr`), checked for twitchiness.
Or lower city to ~.75 (≈110 km/h). Then rerun tW13f turn/slalom/brake on both builds + tPlay pair and re-REVIEW with strips (qa_w13/feel/*strip*).
Also requested (coordinator, 1 line): the "New in vX" toast shows on CHOOSE TRACK and covers the header; it should show on the title screen only (not done).
