# Facelift 3D models: approved raw meshes (laptop -> Linux session)

Date: 10 Oct 2026. 41 models, one per item in the TRELLIS tables of `games-src/FACELIFT.md`, each approved by the owner
in a side-by-side review (several items took 2-3 source paintings; only the approved version is here, renamed to the item name).

These are RAW image-to-3D outputs: ~30k triangles, 1024 px PBR textures, 2.7-4.5 MB each. They are NOT game-ready.

## To do on Linux (per FACELIFT.md budgets)
1. Decimate to the triangle budget of the item (Blender Decimate, or `gltf-transform simplify`); keep silhouettes, thin parts collapse first.
2. Bake/resize the texture to 256-512 px (1024 only for hero pieces), WebP; metallic is 0 on almost all of them.
3. `gltf-transform` weld + meshopt + webp; target 30-300 KB per file (see each item's budget in FACELIFT.md).
4. Put the result at the item's target path (`games/<game>/models/...`) and wire it as FACELIFT.md describes (sprites pre-rendered from one fixed 3/4 camera where it says so).
5. Do this first: the meshes are not grounded. Move each so its lowest point sits on y=0 and centre it on x/z; remove any thin stray ground plate the generator left under the base.

## Files
| Game | Item | File | Raw size |
|---|---|---|---|
| crown-city-smash | fountain | `games-src/facelift-3d/crown-city-smash/fountain.glb` | 2994 KB |
| crown-city-smash | tower-a | `games-src/facelift-3d/crown-city-smash/tower-a.glb` | 2640 KB |
| crown-city-smash | tower-b | `games-src/facelift-3d/crown-city-smash/tower-b.glb` | 3173 KB |
| crown-city-smash | tower-c | `games-src/facelift-3d/crown-city-smash/tower-c.glb` | 4498 KB |
| crown-city-smash | tower-d | `games-src/facelift-3d/crown-city-smash/tower-d.glb` | 4183 KB |
| doorkick-dungeon | die | `games-src/facelift-3d/doorkick-dungeon/die.glb` | 3275 KB |
| doorkick-dungeon | door | `games-src/facelift-3d/doorkick-dungeon/door.glb` | 3143 KB |
| doorkick-dungeon | hero-grub | `games-src/facelift-3d/doorkick-dungeon/hero-grub.glb` | 3511 KB |
| doorkick-dungeon | hero-morwen | `games-src/facelift-3d/doorkick-dungeon/hero-morwen.glb` | 3027 KB |
| doorkick-dungeon | hero-pip | `games-src/facelift-3d/doorkick-dungeon/hero-pip.glb` | 3271 KB |
| doorkick-dungeon | hero-tansy | `games-src/facelift-3d/doorkick-dungeon/hero-tansy.glb` | 3508 KB |
| final-approach | plane | `games-src/facelift-3d/final-approach/plane.glb` | 2575 KB |
| lantern-dive | lantern | `games-src/facelift-3d/lantern-dive/lantern.glb` | 4005 KB |
| nebula-aces | na-lancer | `games-src/facelift-3d/nebula-aces/na-lancer.glb` | 4292 KB |
| nebula-aces | na-rock-a | `games-src/facelift-3d/nebula-aces/na-rock-a.glb` | 3688 KB |
| nebula-aces | na-rock-b | `games-src/facelift-3d/nebula-aces/na-rock-b.glb` | 3735 KB |
| nebula-aces | na-rock-c | `games-src/facelift-3d/nebula-aces/na-rock-c.glb` | 3528 KB |
| nebula-aces | na-talon | `games-src/facelift-3d/nebula-aces/na-talon.glb` | 3900 KB |
| sands-of-qamar | camel | `games-src/facelift-3d/sands-of-qamar/camel.glb` | 2787 KB |
| sands-of-qamar | lamp | `games-src/facelift-3d/sands-of-qamar/lamp.glb` | 4179 KB |
| sands-of-qamar | meeple | `games-src/facelift-3d/sands-of-qamar/meeple.glb` | 2989 KB |
| sands-of-qamar | palace | `games-src/facelift-3d/sands-of-qamar/palace.glb` | 3139 KB |
| sands-of-qamar | palm | `games-src/facelift-3d/sands-of-qamar/palm.glb` | 2860 KB |
| shipwreck-isle | sw-carpenter | `games-src/facelift-3d/shipwreck-isle/sw-carpenter.glb` | 3382 KB |
| shipwreck-isle | sw-cook | `games-src/facelift-3d/shipwreck-isle/sw-cook.glb` | 3451 KB |
| shipwreck-isle | sw-explorer | `games-src/facelift-3d/shipwreck-isle/sw-explorer.glb` | 3379 KB |
| shipwreck-isle | sw-fire | `games-src/facelift-3d/shipwreck-isle/sw-fire.glb` | 3267 KB |
| shipwreck-isle | sw-friday | `games-src/facelift-3d/shipwreck-isle/sw-friday.glb` | 3339 KB |
| shipwreck-isle | sw-palisade | `games-src/facelift-3d/shipwreck-isle/sw-palisade.glb` | 3577 KB |
| shipwreck-isle | sw-palm-a | `games-src/facelift-3d/shipwreck-isle/sw-palm-a.glb` | 3564 KB |
| shipwreck-isle | sw-palm-b | `games-src/facelift-3d/shipwreck-isle/sw-palm-b.glb` | 3021 KB |
| shipwreck-isle | sw-palm-c | `games-src/facelift-3d/shipwreck-isle/sw-palm-c.glb` | 3120 KB |
| shipwreck-isle | sw-raft | `games-src/facelift-3d/shipwreck-isle/sw-raft.glb` | 3036 KB |
| shipwreck-isle | sw-shelter | `games-src/facelift-3d/shipwreck-isle/sw-shelter.glb` | 3941 KB |
| short-fuse | bomb | `games-src/facelift-3d/short-fuse/bomb.glb` | 4104 KB |
| short-fuse | pliers | `games-src/facelift-3d/short-fuse/pliers.glb` | 2990 KB |
| sunglaze | plate | `games-src/facelift-3d/sunglaze/plate.glb` | 4611 KB |
| sunglaze | sun | `games-src/facelift-3d/sunglaze/sun.glb` | 2867 KB |
| thornbound | crown | `games-src/facelift-3d/thornbound/crown.glb` | 4440 KB |
| tidewake | junk | `games-src/facelift-3d/tidewake/junk.glb` | 3490 KB |
| tidewake | leviathan | `games-src/facelift-3d/tidewake/leviathan.glb` | 4097 KB |
