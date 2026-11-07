# Nebula Aces: playable pass (W396, 7 Nov 2026)

Method: the first minute was played from fresh storage with `playbot.js` (taps only visible, uncovered UI) and the lesson with `tutor-test.js`, at 390x763 and 1440x860, screenshots looked at as a newcomer. This game already had a board-first phone layer, a one-line hint under the board and a 23-step lesson, so the work was framing, story and clarity, not a rebuild. Old art, 3D and music are untouched.

## The 10 worst problems of the first minute, and what happened

| # | Problem (before) | After |
|---|---|---|
| 1 | Nothing says whose turn it is. The rival's moves only show as a small line at the bottom. | Fixed. A banner opens each turn: "Round N: plan", "Your turn" (action, shot), "Rival's turn" (who moves or aims). Hint line says "Rival's turn: Slate moves". Banners do not take taps. |
| 2 | A stale "No enemy ahead" banner stays over the dice panel for the next shots. | Fixed. It shows 1.5 s and is cleared when the dice, result, target or plan screen opens. |
| 3 | Lesson bubbles read like a manual ("Tap X") and have no voice. | Fixed. Prologue "Convoy Run": Marshal Brecken coaches (portrait on every bubble), the raider Slate answers on the evade and stress steps. Every bubble gives a reason, then the action; 4 titled chapters. Words are in `lore.js`. |
| 4 | The result screen is a bare "DEFEAT" and a rules sentence. | Fixed in part. Result now has a line in the game's voice plus why and the round. No count-up climax (not done). |
| 5 | Help opens with a wall of rules. | Fixed. "How a turn works" in 5 lines first, then the rules, then "Simplified on purpose". |
| 6 | The start screen is long: Launch, lesson, Story, modes, online, factions, sizes. A phone has to scroll to find Launch's options. | Explained, not changed: first-visit order is already lesson first, Launch second; the rest is optional and below. Shared start-screen kit. |
| 7 | Ship tags crowd the top bar and the legend strip overlaps tags at the top of the board. | Explained, not changed: tags follow the 3D camera; moving them risks the 3D framing for every phase. |
| 8 | The top bar chip "R1 Plan you" is clipped on 390 px. | Explained, not changed: part of the shared game bar (read-only). |
| 9 | Action buttons use symbols (◉ ✦ ⌖). | Already labelled underneath (Focus, Evade, Lock) and the hint spells the effect; kept, slot left for real icons. |
| 10 | Story chapter map header ("The Crown Rift Run") is cramped. | Explained, not changed: shared campaign kit. |

Fixed 5 of 10, partly 1, explained 4 (all in shared kit or 3D framing).

## Rival turns
Each rival ship moves and shoots one at a time with a caption per step (existing pacing, 0.6-1.5 s per step, tap anywhere to speed up). New: the caption names the rival and the banner announces the turn.

## Checks (all at the end of this branch)
- `node tutor-test.js` 390x763 and 1440x860: 23 steps, wrong taps do nothing, elementFromPoint at each target, all coverage steps (`LORE.chapters`) shown.
- `node playbot.js quick 390x763` and `story 390x763`: play to the result by taps only (the bot is a poor pilot; it reaches the result either way).
- Quick gate and ui-audit: see the report in the DONE message.
