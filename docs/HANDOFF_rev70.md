# rev-70 handoff: v90m-beta.70 = GO
- Built out/v90m-beta.70 (split, page 3.44 MB, xc/ 4 files, ALL_OPEN=true, "by Alex" credits present); OD_CHANGELOG entry prepended (src/10_core2.js).
- Unit: 0 FAIL besides known logic_core 'TUNE is not defined'. TAG=life1,xf1,terrain,env1,tr1,life3 on the BUILT page: 46/49, 0 console errors; only fails xf1/grass, xf1/land, life1/ath-density (known, timing-only).
- Shots (852x393, built page) in docs/shots/rev70: fra_a_street_trees, ath_b_park_trees, fra_c_lanes (cars in several lanes, junction behind, peds on pavement), fra_d_junction (?l3lt=1), ath_e_peds. No floating/sunk trees, no cars inside each other, no black frames.
- Caveats: ath_e_peds frame has no peds in view (GO says 1 of 2250 ped samples on a road lane outside crossings); peds-on-pavement evidence is the Frankfurt frames. Stop-line guard (?l3lt=1) is still WIP/off by default (queue overlaps 7-9).
- Not deployed. Helper: tools/tRev70Shots.js.
