# cl-L3-studs handoff
- New src/99cl_studs.js (flag ?cl=studs / ?cl=all, default OFF, Frankfurt): 6 m centre-line stud trail on the core streets inside CL.box (879 studs, 4 big at plazas), streetMul forced to 1, HUD #roamStuds shown again (v85 hid it) top-right and counting studs EARNED (TEST_MODE pins stored total at 999999).
- GO why/studs lives in the module: one pass collects 638 (>=120), gap 8 m, pickup pays full after worst-case decay, counter 14 px. Shot: docs/shots/cl-L3/studs-berliner.png.
- Neue Mainzer + Gutleut are outside the box in game coords (plan table used mirrored data x): 7 of 9 streets have trails.
- Gate (flag OFF, built page): life1,xf1,terrain,why fra 34/35 (why/drive-start hint-pill 0x0, flag-off, not in known reds), ath 24/24.
- Left: trail studs read thin head-on (disc edge-on); consider tilting/bigger scale; plaza stud count only 4.

## Fix round (review #24)
- Trail studs now 2.0 m coins, raised to 2.4 m, bob + spin about Y + gold glint pulse, offset 0.25 x road width (lane middle). why/studs adds a screen-space check (>= 5 studs 35-65 m ahead, each >= 6 px). Shot: docs/shots/cl-L3/studs-spawn-v2.png.
- Head-on the receding coins still merge into an orange line (perspective); no 2K reference image was available for a side-by-side.
