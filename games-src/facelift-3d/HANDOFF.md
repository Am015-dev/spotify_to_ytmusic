# Facelift 3D models (laptop -> Linux session)

Updated 10 Oct 2026. 59 models, one per item of the TRELLIS tables in `games-src/FACELIFT.md` plus the items made
from existing paintings. All are Pixal3D game-size bakes (owner chose Pixal3D over TRELLIS.2): ~20k faces, 1024 px WebP
PBR textures, ~1-1.5 MB each. "Upright" = lean corrected on the laptop (Pixal3D builds in the camera frame, so models
leaned 10-40 deg); those already stand on y=0, centred on x/z. Small see-through gaps on tiny figures are accepted
(owner ruling); the 4 worst items were repainted with thick parts.

## To do on Linux (per FACELIFT.md budgets)
1. Rows with Upright = NO: stand the model upright first (lowest point on y=0, centred on x/z).
2. Decimate to the item's triangle budget (Blender Decimate or `gltf-transform simplify`); thin parts collapse first.
3. Texture to 256-512 px (1024 only for hero pieces), WebP; metallic is 0 on almost all.
4. `gltf-transform` weld + meshopt + webp; target 30-300 KB per file (each item's budget in FACELIFT.md).
5. Put the result at the item's target path (`games/<game>/models/...`) and wire it as FACELIFT.md describes.

## Still missing (will be pushed here when made)
- nothing missing

## Files
| Game | Item | File | Size | Upright | Source |
|---|---|---|---|---|---|
| cauldron-fair | bag | `games-src/facelift-3d/cauldron-fair/bag.glb` | 2341 KB | yes | owner keep |
| cauldron-fair | chip | `games-src/facelift-3d/cauldron-fair/chip.glb` | 2734 KB | yes | owner keep |
| crown-city-smash | clampede | `games-src/facelift-3d/crown-city-smash/clampede.glb` | 3065 KB | yes | owner keep |
| crown-city-smash | dot | `games-src/facelift-3d/crown-city-smash/dot.glb` | 2256 KB | yes | owner keep |
| crown-city-smash | fountain | `games-src/facelift-3d/crown-city-smash/fountain.glb` | 2838 KB | yes | owner keep |
| crown-city-smash | token-energy | `games-src/facelift-3d/crown-city-smash/token-energy.glb` | 1316 KB | yes | newest version (not voted yet) |
| crown-city-smash | token-heart | `games-src/facelift-3d/crown-city-smash/token-heart.glb` | 1541 KB | yes | newest version (not voted yet) |
| crown-city-smash | token-star | `games-src/facelift-3d/crown-city-smash/token-star.glb` | 1248 KB | yes | newest version (not voted yet) |
| crown-city-smash | tower-a | `games-src/facelift-3d/crown-city-smash/tower-a.glb` | 3888 KB | yes | owner keep |
| crown-city-smash | tower-b | `games-src/facelift-3d/crown-city-smash/tower-b.glb` | 2803 KB | yes | owner keep |
| crown-city-smash | tower-c | `games-src/facelift-3d/crown-city-smash/tower-c.glb` | 1889 KB | yes | owner keep |
| crown-city-smash | tower-c-t120000 | `games-src/facelift-3d/crown-city-smash/tower-c-t120000.glb` | 12861 KB | yes | owner keep |
| crown-city-smash | tower-c-t60000 | `games-src/facelift-3d/crown-city-smash/tower-c-t60000.glb` | 4789 KB | yes | owner keep |
| crown-city-smash | tower-d | `games-src/facelift-3d/crown-city-smash/tower-d.glb` | 2805 KB | yes | owner keep |
| doorkick-dungeon | die | `games-src/facelift-3d/doorkick-dungeon/die.glb` | 4163 KB | yes | owner keep |
| doorkick-dungeon | door | `games-src/facelift-3d/doorkick-dungeon/door.glb` | 2800 KB | yes | owner keep |
| doorkick-dungeon | hero-grub | `games-src/facelift-3d/doorkick-dungeon/hero-grub.glb` | 2694 KB | yes | owner keep |
| doorkick-dungeon | hero-morwen | `games-src/facelift-3d/doorkick-dungeon/hero-morwen.glb` | 2511 KB | yes | owner keep |
| doorkick-dungeon | hero-pip | `games-src/facelift-3d/doorkick-dungeon/hero-pip.glb` | 2514 KB | yes | owner keep |
| doorkick-dungeon | hero-tansy | `games-src/facelift-3d/doorkick-dungeon/hero-tansy.glb` | 2716 KB | yes | owner keep |
| final-approach | plane | `games-src/facelift-3d/final-approach/plane.glb` | 1817 KB | yes | owner keep |
| hollowbough | ever-tree | `games-src/facelift-3d/hollowbough/ever-tree.glb` | 2583 KB | yes | owner keep |
| hollowbough | worker | `games-src/facelift-3d/hollowbough/worker.glb` | 1881 KB | yes | newest version (not voted yet) |
| kaiten-kitchen | cloche | `games-src/facelift-3d/kaiten-kitchen/cloche.glb` | 1212 KB | yes | owner keep |
| kaiten-kitchen | plate | `games-src/facelift-3d/kaiten-kitchen/plate.glb` | 1910 KB | yes | owner keep |
| lantern-dive | lantern | `games-src/facelift-3d/lantern-dive/lantern.glb` | 3543 KB | yes | owner keep |
| nebula-aces | na-lancer | `games-src/facelift-3d/nebula-aces/na-lancer.glb` | 2950 KB | yes | owner keep |
| nebula-aces | na-rock-a | `games-src/facelift-3d/nebula-aces/na-rock-a.glb` | 2387 KB | yes | owner keep |
| nebula-aces | na-rock-b | `games-src/facelift-3d/nebula-aces/na-rock-b.glb` | 2761 KB | yes | owner keep |
| nebula-aces | na-rock-c | `games-src/facelift-3d/nebula-aces/na-rock-c.glb` | 2234 KB | yes | owner keep |
| nebula-aces | na-talon | `games-src/facelift-3d/nebula-aces/na-talon.glb` | 3957 KB | yes | owner keep |
| rampart-and-vine | piece-champ | `games-src/facelift-3d/rampart-and-vine/piece-champ.glb` | 1611 KB | yes | owner keep |
| rampart-and-vine | piece-hog | `games-src/facelift-3d/rampart-and-vine/piece-hog.glb` | 2010 KB | yes | owner keep |
| rampart-and-vine | piece-mason | `games-src/facelift-3d/rampart-and-vine/piece-mason.glb` | 2337 KB | yes | owner keep |
| rampart-and-vine | piece-meeple | `games-src/facelift-3d/rampart-and-vine/piece-meeple.glb` | 1554 KB | yes | owner keep |
| sands-of-qamar | camel | `games-src/facelift-3d/sands-of-qamar/camel.glb` | 1959 KB | yes | owner keep |
| sands-of-qamar | lamp | `games-src/facelift-3d/sands-of-qamar/lamp.glb` | 3176 KB | yes | owner keep |
| sands-of-qamar | meeple | `games-src/facelift-3d/sands-of-qamar/meeple.glb` | 2628 KB | yes | owner keep |
| sands-of-qamar | palace | `games-src/facelift-3d/sands-of-qamar/palace.glb` | 3149 KB | yes | owner keep |
| sands-of-qamar | palm | `games-src/facelift-3d/sands-of-qamar/palm.glb` | 3533 KB | yes | owner keep |
| shipwreck-isle | sw-carpenter | `games-src/facelift-3d/shipwreck-isle/sw-carpenter.glb` | 2959 KB | yes | owner keep |
| shipwreck-isle | sw-cook | `games-src/facelift-3d/shipwreck-isle/sw-cook.glb` | 2971 KB | yes | owner keep |
| shipwreck-isle | sw-explorer | `games-src/facelift-3d/shipwreck-isle/sw-explorer.glb` | 2816 KB | yes | owner keep |
| shipwreck-isle | sw-fire | `games-src/facelift-3d/shipwreck-isle/sw-fire.glb` | 2412 KB | yes | owner keep |
| shipwreck-isle | sw-friday | `games-src/facelift-3d/shipwreck-isle/sw-friday.glb` | 2773 KB | yes | owner keep |
| shipwreck-isle | sw-palisade | `games-src/facelift-3d/shipwreck-isle/sw-palisade.glb` | 2966 KB | yes | owner keep |
| shipwreck-isle | sw-palm-a | `games-src/facelift-3d/shipwreck-isle/sw-palm-a.glb` | 3345 KB | yes | owner keep |
| shipwreck-isle | sw-palm-b | `games-src/facelift-3d/shipwreck-isle/sw-palm-b.glb` | 1987 KB | yes | gap-fix repaint (replaces the kept version) |
| shipwreck-isle | sw-palm-c | `games-src/facelift-3d/shipwreck-isle/sw-palm-c.glb` | 2286 KB | yes | owner keep |
| shipwreck-isle | sw-raft | `games-src/facelift-3d/shipwreck-isle/sw-raft.glb` | 3104 KB | yes | owner keep |
| shipwreck-isle | sw-shelter | `games-src/facelift-3d/shipwreck-isle/sw-shelter.glb` | 2423 KB | yes | owner keep |
| short-fuse | bomb | `games-src/facelift-3d/short-fuse/bomb.glb` | 4353 KB | yes | owner keep |
| short-fuse | pliers | `games-src/facelift-3d/short-fuse/pliers.glb` | 3927 KB | yes | owner keep |
| sunglaze | plate | `games-src/facelift-3d/sunglaze/plate.glb` | 2640 KB | yes | owner keep |
| sunglaze | sun | `games-src/facelift-3d/sunglaze/sun.glb` | 1750 KB | yes | owner keep |
| thornbound | crown | `games-src/facelift-3d/thornbound/crown.glb` | 2918 KB | yes | owner keep |
| thornbound | throne | `games-src/facelift-3d/thornbound/throne.glb` | 4103 KB | yes | owner keep |
| tidewake | junk | `games-src/facelift-3d/tidewake/junk.glb` | 2952 KB | yes | owner keep |
| tidewake | leviathan | `games-src/facelift-3d/tidewake/leviathan.glb` | 3214 KB | yes | owner keep |

## Rule (owner, 10 Oct 2026)
Never decimate the owner's models below 40k triangles or 1024 px textures without the owner's OK.
