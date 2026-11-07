# Twin Thrones: rules notes (own words)

Two-player card game, three ages. Names, card text and art are original; mechanics follow the published structure.

## Implemented (src/engine.js)
- Setup: 7 coins each; 8 of 12 wonders drafted 4 + 4 (pick order 1-2-2-1 then 2-1-1-2); 10 progress tokens, 5 face up, 5 in reserve (3 drawn by the library wonder); military track -9..+9; age decks 20 cards each (age 3 = 17 + 3 of 7 guilds).
- Pyramids: age 1 `2-3-4-5-6`, age 2 `6-5-4-3-2`, age 3 `2-3-4-2-4-3-2`, rows alternate face up/down; a card is takeable when no card in the next row sits on it; taking cards flips newly uncovered face-down cards.
- Turn: build (pay), sell for 2 + yellow cards, or raise a wonder (card tucked under; at most seven wonders in the game).
- Trading: each missing resource unit costs 2 + rival's printed production of it (brown/grey cards only), or 1 with a matching trade-post card. Choice producers assigned cheapest. Chain symbol = free. Architecture / Masonry tokens remove 2 resource units (wonders / blue cards).
- Military: pawn moves by shields; first crossing of 3 and 6 steps makes the rival lose 2 and 5 coins; 9 steps wins. End scoring 2/5/10 by zone.
- Science: second copy of a symbol = take a progress token; 6 different symbols (law token counts) = instant win.
- Wonders: shields, coins, steal, play-again, burn a rival grey/brown card, rebuild from discard, library (pick 1 of 3 tokens), resource choice.
- Age change: player behind on the track chooses who starts (tie: the player who did not take the last card).
- End: points (cards, wonders, tokens, 1 per 3 coins, military zone); tie -> civic points; else shared.

## Confirmed vs guessed
Confirmed from the brief: structure above, instant wins, 8 wonders, chain, pricing formula, 3 ages, guilds only in age 3.
Guessed (written from memory, no rulebook access in this session): exact card roster/costs/VP values, wonder costs and exact effects, pyramid geometry of age 3, face-up/down row pattern, which tokens exist (10 listed in data.js), tie-break details, the "tie: who chooses first player" rule, Strategy token not applied to wonder shields. Check against the private research notes before a public release.

## Not built
Online play, sound, tutorial, campaign (see HANDOFF.md).
