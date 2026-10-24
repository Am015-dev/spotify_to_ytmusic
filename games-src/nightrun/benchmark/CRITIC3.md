# Critic 3: flight W224 and foot W225, independent frames (W226, 24 Oct 2026)

⚠️ DEGRADED: single-context. The impeccable critique ran as one pass, not two sub-agents. Its detector was skipped because it reads web
markup and the play field is a single canvas. The design-review checklist was run against the frames below. No .design/ brief exists,
so the brief is the owner's 24 Oct note. Flight: "the spaceship looks like a sticker on the wallpaper, enemies not visible at all".
On foot: "props and background not blending, moves are shit, bullets ugly".

The workers' own scores were not used. W224's README and its probe test frame t = 27.5 s. These frames are taken at a different
moment on purpose.

## Flight: `nr/W224-flight` a341b44

How it was built: `NR_OUT=<scratch> python3 games-src/nightrun/parts/build.py` (the deploy path was not touched). Stage 1, human bot,
seed 1, stepped sim `?sim=1&all=1&nomusic=1`.
- Stage frame: the first frame at t >= 41 s with 2+ enemies on screen (taken at t 45.1).
- Boss frame: 6 s into the boss fight.

The measurements come from W224's own probe, `qa/w224probe.js`, copied with only the frame time changed. They are WCAG grayscale
contrast of each sprite against a 6 px ring of pixels around it, and enemy length divided by player length.

Frames: `review-shots/W226/w224-{phone,pc}-{stage,boss}.webp` (phone 390x763, PC 1440x860).

Reference frames (URLs only; I downloaded and looked at R1 and R2):
- R1, a 3D horizontal shooter, boss and bullet field over a detailed interior:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606730/ss_9c34c404470abf6881913c0ca9b439e0be49201a.1920x1080.jpg
- R2, a pixel-art horizontal shooter boss moment:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/891790/ss_0ebeba95f20ace13cfcb861b760cd98b9ddfd969.1920x1080.jpg
- R3, a painted horizontal shooter (the earlier critics' Ref A):
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg

What R1 and R2 do that we do not:
- The backdrop is one dark, low-contrast, near-monochrome plane: R1 is grey-green, R2 is charcoal.
- Every actor and every bullet is a saturated hue the backdrop never uses (orange, blue, green, crimson), with a white-hot core.
- The boss is about 3x the player's size, warm-lit, and the clearest object on screen.
- There is no text in the play field.

### Measured (W224 probe, my moments)

| Frame | Enemy contrast vs ring (pass >= 3:1) | Enemy length / player |
|---|---|---|
| Phone stage t 45.1 | 1.85 | 0.55 and 0.55. W224 claims >= 0.8; the clamp did not apply. |
| PC stage t 45.1 | 1.29, 1.47, 1.53, 1.80, 1.92, 2.20, 5.85 (only 1 of 7 passes) | 0.62 |
| Phone boss | 4.20 (pass) | n/a |
| PC boss | 2.39 (fail) | n/a |

### Scores (0-10; SHIP needs every row >= 7 on both devices)

| # | Test | Phone | PC | What my frames show |
|---|---|---|---|---|
| 1 | Owner-art | 6 | 4 | Both: a big code-drawn grade letter ("B", "A") floats in the top third of the field. PC also shows the weapon card ("ECHO LV1, 5 BARS"), still at y 165-220 inside the field, teal shard diamonds scattered mid-sky, and a yellow hex pickup icon. |
| 2 | Grayscale | 4 | 3 | Better than Critic 2: the player is now the brightest actor on the phone. The enemies are still mid-grey on mid-grey towers (contrast 1.3-2.2). The lit opera house and the tower windows are still brighter than any enemy. |
| 3 | Silhouette | 4 | 5 | Phone foes are 23x52 px lumps. The phone boss is a round mass with a cyan sphere over its middle. The PC gunship reads as a ship, but the PC boss is a flat pale box. |
| 4 | Find the player | 7 | 7 | A white-violet dart with a pink engine trail, the brightest moving thing on both devices. This is the one row that passes. |
| 5 | Bullets | 5 | 6 | Boss phase: the orange enemy orbs are good. Stage phase: the phone enemy shots are 4 px pink dots that vanish into the neon. Player bolts are white and parallel now, but stray bolts also streak across the top third of the field, far from the ship. |
| 6 | Clutter | 6 | 4 | Phone: the grade letter, plus three large ring buttons that take 12% of the height. PC: grade letter, weapon card, shards, hex pickup and ring icon, so more than 3 non-art marks at once. |
| 7 | Benchmark side by side | 3 | 3 | Next to R1 and R2, ours is still a bright detailed poster with small, flat, mid-value cut-outs on top. |
| 8 | **STICKER** | 3 | 4 | The engine trail helps the player. The rim light is not visible at play size. The backdrop is darker on PC, but its line detail is still finer and sharper than the sprites on the phone. Enemies cast no light, and nothing shows depth between ship and city. |
| 9 | **ENEMY VISIBILITY** | 3 | 4 | Phone stage: two enemies, one found only by its engine flame, the other lost against the tower. Phone boss: a cyan sphere still covers the body's centre. PC: gunships at contrast 1.3-1.9; the boss at 2.39 is a pale box behind a shield ring. |

Compared with Critic 2 (live build): grayscale is +1, find-the-player is +1 to +2, bullets are about the same, and STICKER and
ENEMY VISIBILITY are +1 each. No row reaches 7 except find-the-player.

### Top findings quoted from the passes

- impeccable critique (P0, unchanged from Critic 2): "the backdrop is still the hero". The most detailed and highest-value surface is
  still the painting. The halo plus 1.6x brightness on enemies is too weak to invert that, because the enemy sheets are small and
  mid-toned to begin with.
- impeccable critique (P1): "a score-screen letter in the sky". The 16-bar grade pop is the largest glyph in the play field, and in
  grayscale it is brighter than every enemy.
- design-review, Must fix: visual hierarchy fails. The threats are the least prominent actors. On PC, HUD text (the weapon card)
  sits inside the field the enemies fly through.
- design-review, Should fix: enemy and pickup colours are not reserved. Pink enemy dots share the neon hue, and the teal shards
  share the tower windows' hue.



## The three worst problems and the exact fixes

1. **Enemies are still invisible (flight rows 2, 3, 9).** The W224 halo approach is not enough. Fix the cause: enemy value.
   - Fix the phone clamp in `parts/render/pure.js:36` (`foe`). `mn=this.pl()*(wcv!==cv?.8:.55)` takes the .55 branch in a 390x763
     run (measured .55). Key it on the phone layout (`W<700`, or the same flag `open()` uses for touch), not on `wcv!==cv`.
   - In `pure.js:43` (`cel`, kind 'b'), raise `brightness(1.6)` to a value-target pass instead: shift each enemy strip toward a warm
     key, for example `sepia(.35) saturate(2) brightness(2.2)`. Check with the probe at both t 27.5 and t 45 that every enemy is
     >= 3:1. Enemies must be the warmest objects on screen, matching their orange orbs. Today they are cold blue-grey on cold
     blue-grey.
   - Phone boss: the cyan sphere drawn over the body is not `pureboss.js:13`, because the shield now sits behind the body. Find the
     clip drawn after `SPR.boss` (`pureboss.js:20`: the attack or charge fx) and draw it behind the body or at alpha <= .35. PC boss:
     same value pass as the foes. Its body contrast of 2.39 must reach 3:1.
   - Enemy stage shots: use the orange `~o` copy (`pure.js:71`, `hot()`) for every enemy shot, not only the boss orbs, at
     >= 8 px on the phone.
2. **The field is cluttered with code-drawn marks (rows 1, 6).**
   - Grade pop: `parts/profile/ret.js:263` (`RET.pop` per 16 bars). Under pure flight, skip it in-run and show it on the run-end
     screen, or move it into the top HUD strip at <= 18 px.
   - The PC weapon card (name, LV, n BARS) is still drawn inside the field. W224 only moved `PW.hud` (`pure.js:102`). Move the weapon
     card into the same bottom band, right of the hull box.
   - Teal shards and the hex pickup: give pickups one reserved hue. Use gold, never teal (teal is the tower windows).
3. (On foot: pending, `nr/W225-foot` not pushed yet.)

## Verdict

| Build | Phone | PC | Verdict |
|---|---|---|---|
| `nr/W224-flight` a341b44 | 8 of 9 rows under 7 | 8 of 9 rows under 7 | **REDO, do not deploy.** A real step up on find-the-player and grayscale. The owner's two complaints (sticker look, invisible enemies) still score 3-4. |
| `nr/W225-foot` | - | - | pending: not pushed yet |
