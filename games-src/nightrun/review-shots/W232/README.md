# W232 on foot: small grounded pickups, faint steam, foe value lift, rest shadow fix, darker front lanes (flag `footmove`, stays OFF)

Build: `nr/W232-foot` (W230 + latest `alex/brave-carson-rbpmlk`), `?footmove=1`. Probe: `qa/w228probe.js`, seed 11, street zeil,
stepped bot (x355 PC, x450 phone). Frames: `fight-pc.webp` (1440x860, t 45.0), `fight-phone.webp` (390x763, t 48.2: at t 45 no
foe was on the phone screen, so the probe moved to the next moment with one, as in W228/W230).

## What changed (all behind `footmove`)
1. Pickups (`street/purefoot.js`): a small token on the floor, 18 units across (was a 40-unit icon), with a contact shadow. It is the
   emblem from the middle of the owner's picture, clipped round, so there is no hex frame. Heal and ammo use the owner's spin sheets.
2. Steam (`street/streetlook.js`): the vent cloud is 1.1 characters tall at alpha .4 (was 1.7 at .95). It is still drawn in the
   backdrop pass, behind the actors.
3. Foe value lift (`art/art.js`, `ART.olB`, cached per strip): every actor strip gets the smallest `1 - (1 - v)^y` curve that lifts
   its mean luminance to `ART.olT` = .26. Black and white stay where they are; only the mid-tones rise. Kai keeps his W230 black lift
   under the same curve. The owner's art stays underneath, with no flat tint.
4. Rest shadow, root cause: the purefoot `turn()` squash reads the facing only when the actor is drawn. A turn made while the actor
   was not drawn (stepped sim, or off screen) started the 0.1 s squash at the next draw, so the rusher in `rest`, right after it
   lunged past Kai, was drawn at x-scale .35. That squeezed both its body and its contact shadow. Now a squash plays only for a turn
   seen within 0.1 s of the previous draw. Normal 60 fps play is unchanged.
5. Front lanes (`street/purefoot.js`): an extra floor ramp, from 0 at the belt's far edge to .55 below the front line. The hover-car
   cover prop, whose pale thrusters sit right behind the fight, is drawn at brightness .45 (other cover stays at .8; the kiosk at .6).
- Probe: a fighter that is already killed (knocked into the air and fading) is not measured. Its feet are in the air, so the box
  "under the feet" has no contact shadow to find.

## Minimums (8 moments per device; W230 in brackets)
| Gate | Phone | PC | Pass |
|---|---|---|---|
| Min actor contrast vs 6 px ring (>= 3) | **3.06** (1.80), median 3.95 | **2.45** (1.10), median 3.70 | phone PASS, PC FAIL |
| Min shadow darkness (>= .25) | **0.29** (0.22) | **0.35** (0.16) | PASS both |
| Rusher in `rest` shadow | .38 | .43 / .44 (.17 / .16) | fixed |
| Median depth spread (>= .40) | 0.51 | 0.41 | PASS |
| gfirst, streetsim 40 x 4 (75 +- 8) | 70 (nearest 45, dodge 65, idle 0) | | PASS |

The only failure is PC t 20.2. The rusher (2.45) and Kai (2.84) overlap each other in front of the hover-car cover and its pale
thrusters (ring .03). Every other PC fighter is >= 3.29. Getting there needs the car cover darker still, or the fighters kept off it.
That is one more round; I did not do it inside the 75 min limit.

## Critic rows (my scoring of these two frames; SHIP needs every row >= 7)
| # | Test | Phone | PC | Note |
|---|---|---|---|---|
| 1 | Owner-art | 7 | 7 | The hex icon and the big steam cloud are gone. The pickup is a small token on the floor. |
| 2 | Grayscale | 7 | 7 | Foes and Kai are now lighter than the street. Kai reads a little milky grey on the phone. |
| 3 | Silhouette | 7 | 7 | Outline as in W230. |
| 4 | Find the player | 7 | 7 | |
| 5 | Bullets | 5 | 5 | Not touched. |
| 6 | Clutter | 7 | 7 | No icon or cloud over the fight. |
| 7 | Benchmark side by side | 6 | 6 | The front road is darker and calmer, but still sparse. |
| 8 | STICKER | 6 | 7 | The shadows are now even. Kai's lift looks slightly pasted on the phone. |
| 9 | ENEMY VISIBILITY | 7 | 7 | Every foe is >= 3 except the PC t 20 overlap. |

Verdict: the PC contrast gate fails and rows 5, 7 and 8 are below 7, so `footmove` stays OFF.

Seen in passing, out of scope: on the phone, the touch button label next to KNIFE draws two words on top of each other.
