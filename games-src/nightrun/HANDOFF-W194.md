# HANDOFF W194: street actors blend into the street (RET.blend, OFF by default, ?blend=1)

Owner, 24 Oct 2026: "the figures do not blend well inside" (the street scene).

## Diagnosis (1440x860 and 390x763, Kai + 3 foes, beta.186)
- Colour temperature: the foe sheets are warm olive (mean blue ~80) on a violet street (mean blue ~105). Kai's dark jacket sits closer (distance ~10-20).
- Value: about the same as the floor; the difference is hue/saturation, not brightness.
- Shadow: the belt already draws a flat dark ellipse (streetlook slSh); nothing soft at the feet, no reflection on the wet road.
- Neon: no light from the lamps or signs on the bodies; the rain is painted behind them only.
- Probe baseline: mean colour distance actor vs. street around it is 14-21 on PC and 25 on phone.

## What parts/street/streetblend.js does (only when RET.blend)
- Wraps `FOOT._in.drawWho`: each body is drawn into one reused scratch canvas (id footC, so art.js picks the on-foot sprite copy), graded, and put back.
- Grade: a per-body gain (multiply, keeps the dark outlines dark) and lift (lighter) with the alpha restored from a mask copy. The gain is a slow
  controller: after each frame (wrap of `F.look.draw`) ONE body is read back (three 8x8 patches of the finished frame: street left, street right, body)
  and its gain steps up to 8% toward 75% of the way to the street colour (Kai 55%), clamped 0.7-1.15.
- Rim light: the brightest neon column of the near backdrop picture within reach (palette read once, 160 columns) colours a side gradient on the body.
- Wet road: legs mirrored under the feet, squashed to 55%, 3 bands at alpha .20/.11/.04; soft radial contact shadow; 5 rain streaks over each body.
- Skipped: hit flash (stays white), flamer spraying, nested drawWho calls (street foes drawing another sheet).

## Results (qa/streetblend-probe.js, 600 warm-up steps)
- PC: 17.8 -> 6.4 PASS, 14.0 -> 7.6 (-46%), 15.9 -> 10.1 (-36%), 17.7 -> 7.4 PASS. Phone: 25.2 -> 12.8 (-49%). Halving is met about 1 run in 2, so it stays OFF.
- Frame time (sim+draw, 600 steps, headless software canvas, very noisy): blend off 62.0 and 58.5 ms, blend on 46.5 ms. No slowdown seen; re-measure on a GPU browser.
- Look: foes take the violet cast and keep crisp outlines; the reflection and contact shadow read well. Problems: Kai gets a red-maroon cast
  (pink rim + gain), and a foe further back can get a pale bluish lift (gain > 1) that reads as ghostly.

## Next steps
1. Kai: lower B.rim for Kai, or rim colour from cyan/violet only; cap Kai's gain at 1.0 (no lift).
2. Make the controller converge faster and steadier: read 2 bodies per frame, use the median of the side patches, ignore patches that overlap another actor's box.
3. Then re-run the probe 3 times on PC and phone; turn the flag on by default only if all pass.
