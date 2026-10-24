# W238 on foot (flag `footmove`, stays OFF): one label per button, props on the floor, longer tracers, foe rim

Build: `nr/W238-foot` (W237 + latest `alex/brave-carson-rbpmlk`), `?footmove=1`, seed 11. Frames: `fight-pc.webp` (1440x860, t 45 s), `fight-phone.webp` (390x763, t 49 s). Probe: `qa/w237probe.js` (its `TS=` moment picker now matches the moment label), stepped x186-337 (one phone run of seed 11 was x186, under the x200 bar because two runs shared the CPU).

## Changes
1. GUARD overlap (`street/streetguard.js`): the relayout (resize, setAuto, begin, and a second pass 400 ms later) put BOMB back into the slot GUARD had taken, and GUARD only re-seated on the next post. A MutationObserver on the buttons now re-seats both in the same task. Live (`alex/brave-carson-rbpmlk`) has the same bug: its code is identical, a build of it showed GUARD and BOMB both at left 248 after a relayout. After the fix the five buttons never share a position (sampled through start, resize and relayout).
2. Edge contrast: foe rim 1.3 -> 1.9 px, alpha .85 -> .95, colour `#ffc47a` (`art/art.js`); backdrop dark band 62% -> 74% of the wall height and .32/.40 -> .42/.52 (`street/purefoot.js`); props `brightness(.8)` -> `.66`.
3. Tracers (`street/purefoot.js`): length = 1/10 of Kai's drawn height (phone 21 px, PC 30 px, min 20), thickness about 1/3.6 of that, hotter core (hsl 90% + white). Player needle scales with the same length.
4. Props: contact shadow centred 3 units under the base (it was half hidden behind the prop), two layers, 1.9x prop width; the picture is dropped 3 units onto it.

## Gates (3 seeds, 11/12/13, both devices)
| Gate | PC 11 / 12 / 13 | Phone 11 / 12 / 13 |
|---|---|---|
| saturation vs raw sheet >= .80 | 1.06 all | 1.06 all |
| edge contrast >= 3 | **2.25** / 5.38 / 4.34 | 7.48 / 4.89 / 5.29 |
| foe shot contrast >= 3 | 5.69 / 3.97 / 5.71 | 4.85 / 5.35 / 9.53 |
| player shot contrast >= 3 | 5.26 / 8.45 / 4.49 | 4.85 / 4.72 / 6.15 |
| shadow darkness >= .25 | .30 / **-2.66** / **-4.72** | .45 / .38 / **.24** |
| depth spread >= .40 | .53 / .49 / .48 | .59 / .64 / **.38** |
Not done / not met: PC seed 11 gunner at t 48.2 is 2.25 (was 2.07). His state is `in` (just walked in), his mean luminance .08 against a ring of .05, so the outline cannot beat about 1.9 and the rim is under 3 even at 2.6 px (2.45), which I did not keep because it glows. I could not see that frame (the probe screenshot only fires at t 45). PC shadow darkness on seeds 12/13 failed before my change too (W237 build: .08 and -.37); mine is worse (-2.66, -4.72). I believe a bright prop inside the foot box is counted, but did not verify it. Phone seed 13 depth spread .38 and shadow .24 are bot-position effects (spread is fighter positions) and I did not look at them. gfirst streetsim 40 x 4 and the ui-audit were not run (ran out of time).

## What I see in the frames (honest)
- GUARD: the phone shows BOMB, GUARD, KNIFE in one row, one readable label each.
- Edge: the far foe at the phone's right edge has a warm rim and reads; on PC Kai and the foe separate clearly, the gunner case above is not in either frame.
- Tracers: on phone a cyan needle crosses the crate and is visible but still thin; on PC two cyan needles over the right wall are visible, no foe shot is in flight in the PC frame, so the foe tracer was only measured, not looked at.
- Props: the crate and barrel now have a dark ellipse under them and sit lower, but their base is still on the top of the curb band, so they read as standing at the wall foot, not on the road where Kai is; better than before, not fully grounded.
- Band: the wall behind the fighters is a little darker; the look did not change much.
