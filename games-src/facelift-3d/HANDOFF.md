# Facelift 3D models: approved raw meshes (laptop -> Linux session)

Date: 10 Oct 2026. 42 models, one per item in the TRELLIS tables of `games-src/FACELIFT.md`, each approved by the owner
in a side-by-side review (several items took 2-3 source paintings; only the approved version is here, renamed to the item name).

These are Pixal3D game-size bakes (owner chose Pixal3D over TRELLIS.2): ~20k faces, 1024 px WebP PBR textures,
about 1-1.5 MB each. Small holes in some meshes are accepted (tiny board-game figures, never zoomed). Still too big
for the 30-300 KB budget: steps 1-3 below remain.

## To do on Linux (per FACELIFT.md budgets)
1. Decimate to the triangle budget of the item (Blender Decimate, or `gltf-transform simplify`); keep silhouettes, thin parts collapse first.
2. Bake/resize the texture to 256-512 px (1024 only for hero pieces), WebP; metallic is 0 on almost all of them.
3. `gltf-transform` weld + meshopt + webp; target 30-300 KB per file (see each item's budget in FACELIFT.md).
4. Put the result at the item's target path (`games/<game>/models/...`) and wire it as FACELIFT.md describes (sprites pre-rendered from one fixed 3/4 camera where it says so).
5. Do this first: the meshes are not grounded. Move each so its lowest point sits on y=0 and centre it on x/z; remove any thin stray ground plate the generator left under the base.

## Files
| Game | Item | File | Raw size |
|---|---|---|---|
| crown-city-smash | clampede | `games-src/facelift-3d/crown-city-smash/clampede.glb` | 1135 KB |
| crown-city-smash | dot | `games-src/facelift-3d/crown-city-smash/dot.glb` | 974 KB |
| crown-city-smash | fountain | `games-src/facelift-3d/crown-city-smash/fountain.glb` | 1194 KB |
| crown-city-smash | tower-a | `games-src/facelift-3d/crown-city-smash/tower-a.glb` | 1192 KB |
| crown-city-smash | tower-b | `games-src/facelift-3d/crown-city-smash/tower-b.glb` | 1331 KB |
| crown-city-smash | tower-c | `games-src/facelift-3d/crown-city-smash/tower-c.glb` | 1242 KB |
| crown-city-smash | tower-d | `games-src/facelift-3d/crown-city-smash/tower-d.glb` | 1175 KB |
| doorkick-dungeon | die | `games-src/facelift-3d/doorkick-dungeon/die.glb` | 1524 KB |
| doorkick-dungeon | door | `games-src/facelift-3d/doorkick-dungeon/door.glb` | 1222 KB |
| doorkick-dungeon | hero-grub | `games-src/facelift-3d/doorkick-dungeon/hero-grub.glb` | 1066 KB |
| doorkick-dungeon | hero-morwen | `games-src/facelift-3d/doorkick-dungeon/hero-morwen.glb` | 1074 KB |
| doorkick-dungeon | hero-pip | `games-src/facelift-3d/doorkick-dungeon/hero-pip.glb` | 1012 KB |
| doorkick-dungeon | hero-tansy | `games-src/facelift-3d/doorkick-dungeon/hero-tansy.glb` | 1213 KB |
| lantern-dive | lantern | `games-src/facelift-3d/lantern-dive/lantern.glb` | 1145 KB |
| nebula-aces | na-lancer | `games-src/facelift-3d/nebula-aces/na-lancer.glb` | 1178 KB |
| nebula-aces | na-rock-a | `games-src/facelift-3d/nebula-aces/na-rock-a.glb` | 1021 KB |
| nebula-aces | na-rock-b | `games-src/facelift-3d/nebula-aces/na-rock-b.glb` | 1058 KB |
| nebula-aces | na-rock-c | `games-src/facelift-3d/nebula-aces/na-rock-c.glb` | 970 KB |
| nebula-aces | na-talon | `games-src/facelift-3d/nebula-aces/na-talon.glb` | 1164 KB |
| sands-of-qamar | camel | `games-src/facelift-3d/sands-of-qamar/camel.glb` | 845 KB |
| sands-of-qamar | lamp | `games-src/facelift-3d/sands-of-qamar/lamp.glb` | 972 KB |
| sands-of-qamar | meeple | `games-src/facelift-3d/sands-of-qamar/meeple.glb` | 1003 KB |
| sands-of-qamar | palace | `games-src/facelift-3d/sands-of-qamar/palace.glb` | 1108 KB |
| sands-of-qamar | palm | `games-src/facelift-3d/sands-of-qamar/palm.glb` | 1872 KB |
| shipwreck-isle | sw-carpenter | `games-src/facelift-3d/shipwreck-isle/sw-carpenter.glb` | 1419 KB |
| shipwreck-isle | sw-cook | `games-src/facelift-3d/shipwreck-isle/sw-cook.glb` | 1215 KB |
| shipwreck-isle | sw-explorer | `games-src/facelift-3d/shipwreck-isle/sw-explorer.glb` | 1232 KB |
| shipwreck-isle | sw-fire | `games-src/facelift-3d/shipwreck-isle/sw-fire.glb` | 957 KB |
| shipwreck-isle | sw-friday | `games-src/facelift-3d/shipwreck-isle/sw-friday.glb` | 1136 KB |
| shipwreck-isle | sw-palisade | `games-src/facelift-3d/shipwreck-isle/sw-palisade.glb` | 1222 KB |
| shipwreck-isle | sw-palm-a | `games-src/facelift-3d/shipwreck-isle/sw-palm-a.glb` | 1375 KB |
| shipwreck-isle | sw-palm-b | `games-src/facelift-3d/shipwreck-isle/sw-palm-b.glb` | 1281 KB |
| shipwreck-isle | sw-palm-c | `games-src/facelift-3d/shipwreck-isle/sw-palm-c.glb` | 979 KB |
| shipwreck-isle | sw-raft | `games-src/facelift-3d/shipwreck-isle/sw-raft.glb` | 1223 KB |
| shipwreck-isle | sw-shelter | `games-src/facelift-3d/shipwreck-isle/sw-shelter.glb` | 1704 KB |
| short-fuse | bomb | `games-src/facelift-3d/short-fuse/bomb.glb` | 1359 KB |
| short-fuse | pliers | `games-src/facelift-3d/short-fuse/pliers.glb` | 1667 KB |
| sunglaze | plate | `games-src/facelift-3d/sunglaze/plate.glb` | 851 KB |
| sunglaze | sun | `games-src/facelift-3d/sunglaze/sun.glb` | 944 KB |
| thornbound | crown | `games-src/facelift-3d/thornbound/crown.glb` | 1197 KB |
| tidewake | junk | `games-src/facelift-3d/tidewake/junk.glb` | 1166 KB |
| tidewake | leviathan | `games-src/facelift-3d/tidewake/leviathan.glb` | 1475 KB |
