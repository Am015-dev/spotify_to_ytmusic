# W225 footmove (24 Oct 2026): spacing, knockback arc, two-fighter hit-stop, frame shadows, back props

Flag `RET.footmove` stays **default OFF** (critic rows 2 and 7 are 6 on PC). Try it with `?footmove=1`.
Shots: `qa/footmove-shot.js` (same seed/moment as W223). `fight-pc.webp` 1440x860, `fight-phone.webp` 390x763,
`knockback-strip-pc.webp` = a foe killed by Kai's knife at 0.08 s (rising), 0.17 s (apex), 0.32 s (landed, sliding) after the hit (top to bottom; `KB=1`).

## What changed (all behind footmove)
1. **Spacing** (`foot.js` `space()`, after `beltE`): a personal-space ring on the belt (x, and depth within .35 of Kai's lane / .3 between foes).
   Foes not attacking hold at 0.7 x (their height + Kai's) from Kai; foes keep 0.7 x (sum of heights) apart; foes mid-attack
   (lunge, dash, pounce, spray, bite, charge, wind-up) are exempt so they come in to strike range. Sized from height, since the
   world widths (`e.w` ~30) are far narrower than the drawn bodies (the first try with `e.w` never triggered). Kai's ring wins over foe-foe pushes.
   **Drawn, not simulated**: it eases a picture offset `e._sx` (300 units/s, max 140); sim positions stay. A real shove in the sim
   moved 20-run clear rates 15-40 points either way (seed chaos; tried 5 variants: e.g. 45/60/45, 50/65/80, 55/35/80 for nearest/gfirst/dodge),
   the same finding as W169 for knockback shoves.
2. **Knockback arc** (`streetfeel.js` hitFeel + footDraw): kills and heavy hits (dmg >= 2) and the 3rd-hit finisher get the OpenBOR dropv shape
   scaled to our units (60 Hz, actor 76 tall): up 600/s, gravity 4000/s^2 = 45 units apex at 0.15 s, 0.3 s air, back 240/s = 72 units
   (dead foes only; the finisher already slides 160 in the sim), a 0.09 s landing squash, a 60-unit slide (dead foes). Light hits keep the old 4-16 px flinch.
   Draw-only.
3. **Hit-stop** (`foot.js` `hitstop(ms,a,b)`): with footmove only the target and (melee) Kai freeze; the world keeps running. Light 33/50 ms = 2-3 frames,
   heavy 100 ms = 6 frames; Kai hurt freezes Kai 40 ms. No actor given (finisher, boss phase, overdrive) = the old world freeze. Probe (`HS=1`):
   light knife hit -> target and Kai hs 0.033, target clock +0, other foe clock +0.017, world +0.033.
   As before, the headless sim only records the freeze, so balance is untouched.
4. **Shadows** (`art.js` actor draw): the W223 frame replica made readable on the dark road: multiply alpha .5 -> .75, skew .7 -> .4 (shorter,
   under the feet), 1.5 px blur. Still slightly detached on the sidewalk line (the road plane sits ~10 px under the drawn feet).
5. **Back props** (`streetlook.js` footProps, the live owner of that function; the W223 `art.js` .62 alpha never ran): beacon and holo at 70% size,
   45% alpha, brightness .5 / saturation .6. The lit vending kiosk (play plane, `purefoot.js`) a value step down (brightness .7).

## Balance (streetsim, 20 runs x 4 bots; clear %)
| build | idle | nearest | gfirst | dodge |
|---|---|---|---|---|
| today's table | 0 | 40 | 75 | 65 |
| footmove off | 0 | 40 | 75 | 65 |
| footmove on (final) | 0 | 40 | 75 | 65 |
No NaN / stuck / page errors. Identical because every footmove change is draw-side or record-only in the headless sim.

## Critic pass (0-10, phone / PC, honest)
| # | test | phone | PC | note |
|---|---|---|---|---|
| 1 | owner-art | 7 | 7 | no new code shapes; shadows are the actors' own frames, props only filtered |
| 2 | grayscale | 7 | 6 | beacon ring and kiosk recede; PC actors share mid values with the shutter wall behind them |
| 3 | silhouette | 7 | 7 | foes no longer stand inside Kai or each other (phone: Kai was fully hidden before) |
| 4 | find the player | 7 | 7 | phone Kai stands clear with the rushers held off |
| 5 | bullets | 7 | 7 | unchanged from W223 |
| 6 | clutter | 7 | 7 | HUD at the edges only |
| 7 | benchmark side by side | 6 | 6 | shadows still float a little below the feet; busy mid layer behind the fighters |

Weakest and the fix: (2)/(7) PC: a darker haze band right behind the play line (between shutters and actors), and anchoring the frame shadow
to the drawn feet (read the sheet's bottom pixel per frame). Then flip footmove ON.
