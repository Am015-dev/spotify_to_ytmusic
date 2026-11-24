# Ochre Horizon rules audit (24 Nov 2026)

Each rule of `rules-notes.md` checked three ways: **Engine** (src/engine.js, proven by `game/rules-test.js`),
**Rules panel** (menu > How to play, `rulesHTML` in src/ui5.js) and **Guide** (the coach lines in ui5.js, the guided game in ui6.js,
the charters in ui7.js). PASS = all three agree with the notes. FIXED = was wrong, now fixed, with the test named.

| # | Rule | Engine | Rules panel | Guide | Result |
|---|------|--------|-------------|-------|--------|
| 1 | Setup: 2 companies (+ beginner), 10 cards, keep for 3 each; beginner keeps all 10 free | PASS (setup tests) | PASS | PASS | PASS |
| 2 | Rating 20, no starting production, globals -30°C / 0% / 0 oceans | PASS | PASS | PASS | PASS |
| 3 | Generation 1 has no research; then 4 cards, 3 credits each | PASS | PASS | PASS | PASS |
| 4 | Draft variant: pick 1 of 4, pass the rest, then buy | PASS | not stated (option on start screen) | n/a | PASS |
| 5 | First player alternates every generation | PASS | **missing** | n/a | FIXED (panel line added; test "first player rotates") |
| 6 | 1 or 2 actions per turn; Done after 1; a passed player is skipped | PASS | PASS | **Pass button aria said "you play again next round" after Done** | FIXED (now "after the rival") |
| 7 | Actions list (card, standard project, 8 plants, 8 heat, milestone, award, card action once per generation, pass) | PASS | PASS | PASS | PASS |
| 8 | Standard projects 1 / 11 / 14 / 18 / 23 / 25, city +1 credit production | PASS | PASS | PASS | PASS |
| 9 | Production: energy -> heat, credits = production + rating, all other production | PASS | PASS | PASS | PASS |
| 10 | Each global step +1 rating for whoever raised it | PASS | PASS | PASS | PASS |
| 11 | A maxed global cannot rise (no rating) but cards that raise it can still be played | PASS (new test) | **missing** | n/a | FIXED (panel line + test "maxed global: a card that raises it can still be played") |
| 12 | Bonus steps: -24 and -20°C heat production, 0°C ocean, 8% oxygen -> temperature | PASS | PASS | **coach line left out the oxygen bonus** | FIXED (coach "bonus" line) |
| 13 | Oceans only on ocean spaces, 9 max; greenery next to own tile if possible; cities never next to cities | PASS | PASS | PASS | PASS |
| 14 | Placement bonuses + 2 credits per adjacent ocean; reserved/off-map spaces only by their card | PASS | PASS | PASS | PASS |
| 15 | Steel 2 (building), titanium 3 (space); requirements min/max; event tags only when played | PASS | PASS | PASS | PASS |
| 16 | Negative own production must be possible (credit floor -5) | PASS | PASS | PASS | PASS |
| 17 | **Decrease ANY player's production**: someone must lose the FULL amount (you if the rival can't); if nobody can, the card can't be played | **FAIL: engine took a partial cut from the rival, or nothing, and let the card be played** | missing | n/a | FIXED (engine `opsPossible`/`rprod`; 3 tests "production cut: ...") |
| 18 | Remove resources from any player: takes what is there (may be 0) | PASS | n/a | n/a | PASS |
| 19 | Milestones 8 credits, 5 points, max 3 claimed | PASS | PASS | PASS | PASS |
| 20 | Awards 8/14/20, max 3; 2 players: leader 5, no second place, tie pays both | PASS | PASS | PASS | PASS |
| 21 | End: all three globals maxed -> finish that generation incl. production -> final greenery -> score | PASS | **said "the round ends the game" only** | **coach "end" said the game ends when the gauges hit their goals** | FIXED (panel + coach lines) |
| 22 | Scoring: rating + milestones + awards + 1 per greenery + 1 per greenery next to own cities + card VP | PASS | PASS | PASS | PASS |
| 23 | Tie: most credits | PASS | **missing** | n/a | FIXED (panel line; test "tie-break: most credits") |
| 24 | Unplayable card: the reason is visible | n/a | n/a | **hand list greyed cards without saying why** | FIXED (reason badge on the card: "Needs 5% O₂+", "Short 6 credits"; checked on 475 cards in the full touch game) |

Mismatches found: 9 (1 engine, 5 rules panel, 3 guide/screen). All fixed. `node rules-test.js`: 64 passed, 0 failed.

Known interface simplifications (not rule changes, see rules-notes.md): automatic payment mix; production cuts pick the rival first.
