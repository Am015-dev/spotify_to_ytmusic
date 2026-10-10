# Facelift 3D: models (full detail + lite)

Sources: `games-src/facelift-3d/<game>/<item>.glb` (151238 KB for 57 Pixal3D models, ~20k triangles, 1024 px PBR). Never decimate them below 40k triangles or 1024 px textures without the owner's OK.

Per item, in `games/<game>/models/`:
- `<item>.glb`: **HQ** (default). All source triangles, 1024 px base colour + metal/rough textures as WebP q90, weld + meshopt with 16-bit positions, 10-bit normals, 14-bit UVs. 29890 KB for 57 (226-1136 KB each, 18597-19941 triangles). No model exceeded 40k, so none was simplified.
- `<item>-lite.glb`: the small version from the previous pass (6846 KB for 57, ~120 KB each; 500-14000 triangles, 256-1024 px base colour only, flat roughness). Unchanged files from `optimise.mjs`.
- `<item>.webp` 1024x1024 and `<item>@512.webp` 512x512: transparent sprites rendered from the HQ model (2048 px, 4x MSAA, soft key + rim light, downscaled, q90), same 3/4 view as before.

**Which file to use:** HQ on desktop and in zoom / inspect / turntable views; lite on phones or Low graphics (and for instanced pieces seen small, e.g. towers, rocks, palms, tokens). 2D games use the sprites (`@512` for small uses). Load lazily: only the models visible on screen, preload the next ones when idle, never all 57.

Rebuild: `node games-src/facelift-3d/optimise-hq.mjs [filter]` (HQ + sprites; needs @gltf-transform, meshoptimizer, sharp, three, playwright-core in `$TOOLS`, and `CHROMIUM=<chrome path>`). `optimise.mjs` makes the old lite files; it writes `<item>.glb`, so copy its output to `-lite.glb` first. Side-by-side check: `node games-src/facelift-3d/contact-sheet.mjs` (source | HQ | lite, 3 views, 10 models: `contact-sheet-1.png`, `-2.png`). HQ is indistinguishable from the source at 1024 px.

Pipeline detail: flatten/join/weld, ground at y=0 and centre x/z (sources were already upright). The `-t60000`/`-t120000` tower-c variants are skipped.

| game | item | HQ glb | HQ KB | HQ tris | lite KB | lite tris | sprites | use (FACELIFT.md) |
|---|---|---|---|---|---|---|---|---|
| cauldron-fair | bag | `games/cauldron-fair/models/bag.glb` | 483 | 19777 | 131 | 3996 | `bag.webp` 1024, `bag@512.webp` | Pre-render shake/open strip: the bag draw is the fun moment. |
| cauldron-fair | chip | `games/cauldron-fair/models/chip.glb` | 835 | 19462 | 79 | 786 | `chip.webp` 1024, `chip@512.webp` | Tumbling chip sprites when drawn (8 recolours). |
| crown-city-smash | clampede | `games/crown-city-smash/models/clampede.glb` | 557 | 19449 | 178 | 5970 | `clampede.webp` 1024, `clampede@512.webp` | 3D board piece (same loader as the other monsters); turntable in monster picker. |
| crown-city-smash | dot | `games/crown-city-smash/models/dot.glb` | 427 | 19235 | 129 | 4974 | `dot.webp` 1024, `dot@512.webp` | 3D board piece; turntable in monster picker. |
| crown-city-smash | fountain | `games/crown-city-smash/models/fountain.glb` | 573 | 19696 | 156 | 2994 | `fountain.webp` 1024, `fountain@512.webp` | Downtown centre piece (replaces procedural plaza). |
| crown-city-smash | token-energy | `games/crown-city-smash/models/token-energy.glb` | 235 | 19882 | 14 | 500 | `token-energy.webp` 1024, `token-energy@512.webp` | Instanced 3D pickup flying to the HUD. |
| crown-city-smash | token-heart | `games/crown-city-smash/models/token-heart.glb` | 293 | 19292 | 14 | 488 | `token-heart.webp` 1024, `token-heart@512.webp` | Instanced 3D pickup flying to the HUD. |
| crown-city-smash | token-star | `games/crown-city-smash/models/token-star.glb` | 226 | 19316 | 12 | 500 | `token-star.webp` 1024, `token-star@512.webp` | Instanced 3D pickup flying to the HUD. |
| crown-city-smash | tower-a | `games/crown-city-smash/models/tower-a.glb` | 640 | 18681 | 145 | 3476 | `tower-a.webp` 1024, `tower-a@512.webp` | Replace procedural box buildings of buildCity (instanced). |
| crown-city-smash | tower-b | `games/crown-city-smash/models/tower-b.glb` | 737 | 19836 | 212 | 3478 | `tower-b.webp` 1024, `tower-b@512.webp` | Replace procedural box buildings of buildCity (instanced). |
| crown-city-smash | tower-c | `games/crown-city-smash/models/tower-c.glb` | 291 | 19289 | 76 | 3500 | `tower-c.webp` 1024, `tower-c@512.webp` | Replace procedural box buildings of buildCity (instanced). |
| crown-city-smash | tower-d | `games/crown-city-smash/models/tower-d.glb` | 550 | 19071 | 136 | 3486 | `tower-d.webp` 1024, `tower-d@512.webp` | Replace procedural box buildings of buildCity (instanced). |
| doorkick-dungeon | die | `games/doorkick-dungeon/models/die.glb` | 976 | 19237 | 82 | 1478 | `die.webp` 1024, `die@512.webp` | Pre-rendered level-up/roll sprite; dice otherwise stay CSS 3D. |
| doorkick-dungeon | door | `games/doorkick-dungeon/models/door.glb` | 618 | 19743 | 177 | 4992 | `door.webp` 1024, `door@512.webp` | 12-frame door-kick strip (hinge swing + dust) at every door. Hero piece, 1024 px. |
| doorkick-dungeon | hero-grub | `games/doorkick-dungeon/models/hero-grub.glb` | 480 | 19611 | 121 | 2968 | `hero-grub.webp` 1024, `hero-grub@512.webp` | Pre-rendered level-up turntable and card zoom. |
| doorkick-dungeon | hero-morwen | `games/doorkick-dungeon/models/hero-morwen.glb` | 458 | 19860 | 106 | 2984 | `hero-morwen.webp` 1024, `hero-morwen@512.webp` | Pre-rendered level-up turntable and card zoom. |
| doorkick-dungeon | hero-pip | `games/doorkick-dungeon/models/hero-pip.glb` | 482 | 18597 | 123 | 2994 | `hero-pip.webp` 1024, `hero-pip@512.webp` | Pre-rendered level-up turntable and card zoom. |
| doorkick-dungeon | hero-tansy | `games/doorkick-dungeon/models/hero-tansy.glb` | 547 | 19335 | 136 | 2984 | `hero-tansy.webp` 1024, `hero-tansy@512.webp` | Pre-rendered level-up turntable and card zoom. |
| final-approach | plane | `games/final-approach/models/plane.glb` | 315 | 19522 | 107 | 5998 | `plane.webp` 1024, `plane@512.webp` | Pre-render 15 bank angles x 2 (gear up/down) for the window. |
| hollowbough | ever-tree | `games/hollowbough/models/ever-tree.glb` | 516 | 19630 | 167 | 6000 | `ever-tree.webp` 1024, `ever-tree@512.webp` | Hero turntable at the end of the game. |
| hollowbough | worker | `games/hollowbough/models/worker.glb` | 302 | 18869 | 23 | 800 | `worker.webp` 1024, `worker@512.webp` | Pre-rendered worker peg sprite. |
| kaiten-kitchen | cloche | `games/kaiten-kitchen/models/cloche.glb` | 231 | 19574 | 46 | 2500 | `cloche.webp` 1024, `cloche@512.webp` | 12-frame cloche-lift strip for the reveal beat. |
| kaiten-kitchen | plate | `games/kaiten-kitchen/models/plate.glb` | 322 | 19680 | 71 | 1998 | `plate.webp` 1024, `plate@512.webp` | Plate under the cloche; sprite. |
| lantern-dive | lantern | `games/lantern-dive/models/lantern.glb` | 586 | 18669 | 148 | 3500 | `lantern.webp` 1024, `lantern@512.webp` | Glowing sprite for Commander/trump moments. |
| nebula-aces | na-lancer | `games/nebula-aces/models/na-lancer.glb` | 571 | 19596 | 225 | 9990 | `na-lancer.webp` 1024, `na-lancer@512.webp` | Replace extruded flat hulls on the 3D board; turntable in squad picker. |
| nebula-aces | na-talon | `games/nebula-aces/models/na-talon.glb` | 617 | 19590 | 245 | 13996 | `na-talon.webp` 1024, `na-talon@512.webp` | Replace extruded flat hulls on the 3D board; turntable in squad picker. |
| nebula-aces | na-rock-a | `games/nebula-aces/models/na-rock-a.glb` | 458 | 19256 | 30 | 974 | `na-rock-a.webp` 1024, `na-rock-a@512.webp` | Replace procedural rockGeo (instanced). |
| nebula-aces | na-rock-b | `games/nebula-aces/models/na-rock-b.glb` | 498 | 19001 | 34 | 968 | `na-rock-b.webp` 1024, `na-rock-b@512.webp` | Replace procedural rockGeo (instanced). |
| nebula-aces | na-rock-c | `games/nebula-aces/models/na-rock-c.glb` | 434 | 18987 | 28 | 978 | `na-rock-c.webp` 1024, `na-rock-c@512.webp` | Replace procedural rockGeo (instanced). |
| rampart-and-vine | piece-champ | `games/rampart-and-vine/models/piece-champ.glb` | 283 | 19236 | 32 | 1800 | `piece-champ.webp` 1024, `piece-champ@512.webp` | Pre-render 4 colours x 4 kinds as sprites with contact shadow. |
| rampart-and-vine | piece-hog | `games/rampart-and-vine/models/piece-hog.glb` | 297 | 19835 | 28 | 1800 | `piece-hog.webp` 1024, `piece-hog@512.webp` | Pre-render 4 colours x 4 kinds as sprites with contact shadow. |
| rampart-and-vine | piece-mason | `games/rampart-and-vine/models/piece-mason.glb` | 361 | 19142 | 36 | 1792 | `piece-mason.webp` 1024, `piece-mason@512.webp` | Pre-render 4 colours x 4 kinds as sprites with contact shadow. |
| rampart-and-vine | piece-meeple | `games/rampart-and-vine/models/piece-meeple.glb` | 250 | 19302 | 22 | 1500 | `piece-meeple.webp` 1024, `piece-meeple@512.webp` | Pre-render 4 colours x 4 kinds as sprites with contact shadow. |
| sands-of-qamar | camel | `games/sands-of-qamar/models/camel.glb` | 347 | 19727 | 79 | 2986 | `camel.webp` 1024, `camel@512.webp` | 5 colour-saddle sprites (96x96) for tile corner; hero view in Players sheet. |
| sands-of-qamar | lamp | `games/sands-of-qamar/models/lamp.glb` | 477 | 19134 | 284 | 5934 | `lamp.webp` 1024, `lamp@512.webp` | 24-frame turntable strip in the summon-a-djinn pop-up. Hero piece, 1024 px. |
| sands-of-qamar | meeple | `games/sands-of-qamar/models/meeple.glb` | 469 | 19158 | 43 | 1486 | `meeple.webp` 1024, `meeple@512.webp` | 6 tribe sprites (+ lifted variants) from one fixed 3/4 camera; recolour per tribe. |
| sands-of-qamar | palace | `games/sands-of-qamar/models/palace.glb` | 561 | 19839 | 139 | 2994 | `palace.webp` 1024, `palace@512.webp` | Sprites for x1/x2/x3 tile stacks. |
| sands-of-qamar | palm | `games/sands-of-qamar/models/palm.glb` | 1136 | 19319 | 285 | 2350 | `palm.webp` 1024, `palm@512.webp` | Sprites for x1/x2/x3 tile stacks. |
| shipwreck-isle | sw-carpenter | `games/shipwreck-isle/models/sw-carpenter.glb` | 772 | 19426 | 267 | 7946 | `sw-carpenter.webp` 1024, `sw-carpenter@512.webp` | Replace procedural pawnGroup pawns; turntable in camp panel. |
| shipwreck-isle | sw-cook | `games/shipwreck-isle/models/sw-cook.glb` | 605 | 19118 | 212 | 7936 | `sw-cook.webp` 1024, `sw-cook@512.webp` | Replace procedural pawnGroup pawns; turntable in camp panel. |
| shipwreck-isle | sw-explorer | `games/shipwreck-isle/models/sw-explorer.glb` | 547 | 19843 | 195 | 7966 | `sw-explorer.webp` 1024, `sw-explorer@512.webp` | Replace procedural pawnGroup pawns; turntable in camp panel. |
| shipwreck-isle | sw-friday | `games/shipwreck-isle/models/sw-friday.glb` | 532 | 18793 | 191 | 7940 | `sw-friday.webp` 1024, `sw-friday@512.webp` | Replace procedural pawnGroup pawns; turntable in camp panel. |
| shipwreck-isle | sw-fire | `games/shipwreck-isle/models/sw-fire.glb` | 412 | 19514 | 95 | 2488 | `sw-fire.webp` 1024, `sw-fire@512.webp` | Built on the island as you play (build moment). |
| shipwreck-isle | sw-palisade | `games/shipwreck-isle/models/sw-palisade.glb` | 578 | 19148 | 127 | 2952 | `sw-palisade.webp` 1024, `sw-palisade@512.webp` | Built on the island as you play (build moment). |
| shipwreck-isle | sw-raft | `games/shipwreck-isle/models/sw-raft.glb` | 631 | 19466 | 147 | 2946 | `sw-raft.webp` 1024, `sw-raft@512.webp` | Built on the island as you play (build moment). |
| shipwreck-isle | sw-shelter | `games/shipwreck-isle/models/sw-shelter.glb` | 501 | 19497 | 120 | 2994 | `sw-shelter.webp` 1024, `sw-shelter@512.webp` | Built on the island as you play (build moment). |
| shipwreck-isle | sw-palm-a | `games/shipwreck-isle/models/sw-palm-a.glb` | 790 | 19015 | 82 | 1978 | `sw-palm-a.webp` 1024, `sw-palm-a@512.webp` | Replace procedural jtree trees (instanced). |
| shipwreck-isle | sw-palm-b | `games/shipwreck-isle/models/sw-palm-b.glb` | 335 | 19179 | 41 | 1998 | `sw-palm-b.webp` 1024, `sw-palm-b@512.webp` | Replace procedural jtree trees (instanced). |
| shipwreck-isle | sw-palm-c | `games/shipwreck-isle/models/sw-palm-c.glb` | 419 | 19393 | 45 | 1992 | `sw-palm-c.webp` 1024, `sw-palm-c@512.webp` | Replace procedural jtree trees (instanced). |
| short-fuse | bomb | `games/short-fuse/models/bomb.glb` | 794 | 19002 | 199 | 5990 | `bomb.webp` 1024, `bomb@512.webp` | 12-frame wobble idle + 10-frame boom strip; the wire-cut moment. Hero piece, 1024 px. |
| short-fuse | pliers | `games/short-fuse/models/pliers.glb` | 1018 | 19676 | 180 | 8924 | `pliers.webp` 1024, `pliers@512.webp` | Snip animation sprite when a wire is cut. |
| sunglaze | plate | `games/sunglaze/models/plate.glb` | 409 | 19914 | 100 | 2500 | `plate.webp` 1024, `plate@512.webp` | 3D table dished plates; sprite for phone board. |
| sunglaze | sun | `games/sunglaze/models/sun.glb` | 293 | 19941 | 30 | 1800 | `sun.webp` 1024, `sun@512.webp` | Hero first-player token on the 3D table, tilts when moved. |
| thornbound | crown | `games/thornbound/models/crown.glb` | 585 | 19826 | 137 | 3454 | `crown.webp` 1024, `crown@512.webp` | Pre-rendered turntable on the winner banner. |
| thornbound | throne | `games/thornbound/models/throne.glb` | 739 | 19088 | 189 | 5976 | `throne.webp` 1024, `throne@512.webp` | Optional hero turntable on the title. |
| tidewake | junk | `games/tidewake/models/junk.glb` | 587 | 19248 | 209 | 7952 | `junk.webp` 1024, `junk@512.webp` | Replace procedural buildShip3D; sails recoloured per captain; sprites for phone 2D board. |
| tidewake | leviathan | `games/tidewake/models/leviathan.glb` | 904 | 19334 | 181 | 9980 | `leviathan.webp` 1024, `leviathan@512.webp` | Replace buildLevCreature; surfaces from a tile when it wakes. Hero piece, 1024 px. |
