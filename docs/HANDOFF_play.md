# HANDOFF play (alex/od-play): tPlay playability fixes on live v89k → v89l

Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Draft PR #86 (base alex/od-src).
Brief: stuck % (Frankfurt 17 / Athens 14 → < 3), Athens wall hits (1.75 → ≤ 0.8/min), 9 px tutorial text, DRIFT hidden after rotation.

## Root causes found (each reproduced in tPlay first)
1. **Stuck = pinned on a stopped traffic car**, never a building. tPlay now logs every stuck episode (`stuckEp`: position, nearest
   collider, nearby cars, input at 2 s). v89k: 13–17 % of drive time at 0 km/h with GAS held, 2–5 m from a traffic car whose v = 0, no
   collider near. Cause: `W10_bump` (95_drive_flow.js) below CR_SMASHV (150 km/h) is a momentum exchange with no separation, and each
   bump re-arms the traffic car's stop-and-wait (`hitT`), so a stopped car is an immovable wall: forward is cancelled every frame and
   steering needs speed. **Fix:** `W10_pin(c)`: GAS on, under 15 km/h, in contact 0.6 s → the car is knocked aside through the normal
   smash path (tumble, studs), no damage to the player (70_roam_world.js hubTrafficStep).
2. **DRIFT hidden** in every orientation, not only after rotation: `body.v85 #tD{display:none!important}` (96_scale_qa.js), although
   the v88g changelog tells players to use DRIFT. Removed from that rule; DRIFT uses its existing pedal-layout slot. It is hidden while
   BRAKE is 🚪 EXIT / ENTER / TAKE (`body:has(#tB.ofDoor) #tD`, 98of_onfoot.js): they overlapped.
3. **Tutorial 9 px**: `#roamTut small` 9 px and SKIP 10 px → 12 px (00_page.html, + QA6 list). tPlay missed it because it tapped
   SKIP before measuring: it now measures the tutorial card first.
4. **Athens wall hits**: every hit is 2–130 m OFF the road (play/colprobe.js gives the road edge distance and the colliders). The road
   graph (HUB.nodes, GPS routes, the chase van) is on the paved road (play/graphprobe.js: 0 of 3424 samples near a collider). The
   colliders match the drawn buildings (hw = w/2 − 0.3). The hits come from the bot leaving the road: (a) tPlay held GAS unsteered
   for 7 s through all six rotations (its own comment says ONE rotation), which put the Athens car ~190 m off-road into the blocks
   before the drive began; (b) its "line of sight" check passed 2.8 m gaps for a 2.5 m car; (c) it rams the same building again
   after its 1.2 s reverse (pairs of hits at the same x,z). (a)+(b) are fixed in tPlay; (c) is open.

## tPlay changes (tools/tPlay.js), all to match a person
- GAS held for the first rotation only (as specified); the rotation trip is not drive time (`__rotTrip`, like map/pause/garage).
- Line of sight = car-wide (radius 2.4 m, 2 m steps). Waits for GO during a countdown (was reversing at GO). Countdown frames are not stuck.
- Declines a flight card it drove past (`#rcNo`): it used to tap GO and fly Athens → Frankfurt mid-run (the "reload" in v89l runs).
- Logs stuck episodes and the wall-hit list.

## Numbers (phone, FAST, 4 game-min per city, same tPlay for both builds)
| metric | v89k (live) | v89l |
|---|---|---|
| stuck Frankfurt | 14.8 % (qa_play5k), 6.4 % (4k) | **2.1 %** (5l), 3.6 % (4l, rotation still counted) |
| stuck Athens | 13.5 / 2.0 / 9.0 / 15.4 % | **2.3 / 2.0 %** (6l1, 6l2) |
| wall hits Frankfurt /min | 0.5 / 0.97 | 0.75 / 1.45 |
| wall hits Athens /min | 1.99 / 2.48 / 2.99 / 1.21 | 6.72 / 1.0 / 2.17 |
| DRIFT after 3 rotations | hidden | ok |
| tutorial text | 9 / 10 px | ≥ 12 px |
| console errors | 0 | 0 |
Wall hits are NOT fixed. Athens 6.72 (6l1): 18 hits 20-80 m off-road in a hillside grid of 6 m houses (x 1130-1410, z -1820..-1960,
y 68-91), no mission running, bot wandering. The other runs: Koulouri van chase / DRIFT ZONE / RAMP JUMP rings, 5-15 m off-road.
v89k Athens is ~2/min on the same test too, so the brief's 1.75 matches; 0.62 (pre-v88z) was an older tPlay.
Shots (852x393): play/shots_v89l/ (Athens start + tutorial + wall hit, Frankfurt after rotation + drive).
tplay_fast.sh prints PASS when a city process crashes (no FAIL line): check every log has a "phone <city> {" result line.

## Open
- Wall hits per minute vary 0–6/min run to run on the SAME build (mission-dependent: Koulouri Rush van chase in Athens, brick packs
  in Frankfurt). Judge on ≥ 2 runs. (c) is in tPlay now (turns to the open side after backing off; used in the 6l runs). Next
  look at the game side: the Athens lawns between road and blocks invite corner-cutting at chase speed.
- Garage/team panel text at 11 px (`gH`, `.rnd`) showed once after a fresh Frankfurt start (tPlay tiny list).
- After the PASS: merge the latest live src (alex/od-mem may land first), OD_CHANGELOG v89l entry, `tools/build.sh v89l`, push out/v89l, DEPLOY.

## Session 2 (2026-10-10): Part A done, REVIEW sent (84dcb6d); Part B root cause found, NOT fixed
- DRIFT stays hidden (coordinator: 5-button rule). Drift = GAS on + steer + hold BRAKE 0.35 s (TUNE.gbHold .6 → .35, also src/assets/tune.json).
  At .6 the brake bled speed under B2K_DMIN (43 km/h) first, so touch drift only started above ~80 km/h (play/driftprobe.js). Now from ~55 km/h;
  a ≤0.3 s tap still only brakes (v88g). All DRIFT texts name the gesture; v88g changelog line reworded; checklist item drift-brake (v89l).
- tPlay accepts DRIFT 'hidden' in the rotation check. Gate shots + tyre gap (0.03 m): play/shots_v89l2/ (qa89i/stdrun.js ATH=1 + qa89i/live.js).
- tPlay v89l (qa_p89l): stuck Fra 3.0 / Ath 5.6 %, walls Fra 1.49 / Ath 2.98 per min, 0 errors.
- After PASS: merge live src (check alex/od-mem, alex/od-nits), OD_CHANGELOG v89l entry, tools/build.sh v89l, push out/v89l, DEPLOY to coordinator.

### Part B root cause (Athens wall hits + Athens stuck), from qa_p89l/phone-ath + play/colprobe.js + play/spotprobe.js
- ALL 12 Athens wall hits and ALL 5 stuck episodes in this run were within 130 m of Eleni's Garage (building centre 2036.6,-1617.7,
  collider hw 18 hd 11 → south face z -1628.7). The garage mark (ring r 9, card opens only at d<11 AND v<7 km/h) sits at z-20 = 9 m in
  front of the wall, right at the road edge. The arrow (RO.near = nearest unvisited mark) keeps pointing at the garage until its card is
  opened, so the bot drives at the ring at 40-50 km/h, overshoots into the wall (3 hits at z -1631), circles the block (hits on the ab:1
  houses at x 1919-1990, z -1600..-1670, 5-20 m off the road) and comes back; it stops at the gate for 2.5 s (stuck). Wall shots:
  qa_p89l/phone-ath/phone_ath_wallhit1-2.jpg ("Eleni's Garage → 12 m"). A person would stop on the ring or tap TAP TO OPEN.
- Glancing hits already slide (roamBounce keeps sp*(1-.6a²)); a tPlay "wall hit" needs drop > 0.4, i.e. > ~55° head-on, so rounded
  colliders alone will not move the number.
- Proposed fix (not started): (1) game: deeper forecourt for Eleni's garage (mark ≥ 18 m from the wall) and/or a pit-lane slow-down inside
  garage/flight rings so the car stops on the pad and the card opens; (2) tPlay: when the arrow target is a mark < 40 m away, brake to stop
  in its ring like a person (or tap #roamPrompt). Then re-measure Athens over 3 runs (target ≤ 0.8/min); the earlier hillside-grid and
  ring-challenge hits (HANDOFF above) still need a look after this cluster is gone.
- Reviewer + coordinator (2026-10-10), for Part B: Eleni's garage card auto-opens when you drive through the Athens gate (the 5 Athens stuck
  episodes). Open the card only when the car stops inside the gate (< 2-5 km/h for 0.5 s), or show a small "GARAGE ▸" button instead of the
  full card. Ship it with the wall-hits fix (separate REVIEW/DEPLOY).

## Session 3 (2026-10-10, play-3): Part B garage cluster fixed (v89o); Athens target NOT met yet
- Game (src/71_roam_drive.js, mark loop): garage/flight card opens only after the car stands in the ring (|v| < 1.2 m/s = 4 km/h for 0.4 s;
  RO.svcT/RO.svcM); TAP TO OPEN prompt unchanged. Note RO.v is m/s: the old "v<7" was 25 km/h, not 7 km/h.
- Game: garages never count as markDone, so RO.near (the arrow) pointed at Eleni's garage forever. Now a garage/flight ring the car has
  entered this session (RO.svcV Set) is skipped by the arrow.
- Game (src/70_roam_world.js athGbSpots0): Athens golden bricks snap to the nearest non-ped road point within 120 m (were in blocks/hillside).
- tPlay: slows in the last 40 m to an arrow beacon (v > d*.35+3 m/s → off gas, brake above +6); declines a garage card like a flight card.
- Merged alex/od-mem (live v89n). Version for this release: v89o.
- tPlay v89m (garage fix only), 3 Athens runs: 0 hits within 60 m of the garage (was 12/12); walls 5.5 / 7.5 / 1.3 per min, stuck 4.9 / 1.0 / 4.3 %.
  Frankfurt 0.75/min, 2.1 % PASS. Results: qa_p89m/. v89o (+ golden bricks): qa_p89o/.
- Remaining Athens clusters (qa_dbg_ath.log, DEBUG=1 trace):
  (a) lawn strip in front of the house row west of the garage (x 1940-2016, z -1625..-1635; road centre z -1644, w 8.5): the bot U-turns at
      ~60 km/h (wander dest behind it) onto the lawn, then follows the strip 23-32 m off its route (replan only when bd > 30 m), hitting houses.
  (b) GO! challenge / van chase around (1440-1530, -1220..-1290) and (1750-1850, -1610..-1710): to check whether chNext targets sit off-road.
  (c) Stuck episodes are behind traffic cars (car ≤ 5 m), "ch":true (during challenges).
  GPS (qvPath + D24_clean chords) checked on (a): the route there is on the road (routeprobe: 0 off-road samples), so not a GPS bug there.
  D24_clr only tests colliders (r 1.2) and height steps, not road surface: chords CAN cross lawns elsewhere; worth a check for (b).
- New in the merged build: tPlay "JS heap ≤ 100 MB while driving" fails (158 MB avg) — came with od-mem; check against v89n before blaming v89o.
