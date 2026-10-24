# W234 on foot: darker hover-car cover, foe-only value lift, recipe bullets (flag `footmove`, stays OFF)

Build: `nr/W234-foot` (W232 + latest `alex/brave-carson-rbpmlk`), `?footmove=1`. Probe: `qa/w234probe.js` (W228 probe + shots), stepped bot x320-370.
Frames: `fight-pc.webp` (1440x860), `fight-phone.webp` (390x763), seed 11, t 45 s.

## Changes (all behind `footmove`)
1. Hover-car cover prop draw: brightness .45 -> .36 (20% darker, under the 35% limit). Backdrop untouched.
2. Actor lift (`art/art.js`): foes `ART.olT` .26 -> .44, Kai stays .26 (`ART.olTK`; at .42 Kai looked milky), lift cap 2.4 -> 4.
3. Bullets (`street/purefoot.js`, ENGINE-LESSONS 1): code-drawn, normal blend, 1 px dark rim, tinted edge, white core, small additive halo only.
   Foe shot = round orb with a short tail, warm (own colour, never cyan). Player shot = long cyan streak. Muzzle/impact use a small white flash instead of the green orb.

## Minimums, seeds 11/12/13, 8 moments + t 45 (honest: NOT all gates pass)
| Gate | PC | Phone |
|---|---|---|
| actor contrast >= 3 | 3.47 / 3.53 / **2.72** | 3.55 / 4.46 / **2.98** |
| shadow >= .25 | .29 | .26 |
| foe-shot contrast >= 3 | **1.16** | **1.1** |
| player vs foe hue >= 60 | nominal 188 vs 349 (measured value is noisy: bright backdrops pollute the pixel hue) | same |
| gfirst 40 x 4 (75 +- 8) | 75 | |

Open: foe/player shot contrast below 3 over bright backdrops (crates, lamps, neon) - the bullet is dark-ringed but its mean luminance is not 3:1 there; the contrast metric and hue metric need a rim-aware measure. Two actor-contrast moments remain just under 3. The probe adds one synthetic foe shot and one player shot per moment when none are in flight, and skips fighters cropped by the screen edge.
`streetsim` real-time equality check (idle seed 4321) FAILED by 10 ms in this container; not touched by this change.
