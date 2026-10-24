# Critic 2: flight look, live build vs nr/W215b-flight (W221, 24 Oct 2026, 20:25 UTC)

⚠️ DEGRADED: single-context. The impeccable critique ran as one pass, not two sub-agents, and its detector was skipped: it reads web
markup, and the play field is one canvas. The design-review checklist was run against the frames below. No .design/ brief exists, so
the brief is the owner's 20:10 note: "the spaceship looks like a sticker on the wallpaper, same enemies, they are not visible at all".

Builds: live `alex/brave-carson-rbpmlk` b7ca362 and `nr/W215b-flight` 3b999e0, each built with `NR_OUT` (deploy path untouched).
Frames: stage 1, human bot, seed 1, `?sim=1&all=1` (pure look is the default), stage frame at t = 27.5 s, boss frame 6-8 s into the boss
fight. Files: `review-shots/W221/<build>-<stage|boss>-<WxH>.webp`. Grayscale copies were made locally and not committed.

Reference frames (URLs only, no game is named):
- R1, a painted 3D horizontal shooter with a busy orb field over a detailed city:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606730/ss_9c34c404470abf6881913c0ca9b439e0be49201a.1920x1080.jpg
- R2, a pixel-art horizontal shooter boss moment:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/891790/ss_0ebeba95f20ace13cfcb861b760cd98b9ddfd969.1920x1080.jpg
- R3, the W215b "Ref A" frame:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg

What all three reference frames do: the backdrop sits in the low-middle values with soft edges. The actors carry the hardest edges,
the brightest values and their own light: an engine flame, a rim light, and glow spilling on the haze around them. The enemies are
at least a quarter of the player's size and are lit from the same side as the player.

## Scores (0-10; SHIP needs every row >= 7 on both phone and PC)

| # | Test | Live phone | Live PC | W215b phone | W215b PC | What the frames show |
|---|---|---|---|---|---|---|
| 1 | Owner-art | 7 | 5 | 7 | 6 | Live PC: the "SPLINTER 9 BARS" weapon panel sits inside the field at y 165-220. W215b PC: a pickup ring and two coins float mid-sky. Both PC builds have teal shard diamonds scattered across the field. |
| 2 | Grayscale | 3 | 4 | 4 | 5 | In grayscale the opera house and the tower windows are the brightest marks on the phone. The enemies are mid-grey on a mid-grey tower and disappear. W215b's darker phone backdrop (.42) helps the sky, not the towers. |
| 3 | Silhouette | 3 | 6 | 3 | 6 | Phone enemies are about 20x40 px lumps with no readable shape. The PC gunships read as two kinds. The phone boss is hidden by its own shield clip (see 9). |
| 4 | Find the player | 5 | 7 | 6 | 6 | Phone: a 25x80 px blue-violet dart in the backdrop's own hue, pressed to the left edge. W215b's white streaks point to it. W215b PC: in the stage frame the player flies under the score box. |
| 5 | Bullets | 6 | 6 | 4 | 5 | The orange enemy orbs are good everywhere. Live player shots are pink, the same hue as the hit stars and the neon. W215b player streaks are 150-300 px hairlines fanned at angles, which read as scratches or enemy lasers and cross the enemy area. |
| 6 | Clutter | 7 | 5 | 6 | 6 | Phone: the three big ringed buttons take 12% of the height. That is fine as HUD but heavy. PC: weapon panel, shards, coins. |
| 7 | Benchmark side by side | 2 | 3 | 3 | 3 | R1 reads in half a second. Ours reads as a detailed poster with small flat cut-outs on top. |
| 8 | **STICKER** (depth, shared light, grounding) | 2 | 3 | 2 | 3 | No ship casts or receives light: no engine glow on the haze, no rim light from the city's pink and teal key, no shadow or haze between the ship and the towers. The ship outlines are crisp. The phone painting is a fine-grained illustration about 3x denser than the sprites, so the ships look pasted on. Enemies at 1/5 of tower width make the city read as near and the ships as tiny decals in front of it. |
| 9 | **ENEMY VISIBILITY** | 2 | 4 | 3 | 4 | Phone stage: two enemies, both dark blue-grey over the dark-teal tower, found only by their pink hit stars. Phone boss: the body is fully covered by the additive cyan `fx-shield` blob (pureboss.js:13, `e.r*3.2*.8`), so you see a cloud, not a ship. PC: gunships are mid-dark over mid-dark buildings. The PC boss is the one readable enemy, but it is a pale flat box. |

Weakest rows: STICKER 2, ENEMY VISIBILITY 2, benchmark 2. Both builds have rows under 7 on both phone and PC.

## Top findings quoted from the passes

- impeccable critique (P0): "the backdrop is the hero and the actors are an afterthought". The most detailed, highest-contrast surface
  on screen is the painting. Hierarchy is inverted for a game whose task is "find yourself, find the threat".
- impeccable critique (P1): "same hue family for player, player shots, hit stars and the city neon". Nothing in colour says
  "this is you" or "this is a threat", except the orange enemy orbs, which are the one thing that works.
- design-review, Must fix: visual hierarchy fails. The most important content (player, enemies) is not the most prominent.
  Mobile: the phone build is a different painting at a different texel density from the sprites, so the two never feel like one
  picture.
- design-review, Should fix: the PC in-field weapon panel and the phone boss shield break the "owner art only, nothing over the field" brief.

## The three worst problems and the exact fixes

1. **Enemies are invisible (rows 2, 3, 9).**
   - In `parts/render/pure.js:32` (`foe`), draw every foe sheet twice. First pass: a 2-3 px outline in the backdrop's darkest
     colour (`#0b0614`) or a soft dark halo, using the sheet drawn with `filter: brightness(0)` at about 1.08x scale, alpha .7.
     Second pass: the sheet itself with `filter: brightness(1.35) saturate(1.2)`.
   - Raise the phone foe clamp. Today it is `max(K*fw*1.25, pl*.55)`. Make it `pl*.8` on the phone (wcv!==cv), so a phone enemy is
     at least 45 px long.
   - Give enemies one warm accent the backdrop lacks: a tiny additive orange engine clip from `fx-*`, the same family as their
     orange shots, so threat equals warm.
   - In `parts/render/pureboss.js:13`, the shield must sit behind the boss at alpha .35, scale `e.r*2.2`, so the body stays on top
     and readable.
2. **Ships look like stickers (row 8).**
   - Add shared light in `pure.js` `player()` (line 35) and in `foe()`:
     - a rim light: the sheet re-drawn with `'lighter'`, alpha .25, offset 1.5 px toward the screen's key light (top-right pink
       neon), tinted by the backdrop's key colour through a cached tinted copy, the same way as `dim()`;
     - an engine glow pool: the owner's flame clip blurred into the haze behind the ship, `'lighter'`, alpha .3, radius 1.5x the
       ship height.
   - Push the backdrop back. Phone `dim()` brightness .42 to .32 and saturate .85 to .6 for the painting only.
   - Add one fixed haze gradient (owner fog art if present, else a single top-to-bottom backdrop-colour veil at alpha .25) drawn
     between the backdrop and the play layer. This is the depth cue every reference has.
   - Phone painting: downscale it to sprite texel density (render at .5x, upscale with smoothing) so its line detail no longer out-sharpens
     the ships.
3. **Player shots are wrong in both builds (rows 4, 5).**
   - Live: pink pulses share the hue of the hit stars and the neon. W215b: hairline streaks up to 170 world px, fanned at angles,
     read as scratches.
   - Fix in `pure.js` shots: 40-70 px long, 6-8 px thick, white core with a cyan halo (the `fx-shot-std` streak drawn twice:
     `'lighter'` halo at 1.6x width, alpha .5), always parallel to the ship's nose with no fan.
   - Keep orange for enemies only.
   - Move the PC weapon panel and pickups' resting area out of the field: panel into the bottom-left HUD box, and nothing drawn
     above y 120 except HUD.

## Verdict

| Build | Verdict | Why |
|---|---|---|
| Live `alex/brave-carson-rbpmlk` b7ca362 | **REDO** | 7 of 9 rows under 7 on the phone, 6 on PC. STICKER 2/3 and ENEMY VISIBILITY 2/4 confirm the owner's report. |
| `nr/W215b-flight` 3b999e0 | **REDO, do not deploy** | Slightly darker phone sky and a findable player, but its fanned hairline streaks make bullets worse (4/5). Enemies and the sticker look are unchanged. |

The owner's question, "did you run impeccable and design skills and say this is ok to deploy?": no frame here passes, so neither
build should have been called deployable. The earlier W215b self-score (rows 7-8) is 3-4 points higher than these frames show.
