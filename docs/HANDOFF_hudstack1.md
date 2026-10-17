# HANDOFF hudstack1 (2026-10-17)
- One left HUD stack: `HUDSTACK_layout()` in src/99ui_hud.js (runs in the 150 ms HUD governor) places roamPrompt > roamPop > crSmHint in the column right of the minimap, below the top pill, 6 px gap, max 2, hint hidden while a prompt shows; CRSM_hint no longer positions the hint in roam. Objective card text now 12 px.
- GO `hudstack1/stack` (src/99c_checklist.js, body in HUDSTACK_go): 0 px² overlap with each other, minimap, controls; text ≥ 12 px. Run it in both orientations (the GO reports the current one).
- Measured (tools/tHudStack.js): before landscape 2337 px² overlap, after 0 in 852×393 and 393×852. Shots: docs/shots/hudstack1/{before,after}_{land,port}.png.
- Green: unit 0 FAIL, hudstack1/stack + rv2k2/hudctl + rv2k/card pass on the built page. xf1/grass and life1/ath-density fail identically on the unmodified build (not from this change).
- Left: top STORY pill still repeats the marker name while the prompt shows; the hint sits in the stack in roam, not above the arrows.
