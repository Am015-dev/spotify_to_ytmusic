# F2 fix report: rampart-and-vine (after F1 cold play: could play yes, enjoyed somewhat)

Branch `shelf/W584-rampart-strict`.

## Gates (final code)
- `build-all.py --quick`: PASS (11/11). `--full`: PASS on the final code (earlier full runs failed on the calm contract, a rotate regression and a bulb-finger drift; all fixed, see below). games/lab.html restored, not committed.
- logic-test 71/71. tut-walk 375x667 PASS. phone-probe PASS (4 runs in a row). rotate-test CLEAN. New `carc/game/pc-mouse-test.js` PASS (3 runs): 1366x768 and 1920x1080 by mouse.
- calm-audit: loops=0 maxHelpers=1.
- Novice 0.5 vs Easy 60% (avg 67-63), vs Medium 21%, vs Normal 0%. Engine and AI untouched, numbers identical to F1.

## What changed
1. Goal card and rules popup are sheets: docked above the tray on phone, in the side panel on PC. The board is re-framed above them. A tap on the board closes them.
2. Numbers explained: priory label "priory 4 of 9", farmer "+6 now" or "pays at end", and a one-line tip on the follower step (8 words max).
3. "N more" chips: 15 px, solid dark, 44 px tall (contrast above 12:1).
4. The view comes back to the action after every placement and every rival turn (the pan lock is cleared); a taller turn card re-frames hidden glows.
5. Pace: rival turn animation is 60% of the old time, a tap on the board skips it, score captions are shorter (2.2 s base, was 4 s), the rival waits at most 1.8 s for captions, and the last caption is cut to 1.2 s when your turn starts. Score captions on your turn now sit under the action line instead of replacing it. First 16 tiles: the bulb prefers a tile that finishes a road or town now.
6. Potential points: a gold "+N" on each of your followers on an open road, town or priory (what it pays when it closes); on PC and tablet the seat shows "+N soon".
7. Checklist rule 5: re-checked with geo_test (6 adjacency warnings on the same seven pieces). No original available here, so it is marked **[unverified]**, data unchanged.
8. PC (width 1000+ and height 600+): side panel with scores, turn line, tile and Place/Skip; the board uses the rest (cells up to 200 px). Text 12 px or more (checked). Mouse rotate, drag, place, follower and skip all work. Phone is unchanged except the points above. Non-current seat name is hidden at 420 px or narrower so seats never overflow.

## Proof
`games-src/carc/proof/first-3min-375x667.webm`, `pc-1366x768.png`, `pc-1920x1080.png`, `baselines-new/*` regenerated (.baselines untouched).

## Cold play: NOT DONE
The independent subagent could not play. Its attempt to run a persistent local driver (a small helper keeping the browser open between moves) was denied by the permission check. It stopped, as the repo rules say, and played no turns. So there is no new cold verdict, no 1-5 score and no phone vs PC comparison from a blind player. It needs the owner to allow a persistent local Playwright script (or another way to let a blind tester look between moves).
