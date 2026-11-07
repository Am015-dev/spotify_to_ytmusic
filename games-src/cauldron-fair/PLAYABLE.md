# Cauldron Fair: playable pass (W398)

Starting point: the old live game the owner likes (art, 3D bag, music) was kept as is; nothing was dropped. Screens looked at: title, tutorial steps 1-3, first turn, a push-your-luck turn, the end-of-day market, at 390x763.

## The 10 worst first-minute problems and what was done
| # | Problem (before) | After |
|---|---|---|
| 1 | Nothing says whose turn it is: rivals only show "waiting"/"finished" in a small pill | Turn banner slides in ("Day 1 · Your turn to brew", "Odo's turn to brew", "Counting up") |
| 2 | On a phone the prompt line and panel head are hidden (display:none); the instruction was only a tip popup you dismiss | One always-visible instruction bar above the controls, plain words, max 2 lines, 15px, solid backing ("YOUR TURN  White 3 of 7. Draw another chip, or Stop to keep your space.") |
| 3 | Rivals finish their brew before you have drawn; you never see their chips | Rival feed: each rival draw/flask/boom/stop appears one chip at a time (about 1 s each, tap to skip), with avatar and chip |
| 4 | Tutorial was forced tap steps | Coached first game: free play, just-in-time Hask bubbles (see TUTORIAL-COVERAGE.md), no spotlight |
| 5 | No record of what the tutorial teaches | TUTORIAL-COVERAGE.md (rule -> step -> story beat) and an honest "not covered" list |
| 6 | A lost Story chapter ended with the win text | Every chapter has its own loss outro (src/story-data.js) |
| 7 | Quick game had no voice | A flavour line on day 1 and a result line in the game's voice |
| 8 | Help opened with "Turn in one minute" among long text | Renamed "How a turn works", 5 short lines first (already so; now named as asked) |
| 9 | Tutorial is two days, not a full 9-day game | NOT fixed: stays a two-day real game; later-day rules listed in TUTORIAL-COVERAGE.md |
| 10 | Opponents' cauldrons are not drawn on a phone, only their points | NOT fixed: the rival feed and banner explain their turn instead; a full second cauldron does not fit 390 px |

## Rules
W391's engine fix (purple set 4 upgrade keeps the old chip in the pot) is merged into this branch; its rules-test case is in rules-test.js. The rulebook items left as SIMPLIFIED stay and are in the help drawer ("Confirmed vs guessed").

## Checks
tutor-test.js (the tutorial played through real taps, wrong-tap, rotate, leave, skip, anim runs), tap-play.js (Quick game and Story chapter 1 to the result with taps only), rules-test, build-all --quick, ui-audit: see the report line in the branch's last commit message.
