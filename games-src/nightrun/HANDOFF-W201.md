# HANDOFF W201 (flight look, flag flylook)

Done: parts/render/flylook.js (ship sheets graded per district, real explosions, engine glow, rail-deck haze, shaded carrier). Gates in qa/flylook-probe.js all pass. Before/after shots are in review-shots/W201/.
Left, in order of how much they would help:
1. Explosion punch: in after-boom-pc the blast is dimmer than the old additive blob. Make the core flash longer (0.12 -> ~0.2 s) and brighter, and add a short screen flash on gunship and boss kills.
2. Depth: the backdrop is as bright and busy as the play layer. Darken and desaturate the painted backdrop about 15% (or blur the mid strip), so the ships pop.
3. Parallax: the far skyline is baked into the sky tile (0.03). Draw ly-far as its own layer at about 0.1 (one extra blit per frame).
4. Gunship grade reads mauve-pink and muddy: lower K.rim or use the district's cyan (D.b) for the top light on the warm sheets.
5. Phone backdrop: the mirrored tiles are unchanged.
