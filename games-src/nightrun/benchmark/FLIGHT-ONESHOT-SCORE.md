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
| BLEND (one picture?) | **5** | 78 | 90 | 88 |
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

## BLEND: scored with .claude/skills/game-look + the impeccable critique lens (orchestrator ask, 17:37 UTC)
The full impeccable critique (two sub-agents, its HTML detector, Nielsen table) is built for UI pages, not a canvas game frame; here
it is used inline only as a lens (Visual Noise Floor, P0-P3 priorities). Degraded run: single context, detector not applicable.

Measured on our PC shot (luminance 0-255, median / 90th percentile; saturation 0-255 median):

| plane | L med | L p90 | sat | game-look rule |
|---|---|---|---|---|
| far sky | 54 | 60 | 117 | should be darkest, least saturated: it is as saturated as the actors |
| mid towers | 65 | 102 | 95 | brighter than the enemies |
| near low city | 55 | 74 | 113 | no foreground plane passing in front at all |
| enemy hulls | 46-63 | 70-125 | 102-106 | **at or below the sky** -> play layer is not the brightest thing (rule broken) |
| player ship | 64 | 140 | 132 | only the neon trim lifts it |
| enemy bullet disc | 7 | 186 | 191 | black body: darker than everything, reads as a hole |
| player shot dash | 95 | 101 | 151 | 3 px tall, dimmer than tower windows |
| white hit blob | 221 | 242 | 4 | brightest object on screen is a shapeless grey-white cloud |

BLEND **5/100**: value planes inverted (actors <= backdrop), light direction differs per sprite (backdrop neon is pink/top-right,
ships carry their own baked top-left highlights, no rim on the backdrop's side), pixel density mixed (painted plate ~1 texel/px,
enemy sprites downscaled hard and soft, the white blob has no texels at all), outline weight mixed (player has a cyan outline,
enemies none, the gold UI rings are 2 px vector strokes). The refs: B is one lit 3D scene (90); C keeps one pixel scale and a 1-px
dark outline on every sprite (88); A keeps actors bright on a dark field (78).

### The three worst "pasted" spots on our pair
1. **[P0] Enemies darker than the sky they fly in** (PC x 760-860 y 130-240; phone y 200-300). Hull L 46-63 vs sky 54.
   Fix (code): a rim light on the backdrop's key-light side (pink/magenta, top-right) via a 1-2 px additive edge pass, plus
   darken/desaturate the far plates ~20% so the play layer wins. If still muddy after that: ask the owner in Google Flow for enemy
   sprites drawn lit from top-right with a magenta rim and a 1-px dark outline, same texel size as the player.
2. **[P0] The white hit blob** (PC x 1020-1180 y 400-470): a flat grey-white cloud (sat 4) larger than any ship, no texels.
   Fix (code): replace the white fill/tint with the owner's fx-boom sheet in normal blending plus a <= 0.1 s white flash on the sprite
   only (game-look "Feedback that blends"). If no fitting sheet exists: Flow sprite "8-frame small explosion, magenta/orange, smoke tail".
3. **[P1] Rings and markers stacked on the player ship** (PC x 90-300 y 150-275: gold 120 px ring + grey ring + magenta ring + pink
   blob; phone: 60 px ring + 3 gold diamonds). Vector UI strokes over a painted sprite are the loudest "pasted" signal and hide the ship.
   Fix (code): one small hitbox dot only; show the graze/dash state as a tint of the engine flame, not rings (rule 8 caption once).
   Close runner-up: black enemy bullet discs (L 7) on a mid-dark sky; recolour to a reserved bright hue with white core (code only).

## What would move ours the most (art problem, rule 17 (f))
1. Enemy bullets: one bright colour nothing else uses (e.g. hot pink/white-core orbs 16-24 px with halo), a second shape per enemy type.
2. Player ship: bigger (>= 72 px tall on PC), no rings drawn over it; one small hitbox dot only.
3. Enemies: lighter or rim-lit sprites so they separate from the purple sky; the white blob replaced by a real explosion sprite.
4. Environment: needs foreground/mid layers in the same style as the sprites; tinting the plate will not fix it (24 Oct, W194/W201).

## Branch rows (W206-W210), checked once at 18:12 UTC (40 min in)
Delta = points vs the base row above (SHIPS 8 / BULLETS 4 / ENV 12 / FEEL 6 / FUN 7 / BLEND 5), judged only from each branch's own
review-shots pair (`games-src/nightrun/review-shots/<Wxx>/`). Cap: no row above 25. None of the four compared against a real
reference frame (W208/W209/W210 say so); the three URLs above are now available to them.

| branch | pushed? | delta S/B/E/F/Fun/Blend | new total | verdict |
|---|---|---|---|---|
| nr/W206-boss | **not pushed** by 18:12 | - | - | no row; score when it lands |
| nr/W207-ships | yes, 7cc3e15 | +4 / +5 / 0 / 0 / +1 / -2 | 12/9/12/6/8/3 | **REDO.** The magenta carrier (~300x130 px) is the first enemy that reads, and the orange-ring enemy shots (~28 px, bright core) beat black discs. But: (1) it adds 5 enemy kinds to stage 1 = breaks the rule 17 (a) feature freeze; (2) the player is invisible in its PC shot (a pink hit burst + bare ring at x 210 y 620); (3) HUD text collides ("CARRIER:" over a cyan "B" glyph, "LV21 BARS" overprinted, "CHAIN BROKEN" on the same line) = rule 8 fail; (4) all enemy shots are one look, its own README admits. Keep the per-kind sheets/flame/death clips, drop the new wave roster, fix the text overlap. |
| nr/W208-bullets | yes, 3982de3 | 0 / +12 / 0 / +1 / +2 / +3 | 8/16/12/7/9/8 | **KEEP** (best of the round). Lime-green orbs ~30 px with white core are a reserved hue nothing else uses and read over the purple; orange double rings and pale leaf blades give 3 looks in one frame (README: 5 in the stage); player bolts are now 50x15 px cyan spikes, visible. Fix before live: the pale-cyan enemy leaf blades and the cyan player bolts share one hue family (rule 17 (d): player shots and enemy shots must not share a colour); player ship still ~1/34 of the short side. |
| nr/W209-boom | yes, 4ea58ba | 0 / 0 / 0 / +7 / +1 / +1 | 8/4/12/13/8/6 | **KEEP, with a redo of the colour.** The boom is now ~130 px (2x hull) with a shape, visible on phone too. But it is the same magenta as the player's engine, the city neon and the hit sparks, so it reads as a pink glow cloud, not fire; the shot is a staged kill in an empty frame (2 enemies, 0 enemy shots), not a busy moment. Next: hot white/orange core into magenta smoke, debris visible, then a real busy-moment pair. |
| nr/W210-motion | yes, 1847a38 (flag off) | +2 / 0 / 0 / 0 / 0 / -1 | 10/4/12/6/7/4 | **REDO the evidence, keep the code behind the flag.** Banking is visible on phone (enemies tilted, 1.3-1.5x bigger), but a still cannot show motion and no clip or trajectory plot was given; enemy shots are still black discs with white slashes; texel density now differs ~1.5x between player and enemies (the game-look limit). Needs a 2-3 s clip or path trace next to a reference before anyone can score MOTION. |

Overall after this round, if W208 + W209 (colour fixed) + W207 minus its roster go live: about **SHIPS 12, BULLETS 16, ENV 12, FEEL 13,
FUN 9, BLEND 8**: still far below the references (75-90). Nobody touched the environment; the backdrop as bright and busy as the
ships is now the biggest single gap (every README says it, no worker owns it).

## Owner verdict, 24 Oct 2026 18:30 UTC
"No, the screenshots are extremely ugly, they don't blend well with the background, they indicate huge sloppiness." All code-only look
passes (nr/W206, nr/W207-ships, nr/W208-bullets, nr/W209-boom, nr/W210-motion, nr/W213-combo) are NOT merged and stay on their branches.
Rule 17(e)/(f): no more code-only look passes on flight. The next look step starts from the owner's new matched background layers
(benchmark/FLOW-FLIGHT-LAYERS.md); the first screen with them is judged as one phone + one PC shot before anything else.
