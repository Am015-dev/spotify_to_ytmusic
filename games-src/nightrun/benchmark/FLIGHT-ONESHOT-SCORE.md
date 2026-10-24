# Flight stage 1: one-shot score against 3 references (W211, 24 Oct 2026)

Rule 17 (c). Baseline: the owner's score of 24 Oct, all rows < 10. No row for ours may go above owner + 15 (= 25).
FUN cannot be seen in a still; the FUN column is a guess from what the frame promises (threat, choice, reward) and says so.

## The shots
- **Ours** (branch base `alex/brave-carson-rbpmlk` at 17:31 UTC, stage 1, ~15-20 s in, busiest of 26 frames by enemies + enemy shots
  on screen, 18 on phone / 20 on PC): `games-src/nightrun/review-shots/W211/oneshot-base-phone.webp` (390x763),
  `oneshot-base-pc.webp` (1440x860).
- **Ref A**, 2D pixel-art space roguelite shooter, boss fight (1920x1080):
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg
- **Ref B**, 3D painted steampunk horizontal shooter, factory stage with a big boss (1920x1080):
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606730/ss_d3795f7761dd1e2d96541ce7b60ccf521a06c358.1920x1080.jpg
- **Ref C**, 16-bit-style pixel horizontal shooter, capital-ship stage (1920x1080):
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/628800/ss_a22423eff3c0bccb8925f504c193f9ac97d42fcb.1920x1080.jpg

Sizes below are px in the shot as given (refs at 1920x1080, ours at 1440x860 PC unless "phone").

## Scores (0-100)

| row | ours | Ref A | Ref B | Ref C |
|---|---|---|---|---|
| SHIPS | **8** | 70 | 80 | 85 |
| BULLETS | **4** | 92 | 82 | 80 |
| ENVIRONMENT | **12** | 75 | 92 | 82 |
| FEEL | **6** | 85 | 85 | 75 |
| FUN (guess from a still) | **7** | 80 | 75 | 80 |
| **player-equivalent** | **7** | 80 | 83 | 80 |

## Reasons, row by row

**SHIPS**
- Ours: player ship ~165x25 px on PC = 1/34 of the 860 short side (rule 17 (d) asks >= 1/12 = 72 px); it reads as a long thin
  cyan/magenta streak, and three overlapping rings (gold 120 px, grey, magenta) plus a pink blob sit on top of it, so the
  silhouette is gone. Enemies are ~60x30 px dark grey/maroon hulls on a dark purple sky: brightness gap almost nil, they read as smudges.
  One enemy at x 1020-1180 is a flat white cloud blob ~160x70 px (hit flash or smoke) larger than any ship. Phone: player ~60x75 px
  (fine for size, 1/6.5 of 390) but buried in a 60 px ring + 3 gold markers; enemies 20-35 px, dark on dark.
- Ref A: player ships ~90x45 px with a 2 px bright outline (cyan / red) against near-black space; boss ~250x330 px, black body with
  a yellow skull face, instantly the focus.
- Ref B: player plane ~100x90 px orange/yellow with dark trim against cold blue-grey; enemies small but lit with an orange rim.
- Ref C: player ~70x25 px white/red, enemies 60-120 px, every sprite has a 1-px dark outline and 3-4 tone shading; the capital ships
  (800 px long) are scenery you fly between, not decals.

**BULLETS**
- Ours: player shots are thin pale-blue dashes ~30x3 px, 2 visible, nearly invisible (code says up to 62 alive). Enemy shots: ONE look
  in the whole run (one kind, r=5, every enemy type): a ~24 px BLACK disc with a white slash, on a dark purple sky, so they look like
  holes, not danger; on phone they are bare white sticks 20x4 px. Two more round things on screen (orange rings ~28 px, cyan
  diamonds in gold rings) that the player cannot tell from bullets without a caption (rule 8 fail).
  Distinct enemy-bullet looks: **1**. Brightest object on screen: the score text, not a bullet.
- Ref A: enemy shots are glowing cyan orbs ~32 px on black, laid out in two rings + a spiral = the pattern itself is the art;
  player shots are small yellow-orange pellets and a red flame trail, clearly a different colour family. 3+ looks.
- Ref B: red and blue glowing orbs ~30 px with white core and halo, readable over a busy 3D wall; player shots are flat yellow
  double lines (different shape), missiles orange. 4 looks.
- Ref C: player shots are fat yellow twin pills ~40x10 px, enemy shots pink-white orbs and small cyan darts, each enemy type its own. 4 looks.

**ENVIRONMENT**
- Ours: a painted night-city skyline, pleasant as a wallpaper, but flat: one layer of buildings with no foreground, no parallax
  depth visible in the frame, a scanline overlay over everything, and the sprites are clearly pasted on top (different art style,
  different light: no city-light rim on any ship). Phone: a different painted plate (station/opera house) - looks like a poster
  behind the play, not a place you fly through. Sky behind the action is a single dark purple (~#3a2850) that also hides enemies.
- Ref A: dark space plus one huge swirling planet; minimal but it frames the bullets (dark where the bullets are).
- Ref B: full 3D factory, foreground domes and pipes, mid towers, background haze; the boss IS the environment.
- Ref C: 3 depth layers (stars, planet, capital ships you fly in front of / between); same pixel scale and palette as the sprites.

**FEEL** (from the still: hit flashes, debris, score pops)
- Ours: one small orange spark burst ~40 px behind an enemy, one white cloud blob with no shape, a "+154" in a dim blue that is
  hard to read, "BOLD x2" half cut under the score box. No screen-filling explosion, no debris, no muzzle flash worth the name.
- Ref A: two layered fire bursts, sparks, flame trails from the guns. Ref B: three fiery 60-90 px explosions, smoke, "2000" pop
  in white. Ref C: chunky red-orange explosion ~100 px, red gib spray off a hit enemy.

**FUN (guess)**
- Ours: nothing in the frame says "danger here, choose a path": bullets do not read as threats, enemies do not read as targets,
  the player cannot see their own ship clearly. The owner's < 10 stands.
- Refs: every frame poses a clear spatial question (thread the ring, dodge the orbs, fly between ships).

## What would move ours the most (art problem, rule 17 (f))
1. Enemy bullets: one bright colour nothing else uses (e.g. hot pink/white-core orbs 16-24 px with halo), a second shape per enemy type.
2. Player ship: bigger (>= 72 px tall on PC), no rings drawn over it; one small hitbox dot only.
3. Enemies: lighter or rim-lit sprites so they separate from the purple sky; the white blob replaced by a real explosion sprite.
4. Environment: needs foreground/mid layers in the same style as the sprites; tinting the plate will not fix it (24 Oct, W194/W201).

## Branch rows (W206-W210), checked once at ~40 min

| branch | pushed? | score delta vs base (ships/bullets/env/feel/fun) | verdict |
|---|---|---|---|
| nr/W206-boss | (filled below) | | |
| nr/W207-ships | | | |
| nr/W208-bullets | | | |
| nr/W209-boom | | | |
| nr/W210-motion | | | |
