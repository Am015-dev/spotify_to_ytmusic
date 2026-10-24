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
