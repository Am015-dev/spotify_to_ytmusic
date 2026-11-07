# Twin Thrones art slots

Every picture the game shows is a named slot. Drop `<stem>.webp` (or png) in, rebuild, done. Source of truth: `assets.json` (made by `node gen-assets.js` from `src/data.js`). No text, letters or numbers go inside any picture: the game draws names, costs and numbers over it.

Counts: wave 1 = 27, wave 2 = 80, wave 3 = 19, total 126.

## Drop-in steps (owner)
1. Flow prompt files: `games-src/next-wave/flow-2d/twin-thrones/prompts-wave<N>-ratio-<A>x<B>.json`; one file per wave and ratio, every stem is in exactly one file. Owner's step list: `games-src/next-wave/NEW-GAMES-WAVES.md`. Key the white background to transparent where `alpha` is true (ingest does it), save as `<stem>.webp` or `.png`.
2. Put the files in `assets-inbox/twin-thrones/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run). It crops to the size in the table and writes `games/twin-thrones/media/<stem>.webp`.
3. Rebuild with `python3 games-src/scripts/build-all.py twin-thrones`; the page picks up every stem whose file exists. No code change.


## Wave 1 (first minute): 27 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| title-bg | bg | 2048x1152 | 16:9 | no | Title screen background (centre stays calm, cropped on phones) |
| table-bg | bg | 2048x2048 | 1:1 | no | Game table behind everything |
| military-board | board | 1800x240 | 15:2 | no | Conflict track strip |
| military-pawn | token | 256x256 | 1:1 | yes | The conflict pawn |
| coin | icon | 256x256 | 1:1 | yes | Coin icon next to coin counts |
| back-age1 | card | 500x700 | 5:7 | no | Face-down pyramid cards of age 1 |
| back-age2 | card | 500x700 | 5:7 | no | Face-down pyramid cards of age 2 |
| back-age3 | card | 500x700 | 5:7 | no | Face-down pyramid cards of age 3 |
| city-board-p1 | board | 1500x300 | 5:1 | no | Strip behind the bottom player's city |
| city-board-p2 | board | 1500x300 | 5:1 | no | Strip behind the top player's city |
| portrait-p1 | portrait | 512x512 | 1:1 | no | Bottom player portrait |
| portrait-p2 | portrait | 512x512 | 1:1 | no | Top player portrait |
| a1-timber-stand | card | 500x700 | 5:7 | no | Card face: Timber Stand (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-hewing-camp | card | 500x700 | 5:7 | no | Card face: Hewing Camp (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-mud-basin | card | 500x700 | 5:7 | no | Card face: Mud Basin (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-brick-cut | card | 500x700 | 5:7 | no | Card face: Brick Cut (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-rock-face | card | 500x700 | 5:7 | no | Card face: Rock Face (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-gravel-pit | card | 500x700 | 5:7 | no | Card face: Gravel Pit (age 1, brown; the name, cost and numbers are drawn by code over the picture) |
| a1-glass-kiln | card | 500x700 | 5:7 | no | Card face: Glass Kiln (age 1, grey; the name, cost and numbers are drawn by code over the picture) |
| a1-reed-press | card | 500x700 | 5:7 | no | Card face: Reed Press (age 1, grey; the name, cost and numbers are drawn by code over the picture) |
| a1-open-stage | card | 500x700 | 5:7 | no | Card face: Open Stage (age 1, blue; the name, cost and numbers are drawn by code over the picture) |
| a1-shrine | card | 500x700 | 5:7 | no | Card face: Wayside Shrine (age 1, blue; the name, cost and numbers are drawn by code over the picture) |
| a1-bathhouse | card | 500x700 | 5:7 | no | Card face: Bathhouse (age 1, blue; the name, cost and numbers are drawn by code over the picture) |
| a1-pony-pen | card | 500x700 | 5:7 | no | Card face: Pony Pen (age 1, red; the name, cost and numbers are drawn by code over the picture) |
| a1-barrack-yard | card | 500x700 | 5:7 | no | Card face: Barrack Yard (age 1, red; the name, cost and numbers are drawn by code over the picture) |
| a1-stake-fence | card | 500x700 | 5:7 | no | Card face: Stake Fence (age 1, red; the name, cost and numbers are drawn by code over the picture) |
| a1-lookout | card | 500x700 | 5:7 | no | Card face: Lookout (age 1, red; the name, cost and numbers are drawn by code over the picture) |

## Wave 2 (every remaining rules piece): 80 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| a1-herb-garden | card | 500x700 | 5:7 | no | Card face: Herb Garden (age 1, green; the name, cost and numbers are drawn by code over the picture) |
| a1-weights-hall | card | 500x700 | 5:7 | no | Card face: Weights Hall (age 1, green; the name, cost and numbers are drawn by code over the picture) |
| a1-scribe-room | card | 500x700 | 5:7 | no | Card face: Scribe Room (age 1, green; the name, cost and numbers are drawn by code over the picture) |
| a1-remedy-shop | card | 500x700 | 5:7 | no | Card face: Remedy Shop (age 1, green; the name, cost and numbers are drawn by code over the picture) |
| a1-roadside-inn | card | 500x700 | 5:7 | no | Card face: Roadside Inn (age 1, yellow; the name, cost and numbers are drawn by code over the picture) |
| a1-timber-depot | card | 500x700 | 5:7 | no | Card face: Timber Depot (age 1, yellow; the name, cost and numbers are drawn by code over the picture) |
| a1-clay-depot | card | 500x700 | 5:7 | no | Card face: Clay Depot (age 1, yellow; the name, cost and numbers are drawn by code over the picture) |
| a1-stone-depot | card | 500x700 | 5:7 | no | Card face: Stone Depot (age 1, yellow; the name, cost and numbers are drawn by code over the picture) |
| a2-sawpit | card | 500x700 | 5:7 | no | Card face: Sawpit (age 2, brown; the name, cost and numbers are drawn by code over the picture) |
| a2-kiln-yard | card | 500x700 | 5:7 | no | Card face: Kiln Yard (age 2, brown; the name, cost and numbers are drawn by code over the picture) |
| a2-deep-quarry | card | 500x700 | 5:7 | no | Card face: Deep Quarry (age 2, brown; the name, cost and numbers are drawn by code over the picture) |
| a2-glassblower | card | 500x700 | 5:7 | no | Card face: Glassblower (age 2, grey; the name, cost and numbers are drawn by code over the picture) |
| a2-drying-rack | card | 500x700 | 5:7 | no | Card face: Drying Rack (age 2, grey; the name, cost and numbers are drawn by code over the picture) |
| a2-judges-hall | card | 500x700 | 5:7 | no | Card face: Judges' Hall (age 2, blue; the name, cost and numbers are drawn by code over the picture) |
| a2-hero-monument | card | 500x700 | 5:7 | no | Card face: Hero Monument (age 2, blue; the name, cost and numbers are drawn by code over the picture) |
| a2-sun-temple | card | 500x700 | 5:7 | no | Card face: Sun Temple (age 2, blue; the name, cost and numbers are drawn by code over the picture) |
| a2-water-arch | card | 500x700 | 5:7 | no | Card face: Water Arch (age 2, blue; the name, cost and numbers are drawn by code over the picture) |
| a2-podium | card | 500x700 | 5:7 | no | Card face: Speaker's Podium (age 2, blue; the name, cost and numbers are drawn by code over the picture) |
| a2-star-gazers | card | 500x700 | 5:7 | no | Card face: Star Gazers (age 2, green; the name, cost and numbers are drawn by code over the picture) |
| a2-chart-room | card | 500x700 | 5:7 | no | Card face: Chart Room (age 2, green; the name, cost and numbers are drawn by code over the picture) |
| a2-herbarium | card | 500x700 | 5:7 | no | Card face: Herbarium (age 2, green; the name, cost and numbers are drawn by code over the picture) |
| a2-measure-hall | card | 500x700 | 5:7 | no | Card face: Measure Hall (age 2, green; the name, cost and numbers are drawn by code over the picture) |
| a2-open-bazaar | card | 500x700 | 5:7 | no | Card face: Open Bazaar (age 2, yellow; the name, cost and numbers are drawn by code over the picture) |
| a2-caravan-post | card | 500x700 | 5:7 | no | Card face: Caravan Post (age 2, yellow; the name, cost and numbers are drawn by code over the picture) |
| a2-customs-quay | card | 500x700 | 5:7 | no | Card face: Customs Quay (age 2, yellow; the name, cost and numbers are drawn by code over the picture) |
| a2-brewhouse | card | 500x700 | 5:7 | no | Card face: Brewhouse (age 2, yellow; the name, cost and numbers are drawn by code over the picture) |
| a2-horse-yard | card | 500x700 | 5:7 | no | Card face: Horse Yard (age 2, red; the name, cost and numbers are drawn by code over the picture) |
| a2-barracks | card | 500x700 | 5:7 | no | Card face: Great Barracks (age 2, red; the name, cost and numbers are drawn by code over the picture) |
| a2-archery-range | card | 500x700 | 5:7 | no | Card face: Archery Range (age 2, red; the name, cost and numbers are drawn by code over the picture) |
| a2-parade-ground | card | 500x700 | 5:7 | no | Card face: Parade Ground (age 2, red; the name, cost and numbers are drawn by code over the picture) |
| a2-city-wall | card | 500x700 | 5:7 | no | Card face: City Wall (age 2, red; the name, cost and numbers are drawn by code over the picture) |
| a3-pantheon | card | 500x700 | 5:7 | no | Card face: Hall of Many Gods (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-gardens | card | 500x700 | 5:7 | no | Card face: Terrace Gardens (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-town-hall | card | 500x700 | 5:7 | no | Card face: Council Hall (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-palace | card | 500x700 | 5:7 | no | Card face: Throne Palace (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-obelisk | card | 500x700 | 5:7 | no | Card face: Sky Obelisk (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-fountain | card | 500x700 | 5:7 | no | Card face: Grand Fountain (age 3, blue; the name, cost and numbers are drawn by code over the picture) |
| a3-planetarium | card | 500x700 | 5:7 | no | Card face: Planetarium (age 3, green; the name, cost and numbers are drawn by code over the picture) |
| a3-globe-hall | card | 500x700 | 5:7 | no | Card face: Globe Hall (age 3, green; the name, cost and numbers are drawn by code over the picture) |
| a3-scholar-court | card | 500x700 | 5:7 | no | Card face: Scholars' Court (age 3, green; the name, cost and numbers are drawn by code over the picture) |
| a3-apothecary-guild | card | 500x700 | 5:7 | no | Card face: Healers' House (age 3, green; the name, cost and numbers are drawn by code over the picture) |
| a3-trade-chamber | card | 500x700 | 5:7 | no | Card face: Trade Chamber (age 3, yellow; the name, cost and numbers are drawn by code over the picture) |
| a3-beacon-quay | card | 500x700 | 5:7 | no | Card face: Beacon Quay (age 3, yellow; the name, cost and numbers are drawn by code over the picture) |
| a3-sand-arena | card | 500x700 | 5:7 | no | Card face: Sand Arena (age 3, yellow; the name, cost and numbers are drawn by code over the picture) |
| a3-grand-port | card | 500x700 | 5:7 | no | Card face: Grand Port (age 3, yellow; the name, cost and numbers are drawn by code over the picture) |
| a3-armory | card | 500x700 | 5:7 | no | Card face: Armory (age 3, yellow; the name, cost and numbers are drawn by code over the picture) |
| a3-bastion | card | 500x700 | 5:7 | no | Card face: Bastion (age 3, red; the name, cost and numbers are drawn by code over the picture) |
| a3-siege-yard | card | 500x700 | 5:7 | no | Card face: Siege Yard (age 3, red; the name, cost and numbers are drawn by code over the picture) |
| a3-arsenal | card | 500x700 | 5:7 | no | Card face: Arsenal (age 3, red; the name, cost and numbers are drawn by code over the picture) |
| a3-war-pavilion | card | 500x700 | 5:7 | no | Card face: War Pavilion (age 3, red; the name, cost and numbers are drawn by code over the picture) |
| a3-high-fort | card | 500x700 | 5:7 | no | Card face: High Fort (age 3, red; the name, cost and numbers are drawn by code over the picture) |
| g-merchants | card | 500x700 | 5:7 | no | Card face: Merchants' League (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-shipowners | card | 500x700 | 5:7 | no | Card face: Shipowners' Union (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-builders | card | 500x700 | 5:7 | no | Card face: Builders' Lodge (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-magistrates | card | 500x700 | 5:7 | no | Card face: Magistrates' Bench (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-scientists | card | 500x700 | 5:7 | no | Card face: Scholars' Circle (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-tacticians | card | 500x700 | 5:7 | no | Card face: Tacticians' Order (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| g-moneylenders | card | 500x700 | 5:7 | no | Card face: Moneylenders' Hall (age 3, purple; the name, cost and numbers are drawn by code over the picture) |
| w-bronze-titan | card | 700x500 | 7:5 | no | Wonder card: Bronze Titan |
| w-sky-tomb | card | 700x500 | 7:5 | no | Wonder card: Sky Tomb |
| w-moon-grove | card | 700x500 | 7:5 | no | Wonder card: Moon Grove |
| w-terraced-orchard | card | 700x500 | 7:5 | no | Wonder card: Terraced Orchard |
| w-archive-of-dust | card | 700x500 | 7:5 | no | Wonder card: Archive of Dust |
| w-marble-barrow | card | 700x500 | 7:5 | no | Wonder card: Marble Barrow |
| w-stone-riddle | card | 700x500 | 7:5 | no | Wonder card: Stone Riddle |
| w-beacon-isle | card | 700x500 | 7:5 | no | Wonder card: Beacon Isle |
| w-grand-arena | card | 700x500 | 7:5 | no | Wonder card: Grand Arena |
| w-thunder-idol | card | 700x500 | 7:5 | no | Wonder card: Thunder Idol |
| w-merchant-road | card | 700x500 | 7:5 | no | Wonder card: Merchant Road |
| w-sunken-harbor | card | 700x500 | 7:5 | no | Wonder card: Sunken Harbor |
| t-agriculture | token | 256x256 | 1:1 | yes | Progress token: Fertile Fields |
| t-architecture | token | 256x256 | 1:1 | yes | Progress token: Master Builders |
| t-economy | token | 256x256 | 1:1 | yes | Progress token: Open Trade |
| t-law | token | 256x256 | 1:1 | yes | Progress token: Code of Law |
| t-masonry | token | 256x256 | 1:1 | yes | Progress token: Fine Masonry |
| t-mathematics | token | 256x256 | 1:1 | yes | Progress token: Number Lore |
| t-philosophy | token | 256x256 | 1:1 | yes | Progress token: Deep Thought |
| t-strategy | token | 256x256 | 1:1 | yes | Progress token: War Doctrine |
| t-theology | token | 256x256 | 1:1 | yes | Progress token: Sacred Rites |
| t-urbanism | token | 256x256 | 1:1 | yes | Progress token: City Planning |

## Wave 3 (polish): 19 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| result-victory | bg | 2048x1152 | 16:9 | no | Result screen when you win |
| result-defeat | bg | 2048x1152 | 16:9 | no | Result screen when you lose |
| res-wood | icon | 256x256 | 1:1 | yes | Resource icon: wood |
| res-clay | icon | 256x256 | 1:1 | yes | Resource icon: clay |
| res-stone | icon | 256x256 | 1:1 | yes | Resource icon: stone |
| res-glass | icon | 256x256 | 1:1 | yes | Resource icon: glass |
| res-papyrus | icon | 256x256 | 1:1 | yes | Resource icon: papyrus |
| sci-wheel | icon | 256x256 | 1:1 | yes | Science symbol: wheel |
| sci-scale | icon | 256x256 | 1:1 | yes | Science symbol: scale |
| sci-quill | icon | 256x256 | 1:1 | yes | Science symbol: quill |
| sci-mortar | icon | 256x256 | 1:1 | yes | Science symbol: mortar |
| sci-sundial | icon | 256x256 | 1:1 | yes | Science symbol: sundial |
| sci-globe | icon | 256x256 | 1:1 | yes | Science symbol: globe |
| sci-law | icon | 256x256 | 1:1 | yes | Science symbol: law |
| icon-shield | icon | 256x256 | 1:1 | yes | Shield (military) icon |
| icon-vp | icon | 256x256 | 1:1 | yes | Victory point icon |
| fx-lift-dust | fx | 512x512 | 1:1 | yes | Dust puff when a card lifts |
| fx-coin-burst | fx | 512x512 | 1:1 | yes | Coin burst when coins are won |
| fx-pawn-glow | fx | 512x512 | 1:1 | yes | Glow behind the sliding pawn |

Note (W334): `assets.json` and the prompt files were edited by hand after the first build; do not re-run the generator script over them (it would undo the wave split, the removed reserved upgrade backs and the wording fixes).
