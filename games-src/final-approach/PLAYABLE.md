# Final Approach: playable pass (W392, 7 Nov 2026)

Method: screenshots at 390x763 and 1440x860 of title, tutorial steps 1-3, first turn, rival turn, scoring/result; looked at as a newcomer; impeccable-style critique
(hierarchy, clarity, feedback, text size/contrast, narrative). Shots of the "after" state are in `playable-shots/` (phone, webp).
The old game already had a painted panel, a one-line prompt, glowing legal spaces and rival reason chips; the gaps were feedback, voice and a few readability holes.

## The 10 worst problems, before and after
| # | Problem (before) | Fix (after) | Status |
|---|---|---|---|
| 1 | Nothing announces whose turn it is; the player has to guess from tiny strips | Banner "Your turn" (blue) / "Ravi's turn" (orange) on every turn, with the instruction line inside it | fixed |
| 2 | The rival's move was instant and unexplained (a 2.6 s chip on a slot only) | Rival turn in steps: banner "Ravi's turn, tap to speed up", 0.9 s thinking, the die animates, caption "Ravi used Flaps 1: Extends a flap." for 1.5 s, then "Your turn". Tap the board to skip the wait | fixed |
| 3 | Tutorial was 23 click-here bubbles with no reason to act | Replaced by a coached first game (addendum 4): free play from turn 1, Voss explains each rule the first time it matters (one dismissable bubble at a time), one-line feedback on your moves, final check rule by rule with real numbers, "things you will meet later" card. Story prologue: check ride, Pell doubts | fixed |
| 4 | Tutorial and results had no voice; loss was a bare "Mission failed" | Tower praise/taunt on every Story result card (all 15 chapters now have both), crew voice line under the Quick game result, story end card | fixed |
| 5 | Landing-checklist chips at the bottom are icons plus bare numbers | Tried word labels under the chips: they collided with the numbers and pushed the Reroll button off a phone screen, so reverted. The chips keep their (i) explanation and the tutorial's `goal` step names the four lights; "Landing checklist" is spoken by Pell in the story | **not fixed**, needs a layout change of the dock (see Remaining) |
| 6 | Title tagline 2.1-2.5:1 contrast over the painting | Solid dark pills behind logo and tagline | fixed |
| 7 | Help opened with a wall of rules | Help now opens with "How a turn works" in 5 lines, and lists the six house rulings in "House rules in this version" | fixed |
| 8 | Tutorial bubble text 13.5 px; 15 px at desktop | 14.5 px phone, 16 px desktop | fixed |
| 9 | Panel rows (radio, gear, flaps, brakes, coffee) carry no words | Not changed: spaces keep icon plus required value, the prompt line and the rival caption name the space ("Ravi used Flaps 1"), tapping a wrong space explains it | partly (captions only) |
| 10 | Computer pace 650 ms with no visible step | Default pace 900 ms, Fast/Normal/Slow kept in Menu, banner and caption make each step readable | fixed |

## What was added (files)
- `game/src/ui8.js`: turn banner, rival caption, tap to speed up, result voice line, styles. `game/src/ui3.js`: `commit` calls `tbAfter`.
- `game/src/ui12.js`: the coached first game (`fcPoll`, `fcSay`, `fcEnd`); `ui5.js`: tutorial entry on the title. `game/src/ui4.js`: Help. `game/src/ui1.js`: pace.
- `campaign.json`: `tutorial` block, `cast.pell`, tower praise/taunt lines. `STORY.md`, `TUTORIAL-COVERAGE.md` (honest list of what the tutorial does not teach).
- `game/playable-test.js`: taps only, never the engine. Tutorial to the end card at 390x763 and 1440x860 (asserts all 26 story ids shown, the target centre is the target and
  not under the bubble or the kit dim, bubble inside the screen and off the target centre, Next reachable, Skip works), a Quick game to the result, Story chapter 1 to the result.

## Remaining (honest)
- The tutorial is a staged two-round flight (from 1000 ft), not a full seven-round game, and it does not teach traffic, corridor tabs, fuel, wind, trainee, ice, clock, abilities, loss cases (see TUTORIAL-COVERAGE.md).
- Dock checklist chips and panel rows still rely on icons; needs a taller dock or a labelled legend (shared dock layout, risk to the phone-s 375x553 fit).
- Story map and its header text come from the shared kit (`gx-campaign`, read-only here): the title wraps to three lines at 390 wide, the act blurbs are clipped, the
  "0 stars of 45" button does nothing (audit E1), and the act headers and title still flag B contrast. A solid backing and 16 px sizes were applied from this game's CSS only.
- Story loss lines are on the result card only; there are no separate loss outro scenes (the kit plays outros on wins only).
- ui-audit counts (after): see the DONE line; remaining B/E items are the shared-kit ones above and the help-sheet text measured while it slides in.
