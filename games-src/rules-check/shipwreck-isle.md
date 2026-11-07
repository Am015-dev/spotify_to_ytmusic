# shipwreck-isle: rules check

Adapts: a cooperative survival game for one to four castaways on a hex island: six-phase rounds (event, morale, production, action with pawn planning and dice, weather, night), four scenarios implemented of seven.

Sources checked
- Publisher rulebook (EN) PDF from cdn.1j1ju.com, text extracted locally and read for: component list, setup steps 1-20, all six phases, action resolution order, dice description, weather rules, night phase, unfulfilled-demand rule, camp moving, easier/harder/solo variants, character skill texts, pawn colours.
- Search results for the comprehensive FAQ/errata (listed, not opened).
- Project notes: games-src/rc/rules-notes.md. Engine read only where needed: phases.js (event, morale, weather, night), engine.js newGame, data.js, data-gen.js.

Counts: WRONG 1 (med), MISSING 0, SIMPLIFIED 5

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| WRONG (confidence med; documented as an edition choice) | data.js:27 (Soldier skills) | Fortify costs 2 determination | In the rulebook read, the skill that raises palisade or weapon by 1 costs 3; Tracking 2, +3 weapon skill 3, Defence plan 4. The other three Soldier costs match. rules-notes.md says a later printing uses 2, which could not be checked |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md "not included yet" | Scenarios 4 (lava map), 5 (village fights) and 7 (bonus sheet) are not offered | Missing content, documented |
| SIMPLIFIED-ON-PURPOSE | engine.js:44 G.ev.threat=[null,'crates'] | The starting wreckage is always the food crates | The rulebook offers a random-wreckage variant at setup; not offered |
| SIMPLIFIED-ON-PURPOSE | engine.js newGame keys / DEFCHARS | Character choice is free; the draw-only-from-three rule for 2 players and solo (no Soldier) is not enforced by the engine | Rulebook: with 2 players, and in solo, characters come from Carpenter, Cook, Explorer only. Free choice is likely a design option (not checked in the setup screen) |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md "Interpretations" | Several readings chosen where sources disagree: build wound die 4 faces of 6, rain die starting round 4 in Marooned, discarded inventions taken from the top | Documented. The round-4 start matches the rulebook's own example |
| SIMPLIFIED-ON-PURPOSE | phases.js FN.night camp-move / rules-notes | Healing and camp move offered as optional prompts in a fixed order; skills used from the Camp tab | Interface choice, rules timing unchanged |

## Verified correct (against the rulebook text)
- Round order event, morale, production, action, weather, night; no event card in round 1 (FN.event returns when round is 1).
- Event handling: icon effect, event effect, card slides into the rightmost threat slot, a card pushed off the left slot fires its threat effect; adventure or mystery cards shuffled in resolve their event half and another card is drawn (drawEvent, placeThreat).
- Event deck build: half the scenario rounds (rounded up) from each of the book and adventure piles; easier = 2 fewer book cards (4 and 8 of 12), harder = 2 more; 2 starting items standard, 1 harder, more easier (newGame:41-47).
- Morale: first player discards or gains determination by level, top level chooses 2 determination or heal 1, shortfall is wounds; solo gets morale +1 first (FN.morale).
- Action resolution order: threat, hunting, building, gathering, exploring, scenario actions, arranging camp, rest. Gains arrive after all actions (Future Resources). Arranging the camp: 2 determination and morale +1 (either-or with four players); resting heals 1.
- Action dice: failing the success die gives 2 determination; wound, success and adventure dice are independent; rerolls once per skill (afterRoll). Skill costs and reroll colours match for Carpenter (2/2/3/3), Cook (2/2/3/3, gather die), Explorer (2/2/3/3, explore die).
- Gather/explore range: adjacent or one tile between, the latter needs +1 pawn; Shelter, Roof, Palisade cost depends on player count and may be paid in wood or in furs but not mixed (SRP_COST, solo uses the 2-player cost).
- Weather: scenario dice by round (rounds 4-6 rain die, 7-12 all three for Marooned); winter clouds cost 1 wood each regardless of roof; clouds beyond the roof level each cost 1 food and 1 wood; hungry-animals results (discard food, palisade -1, fight strength 3); storm applied last (weather2).
- Night: 1 food per castaway, a hungry castaway takes 2 wounds (players choose who); 1 wound each without shelter; food rots unless protected; camp move halves roof and palisade (round down) with a built shelter, drops both to 0 without; unfulfilled demand costs wounds (engine ops, rules-notes).
- Friday does not eat and is unaffected by discard/wound effects; Dog is a support pawn for hunting or exploring.

## Not verified
- The face counts of the nine action and weather dice (DICE table, data-gen.js:4). The rulebook text does not list faces and no source reached did. Confidence low. Build wound die has 4 wound faces of 6 here; the notes say sources disagree between 2 and 4.
- Character life tracks and morale-arrow positions (data.js:19-44: Carpenter 13, Cook 14, Explorer 12, Soldier 12, Friday 4). Card faces not reachable.
- Counts and effects of the 73 event, 90 adventure, 52 mystery, 16 beast, 22 discovery and 30 invention cards. Only plausibility-checked (build costs, beast strengths 1-6); a full card-by-card comparison was not possible without the card images. Confidence low.
- Island tile table (data-gen.js:3): terrain, sources, discovery counts, which tiles hold a shelter or totem. Confidence low.
- Scenarios 1, 2, 3 and 6 goals and special rules were not compared with the scenario sheets beyond the rulebook's scenario-1 weather example (matches).
- Build cost table values for 2/3/4 players (2 wood or 1 fur, 3 or 2, 4 or 3): the 3-player value is confirmed by a rulebook example; 2 and 4 players unconfirmed. Confidence med.
