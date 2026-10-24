# W237 on foot: colours back, edge-led contrast, tracer bullets, soft contact shadows (flag `footmove`, stays OFF)

Build: `nr/W237-foot` (W234 + latest `alex/brave-carson-rbpmlk`), `?footmove=1`. Probe: `qa/w237probe.js` (W234 probe + edge band, strip saturation, rim-aware shot contrast), stepped bot x289-379.
Frames: `fight-pc.webp` (1440x860, t 45 s, shots in flight), `fight-phone.webp` (390x763, t 49 s), seed 11.

## Changes (all behind `footmove`)
1. Actors (`art/art.js`): the foe value lift (.44) is gone (17h: lift on Kai only). Kai's lift now scales each pixel's value (hue and saturation kept), capped at y 2.
   Outline 2.5 px (was 2), rim thinner (Kai 1.3 px, alpha .75, was 2 px .9; foes 1.3 px warm `#ffb466`, alpha .85).
2. Backdrop (`street/purefoot.js`): the light haze band behind the lane halved; a soft dark band (to alpha .4) behind the fighters' bodies, drawn before the actors.
3. Bullets (`street/purefoot.js`), sized in CSS px: foe shot = capsule tracer 15x4.4 coloured body, white-hot core toward the head, 2 px dark rim (19x8 overall), its own colour, no halo.
   Player shot = cyan needle 20x3.2 pointed both ends, white core, dark rim. Muzzle/impact flash smaller and dimmer.
4. Contact shadow: the frame-replica ink shadow removed; the ellipse (`footart.js`) fixed (its gradient centre sat at y 2 of 16, cut off) and graded darkest at the centre with a soft falloff.

## Gates, seed 11, 8 moments + t 45
| Gate | PC | Phone |
|---|---|---|
| strip saturation vs raw sheet >= .80 | 1.06 | 1.06 |
| edge contrast (outline or rim band vs backdrop ring) >= 3 | **2.07** (one gunner at t 48.2; all others 4.4-9.5) | 6.77 |
| body vs ring contrast (old W228 gate, info) | 1.49 min, median 3.21 | 3.32 |
| foe shot contrast, rim-aware (max of core, rim vs bg) >= 3 | **2.55** | 6.02 |
| player shot contrast, rim-aware >= 3 | 4.93 | 5.18 |
| shadow darkness >= .25 | .40 | .46 |
| depth spread >= .40 | .47 | .59 |
| gfirst, streetsim 40 x 4 (75 +- 8) | 70 (nearest 45, dodge 65) PASS; nearest-band and threat-peak FAILs are unchanged from W232 | |

## What I see in the frames (honest)
- Colours: the fighters keep their painted hues again (green jacket, red scarf, grey-blue hoodie); Kai still reads a little pale lavender because the old key-light filter (brightness 1.75) stays.
- Edge: the dark outline separates them from the street; Kai's cyan edge is now mostly the art's own neon trim, but on the phone it still glows more than the foes' warm rim.
- Foe shots: small warm/yellow pills with a dark rim, readable over the dark wall and over the crate on phone; at PC they are small (about 19x8 px with rim) and one moment over a mid-grey backdrop stays under 3:1.
- Player shots: thin cyan needles, clearly a different shape and hue from foe shots, readable over the crates.
- Shadows: soft dark ellipses under the feet, no silhouette blot; on PC they are subtle and sit mostly under the boots.
- Backdrop band: the darkening behind the lane is visible only as a slightly deeper street; it did not fix the one PC gunner moment (2.07).
- Not mine but visible: the phone GUARD button shows two overlapping labels.
