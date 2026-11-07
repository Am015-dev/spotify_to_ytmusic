# Emberclimb guided climb: rule coverage

The tutorial is one real short climb (7 rooms, Warrior, fixed seed 7, staged hands) from setup to the result screen, against the real enemy AI.
4 chapters; leaving saves the chapter and the next launch starts there (`emberclimb.tutch`). Source: `src/tutor.js`; proof: `node tools/tut-end.js`
(plays every step at 390x763 and 1440x860 and fails if any step id below was not shown).

Each chapter opens with a story beat (steps intro1-intro4: the fading ember, the Gatekeeper's sentries, the quiet floors, the gate) and ends with Ashgrove's payoff line. Chapters: 1 Your first fight · 2 Map, treasure, potions and a harder fight · 3 Campfire, shop, event · 4 Boss and the end.

| Rule | Taught by (step id) | How | Story beat |
|---|---|---|---|
| [x] Setup: one hero, HP, 10-card starting deck, starting relic and gold | setup | seen (hero panel, top bar) | "I am Ashgrove, keeper of this tower..." |
| [x] Lose: a hero at 0 HP ends the climb | setup | told | "I am Ashgrove, keeper of this tower..." |
| [x] Enemy intent shows its next move | intent | seen | "A Gnawer blocks the stair..." |
| [x] Draw 5 cards, 3 energy a turn, card cost | energy | seen | - |
| [x] Two taps to play a card; targeted attack | attack | done | "Crack its hide open" -> "Hear that crack? Vulnerable." |
| [x] Vulnerable (target takes more damage) | attack, finish | done | "Crack its hide open" -> "Hear that crack? Vulnerable." |
| [x] Block soaks damage, gone at your next turn | block, enemyturn | done + seen | "That bite is coming" -> "Shield up." |
| [x] End turn; unplayed cards go to the used pile | end | done | "Now we watch." |
| [x] Enemy turn, step by step | enemyturn | seen | - |
| [x] Draw / used piles, reshuffle when the draw pile runs out | piles | seen | - |
| [x] Card reward after a win, gold | reward | done | - |
| [x] Map: glowing rooms are the next step; room types | map, map2, campfire, shopnode, event, boss | done | - |
| [x] Treasure room gives a relic (lasting bonus) | relic | done | "Relics choose their bearers." |
| [x] Enemy adds junk cards (Dazed: unplayable) | junkintent, junk | seen | "His sentries fight dirty." |
| [x] Potions: free, one use, max 3 slots | potion | done | "Poison is in its gears now." |
| [x] Poison: loses HP at end of your turn, ignores Block | poison, end2 | done + seen | - |
| [x] Power cards last the whole fight; Strength adds damage | power | done | "Feel that fire in your arms?" |
| [x] Weak (hits softer); Exhaust (card gone for this fight) | exhaust | done | "It flinched." |
| [x] Die cards: roll 1-6, low / middle / high result | die | done | "Fortune favours the bold." |
| [x] Free play of a whole fight | win2, win3 | done | - |
| [x] Skipping a card reward keeps the deck lean | skip | done | "Weight slows a climber." |
| [x] Campfire: rest heals, or smith upgrades a card | rest | done (rest) + told (smith) | "Breathe." |
| [x] Shop: buy with gold; card removal | shopitem, buy, shopleave | done (buy) + told (removal) | - |
| [x] ? rooms are events with a choice | event, choose, evleave | done | - |
| [x] Boss at the top; bosses repeat a pattern; Spikes | boss, spikes, win3 | done | - |
| [x] Boss treasure: choose 1 of 3 relics (1 per hero + 1) | bossrelic | done | - |
| [x] Win: beat the boss, result screen | leave4, result | done + seen | climax: floors and gold count up, "The gate stays open. The ember lives." |
| [x] Other heroes' mechanics (poison and Shivs, orbs, stances) | heroes | told only; each Story chapter's first fight teaches its hero | - |

Not covered by doing (honest): Smith upgrade and card removal are told, not done; elite rooms are not visited; duo play (2 heroes) and the
Rogue / Automaton / Monk mechanics are only named. Rules changed by the tabletop rules fix (Retain, Scry, Miracle, shared enemy die) are not in the
Warrior guide; see the help drawer.
