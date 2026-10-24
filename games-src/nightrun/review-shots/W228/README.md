# W228 on foot: depth lanes, shadows on the feet, quiet backdrop (flag `footmove`, stays OFF)

Build: `nr/W228-foot`, `?footmove=1`. Probe: `qa/w228probe.js`, seed 11, street zeil. A bot plays in the stepped `FOOT.sim`
(x325 phone, x401 PC, draws not counted). It fights, walks the belt depth and side-steps wind-ups. Measurements are taken at
8 seeded random moments between 20 and 75 s. Each moment is the first step with a ground foe on screen.

Frames: `fight-phone.webp` (390x763; the t = 45 moment had no foe on screen, so this one is t 48.2) and `fight-pc.webp`
(1440x860, t 45.0).

## What changed (all behind `footmove`)
- **Lanes** (`foot.js` `beltM`, OpenBOR style). Near Kai, a foe holds its own lane at least .3 of the belt away from his line.
  It steps in only to strike (wind-up, shot call, lunge). The step-in commits to the line Kai stood in when the wind-up began and
  moves at 2.5/s, the same speed as the rusher's own depth dash. Far lanes are drawn a scale step smaller: .85 + .15 z, was .9 + .1 z.
- **Shadows** (`art.js` footDraw, `footart.js` shadow). The actor's own frame is flattened (shear .4, height .22) and multiplied at
  alpha 1, with a 1 px blur. Under it sits an ellipse 0.95x the body width with a black core at alpha 1.
- **Backdrop** (`purefoot.js`). Above the play line: saturation down 45%, then a value overlay of .55 to .42. A haze band sits
  behind the play line and fades out into the sidewalk. The floor has a .38 value overlay. Props are drawn at brightness .8 /
  saturate .75, and the kiosk at .6. Props sort behind every lane (draw only; their hit depth is unchanged). Actors get a key light
  of brightness 1.75 / saturate 1.15.

## Gates (8 moments per device)

| Gate | Phone | PC | Pass |
|---|---|---|---|
| Median depth spread of fighters (1 = whole belt) | **0.51** | **0.41** | >= .40: PASS both |
| Min shadow darkness, 1 - L(full) / L(no actors), box under the drawn feet | **0.26** | **0.19** (median .45) | >= .25: phone PASS, PC FAIL |
| Min actor contrast, WCAG mean vs 6 px ring | **1.87** (median 2.91) | **1.08** (median 2.43) | >= 3:1: FAIL both |
| Baseline for the same probe on W225 | spread .55 / .34, shadow .00 / .03, contrast 1.03 / 1.00 (median 1.1) | | |

Why the PC minimums fail:
- The .19 shadows belong to rushers mid-dash, with the legs spread over the box.
- The 1.08 contrast is Kai in the front lane at t 20.2, over the bright magenta and cyan road reflections.
- A mean-luminance 3:1 needs actor luminance >= .10 even against a black ring. The owner's fighters average about .04, so the key
  light gets them to about .1. Going further washes them out.

## Balance (streetsim, 20 runs x 4 bots, `?footmove=1`)
| Bot | Today (W225) | W228 | Within +-8 |
|---|---|---|---|
| idle | 0 | 0 | yes |
| nearest | 40 | 45 | yes |
| gfirst | 75 | 65 | **no (-10)** |
| dodge | 65 | 70 | yes |

Step-in speeds of 1.2/s and 1.8/s gave 55/80/85 and 50/50/70. Run-to-run seed chaos is about +-10 points.

## Critic rows (my scoring of these two frames; SHIP needs every row >= 7)
| # | Test | Phone | PC | Note |
|---|---|---|---|---|
| 1 | Owner-art | 6 | 5 | PC: a large hex bomb pickup icon sits mid-field, and a bright smoke cloud fx. |
| 2 | Grayscale | 6 | 6 | Fighters are now the lightest bodies; the smoke and reflections still compete. |
| 3 | Silhouette | 6 | 7 | Fighters stand on separate lanes and no longer merge. |
| 4 | Find the player | 7 | 7 | |
| 5 | Bullets | 5 | 5 | Not touched in this task. |
| 6 | Clutter | 6 | 5 | The pickup icon. |
| 7 | Benchmark side by side | 5 | 6 | The floor is used as the stage, but the front road is still sparse on the phone. |
| 8 | STICKER | 6 | 6 | Shadows are visible, and the backdrop sits a step behind. |
| 9 | ENEMY VISIBILITY | 6 | 6 | |

Verdict: rows are below 7, so `footmove` stays OFF.

Next steps:
- The pickup icon size and the smoke fx alpha.
- The enemy shot recipe.
- The front-lane road reflections behind actors: a darker local floor under the lanes.
