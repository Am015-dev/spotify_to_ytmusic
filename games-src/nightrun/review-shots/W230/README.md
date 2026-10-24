# W230 on foot: actor outline, rim light and Kai lift (flag `footmove`, stays OFF)

Build: `nr/W230-foot` (W228 + latest `alex/brave-carson-rbpmlk`), `?footmove=1`. Probe: `qa/w228probe.js` unchanged in its
measurements (its DBG line now also prints each fighter's state). Seed 11, street zeil, a stepped `FOOT.sim` bot (x357 PC, x452
phone, draws not counted). There are 8 seeded random moments between 20 and 75 s.

Frames: `fight-pc.webp` (1440x860, t 45.0) and `fight-phone.webp` (390x763, t 48.2: at t 45 no foe was on the phone screen, the
same as in W228).

## What changed (all behind `footmove`, `parts/art/art.js` only)
- `ART.olB` builds each actor strip once and caches it per strip, scale and facing in `ART.sc`. The cache is cleared on a scale
  change, as before. The cached copy has:
  - a 2 px near-black violet outline (`#12081c`), the silhouette dilated in 16 directions;
  - a thin rim light on the top edge and the side away from the facing direction. It is cyan `#7ff6ff` on Kai (2 px, alpha .9)
    and warm orange `#ffa04a` on foes (1.6 px, alpha .8).
- Kai only: the darkest values are lifted with `v + .2 (1 - v)^3`, so black goes to .2 and a .5 mid-tone to .53. At .28 he looked
  milky on the phone, so I set it back to .2.
- The W228 key light (brightness 1.75 / saturate 1.15) is now baked into the cached copy. It used to be a canvas filter on every
  draw, so the outline stays dark and each draw is now a plain blit.
- The owner's art is drawn unchanged under the outline and rim. There is no flat tint over the whole sprite.
- Contact ellipse: it is never narrower than half the body height (`max(cell w x .95, h x .5)`). This did NOT fix the rusher case
  below.

## Minimums (8 moments per device; W228 in brackets)

| Gate | Phone | PC | Pass |
|---|---|---|---|
| Min actor contrast, WCAG mean vs 6 px ring (target >= 3:1) | **1.80** (1.87), median 2.71 (2.91) | **1.10** (1.08), median 2.50 (2.43) | FAIL both |
| Kai only, contrast range | 2.55 - 3.38 | 1.31, then 2.13 - 2.80 | Kai is now the highest-contrast fighter in 6 of 8 PC moments |
| Min shadow darkness (target >= .25) | **0.22** (0.26) | **0.16** (0.19), median .45 | FAIL both |
| Median depth spread (>= .40) | 0.51 | 0.41 | PASS |
| gfirst clear rate, streetsim 20 x 4 (75 +- 8) | 65 (0/45/65/70) | | **FAIL** at 20 runs |
| Same, 40 x 4 | `footmove` off: 0/43/75/70. On (step-in 2.5/s): 0/45/70/65 | | gfirst 70: PASS at 40 runs |

Why the gates still fail:
- **Contrast: the target cannot be reached by brightening.** Against a dark ring (r about .02-.03), a 3:1 mean needs an actor
  mean luminance of about .17-.19. Kai now reaches .14-.22. Foes reach .10-.15, because only Kai gets the lift and the gunners'
  dark coats hold them at .10. The PC minimum is t 20.2: Kai and a rusher in the front lanes over the bright magenta and cyan road
  reflections (ring .076-.087). There, 3:1 would need an actor mean of about .36 or more, which washes the art out. The outline
  pixels count as actor pixels in this probe, so they pull the mean down. The outline helps the edge, which this mean-vs-ring
  metric does not measure.
- **Shadow:** both PC failures (.16, .17) are rushers in `rest`, the recovery right after a lunge. Debug: in the box under the
  drawn feet, L goes .0588 -> .0486, so the contact ellipse is almost absent in that state. The frame shadow is drawn but sheared
  away from the feet. The cause is not found yet. Neither widening the ellipse nor the outline changed it. The phone minimum, .22,
  is Kai at t 70.1. That is probably the outline taking the darkest pixels right under the boots out of the box, because the probe
  masks out actor pixels.
- **Balance:** step-in speeds of 1.5 / 2.0 / 2.5 / 3.5 per second gave gfirst 75 / 55 / 65 / 85 at 20 runs. That is not
  monotonic, so seed noise (about +-10) dominates. At 40 runs, 2.5/s is the closest to `footmove` off on every bot: 45/70/65
  against 43/75/70. 1.5/s gives gfirst 75 but nearest 65 (+22, the casual player far too strong). So I left the step-in at 2.5/s
  and changed no code for it. Per WORKER-RULES 16e, I stopped tuning here.

## Critic rows (my scoring of these two frames; SHIP needs every row >= 7)
| # | Test | Phone | PC | Note |
|---|---|---|---|---|
| 1 | Owner-art | 6 | 5 | Unchanged by this task. PC: the large hex bomb pickup icon mid-field, and the bright smoke fx. |
| 2 | Grayscale | 6 | 6 | Kai reads clearly. Foes in dark coats still sit near the shop-front value. |
| 3 | Silhouette | 7 | 7 | The outline separates overlapping bodies. The rim marks the head and shoulders. |
| 4 | Find the player | 7 | 7 | The cyan rim plus the lift make Kai the clearest figure. |
| 5 | Bullets | 5 | 5 | Not touched. |
| 6 | Clutter | 6 | 5 | The pickup icon. |
| 7 | Benchmark side by side | 5 | 6 | The front road is still sparse. |
| 8 | STICKER | 6 | 6 | The outline is the same weight on every actor, so the actors no longer look like mismatched cut-outs. Shadows are uneven (rushers in rest). |
| 9 | ENEMY VISIBILITY | 6 | 6 | The orange foe rim is faint at play size. The gunner's contrast is 1.8-2.2. |

Verdict: the rows are below 7 and the contrast and shadow gates fail, so `footmove` stays OFF. An independent critic still has to
score these frames.

Next steps:
1. The rusher `rest` contact shadow. Trace FA.shadow in that state: streetcircle `wait` plus the purefoot `turn` scale.
2. Foe readability needs a value change the owner allows on foes as well. Either a foe lift like Kai's (about .12), or lighter coat
   art from the owner. Brightening further washes the art out.
3. The front-lane road reflections behind the actors: a darker local floor under the lanes (W228 next step).
4. Run the balance gate at 40 x 4. 20 runs cannot resolve +-8.
