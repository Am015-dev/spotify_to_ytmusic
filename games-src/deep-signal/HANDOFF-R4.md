# Deep Signal HANDOFF R4 (W369, 7 Nov 2026)

Branch `shelf/W369-deep-signal-fix` (from `shelf/W352-deep-signal` + `alex/brave-carson-rbpmlk`). Not deployed.
Review: `origin/shelf/R4-review:games-src/deep-signal/REVIEW-R4.md` (5.4).

## Found -> fixed (review bugs, in order)
1. Drone stacks hidden (2 crew) -> a "Drone's face-up stacks" strip under the crew panels, always visible, 7 stacks with a
   shadow card where a hidden card is underneath, glows on the drone's turn and is tappable when you play for it. Task cards dashed.
2. 13-card phone hand ~28 px strips -> two rows whenever one row would give less than 46 px per card (52 px+ wide, 47 px+ tall
   visible targets at 390 px). Hand height stays steady for the mission, short hands go back to one row. Chosen over a fan +
   lift-to-confirm: one tap still plays, no hidden cards, the tests tap as before.
3. How to play: 4 cards -> 10 cards (goal, follow suit, sonars, taking tasks, order marks, signals ▲●▼, flare, winning the trick,
   special missions, two divers), each with a picture made from real game cards/tags instead of the empty grey box.
4. Tutorial wrong tap silent -> only the target card glows; a wrong tap shakes the line and the bubble says "Tap the glowing Coral 9".
5. Tutorial bubble over line/hand -> crew/follow/stamp steps point at the crew panels; the line and hand stay visible. Two new
   steps: order marks and the flare (signals already had one).
6. Story sheet: "Complete all 1 tasks" -> "Complete the one task"; "Opponent: The trench" -> "The deep sea (co-op: you all win or
   lose together)" (the "Opponent:" label lives in the shared campaign file, not touched).
7. "won by Kito, not You" -> "not you".
8. Void: "No Tide left: play any card" instead of "Follow suit".
9. Hand no longer glows during "Dive on / Send a flare"; a card tap there shows the card and flashes the line instead of playing.
10. Hot-seat: avatar shows the diver's own initial; optional names (Setup > Names, up to 12 letters, saved) used everywhere.
11. "Music files arrive later" removed from the Menu.
12. Order badges no longer cover the seat stats (task row moved down).
13. 404 on load: not reproduced with the temp art installed (no failed requests on title, game, tutorial).

## Top-5 changes
1. Board filled: drone strip, each trick card tagged with the player's name in their colour, tasks in each crew panel, signals
   as their own cyan "📡 ▲ highest [card]" chip (no longer look like tasks), "won N" instead of ★ for tricks. Landscape 844x390:
   compact one-line crew panels and the trick as a labelled row. PC panels wider (190 px).
2. How to play complete and illustrated (above).
3. Result screen: Quick-game win shows 3 stars (complete / no flare / 2 or fewer signals) with the reason; a loss shows a replay of
   the failed trick (cards, who played, winner, the lost task in red). Juice: trick winner's panel bumps, completed task pops in,
   stamp + sounds as before. Story loss card now says why ("Coral 4 was won by Kito, not Bram.").
4. Tutorial tightened (above).
5. Story: a written story line per mission (50, in `story.json`, read by gen.py), arc from the first beacon to the Source.

## Gate (all on this branch, temp art installed)
- `build-all.py --quick deep-signal` PASS, 10/10 scenarios. guard ok.
- rules-test RULES PASS; smoke PASS phone + PC; hotseat PASS (pass screen, 0 leaks); story-test STORY PASS.
- ui-audit A-F: phone 0 0 0 0 0 0, phone-s 0 0 0 0 0 0, pc 0 0 0 0 0 0.
- Real taps 390x763: 2 crew (drone strip 7 stacks), 3, 5 crew to the result; 844x390: 4 crew; clicks 1440x860: 2, 3, 5 crew.
  0 missed taps, 0 console errors. Tutorial (phone) to the end card. Menu: Rules, Tutorial, Restart, Title all work (phone + PC).
- Story 1-2 (phone + PC): mission 2 lost on purpose -> "Mission failed" + reason + Try again -> won; saved stars = expected (2/2, 3/3).
- Crew gate (4 crew, 100 per band): missions 1-10 68%, 11-25 56%, 26-50 22%.

## Remaining (not done here)
- Music files (none exist yet), title painting/logo and captain portrait are art tasks (temp emblem shows on the title).
- Watch mode and online play (parity with older shelf games).
- "Opponent:" label on co-op Story sheets needs an option in shared gx-campaign.js.
