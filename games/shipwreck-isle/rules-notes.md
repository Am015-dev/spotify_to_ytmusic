# Shipwreck Isle: rules notes

Shipwreck Isle is a single-file browser adaptation of the co-operative survival board game *Robinson Crusoe: Adventures on the Cursed Island* (Portal Games, 2012; BGG 121921).

- The rules, numbers and card effects follow the base game.
- Every name, all card text and all art are original.
- The card text you see in the game is generated from each card's effect data, so it always matches what the engine does.

## What is included

| Part | Count | Notes |
|---|---|---|
| Event cards | 73 physical (72 designs) + 3 wreckage | 39 with a book icon, 34 with an adventure icon. Each has an event half, a threat action and a threat effect. |
| Adventure cards | 90 (30 build, 30 gather, 30 explore) | Includes the "decide" cards and the cards whose second half is shuffled into the event deck. |
| Mystery cards | 52 (25 treasure, 14 trap, 13 creature) | Kept cards, stop-drawing cards and event halves are all handled. |
| Beasts | 16 | Strength, weapon loss, food, fur and special text. |
| Island tiles | 11 | Terrain, sources, beast and totem icons, discovery count, natural shelter. |
| Inventions | 30 | 9 starting, 17 normal, 4 personal. Plus 8 scenario items. |
| Starting items | 8 | Shared, 2 uses each. |
| Discovery tokens | 22 | Plus 4 scenario finds for each scenario. |
| Dice | 12 | Wound, success and adventure dice for build, gather and explore, plus rain, winter and hungry animals. |
| Characters | 4 + Friday + dog | Carpenter, Cook, Explorer, Soldier: life tracks, morale arrows, 4 skills each and personal inventions. |

The in-game **Cards** button lists every card, token, tile and scenario, with search. The Game Night Shelf reference page lists them too.

## Scenarios

These four are implemented, with the numbers from their sheets:

| Scenario | Based on | What it needs |
|---|---|---|
| 1 Marooned | Castaways | Fire plus a 15-wood signal pile, one stage per round, in rounds 10–12. |
| 2 The Hexed Isle | Cursed Island | Five crosses on different tiles. Fog from the book icon. The totems are a temple, an altar and hideouts. |
| 3 Stranded Friend | Jenny Needs Help | Build a Rescue Raft and row out to rescue Ada, then build the Lifeboat. Ada takes 2 wounds a night until she is rescued, then joins the camp and can only rest. |
| 6 Settlers | Family Robinson | Shelter, then roof, palisade and weapon at 1 or more, plus all 9 dealt inventions. Children arrive in rounds 7, 9 and 11. The book icon is bad crops. Totems are wasteland. The Reclaim action removes a black marker. |

These scenarios are not included yet:
- **4 (Volcano):** it needs its own map, with lava destroying spaces.
- **5 (Cannibals):** it needs village fights on tiles.
- **7:** it is a licensed-IP bonus sheet.

## Round flow (as implemented)

1. **Event** (from round 2). If an adventure or mystery card was shuffled in, resolve its event half and draw again. Otherwise:
   - apply the icon (book effect, or a "?" marker on build, gather or explore);
   - apply the event effect;
   - slide the card into the right threat slot. A card pushed off the left slot fires its threat effect.
2. **Morale.** The first player gains or loses determination (−3…+2; at +3, choose 2 determination or a heal). Each point that can't be paid is a wound. Solo gets morale +1 first. Diary and Drums add determination.
3. **Production** from the camp tile's unused sources, plus these extras:
   - Snare, Corral and Hatchet;
   - the Shortcut;
   - the Pit roll.
4. **Actions.** Plan every character pawn, then resolve in this order: threats, hunting, building, gathering, exploring, scenario actions, arranging the camp, resting.
   - **Pawns:** one fewer than a sure success rolls the dice.
   - **Distance:** gathering and exploring two tiles from camp need +1 pawn. Slow-work markers and fog add +1 pawn each.
   - **Timing:** gains arrive after all actions. Fallen Tree and Grubs are traded in at the end of the phase.
5. **Weather:**
   - roll the scenario's dice plus any cloud markers;
   - apply the item and card effects: Furnace, Blankets, Clothes, Big Leaves and Moonshine;
   - heating: 1 wood per snow cloud;
   - clouds above the roof ruin 1 food and 1 wood each;
   - hungry animals;
   - storm.

   Anything that can't be paid costs every castaway 1 wound per missing unit.
6. **Night:**
   - eat 1 food each; whoever doesn't eat takes 2 wounds, and the players choose who;
   - optional healing (Pot, Fireplace, Rum, Cask, Brandy, Wild Vegetables, Home Remedy);
   - optional camp move;
   - 1 wound each without shelter;
   - nights out in the wild;
   - fever and poison;
   - food spoils (not with the Cellar or Boxes);
   - the first player passes on.

## How the game tells the day

- **Story scenes:** the engine records a scene at every moment of the day: dawn, events, threats, morning, each action with its dice, adventures, mysteries, fights, weather and night.
  - The page plays them back one at a time, as journal pages over the island.
  - The island and the resource bar show that moment, not the end of the day. The camera flies to where it happens.
  - Choices appear inside the scene that caused them.
- **Story text:** every event, adventure, mystery, beast, scenario day and character has original journal text, in `flavor.js`. The rules text on each card is still generated from its effects.
- **Planning:**
  - *Today's priorities* names what matters now (food for tonight, shelter, weather, a threat about to strike, the next step toward the goal, a hurt castaway), with a one-tap *Do it*.
  - *Your plan* lists each job with its pawns and odds.
  - *Add a job* groups everything else into categories.
- **Tiles:** every tile has a label with its terrain, sources and camp. Reachable unexplored spaces are marked ❔.
- **First game:** four tips walk you through day 1.

## Interpretations where the sources disagree or are silent

These were researched from the 1st-edition English rulebook, card scans and fan implementations. The official FAQ and the 2nd-edition rulebook could not be downloaded.

- **Build wound die:** 4 wound faces out of 6. Two sources say 4 and one says 2.
- **Camp move with a built shelter:** roof and palisade are halved and **rounded down** (rulebook wording). Without a built shelter they drop to 0.
- **Gather and explore range:** up to 2 tiles from camp, with +1 pawn when 2 away (1st-edition limit).
- **Marooned weather:** the rain die starts in round 4 (scenario sheet). One fan app starts it in round 5.
- **"Discard invention cards":** taken from the top of the invention deck.
- **Wreckage:** "Food Crates" always starts on the right threat slot. The random-wreckage variant is not offered.
- **Soldier:** uses the 2nd-printing skill order and costs (Tracker 2, Fortify 2, Battle Rage 3, Drive the Game 4).
- **Hungry-animals fight (strength 3):** every castaway takes the shortfall, as the rulebook's unfulfilled-demand note says.
- **Settlers weather:** the "−N food" icons are read as discarding N food in the weather phase.
- **Stranded Friend:** a "?" on the rescue roll is a wound, not an adventure, as the raft card shows.
- **Skills:**
  - Rerolls, Battle Rage and Moonshine are offered when they apply.
  - The other skills are used from the Camp tab while planning.
  - Home Remedy can also be used at night.
- **Starting items:** usable while planning. The pistol is offered in fights, the rum at night and the prayer book when arranging the camp.

## Difficulty

These are the rulebook's own variants.

| Setting | Changes |
|---|---|
| Easier | Dog, 4 starting items, 2 fewer book events and 2 more adventure events |
| Standard | Base rules |
| Harder | 1 starting item, 2 more book events |

Friday and the dog can be toggled separately.

## Computer castaways

- **Planning:** a greedy planner builds candidate plans. A lookahead then plays each of 8 candidates through to the next dawn 4 times on reshuffled hidden decks and keeps the best. The same planner powers the 💡 Suggest button.
- **Choices:** handled by rules of thumb (boosts, rerolls, adventure decisions, fog placement, healing).
- **Strength:** the game is hard and the computer is weaker than a careful human.

Headless win rates for 2 castaways + Friday, 40 games each:

| Scenario | Standard | Easier |
|---|---|---|
| Marooned | 3% | 3% |
| Hexed Isle | 0% | 10% |
| Stranded Friend | 0% | 3% |
| Settlers | 0% | 0% |

Games usually run to round 6–9 before hunger and weather win. These numbers are well below the 30–50% target used for the other shelf games. Treat the computer as a helper, not a benchmark.

## Tests

| Test | What it does | Result |
|---|---|---|
| `gauntlet.js` | Headless AI games in every scenario | 0 errors, 0 invariant breaks |
| `force.js` | Forces every event, adventure and mystery card's effects in 12 game states | 2,520 runs, 0 failures |
| `rules-test.js` | 24 rule scenarios, including the rulebook's own weather example, hunger, spoilage, pawn needs, costs, threat slides, morale, camp moves, personal inventions, Friday, the signal pile, every scenario's win and loss, solo morale, hunting, save/load | 24 pass |
| `click.js` | A random clicker plays the real page in jsdom (2D map fallback), through the start screen, priorities, job categories, every story scene type and every choice | 0 errors in 6 games |
| `watch.js` | All-computer game with the story on auto-play, to the end | 0 errors |
| Playwright screenshots | Desktop and phone, including the 3D diorama with fog, crosses, pawns and camp | Checked visually |
