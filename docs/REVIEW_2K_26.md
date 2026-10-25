# REVIEW_2K_26: drivefeel-r25g, phonedrift-r25i, trafficpop-r25h, hr-boot-mstart (2026-10-25)
Reviewer lane rev-drivefeel-r25g. Every run was on BUILT pages (`tools/build.sh <v> --local`) with the phone profile (iPhone UA, 852x393 touch, DPR 3), and the bots ran at 6x CPU.
Builds: `rev26p` = a1acf53f5 (parent), `rev26` = ca219b324, `rev26b` = 3f3287426, `rev26c` = b122476a7, `rev26d` = cdf5b10d9 (trunk tip).
Scripts (docs/shots/rev26/): `rev26.js.txt` (wall-glance bot on real building faces), `rev26t.js.txt` (BRAKE/steer/GAS pressed as trusted CDP touches on the real buttons), `rev26f.js.txt` (frustum cost), `rev26h.js.txt` (tap for more, race menu), plus rev25 `far` mode.

## Verdicts
- **ca219b324 drivefeel-r25g (RO_wallInc): FAIL. Send it back to the same worker.** The car does not go into or through walls. But medium-angle wall hits now cost health where the walls-1 bumper used to keep them to sparks, and the GO's test wall makes glances look better than real buildings do.
- **3f3287426 phonedrift-r25i (touch BRAKE+steer drift): FAIL. Send it back.** BRAKE+steer drifts and BRAKE alone brakes, both checked through the real buttons. But a normal 150-300 ms brake tap in a corner now starts a short drift.
- **b122476a7 trafficpop-r25h (IV_zone uses the camera frustum): PASS.** Far traffic no longer slides in view, the GO is honest again, and the extra cost is negligible.
- **cdf5b10d9 hr-boot-mstart: PASS.** No race menu and no car control under the loader. "Tap for more" works on the touch path, and the race menu can still be reached from the pause menu.

## Gates
| check | result |
|---|---|
| unit `node tools/unit/run.js` (three@0.164.1) | UNIT OK 5601 asserts, 0 FAIL, 13 known (ca219 and b122) |
| `tools/gate.sh` parent a1acf53f5 | PASS 78/78 |
| `tools/gate.sh` ca219b324 | FAIL 77/78 why/traffic-inview (fra: "9 m lane jump drawn as 6.80 m") |
| `tools/gate.sh` b122476a7 | run 1 FAIL 77/78 why/traffic-inview#1 (ath: "3 m sideways jump drawn at 30 m/s"), run 2 PASS 78/78 |
| `tools/gate.sh` cdf5b10d9 (trunk tip) | FAIL 77/78 why/solid-cars (fra, see trafficpop) |
| why/traffic-inview alone, parent and b122 | 4/4 PASS. It goes red only inside the full gate, so it depends on GO order (rule 15: the next lane fixes it or deletes it) |
| feel/drive (THROTTLE=6) | ca219: fra PASS (ath did not boot on the loaded machine). Tip: fra + ath PASS |
| race/racemode-all + race/racefree (b122) | 4/4 PASS fra + ath |
| hr/boot (`tools/tHrBoot.js`, 6x) | PASS: menu visible 0, control frames under the loader 0, page errors 0 |
| hr/mstart (tip) | PASS fra + ath: 6 words, 12 px, 4.9 % of the screen, 0 buttons covered, speed kept 121 % |
| **dmg2/wall60** | **FAIL on the parent a1acf53f5 AND on ca219b324, with the same line: "hit at 0 km/h, 0 bricks, health 100 %".** This commit does not change it. The walls-1 bumper eases a head-on hit to 26 km/h, which contradicts the GO's 60 km/h crash. Rule 15: the bumper owner fixes it (e.g. the GO turns the assist off) or deletes it within 1 day. |

## (1) drivefeel-r25g: wall bot on real building faces (rev26.js.txt)
For each run, the bot picks random street spots and finds a straight building face 8-35 m away. It drives at the face at 60 km/h with gas held and no steering, at 5/10/20/30/45° to it, with traffic in play and damage off. It drives every episode twice from the same start: once with the new bumper and once with `TUNE.wallInc=0`, the old one. 71 episodes met their wall (fra 36, ath 35).
- **Penetration: none.** Car centre inside a collider (within 0.3 m): 0 new, 0 old. Body overlapping a wall (centre within 1.0 m): fra 3 new vs 3 old, on the same spots; ath 0 new vs 1 old. Stuck (< 1 m/s for > 1 s with gas held): 0. Flying (> 1.2 m above the ground or vy > 5): 0. The "through the face line" counts happen only where the car slides past the END of a short face. Those cars are never inside a collider.
- **Glances keep more speed, but less than the GO says.** 30° on real faces: speed at contact fra 50 vs 28 km/h, ath 55 vs 44 km/h. Speed kept 0.5 s later: fra 53 % vs 45 %, ath 79 % vs 66 %. The GO's synthetic 4 x 120 m wall gives 68 % in fra, and the handoff says 68-87 %.
- **Regression: medium-angle hits now cost health.** The bot records the largest normal speed at a building bounce, which is the value `TUNE.dmgGlance` (32 km/h) reads. Hits that cost health: fra 8 new vs 1 old (45°: 7 of 11 vs 0), ath 8 new vs 0 old (45°: 4 of 8). At 45° the car now meets the wall at 51 km/h instead of 26. walls-1 exists so that "a hands-off or full-gas driver scrapes walls with sparks, not damage". The 3 m scan steps let the eased speed overshoot `lim/inc`, so the normal speed goes past 32 km/h.
- **Fix for the worker:** keep the speed along the normal at contact below dmgGlance. For example, cap so that `RO.v*inc <= (TUNE.wallV??26)/3.6` once the wall is within one scan step, or clamp on the perpendicular distance. Add a 45° case to GO feel/drive that asserts the normal speed at the bounce stays ≤ 30 km/h. Report the glance numbers from a real building face as well as the synthetic wall.
- **The GO is honest about its own thresholds.** glance30 needs ≥ 45 km/h in and ≥ 60 % kept, and wall80 needs ≤ 32 km/h, both matching the claims. Its own old-bumper run (`glance30old`: 25 km/h in, 46 % kept) would fail the glance line. It measures `glance30old` but does not assert it.
- Shot docs/shots/rev26/glance30_fra.jpg (852x393, new bumper): a 30° glance at 57 km/h on a real Frankfurt face (22, 1478), 8 frames after contact. The car is at 51 km/h, scraping along the red brick wall, with no clipping. I LOOKED at docs/shots/drivefeel/drift_turn_fra.jpg too: the car is sideways with smoke at 56 km/h and reads well. That HUD has no DRIFT button, though, and the GO's `hb50` presses `TOUCH.hb` directly, which a phone player cannot do (phonedrift-r25i now covers the BRAKE path).

## (2) phonedrift-r25i: real touch buttons (rev26t.js.txt, fra, 6x)
The bot sends trusted CDP touches at the centres of #tB, #tG and #tR, so the game's own handlers set `TOUCH.*`. It steps the sim 1/60 between presses, and the page loop is frozen.
| case | 3f32 (fix) | ca219 (before) |
|---|---|---|
| BRAKE+right from 50 km/h, no gas | DRIFT at 0.13 s, path turned 90° at 1.12 s, 40° slip | no drift, 22 km/h |
| BRAKE alone from 50 km/h, 2 s | no drift, 22 km/h | no drift, 22 km/h |
| GAS+right corner from 40 km/h, BRAKE tap 100 ms | no drift | no drift |
| tap 150 ms | **DRIFT 2 frames, 4° slip** | no drift |
| tap 200 ms | **DRIFT 5 frames, 8°** | no drift |
| tap 250 ms | **DRIFT 8 frames, 13°** | no drift |
| tap 300 ms | **DRIFT 11 frames, 18°** | no drift |
- `TUNE.gbHoldT=.12` is shorter than an ordinary thumb tap (about 100-250 ms). So "a tap still brakes" holds only for taps up to 0.12 s, and longer taps in a corner kick the tail out. The slide stops when the brake is released, so it is a wobble, not a spin. It is still an unwanted drift, which is the case Alex was asked about.
- **Fix:** raise gbHoldT to about 0.25 s. At 50 km/h the brake costs only about 5 km/h in 0.25 s, which stays above the 35 km/h gate. Add a "200 ms tap in a corner: 0 drift frames" case to feel/drive.
- Races: race/racemode-all and race/racefree pass 4/4. Rivals and AI do not go through `ctlPlayer`, so they are not affected. B2K_DMIN 9.7 does lower the speed at which the player's own touch race drift keeps going (`tauto&&dr`), from 43 to 35 km/h.
- tools/tChkGo.js `BOOT_MS`: boot wait env var, default 90000 as before. OK.

## (3) trafficpop-r25h
- rev25 `far` mode with touch: drawn steps over 2 m for on-screen cars 60-250 m away. b122: fra 0 and 0 (2 runs), ath 0. 3f32 (before): fra 12, plus 21 steps over 1 m with a max of 2.25 m. Above 250 m: 0-4 steps over 5 m (tiny on screen, as the handoff says).
- Frustum cost at 6x CPU: the rebuild takes 0.0048 ms, about 1.1 IV_zone calls per frame, 0.006 ms per frame. Negligible.
- GO honesty: the 3.5 m far-car allowance is gone, and the code again matches pre-r25b (25f03626d) apart from one exemption. `rs` = st > 40 m, `e.us`, out of the frustum, once (`e.rd`). The final check counts `e.us` cars again instead of skipping them. This is what REVIEW_2K_25 asked for.
- Open (next lane, rule 15): the honest GO went red once on the trunk tip (fra) with "bus jumped 5447 m @142 … by DR_unjam". DR_unjam respawned a bus that the GO sampled on screen within 120 m, after the camera turned back. That is a real pop the GO now catches, not a GO bug. 1 red in 3 full gates since b122.

## (4) hr-boot-mstart (rev26h.js.txt, fra, 6x, trusted touch)
- "Tap for more": the card read "Coach Kai ▸ tap for more" / "Ring 1/15 · finish in Nordend" (6 words), and the card was the element hit at its centre. One tap fired pointerdown, touchstart, touchend and click on the card, and it opened the 29-word briefing. Note: the short card hides after 4.2 s, so the player has 4.2 s to tap. In my first run a slow 6x screenshot used up that window.
- Race menu: a real tap on the pause button, then on "QUIT TO TITLE", gives state `menu` with #menu shown: "RACE · TIME TRIAL … FRANKFURT ATHENS Grand Prix, Westhafen, Fraport, Skyline, Nordschleife". It is still reachable. The pause menu never had a RACES button, and this commit did not change that.
- `RO.bootHold`: if an overlay is open when the 300 ms timer fires, the car stays frozen, and journalClose, roamPauseClose and M1_csEnd each unfreeze it. No stuck-car path found.
- I LOOKED at docs/shots/hr-boot/hr_boot_first_drivable.jpg (clean street, no menu, 0 km/h) and hr_mission_start.jpg (a small purple card at the top centre, readable, clear of the buttons).
