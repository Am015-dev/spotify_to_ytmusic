# Critic 4: flight W227 and foot W228, independent frames (W229, 24 Oct 2026)

⚠️ DEGRADED: single-context, same as Critic 3. The impeccable critique and the design-review checklist each ran as one pass over the
frames. The impeccable detector was skipped because the play field is one canvas. There is no .design/ brief, so the brief is the
owner's 24 Oct note. Flight: "sticker on the wallpaper, enemies not visible". On foot: "props and background not blending, moves
bad, bullets ugly". I did not use the workers' self-scores. W227 claims all 7 of its probe gates pass, and W228 scores itself 5-7.

## Build trap: read this before any critic or worker run

`parts/build.py` hard-codes `/home/user/spotify_to_ytmusic/` as its source (`P=` on line 2, plus the media paths). Building from a
worktree with only `NR_OUT` set therefore builds **whatever the main checkout holds**, not the branch under test.

My first W227 build did exactly that. On that build the probe failed with phone enemy length .55, contrast 1.29 and a grade pop. Those
are Critic 3's W224 numbers to the digit, so Critic 3's "the clamp did not apply" may come from the same trap.

All the numbers below come from correct builds. I used a copy of build.py with the root replaced by the worktree (`sed
s#/home/user/spotify_to_ytmusic/#<worktree>/#g`) and checked a W227 marker string in the output. Fix: derive `P` and `R` in build.py
from `__file__`.

## Flight: `nr/W227-flight` e8b9487

Method:
- Stepped sim `?sim=1&all=1&nomusic=1`, human bot, seed 1.
- Measured with W227's own `qa/w227probe.js` at **SEED=4229**, so the random moments are not the worker's (the worker used 227).
- Frames come from a copy of the probe that screenshots at moments I picked:
  - t ≈ 22 s: the first wave.
  - The first moment after t 60 s with 5+ foes on screen ("many").
  - t ≈ 97 s: the "FINAL PUSH" wave.
  - 6 s into the boss fight.
- Each moment was shot on phone 390x763 and PC 1440x860.

Frames: `review-shots/W229/w227-{phone,pc}-{t22,many,t97,boss}.webp`.

Reference frames (URLs only, the same three as Critic 3, re-downloaded and looked at):
- R1, a 3D horizontal shooter boss over a dark interior:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606730/ss_9c34c404470abf6881913c0ca9b439e0be49201a.1920x1080.jpg
- R2, a pixel-art horizontal shooter boss:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/891790/ss_0ebeba95f20ace13cfcb861b760cd98b9ddfd969.1920x1080.jpg
- R3, a painted horizontal shooter:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/347160/ss_adc04f49419d282ee67a894af25cfdf5bed88439.1920x1080.jpg

### Measured (w227probe, SEED 4229, 8 stage moments + boss)

| | Phone | PC | Critic 3 (W224) |
|---|---|---|---|
| Min enemy contrast vs 6 px ring (gate 3:1) | **3.19** | **3.26** | 1.29 / 1.29 |
| Min enemy length / player | .80 | .72 | .55 / .62 |
| Boss body contrast | 5.35 | 4.06 | 4.20 / 2.39 |
| Grade pops in run, text drawn in the field | 0, 0 | 0, 0 | 3, yes |

All 7 W227 gates pass at my seed on both devices. The measured enemy-visibility problem is solved.

### Scores (0-10; SHIP needs every row >= 7 on both devices)

| # | Test | Phone | PC | What my frames show |
|---|---|---|---|---|
| 1 | Owner-art | 7 | 6 | The grade letter and the in-field weapon card are gone. Phone: a gold hex pickup icon at the left edge. PC boss frame: a ring pickup icon (purple circle) and a coin ring with gold diamonds float mid-sky. |
| 2 | Grayscale | 7 | 7 | The enemies are now the lightest bodies on a dark, flattened backdrop. The phone player is mid-grey, *darker* than the gold foes around it. |
| 3 | Silhouette | 6 | 6 | The stage foes read as ships. In "many" and t97, 6-9 gunships stack in overlapping columns and rows that read as one mass. The boss's value pass clips it: phone boss = a lavender-white blob with no inner shape; PC boss = a flat pale glowing box. |
| 4 | Find the player | 6 | 7 | PC: a violet dart with a pink engine streak, fine. Phone: the ship is now the dullest actor (cool violet next to warm-lit foes), found by its trail and shot column, not at a glance. |
| 5 | Bullets | 6 | 6 | Big orange orbs with white cores are good and in a reserved hue. The default stage shot is still a 4-6 px pink dot (`fx-bullet-enemy`) that hides in the neon. White player bolts still streak across the top third and the far right, far from the ship. |
| 6 | Clutter | 6 | 6 | The "FINAL PUSH · everything they have left" banner covers the top band of the field on both devices (DOM banner, invisible to the probe). Pickup icons on top of that. |
| 7 | Benchmark side by side | 5 | 5 | Closer to R1: dark backdrop, warm threats, orange orbs. Still no foreground plane, no light from the actors onto anything, and the boss is the least crafted object on screen instead of the best. |
| 8 | **STICKER** | 5 | 5 | Much better than Critic 3's 3-4: the backdrop is clearly behind. But the phone player ship now looks pasted *under* the foes (lower value and saturation than they are). The value pass flattens the boss into a bright cut-out. Nothing passes in front of the ships. |
| 9 | **ENEMY VISIBILITY** | 7 | 7 | Every stage foe is found at once on both devices (measured >= 3.19). The boss is visible, but as a blown-out shape, not a readable machine. |

Compared with Critic 3: ENEMY VISIBILITY +4 / +3, grayscale +3 / +4, owner-art +1 / +2, STICKER +2 / +1. Find-the-player on the
phone went down by 1.

## On foot: `nr/W228-foot` 23ddc5a, `?footmove=1`

Method:
- Built the same way, from a worktree build with paths patched.
- Frames come from a copy of W228's `qa/footmove-shot.js` with my own seeds and start steps: phone seeds 11 / 23 / 5 at steps 4397 / 6482 /
  5823, PC seeds 11 / 23 / 5 at steps 4397 / 3027 / 3122.
- Each frame is the first moment with 3+ foes after the start step, plus 50 steps.

Frames: `review-shots/W229/w228-foot-{phone,pc}-{a,b,c}.webp`. Moves and knockback cannot be judged from stills; these rows judge
the look.

Reference frames (URLs only, the same as Critic 3):
- B1, a hand-drawn neon-stage brawl:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/985890/ss_1f48943ea994936e2a75463b46ea635f72ba3a0a.1920x1080.jpg
- B2, a pixel-art bridge fight:
  https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1361510/ss_b02e0168a86d43489e65f8be98cd001f7c0491f0.1920x1080.jpg

| # | Test | Phone | PC | What my frames show |
|---|---|---|---|---|
| 1 | Owner-art | 5 | 6 | Phone: the "OVERDRIVE READY: BOMB" box still sits inside the field under the weapon card. The faint mid-air ring fx by the street lamp is still there in all 3 phone frames. |
| 2 | Grayscale | 6 | 5 | The fighters are now lighter than the shop fronts. PC: the lit vending machine (a backdrop picture, not the `kiosk` prop the dim pass targets) and the big steam cloud are still the brightest objects. In pc-b a gunner stands right in front of the vending machine. |
| 3 | Silhouette | 4 | 5 | phone-a: four fighters overlap in one clump, and one is cut by the left edge. pc-a: lanes are visible (a front-lane gunner). pc-c: four fighters in one row on one line, with two identical green rushers. |
| 4 | Find the player | 5 | 7 | PC: the blue hood reads. Phone-a: Kai is sandwiched again. |
| 5 | Bullets | 5 | 5 | The muzzle flash is good. The enemy shot is still a lime disc with a soft glow; the dark-rim / white-core recipe is not applied. |
| 6 | Clutter | 6 | 7 | Phone: the weapon card plus the overdrive box. |
| 7 | Benchmark side by side | 4 | 5 | B1 and B2 use the whole floor. In 5 of my 6 frames every fighter stands on the back sidewalk line, and the front 35-40% (wet road) is empty. |
| 8 | **STICKER** | 5 | 5 | Shadows now exist, a real step up. But they are sheared black blots thrown back-left, and they read as ink puddles, not contact shadows. There is no dark core under the soles, so the feet still float. |
| 9 | **ENEMY VISIBILITY** | 5 | 6 | Readable as people, still overlapping each other and Kai on the phone. |

Compared with Critic 3: STICKER +1 / +1, grayscale +1 / 0, find-the-player +1 / +1, silhouette +1 / +1. The lanes only work for foes
within 300 px of Kai, so they show in 1 of my 6 frames.

## The three worst problems and the exact fixes

1. **The boss is a blown-out cut-out, and the phone player is now the dullest actor (flight rows 3, 4, 8).**
   - The cause is `parts/render/pureboss.js:21`. It reuses the stage-foe value pass, `PURL.cel(key,sc,'b')` =
     `sepia(.35) saturate(2) brightness(2.2)` (`pure.js` `cel`), on the boss. The boss art is already lighter than the foes, so it clips
     to white.
     - Fix: add a kind `'B'` in `pure.js` `cel` for the boss, `sepia(.25) saturate(1.5) brightness(1.35)`.
     - Gate: boss contrast >= 3 AND fewer than 10% of the boss pixels at L > .9 (add that to `w227probe`).
   - Player: in `pure.js`, give the player sheet the same lift. Use a `'p'` cel kind of `brightness(1.5) saturate(1.3)`, or a white
     rim on the light side (the `'r'` kind already exists).
     - Gate: player mean luminance >= the brightest foe's on the phone.
2. **Flight field marks: banner, stray bolts, the pink dot shot (flight rows 1, 5, 6).**
   - `waves/slice.js:53` calls `banner(q.o.ann[0], q.o.ann[1], ...)` for every `ann` (for example "FINAL PUSH" in
     `waves/stage1fun.js:32`).
     - Under `RET.purelook`, skip it in flight, or shrink it into the top HUD strip at <= 16 px for <= 1.2 s.
     - Extend `w227probe` to read `G.banner`.
   - `pure.js:88`: the plain enemy shot `fx-bullet-enemy` at `r*3.4` is the pink dot. Draw it as the orange orb (the `~o` copy, as
     the boss orbs do), at >= 8 px on the phone.
   - Gold now means two things: one enemy family is gold, and so are the W227 shards. Make the pickups (shards, coin ring, hex icon)
     one hue no actor uses, such as mint, and drop the ring pickup icon from the field.
   - The stray player bolts across the top third come from the wide-spread weapon shots. Clip them at the field top and fade them
     past 70% of the width.
3. **On foot, lanes only near Kai, ink-blot shadows, and a hot backdrop (foot rows 3, 7, 8).**
   - `parts/street/foot.js:266-268` (`beltM`): foes more than 300 px from Kai keep `e.hz`, so groups arrive on one line.
     - At spawn, give each foe its own `hz` from 3 bands (.15 / .5 / .85). Never give two foes within 200 px the same band.
     - Use the full belt down into the wet road, so the front 35% is used.
   - `parts/art/art.js:221` (the shadow):
     - Change the shear `c.transform(1,0,.4,1,0,0)` to about .15 toward the key light. The lamps are top-left, so the shadow falls
       right, not back-left.
     - Lower the shadow alpha to .55.
     - Add a tight black ellipse (0.5x the body width, alpha .9) right under the soles from `footart.js:32`. Draw it after the
       multiply copy, so the feet touch down.
   - `parts/street/purefoot.js:67` dims only the `kiosk` prop. The big vending machine and the steam cloud are backdrop art.
     - Apply the same `brightness(.6) saturate(.7)` to the backdrop layer pass in `purefoot.js` (the layer above the play line).
     - Cap the steam fx alpha at .45.
   - `purefoot.js:44`: move the "OVERDRIVE READY" row into the top HUD strip on the phone, next to the hearts.
   - Enemy shot: apply the ENGINE-LESSONS §1 recipe (dark rim, tinted edge, white core) in the street shot draw.

## Verdict

| Build | Phone rows < 7 | PC rows < 7 | Verdict |
|---|---|---|---|
| `nr/W227-flight` e8b9487 | 6 of 9 (rows 3-8) | 6 of 9 (rows 1, 3, 5-8) | **REDO, do not deploy.** The owner's "enemies not visible" is fixed: 7/7, measured >= 3.19 at a seed the worker never saw. "Sticker" is improved (5/5) but not solved. Fixes 1 and 2 are small and in two files; this is the closest build yet. |
| `nr/W228-foot` 23ddc5a `?footmove=1` | 9 of 9 | 7 of 9 (rows 4 and 6 pass) | **REDO, keep the flag off.** No page errors. Shadows and the darker backdrop are real steps, but lanes show in 1 of 6 frames and the shadows read as puddles. |

SHIP needs every row >= 7 on both devices. Neither build may deploy.
