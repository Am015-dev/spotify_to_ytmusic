# REVIEW_2K_27: gui-r30a (1584590) quest card, coach toast, race tiles, portrait near plane (2026-10-30)
Reviewer lane review-r30-1. Built page `tools/build.sh rev27` (= 1584590). Phone profile: iPhone UA, 852x393 touch, DPR 2, plus 390x844 portrait. The Frankfurt boot ran at 6x CPU; the portrait and Athens boots in the review script ran at 1x (UI checks only; the gauntlet covers 6x boot for both). Every card, DETAILS, START, LATER and menu action was a real Playwright/CDP touch on the on-screen element. Test SETUP (not input, said here once): `roamWarp` parks the car 14 m from a quest marker before it drives in and taps TAP TO OPEN; `chAbort()` frees the car after a started mission, because tapping ✕ Abandon in the pause menu did not end it (probably a confirm step). Script: tools/gauntlet.js Player + a review driver (scratch, not committed). Shots: docs/shots/rev27/.

## Verdict: FAIL, send it back to the same worker (2 items, both small)
1. **Athens' first quest card is still the long card.** `Koulouri Rush` (quest/m1, the nearest marker after landing in Athens) shows about 40 words, star times and reward chips, with no DETAILS (ath_q1_card.jpg). GO gui/card passes only because it **filters out** every card that is not lite (`.filter(c=>c.lite||(c.fullOnly=1)&&0)`), so a long card can never fail it. In Athens it checked 3 of the first 6 cards. That is a loosened bar (rule 15/(e)).
2. **The 4 builder-track previews are scattered dashes, not tracks** (fra_previews.jpg). `bxThumb` starts a new line whenever 2 consecutive logged pieces are more than 3 cells apart, so these logs come out as dozens of 1-3-cell fragments. menu/tiles passes them because its bar is "≥ 150 bright pixels and no ellipsis", which fragments meet.
Everything else in the commit does what it says.

## Points
| # | check | verdict | evidence |
|---|---|---|---|
| a | DETAILS / START / LATER by touch, 3 Frankfurt quests + Athens | **FAIL (Athens)** | Frankfurt: Stud Rush: Bankenviertel, Brick Smash: Taunusanlage, Opa's Golden Bricks. All three are lite (name + "Collect the golden bricks" / "Smash the brick piles"), DETAILS opens the full card (stars, times, reward, stages) with START/LET'S GO still on it, LATER closes the card (no mission started), START starts the mission. Athens: Thieves! is lite and DETAILS, LET'S GO and HUD all work. Koulouri Rush is the long card (see verdict 1). LATER works on it. |
| b | nothing needed to play was dropped | **PASS** | After START the HUD has the time limit (⏱ 01:35 / 01:16 / 04:16), stage n/3, the count ("Find 4 golden bricks … 0/4", "Ram the van 4× … 0/4") and the distance (fra_q2_hud_3s.jpg). The reward and star times are one tap away in DETAILS. Lock: the lite card is only used when `!lock`, so a locked marker keeps the 🔒 text and the LOCKED button (code read; nothing is locked with ALL_OPEN, so this can't be checked by input). "Unlocks in Chapter N" on playable quests is gone. Pre-existing copy bugs (not this commit): in DETAILS, the 🎯 GOAL line repeats the intro sentence word for word (Stud Rush, Brick Smash), and Opa's card says "Ten of them" while the HUD asks for 4 per stage × 3. |
| c | race menu names / previews | names **PASS**, previews **FAIL** | At 852x393 the second row's names sit at y = 431 on a 393 px screen. `#mpanel` scrolls (1266 px of content), the cut-off previews invite a scroll, and one thumb swipe shows all 11 names (Frankfurt) and all 9 (Athens) fully, at 12 px (fra_menu_scrolled.jpg). Riverbank Rally's preview reads as a track. CLIFF RUN, TWO-LEVEL CITY, CANYON SPLIT and LAGOON SPLASH do not (verdict 2). Minor: after the swipe, the tops of the row-1 tiles show above the sticky header (fra_menu_scrolled.jpg, top edge). |
| d | portrait near plane 2.5 → 0.9 | **PASS** | Portrait camera: near 0.9, far 1500, FOV 98°. 4 frames on road, turn, facade and grass (portrait_drive4s / turn / drive10s / still_near09): no z-fighting or flicker on road markings, facades or grass, and the ground reaches the bottom edge. With 24-bit depth, precision is about 0.7 mm at 100 m and about 7 cm at 1 km, so a risk only for far coplanar layers. Stills can't prove there's no shimmer over time. portrait_still_near25.jpg is a raw render without the post-processing pass, so it is not a valid A/B. Gauntlet portrait/band: brightness 56 (bar < 140). |
| e | GOs honest | **FAIL** | gui/card: the filter above (fix: count a non-lite quest card as a fail, or list the kinds excluded on purpose in the pass line). It also only samples `qvUse && !markLocked` markers. rv2k/card and rv14/rv-p-card are not touched by the commit and pass. Gauntlet `menu/tiles`: "cut" only checks ellipsis inside the element (not off-screen), and "ink ≥ 150" passes fragmented previews. The new mission/card, mission/details and mission/toast rows are honest (tightened, not loosened). |

## Gates
| check | result |
|---|---|
| build | BUILD_OK page 3,502,798 B = **97.2 KB under the 3.6 MB cap** (2.7 %), +1.8 KB vs 3,501,002 at cdf5b10 |
| unit | 1 FAIL `page/size-headroom` (within 3 % of the cap; red before this commit too), 5225 pass, **13 known** (rule 15: a known list is still a known list) |
| `TAG=life1,xf1,terrain,gui/card,rv2k/card,rv14/rv-p-card tools/gate.sh` (built, phone) | **PASS 46/46** (fra 28, ath 18) |
| full `tools/gauntlet.js --build out/rev27` (912 s) | 17 FAIL = 8 measured + 9 `seen/*` carried over from beta.164's SEEN.md (the build is still labelled v90m-beta.164, so the run read and overwrote that folder; I restored the committed baseline and copied this run's report to docs/shots/rev27/gauntlet/) |

Measured FAIL rows (none touch this commit's code; it changes only card/menu/toast/hudcam-near):
- boot/toControl 101.3 s (bar 8 s), drive/near 1.0 (bar 2.5), drift/start 0/3, wall/glance 0/4, wall/headon 1/2: all red on the beta.164 baseline too.
- **hit/contact 1/5 ("no car in front" ×4)**: the baseline had 4/5 and 5/5. It goes with drive/near 1.0 (not enough traffic to aim at). Not caused by this diff, but it is a new red for the coordinator.
- mission/reach "no card in 90 s": the bot never reaches the marker in the full run, same as the worker's run, so mission/card/details/toast are not measured there. They are covered by the review run above.
- race/finish "no results, lap 0, 21 s game": the shot shows the car racing at 214 km/h in 3rd, so the bot's loop stopped early. Re-run `--only race` on the same build: **PASS, results after 142 s game (6th)**, so it's a script stop, not a game bug.
- `seen/*`: card-wordy, coach-toast and portrait-band are fixed in the shots (the SEEN.md lines can go). empty-tiles is half fixed (names OK, 4 previews still fragments). floating-pickup, roof-seam, sky-debris, prop-on-car and camera-in-props are not this lane's.

## hr/mstart: flaky, no commit changed it
Same GO (`TAG=hr/mstart`, built phone page) on four builds, one run each:
| build | fra | ath |
|---|---|---|
| cdf5b10 (hr-boot-mstart itself; REVIEW_2K_26 saw 121 % here) | FAIL keep 44 % | PASS |
| 0968442 (revert phonedrift-r25i) | FAIL 34 % | FAIL 44 % |
| a862d9d (revert drivefeel-r25g) | PASS | PASS |
| 1584590 (this commit) | PASS | FAIL 26 % |
Fails in 4 of 8 runs, spread over commits, so there's nothing to bisect. The GO warps 30 m behind the first `qvUse` marker at 60 km/h. The speed drop is most likely whatever stands in that 30-50 m (traffic, kerb, prop) and changes run to run. Rule 15: the next lane makes it deterministic (clear the lane or pick a straight empty street) or deletes it. It is not this commit's.

## For the worker (fix list, ~30 min)
1. Athens quest/m1 cards (and any quest with an `e.kind` missing from QV_ONE) need a one-liner, and gui/card has to fail on a non-lite quest/otg card instead of filtering it out.
2. `bxThumb`: draw the track from the builder's own path (the piece centres in drive order, or the race spline) instead of joining log entries by cell distance. Tighten menu/tiles to fail when a preview is more than 4 separate pieces or a name ends below the viewport with no scroll container.
