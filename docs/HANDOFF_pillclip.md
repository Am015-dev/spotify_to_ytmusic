# HANDOFF pillclip (2026-10-17)
1. Cause: #m1Next>div had `max-width:calc(100% - 36px)` inside the shrink-to-fit pill; the % resolved against the already-sized pill and came out 2 px short of the label (110 vs 112 px), plus the empty .crD still added a 6 px flex gap. The span ellipsised "Hot Drop".
2. Fix (src/93_cars_lego.js): div `flex:0 1 auto` (shrinks by itself, min-width 0) and `.crD:empty{display:none}`. Pill is now 164 px wide in landscape, label 112/112 px, clear of minimap and the right buttons.
3. Gate on the built page: unit 0 FAIL; rv2k2/hudctl and hudstack1 1/1 alone; rv2k/card fails only SLOW (10.5 s, every assert ✅).
4. Shots docs/shots/pillclip/land_before.png, land_after.png (852x393), port_after.png (393x852): looked at; portrait unchanged.
5. Tool: tools/tPillClip.js (tHudStack + pill rect dump).
