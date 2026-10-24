# W224 flight look: the critic's fixes (CRITIC2-FLIGHT.md), measured

Built from `alex/brave-carson-rbpmlk` (not W215b). Code: `parts/render/pure.js`, `parts/render/pureboss.js`. Probe: `qa/w224probe.js`
(stage 1, human bot, seed 1, stepped sim, frame at t = 27.5 s or 3 s into the boss; `GAME_DIR=<build> W= H= MODE=stage|boss node qa/w224probe.js`).
Shots (WebP q90): `phone-stage-390x763.webp`, `pc-stage-1440x860.webp`, `phone-boss-390x763.webp`.

## What changed
1. Enemy visibility (`pure.js` foe / lit / cel): every enemy sheet is drawn from cached strips (one per sheet, drawn size and kind): a soft dark halo
   (sheet at brightness 0, blurred, alpha .9) behind it, then the sprite at brightness 1.6 / saturate 1.2. Phone size clamp: enemy length >= .8 x player.
2. Boss (`pureboss.js` shield): `fx-shield` drawn before the boss, normal blend, alpha .35, scale `e.r*2.2`.
3. Sticker: backdrop layers at value .32 / saturation .6 (PC mid strip .4, near strip untouched) with a haze veil baked into the backdrop copy only
   (backdrop purple, 10% at the top to 28% at the bottom). Rim light from the top-right neon side: enemies get a pink rim copy offset toward the
   light (additive, alpha .3); the player's old all-round light outline is now drawn only on the light side, pink-white. Engine-glow pool:
   the owner's `fx-engine` blurred once, additive alpha .3, 3 x 1.5 ship heights behind each ship (cool for the player, warm orange for enemies).
4. Player shots: every player shot is a bolt along the flight axis (no fan, no bank tilt), built from the owner's `fx-shot-std` used as a mask:
   dark rim (alpha .6) + cyan edge + white core, normal blend, plus a small additive glow (alpha .3) on top.
5. PC power-up panel: drawn in the bottom HUD band right of the hull box (scale .7, .5 for 3+ items), was in the sky at y 112.

## Measured (honest numbers, several runs; the frame moment drifts a little between runs)
| Check | Before (live b7ca362) | After |
|---|---|---|
| Enemy sprite vs surrounding ring, grayscale contrast (WCAG ratio), phone | 1.16, 1.41, 3.8, 4.62 (min 1.16) | 3 runs: 3.34-3.78 (min 3.34) |
| Same, PC | 1.29, 1.46, 2.04, 2.43, 4.83 (min 1.29) | 3 runs: 3.12-3.78; one run also had a 27x3 px sliver at 1.31 |
| Enemy length / player length, phone | 0.55 | 0.80 |
| Enemy length / player length, PC (not in the brief, unchanged) | 0.62-0.72 | 0.62 |
| Boss body vs ring, phone | (shield covered the body) | 6.63 |
| Boss body vs ring, PC | - | 2.24 (FAIL: a pale grey box over the bright near strip; readable by eye, but under 3:1 on mean value) |
| Player shot size on screen (PC, pixels > 110 grey) | pink pulses | 48 x 7 px (std); code: 44-64 long, 7-9 thick |
| `qa/pureprobe.js` (0 code-drawn shapes in the field, stage + boss) | PASS | PASS |

Brightness 1.35 (the brief) measured 2.3-2.8:1 and 1.45 measured 2.1-3.3:1, both under the gate, so the sprite copy is at 1.6.

## What still looks pasted or weak (game-look check, no score: the independent critic scores)
- SHIPS: enemies now read, but they are still flat dark art lifted by a halo; PC enemies stay at .62 of the player.
- ENVIRONMENT: the darker, hazier backdrop pushes the city back; the phone painting is still finer-grained than the sprites (not in this brief).
- BULLETS: bolts are clean and parallel; on the phone a fresh volley stacks into one white block at the nose.
- HUD: the PC power-up panel now sits in the bottom band, where low-flying enemies can pass under it.
