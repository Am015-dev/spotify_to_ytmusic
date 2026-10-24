# W215b: critic round 3 on the live pure look (base alex/brave-carson-rbpmlk 843b787)

Code: `parts/render/pure.js`, plus two lines in `parts/render/pureboss.js` (W216's enemy-shot and pickup overrides).
1. Phone backdrop at brightness .42 (it was .55). The phone painting is brighter than the PC strips, which stay at .65.
2. Enemy fire is orange/red only. The yellow needle (pureboss.js `ebul`) is the owner's orange shell drawn as a long bolt, with the
   needle picture (made white once) as its core. The pink orbs were the player's pulse shots: the player now uses only white and cyan.
   Every weapon picture except the cyan arc / frost / wave is drawn as the white `fx-shot-std` streak.
3. Player stream: each streak trails back toward the nose, up to 170 world px (stateless: distance from the ship). The stream now
   starts at the ship instead of 300 px ahead of it.
4. Muzzle burst at 0.3x size (it was 0.5x).
5. HUD clipped to its edge bands under purelook: phone top strip (62*HK), PC top 120 px and bottom 130 px. Score pops, chevrons
   and arcs that the HUD wrappers draw over the field are cut off. Shards are the owner's spinning coin again in W216's pickup override.
Render-only: the sim never calls render. The page builds and runs with no page errors at 390x763 and 1440x860.

Shots: stage 1, seed 7, t = 27.5 s (3 enemies, 6 enemy shots), one render after the pictures load. `phone-stage1.webp` 390x763,
`pc-stage1.webp` 1440x860. Benchmark: Ref A, https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg

| # | test | score | what still fails |
|---|---|---|---|
| 1 | Owner art only | 7 | The pink "^" pickup (owner `pk-up`) and the "B" letter (stage1fun) still sit in the field; only the letter is code. |
| 2 | Grayscale | 8 | The backdrop is the darkest plane on both shots; ships, streaks and orange bolts separate by value. |
| 3 | Silhouette | 7 | Long player dart vs boxy gunships. The gunships are still small next to Ref A. |
| 4 | Find the player | 8 | Outline, engine light and white streaks from the nose. |
| 5 | Bullets | 8 | Player: white/cyan streaks. Enemy: orange bolts and shells. No shared hue. |
| 6 | Clutter | 8 | Field marks: "^" pickup and "B" (at most 2). |
| 7 | Benchmark | 6 | Enemies are small and the streaks are long and thin, not chunky glowing shots like Ref A's. |

## Round 4: owner verdict 20:10 UTC ("the spaceship looks like a sticker on the wallpaper, same with enemies, enemies are not visible at all")
The shots above are from this round (stage 1, seed 7, t = 27.5 s).
1. **Depth.** Every plane behind the ships is drawn from a copy made once per picture with blur, lower brightness and saturate .7.
   The phone backdrop is at blur 1.8 px / brightness .42. On PC: backdrop 3 px / .5, far 2.5 px / .55, mid 1.5 px / .62, near strip 1 px / .75.
   Parallax is .03 / .06 / .3 / 1.1, so the far strip now moves too. Nothing behind the ships is as sharp or as bright as they are.
2. **Shared light.** `PURL.lit` bakes each sheet frame once per frame and size (cache of up to 600). On top of the owner's frame it
   adds a soft lift on the key-light side (the sprite's top, the neon sky), a slight under-shade on the far side and a thin cyan rim:
   the silhouette minus itself shifted away from the light. The player and every enemy use the same light. The player's white
   outline is gone; it was the sticker look. Engine light: the owner flame sheets (enemies) and fx-engine (player).
3. **Enemy visibility.** Visual size is at least 0.75x the player's drawn frame. Hitboxes and gameplay are unchanged: drawing
   only, and the sim never calls render. Value contrast against the darkened backdrop (linear luminance, brighter half of the enemy
   box vs the backdrop median beside it): PC 3.7:1 and 6.4:1, phone 3.3:1 and 4.2:1, all at or above 3:1. Before this round: PC 2.4,
   phone 2.95.

### impeccable critique (flight screen; heuristic structure from reference/critique.md, colour from reference/colorize.md)
- [P0, fixed] Figure/ground: the ships had less value than the painting behind them, so the eye read the wallpaper first. Fix: depth
  of field plus value steps (backdrop .4-.5, ships lit).
- [P1, fixed] Colour as signal (colorize, "rarity gives an accent force"): white/cyan is the player only, orange the enemies only,
  cyan rim the shared light. The pink player shots and yellow needles that broke this are gone.
- [P1, fixed] Sticker edges: a hard light outline with no matching light in the scene. Replaced by a one-sided rim from the key light.
- [P2, open] The "B" letter and the pink "^" pickup are the only marks in the field that are not ships or shots.
- [P2, open] Player streaks are long, thin lines. Benchmark shooters use shorter, chunkier glowing shots. This needs an owner shot
  picture at that shape, not code.
### design-review (hierarchy, consistency, fidelity)
- Hierarchy: player > enemies > enemy shots > backdrop now holds on both screens. The HUD sits only at the edges.
- Consistency: one light, one scale band (player 1.6x phone / 1.3x PC; enemies at least 0.75x the player), one shot family per side.
- Fidelity: the owner's art is drawn as made. Code adds only blur and value on the backdrop and a light pass on the ships.
- The skills' DOM detector and live-server steps do not apply to a canvas game, so the screenshots above are the evidence.

### game-look strict critic pass (both screens)
| # | test | phone | PC | note |
|---|---|---|---|---|
| 1 | Owner art only | 7 | 7 | The light pass is code, as the brief asks. The code-drawn "B" letter remains. |
| 2 | Grayscale | 8 | 8 | Contrast 3.3-6.4:1 against the backdrop. |
| 3 | Silhouette | 7 | 7 | Long dart vs rotor gunships; enemies at least 0.75x the player. |
| 4 | Find the player | 8 | 8 | Engine light, white streaks from the nose, the rim on a soft backdrop. |
| 5 | Bullets | 8 | 8 | Player white/cyan, enemy orange; no shared hue. |
| 6 | Clutter | 8 | 8 | At most 2 non-ship marks. |
| 7 | Benchmark (Ref B, painted depth: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606730/ss_d3795f7761dd1e2d96541ce7b60ccf521a06c358.1920x1080.jpg) | 7 | 7 | Depth and light now match in kind. The shots are still thinner than the benchmark's. |
