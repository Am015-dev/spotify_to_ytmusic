# HANDOFF W329: flight and street look (branch nr/W329-look, not deployed)

Owner ask (6 Nov 2026): the ships and foes look like stickers on the painted city ("layers not blended"). ONE deliverable: flight and street read
as one painted scene with the owner's assets, measured. No asset was added, changed or deleted.

## What changed, per step (all render-only; owner files named, rule 18a)
1. Sticker look removed: `PURL.ink` (render/pure.js) is the one light pass for the player, foes, boss and pickups. The 8-copy dark outline,
   the hard offset shadow and the warm pale lit edge are gone. Now: a soft blurred contact shadow just below the actor, a faint 1 device px dark
   rim (alpha .32, so it shows only against bright sky).
2. Scene light: a cyan (top) to magenta (bottom) soft-light grade on each actor, and a cool neon rim light from above. "Down" is the screen's
   down on both devices: on the phone the world canvas is turned, so `PURL.DN` is set in `draw()`. Rain is drawn OVER the play layer by
   `PURL.air`: one screen-size canvas built once, copied 1:1 each frame. Film grain was tried and dropped because it cost too much phone fps
   (see below). Depth haze on far foes is NOT done: flight has no depth value per foe.
3. Scale: phone player `PURL.PK` 1.6 -> 2.1. Foes follow, because their floor is tied to `pl()`. The ship is now about 1/7 of the phone width
   when banking, 1/4 of the height in length. The sheet is still drawn below its native resolution, so there is no upscale blur. The phone's
   top is not empty in the shots (towers fill it), so the camera was not reframed.
4. Shots: the standard player shot is a tracer: the owner's streak baked once over its own soft cyan glow (`PURL.hot` variant `~c`, an
   ImageBitmap), drawn with the same number of draws as before. Enemy shots (`PB.ebul`, pink `PB.EBC`) are untouched, so the danger colour
   stays reserved.
5. PC HUD: `DIET.hudL` (render/diet.js, the live lean PC HUD) has no painted boxed plates now: a soft edge-less dark falloff behind the type,
   and a neon glow on the score. The non-lean `drawHUD` in hud/c.js still has its plates, but it is not reached in these runs.
6. Street: Kai and the foes already had `FA.shadow` contact shadows and the owner-approved outline (17h). Added: `PURL.air` rain over them
   (street/purefoot.js, under the HUD). `streetblend.js` (W194, flag off) was tried with ?blend=1: it tints whole rectangles, not the actors.
   It is broken and stays off.

## Before/after contact sheets (not committed): /tmp/w329/
sheet-flight-phone.png, sheet-flight-pc.png, sheet-boss-phone.png, sheet-boss-pc.png, sheet-street-phone.png, sheet-street-pc.png, zoom.png (ships at full size).
Same script, seed and steps (/tmp/w329/shots.js; street qa/purefoot-shot.js). The flight sim still diverges between two builds (known, FLIGHT-DRAW-OWNERS.md), so the
foe placement differs between the before and after frames.
One line each: flight: the ships lose the cut-out edge and take the city's cyan/magenta light, the rain falls over them, the phone ship is bigger and the shots are cyan tracers.
PC HUD: the boxes are gone. Street: light rain over the actors (barely visible).

## Gates (this build)
flow-test 91/0 · gauntlet-shell 0 failed · claims-check PASS all · bossbar-layout 10/0 · hud-cover PASS · streetdraw 3/0 · footvis 0 failed
(after `git fetch --deepen`). gauntlet-flight phone shooter RUNS=2: boss killed 2/2, 0 errors. It needed WALL=420 JUMP=1, because with the
default 150 s wall neither the base nor this build reaches the boss.
Phone fps (benchmark/playability-probe.js flight phone 30, 4x CPU throttle): base median 22.5 (10 runs, 19.3-41.8). This build: 20.8, 21.7,
19.6, so the median is 20.8 (-7.6%, inside the 10% gate). The first version ran at 11-14 fps: the per-frame rain pattern fill and grain cost
that much, and both were replaced.

## Critic (independent subagent, rule 10 anchoring at the owner's level)
flight look 3 -> 4 (outline-free ship, rain over it, frameless PC HUD; the shots are still plain teardrops and streaks).
street look 3 -> 3 (no visible difference; the actors are still flat-lit cut-outs).
Things the critic found worse in the after shots: the phone boss enemy shells read as pale smudges (`PB.ebul`, not changed here; check), the PC
HULL/DASH/EMP labels are low contrast without the plate, and the PC GOLD banner is a dark full-width bar (not changed here).

## Next (in order)
1. Street actors' scene grade + neon rim: fix `streetblend.js` so the grade is clipped to the sprite alpha (source-atop on the scratch canvas
   only), then turn it on. This is the street's biggest gap.
2. PC HUD labels: brighter label colour or a stronger falloff (impeccable polish).
3. Enemy shots: the phone shell sprite reads as a smudge. Give it a hot core and keep the reserved pink.
