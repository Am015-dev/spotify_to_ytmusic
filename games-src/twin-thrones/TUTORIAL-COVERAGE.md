# Tutorial coverage (W687): ten scenario lessons on the shared engine (shell/gx-scenario-tutor.js)

The old dimming guided game is retired (src/tutor.js removed). Menu > Learn to play (and the bar button on wider screens) opens the
picker. Each lesson hand-builds a tiny position on the real board, gives ONE goal on a floating card, scripts the rival, and judges the
real state: win / fail with a one-line why, stars, retry, hint bulb (nudge then show). Source: src/lessons.js. Test: `node lessons-test.js`.

| Rule (rules-notes.md, rules drawer) | Lesson id |
|---|---|
| Wonder draft: you 1, rival 2, last one yours | draft |
| Pyramid: only uncovered cards; build; covered cards flip | take |
| Cards you own pay their resource | own |
| Trading: 2 coins + 1 per rival card making it | trade |
| Chain symbol makes a linked card free | chain |
| Sell: 2 coins + 1 per yellow card | sell |
| Shields move the pawn; coin loss at 3 steps | war |
| Science pair gives a progress token | pair |
| Wonder: any card tucked under; play again | wonder |
| Scoring and the winner after the last card | game |

Not a lesson (rules drawer only): 9-step war win, six-symbol science win, 7-wonder cap, who starts the next age, guilds, the other
progress tokens, blue-point tie-break.
