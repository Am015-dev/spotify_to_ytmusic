# LEGO 2K Drive: reference research (2026-10-08)

Every claim cites a URL. "Seen in [img]" means I looked at the saved screenshot myself; it is an observation, not an official spec.
Anything not found online is marked UNCONFIRMED. Game: Visual Concepts / 2K, released 19 May 2023 [S1].

## Sources
- S1 Official FAQ: https://2k.com/games/lego-2k-drive/faq/
- S2 Official Garage page: https://2k.com/games/lego-2k-drive/garage/ (lego.2k.com/drive/garage/ redirects here)
- S3 Official Biomes page: https://2k.com/games/lego-2k-drive/features/biomes/
- S4 Official Driving Techniques: https://2k.com/games/lego-2k-drive/features/driving-techniques/
- S5 Official Modes: https://2k.com/games/lego-2k-drive/features/modes/
- S6 GTPlanet review: https://www.gtplanet.net/?p=125445
- S7 GGRecon build guide: https://www.ggrecon.com/guides/lego-2k-drive-how-to-build-best-cars/
- S8 Push Square beginner tips: https://www.pushsquare.com/guides/lego-2k-drive-tips-and-tricks-for-beginners
- S9 RacingGames.gg biome map guide: https://racinggames.gg/article/lego-2k-drive-map-every-biome-in-bricklandia
- S10 RacingGames.gg beginner guide: https://racinggames.gg/article/lego-2k-drive-beginners-guide-5-essential-tips-and-tricks-you-need-to-know
- S11 RacingGames.gg trophy list: https://racinggames.gg/article/lego-2k-drive-trophy-and-achievement-list
- S12 Steam store (app 1451810): https://store.steampowered.com/app/1451810/
- S13 Official Drive Pass S2: https://lego.2k.com/drive/drive-pass/season-two/
- S14 Epic Games Store Drive Pass S1 article: https://store.epicgames.com/news/discover-the-lego-2k-drive-pass-for-season-1-in-game-rewards-and-challenges
- S15 Xbox Wire: https://news.xbox.com/en-us/?p=191713

## a) Garage / builder
**Structure (official, S2)**
- Garage is reachable from the main menu. In Story mode, Garages are scattered over the map and **double as fast-travel points** [S2].
- **Showroom** shows all owned and created vehicles. From there: **Modify** (makes an exact copy, so the original is untouched), **Duplicate**, and **Instructions** (a step-by-step guided build, layer by layer) [S2].
- **Body Shop** is the build space. Bricks are sorted "by type and category" in the **Brick Drawer** menu; "hundreds of bricks" are available at the start [S2]; "over 1,000 brick types" in total [S6].
- Customisation goes beyond bricks: paint jobs, **horn and engine sound**, **swapping wheels**, **driver-seat placement**, **stickers**, and **flair** pieces [S2].
- Sunny Monkey (an NPC mechanic) offers optional **Tutorials** [S2]. The Body Shop has Undo [S6].
- When you finish: **Test Drive**, then equip the vehicle to your **Loadout** [S2].
- Vehicles: the FAQ says to "construct new cars and boats from scratch" [S1]. The car transforms automatically between **Street / Off-Road / Water** forms by terrain (manual transform is optional) [S4]. A loadout = 1 Street + 1 Off-Road + 1 Water vehicle, with up to 3 loadouts [S8, S10]; this is seen in [loadout1].
- The exact "pick type -> chassis" step order in the Create flow is UNCONFIRMED by an official or readable source; the guides that describe it returned 403 errors.

**Limits**
- The official site says there is a "build limit to how many bricks and added bits" so you "don't take up the whole road", with no number given [S2].
- Seen in [garage1, garage2, garage3]: the top bar shows **two budget meters, each out of 350**. One has a yellow-brick icon (for example 193/350, 219/350, 282/350). The other has a lightning/smiley icon (for example 8/350, 57/350). The second one is probably the "added bits" (flair) budget; that reading is my inference.
- GTPlanet observed the size cap as roughly **20 studs wide x 30 long x 12 tall** [S6].
- Seen in [garage2]: a red warning reads "Your build has some loose bricks! Fix it to save!", so floating bricks block saving.

**Layout (seen in garage1-3)**
- Top-left: a "BODY SHOP" badge (red ribbon with yellow gears). Top-centre: a red header strip with the vehicle name and the two 350-budget bars. Top-right: ZOOM / UNDO / REDO tiles (dark rounded squares).
- Left (paint mode): a tall navy panel. Paint tabs are **FLAT / CLEAR / METALLIC / GLOWING** above a 4-column grid of paint-tin swatches (White, Grey, Light Yellow, Brick Yellow, Light Reddish Violet, Pastel Blue, Nougat, Bright Red, Bright Blue, Bright Yellow, Earth Orange, Black, Dark Grey, Dark Green, Bright Green, Dark Orange).
- Centre: the car sits on a grey turntable plinth with a dotted blue LED border. The background is a dark workshop full of minifig mechanics.
- Bottom-centre (place mode): an action bar of **PLACE / CANCEL / ROTATE / SNAP VERTICAL / COLOR / MODIFIERS**. A held part shows a red outline with corner brackets.
- Paint finishes, per GTPlanet: flat, metallic, and glowing, plus "flair" effects [S6].

**Stats in builder / showroom**
- Official stats: **Top Speed, Acceleration, Handling, Health, Melee Power, Weight** [S2]. In-game help text, seen in [showroom1] via S7: Top Speed "how fast your vehicle is capable of going", Acceleration, Handling ("steering is hard, this makes it easier"), Health ("the healthier you are, the longer you'll survive"), Weight ("more bricks = heavier").
- **More bricks = heavier.** There are **6 weight classes: Super Light, Light, Medium, Heavy, Super Heavy, Massive** [S2, S7]. Heavier cars take and deal more damage; lighter cars handle better [S7].
- Seen in [showroom1]: in the top-right, 4 coloured stat chips show modifiers such as **-2 / +2 / -1 / +2** (red is negative, green is positive). Below them is a weight badge "VERY LIGHT" with a weight number. An "EQUIPPED" card compares against the current car. The bottom strip has filter tabs ALL / COLLECTION / RIVALS / CREATIONS / SPECIAL / LEGO Speed Champions / LEGO City, then a horizontal card carousel.
- So the stats are **relative modifiers per car**, not absolute numbers. The base value comes from driver level/class [S7: "stats scale with your level"].

## b) Perk / stat / level systems
- **License Class C -> B -> A.** Winning races and events levels up your License Class "for additional abilities and extra speed" [S15]. In Race mode, the class sets "overall speed and available abilities" [S5].
- What each class unlocks:
  - **Perk slots:** 1 slot at C, +1 at B, +1 at A, so **3 max** [S10, S7].
  - **Boost abilities:** Brickbash (hold boost for 3 s or more) at B, and **Quickbash** (double-tap boost when holding a full-meter token: immune, wrecking ball) at **A, the highest class** [S4, S10].
  - **Bigger boost meter** [S4].
- **Driver level (LVL):** seen in [perks1]: a big "LVL 14" with an XP bar reading **946/1,200** and the next level, 15. Class badge "B CLASS". There are **4 vertical purple stat bars (TOP SPEED, ACCELERATION, HEALTH, HANDLING)** with a white "current level" line across them, and green or red ticks show perk deltas.
- Perk slots sit in a vertical column, labelled C / B / A, with A locked. The equipped perks are **Handling Boost** (C) and **Power Fuel** (B).
- The max driver level is UNCONFIRMED. One trophy is tied to "level 30 in Story mode" (search snippet, supercheats; not verified).
- **Perks** are equipped from the Loadout/Perks menu. They boost Top Speed, Acceleration, Handling, or Health, or add effects such as restoring boost on power-up pickup [S8, S10]. Example names seen in the S7 screenshot are Acceleration Boost, Health Breaker, Bubble Up, Melee Boost, and Power Fuel. Perks are earned through Story progress or bought in the store [S6, S8].
  - GTPlanet found the stat and perk effects unclear and of little impact [S6].
  - Trophy "All Perked Up": collect 10 perks (search snippet, primagames/supercheats; not opened).
- **No per-vehicle level or rarity tiers** were found. One store item is called a "Super Awesome" car [S6]. Treat rarity as UNCONFIRMED.
- **Currency:** **Brickbux** (earned in Story mode; payouts drop sharply after the first win) [S6, S8]. **Coins** are bought with real money [S6, S1].
  - Shop: **Unkie's Emporium**, a weekly rotation that sells cars, drivers, perks, bricks, flair, and stickers [S6, S8].
- **Collection / completion:**
  - Trophies count collection: "Collect 50 new vehicles", "Collect 15 new drivers" [S11]. "Folk Hero" means all quests are done [S11].
  - Prospecto Valley has **50 gold nuggets** needed for 100% [S9].
  - Season 4's Stargaze Summit has **Herring Barrel** collectibles [S3].
  - Checkered **Flags** are won from rivals and unlock the next Grand Brix races [S9].
  - The open-world objective card in [hud_world1] reads "COLLECT 16 FLAGS!".
  - A dedicated "Collection book with %" screen is UNCONFIRMED. The showroom has a COLLECTION filter tab [showroom1].
- **Drive Pass** (season track): **100 tiers**. In S2 there are 22 free rewards and 103 premium [S13]. Ranked play has 7 leagues, Bronze to LEGO Maniac [S13].

## c) Open world: Bricklandia biomes
The biomes are **separate islands** with no driving between them; you use fast-travel garages [S9]. On the map in [map1], each biome is a voxel-brick island floating over a green baseplate, with clouds around it.
- **Turbo Acres** (start/tutorial, the smallest, 1 garage) [S9]:
  - It has lush fields and a "gigantic, trophy-shaped tower" (Clutch Racington's home) [S3].
  - Seen in [world1, world2, hud_world1]:
    - The sky is **deep blue with blocky white brick clouds**. The grass is saturated green.
    - Trees are **autumn red/orange/yellow** brick trees, some cube-shaped.
    - The road is **grey asphalt with double yellow centre lines, white edge dashes, and red-white kerbs**.
    - Landmarks: a white lattice "SR" trophy tower, a "RACINGTON" blimp, **giant wrenches stuck in the ground as gateposts**, blue-and-white pit buildings, a loop-de-loop track, and a lake with boats in the water.
- **Big Butte County** (Arizona-style desert) [S9]:
  - Landmarks: desert canyons, mesas, Big Butte Speedway, **Big Dino Park** (brick-built dinosaur sculptures), the bustling **Big Butte Town**, aliens, and cactuses that "grow back" after you crash through them [S3].
  - Seen in [world3, world_town1]:
    - Rock is **orange-red stepped brick mesas**. There is a voxel T-rex statue, wind turbines, and palm trees.
    - The town has **cream/tan low-rise shops**, a glass diner, street lamps, and white-lined parking bays.
    - Glowing **power-up discs** hover over the road: rocket, spider, bullseye, and lightning.
- **Prospecto Valley**: lakes, beaches, rolling hills, waterways with boaters, a mining town, gold chunks, and talking horses [S3].
- **Hauntsborough** (final region): **always night**. It has skeletons, zombies, decrepit castles, huge pumpkin carvings, boiling witch's brews, luminous giant fungi, and car-sized spiders that bite cars [S3, S9].
  - Seen in [world4]: a purple night sky, a glowing cyan tower with lightning, and blue half-timbered houses.
- **Stargaze Summit** (Drive Pass S4): icy mountains and tundra, then outer-space races. It has 7 races, 3 challenges, and 9 OTG events [S3].
- **LEGO-ness:**
  - Everything is brick-built: terrain, clouds, trees, and buildings [world1-4].
  - Minifigs line the roads. There are 150 "folk" to talk to (trophy, search snippet).
  - **Smashable objects refill boost** [S4, S8], and Big Butte's town has "plenty of objects to destroy" [S9].
  - Weeds can be mown with a lawnmower unlocked from a side quest [S11].
- **Activities on the map** (map icons seen in [map1]):
  - Checkered-flag rival races, purple globe "On-the-Go" events, green "!" quests, red wrench garages, and blue badge icons [S14 describes flags/globes/!/badges].
  - There are 78 On-the-Go events in total; the trophy requires gold in all of them (search snippet, platget; not opened).

## d) HUD and menus
- **Open world** (seen in [hud_world1, world_town1]):
  - Bottom-left: a **circular minimap** with a yellow ring, an "N" marker, a white player arrow, and event icons on the rim. Beside it is a dark plate with the **zone name** ("Turbo Acres / Training Grounds", "Big Butte Town / Downtown") and a checker flag.
  - Bottom-centre: **one curved boost bar** (white/light-blue pill).
  - Top-right: **one objective card** (yellow border, navy fill, with a small robot S.T.U.D. peeking over it).
  - Nothing else: **no speedometer, no buttons**. The screen is about 90% world.
- **Race** (seen in [hud_race1]):
  - Top-left: a huge yellow italic **position "5TH"**, a **standings list** of 8 names (your row in yellow), and a green "You ⚡ <rival>" bar.
  - Top-right: **"LAP 1/2"** in big chunky numerals and a **timer "00:38.17"**.
  - Right-middle: a **distance-to-checkpoint bubble "161m"**.
  - Bottom-centre: the boost bar, plus the held **power-up icon** (a glowing disc with its button prompt) above the car.
  - Bottom-left: the minimap with rival arrows.
  - Track side: glowing yellow chevron boards.
- **Boost/drift:** drifting builds a **small pink meter above the big blue Boost meter at the bottom of the screen**; when the drift ends it converts to boost. The car leaves a pink drift trail [S4].
- **Main menu "PLAY / CHOOSE ACTIVITY"** (seen in [menu1]):
  - 4 tall tilted yellow cards: **Story, Cup Series, Race, Minigame**. The selected card is full colour with a white border.
  - A player card shows the minifig portrait, the class badge (B), and perk-slot dots.
  - "P2 press ... for Split Screen". The 3D garage stays visible behind the menu.
- Modes: Story, Cup Series (Grand Brix per biome, then the Sky Cup), Race (Circuit / Point-to-Point), Minigames (Defend, Rescue), and Brick Brawl 3v3 [S5].
- **Menu style overall:**
  - Navy-blue backgrounds, red/yellow ribbon badges top-left (BODY SHOP, PERKS, LOADOUTS, STREET), and heavy italic white or yellow display type.
  - Tilted cards and bottom button-prompt rows [garage1, perks1, loadout1, showroom1].

## Saved reference images (docs/research/ref/)
| file | source URL | what it actually shows |
|---|---|---|
| garage1.jpg | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1451810/ss_4a763117d61deab279702e874556635c9449ebee.1920x1080.jpg | Body Shop place mode, "Gold Driller Truck"; 219/350 + 2/350 budgets; drill part held in a red bracket outline; bottom bar PLACE/CANCEL/ROTATE/SNAP VERTICAL/COLOR/MODIFIERS; ZOOM/UNDO/REDO top-right |
| garage2.jpg | https://www.ggrecon.com/media/prnp1ftn/lego-2k-drive-car-creator.jpg | Body Shop paint mode: Flat swatch grid on the left, black and tan sports car on the plinth, 282/350 + 57/350, "loose bricks" save warning |
| garage3.jpg | https://www.ggrecon.com/media/qo1a2jva/lego-2k-drive-4.png | Body Shop paint tabs FLAT/CLEAR/METALLIC/GLOWING with the swatch names; hamburger car; 193/350 + 8/350 |
| showroom1.jpg | https://www.ggrecon.com/media/01khpvft/lego-2k-drive-weight-explained.jpg | STREET vehicle select: Cecil's Car, stat chips -2/+2/-1/+2, "VERY LIGHT" weight, filter tabs, card carousel (500px, small) |
| perks1.jpg | https://gdm-universal-media.b-cdn.net/racinggames/cbbbcae03500b7dccff1795c0198b4a7473a1822-3840x2160.jpg | Perks screen: S.T.U.D. robot, "B CLASS", LVL 14, XP 946/1,200; 4 purple stat bars; slots C (Handling Boost), B (Power Fuel), A (locked) |
| loadout1.jpg | https://images.pushsquare.com/ceb6e1fd2604c/lego-2k-drive-tips-and-tricks-for-beginners-9.900x.jpg | Loadout 1/3: tilted cards for Convertible Sports Coupe (STREET), Dusty Roadster (OFF-ROAD), Lake Cruiser (WATER), with weight number and stat icons; PERKS B badge |
| hud_world1.jpg | https://images.pushsquare.com/665b1c64605da/1280x720.jpg | Open-world HUD in Turbo Acres: round minimap bottom-left, zone label, boost bar, "COLLECT 16 FLAGS!" card; red coupe on grey asphalt with yellow lines, brick clouds, autumn trees |
| hud_race1.jpg | https://gdm-universal-media.b-cdn.net/racinggames/f766bdfbd1423c2c4c639b9be881007a40455690-1920x1080.jpg | Race HUD: 5TH, standings list, LAP 1/2, 00:38.17, 161m checkpoint, spider power-up, blue hex shield bubble, trophy tower behind |
| world_town1.jpg | https://images.pushsquare.com/2f2780a853c2c/lego-2k-drive-tips-and-tricks-for-beginners-8.900x.jpg | Big Butte Town Downtown: parking lot, 4 glowing power-up discs, cream shops, orange brick mesas, brick clouds |
| world1.jpg | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1451810/ss_3600efe16881770c902912d82cdd000fc01e4cde.1920x1080.jpg | Turbo Acres aerial key art: monster truck, trophy tower, Racington blimp, lake with boats, circuit with red-white kerbs, autumn brick trees |
| world2.jpg | https://assets.2k.com/1a6ngf98576c/2A4vhMO9WC2XEcWpWtlD1S/3bf8cd0db07212f73c7983847bc3355a/2KCAP_ArtemisTurbo-Acres.jpg | Turbo Acres road: grey asphalt, double yellow line, giant wrench gateposts, cube trees, brick clouds (614px) |
| world3.jpg | https://assets.2k.com/1a6ngf98576c/2ANk82nO8WjXneIFmUXuQ0/f58eceab3efe497aee7365c6d7dc66b7/2KCAP_Artemis_Big-Butte.jpg | Big Dino Park: voxel grey T-rex, orange mesas, deep blue sky, brick clouds (619px) |
| world4.jpg | https://assets.2k.com/1a6ngf98576c/1L0RzoxFo7OBxe04muSXmi/9da67ebb372944a271229fee5a072e91/2KCAP_Artemis_Hauntsborough.jpg | Hauntsborough at night: blue half-timbered houses, glowing cyan tower, lightning (616px) |
| map1.jpg | https://gdm-universal-media.b-cdn.net/racinggames/ef91cafe37afa953963bb8aff687943aaaa78078-1920x1538.jpg | World map: Turbo Acres voxel island with moat, map pins (checker, purple globe, red wrench) |
| menu1.jpg | https://images.pushsquare.com/e169f63f37e7d/lego-2k-drive-tips-and-tricks-for-beginners-14.900x.jpg | PLAY / CHOOSE ACTIVITY: Story, Cup Series, Race, Minigame cards; player card with B class; garage behind |

Not found online: a Collection-book screenshot and a dedicated profile screen. The perks screen (perks1) shows the driver level instead.
