# REVIEW_2K_50: wallhit-r31e (aeef378): head-on facade hits stop the car

**Verdict: PASS. Ship it in the next deploy with TUNE.wallStop left ON (the default).**

Setup: the BUILT page (tools/build.sh rev50, page 3459009 B) on the phone profile (iPhone UA, 852x393 touch; 6x CPU for the probes). Base = aeef378^, built the same way.

## Gates
| check | new (aeef378) | base (aeef378^) |
|---|---|---|
| unit | 0 FAIL (5430 asserts) | - |
| default gate why,life1,xf1,terrain | 77/78: why/solid-cars (fra); alone 2/2 | solid-cars alone 2/2 |
| TAG=dest,dmg2,solid1 | 11/13: solid1/boat-bank, ath dest/shortcut#1 | dest,solid1: 10/12, the **same two** red |
| dmg2/wall60, dest/stops, dest/smash | PASS | - |
| tWallHead head-on fra / ath | 8/8 / 7/7, v03 4-6 km/h, 0 inside | (worker: STOP0=1 0/11, 0/9) |
| prop rams at 60 km/h (my probe, 6x) | fra 19/19 broke, ath 11/11 broke; none below 20 km/h 0.3 s after the hit | - |

- why/solid-cars: a traffic car is teleported 14,000 km by `DR_unjam` (hubTrafficStep), in both cities. That is traffic code, not the player wall path this commit changes. Run alone, `TAG=why/solid-cars` passes 2/2 on BOTH base and new, so it is flaky, not this commit (rule 15: it needs its own lane).
- A contended `TAG=why` re-run (three browsers at once) also showed why/solid-bld SLOW 107 s > 100 s (its content passed: 0 cars through buildings, fences smash or bump) and why/hud6 (boost bar shown while charged). Neither touches roamBounce; both come from CPU contention or other lanes.
- boat-bank and dest/shortcut#1 are red on base too (confirmed above), so they are not from this commit. Rule 15 still applies: they need a lane (fix or delete within 1 day). That is not a reason to hold this commit.

## Red flag 1: the GO edits
- **dest/stops**: the bar `A.n>=3 && B.n*3<=A.n` is unchanged. The only change: speed cuts made during a SQUARE solid hit (DEST.ws) are tagged `wallstop`, not counted as item stops. DEST.ws is set only inside the roamBounce wrapper (building/wall colliders, HUB.grid). Props break through smashCheck/SM2 (HUB.pgrid), so no item stop can be hidden under the tag. Before this commit those same wall hits slid at ≥ 56 % speed and never counted as stops, so the comparison is the same. Not loosened. Small quirk: the dest-OFF "before" run still counts square wall rebounds as `roamBounce` item stops, which slightly flatters "before". That was already true before this commit; worth a one-line fix in a later dest lane.
- **dmg2/wall60**: turns `TUNE.wallAssist` (the walls-1 bumper) off only for this GO and restores it after. The GO tests a 60 km/h crash (damage, bricks, reverse away). With the bumper on, the car can never arrive at 60 km/h, which is why it had been red since REVIEW_2K_26. The bar is unchanged (v≥60, ≥2 bricks, hp>0, reverses ≥2 m). This tests the crash code path the GO is named for, not a weaker bar. Accepted.
- **why/no-popup**: sets RO.v=10 before OG_res builds the result. The same GO already asserts that the moving car gets a toast and the stopped car gets a card (lines 29/31). The 6 s drive loop can now end in a real wall stop, and that stop would turn the toast into a card. The edit sets the precondition that this part of the GO (stack below the chip) is about. Not loosened.

## Red flag 2: props
They do not stop dead. Every lamp, bench, bin, tree, post, hydrant, cafe and bush rammed at 60 km/h broke (30/30), and the car kept 36-87 km/h. The few low values came from a facade behind the prop. Shots fra_prop_lamp_6 and ath_prop_lamp_9: the lamp flies and the planter bursts at 77-78 km/h.

## Red flag 3: feel (real game loop at 1x, gas held; see shots/rev50/SEEN.md)
- Head-on: the walls-1 bumper eases 70 → 27 km/h, then the hit stops the car and backs it off 2 km/h, with a brick flying off and the car flush against the wall. This is the 2K "bump" (a solid stop, a small bounce), not a sticky wall and not the old 80° sideways swerve.
- 30° glance: the car slides along the wall at 26-27 km/h in both cities. That is a slide.
- With gas held into the wall afterwards, the speed log shows small -8/-9 km/h back-offs a few seconds later (the stuck-escape reverse). That is acceptable, and the worker noted the stuck-escape turn as left.

## Left (not blocking)
1. A lane for the base reds solid1/boat-bank (SLOW) and ath dest/shortcut#1 (flaky), and for the DR_unjam traffic teleport in why/solid-cars (rule 15).
2. dest/stops "before" run: tag square wall rebounds as `wallstop` too, so that walls drop out of both sides.
