# BENCH_2K: our game next to LEGO 2K Drive (2026-10-21, reviewer)

Our shots: trunk build rv23p (= beta.147 + flag-off core-loop lanes), 852x393 touch, SwiftShader lab (motion is slower than a phone, so speed-dependent effects are under-shown).
References: LEGO 2K Drive Steam store screenshots (store.steampowered.com/app/1451810) and the 2023 reveal screenshots (techeblog.com, from 2K's press set). They are stored small, for internal side-by-side comparison only (CLAUDE.md rule 4).

| View | Side by side | Score /10 | What the gap is |
|---|---|---|---|
| Free-roam street | `shots/library/fra/freeroam/sbs_fra_freeroam_vista_01.jpg` | 4 | 2K: layered vista, water, ramps, loops, traffic in view, terrain height. Ours: one wide flat road, box buildings, flat empty lawns; nothing to aim at. |
| Race start / race | `shots/library/any/race/ours_any_race_start_01.jpg` vs `shots/library/any/race/ref2k_any_race_boost_01.jpg` | 4 | The neon track reads well. Our car is chunky and flat-shaded; no rivals jostling in frame; no speed feel. |
| Power-up use | `shots/library/any/boost/sbs_any_boost_powerup_01.jpg` (+ `ours_any_boost_turbo_01.jpg`) | 2 | 2K: huge blue boost jets, sparks, item bubbles, speed lines. Ours: TURBO shows no visible effect in the frame; ROCKETS are two soft orange puffs. |
| Street life | `shots/library/fra/street-life/sbs_fra_street-life_minifig_01.jpg` | 3 | 2K puts big characterful minifigs and props right by the road. Ours: minifigs and stalls are small and set back; streets read empty at driving distance. |
| Car look | `shots/library/any/cars/sbs_any_cars_look_01.jpg` | 3 | 2K: glossy plastic, specular highlights, glowing headlights, studs. Ours: matte, flat colours, no light emission. |
| Phone HUD | `shots/library/fra/freeroam/ours_fra_freeroam_spawn_01.jpg` | 7 | The HUD-6 free-roam HUD is now clean (2K-like). The race HUD is clear. Minimap is too small to read (38-47 px). |

Shot library: every benchmark view has one ID in `docs/shots/library/INDEX.md` (`<source>_<city>_<category>_<subject>_<nn>`); re-shoot with `node tools/shot.js <ID> <url>` (or `--from img`, `--list`) instead of making a new file or folder.

Overall visual parity: about 3.8/10 (mean of the six views).

## The 5 biggest visible gaps (ranked by what a player notices in the first minute)
1. **Power-ups and boost have almost no visual punch.** TURBO is invisible, rockets are blobs. 2K's core loop is boost jets, trails and item hits. Add jet flames + speed lines + FOV kick on boost, and a readable projectile/impact for each item.
2. **No speed feel.** There is no motion blur, no speed lines, no camera FOV/shake at speed, and the roads are very wide. 70 km/h looks like 30. Add FOV and lines at speed and narrow the visual road width (kerb props closer).
3. **The free-roam world is flat and empty in frame.** Lawns, box buildings and no landmarks or ramps in the first view. 2K always frames something to drive at. Put a ramp, landmark or water in the spawn view, and use terrain height in the core.
4. **Car materials look matte.** No gloss, no specular, no emissive headlights or taillights. A clearcoat/specular pass on the car and NPC cars, plus emissive lights, gives the LEGO plastic look at low cost.
5. **Street life is too small and too far.** Minifigs and props sit back from the kerb and are small at chase-cam distance. Pull bigger props and minifig groups to the kerb on core streets (ties to the cl-L1/L2 lanes).

Separate from looks, and higher priority (Alex's 4.5/100): invisible cars and driving through buildings. That acceptance list is being sent to the solid-cars / solid-buildings lanes.

## First 120 s of a fresh PLAY (phone 852x393, gas held, 2 s polls)
- Frankfurt (`shots/library/fra/reveal/ours_fra_reveal_first120_01.jpg`): loading card (credits), "Hold GAS · steer" pill, BOOST + BRICKBASH meter once moving, objective line cycling Stud Rush → **Garage → 52 m** → Takedown → ramp ring, **"Garage · TAP TO OPEN" prompt that stays up while driving at 88-134 km/h**, "+COMBO ×2", **"WRONG VEHICLE FOR DIRT ⟳" with an automatic switch to the buggy**, a 3D beacon ring, then (~185 s) the STUD RUSH timer panel and the "OSTEND 0% COMPLETE" area banner.
- Athens (`shots/library/ath/popups/ours_ath_popups_storycard_01.jpg`): a **modal text-wall story card ("CHAPTER 1 · WELCOME TO ATHENS", Eleni Mavrou, CONTINUE ▶) blocks play for the whole 120 s**; drive-first only covers Frankfurt.
- A 2K Drive player would not see: the Athens text wall, the garage prompt at speed, the forced vehicle swap toast, auto-routing to the Garage, and the always-on objective/area text.
- Note: a player page ignores ?city=ath; the city comes from localStorage mho_city@<slot>.
