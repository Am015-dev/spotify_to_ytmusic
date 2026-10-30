# REVIEW_2K_28: world-r30b (5063c2f): FAIL (pickup fades out, birds read as drones)
Built `out/rev28-r30b` from trunk 5063c2f (page 3,487,675 B). Phone profile everywhere (iPhone UA, 852x393 touch, dpr 2, 6x CPU for boot). Shots: `docs/shots/rev28/` (my real-input probes, scripts `probe.js`/`probe2.js` beside them), gauntlet `docs/shots/gauntlet/rev28-r30b/` (+ SEEN.md).

## Gates
| gate | result |
|---|---|
| tools/build.sh | BUILD_OK, page 3,487,675 B (under the cap; 99rv lazy) |
| unit (three installed) | 0 FAIL (5606 pass, 13 known) |
| gate.sh TAG=life1,xf1,terrain,world fra+ath | PASS 56/56, errors 0; world/* 10/10 |
| gauntlet (full, label rev28-r30b) | 13 FAIL: boot/toControl, drive/near, hit/contact 3/5, drift/start, drift/tap, wall/glance + wall/headon (script: no wall set up), mission/reach, mission/card/details/cover/objective + hud/overControls2 (this run reached a SPRINT card: gui-r30a rows, not this commit). vs world-r30b-b 8 FAIL: the extra 5 are the card rows that run never reached; drive/onStreet is green again (92 %). 0 reloads, 0 JS errors |

Note: `tools/gauntlet.js --build out/<x>` takes the label from the page's `v:` (v90m-beta.164) and writes over the baseline folder; pass `--ver <label>`. I restored the baseline files from git.

## The coordinator's two questions
1. **after_pickup.jpg empty void: staged, not a world bug. PASS.** The fra garage is 66 m from the spawn. My real title -> PLAY on the built page shows the full city in the first drivable frame (`fra_first.jpg`, `fra_first4s.jpg`), and the game's own garage ⚡ fast travel (`fastTravel`, the button's handler) lands in the full city (`fra_garage_ft6s.jpg`). The worker's before/after pickup shots both show a void, so the lab page had the city off. Shots like that should not be used as evidence.
2. **after_camprop.jpg: neither thing comes from this commit; seen rows added.**
   - Floating red/green bricks = **smash debris** from the staging teleport. When I put the car next to the nearest sign the way WRG_camprop does, it smashed a café set and threw the same bricks (`fra_camprop_lab.jpg`). before_camprop has them too (yellow ones).
   - Black rectangle = a flat black face on the long green arched building next to the spawn. It **predates** the commit: it is in before_camprop, and also in my real GAS drive (`fra_garage_drive.jpg`, left side). A camera raycast does not hit it (rays go through to 1.36 km), so it is not a pgrid prop and not an FC hole. Owner unknown: probably the building batch / Kenney instancing. Seen row `black-face`.

## Points (real input on the built page unless noted)
| point | verdict | evidence |
|---|---|---|
| pickup at car height + shadow | **FAIL** | Geometry is right: icon 2.3 m up, shadow parented (probe read; GO 72/72 Athens, 11 fra). But in a real GAS drive the icon **disappears as you approach**. The old near-fade `nf=clamp((d-12)/45,.12,1)` (71_roam_drive `roamMarks`) was made for an icon 12 m overhead; it leaves a car-height icon at 31 % at 26 m and 12 % in the ring. At 66 m the wrench reads well (`fra_first.jpg`); at 26 m only a ghost is left (`fra_garage_drive_crop.png`). Fix: fade only inside ~8 m, or floor ~0.75. The blob shadow cannot be seen at 26 m. |
| no magenta roof edge | PASS (fra) | No seam on the green building in any of my fra shots; GO world/roof 0 in fra+ath. Athens: no roof seam seen in ath_2_drive. A black overhead wire crosses the screen (also in world-r30b-b): seen row `ath-wire`. |
| birds read as birds | **FAIL** | Real GAS drive at 82 km/h (`fra_garage_drive.jpg`): ~20 scattered pigeons hang 3-8 m up across the road ahead as grey X shapes. The wings are ~3x the body, and the new level-off (vy 0 after 1.6 s, 6 s life) keeps them at camera height while the car catches up. They read as drones or debris, which is the same complaint as sky-debris. The worker's single-flock shot (after_birds) hides this. GO world/birds: its `flat` field is computed but not in the pass bar (Athens flat:1 still PASS). |
| mission START clears props (3 quests) | NOT VERIFIED by real input | The gauntlet's nearest mission was a SPRINT, so no quest START was reached; timebox. GO world/mstart PASS (4 tries, 5/7 props -> 0). The GO is close to a self-check: it uses the fix's own FC_body + min(r,3) zone, so a prop wider than 3 m, a parked car or the beta.164 "slab" is out of its reach. |
| glance keeps car visible, prop comes back | NOT VERIFIED by real input | gauntlet wall/glance: 0/4 set up (script) this run. GO world/camprop 5/5 is a lab check (camera placed inside the prop, one FC_step). Found in my lab view: a café set (LV street-life cluster) at the lens is not covered; FC_body only handles pgrid props (seen row `cafe-at-lens`). Also WRG_camprop moves RO.x/z and never puts them back. |
| phone-compacted props restore | PASS (code) | 98pc wraps setMatrixAt by original index (writes src + slot), so dropping the `count<=i` guard in FC_restore is correct; a guard there used to strand hidden compacted props. |
| GOs honest? | partly | pickup/roof: honest state asserts. birds: one flock in isolation, `flat` unused. mstart/camprop: use the fix's own geometry functions (they cannot fail on anything the fix does not already see) and skip the real paths (card tap, chase camera). None of them would have caught the two FAILs above. |

## Verdict: FAIL. Send back to world-r30b (Sonnet, ~40 min)
1. Mark icon fade: keep the pickup readable all the way into the ring (fade only < ~8 m, or floor 0.75). Add a check on the icon's opacity at 25 m.
2. Birds: scattered pigeons climb out of the camera band (old climb, or level off >= 12 m above the road), and the wing span gets smaller (~1.6x body). Look at a real-GAS-drive shot at >= 60 km/h, not a single-flock lab frame.
3. Re-shoot the pickup and camprop after-shots on a page with the city on (no void, no staging debris).
Seen rows for the next run are in `docs/shots/gauntlet/rev28-r30b/SEEN.md`. Still open after the fix: real-input check of quest START (3 quests) and the wall glance.
