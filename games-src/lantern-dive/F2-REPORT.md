# lantern-dive F2 report (fix list from R101)
Base: F1 branch (shelf/W578-lantern-strict) merged in, because the review's line numbers refer to it.

Done: board job labels carry the rule ("Colour 3 wins", "Tie Captain's tricks", "Your 7 wins a 5"); flare prompt says the cost (8 words);
pass prompt says which card; "+1 trick"/job pop-ups clamped 8 px inside the table (probe: left >= 10 at all sizes); Configure: Team size first,
32-dive list and crew folded, scroll and folds kept on a tap; Goal pop-up shows until the first dive is logged; drone cards 44 px wide on short phones;
fail result holds its retry buttons for 1.2 s; the five rule texts fixed.
Gates: build-all --quick PASS, --full PASS (sweep 4 games 0 problems), logic-test 206/206, rules-test 105/105, calm-lantern CALM PASS (loops 0, max 1 helper).
PC probe (game/probe-f2.js): 375x667, 375x553, 910x512, 1366x768, 1920x1080: 0 errors, no tap target under 44 px on cards/seats/buttons, no text under 12 px, no page scroll. Shots: proof/shots-f2/.
Open: tutorial bubble still arrives 1-2 s after the screen changes; the signal-step switch to Kelp 3 is not explained; cold tester reported a possible tutorial rewind at step 14 (not reproduced, its bot may have mis-tapped); its broken-image report came from serving /tmp/x without media/.
Cold check (independent subagent): could play (tutorial 14/22 steps + a full real dive by touch, a second attempt by mouse); fun 3/5; play again "maybe"; confusing: flare unexplained (before this fix reached it), hand rows overlap on phone, tutorial rewind at 14/22, first dive hard.
