# W223 footmove (24 Oct 2026): moves, shots, props/backdrop on the street

Flag `RET.footmove`, **default OFF** (critic rows below are not all >= 7). Try it with `?footmove=1`.
Shots: `qa/footmove-shot.js` (stepped with FOOT.sim, EB=1 waits for an enemy shot in flight, ATK=1 = the 3-frame attack strip).
- `fight-pc.webp` 1440x860, `fight-phone.webp` 390x763, `attack-strip-pc.webp` = a rusher's wind-up / strike / recovery (top to bottom).

## What changed (draw only; the sim never draws)
- Attacks as anticipation -> strike -> recovery frames of one sheet (the OpenBOR frame-event model): the wind-up (generic `wind`, the rusher's
  crouch) plays the first ~40% of the melee sheet spread over the telegraph, the strike frames run in 0.1 s as the hit lands / the lunge
  starts, then a slow recovery instead of popping to idle. The rusher's telegraph used to show its *shoot* sheet; it holds a knife.
- Kai keeps his aim pose between auto-fire shots (no shoot/idle popping every shot) and each shot restarts the recoil frames.
- Turn-around: a 0.1 s squash when facing flips.
- Shots: enemy shot = the owner's orb with a dark rim (W222 lesson 1) and three fading copies behind it (a bolt, not a disc); enemy muzzle
  frame where a shot starts and impact frame where it stops (cover, Kai, the knife); player shots get two fading copies (tracer).
- Depth: the backdrop gets a dark aerial gradient (stronger at the top) so the play plane reads in front; glowing back-street props
  drawn at .62 alpha; props get the actors' soft contact shadow; actor shadows .85 instead of .55.
- Orchestrator lessons (OpenBOR, 20:28): actor shadows are the actor's own frame flattened onto the road and multiplied (plus the soft
  ellipse at the feet); the belt depth sort compares depth in 1/200 steps and keeps list order on ties (no front/behind flicker).
- Run cycle to ground speed was already on (streetfeel: frame = distance / stride), so not redone.

## Not done (why)
- Acceleration / deceleration of Kai's velocity, knockback gravity arcs and hit-stop that freezes only the two fighters change the sim (gameplay). A tried accel (0.09 s / 0.055 s
  to full speed) moved 20-run clear rates by up to 25 points (seed chaos), so it was reverted; footmove is draw-only.
- Foes overlapping Kai (they stand inside him): AI spacing, gameplay.

## Balance (streetsim, 20 runs x 4 bots): unchanged
footmove off: idle 0 / nearest 40 / gfirst 75 / dodge 65 %; on: 0 / 40 / 75 / 65 % (identical: draw-only).

## Critic pass (0-10, phone and PC, honest)
| # | test | phone | PC | note |
|---|---|---|---|---|
| 1 | owner-art | 7 | 7 | only the haze gradient and the rim (derived from the owner orb) are code |
| 2 | grayscale | 6 | 7 | actors separate a little better; the bright back props still compete |
| 3 | silhouette | 5 | 6 | foes stand inside Kai (AI spacing) |
| 4 | find the player | 6 | 7 | phone: Kai merges with the foe overlapping him |
| 5 | bullets | 7 | 7 | enemy bolt reserved green with a rim; player tracer small but visible |
| 6 | clutter | 7 | 7 | HUD at the edges only; the beacon ring prop is the loudest mark |
| 7 | benchmark side by side | 5 | 5 | overlap, big glowing beacon ring; frame shadows now ground the fighters |

Weakest three and the fix: (7)/(3) foes overlapping Kai, a spacing rule in the foe AI (gameplay task, balance check); the beacon/holo back props, a smaller size or the owner
re-exporting them without the halo.
