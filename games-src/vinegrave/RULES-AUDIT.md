# Vinegrave rules audit (FIXED9, 14 Nov 2026)

Source: the publisher's English rulebook text for the game this one adapts (name deliberately not written here), read 14 Nov 2026,
set against `src/engine.js`, `src/data.js` and every rules sentence the game shows (rules drawer, hints, tutorial). Facts only, no copy.
Tests: `node logic-test.js` (section Z = this audit, one test per fix).

## Wrong or missing core rules, now fixed
| # | Rule (rulebook) | What the game did | Fix | Test |
|---|---|---|---|---|
| 1 | A camp site has two spaces. The second explorer to dig there pays two icons ("the next player will need to cover a cost of 2 Boots"). | Both spaces cost the same one icon. | `siteCost()` in engine.js; site buttons, hints and the AI show and charge the doubled cost. | Z1 |
| 2 | Every archaeologist taken back from a site that still has a guardian brings back a Fear card (even if you did not wake it). | Only the explorer on the first space got Dread; the second space got none. | `endRound` handles both spaces. | Z2 |
| 3 | You overcome a guardian "on a site where you have an archaeologist". | Only the first space counted, so an explorer on the second space could never fight. | `moves()` accepts either space; the AI counts both. | Z3 |
| 4 | Idols go into shrine slots as free actions, as many as you like in a turn; each slot once. | Rules text said "one idol a turn" (the engine already allowed more). | Text fixed in the rules drawer, idol card and help. | Z4 |
| 5 | A Fear card has no effect but still pays a Boot of travel. | Rules text said "Dread does nothing". | Text fixed. | Z5 |
| 6 | No shuffling during a round; an empty deck draws nothing. Played cards go to the play area, then under the deck at round end. | `draw()` reshuffled a discard pile (always empty, but a latent rule break). Text said cards are "discarded". | Reshuffle removed; text says "play area". | Z6 |
| 7 | (text) Round end: each explorer leaving a guardian's site brings home a Dread card. | Text said "anyone with a guardian". | Text fixed. | n/a |
| 8 | (text) The game has assistants and research bonuses. | The "Simplified on purpose" list said "No helpers and no research bonus tiles". | List rewritten. | n/a |

## Checked and right (no change)
5 rounds; one main action then next player; pass = out for the round; free actions (starting coin/compass cards, boons, idol slots,
free-marked effects); draw up to 5, unplayed cards may stay; play area shuffled under the deck, bought items above it; items to the
bottom of the deck, artifacts to the play area with their effect free, artifact from hand costs a tablet; planes = 2 coins; the travel
hierarchy; moon staff exile (one item, one artifact) and the row refill; guardian 5 points + one boon; idols 3 points each plus empty
slot values; Fear cards -1, fear tiles -2 when the supply is empty; research: notebook never above the magnifier and never in the
temple, temple tiles by stacks; starting resources by seat; starting player marker moves left; ties: first into the temple, then research.

## Known simplifications (not core rules, listed in the in-game "Simplified on purpose")
Research track is a ladder of rows, not a map of connected paths; all numbers on cards, sites, guardians and idols are this game's own;
box counts differ for level-II sites, idols and items (A13-A15 in RULES-CHECKLIST.md); the other board side and expansions are absent;
buying an artifact always resolves its effect (the rulebook makes that optional).
