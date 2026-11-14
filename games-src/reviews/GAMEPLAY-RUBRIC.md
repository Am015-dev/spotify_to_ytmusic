# Strict gameplay review rubric (owner, 8 Nov)

Reviewer plays as a new player on a phone (390x844 and 375x667, touch only) on the game's branch build.
Never edit game code. Score each row 1-10; 7 = "a stranger would happily play this", 10 = as good as the official app.
Anything that stops play (stuck, dead tap, crash, rule broken) caps the game's total at 4.

| # | Row | What a 7 needs |
|---|-----|----------------|
| 1 | Rules fidelity | Every core rule and turn step matches the published game (check the real rulebook online; notes local only, never name it in files). |
| 2 | Tutorial teaches | A guided first game teaches every core rule in order, one short line + one tap per step, no "learn later" list, then a real game. |
| 3 | First 10 seconds | A new player knows the goal and what to tap without reading a wall of text. |
| 4 | Turn clarity | Every turn: what can I do, what will it cost/give, whose turn is it. No unexplained icons. |
| 5 | Phone play | Big targets (44px+), nothing cut off or overlapping, board-first, readable text (14px+), works at both sizes. |
| 6 | AI and pacing | Rival plays sensibly and briskly; a new player can win on the default level; a game is a sensible length. |
| 7 | Feel | Pieces move, cards fly, feedback on every action; feels like a game, not a spreadsheet. |
| 8 | Bugs | Full game to the result screen with 0 errors, 0 stuck states, 0 dead taps. |

Total = average of rows (one decimal). PASS only if every row >= 7 and no stopper.
Each finding: row, what you did, what happened, screenshot path.
