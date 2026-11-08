# redline-rally: rules check

Adapts: a deck-building motor-racing game for 2-6 cars (2022 core game, base rules only, no garage/legends/weather modules): shift gear, play that many cards, move by the total, heat and stress cards, corner speed limits, slipstream, adrenaline for the trailing car.

Sources checked
- Publisher English core-rules booklet PDF (host: 1jour-1jeu.com, cdn.1j1ju.com "core rulebook PDF"), full text extracted and read. Confidence high for everything quoted below.
- games-src/redline-rally/rules-notes.md and src/engine.js (all of it), src/data.js (HAND, COOL, ENGINE0), ui.js grep.
- Note: rules-notes.md says it was cross-checked from memory without the rulebook; three rows were marked UNSURE. This check resolves them.

Counts: WRONG 4, MISSING 4, SIMPLIFIED 3

## Matches the rulebook (checked, no action)
- Hand 7, engine 6 heat, 12 speed cards (1-4, three each) and 3 stress cards in the draw deck; reshuffle discard when the deck runs out. engine.js:10-18, data.js:24.
- Gear 1-4 = exactly that many cards; shift one for free, two for 1 heat (heat goes to discard); start in gear 1. engine.js:93-96, :112.
- Speed is the sum; stress card flips the deck to a speed card and discards the others. engine.js:58-64.
- Boost once per turn for 1 heat, flips to a speed card, counts as speed for corners. engine.js:126.
- Cooldown: gear 1 = 3 heat from hand back to engine, gear 2 = 1, gears 3-4 none. data.js:25.
- Corner: pay heat equal to speed over the limit, per corner crossed in order; not enough heat means spin out behind the corner line, gear 1. engine.js:146-153.
- Slipstream: optional, 2 spaces, not counted as speed; two cars per space, a full space pushes you back to the first free space behind; leader resolves first; heat cards cannot be played or discarded. 
- Race length setting: the printed track says how many laps (regular is 2, 1 for a first game); here 1-3, default 2.

## Findings
| Class | Code | What the code does | Correct rule |
|---|---|---|---|
| WRONG | engine.js:149-151 | Spin out always gives exactly 1 stress card into the hand. | 1 stress card if the car was in gear 1 or 2, 2 stress cards if in gear 3 or 4. |
| WRONG | engine.js:149-151 | On a spin out the car keeps all its engine heat. | The car pays ALL the heat it has (engine heat goes to the discard pile) before spinning out. |
| WRONG | engine.js:81-84 (startResolve) | Adrenaline only with 3+ cars, only to the last car, and only if it is 2+ spaces behind the leader. | Adrenaline goes to the last car to move each round (no distance condition), and to the last TWO cars when 5 or more cars started the race. It is counted from the number of cars that started, not those still racing. Applies in 2-car races too. |
| WRONG | engine.js:147 plus 126 | Race ends the round anyone finishes, everyone else is ranked by distance. | The race continues until all cars finish; finishers are placed in finishing order in a hall of fame, adrenaline is still handed out by starting car count. Only same-round finishers are ranked by distance. (Possibly SIMPLIFIED: the notes say ranking by distance is the intended rule; the rulebook contradicts it.) |
| MISSING | engine.js:13-14 (deck build) | Deck is 15 cards (12 speed + 3 stress). | Each car starts with 3 extra Starting Upgrade cards shuffled into the draw deck (18 cards). Their exact values and icons are not in the booklet text I extracted. |
| MISSING | engine.js:111-113 (needCards) | If the hand has too few playable cards for the gear, the car plays fewer cards and still moves. | The car plays all playable cards, fills the rest with heat cards from the hand, does NOT move, drops to gear 1, discards the play area and goes to replenish. |
| MISSING | engine.js:162 (draw) | No option to discard cards from the hand before drawing to 7. | Optional "discard" step: discard any non-heat, non-stress cards from hand (face up), then draw back to 7. |
| MISSING | engine.js:136-139 | Slipstream may be offered when the move ends past the finish line or on the last lap. | Slipstreaming is not allowed once the car has crossed the finish line on the last lap, nor across it. Corner limits after the line are also ignored. |
| SIMPLIFIED | engine.js:100-103 | Cooldown is applied at gear-shift time, before cards are shown. | Cooldown and boost are used in the React step after cards are revealed and the car moved. The result is the same except for ordering with adrenaline; documented-ish. |
| SIMPLIFIED | rules-notes.md | Heat taken from the engine and stress reserve are not limited by a stress card supply. | Stress cards come from a limited reserve beside the board. |
| SIMPLIFIED | src/track.js | Two original tracks; the printed game has four. | n/a, content choice. |

## Resolved from the earlier UNSURE list
- Row 13 (spin-out stress): now known to be WRONG, see above.
- Row 15 (adrenaline): the "2+ spaces behind" and "3-car minimum" conditions are not in the rulebook, see above.
- Row 18 (laps): the track sets the lap count; 2 is the regular number. Fine as a setting.

## Not verified
- Whether adrenaline's extra space counts as speed for the corner check: the booklet states it for boost and slipstream only; code does not count it. Med.
- Exact count of Stress cards in the reserve and the printed number of Heat cards on other tracks (this booklet says "typically 6 heat and 3 stress"). Med.
- The Starting Upgrade cards: values and whether they count as non-speed cards for the stress-card flip (the booklet's own example discards one while flipping). High that they exist, low on values.
- Corner speed limits and corner positions of the two shipped tracks (original designs, not comparable).

## Fixed (W391, branch shelf/W391-rules-fixes)
- WRONG spin-out stress count -> fixed (1 stress card in gear 1-2, 2 in gear 3-4); test "spin-out-stress-count".
- WRONG spin-out keeps heat -> fixed (pays all engine heat to the discard); test "spin-out-pays-all-heat".
- WRONG adrenaline -> fixed (last car to move, last two with 5+ starting cars, also in 2-car races); tests "adrenaline-last-car-2-cars", "adrenaline-last-two-with-5-cars". The plan-screen preview now uses the same function.
- WRONG race ends when first car finishes -> fixed (race continues until every car has finished; finishers ranked in finishing order, same round by distance); tests "race-continues-until-all-finish", "finisher-skipped-in-resolve".
- MISSING too few playable cards -> fixed (play all, fill with heat from hand, no move, gear 1); test "stall-short-hand-no-move".
- MISSING optional discard step -> engine function discardOptional(G, seat, idxs) added and tested ("optional-discard-before-draw", "discard-refuses-heat-stress"); NOT wired into the UI (UI layout is not in this task) and the AI does not use it.
- MISSING slipstream/corners past the finish line -> fixed; test "no-slipstream-past-finish-line".
- MISSING starting upgrade cards: left, the booklet text gives no values (unverified).
- SIMPLIFIED lines (unlimited stress reserve, no starting upgrades, cooldown at shift time) added to the rules drawer.

## Fixed (W424, branch shelf/W424-redline)
- MISSING starting upgrade cards -> built with HOUSE VALUES (Brake 0, Burst 5, +1 heat card; the booklet gives no numbers); setup "Starting upgrades" On by default, off in the coached race. Tests "starting-upgrades-in-deck", "starting-upgrade-values-play", "stress-flip-skips-starting-upgrade".
- SIMPLIFIED cooldown at shift time -> cooldown now runs in the React step after the cards are played. Test "cooldown-in-react-step-after-play".
- Weather module (own design, house rules) and a 3-track championship (house points) added. Full list: games-src/redline-rally/RULES-COVERAGE.md.
- Still SIMPLIFIED: unlimited stress/heat reserve (listed in Help).
