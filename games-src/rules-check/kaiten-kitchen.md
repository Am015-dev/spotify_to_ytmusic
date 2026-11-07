# kaiten-kitchen: rules check

Adapts: a 108-card, simultaneous-pick, pass-the-hand card-drafting game for 2 to 5 players over 3 rounds (small-box family game, well known).

Sources checked: web search of rules-summary sites (officialgamerules.org, gamerules.com, boardgamecapital.com, happypiranha.com; summaries and rulebook pages, partly visible only); the shelf's own `kaiten/rules-notes.md` and `kaiten/game/ENGINE-REPORT.md`; engine `games-src/kaiten/game/src/engine.js` (whole file, 274 lines) and `data.js` numbers. Rulebook PDF itself was not fetched.

WRONG 0, MISSING 0, SIMPLIFIED 4

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| SIMPLIFIED | engine.js:136-142 (`orderPick`) | When a player uses the double-pick card, the two cards are placed in an automatic order (Fire Paste first, then best nigiri first). | Real rules let the player choose the order they put the two cards down. The automatic order is never worse for the player, but a deliberate "nigiri first, paste after" choice (to not use the paste on a weak nigiri) is not possible. Documented in notes (decision 1). |
| SIMPLIFIED | engine.js:101-108, 202-205 (`G.tw`) | Story-mode twists (extra roll icons for the boss seat, head-start custard, head-start points) are applied on top of scoring. | Not part of the published game. Campaign-only; confirm they are off in normal play. |
| SIMPLIFIED | engine.js:14, 85-87 | Custard tie for fewest splits the loss rounded down (two tied lose 3 each, etc.). | Published text: ties divide the points evenly, rounded down. Matches. Listed because the notes list it as "decided by us"; confidence med that the printed text covers the fewest side as well as the most side. |
| SIMPLIFIED | engine.js:134-135 (`place`) | A nigiri automatically goes on the oldest unused Fire Paste. | Real rules: a nigiri goes on any unused paste you hold; with several unused pastes the choice is irrelevant to score (all triple). No scoring difference. |

## Checked and correct (sample)
- Card counts and scores: prawn 14 (5 per pair), fish 14 (10 per three), buns 14 (1/3/6/10/15, 5+ capped at 15), roll icons 12x2, 8x3, 6x1, nigiri 10/5/5 worth 2/3/1, paste 6 (triples next nigiri), double-pick 4, custard 10. Total 108. High confidence.
- Roll race: most 6, second 3, tie for most splits 6 rounded down and no second place, tie for second splits 3, zero icons never score (makiPoints). High.
- Custard: kept across rounds, scored once at the end, most +6, fewest -6, ties split rounded down, no penalty for fewest with 2 players, all equal scores nobody. High for 2-player exception; med for rounding of the penalty.
- Hand sizes 10/9/8/7 for 2/3/4/5 players, three rounds, hands passed one seat each turn, leftover cards of a round discarded and new hand dealt from the same deck without reshuffle (5 players use 105 of 108). High.
- Double-pick: usable only if already on the table before the turn, the card returns to the hand and is passed on, needs 2 cards in hand. High.
- Winner: highest total, tie to more custard, still tied is shared. High.

## Not verified
- Pass direction: one summary page lists a variant that alternates direction by round; another says the base game always passes the same way. The engine always passes left. Confidence med that the base game passes left every round (the alternating text is probably a different edition's variant). Check the printed rulebook.
- Whether the printed rules say the fewest-custard penalty is also rounded down (vs. rounded toward zero in the other direction). Low-med.
- Exact rule text on whether paste can be put under a nigiri already on the table (engine: no, paste only helps nigiri played after it). Summary pages agree (high).
