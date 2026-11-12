# Rampart & Vine: fixes for the R9 gameplay review (7.3 FAIL, Phone 6)

| Finding | Fix |
|---|---|
| 375x667: a legal square sat under the hand tray, and Recentre did not bring it out | The camera now frames the whole valley and every glow at down to 44px cells before it falls back to a patch (bf.js `camAim`, `GLOWMIN`). Glows that still don't fit on screen get an arrow pill at the board edge ("▼ 2 more", 44px tall). Tapping it slides the view to them (`edgeArrows`/`edgeGo`). The pills never cover a visible glow, the status, Recentre or each other. A second Recentre tap frames the hidden glows (`camGlows`). |
| Follower spots edge to edge, one pair overlapping | Spots are spread to at least 64px centre to centre (48px targets, 16px gap). Measured on 22 multi-spot tiles at 375 and 390: min 64px, none off screen. |
| Result card: Menu off screen at 375 | Play again and Menu sit side by side in one row. The art and table are shorter on screens up to 740px tall. Both buttons are fully on screen at 375x667 and 390x844. |
| Recentre 40px tall, Hints 43px wide | Recentre is 44px tall, Hints 44px wide. |
| End count: "priory" label cut under the status bar, pops float off the board, "Valley" peeks behind the plate | End-count pops no longer fly to the score chips. They fade where they are and stay below the status bar. The tray text is hidden while the "Final count" plate shows. |
| Majority and ties only told | Tutorial steps 16 and 17 put example followers on the lit road, with a label above it: "You 2, Hob 1: only you score" and "You 1, Hob 1: both score in full". Real followers are hidden during those two steps so the count on the board matches the label. |
| (found by the sweep) Story chapter 10 rival caption was 9+ words ("The Sable Baron placed a road and a follower.") | Names of 3+ words use their last word in the caption ("Baron placed ..."). |

Unchanged: everything the reviewer confirmed fixed (counters, rival caption, result table, brisk end count, tutorial "Tap" wording, Easy level).

## Gates (12 Nov 2026)
- Logic 71/71; guard ok; tut-walk PASS at 390x844 and 375x667 (24 steps); rotate CLEAN; sweep CLEAN (4 games + story chapters, 1 rotating, 2186 steps).
- Touch games vs Easy to the result card, 0 errors: 390x844 1/2 won (28-51, 34-18); 375x667 2/2 won (22-19, 38-22). End count 3.2-3.4 s.
- 375x667 probe (random glows, 28-36 turns): edge arrows always tappable; 1 target glow out of reach after 4 arrow taps in 28 turns (before: 8 dead taps a game).
