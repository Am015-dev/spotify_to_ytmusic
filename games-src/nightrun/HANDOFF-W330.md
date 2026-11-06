# HANDOFF W330: the backdrop recedes (branch nr/W330-backdrop, not deployed)

Owner ask (6 Nov 2026): "the background is very distracting making all assets look like shit". ONE deliverable: the painted city recedes,
the actors own the picture. Render-time only, owner files only, no asset added, changed or deleted.

## What changed, per layer (one owner: render/pure.js `PURL.GR` + `PURL.dim` grade every backdrop picture; `PURL.veil` the haze)
- `PURL.dim(pic, depth)`: each backdrop picture is graded ONCE per depth into a cached canvas (contrast, then value, then saturation, a small
  blur, then a cool dark haze mixed in, source-atop). No per-frame filter. Table `PURL.GR` [value, saturation, contrast, blur px, haze]:
  flight PC sky .48/.45/.85/1.2/.22, far skyline .52/.5/.86/.8/.18, mid rooftops .58/.56/.88/.4/.12, near strip .82/.75/.95/0/.04
  (it used to keep full value), phone painting .5/.48/.85/.8/.16 (it was .55 value, .85 saturation, sharp).
  Because the sky and lightning are painted into these pictures, the lightning and painted rain fall with them (about 1/2 to 1/3 of their old value).
- `PURL.veil(w,h,horizon)`: a screen-size canvas built once per size: a dark blue-violet haze band strongest at the horizon (.22 alpha at 70%
  down on PC, 60% on phone), plus a soft edge vignette (.15 at the corners). It is drawn right after the backdrop, so it sits under the actors and the HUD.
- Street: `slScaled` (street/streetlook.js, the per-resize cached copy of each painted layer) now takes `PURL.dim(pic,'st-'+layer)`:
  sky/moon/clouds .62 value .5 sat, far .66/.55, mid (the wall behind the walkway) .76/.65, near .92/.85, floor .95/.9. The old W228 per-frame
  grade in purefoot.js is unchanged (it still lies on top). Kai, the foes, shots and the W329 rain over them are untouched.
- The play layer is as W329 left it: no change to ships, foes, shots, rain over the actors, PK 2.1.

## Numbers (same seed and steps; /tmp/w330/measure.py and mstreet.py; actor = the player ship pixels / a box around Kai; backdrop = a band above the play line)
| frame | actor/backdrop luminance before -> after (x) | HSV saturation ratio (x) | chroma (max-min) ratio (x) | backdrop std of luminance |
|---|---|---|---|---|
| flight phone | 2.94 -> 3.74 (1.27x) | 1.03 -> 1.47 (1.43x) | 3.05 -> 5.90 (1.93x) | .071 -> .056 (-21%) |
| flight PC | 3.98 -> 4.95 (1.24x) | 0.94 -> 1.35 (1.43x) | 3.17 -> 7.14 (2.25x) | .056 -> .028 (-50%) |
| boss phone | 4.24 -> 4.75 (1.12x) | 0.97 -> 1.27 (1.32x) | 3.65 -> 5.90 (1.62x) | .063 -> .033 (-47%) |
| boss PC | 4.22 -> 5.02 (1.19x) | 0.91 -> 1.36 (1.50x) | 3.13 -> 7.26 (2.32x) | .051 -> .038 (-26%) |
| street phone | 0.59 -> 1.02 (1.72x) | 0.74 -> 1.24 (1.66x) | 0.50 -> 1.48 (2.96x) | .255 -> .106 (-58%) |
| street PC | 0.96 -> 1.34 (1.40x) | 0.60 -> 1.03 (1.71x) | 0.45 -> 1.31 (2.87x) | .160 -> .070 (-57%) |
Detail contrast (std of luminance minus a 9 px blur) of the backdrop fell 44-66% in every frame.
GATE MISSED, on purpose: the flight luminance ratio rises only 1.12-1.27x (asked: 1.5x), HSV saturation 1.32-1.50x. A darker grade
(value .3-.4, saturation .3) did pass 1.5x on luminance and saturation, but the city went to grey-black mud and the owner's painting was
lost (sheets in /tmp/w330 were looked at); the owner said the assets are very good, so I kept the readable version. The flight backdrop band
is already very dark (mean luminance .10 before), so the luminance ratio moves slowly; HSV saturation is unstable on near-black pixels,
chroma (max-min) is the more honest measure and rises 1.6-2.3x. Phone backdrop std fell only 21% in the flight frame (the bright tower windows stay).
Phone fps (benchmark/playability-probe.js flight phone 30, 3 runs each, same machine): base 13.3/14.0/15.8 (median 14.0), this build
12.1/14.2/13.4 (median 13.4, -4.3%, inside 5%). The only per-frame cost added is one screen-size blit (the veil).

## Sheets (not committed): /tmp/w330/sheet-flight-phone.png, sheet-flight-pc.png, sheet-boss-phone.png, sheet-boss-pc.png, sheet-street-390x763.png, sheet-street-1440x860.png (before | after)
Flight: the city drops about one stop and goes grey-violet and soft; ship, foes, cyan tracers and pink enemy shots now lead. Street: sky,
moon, clouds and skyline recede; the wall and walkway barely change; Kai and the foes read first. Boss frames: the boss was not on screen
at the shot moment in either build (the sim diverges between builds, known).

## Gates (this build)
flow-test 91/0 · gauntlet-shell 0 failed · claims-check PASS all · bossbar-layout 0 failed · hud-cover PASS · streetdraw 3 PASS ·
footvis 0 failed (after `git fetch --deepen=2000`) · gauntlet-flight phone shooter SEEDS=2 WALL=420 JUMP=1: boss killed 2/2, 0 errors · guard ok.

## Critic (own pass, anchored at the owner's level, rule 10; 0-10 like W329)
flight look 4 -> 5: the backdrop no longer fights the ship; the actors are the brightest, most saturated, sharpest things. Still weak:
the PC sky is now a flat dull grey-violet (the painting's colour mood is mostly gone up there), and the W329 rain overlay is now the
most visible texture in the sky; the shots are still plain shapes.
street look 3 -> 4: the sky/skyline recede and the fighters read first. Still weak: the cyan vending machine prop (ART.footProps, play
depth) is the brightest, most saturated thing on the left of the PC frame and still steals the eye; the actors are still flat-lit.

## Next (in order)
1. Owner look at the sheets: is the PC sky too dull? If so raise `PURL.GR.sky` saturation to .55 (one number).
2. Street props at play depth (vending machine): a value step down in ART.footProps for the brightest props.
3. The W329 rain overlay (`PURL.air`): its alpha could drop ~30% now that the sky is dark.
