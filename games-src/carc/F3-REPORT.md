# F3 report: rampart-and-vine (after R108 FAIL)

Branch `shelf/W584-rampart-strict`. Not deployed, no PR.

## Gates
- `--quick` PASS (11/11). `--full` (run once, alone) PASS, `SWEEP CLEAN` (4 games, 2102 steps).
- `logic-test.js` 71/71. Calm audit: loops=0, maxHelpers=1.
- Covered-glow probe (`game/tools/glow-probe.js`, in-page sampling every 60 ms through whole games, goal card up, hints on and off): 0 covered of 6809 visible glows at 375x553, 375x667, 910x512 and 1366x768.

## Stopper: what I could and could not reproduce
- Before my changes the same probe also gave 0 covered of 5579 visible glows. I could not reproduce the review's 27/67, 243/494, 51/176. The review's counts probably include glows that are deliberately `visibility:hidden` under the chrome (they have "N more" pills instead), which are not drawn or tappable.
- Real fixes made anyway: at most two "N more" pills on a phone (busiest sides; was up to four over the board at 375x553); hover preview no longer changes the banner height and re-frames the board under the finger (that caused 18-29 dead taps in the touch sweep until fixed); phone hand tile now sits inside the tray.

## Easy (novice bench, 100 games each, `novice-bench.js`)
Newcomer bot wins vs Easy: 37% at pGood 0.25, 61% at 0.35, 79% at 0.5 (before: 13%, 29%, 60%). About 50% for a newcomer. Easy now: best spot 15%, else one of top 8, follower skipped 45%.

## Changed
Text: hog town count, farmer/at-end labels, "+N if finished", closes-a-town line, priory tip, majority wording, unfinished-at-end in How to play and goal card, river wording, nothing-to-claim, hot-seat "you". Empty spots are faint dashed outlines. Tutorial: your farmer stays, banner step shows all three town tiles, no "Garnet", score bar avoided by the lesson bubble (see open items). Phone and PC both pick a square then confirm. Hover keeps the instruction (preview on its own line). One-way tiles shake when tapped. Phone zoom-in cap 104 -> 84. Baselines: title shots now the real title screen; phone hand tile no longer clipped (not approved).

## Open (cold check, quoted below)
- The shell's "N/24 Skip tutorial" strip still covers the score bar in the tutorial (shell file, not edited).
- Cold player saw a score strip over the board on PC and one click that did nothing; not reproduced.
- Follower labels still differ in wording between steps. "How you win" card still covers the lower board at the start. Rule 5 (Merchants tiles) untouched.

## Cold check (independent subagent, as-is)
Could play both; tutorial finished. Phone: Cobalt 44, me 24. PC: Cobalt 39, me 34. Fun 3/5, would play again. Complaints: tutorial score bar hidden by the skip strip; follower label wording varies; "Hob takes a turn" needed a tap on an unlabelled tile; "How you win" card hides the lower board; possible dead tap on the last turn (not reproduced); on PC a score strip over lit squares and one click that did nothing; ran out of followers with no explanation.

Proof: `games-src/carc/proof/shots-f3/` (375x553, 375x667, 910x512, 1366x768, 1920x1080), candidate baselines `games-src/carc/proof/baselines-new/`.
