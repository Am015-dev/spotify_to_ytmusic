# [FIXED3 twin-thrones]

Code commit: 44eee160 on shelf/W520-twin-thrones-rules (pushed, not deployed).
The scheduled-task report call was refused, so this file is the report.

## Gates
- `VIS_SLUGS="," build-all.py --quick twin-thrones`: PASS (5/5 scenarios)
- `build-all.py --full` run 1 (alone): PASS (LAB warn-only, as before)
- `build-all.py --full` run 2 (alone): PASS
- guard.py: ok
- logic-test 125/125, rules-test PASS, tutorial script PASS, new cardtext-test.js PASS (73 cards)

## Texts fixed
- Tie: own line ("A tie: same points and same civic points, so nobody wins."); the early-win line shows only for war or science.
- Sand Arena, the 4 coin yellows, the 7 guilds (what scores, from which city) and Customs Quay (both resources) are fully described in the popup and All-cards.

## Helpers (375x553, sampled every 1 s, 2 games, ~7 min each)
Max 1, loops 0. The games did not reach the result screen within the 7 min cap, so these are partial-game samples.

## What changed
1. `describe()` rewritten; `cardtext-test.js` checks each card's text mentions every effect.
2. "Your turn" banner hidden while the card popup or tutorial bubble is open; "+N" floats moved off the goal line; star moved off card names.
3. Token tooltip cleared on token pick and on the result screen.
4. Wonder button shows its cost; popup names the chain card.
5. "Try Normal?" button after 2 Easy wins. Middle level skipped (optional).

## Not covered
No fresh screenshot check of the star/float placement; the tie text was not seen in a live game.
