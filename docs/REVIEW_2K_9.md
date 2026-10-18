# Strict review #9: Mainhattan Overdrive trunk `6bc1079` (= beta.105) vs LEGO 2K Drive

Reviewer session rev9, 2026-10-18. Build: `bash tools/build.sh r9` gave BUILD_OK, a 3.25 MB page, split. Served from `out/r9`.
The rubric and the 12 aspects are the same as reviews #6 to #8 (`alex/rev8:docs/REVIEW_2K_8.md`), so the scores compare.
The machine was SwiftShader with 4 CPUs. Every number below comes from a state assert in a script, not a real-time judgement. No game code changed.

**Tools.** All are on this branch:
- `tools/rv8/probe.js` and `tools/rv8/hud.js`, copied from rev8;
- `tools/tRv2k2.js` with `fra`, `ath` and `por`;
- `tools/perf1/tFrame.js` (`CITY=… SECS=30 RACE=0`, one run per city, alone on the machine);
- `tools/tRot.js`: iPhone UA at DPR 3, 852×393 ↔ 393×852, 3 round trips;
- `tools/tChkGo.js` with `TAG=r8a,r8b,r8c,rev5fix,life1,xf1,terrain`;
- unit tests: `node tools/unit/run.js` gave 0 FAIL.

**Shots I looked at:**
- 852×393: `ath_roam`, `akropolis_bot_0`, `westend_bot_0` and `garage`;
- iPhone after the rotations (Frankfurt);
- portrait: `ath_393x852_roam` and `por_portrait_westend_0`.

**Overall: 5.6 / 10 against 2K Drive** (r8 5.3, r7 5.1). It is the mean of the same 12 aspects.

## Scores vs 2K Drive
| # | aspect | r9 | r8 | Δ | evidence | the one fix that would help most |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **6** | 5 | +1 | The Athens spawn is clean: no cyan ellipse, and the pill shows "→ 1466 m" (`ath_roam`). Boot takes 61–73 s with 2–3 browsers running and 48–67 s in the GO runner. | Portrait pill (fix #5) |
| 2 | Free-roam driving feel | **6** | 6 | 0 | **Athens:** 0 stuck and 0 wrecks. Road-follow 121 km/h, wander 40 km/h with 13 smashes and 1 hard stop. **9 Athens shortcuts** now appear (r8: 0). | Perf fixes #2, #3 |
| 4 | Story / side quest | **4** | 4 | 0 | Athens has 12 missions with a rival arc (2 street duels, then the Drakos finale). Frankfurt has 9 missions with no nemesis. Pop-ups and collectibles fire. Nothing deeper since r8. | Fix #4 |
| 5 | Races | **7** | 7 | 0 | **6 of 6 bot races finished in 1st**: Akropolis 105 s, Westend 126 s, River 168 s, Grand Prix 89 s, and Westend in portrait 130 s. 0 walls, 0 stuck, 0 errors. **Still 1 rival ("/2")**, and the lead swings up to 279–334 m, so a race is not a fight. | Fix #1 |
| 6 | Builder | **5** | 5 | 0 | The label fix landed (r8b); not re-judged. | – |
| 7 | Garage | **4** | 4 | 0 | 153 tiles and 0 tiny text. The roam **EXIT button sits on top of the car-card grid** and names are ellipsised ("Orange Street…") (`garage.jpg`). Every car is open, so there is nothing to earn. | Fix #6 |
| 8 | Vehicle transform | **6** | 6 | 0 | car, off-road and boat in races. In roam it flips CAR ↔ 4×4 about 14 times a minute while weaving onto verges, each time with a banner, burst and sound (Bug N3). | – |
| 9 | Traffic / pedestrians | **6** | 6 | 0 | Athens has 78 cars (22 → 26 near), Frankfurt 75 (18 → 33). **life1/people fails in Athens** twice in a row (Bug N1). | – |
| 10 | HUD / menus | **6** | 5 | +1 | 0 text under 12 px at 852×393 and 393×852 (menu, roam and race), and the PC HUD GO passes. Left: the portrait pill hides its distance under ⚙ (N2), the phone rival box shows "THANOS DR…", and the garage EXIT overlaps the cards (N4). | Fix #5 |
| 11 | Performance / memory | **5** | 4 | +1 | **Athens:** median 15.7 ms (r8 20.4), p99 71 ms (86), frames > 50 ms per 30 s **27 (43)**. **Frankfurt:** median 14.4 (18.6), p99 46 (60), max 113 (158), **13 (35)**. Still above 8/10: spikes come from lazy streaming, LV, cull and FL (≤ 112 ms). | Fixes #2, #3 |
| 13 | World art | **7** | 6 | +1 | The cyan ellipse and arc, the RGB fringing and the canopy over the car are all gone (`ath_roam`, `akropolis_bot_0`, `westend_bot_0`). The sky, brick clouds, palms and kerbside crowds read like 2K. Small item: a palm frond still covers the top-left corner in the Akropolis race at 852. | – |
| 14 | Portrait | **5** | 5 | 0 | 0 tiny text, and the portrait Westend finishes 1st. The pill is clipped under ⚙ (N2). | Fix #5 |

Mean: (6+6+4+7+5+4+6+6+6+5+7+5)/12 = 67/12 = **5.58, rounded to 5.6**.

## r8 bug-fix verification (built page `out/r9`)
| r8 # | bug | fix commit | verdict | evidence |
|---|---|---|---|---|
| 1 | Athens never shows shortcuts; the scan allocates ~9 MB/s | r8a `ca901d6` | ✅ **fixed** | GO `rev5fix/dest-sc-time` PASS (16 s). Both 60 s Athens probes report `shortcuts: 9`. `DEST_find` is no longer among the top allocators or long-frame entries in tFrame. |
| 2 | Cyan ellipse at the Athens spawn | r8c `004f625` | ✅ fixed | `r8c/near-ring` PASS. `ath_roam.jpg` at 0 km/h is clean. |
| 3 | Cyan arc and blob in the race frame | r8c | ✅ fixed | `westend_bot_0.jpg` at CP 4/5 shows only the intended cyan boost pad on the road, no arc over the frame. |
| 4 | Athens quest pill cuts the distance | r8b `bf56011` | ⚠️ **landscape only** | `r8b/pill-dist` PASS, and at 852×393 it reads "… Koulouri Rush → 1466 m". At **393×852** it reads "Yiayia Froso · Koulouri Rush → 14" and runs under the ⚙ button (new bug N2). |
| 5 | RGB split too strong | r8c | ✅ fixed | `r8c/chroma-cap` PASS. `akropolis_bot_0` at 175 km/h has no fringing. |
| 6 | PC HUD: speed box over the car, 11 px KM/H, rival name cut | r8b | ✅ PC / ⚠️ phone | `r8b/pc-hud` PASS. On the phone the rival name is still "THANOS DR…" (`hud.js` at 393×852 reports `clipped:["THANOS DRAKOS"]`, and so does `akropolis_bot_0`). r8b deliberately left the phone as it was. |
| 7 | Near tree canopy | r8c | ✅ mostly | `r8c/near-canopy` PASS. A palm frond at the top-left corner is still visible at 852 in `akropolis_bot_0` (it is not above the car, so it is outside the 10 m rule). Low. |
| 8 | A hands-off race reports a place for a DNF | r8b | ✅ fixed | `akropolis_handsoff` and `westend_handsoff` give `dnf:true, place:null`. GO `r8b/dnf-noplace` PASS. |
| 9 | Builder label "LONG RAMP UP" cut off | r8b | ✅ (by the handoff) | The tile now has a min-height and wraps. There is no GO for it, and I did not re-shoot it. |
| phone-1 | Rotation reloads graphics, iPhone freeze | `bcd0382` | ✅ fixed | `tRot` (iPhone UA, DPR 3, 3 round trips): 6 `setSize` for 6 rotations, 12 FB allocations, **0 shader links, 0 texture uploads, 0 reloads**, DPR capped at 1.5. The longest rAF gap was 3.1 s against 2.2 s at idle on SwiftShader, so a rotation adds about 0.9 s. The shot after rotating is correct (HUD placed, nothing stretched). |
| perf-16 | Athens LF allocation | `dd3ab7d` | ✅ | The `LF_*` decor no longer appears in long frames. Athens frames > 50 ms went from 43 to 27. |

Gate on the built page:
- `TAG=r8a,r8b,r8c,rev5fix,life1,xf1,terrain`: **54/56**, 0 JS errors.
- The 2 reds:
  - `xf1/grass` is the known SLOW timing (10.2 s > 10 s, physics ✅);
  - `life1/people` in Athens is a new red (N1).

## New bugs
| # | sev | bug | repro |
|---|---|---|---|
| N1 | **Med** | **Athens pedestrians no longer react, and life1/people is red.** First run: "0 jumped aside or flew (4.8 s)". Run alone: "no people group with a clear run-up". It is red on trunk `6bc1079`. phone-1 already listed `life1/ath-density` red, so a shared cause (fewer or misplaced ped groups in Athens) is likely. This hurts "lively streets". | `TAG=life1/people node tools/tChkGo.js http://localhost:8099/index.html out` |
| N2 | Med | **Portrait quest pill runs under ⚙ and hides "→ N m".** The r8b `scrollWidth` check passes because the overflow is an overlap with `#gear` and not an ellipsis. | `node tools/rv8/hud.js <url> ath 393x852 out`, then look at `ath_393x852_roam.jpg`: "… Koulouri Rush → 14" |
| N3 | Low–Med | **Roam flips CAR ↔ 4×4 about 14 times a minute** when the car weaves between the road and the verge. Each flip fires a brick burst, `AU.sfx('brick')` and a "CAR" / "4×4" banner (`src/20_race_world.js:620`, `vehMode`, with no dwell time). It feels noisy and also costs debris allocations. | `node tools/rv8/probe.js <url> ath wander 60 7 852x393`: `says` alternates "4×4" and "CAR" every 2–10 s. Road-follow: 0. |
| N4 | Low | **The roam EXIT button is drawn over the garage card grid** (top-right, it covers a "SUPER" card). Card names are ellipsised ("Orange Street…", "Midnight Street…", "Widebody Track…"). | `tRv2k2 … fra` → `garage.jpg` |
| N5 | Low | **Races are not a fight.** In all 5 bot races the lead swings up to 202–334 m ahead and 55–123 m behind. With 1 rival there is no pack contact, which is 2K's core feel. | `tRv2k2` `R akropolis_bot … gapMaxAhead:334` |
| N6 | Low | **Athens nudge-hop:** a 6 m pinned-nudge teleport 23 s into wander near the spawn (1895, −3152). It only showed up as a nudge-hop; there was no stuck episode over 1 s. | `probe.js … ath wander 60 7` → `tele:[{t:23,…,why:"nudge-hop"}]` |
| N7 | info | **Perf spikes have moved to streaming.** Over 30 s in Athens, the 12 frames over 90 ms are led by `lazyStep` (≤ 57 ms), `LV_step` (≤ 57), `hubCullStep` (≤ 56), `FL_step` (112 ms once) and `roamHud` (27). Frankfurt shows the same picture: `lazyStep` 52 and `lzFinish` 17. `hubTrafficStep` (8.7–9.1 ms avg) is a wrapper around these plus `pedStep` and `miniDraw`. Its own car loop costs about 4 ms. | `CITY=ath SECS=30 RACE=0 node tools/perf1/tFrame.js out r9` → `long[]` |
| – | info | Not reproduced: crashes on items (24 boxes in each race, 0 errors), blocked streets (0 of 159 / 292 / 114 points), early respawn (0 wrecks, 0 rebuilds) and rotation reloads (0). | – |

## TOP 6 fixes (ranked by score gain per effort; each is ONE ~30 min fixer task)
| rank | fix | files | GO assert (`src/99c_checklist.js` or `99c7_rev5fix.js`) | gain |
|---|---|---|---|---|
| 1 | **A pack of 5 in every city race (2K's core).** The engine already takes `C.ai=[…]` (`tkStart` pushes one AI per entry, with staggered `s`, `lane` and `base`). Give TK_C, Akropolis, River and Grand Prix 4 rivals each, using names from `PD`, with the named nemesis kept as `ai[0]` for the gap box. Tighten the rubber band so the lead stays under ~120 m. Check the "/5" place, the results list and the item AI. | `src/98tk_city_duel.js` (TK_C and the race configs, rubber band), `src/98tk_go.js` | `tk/pack5`: in both cities, `sp.ai.length>=4`; the bot race finishes with `place<=5`; at least 3 lead changes; `gapMaxAhead<150`; JS frame p95 in the race no more than +3 ms vs 1 rival (tFrame `RACE=1`) | Races 7→8, fun (+0.15 overall, the most visible) |
| 2 | **Time-slice `lazyStep` and `LV_step`.** Cap each at a 4 ms per-frame budget (keep a cursor and resume next frame), so a whole streamed tile is no longer finished in one frame. | the `lazyStep` / `LV_step` definitions (grep `function lazyStep\|function LV_step` in `src/`) | `perf/lazy-budget`: Athens, 1,800 stepped frames road-follow plus 3 warps of 600 m → max wrapped `lazyStep` < 10 ms and `LV_step` < 10 ms. tFrame Athens frames > 50 ms ≤ 15 (now 27) | Perf 5→6 |
| 3 | **Amortise `hubCullStep` and the rare `FL_step` spike.** Cull a 1/4 slice of the instances per frame instead of all of them on the cull tick, and find the 112 ms `FL_step` frame with `PROF=1` (likely a first-use build), then pre-warm it at boot. | `src/70_roam_world.js` (`hubCullStep`), the `FL_step` owner (grep `function FL_step`) | `perf/cull-slice`: wrapped `hubCullStep` max < 8 ms and `FL_step` max < 15 ms over 30 s in both cities. Frankfurt frames > 50 ms ≤ 6 (now 13) | Perf, PC lag (Alex's complaint) |
| 4 | **A Frankfurt nemesis arc, like Athens' Drakos.** Add 3 story missions to QUESTS: ch 3 "Street Duel: <rival>", ch 4 "Street Duel: <rival 2>", and ch 4 "Finale: <nemesis>", which reuses `tkBuild` with `kind:'rival'` and that nemesis as `ai[0]`. Each gets a 2-line intro taunt on the chapter card. Frankfurt goes from 9 to 12 missions, matching Athens. | `src/41_career_quests.js` (QUESTS), `src/98tk_city_duel.js` (rival build) | `story/fra-arc`: Frankfurt QUESTS has ≥ 12 story missions and one whose `name` starts with "Finale:". GO-starting it builds a race with `sp.ai[0].name` equal to the nemesis and finishes with the bot | Story 4→5 |
| 5 | **Portrait pill and phone rival box.** In portrait, cap the pill `max-width` at the space between the minimap's right edge and the ⚙ left edge minus 6 px. Drop the giver name ("Yiayia Froso ·") before the target name. In the phone race gap box, show only the surname ("DRAKOS") instead of ellipsising. | `src/99ui_hud.js` (phone-1 portrait block), `src/93_cars_lego.js` (`CR_hud`), `src/99ui_hud.js` (race rival box) | `hud/pill-por`: at 393×852 in Athens, the pill rect does not intersect the `#gear` rect, its text matches `/→ \d+ m$/`, and `.crD` is fully inside the pill. At 852×393 and 393×852 in a race, the rival box `scrollWidth<=clientWidth` | HUD, Portrait, Onboarding |
| 6 | **Garage clean-up.** Hide the roam EXIT and 🐞 overlays while the garage is open. Give card names 2 lines (12 px) instead of an ellipsis. Add a "NEW" or "FAV" sort chip so the 156 cars are browsable. | garage UI (grep `GARAGE\|SAVE & DRIVE` in `src/`), roam overlay toggles in `src/99ui_hud.js` | `garage/clean`: with the garage open, the EXIT and 🐞 buttons have `offsetParent===null`, no `.card` name has `scrollWidth>clientWidth+1`, and `tiny` text = 0 | Garage 4→5, HUD |

Not ranked:
- **N1** (Athens `life1/people` red): give it to a Sonnet triage lane first. It is likely the same cause as `life1/ath-density`; bisect between `bcd0382` and `6bc1079`. Worth more than #6 if it is a real regression, but its size is unknown.
- **N3:** a CAR ↔ 4×4 dwell. Require 0.6 s off-road before the swap, and show the banner only once per 10 s.
- The near palm frond (r8 #7 leftover) and the nudge-hop (N6).

## Raw (r9)
| what | Athens | Frankfurt |
|---|---|---|
| Boot (`tq.ready`) | 48–67 s in GO; 53–73 s in probe/tRv2k2 (2–3 browsers) | 42–61 s |
| 60 s wander, 852×393 | 681 m, 40 km/h, 0 stuck, 1 nudge-hop, 1 hard stop, 13 smashes, 17 slides, 9 shortcuts | – |
| 60 s road-follow, 393×852 | 2,016 m, 121 km/h, 0 stuck, 0 teleports, min HP 96, 9 shortcuts | 30 s: 134–141 km/h, 0 hits |
| Blocked street points | 0 / 159 (spawn), 0 / 292, 0 / 114 | – |
| Races (bot) | Akropolis 1st, 105.3 s, 3 lead changes, ahead by up to 334 m | Westend 1st 125.9 s (11 lead changes) · River 1st 167.9 s · Grand Prix 1st 89.2 s · portrait Westend 1st 130 s |
| Race items | 24 boxes, 24 fired, 0 errors | 0 errors |
| Text under 12 px | 852×393: 0 · 393×852: 0 | 0 (portrait 0) |
| tFrame q=high 30 s (median / p95 / p99 / max ms, frames > 50 ms) | **15.7 / 33.3 / 71.3 / 268, 27** (r8 20.4 / 41.5 / 86 / 264, 43) | **14.4 / 29.5 / 46.2 / 113, 13** (r8 18.6 / 36.2 / 60 / 158, 35) |
| Calls / tris, heap over 30 s | 955 (max 1,082) / 3.09 M, 770 → 889 MB | 778 / 3.79 M, 622 → 759 MB |
| iPhone rotations (tRot, 3 round trips) | – | 6 resizes, 12 FB, 0 links, 0 uploads, 0 reloads, rotation adds about 0.9 s |
| GO gate | 54/56 (xf1/grass SLOW, life1/people) | |
| JS errors (all runs) | 0 | 0 |
