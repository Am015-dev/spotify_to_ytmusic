# Wildmark tutorial coverage (guided first game, W507)

The tutorial is a **guided first game**: a real 7-turn game against Bram (rival level `novice`: random pairs). Every step is one sentence
of at most 12 words from Rowan plus ONE highlighted tap; any other tap is refused. The market is stacked each turn (`tutFix`) so every
core rule comes up in order. The result screen adds up the score; its main button, **Play a real game**, starts a 20-turn game.
No "learn later" list: every rule below is taught during the game.

Steps: `tutSteps()` in `src/tutor.js`. Rule ids: `COACH_RULES`. Proof: `node tutorial-end.js [shots dir]` walks it by touch at 390x844 and
375x667 and checks: exactly one highlighted target per step and nothing covers it, each sentence <= 12 words, a wrong tap is refused,
all 22 rules taught in this order, walk-through shown, tutorial marked done, the main button starts a real 20-turn game.

| # | Rule (id) | Turn | Rowan says | Tap |
|---|---|---|---|---|
| 1 | goal | 1 | Beat Bram: score more points in your valley than he does. | Next |
| 2 | pick | 1 | Each turn take a tile and the animal below it. | market column 1 |
| 3 | place | 1 | Your tile must touch your valley. Tap the glowing spot. | spot, then Place |
| 4 | settle | 1 | Animals live only on tiles that show them. Tap your bear tile. | new tile |
| 5 | keystone | 1 | Gold keystone tile: an animal on it earns you an acorn. | Next |
| 6 | rival | 1 | Now Bram plays: he takes, places and settles like you. | Next |
| 7 | bear | 2 | Bears score in pairs of two. Take the second bear. | column 2, spot |
| 8 | rotate | 2 | Two-land tiles turn. Tap Turn so forest meets forest. | Turn, Place, settle |
| 9 | habitat | 2 | Touching same land joins up: 1 point per joined tile. | Next |
| 10 | sweep3 | 3 | Three alike? Once per turn you may sweep them, free. | Sweep 3 |
| 11 | elk | 3 | Elk score in straight lines. Take the elk. | column 4, spot, Place, settle |
| 12 | acornSpend | 4 | You have an acorn. Tap Use acorn. | Use acorn |
| 13 | acornReplace | 4 | Free pick takes any tile and any animal. Tap it. (the menu also shows Replace animals) | Free pick |
| 14 | salmon | 4 | Salmon score in runs. Tap the river tile. | tile 1, salmon 3, spot, Place, settle |
| 15 | wipe4 | 5 | Four alike! The market swaps them by itself. | Next |
| 16 | hawk | 5 | Hawks score alone, touching no other hawk. Take the hawk. | column 3, spot, Place, settle |
| 17 | fox | 6 | A fox scores 1 per different animal beside it. | column 2, spot, Place, settle |
| 18 | majority | 7 | Biggest land of a kind beats Bram: plus 2 points. | Next |
| 19 | return | 7 | No good spot? Return the animal to the bag. | Return token |
| 20 | end20 | 7 | Real games last 20 turns each, then everything scores. | Next |
| 21 | acornsEnd | 7 | Every acorn you still hold is worth 1 point. | Next |
| 22 | tiebreak | 7 | Tied on points? More acorns wins. | Next |

Not in the tutorial: solo-mode market discard (help drawer, "Solo"); card sets B-D (help drawer, mixed cards). Shots: playable-shots/gameplay/tut-*.png.
