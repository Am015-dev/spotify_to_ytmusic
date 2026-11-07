# Rules check: tidewake

Adapts: a tile-laying path-following elimination game for 2-8 players (each player lays a wake tile in front of their ship and follows the line; last ship afloat wins) plus a sea-monster variant with dice-triggered monster movement, and the publisher's expansion (portal tile, travelling wave, whirlpool, deck cannons). Engine files: games-src/tidewake/game/src/engine.js, data.js.

Sources checked
- games-src/tidewake/rules-notes.md and sources.md (built from the base rulebook text and expansion rules text on a rules-summary site, plus an academic page listing the 35 distinct tiles). Publisher site, catalogue site and retailer PDF were blocked per the notes; I did not retry them.
- games-src/tidewake/game/RULES-AUDIT.md (an earlier audit; I re-read engine setup, leviathan/turn code and data.js to confirm its "fixed" claims still hold).
- No independent online source opened in this pass; confidence is "med" where the finding rests on the notes.

WRONG 0, MISSING 3, SIMPLIFIED 7

## Findings
| Class | Code | What the code does | Correct rule in plain words | Conf |
|---|---|---|---|---|
| SIMPLIFIED | data.js:5 (BW=6) | Board is 6 x 6 squares, dice give columns/rows 1-6. | Sources conflict: 7x7, 8x8 (with a 6x6 dice area) and 6x6 are all mentioned. With 56 tiles on 36 squares the "last available square shared win" and the "play every tile" solo goal become unreachable. The real board is probably larger than 6x6. | low-med (documented, audit item 2) |
| SIMPLIFIED | data.js:11 (EXTRA_TYPES) | The 56 tiles = the 35 distinct matchings + 21 duplicates chosen by us. | The real multiset of the 21 duplicate tiles is unknown; tile frequencies affect play. | high that it is a guess (documented) |
| SIMPLIFIED | data.js:19-29 (LEV) | The 10 monsters' arrow layouts, activation numbers 1-8 and gold tie-break arrows are invented. | Real tiles have their own printed layouts and numbers 1-10. Mechanic (one die, 1-5 arrow, 6 = spawn) is right. | high (documented) |
| SIMPLIFIED | engine.js:98 | Easy solo starts with 4 monsters and ends at 24 turns or an empty pile. | Publisher's easy solo: survive until the tile pile is gone, destroyed tiles discarded; start count and the 24-turn cap are our own. | med (documented, audit item 3) |
| SIMPLIFIED | engine.js (adjacent-kill) | A monster kills the active ship only when it sits on the square directly in front of the ship. | Rule text: a monster "adjacent to the active ship" destroys it because it blocks placement; front-square reading is the likely meaning. | med (documented, audit item 6) |
| SIMPLIFIED | engine.js (forced collision) | If a ship is forced onto a wake going the same direction as another, both sink. | Rule only forbids placing that way when avoidable; forced case not stated in the sources. | low (documented) |
| SIMPLIFIED | engine.js rift-gate interrupt | Out-of-turn portal uses a free neighbour square of the doomed ship; dice placements skip portal squares. | Sources give no square for out-of-turn play; newly placed monsters should be carried through a portal and the wave/whirlpool may share its square. | low |
| MISSING | engine.js (portal vs placed monsters) | A monster placed by dice never lands on a portal (re-rolled), so it is never carried through. | A newly placed monster on a portal square is transported. | low |
| MISSING | engine.js (rogue wave roll) | The wave check roll is made for the active player's ship and ships whose path touches the row. Other ships already inside the row when it moves roll nothing; a wave that spawns on the active ship's row does not force a roll if the ship later leaves. | Text: players in or entering the new row roll against the wave strength. | low |
| MISSING | engine.js (maelstrom on refill turn) | Whirlpool does not move on a turn where nobody rolls because of the minimum-3 monster refill. | "Moves when the 6/7/8 check fails": ambiguous for a refill turn. | low (documented) |

## Verified matching (no difference found)
Setup: 3-tile hands, monsters 6/6/6/5/5/4/4 for 2-8 players (the expansion tiles count toward that number), ships placed before any tile, dice coordinates with re-roll on occupied squares, random facing. Turn: roll, place (own-edge/loop/monster/same-wake placements only as a last resort), move along the wake, other ships whose wake is extended also move, draw to 3. 6/7/8 triggers monsters in corner-number order, one die each, 6 = spawn instead of move. Off board removes monster; onto a wake tile destroys it (to pile bottom), sinks ships; onto a stationary monster destroys that one. Minimum 3 monsters refilled by the next player without a roll. Elimination swap bonus, last ship wins, simultaneous exits share the win. The Maelstrom-removes-tile defect from the earlier audit is fixed (tiles go out of game). Expansion: portal, two-tile wave strength 2/3/3/4, whirlpool 5-6 stays, cannon limit 2 and bottom-of-pile return all match the notes. Teams limited to 4/6/8 players.

## Not verified
- Board size, tile multiset, monster layouts (see above): cannot be confirmed without a physical copy or the publisher PDF.
- Solo and team variants are known only from search snippets.
- No FAQ or errata was found.
