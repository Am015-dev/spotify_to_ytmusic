# Tutorial coverage (W397): the prologue is ONE real game, four chapters, played against the real computer to the result screen
Seed 5, stacked decks (bottom row of Age I, the two open cards of Age II, the last two cards of Age III). Between chapters the computer plays both seats quickly ("the years turn"): that is the only fast-forward; the player plays every lesson card.
Driver: `tutorial-e2e.js` (taps the centre of each spotlit element at 390x763 and 1440x860, asserts every step id below was shown, the result screen is reached, 0 console errors).
Resume: leaving keeps the chapter (`tt_tut_ch`); "Tutorial" then offers Continue chapter N or Start from chapter 1 (state is rebuilt from the same seed).
Legend: DO = the player does it, SEE = shown/explained once, NO = not covered (honest).

| Rule | How | Step id (story beat: Ione's reaction in the caption) |
|---|---|---|
| 7 coins each at the start | SEE | `crowns` (the $7 pill) |
| Wonder draft, 4 each of 8, alternating | DO | `draft` x4 ("Claimed! Pell frowns...") |
| Draft order 1-2-2-1 / 2-1-1-2 | SEE | rival takes two in a row (captioned), not explained |
| Pyramid: only uncovered (glowing) cards can be taken | SEE | `pyramid` |
| Taking a card uncovers/flips the ones above | SEE+DO | `tension` ("Pell grabbed X"), flips captioned "Now free to take" |
| Build a free card, effect (production) | DO | `take-free`, `build-free` ("Stone for the walls") |
| Coin card pays at once (yellow) | DO | `take-inn`, `build-inn` ("+4 coins") |
| Pay a coin cost | DO | `take-red`, `build-red` ($1) |
| Red card: shield pushes the conflict pawn | DO | `build-red` ("The pawn marches toward Pell") |
| Pawn track: 9 steps wins, marked spaces loot coins | SEE | `pawn` (not played to a loot or a win) |
| Missing resource is bought: 2 coins + rival's production | DO | `take-buy`, `build-buy` ("Glass bought for coins") |
| Science symbol, chain mark gained | DO | `build-buy` (wheel), `build-chain` (flask) |
| Chain: matching later card is free | DO | `take-pair`/`build-pair`, `take-chain2`/`build-chain2` |
| Sell for 2 coins (+1 per yellow card) | DO | `take-sell`, `sell` |
| Take a card only to deny the rival | DO | `take-sell` text |
| Raise a wonder with a card (cost, power) | DO | `take-wonder`, `wonder` ("The first wonder rises") |
| Science pair gives a progress token; pick one | DO | `build-pair`, `token` |
| Six different symbols win at once | SEE | `sci` (live count in the strip) |
| Guild card scores from the richer city | DO | `take-guild`, `build-guild` |
| Age change, who starts (the one behind on the track chooses; at a tie the player who took the last card chooses, W391 engine fix merged) | SEE | `years` text; the player is given the first move by the script (not the real chooser) |
| Final scoring: civic, science, trade, guilds, wonders, tokens, coins, conflict | SEE (live) | `scoring` (count-up table) |
| Most points wins; tie goes to civic points | SEE | `verdict` |
| End by military or science | SEE | `pawn`, `sci` |
| Can't afford -> sell instead | SEE | `sell` text; disabled buttons dim in the big card |
| Yellow trade posts (cheaper buying) | NO | no staged card |
| Seven-wonder cap, wonder powers: again / discard rival card / revive / library | NO | depend on the random wonder draft |
| Individual progress-token effects, law token | NO | token text is on each token (tap it) |
| Tie on points shared, tie-break details | NO | |
Story beats: every chapter has an opening scene and a closing line (`campaign.json` -> `prologue.chapters`); the guide's reaction after each action is `prologue.steps.<id>.react`; Pell's quip when he takes the card you uncovered is `prologue.pell.freed`.
