# W215: the pure look is the flight default; player ship and shots readable

Code: `parts/render/pure.js` only.
- `RET.purelook` is ON by default. `?purelook=0` gives the old layered look. (`?pure=0` is still only the music flag.)
- Player ship: the owner's `ship-<id>/flame` sheet at 1.35x the enemies' texel scale (inside the 1.5x band; it was 1.1x). It has a
  1 px light outline, as the player ship has in benchmark Ref A, and the owner's `fx-engine` picture added at the tail as the engine
  light, with a steady flicker. There is no ring, halo, glow disc or hitbox dot: the benchmark frames show none.
- Player shots use only cool hues (white, cyan, violet, pink): `fx-shot-std` (drawn twice and 1.9x longer, so it reads at game size),
  `fx-shot-hv` / `fx-shot-ec`, and the cool `fx-w-*-bullet` pictures. On-beat (perfect) shots are the same white streak, 1.3x longer.
  The gold perfect picture and the warm weapon pictures (beat, disc, flame, orbit, shell, storm, swarm) were in the lime-to-orange
  band that enemy shots use, so they are not drawn. Player shots are drawn under enemy shots and under the player.
- Enemy needle (`fx-bullet-needle`) is drawn twice, 10x r long and 2.4x thicker, because at game size it could not be seen. This is
  one line in the enemy-bullet loop; W216 owns enemy orbs, so check this line when merging.

Shots: stage 1, seed 7, scripted path, stepped in sim mode until there are at least 3 enemies and 6 enemy shots on screen
(t = 27.5 s), then one `render()` call. `phone-stage1.webp` is 390x763 (rendered at DPR 3, scaled down). `pc-stage1.webp` is 1440x860.

Gameplay: unchanged, because the sim never calls render. simhunt stage 1 (3 seeds x human + parked) found the same kinds with the
default look and with `?purelook=0`: no severe kinds; HUD-band intrusions (drone, gunship, turret) and empty stretches in both.
With the old look there are also text overlaps. The draw-site list in VISUAL-INVENTORY.md is stale for both looks.
phone-check: 390x763, 375x553 and 844x390 PASS. The three rotation scenarios crash inside the harness (`setViewportSize: Protocol
error (Browser.setWindowBounds)`) before the game is involved.

## Round 2: critic W219 (round 1 scored find-player 1, bullets 3, grayscale 3, silhouette 4, benchmark 2 on nr/W214-pure)
- The player is now 1.6x the enemies' texel scale on the phone and 1.4x on PC (PURL.PK).
- Player shots: the standard streak is 2.4x longer and 1.7x thicker, with its core drawn again additively. Weapon shot pictures are 44 wide.
- The backdrop (bg, far, mid) is drawn from a copy made once per picture with brightness .65 and saturate .85. The near strip and
  every sprite are not filtered. The shots above are from round 2. Render-only change: the sim does not call render, so simhunt is unchanged.

## Round 3: critic W219 round 2 (owner-art 5, grayscale 6, silhouette 5, find-player 7, bullets 4, clutter 6, benchmark 4)
- Enemy needles are the owner's orange shell picture drawn as a long bolt, with the needle picture (made white once) as a hot core.
  They are in the orange family of the enemy shells and no longer look like the white player streaks.
- The player muzzle burst (`muzzle` / `w-*-muzzle` fx) is drawn at half size. It is render-only: the fx list is not part of the sim.
- Shards are the owner's spinning `pk-coin` sheet (22 px), so they read as pickups, not teal diamonds.
- Power-up pickups show only the owner's `pk-<kind>` picture: no hex, dashed ring, glow or caption.
- Enemies are at least 0.55x the player's drawn length. The player is 1.3x the enemies' texel scale on PC and 1.6x on the phone.
- The phone backdrop is at brightness .55 (it is a brighter painting than the PC strips). The PC backdrop stays at .65.
- The "B" letter (stage1fun) is still drawn in the field by code. That is not this task's file.
Shots above are from round 3 (same seed and moment; the shot renders twice so lazily loaded pictures show).

## Strict critic pass (game-look). Benchmark: Ref A, https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg

| # | test | score | what still fails |
|---|---|---|---|
| 1 | Owner art only | 7 | Power-ups and shards are owner pictures now. The cyan "B" letter (stage1fun) is still code text in the field. The player outline is code, but it matches the benchmark. |
| 2 | Grayscale | 8 | With the backdrop at .65 value, the player, the enemies and every shot are the brightest things on screen. |
| 3 | Silhouette | 7 | The long player dart and the round drones/gunship read as different shapes. Enemies are small next to Ref A's. |
| 4 | Find the player (phone) | 8 | The ship is about 1/7 of the screen width, and its outline, engine light and fan of white shots mark it at once. The ship's own colours are still blue on a blue city. |
| 5 | Bullets | 7 | Player shots are white, cyan and pink; enemy shots are orange bolts with a white core and lime orbs. The pink pulse teardrops are the player's and the closest to a shared hue. |
| 6 | Clutter | 8 | Field marks: the "B" letter (1). The HUD is at the edges. |
| 7 | Benchmark side by side | 6 | Ref A has a few big, bright, outlined actors on a quiet backdrop. The backdrop is now quieter, but the enemies are still small, and no shot reaches Ref A's chunky, glowing bullets. |

Not every row is at 7 or higher. Rows 1 and 7 are below, and fixing them is outside this task:
1. Draw the pickups ("B" letter, power-up hex and caption) from owner pictures, with no text in the field.
2. Enemy actors at the player's scale, or larger pictures for the small drones (art or size decision, for the owner).
3. Done in round 2 by dimming the backdrop in code. A darker painted variant from the owner would look better than the filter.
