# W250: phone backdrop parallax (branch nr/W250-parallax, not deployed)
Change (parts/render/pure.js only): PURL.bg phone branch now draws 3 planes in portrait space instead of one still picture:
far sky `pan()` ratio .1 (picture cropped once at 1.35x height, a 1:1 window slides, no flip), mid rooftops `vtile()` ratio .3 (zoom 1, alpha .38),
near rooftops ratio .6 (zoom 1.3, alpha .7). Rooftop strip ly-phone is back (device-size cache of [picture; mirror], only the two side bands are
copied, the empty street gap is measured once). Cached, whole-pixel 1:1 copies keep the W241 performance idea; haze veil (rgba 12,8,24,.22) kept on the sky.
Measure (390x763 @2x, backdrop only, no actors, G.scroll set to t=14 s / 98 s / 53 s values at 112.7 units/s):
 pixels changed (max channel diff > 12): phone before 0.2 %, after 47.7 % (t14->t98), 54.1 % (t14->t53); PC unchanged 63.1 %.
fps (4x CPU throttle, software GL, dpr cap, 3 runs of 4 s, alternating old/new): old ~9-11, new ~8-9; about 10-15 % lower, noisy; the gate is borderline.
Not done / still static: no foreground streaks at 1.0 (no art for them; code-drawn streaks break WORKER-RULES 17f0); the sky is a pan (back and forth), not an endless scroll;
the rooftop strips are a top-down view over a street-level painting, so they still read as a different viewpoint; ships/bullets are untouched.
Next: if the fps gate matters, drop the mid layer or draw it every 2nd frame; owner should look at the phone shot.
