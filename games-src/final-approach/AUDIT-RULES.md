# Final Approach: independent rules audit

Scope: `game/src/engine.js` and `game/src/data.js` against the Landing Procedure booklet ("LP", `landing.txt`), the Flight Log ("FL", `rules.txt`), the Dized rules app pages (`dized/*.txt`, "DZ"), the Dized FAQ extract, and the files of an online implementation ("OI": its PHP sources and data JSON) plus the fan write-ups that rely on it. The frozen build (`scratchpad/freeze/final-approach.html`) carries the engine unchanged: all 174 long engine lines are present verbatim, and all 21 track lines of data.js are present. No repo file was edited. Reproductions are in the scratchpad (`audit/repro.js`, `cmp.js`, `cmp2.js`, `ice.js`) and the key snippets are quoted below. The existing `rules-test.js` still passes 63/63 on this tree.

Source quality note. The booklets give rules in words, but the strips (planes, traffic icons, tabs), the altitude track, the wind table, the ice track layout and the scenario module/ability icons are pictures. Per-space strip numbers exist in machine-readable form only in the online implementation, and the other fan data (a fan track table) derives from it. So "matches the sources" for strips means "matches OI", with the caveats in section 3.

## 1. Findings table

Legend: WRONG = engine differs from a rule; MISSING = rule not implemented/validated; UNCLEAR = sources silent or ambiguous, engine choice stated; FINE = checked, correct.

| # | Class | Area | Source | What the engine does | Reproduction | Proposed fix |
|---|---|---|---|---|---|---|
| 1 | WRONG (minor) | Reroll token timing | LP p4 (REROLL), DZ reroll: "at any time during the round, any player may spend a token" | `validMoves` offers `rr` only to the seat whose turn it is and who still holds an unplaced die. The partner cannot spend it before their own turn, and a player who has placed all four dice cannot spend it even though the partner still has dice to reroll. | `T.round('g1',2,[3,3,3,3],[3,3,3,3])`: seat 1 has no `rr` while seat 0 is to place (false). `T.round('g1',2,[3],[3,3,3,3]); T.put(G,0,3,'co0')`: pilot has 0 dice, token in hand 1, `rr` offered to pilot = false. | Offer `rr` to either seat any time in phase `place` when no pending question is open, as long as at least one seat has an unplaced die. Keep the simultaneous mask question. Also decide whether "reroll one or more" forbids an all-empty choice by both (engine allows both to pick nothing and burn the token; harmless). |
| 2 | MISSING (low) | Ability card selection | FL p2 (select the number of cards the scenario shows) | `newGame` copies up to 2 ids from `o.abil` unchecked: cards on a 0-card scenario, 2 cards on a 1-card scenario, unknown ids. The UI clamps (`ui3.js` line 7 slices to `sc.ab`), so only a forged online setup or a test harness gets there. | `T.game('g1',1,{abil:['antic','adapt']}).abil` returns both; `T.game('y3',1,{abil:['antic','adapt']})` returns both (y3 allows 1); `{abil:['bogus','bogus']}` is kept. | In `newGame`: filter to `Object.keys(D.abilities)`, de-duplicate, `slice(0, sc.ab)`. Same clamp in the net host path. |
| 3 | WRONG (rare edge) | Trainee token that cannot be placed | DZ module-intern (token is placed on any space where a die could go); fan RL-5 says an unplaced token goes back to the front of the board | When a trained token has no legal space the engine offers `toss d:'p'`; the token was already shifted out of `G.intern`, so it counts as trained without ever being used. Needs every legal space taken, so extremely rare. | Fill all pilot-legal spaces except `in0`, train with a 1: pend `{intern, val 6}`, only move `toss`, after it `G.intern` is `[5,4,3,2,1]` and `internUsed=1`. | On toss of an intern token, push the token back to the end it came from and decrement `internUsed`, and do not consume the training die turn twice (or forbid training when no space can take the token). |
| 4 | UNCLEAR | Intern token placed in the same turn | DZ: "you can then place that token"; OI moves to a place-token state at once (`ST_PLACE_INTERN`); fan RL-5 says "this round" | Immediate, as an extra action before the turn passes. | Covered by `rules-test` trainee test. | Keep (see guessed item 1). |
| 5 | UNCLEAR | Intern token on a trainee space | DZ: "any space you'd normally be able to place a die" | `fits(...,'tok')` refuses the trainee spaces. A token on your own free trainee space would train a second token. | `FA.fits(G,0,'in0',1,'tok')` is false. | Rare; keep and document (OI also refuses by moving to the intern state only from a die). |
| 6 | UNCLEAR | Speed vs brake: "less than" or "at most" | LP p10-11, DZ final-round: speed "less than" the marker, with the marker standing between numbers (after the 2nd brake it sits between 4 and 5) and the example "speed 3, brakes 2 and 4" | Speed <= brake value passes, brake value must be >= 2 (0 is the marker left of the 2). Ice track: marker past the 5 means speed <= 5. OI and the fan rulings agree (RL-2). | `speed 4 == brake 4` lands (win true, why landed). | Fine. Reading the marker as sitting between two numbers makes "less than the marker" equal "<= the number it passed". |
| 7 | FINE | Last-round check is made when the second engine die goes down | LP p11 (D): speed is compared "when you placed your Engine dice"; DZ same; OI throws the move | Immediate loss if speed > brake (or brake < 2) at that moment; brakes placed later cannot rescue it. Tested by `rules-test` and by the repro below. | speed 5 against brake 2: result `speed`. | None. |
| 8 | FINE | Roles, 4+4 dice, screens, alternating turns, first player per row, no dice left means the other continues, talk only before the roll | LP p4 | All as written; first player alternates pilot-first on rows 6000,4000,2000,0 (matches OI altitude data, both sides). | `rules-test` turns/altitude. | None. Presets are an app addition (guessed item 6). |
| 9 | FINE | Axis | LP p5 | Tilt toward the higher die by the difference, cumulative, equal dice no change, +-3 loss at once, landing needs level axis. | rules-test axis x4. | None. |
| 10 | FINE | Engines and markers | LP p6-8 | Blue 4, orange 8; <= blue 0, <= orange 1, above 2; each gear +1 blue (max 7), each flap +1 orange (max 12); second die triggers it. | rules-test engines x2. | None. |
| 11 | FINE | Advance: collision, overshoot, holding, crash short | LP p6, p10 | Per step: tab check on the space left, then planes on the space left, then move; past the airport = overshoot; at the airport before the last row any advance loses; arriving at the last row short of the airport loses. The pass-through space is checked for collision (stated in the rulebook only for tabs; OI and the fan rulings check it for collision too, RL-10). | rules-test approach x4, tabs x2. | None. Note the collision-on-pass-through is a OI/fan reading, not printed text. |
| 12 | FINE | Radio | LP p7 | Pilot 1 space, co-pilot 2, count from the plane with 1 = its own space, no effect when empty. | rules-test radio x2. | None. |
| 13 | FINE | Gear, flaps, brakes | LP p7-9; OI material | Gear 1-2/3-4/5-6 any order; flaps 1-2/2-3/4-5/5-6 in order; brakes exactly 2/4/6 in order; re-using a green switch is legal and does nothing (LP p7). Switch count 3+4+3 = 10 matches the sticker count. | rules-test values, flaps, gear, brakes. | None. (OI's UI hides green spaces, but the printed text says legal.) |
| 14 | FINE | Concentration and coffee | LP p8 | +-1 per token, any number of tokens, no wrap, max 3 held, either player may spend, carries over. | rules-test coffee x3. | None. With 3 held, placing a die on Concentration is allowed and wasted: sources silent (OI refuses the move). |
| 15 | FINE | Mandatory dice, end-of-round order, 7 rounds, crash, landing A-D | LP p5, p9-11 | As written. Altitude moves after the check; arrival rule as in LP p10. | rules-test end of round, final round x3. | None. |
| 16 | FINE | Modules: traffic die | FL p3, DZ | Roll once per icon on the space you stand on at round start; plane at pos + v - 1 clamped to the airport; none for pass-through spaces; no plane left adds nothing; faces 2,3,3,4,4,5; 12-token supply. | rules-test traffic x2. | None. |
| 17 | FINE | Modules: turns (tabs) | FL p3, DZ | Checked on every space left when advancing (both spaces of a 2-step), not for 0. | rules-test tabs x2. | None. |
| 18 | FINE | Modules: kerosene | FL p3, DZ | 20, fuel space burns the die value, -6 if unused, loss below 0. OI: loss at `< 0`, and in the final round an unused fuel space only passes when 6+ is left. Engine's endRound order gives the same result. | rules-test fuel. | None. The printed "skull space" is the first space below 0 (OI); not visible in text. |
| 19 | FINE | Modules: kerosene leak | FL p4, DZ | Fuel space blocked; burn |difference| + 1 when the second engine die lands, also in the last round. | rules-test leak. | None. |
| 20 | FINE | Modules: wind | FL p4, DZ | Dial starts at the +3 centre, turns by the current axis position after every axis resolution (even level-but-tilted), modifier added every round including the last. The 20-position table in data.js is identical, position for position, to OI `Plane.php` (checked all 20). | rules-test wind x3. | None. |
| 21 | FINE | Modules: icy runway | FL p4, DZ module-ice-breaks, OI material | Four columns 2/3/4/5; upper space pilot-only, lower space either colour (OI); only the next column is open; both halves in the same round; a lone die is wasted; several columns per round allowed; marker 0,2,3,4,5; all four needed to land; speed <= marker. | `T.game('y4',3)` pilot [2,2,3,3] co-pilot [2,3,3,3]: col 1 done, brake 2, col 2 done in the same round, brake 3. | None. See section 4: the ice failures are not a rules bug. |
| 22 | FINE | Modules: real time | FL p4 | Timer after the roll; at expiry unplaced dice are ignored; missing axis/engine die loses. | rules-test clock. | None. |
| 23 | FINE | Abilities: antic, adapt, mastery, control, sync, hand-over | DZ ability pages, FL p2 | See section 5; texts and per-round/per-game limits match DZ and OI (OI resets the sync flag every round, line 122 of StateTrait). | rules-test ability tests x6. | None apart from #1 (hand-over and flip are also only usable on your own turn, whereas DZ says "at any time"). |
| 24 | UNCLEAR | Hand-over / flip side only on own turn | DZ working-together: "at any time" | Offered only to the seat on turn. | `validMoves` for the other seat has no `wt`/`adapt`. | Optional: allow either seat while no pend is open (same fix as #1). |
| 25 | UNCLEAR | Die with no legal place | not in LP/FL/DZ; fan RL-4 | A die may be put aside only when no placement exists even with every coffee option. | rules-test "no legal place". | Keep; flag as house ruling. |
| 26 | MISSING (data, unverifiable) | Strip data is single-source | see section 3 | Matches OI exactly. | `cmp.js`: 0 differences over 21 strips. | See section 3. |

## 2. The core controls, one line each

Axis: FINE (item 9). Engines, aerodynamics markers, approach advance: FINE (10, 11). Radio: FINE (12). Gear/flaps/brakes: FINE (13). Concentration and coffee (+-1 per token, max 3, no wrap): FINE (14). Reroll on the altitude track: row tokens and rb/gy sides FINE (see section 3), spending rule WRONG (item 1). Loss conditions: spin, missing mandatory die, collision, overshoot, tab, fuel below 0, last row short of the airport, last-round speed above brake or brake below 2, time-out, plus the landing checks A to D (+ trainee, + ice): all present and tested. Exact landing conditions including last-round speed vs brakes: FINE (items 6, 7, 15).

## 3. All 21 scenarios and 11 airports

Method: `cmp.js` loads data.js, the OI data JSON and a fan-made track table and compares every one of the 21 strips space by space (planes, traffic icons, permitted axis positions, size): 0 differences against both. `cmp2.js` maps each scenario to its OI scenario and compares modules, ability count and altitude side, and separately checks the module/ability icons of DZ's four scenario pages. Result for all 21 (g1-g6, y1-y7, r1-r5, b1-b3): modules OK, ability count OK, altitude side OK, "tabs on strip" and "traffic on strip" OK. Dized agrees on airport, colour, modules and ability count for every one (icon identity `96f254f2` = 1 card, `a1bdc5f7` = 2 cards, consistent with the "2" star on the FL p6 PRG card).

| id | band | airport (real) | strip | modules (DZ = OI = engine) | cards | planes at start |
|---|---|---|---|---|---|---|
| g1 | green | YUL | pad-g | none | 0 | 9 |
| g2 | green | LHR | fox-g | none | 0 | 8 |
| g3 | green | HND | sea-g | none | 0 | 8 |
| g4 | green | OSL | orr-g | fuel | 0 | 4 |
| g5 | green | ATL | gcx-g | trainee | 0 | 6 |
| g6 | green | PRG | cas-g | fuel | 2 | 5 |
| y1 | yellow | LHR | fox-y | trainee | 0 | 8 |
| y2 | yellow | TGU | bwr-y | fuel | 2 | 4 |
| y3 | yellow | GIG | plm-y | wind | 1 | 9 |
| y4 | yellow | KEF | frm-y | ice | 1 | 3 |
| y5 | yellow | PRG | cas-y | leak | 2 | 12 |
| y6 | yellow | KUL | tws-y | fuel | 1 | 5 |
| y7 | yellow | ATL | gcx-y | leak | 1 | 10 |
| r1 | red | PBH | cls-r | fuel + clock | 2 | 5 |
| r2 | red | HND | sea-r | fuel + trainee | 1 | 8 |
| r3 | red | GIG | plm-r | wind + leak | 2 | 9 |
| r4 | red | OSL | orr-r | leak + ice | 2 | 3 |
| r5 | red | TGU | bwr-r | fuel + wind | 2 | 5 |
| b1 | black | KEF | frm-b | wind + ice | 2 | 4 |
| b2 | black | KUL | tws-b | fuel + clock | 2 | 5 |
| b3 | black | PBH | cls-b | fuel + clock | 2 | 5 |

Altitude tracks: green/yellow = 6000 (pilot first, reroll), 5000 (co), 4000, 3000, 2000 (pilot, reroll), 1000, 0; red/black identical but no reroll on 2000. Identical to OI altitude types 1 and 2 (all rows). Reroll token total 3: DZ Contents lists 2 in the basic set and 1 more with the advanced modules, which is where mastery's third token comes from. FINE.

Caveats for the strips, and for guessed item 8:
1. The base-box strips are verified against OI only. The "two printed strips compared" claim in `sources.md` and `rules-notes.md` refers to BLQ green/red from the print-and-play sheet; BLQ is not one of the 21 box strips (the print-and-play set is BLQ, BUD, NZIR, TER, CDG, DUS, LGA). So no box strip has been compared to print. The Montreal strip is shown only as a tiny thumbnail in LP p3.
2. Consistency checks that can be made from text: the Atlanta example (FL p3: still on space 1, a die roll, and "a second icon") needs at least 2 icons on ATL space 1; data has 4 on ATL green and 1 on ATL yellow, so the example matches only green (a 4-icon start is plausible, but the example does not prove it). Plane totals are <= 12 everywhere; y5 uses all 12, so no traffic die can add a plane there (consistent with the "none left, add nothing" rule, but worth an eyeball against the real strip).
3. Recommended: have a person with the box (or a photo of the 20 strip sides) confirm the 21 strips once. The data file is otherwise internally consistent and matches two independent derived datasets.

## 4. The eight modules and six ability cards

Modules (all match, details in table rows 16-22): busy sky/traffic die, tight corridor/tabs, fuel, fuel leak, tail wind, trainee, icy runway, real time. Which scenarios use which: see the section 3 table (verified against DZ pages and OI). Official count of modules in the box: kerosene, intern, wind, ice brakes, real-time, kerosene leak, plus the two approach-track effects (traffic, turns) = 8, matching the engine's eight.

Ability cards, exact effects (DZ pages):
- Anticipation (engine `antic`): first player may reroll one of their dice before their first placement, each round. FINE.
- Adaptation (`adapt`): once per game per player, turn one unplaced die to the opposite face. FINE.
- Mastery (`mastery`): two equal engine dice give a reroll token, only if one is not on the altitude track or in the supply. Engine uses `3 - hand - tokens still on the track`. FINE.
- Control (`control`): two equal axis dice give a coffee token. FINE (limited to 3 held).
- Synchronisation (`sync`): once a gear die and a flap die are down, roll the traffic die; co-pilot places it on any empty space of either colour as an extra action. Once per round (OI resets per round); coffee allowed (normal die rule). FINE.
- Working Together (`together`): once per round, one die each, swap values, take back. FINE (own turn only, see #24).
Scenario card counts are 0/1/2 as in section 3.

The builder says the icy-runway scenarios fail because "the ice track isn't finished". That is not a rules bug:
1. The engine's ice rules equal DZ and OI in every detail (layout, pilot-only upper row, same-round pair, next column only, several per round, marker values, speed <= marker, all four needed). The scripted repro (row 21) shows two columns completing in one round and the marker following.
2. The requirement is really that hard. Eight dice with exact values 2,2,3,3,4,4,5,5 have to land in order, in pairs, in the same round, with the first of each pair on a pilot space. Per round, the chance that the dice hold both dice for a given column is only about 0.33 with no coffee (repro A8: 0.336, 0.344, 0.308, 0.328 for columns 2..5). A greedy simulation (`ice.js`) in which each seat keeps two dice for axis and engines gives about 28% for finishing all four columns in seven rounds, before gear, flaps, radio, fuel and the axis are paid for. y4, r4 and b1 are rated yellow, red and black in the booklet, so a human crew is also expected to lose them most of the time.
3. So the 0% rows for y4, r4, b1 in TEST-RESULTS (and the 0% rows for fuel scenarios) are a computer-crew strength problem plus designed difficulty, not an engine fault. The truthful reading is in the engine report: failure reason "ice track not finished" is simply the last unmet landing check. If a fairer test is wanted, put a scripted/perfect-information solver on y4 (3 planes, 1 ability card, no fuel) and measure the win rate.

## 5. The eight "guessed" items of rules-notes.md

| # | Builder's ruling | Verdict | Correct ruling and source |
|---|---|---|---|
| 1 | Trainee token placed in the same turn | Right | DZ module-intern: train on your turn "then" place the token; OI jumps straight to its place-token state. Fan RL-5 ("this round, any later turn") is a looser reading and differs from OI code. Engine fine; edge case #3 above is the only defect. |
| 2 | A die with no legal place may be put aside | Unclear, reasonable | LP/FL/DZ are silent. Fan RL-4: allowed only when no placement exists even with coffee, which is exactly the engine. Mark it as a house rule. |
| 3 | Reroll only on your own turn before you place | Wrong (too strict) | LP p4 and DZ reroll: any player may spend the token at any time during the round. Fix as in finding 1. The one thing that cannot be done is to spend it during the briefing (dice are rolled after it). |
| 4 | Cross-check once per round when the second of (gear, flap) goes down; coffee allowed | Right | DZ synchronisation and FAQ (co-pilot places the die); OI resets the "activated" flag each round; coffee applies to "any time you place a die" (LP p8). |
| 5 | Hand-over: one die each, values swap, both learn the values | Right | DZ working-together: each places one die on the card, swap the values, take them back; the dice sit on the card in view of both. Only the "own turn only" limit is stricter than "at any time". |
| 6 | Briefing presets are an app invention | Right (not a rules item) | LP p4 allows free strategy talk before the roll but never about dice; the preset set contains no dice information (checked: `adv0..2, plane, level, gear, flaps, brakes, coffee, slow, fuel, trainee, first, ok`). |
| 7 | Clock pauses on pass-the-device screens and while the computer plays | Right (app-level) | FL p4: 60 seconds from the roll, no pauses in the physical game; pausing for UI artefacts is a fair adaptation. |
| 8 | Strip data transcribed by someone else; a typo would change a scenario | Answerable and checked | 21 of 21 strips equal OI and the fan track table (0 differences). Not verified against the printed strips, see section 3 caveat 1: the notes overstate this ("two printed strips matched"; those are not box strips). |

## 6. Summary

The engine is faithful. All 21 scenarios (modules, ability counts, altitude side, 21 strips space by space) agree with the Dized pages and the OI data, and every control rule I checked matches the booklets: axis, engines and markers, advance order (tab, collision, step), overshoot, holding pattern, crash short of the runway, radio, gear/flaps/brakes, coffee, reroll rows and the landing conditions including the "speed when the engine dice are placed" rule.

Real defects, all small:
1. Reroll tokens can be spent only by the player on turn who still holds a die; the rules say any player, any time (finding 1; repro under A2).
2. `newGame` does not validate ability cards against the scenario count or the card list (finding 2; UI protects the normal path).
3. A trainee token with nowhere to go is thrown away and counted as trained (finding 3; practically unreachable).
4. Hand-over and flip side are own-turn only, a slight tightening of "at any time" (finding 24).

Not a bug: the icy-runway scenarios failing on "ice track not finished". The rules are implemented as printed; the task needs exact dice in exact pairs and is hard by design (about 28% for the ice task alone with ideal-ish dice use, before everything else). The fuel scenarios share the same cause (designed tightness plus a weak computer crew).

Open data risk: the base-box strips were never compared with printed strips; the "two printed strips" cross-check in the notes used promo strips (BLQ), not box strips. A person with the box should spot-check at least ATL green (4 icons on space 1), PRG yellow (12 planes) and the tab positions on KUL/TGU black.
