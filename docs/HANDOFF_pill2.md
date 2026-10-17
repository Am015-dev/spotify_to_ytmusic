# HANDOFF pill2 (2026-10-17)
- Shipped only the CR_hud change from the pill1 WIP (src/93_cars_lego.js): the top pill no longer copies the marker name/distance while #roamPrompt is visible. HUDSTACK_go test changes NOT brought; hudstack1/stack unchanged.
- Gate on the built page: unit 0 FAIL; rv2k2/hudctl, rv2k/card, hudstack1 each 1/1 alone; life1,xf1,terrain 37/42 (fails: xf1/grass tyre gap, life1/ath-density known; xf1/water, land, slope SLOW-time only, parallel software GL).
- Shot docs/shots/pill2.png (852x393, Frankfurt start, prompt shown): pill shows only "STORY · Hot D…", no marker name. The pill text is truncated by the prompt width: cosmetic, not addressed.
- Known separate issue: hudstack1/stack combined-run flake (pill1 saw "cards shown:" empty in 3-tag runs); not investigated here.
