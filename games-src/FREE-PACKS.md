# Free art packs: the best 2 per game (research W410)

Checked 7 Nov 2026 (UTC). Owner verdict: the current Kenney-based flat art is "sloppy, looks like HTML". This file lists, per game, the two best free sources that
could make it look like a polished commercial digital board game. Every pick was downloaded through the container proxy, its licence read, and its images put on a
contact sheet (`games-src/free-packs/<slug>-sheet.webp`, 4x4, real images or renders). The packs themselves are NOT in the repo.

Reading guide
- **Coverage %** is a rough share of the game's slot list that the pick can fill in one consistent style (slot lists: `free-art/` stems and `ASSETS.md`).
  No free pack covers a whole game. The honest plan for each game is pick 1 + pick 2 together.
- **3D packs (KayKit, Quaternius)** are CC0 models, not flat sprites. They need a render-to-PNG step (isometric camera, transparent background). A working
  three.js + headless Chromium renderer was used for the sheets; it is not yet in the repo.
- **Public-domain plates and museum images** are real paintings and engravings. They give a premium "printed card" look, but need crop, colour grade and a frame.
- Licences: CC0 and public domain need no credit. CC BY needs credit. Nothing is NC, ND or SA. Nothing is AI-generated or from a tabletop-simulator workshop.
- Rejected after checking: "Free CC0 Dungeon Backgrounds Pack" (The Outlander): the images are in a generative-AI house style, so excluded. Wikimedia Commons
  rate-limited the proxy for most of the run, so some Commons picks have fewer verified files than planned.

## Games the owner rejected

| Game | Rank | Pack | Direct download / source | Licence | Style | Coverage | Why it beats current art | Sheet |
|---|---|---|---|---|---|---|---|---|
| vinegrave | 1 | Met Open Access, Pre-Columbian / Maya objects (jade, idols, figures, pottery) | https://metmuseum.github.io/ (keyless API `collectionapi.metmuseum.org/public/collection/v1.1/search?q=Maya&isPublicDomain=true`) | CC0 (Met Open Access, `isPublicDomain: true` per object) | Real museum photographs on grey | ~30% (artifact cards, idols, relics, gold) | Real objects read as treasure; the flat vector props read as clip art | [sheet](free-packs/vinegrave-sheet.webp) |
| vinegrave | 2 | Catherwood, "Views of Ancient Monuments in Central America" engravings (Wikimedia Commons) | https://commons.wikimedia.org/wiki/Category:Views_of_Ancient_Monuments_in_Central_America,_Chiapas_and_Yucatan | Public domain (Commons licence field, 1844 prints) | Sepia lithographs: ruins, stelae, cave ladder | ~8% alone (ruin sites, temples, backgrounds, map flavour); ~35% with pick 1 | Gives the ruin sites and bg-title/map a period expedition look | same sheet |
| vale-of-banners | 1 | KayKit Medieval Hexagon Pack 1.0 (itch) | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0: "License: (Creative Commons Zero, CC0) ... free to use in personal, educational and commercial projects" | Polished low-poly 3D, 221 models (windmill, watermill, market, blacksmith, church, tavern, mine, lumbermill, well, homes, castle, props) rendered isometric | ~35% (8 buildings, tile and pasture scenery, goods props, banners via colour variants) | Real lit 3D renders in 5 colours replace flat tiles; the 8 building kinds exist one for one | [sheet](free-packs/vale-of-banners-sheet.webp) |
| vale-of-banners | 2 | Met Open Access tapestries and Books of Hours (harvest, months, manuscript leaves) | https://metmuseum.github.io/ (search "harvest tapestry", "book of hours") | CC0 (Met Open Access) | Woven and illuminated medieval art | ~15% alone (26 lore tiles, backgrounds, banners); ~45% with pick 1 | Lore tiles and bg-title/map get a hand-made medieval feel | same sheet (last 4 cells) |
| wildmark | 1 | Audubon "Viviparous Quadrupeds of North America" plates + "American Fishes" salmon plate (Commons) | https://commons.wikimedia.org/wiki/Category:The_Viviparous_Quadrupeds_of_North_America | Public domain (Commons licence field; 1845 plates) | Hand-coloured natural-history lithographs: elk, deer, cougar, wolf-dog, musk ox; salmon plate | ~50% (animal cards, animal portraits and tokens by cropping); bear, fox and hawk plates exist in the same books but only elk, deer, cougar, dog and salmon were downloaded in this run | Real animal art instead of recoloured cartoon animals | [sheet](free-packs/wildmark-sheet.webp) |
| wildmark | 2 | KayKit Forest Nature Pack 1.0 (itch) | https://kaylousberg.itch.io/kaykit-forest | CC0 (License.txt: "License: (Creative Commons Zero, CC0)") | Low-poly 3D trees, bushes, rocks, grass | ~12% (5 terrain textures and hex props, table scenery) | Habitat tiles with real trees and rocks | same sheet (last 6 cells) |
| emberclimb | 1 | game-icons.net, full PNG archive (4,181 icons) | https://game-icons.net/archives/png/zip/ffffff/000000/game-icons.net.png.zip | CC BY 3.0, credit authors ("Icons made by {author}. Available on https://game-icons.net"); some CC0 | One bold monochrome silhouette style, recolourable | ~58% (96 class cards, 19 relics, 9 potions, 6 intents, status icons, nodes) | One consistent glyph language on dark card frames; looks like a shipped deck-builder | [sheet](free-packs/emberclimb-sheet.webp) (first 8 cells) |
| emberclimb | 2 | KayKit Adventurers 2.0 + Skeletons 1.1 (itch) | https://kaylousberg.itch.io/kaykit-adventurers , https://kaylousberg.itch.io/kaykit-skeletons | CC0 (both License.txt files) | Chunky 3D chibi heroes (knight, mage, rogue, barbarian, ranger), skeleton enemies, 30+ weapons and props | ~8% (4 hero portraits, 4 enemy sprites, weapon art); no robot hero, no backgrounds | Gives finished hero and enemy portraits that match each other | same sheet (last 8 cells) |
| perch-and-plume | 1 | Audubon "Birds of America" plates (Commons, Havell edition) | https://commons.wikimedia.org/wiki/Category:Birds_of_America_(Audubon) (search "Audubon Havell Birds of America plate") | Public domain (Commons licence field, 1827-38) | Hand-coloured copperplate bird portraits on cream paper | ~45% (bird cards and portraits for real species; invented species need the closest real match); nests, eggs, food not covered | Real birds replace the single parametric cartoon bird | [sheet](free-packs/perch-and-plume-sheet.webp) |
| perch-and-plume | 2 | Naumann "Naturgeschichte der Vogel Deutschlands" plates (Commons) | https://commons.wikimedia.org/wiki/Category:Naturgeschichte_der_V%C3%B6gel_Deutschlands | Public domain (Commons licence field) | Colour lithographs, European species | UNVERIFIED beyond 1 downloaded plate (rate limit); estimated ~30% | Adds Eurasian wetland and grassland species | not separate |
| stitchwise | 1 | Met Open Access American and European quilts | https://metmuseum.github.io/ (search "quilt") | CC0 (Met Open Access) | Photographed antique quilts: hexagon, star, appliqué | ~35% (33 fabric slots, quilt art, backgrounds) | Real cloth beats generated flat swatches | [sheet](free-packs/stitchwise-sheet.webp) (first 8 cells) |
| stitchwise | 2 | Met Open Access William Morris textile and wallpaper designs | https://metmuseum.github.io/ (search "William Morris textile") | CC0 (Met Open Access) | Block-printed botanical patterns, repeatable | ~25% alone (fabrics, torn edges, bg); ~55% with pick 1 | Seamless-looking, richly coloured fabric designs | same sheet (last 8 cells) |

## Other games (details in `free-packs/part-A.md`, `part-B.md`, `part-C.md`)

Per-game rows (two picks, download link, licence quote, coverage, sheet) are in the part files. Best pick per game:

| Game | Best pack | Licence | Coverage | Sheet |
|---|---|---|---|---|
| cauldron-fair | Quaternius Fantasy Props MegaKit (2nd: Koehler botanical plates, 3 verified) | CC0 | ~35% | free-packs/cauldron-fair-sheet.webp |
| crown-city-smash | KayKit City Builder Bits (2nd: Quaternius Animated Monsters) | CC0 | ~35% | free-packs/crown-city-smash-sheet.webp |
| doorkick-dungeon | KayKit Adventurers + Skeletons (2nd: Quaternius Fantasy Props) | CC0 | ~30% | free-packs/doorkick-dungeon-sheet.webp |
| final-approach | KayKit Board Game Bits (2nd: wide-body jet model + landing pad) | CC0 | ~40% | free-packs/final-approach-sheet.webp |
| hollowbough | KayKit Forest Nature Pack (2nd: Audubon bird plates) | CC0 / public domain | ~30% | free-packs/hollowbough-sheet.webp |
| kaiten-kitchen | Hiroshige fish prints, Met Open Access (2nd: ViNk Sushi Pack, pixel) | CC0 (Met isPublicDomain) / CC0 | ~30% | free-packs/kaiten-kitchen-sheet.webp |
| lantern-dive | Haeckel plates, Commons (2nd: underwater sprites, clashes) | Public domain | ~33% | free-packs/lantern-dive-sheet.webp |
| nebula-aces | Foozle Void Fleet packs (2nd: HoloUI frames and icons) | CC0 | ~50% | free-packs/nebula-aces-sheet.webp |
| redline-rally | Kenney Racing Pack (same flat style as now; 2nd: racing HUD kit) | CC0 / CC BY 4.0 | ~35% | free-packs/redline-rally-sheet.webp |
| deep-signal | Haeckel plates (2nd: pixel playing cards, too small) | Public domain | ~40% | free-packs/deep-signal-sheet.webp |
| rampart-and-vine | Pixel Frog Tiny Swords (2nd: Kenney Tiny Town) | No-redistribute custom / CC0 | ~70% | free-packs/rampart-and-vine-sheet.webp |
| sands-of-qamar | Dulac plates, Commons (2nd: game-icons.net) | Public domain / CC BY 3.0 | ~40% | free-packs/sands-of-qamar-sheet.webp |
| shipwreck-isle | KayKit Resource Bits + RPG Tools Bits (2nd: Quaternius 3D Card Kit) | CC0 | ~42% | free-packs/shipwreck-isle-sheet.webp |
| short-fuse | KayKit RPG Tools Bits + Adventurers (2nd: Quaternius Props, look unverified) | CC0 | ~33% | free-packs/short-fuse-sheet.webp |
| sunglaze | KayKit Board Game Bits (2nd: Grammar of Ornament scans) | CC0 / public domain | ~33% | free-packs/sunglaze-sheet.webp |
| thornbound | KayKit Medieval Hexagon + Adventurers + Skeletons (2nd: Quaternius 3D Card Kit) | CC0 | ~50% | free-packs/thornbound-sheet.webp |
| tidewake | KayKit Medieval Hexagon (no ships or monsters; 2nd: Quaternius Card Kit) | CC0 | ~33% | free-packs/tidewake-sheet.webp |
| twin-thrones | KayKit Medieval Hexagon + Board Game Bits (2nd: Quaternius Card Kit) | CC0 | ~33% | free-packs/twin-thrones-sheet.webp |

## Status 8 Nov 2026: temporary library installed (W410)

Rule from the owner: never replace, overwrite or unwire owner art; one art style per game; emberclimb uses owner art only. `games-src/free-library/_tools/install_library.py SLUG`
refuses every game with owner art (the 15 in `assets-inbox/` plus emberclimb). Per-slot sources and licences: `games-src/free-library/<slug>/_MAP.tsv` and `_CREDITS.md`.

| Game | Real slots | Fallback | Main sources | Notes |
|---|---|---|---|---|
| wildmark | 46 of 47 | 1 (acorn token) | Audubon plates (PD), 16th-century salmon watercolours, Met and NGA landscapes (CC0) | goat portrait is a soft crop; two elk cards are crops of one plate |
| perch-and-plume | 185 of 186 | 1 (ui-tray) | NGA open data bird plates (CC0), Audubon (PD), game-icons.net icons (CC BY 3.0: Lorc, Delapouite, Skoll, Sbed) | 120 birds matched by species from about 420 plates; rare caption slivers possible |
| vinegrave | 133 of 170 | 37 | Met Open Access objects (CC0), Catherwood engravings (PD) | 30 camp-gear cards use generic artefacts; pale cutout shadows on some idols |
| stitchwise | 56 of 63 | 7 | Met quilts, textiles and paintings (CC0) | fabrics not guaranteed seamless |
| vale-of-banners | 91 of 92 | 1 | KayKit Medieval Hexagon renders (CC0), Met tapestries and manuscripts (CC0) | low-poly 3D tiles; some lore crops similar |
| deep-signal | 35 of 47 | 12 | Haeckel plates (PD, Internet Archive), game-icons.net (CC BY 3.0) | portraits keep the older art |
| redline-rally | 22 of 43 | 21 | game-icons.net glyph cards (CC BY 3.0) | tracks, cars, portraits keep the older art |
| twin-thrones | 126 of 126 | 0 | KayKit Medieval Hexagon renders (CC0), game-icons.net (CC BY 3.0) | 3D-render style |

Not touched (owner art): the 15 `assets-inbox/` games and emberclimb. Credit lines for CC BY packs must be shown in the game credits when each game is deployed.
deep-signal and redline-rally still mix new art with older Kenney art in their fallback slots; drop or finish them if the owner wants one style per game.

## Needs an owner decision

- **Pixel Frog "Tiny Swords" (picked for rampart-and-vine):** licence allows personal and commercial use but says "You may not redistribute, resell, or repackage". The games ship as public files, so it needs a yes before use. The CC0 alternative is Kenney Tiny Town (same flat style the owner rejected).
- **CC BY packs: approved by the owner (7 Nov 2026) as interim art until the Google Flow images are generated.** They stay in, each with its credit line:
  - game-icons.net (emberclimb, sands-of-qamar): "Icons made by {author}. Available on https://game-icons.net". Credit each icon's author (folder name in the archive) and licence CC BY 3.0.
  - Racing HUD kit (redline-rally): credit the author named on the pack's page, licence CC BY 4.0.
  - Put the lines in each game's credits screen and in `free-art/CREDITS.md`. Remove them when the Flow images replace the icons.
- **Still open:** Pixel Frog Tiny Swords (no-redistribute clause). The owner's yes covered CC BY credit lines only, so it stays unused until they decide.
