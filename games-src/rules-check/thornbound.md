# Rules check: thornbound

Adapts: a four-faction, fixed-length (4/5/6 rounds) area-majority and bidding game for 1-4 players. Each round has a secret bid for market cards, a public Herald placement, three face-down card placements, three region clashes, then a govern/journey autumn step. Most Influence after the last round wins. Rules-engine file: games-src/thornbound/game/src/engine.js.

Sources checked
- games-src/thornbound/rules-notes.md and sources.md. These say they were built from the publisher rulebook (read via a mirror) plus the publisher card library images. I could not re-open the rulebook myself.
- Web search for a second, independent source returned only rulebook-mirror hits (domains bghub.org, boardgamearchive.com); I did not open them, so nothing below was independently re-verified online. Confidence is therefore "med" for everything that rests on rules-notes.md alone.
- Engine read: setup, start of year, bids and steal, Great Road refill, herald and face-down placement, clash flow (reveal, Day, Night, tally, tie re-clash, location reward, Herald Reward), Autumn govern/journey/rally/deploy/councils, Winter cleanup, end scoring and tie-break. Sampled 20+ Kingdom Cards and all 4 Tactics/Favour lists against data.js text.

WRONG 0, MISSING 3, SIMPLIFIED 6

## Findings
| Class | Code | What the code does | Correct rule in plain words | Conf |
|---|---|---|---|---|
| MISSING | engine.js:246-250 (acquireKC) | When a player acquires a Kingdom Card and has an empty board space, it is placed there automatically. The "replace an occupied one" choice is only offered when both spaces are full. | The acquired card may be put on EITHER board space, empty or already filled (filled: old card discarded, its occupier back to Hand). A player may want to replace a weak card even with an empty space. | med |
| MISSING | engine.js:171 (newGame throws for <2 players) | Solo mode (the Sim opponent, ambition/scheme/fog/forge decks, heat scale) is not built. | The published game has a full solo mode. | high (documented in GAPS.md, source material unavailable) |
| MISSING | engine.js newGame (no option) | Optional Advanced Setup (deal 5 Kingdom Cards each, one-time mulligan, pick 1 face-down with an occupier) is not implemented. | The rulebook offers it as an optional setup for any length. | high (documented in ENGINE-REPORT "Known gaps") |
| SIMPLIFIED | engine.js:~167 (hs:6) | Starting Hand Size is 6. | The printed starting Hand Size marker value is not in the text sources; 6 is inferred from "draw to six at setup". | low (documented assumption) |
| SIMPLIFIED | data.js BASIC ids b01,b07,b08,b09 and eff() | Trait icons mapped by inference: shield = Invulnerable, helmet = Resilient, map = Pathfinder. | Icon legend lives on the Rules Reference Sheet, never read. | low (documented) |
| SIMPLIFIED | engine.js:~181-190 (attrition/drawUp) | Attrition fires at most once per draw event and still lowers Hand Size when the Discard Pile is empty. | Rulebook: shuffle Discard into a new Deck and lower Hand Size by one; behaviour with an empty Discard not stated. | med (documented) |
| SIMPLIFIED | engine.js:305-310 (Necropolis) | Draws min(3, free hand room, discard size) after shuffling the Discard in place. | Text: "shuffle your Discard Pile and draw up to three cards"; exact flow needs the FAQ. | med (documented) |
| SIMPLIFIED | engine.js heraldRw ~line 315 | The Coin Council cash-in is offered only if your Herald stands on the Location you chose (it sits inside the Herald Reward step). | Rule says "when you claim your Herald Reward"; whether it also triggers when you get no Herald Reward is not stated. | low |
| SIMPLIFIED | engine.js ambush/retreat (cmd:ambush ~581) | The Ruse card counts as one use of Ambush OR Retreat per Clash. | Card text "Ambush or Retreat"; per-Clash limit is an assumption. | med (documented) |

## Verified matching (no difference found)
Counts: 51 Kingdom Cards (17 per suit), 4 factions x 19 cards (14 basic, strength sum 65, 5 site cards), 16 Tactics (4 each). Setup: 4 Great Road cards, 5 cards-in-hand after Heir, deck of 8. Round 1 has no draw. Order Track by Influence with ties reversed. Bids: highest first, ties by Order Track, steal needs strictly higher Strength, occupier returns to Hand, Great Road discards 1 (taken) or 2 (none taken) and slides right. Herald placement in turn order; fewer-than-3-card players place first; 3 face-down cards, one per Region. Clash markers placed by last on Order Track. Supporters give +1 only until first Clash in the Region. Deadly mutual kills; Invulnerable/Resilient. Tie: re-clash among tied players, all pass = no rewards. Location rewards (1/1/1/2/1/1), reward before Herald Reward, Herald +1 and steals 1 per rival on the same Location. Govern/Journey once each, Lore saved until next Lore gain, Winter clears Heralds, sends Supporters to Lost Pile, token cards lose one token. Game ends after the last Winter; empty Site of Power converts Lore at 1 Influence per 2; tie-breaks Favour holder then Order Track. No per-player-count rule differences (2-4 supported).

## Not verified
- Whether a 2-player or 3-player game really excludes certain factions (one snippet claims it). Not in rules-notes; engine allows all combinations. Confidence: low.
- All Kingdom Card, Site and Tactic texts were checked only against the project's own cards.json/data.js text, not against the physical cards. Sampled cards behaved as their text says.
- Rulebook FAQ/errata and the Rules Reference Sheet were never retrieved.
- Whether the "tutorial" 1-round length exists in the published game (it is a project addition for the staged tutorial).

## Fixed (W391)
- MISSING acquired Kingdom Card may go on either board space, even when the other is empty -> fixed (the pick is offered whenever one space is occupied; the AI prefers the empty one); tests "acquired Kingdom Card may replace an occupied space..." and the updated Crone of Autumn test.
- MISSING solo mode and advanced setup: left (large features; need new UI; documented gaps).
- SIMPLIFIED items: one "Kept simple" line in the rules drawer.
- Unverified (no source, nothing changed): starting hand size 6, trait icon mapping, Necropolis flow, Coin Council timing, Ruse per-clash limit.
