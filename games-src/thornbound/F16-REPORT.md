# [FIXED16 thornbound] report

Branch shelf/W489-thornbound-rules. Gates: build-all --quick PASS; --full PASS x3 (phone-check ~85 s, sweep PROBLEMS 0); rules 119/119, logic 165/165, hint PASS, loop PASS, doubletap PASS, bulb-calm PASS, finger PASS, linefit PASS (375x553 and 375x667), new rush-test PASS. tutor-test.js shows the same lore2/takeback wrong-tap failures on the old build (not a regression). games/lab.html restored, not committed.

## Pace (375x667 touch, bot, default game, 4 rounds)
| | before | after (no tap) | after (Skip tapped) |
|---|---|---|---|
| seconds per round | 80 (319 total) | 40 (161 total) | 24 (94 total) |
| own taps per round | ~31 | ~24 | ~24 |
| rival steps per round | ~21, ~3 s each | ~19, ~1.5 s each | ~23, skipped |
| taps a tap-through player needed | ~52 | ~24 (none for rivals) | 1 Skip per rival run |

## What changed
Rival steps play by themselves (~1.2-1.5 s, one line, 8 words max); a Skip button plays the rest at once. Hand: flat row, never overlapping, tap = enlarged card. No "..." anywhere (lines wrap or are cut at a clause). Region names on dark plates. Score changes tell their cause ("You +1: Herald on Thornwild"). First-time word lines (Lore, Active, Govern, Journey, Pledges, Tactics...) plus a Glossary in Help. Region tap shows a selected state. PC layout: scores+log left, map centre, strip+Great Road right, hand along the bottom.

## Cold-play verdict (independent agent, as-is)
Phone: could play, finished tutorial and a full game (lost 9-20), fun 6/10, would play again (half sure). PC (mouse): could play, round 1 and start of round 2 only, fun 6/10, would play again, more than phone. Confused by: tutorial steps with a dead "Next" caption; crowded map on phone; taps ignored while animating; many unexplained words; not knowing why round 1 was lost; a tie box cut at the top; Ossuary list hidden under "Choose none"; tiny track numbers; tips that vanish fast. Rival turns: fine on PC, a bit slow on phone, 4-6 Skip taps a round. PC better than phone, not a stretched phone, but the map is small with empty space. Fix after it: word tips now stay 6 s. Not fixed: the other items.

## Proof
games-src/thornbound/proof/first-3-min-375x667.webm, pc-1366x768-*.png, pc-1920x1080-*.png, phone-*.png.
