# Tutorial coverage (W397, ADDENDUM 4): a COACHED first game, not a tap list
The tutorial is a SHORT real duel against the real computer (fixed seed 5, "easy"): Age I is the full pyramid, Ages II and III are small pyramids (9 and 5 cards) so it fits one sitting and the cards stay big; stacked decks make the bottom row of Age I, the open cards of Age II and a guild in Age III come up. The four story chapters (The Crowns, First Turns, The Years Turn, The Last Card) frame draft, Age I, II and III as coach beats. `window.GXCOACH = {running, explained, done}` is exposed. Every move is a free choice from move 1.
- ONE forced step only: take the glowing wonder (`first`). Then free play.
- Guide Ione speaks just-in-time in ONE bubble at a time (never blocks the board, only its x takes taps, auto-hides after 9 s, queued if a second rule appears). Text: `campaign.json` -> `prologue.coach`.
- Rules that never came up are listed on a "Things you'll meet later" card after the final scoring; the final scoring is walked through row by row with the player's real numbers (`prologue.walk`).
- Driver: `tutorial-e2e.js p|d` plays the coached game with random legal moves through the UI at 390x763 and 1440x860 and asserts: forced steps <= 2, one bubble at a time, every rule below was explained in play OR listed on the later card, 0 console errors.
Legend: PLAY = explained the first time it happens in play; LATER = on the later card if it did not come up; WALK = scoring walk.

| Rule | When Ione says it | Id |
|---|---|---|
| Wonder draft, 4 each, points + power | first wonder (forced step), draft turn | `first`, `draft` |
| Pyramid: only glowing (uncovered) cards; taking uncovers/flips | first play turn | `pyramid` |
| Look at what a card frees for the rival | when the rival takes a card you uncovered | `tension` |
| Build a free card, production | you build for 0 | `free` |
| Coin (yellow) cards pay at once | you build a card that gives coins | `coin` |
| Paid cost, missing resources bought (2 + rival production) | you build and pay coins | `paid` |
| Shield pushes the pawn, 9 wins | any shield card built | `shield` |
| Loot at marked spaces | the pawn passes a marked space | `loot` |
| Chain mark gained / chain build free | you build a card with a mark / by chain | `chain-mark`, `chain` |
| Science symbols, pair, six win | you build a green card | `sci` |
| Pair gives a progress token | the token choice appears | `pair` |
| Sell: 2 coins + 1 per yellow; poor-move line if you sold a card you could build free | you sell | `sell` (`sell-poor`) |
| Raise a wonder | you raise one | `wonder` |
| Age change, who starts (behind on the track; at a tie the last-card taker, W391 fix) | Age II/III begins | `age` |
| Guild scores at the end from the richer city | you build a purple card | `guild` |
| Final scoring, rule by rule, tie-break | result screen walk (9 rows, your numbers) | WALK |
| Yellow trade posts, seven-wonder cap, wonder powers, token effects, tie-break, science win, military win, draft order | not guaranteed to come up | LATER (`trade`, `cap`, `powers`, `tokens`, `tie`, `science`, `military`, `draftorder`) |
Story beats: intro scene before the duel (3 lines), Ione's reaction lines are the coach bubbles, Pell's name on the rival; the scoring walk is the climax.
Honest limits: a rule only counts as "explained in play" when the situation really occurs in that game; otherwise it is on the later card (the e2e prints how many of each).
