# Lively world: LEGO 2K Drive vs Mainhattan Overdrive (v88n, 2026-10-08)

Alex: "in general we need to make the game more lively, it's quite boring and repetitive, check how 2K Drive looks and make it more lively".
Older research (biomes, HUD, reference images): `LEGO2K_RESEARCH.md`. This file covers only what makes the world feel alive.
Some quotes come from WebFetch summaries; they are marked (summary) and still need checking against the page.

## Sources
- L1 https://2k.com/games/lego-2k-drive/features/biomes/ (official, fetched)
- L2 https://2k.com/games/lego-2k-drive/features/driving-techniques/ (official, fetched)
- L3 https://2k.com/games/lego-2k-drive/awesome-news-network/ (official)
- L4 https://platget.com/guides/lego-2k-drive-trophy-guide/
- L5 https://www.commonsensemedia.org/game-reviews/lego-2k-drive
- L6 https://www.pushsquare.com/reviews/ps5/lego-2k-drive
- L7 https://www.gamereactor.eu/lego-2k-drive-1267423/
- L8 https://gameinformer.com/review/lego-2k-drive/stud-your-engines
- L9 https://waytoomany.games/2023/05/23/review-lego-2k-drive/
- L10 https://www.ign.com/articles/lego-2k-drive-review
- L11 https://www.gamesradar.com/lego-2k-drive-review/
- L12 https://www.pcgamer.com/lego-2k-drive-review/
- Saved images: `ref/lively1.jpg` (Hauntsborough key art, L1), `ref/lively2.jpg` (Turbo Acres key art, L1), `ref/lively3.jpg` (Big Butte key art, L1), plus `ref/world1-4.jpg` and `ref/world_town1.jpg` from the older research.

## What makes Bricklandia feel alive
- **Pedestrians on the pavements, harmless when hit.** [L4] "Anytime that you hit a pedestrian with your vehicle, they will soar harmlessly through the air and land safely elsewhere"; a trophy asks for 200 hits. [L9] (summary) "immediately getting back to their feet and carrying on". [L6] (summary) the world is "stuffed with objects, traffic, and pedestrians".
- **Minifigs standing around to talk to.** [L4] "at least one NPC to speak to outside every On-the-Go Event, World Challenge, and Race, plus hundreds dotted around the map."
- **Smashable brick props that burst and refill boost.** [L4] "fences, traffic cones, vehicles, street signs; literally any Lego object that you can break". [L2] "quickly generate more Boost by crashing into destructible objects". [L1] cactuses "grow back".
- **Moving traffic and boats.** [L4] "Road Hog": destroy 200 NPC vehicles "actively in motion". [L1] Prospecto: "sailing past local boaters".
- **Creatures roaming.** [L1] a talking horse; car-sized spiders "that wander into the road"; "skeletons, zombies, and monsters roaming around"; aliens. Ambient birds/cows are UNCONFIRMED.
- **Big landmarks and things in the sky.** [L1] a "gigantic, trophy-shaped tower", huge pumpkins, glowing fungi. Seen in [lively2, world1]: a **Racington blimp** and a skywriting plane over Turbo Acres; seen in [lively3]: **wind turbines**. Whether they move is UNCONFIRMED.
- **A colour palette per area.** [L1] lush green Turbo Acres, red-orange mesas in Big Butte, purple/teal night in Hauntsborough; [L7] (summary) "Each of the game's four separate landscapes are very distinct". Buildings are saturated brick colours, not pastels [world_town1, lively2].
- **Something every few seconds.** [L5] (summary) "You'll rarely drive for more than a few seconds before finding something interesting"; On-the-Go events start by driving through a blue gate [L4]; [L8] (summary) "ambient missions that you can drop in and out of".
- **Voices and juice.** [L8] (summary) "constant barrage of dialogue"; drift trail + pink meter, turbines pop out on boost [L2].
- Criticism: [L9] (summary) "how desolate and empty the majority of the map is, particularly in the desert"; [L12] (summary) side activities "very cut and paste". The dense towns are what reviewers praise; the empty stretches are what they criticise.

## Our live game (v88i), measured
Script `lv/shots.js` (852×393, normal graphics, the same 5 street spots per city every build, car parked, chase camera, 9 s settle).
Shots: `lv/before/fra_sheet.png`, `lv/before/ath_sheet.png`.

| | Frankfurt (5 spots) | Athens (5 spots) |
|---|---|---|
| pedestrians in view (≤ 120 m) | 1 in total | 0 |
| traffic cars in view | 0 | 0 |
| anything moving (birds, boats, flags, sky) | nothing | nothing |
| facades | Kenney blocks in near-white pastel tints (`CV_FP`: #fff4e0, #f6e0c8 …) | white / cream concrete, small colour panels |

Why it reads as boring and repetitive (causes, with evidence):
1. **Empty streets.** 70 pedestrians are spread over the whole city (placed 30-380 m away, recycled only past 460 m), and traffic cars are recycled only past 650 m, then dropped 180-480 m away. So the pools exist but sit out of sight: 1 person and 0 cars in 10 views.
2. **Nothing moves.** No birds, boats, flags, or sky objects. The only motion is the player car, so a parked view is a still picture.
3. **Same pale blocks.** Frankfurt tints are near-white pastels on the same Kenney models, so districts look alike; Athens is white-on-white.
4. Big empty asphalt and lawns (the DR change rightly removed road clutter; lesson 5), so the life has to come from the pavements, the sky and the water.

## What we changed (v88n), life not clutter
| # | change | cost |
|---|---|---|
| 1 | Pedestrians and traffic stay within sight: people re-placed 35-170 m around you once 200 m away (110 pool, 70 active at 1×); traffic cars past 300 m are moved to streets 100-260 m around you, half in front. Pavement minifigs wave both arms as you pass (2 of 3). | same draw calls, same pools |
| 2 | Pigeon flocks (6 × 7) sit on the pavement ahead and scatter, flapping, when you come within 22 m; gull flocks (3 × 4) circle 26-40 m up. | 2 instanced meshes |
| 3 | Rooftop flags (one per 80 m cell, up to 90): Frankfurt red/white, German, EU blue; Athens blue/white. They swing and ripple in the wind. | 1 + 3-4 instanced meshes |
| 4 | A LEGO blimp (46 m, studs on top) circles each city at 150 m. | 1 mesh |
| 5 | Frankfurt: 5 LEGO cruisers sail up and down the Main; the car is pushed off their hull box like a glancing hit. | 1 instanced mesh |
| 6 | Bolder LEGO facade colours: the district tints are mixed toward saturated LEGO colours (Frankfurt 100 %, Athens 60 % so the white city stays white). | 0 |

All counts scale with ⚙ TUNE → Life → "World life (master)" × each part (docs/TUNE.md). 0 = the v88i world.
No new humanoid model (the same 1.8 m minifig pedestrians, `SC_K.ped`). No HUD change. Nothing new stands on a road except pigeons, which fly off before the car arrives.

Rejected: more breakables or traffic in lanes (lesson 5, DR complaint "too many breakables and traffic"); pop-up challenges (On-the-Go events already exist); a day cycle (FL_ has one).
