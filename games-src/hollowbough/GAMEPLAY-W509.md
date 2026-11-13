# Hollowbough gameplay pass (W509)

Compared with the original's rules and a playthrough, then played by touch at 390x844 as a new player.

## Rule differences found and fixed
1. Pass was allowed in any season. Now you may pass only in Autumn (logic-test rule 215). The lesson's short year (`G.tale`) is the one exception.
2. Everything else on the brief already matched and is proven by logic-test (214 rules): one action per turn, card costs, meadow of 8 with refill,
   free critters via constructions, city limit 15, hand limit 8, basic and forest places (shared vs exclusive), events, seasons
   (+1 / +1 and 2 meadow cards / +2 workers, production in Spring and Autumn), destinations, Haven, Journey, prosperity and event scoring.

## Moments a new player was lost, and the fix
- With point tokens on the goods row, the worker pieces vanished on tall phones, so no worker could be dragged (a full touch game got stuck).
  Now one worker stays visible and draggable.
- The greyed Prepare button gave no reason. It now says "Prepare after 2 more workers".
- The prompt said "Build, Prepare or Pass" when Pass was not possible. It now names only what you can do.
- The tutorial bubble's text ran under the Next button. Text now starts below it.
- The tutorial skipped Summer, the Haven, the Journey, destinations, special events, Autumn and bonus scoring, and ended on the menu.
  Now it teaches all of them, one tap each, and ends in a real game (see TUTORIAL-COVERAGE.md).

## Still differs
- The lesson ends in Summer (a short year), not after Autumn.
- Look steps (Haven, Journey, Inn, special events) teach by tapping the spot; you do not use them in the lesson.
- Solo: the player won 0 of 10 against the level-2 bot in the computer test (balance, not a rule difference).
- lay-phone.js is out of date with the tabbed board (it expects the old start menu and every tile on one screen). The touch gates are learn-touch.js and play-drag.js touch.
