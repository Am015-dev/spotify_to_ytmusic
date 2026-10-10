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
Shots (852x393): qa_play4l/phone-{fra,ath}/ (start, drive1-3, after_rotation, tutorial, wallhit*), qa_play5l/ (fra).
tplay_fast.sh prints PASS when a city process crashes (no FAIL line): check every log has a "phone <city> {" result line.

## Open
- Wall hits per minute vary 0–6/min run to run on the SAME build (mission-dependent: Koulouri Rush van chase in Athens, brick packs
  in Frankfurt). Judge on ≥ 2 runs. If still > 0.8 after (c): make the bot steer away after reversing (it is a bot artefact), then
  look at the game side: the Athens lawns between road and blocks invite corner-cutting at chase speed.
- Garage/team panel text at 11 px (`gH`, `.rnd`) showed once after a fresh Frankfurt start (tPlay tiny list).
- After the PASS: merge the latest live src (alex/od-mem may land first), OD_CHANGELOG v89l entry, `tools/build.sh v89l`, push out/v89l, DEPLOY.
