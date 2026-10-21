# BENCH_2K: our game next to LEGO 2K Drive (2026-10-21, reviewer)

Our shots: trunk build rv23p (= beta.147 + flag-off core-loop lanes), 852x393 touch, SwiftShader lab (motion is slower than a phone, so speed-dependent effects are under-shown).
References: LEGO 2K Drive Steam store screenshots (store.steampowered.com/app/1451810) and the 2023 reveal screenshots (techeblog.com, from 2K's press set). They are stored small, for internal side-by-side comparison only (CLAUDE.md rule 4).

| View | Side by side | Score /10 | What the gap is |
|---|---|---|---|
| Free-roam street | `shots/bench/sbs_freeroam.jpg` | 4 | 2K: layered vista, water, ramps, loops, traffic in view, terrain height. Ours: one wide flat road, box buildings, flat empty lawns; nothing to aim at. |
| Race start / race | `shots/bench/ours_race_start.jpg` vs `ref2k_race_boost.jpg` | 4 | The neon track reads well. Our car is chunky and flat-shaded; no rivals jostling in frame; no speed feel. |
| Power-up use | `shots/bench/sbs_race_powerup.jpg` (+ `ours_race_turbo.jpg`) | 2 | 2K: huge blue boost jets, sparks, item bubbles, speed lines. Ours: TURBO shows no visible effect in the frame; ROCKETS are two soft orange puffs. |
| Street life | `shots/bench/sbs_street_life.jpg` | 3 | 2K puts big characterful minifigs and props right by the road. Ours: minifigs and stalls are small and set back; streets read empty at driving distance. |
| Car look | `shots/bench/sbs_car_look.jpg` | 3 | 2K: glossy plastic, specular highlights, glowing headlights, studs. Ours: matte, flat colours, no light emission. |
| Phone HUD | `shots/bench/ours_fra_freeroam.jpg` | 7 | The HUD-6 free-roam HUD is now clean (2K-like). The race HUD is clear. Minimap is too small to read (38-47 px). |

Overall visual parity: about 3.8/10 (mean of the six views).

## The 5 biggest visible gaps (ranked by what a player notices in the first minute)
1. **Power-ups and boost have almost no visual punch.** TURBO is invisible, rockets are blobs. 2K's core loop is boost jets, trails and item hits. Add jet flames + speed lines + FOV kick on boost, and a readable projectile/impact for each item.
2. **No speed feel.** There is no motion blur, no speed lines, no camera FOV/shake at speed, and the roads are very wide. 70 km/h looks like 30. Add FOV and lines at speed and narrow the visual road width (kerb props closer).
3. **The free-roam world is flat and empty in frame.** Lawns, box buildings and no landmarks or ramps in the first view. 2K always frames something to drive at. Put a ramp, landmark or water in the spawn view, and use terrain height in the core.
4. **Car materials look matte.** No gloss, no specular, no emissive headlights or taillights. A clearcoat/specular pass on the car and NPC cars, plus emissive lights, gives the LEGO plastic look at low cost.
5. **Street life is too small and too far.** Minifigs and props sit back from the kerb and are small at chase-cam distance. Pull bigger props and minifig groups to the kerb on core streets (ties to the cl-L1/L2 lanes).

Separate from looks, and higher priority (Alex's 4.5/100): invisible cars and driving through buildings. That acceptance list is being sent to the solid-cars / solid-buildings lanes.
